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
    expect(excerpt.startsWith('Café de olla El café de olla se prepara')).toBe(true)
    expect(excerpt.endsWith('…')).toBe(true)
    expect(Array.from(excerpt).length).toBeLessThanOrEqual(90)
    await expect(page.locator('#greeting')).toHaveText('Hola Ana, tienes 2 borradores.')
  })

  test('keys round-trip between snake_case and camelCase', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'keys'))
    const data = JSON.parse((await page.locator('#output').textContent()) ?? '{}')
    expect(Object.keys(data.forJs)).toEqual(['userId', 'firstName', 'lastLoginAt'])
    expect(Object.keys(data.back)).toEqual(['user_id', 'first_name', 'last_login_at'])
  })

  test('cards build initials and truncated bios', async ({ page }) => {
    await open(page, 'string', find(stringExamples, 'cards'))
    await expect(page.locator('.avatar')).toHaveText(['SO', 'AM'])
    await expect(page.locator('#people li').first()).toContainText('Builds small,')
    await expect(page.locator('#people li').first()).toContainText('…')
  })
})
