import { SetupServer, setupServer } from 'msw/node';
import { MockConfig, MockHandlers, MockMethod } from '../httpMethod/types/httpMethod';
import { http, HttpResponse, RequestHandler, WebSocketHandler } from 'msw';

/**
 * mock默认全局配置
 */
const defaultConfig: MockConfig = {
  on: true,
};

/**
 * mock接口
 */
class MockApi {
  /**
   * msw server
   */
  private server: SetupServer;

  /**
   * 默认配置
   */
  private config: MockConfig;

  /**
   * 是否真实关闭
   */
  private isRealOff: boolean = false;

  /**
   * 默认配置
   */
  get defaultConfig() {
    return defaultConfig;
  }

  /**
   * 是否真实关闭
   */
  get realOff() {
    return this.isRealOff;
  }

  /**
   * 获取mock默认配置
   */
  get globalConfig() {
    return this.config;
  }

  /**
   * 构造器
   */
  constructor() {
    this.server = setupServer();
    this.config = {
      on: true,
      condition: () => {
        return process.env.NODE_ENV === 'test';
      },
    };
  }

  /**
   * 开启mock监听服务
   */
  on() {
    this.config.on = true;
    this.server.listen();
  }

  /**
   * 关闭mock监听服务
   * @param [isReal=true] 是否真实关闭,若真实关闭后，所有接口
   */
  off(isReal: boolean = false) {
    this.config.on = false;
    if (isReal) {
      this.isRealOff = true;
      this.server.close();
    }
  }

  /**
   * 设置走mock的条件
   */
  setCondition(condition: () => boolean) {
    this.config.condition = condition;
  }

  /**
   * 注册handlers
   */
  registerHandlers(...handlers: Array<RequestHandler | WebSocketHandler>) {
    this.server.use(...handlers);
    return this;
  }

  /**
   * 重置handlers
   */
  resetHandlers() {
    this.server.resetHandlers();
  }

  /**
   * 列出所有handler
   */
  listHandlers() {
    return this.server.listHandlers();
  }

  /**
   * 是否有url对应的handler
   * @param url 请求路径
   * @param mtd 请求方法
   * @returns
   */
  hasHandler(url: string, mtd: MockMethod) {
    return this.server.listHandlers().some(handler => {
      const { path, method } = (handler as RequestHandler).info as any;
      return path === url && method === mtd.toLowerCase();
    });
  }
}

/**
 * mockAPI接口
 */
const MockAPI = new MockApi();

export { MockAPI };
