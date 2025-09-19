import { faker, de } from '@faker-js/faker';
import { DataFaker, defineModel, FakeData } from './core/decorators/faker/DataFaker';
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
/* const personModel = DataFaker.defineModel({
  type: () => 'Human',
});
DataFaker.defineModel({
  departName: ['helpers.arrayElements', ['计算机科学与计算', '软件工程']],
});
const studentInfoModel = DataFaker.defineModel({
  classNum: () => {
    return '软工' + faker.number.int();
  },
  depart: {
    refModel: 'Department',
  },
});
const studentModel = DataFaker.defineModel({
  sId: 'number.bigInt',
  books: ['helpers.arrayElements', ['物理', '英语']],
  clazz: {
    refModel: 'clazz',
  },
});
const infoModel = DataFaker.defineModel({
  country: () => {
    return 'cd';
  },
});
const addressModel = DataFaker.defineModel({
  city: 'location.city',
  info: {
    refModel: 'info',
    num: 3,
  },
});
const userModel = DataFaker.defineModel({
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
}); */
const companyModel = defineModel({
  name: 'company.name',
  buzzPhrase: 'company.buzzPhrase',
});
const jobModel = defineModel({
  type: 'person.jobType',
  company: {
    refModel: companyModel,
  },
});
const addressModel = defineModel({
  country: 'location.country',
  city: 'location.city',
});
const userModel = defineModel({
  id: 'number.int',
  name: 'airline.aircraftType',
  age: ['number.int', { min: 18, max: 65 }],
  hobby: ['helpers.arrayElements', ['篮球', '足球', '乒乓球']],
  email: ctx => {
    return 'hello';
  },
  sex: () => 'M',
  address: () => {
    return FakeData(addressModel);
  },
  job: {
    refModel: jobModel,
    count: 2,
  },
});

const userDatas = FakeData(userModel, {
  rules: {
    count: 1,
    job: {
      count: 3,
      deep: 3,
      address: {
        count: 2,
      },
    },
  },
});
console.log(userDatas);
/* 
const studentModel = userModel
  .clone()
  .setProperty('age', ['number.int', { min: 5, max: 18 }])
  .setProperties({
    sId: 'number.int',
  });

const studentDatas = FakeData(studentModel);
console.log(studentDatas); */
