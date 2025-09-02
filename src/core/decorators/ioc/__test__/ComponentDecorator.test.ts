import { DECORATORNAME } from '@/core/constant/DecoratorConstants';
import { InstanceFactory } from '../InstanceFactory';
import { ClassDecoratorStateManager } from '@/core/statemanager/ClassDecoratorStateManager';
import { Component } from '../..';
beforeEach(() => {
  InstanceFactory.clear();
});
describe('1.@Component装饰器校验功能测试', () => {
  describe('1.1 校验装饰器', () => {
    test('1.1.1 不允许装饰器冲突', () => {
      expect(() => {
        @Component()
        @Component()
        class Test {}
      }).toThrow(/decorator confilct/);
    });
  });
  describe.skip('1.2 校验配置项', () => {
    test.each([
      { exps: 'default.config' },
      { exps: '.config' },
      { exps: 'if.config' },
      { exps: 'default/config' },
      { exps: 'default-config' },
    ])('1.2.1 不合法表达式：$exps会报错', ({ exps }) => {
      expect(() => {
        @Component(exps)
        class Test {}
      }).toThrow();
    });
    test.each([
      { exps: 'x1.config' },
      { exps: '__default__.config' },
      { exps: 'xx/xx.config' },
      { exps: 'xxx-xxx.config' },
    ])('1.2.2 合法表达式：$exps会通过', ({ exps }) => {
      expect(() => {
        @Component(exps)
        class Test {}
      }).not.toThrow();
    });
    test.each([
      { module: 'default.config', alias: 'cs' },
      { module: '.config', alias: 'cs' },
      { module: 'if.config', alias: 'cs' },
      { module: 'default*config', alias: 'cs' },
      { module: 'default', alias: 'cs' },
      { module: 'xconfig', alias: 'cs.aaa' },
      { module: 'xconfig', alias: '1cs' },
      { module: 'xconfig', alias: 'cs/asd' },
      { module: 'xconfig', alias: 'cs-asd' },
      { module: 'xconfig', alias: '99' },
    ])('1.2.3 不合法配置对象：$module  $alias会报错', cfg => {
      expect(() => {
        @Component(cfg)
        class Test {}
      }).toThrow();
    });
    test.each([
      { module: 'xx/xx', alias: 'cs' },
      { module: 'xx-xx', alias: 'cs' },
      { module: 'xx/xx', alias: '__cs__' },
      { module: '_xx/xx', alias: 'cs' },
      { module: 'xx/__xx', alias: 'cs_1' },
      { module: 'xx/__xx', alias: 'cs1_' },
    ])('1.2.4 合法配置对象：$module  $alias不会报错', cfg => {
      expect(() => {
        @Component(cfg)
        class Test {}
      }).not.toThrow();
    });
  });
  describe('1.3 处理配置', () => {
    test('1.3.1 传入的表达式会被转为正确的配置,并加入构造器', () => {
      @Component('xxx/xx.cs')
      class Test {}
      expect(InstanceFactory.getInstanceItemByExpression('xxx/xx.cs')?.ctor).toBe(Test);
    });
    test('1.3.2 传入的表达式不指定模块名时会被加入构造器转为正确的配置，且存入默认模块', () => {
      @Component('cs')
      class Test {}
      expect(InstanceFactory.getInstanceItemByExpression('__default__.cs')?.ctor).toBe(Test);
    });
    test('1.3.3 传入配置对象会被添加构造器转为实例工厂配置', () => {
      @Component({ alias: 'cs' })
      class Test {}
      expect(InstanceFactory.getInstanceItemByExpression('__default__.cs')?.ctor).toBe(Test);
    });
  });
  describe('1.4 配置会添加到实例工厂，并创建实例到容器', () => {
    test('1.4.1 传入配置对象会被添加构造器转为实例工厂配置', () => {
      @Component({ module: 'xx/xx', alias: 'cs' })
      class Test {}
      expect(InstanceFactory.getInstanceItemByExpression('xx/xx.cs')?.ctor).toBe(Test);
    });

    test('1.4.2 传入配置对象会被添加构造器转为实例工厂配置', () => {
      @Component({ module: 'xx/xx', alias: 'cs' })
      class Test {}
      expect(InstanceFactory.getInstanceItemByExpression('xx/xx.cs')?.ctor).toBe(Test);
    });
  });
  describe('1.5 类上被正确设置了元数据', () => {
    test('1.5.1 在类上添加了装饰器信息列表', () => {
      @Component({ module: 'xx/xx', alias: 'cs' })
      class Test {}
      const cdsm = new ClassDecoratorStateManager();
      const decoratorInfos = cdsm.getDecoratorInfos(Test);
      expect(decoratorInfos?.length).toBe(1);
    });

    test('1.5.2 在装饰器信息列表上添加了装饰器信息', () => {
      @Component({ module: 'xx/xx', alias: 'cs' })
      class Test {}
      const cdsm = new ClassDecoratorStateManager();
      const decoratorInfo = cdsm.getDecoratorInfo(Test, DECORATORNAME.COMPONENT);
      console.log(decoratorInfo);

      expect(decoratorInfo).toEqual({
        name: DECORATORNAME.COMPONENT,
        type: 'ioc',
        configs: [{ module: 'xx/xx', constructor: Test, alias: 'cs' }],
        conflictList: [DECORATORNAME.COMPONENT, DECORATORNAME.HTTPAPI],
        dependsOn: [],
      });
    });
  });
});
