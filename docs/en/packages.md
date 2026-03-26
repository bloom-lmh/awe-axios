# Package Split

## `@awe-axios/core`

Use this when you only need HTTP decorators, parameter decorators, and helper utilities.

Included:

- `@HttpApi`
- `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@Options`, `@Head`
- `@QueryParam`, `@PathParam`, `@BodyParam`
- `@TransformRequest`, `@TransformResponse`
- `@RefAxios`, `@AxiosRef`
- `useRetry`, `useDebounce`, `useThrottle`

## `@awe-axios/mock`

Use this when you want request-level mocking without pulling IoC or AOP into the project.

Included:

- `@Mock`
- `MockAPI`
- `HttpResponse`
- `http`

## `@awe-axios/ioc-aop`

Use this when you need dependency injection or aspect-style interception around `@Component` classes.

Included:

- `@Component`
- `@Inject`
- `@Aspect`
- `@Before`, `@After`, `@Around`, `@AfterReturning`, `@AfterThrowing`

## `awe-axios`

Use this only if you want the convenience of a single import surface and do not mind installing the full bundle.

It now also exposes subpaths:

- `awe-axios`
- `awe-axios/core`
- `awe-axios/mock`
- `awe-axios/ioc-aop`
- `awe-axios/all`
