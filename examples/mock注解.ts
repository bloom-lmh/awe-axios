import { Get } from '@/core/decorators';
import axios from 'axios';
import { HttpResponse } from 'msw';

const getUserById = {
  success: () => {},
  fail: () => {},
};
const handler = () => {};

class UserApi {
  @Get()
  /* @Mock({
    success: {
      handler: () => {
        return HttpResponse.json({});
      },
      options: {},
    },
    fail: () => {
      return HttpResponse.json({});
    },
  })
  @Mock(() => {}) */
  getUserById({}) {}
}

const userApi = new UserApi();
//userApi.getUserById('id', 'name').mock('success');
