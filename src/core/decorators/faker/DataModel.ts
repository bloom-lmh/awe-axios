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
    return this;
  }
  /**
   * 添加属性
   */
  setProperty(name: string, type: DataFieldType) {
    this.modelSchema[name] = type;
    return this;
  }
  /**
   * 添加多个属性
   */
  setProperties(properties: Record<string, DataFieldType>) {
    for (const [name, type] of Object.entries(properties)) {
      this.setProperty(name, type);
    }
    return this;
  }
  /**
   * 排除属性
   */
  excludeProperties(excluedes: (string | symbol)[]) {
    for (const name of excluedes) {
      delete this.modelSchema[name];
    }
  }
  /**
   * 获取模板
   */
  getModelSchema(): ModelSchema {
    return this.modelSchema;
  }
}
