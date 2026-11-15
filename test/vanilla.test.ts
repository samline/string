import { afterEach, describe, expect, it, vi } from 'vitest'

import { autoString, CHANGE_EVENT, string } from '../src/vanilla/index.js'

const html = (markup: string) => {
  document.body.innerHTML = markup
}
const $ = <T extends Element = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!
const type = (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  field.value = value
  field.dispatchEvent(new Event('input', { bubbles: true }))
}
const blur = (field: HTMLElement) => field.dispatchEvent(new Event('blur'))

afterEach(() => {
  document.body.innerHTML = ''
})

describe('string() on elements', () => {
  it('converts text and restores the original markup on destroy', () => {
    html('<h2 id="a" data-string="kebab">Hello <em>World</em></h2>')
    const controller = string()
    expect($('#a').textContent).toBe('hello-world')
    expect($('#a').getAttribute('data-string-state')).toBe('ready')
    controller.destroy()
    controller.destroy()
    expect($('#a').innerHTML).toBe('Hello <em>World</em>')
    expect($('#a').hasAttribute('data-string-state')).toBe(false)
  })

  it('keeps markup when the text is already converted', () => {
    html('<p id="a" data-string="lower"><b>hi</b></p>')
    string()
    expect($('#a').innerHTML).toBe('<b>hi</b>')
  })

  it('reads options from attributes, attributes win', () => {
    html(`
      <p id="t" data-string="title" data-string-small-words="de, la">el fin de la era</p>
      <p id="s" data-string="slug" data-string-separator="_" data-string-replacements='{"&":"y","n":1}' data-string-max-length="12">Pan & Café con leche</p>
      <p id="u" data-string="slug" data-string-lower="false" data-string-replacements="{oops">Hola Mundo</p>
      <p id="i" data-string="initials" data-string-max="3">Ana María López</p>
      <p id="k" data-string="kebab">Hello World</p>`)
    string('p', { to: 'upper', smallWords: ['era'] })
    expect($('#t').textContent).toBe('El Fin de la Era')
    expect($('#s').textContent).toBe('pan_y_cafe')
    expect($('#u').textContent).toBe('Hola-Mundo')
    expect($('#i').textContent).toBe('AML')
    expect($('#k').textContent).toBe('hello-world')
  })

  it('falls back to the to option and ignores unknown names', () => {
    html('<p id="a" data-string="nope">hello</p><p id="b">world</p>')
    string('p', { to: 'upper' })
    expect($('#a').textContent).toBe('HELLO')
    expect($('#b').textContent).toBe('WORLD')
    html('<p id="c" data-string="nope">hello</p>')
    string('#c')
    expect($('#c').textContent).toBe('hello')
    expect($('#c').hasAttribute('data-string-state')).toBe(false)
  })

  it('uses the locale attribute or the closest lang', () => {
    html(`<div lang="tr"><span id="a" data-string="upper">istanbul</span></div>
      <span id="b" data-string="upper" data-string-locale="tr">istanbul</span>
      <span id="c" data-string="upper">istanbul</span>`)
    string()
    expect($('#a').textContent).toBe('İSTANBUL')
    expect($('#b').textContent).toBe('İSTANBUL')
    expect($('#c').textContent).toBe('ISTANBUL')
  })

  it('truncates with a title holding the full text, without overriding an authored one', () => {
    html(`<span id="a" data-string="truncate" data-string-length="12" data-string-position="middle" data-string-ellipsis="..." data-string-word-boundary="false">annual-report-2026.pdf</span>
      <span id="b" data-string="truncate" data-string-length="5" title="Mine">Long text here</span>
      <span id="c" data-string="truncate" data-string-length="50">Short</span>
      <span id="d" data-string="truncate" data-string-length="x">Kept</span>`)
    const controller = string()
    expect($('#a').textContent).toBe('annua....pdf')
    expect($('#a').title).toBe('annual-report-2026.pdf')
    expect($('#b').getAttribute('title')).toBe('Mine')
    expect($('#c').hasAttribute('title')).toBe(false)
    expect($('#d').textContent).toBe('Kept')
    controller.destroy()
    expect($('#a').hasAttribute('title')).toBe(false)
    expect($('#b').getAttribute('title')).toBe('Mine')
  })

  it('labels initials as an image with the full name', () => {
    html('<span id="a" data-string="initials">Samuel Olvera</span>')
    const controller = string()
    expect($('#a').textContent).toBe('SO')
    expect($('#a').getAttribute('role')).toBe('img')
    expect($('#a').getAttribute('aria-label')).toBe('Samuel Olvera')
    controller.destroy()
    expect($('#a').hasAttribute('role')).toBe(false)
    expect($('#a').hasAttribute('aria-label')).toBe(false)
  })

  it('mirrors a source field into a preview', () => {
    html(`<input id="title" value="Hola Mundo" />
      <code id="preview" data-string="slug" data-string-source="#title">/blog/</code>`)
    const onChange = vi.fn()
    const controller = string(undefined, { onChange })
    expect($('#preview').textContent).toBe('hola-mundo')
    type($<HTMLInputElement>('#title'), 'Otro Título')
    expect($('#preview').textContent).toBe('otro-titulo')
    expect(onChange).toHaveBeenLastCalledWith('otro-titulo', $('#preview'))
    controller.destroy()
    type($<HTMLInputElement>('#title'), 'Ignored')
    expect($('#preview').textContent).toBe('/blog/')
  })

  it('refreshes after attributes change', () => {
    html('<p id="a" data-string="kebab">Hello World</p>')
    const controller = string()
    $('#a').setAttribute('data-string', 'snake')
    controller.refresh()
    expect($('#a').textContent).toBe('hello_world')
    $('#a').removeAttribute('data-string')
    controller.refresh()
    expect($('#a').textContent).toBe('hello_world')
    controller.destroy()
    controller.refresh()
    expect($('#a').textContent).toBe('Hello World')
  })
})

