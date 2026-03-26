---
layout: home

hero:
  name: Awe Axios
  text: Decorator-first Axios toolkit, now rebuilt as a modular monorepo
  actions:
    - theme: brand
      text: English Docs
      link: /en/
    - theme: alt
      text: 中文文档
      link: /zh/

features:
  - title: Modular packages
    details: Install only core HTTP decorators, mock support, or IoC and AOP as needed.
  - title: Better TypeScript ergonomics
    details: Use `ApiCall<T>` to keep request methods consistently typed as `Promise<AxiosResponse<T>>`.
  - title: Stable runtime model
    details: Mock and real requests now share the same call signature and lifecycle.
  - title: Cleaner extension points
    details: Build custom decorators with `withHttpMethodConfig` and keep runtime behavior predictable.
---
