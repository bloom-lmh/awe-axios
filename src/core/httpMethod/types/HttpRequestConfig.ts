import { ObjectUtils } from '@/utils/ObjectUtils';
import { PathUtils } from '@/utils/PathUtils';
import {
  AddressFamily,
  AxiosAdapter,
  AxiosBasicCredentials,
  AxiosHeaders,
  AxiosInstance,
  AxiosProgressEvent,
  AxiosProxyConfig,
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
import { HttpMethodDecoratorConfig } from './HttpMethodDecoratorConfig';
import { DebounceConfig, MockConfig, MockHandlers, RetryConfig, ThrottleConfig } from './httpMethod';

/**
 * http请求配置
 * @description 是AxiosRequestConfig配置的包装类，用于提供更方便的配置方式
 */
export class HttpRequestConfig<T extends HttpMethodDecoratorConfig<D> = HttpMethodDecoratorConfig, D = any> {
  /**
   * axios请求配置
   */
  protected axiosConfig: T;

  /**
   *
   * @param axiosConfig axios配置
   */
  constructor(axiosConfig: T) {
    this.axiosConfig = axiosConfig;
  }
  // ========== AxiosPlus设置 ==========
  /**
   * 设置axios引用
   * @description 用户可以指定使用哪一个axios实例，若没有指定那么会使用内部axios实例来发送请求
   */
  setRefAxios(axios: AxiosInstance) {
    this.axiosConfig.refAxios = axios;
    return this;
  }
  /**
   * 获取axios实例
   */
  get refAxios() {
    return this.axiosConfig.refAxios;
  }
  /**
   * 设置请求重传
   */
  setRetry(retryConfig: RetryConfig) {
    this.axiosConfig.retry = retryConfig;
  }
  /**
   * 获取请求重传配置
   */
  get retry() {
    return this.axiosConfig.retry;
  }
  /**
   * 获取自定义retry函数
   */
  get customRetry() {
    return this.axiosConfig.customRetry;
  }
  /**
   * 设置防抖
   */
  setDebounce(debounceConfig: DebounceConfig) {
    this.axiosConfig.debounce = debounceConfig;
  }

  /**
   * 获取防抖配置
   */
  get debounce() {
    return this.axiosConfig.debounce;
  }
  /**
   * 获取自定义debounce
   */
  get customDebounce() {
    return this.axiosConfig.customDebounce;
  }
  /**
   * 设置节流
   */
  setThrottle(throttleConfig: ThrottleConfig) {
    this.axiosConfig.throttle = throttleConfig;
  }

  /**
   * 获取节流配置
   */
  get throttle() {
    return this.axiosConfig.throttle;
  }

  /**
   * 获取自定义节流器
   */
  get customThrottle() {
    return this.axiosConfig.customThrottle;
  }
  /**
   * 设置mock handlers
   */
  setMock(config: MockConfig) {
    this.axiosConfig.mock = config;
  }

  /**
   * 获取mock配置
   */
  get mock() {
    return this.axiosConfig.mock;
  }

  // ========== 基础请求配置 ==========

  /**
   * 设置请求相对路径
   * @param url 请求路径
   * @returns HttpRequestConfig
   */
  setUrl(url: string) {
    this.axiosConfig.url = url;
    return this;
  }

  /**
   * 获取url
   * @returns string
   */
  get url() {
    // 清除url中的空格和非法字符
    return this.axiosConfig.url;
  }
  /**
   * 获取方法
   */
  get method() {
    return this.axiosConfig.method;
  }
  /**
   * 拼接url
   * @param pre 是否在前面拼接url
   * @description 若pre为true且不是绝对路径则在url前面拼接，否则一律在url后面拼接
   */
  concatUrl(url: string = '', pre: boolean = false) {
    if (!url) return this;
    // 必须先设置基础url
    if (!this.axiosConfig.url) {
      this.axiosConfig.url = url;
      return this;
    }
    const isHttpUrl = PathUtils.isHttpUrl(this.axiosConfig.url);
    // axiosConfig.url 不是绝对路径则允许在前面拼接否则一律强制后面拼接
    !isHttpUrl && pre
      ? (this.axiosConfig.url = url + '/' + this.axiosConfig.url)
      : (this.axiosConfig.url = this.axiosConfig.url + '/' + url);
    return this;
  }

  /**
   * 设置请求方法
   * @param method 请求方法 如'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch'
   * @returns HttpRequestConfig
   */
  setMethod(method: Method = 'GET') {
    this.axiosConfig.method = method;
    return this;
  }

  /**
   * 设置请求基本路径
   * @param baseURL 请求的基础路径
   * @returns HttpRequestConfig
   */
  setBaseURL(baseURL: string) {
    this.axiosConfig.baseURL = baseURL;
    return this;
  }
  /**
   * 获取请求的基础路径
   * @returns 基础 URL，例如 'https://api.example.com'
   */
  get baseURL() {
    return this.axiosConfig.baseURL;
  }

  /**
   * 在baseURL的基础上再追加URL
   * @param url 路径碎片
   */
  joinBaseURL(url: string) {
    // 之前必须先设置baseURL
    if (this.axiosConfig.baseURL) {
      this.axiosConfig.url = this.axiosConfig.baseURL + '/' + url;
      return this;
    }
  }
  /**
   * 设置是否允许绝对路径
   * @param allow 是否允许绝对路径
   * @returns HttpRequestConfig
   * @description 当设置allowAbsoluteUrls为true不会采用baseURL会以url直接发送
   */
  setAllowAbsoluteUrls(allow: boolean) {
    this.axiosConfig.allowAbsoluteUrls = allow;
    return this;
  }
  /**
   * 获取是否允许使用绝对路径
   * @returns true 表示允许使用绝对 URL，忽略 baseURL；false 表示使用 baseURL 拼接
   */
  get allowAbsoluteUrls() {
    return this.axiosConfig.allowAbsoluteUrls;
  }
  // ========== 数据转换器 ==========
  /**
   * 设置数据转换器(直接覆盖)
   * @param transformer 请求数据转换器
   * @returns HttpRequestConfig
   */
  setTransformRequest(transformer: AxiosRequestTransformer | AxiosRequestTransformer[]) {
    this.axiosConfig.transformRequest = transformer;
    return this;
  }
  /**
   * 获取请求数据转换器（用于请求前的数据处理）
   * @returns AxiosRequestTransformer 或其数组，用于序列化请求数据
   */
  get transformRequest() {
    return this.axiosConfig.transformRequest;
  }
  /**
   * 后置追加数据转换器
   * @param transformer 请求数据转换器
   * @returns HttpRequestConfig
   */
  appendTransformRequest(transformer?: AxiosRequestTransformer | AxiosRequestTransformer[]) {
    if (transformer && transformer.length > 0) {
      const tfRequest = this.axiosConfig.transformRequest;
      const transformers = Array.isArray(transformer) ? transformer : [transformer];
      if (!tfRequest) {
        this.axiosConfig.transformRequest = transformers;
      } else {
        const existingTransformers = Array.isArray(tfRequest) ? tfRequest : [tfRequest];
        this.axiosConfig.transformRequest = [...existingTransformers, ...transformers];
      }
    }
    return this;
  }

  /**
   * 前置追加数据转换器
   * @param transformer 请求数据转换器
   * @returns HttpRequestConfig
   */
  prependTransformRequest(transformer: AxiosRequestTransformer | AxiosRequestTransformer[]) {
    const tfRequest = this.axiosConfig.transformResponse;
    const transformers = Array.isArray(transformer) ? transformer : [transformer];
    if (!tfRequest) {
      this.axiosConfig.transformResponse = transformers;
    } else {
      const existingTransformers = Array.isArray(tfRequest) ? tfRequest : [tfRequest];
      this.axiosConfig.transformResponse = [...transformers, ...existingTransformers];
    }
    return this;
  }
  /**
   * 设置响应数据转换器（直接覆盖）
   * @param transformer 响应数据转换器或转换器数组
   * @returns HttpRequestConfig
   */
  setTransformResponse(transformer: AxiosResponseTransformer | AxiosResponseTransformer[]) {
    this.axiosConfig.transformResponse = transformer;
    return this;
  }
  /**
   * 获取响应数据转换器（用于响应后的数据处理）
   * @returns AxiosResponseTransformer 或其数组，用于反序列化响应数据
   */
  get transformResponse() {
    return this.axiosConfig.transformResponse;
  }
  /**
   * 后置追加响应数据转换器（添加到末尾）
   * @param transformer 响应数据转换器或转换器数组
   * @returns HttpRequestConfig
   */
  appendTransformResponse(transformer?: AxiosResponseTransformer | AxiosResponseTransformer[]) {
    if (transformer && transformer.length > 0) {
      const tfResponse = this.axiosConfig.transformResponse;
      const transformers = Array.isArray(transformer) ? transformer : [transformer];

      if (!tfResponse) {
        this.axiosConfig.transformResponse = transformers;
      } else {
        const existingTransformers = Array.isArray(tfResponse) ? tfResponse : [tfResponse];
        this.axiosConfig.transformResponse = [...existingTransformers, ...transformers];
      }
    }
    return this;
  }

  /**
   * 前置追加响应数据转换器（插入到开头）
   * @param transformer 响应数据转换器或转换器数组
   * @returns HttpRequestConfig
   */
  prependTransformResponse(transformer: AxiosResponseTransformer | AxiosResponseTransformer[]) {
    const tfResponse = this.axiosConfig.transformResponse;
    const transformers = Array.isArray(transformer) ? transformer : [transformer];

    if (!tfResponse) {
      this.axiosConfig.transformResponse = transformers;
    } else {
      const existingTransformers = Array.isArray(tfResponse) ? tfResponse : [tfResponse];
      this.axiosConfig.transformResponse = [...transformers, ...existingTransformers];
    }
    return this;
  }
  // ========== 请求头与参数 ==========
  /**
   * 设置请求头
   * @param headers 请求头
   * @returns
   */
  setHeaders(headers: RawAxiosRequestHeaders | AxiosHeaders) {
    this.axiosConfig.headers = headers;
    return this;
  }
  /**
   * 获取请求头配置
   * @returns 当前设置的请求头对象
   */
  get headers(): any {
    return this.axiosConfig.headers;
  }
  /**
   * 追加请求
   * @param headers 请求头
   * @returns
   */
  appendHeaders(headers: RawAxiosRequestHeaders | AxiosHeaders) {
    const existingHeaders = this.axiosConfig.headers;
    if (!existingHeaders) {
      this.axiosConfig.headers = headers;
    } else {
      for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
          existingHeaders[key] = headers[key];
        }
      }
    }
    return this;
  }
  /**
   * 设置请求参数
   * @param params 请求参数
   * @returns HttpRequestConfig
   */
  setParams(params: any) {
    this.axiosConfig.params = params;
    return this;
  }
  /**
   * 获取请求参数（附加在 URL 查询字符串上的参数）
   * @returns 请求参数对象，将被序列化为 query string
   */
  get params() {
    return this.axiosConfig.params;
  }
  /**
   * 追加参数
   * @param params 追加没有的请求参数
   * @returns HttpRequestConfig
   */
  appendParams(params: any) {
    const existingParams = this.axiosConfig.params;
    if (!existingParams) {
      this.axiosConfig.params = params;
    } else {
      if (typeof params === 'object') {
        for (let key in params) {
          // 没有自有属性则追加
          if (!existingParams.hasOwnProperty(key)) {
            existingParams[key] = params[key];
          }
        }
      }
    }
    return this;
  }

  /**
   * 设置参数序列化器
   * @param serializer 序列化器
   * @returns HttpRequestConfig
   */
  setParamsSerializer(serializer: ParamsSerializerOptions | CustomParamsSerializer) {
    this.axiosConfig.paramsSerializer = serializer;
    return this;
  }
  /**
   * 获取参数序列化器配置
   * @returns 参数序列化选项或自定义序列化函数
   */
  get paramsSerializer() {
    return this.axiosConfig.paramsSerializer;
  }
  // ========== 请求体与超时 ==========
  /**
   * 设置请求体数据
   * @param data 请求体数据
   * @returns
   */
  setData(data: D) {
    this.axiosConfig.data = data;
    return this;
  }
  /**
   * 获取请求体数据（用于 POST、PUT 等有 body 的请求）
   * @returns 请求体数据对象或原始值
   */
  get data() {
    return this.axiosConfig.data;
  }
  /**
   * 设置请求超时时间
   * @param timeout 超时时间
   * @returns HttpRequestConfig
   */
  setTimeout(timeout: number) {
    this.axiosConfig.timeout = timeout;
    return this;
  }
  /**
   * 获取请求超时时间（毫秒）
   * @returns 超时时间，0 表示无超时限制
   */
  get timeout() {
    return this.axiosConfig.timeout;
  }
  /**
   * 设置请求超时时的消息
   * @param message 请求超时时的消息
   * @returns
   */
  setTimeoutErrorMessage(message: string) {
    this.axiosConfig.timeoutErrorMessage = message;
    return this;
  }
  /**
   * 获取超时错误时的自定义错误消息
   * @returns 超时时显示的错误信息字符串
   */
  get timeoutErrorMessage() {
    return this.axiosConfig.timeoutErrorMessage;
  }
  // ========== 跨域与认证 ==========
  /**
   * 是否允许跨域请求携带凭证和cookie
   * @param withCredentials 是否请求携带cookie和auth信息 true：携带 false：不携带
   * @returns HttpRequestConfig
   */
  setWithCredentials(withCredentials: boolean) {
    this.axiosConfig.withCredentials = withCredentials;
    return this;
  }
  /**
   * 获取是否携带凭据（如 cookies、Authorization 头等）
   * @returns true 表示跨域请求时携带凭据，false 表示不携带
   */
  get withCredentials() {
    return this.axiosConfig.withCredentials;
  }
  /**
   * 设置适配器
   * @param adapter 适配器对象或适配器数组
   * @returns
   */
  setAdapter(adapter: AxiosAdapter | AxiosAdapter[]) {
    this.axiosConfig.adapter = adapter;
    return this;
  }
  /**
   * 获取适配器配置（用于自定义请求发送逻辑，如 node.js 或 xhr）
   * @returns 适配器函数或适配器函数数组
   */
  get adapter() {
    return this.axiosConfig.adapter;
  }
  /**
   * 追加适配器
   * @param adapter 适配器对象或适配器数组
   */
  appendAdapter(adapter: AxiosAdapter | AxiosAdapter[]) {
    const existingAdapter = this.axiosConfig.adapter;
    const adapters = Array.isArray(adapter) ? adapter : [adapter];
    if (!existingAdapter) {
      this.axiosConfig.adapter = adapter;
    } else {
      if (Array.isArray(existingAdapter)) this.axiosConfig.adapter = [...existingAdapter, ...adapters];
      else this.axiosConfig.adapter = [existingAdapter, ...adapters];
    }
  }
  /**
   * 设置认证信息
   * @param auth 认证信息
   * @returns HttpRequestConfig
   */
  setAuth(auth: AxiosBasicCredentials) {
    this.axiosConfig.auth = auth;
    return this;
  }
  /**
   * 获取认证信息（HTTP Basic Auth）
   * @returns 包含 username 和 password 的认证对象
   */
  get auth() {
    return this.axiosConfig.auth;
  }
  // ========== 响应相关 ==========
  /**
   * 设置响应类型
   * @param responseType 响应类型
   * @returns HttpRequestConfig
   */
  setResponseType(responseType: ResponseType) {
    this.axiosConfig.responseType = responseType;
    return this;
  }
  /**
   * 获取响应数据类型（影响响应解析方式）
   * @returns 响应类型，如 'json' | 'text' | 'blob' | 'document' | 'arraybuffer' 等
   */
  get responseType() {
    return this.axiosConfig.responseType;
  }
  /**
   * 设置响应数据的编码格式
   * @param encoding 编码格式 'utf8' | 'ascii' | 'base64' | 'binary' | 'hex' | null
   * @returns HttpRequestConfig
   */
  setResponseEncoding(encoding: responseEncoding | string | undefined) {
    this.axiosConfig.responseEncoding = encoding;
    return this;
  }
  /**
   * 获取响应数据的编码格式（Node.js 环境下有效）
   * @returns 编码格式，如 'utf8' | 'ascii' | 'base64' | 'binary' | 'hex' | null
   */
  get responseEncoding() {
    return this.axiosConfig.responseEncoding;
  }
  /**
   * 上传进度回调
   * @param onUploadProgress 设置上传进度回调
   * @returns HttpRequestConfig
   */
  setOnUploadProgress(onUploadProgress: (progressEvent: AxiosProgressEvent) => void) {
    this.axiosConfig.onUploadProgress = onUploadProgress;
    return this;
  }
  /**
   * 获取上传进度回调函数
   * @returns 上传进度事件的回调函数
   */
  get onUploadProgress() {
    return this.axiosConfig.onUploadProgress;
  }
  /**
   * 下载进度回调
   * @param onDownloadProgress 设置下载进度回调
   * @returns HttpRequestConfig
   */
  setOnDownloadProgress(onDownloadProgress: (progressEvent: AxiosProgressEvent) => void) {
    this.axiosConfig.onDownloadProgress = onDownloadProgress;
    return this;
  }
  /**
   * 获取下载进度回调函数
   * @returns 下载进度事件的回调函数
   */
  get onDownloadProgress() {
    return this.axiosConfig.onDownloadProgress;
  }
  /**
   * 最大响应体长度
   * @param length 长度（单位字节）
   * @returns
   */
  setMaxContentLength(length: number) {
    this.axiosConfig.maxContentLength = length;
    return this;
  }
  /**
   * 获取最大响应内容长度（字节），超出将触发错误（Node.js 环境下有效）
   * @returns 最大响应体长度（字节）
   */
  get maxContentLength() {
    return this.axiosConfig.maxContentLength;
  }
  /**
   * 设置响应状态码验证函数
   * @param validateFn 验证函数
   * @returns HttpRequestConfig
   */
  setValidateStatus(validateFn: ((status: number) => boolean) | null) {
    this.axiosConfig.validateStatus = validateFn;
    return this;
  }
  /**
   * 获取用于验证 HTTP 状态码是否成功的函数
   * @returns 验证函数，返回 true 表示成功，false 表示失败（触发 catch）
   */
  get validateStatus() {
    return this.axiosConfig.validateStatus;
  }
  /**
   * 最大请求体长度
   * @param length 长度（单位字节）
   * @returns HttpRequestConfig
   */
  setMaxBodyLength(length: number) {
    this.axiosConfig.maxBodyLength = length;
    return this;
  }
  /**
   * 获取最大请求体长度（字节），超出将触发错误（Node.js 环境下有效）
   * @returns 最大请求体长度（字节）
   */
  get maxBodyLength() {
    return this.axiosConfig.maxBodyLength;
  }
  // ========== 重定向与代理 ==========
  /**
   * 设置最大重定向次数
   * @param max 最大重定向次数
   * @returns HttpRequestConfig
   */
  setMaxRedirects(max: number) {
    this.axiosConfig.maxRedirects = max;
    return this;
  }
  /**
   * 获取最大重定向次数（Node.js 环境下有效）
   * @returns 最大重定向跳转次数
   */
  get maxRedirects() {
    return this.axiosConfig.maxRedirects;
  }
  /**
   * 设置上传和下载速率
   * @param rate 上传/下载速率
   * @returns
   */
  setMaxRate(rate: number | [number, number]) {
    this.axiosConfig.maxRate = rate;
    return this;
  }
  /**
   * 获取上传/下载速率限制
   * @returns 速率限制值，单位字节/秒，可为单个值或 [upload, download] 数组
   */
  get maxRate() {
    return this.axiosConfig.maxRate;
  }
  /**
   * 设置重定向前的钩子函数
   * @param fn  重定向前的钩子函数
   * @returns HttpRequestConfig
   */
  setBeforeRedirect(
    fn: (
      options: Record<string, any>,
      responseDetails: { headers: Record<string, string>; statusCode: HttpStatusCode },
    ) => void,
  ) {
    this.axiosConfig.beforeRedirect = fn;
    return this;
  }
  /**
   * 获取重定向前的钩子函数（用于修改重定向行为）
   * @returns 重定向前执行的回调函数
   */
  get beforeRedirect() {
    return this.axiosConfig.beforeRedirect;
  }
  /**
   * 设置套接字路径
   * @param path 套接字路径
   * @returns
   */
  setSocketPath(path: string | null) {
    this.axiosConfig.socketPath = path;
    return this;
  }
  /**
   * 获取套接字路径（仅限 Node.js，用于连接 Unix 套接字）
   * @returns 套接字路径字符串，如 '/var/run/docker.sock'，或 null
   */
  get socketPath() {
    return this.axiosConfig.socketPath;
  }
  /**
   *
   * @param transport
   * @returns
   */
  setTransport(transport: any) {
    this.axiosConfig.transport = transport;
    return this;
  }

  /**
   * 设置合http的Agent对象
   * @description Node.js 中的 http.Agent 和 https.Agent 用于控制连接复用、超时、keep-alive 等
   * @example agent: new http.Agent({ keepAlive: true }) 表示复用Tcp连接，保持连接活跃
   */
  setHttpAgent(agent: any) {
    this.axiosConfig.httpAgent = agent;
    return this;
  }
  /**
   * 获取 HTTP Agent 对象（Node.js 环境）
   * @description 用于控制 HTTP 连接的行为，如 keep-alive、超时、连接复用等
   * @returns http.Agent 实例或自定义 Agent 对象
   */
  get httpAgent() {
    return this.axiosConfig.httpAgent;
  }
  /**
   * 设置合https的Agent对象
   */
  setHttpsAgent(agent: any) {
    this.axiosConfig.httpsAgent = agent;
    return this;
  }
  /**
   * 获取 HTTPS Agent 对象（Node.js 环境）
   * @description 用于控制 HTTPS 连接的行为，如证书、keep-alive、连接池等
   * @returns https.Agent 实例或自定义 Agent 对象
   */
  get httpsAgent() {
    return this.axiosConfig.httpsAgent;
  }
  /**
   * 设置Axios代理
   * @param proxy 代理对象
   * @returns HttpRequestConfig
   */
  setProxy(proxy: AxiosProxyConfig | false) {
    this.axiosConfig.proxy = proxy;
    return this;
  }
  /**
   * 获取代理配置
   * @description 用于设置请求通过的 HTTP/HTTPS 代理服务器
   * @returns 代理配置对象，格式为 { host, port, auth?: { username, password } }，或 false 表示禁用代理
   */
  get proxy() {
    return this.axiosConfig.proxy;
  }

  // ========== 安全与 XSRF ==========
  /**
   * 设置csrf cookie-to-header策略中放入请求头的cookie名称
   * @param name cookie名称
   * @returns HttpRequestConfig
   */
  setXsrfCookieName(name: string) {
    this.axiosConfig.xsrfCookieName = name;
    return this;
  }
  /**
   * 获取 CSRF 防护中用于读取 Cookie 的名称
   * @description 在 cookie-to-header 机制中，从指定名称的 Cookie 中读取 XSRF Token
   * @returns Cookie 名称字符串，如 'XSRF-TOKEN'
   */
  get xsrfCookieName() {
    return this.axiosConfig.xsrfCookieName;
  }
  /**
   * 设置csrf cookie-to-header策略中放入请求头的Token名称
   * @param name Token名称
   * @returns HttpRequestConfig
   */
  setXsrfHeaderName(name: string) {
    this.axiosConfig.xsrfHeaderName = name;
    return this;
  }
  /**
   * 获取 CSRF 防护中用于设置请求头的字段名称
   * @description 将从 Cookie 中读取的 Token 放入该请求头中发送
   * @returns 请求头名称字符串，如 'X-XSRF-TOKEN'
   */
  get xsrfHeaderName() {
    return this.axiosConfig.xsrfHeaderName;
  }
  /**
   * 设置自动携带XSRF token
   * @param condition true 自动携带 XSRF token false 不自动携带 XSRF token
   * @returns  HttpRequestConfig
   */
  setWithXSRFToken(condition: boolean | ((config: InternalAxiosRequestConfig) => boolean | undefined)) {
    this.axiosConfig.withXSRFToken = condition;
    return this;
  }
  /**
   * 获取是否自动携带 XSRF Token 的策略
   * @description 可以是布尔值，或一个函数，用于动态决定是否携带 Token
   * @returns boolean | ((config: InternalAxiosRequestConfig) => boolean | undefined)
   */
  get withXSRFToken() {
    return this.axiosConfig.withXSRFToken;
  }
  // ========== 流与压缩 ==========
  /**
   * 设置是否自动解压响应内容
   * @param decompress true 自动解压响应内容 false不自动解压响应内容
   * @returns HttpRequestConfig
   */
  setDecompress(decompress: boolean) {
    this.axiosConfig.decompress = decompress;
    return this;
  }
  /**
   * 获取是否自动解压响应内容
   * @description 当响应使用 gzip/deflate 压缩时，是否自动解压
   * @returns true 表示自动解压，false 表示不解压（需手动处理压缩流）
   */
  get decompress() {
    return this.axiosConfig.decompress;
  }

  /**
   * 设置自定义http解析器。
   * @param insecure 是否允许使用不安全的 HTTP 解析器
   * @returns HttpRequestConfig
   * @description 可以自定义解析器解析不标准的http协议
   */
  setInsecureHTTPParser(insecure: boolean) {
    this.axiosConfig.insecureHTTPParser = insecure;
    return this;
  }
  /**
   * 获取是否使用不安全的 HTTP 解析器
   * @description 允许使用非标准或宽松的 HTTP 协议解析（存在安全风险）
   * @returns true 表示允许使用不安全解析器
   */
  get insecureHTTPParser() {
    return this.axiosConfig.insecureHTTPParser;
  }
  // ========== 环境与序列化 ==========
  /**
   * 设置自定义FormData实现
   * @param env 自定义FormData实现
   * @returns HttpRequestConfig
   * @description node环境没有默认的FormData实现，需要自定义实现
   */
  setEnv(env: { FormData?: new (...args: any[]) => object }) {
    this.axiosConfig.env = env;
    return this;
  }
  /**
   * 获取自定义环境配置（如 FormData 实现）
   * @description 主要用于 Node.js 环境，提供 FormData 等浏览器 API 的 polyfill
   * @returns 包含 FormData 构造函数的环境对象
   */
  get env() {
    return this.axiosConfig.env;
  }
  /**
   * 设置表单序列化器
   * @param serializer 序列化器
   * @returns
   */
  setFormSerializer(serializer: FormSerializerOptions) {
    this.axiosConfig.formSerializer = serializer;
    return this;
  }
  /**
   * 获取表单序列化器配置
   * @description 用于控制表单数据（如 FormData）的序列化行为
   * @returns 表单序列化选项对象
   */
  get formSerializer() {
    return this.axiosConfig.formSerializer;
  }
  // ========== DNS 与网络 ==========
  /**
   * 指定 DNS 查找时使用的 IP 地址族
   * @example family: 4, // 强制使用 IPv4
   * @example family: 6, // 强制使用 IPv6
   * @returns HttpRequestConfig
   */
  setFamily(family: AddressFamily) {
    this.axiosConfig.family = family;
    return this;
  }
  /**
   * 获取 DNS 查找时使用的 IP 地址族
   * @description 4 表示仅使用 IPv4，6 表示仅使用 IPv6，0 表示自动选择
   * @returns AddressFamily 值（4 | 6 | 0）
   */
  get family() {
    return this.axiosConfig.family;
  }
  /**
   * 自定义 DNS 查找函数
   * @param lookup DNS 查找函数
   * @returns
   */
  setLookup(
    lookup: (
      hostname: string,
      options: object,
      cb: (err: Error | null, address: LookupAddress | LookupAddress[], family?: AddressFamily) => void,
    ) =>
      | void
      | ((
          hostname: string,
          options: object,
        ) => Promise<[address: LookupAddressEntry | LookupAddressEntry[], family?: AddressFamily] | LookupAddress>),
  ) {
    this.axiosConfig.lookup = lookup;
    return this;
  }
  /**
   * 获取自定义 DNS 查找函数
   * @description 用于替换默认的 DNS 解析逻辑，可实现自定义域名解析
   * @returns 自定义 lookup 函数
   */
  get lookup() {
    return this.axiosConfig.lookup;
  }
  // ========== 取消请求 ==========
  /**
   * 设置取消请求的信号
   * @param signal 取消请求的信号
   * @returns HttpRequestConfig
   */
  setSignal(signal: GenericAbortSignal) {
    this.axiosConfig.signal = signal;
    return this;
  }
  /**
   * 获取取消请求的信号对象（AbortSignal）
   * @description 用于通过 AbortController 控制请求的取消
   * @returns AbortSignal 实例
   */
  get signal() {
    return this.axiosConfig.signal;
  }
  /**
   * 设置取消请求的token
   * @param token 取消请求的token
   * @returns HttpRequestConfig
   * @deprecated 建议使用 setSignal
   */
  setCancelToken(token: CancelToken) {
    console.warn('setCancelToken is deprecated. Use setSignal instead.');
    this.axiosConfig.cancelToken = token;
    return this;
  }
  /**
   * 获取取消请求的 Token（已废弃）
   * @description 旧版取消机制，建议使用 signal 替代
   * @deprecated 建议使用 signal 代替 cancelToken
   * @returns CancelToken 实例
   */
  get cancelToken() {
    return this.axiosConfig.cancelToken;
  }
  // ========== Fetch 适配器选项 ==========
  /**
   * 设置fetch适配器选项
   * @param options fetch适配器选项
   * @returns HttpRequestConfig
   * @description 当 Axios 在浏览器中使用 fetch 作为底层适配器（adapter） 时，这个字段允许你传入额外的 fetch() 配置选项
   */
  setFetchOptions(options: Omit<RequestInit, 'body' | 'headers' | 'method' | 'signal'> | Record<string, any>) {
    this.axiosConfig.fetchOptions = options;
    return this;
  }
  /**
   * 获取 fetch 适配器的额外选项
   * @description 当使用 fetch 作为底层适配器时，传入 fetch() 的额外配置（不包括 body、headers、method、signal）
   * @returns fetch() 支持的其他选项对象
   */
  get fetchOptions() {
    return this.axiosConfig.fetchOptions;
  }
  // ========== 过渡配置 ==========
  /**
   * 设置过渡策略
   * @param transitional 过渡策略配置对象，用于处理 Axios 未来版本中可能废弃或更改的某些行为的向后兼容选项。
   * @example
   * // 示例：配置过渡策略
   * instance.setTransitional({
   *   silentJSONParsing: true,    // 当响应数据不是有效 JSON 时，是否静默忽略解析错误（默认行为是抛出错误）。设置为 true 可避免因非 JSON 响应导致的错误。
   *   forcedJSONParsing: true,    // 是否强制尝试将响应数据解析为 JSON，即使响应的 Content-Type 不是 application/json。设置为 false 可以禁用自动 JSON 解析。
   *   clarifyTimeoutError: true   // 当请求超时时，是否将错误信息明确化为 "timeout" 错误，而不是模糊的 "Network Error"。设置为 true 可以更清晰地识别超时错误。
   * });
   * @description
   * transitional 选项主要用于平滑升级，允许开发者在 Axios 版本更新时，控制一些旧有行为的处理方式。
   * - `silentJSONParsing`: 处理非预期 JSON 响应时更宽容。
   * - `forcedJSONParsing`: 控制是否无视 Content-Type 强制解析 JSON。
   * - `clarifyTimeoutError`: 改善超时错误的可读性和可调试性。
   * 这些选项在未来的 Axios 主要版本中可能会被移除，建议在升级后根据新行为调整代码，逐步减少对过渡策略的依赖。
   * @returns 返回当前实例，支持链式调用。
   */
  setTransitional(transitional: TransitionalOptions) {
    this.axiosConfig.transitional = transitional;
    return this;
  }
  /**
   * 获取过渡配置（transitional options）
   * @description 用于处理 Axios 版本升级中的兼容性行为，如 JSON 解析策略、超时错误提示等
   * @returns TransitionalOptions 配置对象
   */
  get transitional() {
    return this.axiosConfig.transitional;
  }
  // ========== 构建最终配置 ==========
  /**
   * 获取配置
   * @returns AxRequestConfig 配置对象
   */
  getOriginalConfig(): T {
    return this.axiosConfig;
  }

  /**
   * 深克隆配置
   * @returns AxRequestConfig 配置对象
   */
  cloneOriginalConfig(): T {
    return ObjectUtils.deepClone(this.axiosConfig);
  }

  /**
   * 重设配置
   */
  setConfig(config: T) {
    this.axiosConfig = config;
  }
}
