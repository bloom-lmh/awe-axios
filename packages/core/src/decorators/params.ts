import { addParamBinding } from '../metadata.js';
import type { ParamBindingKind } from '../types.js';

function createParamDecorator(kind: ParamBindingKind, name?: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey === undefined) {
      throw new Error(`"${kind}" parameter decorators are only supported on instance methods.`);
    }

    addParamBinding(target, propertyKey, {
      index: parameterIndex,
      kind,
      name,
    });
  };
}

export function BodyParam(name?: string): ParameterDecorator {
  return createParamDecorator('body', name);
}

export function PathParam(name: string): ParameterDecorator {
  return createParamDecorator('path', name);
}

export function QueryParam(name: string): ParameterDecorator {
  return createParamDecorator('query', name);
}
