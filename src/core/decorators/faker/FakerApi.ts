import { allFakers, da, de, Faker, faker } from '@faker-js/faker';
import { ModelManager } from './ModelManager';
import {
  AllFakers,
  CustomGenerator,
  DataModal,
  FakerMethodParamsType,
  FakerMethodPath,
  FakerModule,
  RefModel,
  UseModelOptions,
  UseModelRule,
} from './types/faker';
/**
 * FakerApi类
 * 提供定义模型的方法
 */

class FakerApi {
  /**
   * 默认faker
   */
  private static defaultFaker: Faker = faker;

  /**
   * 设置默认faker
   */
  static setDefaultFaker(refFaker = faker) {
    FakerApi.defaultFaker = refFaker;
  }
  /**
   * 生成数据
   */
  static generateData(modelName: string | symbol, options?: UseModelOptions) {
    let result = this.useModel(modelName, options);
    if (options && options.callbacks) {
      if (typeof options.callbacks === 'function') {
        result = options.callbacks(result);
      } else if (typeof options.callbacks === 'object' && Array.isArray(options.callbacks)) {
        options.callbacks.forEach(callback => {
          result = callback(result);
        });
      }
    }
    return result;
  }

  /**
   * 使用模型
   */
  static useModel(modelName: string | symbol, options?: UseModelOptions) {
    // 规则转小写
    if (typeof modelName === 'string') {
      modelName = modelName.toLowerCase();
    }
    let defaultOptions: UseModelOptions = {
      num: 1,
      deep: true,
      extendList: [],
      callbacks: [],
    };
    let mergedOptions: UseModelOptions & {
      __normalized__?: boolean;
    } = { ...defaultOptions, ...options };
    let { num, deep, refRule } = mergedOptions;
    // 将refRule的键转换为小写
    if (refRule && !mergedOptions.__normalized__) {
      mergedOptions.refRule = this.normalizeRefRule(refRule);
      mergedOptions.__normalized__ = true;
    }
    if (typeof deep === 'boolean') {
      mergedOptions.deep = deep ? Infinity : 0;
    }

    if ((mergedOptions.deep as number) < 0) {
      return null;
    }
    // 获取数据模型
    const dataModel = ModelManager.getDataModel(modelName);
    if (!dataModel) return null;
    // 解析模型
    let result =
      num === 1
        ? this.resolveModel(dataModel, mergedOptions)
        : Array.from({ length: num! }, () => {
            return this.resolveModel(dataModel, mergedOptions);
          });

    return result;
  }

  /**
   * 解析模型生成数据
   */
  private static resolveModel(dataModel: DataModal, options: UseModelOptions) {
    // 结果
    let result: Record<string | symbol, any> = {};
    // 函数队列最后再来处理函数
    let fnList: Array<Record<string | symbol, CustomGenerator>> = [];
    let { modelName } = dataModel;
    let { deep, extendList, refRule } = options;
    deep = deep as number;
    // 遍历字段
    for (const [key, value] of Object.entries(dataModel.fields)) {
      // 处理自定义生成器
      if (typeof value === 'function') {
        fnList.push({ [key]: value });
        continue;
      }
      // 处理faker方法
      if (typeof value === 'string') {
        // 尝试获取faker方法
        let fakerMethod = this.parseFakerMethod(value);
        if (typeof fakerMethod === 'function') {
          result[key] = (fakerMethod as Function)();
        } else {
          result[key] = fakerMethod;
        }
        continue;
      }
      // 处理数组
      if (Array.isArray(value)) {
        let [methodPath, params] = value;
        let fakerMethod = this.parseFakerMethod(methodPath);
        if (typeof fakerMethod === 'function') {
          result[key] = (fakerMethod as Function)(params);
        } else {
          result[key] = fakerMethod;
        }
        continue;
      }
      // 处理引用模型
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        let { refModal, num = 1 } = value;
        // 获取生成数量
        let refRuleNum = this.parseNum(modelName, refModal, refRule);
        if (refRuleNum > 0) {
          num = refRuleNum;
        }
        // 递归解析引用模型
        result[key] = this.useModel(refModal, { deep: --deep, num, refRule });
        continue;
      }
    }
    // 处理函数队列
    if (fnList.length > 0) {
      fnList.forEach(fnItem => {
        let [key, value] = Object.entries(fnItem!)[0];
        result[key] = (value as Function)(result);
      });
    }
    // 继承属性
    if (extendList && extendList.length > 0) {
      let temp;
      extendList.forEach(modalName => {
        // 获取规则
        temp = this.useModel(modalName);
        result = Object.assign(temp || {}, result);
      });
    }
    return result;
  }

  /**
   * 标准化引用规则
   */
  private static normalizeRefRule(refRule: UseModelRule): UseModelRule {
    const normalized: UseModelRule = {};
    for (const [k, v] of Object.entries(refRule)) {
      const key = typeof k === 'string' ? k.toLowerCase() : k;
      if (typeof v === 'object') {
        normalized[key] = this.normalizeRefRule(v);
      } else {
        normalized[key] = v;
      }
    }
    return normalized;
  }

  /**
   * 解析生成数量
   */
  private static parseNum(modelName: string | symbol, refModel: string | symbol, refRule?: UseModelRule) {
    if (typeof modelName === 'string') {
      modelName = modelName.toLowerCase();
    }
    if (typeof refModel === 'string') {
      refModel = refModel.toLowerCase();
    }
    if (!refRule) {
      return -1;
    }
    let modelRule = refRule[modelName];
    if (!modelRule) {
      return -1;
    }
    let refModelRule = modelRule[refModel];

    if (!refModelRule) {
      return -1;
    }
    return refModelRule;
  }
  /**
   * 解析faker方法
   */
  private static parseFakerMethod(methodPath: string) {
    const [module, method] = methodPath.split('.');
    if (!module || !method) {
      return methodPath;
    }
    let fakerMethod = this.defaultFaker[module as FakerModule][method as keyof Faker[FakerModule]];
    return fakerMethod;
  }
}

/**
 * 定义模型
 */
export function defineModel<P extends FakerMethodPath>(
  modelName: string | symbol,
  schema: Record<string, FakerMethodPath | [P, FakerMethodParamsType<P>] | CustomGenerator | RefModel>,
) {
  // 封装数据结构
  const dataModel: DataModal = {
    modelName: modelName,
    fields: schema,
  };
  // 注册数据模型
  ModelManager.registerDataModel(modelName, dataModel);
}

/**
 * FakerAPI工厂函数
 */
export function FakerAPI(localeFaker: AllFakers | Faker = faker) {
  let refFaker = localeFaker;
  if (typeof localeFaker === 'string') {
    refFaker = allFakers[localeFaker];
  }
  FakerApi.setDefaultFaker(refFaker as Faker);
  return FakerApi;
}
