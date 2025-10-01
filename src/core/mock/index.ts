import { MockHandlers, MockConfig } from '../httpMethod/types/httpMethod';
import { MethodDecorator } from '../decorator';
import { MockDecoratorFactory } from '../httpMethod/SubDecorators';
import { DECORATORNAME } from '../common/constant';

/**
 * mock装饰器
 */
export function Mock(handlers: MockHandlers, mockConfig?: Omit<MockConfig, 'handlers'>): MethodDecorator {
  let config: MockConfig = {};
  config = {
    handlers: typeof handlers === 'function' ? { default: handlers } : handlers,
    ...mockConfig,
  };
  return new MockDecoratorFactory().createDecorator(DECORATORNAME.MOCK, config);
}
