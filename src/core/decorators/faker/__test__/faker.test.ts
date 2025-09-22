import { faker } from '@faker-js/faker';
import { DataField, DataModel } from '..';
import { defineModel, FakeData } from '../DataFaker';
import { DEEP } from '@/core/constant/DataFakerConstants';

describe('测试数据生成器', () => {
  test('测试生成随机数', () => {
    const studentModel = defineModel('student', {
      id: 'number.int',
      children: {
        refModel: 'student',
        [DEEP]: 2,
      },
    });
    const students = FakeData(studentModel);
    console.log(students);

    /* @DataModel('user')
    class UserModel {
      @DataField(faker.animal.bird())
      declare id: number;
    } */
    const users = FakeData('user');
    console.log(users);
  });
});
