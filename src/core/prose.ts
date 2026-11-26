import { segmenter } from './graphemes.js'

export interface WordCountOptions {
  /** Locale for word boundaries, which matters for Chinese, Japanese or Thai. */
  locale?: string | string[]
}

/**
 * Count the words people read, with `Intl.Segmenter` when available, so
 * punctuation is ignored and Chinese or Japanese text is split correctly:
 * `wordCount('Hello, world! It's 2026.')` → `4`.
 */
export const wordCount = (input: string, { locale }: WordCountOptions = {}): number => {
  const text = String(input ?? '')
  const instance = segmenter('word', locale)
  if (!instance) return text.split(/[^\p{L}\p{M}\p{N}'’]+/u).filter(Boolean).length
  let count = 0
  for (const part of instance.segment(text)) if (part.isWordLike) count++
  return count
}

export interface ReadingTimeOptions extends WordCountOptions {
  /** Reading speed. Defaults to `200` words per minute. */
  wordsPerMinute?: number
}

export interface ReadingTime {
  words: number
  /** Whole minutes, rounded up; `1` for any text with words, `0` for none. */
  minutes: number
}

/** `readingTime(article)` → `{ words: 1240, minutes: 7 }`. */
export const readingTime = (
  input: string,
  { wordsPerMinute = 200, ...options }: ReadingTimeOptions = {}
): ReadingTime => {
  const words = wordCount(input, options)
  const speed = Number.isFinite(wordsPerMinute) && wordsPerMinute > 0 ? wordsPerMinute : 200
  return { words, minutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / speed)) }
}

/** Plural forms by `Intl.PluralRules` category; `other` is required. */
export interface PluralForms {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

export interface PluralizeOptions {
  /** Locale for the plural rules and the number format. */
  locale?: string | string[]
  /** Use ordinal rules: `1st`, `2nd`, `3rd`, `4th`. Defaults to `false`. */
  ordinal?: boolean
}

const pluralRules = new Map<string, Intl.PluralRules>()
const numberFormats = new Map<string, Intl.NumberFormat>()
const keyOf = (locale?: string | string[]) =>
  locale === undefined ? '' : [locale].flat().join(',')

/**
 * Pick the right plural form for any language and put the formatted count
 * where `#` is: `pluralize(1234, { one: '# file', other: '# files' })` →
 * `'1,234 files'`. `zero` is used for `0` when you give it, in any language.
 */
export const pluralize = (
  count: number,
  forms: PluralForms,
  { locale, ordinal = false }: PluralizeOptions = {}
): string => {
  const key = keyOf(locale)
  const rulesKey = `${key}|${ordinal}`
  let rules = pluralRules.get(rulesKey)
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type: ordinal ? 'ordinal' : 'cardinal' })
    pluralRules.set(rulesKey, rules)
  }
  let format = numberFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat(locale)
    numberFormats.set(key, format)
  }
  const category = rules.select(count) as keyof PluralForms
  const form = (count === 0 && forms.zero) || forms[category] || forms.other
  return form.replace(/#/g, format.format(count))
}

export interface TemplateOptions {
  /**
   * What to put where a value is missing (`undefined` or `null`): a string,
   * or a function of the key. Defaults to keeping the placeholder as it is.
   */
  missing?: string | ((key: string) => string)
}

/**
 * Fill `{placeholders}` with values, including nested paths:
 * `template('Hi {user.name}, you have {count}', { user: { name: 'Ana' }, count: 3 })`
 * → `'Hi Ana, you have 3'`. Write `{{` and `}}` for literal braces.
 */
export const template = (
  input: string,
  values: Readonly<Record<string, unknown>>,
  { missing }: TemplateOptions = {}
): string =>
  String(input ?? '').replace(
    /\{\{|\}\}|\{\s*([^{}\s]+)\s*\}/g,
    (match: string, path: string | undefined) => {
      if (path === undefined) return match[0]!
      let value: unknown = values
      for (const key of path.split('.')) {
        value =
          value !== null &&
          typeof value === 'object' &&
          Object.prototype.hasOwnProperty.call(value, key)
            ? (value as Record<string, unknown>)[key]
            : undefined
      }
      if (value !== undefined && value !== null) return String(value)
      if (missing === undefined) return match
      return typeof missing === 'function' ? missing(path) : missing
    }
  )
