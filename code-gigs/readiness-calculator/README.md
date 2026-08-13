# Readiness Calculator

Deterministic calculation of how ready a project is to build, based on analysis signals. Returns a score from `0–100` — the more ambiguities, risks, and unresolved dependencies an analysis has, the lower the score. No AI calls involved.

## Usage

```js
import { calculateReadiness } from "../code-gigs/readiness-calculator";

const readiness = calculateReadiness({
  ambiguities: [...],
  risks: [...],
  dependencies: [...],
});
// => number 0-100
```

## Scoring rules

| Signal          | Points deducted |
| --------------- | --------------- |
| Each ambiguity  | 4               |
| Each risk       | 5               |
| Each dependency | 3               |

The result is clamped to `0–100`. All inputs are optional and default to empty arrays.

## Requirements

- None — pure JavaScript, runs in Node or the browser.
