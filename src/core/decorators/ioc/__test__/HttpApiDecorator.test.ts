import axios from 'axios';
import { HttpApi, Component, Get, RefAxios } from '../..';

describe.skip('1. HttpApiDecorator实现流程测试', () => {
  test('1.1. 能够识别装饰器冲突', () => {
    expect(() => {
      @HttpApi()
      @Component()
      class Test {}
    }).toThrow();
    expect(() => {
      @Component()
      @HttpApi()
      class Test {}
    }).toThrow();

    expect(() => {
      @HttpApi()
      @HttpApi()
      class Test {}
    }).toThrow();
  });
  test('1.2 能够正确的处理配置', () => {
    // 直接指定字符串就是baseURL
    @HttpApi('http://localhost:3000/users')
    class Test {
      // 直接指定字符串就是url
      @Get('update')
      static async updateById() {}
      // 方法装饰器的axios优先级更高
      @Get({
        url: 'id',
        refAxios: axios.create({ baseURL: 'http://localhost:8080' }),
      })
      async deleteById() {}
      // 方法装饰器可以设定完整的配置
      @Get({
        url: 'list',
        transformRequest: [
          data => {
            return data;
          },
        ],
      })
      static async create() {}
    }
    @HttpApi({ baseURL: 'http://localhost:3000', url: '/users', refAxios: axios })
    class Test2 {
      // 直接指定字符串就是url
      @Get('update')
      static async updateById() {}
      // 方法装饰器baseURL优先级更高
      @Get({
        baseURL: 'http://localhost:8080',
        url: 'list',
      })
      async getUsers() {}
      // 方法装饰器的axios优先级更高
      @Get({
        url: 'id',
        refAxios: axios.create({ baseURL: 'http://localhost:8080' }),
      })
      async deleteById() {}
      // 方法装饰器可以设定完整的配置
      @Get({
        url: 'list',
        transformRequest: [
          data => {
            return data;
          },
        ],
      })
      static async create() {}
    }
  });
});

describe('2. 加入子项集成测试', () => {
  test('2.1 加入@RefAxios装饰器,能够添加axios实例', () => {
    @HttpApi()
    @RefAxios(axios.create({ baseURL: 'http://localhost:3000' }))
    class Test {}
  });
});
