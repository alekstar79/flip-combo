import type { StorageAdapter } from '@/host'
import { createDefaultHost } from '@/host'

export interface StoredPosition {
  readonly left: number
  readonly top: number
  readonly rotated?: boolean
  readonly opacity?: number
}

/** Default localStorage key */
export const DEFAULT_POSITION_KEY = 'flip-combo:position'

export function isValidStoredPosition(value: unknown): value is StoredPosition {
  if (typeof value !== 'object' || value === null) return false

  const obj = value as Record<string, unknown>

  if (typeof obj.left !== 'number') return false
  if (typeof obj.top !== 'number') return false
  if ('rotated' in obj && typeof obj.rotated !== 'boolean') return false
  if ('opacity' in obj && typeof obj.opacity !== 'number') return false

  return true
}

export function loadStoredPosition(
  storage: StorageAdapter,
  key: string = DEFAULT_POSITION_KEY,
): StoredPosition | null {
  const value = storage.get<unknown>(key)
  return isValidStoredPosition(value) ? value : null
}

export function saveStoredPosition(
  storage: StorageAdapter,
  position: StoredPosition,
  key: string = DEFAULT_POSITION_KEY,
): void {
  storage.set(key, position)
}

/**
 * Returns the default `StorageAdapter` — a wrapper around localStorage.
 * Used when the panel works without Flipper.
 */
export function getDefaultStorage(): StorageAdapter {
  return createDefaultHost().storage
}
