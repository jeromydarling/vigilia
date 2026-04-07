/**
 * synthesizeWeeklyChapter -- Compose a weekly chapter from individual daily reflections.
 *
 * WHAT: Fetches a resident's reflections for a given week, weaves them into a single
 *       flowing narrative paragraph, and saves it to the weekly_chapters table.
 * WHERE: Called by the weekly synthesis mutation (manually or via scheduled job).
 * WHY: "Each week should read like a page from a family devotional -- not a list of
 *       clinical entries, but a composed arc of attention."
 *
 * Pipeline: family_reflections (week) -> buildWeeklyChapterPrompt() -> LLM -> weekly_chapters table
 */

import { supabase } from '@/integrations/supabase/client';
import { buildWeeklyChapterPrompt } from '@/lib/narrativeSynthesis';
import { getSeasonLabel } from '@/lib/liturgicalCalendar';

export interface SynthesizeWeeklyChapterParams {
  tenantId: string;
  residentContactId: string;
  residentName: string;
  /** ISO date string for the Monday that starts the week (YYYY-MM-DD) */
  weekStart: string;
}

/**
 * Synthesize a weekly chapter from individual reflections.
 *
 * Returns the chapter text on success, or null if there are no reflections
 * or the LLM call fails. Failures are logged but never thrown.
 */
export async function synthesizeWeeklyChapter(params: SynthesizeWeeklyChapterParams): Promise<string | null> {
  const { tenantId, residentContactId, residentName, weekStart } = params;

  try {
    // Compute the week boundary: weekStart (Monday) through weekStart + 6 days (Sunday)
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const weekEndISO = end.toISOString();
    const weekStartISO = start.toISOString();

    // Fetch this week's reflections for the resident
    const { data: reflections, error: fetchError } = await supabase
      .from('family_reflections')
      .select('reflection_text, published_at')
      .eq('tenant_id', tenantId)
      .eq('resident_contact_id', residentContactId)
      .gte('published_at', weekStartISO)
      .lte('published_at', weekEndISO)
      .order('published_at', { ascending: true });

    if (fetchError) {
      console.error('[synthesizeWeeklyChapter] Failed to fetch reflections:', fetchError);
      return null;
    }

    if (!reflections || reflections.length === 0) {
      console.warn('[synthesizeWeeklyChapter] No reflections found for week:', weekStart);
      return null;
    }

    // Extract reflection texts for the prompt
    const reflectionTexts = reflections.map((r) => r.reflection_text).filter(Boolean) as string[];

    if (reflectionTexts.length === 0) {
      console.warn('[synthesizeWeeklyChapter] All reflections had empty text');
      return null;
    }

    // Get the liturgical season label for context
    const seasonLabel = getSeasonLabel(start);

    // Build the LLM prompt
    const prompt = buildWeeklyChapterPrompt(residentName, reflectionTexts, seasonLabel);

    // Call the Supabase edge function for LLM text generation
    const { data, error } = await supabase.functions.invoke('generate-text', {
      body: { prompt, max_tokens: 200 },
    });

    if (error) throw error;

    const chapterText = data?.text ?? data?.generatedText ?? '';

    if (!chapterText) {
      console.warn('[synthesizeWeeklyChapter] LLM returned empty text');
      return null;
    }

    // Write the chapter to the weekly_chapters table
    const { error: insertError } = await supabase.from('weekly_chapters').insert({
      tenant_id: tenantId,
      resident_contact_id: residentContactId,
      week_start: weekStart,
      chapter_text: chapterText,
      reflection_count: reflectionTexts.length,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('[synthesizeWeeklyChapter] Failed to save chapter:', insertError);
      return null;
    }

    return chapterText;
  } catch (err) {
    // Never crash. Log and move on.
    console.error('[synthesizeWeeklyChapter] Synthesis failed:', err);
    return null;
  }
}
