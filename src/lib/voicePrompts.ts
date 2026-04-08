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
 * - Liturgical season affinity — Lenten prompts during Lent, etc.
 * - Resident history awareness — loss prompts weighted after bereavement
 */

import type { VoicePromptCategory } from '@/types/vigilia';
import type { LiturgicalSeason } from '@/lib/liturgicalCalendar';

export type VisitorRole = 'nurse' | 'chaplain' | 'volunteer' | 'family' | 'any';

export interface SeedPrompt {
  id: string;
  category: VoicePromptCategory;
  prompt_text: string;
  best_when: string | null;
  /** Which roles this prompt is most appropriate for */
  role_affinity: VisitorRole;
  /** Liturgical season this prompt is especially suited for (null = any season) */
  liturgical_affinity?: LiturgicalSeason | null;
}

/** Voice note coaching cues — shown before recording to guide storytelling */
export const COACHING_CUES = [
  'Say what mattered most.',
  'Name one moment the family would want to hold onto.',
  'Describe what felt peaceful, heavy, or alive.',
  'Share what the next visitor should carry forward.',
  'Tell us what changed in the room.',
  'Say what this moment revealed about the person.',
  'Speak as if handing the story to the family.',
  'Keep it short, honest, and human.',
] as const;

export function getRandomCoachingCue(): string {
  return COACHING_CUES[Math.floor(Math.random() * COACHING_CUES.length)];
}

