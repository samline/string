import { describe, expect, it } from 'vitest'

describe('browser global', () => {
  it('exposes window.Strings and converts [data-string] on load', async () => {
    document.body.innerHTML =
      '<p id="a" data-string="kebab">Hello World</p><input id="q" /><ul data-string-search="#q"><li>Café</li><li>Té</li></ul>'
    await import('../src/browser/global.js')
    const api = (globalThis as { Strings?: Record<string, any> }).Strings!
    expect(typeof api.slugify).toBe('function')
    expect(typeof api.convert).toBe('function')
    expect(typeof api.string).toBe('function')
    expect(document.querySelector('#a')!.textContent).toBe('hello-world')
    expect(typeof api.search).toBe('function')
    expect(document.querySelector('ul')!.getAttribute('data-string-search-state')).toBe('idle')

    const first = api.controller
    expect(first).not.toBeNull()
    const second = api.auto({ to: 'upper', selector: 'p', search: { min: 2 } })
    const query = document.querySelector<HTMLInputElement>('#q')!
    query.value = 'c'
    query.dispatchEvent(new Event('input'))
    expect(document.querySelector('ul')!.getAttribute('data-string-search-state')).toBe('idle')
    query.value = 'cafe'
    query.dispatchEvent(new Event('input'))
    expect(document.querySelector('ul')!.getAttribute('data-string-search-state')).toBe('results')
    expect(api.controller).toBe(second)
    expect(document.querySelector('#a')!.textContent).toBe('hello-world')
    second.refresh()
    second.destroy()
    expect(document.querySelector('#a')!.textContent).toBe('Hello World')
    expect(document.querySelector('ul')!.hasAttribute('data-string-search-state')).toBe(false)
  })
})
