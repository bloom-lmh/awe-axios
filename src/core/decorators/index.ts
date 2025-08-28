import { AxiosInstance } from 'axios';
import { DecoratorConfigHandler } from '../handler/DecoratorConfigHandler';
import { PropertyDecoratorValidator } from '../validator/PropertyDecoraotrValidator';
import {
  ClassDecorator,
  ComponentDecoratorConfig,
  HttpApiDecoratorConfig,
  InjectDecoratorConfig,
  ParameterDecorator,
} from './decorator';
import { InjectDecoratorStateManager } from '../statemanager/ioc/InjectDecoratorStateManager';
import { InjectDecoratorFactory } from './ioc/InjectDecoratorFactory';
import { ComponentDecoratorFactory } from './ioc/ComponentDecoratorFactory';
import { HttpApiDecoratorFactory } from './ioc/HttpApiDecoratorFactory';
import { RefAxiosDecoratorFactory } from './httpMethod/RefAxiosDecoratorFactory';
import { AxiosRefDecoratorFactory } from './httpMethod/AxiosRefDecoratorFactory';
import { GetDecoratorFactory } from './httpMethod/GetDecoratorFactory';
import { HttpMethodDecoratorConfig } from './httpMethod/types/HttpMethodDecoratorConfig';
import { BodyParamDecoratorFactory } from './params/BodyParamDecoratorFactory';
import { PathParamDecoratorFactory } from './params/PathParamDecoratorFactory';
import { QueryParamDecoratorFactory } from './params/QueryParamDecoratorFactory';

/**
 * inject 装饰器
 */
export function Inject(config?: InjectDecoratorConfig) {
  return new InjectDecoratorFactory()
    .setDecoratorValidator(PropertyDecoratorValidator.getInstance())
    .setConfigHandler(new DecoratorConfigHandler())
    .setStateManager(new InjectDecoratorStateManager())
    .createDecorator(config);
}
/**
 * Component 装饰器
 */
export function Component(config?: ComponentDecoratorConfig) {
  return new ComponentDecoratorFactory().createDecorator(config);
}

/**
 * httpApi decorator
 */
export function HttpApi(config?: HttpApiDecoratorConfig | string): ClassDecorator {
  return new HttpApiDecoratorFactory().createDecorator(config);
}

/**
 * Get装饰器
 */
export function Get(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
  return new GetDecoratorFactory().createDecorator(config);
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
export function BodyParam(paramName: string): ParameterDecorator {
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
