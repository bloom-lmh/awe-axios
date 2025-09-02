import { DECORATORNAME } from './../../constant/DecoratorConstants';
import { PointCutExpression, PointCutObj } from '@/core/decorators/aop/types/aop';
import { DecoratorConfigHandler } from '../DecoratorConfigHandler';

/**
 * 切点表达式配置处理器
 */
export class PointCutDecoratorConfigHandler extends DecoratorConfigHandler {
  /**
   * 解析切点表达式为对象
   * @param expression 切点表达式
   */
  parsePointCutExpression(expression: PointCutExpression): PointCutObj {
    let config: PointCutObj = {
      module: '*',
      ctor: '*',
      method: '*',
    };
    let exps = expression.split('.');
    if (exps.length === 1) {
      config.method = exps[0];
    }
    if (exps.length === 2) {
      config.ctor = exps[0];
      config.method = exps[1];
    }
    if (exps.length === 3) {
      config.module = exps[0];
      config.ctor = exps[1];
    }
    return config;
  }
}
