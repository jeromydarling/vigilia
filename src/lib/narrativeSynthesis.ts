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

  return `You are writing a single entry for a family bedside journal about their elderly loved one in Catholic care. Write a brief, warm, honest reflection (40-90 words) that a family member would want to read and reread.

RESIDENT: ${input.residentName}
VISIT DATE: ${new Date(input.visitedAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
OBSERVED MOOD: ${moodLabel}
PRIMARY NEED: ${needLabel}
NOTABLE: ${concernLabel}
${input.voiceTranscript ? `VISITOR'S VOICE NOTE: "${input.voiceTranscript}"` : ''}
${input.voicePromptText ? `PROMPT ANSWERED: "${input.voicePromptText}"` : ''}

RULES:
- Write as if this entry will appear in a small printed prayer book
- Use the resident's first name naturally
- Capture one concrete moment, not a summary
- No bullet points, no metadata labels, no clinical jargon
- No mention of "taps," "prompts," "systems," or "apps"
- Prefer gentle, honest language — as if a chaplain were writing in a notebook
- Include the emotional and spiritual texture, not just facts
- If there was a joyful moment, let it shine; if there was grief, honor it gently
- Each entry should feel worth rereading months later

Write only the reflection text, nothing else.`;
}

/**
 * Build the prompt for composing a weekly chapter from multiple daily reflections.
 */
export function buildWeeklyChapterPrompt(
  residentName: string,
  weekReflections: string[],
  seasonLabel: string,
): string {
  return `You are composing a weekly chapter for a family bedside journal about their elderly loved one, ${residentName}, during ${seasonLabel}.

Below are the individual reflections from this week. Weave them into a single, flowing narrative paragraph (80-150 words) that captures the arc of the week — its emotional tone, recurring themes, moments of grace, and any shifts in spirit.

THIS WEEK'S REFLECTIONS:
${weekReflections.map((r, i) => `${i + 1}. ${r}`).join('\n')}

RULES:
- Write as a single flowing paragraph, not a list
- The chapter should read like a page from a family devotional
- Preserve named people, specific moments, and emotional texture
- Note any patterns: "This week carried both tenderness and fatigue..."
- No clinical language, no jargon, no system references
- Should feel worth binding into a seasonal printed journal
- 80-150 words

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
