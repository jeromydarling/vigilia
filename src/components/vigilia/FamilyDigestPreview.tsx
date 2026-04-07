/**
 * FamilyDigestPreview — Shows what the weekly family email would look like.
 */

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useDigestPreview } from '@/hooks/useFamilyDigest';

interface FamilyDigestPreviewProps {
  residentContactId: string;
  residentName: string;
}

function getLastMonday(): string {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export default function FamilyDigestPreview({ residentContactId, residentName }: FamilyDigestPreviewProps) {
  const weekStart = getLastMonday();
  const { data: digest, isLoading } = useDigestPreview({ residentContactId, residentName, weekStart });

  if (isLoading) {
    return (
      <Card className="max-w-[560px] mx-auto">
        <CardContent className="p-8 text-center text-muted-foreground">Loading preview...</CardContent>
      </Card>
    );
  }

  if (!digest) {
    return (
      <Card className="max-w-[560px] mx-auto">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reflections this week yet. The digest will appear once visits are recorded.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-[560px] mx-auto border shadow-sm overflow-hidden">
      {/* Gold accent line */}
      <div className="h-[3px] bg-gradient-to-r from-amber-400 to-amber-600" />

      <CardContent className="p-6 sm:p-8 space-y-6 bg-amber-50/30">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-amber-700">{digest.seasonLabel}</p>
          <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            {digest.residentName}
          </h2>
          <p className="text-xs text-muted-foreground">{digest.weekLabel}</p>
        </div>

        {/* Mood summary */}
        <p className="text-sm text-center text-muted-foreground italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {digest.moodSummary}
        </p>

        {/* Weekly chapter */}
        {digest.chapterText && (
          <div className="border-l-2 border-amber-300 pl-4">
            <p className="text-sm leading-relaxed text-foreground" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {digest.chapterText}
            </p>
          </div>
        )}

        {/* Selected reflections */}
        <div className="space-y-4">
          {digest.reflections.map((ref, i) => (
            <div key={i} className="border-b border-border/40 pb-3 last:border-0">
              <p className="text-[10px] tracking-wide uppercase text-muted-foreground mb-1">{ref.date}</p>
              <p className="text-sm leading-relaxed text-foreground" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {ref.text}
              </p>
            </div>
          ))}
        </div>

        {/* Closing prayer */}
        <div className="text-center pt-4 border-t border-amber-200/50">
          <p className="text-sm italic text-amber-800" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {digest.closingPrayer}
          </p>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-muted-foreground/60 pt-2">
          This journal is compiled from small acts of attention by the people who care for {digest.residentName}.
        </p>
      </CardContent>
    </Card>
  );
}
