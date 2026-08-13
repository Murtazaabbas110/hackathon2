export function isValidAuthUser(user) {
  return Boolean(
    user &&
      typeof user === "object" &&
      typeof user.id === "string" &&
      typeof user.username === "string" &&
      typeof user.email === "string",
  );
}

export async function getSessionUser() {
  try {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return null;

    const body = await res.json();
    return isValidAuthUser(body?.user) ? body.user : null;
  } catch {
    return null;
  }
}
