# Gemini JSON Client

> **Note:** This folder is a legacy duplicate of [`groq-json-client`](../groq-json-client). After ScopeFlow migrated from Gemini to Groq, the original module was repurposed to call the Groq API, and this copy was retained for reference. It is **not imported anywhere** in the app — use `groq-json-client` instead.

Server-side helper that calls the Groq API (formerly Gemini) and enforces structured JSON responses for project analysis.

## Usage

```js
import { analyzeProjectFromClientMessage } from "../code-gigs/gemini-json-client";

const analysis = await analyzeProjectFromClientMessage("Build an app for...");
```

Returns an analysis object with `summary`, `objectives`, `targetUsers`, `requirements`, `ambiguities`, `risks`, `assumptions`, and `dependencies`.

## Environment variables

```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile   # optional, has a default
```

## Requirements

- `groq-sdk`
- **Server-only.** Must be imported from Next.js Route Handlers or Server Actions.
