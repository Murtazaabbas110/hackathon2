"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, KanbanSquare, Timer } from "lucide-react";

const ALLOWED_METHODS = ["KANBAN", "AGILE"];

function normalizeMethodology(value) {
  if (!value) return null;
  const upper = String(value).toUpperCase();
  return ALLOWED_METHODS.includes(upper) ? upper : null;
}

const OPTIONS = [
  {
    id: "KANBAN",
    label: "Kanban",
    tagline: "Continuous flow",
    description:
      "Continuous workflow for teams that want to move work through stages without fixed sprints.",
    icon: KanbanSquare,
  },
  {
    id: "AGILE",
    label: "Agile",
    tagline: "Sprint-based",
    description:
      "Sprint-based execution for teams that want structured iterations and focused delivery cycles.",
    icon: Timer,
  },
];

export function MethodologySelector({
  projectId,
  initialMethodology,
  hasWorkItems,
}) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setSelected(normalizeMethodology(initialMethodology));
  }, [initialMethodology]);

  async function handleSave() {
    if (!projectId) return;
    setError(null);
    setSuccess(null);

    const normalized = normalizeMethodology(selected);
    if (!normalized) {
      setError("Please choose KANBAN or AGILE.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/projects/methodology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, methodology: normalized }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save methodology");
      }
      setSuccess("Methodology saved. You can change this later if needed.");
      setSelected(normalized);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to save methodology");
    } finally {
      setSaving(false);
    }
  }

  if (!hasWorkItems) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight text-slate-50">
            Execution methodology
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Generate work items first. Once you have a backlog, you can choose
            how you want to execute.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-slate-500">
          Generate AI work items to unlock methodology selection.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-700/70 bg-slate-900/60">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-sm font-semibold tracking-tight text-slate-50">
            Choose your execution method
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Select how this project will run. This does not trigger any AI calls
            and can be changed later.
          </CardDescription>
        </div>
        {selected && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="h-3 w-3" />
            {selected}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid gap-3 md:grid-cols-2">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelected(option.id)}
                className={`group flex h-full flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                  ${isSelected ? "border-emerald-400/70 bg-emerald-400/10 shadow-lg shadow-emerald-950/20" : "border-white/10 bg-white/5 hover:border-slate-400/40 hover:bg-white/10"}
                `}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-slate-200 transition
                        ${isSelected ? "border-emerald-300 bg-emerald-400/15" : "border-white/10 bg-slate-950/80 group-hover:border-slate-400/50"}
                      `}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-100">
                        {option.label}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {option.tagline}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        {error && <p className="text-[11px] text-rose-400">{error}</p>}
        {success && <p className="text-[11px] text-emerald-300">{success}</p>}

        <div className="flex items-center justify-between gap-3 pt-1 text-[11px] text-slate-400">
          <p>
            You can change the methodology later; it will be used to drive the
            execution views in upcoming phases.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saving || !selected}
            onClick={handleSave}
            className="h-8 px-3 text-xs"
          >
            {saving
              ? "Saving…"
              : selected
                ? `Save ${selected}`
                : "Select a method"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
