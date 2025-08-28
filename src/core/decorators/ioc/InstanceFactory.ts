import { JoiUtils } from '@/utils/JoiUtils';
import { dependencyOptionsSchema, instanceRegisterConfigSchema } from '@/core/schema/ioc/InstanceFactorySchema';
import { DecoratedClass, DecoratedClassProto } from '@/core/decorators/decorator';
import {
  CandidateInstances,
  DependencyConfig,
  DependencyOptions,
  InstanceArrayItem,
  InstanceMap,
  InstanceRegisterConfig,
  InstanceScope,
} from './types/ioc';
import 'reflect-metadata';
import { ObjectUtils } from '@/utils/ObjectUtils';
import { ClassDecoratorStateManager } from '@/core/statemanager/ClassDecoratorStateManager';
import { PropertyDecoratorStateManager } from '@/core/statemanager/PropertyDecoratorStateManager';
import { ClassDecoratorValidator } from '@/core/validator/ClassDecoratorValidator';
import { PropertyDecoratorValidator } from '@/core/validator/PropertyDecoraotrValidator';
import { DecoratorConfigHandler } from '@/core/handler/DecoratorConfigHandler';
import { MethodDecoratorValidator } from '@/core/validator/MethodDecoratorValidator';
import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';
import { ParamDecoratorValidator } from '@/core/validator/ParamDecoratorValidator';
import { ParamDecoratorStateManager } from '@/core/statemanager/ParamDecoratorStateManager';
import { HttpMtdDecoratorConfigHandler } from '@/core/handler/httpMethod/HttpMtdDecoratorConfigHandler';

function Init(target: DecoratedClass) {
  const libs = [
    // 类状态管理器
    ClassDecoratorStateManager,
    PropertyDecoratorStateManager,
    MethodDecoratorStateManager,
    ParamDecoratorStateManager,
    ClassDecoratorValidator,
    PropertyDecoratorValidator,
    MethodDecoratorValidator,
    ParamDecoratorValidator,
    DecoratorConfigHandler,
    HttpMtdDecoratorConfigHandler,
  ];
  libs.forEach(lib => {
    target.registerInstance({
      constructor: lib,
    });
  });
}
/**
 * 实例工厂
 */
@Init
export class InstanceFactory {
  /**
   * 实例工厂Map
   */
  private static instanceMap: InstanceMap = new Map();

