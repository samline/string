/** Letters that Unicode normalization does not decompose into ASCII. */
const TRANSLITERATIONS: Record<string, string> = {
  ß: 'ss',
  ẞ: 'SS',
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
  ø: 'o',
  Ø: 'O',
  đ: 'd',
  Đ: 'D',
  ł: 'l',
  Ł: 'L',
  þ: 'th',
  Þ: 'TH',
  ð: 'd',
  Ð: 'D',
  ı: 'i',
}
const SPECIAL = new RegExp(`[${Object.keys(TRANSLITERATIONS).join('')}]`, 'g')

export interface RemoveAccentsOptions {
  /**
   * Extra replacements, applied before and after accents are removed, for
   * scripts or conventions the built-in table does not cover:
   * `{ charMap: CYRILLIC }`, `{ charMap: { ä: 'ae' } }`. Keys may be longer
   * than one character; the longest key wins.
   */
  charMap?: Readonly<Record<string, string>>
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const patterns = new WeakMap<object, RegExp | null>()

const patternFor = (map: Readonly<Record<string, string>>): RegExp | null => {
  if (patterns.has(map)) return patterns.get(map)!
  const keys = Object.keys(map)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
  const pattern = keys.length ? new RegExp(keys.map(escape).join('|'), 'gu') : null
  patterns.set(map, pattern)
  return pattern
}

const applyMap = (value: string, map: Readonly<Record<string, string>>) => {
  const pattern = patternFor(map)
  return pattern ? value.replace(pattern, key => map[key] ?? key) : value
}

/** Remove diacritics and transliterate common Latin letters: `Ñandú Straße` → `Nandu Strasse`. */
export const removeAccents = (input: string, { charMap }: RemoveAccentsOptions = {}): string => {
  let value = String(input ?? '')
  // Before: exact letters such as ё or ä. After: letters whose accent was removed (й → и).
  if (charMap) value = applyMap(value, charMap)
  value = value
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(SPECIAL, char => TRANSLITERATIONS[char] ?? char)
  return charMap ? applyMap(value, charMap) : value
}
