/**
 * 对象处理工具
 */
export class ObjectUtils {
  /**
   * 深克隆对象
   */
  public static deepClone(obj: any, hashMap = new WeakMap()): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    if (hashMap.has(obj)) return hashMap.get(obj);
    let cloneObj = Object.create(Object.getPrototypeOf(obj));
    hashMap.set(obj, cloneObj);
    for (let propertyKey in obj) {
      if (obj.hasOwnProperty(propertyKey)) {
        if (typeof obj[propertyKey] === 'object') {
          cloneObj[propertyKey] = this.deepClone(obj[propertyKey], hashMap);
        } else {
          cloneObj[propertyKey] = obj[propertyKey];
        }
      }
    }
    return cloneObj;
  }

  /**
   * 判断对象是否为空
   */
  public static isEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
}
