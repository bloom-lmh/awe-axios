import { describe, expect, test } from 'vitest';

import { Get as RootGet } from 'awe-axios';
import { Debounce, Retry, Throttle } from 'awe-axios/core';

describe('awe-axios core-first exports', () => {
  test('exposes only core exports from the root package', () => {
    expect(typeof RootGet).toBe('function');
    expect(typeof Retry).toBe('function');
    expect(typeof Debounce).toBe('function');
    expect(typeof Throttle).toBe('function');
  });
});
