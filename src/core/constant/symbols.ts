export const API_CLASS_CONFIG = Symbol('apiClassConfig'); // api配置属性
export const PATH_PARAMS_INDEX = Symbol('pathParamsIndex'); // path参数索引数组
export const QUERY_PARAMS_INDEX = Symbol('queryParamsIndex'); // query参数索引数组
export const DECORATED_BY_HTTP_METHOD = Symbol('decoratedByHttpMethod'); // 被装饰标记
export const API_METHOD_CONFIGS = Symbol('methodConfigs'); // 类中挂载请求方法配置的地方
export const API_METHOD_CONFIG_NORMALNIZED = Symbol('apiClassInstance'); // 类实例
export const DECORATED_MOCK = Symbol('decoratedMock'); // 被mock标记

export const CLASS_STATE_MANAGER = Symbol('classStateManager'); // 类状态管理器
export const METHOD_STATE_MANAGER = Symbol('methodStateManager'); // 方法状态管理器
export const PARAM_STATE_MANAGER = Symbol('paramStateManager'); // 方法参数状态管理器
export const DECORATOR_CONFIG_STATE = Symbol('decoratorConfigState'); // 配置状态 (未处理、已合并、已处理)
