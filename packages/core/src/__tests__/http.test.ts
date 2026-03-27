import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import {
  axiosPlus,
  type ApiCall,
  AxiosRef,
  BodyParam,
  Debounce,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
  RefAxios,
  Retry,
  Throttle,
  TransformResponse,
} from '../index.js';

let unstableCalls = 0;
let searchCalls = 0;
let metricCalls = 0;

const server = setupServer(
  http.get('http://localhost:3000/users/:id', ({ request, params }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      id: params.id,
      expand: url.searchParams.get('expand'),
    });
  }),
  http.post('http://localhost:3000/users', async ({ request }) => {
    return HttpResponse.json(await request.json());
  }),
  http.get('http://localhost:3001/users/teams', () => {
    return HttpResponse.json({
      source: 'method-axios',
    });
  }),
  http.get('http://localhost:3000/unstable', () => {
    unstableCalls += 1;

    if (unstableCalls < 3) {
      return HttpResponse.json(
        {
          ok: false,
        },
        {
          status: 500,
        },
      );
    }

    return HttpResponse.json({
      ok: true,
      attempts: unstableCalls,
    });
  }),
  http.get('http://localhost:3000/search', ({ request }) => {
    searchCalls += 1;
    const url = new URL(request.url);
    return HttpResponse.json({
      q: url.searchParams.get('q'),
      calls: searchCalls,
    });
  }),
  http.get('http://localhost:3000/metrics/:id', ({ params }) => {
    metricCalls += 1;
    return HttpResponse.json({
      id: params.id,
      calls: metricCalls,
    });
  }),
);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  unstableCalls = 0;
  searchCalls = 0;
  metricCalls = 0;
});

afterAll(() => {
  server.close();
});

describe('@decoraxios/core', () => {
  test('builds requests from class, method, and parameter decorators', async () => {
    @HttpApi('http://localhost:3000/users')
    class UserApi {
      @Get('/:id')
      getUser(@PathParam('id') id: number, @QueryParam('expand') expand: string): ApiCall<{
        id: string;
        expand: string | null;
      }> {
        return undefined as never;
      }

      @Post('/')
      createUser(@BodyParam() user: { name: string }, @BodyParam('role') role: string): ApiCall<{
        name: string;
        role: string;
      }> {
        return undefined as never;
      }
    }

    const api = new UserApi();
    const userResponse = await api.getUser(42, 'full');
    const createResponse = await api.createUser({ name: 'Ada' }, 'admin');

    expect(userResponse.data).toEqual({
      id: '42',
      expand: 'full',
    });
    expect(createResponse.data).toEqual({
      name: 'Ada',
      role: 'admin',
    });
  });

  test('supports axios overrides and response transforms', async () => {
    const classClient = axiosPlus.create({
      baseURL: 'http://localhost:3000',
    });
    const methodClient = axiosPlus.create({
      baseURL: 'http://localhost:3001',
    });

    @RefAxios(classClient)
    @HttpApi({
      url: '/users',
    })
    class TeamApi {
      @Get('/teams')
      @AxiosRef(methodClient)
      @TransformResponse(data => {
        return {
          ...data,
          transformed: true,
        };
      })
      listTeams(): ApiCall<{ source: string; transformed: boolean }> {
        return undefined as never;
      }
    }

    const response = await new TeamApi().listTeams();

    expect(response.data).toEqual({
      source: 'method-axios',
      transformed: true,
    });
  });

  test('supports retry decorator plugins', async () => {
    @HttpApi('http://localhost:3000')
    class HealthApi {
      @Get('/unstable')
      @Retry({
        count: 3,
        delay: 5,
      })
      check(): ApiCall<{ ok: boolean; attempts: number }> {
        return undefined as never;
      }
    }

    const response = await new HealthApi().check();

    expect(response.data).toEqual({
      ok: true,
      attempts: 3,
    });
    expect(unstableCalls).toBe(3);
  });

  test('supports debounce decorator plugins', async () => {
    @HttpApi('http://localhost:3000')
    class SearchApi {
      @Get('/search')
      @Debounce({
        delay: 10,
      })
      query(@QueryParam('q') q: string): ApiCall<{ q: string; calls: number }> {
        return undefined as never;
      }
    }

    const api = new SearchApi();
    const [first, second, third] = await Promise.all([api.query('a'), api.query('b'), api.query('c')]);

    expect(first.data.q).toBe('c');
    expect(second.data.q).toBe('c');
    expect(third.data.q).toBe('c');
    expect(searchCalls).toBe(1);
  });

  test('supports throttle decorator plugins', async () => {
    @HttpApi('http://localhost:3000')
    class MetricsApi {
      @Get('/metrics/:id')
      @Throttle({
        interval: 10,
      })
      read(@PathParam('id') id: string): ApiCall<{ id: string; calls: number }> {
        return undefined as never;
      }
    }

    const api = new MetricsApi();
    const [first, second, third] = await Promise.all([api.read('1'), api.read('2'), api.read('3')]);

    expect(first.data.id).toBe('1');
    expect(second.data.id).toBe('3');
    expect(third.data.id).toBe('3');
    expect(metricCalls).toBe(2);
  });
});
