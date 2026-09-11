// -----------------------------------------------------
// Public API of the @alekstar79/flip-calc package.
//
// Entry points:
//   .           — everything
//   ./calc      — calculator only
//   ./calendar  — calendar only
//   ./flipper   — Flipper container only
//   ./host      — environment adapters
//   ./utils     — utilities (for custom adapters)
// -----------------------------------------------------

// Components — factories.
export { createFlipper } from './flipper'
export { createCalc } from './calc'
export { createCalendar } from './calendar'

// Component types.
export type {
  Entity,
  FlipperInstance,
  FlipperProps,
  FlipperState,
  FlipPanel,
  PanelOptions,
} from './flipper'

export type {
  CalcAction,
  CalcInstance,
  CalcProps,
  CalcState,
  Operator,
} from './calc'

export type {
  CalendarInstance,
  CalendarProps,
  CalendarState,
  DayCell,
  Locale,
} from './calendar'

// Host - environment (adapters for integration with the application).
export { createDefaultHost } from './host'
export type {
  HostEnvironment,
  LocaleAdapter,
  LoggerAdapter,
  StorageAdapter,
  ThemeAdapter,
  Unsubscribe,
} from './host'

// Utilities - for those writing custom adapters.
export {
  clipboard,
  clamp,
  detectMobile,
  hexToRgbA,
  isHexColor,
  noExponents,
  paintWithOpacity,
  rgbaStringify,
} from './utils'
export type { RGBA } from './utils'
