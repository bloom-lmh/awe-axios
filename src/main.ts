import { defineModel, FakeData } from './core/decorators/faker/DataFaker';
import { COUNT, DEEP } from './core/constant/DataFakerConstants';

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
    [COUNT]: 4,
  },
  job2: jobModel,
  job3: {
    refModel: 'job',
    [DEEP]: 3,
  },
  children: {
    refModel: 'user',
    [COUNT]: 1,
  },
});
const userDatas = FakeData(userModel, {
  rules: {
    [COUNT]: 1,
    job: {
      [COUNT]: 3,
      children: {
        [DEEP]: 2,
      },
      company: 0,
    },
    job2: 0,
    job3: [1, 2],
    children: {
      [DEEP]: 3,
    },
  },
});
console.log(userDatas);
const user2 = userModel.clone('user2');
/* defineModel(
  'student',
  userModel
    .clone()
    .withProperty('age', ['number.int', { min: 5, max: 18 }])
    .withProperties({
      sId: 'number.int',
    }),
); */
/* 
const studentModel = userModel
  .clone()
  .setProperty('age', ['number.int', { min: 5, max: 18 }])
  .setProperties({
    sId: 'number.int',
  });

const studentDatas = FakeData(studentModel);
console.log(studentDatas); */
