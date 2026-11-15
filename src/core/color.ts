import { fold } from './search.js'

export interface HashColorOptions {
  /** Saturation in percent. Defaults to `55`. */
  saturation?: number
  /** Highest lightness in percent. Defaults to `45`. */
  lightness?: number
  /**
   * Minimum contrast ratio of white text on the color; lightness is lowered
   * until it is reached. Defaults to `4.5` (WCAG AA); `0` keeps `lightness`.
   */
  contrast?: number
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

/** Contrast ratio of white on an HSL color (0–360, 0–100, 0–100). */
const whiteContrast = (hue: number, saturation: number, lightness: number): number => {
  const s = saturation / 100
  const l = lightness / 100
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12
    const value = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4)
  return 1.05 / (luminance + 0.05)
}

/**
 * A stable color for a name, for avatars and tags: the same text always gets
 * the same hue, ignoring case, accents and surrounding spaces, and white text
 * on it stays readable. `hashColor('Ana López')` → `'hsl(214 55% 45%)'`.
 */
export const hashColor = (
  input: string,
  { saturation = 55, lightness = 45, contrast = 4.5 }: HashColorOptions = {}
): string => {
  const hue = hash(fold(String(input ?? '').trim())) % 360
  let light = Math.max(0, Math.min(100, lightness))
  while (light > 0 && whiteContrast(hue, saturation, light) < contrast) light--
  return `hsl(${hue} ${saturation}% ${light}%)`
}
