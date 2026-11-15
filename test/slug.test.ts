import { afterEach, describe, expect, it } from 'vitest'

import {
  CHAR_MAPS,
  convert,
  CYRILLIC,
  GERMAN,
  GREEK,
  removeAccents,
  slugify,
  uniqueSlug,
} from '../src/index.js'
import { string } from '../src/vanilla/index.js'

describe('character maps', () => {
  it('transliterate Cyrillic, Greek and German, upper case included', () => {
    expect(removeAccents('Щука Ёлка Йошкар-Ола Київ', { charMap: CYRILLIC })).toBe(
      'Shchuka Yolka Yoshkar-Ola Kiyiv'
    )
    expect(removeAccents('Αθήνα Ψάρι ΣΟΦΙΑ', { charMap: GREEK })).toBe('Athina Psari SOFIA')
    expect(removeAccents('Müller ÄRGER', { charMap: GERMAN })).toBe('Mueller AeRGER')
    expect(CHAR_MAPS.cyrillic).toBe(CYRILLIC)
  })

  it('accepts custom maps with longer keys first and ignores empty ones', () => {
    expect(removeAccents('a.b ... c', { charMap: { '.': ' dot ', '...': ' etc ' } })).toBe(
      'a dot b  etc  c'
    )
    expect(removeAccents('Ñandú', { charMap: {} })).toBe('Nandu')
    expect(removeAccents('Ñandú', { charMap: { '': 'x' } })).toBe('Nandu')
  })
})

describe('slugify additions', () => {
  it('uses char maps and preserved characters', () => {
    expect(slugify('Москва 2026', { charMap: CYRILLIC })).toBe('moskva-2026')
    expect(slugify('Москва')).toBe('')
    expect(slugify('Müller & Söhne', { charMap: GERMAN, replacements: { '&': 'und' } })).toBe(
      'mueller-und-soehne'
    )
    expect(slugify('Release v1.2_beta [final]', { preserve: '._' })).toBe('release-v1.2_beta-final')
    expect(slugify('a]b^c-d\\e', { preserve: ']^\\', separator: '_' })).toBe('a]b^c_d\\e')
  })

  it('accepts replacement pairs with patterns', () => {
    expect(
      slugify('C++ & C# devs', {
        replacements: [
          [/c\+\+/gi, 'cpp'],
          [/c#/gi, 'csharp'],
          ['&', 'and'],
        ],
      })
    ).toBe('cpp-and-csharp-devs')
  })
})

describe('uniqueSlug', () => {
  it('appends the first free number', () => {
    expect(uniqueSlug('Hola', [])).toBe('hola')
    expect(uniqueSlug('Hola', ['hola', 'hola-2'])).toBe('hola-3')
    expect(uniqueSlug('Hola', new Set(['hola']), { separator: '_', start: 10 })).toBe('hola_10')
    expect(uniqueSlug('Hola', ['hola'], { start: Number.NaN })).toBe('hola-2')
    expect(uniqueSlug('Hola', slug => slug !== 'hola-5')).toBe('hola-5')
    expect(uniqueSlug('Hola', ['hola'], { separator: '' })).toBe('hola2')
  })

  it('keeps the number inside maxLength and handles empty slugs', () => {
    expect(uniqueSlug('the quick brown', ['the-quick'], { maxLength: 9 })).toBe('the-qui-2')
    expect(uniqueSlug('the quick', ['the'], { maxLength: 6 })).toBe('the-2')
    expect(uniqueSlug('!!', [])).toBe('2')
    expect(uniqueSlug('!!', ['2'])).toBe('3')
  })

  it('stops when every slug is taken', () => {
    expect(() => uniqueSlug('a', () => true)).toThrow(RangeError)
  })

  it('runs through convert with taken and char maps', () => {
    expect(convert('Hola', 'slug', { taken: ['hola'] })).toBe('hola-2')
    expect(convert('Щи', 'accents', { charMap: CYRILLIC })).toBe('Shchi')
    expect(convert('Щи', 'accents')).toBe('Щи'.normalize('NFKD').replace(/\p{M}/gu, ''))
  })
})

describe('slug attributes', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('reads taken, transliterate and preserve', () => {
    document.body.innerHTML = `
      <input id="title" value="Москва & Αθήνα" />
      <input id="slug" data-string="slug" data-string-source="#title"
        data-string-transliterate="cyrillic, greek, nope" data-string-taken='["moskva-athina"]' />
      <p id="list" data-string="slug" data-string-taken="hola hola-2">Hola</p>
      <p id="bad" data-string="slug" data-string-taken='{"a":1}'>Hola</p>
      <p id="dot" data-string="slug" data-string-preserve=".">v1.2 notes</p>
      <p id="none" data-string="slug" data-string-transliterate="klingon">Щи</p>`
    string()
    const slug = document.querySelector<HTMLInputElement>('#slug')!
    expect(slug.value).toBe('moskva-athina-2')
    expect(document.querySelector('#list')!.textContent).toBe('hola-3')
    expect(document.querySelector('#bad')!.textContent).toBe('hola')
    expect(document.querySelector('#dot')!.textContent).toBe('v1.2-notes')
    expect(document.querySelector('#none')!.textContent).toBe('')

    // Typing does not jump to a free slug; blur does.
    slug.value = 'moskva-athina'
    slug.dispatchEvent(new Event('input'))
    expect(slug.value).toBe('moskva-athina')
    slug.dispatchEvent(new Event('blur'))
    expect(slug.value).toBe('moskva-athina-2')
  })
})
