# 迁移指南

这一页主要说明如何从旧的“单包思维”迁移到现在的 monorepo 和 core-first 结构。

## 1. 根包不再是隐藏的全家桶

过去：

- `awe-axios` 更像一个 umbrella package
- 安装它时，mock 和 IoC/AOP 依赖可能会间接被带进来

现在：

- `awe-axios` 只代表 core-first 能力
- `@awe-axios/all` 才是显式的 full bundle

### 推荐迁移方式

如果你只用 HTTP 装饰器：

```ts
import { Get, HttpApi } from 'awe-axios';
```

如果你明确想保留旧的“一包导出全部”体验：

```ts
import { Get, HttpApi, Mock, Component } from '@awe-axios/all';
```

## 2. mock 不再切换成二次函数调用

旧实现里，mock 打开以后方法返回形式可能会变化。现在统一成：

```ts
const { data } = await api.listUsers();
```

真实请求和 mock 请求都保持这一种形状。

## 3. 对等依赖现在是显式的

现在由宿主项目自己控制这些依赖版本：

- `axios`
- `msw`
- `reflect-metadata`

这样做的好处是：

- axios 版本和实例行为由你的应用自己决定
- mock 和 metadata 相关依赖只有真的需要时才会进入项目

## 4. 导入习惯需要更新

### 旧思路

- 安装一个包
- 全部从根入口拿

### 新思路

- 用 `awe-axios` 或 `@awe-axios/core` 处理 HTTP
- 需要 mock 时再加 `@awe-axios/mock`
- 需要 DI / AOP 时再加 `@awe-axios/ioc-aop`
- 只有明确想要 full bundle 时才用 `@awe-axios/all`

## 5. 发布和文档结构也变了

现在仓库已经接上了：

- npm workspaces
- Changesets
- 包级 README
- VitePress 文档
- GitHub Actions 发包流程

如果你维护脚手架、模板或者自动发版配置，记得把 `@awe-axios/all` 这个新包也纳入进去。

## 迁移检查清单

- 把“根包就是全家桶”的假设改成新的 core-first 结构
- 更新 README、demo 和模板里的安装命令
- 只有在真正使用 mock 时才加 `msw`
- 只有在真正使用 IoC/AOP 时才加 `reflect-metadata`
- 把 full bundle 示例迁到 `@awe-axios/all`
