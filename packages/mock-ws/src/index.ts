import {
  type RequestHandler,
  type WebSocketData,
  type WebSocketHandler,
  ws,
} from 'msw';

export type MockWebSocketHandler = WebSocketHandler;
export type MockWebSocketUrl = Parameters<typeof ws.link>[0];
export type MockWebSocketLink = ReturnType<typeof ws.link>;
export type MockWebSocketMethodKey = string | symbol;
export type MockWebSocketConstructor<T = object> = new (...args: any[]) => T;
export type DecoratedWebSocketMock<T = object> = MockWebSocketConstructor<T> | T;
export type WebSocketMockState = Record<string, unknown>;
export type WebSocketMockStateInitializer = WebSocketMockState | (() => WebSocketMockState);

export interface WebSocketMockConfig {
  url: MockWebSocketUrl;
  state?: WebSocketMockStateInitializer;
}

export type WebSocketMockResponseSerializer = 'raw' | 'json';

export interface WebSocketMockAckConfig {
  correlationKey?: string;
  correlationPath?: string;
  includeUndefined?: boolean;
  payloadKey?: string;
  type: string;
}

export interface WebSocketMockErrorResponseConfig {
  correlationKey?: string;
  correlationPath?: string;
  detailsKey?: string;
  messageKey?: string;
  rethrow?: boolean;
  type: string;
}

export interface WebSocketMockResponseConfig {
  ack?: WebSocketMockAckConfig;
  error?: WebSocketMockErrorResponseConfig;
  serializer?: WebSocketMockResponseSerializer;
}

export interface WebSocketMockMethodConfig {
  messageType?: string;
  response?: WebSocketMockResponseConfig;
  guards?: WebSocketMockMethodGuard[];
  statePatch?: 'merge';
}

export interface WebSocketMockConnectionInfo {
  protocols: string | string[] | undefined;
}

export interface WebSocketMockClientConnection {
  readonly url: URL;
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<WebSocketData>) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'close',
    listener: (event: CloseEvent) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'message',
    listener: (event: MessageEvent<WebSocketData>) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: 'close',
    listener: (event: CloseEvent) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  send(data: WebSocketData): void;
  close(code?: number, reason?: string): void;
}

export interface WebSocketMockServerConnection {
  addEventListener(
    type: 'open',
    listener: (event: Event) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<WebSocketData>) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'error',
    listener: (event: Event) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'close',
    listener: (event: CloseEvent) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'open',
    listener: (event: Event) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: 'message',
    listener: (event: MessageEvent<WebSocketData>) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: 'error',
    listener: (event: Event) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: 'close',
    listener: (event: CloseEvent) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  connect(): void;
  send(data: WebSocketData): void;
  close(): void;
}

export interface WebSocketMockConnectionContext {
  client: WebSocketMockClientConnection;
  server: WebSocketMockServerConnection;
  info: WebSocketMockConnectionInfo;
  params: Record<string, string>;
  state: WebSocketMockState;
}

export interface WebSocketMockEventContext<TEvent extends Event = Event> extends WebSocketMockConnectionContext {
  event: TEvent;
}

export type WebSocketMockGuardContext = WebSocketMockConnectionContext | WebSocketMockEventContext;
export type WebSocketMockMethodGuard = (context: WebSocketMockGuardContext) => boolean | Promise<boolean>;
export type WebSocketMockJsonGuard = (
  payload: unknown,
  context: WebSocketMockGuardContext,
) => boolean | Promise<boolean>;
export type WebSocketMockJsonMatcher = Record<string, unknown> | unknown[];

export type WebSocketMockClientMessageContext = WebSocketMockEventContext<MessageEvent<WebSocketData>>;
export type WebSocketMockClientCloseContext = WebSocketMockEventContext<CloseEvent>;
export type WebSocketMockServerOpenContext = WebSocketMockEventContext<Event>;
export type WebSocketMockServerMessageContext = WebSocketMockEventContext<MessageEvent<WebSocketData>>;
export type WebSocketMockServerErrorContext = WebSocketMockEventContext<Event>;
export type WebSocketMockServerCloseContext = WebSocketMockEventContext<CloseEvent>;

