import { Get, HttpApi, Mock, axiosPlus, MockAPI } from 'axios-plus';
@HttpApi('http://localhost:3000')
class UserApi {
  @Get({
    url: '/users',
  })
  @Mock(() => {})
  getUsers() {}
}
