// Browser-side Supabase client. Uses the anon key (publishable) — RLS on the
// database is the only line of defense, so do NOT relax policies without
// thinking about what an attacker can do with this key.
//
// MVP currently routes all writes through /api/log (which uses the
// server-side client), so this module is here for forward-compatibility:
// realtime subscriptions, direct read-only views, etc.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }
  cached = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
