/**
 **【MOCK模拟数据】
 ** 现场查看表 模块
 */

 Mock.setup({
    timeout: '100-1000' // 延时时间为N到M毫秒.要加引号不然不起作用
});
// 在拦截器中添加延时
// Mock.XHR.setup({
//    timeout: 1000 // 全局设置超时时间为1000毫秒
// });

// Mock.XHR.prototype.open = function(method, url){
//     this._method = method;
//     this._url = url.split('?')[0]; // 关键：砍掉 ? 后面所有内容
//   };





//————————————————————————————————————————————————
// TODO: 获取数据
Mock.mock("/api/jk_getuser.ashx?param=10001", "get", function(options) {
    // var body = JSON.parse(options.body);
    // console.log('body：', body); // body 即为post请求时传来的数据
    return Mock.mock({
        "code": "200",
        "return": "ok",
        "user_name": "@cname()",
        "user_sex|1": ["男", "女"]
    })
});