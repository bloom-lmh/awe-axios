/* 装饰器名 */
export const DECORATORNAME = {
  ANONYMOUSE: Symbol('@Anonmouse'), // 匿名装饰器
  COMPONENT: Symbol('@Component'), // @Component装饰器
  INJECT: Symbol('@Inject'), // @Inject装饰器
  HTTPAPI: Symbol('@HttpApi'), // @Api装饰器
  GET: Symbol('@Get'), // @Get装饰器
  POST: Symbol('@Post'), // @Post装饰器
  PUT: Symbol('@Put'), // @Put装饰器
  HEAD: Symbol('@Head'), // @Head装饰器
  OPTIONS: Symbol('@Options'), // @Options装饰器
  DELETE: Symbol('@Delete'), // @Delete装饰器
  PATCH: Symbol('@Patch'), // @Patch装饰器
  PATHPARAM: Symbol('@PathParam'), // @Param装饰器
  QUERYPARAM: Symbol('@QueryParam'), // @Query装饰器
  BODYPARAM: Symbol('@BodyParam'), // @BodyParam装饰器

  // 小项
  REFAXIOS: Symbol('@RefAxios'), // @RefAxios装饰器
  AXIOSREF: Symbol('@AxiosRef'), // @AxiosRef装饰器

  // 类型
  HTTPMETHOD: Symbol('@HttpMethod'), // @HttpMethod装饰器
};
