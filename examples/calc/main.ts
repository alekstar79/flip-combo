// ---------------------------------------------------------------------------
// Example: calculator only.
//
// Two modes:
//   1. draggable: false - static panel inside the container.
//   2. draggable: true - panel can be dragged and remembers its position.
//
// Default - false
// ---------------------------------------------------------------------------

import { createCalc } from '@alekstar79/flip-combo/calc'
import '@alekstar79/flip-combo/style.css'

const host = document.getElementById('calc-host')

if (!host) {
  throw new Error('Element #calc-host not found')
}

// The background color is set through a CSS variable. With draggable: true
// the variable must be on the panel itself, not on the host, so
// we set it directly on the root.
const calc = createCalc({
  // Uncomment to enable dragging with position persistence.
  // draggable: true,
  // storageKey: 'demo:calc',

  onOff: () => console.log('[calc] off'),
  onFlip: () => console.log('[calc] flip'),
  onCopy: (text) => console.log('[calc] copy:', text)
})

calc.mount(host)

// Set the background color after mount (we already have the root element).
calc.element.style.setProperty('--calc-bg', 'rgba(130, 177, 255, 0.7)')
