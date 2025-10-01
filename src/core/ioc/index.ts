import { InjectDecoratorFactory } from './InjectDecoratorFactory';
import { InjectDecoratorStateManager } from './InjectDecoratorStateManager';
import { InjectDecoratorOptions, ComponentDecoratorOptions } from './types/ioc';
import { AxiosInstance } from 'axios';
import { DecoratorConfigHandler } from '../common/handler/DecoratorConfigHandler';
import { PropertyDecoratorValidator } from '../common/validator';
import { HttpApiDecoratorFactory } from '../httpMethod/HttpApiDecoratorFactory';
import { HttpApiDecoratorConfig } from '../httpMethod/types/httpMethod';
import { ComponentDecoratorFactory } from './ComponentDecoratorFactory';

import { ClassDecorator } from '../decorator';

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
