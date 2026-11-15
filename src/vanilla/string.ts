import {
  autoInit,
  isBrowser,
  noop,
  readBoolean,
  readEnum,
  readNumber,
  readString,
  resolveElements,
  type AutoInitController,
  type ElementTarget,
} from '@samline/internal'

import { convert, isConversion, type Conversion, type ConvertOptions } from '../core/convert.js'

export type { AutoInitController, ElementTarget }

export const ATTRIBUTE = 'data-string'
export const STATE_ATTRIBUTE = 'data-string-state'
export const CHANGE_EVENT = 'string:change'

/**
 * - `ready`: the element shows its converted text.
 * - `following`: a field copies its converted `source` (a slug that follows the title).
 * - `edited`: the user typed in a field that had a `source`; it no longer follows.
 */
export type StringState = 'ready' | 'following' | 'edited'

export interface StringOptions extends ConvertOptions {
  /** The conversion. `data-string="kebab"` wins over this option. */
  to?: Conversion
  /**
   * An input, textarea or element whose text feeds this element, for example
   * the title that fills a slug field. `data-string-source="#title"`.
   */
  source?: ElementTarget
  /**
   * Convert fields while the user types (separators the user just typed are
   * kept until the field loses focus). Defaults to `true`; `false` converts on
   * blur only. `truncate` and `initials` always wait for blur.
   */
  live?: boolean
  /** Called with the new value after every conversion that changed it. */
  onChange?: (value: string, element: HTMLElement) => void
}

export interface StringController {
  /** Read the attributes again and convert again. */
  refresh: () => void
  /** Remove every listener and restore the original markup. Safe to call twice. */
  destroy: () => void
}

export interface AutoStringOptions extends StringOptions {
  /** Elements to convert. Defaults to `[data-string]`. */
  selector?: string
  /** Where to look. Defaults to `document`. */
  scope?: ParentNode
  /** Pick up elements added later and clean up removed ones. Defaults to `true`. */
  observe?: boolean
}

type Field = HTMLInputElement | HTMLTextAreaElement

const POSITIONS = ['end', 'middle', 'start'] as const

/** Separators kept at the end of a field while the user is still typing. */
const TYPING_SEPARATOR: Partial<Record<Conversion, string>> = {
  kebab: '-',
  snake: '_',
  dot: '.',
  path: '/',
  constant: '_',
  train: '-',
  camel: ' ',
  pascal: ' ',
}

const isField = (element: Element): element is Field =>
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement

const textOf = (element: Element): string =>
  isField(element) ? element.value : (element.textContent ?? '')

const parseReplacements = (raw: string): Record<string, string> | undefined => {
  try {
    const value: unknown = JSON.parse(raw)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string'
        )
      )
    }
  } catch {
    // Invalid JSON: ignore the attribute.
  }
  return undefined
}

interface Config {
  to: Conversion
  options: ConvertOptions
  source: Element | null
  live: boolean
}

