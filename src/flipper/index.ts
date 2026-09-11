import type { Entity, FlipperInstance, FlipperProps, FlipperState, FlipPanel, PanelOptions } from './types'
import type { HostEnvironment, Unsubscribe } from '@/host'

import { bringToFront, getZIndex, register, unregister } from './registry'

import {
  attachDrag,
  clamp,
  hexToRgbA,
  isHexColor,
  rgbaStringify,
  detectMobile,
  loadStoredPosition,
  saveStoredPosition
} from '@/utils'

import { createDefaultHost } from '@/host'

import './styles.scss'

// Constants

const MIN_OPACITY = 0.5
const MAX_OPACITY = 1
const OPACITY_STEP = 0.03
const DEFAULT_OPACITY = 0.7
const PERSIST_DEBOUNCE_MS = 300

/**
 * Applies alpha to a color. For hex - through utilities.
 * For other strings - as is.
 */
function paintWithOpacity(color: string, opacity: number): string {
  return isHexColor(color)
    ? rgbaStringify(hexToRgbA(color, opacity))
    : color
}

// Factory

export function createFlipper(props: FlipperProps): FlipperInstance {
  const host: HostEnvironment = props.host ?? createDefaultHost()
  const isTouchDevice = detectMobile()
  const presentation = props.presentation ?? false
  const initialEntity: Entity = props.initialEntity ?? 'calculator'

  const overrideBg = props.backgroundColor
  const overrideLocale = props.locale

  let currentBg = overrideBg ?? host.theme.backgroundColor()
  let currentLocale = overrideLocale ?? host.locale.current()

  const propsOpacity = props.initialOpacity

  let state: FlipperState = {
    rotated: initialEntity === 'calendar',
    left: 0,
    top: 0,
    opacity:
      propsOpacity !== undefined
        ? clamp(propsOpacity, MIN_OPACITY, MAX_OPACITY)
        : DEFAULT_OPACITY,
    entity: initialEntity,
  }

  let wrapper: HTMLElement | null = null
  let flipperEl: HTMLElement | null = null
  let frontHost: HTMLElement | null = null
  let backHost: HTMLElement | null = null

  let frontPanel: FlipPanel | null = null
  let backPanel: FlipPanel | null = null

  let detachDrag: (() => void) | null = null
  let unsubscribeLocale: Unsubscribe | null = null
  let unsubscribeTheme: Unsubscribe | null = null
  let persistTimer: ReturnType<typeof setTimeout> | null = null
  let uid = 0

  // Positioning

  function applyCoords(left: number, top: number): void {
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const ww = window.innerWidth
    const wh = window.innerHeight

    const clampedLeft = Math.max(0, Math.min(left, ww - rect.width))
    const clampedTop = Math.max(0, Math.min(top, wh - rect.height))

    state = { ...state, left: clampedLeft, top: clampedTop }

    wrapper.style.left = `${clampedLeft}px`
    wrapper.style.top = `${clampedTop}px`
  }

  function center(): void {
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const left = (window.innerWidth - rect.width) / 2
    const top = (window.innerHeight - rect.height) / 2

    applyCoords(left, top)
  }

  function persist(): void {
    if (presentation || isTouchDevice) return

    saveStoredPosition(host.storage, {
      left: state.left,
      top: state.top,
      rotated: state.rotated,
      opacity: state.opacity,
    })
  }

  function schedulePersist(): void {
    if (presentation || isTouchDevice) return

    if (persistTimer !== null) clearTimeout(persistTimer)

    persistTimer = setTimeout(() => {
      persistTimer = null
      persist()
    }, PERSIST_DEBOUNCE_MS)
  }

  function flushPersist(): void {
    if (persistTimer !== null) {
      clearTimeout(persistTimer)
      persistTimer = null
      persist()
    }
  }

  // Render

  function applyRotation(): void {
    if (!flipperEl) return
    flipperEl.classList.toggle('flipper__inner--rotated', state.rotated)
  }

  function applyZIndex(): void {
    if (!wrapper) return
    wrapper.style.zIndex = String(getZIndex(uid))
  }

  /**
  * Sets CSS variables on the wrapper. Panels read them through var(...).
  * The only place where the color is set at all.
   */
  function applyPanelBackground(color: string): void {
    if (!wrapper) return

    const painted = paintWithOpacity(color, state.opacity)

    wrapper.style.setProperty('--calc-bg', painted)
    wrapper.style.setProperty('--calendar-bg', painted)
  }

  function render(): void {
    applyRotation()
    applyZIndex()
    applyPanelBackground(currentBg)
  }

  // Public actions

  function flip(): void {
    state = {
      ...state,
      rotated: !state.rotated,
      entity: state.rotated ? 'calculator' : 'calendar',
    }

    render()
    persist()
  }

  function setLocale(locale: string): void {
    currentLocale = locale

    frontPanel?.setLocale?.(locale)
    backPanel?.setLocale?.(locale)
  }

  function setBackgroundColor(color: string): void {
    currentBg = color
    applyPanelBackground(color)
  }

  function setOpacity(value: number): void {
    const next = clamp(value, MIN_OPACITY, MAX_OPACITY)

    if (state.opacity === next) return

    state = { ...state, opacity: next }
    applyPanelBackground(currentBg)

    schedulePersist()
  }

  // Handlers

  function handleWheel(e: WheelEvent): void {
    e.preventDefault()

    const dy = (e.deltaY || 0) > 0 ? OPACITY_STEP : -OPACITY_STEP

    setOpacity(state.opacity + dy)
  }

  function handleResize(): void {
    if (presentation || isTouchDevice) return
    applyCoords(state.left, state.top)
  }

  // Panels

  function panelOptions(): PanelOptions {
    return {
      locale: currentLocale,
      onOff: () => props.onOff?.(),
      onFlip: () => flip(),
    }
  }

  // Build DOM

  function buildDom(): HTMLElement {
    const w = document.createElement('div')
    w.className = 'flipper'

    if (presentation) w.classList.add('flipper--presentation')

    const inner = document.createElement('div')
    inner.className = 'flipper__inner'

    const front = document.createElement('div')
    front.className = 'flipper__front'

    const back = document.createElement('div')
    back.className = 'flipper__back'

    inner.appendChild(front)
    inner.appendChild(back)
    w.appendChild(inner)

    frontHost = front
    backHost = back
    flipperEl = inner

    return w
  }

  // Host subscriptions

  function subscribeHost(): void {
    if (overrideLocale === undefined && host.locale.subscribe) {
      unsubscribeLocale = host.locale.subscribe(setLocale)
    }

    if (overrideBg === undefined && host.theme.subscribe) {
      unsubscribeTheme = host.theme.subscribe(setBackgroundColor)
    }
  }

  function unsubscribeHost(): void {
    unsubscribeLocale?.()
    unsubscribeTheme?.()

    unsubscribeLocale = null
    unsubscribeTheme = null
  }

  // Lifecycle

  function mount(container: HTMLElement): void {
    if (wrapper) {
      throw new Error('[Flipper]: already mounted')
    }

    wrapper = buildDom()
    container.appendChild(wrapper)

    uid = register()
    applyZIndex()

    const opts = panelOptions()

    frontPanel = props.createFront(opts)
    backPanel = props.createBack(opts)

    if (frontHost) frontPanel.mount(frontHost)
    if (backHost) backPanel.mount(backHost)

    if (!presentation && !isTouchDevice) {
      const stored = loadStoredPosition(host.storage)

      if (stored) {
        state = {
          ...state,
          rotated: stored.rotated ?? state.rotated,
          entity: (stored.rotated ?? state.rotated) ? 'calendar' : 'calculator',
          opacity:
            stored.opacity !== undefined
              ? clamp(stored.opacity, MIN_OPACITY, MAX_OPACITY)
              : state.opacity,
        }

        applyRotation()
        requestAnimationFrame(() => applyCoords(stored.left, stored.top))
      } else {
        requestAnimationFrame(center)
      }

      detachDrag = attachDrag(wrapper, {
        onStart: () => {
          bringToFront(uid)
          applyZIndex()
        },
        onMove: (x, y, gx, gy) => {
          applyCoords(x - gx, y - gy)
          applyZIndex()
        },
        onEnd: () => persist(),
      })
    }

    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('resize', handleResize)

    subscribeHost()

    // render() sets --calc-bg / --calendar-bg on the wrapper.
    // Panels are already mounted and read these variables through CSS.
    render()
  }

  function unmount(): void {
    flushPersist()

    wrapper?.removeEventListener('wheel', handleWheel)
    window.removeEventListener('resize', handleResize)

    unsubscribeHost()
    detachDrag?.()
    detachDrag = null

    frontPanel?.unmount()
    backPanel?.unmount()
    frontPanel = null
    backPanel = null

    wrapper?.remove()

    wrapper = null
    flipperEl = null
    frontHost = null
    backHost = null

    unregister(uid)
    uid = 0

    host.logger.info('unmounted')
  }

  return {
    get element(): HTMLElement {
      if (!wrapper) throw new Error('[Flipper]: not mounted')
      return wrapper
    },
    mount,
    unmount,
    flip,
    setLocale,
    setBackgroundColor,
    setOpacity,
    getState: () => state,
  }
}

export type {
  Entity,
  FlipperInstance,
  FlipperProps,
  FlipperState,
  FlipPanel,
  PanelOptions,
} from './types'
