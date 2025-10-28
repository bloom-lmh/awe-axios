import { PathUtils } from '@/utils/PathUtils';
import axios from 'axios';
import { SYSTEM, DECORATORNAME } from '../common/constant';
import {
  MethodDecoratorStateManager,
  ClassDecoratorStateManager,
  ParamDecoratorStateManager,
} from '../common/statemanager';
import { MethodDecoratorValidator } from '../common/validator';
import { DecoratedClassOrProto } from '../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { Inject } from '../ioc';
import { ProxyFactory } from '../ioc/ProxyFactory';
import { MethodDecoratorFactory } from '../MethodDecoratorFactory';
import { MockAPI } from '../mock/MockAPI';
import { HttpMtdDecoratorConfigHandler } from './handler/HttpMtdDecoratorConfigHandler';
import { useDebounce } from './requeststrategy/Debounce';
import { useMock } from './requeststrategy/Mock';
import { useRequest } from './requeststrategy/Request';
import { useRetry } from './requeststrategy/Retry';
import { useThrottle } from './requeststrategy/Throttle';
import { RetryOptions, ThrottleOptions, DebounceOptions } from './types/httpMethod';
import { HttpMethodDecoratorConfig } from './types/HttpMethodDecoratorConfig';
import { HttpRequestConfig } from './types/HttpRequestConfig';

/**
 * Get装饰器工厂
 */
export class GetDecoratorFactory extends MethodDecoratorFactory {
  /**
   * 装饰器信息
   */
  protected decoratorInfo!: DecoratorInfo;

  /**
   * 装饰器配置
   */
  protected decoratorConfig!: HttpRequestConfig;

  /**
   * 方法装饰器校验器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: MethodDecoratorValidator,
  })
  protected decoratorValidator!: MethodDecoratorValidator;

  /**
   * 配置处理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: HttpMtdDecoratorConfigHandler,
  })
  protected configHandler!: HttpMtdDecoratorConfigHandler;

  /**
   * 状态管理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: MethodDecoratorStateManager,
  })
  protected stateManager!: MethodDecoratorStateManager;

  /**
   * 类状态管理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: ClassDecoratorStateManager,
  })
  protected classStateManager!: ClassDecoratorStateManager;

  /**
   * 参数状态管理器
   */
  @Inject({
    module: SYSTEM.LIB,
    ctor: ParamDecoratorStateManager,
  })
  protected paramStateManager!: ParamDecoratorStateManager;

