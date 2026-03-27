# Decoraxios

Decoraxios is a focused Axios toolkit for teams that prefer decorator-based API declarations. The project is split into a small core package, an optional MSW mock package, an optional IoC/AOP package, and a full bundle for teams that want a single import surface.

## Packages

| Package | Use it when |
| --- | --- |
| `decoraxios` | You want the default root package with the core HTTP decorator surface. |
| `@decoraxios/core` | You prefer importing the explicit core package directly. |
| `@decoraxios/mock` | You want request-level mocking with MSW and decorator syntax. |
| `@decoraxios/ioc-aop` | You need dependency injection and aspect weaving. |
| `@decoraxios/all` | You want one package that re-exports every public decorator. |

## Documentation map

- [Getting Started](./getting-started.md)
- [HTTP Decorators](./core.md)
- [Runtime Decorators](./extensions.md)
- [Mock](./mock.md)
- [IoC and AOP](./ioc-aop.md)

## Design principles

- Decorated methods are declarations. Their bodies do not contain request logic.
- The root package stays lightweight and only exposes the core HTTP feature set.
- Mocking and IoC/AOP remain opt-in so they do not leak extra runtime dependencies into applications that do not need them.
- Every request entry stays type-friendly by returning `ApiCall<TResponse, TRequest>`.
