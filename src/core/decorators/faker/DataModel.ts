import { ObjectUtils } from '@/utils/ObjectUtils';
import { DataFieldType, ModelSchema } from './types/faker';

/**
 * 数据模型
 */
export class DataModel {
  /**
   * 模型模板
   */
  private modelSchema!: Record<string | symbol, DataFieldType>;

  constructor(modelSchema: Record<string | symbol, DataFieldType>) {
    this.modelSchema = modelSchema;
  }
  /**
   * 克隆模型
   */
  clone() {
    this.modelSchema = ObjectUtils.deepClone(this.modelSchema);
    return new DataModel(this.modelSchema);
  }
  /**
   * 添加属性
   */
  withProperty(name: string, type: DataFieldType) {
    this.modelSchema[name] = type;
    return this;
  }
  /**
   * 添加多个属性
   */
  withProperties(properties: Record<string, DataFieldType>) {
    for (const [name, type] of Object.entries(properties)) {
      this.withProperty(name, type);
    }
    return this;
  }
  /**
   * 排除属性
   */
  excludeProperty(name: string | symbol) {
    delete this.modelSchema[name];
    return this;
  }
  /**
   * 排除属性
   */
  excludeProperties(excluedes: (string | symbol)[]) {
    for (const name of excluedes) {
      delete this.modelSchema[name];
    }
    return this;
  }

  /**
   * 获取模板
   */
  getModelSchema(): ModelSchema {
    return this.modelSchema;
  }
}
