import * as core from '../core/index.js'
import { autoSearch, search, type AutoSearchOptions } from '../vanilla/search.js'
import {
  autoString,
  string,
  type AutoInitController,
  type AutoStringOptions,
} from '../vanilla/string.js'

/**
 * Classic script for pages without a build step. Every function is on
 * `window.SamlineString`. As soon as the DOM is ready, every `[data-string]`
 * element is converted and every `[data-string-search]` list filters as the
 * user types, including elements added later. Add
 * `data-manual` to the script tag to start it yourself with
 * `SamlineString.auto()`.
 */
const script = typeof document !== 'undefined' ? document.currentScript : null
const manual = script?.hasAttribute('data-manual') ?? false

let controller: AutoInitController | null = null

const api = {
  ...core,
  string,
  autoString,
  search,
  autoSearch,
  /**
   * Start (or restart) automatic conversion and search. Options go to both;
   * pass `{ search: { ... } }` for search-only options. Returns the controller.
   */
  auto: (options: AutoStringOptions & { search?: AutoSearchOptions } = {}) => {
    controller?.destroy()
    const { search: searchOptions, ...stringOptions } = options
    const strings = autoString(stringOptions)
    const searches = autoSearch({
      ...(stringOptions.scope && { scope: stringOptions.scope }),
      ...(stringOptions.locale !== undefined && { locale: stringOptions.locale }),
      ...searchOptions,
    })
    controller = {
      refresh: () => {
        strings.refresh()
        searches.refresh()
      },
      destroy: () => {
        strings.destroy()
        searches.destroy()
      },
    }
    return controller
  },
  /** The controller of the automatic run, or `null`. */
  get controller() {
    return controller
  },
}

export type SamlineStringGlobal = typeof api

const scope = globalThis as typeof globalThis & { SamlineString?: SamlineStringGlobal }
scope.SamlineString = api

if (!manual && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    // A page script may already have started it with its own options.
    document.addEventListener('DOMContentLoaded', () => controller ?? api.auto(), { once: true })
  } else {
    api.auto()
  }
}

export * from '../core/index.js'
export { autoSearch, autoString, search, string }
