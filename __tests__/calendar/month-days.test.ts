import { describe, it, expect } from 'vitest'
import {
  buildMonthDays,
  getDaysInMonth,
  getFirstDayOffset,
  isLeapYear,
} from '@/calendar/month-days'

// ---------- Leap years -----------------------------------------------------

describe('isLeapYear', () => {
  it('regular leap years', () => {
    expect(isLeapYear(2024)).toBe(true)
    expect(isLeapYear(2020)).toBe(true)
    expect(isLeapYear(2016)).toBe(true)
  })

  it('regular non-leap years', () => {
    expect(isLeapYear(2023)).toBe(false)
    expect(isLeapYear(2022)).toBe(false)
  })

  it('century years: divisible by 100 but not by 400 — not leap years', () => {
    expect(isLeapYear(1900)).toBe(false)
    expect(isLeapYear(2100)).toBe(false)
    expect(isLeapYear(2200)).toBe(false)
  })

  it('century years: divisible by 400 — leap years', () => {
    expect(isLeapYear(2000)).toBe(true)
    expect(isLeapYear(2400)).toBe(true)
  })
})

// ---------- Days in a month ------------------------------------------------

describe('getDaysInMonth', () => {
  it('31-day months', () => {
    expect(getDaysInMonth(2024, 0)).toBe(31)  // January
    expect(getDaysInMonth(2024, 2)).toBe(31)  // March
    expect(getDaysInMonth(2024, 4)).toBe(31)  // May
    expect(getDaysInMonth(2024, 6)).toBe(31)  // July
    expect(getDaysInMonth(2024, 7)).toBe(31)  // August
    expect(getDaysInMonth(2024, 9)).toBe(31)  // October
    expect(getDaysInMonth(2024, 11)).toBe(31) // December
  })

  it('30-day months', () => {
    expect(getDaysInMonth(2024, 3)).toBe(30)  // April
    expect(getDaysInMonth(2024, 5)).toBe(30)  // June
    expect(getDaysInMonth(2024, 8)).toBe(30)  // September
    expect(getDaysInMonth(2024, 10)).toBe(30) // November
  })

  it('February: 28 days in a non-leap year', () => {
    expect(getDaysInMonth(2023, 1)).toBe(28)
    expect(getDaysInMonth(1900, 1)).toBe(28)
    expect(getDaysInMonth(2100, 1)).toBe(28)
  })

  it('February: 29 days in a leap year', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29)
    expect(getDaysInMonth(2000, 1)).toBe(29)
  })
})

// ---------- First-day offset -----------------------------------------------

describe('getFirstDayOffset — en (Sun first)', () => {
  it('September 1, 2024 — Sunday, offset 0', () => {
    expect(getFirstDayOffset(2024, 8, 'en')).toBe(0)
  })

  it('January 1, 2024 — Monday, offset 1', () => {
    expect(getFirstDayOffset(2024, 0, 'en')).toBe(1)
  })

  it('February 1, 2024 — Thursday, offset 4', () => {
    expect(getFirstDayOffset(2024, 1, 'en')).toBe(4)
  })

  it('March 1, 2024 — Friday, offset 5', () => {
    expect(getFirstDayOffset(2024, 2, 'en')).toBe(5)
  })

  it('June 1, 2024 — Saturday, offset 6', () => {
    expect(getFirstDayOffset(2024, 5, 'en')).toBe(6)
  })
})

describe('getFirstDayOffset — ru (Mon first)', () => {
  it('September 1, 2024 — Sunday, offset 6 (last column)', () => {
    expect(getFirstDayOffset(2024, 8, 'ru')).toBe(6)
  })

  it('January 1, 2024 — Monday, offset 0', () => {
    expect(getFirstDayOffset(2024, 0, 'ru')).toBe(0)
  })

  it('February 1, 2024 — Thursday, offset 3', () => {
    expect(getFirstDayOffset(2024, 1, 'ru')).toBe(3)
  })

  it('March 1, 2024 — Friday, offset 4', () => {
    expect(getFirstDayOffset(2024, 2, 'ru')).toBe(4)
  })

  it('June 1, 2024 — Saturday, offset 5', () => {
    expect(getFirstDayOffset(2024, 5, 'ru')).toBe(5)
  })
})

// ---------- Month grid -----------------------------------------------------

describe('buildMonthDays', () => {
  const today = new Date(2024, 8, 15) // September 15, 2024

  it('September 2024, ru: 6 empty + 30 days', () => {
    const cells = buildMonthDays(2024, 8, 'ru', today)

    expect(cells).toHaveLength(36)
    expect(cells.slice(0, 6).every(c => c.day === null)).toBe(true)
    expect(cells[6]?.day).toBe(1)
    expect(cells[35]?.day).toBe(30)
  })

  it('September 2024, en: 0 empty + 30 days', () => {
    const cells = buildMonthDays(2024, 8, 'en', today)

    expect(cells).toHaveLength(30)
    expect(cells[0]?.day).toBe(1)
    expect(cells[29]?.day).toBe(30)
  })

  it('August 2024, ru: 3 empty + 31 days', () => {
    const cells = buildMonthDays(2024, 7, 'ru', today)

    expect(cells).toHaveLength(34)
    expect(cells.slice(0, 3).every(c => c.day === null)).toBe(true)
    expect(cells[3]?.day).toBe(1)
    expect(cells[33]?.day).toBe(31)
  })

  it('February 2024 (leap year), ru: 3 empty + 29 days', () => {
    const cells = buildMonthDays(2024, 1, 'ru', today)

    expect(cells).toHaveLength(32)
    expect(cells[31]?.day).toBe(29)
  })

  it('February 2023 (non-leap year), ru: 28 days', () => {
    const cells = buildMonthDays(2023, 1, 'ru', today)

    // February 1, 2023 — Wednesday, offset = 2.
    const nonEmpty = cells.filter(c => c.day !== null)
    expect(nonEmpty).toHaveLength(28)
    expect(nonEmpty[27]?.day).toBe(28)
  })

  it('isToday flags: only today is marked (current month)', () => {
    const cells = buildMonthDays(2024, 8, 'ru', today)

    const todayCells = cells.filter(c => c.isToday)
    expect(todayCells).toHaveLength(1)
    expect(todayCells[0]?.day).toBe(15)
  })

  it('isToday flags: empty in another month', () => {
    const cells = buildMonthDays(2024, 7, 'ru', today) // August, while today = September

    expect(cells.every(c => !c.isToday)).toBe(true)
  })

  it('all empty cells come before the first day', () => {
    const cells = buildMonthDays(2024, 8, 'ru', today)

    const firstDayIndex = cells.findIndex(c => c.day !== null)
    const allBeforeAreNull = cells
      .slice(0, firstDayIndex)
      .every(c => c.day === null)

    expect(allBeforeAreNull).toBe(true)
    expect(firstDayIndex).toBe(6)
  })

  it('regression: September 2024, ru — the 1st does not disappear (legacy bug)', () => {
    // In the original Calendar.vue, { day: 1 } was lost for this month,
    // because firstDay === 0 (Sunday) broke the `i >= firstDay` condition.
    const cells = buildMonthDays(2024, 8, 'ru', today)
    const days = cells.map(c => c.day).filter((d): d is number => d !== null)

    expect(days[0]).toBe(1)
    expect(days[days.length - 1]).toBe(30)
    expect(days).toHaveLength(30)
  })
})