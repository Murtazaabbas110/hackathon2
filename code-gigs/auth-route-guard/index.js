export const LOCAL_USER_KEY = "scopeflow_user";

export function parseUser(raw) {
  if (!raw) return null;
  try {
    const user = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!user || typeof user !== "object") return null;
    if (!user.id || !user.email) return null;
    return user;
  } catch {
    return null;
  }
}

export function createDemoUser({ name, email }) {
  return {
    id: `demo_${email.toLowerCase()}`,
    name,
    email
  };
}