describe('string() on fields', () => {
  it('converts while typing, keeps a typed separator and finalizes on blur', () => {
    html('<input id="k" data-string="kebab" value="Hello World" />')
    const field = $<HTMLInputElement>('#k')
    const events: string[] = []
    field.addEventListener(CHANGE_EVENT, event => events.push((event as CustomEvent).detail.value))
    string()
    expect(field.value).toBe('hello-world')
    field.focus()
    type(field, 'hello-world foo ')
    expect(field.value).toBe('hello-world-foo-')
    expect(field.selectionEnd).toBe(field.value.length)
    blur(field)
    expect(field.value).toBe('hello-world-foo')
    expect(events).toEqual(['hello-world', 'hello-world-foo-', 'hello-world-foo'])
  })

  it('keeps the caret position relative to the end', () => {
    html('<input id="u" data-string="upper" />')
    const field = $<HTMLInputElement>('#u')
    string()
    field.focus()
    field.value = 'abcdef'
    field.setSelectionRange(2, 2)
    field.dispatchEvent(new Event('input'))
    expect(field.value).toBe('ABCDEF')
    expect(field.selectionEnd).toBe(2)
  })

  it('keeps a space for camel case while typing', () => {
    html('<textarea id="c" data-string="camel"></textarea>')
    const field = $<HTMLTextAreaElement>('#c')
    string()
    type(field, 'hello ')
    expect(field.value).toBe('hello ')
    type(field, 'hello w')
    expect(field.value).toBe('helloW')
    type(field, ' ')
    expect(field.value).toBe('')
  })

  it('waits for blur with live false, truncate and initials', () => {
    html(`<input id="a" data-string="upper" data-string-live="false" />
      <input id="b" data-string="initials" />`)
    string()
    type($<HTMLInputElement>('#a'), 'abc')
    expect($<HTMLInputElement>('#a').value).toBe('abc')
    blur($('#a'))
    expect($<HTMLInputElement>('#a').value).toBe('ABC')
    type($<HTMLInputElement>('#b'), 'Ana López')
    expect($<HTMLInputElement>('#b').value).toBe('Ana López')
    blur($('#b'))
    expect($<HTMLInputElement>('#b').value).toBe('AL')
  })

  it('does not convert during IME composition', () => {
    html('<input id="a" data-string="upper" />')
    const field = $<HTMLInputElement>('#a')
    string()
    field.dispatchEvent(new Event('compositionstart'))
    type(field, 'ka')
    expect(field.value).toBe('ka')
    field.dispatchEvent(new Event('compositionend'))
    expect(field.value).toBe('KA')
  })

  it('tolerates fields without a selection API', () => {
    html('<input id="a" type="email" data-string="lower" />')
    const field = $<HTMLInputElement>('#a')
    string()
    field.focus()
    type(field, 'ANA@EXAMPLE.COM')
    expect(field.value).toBe('ana@example.com')
  })
})

