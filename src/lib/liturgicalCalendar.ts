/**
 * liturgicalCalendar — Compute the current liturgical season from a date.
 *
 * WHAT: Determines which season of the Church year a given date falls in.
 * WHERE: Used by voice prompts (liturgical affinity), family reflections,
 *        printed journals, and season-based organization throughout Vigilia.
 * WHY: Everything in Vigilia is organized by Church year, not calendar months.
 *      The liturgical calendar shapes the prompts, the reflections, and the journals.
 *
 * Seasons: Advent, Christmas, Ordinary Time I, Lent, Easter, Ordinary Time II
 * Easter calculation uses the Anonymous Gregorian algorithm.
 */

export type LiturgicalSeason =
  | 'advent'
  | 'christmas'
  | 'ordinary_time_i'
  | 'lent'
  | 'easter'
  | 'ordinary_time_ii';

export interface SeasonInfo {
  season: LiturgicalSeason;
  label: string;
  shortLabel: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

const SEASON_META: Record<LiturgicalSeason, { label: string; shortLabel: string; description: string }> = {
  advent: {
    label: 'Advent',
    shortLabel: 'Advent',
    description: 'A season of waiting, longing, and preparation.',
  },
  christmas: {
    label: 'Christmas',
    shortLabel: 'Christmas',
    description: 'Joy, visitation, song, family, and tenderness.',
  },
  ordinary_time_i: {
    label: 'Ordinary Time',
    shortLabel: 'Ordinary Time',
    description: 'Faithfulness, small virtues, ministry, and presence.',
  },
  lent: {
    label: 'Lent',
    shortLabel: 'Lent',
    description: 'Sacrifice, willingness, quiet suffering, and solidarity with Christ.',
  },
  easter: {
    label: 'Easter',
    shortLabel: 'Easter',
    description: 'Joy, resurrection, new life, and reconciliation.',
  },
  ordinary_time_ii: {
    label: 'Ordinary Time',
    shortLabel: 'Ordinary Time',
    description: 'Faithfulness, small virtues, ministry, and presence.',
  },
};

/**
 * Compute Easter Sunday for a given year (Anonymous Gregorian algorithm).
 */
function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Compute all liturgical season boundaries for a given liturgical year.
 * A liturgical year starts on the first Sunday of Advent (late Nov/early Dec)
 * and runs through the Saturday before the next Advent.
 */
function computeSeasonBoundaries(year: number) {
  const easter = computeEaster(year);

  // Ash Wednesday = Easter - 46 days
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(ashWednesday.getDate() - 46);

  // Pentecost = Easter + 49 days
  const pentecost = new Date(easter);
  pentecost.setDate(pentecost.getDate() + 49);

  // Advent starts 4 Sundays before Christmas
  // Find Dec 25, then find the Sunday on or before Nov 30
  const christmas = new Date(year, 11, 25); // Dec 25
  const adventStart = new Date(year, 10, 27); // Nov 27 earliest possible
  while (adventStart.getDay() !== 0) {
    adventStart.setDate(adventStart.getDate() + 1);
  }
  // Adjust: Advent is the Sunday closest to Nov 30
  // Actually: first Sunday of Advent = Sunday falling on or nearest to Nov 30
  const nov30 = new Date(year, 10, 30);
  const dayOfWeek = nov30.getDay();
  const firstAdventSunday = new Date(nov30);
  if (dayOfWeek === 0) {
    // Nov 30 is Sunday
  } else if (dayOfWeek <= 3) {
    // Go back to previous Sunday
    firstAdventSunday.setDate(firstAdventSunday.getDate() - dayOfWeek);
  } else {
    // Go forward to next Sunday
    firstAdventSunday.setDate(firstAdventSunday.getDate() + (7 - dayOfWeek));
  }

  // Baptism of the Lord = Sunday after Jan 6 (or Jan 7 if Jan 6 is Sunday)
  const jan6 = new Date(year, 0, 6);
  const baptismOfLord = new Date(jan6);
  if (jan6.getDay() === 0) {
    baptismOfLord.setDate(baptismOfLord.getDate() + 1); // Monday after
  } else {
    // Next Sunday after Jan 6
    baptismOfLord.setDate(baptismOfLord.getDate() + (7 - jan6.getDay()));
  }

  return {
    adventStart: firstAdventSunday,
    christmasStart: christmas,
    ordinaryTimeIStart: new Date(baptismOfLord.getTime() + 86400000), // day after Baptism
    lentStart: ashWednesday,
    easterStart: easter,
    ordinaryTimeIIStart: new Date(pentecost.getTime() + 86400000), // day after Pentecost
    nextAdventStart: (() => {
      const nextNov30 = new Date(year + 1, 10, 30);
      const d = nextNov30.getDay();
      const s = new Date(nextNov30);
      if (d === 0) return s;
      if (d <= 3) { s.setDate(s.getDate() - d); return s; }
      s.setDate(s.getDate() + (7 - d));
      return s;
    })(),
  };
}

/**
 * Get the current liturgical season for a given date.
 */
export function getCurrentSeason(date: Date = new Date()): SeasonInfo {
  const year = date.getFullYear();

  // We may need to check boundaries for both this year and last year
  // (Advent of previous year extends into January)
  for (const checkYear of [year, year - 1]) {
    const b = computeSeasonBoundaries(checkYear);

    const seasons: { season: LiturgicalSeason; start: Date; end: Date }[] = [
      { season: 'advent', start: b.adventStart, end: new Date(b.christmasStart.getTime() - 86400000) },
      { season: 'christmas', start: b.christmasStart, end: new Date(b.ordinaryTimeIStart.getTime() - 86400000) },
      { season: 'ordinary_time_i', start: b.ordinaryTimeIStart, end: new Date(b.lentStart.getTime() - 86400000) },
      { season: 'lent', start: b.lentStart, end: new Date(b.easterStart.getTime() - 86400000) },
      { season: 'easter', start: b.easterStart, end: new Date(b.ordinaryTimeIIStart.getTime() - 86400000) },
      { season: 'ordinary_time_ii', start: b.ordinaryTimeIIStart, end: new Date(b.nextAdventStart.getTime() - 86400000) },
    ];

    for (const s of seasons) {
      if (date >= s.start && date <= s.end) {
        const meta = SEASON_META[s.season];
        return {
          season: s.season,
          ...meta,
          startDate: s.start,
          endDate: s.end,
        };
      }
    }
  }

  // Fallback (should never reach here)
  const meta = SEASON_META.ordinary_time_ii;
  return {
    season: 'ordinary_time_ii',
    ...meta,
    startDate: new Date(),
    endDate: new Date(),
  };
}

/**
 * Get a human-readable label for the current season + year.
 * e.g., "Easter 2026" or "Ordinary Time, Summer 2026"
 */
export function getSeasonLabel(date: Date = new Date()): string {
  const info = getCurrentSeason(date);
  const year = date.getFullYear();
  return `${info.label} ${year}`;
}

/**
 * Get the date range string for the current season.
 */
export function getSeasonDateRange(date: Date = new Date()): string {
  const info = getCurrentSeason(date);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(info.startDate)} – ${fmt(info.endDate)}, ${info.endDate.getFullYear()}`;
}

/**
 * Get all print seasons for a year (the 4 volumes that get printed).
 */
export function getPrintSeasons(year: number): { season: LiturgicalSeason; label: string }[] {
  return [
    { season: 'advent', label: `Advent ${year}` },
    { season: 'lent', label: `Lent ${year}` },
    { season: 'easter', label: `Easter ${year}` },
    { season: 'ordinary_time_ii', label: `Ordinary Time ${year}` },
  ];
}
