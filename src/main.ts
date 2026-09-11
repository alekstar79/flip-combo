// import { createFlipper } from '@/flipper'
// import { createCalendar } from '@/calendar'
// import { createCalc } from '@/calc'
//
// import '@/styles/global.scss'
//
// const root = document.getElementById('app')
//
// if (!root) {
//   throw new Error('[main]: #app element not found in index.html')
// }
//
// root.textContent = ''
//
// const flipper = createFlipper({
//   createFront: (opts) =>
//     createCalc({
//       onOff: opts.onOff,
//       onFlip: opts.onFlip,
//     }),
//   createBack: (opts) =>
//     createCalendar({
//       locale: opts.locale === 'en' ? 'en' : 'ru',
//       onOff: opts.onOff,
//       onFlip: opts.onFlip,
//     }),
//   initialEntity: 'calculator',
//   backgroundColor: '#82b1ff',
//   onOff: () => console.log('[app] off clicked'),
// })
//
// flipper.mount(root)

import '@alekstar79/flip-combo/style.css'
import {
  createCalc,
  createCalendar,
  createFlipper,
} from '@alekstar79/flip-combo'

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

// Expose for console testing:
//   flipper.flip()
//   flipper.setOpacity(0.5)
//   flipper.setLocale('en')
;(window as unknown as { flipper: typeof flipper }).flipper = flipper
