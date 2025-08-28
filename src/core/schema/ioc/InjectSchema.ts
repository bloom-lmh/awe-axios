import { backup } from 'node:sqlite';
import { dependencyConfigSchema, expressionSchema } from './InstanceFactorySchema';
import Joi from 'joi';
import { constructorSchema, instanceSchema, optionalSchema } from '../BaseScema';

/**
 * 注入配置备份项的schema
 */
export const backupSchema = Joi.alternatives()
  .try(
    constructorSchema,
    instanceSchema,
    Joi.array().items(Joi.alternatives().try(constructorSchema, instanceSchema)), // 数组项可以是 constructor 或 instance)
  )
  .messages({
    'alternatives.base': 'backup must be a constructor, instance or an array of constructors or instances',
  });
/**
 * inject装饰器配置对象的schema
 */
export const injectDecoratorOptionsSchema = dependencyConfigSchema.keys({
  backup: backupSchema.optional(),
});
/**
 * inject装饰器配置选项的schema
 */
export const injectDecoratorConfigSchema = Joi.alternatives().try(
  injectDecoratorOptionsSchema,
  expressionSchema,
  optionalSchema,
);
