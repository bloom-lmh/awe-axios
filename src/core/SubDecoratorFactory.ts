import { ClassDecorator, MethodDecorator, ParameterDecorator, PropertyDecorator } from '../decorator';
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
  protected abstract initDecoratorInfo(...args: any[]): void;
  /**
   * 校验装饰器
   */
  protected abstract validateDecorator(...args: any[]): void;

  /**
   * 初始化状态
   */
  protected abstract setupState(...args: any[]): void;

  /**
   * 创建装饰器
   */
  public abstract createDecorator(
    ...args: any[]
  ): ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator;
}
