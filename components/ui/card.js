export function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`mb-4 flex flex-col gap-1 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h2 className={`text-lg font-semibold tracking-tight ${className}`}>{children}</h2>;
}

export function CardDescription({ className = "", children }) {
  return <p className={`text-sm text-slate-400 ${className}`}>{children}</p>;
}

export function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}
