import { DecorationInfo } from '../decorators/decorator';

/**
 * 装饰器列表元数据
 */
export type DecoratorInfos = DecorationInfo[];

/**
 * 注入时的备选项元数据
 * @description 当用户使用Inject 装饰器注入值的时候，如果注入失败会从属性元数据中查找备选项
 */
export interface InjectBackupOptions {
  /**
   * 候选备选项列表
   */
  backup: DecoratedClass | Object | (DecoratedClass | Object)[];
}