  /**
   * 初始化装饰器信息
   * @param target 被装饰的方法所属类获取原型
   * @param propertyKey 被装饰的方法名
   */
  protected initDecoratorInfo(): void {
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
      throw new Error('The @Get decorator confilct with other decorators in the class.');
    }
  }

  /**
   * 前置配置检查
   * @param config AxiosPlusRequestConfig
   */
  protected preCheckConfig(config: HttpMethodDecoratorConfig | string | undefined): void {
    // 若是对象只检测AxiosPlus的配置
    if (typeof config === 'object') {
      //config = this.configHandler.partialConfig(config, ['throttle', 'debounce', 'retry']);
      // throttle和debounce不能同时存在，以及一些边界值测试
      // JoiUtils.validate(axiosPlusRequestConfigSchema, config);
    }
  }

  /**
   * 前置处理配置
   * @description 主要将AxiosPlus配置标准化以及合并子项配置
   */
  protected preHandleConfig(
    config: HttpMethodDecoratorConfig | string = '',
    target: DecoratedClassOrProto,
    propertyKey: string | symbol,
  ) {
    // 预处理配置项
    config = this.configHandler
      .setConfig(config)
      .preHandleConfig()
      .preHandleRetryConfig()
      .preHandleDebounceConfig()
      .preHandleThrottleConfig()
      .preHandleMockConfig()
      .result() as HttpMethodDecoratorConfig;

    // 合并子配置项
    const subItemsConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
    this.decoratorConfig = this.configHandler.mergeSubItemsConfig(config, subItemsConfig);
  }

  /**
   * 设置状态
   * @param target 被装饰的类或类原型
   * @param config http请求配置,HttpMethodDecoratorConfig的包装配置
   * @param propertyKey 被装饰的方法名
   */
  protected setupState(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    // 设置配置
    this.decoratorInfo.setConfig(this.decoratorConfig);
    // 注册装饰器信息
    this.stateManager.setDecoratorInfo(target, this.decoratorInfo, propertyKey);
    // 为类添加配置索引方便合并
    this.classStateManager.setHttpConfigIdx(target, this.decoratorConfig);
  }

  /**
   * 实现配置
   * @param config http请求配置,HttpMethodDecoratorConfig的包装配置
   */
  protected applyConfig(): (config: HttpMethodDecoratorConfig) => Promise<any> {
    // 实现防抖、节流和重传
    const { throttle, debounce, retry, mock } = this.decoratorConfig;
    // 基础请求
    let requestFn = useRequest();
    // 伴随请求重发
    if (retry) {
      console.log('retry');
      requestFn = useRetry(requestFn, retry as RetryOptions);
    }
    // 伴随节流
    if (throttle) {
      console.log('throttle');
      requestFn = useThrottle(requestFn, throttle as ThrottleOptions);
    }
    // 伴随防抖
    if (debounce) {
      console.log('debounce');
      requestFn = useDebounce(requestFn, debounce as DebounceOptions);
    }
    // mock请求
    if (mock) {
      console.log('mock');
      requestFn = useMock(requestFn, this.decoratorInfo.id);
    }
    return requestFn;
  }

  /**
   * 后处理配置
   * @param target 被装饰的类或类原型
   * @param config http请求配置,HttpMethodDecoratorConfig的包装配置
   * @description 主要实现请求时路径参数的填充
   */
  protected postHandleConfig(target: DecoratedClassOrProto, propertyKey: string | symbol, args: any[]) {
    // 获取配置
    let httpRequestConfig = this.decoratorConfig;
    // 获取运行时路径参数和查询参数
    const [pathParams, queryParams] = this.paramStateManager.getRuntimeParams(target, propertyKey, args, [
      DECORATORNAME.PATHPARAM,
      DECORATORNAME.QUERYPARAM,
    ]);
    // 解析路径参数
    let resolvedUrl = new PathUtils(httpRequestConfig.url)
      .resolvePathParams(pathParams)
      .removeExtraSpace()
      .removeExtraSlash()
      .toResult();

    // 设置查询参数
    httpRequestConfig.setParams(queryParams);
    // 设置基本路径
    httpRequestConfig.setUrl(resolvedUrl);
    // 设置baseURL
    let { refAxios = axios, mock } = httpRequestConfig;
    // 以axios的默认路径为baseURL
    if (refAxios.defaults.baseURL) {
      httpRequestConfig.setBaseURL(refAxios.defaults.baseURL);
    }
    // 若mock存在与全局配置合并
    if (mock) {
      mock = { ...MockAPI.globalConfig, ...mock };
      httpRequestConfig.setMock(mock);
    }
  }

  /**
   * 配置后置检查
   * @param target
   * @param config
   */
  protected postCheckConfig(): void {
    // 检查url是否合法以及是否存在refAxios,是否存在baseURL。若即不存在refAxios又不存在baseURL则报错
    const { baseURL } = this.decoratorConfig;
    if (!baseURL) {
      throw new Error(
        'The refAxios which is the instance of axios use baseURL or baseURL is required in the decorator config.',
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
      this.initDecoratorInfo();
      // 校验装饰器
      this.validateDecorator(target, propertyKey);
      // 前置配置检查
      this.preCheckConfig(config);
      // 前置处理配置
      this.preHandleConfig(config, target, propertyKey);
      // 设置状态
      this.setupState(target, propertyKey);
      // 实现配置
      const request = this.applyConfig();
      // 记录原方法
      const invoke = descriptor.value;

      // 方法替换实际调用的时候会调用descripter.value指向的方法
      descriptor.value = new Proxy(invoke, {
        /**
         * 原方法
         * @param invoke 原方法
         * @param _this 调用代理方法时的this
         * @param args 调用代理方法传入的参数
         */
        apply: (invoke, _this, args) => {
          // 后处理配置
          this.postHandleConfig(target, propertyKey, args);
          // 后置配置检查
          this.postCheckConfig();

          // 发送请求
          return request(this.decoratorConfig.getOriginalConfig());
        },
      });
      ProxyFactory.registerInvoke(descriptor.value, invoke);
      return descriptor;
    };
  }
}
