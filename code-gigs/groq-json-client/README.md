# Groq JSON Client

Server-side helper for calling the **Groq API** and enforcing structured JSON responses. Powers ScopeFlow's project analysis: a raw client message in, a validated analysis object out.

## Usage

```js
import { analyzeProjectFromClientMessage } from "../code-gigs/groq-json-client";

const analysis = await analyzeProjectFromClientMessage("Build an app for...");
```

Returns an analysis object with:

```js
{
  summary: "string",
  objectives: ["string"],
  targetUsers: ["string"],
  requirements: [
    {
      id: "string",
      title: "string",
      description: "string",
      category: "string",
      priority: "MUST_HAVE" | "SHOULD_HAVE" | "COULD_HAVE",
      confidence: "HIGH" | "MEDIUM",
      sourceText: "string",
    },
  ],
  ambiguities: ["string"],
  risks: ["string"],
  assumptions: ["string"],
  dependencies: ["string"],
}
```

## Features

- Strict JSON-only prompt at `temperature: 0.2` (deterministic, low-hallucination).
- Strips markdown fences and validates the parsed JSON.
- Automatically retries once with a stricter prompt if the first response is invalid.
- Grounds each requirement in a `sourceText` excerpt from the client message.

## Environment variables

```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile   # optional, has a default
```

## Requirements

- `groq-sdk`
- **Server-only.** This module reads `GROQ_API_KEY` and must never be imported from client components. Use it in Next.js Route Handlers or Server Actions.
