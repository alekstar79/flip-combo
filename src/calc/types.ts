/** Arithmetic operator. */
export type Operator = '+' | '-' | '*' | '/'

/** User action dispatched to the calculator reducer. */
export type CalcAction =
  | { readonly type: 'digit'; readonly value: string }
  | { readonly type: 'dot' }
  | { readonly type: 'operator'; readonly value: Operator }
  | { readonly type: 'equals' }
  | { readonly type: 'clear' }

/**
 * Calculator state.
 *
 * Sequential model (matches legacy behavior):
 *  - `accumulator` — running result;
 *  - `pendingOp` — operator waiting for the next operand;
 *  - `currentInput` — what the user is typing right now;
 *  - `isNewNumber` — flag: next digit starts a new number.
 *
 * When an operator is entered and `pendingOp` is already set,
 * `accumulator <pendingOp> currentInput` is evaluated first, and
 * the result becomes the new `accumulator`. The new operator then
 * becomes `pendingOp`.
 *
 * Example: `101 + 2 / 3 =`
 *   101  → currentInput = "101"
 *   +    → accumulator = 101, pendingOp = "+"
 *   2    → currentInput = "2"
 *   /    → accumulator = 101 + 2 = 103, pendingOp = "/"
 *   3    → currentInput = "3"
 *   =    → accumulator = 103 / 3 = 34.333...
 */
export interface CalcState {
  readonly accumulator: number
  readonly pendingOp: Operator | null
  readonly currentInput: string
  readonly isNewNumber: boolean
}

/** Props accepted by `createCalc`. */
export interface CalcProps {
  /**
   * Enables panel dragging.
   *
   * When `true`, the panel is wrapped in a positioned container
   * (`position: fixed`) and its position is persisted in localStorage.
   */
  readonly draggable?: boolean
  /**
   * localStorage key for the panel position.
   * Used only when `draggable: true`.
   * Defaults to `'flip-combo:calc'`.
   */
  readonly storageKey?: string
  /** Callback fired when the "off" button is pressed. */
  readonly onOff?: () => void
  /** Callback fired when the "flip" button is pressed. */
  readonly onFlip?: () => void
  /** Callback fired after successful copy to clipboard. */
  readonly onCopy?: (text: string) => void
}

/** Calculator instance returned by `createCalc`. */
export interface CalcInstance {
  readonly element: HTMLElement
  mount(container: HTMLElement): void
  unmount(): void
  getState(): CalcState
  dispatch(action: CalcAction): void
}