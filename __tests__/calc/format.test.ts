import { describe, it, expect } from 'vitest'
import { formatNumber, formatDisplay } from '@/calc/format'

describe('formatNumber', () => {
  it('0 and -0 → "0"', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(-0)).toBe('0')
  })

  it('short integers', () => {
    expect(formatNumber(5)).toBe('5')
    expect(formatNumber(42)).toBe('42')
  })

  it('normalizes FP noise', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3')
    expect(formatNumber(0.3 - 0.1)).toBe('0.2')
  })

  it('very small numbers → "0"', () => {
    expect(formatNumber(1e-15)).toBe('0')
    expect(formatNumber(1e-12)).toBe('0')
  })

  it('expands a negative exponent to decimal', () => {
    expect(formatNumber(1e-7)).toBe('0.0000001')
  })

  it('handles Infinity/NaN as "0"', () => {
    expect(formatNumber(Infinity)).toBe('0')
    expect(formatNumber(-Infinity)).toBe('0')
    expect(formatNumber(NaN)).toBe('0')
  })

  it('long numbers use exponent notation', () => {
    const result = formatNumber(1.23456789e20)
    expect(result).toMatch(/e/)
  })
})

describe('formatDisplay', () => {
  it('empty string → "0"', () => {
    expect(formatDisplay('')).toBe('0')
  })

  it('groups the integer part into 3 digits', () => {
    expect(formatDisplay('1234')).toBe('1 234')
    expect(formatDisplay('1234567')).toBe('1 234 567')
    expect(formatDisplay('100')).toBe('100')
  })

  it('preserves the decimal point in unfinished input', () => {
    expect(formatDisplay('0.')).toBe('0.')
  })

  it('rounds the fractional part to 8 places', () => {
    expect(formatDisplay('0.123456789012')).toBe('0.12345679')
    expect(formatDisplay('1.234567891')).toBe('1.23456789')
    expect(formatDisplay('0.666666666666')).toBe('0.66666667')
    expect(formatDisplay('0.333333333333')).toBe('0.33333333')
  })

  it('leaves a short fractional part unchanged', () => {
    expect(formatDisplay('0.5')).toBe('0.5')
    expect(formatDisplay('3.14')).toBe('3.14')
  })

  it('removes trailing zeroes after rounding', () => {
    expect(formatDisplay('1.500000001')).toBe('1.5')
    expect(formatDisplay('2.000000001')).toBe('2')
  })

  it('rounds to an integer when the fractional part overflows', () => {
    expect(formatDisplay('0.999999999999')).toBe('1')
    expect(formatDisplay('1.999999999999')).toBe('2')
  })

  it('does not format exponent notation', () => {
    expect(formatDisplay('1.23457e+20')).toBe('1.23457e+20')
  })

  it('groups the integer part and rounds the fractional part', () => {
    expect(formatDisplay('1234567.123456789'))
      .toBe('1 234 567.12345679')
  })
})
