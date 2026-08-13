import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../code-gigs/supabase-client";
import { generateWorkItemsFromAnalysis } from "../../../../code-gigs/work-item-generator";
import {
  getAuthenticatedUser,
  getOwnedProject,
} from "../../../../code-gigs/auth-route-guard/server-auth";

function validateAnalysisForWorkItems(analysis) {
  if (!analysis || typeof analysis !== "object") return false;
  if (typeof analysis.summary !== "string") return false;
  if (!Array.isArray(analysis.requirements)) return false;
  return true;
}

export async function POST(req) {
  try {
    const { user, response } = await getAuthenticatedUser();
    if (response) return response;

    const body = await req.json();
    const { projectId } = body;
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const project = await getOwnedProject(projectId, user.id, "id, analysis");

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!validateAnalysisForWorkItems(project.analysis)) {
      return NextResponse.json(
        { error: "Project analysis is missing or invalid. Run analysis before generating work items." },
        { status: 400 }
      );
    }

    const workItems = await generateWorkItemsFromAnalysis(project.analysis);

    // Persist to Supabase: replace any existing work items for this project
    const { error: deleteError } = await supabase
      .from("work_items")
      .delete()
      .eq("project_id", project.id);

    if (deleteError) {
      console.error(deleteError);
      // Non-fatal, but surface as error
      return NextResponse.json({ error: "Failed to reset existing work items" }, { status: 500 });
    }

    const rows = workItems.map(item => ({
      project_id: project.id,
      epic: item.epic,
      title: item.title,
      description: item.description,
      priority: item.priority,
      status: "BACKLOG",
      acceptance_criteria: JSON.stringify(item.acceptanceCriteria || []),
      dependencies: item.dependencies || []
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("work_items")
      .insert(rows)
      .select("id, epic, title, priority, status");

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Failed to save work items" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, workItems: inserted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to generate work items" }, { status: 500 });
  }
}
