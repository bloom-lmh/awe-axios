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
  RefModelOptions,
  RefRule,
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
  static parseModel(model: DataModel, rules?: DataFakeRule) {
    rules = rules || {};
    rules.count = rules.count || 1;
    if (rules.deep === undefined || rules.deep === null) {
      rules.deep = 0;
    } else if (typeof rules.deep === 'boolean') {
      rules.deep = rules.deep ? Infinity : 0;
    }
    //rules.deep = typeof rules.deep === 'boolean' ? (rules.deep ? Infinity : 0) : rules.deep || 1;
    /*   if (rules.deep < 0) {
      return null;
    }
    --rules.deep; */
    /*   --rules.deep; */
    let modelSchema = model.getModelSchema();
    if (rules.count === 1) {
      return this.parseScheme(modelSchema, rules);
    }
    return Array.from({ length: rules.count }).map(() => this.parseScheme(modelSchema, rules));
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
      if (typeof schema === 'object' && schema !== null) {
        let rls = (rules[key] as RefRule) || {};
        let dataModel;
        // 若是模型
        if (!(schema instanceof DataModel)) {
          // 合并模型自身配置和传入配置
          const { refModel, count, deep } = schema as RefModelOptions;
          if (typeof rls === 'number') {
            /*   rls = {
              count: 1,
              deep: true,
            }; */
          }
          /*    rls = { count, deep, ...rules[key] }; */
          console.log(key, rls);
          dataModel = refModel;
        } else {
          dataModel = schema;
        }
        // 递归解析引用模型
        //result[key] = this.parseModel(dataModel, rls);
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
  let data = DataFaker.parseModel(dataModel, rules);
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
