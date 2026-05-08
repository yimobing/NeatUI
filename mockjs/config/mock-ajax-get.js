    //————————————————————————————————————————————————
    /**
     *  mock-ajax-get
     *  Mock XHR GET 请求 data 适配器
     * [功能说明]：让Mock支持 $.ajax GET 请求使用data参数传递数据
     * [功能描述]：解决Mock原生兼容问题，支持jQuery ajax发起GET请求时通过data参数传递数据，Mock可正常拦截匹配并返回模拟接口数据。
     * [Mock原生问题说明]：原生 Mock.js 不兼容 jQuery Ajax GET + data 传参，jQuery 会自动把 data 拼接到 URL 造成路由匹配失效，仅原生支持 POST + data，通过以下劫持代码可做全局适配兼容。
     * [解决问题如下]：
        ✅ $.ajax GET 可以正常传 data 参数
        ✅ URL 不会拼接 $.ajax data 中的参数
        ✅ Mock 地址不会 404
        ✅ 不用改已有的接口地址
        ✅ 返回 JSON 对象，不是字符串
        ✅ GET / POST 完全兼容
        ✅ 不进 error
        ✅ 业务代码零改动
     * Author: ChenMuFeng
     * Date: 2026.05.06
     * PubDate: 2026.05.06
     */
    (function () {
        // 劫持 $.ajax
        var originalAjax = $.ajax;
        $.ajax = function (url, options) {
            if (typeof url === 'object') {
                options = url;
                url = options.url;
            }
            options = options || {};
            
            // 🔥 关键：阻止 jQuery 把 data 拼到 URL
            options.processData = false; // 布尔值，规定通过请求发送的数据是否转换为查询字符串。默认是 true。
            options.dataType = 'json';
            
            return originalAjax.call($, url, options);
        };

        // 劫持 send
        var originalSend = Mock.XHR.prototype.send;
        Mock.XHR.prototype.send = function (data) {
            this._mockData = data;
            originalSend.call(this, data);
        };

        // 劫持 getResponseHeader
        var originalGetResponseHeader = Mock.XHR.prototype.getResponseHeader;
        Mock.XHR.prototype.getResponseHeader = function (name) {
            if (name && name.toLowerCase() === 'content-type') {
                return 'application/json';
            }
            return originalGetResponseHeader.call(this, name);
        };

        // 劫持 onload
        var originalOnload = Mock.XHR.prototype.onload;
        Mock.XHR.prototype.onload = function () {
            var raw = this.responseText || this.response;
            try {
                var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                this._processedResponse = JSON.stringify(parsed);
            } catch (e) {
                this._processedResponse = raw;
            }
            Object.defineProperty(this, 'responseText', {
                get: function () { return this._processedResponse; },
                configurable: true
            });
            if (this.response !== undefined) {
                Object.defineProperty(this, 'response', {
                    get: function () { return this._processedResponse; },
                    configurable: true
                });
            }
            originalOnload.call(this);
        };
    })();