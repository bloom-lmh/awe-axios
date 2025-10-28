import { ParamUtils } from '@/utils/ParamUtils';
import { PropertyDecoratorStateManager } from './PropertyDecoratorStateManager';
import { DecoratedClassOrProto, ParamDecoratorConfig } from '@/decorator';

/**
 * 参数装饰器状态管理器
 */
export class ParamDecoratorStateManager extends PropertyDecoratorStateManager {
  /**
   * 解析参数
   * @param target 装饰器所在的类或原型
   * @param propertyKey 装饰器所在的属性名
   * @param realParams 真实参数列表
   * @param decoratorNames 装饰器名列表
   * @description 需要根据真实参数和元数据数组来获取运行时的参数列表
   */
  getRuntimeParams(
    target: DecoratedClassOrProto,
    propertyKey: string | symbol,
    realParams: any[],
    decoratorNames: symbol[],
  ) {
    let params: Record<string, any>[] = [];
    // 获取元数据参数
    const metadataParams = this.getParamMetaDatas(target, propertyKey, decoratorNames);
    metadataParams.forEach(metadata => {
      let param = ParamUtils.resolveRuntimeParams(metadata, realParams);
      params.push(param);
    });
    return params;
  }
  /**
   * 获取参数元数据
   * @param target 装饰器所在的类或原型
   * @param propertyKey 装饰器所在的属性名
   * @param decoratorNames 装饰器名列表
   * @returns 参数元数据数组
   */
  getParamMetaDatas(
    target: DecoratedClassOrProto,
    propertyKey: string | symbol,
    decoratorNames: symbol[],
  ): ParamDecoratorConfig[][] {
    let params: ParamDecoratorConfig[][] = [];
    decoratorNames = decoratorNames.filter(name => {
      // 查询参数
      let metadata = this.getDecoratorInfo(target, name, propertyKey)?.configs || [];
      params.push(metadata);
    });
    return params;
  }
}
