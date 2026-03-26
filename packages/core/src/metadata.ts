import type { HttpApiConfig, HttpMethodConfig, MethodKey, ParamBinding } from './types.js';
import { mergeHttpConfigPatch } from './utils/config.js';

interface StoredMethodConfig extends HttpMethodConfig {
  methodId: string;
}

const classConfigStore = new WeakMap<object, HttpApiConfig>();
const methodConfigStore = new WeakMap<object, Map<MethodKey, StoredMethodConfig>>();
const paramBindingStore = new WeakMap<object, Map<MethodKey, ParamBinding[]>>();
const wrappedStore = new WeakMap<object, Set<MethodKey>>();

let methodCounter = 0;

function getOrCreateMethodMap(target: object): Map<MethodKey, StoredMethodConfig> {
  let map = methodConfigStore.get(target);
  if (!map) {
    map = new Map();
    methodConfigStore.set(target, map);
  }
  return map;
}

function getOrCreateParamMap(target: object): Map<MethodKey, ParamBinding[]> {
  let map = paramBindingStore.get(target);
  if (!map) {
    map = new Map();
    paramBindingStore.set(target, map);
  }
  return map;
}

function createMethodId(propertyKey: MethodKey): string {
  methodCounter += 1;
  return `${String(propertyKey)}_${methodCounter}`;
}

export function getClassConfig(target: object): HttpApiConfig | undefined {
  return classConfigStore.get(target);
}

export function mergeClassConfig(target: object, patch: Partial<HttpApiConfig>): HttpApiConfig {
  const current = classConfigStore.get(target) ?? {};
  const next = mergeHttpConfigPatch(current, patch);
  classConfigStore.set(target, next);
  return next;
}

export function getMethodConfig(target: object, propertyKey: MethodKey): StoredMethodConfig | undefined {
  return methodConfigStore.get(target)?.get(propertyKey);
}

export function mergeMethodConfig(
  target: object,
  propertyKey: MethodKey,
  patch: Partial<HttpMethodConfig>,
): StoredMethodConfig {
  const map = getOrCreateMethodMap(target);
  const current: StoredMethodConfig = map.get(propertyKey) ?? {
    methodId: createMethodId(propertyKey),
  };
  const next = mergeHttpConfigPatch(current, patch as Partial<StoredMethodConfig>) as StoredMethodConfig;
  map.set(propertyKey, next);
  return next;
}

export function addParamBinding(target: object, propertyKey: MethodKey, binding: ParamBinding): void {
  const map = getOrCreateParamMap(target);
  const bindings = map.get(propertyKey) ?? [];
  bindings.push(binding);
  bindings.sort((left, right) => left.index - right.index);
  map.set(propertyKey, bindings);
}

export function getParamBindings(target: object, propertyKey: MethodKey): ParamBinding[] {
  return [...(paramBindingStore.get(target)?.get(propertyKey) ?? [])];
}

export function isMethodWrapped(target: object, propertyKey: MethodKey): boolean {
  return wrappedStore.get(target)?.has(propertyKey) ?? false;
}

export function markMethodWrapped(target: object, propertyKey: MethodKey): void {
  let wrapped = wrappedStore.get(target);
  if (!wrapped) {
    wrapped = new Set();
    wrappedStore.set(target, wrapped);
  }

  wrapped.add(propertyKey);
}
