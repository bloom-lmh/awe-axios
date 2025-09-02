import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { DecoratedClassOrProto, MethodDecorator } from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { DecoratorInfo } from '../DecoratorInfo';
import { MethodDecoratorValidator } from '@/core/validator/MethodDecoratorValidator';
import { Inject } from '..';
import { PointCutDecoratorConfig, PointCutExpWithReturn, PointCutExpWithThrow, PointCutObj } from './types/aop';
import { PointCutDecoratorConfigHandler } from '@/core/handler/aop/PointCutDecoratorConfigHandler';
import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';

/**
 * 所有切入点装饰器
 */
export class PointCutDecoratorFactory extends DecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  /**
   * 装饰器配置
   */
  protected decoratorConfig!: PointCutDecoratorConfig;

  /**
   * 方法装饰器校验器
   */
  @Inject(MethodDecoratorValidator)
  protected decoratorValidator!: MethodDecoratorValidator;

  /**
   * 装饰器配置处理器
   */
  @Inject(PointCutDecoratorConfigHandler)
  protected configHandler!: PointCutDecoratorConfigHandler;

  /**
   * 方法状态管理器
   */
  @Inject(MethodDecoratorStateManager)
  protected stateManager!: MethodDecoratorStateManager;

  /**
   * 初始化装饰器信息
   */
  protected initDecoratorInfo(decoratorName: string | symbol): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(decoratorName)
      .setConflictList([
        DECORATORNAME.AFTER,
        DECORATORNAME.BEFORE,
        DECORATORNAME.AROUND,
        DECORATORNAME.AFTERRETURN,
        DECORATORNAME.AFTERTHROW,
        DECORATORNAME.POINTCUT,
      ]);
  }
  /**
   * 校验装饰器
   * @param target 被装饰的类或类原型
   * @param propertyKey 被装饰的方法
   */
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    // 获取冲突列表
    const { conflictList, dependsOn } = this.decoratorInfo;
    // 校验冲突
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList, propertyKey)) {
      throw new Error(`The decorator  cannot be used with .`);
    }
  }
  /**
   * 配置检查
   * @param config 切点配置
   */
  protected preCheckConfig(config: PointCutDecoratorConfig): void {}
  /**
   * 预处理配置
   * @param config  配置
   * @param target
   */
  protected preHandleConfig(config: PointCutDecoratorConfig, target?: DecoratedClassOrProto) {
    // 默认配置
    let defaultConfig: PointCutObj = {
      module: '*',
      ctor: '*',
      method: '*',
    };
    // 是切点函数
    if (typeof config === 'function') {
      config = config();
    }
    // 是切点表达式
    if (typeof config === 'string') {
      // 解析切点表达式
      config = this.configHandler.parsePointCutExpression(config);
    }
    // 是配置对象
    if (typeof config === 'object') {
      // 若配置中有切点表达式则进行解析
      let pointCutConfig = {};
      if ('expression' in config) {
        pointCutConfig = this.configHandler.parsePointCutExpression(config.expression);
        delete (config as any).expression;
        config = {
          ...pointCutConfig,
          ...config,
        };
      }
      // 合并配置
      defaultConfig = {
        ...defaultConfig,
        ...config,
      };
    }
    return defaultConfig;
  }

  /**
   * 状态设置
   * @param target 被装饰的类或原型
   * @param propertyKey 被装饰的方法
   */
  protected setupState(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    // 设置配置
    this.decoratorInfo.setConfig(this.decoratorConfig);
    // 注册装饰器信息到方法
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo, propertyKey);
    // 注册切点方法到类
  }

  /**
   * 创建装饰器
   * @param config 装饰器配置
   * @param decoratorName 装饰器名称
   */
  public createDecorator(config: PointCutDecoratorConfig, decoratorName: symbol | string): MethodDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      // 初始化装饰器
      this.initDecoratorInfo(decoratorName);
      // 校验装饰器
      this.validateDecorator(target, propertyKey);
      // 前置配置检查
      this.preCheckConfig(config);
      // 预处理配置
      const pointCutObj = this.preHandleConfig(config);

      console.log(pointCutObj);
    };
  }
}
