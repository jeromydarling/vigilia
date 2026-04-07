/**
 * operator-error — Shared helper for edge function error capture.
 *
 * WHAT: Logs structured errors to operator_app_errors from edge functions.
 * WHERE: Imported in catch blocks of any edge function.
 * WHY: Centralized error visibility without impacting tenant flows.
 *
 * Usage:
 *   import { logOperatorError } from '../_shared/operator-error.ts';
 *   try { ... } catch (e) { await logOperatorError(supabaseClient, { ... }); }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface EdgeErrorPayload {
  functionName: string;
  message: string;
  runId?: string;
  requestId?: string;
  dbCode?: string;
  stack?: string;
  tenantId?: string | null;
}

export async function logOperatorError(
  payload: EdgeErrorPayload
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const client = createClient(supabaseUrl, serviceKey);

    // Compute fingerprint
    const raw = `${payload.message}|${payload.functionName}|edge_function`;
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) + hash + raw.charCodeAt(i)) & 0x7fffffff;
    }
    const fingerprint = hash.toString(36);

    const context: Record<string, unknown> = {
      function_name: payload.functionName,
    };
    if (payload.runId) context.run_id = payload.runId;
    if (payload.requestId) context.request_id = payload.requestId;
    if (payload.dbCode) context.db_code = payload.dbCode;
    if (payload.stack) context.stack = payload.stack.slice(0, 2000);

    await client.rpc('upsert_operator_error', {
      p_tenant_id: payload.tenantId || null,
      p_source: 'edge_function',
      p_severity: 'normal',
      p_fingerprint: fingerprint,
      p_message: payload.message.slice(0, 500),
      p_context: context,
    });
  } catch {
    // Silent — error capture must never block edge function flow
  }
}
