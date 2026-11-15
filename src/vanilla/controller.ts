import {
  autoInit,
  isBrowser,
  noop,
  resolveElements,
  type AutoInitController,
  type ElementTarget,
} from '@samline/internal'

export interface Controller {
  /** Read the attributes again and update. */
  refresh: () => void
  /** Remove listeners and restore the original markup. Safe to call twice. */
  destroy: () => void
}

export interface AutoOptions {
  /** Elements to start. Defaults to the behavior's attribute. */
  selector?: string
  /** Where to look. Defaults to `document`. */
  scope?: ParentNode
  /** Pick up elements added later and clean up removed ones. Defaults to `true`. */
  observe?: boolean
}

/** Bind every element of `target` and combine their controllers. Inert without a DOM. */
export const bindAll =
  <O>(selector: string, bind: (element: HTMLElement, options: O) => Controller | null) =>
  (target: ElementTarget = selector, options = {} as O): Controller => {
    if (!isBrowser()) return { refresh: noop, destroy: noop }
    const controllers = resolveElements(target)
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .map(element => bind(element, options))
      .filter((controller): controller is Controller => controller !== null)
    return {
      refresh: () => controllers.forEach(controller => controller.refresh()),
      destroy: () => controllers.forEach(controller => controller.destroy()),
    }
  }

/** The `auto*()` version of a behavior: every match in `scope`, now and later. */
export const autoAll =
  <O>(selector: string, run: (target: ElementTarget, options: O) => Controller) =>
  (
    {
      selector: chosen = selector,
      scope,
      observe = true,
      ...options
    }: AutoOptions & O = {} as AutoOptions & O
  ): AutoInitController =>
    autoInit({
      selector: chosen,
      observe,
      ...(scope && { root: scope }),
      init: element => run(element, options as O).destroy,
    })

/** Restore an element's original child nodes, keeping element identity. */
export const snapshot = (element: Element) => {
  const nodes = Array.from(element.childNodes)
  return () => element.replaceChildren(...nodes)
}

/** Track attributes we set, so the author's own values win and ours are removed on destroy. */
export const attributes = (element: Element) => {
  const authored = new Map<string, string | null>()
  return {
    set: (name: string, value: string | null) => {
      if (!authored.has(name)) authored.set(name, element.getAttribute(name))
      if (authored.get(name) !== null) return
      if (value === null) element.removeAttribute(name)
      else element.setAttribute(name, value)
    },
    restore: () =>
      authored.forEach((before, name) => before === null && element.removeAttribute(name)),
  }
}

/** Locale from an attribute, an option or the closest `lang`. */
export const localeOf = (element: Element, attribute: string, option?: string | string[]) =>
  element.getAttribute(attribute)?.trim() ||
  option ||
  element.closest('[lang]')?.getAttribute('lang') ||
  undefined

/** Text of a field or an element. */
export const textOf = (element: Element): string =>
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
    ? element.value
    : (element.textContent ?? '')
