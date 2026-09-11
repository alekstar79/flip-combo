/**
 * Registry of active Flippers - determines z-index.
 *
 * The last registered or "raised" element gets the highest z-index.
 * During drag, the element is raised to the top.
 */

const registry: number[] = []
let counter = 0

export function register(): number {
  const uid = ++counter
  registry.push(uid)
  return uid
}

export function unregister(uid: number): void {
  const idx = registry.indexOf(uid)
  if (idx !== -1) {
    registry.splice(idx, 1)
  }
}

export function bringToFront(uid: number): void {
  const idx = registry.indexOf(uid)
  if (idx === -1) return
  registry.splice(idx, 1)
  registry.push(uid)
}

export function getZIndex(uid: number): number {
  const idx = registry.indexOf(uid)
  return idx === -1 ? 1 : idx + 1
}

/** Reset the registry - for tests only. */
export function __reset(): void {
  registry.length = 0
  counter = 0
}
