import { describe, expect, test } from 'vitest';

import { Aspect, Component, Get, HttpResponse, Inject, Mock } from '@awe-axios/all';

describe('@awe-axios/all exports', () => {
  test('exposes the full bundle from a single package', () => {
    expect(typeof Get).toBe('function');
    expect(typeof Mock).toBe('function');
    expect(typeof HttpResponse.json).toBe('function');
    expect(typeof Component).toBe('function');
    expect(typeof Inject).toBe('function');
    expect(typeof Aspect).toBe('function');
  });
});
