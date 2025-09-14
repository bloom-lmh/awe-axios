import { Decorator } from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { DecoratorInfo } from '../DecoratorInfo';

/**
 * 数据模型装饰器工厂类
 */
export class DataModelDecoratorFactory extends DecoratorFactory {
  protected decoratorInfo!: DecoratorInfo;

  protected initDecoratorInfo(...arg: any[]): void {
    throw new Error('Method not implemented.');
  }
  protected validateDecorator(...arg: any[]): void {
    throw new Error('Method not implemented.');
  }
  protected preHandleConfig(...arg: any[]) {
    throw new Error('Method not implemented.');
  }
  protected preCheckConfig(...arg: any[]): void {
    throw new Error('Method not implemented.');
  }
  protected setupState(...arg: any[]): void {
    throw new Error('Method not implemented.');
  }
  public createDecorator(...arg: any[]): Decorator {
    throw new Error('Method not implemented.');
  }
}
