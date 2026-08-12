"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "../../../components/AuthGuard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { getSupabaseClient } from "../../../code-gigs/supabase-client";
import { IntelligenceOverview } from "../../../components/project/IntelligenceOverview";
import { IntelligenceSectionList } from "../../../components/project/IntelligenceSectionList";
import { MethodologySelector } from "../../../components/project/MethodologySelector";
import { KanbanBoard } from "../../../components/project/KanbanBoard";
import { AgileBoard } from "../../../components/project/AgileBoard";

export default function ProjectWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [workItemsLoading, setWorkItemsLoading] = useState(true);
  const [workItemsError, setWorkItemsError] = useState(null);
  const [generatingWorkItems, setGeneratingWorkItems] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [sprintsLoading, setSprintsLoading] = useState(true);
  const [sprintsError, setSprintsError] = useState(null);
  const [creatingSprint, setCreatingSprint] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      setWorkItemsLoading(true);
      setWorkItemsError(null);
      setSprintsLoading(true);
      setSprintsError(null);
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("projects")
          .select("id, name, client_message, analysis, methodology, created_at")
          .eq("id", projectId)
          .single();
        if (error) throw error;
        if (isMounted) setProject(data);

        const { data: wi, error: wiError } = await supabase
          .from("work_items")
          .select("id, epic, title, description, priority, status, sprint_id, sprint_status, acceptance_criteria, dependencies")
          .eq("project_id", projectId)
          .order("created_at", { ascending: true });
        if (wiError) throw wiError;

        const { data: sprintsData, error: sprintsErr } = await supabase
          .from("sprints")
          .select("id, project_id, name, goal, status, start_date, end_date, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: true });
        if (sprintsErr) throw sprintsErr;
        const normalized = (wi || []).map(item => ({
          ...item,
          acceptance_criteria: Array.isArray(item.acceptance_criteria)
            ? item.acceptance_criteria
            : typeof item.acceptance_criteria === "string" && item.acceptance_criteria.trim().startsWith("[")
            ? (() => {
                try {
                  return JSON.parse(item.acceptance_criteria);
                } catch {
                  return [];
                }
              })()
            : [],
        }));
        if (isMounted) setWorkItems(normalized);
        if (isMounted) setSprints(sprintsData || []);
      } catch (e) {
        console.error(e);
        if (isMounted) setError(e.message || "Failed to load project");
      } finally {
        if (isMounted) setLoading(false);
        if (isMounted) setWorkItemsLoading(false);
        if (isMounted) setSprintsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  async function triggerAnalysis() {
    if (!projectId) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/projects/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to analyze project");
      setProject(prev => (prev ? { ...prev, analysis: json.analysis } : prev));
    } catch (e) {
      console.error(e);
      setAnalyzeError(e.message || "Failed to analyze project");
    } finally {
      setAnalyzing(false);
    }
  }

  async function generateWorkItems() {
    if (!projectId) return;
    setGeneratingWorkItems(true);
    setWorkItemsError(null);
    try {
      const res = await fetch("/api/projects/work-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate work items");
      // Refresh from Supabase for full details
      const supabase = getSupabaseClient();
      const { data: wi, error: wiError } = await supabase
        .from("work_items")
        .select("id, epic, title, description, priority, status, sprint_id, sprint_status, acceptance_criteria, dependencies")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (wiError) throw wiError;
      const normalized = (wi || []).map(item => ({
        ...item,
        acceptance_criteria: Array.isArray(item.acceptance_criteria)
          ? item.acceptance_criteria
          : typeof item.acceptance_criteria === "string" && item.acceptance_criteria.trim().startsWith("[")
          ? (() => {
              try {
                return JSON.parse(item.acceptance_criteria);
              } catch {
                return [];
              }
            })()
          : [],
      }));
      setWorkItems(normalized);
    } catch (e) {
      console.error(e);
      setWorkItemsError(e.message || "Failed to generate work items");
    } finally {
      setGeneratingWorkItems(false);
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <button
              type="button"
              className="mb-2 text-xs text-slate-400 hover:text-slate-200"
              onClick={() => router.push("/dashboard")}
            >
              
              Back to dashboard
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">{project?.name || "Project"}</h1>
            <p className="text-sm text-slate-400">
              Client message → AI analysis → project intelligence → work items.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={generateWorkItems}
              disabled={generatingWorkItems || !project?.analysis}
            >
              {generatingWorkItems ? "Generating work items…" : workItems.length ? "Re-generate work items" : "Generate work items"}
            </Button>
            <Button variant="outline" size="sm" onClick={triggerAnalysis} disabled={analyzing}>
              {analyzing ? "Analyzing…" : project?.analysis ? "Re-run analysis" : "Run analysis"}
            </Button>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-400">Loading project…</p>}
        {error && !loading && <p className="text-sm text-rose-400">{error}</p>}

        {!loading && !error && project && (
          <>
            <div className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Client message</CardTitle>
                  <CardDescription>
                    The original unstructured input ScopeFlow uses for analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-72 overflow-auto rounded-md bg-slate-950/60 p-3 text-xs text-slate-200 whitespace-pre-wrap">
                    {project.client_message}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis status</CardTitle>
                  <CardDescription>
                    Run Gemini analysis to extract requirements and calculate complexity/readiness.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {!project.analysis && !analyzing && (
                    <p className="text-slate-400">
                      This project has not been analyzed yet. Run the analysis to generate structured project
                      intelligence.
                    </p>
                  )}
                  {analyzing && (
                    <p className="text-slate-300">
                      Running Gemini analysis… This usually takes a few seconds.
                    </p>
                  )}
                  {analyzeError && <p className="text-rose-400">{analyzeError}</p>}
                  {project.analysis && !analyzing && (
                    <div className="space-y-2">
                      <p className="text-slate-200">{project.analysis.summary}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-200">
                          Complexity: {project.analysis.complexity}
                        </span>
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-200">
                          Readiness: {project.analysis.readiness}%
                        </span>
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-200">
                          Requirements: {project.analysis.requirements?.length || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {project.analysis && (
              <div className="mt-6 space-y-4">
                <IntelligenceOverview analysis={project.analysis} />

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <div>
                      <CardTitle>Work items</CardTitle>
                      <CardDescription>
                        AI-generated implementation tasks you can later execute in Kanban/Agile views.
                      </CardDescription>
                    </div>
                    <div className="rounded-full bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                      {workItems.length} {workItems.length === 1 ? "item" : "items"}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {workItemsError && (
                      <p className="text-xs text-rose-400">{workItemsError}</p>
                    )}
                    {workItemsLoading && !workItemsError && (
                      <p className="text-xs text-slate-400">Loading work items…</p>
                    )}
                    {!workItemsLoading && !workItemsError && workItems.length === 0 && (
                      <p className="text-xs text-slate-400">
                        No work items yet. Generate them from the analysis using the button above.
                      </p>
                    )}
                    {!workItemsLoading && !workItemsError && workItems.length > 0 && (
                      <div className="max-h-72 space-y-2 overflow-auto pr-1 text-xs">
                        {workItems.map(item => (
                          <div
                            key={item.id}
                            className="rounded-md border border-slate-800/70 bg-slate-950/40 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                  {item.epic || "Epic"}
                                </p>
                                <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                                {item.description && (
                                  <p className="text-slate-300">{item.description}</p>
                                )}
                                {Array.isArray(item.acceptance_criteria) && item.acceptance_criteria.length > 0 && (
                                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-300">
                                    {item.acceptance_criteria.map((ac, idx) => (
                                      <li key={idx}>{ac}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="shrink-0 space-y-1 text-right text-[11px] text-slate-400">
                                <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[10px]">
                                  {item.priority}
                                </span>
                                <div>{item.status}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <MethodologySelector
                  projectId={project.id}
                  initialMethodology={project.methodology}
                  hasWorkItems={workItems.length > 0}
                />

                {project.methodology === "KANBAN" && (
                  <div className="mt-4">
                    <KanbanBoard
                      workItems={workItems}
                      loading={workItemsLoading}
                      error={workItemsError}
                      onStatusChange={async (workItemId, status) => {
                        try {
                          // optimistic update
                          setWorkItems(prev =>
                            prev.map(item =>
                              item.id === workItemId ? { ...item, status } : item
                            )
                          );
                          const res = await fetch("/api/projects/work-items/status", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ workItemId, status })
                          });
                          if (!res.ok) {
                            const json = await res.json().catch(() => ({}));
                            throw new Error(json.error || "Failed to update status");
                          }
                        } catch (e) {
                          console.error(e);
                          setWorkItemsError(e.message || "Failed to update work item status");
                          // revert optimistic update on error by reloading from Supabase
                          try {
                            const supabase = getSupabaseClient();
                            const { data: wi } = await supabase
                              .from("work_items")
                              .select("id, epic, title, description, priority, status, acceptance_criteria, dependencies")
                              .eq("project_id", projectId)
                              .order("created_at", { ascending: true });
                            const normalized = (wi || []).map(item => ({
                              ...item,
                              acceptance_criteria: Array.isArray(item.acceptance_criteria)
                                ? item.acceptance_criteria
                                : typeof item.acceptance_criteria === "string" && item.acceptance_criteria.trim().startsWith("[")
                                ? (() => {
                                    try {
                                      return JSON.parse(item.acceptance_criteria);
                                    } catch {
                                      return [];
                                    }
                                  })()
                                : [],
                            }));
                            setWorkItems(normalized);
                          } catch {
                            // ignore secondary failure
                          }
                        }
                      }}
                    />
                  </div>
                )}

                {project.methodology === "AGILE" && (
                  <div className="mt-4">
                    <AgileBoard
                      currentSprint={sprints.find(s => s.status === "ACTIVE") || null}
                      backlogItems={workItems.filter(w => !w.sprint_id)}
                      sprintItems={workItems.filter(w => w.sprint_id && w.sprint_status)}
                      loading={workItemsLoading || sprintsLoading}
                      error={workItemsError || sprintsError}
                      creatingSprint={creatingSprint}
                      onCreateSprint={async () => {
                        if (!projectId) return;
                        setCreatingSprint(true);
                        setSprintsError(null);
                        try {
                          const res = await fetch("/api/projects/sprints", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ projectId, name: "Sprint 1" })
                          });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.error || "Failed to create sprint");
                          setSprints(prev => [...prev, json.sprint]);
                        } catch (e) {
                          console.error(e);
                          setSprintsError(e.message || "Failed to create sprint");
                        } finally {
                          setCreatingSprint(false);
                        }
                      }}
                      onAddToSprint={async item => {
                        const current = sprints.find(s => s.status === "ACTIVE");
                        if (!current) return;
                        // optimistic update
                        setWorkItems(prev =>
                          prev.map(w =>
                            w.id === item.id
                              ? { ...w, sprint_id: current.id, sprint_status: "TODO" }
                              : w
                          )
                        );
                        try {
                          const res = await fetch("/api/projects/sprint-items", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ workItemId: item.id, sprintId: current.id })
                          });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.error || "Failed to add item to sprint");
                        } catch (e) {
                          console.error(e);
                          setWorkItemsError(e.message || "Failed to add item to sprint");
                        }
                      }}
                      onMoveToBacklog={async item => {
                        // optimistic update
                        setWorkItems(prev =>
                          prev.map(w =>
                            w.id === item.id
                              ? { ...w, sprint_id: null, sprint_status: null }
                              : w
                          )
                        );
                        try {
                          const res = await fetch("/api/projects/sprint-items", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ workItemId: item.id })
                          });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.error || "Failed to move item to backlog");
                        } catch (e) {
                          console.error(e);
                          setWorkItemsError(e.message || "Failed to move item to backlog");
                        }
                      }}
                      onStatusChange={async (workItemId, sprintStatus) => {
                        // optimistic update
                        setWorkItems(prev =>
                          prev.map(item =>
                            item.id === workItemId ? { ...item, sprint_status: sprintStatus } : item
                          )
                        );
                        try {
                          const res = await fetch("/api/projects/sprint-items", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ workItemId, sprintStatus })
                          });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.error || "Failed to update sprint status");
                        } catch (e) {
                          console.error(e);
                          setWorkItemsError(e.message || "Failed to update sprint status");
                        }
                      }}
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <IntelligenceSectionList
                    title="Requirements"
                    description="Structured functional and non-functional requirements with traceability back to the client message."
                    emptyLabel="No requirements were extracted from the client message."
                    items={project.analysis.requirements}
                  />
                  <IntelligenceSectionList
                    title="Ambiguities"
                    description="Areas where the client message is unclear or underspecified. Clarifying these will improve readiness."
                    emptyLabel="No ambiguities were identified."
                    items={project.analysis.ambiguities}
                  />
                  <IntelligenceSectionList
                    title="Risks"
                    description="Potential delivery, technical, or requirement risks inferred from the client message."
                    emptyLabel="No explicit risks were captured."
                    items={project.analysis.risks}
                  />
                  <IntelligenceSectionList
                    title="Assumptions"
                    description="Assumptions the analysis had to make due to missing information. These should be validated with the client."
                    emptyLabel="No assumptions were recorded."
                    items={project.analysis.assumptions}
                  />
                  <IntelligenceSectionList
                    title="Dependencies"
                    description="External teams, systems, or constraints that could affect delivery."
                    emptyLabel="No dependencies were identified."
                    items={project.analysis.dependencies}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
