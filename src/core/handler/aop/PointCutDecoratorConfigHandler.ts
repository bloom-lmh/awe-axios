import { DECORATORNAME } from './../../constant/DecoratorConstants';
import { PointCutExpression, PointCutObj } from '@/core/decorators/aop/types/aop';
import { DecoratorConfigHandler } from '../DecoratorConfigHandler';
import { FuncUtils } from '@/utils/FuncUtils';

/**
 * 切点表达式配置处理器
 */
export class PointCutDecoratorConfigHandler extends DecoratorConfigHandler {
  /**
   * 可缓存的解析切点表达式函数
   * @param expression 表达式
   */
  parsePointCutExpWithMemo: (expression: PointCutExpression) => PointCutObj = FuncUtils.memorizable(
    this.parsePointCutExpression,
  );

  /**
   * 解析切点表达式为对象
   * @param expression 切点表达式
   */
  private parsePointCutExpression(expression: PointCutExpression): PointCutObj {
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
