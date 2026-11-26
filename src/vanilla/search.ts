import {
  autoInit,
  isBrowser,
  noop,
  readBoolean,
  readNumber,
  readString,
  resolveElements,
  type AutoInitController,
  type ElementTarget,
} from '@samline/internal'

import { contains, highlight, type MatchOptions } from '../core/search.js'

export const SEARCH_ATTRIBUTE = 'data-string-search'
export const SEARCH_STATE_ATTRIBUTE = 'data-string-search-state'
export const SEARCH_EMPTY_ATTRIBUTE = 'data-string-search-empty'
export const SEARCH_EVENT = 'string:search'

/**
 * - `idle`: the query is shorter than `min`; every item is shown.
 * - `results`: at least one item matches.
 * - `empty`: nothing matches; the empty message is shown.
 */
export type SearchState = 'idle' | 'results' | 'empty'

export interface SearchResult {
  query: string
  /** Items that match, in document order. */
  matches: HTMLElement[]
  /** Number of items searched. */
  total: number
  state: SearchState
}

export interface SearchOptions extends MatchOptions {
  /** The search field. `data-string-search="#q"` wins over this option. */
  input?: ElementTarget
  /** Selector for the items inside the list. Defaults to its direct children. */
  items?: string
  /** Wrap matching text in `<mark>`. Defaults to `true`. */
  highlight?: boolean
  /** Shortest query that filters, in characters. Defaults to `1`. */
  min?: number
  /** Element shown when nothing matches. Defaults to a `[data-string-search-empty]` child. */
  empty?: ElementTarget
  /** Called after every search. */
  onSearch?: (result: SearchResult, list: HTMLElement) => void
}

export interface SearchController {
  /** Collect the items again (after adding or removing some) and search again. */
  refresh: () => void
  /** Remove listeners and marks and show every item as it was. Safe to call twice. */
  destroy: () => void
}

export interface AutoSearchOptions extends SearchOptions {
  /** Lists to filter. Defaults to `[data-string-search]`. */
  selector?: string
  /** Where to look. Defaults to `document`. */
  scope?: ParentNode
  /** Pick up lists added later and clean up removed ones. Defaults to `true`. */
  observe?: boolean
}

interface MarkRecord {
  original: Text
  nodes: Node[]
}

const textNodes = (root: Node): Text[] => {
  const walker = root.ownerDocument!.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text)
  return nodes
}

