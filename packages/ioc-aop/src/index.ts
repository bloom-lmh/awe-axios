import 'reflect-metadata';

export type Constructor<T = any> = new (...args: any[]) => T;

export type ModuleKey = string | symbol;

export type InstanceScope = 'SINGLETON' | 'TRANSIENT' | 'PROTOTYPE' | 'SHALLOWCLONE' | 'DEEPCLONE';

export interface InstanceItem<T = unknown> {
  module: ModuleKey;
  alias: string;
  ctor: Constructor<T>;
  ctorName: string;
  instance?: T;
  methodNames: string[];
}

export interface InstanceRegisterConfig {
  module?: ModuleKey;
  alias?: string;
  ctor: Constructor;
}

export interface GetInstanceConfig {
  module?: ModuleKey;
  alias?: string;
  ctor?: Constructor;
  scope?: InstanceScope;
}

export type InjectBackups = Constructor | object | Array<Constructor | object>;

export type InjectDecoratorOptions =
  | string
  | Constructor
  | (GetInstanceConfig & {
      backups?: InjectBackups;
    });

export type ComponentDecoratorOptions =
  | string
  | {
      module?: ModuleKey;
      alias?: string;
    }
  | undefined;

export interface CandidateInstances {
  count: number;
  candidates: InstanceItem[];
  best?: InstanceItem;
}

export type PointCutExpression = string;

export type PointCutMethod = (...args: any[]) => PointCutExpression;

export type AdviceType = 'before' | 'after' | 'around' | 'afterReturning' | 'afterThrowing';

const DEFAULT_MODULE: ModuleKey = '__default__';

function isPromiseLike<T = unknown>(value: unknown): value is PromiseLike<T> {
  return typeof value === 'object' && value !== null && typeof (value as PromiseLike<T>).then === 'function';
}

function runSeries<T>(items: T[], runner: (item: T) => unknown, index: number = 0): unknown {
  if (index >= items.length) {
    return undefined;
  }

  const result = runner(items[index]);
  if (isPromiseLike(result)) {
    return Promise.resolve(result).then(() => runSeries(items, runner, index + 1));
  }

  return runSeries(items, runner, index + 1);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map(item => deepClone(item, seen)) as T;
  }

  if (seen.has(value)) {
    return seen.get(value) as T;
  }

  const clone = Object.create(Object.getPrototypeOf(value));
  seen.set(value, clone);

  for (const key of Reflect.ownKeys(value)) {
    (clone as Record<PropertyKey, unknown>)[key] = deepClone(
      (value as Record<PropertyKey, unknown>)[key],
      seen,
    );
  }

  return clone;
}

function defaultAlias(ctor: Constructor): string {
  const { name } = ctor;
  if (!name) {
    return 'anonymous';
  }

  if (name.length > 1 && name[1] === name[1].toUpperCase()) {
    return name;
  }

  return name[0].toLowerCase() + name.slice(1);
}

function ownMethodNames(ctor: Constructor): string[] {
  return Object.getOwnPropertyNames(ctor.prototype).filter(name => {
    return name !== 'constructor' && typeof ctor.prototype[name] === 'function';
  });
}

export class ProxyFactory {
  private static readonly originalMap = new WeakMap<Function, Function>();

  static registerInvoke(proxy: Function, original: Function) {
    this.originalMap.set(proxy, original);
  }

  static getInvoke(proxy: Function) {
    return this.originalMap.get(proxy);
  }
}

class Container {
  private readonly instanceItemMap = new Map<ModuleKey, InstanceItem[]>();

  registerInstance(config: InstanceRegisterConfig) {
    const module = config.module ?? DEFAULT_MODULE;
    const alias = config.alias ?? defaultAlias(config.ctor);
    const items = this.instanceItemMap.get(module) ?? [];
    const existing = items.find(item => item.alias === alias || item.ctor === config.ctor);

    if (existing) {
      if (existing.ctor === config.ctor && existing.alias === alias) {
        return existing;
      }

      throw new Error(`Instance "${alias}" already exists in module "${String(module)}".`);
    }

    const item: InstanceItem = {
      module,
      alias,
      ctor: config.ctor,
      ctorName: config.ctor.name,
      methodNames: ownMethodNames(config.ctor),
    };

    items.push(item);
    this.instanceItemMap.set(module, items);
    return item;
  }

