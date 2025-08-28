import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { InjectDecoratorStateManager } from '@/core/statemanager/ioc/InjectDecoratorStateManager';
import { Component, Inject } from '../..';

@Component('module/x2.x2')
class Test2 {}
@Component('modulex1.x1')
class Test1 {
  obj = new Test2();
  age = 12;
}

@Component('module-x3.x3')
class Test3 {}
@Component('x4')
class Test4 {}
@Component()
class TestClass {}
const pdsm = new InjectDecoratorStateManager();

describe('1. @Inject装饰器功能测试', () => {
  test('1.1. 装饰器冲突检测功能测试', () => {
    expect(() => {
      class Test {
        @Inject()
        @Inject()
        test1!: Test1;
      }
    }).toThrow(/Conflict decorator/);
  });

  test.skip('1.2. 配置处理功能测试', () => {
    class Test {
      @Inject({
        module: 'test',
        backups: [new Test1(), new Test2(), new Test3()],
      })
      test1!: Test1;
    }
  });
  describe('1.4. 状态设置功能测试', () => {
    test('1.4.1. 存储装饰器信息', () => {
      class Test {
        @Inject({
          module: 'test',
          backups: [new Test1(), new Test2(), new Test3()],
        })
        test1!: Test1;

        @Inject('m2.t2')
        test2!: Test2;
      }
      console.log(pdsm.getDecoratorInfos(Test.prototype, 'test2'));

      expect(pdsm.getDecoratorInfos(Test.prototype, 'test2')).toEqual([
        {
          name: DECORATORNAME.INJECT,
          type: 'property',
          configs: ['m2.t2'],
          conflictList: [DECORATORNAME.INJECT],
          dependsOn: [],
        },
      ]);
    });
    test('1.4.2. 存储备选列表信息', () => {
      class Test {
        @Inject({
          module: 'test',
          backups: [new Test1(), Test2, new Test3()],
        })
        test1!: Test1;

        @Inject({
          module: 'test',
          backups: undefined,
        })
        test2!: Test1;

        @Inject({
          module: 'test',
          backups: new Test3(),
        })
        test3!: Test1;

        @Inject({
          module: 'test',
          backups: Test4,
        })
        test4!: Test1;
      }
      expect(pdsm.getInjectBackups(Test.prototype, 'test1')).toEqual([new Test1(), Test2, new Test3()]);
      expect(pdsm.getInjectBackups(Test.prototype, 'test2')).toEqual([]);
      expect(pdsm.getInjectBackups(Test.prototype, 'test3')).toEqual([new Test3()]);
      expect(pdsm.getInjectBackups(Test.prototype, 'test4')).toEqual([Test4]);
    });
  });
  describe('1.5. 核心功能测试', () => {
    test('1.5.1. 能够通过类型推断注入', () => {
      class Test {
        @Inject({
          module: 'modulex1',
        })
        test1!: Test1;

        @Inject()
        test2!: TestClass;
      }
      let test = new Test();
      expect(test.test1).toBeInstanceOf(Test1);
      expect(test.test2).toBeInstanceOf(TestClass);
    });
    test('1.5.1. 能够通过表达式注入', () => {
      class Test {
        @Inject({
          module: 'modulex1',
          expression: 'modulex1.x1',
        })
        test1!: Test1;

        @Inject('module/x2.x2')
        test2!: Test2;

        @Inject('testClass')
        test3!: TestClass;
      }
      let test = new Test();
      expect(test.test1).toBeInstanceOf(Test1);
      expect(test.test2).toBeInstanceOf(Test2);
      expect(test.test3).toBeInstanceOf(TestClass);
    });
    test('1.5.2. 能够通过配置注入', () => {
      class Test {
        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
        })
        test1!: Test1;

        @Inject({
          module: 'module/x2',
          ctorNameOrAlias: 'x2',
          expression: 'module-x3.x3',
        })
        test2!: Test2;
      }
      let test = new Test();
      expect(test.test1).toBeInstanceOf(Test1);
      expect(test.test2).toBeInstanceOf(Test2);
    });
    test('1.5.3. 注入失败时应该为空', () => {
      class Test {
        @Inject({
          module: 'modulex11',
          ctorNameOrAlias: 'x1',
        })
        test1!: Test1;

        @Inject({
          expression: 'module-x311.x3',
        })
        test2!: Test2;

        @Inject('module-x311.x3')
        test3!: Test3;

        @Inject()
        test4!: Test3;
      }
      let test = new Test();
      expect(test.test1).toBeUndefined();
      expect(test.test2).toBeUndefined();
      expect(test.test3).toBeUndefined();
      expect(test.test4).toBeUndefined();
    });
    test('1.5.4. 能够实现单例模式注入', () => {
      class Test {
        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
        })
        test1!: Test1;

        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
        })
        test2!: Test1;
      }
      let test = new Test();
      expect(test.test1).toBe(test.test2);
    });
    test('1.5.5. 能够实现瞬时模式注入', () => {
      class Test {
        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
          scope: 'transient',
        })
        test1!: Test1;

        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
        })
        test2!: Test1;
      }
      let test = new Test();
      expect(test.test1).not.toBe(test.test2);
      expect(test.test1).toBeInstanceOf(Test1);
      expect(test.test2).toBeInstanceOf(Test1);
    });
    test('1.5.6. 能够实现深克隆模式模式注入', () => {
      class Test {
        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
          scope: 'deepClone',
        })
        test1!: Test1;

        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
        })
        test2!: Test1;
      }
      let test = new Test();
      expect(test.test1.obj).not.toBe(test.test2.obj);
      expect(test.test1.age).toBe(test.test2.age);
    });
    test('1.5.7. 能够实现浅克隆模式模式注入', () => {
      class Test {
        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
          scope: 'shallowClone',
        })
        test1!: Test1;

        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
        })
        test2!: Test1;
      }
      let test = new Test();
      expect(test.test1.obj).toBe(test.test2.obj);
      expect(test.test1.age).toBe(test.test2.age);
    });
    test('1.5.8. 能够实现原型模式模式注入', () => {
      class Test {
        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
          scope: 'prototype',
        })
        test1!: Test1;

        @Inject({
          module: 'modulex1',
          ctorNameOrAlias: 'x1',
        })
        test2!: Test1;
      }
      let test = new Test();
      expect(Object.getPrototypeOf(test.test1)).toBe(test.test2);
    });
    test('1.5.9. 注入失败时能够使用备选实例名单中的实例进行注入', () => {
      const ins1 = new Test1();
      class Test {
        @Inject({
          module: 'modulex1212',
          ctorNameOrAlias: 'x1',
          backups: [ins1, new Test2()],
        })
        test1!: Test1;

        @Inject({
          module: 'modulex1212',
          ctorNameOrAlias: 'x1',
          backups: [Test2, new Test3()],
        })
        test2!: Test1;

        @Inject({
          module: 'modulex1212',
          ctorNameOrAlias: 'x1',
          backups: ['aaa', new Test3()],
        })
        test3!: Test1;

        @Inject({
          module: 'modulex1212',
          ctorNameOrAlias: 'x1',
          backups: ['aaa', 'bbb'],
        })
        test4!: Test1;

        @Inject({
          module: 'modulex1212',
          ctorNameOrAlias: 'x1',
          backups: [],
        })
        test5!: Test1;

        @Inject({
          module: 'modulex1212',
          ctorNameOrAlias: 'x1',
          backups: undefined,
        })
        test6!: Test1;
      }
      let test = new Test();
      expect(test.test1).toBe(ins1);
      expect(test.test2).toBeInstanceOf(Test2);
      expect(test.test3).toBeInstanceOf(Test3);
      expect(test.test4).toBeUndefined();
      expect(test.test5).toBeUndefined();
      expect(test.test6).toBeUndefined();
    });
    test('1.5.10. 注入时类型不匹配会报警告', () => {
      // 1. 创建 spy 监听 console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        console.log('inject内部调用的是mock warn函数');
      });
      class Test {
        @Inject('testClass')
        test3!: Test3;
      }
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore(); // 恢复原始实现
    });
  });
});
