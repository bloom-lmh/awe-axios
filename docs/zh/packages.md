# 包拆分说明

## `@awe-axios/core`

适合只需要 HTTP 装饰器和请求工具的项目。

包含：

- `@HttpApi`
- `@Get`、`@Post`、`@Put`、`@Delete`、`@Patch`、`@Options`、`@Head`
- `@QueryParam`、`@PathParam`、`@BodyParam`
- `@TransformRequest`、`@TransformResponse`
- `@RefAxios`、`@AxiosRef`
- `useRetry`、`useDebounce`、`useThrottle`

## `@awe-axios/mock`

适合想在请求层做 mock，但不想把 IoC / AOP 一起装进来的项目。

包含：

- `@Mock`
- `MockAPI`
- `HttpResponse`
- `http`

## `@awe-axios/ioc-aop`

适合需要依赖注入或切面能力的项目。

包含：

- `@Component`
- `@Inject`
- `@Aspect`
- `@Before`、`@After`、`@Around`、`@AfterReturning`、`@AfterThrowing`

## `awe-axios`

如果你希望用短包名直接使用 core 能力，可以用 `awe-axios`。它现在不会再带上 mock 和 IoC / AOP 依赖。

包含：

- `awe-axios`
- `awe-axios/core`

## `@awe-axios/all`

如果你想要明确地安装一个 full bundle，可以使用 `@awe-axios/all`。

包含：

- `@awe-axios/core` 的全部导出
- `@awe-axios/mock` 的全部导出
- `@awe-axios/ioc-aop` 的全部导出
