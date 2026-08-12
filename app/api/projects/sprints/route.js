import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../code-gigs/supabase-client";

// Very small sprint model for Phase 6:
// - One "current" sprint per project, using status = 'ACTIVE'.
// - Additional statuses can be introduced in later phases without breaking this API.

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("sprints")
      .select("id, project_id, name, goal, status, start_date, end_date, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to load sprints" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sprints: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to load sprints" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, name, goal, startDate, endDate } = body || {};

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Sprint name is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Enforce a single ACTIVE sprint per project for this phase.
    const { data: existingActive, error: activeError } = await supabase
      .from("sprints")
      .select("id")
      .eq("project_id", projectId)
      .eq("status", "ACTIVE")
      .limit(1)
      .maybeSingle();

    if (activeError) {
      console.error(activeError);
      return NextResponse.json({ error: "Failed to validate existing sprints" }, { status: 500 });
    }

    if (existingActive) {
      return NextResponse.json(
        { error: "This project already has an active sprint. Complete or archive it before creating another." },
        { status: 400 }
      );
    }

    const payload = {
      project_id: projectId,
      name: name.trim(),
      goal: goal?.trim() || null,
      status: "ACTIVE",
      start_date: startDate || null,
      end_date: endDate || null
    };

    const { data: inserted, error: insertError } = await supabase
      .from("sprints")
      .insert(payload)
      .select("id, project_id, name, goal, status, start_date, end_date, created_at")
      .single();

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Failed to create sprint" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sprint: inserted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to create sprint" }, { status: 500 });
  }
}
