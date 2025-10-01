/**
 * 信号量
 */
export class Signal {
  /**
   * 是否取消标准
   */
  private aborted: boolean = false;

  /**
   * 是否取消
   */
  isAborted() {
    return this.aborted;
  }

  /**
   * 取消信号量
   */
  abort() {
    this.aborted = true;
  }

  /**
   * 启用信号量
   */
  enable() {
    this.aborted = false;
  }
}
