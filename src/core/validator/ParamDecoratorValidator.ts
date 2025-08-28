import { DecoratorValidator } from './DecoratorValidator';
import { DecoratorInfo } from '@/core/decorators/DecoratorInfo';
import { METADATAKEY } from '../constant/MetaDataConstants';
import { DecoratorInfos } from '../statemanager/state';
import { PropertyDecoratorValidator } from './PropertyDecoraotrValidator';
import { DecoratedClassOrProto, ParamDecoratorConfig } from '../decorators/decorator';
import { MethodDecoratorValidator } from './MethodDecoratorValidator';

/**
 * 参数装饰器校验器
 * @description 校验如PathParam QueryParam BodyParam等参数装饰器是否正确使用
 */
export class ParamDecoratorValidator extends MethodDecoratorValidator implements DecoratorValidator {
  /**
   * 是否用重复的参数名
   */
  hasDuplicateParamName(
    target: any,
    propertyKey: string | symbol,
    decoratorName: symbol | string,
    paramName: string,
  ): boolean {
    // 获取方法上的装饰器信息
    const decoratorInfos = Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target, propertyKey) as DecoratorInfos;
    if (!decoratorInfos || decoratorInfos.length === 0) {
      return false;
    }
    // 获取参数装饰器信息
    const decoratorInfo = decoratorInfos.find(info => info.name === decoratorName) as DecoratorInfo;
    if (!decoratorInfo) {
      return false;
    }
    // 获取装饰器信息上的配置
    const params = decoratorInfo.configs;
    if (!params || params.length === 0) {
      return false;
    }
    // 判断是否有同名的参数
    return params.some(config => config.paramName === paramName);
  }

  /**
   * 判断属性上是否存在冲突的装饰器
   * @param target 被装饰的目标对象或其原型
   * @param decoratorName 装饰器名称
   * @param propertyKey 属性名称
   * @param paramIndex 参数索引
   */
  isDecoratorConflict(
    target: DecoratedClassOrProto,
    conflictList: (string | symbol)[],
    propertyKey: string | symbol,
    ...args: any[]
  ): boolean {
    const paramIndex = args[0];
    let decoratorInfos = Reflect.getMetadata(METADATAKEY.DECORATORINFOS, target, propertyKey) as DecoratorInfos;
    // 没有装饰器装饰直接返回false
    if (!decoratorInfos || decoratorInfos.length === 0) {
      return false;
    }
    // 判断对应索引的参数是否有参数装饰器标注
    return decoratorInfos
      .filter(info => conflictList.includes(info.name))
      .some(info => {
        return (info.configs as ParamDecoratorConfig[]).map(config => config.paramIndex).includes(paramIndex);
      });
  }
}
