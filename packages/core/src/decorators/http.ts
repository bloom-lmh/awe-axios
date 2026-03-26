import type { AxiosInstance, Method } from 'axios';

import { getMethodConfig, isMethodWrapped, markMethodWrapped, mergeClassConfig, mergeMethodConfig } from '../metadata.js';
import { executeHttpCall } from '../runtime/request.js';
import type { HttpApiConfig, HttpMethodConfig, MethodKey } from '../types.js';
import { isAbsoluteHttpUrl } from '../utils/path.js';

function isAxiosInstance(value: unknown): value is AxiosInstance {
  return !!value && typeof value === 'object' && typeof (value as AxiosInstance).request === 'function';
}

function normalizeMethodConfig(config: HttpMethodConfig | string | undefined, method: Method): HttpMethodConfig {
  if (typeof config === 'string') {
    return {
      method,
      url: config,
    };
  }

  return {
    ...(config ?? {}),
    method,
  };
}

function normalizeClassConfig(config?: HttpApiConfig | string | AxiosInstance): HttpApiConfig {
  if (typeof config === 'string') {
    return isAbsoluteHttpUrl(config) ? { baseURL: config } : { url: config };
  }

  if (isAxiosInstance(config)) {
    return { refAxios: config };
  }

  return config ?? {};
}

function wrapHttpMethod(
  target: object,
  propertyKey: MethodKey,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  if (isMethodWrapped(target, propertyKey)) {
    return descriptor;
  }

  const originalMethod = descriptor.value;
  if (typeof originalMethod !== 'function') {
    throw new Error(`"${String(propertyKey)}" must be a method to use HTTP decorators.`);
  }

  descriptor.value = function wrappedHttpMethod(...args: unknown[]) {
    return executeHttpCall(this, target, propertyKey, originalMethod, args);
  };

  markMethodWrapped(target, propertyKey);
  return descriptor;
}

function createHttpMethodDecorator(method: Method) {
  return (config?: HttpMethodConfig | string): MethodDecorator => {
    return (target, propertyKey, descriptor) => {
      if (propertyKey === undefined || descriptor === undefined) {
        throw new Error(`"${method}" can only be used on instance methods.`);
      }

      const existing = getMethodConfig(target, propertyKey);
      if (existing?.method && existing.method !== method) {
        throw new Error(`"${String(propertyKey)}" already has an HTTP decorator.`);
      }

      mergeMethodConfig(target, propertyKey, normalizeMethodConfig(config, method));
      return wrapHttpMethod(target, propertyKey, descriptor);
    };
  };
}

export function HttpApi(config?: HttpApiConfig | string | AxiosInstance): ClassDecorator {
  return target => {
    mergeClassConfig(target, normalizeClassConfig(config));
  };
}

export const Get = createHttpMethodDecorator('get');
export const Post = createHttpMethodDecorator('post');
export const Put = createHttpMethodDecorator('put');
export const Delete = createHttpMethodDecorator('delete');
export const Patch = createHttpMethodDecorator('patch');
export const Options = createHttpMethodDecorator('options');
export const Head = createHttpMethodDecorator('head');
