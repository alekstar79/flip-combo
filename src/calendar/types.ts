/** Supported calendar locales. */
export type Locale = 'ru' | 'en'

export interface CalendarProps {
  readonly locale?: Locale
  readonly initialDate?: Date
  /**
  * Enables dragging the panel.
  * The panel is wrapped in a positioned container (`position: fixed`)
  * and remembers its position in localStorage.
   */
  readonly draggable?: boolean
  /**
  * localStorage key for saving the position.
  * Used only when `draggable: true`.
  * Default - `'flip-combo:calendar'`.
   */
  readonly storageKey?: string
  readonly onOff?: () => void
  readonly onFlip?: () => void
}

/** Day cell in the calendar grid. */
export interface DayCell {
  /** Day of the month (1–31) or `null` for an empty alignment cell. */
  readonly day: number | null
  /** Whether the day is today. */
  readonly isToday: boolean
}

/** Internal calendar state. */
export interface CalendarState {
  readonly year: number
  readonly month: number
  readonly showMonthList: boolean
  readonly locale: Locale
}

export interface CalendarInstance {
  readonly element: HTMLElement
  mount(container: HTMLElement): void
  unmount(): void
  /**
  * Updates the locale without recreating the panel.
  * Accepts an arbitrary string - normalized to `Locale` internally.
   */
  setLocale(locale: string): void
  getState(): CalendarState
}
