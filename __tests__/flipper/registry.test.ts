import { describe, it, expect, beforeEach } from 'vitest'
import {
  bringToFront,
  getZIndex,
  register,
  unregister,
  __reset,
} from '@/flipper/registry'

describe('flipper registry', () => {
  beforeEach(() => {
    __reset()
  })

  it('register returns increasing uids', () => {
    const a = register()
    const b = register()
    const c = register()

    expect(a).toBe(1)
    expect(b).toBe(2)
    expect(c).toBe(3)
  })

  it('getZIndex: a fresh element — 1', () => {
    const uid = register()
    expect(getZIndex(uid)).toBe(1)
  })

  it('getZIndex: elements follow registration order', () => {
    const a = register()
    const b = register()
    const c = register()

    expect(getZIndex(a)).toBe(1)
    expect(getZIndex(b)).toBe(2)
    expect(getZIndex(c)).toBe(3)
  })

  it('bringToFront: element moves to the end', () => {
    const a = register()
    const b = register()
    const c = register()

    bringToFront(a)

    expect(getZIndex(a)).toBe(3)
    expect(getZIndex(b)).toBe(1)
    expect(getZIndex(c)).toBe(2)
  })

  it('unregister: removal does not change the order of the others', () => {
    const a = register()
    const b = register()
    const c = register()

    unregister(b)

    expect(getZIndex(a)).toBe(1)
    expect(getZIndex(c)).toBe(2)
  })

  it('unregister: removed uid gets the default z-index 1', () => {
    const uid = register()
    unregister(uid)
    expect(getZIndex(uid)).toBe(1)
  })

  it('getZIndex: unknown uid — default 1', () => {
    expect(getZIndex(999)).toBe(1)
  })

  it('bringToFront: unknown uid — no-op', () => {
    const a = register()
    const b = register()

    bringToFront(999)

    expect(getZIndex(a)).toBe(1)
    expect(getZIndex(b)).toBe(2)
  })

  it('bringToFront twice on one element — stable result', () => {
    const a = register()
    const b = register()
    const c = register()

    bringToFront(a)
    bringToFront(a)

    expect(getZIndex(a)).toBe(3)
    expect(getZIndex(b)).toBe(1)
    expect(getZIndex(c)).toBe(2)
  })

  it('after unregistering all — registry is empty', () => {
    const a = register()
    const b = register()

    unregister(a)
    unregister(b)

    expect(getZIndex(a)).toBe(1)
    expect(getZIndex(b)).toBe(1)
    expect(getZIndex(999)).toBe(1)
  })
})