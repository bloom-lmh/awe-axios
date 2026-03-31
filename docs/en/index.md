# Decoraxios

Decoraxios is a focused Axios toolkit for teams that prefer decorator-based API declarations. The project stays modular: use the core HTTP decorators by default, add mocking only when you need MSW, and bring in IoC / AOP only when your application benefits from class-level dependency wiring and advice composition.

## Official sites

- English docs: [Open the English site](https://awe-axios.vercel.app/)
- Chinese docs: [Open the Chinese site](https://decoraxios-lh0tx0sk.maozi.io/)

## Package guide

| Package | Use it when |
| --- | --- |
| `decoraxios` | You want the default root package with the core HTTP decorator surface. |
| `@decoraxios/core` | You want the explicit core package name in imports or package manifests. |
| `@decoraxios/mock` | You want decorator-friendly MSW mocking for local development or tests. |
| `@decoraxios/mock-ws` | You want standalone WebSocket mocking powered by MSW, with decorator mode available. |
| `@decoraxios/ioc-aop` | You want dependency injection and aspect weaving in class-based application code. |
| `@decoraxios/all` | You want one package that re-exports the public APIs from every package. |

## Documentation map

- [Getting Started](./getting-started.md)
- [HTTP Decorators](./core.md)
- [Runtime Decorators](./extensions.md)
- [HTTP Mock](./mock.md)
- [WebSocket Mock](./mock-ws.md)
- [IoC and AOP](./ioc-aop.md)

## Design principles

- Decorated methods are declarations. Their method bodies stay as placeholders.
- The root package remains lightweight and only exposes the core HTTP surface.
- Mocking and IoC / AOP remain opt-in to avoid extra runtime dependencies in simple apps.
- Every request entry point stays type-oriented through `ApiCall<TResponse, TRequest>`.
