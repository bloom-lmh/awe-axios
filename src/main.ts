import { faker } from '@faker-js/faker';
import { defineModel, FakerAPI } from './core/decorators/faker/FakerApi';
import { DataFaker } from './core/decorators/faker/DataFaker';
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
    refModel: 'Department',
  },
});
defineModel('Student', {
  sId: 'number.bigInt',
  books: ['helpers.arrayElements', ['物理', '英语']],
  clazz: {
    refModel: 'clazz',
  },
});
defineModel('Info', {
  country: () => {
    return 'cd';
  },
});
defineModel('Address', {
  city: 'location.city',
  info: {
    refModel: 'info',
    num: 3,
  },
});
defineModel('User', {
  id: 'number.int',
  name: 'airline.aircraftType',
  age: ['number.int', { min: 18, max: 65 }],
  email: ctx => {
    return 'hello';
  },
  sex: () => 'M',
  self: () => {
    return new DataFaker().setRule({}).fake();
  },
  address: {
    refModel: 'Address',
    num: 1,
  },

  children: {
    refModel: 'user',
    num: 1,
  },
});

new DataFaker().useModel('User').setRule({
  address: {
    deep: true,
    num: 1,
    info: {
      num: 3,
    },
  },
  children: {
    deep: 2,
    num: 1,
    user: {
      num: 3,
    },
  },
  /*  refRules: {
    address: {
      deep: true,
      num: 1,
    },
  }, */
});
/* const result = FakerAPI('zh_CN').useModel('User', {}); */
/* console.log(result); */
