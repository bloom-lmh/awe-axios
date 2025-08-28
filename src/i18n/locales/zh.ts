import { Locale } from '@/types';

export const zhCN: Locale = {
  name: 'zhCN',
  ERROR: {
    CONFIG: {
      INVALID_AXIOS_REF: `
        非法配置：refAxios必须是Axios实例或者是一个返回Axios实例的工厂函数。
      `,
      INVALID_PATH_PARAM_TYPE: `
        非法配置：配置中路径参数pathParams必须是一个对象，其键必须是字符串，值必须是字符串或数字(值字符串非空且必须由数字、字母、下划线组成)。
      `,
      INVALIED_PATH_PARAM: `
        非法配置：配置中路径参数pathParams必须是一个对象，对象属性值中不能有特殊字符，如：[?=.: ]等。
      `,
      MISSING_AXIOS_REF: `
        配置缺失：@Api类装饰器和@{{fnName}}方法装饰器中至少有一个能提供axios实例的引用。
      `,
    },
    DECORATOR: {
      INVALID_POSITION: `
        非法装饰位置：{{decorator}}装饰器仅允许在{{position}}上使用。
      `,
      MISSING_IDENTIFIER: `
        缺少标识符：必须提供{{identifier}}参数。
      `,
      INSTANCE_NOT_FOUND: `
        未找到实例：未找到{{identifier}}对应的实例。
      `,
      INSTANCE_ALREADY_REGISTERED: `
        实例已注册：{{identifier}}对应的实例已被注册。
      `,
      REPEATED_DECORATION: `
        重复装饰：{{identifier}}方法已被HTTP方法装饰器装饰过不可重复装饰。
      `,
      REPEATED_PARAMS: `
        重复参数：{{x1}}方法上的@{{x2}}注解存在重复的{{x3}}参数。
      `,
      INVALID_PATH_PARAM_TYPE: `
        非法参数：路径参数值只能是字符串、数值或布尔类型，且字符串必须由数字、字母、下划线组成。你的路径参数{{x1}}的值为{{x2}}类型为{{x3}}。
      `,
      MISSING_PATH_PARAM: `
        路径参数缺失：路径参数{{x1}}缺失。
      `,
    },
    SYSTEM: {
      INVALIED_ENVIRONMENT: `
        非法环境：{{env}}不是有效的环境,期望环境是{{expect}}。
      `,
    },
    I18N: {
      INVALID_EXPRESSION: `
      i18n: 找不到翻译键: {{key}} (当前语言: {{locale}}，请检查表达式是否正确
      `,
      RESULT_NOT_STRING: `
      i18n: 翻译后的值不为字符串类型 (实际类型: {{translation}})，请检查表达式是否完整或当前语言环境是否有该表达式
      `,
      NO_LANG_ENV: `
      i18n: {{localeName}}没有对应的语言环境，请检查是否正确传入语言环境名称。如果确实没有希望你成为国际化贡献者
      `,
    },
  },
};
