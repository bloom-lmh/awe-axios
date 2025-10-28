import { PointCutDecoratorFactory } from './PointCutDecoratorFactory';
import {
  AfterDecoratorConfig,
  AfterReturnDecoratorConfig,
  AfterThrowDecoratorConfig,
  AroundDecoratorConfig,
  BeforeDecoratorConfig,
} from '../../aop';
import { AspectDecoratorFactory } from './AspectDecoratorFactory';
import { DECORATORNAME } from '../common/constant';

/**
 * Before前置通知
 * @param config before装饰器配置
 * @returns @before 装饰器
 */
export function Before(config: BeforeDecoratorConfig) {
  return new PointCutDecoratorFactory().createDecorator(config, DECORATORNAME.BEFORE, 'before');
}

/**
 * After后置通知
 * @param config after装饰器配置
 * @returns @after 装饰器
 */
export function After(config: AfterDecoratorConfig) {
  return new PointCutDecoratorFactory().createDecorator(config, DECORATORNAME.AFTER, 'after');
}
/**
 * Around环绕通知
 * @param config around装饰器配置
 * @returns @around 装饰器
 */
export function Around(config: AroundDecoratorConfig) {
  return new PointCutDecoratorFactory().createDecorator(config, DECORATORNAME.AROUND, 'around');
}
/**
 * AfterReturning返回通知
 * @param config afterReturning装饰器配置
 * @returns @afterReturning 装饰器
 */
export function AfterReturning(config: AfterReturnDecoratorConfig) {
  return new PointCutDecoratorFactory().createDecorator(config, DECORATORNAME.AFTERRETURN, 'afterReturning');
}
/**
 * AfterThrowing异常通知
 * @param config afterThrowing装饰器配置
 * @returns @afterThrowing 装饰器
 */
export function AfterThrowing(config: AfterThrowDecoratorConfig) {
  return new PointCutDecoratorFactory().createDecorator(config, DECORATORNAME.AFTERTHROW, 'afterThrowing');
}

/**
 * 切面类装饰器
 * @param config 切面类的优先级order，数字越小优先
 */
export function Aspect(config: number = 5) {
  return new AspectDecoratorFactory().createDecorator(config);
}
