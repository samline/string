import { fold } from './search.js'

export interface HashColorOptions {
  /** Saturation in percent. Defaults to `55`. */
  saturation?: number
  /** Lightness in percent. Defaults to `45`, readable with white text. */
  lightness?: number
}

/** FNV-1a: a small, well-spread 32-bit hash. */
const hash = (text: string): number => {
  let value = 0x811c9dc5
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 0x01000193)
  }
  return value >>> 0
}

/**
 * A stable color for a name, for avatars and tags: the same text always gets
 * the same hue, ignoring case, accents and surrounding spaces.
 * `hashColor('Ana López')` → `'hsl(214 55% 45%)'` (the hue depends on the text).
 */
export const hashColor = (
  input: string,
  { saturation = 55, lightness = 45 }: HashColorOptions = {}
): string => `hsl(${hash(fold(String(input ?? '').trim())) % 360} ${saturation}% ${lightness}%)`
