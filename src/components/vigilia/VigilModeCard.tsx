/**
 * VigilModeCard — Displayed on resident detail when end-of-life care is active.
 *
 * "When the end comes, Vigilia handles it with the dignity your Catholic identity demands."
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Heart, BookOpen, Cross } from 'lucide-react';
import { useVigilMode, useActivateVigilMode, useDeactivateVigilMode } from '@/hooks/useVigilMode';
import { useFamilyReflections } from '@/hooks/useFamilyReflections';
import { getCurrentSeason } from '@/lib/liturgicalCalendar';
import FamilyMessageDialog from './FamilyMessageDialog';

interface VigilModeCardProps {
  residentContactId: string;
  residentName: string;
  careLevel: string | null;
}

export default function VigilModeCard({ residentContactId, residentName, careLevel }: VigilModeCardProps) {
  const { data: isActive } = useVigilMode(residentContactId);
  const activate = useActivateVigilMode();
  const deactivate = useDeactivateVigilMode();
  const [messageOpen, setMessageOpen] = useState(false);

  const season = getCurrentSeason();
  const { data: reflections } = useFamilyReflections(residentContactId, season.season);
  const recentReflections = (reflections ?? []).slice(0, 5);

  if (!isActive && careLevel !== 'hospice') {
    return (
      <Card className="border-dashed border-amber-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4" />
            <span>Vigil Mode is available for end-of-life care</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => activate.mutate(residentContactId)}
            disabled={activate.isPending}
          >
            Activate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
        <CardContent className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Vigil
              </h3>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                In tender care
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => deactivate.mutate(residentContactId)}
              disabled={deactivate.isPending}
            >
              Deactivate
            </Button>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-200 hover:bg-amber-50"
              onClick={() => setMessageOpen(true)}
            >
              <Heart className="h-3.5 w-3.5" />
              Send family message
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-amber-200 hover:bg-amber-50">
              <Cross className="h-3.5 w-3.5" />
              Record sacrament
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-amber-200 hover:bg-amber-50">
              <BookOpen className="h-3.5 w-3.5" />
              Add reflection
            </Button>
          </div>

          {/* Recent reflections */}
          {recentReflections.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-amber-200/50">
              <p className="text-xs font-medium tracking-widest uppercase text-amber-700">Recent</p>
              {recentReflections.map((ref: any) => (
                <div key={ref.id} className="text-sm text-amber-900/80 leading-relaxed border-l-2 border-amber-300/50 pl-3"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  <p className="text-[10px] text-amber-600 mb-1">
                    {new Date(ref.published_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  {ref.reflection_text}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FamilyMessageDialog
        open={messageOpen}
        onOpenChange={setMessageOpen}
        residentContactId={residentContactId}
        residentName={residentName}
      />
    </>
  );
}
