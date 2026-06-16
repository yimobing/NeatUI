/**
 * ajax-pro 
 * jQuery $.ajax 增强封装，UMD通用模块化版本
 * 兼容性：兼容ie8+
 * 与旧插件区分：旧版：小写 ajax({})  新版：大写 Ajax({}) / Ajax.request({}) 大小写隔离无冲突
 * @version: v1.0.3
 * @date 2026-06-16
 * @pubDate: 2026-06-16
====================================================================================
【核心特性清单】
1. UMD 全兼容：AMD/CMD/CommonJS/浏览器script全局引入
2. 双调用语法：Ajax(options) 简写 / Ajax.request(options) 完整写法，效果完全一致
3. 100%透传原生$.ajax全部配置项，参数结构与$.ajax完全对齐，一键替换迁移
4. 内置jQuery环境检测，未引入JQ时控制台抛出清晰阻断错误
5. 底层工具方法全部原生JS实现，仅网络请求依赖$.ajax，完整兼容IE6~IE11
6. 统一内置解析网络/HTTP异常：断网、请求超时、404、500、其他服务错误
7. 仅输出标准化错误对象，插件内部不耦合弹窗、动画等业务UI组件
8. 不侵入业务逻辑：success内JSON解析、后端业务码判断全部交由页面自行编写
9. 私有状态隔离，无全局变量污染，同步/异步场景完美兼容
10. 异步jqXHR挂载 _reqResult 可读取完整请求状态与标准化错误信息
11. IE全兼容处理：移除const/let，内置Object.assign Polyfill，无任何ES6语法
====================================================================================
【依赖要求】
必须先引入 jQuery，再加载本脚本；未检测到$会直接抛出错误阻断执行
IE6/7 如需JSON解析，请页面额外引入 json2.js
====================================================================================
【模块化引入示例】
1. 浏览器直接script引入
    <script src="jquery.min.js"></script>
    <script src="neatui-ajax-pro.js"></script>
    <script>
        // 全局直接使用大写Ajax
        Ajax({ url: "/test", type: "POST" });
    </script>

2. RequireJS AMD
    require(["jquery", "neatui-ajax-pro"], function($, Ajax) {
        Ajax({ url: "/api/demo" });
    });

3. SeaJS CMD
    seajs.use(["jquery", "neatui-ajax-pro"], function($, Ajax) {
        Ajax.request({ url: "/api/demo" });
    });

4. Webpack / CommonJS
    var $ = require("jquery");
    var Ajax = require("./neatui-ajax-pro.js");
    Ajax({ url: "/api/demo" });
====================================================================================
【两种调用语法（完全等价，可混用）】
// 简写（推荐，迁移替换最方便）
Ajax({
    async: false,
    url: "xxx.ashx",
    data: {},
    success: function(res) {}
});

// 完整方法调用
Ajax.request({
    async: false,
    url: "xxx.ashx",
    data: {},
    success: function(res) {}
});
====================================================================================
【同步请求示例 async:false】
var resWrap = Ajax({
    async: false,
    type: "POST",
    url: "../fwh_pub/jk_loupan_fujin.ashx?param=2002",
    data: { action: "xxx" },
    success: function(res) {
        // 业务逻辑自行处理JSON解析、返回码判断
        var flag = 1;
        var msg = "";
        if (!res) {
            flag = 0;
            msg = "返回数据为空";
            return;
        }
        var result = JSON.parse(res);
        flag = result.return === "ok" ? 1 : 0;
        if (!flag) msg = result.data;
    }
});

// 统一处理插件解析好的HTTP网络错误
if (!resWrap.isHttpSuccess) {
    var errInfo = resWrap.standardErr;
    console.log("标准化错误对象", errInfo);
    // 弹窗、销毁动画等UI逻辑全部写在页面
    neuiDialog.alert({ message: errInfo.message, buttons: ["确定"] });
    neui.destroyAnimate();
}
====================================================================================
【异步请求示例 async:true】
var jqXhr = Ajax({
    async: true,
    url: "/api/poll",
    data: {},
    success: function(res) {
        // 业务处理
    }
});
// 请求失败读取标准化错误
jqXhr.fail(function() {
    var err = jqXhr._reqResult.standardErr;
    console.error("请求失败", err.message);
    // 静默场景可直接打印日志，不弹窗
});
====================================================================================
【迁移原生$.ajax快速替换】
全局文本替换：
    $.ajax(  →  Ajax(
参数、success/error/beforeSend/complete 全部无需修改，直接复用原有业务代码
====================================================================================
【标准化错误对象 standardErr 结构】
{
    status: 状态码(0/404/500等),
    errType: 原始错误类型("timeout"/"error"),
    rawMsg: 原始错误文本,
    message: 统一翻译后的中文提示,
    isHttpError: true 标记为网络/服务异常
}
====================================================================================
*/
(function (root, factory) {
    // CMD - SeaJS
    if (typeof define === 'function' && define.cmd) {
        define(function () {
            return factory(root.jQuery);
        });
    }
    // AMD - RequireJS
    else if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    // CommonJS / Webpack
    else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'));
    }
    // 浏览器全局挂载
    else {
        root.Ajax = factory(root.jQuery);
    }
})(this, function ($) {
    // ===================== IE兼容：Object.assign Polyfill =====================
    if (typeof Object.assign !== 'function') {
        Object.assign = function (target) {
            var output;
            var i;
            var args = arguments;
            if (target === undefined || target === null) {
                throw new TypeError('Object.assign target cannot be null or undefined');
            }
            output = Object(target);
            for (i = 1; i < args.length; i = i + 1) {
                var source = args[i];
                if (source !== undefined && source !== null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            output[key] = source[key];
                        }
                    }
                }
            }
            return output;
        };
    }

    // ===================== jQuery 依赖检测 =====================
    if (!$ || typeof $.ajax !== 'function') {
        var errMsg = '[neatui-ajax-pro 加载失败] 未检测到jQuery，请优先引入jQuery再加载本脚本';
        console.error(errMsg);
        throw new Error(errMsg);
    }

    // ===================== 私有基础默认配置 =====================
    var DEFAULT_BASE_OPT = {
        cache: false
    };

    /**
     * 私有原生工具：统一解析HTTP/网络错误，输出标准错误结构体
     * @param {XMLHttpRequest} xhr
     * @param {string} errType
     * @param {string} errMsg
     * @returns {Object} standardErr
     */
    function parseStandardHttpError(xhr, errType, errMsg) {
        var status = xhr.status;
        var message = '';

        if (status === 0) {
            message = '网络异常，您的网络已断开，请检查网络连接';
        } else if (errType === 'timeout') {
            message = '请求超时，请稍后重试';
        } else if (status === 404) {
            message = '接口地址不存在';
        } else if (status === 500) {
            message = '服务器内部错误';
        } else {
            message = '请求失败：' + errMsg;
        }

        return {
            status: status,
            errType: errType,
            rawMsg: errMsg,
            message: message,
            isHttpError: true
        };
    }

    /**
     * 核心请求逻辑
     * @param {Object} userAjaxOpts 原生$.ajax完整配置，全部透传生效
     * @returns {Object | jqXHR}
     *  async=false 同步：返回 reqResult 状态对象
     *  async=true 异步：返回原生jqXHR，挂载 _reqResult
     */
    function request(userAjaxOpts) {
        // 合并默认配置
        var ajaxOpts = Object.assign({}, DEFAULT_BASE_OPT, userAjaxOpts);

        // 当前请求私有状态
        var reqResult = {
            isHttpSuccess: false,
            standardErr: null,
            responseData: null,
            xhr: null
        };

        // 缓存用户自定义原生回调
        var userBeforeSend = ajaxOpts.beforeSend;
        var userSuccess = ajaxOpts.success;
        var userError = ajaxOpts.error;
        var userComplete = ajaxOpts.complete;

        // 包装 beforeSend
        ajaxOpts.beforeSend = function (xhr) {
            reqResult.xhr = xhr;
            if (typeof userBeforeSend === 'function') {
                userBeforeSend.call(this, xhr);
            }
        };

        // 包装 success
        ajaxOpts.success = function (res, textStatus, xhr) {
            reqResult.isHttpSuccess = true;
            reqResult.responseData = res;
            reqResult.xhr = xhr;
            reqResult.standardErr = null;
            if (typeof userSuccess === 'function') {
                userSuccess.call(this, res, textStatus, xhr);
            }
        };

        // 包装 error：统一解析标准错误
        ajaxOpts.error = function (xhr, errType, errMsg) {
            reqResult.isHttpSuccess = false;
            reqResult.xhr = xhr;
            reqResult.standardErr = parseStandardHttpError(xhr, errType, errMsg);
            if (typeof userError === 'function') {
                userError.call(this, xhr, errType, errMsg);
            }
        };

        // 包装 complete
        ajaxOpts.complete = function (xhr, status) {
            reqResult.xhr = xhr;
            if (typeof userComplete === 'function') {
                userComplete.call(this, xhr, status);
            }
        };

        // 发起jQuery ajax
        var jqXHR = $.ajax(ajaxOpts);

        // 同步直接返回状态
        if (ajaxOpts.async === false) {
            return reqResult;
        }

        // 异步挂载状态对象
        jqXHR._reqResult = reqResult;
        return jqXHR;
    }

    // 双调用方式挂载
    var Ajax = request;
    Ajax.request = request;

    return Ajax;
});