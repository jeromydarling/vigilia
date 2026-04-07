/**
 * VisitRitual — The 30-second bedside ritual.
 *
 * WHAT: A mobile-first, step-through card UI for capturing what mattered in a visit.
 *       Three structured taps (spirit, need, notice), one routing action, one voice note.
 * WHERE: Triggered from the Visits page or resident detail after a visit.
 * WHY: The structured taps create signals for routing and drift detection.
 *       The voice note — guided by a daily rotating prompt — is the real product.
 *       It teaches staff and volunteers what to notice and how to tell a unique story.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { selectVoicePrompt, type SeedPrompt } from '@/lib/voicePrompts';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, ArrowLeft, Check, Mic, Heart, HandHeart, Eye, Send } from 'lucide-react';
import type {
  MoodObserved,
  NeedObserved,
  ConcernNoted,
  FollowupAction,
} from '@/types/vigilia';

// ── Step option definitions ──

const MOOD_OPTIONS: { value: MoodObserved; label: string; emoji: string }[] = [
  { value: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  { value: 'lonely', label: 'Lonely', emoji: '🫂' },
  { value: 'anxious', label: 'Anxious', emoji: '😟' },
  { value: 'encouraged', label: 'Encouraged', emoji: '😊' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'hard_to_tell', label: 'Hard to tell', emoji: '🤔' },
];

const NEED_OPTIONS: { value: NeedObserved; label: string; emoji: string }[] = [
  { value: 'company', label: 'Company', emoji: '👋' },
  { value: 'prayer', label: 'Prayer', emoji: '🙏' },
  { value: 'family_contact', label: 'Family contact', emoji: '📞' },
  { value: 'sacramental_care', label: 'Sacramental care', emoji: '✝️' },
  { value: 'comfort', label: 'Comfort', emoji: '💛' },
  { value: 'staff_followup', label: 'Staff follow-up', emoji: '🔔' },
];

const CONCERN_OPTIONS: { value: ConcernNoted; label: string; emoji: string }[] = [
  { value: 'new_grief', label: 'New grief', emoji: '🖤' },
  { value: 'withdrawal', label: 'Withdrawal', emoji: '🚪' },
  { value: 'joyful_moment', label: 'Joyful moment', emoji: '✨' },
  { value: 'family_strain', label: 'Family strain', emoji: '💔' },
  { value: 'spiritual_request', label: 'Spiritual request', emoji: '🕯️' },
  { value: 'no_concern', label: 'No concern', emoji: '✅' },
];

const FOLLOWUP_OPTIONS: { value: FollowupAction; label: string; emoji: string }[] = [
  { value: 'tell_chaplain', label: 'Tell chaplain', emoji: '⛪' },
  { value: 'contact_family', label: 'Contact family', emoji: '📱' },
  { value: 'ask_volunteer_visit', label: 'Ask volunteer visit', emoji: '🤝' },
  { value: 'no_followup', label: 'No follow-up needed', emoji: '👌' },
];

// ── Types ──

interface VisitRitualProps {
  residentContactId: string;
  residentName: string;
  facilityAnchorId?: string;
  /** Recent prompt IDs this visitor has seen (for no-repeat logic) */
  recentPromptIds?: string[];
  onComplete?: (data: VisitRitualData) => void;
  onCancel?: () => void;
}

export interface VisitRitualData {
  residentContactId: string;
  mood: MoodObserved;
  need: NeedObserved;
  concern: ConcernNoted;
  followup: FollowupAction;
  voicePrompt: SeedPrompt;
  facilityAnchorId?: string;
}

type Step = 'mood' | 'need' | 'concern' | 'followup' | 'voice';

