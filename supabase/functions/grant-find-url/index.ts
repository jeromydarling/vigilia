import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Resource extraction helpers ──

interface ExtractedResource {
  resource_type: string; // 'download', 'link', 'date'
  label: string;
  url?: string;
  resource_date?: string;
  resource_date_end?: string;
  description?: string;
}

function extractDownloads(links: string[], markdown: string): ExtractedResource[] {
  const resources: ExtractedResource[] = [];
  const seen = new Set<string>();

  // From links array: find PDFs, DOCs, XLS
  const docPattern = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|zip)(\?.*)?$/i;
  for (const link of links) {
    if (docPattern.test(link) && !seen.has(link)) {
      seen.add(link);
      const fileName = decodeURIComponent(link.split('/').pop()?.split('?')[0] || 'Document');
      resources.push({
        resource_type: 'download',
        label: fileName,
        url: link,
      });
    }
  }

  // From markdown: find linked documents [label](url.pdf)
  const mdDocRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+\.(?:pdf|doc|docx|xls|xlsx|ppt|pptx|csv|zip)(?:\?[^)]*)?)\)/gi;
  let m;
  while ((m = mdDocRegex.exec(markdown)) !== null) {
    if (!seen.has(m[2])) {
      seen.add(m[2]);
      resources.push({
        resource_type: 'download',
        label: m[1].trim(),
        url: m[2],
      });
    }
  }

  return resources;
}

function extractResourceLinks(links: string[], markdown: string, sourceUrl: string): ExtractedResource[] {
  const resources: ExtractedResource[] = [];
  const seen = new Set<string>();
  seen.add(sourceUrl);

  // Patterns for useful grant resource pages
  const resourcePatterns = /faq|eligib|guideline|requirement|instruction|webinar|info.?session|workshop|training|resource|toolkit|template|sample|example/i;

  for (const link of links) {
    if (resourcePatterns.test(link) && !seen.has(link)) {
      seen.add(link);
      // Derive label from URL path
      const pathPart = new URL(link).pathname.split('/').filter(Boolean).pop() || 'Resource';
      const label = pathPart.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
      resources.push({
        resource_type: 'link',
        label: label.charAt(0).toUpperCase() + label.slice(1),
        url: link,
      });
    }
  }

  // From markdown links with resource-like text
  const mdResourceRegex = /\[([^\]]*(?:FAQ|eligib|guideline|requirement|instruction|webinar|info.?session|workshop|training|resource|toolkit|template|sample|example)[^\]]*)\]\((https?:\/\/[^)]+)\)/gi;
  let m;
  while ((m = mdResourceRegex.exec(markdown)) !== null) {
    if (!seen.has(m[2])) {
      seen.add(m[2]);
      resources.push({
        resource_type: 'link',
        label: m[1].trim(),
        url: m[2],
      });
    }
  }

  return resources;
}