  /**
   * 注册实例
   */
  static registerInstance(config: InstanceRegisterConfig) {
    // 参数校验
    config = JoiUtils.validate<InstanceRegisterConfig>(instanceRegisterConfigSchema, config);
    // 参数处理
    let { module = '__default__', constructor, alias = this.getDefaultAlias(constructor) } = config;

    // 实例模块不存在则创建
    if (!InstanceFactory.instanceMap.has(module)) {
      // 创建实例
      let instance = new constructor();
      // 注册实例
      this.instanceMap.set(module, [{ constructor, ctorName: constructor.name, alias, instance }]);
    } else {
      // 获取模块对应实例数组
      let instanceArray = InstanceFactory.instanceMap.get(module) || [];

      // 不允许同类实例重复注册
      let hasInstance = instanceArray.some(
        item => item.alias === alias || item.constructor === constructor || item.ctorName === constructor.name,
      );

      if (hasInstance) {
        throw new Error(`Instance with alias or constructor or ctorName already exists in module ${module}`);
      }
      // 注册实例
      instanceArray.push({ constructor, ctorName: constructor.name, alias, instance: new constructor() });
      InstanceFactory.instanceMap.set(module, instanceArray);
    }
  }
  /**
   * 获取实例
   */
  static getInstance(
    target: DecoratedClass | DecoratedClassProto,
    propertyKey: string | symbol,
    config: DependencyOptions,
  ) {
    // 参数校验,并处理配置
    config = JoiUtils.validate<DependencyOptions>(dependencyOptionsSchema, config);

    // 表达式形式
    if (typeof config === 'string') {
      return this.getInstanceItemByExpression(config)?.instance;
    }
    // 获取属性类型
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    // 无配置选项
    if (typeof config === 'undefined') {
      // 根据类型推断获取实例
      return this.getInstanceItemByType(type)?.instance;
    }
    // 有配置选项
    if (typeof config === 'object') {
      // 根据配置选项获取实例
      let instanceItem = this.getInstanceItemByConfig(type, config);
      if (!instanceItem) {
        return undefined;
      }
      config.scope = (config.scope?.toUpperCase() as InstanceScope) || 'SINGLETON';
      const { constructor, instance } = instanceItem;
      // 单例模式
      if (config.scope === 'SINGLETON') {
        return instance;
      }
      // 瞬时模式
      if (config.scope === 'TRANSIENT') {
        return new constructor();
      }
      // 原型模式
      if (config.scope === 'PROTOTYPE') {
        return Object.create(instance);
      }
      // 浅克隆模式
      if (config.scope === 'SHALLOWCLONE') {
        return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance);
      }
      // 深克隆模式
      if (config.scope === 'DEEPCLONE') {
        return ObjectUtils.deepClone(instance);
      }
    }
  }

  /**
   * 根据配置选项获取实例
   */
  static getInstanceItemByConfig(type: DecoratedClass, config: DependencyConfig): InstanceArrayItem | undefined {
    const { module = '__default__', ctorNameOrAlias, expression } = config;
    // 有模块和标识符，则通过模块和标识符获取实例
    if (module && ctorNameOrAlias) {
      return this.getInstanceItemByExpression(`${module}.${ctorNameOrAlias}`);
    }
    if (expression) {
      return this.getInstanceItemByExpression(expression);
    }
    // 有模块但无标识符，则通过模块和类型推断获取实例
    return this.getInstanceItemByType(type, module);
  }
  /**
   * 根据表达式获取实例
   */
  static getInstanceItemByExpression(expression: string): InstanceArrayItem | undefined {
    const expressions = expression.split('.');
    let module: string = '__default__';
    let aliasOrCtorName: string = '';
    // 表达式长度为1表示别名/类名
    if (expressions.length === 1) {
      aliasOrCtorName = expressions[0];
    }
    // 表达式长度为2表示模块和别名/类名
    if (expressions.length === 2) {
      module = expressions[0];
      aliasOrCtorName = expressions[1];
    }
    return this.instanceMap
      .get(module)
      ?.find(item => item.alias === aliasOrCtorName || item.ctorName === aliasOrCtorName);
  }
  /**
   * 根据类型推断获取实例
   */
  static getInstanceItemByType(type: DecoratedClass, module: string = '__default__') {
    if (type === undefined) {
      return undefined;
    }
    // 判断是否有多个同类型且primary为true的实例
    const { count, candidates, best } = this.countCandidates(type, module);
    // 没有同类型或子类的实例
    if (count === 0) {
      return undefined;
    }
    // 有一个同类型或子类的实例，只返回该实例
    if (count === 1) {
      return candidates[0];
    }
    // 有多个同类型或子类的实例
    if (count > 1) {
      if (best) return best;
      throw new Error(`Multiple instances of ${type.name} found in module ${module}, but no primary instance found.`);
    }
  }
  /**
   * 清空容器
   */
  static clear() {
    if (process.env.NODE_ENV === 'test') {
      this.instanceMap.clear();
    } else {
      throw new Error('InstanceFactory cannot be cleared in production environment.');
    }
  }
  /**
   * 获取同类型或子类的实例个数
   * @param [primary=false] 是否加入primary为true的条件，用来判断是否有多个同类型且primary为true的实例
   */
  private static countCandidates(type: DecoratedClass, module: string = '__default__'): CandidateInstances {
    let instanceArray = InstanceFactory.instanceMap.get(module);
    if (!instanceArray) {
      return { count: 0, candidates: [], best: undefined };
    }
    let candidates = instanceArray.filter(item => item.constructor === type || item.instance instanceof type);
    // 判断是否有最佳的候选人
    let best = candidates.find(item => item.constructor === type);
    return { count: candidates.length, candidates, best };
  }
  /**
   *
   * @param ctor 构造函数
   * @returns 默认别名
   */
  public static getDefaultAlias(ctor: DecoratedClass): string {
    const name = ctor.name;
    // 处理连续大写（如 "JSONParser" -> "JSONParser"）
    if (name.length > 1 && name[1] === name[1].toUpperCase()) {
      return name;
    }
    return name[0].toLowerCase() + name.slice(1);
  }
}
