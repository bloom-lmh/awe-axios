import { PointCutDecoratorFactory } from './PointCutDecoratorFactory';
import { PointCutDecoratorConfig } from './types/aop';

export function Advice(config: PointCutDecoratorConfig) {
  return new PointCutDecoratorFactory().createDecorator(config, 'Advice');
}
