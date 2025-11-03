import { beforeAll, describe, test } from 'vitest';
import { userApi } from './api/userApi';
import { MockAPI } from '@/core/mock/MockAPI';

beforeAll(() => {
  MockAPI.on();
});
describe('demo', () => {
  test('应用', async () => {
    const { data } = await userApi.getUserPages(1, 10)();
    console.log(data);
    // 删除用户
    const { data: data2 } = await userApi.deleteUser(1)();
    console.log(data2);

    // 新增用户
    const { data: data3 } = await userApi.addUser({ name: 'test', age: 18 })();
    console.log(data3);
  });
});
