/**
 * [neuiFunctions]
 * NeatUI 函数库
 * Author: ChenMufeng
 * Date: 2021.02.05
 * Update: 2021.07.20
 */


/**
 * --------------------------------------------------------------------------------------------------------------------
 *  [函数库说明]
 *  本函数库提供如下对象用于调用：
    拓展prototype兼容ie
    JQ小插件
    IEHacker
    utilities
    sortingAlgorithm
    calendar
    checker
    filter
    restrict
    format
    convert
    merge
 * --------------------------------------------------------------------------------------------------------------------
 */


//=====================================================================================================================
//                                                 拓展prototype兼容ie
//=====================================================================================================================
 /**
 * ie9-兼容原生js bind
 * 因为js addEventListener为兼容ie8-,会重写addEventListener，但重写的函数会使用到原生的js bind函数
 */
if(!Function.prototype.bind){
    Function.prototype.bind = function(){
        if(typeof this !== 'function'){
            throw new TypeError('Function.prototype.bind - what is trying to be bounded is not callable');
        }
        var _this = this;
        var obj = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        return function(){
            _this.apply(obj, args);
        }
    }
};

/**
 * ie9-兼容原生js filter
 */
if(!Array.prototype.filter){
    Array.prototype.filter = function(fun /*,thisp */){
        var len = this.length;
        if(typeof fun != 'function'){
            throw new TypeError();
        }
        var res = new Array();
        var thisp = arguments[1];
        for(var i = 0; i < len; i++){
            if(i in this){
                var val = this[i]; //in case fun mutates this
                if(fun.call(thisp, val, i, this)){
                    res.push(val);
                }
            }
        }
        return res;
    }
};


/**
 * ie9-兼容原生js indexOf
 */
if(!Array.prototype.indexOf){
    Array.prototype.indexOf = function(elt /*,from*/){
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if(from < 0) from += len;
        for(; from < len; from++){
            if(from in this && this[from] === elt) return from;
        }
        return -1;
    }
};


/**
 * ie9-兼容document.getElementsByClassName
 */
if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (className, element) {
        var children = (element || document).getElementsByTagName('*');
        var elements = new Array();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var classNames = child.className.split(' ');
            for (var j = 0; j < classNames.length; j++) {
                if (classNames[j] == className) {
                    elements.push(child);
                    break;
                }
            }
        }
        return elements;
    };
};


/**
 * ie9-兼容forEach
 */
if(!Array.prototype.forEach){
    Array.prototype.forEach = function(callback){
        for (var i = 0; i < this.length; i++){
            callback.apply(this, [this[i], i, this]);
        }
    }
};




/**
 * ie11- 兼容matches
 */
 if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
};

/**
 * ie11- 兼容closest方法（用于查找父元素）
 */
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;

        do {
            if (Element.prototype.matches.call(el, s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
};


/**
 * ie11-兼容Array.from
 */
 if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
        var number = Number(value);
        if (isNaN(number)) { return 0; }
        if (number === 0 || !isFinite(number)) { return number; }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
        };
        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
        // 1. Let C be the this value.
        var C = this;
        // 2. Let items be ToObject(arrayLike).
        var items = Object(arrayLike);
        // 3. ReturnIfAbrupt(items).
        if (arrayLike == null) {
            throw new TypeError("Array.from requires an array-like object - not null or undefined");
        }  
        // 4. If mapfn is undefined, then let mapping be false.
        var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
        var T;
        if (typeof mapFn !== 'undefined') {
            // 5. else
            // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
            if (!isCallable(mapFn)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function');
            }
            // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 2) {
            T = arguments[2];
            }
        }
        // 10. Let lenValue be Get(items, "length").
        // 11. Let len be ToLength(lenValue).
        var len = toLength(items.length);
        // 13. If IsConstructor(C) is true, then
        // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
        // 14. a. Else, Let A be ArrayCreate(len).
        var A = isCallable(C) ? Object(new C(len)) : new Array(len);
        // 16. Let k be 0.
        var k = 0;
        // 17. Repeat, while k < len… (also steps a - h)
        var kValue;
        while (k < len) {
            kValue = items[k];
            if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
            } else {
            A[k] = kValue;
            }
            k += 1;
        }
        // 18. Let putStatus be Put(A, "length", len, true).
        A.length = len;
        // 20. Return A.
        return A;
        };
    }());
 };





//=====================================================================================================================
//                                                  JQ小插件
//=====================================================================================================================
;(function($){
    $.fn.extend({
        /**
         * ie9-兼容on input 
         * eg. $("#div").onInput(function(e) { var $this = e.dom; var value = e.value; });
         * @param {function} callback 回调函数
         */
        onInput:function (callback) {
            var el = $(this);
            if("oninput" in el.get(0)){ // 当前浏览器是否支持 oninput 事件
                el.on("input", function () {
                    callback && callback({ dom: el, value: $(this).val() });
                });
            }else { // IE独有属性，IE9 以下版本使用   
                // el.keyup(function() {
                //     callback && callback( { dom: el, value: $(this).val()} );
                // });
                // el.change(function() {
                //     callback && callback( { dom: el, value: $(this).val()} );
                // });
                el.on("propertychange", function () {
                    callback && callback({ eom: el, value: $(this).val() });
                });
            }
        }
    });

    /**
     * textarea自动增加高度(适用于多个输入框元素)
     * @param {object} selector 输入框的js或jq对象
     * @param {string} opt 自定义初始高度、最大高度等参数组成的一维对象(可选). eg. {initHeight: 28, maxHeight: 120}
     * eg. $.makeTextareaExpanding('.name');
     * eg. $.makeTextareaExpanding('#id1, #id2');
     */
    $.makeTextareaExpanding = function(selector, opt){
        var _this = selector instanceof jQuery ? selector : $(selector);
        return _this.each(function(){
            var _this = $(this);
            utilities.makeTextareaExpanding($(this), opt);
        })
    };


    /**
     * 使用GET方式获取URL中参数（JQ方法）
     * @param {string} name 参数名
     * 注意：
     * 1.若参数为对象,则要使用JSON.stringify(对象)先将对象转化成字符串;
     * 2. 若参数值含中文，要传递参数时要使用 encodeURI()进行编码,否则会乱码，接收参数时一般无须使用decodeURI()进行解码也不会乱码
     * eg. 
        · 父页面传递参数：
        var json = {province:"福建省", city:"泉州市", county:"丰泽区"}
        var url = 'https://www.xxx.com/login.aspx?area=' + encodeURI(JSON.stringify(json));
        · 子页面接收参数：
        var result = JSON.parse($.getUrlParam('area'));
        var sheng = shi = qu = '';
        if(result != null){
            sheng = result.province;
            shi = result.city;
            qu = result.qu;
        }
    */
    $.getUrlParam = function(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r != null) return decodeURI(r[2]);
        return null;
    };
})(jQuery);



/**
 * 获取DOM节点的HTML代码
 * 用户在界面上输入的数据使用 JQ的.html()方法 无法获取到输入框中的值，使用本控件可解决这个问题
 * 使用方法：
 * eg1. $("#divID").getHtml(); 
 * eg2. $(".divClassName").getHtml();
 */
;(function ($) {
    var oldHTML = $.fn.html;
    $.fn.getHtml = function () {
        if (arguments.length) return oldHTML.apply(this, arguments);
        $("input, textarea, button", this).each(function () {
            this.setAttribute('value', this.value);
        });
        $("input", this).each(function () {
            this.setAttribute('value', this.value);
            this.innerText = this.value;
        });
        $(":radio,:checkbox", this).each(function () {
            // im not really even sure you need to do this for "checked"
            // but what the heck, better safe than sorry
            if (this.checked) this.setAttribute('checked', 'checked');
            else this.removeAttribute('checked');
        });
        $("option", this).each(function () {
            // also not sure, but, better safe...
            if (this.selected) this.setAttribute('selected', 'selected');
            else this.removeAttribute('selected');
        });
        return oldHTML.apply(this);
    };
    // optional to override real .html() if you want
    // $.fn.html = $.fn.formhtml;
})(jQuery);








//=====================================================================================================================
//                                                  独立函数
//=====================================================================================================================







//=====================================================================================================================
//                                                  IEHacker对象，让IE低版本浏览器兼容JS属性
//=====================================================================================================================
var IEHacker = {

    /**
	 * 让IE<=8浏览器兼容addEventListener
	 * 默认的ie8\ie7\ie6等低版本ie浏览器不支持js的addEventListener方法,只支持attachEvent方法,故需定个兼容函数
	 * @param {object} ele 绑定的元素
	 * @param {string} event 事件
	 * @param {function} fn 函数体
	 * eg.
		var usernameDom = document.getElementById('#username');
		if(usernameDom == null) return;
		//兼容ie8-的写法
		this.addEventListener(usernameDom,'paste',function(e){})
		//不兼容ie8-的原生js
		usernameDom.addEventListener('paste', function (e){})
	 */
	addEventListener:function(ele, event, fn){
		if(ele.addEventListener){
			ele.addEventListener(event, fn, false);
		}else{
			ele.attachEvent('on'+event,fn.bind(ele)); //js原生bind()函数也有兼容问题,故也需写个兼容函数
		}
    },
    

    /**
     * 让 IE<=9浏览器 on input 事件可以正常触发：退格Backspace、删除Del、剪切Cut等键
     */
    oninput: function(){
        (function (d) {
            var userAgent = navigator.userAgent;
            var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
            if(!isIE) return;
            
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            var fIEVersion = parseInt(RegExp["$1"]);
            if(fIEVersion > 9) return;
     
            d.addEventListener('selectionchange', function() {
                var el = d.activeElement;

                if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type === 'text')) {
                var ev = d.createEvent('CustomEvent');
                ev.initCustomEvent('input', true, true, {});
                el.dispatchEvent(ev);
                }
            })
        })(document);
    }


}; // END IEHACKER 对象




