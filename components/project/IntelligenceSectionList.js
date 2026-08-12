"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

function ItemRow({ title, description, meta, sourceText }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-xs shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {title && <p className="font-medium text-slate-100">{title}</p>}
          {description && <p className="text-slate-300">{description}</p>}
          {!title && !description && meta && (
            <p className="text-slate-300">{meta}</p>
          )}
          {sourceText && (
            <p className="mt-1 border-l border-slate-700/70 pl-2 text-[11px] text-slate-400">
              From client message:{" "}
              <span className="italic">“{sourceText}”</span>
            </p>
          )}
        </div>
        {meta && title && (
          <span className="shrink-0 rounded-full border border-white/10 bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-300">
            {meta}
          </span>
        )}
      </div>
    </div>
  );
}

function normalizeItem(item) {
  if (!item || typeof item !== "object") {
    return {
      title: null,
      description: String(item || ""),
      meta: null,
      sourceText: null,
    };
  }

  const title = item.title || item.name || null;
  const description = item.description || item.detail || item.text || null;
  const sourceText = item.sourceText || item.source || null;

  // Build a compact meta label from known fields
  const parts = [];
  if (item.category) parts.push(item.category);
  if (item.priority) parts.push(`Priority: ${item.priority}`);
  if (item.confidence) parts.push(`Confidence: ${item.confidence}`);
  if (item.severity) parts.push(`Severity: ${item.severity}`);
  const meta = parts.length ? parts.join(" • ") : null;

  return { title, description, meta, sourceText };
}

export function IntelligenceSectionList({
  title,
  description,
  emptyLabel,
  items,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const count = safeItems.length;

  return (
    <Card className="border-slate-700/70 bg-slate-900/60">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-sm font-semibold tracking-tight text-slate-50">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs text-slate-400">
              {description}
            </CardDescription>
          )}
        </div>
        <div className="rounded-full bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-slate-300">
          {count} {count === 1 ? "item" : "items"}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {count === 0 && <p className="text-slate-500">{emptyLabel}</p>}
        {count > 0 && (
          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {safeItems.map((raw, idx) => {
              const normalized = normalizeItem(raw);
              return <ItemRow key={raw.id || idx} {...normalized} />;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
