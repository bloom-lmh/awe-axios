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

Use this when you want the core HTTP decorators through the short package name without pulling mock or IoC/AOP into the install.

Included:

- `awe-axios`
- `awe-axios/core`

## `@awe-axios/all`

Use this when you want the old umbrella behavior in a package that is explicit about being the full bundle.

Included:

- Everything from `@awe-axios/core`
- Everything from `@awe-axios/mock`
- Everything from `@awe-axios/ioc-aop`
