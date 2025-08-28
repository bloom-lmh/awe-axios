import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { DecoratedClassOrProto, MethodDecorator } from '../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { MethodDecoratorFactory } from '../MethodDecoratorFactory';
import { MethodDecoratorValidator } from '@/core/validator/MethodDecoratorValidator';
import { AxiosPlusRequestConfig } from './types/httpMethod';
import { HttpMethodDecoratorConfig } from './types/HttpMethodDecoratorConfig';
import { HttpRequestConfig } from './types/HttpRequestConfig';
import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';
import { ParamDecoratorStateManager } from '@/core/statemanager/ParamDecoratorStateManager';
import { PathUtils } from '@/utils/PathUtils';
import axios from 'axios';
import { JoiUtils } from '@/utils/JoiUtils';
import { axiosPlusRequestConfigSchema } from '@/core/schema/httpMethod/HttpMethodSchema';
import { ClassDecoratorStateManager } from '@/core/statemanager/ClassDecoratorStateManager';
import { HttpMtdDecoratorConfigHandler } from '@/core/handler/httpMethod/HttpMtdDecoratorConfigHandler';
import { Inject } from '..';

/**
 * Get装饰器工厂
 */
export class GetDecoratorFactory extends MethodDecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  /**
   * 方法装饰器校验器
   */
  @Inject('methodDecoratorValidator')
  protected decoratorValidator!: MethodDecoratorValidator;

  /**
   * 配置处理器
   */
  @Inject('httpMtdDecoratorConfigHandler')
  protected configHandler!: HttpMtdDecoratorConfigHandler;

  /**
   * 状态管理器
   */
  @Inject('methodDecoratorStateManager')
  protected stateManager!: MethodDecoratorStateManager;

  /**
   * 类状态管理器
   */
  @Inject('classDecoratorStateManager')
  protected classStateManager!: ClassDecoratorStateManager;

  /**
   * 参数状态管理器
   */
  @Inject('paramDecoratorStateManager')
  protected paramStateManager!: ParamDecoratorStateManager;

  /**
   * 初始化装饰器信息
   * @param target 被装饰的方法所属类获取原型
   * @param propertyKey 被装饰的方法名
   */
  protected initDecoratorInfo(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.GET)
      .setType('httpMethod')
      .setConflictList([
        DECORATORNAME.GET,
        DECORATORNAME.POST,
        DECORATORNAME.PUT,
        DECORATORNAME.DELETE,
        DECORATORNAME.PATCH,
        DECORATORNAME.HEAD,
        DECORATORNAME.OPTIONS,
      ]);
  }

  /**
   * 校验装饰器
   * @param target 被装饰的方法所属类获取原型
   * @param propertyKey 被装饰的方法名
   */
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    const { conflictList } = this.decoratorInfo;
    // 校验是否存在冲突装饰器
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList, propertyKey)) {
      throw new Error('The Get decorator confilct with other decorators in the class.');
    }
  }

  /**
   * 前置处理配置
   * @returns axiosPlusRequstConfig是在axiosRequestConfig基础上增加的额外配置需要进行检查，其余配置留给axios进行检查
   * @returns httpRequestConfig是HttpMethodDecoratorConfig的包装配置，封装了便于操作配置的建造者方法
   */
  protected preHandleConfig(
    config: HttpMethodDecoratorConfig | string = '',
    target: DecoratedClassOrProto,
    propertyKey: string | symbol,
  ): {
    axiosPlusRequstConfig: AxiosPlusRequestConfig;
    httpRequestConfig: HttpRequestConfig;
  } {
    // 处理字符串配置项
    if (typeof config === 'string') {
      config = { url: config };
    }
    config.method = 'get';
    // 尝试获取子装饰器配置项
    const sumItemsConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);

    // 若存在子项配置则合并
    let httpRequestConfig = sumItemsConfig
      ? this.configHandler.mergeSubItemsConfig(config, sumItemsConfig)
      : new HttpRequestConfig(config);

    // 解构额外配置
    let axiosPlusRequstConfig = this.configHandler.partialConfig(config, ['throttle', 'debounce', 'retry']);
    return { httpRequestConfig, axiosPlusRequstConfig };
  }

  /**
   * 前置配置检查
   * @param config AxiosPlusRequestConfig
   */
  protected preCheckConfig(config: AxiosPlusRequestConfig): void {
    // throttle和debounce不能同时存在，以及一些边界值测试
    JoiUtils.validate(axiosPlusRequestConfigSchema, config);
  }

  /**
   * 设置状态
   * @param target 被装饰的类或类原型
   * @param config http请求配置,HttpMethodDecoratorConfig的包装配置
   * @param propertyKey 被装饰的方法名
   */
  protected setupState(target: DecoratedClassOrProto, propertyKey: string | symbol, config: HttpRequestConfig): void {
    // 设置配置
    this.decoratorInfo.setConfig(config);
    // 注册装饰器信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo, propertyKey);
    // 为类添加配置索引方便合并
    this.classStateManager.setHttpConfigIdx(target, config);
  }

  /**
   * 实现配置
   * @param config http请求配置,HttpMethodDecoratorConfig的包装配置
   */
  protected applyConfig(config: HttpRequestConfig): void {
    // 获取原始配置
    const { throttle, debounce, retry } = config.getOriginalConfig();
    // 实现这些功能
  }

  /**
   * 后处理配置
   * @param target 被装饰的类或类原型
   * @param config http请求配置,HttpMethodDecoratorConfig的包装配置
   * @description 主要实现请求时路径参数的填充
   */
  protected postHandleConfig(target: DecoratedClassOrProto, propertyKey: string | symbol, args: any[]) {
    // 获取配置
    let httpRequestConfig = this.decoratorInfo.configs[0] as HttpRequestConfig;
    // 获取运行时路径参数和查询参数
    const [pathParams, queryParams] = this.paramStateManager.getRuntimeParams(target, propertyKey, args, [
      DECORATORNAME.PATHPARAM,
      DECORATORNAME.QUERYPARAM,
    ]);
    // 获取配置url
    let { url = '' } = httpRequestConfig;
    // 解析路径参数
    let resolvedUrl = new PathUtils(url).resolvePathParams(pathParams).removeExtraSpace().removeExtraSlash().toResult();
    // 设置查询参数
    httpRequestConfig.setParams(queryParams);
    // 设置基本路径
    httpRequestConfig.setUrl(resolvedUrl);
    // 获取axiosPlus配置,后续会进行检查
    const axiosPlusRequestConfig = this.configHandler.partialConfig(httpRequestConfig.getOriginalConfig(), [
      'refAxios',
      'url',
      'baseURL',
    ]);
    // 获取axios
    const { refAxios = axios } = httpRequestConfig;
    console.log(refAxios.defaults.baseURL);

    // 以axios的默认路径为baseURL
    if (refAxios.defaults.baseURL) {
      httpRequestConfig.setBaseURL(refAxios.defaults.baseURL);
    }
    // 树摇配置
    const axiosRequestConfig = this.configHandler.treeShakingConfig(httpRequestConfig.getOriginalConfig(), [
      'refAxios',
      'retry',
      'debounce',
      'throttle',
    ]);

    // 返回配置
    return { axiosPlusRequestConfig, axiosRequestConfig, refAxios };
  }

  /**
   * 配置后置检查
   * @param target
   * @param config
   */
  protected postCheckConfig(config: AxiosPlusRequestConfig): void {
    // 检查url是否合法以及是否存在refAxios,是否存在baseURL。若即不存在refAxios又不存在baseURL则报错
    const { refAxios, baseURL } = config;
    if (!refAxios && !baseURL) {
      throw new Error(
        'The refAxios which is the instance of axios with baseURL or baseURL is required in the decorator config.',
      );
    }
  }

  /**
   * 创建Get装饰器
   * @param config
   * @returns
   */
  public createDecorator(config?: HttpMethodDecoratorConfig | string): MethodDecorator {
    return (target: DecoratedClassOrProto, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      // 初始化装饰器信息
      this.initDecoratorInfo(target, propertyKey);
      // 校验装饰器
      this.validateDecorator(target, propertyKey);
      // 前置处理配置
      const { httpRequestConfig, axiosPlusRequstConfig } = this.preHandleConfig(config, target, propertyKey);
      // 前置配置检查
      this.preCheckConfig(axiosPlusRequstConfig);
      // 设置状态
      this.setupState(target, propertyKey, httpRequestConfig);
      // 实现配置
      this.applyConfig(httpRequestConfig);
      // 方法替换实际调用的时候会调用descripter.value指向的方法
      descriptor.value = new Proxy(descriptor.value, {
        /**
         *
         * @param invoke 原方法
         * @param _this 调用代理方法时的this
         * @param args 调用代理方法传入的参数
         */
        apply: (invoke, _this, args) => {
          // 后处理配置
          const { axiosPlusRequestConfig, axiosRequestConfig, refAxios } = this.postHandleConfig(
            target,
            propertyKey,
            args,
          );
          // 后置配置检查
          this.postCheckConfig(axiosPlusRequestConfig);
          console.log(axiosRequestConfig);

          // 发送请求
          return refAxios(axiosRequestConfig);
        },
      });
      return descriptor;
    };
  }
}
