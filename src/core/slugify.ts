import { removeAccents } from './accents.js'

export type Replacements =
  Readonly<Record<string, string>> | ReadonlyArray<readonly [string | RegExp, string]>

export interface SlugifyOptions {
  /** Word separator. Defaults to `'-'`. */
  separator?: string
  /** Lower-case the result. Defaults to `true`. */
  lower?: boolean
  /**
   * Replacements applied before anything else, for example
   * `{ '&': 'y', '%': 'por ciento' }`. Object keys are matched literally; for
   * patterns pass pairs: `[[/\bC\+\+/g, 'cpp'], ['&', 'and']]` (use the `g` flag
   * to replace every match).
   */
  replacements?: Replacements
  /**
   * Extra transliteration, for example `CYRILLIC`, `GREEK`, `GERMAN` or your
   * own `{ ä: 'ae' }`. See `removeAccents`.
   */
  charMap?: Readonly<Record<string, string>>
  /** Characters kept as they are, for example `'.'` for `v1.2` or `'_'`. */
  preserve?: string
  /** Maximum length; cuts at a separator when possible. */
  maxLength?: number
  /**
   * Remove leading and trailing separators. Defaults to `true`. Use `false`
   * while the user is typing, so a trailing space can become a separator.
   */
  trim?: boolean
  /** Locale for lower-casing. */
  locale?: string | string[]
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * `¡Hola, Ñandú & Café!` → `hola-nandu-cafe`
 *
 * Removes accents, transliterates common letters (ß, æ, ø, œ, ł…), keeps
 * only ASCII letters and digits, and collapses everything else into one
 * separator.
 */
export const slugify = (
  input: string,
  {
    separator = '-',
    lower = true,
    replacements = {},
    maxLength,
    trim = true,
    locale,
    charMap,
    preserve = '',
  }: SlugifyOptions = {}
): string => {
  let value = String(input ?? '')
  const pairs = Array.isArray(replacements)
    ? (replacements as ReadonlyArray<readonly [string | RegExp, string]>)
    : Object.entries(replacements)
  for (const [from, to] of pairs) {
    value =
      typeof from === 'string' ? value.split(from).join(` ${to} `) : value.replace(from, ` ${to} `)
  }
  // Lower-case first: some locales produce letters (Turkish ı) that removeAccents transliterates.
  if (lower) value = value.toLocaleLowerCase(locale)
  value = removeAccents(value, charMap ? { charMap } : {})

  const sep = escape(separator)
  const kept = preserve.replace(/[\]\\^-]/g, '\\$&')
  value = value.replace(new RegExp(`[^A-Za-z0-9${kept}]+`, 'g'), separator)
  if (separator) value = value.replace(new RegExp(`(?:${sep}){2,}`, 'g'), separator)
  if (trim && separator) value = value.replace(new RegExp(`^(?:${sep})+|(?:${sep})+$`, 'g'), '')
  else if (separator) value = value.replace(new RegExp(`^(?:${sep})+`), '')

  if (
    maxLength !== undefined &&
    Number.isFinite(maxLength) &&
    maxLength >= 0 &&
    value.length > maxLength
  ) {
    const cut = value.slice(0, maxLength)
    const boundary = separator ? cut.lastIndexOf(separator) : -1
    value = boundary > 0 && value[maxLength] !== separator ? cut.slice(0, boundary) : cut
    if (separator) value = value.replace(new RegExp(`(?:${sep})+$`), '')
  }
  return value
}

export interface UniqueSlugOptions extends SlugifyOptions {
  /** First number tried. Defaults to `2`, so the second "Hola" becomes `hola-2`. */
  start?: number
}

/** Slugs already in use: a list, a `Set`, or a function that answers for one slug. */
export type TakenSlugs = Iterable<string> | ((slug: string) => boolean)

const LIMIT = 100_000

/**
 * A slug that is not `taken`: `uniqueSlug('Hola', ['hola', 'hola-2'])` →
 * `'hola-3'`. The number is joined with the separator, and with `maxLength`
 * the base is shortened so the number always fits.
 *
 * When editing a record, leave its own current slug out of `taken`.
 */
export const uniqueSlug = (
  input: string,
  taken: TakenSlugs,
  { start = 2, ...options }: UniqueSlugOptions = {}
): string => {
  const base = slugify(input, options)
  let isTaken: (slug: string) => boolean
  if (typeof taken === 'function') isTaken = taken
  else {
    const set = new Set(taken)
    isTaken = slug => set.has(slug)
  }
  if (base && !isTaken(base)) return base

  const separator = options.separator ?? '-'
  const { maxLength } = options
  const first = Number.isFinite(start) ? Math.floor(start) : 2
  for (let n = first; n < first + LIMIT; n++) {
    const suffix = base ? `${separator}${n}` : String(n)
    let head = base
    if (maxLength !== undefined && maxLength >= 0 && head.length + suffix.length > maxLength) {
      head = head.slice(0, Math.max(0, maxLength - suffix.length))
      if (separator) while (head.endsWith(separator)) head = head.slice(0, -separator.length)
    }
    const candidate = head ? head + suffix : String(n)
    if (!isTaken(candidate)) return candidate
  }
  throw new RangeError(`uniqueSlug: no free slug for "${base}" after ${LIMIT} tries`)
}
