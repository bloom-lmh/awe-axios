export interface RetryOptions {
  count?: number;
  delay?: number;
  signal?: AbortSignal;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export interface DebounceOptions {
  delay?: number;
  immediate?: boolean;
}

export interface ThrottleOptions {
  interval?: number;
}

type AsyncFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

export function useRequest<TArgs extends unknown[], TResult>(requester: AsyncFn<TArgs, TResult>) {
  return requester;
}

export function useRetry<TArgs extends unknown[], TResult>(
  requester: AsyncFn<TArgs, TResult>,
  options: RetryOptions = {},
): AsyncFn<TArgs, TResult> {
  const {
    count = 3,
    delay = 100,
    signal,
    shouldRetry = () => true,
  } = options;

  return async (...args: TArgs) => {
    let attempt = 0;
    let lastError: unknown;

    while (attempt < count) {
      if (signal?.aborted) {
        throw signal.reason ?? new Error('Retry execution was aborted.');
      }

      try {
        return await requester(...args);
      } catch (error) {
        attempt += 1;
        lastError = error;

        if (attempt >= count || !shouldRetry(error, attempt)) {
          throw error;
        }

        await new Promise(resolve => {
          setTimeout(resolve, delay);
        });
      }
    }

    throw lastError;
  };
}

export function useDebounce<TArgs extends unknown[], TResult>(
  requester: AsyncFn<TArgs, TResult>,
  options: DebounceOptions = {},
): AsyncFn<TArgs, TResult> {
  const { delay = 100, immediate = false } = options;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let latestArgs: TArgs | undefined;
  let pending: Array<{ resolve: (value: TResult) => void; reject: (reason?: unknown) => void }> = [];

  const flush = async () => {
    const resolvers = pending;
    pending = [];
    timer = undefined;

    if (!latestArgs) {
      return;
    }

    try {
      const result = await requester(...latestArgs);
      resolvers.forEach(item => item.resolve(result));
    } catch (error) {
      resolvers.forEach(item => item.reject(error));
    }
  };

  return (...args: TArgs) => {
    latestArgs = args;

    return new Promise<TResult>((resolve, reject) => {
      pending.push({ resolve, reject });

      const shouldCallImmediately = immediate && !timer;
      if (timer) {
        clearTimeout(timer);
      }

      if (shouldCallImmediately) {
        void flush();
        timer = setTimeout(() => {
          timer = undefined;
        }, delay);
        return;
      }

      timer = setTimeout(() => {
        void flush();
      }, delay);
    });
  };
}

export function useThrottle<TArgs extends unknown[], TResult>(
  requester: AsyncFn<TArgs, TResult>,
  options: ThrottleOptions = {},
): AsyncFn<TArgs, TResult> {
  const { interval = 100 } = options;
  let active = false;
  let trailingArgs: TArgs | undefined;
  let trailingResolvers: Array<{ resolve: (value: TResult) => void; reject: (reason?: unknown) => void }> = [];

  const run = async (args: TArgs, resolvers: typeof trailingResolvers) => {
    active = true;

    try {
      const result = await requester(...args);
      resolvers.forEach(item => item.resolve(result));
    } catch (error) {
      resolvers.forEach(item => item.reject(error));
    } finally {
      setTimeout(() => {
        active = false;

        if (trailingArgs) {
          const nextArgs = trailingArgs;
          const nextResolvers = trailingResolvers;
          trailingArgs = undefined;
          trailingResolvers = [];
          void run(nextArgs, nextResolvers);
        }
      }, interval);
    }
  };

  return (...args: TArgs) => {
    return new Promise<TResult>((resolve, reject) => {
      if (!active) {
        void run(args, [{ resolve, reject }]);
        return;
      }

      trailingArgs = args;
      trailingResolvers.push({ resolve, reject });
    });
  };
}
