/**
 * 切点表达式
 */
export type PointCutExpression = string;

/**
 * 切入点选项
 */
export interface PointCutObj {
  /**
   * 所属模块
   */
  module?: string;
  /**
   * 对应类
   */
  clazz?: string;
  /**
   * 对应方法
   */
  method?: string;
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
export type PointCutMethod = (
  ...args: any[]
) =>
  | PointCutExpression
  | PointCutObj
  | PointCutExpWithReturn
  | PointCutObjWithReturn
  | PointCutExpWithThrow
  | PointCutObjWithThrow;
/**
 * Before\After\Around 切点类型
 */
export type BeforeConfig = PointCutExpression | PointCutObj | PointCutMethod;
export type AfterConfig = BeforeConfig;
export type AroundConfig = BeforeConfig;

/**
 * AfterReturning 切点类型
 */
export type AfterReturningConfig = PointCutExpression | PointCutExpWithReturn | PointCutObjWithReturn;

/**
 * AfterThrowing 切点类型
 */
export type AfterThrowingConfig = PointCutExpression | PointCutExpWithThrow | PointCutObjWithThrow;

/**
 * 切点类型
 */
export type PointCutConfig = PointCutMethod;
