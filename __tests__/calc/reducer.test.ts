import { describe, it, expect } from 'vitest'

import type { CalcAction, Operator } from '@/calc/types'
import { formatDisplay } from '@/calc/format'
import {
  createInitialState,
  displayCurrent,
  displayHistory,
  reduce,
} from '@/calc/reducer'

// Helpers

const d = (v: string): CalcAction => ({ type: 'digit', value: v })
const o = (v: Operator): CalcAction => ({ type: 'operator', value: v })
const dot: CalcAction = { type: 'dot' }
const eq: CalcAction = { type: 'equals' }
const ac: CalcAction = { type: 'clear' }

function run(...actions: CalcAction[]) {
  return actions.reduce(reduce, createInitialState())
}

function evalExpr(...actions: CalcAction[]): string {
  return formatDisplay(displayCurrent(run(...actions, eq)))
}

// Tests

describe('calc reducer — basic arithmetic', () => {
  it('2 + 3 = 5', () => {
    expect(evalExpr(d('2'), o('+'), d('3'))).toBe('5')
  })

  it('10 - 4 = 6', () => {
    expect(evalExpr(d('1'), d('0'), o('-'), d('4'))).toBe('6')
  })

  it('3 * 4 = 12', () => {
    expect(evalExpr(d('3'), o('*'), d('4'))).toBe('12')
  })

  it('12 / 4 = 3', () => {
    expect(evalExpr(d('1'), d('2'), o('/'), d('4'))).toBe('3')
  })

  it('5 / 0 = 0 (guards against Infinity)', () => {
    expect(evalExpr(d('5'), o('/'), d('0'))).toBe('0')
  })
})

describe('calc reducer — sequential evaluation (matches legacy)', () => {
  it('101 + 2 / 3 = 34.33333333 (not 101.66666667)', () => {
    expect(evalExpr(
      d('1'), d('0'), d('1'),
      o('+'),
      d('2'),
      o('/'),
      d('3'),
    )).toBe('34.33333333')
  })

  it('2 + 3 * 4 = 20 (sequential, not 14)', () => {
    expect(evalExpr(d('2'), o('+'), d('3'), o('*'), d('4'))).toBe('20')
  })

  it('2 * 3 + 4 = 10 (same as precedence here)', () => {
    expect(evalExpr(d('2'), o('*'), d('3'), o('+'), d('4'))).toBe('10')
  })

  it('2 + 3 * 4 + 5 = 25', () => {
    expect(evalExpr(
      d('2'), o('+'), d('3'), o('*'), d('4'), o('+'), d('5'),
    )).toBe('25')
  })

  it('1 + 2 * 3 - 4 / 2 + 5 = 7.5', () => {
    expect(evalExpr(
      d('1'), o('+'), d('2'), o('*'), d('3'),
      o('-'), d('4'), o('/'), d('2'),
      o('+'), d('5'),
    )).toBe('7.5')
  })

  it('2 * 3 * 4 = 24 (chain of multiplications)', () => {
    expect(evalExpr(
      d('2'), o('*'), d('3'), o('*'), d('4'),
    )).toBe('24')
  })

  it('2 + 3 + 4 = 9 (chain of additions)', () => {
    expect(evalExpr(
      d('2'), o('+'), d('3'), o('+'), d('4'),
    )).toBe('9')
  })
})

describe('calc reducer — operator replacement', () => {
  it('2 + * 3 = 6 (second operator replaces the first)', () => {
    expect(evalExpr(d('2'), o('+'), o('*'), d('3'))).toBe('6')
  })

  it('2 * + 3 = 5', () => {
    expect(evalExpr(d('2'), o('*'), o('+'), d('3'))).toBe('5')
  })

  it('2 + + 3 = 5 (same operator type replacement)', () => {
    expect(evalExpr(d('2'), o('+'), o('+'), d('3'))).toBe('5')
  })
})

