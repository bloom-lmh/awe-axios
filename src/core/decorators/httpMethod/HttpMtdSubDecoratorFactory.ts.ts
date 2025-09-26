import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { DecoratedClassOrProto, MethodDecorator } from '../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { MethodDecoratorValidator } from '@/core/validator/MethodDecoratorValidator';
import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';
import { SubDecoratorFactory } from '../SubDecoratorFactory';
import { Inject } from '..';
import { SYSTEM } from '@/core/constant/SystemConstants';

/**
 * http方法子项装饰器工程
 * @description 为http方法装饰器或类添加axios实例
 */
export abstract class HttpMtdSubDecoratorFactory<T> extends SubDecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;
  /**
   * 方法装饰器校验器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: MethodDecoratorValidator,
  })
  protected decoratorValidator!: MethodDecoratorValidator;

  /**
   * 方法状态管理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: MethodDecoratorStateManager,
  })
  protected stateManager!: MethodDecoratorStateManager;

  /**
   * 初始化装饰器信息
   * @param config
   */
  protected initDecoratorInfo(decoratorName: string | symbol): void {
    this.decoratorInfo = new DecoratorInfo().setName(decoratorName).setConflictList([decoratorName]);
  }

  /**
   * 校验装饰器
   * @param target 被装饰的方法所在类或原型
   * @param propertyKey 方法名
   */
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    // 获取装饰器信息
    const { conflictList } = this.decoratorInfo;
    // 冲突性校验
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList, propertyKey)) {
      throw new Error(`The @refAxios decorator cannot be used with the  decorators at the same time.`);
    }
  }
  /**
   * 预处理配置
   */
  /**
   * 设置状态
   * @param target 倍装饰方法所示的类或原型
   * @param config
   * @param propertyKey
   */
  protected setupState(target: DecoratedClassOrProto, config: T, propertyKey: string | symbol): void {
    // 添加配置
    this.decoratorInfo.setConfig(config);
    // 设置自身信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo, propertyKey);
    // 初始化子装饰器配置信息
    this.stateManager.initSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
  }
  /**
   * 处理配置
   */
  protected abstract handleConfig(...args: any[]): void;
  /**
   * 创建装饰器
   * @param config axios实例
   */
  public createDecorator(decoratorName: string | symbol, config: T): MethodDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string | symbol): void => {
      // 初始化装饰器信息
      this.initDecoratorInfo(decoratorName);
      // 校验装饰器
      this.validateDecorator(target, propertyKey);
      // 设置状态
      this.setupState(target, config, propertyKey);
      // 处理配置
      this.handleConfig(target, config, propertyKey);
    };
  }
}
