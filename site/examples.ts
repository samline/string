// Copyable files load the published browser bundle (window.SamlineString);
// the previews in examples/*.astro import the package itself.
export default [
  {
    id: 'slug',
    tab: 'Slug field',
    title: 'Fill a URL slug from the title',
    description:
      'Attributes only: the slug follows the title until the user edits it, keeps a typed separator while typing, trims on blur and follows again when emptied. The URL preview follows the slug.',
    files: {
      html: `<label for="title">Title</label>
<input id="title" type="text" value="Café & Té: Guía 2026" />
<label for="slug">Slug</label>
<input
  id="slug"
  type="text"
  data-string="slug"
  data-string-source="#title"
  data-string-replacements='{"&": "y"}'
/>
<p>example.com/blog/<code data-string="slug" data-string-source="#slug"></code></p>
<p id="status"></p>`,
      css: `label { display: block; margin-top: 0.75rem; font-weight: 600; }
input { width: 100%; max-width: 28rem; padding: 0.5rem; font: inherit; }`,
      js: `// The browser bundle converts every [data-string] element when the page loads.
const slug = document.querySelector('#slug')
const status = document.querySelector('#status')
const show = () =>
  (status.textContent =
    slug.dataset.stringState === 'edited'
      ? 'Edited by hand. Empty the field to follow the title again.'
      : 'Follows the title.')
slug.addEventListener('string:change', show)
slug.addEventListener('input', show)
show()`,
      esm: `import { string } from '@samline/string/vanilla'

string()

const slug = document.querySelector('#slug')
const status = document.querySelector('#status')
const show = () =>
  (status.textContent =
    slug.dataset.stringState === 'edited'
      ? 'Edited by hand. Empty the field to follow the title again.'
      : 'Follows the title.')
slug.addEventListener('string:change', show)
slug.addEventListener('input', show)
show()`,
    },
  },
  {
    id: 'markup',
    tab: 'From HTML',
    title: 'Convert text with attributes',
    description:
      'data-string converts any element: initials become labelled avatars, long file names keep both ends with a title holding the full name, and headings get title case. The original markup comes back on destroy().',
    files: {
      html: `<ul class="files">
  <li>
    <span class="avatar" data-string="initials">Samuel Olvera</span>
    <span data-string="truncate" data-string-length="22" data-string-position="middle">annual-report-2026-final-v3.pdf</span>
  </li>
  <li>
    <span class="avatar" data-string="initials">ana maría lópez</span>
    <span data-string="truncate" data-string-length="22" data-string-position="middle">brand-guidelines-spanish-edition.fig</span>
  </li>
</ul>
<p>Header: <code data-string="train">content security policy</code></p>
<p>Env var: <code data-string="constant">api base url</code></p>
<h3 data-string="title" data-string-small-words="de, la, el">la casa de papel</h3>`,
      css: `.files { list-style: none; padding: 0; display: grid; gap: 0.75rem; }
.files li { display: flex; gap: 0.75rem; align-items: center; }
.avatar { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #475569; color: white; font-weight: 600; }`,
      js: `// Nothing to call: the browser bundle converts every [data-string] element,
// including elements added later. Add data-manual to the script tag and call
// SamlineString.auto() to start it yourself.
const { auto } = window.SamlineString
const controller = auto()
console.log('Converted', document.querySelectorAll('[data-string-state]').length, 'elements')
// controller.destroy() restores the original text.`,
      esm: `import { autoString } from '@samline/string/vanilla'

const controller = autoString()
console.log('Converted', document.querySelectorAll('[data-string-state]').length, 'elements')
// controller.destroy() restores the original text.`,
    },
  },
  {
    id: 'keys',
    tab: 'Data keys',
    title: 'Normalize keys from an API',
    description:
      'Convert snake_case API fields to camelCase for JavaScript and back to snake_case before sending.',
    files: {
      html: `<pre id="output"></pre>`,
      css: `pre { padding: 1rem; background: #f4f4f2; }`,
      js: `const { camelCase, snakeCase } = window.SamlineString
const mapKeys = (object, convert) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [convert(key), value]))

const fromApi = { user_id: 7, first_name: 'Ana', last_login_at: '2026-11-13' }
const forJs = mapKeys(fromApi, camelCase)
const back = mapKeys(forJs, snakeCase)

document.querySelector('#output').textContent = JSON.stringify({ forJs, back }, null, 2)`,
      esm: `import { camelCase, snakeCase } from '@samline/string'

const mapKeys = (object, convert) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [convert(key), value]))

const fromApi = { user_id: 7, first_name: 'Ana', last_login_at: '2026-11-13' }
const forJs = mapKeys(fromApi, camelCase)
const back = mapKeys(forJs, snakeCase)

document.querySelector('#output').textContent = JSON.stringify({ forJs, back }, null, 2)`,
    },
  },
  {
    id: 'cards',
    tab: 'Cards',
    title: 'Avatars and excerpts for a list',
    description:
      'initials builds avatar letters and truncate shortens text at a word boundary without splitting accents or emoji.',
    files: {
      html: `<ul id="people"></ul>`,
      css: `ul { list-style: none; padding: 0; display: grid; gap: 0.75rem; }
li { display: flex; gap: 0.75rem; align-items: center; }
.avatar { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #475569; color: white; font-weight: 600; }`,
      js: `const { initials, truncate } = window.SamlineString
const people = [
  { name: 'Samuel Olvera', bio: 'Builds small, framework-agnostic utilities for the open web.' },
  { name: 'ana maría lópez', bio: 'Diseña interfaces accesibles y escribe sobre tipografía en español.' },
]

document.querySelector('#people').replaceChildren(
  ...people.map(person => {
    const item = document.createElement('li')
    const avatar = Object.assign(document.createElement('span'), {
      className: 'avatar',
      textContent: initials(person.name),
    })
    const text = Object.assign(document.createElement('span'), {
      textContent: truncate(person.bio, 40),
    })
    item.append(avatar, text)
    return item
  })
)`,
      esm: `import { initials, truncate } from '@samline/string'

const people = [
  { name: 'Samuel Olvera', bio: 'Builds small, framework-agnostic utilities for the open web.' },
  { name: 'ana maría lópez', bio: 'Diseña interfaces accesibles y escribe sobre tipografía en español.' },
]

document.querySelector('#people').replaceChildren(
  ...people.map(person => {
    const item = document.createElement('li')
    const avatar = Object.assign(document.createElement('span'), {
      className: 'avatar',
      textContent: initials(person.name),
    })
    const text = Object.assign(document.createElement('span'), {
      textContent: truncate(person.bio, 40),
    })
    item.append(avatar, text)
    return item
  })
)`,
    },
  },
] as const
