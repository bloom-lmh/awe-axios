import { describe, expect, test } from 'vitest';

import { Get as FullGet } from 'awe-axios';
import { Debounce, Retry, Throttle } from 'awe-axios/core';
import { HttpResponse, Mock } from 'awe-axios/mock';
import { Aspect, Component, Inject } from 'awe-axios/ioc-aop';

describe('awe-axios umbrella exports', () => {
  test('exposes root and subpath exports', () => {
    expect(typeof FullGet).toBe('function');
    expect(typeof Retry).toBe('function');
    expect(typeof Debounce).toBe('function');
    expect(typeof Throttle).toBe('function');
    expect(typeof Mock).toBe('function');
    expect(typeof HttpResponse.json).toBe('function');
    expect(typeof Component).toBe('function');
    expect(typeof Inject).toBe('function');
    expect(typeof Aspect).toBe('function');
  });
});
