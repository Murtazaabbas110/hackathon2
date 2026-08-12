"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Lock, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { AnalogMeter } from "../../components/ui/analog-meter";
import { getSupabaseClient, formatSupabaseError } from "../../code-gigs/supabase-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const supabase = getSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) throw signUpError;

      if (data?.session) {
        router.replace("/dashboard");
      } else {
        setInfo(
          "Check your inbox to confirm your email address, then return here to sign in.",
        );
      }
    } catch (e) {
      console.error(e);
      setError(formatSupabaseError(e, "Unable to create your account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
      <section className="space-y-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          Create your ScopeFlow account
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Start a new AI-powered planning workspace.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Sign up with email and password. Your projects, work items, and
          analysis live in your Supabase project, not in local storage.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AnalogMeter
            value={88}
            label="Data safety"
            sublabel="Postgres + Supabase Auth as the source of truth"
            tone="emerald"
            size="md"
          />
          <AnalogMeter
            value={48}
            label="Setup effort"
            sublabel="Minimal config for a hackathon-grade MVP"
            tone="amber"
            size="md"
          />
        </div>
      </section>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Use an email you control. You can enable email confirmations in
            your Supabase project settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-9 w-full rounded-md border border-white/6 bg-slate-950/40 py-2 px-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pl-9 w-full rounded-md border border-white/6 bg-slate-950/40 py-2 px-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <UserPlus className="h-4 w-4" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pl-9 w-full rounded-md border border-white/6 bg-slate-950/40 py-2 px-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-rose-400" role="alert">
                {error}
              </p>
            )}
            {info && !error && (
              <p className="text-sm text-emerald-300" role="status">
                {info}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="flex w-full items-center justify-center gap-2 rounded-md"
              disabled={
                loading ||
                !email.trim() ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword
              }
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating account…" : "Create account"}
            </Button>
            <p className="pt-1 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-medium text-sky-300 hover:text-sky-200"
              >
                Sign in
              </button>
              .
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
