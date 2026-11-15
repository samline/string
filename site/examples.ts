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
    id: 'unique',
    tab: 'Unique slugs',
    title: 'Avoid duplicate slugs in any script',
    description:
      'data-string-transliterate turns Cyrillic, Greek and German umlauts into Latin letters, and data-string-taken picks the first free slug (privet-mir-3) when the field loses focus or follows the title.',
    files: {
      html: `<label for="post-title">Post title</label>
<input id="post-title" type="text" value="Привет, мир" />
<label for="post-slug">Slug</label>
<input
  id="post-slug"
  type="text"
  data-string="slug"
  data-string-source="#post-title"
  data-string-transliterate="cyrillic, greek, german"
  data-string-taken='["privet-mir", "privet-mir-2", "hello-world"]'
/>
<p>Taken: privet-mir, privet-mir-2, hello-world</p>`,
      css: `label { display: block; margin-top: 0.75rem; font-weight: 600; }
input { width: 100%; max-width: 28rem; padding: 0.5rem; font: inherit; }`,
      js: `// The browser bundle reads every attribute; nothing to call.
// In a CMS, render data-string-taken from the slugs already in use,
// leaving out the slug of the post being edited.`,
      esm: `import { string } from '@samline/string/vanilla'

// In a CMS, render data-string-taken from the slugs already in use,
// leaving out the slug of the post being edited.
string()`,
    },
  },
  {
    id: 'profile',
    tab: 'Profile',
    title: 'Avatars, fitted file names, counters and copy',
    description:
      'data-string-color gives each name a stable color, data-string-fit cuts the file name in the middle to fit its box, data-string-count shows the characters left and data-string-copy copies the name as a slug.',
    files: {
      html: `<div class="profile">
  <span class="avatar" data-string="initials" data-string-color>Ana María López</span>
  <span class="file" data-string-fit>curriculum-ana-maria-lopez-2026-version-final.pdf</span>
</div>
<label for="bio">Bio</label>
<textarea id="bio" maxlength="80" rows="3">Diseño interfaces accesibles 🎨</textarea>
<output data-string-count="#bio" data-string-count-format="{remaining} characters left"></output>
<label for="handle">Display name</label>
<input id="handle" value="Ana María López" />
<button type="button" data-string-copy="#handle" data-string-copy-as="slug">Copy as handle</button>`,
      css: `.profile { display: flex; gap: 0.75rem; align-items: center; max-width: 18rem; }
.avatar { display: grid; place-items: center; flex: none; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: var(--string-color, #475569); color: white; font-weight: 600; }
.file { display: block; min-width: 0; flex: 1; }
label { display: block; margin-top: 0.75rem; font-weight: 600; }
textarea, input { width: 100%; max-width: 28rem; padding: 0.5rem; font: inherit; }
[data-string-count-state='near'] { color: #b45309; }
[data-string-count-state='over'] { color: #b91c1c; }
[data-string-copy-state='copied']::after { content: ' ✓'; }`,
      js: `// The browser bundle starts every data-string-* element on load: the avatar gets
// a stable --string-color, the file name fits its box, the counter follows the bio
// and the button copies the name as a slug.
document.addEventListener('string:copy', event => {
  console.log(event.detail.ok ? \`Copied \${event.detail.value}\` : 'Copy failed')
})`,
      esm: `import { autoCopy, autoCount, autoFit, autoString } from '@samline/string/vanilla'

autoString()
autoFit()
autoCount()
autoCopy()

document.addEventListener('string:copy', event => {
  console.log(event.detail.ok ? \`Copied \${event.detail.value}\` : 'Copy failed')
})`,
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
    id: 'search',
    tab: 'Search',
    title: 'Filter a list ignoring accents',
    description:
      'data-string-search filters the list as the user types: cafe finds Café, matches are wrapped in mark, and the empty message shows when nothing matches. closest() suggests the nearest drink for a typo.',
    files: {
      html: `<label for="q">Search drinks</label>
<input id="q" type="search" autocomplete="off" />
<ul id="drinks" data-string-search="#q">
  <li>Café de olla</li>
  <li>Té verde</li>
  <li>Chocolate mexicano</li>
  <li>Horchata de arroz</li>
  <li>Jamaica con limón</li>
  <li hidden data-string-search-empty>No drinks match.</li>
</ul>
<p id="hint" aria-live="polite"></p>`,
      css: `label { display: block; font-weight: 600; }
input { width: 100%; max-width: 28rem; padding: 0.5rem; font: inherit; }
mark { background: #fde68a; color: inherit; border-radius: 0.125rem; }`,
      js: `const { closest } = window.SamlineString
const drinks = ['Café de olla', 'Té verde', 'Chocolate mexicano', 'Horchata de arroz', 'Jamaica con limón']
const hint = document.querySelector('#hint')
document.querySelector('#drinks').addEventListener('string:search', event => {
  const { query, matches, state } = event.detail
  const guess = state === 'empty' ? closest(query, drinks) : undefined
  hint.textContent = guess
    ? \`Did you mean \${guess}?\`
    : state === 'results'
      ? \`\${matches.length} of \${drinks.length} drinks\`
      : ''
})`,
      esm: `import { closest, search } from '@samline/string/vanilla'

const drinks = ['Café de olla', 'Té verde', 'Chocolate mexicano', 'Horchata de arroz', 'Jamaica con limón']
const hint = document.querySelector('#hint')
document.querySelector('#drinks').addEventListener('string:search', event => {
  const { query, matches, state } = event.detail
  const guess = state === 'empty' ? closest(query, drinks) : undefined
  hint.textContent = guess
    ? \`Did you mean \${guess}?\`
    : state === 'results'
      ? \`\${matches.length} of \${drinks.length} drinks\`
      : ''
})
search()`,
    },
  },
  {
    id: 'article',
    tab: 'Article meta',
    title: 'Reading time, plurals and excerpts',
    description:
      'readingTime counts words with Intl.Segmenter, pluralize picks the right form for the language, stripTags and truncate build a plain-text excerpt, and template fills placeholders.',
    files: {
      html: `<article id="post">
  <h2>Café de olla</h2>
  <p>El <b>café de olla</b> se prepara con canela y piloncillo en una olla de barro.</p>
  <p>Hierve el agua, añade el piloncillo y la canela, y deja reposar el café cinco minutos antes de colarlo.</p>
</article>
<p id="meta"></p>
<p id="excerpt"></p>
<p id="greeting"></p>`,
      css: `#meta { color: #475569; font-size: 0.875rem; }`,
      js: `const { pluralize, readingTime, stripTags, template, truncate } = window.SamlineString
const post = document.querySelector('#post')
const comments = 3
const { minutes, words } = readingTime(post.textContent, { locale: 'es' })

document.querySelector('#meta').textContent = [
  pluralize(minutes, { one: '# minuto de lectura', other: '# minutos de lectura' }, { locale: 'es' }),
  pluralize(words, { one: '# palabra', other: '# palabras' }, { locale: 'es' }),
  pluralize(comments, { zero: 'Sin comentarios', one: '# comentario', other: '# comentarios' }, { locale: 'es' }),
].join(' · ')

// Plain text from HTML for a meta description, cut at a word.
document.querySelector('#excerpt').textContent = truncate(stripTags(post.innerHTML), 90)

document.querySelector('#greeting').textContent = template('Hola {user.name}, tienes {count} borradores.', {
  user: { name: 'Ana' },
  count: 2,
})`,
      esm: `import { pluralize, readingTime, stripTags, template, truncate } from '@samline/string'

const post = document.querySelector('#post')
const comments = 3
const { minutes, words } = readingTime(post.textContent, { locale: 'es' })

document.querySelector('#meta').textContent = [
  pluralize(minutes, { one: '# minuto de lectura', other: '# minutos de lectura' }, { locale: 'es' }),
  pluralize(words, { one: '# palabra', other: '# palabras' }, { locale: 'es' }),
  pluralize(comments, { zero: 'Sin comentarios', one: '# comentario', other: '# comentarios' }, { locale: 'es' }),
].join(' · ')

// Plain text from HTML for a meta description, cut at a word.
document.querySelector('#excerpt').textContent = truncate(stripTags(post.innerHTML), 90)

document.querySelector('#greeting').textContent = template('Hola {user.name}, tienes {count} borradores.', {
  user: { name: 'Ana' },
  count: 2,
})`,
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
