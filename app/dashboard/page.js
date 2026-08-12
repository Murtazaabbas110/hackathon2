"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard, getLocalUser } from "../../components/AuthGuard";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { getSupabaseClient } from "../../code-gigs/supabase-client";
import { LOCAL_USER_KEY } from "../../code-gigs/auth-route-guard";

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
          .select("id, name, created_at, analysis")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (isMounted) setProjects(data || []);
      } catch (e) {
        console.error(e);
        if (isMounted) setError(e.message || "Failed to load projects");
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
    const u = getLocalUser();
    if (!u) return;
    setUser(u);
  }, []);

  const { projects, loading, error } = useProjects(user?.id);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_USER_KEY);
      router.push("/login");
    }
  }

  const total = projects.length;
  const analyzed = projects.filter(p => p.analysis && p.analysis.readiness != null).length;

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400">
              Welcome{user ? `, ${user.name}` : ""}. Turn client messages into execution-ready projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
            <Button onClick={() => router.push("/projects/new")}>New project</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="mb-1">
              <CardDescription>Total projects</CardDescription>
              <CardTitle className="text-2xl">{loading ? "—" : total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="mb-1">
              <CardDescription>Analyzed projects</CardDescription>
              <CardTitle className="text-2xl">{loading ? "—" : analyzed}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="mb-1">
              <CardDescription>Average readiness</CardDescription>
              <CardTitle className="text-2xl">
                {loading
                  ? "—"
                  : projects.length
                  ? `${Math.round(
                      projects.reduce((acc, p) => acc + (p.analysis?.readiness ?? 0), 0) / projects.length
                    )}%`
                  : "—"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your projects</CardTitle>
            <CardDescription>
              Projects are stored in Supabase using your demo user id from localStorage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-slate-400">Loading projects…</p>}
            {error && !loading && (
              <p className="text-sm text-rose-400">Failed to load projects: {error}</p>
            )}
            {!loading && !error && projects.length === 0 && (
              <div className="text-sm text-slate-400">
                No projects yet. Start by creating a new project from a messy client message.
              </div>
            )}
            {!loading && !error && projects.length > 0 && (
              <ul className="divide-y divide-slate-800 text-sm">
                {projects.map(project => (
                  <li
                    key={project.id}
                    className="flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-slate-900/40 px-2 rounded-md"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <div>
                      <p className="font-medium text-slate-100">{project.name}</p>
                      <p className="text-xs text-slate-500">
                        Created {new Date(project.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{project.analysis?.summary ? "Analyzed" : "Awaiting analysis"}</p>
                      {project.analysis?.readiness != null && <p>Readiness {project.analysis.readiness}%</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
