"use client";

import { useEffect, useMemo, useState } from "react";

const ANALYSIS_STEPS = [
  "Understanding project scope",
  "Extracting requirements",
  "Identifying ambiguities",
  "Evaluating risks",
  "Preparing project intelligence",
];

const WORK_ITEM_STEPS = [
  "Mapping execution tracks",
  "Drafting practical tasks",
  "Finalizing backlog",
];

export function AIStepLoader({ mode = "analysis" }) {
  const steps = useMemo(
    () => (mode === "work-items" ? WORK_ITEM_STEPS : ANALYSIS_STEPS),
    [mode],
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 1300);

    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="rounded-2xl border border-sky-400/25 bg-sky-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
        AI processing
      </p>
      <div className="mt-3 space-y-2.5">
        {steps.map((step, index) => {
          const done = index < active;
          const current = index === active;

          return (
            <div key={step} className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full transition ${
                  done
                    ? "bg-emerald-400"
                    : current
                      ? "bg-sky-300 shadow-[0_0_0_4px_rgba(125,211,252,0.2)]"
                      : "bg-slate-600"
                }`}
              />
              <p
                className={`text-xs transition ${
                  current
                    ? "text-sky-100"
                    : done
                      ? "text-emerald-200"
                      : "text-slate-400"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
