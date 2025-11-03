/**
 * 公共方法
 */

import { HttpResponse } from 'msw';

/**
 * 网络错误
 * @returns
 */
export function netWorkError() {
  return HttpResponse.error();
}
