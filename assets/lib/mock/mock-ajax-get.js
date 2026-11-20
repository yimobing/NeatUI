/**
 *  mock-ajax-get
 *  Mock XHR GET 请求 data 适配器
 * [功能说明]：让 Mock 支持 $.ajax 以 type:"GET" 发起请求时正常传递 data 参数。
 * [功能描述]：解决Mock原生兼容问题，支持jQuery ajax发起GET请求时通过data参数传递数据，Mock可正常拦截匹配并返回模拟接口数据。
 * @Author: ChenMuFeng
 * @Date: 2026.05.06
 * @Version: 1.1.3
 * @PubDate: 2026.11.20

 * [使用说明]
    使用之前请先引入 mock.js
    Mock.js 官网：http://mockjs.com/
    Mock.js Github：https://github.com/nuysoft/Mock
    CDN资源浏览页面(cdnjs)：https://cdnjs.com/libraries/Mock.js
    实际script引入CDN地址：https://cdnjs.cloudflare.com/ajax/libs/Mock.js/1.0.0/mock-min.js

 * [Mock原生问题说明]
    原生 Mock.js 不兼容 jQuery Ajax GET + data 传参，jQuery 会自动把 data 拼接到 URL 造成路由匹配失效，仅原生支持 POST + data，通过以下劫持代码可做全局适配兼容。

 * [附带解决的问题]
    （使用中顺带暴露的原生缺陷，本文件一并兼容，不属于本适配器的主要目的）
    1. cache:false —— jQuery 会给 GET 自动追加 _=时间戳，同样破坏 Mock 的全等路由匹配。
    2. 未注册 Mock 规则的真实请求 —— 必须原样透传，不能被本适配器改写 URL。
    3. dataType 自动推断 —— Mock 拦截成功后响应头为空，未写 dataType 时 jQuery 只能按 text 处理，返回字符串。

 * [行为约定]
    ✅ $.ajax GET 可以正常传 data 参数
    ✅ URL 不会拼接 $.ajax GET 的 data 参数（在 $.ajax 层直接摘除，不依赖事后剔除）
    ✅ Mock 地址不会 404
    ✅ GET / POST 完全兼容
    ✅ Mock.mock 的类型大小写不敏感：get / GET、post / POST 均可命中
    ✅ $.ajax 的 type 大小写不敏感（jQuery 内部本就归一化为大写）
    ✅ Mock 路由继续使用字符串，无需改写成正则
    ✅ 业务 ajax 无需删除 cache:false，也无需改写 url
    ✅ cache:false 追加的 _=时间戳 会自动剔除（仅针对已注册 Mock 的请求）
    ✅ 未注册 Mock 规则的请求原样透传，绝不改写真实后端 URL
    ✅ JSONP / script 的 GET data 不摘除（二者无需 XHR，data 必须由 jQuery 拼到 script src）
    ✅ Mock 模拟请求遵循 dataType：
        dataType:"html" / "text" → 返回 JSON 字符串
        dataType:"json"           → 返回对象
        不传 dataType             → 依据伪造的 Content-Type 自动推断为对象
    ✅ 本脚本仅在开发调试页面引入，生产环境不加载，真实接口的 cache:false 完全原生
    ✅ 兼容 IE9 + jQuery 1.x ~ 4.x

 * [实现要点]
    （排查问题时的参考，不属于对外功能）
    - GET data 摘除：$.ajax 入口删除 settings.data，从源头保证 URL 不拼接业务 data。
    - 参数回填：包装 $.ajaxSettings.xhr 工厂，把 data 挂到 XHR 实例，open 内写入 custom.options。
      （Mock 的 open 只接收 url/method，拿不到 jQuery settings，必须由工厂建立通道）
    - URL 清洗时机：必须在 XHR.open 入参处。jQuery 在 $.ajax 内部才追加 _=（1.8.3 为 7910 行、3.6.0 为 9602 行），
      而 ajaxPrefilter 在此之前执行，故在外层或 prefilter 中清洗必然失效。
    - 拦截判定：使用 this.match（Mock open 内匹配成功后置 true）。Mock 源码中并不存在 _isMock。
    - 响应头注入：this.match 为 true 时补 Content-Type: application/json; charset=utf-8。
    - 响应解析：不劫持 responseJSON，完全交由 jQuery 原生 dataType + Content-Type 逻辑。
    - 注册类型归一化：Mock 内部只对请求侧 options.type 做 toLowerCase，注册侧的 rtype 原样全等比较
      （源码 find 中 match(item.rtype, options.type.toLowerCase())），故大写注册永不命中。
      本文件在 Mock.mock 入口把字符串类型的小写化，并对已注册的 _mocked 做一次存量归一化。

 * [使用约定]
    Mock.mock("/api/demo", "get", function (opt) {
        opt.data    // GET data（已被摘除出 URL，由适配器回填）；同名多值为数组
        opt.query   // 同上，等价别名
        opt.body    // POST 请求体
        return { code: 200, msg: "ok" };
    });
    // Mock 路由与请求 url 请保持同一写法（都写相对路径或都写绝对地址），Mock 为全等匹配。

 * [变更记录]
    1. 恢复 GET data 摘除：在 $.ajax 入口把 GET 的 data 备份到 settings._mockGetData 并删除，
       使 jQuery 不再把 data 拼接到 URL，从源头保证 Mock 字符串路由可命中。
    2. 参数回填通道：包装 $.ajaxSettings.xhr 工厂，在实例创建时把 settings 上的 _mockGetData 挂到
       XHR 实例，XHR.open 内取出后写入 custom.options，供 mock 模板通过 opt.data 读取。
       （Mock 的 open 只接收 url/method，拿不到 jQuery settings，故必须由工厂建立通道）
    3. 修正拦截锚点：同时兼容 Mock.XHR.prototype 与 window.XMLHttpRequest.prototype，按原型去重。
    4. 修正拦截时机：URL 清洗（仅剔除 _=）下沉到 XHR.open 入参。原 $.ajax 外层 / ajaxPrefilter 均早于
       jQuery 追加 _= 的时机（jQuery 1.8.3 于 7910 行、3.6.0 于 9602 行追加，prefilter 在其之前执行），必然失效。
    5. 修正判定标志：原使用不存在的 _isMock（Mock 源码中无此属性），恒为 undefined 导致所有分支不执行。
       现统一使用 this.match（open 内匹配成功后置 true），header 注入必须在 match 为 true 时生效。
    6. 移除 responseJSON 劫持，响应解析完全交由 jQuery 原生逻辑（dataType + Content-Type）。
    7. 未注册 Mock 规则的请求不再清洗 URL，原样透传真实后端，避免开发环境混布真实接口时被改写。
    8. JSONP / script 请求不摘除 GET data，避免 script src 参数丢失。
    9. 增加防重复包装标记（$.ajax 与 xhr 工厂），脚本重复引入不会二次包装。
    10.console 增加存在性保护，IE9 未开开发者工具时不会因 console.warn 抛错中断。
    11.正则判定改用 Object.prototype.toString，兼容跨 iframe 的 RegExp。
    12.URL 无查询串时跳过规则遍历；同名参数收集为数组，避免多值丢失。
    13.重新梳理头部注释结构：以「GET 传 data」为唯一主功能，cache:false / dataType / 真实请求透传
       降级为附带解决的问题，实现细节单列「实现要点」，避免主次混淆。
    14.注册类型大小写兼容：包装 Mock.mock 把字符串类型的 rtype 归一化为小写，并对脚本加载前已注册的
       规则做一次存量归一化；willMatch 的类型比较同步收敛为与 Mock 内部一致的字符串全等 / 正则匹配。
 */

