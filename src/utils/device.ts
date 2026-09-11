/**
 * Determines mobile mode using media queries:
 * coarse pointer or narrow screen (< 600px).
 * Safe for SSR - returns `false` if `window` is unavailable.
 */
export function detectMobile(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 600px)').matches
  )
}
