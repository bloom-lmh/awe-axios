import { AxiosInstance } from 'axios';
import {
  ClassDecorator,
  DecoratedClassOrProto,
  MethodDecorator,
  ParameterDecorator,
  PropertyDecorator,
} from './decorator';
import { DecoratorInfo } from './DecoratorInfo';

/**
 * 子项装饰器工厂
 */
export abstract class SubDecoratorFactory {
  /**
   * 装饰器信息
   */
  protected abstract decoratorInfo: DecoratorInfo;
  /**
   * 初始化装饰器信息
   */
  protected abstract initDecoratorInfo(config?: any): void;
  /**
   * 校验装饰器
   */
  protected abstract validateDecorator(
    target: DecoratedClassOrProto,
    propertyKey?: string | symbol,
    config?: any,
  ): void;

  /**
   * 初始化状态
   */
  protected abstract setupState(target: DecoratedClassOrProto, config?: any, propertyKey?: string | symbol): void;

  /**
   * 后处理配置
   */
  protected abstract handleConfig(
    target: DecoratedClassOrProto,
    config?: AxiosInstance,
    propertyKey?: string | symbol,
  ): void;

  /**
   * 创建装饰器
   */
  public abstract createDecorator(
    config: any,
  ): ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator;
}
