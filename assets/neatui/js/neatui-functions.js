/*********************************************************************************************************************
 *                                                  拓展prototype兼容ie
 ********************************************************************************************************************/
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




/*********************************************************************************************************************
 *                                                  IEHacker对象，让IE低版本浏览器兼容JS属性
 ********************************************************************************************************************/
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
	addEventListener:function(ele,event,fn){
		if(ele.addEventListener){
			ele.addEventListener(event,fn,false);
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
}




//=====================================================================================================================
//                                                  JQ小插件
//=====================================================================================================================
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
;(function ($){
    $.getUrlParam = function(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r != null) return decodeURI(r[2]);
        return null;
    }
})(jQuery);

/**
 * textarea自动增加高度(适用于多个输入框元素)
 * @param {object} selector 输入框的js或jq对象
 * @param {string} opt 自定义初始高度、最大高度等参数组成的一维对象(可选). eg. {initHeight: 28, maxHeight: 120}
 * eg. $.makeTextareaExpanding('.name');
 * eg. $.makeTextareaExpanding('#id1, #id2');
 */
;(function($){
    $.makeTextareaExpanding = function(selector, opt){
        var _this = selector instanceof jQuery ? selector : $(selector);
        return _this.each(function(){
            var _this = $(this);
            utilities.makeTextareaExpanding($(this), opt);
        })
    }
})(jQuery);




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
        if(window.VBArray && window.addEventListener) { //IE9
            el.attachEvent("onkeydown", function() {
            var key = window.event.keyCode;
                if(key == 8 || key == 46) delayedResize(el);
            
            });
            el.attachEvent("oncut", function(){
                delayedResize(el);
            })//处理粘贴
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
        output = output.replace(/\t/g, '&nbsp;'); // 制表符替换成一个空格
        output = output.replace(/([\s]+)/g, '&nbsp;'); // 多个空格替换成一个空格
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
    }

    
}; //END UTILITIES对象





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
		var a1 = Date.parse(new Date(date1));
		var a2 = Date.parse(new Date(date2));
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
	 * @param {string} dateTime 日期字符串
	 * @param {string} formatStr 日期格式(可缺省).默认返回"年-月-日 时:分:秒"的格式. eg1. "yyyy-MM-dd HH:mm:ss" 返回"年-月-日 时:分:秒"eg2. "yyyy-MM-dd" 返回"年-月-日"
	 * @returns {string} 返回标准化日期字符串
	 * eg. var a="2017/12/31 23:12:54"; console.log(dateFormat(a));
	 */
	dateFormat:function(dateTime, formatStr){
		var dateTime = /iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase()) ? dateTime.toString().replace(/-/g, '/') :  dateTime; // 短横线-换成斜杠/以兼容ios
		var formatStr = typeof formatStr == 'undefined' ? 'yyyy-MM-dd HH:mm:ss' : formatStr;
		var dateParse = Date.parse(new Date(dateTime));//转成时间戳
		var time = new Date(dateParse);//再转成标准时间
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
		else return {"year":y, "mon":m, "day":d, "hours":h, "minutes":u, "seconds":s}; //return m+"/"+d//直接输入自己想要的格式
	},

	/**
	 * 根据当天获取某一天
	 * @param {Number} day 天数(可缺省), 默认当天
	 * @returns {string} 返回某一天的日期. eg. 2020-05-07
	 * eg. getDay(0) 当天,  getDay(7)) 7天后, getDay(-7) 7天前
	 */
	getDay:function(day){
		function doHandleMonth(month){
		　　var m = month;
		　　if(month.toString().length == 1){
		　　　　m = "0" + month;
		　　}
		　　return m;
		}
		if(typeof day == 'undefined') day = 0;
		var today = new Date();
		var targetday_milliseconds=today.getTime() + 1000*60*60*24*day;
		today.setTime(targetday_milliseconds); //注意，这行是关键代码
		var tYear = today.getFullYear();
		var tMonth = today.getMonth();
		var tDate = today.getDate();
		tMonth = doHandleMonth(tMonth + 1);
		tDate = doHandleMonth(tDate);
		return tYear + "-" + tMonth + "-" + tDate;
	}

};  //END CALENDAR对象