type WebSocketMockEventKind =
  | 'connection'
  | 'client:message'
  | 'client:close'
  | 'server:open'
  | 'server:message'
  | 'server:error'
  | 'server:close';

export type WebSocketParamBindingKind =
  | 'context'
  | 'client'
  | 'server'
  | 'event'
  | 'data'
  | 'json'
  | 'params'
  | 'path'
  | 'info'
  | 'protocols'
  | 'state';

export interface WebSocketParamBinding {
  index: number;
  kind: WebSocketParamBindingKind;
  name?: string;
}

interface StoredEventBinding {
  kind: WebSocketMockEventKind;
}

interface StoredMethodConfig extends WebSocketMockMethodConfig {}

interface CollectedEventBinding extends StoredEventBinding {
  config: StoredMethodConfig;
  paramBindings: WebSocketParamBinding[];
  propertyKey: MockWebSocketMethodKey;
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

const classConfigStore = new WeakMap<object, WebSocketMockConfig>();
const methodBindingStore = new WeakMap<object, Map<MockWebSocketMethodKey, StoredEventBinding[]>>();
const methodConfigStore = new WeakMap<object, Map<MockWebSocketMethodKey, StoredMethodConfig>>();
const paramBindingStore = new WeakMap<object, Map<MockWebSocketMethodKey, WebSocketParamBinding[]>>();
const jsonPayloadCache = new WeakMap<object, Promise<unknown>>();

function isWebSocketMockConfig(value: WebSocketMockConfig | MockWebSocketUrl): value is WebSocketMockConfig {
  return typeof value === 'object' && value !== null && !(value instanceof RegExp) && 'url' in value;
}

function normalizeWebSocketMockConfig(config: WebSocketMockConfig | MockWebSocketUrl): WebSocketMockConfig {
  return isWebSocketMockConfig(config) ? config : { url: config };
}

function cloneWebSocketState<TState extends WebSocketMockState>(state: TState): TState {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(state);
    } catch {
      return { ...state };
    }
  }

  return { ...state };
}

function resolveConnectionState(initializer: WebSocketMockStateInitializer | undefined): WebSocketMockState {
  if (initializer === undefined) {
    return {};
  }

  const state = typeof initializer === 'function' ? initializer() : cloneWebSocketState(initializer);
  if (!isRecord(state)) {
    throw new Error('WebSocket state initializer must return a plain object.');
  }

  return state;
}

function addMethodBinding(target: object, propertyKey: MockWebSocketMethodKey, binding: StoredEventBinding) {
  const current = methodBindingStore.get(target) ?? new Map<MockWebSocketMethodKey, StoredEventBinding[]>();
  const methodBindings = current.get(propertyKey) ?? [];
  methodBindings.push(binding);
  current.set(propertyKey, methodBindings);
  methodBindingStore.set(target, current);
}

function mergeWebSocketMethodConfig(
  base: StoredMethodConfig,
  patch: Partial<WebSocketMockMethodConfig>,
): StoredMethodConfig {
  const next: StoredMethodConfig = {
    ...base,
    ...patch,
  };

  if (base.response || patch.response) {
    next.response = {
      ...(base.response ?? {}),
      ...(patch.response ?? {}),
    };

    const ackType = patch.response?.ack?.type ?? base.response?.ack?.type;
    if (ackType) {
      next.response.ack = {
        ...(base.response?.ack ?? {}),
        ...(patch.response?.ack ?? {}),
        type: ackType,
      };
    }

    const errorType = patch.response?.error?.type ?? base.response?.error?.type;
    if (errorType) {
      next.response.error = {
        ...(base.response?.error ?? {}),
        ...(patch.response?.error ?? {}),
        type: errorType,
      };
    }
  }

  if (base.guards || patch.guards) {
    next.guards = [...(base.guards ?? []), ...(patch.guards ?? [])];
  }

  return next;
}

function mergeMethodConfig(
  target: object,
  propertyKey: MockWebSocketMethodKey,
  patch: Partial<WebSocketMockMethodConfig>,
): StoredMethodConfig {
  const current = methodConfigStore.get(target) ?? new Map<MockWebSocketMethodKey, StoredMethodConfig>();
  const next = mergeWebSocketMethodConfig(current.get(propertyKey) ?? {}, patch);
  current.set(propertyKey, next);
  methodConfigStore.set(target, current);
  return next;
}

