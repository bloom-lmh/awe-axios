import {
  ClassDecorator,
  DecoratedClassOrProto,
  MethodDecorator,
  ParameterDecorator,
  PropertyDecorator,
} from './decorator';
import { DecoratorFactoryBuilder } from './DecoratorFactoryBuilder';

/**
 * 装饰器工厂类
 */
export abstract class DecoratorFactory extends DecoratorFactoryBuilder {
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
   * 配置前置处理
   */
  protected abstract preHandleConfig(config: any, target?: DecoratedClassOrProto | any): any;
  /**
   * 配置项前置检查
   */
  protected abstract preCheckConfig(config: any, target?: DecoratedClassOrProto): void;
  /**
   * 初始化状态
   */
  protected abstract setupState(target: DecoratedClassOrProto, ...args: any[]): void;

  /**
   * 创建装饰器
   */
  public abstract createDecorator(
    config: any,
    ...arg: any[]
  ): ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator;
}
