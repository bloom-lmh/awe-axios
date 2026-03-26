import type { AxiosInstance, AxiosRequestTransformer, AxiosResponseTransformer } from 'axios';

import { mergeClassConfig, mergeMethodConfig } from '../metadata.js';
import type { HttpApiConfig, HttpMethodConfig } from '../types.js';

export function withHttpMethodConfig(config: Partial<HttpMethodConfig>): MethodDecorator {
  return (target, propertyKey) => {
    if (propertyKey === undefined) {
      throw new Error('HTTP method config decorators can only be used on instance methods.');
    }

    mergeMethodConfig(target, propertyKey, config);
  };
}

export function withHttpClassConfig(config: Partial<HttpApiConfig>): ClassDecorator {
  return target => {
    mergeClassConfig(target, config);
  };
}

export function TransformRequest(
  transformRequest: AxiosRequestTransformer | AxiosRequestTransformer[],
): MethodDecorator {
  return withHttpMethodConfig({
    transformRequest: Array.isArray(transformRequest) ? transformRequest : [transformRequest],
  });
}

export function TransformResponse(
  transformResponse: AxiosResponseTransformer | AxiosResponseTransformer[],
): MethodDecorator {
  return withHttpMethodConfig({
    transformResponse: Array.isArray(transformResponse) ? transformResponse : [transformResponse],
  });
}

export function RefAxios(refAxios: AxiosInstance): ClassDecorator {
  return withHttpClassConfig({ refAxios });
}

export function AxiosRef(refAxios: AxiosInstance): MethodDecorator {
  return withHttpMethodConfig({ refAxios });
}
