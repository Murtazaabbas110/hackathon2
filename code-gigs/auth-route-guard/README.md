# Auth Route Guard

Reusable cookie-session authentication helpers for Next.js apps, backed by a Supabase `users` table. Used across every protected API route and page in ScopeFlow to verify who a request belongs to and enforce per-user ownership.

## Features

- **Client-side session lookup** — `getSessionUser()` fetches `/api/auth/me` and returns the current user (or `null`).
- **HTTP-only cookie sessions** — `session-server.js` creates and parses a signed-style base64url session cookie (`scopeflow_session`, 7-day expiry, `httpOnly`, `sameSite=lax`).
- **Server-side guards** — `server-auth.js` authenticates requests and enforces ownership of projects, work items, and sprints.

## Files

| File                | Side   | Purpose                                                                                                                 |
| ------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `index.js`          | Client | `getSessionUser()`, `isValidAuthUser()`                                                                                 |
| `session-server.js` | Server | `createSessionCookieValue()`, `parseSessionCookieValue()`, `authCookieOptions()`, `AUTH_COOKIE_NAME`                    |
| `server-auth.js`    | Server | `getAuthenticatedUser()`, `unauthorizedResponse()`, `getOwnedProject()`, `ensureOwnedWorkItem()`, `ensureOwnedSprint()` |

## Client usage

```js
import { getSessionUser } from "../code-gigs/auth-route-guard";

const user = await getSessionUser(); // { id, username, email } | null
```

## Server (API route) usage

```js
import { getAuthenticatedUser } from "../code-gigs/auth-route-guard/server-auth";

export async function GET(request) {
  const { user, response } = await getAuthenticatedUser();
  if (!user) return response; // 401 Unauthorized
  // ...
}
```

## Ownership guards

```js
const project = await getOwnedProject(projectId, user.id); // null if not owned
const item = await ensureOwnedWorkItem(workItemId, user.id);
const sprint = await ensureOwnedSprint(sprintId, user.id);
```

## Requirements

- `@supabase/supabase-js` (via the `supabase-client` Code Gig)
- `next/headers` (Next.js App Router)
- A `users` table with `id`, `username`, and `email` columns
