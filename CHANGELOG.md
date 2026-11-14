# Changelog

All notable changes to this package. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [semver](https://semver.org/).

## Unreleased

### Changed

- The package moved from the `samline/utils` monorepo to its own repository, [samline/string](https://github.com/samline/string). Homepage, repository and documentation links point to the package's own site.

## [1.0.0] - 2026-11-13

### Added

- First release: case conversion (camel, Pascal, kebab, snake, dot, constant, title and sentence case, capitalize and uncapitalize), `slugify` with replacements, `maxLength` and a typing-friendly `trim: false`, `removeAccents` with transliteration, `truncate`, `initials` and the shared `words` splitter. ESM, CommonJS and a browser global (`window.SamlineString`).
