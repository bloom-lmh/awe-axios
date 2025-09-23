import { faker } from '@faker-js/faker';
import { DataField, DataModel } from '..';
import { defineModel, FakeData, useModel } from '../DataFaker';
import { DEEP } from '@/core/constant/DataFakerConstants';

describe('测试数据生成器', () => {
  test('测试生成随机数', () => {
    const address = defineModel('address', {
      city: 'location.city',
    });
    const students = defineModel('student', {
      id: 'number.int',
      address: {
        refModel: 'address',
      },
    });

    @DataModel('person')
    class PersonModel {
      @DataField('person.fullName')
      declare firstName: string;
    }

    @DataModel('user')
    class UserModel extends PersonModel {
      @DataField('number.int')
      declare id: number;

      @DataField(() => {
        return 'male';
      })
      declare gender: string;
    }

    const userModel = useModel(UserModel);
    console.log(userModel);

    const users = FakeData('user');
    console.log(users);
  });
});
