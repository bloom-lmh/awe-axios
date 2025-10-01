import { METADATAKEY } from '../common/constant';
import { PropertyDecoratorStateManager } from '../common/statemanager';
import { DecoratedClassProto } from '../decorator';
import { InjectBackups } from './types/ioc';

/**
 * Inject装饰器状态管理器
 */
export class InjectDecoratorStateManager extends PropertyDecoratorStateManager {
  /**
   * 初始化属性备选列表元数据
   */
  initInjectBackups(target: DecoratedClassProto, propertyKey: string | symbol) {
    if (!this.hasInjectBackups(target, propertyKey)) {
      Reflect.defineMetadata(METADATAKEY.BACKUPS, [], target, propertyKey);
    }
  }
  /**
   * 是否有备选列表元数据
   */
  hasInjectBackups(target: DecoratedClassProto, propertyKey: string | symbol) {
    return Reflect.hasMetadata(METADATAKEY.BACKUPS, target, propertyKey);
  }
  /**
   * 获取备选列表元数据
   */
  getInjectBackups(target: DecoratedClassProto, propertyKey: string | symbol) {
    return Reflect.getMetadata(METADATAKEY.BACKUPS, target, propertyKey);
  }
  /**
   * 设置备选列表元数据
   */
  setInjectBackups(target: DecoratedClassProto, propertyKey: string | symbol, backups: InjectBackups) {
    // 获取备选列表数组
    let injectBackups = this.getInjectBackups(target, propertyKey);
    if (Array.isArray(backups)) {
      injectBackups = [...injectBackups, ...backups];
    } else {
      injectBackups.push(backups);
    }
    Reflect.defineMetadata(METADATAKEY.BACKUPS, injectBackups, target, propertyKey);
  }
}
