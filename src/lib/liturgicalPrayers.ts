/**
 * liturgicalPrayers — Opening prayers for each liturgical season.
 *
 * WHAT: Traditional Catholic prayers/collects used as the opening page
 *       of each seasonal printed journal.
 * WHERE: Used by journalPdf.ts when generating the print-ready booklet.
 * WHY: "A well-known opening prayer for each season, followed by all the
 *       printed memories, in chronological order from the previous season."
 */

import type { LiturgicalSeason } from './liturgicalCalendar';

export interface SeasonalPrayer {
  season: LiturgicalSeason;
  title: string;
  prayer: string;
  attribution: string;
}

export const SEASONAL_PRAYERS: Record<LiturgicalSeason, SeasonalPrayer> = {
  advent: {
    season: 'advent',
    title: 'An Advent Prayer',
    prayer: `Come, Lord Jesus.\nIn our waiting, be our hope.\nIn our watching, be our light.\nIn our longing, be our peace.\nPrepare our hearts to receive you\nas you come to us in the quiet,\nin the stranger, and in the beloved.\nCome, Lord Jesus. Come.`,
    attribution: 'Traditional Advent prayer',
  },
  christmas: {
    season: 'christmas',
    title: 'A Christmas Prayer',
    prayer: `Lord of all gentleness,\nyou came to us as a child\nso that we might learn to see\nyour face in every face.\nGrant us the grace to find you\nin the small and the ordinary,\nin the tender and the tired,\nin every act of presence and love.\nGlory to God in the highest,\nand peace to all who keep watch.`,
    attribution: 'Inspired by the Christmas liturgy',
  },
  ordinary_time_i: {
    season: 'ordinary_time_i',
    title: 'A Prayer for Ordinary Time',
    prayer: `Lord, teach us to be present.\nIn the ordinary rhythm of these days,\nhelp us to see what matters:\na hand held, a prayer whispered,\na moment of laughter, a quiet sigh.\nMay we notice what the charts cannot hold\nand remember what the world too quickly forgets.\nGrant us faithful attention\nand the grace to witness well.`,
    attribution: 'Inspired by the Ignatian tradition',
  },
  lent: {
    season: 'lent',
    title: 'A Lenten Prayer',
    prayer: `God of mercy,\nin this season of turning,\ngrant us eyes to see\nthe hidden suffering,\nthe unspoken need,\nthe quiet courage\nof those entrusted to our care.\nTeach us the discipline of attention\nand the tenderness of accompaniment.\nMay our small acts of witness\nbecome offerings of love.`,
    attribution: 'Inspired by the Lenten liturgy',
  },
  easter: {
    season: 'easter',
    title: 'An Easter Prayer',
    prayer: `Risen Lord,\nyou turned mourning into joy\nand absence into presence.\nIn this season of resurrection,\nhelp us to see new life\nin the smallest moments:\na smile returned, a name remembered,\na prayer answered in silence.\nMay the light of Easter\nshine in every room we enter\nand every story we carry.`,
    attribution: 'Inspired by the Easter liturgy',
  },
  ordinary_time_ii: {
    season: 'ordinary_time_ii',
    title: 'A Prayer for Ordinary Time',
    prayer: `Lord of all seasons,\nwe offer you these ordinary days.\nEach visit, each voice note,\neach moment of attention\nis a small prayer\nthat this life matters,\nthat this person is seen,\nthat love keeps watch\neven when no one is looking.\nBless the hands that serve\nand the hearts that remember.`,
    attribution: 'Inspired by the Ignatian tradition',
  },
};

export function getPrayerForSeason(season: LiturgicalSeason): SeasonalPrayer {
  return SEASONAL_PRAYERS[season];
}