function extractDates(markdown: string): ExtractedResource[] {
  const resources: ExtractedResource[] = [];
  const seen = new Set<string>();

  // Common grant date patterns: "Deadline: Month DD, YYYY" or "Due: MM/DD/YYYY"
  const dateLabels = [
    { pattern: /(?:application|submission|proposal)\s+deadline[:\s]*([A-Z][a-z]+ \d{1,2},?\s*\d{4})/gi, label: 'Application Deadline' },
    { pattern: /(?:letter of intent|LOI)\s+(?:deadline|due)[:\s]*([A-Z][a-z]+ \d{1,2},?\s*\d{4})/gi, label: 'LOI Deadline' },
    { pattern: /(?:info(?:rmation)?\s+session|webinar)[:\s]*([A-Z][a-z]+ \d{1,2},?\s*\d{4})/gi, label: 'Information Session' },
    { pattern: /(?:award|notification|announcement)\s+(?:date|by)[:\s]*([A-Z][a-z]+ \d{1,2},?\s*\d{4})/gi, label: 'Award Notification' },
    { pattern: /(?:grant\s+)?(?:start|begin(?:ning)?)\s+date[:\s]*([A-Z][a-z]+ \d{1,2},?\s*\d{4})/gi, label: 'Grant Start Date' },
    { pattern: /(?:grant\s+)?(?:end|closing)\s+date[:\s]*([A-Z][a-z]+ \d{1,2},?\s*\d{4})/gi, label: 'Grant End Date' },
    { pattern: /(?:due\s+(?:date|by)|deadline)[:\s]*([A-Z][a-z]+ \d{1,2},?\s*\d{4})/gi, label: 'Deadline' },
    { pattern: /(?:close(?:s|d)?|open(?:s)?)\s+(?:on\s+)?([A-Z][a-z]+ \d{1,2},?\s*\d{4})/gi, label: 'Important Date' },
    // Also handle MM/DD/YYYY format
    { pattern: /(?:application|submission|proposal)\s+deadline[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/gi, label: 'Application Deadline' },
    { pattern: /(?:due\s+(?:date|by)|deadline)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/gi, label: 'Deadline' },
  ];

  for (const { pattern, label } of dateLabels) {
    let m;
    while ((m = pattern.exec(markdown)) !== null) {
      const dateStr = m[1].trim();
      const key = `${label}:${dateStr}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Parse to ISO date
      let isoDate: string | undefined;
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          isoDate = d.toISOString().split('T')[0];
        }
      } catch { /* ignore */ }

      resources.push({
        resource_type: 'date',
        label,
        resource_date: isoDate,
        description: dateStr,
      });
    }
  }

  return resources;
}

// ── Funding extraction helpers ──

function parseFundingFromMarkdown(markdown: string): { maxAward: number | null; totalProgramFunding: number | null } {
  let maxAward: number | null = null;
  let totalProgramFunding: number | null = null;

  const upToRegex = /(?:up\s+to|maximum\s+(?:of\s+)?|not\s+(?:to\s+)?exceed|awards?\s+(?:of\s+)?up\s+to|grant\s+amounts?\s+(?:will\s+be\s+)?up\s+to)\s*\$\s*([\d,]+(?:\.\d+)?)\s*(million|billion|mil|bil|m|b)?/gi;
  const upToMatches: number[] = [];
  let um;
  while ((um = upToRegex.exec(markdown)) !== null) {
    let val = parseFloat(um[1].replace(/,/g, ""));
    const suffix = (um[2] || "").toLowerCase();
    if (suffix.startsWith("b")) val *= 1_000_000_000;
    else if (suffix.startsWith("m")) val *= 1_000_000;
    if (isFinite(val) && val > 0) upToMatches.push(val);
  }
  if (upToMatches.length > 0) {
    maxAward = Math.min(...upToMatches);
  }

  const availRegex = /(?:approximately\s+)?\$\s*([\d,]+(?:\.\d+)?)\s*(million|billion|mil|bil|m|b)?\s*(?:is\s+)?(?:available|in\s+(?:total|funding))/gi;
  let av;
  while ((av = availRegex.exec(markdown)) !== null) {
    let val = parseFloat(av[1].replace(/,/g, ""));
    const suffix = (av[2] || "").toLowerCase();
    if (suffix.startsWith("b")) val *= 1_000_000_000;
    else if (suffix.startsWith("m")) val *= 1_000_000;
    if (isFinite(val) && val > 0) {
      totalProgramFunding = val;
      break;
    }
  }

  return { maxAward, totalProgramFunding };
}

// ── Main handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser(token);
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { grant_id, grant_name, funder_name } = await req.json();

    if (!grant_id || !grant_name) {
      return new Response(
        JSON.stringify({ ok: false, error: "grant_id and grant_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Perplexity not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build search query
    const searchQuery = funder_name
      ? `${grant_name} ${funder_name} grant application`
      : `${grant_name} grant application`;

    console.log(`Searching for grant URL: "${searchQuery}"`);

    const searchResp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a grant research assistant. Find the official grant page URL, application URL, and key details. Return as JSON." },
          { role: "user", content: `Find the official webpage for this grant: ${searchQuery}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "grant_search",
            schema: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      url: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["url", "title"],
                  },
                },
              },
              required: ["results"],
            },
          },
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!searchResp.ok) {
      const errText = await searchResp.text();
      console.error("Perplexity search failed:", searchResp.status, errText);
      return new Response(
        JSON.stringify({ ok: false, error: `Search failed (${searchResp.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const searchData = await searchResp.json();
    const content = searchData.choices?.[0]?.message?.content;
    const citations = searchData.citations ?? [];
    let results: Array<{ url: string; title: string; description?: string }> = [];
    try {
      const parsed = JSON.parse(content);
      results = parsed.results ?? [];
    } catch {
      // Fall back to citations if JSON parsing fails
      results = citations.map((c: string, i: number) => ({ url: c, title: `Result ${i + 1}` }));
    }

    if (!results.length) {
      return new Response(
        JSON.stringify({ ok: true, found: false, message: "No results found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const bestResult = results[0];
    const foundUrl = bestResult.url;

    if (!foundUrl) {
      return new Response(
        JSON.stringify({ ok: true, found: false, message: "No usable URL in results" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Found URL for grant ${grant_id}: ${foundUrl}`);

    // Look for an application link among search results
    const applyPatterns = /apply|application|submit|proposal|how.to.apply|rfp|rfa|solicitation/i;
    let applicationUrl: string | null = null;
    for (const r of results) {
      if (r.url && applyPatterns.test(r.url)) { applicationUrl = r.url; break; }
      if (r.url && r.title && applyPatterns.test(r.title)) { applicationUrl = r.url; break; }
    }

    // Deep-research the grant page via Perplexity for details
    let scrapedMarkdown = "";
    const scrapedLinks: string[] = [];

    try {
      console.log(`Researching grant page details: ${foundUrl}`);
      const detailResp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${perplexityKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            { role: "system", content: "You are a grant research assistant. Extract all details from the grant page including deadlines, funding amounts, eligibility, application links, and downloadable resources. Return the full text content." },
            { role: "user", content: `Analyze this grant page and extract all details: ${foundUrl}` },
          ],
          search_domain_filter: [new URL(foundUrl).hostname],
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (detailResp.ok) {
        const detailData = await detailResp.json();
        scrapedMarkdown = detailData.choices?.[0]?.message?.content || "";
        const detailCitations = detailData.citations ?? [];
        scrapedLinks.push(...detailCitations);

        // Look for apply links in citations
        if (!applicationUrl) {
          const applyLinkPatterns = /apply|application|submit|proposal|how.to.apply|rfp|rfa|solicitation|grantee.?view|grant.?portal/i;
          for (const link of scrapedLinks) {
            if (applyLinkPatterns.test(link) && link !== foundUrl) {
              applicationUrl = link;
              console.log(`Found application link: ${applicationUrl}`);
              break;
            }
          }
        }
      } else {
        console.error("Detail research failed:", detailResp.status, await detailResp.text());
      }
    } catch (detailErr) {
      console.error("Detail research error:", detailErr);
    }

    // ── Extract resources ──
    const extractedResources: ExtractedResource[] = [];

    if (scrapedMarkdown || scrapedLinks.length > 0) {
      extractedResources.push(...extractDownloads(scrapedLinks, scrapedMarkdown));
      extractedResources.push(...extractResourceLinks(scrapedLinks, scrapedMarkdown, foundUrl));
      extractedResources.push(...extractDates(scrapedMarkdown));
      console.log(`Extracted ${extractedResources.length} resources (${extractedResources.filter(r => r.resource_type === 'download').length} downloads, ${extractedResources.filter(r => r.resource_type === 'link').length} links, ${extractedResources.filter(r => r.resource_type === 'date').length} dates)`);
    }

    // ── Parse funding ──
    const { maxAward, totalProgramFunding } = parseFundingFromMarkdown(scrapedMarkdown);

    // ── Save to database ──
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get current grant
    const { data: currentGrant } = await adminClient
      .from("grants")
      .select("available_funding, grant_term_start, grant_term_end, notes")
      .eq("id", grant_id)
      .maybeSingle();

    const updatePayload: Record<string, unknown> = { source_url: foundUrl };
    if (applicationUrl) updatePayload.application_url = applicationUrl;

    if (currentGrant) {
      if (!currentGrant.available_funding && maxAward) {
        updatePayload.available_funding = maxAward;
      }
      if (totalProgramFunding && !currentGrant.notes?.includes("Total program funding")) {
        const fundingNote = `Total program funding: $${totalProgramFunding.toLocaleString()}`;
        updatePayload.notes = currentGrant.notes
          ? `${currentGrant.notes}\n${fundingNote}`
          : fundingNote;
      }
    }

    const { error: updateErr } = await adminClient
      .from("grants")
      .update(updatePayload)
      .eq("id", grant_id);

    if (updateErr) {
      console.error("Failed to update grant:", updateErr.message);
    }

    // Upsert extracted resources (best-effort, dedup by unique indexes)
    let resourcesSaved = 0;
    for (const res of extractedResources) {
      const row: Record<string, unknown> = {
        grant_id,
        resource_type: res.resource_type,
        label: res.label,
        source: 'regex',
      };
      if (res.url) row.url = res.url;
      if (res.resource_date) row.resource_date = res.resource_date;
      if (res.resource_date_end) row.resource_date_end = res.resource_date_end;
      if (res.description) row.description = res.description;

      const { error: resErr } = await adminClient
        .from("grant_resources")
        .upsert(row, { onConflict: res.url ? 'grant_id,resource_type,url' : undefined, ignoreDuplicates: true });
      
      if (!resErr) resourcesSaved++;
      else console.error("Resource save error:", resErr.message);
    }
    console.log(`Saved ${resourcesSaved}/${extractedResources.length} resources`);

    return new Response(
      JSON.stringify({
        ok: true,
        found: true,
        url: foundUrl,
        application_url: applicationUrl,
        saved: !updateErr,
        title: bestResult.title || null,
        resources_extracted: extractedResources.length,
        resources_saved: resourcesSaved,
        all_results: results.slice(0, 3).map((r: any) => ({ url: r.url, title: r.title })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("grant-find-url error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
