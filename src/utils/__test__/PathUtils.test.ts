import { PathUtils } from '@/utils/PathUtils';
import { url } from 'inspector';
test.each([
  { url: 'http://////// www.example.com/', expected: 'http://www.example.com/' },
  { url: 'http://www.exa   mple.com//users////', expected: 'http://www.example.com/users/' },
  { url: '/users//list//////info', expected: '/users/list/info' },
  {
    url: 'https:////   www.e xample.com//users/list///info/:id/:name',
    expected: 'https://www.example.com/users/list/info/:id/:name',
  },
  {
    url: 'http://ww  w.example.com//info?name=test&id=123',
    expected: 'http://www.example.com/info?name=test&id=123',
  },
])('1. PathUtils.removeExtraSlash能够去除url中的多余/，并保留http或https前缀//', ({ url, expected }) => {
  console.log(PathUtils.chain(url).removeExtraSlash().removeExtraSpace().toResult());
  expect(PathUtils.chain(url).removeExtraSlash().removeExtraSpace().toResult()).toBe(expected);
});

test.only.each([
  {
    url: 'http://////// www.example.com/:id/:name-x1/:age_x2/:123/:_pageNum',
    expected: 'http://////// www.example.com/1/xm/12/num/1111',
  },
  {
    url: 'http://www.exa   mple.com//users/:id/:name-x1/:age_x2/:123/:_pageNum',
    expected: 'http://www.exa   mple.com//users/1/xm/12/num/1111',
  },
  {
    url: '/users//list//////info//:id/:name-x1/:age_x2/:123/:_pageNum',
    expected: '/users//list//////info//1/xm/12/num/1111',
  },
  {
    url: 'https:////   www.e xample.com//users/list///info/:id/:name-x1/:age_x2/:123/:_pageNum',
    expected: 'https:////   www.e xample.com//users/list///info/1/xm/12/num/1111',
  },
  {
    url: 'http://ww  w.example.com//info/:id/:name-x1/:age_x2/:123/:_pageNum?name=test&id=123',
    expected: 'http://ww  w.example.com//info/1/xm/12/num/1111?name=test&id=123',
  },
  {
    url: 'http://ww  w.example.com//info/',
    expected: 'http://ww  w.example.com//info/',
  },
  {
    url: 'http://ww  w.example.com//info/:xxd/:xxxxd/:ss-x/:1233',
    expected: 'http://ww  w.example.com//info/:xxd/:xxxxd/:ss-x/:1233',
  },
])('2. PathUtils.resolvePathParams能够正确解析相对路径', ({ url, expected }) => {
  expect(
    PathUtils.resolvePathParams(url, {
      id: 1,
      'name-x1': 'xm',
      age_x2: 12,
      123: 'num',
      _pageNum: 1111,
    }),
  ).toBe(expected);
});
