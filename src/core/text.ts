import { graphemes } from './graphemes.js'
import { words } from './words.js'

export type TruncatePosition = 'end' | 'middle' | 'start'

export interface TruncateOptions {
  /** Appended when the text is cut. Defaults to `'…'`. Counts toward `length`. */
  ellipsis?: string
  /**
   * Cut at a whole word instead of mid-word. Defaults to `true`. Applies to
   * `'end'` and `'start'`; `'middle'` always keeps exact characters.
   */
  wordBoundary?: boolean
  /**
   * Where the text is cut. `'end'` (default) keeps the beginning,
   * `'start'` keeps the ending, and `'middle'` keeps both ends, which suits
   * file names and IDs: `annual-report-2026-final.pdf` at 19 → `annual-re…final.pdf`.
   */
  position?: TruncatePosition
}

const WORD_CHAR = /[\p{L}\p{N}]/u
const EDGE = '[\\s.,;:!?-]+'
const TRAILING = new RegExp(`${EDGE}$`, 'u')
const LEADING = new RegExp(`^${EDGE}`, 'u')

/**
 * Shorten text to at most `length` characters. Characters are graphemes, so
 * emoji (👨‍👩‍👧, 🇲🇽) and accented letters are never split.
 */
export const truncate = (
  input: string,
  length: number,
  { ellipsis = '…', wordBoundary = true, position = 'end' }: TruncateOptions = {}
): string => {
  const chars = graphemes(input)
  if (!Number.isFinite(length) || length < 0 || chars.length <= length) return chars.join('')
  const room = Math.max(0, length - graphemes(ellipsis).length)

  if (position === 'middle') {
    const head = chars.slice(0, Math.ceil(room / 2)).join('')
    const tail = room > 1 ? chars.slice(chars.length - Math.floor(room / 2)).join('') : ''
    return head.replace(/\s+$/u, '') + ellipsis + tail.replace(/^\s+/u, '')
  }

  if (position === 'start') {
    const start = chars.length - room
    let cut = chars.slice(start).join('')
    if (wordBoundary && room > 0 && WORD_CHAR.test(chars[start - 1]!)) {
      const firstSpace = cut.search(/\s/u)
      if (firstSpace >= 0 && firstSpace < cut.length - 1) cut = cut.slice(firstSpace)
    }
    return ellipsis + cut.replace(LEADING, '')
  }

  let cut = chars.slice(0, room).join('')
  if (wordBoundary && chars[room] !== undefined && WORD_CHAR.test(chars[room]!)) {
    const lastSpace = cut.search(/\s\S*$/u)
    if (lastSpace > 0) cut = cut.slice(0, lastSpace)
  }
  return cut.replace(TRAILING, '') + ellipsis
}

export interface InitialsOptions {
  /** Maximum number of letters. Defaults to `2`. */
  max?: number
  locale?: string | string[]
}

/** `Samuel Olvera` → `SO`, `ana maría lópez` → `AM` */
export const initials = (input: string, { max = 2, locale }: InitialsOptions = {}): string =>
  words(String(input ?? ''))
    .slice(0, Math.max(0, max))
    .map(word => graphemes(word)[0]!.toLocaleUpperCase(locale))
    .join('')
