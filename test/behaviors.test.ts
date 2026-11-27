import { afterEach, describe, expect, it, vi } from 'vitest'

import { hashColor } from '../src/index.js'
import {
  autoCopy,
  autoCount,
  autoFit,
  COPY_EVENT,
  copy,
  count,
  COUNT_EVENT,
  fit,
  string,
} from '../src/vanilla/index.js'

const $ = <T extends Element = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!
const type = (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  field.value = value
  field.dispatchEvent(new Event('input'))
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('hashColor', () => {
  it('is stable and ignores case, accents and spaces', () => {
    expect(hashColor('Ana López')).toMatch(/^hsl\(\d{1,3} 55% \d{1,2}%\)$/)
    expect(hashColor(' ana lopez ')).toBe(hashColor('Ana López'))
    expect(hashColor('Ana López')).not.toBe(hashColor('Samuel Olvera'))
    expect(hashColor('x', { saturation: 70, lightness: 30 })).toMatch(/ 70% \d{1,2}%\)$/)
  })

  it('lowers lightness so white text keeps its contrast', () => {
    const lightness = (color: string) => Number(/ (\d+)%\)$/.exec(color)![1])
    const names = Array.from({ length: 200 }, (_, index) => `name ${index}`)
    const values = names.map(name => lightness(hashColor(name)))
    expect(Math.max(...values)).toBeLessThanOrEqual(45)
    expect(Math.min(...values)).toBeLessThan(45)
    expect(names.every(name => lightness(hashColor(name, { contrast: 0 })) === 45)).toBe(true)
    expect(lightness(hashColor('x', { lightness: 150, contrast: 0 }))).toBe(100)
    expect(lightness(hashColor('x', { contrast: 30 }))).toBe(0)
    expect(hashColor(undefined as never)).toMatch(/^hsl\(/)
  })
})

describe('data-string-color', () => {
  it('sets --string-color from the original text and removes it on destroy', () => {
    document.body.innerHTML = `<span id="a" data-string="initials" data-string-color>Ana López</span>
      <span id="b" data-string="initials" style="color: red">Ana</span>`
    const controller = string()
    expect($('#a').style.getPropertyValue('--string-color')).toBe(hashColor('Ana López'))
    expect($('#b').style.getPropertyValue('--string-color')).toBe('')
    controller.destroy()
    expect($('#a').hasAttribute('style')).toBe(false)
    expect($('#b').getAttribute('style')).toBe('color: red')
  })

  it('accepts the color option with hashColor settings', () => {
    document.body.innerHTML = `<span id="a" data-string="initials">Ana</span>`
    string('#a', { color: { lightness: 30 } })
    expect($('#a').style.getPropertyValue('--string-color')).toBe(
      hashColor('Ana', { lightness: 30 })
    )
  })
})

