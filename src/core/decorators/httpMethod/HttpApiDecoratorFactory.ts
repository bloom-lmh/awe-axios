import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { DecoratedClassOrProto, ClassDecorator, DecoratedClass } from '../decorator';
import { DecoratorFactory } from '../DecoratorFactory';
import { DecoratorInfo } from '../DecoratorInfo';
import { ClassDecoratorValidator } from '@/core/validator/ClassDecoratorValidator';
import { ClassDecoratorStateManager } from '@/core/statemanager/ClassDecoratorStateManager';
import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';
import { Inject } from '..';
import { PathUtils } from '@/utils/PathUtils';
import { HttpApiDecoratorConfig } from './types/httpMethod';
import { Axios, AxiosInstance } from 'axios';

/**
 * httpApi装饰器工厂
 */
export class HttpApiDecoratorFactory extends DecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  /**
   * 装饰器校验器
   */
  @Inject('classDecoratorValidator')
  protected decoratorValidator!: ClassDecoratorValidator;

  /**
   * 装饰器状态管理器
   */
  @Inject('classDecoratorStateManager')
  protected stateManager!: ClassDecoratorStateManager;

  /**
   * 方法状态管理器
   */
  @Inject('methodDecoratorStateManager')
  protected methodStateManager!: MethodDecoratorStateManager;

  /**
   * 初始化装饰器信息
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.HTTPAPI)
      .setType('ioc')
      .setConflictList([DECORATORNAME.HTTPAPI]);
  }

  /**
   * 校验装饰器
   * @param target 被装饰的类或类原型
   */
  protected validateDecorator(target: DecoratedClass): void {
    const { conflictList } = this.decoratorInfo;
    // 装饰器冲突校验
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList)) {
      throw new Error(`@Api decorator can not be used with `);
    }
  }

  /**
   * 配置预处理
   * @param config HttpApi装饰器配置
   * @param target
   * @description 需要与方法装饰器进行合并等
   */
  protected preHandleConfig(
    config: HttpApiDecoratorConfig | string | AxiosInstance | undefined,
    target: DecoratedClass,
  ): HttpApiDecoratorConfig {
    config = config || '';
    // 处理字符串配置
    if (typeof config === 'string') {
      // 如果是相对路径
      if (PathUtils.isAbsoluteHttpUrl(config)) {
        config = {
          baseURL: config,
        };
      } else {
        config = {
          url: config,
        };
      }
    }

    if (typeof config === 'function') {
      config = {
        refAxios: config,
      };
    }
    // 与子项配置合并
    const subItemsConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPAPI);

    if (subItemsConfig) {
      config = { ...config, ...subItemsConfig };
    }

    config = config as HttpApiDecoratorConfig;

    // 获取http方法装饰器的配置
    const httpRequestConfigs = [
      this.stateManager.getHttpConfigIdxes(target),
      this.stateManager.getHttpConfigIdxes(target.prototype),
    ]
      .filter(item => item)
      .flat();

    // 做配置合并
    httpRequestConfigs.forEach(httpConfig => {
      httpConfig = httpConfig!;
      let { baseURL, refAxios, mock, url = '', allowAbsoluteUrls } = httpConfig;
      // 若方法装饰器上没有设置baseURL则统一使用类装饰上的baseURL
      if (!baseURL && config.baseURL) {
        httpConfig.setBaseURL(config.baseURL);
      }
      if (!allowAbsoluteUrls && !PathUtils.isAbsoluteHttpUrl(url)) {
        httpConfig.concatUrl(config.url, true);
      }
      // 若方法上没有设置axios实例则统一使用类装饰器上的axios实例
      if (!refAxios && config.refAxios) {
        httpConfig.setRefAxios(config.refAxios);
      }
      // 合并mock配置
      if (config.mock && mock) {
        mock = { ...config.mock, ...mock };
        httpConfig.setMock(mock);
      }
    });
    return config;
  }

  /**
   * 校验配置
   * @param config 配置
   * @param target
   */
  protected preCheckConfig(config: any, target?: DecoratedClassOrProto): void {
    throw new Error('Method not implemented.');
  }

  /**
   * 设置状态
   * @param target 目标类
   * @param config httpApi配置
   */
  protected setupState(target: DecoratedClass, config: HttpApiDecoratorConfig): void {
    // 添加配置
    this.decoratorInfo.setConfig(config);
    // 设置装饰器信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo);
  }

  /**
   * 创建装饰器
   * @param config
   */
  public createDecorator(config?: HttpApiDecoratorConfig | string | AxiosInstance): ClassDecorator {
    return (target: DecoratedClass) => {
      // 初始化装饰器信息
      this.initDecoratorInfo();
      // 校验装饰器
      this.validateDecorator(target);
      // 配置预处理
      const httpApiDecoratorConfig = this.preHandleConfig(config, target);
      // 设置状态
      this.setupState(target, httpApiDecoratorConfig);
    };
  }
}
