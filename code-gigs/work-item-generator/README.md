# Work Item Generator

Server-side helper that generates **8–20 structured work items** from a project analysis using the **Groq API**. Converts the AI-produced analysis (summary, objectives, requirements, risks, dependencies) into an actionable, implementation-focused backlog.

## Usage

```js
import { generateWorkItemsFromAnalysis } from "../code-gigs/work-item-generator";

const workItems = await generateWorkItemsFromAnalysis(project.analysis);
```

Returns an array of work items:

```js
{
  epic: "string",                    // short epic or theme
  title: "string",                   // concise, actionable title
  description: "string",             // 1-3 sentences of practical detail
  priority: "HIGH" | "MEDIUM" | "LOW",
  acceptanceCriteria: ["string"],    // done-when conditions
  dependencies: ["string"],          // related work items or external deps
}
```

## Features

- Targets 8–20 items and returns as many as the analysis justifies.
- Strict JSON-only prompt at `temperature: 0.2`.
- Normalizes and validates every item — invalid or incomplete items are dropped.
- Throws if no valid work items are produced.
- Retries once with a stricter prompt if the first response is invalid.
- Does not invent technologies, vendors, or deadlines not present in the analysis.

## Environment variables

```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile   # optional, has a default
```

## Requirements

- `groq-sdk`
- **Server-only.** This module reads `GROQ_API_KEY` and must never be imported into client components.
- The caller is responsible for persisting the returned items to Supabase and applying any additional normalization.
