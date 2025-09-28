import { AxiosInstance, AxiosRequestTransformer, AxiosResponseTransformer } from 'axios';
import { DecoratorConfigHandler } from '../handler/DecoratorConfigHandler';
import { PropertyDecoratorValidator } from '../validator/PropertyDecoraotrValidator';
import { ClassDecorator, ParameterDecorator } from './decorator';
import { InjectDecoratorStateManager } from '../statemanager/ioc/InjectDecoratorStateManager';
import { InjectDecoratorFactory } from './ioc/InjectDecoratorFactory';
import { ComponentDecoratorFactory } from './ioc/ComponentDecoratorFactory';
import { HttpApiDecoratorFactory } from './httpMethod/HttpApiDecoratorFactory';
import { RefAxiosDecoratorFactory } from './httpMethod/RefAxiosDecoratorFactory';
import { AxiosRefDecoratorFactory } from './httpMethod/AxiosRefDecoratorFactory';
import { HttpMethodDecoratorConfig } from './httpMethod/types/HttpMethodDecoratorConfig';
import { BodyParamDecoratorFactory } from './params/BodyParamDecoratorFactory';
import { PathParamDecoratorFactory } from './params/PathParamDecoratorFactory';
import { QueryParamDecoratorFactory } from './params/QueryParamDecoratorFactory';
import { HttpApiDecoratorConfig, MockConfig, MockHandlers } from './httpMethod/types/httpMethod';
import { ComponentDecoratorOptions, InjectDecoratorOptions } from './ioc/types/ioc';
import { DECORATORNAME } from '../constant/DecoratorConstants';
import { HttpMethodDecoratorFactory } from './httpMethod/HttpMethodDecoratorFactory';
import {
  MockDecoratorFactory,
  TransformRequestDecoratorFactory,
  TransformResponseDecoratorFactory,
} from './httpMethod/SubDecorators';

/**
 * inject 装饰器
 */
export function Inject(config?: InjectDecoratorOptions) {
  return new InjectDecoratorFactory()
    .setDecoratorValidator(PropertyDecoratorValidator.getInstance())
    .setConfigHandler(new DecoratorConfigHandler())
    .setStateManager(new InjectDecoratorStateManager())
    .createDecorator(config);
}
/**
 * Component 装饰器
 */
export function Component(config?: ComponentDecoratorOptions) {
  return new ComponentDecoratorFactory().createDecorator(config);
}

/**
 * httpApi decorator
 */
export function HttpApi(config?: HttpApiDecoratorConfig | string | AxiosInstance): ClassDecorator {
  return new HttpApiDecoratorFactory().createDecorator(config);
}

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
 * RefAxios装饰器
 */
export function RefAxios(config: AxiosInstance): ClassDecorator {
  return new RefAxiosDecoratorFactory().createDecorator(config);
}

/**
 * AxiosRef装饰器
 */
export function AxiosRef(config: AxiosInstance): MethodDecorator {
  return new AxiosRefDecoratorFactory().createDecorator(config);
}

/**
 * Body参数装饰器
 */
export function BodyParam(paramName: string = ''): ParameterDecorator {
  return new BodyParamDecoratorFactory().createDecorator(paramName);
}
/**
 * 路径参数装饰器
 */
export function PathParam(paramName: string) {
  return new PathParamDecoratorFactory().createDecorator(paramName);
}
/**
 * 查询参数装饰器
 */
export function QueryParam(paramName: string): ParameterDecorator {
  return new QueryParamDecoratorFactory().createDecorator(paramName);
}

/**
 * mock装饰器
 */
export function Mock(handlers: MockHandlers, mockConfig?: Omit<MockConfig, 'handlers'>): MethodDecorator {
  let config: MockConfig = {};
  config = {
    handlers: typeof handlers === 'function' ? { default: handlers } : handlers,
    ...mockConfig,
  };
  return new MockDecoratorFactory().createDecorator(DECORATORNAME.MOCK, config);
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