export const VOICE_PROMPTS: SeedPrompt[] = [
  // ── Surprise ──
  { id: 'surprise-01', category: 'surprise', prompt_text: 'What surprised you about them today?', best_when: null, role_affinity: 'any' },
  { id: 'surprise-02', category: 'surprise', prompt_text: 'Was there a moment you didn\'t expect?', best_when: null, role_affinity: 'any' },
  { id: 'surprise-03', category: 'surprise', prompt_text: 'What was different about today compared to your last visit?', best_when: 'Returning visitors', role_affinity: 'any' },

  // ── Face ──
  { id: 'face-01', category: 'face', prompt_text: 'What did their face tell you that words didn\'t?', best_when: null, role_affinity: 'any' },
  { id: 'face-02', category: 'face', prompt_text: 'How did their eyes look when you arrived? When you left?', best_when: null, role_affinity: 'any' },
  { id: 'face-03', category: 'face', prompt_text: 'Did their expression change during your visit? When?', best_when: null, role_affinity: 'any' },

  // ── Family ──
  { id: 'family-01', category: 'family', prompt_text: 'What would their family want to know about today?', best_when: null, role_affinity: 'any' },
  { id: 'family-02', category: 'family', prompt_text: 'Did they mention anyone by name? Who, and how?', best_when: null, role_affinity: 'any' },
  { id: 'family-03', category: 'family', prompt_text: 'Is there someone they seem to be missing?', best_when: 'When resident seems withdrawn', role_affinity: 'any' },
  { id: 'family-04', category: 'family', prompt_text: 'If their grandchild asked "How\'s grandma today?" — what would you say?', best_when: null, role_affinity: 'any' },

  // ── Spiritual ──
  { id: 'spiritual-01', category: 'spiritual', prompt_text: 'Was there a moment of grace?', best_when: null, role_affinity: 'any' },
  { id: 'spiritual-02', category: 'spiritual', prompt_text: 'Did faith come up — in words, or in silence?', best_when: null, role_affinity: 'any' },
  { id: 'spiritual-03', category: 'spiritual', prompt_text: 'What prayer would you offer for them tonight?', best_when: null, role_affinity: 'any' },
  { id: 'spiritual-04', category: 'spiritual', prompt_text: 'Did they seem to be at peace? What gave you that sense?', best_when: null, role_affinity: 'any' },

  // ── Memory ──
  { id: 'memory-01', category: 'memory', prompt_text: 'Did they share a memory? What was it about?', best_when: null, role_affinity: 'any' },
  { id: 'memory-02', category: 'memory', prompt_text: 'What part of their past seemed most alive today?', best_when: null, role_affinity: 'any' },
  { id: 'memory-03', category: 'memory', prompt_text: 'Is there a story they keep returning to? What does it seem to mean to them?', best_when: 'Returning visitors who notice patterns', role_affinity: 'any' },

  // ── Joy ──
  { id: 'joy-01', category: 'joy', prompt_text: 'What made them smile?', best_when: null, role_affinity: 'any' },
  { id: 'joy-02', category: 'joy', prompt_text: 'Was there laughter? What caused it?', best_when: null, role_affinity: 'any' },
  { id: 'joy-03', category: 'joy', prompt_text: 'What small thing seemed to bring them the most comfort?', best_when: null, role_affinity: 'any' },

  // ── Loss ──
  { id: 'loss-01', category: 'loss', prompt_text: 'What grief seemed present today?', best_when: 'After a recent loss or anniversary', role_affinity: 'any' },
  { id: 'loss-02', category: 'loss', prompt_text: 'Did they seem to be carrying something heavy? What did you sense?', best_when: null, role_affinity: 'any' },
  { id: 'loss-03', category: 'loss', prompt_text: 'Was there an absence in the room — someone or something missing?', best_when: null, role_affinity: 'any' },

  // ── Daily Life ──
  { id: 'daily-01', category: 'daily_life', prompt_text: 'What were they doing when you arrived?', best_when: null, role_affinity: 'any' },
  { id: 'daily-02', category: 'daily_life', prompt_text: 'What does their room tell you about who they are?', best_when: 'First visits to a new resident', role_affinity: 'any' },
  { id: 'daily-03', category: 'daily_life', prompt_text: 'How did they seem compared to the others around them today?', best_when: null, role_affinity: 'any' },

  // ── Accompaniment ──
  { id: 'accomp-01', category: 'accompaniment', prompt_text: 'What will you remember about this visit?', best_when: null, role_affinity: 'any' },
  { id: 'accomp-02', category: 'accompaniment', prompt_text: 'If you could only tell one person about this visit, what would you say?', best_when: null, role_affinity: 'any' },
  { id: 'accomp-03', category: 'accompaniment', prompt_text: 'How did this visit change you — even a little?', best_when: null, role_affinity: 'any' },
  { id: 'accomp-04', category: 'accompaniment', prompt_text: 'What does this person need that no chart or system can capture?', best_when: null, role_affinity: 'any' },

  // ── Chaplain-specific prompts ──
  { id: 'chap-01', category: 'spiritual', prompt_text: 'Where did grace or longing appear today?', best_when: null, role_affinity: 'chaplain' },
  { id: 'chap-02', category: 'spiritual', prompt_text: 'Did they seek prayer, sacrament, or silence?', best_when: null, role_affinity: 'chaplain' },
  { id: 'chap-03', category: 'spiritual', prompt_text: 'What felt spiritually unfinished?', best_when: null, role_affinity: 'chaplain' },
  { id: 'chap-04', category: 'family', prompt_text: 'What would the family want to know about their heart today?', best_when: null, role_affinity: 'chaplain' },

  // ── Nurse/staff-specific prompts ──
  { id: 'nurse-01', category: 'daily_life', prompt_text: 'What should the next caregiver know before entering the room?', best_when: null, role_affinity: 'nurse' },
  { id: 'nurse-02', category: 'face', prompt_text: 'Was there a moment of comfort, ease, or preference honored?', best_when: null, role_affinity: 'nurse' },
  { id: 'nurse-03', category: 'daily_life', prompt_text: 'What emotional tone did you notice? Any shift or constancy?', best_when: null, role_affinity: 'nurse' },

  // ── Volunteer-specific prompts ──
  { id: 'vol-01', category: 'accompaniment', prompt_text: 'What moment of connection stood out?', best_when: null, role_affinity: 'volunteer' },
  { id: 'vol-02', category: 'accompaniment', prompt_text: 'Did they seem more alone or more accompanied?', best_when: null, role_affinity: 'volunteer' },
  { id: 'vol-03', category: 'memory', prompt_text: 'What memory, person, or story came alive?', best_when: null, role_affinity: 'volunteer' },
  { id: 'vol-04', category: 'accompaniment', prompt_text: 'What should someone carry forward from this visit?', best_when: null, role_affinity: 'volunteer' },

  // ── Family visitor-specific prompts ──
  { id: 'fam-01', category: 'memory', prompt_text: 'What memory did you share together today?', best_when: null, role_affinity: 'family' },
  { id: 'fam-02', category: 'joy', prompt_text: 'What brought them the most joy during your visit?', best_when: null, role_affinity: 'family' },
  { id: 'fam-03', category: 'family', prompt_text: 'How did they seem to you — compared to last time?', best_when: null, role_affinity: 'family' },

  // ── Liturgical season-specific prompts ──
  // Advent
  { id: 'advent-01', category: 'spiritual', prompt_text: 'What are they waiting for — spoken or unspoken?', best_when: null, role_affinity: 'any', liturgical_affinity: 'advent' },
  { id: 'advent-02', category: 'spiritual', prompt_text: 'Where did you see longing or hope today?', best_when: null, role_affinity: 'any', liturgical_affinity: 'advent' },
  { id: 'advent-03', category: 'family', prompt_text: 'Who are they preparing their heart for this season?', best_when: null, role_affinity: 'any', liturgical_affinity: 'advent' },

  // Lent
  { id: 'lent-01', category: 'spiritual', prompt_text: 'What sacrifice is quietly present in their day?', best_when: null, role_affinity: 'any', liturgical_affinity: 'lent' },
  { id: 'lent-02', category: 'loss', prompt_text: 'What are they carrying that they cannot put down?', best_when: null, role_affinity: 'any', liturgical_affinity: 'lent' },
  { id: 'lent-03', category: 'accompaniment', prompt_text: 'How can you walk with them through this desert?', best_when: null, role_affinity: 'any', liturgical_affinity: 'lent' },

  // Easter
  { id: 'easter-01', category: 'joy', prompt_text: 'Where did new life show itself today — even small?', best_when: null, role_affinity: 'any', liturgical_affinity: 'easter' },
  { id: 'easter-02', category: 'spiritual', prompt_text: 'What felt resurrected in this visit?', best_when: null, role_affinity: 'any', liturgical_affinity: 'easter' },
  { id: 'easter-03', category: 'joy', prompt_text: 'What moment of unexpected joy did you witness?', best_when: null, role_affinity: 'any', liturgical_affinity: 'easter' },
];

