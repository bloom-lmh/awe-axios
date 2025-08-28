import Joi from 'joi';
import { constructorSchema, identifierSchema } from '../BaseScema';
import { InstanceScope } from '@/core/decorators/ioc/types/ioc';

/**
 * 模块名
 * @description 一个模块名必须是一个有效的标识符或使用 -/ 作为分隔符
 */
export const moduleSchema = Joi.alternatives()
  .try(
    identifierSchema,
    Joi.string()
      .trim()
      .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*([-/][a-zA-Z_][a-zA-Z0-9_]*)+$/),
    Joi.symbol(),
  )
  .optional()
  .messages({
    'alternatives.match': '模块名必须是一个有效的标识符或使用 -/ 作为分隔符分隔标识符组成的字符串',
  });

/**
 * 类名或别名
 * @description 一个类名或别名必须是一个有效的标识符
 */
export const ctorNameOrAliasSchema = identifierSchema.optional().messages({
  'string.base': '构造器名或别名必须是字符串',
  'pattern.base': '构造器名或别名必须以字母或下划线开头，且只能包含字母、数字、下划线',
  'any.invalid': '构造器名或别名不能是保留字',
});
/**
 * 表达式
 * @description 表达式可以是一个类名获取别名，也可以是模块名.(类名|别名)
 */
export const expressionSchema = Joi.alternatives()
  .try(
    identifierSchema,
    Joi.string()
      .trim()
      .pattern(/^([a-zA-Z_][a-zA-Z0-9_]*([-/][a-zA-Z_][a-zA-Z0-9_]*)*)\.([a-zA-Z_][a-zA-Z0-9_]*)$/),
  )
  .optional()
  .messages({
    'alternatives.match': '表达式必须是一个标识符作为类名或别名或是一个模块名.(类名|别名)的字符串',
  });

/**
 * 创建实例模式
 * @description 创建实例模式是一个联合类型，包含单例模式、瞬时模式等
 */
// 实际可用的值数组（用于运行时验证）
export const INSTANCE_SCOPE_VALUES: InstanceScope[] = [
  'SINGLETON',
  'TRANSIENT',
  'DEEPCLONE',
  'SHALLOWCLONE',
  'PROTOTYPE',
];
export const scopeSchema = Joi.string()
  .trim()
  .uppercase()
  .valid(...INSTANCE_SCOPE_VALUES)
  .optional()
  .messages({
    'any.only': `必须为以下值之一: ${INSTANCE_SCOPE_VALUES.join(', ')}`,
    'string.empty': '不能为空',
    'string.base': '必须是字符串',
  });

export const dependencyConfigSchema = Joi.object({
  module: moduleSchema,
  ctorNameOrAlias: ctorNameOrAliasSchema,
  expression: expressionSchema,
  scope: scopeSchema,
});
/**
 * 获取实例依赖项选项
 */
export const dependencyOptionsSchema = Joi.alternatives().try(dependencyConfigSchema, expressionSchema).optional();

/**
 * 别名
 */
export const aliasSchema = identifierSchema.optional();

/**
 * 实例注册配置
 */
export const instanceRegisterConfigSchema = Joi.object({
  module: moduleSchema,
  constructor: constructorSchema,
  alias: aliasSchema,
});
