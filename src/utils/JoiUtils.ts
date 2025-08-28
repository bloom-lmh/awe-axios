import { Schema, ValidationResult } from 'joi';

export class JoiUtils {
  /**
   * 校验配置对象
   * @param schema Joi 校验模式
   * @param config 待校验的配置对象
   * @returns 校验通过返回清洗后的数据，失败抛出错误
   * @throws ValidationError
   */
  static validate<T>(schema: Schema, config: unknown): T {
    const { error, value }: ValidationResult = schema.validate(config, {
      abortEarly: true, // 有错误提前终止
      stripUnknown: true, // 移除未定义的字段
    });

    if (error) {
      // 格式化错误信息（可选）
      const errorMessage = error.details.map(detail => detail.message).join('; ');
      throw new Error(`${errorMessage}${value ? `（输入值：${value}）` : ''}`);
    }

    return value as T;
  }
}
