import axios from 'axios';

export { HttpApi, Get, Post, Put, Delete, Patch, Options, Head } from './decorators/http.js';
export { BodyParam, PathParam, QueryParam } from './decorators/params.js';
export {
  AxiosRef,
  Debounce,
  Retry,
  RefAxios,
  Throttle,
  TransformRequest,
  TransformResponse,
  withHttpClassConfig,
  withHttpClassPlugins,
  withHttpMethodConfig,
  withHttpMethodPlugins,
} from './decorators/extensions.js';
export { executeHttpCall } from './runtime/request.js';
export { SignalController } from './runtime/signal.js';
export {
  createDebouncePlugin,
  createRetryPlugin,
  createThrottlePlugin,
  useDebounce,
  useRequest,
  useRetry,
  useThrottle,
} from './runtime/strategies.js';
export {
  composeDecoratedUrl,
  isAbsoluteHttpUrl,
  joinPathname,
  resolveAbsoluteHttpTarget,
  resolvePathParams,
} from './utils/path.js';
export type * from './types.js';

export const axiosPlus = axios;
