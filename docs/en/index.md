# Overview

Awe Axios is a modular Axios enhancement toolkit built around decorators.

The project now ships as a monorepo with three focused feature packages:

- `@awe-axios/core`
- `@awe-axios/mock`
- `@awe-axios/ioc-aop`

If you prefer the old single-entry experience, install `awe-axios`, which re-exports all of them.

## Why this rebuild

The previous codebase mixed HTTP decorators, mock runtime, IoC, and AOP into one package. That caused three recurring problems:

- Runtime behavior changed depending on whether mock mode was on.
- Internal state managers were hard to reason about and easy to break.
- TypeScript hints were weaker than they should be for a decorator-driven API.

This rebuild fixes those issues by separating responsibilities and simplifying the runtime pipeline.

## What you get now

- Predictable request methods that always return `Promise<AxiosResponse<T>>`
- Optional mock support powered by MSW
- A small IoC and AOP package that can be adopted independently
- Workspace-based builds and package-scoped tests

Continue with [Getting Started](./getting-started).
