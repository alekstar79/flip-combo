import { describe, it, expect } from 'vitest'
import { clamp, noExponents } from '@/utils/math'

// ---------- clamp ----------------------------------------------------------

describe('clamp', () => {
  it('returns a value inside the range as is', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })

  it('clamps to the lower bound', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(-5, -2, 3)).toBe(-2)
  })

  it('clamps to the upper bound', () => {
    expect(clamp(100, 0, 10)).toBe(10)
    expect(clamp(3, -2, 3)).toBe(3)
  })

  it('works with a point range', () => {
    expect(clamp(5, 7, 7)).toBe(7)
    expect(clamp(-5, 7, 7)).toBe(7)
  })

  it('preserves the fractional part', () => {
    expect(clamp(0.7, 0.5, 1)).toBe(0.7)
  })
})

// ---------- noExponents ----------------------------------------------------

describe('noExponents', () => {
  it('returns an ordinary number unchanged', () => {
    expect(noExponents(123)).toBe('123')
    expect(noExponents('123')).toBe('123')
    expect(noExponents(0)).toBe('0')
  })

  it('expands a positive exponent', () => {
    expect(noExponents(1.5e3)).toBe('1500')
    expect(noExponents(1e3)).toBe('1000')
    expect(noExponents(1.234e5)).toBe('123400')
  })

  it('expands a negative exponent', () => {
    expect(noExponents(1e-7)).toBe('0.0000001')
    expect(noExponents(1.23e-2)).toBe('0.0123')
    expect(noExponents(5e-1)).toBe('0.5')
  })

  it('preserves the minus sign', () => {
    expect(noExponents(-1e-7)).toBe('-0.0000001')
    expect(noExponents(-1.5e3)).toBe('-1500')
  })

  it('does not lose precision at range boundaries', () => {
    expect(noExponents(1e-11)).toBe('0.00000000001')
    expect(noExponents(1e15)).toBe('1000000000000000')
  })
})