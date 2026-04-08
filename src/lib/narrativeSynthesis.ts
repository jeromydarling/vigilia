/**
 * narrativeSynthesis — Prompt templates for transforming raw visits into family reflections.
 *
 * WHAT: Provides the editorial framework for AI-powered narrative synthesis.
 *       Lovable AI (Gemini Flash) executes the actual LLM calls using these templates.
 * WHERE: Used by the synthesize-family-reflection edge function.
 * WHY: "The family should never see raw taps and fragmented notes. They should receive
 *       a composed, journal-like layer built from many small acts of witness."
 *
 * The three-layer narrative architecture:
 *   1. Raw capture → taps + voice note (30 seconds)
 *   2. Family-facing reflection → AI-synthesized 40-120 word entry
 *   3. Seasonal print edition → curated chronological set → PDF → Lulu → ship
 */

import type { MoodObserved, NeedObserved, ConcernNoted } from '@/types/vigilia';

export interface RawVisitInput {
  residentName: string;
  mood: MoodObserved;
  need: NeedObserved;
  concern: ConcernNoted;
  voiceTranscript: string | null;
  voicePromptText: string | null;
  visitedAt: string;
  visitorRole: string; // 'chaplain' | 'nurse' | 'volunteer' | 'family'
}

export interface SynthesisOutput {
  reflectionText: string;
  reflectionType: 'immediate' | 'daily' | 'weekly';
  isPrintCandidate: boolean;
}

/**
 * Build the prompt for synthesizing a single visit into a family-facing reflection.
 * This prompt is sent to the LLM (Gemini Flash via Lovable AI).
 */
export function buildReflectionPrompt(input: RawVisitInput): string {
  const moodLabel = input.mood.replace(/_/g, ' ');
  const needLabel = input.need.replace(/_/g, ' ');
  const concernLabel = input.concern.replace(/_/g, ' ');

  return `You are composing a single entry for a family bedside journal — a small book that will be printed, held, and kept. The family of an elderly person in Catholic care will read this entry, perhaps many times, perhaps years from now. It may be read at a funeral.

YOUR VOICE: Write in the tradition of St. Augustine's Confessions — intimate, addressed to someone who loves this person, rendering small moments with spiritual weight. Honest about weariness and grief without despair. Concrete and bodily, never abstract. Grateful without sentimentality. Memory and the present braided together, as if the moment is still alive.

RESIDENT: ${input.residentName}
VISIT DATE: ${new Date(input.visitedAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
OBSERVED SPIRIT: ${moodLabel}
PRIMARY NEED: ${needLabel}
NOTABLE: ${concernLabel}
${input.voiceTranscript ? `WHAT THE VISITOR NOTICED: "${input.voiceTranscript}"` : ''}
${input.voicePromptText ? `THEY WERE ASKED: "${input.voicePromptText}"` : ''}

RULES:
- 40-90 words. Every word must earn its place.
- Use the resident's first name naturally, as a person who knows them would.
- One concrete moment, not a summary. A hand held. A hymn hummed. A name spoken.
- No clinical language (patient, vitals, chart, assessment, intervention).
- No technology language (app, system, dashboard, tap, prompt, voice note, algorithm).
- No meta-language about the reflection itself (here is, the following, this entry).
- No speculation or invention. Only what was observed. If unsure, stay silent.
- Honest about hard days — fatigue, confusion, grief — without dramatizing.
- If there was grace, let it appear naturally. Do not force it.
- Write as if handing a small, true thing to someone who is far away and worried.

Write only the reflection text. Nothing else.`;
}

/**
 * Build the prompt for composing a weekly chapter from multiple daily reflections.
 */
export function buildWeeklyChapterPrompt(
  residentName: string,
  weekReflections: string[],
  seasonLabel: string,
): string {
  return `You are composing a weekly chapter for a printed family journal — a small book about ${residentName}'s days during ${seasonLabel}. This chapter will be bound and kept.

Below are individual reflections from this week. Weave them into a single flowing paragraph (80-150 words) that captures the week's arc — what shifted, what held steady, who was present, where grace appeared or where it was hard to find.

YOUR VOICE: Augustinian. Intimate. Addressed to people who love ${residentName.split(' ')[0]} and cannot be there. Small moments rendered with weight. Honest about hard days. Grateful without performance. The week as a living chapter, not a clinical summary.

THIS WEEK'S REFLECTIONS:
${weekReflections.map((r, i) => `${i + 1}. ${r}`).join('\n')}

RULES:
- One flowing paragraph. Not a list. Not a summary.
- Preserve named people, specific moments, emotional and spiritual texture.
- Note patterns honestly: "This week carried both tenderness and fatigue..."
- No clinical language, no technology references, no jargon.
- Do not invent details not present in the reflections.
- Write as if this page will be read aloud at a family gathering years from now.
- 80-150 words.

Write only the chapter text, nothing else.`;
}

/**
 * Determine if a reflection is worthy of the printed journal.
 * "The ritual captures abundantly. The journal preserves selectively."
 */
export function isPrintWorthy(reflection: string): boolean {
  // Basic heuristic: reflections that are too short or too generic aren't print-worthy
  const wordCount = reflection.split(/\s+/).length;
  if (wordCount < 25) return false;

  // Check for concrete details (names, specific moments)
  const hasConcreteDetail = /\b(she|he|her|his|name|smiled|prayer|hand|music|quiet|gentle|warmth|peace)\b/i.test(reflection);
  return hasConcreteDetail;
}

/**
 * Select the strongest reflections for a seasonal journal.
 * "50 raw visit notes → 18-28 family-facing reflections → 1 printed booklet"
 */
export function selectPrintReflections(
  reflections: { text: string; date: string; isPrintCandidate: boolean }[],
  targetCount: number = 22,
): { text: string; date: string }[] {
  // Start with print candidates, sorted by date
  const candidates = reflections
    .filter(r => r.isPrintCandidate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (candidates.length <= targetCount) {
    return candidates.map(r => ({ text: r.text, date: r.date }));
  }

  // If too many, distribute evenly across the season
  const step = candidates.length / targetCount;
  const selected: { text: string; date: string }[] = [];
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.min(Math.floor(i * step), candidates.length - 1);
    selected.push({ text: candidates[idx].text, date: candidates[idx].date });
  }

  return selected;
}
