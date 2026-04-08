/**
 * reflectionValidator — Post-synthesis quality checks for family reflections.
 *
 * WHAT: Validates AI-composed reflections before they're published to families.
 *       Catches hallucinations, tone problems, and content that shouldn't appear
 *       in a permanent memorial journal.
 *
 * WHY: "This text becomes a physical book. A family will hold it at a funeral.
 *       An odd phrase or invented detail is not a bug — it's a betrayal of trust."
 *
 * APPROACH: Layered validation without requiring human review:
 *   1. Rule-based checks (fast, deterministic)
 *   2. Input-output consistency check (does the reflection match the visit data?)
 *   3. AI self-review (second LLM pass asking "is this safe to publish?")
 *
 * Reflections that fail are held (not published) and flagged for review.
 */

import type { MoodObserved, NeedObserved, ConcernNoted } from '@/types/vigilia';

export interface ValidationInput {
  reflectionText: string;
  residentName: string;
  mood: MoodObserved;
  need: NeedObserved;
  concern: ConcernNoted;
  voiceTranscript: string | null;
}

export interface ValidationResult {
  pass: boolean;
  score: number; // 0-100 (100 = perfect)
  flags: ValidationFlag[];
  holdReason: string | null;
}

export interface ValidationFlag {
  rule: string;
  severity: 'warning' | 'hold';
  message: string;
}

// ── Rule-based checks (Layer 1) ──

const FORBIDDEN_PATTERNS: { pattern: RegExp; rule: string; message: string; severity: 'warning' | 'hold' }[] = [
  // AI artifacts
  { pattern: /\b(as an ai|language model|i cannot|i don'?t have|i'?m unable)\b/i, rule: 'ai_leak', message: 'AI self-reference detected', severity: 'hold' },
  { pattern: /\b(here is|here's a|the following|in this reflection)\b/i, rule: 'meta_language', message: 'Meta-language about the reflection itself', severity: 'hold' },
  { pattern: /\b(based on the (data|information|input))\b/i, rule: 'data_reference', message: 'References underlying data/input', severity: 'hold' },

  // System leaks
  { pattern: /\b(tap|taps|voice note|voice prompt|app|system|dashboard|software|platform|algorithm|prompt)\b/i, rule: 'system_leak', message: 'System/technology term leaked into narrative', severity: 'hold' },
  { pattern: /\b(mood_observed|need_observed|concern_noted|followup_action|visit_ritual)\b/i, rule: 'field_leak', message: 'Database field name in output', severity: 'hold' },

  // Clinical language that shouldn't appear in a family journal
  { pattern: /\b(patient|diagnosis|prognosis|medication|dosage|mg|cc|vitals|blood pressure|bp|o2 sat)\b/i, rule: 'clinical', message: 'Clinical/medical terminology', severity: 'warning' },
  { pattern: /\b(chart|ehr|emr|assessment|intervention|care plan)\b/i, rule: 'clinical_system', message: 'Clinical system terminology', severity: 'hold' },

  // Tone problems
  { pattern: /\b(unfortunately|regrettably|sadly|i'?m sorry to report)\b/i, rule: 'report_tone', message: 'Report-like tone inappropriate for journal', severity: 'warning' },
  { pattern: /!{2,}/, rule: 'exclamation', message: 'Excessive exclamation marks', severity: 'warning' },
  { pattern: /\b(amazing|incredible|awesome|fantastic)\b/i, rule: 'hyperbole', message: 'Hyperbolic language', severity: 'warning' },

  // Hallucination signals
  { pattern: /\b(probably|likely|perhaps|maybe|might have|could have been)\b/i, rule: 'speculation', message: 'Speculative language — AI may be inventing', severity: 'warning' },

  // Privacy risks
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, rule: 'phone', message: 'Phone number detected', severity: 'hold' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, rule: 'email', message: 'Email address detected', severity: 'hold' },
];

function runRuleChecks(text: string): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  for (const { pattern, rule, message, severity } of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      flags.push({ rule, severity, message });
    }
  }
  return flags;
}

// ── Input-output consistency (Layer 2) ──

function checkConsistency(input: ValidationInput): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  const text = input.reflectionText.toLowerCase();
  const firstName = input.residentName.split(' ')[0].toLowerCase();

  // The reflection should mention the resident's first name
  if (!text.includes(firstName)) {
    flags.push({ rule: 'name_missing', severity: 'warning', message: `Resident name "${firstName}" not found in reflection` });
  }

  // Mood consistency — if the visit was "anxious" the reflection shouldn't describe pure joy
  const moodContradictions: Record<string, RegExp> = {
    anxious: /\b(joyful|laughing|beaming|delighted|thrilled)\b/i,
    lonely: /\b(surrounded by|crowd|celebration|party)\b/i,
    peaceful: /\b(agitated|distressed|screaming|thrashing)\b/i,
  };
  const contradiction = moodContradictions[input.mood];
  if (contradiction && contradiction.test(input.reflectionText)) {
    flags.push({ rule: 'mood_contradiction', severity: 'warning', message: `Reflection tone contradicts observed mood (${input.mood})` });
  }

  // Length check
  const words = input.reflectionText.split(/\s+/).length;
  if (words < 15) {
    flags.push({ rule: 'too_short', severity: 'warning', message: `Reflection too short (${words} words, minimum 15)` });
  }
  if (words > 150) {
    flags.push({ rule: 'too_long', severity: 'warning', message: `Reflection too long (${words} words, maximum 150)` });
  }

  return flags;
}

