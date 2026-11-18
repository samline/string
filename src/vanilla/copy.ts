import { readNumber, readString, resolveElements, type ElementTarget } from '@samline/internal'

import { convert, isConversion, type Conversion, type ConvertOptions } from '../core/convert.js'
import { autoAll, bindAll, textOf, type AutoOptions, type Controller } from './controller.js'

export const COPY_ATTRIBUTE = 'data-string-copy'
export const COPY_STATE_ATTRIBUTE = 'data-string-copy-state'
export const COPY_EVENT = 'string:copy'

/** `copied` or `error` for `reset` milliseconds after a click. */
export type CopyState = 'copied' | 'error'

export interface CopyDetail {
  value: string
  ok: boolean
}

export interface CopyOptions extends ConvertOptions {
  /** Element or field whose text is copied. `data-string-copy="#title"` wins. */
  source?: ElementTarget
  /** Conversion applied before copying. `data-string-copy-as="kebab"` wins. */
  as?: Conversion
  /** Milliseconds before the state is cleared. Defaults to `2000`. */
  reset?: number
  /** Called after every copy attempt. */
  onCopy?: (detail: CopyDetail, button: HTMLElement) => void
}

export type AutoCopyOptions = CopyOptions & AutoOptions

// Fallback for pages without the Clipboard API (plain HTTP, restrictive
// iframes) or when it refuses: copy a hidden selection, then give focus back.
const copySelection = (value: string): boolean => {
  if (typeof document.execCommand !== 'function') return false
  const area = document.createElement('textarea')
  const focused = document.activeElement
  area.value = value
  area.setAttribute('readonly', '')
  area.setAttribute('aria-hidden', 'true')
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
  document.body.append(area)
  area.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  area.remove()
  if (focused instanceof HTMLElement) focused.focus({ preventScroll: true })
  return ok
}

const writeClipboard = async (value: string): Promise<boolean> => {
  try {
    if (!navigator.clipboard) throw new Error('No clipboard')
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return copySelection(value)
  }
}

const bindCopy = (button: HTMLElement, options: CopyOptions): Controller | null => {
  const {
    source: sourceOption,
    as: asOption,
    reset: resetOption,
    onCopy,
    ...convertOptions
  } = options
  let timer: ReturnType<typeof setTimeout> | undefined

  const finish = (detail: CopyDetail) => {
    clearTimeout(timer)
    button.setAttribute(COPY_STATE_ATTRIBUTE, detail.ok ? 'copied' : 'error')
    const reset = readNumber(button, `${COPY_ATTRIBUTE}-reset`, resetOption ?? 2000)
    timer = setTimeout(() => button.removeAttribute(COPY_STATE_ATTRIBUTE), reset)
    onCopy?.(detail, button)
    button.dispatchEvent(new CustomEvent(COPY_EVENT, { bubbles: true, detail }))
  }

  const onClick = async () => {
    const source = resolveElements(readString(button, COPY_ATTRIBUTE, '') || sourceOption)[0]
    const raw = source ? textOf(source) : ''
    const name = readString(button, `${COPY_ATTRIBUTE}-as`, '')
    const as = isConversion(name) ? name : asOption
    const value = as ? convert(raw, as, convertOptions) : raw
    finish({ value, ok: source ? await writeClipboard(value) : false })
  }

  button.addEventListener('click', onClick)

  let alive = true
  return {
    refresh: () => {},
    destroy: () => {
      if (!alive) return
      alive = false
      clearTimeout(timer)
      button.removeEventListener('click', onClick)
      button.removeAttribute(COPY_STATE_ATTRIBUTE)
    },
  }
}

/**
 * Copy another element's text, converted, to the clipboard:
 * `<button data-string-copy="#title" data-string-copy-as="kebab">Copy</button>`.
 * The button gets `data-string-copy-state="copied"` (or `error`) for two seconds.
 * Without the Clipboard API, or when it refuses, a hidden selection is copied.
 */
export const copy = bindAll<CopyOptions>(`[${COPY_ATTRIBUTE}]`, bindCopy)

/** Start every `[data-string-copy]` button in `scope`, including buttons added later. */
export const autoCopy = autoAll<CopyOptions>(`[${COPY_ATTRIBUTE}]`, copy)
