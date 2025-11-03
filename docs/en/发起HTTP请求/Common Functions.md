# Common Features Explained

`awe-axios` encapsulates several commonly used features, including:

- Request Retry (`Retry`)
- Debounce (`Debounce`)
- Throttle (`Throttle`)

This document details the configuration, implementation principles, and applicable scenarios for these features.

## Request Retry (Retry)

The Request Retry feature automatically retries failed requests, improving the success rate of API calls. It is suitable for scenarios such as:

- Interfaces that occasionally fail due to network issues
- Interfaces without real-time requirements
- Scenarios requiring high success rates

### Basic Usage

Creating an interface with request retry functionality is straightforward. Simply use the `useRetry` function, passing in the request function and configuration options. As shown below:

```js {12-14,16}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Get({
    url: '/retry/:id',
  })
  getUserById(@PathParam('id') id: number): any {}
}
const userApi = new UserApi();
// Actual API call in development
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
}
// Decorate the actual API call to get an interface with retry functionality
const retryGetUserById = useRetry(getUserById);
await retryGetUserById(1);
```

::: tip Default Values
When you wrap the actual API call with `useRetry`, `awe-axios` applies default retry count and base delay time:

- Default retry count: `3` times
- Default base delay time: `100` ms

:::

### Multiple Configuration Methods

The above method is the simplest, requiring no configuration. `awe-axios` uses default settings for request retries. However, this might not meet all your needs. Therefore, `awe-axios` supports multiple configuration methods to suit your project requirements:

::: code-group

```js [Only Specify Retry Count] {6}
// Actual API call in development
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
}
// Retry 3 times, default delay remains 100ms
const retryGetUserById = useRetry(getUserById, 3);
```

```js [Full Configuration] {5-8}
// Actual API call in development
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
}
// Retry 3 times, delay time 1s
const retryGetUserById = useRetry(getUserById, {
  count: 3, // Retry count
  delay: 1000, // Base delay time (ms)
});
```

```js [Array Format [Count, Delay]] {6}
// Actual API call in development
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
}
// Retry 3 times, delay time 1s
const retryGetUserById = useRetry(getUserById, [3, 1000]);
```

:::

### Key Features

The Request Retry feature in `awe-axios` has the following key characteristics:

- `awe-axios` uses an **exponential backoff strategy**: The delay time for the `n-th` retry is `delay * 2^(n-1)`
- `awe-axios` does not limit the number of retries. The first retry has no delay; the delay strategy applies from the second retry onwards.

::: warning Request Idempotence and POST Requests
Using the Request Retry feature with `POST` requests is **not recommended** because `POST` requests are generally not idempotent. Retries might lead to data duplication.
:::

## Debounce

The Debounce function limits the execution of frequently triggered requests, ensuring only the last request within a specified time window is executed. It is suitable for scenarios such as:

- Search box input suggestions
- Requests triggered by window resizing
- Scenarios with frequent button clicks

### Basic Usage

Creating an interface with debounce functionality is also simple. Similar to request retry, use the `useDebounce` function, passing in the request function and configuration. As shown below:

```typescript {12-17}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Get({
    url: '/debounce/:id',
  })
  getUserById(@PathParam('id') id: number): any {}
}
const userApi = new UserApi();
// Actual API call in development
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
  console.log(data);
}
// Decorate the actual API call to get an interface with debounce functionality
const fn = useDebounce(getUserById);
// The following will actually execute only one request (the last one)
fn(1);
fn(2);
fn(3);
fn(4);
fn(5);
```

::: tip Default Values
When you wrap the actual API call with `useDebounce`, `awe-axios` applies default delay time and immediate execution settings:

- Default delay time: `100` ms
- Default immediate execution: `false`

:::

### Multiple Configuration Methods

`useDebounce` also supports multiple configuration methods to meet your project needs:

:::code-group

```typescript [Only Specify Delay Time (ms)] {7}
// Actual API call in development
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
  console.log(data);
}
// Only the last call within 300ms is executed
const fn = useDebounce(getUserById, 300);
```

```typescript [Execute First Request Immediately] {8-11}
// Actual API call in development
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
  console.log(data);
}
// Only the last call within 300ms is executed
// Execute the first request immediately
const fn = useDebounce(getUserById, {
  delay: 300, // Delay time
  immediate: true, // Whether to execute the first request immediately
});
```

:::

## Throttle

The Throttle function limits the execution frequency of requests, ensuring they are executed at most once within a specified time interval. It is suitable for continuously triggered scenarios:

- Loading more data on scroll
- Requests triggered by drag-and-drop operations
- Real-time data refresh (e.g., dashboards)

### Basic Usage

Similar to Retry and Debounce, creating an interface with throttle functionality is simple. Use the `useThrottle` function, passing in the request function and configuration. As shown below:

```ts {11-17}
@HttpApi({
  baseURL: 'http://localhost:3000/users/',
})
class UserApi {
  @Get({
    url: '/throttle/:id',
  })
  getUserById(@PathParam('id') id: number): any {}
}
const userApi = new UserApi();
// Real API call
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
  console.log(data);
}
// Throttle function
const fn = useThrottle(getUserById, true);
// Default interval is 100ms, so the following results in 3 actual API calls
fn(1);
fn(2);
await delay(100);
fn(3);
fn(4);
await delay(100);
fn(5);
fn(6);
```

::: tip Default Values
When you wrap the actual API call with `useThrottle`, `awe-axios` applies a default interval time: `100` ms
:::

### Other Configuration Methods

You can specify the desired throttle interval directly via configuration:

```typescript [Only Specify Interval Time (ms)] {7}
// Real API call
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
  console.log(data);
}
// Execute at most once per second
const fn = useThrottle(getUserById, 1000);
```

## Feature Combination

`awe-axios` supports combining multiple features. For example, your interface can have both debounce and retry functionality, or both throttle and retry functionality. You can choose the appropriate combination based on your project needs. The usage is simple, as shown below:

```typescript {7}
// Real API call
async function getUserById(id: number) {
  const { data } = await userApi.getUserById(id);
  console.log(data);
}
// Throttle + Retry function
const fn = useThrottle(useRetry(getUserById));
```

::: tip Decorator Pattern
Essentially, `awe-axios` uses the **Decorator Pattern** to enhance request functionality. The outer request function wraps the inner request function, layer by layer (like nesting dolls), ultimately returning a new request function used to initiate the call.
!https://image-bucket-1307756649.cos.ap-chengdu.myqcloud.com/image/20251029160152919.png

:::

:::warning Important Notes

`awe-axios` does **not recommend** using Debounce and Throttle simultaneously because their implementation mechanisms conflict, which might lead to request failures.
Recommended combinations are:

- Search scenarios: `Debounce + Retry`
- Scroll loading: `Throttle + Retry`
- Regular interfaces: `Retry only` (for most scenarios)

These combinations ensure a good user experience, improve request success rates, and avoid strategy conflicts.
:::
