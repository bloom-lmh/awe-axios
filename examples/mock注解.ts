import axios from 'axios';
import { HttpResponse } from 'msw';

/* const getUserById = {
  success: () => {},
  fail: () => {},
};
const handler = () => {};


class UserApi {
  @Get()
  @Mock({
    success: () => {return HttpResponse.json({});},
    fail:()=>{return HttpResponse.json({});}
  })
  getUserById({}) {
    
  }
}

const userApi = new UserApi();
userApi.getUserById.mock('success')("id","name");
 */
// 如果没有指定url和baseUrl会使用httpMethod装饰器配置

// userApi.getUserById.mock('success');
// userApi.getUserById.mock('fail').times(1); // 只 mock 一次
// userApi.getUserById.mock().delay(500).status(500);

/* @Api()
class UserApi{
  @Get()
  getUserById(@Path() id: string, @Query() name: string) {
} */
