import { Faker, allFakers } from '@faker-js/faker';
import { PropertyDecorator } from '../../decorator';

/**
 * faker模块联合类型
 * @example book ,animal等
 */
type FakerModule = keyof Faker;

/**
 * faker 模块.方法联合类型路径字符串
 * @example book.title,animal.name
 */
type FakerMethodPath<M extends FakerModule = FakerModule> = M extends M
  ? keyof Faker[M] extends string
    ? `${M}.${keyof Faker[M]}`
    : never
  : never;

/**
 * faker方法
 * @description 根据方法路径推断方法类型
 */
type FakerMethod<P extends string> = P extends `${infer M extends FakerModule}.${infer F}`
  ? F extends keyof Faker[M]
    ? Faker[M][F] extends (...args: any) => any
      ? Faker[M][F]
      : never
    : never
  : never;

/**
 * faker方法参数类型
 */
type FakerMethodParamsType<P extends string> = FakerMethod<P> extends (args: infer A) => any ? A : never;

/**
 * 自定义数据生成器
 */
type CustomGenerator = (ctx: Record<string | symbol, any>) => any;
/**
 * 引用模型配置
 */
type RefModel = {
  modelName: string;
  rule?: string;
};

/**
 * 数据字段类型
 */
type DataFieldType<P extends FakerMethodPath> =
  | CustomGenerator
  | RefModel
  | FakerMethodPath
  | [P, FakerMethodParamsType<P>];

/**
 * 字段装饰器配置类型
 */
type DataFieldDecoratorOptions<P extends FakerMethodPath> = DataFieldType<P>;

/**
 * 模型字段结构
 */
type DataField = {
  /**
   * 类型
   */
  fieldSchema: FakerMethodPath | CustomGenerator | RefModel;
  /**
   * 参数
   */
  args?: any;
};

/**
 * 模型数据结构
 */
type DataModal = {
  /**
   * 模型名
   */
  moduleName: string | symbol;
  /**
   * 模型规则
   */
  rule: string;
  /**
   * 继承的模型
   */
  extends: Array<string | symbol>;
  /**
   * 模型字段
   */
  fields: Record<string, DataFieldType>;
};

/**
 * 所有Fakers联合类型
 */
export type AllFakers = keyof typeof allFakers;
