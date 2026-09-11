import type { DayCell, Locale } from './types'

/** Days in months for a non-leap year (January → December). */
const DAYS_IN_MONTH = [
  31, 28, 31, 30, 31, 30,
  31, 31, 30, 31, 30, 31,
] as const

/** Whether a year is a leap year in the Gregorian calendar. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/** Number of days in a month. `month` — 0-based (0 = January). */
export function getDaysInMonth(year: number, month: number): number {
  if (month === 1 && isLeapYear(year)) {
    return 29
  }
  return DAYS_IN_MONTH[month] ?? 30
}

/**
 * Offset of the first day of the month in the grid.
 *
 * Returns the column index (0..6) containing the 1st day of the month,
 * taking the locale's first day of the week into account:
 *  - `en`: week Sun → Sat, `getDay()` = 0 (Sun) gives offset 0;
 *  - `ru`: week Mon → Sun, `getDay()` = 1 (Mon) gives offset 0.
 *
 * NOTE: this fixes a legacy bug. In the original Calendar.vue
 * September 2024 for the ru locale (the first day was Sunday) was built
 * shifted by one day, causing the 1st to disappear,
 * while the 30th was displayed first.
 */
export function getFirstDayOffset(
  year: number,
  month: number,
  locale: Locale,
): number {
  const jsDay = new Date(year, month, 1).getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (locale === 'ru') {
    // Convert to a Mon (0) → Sun (6) week
    return (jsDay + 6) % 7
  }

  return jsDay
}

/**
 * Builds an array of cells for displaying a month.
 *
 * Returns a sequence:
 *  - `offset` empty cells (`day: null`) for alignment with the first column;
 *  - days of the month 1..N, with the `isToday` flag for today's date.
 *
 * @param {number} year - year
 * @param {number} month - month
 * @param {Locale} locale - locale
 * @param today - parameter for testability (by default — current date)
 */
export function buildMonthDays(
  year: number,
  month: number,
  locale: Locale,
  today: Date = new Date(),
): readonly DayCell[] {
  const offset = getFirstDayOffset(year, month, locale)
  const count = getDaysInMonth(year, month)

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month
  const todayDate = today.getDate()

  const cells: DayCell[] = []

  for (let i = 0; i < offset; i++) {
    cells.push({ day: null, isToday: false })
  }

  for (let d = 1; d <= count; d++) {
    cells.push({
      day: d,
      isToday: isCurrentMonth && d === todayDate,
    })
  }

  return cells
}
