import { createCalendar } from '@alekstar79/flip-combo/calendar'
import '@alekstar79/flip-combo/style.css'

const host = document.getElementById('calendar-host')

if (!host) {
  throw new Error('Element #calendar-host not found')
}

const calendar = createCalendar({
  locale: 'ru',

  // Uncomment to enable dragging with position persistence.
  // draggable: true,
  // storageKey: 'demo:calendar',

  onOff: () => console.log('[calendar] off'),
  onFlip: () => console.log('[calendar] flip')
})

calendar.mount(host)

calendar.element.style.setProperty(
  '--calendar-bg',
  'rgba(130, 177, 255, 0.7)'
)
