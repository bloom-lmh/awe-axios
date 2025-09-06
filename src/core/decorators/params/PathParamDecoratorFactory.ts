import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { DecoratedClassOrProto, ParameterDecorator, ParamDecoratorConfig } from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { DecoratorInfo } from '../DecoratorInfo';
import { ParamDecoratorValidator } from '@/core/validator/ParamDecoratorValidator';
import { JoiUtils } from '@/utils/JoiUtils';
import { ParamSchema } from '@/core/schema/param/ParamSchema';
import { ParamDecoratorStateManager } from '@/core/statemanager/ParamDecoratorStateManager';
import { Inject } from '..';
import { SYSTEM } from '@/core/constant/SystemConstants';

/**
 * 路径参数装饰器
 * @description 会将声明的参数放到对应的路径参数中
 */
export class PathParamDecoratorFactory extends DecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  /**
   * 装饰器校验器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: ParamDecoratorValidator,
  })
  protected decoratorValidator!: ParamDecoratorValidator;

  /**
   * 装饰器状态管理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: ParamDecoratorStateManager,
  })
  protected stateManager!: ParamDecoratorStateManager;

  /**
   * 初始化装饰器信息
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.PATHPARAM)
      .setType('parameter')
      .setConflictList([DECORATORNAME.PATHPARAM, DECORATORNAME.QUERYPARAM, DECORATORNAME.BODYPARAM]);
  }
  /**
   * 校验装饰器
   * @param target 被装饰的类或类原型对象
   * @param propertyKey 被装饰的方法名
   */
  protected validateDecorator(
    target: DecoratedClassOrProto,
    propertyKey: string | symbol,
    config: ParamDecoratorConfig,
  ): void {
    // 获取冲突列表
    const { conflictList, name } = this.decoratorInfo;
    const { paramName, paramIndex } = config;
    // 校验装饰器是否冲突(不允许同一个属性上冲突装饰器)
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList, propertyKey, paramIndex)) {
      throw new Error(`PathParam decorator cannot be used with the  decorator at the same time.`);
    }
    // 校验装饰器声明的属性名是否重复
    if (this.decoratorValidator.hasDuplicateParamName(target, propertyKey, name, paramName)) {
      throw new Error(
        `Duplicate ${name.toString()} decorator for parameter ${paramName} in method ${propertyKey.toString()}.`,
      );
    }
  }
  /**
   * 预处理配置
   * @param paramName 参数名
   * @param paramIndex 参数索引
   */
  protected preHandleConfig(paramName: string, paramIndex: number): ParamDecoratorConfig {
    return { paramName, paramIndex };
  }
  /**
   * 配置检查
   * @param config 配置
   */
  protected preCheckConfig(config: ParamDecoratorConfig): void {
    JoiUtils.validate(ParamSchema, config);
  }
  /**
   * 设置状态
   * @param target 被装饰的类或类原型对象
   */
  protected setupState(
    target: DecoratedClassOrProto,
    config: ParamDecoratorConfig,
    propertyKey: string | symbol,
  ): void {
    // 装置配置
    this.decoratorInfo.setConfig(config);
    // 设置装饰器信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo, propertyKey);
  }

  /**
   *
   * @param config
   * @returns
   */
  public createDecorator(paramName: string): ParameterDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string | symbol, paramIndex: number) => {
      // 初始化装饰器信息
      this.initDecoratorInfo();
      // 预处理配置
      let paramDecoratorConfig = this.preHandleConfig(paramName, paramIndex);
      // 校验装饰器
      this.validateDecorator(target, propertyKey, paramDecoratorConfig);
      // 设置状态
      this.setupState(target, paramDecoratorConfig, propertyKey);
    };
  }
}
