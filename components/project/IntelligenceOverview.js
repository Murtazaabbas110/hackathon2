"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { AnalogMeter } from "../ui/analog-meter";

function StatPill({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "bg-slate-800 text-slate-100",
    success: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40",
    warning: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
    danger: "bg-rose-500/10 text-rose-300 border border-rose-500/40",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone] || toneClasses.default}`}
    >
      <span className="text-slate-400/80">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export function IntelligenceOverview({ analysis }) {
  if (!analysis) return null;

  const requirementsCount = analysis.requirements?.length || 0;
  const risksCount = analysis.risks?.length || 0;
  const ambiguitiesCount = analysis.ambiguities?.length || 0;

  let readinessTone = "success";
  if (analysis.readiness < 40) readinessTone = "danger";
  else if (analysis.readiness < 75) readinessTone = "warning";

  let complexityTone = "default";
  if (analysis.complexity === "LOW") complexityTone = "success";
  if (analysis.complexity === "HIGH") complexityTone = "danger";

  return (
    <Card className="border-slate-700/70 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="text-sm font-semibold tracking-tight text-slate-50">
          Overview
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Snapshot of the project intelligence extracted from the client
          message.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr] lg:items-center">
          <div className="space-y-3">
            {analysis.summary && (
              <p className="leading-relaxed text-slate-100">
                {analysis.summary}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <StatPill
                label="Complexity"
                value={analysis.complexity || "N/A"}
                tone={complexityTone}
              />
              <StatPill label="Requirements" value={requirementsCount} />
              <StatPill
                label="Risks"
                value={risksCount}
                tone={risksCount ? "danger" : "success"}
              />
              <StatPill
                label="Ambiguities"
                value={ambiguitiesCount}
                tone={ambiguitiesCount ? "warning" : "success"}
              />
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <AnalogMeter
              value={analysis.readiness ?? 0}
              label="Readiness"
              sublabel="Execution confidence from the extracted scope"
              tone={
                readinessTone === "danger"
                  ? "rose"
                  : readinessTone === "warning"
                    ? "amber"
                    : "emerald"
              }
              size="lg"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Objectives
            </h3>
            {analysis.objectives?.length ? (
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-200">
                {analysis.objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                No objectives were extracted.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Target users
            </h3>
            {analysis.targetUsers?.length ? (
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-200">
                {analysis.targetUsers.map((user, idx) => (
                  <li key={idx}>{user}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                No explicit target users were identified.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
