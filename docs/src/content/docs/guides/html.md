---
title: 'HTML attributes'
titleAccent: 'attributes'
description: Convert text and fields with data-string, follow another field, count characters, fit text to its box, copy converted text and color avatars.
locale: en
sidebar:
  group: guides
  order: 3
---

The HTML layer runs every conversion from attributes. The browser bundle starts it on its own; with a bundler, call `string()` or `autoString()` from `@samline/string/vanilla`.

```html
<h2 data-string="title" data-string-small-words="de, la">la casa de papel</h2>
<input id="title" value="Café & Té" />
<input data-string="slug" data-string-source="#title" data-string-replacements='{"&": "y"}' />
```

```js
import { autoString, string } from '@samline/string/vanilla'

const controller = string() // every [data-string] element now
const auto = autoString() // the same, and elements added later
controller.refresh() // read the attributes again
controller.destroy() // remove listeners and restore the original markup
```

Without a DOM both return an inert controller, so they are safe to import on the server.

## Elements

`data-string="<conversion>"` replaces the element's text with the converted text. The value is any name from [`CONVERSIONS`](../../reference/api/#conversions-by-name): `camel`, `pascal`, `kebab`, `snake`, `dot`, `path`, `constant`, `train`, `title`, `sentence`, `capitalize`, `uncapitalize`, `lower`, `upper`, `slug`, `accents`, `truncate` and `initials`. Write the readable text in the HTML: it stays visible without JavaScript and for search engines.

- The original child nodes come back on `destroy()`. When the text is already converted, the markup is left untouched.
- `truncate` puts the full text in `title`; `initials` sets `role="img"` and `aria-label` to the full name. An attribute you wrote yourself always wins and is never removed.

## Fields

On an `<input>` or `<textarea>` the value is converted while the user types and once more on blur.

- A separator the user just typed is kept until blur, so `kebab` shows `hello-` and then `hello-world`, and `slug` uses `trim: false` while typing.
- The caret keeps its distance from the end of the value, and nothing is converted during IME composition.
- `data-string-live="false"` converts on blur only. `truncate` and `initials` always wait for blur.
- Blur is used instead of `change` because Safari skips `change` when a script edited the value during input.

## Following another field

`data-string-source="<selector>"` feeds the element from another input, textarea or element.

- A field fills itself from the source while `data-string-state="following"`. Typing in it switches to `edited`, and the source no longer overwrites it. Emptying it goes back to `following`, and blur fills it again.
- A field that starts with its own value, different from the converted source, starts as `edited`.
- A preview element (`<code>`, `<span>`) shows the converted source as it changes.
- Sources chain: a preview can follow a slug field that follows a title.

## Options

