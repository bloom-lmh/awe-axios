import { ClassDecoratorValidator } from '../../validator/ClassDecoratorValidator';
import { ClassDecorator, DecoratedClass, DecoratedClassOrProto } from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { InstanceFactory } from './InstanceFactory';
import { componentDecoratorConfigSchema } from '@/core/schema/ioc/ComponentSchema';
import { ClassDecoratorStateManager } from '@/core/statemanager/ClassDecoratorStateManager';
import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { JoiUtils } from '@/utils/JoiUtils';
import { ComponentDecoratorOptions, InstanceRegisterConfig } from './types/ioc';
import { DecoratorInfo } from '../DecoratorInfo';
import { Inject } from '..';
import { SYSTEM } from '@/core/constant/SystemConstants';

/**
 * Component 装饰器工厂
 * @description 用于创建 Component 装饰器
 */
export class ComponentDecoratorFactory extends DecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  /**
   * 装饰器校验器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: ClassDecoratorValidator,
  })
  protected decoratorValidator!: ClassDecoratorValidator;

  /**
   * 类装饰器状态管理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: ClassDecoratorStateManager,
  })
  protected stateManager!: ClassDecoratorStateManager;

  /**
   * 初始化装饰器信息
   * @param target 被装饰的类
   * @param propertyKey
   * @description 每一个装饰器都应该有信息，包括装饰器名字，装饰器类型，装饰器是否可以重复，装饰器是否可以与其他装饰器冲突等
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.COMPONENT)
      .setType('ioc')
      .setConflictList([DECORATORNAME.COMPONENT]);
  }

  /**
   * 校验装饰器
   * @param target 被装饰的类
   */
  protected validateDecorator(target: DecoratedClass): void {
    // 获取装饰器名
    const { conflictList } = this.decoratorInfo;
    // 校验是否存在冲突装饰器
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList)) {
      throw new Error('The Component decorator confilct with other decorators in the class.');
    }
  }

  /**
   * 配置前置检查
   * @param config 装饰器配置
   */
  protected preCheckConfig(options: ComponentDecoratorOptions): void {
    // 若配置存在则校验
    // JoiUtils.validate(componentDecoratorConfigSchema, config);
  }

  /**
   * 预处理装饰器配置
   * @param config 装饰器配置
   * @description 需要将装饰器配置转换为能够注入实例工厂的配置
   */
  protected preHandleConfig(options: ComponentDecoratorOptions, target: DecoratedClass): InstanceRegisterConfig {
    // 实例工厂配置
    const insRegisterConfig: InstanceRegisterConfig = {
      module: '__default__',
      ctor: target,
      alias: InstanceFactory.getDefaultAlias(target),
    };
    // 传入string类型配置
    if (typeof options === 'string') {
      const exps = options.split('.');
      if (exps.length === 1) {
        insRegisterConfig.alias = exps[0];
      }
      if (exps.length === 2) {
        insRegisterConfig.module = exps[0];
        insRegisterConfig.alias = exps[1];
      }
    }
    if (typeof options === 'object') {
      insRegisterConfig.module = options.module || insRegisterConfig.module;
      insRegisterConfig.alias = options.alias || insRegisterConfig.alias;
    }
    return insRegisterConfig;
  }

  /**
   * 设置状态
   * @param target 被装饰的类
   * @param config 装饰器配置
   */
  protected setupState(target: DecoratedClass, config: InstanceRegisterConfig): void {
    // 完善装饰器信息
    this.decoratorInfo.setConfig(config);
    // 在类上面初始化装饰器信息列表元数据
    this.stateManager.initDecoratorInfos(target);
    // 注册装饰器信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo);
  }
  /**
   * 注册实例
   * @param target 被装饰的类
   * @param config 实例工厂注册实例时的配置
   */
  protected registerInstance(config: InstanceRegisterConfig): void {
    // 注册实例
    InstanceFactory.registerInstance(config);
  }
  /**
   * 创建装饰器
   * @param config 装饰器配置
   * @returns Component装饰器
   */
  public createDecorator(options?: ComponentDecoratorOptions): ClassDecorator {
    // 初始化装饰器信息
    this.initDecoratorInfo();
    // 返回装饰
    return (target: DecoratedClass) => {
      // 校验装饰器
      this.validateDecorator(target);
      // 配置前置检查
      this.preCheckConfig(options);
      // 预处理装饰器配置
      const insRegisterConfig = this.preHandleConfig(options, target);
      // 设置状态
      this.setupState(target, insRegisterConfig);
      // 执行装饰器核心逻辑
      this.registerInstance(insRegisterConfig);
    };
  }
}
