import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { DecoratedClassOrProto, MethodDecorator } from '../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { MethodDecoratorFactory } from '../MethodDecoratorFactory';
import { MethodDecoratorValidator } from '@/core/validator/MethodDecoratorValidator';
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
import { baseRequest } from '@/core/requestexcutor/BaseRequest';
import { withRetry } from '@/core/requestexcutor/Retry';
import { withThrottle } from '@/core/requestexcutor/Throttle';
import { withDebounce } from '@/core/requestexcutor/Debounce';
import { MockAPI } from '../mock/MockAPI';
import { http } from 'msw';
import { withMock } from '@/core/requestexcutor/Mock';

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
   * 前置配置检查
   * @param config AxiosPlusRequestConfig
   */
  protected preCheckConfig(config: HttpMethodDecoratorConfig | string | undefined): void {
    // 若是对象只检测AxiosPlus的配置
    if (typeof config === 'object') {
      config = this.configHandler.partialConfig(config, ['throttle', 'debounce', 'retry']);
      // throttle和debounce不能同时存在，以及一些边界值测试
      JoiUtils.validate(axiosPlusRequestConfigSchema, config);
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
  ) {
    // 标准化配置
    if (typeof config === 'string') {
      config = { url: config };
    }
    config.method = 'get';

    // 获取子项配置
    const subItemsConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
    // 合并子项配置
    let httpRequestConfig = subItemsConfig
      ? this.configHandler.mergeSubItemsConfig(config, subItemsConfig)
      : new HttpRequestConfig(config);

    const { refAxios = axios } = httpRequestConfig;
    // 以axios的默认路径为baseURL
    if (refAxios.defaults.baseURL) {
      httpRequestConfig.setBaseURL(refAxios.defaults.baseURL);
    }
    this.decoratorConfig = httpRequestConfig;
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
  protected applyConfig(): (config: HttpRequestConfig) => Promise<any> {
    // 实现mock
    this.applyMock();
    // 实现防抖、节流和重传
    const { throttle, debounce, retry, mock } = this.decoratorConfig;
    // 实现这些功能
    let requestFn = baseRequest();
    if (retry) {
      requestFn = withRetry(requestFn, retry);
    }
    if (throttle) {
      requestFn = withThrottle(requestFn, throttle);
    }
    if (debounce) {
      requestFn = withDebounce(requestFn, debounce);
    }
    if (mock) {
      requestFn = withMock(requestFn, mock);
    }
    return requestFn;
  }

  /**
   * 应用mock
   */
  protected applyMock() {
    const { mock } = this.decoratorConfig;
    let absUrl = '';
    // 注册handlers
    if (mock && mock.handlers) {
      // 获取路径
      const { baseURL, url, allowAbsoluteUrls } = this.decoratorConfig;
      // 获取装饰器唯一id
      const decoratorId = this.decoratorInfo.id;
      // 若允许url为绝对路径且url为绝对路径则采用url为绝对路径
      if (url && allowAbsoluteUrls && PathUtils.isAbsoluteHttpUrl(url)) {
        absUrl = url;
      } else {
        absUrl = baseURL + '/' + url;
        absUrl = PathUtils.chain(absUrl).removeExtraSpace().removeExtraSlash().toResult();
      }
      // 是方法直接注册为默认
      if (typeof mock.handlers === 'function') {
        MockAPI.registerHandlers(http.get(absUrl + 'default' + '/' + decoratorId, () => {}));
      }
      if (typeof mock.handlers === 'object') {
        // 遍历所有的属性作为键
        for (let key in mock.handlers) {
          MockAPI.registerHandlers(http.get(absUrl + key + '/' + decoratorId, mock.handlers[key]));
        }
      }
    }
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
  }

  /**
   * 配置后置检查
   * @param target
   * @param config
   */
  protected postCheckConfig(): void {
    // 检查url是否合法以及是否存在refAxios,是否存在baseURL。若即不存在refAxios又不存在baseURL则报错
    const { refAxios, baseURL } = this.decoratorConfig;
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
      // 前置配置检查
      this.preCheckConfig(config);
      // 前置处理配置
      this.preHandleConfig(config, target, propertyKey);
      // 设置状态
      this.setupState(target, propertyKey);
      // 实现配置
      const request = this.applyConfig();
      // 获取mock配置
      const { mock } = this.decoratorConfig;
      // 方法替换实际调用的时候会调用descripter.value指向的方法
      descriptor.value = new Proxy(descriptor.value, {
        /**
         * 原方法
         * @param invoke 原方法
         * @param _this 调用代理方法时的this
         * @param args 调用代理方法传入的参数
         */
        apply: async (invoke, _this, args) => {
          // 后处理配置
          this.postHandleConfig(target, propertyKey, args);
          // 后置配置检查
          this.postCheckConfig();

          /*   // 若开启了mock
          if (mock) {
            return {
              mock: (type = 'default') => {
                return request(this.decoratorConfig);
              },
            };
          } */
          // 发送请求
          return request(this.decoratorConfig);
        },
      });
      return descriptor;
    };
  }
}
