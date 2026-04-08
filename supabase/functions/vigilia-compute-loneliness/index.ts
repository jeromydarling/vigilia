/**
 * vigilia-compute-loneliness — Calculate loneliness/drift scores for all residents.
 *
 * WHAT: For each resident, computes an isolation score based on visit frequency,
 *       family contact, and mood trends. Writes to loneliness_scores table.
 * WHERE: Triggered by cron (daily) or manually.
 * WHY: "Three days without a visit is quiet. Seven is drifting. Fourteen is at risk."
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DriftStatus = "present" | "quiet" | "drifting" | "distant";

function classifyDrift(daysSince: number): DriftStatus {
  if (daysSince <= 3) return "present";
  if (daysSince <= 7) return "quiet";
  if (daysSince <= 14) return "drifting";
  return "distant";
}

function computeIsolationScore(params: {
  visits7d: number;
  visits30d: number;
  daysSinceVisit: number;
  familyContactDays: number;
}): number {
  // 0 = deeply connected, 100 = severely isolated
  let score = 0;

  // Visit frequency (0-40 points)
  if (params.visits7d === 0) score += 25;
  else if (params.visits7d === 1) score += 15;
  else if (params.visits7d === 2) score += 8;

  if (params.visits30d < 5) score += 15;
  else if (params.visits30d < 10) score += 8;

  // Days since last visit (0-35 points)
  if (params.daysSinceVisit > 14) score += 35;
  else if (params.daysSinceVisit > 7) score += 25;
  else if (params.daysSinceVisit > 3) score += 12;

  // Family contact gap (0-25 points)
  if (params.familyContactDays > 30) score += 25;
  else if (params.familyContactDays > 14) score += 15;
  else if (params.familyContactDays > 7) score += 8;

  return Math.min(100, Math.max(0, score));
}

function computeMoodTrend(moods: string[]): string {
  if (moods.length < 2) return "stable";
  const positives = new Set(["peaceful", "encouraged", "joyful_moment"]);
  const negatives = new Set(["lonely", "anxious", "withdrawal", "new_grief"]);

  const recentHalf = moods.slice(0, Math.ceil(moods.length / 2));
  const olderHalf = moods.slice(Math.ceil(moods.length / 2));

  const recentPos = recentHalf.filter((m) => positives.has(m)).length / recentHalf.length;
  const olderPos = olderHalf.filter((m) => positives.has(m)).length / (olderHalf.length || 1);

  if (recentPos > olderPos + 0.2) return "improving";
  if (recentPos < olderPos - 0.2) return "declining";
  return "stable";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const targetTenantId = body.tenant_id;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    // Get all residents
    let residentsQuery = svc
      .from("contacts")
      .select("id, tenant_id, name")
      .eq("person_type", "resident");
    if (targetTenantId) residentsQuery = residentsQuery.eq("tenant_id", targetTenantId);

    const { data: residents } = await residentsQuery;
    if (!residents || residents.length === 0) {
      return new Response(JSON.stringify({ ok: true, computed: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let computed = 0;

    for (const resident of residents) {
      const rid = (resident as any).id;
      const tid = (resident as any).tenant_id;

      // Get visit data
      const [visits7dRes, visits30dRes, lastVisitRes, moodsRes] = await Promise.all([
        svc.from("visit_rituals").select("id", { count: "exact", head: true })
          .eq("tenant_id", tid).eq("resident_contact_id", rid)
          .gte("visited_at", sevenDaysAgo),
        svc.from("visit_rituals").select("id", { count: "exact", head: true })
          .eq("tenant_id", tid).eq("resident_contact_id", rid)
          .gte("visited_at", thirtyDaysAgo),
        svc.from("visit_rituals").select("visited_at")
          .eq("tenant_id", tid).eq("resident_contact_id", rid)
          .order("visited_at", { ascending: false }).limit(1),
        svc.from("visit_rituals").select("mood_observed")
          .eq("tenant_id", tid).eq("resident_contact_id", rid)
          .gte("visited_at", sevenDaysAgo)
          .order("visited_at", { ascending: false }),
      ]);

      const visits7d = visits7dRes.count ?? 0;
      const visits30d = visits30dRes.count ?? 0;

      const lastVisitAt = (lastVisitRes.data ?? [])[0]?.visited_at;
      const daysSinceVisit = lastVisitAt
        ? Math.floor((now.getTime() - new Date(lastVisitAt).getTime()) / 86400000)
        : 999;

      // Family contact gap (from household member last_contacted_at)
      const { data: familyData } = await svc
        .from("contact_household_members")
        .select("last_contacted_at")
        .eq("tenant_id", tid)
        .eq("contact_id", rid)
        .order("last_contacted_at", { ascending: false })
        .limit(1);

      const lastFamilyContact = (familyData ?? [])[0]?.last_contacted_at;
      const familyContactDays = lastFamilyContact
        ? Math.floor((now.getTime() - new Date(lastFamilyContact).getTime()) / 86400000)
        : 999;

      const moods = (moodsRes.data ?? []).map((v: any) => v.mood_observed);
      const moodTrend = computeMoodTrend(moods);
      const driftStatus = classifyDrift(daysSinceVisit);
      const isolationScore = computeIsolationScore({ visits7d, visits30d, daysSinceVisit, familyContactDays });

      // Upsert score
      await svc.from("loneliness_scores").upsert({
        tenant_id: tid,
        resident_contact_id: rid,
        score_date: today,
        isolation_score: isolationScore,
        visit_frequency_7d: visits7d,
        visit_frequency_30d: visits30d,
        family_contact_frequency: familyContactDays > 999 ? 0 : Math.max(0, 30 - familyContactDays),
        mood_trend_7d: moodTrend,
        drift_status: driftStatus,
        contributing_factors: { daysSinceVisit, familyContactDays },
        computed_at: now.toISOString(),
      }, { onConflict: "tenant_id,resident_contact_id,score_date" });

      computed++;
    }

    return new Response(
      JSON.stringify({ ok: true, computed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[vigilia-compute-loneliness] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
