import { Signal } from './Signal';

/**
 * 信号量控制器
 */
export abstract class SignalController {
  /**
   * 信号量
   */
  signal: Signal;

  constructor() {
    this.signal = new Signal();
  }
  /**
   * 取消信号量
   */
  abort(message: string = '') {}
}
