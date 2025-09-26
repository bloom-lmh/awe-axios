import { AxiosInstance } from 'axios';
import { HttpMtdSubDecoratorFactory } from './HttpMtdSubDecoratorFactory.ts';
import { DecoratedClassOrProto } from '../decorator';
import { DECORATORNAME } from '@/core/constant/DecoratorConstants.ts';
import { HttpRequestConfig } from './types/HttpRequestConfig.ts';
import { MockConfig } from './types/httpMethod';
import { HttpSubDecoratorConfigHandler } from '@/core/handler/httpMethod/HttpSubDecoratorConfigHandler.ts';

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
    // 如果存在直接在信息上进行设置
    if (httpMethodDecoratorInfo) {
      const httpMethodConfig = httpMethodDecoratorInfo.configs[0] as HttpRequestConfig;
      // 若没有mock信息则设置
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
