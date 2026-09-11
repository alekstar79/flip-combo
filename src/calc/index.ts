import type { CalcAction, CalcInstance, CalcProps, CalcState, Operator } from './types'

import { makeDraggable, type DraggableInstance } from '@/utils/draggable'
import { clipboard } from '@/utils/clipboard'

import { formatDisplay } from './format'
import {
  createInitialState,
  displayCurrent,
  displayHistory,
  reduce,
} from './reducer'

import './styles.scss'

// Types

// Button data

type KeyAction =
  | 'digit'
  | 'dot'
  | 'operator'
  | 'equals'
  | 'clear'
  | 'copy'
  | 'off'
  | 'flip'

interface KeySpec {
  readonly label: string
  readonly action: KeyAction
  readonly value?: string
  readonly flatBottom?: boolean
  readonly flatRight?: boolean
  readonly modifier?: string
}

const KEYS: readonly KeySpec[] = [
  { label: '⏻', action: 'off', modifier: 'off' },
  { label: '⇄', action: 'flip', modifier: 'flip' },
  { label: 'ac', action: 'clear' },
  { label: '/', action: 'operator', value: '/', flatRight: true },

  { label: '7', action: 'digit', value: '7' },
  { label: '8', action: 'digit', value: '8' },
  { label: '9', action: 'digit', value: '9' },
  { label: '*', action: 'operator', value: '*', flatRight: true },

  { label: '4', action: 'digit', value: '4' },
  { label: '5', action: 'digit', value: '5' },
  { label: '6', action: 'digit', value: '6' },
  { label: '-', action: 'operator', value: '-', flatRight: true },

  { label: '1', action: 'digit', value: '1' },
  { label: '2', action: 'digit', value: '2' },
  { label: '3', action: 'digit', value: '3' },
  { label: '+', action: 'operator', value: '+', flatRight: true },

  { label: '⎘', action: 'copy', modifier: 'copy', flatBottom: true },
  { label: '0', action: 'digit', value: '0', flatBottom: true },
  { label: '.', action: 'dot', flatBottom: true },
  { label: '=', action: 'equals', flatBottom: true, flatRight: true }
]

// Helpers

function createKey(spec: KeySpec): HTMLButtonElement {
  const btn = document.createElement('button')

  btn.type = 'button'
  btn.className = 'calc__key'
  btn.textContent = spec.label
  btn.dataset.action = spec.action

  if (spec.value !== undefined) {
    btn.dataset.value = spec.value
  }
  if (spec.modifier !== undefined) {
    btn.classList.add(`calc__key--${spec.modifier}`)
  }
  if (spec.flatBottom) {
    btn.classList.add('calc__key--flat-bottom')
  }
  if (spec.flatRight) {
    btn.classList.add('calc__key--flat-right')
  }

  return btn
}

function toCalcAction(
  action: KeyAction,
  value: string | undefined,
): CalcAction | null {
  switch (action) {
    case 'digit':
      return value !== undefined ? { type: 'digit', value } : null
    case 'dot':
      return { type: 'dot' }
    case 'operator':
      return value !== undefined
        ? { type: 'operator', value: value as Operator }
        : null
    case 'equals':
      return { type: 'equals' }
    case 'clear':
      return { type: 'clear' }
    case 'copy':
    case 'off':
    case 'flip':
      return null
  }
}

// Factory

export function createCalc(props: CalcProps = {}): CalcInstance {
  let state: CalcState = createInitialState()

  let element: HTMLElement | null = null
  let innerEl: HTMLElement | null = null
  let displayEl: HTMLElement | null = null
  let historyEl: HTMLElement | null = null
  let keyboardEl: HTMLElement | null = null

  let draggable: DraggableInstance | null = null

  // Render

  function render(): void {
    if (!displayEl || !historyEl) return

    displayEl.textContent = formatDisplay(displayCurrent(state))
    historyEl.textContent = displayHistory(state)
  }

  function dispatch(action: CalcAction): void {
    state = reduce(state, action)
    render()
  }

  async function handleCopy(): Promise<void> {
    const text = displayCurrent(state).replace(/\s/g, '')

    try {
      await clipboard.writeText(text)
      props.onCopy?.(text)
    } catch {
      // Ignore
    }
  }

  function handleClick(event: MouseEvent): void {
    const target = event.target
    if (!(target instanceof Element)) return

    const btn = target.closest<HTMLButtonElement>('.calc__key')
    if (!btn) return

    const action = btn.dataset.action as KeyAction | undefined
    if (!action) return

    if (action === 'off') {
      props.onOff?.()
      return
    }
    if (action === 'flip') {
      props.onFlip?.()
      return
    }
    if (action === 'copy') {
      void handleCopy()
      return
    }

    const calcAction = toCalcAction(action, btn.dataset.value)
    if (calcAction) {
      dispatch(calcAction)
    }
  }

  // Create markup

  function buildInner(): HTMLElement {
    const root = document.createElement('div')
    root.className = 'calc'

    const display = document.createElement('div')
    display.className = 'calc__display'

    const history = document.createElement('div')
    history.className = 'calc__history'
    history.setAttribute('aria-live', 'polite')
    history.setAttribute('aria-hidden', 'true')

    const output = document.createElement('div')
    output.className = 'calc__output'
    output.setAttribute('role', 'status')
    output.setAttribute('aria-live', 'polite')

    display.appendChild(history)
    display.appendChild(output)

    const keyboard = document.createElement('div')
    keyboard.className = 'calc__keyboard'

    for (const spec of KEYS) {
      keyboard.appendChild(createKey(spec))
    }

    root.appendChild(display)
    root.appendChild(keyboard)

    displayEl = output
    historyEl = history
    keyboardEl = keyboard

    return root
  }

  // Lifecycle

  function mount(container: HTMLElement): void {
    if (element) {
      throw new Error('[Calc]: already mounted')
    }

    innerEl = buildInner()

    if (props.draggable) {
      // Panel inside a floating container - move the container,
      // while `.calc` itself remains at the wrapper's full width/height.
      element = document.createElement('div')
      element.className = 'calc-floating'
      element.style.position = 'fixed'
      element.style.zIndex = '7'
      element.style.width = '255px'
      element.style.height = '345px'
      element.appendChild(innerEl)

      draggable = makeDraggable(element, {
        storageKey: props.storageKey ?? 'flip-combo:calc',
      })
    } else {
      element = innerEl
    }

    container.appendChild(element)

    if (keyboardEl) {
      keyboardEl.addEventListener('click', handleClick)
    }

    render()
  }

  function unmount(): void {
    draggable?.destroy()
    draggable = null

    if (keyboardEl) {
      keyboardEl.removeEventListener('click', handleClick)
    }
    element?.remove()

    element = null
    innerEl = null
    displayEl = null
    historyEl = null
    keyboardEl = null
  }

  return {
    get element(): HTMLElement {
      if (!element) throw new Error('[Calc]: not mounted')
      return element
    },
    mount,
    unmount,
    getState: () => state,
    dispatch
  }
}

export type {
  CalcAction,
  CalcInstance,
  CalcProps,
  CalcState,
  Operator,
} from './types'
