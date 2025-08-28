import { DECORATORNAME } from '@/core/constants/DecoratorConstants';
import { ClassDecoratorStateManager } from '../ClassDecoratorStateManager';
import 'reflect-metadata';
import { DecoratorInfo } from '@/core/decorators/DecoratorInfo';
const cmdm = new ClassDecoratorStateManager();
describe('1 类元数据管理器功能测试', () => {
  test('1.1 应该能正确设置类装饰器信息列表元数据', () => {
    class TestClass {}
    cmdm.setDecoratorInfos(TestClass, []);
    expect(cmdm.hasDecoratorInfos(TestClass)).toBeTruthy();
    expect(cmdm.getDecoratorInfos(TestClass)).toEqual([]);
  });

  test('1.2 当后一次调用setDecoratorInfos时，应该覆盖之前的元数据', () => {
    class TestClass {}
    cmdm.setDecoratorInfos(TestClass, []);
    expect(cmdm.hasDecoratorInfos(TestClass)).toBeTruthy();
    expect(cmdm.getDecoratorInfos(TestClass)).toEqual([]);
    cmdm.setDecoratorInfos(TestClass, [
      new DecoratorInfo({
        name: 'test',
        configs: [],
        type: 'class',
        conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
        dependsOn: [],
      }),
    ]);
    expect(cmdm.hasDecoratorInfos(TestClass)).toBeTruthy();
    expect(cmdm.getDecoratorInfos(TestClass)).toEqual([
      {
        name: 'test',
        configs: [],
        type: 'class',
        conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
        dependsOn: [],
      },
    ]);
  });
  test('1.3 应该能够向已有装饰器列表中添加装饰器信息', () => {
    class TestClass {}
    cmdm.setDecoratorInfos(TestClass, []);
    expect(cmdm.hasDecoratorInfos(TestClass)).toBeTruthy();
    expect(cmdm.getDecoratorInfos(TestClass)).toEqual([]);
    cmdm.setDecoratorInfo(
      TestClass,
      new DecoratorInfo({
        name: DECORATORNAME.COMPONENT,
        type: 'class',
        conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
      }),
    );
    expect(cmdm.hasDecoratorInfo(TestClass, DECORATORNAME.COMPONENT)).toBeTruthy();
    expect(cmdm.getDecoratorInfo(TestClass, DECORATORNAME.COMPONENT)).toEqual({
      name: DECORATORNAME.COMPONENT,
      configs: [],
      type: 'class',
      conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
      dependsOn: [],
    });
  });
  test('1.4 若有重复的装饰器名称，则应该只添加配置', () => {
    class TestClass {}
    cmdm.setDecoratorInfos(TestClass, []);
    expect(cmdm.hasDecoratorInfos(TestClass)).toBeTruthy();
    expect(cmdm.getDecoratorInfos(TestClass)).toEqual([]);
    cmdm.setDecoratorInfo(
      TestClass,
      new DecoratorInfo({
        name: DECORATORNAME.COMPONENT,
        configs: [{ id: 1 }],
        type: 'class',
        conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
      }),
    );
    expect(cmdm.hasDecoratorInfo(TestClass, DECORATORNAME.COMPONENT)).toBeTruthy();
    expect(cmdm.getDecoratorInfo(TestClass, DECORATORNAME.COMPONENT)).toEqual({
      name: DECORATORNAME.COMPONENT,
      configs: [{ id: 1 }],
      type: 'class',
      conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
      dependsOn: [],
    });
    cmdm.setDecoratorInfo(
      TestClass,
      new DecoratorInfo({
        name: DECORATORNAME.COMPONENT,
        configs: [{ id: 2 }],
        type: 'class',
        conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
      }),
    );
    expect(cmdm.hasDecoratorInfo(TestClass, DECORATORNAME.COMPONENT)).toBeTruthy();
    expect(cmdm.getDecoratorInfo(TestClass, DECORATORNAME.COMPONENT)).toEqual({
      name: DECORATORNAME.COMPONENT,
      configs: [{ id: 1 }, { id: 2 }],
      type: 'class',
      conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
      dependsOn: [],
    });
  });

  test('1.5 若没有装饰器信息列表而添加装饰器信息时会报错', () => {
    class TestClass {}

    expect(() => {
      cmdm.setDecoratorInfo(
        TestClass,
        new DecoratorInfo({
          name: DECORATORNAME.COMPONENT,
          configs: [{ id: 1 }],
          type: 'class',
          conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.GET],
        }),
      );
    }).toThrow(/No decoratorinfos metadata found/);
  });

  test('1.6 若没有装饰器信息列表而获取装饰器信息列表则获取为空', () => {
    class TestClass {}
    expect(cmdm.getDecoratorInfos(TestClass)).toBeUndefined();
  });

  test('1.7 若没有装饰器信息列表而获取装饰器信息则获取为空', () => {
    class TestClass {}
    expect(cmdm.getDecoratorInfo(TestClass, DECORATORNAME.COMPONENT)).toBeUndefined();
  });
});
