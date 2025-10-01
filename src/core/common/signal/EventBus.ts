/**
 * 事件总线
 */
export class EventBus {
  /**
   * 事件map
   */
  private events: Map<string | symbol, Function[]> = new Map();

  /**
   * 订阅事件
   */
  subscribe(event: string | symbol, listener: Function): void {
    this.events.has(event) || this.events.set(event, []);
    this.events.get(event)!.push(listener);
  }

  /**
   * 发布事件
   */
  publish(event: string | symbol, message: string) {
    this.events.has(event) && this.events.get(event)!.forEach(listener => listener(message));
  }
}
