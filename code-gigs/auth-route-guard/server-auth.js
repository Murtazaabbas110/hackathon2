import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "../supabase-client";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  parseSessionCookieValue,
} from "./session-server";

export function unauthorizedResponse(clearCookie = false) {
  const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (clearCookie) {
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      ...authCookieOptions(),
      maxAge: 0,
    });
  }

  return response;
}

export async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const rawSession = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = parseSessionCookieValue(rawSession);

  if (!session) {
    return { user: null, response: unauthorizedResponse() };
  }

  const supabase = getSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, email")
    .eq("id", session.id)
    .eq("email", session.email)
    .maybeSingle();

  if (error) {
    console.error(error);
    return {
      user: null,
      response: NextResponse.json({ error: "Failed to load user" }, { status: 500 }),
    };
  }

  if (!user) {
    return { user: null, response: unauthorizedResponse(true) };
  }

  return { user, response: null };
}

export async function getOwnedProject(projectId, userId, select = "id") {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(select)
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function ensureOwnedWorkItem(workItemId, userId) {
  const supabase = getSupabaseClient();
  const { data: workItem, error: wiError } = await supabase
    .from("work_items")
    .select("id, project_id")
    .eq("id", workItemId)
    .maybeSingle();

  if (wiError) throw wiError;
  if (!workItem) return null;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", workItem.project_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (projectError) throw projectError;
  return project ? workItem : null;
}

export async function ensureOwnedSprint(sprintId, userId) {
  const supabase = getSupabaseClient();
  const { data: sprint, error: sprintError } = await supabase
    .from("sprints")
    .select("id, project_id")
    .eq("id", sprintId)
    .maybeSingle();

  if (sprintError) throw sprintError;
  if (!sprint) return null;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", sprint.project_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (projectError) throw projectError;
  return project ? sprint : null;
}
