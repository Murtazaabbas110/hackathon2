"use client";

import Link from "next/link";
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
import { getSessionUser } from "../../code-gigs/auth-route-guard";
import { AnalogMeter } from "../../components/ui/analog-meter";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const user = await getSessionUser();
      if (isMounted && user) {
        router.replace("/dashboard");
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error || "Signup failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to create account right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
      <section className="space-y-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Supabase table authentication
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Create your ScopeFlow account
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Sign up with username, email, and password. Your credentials are
          stored in the users table and validated on login.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AnalogMeter
            value={75}
            label="Identity setup"
            sublabel="One-time account creation"
            tone="emerald"
            size="md"
          />
          <AnalogMeter
            value={58}
            label="Validation strength"
            sublabel="Simple plain-table email/password check"
            tone="sky"
            size="md"
          />
        </div>
      </section>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            This uses your Supabase users table as a simple auth source.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                autoComplete="username"
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="confirm-password"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                !username.trim() ||
                !email.trim() ||
                !password.trim() ||
                !confirmPassword.trim() ||
                submitting
              }
            >
              {submitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-sm text-slate-300">
              Already have an account?{" "}
              <Link className="text-sky-300 hover:text-sky-200" href="/login">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
