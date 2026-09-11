# Usage examples for `@alekstar79/flip-combo`

Three standalone examples - showing different integration scenarios:

| Example     | Demonstrates                                     |
| ----------- | ------------------------------------------------ |
| `calc/`     | Calculator only. No calendar or Flipper wrapper. |
| `calendar/` | Calendar only. No calculator or Flipper wrapper. |
| `combo/`    | Full stack: Flipper + calculator + calendar.     |

Each example is a minimal HTML page + TypeScript file
importing code from the **published package**:

```ts
import { createCalc } from "@alekstar79/flip-combo/calc";
import "@alekstar79/flip-combo/style.css";
```

## Run locally

```bash

# From the project root
npm install

# Start the dev server (Vite)
npm run dev
```

Then open in the browser:

- http://localhost:5173/examples/calc/
- http://localhost:5173/examples/calendar/
- http://localhost:5173/examples/combo/

Or use the short commands:

```bash
npm run dev:calc
npm run dev:calendar
npm run dev:combo
```
