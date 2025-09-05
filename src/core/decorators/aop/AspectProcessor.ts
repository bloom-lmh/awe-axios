import { InstanceFactory } from '../ioc/InstanceFactory';
import { AspectFactory } from './AspectFactory';
import { AdviceItems, Advices, InstancePointCut } from './types/aop';

/**
 * Aspect处理器
 * @description 负责编织切面
 */
export class AspectProcessor {
  /**
   * 编织切面
   */
  static weave() {
    // 获取到所有的实例信息
    const instanceItems = InstanceFactory.getAllInstanceItems();
    // 获取到所有的通知
    const advices = AspectFactory.getAspectAdvices();
    const { around, before, after, afterReturning, afterThrowing } = advices;
    // 开始编织切面
    around!.forEach(adviceItem => {
      const { pointCut, advice } = adviceItem;
      console.log(pointCut);

      // 匹配方法
      /* instanceItems.forEach(instanceItem => {
        console.log(instanceItem);
      }); */
    });
  }

  /**
   * 字符串匹配方法
   */
  // private static matchMethod(pointCut: InstancePointCut, method: string): boolean {}
}
