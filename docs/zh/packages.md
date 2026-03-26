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

如果你更在意统一入口，而不是极致按需安装，可以直接使用这个聚合包。
