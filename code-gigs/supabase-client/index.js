import { createClient } from "@supabase/supabase-js";

let client = null;

export function formatSupabaseError(error, fallback = "Failed to load data") {
  const message = error?.message || "";
  const code = error?.code || "";
  const isMissingTable =
    code === "42P01" ||
    /schema cache|relation .* does not exist|table .* does not exist|could not find the table/i.test(
      message,
    );

  if (isMissingTable) {
    return "Supabase schema is not initialized. Run the SQL in supabase/schema.sql to create the required tables, then reload.";
  }

  return message || fallback;
}

export function getSupabaseClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase environment variables are not configured.");
    }
    client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}
