import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ScopeFlow",
  description: "Turn messy client requirements into execution-ready project plans."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                  SF
                </div>
                <span className="font-semibold tracking-tight">ScopeFlow</span>
              </div>
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
