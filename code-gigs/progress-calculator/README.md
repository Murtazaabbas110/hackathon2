# Progress Calculator

Small, framework-agnostic progress helpers for tracking execution of work items in **Kanban** and **Agile** boards. Pure functions with no dependencies — the same inputs always produce the same percentage, so progress is deterministic and easy to test.

## Usage

```js
import {
  calculateKanbanProgress,
  calculateSprintProgress,
  calculateProjectProgress,
  countStatuses,
} from "../code-gigs/progress-calculator";

const progress = calculateKanbanProgress(workItems); // 0-100
const { total, completed, inProgress, remaining } = countStatuses(workItems);
```

> This project has no `@/` path alias configured — import with a relative path (adjust `../` to wherever the module lives relative to your file).

## Functions

| Function                   | Signature                                                | Description                                                       |
| -------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `calculateKanbanProgress`  | `(items) => number`                                      | % of items with status `DONE`.                                    |
| `calculateSprintProgress`  | `(items) => number`                                      | % of sprint items that are done, using `sprint_status ?? status`. |
| `calculateProjectProgress` | `(items) => number`                                      | Alias of Kanban progress for whole-project views.                 |
| `countStatuses`            | `(items) => { total, completed, inProgress, remaining }` | Bucket counts by status.                                          |

## Status semantics

- **Complete:** `DONE`
- **In progress:** `TODO`, `IN_PROGRESS`, `REVIEW`
- **Remaining:** everything else (e.g. `BACKLOG`)

All results are clamped to 0–100.

## Requirements

- None — pure JavaScript, runs in Node or the browser.
