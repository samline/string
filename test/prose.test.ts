import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  closest,
  escapeHtml,
  graphemes,
  initials,
  pluralize,
  readingTime,
  stripTags,
  template,
  titleCase,
  truncate,
  unescapeHtml,
  wordCount,
  words,
} from '../src/index.js'

const family = '👨‍👩‍👧'

describe('graphemes', () => {
  it('keeps emoji sequences, flags and combining accents whole', () => {
    expect(graphemes(`${family}🇲🇽éa`)).toEqual([family, '🇲🇽', 'é', 'a'])
    expect(graphemes(undefined as never)).toEqual([])
  })

  it('truncates and builds initials by grapheme', () => {
    expect(truncate(`${family}${family}${family}`, 2, { ellipsis: '' })).toBe(`${family}${family}`)
    expect(truncate(`${family}${family}${family}`, 2)).toBe(`${family}…`)
    expect(truncate('🇲🇽🇨🇴🇦🇷🇪🇸', 3, { position: 'middle' })).toBe('🇲🇽…🇪🇸')
    expect(initials('élodie dupont')).toBe('ÉD')
  })
})

describe('decomposed accents in words', () => {
  it('keeps combining marks inside their word', () => {
    expect(words('caféNoir')).toEqual(['café', 'Noir'])
    expect(titleCase('élan vital')).toBe('Élan Vital')
  })
})

describe('wordCount and readingTime', () => {
  it('counts words, ignoring punctuation', () => {
    expect(wordCount("¡Hola, mundo! It's 2026.")).toBe(4)
    expect(wordCount('我喜欢读书', { locale: 'zh' })).toBeGreaterThan(1)
    expect(wordCount('')).toBe(0)
    expect(wordCount(undefined as never)).toBe(0)
  })

  it('rounds reading time up', () => {
    expect(readingTime('word '.repeat(450))).toEqual({ words: 450, minutes: 3 })
    expect(readingTime('one two')).toEqual({ words: 2, minutes: 1 })
    expect(readingTime('')).toEqual({ words: 0, minutes: 0 })
    expect(readingTime('word '.repeat(300), { wordsPerMinute: 100 }).minutes).toBe(3)
    expect(readingTime('word '.repeat(300), { wordsPerMinute: 0 }).minutes).toBe(2)
  })
})

describe('without Intl.Segmenter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('falls back to code points and a word pattern', async () => {
    vi.stubGlobal('Intl', { ...Intl, Segmenter: undefined })
    vi.resetModules()
    const fallback = await import('../src/index.js')
    expect(fallback.graphemes('ab😀')).toEqual(['a', 'b', '😀'])
    expect(fallback.wordCount("¡Hola, mundo! It's 2026.")).toBe(4)
  })
})

describe('pluralize', () => {
  it('picks the plural form per language and formats the count', () => {
    const files = { one: '# file', other: '# files' }
    expect(pluralize(1, files)).toBe('1 file')
    expect(pluralize(1234, files, { locale: 'en' })).toBe('1,234 files')
    expect(pluralize(1234, files, { locale: 'de' })).toBe('1.234 files')
    expect(pluralize(0, { zero: 'No files', ...files })).toBe('No files')
    expect(pluralize(0, files)).toBe('0 files')
    const polish = { one: '# plik', few: '# pliki', many: '# plików', other: '# pliku' }
    expect([1, 3, 5, 1.5].map(n => pluralize(n, polish, { locale: 'pl' }))).toEqual([
      '1 plik',
      '3 pliki',
      '5 plików',
      '1,5 pliku',
    ])
  })

  it('supports ordinals and falls back to other', () => {
    const ordinal = { one: '#st', two: '#nd', few: '#rd', other: '#th' }
    expect([1, 2, 3, 4, 11, 22].map(n => pluralize(n, ordinal, { ordinal: true }))).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '22nd',
    ])
    expect(pluralize(2, { other: '# things' })).toBe('2 things')
  })
})

describe('template', () => {
  it('fills placeholders and nested paths', () => {
    expect(
      template('Hola {user.name}, tienes { count } mensajes', { user: { name: 'Ana' }, count: 3 })
    ).toBe('Hola Ana, tienes 3 mensajes')
    expect(template('{a} {b}', { a: 0, b: false })).toBe('0 false')
  })

  it('keeps or replaces missing values and escapes braces', () => {
    expect(template('{name} {toString} {a.b.c}', { a: { b: null } })).toBe(
      '{name} {toString} {a.b.c}'
    )
    expect(template('{name}', {}, { missing: '—' })).toBe('—')
    expect(template('{name}', {}, { missing: key => `[${key}]` })).toBe('[name]')
    expect(template('{{name}} {}', { name: 'x' })).toBe('{name} {}')
    expect(template(undefined as never, {})).toBe('')
  })
})

describe('HTML helpers', () => {
  it('escapes and unescapes', () => {
    expect(escapeHtml(`<a href="x">O'Neil & co</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;O&#39;Neil &amp; co&lt;/a&gt;'
    )
    expect(unescapeHtml('&lt;b&gt; &#39; &#X27; &#x1F600; &AMP; &hellip;')).toBe(`<b> ' ' 😀 & …`)
    expect(unescapeHtml('&bogus; &#xD800; &#0; &#99999999;')).toBe(
      '&bogus; &#xD800; &#0; &#99999999;'
    )
    expect(unescapeHtml(escapeHtml(`<"&'>`))).toBe(`<"&'>`)
    expect(escapeHtml(undefined as never)).toBe('')
    expect(unescapeHtml(undefined as never)).toBe('')
  })

  it('strips tags into plain text', () => {
    expect(
      stripTags(
        '<h1>Título</h1><p>Hola&nbsp;<b>mundo</b></p><!-- note --><script>alert("<p>")</script><style>p{}</style><ul><li>Uno</li><li>Dos</li></ul>'
      )
    ).toBe('Título Hola mundo Uno Dos')
    expect(stripTags('a<br>b<br/>c')).toBe('a b c')
    expect(stripTags(undefined as never)).toBe('')
  })
})

describe('closest with partial matches', () => {
  const drinks = ['Café de olla', 'Té verde', 'Horchata de arroz', 'Jamaica con limón']

  it('compares with word starts of longer candidates', () => {
    expect(closest('horchatta', drinks)).toBe('Horchata de arroz')
    expect(closest('limon', drinks)).toBe('Jamaica con limón')
    expect(closest('horchatta', drinks, { partial: false })).toBeUndefined()
    expect(closest('ab', drinks)).toBeUndefined()
    expect(closest('chile', ['Chile de árbol', 'Chile'])).toBe('Chile')
    expect(closest('Arroz', ['ARROZ blanco'], { fold: false, threshold: 0.9 })).toBeUndefined()
  })
})
