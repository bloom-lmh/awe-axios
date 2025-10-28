import { DecoratedClass, DecoratorType, DecoratedClassOrProto, SubDecorationConfigs } from '@/decorator';
import { DecoratorInfo } from '@/core/DecoratorInfo';
import { HttpRequestConfig } from '@/core/httpMethod/types/HttpRequestConfig';
import { METADATAKEY } from '../constant';
import { DecoratorStateManager } from './DecoratorStateManager';

/**
 * 类状态管理器
 * @description 管理类的状态，包括定义在类上装饰器的配置，定义在类上的装饰器
 */
export class ClassDecoratorStateManager implements DecoratorStateManager {
  /**
   * 单例模式
   */
  private static instance: ClassDecoratorStateManager;

  /**
   * 获取实例
   * @returns ClassDecoratorStateManager 单例
   */
  static getInstance(): ClassDecoratorStateManager {
    return this.instance ? this.instance : new ClassDecoratorStateManager();
  }

  /**
   * 初始化类装饰器元数据列表
   * @param target 被装饰的类
   * @param decorationInfos 装饰器信息列表
   */
  initDecoratorInfos(target: DecoratedClass, decorationInfos: DecoratorInfo[] = []): void {
    if (!this.hasDecoratorInfos(target)) {
      Reflect.defineMetadata(METADATAKEY.DECORATORINFOS, decorationInfos, target);
    }
  }

  /**
   * 初始化http方法装饰器配置索引列表
   * @param target 被装饰的类
   * @param configIndexes 配置索引列表
   */
  initHttpConfigIdx(target: DecoratedClass, configIndexes: HttpRequestConfig[] = []): void {
    if (!this.hasHttpConfigIdx(target)) {
      Reflect.defineMetadata(METADATAKEY.HTTPCONFIGIDX, configIndexes, target);
    }
  }

  /**
   * 初始化子装饰器配置
   * @param target 被装饰的类
   * @param decoratorName 子装饰器所属装饰器名称
   * @param config
   */
  initSubDecoratorConfig(target: DecoratedClass, decoratorName: string | symbol): void {
    // 若没有子装饰器配置列表则初始化
    let subDecoratorConfigs = this.getAllSubDecoratorConfig(target);
    if (!subDecoratorConfigs) {
      subDecoratorConfigs = {};
      Reflect.defineMetadata(METADATAKEY.SUBDECORATORCONFIGS, subDecoratorConfigs, target);
    }
    if (!subDecoratorConfigs[decoratorName]) {
      subDecoratorConfigs[decoratorName] = {};
    }
  }

  /**
   * 是否有装饰器信息元数据列表
   */
  hasDecoratorInfos(target: DecoratedClass): boolean {
    return !!Reflect.hasMetadata(METADATAKEY.DECORATORINFOS, target);
  }

  /**
   * 是否有指定装饰器信息元数据
   */
  hasDecoratorInfo(target: DecoratedClass, decoratorName: string | symbol): boolean {
    const decoratorInfos = this.getDecoratorInfos(target);
    if (decoratorInfos) {
      return decoratorInfos.some(info => info.name === decoratorName);
    }
    return false;
  }

  /**
   * 是否有http方法装饰器配置索引列表
   */
  hasHttpConfigIdx(target: DecoratedClass) {
    return !!Reflect.hasMetadata(METADATAKEY.HTTPCONFIGIDX, target);
  }
  /**
   * 是否有某种类型的装饰器信息
   * @param target 被装饰的类
   * @param decoratorType 装饰器类型
   */
  hasDecoratorInfoOfType(target: DecoratedClass, decoratorType: DecoratorType): boolean {
    const decoratorInfos: DecoratorInfo[] = this.getDecoratorInfos(target) || [];
    return decoratorInfos.some(info => info.type === decoratorType);
  }

  /**
   * 设置类装饰器信息列表元数据
   */
  setDecoratorInfos(target: DecoratedClass, decoratorInfos: DecoratorInfo[]) {
    Reflect.defineMetadata(METADATAKEY.DECORATORINFOS, decoratorInfos, target);
  }

  /**
   * 在类上添加装饰器信息
   */
  setDecoratorInfo(target: DecoratedClass, decoratorInfo: DecoratorInfo) {
    // 获取类上的装饰器信息列表
    const decoratorInfos = this.getDecoratorInfos(target) || [];
    // 若没有装饰器列表信息则初始化
    /*  if (!decoratorInfos) {
      this.setDecoratorInfos(target, [decoratorInfo]);
      return;
    } */
    // 获取已有的重复装饰器信息
    const decoInfo = decoratorInfos.find(info => info.name === decoratorInfo.name);
    //若有重复装饰器则仅添加配置
    if (decoInfo) {
      decoInfo.configs = [...decoInfo.configs, ...decoratorInfo.configs];
    } else {
      decoratorInfos.push(decoratorInfo);
      this.setDecoratorInfos(target, decoratorInfos);
    }
  }
  /**
   * 在类上添加http方法装饰器配置列表
   */
  setHttpConfigIdxes(target: DecoratedClassOrProto, configList: HttpRequestConfig[]) {
    Reflect.defineMetadata(METADATAKEY.HTTPCONFIGIDX, configList, target);
  }
  /**
   * 在类上添加http方法装饰器配置
   * @description 这样能方便进行配置合并
   */
  setHttpConfigIdx(target: DecoratedClassOrProto, config: HttpRequestConfig) {
    const httpConfigIdxes = this.getHttpConfigIdxes(target) || [];
    // 添加配置
    httpConfigIdxes.push(config);
    this.setHttpConfigIdxes(target, httpConfigIdxes);
  }

  /**
   * 获取类上所有装饰器信息
   */
  getDecoratorInfos(target: DecoratedClass): DecoratorInfo[] | undefined {
    return Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target);
  }

  /**
   * 获取类上装饰器信息元数据
   */
  getDecoratorInfo(target: DecoratedClass, decoratorName: string | symbol): DecoratorInfo | undefined {
    const decoratorInfos = this.getDecoratorInfos(target);
    if (decoratorInfos) {
      return decoratorInfos.find(info => info.name === decoratorName);
    }
    return undefined;
  }
  /**
   * 获取http方法装饰器配置索引
   */
  getHttpConfigIdxes(target: DecoratedClassOrProto): HttpRequestConfig[] | undefined {
    return Reflect.getMetadata(METADATAKEY.HTTPCONFIGIDX, target);
  }
  /**
   * 通过类型获取装饰器信息
   * @param target 被装饰的类
   * @param decoratorType 装饰器类型
   * @returns 装饰器信息数组
   */
  getDecoratorInfosByType(target: DecoratedClass, decoratorType: DecoratorType): DecoratorInfo[] | undefined {
    return this.getDecoratorInfos(target)?.filter(info => info.type === decoratorType);
  }

  /**
   * 获取子装饰器配置对象
   * @param target
   */
  getAllSubDecoratorConfig(target: DecoratedClass): SubDecorationConfigs | undefined {
    return Reflect.getMetadata(METADATAKEY.SUBDECORATORCONFIGS, target);
  }

  /**
   * 获取子装饰器配置
   * @param target
   * @param decoratorName
   */
  getSubDecoratorConfig(target: DecoratedClass, decoratorName: string | symbol) {
    const subDecoratorConfigs = this.getAllSubDecoratorConfig(target);
    if (subDecoratorConfigs) {
      return subDecoratorConfigs[decoratorName];
    }
  }
}
