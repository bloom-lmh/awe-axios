import { AxiosInstance } from 'axios';
import {
  DecoratedClassOrProto,
  ClassDecorator,
  MethodDecorator,
  PropertyDecorator,
  ParameterDecorator,
} from '../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { SubDecoratorFactory } from '../SubDecoratorFactory';

/**
 * mock http 装饰器
 */
export class MockDecoratorFactory {}
