---
title: 'Configuration options'
titleAccent: 'options'
description: Options for slugify, titleCase, truncate, initials, convert, search and comparison and the HTML layer, and the locale option shared by every case function.
locale: en
sidebar:
  group: reference
  order: 2
  label: Configuration
---

## Locale

Every case function, `slugify` and `initials` accept `locale` for upper and lower casing, for example `{ locale: 'tr' }` so `istanbul` becomes `İSTANBUL`.

## slugify

| Option         | Default | Description                                                               |
| -------------- | ------- | ------------------------------------------------------------------------- |
| `separator`    | `'-'`   | Word separator. `''` joins words.                                         |
| `lower`        | `true`  | Lower-case the result.                                                    |
| `replacements` | `{}`    | Applied first: `{ '&': 'y' }` (literal) or pairs `[[/c\+\+/gi, 'cpp']]`.  |
| `charMap`      | –       | Extra transliteration: `CYRILLIC`, `GREEK`, `GERMAN` or your own map.     |
| `preserve`     | `''`    | Characters kept as they are, for example `'.'` or `'._'`.                 |
| `maxLength`    | –       | Maximum length; cuts at a separator when possible.                        |
| `trim`         | `true`  | Remove leading and trailing separators. Use `false` while the user types. |
| `locale`       | –       | Locale for lower-casing.                                                  |

## uniqueSlug

Every `slugify` option, plus:

| Option  | Default | Description                                        |
| ------- | ------- | -------------------------------------------------- |
| `start` | `2`     | First number tried: the second "Hola" is `hola-2`. |

It throws a `RangeError` when 100,000 numbers in a row are taken.

## removeAccents

| Option    | Default | Description                                                                 |
| --------- | ------- | --------------------------------------------------------------------------- |
| `charMap` | –       | Applied before and after accents are removed. Longer keys win over shorter. |

## titleCase

| Option       | Default | Description                                                                             |
| ------------ | ------- | --------------------------------------------------------------------------------------- |
| `smallWords` | `[]`    | Words kept lower case unless first, for example `['of', 'the']` or `['de', 'la', 'y']`. |
| `locale`     | –       | Locale for casing.                                                                      |

## truncate

| Option         | Default | Description                                                                          |
| -------------- | ------- | ------------------------------------------------------------------------------------ |
| `ellipsis`     | `'…'`   | Appended when cut; it counts toward `length`.                                        |
| `wordBoundary` | `true`  | Cut at the last whole word. When no whole word fits, the word is cut.                |
| `position`     | `'end'` | `'end'` keeps the beginning, `'start'` keeps the ending, `'middle'` keeps both ends. |

## initials

| Option   | Default | Description                |
| -------- | ------- | -------------------------- |
| `max`    | `2`     | Maximum number of letters. |
| `locale` | –       | Locale for upper-casing.   |

## convert

`convert(text, to, options)` accepts every option above in one object, plus `length` for `'truncate'` (without it, the text is returned unchanged) and `taken` for `'slug'`, which then returns `uniqueSlug`.

## Search and comparison

| Option        | Used by                 | Default  | Description                                                  |
| ------------- | ----------------------- | -------- | ------------------------------------------------------------ |
| `locale`      | every function          | –        | Locale for folding (`fold`, `contains`…) or ordering.        |
| `split`       | `contains`, `highlight` | `true`   | Each query word is its own term; `false` matches one phrase. |
| `sensitivity` | `compareNatural`        | `'base'` | `'base'`, `'accent'`, `'case'` or `'variant'`.               |
| `fold`        | `similarity`, `closest` | `true`   | Ignore accents and case.                                     |
| `threshold`   | `closest`               | `0.5`    | Minimum similarity, from `0` to `1`.                         |

`search()` options are listed in the [search guide](../../guides/search/#filtering-a-list).

## HTML layer

`string(target, options)` and `autoString(options)` accept every `convert` option, plus:

| Option     | Default | Description                                                                  |
| ---------- | ------- | ---------------------------------------------------------------------------- |
| `to`       | –       | Conversion for elements without a valid `data-string` value.                 |
| `source`   | –       | Element or selector that feeds this element.                                 |
| `live`     | `true`  | Convert fields while the user types; `false` converts on blur only.          |
| `onChange` | –       | `(value, element) => void`, called after every conversion that changed text. |

`autoString` also takes `selector` (`'[data-string]'`), `scope` (`document`) and `observe` (`true`). Every option has a matching `data-string-*` attribute, listed in the [HTML attributes guide](../../guides/html/#options).
