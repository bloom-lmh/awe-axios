import { describe, expect, test } from 'vitest';

import { Get as RootGet } from 'decoraxios';
import { Debounce, Retry, Throttle } from 'decoraxios/core';

describe('decoraxios core-first exports', () => {
  test('exposes only core exports from the root package', () => {
    expect(typeof RootGet).toBe('function');
    expect(typeof Retry).toBe('function');
    expect(typeof Debounce).toBe('function');
    expect(typeof Throttle).toBe('function');
  });
});
