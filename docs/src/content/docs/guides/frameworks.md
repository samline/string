---
locale: en
sidebar:
  group: guides
  order: 5
title: 'Framework integrations'
titleAccent: 'integrations'
description: Use @samline/string in Node.js, React, Vue, Svelte, Astro, Shopify and WordPress. The functions are pure, so there is no adapter and no lifecycle to manage.
---

`@samline/string` has no framework adapter. The functions in the package root are pure: they take text and return text, never touch the DOM and have no setup or cleanup. Import them where you need them, in a component, a computed value, a server route or a build script. They work wherever `Intl.Segmenter` does (modern browsers, Node 20 or newer, workers and edge runtimes).

```sh
pnpm add @samline/string
```

## Node.js

The package root is plain ESM (CommonJS works too) and needs no DOM: import a function and call it. Only `@samline/string/vanilla` and the browser bundle touch the DOM, and they do nothing without one.

```js
import { slugify, wordCount } from '@samline/string'

slugify('Hello, Crème Brûlée & Café!') // 'hello-creme-brulee-cafe'
wordCount('One small script') // 3
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

## Shopify

Copy `dist/browser/string.global.js` of the pinned release into the theme's `assets/` folder and load it once in `layout/theme.liquid`. It defines `window.Strings` and starts every `[data-string]` element in the page.

```liquid
<script src="{{ 'string.global.js' | asset_url }}" defer></script>
```

The bundle also watches for elements added or removed later, so sections that the theme editor loads and unloads need no extra code when you use data attributes. To own the lifecycle yourself, add `data-manual` to the script tag and convert each section on `shopify:section:load`; `Strings.string()` returns a controller whose `destroy()` you call on `shopify:section:unload`. `event.target` is the section element. Run `mount` once for the sections already on the page.

```liquid
<script src="{{ 'string.global.js' | asset_url }}" data-manual defer></script>
```

```js
const controllers = new Map()

const mount = root => {
  controllers.set(root, window.Strings.string(root.querySelectorAll('[data-string]')))
}

document.addEventListener('shopify:section:load', event => mount(event.target))
document.addEventListener('shopify:section:unload', event => {
  controllers.get(event.target)?.destroy()
  controllers.delete(event.target)
})
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.shopify-section').forEach(mount)
})
```

See [Shopify's section events](https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks).

## WordPress

Enqueue the pinned classic script from your theme or plugin, deferred, on the front end. `'strategy' => 'defer'` needs WordPress 6.3 or newer.

```php
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_script(
    'samline-string',
    'https://cdn.jsdelivr.net/npm/@samline/string@2.1.0/dist/browser/string.global.js',
    [],
    null,
    ['strategy' => 'defer', 'in_footer' => true]
  );
});
```

Once the DOM is ready the bundle starts every `[data-string]`, `[data-string-search]`, `[data-string-count]`, `[data-string-fit]` and `[data-string-copy]` element in the rendered content, so a Custom HTML block like this needs no JavaScript of its own. Call the functions from your own script through `window.Strings` and list `samline-string` as its dependency.

```html
<input id="title" value="Café & Crème" /> <input data-string="slug" data-string-source="#title" />
```

See [wp_enqueue_script](https://developer.wordpress.org/reference/functions/wp_enqueue_script/).

## Plain HTML and CDN

Load the browser bundle with a classic script tag and pin the version in production. It defines `window.Strings` (not `window.String`, which is JavaScript's own constructor) with every function, and starts every `[data-string]` element on its own.

```html
<script src="https://cdn.jsdelivr.net/npm/@samline/string@2.1.0/dist/browser/string.global.js"></script>
<script>
  const { slugify } = window.Strings
  console.log(slugify('Café & Crème')) // 'cafe-creme'
</script>
```

Add `data-manual` to the script tag to start the attribute layer yourself with `Strings.auto(options)`.
