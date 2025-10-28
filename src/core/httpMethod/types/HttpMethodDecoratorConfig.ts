import { DefaultBodyType, HttpResponseResolver, PathParams } from 'msw';
import {
  AxiosPlusRequestConfig,
  DebounceConfig,
  DebounceRequestPolicy,
  MockConfig,
  MockHandlers,
  RetryConfig,
  RetryRequestPolicy,
  ThrottleConfig,
  ThrottleRequestPolicy,
} from '../../../httpMethod';
import {
  AddressFamily,
  AxiosAdapter,
  AxiosBasicCredentials,
  AxiosHeaders,
  AxiosInstance,
  AxiosProgressEvent,
  AxiosProxyConfig,
  AxiosRequestConfig,
  AxiosRequestTransformer,
  AxiosResponseTransformer,
  CancelToken,
  CustomParamsSerializer,
  FormSerializerOptions,
  GenericAbortSignal,
  HttpStatusCode,
  InternalAxiosRequestConfig,
  LookupAddress,
  LookupAddressEntry,
  Method,
  ParamsSerializerOptions,
  RawAxiosRequestHeaders,
  responseEncoding,
  ResponseType,
  TransitionalOptions,
} from 'axios';

/**
 * 默认Http方法装饰器配置
 */
export const defaultHttpMtdDecoratorConfig: HttpMethodDecoratorConfig = {};
/**
 * http 方法装饰器配置基类
 * @description 实现Axios请求配置建造者模式，提供统一的配置接口
 */
