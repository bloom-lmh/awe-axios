import { allFakers, Faker, faker } from '@faker-js/faker';
import {
  AllFakers,
  CustomGenerator,
  DataFakeOptions,
  DataFakeRule,
  DataFieldType,
  FakerModule,
  ModelSchema,
} from './types/faker';
import { DataModel } from './DataModel';
import { ModelManager } from './ModelManager';
import { COUNT, DEEP } from '@/core/constant/DataFakerConstants';
/**
 * FakerApi类
 * 提供定义模型的方法
 */

export class DataFaker {
  /**
   * 当前语言
   */
  private static locale: Faker = faker;

  /**
   * 设置当前语言环境
   * @param locale 语言环境
   */
  static setLocale(locale: Faker | AllFakers) {
    locale = typeof locale === 'string' ? allFakers[locale] : locale;
    return this;
  }

  /**
   * 使用的模型
   */
  static parseModel(dataModel: DataModel | string | symbol, rules?: DataFakeRule) {
    let model = dataModel instanceof DataModel ? dataModel : ModelManager.getDataModel(dataModel);
    if (!model) {
      return null;
    }
    let modelSchema = model.getModelSchema();
    let modelName = model.getModelName();
    rules = rules || {};
    rules[COUNT] = rules[COUNT] === undefined || rules[COUNT] === null ? 1 : rules[COUNT];
    const path = new Set<string | symbol>().add(modelName);
    if (rules[COUNT] <= 0) {
      return null;
    } else if (rules[COUNT] === 1) {
      return this.parseScheme(modelSchema, rules, path);
    } else {
      return Array.from({ length: rules[COUNT] }).map(() => this.parseScheme(modelSchema, rules, path));
    }
  }

  /**
   * 解析模式
   */
  private static parseScheme(
    modelSchema: ModelSchema,
    rules: DataFakeRule,
    path: Set<string | symbol> = new Set(),
    depth: number = 0,
  ): Record<string | symbol, any> | null {
    // 没有模式返回空
    if (!modelSchema) {
      return null;
    }
    if (rules[DEEP] && depth >= rules[DEEP]) {
      depth = 0;
      return null;
    }
    // 函数队列
    let fnShemaList: Array<Record<string | symbol, CustomGenerator>> = [];
    // schema执行结果
    let result: Record<string | symbol, any> = {};
    if (rules[DEEP]) {
    }
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
        let refModel;
        // 解析配置
        let rls = rules[key] === undefined || rules[key] === null ? {} : rules[key];
        if (typeof rls === 'number') {
          rls = { [COUNT]: rls, [DEEP]: 1 };
        }
        if (Array.isArray(rls)) {
          if (rls.length < 2) {
            throw new Error('数组规则格式错误');
          }
          rls = { [COUNT]: rls[0], [DEEP]: rls[1] };
        }
        if (schema instanceof DataModel) {
          refModel = schema;
        } else {
          refModel =
            schema.refModel instanceof DataModel ? schema.refModel : ModelManager.getDataModel(schema.refModel);
          rls[COUNT] = rls[COUNT] === undefined || rls[COUNT] === null ? schema[COUNT] : rls[COUNT];
          rls[DEEP] = rls[DEEP] === undefined || rls[DEEP] === null ? schema[DEEP] : rls[DEEP];
        }
        if (!refModel) {
          return null;
        }
        const modelSchema = refModel.getModelSchema();
        const modelName = refModel.getModelName();
        // 如果路径中有循环依赖则使用deep控制递归深度
        if (path.has(modelName)) {
          console.log(rls);
          rls[DEEP] = 4;
          console.log(depth);
        }
        if (rls[COUNT] <= 0) {
          result[key] = null;
        } else if (rls[COUNT] === 1) {
          result[key] = this.parseScheme(modelSchema, rls, path.add(modelName), depth + 1);
        } else {
          result[key] = Array.from({ length: rls[COUNT] }, () => {
            return this.parseScheme(modelSchema, rls, path.add(modelName), depth + 1);
          });
        }
        let firstModelName = [...path][0];
        path.clear();
        path.add(firstModelName);
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
export function defineModel(modelName: string | symbol, model: Record<string, DataFieldType> | DataModel) {
  // 创建数据模型对象
  let dataModel = model instanceof DataModel ? model : new DataModel(modelName, model);
  // 返回一个可修改的模型对象
  return dataModel;
}

/**
 * 伪造数据
 */
export function FakeData(dataModel: DataModel | string | symbol, options?: DataFakeOptions) {
  // 获取生成数据规则和回调
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
