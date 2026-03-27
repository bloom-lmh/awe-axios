import { describe, expect, test } from 'vitest';

import { Get as LegacyRootGet } from 'awe-axios';
import { Retry as LegacyRetry } from 'awe-axios/core';
import { Get as CompatCoreGet } from '@decoraxios/awe-axios-core';
import { Mock as CompatMock } from '@decoraxios/awe-axios-mock';
import { Component as CompatComponent } from '@decoraxios/awe-axios-ioc-aop';
import { HttpResponse as CompatHttpResponse } from '@decoraxios/awe-axios-all';

describe('legacy compatibility aliases', () => {
  test('continue to re-export the renamed packages', () => {
    expect(typeof LegacyRootGet).toBe('function');
    expect(typeof LegacyRetry).toBe('function');
    expect(typeof CompatCoreGet).toBe('function');
    expect(typeof CompatMock).toBe('function');
    expect(typeof CompatComponent).toBe('function');
    expect(typeof CompatHttpResponse.json).toBe('function');
  });
});