(function (window) {
    var $ = window.$;
    if (!$ || !$.ajax) {
        warn("[mock-ajax-get] jQuery 未加载，跳过初始化");
        return;
    }
    if (!window.Mock) {
        warn("[mock-ajax-get] Mock.js 未加载，跳过初始化");
        return;
    }

    function warn(message) {
        if (window.console && window.console.warn) {
            window.console.warn(message);
        }
    }

    function isRegExp(value) {
        return Object.prototype.toString.call(value) === "[object RegExp]";
    }

    // 拆分 url：返回基础地址与查询项（丢弃 hash，XHR 不发送 hash）
    function splitUrl(url) {
        var index = url.indexOf('#');
        if (index > -1) {
            url = url.slice(0, index);
        }
        var qIndex = url.indexOf('?');
        if (qIndex === -1) {
            return { base: url, items: [] };
        }
        var query = url.slice(qIndex + 1);
        var items = [];
        if (query) {
            var parts = query.split('&');
            for (var i = 0; i < parts.length; i++) {
                if (parts[i]) {
                    items.push(parts[i]);
                }
            }
        }
        return { base: url.slice(0, qIndex), items: items };
    }

    // 仅剔除 jQuery 防缓存参数 _=，保留业务查询串
    function stripCacheOnly(url) {
        var parts = splitUrl(url);
        var kept = [];
        for (var i = 0; i < parts.items.length; i++) {
            if (!/^_=/.test(parts.items[i])) {
                kept.push(parts.items[i]);
            }
        }
        return parts.base + (kept.length ? "?" + kept.join("&") : "");
    }

    // 剔除全部查询串
    function stripAll(url) {
        return splitUrl(url).base;
    }

    // 解析查询串为对象（剔除 _=，同名参数收集为数组）
    function parseQueryString(query) {
        var params = {};
        var has = false;
        var parts = String(query || "").split('&');
        for (var i = 0; i < parts.length; i++) {
            var item = parts[i];
            if (!item || /^_=/.test(item)) {
                continue;
            }
            var eq = item.indexOf('=');
            var key = eq === -1 ? item : item.slice(0, eq);
            var value = eq === -1 ? "" : item.slice(eq + 1);
            try {
                key = decodeURIComponent(key.replace(/\+/g, " "));
                value = decodeURIComponent(value.replace(/\+/g, " "));
            } catch (e) {}
            if (params[key] === undefined) {
                params[key] = value;
            } else if (Object.prototype.toString.call(params[key]) === "[object Array]") {
                params[key].push(value);
            } else {
                params[key] = [params[key], value];
            }
            has = true;
        }
        return has ? params : null;
    }

    // 统一 GET data 形态：对象原样返回，字符串解析为对象
    function normalizeGetData(data) {
        if (data == null) {
            return null;
        }
        if (typeof data === "string") {
            return parseQueryString(data);
        }
        return data;
    }

    // 类型比较：与 Mock 内部 find 的 match() 保持一致（字符串全等 / 正则 test）
    function typeMatch(item, type) {
        if (!item.rtype) {
            return true;
        }
        if (typeof item.rtype === "string") {
            return item.rtype === type;
        }
        if (isRegExp(item.rtype)) {
            item.rtype.lastIndex = 0;
            return item.rtype.test(type);
        }
        return false;
    }

    // 预判某个 url 能否命中已注册的 Mock 规则（与 Mock 内部 find 判定保持一致）
    function willMatch(url, method) {
        var mocked = window.Mock && window.Mock._mocked;
        if (!mocked) {
            return false;
        }
        var type = String(method || "").toLowerCase();
        for (var key in mocked) {
            if (!mocked.hasOwnProperty(key)) {
                continue;
            }
            var item = mocked[key];
            if (!item || !item.rurl) {
                continue;
            }
            var urlOk = false;
            if (typeof item.rurl === "string") {
                urlOk = item.rurl === url;
            } else if (isRegExp(item.rurl)) {
                item.rurl.lastIndex = 0;
                urlOk = item.rurl.test(url);
            }
            if (!urlOk) {
                continue;
            }
            if (typeMatch(item, type)) {
                return true;
            }
        }
        return false;
    }

    // 注册类型归一化
    // Mock 内部只把请求侧 options.type 转小写，注册侧的 rtype 原样参与全等比较，
    // 因此 Mock.mock(url, "GET", ...) 永远命中不了。这里统一把字符串类型降为小写。
    function normalizeMockTypes() {
        var mocked = window.Mock && window.Mock._mocked;
        if (!mocked) {
            return;
        }
        for (var key in mocked) {
            if (!mocked.hasOwnProperty(key)) {
                continue;
            }
            var item = mocked[key];
            if (item && typeof item.rtype === "string") {
                item.rtype = item.rtype.toLowerCase();
            }
        }
    }

    // 处理脚本加载前已注册的大写规则
    normalizeMockTypes();

    // 得到用于 Mock 路由匹配的 url；未命中任何规则时保留原始 url
    function resolveMockUrl(url, method, fullyStripped) {
        var cacheStripped = stripCacheOnly(url);
        if (willMatch(cacheStripped, method)) {
            return { url: cacheStripped, stripped: false };
        }
        var allStripped = fullyStripped ? fullyStripped() : stripAll(url);
        if (willMatch(allStripped, method)) {
            return { url: allStripped, stripped: true };
        }
        return { url: url, stripped: false };
    }

    // ============================================================
    // 1. $.ajax 入口：摘除 GET 的 data，避免 jQuery 拼接到 URL
    // ============================================================
    var originalAjax = $.ajax;

    if (!originalAjax.__mockAjaxGetWrapped) {
        var wrappedAjax = function (url, options) {
            var isObjectCall = typeof url === "object" && url !== null;
            var settings;

            if (isObjectCall) {
                settings = $.extend({}, url);
            } else {
                settings = $.extend({}, options || {});
                settings.url = url;
            }

            var reqType = String(settings.type || settings.method || "GET").toUpperCase();
            var dataType = String(settings.dataType || "").toLowerCase();

            // JSONP / script 走 script 标签，data 必须由 jQuery 拼到 src 上
            var keepDataOnUrl = dataType === "jsonp" || dataType === "script";

            if (reqType === "GET" && settings.data != null && !keepDataOnUrl) {
                settings._mockGetData = normalizeGetData(settings.data);
                delete settings.data;
            }

            if (isObjectCall) {
                return originalAjax.call($, settings);
            }
            return originalAjax.call($, settings.url, settings);
        };

        wrappedAjax.__mockAjaxGetWrapped = true;
        $.ajax = wrappedAjax;
    }

    // ============================================================
    // 2. 参数回填通道：xhr 工厂把 settings 上的 GET data 挂到实例
    //    jQuery 调用 options.xhr() 时 this 即 settings 对象
    // ============================================================
    var ajaxSettings = $.ajaxSettings;
    if (ajaxSettings && typeof ajaxSettings.xhr === "function" && !ajaxSettings.xhr.__mockAjaxGetWrapped) {
        var originalXhrFactory = ajaxSettings.xhr;
        var wrappedXhrFactory = function () {
            var xhr = originalXhrFactory.apply(this, arguments);
            if (xhr && this && this._mockGetData) {
                xhr._mockGetData = this._mockGetData;
            }
            return xhr;
        };
        wrappedXhrFactory.__mockAjaxGetWrapped = true;
        ajaxSettings.xhr = wrappedXhrFactory;
    }

    // ============================================================
    // 3. Mock XHR 原型补丁
    // ============================================================
    function patchProto(proto) {
        if (!proto || proto.__mockAjaxGetPatched) {
            return;
        }
        proto.__mockAjaxGetPatched = true;

        var originalOpen = proto.open;
        var originalGetResponseHeader = proto.getResponseHeader;
        var originalGetAllResponseHeaders = proto.getAllResponseHeaders;

        // 关键：URL 最终清洗在 open 入参处（此时 jQuery 已追加 _=，路由匹配尚未发生）
        proto.open = function (method, url, async, username, password) {
            var finalUrl = url;
            var isGet = typeof method === "string" && method.toUpperCase() === "GET";
            var queryParams = null;

            if (isGet && typeof url === "string" && url.indexOf("?") > -1) {
                var resolved = resolveMockUrl(url, method, null);
                finalUrl = resolved.url;
                if (resolved.url !== url) {
                    var qIndex = url.indexOf("?");
                    var qEnd = url.indexOf("#");
                    queryParams = parseQueryString(url.slice(qIndex + 1, qEnd === -1 ? url.length : qEnd));
                }
            }

            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            args[1] = finalUrl;

            var result = originalOpen.apply(this, args);

            // match 在 originalOpen 内部完成路由判定后被置为 true
            if (this.match === true && this.custom && this.custom.options) {
                var getData = this._mockGetData || queryParams;
                if (getData) {
                    this.custom.options.data = getData;
                    this.custom.options.query = getData;
                }
            }

            return result;
        };

        // Mock 拦截成功后响应头恒为空，需要补 Content-Type 供 jQuery 自动推断 dataType
        proto.getResponseHeader = function (name) {
            if (this.match === true) {
                var key = String(name || "").toLowerCase();
                if (key === "content-type") {
                    return "application/json; charset=utf-8";
                }
                var headers = this.custom && this.custom.responseHeaders;
                return headers ? headers[key] : null;
            }
            return originalGetResponseHeader.apply(this, arguments);
        };

        proto.getAllResponseHeaders = function () {
            if (this.match === true) {
                var raw = originalGetAllResponseHeaders.apply(this, arguments) || "";
                if (!/content-type/i.test(raw)) {
                    raw += "Content-Type: application/json; charset=utf-8\r\n";
                }
                return raw;
            }
            return originalGetAllResponseHeaders.apply(this, arguments);
        };
    }

    function install() {
        if (window.Mock && window.Mock.XHR && window.Mock.XHR.prototype) {
            patchProto(window.Mock.XHR.prototype);
        }
        // 全局已被 Mock 接管时补挂一次（与 Mock.XHR 为同一原型时会被去重）
        if (window.XMLHttpRequest && window._XMLHttpRequest && window.XMLHttpRequest !== window._XMLHttpRequest) {
            patchProto(window.XMLHttpRequest.prototype);
        }
    }

    install();

    // ============================================================
    // 4. 包装 Mock.mock：注册时归一化类型，同时兜底安装原型补丁
    //    原先仅在「脚本早于 Mock.mock 加载」时才包装，导致大写注册无法被纠正
    // ============================================================
    if (typeof window.Mock.mock === "function" && !window.Mock.mock.__mockAjaxGetWrapped) {
        var originalMock = window.Mock.mock;
        var wrappedMock = function () {
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            // 仅三参数形式（rurl, rtype, template）且 rtype 为字符串时归一化
            if (args.length >= 3 && typeof args[1] === "string") {
                args[1] = args[1].toLowerCase();
            }
            var ret = originalMock.apply(this, args);
            install();
            return ret;
        };
        wrappedMock.__mockAjaxGetWrapped = true;
        window.Mock.mock = wrappedMock;
    }
})(window);
    