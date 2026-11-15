import { removeAccents } from './accents.js'

export interface FoldOptions {
  /** Locale for lower-casing, for example `'tr'` so `I` folds like `ı`. */
  locale?: string | string[]
}

/**
 * Fold text for comparison: lower case, no accents, common letters
 * transliterated and full-width forms mapped to ASCII.
 * `Ñandú ＡＢＣ Straße` → `nandu abc strasse`.
 */
export const fold = (input: string, { locale }: FoldOptions = {}): string =>
  removeAccents(String(input ?? '').toLocaleLowerCase(locale))

export interface MatchOptions extends FoldOptions {
  /**
   * Treat every word of the query as its own term. Defaults to `true`:
   * `'cafe mex'` matches `México: Café de olla`. `false` matches the query
   * as one phrase.
   */
  split?: boolean
}

const termsOf = (query: string, { locale, split = true }: MatchOptions): string[] => {
  const folded = fold(query, locale === undefined ? {} : { locale }).trim()
  if (!folded) return []
  return split ? Array.from(new Set(folded.split(/\s+/u))) : [folded]
}

/**
 * Accent- and case-insensitive search: `contains('Café de olla', 'CAFE')` is
 * `true`. Every term must appear; an empty query matches everything.
 */
export const contains = (input: string, query: string, options: MatchOptions = {}): boolean => {
  const terms = termsOf(query, options)
  if (terms.length === 0) return true
  const text = fold(input, options.locale === undefined ? {} : { locale: options.locale })
  return terms.every(term => text.includes(term))
}

const ASCII = /^[\u0000-\u007f]*$/

export interface HighlightSegment {
  /** A piece of the original text, unchanged. */
  text: string
  /** True when the piece matches the query. */
  match: boolean
}

/**
 * Split text into matching and non-matching pieces of the original text, for
 * highlighting search results without building HTML strings:
 * `highlight('Café de olla', 'cafe')` →
 * `[{ text: 'Café', match: true }, { text: ' de olla', match: false }]`.
 *
 * Matching ignores accents and case, like `contains`; terms do not need to
 * all appear.
 */
export const highlight = (
  input: string,
  query: string,
  options: MatchOptions = {}
): HighlightSegment[] => {
  const chars = Array.from(String(input ?? ''))
  if (chars.length === 0) return []
  const terms = termsOf(query, options)
  if (terms.length === 0) return [{ text: chars.join(''), match: false }]

  // Fold each character on its own and remember which character produced
  // each folded unit, so matches map back onto the original text.
  const locale = options.locale
  let folded = ''
  const owner: number[] = []
  const empty = new Set<number>()
  chars.forEach((char, index) => {
    // ASCII fast path, unless the locale lower-cases into another script (tr: I → ı).
    const lower = char.toLocaleLowerCase(locale)
    const piece = ASCII.test(lower) ? lower : removeAccents(lower)
    folded += piece
    if (piece === '') empty.add(index)
    for (let unit = 0; unit < piece.length; unit++) owner.push(index)
  })

  const marked = new Array<boolean>(chars.length).fill(false)
  for (const term of terms) {
    for (let at = folded.indexOf(term); at !== -1; at = folded.indexOf(term, at + term.length)) {
      for (let index = owner[at]!; index <= owner[at + term.length - 1]!; index++) {
        marked[index] = true
      }
    }
  }

  // Combining marks fold to nothing; they belong to the letter before them.
  empty.forEach(index => {
    if (index > 0) marked[index] = marked[index - 1]!
  })

  const segments: HighlightSegment[] = []
  chars.forEach((char, index) => {
    const match = marked[index]!
    const last = segments[segments.length - 1]
    if (last && last.match === match) last.text += char
    else segments.push({ text: char, match })
  })
  return segments
}

export interface CompareOptions {
  /** Locale for ordering. Defaults to the runtime's locale. */
  locale?: string | string[]
  /**
   * What counts as different, as in `Intl.Collator`. Defaults to `'base'`:
   * `a`, `á` and `A` sort as equal.
   */
  sensitivity?: 'base' | 'accent' | 'case' | 'variant'
}

const collators = new Map<string, Intl.Collator>()

