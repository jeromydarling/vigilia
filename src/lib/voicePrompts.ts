/**
 * voicePrompts — Rotating Ignatian-inspired voice prompts for the 30-second ritual.
 *
 * WHAT: ~30 seed prompts across 9 categories that teach staff and volunteers
 *       what to notice and how to tell a unique story each day.
 * WHERE: Used by the VisitRitual component to select today's prompt.
 * WHY: If you give people checkboxes, you get "Peaceful / No concern" every day.
 *       Rotating prompts produce 30 unique stories in 30 days — each one teaching
 *       the observer to see differently. The tool itself is a formation practice.
 *
 * SELECTION LOGIC:
 * - No prompt repeats within 7 days for the same visitor
 * - Category rotation ensures variety
 * - Liturgical season affinity (optional, future)
 * - Resident history awareness (e.g., "loss" prompts after a recent bereavement)
 */

import type { VoicePromptCategory } from '@/types/vigilia';

export interface SeedPrompt {
  id: string;
  category: VoicePromptCategory;
  prompt_text: string;
  best_when: string | null;
}

export const VOICE_PROMPTS: SeedPrompt[] = [
  // ── Surprise ──
  { id: 'surprise-01', category: 'surprise', prompt_text: 'What surprised you about them today?', best_when: null },
  { id: 'surprise-02', category: 'surprise', prompt_text: 'Was there a moment you didn\'t expect?', best_when: null },
  { id: 'surprise-03', category: 'surprise', prompt_text: 'What was different about today compared to your last visit?', best_when: 'Returning visitors' },

  // ── Face ──
  { id: 'face-01', category: 'face', prompt_text: 'What did their face tell you that words didn\'t?', best_when: null },
  { id: 'face-02', category: 'face', prompt_text: 'How did their eyes look when you arrived? When you left?', best_when: null },
  { id: 'face-03', category: 'face', prompt_text: 'Did their expression change during your visit? When?', best_when: null },

  // ── Family ──
  { id: 'family-01', category: 'family', prompt_text: 'What would their family want to know about today?', best_when: null },
  { id: 'family-02', category: 'family', prompt_text: 'Did they mention anyone by name? Who, and how?', best_when: null },
  { id: 'family-03', category: 'family', prompt_text: 'Is there someone they seem to be missing?', best_when: 'When resident seems withdrawn' },
  { id: 'family-04', category: 'family', prompt_text: 'If their grandchild asked "How\'s grandma today?" — what would you say?', best_when: null },

  // ── Spiritual ──
  { id: 'spiritual-01', category: 'spiritual', prompt_text: 'Was there a moment of grace?', best_when: null },
  { id: 'spiritual-02', category: 'spiritual', prompt_text: 'Did faith come up — in words, or in silence?', best_when: null },
  { id: 'spiritual-03', category: 'spiritual', prompt_text: 'What prayer would you offer for them tonight?', best_when: null },
  { id: 'spiritual-04', category: 'spiritual', prompt_text: 'Did they seem to be at peace? What gave you that sense?', best_when: null },

  // ── Memory ──
  { id: 'memory-01', category: 'memory', prompt_text: 'Did they share a memory? What was it about?', best_when: null },
  { id: 'memory-02', category: 'memory', prompt_text: 'What part of their past seemed most alive today?', best_when: null },
  { id: 'memory-03', category: 'memory', prompt_text: 'Is there a story they keep returning to? What does it seem to mean to them?', best_when: 'Returning visitors who notice patterns' },

  // ── Joy ──
  { id: 'joy-01', category: 'joy', prompt_text: 'What made them smile?', best_when: null },
  { id: 'joy-02', category: 'joy', prompt_text: 'Was there laughter? What caused it?', best_when: null },
  { id: 'joy-03', category: 'joy', prompt_text: 'What small thing seemed to bring them the most comfort?', best_when: null },

  // ── Loss ──
  { id: 'loss-01', category: 'loss', prompt_text: 'What grief seemed present today?', best_when: 'After a recent loss or anniversary' },
  { id: 'loss-02', category: 'loss', prompt_text: 'Did they seem to be carrying something heavy? What did you sense?', best_when: null },
  { id: 'loss-03', category: 'loss', prompt_text: 'Was there an absence in the room — someone or something missing?', best_when: null },

  // ── Daily Life ──
  { id: 'daily-01', category: 'daily_life', prompt_text: 'What were they doing when you arrived?', best_when: null },
  { id: 'daily-02', category: 'daily_life', prompt_text: 'What does their room tell you about who they are?', best_when: 'First visits to a new resident' },
  { id: 'daily-03', category: 'daily_life', prompt_text: 'How did they seem compared to the others around them today?', best_when: null },

  // ── Accompaniment ──
  { id: 'accomp-01', category: 'accompaniment', prompt_text: 'What will you remember about this visit?', best_when: null },
  { id: 'accomp-02', category: 'accompaniment', prompt_text: 'If you could only tell one person about this visit, what would you say?', best_when: null },
  { id: 'accomp-03', category: 'accompaniment', prompt_text: 'How did this visit change you — even a little?', best_when: null },
  { id: 'accomp-04', category: 'accompaniment', prompt_text: 'What does this person need that no chart or system can capture?', best_when: null },
];

/**
 * Select today's voice prompt for a given visitor.
 *
 * Rules:
 * 1. No prompt repeats within the last 7 entries for this visitor
 * 2. Rotate across categories for variety
 * 3. Deterministic within a day (same visitor sees same prompt all day)
 */
export function selectVoicePrompt(
  visitorId: string,
  recentPromptIds: string[],
  preferredCategory?: VoicePromptCategory,
): SeedPrompt {
  const recentSet = new Set(recentPromptIds.slice(0, 7));
  let candidates = VOICE_PROMPTS.filter((p) => !recentSet.has(p.id));

  if (preferredCategory) {
    const catCandidates = candidates.filter((p) => p.category === preferredCategory);
    if (catCandidates.length > 0) candidates = catCandidates;
  }

  if (candidates.length === 0) candidates = VOICE_PROMPTS;

  const today = new Date().toISOString().slice(0, 10);
  const seed = hashCode(`${today}-${visitorId}`);
  return candidates[Math.abs(seed) % candidates.length];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
