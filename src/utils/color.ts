export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

/**
 * HEX → RGBA. Supports `#rgb` and `#rrggbb`.
 * Invalid strings → black with the specified alpha.
 */
export function hexToRgbA(hex: string, alpha = 1): RGBA {
  const fallback: RGBA = { r: 0, g: 0, b: 0, a: alpha }

  if (!/^#[A-Fa-f0-9]{3,}$/.test(hex)) {
    return fallback
  }

  let chars = hex.substring(1).split('')

  if (chars.length === 3 || chars.length > 6) {
    chars = [chars[0]!, chars[0]!, chars[1]!, chars[1]!, chars[2]!, chars[2]!]
  }

  const int = parseInt(chars.join(''), 16)

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
    a: alpha,
  }
}

/**
 * RGBA → CSS string `rgba(r,g,b,a)`.
 * - if a valid `rgb(...)` / `rgba(...)` is passed — returns it as is;
 * - if the string is invalid — black;
 * - if `a > 1` — treats it as 0..255 and divides by 255.
 */
export function rgbaStringify(rgba: RGBA | string | undefined): string {
  if (rgba === undefined) {
    return 'rgba(0,0,0,1)'
  }

  if (typeof rgba === 'string') {
    return /^rgba?\(.*\)$/.test(rgba) ? rgba : 'rgba(0,0,0,1)'
  }

  const { r, g, b } = rgba
  let { a } = rgba

  if (a > 1) a /= 255

  a = Math.max(0, Math.min(1, Number(a.toFixed(3))))

  return `rgba(${r},${g},${b},${a})`
}

/** Checks whether a string is a hex color (`#rgb` / `#rrggbb`). */
export function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{3,6}$/.test(value)
}

/**
 * Applies alpha to a color.
 * - hex → `rgba(r,g,b,opacity)`;
 * - everything else (rgba, hsl, var(...)) — as is.
 */
export function paintWithOpacity(color: string, opacity: number): string {
  return isHexColor(color)
    ? rgbaStringify(hexToRgbA(color, opacity))
    : color
}