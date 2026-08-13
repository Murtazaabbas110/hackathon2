import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../code-gigs/supabase-client";
import {
  getAuthenticatedUser,
  getOwnedProject,
} from "../../../../code-gigs/auth-route-guard/server-auth";

const ALLOWED_METHODS = ["KANBAN", "AGILE"];

function validateMethodology(value) {
  if (typeof value !== "string") return false;
  const upper = value.toUpperCase();
  return ALLOWED_METHODS.includes(upper) ? upper : false;
}

export async function POST(req) {
  try {
    const { user, response } = await getAuthenticatedUser();
    if (response) return response;

    const body = await req.json();
    const { projectId, methodology } = body || {};

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const normalized = validateMethodology(methodology);
    if (!normalized) {
      return NextResponse.json({ error: "Invalid methodology. Allowed values are KANBAN or AGILE." }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const ownedProject = await getOwnedProject(projectId, user.id, "id");
    if (!ownedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update({ methodology: normalized })
      .eq("id", projectId)
      .select("id, methodology")
      .maybeSingle();

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: "Failed to update project methodology" }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, project: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to update methodology" }, { status: 500 });
  }
}
