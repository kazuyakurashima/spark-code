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
 * Compares the full `Origin` header (scheme + host + port) against the
 * server's own origin via `request.nextUrl.origin`. A host-only check
 * would accept `http://app` against an `https://app` server, which
 * weakens the gate — we want scheme parity too.
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === request.nextUrl.origin;
}
