"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

const STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const STATUS_CONFIG = {
  BACKLOG: { label: "Backlog", tone: "muted" },
  TODO: { label: "To Do", tone: "info" },
  IN_PROGRESS: { label: "In Progress", tone: "warning" },
  REVIEW: { label: "Review", tone: "accent" },
  DONE: { label: "Done", tone: "success" }
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
      return "border-sky-500/40 bg-sky-500/5";
    case "info":
      return "border-slate-600/60 bg-slate-900/70";
    default:
      return "border-slate-800/70 bg-slate-950/60";
  }
}

function WorkItemCard({ item, isDragging = false }) {
  return (
    <div
      className={`rounded-md border bg-slate-950/80 p-3 text-xs shadow-sm transition
        ${isDragging ? "border-emerald-400/70 shadow-lg shadow-emerald-900/40" : "border-slate-800/70"}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {item.epic || "Epic"}
          </p>
          <p className="text-sm font-semibold text-slate-100">{item.title}</p>
          {item.description && (
            <p className="text-[11px] text-slate-300 line-clamp-3">{item.description}</p>
          )}
          {Array.isArray(item.acceptance_criteria) && item.acceptance_criteria.length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-300">
              {item.acceptance_criteria.slice(0, 3).map((ac, idx) => (
                <li key={idx}>{ac}</li>
              ))}
              {item.acceptance_criteria.length > 3 && (
                <li className="text-slate-500">+{item.acceptance_criteria.length - 3} more…</li>
              )}
            </ul>
          )}
        </div>
        <div className="shrink-0 space-y-1 text-right text-[11px] text-slate-400">
          <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide">
            {item.priority || "MEDIUM"}
          </span>
          <span className="block text-[10px] text-slate-500">{statusToLabel(item.status)}</span>
        </div>
      </div>
    </div>
  );
}

function SortableWorkItem({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <WorkItemCard item={item} isDragging={isDragging} />
    </div>
  );
}

function Column({ id, title, items, isOver, children }) {
  const tone = STATUS_CONFIG[id]?.tone || "muted";

  return (
    <div
      className={`flex h-full min-h-[260px] flex-col rounded-lg border bg-slate-950/40 p-2 text-xs transition ${
        isOver ? "border-emerald-400/60 bg-emerald-500/5" : toneClasses(tone)
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
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
          <p className="text-[11px] italic text-slate-500">Drop work items here.</p>
        )}
        {children}
      </div>
    </div>
  );
}

export function KanbanBoard({ workItems, loading, error, onStatusChange }) {
  const [activeId, setActiveId] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const itemsByStatus = useMemo(() => {
    const map = Object.fromEntries(STATUSES.map(s => [s, []]));
    for (const item of workItems || []) {
      const status = STATUSES.includes(item.status) ? item.status : "BACKLOG";
      map[status].push(item);
    }
    return map;
  }, [workItems]);

  const activeItem = useMemo(
    () => (activeId ? (workItems || []).find(i => i.id === activeId) || null : null),
    [activeId, workItems]
  );

  function handleDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
    const item = (workItems || []).find(i => i.id === active.id);
    setActiveColumn(item?.status || null);
  }

  function handleDragOver(event) {
    const { over } = event;
    if (!over) return;
    const columnId = over.data.current?.columnId || over.id;
    if (STATUSES.includes(columnId)) {
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
    if (!STATUSES.includes(targetColumn)) {
      setActiveId(null);
      return;
    }

    const item = (workItems || []).find(i => i.id === active.id);
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

  const total = workItems?.length || 0;
  const done = workItems?.filter(w => w.status === "DONE").length || 0;
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="border-slate-700/70 bg-slate-900/60">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-slate-50">
              Kanban execution
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Drag work items across columns to move them from backlog to done. Progress is calculated
              deterministically from completed items.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Progress</span>
              <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                {progress}%
              </span>
            </div>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
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
            No work items available. Generate work items from the analysis to start executing in Kanban.
          </p>
        )}
        {!loading && !error && workItems && workItems.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {STATUSES.map(status => (
                <SortableContext
                  key={status}
                  items={itemsByStatus[status].map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    id={status}
                    data-column-id={status}
                    data-dndkit-droppable="true"
                    className="min-h-[260px]"
                  >
                    <Column
                      id={status}
                      title={statusToLabel(status)}
                      items={itemsByStatus[status]}
                      isOver={overColumn === status}
                    >
                      {itemsByStatus[status].map(item => (
                        <SortableWorkItem key={item.id} item={item} />
                      ))}
                    </Column>
                  </div>
                </SortableContext>
              ))}
            </div>

            <DragOverlay>{activeItem ? <WorkItemCard item={activeItem} isDragging /> : null}</DragOverlay>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