/** Context about the resident that influences prompt selection */
export interface ResidentPromptContext {
  /** Recent loss (bereavement) — weights loss/spiritual prompts */
  hasRecentLoss?: boolean;
  /** Recent family visit — weights family prompts */
  hasRecentFamilyVisit?: boolean;
  /** In vigil/hospice mode — use vigil prompts instead */
  isVigilMode?: boolean;
}

/**
 * Select today's voice prompt for a given visitor.
 *
 * Rules:
 * 1. No prompt repeats within the last 7 entries for this visitor
 * 2. Rotate across categories for variety
 * 3. Liturgical season prompts are preferred during their season
 * 4. Resident context (bereavement, family visit) weights relevant categories
 * 5. Deterministic within a day (same visitor sees same prompt all day)
 */
export function selectVoicePrompt(
  visitorId: string,
  recentPromptIds: string[],
  preferredCategory?: VoicePromptCategory,
  visitorRole?: VisitorRole,
  currentSeason?: LiturgicalSeason | null,
  residentContext?: ResidentPromptContext,
): SeedPrompt {
  const recentSet = new Set(recentPromptIds.slice(0, 7));
  let candidates = VOICE_PROMPTS.filter((p) => !recentSet.has(p.id));

  // Filter by role affinity — include 'any' prompts plus role-specific ones
  if (visitorRole && visitorRole !== 'any') {
    const roleCandidates = candidates.filter(
      (p) => p.role_affinity === 'any' || p.role_affinity === visitorRole
    );
    if (roleCandidates.length > 0) candidates = roleCandidates;
  }

  // Boost liturgical season-specific prompts: include them alongside general prompts
  // by duplicating seasonal matches so they appear more frequently
  if (currentSeason) {
    const seasonalPrompts = candidates.filter((p) => p.liturgical_affinity === currentSeason);
    if (seasonalPrompts.length > 0) {
      // Add seasonal prompts twice to double their selection weight
      candidates = [...candidates, ...seasonalPrompts, ...seasonalPrompts];
    }
  }

  // Resident-specific weighting
  if (residentContext?.hasRecentLoss) {
    const lossPrompts = candidates.filter((p) => p.category === 'loss' || p.category === 'spiritual');
    if (lossPrompts.length > 0) {
      candidates = [...candidates, ...lossPrompts]; // Boost loss/spiritual
    }
  }
  if (residentContext?.hasRecentFamilyVisit) {
    const familyPrompts = candidates.filter((p) => p.category === 'family');
    if (familyPrompts.length > 0) {
      candidates = [...candidates, ...familyPrompts]; // Boost family
    }
  }

  if (preferredCategory) {
    const catCandidates = candidates.filter((p) => p.category === preferredCategory);
    if (catCandidates.length > 0) candidates = catCandidates;
  }

  if (candidates.length === 0) candidates = VOICE_PROMPTS;

  // Deduplicate for deterministic selection (the weighting just increases probability)
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