//=====================================================================================================================
//                                                  utilities对象, 工具库
//=====================================================================================================================
var utilities = {

    /**
     * 使用GET方式获取URL中参数（JS方法）
     * 即：截取url字符串中的某个参数值
     * @param {string} ps_key 要接收的参数名(可选). 若不存在,则返回null; 若缺省或空,则返回字符串各个参数组成的object对象
     * @param {string} ps_url url字符串(可选)。 若缺省或空,则自动读取当前浏览器中的链接地址
     * eg. 
     * 当前页面地址：https://www.xxx.com?a=1&b=2&c=3
     * var str = 'https://www.yyy.com?d=3&e=4&f=5';
     * getUrlParams('d', str); //3
     * getUrlParams('', str); //{d:3, e:4, f:5}
     * getUrlParams('a'); //1
     * getUrlParams(); //{a:1, b:2, c:3}
     */
    getUrlParams: function(ps_key, ps_url){
        ps_url = (typeof ps_url == 'undefined' || ps_url.toString().replace(/([ ]+)/g, '') == '' ) ? location.search : ps_url.replace(/(.*?)\?(.*?)$/, '?$2');
        ps_url = ps_url.replace(/^\?/, '').split('&');
        var paramsObj = {}
        for(var i = 0, iLen = ps_url.length; i < iLen; i++){
            var param = ps_url[i].split('=');
            if(param[0].toString().replace(/([ ]+)/g, '') != '') paramsObj[param[0]] = param[1];
        }
        if(ps_key){
            var paramValue = typeof paramsObj[ps_key] == 'undefined' ? paramsObj[ps_key] : decodeURI(paramsObj[ps_key]); //解码
            return paramValue || null;
        }
        return paramsObj;
    },


    /**
     * 获取url字符串中问号后面的参数
     * @param {string} ps_url 链接地址
     * @returns {string} 返回空或问号后观的字符串
     * eg. var str = 'https://www.xxx.com?a=1&b=2
     * getUrlQueryString(str); //a=1&b=2
     */
    getUrlQueryString: function(ps_url){
        var params = '';
        if(typeof ps_url == 'undefined') return params;
        if(ps_url.indexOf('?') >= 0){
            params = ps_url.substr(ps_url.indexOf('?') + 1, ps_url.length);
        }
        return params;
    },


    /**
     * 阅读更多，点击更多
     * 常用于只显示部分内容，当点击“更多”时则显示全部内容
     * @param {string|object} ps_selector 选择器节点或jq对象
     * @param {number} ps_length 默认显示的字符数(可选), 默认600
     * @param {string} ps_more_text 自定义“阅读更多”的文字(可选), 默认“阅读全文”
     */
    readMore: function(ps_selector, ps_length, ps_more_text){
        var $node = $(ps_selector);
        if ($node.length > 0) {
            var c = $node.html();
            var b = typeof ps_length == 'undefined' ? 600 : parseInt(ps_length); //600;
            var moreText = typeof ps_more_text == 'undefined' ? '阅读全文' : ps_more_text;
            var inTag = false,
            ii = 0,
            jj = 0;
            for (; jj < b; ii++) {
                tmp = c.charAt(ii);
                if (tmp == '<' && !inTag) {
                    inTag = true;
                    continue
                } else if (tmp == '>' && inTag) {
                    inTag = false;
                    continue
                } else if (inTag) {
                    continue
                }
                jj++
            };
            b = ii;
            var styles = ' style="display: inline-block; padding: 10px 35px; background-color: #ece7e7; color: #695e5e; text-align: center; font-size: 13px;"';
            var arrowStyle = {
                display: "inline-block",
                verticalAlign: "middle",
                width: "6px",
                height: "6px",
                marginTop: "-5px",
                marginRight: "8px",
                borderStyle: "solid",
                borderColor: "#695e5e",
                borderWidth: "1px 1px 0 0",
                transform: "rotate(135deg)"
            }
            if (c != undefined && c.length > b) {
                var html = '<div class="bodymore" style="margin: 15px auto; text-align: center;">'+
                                '<em><code class="show"></code></em>'+
                                '<span' + styles + '><i class="angle-double-down"></i>' + moreText+ '</span>'+
                            '</div>';
                $node.after(html);
                $('.bodymore').find('.angle-double-down').css(arrowStyle);
                $node.html(c.substring(0, b) + " ......");
                $(document).on("click", ".bodymore",
                function() {
                    if ($(this).find("code").hasClass("show")) {
                        $node.html(c);
                        $(this).remove()
                    }
                })
            }
        }
    },


    /**
     * 数组去重
     * @param {Array} ps_arr 原数组
     * @returns {Array} 返回去重后的新数组
     */
    uniqueArray: function(ps_arr){
		return ps_arr.filter(function(element, index, self){
			return self.indexOf(element) === index;
		})
    },


    /**
     * 判断字符串是否为数组（兼容ie9-)
     * @param {string|array} ps_str 要检测的字符串或数组
     * @returns {boolean} 返回布尔值. true 是数组, false 非数组
     */
    isArray:function(ps_str){
        return Object.prototype.toString.call(ps_str) === "[object Array]";
    },
    


    /**
     * 严格判断一个值是否等于NaN
     * @param {string} value 字符串
     * @returns {boolean} 返回布尔值. true 是NaN, false 不是NaN
     * eg. 
        isNaN("听风是风"); //false
        isNaN("123听风是风"); //false
        isNaN(123); //false
        isNaN(NaN); //true
    */
    //const isNaN = (value) => value !== value; //ie不支持箭头函数
    isNaN:function(value){
        return value !== value;
    },



    /**
     * textarea自动增加高度(适用于单个输入框元素)
     * @param {object} el 多行输入框的js或jq对象
     * @param {object} opt 自定义初始高度、最大高度等参数组成的一维对象(可选). eg. {initHeight: 28, maxHeight: 120}
     * eg. var el = document.getElementById('id');
     * eg. var el = $('#textarea');
     */
    makeTextareaExpanding:function(el, opt){
        var defaults = {
            initHeight: 28,
            maxHeight: 120
        }
        var settings = $.extend(true, {}, defaults, opt || {} );
        var _height = typeof opt == 'undefined' ? null : isNaN(parseInt(opt.initHeight)) ? null : parseInt(opt.initHeight),
            _maxHeight = typeof opt == 'undefined' ? null : isNaN(parseInt(opt.maxHeight)) ? null : parseInt(opt.maxHeight);
        var _isContinue = true;
        if(el instanceof jQuery) el = el[0]; //jq对象转化成js对象
        var setStyle = function(el, h){
            if(!_isContinue) return;
            el.style.height = 'auto';
            el.style.height = ( typeof h == 'undefined' || h == null ? el.scrollHeight : parseInt(h.toString().replace(/px/g, '')) )  + 'px';
            el.style.maxHeight = ( typeof h == 'undefined' || h == null ? el.scrollHeight : parseInt(h.toString().replace(/px/g, '')) )  + 'px';
            // console.log(el.scrollHeight);
            //限制最大高度
            var _elHeight = parseInt(el.style.height.toString().replace(/px/g, ''));
            //console.log('输入框高度：', _elHeight, '-限制最大高度：', _maxHeight);
            if(_maxHeight != null){
                if(_elHeight >= _maxHeight){
                    el.style.height = _maxHeight;
                    el.style.maxHeight = _maxHeight;
                    //console.log('超过了')
                    _isContinue = false;
                }
            }
        }
        var delayedResize = function(el) {
            window.setTimeout(function(){
                setStyle(el)
            }, 0)
        }
        if(el.addEventListener){
            el.addEventListener('input',function(){
                setStyle(el)
            },false);
            setStyle(el, _height)
        }else if(el.attachEvent){
            el.attachEvent('onpropertychange',function(){
                setStyle(el)
            })
            setStyle(el)
        }
        // if(window.VBArray && window.addEventListener) { //IE9
        //     el.attachEvent("onkeydown", function() {
        //     var key = window.event.keyCode;
        //         if(key == 8 || key == 46) delayedResize(el);
            
        //     });
        //     el.attachEvent("oncut", function(){
        //         delayedResize(el);
        //     })//处理粘贴
        // }
        if(window.VBArray) { // IE
			if(window.addEventListener){
				el.addEventListener("keydown", function() {
					var key = window.event.keyCode;
					if(key == 8 || key == 46) delayedResize(el);
				});
				el.addEventListener("cut", function(){  // 处理粘贴
					delayedResize(el);
				})
			}else if(el.attachEvent){
				el.attachEvent("onkeydown", function() {
					var key = window.event.keyCode;
					if(key == 8 || key == 46) delayedResize(el);
				});
				el.attachEvent("oncut", function(){  // 处理粘贴
					delayedResize(el);
				})
			}
		}
    },



    /**
     * 将标签转换成字符串（即HTML编码）
     * HTML与字符串互转义
     * @param {string} ps_str 含有标签的字符串
     * @returns {string} 返回不含标签的字符串
     * eg1.将 < 转义成 &lt; eg2.将 > 转义成 &gt;
     */
    htmlEncode: function(ps_str){
        var temp = document.createElement("div");
        (temp.textContent != null) ? (temp.textContent = ps_str) : (temp.innerText = ps_str);
        // 转义替换
        var output = temp.innerHTML.toString().replace(/\'/g, '&apos;').replace(/\"/g, '&quot;') // 单双引号转义
        // 回车换行替换成<br>
        output = output.replace(/\r/g, '<br>'); // 换行符替换成<br>
        output = output.replace(/\n/g, '<br>'); // 回车符替换成<br>
        // <br>替换成<p>
        if(output.indexOf('<br>') > -1){
            // 让p标签成对出现
            output = output.replace(/\<br\>/g, '</p><p>');
            output = output.replace(/^(?!\<.*)/g, '<p>');
            output = output.replace(/(?!\>.*)$/g, '</p>');
            // 替换中间没有内容的空标签. eg.<p></p>
            output = output.replace(/(\<p\>\<\/p\>)/g, '');
        }
        // 其它替换
        // 注：部分ios中手写输入时即使过滤掉所有空格了还会出现一个空格，如果把空格转换成&nbsp;的话数据库中会有&nbsp;导致搜索等功能匹配不了。
        // 故解决思路是：移动端把所有空格替换成空，在pc端把所有空格替换成一个&nbsp;
        if(typeof checker.checkIsMobile == 'function' && checker.checkIsMobile()){ // 移动端时
            output = output.replace(/\t/g, ''); // 制表符替换成空
            output = output.replace(/([\s]+)/g, ' '); // 多个空格替换成成一个空格
        }else{ // pc端时
            output = output.replace(/\t/g, '&nbsp;'); // 制表符替换成一个空格
            output = output.replace(/([\s]+)/g, '&nbsp;'); // 多个空格替换成一个空格
        }
		output = output.replace(/&lt;div&gt;([\s\S]*?)&lt;\/div&gt;/gi, '&lt;p&gt;$1&lt;/p&gt;');  // div标签换成p
        // 字符串化+斜杠处理
        output = output.replace(/\</g, '&lt;'); // 左尖括号替换成&lt;
        output = output.replace(/\>/g, '&gt;'); // 右尖括号替换成&gt;
        output = output.replace(/\\/g, '/'); // 反斜杠替换成斜杠
        //
        temp = null;
        return output;
    },



    /**
     * 将字符串转换成标签（即HTML解码）
     * 字符串与HTMl互转义
     * @param {string} ps_str 字符串
     * @returns {string} 返回含有标签的字符串
     * eg1. 将 &lt; 转义成 < eg2.将 &gt; 转义成 >
     */
    htmlDecode: function(ps_str){
        var temp = document.createElement('div');
        temp.innerHTML = ps_str;
        var output = temp.innerText ||temp.textContent;
        temp = null;
        return output;
    },



    /**
     * 监听事件addEventListener兼容ie9-
     * @param {selector} ele 绑定的元素
     * @param {event} event 事件
     * @param {function} fn 函数体
     * eg. 
        var userDom = document.getElementById('#username');
        if(userDom == null) return;
        utilities.addEventListener(userDom, 'past', function(e){ }); //兼容ie9-的写法
        userDom.addEventListener('paste', function(e){ }); ////不兼容ie9-的写法
     */
    addEventListener: function(ele, event, fn){
        if(ele.addEventListener){
            ele.addEventListener(event, fn, false);
        }else{
            ele.attachEvent('on' + event, fn.bind(ele)); //js原生bind函数也有兼容问题,故需写个兼容函数(本函数库已写了)
        }
    },


    /**
     * 重写toFixed，修复精度、不是真正四舍五入的问题
     * @param {number} ps_number 要四舍五入的数字
     * @param {number} ps_digit 小数位数
     * @returns {string} 返回小数点后有固定的x位小数
     */
    toFixed: function(ps_number, ps_digit){
        // toFixed兼容方法
        Number.prototype.toFixed = function (n) {
            if (n > 20 || n < 0) {
                throw new RangeError('toFixed() digits argument must be between 0 and 20');
            }
            var number = this;
            if (isNaN(number) || number >= Math.pow(10, 21)) {
                return number.toString();
            }
            if (typeof (n) == 'undefined' || n == 0) {
                return (Math.round(number)).toString();
            }

            var result = number.toString();
            var arr = result.split('.');

            // 整数的情况
            if (arr.length < 2) {
                result += '.';
                for (var i = 0; i < n; i += 1) {
                    result += '0';
                }
                return result;
            }

            var integer = arr[0];
            var decimal = arr[1];
            if (decimal.length == n) {
                return result;
            }
            if (decimal.length < n) {
                for (var i = 0; i < n - decimal.length; i += 1) {
                    result += '0';
                }
                return result;
            }
            result = integer + '.' + decimal.substr(0, n);
            var last = decimal.substr(n, 1);
            // 四舍五入，转换为整数再处理，避免浮点数精度的损失
            if (parseInt(last, 10) >= 5) {
                var x = Math.pow(10, n);
                result = (Math.round((parseFloat(result) * x)) + 1) / x;
                result = result.toFixed(n);
            }

            return result;
        };

        
        if(parseInt(ps_digit) > 20 || ps_digit < 0){
            console.log('toFixed() 小数位数必须是0到20位');
            return;
        }
        var d = new Number(ps_number);
        return d.toFixed(ps_digit);
    },


    /**
     * 原生JS获取dataset的值(兼容ie11-)
     * 示例：要取某个data-*(比如data-bh)的值 <=> getDataset(DOM元素).bh
     * @param {HTMLDOM} ele DOM元素
     * @returns 返回dataset集合.
     */
    getDataset: function(ele){
        if(ele.dataset){
            return ele.dataset;
        }else{
            var attrs = ele.attributes,//元素的属性集合
                dataset = {},
                name,
                matchStr;
            for(var i = 0;i<attrs.length;i++){
                //是否是data- 开头
                matchStr = attrs[i].name.match(/^data-(.+)/);
                if(matchStr){
                    //data-auto-play 转成驼峰写法 autoPlay
                    name = matchStr[1].replace(/-([\da-z])/gi,function(all,letter){
                        return letter.toUpperCase();
                    });
                    dataset[name] = attrs[i].value;
                }
            }
            return dataset;
        }
    },


    /**
     * 获取当前网络类型
     * @returns {string} 返回网络类型
     */
    getNetworkType: function() {
        var ua = navigator.userAgent;
        var networkStr = ua.match(/NetType\/\w+/) ? ua.match(/NetType\/\w+/)[0] : 'NetType/other';
        networkStr = networkStr.toLowerCase().replace('nettype/', '');
        var networkType;
        switch(networkStr) {
            case 'wifi':
                networkType = 'wifi';
                break;
            case '4g':
                networkType = '4g';
                break;
            case '3g':
                networkType = '3g';
                break;
            case '3gnet':
                networkType = '3g';
                break;
            case '2g':
                networkType = '2g';
                break;
            default:
                networkType = 'other';
        }
        return networkType;
    },

    /**
     * 生成[min, max]的随机数(位数不固定,从min到max)
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {number} 返回 min到max(含min及max)之间的随机数
     */
    getRandomMinMaxNumber: function(min, max){
        //return parseInt( Math.random() * ( max - min + 1) + min, 10 );
        return Math.floor( Math.random() * (max - min + 1) + min );
    },


    /**
     * 生成N位随机数(纯数字组成)
     * @param {number} n 位数, 默认5
     * @returns {number} 返回n位随机数
     */
    getRandomNumber: function(n) {  
        var arr = new Array(n); //用于存放随机数
        var randomNumber = ''; //存放随机数
        for (i = 0; i < arr.length; i++)  
            arr[i] = parseInt(Math.random() * 10);  
        var flag = 0;  
        for (i = 0; i < arr.length - 1; i++) {   
            for (j = i + 1; j < arr.length; j++) {     
                if (arr[i] == arr[j]) {
                    flag = 1;
                    break;
                }   
            }   
            if (flag) break;  
        }  
        for (var i = 0; i < arr.length; i++) {   
            randomNumber += arr[i];  
        }  
        return randomNumber; 
    },
    

    /*
    * 生成N位随机数(字母+数字组成)
    * @param {number} min 最小位数(固定位数)
    * @param {number} max 最大位数(可选), 默认max=min
    * @param {boolean} isRandomed 是否任意长度(可选). true 是(默认), false 否. 值为false时,生成的字符长度为min指定的位数
    */
     getRandomWord: function(min, max, isRandomed) {
        max = typeof max == 'undefined' ? min : max;
        isRandomed = typeof isRandomed == 'undefined' ? true : (isRandomed === false ? false : true);
        var str = ''
        var range = min
        var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        // 随机产生
        if (isRandomed) {
            range = Math.round(Math.random() * (max - min)) + min
        }
        for (var i = 0; i < range; i++) { // eslint-disable-line
            var pos = Math.round(Math.random() * (arr.length - 1))
            str += arr[pos]
        }
        return str;
    },

    
    /**
     * 生成N位随机数(字母+数字组成)
     * @returns {string} 返回字符串
    */
    getRandomChar: function(){
        var str = Math.random().toString(36).substr(2);
        return str;
    },



    /**
     * 提取电话号码，包括固话或手机号
     * 注：只提取第一次出现的电话号码
     * @param {string} ps_str 字符串
     * @param {object} options 参数对象。
     * @returns {string || number || null || array} 返回值：options参数type="first"时返回空或第一次出现的电话号码; options参数type="all"时返回null或所有电话号码数成的数组
     * 原字符串eg.
        var ps_str = "李小龙，趣闻如今，<a class=\"icon icon-phone hover\" href=\"tel:\"></a><a class=\"icon icon-weixin small\" data-user_hm=\"237809\" data-user_xm=\"小龙\" data-user_tx=\"头像\" data-user_tel=\"1\" data-user_dw=\"单位\"></a>是国际武术大师，1806300490，是他的电话，记好了";
    */
    pickupTel: function(ps_str, options){
        var defaults = {
            type: "first" // 返回值类型. first 第一次出现的电话号码(默认), all 全部电话号码
        }
        var settings = $.extend({}, defaults, options || {});
        // 正则匹配固话和手机号码. eg. 23935863, 0595-23935863, 0595 23935863, 1806300490, 01806300490, 0861806300490, +861806300490
        var reg1 = /^(.*?)((((0|\+)?86(\s{1})?)?0?\d{2,3}([\-|\s]?))?[\d]{7,8})(.*)/gi; // 匹配第一次出现
        var reg2 = /(((0|\+)?86(\s{1})?)?0?\d{2,3}([\-|\s]?))?[\d]{7,8}/gi; // 匹配所有
        var str = '';
        if(reg1.test(ps_str)){
            str = ps_str.toString().replace(reg1, '$2').toString().replace(/([\-|\s]+)/g, '');
        }
        var arr = ps_str.match(reg2); // 匹配所有。值为null 或 数组           
        if(settings.type == 'first'){
            return str; // 返回值为空或第一次出现的电话号码
        }
        else if(settings.type == 'all'){
            return arr; // 返回值为null或所有电话号码数成的数组
        }
        else{
            return '';
        }
    },



    /**
     * 将一维数组中相邻元素组合成数组，并返回重组后的二维数组
     * 即：将一维数组相邻元素相减(相减的值为指定值)，相减的值相同的元素组合成数组
     * 常见的应用：将数组中数值连续相邻的元素组合在一起(也就是相邻元素相减的值为1)
     * 示例：
        eg1.相邻元素相差1
        [1,2,3,4, 9,13,16, 20,21,22, 30,40, 80,81,82] <=> [[1,2,3,4], [9], [13], [16], [20,21,22], [30], [40], [80,81,81]]
        eg2.相邻元素相差5
        [1,6,11, 9,18, 20,25,30, 30,40, 80,85,90] <=> [[1,6,11], [9], [18], [20,25,30], [30], [40], [80,85,90]]
     * @param {array} ps_arr 一维数组
     * @param {number} ps_value 指定相减的值(可选)，默认1
     * @returns {array} 返回二维数组，其中二维数组中的每个元素的类型为一维数组
     */
    combineNextElementToArray: function(ps_arr, ps_value){
        var subValue = typeof ps_value == 'undefined' ? 1 : ps_value;
        var tmpArr = []
        var k = 0;
        var loops = 0;
        for(var i = 0; i < ps_arr.length; i++){
            var value1 = ps_arr[i];
            tmpArr[k] = tmpArr[k] instanceof Array ? tmpArr[k] : new Array();
            var j = i + 1;
            if(ps_arr.length == 1){
                tmpArr[k].push(value1);
            }else{
                if(j < ps_arr.length){
                    var value2 = ps_arr[j];
                    if(loops == 0){
                        if(tmpArr[k].includes(value1) == false) tmpArr[k].push(value1);
                    }
                    if(value2 - value1 == subValue){
                        
                        tmpArr[k].push(value2);
                        loops++;
                    }else{
                        k++;
                        tmpArr[k] = tmpArr[k] instanceof Array ? tmpArr[k] : new Array();
                        
                        if(tmpArr[k].includes(value2) == false) tmpArr[k].push(value2);
                        loops = 0;
                    }
                }
            }
        }
        // 过滤空数组
        var resultArr = []
        for(var i = 0; i < tmpArr.length; i++){
            var row = tmpArr[i];
            if(row.length != 0) resultArr.push(row);
        }
        return resultArr;
    },


    /**
     * 原生js获取子节点元素集合(不含孙子节点) (兼容ie6+)
     * 注：已排除文本、空格，换行符
     * @param {HTML DOM} o 当前节点
     * @returns {NodeList || null} 返回子节点集合或null
     */
    getChildElement: function(o){
        if(o == null) return null;
        var children = o.childNodes;
        for (var i = 0; i < children.length; i++) {
            var s = children[i].nodeName,
                r = children[i].nodeValue;
            if (s == "#comment" || (s == "#text" && /\s/.test(r))) { // 排除注释节点或文本节点或空节点(空或换行)
                o.removeChild(children[i]);
            }
        }
        return o.childNodes;
    },
    

    /**
     * 原生js获取第一个子节点 (兼容ie6+)
     * 注：已排除文本、空格，换行符
     * @param {HTML DOM} o 当前节点
     * @returns {HTML DOM || null} 返回元素对象或null
     */
    getFirstChildElement: function(o){
        if(o == null) return null;
        return o.children[0];
    },


    /**
     * 原生js获取最后一个子节点 (兼容ie6+)
     * 注：已排除文本、空格，换行符
     * @param {HTML DOM} o 当前节点
     * @returns {HTML DOM || null} 返回元素对象或null
     */
    getLastChildElement: function(o){
        if(o == null) return null;
        return o.children[o.children.length - 1];
    },


    /**
     * 原生js获取下一个兄弟节点 (兼容ie6+)
     * 注：已排除文本、空格，换行符
     * @param {HTML DOM} o 当前元素对象节点
     * @returns {HTML DOM || null} 返回元素对象或null
     */
    getNextElement: function(o){
        if(o == null) return null;
        var e = o.nextSibling;
        if(e == null){ // 测试节点是否存在，否则返回null
            return null;
        }
        if(e.nodeType == 3){ // 如果元素为文本节点
            var two = this.getNextElement(e);
            if(two != null && two.nodeType == 1)
                return two;
        }else{
            if(e.nodeType == 1){ // 确认节点为元素节点才返回
                return e;
            }else{
                return null;
            }
        }
    },
    


    /**
     * 原生js获取上一个兄弟节点 (兼容ie6+)
     * 注：已排除文本、空格，换行符
     * @param {HTML DOM} o 当前节点
     * @returns {HTML DOM || null} 返回元素对象或null
     */
    getPrevElement: function(o){
        if(o == null) return null;
        var e = o.previousSibling;
        if(e == null){ // 测试节点是否存在，否则返回null
            return null;
        }
        if(e.nodeType == 3){ // 如果元素为文本节点
            var two = this.getPrevElement(e);
            if(two != null && two.nodeType == 1)
                return two;
        }else{
            if(e.nodeType == 1){ // 确认节点为元素节点才返回
                return e;
            }else{
                return null;
            }
        }
    },


    /**
     * 原生js获取所有兄弟节点
     * @param {HTML DOM} o 当前节点
     * @returns {Array} 返回兄弟节点组成的数组
     */
     getAllSiblingElement: function(o) {
        var a = [];
        var p = o.parentNode.children;
        for(var i = 0, len = p.length; i< len; i++) {
            if(p[i] !== o) a.push(p[i]);
        }
        return a;
    },

    /**
     * 原生js获取前面所有的兄弟节点 (兼容ie6+)
     * 注：已排除文本、空格，换行符
     * @param {HTML DOM} o 当前元素对象节点
     * @returns {Array} 返回数组，数组中的元素为dom对象
     */
    getAllPrevElement: function(o){
        var arr = [];
        var parent = o.parentNode;
        if(parent == null) return [];
        for(var i = 0; i < parent.children.length; i++){
            var child = parent.children[i];
            if(child == o){
                break;
            }else{
                arr.push(child)
            }
        }
        return arr;
    },


    /**
     * 原生js获取后面所有的兄弟节点 (兼容ie6+)
     * 注：已排除文本、空格，换行符
     * @param {HTML DOM} o 当前元素对象节点
     * @returns {Array} 返回数组，数组中的元素为dom对象
     */
    getAllNextElement: function(o){
        var arr = [];
        var parent = o.parentNode;
        if(parent == null) return [];
        var index = -1;
        for(var i = 0; i < parent.children.length; i++){
            var child = parent.children[i];
            if(child == o){
                index = i;
            }else{
                if(index != -1 && i > index) arr.push(child);
            }
        }
        return arr;
    },

   

    /**
     * 原生js获取元素style属性
     * [用途]：原生js获取元素margin外边距、内边距padding
     * [注意]：返回值中的各个属性值带单位px
     * 兼容性：兼容IE、火狐、谷歌
     * @param {HTML DOM} o DOM元素。
     * @returns {object} 返回元素的各种css属性组成的数组。
     * [示例]
        var div = document.getElementById("user");
        var style = getElementStyle(div);
        alert(style.marginTop);
     */
    getElementStyle: function(o){
        //  兼容IE和火狐谷歌等的写法
        if (window.getComputedStyle) {
            var style = getComputedStyle(o, null);
        } else {
            style = o.currentStyle; // 兼容IE
        }
        return style;
    },


    /**
     * 原生js获取元素到浏览器顶部的距离，即offsetTop
     * 注：不能直接使用obj.offsetTop，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
     * @param {HTML DOM} o DOM元素。
     * @returns {number} 返回距离值
     */
     getElementTop: function(o) {
        var actualTop = o.offsetTop;
        var current = o.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        // 当HTML节点有设置margin值时
        var docStyle = this.getElementStyle(document.documentElement), // HTML节点
            docMarTop = Math.ceil(docStyle.marginTop.toString().replace(/([\px]+)/g, ''));
        actualTop += docMarTop;
        return actualTop;
    },


     /**
     * 原生js获取元素到浏览器左侧的距离，即offsetLeft
     * 注：不能直接使用obj.offsetLeft，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
     * @param {HTML DOM} element DOM元素。
     * @returns {number} 返回距离值
     */
    getElementLeft: function(o) {
        var actualLeft = o.offsetLeft;
        var current = o.offsetParent;
        while (current !== null) {
          actualLeft += current.offsetLeft;
          current = current.offsetParent;
        }
        // 当HTML节点宽度不是100%时
        var winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var docStyle = this.getElementStyle(document.documentElement), // HTML节点
            docW = parseFloat(docStyle.width.toString().replace(/([\px]+)/g, ''));
        actualLeft += ( window.innerWidth == docW || document.documentElement.clientWidth == docW || document.body.clientWidth == docW ) ? 0 : Math.ceil( (winW - docW) / 2 );
        return actualLeft;
    },


    /**
     * 原生js append字符串
     * 即：向已存在的节点对象后面追加HTML字符串
     * @param {string} str 字符串
     * @param {HTML DOM} el 已存在的节点对象
     */
    appendHTML: function(str, el){
        HTMLElement.prototype.appendStr = function(str) {
            var divTemp = document.createElement("div"), nodes = null, 
                fragment = document.createDocumentFragment(); // 文档片段，一次性append，提高性能
            divTemp.innerHTML = str;
            nodes = divTemp.childNodes;
            for (var i=0, length=nodes.length; i<length; i+=1) {
            fragment.appendChild(nodes[i].cloneNode(true));
            }
            this.appendChild(fragment);
            // 据说下面这样子世界会更清净
            nodes = null;
            fragment = null;
        }
        el.appendStr(str);
    },


    /**
     * 原生js prepend字符串
     * 即：向已存在的节点对象前面追加HTML字符串
     * @param {string} str 字符串
     * @param {HTML DOM} el 已存在的节点对象
     */
    prependHTML: function(str, el) {
        var divTemp = document.createElement("div"), nodes = null
            , fragment = document.createDocumentFragment();
    
        divTemp.innerHTML = str;
        nodes = divTemp.childNodes;
        for (var i=0, length=nodes.length; i<length; i+=1) {
        fragment.appendChild(nodes[i].cloneNode(true));
        }
        // 插入到容器的前面 - 差异所在
        el.insertBefore(fragment, el.firstChild);
        // 内存回收？
        nodes = null;
        fragment = null;
    },


    /**
     * 原生js在已存在的节点向后面插入新节点(兼容ie9-)
     * @param {HTML DOM} newNode 新节点
     * @param {HTML DOM} existingNode 已存在的节点
     */
    insertAfter: function(newNode, existingNode) {
        var parent = existingNode.parentNode;
        // 最后一个子节点 lastElementChild兼容其他浏览器 lastChild  兼容ie678;
        var lastNode = parent.lastElementChild || parent.lastChild;
        // 兄弟节点同样也是有兼容性
        var siblingNode = existingNode.nextElementSibling || existingNode.nextSibling;
        if (lastNode == existingNode) // 先判断目标节点是不是父级的最后一个节点，如果是的话，直接给父级加子节点就好
        { 
            parent.appendChild(newNode);
        }
        else // 不是最好后一个节点  那么插入到目标元素的下一个兄弟节点之前（就相当于目标元素的insertafter）
        { 
            parent.insertBefore(newNode, siblingNode);
        }
    },


    /**
     * 原生js移除指定节点(兼容ie11-)
     * @param {HTML DOM} node 要移除的节点
     */
    removeNode: function(node){
        // node.remove();
        node.parentNode.removeChild(node);
    },



    /**
     * 获取浏览器滚动条宽度
     * [适用性] 适用于指定区域内容溢出时出现了滚动条，此时就可以用本方法获取滚动条宽度
     * [兼容性] 兼容IE5+
     * @returns {number} 返回滚动条宽度值。一般各大浏览器滚动条的值均在17-21之间
     */
    getScrollbarWidth: function(){
        var w = 0;
        if(/msie/.test(navigator.userAgent.toLocaleLowerCase())){
            var $textarea1 = $('<textarea cols="10" rows="2"></textarea>').css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
                $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>').css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
            w = $textarea1.width() - $textarea2.width() + 2;
            $textarea1.add($textarea2).remove();
        }else{
            var $div = $('<div>').css({
                width: 100,
                height: 100,
                overflow: 'auto',
                position: 'absolute',
                top: -1000,
                left: -1000
            }).prependTo('body').append('<div>').find('div').css({
                width: '100%',
                height: 200
            });
            w = 100 - $div.width();
            $div.parent().remove();
        }
        return w;
    },

    /**
    * element.scrollTo()回调函数
    * 即：为scrollTo函数添加滚动完成回调的办法
    * @param {object} options 参数
    */
    elementScrollTo: function(options){
        var defaults = {
            element: window, // 节点(可选),默认window
            top: 0, // 上距(可选),默认0
            left: 0, // 左距(可选),默认0
            behavior: "auto", // 滚动方式(可选)。值：instant, smooth, auto(默认)
            callback: null // 回调(可选),默认null
        }
        var settings = $.extend(true, {}, defaults, options || {});
        var element = settings.element,
            top = settings.top,
            left = settings.left,
            behavior = settings.behavior,
            callback = settings.callback;
        element.scrollTo({
            top: top,
            left: left,
            behavior: behavior
        });
        if(!callback) return;
        if(element === window ? element.scrollY === 0 : element.scrollTop === 0) return callback();
        var running = function (event) {
            var top = this === window ? this.scrollY : this.scrollTop;
            if(top === 0){
                this.removeEventListener("scroll", running);
                return callback();
            }
        }
        element.addEventListener("scroll", running, false)
    },



    /**
     * 数组排序
     * @param {Array} arr 原数组
     * @param {string} method 排序方式(可选)，默认asc。值： asc 升序， desc 降序
     * @returns {Array} 返回排序后的新数组
     */
    arraySort: function(arr, method){
        var sorting = typeof method == 'undefined' ? 'asc' : (method == 'desc' ? 'desc' : 'asc');
        var upArr = sortingAlgorithm.quickSort(arr, method);
        if(sorting == 'desc'){
            var downArr = [];
            for(var i = upArr.length - 1; i >=0; i--){
                downArr.push(upArr[i]);
            }
            return downArr;
        }else{
            return upArr;
        }
    }
    
}; // END UTILITIES对象







//=====================================================================================================================
//                                                  sortingAlgorithm 排序算法对象
//=====================================================================================================================
var sortingAlgorithm = {
    /**
     * “快速排序”算法：对数组进行升序排序
     * @param {Array} arr 原数组
     * @returns {Array} 返回排序后的新数组
     * [参考] https://www.ruanyifeng.com/blog/2011/04/quicksort_in_javascript.html
     * [方法]
        (1)在数据集之中，选择一个元素作为"基准"(pivot)。
        (2)所有小于"基准"的元素，都移到"基准"的左边，所有大于"基准"的元素都移到"基准"的右边。
        (3)对"基准"左边和右边的两个子集，不断重复第一步和第二步，直到所有子集只剩下一个元素为止。
    * [eg]
        数组[101, 98, 498, 230, 589, 16, 9, 320, 259] 排序后得到 
    */
    quickSort: function(arr) {
        if (arr.length <= 1) return arr;
        var left = [], right = [];
        var index = Math.floor(arr.length / 2); // 基准元素
        // 方法1 
        var pivot = arr.splice(index, 1)[0]; // splice取基准元素，同时删掉原数组中的基准元素(原数组发生变化,没了基准元素)
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] < pivot) left.push(arr[i]);
            else right.push(arr[i]);
        }
        // 方法2
        // var pivot = arr[index];
        // var excludes = [];
        // for(var i = 0; i < arr.length; i++){ // 删掉基准元素，将没了基准元素的元素放到一个新数组中
        //     if(arr[i] != pivot) excludes.push(arr[i]);
        // }
        // for(var i = 0; i < excludes.length; i++){ // 比较新数组中所有元素与基准元素的大小
        //     if(excludes[i] < pivot) left.push(excludes[i]);
        //     else right.push(excludes[i]);
        // }
        // 递归重复上述过程
        return this.quickSort(left).concat(pivot, this.quickSort(right));
    },



    /**
     * “冒泡排序”算法：对数组进行升序排序
     * @param {Array} arr 原数组
     * @returns {Array} 返回排序后的新数组
     */
    bubbleSort: function(arr) {
        var len = arr.length;
        var i;
        var j;
        // 方法1
        var stop;
        for (i = 0; i < len - 1; i++) {
            for (j = 0, stop = len - 1 - i; j < stop; j++) {
                if (arr[j] > arr[j + 1]) {
                    swap(arr, j, j + 1);
                }
            }
        }
        // 方法二
        // for(i = 0; i < len; i++){
        //     for(j = i + 1; j < len; j++){
        //         if(arr[i] > arr[j]){
        //             var temp = arr[j];
        //             arr[j] = arr[i];
        //             arr[i] = temp;
        //         }
        //     }
        // }
        return arr;
    }


}; // END SORTING ALGORITHM 对象








