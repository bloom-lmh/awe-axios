import { I18n } from '@/core/i18n/i18n';
import { enUS } from '@/core/i18n/locales/en';
import { zhCN } from '@/core/i18n/locales/zh';

describe('I18n', () => {
  beforeEach(() => {
    // 在每个测试前重置为默认语言环境
    I18n.setLocale(enUS);
  });

  describe('setLocale', () => {
    it('应该正确设置语言环境', () => {
      I18n.setLocale(zhCN);
      expect(I18n.getLocale()).toBe(zhCN);
    });
  });

  describe('getLocale', () => {
    it('应该返回当前语言环境', () => {
      expect(I18n.getLocale()).toBe(enUS);
    });
  });

  describe('t', () => {
    it('应该正确翻译简单键', () => {
      const translation = I18n.t('error.i18n.resultNotString');
      expect(translation).toBe(
        'i18n: The translation result is not a string. Please check whether the passed expression is correct or if there is a corresponding statement'
      );
    });

    it('应该正确处理带参数的翻译', () => {
      const translation = I18n.t('error.apiFactory.duplicateRegistration', {
        moduleName: 'user',
        className: 'UserApi',
        alias: 'user',
      });
      expect(translation).toBe(
        'ApiFactory: UserApi|user instance already exists in module user. Duplicate registration is not allowed'
      );
    });

    it('应该忽略null或undefined的参数', () => {
      const translation = I18n.t('error.apiFactory.duplicateRegistration', {
        moduleName: 'user',
        className: null,
        alias: undefined,
      });
      expect(translation).toBe(
        'ApiFactory: {className}|{alias} instance already exists in module user. Duplicate registration is not allowed'
      );
    });

    it('切换语言后应该返回对应语言的翻译', () => {
      I18n.setLocale(zhCN);
      const translation = I18n.t('error.i18n.resultNotString');
      expect(translation).toBe(
        'i18n: 翻译的结果不是字符串，请检查传入的表达式是否正确或是否有对应语句'
      );
    });

    it('当键不存在时应该抛出错误', () => {
      expect(() => I18n.t('nonexistent.key')).toThrow(
        'i18n: There is no matching translation result for the key:"nonexistent" of the expression:"nonexistent.key". Please check the expression or whether the translation has been registered'
      );
    });

    /*  it('当翻译结果不是字符串时应该抛出错误', () => {
      // 模拟一个返回非字符串的翻译键
      const mockLocale = {
        ...enUS,
        error: {
          ...enUS.error,
          i18n: {
            resultNotString: 123, // 故意设置为数字
          },
        },
      };
      I18n.setLocale(mockLocale);
      expect(() => I18n.t('error.i18n.resultNotString')).toThrow(
        'i18n: Failed to load translation for locale'
      );
    }); */

    it('应该正确处理多层嵌套的键', () => {
      const translation = I18n.t('error.apiFactory.notFound', {
        moduleName: 'order',
        className: 'OrderApi',
        alias: 'order',
      });
      expect(translation).toBe(
        'ApiFactory: Instance not found for OrderApi|order in module order, please check if it is registered'
      );
    });

    it('当没有提供参数时应该返回原始翻译字符串', () => {
      const translation = I18n.t('error.apiFactory.notFound');
      expect(translation).toBe(
        'ApiFactory: Instance not found for {className}|{alias} in module {moduleName}, please check if it is registered'
      );
    });
  });
});
