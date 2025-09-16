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
} from './types/faker';
import { FuncUtils } from '@/utils/FuncUtils';
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
   * 默认数据上限
   */

  /**
   * 设置默认faker
   */
  static setDefaultFaker(refFaker = faker) {
    FakerApi.defaultFaker = refFaker;
  }

  /**
   * 生成数据
   */
  static useModel(modelName: string | symbol, options?: UseModelOptions) {
    let defaultOptions: UseModelOptions = {
      num: 1,
      deep: true,
      extendList: [],
      callbacks: [],
    };
    options = { ...defaultOptions, ...options };
    console.log('options', options);

    let { num, deep } = options;
    if (typeof deep === 'boolean') {
      deep = deep ? Infinity : 0;
    }
    if (deep! < 0) {
      return null;
    }
    // 获取数据模型
    const dataModel = ModelManager.getDataModel(modelName);
    if (!dataModel) return null;
    // 解析模型
    let result =
      num === 1
        ? this.resolveModel(dataModel, options)
        : Array.from({ length: num! }, () => {
            return this.resolveModel(dataModel, options);
          });
    console.log('Result', result);

    return result;
  }

  /**
   * 解析规则
   */
  /* private static parseRule(rule: string): number {
    let cycleNum: number = 0;
    // 动态返回策略函数
    if (rule) {
      let [mode, range] = rule.split('|');
      if (mode && range) {
        if (mode === 'list') {
          let [min, max] = range.split('-');
          let minInt = Math.abs(parseInt(min));
          let maxInt = Math.abs(parseInt(max));
          if (!minInt && !maxInt) {
            cycleNum = 0;
            if (!maxInt) {
              cycleNum = minInt;
            } else if (!minInt) {
              cycleNum = maxInt;
            } else {
              cycleNum = Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
            }
          }
        }
      }
    }
    return cycleNum;
  } */
  /**
   * 解析模型生成数据
   */
  private static resolveModel(dataModel: DataModal, options: UseModelOptions) {
    // 结果
    let result: Record<string | symbol, any> = {};

    // 函数队列最后再来处理函数
    let fnList: Array<Record<string | symbol, CustomGenerator>> = [];

    let { deep, extendList } = options;
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
        // 递归解析引用模型
        result[key] = this.useModel(refModal, { deep: --deep, num });
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
        temp = this.useModel(modalName);
        result = Object.assign(temp || {}, result);
      });
    }
    return result;
  }
  /**
   * 带缓存的解析器
   */
  //private static parseFakerMethodWithMemo = FuncUtils.memorizable(this.parseFakerMethod);

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
    moduleName: modelName,
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
