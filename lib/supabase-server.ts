import "server-only";

// Server-side Supabase clients. Two flavors:
// - getSupabaseServer(): service_role key, BYPASSES RLS. Only for trusted
//   server reads/writes (e.g. the report aggregator). Importing this from
//   a Client Component is a build error thanks to "server-only".
// - getSupabaseAnonServer(): anon key, RLS still applies. Used by
//   write-only public endpoints like /api/log so we don't hand
//   service_role power to anything an internet caller can hit.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let cachedService: SupabaseClient<Database> | null = null;
let cachedAnon: SupabaseClient<Database> | null = null;

export function getSupabaseServer(): SupabaseClient<Database> {
  if (cachedService) return cachedService;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "Supabase server env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  cachedService = createClient<Database>(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedService;
}

export function getSupabaseAnonServer(): SupabaseClient<Database> {
  if (cachedAnon) return cachedAnon;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase anon env vars missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }
  cachedAnon = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAnon;
}
