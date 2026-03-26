import axios from 'axios';

export { HttpApi, Get, Post, Put, Delete, Patch, Options, Head } from './decorators/http.js';
export { BodyParam, PathParam, QueryParam } from './decorators/params.js';
export {
  AxiosRef,
  RefAxios,
  TransformRequest,
  TransformResponse,
  withHttpClassConfig,
  withHttpMethodConfig,
} from './decorators/extensions.js';
export { executeHttpCall } from './runtime/request.js';
export { SignalController } from './runtime/signal.js';
export { useDebounce, useRequest, useRetry, useThrottle } from './runtime/strategies.js';
export {
  composeDecoratedUrl,
  isAbsoluteHttpUrl,
  joinPathname,
  resolveAbsoluteHttpTarget,
  resolvePathParams,
} from './utils/path.js';
export type * from './types.js';

export const axiosPlus = axios;
