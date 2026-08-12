import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ScopeFlow",
  description:
    "Turn messy client requirements into execution-ready project plans.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen text-slate-50`}>
        <div className="relative isolate flex min-h-screen flex-col">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="absolute right-[-4rem] top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_100%)] opacity-30" />
          </div>
          <header className="relative border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
            <div className="section-shell flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sm font-semibold text-sky-100 shadow-lg shadow-sky-950/20">
                  SF
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight text-slate-50">
                    ScopeFlow
                  </div>
                  <div className="text-xs text-slate-400">
                    Project intelligence with a polished execution layer
                  </div>
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <Link
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:border-sky-400/40 hover:bg-sky-400/10"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:border-sky-400/40 hover:bg-sky-400/10"
                  href="/projects/new"
                >
                  New project
                </Link>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">
                  Mobile-first shell
                </span>
              </div>
            </div>
          </header>
          <main className="relative flex-1 section-shell py-6 sm:py-8 lg:py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
