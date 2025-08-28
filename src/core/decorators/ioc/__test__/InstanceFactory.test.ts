import { InstanceFactory } from '../InstanceFactory';
import 'reflect-metadata';
import { InstanceScope } from '../types/ioc';
beforeEach(() => {
  InstanceFactory.clear();
});

describe('1. 实例工厂注册功能测试', () => {
  describe('1.1 注册基本功能测试', () => {
    test('1.1.1 当不指定模块时，默认注册到默认模块', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        constructor: TestClass,
      });
      expect(InstanceFactory.getInstanceItemByExpression('__default__.TestClass')?.constructor).toBe(TestClass);
    });
    test('1.1.2 当指定模块时，注册到指定模块', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        module: 'test',
        constructor: TestClass,
      });
      expect(InstanceFactory.getInstanceItemByExpression('test.TestClass')?.constructor).toBe(TestClass);
    });
    test('1.1.3 当不指定别名时，默认使用类名首字母小写作为别名（连续大写开头则保留）', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        module: 'test',
        constructor: TestClass,
      });
      expect(InstanceFactory.getInstanceItemByExpression('test.testClass')?.constructor).toBe(TestClass);
      expect(InstanceFactory.getInstanceItemByExpression('test.TestClass')?.constructor).toBe(TestClass);
      class TESTClass {}
      InstanceFactory.registerInstance({
        constructor: TESTClass,
      });
      expect(InstanceFactory.getInstanceItemByExpression('TESTClass')?.constructor).toBe(TESTClass);
      expect(InstanceFactory.getInstanceItemByExpression('__default__.TESTClass')?.constructor).toBe(TESTClass);
      expect(InstanceFactory.getInstanceItemByExpression('__default__.testClass')?.constructor).toBeUndefined();
    });
    test('1.1.4 当注册时指定别名，则使用别名获取实例', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        module: 'test',
        alias: 'testAlias',
        constructor: TestClass,
      });
      expect(InstanceFactory.getInstanceItemByExpression('test.testAlias')?.constructor).toBe(TestClass);
    });
  });
  describe('1.2 注册边界功能测试', () => {
    test('1.2.1 不允许多个相同构造器的实例注册', () => {
      class Animal {}

      InstanceFactory.registerInstance({
        constructor: Animal,
      });

      expect(() => {
        InstanceFactory.registerInstance({
          constructor: Animal,
        });
      }).toThrow(/Instance with alias or constructor or ctorName already exists in module/);
    });

    test('1.2.2 当默认别名相同时也不允许注册', () => {
      class Animal {}
      class animal {}
      InstanceFactory.registerInstance({
        constructor: Animal,
      });

      expect(() => {
        InstanceFactory.registerInstance({
          constructor: animal,
        });
      }).toThrow(/Instance with alias or constructor or ctorName already exists in module/);
    });
    test('1.2.3 当类型不同别名相同时也不允许注册', () => {
      class Animal {}
      class animal {}
      InstanceFactory.registerInstance({
        constructor: Animal,
        alias: 'animal',
      });

      expect(() => {
        InstanceFactory.registerInstance({
          constructor: animal,
          alias: 'animal',
        });
      }).toThrow(/Instance with alias or constructor or ctorName already exists in module/);
    });
    test('1.2.4 当类型不同别名不同时不允许注册', () => {
      class Animal {}
      class animal {}
      InstanceFactory.registerInstance({
        constructor: Animal,
        alias: 'animal1',
      });

      expect(() => {
        InstanceFactory.registerInstance({
          constructor: animal,
          alias: 'animal2',
        });
      }).not.toThrow(/Instance with alias or constructor or ctorName already exists in module/);
    });
    test('1.2.5 不同模块类型相同别名也相同允许注册', () => {
      class Animal {}
      InstanceFactory.registerInstance({
        module: 'test',
        constructor: Animal,
      });

      expect(() => {
        InstanceFactory.registerInstance({
          constructor: Animal,
        });
      }).not.toThrow(/Instance with alias or constructor or ctorName already exists in module/);
    });
  });
  describe('1.3 注册时参数校验功能测试', () => {
    describe('1.3.1 模块名必须是合法标识符', () => {
      test.each([
        { module: 'class' }, // 保留字
        { module: 'if' }, // 保留字
        { module: '123module' }, // 数字开头
        { module: 'test*test' }, // 非法字符
        { module: 'test test' }, // 包含空格
        { module: 'module..name' }, // 连续分隔符
      ])('非法模块名应报错：$module', ({ module }) => {
        class TestClass {}
        expect(() => {
          InstanceFactory.registerInstance({
            module,
            constructor: TestClass,
          });
        }).toThrow();
      });

      test.each([
        { module: 'validModule' },
        { module: 'valid_module' },
        { module: 'Valid1' },
        { module: '_privateModule' },
      ])('合法模块名应通过：$module', ({ module }) => {
        class TestClass {}

        expect(() => {
          InstanceFactory.registerInstance({
            module,
            constructor: TestClass,
          });
        }).not.toThrow();
      });
    });

    // 1.3.2 允许模块名包含分隔符
    describe('1.3.2 模块名允许包含 - 和 / 分隔符', () => {
      test.each([{ module: 'valid-module' }, { module: 'valid/module' }, { module: 'parent/child-module' }])(
        '带分隔符的模块名应通过：$module',
        ({ module }) => {
          class TestClass {}

          expect(() => {
            InstanceFactory.registerInstance({
              module,
              constructor: TestClass,
            });
          }).not.toThrow();
        },
      );
    });

    // 1.3.3 类名/别名校验
    describe('1.3.3 类名或别名必须是合法标识符', () => {
      test.each([
        { name: 'class' }, // 保留字
        { name: '1invalid' }, // 数字开头
        { name: 'invalid-name' }, // 包含连字符
      ])('非法类名应报错：$name', ({ name }) => {
        class TestClass {}

        expect(() => {
          InstanceFactory.registerInstance({
            module: 'valid-module',
            constructor: TestClass,
            alias: name, // 测试别名
          });
        }).toThrow();
      });

      test.each([{ name: 'ValidClass' }, { name: '_private' }, { name: 'Class1' }])(
        '合法类名应通过：$name',
        ({ name }) => {
          class TestClass {}

          expect(() => {
            InstanceFactory.registerInstance({
              module: 'valid-module',
              constructor: TestClass,
              alias: name,
            });
          }).not.toThrow();
        },
      );
    });

    // 1.3.6 构造函数校验
    describe('1.3.6 必须提供有效的构造函数', () => {
      expect(() => {
        InstanceFactory.registerInstance({
          module: 'valid-module',
          constructor: class ValidClass {},
        });
      }).not.toThrow();
    });
  });
});

