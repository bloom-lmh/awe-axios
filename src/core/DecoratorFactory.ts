import { Decorator } from './decorator';
import { DecoratorFactoryBuilder } from './DecoratorFactoryBuilder';

/**
 * 装饰器工厂类
 */
export abstract class DecoratorFactory extends DecoratorFactoryBuilder {
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
   * 创建装饰器
   */
  public abstract createDecorator(...arg: any[]): Decorator;
}