  getInstance(target: object, propertyKey: string | symbol, config: GetInstanceConfig) {
    const module = config.module ?? DEFAULT_MODULE;
    const scope = (config.scope ?? 'TRANSIENT').toUpperCase() as InstanceScope;

    const item =
      (config.ctor && this.getInstanceItemByCtor(module, config.ctor)) ||
      (config.alias && this.getInstanceItemByAlias(module, config.alias)) ||
      this.getInstanceItemByType(Reflect.getMetadata('design:type', target, propertyKey), module);

    if (!item) {
      return undefined;
    }

    if (!item.instance) {
      item.instance = new item.ctor();
    }

    if (scope === 'SINGLETON') {
      return item.instance;
    }

    if (scope === 'TRANSIENT') {
      return new item.ctor();
    }

    if (scope === 'PROTOTYPE') {
      return Object.create(item.instance as object);
    }

    if (scope === 'SHALLOWCLONE') {
      return Object.assign(Object.create(Object.getPrototypeOf(item.instance as object)), item.instance);
    }

    return deepClone(item.instance);
  }

  getInstanceItemByCtor(module: ModuleKey, ctor: Constructor) {
    return this.instanceItemMap.get(module)?.find(item => item.ctor === ctor);
  }

  getInstanceItemByAlias(module: ModuleKey, alias: string) {
    return this.instanceItemMap.get(module)?.find(item => item.alias === alias);
  }

  getInstanceItemByExpression(expression: string) {
    const [first, second] = expression.split('.');
    if (!second) {
      return this.getInstanceItemByAlias(DEFAULT_MODULE, first);
    }

    return this.getInstanceItemByAlias(first, second);
  }

  getInstanceItemByType(type: Constructor | undefined, module: ModuleKey = DEFAULT_MODULE) {
    if (!type) {
      return undefined;
    }

    const { count, candidates, best } = this.countCandidates(type, module);
    if (count === 0) {
      return undefined;
    }

    if (count === 1) {
      return candidates[0];
    }

    if (best) {
      return best;
    }

    throw new Error(`Multiple candidates found for "${type.name}" in module "${String(module)}".`);
  }

  getInstanceItemList(excludedModules: ModuleKey[] = []) {
    const items: InstanceItem[] = [];
    for (const [module, registrations] of this.instanceItemMap.entries()) {
      if (excludedModules.includes(module)) {
        continue;
      }

      items.push(...registrations);
    }
    return items;
  }

  countCandidates(type: Constructor, module: ModuleKey = DEFAULT_MODULE): CandidateInstances {
    const candidates =
      this.instanceItemMap
        .get(module)
        ?.filter(item => item.ctor === type || item.ctor.prototype instanceof type) ?? [];

    return {
      count: candidates.length,
      candidates,
      best: candidates.find(item => item.ctor === type),
    };
  }
}

const container = new Container();

export class InstanceFactory {
  static registerInstance(config: InstanceRegisterConfig) {
    return container.registerInstance(config);
  }

  static getInstance(target: object, propertyKey: string | symbol, config: GetInstanceConfig) {
    return container.getInstance(target, propertyKey, config);
  }

  static getInstanceItemByCtor(module: ModuleKey, ctor: Constructor) {
    return container.getInstanceItemByCtor(module, ctor);
  }

  static getInstanceItemByAlias(module: ModuleKey, alias: string) {
    return container.getInstanceItemByAlias(module, alias);
  }

  static getInstanceItemByExpression(expression: string) {
    return container.getInstanceItemByExpression(expression);
  }

  static getInstanceItemByType(type: Constructor | undefined, module: ModuleKey = DEFAULT_MODULE) {
    return container.getInstanceItemByType(type, module);
  }

  static getInstanceItemList(excludedModules: ModuleKey[] = []) {
    return container.getInstanceItemList(excludedModules);
  }

  static countCandidates(type: Constructor, module: ModuleKey = DEFAULT_MODULE) {
    return container.countCandidates(type, module);
  }

  static getDefaultAlias(ctor: Constructor) {
    return defaultAlias(ctor);
  }
}

function normalizeComponentOptions(options: ComponentDecoratorOptions): { module?: ModuleKey; alias?: string } {
  if (!options) {
    return {};
  }

  if (typeof options === 'string') {
    const [module, alias] = options.split('.');
    return alias ? { module, alias } : { alias: module };
  }

  return options;
}

function normalizeInjectOptions(options: InjectDecoratorOptions): GetInstanceConfig & { backups?: InjectBackups } {
  if (typeof options === 'string') {
    const byExpression = container.getInstanceItemByExpression(options);
    if (byExpression) {
      return {
        module: byExpression.module,
        alias: byExpression.alias,
        scope: 'TRANSIENT',
      };
    }

    const [module, alias] = options.split('.');
    return alias ? { module, alias, scope: 'TRANSIENT' } : { alias: module, scope: 'TRANSIENT' };
  }

  if (typeof options === 'function') {
    return {
      ctor: options,
      scope: 'TRANSIENT',
    };
  }

  return {
    module: DEFAULT_MODULE,
    scope: 'TRANSIENT',
    ...(options ?? {}),
  };
}

