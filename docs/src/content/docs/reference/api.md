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
- `removeAccents(text)`: `'Ñandú Straße'` → `'Nandu Strasse'`. Removes diacritics and transliterates ß, æ, œ, ø, đ, ł, þ, ð and ı.

## Display

- `truncate(text, length, options?)`: `('The quick brown fox jumps', 15)` → `'The quick…'`. Counts code points, so emoji and accents are never split. `{ position: 'middle' }` keeps both ends (`'annual-report-2026-final.pdf'` at 19 → `'annual-re…final.pdf'`) and `{ position: 'start' }` keeps the ending (`'…fox jumps'`).
- `initials(text, options?)`: `'Samuel Olvera'` → `'SO'`.

## Conversions by name

- `convert(text, to, options?)`: `('content type', 'train')` → `'Content-Type'`. `to` is one of `CONVERSIONS`; options go to the underlying function (see [options](../configuration/#convert)). An unknown name returns the text unchanged.
- `CONVERSIONS`: `camel`, `pascal`, `kebab`, `snake`, `dot`, `path`, `constant`, `train`, `title`, `sentence`, `capitalize`, `uncapitalize`, `lower`, `upper`, `slug`, `accents`, `truncate`, `initials`.
- `isConversion(value)`: `true` for a name in `CONVERSIONS`.

## Building blocks

- `words(text)`: `'XMLHttpRequest'` → `['XML', 'Http', 'Request']`.

## HTML layer

From `@samline/string/vanilla` (see the [HTML attributes guide](../../guides/html/)):

- `string(target?, options?)`: converts `target` (an element, selector or list; defaults to `[data-string]`) and returns `{ refresh, destroy }`. `destroy()` is idempotent and restores the original markup.
- `autoString(options?)`: the same for every match in `scope`, including elements added later. Takes `selector`, `scope` and `observe` besides the `string()` options.
- `ATTRIBUTE` (`data-string`), `STATE_ATTRIBUTE` (`data-string-state`) and `CHANGE_EVENT` (`string:change`).

## Browser global

The CDN bundle defines `window.SamlineString` with every function above, `string`, `autoString`, `auto(options?)` and `controller`, and converts `[data-string]` on load unless the script tag has `data-manual`.

## Types

`CaseOptions`, `TitleCaseOptions`, `SlugifyOptions`, `TruncateOptions`, `TruncatePosition`, `InitialsOptions`, `Conversion` and `ConvertOptions`; from `/vanilla` also `StringOptions`, `AutoStringOptions`, `StringController` and `StringState`.
