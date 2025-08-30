import { Get, HttpApi } from '@/core/decorators';
import axios from 'axios';
import { HttpResponse } from 'msw';

const getUserById = {
  success: () => {},
  fail: () => {},
};
const handler = () => {};
@HttpApi({})
class UserApi {
  @Get({
    mock: {
      handlers: {
        success: () => {},
      },
      condition: () => {
        return process.env.NODE_ENV === 'development';
      },
    },
  })
  getUserById({}) {}
}

const userApi = new UserApi();
//userApi.getUserById('id', 'name').mock('success');
