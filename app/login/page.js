"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { LOCAL_USER_KEY, createDemoUser, parseUser } from "../../code-gigs/auth-route-guard";

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
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Continue to ScopeFlow</CardTitle>
          <CardDescription>
            Create a local demo workspace with your name and email. No passwords, no signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Demo User"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="demo@example.com"
                autoComplete="email"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={!name.trim() || !email.trim()}>
              Continue to ScopeFlow
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
