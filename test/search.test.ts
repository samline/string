import { describe, expect, it } from 'vitest'

import {
  closest,
  compareNatural,
  contains,
  distance,
  fold,
  highlight,
  similarity,
} from '../src/index.js'

describe('fold', () => {
  it('lower-cases, removes accents and maps full-width forms', () => {
    expect(fold('Ñandú ＡＢＣ Straße Æsir')).toBe('nandu abc strasse aesir')
    expect(fold('ISPARTA', { locale: 'tr' })).toBe('isparta')
    expect(fold(undefined as never)).toBe('')
  })
})

describe('contains', () => {
  it('ignores accents and case and needs every term', () => {
    expect(contains('México: Café de olla', 'CAFE')).toBe(true)
    expect(contains('México: Café de olla', 'cafe mex')).toBe(true)
    expect(contains('México: Café de olla', 'cafe té')).toBe(false)
    expect(contains('México: Café de olla', 'olla cafe', { split: false })).toBe(false)
    expect(contains('Straße', 'strasse')).toBe(true)
    expect(contains('anything', '   ')).toBe(true)
    expect(contains('İstanbul', 'istanbul', { locale: 'tr' })).toBe(true)
  })
})

describe('highlight', () => {
  it('marks pieces of the original text', () => {
    expect(highlight('Café de olla', 'cafe')).toEqual([
      { text: 'Café', match: true },
      { text: ' de olla', match: false },
    ])
    expect(highlight('Straße 42, strasse', 'STRASSE')).toEqual([
      { text: 'Straße', match: true },
      { text: ' 42, ', match: false },
      { text: 'strasse', match: true },
    ])
  })

  it('marks every term and repeated matches, keeping decomposed accents', () => {
    const decomposed = 'Café y té'
    expect(highlight(decomposed, 'café té')).toEqual([
      { text: 'Café', match: true },
      { text: ' y ', match: false },
      { text: 'té', match: true },
    ])
    expect(highlight('banana', 'an')).toEqual([
      { text: 'b', match: false },
      { text: 'anan', match: true },
      { text: 'a', match: false },
    ])
    expect(highlight('ISTANBUL', 'ıst', { locale: 'tr' })[0]).toEqual({ text: 'IST', match: true })
    expect(highlight('İstanbul', 'istanbul')).toEqual([{ text: 'İstanbul', match: true }])
  })

  it('handles empty text and queries', () => {
    expect(highlight('', 'a')).toEqual([])
    expect(highlight('abc', ' ')).toEqual([{ text: 'abc', match: false }])
    expect(highlight('abc', 'x')).toEqual([{ text: 'abc', match: false }])
  })
})

describe('compareNatural', () => {
  it('sorts numbers by value and ignores accents and case', () => {
    expect(['file10', 'file2', 'File1'].sort(compareNatural)).toEqual(['File1', 'file2', 'file10'])
    expect(['zeta', 'Árbol', 'avión'].sort(compareNatural)).toEqual(['Árbol', 'avión', 'zeta'])
    expect(compareNatural('a', 'á')).toBe(0)
    expect(compareNatural('a', 'á', { sensitivity: 'accent' })).toBeLessThan(0)
    expect(compareNatural('ä', 'z', { locale: 'sv' })).toBeGreaterThan(0)
    expect(compareNatural(undefined as never, 'a')).toBeLessThan(0)
  })
})

describe('distance and similarity', () => {
  it('counts edits in code points', () => {
    expect(distance('kitten', 'sitting')).toBe(3)
    expect(distance('', 'abc')).toBe(3)
    expect(distance('abc', '')).toBe(3)
    expect(distance('😀a', '😀b')).toBe(1)
    expect(distance(undefined as never, undefined as never)).toBe(0)
  })

  it('scores from 0 to 1, folding by default', () => {
    expect(similarity('Mexico', 'México')).toBe(1)
    expect(similarity('Mexico', 'México', { fold: false })).toBeCloseTo(5 / 6)
    expect(similarity('', '')).toBe(1)
    expect(similarity('abc', 'xyz')).toBe(0)
    expect(similarity('ISTANBUL', 'ıstanbul', { locale: 'tr' })).toBe(1)
  })

  it('finds the closest candidate above a threshold', () => {
    expect(closest('mexcio', ['Chile', 'México', 'Perú'])).toBe('México')
    expect(closest('xyz', ['Chile', 'México'])).toBeUndefined()
    expect(closest('chil', new Set(['Chile', 'China']), { threshold: 0.7 })).toBe('Chile')
    expect(closest('a', [])).toBeUndefined()
  })
})
