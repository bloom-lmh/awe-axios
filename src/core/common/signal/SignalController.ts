import { Signal } from './Signal';

/**
 * 信号量控制器
 */
export class SignalController {
  /**
   * 信号量
   */
  private _signal: Signal;

  /**
   * signal访问器
   */
  get signal() {
    return this._signal;
  }

  constructor() {
    this._signal = new Signal();
  }
  /**
   * 取消信号量
   */
  abort(message: string = '') {
    this.signal.abort();
  }

  /**
   * 启用信号量
   */
  enable() {
    this.signal.enable();
  }
}
