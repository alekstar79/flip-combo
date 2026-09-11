import type {
  HostEnvironment,
  LocaleAdapter,
  LoggerAdapter,
  StorageAdapter,
  ThemeAdapter,
} from './types'

/** Default background color (`#007aff`). */
const DEFAULT_BACKGROUND = '#007aff'

/** Default locale. */
const DEFAULT_LOCALE = 'ru'

/** Wrapper around localStorage. Works both in a browser and without one (no-op). */
function createLocalStorageAdapter(): StorageAdapter {
  const available = typeof localStorage !== 'undefined'

  return {
    get<T>(key: string): T | null {
      if (!available) return null

      try {
        const raw = localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as T) : null
      } catch {
        return null
      }
    },
    set<T>(key: string, value: T): void {
      if (!available) return

      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch { /* QuotaExceeded or access denied - silently ignore */ }
    },
    remove(key: string): void {
      if (!available) return

      try {
        localStorage.removeItem(key)
      } catch { /* Ignore */ }
    }
  }
}

/**
 * Locale from `navigator.language`.
 * There is no subscription - this is a "static" adapter.
 */
function createNavigatorLocaleAdapter(): LocaleAdapter {
  const lang =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language.slice(0, 2)
      : DEFAULT_LOCALE

  return {
    current: () => lang
  }
}

/** Static background color. There is no subscription. */
function createStaticThemeAdapter(): ThemeAdapter {
  return {
    backgroundColor: () => DEFAULT_BACKGROUND
  }
}

/** Console logger with a prefix. */
function createConsoleLogger(): LoggerAdapter {
  return {
    info: (message, ...args) => console.info(`[flipper] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[flipper] ${message}`, ...args),
    error: (message, ...args) => console.error(`[flipper] ${message}`, ...args)
  }
}

/**
 * Default environment — works without external configuration.
 * If the application did not pass `host` to `createFlipper`,
 * this set is used.
 */
export function createDefaultHost(): HostEnvironment {
  return {
    storage: createLocalStorageAdapter(),
    locale: createNavigatorLocaleAdapter(),
    theme: createStaticThemeAdapter(),
    logger: createConsoleLogger()
  }
}
