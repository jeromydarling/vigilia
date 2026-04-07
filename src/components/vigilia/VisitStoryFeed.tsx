/**
 * VisitStoryFeed — Shows the stream of visit ritual entries for a resident.
 * Each entry shows the taps (mood/need/concern), the voice prompt used,
 * and the voice note transcript if available.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Heart, HandHeart, Eye, Send } from 'lucide-react';
import { useVisitRituals } from '@/hooks/useVisitRituals';

const MOOD_EMOJI: Record<string, string> = {
  peaceful: '🕊️', lonely: '🫂', anxious: '😟',
  encouraged: '😊', tired: '😴', hard_to_tell: '🤔',
};

const NEED_LABELS: Record<string, string> = {
  company: 'Company', prayer: 'Prayer', family_contact: 'Family contact',
  sacramental_care: 'Sacramental care', comfort: 'Comfort', staff_followup: 'Staff follow-up',
};

const CONCERN_LABELS: Record<string, string> = {
  new_grief: 'New grief', withdrawal: 'Withdrawal', joyful_moment: 'Joyful moment',
  family_strain: 'Family strain', spiritual_request: 'Spiritual request', no_concern: 'No concern',
};

const FOLLOWUP_LABELS: Record<string, string> = {
  tell_chaplain: 'Chaplain notified', contact_family: 'Family contacted',
  ask_volunteer_visit: 'Volunteer requested', no_followup: 'No follow-up',
};

interface VisitStoryFeedProps {
  residentContactId: string;
}

export function VisitStoryFeed({ residentContactId }: VisitStoryFeedProps) {
  const { data: visits, isLoading } = useVisitRituals(residentContactId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="h-4 w-4 text-muted-foreground" />
          Visit Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading visit stories...</p>}
        {!isLoading && (visits ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No visits recorded yet. Start with the 30-second ritual.</p>
        )}
        {!isLoading && (visits ?? []).length > 0 && (
          <div className="space-y-4">
            {(visits ?? []).map((visit: any) => (
              <div key={visit.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(visit.visited_at).toLocaleDateString(undefined, {
                      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {FOLLOWUP_LABELS[visit.followup_action] ?? visit.followup_action}
                  </Badge>
                </div>

                {/* Taps summary */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted">
                    {MOOD_EMOJI[visit.mood_observed] ?? '?'} {visit.mood_observed?.replace(/_/g, ' ')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted">
                    <HandHeart className="h-3 w-3" /> {NEED_LABELS[visit.need_observed] ?? visit.need_observed}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted">
                    <Eye className="h-3 w-3" /> {CONCERN_LABELS[visit.concern_noted] ?? visit.concern_noted}
                  </span>
                </div>

                {/* Voice prompt + note */}
                {visit.voice_prompt_text && (
                  <div className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3">
                    "{visit.voice_prompt_text}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
