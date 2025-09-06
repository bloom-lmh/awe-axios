import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';
import { InstanceFactory } from '../ioc/InstanceFactory';
import { AdviceChain } from './AdviceChain';
import { AspectContext } from './AspectContext';
import { AspectFactory } from './AspectFactory';
import { AdviceItems, Advices, InstancePointCut } from './types/aop';
import { Inject } from '..';
import { SYSTEM } from '@/core/constant/SystemConstants';
import { InstanceItem } from '../ioc/types/ioc';
import { any } from 'joi';

/**
 * Aspect处理器
 * @description 负责编织切面
 */
export class AspectProcessor {
  /**
   * 代理方法列表
   * @description 可撤销切面代理
   */
  static revokeMap: WeakMap<Function, { revoke: () => void; invoke: Function }> = new WeakMap();
  /**
   * 方法状态管理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: MethodDecoratorStateManager,
  })
  private static stateManager: MethodDecoratorStateManager;
  /**
   * 编织切面
   */
  static weave() {
    // 获取到所有的实例信息条目
    const instanceItemList = InstanceFactory.getInstanceItemList();
    // 获取到所有的通知
    const advices = AspectFactory.getAspectAdvices();
    // 解构不同类型的通知方法数组
    const { around, before, after, afterReturning, afterThrowing } = advices;
    let methodInfo: any = {};
    let adviceChain: AdviceChain;
    // 开始编织切面
    instanceItemList.forEach(instanceItem => {
      // 获取原生方法信息
      const { module, ctor, ctorName, methodNames } = instanceItem;
      // 遍历原生方法
      methodNames.forEach(methodName => {
        // 跳过构造函数
        if (methodName === 'constructor') return;
        // 获取方法名和方法属性描述符对象
        methodInfo = { module, ctorName, methodName };
        // 创建通知链
        adviceChain = new AdviceChain();
        // 方法匹配通知
        around!.forEach(adviceItem => {
          const { pointCut, advice } = adviceItem;
          if (this.matchMethod(pointCut, methodInfo)) {
            adviceChain.addInterceptor(advice);
          }
        });
        before!.forEach(adviceItem => {
          const { pointCut, advice } = adviceItem;
          if (this.matchMethod(pointCut, methodInfo)) {
            adviceChain.addInterceptor(advice);
          }
        });
        afterReturning!.forEach(adviceItem => {
          const { pointCut, advice } = adviceItem;
          if (this.matchMethod(pointCut, methodInfo)) {
            adviceChain.addInterceptor(advice);
          }
        });
        afterThrowing!.forEach(adviceItem => {
          const { pointCut, advice } = adviceItem;
          if (this.matchMethod(pointCut, methodInfo)) {
            adviceChain.addInterceptor(advice);
          }
        });
        after!.forEach(adviceItem => {
          const { pointCut, advice } = adviceItem;
          if (this.matchMethod(pointCut, methodInfo)) {
            adviceChain.addInterceptor(advice);
          }
        });

        // 获取原方法
        let invokeMethod = (ctor.prototype as any)[methodName];

        // 只代理非静态方法,并获取代理方法和revoke函数
        const { proxy, revoke } = Proxy.revocable(invokeMethod, {
          apply(invoke, _this, args) {
            console.log('调用切面代理后的方法');

            // 尝试获取axios配置
            //let decoratorInfo = AspectProcessor.stateManager.getHttpMethodDecoratorInfo(_this, methodName);
            //console.log(decoratorInfo);
            let result = adviceChain.proceed(new AspectContext(invoke, _this, args));
            return result;
          },
        });
        // 覆盖原方法
        Object.defineProperty(ctor.prototype, methodName, {
          value: proxy,
          writable: true,
          enumerable: true,
          configurable: true,
        });
        // 记录原方法和revoke函数等用于撤销代理
        this.revokeMap.set(proxy, { revoke, invoke: invokeMethod });
        console.log('编织完成');
      });
    });
  }

  /**
   * 字符串匹配方法
   */
  private static matchMethod(
    pointCut: InstancePointCut,
    methodInfo: { module: string; ctorName: string; methodName: string },
  ): boolean {
    let { module, ctor, method } = pointCut;
    let { module: moduleName, ctorName, methodName } = methodInfo;
    if (!module.test(moduleName) || !ctor.test(ctorName) || !method.test(methodName)) {
      return false;
    }
    return true;
  }
}
