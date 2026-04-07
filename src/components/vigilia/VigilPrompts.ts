/**
 * VigilPrompts — End-of-life specific voice prompts for Vigil Mode.
 */

import type { SeedPrompt } from '@/lib/voicePrompts';

export const VIGIL_PROMPTS: SeedPrompt[] = [
  { id: 'vigil-01', category: 'spiritual', prompt_text: 'What does their peace look like right now?', best_when: null, role_affinity: 'any' },
  { id: 'vigil-02', category: 'family', prompt_text: 'Who is with them — in the room, and in their heart?', best_when: null, role_affinity: 'any' },
  { id: 'vigil-03', category: 'spiritual', prompt_text: 'What prayer feels right for this moment?', best_when: null, role_affinity: 'any' },
  { id: 'vigil-04', category: 'family', prompt_text: 'What should the family hold onto from today?', best_when: null, role_affinity: 'any' },
  { id: 'vigil-05', category: 'spiritual', prompt_text: 'Is there something unfinished that needs gentle attention?', best_when: null, role_affinity: 'any' },
  { id: 'vigil-06', category: 'accompaniment', prompt_text: 'What does dignity look like in this room right now?', best_when: null, role_affinity: 'any' },
  { id: 'vigil-07', category: 'accompaniment', prompt_text: 'If this were the last page of their journal, what would you write?', best_when: null, role_affinity: 'any' },
  { id: 'vigil-08', category: 'accompaniment', prompt_text: 'What has this person taught you about how to live?', best_when: null, role_affinity: 'any' },
];
