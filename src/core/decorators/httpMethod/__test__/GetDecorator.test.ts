import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { MethodDecoratorStateManager } from '@/core/statemanager/MethodDecoratorStateManager';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Get, PathParam, QueryParam, HttpApi, AxiosRef, RefAxios } from '../..';
import { DecoratorInfo } from '../../DecoratorInfo';

const mdsm = new MethodDecoratorStateManager();
const server = setupServer(
  ...[
    http.get('http://localhost:3000/list/:name/:id', () => {
      return HttpResponse.json({
        message: 'http://localhost:3000/list/:name/:id',
      });
    }),
    http.get('http://localhost:3000/users/list/:name/:id', () => {
      return HttpResponse.json({
        message: 'http://localhost:3000/users/list/:name/:id',
      });
    }),
    http.get('http://localhost:4000/users/list/:name/:id', () => {
      return HttpResponse.json({
        message: 'http://localhost:4000/users/list/:name/:id',
      });
    }),
  ],
);

beforeAll(() => {
  server.listen();
});
afterAll(() => {
  server.close();
});

describe.skip('1. Get装饰器基本流程测试', () => {
  test('1.1 装饰器冲突测试', () => {
    expect(() => {
      class Test {
        @Get()
        @Get()
        async getUsers() {}
      }
    }).toThrow(/confilct/);
    function Post() {
      return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        mdsm.setDecoratorInfo(target, new DecoratorInfo({ name: DECORATORNAME.POST, type: 'method' }), propertyKey);
      };
    }
    expect(() => {
      class Test {
        @Get()
        @Post()
        async getUsers() {}
      }
    }).toThrow(/confilct/);
  });
  describe('1.2 配置前置处理功能测试', () => {
    test('1.2.1 能够接受空值并处理为配置', () => {
      class Test {
        @Get()
        async getUsers() {}
      }
    });
    test('1.2.2 能够处理字符串类型的配置', () => {
      class Test {
        @Get('/list')
        async getUsers() {}
      }
    });
    test('1.2.3 能够包装配置和解构额外配置', () => {
      class Test {
        @Get({
          url: '/list',
          retry: { count: 3 },
        })
        async getUsers() {}
      }
    });
  });
  describe('1.3 能够进行配置前置检查', () => {
    test('1.3.1 不允许防抖和节流同时出现', () => {
      expect(() => {
        class Test {
          @Get({
            throttle: true,
            debounce: true,
          })
          async getUsers() {}
        }
      }).toThrow();
      expect(() => {
        class Test {
          @Get({
            throttle: {},
            debounce: true,
          })
          async getUsers() {}
        }
      }).toThrow();
      expect(() => {
        class Test {
          @Get({
            throttle: true,
            debounce: {},
          })
          async getUsers() {}
        }
      }).toThrow();
      expect(() => {
        class Test {
          @Get({
            throttle: false,
            debounce: {},
          })
          async getUsers() {}
        }
      }).toThrow();
      expect(() => {
        class Test {
          @Get({
            throttle: {},
            debounce: false,
          })
          async getUsers() {}
        }
      }).toThrow();
      expect(() => {
        class Test {
          @Get({
            throttle: true,
            debounce: false,
          })
          async getUsers() {}
        }
      }).toThrow();
      expect(() => {
        class Test {
          @Get({
            throttle: false,
            debounce: true,
          })
          async getUsers() {}
        }
      }).toThrow();
      /*  expect(() => {
        class Test {
          @Get({
            debounce: true,
          })
          async getUsers() {}
        }
      }).not.toThrow(); */
      /*  expect(() => {
        class Test {
          @Get({
            throttle: true,
          })
          async getUsers() {}
        }
      }).not.toThrow(); */
    });
    test('1.3.2 不允许出现超出范围的配置项', () => {});
  });
  test('1.4 能够正确初始化状态', () => {
    class Test {
      @Get('/list')
      async getUsers() {}
    }

    expect(mdsm.getDecoratorInfo(Test.prototype, DECORATORNAME.GET, 'getUsers')).not.toBeUndefined();
  });
  test('1.5 能够正确解析路径参数', async () => {
    /* @HttpApi({
      baseURL
    }) */
    class UserApi {
      @Get({
        baseURL: 'http://localhost:3000',
        url: '/list/:name/:id',
      })
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
  });
});

