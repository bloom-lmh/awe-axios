# Migration Guide

This guide covers the main changes from the older single-package structure to the current monorepo and package split.

## 1. The root package is no longer the hidden full bundle

Before:

- `awe-axios` behaved like an umbrella package
- installing it could indirectly pull mock and IoC/AOP dependencies

Now:

- `awe-axios` is core-first only
- `@decoraxios/awe-axios-all` is the explicit full bundle

### Recommended migration

If you only use HTTP decorators:

```ts
import { Get, HttpApi } from 'awe-axios';
```

If you really want the old one-package model:

```ts
import { Get, HttpApi, Mock, Component } from '@decoraxios/awe-axios-all';
```

## 2. Mock calls no longer switch to a second function call

The older design could behave differently when mock mode was enabled. The rebuilt implementation keeps one method shape:

```ts
const { data } = await api.listUsers();
```

That is now true for both real and mocked execution.

## 3. Peer dependencies are now intentional

The host project owns versions of:

- `axios`
- `msw`
- `reflect-metadata`

This keeps runtime ownership in the application instead of hiding it inside the library.

## 4. Import style recommendations changed

### Old mental model

- install one package
- import everything from the root

### New mental model

- use `awe-axios` or `@decoraxios/awe-axios-core` for HTTP
- add `@decoraxios/awe-axios-mock` only if mocking is needed
- add `@decoraxios/awe-axios-ioc-aop` only if DI/AOP is needed
- use `@decoraxios/awe-axios-all` only when you explicitly want the full bundle

## 5. Scoped package names moved under `@decoraxios`

The previous scoped names under `@awe-axios/*` are no longer the publish target.

Use these package names instead:

- `@decoraxios/awe-axios-core`
- `@decoraxios/awe-axios-mock`
- `@decoraxios/awe-axios-ioc-aop`
- `@decoraxios/awe-axios-all`

## 6. Release and docs structure changed too

The project now ships with:

- npm workspaces
- Changesets
- package-level README files
- VitePress docs
- GitHub Actions release workflows

If you maintain automation around publishing, update it to account for the new package list, especially `@decoraxios/awe-axios-all`.

## Migration checklist

- Replace umbrella assumptions with the core-first package split.
- Replace old `@awe-axios/*` scoped imports with `@decoraxios/*`.
- Update install commands in READMEs, demos, and starter templates.
- Add `msw` only where mock support is actually used.
- Add `reflect-metadata` only where IoC/AOP is actually used.
- Move full-bundle demos to `@decoraxios/awe-axios-all`.
