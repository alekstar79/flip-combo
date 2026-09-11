// ---------------------------------------------------------------------------
// Example: combined mode.
//
// Flipper wrapper with two panels: calculator (front) and calendar
// (back). Supports dragging, opacity changes,
// and position persistence in localStorage.
// ---------------------------------------------------------------------------

import {
  createFlipper,
  createCalc,
  createCalendar
} from '@alekstar79/flip-combo'
import '@alekstar79/flip-combo/style.css'

const host = document.getElementById('app')

if (!host) {
  throw new Error('Element #app not found')
}

const flipper = createFlipper({
  // Front panel - calculator
  createFront: (opts) =>
    createCalc({
      onOff: opts.onOff,
      onFlip: opts.onFlip
    }),

  // Back panel - calendar
  createBack: (opts) =>
    createCalendar({
      locale: opts.locale === 'en' ? 'en' : 'ru',
      onOff: opts.onOff,
      onFlip: opts.onFlip
    }),

  // Background color of both panels.
  //
  // Format - hex. Opacity is applied automatically by Flipper:
  // `state.opacity` is used (0.7 by default) and applied to the color
  // through the internal `paintWithOpacity` utility.
  //
  // Opacity can be changed:
  //   • with the mouse wheel over the panel - step 0.03;
  //   • programmatically: flipper.setOpacity(0.5) - range 0.5..1
  backgroundColor: '#82b1ff',

  // Initial panel.
  initialEntity: 'calculator',

  // Initial opacity - 0.7 (default value).
  initialOpacity: 0.7,

  // Callback when the "⏻" button on either panel is pressed
  onOff: () => console.log('[flipper] off')
})

flipper.mount(host)
