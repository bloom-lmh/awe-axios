import { AxiosInstance } from 'axios';
import { SYSTEM, DECORATORNAME } from '../common/constant';
import { ClassDecoratorStateManager } from '../common/statemanager';
import { ClassDecoratorValidator } from '../common/validator';
import { ClassDecorator, DecoratedClass } from '../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { Inject } from '../ioc';
import { SubDecoratorFactory } from '../SubDecoratorFactory';
import { i18n, I18n } from '@/i18n/i18n';

/**
 * refAxios 装饰器
 * @description 是HttpApi的子项，用于指定axios引用
 */
export class RefAxiosDecoratorFactory extends SubDecoratorFactory {
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
   * 状态管理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: ClassDecoratorStateManager,
  })
  protected stateManager!: ClassDecoratorStateManager;

  /**
   * 初始化装饰器信息
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.REFAXIOS)
      .setConflictList([DECORATORNAME.REFAXIOS])
      .setType('ioc');
  }

  /**
   * 校验装饰器
   * @param target 被装饰的类
   */
  protected validateDecorator(target: DecoratedClass): void {
    const { conflictList } = this.decoratorInfo;
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList)) {
      throw new Error(I18n.t_v2(i18n.ERROR.DECORATOER_CONFLICT));
    }
  }

  /**
   * 状态设置
   * @param target
   * @param config
   */
  protected setupState(target: DecoratedClass, config: AxiosInstance): void {
    // 添加配置
    this.decoratorInfo.setConfig(config);
    // 添加装饰器信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo);
    // 初始化子装饰器信息
    this.stateManager.initSubDecoratorConfig(target, DECORATORNAME.HTTPAPI);
  }

  /**
   * 处理配置
   * @param target 被装饰的类
   * @param config 配置对象
   */
  protected handleConfig(target: DecoratedClass, config: AxiosInstance): void {
    // 尝试获取HttpApi装饰器配置，若没有表示该子装饰器配置在HttpApi装饰器之下
    const httpApiConfig = this.stateManager.getDecoratorInfo(target, DECORATORNAME.HTTPAPI)?.configs[0];
    if (httpApiConfig) {
      httpApiConfig['refAxios'] = config;
    } else {
      // 尝试获取子装饰器配置
      const subDecoratorConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPAPI);
      // 设置配置项
      subDecoratorConfig && (subDecoratorConfig['refAxios'] = config);
    }
  }

  /**
   * 创建装饰器
   * @param config
   */
  public createDecorator(config: AxiosInstance): ClassDecorator {
    return (target: DecoratedClass) => {
      // 初始化装饰器
      this.initDecoratorInfo();
      // 校验装饰器
      this.validateDecorator(target);
      // 设置状态
      this.setupState(target, config);
      // 处理配置
      this.handleConfig(target, config);
    };
  }
}
