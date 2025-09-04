import { SubDecorationInfo } from './ioc';
import { ctorNameOrAlias } from './../core/validators/schema/IocShema';
import { DecoratedClass } from './decorator';
/**
 * 实例数组中的项
 */
export type InstanceItem<T = any> = InstanceRegisterConfig<T> & {
  /**
   * 实例
   */
  instance: T;
  /**
   * 构造函数名
   */
  ctorName: string;
};

/**
 * 实例数组
 */
export type InstanceItemArray = InstanceItem[];

/**
 * 实例工厂map
 */
export type InstanceItemMap = Map<string | symbol, InstanceItemArray>;

/**
 * 实例注册时配置
 */
export interface InstanceRegisterConfig {
  /**
   * 实例的模块命名空间，防止不同模块的实例命名冲突
   */
  module: string;
  /**
   * 别名，用于唯一标识一个类实例
   */
  alias: string;
  /**
   * 实例的名称，用于在模块中获取实例
   */
  ctor: DecoratedClass;
}
/**
 * 获取实例配置对象
 */
export type GetInstanceConfig = {
  /**
   * 模块名
   */
  module: string;
  /**
   * 别名
   */
  alias?: string;
  /**
   * 构造器
   */
  ctor?: DecoratorClass;
  /**
   * 创建实例模式
   */
  scope: InstanceScope | string;
};
/**
 * 组件装饰器配置
 */
export type ComponentDecoratorConfig = Partial<Exclude<InstanceRegisterConfig, 'ctor'>>;

/**
 * @Component 装饰器配置
 */
export type ComponentDecoratorOptions =
  | ComponentDecoratorConfig
  | string // 表达式
  | void;

/**
 * 获取实例模式配置
 * @default SINGLETON
 */
export type InstanceScope =
  /**
   * 单例模式
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
 * inject 装饰器备份列表
 * @description 当注入失败时的备选列表
 */
export type InjectBackups = DecoratedClass | Object | (DecoratedClass | Object)[];

/**
 * inject 装饰器配置
 */
export type InjectDecoratorConfig = Partial<GetInstanceConfig> & {
  /**
   * 备份列表
   */
  backups?: InjectBackups;
};

/**
 * @Inject 装饰器配置
 */
export type InjectDecoratorOptions =
  | InjectDecoratorConfig // 直接配置
  | DecoratedClass // 构造器
  | string; // 表达式

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
