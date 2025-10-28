import { FuncUtils } from '@/utils/FuncUtils';
import { DecoratorConfigHandler } from '../common/handler/DecoratorConfigHandler';
import { PointCutExpression, InstancePointCut } from '../../aop';

/**
 * 切点表达式配置处理器
 */
export class PointCutDecoratorConfigHandler extends DecoratorConfigHandler {
  /**
   * 可缓存的解析切点表达式函数
   * @param expression 表达式
   */
  parsePointCutExpWithMemo: (expression: PointCutExpression) => InstancePointCut = FuncUtils.memorizable(
    this.parsePointCutExpression,
  );

  /**
   * 解析切点表达式为对象
   * @param expression 切点表达式
   */
  private parsePointCutExpression(expression: PointCutExpression): InstancePointCut {
    let config: InstancePointCut = {
      module: /^.*$/,
      ctor: /^.*$/,
      method: /^.*$/,
    };
    let exps = expression.split('.');
    const regexps = exps.map(exp => {
      return new RegExp(exp.replace(/\*+/g, '.*'));
    });
    if (exps.length === 1) {
      config.method = regexps[0];
    }
    if (exps.length === 2) {
      config.ctor = regexps[0];
      config.method = regexps[1];
    }
    if (exps.length === 3) {
      config.module = regexps[0];
      config.ctor = regexps[1];
    }
    return config;
  }
}
