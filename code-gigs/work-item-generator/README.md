# Work Item Generator (Gemini JSON client)

Server-side helper for generating structured work items from project analysis using the Gemini API.

## Responsibilities

- Accepts a full `analysis` object (summary, objectives, requirements, ambiguities, risks, assumptions, dependencies, complexity, readiness).
- Calls Gemini with a strict JSON-only prompt.
- Returns an array of work items with the following shape:

```ts
export type WorkItem = {
  epic: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  acceptanceCriteria: string[];
  dependencies: string[]; // titles or IDs of other work items or external dependencies
};
```

- Ensures 8–20 work items where possible.
- Attempts one retry with a stricter prompt if the first response is not valid JSON.

## Usage

This module is used only from server-side Next.js API routes. It must never be imported into client components to avoid exposing the Gemini API key.

```js
import { generateWorkItemsFromAnalysis } from "../code-gigs/work-item-generator";

const workItems = await generateWorkItemsFromAnalysis(project.analysis);
```

The caller is responsible for persisting work items to Supabase and applying any additional validation or normalization rules.
