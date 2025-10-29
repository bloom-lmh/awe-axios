import { AxiosInstance, AxiosRequestTransformer, AxiosResponseTransformer } from 'axios';
import {
  TransformRequestDecoratorFactory,
  TransformResponseDecoratorFactory,
  RetryDecoratorFactory,
  DebounceDecoratorFactory,
  ThrottleDecoratorFactory,
  AxiosRefDecoratorFactory,
} from './SubDecorators';
import { RetryConfig, DebounceConfig } from '../../httpMethod';
import { RefAxiosDecoratorFactory } from './RefAxiosDecoratorFactory';
import { ClassDecorator, MethodDecorator } from '../../decorator';
import { DECORATORNAME } from '../common/constant/DecoratorConstants';
import { HttpMtdDecoratorConfigHandler } from './handler/HttpMtdDecoratorConfigHandler';
import { HttpMethodDecoratorFactory } from './HttpMethodDecoratorFactory';
import { HttpMethodDecoratorConfig } from './types/HttpMethodDecoratorConfig';

/**
 * Get装饰器
 */
export function Get(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
  return new HttpMethodDecoratorFactory().createDecorator(config, DECORATORNAME.GET, 'get');
}

/**
 * Post装饰器
 */
export function Post(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
  return new HttpMethodDecoratorFactory().createDecorator(config, DECORATORNAME.POST, 'post');
}

/**
 * Put装饰器
 */
export function Put(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
  return new HttpMethodDecoratorFactory().createDecorator(config, DECORATORNAME.PUT, 'put');
}

/**
 * Patch装饰器
 */
export function Patch(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
  return new HttpMethodDecoratorFactory().createDecorator(config, DECORATORNAME.PATCH, 'patch');
}

/**
 * Delete装饰器
 */
export function Delete(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
  return new HttpMethodDecoratorFactory().createDecorator(config, DECORATORNAME.DELETE, 'delete');
}

/**
 * head装饰器
 */
export function Head(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
  return new HttpMethodDecoratorFactory().createDecorator(config, DECORATORNAME.HEAD, 'head');
}

/**
 * options装饰器
 */
export function Options(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
  return new HttpMethodDecoratorFactory().createDecorator(config, DECORATORNAME.OPTIONS, 'options');
}

/**
 * transformResquest装饰器
 */
export function TransformRequest(
  transformRequest: AxiosRequestTransformer | AxiosRequestTransformer[],
): MethodDecorator {
  // todo 直接传入装饰器信息
  return new TransformRequestDecoratorFactory().createDecorator(DECORATORNAME.TRANSFORMREQUEST, transformRequest);
}

/**
 * transformResponse装饰器
 */
export function TransformResponse(
  transformResponse: AxiosResponseTransformer | AxiosResponseTransformer[],
): MethodDecorator {
  // todo 直接传入装饰器信息
  return new TransformResponseDecoratorFactory().createDecorator(DECORATORNAME.TRANSFORMRESPONSE, transformResponse);
}

/**
 * retry装饰器
 */
/* export function Retry(config: RetryConfig): MethodDecorator {
  const retryOptions = HttpMtdDecoratorConfigHandler.handleRetryConfig(config);
  return new RetryDecoratorFactory().createDecorator(DECORATORNAME.RETRY, retryOptions);
} */

/**
 * debounce装饰器
 */
/* export function Debounce(config: DebounceConfig): MethodDecorator {
  let debounceOptions = HttpMtdDecoratorConfigHandler.handleDebounceConfig(config);
  return new DebounceDecoratorFactory().createDecorator(DECORATORNAME.DEBOUNCE, debounceOptions);
}
 */
/**
 * throttle装饰器
 */
/* export function Throttle(config: DebounceConfig): MethodDecorator {
  let throttleOptions = HttpMtdDecoratorConfigHandler.handleThrottleConfig(config);
  return new ThrottleDecoratorFactory().createDecorator(DECORATORNAME.THROTTLE, throttleOptions);
} */

/**
 * RefAxios装饰器
 */
export function RefAxios(config: AxiosInstance): ClassDecorator {
  return new RefAxiosDecoratorFactory().createDecorator(config);
}

/**
 * AxiosRef装饰器
 */
export function AxiosRef(config: AxiosInstance): MethodDecorator {
  return new AxiosRefDecoratorFactory().createDecorator(DECORATORNAME.AXIOSREF, config);
}
