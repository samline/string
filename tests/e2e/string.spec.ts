import { expect, test } from './fixtures'

test('the browser bundle converts [data-string] elements on load and later', async ({ load }) => {
  const page = await load(
    `<p id="a" data-string="kebab">Hello World</p><input id="b" data-string="upper" />`,
    'string'
  )
  await expect(page.locator('#a')).toHaveText('hello-world')
  await expect(page.locator('#a')).toHaveAttribute('data-string-state', 'ready')
  await page.locator('#b').pressSequentially('istanbul', { delay: 10 })
  await expect(page.locator('#b')).toHaveValue('ISTANBUL')

  await page.evaluate(() => {
    const added = document.createElement('p')
    added.id = 'c'
    added.dataset.string = 'snake'
    added.textContent = 'Added Later'
    document.body.append(added)
  })
  await expect(page.locator('#c')).toHaveText('added_later')

  await page.evaluate(() => (window as any).SamlineString.controller.destroy())
  await expect(page.locator('#a')).toHaveText('Hello World')
})

test('keeps the caret while converting in the middle of a field', async ({ load }) => {
  const page = await load(`<input id="k" data-string="kebab" value="hello world" />`, 'string')
  const field = page.locator('#k')
  await expect(field).toHaveValue('hello-world')
  await field.focus()
  await field.press('End')
  await field.press('ArrowLeft')
  await field.press('ArrowLeft')
  await field.press('Shift+ArrowLeft')
  await field.pressSequentially('x', { delay: 10 })
  await expect(field).toHaveValue('hello-woxld')
  expect(await field.evaluate((el: HTMLInputElement) => el.selectionEnd)).toBe(9)
})

test('data-manual waits for SamlineString.auto()', async ({ page }) => {
  await page.setContent(`<!doctype html><p id="a" data-string="constant">api url</p>`)
  const { fileURLToPath } = await import('node:url')
  const bundle = fileURLToPath(new URL('../../dist/browser/string.global.js', import.meta.url))
  const { readFileSync } = await import('node:fs')
  await page.evaluate(
    code => {
      const script = document.createElement('script')
      script.setAttribute('data-manual', '')
      script.textContent = code
      document.body.append(script)
    },
    readFileSync(bundle, 'utf8')
  )
  await expect(page.locator('#a')).toHaveText('api url')
  await page.evaluate(() => (window as any).SamlineString.auto())
  await expect(page.locator('#a')).toHaveText('API_URL')
})
