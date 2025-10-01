import { ParamDecoratorConfig } from '@/core/decorator';

/**
 * 参数处理工具
 */
export class ParamUtils {
  /**
   * 解析参数
   * @description 将元数据参数信息和真实参数值数组进行处理生成最终参数对象
   */
  static resolveRuntimeParams(metaParamData?: ParamDecoratorConfig[], realParams?: any[]): Record<string, any> {
    if (!metaParamData || metaParamData.length === 0 || !realParams || realParams.length === 0) {
      return {};
    }
    let params: Record<string, any> = {};
    metaParamData.forEach(metaParam => {
      // 获取参数名
      const paramName = metaParam.paramName;
      // 参数所在索引
      const paramIndex = metaParam.paramIndex;
      // 获取参数值
      let paramValue = realParams[paramIndex];
      // 若有属性则合并
      if (params[paramName]) {
        params[paramName] = Array.isArray(params[paramName]) ? params[paramName] : [params[paramName]];
        paramValue = Array.isArray(paramValue) ? paramValue : [paramValue];
        params[paramName] = [...params[paramName], ...paramValue];
      } else {
        params[paramName] = paramValue;
      }
    });
    return params;
  }
}
