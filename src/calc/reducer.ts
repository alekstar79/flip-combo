import type { CalcAction, CalcState, Operator } from './types'
import { formatNumber } from './format'

/** Maximum number of characters in the input field. */
export const MAX_INPUT_LENGTH = 10

/** Creates the initial calculator state. */
export function createInitialState(): CalcState {
  return {
    accumulator: 0,
    pendingOp: null,
    currentInput: '',
    isNewNumber: true,
  }
}

// Helpers

/**
 * Applies an operator to two numbers.
 * Division by zero yields 0 (matches legacy - no Infinity/NaN).
 */
function compute(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return b === 0 ? 0 : a / b
  }
}

/** Parses the input field. Empty string → 0. */
function parseInput(input: string): number {
  const n = parseFloat(input)
  return Number.isFinite(n) ? n : 0
}

// Action handlers

function handleDigit(state: CalcState, digit: string): CalcState {
  if (state.isNewNumber) {
    return { ...state, currentInput: digit, isNewNumber: false }
  }
  if (state.currentInput.length >= MAX_INPUT_LENGTH) {
    return state
  }
  if (state.currentInput === '0') {
    return { ...state, currentInput: digit }
  }
  return { ...state, currentInput: state.currentInput + digit }
}

function handleDot(state: CalcState): CalcState {
  if (state.isNewNumber) {
    return { ...state, currentInput: '0.', isNewNumber: false }
  }
  if (state.currentInput.includes('.')) {
    return state
  }
  if (state.currentInput === '') {
    return { ...state, currentInput: '0.' }
  }
  return { ...state, currentInput: state.currentInput + '.' }
}

/**
 * Operator input.
 *
 * Sequential logic (matches legacy):
 *  - if a new number is expected (right after the previous operator),
 *    just replace the operator without evaluating anything;
 *  - if the user has typed something, first close the previous
 *    operation, then remember the new operator.
 */
function handleOperator(state: CalcState, op: Operator): CalcState {
  if (state.isNewNumber) {
    // User pressed two operators in a row — replace the first one.
    return { ...state, pendingOp: op }
  }

  const value = parseInput(state.currentInput)

  const result = state.pendingOp !== null
    ? compute(state.accumulator, value, state.pendingOp)
    : value

  return {
    accumulator: result,
    pendingOp: op,
    currentInput: '',
    isNewNumber: true,
  }
}

/**
 * "=" key.
 * Evaluates the accumulated expression, resets the operator, shows result.
 * No-op if no operator is pending.
 */
function handleEquals(state: CalcState): CalcState {
  if (state.pendingOp === null) {
    return state
  }

  const value = parseInput(state.currentInput)
  const result = compute(state.accumulator, value, state.pendingOp)

  return {
    accumulator: result,
    pendingOp: null,
    currentInput: formatNumber(result),
    isNewNumber: true,
  }
}

function handleClear(): CalcState {
  return createInitialState()
}

// Public API

export function reduce(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case 'digit': return handleDigit(state, action.value)
    case 'dot': return handleDot(state)
    case 'operator': return handleOperator(state, action.value)
    case 'equals': return handleEquals(state)
    case 'clear': return handleClear()
  }
}

/**
 * String for the main display.
 *  - if the user is typing — their input;
 *  - otherwise — the current accumulator.
 */
export function displayCurrent(state: CalcState): string {
  if (state.currentInput !== '') return state.currentInput
  return formatNumber(state.accumulator)
}

/**
 * String for the history line above the main display.
 *  - if an operation is pending - `accumulator <op>`;
 *  - otherwise - empty string.
 */
export function displayHistory(state: CalcState): string {
  if (state.pendingOp === null) return ''
  return `${formatNumber(state.accumulator)} ${state.pendingOp}`
}
