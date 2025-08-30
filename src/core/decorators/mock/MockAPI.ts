import { SetupServer, setupServer } from 'msw/node';
import { MockConfig } from '../httpMethod/types/httpMethod';
import { RequestHandler, WebSocketHandler } from 'msw';

/**
 * mock默认全局配置
 */
const defaultConfig: MockConfig = {
  condition: () => {
    return process.env.NODE_ENV === 'test';
  },
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
  private config: MockConfig = defaultConfig;
  /**
   * 获取mock默认配置
   */
  get defaultConfig() {
    return this.config;
  }
  /**
   * 构造器
   */
  constructor() {
    this.server = setupServer();
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
}

/**
 * mockAPI接口
 */
export const MockAPI = new MockApi();
