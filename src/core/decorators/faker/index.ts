import { DataFieldDecoratorFactory } from './DataFieldDecoratorFactory';
import { CustomGenerator, FakerMethodParamsType, FakerMethodPath, RefModel } from './types/faker';

/**
 * 数据字段装饰器
 */
export function DataField<P extends FakerMethodPath>(
  options: FakerMethodPath | [P, FakerMethodParamsType<P>] | CustomGenerator | RefModel,
) {
  return new DataFieldDecoratorFactory<P>().createDecorator(options);
}
