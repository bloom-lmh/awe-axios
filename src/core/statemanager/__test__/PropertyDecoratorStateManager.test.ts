import { DECORATORNAME } from '@/core/constants/DecoratorConstants';
import 'reflect-metadata';
import { PropertyDecoratorStateManager } from '../PropertyDecoratorStateManager';
import { DecoratorInfo } from '@/core/decorators/DecoratorInfo';
const pmdm = new PropertyDecoratorStateManager();
describe('1 属性元数据管理器功能测试', () => {
  test('1.1 应该能正确在属性上设置属性装饰器信息列表元数据', () => {
    class Test {
      prop!: string;
    }
    pmdm.setDecoratorInfos(Test, [], 'prop');
    expect(pmdm.getDecoratorInfos(Test, 'prop')).toEqual([]);
  });

  test('1.2 当后一次调用setDecoratorInfos时，应该覆盖之前的元数据', () => {
    class Test {
      prop!: string;
    }
    pmdm.setDecoratorInfos(Test, [], 'prop');
    expect(pmdm.getDecoratorInfos(Test, 'prop')).toEqual([]);
    pmdm.setDecoratorInfos(
      Test,
      [
        new DecoratorInfo({
          name: DECORATORNAME.INJECT,
          type: 'property',
        }),
      ],
      'prop',
    );
    expect(pmdm.getDecoratorInfos(Test, 'prop')).toEqual([
      {
        name: DECORATORNAME.INJECT,
        type: 'property',
        configs: [],
        conflictList: [],
        dependsOn: [],
      },
    ]);
  });
  test('1.3 应该能够向已有装饰器列表中添加装饰器信息', () => {
    class Test {
      prop!: string;
    }
    pmdm.setDecoratorInfos(Test, [], 'prop');
    pmdm.setDecoratorInfo(
      Test,
      new DecoratorInfo({
        name: DECORATORNAME.INJECT,
        type: 'property',
        configs: [{ name: '2' }],
      }),
      'prop',
    );
    expect(pmdm.getDecoratorInfo(Test, DECORATORNAME.INJECT, 'prop')).toEqual({
      name: DECORATORNAME.INJECT,
      type: 'property',
      configs: [{ name: '2' }],
      conflictList: [],
      dependsOn: [],
    });
  });
  test('1.4 若有重复的装饰器名称，则应该只添加配置', () => {
    class Test {
      prop!: string;
    }
    pmdm.setDecoratorInfos(
      Test,
      [
        new DecoratorInfo({
          name: DECORATORNAME.INJECT,
          type: 'property',
          configs: [{ name: '1' }],
        }),
      ],
      'prop',
    );
    pmdm.setDecoratorInfo(
      Test,
      new DecoratorInfo({
        name: DECORATORNAME.INJECT,
        type: 'property',
        configs: [{ name: '2' }],
      }),
      'prop',
    );
    expect(pmdm.getDecoratorInfo(Test, DECORATORNAME.INJECT, 'prop')).toEqual({
      name: DECORATORNAME.INJECT,
      type: 'property',
      configs: [{ name: '1' }, { name: '2' }],
      conflictList: [],
      dependsOn: [],
    });
  });

  test('1.5 若没有装饰器信息列表而添加装饰器信息时会报错', () => {
    class Test {
      prop!: string;
    }
    expect(() => {
      pmdm.setDecoratorInfo(
        Test,
        new DecoratorInfo({
          name: DECORATORNAME.INJECT,
          type: 'property',
          configs: [{ name: '2' }],
          conflictList: [],
        }),
        'prop',
      );
    }).toThrow();
  });

  test('1.6 若没有装饰器信息列表而获取装饰器信息列表则获取为空', () => {
    class Test {
      prop!: string;
    }
    expect(pmdm.getDecoratorInfos(Test, 'prop')).toBeUndefined();
  });

  test('1.7 若没有装饰器信息列表而获取装饰器信息则获取为空', () => {
    class Test {
      prop!: string;
    }
    expect(pmdm.getDecoratorInfo(Test, DECORATORNAME.INJECT, 'prop')).toBeUndefined();
  });
});
