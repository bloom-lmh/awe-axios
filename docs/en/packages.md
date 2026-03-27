# Package Selection

The package split is part of the product design now, so it is worth choosing intentionally.

## Recommended choices

| Scenario | Install |
| --- | --- |
| Core HTTP only with short package name | `npm install awe-axios axios` |
| Core HTTP only with fully scoped package names | `npm install @awe-axios/core axios` |
| Core HTTP + mock | `npm install @awe-axios/core @awe-axios/mock axios msw` |
| Core HTTP + IoC/AOP | `npm install @awe-axios/core @awe-axios/ioc-aop axios reflect-metadata` |
| Full bundle | `npm install @awe-axios/all axios msw reflect-metadata` |

## `awe-axios`

Use this when:

- you want the shortest install command for core HTTP features
- you want the short import path
- you do not want mock or IoC/AOP dependencies installed automatically

What it exports:

- the same public API surface as `@awe-axios/core`
- the compatibility subpath `awe-axios/core`

## `@awe-axios/core`

Use this when:

- you prefer fully explicit package boundaries
- your codebase already uses scoped imports everywhere
- you want the cleanest mental model for shared library code

## `@awe-axios/mock`

Use this when:

- you want to intercept requests with MSW
- you need per-method mock handlers
- you want mocked and real requests to keep the same return shape

Peer dependency:

- `msw`

## `@awe-axios/ioc-aop`

Use this when:

- you want lightweight dependency injection
- you want aspect-style interception around component methods
- you are already using decorators broadly in the app

Peer dependency:

- `reflect-metadata`

## `@awe-axios/all`

Use this when:

- you want one install that re-exports everything
- convenience matters more than keeping the dependency graph minimal
- you are building demos, prototypes, or internal apps where one bundle is acceptable

Peer dependencies:

- `axios`
- `msw`
- `reflect-metadata`

## Peer dependency ownership

The host application owns the versions of `axios`, `msw`, and `reflect-metadata`.

That design keeps two important things under your control:

- the axios version and instance behavior used across the app
- whether mock and metadata-related packages are present at all

## A practical rule of thumb

Start with one of these:

- application code: `awe-axios`
- library code: `@awe-axios/core`
- demos and playgrounds: `@awe-axios/all`

If you later need mocking or AOP, add the scoped package instead of switching your whole app to the full bundle unless you really want the one-package experience.
