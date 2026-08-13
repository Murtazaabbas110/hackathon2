"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "../../components/AuthGuard";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { AnalogMeter } from "../../components/ui/analog-meter";
import {
  formatSupabaseError,
  getSupabaseClient,
} from "../../code-gigs/supabase-client";
import { getSessionUser } from "../../code-gigs/auth-route-guard";
import { calculateProjectProgress } from "../../code-gigs/progress-calculator";

function useProjects(userId) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("projects")
          .select("id, name, created_at, analysis, methodology, work_items(status)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (isMounted) setProjects(data || []);
      } catch (e) {
        console.error(e);
        if (isMounted)
          setError(formatSupabaseError(e, "Failed to load projects"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { projects, loading, error };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSessionUser() {
      const sessionUser = await getSessionUser();
      if (isMounted) {
        setUser(sessionUser);
      }
    }

    loadSessionUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const { projects, loading, error } = useProjects(user?.id);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  const total = projects.length;
  const analyzed = projects.filter(
    (p) => p.analysis && p.analysis.readiness != null,
  ).length;
  const active = projects.filter((p) => p.methodology).length;
  const avgReadiness = projects.length
    ? Math.round(
        projects.reduce((acc, p) => acc + (p.analysis?.readiness ?? 0), 0) /
          projects.length,
      )
    : 0;
  const overallProgress = projects.length
    ? Math.round(
        projects.reduce((acc, p) => acc + calculateProjectProgress(p.work_items || []), 0) /
          projects.length,
      )
    : 0;

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="surface-panel overflow-hidden p-0">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
            <div className="space-y-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Workspace dashboard
              </span>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                  Dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Welcome{user ? `, ${user.username}` : ""}. Turn client messages
                  into execution-ready projects with a cleaner, more responsive
                  workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
                <Button onClick={() => router.push("/projects/new")}>
                  New project
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <AnalogMeter
                value={loading ? 0 : Math.min(total * 16, 100)}
                label="Project capacity"
                sublabel={`${total} total projects`}
                tone="sky"
                size="sm"
              />
              <AnalogMeter
                value={
                  loading
                    ? 0
                    : analyzed
                      ? Math.round((analyzed / Math.max(total, 1)) * 100)
                      : 0
                }
                label="Analyzed share"
                sublabel={`${analyzed} analyzed projects`}
                tone="emerald"
                size="sm"
              />
              <AnalogMeter
                value={
                  loading
                    ? 0
                    : projects.length
                      ? Math.round(
                          projects.reduce(
                            (acc, p) => acc + (p.analysis?.readiness ?? 0),
                            0,
                          ) / projects.length,
                        )
                      : 0
                }
                label="Avg readiness"
                sublabel="Across all projects"
                tone="amber"
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="transition-transform hover:-translate-y-0.5">
            <CardHeader className="mb-1">
              <CardDescription>Total projects</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "—" : total}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="transition-transform hover:-translate-y-0.5">
            <CardHeader className="mb-1">
              <CardDescription>Active projects</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "—" : active}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="transition-transform hover:-translate-y-0.5">
            <CardHeader className="mb-1">
              <CardDescription>Average readiness</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "—" : `${avgReadiness}%`}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="transition-transform hover:-translate-y-0.5 sm:col-span-3">
            <CardHeader className="mb-1">
              <CardDescription>Overall progress</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "—" : `${overallProgress}%`}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your projects</CardTitle>
            <CardDescription>
              Projects are stored in Supabase using your authenticated user id.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-slate-400">Loading projects…</p>
            )}
            {error && !loading && (
              <p className="text-sm text-rose-400">
                Failed to load projects: {error}
              </p>
            )}
            {!loading && !error && projects.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                <p className="text-base font-semibold text-slate-100">
                  No projects yet
                </p>
                <p className="mt-1 text-slate-400">
                  Start with a client message and generate your first execution-ready workspace.
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => router.push("/projects/new")}
                >
                  Create your first project
                </Button>
              </div>
            )}
            {!loading && !error && projects.length > 0 && (
              <ul className="divide-y divide-white/8 text-sm">
                {projects.map((project) => {
                  const items = project.work_items || [];
                  const progress = calculateProjectProgress(items);
                  const done = items.filter((w) => w.status === "DONE").length;
                  return (
                    <li
                      key={project.id}
                      className="flex cursor-pointer flex-col gap-3 rounded-2xl px-3 py-4 transition hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <div className="min-w-0 space-y-2">
                        <p className="truncate font-medium text-slate-100">
                          {project.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Updated {new Date(project.created_at).toLocaleString()}
                        </p>
                        {items.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {done}/{items.length} done · {progress}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 sm:text-right">
                        {project.methodology && (
                          <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sky-200">
                            {project.methodology}
                          </div>
                        )}
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                          {project.analysis?.summary
                            ? "Analyzed"
                            : "Awaiting analysis"}
                        </div>
                        {project.analysis?.readiness != null && (
                          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                            Readiness {project.analysis.readiness}%
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
