import { Component, HttpApi, Inject } from '@/core/ioc';
import { describe, test } from 'vitest';
import { Get } from '..';
import { HttpResponse } from 'msw';
import 'reflect-metadata';
describe('ioc test', () => {
  test('按模块名和别名注册', () => {
    class Animal {}

    @Component()
    class Person extends Animal {}

    @Component()
    class User extends Person {}

    class UserService {
      @Inject()
      user!: Animal;
    }

    let userService = new UserService();
    const type = Reflect.getMetadata('design:type', userService, 'user');
    console.log(type);
    console.log(userService.user);
  });
  test('多种注入方式', () => {
    @Component()
    class User {}

    class UserService {
      @Inject(User)
      user1!: User;
      @Inject({
        module: '__default__',
        alias: 'user',
      })
      user2!: User;
      @Inject('user')
      user3!: User;
      @Inject('__default__.user')
      user4!: User;
      @Inject({
        module: '__default__',
        alias: 'user',
        ctor: User,
      })
      user5!: User;
    }

    let userService = new UserService();
    console.log(userService.user1);
    console.log(userService.user2);
    console.log(userService.user3);
    console.log(userService.user4);
    console.log(userService.user5);
  });
  test('作用域:瞬时模式', () => {
    @Component()
    class User {}
    class UserService {
      @Inject(User)
      user1!: User;
      @Inject({
        module: '__default__',
        alias: 'user',
      })
      user2!: User;
    }
    let userService = new UserService();
    console.log(userService.user1 === userService.user2); // true
  });
  test('作用域:单例模式', () => {
    @Component()
    class User {}
    class UserService {
      @Inject({
        ctor: User,
        scope: 'SINGLETON',
      })
      user1!: User;
      @Inject({
        module: '__default__',
        alias: 'user',
        scope: 'SINGLETON',
      })
      user2!: User;
    }
    let userService = new UserService();

    console.log(userService.user1 === userService.user2); // true
  });
  test('作用域:原型模式', () => {
    @Component()
    class User {}
    class UserService {
      @Inject({
        ctor: User,
        scope: 'PROTOTYPE',
      })
      user1!: User;
    }
    let userService = new UserService();
    // user1 以 User类实例为原型
    console.log(userService.user1 instanceof User); // true
    console.log(Object.getPrototypeOf(userService.user1)); // User {}
  });
  test('作用域:浅克隆模式', () => {
    @Component()
    class User {
      obj: any = { a: 1 };
    }
    class UserService {
      @Inject({
        ctor: User,
        scope: 'SINGLETON',
      })
      user1!: User;
      @Inject({
        ctor: User,
        scope: 'SHALLOWCLONE',
      })
      user2!: User;
    }
    let userService = new UserService();
    // 改变user1的obj中的a属性
    userService.user1.obj.a = 2;
    // 由于采用的是浅克隆，所以user2的obj中的a属性也会随之改变
    console.log(userService.user2.obj.a);
  });
  test('作用域:深克隆模式', () => {
    @Component()
    class User {
      obj: any = { a: 1 };
    }
    class UserService {
      @Inject({
        ctor: User,
        scope: 'SINGLETON',
      })
      user1!: User;
      @Inject({
        ctor: User,
        scope: 'DEEPCLONE',
      })
      user2!: User;
    }
    let userService = new UserService();
    // 改变user1的obj中的a属性
    userService.user1.obj.a = 2;
    // 由于采用的是深克隆，所以user2的obj中的a属性不会随之改变
    console.log(userService.user2.obj.a); //1
  });

  test.only('依赖备选', () => {
    class User {
      obj: any = { a: 1 };
    }
    class Student {}
    class UserService {
      @Inject({
        alias: 'person',
        backups: [User, Student],
      })
      user1!: User;
    }
    let userService = new UserService();
    // 没有person实例，所以采用备用User类作为实例 User { obj: { a: 1 } }
    console.log(userService.user1);
  });
});
