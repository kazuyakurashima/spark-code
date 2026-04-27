import "server-only";

import type { NextRequest } from "next/server";

/**
 * Same-origin check for write/read endpoints.
 *
 * **This is a shallow CSRF / drive-by filter, not real authentication.**
 * Any scripted client can forge an `Origin` header and pass — the value
 * we get is to block naive `curl` abuse and casual third-party embeds.
 *
 * Real hardening (rate limiting / HMAC-signed tokens / per-session
 * quota) is tracked as Phase 3 follow-up. Until then, RLS, server-side
 * payload caps, and the anon Supabase client (in /api/log) are the
 * concrete defenses; this check is the cheapest extra layer on top.
 *
 * Browsers always attach `Origin` on cross-origin POSTs and on most
 * same-origin POSTs. A request with no `Origin` header (curl, scripts)
 * or with a host that doesn't match our own is rejected as 403.
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  if (!host || !origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
