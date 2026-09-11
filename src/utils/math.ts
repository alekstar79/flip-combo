/**
 * Clamps a value to the [lo, hi] range.
 */
export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/**
 * Expands an exponential number representation into ordinary notation.
 *
 *   noExponents(1e-7)     → "0.0000001"
 *   noExponents(1.5e+3)   → "1500"
 *   noExponents(123)      → "123"
 */
export function noExponents(num: number | string): string {
  const data = String(num).split(/[eE]/)

  if (data.length === 1) {
    return data[0] ?? ''
  }

  const mantissa = data[0] ?? ''
  const exponentRaw = data[1] ?? '0'

  const isNegative = String(num).startsWith('-')
  const sign = isNegative ? '-' : ''

  const digits = mantissa.replace('-', '').replace('.', '')

  const pointIndex = mantissa.indexOf('.') === -1
    ? mantissa.replace('-', '').length
    : mantissa.indexOf('.')

  const exponent = Number(exponentRaw)
  const newPointIndex = pointIndex + exponent

  let result: string

  if (newPointIndex <= 0) {
    result = `0.${'0'.repeat(-newPointIndex)}${digits}`
  } else if (newPointIndex >= digits.length) {
    result = digits + '0'.repeat(newPointIndex - digits.length)
  } else {
    result = digits.slice(0, newPointIndex) + '.' + digits.slice(newPointIndex)
  }

  result = result.replace(/^0+(?=\d)/, '')

  if (result.includes('.')) {
    result = result.replace(/\.?0+$/, '')
  }

  return sign + result
}