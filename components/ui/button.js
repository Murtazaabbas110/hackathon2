"use client";

import clsx from "clsx";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-950/30 hover:translate-y-[-1px] hover:shadow-cyan-950/40",
    outline:
      "border border-white/12 bg-white/[0.03] text-slate-100 hover:border-sky-400/50 hover:bg-sky-400/10",
    ghost: "text-slate-200 hover:bg-white/5",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
