import { removeAccents } from './accents.js'
import {
  camelCase,
  capitalize,
  constantCase,
  dotCase,
  kebabCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
  titleCase,
  trainCase,
  uncapitalize,
  type TitleCaseOptions,
} from './case.js'
import { slugify, uniqueSlug, type SlugifyOptions, type TakenSlugs } from './slugify.js'
import { initials, truncate, type InitialsOptions, type TruncateOptions } from './text.js'

/** Every conversion `convert()` and the `data-string` attribute understand. */
export const CONVERSIONS = [
  'camel',
  'pascal',
  'kebab',
  'snake',
  'dot',
  'path',
  'constant',
  'train',
  'title',
  'sentence',
  'capitalize',
  'uncapitalize',
  'lower',
  'upper',
  'slug',
  'accents',
  'truncate',
  'initials',
] as const

export type Conversion = (typeof CONVERSIONS)[number]

export interface ConvertOptions
  extends TitleCaseOptions, Omit<SlugifyOptions, 'locale'>, TruncateOptions, InitialsOptions {
  /** Maximum length for `'truncate'`. Without it, `'truncate'` returns the text unchanged. */
  length?: number
  /** Slugs already in use: `'slug'` then returns a free one (`hola-2`). See `uniqueSlug`. */
  taken?: TakenSlugs
}

/** True when `value` names a conversion, for example `'kebab'` or `'slug'`. */
export const isConversion = (value: unknown): value is Conversion =>
  (CONVERSIONS as readonly unknown[]).includes(value)

/**
 * Run a conversion by name, so it can come from configuration, a select menu
 * or an HTML attribute: `convert('Hello World', 'kebab')` → `hello-world`.
 *
 * Options are passed through to the underlying function (`smallWords` for
 * `'title'`, `separator` and `replacements` for `'slug'`, `length` and
 * `position` for `'truncate'`, `max` for `'initials'`, `locale` for all of
 * them). An unknown name returns the text unchanged.
 */
export const convert = (input: string, to: Conversion, options: ConvertOptions = {}): string => {
  const text = String(input ?? '')
  const { locale } = options
  const caseOptions = locale === undefined ? {} : { locale }
  switch (to) {
    case 'camel':
      return camelCase(text, caseOptions)
    case 'pascal':
      return pascalCase(text, caseOptions)
    case 'kebab':
      return kebabCase(text, caseOptions)
    case 'snake':
      return snakeCase(text, caseOptions)
    case 'dot':
      return dotCase(text, caseOptions)
    case 'path':
      return pathCase(text, caseOptions)
    case 'constant':
      return constantCase(text, caseOptions)
    case 'train':
      return trainCase(text, caseOptions)
    case 'title':
      return titleCase(text, options)
    case 'sentence':
      return sentenceCase(text, caseOptions)
    case 'capitalize':
      return capitalize(text, caseOptions)
    case 'uncapitalize':
      return uncapitalize(text, caseOptions)
    case 'lower':
      return text.toLocaleLowerCase(locale)
    case 'upper':
      return text.toLocaleUpperCase(locale)
    case 'slug':
      return options.taken === undefined
        ? slugify(text, options)
        : uniqueSlug(text, options.taken, options)
    case 'accents':
      return removeAccents(text, options.charMap ? { charMap: options.charMap } : {})
    case 'truncate':
      return options.length === undefined ? text : truncate(text, options.length, options)
    case 'initials':
      return initials(text, options)
    default:
      return text
  }
}
