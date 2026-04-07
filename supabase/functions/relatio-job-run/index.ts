/**
 * relatio-job-run — Executes an import job (service auth).
 * POST { job_id }
 *
 * Processes in phases: A (orgs) → B (contacts) → C (activities) → D (tasks).
 * Uses relatio_object_map for idempotency.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface ImportRow {
  external_type: string;
  external_id: string;
  data: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { job_id } = await req.json();
    if (!job_id) {
      return new Response(JSON.stringify({ error: "job_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getServiceClient();

    // Load job
    const { data: job, error: jobError } = await supabase
      .from("relatio_import_jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (job.status !== "queued") {
      return new Response(JSON.stringify({ error: `Job status is ${job.status}, expected queued` }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark running
    await supabase
      .from("relatio_import_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", job_id);

    await logEvent(supabase, job_id, "info", "Import started");

    const scope = (job.scope || {}) as Record<string, ImportRow[]>;
    const counts = { orgs: 0, contacts: 0, activities: 0, tasks: 0, skipped: 0, warnings: 0 };

    try {
      // Phase A: Organizations → opportunities
      const orgs = scope.organizations || [];
      for (const row of orgs) {
        const result = await upsertEntity(supabase, job.tenant_id, job.connector_key, job_id, row, "opportunities");
        if (result === "created" || result === "updated") counts.orgs++;
        else counts.skipped++;
      }
      await updateProgress(supabase, job_id, { phase: "contacts", counts });

      // Phase B: Contacts → contacts
      // Also handle do_not_email for unsubscribed/bounced/complaint contacts
      const contacts = scope.contacts || [];
      const OPT_OUT_STATUSES = ["unsubscribed", "cleaned", "bounced", "complaint"];
      for (const row of contacts) {
        const result = await upsertEntity(supabase, job.tenant_id, job.connector_key, job_id, row, "contacts");
        if (result === "created" || result === "updated") counts.contacts++;
        else counts.skipped++;

        // Check if contact has opt-out status from external platform
        const externalStatus = (row.data as Record<string, unknown>).subscription_status as string
          ?? (row.data as Record<string, unknown>).status as string
          ?? "";
        const contactEmail = (row.data as Record<string, unknown>).email as string;
        if (contactEmail && OPT_OUT_STATUSES.includes(externalStatus.toLowerCase())) {
          // Insert into email_suppressions (idempotent via unique index)
          await supabase.from("email_suppressions").upsert(
            {
              tenant_id: job.tenant_id,
              email: contactEmail.toLowerCase(),
              reason: externalStatus.toLowerCase() === "bounced" ? "bounce"
                : externalStatus.toLowerCase() === "complaint" ? "complaint"
                : externalStatus.toLowerCase() === "cleaned" ? "cleaned"
                : "unsubscribed_source",
              source: "connector_import",
              source_connector: job.connector_key,
              metadata: { imported_from: job.connector_key, original_status: externalStatus },
            },
            { onConflict: "tenant_id,email", ignoreDuplicates: true }
          );

          // Flag the contact with do_not_email = true
          await supabase.from("contacts")
            .update({ do_not_email: true })
            .eq("tenant_id", job.tenant_id)
            .eq("email", contactEmail.toLowerCase());
        }
      }
      await updateProgress(supabase, job_id, { phase: "activities", counts });

      // Phase C: Activities → activities
      const activities = scope.activities || [];
      for (const row of activities) {
        const result = await upsertEntity(supabase, job.tenant_id, job.connector_key, job_id, row, "activities");
        if (result === "created" || result === "updated") counts.activities++;
        else counts.skipped++;
      }
      await updateProgress(supabase, job_id, { phase: "tasks", counts });

      // Phase D: Tasks → contact_tasks
      const tasks = scope.tasks || [];
      for (const row of tasks) {
        const result = await upsertEntity(supabase, job.tenant_id, job.connector_key, job_id, row, "contact_tasks");
        if (result === "created" || result === "updated") counts.tasks++;
        else counts.skipped++;
      }

      // Mark completed
      await supabase
        .from("relatio_import_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          progress: { phase: "done", counts },
        })
        .eq("id", job_id);

      await logEvent(supabase, job_id, "info", `Import completed: ${JSON.stringify(counts)}`);

      return new Response(JSON.stringify({ success: true, counts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await supabase
        .from("relatio_import_jobs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error: { message: msg },
          progress: { phase: "error", counts },
        })
        .eq("id", job_id);

      await logEvent(supabase, job_id, "error", msg);

      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function upsertEntity(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  connectorKey: string,
  jobId: string,
  row: ImportRow,
  targetTable: string,
): Promise<"created" | "updated" | "skipped"> {
  // Check if already mapped (idempotency)
  const { data: existing } = await supabase
    .from("relatio_object_map")
    .select("internal_id")
    .eq("tenant_id", tenantId)
    .eq("connector_key", connectorKey)
    .eq("external_type", row.external_type)
    .eq("external_id", row.external_id)
    .maybeSingle();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from(targetTable)
      .update(row.data)
      .eq("id", existing.internal_id);

    if (error) {
      await logEvent(supabase, jobId, "warn", `Update failed for ${row.external_type}/${row.external_id}: ${error.message}`);
      return "skipped";
    }
    return "updated";
  }

  // Insert new record
  const insertData = { ...row.data, tenant_id: tenantId };
  const { data: inserted, error } = await supabase
    .from(targetTable)
    .insert(insertData)
    .select("id")
    .single();

  if (error || !inserted) {
    await logEvent(supabase, jobId, "warn", `Insert failed for ${row.external_type}/${row.external_id}: ${error?.message}`);
    return "skipped";
  }

  // Record mapping
  await supabase.from("relatio_object_map").insert({
    tenant_id: tenantId,
    connector_key: connectorKey,
    external_type: row.external_type,
    external_id: row.external_id,
    internal_table: targetTable,
    internal_id: inserted.id,
  });

  return "created";
}

async function logEvent(
  supabase: ReturnType<typeof createClient>,
  jobId: string,
  level: string,
  message: string,
) {
  await supabase.from("relatio_import_events").insert({
    job_id: jobId,
    level,
    message,
  });
}

async function updateProgress(
  supabase: ReturnType<typeof createClient>,
  jobId: string,
  progress: Record<string, unknown>,
) {
  await supabase
    .from("relatio_import_jobs")
    .update({ progress })
    .eq("id", jobId);
}
