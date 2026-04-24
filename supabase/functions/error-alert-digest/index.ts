/**
 * error-alert-digest — Sends a Gmail digest of new/unalerted operator errors.
 *
 * WHAT: Queries operator_app_errors where alerted_at IS NULL, builds fix prompts, emails digest.
 * WHERE: Called via pg_cron (every 30 min) or manually.
 * WHY: Gardener receives actionable error alerts with copy-paste Lovable fix prompts.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ────────────────────────────────────────────────

async function timedFetch(url: string, opts: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function buildMimeEmail(from: string, to: string, subject: string, htmlBody: string): string {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
  ].join("\r\n");

  const message = `${headers}\r\n\r\n${htmlBody}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ── Fix prompt builder (mirrors src/lib/buildLovableFixPrompt.ts) ──

interface ErrorRow {
  id: string;
  source: string;
  severity: string;
  fingerprint: string;
  message: string;
  context: Record<string, unknown>;
  repro_steps?: string | null;
  expected?: string | null;
  count: number;
  first_seen_at: string;
  last_seen_at: string;
  status: string;
}

function inferLikelyFiles(error: ErrorRow): string[] {
  const files: string[] = [];
  const route = (error.context?.route as string) || "";
  const functionName = (error.context?.function_name as string) || "";
  if (route.includes("/operator")) files.push("src/pages/operator/");
  if (route.includes("/admin")) files.push("src/pages/admin/");
  if (route.includes("/onboarding")) files.push("src/pages/Onboarding.tsx");
  if (error.source === "edge_function" && functionName) {
    files.push(`supabase/functions/${functionName}/index.ts`);
  }
  const stack = (error.context?.stack as string) || "";
  const srcMatch = stack.match(/src\/[^\s:)]+/g);
  if (srcMatch) files.push(...srcMatch.slice(0, 3));
  return [...new Set(files)];
}

function buildFixPrompt(error: ErrorRow): string {
  const route = (error.context?.route as string) || "unknown";
  const shortMsg = error.message.length > 60 ? error.message.slice(0, 60) + "…" : error.message;
  const likelyFiles = inferLikelyFiles(error);
  return [
    `# FIX: [${error.source}] — ${route} — ${shortMsg}`,
    "",
    "## CONTEXT",
    `A ${error.source} error on route \`${route}\`.`,
    `Seen ${error.count} time(s) since ${new Date(error.first_seen_at).toLocaleDateString()}.`,
    `Severity: ${error.severity}. Status: ${error.status}.`,
    "",
    "## REPRO STEPS",
    error.repro_steps || `1. Navigate to \`${route}\`\n2. Trigger the failing action\n3. Observe the error`,
    "",
    "## ACTUAL",
    `Error message: ${error.message}`,
    (error.context?.stack as string)
      ? `\nStack excerpt:\n\`\`\`\n${(error.context.stack as string).slice(0, 400)}\n\`\`\``
      : "",
    "",
    "## LIKELY FILES",
    likelyFiles.length > 0 ? likelyFiles.map(f => `- \`${f}\``).join("\n") : "- Check stack trace",
    "",
    "## REQUIRED FIX",
    "- Stabilize the failing handler",
    "- Add input guardrails / validation",
    "- Maintain RLS policies",
    "- Mobile-first layouts at 320px",
    "- Calm Mode language",
  ].join("\n");
}

// ── HTML email builder ────────────────────────────────────

function buildDigestHtml(errors: ErrorRow[]): string {
  const errorBlocks = errors.map((e, i) => {
    const route = (e.context?.route as string) || "unknown";
    const severityColor = e.severity === "high" ? "#c0392b" : "#7f8c8d";
    const prompt = buildFixPrompt(e).replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return `
      <div style="margin-bottom:24px;padding:16px;border:1px solid #e0e0e0;border-radius:8px;background:#fafafa;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-weight:600;font-size:14px;color:#2c3e50;">
            ${i + 1}. [${e.source}] ${e.message.slice(0, 80)}${e.message.length > 80 ? "…" : ""}
          </span>
          <span style="font-size:11px;padding:2px 8px;border-radius:4px;background:${severityColor};color:white;">
            ${e.severity}
          </span>
        </div>
        <div style="font-size:12px;color:#7f8c8d;margin-bottom:12px;">
          Route: <code>${route}</code> · Count: ${e.count} · Since: ${new Date(e.first_seen_at).toLocaleDateString()}
        </div>
        <details style="margin-top:8px;">
          <summary style="cursor:pointer;font-size:12px;font-weight:600;color:#2980b9;">
            📋 Lovable Fix Prompt (copy &amp; paste)
          </summary>
          <pre style="margin-top:8px;padding:12px;background:#1e1e1e;color:#d4d4d4;border-radius:6px;font-size:11px;line-height:1.5;overflow-x:auto;white-space:pre-wrap;">${prompt}</pre>
        </details>
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:20px;color:#2c3e50;margin:0;">CROS™ Error Digest</h1>
          <p style="font-size:13px;color:#7f8c8d;margin:4px 0 0;">
            ${errors.length} new issue${errors.length !== 1 ? "s" : ""} since last alert · ${new Date().toLocaleDateString()}
          </p>
        </div>

        ${errorBlocks.join("")}

        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;text-align:center;">
          <p style="font-size:12px;color:#95a5a6;">
            Each issue above includes a ready-to-paste Lovable fix prompt.<br>
            Open the details, copy the prompt, paste into Lovable chat.
          </p>
          <a href="https://thecros.lovable.app/operator/error-desk"
             style="display:inline-block;margin-top:8px;padding:8px 20px;background:#2c6e49;color:white;border-radius:6px;text-decoration:none;font-size:13px;">
            Open Error Desk
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Main handler ──────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: "Google OAuth not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Find unalerted open errors
    const { data: errors, error: qErr } = await supabase
      .from("operator_app_errors")
      .select("*")
      .eq("status", "open")
      .is("alerted_at", null)
      .order("severity", { ascending: true }) // high first
      .order("last_seen_at", { ascending: false })
      .limit(10);

    if (qErr) throw qErr;
    if (!errors || errors.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No new errors to alert" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Find the Gardener account (gardener@thecros.app) for sending via Gmail
    const GARDENER_EMAIL = "gardener@thecros.app";
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, google_refresh_token, gmail_email_address")
      .eq("gmail_email_address", GARDENER_EMAIL)
      .not("google_refresh_token", "is", null)
      .limit(1)
      .maybeSingle();

    if (!profile?.google_refresh_token) {
      throw new Error(`Gardener account (${GARDENER_EMAIL}) not found or Gmail not connected`);
    }

    // 3. Get fresh Gmail access token
    const refreshRes = await timedFetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: profile.google_refresh_token,
          grant_type: "refresh_token",
        }),
      },
      10000
    );

    if (!refreshRes.ok) {
      const err = await refreshRes.text();
      throw new Error(`Gmail token refresh failed: ${err}`);
    }

    const tokens = await refreshRes.json();

    // 4. Build and send digest email
    const subject = `🔧 CROS Error Digest — ${errors.length} new issue${errors.length !== 1 ? "s" : ""}`;
    const html = buildDigestHtml(errors as ErrorRow[]);
    const raw = buildMimeEmail(
      `CROS Alerts <${profile.gmail_email_address}>`,
      profile.gmail_email_address,
      subject,
      html
    );

    const sendRes = await timedFetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      },
      15000
    );

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      throw new Error(`Gmail send failed [${sendRes.status}]: ${errText}`);
    }

    await sendRes.json(); // consume body

    // 5. Mark errors as alerted
    const errorIds = errors.map((e: { id: string }) => e.id);
    await supabase
      .from("operator_app_errors")
      .update({ alerted_at: new Date().toISOString() })
      .in("id", errorIds);

    return new Response(
      JSON.stringify({ ok: true, alerted: errorIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("error-alert-digest:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
