import { Component, HttpApi } from '@/core/ioc';
import { describe, test } from 'vitest';
import { Get } from '..';
import { HttpResponse } from 'msw';

describe('ioc test', () => {
  test('按模块名和别名注册', () => {
    @Component()
    class Animal {}
  });
});
