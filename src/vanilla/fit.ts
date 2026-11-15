import { readEnum } from '@samline/internal'

import { graphemes } from '../core/graphemes.js'
import { truncate, type TruncatePosition } from '../core/text.js'
import {
  attributes,
  autoAll,
  bindAll,
  snapshot,
  type AutoOptions,
  type Controller,
} from './controller.js'

export const FIT_ATTRIBUTE = 'data-string-fit'
export const FIT_STATE_ATTRIBUTE = 'data-string-fit-state'

/** `full` when the whole text fits, `truncated` when it was shortened. */
export type FitState = 'full' | 'truncated'

export interface FitOptions {
  /** Where the text is cut. `data-string-fit="end"` wins. Defaults to `'middle'`. */
  position?: TruncatePosition
  /** Defaults to `'…'`. */
  ellipsis?: string
}

export type AutoFitOptions = FitOptions & AutoOptions

const POSITIONS = ['end', 'middle', 'start'] as const

const bindFit = (element: HTMLElement, options: FitOptions): Controller | null => {
  const restoreChildren = snapshot(element)
  const managed = attributes(element)
  const text = element.textContent ?? ''
  const styleBefore = element.getAttribute('style')
  let alive = true
  element.style.whiteSpace = 'nowrap'
  element.style.overflow = 'hidden'

  const fits = () => element.scrollWidth <= element.clientWidth

  const fit = () => {
    const position = readEnum(element, FIT_ATTRIBUTE, POSITIONS, options.position ?? 'middle')
    const ellipsis = element.hasAttribute(`${FIT_ATTRIBUTE}-ellipsis`)
      ? (element.getAttribute(`${FIT_ATTRIBUTE}-ellipsis`) ?? '')
      : (options.ellipsis ?? '…')
    if (element.textContent !== text) element.textContent = text
    // Without a width (inline or hidden elements) there is nothing to fit.
    if (element.clientWidth === 0 || fits()) {
      element.setAttribute(FIT_STATE_ATTRIBUTE, 'full')
      managed.set('title', null)
      return
    }
    // Binary search for the longest text that fits.
    let low = 0
    let high = graphemes(text).length - 1
    let best = truncate(text, 0, { position, ellipsis, wordBoundary: false })
    while (low <= high) {
      const middle = Math.floor((low + high) / 2)
      const candidate = truncate(text, middle, { position, ellipsis, wordBoundary: false })
      element.textContent = candidate
      if (fits()) {
        best = candidate
        low = middle + 1
      } else high = middle - 1
    }
    element.textContent = best
    element.setAttribute(FIT_STATE_ATTRIBUTE, 'truncated')
    managed.set('title', text)
  }

  let frame = 0
  const schedule = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(fit)
  }
  let observer: ResizeObserver | null = null
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(schedule)
    observer.observe(element)
  } else {
    window.addEventListener('resize', schedule)
  }
  // Web fonts change text width once they load.
  void element.ownerDocument.fonts?.ready.then(() => alive && fit())
  fit()

  return {
    refresh: () => alive && fit(),
    destroy: () => {
      if (!alive) return
      alive = false
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', schedule)
      restoreChildren()
      managed.restore()
      if (styleBefore === null) element.removeAttribute('style')
      else element.setAttribute('style', styleBefore)
      element.removeAttribute(FIT_STATE_ATTRIBUTE)
    },
  }
}

/**
 * Shorten text to fit its element's width, cutting in the middle by
 * default, and fit again when the width changes:
 * `<span data-string-fit style="display: block">annual-report-2026-final.pdf</span>`.
 * The element needs a width (block, inline-block, flex or grid item).
 */
export const fit = bindAll<FitOptions>(`[${FIT_ATTRIBUTE}]`, bindFit)

/** Start every `[data-string-fit]` element in `scope`, including elements added later. */
export const autoFit = autoAll<FitOptions>(`[${FIT_ATTRIBUTE}]`, fit)
