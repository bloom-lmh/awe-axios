import { DataFieldType } from './types/faker';

/**
 * 模型管理器
 */
export class ModelManager {
  /**
   * 数据模型映射
   */
  private static dataModelMap: Map<string | symbol, Record<string, DataFieldType>> = new Map();

  /**
   * 注册数据模型
   */
  static registerDataModel(modelName: string | symbol, dataModel: Record<string, DataFieldType>) {
    if (typeof modelName === 'string') {
      modelName = modelName.toLowerCase();
    }
    // 引用的模型名也转为小写
    /* for (let value of Object.values(dataModel)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (typeof value.refModel === 'string') {
          value.refModel = value.refModel.toLowerCase();
        }
      }
    } */

    // 不区分大小写
    if (this.hasDataModel(modelName)) {
      throw new Error(`数据模型"${String(modelName)}"已注册`);
    }
    // 不可重复注册
    this.dataModelMap.set(modelName, dataModel);
  }

  /**
   * 是否有数据模型
   */
  static hasDataModel(modelName: string | symbol) {
    return this.dataModelMap.has(modelName);
  }

  /**
   * 获取数据模型
   */
  static getDataModel(modelName: string | symbol) {
    if (typeof modelName === 'string') {
      modelName = modelName.toLowerCase();
    }
    return this.dataModelMap.get(modelName);
  }
}
