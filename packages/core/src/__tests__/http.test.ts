import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import {
  axiosPlus,
  type ApiCall,
  AxiosRef,
  BodyParam,
  Get,
  HttpApi,
  PathParam,
  Post,
  QueryParam,
  RefAxios,
  TransformResponse,
} from '../index.js';

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
);

beforeAll(() => {
  server.listen();
});

afterAll(() => {
  server.close();
});

describe('@awe-axios/core', () => {
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
});
