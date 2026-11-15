import { describe, expect, it } from 'vitest'

describe('browser global', () => {
  it('exposes window.SamlineString and converts [data-string] on load', async () => {
    document.body.innerHTML = '<p id="a" data-string="kebab">Hello World</p>'
    await import('../src/browser/global.js')
    const api = (globalThis as { SamlineString?: Record<string, any> }).SamlineString!
    expect(typeof api.slugify).toBe('function')
    expect(typeof api.convert).toBe('function')
    expect(typeof api.string).toBe('function')
    expect(document.querySelector('#a')!.textContent).toBe('hello-world')

    const first = api.controller
    expect(first).not.toBeNull()
    const second = api.auto({ to: 'upper', selector: 'p' })
    expect(api.controller).toBe(second)
    expect(document.querySelector('#a')!.textContent).toBe('hello-world')
    second.destroy()
    expect(document.querySelector('#a')!.textContent).toBe('Hello World')
  })
})