function resolveBackup(backups: InjectBackups | undefined): unknown {
  if (!backups) {
    return undefined;
  }

  const list = Array.isArray(backups) ? backups : [backups];
  for (const backup of list) {
    if (typeof backup === 'function') {
      try {
        return new backup();
      } catch {
        continue;
      }
    }

    if (isPlainObject(backup) || typeof backup === 'object') {
      return backup;
    }
  }

  return undefined;
}

const componentRegistry = new Set<Constructor>();

export function Component(options?: ComponentDecoratorOptions): ClassDecorator {
  return target => {
    const ctor = target as unknown as Constructor;
    const normalized = normalizeComponentOptions(options);
    InstanceFactory.registerInstance({
      module: normalized.module,
      alias: normalized.alias,
      ctor,
    });
    componentRegistry.add(ctor);
    weaveComponent(ctor);
  };
}

export function Inject(options: InjectDecoratorOptions = {}): PropertyDecorator {
  const normalized = normalizeInjectOptions(options);

  return (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get() {
        const instance =
          InstanceFactory.getInstance(target, propertyKey, normalized) ?? resolveBackup(normalized.backups);

        Object.defineProperty(this, propertyKey, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: instance,
        });

        return instance;
      },
      set(value) {
        Object.defineProperty(this, propertyKey, {
          configurable: true,
          enumerable: true,
          writable: true,
          value,
        });
      },
    });
  };
}

type AdviceMetadata = {
  type: AdviceType;
  pointcut: PointCutExpression | PointCutMethod;
  methodName: string | symbol;
};

type RegisteredAdvice = {
  aspectCtor: Constructor;
  adviceType: AdviceType;
  adviceMethodName: string | symbol;
  matcher: (className: string, methodName: string) => boolean;
  order: number;
};

const adviceMetadataStore = new WeakMap<object, AdviceMetadata[]>();
const registeredAdvices: RegisteredAdvice[] = [];

function wildcardToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function compileMatcher(pointcut: PointCutExpression | PointCutMethod) {
  const resolved = typeof pointcut === 'function' ? pointcut() : pointcut;
  const segments = resolved.split('.');
  const [classPattern, methodPattern] =
    segments.length === 1
      ? ['*', segments[0]]
      : segments.length === 2
        ? segments
        : [segments[segments.length - 2], segments[segments.length - 1]];

  const classRegExp = wildcardToRegExp(classPattern || '*');
  const methodRegExp = wildcardToRegExp(methodPattern || '*');

  return (className: string, methodName: string) => {
    return classRegExp.test(className) && methodRegExp.test(methodName);
  };
}

function pushAdviceMetadata(target: object, metadata: AdviceMetadata) {
  const current = adviceMetadataStore.get(target) ?? [];
  current.push(metadata);
  adviceMetadataStore.set(target, current);
}

function createAdviceDecorator(type: AdviceType) {
  return (pointcut: PointCutExpression | PointCutMethod): MethodDecorator => {
    return (target, propertyKey) => {
      if (propertyKey === undefined) {
        throw new Error(`${type} advice can only be used on instance methods.`);
      }

      pushAdviceMetadata(target, {
        type,
        pointcut,
        methodName: propertyKey,
      });
    };
  };
}

export class AspectContext {
  result?: unknown;

  error?: unknown;

  constructor(
    public readonly target: Function,
    public readonly thisArg: unknown,
    public readonly methodName: string,
    public readonly args: unknown[],
  ) {}
}

export class AdviceChain {
  constructor(private readonly next: (context: AspectContext) => unknown) {}

  proceed(context: AspectContext) {
    return this.next(context);
  }
}

function resolveAspectInstance(ctor: Constructor) {
  InstanceFactory.registerInstance({
    ctor,
    module: DEFAULT_MODULE,
  });

  const holder = { aspect: undefined };
  return InstanceFactory.getInstance(holder, 'aspect', {
    ctor,
    scope: 'SINGLETON',
    module: DEFAULT_MODULE,
  });
}

function invokeAdvice(advice: RegisteredAdvice, context: AspectContext, extra?: unknown) {
  const aspectInstance = resolveAspectInstance(advice.aspectCtor) as Record<string | symbol, Function>;
  const method = aspectInstance[advice.adviceMethodName];

  if (advice.adviceType === 'around') {
    return method.call(aspectInstance, context, extra);
  }

  if (advice.adviceType === 'afterReturning' || advice.adviceType === 'afterThrowing') {
    return method.call(aspectInstance, context, extra);
  }

  return method.call(aspectInstance, context);
}

