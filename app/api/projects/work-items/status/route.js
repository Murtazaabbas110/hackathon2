import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../../code-gigs/supabase-client";

const ALLOWED_STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { workItemId, status } = body;

    if (!workItemId) {
      return NextResponse.json({ error: "workItemId is required" }, { status: 400 });
    }

    const normalizedStatus = typeof status === "string" ? status.toUpperCase() : null;
    if (!normalizedStatus || !ALLOWED_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("work_items")
      .update({ status: normalizedStatus })
      .eq("id", workItemId)
      .select("id, project_id, status")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to update work item status" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, workItem: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to update work item status" }, { status: 500 });
  }
}
