import { DecoratedClass, DecoratedClassOrProto, PropertyDecorator } from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { PropertyDecoratorValidator } from '@/core/validator/PropertyDecoraotrValidator';
import { InstanceFactory } from './InstanceFactory';
import { DecoratorConfigHandler } from '@/core/handler/DecoratorConfigHandler';
import { InjectDecoratorStateManager } from '@/core/statemanager/ioc/InjectDecoratorStateManager';
import { DecoratorInfo } from '../DecoratorInfo';
import { InjectDecoratorOptions, GetInstanceConfig, InjectDecoratorConfig } from './types/ioc';
/**
 * inject装饰器工厂
 */

export class InjectDecoratorFactory extends DecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  /**
   * 装饰器校验器
   */
  protected decoratorValidator!: PropertyDecoratorValidator;

  /**
   * 装饰器状态管理器
   */
  protected stateManager!: InjectDecoratorStateManager;

  /**
   * 初始化装饰器信息
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.INJECT)
      .setType('ioc')
      .setConflictList([DECORATORNAME.INJECT]);
  }

  /**
   *
   * @param target 被装饰属性所在类
   * @param propertyKey 被装饰属性的名称
   */
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    const { conflictList } = this.decoratorInfo;

    // 校验装饰器是否存在冲突
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList, propertyKey)) {
      throw new Error('Conflict decorator');
    }
  }
  /**
   * 装饰器配置检查
   * @param config 装饰器配置
   */
  protected preCheckConfig(config: InjectDecoratorOptions): void {
    //JoiUtils.validate(injectDecoratorConfigSchema, config);
  }
  /**
   * 处理装饰器配置
   * @param config 装饰器配置
   */
  protected preHandleConfig(config: InjectDecoratorOptions): GetInstanceConfig {
    let defaultConfig: GetInstanceConfig = {
      module: '__default__',
      scope: 'SINGLETON',
    };
    // 如果是表达式
    if (typeof config === 'string') {
      let exps = config.split('.');
      if (exps.length === 1) {
        defaultConfig.alias = exps[0];
      }
      if (exps.length === 2) {
        defaultConfig.module = exps[0];
        defaultConfig.alias = exps[1];
      }
    }
    if (typeof config === 'function') {
      defaultConfig.constructor = config;
    }
    if (typeof config === 'object') {
      defaultConfig = { ...defaultConfig, ...config };
    }

    return defaultConfig;
  }

  /**
   * 初始化状态
   * @param target 被装饰属性所在类或原型对象
   * @param config  装饰器配置
   */
  protected setupState(
    target: DecoratedClassOrProto,
    config: InjectDecoratorConfig,
    propertyKey: string | symbol,
  ): void {
    // 补全装饰器信息
    this.decoratorInfo.setConfig(config);
    // 初始化装饰器信息列表
    this.stateManager.initDecoratorInfos(target, propertyKey);
    // 记录装饰器信息到装饰器列表
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo, propertyKey);
    // 初始化备份实例列表
    this.stateManager.initInjectBackups(target, propertyKey);
    // 如果有备份实例列表，则设置备份实例列表
    if (config && typeof config === 'object' && config.backups) {
      // 设置备选实例列表
      this.stateManager.setInjectBackups(target, propertyKey, config.backups);
    }
  }

  /**
   * 实现核心处理逻辑
   * @param target 被装饰属性所在类
   * @param config 装饰器配置
   * @param propertyKey 被装饰属性的名称
   */
  protected injectInstance(
    config: InjectDecoratorConfig,
    target: DecoratedClassOrProto,
    propertyKey: string | symbol,
  ): void {
    // 树摇配置
    let getInstanceConfig = DecoratorConfigHandler.treeShakingConfig(config, ['backups']) as GetInstanceConfig;

    // 调用实例工厂获取实例
    let instance = InstanceFactory.getInstance(target, propertyKey, getInstanceConfig);

    // 如果实例获取失败，查看是否提供了备份实例
    if (!instance) {
      const backups = this.stateManager.getInjectBackups(target, propertyKey);
      if (backups && backups.length > 0) {
        for (let backup of backups) {
          // 如果是构造函数则调用返回实例
          if (typeof backup === 'function') {
            try {
              instance = new (backup as DecoratedClass)();
              break;
            } catch (error) {
              continue;
            }
          }
          if (typeof backup === 'object') {
            instance = backup;
            break;
          }
        }
      }
    }
    // 获取声明的实例类型
    const declaredType = Reflect.getMetadata('design:type', target, propertyKey);
    // 如果实例类型不匹配，则尝试转换
    if (instance && declaredType && !declaredType.prototype.isPrototypeOf(instance)) {
      console.warn(
        `inject instance type not match declared type,declared type is ${declaredType.name}, inject instance type is ${instance.constructor.name}`,
      );
    }
    target[propertyKey] = instance;
  }

  /**
   * 创建inject属性装饰器
   * @param config 装饰器配置
   * @returns inject属性装饰器
   */
  public createDecorator(config: InjectDecoratorOptions = {}): PropertyDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string) => {
      // 初始化装饰器信息
      this.initDecoratorInfo();
      // 校验装饰器
      this.validateDecorator(target, propertyKey);
      // 校验装饰器配置
      this.preCheckConfig(config);
      // 预处理配置
      const handledConfig = this.preHandleConfig(config);
      // 设置装饰器状态
      this.setupState(target, handledConfig, propertyKey);
      // 执行核心逻辑
      this.injectInstance(handledConfig, target, propertyKey);
    };
  }
}
