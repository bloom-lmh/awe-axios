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
  refModal: string;
  num?: number;
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
  modelName: string | symbol;
  /**
   * 模型字段
   */
  fields: Record<string, DataFieldType>;
};

/**
 * 所有Fakers联合类型
 */
export type AllFakers = keyof typeof allFakers;

/**
 * 规则配置
 */
type UseModelRule = {
  [key: string | symbol]: number | RecursiveRecord;
};
/**
 * 使用模型配置
 */
type UseModelOptions = {
  /**
   * 生成模型对象的数量
   * @description 如果是1个则直接返回对象，如果是1个以上则以数组形式返回
   */
  num?: number;
  /**
   * 数据生成规则
   */
  refRule?: UseModelRule;
  /**
   * 引用模型的深度
   */
  deep?: boolean | number;
  /**
   * 继承的模型
   */
  extendList?: Array<string | symbol>;
  /**
   * 回调函数
   * @description 对生成的数据进行后处理
   */
  callbacks?: Array<(data: any) => any> | ((data: any) => any);
};