/** Options from `data-string-*` attributes; attributes win over JavaScript options. */
const readConfig = (element: HTMLElement, options: StringOptions): Config | null => {
  const raw = element.getAttribute(ATTRIBUTE)?.trim()
  const to = isConversion(raw) ? raw : options.to
  if (!to) return null

  const { to: _to, source: sourceOption, live, onChange: _onChange, ...base } = options
  const converted: ConvertOptions = { ...base }
  const attr = (name: string) => `${ATTRIBUTE}-${name}`
  const has = (name: string) => element.hasAttribute(attr(name))

  const locale =
    readString(element, attr('locale'), '') ||
    base.locale ||
    element.closest('[lang]')?.getAttribute('lang') ||
    ''
  if (locale) converted.locale = locale
  else delete converted.locale

  if (has('separator')) converted.separator = element.getAttribute(attr('separator')) ?? ''
  if (has('lower')) converted.lower = readBoolean(element, attr('lower'), base.lower ?? true)
  if (has('max-length')) {
    const maxLength = readNumber(element, attr('max-length'), NaN)
    if (Number.isFinite(maxLength)) converted.maxLength = maxLength
  }
  if (has('replacements')) {
    const replacements = parseReplacements(element.getAttribute(attr('replacements')) ?? '')
    if (replacements) converted.replacements = replacements
  }
  if (has('small-words')) {
    converted.smallWords = readString(element, attr('small-words'), '')
      .split(/[\s,]+/)
      .filter(Boolean)
  }
  if (has('length')) {
    const length = readNumber(element, attr('length'), NaN)
    if (Number.isFinite(length)) converted.length = length
  }
  if (has('ellipsis')) converted.ellipsis = element.getAttribute(attr('ellipsis')) ?? ''
  if (has('position'))
    converted.position = readEnum(element, attr('position'), POSITIONS, base.position ?? 'end')
  if (has('word-boundary'))
    converted.wordBoundary = readBoolean(element, attr('word-boundary'), true)
  if (has('max')) {
    const max = readNumber(element, attr('max'), NaN)
    if (Number.isFinite(max)) converted.max = max
  }

  const sourceSelector = readString(element, attr('source'), '')
  const source = resolveElements(sourceSelector || sourceOption)[0] ?? null

  return {
    to,
    options: converted,
    source: source === element ? null : source,
    live: readBoolean(element, attr('live'), live ?? true),
  }
}

/** Live conversion keeps what the user is still typing: a trailing separator. */
const convertWhileTyping = (value: string, { to, options }: Config): string => {
  if (to === 'slug') return convert(value, to, { ...options, trim: false })
  const separator = TYPING_SEPARATOR[to]
  const result = convert(value, to, options)
  return separator !== undefined && result && /[^\p{L}\p{N}]$/u.test(value)
    ? result + separator
    : result
}