describe('count', () => {
  it('shows remaining graphemes from maxlength with states', () => {
    document.body.innerHTML = `<textarea id="bio" maxlength="20"></textarea>
      <output id="out" data-string-count="#bio"><i>20</i></output>`
    const events: unknown[] = []
    $('#out').addEventListener(COUNT_EVENT, event => events.push((event as CustomEvent).detail))
    const controller = count()
    const field = $<HTMLTextAreaElement>('#bio')
    expect($('#out').textContent).toBe('20')
    expect($('#out').dataset.stringCountState).toBe('ok')
    type(field, '👨‍👩‍👧 hola')
    expect($('#out').textContent).toBe('14')
    type(field, 'a'.repeat(18))
    expect($('#out').dataset.stringCountState).toBe('near')
    expect(events[events.length - 1]).toEqual({ count: 18, max: 20, remaining: 2, state: 'near' })
    controller.destroy()
    controller.destroy()
    expect($('#out').innerHTML).toBe('<i>20</i>')
    expect($('#out').hasAttribute('data-string-count-state')).toBe(false)
    type(field, '')
    expect($('#out').innerHTML).toBe('<i>20</i>')
  })

  it('reads unit, max, near and format attributes', () => {
    document.body.innerHTML = `<input id="t" />
      <p id="out" data-string-count="#t" data-string-count-unit="words" data-string-count-max="3"
        data-string-count-near="0" data-string-count-format="{count}/{max} words"></p>`
    count()
    type($<HTMLInputElement>('#t'), 'uno, dos tres cuatro')
    expect($('#out').textContent).toBe('4/3 words')
    expect($('#out').dataset.stringCountState).toBe('over')
    type($<HTMLInputElement>('#t'), 'uno dos tres')
    expect($('#out').dataset.stringCountState).toBe('near')
    type($<HTMLInputElement>('#t'), 'uno dos')
    expect($('#out').dataset.stringCountState).toBe('ok')
  })

  it('counts without a maximum and takes a format function and options', () => {
    document.body.innerHTML = `<input id="t" /><span id="a"></span><span id="b" data-string-count="#t"></span>`
    const onCount = vi.fn()
    const controller = count('#a', {
      field: '#t',
      format: ({ count: n }) => `${n} chars`,
      onCount,
    })
    count('#b')
    type($<HTMLInputElement>('#t'), 'héllo')
    expect($('#a').textContent).toBe('5 chars')
    expect($('#b').textContent).toBe('5')
    expect(onCount).toHaveBeenLastCalledWith(
      { count: 5, max: undefined, remaining: undefined, state: 'ok' },
      $('#a')
    )
    controller.refresh()
    expect($('#a').textContent).toBe('5 chars')
  })

  it('ignores outputs without a field and starts automatically', async () => {
    document.body.innerHTML = `<span id="a" data-string-count="#none"></span><input id="t" value="ab" />`
    const controller = autoCount()
    expect($('#a').hasAttribute('data-string-count-state')).toBe(false)
    document.body.insertAdjacentHTML('beforeend', '<span id="b" data-string-count="#t"></span>')
    await Promise.resolve()
    expect($('#b').textContent).toBe('2')
    controller.destroy()
  })
})

describe('copy', () => {
  const stubClipboard = (writeText = vi.fn().mockResolvedValue(undefined)) => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    return writeText
  }
  const click = async (button: HTMLElement) => {
    button.click()
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  it('copies converted text and resets the state', async () => {
    const writeText = stubClipboard()
    document.body.innerHTML = `<input id="title" value="Hola Mundo" />
      <button id="b" data-string-copy="#title" data-string-copy-as="kebab" data-string-copy-reset="50">Copy</button>`
    const events: unknown[] = []
    $('#b').addEventListener(COPY_EVENT, event => events.push((event as CustomEvent).detail))
    const controller = copy()
    await click($('#b'))
    expect(writeText).toHaveBeenCalledWith('hola-mundo')
    expect($('#b').dataset.stringCopyState).toBe('copied')
    expect(events).toEqual([{ value: 'hola-mundo', ok: true }])
    await new Promise(resolve => setTimeout(resolve, 80))
    expect($('#b').hasAttribute('data-string-copy-state')).toBe(false)
    await click($('#b'))
    controller.destroy()
    controller.destroy()
    expect($('#b').hasAttribute('data-string-copy-state')).toBe(false)
    await click($('#b'))
    expect(writeText).toHaveBeenCalledTimes(2)
  })

  it('copies raw text from options and reports errors', async () => {
    const writeText = stubClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    Object.assign(document, { execCommand: undefined })
    document.body.innerHTML = `<p id="src">Ünïcode</p><button id="b">Copy</button><button id="c" data-string-copy="#none">x</button>`
    const onCopy = vi.fn()
    copy('#b', { source: '#src', onCopy })
    copy('#c', { as: 'slug' })
    await click($('#b'))
    expect(writeText).toHaveBeenCalledWith('Ünïcode')
    expect($('#b').dataset.stringCopyState).toBe('error')
    expect(onCopy).toHaveBeenCalledWith({ value: 'Ünïcode', ok: false }, $('#b'))
    await click($('#c'))
    expect($('#c').dataset.stringCopyState).toBe('error')
  })

  it('falls back to a selection copy without a clipboard and starts automatically', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })
    const copied: string[] = []
    const execCommand = vi.fn(() => {
      copied.push(document.querySelector('textarea')?.value ?? '')
      return true
    })
    Object.assign(document, { execCommand })
    document.body.innerHTML = `<p id="src">x</p><button id="b" data-string-copy="#src" data-string-copy-as="upper">Copy</button>`
    $('#b').focus()
    const controller = autoCopy({ reset: 10 })
    await click($('#b'))
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(copied).toEqual(['X'])
    expect($('#b').dataset.stringCopyState).toBe('copied')
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe($('#b'))
    execCommand.mockImplementation(() => {
      throw new Error('blocked')
    })
    await click($('#b'))
    expect($('#b').dataset.stringCopyState).toBe('error')
    controller.destroy()
    Object.assign(document, { execCommand: undefined })
  })
})

