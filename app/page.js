"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getLocalUser } from "../components/AuthGuard";
import { AnalogMeter } from "../components/ui/analog-meter";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getLocalUser();

    if (user) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[2fr,1.2fr]">
      <section className="space-y-6">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          {/* Hero Section */}
          <section className="space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              AI-powered project intelligence for client work
            </span>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
                Turn messy client requirements into an execution-ready plan.
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                ScopeFlow turns vague client messages into structured project
                intelligence, then gives you a ready-to-run backlog,
                methodology, and readiness signal in one polished workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/login")} size="lg">
                Continue to demo
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/login")}
              >
                Try it with a client message
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  What it does
                </p>

                <p className="mt-2 text-sm text-slate-200">
                  From unstructured messages to structured project intel in one
                  step.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Who it helps
                </p>

                <p className="mt-2 text-sm text-slate-200">
                  Built for agencies, freelancers, and product teams running
                  fast.
                </p>
              </div>
            </div>
          </section>

          {/* Right Side */}
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <AnalogMeter
                value={84}
                label="Demo readiness"
                sublabel="A polished starting point for client work"
                tone="emerald"
                size="md"
              />

              <AnalogMeter
                value={42}
                label="Complexity"
                sublabel="Visualizes how hard the scope feels before planning"
                tone="amber"
                size="md"
              />
            </div>

            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle>From chaos to clarity in minutes</CardTitle>

                <CardDescription>
                  ScopeFlow walks your client message through analysis,
                  planning, and execution.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ol className="space-y-4 text-sm text-slate-200">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold">
                      1
                    </span>

                    <div>
                      <p className="font-medium">Paste a messy client brief</p>

                      <p className="mt-1 text-slate-400">
                        Drop in that long email or chat transcript with
                        conflicting asks.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold">
                      2
                    </span>

                    <div>
                      <p className="font-medium">
                        Let ScopeFlow analyze the scope
                      </p>

                      <p className="mt-1 text-slate-400">
                        Gemini extracts requirements, risks, assumptions, and
                        dependencies with evidence.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold">
                      3
                    </span>

                    <div>
                      <p className="font-medium">
                        Get an execution-ready workspace
                      </p>

                      <p className="mt-1 text-slate-400">
                        See complexity and readiness, then move into work items,
                        Kanban, and Agile execution.
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </section>
        </div>
      </section>
    </div>
  );
}
