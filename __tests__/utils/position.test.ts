import { describe, it, expect } from 'vitest'
import { loadStoredPosition, saveStoredPosition } from '@/utils/position'
import type { StorageAdapter } from '@/host'

function createMemoryStorage(): StorageAdapter {
  const store = new Map<string, unknown>()

  return {
    get<T>(key: string): T | null {
      return store.has(key) ? (store.get(key) as T) : null
    },
    set<T>(key: string, value: T): void {
      store.set(key, value)
    },
    remove(key: string): void {
      store.delete(key)
    },
  }
}

describe('position storage', () => {
  it('returns null when there is no position', () => {
    const storage = createMemoryStorage()
    expect(loadStoredPosition(storage, 'test')).toBeNull()
  })

  it('round-trip with opacity', () => {
    const storage = createMemoryStorage()
    const pos = { left: 100, top: 200, rotated: true, opacity: 0.6 }

    saveStoredPosition(storage, pos, 'test')
    expect(loadStoredPosition(storage, 'test')).toEqual(pos)
  })

  it('round-trip without opacity (backward compatibility)', () => {
    const storage = createMemoryStorage()
    const pos = { left: 100, top: 200, rotated: false }

    saveStoredPosition(storage, pos, 'test')
    expect(loadStoredPosition(storage, 'test')).toEqual(pos)
  })

  it('discards invalid values', () => {
    const storage = createMemoryStorage()
    storage.set('test', { left: 'oops', top: 0 })
    expect(loadStoredPosition(storage, 'test')).toBeNull()
  })

  it('discards values without required fields', () => {
    const storage = createMemoryStorage()
    storage.set('test', { left: 10 })
    expect(loadStoredPosition(storage, 'test')).toBeNull()
  })

  it('discards non-numeric opacity', () => {
    const storage = createMemoryStorage()
    storage.set('test', { left: 10, top: 20, opacity: 'oops' })
    expect(loadStoredPosition(storage, 'test')).toBeNull()
  })

  it('overwrites the previous value', () => {
    const storage = createMemoryStorage()

    saveStoredPosition(storage, { left: 10, top: 10 }, 'test')
    saveStoredPosition(storage, { left: 20, top: 30 }, 'test')

    expect(loadStoredPosition(storage, 'test')).toEqual({ left: 20, top: 30 })
  })
})
