import { ObjectUtils } from '@/utils/ObjectUtils';

/**
 * 装饰器配置处理器
 */
export class DecoratorConfigHandler {
  /**
   * 树摇配置
   * @description 去除无用配置
   */
  treeShakingConfig<T extends object, K extends keyof T>(config: T, keys: K[]): Omit<T, K> {
    return DecoratorConfigHandler.treeShakingConfig(config, keys);
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
  partialConfig<T extends object, K extends keyof T>(config: T, keys: K[]): Pick<T, K> {
    let partialConfig: Pick<T, K> = {} as Pick<T, K>;
    for (const key of keys) {
      if (config.hasOwnProperty(key)) {
        partialConfig[key] = config[key];
      }
    }
    return partialConfig;
  }

  /**
   * 合并与子项配置
   */
  mergeSubItemsConfig(decoratorConfig: any, subItemsConfig: any): any {
    throw new Error('method not implemented.');
  }
}
