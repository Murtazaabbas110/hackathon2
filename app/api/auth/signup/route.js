import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../code-gigs/supabase-client";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createSessionCookieValue,
} from "../../../../code-gigs/auth-route-guard/session-server";

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password.trim() : "";

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "username, email, and password are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        email,
        password,
      })
      .select("id, username, email")
      .single();

    if (error) {
      if (error?.code === "23505") {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 },
        );
      }

      console.error(error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true, user: data });
    response.cookies.set(
      AUTH_COOKIE_NAME,
      createSessionCookieValue(data),
      authCookieOptions(),
    );

    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to create user" },
      { status: 500 },
    );
  }
}
