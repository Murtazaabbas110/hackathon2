"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard, getLocalUser } from "../../../components/AuthGuard";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { getSupabaseClient } from "../../../code-gigs/supabase-client";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getLocalUser());
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
          client_message: message.trim()
        })
        .select("id")
        .single();
      if (error) throw error;

      // Kick off AI analysis via API route
      await fetch("/api/projects/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: data.id })
      });

      router.push(`/projects/${data.id}`);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>New project from client message</CardTitle>
            <CardDescription>
              Give your project a short name and paste the raw client message you want ScopeFlow to analyze.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200" htmlFor="name">
                  Project name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Marketing site revamp for Acme Co."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200" htmlFor="message">
                  Client message
                </label>
                <textarea
                  id="message"
                  rows={10}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Paste the email, brief, or chat transcript from your client here..."
                />
                <p className="text-xs text-slate-500">
                  ScopeFlow will run a single Gemini analysis call to extract requirements, risks, assumptions, and more.
                </p>
              </div>
              {error && <p className="text-sm text-rose-400">{error}</p>}
              <div className="flex items-center justify-between gap-4 pt-2">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !name.trim() || !message.trim()}>
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
