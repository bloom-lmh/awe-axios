---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'AxiosPlus'
  text: 'An annotation-driven enhanced Axios framework'
  actions:
    - theme: brand
      text: 起步
      link: /en/起步/Basic Introduction

features:
  - title: Annotation-Driven API
    details: Define APIs using decorators like @Get, @Post, and @HttpApi, with automatic request proxying
  - title: Built-in Request Enhancers
    details: Out-of-the-box retry, debounce, and throttle capabilities to handle common request scenarios
  - title: Seamless Mock Integration
    details: Network-level request interception with MSW, supporting both real and mock interfaces in one definition
  - title: Aspect-Oriented Programming
    details: Fine-grained request/response interception using @Before, @After, and other AOP decorators
  - title: Dependency Injection
    details: Manage axios instances and configurations through IoC container for better modularity
  - title: Axios Compatibility
    details: Full compatibility with original Axios APIs, ensuring smooth migration for existing projects
---
