import { Delete, Get, Post, Put } from '@/core/httpMethod';
import { HttpApi } from '@/core/ioc';
import { Pages } from './common';
import { BodyParam, PathParam } from '@/core/params';
import { MockUserCreate, MockUserDelete, MockUserPages, MockUserUpdate } from '../mock/userMock';

@HttpApi({
  baseURL: 'http://localhost:3000/api/users',
  mock: {
    on: true,
    condition: () => {
      return process.env.NODE_ENV === 'test';
    },
  },
})
class UserApi {
  /**
   * 用户分页查询接口
   * @param page 页号
   * @param size 每页数量
   */
  @Pages({ url: '/pages/:page/:size' })
  @MockUserPages()
  getUserPages(@PathParam('page') page: number, @PathParam('size') size: number): any {}

  /**
   * 删除用户接口
   * @param id 用户ID
   */
  @Delete('/:id')
  @MockUserDelete()
  deleteUser(@PathParam('id') id: number): any {}

  /**
   * 添加用户接口
   */
  @Post('/')
  @MockUserCreate()
  addUser(@BodyParam() user: { name: string; age: number }): any {}

  /**
   * 更新用户接口
   */
  @Put('/')
  @MockUserUpdate()
  updateUser(@BodyParam() user: { id: number; name: string; age: number }): any {}
}

export const userApi = new UserApi();