//=====================================================================================================================
//                                                  calendar 日历对象, 用于操作与日期相关的动作
//=====================================================================================================================
var calendar = {
	/**
	 * 判断字符串是否为日期(时间)格式(此处不考虑只有年份的日期.如"2018")
	 * @param {string} str 字符串
	 * @returns {Boolean} 返回布尔值. true 是日期格式, false 不是日期格式
	 * eg. 2018-09, 2018-09-12, 2018-09-12 14:32:51 都是日期格式, 空, null, 2018(只有年份)不是日期格式
	 */
	isDateString:function(str){
		return isNaN(str) && !isNaN(Date.parse(str)) ? true : false;
	},

	/**
	 * 两个日期相减得到天数
	 * 思路: 格式化时间也是用时间戳
	 * @param {DATE} date1 开始日期
	 * @param {DATE} date2 结束日期
	 * eg1. var a1="12-19-2018"; var a2="2019/1/7"; var b = getNumberOfDays(a1,a2)
	 */
	getNumberOfDays:function(date1, date2){//获得天数
		if(!this.isDateString(date1) || !this.isDateString(date2)) return 0;
		var a1 = Date.parse(new Date(date1.replace(/-/g, '/')));
		var a2 = Date.parse(new Date(date2.replace(/-/g, '/')));
		var day = parseInt((a2-a1)/ (1000 * 60 * 60 * 24));//核心：时间戳相减，然后除以天数
		return day;
	},


    /**
	 * 获取当天日期. eg.2017-09-05 14:32:21
	 * @param {boolean} isZeroize 小于10的时间是否被零, 默认true(可选).
	 */
    getToday:function(isZeroize){
		var mydate = new Date();
		var Y = mydate.getFullYear(),
			M = mydate.getMonth() + 1,
			D = mydate.getDate(),
			h = mydate.getHours(),
			m = mydate.getMinutes(),
			s = mydate.getSeconds();
		var bools= isZeroize === undefined ? true : (isZeroize === false ? false : true);
		if(bools){//小于10的月分及天数前面是否补0(默认补0，如果函数传递参数false则不补0)
			if(M < 10) M = '0' + M;
			if(D < 10) D = '0' + D;
			if(h < 10) h = '0' + h;
			if(m < 10) m = '0' + m;
			if(s < 10) s = '0' + s;
		}
		return (Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s);
    },

	/**
	 * 格式化日期 / 标准化日期时间
	 * 说明: 该方法有效防止后台传数据格式发生变化. eg.10-19-2017 <==> 2017/10/19
	 * 思路：后台的时间日期 => 时间戳 =>标准的时间日期 y=年，m=月，d=天，h=时，u=分，s=秒
	 * @param {string} dateTime 日期字符串。必须是以下格式的日期：“月-日-年”、“年/月/日”、“年-月-日”。eg. 10-19-2017、2017/10/19、2017-10-19. eg. 10-19-2017 14:52:31、2017/10/19 14:52:31、2017-10-19 14:52:31
	 * @param {string} formatStr 自定义日期格式(可选).默认返回"年-月-日 时:分:秒"的格式. eg1. "yyyy-MM-dd HH:mm:ss" 返回"年-月-日 时:分:秒"eg2. "yyyy-MM-dd" 返回"年-月-日"
	 * @returns {string} 返回自定义格式的日期字符串(标准化日期字符串) 或 日期JSON对象(里面包含年、月、日、时、分、秒字段)
	 * eg. var a="2017/12/31 23:12:54"; console.log(dateFormat(a));
	 */
	dateFormat:function(dateTime, formatStr){
		var dateTime = ( /iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase()) || (window.ActiveXObject || "ActiveXObject" in window) ) ? dateTime.toString().replace(/-/g, '/') :  dateTime; // 短横线-换成斜杠/以兼容ios和ie
		var formatStr = typeof formatStr == 'undefined' ? 'yyyy-MM-dd HH:mm:ss' : formatStr;
		var dateParse = Date.parse(new Date(dateTime));//转成时间戳
		var time = new Date(dateParse);//再转成标准时间
        if(time == 'Invalid Date'){
            alert('您传递的日期字符串无效，请检查是否为“月-日-年”、“年/月/日”、“年-月-日”格式\n如果是，则检查月份是否超出12月、天数是否超出31天！');
            return '';
        }
		var y = String(time.getFullYear());
		var m = String(time.getMonth()+1);
		var d = String(time.getDate());
		var h = String(time.getHours());
		var u = String(time.getMinutes());
		var s = String(time.getSeconds());
        if(m < 10) m = '0' + m;
        if(d < 10) d = '0' + d;
        if(h < 10) h = '0' + h;
        if(u < 10) u = '0' + u;
        if(s < 10) s = '0' + s;
		if(formatStr == 'yyyy-MM-dd HH:mm:ss') return y + '-' + m + '-' + d + ' ' + h + ':' + u + ':' + s;
		else if(formatStr == 'yyyy-MM-dd HH:mm') return y + '-' + m + '-' + d + ' ' + h + ':' + u;
        else if(formatStr == 'MM-dd HH:mm:ss') return m + '-' + d + ' ' + h + ':' + u + ':' + s;
        else if(formatStr == 'MM-dd HH:mm') return m + '-' + d + ' ' + h + ':' + u;
		else if(formatStr == 'yyyy-MM-dd') return y + '-' + m + '-' + d;
		else if(formatStr == 'dd/MM/yyyy') return d + '/' + m + '/' + y;
		else if(formatStr == 'MM/dd/yyyy') return m + '/' + d + '/' + y;
		else if(formatStr == 'yyyy/MM/dd') return y + '/' + m + '/' + d;
		else if(formatStr == 'MM-dd') return m + '-' + d;
		else if(formatStr == 'dd/MM') return d + '/' + m;
		else if(formatStr == 'HH:mm:ss') return h + ':' + u + ':' + s;
		else if(formatStr == 'HH:mm') return h + ':' + u;
        else if(formatStr == '年-月-日') return y + '年' + m + '月' + d + '日'; // eg. 2021年8月12日
		else return {"year":y, "mon":m, "day":d, "hours":h, "minutes":u, "seconds":s}; //return m+"/"+d//直接输入自己想要的格式
	},



	/**
	 * 根据当天获取某一天、获取当天几天前或几天后的某一天的日期
	 * @param {Number} day 天数(可缺省), 默认当天
	 * @returns {string} 返回某一天的日期. eg. 2020-05-07
	 * eg. getDay(0) 当天,  getDay(7)) 7天后, getDay(-7) 7天前
	 */
	getDay:function(day){
		function doHandleDate(d){
		　　var m = d;
		　　if(d.toString().length == 1){
		　　　　m = "0" + d;
		　　}
		　　return m;
		}
		if(typeof day == 'undefined') day = 0;
		var today = new Date();
		var targetday_milliseconds=today.getTime() + 1000*60*60*24*day;
		today.setTime(targetday_milliseconds); // 注意，这行是关键代码
		var tYear = today.getFullYear();
		var tMonth = today.getMonth();
		var tDate = today.getDate();
		tMonth = doHandleDate(tMonth + 1);
		tDate = doHandleDate(tDate);
		return tYear + "-" + tMonth + "-" + tDate;
	},


    /**
     * 将某一天转化成星期几，即将日期转换为星期名称
     * @param {string} date 日期。格式：2020-06-28，中间用"-"分割
     * @returns {string} 返回星期几
     */
     datesToWeek: function(date) {
        var newDate = new Date(date.replace(/-/g, '/'));
        var weekday = new Array(7);
        weekday[0] = "星期日";
        weekday[1] = "星期一";
        weekday[2] = "星期二";
        weekday[3] = "星期三";
        weekday[4] = "星期四";
        weekday[5] = "星期五";
        weekday[6] = "星期六";
        return weekday[newDate.getDay()];
    },


    /**
     * 将数字转化成星期
     * 即：将数字型的星期转成中文型的星期(将对象日期转换成字符串)
     * @param {string | array} ps_num_arr_str 表示星期的数字或数字数组。eg1. 5或"5"表示星期五; eg2.["1", "2", "3"] 表示 ["星期一", "星期二", "星期三"]
     * @returns {string | array} 返回数字对应的星期.原参数若是字符串,则返回字符串型;若是数组则返回数组型
     */
    numericToWeek: function(ps_num_arr_str){
        if(typeof ps_num_arr_str == 'undefined') return [];
        var numData = ps_num_arr_str instanceof Array ? ps_num_arr_str : [ps_num_arr_str.toString()];
        var standWeekArr = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];	
        var tabWeekArr = [];
        var tabWeek = '';
        var resultWeekArr = [];
        for (var j = 0; j < numData.length; j++) {  // 遍历所有的数据，截取到相应的下标
            var resArr = numData[j].toString().split(",").sort();
            for(var i = 0; i < resArr.length; i++){
                var thatW = standWeekArr[resArr[i] - 1]; // 按照下标取值						
                tabWeekArr.push(thatW)
                if(i == resArr.length - 1){	
                    tabWeek = tabWeekArr.join(",");
                    tabWeekArr = []; // 遍历到最后的时候 将上一个的数据清空，不然不正确
                    resultWeekArr.push(tabWeek);
                }
            }
        }
        return (ps_num_arr_str instanceof Array ? resultWeekArr : resultWeekArr[0]);
    }

};  // ND CALENDAR对象




