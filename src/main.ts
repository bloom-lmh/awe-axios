import { faker } from '@faker-js/faker';
import { defineModel, FakerAPI } from './core/decorators/faker/FakerApi';
import { DataField } from './core/decorators/faker';
/* class Address {}
class Person {
  @DataField('string.uuid')
  declare id: number;
  @DataField('airline.aircraftType')
  declare name: string;
  @DataField(['number.int', { min: 12, max: 25 }])
  declare age: number;
  @DataField(ctx => {
    console.log(ctx);
    return 'hello';
  })
  declare email: string;
  private sex: number = 1;
  @DataField({
    modelName: 'aaa',
  })
  declare address: Address;
} */
defineModel(
  'User',
  {
    id: 'number.int',
    name: 'airline.aircraftType',
    age: ['number.int', { min: 18, max: 65 }],
    email: ctx => {
      console.log(ctx);
      return 'hello';
    },
    sex: () => 'M',
    address: {
      modelName: 'Address',
      rule: 'list|1-3',
    },
  },
  {
    extends: ['Base'],
  },
);
FakerAPI('zh_CN').useModel('User', {
  rule: 'list|1-3',
  deep: 1,
});

console.log(faker.number.int({ min: 18, max: 65 }));
