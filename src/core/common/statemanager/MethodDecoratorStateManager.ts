import { DecoratedClassOrProto } from '@/core/decorator';
import { DecoratorInfo } from '@/core/DecoratorInfo';
import { PropertyDecoratorStateManager } from './PropertyDecoratorStateManager';

/**
 * 方法状态管理器
 */
export class MethodDecoratorStateManager extends PropertyDecoratorStateManager {
  /**
   * 获取httpMethod类型装饰器
   * @target 装饰器所在的类或原型对象
   * @propertyKey 装饰器所在的方法名
   */
  getHttpMethodDecoratorInfo(target: DecoratedClassOrProto, propertyKey: string | symbol): DecoratorInfo | undefined {
    // 获取所有类型为httpMethod的装饰器（一定只有一个）
    const decoratorInfos = this.getDecoratorInfosByType(target, 'httpMethod', propertyKey);
    if (decoratorInfos && decoratorInfos.length > 0) {
      return decoratorInfos[0];
    }
  }
}
