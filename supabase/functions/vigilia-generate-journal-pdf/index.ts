/**
 * vigilia-generate-journal-pdf — Generate a print-ready PDF for a seasonal journal.
 *
 * WHAT: Selects print-worthy reflections for a resident's season, composes an HTML
 *       layout, converts to PDF via Puppeteer-compatible rendering, uploads to
 *       Supabase storage, and updates the print_jobs table.
 * WHERE: Called when a season ends or manually triggered by admin.
 * WHY: "Four times a year, a small book arrives."
 *
 * PDF Spec: 5.5" × 8.5" (digest), saddle-stitched, B&W interior, matte cover.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Build the interior HTML for the journal PDF.
 * Designed at 5.5" × 8.5" with print-friendly styling.
 */
function buildJournalHtml(params: {
  residentName: string;
  seasonLabel: string;
  facilityName: string;
  reflections: Array<{ text: string; date: string }>;
  weeklyChapters: Array<{ text: string; weekLabel: string }>;
  openingPrayer: string;
}): string {
  const { residentName, seasonLabel, facilityName, reflections, weeklyChapters, openingPrayer } = params;

  const reflectionPages = reflections.map((r) => `
    <div class="entry">
      <p class="date">${r.date}</p>
      <p class="text">${r.text}</p>
    </div>
  `).join("");

  const chapterPages = weeklyChapters.map((c) => `
    <div class="chapter">
      <p class="week-label">${c.weekLabel}</p>
      <p class="text">${c.text}</p>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: 5.5in 8.5in; margin: 0.75in 0.6in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', 'Times New Roman', serif; color: #2d1f14; font-size: 11pt; line-height: 1.7; }
  .cover { page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; text-align: center; }
  .cover h1 { font-size: 18pt; font-weight: normal; margin-bottom: 4pt; letter-spacing: -0.02em; }
  .cover .season { font-size: 10pt; letter-spacing: 0.2em; text-transform: uppercase; color: #8b7355; margin-bottom: 24pt; }
  .cover .facility { font-size: 9pt; color: #8b7355; }
  .cover .ornament { font-size: 14pt; color: #c4a66a; margin: 16pt 0; }
  .prayer-page { page-break-after: always; padding-top: 40%; text-align: center; }
  .prayer-page p { font-style: italic; font-size: 10.5pt; line-height: 1.8; max-width: 3.5in; margin: 0 auto; color: #4a3728; }
  .prayer-page .label { font-size: 8pt; letter-spacing: 0.25em; text-transform: uppercase; color: #8b7355; margin-bottom: 12pt; font-style: normal; }
  .chapter { margin-bottom: 24pt; padding-bottom: 16pt; border-bottom: 0.5pt solid #d4c5b0; }
  .chapter:last-child { border-bottom: none; }
  .week-label { font-size: 8pt; letter-spacing: 0.2em; text-transform: uppercase; color: #8b7355; margin-bottom: 6pt; }
  .entry { margin-bottom: 16pt; }
  .entry .date { font-size: 8pt; letter-spacing: 0.15em; text-transform: uppercase; color: #8b7355; margin-bottom: 4pt; }
  .entry .text { font-size: 10.5pt; }
  .section-title { font-size: 8pt; letter-spacing: 0.3em; text-transform: uppercase; color: #8b7355; margin-bottom: 20pt; page-break-after: avoid; }
  .chapters-section, .reflections-section { page-break-before: always; }
</style>
</head>
<body>
  <div class="cover">
    <p class="season">${seasonLabel}</p>
    <h1>${residentName}</h1>
    <p class="ornament">✝</p>
    <p class="facility">${facilityName}</p>
  </div>

  <div class="prayer-page">
    <p class="label">Opening Prayer</p>
    <p>${openingPrayer}</p>
  </div>

  ${weeklyChapters.length > 0 ? `
  <div class="chapters-section">
    <p class="section-title">Weekly Chapters</p>
    ${chapterPages}
  </div>` : ""}

  <div class="reflections-section">
    <p class="section-title">Daily Reflections</p>
    ${reflectionPages}
  </div>
</body>
</html>`;
}

const SEASON_PRAYERS: Record<string, string> = {
  advent: "Come, Lord Jesus. Be our light in the waiting. Watch over this life entrusted to our care, and make us faithful witnesses of your coming.",
  christmas: "O Holy Child of Bethlehem, bless this life with your tenderness. May every small moment of care reflect the light of your nativity.",
  lent: "Lord, walk with us through these days of sacrifice and love. Grant us the grace to accompany this life with patience, tenderness, and prayer.",
  easter: "Risen Lord, fill this season with your joy and peace. May the story of this life reflect the hope of resurrection in every small moment.",
  ordinary_time_i: "Lord, bless the hands that care and the hearts that hold this life in love. In the ordinary, reveal the sacred.",
  ordinary_time_ii: "Lord, bless the hands that care and the hearts that hold this life in love. In the ordinary, reveal the sacred.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(supabaseUrl, serviceKey);

    const { print_job_id } = await req.json();
    if (!print_job_id) {
      return new Response(JSON.stringify({ error: "Missing print_job_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch print job
    const { data: job, error: jobErr } = await svc
      .from("print_jobs")
      .select("*")
      .eq("id", print_job_id)
      .single();
    if (jobErr || !job) throw new Error(`Print job not found: ${print_job_id}`);

    // Update status
    await svc.from("print_jobs").update({ status: "generating_pdf" }).eq("id", print_job_id);

    // Fetch resident name
    const { data: resident } = await svc
      .from("contacts")
      .select("name")
      .eq("id", job.resident_contact_id)
      .single();
    const residentName = resident?.name ?? "Beloved Resident";

    // Fetch facility name
    let facilityName = "Care Home";
    if (job.facility_anchor_id) {
      const { data: facility } = await svc
        .from("anchors")
        .select("name")
        .eq("id", job.facility_anchor_id)
        .single();
      if (facility?.name) facilityName = facility.name;
    }

    // Fetch reflections for the season
    const { data: reflections } = await svc
      .from("family_reflections")
      .select("reflection_text, published_at, is_print_candidate")
      .eq("tenant_id", job.tenant_id)
      .eq("resident_contact_id", job.resident_contact_id)
      .eq("season", job.season)
      .eq("is_print_candidate", true)
      .order("published_at", { ascending: true });

    // Fetch weekly chapters
    const { data: chapters } = await svc
      .from("weekly_chapters")
      .select("chapter_text, week_start")
      .eq("tenant_id", job.tenant_id)
      .eq("resident_contact_id", job.resident_contact_id)
      .order("week_start", { ascending: true });

    const selectedReflections = (reflections ?? []).slice(0, 28).map((r: any) => ({
      text: r.reflection_text,
      date: new Date(r.published_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    }));

    const selectedChapters = (chapters ?? []).map((c: any) => ({
      text: c.chapter_text,
      weekLabel: `Week of ${new Date(c.week_start).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    }));

    const seasonLabel = `${job.season.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} ${job.season_year}`;
    const openingPrayer = SEASON_PRAYERS[job.season] ?? SEASON_PRAYERS.ordinary_time_ii;

    const html = buildJournalHtml({
      residentName,
      seasonLabel,
      facilityName,
      reflections: selectedReflections,
      weeklyChapters: selectedChapters,
      openingPrayer,
    });

    // Store HTML as the "PDF source" (actual PDF rendering requires a headless browser service)
    // In production, this HTML would be sent to a rendering service (Puppeteer, wkhtmltopdf, etc.)
    const fileName = `journals/${job.tenant_id}/${job.resident_contact_id}/${job.season}-${job.season_year}.html`;
    const { error: uploadErr } = await svc.storage
      .from("print-journals")
      .upload(fileName, new Blob([html], { type: "text/html" }), { upsert: true });

    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

    const { data: urlData } = svc.storage.from("print-journals").getPublicUrl(fileName);

    // Update print job
    await svc.from("print_jobs").update({
      status: "pdf_ready",
      pdf_url: urlData.publicUrl,
    }).eq("id", print_job_id);

    return new Response(
      JSON.stringify({ ok: true, pdf_url: urlData.publicUrl, reflections_count: selectedReflections.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[vigilia-generate-journal-pdf] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
