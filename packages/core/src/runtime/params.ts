import type { ParamBinding } from '../types.js';
import { isPlainObject } from '../utils/config.js';

export interface BoundParams {
  pathParams: Record<string, unknown>;
  queryParams: Record<string, unknown>;
  body: unknown;
}

function assignMultiValue(target: Record<string, unknown>, key: string, value: unknown): void {
  const current = target[key];
  if (current === undefined) {
    target[key] = value;
    return;
  }

  if (Array.isArray(current)) {
    current.push(value);
    return;
  }

  target[key] = [current, value];
}

export function extractBoundParams(bindings: ParamBinding[], args: unknown[]): BoundParams {
  const pathParams: Record<string, unknown> = {};
  const queryParams: Record<string, unknown> = {};
  const namedBody: Record<string, unknown> = {};
  const unnamedBody: unknown[] = [];

  for (const binding of bindings) {
    const value = args[binding.index];

    if (binding.kind === 'path' && binding.name) {
      pathParams[binding.name] = value;
      continue;
    }

    if (binding.kind === 'query' && binding.name) {
      assignMultiValue(queryParams, binding.name, value);
      continue;
    }

    if (binding.kind === 'body') {
      if (binding.name) {
        namedBody[binding.name] = value;
      } else {
        unnamedBody.push(value);
      }
    }
  }

  let body: unknown = undefined;

  if (Object.keys(namedBody).length > 0) {
    const mergedUnnamed = unnamedBody.filter(isPlainObject).reduce<Record<string, unknown>>((accumulator, current) => {
      Object.assign(accumulator, current);
      return accumulator;
    }, {});

    body = {
      ...mergedUnnamed,
      ...namedBody,
    };
  } else if (unnamedBody.length === 1) {
    body = unnamedBody[0];
  } else if (unnamedBody.length > 1) {
    if (unnamedBody.every(isPlainObject)) {
      body = unnamedBody.reduce<Record<string, unknown>>((accumulator, current) => {
        Object.assign(accumulator, current);
        return accumulator;
      }, {});
    } else {
      body = unnamedBody;
    }
  }

  return {
    pathParams,
    queryParams,
    body,
  };
}