const bindSearch = (list: HTMLElement, options: SearchOptions): SearchController | null => {
  const attr = (name: string) => `${SEARCH_ATTRIBUTE}-${name}`
  const selector = readString(list, SEARCH_ATTRIBUTE, '')
  const input = resolveElements(selector || options.input)[0]
  if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return null

  const doc = list.ownerDocument
  const authoredHidden = new Map<HTMLElement, boolean>()
  let marks: MarkRecord[] = []
  let items: HTMLElement[] = []
  let empty: HTMLElement | null = null

  const settings = () => {
    const locale =
      readString(list, attr('locale'), '') ||
      options.locale ||
      list.closest('[lang]')?.getAttribute('lang') ||
      ''
    const match: MatchOptions = {
      split: readBoolean(list, attr('split'), options.split ?? true),
      ...(locale && { locale }),
    }
    return {
      match,
      mark: readBoolean(list, attr('highlight'), options.highlight ?? true),
      min: Math.max(1, readNumber(list, attr('min'), options.min ?? 1)),
      items: readString(list, attr('items'), options.items ?? ''),
    }
  }

  const remember = (element: HTMLElement) => {
    if (!authoredHidden.has(element)) authoredHidden.set(element, element.hidden)
  }

  const collect = () => {
    const { items: itemSelector } = settings()
    const found = itemSelector
      ? Array.from(list.querySelectorAll<HTMLElement>(itemSelector))
      : (Array.from(list.children) as HTMLElement[])
    const emptyOption = resolveElements(options.empty)[0]
    empty =
      list.querySelector<HTMLElement>(`[${SEARCH_EMPTY_ATTRIBUTE}]`) ??
      (emptyOption instanceof HTMLElement ? emptyOption : null)
    items = found.filter(
      item => item instanceof HTMLElement && item !== empty && !item.contains(empty)
    )
    items.forEach(remember)
    if (empty) remember(empty)
    // Items the author hid stay hidden and are not searched.
    items = items.filter(item => !authoredHidden.get(item))
  }

  const clearMarks = () => {
    for (const { original, nodes } of marks) {
      const first = nodes[0]
      if (first?.parentNode) first.parentNode.insertBefore(original, first)
      nodes.forEach(node => node.parentNode?.removeChild(node))
    }
    marks = []
  }

  const markItem = (item: HTMLElement, query: string, match: MatchOptions) => {
    for (const node of textNodes(item)) {
      const segments = highlight(node.data, query, match)
      if (!segments.some(segment => segment.match)) continue
      const nodes = segments.map(segment => {
        if (!segment.match) return doc.createTextNode(segment.text)
        const mark = doc.createElement('mark')
        mark.textContent = segment.text
        return mark
      })
      const parent = node.parentNode!
      nodes.forEach(created => parent.insertBefore(created, node))
      parent.removeChild(node)
      marks.push({ original: node, nodes })
    }
  }

  const search = () => {
    const { match, mark, min } = settings()
    const query = input.value
    clearMarks()
    const active = Array.from(query.trim()).length >= min
    const matches = items.filter(item => {
      const visible = !active || contains(item.textContent ?? '', query, match)
      item.hidden = visible ? authoredHidden.get(item)! : true
      if (visible && active && mark) markItem(item, query, match)
      return visible && active
    })
    const state: SearchState = !active ? 'idle' : matches.length > 0 ? 'results' : 'empty'
    list.setAttribute(SEARCH_STATE_ATTRIBUTE, state)
    if (empty) empty.hidden = state !== 'empty'
    const result: SearchResult = {
      query,
      matches: active ? matches : [...items],
      total: items.length,
      state,
    }
    options.onSearch?.(result, list)
    list.dispatchEvent(new CustomEvent(SEARCH_EVENT, { bubbles: true, detail: result }))
  }

  input.addEventListener('input', search)
  collect()
  search()

  let alive = true
  return {
    refresh: () => {
      if (!alive) return
      clearMarks()
      collect()
      search()
    },
    destroy: () => {
      if (!alive) return
      alive = false
      input.removeEventListener('input', search)
      clearMarks()
      authoredHidden.forEach((hidden, element) => (element.hidden = hidden))
      list.removeAttribute(SEARCH_STATE_ATTRIBUTE)
    },
  }
}

/**
 * Filter a list as the user types, ignoring accents and case, and highlight
 * the matching text.
 *
 * ```html
 * <input id="q" type="search" />
 * <ul data-string-search="#q">
 *   <li>Café au lait</li>
 *   <li hidden data-string-search-empty>No results</li>
 * </ul>
 * ```
 *
 * Items that do not match get `hidden`; matches are wrapped in `<mark>`.
 * Returns `{ refresh, destroy }`. Without a DOM it does nothing.
 */
export const search = (
  target: ElementTarget = `[${SEARCH_ATTRIBUTE}]`,
  options: SearchOptions = {}
): SearchController => {
  if (!isBrowser()) return { refresh: noop, destroy: noop }
  const controllers = resolveElements(target)
    .filter((element): element is HTMLElement => element instanceof HTMLElement)
    .map(element => bindSearch(element, options))
    .filter((controller): controller is SearchController => controller !== null)
  return {
    refresh: () => controllers.forEach(controller => controller.refresh()),
    destroy: () => controllers.forEach(controller => controller.destroy()),
  }
}

/** Filter every `[data-string-search]` list in `scope`, including lists added later. */
export const autoSearch = ({
  selector = `[${SEARCH_ATTRIBUTE}]`,
  scope,
  observe = true,
  ...options
}: AutoSearchOptions = {}): AutoInitController =>
  autoInit({
    selector,
    observe,
    ...(scope && { root: scope }),
    init: element => search(element, options).destroy,
  })