describe('fit', () => {
  // jsdom has no layout: each character is 10px wide in a 100px box.
  // What is drawn: the shortened copy when there is one, else the element's own text.
  const visible = (element: Element) =>
    element.querySelector('[aria-hidden="true"]')?.textContent ?? element.textContent ?? ''
  const layout = (element: HTMLElement, width = 100) => {
    Object.defineProperty(element, 'clientWidth', { configurable: true, get: () => width })
    Object.defineProperty(element, 'scrollWidth', {
      configurable: true,
      get: () => Array.from(visible(element)).length * 10,
    })
  }

  it('cuts the middle to fit and restores the element', () => {
    document.body.innerHTML = `<span id="a" data-string-fit style="color: red">annual-report-2026-final.pdf</span>
      <span id="b" data-string-fit="end" data-string-fit-ellipsis="...">The quick brown fox</span>
      <span id="c" data-string-fit>short</span>
      <span id="d" data-string-fit>no width at all here</span>`
    ;['#a', '#b', '#c'].forEach(id => layout($(id)))
    layout($('#d'), 0)
    const controller = fit()
    expect(visible($('#a'))).toBe('annua….pdf')
    // The full text stays in the DOM for assistive technology.
    expect($('#a').textContent).toContain('annual-report-2026-final.pdf')
    expect($('#a').querySelector('[aria-hidden]')).not.toBeNull()
    expect($('#a').title).toBe('annual-report-2026-final.pdf')
    expect($('#a').dataset.stringFitState).toBe('truncated')
    expect(visible($('#b'))).toBe('The qui...')
    expect($('#c').textContent).toBe('short')
    expect($('#c').dataset.stringFitState).toBe('full')
    expect($('#d').textContent).toBe('no width at all here')

    layout($('#a'), 400)
    controller.refresh()
    expect($('#a').textContent).toBe('annual-report-2026-final.pdf')
    expect($('#a').hasAttribute('title')).toBe(false)

    expect($('#a').querySelector('[aria-hidden]')).toBeNull()

    layout($('#a'), 100)
    controller.refresh()
    controller.destroy()
    controller.destroy()
    expect($('#a').children).toHaveLength(0)
    expect($('#a').textContent).toBe('annual-report-2026-final.pdf')
    expect($('#a').getAttribute('style')).toBe('color: red')
    expect($('#a').hasAttribute('title')).toBe(false)
    expect($('#c').hasAttribute('style')).toBe(false)
  })

  it('fits again when the size changes', async () => {
    let callback: () => void = () => {}
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(run: () => void) {
          callback = run
        }
        observe = observe
        disconnect = disconnect
      }
    )
    document.body.innerHTML = `<span id="a" data-string-fit="start">0123456789abcdef</span>`
    layout($('#a'))
    const controller = fit('#a', { ellipsis: '~' })
    expect(visible($('#a'))).toBe('~789abcdef')
    expect(observe).toHaveBeenCalled()
    layout($('#a'), 60)
    callback()
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    expect(visible($('#a'))).toBe('~bcdef')
    controller.destroy()
    expect(disconnect).toHaveBeenCalled()
  })

  it('falls back to window resize and starts automatically', async () => {
    vi.stubGlobal('ResizeObserver', undefined)
    document.body.innerHTML = `<span id="a" data-string-fit>abcdefghijklmnop</span>`
    layout($('#a'))
    const controller = autoFit()
    expect(visible($('#a'))).toBe('abcde…mnop')
    layout($('#a'), 50)
    window.dispatchEvent(new Event('resize'))
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    expect(visible($('#a'))).toBe('ab…op')
    controller.destroy()
    expect($('#a').textContent).toBe('abcdefghijklmnop')
  })
})