describe('2. 实例工厂获取实例功能测试', () => {
  describe('2.1 获取实例基本功能测试', () => {
    test('2.1.1 能够通过表达式获取实例(不指定模块名)', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        constructor: TestClass,
      });
      expect(InstanceFactory.getInstanceItemByExpression('TestClass')?.constructor).toBe(TestClass);
    });
    test('2.1.2 能够通过表达式获取实例（指定模块名）', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        module: 'test',
        constructor: TestClass,
      });
      expect(InstanceFactory.getInstanceItemByExpression('test.TestClass')?.constructor).toBe(TestClass);
      InstanceFactory.registerInstance({
        constructor: TestClass,
      });
      expect(InstanceFactory.getInstanceItemByExpression('__default__.TestClass')?.constructor).toBe(TestClass);
    });
    test('2.1.3 能够类型推断获取实例，如果类型实例唯一', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        constructor: TestClass,
      });
      class TestClass2 {
        testClass!: TestClass;
      }
      Reflect.defineMetadata('design:type', TestClass, TestClass2.prototype, 'testClass');
      let type = Reflect.getMetadata('design:type', TestClass2.prototype, 'testClass');
      expect(InstanceFactory.getInstanceItemByType(type)?.constructor).toBe(TestClass);
    });
    test('2.1.4 能够通过配置module和 ctorNameOrAlias获取实例来获取实例', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        module: 'test',
        constructor: TestClass,
      });
      class TestClass2 {
        testClass!: TestClass;
      }
      Reflect.defineMetadata('design:type', TestClass, TestClass2.prototype, 'testClass');
      let type = Reflect.getMetadata('design:type', TestClass2.prototype, 'testClass');
      expect(
        InstanceFactory.getInstanceItemByConfig(type, { module: 'test', ctorNameOrAlias: 'TestClass' })?.constructor,
      ).toBe(TestClass);
      expect(
        InstanceFactory.getInstanceItemByConfig(type, { module: 'test', ctorNameOrAlias: 'testClass' })?.constructor,
      ).toBe(TestClass);
    });
    test('2.1.5 能够通过配置expression获取实例来获取实例', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        module: 'test',
        constructor: TestClass,
      });
      class TestClass2 {
        testClass!: TestClass;
      }
      Reflect.defineMetadata('design:type', TestClass, TestClass2.prototype, 'testClass');
      let type = Reflect.getMetadata('design:type', TestClass2.prototype, 'testClass');
      expect(InstanceFactory.getInstanceItemByConfig(type, { expression: 'test.TestClass' })?.constructor).toBe(
        TestClass,
      );
      expect(InstanceFactory.getInstanceItemByConfig(type, { expression: 'test.testClass' })?.constructor).toBe(
        TestClass,
      );
    });
    test('2.1.5 能够通过配置module和类型推断来获取实例来获取实例', () => {
      class TestClass {}
      InstanceFactory.registerInstance({
        module: 'test',
        constructor: TestClass,
      });
      class TestClass2 {
        testClass!: TestClass;
      }
      Reflect.defineMetadata('design:type', TestClass, TestClass2.prototype, 'testClass');
      let type = Reflect.getMetadata('design:type', TestClass2.prototype, 'testClass');
      expect(InstanceFactory.getInstanceItemByConfig(type, { module: 'test' })?.constructor).toBe(TestClass);
    });
  });
  describe('2.2 获取实例边界功能测试', () => {
    test('2.2.1 当仅有多个子类实例时会推断失败，此时必须提供相关信息来获取实例', () => {
      class Animal {}
      class Dog extends Animal {}
      InstanceFactory.registerInstance({
        constructor: Dog,
      });
      class Cat extends Animal {}
      InstanceFactory.registerInstance({
        constructor: Cat,
      });
      class TestClass {
        animal!: Animal;
      }
      Reflect.defineMetadata('design:type', Animal, TestClass.prototype, 'animal');
      let type = Reflect.getMetadata('design:type', TestClass.prototype, 'animal');
      expect(() => {
        InstanceFactory.getInstanceItemByType(type);
      }).toThrow(/Multiple instances/);
    });
    test('2.2.2 当每个模块仅仅有一个类型实例时会推断成功', () => {
      class Animal {}
      class Dog extends Animal {}
      InstanceFactory.registerInstance({
        constructor: Dog,
      });
      class Cat extends Animal {}
      InstanceFactory.registerInstance({
        module: 'test',
        constructor: Cat,
      });
      class TestClass {
        animal!: Animal;
      }
      Reflect.defineMetadata('design:type', Animal, TestClass.prototype, 'animal');
      let type = Reflect.getMetadata('design:type', TestClass.prototype, 'animal');
      expect(() => {
        InstanceFactory.getInstanceItemByType(type);
      }).not.toThrow(/Multiple instances/);
    });
    test('2.2.3 当一个模块有多个类型实例，但是存在最佳类型实例也会推断成功', () => {
      class Animal {}
      InstanceFactory.registerInstance({
        constructor: Animal,
      });
      class Dog extends Animal {}
      InstanceFactory.registerInstance({
        constructor: Dog,
      });
      class Cat extends Animal {}
      InstanceFactory.registerInstance({
        constructor: Cat,
      });
      class TestClass {
        animal!: Animal;
      }
      Reflect.defineMetadata('design:type', Animal, TestClass.prototype, 'animal');
      let type = Reflect.getMetadata('design:type', TestClass.prototype, 'animal');
      expect(() => {
        InstanceFactory.getInstanceItemByType(type);
      }).not.toThrow(/Multiple instances/);
    });
  });
  describe('2.3 获取实例参数校验测试', () => {
    describe('2.3.4 表达式格式校验', () => {
      test.each([
        { expr: 'module..name' }, // 连续点
        { expr: 'module.' }, // 点后无内容
        { expr: 'module.invalid-name' }, // 非法标识符
      ])('2.3.4.1 非法表达式应报错：$expr', ({ expr }) => {
        class TestClass {}

        expect(() => {
          InstanceFactory.getInstance(TestClass, '', expr);
        }).toThrow();
      });

      test.each([{ expr: 'module.name' }, { expr: 'parent-module.child' }, { expr: 'parent/child.module' }])(
        '2.3.4.2 合法表达式应通过：$expr',
        ({ expr }) => {
          InstanceFactory.clear();
          class TestClass {}
          InstanceFactory.registerInstance({
            module: 'module',
            alias: 'name',
            constructor: TestClass,
          });
          InstanceFactory.registerInstance({
            module: 'parent-module',
            alias: 'child',
            constructor: TestClass,
          });
          InstanceFactory.registerInstance({
            module: 'parent/child',
            alias: 'module',
            constructor: TestClass,
          });

          expect(() => {
            InstanceFactory.getInstance(TestClass, '', expr);
          }).not.toThrow();
        },
      );
    });

    // 1.3.5 作用域校验
    describe('2.3.5 作用域必须是预定义值', () => {
      test.each([
        {
          scope: '  RANDOM ',
          shouldThrow: true,
          description: '非预定义值应报错',
        },
        {
          scope: ' singleton   ',
          shouldThrow: false,
          description: '大小写不敏感应自动转换',
        },
        {
          scope: 123,
          shouldThrow: true,
          description: '非字符串类型应报错',
        },
      ])('2.3.5.1 $description: $scope', ({ scope, shouldThrow }) => {
        class TestClass {}
        const testFn = () => {
          InstanceFactory.getInstance(TestClass, '', {
            module: 'valid-module',
            scope: scope as InstanceScope, // 类型断言
          });
        };

        shouldThrow ? expect(testFn).toThrow() : expect(testFn).not.toThrow();
      });

      test.each([{ scope: 'SINGLETON' }, { scope: 'TRANSIENT' }, { scope: 'DEEPCLONE' }])(
        '2.3.5.2 合法作用域应通过：$scope',
        ({ scope }) => {
          class TestClass {}

          expect(() => {
            InstanceFactory.getInstance(TestClass, '', {
              module: 'valid-module',
              scope,
            });
          }).not.toThrow();
        },
      );
    });
  });
});

test.only('instance 静态代码块', () => {
  InstanceFactory.clear();
});
