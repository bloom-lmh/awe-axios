import { AxiosInstance, AxiosRequestTransformer, AxiosResponseTransformer } from 'axios';
import { DECORATORNAME } from '../common/constant';
import { DecoratedClassOrProto } from '../../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { HttpSubDecoratorConfigHandler } from './handler/HttpSubDecoratorConfigHandler';
import { HttpMtdSubDecoratorFactory } from './HttpMtdSubDecoratorFactory.ts';
import { MockConfig, RetryOptions, ThrottleOptions } from '../../httpMethod';
import { HttpRequestConfig } from './types/HttpRequestConfig';

/**
 * AxiosRef装饰工厂
 */
export class AxiosRefDecoratorFactory extends HttpMtdSubDecoratorFactory<AxiosInstance> {
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
}

/**
 * mock装饰器工厂
 */
export class MockDecoratorFactory extends HttpMtdSubDecoratorFactory<MockConfig> {
  protected handleConfig(target: DecoratedClassOrProto, config: MockConfig, propertyKey: string | symbol): void {
    // 尝试获取HttpApi类型的装饰器信息
    const httpMethodDecoratorInfo = this.stateManager.getHttpMethodDecoratorInfo(target, propertyKey);
    if (httpMethodDecoratorInfo) {
      const httpMethodConfig = httpMethodDecoratorInfo.configs[0] as HttpRequestConfig;
      if (httpMethodConfig) {
        // 没有mock信息则设置
        let mock = HttpSubDecoratorConfigHandler.mergeMockConfig(httpMethodConfig.mock as MockConfig, config);
        httpMethodConfig.setMock(mock);
      }
    } else {
      // 如没有HttpApi装饰器的信息,表示子装饰器信息出现在父装饰器信息之前，则在子装饰器配置项中进行设置
      const subDecoratorConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
      subDecoratorConfig && (subDecoratorConfig['mock'] = config);
    }
  }
}

/**
 * transformRequest装饰器工厂
 */
export class TransformRequestDecoratorFactory extends HttpMtdSubDecoratorFactory<
  AxiosRequestTransformer | AxiosRequestTransformer[]
> {
  // 允许多个装饰器
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void {}
  protected handleConfig(
    target: DecoratedClassOrProto,
    config: AxiosRequestTransformer[],
    propertyKey: string | symbol,
  ): void {
    // 尝试获取HttpApi类型的装饰器信息
    const httpMethodDecoratorInfo = this.stateManager.getHttpMethodDecoratorInfo(target, propertyKey);
    // 如果存在直接在信息上进行设置
    if (httpMethodDecoratorInfo) {
      const httpMethodConfig = httpMethodDecoratorInfo.configs[0] as HttpRequestConfig;
      if (httpMethodConfig) {
        let transformRequest = HttpSubDecoratorConfigHandler.mergeTransformRequest(
          config,
          httpMethodConfig.transformRequest,
        );
        if (transformRequest) {
          httpMethodConfig.setTransformRequest(transformRequest);
        }
      }
    } else {
      // 如没有HttpApi装饰器的信息,表示子装饰器信息出现在父装饰器信息之前，则在子装饰器配置项中进行设置
      const subDecoratorConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
      if (subDecoratorConfig) {
        if (!subDecoratorConfig['transformRequest']) {
          subDecoratorConfig['transformRequest'] = config;
        } else {
          subDecoratorConfig['transformRequest'] = [...config, ...subDecoratorConfig['transformRequest']];
        }
      }
    }
  }
}

/**
 * transformResponse装饰器工厂
 */
export class TransformResponseDecoratorFactory extends HttpMtdSubDecoratorFactory<
  AxiosResponseTransformer | AxiosResponseTransformer[]
> {
  // 允许多个装饰器
  protected validateDecorator(target: DecoratedClassOrProto, propertyKey: string | symbol): void {}
  protected handleConfig(
    target: DecoratedClassOrProto,
    config: AxiosResponseTransformer[],
    propertyKey: string | symbol,
  ) {
    // 尝试获取HttpApi类型的装饰器信息
    const httpMethodDecoratorInfo = this.stateManager.getHttpMethodDecoratorInfo(target, propertyKey);
    // 如果存在直接在信息上进行设置
    if (httpMethodDecoratorInfo) {
      const httpMethodConfig = httpMethodDecoratorInfo.configs[0] as HttpRequestConfig;
      if (httpMethodConfig) {
        let transformResponse = HttpSubDecoratorConfigHandler.mergeTransformResponse(
          httpMethodConfig.transformResponse,
          config,
        );
        if (transformResponse) {
          httpMethodConfig.setTransformResponse(transformResponse);
        }
      }
    } else {
      // 如没有HttpApi装饰器的信息,表示子装饰器信息出现在父装饰器信息之前，则在子装饰器配置项中进行设置
      const subDecoratorConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
      if (subDecoratorConfig) {
        if (!subDecoratorConfig['transformResponse']) {
          subDecoratorConfig['transformResponse'] = config;
        } else {
          subDecoratorConfig['transformResponse'] = [...subDecoratorConfig['transformResponse'], ...config];
        }
      }
    }
  }
}

