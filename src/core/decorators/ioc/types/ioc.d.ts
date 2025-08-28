import { SubDecorationInfo } from './ioc';
import { ctorNameOrAlias } from './../core/validators/schema/IocShema';
import { DecoratedClass } from './decorator';

/**
 * 实例数组中的项
 */
export interface InstanceArrayItem<T = any> extends Omit<InstanceRegisterConfig<T>, 'module'> {
  /**
   * 构造函数名
   */
  ctorName: string;
  /**
   * 实例
   */
  instance: T;
}
/**
 * 实例数组
 */
export type InstanceArray = InstanceArrayItem[];

/**
 * 实例工厂map
 */
export type InstanceMap = Map<string | symbol, InstanceArray>;

/**
 * 实例注册时配置
 */
export interface InstanceRegisterConfig<T = any> {
  /**
   * 实例的模块命名空间，防止不同模块的实例命名冲突
   */
  module?: string;
  /**
   * 实例的名称，用于在模块中获取实例
   */
  constructor: DecoratedClass<T>;
  /**
   * 别名，用于唯一标识一个类实例
   */
  alias?: string;
}
/**
 * 获取实例模式配置
 * @default SINGLETON
 */
export type InstanceScope =
  /**
   * 单例模式
   *
   */
  | 'SINGLETON'
  /**
   * 瞬时模式
   */
  | 'TRANSIENT'
  /**
   * 克隆模式，采用深克隆注入
   */
  | 'DEEPCLONE'
  /**
   * 浅克隆模式，采用浅克隆注入
   */
  | 'SHALLOWCLONE'
  /**
   * 原型模式，注入的对象以匹配对象为原型
   */
  | 'PROTOTYPE';

/**
 * 获取实例配置对象
 */
export type DependencyConfig = {
  /**
   * 模块名
   */
  module?: string;
  /**
   * 类名或别名
   */
  ctorNameOrAlias?: string;
  /**
   * 表达式，优先级地狱module和identifier的组合
   */
  expression?: string;
  /**
   * 创建实例模式
   */
  scope?: InstanceScope | string;
};
/**
 * 获取实例选项
 */
export type DependencyOptions =
  | DependencyConfig
  | string // 表达式
  | void; // 空配置会使用类型推断

/**
 * 候选实例
 */
export interface CandidateInstances {
  /**
   * 候选实例数量
   */
  count: number;
  /**
   * 候选实例数组
   */
  candidates: InstanceArrayItem[];
  /**
   * 最佳候选人
   */
  best: InstanceItem | undefined;
}
