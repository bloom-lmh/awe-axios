import { Advice } from '../Advices';
import { PointCutExpWithReturn } from './aop.d';
/**
 * 切点表达式
 */
export type PointCutExpression = string;

/**
 * 切入点对象形式
 */
export interface PointCutObj {
  /**
   * 所属模块
   */
  module?: string | symbol;
  /**
   * 对应类
   */
  ctor?: string | symbol;
  /**
   * 对应方法
   */
  method?: string | symbol;
}
/**
 * 带返回值的PointCut对象
 */
export interface PointCutObjWithReturn extends PointCutObj {
  /**
   * 返回值
   */
  returning: any;
}
/**
 * 带表达式也带返回值的PointCut对象
 */
export interface PointCutExpWithReturn {
  /**
   * 切入点表达式
   */
  expression: PointCutExpression;
  /**
   * 返回值
   */
  returning: any;
}
/**
 * 带抛出异常的PointCut对象
 */
export interface PointCutObjWithThrow extends PointCutObj {
  /**
   * 返回值
   */
  throwing: any;
}
/**
 * 带表达式也带抛出异常的PointCut对象
 */
export interface PointCutExpWithThrow {
  /**
   * 切入点表达式
   */
  expression: PointCutExpression;
  /**
   * 返回值
   */
  throwing: any;
}

/**
 * 切入点方法
 */
export type PointCutMethodWithReturnAndThrow = (
  ...args: any[]
) =>
  | PointCutExpression
  | PointCutObj
  | PointCutObjWithReturn
  | PointCutObjWithThrow
  | PointCutExpWithReturn
  | PointCutExpWithThrow;
/**
 * 切入点方法
 */
export type PointCutMethod = (...args: any[]) => PointCutExpression | PointCutObj;
/**
 * Before\After\Around 切点类型
 */
export type BeforeDecoratorConfig = PointCutExpression | PointCutObj | PointCutMethod;
export type AfterDecoratorConfig = BeforeDecoratorConfig;
export type AroundDecoratorConfig = BeforeDecoratorConfig;

/**
 * AfterReturning 切点类型
 */
export type AfterReturnDecoratorConfig =
  | PointCutExpression
  | PointCutExpWithReturn
  | PointCutObjWithReturn
  | PointCutMethodWithReturnAndThrow;

/**
 * AfterThrowing 切点类型
 */
export type AfterThrowDecoratorConfig =
  | PointCutExpression
  | PointCutExpWithThrow
  | PointCutObjWithThrow
  | PointCutMethodWithReturnAndThrow;

/**
 * 全体类型导出
 */
export type PointCutDecoratorConfig =
  | PointCutExpression
  | PointCutObj
  | PointCutObjWithReturn
  | PointCutObjWithThrow
  | PointCutExpWithReturn
  | PointCutExpWithThrow
  | PointCutMethodWithReturnAndThrow;

/**
 * aop上下文对象
 */
export interface AopContext {
  /**
   * 原方法
   */
  method: Function;
  /**
   * 原方法参数
   */
  args: any[];
  /**
   * 原方法this
   */
  target: any;
}

/**
 * 方法拦截器
 * @description 用于拦截方法的调用,具体的方法拦截器是
 */
export interface Interceptor {
  /**
   * 引用方法
   * @description 在这里调用原方法和后置方法
   */
  invoke(context: AopContext, chain: InterceptorChain): any;
}

/**
 * 拦截器链
 */
export interface InterceptorChain {
  /**
   * 调用拦截器链的拦截器
   */
  proceed(context: AopContext): any;
}

/**
 * 通知方法
 */
export type BeforeAdviceMethod = (context: AopContext) => any;
export type AfterAdviceMethod = BeforeAdviceMethod;
export type AroundAdviceMethod = (context: AopContext, adviceChain: AdviceChain) => any;
export type AfterReturningAdviceMethod = (context: AopContext, result: any) => any;
export type AfterThrowingAdviceMethod = (context: AopContext, error: any) => any;

/**
 * 通知项
 */
export type AdviceItem = {
  pointCut: PointCutObj;
  advice: Advice;
};
/**
 * 通知项数组
 */
export type AdviceItems = AdviceItem[];
/**
 * 通知类型
 */
export type AdviceType = 'around' | 'before' | 'after' | 'afterReturning' | 'afterThrowing';
/**
 * 元数据通知列表
 */
export type Advices = Partial<Record<AdviceType, AdviceItems>>;
