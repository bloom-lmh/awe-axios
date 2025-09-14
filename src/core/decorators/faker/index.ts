import { DataFieldDecoratorFactory } from './DataFieldDecoratorFactory';
import { CustomGenerator, DataFieldType, FakerMethodParamsType, FakerMethodPath } from './types/faker';

/**
 * 数据字段装饰器
 */
export function DataField<P extends FakerMethodPath>(options: P | CustomGenerator, args?: FakerMethodParamsType<P>) {
  return new DataFieldDecoratorFactory<P>().createDecorator(options, args);
}
