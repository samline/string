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
    await page.locator('#slug').fill('')
    await page.locator('#slug').pressSequentially('Mi Página ', { delay: 10 })
    await expect(page.locator('#slug')).toHaveValue('mi-pagina-')
    await page.locator('#slug').blur()
    await expect(page.locator('#slug')).toHaveValue('mi-pagina')
    await page.locator('#title').fill('Otro título')
    await expect(page.locator('#slug')).toHaveValue('mi-pagina')
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