describe('slug field following a source', () => {
  const markup = `<input id="title" value="Café & Té: Guía 2026" />
    <input id="slug" data-string="slug" data-string-source="#title" data-string-replacements='{"&":"y"}' />`

  it('follows until edited, keeps a typed separator and follows again when emptied', () => {
    html(markup)
    const title = $<HTMLInputElement>('#title')
    const slug = $<HTMLInputElement>('#slug')
    const controller = string()
    expect(slug.value).toBe('cafe-y-te-guia-2026')
    expect(slug.dataset.stringState).toBe('following')
    type(title, 'Nuevo título')
    expect(slug.value).toBe('nuevo-titulo')

    type(slug, 'Mi Página ')
    expect(slug.value).toBe('mi-pagina-')
    expect(slug.dataset.stringState).toBe('edited')
    blur(slug)
    expect(slug.value).toBe('mi-pagina')
    type(title, 'Otro')
    expect(slug.value).toBe('mi-pagina')

    controller.refresh()
    expect(slug.value).toBe('mi-pagina')
    expect(slug.dataset.stringState).toBe('edited')

    type(slug, '')
    expect(slug.dataset.stringState).toBe('following')
    expect(slug.value).toBe('')
    blur(slug)
    expect(slug.value).toBe('otro')
    type(title, 'Otra vez')
    expect(slug.value).toBe('otra-vez')

    controller.destroy()
    type(title, 'Ignored')
    expect(slug.value).toBe('otra-vez')
    expect(slug.hasAttribute('data-string-state')).toBe(false)
  })

  it('starts edited when the field already has its own value', () => {
    html(markup.replace('<input id="slug"', '<input id="slug" value="custom slug"'))
    string()
    expect($<HTMLInputElement>('#slug').value).toBe('custom-slug')
    expect($('#slug').dataset.stringState).toBe('edited')
  })

  it('accepts the source as an option and refreshes a following field', () => {
    html('<input id="title" value="A B" /><input id="slug" />')
    const controller = string('#slug', { to: 'snake', source: '#title' })
    expect($<HTMLInputElement>('#slug').value).toBe('a_b')
    $<HTMLInputElement>('#title').value = 'C D'
    controller.refresh()
    expect($<HTMLInputElement>('#slug').value).toBe('c_d')
  })

  it('ignores a source that is the element itself', () => {
    html('<input id="a" data-string="upper" data-string-source="#a" value="x" />')
    string()
    expect($('#a').dataset.stringState).toBe('ready')
  })
})

describe('autoString', () => {
  it('picks up added elements and cleans up removed ones', async () => {
    html('<p id="a" data-string="snake">Hello World</p>')
    const controller = autoString()
    expect($('#a').textContent).toBe('hello_world')
    const added = Object.assign(document.createElement('p'), { textContent: 'New Item' })
    added.setAttribute('data-string', 'constant')
    document.body.append(added)
    await Promise.resolve()
    expect(added.textContent).toBe('NEW_ITEM')
    controller.destroy()
    expect($('#a').textContent).toBe('Hello World')
  })

  it('accepts a scope, a selector and options', () => {
    html('<section id="s"><b class="x">Hello World</b></section><b class="x">Out Side</b>')
    const controller = autoString({ scope: $('#s'), selector: '.x', to: 'dot', observe: false })
    expect($('#s b').textContent).toBe('hello.world')
    expect(document.querySelectorAll('b')[1]!.textContent).toBe('Out Side')
    controller.destroy()
  })
})
