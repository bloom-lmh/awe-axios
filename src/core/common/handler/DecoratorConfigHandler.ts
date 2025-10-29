import { ObjectUtils } from '@/utils/ObjectUtils';

/**
 * 装饰器配置处理器
 */
export class DecoratorConfigHandler {
  /**
   * 要处理的配置项
   */
  protected config: any;

  /**
   * 构造器
   */
  constructor(config: any = {}) {
    this.config = ObjectUtils.deepClone(config);
  }
  /**
   * 实现链式编程
   * @param config 配置
   * @param clone 是否要克隆一份配置，不再原配置项上进行修改
   */
  static chain(config: any) {
    return new this(config);
  }

  /**
   * 若已经有对象则可通过该方法设置配置项
   */
  setConfig<T>(config: T, clone: boolean = true) {
    this.config = clone ? ObjectUtils.deepClone(config) : config;
    return this;
  }

  /**
   * 获取结果
   */
  result() {
    return this.config;
  }
  /**
   * 树摇配置
   * @description 去除无用配置
   */
  treeShakingConfig<T extends object, K extends keyof T>(keys: K[]) {
    for (const key of keys) {
      const desc = Object.getOwnPropertyDescriptor(this.config, key);
      if (desc?.configurable) {
        // 显式检查可配置性
        Reflect.deleteProperty(this.config, key);
      }
    }
    return this;
  }
  /**
   * 保留指定配置
   * @param config 配置对象
   * @param keys  要保留的属性
   * @returns 保留对应属性的配置对象
   */
  partialConfig<T extends object, K extends keyof T>(keys: K[]) {
    let partialConfig: Pick<T, K> = {} as Pick<T, K>;
    for (const key of keys) {
      if (this.config.hasOwnProperty(key)) {
        partialConfig[key] = this.config[key];
      }
    }
    return this;
  }
  /**
   * 树摇配置
   * @description 去除无用配置
   */
  static treeShakingConfig<T extends object, K extends keyof T>(config: T, keys: K[]): Omit<T, K> {
    // 深拷贝config
    let cloneConfig = ObjectUtils.deepClone(config);
    for (const key of keys) {
      const desc = Object.getOwnPropertyDescriptor(cloneConfig, key);
      if (desc?.configurable) {
        // 显式检查可配置性
        Reflect.deleteProperty(cloneConfig, key);
      }
    }
    return cloneConfig;
  }
  /**
   * 保留指定配置
   * @param config 配置对象
   * @param keys  要保留的属性
   * @returns 保留对应属性的配置对象
   */
  static partialConfig<T extends object, K extends keyof T>(config: T, keys: K[]): Pick<T, K> {
    let partialConfig: Pick<T, K> = {} as Pick<T, K>;
    for (const key of keys) {
      if (config.hasOwnProperty(key)) {
        partialConfig[key] = config[key];
      }
    }
    return partialConfig;
  }
}