describe('calc reducer — digit input', () => {
  it('leading zero is replaced by digit', () => {
    expect(displayCurrent(run(d('0'), d('5')))).toBe('5')
  })

  it('zeros after the first digit are kept', () => {
    expect(displayCurrent(run(d('1'), d('0'), d('0')))).toBe('100')
  })

  it('MAX_INPUT_LENGTH = 10 characters', () => {
    const digits = '1234567890'.split('').map(d)
    expect(displayCurrent(run(...digits))).toBe('1234567890')
    expect(displayCurrent(run(...digits, d('9')))).toBe('1234567890')
  })

  it('digit after an operator starts a new number', () => {
    expect(displayCurrent(run(d('2'), o('+'), d('5')))).toBe('5')
  })
})

describe('calc reducer — dot input', () => {
  it('dot at the start → "0."', () => {
    expect(displayCurrent(run(dot))).toBe('0.')
  })

  it('dot after a digit', () => {
    expect(displayCurrent(run(d('1'), dot))).toBe('1.')
  })

  it('second dot is ignored', () => {
    expect(displayCurrent(run(d('1'), dot, dot, d('5')))).toBe('1.5')
  })

  it('dot after an operator → "0."', () => {
    expect(displayCurrent(run(d('2'), o('+'), dot))).toBe('0.')
  })

  it('1.5 + 2.5 = 4', () => {
    expect(evalExpr(
      d('1'), dot, d('5'), o('+'), d('2'), dot, d('5'),
    )).toBe('4')
  })
})

describe('calc reducer — "=" key', () => {
  it('"=" without operators — no-op', () => {
    expect(displayCurrent(run(d('5'), eq))).toBe('5')
  })

  it('"=" twice — second press is a no-op', () => {
    expect(evalExpr(d('2'), o('+'), d('3'), eq)).toBe('5')
  })

  it('after "=" a new digit starts a new number', () => {
    expect(
      displayCurrent(run(d('2'), o('+'), d('3'), eq, d('7'))),
    ).toBe('7')
  })

  it('after "=" a new operator uses the result', () => {
    expect(evalExpr(
      d('2'), o('+'), d('3'), eq, o('*'), d('2'),
    )).toBe('10')
  })

  it('101 + 2 = / 3 = yields the same as 101 + 2 / 3 =', () => {
    // Both paths must produce 34.33333333 — this is the key requirement.
    const withoutEquals = evalExpr(
      d('1'), d('0'), d('1'), o('+'), d('2'), o('/'), d('3'),
    )
    const withEquals = evalExpr(
      d('1'), d('0'), d('1'), o('+'), d('2'), eq, o('/'), d('3'),
    )
    expect(withoutEquals).toBe(withEquals)
  })
})

describe('calc reducer — "ac" key', () => {
  it('resets everything', () => {
    expect(displayCurrent(run(d('2'), o('+'), d('3'), ac))).toBe('0')
  })

  it('reset after "=" works', () => {
    expect(displayCurrent(run(d('5'), o('+'), d('5'), eq, ac))).toBe('0')
  })
})

describe('calc reducer — result formatting', () => {
  it('1 / 3 = 0.33333333 (truncated to 8 digits)', () => {
    expect(evalExpr(d('1'), o('/'), d('3'))).toBe('0.33333333')
  })

  it('2 / 3 = 0.66666667', () => {
    expect(evalExpr(d('2'), o('/'), d('3'))).toBe('0.66666667')
  })

  it('0.1 + 0.2 = 0.3 (FP normalization)', () => {
    expect(evalExpr(
      d('0'), dot, d('1'), o('+'), d('0'), dot, d('2'),
    )).toBe('0.3')
  })
})

describe('calc reducer — displayHistory', () => {
  it('empty history at start', () => {
    expect(displayHistory(createInitialState())).toBe('')
  })

  it('after "2 +" → "2 +"', () => {
    expect(displayHistory(run(d('2'), o('+')))).toBe('2 +')
  })

  it('after "101 + 2 /" → "103 /"', () => {
    // Intermediate result is preserved: 101+2=103, waiting for /.
    expect(displayHistory(run(
      d('1'), d('0'), d('1'), o('+'), d('2'), o('/'),
    ))).toBe('103 /')
  })

  it('history is cleared after "="', () => {
    expect(displayHistory(run(d('2'), o('+'), d('3'), eq))).toBe('')
  })
})
