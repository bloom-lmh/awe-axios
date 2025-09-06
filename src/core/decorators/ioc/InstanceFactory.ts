import { DecoratedClass, DecoratedClassOrProto } from '@/core/decorators/decorator';
import {
  CandidateInstances,
  GetInstanceConfig,
  InstanceItem,
  InstanceItemMap,
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
import { PointCutDecoratorConfigHandler } from '@/core/handler/aop/PointCutDecoratorConfigHandler';
import { AspectDecoratorStateManager } from '@/core/statemanager/aop/AspectDecoratorStateManager';
import { MethodItem } from '../aop/types/aop';
import { SYSTEM } from '@/core/constant/SystemConstants';

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
    PointCutDecoratorConfigHandler,
    AspectDecoratorStateManager,
  ];
  libs.forEach(lib => {
    target.registerInstance({
      module: SYSTEM.LIB,
      ctor: lib,
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
  private static instanceItemMap: InstanceItemMap = new Map().set(SYSTEM.LIB, []);

  /**
   * 注册实例
   */
  static registerInstance(config: InstanceRegisterConfig) {
    // 参数校验
    //config = JoiUtils.validate<InstanceRegisterConfig>(instanceRegisterConfigSchema, config);
    // 参数处理
    let { module = '__default__', ctor, alias = this.getDefaultAlias(ctor) } = config;
    // 获取构造函数对应的方法信息
    let methodNames = this.getMethodNames(ctor);
    // 实例模块不存在则创建
    if (!InstanceFactory.instanceItemMap.has(module)) {
      // 注册实例
      this.instanceItemMap.set(module, [
        { module, ctor, ctorName: ctor.name, alias, instance: undefined, methodNames },
      ]);
    } else {
      // 获取模块对应实例数组
      let instanceItemArray = InstanceFactory.instanceItemMap.get(module) || [];

      // 不允许同类实例重复注册
      let hasInstance = instanceItemArray.some(
        item => item.alias === alias || item.ctor === ctor || item.ctorName === ctor.name,
      );

      if (hasInstance) {
        throw new Error(`Instance with alias or ctor or ctorName already exists in module ${module}`);
      }
      // 注册实例
      instanceItemArray.push({ module, ctor, ctorName: ctor.name, alias, instance: undefined, methodNames });
      InstanceFactory.instanceItemMap.set(module, instanceItemArray);
    }
  }

  /**
   * 获取实例
   */
  static getInstance(target: DecoratedClassOrProto, propertyKey: string | symbol, config: GetInstanceConfig) {
    // 参数校验,并处理配置
    //config = JoiUtils.validate<DependencyOptions>(dependencyOptionsSchema, config);
    // 处理配置
    let { module = '__default__', alias, ctor, scope } = config;

    let instanceItem = undefined;
    // 通过模块和构造器获取实例项
    if (ctor) {
      instanceItem = this.getInstanceItemByCtor(module, ctor);
    } else if (alias) {
      // 通过别名获取实例项
      instanceItem = this.getInstanceItemByAlias(module, alias);
    } else {
      // 获取属性类型
      const type = Reflect.getMetadata('design:type', target, propertyKey);
      // 通过类型推断获取
      instanceItem = this.getInstanceItemByType(type, module);
    }
    if (!instanceItem) {
      return undefined;
    }
    // 注入模式
    scope = (scope?.toUpperCase() as InstanceScope) || 'SINGLETON';
    // 获取实例信息
    let { ctor: constuctor, instance } = instanceItem;
    // 没有实例则创建
    if (!instance) {
      instance = new constuctor();
      instanceItem.instance = instance;
    }
    // 单例模式
    if (scope === 'SINGLETON') {
      return instance;
    }
    // 瞬时模式
    if (scope === 'TRANSIENT') {
      return Reflect.construct(constuctor, []);
    }
    // 原型模式
    if (scope === 'PROTOTYPE') {
      return Object.create(instance);
    }
    // 浅克隆模式
    if (scope === 'SHALLOWCLONE') {
      return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance);
    }
    // 深克隆模式
    if (scope === 'DEEPCLONE') {
      return ObjectUtils.deepClone(instance);
    }
  }

  /**
   * 根据构造器获取
   */
  static getInstanceItemByCtor(module: string | symbol, ctor: DecoratedClass): InstanceItem | undefined {
    let result = this.instanceItemMap.get(module)?.find(item => item.ctor === ctor);
    return result;
  }

  /**
   * 根据构造器名或别名获取
   * @param module 所属模块
   * @param ctorOrName
   */
  static getInstanceItemByAlias(module: string | symbol, alias: string): InstanceItem | undefined {
    return this.instanceItemMap.get(module)?.find(item => item.alias === alias);
  }

  /**
   * 获取构造器方法名
   */
  private static getMethodNames(ctor: DecoratedClass): string[] {
    let methodNames = Object.getOwnPropertyNames(ctor.prototype).filter(
      name => typeof (ctor.prototype as any)[name] === 'function',
    );
    return methodNames;
  }
  /**
   * 获取到所有的实例信息列表
   * @param [exludes=[]] 要排除的模块
   */
  static getInstanceItemList(exludedMocules: Array<string | symbol> = [SYSTEM.LIB]): Array<InstanceItem> {
    const instanceItems: Array<InstanceItem> = [];
    for (let [key, items] of this.instanceItemMap.entries()) {
      // 排除不筛选的模块实例项
      if (exludedMocules.includes(key)) continue;
      items.forEach(item => instanceItems.push(item));
    }
    return instanceItems;
  }

  /**
   * 根据表达式获取实例
   */
  static getInstanceItemByExpression(expression: string): InstanceItem | undefined {
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
    return this.instanceItemMap
      .get(module)
      ?.find(item => item.alias === aliasOrCtorName || item.ctorName === aliasOrCtorName);
  }

  /**
   * 根据类型推断获取实例
   */
  static getInstanceItemByType(type: DecoratedClass, module: string | symbol = '__default__') {
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
      throw new Error(
        `Multiple instances of ${type.name} found in module ${String(module)}, but no primary instance found.`,
      );
    }
  }

  /**
   * 清空容器
   */
  static clear() {
    if (process.env.NODE_ENV === 'test') {
      this.instanceItemMap.clear();
    } else {
      throw new Error('InstanceFactory cannot be cleared in production environment.');
    }
  }

  /**
   * 获取同类型或子类的实例个数
   * @param [primary=false] 是否加入primary为true的条件，用来判断是否有多个同类型且primary为true的实例
   */
  private static countCandidates(type: DecoratedClass, module: string | symbol = '__default__'): CandidateInstances {
    let instanceArray = InstanceFactory.instanceItemMap.get(module);
    if (!instanceArray) {
      return { count: 0, candidates: [], best: undefined };
    }
    let candidates = instanceArray.filter(item => item.ctor === type || item.instance instanceof type);
    // 判断是否有最佳的候选人
    let best = candidates.find(item => item.ctor === type);
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
