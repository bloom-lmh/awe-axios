import { DECORATORNAME } from '../common/constant';
import { DecoratedClassOrProto, ParamDecoratorConfig } from '../../decorator';
import { DecoratorInfo } from '../DecoratorInfo';
import { PathParamDecoratorFactory } from './PathParamDecoratorFactory';

/**
 * 查询参数装饰器工厂
 */
export class QueryParamDecoratorFactory extends PathParamDecoratorFactory {
  /**
   * 初始化装饰器信息
   */
  protected initDecoratorInfo(): void {
    this.decoratorInfo = new DecoratorInfo()
      .setName(DECORATORNAME.QUERYPARAM)
      .setType('parameter')
      .setConflictList([DECORATORNAME.PATHPARAM, DECORATORNAME.QUERYPARAM, DECORATORNAME.BODYPARAM]);
  }

  /**
   * 校验装饰器
   * @param target 被装饰的类或类原型对象
   * @param propertyKey 被装饰的方法名
   */
  protected validateDecorator(
    target: DecoratedClassOrProto,
    propertyKey: string | symbol,
    config: ParamDecoratorConfig,
  ): void {
    // 获取冲突列表
    const { conflictList } = this.decoratorInfo;
    // 获取参数名和参数索引
    const { paramIndex } = config;
    // 校验装饰器是否冲突
    if (this.decoratorValidator.isDecoratorConflict(target, conflictList, propertyKey, paramIndex)) {
      throw new Error(`QueryParam decorator cannot be used with the decorator at the same time.`);
    }
  }
}
