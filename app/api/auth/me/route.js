import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../code-gigs/auth-route-guard/server-auth";

export async function GET() {
  try {
    const { user, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to load user" },
      { status: 500 },
    );
  }
}
