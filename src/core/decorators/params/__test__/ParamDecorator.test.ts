import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { ParamDecoratorStateManager } from '@/core/statemanager/ParamDecoratorStateManager';
import { PathParam, QueryParam } from '../..';
import { DecoratorInfo } from '../../DecoratorInfo';

const psm = new ParamDecoratorStateManager();
describe('1. @PathParam基本功能测试', () => {
  test('1.1 不允许出现在同一个参数上有冲突的装饰器', () => {
    expect(() => {
      class Test {
        getUserById(@PathParam('id') @PathParam('id') id: number) {}
      }
    }).toThrow(/same time/);
  });
  test('1.2 不允许出现重复参数名', () => {
    expect(() => {
      class Test {
        getUserById(@PathParam('id') id: number, @PathParam('id') id2: number) {}
      }
    }).toThrow(/Duplicate/);
  });
  test('1.3 能够正确设置状态', () => {
    class Test {
      getUserById(@PathParam('id') id: number, @PathParam('name') name: string) {}
    }
    const test = new Test();
    console.log(psm.getDecoratorInfo(Test.prototype, DECORATORNAME.PATHPARAM, 'getUserById'));

    expect(psm.getDecoratorInfo(Test.prototype, DECORATORNAME.PATHPARAM, 'getUserById')).toEqual(
      new DecoratorInfo({
        name: DECORATORNAME.PATHPARAM,
        type: 'unknown',
        configs: [
          { paramName: 'name', paramIndex: 1 },
          { paramName: 'id', paramIndex: 0 },
        ],
        conflictList: [DECORATORNAME.PATHPARAM, DECORATORNAME.QUERYPARAM, DECORATORNAME.BODYPARAM],
        dependsOn: [],
      }),
    );
  });
});

describe('1. @QueryParam基本功能测试', () => {
  test('1.1 不允许出现在同一个参数上有冲突的装饰器', () => {
    expect(() => {
      class Test {
        getUserById(@QueryParam('id') @QueryParam('id') id: number) {}
      }
    }).toThrow(/same time/);
  });
  test('1.2 允许出现重复参数名', () => {
    expect(() => {
      class Test {
        getUserById(@QueryParam('id') id: number, @QueryParam('id') id2: number) {}
      }
    }).not.toThrow();
  });
  test('1.3 能够正确设置状态', () => {
    class Test {
      getUserById(@QueryParam('id') id: number, @QueryParam('name') name: string, @QueryParam('id') id2: number) {}
    }
    const test = new Test();
    console.log(psm.getDecoratorInfo(Test.prototype, DECORATORNAME.QUERYPARAM, 'getUserById'));

    expect(psm.getDecoratorInfo(Test.prototype, DECORATORNAME.QUERYPARAM, 'getUserById')).toEqual(
      new DecoratorInfo({
        name: DECORATORNAME.QUERYPARAM,
        type: 'unknown',
        configs: [
          { paramName: 'id', paramIndex: 2 },
          { paramName: 'name', paramIndex: 1 },
          { paramName: 'id', paramIndex: 0 },
        ],
        conflictList: [DECORATORNAME.PATHPARAM, DECORATORNAME.QUERYPARAM, DECORATORNAME.BODYPARAM],
        dependsOn: [],
      }),
    );
  });
});
