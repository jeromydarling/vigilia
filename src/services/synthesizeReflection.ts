/**
 * synthesizeReflection -- Transform a completed visit ritual into a family-facing reflection.
 *
 * WHAT: Takes raw visit data (mood, need, concern, voice transcript) and produces
 *       a warm, journal-style reflection suitable for family reading.
 * WHERE: Called after a visit ritual is saved (fire-and-forget from useCreateVisitRitual).
 * WHY: "The family should never see raw taps and fragmented notes. They should receive
 *       a composed, journal-like layer built from many small acts of witness."
 *
 * Pipeline: raw visit -> buildReflectionPrompt() -> LLM -> family_reflections table
 */

import { supabase } from '@/integrations/supabase/client';
import { buildReflectionPrompt, isPrintWorthy } from '@/lib/narrativeSynthesis';
import { validateReflection, buildReviewPrompt } from '@/lib/reflectionValidator';
import { fetchKnowledgeContext } from '@/hooks/useCatholicKnowledge';
import { getCurrentSeason } from '@/lib/liturgicalCalendar';
import type { MoodObserved, NeedObserved, ConcernNoted } from '@/types/vigilia';

export interface SynthesizeReflectionParams {
  tenantId: string;
  residentContactId: string;
  residentName: string;
  visitRitual: {
    mood_observed: MoodObserved;
    need_observed: NeedObserved;
    concern_noted: ConcernNoted;
    voice_prompt_text: string | null;
    visited_at: string;
  };
  voiceTranscript: string | null;
  visitorRole: string;
  /** If provided, the voice_notes row will have its transcript cleared after synthesis */
  voiceNoteId?: string | null;
}

/**
 * Synthesize a family-facing reflection from a completed visit ritual.
 *
 * Returns the reflection text on success, or null if the LLM call fails.
 * Failures are logged but never thrown -- the visit is already saved.
 */
export async function synthesizeReflection(params: SynthesizeReflectionParams): Promise<string | null> {
  const {
    tenantId,
    residentContactId,
    residentName,
    visitRitual,
    voiceTranscript,
    visitorRole,
  } = params;

  try {
    // Fetch relevant CHA/ERD guidance for context
    const concernTags = visitRitual.concern_noted === 'new_grief' ? ['end_of_life', 'bereavement']
      : visitRitual.concern_noted === 'spiritual_request' ? ['sacraments', 'spiritual_preparation']
      : ['spiritual_care'];
    const knowledgeContext = await fetchKnowledgeContext({ tags: concernTags, limit: 2 }).catch(() => '');

    // Build the LLM prompt from the raw visit data + Catholic health context
    let prompt = buildReflectionPrompt({
      residentName,
      mood: visitRitual.mood_observed,
      need: visitRitual.need_observed,
      concern: visitRitual.concern_noted,
      voiceTranscript,
      voicePromptText: visitRitual.voice_prompt_text,
      visitedAt: visitRitual.visited_at,
      visitorRole,
    });

    // Append CHA guidance as context (not instructions — just awareness)
    if (knowledgeContext) {
      prompt += `\n\nCATHOLIC CARE CONTEXT (for your awareness, not to quote directly):\n${knowledgeContext}`;
    }

    // Call the Supabase edge function for LLM text generation
    const { data, error } = await supabase.functions.invoke('generate-text', {
      body: { prompt, max_tokens: 200 },
    });

    if (error) throw error;

    const reflectionText = data?.text ?? data?.generatedText ?? '';

    if (!reflectionText) {
      console.warn('[synthesizeReflection] LLM returned empty text');
      return null;
    }

    // ── Quality validation (Layer 1 + 2: rule-based + consistency) ──
    const validation = validateReflection({
      reflectionText,
      residentName,
      mood: visitRitual.mood_observed,
      need: visitRitual.need_observed,
      concern: visitRitual.concern_noted,
      voiceTranscript,
    });

    // If rule-based checks fail hard, hold the reflection
    if (!validation.pass) {
      console.warn('[synthesizeReflection] Validation HOLD:', validation.holdReason);
      // Save as held — not published, flagged for review
      await supabase.from('family_reflections').insert({
        tenant_id: tenantId,
        resident_contact_id: residentContactId,
        reflection_text: reflectionText,
        reflection_type: 'held',
        season: getCurrentSeason(new Date(visitRitual.visited_at)).season,
        is_print_candidate: false,
        published_at: null,
      });
      return null;
    }

    // ── AI self-review (Layer 3) — second LLM pass ──
    let aiReviewPass = true;
    try {
      const reviewPrompt = buildReviewPrompt(reflectionText, residentName.split(' ')[0]);
      const { data: reviewData } = await supabase.functions.invoke('generate-text', {
        body: { prompt: reviewPrompt, max_tokens: 50 },
      });
      const reviewResponse = (reviewData?.text ?? '').trim();
      if (reviewResponse.startsWith('FLAG')) {
        console.warn('[synthesizeReflection] AI review FLAG:', reviewResponse);
        aiReviewPass = false;
      }
    } catch (reviewErr) {
      // If the review call fails, don't block — proceed with rule-based result
      console.warn('[synthesizeReflection] AI review failed, proceeding with rule-based result:', reviewErr);
    }

    // If AI review flags it, hold instead of publish
    if (!aiReviewPass) {
      await supabase.from('family_reflections').insert({
        tenant_id: tenantId,
        resident_contact_id: residentContactId,
        reflection_text: reflectionText,
        reflection_type: 'held',
        season: getCurrentSeason(new Date(visitRitual.visited_at)).season,
        is_print_candidate: false,
        published_at: null,
      });
      return null;
    }

    // ── Passed all checks — publish ──
    const seasonInfo = getCurrentSeason(new Date(visitRitual.visited_at));
    const printCandidate = isPrintWorthy(reflectionText) && validation.score >= 80;

    const { error: insertError } = await supabase.from('family_reflections').insert({
      tenant_id: tenantId,
      resident_contact_id: residentContactId,
      reflection_text: reflectionText,
      reflection_type: 'immediate',
      season: seasonInfo.season,
      is_print_candidate: printCandidate,
      published_at: new Date().toISOString(),
      validation_score: validation.score,
    });

    if (insertError) {
      console.error('[synthesizeReflection] Failed to save reflection:', insertError);
      return null;
    }

    // Clean up: delete the voice transcript now that the reflection is composed.
    // The AI narrative is what persists — raw transcripts may contain PHI
    // (medication mentions, diagnoses, clinical details) and should not be retained.
    if (params.voiceNoteId) {
      await supabase
        .from('voice_notes')
        .update({ transcript: null, transcript_status: 'purged' })
        .eq('id', params.voiceNoteId)
        .then(({ error: purgeErr }) => {
          if (purgeErr) {
            console.warn('[synthesizeReflection] Failed to purge transcript:', purgeErr);
          } else {
            console.info('[synthesizeReflection] Transcript purged after synthesis');
          }
        });
    }

    return reflectionText;
  } catch (err) {
    // Never crash -- the visit is already saved. Log and move on.
    console.error('[synthesizeReflection] Synthesis failed:', err);
    return null;
  }
}