//=====================================================================================================================
//                                                  checker对象, 用于校验
//=====================================================================================================================
var checker = {
    /**
     * 判断是否为JQ对象
     * @param {object} ps_obj 目标对象
     * @returns {boolean} 返回布尔值. true 是, false 否
     */
    checkIsJqObject: function(ps_obj){
        return ps_obj instanceof jQuery ? true : false;
    },

    /**
     * 判断是否dom对象
     * 首先要对HTMLElement进行类型检查，因为即使在支持HTMLElement的浏览器中，类型却是有差别的，在Chrome,Opera中HTMLElement的类型为function，此时就不能用它来判断了
     * @param {object} ps_obj 目标对象
     * @returns {boolean} 返回布尔值. true 是, false 否
     */
    checkIsDomObject: function(ps_obj){
        return ( typeof HTMLElement === 'object' ) ?
            ps_obj instanceof HTMLElement
            :
            ps_obj && typeof ps_obj === 'object' && ps_obj.nodeType === 1 && typeof ps_obj.nodeName === 'string';
    },

    
    /**
     * 判断是否JSON对象
     * @param {object} ps_obj 目标对象
     * @returns 返回布尔值. true 是, false 否
     */
    checkIsJsonObject: function(ps_obj){
        return typeof(ps_obj) == "object" && Object.prototype.toString.call(ps_obj).toLowerCase() == "[object object]" && !ps_obj.length;
    },


    /**
     * 判断数据是否为JSON格式，且是否有数据
     * @param {object} ps_source 数据源
     * @returns {boolean} 返回布尔值. rue 有数据, false 无数据
     */
    checkJsonHasData: function(ps_source){
        var bools = false;
        if(typeof ps_source == 'object'){
            if(ps_source !== '' && !$.isEmptyObject(ps_source)){
                if(typeof ps_source.data != 'undefined'){
                    if(ps_source.data.length > 0) bools = true;
                }
            }
        }
        return bools;
    },


    /**
	 * 判断字符串是否为JSON对象
     * @param {string} str 字符串
	 * return {boolean} 返回值: true 是json,  false 是空、null、数组等非json
	 */
	checkIsJsonString: function(str){
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
	 * 判断是否手机号码(正则表达式验证)
	 * @param {string} str 电话字符串
     * @param {options} 验证类型等参数组成的对象(可选). eg. {pattern: "mobilephone"}.
     * @returns {boolean} 返回布尔值. true 是, false 否
	 */
	checkTel:function(str, options){
        var defaults = {
            mode: "standard", // 校验模式(可选)。值： standard 标准模式，即严格校验电话格式(默认), loose 宽松模式，即只校验电话位数
            pattern: "mobilephone", // 验证类型(只在mode="standard"时有效)(可选)。值：mobilephone 只验证是否移动电话(默认), telephone 只验证是否固话, both 移动电话或固话皆可以
            bit: { // 校验的电话位数(只在mode="loose"时有效)(可选)
                from: 6, // 校验6位(可选)。与to配合使用,可与to值相等
                to: 12 // 校验12位(可选)。与from配合使用,可与from值相等
            }
        }
        var settings = $.extend(true, {}, defaults, options || {});
        var mode = settings.mode,
            pattern = settings.pattern;
            bit = settings.bit;
        var from = parseInt(bit.from),
            to = parseInt(bit.to);

        var bools = false;
        if(mode == 'standard'){ //标准校验模式
            //var reg1 = /^0?1[3|4|5|7|8|9][0-9]\d{8}$/; //手机号码：13,14,15,17,18,19开头电话号码
            var reg1 = /^(0|86)?1\d{10}$/; //手机号码：11位数字. 最前面的 0是长途冠码, 86是中国区号
            var reg2 = /^((0|\+)?86(\s{1})?)?(0?\d{2,3}(\-|\s{1})?)?\d{7,8}$/; //固定电话：前面086或+86是中国区号, 中间10或010或0595是区号, 后面7-8位是号码	
            if(pattern == 'mobilephone'){ //只能移动电话
                bools = reg1.test($.trim(str)) ? true : false;
            }
            if(pattern == 'telephone'){ //只能固话(固定电话)
                bools = reg2.test(str) ? true : false;
            }
            if(pattern == 'both'){ //移动电话或固话
                bools = reg1.test($.trim(str)) || reg2.test(str) ? true : false;
            }
        }else{ //宽松校验模式
            //if(str.trim().length == 11) return true; //只检验是否11位
            //if(str.trim().length <= 12 && str.trim().length >= 6) return true; //只检验是否6-12位(含固话、手机号）,不兼容ie8(若节点不存在，直接str.trim()会报错）
            if($.trim(str).length <= to && $.trim(str).length >= from) return true; //只检验是否6-12位(含固话、手机号), 兼容ie8及以下版本
        }

		return bools;
    },
    
    /**
	 * 判断是否邮箱
	 * @param {string} email 邮箱字符
	 * @returns {boolean} true 格式正确, false 格式错误
	 */
	checkEmail:function(email){
		var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/;
		return emailReg.test(email);
	},


    /**
	 * 检测是否移动端，判断是否手机端设备
	 * @returns {boolean} 返回布尔值. true 是, false 否
	 */
	checkIsMobile:function(){
		var userAgentInfo = navigator.userAgent.toLowerCase();
		//console.log(userAgentInfo);
		var Agents = ["mobile","android","iphone","sysbian","windows phone","iPad","ipod","blackberry"];
		var flag = false;
		for(var i=0; i<Agents.length; i++){
			if(userAgentInfo.indexOf(Agents[i])>=0){
				flag = true;
				break;
			}
		}
		return flag;
	},
    
    
	/**
	 * 检测是否苹果公司的产品(iphone、ipad、mac、ipod)
	 * 即:检测是否苹果iphone手机(ios系统)
	 * @returns {boolean} 返回布尔值. true 是, false 否
	 */
	checkIsApple:function(){
		var boolean = false;
		if (/iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())){
			boolean = true;
		}
		return boolean;	
	},
	

    /**
	* 判断是否图片
	* @param {boolean} 返回值布尔值：true 是, false 否
	*/
	checkIsImage:function(str){
		var reg = /\.(png|gif|png|jpeg|webp)$/;
		return reg.test(str);
    },
    

    /**
     * 判断字符串是否为纯数字、判断是否数字类型
     * @param {string} ps_str 字符串
     * @returns {boolean} 返回布尔值. true 是纯数字, false 不是纯数字
     * eg. 11 是纯数字, 11., 11.5, 11.53不是纯数字
     */
    checkIsNumeric: function(ps_str){
        var reg = /^[0-9]+$/;
        return reg.test(ps_str.toString()) ? true : false;
    },


     /**
     * 判断字符串是否数值类型
     * @param {string} ps_str 字符串
     * @returns {boolean} 返回布尔值. true 是小数, false 不是小数
     * eg. 11.5, 11.53, -11.5, -11.53 是数值类型, 11., 11.53.5 不是数值类型
     */
    checkIsNumerType: function(ps_str){
        var reg = /^\-?[0-9]+\.?[0-9]+$/;
        return reg.test(ps_str.toString()) ? true : false;
    },
    

    /**
     * 判断字符串是否为小数
     * @param {string} ps_str 字符串
     * @returns {boolean} 返回布尔值. true 是小数, false 不是小数
     * eg. 11.5, 11.53是小数, 11, 11. 不是小数
     */
    checkIsDecimal: function(ps_str){
        var reg = /^\-?[0-9]+\.[0-9]+$/;
        return reg.test(ps_str.toString()) ? true : false;
    },


    /**
     * 判断字符串是否为整数（即正整数、负整数）
     * @param {string} ps_str 字符串
     * @returns {boolean} 返回布尔值. true 是整数, false 不是整数
     * eg. 11, -11 是整数, 11., -11., 11.5, -11.5不是整数
     */
    checkIsInteger: function(ps_str){
        var reg = /^\-?[0-9]+$/;
        return reg.test(ps_str.toString()) ? true : false;
    },


    /**
	 * 判断浏览器类型(ie,firefox,google chrome,safari,opera)
	 * @returns {string} 返回浏览器标识名
	 */
	checkBrowserType: function(){
		var userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串 
        var isOpera = userAgent.indexOf("Opera") > -1; // 判断是否Opera浏览器 
        // var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; // 判断是否IE浏览器 
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        // var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; // 判断是否IE的Edge浏览器 
        var isEdge = userAgent.indexOf("Edge") > -1; // 判断是否IE的Edge浏览器
        var isFF = userAgent.indexOf("Firefox") > -1; // 判断是否Firefox浏览器 
        var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; // 判断是否Safari浏览器 
        var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1&&!isEdge; // 判断Chrome浏览器 
        if (isIE)  
        { 
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);"); 
            reIE.test(userAgent); 
            var banben = parseFloat(RegExp["$1"]); 
            if(userAgent.indexOf('MSIE 6.0')!=-1){
                return "ie6";
            }else if(banben == 7){ 
                return "ie7"; // ie7或ie5
            }else if(banben == 8){ 
                return "ie8";
            }else if(banben == 9){ 
                return "ie9";
            }else if(banben == 10){ 
                return "ie10";
            } else if(userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)){ 
                return "ie11";
            }else{ 
                return "0"; // IE版本过低(ie5以下版本)
            } 
        }        
        if (isFF) { return "firefox"; } 
        if (isOpera) { return "opera"; } 
        if (isSafari) { return "safari"; } 
        if (isChrome) { return "chrome"; } 
        if (isEdge) { return "edge"; }
    },
    

    /**
	* 检测是否IE浏览器(ie5-ie11,edge)
	* @returns {Booleans} 返回布尔值. true 是ie, false 非ie
	*/
	checkIsIE:function(){
		// var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
		return ( window.ActiveXObject || "ActiveXObject" in window ) ? true : false; // 方法1
        // return !('reversed' in document.createElement('ol')); // 方法1
        // return window.VBArray ? true : false; // 方法2
    },
    

	/**
	 * 检测IE浏览器版本号
	 * @returns {number|string} 若是ie浏览器则返回对应版本号(整数), 否则返回一段文字
	 */
	checkIEVersion:function(){
		/*if(navigator.appName == "Microsoft Internet Explorer"){ //ie5-ie10
			var version = parseInt(navigator.appVersion.split(";")[1].toString().replace(/[ ]/g, "").replace("MSIE",""));
			return version;
		}else{
			if(navigator.userAgent.toLocaleLowerCase().search(/trident/i)) return 11; //检测ie11不能用这句，chrome也有trident
			else return '抱歉，不是IE浏览器，无法检测IE版本';
		}
		// if(navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].toString().replace(/[ ]/g, "").replace("MSIE",""))<9){
       	// 	alert("您的浏览器版本过低，请下载IE9及以上版本");
		// }
		*/
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        if (isIE)  
        { 
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);"); 
            reIE.test(userAgent); 
            var banben = parseFloat(RegExp["$1"]); 
            if(userAgent.indexOf('MSIE 6.0')!=-1){
                return 6;
            }else if(banben == 7){ 
                return 7; //ie7或ie5
            }else if(banben == 8){ 
                return 8;
            }else if(banben == 9){ 
                return 9;
            }else if(banben == 10){ 
                return 10;
            } else if(userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)){ 
                return 11;
            }else{ 
                return 0; //IE版本过低(ie5以下版本)
			}
		}else{
			return '抱歉，不是IE浏览器，无法检测IE版本';
		} 
	},


    /**
     * 检查网络是否连接正常
     * @returns {boolean} 返回布尔值. true 当前网络正常, false 网络未连接，请检查重试.
     */
    checkNetWorkOnline: function(){
        return !navigator.onLine ? false : true;
    },

    /**
     * 判断是否为时间格式“时:分”. eg. 08:00
     * @param {string} ps_str 字符串
     * @returns {boolean} 返回布尔值, true 或 false
     */
    checkIsHourMinute: function(ps_str){
        if(ps_str.toString().replace(/([ ]+)/g, '') === '') return false;
        var reg = /^([0-1]{1}[0-9]{1}|2[0-3]{1}):[0-5]{1}[0-9]{1}$/; // 小时最多只能到23时,不能是24,25,39时
        return reg.test(ps_str);
    },

    /**
     * 判断是否为时间格式“时:分:秒”. eg. 08:30:59
     * @param {string} ps_str 字符串
     * @returns {boolean} 返回布尔值, true 或 false
     */
     checkIsHourMinuteSecond: function(ps_str){
        if(ps_str.toString().replace(/([ ]+)/g, '') === '') return false;
        var reg = /^([0-1]{1}[0-9]{1}|2[0-3]{1}):[0-5]{1}[0-9]{1}:[0-5]{1}[0-9]{1}$/; // 小时最多只能到23时,不能是24,25,39时
        return reg.test(ps_str);
    }
   

}; // END CHECKER对象




