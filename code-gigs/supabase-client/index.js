import { createClient } from "@supabase/supabase-js";

let browserClient = null;

export function formatSupabaseError(error, fallback = "Failed to load data") {
  const message = error?.message || "";
  const code = error?.code || "";
  const isMissingTable =
    code === "42P01" ||
    /schema cache|relation .* does not exist|table .* does not exist|could not find the table/i.test(
      message,
    );

  if (isMissingTable) {
    return "Supabase schema is not initialized. Run the SQL in supabase/schema.sql (or the migration in supabase/migrations) to create the required tables, then reload.";
  }

  return message || fallback;
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const isBrowser = typeof window !== "undefined";

  return createClient(url, key, {
    auth: {
      persistSession: true,
      storageKey: "scopeflow-auth",
      storage: isBrowser ? window.localStorage : undefined,
      autoRefreshToken: true,
    },
  });
}

// Browser-side singleton used from React components.
export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // In server environments, avoid a shared singleton and create a fresh client.
    return createSupabaseClient();
  }

  if (!browserClient) {
    browserClient = createSupabaseClient();
  }
  return browserClient;
}

// Lightweight server-side client factory, primarily for API routes.
export function getSupabaseServerClient() {
  return createSupabaseClient();
}

// Attach the current Supabase access token to a fetch call from the browser.
// This is used so API routes can validate the caller via Authorization: Bearer <token>.
export async function authFetch(input, init = {}) {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(input, { ...init, headers });
}

// Helper for API routes: extract the authenticated user from the Authorization header.
export async function getUserFromRequest(req) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
