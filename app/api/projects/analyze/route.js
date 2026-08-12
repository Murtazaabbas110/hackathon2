import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../code-gigs/supabase-client";
import { analyzeProjectFromClientMessage } from "../../../../code-gigs/gemini-json-client";

import { calculateComplexity } from "../../../../code-gigs/complexity-calculator";
import { calculateReadiness } from "../../../../code-gigs/readiness-calculator";

function calculateComplexityAndReadiness(analysis) {
  const complexity = calculateComplexity({
    requirements: analysis.requirements,
    ambiguities: analysis.ambiguities,
    risks: analysis.risks,
    dependencies: analysis.dependencies
  });
  const readiness = calculateReadiness({
    ambiguities: analysis.ambiguities,
    risks: analysis.risks,
    dependencies: analysis.dependencies
  });
  return { complexity, readiness };
}

function validateAnalysis(a) {
  if (!a || typeof a !== "object") return false;
  if (typeof a.summary !== "string") return false;
  if (!Array.isArray(a.objectives) || !Array.isArray(a.targetUsers)) return false;
  if (!Array.isArray(a.requirements)) return false;
  if (!Array.isArray(a.ambiguities)) return false;
  if (!Array.isArray(a.risks)) return false;
  if (!Array.isArray(a.assumptions)) return false;
  if (!Array.isArray(a.dependencies)) return false;
  return true;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId } = body;
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("id, client_message")
      .eq("id", projectId)
      .single();

    if (fetchError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const rawAnalysis = await analyzeProjectFromClientMessage(project.client_message);
    if (!validateAnalysis(rawAnalysis)) {
      return NextResponse.json({ error: "Gemini returned invalid structure" }, { status: 502 });
    }

    const { complexity, readiness } = calculateComplexityAndReadiness(rawAnalysis);
    const fullAnalysis = { ...rawAnalysis, complexity, readiness };

    const { error: updateError } = await supabase
      .from("projects")
      .update({ analysis: fullAnalysis })
      .eq("id", projectId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ ok: true, analysis: fullAnalysis });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to analyze project" }, { status: 500 });
  }
}
