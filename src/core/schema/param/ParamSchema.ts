import Joi from 'joi';

/**
 * 参数装饰器配置校验
 */
export const ParamSchema = Joi.object({
  paramName: Joi.string().required(),
  paramIndex: Joi.number().required(),
});