//=====================================================================================================================
//                                                  filter对象, 用于过滤
//=====================================================================================================================
var filter = {

    /**
     * 过滤HTML代码
     * @param {string} str 原字符串
     * @param {boolean} isHTML 是否要过滤标签、css、js、换行、空格等多余内容, 默认true(可选). false时虽然不过滤但会将标签转义成字符
     * @returns {string} 返回新字符串
     */
    html: function(ps_str, isHTML){
        var flag = typeof isHTML == 'undefined' ? true : (isHTML === false ? false : true);
        if(flag){
            if(typeof ps_str == 'undefined' || ps_str == null) return '';
            var ps_str = ps_str.toString().replace(/\<style[\s\S]*>[\s\S]*<\/style>/g, ''); //过滤css
            ps_str = ps_str.replace(/\<script[\s\S]*>[\s\S]*<\/script>/g, ''); //过滤js
            ps_str = ps_str.replace(/<[^<>]+?>/g, ''); //过滤标签
            ps_str = ps_str.replace(/\ +/g, ''); //去掉空格
            ps_str = ps_str.replace(/(&nbsp;|&ensp;|&emsp;|&thinsp;)/ig, ''); //去掉 &nbsp; &ensp; &emsp; &thinsp;等转义的空格
            ps_str = ps_str.replace(/[\r\n]+?/g, ' '); //去掉换行(变成一个空格)
        }
        if(typeof utilities.htmlEncode == 'function') ps_str = utilities.htmlEncode(ps_str); //标签转化成字符串
        return ps_str;
    },



    /**
     * 过滤指定字符或代码
     * @param {string} ps_str 原字符串
     * @param {object}} ps_opts 过滤条件组成的对象
     * @returns {string} 返回新字符串
     */
    charCode: function(ps_str, ps_opts){
        if(typeof ps_str == 'undefined' || ps_str == null) return ps_str;
        var defaults = {
            javascript: true, //是否过滤js
            css: true, //是否过滤css
            space: true, //是否过滤空格
            html: true, //是否过滤html
            lineFeed: true, //是否过滤换行
            tab: true, //是否过滤制表符
            transferred: true //标签是否转义成字符. eg. < 转义成 &lt; > 转义成 &gt;
        }
        var settings = $.extend(true, {}, defaults, ps_opts || {});
        var result = str = ps_str.toString();
        if(settings.javascript) result = str.replace(/\<script[\s\S]*>[\s\S]*<\/script>/g, ''); //过滤js
        if(settings.css) result = result.replace(/\<style[\s\S]*>[\s\S]*<\/style>/g, ''); //过滤css
        if(settings.space){
            result = result.replace(/\ +/g, ''); //去掉空格
            result = result.replace(/(&nbsp;|&ensp;|&emsp;|&thinsp;)/ig, ''); //去掉 &nbsp; &ensp; &emsp; &thinsp;等转义的空格
        }
        if(settings.html) result = result.replace(/<[^<>]+?>/g, ''); //过滤标签
        if(settings.lineFeed) result = result.replace(/[\r\n]+?/g, ''); //去掉换行
        if(settings.tab) result = result.replace(/\t/g, ''); //去掉制表符
        if(settings.transferred){
            if(typeof utilities.htmlEncode == 'function') result = utilities.htmlEncode(result); //标签转化成字符串
        }
        return result;
    },




    /**
     * 过滤非数字字符，即只保留数字字符
     * @param {string} ps_str 原字符串
     * @returns {string} 返回不含数字的新字符串
     */
    notNumericChar: function(ps_str){
        return ps_str.toString().replace(/\D/g, '');
    },



    /**
     * 过滤字符串中相同的字符
     * 即字符串中相同的字符只保留第一个
     * @param {string} ps_str 原字符中
     * @param {string} ps_char 指定要过滤的字符(可选). 若缺省则默认替换所有相同的字符
     * @returns {string} 返回新字符串
     * eg.
        repeatedChar('0.56.578.59', '.'); //0.5657859
        repeatedChar('0.56.578.59'); //0.56789
     */
    repeatedChar: function(ps_str, ps_char){
        var char = typeof ps_char == 'undefined' ? '' : ps_char;
        var result = ps_str.replace(/./g, function(s, index){
            return ps_str.indexOf(s) == index ? s : ( char == '' ? '' : (char == s ? '' : s) );
        })
        return result;
    },


    
    /**
     * 过滤字符串中的空格
     * @param {string} ps_str 原字符串
     * @param {string} ps_method 过滤方式(可选). all 所胡空格全部过掉(默认), one 只保留一个空格
     * @returns {string} 返回不含空格或只含一个空格的新字符串
     */
    blankSpace: function(ps_str, ps_method){
        if(typeof ps_str == 'undefined' || ps_str == null) return ps_str;
        var isAll = typeof ps_method == 'undefined' ? true : (ps_method == 'one' ? false : true);
        if(isAll) return ps_str.toString().replace(/\ +/g, ''); //去掉所有空格
        else return ps_str.toString().replace(/([ ]+)/g, ' '); //只保留一个空格
    },


    /**
     * 若小数点后没有东西了则去掉最后一个小数点，即：如果字符串最后面直接以一个小数点结尾, 则去掉这个小数点
     * [用法] 一般用于 input blur事件中, 把最后一个小数点去掉, 防止数据不规范
     * @param {string} ps_str 原字符串
     * @returns {string} 返回新字符串. eg1. 200. <=> 200  eg2. 190. <=> 190
     */
    lastDotChar: function(ps_str){
        var reg = /^(.*?)\.$/;
        if(reg.test(ps_str)){ // 小数点后没有东西了(即最后面直接以一个小数点结尾)
            ps_str = ps_str.toString().replace(/([\.]+)/g, ''); // 去掉小数点;
        }
        return ps_str;
    }   
    
}; // END FILTER对象





