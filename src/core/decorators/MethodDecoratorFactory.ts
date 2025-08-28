import { DecoratedClassOrProto } from './decorator';
import { DecoratorFactory } from './DecoratorFactory';

/**
 * 类装饰器配置
 */
export abstract class MethodDecoratorFactory extends DecoratorFactory {
  /**
   * 初始化装饰器信息
   */
  protected abstract initDecoratorInfo(target?: DecoratedClassOrProto, propertyKey?: string | symbol): void;

  /**
   * 校验装饰器
   */
  protected abstract validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void;

  /**
   * 配置前置处理
   */
  protected abstract preHandleConfig(config?: any, target?: DecoratedClassOrProto, propertyKey?: string | symbol): any;

  /**
   * 配置项前置检查
   */
  protected abstract preCheckConfig(config: any): void;

  /**
   * 初始化状态
   */
  protected abstract setupState(target: DecoratedClassOrProto, proertyKey: string | symbol, config?: any): void;

  /**
   * 实现配置
   */
  protected abstract applyConfig(target: DecoratedClassOrProto, config: any): void;

  /**
   * 配置后置处理
   */
  protected abstract postHandleConfig(target: DecoratedClassOrProto, proertyKey: string | symbol, args: any[]): void;

  /**
   * 后置校验配置
   */
  protected abstract postCheckConfig(target: DecoratedClassOrProto, config: any): void;

  /**
   * 创建装饰器
   */
  public abstract createDecorator(config: any): MethodDecorator;
}
