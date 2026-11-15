import * as core from '../core/index.js'
import { autoString, string, type AutoInitController } from '../vanilla/string.js'

/**
 * Classic script for pages without a build step. Every function is on
 * `window.SamlineString`, and every `[data-string]` element is converted as
 * soon as the DOM is ready, including elements added later. Add
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
  /** Start (or restart) automatic conversion. Returns the controller. */
  auto: (options?: Parameters<typeof autoString>[0]) => {
    controller?.destroy()
    controller = autoString(options)
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
export { autoString, string }
