import { METADATAKEY } from '../common/constant';
import { ClassDecoratorStateManager } from '../common/statemanager';
import { DecoratedClassOrProto } from '../decorator';
import { Advices, AdviceType, AdviceItems, AdviceItem } from './types/aop';

/**
 * 切面装饰器状态管理器
 */
export class AspectDecoratorStateManager extends ClassDecoratorStateManager {
  /**
   * 是否有通知列表
   * @param target 装饰器所在的类或原型对象
   */
  hasAdvices(target: DecoratedClassOrProto): boolean {
    return Reflect.hasMetadata(METADATAKEY.ADVICES, target);
  }

  /**
   * 设置通知列表
   * @param target 装饰器所在的类或原型对象
   * @param advices 通知列表
   */
  setAdvices(target: DecoratedClassOrProto, advices?: Advices): void {
    let defaultAdvices = {
      around: [],
      before: [],
      after: [],
      afterReturning: [],
      afterThrowing: [],
    };
    advices = { ...defaultAdvices, ...advices };
    Reflect.defineMetadata(METADATAKEY.ADVICES, advices, target);
  }

  /**
   * 获取通知列表
   */
  getAdvices(target: DecoratedClassOrProto): Advices | undefined {
    return Reflect.getMetadata(METADATAKEY.ADVICES, target);
  }

  /**
   * 获取某种类型的通知
   * @param target 装饰器所在的类或原型对象
   * @param type 通知类型
   */
  getAdvicesOfType<T>(target: DecoratedClassOrProto, type: AdviceType): AdviceItems | undefined {
    return this.getAdvices(target)?.[type];
  }

  /**
   * 设置某种类型的通知
   * @param target 装饰器所在的类或原型对象
   * @param type 通知类型
   * @param adviceItem 通知项
   */
  setAdviceOfType(target: DecoratedClassOrProto, type: AdviceType, adviceItem: AdviceItem): void {
    let advices = this.getAdvices(target);
    // 确保该类型的数组存在
    if (!advices) {
      advices = {
        [type]: [adviceItem],
      };
      // 保存回元数据
      this.setAdvices(target, advices);
      return;
    }
    if (!advices[type]) {
      advices[type] = [];
    }
    advices[type].push(adviceItem);
    this.setAdvices(target, advices);
  }
}