/**
 * Natural, locale-aware ordering: numbers compare by value and accents are
 * ignored, so `file2` comes before `file10` and `Árbol` sits with `arbol`.
 * Pass it straight to sort: `names.sort(compareNatural)`.
 */
export const compareNatural = (
  a: string,
  b: string,
  { locale, sensitivity = 'base' }: CompareOptions = {}
): number => {
  const key = `${locale === undefined ? '' : [locale].flat().join(',')}|${sensitivity}`
  let collator = collators.get(key)
  if (!collator) {
    collator = new Intl.Collator(locale, { numeric: true, sensitivity })
    collators.set(key, collator)
  }
  return collator.compare(String(a ?? ''), String(b ?? ''))
}

/**
 * Levenshtein distance in code points: the number of single-character
 * insertions, deletions and substitutions between two strings.
 * `distance('kitten', 'sitting')` → `3`.
 */
export const distance = (a: string, b: string): number => {
  const left = Array.from(String(a ?? ''))
  const right = Array.from(String(b ?? ''))
  if (left.length === 0) return right.length
  if (right.length === 0) return left.length
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i++) {
    const current = [i]
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost)
    }
    previous = current
  }
  return previous[right.length]!
}

export interface SimilarityOptions extends FoldOptions {
  /** Compare folded text, ignoring accents and case. Defaults to `true`. */
  fold?: boolean
}

/**
 * How alike two strings are, from `0` (nothing in common) to `1` (equal),
 * based on `distance`. Accents and case are ignored unless `fold: false`.
 * `similarity('Mexico', 'México')` → `1`.
 */
export const similarity = (
  a: string,
  b: string,
  { fold: shouldFold = true, locale }: SimilarityOptions = {}
): number => {
  const options = locale === undefined ? {} : { locale }
  const left = shouldFold ? fold(a, options) : String(a ?? '')
  const right = shouldFold ? fold(b, options) : String(b ?? '')
  const longest = Math.max(Array.from(left).length, Array.from(right).length)
  return longest === 0 ? 1 : 1 - distance(left, right) / longest
}

export interface ClosestOptions extends SimilarityOptions {
  /** Minimum similarity, from `0` to `1`. Defaults to `0.5`. */
  threshold?: number
  /**
   * Also compare the input with the start of each word of a longer
   * candidate, so `horchatta` finds `Horchata de arroz`. Needs at least three
   * characters. Defaults to `true`.
   */
  partial?: boolean
}

/** Partial matches score a little lower, so a whole match wins a tie. */
const PARTIAL_WEIGHT = 0.98

const partialScore = (input: string, candidate: string): number => {
  const left = Array.from(input)
  const right = Array.from(candidate)
  if (left.length < 3 || right.length <= left.length) return 0
  const needle = left.join('')
  let best = 0
  right.forEach((char, index) => {
    if (index > 0 && !/[\s\p{P}]/u.test(right[index - 1]!)) return
    if (/\s/u.test(char)) return
    const piece = right.slice(index, index + left.length).join('')
    best = Math.max(best, similarity(needle, piece, { fold: false }))
  })
  return best * PARTIAL_WEIGHT
}

/**
 * The candidate most similar to `input`, for "Did you mean…?" hints, or
 * `undefined` when none reaches `threshold`.
 * `closest('mexcio', ['Chile', 'México', 'Perú'])` → `'México'`.
 */
export const closest = <T extends string>(
  input: string,
  candidates: Iterable<T>,
  { threshold = 0.5, partial = true, ...options }: ClosestOptions = {}
): T | undefined => {
  const shouldFold = options.fold ?? true
  const foldOptions = options.locale === undefined ? {} : { locale: options.locale }
  const prepare = (value: string) => (shouldFold ? fold(value, foldOptions) : String(value ?? ''))
  const needle = prepare(input)
  let best: T | undefined
  let bestScore = -1
  for (const candidate of candidates) {
    const whole = similarity(input, candidate, options)
    const score = partial ? Math.max(whole, partialScore(needle, prepare(candidate))) : whole
    if (score > bestScore) {
      best = candidate
      bestScore = score
    }
  }
  return bestScore >= threshold ? best : undefined
}
