import { allFakers, Faker, faker } from '@faker-js/faker';
import {
  AllFakers,
  CustomGenerator,
  DataFakeCb,
  DataFakeOptions,
  DataFakeRule,
  DataFieldType,
  FakerModule,
  ModelSchema,
} from './types/faker';
import { DataModel } from './DataModel';
/**
 * FakerApi类
 * 提供定义模型的方法
 */

export class DataFaker {
  /**
   * 当前语言
   */
  private static locale: Faker = faker;

  static setLocale(locale: Faker | AllFakers) {
    locale = typeof locale === 'string' ? allFakers[locale] : locale;
    return this;
  }

  /**
   * 使用的模型
   */
  static useModel(model: DataModel, rules?: DataFakeRule) {
    rules = rules || {};
    rules.count = rules.count || 1;
    rules.deep = rules.deep || true;
    // 没有名字则采用匿名模型
    let modelSchema = model.getModelSchema();
    return this.parseScheme(modelSchema, rules);
  }

  /**
   * 解析模式
   */
  private static parseScheme(modelSchema: ModelSchema, rules: DataFakeRule): Record<string | symbol, any> | null {
    // 没有模式返回空
    if (!modelSchema) {
      return null;
    }
    // 函数队列
    let fnShemaList: Array<Record<string | symbol, CustomGenerator>> = [];
    // schema执行结果
    let result: Record<string | symbol, any> = {};
    // 遍历modelSchema
    for (let [key, schema] of Object.entries(modelSchema)) {
      // 函数最后处理，先加入函数队列
      if (typeof schema === 'function') {
        fnShemaList.push({ [key]: schema });
        continue;
      }
      // 字符串,表示是faker方法路径字符串
      if (typeof schema === 'string') {
        let fakerMethod = this.parsePathMethod(schema);
        if (!fakerMethod || typeof fakerMethod !== 'function') {
          result[key] = null;
        } else {
          result[key] = (fakerMethod! as Function)();
        }
        continue;
      }
      // 处理数组
      if (Array.isArray(schema)) {
        let [methodPath, params] = schema;
        let fakerMethod = this.parsePathMethod(methodPath);
        if (!fakerMethod || typeof fakerMethod !== 'function') {
          result[key] = null;
        } else {
          result[key] = (fakerMethod! as Function)(params);
        }
        continue;
      }
      // 处理引用模型
      if (typeof schema === 'object' && schema !== null && !Array.isArray(schema)) {
        let rule = {};
        // 是数据模型
        if (schema instanceof DataModel) {
        } else {
          let { refModel, count = 1, deep = true } = schema;
        }

        // 递归解析引用模型
        /* result[key] = useModel(refModal, { deep: --deep, num, refRule }); */
        continue;
      }
    }
    // 处理函数
    if (fnShemaList && fnShemaList.length > 0) {
      fnShemaList.forEach(fnItem => {
        let [key, value] = Object.entries(fnItem!)[0];
        result[key] = (value as Function)(result);
      });
    }
    return result;
  }

  /**
   * 解析路径方法字符串
   */
  private static parsePathMethod(path: string) {
    const [module, method] = path.split('.');
    if (!module || !method) {
      return null;
    }
    let fakerMethod = this.locale[module as FakerModule][method as keyof Faker[FakerModule]];
    return fakerMethod;
  }
}
/**
 * 定义模型
 */
export function defineModel(modelSchema: Record<string, DataFieldType>) {
  return new DataModel(modelSchema);
}

/**
 * 伪造数据
 */
export function FakeData(dataModel: DataModel, options?: DataFakeOptions) {
  const { rules, callbacks } = options || {};
  let data = DataFaker.useModel(dataModel, rules);
  if (typeof callbacks === 'function') {
    return callbacks(data);
  }
  if (Array.isArray(callbacks) && callbacks.length > 0) {
    callbacks.forEach(cb => {
      data = cb(data);
    });
    return data;
  }
  return data;
}
