const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Make text safe inside HTML text and quoted attributes: `<b>` → `&lt;b&gt;`. */
export const escapeHtml = (input: string): string =>
  String(input ?? '').replace(/[&<>"']/g, char => ESCAPES[char]!)

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
}

const fromCodePoint = (code: number, entity: string) =>
  Number.isInteger(code) && code > 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff)
    ? String.fromCodePoint(code)
    : entity

/**
 * Decode numeric entities (`&#39;`, `&#x27;`) and the common named ones
 * (`&amp;`, `&nbsp;`, `&hellip;`…). Unknown entities are left as they are.
 */
export const unescapeHtml = (input: string): string =>
  String(input ?? '').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] !== '#') return NAMED[body.toLowerCase()] ?? entity
    const hex = body[1] === 'x' || body[1] === 'X'
    return fromCodePoint(parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10), entity)
  })

const BLOCK =
  /<\/?(?:p|div|br|li|ul|ol|h[1-6]|tr|td|th|table|section|article|header|footer|blockquote|pre|hr)\b[^>]*>/gi

/**
 * Plain text from HTML, for excerpts, meta descriptions and search indexes:
 * removes comments, `<script>` and `<style>` with their content and every
 * tag, turns block tags into spaces, decodes entities and collapses spaces.
 *
 * The result is text: insert it with `textContent`. It is not an HTML
 * sanitizer.
 */
export const stripTags = (input: string): string =>
  unescapeHtml(
    String(input ?? '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>/gi, '')
      .replace(BLOCK, ' ')
      .replace(/<[^>]*>/g, '')
  )
    .replace(/\s+/g, ' ')
    .trim()
