# 包选择

现在的包拆分已经是产品设计的一部分，所以安装前值得先想清楚。

## 推荐选择

| 场景 | 安装方式 |
| --- | --- |
| 只要核心 HTTP，且想用短包名 | `npm install awe-axios axios` |
| 只要核心 HTTP，且想保持 scoped imports | `npm install @awe-axios/core axios` |
| 核心 HTTP + mock | `npm install @awe-axios/core @awe-axios/mock axios msw` |
| 核心 HTTP + IoC/AOP | `npm install @awe-axios/core @awe-axios/ioc-aop axios reflect-metadata` |
| 一次拿全套 | `npm install @awe-axios/all axios msw reflect-metadata` |

## `awe-axios`

适合这些场景：

- 想要最短安装命令
- 想保留短包名导入
- 不希望项目被动装上 mock 或 IoC/AOP 依赖

它现在导出的就是 core 的公开能力，同时保留了兼容子路径 `awe-axios/core`。

## `@awe-axios/core`

适合这些场景：

- 你更喜欢显式的包边界
- 团队内部约定全部使用 scoped import
- 你在写共享库，希望依赖表达更清楚

## `@awe-axios/mock`

适合这些场景：

- 你需要用 MSW 做请求层 mock
- 你希望 mock 逻辑和 API 声明贴在一起
- 你希望真实请求和 mock 请求保持同一种调用方式

对等依赖：

- `msw`

## `@awe-axios/ioc-aop`

适合这些场景：

- 你需要轻量的依赖注入
- 你需要切面风格的日志、审计或横切逻辑
- 你的项目本身已经大量使用装饰器

对等依赖：

- `reflect-metadata`

## `@awe-axios/all`

适合这些场景：

- 你明确想要一个 full bundle
- 便利性比极致轻量更重要
- 你在做 demo、原型、内部工具，接受一包导出全部能力

对等依赖：

- `axios`
- `msw`
- `reflect-metadata`

## 为什么这些依赖是宿主项目自己控制

现在由应用来控制 `axios`、`msw` 和 `reflect-metadata` 的版本，这样有两个好处：

- 你的 axios 版本和实例策略不会被库内部偷偷决定
- mock 和 metadata 相关依赖只有在真的需要时才会进入项目

## 一个简单的选择规则

可以直接这样记：

- 业务应用优先：`awe-axios`
- 共享库优先：`@awe-axios/core`
- 演示项目优先：`@awe-axios/all`

如果后面项目真的需要 mock 或 AOP，再补 scoped 子包就够了，不需要把整个项目切回 full bundle。
