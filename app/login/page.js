"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import {
  LOCAL_USER_KEY,
  createDemoUser,
  parseUser,
} from "../../code-gigs/auth-route-guard";
import { AnalogMeter } from "../../components/ui/analog-meter";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(LOCAL_USER_KEY);
    const user = parseUser(raw);
    if (user) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const user = createDemoUser({ name: name.trim(), email: email.trim() });
    window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    router.push("/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
      <section className="space-y-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          Local demo workspace
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Continue to ScopeFlow with a lightweight demo identity.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
          No passwords, no signup. Enter your name and email to unlock the
          dashboard, project workspace, and visual planning tools.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AnalogMeter
            value={92}
            label="Access ease"
            sublabel="Fast entry for a demo environment"
            tone="sky"
            size="md"
          />
          <AnalogMeter
            value={24}
            label="Friction"
            sublabel="A very small login surface by design"
            tone="emerald"
            size="md"
          />
        </div>
      </section>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Continue to ScopeFlow</CardTitle>
          <CardDescription>
            Create a local demo workspace with your name and email. No
            passwords, no signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="name"
              >
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Demo User"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@example.com"
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!name.trim() || !email.trim()}
            >
              Continue to ScopeFlow
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
