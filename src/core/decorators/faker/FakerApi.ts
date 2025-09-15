import { allFakers, Faker, faker } from '@faker-js/faker';
import { ModelManager } from './ModelManager';
import {
  AllFakers,
  CustomGenerator,
  DataModal,
  FakerMethodParamsType,
  FakerMethodPath,
  FakerModule,
  RefModel,
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
   * 设置默认faker
   */
  static setDefaultFaker(refFaker = faker) {
    FakerApi.defaultFaker = refFaker;
  }

  /**
   * 生成数据
   */
  static useModel(
    modelName: string | symbol,
    options?: {
      rule?: string;
      deep?: boolean | number;
      isExtensible?: boolean;
      extends?: Array<string | symbol>;
    },
  ) {
    const defaultConfig = {
      rule: '',
      deep: true,
      isExtensible: true,
      extends: [],
    };
    // 合并默认配置
    const config = { ...defaultConfig, ...options };
    // 获取数据模型
    const dataModel = ModelManager.getDataModel(modelName);

    if (!dataModel) return null;
    // 生成数据
    console.log(dataModel);
    let result: Record<string, any> = {};
    // 函数队列最后再来处理函数
    let fnList: Array<CustomGenerator> = [];
    // 遍历字段
    for (const [key, value] of Object.entries(dataModel.fields)) {
      // 处理自定义生成器
      if (typeof value === 'function') {
        fnList.push(value);
        continue;
      }
      // 处理faker方法
      if (typeof value === 'string') {
        // 尝试获取faker方法
        let fakerMethod = this.parseFakerMethod(value);
        result[key] = (fakerMethod as Function)();
      }
      // 处理数组
      if (Array.isArray(value)) {
        let [methodPath, params] = value;
        let fakerMethod = this.parseFakerMethod(methodPath);
        result[key] = (fakerMethod as Function)(params);
      }
      // 处理引用模型
      if (typeof value === 'object' && value !== null) {
        let { moduleName, rule } = value;
      }
    }
    console.log(result);
  }

  /**
   * 解析规则
   */
  private parseRule(rule: string) {
    // TODO: 解析规则
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
  options?: {
    rule?: string;
    extends?: Array<string>;
  },
) {
  // 封装数据结构
  const dataModel: DataModal = {
    moduleName: modelName,
    fields: schema,
    rule: options?.rule || '',
    extends: options?.extends || [],
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
