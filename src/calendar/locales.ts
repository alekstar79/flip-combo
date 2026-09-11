import type { Locale } from './types'

interface LocaleData {
  readonly months: readonly string[]
  readonly weekDays: readonly string[]
}

/**
 * Localization data.
 * The order of weekdays corresponds to the first day of the week:
 *  - ru: Mon–Sun (Monday first);
 *  - en: Sun–Sat (Sunday first).
 */
const LOCALES: Readonly<Record<Locale, LocaleData>> = {
  ru: {
    months: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ],
    weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  },
  en: {
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
}

export function getMonthNames(locale: Locale): readonly string[] {
  return LOCALES[locale].months
}

export function getWeekDays(locale: Locale): readonly string[] {
  return LOCALES[locale].weekDays
}