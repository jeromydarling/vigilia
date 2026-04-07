/**
 * FamilyPortal — The primary family experience.
 *
 * "Vigilia is not primarily a staff tool with a family portal attached.
 *  It is a family narrative app that is quietly powered by staff."
 *
 * This page should feel like opening a living bedside journal — not a feed,
 * not a dashboard, not a notification stream. Chapters organized by
 * liturgical season, with a warm, contemplative design.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Printer, ChevronDown } from 'lucide-react';
import { useFamilyReflections, useWeeklyChapters } from '@/hooks/useFamilyReflections';
import { usePrintJobs } from '@/hooks/usePrintJobs';
import { getCurrentSeason, getSeasonLabel } from '@/lib/liturgicalCalendar';
import { useParams } from 'react-router-dom';
import { useContacts } from '@/hooks/useContacts';

export default function FamilyPortal() {
  const { slug } = useParams<{ slug?: string }>();
  const { data: contacts } = useContacts();
  const resident = contacts?.find((c: any) => c.slug === slug || c.id === slug);

  const residentId = resident?.id;
  const currentSeason = getCurrentSeason();

  const { data: reflections } = useFamilyReflections(residentId, currentSeason.season);
  const { data: chapters } = useWeeklyChapters(residentId);
  const { data: printJobs } = usePrintJobs(residentId);

  const latestPrintJob = (printJobs ?? [])[0];

  return (
    <MainLayout
      title={resident?.name ?? 'Family Journal'}
      subtitle="A journal of accompaniment"
    >
      <div className="max-w-[640px] mx-auto space-y-8 pb-12">
        {/* Season header */}
        <div className="text-center pt-4">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
            {getSeasonLabel()}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {resident?.name ?? 'Your Loved One'}
          </h1>
          <p
            className="text-base text-muted-foreground"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {currentSeason.description}
          </p>
        </div>

        {/* Print job status */}
        {latestPrintJob && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Printer className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {latestPrintJob.status === 'shipped'
                    ? `Your ${latestPrintJob.season} journal has shipped!`
                    : latestPrintJob.status === 'printing'
                    ? `Your ${latestPrintJob.season} journal is being printed...`
                    : `Your ${latestPrintJob.season} journal is being prepared.`}
                </p>
                {latestPrintJob.tracking_url && (
                  <a
                    href={latestPrintJob.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Track shipment
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly chapters — the heart of the family experience */}
        {(chapters ?? []).length > 0 && (
          <div className="space-y-6">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
              Recent Chapters
            </h2>
            {(chapters ?? []).slice(0, 8).map((chapter: any) => (
              <div key={chapter.id} className="border-b border-border pb-6 last:border-0">
                <p className="text-xs text-muted-foreground mb-3">
                  Week of {new Date(chapter.week_start).toLocaleDateString(undefined, {
                    month: 'long', day: 'numeric',
                  })}
                </p>
                <p
                  className="text-base text-foreground leading-relaxed"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {chapter.chapter_text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Daily reflections — immediate moments */}
        {(reflections ?? []).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
              Recent Moments
            </h2>
            {(reflections ?? []).slice(0, 12).map((ref: any) => (
              <div key={ref.id} className="py-3 border-b border-border/50 last:border-0">
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(ref.published_at).toLocaleDateString(undefined, {
                    weekday: 'long', month: 'long', day: 'numeric',
                  })}
                </p>
                <p
                  className="text-sm text-foreground leading-relaxed"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {ref.reflection_text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {(reflections ?? []).length === 0 && (chapters ?? []).length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2
              className="text-xl font-semibold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The story is just beginning.
            </h2>
            <p
              className="text-base text-muted-foreground max-w-sm mx-auto"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              As visits happen and moments are captured, they'll appear here
              as chapters of your loved one's living journal.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