function weaveMethod(ctor: Constructor, methodName: string) {
  const descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, methodName);
  if (!descriptor || typeof descriptor.value !== 'function') {
    return;
  }

  const current = descriptor.value;
  const original = ProxyFactory.getInvoke(current) ?? current;
  const matched = registeredAdvices
    .filter(advice => advice.matcher(ctor.name, methodName))
    .sort((left, right) => left.order - right.order);

  if (matched.length === 0) {
    if (current !== original) {
      Object.defineProperty(ctor.prototype, methodName, {
        ...descriptor,
        value: original,
      });
    }
    return;
  }

  const before = matched.filter(item => item.adviceType === 'before');
  const after = matched.filter(item => item.adviceType === 'after');
  const around = matched.filter(item => item.adviceType === 'around');
  const afterReturning = matched.filter(item => item.adviceType === 'afterReturning');
  const afterThrowing = matched.filter(item => item.adviceType === 'afterThrowing');

  const wrapped = function (this: unknown, ...args: unknown[]) {
    const context = new AspectContext(original, this, methodName, args);

    const invokeCore = (): unknown => {
      const beforeResult = runSeries(before, advice => invokeAdvice(advice, context));
      if (isPromiseLike(beforeResult)) {
        return Promise.resolve(beforeResult).then(() => invokeOriginal());
      }

      return invokeOriginal();
    };

    const finalizeSuccess = (result: unknown) => {
      context.result = result;
      const afterReturningResult = runSeries(afterReturning, advice => invokeAdvice(advice, context, result));
      const runAfter = () => {
        const afterResult = runSeries(after, advice => invokeAdvice(advice, context));
        if (isPromiseLike(afterResult)) {
          return Promise.resolve(afterResult).then(() => result);
        }
        return result;
      };

      if (isPromiseLike(afterReturningResult)) {
        return Promise.resolve(afterReturningResult).then(runAfter);
      }

      return runAfter();
    };

    const finalizeError = (error: unknown) => {
      context.error = error;
      const throwingResult = runSeries(afterThrowing, advice => invokeAdvice(advice, context, error));
      const runAfter = () => {
        const afterResult = runSeries(after, advice => invokeAdvice(advice, context));
        if (isPromiseLike(afterResult)) {
          return Promise.resolve(afterResult).then(() => {
            throw error;
          });
        }
        throw error;
      };

      if (isPromiseLike(throwingResult)) {
        return Promise.resolve(throwingResult).then(runAfter);
      }

      return runAfter();
    };

    const invokeOriginal = (): unknown => {
      try {
        const result = original.apply(this, args);
        if (isPromiseLike(result)) {
          return Promise.resolve(result).then(finalizeSuccess, finalizeError);
        }
        return finalizeSuccess(result);
      } catch (error) {
        return finalizeError(error);
      }
    };

    const invokeAround = (index: number): unknown => {
      if (index >= around.length) {
        return invokeCore();
      }

      const advice = around[index];
      return invokeAdvice(
        advice,
        context,
        new AdviceChain(() => invokeAround(index + 1)),
      );
    };

    return invokeAround(0);
  };

  ProxyFactory.registerInvoke(wrapped, original);
  Object.defineProperty(ctor.prototype, methodName, {
    ...descriptor,
    value: wrapped,
  });
}

function weaveComponent(ctor: Constructor) {
  const methodNames = ownMethodNames(ctor);
  methodNames.forEach(methodName => {
    weaveMethod(ctor, methodName);
  });
}

export function Aspect(order: number = 5): ClassDecorator {
  return target => {
    const aspectCtor = target as unknown as Constructor;
    InstanceFactory.registerInstance({
      ctor: aspectCtor,
      module: DEFAULT_MODULE,
    });

    const metadata = adviceMetadataStore.get(aspectCtor.prototype) ?? [];
    registeredAdvices.push(
      ...metadata.map(item => ({
        aspectCtor,
        adviceType: item.type,
        adviceMethodName: item.methodName,
        matcher: compileMatcher(item.pointcut),
        order,
      })),
    );

    componentRegistry.forEach(component => {
      weaveComponent(component);
    });
  };
}

export const Before = createAdviceDecorator('before');
export const After = createAdviceDecorator('after');
export const Around = createAdviceDecorator('around');
export const AfterReturning = createAdviceDecorator('afterReturning');
export const AfterThrowing = createAdviceDecorator('afterThrowing');
