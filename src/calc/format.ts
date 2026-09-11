import { noExponents } from '@/utils/math'

/**
 * Threshold below which a number is considered "zero" when displayed.
 * Matches legacy (`Math.abs(n) < 1e-11`).
 */
const ZERO_THRESHOLD = 1e-11

/**
 * Maximum number of decimal places when displayed.
 * If the fractional part is longer - round it to this number of places.
 */
const MAX_FRACTION_DIGITS = 8

/**
 * Converts a number to a displayable string:
 *  - corrects floating point inaccuracies (0.1 + 0.2 → 0.3);
 *  - converts very small numbers (< 1e-11) to 0;
 *  - if written in exponent notation - expands it back to decimal;
 *  - if the number is too long - keeps the exponent notation.
 *
 * Final visual shortening (rounding the fractional part,
 * grouping digits) is done by `formatDisplay`.
 */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (n === 0) return '0'
  if (Math.abs(n) < ZERO_THRESHOLD) return '0'

  // Normalize FP noise: 0.30000000000000004 → 0.3
  const cleaned = Number(n.toPrecision(12))
  const plain = String(cleaned)

  // Short decimal representation - leave as is.
  if (plain.length <= 15 && !/[eE]/.test(plain)) {
    return plain
  }

  // Exponent or long string - try to expand to decimal.
  const expanded = noExponents(cleaned)
  if (expanded.length <= 20) {
    return expanded
  }

  // Too long even when expanded - keep the exponent.
  return cleaned.toExponential(5).replace(/\.?0+e/, 'e')
}

/**
 * Formatting a number string for display.
 *
 * Rules:
 *  - empty string → "0";
 *  - exponential notation ("1.23457e+20") is unchanged;
 *  - the integer part is split into groups of 3 digits with spaces;
 *  - a fractional part longer than MAX_FRACTION_DIGITS places is ROUNDED
 *    (not truncated), so artifacts such as 0.66666666 do not appear
 *    for 2/3;
 *  - trailing zeroes in the rounded fractional part are removed.
 *
 * Pure function: does not mutate the input, returns a new string.
 */
export function formatDisplay(value: string): string {
  if (!value) return '0'
  if (/[eE]/.test(value)) return value

  const dotIndex = value.indexOf('.')
  const hasDot = dotIndex !== -1
  const intPart = hasDot ? value.slice(0, dotIndex) : value
  const fracPart = hasDot ? value.slice(dotIndex + 1) : ''

  // Short or missing fractional part - only group digits.
  if (fracPart.length <= MAX_FRACTION_DIGITS) {
    const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return hasDot ? `${groupedInt}.${fracPart}` : groupedInt
  }

  // Long fractional part - round to MAX_FRACTION_DIGITS places.
  const num = Number(value)
  if (!Number.isFinite(num)) return value

  const rounded = num.toFixed(MAX_FRACTION_DIGITS)
  const trimmed = rounded.replace(/\.?0+$/, '')

  const dotInRounded = trimmed.indexOf('.')
  const ri = dotInRounded === -1 ? trimmed : trimmed.slice(0, dotInRounded)
  const rf = dotInRounded === -1 ? '' : trimmed.slice(dotInRounded + 1)

  const groupedInt = ri.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return rf ? `${groupedInt}.${rf}` : groupedInt
}
