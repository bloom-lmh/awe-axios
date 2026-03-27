# 迁移指南

这份文档说明的是：如何从旧包名迁移到新的 Decoraxios 包体系。

## 1. 根包改名了

旧名字：

- `awe-axios`

新名字：

- `decoraxios`

大多数项目只需要把导入改成这样：

```ts
import { Get, HttpApi } from 'decoraxios';
```

兼容说明：

- `awe-axios` 仍然保留为兼容别名包
- `awe-axios/core` 仍然会转发到 `decoraxios/core`

## 2. scoped 子包也统一改名了

旧名字：

- `@decoraxios/awe-axios-core`
- `@decoraxios/awe-axios-mock`
- `@decoraxios/awe-axios-ioc-aop`
- `@decoraxios/awe-axios-all`

新名字：

- `@decoraxios/core`
- `@decoraxios/mock`
- `@decoraxios/ioc-aop`
- `@decoraxios/all`

示例：

```ts
import { Mock } from '@decoraxios/mock';
import { Component } from '@decoraxios/ioc-aop';
```

兼容说明：

- 旧的 scoped 包名仍然会继续发布一段时间，作为转发别名存在

## 3. 依然保持 core-first

这次只是统一品牌，不改变之前已经确定的拆包思路：

- `decoraxios` 默认只代表 core 能力
- `@decoraxios/all` 才是显式的 full bundle

只有你明确想要“一次安装拿全套”时，才应该使用 `@decoraxios/all`。

## 4. peerDependencies 归应用自己管理

这些依赖依然由宿主应用自己控制：

- `axios`
- `msw`
- `reflect-metadata`

这样可以避免库偷偷内置运行时依赖，也更方便你自己管理版本。

## 5. 迁移清单

- 把 `awe-axios` 替换成 `decoraxios`
- 把 `@decoraxios/awe-axios-*` 替换成 `@decoraxios/*`
- 把脚手架、示例、模板里的安装命令同步改掉
- 如果你还在逐步迁移，可以暂时继续用旧名字，但新项目建议直接上新名字
