# @samline/string

Case conversion, URL slugs, accent removal, truncation and initials for JavaScript, TypeScript and plain HTML, all built on one Unicode-aware word splitter, so every case agrees. Accent-insensitive search, highlighting, natural sorting and typo suggestions use the same rules. Call the functions from code, or convert text, fill form fields and filter lists straight from HTML attributes.

[Demo](https://samline.github.io/string/) · [Examples](https://samline.github.io/string/examples/) · [Documentation](https://samline.github.io/string/docs/) · [Changelog](CHANGELOG.md)

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [HTML / CDN](#html--cdn)
- [Capabilities](#capabilities)
- [API at a glance](#api-at-a-glance)
- [Documentation](#documentation)
- [Changelog](#changelog)
- [AI agent skill](#ai-agent-skill)
- [License](#license)

## Installation

```sh
npm install @samline/string
```

```sh
pnpm add @samline/string
```

```sh
bun add @samline/string
```

The functions are pure, with no DOM access: browsers, Node 20 or newer, workers and edge runtimes. The optional HTML layer in `@samline/string/vanilla` needs a DOM and does nothing without one. No runtime dependencies.

## Quick start

```js
import { camelCase, convert, kebabCase, slugify, titleCase, truncate } from '@samline/string'

camelCase('XMLHttp request_id') // 'xmlHttpRequestId'
kebabCase('someLongName') // 'some-long-name'
titleCase('el señor de los anillos', { smallWords: ['de', 'los'] }) // 'El Señor de los Anillos'
slugify('¡Hola, Ñandú & Café!', { replacements: { '&': 'y' } }) // 'hola-nandu-y-cafe'
truncate('The quick brown fox jumps', 15) // 'The quick…'
truncate('annual-report-2026-final.pdf', 19, { position: 'middle' }) // 'annual-re…final.pdf'
convert('content type', 'train') // 'Content-Type'
```

Or let HTML attributes do the work. This slug field fills itself from the title until the user edits it:

```html
<input id="title" value="Café & Té" />
<input data-string="slug" data-string-source="#title" />
<span data-string="initials">Samuel Olvera</span>
```

```js
import { string } from '@samline/string/vanilla'

string() // converts every [data-string] element; returns { refresh, destroy }
```

Search without worrying about accents or case:

```js
import { closest, compareNatural, contains, highlight } from '@samline/string'

contains('México: Café de olla', 'cafe mex') // true
highlight('Café de olla', 'cafe') // [{ text: 'Café', match: true }, { text: ' de olla', match: false }]
;['file10', 'file2', 'File1'].sort(compareNatural) // ['File1', 'file2', 'file10']
closest('te vrde', ['Café de olla', 'Té verde']) // 'Té verde'
```

```html
<input id="q" type="search" />
<ul data-string-search="#q">
  <li>Café de olla</li>
  <li>Té verde</li>
  <li hidden data-string-search-empty>No results</li>
</ul>
```

## HTML / CDN

For Shopify, WordPress or plain HTML pages without a build step, load the browser bundle with a classic script tag. Pin the version in production.

```html
<script src="https://cdn.jsdelivr.net/npm/@samline/string@1.5.0/dist/browser/string.global.js"></script>
<script>
  const { slugify } = window.SamlineString
  console.log(slugify('Café & Té')) // 'cafe-te'
</script>
```

The bundle defines `window.SamlineString` with every function and, when the DOM is ready, starts every `[data-string]`, `[data-string-search]`, `[data-string-count]`, `[data-string-fit]` and `[data-string-copy]` element, including elements added later. Add `data-manual` to the script tag to start it yourself with `SamlineString.auto(options)`.

## Capabilities

### One word splitter

`words()` splits on any non-letter, non-digit character, on lower-to-upper transitions and before the last capital of an acronym (`XMLHttpRequest` → `XML`, `Http`, `Request`). Digits stay with their word and letters from any script count, so every case function agrees.

### Every case

`camelCase`, `pascalCase`, `kebabCase`, `snakeCase`, `dotCase`, `pathCase`, `constantCase` and `trainCase` (`Content-Type`) for identifiers; `titleCase` (with `smallWords`), `sentenceCase`, `capitalize` and `uncapitalize` for human text. Every function takes a `locale`, so Turkish İ and ı convert correctly.

### Slugs and accents

`slugify` removes accents, transliterates ß, æ, œ, ø, đ, ł and þ, applies your `replacements` (literal or regex pairs), collapses separators and cuts at a separator with `maxLength`. `trim: false` keeps a trailing separator for live slug fields, and `preserve: '.'` keeps characters such as the dot in `v1.2`. `charMap` adds transliteration: the `CYRILLIC`, `GREEK` and `GERMAN` presets (also by name in `CHAR_MAPS`) (`Москва` → `moskva`, `Müller` → `mueller`) or your own map. `uniqueSlug(text, taken)` returns the first free slug (`hola-3`), keeping the number inside `maxLength`. `removeAccents` gives accent-insensitive text for search.

### Display helpers

`truncate` counts graphemes, so emoji such as 👨‍👩‍👧 or 🇲🇽 and accented letters are never split, and cuts at the last whole word. `position: 'middle'` keeps both ends of file names and IDs, `position: 'start'` keeps the ending. `initials` builds avatar letters.

### Text helpers

`wordCount` and `readingTime` count words with `Intl.Segmenter`, so punctuation is ignored and Chinese or Japanese text is split correctly. `pluralize(count, { one: '# file', other: '# files' })` picks the right form for any language with `Intl.PluralRules`, formats the count and supports ordinals (`22nd`). `template('Hola {user.name}', values)` fills placeholders. `escapeHtml`, `unescapeHtml` and `stripTags` move text in and out of HTML, and `graphemes` splits text into user-perceived characters.

### Conversions by name

`convert(text, 'kebab')` runs any conversion from a string, so it can come from configuration, a select menu or an attribute. `CONVERSIONS` lists the names and `isConversion` checks one.

### Search and comparison

`fold` lowers case, removes accents and maps full-width forms, so `contains` finds `Café` with `cafe` and every query word counts. `highlight` splits the original text into matching and non-matching pieces, without building HTML, and keeps decomposed accents with their letter. `compareNatural` sorts `file2` before `file10` and ignores accents. `distance`, `similarity` and `closest` measure typos and suggest the nearest candidate; `closest` also compares with the start of each word, so `horchatta` finds `Horchata de arroz`.

### HTML attributes

`data-string="<conversion>"` converts any element's text, and the original markup comes back on `destroy()`. Inputs and textareas convert while the user types, keep a separator they just typed, keep the caret in place, skip IME composition and finalize on blur. `data-string-taken` keeps a slug field off slugs in use and `data-string-transliterate="cyrillic"` reads other scripts. `data-string-source` makes a field or preview follow another one: a slug follows the title until the user edits it and follows again when emptied, and sources chain (title → slug → URL preview). Truncated text keeps the full text in `title`, initials become an image labelled with the full name, and `data-string-state` plus a `string:change` event report every change. `data-string-search="#q"` filters a list as the user types, wraps matches in `<mark>`, shows a `data-string-search-empty` message and reports results in a `string:search` event.

`data-string-count="#bio"` shows the characters (graphemes) or words left in a field, with `ok`, `near` and `over` states. `data-string-fit` cuts text in the middle to fit its box and fits again when the box resizes. `data-string-copy="#name"` with `data-string-copy-as="slug"` copies converted text to the clipboard. `data-string-color` sets `--string-color` to a stable color for the text, for avatar backgrounds; `hashColor(text)` gives the same color in code.

## API at a glance

| API                                                                                                                                         | Purpose                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`, `dotCase`, `pathCase`, `constantCase`, `trainCase`                                     | Identifier cases.                           |
| `titleCase`, `sentenceCase`, `capitalize`, `uncapitalize`                                                                                   | Human-readable casing.                      |
| `slugify(text, options?)`, `uniqueSlug(text, taken, options?)`, `removeAccents(text, options?)`, `CYRILLIC`, `GREEK`, `GERMAN`, `CHAR_MAPS` | URL slugs, free slugs and accent-free text. |
| `truncate(text, length, options?)`, `initials(text, options?)`, `graphemes(text)`                                                           | Display helpers.                            |
| `convert(text, to, options?)`, `CONVERSIONS`, `isConversion(value)`                                                                         | Any conversion by name.                     |
| `wordCount`, `readingTime`, `pluralize`, `template`, `escapeHtml`, `unescapeHtml`, `stripTags`                                              | Prose, plurals, placeholders and HTML text. |
| `fold`, `contains`, `highlight`, `compareNatural`, `distance`, `similarity`, `closest`                                                      | Search, sorting and typo suggestions.       |
| `words(text)`                                                                                                                               | The shared word splitter.                   |
| `string(target?, options?)`, `autoString(options?)` from `/vanilla`                                                                         | Convert elements and fields from HTML.      |
| `count`, `fit`, `copy` and their `auto*()` from `/vanilla`                                                                                  | Counters, fitted text and copy buttons.     |
| `hashColor(text, options?)`                                                                                                                 | A stable color for a name.                  |
| `search(target?, options?)`, `autoSearch(options?)` from `/vanilla`                                                                         | Filter and highlight lists from HTML.       |

### Entrypoints

| Entrypoint                | When to use                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `@samline/string`         | ESM or CommonJS, every pure function.                                                                         |
| `@samline/string/vanilla` | Every function plus the HTML layer: `string()`, `search()`, `count()`, `fit()`, `copy()` and their `auto*()`. |
| `@samline/string/browser` | Classic script that defines `window.SamlineString` and starts the HTML layer.                                       |

## Documentation

Read the [documentation](https://samline.github.io/string/docs/) for the full guides and API contracts, and explore [working examples](https://samline.github.io/string/examples/) with complete and separate source files.

| Guide                                                                     | What it covers                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| [Installation](https://samline.github.io/string/docs/getting-started/)    | npm, CDN and the first conversions.                 |
| [API reference](https://samline.github.io/string/docs/reference/api/)     | Every function with examples.                       |
| [Options](https://samline.github.io/string/docs/reference/configuration/) | slugify, titleCase, truncate, initials and locales. |
| [Word splitting](https://samline.github.io/string/docs/guides/words/)     | Exactly how words are detected.                     |
| [HTML attributes](https://samline.github.io/string/docs/guides/html/)     | `data-string`, fields, sources, state and events.   |
| [Search](https://samline.github.io/string/docs/guides/search/)            | Folding, highlighting, sorting and list filtering.  |

## Changelog

Read [CHANGELOG.md](CHANGELOG.md) or the [published changelog](https://samline.github.io/string/docs/changelog/) for release history and explicitly marked breaking and behavior changes. Review the notes before upgrading.

## AI agent skill

The [String skill](https://samline.github.io/string/skills/string/SKILL.md) teaches verified package integration. Its maintained [repository source](skills/string/SKILL.md) and website download are the same file. Verify the installed package version before applying its guidance.

Download [SKILL.md](https://samline.github.io/string/skills/string/SKILL.md) into a `string/` folder in your agent's supported skill directory. For agents that discover project skills from `.agents/skills/`:

```sh
mkdir -p .agents/skills/string
curl --fail --location https://samline.github.io/string/skills/string/SKILL.md \
  --output .agents/skills/string/SKILL.md
```

Keep the filename `SKILL.md`; discovery paths and invocation syntax depend on the agent.

## License

MIT — [LICENSE.md](LICENSE.md).