export class HttpMethodDecoratorConfig<D = any> implements AxiosRequestConfig<D>, AxiosPlusRequestConfig {
  /**
   * axios引用
   */
  refAxios?: AxiosInstance;
  /**
   * 请求重传
   */
  retry?: RetryConfig;
  /**
   * 自定义重传方式
   */
  customRetry?: RetryRequestPolicy;
  /**
   * 防抖
   */
  debounce?: DebounceConfig;
  /**
   * 自定义防抖
   */
  customDebounce?: DebounceRequestPolicy;
  /**
   * 节流
   */
  throttle?: ThrottleConfig;
  /**
   * 自定义节流
   */
  customThrottle?: ThrottleRequestPolicy;
  /**
   * mock
   */
  mock?: MockConfig | HttpResponseResolver<PathParams, DefaultBodyType, undefined>;
  /**
   * mockhandlers
   */
  mockHandlers?: MockHandlers;
  /**
   * 请求资源相对路径
   */
  url?: string;
  /**
   * 请求方法
   * @example 'get' | 'GET' | 'post' | 'POST' | 'put' | 'PUT' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'patch' | 'PATCH'
   */
  method?: Method;
  /**
   * http请求基本路径
   */
  baseURL?: string;
  /**
   * 是否允许url中出现绝对路径
   * @description 如果设置为true，则允许url中出现绝对路径，否则将会抛出异常
   */
  allowAbsoluteUrls?: boolean;
  /**
   * 请求转换器
   * @description 请求数据转换器，可以对请求数据进行处理，比如序列化、压缩等
   */
  transformRequest?: AxiosRequestTransformer | AxiosRequestTransformer[];
  /**
   * 响应转换器
   * @description 响应数据转换器，可以对响应数据进行处理，比如反序列化、解压等
   */
  transformResponse?: AxiosResponseTransformer | AxiosResponseTransformer[];
  /**
   * 请求头
   * @description 请求头对象，可以是普通对象，也可以是函数，函数返回值必须是普通对象
   */
  headers?: RawAxiosRequestHeaders | AxiosHeaders;
  /**
   * 查询参数对象
   */
  params?: any;
  /**
   * 查询参数序列化器
   * @description 查询参数序列化器，可以对查询参数进行序列化，比如数组格式化为字符串等
   */
  paramsSerializer?: ParamsSerializerOptions | CustomParamsSerializer;
  /**
   * 请求体数据
   * @description 请求体数据，可以是普通对象，也可以是FormData，ArrayBuffer，ArrayBufferView，URLSearchParams，Stream，Buffer，或者 Streamable,只能用于非GET、HEAD、DELETE请求方法
   */
  data?: D;
  /**
   * 请求超时时间
   * @description 请求超时时间，单位为毫秒，默认为0，表示没有超时时间
   */
  timeout?: number;
  /**
   * 请求超时时的错误信息
   */
  timeoutErrorMessage?: string;
  /**
   * 跨域请求时是否携带凭证和cookie
   * @description 跨域请求时是否携带凭证和cookie，默认为false
   */
  withCredentials?: boolean;
  /**
   * 适配器
   * @description 自定义适配器，可以对请求和响应进行处理，比如请求签名、响应解密等
   * axios使用适配器模式统一了node和浏览器发送请求的方式，你也可以自定义适配器来覆盖发送请求的方式。
   * adapter 不仅可以是一个函数，还可以是一个适配器函数的数组但这并不是“同时使用多个适配器”，而是 Axios 提供的一种 适配器优先级 fallback 机制 —— 类似于“备选方案”或“降级策略”。
   * 比如：原来有[xhrAdapter, httpAdapter]，会先调用 xhrAdapter，如果 xhrAdapter 抛出异常，则会调用 httpAdapter发起请求。
   * 如果你只想使用 httpAdapter，可以设置 adapter: httpAdapter。当然也可以自定义来覆盖
   */
  adapter?: AxiosAdapter | AxiosAdapter[];
  /**
   * HTTP基础认证
   * @description HTTP基础认证，用户名和密码
   */
  auth?: AxiosBasicCredentials;
  /**
   * 响应提类型
   * @example 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream'
   * @description 设置后，响应数据将会按照指定类型进行解析
   */
  responseType?: ResponseType;
  /**
   * 响应数据的编码方式
   * @example 'utf8' | 'ascii' | 'base64' | 'binary' | 'hex' | null
   */
  responseEncoding?: responseEncoding | string;
  /**
   * axios支持Cookie-to-Header 模式，来避免跨站请求伪造（CSRF/XSRF）攻击。
   * @description 开启后，axios会读取服务端发来的cookie中的token并自动添加到请求头中。
   */
  xsrfCookieName?: string;
  /**
   * 和xsrfCookieName配合使用，用来设置请求头中token的名称。
   */
  xsrfHeaderName?: string;
  /**
   * 上传文件进度处理
   */
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  /**
   * 下载文件进度处理
   */
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
  /**
   * 限制响应体的最大长度
   */
  maxContentLength?: number;
  /**
   * 自定义出错状态码范围
   * @example (status) => status >= 400 && status < 500 当状态码为400-499时表示成功走兑现的处理函数，否则走默认的错误处理函数（then的第二个回调函数或catch）
   * @description 注意这是指定http请求状态码的错误范围，而不是业务状态码，业务状态码需要在业务层面进行处理
   */
  validateStatus?: ((status: number) => boolean) | null;
  /**
   * 限制请求体的最大长度（单位：字节），超出会触
   * @usage maxBodyLength: 1024 * 1024 * 10 // 10MB
   */
  maxBodyLength?: number;
  /**
   * 最大重定向次数
   * @example
   * 1. 客户端​ 发起请求（如访问 http://example.com/old）。
   * 2. 服务器​ 返回响应状态码（如 302）和 Location头（新 URL）。
   * 3. axios​ 自动请求新 URL（http://example.com/new）。
   * 4. 服务器​ 返回最终资源
   */
  maxRedirects?: number;
  /**
   * 最大上传/下载速度
   */
  maxRate?: number | [number, number];
  /**
   * 重定向前的钩子函数
   * @description 在发生重定向时，会调用该函数，可以对重定向前的请求配置进行修改
   */
  beforeRedirect?: (
    options: Record<string, any>,
    responseDetails: { headers: Record<string, string>; statusCode: HttpStatusCode },
  ) => void;
  /**
   * 指定用于 Unix 域套接字（Unix Domain Socket）连接的路径，而不是使用标准的 host:port TCP 连接
   */
  socketPath?: string | null;
  /**
   * 允许你自定义底层的传输机制（如 http 或 https 模块）
   * @description 当你需要与本地运行的 HTTP 服务通信时（例如 Docker daemon、本地 Nginx 或某些后端服务），可以使用 Unix 套接字提高性能或满足安全需求
   *
   */
  transport?: any;
  /**
   * 指定用于管理 HTTP 或 HTTPS 连接的 Agent 实例
   * @description Node.js 中的 http.Agent 和 https.Agent 用于控制连接复用、超时、keep-alive 等
   */
  httpAgent?: any;
  httpsAgent?: any;
  /**
   * 配置代理服务器
   * @description 这个代理和vue的开发时的代理不一样，这个代理不是为了解决跨域问题的。
   * 这个代理是来解决内外网发送问题的，当你在 公司内网环境 下写一个 Node.js 脚本（比如爬虫、自动化任务、调用外部 API），
   * 如果公司网络策略要求 必须通过代理服务器才能访问外网，这时候可以配置外网服务器host和port
   */
  proxy?: AxiosProxyConfig | false;
  /**
   * 取消请求的token
   * @deprecated 废弃了，使用signal代替
   */
  cancelToken?: CancelToken;
  /**
   * 是否自动解压缩响应体内容
   * @description 默认为true，表示自动解压缩响应体内容，如果响应头中没有Content-Encoding头，则不进行解压缩
   * 1. 客户端声明接受的编码方式（Accept-Encoding）：Accept-Encoding: gzip, deflate, br
   * 2. 服务端响应时，将响应内容压缩，并在响应头中添加Content-Encoding头 Content-Encoding: gzip
   */
  decompress?: boolean;
  /**
   * 控制是否“静默忽略”JSON 解析错误
   * @example silentJSONParsing: true  // 即使返回不是合法 JSON，也不报错
   * @description 后端有时返回 HTML 错误页（如 500），但 Content-Type 是 application/json, 这时 Axios 会报错。你不希望因为 JSON 解析失败而中断逻辑可以设置 silentJSONParsing: true
   */
  transitional?: TransitionalOptions;
  /**
   * 取消请求的信号
   * @description 可以使用 AbortController 实例来取消请求
   */
  signal?: GenericAbortSignal;
  /**
   * 允许使用不严格的 HTTP 解析器（Node.js 环境）。
   * @description Node.js 的 HTTP 解析器默认严格遵循规范。启用此选项可以容忍某些不符合规范的请求（如非标准标头或格式错误的请求）
   */
  insecureHTTPParser?: boolean;
  /**
   * Node.js 环境 下自定义 FormData 的实现
   * @description 比如Node.js 没有全局 FormData，你可以安装第三方 form-data 库，并通过 env.FormData 告诉 Axios 使用它
   * const FormData = require('form-data'); // 第三方库
   * env: {
   *   FormData: FormData //  告诉 Axios：请用这个类来处理 FormData
   * }
   */
  env?: {
    FormData?: new (...args: any[]) => object;
  };
  /**
   * 自定义表单数据的序列化行为，参数如下
   * 1. visitor?: (value, key, path, helpers) => any：自定义如何序列化每个字段。
   * 2. dots?: boolean：是否用点符号（如 a.b=c）表示嵌套对象。
   * 3. metaTokens?: boolean：是否保留特殊元字符（如 []）
   */
  formSerializer?: FormSerializerOptions;
  /**
   * 指定 DNS 查找时使用的 IP 地址族
   * @example family: 4, // 强制使用 IPv4
   * @example family: 6, // 强制使用 IPv6
   */
  family?: AddressFamily;
  /**
   * 自定义 DNS 查找函数
   * @description 允许你覆盖默认的 DNS 解析逻辑
   * @example
   * if (hostname === 'api.internal') {
   *   return [
   *     [{ address: '10.0.0.1', ttl: 300 }], // LookupAddressEntry[]
   *      4 // family
   *      ] as const;
   *  }
   * 上面的代码表示当要解析的域名是 'api.internal' 时，不走正常的 DNS 查询流程，而是“手动指定”它的 IP 地址为 '10.0.0.1'，并且使用 IPv4（family = 4）
   */
  lookup?:
    | ((
        hostname: string,
        options: object,
        cb: (err: Error | null, address: LookupAddress | LookupAddress[], family?: AddressFamily) => void,
      ) => void)
    | ((
        hostname: string,
        options: object,
      ) => Promise<[address: LookupAddressEntry | LookupAddressEntry[], family?: AddressFamily] | LookupAddress>);
  /**
   * 控制是否在请求中自动附加 XSRF/CSRF Token
   */
  withXSRFToken?: boolean | ((config: InternalAxiosRequestConfig) => boolean | undefined);
  /**
   * 当 Axios 在浏览器中使用 fetch 作为底层适配器（adapter） 时，这个字段允许你传入额外的 fetch() 配置选项
   */
  fetchOptions?: Omit<RequestInit, 'body' | 'headers' | 'method' | 'signal'> | Record<string, any>;
}
