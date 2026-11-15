export * from '../core/index.js'
export {
  ATTRIBUTE,
  CHANGE_EVENT,
  STATE_ATTRIBUTE,
  autoString,
  string,
  type AutoInitController,
  type AutoStringOptions,
  type ElementTarget,
  type StringController,
  type StringOptions,
  type StringState,
} from './string.js'
export {
  SEARCH_ATTRIBUTE,
  SEARCH_EMPTY_ATTRIBUTE,
  SEARCH_EVENT,
  SEARCH_STATE_ATTRIBUTE,
  autoSearch,
  search,
  type AutoSearchOptions,
  type SearchController,
  type SearchOptions,
  type SearchResult,
  type SearchState,
} from './search.js'
export { COLOR_PROPERTY } from './string.js'
export {
  COUNT_ATTRIBUTE,
  COUNT_EVENT,
  COUNT_STATE_ATTRIBUTE,
  autoCount,
  count,
  type AutoCountOptions,
  type CountInfo,
  type CountOptions,
  type CountState,
  type CountUnit,
} from './count.js'
export {
  FIT_ATTRIBUTE,
  FIT_STATE_ATTRIBUTE,
  autoFit,
  fit,
  type AutoFitOptions,
  type FitOptions,
  type FitState,
} from './fit.js'
export {
  COPY_ATTRIBUTE,
  COPY_EVENT,
  COPY_STATE_ATTRIBUTE,
  autoCopy,
  copy,
  type AutoCopyOptions,
  type CopyDetail,
  type CopyOptions,
  type CopyState,
} from './copy.js'
export type { AutoOptions, Controller } from './controller.js'
