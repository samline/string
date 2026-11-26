---
title: 'Search and comparison'
titleAccent: 'comparison'
description: Accent-insensitive search with fold and contains, highlight without HTML strings, natural sorting, typo suggestions and list filtering with data-string-search.
locale: en
sidebar:
  group: guides
  order: 4
  label: Search
---

People type `cafe` and expect `Café`, type `file2` and expect it before `file10`, and make typos. These functions handle all three with the same folding rules as [`removeAccents`](../../reference/api/#urls-and-search).

## Folding

`fold(text, { locale })` lowers the case, removes accents, transliterates ß, æ, œ, ø, đ, ł and þ, and maps full-width forms to ASCII: `'Ñandú ＡＢＣ Straße'` → `'nandu abc strasse'`. Fold both sides before comparing, or use the functions below, which do it for you.

## Finding text

```js
import { contains, highlight } from '@samline/string'

contains('São Paulo: Café au lait', 'cafe sao') // true: every word must appear
contains('São Paulo: Café au lait', 'lait cafe', { split: false }) // false: one phrase
highlight('Café au lait', 'cafe')
// [{ text: 'Café', match: true }, { text: ' au lait', match: false }]
```

- An empty query matches everything.
- `highlight` returns pieces of the original text, so you build the markup yourself with `textContent` and stay safe from HTML injection. Any query word is highlighted; decomposed accents (`e` + `◌́`) stay with their letter.
- `locale` changes how upper-case letters fold: with `{ locale: 'tr' }`, `I` folds like `ı`.

## Sorting

`compareNatural(a, b, { locale, sensitivity })` uses `Intl.Collator` with numeric ordering and a cached collator per locale. Pass it straight to `sort`:

```js
;['file10', 'file2', 'File1'].sort(compareNatural) // ['File1', 'file2', 'file10']
;['zebra', 'Éclair', 'espresso'].sort(compareNatural) // ['Éclair', 'espresso', 'zebra']
```

`sensitivity` defaults to `'base'` (accents and case are equal); use `'accent'`, `'case'` or `'variant'` to tell them apart.

## Typos

- `distance(a, b)`: Levenshtein distance in code points. `('kitten', 'sitting')` → `3`.
- `similarity(a, b, { fold })`: from `0` to `1`, folded by default. `('Mexico', 'México')` → `1`.
- `closest(input, candidates, { threshold })`: the most similar candidate, or `undefined` below `threshold` (`0.5`). `('pina colda', ['Café au lait', 'Piña colada'])` → `'Piña colada'`.

`closest` also compares the input with the start of each word of longer candidates (`partial`, on by default, for inputs of three characters or more), so `matcah` finds `Iced matcha latte` and `pina` finds `Frozen piña colada`. A whole match scores a little higher than a partial one. `similarity` alone always compares whole strings.

## Filtering a list

`data-string-search="<field selector>"` filters a list as the user types. The browser bundle starts it on its own; with a bundler, call `search()` or `autoSearch()` from `@samline/string/vanilla`.

```html
<input id="q" type="search" />
<ul data-string-search="#q">
  <li>Café au lait</li>
  <li>Piña colada</li>
  <li hidden data-string-search-empty>No results</li>
</ul>
```

- Items that do not match get `hidden`; matching text is wrapped in `<mark>`, inside nested markup too. Style it with `[data-string-search] mark`.
- Items are the list's direct children, or `data-string-search-items=".row"`. Items hidden in the HTML stay hidden and are not searched.
- The `data-string-search-empty` child (or the `empty` option) shows only when nothing matches. Hide it in the HTML so it stays hidden without JavaScript.
- `data-string-search-state` is `idle` (query shorter than `min`), `results` or `empty`.
- Every search dispatches a bubbling `string:search` event and calls `onSearch(result, list)`. The result has `query`, `matches` (the matching items), `total` and `state`.
- `destroy()` removes every mark, puts back the original text nodes and restores every `hidden` attribute.

| Attribute                      | Option      | Default         |
| ------------------------------ | ----------- | --------------- |
| `data-string-search`           | `input`     | –               |
| `data-string-search-items`     | `items`     | Direct children |
| `data-string-search-highlight` | `highlight` | `true`          |
| `data-string-search-min`       | `min`       | `1`             |
| `data-string-search-split`     | `split`     | `true`          |
| `data-string-search-locale`    | `locale`    | Closest `lang`  |
| –                              | `empty`     | Empty child     |
| –                              | `onSearch`  | –               |

Attributes win over options. `refresh()` collects the items again after you add or remove some.
