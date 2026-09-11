import type { CalendarInstance, CalendarProps, CalendarState, DayCell, Locale } from './types'

import { makeDraggable, type DraggableInstance } from '@/utils/draggable'

import { buildMonthDays } from './month-days'
import { getMonthNames, getWeekDays } from './locales'

import './styles.scss'

/** Converts an arbitrary string to a supported locale. */
function normalizeLocale(raw: string | undefined): Locale {
  return raw === 'en' ? 'en' : 'ru'
}

/** Number of decorative `<span>` elements inside a day cell (hover animation). */
const DECOR_SPANS = 4

function createDecorSpans(): HTMLSpanElement[] {
  return Array.from({ length: DECOR_SPANS }, () => document.createElement('span'))
}

// Factory

export function createCalendar(props: CalendarProps = {}): CalendarInstance {
  const initialDate = props.initialDate ?? new Date()
  const initialLocale: Locale = normalizeLocale(props.locale)

  let state: CalendarState = {
    year: initialDate.getFullYear(),
    month: initialDate.getMonth(),
    showMonthList: false,
    locale: initialLocale,
  }

  // DOM references

  let element: HTMLElement | null = null
  let innerEl: HTMLElement | null = null
  let monthPickerEl: HTMLElement | null = null
  let yearValueEl: HTMLElement | null = null
  let weekDaysEl: HTMLElement | null = null
  let daysEl: HTMLElement | null = null
  let monthListEl: HTMLElement | null = null

  let draggable: DraggableInstance | null = null

  // Render

  function renderHeader(): void {
    if (!monthPickerEl || !yearValueEl) return

    const months = getMonthNames(state.locale)

    monthPickerEl.textContent = months[state.month] ?? ''
    yearValueEl.textContent = String(state.year)
  }

  function renderWeekDays(): void {
    const container = weekDaysEl
    if (!container) return

    container.replaceChildren()

    for (const wd of getWeekDays(state.locale)) {
      const cell = document.createElement('div')
      cell.className = 'calendar__week-day'
      cell.textContent = wd
      container.appendChild(cell)
    }
  }

  function renderDays(): void {
    const container = daysEl
    if (!container) return

    container.replaceChildren()

    const cells: readonly DayCell[] = buildMonthDays(
      state.year,
      state.month,
      state.locale,
    )

    for (const cell of cells) {
      const dayEl = document.createElement('div')
      dayEl.className = 'calendar__day'

      if (cell.day === null) {
        dayEl.classList.add('calendar__day--empty')
        container.appendChild(dayEl)
        continue
      }

      if (cell.isToday) {
        dayEl.classList.add('calendar__day--today')
      }

      dayEl.textContent = String(cell.day)

      if (!cell.isToday) {
        for (const span of createDecorSpans()) {
          dayEl.appendChild(span)
        }
      }

      container.appendChild(dayEl)
    }
  }

  function renderMonthList(): void {
    const container = monthListEl
    if (!container) return

    container.replaceChildren()

    const months = getMonthNames(state.locale)

    months.forEach((name, idx) => {
      const wrapper = document.createElement('div')
      const item = document.createElement('div')

      item.className = 'calendar__month-list-item'
      item.dataset.month = String(idx)
      item.textContent = name

      wrapper.appendChild(item)
      container.appendChild(wrapper)
    })
  }

  function render(): void {
    renderHeader()
    renderWeekDays()
    renderDays()
    renderMonthList()

    if (element) {
      element.classList.toggle('calendar--month-list-open', state.showMonthList)
    }
    if (monthListEl) {
      monthListEl.classList.toggle(
        'calendar__month-list--visible',
        state.showMonthList,
      )
    }
  }

  // Handlers

  function handleClick(event: MouseEvent): void {
    const target = event.target
    if (!(target instanceof Element)) return

    const footerBtn = target.closest<HTMLElement>('.calendar__footer-button')
    if (footerBtn) {
      const action = footerBtn.dataset.action
      if (action === 'off') {
        props.onOff?.()
      } else if (action === 'flip') {
        props.onFlip?.()
      }
      return
    }

    if (target.closest('.calendar__month-picker')) {
      state = { ...state, showMonthList: true }
      render()
      return
    }

    const yearBtn = target.closest<HTMLElement>('.calendar__year-change')
    if (yearBtn) {
      const dir = yearBtn.dataset.dir
      state = {
        ...state,
        year: dir === 'prev' ? state.year - 1 : state.year + 1,
      }
      render()
      return
    }

    const monthItem = target.closest<HTMLElement>('.calendar__month-list-item')
    if (monthItem) {
      const idx = Number(monthItem.dataset.month)
      if (Number.isFinite(idx)) {
        state = { ...state, month: idx, showMonthList: false }
        render()
      }
      return
    }
  }

  // Public actions

  function setLocale(rawLocale: string): void {
    const locale = normalizeLocale(rawLocale)
    if (state.locale === locale) return

    state = { ...state, locale }
    render()
  }

  // Create markup

  function buildHeader(): HTMLElement {
    const header = document.createElement('div')
    header.className = 'calendar__header'

    const picker = document.createElement('span')
    picker.className = 'calendar__month-picker'

    const yearPicker = document.createElement('div')
    yearPicker.className = 'calendar__year-picker'

    const prev = document.createElement('span')
    prev.className = 'calendar__year-change'
    prev.dataset.dir = 'prev'
    prev.textContent = '<'

    const value = document.createElement('span')
    value.className = 'calendar__year-value'

    const next = document.createElement('span')
    next.className = 'calendar__year-change'
    next.dataset.dir = 'next'
    next.textContent = '>'

    yearPicker.appendChild(prev)
    yearPicker.appendChild(value)
    yearPicker.appendChild(next)

    header.appendChild(picker)
    header.appendChild(yearPicker)

    monthPickerEl = picker
    yearValueEl = value

    return header
  }

  function buildBody(): HTMLElement {
    const body = document.createElement('div')
    body.className = 'calendar__body'

    const weekDays = document.createElement('div')
    weekDays.className = 'calendar__week-days'

    const days = document.createElement('div')
    days.className = 'calendar__days'

    body.appendChild(weekDays)
    body.appendChild(days)

    weekDaysEl = weekDays
    daysEl = days

    return body
  }

  function buildFooter(): HTMLElement {
    const footer = document.createElement('div')
    footer.className = 'calendar__footer'

    const offBtn = document.createElement('button')
    offBtn.type = 'button'
    offBtn.className = 'calendar__footer-button'
    offBtn.dataset.action = 'off'
    offBtn.textContent = '⏻'

    const flipBtn = document.createElement('button')
    flipBtn.type = 'button'
    flipBtn.className = 'calendar__footer-button'
    flipBtn.dataset.action = 'flip'
    flipBtn.textContent = '⇄'

    footer.appendChild(offBtn)
    footer.appendChild(flipBtn)

    return footer
  }

  function buildMonthList(): HTMLElement {
    const list = document.createElement('div')
    list.className = 'calendar__month-list'
    monthListEl = list
    return list
  }

  function buildInner(): HTMLElement {
    const root = document.createElement('div')
    root.className = 'calendar'

    root.appendChild(buildHeader())
    root.appendChild(buildBody())
    root.appendChild(buildFooter())
    root.appendChild(buildMonthList())

    return root
  }

  // Lifecycle

  function mount(container: HTMLElement): void {
    if (element) {
      throw new Error('[Calendar]: already mounted')
    }

    innerEl = buildInner()

    if (props.draggable) {
      // Panel inside a floating container - move the container.
      element = document.createElement('div')
      element.className = 'calendar-floating'
      element.style.position = 'fixed'
      element.style.zIndex = '7'
      element.style.width = '320px'
      element.style.height = '345px'
      element.appendChild(innerEl)

      draggable = makeDraggable(element, {
        storageKey: props.storageKey ?? 'flip-combo:calendar',
      })
    } else {
      element = innerEl
    }

    container.appendChild(element)

    element.addEventListener('click', handleClick)

    render()
  }

  function unmount(): void {
    draggable?.destroy()
    draggable = null

    element?.removeEventListener('click', handleClick)
    element?.remove()

    element = null
    innerEl = null
    monthPickerEl = null
    yearValueEl = null
    weekDaysEl = null
    daysEl = null
    monthListEl = null
  }

  return {
    get element(): HTMLElement {
      if (!element) throw new Error('[Calendar]: not mounted')
      return element
    },
    mount,
    unmount,
    setLocale,
    getState: () => state
  }
}

export type {
  CalendarInstance,
  CalendarProps,
  CalendarState,
  DayCell,
  Locale,
} from './types'
