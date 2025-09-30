import { cloneModel, defineModel, FakeData } from './core/decorators/faker/DataFaker';
import { COUNT, DEEP } from './core/constant/DataFakerConstants';
import { LocaleDefinition } from '@faker-js/faker';
import { DataField, DataModel } from './core/decorators/faker';
import { DModel } from './core/decorators/faker/DataModel';

const companyModel = defineModel('company', {
  name: 'company.name',
  buzzPhrase: 'company.buzzPhrase',
});
const jobModel = defineModel('job', {
  type: 'person.jobType',
  company: {
    refModel: companyModel,
  },
  children: {
    refModel: 'job',
  },
});
const addressModel = defineModel('address', {
  country: 'location.country',
  city: 'location.city',
});
const userModel = defineModel('user', {
  id: 'number.int',
  name: 'person.fullName',
  age: ['number.int', { min: 18, max: 65 }],
  hobby: ['helpers.arrayElements', ['篮球', '足球', '乒乓球']],
  email: ctx => {
    return 'hello';
  },
  sex: () => 'M',
  address: ctx => {
    // ctx是上面已生成的数据的上下文对象
    return ctx.name;
  },
  job: {
    refModel: jobModel,
  },
  job2: jobModel,
  job3: {
    refModel: 'job',
    [DEEP]: 3,
  },
  children: {
    refModel: 'user',
    [COUNT]: 2,
    [DEEP]: 3,
  },
});
const userDatas = FakeData(userModel, {
  rules: {
    [COUNT]: 5,
    job: {
      [COUNT]: 1,
      [DEEP]: 2,
      children: { [COUNT]: 1, [DEEP]: 3 },
      company: 0,
    },
    job2: 1,
    job3: [1, 2],
    children: {
      [DEEP]: 2,
    },
  },
  // 对生成的数据进行后处理
  callbacks: data => {
    return data;
  },
  // 中文环境
  locale: 'zh_CN',
});
console.log(userDatas);
