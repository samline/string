---
title: 'API reference'
titleAccent: 'reference'
description: Every @samline/string function with its input and output, from camelCase and slugify to truncate, initials, convert and the HTML layer.
locale: en
sidebar:
  group: reference
  order: 1
---

## Identifiers

| Function                       | `'XMLHttp request_id'` becomes |
| ------------------------------ | ------------------------------ |
| `camelCase(text, options?)`    | `xmlHttpRequestId`             |
| `pascalCase(text, options?)`   | `XmlHttpRequestId`             |
| `kebabCase(text, options?)`    | `xml-http-request-id`          |
| `snakeCase(text, options?)`    | `xml_http_request_id`          |
| `dotCase(text, options?)`      | `xml.http.request.id`          |
| `pathCase(text, options?)`     | `xml/http/request/id`          |
| `constantCase(text, options?)` | `XML_HTTP_REQUEST_ID`          |
| `trainCase(text, options?)`    | `Xml-Http-Request-Id`          |

These functions rebuild the text from its [words](../../guides/words/), so separators and punctuation are dropped and accents are kept: `camelCase('año nuevo')` is `añoNuevo`.

## Human text

| Function                       | Example                                               |
| ------------------------------ | ----------------------------------------------------- |
| `titleCase(text, options?)`    | `'the lord of the rings'` → `'The Lord Of The Rings'` |
| `sentenceCase(text, options?)` | `'HELLO World'` → `'Hello world'`                     |
| `capitalize(text, options?)`   | `'hello World'` → `'Hello World'` (rest untouched)    |
| `uncapitalize(text, options?)` | `'Hello World'` → `'hello World'` (rest untouched)    |

`titleCase` keeps the original spacing and punctuation; pass `smallWords` to keep words such as _of_ or _de_ lower case.

## URLs and search

- `slugify(text, options?)`: `'¡Hola, Ñandú & Café!'` → `'hola-nandu-cafe'`. See [options](../configuration/#slugify).
- `uniqueSlug(text, taken, options?)`: `('Hola', ['hola', 'hola-2'])` → `'hola-3'`. `taken` is a list, a `Set` or a `(slug) => boolean` function; the number is joined with the separator and kept inside `maxLength`. Leave the current record's own slug out of `taken` when editing it.
- `removeAccents(text, options?)`: `'Ñandú Straße'` → `'Nandu Strasse'`. Removes diacritics and transliterates ß, æ, œ, ø, đ, ł, þ, ð and ı; `charMap` adds more.
- `CYRILLIC`, `GREEK`, `GERMAN`: transliteration presets for `charMap` (`'Щука'` → `'Shchuka'`, `'Αθήνα'` → `'Athina'`, `'Müller'` → `'Mueller'`). `CHAR_MAPS` holds them by name. Combine them with your own: `{ ...CYRILLIC, ...GERMAN, '№': 'no' }`.

## Display

- `truncate(text, length, options?)`: `('The quick brown fox jumps', 15)` → `'The quick…'`. Counts code points, so emoji and accents are never split. `{ position: 'middle' }` keeps both ends (`'annual-report-2026-final.pdf'` at 19 → `'annual-re…final.pdf'`) and `{ position: 'start' }` keeps the ending (`'…fox jumps'`).
- `initials(text, options?)`: `'Samuel Olvera'` → `'SO'`.

## Conversions by name

- `convert(text, to, options?)`: `('content type', 'train')` → `'Content-Type'`. `to` is one of `CONVERSIONS`; options go to the underlying function (see [options](../configuration/#convert)). An unknown name returns the text unchanged.
- `CONVERSIONS`: `camel`, `pascal`, `kebab`, `snake`, `dot`, `path`, `constant`, `train`, `title`, `sentence`, `capitalize`, `uncapitalize`, `lower`, `upper`, `slug`, `accents`, `truncate`, `initials`.
- `isConversion(value)`: `true` for a name in `CONVERSIONS`.

## Search and comparison

See the [search guide](../../guides/search/).

- `fold(text, options?)`: `'Ñandú ＡＢＣ Straße'` → `'nandu abc strasse'`.
- `contains(text, query, options?)`: `('México: Café de olla', 'cafe mex')` → `true`. Every query word must appear.
- `highlight(text, query, options?)`: `('Café de olla', 'cafe')` → `[{ text: 'Café', match: true }, { text: ' de olla', match: false }]`.
- `compareNatural(a, b, options?)`: `['file10', 'file2'].sort(compareNatural)` → `['file2', 'file10']`.
- `distance(a, b)`: `('kitten', 'sitting')` → `3`.
- `similarity(a, b, options?)`: `('Mexico', 'México')` → `1`.
- `closest(input, candidates, options?)`: `('mexcio', ['Chile', 'México'])` → `'México'`.

## Building blocks

- `words(text)`: `'XMLHttpRequest'` → `['XML', 'Http', 'Request']`.

## HTML layer

From `@samline/string/vanilla` (see the [HTML attributes guide](../../guides/html/)):

- `string(target?, options?)`: converts `target` (an element, selector or list; defaults to `[data-string]`) and returns `{ refresh, destroy }`. `destroy()` is idempotent and restores the original markup.
- `autoString(options?)`: the same for every match in `scope`, including elements added later. Takes `selector`, `scope` and `observe` besides the `string()` options.
- `search(target?, options?)`: filters each list (defaults to `[data-string-search]`) as its field changes and returns `{ refresh, destroy }`.
- `autoSearch(options?)`: the same for every list in `scope`, including lists added later.
- `ATTRIBUTE` (`data-string`), `STATE_ATTRIBUTE` (`data-string-state`), `CHANGE_EVENT` (`string:change`), `SEARCH_ATTRIBUTE` (`data-string-search`), `SEARCH_STATE_ATTRIBUTE`, `SEARCH_EMPTY_ATTRIBUTE` and `SEARCH_EVENT` (`string:search`).

## Browser global

The CDN bundle defines `window.SamlineString` with every function above, `string`, `autoString`, `search`, `autoSearch`, `auto(options?)` and `controller`. On load it converts `[data-string]` and filters `[data-string-search]` unless the script tag has `data-manual`. `auto()` passes its options to both, with search-only options under `search`: `auto({ locale: 'es', search: { min: 2 } })`.

## Types

`CaseOptions`, `TitleCaseOptions`, `SlugifyOptions`, `UniqueSlugOptions`, `Replacements`, `TakenSlugs`, `RemoveAccentsOptions`, `CharMap`, `CharMapName`, `TruncateOptions`, `TruncatePosition`, `InitialsOptions`, `Conversion`, `ConvertOptions`, `FoldOptions`, `MatchOptions`, `HighlightSegment`, `CompareOptions`, `SimilarityOptions` and `ClosestOptions`; from `/vanilla` also `StringOptions`, `AutoStringOptions`, `StringController`, `StringState`, `SearchOptions`, `AutoSearchOptions`, `SearchController`, `SearchResult` and `SearchState`.
