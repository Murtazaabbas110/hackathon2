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
import { Button } from "../ui/button";
import { AnalogMeter } from "../ui/analog-meter";
import { calculateSprintProgress } from "../../code-gigs/progress-calculator";

const SPRINT_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_CONFIG = {
  TODO: { label: "To Do", dot: "bg-sky-400" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-amber-400" },
  DONE: { label: "Done", dot: "bg-emerald-400" },
};

function toneClasses(status) {
  switch (status) {
    case "DONE":
      return "border-emerald-500/40 bg-emerald-500/5";
    case "IN_PROGRESS":
      return "border-amber-500/40 bg-amber-500/5";
    case "TODO":
    default:
      return "border-sky-500/40 bg-sky-500/5";
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

function SprintWorkItemCard({
  item,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onRemoveFromSprint,
}) {
  const priorityTone = PRIORITY_TONES[item.priority] || PRIORITY_TONES.MEDIUM;
  const statusIndex = SPRINT_STATUSES.indexOf(item.sprint_status);
  const prevLabel =
    statusIndex > 0
      ? STATUS_CONFIG[SPRINT_STATUSES[statusIndex - 1]]?.label
      : null;
  const nextLabel =
    statusIndex >= 0 && statusIndex < SPRINT_STATUSES.length - 1
      ? STATUS_CONFIG[SPRINT_STATUSES[statusIndex + 1]]?.label
      : null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs shadow-sm transition hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {item.epic || "Epic"}
          </p>
          <p className="text-sm font-semibold text-slate-100">{item.title}</p>
          {item.description && (
            <p className="line-clamp-3 text-[11px] text-slate-300">
              {item.description}
            </p>
          )}
        </div>
        <div className="shrink-0 space-y-1 text-right text-[11px] text-slate-400">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityTone}`}
          >
            {item.priority || "MEDIUM"}
          </span>
          <span className="block text-[10px] text-slate-500">
            {STATUS_CONFIG[item.sprint_status]?.label || item.sprint_status || "TODO"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/5 pt-2">
        <MoveButton
          direction="left"
          disabled={!canMoveLeft}
          onClick={() => canMoveLeft && onMoveLeft?.(item)}
          label={prevLabel ? `Move to ${prevLabel}` : "Already in first stage"}
        />
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {STATUS_CONFIG[item.sprint_status]?.label || item.sprint_status || "TODO"}
        </span>
        <MoveButton
          direction="right"
          disabled={!canMoveRight}
          onClick={() => canMoveRight && onMoveRight?.(item)}
          label={nextLabel ? `Move to ${nextLabel}` : "Already in last stage"}
        />
      </div>
      {onRemoveFromSprint && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onRemoveFromSprint(item)}
            className="text-[11px] text-slate-400 hover:text-rose-300"
          >
            Move back to backlog
          </button>
        </div>
      )}
    </div>
  );
}

function SprintColumn({ id, items, children }) {
  const dot = STATUS_CONFIG[id]?.dot || "bg-slate-500";

  return (
    <div
      className={`flex h-full min-h-[220px] flex-col rounded-2xl border p-3 text-xs transition ${toneClasses(
        id,
      )}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            {STATUS_CONFIG[id]?.label || id}
          </span>
        </div>
        <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-medium text-slate-300">
          {items.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-auto pr-1">
        {items.length === 0 && (
          <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-white/10 text-[11px] italic text-slate-500">
            No items here yet
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function AgileBoard({
  currentSprint,
  backlogItems,
  sprintItems,
  loading,
  error,
  creatingSprint,
  onCreateSprint,
  onAddToSprint,
  onMoveToBacklog,
  onStatusChange,
}) {
  const itemsByStatus = useMemo(() => {
    const map = Object.fromEntries(SPRINT_STATUSES.map((s) => [s, []]));
    for (const item of sprintItems || []) {
      const status = SPRINT_STATUSES.includes(item.sprint_status)
        ? item.sprint_status
        : "TODO";
      map[status].push(item);
    }
    return map;
  }, [sprintItems]);

  const total = sprintItems?.length || 0;
  const progress = total ? calculateSprintProgress(sprintItems) : 0;

  async function moveItem(item, targetStatus) {
    if (!item || !targetStatus || item.sprint_status === targetStatus) return;
    await onStatusChange?.(item.id, targetStatus);
  }

  return (
    <Card className="border-slate-700/70 bg-slate-900/60">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-slate-50">
              Agile execution
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Plan a sprint from your product backlog, then use the arrows on
              each card to move items from To Do to Done.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex flex-col items-end gap-1">
              <span className="text-slate-400">
                {currentSprint
                  ? `Current sprint: ${currentSprint.name}`
                  : "No active sprint yet"}
              </span>
              {currentSprint?.goal && (
                <span className="max-w-xs truncate text-[11px] text-slate-500">
                  Goal: {currentSprint.goal}
                </span>
              )}
            </div>
            <AnalogMeter
              value={progress}
              label="Progress"
              sublabel="Sprint items complete"
              tone="emerald"
              size="sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {loading && (
          <p className="text-slate-400">Loading backlog and sprint…</p>
        )}
        {error && !loading && <p className="text-rose-400">{error}</p>}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Product backlog
                </p>
                <p className="text-[11px] text-slate-500">
                  Items without a sprint are treated as backlog. Add them into
                  the current sprint when ready.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                disabled={creatingSprint}
                onClick={onCreateSprint}
              >
                {creatingSprint
                  ? "Creating sprint…"
                  : currentSprint
                    ? "New sprint (after closing this one)"
                    : "Create sprint"}
              </Button>
            </div>

            <div className="rounded-lg border border-slate-800/70 bg-slate-950/40 p-2">
              {backlogItems.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  No items in the product backlog. Generate work items or move
                  items out of the sprint to see them here.
                </p>
              ) : (
                <div className="max-h-52 space-y-2 overflow-auto pr-1">
                  {backlogItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-slate-800/70 bg-slate-950/80 p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          {item.epic || "Epic"}
                        </p>
                        <p className="text-sm font-semibold text-slate-100">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-[11px] text-slate-300 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2 text-[11px] text-slate-400">
                        <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          {item.priority || "MEDIUM"}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => onAddToSprint?.(item)}
                          disabled={!currentSprint}
                        >
                          Add to sprint
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!currentSprint && (
              <p className="text-[11px] text-slate-500">
                Create a sprint to start executing. You can still refine the
                backlog without an active sprint.
              </p>
            )}

            {currentSprint && (
              <div className="grid gap-3 md:grid-cols-3">
                {SPRINT_STATUSES.map((status) => (
                  <SprintColumn
                    key={status}
                    id={status}
                    items={itemsByStatus[status]}
                  >
                    {itemsByStatus[status].map((item) => {
                      const statusIndex = SPRINT_STATUSES.indexOf(
                        item.sprint_status,
                      );
                      const prevStatus = SPRINT_STATUSES[statusIndex - 1];
                      const nextStatus = SPRINT_STATUSES[statusIndex + 1];
                      return (
                        <SprintWorkItemCard
                          key={item.id}
                          item={item}
                          canMoveLeft={Boolean(prevStatus)}
                          canMoveRight={Boolean(nextStatus)}
                          onMoveLeft={() => moveItem(item, prevStatus)}
                          onMoveRight={() => moveItem(item, nextStatus)}
                          onRemoveFromSprint={onMoveToBacklog}
                        />
                      );
                    })}
                  </SprintColumn>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
