/**
 * External environment adapters.
 *
 * Flipper / Calc / Calendar components do not interact with the outside world
 * directly - they receive all data through these adapters.
 * This keeps them independent of frameworks, platforms, and storage.
 */

/** Function for unsubscribing from a subscription. */
export type Unsubscribe = () => void

/**
 * Data storage (localStorage, IndexedDB, memory, ...).
 * Values are arbitrary; the adapter decides how to serialize them.
 */
export interface StorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
}

/**
 * Source of the current locale.
 *
 * `subscribe` - optional: if the application can notify about locale
 * changes, Flipper subscribes and updates the calendar automatically.
 * If not - the application updates it manually through
 * `flipper.setLocale()`.
 */
export interface LocaleAdapter {
  current(): string
  subscribe?(listener: (locale: string) => void): Unsubscribe
}

/**
 * Source of the background color.
 *
 * As with `LocaleAdapter` - `subscribe` is optional.
 */
export interface ThemeAdapter {
  backgroundColor(): string
  subscribe?(listener: (color: string) => void): Unsubscribe
}

/** Logger - for debugging messages. */
export interface LoggerAdapter {
  info(message: string, ...args: readonly unknown[]): void
  warn(message: string, ...args: readonly unknown[]): void
  error(message: string, ...args: readonly unknown[]): void
}

/** Complete environment received by Flipper. */
export interface HostEnvironment {
  readonly storage: StorageAdapter
  readonly locale: LocaleAdapter
  readonly theme: ThemeAdapter
  readonly logger: LoggerAdapter
}
