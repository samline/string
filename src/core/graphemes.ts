type Segmenter = { segment: (input: string) => Iterable<{ segment: string; isWordLike?: boolean }> }
type SegmenterConstructor = new (
  locale?: string | string[],
  options?: { granularity: 'grapheme' | 'word' }
) => Segmenter

/** `Intl.Segmenter` when the runtime has it (every current browser, Node 16+). */
const SegmenterImpl = (globalThis.Intl as { Segmenter?: SegmenterConstructor } | undefined)
  ?.Segmenter

const segmenters = new Map<string, Segmenter>()

/** A cached `Intl.Segmenter`, or `undefined` in runtimes without one. */
export const segmenter = (
  granularity: 'grapheme' | 'word',
  locale?: string | string[]
): Segmenter | undefined => {
  if (!SegmenterImpl) return undefined
  const key = `${granularity}|${locale === undefined ? '' : [locale].flat().join(',')}`
  let instance = segmenters.get(key)
  if (!instance) {
    instance = new SegmenterImpl(locale, { granularity })
    segmenters.set(key, instance)
  }
  return instance
}

/**
 * Split text into user-perceived characters, so a family emoji (👨‍👩‍👧), a
 * flag (🇲🇽) or a letter with a combining accent counts as one:
 * `graphemes('🇲🇽é')` → `['🇲🇽', 'é']`. Falls back to code points without
 * `Intl.Segmenter`.
 */
export const graphemes = (input: string): string[] => {
  const text = String(input ?? '')
  const instance = segmenter('grapheme')
  return instance ? Array.from(instance.segment(text), part => part.segment) : Array.from(text)
}
