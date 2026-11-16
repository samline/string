import * as core from '../core/index.js'
import { autoCopy, copy, type AutoCopyOptions } from '../vanilla/copy.js'
import { autoCount, count, type AutoCountOptions } from '../vanilla/count.js'
import { autoFit, fit, type AutoFitOptions } from '../vanilla/fit.js'
import { autoSearch, search, type AutoSearchOptions } from '../vanilla/search.js'
import {
  autoString,
  string,
  type AutoInitController,
  type AutoStringOptions,
} from '../vanilla/string.js'

/**
 * Classic script for pages without a build step. Every function is on
 * `window.Strings` (`window.String` is the built-in constructor). As soon as the DOM is ready it starts every
 * `[data-string]`, `[data-string-search]`, `[data-string-count]`,
 * `[data-string-fit]` and `[data-string-copy]` element, including elements
 * added later. Add `data-manual` to the script tag to start it yourself with
 * `Strings.auto()`.
 */
const script = typeof document !== 'undefined' ? document.currentScript : null
const manual = script?.hasAttribute('data-manual') ?? false

export interface AutoAllOptions extends AutoStringOptions {
  search?: AutoSearchOptions
  count?: AutoCountOptions
  fit?: AutoFitOptions
  copy?: AutoCopyOptions
}

let controller: AutoInitController | null = null

const api = {
  ...core,
  string,
  autoString,
  search,
  autoSearch,
  count,
  autoCount,
  fit,
  autoFit,
  copy,
  autoCopy,
  /**
   * Start (or restart) every behavior. `scope` and `locale` go to all of
   * them; the other options go to `data-string`, and each behavior takes its
   * own under `search`, `count`, `fit` and `copy`. Returns the controller.
   */
  auto: (options: AutoAllOptions = {}) => {
    controller?.destroy()
    const { search: s, count: c, fit: f, copy: p, ...stringOptions } = options
    const shared = {
      ...(stringOptions.scope && { scope: stringOptions.scope }),
      ...(stringOptions.locale !== undefined && { locale: stringOptions.locale }),
    }
    const { locale: _locale, ...fitShared } = shared
    const running = [
      autoString(stringOptions),
      autoSearch({ ...shared, ...s }),
      autoCount({ ...shared, ...c }),
      autoFit({ ...fitShared, ...f }),
      autoCopy({ ...shared, ...p }),
    ]
    controller = {
      refresh: () => running.forEach(each => each.refresh()),
      destroy: () => running.forEach(each => each.destroy()),
    }
    return controller
  },
  /** The controller of the automatic run, or `null`. */
  get controller() {
    return controller
  },
}

export type StringsGlobal = typeof api

const scope = globalThis as typeof globalThis & { Strings?: StringsGlobal }
scope.Strings = api

if (!manual && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    // A page script may already have started it with its own options.
    document.addEventListener('DOMContentLoaded', () => controller ?? api.auto(), { once: true })
  } else {
    api.auto()
  }
}

export * from '../core/index.js'
export { autoCopy, autoCount, autoFit, autoSearch, autoString, copy, count, fit, search, string }
