import { DecoratorFactory } from './DecoratorFactory';

/**
 * 类装饰器配置
 */
export abstract class MethodDecoratorFactory extends DecoratorFactory {
  /**
   * 初始化装饰器信息
   */
  protected abstract initDecoratorInfo(...arg: any[]): void;

  /**
   * 校验装饰器
   */
  protected abstract validateDecorator(...arg: any[]): void;

  /**
   * 配置前置处理
   */
  protected abstract preHandleConfig(...arg: any[]): any;

  /**
   * 配置项前置检查
   */
  protected abstract preCheckConfig(...arg: any[]): void;

  /**
   * 初始化状态
   */
  protected abstract setupState(...arg: any[]): void;

  /**
   * 实现配置
   */
  protected abstract applyConfig(...arg: any[]): void;

  /**
   * 配置后置处理
   */
  protected abstract postHandleConfig(...arg: any[]): void;

  /**
   * 后置校验配置
   */
  protected abstract postCheckConfig(...arg: any[]): void;

  /**
   * 创建装饰器
   */
  public abstract createDecorator(...arg: any[]): MethodDecorator;
}
