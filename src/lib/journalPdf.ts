/**
 * journalPdf — Generate print-ready PDF for seasonal liturgical journals.
 *
 * WHAT: Creates a 5.5"×8.5" saddle-stitched booklet PDF with:
 *       cover → seasonal prayer → chronological reflections → journaling pages → back cover
 * WHERE: Called when a season ends to generate the PDF for Lulu printing.
 * WHY: "Four times a year, your family receives a small printed journal of the
 *       season's memories, anchored by the Church's prayers."
 *
 * Spec (from Perplexity thread):
 *   - Trim: 5.5" × 8.5" (digest/half-page)
 *   - Binding: Saddle stitch
 *   - Interior: B&W, matte
 *   - Pages: 24-30 (multiples of 4)
 *   - No photos, no color, no spine
 */

import jsPDF from 'jspdf';
import { getPrayerForSeason } from './liturgicalPrayers';
import { getSeasonLabel } from './liturgicalCalendar';
import type { LiturgicalSeason } from './liturgicalCalendar';

interface JournalReflection {
  date: string;
  text: string;
}

interface JournalConfig {
  residentName: string;
  facilityName: string;
  season: LiturgicalSeason;
  seasonYear: number;
  reflections: JournalReflection[];
}

// Page dimensions in points (5.5" × 8.5")
const PAGE_W = 5.5 * 72; // 396pt
const PAGE_H = 8.5 * 72; // 612pt
const MARGIN = 54; // 0.75" margins
const CONTENT_W = PAGE_W - 2 * MARGIN;

/**
 * Generate the seasonal journal PDF.
 * Returns a Blob suitable for upload to Lulu API.
 */
export function generateJournalPdf(config: JournalConfig): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [PAGE_W, PAGE_H],
  });

  const prayer = getPrayerForSeason(config.season);
  const seasonLabel = `${prayer.title.replace('A ', '').replace('An ', '').replace(' Prayer', '')} ${config.seasonYear}`;

  // ── Front Cover ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text(config.facilityName, PAGE_W / 2, PAGE_H / 2 - 60, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text(config.residentName, PAGE_W / 2, PAGE_H / 2 - 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text(seasonLabel, PAGE_W / 2, PAGE_H / 2 + 20, { align: 'center' });

  // ── Inside Front Cover (blank with tagline) ──
  doc.addPage();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('A liturgy of attention.', PAGE_W / 2, PAGE_H - MARGIN, { align: 'center' });

  // ── Page 1: Seasonal Prayer ──
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(prayer.title, MARGIN, MARGIN + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  const prayerLines = doc.splitTextToSize(prayer.prayer, CONTENT_W);
  doc.text(prayerLines, MARGIN, MARGIN + 50);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const prayerEndY = MARGIN + 50 + prayerLines.length * 14 + 20;
  doc.text(`— ${prayer.attribution}`, MARGIN, prayerEndY);

  // ── Pages 2-19ish: Reflections ──
  let currentY = 0;
  let needNewPage = true;

  for (const reflection of config.reflections) {
    if (needNewPage) {
      doc.addPage();
      currentY = MARGIN + 20;
      needNewPage = false;
    }

    // Date header
    const dateStr = new Date(reflection.date).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text(dateStr, MARGIN, currentY);
    currentY += 16;

    // Reflection text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(reflection.text, CONTENT_W);
    const blockHeight = lines.length * 14;

    // Check if we need a new page
    if (currentY + blockHeight > PAGE_H - MARGIN - 40) {
      doc.addPage();
      currentY = MARGIN + 20;
    }

    doc.text(lines, MARGIN, currentY);
    currentY += blockHeight + 30; // generous spacing between entries

    // Check if near bottom
    if (currentY > PAGE_H - MARGIN - 60) {
      needNewPage = true;
    }
  }

  // ── Journaling Pages (2-3 pages with gentle prompts) ──
  const journalingPrompts = [
    'What do you want to remember from this season?',
    'What would you like to carry into the next?',
    'A prayer, a thought, a memory you want to keep.',
  ];

  for (const prompt of journalingPrompts) {
    doc.addPage();
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(160, 160, 160);
    doc.text(prompt, MARGIN, PAGE_H - MARGIN);

    // Light ruled lines for writing
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    for (let y = MARGIN + 30; y < PAGE_H - MARGIN - 20; y += 28) {
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    }
  }

  // ── Back Cover ──
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(180, 180, 180);
  doc.text('V', PAGE_W / 2, PAGE_H / 2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text('vigilia.care', PAGE_W / 2, PAGE_H / 2 + 20, { align: 'center' });

  // Pad to multiple of 4 pages (required for saddle stitch)
  const totalPages = doc.getNumberOfPages();
  const remainder = totalPages % 4;
  if (remainder !== 0) {
    const pagesNeeded = 4 - remainder;
    for (let i = 0; i < pagesNeeded; i++) {
      doc.addPage();
    }
  }

  return doc.output('blob');
}
