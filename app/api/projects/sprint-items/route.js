import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../code-gigs/supabase-client";

const ALLOWED_SPRINT_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

// Assign a work item to a sprint (or move it between sprints)
export async function POST(req) {
  try {
    const body = await req.json();
    const { workItemId, sprintId } = body || {};

    if (!workItemId) {
      return NextResponse.json({ error: "workItemId is required" }, { status: 400 });
    }
    if (!sprintId) {
      return NextResponse.json({ error: "sprintId is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("work_items")
      .update({ sprint_id: sprintId, sprint_status: "TODO" })
      .eq("id", workItemId)
      .select("id, project_id, sprint_id, sprint_status")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to add work item to sprint" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, workItem: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to add work item to sprint" }, { status: 500 });
  }
}

// Remove a work item from any sprint back to the product backlog
export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { workItemId } = body || {};

    if (!workItemId) {
      return NextResponse.json({ error: "workItemId is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("work_items")
      .update({ sprint_id: null, sprint_status: null })
      .eq("id", workItemId)
      .select("id, project_id, sprint_id, sprint_status")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to remove work item from sprint" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, workItem: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to remove work item from sprint" }, { status: 500 });
  }
}

// Update per-sprint execution status (TODO / IN_PROGRESS / DONE)
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { workItemId, sprintStatus } = body || {};

    if (!workItemId) {
      return NextResponse.json({ error: "workItemId is required" }, { status: 400 });
    }

    const normalizedStatus = typeof sprintStatus === "string" ? sprintStatus.toUpperCase() : null;
    if (!normalizedStatus || !ALLOWED_SPRINT_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json({ error: "Invalid sprint status" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("work_items")
      .update({ sprint_status: normalizedStatus })
      .eq("id", workItemId)
      .select("id, project_id, sprint_id, sprint_status")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to update sprint status" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, workItem: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to update sprint status" }, { status: 500 });
  }
}
