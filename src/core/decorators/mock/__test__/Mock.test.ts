import axios from 'axios';
import { Get, HttpApi, PathParam } from '../..';
import { MockAPI } from '../../mock/MockAPI';
import { http, HttpResponse } from 'msw';

beforeAll(() => {
  MockAPI.on();
  MockAPI.registerHandlers(
    ...[
      http.get('http://localhost:3000/users/:name/:id', () => {
        return HttpResponse.json({
          data: 'http://localhost:3000/users/:name/:id',
        });
      }),
    ],
  );
  // 模拟测试环境
  process.env.NODE_ENV = 'test';
});
afterAll(() => {
  MockAPI.off();
});
const request = axios.create({
  baseURL: 'http://localhost:3000',
});
describe('1.Mock Get方法测试', () => {
  test('1.1 单独Get中进行mock配置，并采用默认的处理器', async () => {
    @HttpApi(request)
    class UserApi {
      @Get({
        url: '/users/:name/:id',
        mock: {
          on: false,
          handlers: {
            success() {
              return HttpResponse.json({
                message: 'ok',
              });
            },
            fail() {
              return HttpResponse.json({
                message: 'fail',
              });
            },
          },
        },
      })
      getUsers(@PathParam('name') name: string, @PathParam('id') id: number): any {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('test', 1)();
    console.log(data);
  });
});
