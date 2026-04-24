/**
 * library-essay-pipeline — Automated Living Library pipeline (no n8n).
 *
 * WHAT: Fetches RSS items → generates NRI-voiced essay draft → enriches metadata → promotes to review → notifies gardener.
 * WHERE: Called daily via pg_cron. Zone: MACHINA.
 * WHY: Keeps the Living Library alive with monthly reflections, without manual operator intervention.
 *
 * Auth: Service-role key or N8N_SHARED_SECRET via X-Api-Key/Bearer.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

function jsonOk(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(status: number, code: string, message: string) {
  return new Response(
    JSON.stringify({ ok: false, error: code, message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function authenticateServiceRequest(req: Request): boolean {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const sharedSecret = Deno.env.get("N8N_SHARED_SECRET");

  const authHeader = req.headers.get("authorization") ?? "";
  const apiKeyHeader = req.headers.get("x-api-key") ?? "";

  if (authHeader.startsWith("Bearer ") && serviceRoleKey) {
    if (authHeader.slice(7).trim() === serviceRoleKey) return true;
  }

  let token = "";
  if (apiKeyHeader) token = apiKeyHeader.trim();
  else if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7).trim();

  if (!token) return false;
  if (sharedSecret && constantTimeCompare(token, sharedSecret)) return true;
  return false;
}

// ── Helpers ──

function extractText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, "s"));
  return match ? match[1].trim() : "";
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseRssItems(xml: string, limit = 10) {
  const items: Array<{ guid: string; title: string; link: string; summary: string; published_at: string | null }> = [];
  const itemMatches = xml.match(/<item[\s>].*?<\/item>/gs) || [];

  for (const itemXml of itemMatches.slice(0, limit)) {
    const title = extractText(itemXml, "title");
    const link = extractText(itemXml, "link");
    const guid = extractText(itemXml, "guid") || link || title;
    const pubDate = extractText(itemXml, "pubDate");
    const description = extractText(itemXml, "description");
    const content = extractText(itemXml, "content:encoded");

    if (!title || !guid) continue;
    items.push({
      guid,
      title: title.slice(0, 500),
      link: link.slice(0, 2000),
      summary: stripHtml(content || description).slice(0, 2000),
      published_at: pubDate ? new Date(pubDate).toISOString() : null,
    });
  }
  return items;
}

function generateSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  return `${base}-${Date.now().toString(36)}`;
}

function detectSector(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(parish|catholic|diocese|mass|liturgy|eucharist)\b/.test(lower)) return "catholic";
  if (/\b(church|worship|congregation|pastor|sermon)\b/.test(lower)) return "christian";
  if (/\b(ministry|mission|faith\s?based|spiritual)\b/.test(lower)) return "ministry";
  if (/\b(nonprofit|501\(c\)|grant|social\s?service|community\s?development)\b/.test(lower)) return "nonprofit";
  return "general";
}

function extractTopics(text: string): string[] {
  const topicMap: Record<string, RegExp> = {
    housing: /\b(housing|shelter|homelessness|rent|eviction)\b/i,
    food_security: /\b(food\s?(bank|pantry|security|insecurity)|hunger|meals)\b/i,
    education: /\b(education|school|literacy|tutoring|scholarship)\b/i,
    workforce: /\b(workforce|job\s?training|employment|career|hiring)\b/i,
    digital_inclusion: /\b(digital\s?(inclusion|literacy|equity|divide)|internet\s?access|broadband)\b/i,
    refugee_support: /\b(refugee|immigrant|asylum|resettlement|migration)\b/i,
    addiction_recovery: /\b(addiction|recovery|substance|sober|treatment)\b/i,
    healthcare: /\b(health\s?care|mental\s?health|clinic|wellness|therapy)\b/i,
    youth: /\b(youth|teen|young\s?people|after\s?school|mentoring)\b/i,
    elderly_care: /\b(elderly|senior|aging|retirement|caregiver)\b/i,
  };

  const found: string[] = [];
  for (const [topic, re] of Object.entries(topicMap)) {
    if (re.test(text)) found.push(topic);
  }
  return found.slice(0, 5);
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction: frequent meaningful words
  const stops = new Set(["the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "has", "have", "from", "they", "been", "said", "each", "she", "which", "their", "will", "way", "about", "many", "then", "them", "would", "like", "into", "more", "some", "that", "this", "with"]);
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 3 && !stops.has(w));
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
}

// ── Main ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonError(405, "METHOD_NOT_ALLOWED", "POST only");
  if (!authenticateServiceRequest(req)) return jsonError(401, "UNAUTHORIZED", "Invalid auth");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty */ }
  const maxEssays = Math.min(Number(body.max_essays) || 3, 5);
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM

  console.log(`[library-essay-pipeline] starting, month=${monthKey}, max=${maxEssays}`);

  // Step 1: Fetch RSS items not yet converted to library essays
  const { data: sources } = await admin.from("operator_rss_sources").select("id, name, url, category").eq("enabled", true).limit(20);
  if (!sources?.length) return jsonOk({ ok: true, message: "No RSS sources configured", essays_created: 0 });

  const allItems: Array<{ title: string; summary: string; link: string; category: string }> = [];

  for (const source of sources) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(source.url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;

      const xml = await res.text();
      const items = parseRssItems(xml, 5);
      for (const item of items) {
        allItems.push({ ...item, category: source.category || "general" });
      }
    } catch (e) {
      console.error(`[library-essay-pipeline] RSS fetch error ${source.name}:`, e);
    }
  }

  if (!allItems.length) return jsonOk({ ok: true, message: "No new RSS items found", essays_created: 0 });

  // Dedupe against existing essays by checking slugs/titles from this month
  const { data: existingEssays } = await admin.from("library_essays")
    .select("title")
    .eq("month_key", monthKey)
    .eq("source_type", "rss");

  const existingTitles = new Set((existingEssays || []).map((e: any) => e.title?.toLowerCase()));
  const freshItems = allItems.filter(item => !existingTitles.has(item.title.toLowerCase()));

  if (!freshItems.length) return jsonOk({ ok: true, message: "All RSS items already processed", essays_created: 0 });

  // Group items by category for batch drafts (max N essays)
  const grouped: Record<string, typeof freshItems> = {};
  for (const item of freshItems) {
    const key = item.category || "general";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  const essayResults: Array<{ title: string; status: string; id?: string; error?: string }> = [];
  let essaysCreated = 0;

  for (const [category, items] of Object.entries(grouped)) {
    if (essaysCreated >= maxEssays) break;

    const articleContext = items.slice(0, 4).map((item, i) =>
      `Article ${i + 1}: "${item.title}"\n${item.summary.slice(0, 400)}\nSource: ${item.link}`
    ).join("\n\n");

    let generatedBody = "";
    let title = "";

    if (LOVABLE_API_KEY) {
      // Step 2: NRI AI voice pass
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are NRI (Narrative Relational Intelligence), the narrative voice of CROS.

You write calm, reflective essays that weave recent community news into gentle narrative.

RULES:
- Never mention "NRI", "CROS", "the system", or any platform name
- Never use marketing language, CTAs, or listicle formatting
- Ignatian cadence: Noticing → Reflection → What Some Are Discovering → Quiet Pattern → Gentle Invitation
- Include concrete imagery (kitchens, hands, doorways, shared meals)
- Keep under 600 words
- Output as markdown (# for title, ## for sections, > for closing questions)
- Title must be evocative and specific, never generic
- Never reference specific organization names from the sources
- End with 2-3 gentle questions in blockquotes`
              },
              {
                role: "user",
                content: `Write a reflective essay based on these recent articles in the "${category}" space:\n\n${articleContext}`
              },
            ],
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (aiResp.ok) {
          const aiResult = await aiResp.json();
          generatedBody = aiResult.choices?.[0]?.message?.content || "";
          // Extract title from first markdown heading
          const titleMatch = generatedBody.match(/^#\s+(.+)$/m);
          if (titleMatch) {
            title = titleMatch[1].trim();
            generatedBody = generatedBody.replace(/^#\s+.+\n+/, ""); // Remove title from body
          }
        } else {
          console.error(`[library-essay-pipeline] AI error: ${aiResp.status}`);
        }
      } catch (e) {
        console.error("[library-essay-pipeline] AI generation error:", e);
      }
    }

    // Fallback if AI unavailable
    if (!generatedBody) {
      title = `${category} — Reflections from ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
      generatedBody = items.slice(0, 3).map(item =>
        `## ${item.title}\n\n${item.summary.slice(0, 300)}\n\n[Source](${item.link})`
      ).join("\n\n---\n\n");
    }

    if (!title) title = `Community Reflections — ${category}`;
    if (title.length > 120) title = title.slice(0, 117) + "...";

    const slug = generateSlug(title);
    const fullText = `${title} ${generatedBody}`;
    const sector = detectSector(fullText);
    const topics = extractTopics(fullText);
    const keywords = extractKeywords(fullText);
    const excerpt = generatedBody.replace(/[#>*_\[\]()]/g, "").slice(0, 200).trim() + "...";

    // Step 3: Insert into library_essays
    const { data: essay, error: insertErr } = await admin.from("library_essays").insert({
      title,
      slug,
      month_key: monthKey,
      sector,
      source_type: "rss",
      voice_profile: "cros_default",
      content_markdown: generatedBody,
      excerpt,
      seo_title: title.slice(0, 60),
      seo_description: excerpt.slice(0, 155),
      tags: topics,
      citations: items.slice(0, 4).map(i => ({ title: i.title, url: i.link })),
      generated_by: "NRI",
      meta_robots: "noindex,nofollow",
      status: "draft",
    }).select("id, title").single();

    if (insertErr) {
      console.error("[library-essay-pipeline] insert error:", insertErr);
      essayResults.push({ title, status: "error", error: insertErr.message });
      continue;
    }

    // Step 4: Enrich metadata in library_essay_signals
    await admin.from("library_essay_signals").insert({
      essay_id: essay.id,
      archetype_key: null,
      enrichment_keywords: keywords,
      communio_opt_in: false,
      communio_profile_strength: 0,
      discovery_topics: topics,
      relational_lens_notes: `Woven from ${items.length} community signals in the ${category} space.`,
    });

    // Step 5: Check if essay qualifies for promotion
    const hasRequiredFields = title && excerpt && generatedBody.length > 100;
    const hasNoAggressiveLanguage = !/\b(buy|subscribe|sign up|act now|limited time|don't miss)\b/i.test(generatedBody);

    if (hasRequiredFields && hasNoAggressiveLanguage) {
      await admin.from("library_essays")
        .update({ status: "ready_for_review" })
        .eq("id", essay.id);

      // Step 6: Notify gardener
      const dedupeKey = `essay_ready:${essay.id}:${monthKey}`;
      await admin.from("gardener_insights").insert({
        type: "essay_ready",
        severity: "low",
        title: "A draft is ready for your touch",
        body: `"${title}" has been prepared from recent community signals. It's waiting for your review and gentle guidance before sharing with the world.`,
        suggested_next_steps: [{ label: "Review draft", url: `/operator/nexus/content` }],
        related_links: [],
        source_refs: { essay_id: essay.id, month_key: monthKey },
        dedupe_key: dedupeKey,
      }).then(({ error }) => {
        if (error?.code === "23505") console.log("[library-essay-pipeline] insight already exists (dedupe)");
        else if (error) console.error("[library-essay-pipeline] insight error:", error);
      });
    }

    essaysCreated++;
    essayResults.push({ title, status: hasRequiredFields ? "ready_for_review" : "draft", id: essay.id });
  }

  console.log(`[library-essay-pipeline] complete: ${essaysCreated} essays created`);
  return jsonOk({ ok: true, essays_created: essaysCreated, results: essayResults, month_key: monthKey });
});
