/* 国际化 */
export interface ConfigError {
  INVALID_AXIOS_REF: string; // 无效的axios引用
  INVALID_PATH_PARAM_TYPE: string; // 无效的路径参数类型
  INVALIED_PATH_PARAM: string; // 无效的路径参数
  MISSING_AXIOS_REF: string; // 缺少axios引用
}
export interface DecoratorError {
  INVALID_POSITION: string; // 装饰器位置错误
  MISSING_IDENTIFIER: string; // 缺少标识符
  INSTANCE_NOT_FOUND: string; // 实例未找到
  INSTANCE_ALREADY_REGISTERED: string; // 实例已注册
  REPEATED_DECORATION: string; // 重复装饰
  REPEATED_PARAMS: string; // 重复参数
  INVALID_PATH_PARAM_TYPE: string; // 无效的路径参数类型
  MISSING_PATH_PARAM: string; // 缺少路径参数
}
export interface SystemError {
  INVALIED_ENVIRONMENT: string; // 非法环境
}
export interface I18nError {
  // 翻译键相关错误
  INVALID_EXPRESSION: string; // 非法表达式
  RESULT_NOT_STRING: string; // 翻译结果不是字符串
  NO_LANG_ENV: string; // 不支持该语言环境
}
export interface ErrorMessage {
  CONFIG: ConfigError;
  DECORATOR: DecoratorError;
  SYSTEM: SystemError;
  I18N: I18nError;
}
export interface Locale {
  name: string;
  ERROR: ErrorMessage;
}
