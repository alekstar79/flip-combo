import type { HostEnvironment } from '@/host'

export type Entity = 'calculator' | 'calendar'

export interface FlipPanel {
  readonly element: HTMLElement
  mount(container: HTMLElement): void
  unmount(): void
  setLocale?(locale: string): void
}

export interface PanelOptions {
  readonly locale: string
  readonly onOff: () => void
  readonly onFlip: () => void
}

export interface FlipperProps {
  readonly createFront: (opts: PanelOptions) => FlipPanel
  readonly createBack: (opts: PanelOptions) => FlipPanel
  readonly host?: HostEnvironment
  readonly backgroundColor?: string
  readonly locale?: string
  readonly initialOpacity?: number
  readonly presentation?: boolean
  readonly initialEntity?: Entity
  readonly onOff?: () => void
}

export interface FlipperState {
  readonly rotated: boolean
  readonly left: number
  readonly top: number
  readonly opacity: number
  readonly entity: Entity
}

export interface FlipperInstance {
  readonly element: HTMLElement
  mount(container: HTMLElement): void
  unmount(): void
  flip(): void
  setLocale(locale: string): void
  setBackgroundColor(color: string): void
  setOpacity(value: number): void
  getState(): FlipperState
}
