import { AxiosHeaders } from 'axios';

import type { HttpMethodConfig, ResolvedHttpRequestConfig } from '../types.js';

export function normalizeArray<T>(value?: T | T[]): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function toPlainHeaders(headers: HttpMethodConfig['headers']): Record<string, unknown> | undefined {
  if (!headers) {
    return undefined;
  }

  if (headers instanceof AxiosHeaders) {
    return headers.toJSON();
  }

  const maybeSerializable = headers as unknown as { toJSON?: () => Record<string, unknown> };
  if (typeof maybeSerializable.toJSON === 'function') {
    return maybeSerializable.toJSON();
  }

  return { ...(headers as Record<string, unknown>) };
}

export function mergeHeaders(
  ...headersList: Array<HttpMethodConfig['headers'] | undefined>
): Record<string, unknown> | undefined {
  const merged = headersList.reduce<Record<string, unknown>>((accumulator, current) => {
    const plainHeaders = toPlainHeaders(current);
    if (plainHeaders) {
      Object.assign(accumulator, plainHeaders);
    }
    return accumulator;
  }, {});

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function mergeHttpConfigPatch<T extends HttpMethodConfig>(base: T, patch: Partial<T>): T {
  const next = {
    ...base,
    ...patch,
  } as T;

  const headers = mergeHeaders(base.headers, patch.headers);
  if (headers) {
    next.headers = headers as T['headers'];
  }

  const transformRequest = [
    ...normalizeArray(base.transformRequest),
    ...normalizeArray(patch.transformRequest),
  ];
  if (transformRequest.length > 0) {
    next.transformRequest = transformRequest as T['transformRequest'];
  }

  const transformResponse = [
    ...normalizeArray(base.transformResponse),
    ...normalizeArray(patch.transformResponse),
  ];
  if (transformResponse.length > 0) {
    next.transformResponse = transformResponse as T['transformResponse'];
  }

  const plugins = [...(base.plugins ?? []), ...(patch.plugins ?? [])];
  if (plugins.length > 0) {
    next.plugins = plugins as T['plugins'];
  }

  return next;
}

export function mergeRecords(
  ...values: Array<Record<string, unknown> | undefined>
): Record<string, unknown> | undefined {
  const merged = values.reduce<Record<string, unknown>>((accumulator, current) => {
    if (current) {
      Object.assign(accumulator, current);
    }
    return accumulator;
  }, {});

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function toAxiosRequestConfig<TRequestData>(
  config: ResolvedHttpRequestConfig<TRequestData>,
): HttpMethodConfig<TRequestData> {
  const { refAxios: _refAxios, methodId: _methodId, plugins: _plugins, ...axiosConfig } = config;
  return axiosConfig;
}
