/**
 * vigilia-drift-alerts — Notify staff when residents cross drift thresholds.
 *
 * WHAT: Checks loneliness_scores for residents whose drift_status has worsened
 *       (from "quiet" to "drifting" or "drifting" to "distant") and creates
 *       in-app notifications for the relevant staff.
 * WHERE: Triggered by cron (daily, after loneliness computation) or manually.
 * WHY: "No resident should drift into isolation without someone being alerted."
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DRIFT_LABELS: Record<string, string> = {
  present: "Visited recently",
  quiet: "Getting quiet",
  drifting: "Needs attention",
  distant: "At risk",
};

const DRIFT_SEVERITY: Record<string, number> = {
  present: 0,
  quiet: 1,
  drifting: 2,
  distant: 3,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const targetTenantId = body.tenant_id;

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Get today's scores
    let todayQuery = svc
      .from("loneliness_scores")
      .select("tenant_id, resident_contact_id, drift_status, isolation_score")
      .eq("score_date", today);
    if (targetTenantId) todayQuery = todayQuery.eq("tenant_id", targetTenantId);

    const { data: todayScores } = await todayQuery;
    if (!todayScores || todayScores.length === 0) {
      return new Response(JSON.stringify({ ok: true, alerts: 0, reason: "no scores for today" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get yesterday's scores for comparison
    const { data: yesterdayScores } = await svc
      .from("loneliness_scores")
      .select("tenant_id, resident_contact_id, drift_status")
      .eq("score_date", yesterday);

    const yesterdayMap = new Map(
      (yesterdayScores ?? []).map((s: any) => [`${s.tenant_id}:${s.resident_contact_id}`, s.drift_status])
    );

    let alertCount = 0;

    for (const score of todayScores) {
      const { tenant_id, resident_contact_id, drift_status } = score as any;
      const key = `${tenant_id}:${resident_contact_id}`;
      const prevStatus = yesterdayMap.get(key) ?? "present";

      const prevSeverity = DRIFT_SEVERITY[prevStatus] ?? 0;
      const currSeverity = DRIFT_SEVERITY[drift_status] ?? 0;

      // Only alert if drift has worsened and is at least "drifting"
      if (currSeverity > prevSeverity && currSeverity >= 2) {
        // Get resident name
        const { data: resident } = await svc
          .from("contacts")
          .select("name")
          .eq("id", resident_contact_id)
          .single();

        const residentName = (resident as any)?.name ?? "A resident";
        const label = DRIFT_LABELS[drift_status] ?? drift_status;

        // Get team members for this tenant (staff who should be notified)
        const { data: teamMembers } = await svc
          .from("team_members")
          .select("user_id")
          .eq("tenant_id", tenant_id)
          .in("role", ["admin", "leadership", "steward"]);

        for (const member of teamMembers ?? []) {
          await svc.from("notifications").insert({
            tenant_id,
            user_id: (member as any).user_id,
            title: `Drift alert: ${residentName}`,
            body: `${residentName} is now "${label}" — ${drift_status === "distant" ? "no visit in 14+ days" : "visit frequency has dropped"}. Consider scheduling a visit or reaching out to the family.`,
            category: "drift_alert",
            priority: drift_status === "distant" ? "high" : "normal",
            deep_link: `/residents/${resident_contact_id}`,
            read: false,
          });
        }

        alertCount++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, alerts: alertCount, residentsChecked: todayScores.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[vigilia-drift-alerts] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