describe.skip('2.Get装饰器基本功能测试', () => {
  test('2.1 能够发送带有完整路径的请求，并能获取结果', async () => {
    class UserApi {
      @Get({
        baseURL: 'http://localhost:3000',
        url: '/list/:name/:id',
      })
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
  });
});

describe('3. 与@HttpApi集成测试', () => {
  test('3.1 @HttpApi和@Get只指定字符串简单路径', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000',
    })
    class UserApi {
      @Get('/list/:name/:id')
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:3000/list/:name/:id',
    });
  });
  test('3.2 @HttpApi指定配置对象，但不设置axios实例', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
    })
    class UserApi {
      @Get('/list/:name/:id')
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:3000/users/list/:name/:id',
    });
  });
  test('3.3 @HttpApi指定配置对象,axios优先级更高', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
      refAxios: axios.create({
        baseURL: 'http://localhost:4000',
      }),
    })
    class UserApi {
      @Get('/list/:name/:id')
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:4000/users/list/:name/:id',
    });
  });
  test('3.4 @HttpApi指定配置对象,但无baseURL', async () => {
    @HttpApi({
      url: 'users',
      refAxios: axios.create({
        baseURL: 'http://localhost:4000',
      }),
    })
    class UserApi {
      @Get('/list/:name/:id')
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:4000/users/list/:name/:id',
    });
  });
  test('3.5 @Get的baseURL优先级更高', async () => {
    @HttpApi({
      baseURL: 'http://localhost:8000',
      url: 'users',
    })
    class UserApi {
      @Get({
        url: 'list/:name/:id',
        baseURL: 'http://localhost:3000',
      })
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:3000/users/list/:name/:id',
    });
  });
  test('3.6 @Get的axios优先级更高', async () => {
    @HttpApi({
      baseURL: 'http://localhost:4000',
      url: 'users',
    })
    class UserApi {
      @Get({
        url: 'list/:name/:id',
        refAxios: axios.create({
          baseURL: 'http://localhost:3000',
        }),
      })
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:3000/users/list/:name/:id',
    });
  });
});

describe('4. 加入子项@AxiosRef和@RefAxios测试', () => {
  test('4.1 能够通过@AxiosRef来添加axios实例', async () => {
    @HttpApi({
      baseURL: 'http://localhost:3000',
      url: 'users',
    })
    class UserApi {
      @Get({
        url: 'list/:name/:id',
      })
      @AxiosRef(
        axios.create({
          baseURL: 'http://localhost:4000',
        }),
      )
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:4000/users/list/:name/:id',
    });
  });
  test('4.2 @AxiosRef优先级低于@Get', async () => {
    @HttpApi({
      baseURL: 'http://localhost:5000',
      url: 'users',
    })
    class UserApi {
      @Get({
        url: 'list/:name/:id',
        refAxios: axios.create({
          baseURL: 'http://localhost:3000',
        }),
      })
      @AxiosRef(
        axios.create({
          baseURL: 'http://localhost:4000',
        }),
      )
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:3000/users/list/:name/:id',
    });
  });
  test('4.3 能够通过@RefAxios来添加axios实例', async () => {
    let request = axios.create({
      baseURL: 'http://localhost:4000',
    });
    @HttpApi('users')
    @RefAxios(request)
    class UserApi {
      @Get('list/:name/:id')
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}

      @Get('list/:name/:id')
      async getUsers2(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    const { data: data2 } = await userApi.getUsers2('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:4000/users/list/:name/:id',
    });
    expect(data2).toEqual({
      message: 'http://localhost:4000/users/list/:name/:id',
    });
  });
  test('4.4 @HttpApi上直接添加绝对路径', async () => {
    @HttpApi(`http://localhost:4000/users`)
    class UserApi {
      @Get({
        url: 'list/:name/:id',
      })
      async getUsers(
        @PathParam('id') id: string,
        @PathParam('name') name: string,
        @QueryParam('ids') ids1: number,
        @QueryParam('ids') ids2: number,
        @QueryParam('queryObj') qo: object,
      ): Promise<any> {}
    }
    const userApi = new UserApi();
    const { data } = await userApi.getUsers('1', 'xm', 2, 3, { age: 18 });
    console.log(data);
    expect(data).toEqual({
      message: 'http://localhost:4000/users/list/:name/:id',
    });
  });
});
