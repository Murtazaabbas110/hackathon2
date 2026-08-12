"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { AnalogMeter } from "../ui/analog-meter";

const SPRINT_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_CONFIG = {
  TODO: { label: "To Do" },
  IN_PROGRESS: { label: "In Progress" },
  DONE: { label: "Done" },
};

function toneClasses(status) {
  switch (status) {
    case "DONE":
      return "border-emerald-500/40 bg-emerald-500/5";
    case "IN_PROGRESS":
      return "border-amber-500/40 bg-amber-500/5";
    case "TODO":
    default:
      return "border-slate-800/70 bg-slate-950/60";
  }
}

function SprintWorkItemCard({ item, isDragging = false, onRemoveFromSprint }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border bg-white/5 p-3 text-xs shadow-sm transition
        ${isDragging ? "border-emerald-400/70 shadow-lg shadow-emerald-900/40" : "border-white/10"}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {item.epic || "Epic"}
          </p>
          <p className="text-sm font-semibold text-slate-100">{item.title}</p>
          {item.description && (
            <p className="text-[11px] text-slate-300 line-clamp-3">
              {item.description}
            </p>
          )}
        </div>
        <div className="shrink-0 space-y-1 text-right text-[11px] text-slate-400">
          <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide">
            {item.priority || "MEDIUM"}
          </span>
          <span className="block text-[10px] text-slate-500">
            {STATUS_CONFIG[item.status]?.label || item.status}
          </span>
        </div>
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

function SortableSprintWorkItem({ item, onRemoveFromSprint }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <SprintWorkItemCard
        item={item}
        isDragging={isDragging}
        onRemoveFromSprint={onRemoveFromSprint}
      />
    </div>
  );
}

function SprintColumn({ id, items, isOver, onRemoveFromSprint }) {
  return (
    <div
      className={`flex h-full min-h-[220px] flex-col rounded-2xl border p-3 text-xs transition ${
        isOver ? "border-emerald-400/60 bg-emerald-500/5" : toneClasses(id)
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
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
          <p className="text-[11px] italic text-slate-500">
            Drop sprint items here.
          </p>
        )}
        {items.map((item) => (
          <SortableSprintWorkItem
            key={item.id}
            item={item}
            onRemoveFromSprint={onRemoveFromSprint}
          />
        ))}
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
  const [activeId, setActiveId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const itemsByStatus = useMemo(() => {
    const map = Object.fromEntries(SPRINT_STATUSES.map((s) => [s, []]));
    for (const item of sprintItems || []) {
      const status = SPRINT_STATUSES.includes(item.status)
        ? item.status
        : "TODO";
      map[status].push(item);
    }
    return map;
  }, [sprintItems]);

  const activeItem = useMemo(
    () =>
      activeId
        ? (sprintItems || []).find((i) => i.id === activeId) || null
        : null,
    [activeId, sprintItems],
  );

  function handleDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragOver(event) {
    const { over } = event;
    if (!over) return;
    const columnId = over.data.current?.columnId || over.id;
    if (SPRINT_STATUSES.includes(columnId)) {
      setOverColumn(columnId);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setOverColumn(null);
    if (!over) {
      setActiveId(null);
      return;
    }

    const targetColumn = over.data.current?.columnId || over.id;
    if (!SPRINT_STATUSES.includes(targetColumn)) {
      setActiveId(null);
      return;
    }

    const item = (sprintItems || []).find((i) => i.id === active.id);
    if (!item || item.status === targetColumn) {
      setActiveId(null);
      return;
    }

    await onStatusChange?.(item.id, targetColumn);
    setActiveId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverColumn(null);
  }

  const total = sprintItems?.length || 0;
  const done = sprintItems?.filter((w) => w.status === "DONE").length || 0;
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="border-slate-700/70 bg-slate-900/60">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-slate-50">
              Agile execution
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Plan a sprint from your product backlog, then move items from To
              Do to Done.
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="grid gap-3 md:grid-cols-3">
                  {SPRINT_STATUSES.map((status) => (
                    <SortableContext
                      key={status}
                      items={itemsByStatus[status].map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        id={status}
                        data-column-id={status}
                        data-dndkit-droppable="true"
                        className="min-h-[220px]"
                      >
                        <SprintColumn
                          id={status}
                          items={itemsByStatus[status]}
                          isOver={overColumn === status}
                          onRemoveFromSprint={onMoveToBacklog}
                        />
                      </div>
                    </SortableContext>
                  ))}
                </div>

                <DragOverlay>
                  {activeItem ? (
                    <SprintWorkItemCard
                      item={activeItem}
                      isDragging
                      onRemoveFromSprint={onMoveToBacklog}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
