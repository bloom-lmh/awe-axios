import { DecoratedClassOrProto, MethodDecorator, PropertyDecorator } from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { DecoratorInfo } from '../DecoratorInfo';
import { MethodDecoratorFactory } from '../MethodDecoratorFactory';
import { DataFieldType, FakerMethodParamsType, FakerMethodPath } from './types/faker';

/**
 * 数据字段装饰器工厂
 */
export class DataFieldDecoratorFactory<P extends FakerMethodPath> extends DecoratorFactory {
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
  protected decoratorInfo!: DecoratorInfo;

  public createDecorator(options: DataFieldType, args?: FakerMethodParamsType<P>): PropertyDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string | symbol) => {};
  }
}
