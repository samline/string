# Changelog

All notable changes to this package. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [semver](https://semver.org/).

## Unreleased

### Added

- `uniqueSlug(text, taken, options)`: the first free slug (`hola-3`), with the number kept inside `maxLength`; `taken` is a list, a `Set` or a function. `convert(text, 'slug', { taken })` uses it.
- Transliteration presets `CYRILLIC`, `GREEK` and `GERMAN` (plus `CHAR_MAPS`), and a `charMap` option for `slugify`, `removeAccents` and `convert`.
- `slugify` `preserve` option to keep characters such as `.` or `_`, and replacement pairs with regular expressions.
- `data-string-taken`, `data-string-transliterate` and `data-string-preserve` attributes. A slug field moves to a free slug on blur, not while the user types.

## [1.2.0] - 2026-11-15

### Added

- Search and comparison: `fold` (case, accents, full-width), `contains` (every query word, accent-insensitive), `highlight` (matching pieces of the original text, without HTML), `compareNatural` (numeric, locale-aware, accent-insensitive sorting), `distance`, `similarity` and `closest` for typo suggestions.
- `search(target, options)` and `autoSearch(options)` in `@samline/string/vanilla`: `data-string-search="#q"` filters a list as the user types, wraps matches in `<mark>`, shows a `data-string-search-empty` message, reports `data-string-search-state` and a `string:search` event, and restores the markup on `destroy()`.
- The browser bundle also starts `[data-string-search]` lists; `SamlineString.auto({ search })` takes search-only options.

## [1.1.0] - 2026-11-15

### Added

- HTML layer in `@samline/string/vanilla`: `string(target, options)` and `autoString(options)` convert any element with `data-string="<conversion>"` and restore the original markup on `destroy()`. Inputs and textareas convert while the user types (keeping a just-typed separator and the caret, skipping IME composition) and finalize on blur.
- `data-string-source`: a field or preview follows another one. A slug field follows the title until the user edits it and follows again when emptied; sources chain. State in `data-string-state` (`ready`, `following`, `edited`) and a bubbling `string:change` event.
- Every option as a `data-string-*` attribute, the locale taken from the closest `lang`, `title` on truncated text and an accessible label on initials.
- The browser bundle converts `[data-string]` on load and for elements added later; `data-manual` on the script tag waits for `SamlineString.auto()`.
- `convert(text, to, options)`, `CONVERSIONS` and `isConversion` to run any conversion by name.
- `pathCase` (`hello/world`) and `trainCase` (`Content-Type`).
- `truncate` `position` option: `'middle'` keeps both ends of file names and IDs, `'start'` keeps the ending.

### Changed

- The package moved from the `samline/utils` monorepo to its own repository, [samline/string](https://github.com/samline/string). Homepage, repository and documentation links point to the package's own site.

## [1.0.0] - 2026-11-13

### Added

- First release: case conversion (camel, Pascal, kebab, snake, dot, constant, title and sentence case, capitalize and uncapitalize), `slugify` with replacements, `maxLength` and a typing-friendly `trim: false`, `removeAccents` with transliteration, `truncate`, `initials` and the shared `words` splitter. ESM, CommonJS and a browser global (`window.SamlineString`).
