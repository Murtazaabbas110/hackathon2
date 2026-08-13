# Complexity Calculator

Deterministic, explainable project complexity scoring. Converts analysis signals into a simple `LOW` / `MEDIUM` / `HIGH` rating without any AI calls — the result is fully reproducible from the same inputs.

## Usage

```js
import { calculateComplexity } from "../code-gigs/complexity-calculator";

const complexity = calculateComplexity({
  requirements: [...],
  ambiguities: [...],
  risks: [...],
  dependencies: [...],
});
// => "LOW" | "MEDIUM" | "HIGH"
```

## Scoring rules

Risk signals = count of ambiguities + risks + dependencies.

| Complexity | Condition                               |
| ---------- | --------------------------------------- |
| `HIGH`     | requirements > 15, or risk signals > 10 |
| `MEDIUM`   | requirements > 7, or risk signals > 4   |
| `LOW`      | otherwise                               |

All inputs are optional and default to empty arrays.

## Requirements

- None — pure JavaScript, runs in Node or the browser.
