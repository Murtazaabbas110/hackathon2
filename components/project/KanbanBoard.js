"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { AnalogMeter } from "../ui/analog-meter";
import { calculateKanbanProgress } from "../../code-gigs/progress-calculator";

const STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const STATUS_CONFIG = {
  BACKLOG: { label: "Backlog", tone: "muted", dot: "bg-slate-500" },
  TODO: { label: "To Do", tone: "info", dot: "bg-sky-400" },
  IN_PROGRESS: { label: "In Progress", tone: "warning", dot: "bg-amber-400" },
  REVIEW: { label: "Review", tone: "accent", dot: "bg-violet-400" },
  DONE: { label: "Done", tone: "success", dot: "bg-emerald-400" },
};

function statusToLabel(status) {
  return STATUS_CONFIG[status]?.label || status;
}

function toneClasses(tone) {
  switch (tone) {
    case "success":
      return "border-emerald-500/40 bg-emerald-500/5";
    case "warning":
      return "border-amber-500/40 bg-amber-500/5";
    case "accent":
      return "border-violet-500/40 bg-violet-500/5";
    case "info":
      return "border-sky-500/40 bg-sky-500/5";
    default:
      return "border-slate-800/70 bg-slate-950/60";
  }
}

const PRIORITY_TONES = {
  HIGH: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  MEDIUM: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  LOW: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

function MoveButton({ direction, onClick, disabled, label }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
        disabled
          ? "cursor-not-allowed border-white/5 text-slate-600"
          : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-200 active:scale-95"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function WorkItemCard({
  item,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
}) {
  const hasDependencies =
    Array.isArray(item.dependencies) && item.dependencies.length > 0;
  const priorityTone = PRIORITY_TONES[item.priority] || PRIORITY_TONES.MEDIUM;
  const statusIndex = STATUSES.indexOf(item.status);
  const prevLabel =
    statusIndex > 0 ? statusToLabel(STATUSES[statusIndex - 1]) : null;
  const nextLabel =
    statusIndex >= 0 && statusIndex < STATUSES.length - 1
      ? statusToLabel(STATUSES[statusIndex + 1])
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs shadow-sm transition hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {item.epic || "Epic"}
            </p>
            {hasDependencies && (
              <span
                title={`Depends on ${item.dependencies.length} item${item.dependencies.length === 1 ? "" : "s"}`}
                className="flex items-center gap-1 rounded-full border border-sky-400/20 bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-sky-200"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-sky-300"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                {item.dependencies.length}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-100">{item.title}</p>
          {item.description && (
            <p className="line-clamp-3 text-[11px] text-slate-300">
              {item.description}
            </p>
          )}
          {Array.isArray(item.acceptance_criteria) &&
            item.acceptance_criteria.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-300">
                {item.acceptance_criteria.slice(0, 3).map((ac, idx) => (
                  <li key={idx}>{ac}</li>
                ))}
                {item.acceptance_criteria.length > 3 && (
                  <li className="text-slate-500">
                    +{item.acceptance_criteria.length - 3} more…
                  </li>
                )}
              </ul>
            )}
        </div>
        <div className="shrink-0 space-y-1 text-right text-[11px] text-slate-400">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityTone}`}
          >
            {item.priority || "MEDIUM"}
          </span>
          <span className="block text-[10px] text-slate-500">
            {statusToLabel(item.status)}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
        <MoveButton
          direction="left"
          disabled={!canMoveLeft}
          onClick={() => canMoveLeft && onMoveLeft?.(item)}
          label={prevLabel ? `Move to ${prevLabel}` : "Already in first stage"}
        />
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {statusToLabel(item.status)}
        </span>
        <MoveButton
          direction="right"
          disabled={!canMoveRight}
          onClick={() => canMoveRight && onMoveRight?.(item)}
          label={nextLabel ? `Move to ${nextLabel}` : "Already in last stage"}
        />
      </div>
    </div>
  );
}

function Column({ id, title, items, children }) {
  const tone = STATUS_CONFIG[id]?.tone || "muted";
  const dot = STATUS_CONFIG[id]?.dot || "bg-slate-500";

  return (
    <div
      className={`flex h-full min-h-[260px] w-[280px] shrink-0 snap-start flex-col rounded-2xl border p-3 text-xs transition ${toneClasses(
        tone,
      )}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            {title}
          </span>
        </div>
        <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-medium text-slate-300">
          {items.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-auto pr-1">
        {items.length === 0 && (
          <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/10 text-[11px] italic text-slate-500">
            No items here yet
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function KanbanBoard({ workItems, loading, error, onStatusChange }) {
  const itemsByStatus = useMemo(() => {
    const map = Object.fromEntries(STATUSES.map((s) => [s, []]));
    for (const item of workItems || []) {
      const status = STATUSES.includes(item.status) ? item.status : "BACKLOG";
      map[status].push(item);
    }
    return map;
  }, [workItems]);

  const total = workItems?.length || 0;
  const progress = total ? calculateKanbanProgress(workItems) : 0;

  async function moveItem(item, targetStatus) {
    if (!item || !targetStatus || item.status === targetStatus) return;
    await onStatusChange?.(item.id, targetStatus);
  }

  return (
    <Card className="border-slate-700/70 bg-slate-900/60">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-slate-50">
              Kanban execution
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Use the arrows on each card to move it through the workflow.
              Progress is calculated deterministically from completed items.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <AnalogMeter
              value={progress}
              label="Progress"
              sublabel="Completed work items"
              tone="emerald"
              size="sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-xs">
        {loading && (
          <p className="text-slate-400">Loading work items for Kanban…</p>
        )}
        {error && !loading && (
          <p className="text-rose-400">Failed to load work items: {error}</p>
        )}
        {!loading && !error && (!workItems || workItems.length === 0) && (
          <p className="text-slate-400">
            No work items available. Generate work items from the analysis to
            start executing in Kanban.
          </p>
        )}
        {!loading && !error && workItems && workItems.length > 0 && (
          <div className="-mx-3 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:px-4">
            <div className="flex snap-x snap-mandatory items-stretch gap-3">
              {STATUSES.map((status) => {
                const items = itemsByStatus[status] || [];
                return (
                  <Column
                    key={status}
                    id={status}
                    title={statusToLabel(status)}
                    items={items}
                  >
                    {items.map((item) => {
                      const statusIndex = STATUSES.indexOf(item.status);
                      const prevStatus = STATUSES[statusIndex - 1];
                      const nextStatus = STATUSES[statusIndex + 1];
                      return (
                        <WorkItemCard
                          key={item.id}
                          item={item}
                          canMoveLeft={Boolean(prevStatus)}
                          canMoveRight={Boolean(nextStatus)}
                          onMoveLeft={() => moveItem(item, prevStatus)}
                          onMoveRight={() => moveItem(item, nextStatus)}
                        />
                      );
                    })}
                  </Column>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
