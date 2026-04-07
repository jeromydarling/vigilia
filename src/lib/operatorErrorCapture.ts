/**
 * operatorErrorCapture — Silent frontend error collection for Operator Error Desk.
 *
 * WHAT: Captures unhandled errors and failed API calls, upserts into operator_app_errors.
 * WHERE: Installed once at app root; also callable from API wrappers.
 * WHY: Gives operator one place to see all frontend failures without impacting users.
 */
import { supabase } from '@/integrations/supabase/client';

function computeFingerprint(message: string, stack?: string, route?: string, source?: string): string {
  const firstLine = stack?.split('\n').find(l => l.trim().startsWith('at ')) || '';
  const raw = `${message}|${firstLine.trim()}|${route || ''}|${source || 'frontend'}`;
  // Simple hash — djb2
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) & 0x7fffffff;
  }
  return hash.toString(36);
}

interface ErrorPayload {
  source: 'frontend' | 'edge_function' | 'database' | 'integration';
  message: string;
  stack?: string;
  route?: string;
  functionName?: string;
  status?: number;
  extra?: Record<string, unknown>;
}

let _initialized = false;
let _currentTenantId: string | null = null;
const _recentFingerprints = new Set<string>();

/**
 * Set the active tenant ID so error events are scoped to the correct tenant.
 * Call this when tenant context mounts/changes.
 */
export function setErrorCaptureTenantId(tenantId: string | null): void {
  _currentTenantId = tenantId;
}

/**
 * Send an error to the operator_app_errors table via RPC upsert.
 * Silently fails — never throws.
 */
export async function logOperatorError(payload: ErrorPayload): Promise<void> {
  try {
    // Skip transient / non-actionable errors (includes HMR stale artifacts)
    if (isTransientError(payload.message, payload.stack)) return;

    const route = payload.route || (typeof window !== 'undefined' ? window.location.pathname : '');
    const fingerprint = computeFingerprint(payload.message, payload.stack, route, payload.source);

    // Debounce identical errors within same page session
    if (_recentFingerprints.has(fingerprint)) return;
    _recentFingerprints.add(fingerprint);
    setTimeout(() => _recentFingerprints.delete(fingerprint), 60_000);

    // Emit custom event so the Compass can auto-open with reassurance
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cros:system-error', {
        detail: { fingerprint, message: payload.message, route },
      }));
    }

    const context: Record<string, unknown> = {
      route,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...payload.extra,
    };
    if (payload.functionName) context.function_name = payload.functionName;
    if (payload.status) context.status = payload.status;
    if (payload.stack) context.stack = payload.stack.slice(0, 2000);

    // Classify severity
    const severity = classifySeverity(route, payload.status, payload.message);

    // Write to operator_app_errors (existing)
    await supabase.rpc('upsert_operator_error', {
      p_tenant_id: null,
      p_source: payload.source,
      p_severity: severity,
      p_fingerprint: fingerprint,
      p_message: payload.message.slice(0, 500),
      p_context: context as unknown as Record<string, never>,
    });

    // Also write to system_error_events for stability view
    await supabase.from('system_error_events').insert({
      route,
      component: payload.functionName || (payload.extra?.componentStack ? 'react_component' : 'unknown'),
      error_type: payload.source === 'frontend' ? 'ui_error' : payload.source,
      stack_excerpt: payload.stack?.slice(0, 1000) || payload.message,
      user_role: null,
      tenant_id: _currentTenantId,
    });
  } catch {
    // Intentionally silent — error capture must never crash the app
  }
}

/**
 * Transient errors caused by stale caches, network hiccups, or deploy artifacts.
 * These are never actionable and should not appear on the Error Desk.
 */
const TRANSIENT_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Loading chunk [\w-]+ failed/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /Minified React error #300/i,
  /ChunkLoadError/i,
  /NetworkError when attempting to fetch resource/i,
  /Load failed/i,
];

/**
 * Detect stale HMR artifacts — errors caused by hot-reload leaving
 * references to old module closures. These only occur in dev preview
 * and are never actionable.
 */
function isHmrStaleArtifact(message: string, stack?: string): boolean {
  if (!stack) return false;
  // HMR-injected modules contain ?t= cache-bust params
  const hasHmrTimestamp = /\?t=\d{10,}/.test(stack);
  if (!hasHmrTimestamp) return false;
  // Common patterns from stale closures after hot reload
  return /is not defined/i.test(message) ||
    /Cannot read properties of (undefined|null)/i.test(message);
}

function isTransientError(message: string, stack?: string): boolean {
  if (TRANSIENT_PATTERNS.some(p => p.test(message))) return true;
  if (isHmrStaleArtifact(message, stack)) return true;
  return false;
}

function classifySeverity(route: string, status?: number, _message?: string): string {
  const highRoutes = ['onboarding', 'checkout', 'campaign-send', 'migration-commit', 'provision-create', 'auth', 'login', 'signup'];
  if (highRoutes.some(r => route.includes(r))) return 'high';
  if (status && status >= 500) return 'high';
  return 'normal';
}

/**
 * Install global error handlers. Call once at app startup.
 */
export function initOperatorErrorCapture(): void {
  if (_initialized || typeof window === 'undefined') return;
  _initialized = true;

  window.addEventListener('error', (event) => {
    logOperatorError({
      source: 'frontend',
      message: event.message || 'Unhandled error',
      stack: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logOperatorError({
      source: 'frontend',
      message: reason?.message || String(reason) || 'Unhandled promise rejection',
      stack: reason?.stack,
    });
  });
}
