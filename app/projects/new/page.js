"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "../../../components/AuthGuard";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";
import {
  formatSupabaseError,
  getSupabaseClient,
} from "../../../code-gigs/supabase-client";
import { getSessionUser } from "../../../code-gigs/auth-route-guard";
import { AnalogMeter } from "../../../components/ui/analog-meter";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const sessionUser = await getSessionUser();
      if (isMounted) setUser(sessionUser);
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !user) return;
    setSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: name.trim(),
          client_message: message.trim(),
        })
        .select("id")
        .single();
      if (error) throw error;

      // Kick off AI analysis via API route
      await fetch("/api/projects/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: data.id }),
      });

      router.push(`/projects/${data.id}`);
    } catch (e) {
      console.error(e);
      setError(formatSupabaseError(e, "Failed to create project"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGuard>
      <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-start">
        <section className="space-y-5 lg:sticky lg:top-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            New project intake
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            New project from client message
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Give your project a short name and paste the raw client message you
            want ScopeFlow to analyze.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <AnalogMeter
              value={76}
              label="Intake clarity"
              sublabel="A strong brief creates better analysis"
              tone="sky"
              size="md"
            />
            <AnalogMeter
              value={38}
              label="Time to first insight"
              sublabel="Fast entry, fast analysis"
              tone="emerald"
              size="md"
            />
          </div>
        </section>
        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <CardDescription>
              Keep it concise, then let the AI generate the structured plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-slate-200"
                  htmlFor="name"
                >
                  Project name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marketing site revamp for Acme Co."
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-slate-200"
                  htmlFor="message"
                >
                  Client message
                </label>
                <textarea
                  id="message"
                  rows={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Paste the email, brief, or chat transcript from your client here..."
                />
                <p className="text-xs text-slate-400">
                  ScopeFlow will run a single Groq analysis call to extract
                  requirements, risks, assumptions, and more.
                </p>
              </div>
              {error && <p className="text-sm text-rose-400">{error}</p>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !name.trim() || !message.trim()}
                >
                  {submitting ? "Creating and analyzing…" : "Create project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