function addParamBinding(target: object, propertyKey: MockWebSocketMethodKey, binding: WebSocketParamBinding) {
  const current = paramBindingStore.get(target) ?? new Map<MockWebSocketMethodKey, WebSocketParamBinding[]>();
  const bindings = current.get(propertyKey) ?? [];
  bindings.push(binding);
  bindings.sort((left, right) => left.index - right.index);
  current.set(propertyKey, bindings);
  paramBindingStore.set(target, current);
}

function getClassConfig(target: object): WebSocketMockConfig | undefined {
  return classConfigStore.get(target);
}

function collectMethodConfig(target: object, propertyKey: MockWebSocketMethodKey): StoredMethodConfig {
  const chain: object[] = [];
  let current: object | null = target;

  while (current && current !== Object.prototype) {
    chain.unshift(current);
    current = Object.getPrototypeOf(current);
  }

  const config: StoredMethodConfig = {};

  for (const level of chain) {
    const levelConfig = methodConfigStore.get(level)?.get(propertyKey);
    if (!levelConfig) {
      continue;
    }

    Object.assign(config, mergeWebSocketMethodConfig(config, levelConfig));
  }

  return config;
}

function collectParamBindings(target: object, propertyKey: MockWebSocketMethodKey): WebSocketParamBinding[] {
  const chain: object[] = [];
  let current: object | null = target;

  while (current && current !== Object.prototype) {
    chain.unshift(current);
    current = Object.getPrototypeOf(current);
  }

  const bindings: WebSocketParamBinding[] = [];

  for (const level of chain) {
    const levelBindings = paramBindingStore.get(level)?.get(propertyKey);
    if (!levelBindings) {
      continue;
    }

    bindings.push(...levelBindings);
  }

  bindings.sort((left, right) => left.index - right.index);

  return bindings;
}

function collectMethodBindings(target: object): CollectedEventBinding[] {
  const chain: object[] = [];
  let current: object | null = target;

  while (current && current !== Object.prototype) {
    chain.unshift(current);
    current = Object.getPrototypeOf(current);
  }

  const bindings: CollectedEventBinding[] = [];

  for (const level of chain) {
    const map = methodBindingStore.get(level);
    if (!map) {
      continue;
    }

    for (const [propertyKey, methodBindings] of map.entries()) {
      const config = collectMethodConfig(target, propertyKey);
      const paramBindings = collectParamBindings(target, propertyKey);

      bindings.push(
        ...methodBindings.map(binding => ({
          config,
          paramBindings,
          propertyKey,
          ...binding,
        })),
      );
    }
  }

  return bindings;
}

function createMethodDecorator(kind: WebSocketMockEventKind, label: string) {
  return (): MethodDecorator => {
    return (target, propertyKey, descriptor) => {
      if (propertyKey === undefined || descriptor === undefined) {
        throw new Error(`"${label}" can only be used on instance methods.`);
      }

      if (typeof descriptor.value !== 'function') {
        throw new Error(`"${String(propertyKey)}" must be a method to use "${label}".`);
      }

      addMethodBinding(target, propertyKey, { kind });
    };
  };
}

function createParamDecorator(
  kind: WebSocketParamBindingKind,
  label: string,
  name?: string,
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey === undefined) {
      throw new Error(`"${label}" can only be used on instance methods.`);
    }

    addParamBinding(target, propertyKey, {
      index: parameterIndex,
      kind,
      name,
    });
  };
}

function resolveDecoratedMock<T extends object>(
  definition: DecoratedWebSocketMock<T>,
): { ctor: MockWebSocketConstructor<T>; instance: T } {
  if (typeof definition === 'function') {
    return {
      ctor: definition as MockWebSocketConstructor<T>,
      instance: new (definition as MockWebSocketConstructor<T>)(),
    };
  }

  if (!definition || typeof definition !== 'object') {
    throw new Error('Expected a decorated WebSocket mock class or instance.');
  }

  const ctor = definition.constructor as MockWebSocketConstructor<T> | undefined;
  if (typeof ctor !== 'function') {
    throw new Error('Expected a decorated WebSocket mock instance with a valid constructor.');
  }

  return {
    ctor,
    instance: definition,
  };
}