// ── Build AI self-review prompt (Layer 3) ──

export function buildReviewPrompt(reflectionText: string, residentFirstName: string): string {
  return `You are a quality reviewer for a family bedside journal about elderly Catholic care residents. A reflection was AI-composed from visit data. Your job is to check if it's safe and appropriate to publish to the family.

REFLECTION:
"${reflectionText}"

RESIDENT FIRST NAME: ${residentFirstName}

Check for these problems:
1. Does it contain any invented details that weren't in a real visit? (Names of people not mentioned, events that seem fabricated)
2. Does it contain inappropriate tone? (Too clinical, too casual, too dramatic, insincere)
3. Does it reference technology, apps, systems, or AI?
4. Does it contain private medical information that shouldn't be in a family journal?
5. Does it feel like something a family member would want to read and reread — or would it feel odd?

Respond with EXACTLY one of:
PASS — if the reflection is safe, warm, honest, and appropriate for a permanent family journal
FLAG — followed by a brief reason, if there's a concern

Examples:
PASS
FLAG — mentions medication by name
FLAG — tone feels robotic and impersonal
FLAG — invents a visitor name not in the source data`;
}

// ── Main validation function ──

export function validateReflection(input: ValidationInput): ValidationResult {
  const flags: ValidationFlag[] = [];

  // Layer 1: Rule-based
  flags.push(...runRuleChecks(input.reflectionText));

  // Layer 2: Consistency
  flags.push(...checkConsistency(input));

  // Compute score
  const holdFlags = flags.filter(f => f.severity === 'hold');
  const warnFlags = flags.filter(f => f.severity === 'warning');

  let score = 100;
  score -= holdFlags.length * 25;
  score -= warnFlags.length * 8;
  score = Math.max(0, Math.min(100, score));

  const pass = holdFlags.length === 0 && score >= 60;
  const holdReason = holdFlags.length > 0 ? holdFlags.map(f => f.message).join('; ') : null;

  return { pass, score, flags, holdReason };
}

// ── Print gate validation (stricter for physical journals) ──

export function validateForPrint(reflectionText: string, residentName: string): ValidationResult {
  const input: ValidationInput = {
    reflectionText,
    residentName,
    mood: 'peaceful' as MoodObserved, // We don't have mood at print time, skip mood checks
    need: 'company' as NeedObserved,
    concern: 'no_concern' as ConcernNoted,
    voiceTranscript: null,
  };

  const result = validateReflection(input);

  // Stricter threshold for print — warnings become holds
  const hasWarnings = result.flags.some(f => f.severity === 'warning');
  if (hasWarnings && result.score < 80) {
    return {
      ...result,
      pass: false,
      holdReason: `Print gate: score ${result.score} below 80 threshold. ${result.flags.map(f => f.message).join('; ')}`,
    };
  }

  return result;
}
