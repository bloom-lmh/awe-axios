/* 装饰器名 */
export const DECORATORNAME = {
  // 装饰器名字
  ANONYMOUSE: Symbol('@Anonmouse'), // 匿名装饰器

  // aop
  COMPONENT: Symbol('@Component'), // @Component装饰器
  INJECT: Symbol('@Inject'), // @Inject装饰器
  HTTPAPI: Symbol('@HttpApi'), // @Api装饰器

  // http
  GET: Symbol('@Get'), // @Get装饰器
  POST: Symbol('@Post'), // @Post装饰器
  PUT: Symbol('@Put'), // @Put装饰器
  HEAD: Symbol('@Head'), // @Head装饰器
  OPTIONS: Symbol('@Options'), // @Options装饰器
  DELETE: Symbol('@Delete'), // @Delete装饰器
  PATCH: Symbol('@Patch'), // @Patch装饰器

  // params
  PATHPARAM: Symbol('@PathParam'), // @Param装饰器
  QUERYPARAM: Symbol('@QueryParam'), // @Query装饰器
  BODYPARAM: Symbol('@BodyParam'), // @BodyParam装饰器

  // http items
  REFAXIOS: Symbol('@RefAxios'), // @RefAxios装饰器
  AXIOSREF: Symbol('@AxiosRef'), // @AxiosRef装饰器
  MOCK: Symbol('@Mock'), // @Mock装饰器
  TRANSFORMREQUEST: Symbol('@TransformRequest'), // @TransformRequest装饰器
  TRANSFORMRESPONSE: Symbol('@TransformResponse'), // @TransformResponse装饰器
  RETRY: Symbol('@Retry'), // @Retry装饰器
  THROTTLE: Symbol('@Throttle'), // @Throttle装饰器
  DEBOUNCE: Symbol('@Debounce'), // @Debounce装饰器

  // aop
  BEFORE: Symbol('@Before'), // @Before装饰器
  AFTER: Symbol('@After'), // @After装饰器
  AROUND: Symbol('@Around'), // @Around装饰器
  AFTERRETURN: Symbol('@AfterReturn'), // @AfterReturn装饰器
  AFTERTHROW: Symbol('@AfterThrow'), // @AfterThrow装饰器
  POINTCUT: Symbol('@Pointcut'), // @Pointcut装饰器
  ASPECT: Symbol('@Aspect'), // @Aspect装饰器

  // dataFaker
  DATAMODEL: Symbol('@DataModel'), // @DataModel装饰器
  DATAFIELD: Symbol('@DataField'), // @DataField装饰器

  // type
  HTTPMETHOD: Symbol('@HttpMethod'), // @HttpMethod装饰器
};
