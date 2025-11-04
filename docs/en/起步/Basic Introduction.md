# Basic Introduction

## What is awe-axios?

`awe-axios` is an enhanced HTTP request library extended from `axios`. It provides richer functionalities and more flexible usage for `axios` through decorator patterns and configuration extensions, while maintaining compatibility with the `axios` ecosystem.

Core features include:

- Annotation-driven: `awe-axios` defines API interfaces based on decorators. Decorated methods are automatically proxied as API interfaces, simplifying request handling
- Encapsulated core business features: `awe-axios` internally encapsulates common functionalities like request retry, debounce, and throttle, eliminating the need for developers to reinvent the wheel
- Non-intrusive: `awe-axios` does not modify `axios`' original API, maintaining compatibility with existing `axios` APIs
- Integrated mock functionality: `awe-axios` implements mock capabilities using `msw`, enabling true network-level request interception
- Interface ambiguity: Interfaces in `awe-axios` serve as both real interfaces and mock interfaces, eliminating the need for separate mock definitions
- Aspect-oriented programming: `awe-axios` implements AOP (Aspect-Oriented Programming) on the frontend, enabling fine-grained request and response interception
- Dependency injection: `awe-axios` supports dependency injection and provides factory functions for instance management

## Use Cases

`awe-axios` is suitable for frontend application scenarios that need to handle various HTTP requests, especially:

1. **Enterprise-level application development**: Centrally manage API configurations through decorators to improve code maintainability
2. **High-frequency request scenarios**: Optimize request performance using debounce and throttle functions to reduce unnecessary network requests
3. **Unstable network environments**: Improve request success rates through request retry mechanisms
4. **Multi-environment adaptation**: Support custom axios instances to adapt to backend services with different domains and authentication methods
5. **Parallel frontend-backend development**: Built-in mock functionality allows development without waiting for backend interfaces to be ready
6. **Data transformation scenarios**: Provide convenient request/response data transformation capabilities for handling data format conversion, encryption/decryption, etc.

Whether it's framework applications like `Vue` or `React`, or vanilla `JavaScript` projects, `awe-axios` can simplify the handling logic of HTTP requests.
