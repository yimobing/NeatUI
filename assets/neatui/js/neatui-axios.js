
/**
 * [$axios]
 * axios 自定义封装接口
 * Author: Mufeng
 * Date: 2023.06.15
 * Update: 2023.06.15
 *  [调用方法]
    $axios(options).then().catch(); // 自定义请求方式，即通过配置options配置项的参数method='post'或'get'来设置请求方式
    $axios.post(url, data, config).then().catch(); // POST 请求
    $axios.get(url, params, config).then().catch(); // GET 请求
    $axios.all([promise1, promise1, ...]).then().catch(); // 并发请求。 promise1, promise2等实例是一个 POST 或 GET 请求
*/

//———————————————————————————————————————————————————————————————————
// 一、控件对象
//———————————————————————————————————————————————————————————————————
;(function(root, factory){
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.AJAX = factory();
    }
})(this, function(){

    //================================================================
    // 构造函数
    //================================================================
    function AJAX(elem, options) {
        
        this.defaults = {

            // · 自定义参数
            debug: false, // 是否启用调试功能(可选)，默认false。false时接口有问题将显示“友好提示信息”，true时接口有问题将显示“直接提示信息”
            vue: null, // vue实例化对象，用于弹窗(可选)。如不传则为null，表示默认使用alert弹窗。

            // · 原生参数，即 Axios API 里的“请求配置项”，控件里默认只写出部分，您可根据需要进行添加
            // 即将被发送的自定义请求头。即发送给后台的数据格式，不同的数据格式后台接收方法也不同。
            // GET 请求时，默认使用的是“查询格式的字符串”，前端即使指定“JSON格式的字符串”也不起作用，请知悉！
            // headers: { "Content-Type": "application/x-www-form-urlencoded" },// 查询格式的字符串格。eg. "?a=3&b=5"
            headers: { "Content-Type": "application/json" }, // JSON格式字符串。eg. "{a:3, b:5}"
            method: "get",  // 请求方法(可选)，默认 get
            baseURL: "", // 自动加在url前面，除非url是一个绝对 URL(可选)。它可以通过设置一个 `baseURL` 便于为实例的方法传递相对 URL
            url: "", // 用于请求的服务器地址
            params: { // 请求方法为 "GET" 时与请求一起发送的 URL 参数

            },
            data: { // 请求方法为 "POST", "PUT" 和 "PATCH" 时请求主体被发送的数据
                
            },
            timeout: 5000 // 指定请求超时的毫秒数(可选)，超时的话请求将被中断，默认设置为5秒。0 表示无超时时间。
            // 其它参数见Axios官网
            //..
        }
        
    };



    //================================================================
    // 原型添加相关的方法
    //================================================================
    //———————————————————————————————————————————————————
    // !!! 初始化
    AJAX.prototype.init = function(options){
        var url = options.url,
            method = options.method.toLocaleLowerCase();
        // console.log('data：', data);
        if (method == 'get') {
            return this.get(url, options);
        }
        else if (method == 'post') {
            return this.post(url, options.data, options);
        }
    };



    //———————————————————————————————————————————————————
    /**
     * !!! ALL方法：axios 执行多个并发请求
     * @param {array} eventsFnArr 多个请求(promise对象)组成的数组。这些请求可以是POST或GET请求，或两者皆有。
     * @returns 返回promise.all对象
     */
    AJAX.prototype.all = function (eventsFnArr) {
        return Promise.all(eventsFnArr);
    };



    //———————————————————————————————————————————————————
    /**
     * !!! GET 方法，axios get 请求
     * @param {string} url 用于请求的服务器 URL
     * @param {object} params 请求主体被发送的数据
     * @param {object} config 请求配置项
     */
    AJAX.prototype.get = function (url, config) {
        // 调用原生 GET
        var $http = fnIntercept(this);
        return new Promise((resolve, reject) => {
            $http.get(url, config).then(res => {
                resolve(res);
            }).catch(errs => {
                reject(errs);
            });
        });
    };



    //———————————————————————————————————————————————————
    // 
    /**
     * !!! POST 方法，axios post 请求
     * @param {string} url 用于请求的服务器 URL
     * @param {object} data 请求主体被发送的数据
     * @param {object} config 请求配置项
     */
    AJAX.prototype.post = function (url, data, config) {
        // 调用原生 POST
        var $http = fnIntercept(this);
        return new Promise((resolve, reject) => {
            $http.post(url, data, config).then(res => {
                resolve(res);
            }).catch(errs => {
                reject(errs);
            });
        });
    };



    //———————————————————————————————————————————————————
    /**
     * !!! 拦截器函数
     * @param {object} _this 控件对象
     * @returns 返回axios实例化对象
     */
    function fnIntercept(_this) {   
        // 创建实例并配置默认值
        // var instance = axios.create({
        //     baseURL: '',
        //     timeout: 0,
        //     headers: {
        //         post: { "Content-Type": "application/json" },
        //         get: { "Content-Type": "application/x-www-form-urlencoded" }
        //     }
        // });
        var instance = axios.create(_this.defaults);

        // 1.添加请求拦截器
        instance.interceptors.request.use(
            // 在发送请求之前做些什么
            (config) => {
                // console.log('config1:', config);
                // get请求映射参数
                if (config.method === 'get' && config.params) {
                    // let url = config.url + '?' + config.params;
                    // url = url.slice(0, -1);
                    // config.params = {};
                    // config.url = url;

                    // var joinStr = config.url.indexOf('?') >= 0 ? '&' : '?';
                    // var url = config.url + joinStr + utils.convertObject2Url(config.params);
                    // // console.log('URL：', url);
                    // // config.params = {};
                    // // config.url = url;
                    // config.data = utils.convertUrl2Object(url);
                }
                // post、put请求映射参数
                // if (config.method === 'post' || config.method === 'put') {
                //     const requestObj = {
                //         url: config.url,
                //         data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
                //         time: new Date().getTime()
                //     }
                //     console.log('requestObj：',requestObj);
                // }
                return config; // 这里一定要返回
            },
            // 对请求错误做些什么
            (error) => {
                return Promise.reject(error);
            }
        );

        // 2.添加响应拦截器
        instance.interceptors.response.use(
            // 2-1. 响应正常时做些什么。状态码 2xx 范围内的状态码都会触发该函数
            (response) => {
                // console.log('响应正常：', response);
                // console.log('dataX：', response.config.data);
                var config = response.config;
                // 先将URL格式的字符串转化成JSON格式的字符串
                if (typeof config.data != 'undefined' && !utils.isJsonString(config.data)) {
                    config.data = JSON.stringify(utils.convertUrl2Object(config.data));
                }
                // var datas = JSON.parse(config.data);
                var datas = config.method.toLocaleLowerCase() == 'post' ? JSON.parse(config.data) : JSON.parse(JSON.stringify(config.params));
                var action = datas.action;
                // 如果返回的状态码为 200，说明接口请求成功，可以正常拿到数据，否则抛出错误
                if (response.status == 200) {
                    var result = response.data;
                    // console.log('result：', result);
                    // 接口返回值不是标准格式 {return: "ok", data: ""}
                    if (typeof result["return"] == 'undefined') {
                        var abnormalMsg = '';
                        if (!config.debug) { // 友好提示信息
                            abnormalMsg = '数据异常，请联系管理员';
                        }
                        else { // 报错提示信息
                            abnormalMsg += '接口返回值格式有误！';
                            abnormalMsg += '<br>接口名称：' + action;
                            abnormalMsg += '<br>接口返回值：<br>' + JSON.stringify(result);
                        }
                        utils.toast(config.vue, abnormalMsg, {type: 'warning', title: '提示'});
                        return Promise.reject({ message: abnormalMsg, response: result });
                    }
                    // 接口操作失败时
                    else if (result["return"] != 'ok') {
                        var failMsg = typeof result["data"] == 'undefined' || result["data"] == '' ? '未知错误，请稍后再试' : result["data"];
                        var isLoginOverTime = failMsg.indexOf('登录超时') >= 0 ? true : false; // 是否登录超时，未实现
                        utils.toast(config.vue, failMsg, {
                            logout: isLoginOverTime,
                            type: 'warning',
                            title: '操作失败'
                        });
                        return Promise.reject({ message: failMsg, response: result });
                    }
                }

                else {
                    var unknownMsg = '';
                    if (!config.debug) { // 友好提示信息
                        unknownMsg = '请求失败，请稍后再试';
                    }
                    else { // 报错提示信息
                        unknownMsg += '接口请求失败！';
                        unknownMsg += '<br>接口名称：' + action;
                    }
                    utils.toast(config.vue, unknownMsg, {type: 'error'});
                    return Promise.reject(response);
                }
                return response;
            },
            
            // 2-2. 响应错误时做些什么。状态态码超出 2xx 范围的状态码都会触发该函数
            (error) => {
                // console.log('响应异常：', error);
                if (error && error.response) {
                    // 根据响应码具体处理。把错误信息加到 error 对象里
                    switch (error.response.status) {
                        case 400:
                            error.message = '请求错误';
                            break;
                        case 401:
                            error.message = '未授权，请重新登录'; // 未登录，跳转登录页
                            break;
                        case 403:
                            error.message = '拒绝访问'; // 没有权限访问
                            break;
                        case 404:
                            error.message = '请求地址错误，未找到该资源'; // API接口并不存在
                            // window.location.href = "/NotFound";
                            break;
                        case 405:
                            error.message = '请求方法未允许';
                            break;
                        case 408:
                            error.message = '请求超时，请稍后重试';
                            break;
                        case 500:
                            error.message = '服务器端出错'; // 服务器出现了内部错误
                            break;
                        case 501:
                            error.message = '网络未实现';
                            break;
                        case 502:
                            error.message = '网络错误';
                            break;
                        case 503:
                            error.message = '服务不可用';
                            break;
                        case 504:
                            // error.message = '网络超时';
                            error.message = '网络已断开，请检查网络设置'; // 没有网络时
                            break;
                        case 505:
                            error.message = 'http版本不支持该请求';
                            break;
                        default:
                            error.message = `连接错误${error.response.status}`;
                    }

                } else {
                    // 超时处理
                    if (JSON.stringify(error).includes('timeout')) { // 判断没有timeout这个字符串，有就是超时了。
                        error.message = '服务器响应超时，请刷新当前页';
                    }
                    else { // 没有的话我们就默认给他抛出一个自定义的错误信息
                        error.message = '连接服务器失败';
                    }

                    /* 处理断网的情况
                        eg: 请求超时或断网时，更新 state 的 network 状态
                        network 状态在 app.vue 中控制着一个全局的断网提示组件的显示隐藏
                        关于断网组件中的刷新重新获取数据，会在断网组件中说明 
                    */
                    if (!window.navigator.onLine) {
                        // 如果断网....
                        // store.commit('changeNetwork', false);
                        error.message = '网络出现问题，建议检查网络连接'; // 没有网络时
                    } else {
                        error.message = '未知错误，建议稍后再试';
                    }
                }
                
                var errMsg = '';
                var config = error.config;
                // 先将URL格式的字符串转化成JSON格式的字符串
                if (typeof config.data != 'undefined' && !utils.isJsonString(config.data)) {
                    config.data = JSON.stringify(utils.convertUrl2Object(config.data));
                }
                // var datas = JSON.parse(config.data);
                var datas = config.method.toLocaleLowerCase() == 'post' ? JSON.parse(config.data) : JSON.parse(JSON.stringify(config.params));
                var action = datas.action;
                if (!config.debug) { // 友好提示信息
                    errMsg += error.message;
                }
                else { // 报错提示信息
                    errMsg += error.message;
                    errMsg += '<br>接口名称：' + action;
                }  
                utils.toast(config.vue, errMsg, {type: 'error', title: '出错了Error'}); // 弹出错误信息
                return Promise.reject(error); // 返回处理结果
            }
        );

        return instance;
    }



    //================================================================
    // 工具库
    //================================================================
    var utils = {
        
        /**
         * !!! 弹出窗口
         * @param {Vue} _this Vue实例化对象
         * @param {string} str 提示信息文本
         * @param {object} opts 配置参数
         */
        toast: function (_this, str, opts) {
            // var msg = str.toString().replace(/\<br\>/g, '\n');
            // var msg = str.toString().replace(/(\<br([\s]+)?(\/?)([\s]+)?>)/g, '\n');
            // alert(msg);
            var defaults = {
                title: '', // 标题名称(可选)，默认空
                logout: false, // 是否登录超时(可选)，默认false
                type: 'error' // 弹窗类型(可选)。info 消息提示(默认), warning 警告提示, error 错误提示，success 成功提示
            }
            var settings = this.extend(true, {}, defaults, opts || {});
            var title = settings.title,
                logout = settings.logout,
                type = settings.type;
            // 销毁转圈
            if (typeof elementUi != 'undefined' && typeof elementUi.destroyAnimate == 'function') {
                elementUi.destroyAnimate();
            }
            // if (_this != null && typeof _this.loading != 'undefined') {
            //     _this.loading = false;
            // }
            // 弹出提示信息窗口
            if (_this != null && typeof _this.$alert == 'function') {
                _this.$alert(str, title, {
                    type: type,
                    dangerouslyUseHTMLString: true
                });
            }
            else {
                alert(str.toString().replace(/(\<br([\s]+)?(\/?)([\s]+)?>)/g, '\n'));
            }
        },



        /**
         * !!! 将URL参数转化对JSON对象
         * @param {string} url URL字符串。eg. 'www.xx.com?a=3&b=4&c=5'
         * @returns {object} 返回对象。 eg. {a: 3, b: 4, c: 5}
         */
        convertUrl2Object: function(url) {
            var p = url.indexOf('?') >= 0 ? url.split('?')[1] : url;
            var arr = p.split('&');
            var obj = {};
            for (let i = 0; i < arr.length; i++) {
                var item = arr[i].split('=');
                var key = item[0];
                var value = item[1];
                obj[key] = value;
            }
            return obj;
        },


         /**
         * !!! 将JSON对象转化成URL参数
         * @param {object} obj 对象。eg. eg. {a: 3, b: 4, c: 5}
         * @returns {object} 返回URL字符串。eg. 'www.xx.com?a=3&b=4&c=5' 
         */
        convertObject2Url: function(obj) {
            var str = '';
            for (var v in obj) {
                str += v + '=' + obj[v] + '&';
            }
            var url = str.substring(0, str.length - 1);
            return url;
        },



        /**
         * 判断字符串是否为JSON对象
         * @param {string} str 字符串
         * return {boolean} 返回值: true 是json,  false 是空、null、数组等非json
         */
        isJsonString: function (str) {
            if(typeof str === 'string'){
                try{
                    var obj = JSON.parse(str);
                    if(typeof obj == 'object' && obj){
                        return true;
                    }else{
                        return false;
                    }
                }catch(e){
                    //console.log('error:' + str + '!!!' + e);
                    return false;
                }
            }
            //console.log('It is not a string!');
            return false;  
        },


        /**
         * !!! 原生JS合并对象1
         * 即用一个或多个对象来扩展一个对象，返回被拓展的对象
         * 注：本函数很好的模拟了JQ extend合并对象
         * @param {boolean} deep 是否深度合并对象(可选),默认false
         * @param {object} target 目标对象，其他对象的成员属性将被附加到该对象上。
         * @param {object} object1 第1个被合并的对象(可选)。
         * @param {object} objectN 第N个被合并的对象(可选)。
         *  [调用示例] 
            格式：extend(deep, target, defs, opts);
            eg. extend(defs, opts); // 浅合并
            eg. extend(false, defs, opts); // 浅合并
            eg. extend({}, defs, opts); // 浅合并
            eg. extend(false, {}, defs, opts); //浅合并
            eg. extend(true, defs, opts); // 深合并
            eg. extend(true, {}, defs, opts); //深合并
        * [jq合并对象的方法]
            $.extend(deep, target, obj1, obj2, ..., objN);
        */
        extend: function(){
            var options, name, src, copy, deep = false, target = arguments[0], i = 1, length = arguments.length;
            if (typeof (target) === "boolean") deep = target, target = arguments[1] || {}, i = 2; // eg. extend(true, {}, defs, opts || {});
            if (typeof (target) !== "object" && typeof (target) !== "function") target = {}; // eg.
            if (length === i) target = this, --i;
            if(deep){ 
                // 深度合并
                for (; i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        target = fnExtendObject(target, options);
                    }
                }
            }else{ 
                // 浅合并
                for (; i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        for (name in options) {
                            src = target[name], copy = options[name];
                            if (target === copy) continue;
                            if (copy !== undefined) target[name] = copy;
                        }
                    }
                }
            }
            // console.log('target：', target)
            return target;


            /**
             * 子函数：递归深度合并JSON对象
             * 注：遇到相同元素级属性，以defs为准。
             * 参考：https://www.cnblogs.com/catgatp/p/9189228.html
             * @param {object} defs 第1个被合并的对象
             * @param {object} opts 第2个被合并的对象
             * @returns {object} 返回合并后的目标对象，所有被合并的对象的成员属性将被附加到该对象上。
             */
            function fnExtendObject(defs, opts){
                if(!fnIsJson(defs)  || !fnIsJson(opts)){
                    alert('参数不是JSON对象，请检查！');
                    return {};
                }
                var target = JSON.parse(JSON.stringify(defs)); // 赋值而不改变原对象(注意：对象直接赋值是引用赋值，会改变原对象)
                // 遇到相同元素级属性，以 minor 为准
                // 不返还新Object，而是 main 改变
                var mergeObj = function(minor, main) {
                    for(var key in minor) {
                        if(main[key] === undefined) { // 不冲突的，直接赋值 
                            main[key] = minor[key];
                            continue;
                        }
                        // 冲突了，如果是Object，看看有么有不冲突的属性; 不是Object 则以 minor 为准为主
                        // console.log(key)
                        if(fnIsJson(minor[key]) || fnIsArray(minor[key])) { // arguments.callee 递归调用，并且与函数名解耦 
                            // console.log("is json")
                            //arguments.callee(minor[key], main[key]);
                            mergeObj(minor[key], main[key]);
                        }else{
                            main[key] = minor[key];
                        }
                    }
                }
                mergeObj(opts, target);
                return target;
            }
            /**
             * 子函数：判断是否JSON对象
             */
            function fnIsJson(o) {
                return typeof o == "object" && (o != null && o.constructor == Object);
            }
            /**
             * 子函数：判断是否数组
             */
            function fnIsArray(o) {
                return Object.prototype.toString.call(o) == '[object Array]';
            }
        }
        
    };


    //================================================================
    // 返回对象
    //================================================================
    return AJAX;
});


//———————————————————————————————————————————————————————————————————
// 二、创建“既是函数又是对象”的实例
//———————————————————————————————————————————————————————————————————
function createNewInstace(config){
    // 说明：bind()就是将函数绑定到某个对象上。 例如：f.bind(obj)，实际上可以理解为 obj.f()
    // 实例化一个对像
    var context = new AJAX(config); // context 是一个实例化的对象，只能当对象使用，不能当函数使用。
    // 创建请求函数
    var instance = AJAX.prototype.init.bind(context); // instance 是一个函数，由 bind 返回的一个新函数，可以调用 instance()。
    // 将 Axios.prototype 对象中的方法添加到 instance 函数对象中
    // 为了实现能够将 instance 函数作为对象使用，我们就要将 AJAX.prototype 对象中的方法添加给 instance 。毕竟函数也一个对象，也能够添加方法。
    Object.keys(AJAX.prototype).forEach(function (item) {
        instance[item] = AJAX.prototype[item].bind(context);
    });
    // 为 instance 函数对象添加属性
    Object.keys(context).forEach(function (item) {
        instance[item] = context[item];
    })
    return instance;
}
var $axios = createNewInstace();