function normalizeParams(params: Record<string, unknown> | null | undefined): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params ?? {})) {
    if (Array.isArray(value)) {
      normalized[key] = value.length > 0 ? String(value[value.length - 1]) : '';
      continue;
    }

    normalized[key] = String(value);
  }

  return normalized;
}

function hasEventContext(
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
): context is WebSocketMockEventContext {
  return 'event' in context;
}

function isMessageEventLike(event: Event): event is MessageEvent<WebSocketData> {
  return typeof event === 'object' && event !== null && 'data' in event;
}

function isMessageEventKind(kind: WebSocketMockEventKind): kind is 'client:message' | 'server:message' {
  return kind === 'client:message' || kind === 'server:message';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getValueAtPath(source: unknown, path: string): unknown {
  const segments = path.split('.').filter(Boolean);
  let current = source;

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function isDeepPartialMatch(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      return false;
    }

    return expected.every((item, index) => isDeepPartialMatch(actual[index], item));
  }

  if (isRecord(expected)) {
    if (!isRecord(actual)) {
      return false;
    }

    return Object.entries(expected).every(([key, value]) => isDeepPartialMatch(actual[key], value));
  }

  return Object.is(actual, expected);
}

function isWebSocketSendable(data: unknown): data is WebSocketData {
  if (typeof data === 'string') {
    return true;
  }

  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return true;
  }

  return typeof Blob !== 'undefined' && data instanceof Blob;
}

function getMessageEvent(
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
  label: string,
): MessageEvent<WebSocketData> {
  if (!hasEventContext(context) || !isMessageEventLike(context.event)) {
    throw new Error(`"${label}" can only be used on WebSocket message handlers.`);
  }

  return context.event;
}

function decodeBinaryWebSocketData(data: ArrayBuffer | ArrayBufferView): string {
  const view =
    data instanceof ArrayBuffer
      ? new Uint8Array(data)
      : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

  return new TextDecoder().decode(view);
}

async function readWebSocketDataAsText(data: WebSocketData): Promise<string> {
  if (typeof data === 'string') {
    return data;
  }

  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return decodeBinaryWebSocketData(data);
  }

  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return data.text();
  }

  throw new Error('Unsupported WebSocket message data type.');
}

