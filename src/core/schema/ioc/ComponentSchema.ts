import Joi from 'joi';
import { aliasSchema, moduleSchema, expressionSchema } from './InstanceFactorySchema';

/**
 * Component 装饰器配置校验模式
 */
export const componentDecoratorConfigSchema = Joi.alternatives()
  .try(
    Joi.object({
      module: moduleSchema,
      alias: aliasSchema,
    }),
    expressionSchema,
  )
  .messages({
    'alternatives.match':
      '配置必须是一个对象（包含 module 和 alias）或一个表达式,其中模块名必须是一个有效的标识符或使用 -/ 作为分隔符分隔标识符组成的字符串，alias 必须是一个有效的标识符,表达式必须是一个标识符作为类名或别名或是一个模块名.(类名|别名)的字符串',
  });
