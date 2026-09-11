export interface DragHandlers {
  readonly onStart?: () => void
  readonly onMove: (
    clientX: number,
    clientY: number,
    grabX: number,
    grabY: number,
  ) => void
  readonly onEnd?: () => void
}

export type DetachFn = () => void

/**
 * Attaches dragging to the left mouse button.
 * `mousemove`/`mouseup` are attached to `document` - so that
 * so dragging does not break when the cursor leaves the element.
 */
export function attachDrag(el: HTMLElement, handlers: DragHandlers): DetachFn {
  let grabX = 0
  let grabY = 0
  let active = false

  function onMove(e: MouseEvent): void {
    if (!active) return
    handlers.onMove(e.clientX, e.clientY, grabX, grabY)
  }

  function onUp(): void {
    if (!active) return

    active = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)

    handlers.onEnd?.()
  }

  function onDown(e: MouseEvent): void {
    if (e.button !== 0) return

    const rect = el.getBoundingClientRect()

    grabX = e.clientX - rect.left
    grabY = e.clientY - rect.top

    active = true
    handlers.onStart?.()

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  el.addEventListener('mousedown', onDown)

  return (): void => {
    el.removeEventListener('mousedown', onDown)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
}