Attributes win over JavaScript options. Every option of [`convert`](../../reference/configuration/#convert) is available:

| Attribute                   | Option         | Applies to                                        |
| --------------------------- | -------------- | ------------------------------------------------- |
| `data-string`               | `to`           | Every element.                                    |
| `data-string-source`        | `source`       | Every element.                                    |
| `data-string-live`          | `live`         | Fields.                                           |
| `data-string-locale`        | `locale`       | Every conversion.                                 |
| `data-string-small-words`   | `smallWords`   | `title`.                                          |
| `data-string-separator`     | `separator`    | `slug`.                                           |
| `data-string-lower`         | `lower`        | `slug`.                                           |
| `data-string-max-length`    | `maxLength`    | `slug`.                                           |
| `data-string-replacements`  | `replacements` | `slug`, as JSON.                                  |
| `data-string-preserve`      | `preserve`     | `slug`.                                           |
| `data-string-taken`         | `taken`        | `slug`, as a JSON array or a comma list.          |
| `data-string-transliterate` | `charMap`      | `slug`, `accents`: `cyrillic`, `greek`, `german`. |
| `data-string-length`        | `length`       | `truncate`.                                       |
| `data-string-position`      | `position`     | `truncate`.                                       |
| `data-string-ellipsis`      | `ellipsis`     | `truncate`.                                       |
| `data-string-word-boundary` | `wordBoundary` | `truncate`.                                       |
| `data-string-max`           | `max`          | `initials`.                                       |

Without `data-string-locale` or a `locale` option, the element uses the `lang` of its closest ancestor, so `<html lang="tr">` makes `istanbul` upper-case to `İSTANBUL`. `smallWords` accepts commas or spaces. Invalid JSON in `data-string-replacements` is ignored. A field with `data-string-taken` keeps what the user types while they type and moves to the first free slug on blur; while it follows its source, it is always free.

## State and events

- `data-string-state` is `ready`, `following` or `edited`. Style or test against it.
- Every conversion that changes the text dispatches a bubbling `string:change` event with `detail: { value, state }`, and calls the `onChange(value, element)` option.

```js
slug.addEventListener('string:change', event => {
  save.disabled = event.detail.value === ''
})
```

## Colors

`data-string-color` (or `{ color: true }`) sets the `--string-color` custom property to a stable color for the element's original text, so every "Ana López" avatar gets the same hue. Use it in CSS with a fallback: `background: var(--string-color, #475569)`. Lightness is lowered as needed so white text on it keeps a 4.5:1 contrast. Pass `{ color: { saturation, lightness, contrast } }` to tune it; `hashColor(text)` returns the same color in code.

## Counters

`data-string-count="<field selector>"` shows how many characters or words a field has, or how many are left.

```html
<textarea id="bio" maxlength="160"></textarea>
<output data-string-count="#bio" data-string-count-format="{remaining} characters left"></output>
```

- Characters are graphemes, so 😀 counts as one. `maxlength` counts UTF-16 units, so an emoji uses two of the field's limit; set `data-string-count-max` to count against your own limit instead.
- `data-string-count-unit="words"` counts words with `Intl.Segmenter`.
- `data-string-count-format` is a template with `{count}`, `{max}` and `{remaining}`; the default is `{remaining}` with a maximum and `{count}` without. The `format` option also takes a function.
- `data-string-count-state` is `ok`, `near` (at most `data-string-count-near` left, 10% of the maximum by default) or `over`.
- Every update dispatches `string:count` with `{ count, max, remaining, state }` and calls `onCount`.
- `<output>` is announced politely by screen readers; on another element, add `aria-live="polite"` yourself if you want every change announced.

## Fitting text to its box

`data-string-fit` shortens text until it fits the element's width, cutting in the middle by default, and fits again when the element resizes (`ResizeObserver`, or window resize as the fallback) and when web fonts load.

```html
<span data-string-fit style="display: block">annual-report-2026-final-version.pdf</span>
<span data-string-fit="end" data-string-fit-ellipsis="...">A long title</span>
```

- The value is the position: `middle` (default), `end` or `start`.
- The element needs a width: a block, inline-block, flex or grid item. Without one, the text is left whole. Flex items also need `min-width: 0`.
- The full text goes to `title`, `data-string-fit-state` is `full` or `truncated`, and `white-space: nowrap` and `overflow: hidden` are set inline. `destroy()` restores the text, the title and the `style` attribute.

## Copy buttons

`data-string-copy="<source selector>"` copies the source's text (a field's value) to the clipboard on click, converted with `data-string-copy-as="<conversion>"` when given.

```html
<input id="name" value="Ana María López" />
<button type="button" data-string-copy="#name" data-string-copy-as="slug">Copy handle</button>
```

- Without the Clipboard API (plain HTTP, some iframes), or when it refuses, the text is copied from a hidden selection instead.
- The button gets `data-string-copy-state="copied"`, or `error` when no copy succeeded, for `data-string-copy-reset` milliseconds (`2000`). Style it: `[data-string-copy-state='copied']::after { content: ' · Copied' }`.
- Every click dispatches `string:copy` with `{ value, ok }` and calls `onCopy`.
- The clipboard needs a secure context (HTTPS or localhost).

## Browser bundle

The classic script starts every `[data-string]`, `[data-string-search]`, `[data-string-count]`, `[data-string-fit]` and `[data-string-copy]` element when the DOM is ready, including elements added later, and keeps the controller in `Strings.controller`. Add `data-manual` to the script tag to start it yourself; `scope` and `locale` go to every behavior, and each takes its own options under `search`, `count`, `fit` and `copy`:

```html
<script
  data-manual
  src="https://cdn.jsdelivr.net/npm/@samline/string@2.0.1/dist/browser/string.global.js"
></script>
<script>
  Strings.auto({ locale: 'es', count: { near: 5 }, copy: { reset: 1000 } })
</script>
```
