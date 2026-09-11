import { getDefaultStorage, loadStoredPosition, saveStoredPosition } from './position'
import { attachDrag } from './drag'

/** Delay before saving the position (ms) */
const PERSIST_DEBOUNCE_MS = 300

export interface DraggableOptions {
  readonly storageKey?: string
  readonly initialPosition?: {
    readonly left: number
    readonly top: number
  }
  readonly persist?: boolean
}

export interface DraggableInstance {
  getPosition(): { readonly left: number; readonly top: number }
  setPosition(left: number, top: number): void
  destroy(): void
}

export function makeDraggable(
  element: HTMLElement,
  options: DraggableOptions = {},
): DraggableInstance {
  const persist = options.persist ?? true
  const storageKey = options.storageKey ?? 'flip-combo:position'
  const storage = getDefaultStorage()

  let left = 0
  let top = 0
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function applyPosition(): void {
    const rect = element.getBoundingClientRect()
    const ww = window.innerWidth
    const wh = window.innerHeight

    left = Math.max(0, Math.min(left, ww - rect.width))
    top = Math.max(0, Math.min(top, wh - rect.height))

    element.style.left = `${left}px`
    element.style.top = `${top}px`
  }

  function scheduleSave(): void {
    if (!persist) return

    if (saveTimer !== null) clearTimeout(saveTimer)

    saveTimer = setTimeout(() => {
      saveTimer = null
      saveStoredPosition(storage, { left, top }, storageKey)
    }, PERSIST_DEBOUNCE_MS)
  }

  function flushSave(): void {
    if (saveTimer === null) return

    clearTimeout(saveTimer)
    saveTimer = null

    if (persist) {
      saveStoredPosition(storage, { left, top }, storageKey)
    }
  }

  function center(): void {
    const rect = element.getBoundingClientRect()

    left = (window.innerWidth - rect.width) / 2
    top = (window.innerHeight - rect.height) / 2

    applyPosition()
  }

  const stored = persist ? loadStoredPosition(storage, storageKey) : null

  if (stored) {
    left = stored.left
    top = stored.top
    requestAnimationFrame(applyPosition)
  } else if (options.initialPosition) {
    left = options.initialPosition.left
    top = options.initialPosition.top
    requestAnimationFrame(applyPosition)
  } else {
    requestAnimationFrame(center)
  }

  function handleResize(): void {
    applyPosition()
  }

  window.addEventListener('resize', handleResize)

  const detachDrag = attachDrag(element, {
    onMove: (clientX, clientY, grabX, grabY) => {
      left = clientX - grabX
      top = clientY - grabY
      applyPosition()
    },
    onEnd: () => {
      scheduleSave()
    },
  })

  return {
    getPosition: () => ({ left, top }),

    setPosition(nextLeft, nextTop) {
      left = nextLeft
      top = nextTop
      applyPosition()
      scheduleSave()
    },
    destroy(): void {
      flushSave()

      window.removeEventListener('resize', handleResize)
      detachDrag()
    },
  }
}
