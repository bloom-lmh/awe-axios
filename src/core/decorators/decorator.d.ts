import { AxiosPlusRequestConfig } from './httpMethod/types/httpMethod';
import { DependencyConfig, InstanceRegisterConfig } from './ioc/types/ioc';

/**
 * 拥有类状态管理器对象
 */
type HasClassStateManager = {
  [key: string | symbol]: any;
};
/**
 * 被装饰类原型
 */
type DecoratedClassProto = HasClassStateManager;
/**
 * 被装饰类
 */
export type DecoratedClass<T = any> = new (...args: any[]) => T;
/**
 * 被装饰类或原型
 */
export type DecoratedClassOrProto = DecoratedClass | DecoratedClassProto;
/**
 * 拥有方法状态管理器对象
 */
type HasMethodStateManager = {
  [key: string | symbol]: any;
};
/**
 * 拥有参数状态管理器对象
 */
type HasParamStateManager = {
  [key: string | symbol]: any;
};
/**
 * 被装饰方法
 */
/* export type DecoratedMethod = ((
  target: DecoratedClassOrProto,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<any>,
) => any) &
  HasMethodStateManager &
  HasParamStateManager; */

/**
 * 类装饰器
 */
type ClassDecorator = (target: DecoratedClass) => void;

/**
 * 方法装饰器
 */
type MethodDecorator = (
  target: DecoratedClassOrProto,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<any>,
) => void;

/**
 * 属性装饰器
 */
type PropertyDecorator = (target: DecoratedClassOrProto, propertyKey: string) => void;

/**
 * 参数装饰器
 */
type ParameterDecorator = (target: DecoratedClassOrProto, propertyKey: string | symbol, paramIndex: number) => void;
/**
 * 参数装饰器
 */
type ParameterDecorator = (
  target: DecoratedClass,
  propertyKey: string | symbol | undefined,
  parameterIndex: number,
) => void;

/**
 * @Component 装饰器配置
 */
export type ComponentDecoratorConfig =
  | {
      /**
       * 实例的模块命名空间，防止不同模块的实例命名冲突
       */
      module?: string;
      /**
       * 别名，用于唯一标识一个类实例
       */
      alias?: string;
    }
  | string // 表达式
  | void; // 空配置会使用类型推断

/**
 * inject 装饰器备份列表
 * @description 当注入失败时的备选列表
 */
export type InjectBackups = DecoratedClass | Object | (DecoratedClass | Object)[];

/**
 * inject 装饰器配置
 */
export interface InjectDecoratorOptions extends DependencyConfig {
  backups?: InjectBackups;
}
/**
 * @Inject 装饰器配置
 */
export type InjectDecoratorConfig =
  | InjectDecoratorOptions // 直接配置
  | string // 表达式
  | void; // 空配置会使用类型推断

/**
 * param 装饰器配置
 */
export type ParamDecoratorConfig = {
  paramName: string;
  paramIndex: number;
};

/**
 * 装饰器类型
 */
export type DecoratorType = 'httpMethod' | 'ioc' | 'method' | 'class' | 'property' | 'parameter' | 'unknown';
/**
 * 装饰器信息模板
 */
export interface DecorationInfo {
  /**
   * 装饰器信息名称
   */
  name: string | symbol;
  /**
   * 装饰器所示类别
   */
  type: DecoratorType;

  /**
   * 装饰器信息配置
   */
  configs?: any[];
  /**
   * 装饰器冲突列表
   */
  conflictList?: (string | symbol)[];
  /**
   * 所依赖的装饰器列表
   */
  dependsOn?: (string | symbol)[];
}

/**
 * 子装饰器信息
 */
export interface SubDecorationConfigs {
  /**
   * 所属装饰器名：子装饰器配置
   */
  [key: string | symbol]: any;
}
