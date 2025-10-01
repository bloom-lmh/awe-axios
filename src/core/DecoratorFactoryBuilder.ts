import { DecoratorConfigHandler } from './common/handler/DecoratorConfigHandler';
import { DecoratorStateManager } from './common/statemanager/DecoratorStateManager';
import { DecoratorValidator } from './common/validator/DecoratorValidator';
import { DecoratorInfo } from './DecoratorInfo';

/**
 * 装饰器工厂建造者
 */
export abstract class DecoratorFactoryBuilder {
  /**
   * 装饰器信息
   */
  protected abstract decoratorInfo: DecoratorInfo;

  /**
   * 装饰器配置处理器
   */
  protected configHandler?: DecoratorConfigHandler;

  /**
   * 装饰器状态管理器
   */
  protected stateManager?: DecoratorStateManager;

  /**
   * 装饰器校验器
   */
  protected decoratorValidator?: DecoratorValidator;

  /**
   * 构造函数（可选初始化）
   */
  constructor(options?: {
    configHandler?: DecoratorConfigHandler;
    stateManager?: DecoratorStateManager;
    decoratorValidator?: DecoratorValidator;
  }) {
    if (options) {
      let { configHandler, stateManager, decoratorValidator } = options;
      this.configHandler = configHandler;
      this.stateManager = stateManager;
      this.decoratorValidator = decoratorValidator;
    }
  }
  /**
   * 设置装饰器信息
   */
  setDecoratorInfo(info: DecoratorInfo): this {
    this.decoratorInfo = info;
    return this;
  }
  /**
   * 设置配置处理器
   */
  setConfigHandler(handler: DecoratorConfigHandler): this {
    this.configHandler = handler;
    return this;
  }

  /**
   * 设置状态管理器
   */
  setStateManager(manager: DecoratorStateManager): this {
    this.stateManager = manager;
    return this;
  }

  /**
   * 设置装饰器校验器
   */
  setDecoratorValidator(validator: DecoratorValidator): this {
    this.decoratorValidator = validator;
    return this;
  }
}
