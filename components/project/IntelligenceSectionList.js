"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

function badgeTone(label, value) {
  const v = String(value || "").toUpperCase();
  if (/^PRIORITY/i.test(label)) {
    if (v.includes("HIGH")) return "border-rose-400/30 bg-rose-400/10 text-rose-200";
    if (v.includes("MEDIUM")) return "border-amber-400/30 bg-amber-400/10 text-amber-200";
    if (v.includes("LOW")) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (/^SEVERITY/i.test(label)) {
    if (v.includes("HIGH") || v.includes("CRITICAL")) return "border-rose-400/30 bg-rose-400/10 text-rose-200";
    if (v.includes("MEDIUM")) return "border-amber-400/30 bg-amber-400/10 text-amber-200";
    if (v.includes("LOW")) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (/^CONFIDENCE/i.test(label)) {
    if (v.includes("HIGH")) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
    if (v.includes("MEDIUM")) return "border-sky-400/30 bg-sky-400/10 text-sky-200";
    if (v.includes("LOW")) return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }
  if (/^CATEGORY/i.test(label)) {
    return "border-violet-400/30 bg-violet-400/10 text-violet-200";
  }
  return "border-white/10 bg-slate-950/80 text-slate-300";
}

function ItemRow({ title, description, meta, metaLabel, sourceText }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-xs shadow-sm transition hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {title && <p className="font-medium text-slate-100">{title}</p>}
          {description && <p className="text-slate-300">{description}</p>}
          {!title && !description && meta && meta.length > 0 && (
            <p className="text-slate-300">{meta[0].value}</p>
          )}
          {sourceText && (
            <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-sky-400/10 bg-sky-400/[0.04] px-2.5 py-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 shrink-0 text-sky-300/70"
              >
                <path d="M9 12h6M9 16h6M9 8h2M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[11px] leading-relaxed text-slate-400">
                <span className="font-medium text-sky-200/80">Source: </span>
                <span className="italic">“{sourceText}”</span>
              </p>
            </div>
          )}
        </div>
        {meta && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            {meta.map(({ label, value }, idx) => (
              <span
                key={idx}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeTone(label, value)}`}
              >
                {label === value ? value : `${label}: ${value}`}
              </span>
            ))}
          </div>
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

  // Build compact meta badges from known fields
  const meta = [];
  if (item.category) meta.push({ label: "Category", value: item.category });
  if (item.priority) meta.push({ label: "Priority", value: item.priority });
  if (item.confidence) meta.push({ label: "Confidence", value: item.confidence });
  if (item.severity) meta.push({ label: "Severity", value: item.severity });

  return { title, description, meta: meta.length ? meta : null, sourceText };
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
