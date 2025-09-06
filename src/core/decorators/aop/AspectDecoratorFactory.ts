import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { DecoratedClassOrProto, ClassDecorator, DecoratedClass } from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { DecoratorInfo } from '../DecoratorInfo';
import { ClassDecoratorValidator } from '@/core/validator/ClassDecoratorValidator';
import { Inject } from '..';
import { InstanceFactory } from '../ioc/InstanceFactory';
import { AspectDecoratorStateManager } from '@/core/statemanager/aop/AspectDecoratorStateManager';
import { AspectFactory } from './AspectFactory';
import { SYSTEM } from '@/core/constant/SystemConstants';

/**
 * 切面装饰器类
 */
export class AspectDecoratorFactory extends DecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  /**
   * 装饰器校验器
   */
  @Inject({ module: SYSTEM.LIB, ctor: ClassDecoratorValidator })
  protected decoratorValidator!: ClassDecoratorValidator;

  /**
   * 类状态管理器
   */
  @Inject({ module: SYSTEM.LIB, ctor: AspectDecoratorStateManager })
  protected stateManager!: AspectDecoratorStateManager;

  /**
   * 初始化装饰器信息
   * @param config
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.ASPECT)
      .setConflictList([DECORATORNAME.ASPECT, DECORATORNAME.HTTPAPI, DECORATORNAME.COMPONENT]);
  }

  /**
   * 校验装饰器
   * @param target 被装饰的类或方法
   * @param propertyKey 被装饰的方法
   * @param config
   */
  protected validateDecorator(target: DecoratedClass): void {
    const { conflictList } = this.decoratorInfo;
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList)) {
      throw new Error(
        `装饰器冲突，${String(this.decoratorInfo.name)}装饰器不能和${conflictList
          .map(i => String(i))
          .join('、')}等装饰器同时使用`,
      );
    }
  }
  // 无实现
  protected preHandleConfig(config: any, target?: DecoratedClassOrProto | any) {}
  protected preCheckConfig(config: any, target?: DecoratedClassOrProto): void {}

  /**
   * 设置状态
   * @param target 被装饰的类
   * @param args
   */
  protected setupState(target: DecoratedClass, config: number): void {
    this.decoratorInfo.setConfig(config);
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo);
  }

  /**
   * 将通知信息注入容器
   */
  protected registerAdvices(target: DecoratedClass, config: number): void {
    // 获取所有通知
    let advices = this.stateManager.getAdvices(target.prototype);

    if (advices && Object.keys(advices).length > 0) {
      // 注册切面所有通知
      AspectFactory.registerAspectAdvices(config, advices);
    }
  }

  /**
   * 创建装饰器
   * @param config 切面类的优先级order
   */
  public createDecorator(config: number): ClassDecorator {
    return (target: DecoratedClass) => {
      // 初始化装饰器信息
      this.initDecoratorInfo();
      // 校验装饰器
      this.validateDecorator(target);
      // 设置状态
      this.setupState(target, config);
      // 注册切面通知
      this.registerAdvices(target, config);
    };
  }
}
