import Joi from 'joi';
/**
 * 标识符验证器
 * @description 标识符必须以字母开头，只能包含字母、数字、下划线，并且不能是保留字
 */
export const identifierSchema = Joi.string()
  .trim()
  .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
  .invalid(
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
  )
  .messages({
    'string.base': '标识必须是字符串',
    'pattern.base': '标识符必须以字母或下划线开头，且只能包含字母、数字、下划线',
    'any.invalid': '标识符不能是保留字',
  });

/**
 * 构造函数
 */
export const constructorSchema = Joi.func();
/**
 * 实例对象
 */
export const instanceSchema = Joi.object();
/**
 * 可有可无
 */
export const optionalSchema = Joi.optional();
/**
 * 构造函数原型对象
 */
export const constructorPrototypeSchema = Joi.object();
