---
locale: en
sidebar:
  group: guides
  order: 5
title: 'Framework integrations'
titleAccent: 'integrations'
description: Use @samline/string in React, Vue, Svelte, Astro and plain HTML or CDN pages. The functions are pure, so there is no adapter and no lifecycle to manage.
---

`@samline/string` has no framework adapter. The functions in the package root are pure: they take text and return text, never touch the DOM and have no setup or cleanup. Import them where you need them, in a component, a computed value, a server route or a build script. They work wherever `Intl.Segmenter` does (modern browsers, Node 20 or newer, workers and edge runtimes).

```sh
pnpm add @samline/string
```

## React

Call the functions while rendering. Derived values need no state or effect.

```jsx
import { initials, slugify, truncate } from '@samline/string'
import { useState } from 'react'

export function PostForm() {
  const [title, setTitle] = useState('')

  return (
    <form>
      <label>
        Title
        <input value={title} onChange={event => setTitle(event.target.value)} />
      </label>
      <p>URL: /blog/{slugify(title)}</p>
      <p>Preview: {truncate(title, 30)}</p>
      <span aria-hidden="true">{initials('Samuel Olvera')}</span>
    </form>
  )
}
```

## Vue

```vue
<script setup>
import { computed, ref } from 'vue'
import { slugify, truncate } from '@samline/string'

const title = ref('')
const slug = computed(() => slugify(title.value))
const preview = computed(() => truncate(title.value, 30))
</script>

<template>
  <label>
    Title
    <input v-model="title" />
  </label>
  <p>URL: /blog/{{ slug }}</p>
  <p>Preview: {{ preview }}</p>
</template>
```

## Svelte

```svelte
<script>
  import { slugify, truncate } from '@samline/string'

  let title = ''
  $: slug = slugify(title)
  $: preview = truncate(title, 30)
</script>

<label>
  Title
  <input bind:value={title} />
</label>
<p>URL: /blog/{slug}</p>
<p>Preview: {preview}</p>
```

## Astro

Because the functions are pure, they run in the frontmatter at build or request time, and the page ships no JavaScript for them.

```astro
---
import { slugify, titleCase } from '@samline/string'

const { title } = Astro.props
---

<h1>{titleCase(title, { smallWords: ['de', 'la'] })}</h1>
<a href={`/blog/${slugify(title)}/`}>Read more</a>
```

For live behavior in the browser, call them from a client `<script>` the same way, or use the optional HTML layer from `@samline/string/vanilla`. Its `string()` converts every `[data-string]` element and returns `{ refresh, destroy }`; this is the only part of the package that touches the DOM, and it does nothing without one. See [HTML attributes](../html/).

## Plain HTML and CDN

Load the browser bundle with a classic script tag and pin the version in production. It defines `window.Strings` (not `window.String`, which is JavaScript's own constructor) with every function, and starts every `[data-string]` element on its own.

```html
<script src="https://cdn.jsdelivr.net/npm/@samline/string@2.0.1/dist/browser/string.global.js"></script>
<script>
  const { slugify } = window.Strings
  console.log(slugify('Café & Té')) // 'cafe-te'
</script>
```

The same bundle works in Shopify themes and WordPress templates. Add `data-manual` to the script tag to start the attribute layer yourself with `Strings.auto(options)`.
