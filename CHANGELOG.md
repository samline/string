# Changelog

All notable changes to this package. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [semver](https://semver.org/).

## Unreleased

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
