/**
 * cors — Shared CORS configuration for all edge functions.
 *
 * WHAT: Centralized origin allowlist and CORS header generation.
 * WHERE: Imported by every edge function that responds to browser requests.
 * WHY: SEC-002 — replaces per-function wildcard CORS with a canonical allowlist.
 *
 * Usage:
 *   import { getCorsHeaders, handleCorsPreflightResponse } from '../_shared/cors.ts';
 *
 *   // At start of handler:
 *   if (req.method === 'OPTIONS') return handleCorsPreflightResponse(req);
 *
 *   // In responses:
 *   return new Response(body, { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } });
 */

/**
 * Canonical list of allowed origins.
 * Production domains, Lovable preview/deploy URLs, and localhost for dev.
 */
const ALLOWED_ORIGINS: string[] = [
  'https://thecros.lovable.app',
  'https://thecros.app',
  'https://www.thecros.app',
];

/**
 * Patterns that match dynamic origins (previews, localhost).
 */
const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/id-preview--[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

/**
 * Base headers that are always present (non-origin-specific).
 */
const BASE_HEADERS = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-api-key, x-internal-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/**
 * Check if an origin is in the allowlist.
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin));
}

/**
 * Get CORS headers for a given request.
 * Returns origin-specific Access-Control-Allow-Origin if the origin is allowed,
 * otherwise omits it (effectively blocking cross-origin requests).
 *
 * For server-to-server calls (no Origin header), allows the request
 * since CORS is browser-enforced only.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');

  // No Origin header = not a browser CORS request (server-to-server, curl, etc.)
  if (!origin) {
    return { ...BASE_HEADERS, 'Access-Control-Allow-Origin': '*' };
  }

  if (isAllowedOrigin(origin)) {
    return {
      ...BASE_HEADERS,
      'Access-Control-Allow-Origin': origin,
      'Vary': 'Origin',
    };
  }

  // Origin not allowed — return headers without Allow-Origin
  // Browser will block the response
  return { ...BASE_HEADERS };
}

/**
 * Handle OPTIONS preflight. Always returns 204 with appropriate headers.
 */
export function handleCorsPreflightResponse(req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

/**
 * Legacy wildcard CORS headers — for functions not yet migrated.
 * @deprecated Use getCorsHeaders(req) instead.
 */
export const wildcardCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-api-key, x-internal-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
