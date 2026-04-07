/**
 * familyDigest — Compose weekly family digest content for a resident.
 *
 * "Families don't log into apps. The story needs to come to them."
 */

import { supabase } from '@/integrations/supabase/client';
import { getCurrentSeason, getSeasonLabel } from '@/lib/liturgicalCalendar';
import type { MoodObserved } from '@/types/vigilia';

export interface DigestContent {
  residentName: string;
  seasonLabel: string;
  weekLabel: string;
  reflections: Array<{ date: string; text: string }>;
  moodSummary: string;
  chapterText: string | null;
  closingPrayer: string;
}

const SEASON_PRAYERS: Record<string, string> = {
  advent: 'Come, Lord Jesus. Be our light in the waiting.',
  christmas: 'O Holy Child, bless this family with your joy and peace.',
  lent: 'Lord, walk with us through these days of sacrifice and love.',
  easter: 'Risen Lord, fill this season with your joy and peace.',
  ordinary_time_i: 'Lord, bless the hands that care and the hearts that hold this life in love.',
  ordinary_time_ii: 'Lord, bless the hands that care and the hearts that hold this life in love.',
};

function computeMoodSummary(moods: MoodObserved[]): string {
  if (moods.length === 0) return 'A quiet week.';
  const counts: Record<string, number> = {};
  for (const m of moods) counts[m] = (counts[m] || 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0].replace(/_/g, ' ');
  const secondary = sorted[1]?.[0]?.replace(/_/g, ' ');
  if (secondary && sorted[1][1] > 1) {
    return `A ${primary} week with moments of ${secondary}.`;
  }
  return `A ${primary} week.`;
}

export async function composeFamilyDigest(params: {
  tenantId: string;
  residentContactId: string;
  residentName: string;
  weekStart: string;
}): Promise<DigestContent | null> {
  const { tenantId, residentContactId, residentName, weekStart } = params;

  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const weekLabel = `Week of ${start.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
  const season = getCurrentSeason(start);

  // Fetch reflections and visits in parallel
  const [reflectionsRes, visitsRes, chaptersRes] = await Promise.all([
    supabase
      .from('family_reflections')
      .select('reflection_text, published_at')
      .eq('tenant_id', tenantId)
      .eq('resident_contact_id', residentContactId)
      .gte('published_at', start.toISOString())
      .lte('published_at', end.toISOString())
      .order('published_at', { ascending: true })
      .limit(7),
    supabase
      .from('visit_rituals')
      .select('mood_observed')
      .eq('tenant_id', tenantId)
      .eq('resident_contact_id', residentContactId)
      .gte('visited_at', start.toISOString())
      .lte('visited_at', end.toISOString()),
    supabase
      .from('weekly_chapters')
      .select('chapter_text')
      .eq('tenant_id', tenantId)
      .eq('resident_contact_id', residentContactId)
      .eq('week_start', weekStart)
      .maybeSingle(),
  ]);

  const reflections = (reflectionsRes.data ?? [])
    .filter((r) => r.reflection_text)
    .map((r) => ({
      date: new Date(r.published_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      text: r.reflection_text!,
    }));

  if (reflections.length === 0) return null;

  const moods = (visitsRes.data ?? []).map((v) => v.mood_observed as MoodObserved);
  const moodSummary = computeMoodSummary(moods);
  const chapterText = chaptersRes.data?.chapter_text ?? null;
  const closingPrayer = SEASON_PRAYERS[season.season] ?? SEASON_PRAYERS.ordinary_time_ii;

  return {
    residentName,
    seasonLabel: getSeasonLabel(start),
    weekLabel,
    reflections: reflections.slice(0, 3),
    moodSummary,
    chapterText,
    closingPrayer,
  };
}