//=====================================================================================================================
//                                                 restrict对象, 用于限制输入类型
//=====================================================================================================================
var restrict = {
	/**
	 * 只能输入：正整数
	 * eg. 10
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	onlyInterval: function(str){
		var value = str.toString().replace(/[^\d]/g,'');
		return value;
	},

	/**
	 * 只能输入：正负整数（即正整数、负整数）
	 * 适用于：手机号码、固定电话
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	negativeInterval: function(str){
		var value = str.toString().replace(/[^\d\-]/g,'');
        // value = value.replace(/\-{2,}/g, '-'); // 只保留第一个-，清除多余的
		value = filter.repeatedChar(value, '-'); // 只保留一个负号
		value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; // 把负号提到最前面
		return value;
	},


    /**
	 * 只能输入：正小数
	 * eg. 10.53
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	onlyFloat: function(str){
		var value = str.toString().replace(/[^\d\.]/g,'');
        value = value.replace(/^[\.]/g, ''); // 禁止第1个字符为.
		value = filter.repeatedChar(value, '.'); // 只保留一个小数点
		return value;
	},

	/**
	 * 只能输入：正负小数（即正整数、负整数、正小数、负小数）
	 * eg. 10.53, -10.53 
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	negativeFloat: function(str){
		var value = str.toString().replace(/[^\d\.\-]/g,'');
        value = value.replace(/^[\.]/g, ''); // 禁止第1个字符为.
        value = value.replace('-.', ''); // 禁止前两个字符为-.
        // value = value.replace(/\-{2,}/g, '-'); // 只保留第一个-，清除多余的
        // value = value.replace(/\.{2,}/g, '.'); // 只保留第一个.，清除多余的
		value = filter.repeatedChar(value, '.'); // 只保留一个小数点
		value = filter.repeatedChar(value, '-'); // 只保留一个负号
		value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; // 把负号提到最前面
		return value;
	},
    

    /**
     * 数值型输入框失去焦点时，过滤最前面的0、负号-及最后面一个小数点
     * [说明] 这里的数值型仅限于：正负整数、正负小数、电话号码
     * @param {string} ps_str 原值
     * @returns {string} 返回新值
     */
    numericalOnBlur: function(ps_str){
        var value = ps_str;
        if(/^(.*?)\.$/.test(value)){ // 小数点后没有东西了(即最后面直接一个小数点结尾)
            value = value.replace(/([\.]+)/g, ''); // 去掉小数点;
        }
        if(/^(.*?)\-$/.test(value)){ // 负号后没有东西了(即最后面直接一个负号结尾)
            value = value.replace(/([\-]+)/g, ''); // 去掉负号;
        }
        if(/^0([\d\.]+)$/.test(value)){ // 以0开头，则把最前面的0去掉，比如 030.5 <=> 30.5
            value = value.replace(/^0(.*?)/g, '$1');
        }
        return value;
    },


    /**
     * 只能输入：“时:分”。 eg. 08:30
     * @param {string} str 字符串
     * @returns {string} 返回“时:分”字符串
     */
    hourMinute: function(str){
        var value = str.toString().replace(/[^\d\:]/g,'');
		value = filter.repeatedChar(value, ':'); //只保留一个冒号
        var hour = '', minute = '';
        if(value.indexOf(':') >= 0){ // 当输入冒号后
            var arr = value.split(':');
            hour = arr[0], minute = arr[1];
            minute = minute.length >=2 ? minute.substr(0, 2) : minute; // 分钟最多两位
            if(hour.length == 1) hour = '0' + hour; // 小时必须两位. eg. 8:00 要转成 08:00
            if(parseInt(hour) > 23) hour = 23; // 小时不能大于23
            if(parseInt(minute) > 59) minute = 59; // 分钟不能大于59
            // console.log('Y\n小时：', hour, '\n分钟：',minute);
            // console.log('-----------');
            var newValue = hour + ':' + minute;
            return newValue;
        }else{ // 一直不输入冒号
            if(value.length >=4){ // 小时最多两位
                var tmpHour = value.substr(0, 2);
                var tmpMinute = value.replace(/([\:]+)/g, '').substr(2, 2);
                if(parseInt(tmpHour) > 23) tmpHour = 23; // 小时不能大于23
                if(parseInt(tmpMinute) > 59) tmpMinute = 59; // 分钟不能大于59
                var newValue = tmpHour + ':' + tmpMinute;
                // console.log('X\n小时：', tmpHour, '\n分钟：',tmpMinute);
                // console.log('-----------');
                return tmpMinute == '' ? value : newValue;
            }
        }
        return value;
    }

}; // END RESTRICT 对象




