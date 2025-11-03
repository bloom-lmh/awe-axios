import { DataField, DataModel, defineModel, faker } from 'data-faker-plus';

/* export const userModel = defineModel('user', {
  id: 'string.uuid',
  firstName: 'person.firstName',
  lastName: 'person.lastName',
  age: ['number.int', { min: 1, max: 120 }],
  email: ctx => {
    return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.lastName });
  },
  phone: 'phone.number',
  sex: 'person.sex',
}); */

@DataModel('user')
export class UserModel {
  @DataField('string.uuid')
  declare id: string;
  @DataField('person.firstName')
  declare firstName: string;
  @DataField('person.lastName')
  declare lastName: string;
  @DataField(['number.int', { min: 1, max: 120 }])
  declare age: number;
  @DataField(ctx => {
    return faker.internet.email({ firstName: ctx.firstName, lastName: ctx.lastName });
  })
  declare email: string;
  @DataField('phone.number')
  declare phone: string;
  @DataField('person.sex')
  declare sex: string;
}