//=====================================================================================================================
//                                                  checker对象, 用于校验
//=====================================================================================================================
var checker = {
    /**
     * 判断对象是否为JQ对象
     * @param {object} ps_obj js或jq对象
     * @returns {boolean} 返回布尔值. true 是, false 否
     */
    checkJqueryObject: function(ps_obj){
        return ps_obj instanceof jQuery ? true : false;
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
     * @param {options} 验证类型等参数组成的对象. eg. {pattern: "mobilephone"}.
     * @returns {boolean} 返回布尔值. true 是, false 否
	 */
	checkTel:function(str, options){
        var defaults = {
            mode: "standard", //校验模式. standard 标准模式,严格校验电话格式(默认), loose 宽松模式,只校验电话位数
            pattern: "mobilephone", //验证类型(只在mode="standard"时有效). mobilephone 只验证是否移动电话(默认), telephone 只验证是否固话, both 移动电话或固话皆可以
            bit: { //校验的电话位数(只在mode="loose"时有效)
                from: 6, //校验6位.与to配合使用,可与to值相等
                to: 12 //校验12位.与from配合使用,可与from值相等
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
     * 判断字符串是否为纯数字
     * @param {string} ps_str 字符串
     * @returns {boolean} 返回布尔值. true 是纯数字, false 不是纯数字
     * eg. 11 是纯数字, 11., 11.5, 11.53不是纯数字
     */
    checkIsNumeric: function(ps_str){
        var reg = /^[0-9]+$/;
        return reg.test(ps_str.toString()) ? true : false;reg.test
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
	checkBrowserType:function(){ //
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
        var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器 
        //var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器 
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        //var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否IE的Edge浏览器 
        var isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
        var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器 
        var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器 
        var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1&&!isEdge; //判断Chrome浏览器 
        if (isIE)  
        { 
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);"); 
            reIE.test(userAgent); 
            var banben = parseFloat(RegExp["$1"]); 
            if(userAgent.indexOf('MSIE 6.0')!=-1){
                return "ie6";
            }else if(banben == 7){ 
                return "ie7"; //ie7或ie5
            }else if(banben == 8){ 
                return "ie8";
            }else if(banben == 9){ 
                return "ie9";
            }else if(banben == 10){ 
                return "ie10";
            } else if(userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)){ 
                return "ie11";
            }else{ 
                return "0"; //IE版本过低(ie5以下版本)
            } 
        }        
        if (isFF) { return "firefox";} 
        if (isOpera) { return "opera";} 
        if (isSafari) { return "safari";} 
        if (isChrome) { return "chrome";} 
        if (isEdge) { return "edge";}
    },
    

    /**
	* 检测是否IE浏览器
	* @returns {Booleans} 返回布尔值. true 是ie, false 非ie
	*/
	checkIsIE:function(){
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
		var isIE = window.ActiveXObject || "ActiveXObject" in window;
		return isIE ? true : false;
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
    }	
   

}; //END CHECKER对象




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
            ps_str = ps_str.replace(/[\r\n]+?/g, ''); //去掉换行
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
    }

    
}; //END FILTER对象





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
	 * 只能输入：正小数
	 * eg. 10.53
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	onlyFloat: function(str){
		var value = str.toString().replace(/[^\d\.]/g,'');
		value = filter.repeatedChar(value, '.'); //只保留一个小数点
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
		value = filter.repeatedChar(value, '-'); //只保留一个负号
		value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; //把负号提到最前面
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
		value = filter.repeatedChar(value, '.'); //只保留一个小数点
		value = filter.repeatedChar(value, '-'); //只保留一个负号
		value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; //把负号提到最前面
		return value;
	}

} //END RESTRICT 对象







//=====================================================================================================================
//                                                convert对象, 用于转换数据类型等
//=====================================================================================================================

var convert = {
		
	/**
	 * 小数转化成百分数
	 * eg. 0.5 <=> 50%
	 * @param {string} ps_decimalStr 小数字符串
	 * @param {string} ps_method 取值方式:
		round 四舍五入，eg1. Math.floor(12.3)=12, eg2. Math.floor(12.8)=13
		loor 向下取数（即舍去小数，仅取整数部分）. 
		ceil 向上取整(即舍去小数，即小数部分一律向整数部分进位，整数部分+1)
	 * @param {number} ps_digit 小数位数,仅当ps_method='round'时有效（默认-1，即不处理原样返回.eg. 56.23% <=> 0.5623）
	 * @param {boolean} ps_isEmptyTips 空值时是否返回一个默认字符串，默认false
     * @returns {string} 返回百分数
     * 
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
		return percent == '' ? '' : percent + '%';
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
				//wanYuan = ps_str / 10000;
				wanYuan = ps_str * 1000000 / 10000000000; //解决小数乘法bug
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
		//yuan = ps_str * 10000;
		yuan = ps_str * 10000000000 / 1000000; //解决小数乘法bug
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
     * @returns {object} 返回规范的对象
     * 注：如果数据源是一维JSON对象,一般的,一维JSON对象不需要用中括号[]来包含,故把中括号的内容单独抽出来,并去掉data属性即可转成规范的格式
     * eg1.  不规范的一维对象 {data:[{name:"张三", sex:"男"}]}  
            转成规范的一维对象  {return:"ok", name:"张三", sex:"男"}
       eg2. 不规范的数组对象 {data:[{name:"张三", sex:"男"}, {name:"张三", sex:"男"}]}
            转成规范的数组对象  {return:"ok", data:[{name:"张三", sex:"男"}, {name:"张三", sex:"男"}]}
     */
    nonstandardObjectToStandardData(ps_source){
        var newSource = {}
        if(typeof ps_source.data != 'undefined'){
            if(ps_source.data.length == 1){ 
                var row = ps_source.data[0];
                newSource["return"] = 'ok';
                for(var v in row){
                    newSource[v] = row[v];
                }
            }else{
                newSource["return"] = 'ok';
                newSource["data"] = ps_source.data;
            }
        }
        return $.isEmptyObject(newSource) ? ps_source : newSource;
    }

} //END CONVERT 对象
