/**
 * vigilia-lulu-webhook — Handle Lulu print order status updates.
 *
 * WHAT: Receives webhook callbacks from Lulu when print job status changes.
 * WHERE: Registered as a webhook endpoint in Lulu dashboard.
 * WHY: Updates print_jobs table so families can track their journal shipment.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Lulu status names to our internal status values
const STATUS_MAP: Record<string, string> = {
  CREATED: "submitted_to_lulu",
  UNPAID: "submitted_to_lulu",
  PAYMENT_IN_PROGRESS: "submitted_to_lulu",
  PRODUCTION_READY: "printing",
  PRODUCTION_DELAYED: "printing",
  IN_PRODUCTION: "printing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELED: "error",
  ERROR: "error",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(supabaseUrl, serviceKey);

    const payload = await req.json();
    console.log("[vigilia-lulu-webhook] Received:", JSON.stringify(payload).slice(0, 500));

    // Lulu webhook payload structure
    const luluOrderId = payload.id?.toString() ?? payload.print_job_id?.toString();
    const luluStatus = payload.status?.name ?? payload.status ?? "";
    const trackingUrl = payload.shipping_address?.tracking_url
      ?? payload.line_items?.[0]?.tracking_url
      ?? null;

    if (!luluOrderId) {
      return new Response(
        JSON.stringify({ error: "Missing order ID in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const internalStatus = STATUS_MAP[luluStatus] ?? "submitted_to_lulu";

    const updates: Record<string, unknown> = { status: internalStatus };
    if (trackingUrl) updates.tracking_url = trackingUrl;
    if (internalStatus === "shipped") updates.shipped_at = new Date().toISOString();
    if (internalStatus === "error") updates.error_message = payload.error_message ?? luluStatus;

    const { error } = await svc
      .from("print_jobs")
      .update(updates)
      .eq("lulu_order_id", luluOrderId);

    if (error) {
      console.error("[vigilia-lulu-webhook] DB update failed:", error);
      return new Response(
        JSON.stringify({ error: "DB update failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, status: internalStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[vigilia-lulu-webhook] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
