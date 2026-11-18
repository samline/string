// Copyable files load the published browser bundle (window.Strings);
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
    id: 'tokens',
    tab: 'Naming',
    title: 'One name in every convention',
    description:
      'Type a name once, such as Año Nuevo banner, and read it as a CSS name, a JavaScript variable, an environment variable, a component and a translation key, each ready to copy. Attributes only: every code element follows the field with its own data-string conversion, and every button copies that version.',
    files: {
      html: `<label for="token">Name</label>
<input id="token" type="text" value="Primary button hover" />
<dl class="names">
  <div>
    <dt>CSS name</dt>
    <dd><code data-string="kebab" data-string-source="#token"></code></dd>
    <dd><button type="button" data-string-copy="#token" data-string-copy-as="kebab" aria-label="Copy the CSS name">Copy</button></dd>
  </div>
  <div>
    <dt>JavaScript</dt>
    <dd><code data-string="camel" data-string-source="#token"></code></dd>
    <dd><button type="button" data-string-copy="#token" data-string-copy-as="camel" aria-label="Copy the JavaScript name">Copy</button></dd>
  </div>
  <div>
    <dt>Environment variable</dt>
    <dd><code data-string="constant" data-string-source="#token"></code></dd>
    <dd><button type="button" data-string-copy="#token" data-string-copy-as="constant" aria-label="Copy the environment variable">Copy</button></dd>
  </div>
  <div>
    <dt>Component</dt>
    <dd><code data-string="pascal" data-string-source="#token"></code></dd>
    <dd><button type="button" data-string-copy="#token" data-string-copy-as="pascal" aria-label="Copy the component name">Copy</button></dd>
  </div>
  <div>
    <dt>Translation key</dt>
    <dd><code data-string="dot" data-string-source="#token"></code></dd>
    <dd><button type="button" data-string-copy="#token" data-string-copy-as="dot" aria-label="Copy the translation key">Copy</button></dd>
  </div>
</dl>`,
      css: `label { display: block; font-weight: 600; }
input { width: 100%; max-width: 28rem; padding: 0.5rem; font: inherit; }
.names { display: grid; gap: 0.5rem; margin: 1rem 0 0; }
.names div { display: grid; grid-template-columns: 11rem 1fr auto; gap: 0.75rem; align-items: center; }
.names dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
[data-string-copy-state='copied']::after { content: ' · Copied'; }`,
      js: `// Nothing to call: the browser bundle starts every data-string-* attribute.
// Each <code> follows #token with its own conversion and each button copies it.
document.addEventListener('string:copy', event => {
  console.log(event.detail.ok ? \`Copied \${event.detail.value}\` : 'Copy failed')
})`,
      esm: `import { autoCopy, autoString } from '@samline/string/vanilla'

autoString()
autoCopy()

document.addEventListener('string:copy', event => {
  console.log(event.detail.ok ? \`Copied \${event.detail.value}\` : 'Copy failed')
})`,
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
[data-string-copy-state='copied']::after { content: ' · Copied'; }`,
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
      js: `// Nothing to call: the browser bundle converts every [data-string] element when the
// page loads, including elements added later. Strings.controller.destroy()
// restores the original text. Add data-manual to the script tag to start it
// yourself with Strings.auto(options).`,
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
      js: `const { closest } = window.Strings
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
    id: 'suggest',
    tab: 'Suggestions',
    title: 'Suggestions that forgive accents and typos',
    description:
      'Type peru, cote or turk: contains matches names without caring about accents or case, and highlight returns the matching pieces of the original name, marked here without innerHTML. Type a typo such as mexcio and closest suggests the nearest country.',
    files: {
      html: `<label for="country">Country</label>
<input id="country" type="search" autocomplete="off" aria-describedby="country-status" />
<p id="country-status" aria-live="polite"></p>
<ul id="countries"></ul>`,
      css: `label { display: block; font-weight: 600; }
input { width: 100%; max-width: 28rem; padding: 0.5rem; font: inherit; }
mark { background: #fde68a; color: inherit; border-radius: 0.125rem; }`,
      js: `const { closest, contains, highlight } = window.Strings
const countries = ['México', 'Perú', 'Panamá', 'España', 'Japón', 'Canadá', 'Brasil', 'Bélgica', 'Türkiye', "Côte d'Ivoire"]
const input = document.querySelector('#country')
const list = document.querySelector('#countries')
const status = document.querySelector('#country-status')

// highlight() returns pieces of the original name: mark them with textContent, never innerHTML.
const marked = name =>
  highlight(name, input.value).map(({ text, match }) =>
    match ? Object.assign(document.createElement('mark'), { textContent: text }) : text
  )

const update = () => {
  const query = input.value.trim()
  const found = query ? countries.filter(name => contains(name, query)) : []
  list.replaceChildren(
    ...found.map(name => {
      const item = document.createElement('li')
      item.append(...marked(name))
      return item
    })
  )
  const guess = query && !found.length ? closest(query, countries) : undefined
  status.textContent = !query
    ? 'Type a country, with or without accents.'
    : guess
      ? \`No match. Did you mean \${guess}?\`
      : found.length
        ? \`\${found.length} found\`
        : 'No match.'
}
input.addEventListener('input', update)
update()`,
      esm: `import { closest, contains, highlight } from '@samline/string'

const countries = ['México', 'Perú', 'Panamá', 'España', 'Japón', 'Canadá', 'Brasil', 'Bélgica', 'Türkiye', "Côte d'Ivoire"]
const input = document.querySelector('#country')
const list = document.querySelector('#countries')
const status = document.querySelector('#country-status')

// highlight() returns pieces of the original name: mark them with textContent, never innerHTML.
const marked = name =>
  highlight(name, input.value).map(({ text, match }) =>
    match ? Object.assign(document.createElement('mark'), { textContent: text }) : text
  )

const update = () => {
  const query = input.value.trim()
  const found = query ? countries.filter(name => contains(name, query)) : []
  list.replaceChildren(
    ...found.map(name => {
      const item = document.createElement('li')
      item.append(...marked(name))
      return item
    })
  )
  const guess = query && !found.length ? closest(query, countries) : undefined
  status.textContent = !query
    ? 'Type a country, with or without accents.'
    : guess
      ? \`No match. Did you mean \${guess}?\`
      : found.length
        ? \`\${found.length} found\`
        : 'No match.'
}
input.addEventListener('input', update)
update()`,
    },
  },
  {
    id: 'files',
    tab: 'Sorting',
    title: 'Sort names the way people read them',
    description:
      'The same file names sorted twice. Plain sort() puts capitals first, accented names last and informe 10 before informe 2; compareNatural reads numbers as numbers and ignores case and accents. Add a name such as informe 3.pdf to see where each one puts it.',
    files: {
      html: `<form id="add-file">
  <label for="file-name">Add a file</label>
  <input id="file-name" type="text" value="informe 3.pdf" />
  <button type="submit">Add</button>
</form>
<div class="columns">
  <section>
    <h3><code>sort()</code></h3>
    <ol id="plain"></ol>
  </section>
  <section>
    <h3><code>sort(compareNatural)</code></h3>
    <ol id="natural"></ol>
  </section>
</div>`,
      css: `label { display: block; font-weight: 600; }
input { width: 100%; max-width: 20rem; padding: 0.5rem; font: inherit; }
.columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 1rem; }
h3 { font-size: 1rem; }`,
      js: `const { compareNatural } = window.Strings
const files = ['informe 10.pdf', 'Informe 2.pdf', 'índice.pdf', 'informe 1.pdf', 'foto 12.jpg', 'Foto 9.jpg']
const input = document.querySelector('#file-name')

const show = (list, names) =>
  list.replaceChildren(...names.map(name => Object.assign(document.createElement('li'), { textContent: name })))

const update = () => {
  show(document.querySelector('#plain'), [...files].sort())
  show(document.querySelector('#natural'), [...files].sort(compareNatural))
}

document.querySelector('#add-file').addEventListener('submit', event => {
  event.preventDefault()
  if (input.value.trim()) files.push(input.value.trim())
  input.value = ''
  update()
})
update()`,
      esm: `import { compareNatural } from '@samline/string'

const files = ['informe 10.pdf', 'Informe 2.pdf', 'índice.pdf', 'informe 1.pdf', 'foto 12.jpg', 'Foto 9.jpg']
const input = document.querySelector('#file-name')

const show = (list, names) =>
  list.replaceChildren(...names.map(name => Object.assign(document.createElement('li'), { textContent: name })))

const update = () => {
  show(document.querySelector('#plain'), [...files].sort())
  show(document.querySelector('#natural'), [...files].sort(compareNatural))
}

document.querySelector('#add-file').addEventListener('submit', event => {
  event.preventDefault()
  if (input.value.trim()) files.push(input.value.trim())
  input.value = ''
  update()
})
update()`,
    },
  },
  {
    id: 'convert',
    tab: 'By name',
    title: 'Choose the conversion at run time',
    description:
      'convert() takes the conversion by name, so it can come from a setting, a CMS field or a menu, and data-string accepts the same names. Pick any of the 18 names in CONVERSIONS, or edit the text; isConversion() checks a saved name before it is used.',
    files: {
      html: `<label for="phrase">Text</label>
<input id="phrase" type="text" value="Café con leche: receta rápida" />
<label for="conversion">Conversion</label>
<select id="conversion"></select>
<p>Result: <output id="result" for="phrase conversion"></output></p>`,
      css: `label { display: block; margin-top: 0.75rem; font-weight: 600; }
input, select { width: 100%; max-width: 28rem; padding: 0.5rem; font: inherit; }
output { font-family: ui-monospace, monospace; }`,
      js: `const { CONVERSIONS, convert, isConversion } = window.Strings
const input = document.querySelector('#phrase')
const select = document.querySelector('#conversion')
const result = document.querySelector('#result')

select.append(...CONVERSIONS.map(name => new Option(name, name)))
// A saved preference may come from anywhere: isConversion() checks it first.
const saved = 'kebab'
select.value = isConversion(saved) ? saved : 'camel'

const update = () => {
  result.textContent = convert(input.value, select.value, { length: 16 })
}
input.addEventListener('input', update)
select.addEventListener('change', update)
update()`,
      esm: `import { CONVERSIONS, convert, isConversion } from '@samline/string'

const input = document.querySelector('#phrase')
const select = document.querySelector('#conversion')
const result = document.querySelector('#result')

select.append(...CONVERSIONS.map(name => new Option(name, name)))
// A saved preference may come from anywhere: isConversion() checks it first.
const saved = 'kebab'
select.value = isConversion(saved) ? saved : 'camel'

const update = () => {
  result.textContent = convert(input.value, select.value, { length: 16 })
}
input.addEventListener('input', update)
select.addEventListener('change', update)
update()`,
    },
  },
  {
    id: 'composer',
    tab: 'Emoji-safe',
    title: 'Count and cut the characters people see',
    description:
      'JavaScript’s length counts UTF-16 units, so 👨‍👩‍👧 counts as 8 and slice() can cut it in half. graphemes, the counter and truncate count the characters people see instead. Add or remove emoji and compare the two counts and the two cuts.',
    files: {
      html: `<label for="post">Post</label>
<textarea id="post" rows="3">¡Listos! 👨‍👩‍👧 🇲🇽 ✈️</textarea>
<output data-string-count="#post" data-string-count-max="40" data-string-count-format="{remaining} of {max} characters left"></output>
<dl class="stats">
  <dt><code>post.length</code></dt>
  <dd id="units"></dd>
  <dt><code>graphemes(post).length</code></dt>
  <dd id="chars"></dd>
  <dt><code>post.slice(0, 11) + '…'</code></dt>
  <dd id="sliced"></dd>
  <dt><code>truncate(post, 12)</code></dt>
  <dd id="truncated"></dd>
</dl>`,
      css: `label { display: block; font-weight: 600; }
textarea { width: 100%; max-width: 28rem; padding: 0.5rem; font: inherit; }
.stats { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 1rem; }
.stats dd { margin: 0; }
[data-string-count-state='near'] { color: #b45309; }
[data-string-count-state='over'] { color: #b91c1c; }`,
      js: `// The browser bundle starts the counter; the rest compares the two ways of counting.
const { graphemes, truncate } = window.Strings
const post = document.querySelector('#post')

const update = () => {
  const text = post.value
  document.querySelector('#units').textContent = text.length
  document.querySelector('#chars').textContent = graphemes(text).length
  document.querySelector('#sliced').textContent = text.slice(0, 11) + '…'
  document.querySelector('#truncated').textContent = truncate(text, 12)
}
post.addEventListener('input', update)
update()`,
      esm: `import { autoCount, graphemes, truncate } from '@samline/string/vanilla'

autoCount()
const post = document.querySelector('#post')

const update = () => {
  const text = post.value
  document.querySelector('#units').textContent = text.length
  document.querySelector('#chars').textContent = graphemes(text).length
  document.querySelector('#sliced').textContent = text.slice(0, 11) + '…'
  document.querySelector('#truncated').textContent = truncate(text, 12)
}
post.addEventListener('input', update)
update()`,
    },
  },
  {
    id: 'plurals',
    tab: 'Plurals',
    title: 'Plurals and ordinals in any language',
    description:
      'Change the number and every row picks its own form with Intl.PluralRules: English has two, Polish and Russian also use few and many (2 pliki, 5 plików, 22 pliki), Spanish shows its zero text for 0, and ordinals pick st, nd, rd or th.',
    files: {
      html: `<label for="amount">Number</label>
<input id="amount" type="number" min="0" max="200" value="2" />
<table>
  <thead>
    <tr><th scope="col">Language</th><th scope="col">Result</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">English</th><td data-plural="en"></td></tr>
    <tr><th scope="row">English ordinal</th><td data-plural="ordinal"></td></tr>
    <tr><th scope="row">Spanish</th><td lang="es" data-plural="es"></td></tr>
    <tr><th scope="row">Polish</th><td lang="pl" data-plural="pl"></td></tr>
    <tr><th scope="row">Russian</th><td lang="ru" data-plural="ru"></td></tr>
  </tbody>
</table>`,
      css: `label { display: block; font-weight: 600; }
input { width: 8rem; padding: 0.5rem; font: inherit; }
table { margin-top: 1rem; border-collapse: collapse; }
th, td { padding: 0.375rem 1rem 0.375rem 0; text-align: left; }`,
      js: `const { pluralize } = window.Strings
const forms = {
  en: [{ one: '# file', other: '# files' }, { locale: 'en' }],
  ordinal: [{ one: '#st place', two: '#nd place', few: '#rd place', other: '#th place' }, { locale: 'en', ordinal: true }],
  es: [{ zero: 'Ningún archivo', one: '# archivo', other: '# archivos' }, { locale: 'es' }],
  pl: [{ one: '# plik', few: '# pliki', many: '# plików', other: '# pliku' }, { locale: 'pl' }],
  ru: [{ one: '# файл', few: '# файла', many: '# файлов', other: '# файла' }, { locale: 'ru' }],
}
const amount = document.querySelector('#amount')

const update = () => {
  const count = Math.max(0, Math.floor(Number(amount.value) || 0))
  for (const cell of document.querySelectorAll('[data-plural]'))
    cell.textContent = pluralize(count, ...forms[cell.dataset.plural])
}
amount.addEventListener('input', update)
update()`,
      esm: `import { pluralize } from '@samline/string'

const forms = {
  en: [{ one: '# file', other: '# files' }, { locale: 'en' }],
  ordinal: [{ one: '#st place', two: '#nd place', few: '#rd place', other: '#th place' }, { locale: 'en', ordinal: true }],
  es: [{ zero: 'Ningún archivo', one: '# archivo', other: '# archivos' }, { locale: 'es' }],
  pl: [{ one: '# plik', few: '# pliki', many: '# plików', other: '# pliku' }, { locale: 'pl' }],
  ru: [{ one: '# файл', few: '# файла', many: '# файлов', other: '# файла' }, { locale: 'ru' }],
}
const amount = document.querySelector('#amount')

const update = () => {
  const count = Math.max(0, Math.floor(Number(amount.value) || 0))
  for (const cell of document.querySelectorAll('[data-plural]'))
    cell.textContent = pluralize(count, ...forms[cell.dataset.plural])
}
amount.addEventListener('input', update)
update()`,
    },
  },
  {
    id: 'article',
    tab: 'Article meta',
    title: 'Reading time, plurals and excerpts',
    description:
      'The line under the article is computed from its text: readingTime counts words with Intl.Segmenter, pluralize picks each Spanish form, stripTags and truncate turn the body into a 90-character excerpt for a meta description, and template fills the greeting.',
    files: {
      html: `<article id="post">
  <h2>Café de olla</h2>
  <div class="body">
    <p>El <b>café de olla</b> se prepara con canela y piloncillo en una olla de barro.</p>
    <p>Hierve el agua, añade el piloncillo y la canela, y deja reposar el café cinco minutos antes de colarlo.</p>
  </div>
</article>
<p id="meta"></p>
<p id="excerpt"></p>
<p id="greeting"></p>`,
      css: `#meta { color: #475569; font-size: 0.875rem; }`,
      js: `const { pluralize, readingTime, stripTags, template, truncate } = window.Strings
const post = document.querySelector('#post')
const comments = 3
const { minutes, words } = readingTime(post.textContent, { locale: 'es' })

document.querySelector('#meta').textContent = [
  pluralize(minutes, { one: '# minuto de lectura', other: '# minutos de lectura' }, { locale: 'es' }),
  pluralize(words, { one: '# palabra', other: '# palabras' }, { locale: 'es' }),
  pluralize(comments, { zero: 'Sin comentarios', one: '# comentario', other: '# comentarios' }, { locale: 'es' }),
].join(' · ')

// Plain text from the body's HTML for a meta description, cut at a whole word.
const body = post.querySelector('.body')
document.querySelector('#excerpt').textContent = truncate(stripTags(body.innerHTML), 90)

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

// Plain text from the body's HTML for a meta description, cut at a whole word.
const body = post.querySelector('.body')
document.querySelector('#excerpt').textContent = truncate(stripTags(body.innerHTML), 90)

document.querySelector('#greeting').textContent = template('Hola {user.name}, tienes {count} borradores.', {
  user: { name: 'Ana' },
  count: 2,
})`,
    },
  },
  {
    id: 'keys',
    tab: 'API keys',
    title: 'Read API fields in camelCase',
    description:
      'Many APIs send snake_case fields while JavaScript code uses camelCase. Each row is one field of the same response: how it arrives, how your code reads it after camelCase, and how snakeCase sends it back, identical to the original.',
    files: {
      html: `<table>
  <thead>
    <tr>
      <th scope="col">From the API</th>
      <th scope="col">In your code</th>
      <th scope="col">Sent back</th>
    </tr>
  </thead>
  <tbody id="keys"></tbody>
</table>`,
      css: `table { border-collapse: collapse; }
th, td { padding: 0.375rem 1.5rem 0.375rem 0; text-align: left; }`,
      js: `const { camelCase, snakeCase } = window.Strings
const mapKeys = (object, convert) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [convert(key), value]))

const response = { user_id: 7, first_name: 'Ana', last_login_at: '2026-11-13', is_admin: false }
const user = mapKeys(response, camelCase) // { userId: 7, firstName: 'Ana', … }
const payload = mapKeys(user, snakeCase) // { user_id: 7, first_name: 'Ana', … }

const columns = [response, user, payload].map(Object.keys)
document.querySelector('#keys').replaceChildren(
  ...columns[0].map((_, row) => {
    const tr = document.createElement('tr')
    for (const keys of columns) {
      const cell = document.createElement('td')
      cell.append(Object.assign(document.createElement('code'), { textContent: keys[row] }))
      tr.append(cell)
    }
    return tr
  })
)`,
      esm: `import { camelCase, snakeCase } from '@samline/string'

const mapKeys = (object, convert) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [convert(key), value]))

const response = { user_id: 7, first_name: 'Ana', last_login_at: '2026-11-13', is_admin: false }
const user = mapKeys(response, camelCase) // { userId: 7, firstName: 'Ana', … }
const payload = mapKeys(user, snakeCase) // { user_id: 7, first_name: 'Ana', … }

const columns = [response, user, payload].map(Object.keys)
document.querySelector('#keys').replaceChildren(
  ...columns[0].map((_, row) => {
    const tr = document.createElement('tr')
    for (const keys of columns) {
      const cell = document.createElement('td')
      cell.append(Object.assign(document.createElement('code'), { textContent: keys[row] }))
      tr.append(cell)
    }
    return tr
  })
)`,
    },
  },
  {
    id: 'cards',
    tab: 'From data',
    title: 'Avatars and excerpts from data',
    description:
      'The same helpers in code, for lists rendered from data: initials and hashColor build each avatar, and truncate cuts the bio at a whole word, keeping the full text in title. Ana María López appears twice, typed differently, and keeps the same color because hashColor ignores case and accents.',
    files: {
      html: `<ul id="people"></ul>`,
      css: `ul { list-style: none; padding: 0; display: grid; gap: 0.75rem; }
li { display: flex; gap: 0.75rem; align-items: center; }
.avatar { display: grid; place-items: center; flex: none; width: 2.5rem; height: 2.5rem; border-radius: 50%; color: white; font-weight: 600; }`,
      js: `const { hashColor, initials, truncate } = window.Strings
const people = [
  { name: 'Samuel Olvera', bio: 'Builds small, framework-agnostic utilities for the open web.' },
  { name: 'Ana María López', bio: 'Diseña interfaces accesibles y escribe sobre tipografía en español.' },
  { name: 'ana maria lopez', bio: 'Importada de otro sistema, con el nombre escrito sin acentos ni mayúsculas.' },
]

document.querySelector('#people').replaceChildren(
  ...people.map(({ name, bio }) => {
    const item = document.createElement('li')
    const avatar = Object.assign(document.createElement('span'), {
      className: 'avatar',
      textContent: initials(name),
    })
    avatar.setAttribute('role', 'img')
    avatar.setAttribute('aria-label', name)
    avatar.style.background = hashColor(name) // white text keeps 4.5:1
    const text = Object.assign(document.createElement('span'), {
      textContent: truncate(bio, 40),
      title: bio,
    })
    item.append(avatar, text)
    return item
  })
)`,
      esm: `import { hashColor, initials, truncate } from '@samline/string'

const people = [
  { name: 'Samuel Olvera', bio: 'Builds small, framework-agnostic utilities for the open web.' },
  { name: 'Ana María López', bio: 'Diseña interfaces accesibles y escribe sobre tipografía en español.' },
  { name: 'ana maria lopez', bio: 'Importada de otro sistema, con el nombre escrito sin acentos ni mayúsculas.' },
]

document.querySelector('#people').replaceChildren(
  ...people.map(({ name, bio }) => {
    const item = document.createElement('li')
    const avatar = Object.assign(document.createElement('span'), {
      className: 'avatar',
      textContent: initials(name),
    })
    avatar.setAttribute('role', 'img')
    avatar.setAttribute('aria-label', name)
    avatar.style.background = hashColor(name) // white text keeps 4.5:1
    const text = Object.assign(document.createElement('span'), {
      textContent: truncate(bio, 40),
      title: bio,
    })
    item.append(avatar, text)
    return item
  })
)`,
    },
  },
] as const
