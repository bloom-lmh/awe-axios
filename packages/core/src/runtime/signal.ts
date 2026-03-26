export class SignalController {
  private controller = new AbortController();

  get signal(): AbortSignal {
    return this.controller.signal;
  }

  abort(reason?: string) {
    this.controller.abort(reason);
  }

  enable() {
    if (this.controller.signal.aborted) {
      this.controller = new AbortController();
    }
  }
}
