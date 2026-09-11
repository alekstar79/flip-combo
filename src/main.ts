import { createCalc, createCalendar, createFlipper } from '@alekstar79/flip-combo'
import '@alekstar79/flip-combo/style.css'

const root = document.getElementById('app')

if (!root) {
  throw new Error('[main]: #app element not found in index.html')
}

const flipper = createFlipper({
  createFront: (opts) =>
    createCalc({
      onOff: opts.onOff,
      onFlip: opts.onFlip,
    }),
  createBack: (opts) =>
    createCalendar({
      locale: opts.locale === 'en' ? 'en' : 'ru',
      onOff: opts.onOff,
      onFlip: opts.onFlip,
    }),
  initialEntity: 'calculator',
  backgroundColor: '#82b1ff',
  initialOpacity: 0.7,
  onOff: () => console.log('[demo] off clicked'),
})

flipper.mount(root)
