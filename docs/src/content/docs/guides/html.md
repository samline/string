---
title: 'HTML attributes'
titleAccent: 'attributes'
description: Convert text and form fields from HTML with data-string, follow another field with data-string-source, and read the state and change events.
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

## Browser bundle

The classic script converts every `[data-string]` element when the DOM is ready, including elements added later, and keeps the controller in `SamlineString.controller`. Add `data-manual` to the script tag to start it yourself:

```html
<script
  data-manual
  src="https://cdn.jsdelivr.net/npm/@samline/string@1.2.0/dist/browser/string.global.js"
></script>
<script>
  SamlineString.auto({ locale: 'es' })
</script>
```
