import {
  type HttpRuntimePlugin,
  resolveAbsoluteHttpTarget,
  withHttpMethodConfig,
} from '@decoraxios/core';
import {
  type DefaultBodyType,
  HttpResponse,
  type HttpResponseResolver,
  type PathParams,
  type RequestHandler,
  type WebSocketHandler,
  http,
} from 'msw';

export type MockHandler = HttpResponseResolver<PathParams, DefaultBodyType, undefined>;

export type MockHandlers = MockHandler | Record<string, MockHandler>;

export interface MockDecoratorOptions {
  on?: boolean;
  condition?: () => boolean;
  count?: number;
  signal?: AbortSignal;
}

export interface MockConfig extends MockDecoratorOptions {
  handlers: Record<string, MockHandler>;
}

interface MockGlobalConfig {
  on: boolean;
  condition?: () => boolean;
}

type RuntimeHandler = RequestHandler | WebSocketHandler;

type MockRuntime =
  | {
      close: () => void;
      listHandlers: () => readonly RuntimeHandler[];
      listen: (options?: { onUnhandledRequest?: 'bypass' | 'warn' | 'error' }) => void;
      resetHandlers: () => void;
      use: (...handlers: RuntimeHandler[]) => void;
    }
  | {
      listHandlers: () => readonly RuntimeHandler[];
      resetHandlers: () => void;
      start: (options?: { onUnhandledRequest?: 'bypass' | 'warn' | 'error'; quiet?: boolean }) => Promise<unknown>;
      stop: () => void;
      use: (...handlers: RuntimeHandler[]) => void;
    };

function normalizeMockConfig(handlers: MockHandlers, options: MockDecoratorOptions = {}): MockConfig {
  const normalizedHandlers =
    typeof handlers === 'function'
      ? {
          default: handlers,
        }
      : handlers;

  return {
    on: true,
    count: Number.POSITIVE_INFINITY,
    ...options,
    handlers: {
      default: () => HttpResponse.json({ message: 'mock response from decoraxios' }),
      ...normalizedHandlers,
    },
  };
}

function buildMockPath(methodId: string, handlerName: string, pathname: string): string {
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `/__awe_mock__/${methodId}/${handlerName}${safePath}`;
}

class MockApi {
  private runtime?: MockRuntime;

  private started = false;

  private pendingHandlers: RuntimeHandler[] = [];

  private nextHandlerQueue: string[] = [];

  private readonly config: MockGlobalConfig = {
    on: false,
  };

  get globalConfig(): MockGlobalConfig {
    return this.config;
  }

  async on() {
    this.config.on = true;
    await this.ensureStarted();
  }

  async off(closeRuntime: boolean = false) {
    this.config.on = false;

    if (!closeRuntime || !this.runtime) {
      return;
    }

    if ('close' in this.runtime) {
      this.runtime.close();
    } else {
      this.runtime.stop();
    }

    this.runtime = undefined;
    this.started = false;
  }

  setCondition(condition: () => boolean) {
    this.config.condition = condition;
  }

  registerHandlers(...handlers: RuntimeHandler[]) {
    this.pendingHandlers.push(...handlers);
    this.runtime?.use(...handlers);
    return this;
  }

  resetHandlers() {
    this.pendingHandlers = [];
    this.nextHandlerQueue = [];
    this.runtime?.resetHandlers();
  }

  listHandlers() {
    return this.runtime ? [...this.runtime.listHandlers()] : [...this.pendingHandlers];
  }

  useNextHandler(name: string) {
    this.nextHandlerQueue.push(name);
    return this;
  }

  consumeNextHandler() {
    return this.nextHandlerQueue.shift();
  }

  clearNextHandlers() {
    this.nextHandlerQueue = [];
  }

  private async ensureStarted() {
    const runtime = await this.ensureRuntime();
    if (this.started) {
      return runtime;
    }

    if ('listen' in runtime) {
      runtime.listen({
        onUnhandledRequest: 'bypass',
      });
    } else {
      await runtime.start({
        onUnhandledRequest: 'bypass',
        quiet: true,
      });
    }

    this.started = true;
    return runtime;
  }

  private async ensureRuntime(): Promise<MockRuntime> {
    if (this.runtime) {
      return this.runtime;
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const { setupWorker } = await import('msw/browser');
      this.runtime = setupWorker();
    } else {
      const { setupServer } = await import('msw/node');
      this.runtime = setupServer();
    }

    if (this.runtime && this.pendingHandlers.length > 0) {
      this.runtime.use(...this.pendingHandlers);
    }

    if (!this.runtime) {
      throw new Error('Failed to initialize the mock runtime.');
    }

    return this.runtime;
  }
}

export const MockAPI = new MockApi();

export function createMockPlugin(mockConfig: MockConfig): HttpRuntimePlugin {
  let registered = false;
  let remaining = mockConfig.count ?? Number.POSITIVE_INFINITY;

  return next => {
    return async requestConfig => {
      const requestUrl = requestConfig.url ?? '';

      if (!registered) {
        const { origin, pathname } = resolveAbsoluteHttpTarget(requestConfig.baseURL, requestUrl);
        const requestMethod = requestConfig.method.toLowerCase();
        const requestFactory = (http as Record<string, Function>)[requestMethod];

        if (typeof requestFactory !== 'function') {
          throw new Error(`Unsupported mock method "${requestConfig.method}".`);
        }

        const registrations = Object.entries(mockConfig.handlers).map(([handlerName, handler]) => {
          return requestFactory(`${origin}${buildMockPath(requestConfig.methodId, handlerName, pathname)}`, handler);
        });

        MockAPI.registerHandlers(...registrations);
        registered = true;
      }

      let enabled = MockAPI.globalConfig.on && (mockConfig.on ?? true);
      if (MockAPI.globalConfig.condition) {
        enabled = enabled && MockAPI.globalConfig.condition();
      }
      if (mockConfig.condition) {
        enabled = enabled && mockConfig.condition();
      }
      if (mockConfig.signal) {
        enabled = enabled && !mockConfig.signal.aborted;
      }
      if (remaining <= 0) {
        enabled = false;
      }

      if (!enabled) {
        return next(requestConfig);
      }

      await MockAPI.on();

      const nextHandler = MockAPI.consumeNextHandler();
      const selectedHandler = nextHandler && mockConfig.handlers[nextHandler] ? nextHandler : 'default';
      const { origin, pathname } = resolveAbsoluteHttpTarget(requestConfig.baseURL, requestUrl);

      remaining -= 1;

      return next({
        ...requestConfig,
        baseURL: origin,
        url: buildMockPath(requestConfig.methodId, selectedHandler, pathname),
      });
    };
  };
}

export function Mock(handlers: MockHandlers, options?: MockDecoratorOptions): MethodDecorator {
  const mockConfig = normalizeMockConfig(handlers, options);

  return withHttpMethodConfig({
    plugins: [createMockPlugin(mockConfig)],
  });
}

export { HttpResponse, http };
