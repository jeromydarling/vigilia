/**
 * vigilia-family-invite — Send a magic link invitation to a family member.
 *
 * WHAT: Creates a family-role user account (or finds existing) and sends
 *       a magic link email so they can access the family journal portal.
 * WHERE: Called from the resident detail page by staff/admin.
 * WHY: "Families don't log into apps — but when they do, it should be one tap."
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // Verify the calling user is authenticated
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svc = createClient(supabaseUrl, serviceKey);

    const { email, name, resident_contact_id, tenant_id, relationship } = await req.json();

    if (!email || !resident_contact_id || !tenant_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get resident name for the email
    const { data: resident } = await svc
      .from("contacts")
      .select("name, slug")
      .eq("id", resident_contact_id)
      .single();
    const residentName = resident?.name ?? "your loved one";
    const residentSlug = resident?.slug ?? resident_contact_id;

    // Get tenant slug for the portal URL
    const { data: tenant } = await svc
      .from("tenants")
      .select("slug")
      .eq("id", tenant_id)
      .single();
    const tenantSlug = tenant?.slug ?? "";

    // Generate magic link via Supabase Auth
    const { data: magicLinkData, error: magicErr } = await svc.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/${tenantSlug}/family/${residentSlug}`,
      },
    });

    if (magicErr) throw new Error(`Magic link generation failed: ${magicErr.message}`);

    // Ensure the user has the family role in this tenant
    const userId = magicLinkData.user?.id;
    if (userId) {
      // Upsert team membership with 'visitor' role (family access)
      await svc.from("team_members").upsert({
        tenant_id,
        user_id: userId,
        role: "visitor",
        name: name || email.split("@")[0],
      }, { onConflict: "tenant_id,user_id" });
    }

    // Update household member record with invite status
    if (relationship) {
      await svc.from("contact_household_members").update({
        communication_preference: "email",
        contact_frequency_preference: "weekly",
      }).eq("tenant_id", tenant_id)
        .eq("contact_id", resident_contact_id)
        .ilike("name", `%${name}%`);
    }

    // Send the email via Resend
    if (resendKey && magicLinkData.properties?.action_link) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Vigilia <noreply@vigilia.care>",
          to: [email],
          subject: `You're invited to ${residentName}'s journal`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
              <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8b7355; margin-bottom: 20px;">Vigilia &middot; A Liturgy of Attention</p>
              <h1 style="font-size: 22px; font-weight: normal; color: #2d1f14; margin-bottom: 16px;">You're invited to ${residentName}'s journal.</h1>
              <p style="font-size: 15px; line-height: 1.7; color: #4a3728; margin-bottom: 24px;">
                The people caring for ${residentName} are keeping a living journal of their days &mdash;
                small moments of attention, prayer, and presence captured by staff, chaplains, and volunteers.
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #4a3728; margin-bottom: 32px;">
                Tap below to read the journal. No password needed.
              </p>
              <a href="${magicLinkData.properties.action_link}" style="display: inline-block; background: #2d1f14; color: #f5f0e8; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-family: sans-serif;">
                Open the Journal
              </a>
              <p style="font-size: 12px; color: #8b7355; margin-top: 32px;">
                This link is personal to you. It will log you in automatically.
              </p>
            </div>
          `,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("[vigilia-family-invite] Resend error:", errText);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, invited: email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[vigilia-family-invite] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
