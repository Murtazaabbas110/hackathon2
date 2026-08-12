"use client";

import clsx from "clsx";

export function Button({ className, variant = "primary", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-slate-700 bg-transparent hover:bg-slate-900",
    ghost: "hover:bg-slate-900"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm"
  };

  return <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />;
}