async function resolveJsonPayload(event: MessageEvent<WebSocketData>): Promise<unknown> {
  const cached = jsonPayloadCache.get(event);
  if (cached) {
    return cached;
  }

  const pending = (async () => {
    const source = await readWebSocketDataAsText(event.data);

    try {
      return JSON.parse(source);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse WebSocket JSON payload: ${reason}`);
    }
  })();

  jsonPayloadCache.set(event, pending);

  return pending;
}

async function resolveParamBinding(
  binding: WebSocketParamBinding,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
): Promise<unknown> {
  switch (binding.kind) {
    case 'context':
      return context;
    case 'client':
      return context.client;
    case 'server':
      return context.server;
    case 'event':
      return hasEventContext(context) ? context.event : undefined;
    case 'data':
      return getMessageEvent(context, 'WsData').data;
    case 'json': {
      const payload = await resolveJsonPayload(getMessageEvent(context, 'WsJsonData'));
      return binding.name === undefined ? payload : getValueAtPath(payload, binding.name);
    }
    case 'params':
      return binding.name === undefined ? context.params : getValueAtPath(context.params, binding.name);
    case 'path':
      return context.params[binding.name ?? ''];
    case 'info':
      return context.info;
    case 'protocols':
      return context.info.protocols;
    case 'state':
      return binding.name === undefined ? context.state : getValueAtPath(context.state, binding.name);
  }
}

async function resolveDecoratedArguments(
  bindings: WebSocketParamBinding[],
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
): Promise<unknown[]> {
  const size = bindings.reduce((max, binding) => Math.max(max, binding.index), -1) + 1;
  const args = new Array<unknown>(size).fill(undefined);

  for (const binding of bindings) {
    args[binding.index] = await resolveParamBinding(binding, context);
  }

  return args;
}

async function shouldInvokeDecoratedMethod(
  binding: CollectedEventBinding,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
): Promise<boolean> {
  if (binding.config.messageType) {
    try {
      const payload = await resolveJsonPayload(getMessageEvent(context, 'WsMessageType'));
      if (!isRecord(payload) || payload.type !== binding.config.messageType) {
        return false;
      }
    } catch {
      return false;
    }
  }

  for (const guard of binding.config.guards ?? []) {
    if (!(await guard(context))) {
      return false;
    }
  }

  return true;
}

function serializeDecoratedResponse(binding: CollectedEventBinding, result: unknown): WebSocketData {
  const serializer = binding.config.response?.serializer ?? 'raw';

  if (serializer === 'json') {
    return JSON.stringify(result);
  }

  if (!isWebSocketSendable(result)) {
    throw new Error(
      `"${String(binding.propertyKey)}" uses "@WsSend()" but returned a value that is not valid WebSocket data.`,
    );
  }

  return result;
}

async function resolveDecoratedCorrelationValue(
  correlationPath: string | undefined,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
): Promise<unknown> {
  if (!correlationPath) {
    return undefined;
  }

  try {
    const payload = await resolveJsonPayload(getMessageEvent(context, 'WsCorrelation'));
    return getValueAtPath(payload, correlationPath);
  } catch {
    return undefined;
  }
}

function createDecoratedAckPayload(binding: CollectedEventBinding, result: unknown): unknown {
  const ack = binding.config.response?.ack;
  if (!ack) {
    return result;
  }

  const payload: Record<string, unknown> = {
    type: ack.type,
  };

  if (result !== undefined || ack.includeUndefined) {
    payload[ack.payloadKey ?? 'data'] = result;
  }

  return payload;
}

async function createDecoratedAckEnvelope(
  binding: CollectedEventBinding,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
  result: unknown,
): Promise<unknown> {
  const payload = createDecoratedAckPayload(binding, result);
  const ack = binding.config.response?.ack;

  if (!ack || !isRecord(payload)) {
    return payload;
  }

  const correlationValue = await resolveDecoratedCorrelationValue(ack.correlationPath, context);
  if (correlationValue !== undefined) {
    payload[ack.correlationKey ?? 'requestId'] = correlationValue;
  }

  return payload;
}

async function sendDecoratedResponse(
  binding: CollectedEventBinding,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
  result: unknown,
) {
  if (!binding.config.response || (result === undefined && !binding.config.response.ack)) {
    return;
  }

  const payload = await createDecoratedAckEnvelope(binding, context, result);
  context.client.send(serializeDecoratedResponse(binding, payload));
}

function patchDecoratedState(
  binding: CollectedEventBinding,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
  result: unknown,
) {
  if (binding.config.statePatch !== 'merge' || result === undefined) {
    return;
  }

  if (!isRecord(result)) {
    throw new Error(`"${String(binding.propertyKey)}" uses "@WsPatchState()" but returned a non-object value.`);
  }

  Object.assign(context.state, result);
}

function normalizeDecoratedErrorDetails(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
    };
  }

  return error;
}

async function createDecoratedErrorPayload(
  binding: CollectedEventBinding,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
  error: unknown,
): Promise<{ payload: unknown; rethrow: boolean } | null> {
  const config = binding.config.response?.error;
  if (!config) {
    return null;
  }

  const payload: Record<string, unknown> = {
    type: config.type,
    [config.messageKey ?? 'message']: error instanceof Error ? error.message : String(error),
  };

  if (config.detailsKey) {
    payload[config.detailsKey] = normalizeDecoratedErrorDetails(error);
  }

  const correlationValue = await resolveDecoratedCorrelationValue(config.correlationPath, context);
  if (correlationValue !== undefined) {
    payload[config.correlationKey ?? 'requestId'] = correlationValue;
  }

  return {
    payload,
    rethrow: config.rethrow ?? false,
  };
}

async function sendDecoratedErrorResponse(
  binding: CollectedEventBinding,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
  error: unknown,
): Promise<boolean> {
  const formatted = await createDecoratedErrorPayload(binding, context, error);
  if (!formatted) {
    return false;
  }

  context.client.send(serializeDecoratedResponse(binding, formatted.payload));
  return formatted.rethrow;
}

async function invokeDecoratedMethod(
  instance: object,
  binding: CollectedEventBinding,
  context: WebSocketMockConnectionContext | WebSocketMockEventContext,
) {
  if (!(await shouldInvokeDecoratedMethod(binding, context))) {
    return;
  }

  const method = (instance as Record<MockWebSocketMethodKey, unknown>)[binding.propertyKey];
  if (typeof method !== 'function') {
    throw new Error(`Decorated member "${String(binding.propertyKey)}" is not a callable method.`);
  }

  const args =
    binding.paramBindings.length > 0 ? await resolveDecoratedArguments(binding.paramBindings, context) : [context];

  try {
    const result = await method.call(instance, ...args);
    patchDecoratedState(binding, context, result);
    await sendDecoratedResponse(binding, context, result);
    return result;
  } catch (error) {
    if (await sendDecoratedErrorResponse(binding, context, error)) {
      throw error;
    }

    if (binding.config.response?.error) {
      return;
    }

    throw error;
  }
}

function validateCollectedBindings(bindings: CollectedEventBinding[], ctorName: string) {
  for (const binding of bindings) {
    if (binding.config.messageType && !isMessageEventKind(binding.kind)) {
      throw new Error(
        `"${ctorName}.${String(binding.propertyKey)}" uses "@WsMessageType(...)" but is not bound to a message event.`,
      );
    }

    const serializer = binding.config.response?.serializer ?? 'raw';
    if ((binding.config.response?.ack || binding.config.response?.error) && serializer !== 'json') {
      throw new Error(
        `"${ctorName}.${String(binding.propertyKey)}" uses envelope response decorators but is not configured for JSON responses.`,
      );
    }
  }
}

function reportDecoratedInvocationError(error: unknown) {
  const reason = error instanceof Error ? error : new Error(String(error));

  if (typeof queueMicrotask === 'function') {
    queueMicrotask(() => {
      throw reason;
    });
    return;
  }

  setTimeout(() => {
    throw reason;
  }, 0);
}

function attachCollectedBinding(
  binding: CollectedEventBinding,
  context: WebSocketMockConnectionContext,
  enqueueInvocation: (context: WebSocketMockConnectionContext | WebSocketMockEventContext) => void,
) {
  switch (binding.kind) {
    case 'connection':
      return;
    case 'client:message':
      context.client.addEventListener('message', event => {
        enqueueInvocation({ ...context, event });
      });
      return;
    case 'client:close':
      context.client.addEventListener('close', event => {
        enqueueInvocation({ ...context, event });
      });
      return;
    case 'server:open':
      context.server.addEventListener('open', event => {
        enqueueInvocation({ ...context, event });
      });
      return;
    case 'server:message':
      context.server.addEventListener('message', event => {
        enqueueInvocation({ ...context, event });
      });
      return;
    case 'server:error':
      context.server.addEventListener('error', event => {
        enqueueInvocation({ ...context, event });
      });
      return;
    case 'server:close':
      context.server.addEventListener('close', event => {
        enqueueInvocation({ ...context, event });
      });
      return;
  }
}

export function withWebSocketMockConfig(config: Partial<WebSocketMockConfig>): ClassDecorator {
  return target => {
    const ctor = target as unknown as object;
    const current = classConfigStore.get(ctor) ?? ({} as WebSocketMockConfig);
    classConfigStore.set(ctor, {
      ...current,
      ...config,
    });
  };
}

export function WebSocketMock(config: WebSocketMockConfig | MockWebSocketUrl): ClassDecorator {
  return withWebSocketMockConfig(normalizeWebSocketMockConfig(config));
}

export function withWebSocketState(state: WebSocketMockStateInitializer): ClassDecorator {
  return withWebSocketMockConfig({ state });
}

export function WebSocketState(state: WebSocketMockStateInitializer): ClassDecorator {
  return withWebSocketState(state);
}

export function withWebSocketMethodConfig(config: Partial<WebSocketMockMethodConfig>): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (propertyKey === undefined || descriptor === undefined) {
      throw new Error('WebSocket method config decorators can only be used on instance methods.');
    }

    if (typeof descriptor.value !== 'function') {
      throw new Error(`"${String(propertyKey)}" must be a method to use WebSocket method config decorators.`);
    }

    mergeMethodConfig(target, propertyKey, config);
  };
}

export function withWebSocketMethodGuards(...guards: WebSocketMockMethodGuard[]): MethodDecorator {
  return withWebSocketMethodConfig({ guards });
}

export const OnConnection = createMethodDecorator('connection', 'OnConnection');
export const OnClientMessage = createMethodDecorator('client:message', 'OnClientMessage');
export const OnClientClose = createMethodDecorator('client:close', 'OnClientClose');
export const OnServerOpen = createMethodDecorator('server:open', 'OnServerOpen');
export const OnServerMessage = createMethodDecorator('server:message', 'OnServerMessage');
export const OnServerError = createMethodDecorator('server:error', 'OnServerError');
export const OnServerClose = createMethodDecorator('server:close', 'OnServerClose');

export function WsMessageType(messageType: string): MethodDecorator {
  return withWebSocketMethodConfig({ messageType });
}

export function WsGuard(...guards: WebSocketMockMethodGuard[]): MethodDecorator {
  return withWebSocketMethodGuards(...guards);
}

export function createWebSocketJsonGuard(guard: WebSocketMockJsonGuard): WebSocketMockMethodGuard {
  return async context => {
    try {
      const payload = await resolveJsonPayload(getMessageEvent(context, 'WsJsonGuard'));
      return guard(payload, context);
    } catch {
      return false;
    }
  };
}

export function createWebSocketJsonPathGuard(path: string, expected: unknown): WebSocketMockMethodGuard {
  return createWebSocketJsonGuard(payload => Object.is(getValueAtPath(payload, path), expected));
}

export function createWebSocketJsonMatchGuard(expected: WebSocketMockJsonMatcher): WebSocketMockMethodGuard {
  return createWebSocketJsonGuard(payload => isDeepPartialMatch(payload, expected));
}

export function WsJsonGuard(guard: WebSocketMockJsonGuard): MethodDecorator {
  return WsGuard(createWebSocketJsonGuard(guard));
}

export function WsJsonPath(path: string, expected: unknown): MethodDecorator {
  return WsGuard(createWebSocketJsonPathGuard(path, expected));
}

export function WsJsonMatch(expected: WebSocketMockJsonMatcher): MethodDecorator {
  return WsGuard(createWebSocketJsonMatchGuard(expected));
}

export function WsNamespace(namespace: string, path: string = 'namespace'): MethodDecorator {
  return WsJsonPath(path, namespace);
}

export function WsContext(): ParameterDecorator {
  return createParamDecorator('context', 'WsContext');
}

export function WsClient(): ParameterDecorator {
  return createParamDecorator('client', 'WsClient');
}

export function WsServer(): ParameterDecorator {
  return createParamDecorator('server', 'WsServer');
}

export function WsEvent(): ParameterDecorator {
  return createParamDecorator('event', 'WsEvent');
}

export function WsData(): ParameterDecorator {
  return createParamDecorator('data', 'WsData');
}

export function WsJsonData(name?: string): ParameterDecorator {
  return createParamDecorator('json', 'WsJsonData', name);
}

export function WsParams(name?: string): ParameterDecorator {
  return createParamDecorator('params', 'WsParams', name);
}

export function WsPathParam(name: string): ParameterDecorator {
  return createParamDecorator('path', 'WsPathParam', name);
}

export function WsInfo(): ParameterDecorator {
  return createParamDecorator('info', 'WsInfo');
}

export function WsProtocols(): ParameterDecorator {
  return createParamDecorator('protocols', 'WsProtocols');
}

export function WsState(name?: string): ParameterDecorator {
  return createParamDecorator('state', 'WsState', name);
}

export function WsSend(): MethodDecorator {
  return withWebSocketMethodConfig({
    response: {
      serializer: 'raw',
    },
  });
}

export function WsSendJson(): MethodDecorator {
  return withWebSocketMethodConfig({
    response: {
      serializer: 'json',
    },
  });
}

export function WsAck(type: string, options: Omit<WebSocketMockAckConfig, 'type'> = {}): MethodDecorator {
  return withWebSocketMethodConfig({
    response: {
      ack: {
        ...options,
        type,
      },
      serializer: 'json',
    },
  });
}

export function WsError(
  type: string,
  options: Omit<WebSocketMockErrorResponseConfig, 'type'> = {},
): MethodDecorator {
  return withWebSocketMethodConfig({
    response: {
      error: {
        ...options,
        type,
      },
      serializer: 'json',
    },
  });
}

export function WsPatchState(): MethodDecorator {
  return withWebSocketMethodConfig({
    statePatch: 'merge',
  });
}

export function createWebSocketMockHandler<T extends object>(
  definition: DecoratedWebSocketMock<T>,
): WebSocketHandler {
  const { ctor, instance } = resolveDecoratedMock(definition);
  const config = getClassConfig(ctor);
  const bindings = collectMethodBindings(ctor.prototype);

  if (!config?.url) {
    throw new Error(`Decorated WebSocket mock "${ctor.name || 'anonymous'}" is missing "@WebSocketMock(...)" config.`);
  }

  if (bindings.length === 0) {
    throw new Error(`Decorated WebSocket mock "${ctor.name || 'anonymous'}" does not declare any WebSocket event methods.`);
  }

  validateCollectedBindings(bindings, ctor.name || 'anonymous');

  const link = ws.link(config.url);

  return link.addEventListener('connection', connection => {
    let invocationChain = Promise.resolve<unknown>(undefined);

    const baseContext: WebSocketMockConnectionContext = {
      client: connection.client as unknown as WebSocketMockClientConnection,
      server: connection.server as unknown as WebSocketMockServerConnection,
      info: connection.info,
      params: normalizeParams(connection.params as Record<string, unknown>),
      state: resolveConnectionState(config.state),
    };

    const enqueueInvocation = (binding: CollectedEventBinding) => {
      return (context: WebSocketMockConnectionContext | WebSocketMockEventContext) => {
        invocationChain = invocationChain
          .then(() => invokeDecoratedMethod(instance, binding, context))
          .catch(error => {
            reportDecoratedInvocationError(error);
          });
      };
    };

    for (const binding of bindings) {
      attachCollectedBinding(binding, baseContext, enqueueInvocation(binding));
    }

    for (const binding of bindings) {
      if (binding.kind === 'connection') {
        enqueueInvocation(binding)(baseContext);
      }
    }
  });
}

class MockWebSocketApi {
  private runtime?: MockRuntime;

  private started = false;

  private pendingHandlers: WebSocketHandler[] = [];

  async on() {
    await this.ensureStarted();
  }

  async off(closeRuntime: boolean = false) {
    this.started = false;

    if (!closeRuntime || !this.runtime) {
      return;
    }

    if ('close' in this.runtime) {
      this.runtime.close();
    } else {
      this.runtime.stop();
    }

    this.runtime = undefined;
  }

  link(url: MockWebSocketUrl): MockWebSocketLink {
    return ws.link(url);
  }

  createHandler<T extends object>(definition: DecoratedWebSocketMock<T>) {
    return createWebSocketMockHandler(definition);
  }

  use(...handlers: WebSocketHandler[]) {
    this.pendingHandlers.push(...handlers);
    this.runtime?.use(...handlers);
    return this;
  }

  registerHandlers(...handlers: WebSocketHandler[]) {
    return this.use(...handlers);
  }

  register<T extends object>(...definitions: DecoratedWebSocketMock<T>[]) {
    return this.use(...definitions.map(definition => createWebSocketMockHandler(definition)));
  }

  resetHandlers() {
    this.pendingHandlers = [];
    this.runtime?.resetHandlers();
  }

  listHandlers(): readonly WebSocketHandler[] {
    return (this.runtime ? [...this.runtime.listHandlers()] : [...this.pendingHandlers]) as readonly WebSocketHandler[];
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
      throw new Error('Failed to initialize the WebSocket mock runtime.');
    }

    return this.runtime;
  }
}

export const MockWebSocketAPI = new MockWebSocketApi();

export type {
  WebSocketData,
  WebSocketEventListener,
  WebSocketLink,
} from 'msw';

export { ws };
