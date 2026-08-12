"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../code-gigs/supabase-client";

export function AuthGuard({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data?.session;
        if (!hasSession) {
          router.replace("/login");
        } else if (isMounted) {
          setChecked(true);
        }
      } catch (e) {
        console.error("Failed to check Supabase session", e);
        router.replace("/login");
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      } else if (isMounted) {
        setChecked(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!checked) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-slate-400">
        Checking authentication...
      </div>
    );
  }

  return children;
}
