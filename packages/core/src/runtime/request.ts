import axios from 'axios';

import { getClassConfig, getMethodConfig, getParamBindings } from '../metadata.js';
import type {
  HttpRequestExecutor,
  HttpRuntimeContext,
  MethodKey,
  ResolvedHttpRequestConfig,
} from '../types.js';
import { mergeHeaders, mergeRecords, normalizeArray, toAxiosRequestConfig } from '../utils/config.js';
import { composeDecoratedUrl, isAbsoluteHttpUrl, resolvePathParams } from '../utils/path.js';
import { extractBoundParams } from './params.js';

function resolveClassConfig(instance: unknown, target: object) {
  if (instance && typeof instance === 'object') {
    const ctor = (instance as { constructor?: object }).constructor;
    if (ctor) {
      return getClassConfig(ctor);
    }
  }

  return getClassConfig(target);
}

function buildResolvedRequestConfig(
  instance: unknown,
  target: object,
  propertyKey: MethodKey,
  args: unknown[],
): ResolvedHttpRequestConfig {
  const methodConfig = getMethodConfig(target, propertyKey);
  if (!methodConfig?.method) {
    throw new Error(`Method "${String(propertyKey)}" is missing an HTTP decorator.`);
  }

  const classConfig = resolveClassConfig(instance, target) ?? {};
  const { pathParams, queryParams, body } = extractBoundParams(getParamBindings(target, propertyKey), args);
  const refAxios = methodConfig.refAxios ?? classConfig.refAxios ?? axios;
  const baseURL = methodConfig.baseURL ?? classConfig.baseURL ?? refAxios.defaults.baseURL;
  const composedUrl = composeDecoratedUrl(classConfig.url, methodConfig.url);
  const url = resolvePathParams(composedUrl, pathParams);

  if (!baseURL && !isAbsoluteHttpUrl(url)) {
    throw new Error(`Method "${String(propertyKey)}" requires a baseURL or an absolute URL.`);
  }

  const params = mergeRecords(
    classConfig.params as Record<string, unknown> | undefined,
    methodConfig.params as Record<string, unknown> | undefined,
    queryParams,
  );

  const plugins = [...(classConfig.plugins ?? []), ...(methodConfig.plugins ?? [])];
  const transformRequest = [
    ...normalizeArray(refAxios.defaults.transformRequest),
    ...normalizeArray(classConfig.transformRequest),
    ...normalizeArray(methodConfig.transformRequest),
  ];
  const transformResponse = [
    ...normalizeArray(refAxios.defaults.transformResponse),
    ...normalizeArray(classConfig.transformResponse),
    ...normalizeArray(methodConfig.transformResponse),
  ];

  return {
    ...classConfig,
    ...methodConfig,
    baseURL,
    url,
    params,
    data: body !== undefined ? body : methodConfig.data ?? classConfig.data,
    headers: mergeHeaders(classConfig.headers, methodConfig.headers) as ResolvedHttpRequestConfig['headers'],
    transformRequest: transformRequest.length > 0 ? transformRequest : undefined,
    transformResponse: transformResponse.length > 0 ? transformResponse : undefined,
    refAxios,
    plugins,
    methodId: methodConfig.methodId,
    method: methodConfig.method as ResolvedHttpRequestConfig['method'],
  };
}

const baseExecutor: HttpRequestExecutor = config => {
  return config.refAxios.request(toAxiosRequestConfig(config));
};

export function executeHttpCall(
  instance: unknown,
  target: object,
  propertyKey: MethodKey,
  originalMethod: (...args: any[]) => unknown,
  args: unknown[],
) {
  const resolvedConfig = buildResolvedRequestConfig(instance, target, propertyKey, args);
  const context: HttpRuntimeContext = {
    instance,
    target,
    propertyKey,
    methodId: resolvedConfig.methodId,
    args,
    originalMethod,
  };

  const executor = [...(resolvedConfig.plugins ?? [])].reverse().reduce<HttpRequestExecutor>((next, plugin) => {
    return plugin(next, context);
  }, baseExecutor);

  return executor(resolvedConfig);
}
