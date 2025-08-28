import { Locale } from '@/types';
import { zhCN } from './locales/zh';
import { enUS } from './locales/en';

// 国际化支持类
export class I18n {
  // 默认语言环境
  private static currentLocale: Locale = zhCN;
  private static allLocales: Locale[] = [zhCN];
  // 设置语言环境
  static setCurrentLocale(locale: Locale): void {
    I18n.currentLocale = locale;
  }

  // 获取语言环境
  static getCurrentLocale(): Locale {
    return I18n.currentLocale;
  }

  // 注册语言环境
  static registerLocale(locale: Locale): void {
    I18n.allLocales.push(locale);
  }
  // 获取对应语言环境的语言库
  static getLocale(name: string): Locale {
    const locale = this.allLocales.find((locale) => locale.name === name);
    if (!locale) {
      throw new Error(`i18n: 找不到语言环境: ${name}，请检查是否正确`);
    }
    return locale;
  }
  // 翻译v1 直接传入对象
  static t(
    expression: string,
    params?: { [key: string]: string | undefined | null }
  ): string {
    if (typeof expression !== 'string') {
      throw new Error(
        `i18n: 错误消息模板必须为字符串类型，请检查表达式是否正确（当前表达式值为：${expression}）`
      );
    }
    if (params === null || params === undefined) {
      return expression;
    }
    // 替换参数
    return Object.keys(params).reduce((result, key) => {
      return result.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        params[key] as string
      );
    }, expression);
  }
  // 翻译
  static t_v2(
    expression: string,
    params?: { [key: string]: string | undefined | null }
  ): string {
    // 错误key
    let translation = expression.split('.').reduce((locale, key) => {
      if (!locale.hasOwnProperty(key)) {
        throw new Error(
          `i18n: 找不到翻译键: ${key} (当前语言: ${this.currentLocale.name}，请检查表达式是否正确`
        );
      }
      return locale[key];
    }, this.currentLocale as any);
    // 翻译结果不是字符串
    if (typeof translation !== 'string') {
      throw new Error(
        `i18n: 翻译后的值不为字符串类型 (实际类型: ${typeof translation})，请检查表达式是否完整或当前语言环境是否有该表达式`
      );
    }
    if (params === null || params === undefined) {
      return translation;
    }
    // 替换参数
    return Object.keys(params).reduce((result, key) => {
      // 空值不展示
      //if (params[key] === null || params[key] === undefined) return result;
      translation = translation.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        params[key]
      );
      return translation;
    }, translation);
  }

  // 翻译v3 使用标签化模板字符串
  static t_v3(params?: Record<string, string | undefined | null>) {
    // 模板字符串处理函数
    return (str: TemplateStringsArray, value: string) => {
      if (!params || Object.keys(params).length === 0) {
        return value;
      }
      return value.replace(/\{\{(\w+)\}\}/g, (match) => {
        return params[match] as string;
      });
    };
  }
}

export const i18n: Locale = I18n.getCurrentLocale();
