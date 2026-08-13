"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionUser } from "../code-gigs/auth-route-guard";

export function AuthGuard({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const user = await getSessionUser();
      if (!isMounted) return;
      if (!user) {
        router.replace("/login");
      } else {
        setChecked(true);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
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
