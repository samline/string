// The website shows each example twice: a live preview and copyable files
// (site/examples.ts) that load the browser bundle. These tests run the copyable
// files against the built bundle, so the code people copy keeps working.
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

import stringExamples from '../../site/examples'

const bundle = (pkg: string) =>
  fileURLToPath(new URL(`../../dist/browser/${pkg}.global.js`, import.meta.url))

type Example = { id: string; files: { html: string; css?: string; js: string } }

const open = async (page: import('@playwright/test').Page, pkg: string, example: Example) => {
  await page.setContent(
    `<!doctype html><html><head><style>${example.files.css ?? ''}</style></head><body><main>${example.files.html}</main></body></html>`
  )
  await page.addScriptTag({ path: bundle(pkg) })
  await page.addScriptTag({ content: example.files.js })
}

const find = <T extends Example>(list: readonly T[], id: string) =>
  list.find(item => item.id === id)!

test.describe('string copyable examples', () => {
  test('slug follows the title, then keeps a typed separator and trims on change', async ({
    page,
  }) => {
    await open(page, 'string', find(stringExamples, 'slug'))
    await expect(page.locator('#slug')).toHaveValue('cafe-y-te-guia-2026')
    await expect(page.locator('code')).toHaveText('cafe-y-te-guia-2026')
    await expect(page.locator('#status')).toHaveText('Follows the title.')
    await page.locator('#slug').fill('')
    await page.locator('#slug').pressSequentially('Mi Página ', { delay: 10 })
    await expect(page.locator('#slug')).toHaveValue('mi-pagina-')
    await page.locator('#slug').blur()
    await expect(page.locator('#slug')).toHaveValue('mi-pagina')
    await expect(page.locator('code')).toHaveText('mi-pagina')
    await expect(page.locator('#status')).toContainText('Edited by hand')
    await page.locator('#title').fill('Otro título')
    await expect(page.locator('#slug')).toHaveValue('mi-pagina')
    await page.locator('#slug').fill('')
    await page.locator('#title').fill('Vuelve a seguir')
    await expect(page.locator('#slug')).toHaveValue('vuelve-a-seguir')
    await expect(page.locator('code')).toHaveText('vuelve-a-seguir')
  })

  test('unique slugs transliterate and skip taken ones', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'unique'))
    const slug = page.locator('#post-slug')
    await expect(slug).toHaveValue('privet-mir-3')
    await page.locator('#post-title').fill('Αθήνα Müller')
    await expect(slug).toHaveValue('athina-mueller')
    await slug.fill('')
    await slug.pressSequentially('Hello World', { delay: 10 })
    await expect(slug).toHaveValue('hello-world')
    await slug.blur()
    await expect(slug).toHaveValue('hello-world-2')
  })

  test('profile colors the avatar, fits the file name, counts and copies', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'profile'))
    const avatar = page.locator('.avatar')
    await expect(avatar).toHaveText('AM')
    expect(await avatar.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(
      'rgb(71, 85, 105)'
    )

    const file = page.locator('.file')
    await expect(file).toHaveAttribute('data-string-fit-state', 'truncated')
    await expect(file).toHaveAttribute('title', 'curriculum-ana-maria-lopez-2026-version-final.pdf')
    const text = (await file.textContent()) ?? ''
    expect(text).toContain('…')
    expect(text.endsWith('.pdf')).toBe(true)
    expect(await file.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)

    const output = page.locator('output')
    await expect(output).toHaveText('50 characters left')
    await page.locator('#bio').fill('x'.repeat(75))
    await expect(output).toHaveText('5 characters left')
    await expect(output).toHaveAttribute('data-string-count-state', 'near')

    await page.evaluate(() => {
      ;(window as any).copied = []
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (value: string) => (window as any).copied.push(value) },
      })
    })
    await page.locator('button').click()
    await expect(page.locator('button')).toHaveAttribute('data-string-copy-state', 'copied')
    expect(await page.evaluate(() => (window as any).copied)).toEqual(['ana-maria-lopez'])
  })

  test('attributes convert initials, file names, headers and headings', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'markup'))
    await expect(page.locator('.avatar')).toHaveText(['SO', 'AM'])
    await expect(page.locator('.avatar').first()).toHaveAttribute('aria-label', 'Samuel Olvera')
    const file = page.locator('.files li span:not(.avatar)').first()
    await expect(file).toHaveText('annual-repo…nal-v3.pdf')
    await expect(file).toHaveAttribute('title', 'annual-report-2026-final-v3.pdf')
    await expect(page.locator('code')).toHaveText(['Content-Security-Policy', 'API_BASE_URL'])
    await expect(page.locator('h3')).toHaveText('La Casa de Papel')
  })

  test('search filters ignoring accents, highlights and suggests a typo fix', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'search'))
    const items = page.locator('#drinks li:visible')
    await expect(items).toHaveCount(5)
    await page.locator('#q').pressSequentially('cafe', { delay: 10 })
    await expect(items).toHaveText(['Café de olla'])
    await expect(page.locator('#drinks mark')).toHaveText(['Café'])
    await expect(page.locator('#hint')).toHaveText('1 of 5 drinks')
    await page.locator('#q').fill('te vrde')
    await expect(page.locator('#drinks [data-string-search-empty]')).toBeVisible()
    await expect(page.locator('#hint')).toHaveText('Did you mean Té verde?')
    await page.locator('#q').fill('')
    await expect(items).toHaveCount(5)
    await expect(page.locator('#drinks mark')).toHaveCount(0)
  })

  test('article meta shows reading time, plurals, an excerpt and a greeting', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'article'))
    await expect(page.locator('#meta')).toHaveText(
      /^1 minuto de lectura · \d+ palabras · 3 comentarios$/
    )
    const excerpt = (await page.locator('#excerpt').textContent()) ?? ''
    expect(excerpt.startsWith('El café de olla se prepara')).toBe(true)
    expect(excerpt.endsWith('…')).toBe(true)
    expect(Array.from(excerpt).length).toBeLessThanOrEqual(90)
    await expect(page.locator('#greeting')).toHaveText('Hola Ana, tienes 2 borradores.')
  })

  test('keys round-trip between snake_case and camelCase', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'keys'))
    const rows = page.locator('#keys tr')
    await expect(rows).toHaveCount(4)
    await expect(rows.first().locator('td')).toHaveText(['user_id', 'userId', 'user_id'])
    await expect(rows.nth(2).locator('td')).toHaveText([
      'last_login_at',
      'lastLoginAt',
      'last_login_at',
    ])
  })

  test('cards build colored initials and truncated bios with the full text', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'cards'))
    const avatars = page.locator('.avatar')
    await expect(avatars).toHaveText(['SO', 'AM', 'AM'])
    await expect(avatars.nth(1)).toHaveAttribute('aria-label', 'Ana María López')
    const colors = await avatars.evaluateAll(list => list.map(el => el.style.background))
    expect(colors[1]).toBe(colors[2])
    expect(colors[0]).not.toBe(colors[1])
    const bio = page.locator('#people li').first().locator('span:not(.avatar)')
    await expect(bio).toHaveText('Builds small, framework-agnostic…')
    await expect(bio).toHaveAttribute(
      'title',
      'Builds small, framework-agnostic utilities for the open web.'
    )
  })

  test('one name follows the field in every convention and copies each', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'tokens'))
    await expect(page.locator('.names code')).toHaveText([
      'primary-button-hover',
      'primaryButtonHover',
      'PRIMARY_BUTTON_HOVER',
      'PrimaryButtonHover',
      'primary.button.hover',
    ])
    await page.locator('#token').fill('Año Nuevo banner')
    await expect(page.locator('.names code').nth(2)).toHaveText('AÑO_NUEVO_BANNER')
    await page.evaluate(() => {
      ;(window as any).copied = []
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (value: string) => (window as any).copied.push(value) },
      })
    })
    await page.getByRole('button', { name: 'Copy the JavaScript name' }).click()
    expect(await page.evaluate(() => (window as any).copied)).toEqual(['añoNuevoBanner'])
  })

  test('suggestions ignore accents, mark matches and fix typos', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'suggest'))
    const status = page.locator('#country-status')
    await expect(status).toHaveText('Type a country, with or without accents.')
    await page.locator('#country').fill('peru')
    await expect(page.locator('#countries li')).toHaveText(['Perú'])
    await expect(page.locator('#countries mark')).toHaveText(['Perú'])
    await expect(status).toHaveText('1 found')
    await page.locator('#country').fill('cote')
    await expect(page.locator('#countries li')).toHaveText(["Côte d'Ivoire"])
    await expect(page.locator('#countries mark')).toHaveText(['Côte'])
    await page.locator('#country').fill('mexcio')
    await expect(page.locator('#countries li')).toHaveCount(0)
    await expect(status).toHaveText('No match. Did you mean México?')
  })

  test('natural sorting reads numbers and ignores case and accents', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'files'))
    await expect(page.locator('#plain li')).toHaveText([
      'Foto 9.jpg',
      'Informe 2.pdf',
      'foto 12.jpg',
      'informe 1.pdf',
      'informe 10.pdf',
      'índice.pdf',
    ])
    await expect(page.locator('#natural li')).toHaveText([
      'Foto 9.jpg',
      'foto 12.jpg',
      'índice.pdf',
      'informe 1.pdf',
      'Informe 2.pdf',
      'informe 10.pdf',
    ])
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.locator('#natural li').nth(5)).toHaveText('informe 3.pdf')
    await expect(page.locator('#file-name')).toHaveValue('')
  })

  test('the menu switches the conversion by name', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'convert'))
    const result = page.locator('#result')
    await expect(page.locator('#conversion option')).toHaveCount(18)
    await expect(page.locator('#conversion')).toHaveValue('kebab')
    await expect(result).toHaveText('café-con-leche-receta-rápida')
    await page.locator('#conversion').selectOption('slug')
    await expect(result).toHaveText('cafe-con-leche-receta-rapida')
    await page.locator('#conversion').selectOption('truncate')
    await expect(result).toHaveText('Café con leche…')
    await page.locator('#conversion').selectOption('constant')
    await page.locator('#phrase').fill('Té verde')
    await expect(result).toHaveText('TÉ_VERDE')
  })

  test('the composer counts graphemes and never cuts an emoji', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'composer'))
    await expect(page.locator('#units')).toHaveText('25')
    await expect(page.locator('#chars')).toHaveText('14')
    await expect(page.locator('output')).toHaveText('26 of 40 characters left')
    await expect(page.locator('#truncated')).toHaveText('¡Listos! 👨‍👩‍👧…')
    expect(await page.locator('#sliced').textContent()).not.toContain('👨‍👩‍👧')
  })

  test('plurals pick each language form', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'plurals'))
    const cells = page.locator('[data-plural]')
    await expect(cells).toHaveText(['2 files', '2nd place', '2 archivos', '2 pliki', '2 файла'])
    await page.locator('#amount').fill('5')
    await expect(cells).toHaveText(['5 files', '5th place', '5 archivos', '5 plików', '5 файлов'])
    await page.locator('#amount').fill('0')
    await expect(cells.nth(2)).toHaveText('Ningún archivo')
    await page.locator('#amount').fill('22')
    await expect(cells).toHaveText([
      '22 files',
      '22nd place',
      '22 archivos',
      '22 pliki',
      '22 файла',
    ])
  })
})
