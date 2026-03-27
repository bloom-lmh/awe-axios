---
layout: home

hero:
  name: Awe Axios
  text: Core-first Axios decorators with modular mock and IoC/AOP packages
  tagline: Build typed request clients with decorators, keep your install lean, and opt into mock or aspect features only when you need them.
  actions:
    - theme: brand
      text: Read in English
      link: /en/
    - theme: alt
      text: 阅读中文文档
      link: /zh/
    - theme: alt
      text: GitHub
      link: https://github.com/bloom-lmh/awe-axios

features:
  - title: Core-first package strategy
    details: "`awe-axios` is now a lightweight core entry, while `@decoraxios/awe-axios-all` is the explicit full bundle."
  - title: Stable request return types
    details: "Decorated methods stay readable and consistently return `Promise<AxiosResponse<T>>` through `ApiCall<T>`."
  - title: Opt-in runtime features
    details: "Add `@decoraxios/awe-axios-mock` for MSW integration or `@decoraxios/awe-axios-ioc-aop` for dependency injection and aspect weaving."
  - title: Publish-ready monorepo
    details: "The project ships as npm workspaces with dual ESM/CJS builds, Changesets, and GitHub Actions release automation."
---
