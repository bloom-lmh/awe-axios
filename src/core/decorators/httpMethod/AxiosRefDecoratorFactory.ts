import { HttpRequestConfig } from './types/HttpRequestConfig';
import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { DecoratedClassOrProto, MethodDecorator } from '../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { MethodDecoratorValidator } from '@/core/validator/MethodDecoratorValidator';
import { AxiosInstance } from 'axios';
import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';
import { SubDecoratorFactory } from '../SubDecoratorFactory';
import { Inject } from '..';
import { SYSTEM } from '@/core/constant/SystemConstants';

/**
 * refAxiosDecorator
 * @description 为http方法装饰器或类添加axios实例
 */
export class AxiosRefDecoratorFactory extends SubDecoratorFactory {
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
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo().setName(DECORATORNAME.AXIOSREF).setConflictList([DECORATORNAME.AXIOSREF]);
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
   * 设置状态
   * @param target 倍装饰方法所示的类或原型
   * @param config
   * @param propertyKey
   */
  protected setupState(target: DecoratedClassOrProto, config: AxiosInstance, propertyKey: string | symbol): void {
    // 添加配置
    this.decoratorInfo.setConfig(config);
    // 设置自身信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo, propertyKey);
    // 初始化子装饰器配置信息
    this.stateManager.initSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
  }

  /**
   * 后处理配置
   */
  protected handleConfig(target: DecoratedClassOrProto, config: AxiosInstance, propertyKey: string | symbol): void {
    // 尝试获取HttpApi类型的装饰器信息
    const httpMethodDecoratorInfo = this.stateManager.getHttpMethodDecoratorInfo(target, propertyKey);
    // 如果存在直接在信息上进行设置
    if (httpMethodDecoratorInfo) {
      const httpMethodConfig = httpMethodDecoratorInfo.configs[0] as HttpRequestConfig;
      if (httpMethodConfig && !httpMethodConfig.refAxios) {
        httpMethodConfig.setRefAxios(config);
      }
    } else {
      // 如没有HttpApi装饰器的信息,则在子装饰器配置项中进行设置
      const subDecoratorConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
      subDecoratorConfig && (subDecoratorConfig['refAxios'] = config);
    }
  }

  /**
   * 创建装饰器
   * @param config axios实例
   */
  public createDecorator(config: AxiosInstance): MethodDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string | symbol): void => {
      // 初始化装饰器信息
      this.initDecoratorInfo();
      // 校验装饰器
      this.validateDecorator(target, propertyKey);
      // 设置状态
      this.setupState(target, config, propertyKey);
      // 处理配置
      this.handleConfig(target, config, propertyKey);
    };
  }
}
