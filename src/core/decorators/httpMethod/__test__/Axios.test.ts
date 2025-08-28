import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
const baseURL = 'http://localhost:3000';
const request = axios.create({ baseURL });
const userHandler = [
  http.get(`${baseURL}/users`, () => {
    return HttpResponse.json({
      code: 304,
      message: 'ok',
      data: { name: 'xx' },
    });
  }),
  http.post(`${baseURL}/users/list`, async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name'); // 获取普通字段
    console.log(formData);

    return HttpResponse.json({
      code: 200,
      message: 'ok',
      data: { name: name || '默认值' }, // 返回解析后的数据
    });
  }),
];
const server = setupServer(...userHandler);
server.listen();
afterAll(() => server.close());

/* test('axios 超时功能测试', async () => {
  const { data } = await request.get('/user', { timeout: 1, timeoutErrorMessage: '请求超时' });
}); */

test('axios 自定义status', async () => {
  try {
    const { data } = await request.get('/users', {
      timeout: 1,
      timeoutErrorMessage: '请求超时',
      validateStatus: status => status === 200,
    });
  } catch (error) {
    console.log('出错了', error);
  }
});

test('最大重定向次数', async () => {
  try {
    const { data } = await request.get('/users', {
      timeout: 1,
      timeoutErrorMessage: '请求超时',
      validateStatus: status => status === 200,
    });
  } catch (error) {
    console.log('出错了', error);
  }
});

/* test.only('自定义表单序列化行为', async () => {
  const { data } = await request.post(
    '/users/list',
    {
      name: '小红',
    },
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      formSerializer: {
        visitor: function (value, key, path, helpers) {
          console.log(value, key, path, helpers);

          if (key === 'name') {
            value = '小明'; // 自定义字段值
            return true; // 表示已处理，不再走默认逻辑
          }
          return false; // 其他字段走默认逻辑
        },
      },
    },
  );
  console.log(data);
}); */
test('自定义适配器实现mock请求', async () => {
  const mockAdapter = (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const { url, method } = config;

    if (url === '/users' && method === 'get') {
      const response: AxiosResponse = {
        data: [
          { id: 1, name: '小明' },
          { id: 2, name: '小红' },
        ],
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: {}, // 可以是 XMLHttpRequest、http.ClientRequest 等，mock 时可为空对象
      };

      return Promise.resolve(response);
    }

    return Promise.reject({
      message: 'Not Found',
      config,
      response: {
        data: null,
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      } as AxiosResponse, // 显式类型断言
    });
  };
  // 实际会调用适配器来发起请求
  const { data } = await request.get('/users', { adapter: mockAdapter });
  console.log(data);
});

test.only('自定义代理', async () => {
  const { data } = await axios({
    baseURL: 'http://localhost:8080',
    url: '/users',
    method: 'get',
    allowAbsoluteUrls: true,
    proxy: {
      host: 'http://localhost',
      port: 3000,
    },
  });
  console.log(data);
});
