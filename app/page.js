"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getLocalUser } from "../components/AuthGuard";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getLocalUser();
    if (user) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr,1.2fr] items-center">
      <section className="space-y-6">
        <p className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
          AI-powered project intelligence for client work
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-50">
          Turn messy client requirements into an execution-ready plan.
        </h1>
        <p className="max-w-xl text-base text-slate-400">
          ScopeFlow analyzes vague client messages, extracts structured requirements, and turns them into
          project intelligence you can execute on immediately 
          
          
          
          
          
          
          
          — complete with readiness signals and a workflow-ready backlog.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push("/login")} size="lg">
            Continue to demo
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
            Try it with a client message
          </Button>
        </div>
        <ul className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>From unstructured messages to structured project intel in one step.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>Built for agencies, freelancers, and product teams running fast.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span>Gemini-powered analysis with deterministic readiness and complexity.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>No signup, no passwords — just a local demo workspace.</span>
          </li>
        </ul>
      </section>
      <section>
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle>From chaos to clarity in minutes</CardTitle>
            <CardDescription>
              ScopeFlow walks your client message through analysis, planning, and execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-slate-200">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">1</span>
                <div>
                  <p className="font-medium">Paste a messy client brief</p>
                  <p className="text-slate-400">Drop in that long email or chat transcript with conflicting asks.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">2</span>
                <div>
                  <p className="font-medium">Let ScopeFlow analyze the scope</p>
                  <p className="text-slate-400">Gemini extracts requirements, risks, assumptions, and dependencies with evidence.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">3</span>
                <div>
                  <p className="font-medium">Get an execution-ready workspace</p>
                  <p className="text-slate-400">See complexity and readiness, then move into work items, Kanban, and Agile execution.</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
