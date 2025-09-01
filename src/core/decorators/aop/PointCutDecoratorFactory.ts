import {
  DecoratedClassOrProto,
  ClassDecorator,
  MethodDecorator,
  PropertyDecorator,
  ParameterDecorator,
} from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { DecoratorInfo } from '../DecoratorInfo';

/**
 * 所有切入点装饰器
 */
export class PointCutDecoratorFactory extends DecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;
  /**
   * 初始化装饰器信息
   */
  protected initDecoratorInfo(config?: any): void {
    throw new Error('Method not implemented.');
  }
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey?: string | symbol, config?: any): void {
    throw new Error('Method not implemented.');
  }
  protected preHandleConfig(config: any, target?: DecoratedClassOrProto | any) {
    throw new Error('Method not implemented.');
  }
  protected preCheckConfig(config: any, target?: DecoratedClassOrProto): void {
    throw new Error('Method not implemented.');
  }
  protected setupState(target: DecoratedClassOrProto, config?: any, propertyKey?: string | symbol): void {
    // 1. 将
  }
  public createDecorator(config: any): ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator {
    throw new Error('Method not implemented.');
  }
}
