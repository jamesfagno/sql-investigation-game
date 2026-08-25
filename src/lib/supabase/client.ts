import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!url || !anonKey) return null;
  browserClient ??= createBrowserClient(url, anonKey);
  return browserClient;
}

