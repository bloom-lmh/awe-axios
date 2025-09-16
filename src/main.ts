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
defineModel('Person', {
  type: () => 'Human',
});
defineModel('Department', {
  departName: ['helpers.arrayElements', ['计算机科学与计算', '软件工程']],
});
defineModel('clazz', {
  classNum: () => {
    return '软工' + faker.number.int();
  },
  depart: {
    refModal: 'Department',
  },
});
defineModel('Student', {
  sId: 'number.bigInt',
  books: ['helpers.arrayElements', ['物理', '英语']],
  clazz: {
    refModal: 'clazz',
  },
});
defineModel('Address', {
  city: 'location.city',
});
defineModel('User', {
  id: 'number.int',
  name: 'airline.aircraftType',
  age: ['number.int', { min: 18, max: 65 }],
  email: ctx => {
    console.log(ctx);
    return 'hello';
  },
  sex: () => 'M',
  address: {
    refModal: 'Address',
    num: 1,
  },
});
FakerAPI('zh_CN').useModel('User', {
  extendList: ['Person', 'Student'],
  num: 1,
});

console.log(faker.number.int({ min: 18, max: 65 }));