const bind = (element: HTMLElement, options: StringOptions): StringController | null => {
  let config = readConfig(element, options)
  if (!config) return null

  const field = isField(element) ? element : null
  const originalNodes = Array.from(element.childNodes)
  const originalText = textOf(element)
  let detachSource = noop
  let state: StringState = 'ready'
  let composing = false

  const setState = (next: StringState) => {
    state = next
    element.setAttribute(STATE_ATTRIBUTE, next)
  }

  const notify = (value: string) => {
    options.onChange?.(value, element)
    element.dispatchEvent(
      new CustomEvent(CHANGE_EVENT, { bubbles: true, detail: { value, state } })
    )
  }

  /** Attributes the author wrote before we started; theirs always win. */
  const authored = new Map<string, string | null>()
  const describe = (name: string, value: string | null) => {
    if (!authored.has(name)) authored.set(name, element.getAttribute(name))
    if (authored.get(name) !== null) return
    if (value === null) element.removeAttribute(name)
    else element.setAttribute(name, value)
  }

  const setFieldValue = (value: string) => {
    if (!field || field.value === value) return
    const focused = field.ownerDocument.activeElement === field
    let fromEnd = 0
    try {
      fromEnd = field.value.length - (field.selectionEnd ?? field.value.length)
    } catch {
      // Inputs like type="email" have no selection API.
    }
    field.value = value
    if (focused) {
      const caret = Math.max(0, value.length - fromEnd)
      try {
        field.setSelectionRange(caret, caret)
      } catch {
        // See above.
      }
    }
    notify(value)
  }

  const render = (text: string) => {
    const current = config!
    const output = convert(text, current.to, current.options)
    if (field) return setFieldValue(output)
    if (element.textContent !== output) {
      element.textContent = output
      notify(output)
    }
    // The full text stays available when the visible text is shorter.
    describe('title', current.to === 'truncate' && output !== text ? text : null)
    const label = current.to === 'initials' ? text.trim() : ''
    describe('role', label ? 'img' : null)
    describe('aria-label', label || null)
  }

  const fromSource = () => config!.source && render(textOf(config!.source))

  const onSourceInput = () => {
    if (!field || state === 'following') fromSource()
  }

  const onFieldInput = () => {
    if (!field || composing) return
    if (config!.source) {
      if (field.value === '') return setState('following')
      if (state !== 'edited') setState('edited')
    }
    if (config!.live && config!.to !== 'truncate' && config!.to !== 'initials') {
      setFieldValue(convertWhileTyping(field.value, config!))
    }
  }

  // blur, not change: Safari skips change when a script edited the value during input.
  const onFieldBlur = () => {
    if (!field) return
    if (config!.source && state === 'following') return fromSource()
    render(field.value)
  }

  const onCompositionStart = () => (composing = true)
  const onCompositionEnd = () => {
    composing = false
    onFieldInput()
  }

  const attachSource = () => {
    detachSource()
    const source = config!.source
    if (!source) return (detachSource = noop)
    // string:change too, so conversions chain: title → slug field → URL preview.
    source.addEventListener('input', onSourceInput)
    source.addEventListener(CHANGE_EVENT, onSourceInput)
    detachSource = () => {
      source.removeEventListener('input', onSourceInput)
      source.removeEventListener(CHANGE_EVENT, onSourceInput)
    }
  }

  const start = () => {
    const current = config!
    attachSource()
    if (field && current.source) {
      const expected = convert(textOf(current.source), current.to, current.options)
      setState(field.value === '' || field.value === expected ? 'following' : 'edited')
      if (state === 'following') fromSource()
      else render(field.value)
    } else {
      setState('ready')
      if (current.source) fromSource()
      else render(field ? field.value : originalText)
    }
  }

  if (field) {
    field.addEventListener('input', onFieldInput)
    field.addEventListener('blur', onFieldBlur)
    field.addEventListener('compositionstart', onCompositionStart)
    field.addEventListener('compositionend', onCompositionEnd)
  }
  start()

  let active = true
  return {
    refresh: () => {
      if (!active) return
      const next = readConfig(element, options)
      if (!next) return
      config = next
      // A field keeps following, or keeps the user's edit, across refreshes.
      if (field && config.source && state !== 'ready') {
        attachSource()
        return state === 'following' ? fromSource() : render(field.value)
      }
      start()
    },
    destroy: () => {
      if (!active) return
      active = false
      detachSource()
      if (field) {
        field.removeEventListener('input', onFieldInput)
        field.removeEventListener('blur', onFieldBlur)
        field.removeEventListener('compositionstart', onCompositionStart)
        field.removeEventListener('compositionend', onCompositionEnd)
      } else {
        element.replaceChildren(...originalNodes)
      }
      authored.forEach((before, name) => before === null && element.removeAttribute(name))
      element.removeAttribute(STATE_ATTRIBUTE)
    },
  }
}

/**
 * Convert text in the page from HTML attributes.
 *
 * - On any element, `data-string="kebab"` replaces its text with the
 *   converted text; `destroy()` puts the original markup back.
 * - On an input or textarea, the value is converted as the user types and
 *   finalized on blur.
 * - With `data-string-source="#title"`, the element follows another field:
 *   a slug field fills itself from the title until the user edits it, and
 *   follows again when the user empties it.
 *
 * Returns `{ refresh, destroy }`. Without a DOM it does nothing.
 */
export const string = (
  target: ElementTarget = `[${ATTRIBUTE}]`,
  options: StringOptions = {}
): StringController => {
  if (!isBrowser()) return { refresh: noop, destroy: noop }
  const controllers = resolveElements(target)
    .filter((element): element is HTMLElement => element instanceof HTMLElement)
    .map(element => bind(element, options))
    .filter((controller): controller is StringController => controller !== null)
  return {
    refresh: () => controllers.forEach(controller => controller.refresh()),
    destroy: () => controllers.forEach(controller => controller.destroy()),
  }
}

/**
 * Convert every `[data-string]` element in `scope`, including elements added
 * later, and clean up elements that are removed.
 */
export const autoString = ({
  selector = `[${ATTRIBUTE}]`,
  scope,
  observe = true,
  ...options
}: AutoStringOptions = {}): AutoInitController =>
  autoInit({
    selector,
    observe,
    ...(scope && { root: scope }),
    init: element => {
      const controller = string(element, options)
      return controller.destroy
    },
  })
