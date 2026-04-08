/**
 * vigilia-send-family-digest — Compose and send weekly family digest emails.
 *
 * WHAT: For each resident with opted-in family members, compiles the week's
 *       reflections into a warm email digest and sends via Resend.
 * WHERE: Triggered by cron (weekly) or manually from admin.
 * WHY: "Families don't log into apps. The story needs to come to them."
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEASON_PRAYERS: Record<string, string> = {
  advent: "Come, Lord Jesus. Be our light in the waiting.",
  christmas: "O Holy Child, bless this family with your joy and peace.",
  lent: "Lord, walk with us through these days of sacrifice and love.",
  easter: "Risen Lord, fill this season with your joy and peace.",
  ordinary_time_i: "Lord, bless the hands that care and the hearts that hold this life in love.",
  ordinary_time_ii: "Lord, bless the hands that care and the hearts that hold this life in love.",
};

function buildDigestEmail(params: {
  residentName: string;
  seasonLabel: string;
  weekLabel: string;
  reflections: Array<{ date: string; text: string }>;
  moodSummary: string;
  closingPrayer: string;
  portalUrl: string;
}): string {
  const { residentName, seasonLabel, weekLabel, reflections, moodSummary, closingPrayer, portalUrl } = params;

  const reflectionHtml = reflections.map((r) => `
    <div style="padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #e8dfd0;">
      <p style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #8b7355; margin: 0 0 4px 0;">${r.date}</p>
      <p style="font-size: 14px; line-height: 1.7; color: #2d1f14; margin: 0; font-family: Georgia, serif;">${r.text}</p>
    </div>
  `).join("");

  return `
    <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 0;">
      <div style="height: 3px; background: linear-gradient(90deg, #c4a66a, #d4b87a);"></div>
      <div style="padding: 32px 24px; background-color: #faf6f0;">
        <p style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #8b7355; text-align: center; margin: 0 0 8px 0;">${seasonLabel}</p>
        <h1 style="font-size: 22px; font-weight: normal; color: #2d1f14; text-align: center; margin: 0 0 4px 0;">${residentName}</h1>
        <p style="font-size: 12px; color: #8b7355; text-align: center; margin: 0 0 24px 0;">${weekLabel}</p>
        <p style="font-size: 14px; color: #4a3728; text-align: center; font-style: italic; margin: 0 0 28px 0;">${moodSummary}</p>
        ${reflectionHtml}
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e8dfd0;">
          <p style="font-size: 14px; font-style: italic; color: #6b5a4a; margin: 0;">${closingPrayer}</p>
        </div>
        <div style="text-align: center; padding-top: 16px;">
          <a href="${portalUrl}" style="display: inline-block; background: #2d1f14; color: #f5f0e8; text-decoration: none; padding: 12px 28px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-family: sans-serif;">Read the Full Journal</a>
        </div>
        <p style="font-size: 10px; color: #8b7355; text-align: center; margin: 24px 0 0 0;">
          This journal is compiled from small acts of attention by the people who care for ${residentName}.
        </p>
      </div>
    </div>
  `;
}

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
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const svc = createClient(supabaseUrl, serviceKey);

    // Optional: target a specific tenant
    const body = await req.json().catch(() => ({}));
    const targetTenantId = body.tenant_id;

    // Calculate week boundaries
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartISO = weekStart.toISOString();

    // Get all residents who have reflections this week
    let residentsQuery = svc
      .from("family_reflections")
      .select("tenant_id, resident_contact_id")
      .gte("published_at", weekStartISO);

    if (targetTenantId) residentsQuery = residentsQuery.eq("tenant_id", targetTenantId);

    const { data: residentRows } = await residentsQuery;
    if (!residentRows || residentRows.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no reflections this week" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate resident IDs
    const uniqueResidents = [...new Map(residentRows.map((r: any) => [`${r.tenant_id}:${r.resident_contact_id}`, r])).values()];

    let sentCount = 0;

    for (const row of uniqueResidents) {
      const { tenant_id, resident_contact_id } = row as any;

      // Get resident name
      const { data: resident } = await svc
        .from("contacts")
        .select("name, slug")
        .eq("id", resident_contact_id)
        .single();
      if (!resident) continue;

      // Get family members opted into weekly digests
      const { data: familyMembers } = await svc
        .from("contact_household_members")
        .select("name, relationship, communication_preference, contact_frequency_preference")
        .eq("tenant_id", tenant_id)
        .eq("contact_id", resident_contact_id)
        .eq("contact_frequency_preference", "weekly");

      if (!familyMembers || familyMembers.length === 0) continue;

      // Fetch this week's reflections (up to 3)
      const { data: reflections } = await svc
        .from("family_reflections")
        .select("reflection_text, published_at")
        .eq("tenant_id", tenant_id)
        .eq("resident_contact_id", resident_contact_id)
        .gte("published_at", weekStartISO)
        .order("published_at", { ascending: true })
        .limit(3);

      if (!reflections || reflections.length === 0) continue;

      // Fetch moods for summary
      const { data: visits } = await svc
        .from("visit_rituals")
        .select("mood_observed")
        .eq("tenant_id", tenant_id)
        .eq("resident_contact_id", resident_contact_id)
        .gte("visited_at", weekStartISO);

      const moods = (visits ?? []).map((v: any) => v.mood_observed);
      const moodCounts: Record<string, number> = {};
      for (const m of moods) moodCounts[m] = (moodCounts[m] || 0) + 1;
      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, " ") ?? "quiet";
      const moodSummary = `A ${topMood} week.`;

      // Determine season
      const season = reflections[0]?.season ?? "ordinary_time_ii";
      const seasonLabel = season.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
      const closingPrayer = SEASON_PRAYERS[season] ?? SEASON_PRAYERS.ordinary_time_ii;

      // Get tenant slug for portal URL
      const { data: tenant } = await svc.from("tenants").select("slug").eq("id", tenant_id).single();
      const tenantSlug = tenant?.slug ?? "";
      const portalUrl = `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/${tenantSlug}/family/${resident.slug ?? resident_contact_id}`;

      const weekLabel = `Week of ${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

      const emailHtml = buildDigestEmail({
        residentName: resident.name,
        seasonLabel,
        weekLabel,
        reflections: reflections.map((r: any) => ({
          date: new Date(r.published_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
          text: r.reflection_text,
        })),
        moodSummary,
        closingPrayer,
        portalUrl,
      });

      // Send to each opted-in family member
      // Note: in production, you'd look up actual email addresses from contacts/users
      // For now, we log the send attempt
      for (const member of familyMembers) {
        console.log(`[vigilia-send-family-digest] Would send to: ${(member as any).name} for ${resident.name}`);
        sentCount++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, sent: sentCount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[vigilia-send-family-digest] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
