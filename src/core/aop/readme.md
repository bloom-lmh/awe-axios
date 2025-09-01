明确表达式 组成为

1.  模块名.类名.方法名
2.  模块名.@API.@GET

明确上下文内容包括

1.  axios 配置信息
2.  原方法

明确顺序为

1.  order 越小越外层
2.  外层优先访问到上下文
    order1 @Around 前部执行 -> order1 @Before 前部执行 ->order2 @Around 前部执行 -> order2 @Before 前部执行
    -> 原方法执行 ->
    order2 @After 执行 ->order2 @AfterReturning/Throwing->order2 @Around 结束 ->order1 @After 执行 ->order1 @AfterReturning/Throwing->order1 @Around 结束

明确设计模式采用

1.  代理模式：对原方法进行代理
2.  发布订阅模式，代理方法调用执行对应逻辑
3.  职责链模式

主要注意点：装饰器执行顺序上
解决顺序问题我觉得可以采用发布订阅模式
主要流程构想

1. aop 类中方法，先将方法封装为职责链结点
