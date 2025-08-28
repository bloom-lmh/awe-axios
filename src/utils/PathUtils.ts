/**
 * 路径处理工具
 */
export class PathUtils {
  /**
   * 当前处理的值
   */
  private value: string;
  /**
   * 构造函数
   * @param value 待处理的值
   */
  constructor(value: string) {
    this.value = value;
  }
  /**
   * 去除Url中多余的/
   * @returns PathUtils实例
   */
  removeExtraSlash() {
    this.value = PathUtils.removeExtraSlash(this.value);
    return this;
  }
  /**
   * 去除路径中多余的空格
   * @returns PathUtils实例
   */
  removeExtraSpace() {
    this.value = PathUtils.removeExtraSpace(this.value);
    return this;
  }
  /**
   * 解析路径参数
   * @description 将路径参数替换为真实路径
   */
  resolvePathParams(params: Record<string, any>) {
    this.value = PathUtils.resolvePathParams(this.value, params);
    return this;
  }
  /**
   * 转换为结果
   * @returns 处理后的结果
   */
  toResult(): string {
    return this.value;
  }
  /**
   * 链式入口
   * @param value 待处理的值
   */
  static chain(value: string): PathUtils {
    return new PathUtils(value);
  }

  /**
   * 判断是否含有http请求绝对路径
   * @param url 待判断的Url
   */
  static isHttpUrl(url: string): boolean {
    return /^https?:\/\//.test(url);
  }
  /**
   * 去除Url中多余的/
   * @param url 待处理的Url
   */
  static removeExtraSlash(url: string): string {
    // 负向先行断言：去除不以http或https开头的多余的/
    return url.replace(/(?<!https?:)\/+/g, '/');
  }
  /**
   * 去除路径中多余的空格
   * @param url 待处理的路径
   */
  static removeExtraSpace(url: string): string {
    return url.replace(/\s+/g, '');
  }

  /**
   * 根据路径参数列表解析路径
   * @param url 待解析的路径
   * @param params 路径参数列表
   * @returns 解析后的路径
   */
  static resolvePathParams(url: string, params: Record<string, any>): string {
    // 若路为空或路径参数为空则返回
    if (!url || Object.keys(params).length === 0) {
      return url;
    }
    // 正则替换路径参数
    url = url.replace(/:([\w-]+)/g, (str, p1) => {
      return params[p1] ? params[p1] : str;
    });
    return url;
  }

  /**
   * 判断是否为绝对的http路径
   */
  static isAbsoluteHttpUrl(url: string): boolean {
    return /^https?:\/\//.test(url);
  }
}
