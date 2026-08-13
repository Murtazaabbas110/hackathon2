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
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, password")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to login" }, { status: 500 });
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, email: user.email },
    });

    response.cookies.set(
      AUTH_COOKIE_NAME,
      createSessionCookieValue(user),
      authCookieOptions(),
    );

    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to login" },
      { status: 500 },
    );
  }
}
