import { project } from '../../../../../shared/lib/project.mjs'
const text = (value: string) => [{ kind: 'text' as const, value }]
const heading = (prefix: string, accent: string) => [
  { kind: 'text' as const, value: prefix + ' ' },
  { kind: 'emphasis' as const, value: accent },
]
const code = (
  filename: string,
  source: string,
  language: 'html' | 'javascript' | 'bash' | 'css'
) => ({
  filename,
  code: source,
  language,
})

const markup = `<label for="title">Title</label>
<input id="title" type="text" value="Café & Crème" />
<label for="slug">Slug</label>
<input id="slug" data-string="slug" data-string-source="#title" />`

const script = `import { string } from '@samline/string/vanilla'

// The slug follows the title until the user edits it.
string()`

const sections = {
  hero: {
    seoTitle: 'Case conversion, slugify, search and text helpers',
    seoDescription:
      'Case conversion, slugify, accent-insensitive search, truncate and plurals for JavaScript and plain HTML, built on one Unicode-aware word splitter.',
    kicker: 'Every case. One splitter.',
    title: project.name,
    // A non-breaking space keeps the last two words together, so no word wraps alone.
    titleAccent: 'Text in the shape you\u00a0need.',
    description:
      'Convert between every case, build URL slugs, search without accents and shape text for display, from code or straight from HTML attributes, with words split the same way everywhere.',
    descriptionContinuation: 'Install it, type in the live preview, then read the full reference.',
    footnotes: [
      'About 5 KB gzip, tree-shakeable',
      'Zero dependencies',
      `${project.license} licensed`,
    ],
    compatibilityLabel: 'ONE SMALL SCRIPT. RIGHT AT HOME IN YOUR STACK.',
    platforms: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'Vue', 'Svelte', 'WordPress'],
  },
  features: {
    eyebrow: '01 / More than toUpperCase',
    title: 'One splitter.',
    titleAccent: 'Every case agrees.',
    items: {
      words: {
        icon: 'scissors',
        title: 'Words split once, correctly',
        description: text(
          'XMLHttpRequest becomes XML, Http, Request; camel, Pascal, snake, kebab and any punctuation are understood the same way by every case.'
        ),
      },
      unicode: {
        icon: 'globe',
        title: 'Unicode and locales',
        description: text(
          'Accents and any script are kept as letters, every function takes a locale (Turkish İ and ı), and emoji such as 👨‍👩‍👧 are never cut in half.'
        ),
      },
      slugs: {
        icon: 'link',
        title: 'Slugs that read well',
        description: text(
          'slugify removes accents, transliterates Cyrillic, Greek and German, applies your replacements, and uniqueSlug picks the first free one (hello-3).'
        ),
      },
      html: {
        icon: 'keyboard',
        title: 'Forms from HTML attributes',
        description: text(
          'data-string makes a slug field follow its title until edited; counters, copy buttons, fitted file names and avatar colors need no script either.'
        ),
      },
      search: {
        icon: 'target',
        title: 'Search without accents',
        description: text(
          'contains finds Café with cafe, highlight returns safe pieces to mark, compareNatural sorts file2 before file10 and closest suggests a fix for typos.'
        ),
      },
      text: {
        icon: 'type',
        title: 'Text ready to show',
        description: text(
          'truncate cuts at a whole word or in the middle of file names, pluralize uses each language’s rules, and template, readingTime and stripTags shape the rest.'
        ),
      },
    },
  },
  runtimes: {
    eyebrow: '02 / Fit it into your stack',
    heading: heading('Pure functions.', 'Any runtime.'),
    description:
      'The functions never touch the DOM: browsers, Node, workers and edge runtimes. The HTML layer is a separate entry that does nothing without a DOM.',
    items: {
      main: {
        label: 'Package',
        entrypoint: project.npmName,
        description: 'Every pure function as ESM or CommonJS, tree-shakeable.',
      },
      vanilla: {
        label: 'HTML layer',
        entrypoint: `${project.npmName}/vanilla`,
        description: 'string(), search(), count(), fit() and copy() run data-string-* attributes.',
      },
      global: {
        label: 'HTML / CDN',
        entrypoint: 'window.Strings',
        description: 'A classic script that starts every attribute when the page loads.',
      },
      case: {
        label: 'Cases and slugs',
        entrypoint: 'camelCase · slugify · convert',
        description: 'Every case, URL slugs, free slugs and conversions picked by name.',
      },
      search: {
        label: 'Search',
        entrypoint: 'contains · highlight · closest',
        description: 'Accent-insensitive matching, natural sorting and typo suggestions.',
      },
      text: {
        label: 'Text',
        entrypoint: 'truncate · pluralize · template',
        description: 'Display helpers, plurals, placeholders, reading time and HTML text.',
      },
    },
  },
  gettingStarted: {
    eyebrow: '03 / Install and convert',
    heading: heading('One install.', 'One live slug.'),
    integrationDescription:
      'A slug field that fills itself from the title, with attributes and one call.',
    integrationLabel: 'Read the installation guide',
    steps: { install: 'Install', markup: 'Add markup', initialize: 'Start the HTML layer' },
    installLabel: 'Installation method',
    installTabs: [],
    fullExampleLabel: 'Copy complete working files',
    markupDescription:
      'data-string names the conversion and data-string-source the field it follows.',
    examples: {
      markup: code('index.html', markup, 'html'),
      script: code('main.js', script, 'javascript'),
    },
    docs: {
      description: 'Continue with every function and its options.',
      label: 'Explore the options',
    },
  },
  recipes: {
    eyebrow: '04 / Beyond slugs',
    title: 'Everyday text jobs.',
    titleAccent: 'One call each.',
    description: 'Three common jobs, all built on the same rules for words, accents and case.',
    examplesLabel: 'Explore working examples',
    items: [
      {
        title: 'Map API keys',
        context: 'camelCase · snakeCase',
        docsRoute: 'api' as const,
        docsLabel: 'Read the API',
        description: text('Read snake_case fields as camelCase, and send them back unchanged.'),
        code: code(
          'main.js',
          `import { camelCase, snakeCase } from '@samline/string'

const mapKeys = (object, convert) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [convert(key), value]))

mapKeys({ first_name: 'Ana' }, camelCase) // { firstName: 'Ana' }
mapKeys({ firstName: 'Ana' }, snakeCase) // { first_name: 'Ana' }`,
          'javascript'
        ),
      },
      {
        title: 'Did you mean…?',
        context: 'closest',
        docsRoute: 'api' as const,
        docsLabel: 'Read the API',
        description: text('Suggest the nearest option for a typo, ignoring accents and case.'),
        code: code(
          'main.js',
          `import { closest } from '@samline/string'

closest('curacoa', ['Canada', 'Curaçao', 'Peru']) // 'Curaçao'
closest('matcah', ['Iced matcha latte']) // 'Iced matcha latte'`,
          'javascript'
        ),
      },
      {
        title: 'Plurals in any language',
        context: 'pluralize',
        docsRoute: 'api' as const,
        docsLabel: 'Read the API',
        description: text('Let Intl.PluralRules pick the form, including few and many.'),
        code: code(
          'main.js',
          `import { pluralize } from '@samline/string'

const files = { one: '# plik', few: '# pliki', many: '# plików', other: '# pliku' }
pluralize(2, files, { locale: 'pl' }) // '2 pliki'
pluralize(5, files, { locale: 'pl' }) // '5 plików'`,
          'javascript'
        ),
      },
    ],
  },
  faq: {
    eyebrow: '05 / Before you build',
    heading: heading('A few details.', 'Clearly answered.'),
    items: {
      words: {
        question: text('How are words detected?'),
        answer: text(
          'Any character that is not a letter or digit separates words, a lower-case letter followed by an upper-case one starts a new word, and acronyms end before their last capital (XMLHttp is XML and Http). Digits stay with their word.'
        ),
      },
      bundler: {
        question: text('Does it work without a bundler?'),
        answer: text(
          'Yes. Load dist/browser/string.global.js with a classic script tag: it defines window.Strings and starts every data-string-* attribute when the page loads. Pin the version in production.'
        ),
      },
      html: {
        question: text('Do the HTML attributes need JavaScript?'),
        answer: text(
          'They need the script to convert, but you write the readable text in the HTML, so it stays visible without JavaScript and for search engines. destroy() puts the original markup back.'
        ),
      },
      locale: {
        question: text('Which locale is used for upper and lower case?'),
        answer: text(
          "In code, the runtime's default locale, which can differ between your server and the browser: pass locale, such as 'tr' or 'de', wherever the result must be the same everywhere. HTML attributes use the closest lang attribute."
        ),
      },
      accents: {
        question: text('Are accents removed by the case functions?'),
        answer: text(
          'No. camelCase and the other case functions keep accents (año nuevo becomes añoNuevo). slugify, removeAccents and the search functions remove them.'
        ),
      },
      slugLanguage: {
        question: text('How do I translate & or % in slugs?'),
        answer: text(
          "Pass replacements, for example { '&': 'y' } in Spanish or { '&': 'and' } in English. They apply before anything else."
        ),
      },
      typing: {
        question: text('Can I slugify while the user types?'),
        answer: text(
          'Yes. data-string="slug" on a field does it for you. In code, use slugify(value, { trim: false }) on input so a trailing space becomes a separator, and slugify(value) on blur for the final value.'
        ),
      },
      emoji: {
        question: text('Does truncate split emoji or accents?'),
        answer: text(
          'No. It counts graphemes, the characters people see, so 👨‍👩‍👧, 🇲🇽 and accented letters are never cut in half, and by default it cuts at the last whole word.'
        ),
      },
      server: {
        question: text('Can I use it on the server?'),
        answer: text(
          'Yes. Every function in @samline/string is pure, with no DOM access, so it works in Node, edge runtimes, workers and build scripts. The HTML layer does nothing without a DOM.'
        ),
      },
    },
  },
  callToAction: {
    eyebrow: 'Text, shaped once',
    heading: heading('Every case,', 'one call away.'),
    description: 'Try the examples or follow the first steps.',
    docs: {
      description: 'Guides, the complete API and release notes, in one place.',
      label: 'Read the documentation',
    },
  },
} as const

export default sections
