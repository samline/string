import {
  readEnum,
  readNumber,
  readString,
  resolveElements,
  type ElementTarget,
} from '@samline/internal'

import { graphemes } from '../core/graphemes.js'
import { template, wordCount } from '../core/prose.js'
import {
  autoAll,
  bindAll,
  localeOf,
  snapshot,
  type AutoOptions,
  type Controller,
} from './controller.js'

export const COUNT_ATTRIBUTE = 'data-string-count'
export const COUNT_STATE_ATTRIBUTE = 'data-string-count-state'
export const COUNT_EVENT = 'string:count'

/** `ok` below `near`, `near` when few are left, `over` past `max`. */
export type CountState = 'ok' | 'near' | 'over'
export type CountUnit = 'characters' | 'words'

export interface CountInfo {
  count: number
  /** `undefined` without a maximum. */
  max: number | undefined
  /** `max - count`, negative when over; `undefined` without a maximum. */
  remaining: number | undefined
  state: CountState
}

export interface CountOptions {
  /** The field to count. `data-string-count="#bio"` wins over this option. */
  field?: ElementTarget
  /** Count characters (graphemes, so 😀 is one) or words. Defaults to `'characters'`. */
  unit?: CountUnit
  /** Maximum. Defaults to the field's `maxlength`, if any. */
  max?: number
  /** Remaining count at which the state becomes `near`. Defaults to 10% of `max`. */
  near?: number
  /**
   * Text shown: a template with `{count}`, `{max}` and `{remaining}`, or a
   * function. Defaults to `'{remaining}'` with a maximum and `'{count}'` without.
   */
  format?: string | ((info: CountInfo) => string)
  /** Locale for word boundaries. */
  locale?: string | string[]
  /** Called after every update. */
  onCount?: (info: CountInfo, element: HTMLElement) => void
}

export type AutoCountOptions = CountOptions & AutoOptions

const UNITS = ['characters', 'words'] as const

const bindCount = (output: HTMLElement, options: CountOptions): Controller | null => {
  const attr = (name: string) => `${COUNT_ATTRIBUTE}-${name}`
  const field = resolveElements(readString(output, COUNT_ATTRIBUTE, '') || options.field)[0]
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return null

  const restoreChildren = snapshot(output)

  const update = () => {
    const unit = readEnum(output, attr('unit'), UNITS, options.unit ?? 'characters')
    const locale = localeOf(output, attr('locale'), options.locale)
    const count =
      unit === 'words'
        ? wordCount(field.value, locale ? { locale } : {})
        : graphemes(field.value).length
    const fallbackMax = options.max ?? (field.maxLength > 0 ? field.maxLength : NaN)
    const rawMax = readNumber(output, attr('max'), fallbackMax)
    const max = Number.isFinite(rawMax) && rawMax >= 0 ? rawMax : undefined
    const remaining = max === undefined ? undefined : max - count
    const near = readNumber(output, attr('near'), options.near ?? Math.ceil((max ?? 0) * 0.1))
    const state: CountState =
      remaining === undefined ? 'ok' : remaining < 0 ? 'over' : remaining <= near ? 'near' : 'ok'
    const info: CountInfo = { count, max, remaining, state }

    const format = output.hasAttribute(attr('format'))
      ? (output.getAttribute(attr('format')) ?? '')
      : (options.format ?? (max === undefined ? '{count}' : '{remaining}'))
    output.textContent =
      typeof format === 'function'
        ? format(info)
        : template(format, { count, max, remaining }, { missing: '' })
    output.setAttribute(COUNT_STATE_ATTRIBUTE, state)
    options.onCount?.(info, output)
    output.dispatchEvent(new CustomEvent(COUNT_EVENT, { bubbles: true, detail: info }))
  }

  field.addEventListener('input', update)
  update()

  let alive = true
  return {
    refresh: () => alive && update(),
    destroy: () => {
      if (!alive) return
      alive = false
      field.removeEventListener('input', update)
      restoreChildren()
      output.removeAttribute(COUNT_STATE_ATTRIBUTE)
    },
  }
}

/**
 * Show how many characters or words a field has, or how many are left:
 * `<textarea id="bio" maxlength="160"></textarea>
 * <output data-string-count="#bio"></output>`.
 */
export const count = bindAll<CountOptions>(`[${COUNT_ATTRIBUTE}]`, bindCount)

/** Start every `[data-string-count]` element in `scope`, including elements added later. */
export const autoCount = autoAll<CountOptions>(`[${COUNT_ATTRIBUTE}]`, count)
