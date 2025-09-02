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
