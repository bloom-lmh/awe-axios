import { Get, HttpApi } from '../..';

describe('1. mock测试', () => {
  test('1.1 与get装饰器结合', () => {
    @HttpApi({
      mockOn: false,
    })
    class UserApi {
      @Get({
        mock: {
          on: true,
        },
      })
      getUserList() {}
    }
  });
});
