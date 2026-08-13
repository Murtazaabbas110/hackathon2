export const AUTH_COOKIE_NAME = "scopeflow_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function createSessionCookieValue(user) {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
  });
  return Buffer.from(payload).toString("base64url");
}

export function parseSessionCookieValue(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return null;

  try {
    const json = Buffer.from(rawValue, "base64url").toString("utf8");
    const parsed = JSON.parse(json);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.id !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
