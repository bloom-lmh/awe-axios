import { DataField } from '..';

describe('Faker Decorator', () => {
  test('should return a random number', () => {
    class Person {
      @DataField('string.uuid')
      declare id: number;
      @DataField('airline.aircraftType')
      declare name: string;
      @DataField('number.int', [{ min: 12, max: 29 }])
      declare age: number;
      @DataField(ctx => {
        return 'hello';
      })
      declare email: string;
      private sex: number = 1;
    }
  });
});
