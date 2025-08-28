import Joi from 'joi';

/**
 * retry参数模式
 */
const retrySchema = Joi.alternatives()
  .try(
    Joi.object({
      count: Joi.number().integer().min(0).max(10).default(0),
      delay: Joi.number().integer().min(100).max(10000).default(1000),
    }),
    Joi.boolean(),
    Joi.number().integer().min(0).max(10).default(0),
    Joi.array().items(
      Joi.number().integer().min(0).max(10).default(0),
      Joi.number().integer().min(100).max(10000).default(1000),
    ),
  )
  .default(false);

/**
 * debounce参数模式
 */
const debounceSchema = Joi.alternatives()
  .try(
    Joi.object({
      signal: Joi.any(), // 信号量可以是任意类型
      delay: Joi.number().integer().min(100).max(300000).default(300),
    }),
    Joi.boolean(),
    Joi.number().integer().min(100).max(300000).default(300),
  )
  .default(false);

/**
 * throttle参数模式
 */
const throttleSchema = Joi.alternatives()
  .try(
    Joi.object({
      signal: Joi.any(), // 信号量可以是任意类型
      interval: Joi.number().integer().min(100).max(3600000).default(100),
    }),
    Joi.boolean(),
    Joi.number().integer().min(100).max(3600000).default(100),
  )
  .default(false);

/**
 * axiosplus 基本模式
 */
export const axiosPlusRequestConfigSchema = Joi.object({
  /**
   * 请求重传配置（支持对象或布尔值）
   */
  retry: retrySchema,

  /**
   * 防抖配置（支持对象或布尔值）
   */
  debounce: debounceSchema,

  /**
   * 节流配置（支持对象或布尔值）
   */
  throttle: throttleSchema,
});
// 当 debounce 为真值
/* .when(Joi.object({ debounce: Joi.exist() }).unknown(), {
    then: Joi.object({
      throttle: Joi.valid(false, null).message('"throttle" 和 "debounce" 不能同时使用'),
    }),
  })
  // 当 throttle 为真值
  .when(Joi.object({ throttle: Joi.exist() }).unknown(), {
    then: Joi.object({
      debounce: Joi.valid(false, null).message('"debounce" 和 "throttle" 不能同时使用'),
    }),
  });
 */