//=====================================================================================================================
//                                                format 对象, 用于格式化数据
//=====================================================================================================================

var format = {

    /**
     * 数字千分位(不处理小数部分)，即每三位数字一个用一个逗号,分隔开
     * @param {string | number} ps_str 原始数字
     * @returns {string} 返回经过千分位处理后的新数字
     * [示例]
        eg1. 2500347 <=> 2,500,347
        eg2. 2500347.90185 <=> 2,500,347.90185
     */
    thousandth: function(ps_str){
        var arr = ps_str.toString().split('.');
        return arr[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (arr.length <= 1 ? '':  '.' + arr[1]);
    }

}; // END FORMAT 对象


//=====================================================================================================================
//                                                convert对象, 用于转换数据类型等
//=====================================================================================================================

var convert = {

    /**
     * 将任何未知的对象转化为dom对象
     * @param {selector || Query Object || HTML DOM} o 未知的对象。几种可能的值如下：
        选择器 '.user', '#user' 
        jq对象 '.user', '#user'
        dom对象 document.getElementById('#user') 或 document.getElementsByClassName('user')
    * @returns {HTML DOM} 返回dom对象(注意不是元素集合nodeList)
    */
    anyToDomObject: function(o){
        // var str = o.toString().replace(/([\#\.]+)/g, ''); // 去掉井号#和点号.
        if(o == null) return null;
        return o instanceof jQuery ? 
            o[0] : 
            ( o.nodeName ?  // 判断是否dom对象
                o : 
                (
                    o.item ? // nodeList对象
                    o[0] : 
                    (   document.getElementById(o.toString().replace(/([\#\.]+)/g, '')) != null ? 
                        document.getElementById(o.toString().replace(/([\#\.]+)/g, '')) : 
                        document.getElementsByClassName(o.toString().replace(/([\#\.]+)/g, ''))[0]
                    )
                ) 
            );
    },


	/**
	 * 小数转化成百分数
	 * eg. 0.5 <=> 50%
	 * @param {string} ps_decimalStr 小数字符串
	 * @param {string} ps_method 取值方式(可选), 默认round。值如下：
		round 四舍五入，eg1. Math.floor(12.3)=12, eg2. Math.floor(12.8)=13
		floor 向下取数（即舍去小数，仅取整数部分）. 
		ceil 向上取整(即舍去小数，即小数部分一律向整数部分进位，整数部分+1)
	 * @param {number} ps_digit 小数位数(可选), 默认-1, 仅当ps_method='round'时有效。(值为-1时, 表示无论取值方式是round、floor、ceil中的哪种，皆不处理原样返回, 比如：eg.0.5623 <=> 56.23%)
	 * @param {boolean} ps_isEmptyTips 空值时是否返回一个默认字符串(可选), 默认false
     * @returns {string} 返回百分数
	 * eg.
	 	Math.floor(0.05)=0, eg2.Math.floor(12.3)=12, eg3. Math.floor(12.8)=12
		Math.ceil(0.05)=1, eg2. Math.ceil(12.3)=13, eg3. Math.ceil(12.8)=13
	 */
	decimal2Percent:function(ps_decimalStr, ps_method, ps_digit, ps_isEmptyTips){
		var method = typeof ps_method == 'undefined' || ps_method == '' ? 'round' : ps_method;
		var digit = typeof ps_digit == 'undefined' || ps_digit == '' ? -1 : parseInt(ps_digit);
		var isEmptyTips = typeof ps_isEmptyTips == 'undefined' ? false : (ps_isEmptyTips == true ? true : false);
		var percent = '';
		var decimal = ps_decimalStr.toString().replace(/[\%]/g,'');
		decimal = filter.repeatedChar(decimal,'.'); //只保留第1个小数点，其余去掉
		if(decimal != ''){
			if(method == 'round') {
				//percent = ps_decimalStr * 100;
				percent = decimal * 1000000 / 10000; //解决小数乘法bug
				if(digit >= 0) percent = percent.toFixed(digit);
			}
			if(method == 'floor') percent = Math.floor(decimal);
			if(method == 'ceil') percent = Math.ceil(decimal);
		}else{
			if(ps_isEmptyTips) percent = "如30%，请输入0.3";
		}
		return percent === '' ? '' : percent + '%'; // 这里一定要3个等号，不然0也会被当成是空
	},


   /**
	* 百分数转成小数
	* eg. 50% <=> 0.5
	* @param {string} ps_percentStr 百分数字符串
    * @param {number} ps_digit 小数位数（默认-1，即不处理原样返回，eg. 0.5323 <=> 0.5323)
    * @returns {string} 返回小数
	*/
	percent2Decimal:function(ps_percentStr, ps_digit){
		var decimal = '';
		var percent = ps_percentStr;
		//if(percent.indexOf('%') >= 0){
			var digit = typeof ps_digit == 'undefined' || ps_digit == '' ? -1 : parseInt(ps_digit);
			//var decimal = percent.toString().replace(/[\%]/g, '') / 100;
			decimal = percent.toString().replace(/[\%]/g, '') * 1000000 / 100000000; //解决小数乘法bug
			if(parseInt(digit) > 0) decimal = decimal.toFixed(parseInt(digit));
		//}else{
			//decimal = percent;
		//}
		return decimal;
	},

	/**
	 * 将“元”转化成“万元”
	 * @param {string} ps_str “元”字符串
	 * @param {string} ps_method 取值方式(可缺省). round 四舍五入(默认), floor 向下取整, ceil 向下取整
	 * @param {number} ps_digit 小数位数(可缺省).(仅当ps_method='round'时有效), 默认-1，即不处理原样返回.eg.10546 <=> 10546）
	 * @param {boolean} ps_isEmptyTips 空值时是否返回一个默认字符串(可缺省).默认false
     * @returns {string} 返回万元的数值
	 */
	yuan2TenThousand:function(ps_str, ps_method, ps_digit, ps_isEmptyTips){
		var method = typeof ps_method == 'undefined' ? 'round' : ps_method;
		var digit = typeof ps_digit == 'undefined' ? -1 : parseInt(ps_digit);
		var isEmptyTips = typeof ps_isEmptyTips == 'undefined' ? false : ps_isEmptyTips == true ? true : false;
		var wanYuan = '';
		if($.trim(ps_str) != ''){
                var str = parseFloat(ps_str.toString().replace(/[^0-9\.]/ig, '')); // 去掉非数字的字符,只保留数字及小数点点号
				// wanYuan = str / 10000;
				wanYuan = str * 1000000 / 10000000000; //解决小数乘法bug
			if(method == 'round'){
				if(digit >= 0) wanYuan = wanYuan.toFixed(digit);
			}
			if(method == 'floor') wanYuan = Math.floor(wanYuan);
			if(method == 'ceil') wanYuan = Math.ceil(wanYuan);
		}else{
			if(ps_isEmptyTips) wanYuan = "";
        }
        if(isNaN(wanYuan)) wanYuan = '';
		return wanYuan;
	},

	/**
	 * 将“万元”转化成“元”
	 * @param {string} ps_str “万元”字符串
	 * @param {number} ps_digit 小数位数(可缺省). 大于0的数字表示几位小数，0 向下取整, -1(默认) 不处理原样返回(eg. 15000.37 <=> 15000.37)
	 */
	tenThousand2Yuan:function(ps_str, ps_digit){
		if($.trim(ps_str) == '') return '';
		var yuan = '';
		var digit = typeof ps_digit == 'undefined' ? -1 : parseInt(ps_digit);
        var str = parseFloat(ps_str.toString().replace(/[^0-9\.]/ig, '')); // 去掉非数字的字符,只保留数字及小数点点号
		// yuan = str * 10000;
		yuan = str * 10000000000 / 1000000; // 解决小数乘法bug
		if(parseInt(digit) > 0) yuan = yuan.toFixed(parseInt(digit));
        if(parseInt(digit) == 0) yuan = Math.floor(yuan);
        if(isNaN(yuan)) yuan = '';
		return yuan;
	},


	/**
	 * 将值为零的字符串转化成空值
	 * @param {string} ps_str 转化的字符串
	 * @returns {string} 返回值：若字符串为零，则返回空值；否则返回原字符串
	 * eg1.0, 0.00, 0.000, 0.0000, -0.0000 这些只包含负号、小数点、数字0，故返回值为空""
	   eg2.0.1, 0.5, 0.01, -0.01 这些字和零不相等，故返回值为原字符串
	 */
	zeroString2Empty:function(ps_str){
		if(typeof ps_str == 'undefined' || ps_str == null) return ps_str;
		var newstr = ps_str.toString().replace(/([ ]+)/g, ''); //去掉所有空格
		var flag = false;
		if (newstr != "")
		{
			for (var i = 0; i < newstr.length; i++)
			{
				var eachstr = newstr[i].toString();
				if (eachstr != "0" && eachstr != "." && eachstr != "-")
				{
					flag = true;
					break;
				}
			}
		}
		return flag ? ps_str : '';
	},

	/**
	 * 将空符串转化成数值0
	 * @param {string} ps_str 要转化的字符串
	 * @returns {string} 返回值：若字符串为空，则返回0；否则返回原字符串
	 */
	emptyString2Zero:function(ps_str){
		if(typeof ps_str == 'undefined' || ps_str == null) return ps_str; 
		var newstr = ps_str.toString().replace(/([ ]+)/g, '');
		return newstr == '' ? 0 : ps_str;
	},

    /**
     * 将不规范的JSON数据转化成规范的格式
     * @param {object} ps_source 数据源
     * @param {boolean} ps_opts 其它参数
     * @returns {object} 返回规范的对象
     * 注：如果数据源是一维JSON对象,一般的,一维JSON对象不需要用中括号[]来包含,故把中括号的内容单独抽出来,并去掉data属性即可转成规范的格式
     * eg1.  不规范的一维对象 {data:[{name:"张三", sex:"男"}]}  
            转成规范的一维对象  {return:"ok", name:"张三", sex:"男"}
       eg2. 不规范的数组对象 {data:[{name:"张三", sex:"男"}, {name:"张三", sex:"男"}]}
            转成规范的数组对象  {return:"ok", data:[{name:"张三", sex:"男"}, {name:"张三", sex:"男"}]}
     */
    nonstandardObjectToStandardData: function(ps_source, ps_opts){
        var defaults = {
            oneWiki: false // 是否强制转化成一维对象. true 是, false 否. true 时给的原始数据源必须是一维对象转化后才能返回标准格式的一维对象
        }
        var settings = $.extend(true, {}, defaults, ps_opts || {});
        var isOneWiki = settings.oneWiki ? true : false;
        var newSource = {}
        if(typeof ps_source.data != 'undefined'){
            if(isOneWiki || ps_source.data.length == 1){ // 一维对象
                var row = ps_source.data[0];
                newSource["return"] = 'ok';
                for(var v in row){
                    newSource[v] = row[v];
                }
            }else{ // 数组对象
                newSource["return"] = 'ok';
                newSource["data"] = ps_source.data;
            }
        }
        return $.isEmptyObject(newSource) ? ps_source : newSource;
    },

    
    /**
     * 将数字转换成中文(处理到万级别)(亿级别暂时处理不了)
     * eg. 12345 <=> 一万二千三百四十五。
     * @param {number|string} num 原始数字
     * @returns {string} 返回数字对应的中文
     */
     numToChines: function(num){
        var changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
        var unit = ["", "十", "百", "千", "万"];
        num = parseInt(num);
        var getWan = function(temp){
            var strArr = temp.toString().split("").reverse();
            var newNum = "";
            for (var i = 0; i < strArr.length; i++) {
                newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
            }
            return newNum;
        }
        var overWan = Math.floor(num / 10000);
        var noWan = num % 10000;
        if (noWan.toString().length < 4) noWan = "0" + noWan;
        return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);   
    },


    /**
     * 将某一天转化成星期几，即将日期转换为星期名称
     * @param {string} date 日期。格式：2020-06-28，中间用"-"分割
     * @returns {string} 返回星期几
     */
    dateToWeek: function(date) {
        var newDate = new Date(date.replace(/-/g, '/'));
        var weekday = new Array(7);
        weekday[0] = "星期日";
        weekday[1] = "星期一";
        weekday[2] = "星期二";
        weekday[3] = "星期三";
        weekday[4] = "星期四";
        weekday[5] = "星期五";
        weekday[6] = "星期六";
        return weekday[newDate.getDay()];
    },

    /**
     * 将数字转化成星期
     * 即：将数字型的星期转成中文型的星期(将对象日期转换成字符串)
     * @param {string | array} ps_num_arr_str 表示星期的数字或数字数组。eg1. 5或"5"表示星期五; eg2.["1", "2", "3"] 表示 ["星期一", "星期二", "星期三"]
     * @returns {string | array} 返回数字对应的星期.原参数若是字符串,则返回字符串型;若是数组则返回数组型
     */
    numToWeek: function(ps_num_arr_str){
        if(typeof ps_num_arr_str == 'undefined') return [];
        var numData = ps_num_arr_str instanceof Array ? ps_num_arr_str : [ps_num_arr_str.toString()];
        var standWeekArr = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];	
        var tabWeekArr = [];
        var tabWeek = '';
        var resultWeekArr = [];
        for (var j = 0; j < numData.length; j++) {  // 遍历所有的数据，截取到相应的下标
            var resArr = numData[j].toString().split(",").sort();
            for(var i = 0; i < resArr.length; i++){
                var thatW = standWeekArr[resArr[i] - 1]; // 按照下标取值						
                tabWeekArr.push(thatW)
                if(i == resArr.length - 1){	
                    tabWeek = tabWeekArr.join(",");
                    tabWeekArr = []; // 遍历到最后的时候 将上一个的数据清空，不然不正确
                    resultWeekArr.push(tabWeek);
                }
            }
        }
        return (ps_num_arr_str instanceof Array ? resultWeekArr : resultWeekArr[0]);
    },


    /**
     * 将科学计数法转化成数字或字符串
     * @param {string} 科学计数法的字符串
     * @returns {number} 返回正常数字字符串
     * eg. 1.5E+0006 <=> 1500000
     * eg. 1.32e+006 <=> 1320000
     */
    scientific2String: function(a) {
        return a.replace(/^(\d+)(?:.(\d+))*e(\+)(\d+)/gi, function(_, a, a1, p, n){
            a1 = a1 || ''
            if (p === '-' && n > 0) {
                return '0.' + '0'.repeat(n - 1) + a + a1
            } else {
                return a + (a1.length > n ? a1.substr(0, n) + '.' + a1.substr(n) : a1 + '0'.repeat(n - a1.length))
            }
        })
    }

}; // END CONVERT 对象




//=====================================================================================================================
//                                                merge对象, 用于合并对象
//=====================================================================================================================

var merge = {
    /**
     * 原生JS合并对象1
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

    },



    /**
     * 原生JS合并对象2
     * 即用两个对象来拓展，返回拓展后的新对象
     * @param {boolean} deep 是否深度合并，默认false
     * @param {object} defs 第1个被合并的对象(可选)。
     * @param {object} opts 第2个被合并的对象(可选)。
     * @param {object} method 其它操作方式(可选). 
        可传值1：选择是否要遍历对象的原型链(默认true) { includePrototype: false } 。 
        可传值2：foreach 对每个合并项进行自定义处理. {
                forEach: function(target, name, sourceItem) {
                    target[name] = sourceItem + 'hello， 自定义每个合并项';
                    return target;
                }
            }
     * @returns {object} 返回合并后的目标对象
     */
    combine: function(deep, defs, opts, method){
        var options = {};
        if(typeof deep === 'boolean') options = { isDeep: deep === false ? false : true };
        else options =  { isDeep: false }
        if(typeof method === 'object') options = method;
        /**
         * 子函数：合并对象
         * @param {object} options 选项
         * @returns {object} 返回合并后的对象
         * [参考]：https://segmentfault.com/a/1190000011492291
         * [示例]
            // eg1.普通合并(浅合并)
            var target = EXT().merge(data1, data2);
            // eg2. isDeep 选择是否进行深合并。true 深度合并, false 浅合并，默认true
            var target = EXT({ isDeep: false }).merge(data1, data2);
            // eg3. includePrototype：选择是否要遍历对象的原型链，默认为 true
            var target = EXT({ includePrototype: false }).merge(data1, data2);
            // eg4. forEach：对每个合并项进行自定义处理
            var target = EXT({
                forEach: function(target, name, sourceItem) {
                    target[name] = sourceItem + 'hello， 自定义每个合并项';
                    return target;
                }
            }).merge(data1, data2);
        */
        function EXT(options) {
            return new EXT.prototype.init(options);
        };
        EXT.fn = EXT.prototype = {
            type: function(o) {
                return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
            },
            typeMap: {
                object: function() {
                    return {};
                },
                array: function() {
                    return [];
                }
            },
            // 默认配置项
            defaults: {
                // 是否深合并
                isDeep: true,
                // 是否遍历合并源对象原型链上的属性
                includePrototype: true,
                // 用于对每个合并项进行自定义修正
                forEach: function(target, name, sourceItem) {
                    target[name] = sourceItem;
                    return target;
                }
            },
            // 将配置项合并到默认配置项
            init: function(options) {
                for (var name in options) {
                    this.defaults[name] = options[name];
                }
                return this;
            },
            merge: function() {
                var self = this,
                    _default = self.defaults,
                    i = 1,
                    length = arguments.length,
                    target = arguments[0] || {},
                    source,
                    targetItem,
                    sourceItem,
                    tiType,
                    siType,
                    clone,
                    name;
                for (; i < length; i++) {
                    // 判断源对象是否为空
                    if ((source = arguments[i]) != null) {
                        for (name in source) {
                            var hasPro = source.hasOwnProperty(name);
                            // 是否遍历源对象的原型链
                            if (hasPro || _default.includePrototype) {
                                targetItem = target[name];
                                sourceItem = source[name];
                                tiType = self.type(targetItem);
                                siType = self.type(sourceItem);
                                // 防止出现回环
                                if (target === sourceItem) {
                                    continue;
                                }
                                // 如果复制的是对象或者数组
                                if (_default.isDeep && sourceItem != null && self.typeMap[siType]) {
                                    clone = targetItem != null && tiType === siType ? targetItem : self.typeMap[siType]();
                                    // 递归
                                    target[name] = self.merge(clone, sourceItem);
                                } else {
                                    clone = hasPro ? target : target.__proto__;
                                    // 处理每一个合并项
                                    clone = _default.forEach.call(self, clone, name, sourceItem);
                                }
                            }
                        }
                    }
                }
                return target;
            }
        };
        EXT.fn.init.prototype = EXT.fn;

        // 调用并返回结果
        return EXT(options).merge(defs, opts);
    }


}; // END MERGE 对象
