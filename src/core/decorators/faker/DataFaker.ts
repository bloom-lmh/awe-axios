import { allFakers, da, de, Faker, faker } from '@faker-js/faker';
import { ModelManager } from './ModelManager';
import {
  AllFakers,
  CustomGenerator,
  DataFieldType,
  DataModel,
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

export class DataFaker {
  /**
   * 当前语言
   */
  private locale: Faker | AllFakers = faker;

  /**
   * 当前使用的模型
   */
  private model?: Record<string, DataFieldType>;

  /**
   * 当前规则
   */
  private rule?: UseModelRule;

  /**
   * 当前回调函数
   */
  private callbacks?: Array<(data: any) => any> | ((data: any) => any);

  /* constructor(locale: Faker | AllFakers) {
    // 没有名字则采用匿名模型
    this.locale = typeof locale === 'string' ? allFakers[locale] : locale;
  } */
  /**
   * 设置语言环境
   */
  setLocale(locale: Faker | AllFakers) {
    this.locale = typeof locale === 'string' ? allFakers[locale] : locale;
    return this;
  }

  /**
   * 使用的模型
   */
  useModel(model: string | symbol | Record<string, DataFieldType>) {
    // 没有名字则采用匿名模型
    this.model = typeof model === 'object' ? model : ModelManager.getDataModel(model) || {};
    return this;
  }

  /**
   * 设置规则
   */
  setRule(rule: UseModelRule) {
    this.rule = rule;
    return this;
  }

  /**
   * 设置回调
   */
  setCallbacks(callbacks: Array<(data: any) => any> | ((data: any) => any)) {
    this.callbacks = callbacks;
    return this;
  }

  /**
   * 生成数据
   */
  fake() {}
}
/* DataFaker.useModel({}) */
/**
 * 定义模型
 */
/* export function defineModel<P extends FakerMethodPath>(
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
} */
