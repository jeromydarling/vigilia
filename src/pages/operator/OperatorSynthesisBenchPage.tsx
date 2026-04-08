/**
 * OperatorSynthesisBenchPage — Bench test the narrative synthesis pipeline.
 *
 * Feed sample visit data through the full pipeline and see:
 * - The generated reflection
 * - Validation results (score, flags, pass/hold)
 * - AI self-review verdict
 * - Whether it would be published or held
 *
 * "Before this text lives on a shelf in someone's home,
 *  it should survive every test you can throw at it."
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertTriangle, XCircle, FlaskConical, RotateCcw } from 'lucide-react';
import { buildReflectionPrompt } from '@/lib/narrativeSynthesis';
import { validateReflection, buildReviewPrompt, type ValidationResult, type ValidationFlag } from '@/lib/reflectionValidator';
import { supabase } from '@/integrations/supabase/client';
import type { MoodObserved, NeedObserved, ConcernNoted } from '@/types/vigilia';

const MOODS: MoodObserved[] = ['peaceful', 'lonely', 'anxious', 'encouraged', 'tired', 'hard_to_tell'];
const NEEDS: NeedObserved[] = ['company', 'prayer', 'family_contact', 'sacramental_care', 'comfort', 'staff_followup'];
const CONCERNS: ConcernNoted[] = ['new_grief', 'withdrawal', 'joyful_moment', 'family_strain', 'spiritual_request', 'no_concern'];

const SAMPLE_SCENARIOS = [
  {
    label: 'Peaceful visit with prayer',
    name: 'Margaret Williams', mood: 'peaceful' as MoodObserved, need: 'prayer' as NeedObserved, concern: 'no_concern' as ConcernNoted,
    transcript: 'She seemed very much at peace today. We prayed the rosary together and she held my hand through the sorrowful mysteries.',
  },
  {
    label: 'Lonely resident, grief',
    name: 'Tony Russo', mood: 'lonely' as MoodObserved, need: 'company' as NeedObserved, concern: 'new_grief' as ConcernNoted,
    transcript: 'Tony was sitting by the window watching the birds. He told me about Maria\'s Sunday gravy recipe. His eyes got wet but he smiled through it.',
  },
  {
    label: 'Memory care, music response',
    name: 'Rose Delgado', mood: 'peaceful' as MoodObserved, need: 'comfort' as NeedObserved, concern: 'withdrawal' as ConcernNoted,
    transcript: 'Rosie was inward today. She didn\'t speak much. But when I started humming Ave Maria she turned toward me and her eyes softened.',
  },
  {
    label: 'Hospice visit, family present',
    name: 'Tom Murphy', mood: 'tired' as MoodObserved, need: 'sacramental_care' as NeedObserved, concern: 'spiritual_request' as ConcernNoted,
    transcript: 'Tom was peaceful. Patricia was beside him. He asked me to read Psalm 23 and his lips moved with the words.',
  },
  {
    label: 'Edge case: minimal transcript',
    name: 'Helen O\'Brien', mood: 'encouraged' as MoodObserved, need: 'company' as NeedObserved, concern: 'joyful_moment' as ConcernNoted,
    transcript: 'Good visit.',
  },
];

function FlagBadge({ flag }: { flag: ValidationFlag }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${flag.severity === 'hold' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
      {flag.severity === 'hold' ? <XCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
      {flag.rule}: {flag.message}
    </Badge>
  );
}

export default function OperatorSynthesisBenchPage() {
  const [name, setName] = useState('Margaret Williams');
  const [mood, setMood] = useState<MoodObserved>('peaceful');
  const [need, setNeed] = useState<NeedObserved>('prayer');
  const [concern, setConcern] = useState<ConcernNoted>('no_concern');
  const [transcript, setTranscript] = useState('She seemed very much at peace today. We prayed the rosary together.');

  const [generating, setGenerating] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setReflection(null);
    setValidation(null);
    setAiReview(null);

    try {
      // Build the prompt
      const p = buildReflectionPrompt({
        residentName: name,
        mood, need, concern,
        voiceTranscript: transcript || null,
        voicePromptText: null,
        visitedAt: new Date().toISOString(),
        visitorRole: 'any',
      });
      setPrompt(p);

      // Call LLM
      const { data, error } = await supabase.functions.invoke('generate-text', {
        body: { prompt: p, max_tokens: 200 },
      });
      if (error) throw error;

      const text = data?.text ?? data?.generatedText ?? '';
      setReflection(text);

      // Validate
      const v = validateReflection({
        reflectionText: text,
        residentName: name,
        mood, need, concern,
        voiceTranscript: transcript || null,
      });
      setValidation(v);

      // AI self-review
      try {
        const reviewPrompt = buildReviewPrompt(text, name.split(' ')[0]);
        const { data: reviewData } = await supabase.functions.invoke('generate-text', {
          body: { prompt: reviewPrompt, max_tokens: 50 },
        });
        setAiReview((reviewData?.text ?? '').trim());
      } catch {
        setAiReview('(AI review failed)');
      }
    } catch (err) {
      setReflection(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const loadScenario = (s: typeof SAMPLE_SCENARIOS[0]) => {
    setName(s.name);
    setMood(s.mood);
    setNeed(s.need);
    setConcern(s.concern);
    setTranscript(s.transcript);
    setReflection(null);
    setValidation(null);
    setAiReview(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6" />
          Synthesis Bench Test
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Feed sample visits through the full pipeline. See the reflection, validation score, and AI review.
        </p>
      </div>

      {/* Preset scenarios */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_SCENARIOS.map((s) => (
          <Button key={s.label} variant="outline" size="sm" className="text-xs" onClick={() => loadScenario(s)}>
            {s.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Visit Input</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Resident Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Mood</Label>
                <select value={mood} onChange={(e) => setMood(e.target.value as MoodObserved)} className="w-full rounded border border-border p-2 text-sm">
                  {MOODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Need</Label>
                <select value={need} onChange={(e) => setNeed(e.target.value as NeedObserved)} className="w-full rounded border border-border p-2 text-sm">
                  {NEEDS.map(n => <option key={n} value={n}>{n.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Concern</Label>
                <select value={concern} onChange={(e) => setConcern(e.target.value as ConcernNoted)} className="w-full rounded border border-border p-2 text-sm">
                  {CONCERNS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Voice Transcript</Label>
              <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="min-h-[80px]" />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating &amp; validating...</> : 'Generate Reflection'}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <div className="space-y-4">
          {/* Reflection */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Generated Reflection</CardTitle></CardHeader>
            <CardContent>
              {reflection ? (
                <p className="text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  {reflection}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Generate a reflection to see the output here.</p>
              )}
            </CardContent>
          </Card>

          {/* Validation */}
          {validation && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Validation
                  {validation.pass ? (
                    <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />PASS</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />HOLD</Badge>
                  )}
                  <Badge variant="outline" className="ml-auto">{validation.score}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validation.holdReason && (
                  <p className="text-sm text-red-700 bg-red-50 p-3 rounded">{validation.holdReason}</p>
                )}
                {validation.flags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {validation.flags.map((f, i) => <FlagBadge key={i} flag={f} />)}
                  </div>
                ) : (
                  <p className="text-sm text-green-700">No flags — clean output.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Review */}
          {aiReview && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">AI Self-Review</CardTitle></CardHeader>
              <CardContent>
                <div className={`flex items-center gap-2 p-3 rounded text-sm ${
                  aiReview.startsWith('PASS') ? 'bg-green-50 text-green-800' :
                  aiReview.startsWith('FLAG') ? 'bg-yellow-50 text-yellow-800' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {aiReview.startsWith('PASS') && <CheckCircle className="h-4 w-4 shrink-0" />}
                  {aiReview.startsWith('FLAG') && <AlertTriangle className="h-4 w-4 shrink-0" />}
                  {aiReview}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* LLM Prompt (collapsible) */}
      {prompt && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base text-muted-foreground">LLM Prompt (debug)</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded max-h-48 overflow-y-auto">{prompt}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