const STEPS: Step[] = ['mood', 'need', 'concern', 'followup', 'voice'];
const STEP_HEADERS: Record<Step, { label: string; question: string; icon: typeof Heart }> = {
  mood:     { label: 'Spirit',  question: 'How were they today?', icon: Heart },
  need:     { label: 'Need',    question: 'What seemed most needed?', icon: HandHeart },
  concern:  { label: 'Notice',  question: 'What deserves notice?', icon: Eye },
  followup: { label: 'Route',   question: 'Who should know?', icon: Send },
  voice:    { label: 'Story',   question: '', icon: Mic },
};

// ── Component ──

export function VisitRitual({
  residentContactId,
  residentName,
  facilityAnchorId,
  recentPromptIds = [],
  onComplete,
  onCancel,
}: VisitRitualProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('mood');
  const [mood, setMood] = useState<MoodObserved | null>(null);
  const [need, setNeed] = useState<NeedObserved | null>(null);
  const [concern, setConcern] = useState<ConcernNoted | null>(null);
  const [followup, setFollowup] = useState<FollowupAction | null>(null);

  const voicePrompt = selectVoicePrompt(user?.id ?? 'anon', recentPromptIds);

  const stepIndex = STEPS.indexOf(currentStep);
  const isLast = currentStep === 'voice';
  const header = STEP_HEADERS[currentStep];

  const canAdvance = useCallback(() => {
    switch (currentStep) {
      case 'mood': return mood !== null;
      case 'need': return need !== null;
      case 'concern': return concern !== null;
      case 'followup': return followup !== null;
      case 'voice': return true;
    }
  }, [currentStep, mood, need, concern, followup]);

  const advance = () => {
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1]);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1]);
    }
  };

  const handleSelect = (value: string) => {
    switch (currentStep) {
      case 'mood': setMood(value as MoodObserved); break;
      case 'need': setNeed(value as NeedObserved); break;
      case 'concern': setConcern(value as ConcernNoted); break;
      case 'followup': setFollowup(value as FollowupAction); break;
    }
    // Auto-advance after selection
    setTimeout(advance, 200);
  };

  const handleVoiceComplete = () => {
    if (mood && need && concern && followup && onComplete) {
      onComplete({
        residentContactId,
        mood,
        need,
        concern,
        followup,
        voicePrompt,
        facilityAnchorId,
      });
    }
  };

  const getCurrentOptions = () => {
    switch (currentStep) {
      case 'mood': return MOOD_OPTIONS;
      case 'need': return NEED_OPTIONS;
      case 'concern': return CONCERN_OPTIONS;
      case 'followup': return FOLLOWUP_OPTIONS;
      default: return [];
    }
  };

  const getCurrentValue = () => {
    switch (currentStep) {
      case 'mood': return mood;
      case 'need': return need;
      case 'concern': return concern;
      case 'followup': return followup;
      default: return null;
    }
  };

  return (
    <Card className="max-w-md mx-auto border-0 shadow-lg">
      <CardContent className="p-0">
        {/* Progress bar */}
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
            Step {stepIndex + 1} of {STEPS.length} · {header.label}
          </p>
          <h2 className="text-xl font-bold text-foreground">
            {currentStep === 'voice' ? `"${voicePrompt.prompt_text}"` : header.question}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visiting {residentName}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {currentStep !== 'voice' ? (
            /* Tap options for steps 1-4 */
            <div className="grid grid-cols-2 gap-3">
              {getCurrentOptions().map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    getCurrentValue() === opt.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Voice note for step 5 */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground italic">
                Take 10–20 seconds. Tell the story of this visit.
              </p>
              <VoiceRecorder
                subjectType="contact"
                subjectId={residentContactId}
                onTranscriptSaved={() => handleVoiceComplete()}
              />
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={handleVoiceComplete}
              >
                Skip voice note
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-6">
          {stepIndex > 0 ? (
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}

          {!isLast && (
            <Button
              size="sm"
              onClick={advance}
              disabled={!canAdvance()}
              className="rounded-full"
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}

          {isLast && (
            <Button
              size="sm"
              onClick={handleVoiceComplete}
              className="rounded-full"
            >
              <Check className="h-4 w-4 mr-1" /> Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
