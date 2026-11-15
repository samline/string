---
name: string
description: Use @samline/string to convert text between camelCase, PascalCase, kebab-case, snake_case, CONSTANT_CASE, Train-Case and Title Case, build URL slugs, remove accents, truncate text and build initials in JavaScript, or declaratively in HTML with data-string attributes (live slug fields that follow a title, avatars, middle-truncated file names).
package-version: '1.2.0'
---

# @samline/string

Build against the installed version; this skill describes 1.2.0.

- **Install:** `npm install @samline/string`. Plain HTML: load `https://cdn.jsdelivr.net/npm/@samline/string@1.2.0/dist/browser/string.global.js` and use `window.SamlineString`.
- **Identifiers:** `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`, `dotCase`, `pathCase`, `constantCase`, `trainCase`. They split with `words()` (separators, camelCase, acronyms like `XMLHttp`, any script) and keep accents.
- **Human text:** `titleCase(text, { smallWords })`, `sentenceCase`, `capitalize`, `uncapitalize`.
- **Slugs:** `slugify(text, { separator, lower, replacements, maxLength, trim, locale })`. Use `{ trim: false }` while the user types and a plain `slugify()` for the final value. `removeAccents` for accent-insensitive search.
- **Display:** `truncate(text, length, { ellipsis, wordBoundary, position })` counts code points; `position: 'middle'` for file names and IDs, `'start'` to keep the ending. `initials(text, { max })`.
- **By name:** `convert(text, to, options)` with `to` from `CONVERSIONS` (`camel`, `kebab`, `slug`, `truncate` + `length`, `initials`…); `isConversion(value)` validates user input.
- **Search:** `fold`, `contains(text, query)` (accent/case-insensitive, every word must appear), `highlight(text, query)` → `[{ text, match }]` pieces of the original text (build marks with `textContent`, never innerHTML), `compareNatural` for `.sort()` (`file2` < `file10`), `distance`, `similarity`, `closest(input, candidates, { threshold })` for "Did you mean". List filter: `<ul data-string-search="#q">` hides non-matching children, wraps matches in `<mark>`, shows a `[data-string-search-empty]` child, emits `string:search` with `{ query, matches, total, state }`.
- **HTML:** `import { string, autoString } from '@samline/string/vanilla'`, or the CDN bundle, which auto-inits (`data-manual` + `SamlineString.auto()` to start manually). `data-string="<conversion>"` on any element; options as `data-string-<option>` (`-source`, `-length`, `-position`, `-small-words`, `-replacements` as JSON, `-locale`…), attributes win over options. Fields convert while typing and finalize on blur. A slug field: `<input data-string="slug" data-string-source="#title">` follows until edited (`data-string-state="following" | "edited"`), follows again when emptied. Listen to the `string:change` event; `destroy()` restores markup. Do not hand-write slug-follow listeners.
- **Locales:** pass `{ locale: 'tr' }` (or any BCP 47 tag) where casing depends on language.
- **Do not** write ad-hoc regex case conversions or slug code beside it; every function is pure and safe on the server.
