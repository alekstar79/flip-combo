import { describe, it, expect } from 'vitest'
import {
  hexToRgbA,
  isHexColor,
  paintWithOpacity,
  rgbaStringify,
} from '@/utils/color'

// ---------- hexToRgbA ------------------------------------------------------

describe('hexToRgbA', () => {
  it('parses #rrggbb', () => {
    expect(hexToRgbA('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(hexToRgbA('#00ff00')).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(hexToRgbA('#0000ff')).toEqual({ r: 0, g: 0, b: 255, a: 1 })
  })

  it('parses the short #rgb form', () => {
    expect(hexToRgbA('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(hexToRgbA('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 })
  })

  it('applies alpha', () => {
    expect(hexToRgbA('#abcdef', 0.5))
      .toEqual({ r: 171, g: 205, b: 239, a: 0.5 })
  })

  it('returns black for an invalid string', () => {
    expect(hexToRgbA('not-a-hex')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(hexToRgbA('')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
  })
})

// ---------- rgbaStringify --------------------------------------------------

describe('rgbaStringify', () => {
  it('returns black for undefined', () => {
    expect(rgbaStringify(undefined)).toBe('rgba(0,0,0,1)')
  })

  it('passes through an already valid CSS string', () => {
    expect(rgbaStringify('rgba(10,20,30,0.5)')).toBe('rgba(10,20,30,0.5)')
    expect(rgbaStringify('rgb(10,20,30)')).toBe('rgb(10,20,30)')
  })

  it('returns black for an invalid string', () => {
    expect(rgbaStringify('not-a-color')).toBe('rgba(0,0,0,1)')
    expect(rgbaStringify('#abcdef')).toBe('rgba(0,0,0,1)')
  })

  it('formats an RGBA object', () => {
    expect(rgbaStringify({ r: 10, g: 20, b: 30, a: 0.5 }))
      .toBe('rgba(10,20,30,0.5)')
  })

  it('normalizes alpha > 1 (as 0..255)', () => {
    expect(rgbaStringify({ r: 0, g: 0, b: 0, a: 128 }))
      .toBe('rgba(0,0,0,0.502)')
  })

  it('preserves a = 0 (legacy bug: replaced it with 0.001)', () => {
    expect(rgbaStringify({ r: 0, g: 0, b: 0, a: 0 }))
      .toBe('rgba(0,0,0,0)')
  })

  it('clamps alpha to the [0, 1] range', () => {
    expect(rgbaStringify({ r: 0, g: 0, b: 0, a: 2 }))
      .toBe('rgba(0,0,0,0.008)')
    expect(rgbaStringify({ r: 0, g: 0, b: 0, a: -1 }))
      .toBe('rgba(0,0,0,0)')
  })

  it('does not mutate the input object', () => {
    const input = { r: 1, g: 2, b: 3, a: 0.5 }
    rgbaStringify(input)
    expect(input).toEqual({ r: 1, g: 2, b: 3, a: 0.5 })
  })
})

// ---------- isHexColor -----------------------------------------------------

describe('isHexColor', () => {
  it('recognizes #rgb', () => {
    expect(isHexColor('#abc')).toBe(true)
    expect(isHexColor('#fff')).toBe(true)
  })

  it('recognizes #rrggbb', () => {
    expect(isHexColor('#aabbcc')).toBe(true)
    expect(isHexColor('#82b1ff')).toBe(true)
  })

  it('rejects non-hex', () => {
    expect(isHexColor('rgba(0,0,0,0.5)')).toBe(false)
    expect(isHexColor('rgb(0,0,0)')).toBe(false)
    expect(isHexColor('transparent')).toBe(false)
    expect(isHexColor('var(--color)')).toBe(false)
  })

  it('rejects hex-8 (#rrggbbaa)', () => {
    expect(isHexColor('#82b1ff80')).toBe(false)
  })

  it('rejects hex without a hash', () => {
    expect(isHexColor('82b1ff')).toBe(false)
  })
})

// ---------- paintWithOpacity -----------------------------------------------

describe('paintWithOpacity', () => {
  it('converts hex to rgba with the specified alpha', () => {
    expect(paintWithOpacity('#82b1ff', 0.7))
      .toBe('rgba(130,177,255,0.7)')
  })

  it('works correctly with #000', () => {
    expect(paintWithOpacity('#000', 0.5))
      .toBe('rgba(0,0,0,0.5)')
  })

  it('leaves non-hex strings unchanged', () => {
    expect(paintWithOpacity('rgba(0,0,0,0.5)', 0.7))
      .toBe('rgba(0,0,0,0.5)')
    expect(paintWithOpacity('var(--bg)', 0.7))
      .toBe('var(--bg)')
    expect(paintWithOpacity('transparent', 0.7))
      .toBe('transparent')
  })

  it('alpha = 1 → rgba with one', () => {
    expect(paintWithOpacity('#ffffff', 1))
      .toBe('rgba(255,255,255,1)')
  })

  it('alpha = 0 → rgba with zero', () => {
    expect(paintWithOpacity('#ffffff', 0))
      .toBe('rgba(255,255,255,0)')
  })
})