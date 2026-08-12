"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function getLocalUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("scopeflow_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function AuthGuard({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getLocalUser();
    if (!user) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
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
