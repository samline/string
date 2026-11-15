import { afterEach, describe, expect, it, vi } from 'vitest'

import { autoSearch, search, SEARCH_EVENT } from '../src/vanilla/index.js'

const $ = <T extends Element = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!
const type = (value: string, selector = '#q') => {
  const field = $<HTMLInputElement>(selector)
  field.value = value
  field.dispatchEvent(new Event('input'))
}
const visible = () =>
  Array.from(document.querySelectorAll<HTMLElement>('#list > li:not([data-string-search-empty])'))
    .filter(item => !item.hidden)
    .map(item => item.textContent)

const markup = `<input id="q" />
  <ul id="list" data-string-search="#q">
    <li>Café de <b>olla</b></li>
    <li>Té verde</li>
    <li hidden>Chocolate mexicano</li>
    <li hidden data-string-search-empty>No results</li>
  </ul>`

afterEach(() => {
  document.body.innerHTML = ''
})

describe('search()', () => {
  it('filters and highlights ignoring accents, then restores everything', () => {
    document.body.innerHTML = markup
    const before = $('#list').cloneNode(true)
    const onSearch = vi.fn()
    const controller = search(undefined, { onSearch })
    expect($('#list').dataset.stringSearchState).toBe('idle')
    expect(visible()).toEqual(['Café de olla', 'Té verde'])

    type('cafe OLLA')
    expect(visible()).toEqual(['Café de olla'])
    expect(Array.from(document.querySelectorAll('mark'), mark => mark.textContent)).toEqual([
      'Café',
      'olla',
    ])
    expect($('#list b mark').textContent).toBe('olla')
    expect(onSearch).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: 'cafe OLLA', total: 2, state: 'results' }),
      $('#list')
    )

    // Items hidden in the HTML stay hidden and are not searched.
    type('chocolate')
    expect(visible()).toEqual([])

    type('zzz')
    expect(visible()).toEqual([])
    expect($('#list').dataset.stringSearchState).toBe('empty')
    expect($('[data-string-search-empty]').hidden).toBe(false)

    type('')
    expect(visible()).toEqual(['Café de olla', 'Té verde'])
    expect(document.querySelector('mark')).toBeNull()

    type('te')
    controller.destroy()
    controller.destroy()
    $('#list').normalize()
    expect($('#list').isEqualNode(before)).toBe(true)
    type('cafe')
    expect(document.querySelector('mark')).toBeNull()
  })

  it('reads attributes: items, min, highlight, split and locale', () => {
    document.body.innerHTML = `<input id="q" />
      <div id="list" lang="tr" data-string-search="#q" data-string-search-items=".row"
        data-string-search-min="3" data-string-search-highlight="false" data-string-search-split="false">
        <p class="row">İstanbul ve Ankara</p><p class="row">Ankara ve İstanbul</p><p>not an item</p>
      </div>`
    const events: unknown[] = []
    $('#list').addEventListener(SEARCH_EVENT, event =>
      events.push((event as CustomEvent).detail.state)
    )
    search()
    type('an')
    expect(events[events.length - 1]).toBe('idle')
    type('ISTANBUL VE')
    const rows = Array.from(document.querySelectorAll<HTMLElement>('.row'), row => row.hidden)
    expect(rows).toEqual([false, true])
    expect(document.querySelector('mark')).toBeNull()
  })

  it('uses options, an outside empty element and refresh', () => {
    document.body.innerHTML = `<textarea id="q"></textarea><ol id="list"><li>Uno</li></ol><p id="none" hidden>Nada</p>`
    const controller = search('#list', { input: '#q', empty: '#none' })
    type('dos')
    expect($('#none').hidden).toBe(false)
    $('#list').append(Object.assign(document.createElement('li'), { textContent: 'Dos' }))
    controller.refresh()
    expect($('#none').hidden).toBe(true)
    expect(Array.from(document.querySelectorAll('li'), item => item.hidden)).toEqual([true, false])
    controller.destroy()
    controller.refresh()
    expect($('#none').hidden).toBe(true)
  })

  it('ignores lists without a search field', () => {
    document.body.innerHTML = `<ul id="a" data-string-search="#missing"><li>x</li></ul><div id="q"></div><ul id="b" data-string-search="#q"></ul>`
    search()
    expect($('#a').hasAttribute('data-string-search-state')).toBe(false)
    expect($('#b').hasAttribute('data-string-search-state')).toBe(false)
  })
})

describe('autoSearch', () => {
  it('starts lists added later', async () => {
    document.body.innerHTML = '<input id="q" />'
    const controller = autoSearch()
    document.body.insertAdjacentHTML(
      'beforeend',
      '<ul id="list" data-string-search="#q"><li>Hola</li><li>Adiós</li></ul>'
    )
    await Promise.resolve()
    type('adios')
    expect(visible()).toEqual(['Adiós'])
    controller.destroy()
    expect(visible()).toEqual(['Hola', 'Adiós'])
  })

  it('accepts a scope and selector', () => {
    document.body.innerHTML = `<input id="q" /><section id="s"><ul class="l" id="list"><li>Hola</li><li>Adiós</li></ul></section>`
    autoSearch({ scope: $('#s'), selector: '.l', input: '#q', observe: false })
    type('hola')
    expect(visible()).toEqual(['Hola'])
  })
})
