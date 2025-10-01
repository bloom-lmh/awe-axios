import { AxiosInstance } from 'axios';
import { SYSTEM, DECORATORNAME } from '../common/constant';
import { MethodDecoratorStateManager } from '../common/statemanager';
import { PropertyDecoratorValidator } from '../common/validator';
import { DecoratedClassOrProto } from '../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { MockHandlers, MockConfig } from '../httpMethod/types/httpMethod';
import { Inject } from '../ioc';
import { SubDecoratorFactory } from '../SubDecoratorFactory';

/**
 * mock http 装饰器
 */
export class MockDecoratorFactory extends SubDecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  @Inject({
    module: SYSTEM.LIB,
    ctor: PropertyDecoratorValidator,
  })
  protected decoratorValidator!: PropertyDecoratorValidator;

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
   */
  protected initDecoratorInfo(config?: any): void {
    this.decoratorInfo = new DecoratorInfo().setName(DECORATORNAME.MOCK).setConflictList([DECORATORNAME.MOCK]);
  }
  /**
   * 校验装饰器
   * @param target 被装饰的类或类原型
   * @param propertyKey 方法属性名
   */
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    const { conflictList } = this.decoratorInfo;
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList, propertyKey)) {
      throw new Error('装饰器冲突');
    }
  }
  /**
   * 处理配置
   */
  protected preHandleConfig(mockHandlers: MockHandlers, mockConfig?: Omit<MockConfig, 'handlers'>) {}
  /**
   * 设置状态
   * @param target
   * @param config
   * @param propertyKey
   */
  protected setupState(target: DecoratedClassOrProto, propertyKey: string | symbol, config: any): void {
    // 设置配置
    this.decoratorInfo;
    // 设置自身信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo, propertyKey);
    // 初始化子装饰器配置信息
    this.stateManager.initSubDecoratorConfig(target, DECORATORNAME.MOCK, propertyKey);
  }
  /**
   *
   * @param target
   * @param config
   * @param propertyKey
   */
  protected handleConfig(target: DecoratedClassOrProto, config?: AxiosInstance, propertyKey?: string | symbol): void {
    throw new Error('Method not implemented.');
  }
  /**
   * 创建装饰器函数
   * @param config
   */
  public createDecorator(mockHandlers: MockHandlers, mockConfig?: Omit<MockConfig, 'handlers'>): MethodDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      // 初始化装饰器信息
      this.initDecoratorInfo();
      // 校验装饰器
      this.validateDecorator(target, propertyKey);
      // 设置状态
    };
  }
}
