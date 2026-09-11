/**
 * Copying to the clipboard without requesting user permission.
 *
 * Strategy:
 *  1. Try native `navigator.clipboard.writeText` - it is not always available
 *     (only in a secure context) and may throw `NotAllowedError` if
 *     the user denied permission.
 *  2. On any failure - switch to the fallback through `document.execCommand('copy')`
 *     with a temporary element and selection. This path does NOT request permission
 *     from the user and works synchronously within a user gesture.
 */

// Constants

const TEXT_PLAIN = 'text/plain'

// Capture native API (once at startup)

const nav: Navigator | undefined =
  typeof navigator === 'undefined' ? undefined : navigator

const nativeClipboard: Clipboard | undefined = nav?.clipboard

const nativeWriteText: ((text: string) => Promise<void>) | undefined =
  nativeClipboard ? nativeClipboard.writeText.bind(nativeClipboard) : undefined

// Types

/** Data to insert: MIME -> value. */
type ClipboardData = Record<string, string>

/** Mutable holder: `execCopy` sets the result here. */
interface CopyTracker {
  success: boolean
}

/**
 * Local type for the deprecated Clipboard path.
 *
 * `document.execCommand` is marked `@deprecated` in lib.dom.d.ts — on any
 * TypeScript emits suggestion TS6387 for direct access, which `@ts-ignore`
 * does NOT suppress (suggestions ignore this comment, unlike errors).
 *
 * Solution: cast `document` to our own interface. The new `execCommand` symbol
 * in `LegacyDocument` does not carry `@deprecated`, so the diagnostic does not
 * trigger. We do not touch the original deprecated symbol — we simply
 * "do not notice" it at the type level.
 *
 * Why this is acceptable:
 *  - the method still exists in browsers (see the MDN compatibility table);
 *  - it remains the only way to copy to the clipboard WITHOUT requesting
 *    user permission in non-secure contexts and embedded iframes;
 *  - the call is isolated in one function — if browsers finally remove
 *    the method, compilation will not "fail unexpectedly"; this will be an explicit
 *    place to reconsider the strategy.
 */
interface LegacyDocument {
  execCommand(commandId: string, showUI?: boolean, value?: string): boolean
}

// Helpers for working with selection

function selectionSet(el: Element): void {
  const selection = document.getSelection()

  if (!selection) {
    return
  }

  const range = document.createRange()

  range.selectNodeContents(el)
  selection.removeAllRanges()
  selection.addRange(range)
}

function selectionClear(): void {
  document.getSelection()?.removeAllRanges()
}

// Helpers for working with data

function stringToStringItem(str: string): ClipboardData {
  return { [TEXT_PLAIN]: str }
}

/**
 * `copy` event listener: sets our data in `clipboardData`
 * and prevents the default behavior (copying the current selection).
 *
 * `success = false` if the browser could not read back what we
 * we wrote. This is a "honesty" check - some engines silently
 * ignore `setData`.
 */
function copyListener(
  tracker: CopyTracker,
  data: ClipboardData,
  event: ClipboardEvent,
): void {
  tracker.success = true

  const clipboardData = event.clipboardData

  if (!clipboardData) {
    tracker.success = false
    return
  }

  for (const type of Object.keys(data)) {
    const value = data[type]

    if (value === undefined) {
      continue
    }

    clipboardData.setData(type, value)

    if (type === TEXT_PLAIN && clipboardData.getData(type) !== value) {
      tracker.success = false
    }
  }

  event.preventDefault()
}

// Helpers for copying

/**
 * Wrapper around deprecated `document.execCommand('copy')`.
 *
 * See the comment for `LegacyDocument` — why a cast is used instead of
 * direct access to `document.execCommand`.
 */
function legacyExecCopy(): boolean {
  return (document as unknown as LegacyDocument).execCommand('copy')
}

/**
 * Synchronous `execCommand('copy')` with a temporarily attached `copy`
 * event listener.
 *
 * IMPORTANT: must be called in the context of a user gesture, otherwise the browser
 * may refuse to execute it without explaining why.
 */
function execCopy(data: ClipboardData): boolean {
  const tracker: CopyTracker = { success: false }
  const listener = (event: ClipboardEvent): void =>
    copyListener(tracker, data, event)

  document.addEventListener('copy', listener)

  try {
    legacyExecCopy()
  } finally {
    document.removeEventListener('copy', listener)
  }

  return tracker.success
}

/** Copying through selection on an existing element. */
function copyUsingTempSelection(el: Element, data: ClipboardData): boolean {
  selectionSet(el)

  const success = execCopy(data)

  selectionClear()

  return success
}

/** Copying through a temporary div with `user-select: text`. */
function copyUsingTempElem(data: ClipboardData): boolean {
  const body = document.body

  if (!body) {
    return false
  }

  const tempElem = document.createElement('div')

  tempElem.setAttribute('style', '-webkit-user-select: text !important')
  tempElem.textContent = 'temporary element'

  body.appendChild(tempElem)

  const success = copyUsingTempSelection(tempElem, data)

  body.removeChild(tempElem)

  return success
}

/**
 * Copying "through the DOM": create a div with a span (in shadow DOM where possible,
 * so global styles are not affected), select the text, and call `execCommand`.
 */
function copyTextUsingDOM(str: string): boolean {
  const body = document.body

  if (!body) {
    return false
  }

  const tempElem = document.createElement('div')
  const span = document.createElement('span')

  tempElem.setAttribute('style', '-webkit-user-select: text !important')

  const spanParent: Node = tempElem.attachShadow
    ? tempElem.attachShadow({ mode: 'open' })
    : tempElem

  span.innerText = str
  spanParent.appendChild(span)
  body.appendChild(tempElem)

  selectionSet(span)

  const result = legacyExecCopy()

  selectionClear()
  body.removeChild(tempElem)

  return result
}

// Fallback attempt cascade

/** Returns true on the first success. */
async function writeFallback(item: ClipboardData): Promise<boolean> {
  if (execCopy(item)) {
    return true
  }

  if (document.body && copyUsingTempSelection(document.body, item)) {
    return true
  }

  if (copyUsingTempElem(item)) {
    return true
  }

  const text = item[TEXT_PLAIN]

  return text !== undefined && copyTextUsingDOM(text)
}

// Public API

export const clipboard = {
  /**
  * Copies text to the clipboard.
   *
  * Always tries to do this without requesting permission:
  *  - if `navigator.clipboard` is available — tries it, and on refusal
  *    (for example, `NotAllowedError`) silently switches to the fallback;
  *  - otherwise immediately uses `document.execCommand('copy')`.
   *
  * @throws {Error} — only if all paths are exhausted and none worked.
   */
  async writeText(text: string): Promise<void> {
    if (nativeWriteText) {
      try {
        await nativeWriteText(text)
        return
      } catch {
        // Permission refusal or another error — use the fallback.
      }
    }

    const ok = await writeFallback(stringToStringItem(text))

    if (!ok) {
      throw new Error('[Clipboard]: writeText() failed on all fallbacks')
    }
  }
}