/**
 * Retry装饰工厂
 */
/* export class RetryDecoratorFactory extends HttpMtdSubDecoratorFactory<RetryOptions> {
  protected handleConfig(target: DecoratedClassOrProto, config: RetryOptions, propertyKey: string | symbol): void {
    // 尝试获取HttpApi类型的装饰器信息
    const httpMethodDecoratorInfo = this.stateManager.getHttpMethodDecoratorInfo(target, propertyKey);
    // 如果存在直接在信息上进行设置
    if (httpMethodDecoratorInfo) {
      const httpMethodConfig = httpMethodDecoratorInfo.configs[0] as HttpRequestConfig;
      if (httpMethodConfig) {
        let retry = HttpSubDecoratorConfigHandler.mergeRetryConfig(httpMethodConfig.retry as RetryOptions, config);
        httpMethodConfig.setRetry(retry);
      }
    } else {
      // 如没有HttpApi装饰器的信息,表示子装饰器信息出现在父装饰器信息之前，则在子装饰器配置项中进行设置
      const subDecoratorConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
      subDecoratorConfig && (subDecoratorConfig['retry'] = config);
    }
  }
} */

/**
 * Throttle装饰工厂
 */
/* export class ThrottleDecoratorFactory extends HttpMtdSubDecoratorFactory<ThrottleOptions> {

  protected initDecoratorInfo(decoratorName: string | symbol): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(decoratorName)
      .setConflictList([decoratorName, DECORATORNAME.DEBOUNCE]);
  }

  // 允许多个装饰器
  protected handleConfig(target: DecoratedClassOrProto, config: RetryOptions, propertyKey: string | symbol): void {
    // 尝试获取HttpApi类型的装饰器信息
    const httpMethodDecoratorInfo = this.stateManager.getHttpMethodDecoratorInfo(target, propertyKey);
    // 如果存在直接在信息上进行设置
    if (httpMethodDecoratorInfo) {
      const httpMethodConfig = httpMethodDecoratorInfo.configs[0] as HttpRequestConfig;
      // 若没有mock信息则设置
      if (httpMethodConfig) {
        // 没有mock信息则设置
        let throttle = HttpSubDecoratorConfigHandler.mergeRetryConfig(
          httpMethodConfig.throttle as ThrottleOptions,
          config,
        );
        httpMethodConfig.setThrottle(throttle);
      }
    } else {
      // 如没有HttpApi装饰器的信息,表示子装饰器信息出现在父装饰器信息之前，则在子装饰器配置项中进行设置
      const subDecoratorConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
      subDecoratorConfig && (subDecoratorConfig['throttle'] = config);
    }
  }
} */

/**
 * Debounce装饰工厂
 */
/* export class DebounceDecoratorFactory extends HttpMtdSubDecoratorFactory<ThrottleOptions> {
  protected initDecoratorInfo(decoratorName: string | symbol): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(decoratorName)
      .setConflictList([decoratorName, DECORATORNAME.THROTTLE]);
  }

  // 允许多个装饰器
  protected handleConfig(target: DecoratedClassOrProto, config: RetryOptions, propertyKey: string | symbol): void {
    // 尝试获取HttpApi类型的装饰器信息
    const httpMethodDecoratorInfo = this.stateManager.getHttpMethodDecoratorInfo(target, propertyKey);
    // 如果存在直接在信息上进行设置
    if (httpMethodDecoratorInfo) {
      const httpMethodConfig = httpMethodDecoratorInfo.configs[0] as HttpRequestConfig;
      // 若没有mock信息则设置
      if (httpMethodConfig) {
        // 没有mock信息则设置
        let debounce = HttpSubDecoratorConfigHandler.mergeRetryConfig(
          httpMethodConfig.debounce as ThrottleOptions,
          config,
        );
        httpMethodConfig.setDebounce(debounce);
      }
    } else {
      // 如没有HttpApi装饰器的信息,表示子装饰器信息出现在父装饰器信息之前，则在子装饰器配置项中进行设置
      const subDecoratorConfig = this.stateManager.getSubDecoratorConfig(target, DECORATORNAME.HTTPMETHOD, propertyKey);
      subDecoratorConfig && (subDecoratorConfig['debounce'] = config);
    }
  }
}
 */
