/** A map from characters (or short sequences) to their Latin replacement. */
export type CharMap = Readonly<Record<string, string>>

/** Add the upper-case form of every lower-case entry: `ж: 'zh'` → `Ж: 'Zh'`. */
const withUpper = (lower: Record<string, string>): CharMap => {
  const map: Record<string, string> = { ...lower }
  for (const [char, latin] of Object.entries(lower)) {
    const upper = char.toUpperCase()
    if (upper !== char && !(upper in map))
      map[upper] = latin.charAt(0).toUpperCase() + latin.slice(1)
  }
  return map
}

/** Russian, Ukrainian, Belarusian and Bulgarian letters: `Щука` → `Shchuka`. */
export const CYRILLIC: CharMap = withUpper({
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ґ: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'i',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ў: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
})

/** Modern Greek letters: `Αθήνα` → `Athina`. */
export const GREEK: CharMap = withUpper({
  α: 'a',
  β: 'v',
  γ: 'g',
  δ: 'd',
  ε: 'e',
  ζ: 'z',
  η: 'i',
  θ: 'th',
  ι: 'i',
  κ: 'k',
  λ: 'l',
  μ: 'm',
  ν: 'n',
  ξ: 'x',
  ο: 'o',
  π: 'p',
  ρ: 'r',
  σ: 's',
  ς: 's',
  τ: 't',
  υ: 'y',
  φ: 'f',
  χ: 'ch',
  ψ: 'ps',
  ω: 'o',
})

/** German umlauts as two letters, the way German speakers write them: `Müller` → `Mueller`. */
export const GERMAN: CharMap = withUpper({ ä: 'ae', ö: 'oe', ü: 'ue' })

/** Presets by name, for the `data-string-transliterate` attribute. */
export const CHAR_MAPS = { cyrillic: CYRILLIC, greek: GREEK, german: GERMAN } as const

export type CharMapName = keyof typeof CHAR_MAPS
