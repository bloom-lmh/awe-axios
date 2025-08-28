import { METADATAKEY } from '../constant/MetaDataConstants';
import { DecoratedClass, DecoratedClassOrProto, DecoratorType, SubDecorationConfigs } from '../decorators/decorator';
import { DecoratorInfo } from '../decorators/DecoratorInfo';
import { DecoratorStateManager } from './DecoratorStateManager';

/**
 * 属性元数据管理器
 */
export class PropertyDecoratorStateManager implements DecoratorStateManager {
  /**
   * 单例模式
   */
  private static instance: PropertyDecoratorStateManager;

  /**
   * 获取实例
   */
  static getInstance(): PropertyDecoratorStateManager {
    return this.instance ? this.instance : new PropertyDecoratorStateManager();
  }

  /**
   * 初始化属性装饰器信息列表
   */
  initDecoratorInfos(target: DecoratedClassOrProto, propertyKey: string | symbol): void {
    if (!Reflect.hasMetadata(METADATAKEY.DECORATORINFOS, target, propertyKey)) {
      Reflect.defineMetadata(METADATAKEY.DECORATORINFOS, [], target, propertyKey);
    }
  }

  /**
   * 属性上设置子装饰器配置
   * @param target 被装饰的类或类原型
   * @param decoratorName  所属装饰器名字
   * @param propertyKey 被装饰的属性名
   * @param config 子装饰器配置
   */
  initSubDecoratorConfig(
    target: DecoratedClassOrProto,
    decoratorName: string | symbol,
    propertyKey: string | symbol,
  ): void {
    // 尝试获取子装饰器配置
    let subDecoratorConfigs = this.getAllSubDecoratorConfig(target, propertyKey);
    // 若没有子装饰器配置信息则初始化
    if (!subDecoratorConfigs) {
      subDecoratorConfigs = {};
      Reflect.defineMetadata(METADATAKEY.SUBDECORATORCONFIGS, subDecoratorConfigs, target, propertyKey);
    }
    // 若存在子装饰器配置信息但没有对应的装饰器项则设置
    if (!subDecoratorConfigs[decoratorName]) {
      subDecoratorConfigs[decoratorName] = {};
    }
  }

  /**
   * 获取属性装饰器信息列表
   * @param target 被装饰的类或类原型
   * @param propertyKey 被装饰的属性名
   */
  getDecoratorInfos(target: DecoratedClassOrProto, propertyKey: string | symbol): DecoratorInfo[] | undefined {
    return Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target, propertyKey);
  }

  /**
   * 获取属性装饰器信息
   * @param target 被装饰的类或类原型
   * @param decoratorName 装饰器名称
   * @param propertyKey 被装饰的属性名
   */
  getDecoratorInfo(
    target: DecoratedClassOrProto,
    decoratorName: string | symbol,
    propertyKey: string | symbol,
  ): DecoratorInfo | undefined {
    const decoratorInfos: DecoratorInfo[] = this.getDecoratorInfos(target, propertyKey) || [];
    return decoratorInfos.find(info => info.name === decoratorName);
  }

  /**
   * 根据类型获取装饰器信息
   * @param target 被装饰的类或类原型
   * @param propertyKey  被装饰的属性名
   * @param type 装饰器类型
   * @returns 装饰器信息列表
   */
  getDecoratorInfosByType(
    target: DecoratedClassOrProto,
    decoratorType: DecoratorType,
    propertyKey: string | symbol,
  ): DecoratorInfo[] | undefined {
    return this.getDecoratorInfos(target, propertyKey)?.filter(info => info.type === decoratorType);
  }

  /**
   * 获取子装饰器信息列表
   * @param target 被装饰的类或类原型
   * @param propertyKey 被装饰的属性名
   */
  getAllSubDecoratorConfig(
    target: DecoratedClassOrProto,
    propertyKey: string | symbol,
  ): SubDecorationConfigs | undefined {
    return Reflect.getMetadata(METADATAKEY.SUBDECORATORCONFIGS, target, propertyKey);
  }

  /**
   * 获取子装饰器配置
   * @param target 被装饰的类或类原型
   * @param decoratorName 子装饰器所属
   * @param propertyKey 被装饰的属性名
   */
  getSubDecoratorConfig(target: DecoratedClassOrProto, decoratorName: string | symbol, propertyKey: string | symbol) {
    const subDecoratorConfigs = this.getAllSubDecoratorConfig(target, propertyKey);
    if (subDecoratorConfigs) {
      return subDecoratorConfigs[decoratorName];
    }
  }

  /**
   * 属性上设置属性装饰器信息列表
   * @param target 被装饰的类或类原型
   * @param decoratorInfos 属性装饰器信息列表
   * @param propertyKey 被装饰的属性名
   */
  setDecoratorInfos(
    target: DecoratedClassOrProto,
    decoratorInfos: DecoratorInfo[],
    propertyKey: string | symbol,
  ): void {
    Reflect.defineMetadata(METADATAKEY.DECORATORINFOS, decoratorInfos, target, propertyKey);
  }

  /**
   * 属性上设置属性装饰器信息
   * @param target 被装饰的类或类原型
   * @param decoratorInfo 属性装饰器信息
   */
  setDecoratorInfo(target: DecoratedClassOrProto, decoratorInfo: DecoratorInfo, propertyKey: string | symbol): void {
    // 获取属性装饰器信息列表
    const decoratorInfos: DecoratorInfo[] | undefined = this.getDecoratorInfos(target, propertyKey);
    if (!decoratorInfos || decoratorInfos.length === 0) {
      this.setDecoratorInfos(target, [decoratorInfo], propertyKey);
      return;
    }
    // 如果存在装饰器信息则仅添加配置
    const existInfo = decoratorInfos.find(info => info.name === decoratorInfo.name);
    if (existInfo) {
      existInfo.configs = [...existInfo.configs, ...decoratorInfo.configs];
    } else {
      // 装饰器信息列表中添加装饰器信息
      decoratorInfos.push(decoratorInfo);
      // 设置属性装饰器信息列表
      this.setDecoratorInfos(target, decoratorInfos, propertyKey);
    }
  }

  /**
   * 属性上是否存在属性装饰器信息列表
   * @param target 被装饰的类或类原型
   * @param propertyKey 被装饰的属性名
   */
  hasDecoratorInfos(target: DecoratedClassOrProto, propertyKey: string): boolean {
    return Reflect.hasMetadata(METADATAKEY.DECORATORINFOS, target, propertyKey);
  }

  /**
   * 属性上是否存在属性装饰器信息
   * @param target 被装饰的类或类原型
   * @param decoratorName 装饰器名称
   * @param propertyKey  被装饰的属性名
   * @returns true: 存在 false: 不存在
   */
  hasDecoratorInfo(target: DecoratedClassOrProto, decoratorName: string, propertyKey: string): boolean {
    const decoratorInfos: DecoratorInfo[] = this.getDecoratorInfos(target, propertyKey) || [];
    return decoratorInfos.some(info => info.name === decoratorName);
  }

  /**
   * 方法上是否存在对于类型的装饰器信息
   * @param target 被装饰的类或类原型
   * @param propertyKey  被装饰的属性名
   * @param type 装饰器类型
   * @returns true: 存在 false: 不存在
   */
  hasDecoratorInfoOfType(
    target: DecoratedClassOrProto,
    decoratorType: DecoratorType,
    propertyKey: string | symbol,
  ): boolean {
    const decoratorInfos: DecoratorInfo[] = this.getDecoratorInfos(target, propertyKey) || [];
    return decoratorInfos.some(info => info.type === decoratorType);
  }
}
