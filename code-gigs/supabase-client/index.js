import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabaseClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase environment variables are not configured.");
    }
    client = createClient(url, key, {
      auth: { persistSession: false }
    });
  }
  return client;
}
