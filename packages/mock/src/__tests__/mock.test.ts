import { afterEach, describe, expect, test } from 'vitest';

import { type ApiCall, Get, HttpApi } from '@decoraxios/awe-axios-core';
import { HttpResponse, Mock, MockAPI } from '../index.js';

afterEach(async () => {
  MockAPI.resetHandlers();
  await MockAPI.off(true);
});

describe('@decoraxios/awe-axios-mock', () => {
  test('intercepts requests with the default mock handler without changing the call signature', async () => {
    await MockAPI.on();

    @HttpApi('http://localhost:3300/users')
    class UserApi {
      @Get('/')
      @Mock(() => {
        return HttpResponse.json({
          source: 'default',
        });
      })
      listUsers(): ApiCall<{ source: string }> {
        return undefined as never;
      }
    }

    const response = await new UserApi().listUsers();
    expect(response.data.source).toBe('default');
  });

  test('supports selecting a specific mock handler for the next request', async () => {
    await MockAPI.on();

    @HttpApi('http://localhost:3300/users')
    class UserApi {
      @Get('/')
      @Mock({
        default: () => {
          return HttpResponse.json({
            source: 'default',
          });
        },
        error: () => {
          return HttpResponse.json({
            source: 'error',
          });
        },
      })
      listUsers(): ApiCall<{ source: string }> {
        return undefined as never;
      }
    }

    const api = new UserApi();
    MockAPI.useNextHandler('error');

    const first = await api.listUsers();
    const second = await api.listUsers();

    expect(first.data.source).toBe('error');
    expect(second.data.source).toBe('default');
  });
});
