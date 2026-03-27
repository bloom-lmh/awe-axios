# Migration Guide

This guide covers the move from the older package names to the new Decoraxios package family.

## 1. Root package rename

Before:

- `awe-axios`

Now:

- `decoraxios`

For most projects, the code change is just:

```ts
import { Get, HttpApi } from 'decoraxios';
```

Compatibility note:

- `awe-axios` still exists as an alias package
- `awe-axios/core` still forwards to `decoraxios/core`

## 2. Scoped package rename

Before:

- `@decoraxios/awe-axios-core`
- `@decoraxios/awe-axios-mock`
- `@decoraxios/awe-axios-ioc-aop`
- `@decoraxios/awe-axios-all`

Now:

- `@decoraxios/core`
- `@decoraxios/mock`
- `@decoraxios/ioc-aop`
- `@decoraxios/all`

Example:

```ts
import { Mock } from '@decoraxios/mock';
import { Component } from '@decoraxios/ioc-aop';
```

Compatibility note:

- the old scoped package names are still published as forwarding aliases

## 3. Core-first stays the default

The architectural decision from the previous rebuild still stands:

- `decoraxios` is core-first only
- `@decoraxios/all` is the explicit full bundle

Use the full bundle only when you intentionally want one package that re-exports everything.

## 4. Peer dependencies remain app-owned

The host project still owns:

- `axios`
- `msw`
- `reflect-metadata`

That keeps runtime ownership and versioning in the application instead of hiding it inside the library.

## 5. Migration checklist

- Replace `awe-axios` with `decoraxios`
- Replace `@decoraxios/awe-axios-*` with `@decoraxios/*`
- Update install commands in templates, demos, and docs
- Keep old names only when you need a gradual migration window
