import { AdviceItems, Advices } from './types/aop';

/**
 * 切面工厂
 */
export class AspectFactory {
  /**
   * 通知信息数组
   */
  private static aspectAdvices: Array<{ order: number; advices: Advices }> = [];

  /**
   * 注册切面通知
   */
  static registerAspectAdvices(order: number, advices: Advices) {
    this.aspectAdvices.push({ order, advices });
    // 排序 小于表示优先级高排在前面
    this.aspectAdvices.sort((a, b) => a.order - b.order);
  }

  /**
   * 获取伴随排序的切面通知
   */
  static getOrderedAspectAdvices(): Array<{ order: number; advices: Advices }> {
    return this.aspectAdvices;
  }

  /**
   * 按序合并所有通知
   * @param aspectAdvices 未处理的按order序的通知项
   * @returns 按序合并后的通知项
   */
  static getAspectAdvices(): Advices {
    const advice: Advices = {
      around: [],
      before: [],
      after: [],
      afterReturning: [],
      afterThrowing: [],
    };
    // 将所有Active通知合并
    this.aspectAdvices.forEach(aspectAdvice => {
      const { advices } = aspectAdvice;
      // 按次序添加around
      advice.around = [advice.around, advices.around].filter(item => item).flat() as AdviceItems;
      // 按次序添加before
      advice.before = [advice.before, advices.before].filter(item => item).flat() as AdviceItems;
      // 按逆序添加after
      advice.after = [advices.after, advice.after].filter(item => item).flat() as AdviceItems;
      // 按逆序添加afterReturning
      advice.afterReturning = [advices.afterReturning, advice.afterReturning]
        .filter(item => item)
        .flat() as AdviceItems;
      // 按逆序添加afterThrowing
      advice.afterThrowing = [advices.afterThrowing, advice.afterThrowing].filter(item => item).flat() as AdviceItems;
    });
    return advice;
  }
}
