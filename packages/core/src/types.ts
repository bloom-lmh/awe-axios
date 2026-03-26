import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';

export type MethodKey = string | symbol;

export type ApiCall<TData = unknown, TRequest = unknown> = Promise<AxiosResponse<TData, TRequest>>;

export interface HttpRuntimeContext {
  instance: unknown;
  target: object;
  propertyKey: MethodKey;
  methodId: string;
  args: unknown[];
  originalMethod: (...args: any[]) => unknown;
}

export interface HttpMethodConfig<TRequestData = unknown> extends AxiosRequestConfig<TRequestData> {
  refAxios?: AxiosInstance;
  plugins?: HttpRuntimePlugin[];
}

export type HttpMethodDecoratorConfig<TRequestData = unknown> = HttpMethodConfig<TRequestData>;

export interface HttpApiConfig<TRequestData = unknown> extends Omit<HttpMethodConfig<TRequestData>, 'method'> {}

export interface ResolvedHttpRequestConfig<TRequestData = unknown> extends HttpMethodConfig<TRequestData> {
  method: Method;
  methodId: string;
  refAxios: AxiosInstance;
}

export type HttpRequestExecutor = <TResponse = unknown, TRequestData = unknown>(
  config: ResolvedHttpRequestConfig<TRequestData>,
) => Promise<AxiosResponse<TResponse, TRequestData>>;

export type HttpRuntimePlugin = (next: HttpRequestExecutor, context: HttpRuntimeContext) => HttpRequestExecutor;

export type ParamBindingKind = 'path' | 'query' | 'body';

export interface ParamBinding {
  index: number;
  kind: ParamBindingKind;
  name?: string;
}
