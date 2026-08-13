# Supabase Client

Lightweight, reusable Supabase browser client for the ScopeFlow app. Provides a lazy singleton client plus a friendly error formatter.

## Usage

```js
import {
  getSupabaseClient,
  formatSupabaseError,
} from "../code-gigs/supabase-client";

const supabase = getSupabaseClient();

const { data, error } = await supabase
  .from("projects")
  .select("*")
  .eq("user_id", user.id);

if (error) {
  throw new Error(formatSupabaseError(error, "Failed to load projects"));
}
```

## API

| Function                               | Description                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `getSupabaseClient()`                  | Creates and reuses a single `@supabase/supabase-js` client (`persistSession: false`). Throws if env vars are missing.            |
| `formatSupabaseError(error, fallback)` | Returns a readable message; detects missing-table / schema-cache errors and explains that `supabase/schema.sql` must be applied. |

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Requirements

- `@supabase/supabase-js`
- Use in the browser for data fetching and mutations. Only the public (publishable) key is used — **never put secrets here**.
- Server API routes may also import it to query Supabase with the public key and per-user ownership checks.
