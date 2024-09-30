
/**
 * [jquery ajax自定义封装]
 * Author: mufeng
 * Date: 2021.01.04
 * Update: 2021.06.10
 */
//========================================================================================================================
//                                                          一、jQuery控件
//========================================================================================================================
;(function($){

    /*------------------------------------------------------------------------------------------------
    *                                       1.通用方法库
    ------------------------------------------------------------------------------------------------*/
    //自定义“返回的字符串错误或执行失败时”的几种提示信息.
    var infos = {
        "friend": "连接超时，请检查您的网络是否正常，可尝试切换网络", //友好提示
        "offLine": "当前网络信号弱，可尝试切换网络", // 无网络或网络信号弱
        "nonstandard": "返回的字符串不是标准的格式", //返回的字符串不是标准的格式. 标准格式必须带return或result。标准格式eg. {return:"ok", data:"ok"}, {result:"ok" data:"ok"}
        "empty": "返回的字符串为空或空对象", //返回的字符串为空或空对象{}. eg. ''或 {}
        "notObject": "返回的字符串不是JSON格式(可能含有回车、换行等特殊字符)", //返回的字符串不是标准JSON. eg. {return:"ok", "保存成功\r\n请继续"} 。 \r\n 表示换行符
        "notData": "返回的字符串不含data属性", //返回的字符串不含data属性. eg. {return:"ok", length:[{name:"张三"}]}
        "zeroData": "返回的字符串data数组为空", //返回的字符串是空数组. eg. {return:"ok", data:[]}
        "fails": "", //接口有通(即进入success), 但执行失败,返回的字符串即为失败的原因. eg. {return:"error", data:"保存失败,因为张三已存在"}
        "errors": "Error，接口出错", //接口不通(即进入error)
    }
    if(window.navigator.onLine != true){ // 网络不可用时
        infos.friend = infos.offLine;
    }

    //自定义“特殊情况下虽执行成功, 但返回的字符串格式为执行失败时的格式”时的几种提示信息.
    var overtimeArr = ['登录超时', '次数超过']; //eg. {return:"error", "登录超时"}. 接口实际上执行成功了,只是因为登录超时,此时就会把登录超时的信息提示给用户


    /*------------------------------------------------------------------------------------------------
    *                                       1.通用方法库
    ------------------------------------------------------------------------------------------------*/
    var methods = {
        ajax:function(options){
            if(!window.jQuery){
                utilities.dialogs('未发现jQuery文件，请引入！');
                return;
            }
            var defaults = {
                heading: "", //接口描述(中文)
                debug: false, //是否启用调试模式,默认false. 调试模式下会把具体错误信息提示给用户看,非调试模式下只会给用户友好提示信息
                async: false,
                type: "GET",
                dataType: "html",
                cache: false,
                timeout: 10000, //请求超时时间(单位:毫秒计), 默认10秒
                url: "",
                data: { },
                success: function(res){ },
                error: function(res){
                    var debug = typeof this.debug == 'undefined' ? false : (this.debug.toString().toLocaleLowerCase() == 'true' ? true : false);
                    var action = utilities.getStringParams('action', this.url);
                    utilities.toast(action, this.heading, res, "errors", debug ? false : true);
                },
                beforeSend: function(XMLHttpRequest){ },
                complete: function(XMLHttpRequest, textStatus){ }
            }
            var settings = $.extend(true, {}, defaults, options || {});
            $.ajax(settings);
       },


       /**
         * 判断接口返回的字符串是否为空，常用于增删改操作时
         * 即：当接口执行成功(进入success后),但返回的信息为空或空对象时则弹出提示信息. eg1. ''. eg2. {}
         * @param {string} ps_msg 字符串(JSON格式)
         * @param {string} ps_url 接口地址
         * @param {string} ps_describe 接口描述
         * @param {boolean} ps_debug 是否启用调试模式
         * @returns (boolean) 返回值： false 接口正常, true 接口有错误(eg.返回空字符串)
         */
        empty: function(ps_msg, ps_url, ps_describe, ps_debug){
            if(typeof ps_url == 'undefined') return false;
            if(typeof ps_describe == 'undefined') ps_describe = '';
            var ps_action = utilities.getStringParams('action', ps_url); 
            var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() === 'true' ? true : false);
            //·返回空字符串状态(即''或{})
            if(!ps_msg || $.isEmptyObject(ps_msg)){
                utilities.toast(ps_action, ps_describe, ps_msg, "empty", debug ? false : true);
                return true;
            }
            if(!utilities.isJsonString(ps_msg)){
                if(ps_msg !== ''){
                    utilities.toast(ps_action, ps_describe, ps_msg, "notObject", debug ? false : true);
                    return true;
                }
            }
            return false;
        },



        /**
         * 判断接口返回的字符串是否ok(即是否正确), 常用于获取数据时
         * 即：当接口执行成功(进入success后),但返回的信息return或result字段不等于ok时则弹出提示信息. 
         * eg1. var res = {return:"error", data:"失败了"} 或 var res = {result:"error", data:"失败了"}  
         * eg2. var res = {"return":"登录超时"}             或 var res = {result:"登录超时"}
         * @param {string} ps_msg 字符串(JSON格式)
         * @param {string} ps_url 接口地址
         * @param {string} ps_describe 接口描述
         * @param {boolean} ps_debug 是否启用调试模式. true 是(不显示友好信息), false 否(要显示友好信息)
         * @returns (boolean) 返回值： false 接口正常, true 接口有错误(eg.return不等于ok)
         */
        mistake: function(ps_msg, ps_url, ps_describe, ps_debug){
            if(typeof ps_url == 'undefined') return false;
            if(typeof ps_describe == 'undefined') ps_describe = '';
            var ps_action = utilities.getStringParams('action', ps_url); 
            var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() === 'true' ? true : false);
            if(!methods.empty(ps_msg, ps_url, ps_describe, debug)){ //ok状态：有返回数据
                //· 执行失败
                //当返回的信息里含有“登录超时”等字眼时，则直接弹出返回的信息，否则弹出自定义的错误信息
                var json = JSON.parse(ps_msg);

                if(typeof json["return"] != 'undefined'){
                    if(json["return"] != 'ok'){
                        var messages = typeof json["data"] == 'undefined' ? json["return"] : json["data"];
                        // utilities.toast(ps_action, ps_describe, messages, "fails", debug ? false : true);
                        var isFriendly = typeof json["data"] != 'undefined' ? false : (debug ? false : true);
                        utilities.toast(ps_action, ps_describe, messages, "fails", isFriendly);
                        return true;
                    }
                }
                else if(typeof json["result"] != 'undefined'){
                    if(json["result"] != 'ok'){
                        var messages = typeof json["data"] == 'undefined' ? json["result"] : json["data"];
                        utilities.toast(ps_action, ps_describe, messages, "fails", debug ? false : true);
                        return true;
                    }
                }
                else{
                    var messages = ps_msg;
                    utilities.toast(ps_action, ps_describe, messages, "nonstandard", debug ? false : true);
                    return true;
                }
                return false;
            }
        },


        /**
         * 判断接口返回的字符串中的数组元素长度是否为零，常用于获取数据时
         * 即：当接口执行成功(进入success后), 但返回的数组长度为零则弹出提示信息. eg. var res = {data:[]}
         * @param {string} ps_msg 字符串(JSON格式)
         * @param {string} ps_url 接口地址
         * @param {string} ps_describe 接口描述
         * @param {boolean} ps_debug 是否启用调试模式
         * @returns (boolean) 返回值： false 接口正常, true 接口有错误(eg.data数组为空)
         */
        zero: function(ps_msg, ps_url, ps_describe, ps_debug){
            if(typeof ps_url == 'undefined') return false;
            if(typeof ps_describe == 'undefined') ps_describe = '';
            var ps_action = utilities.getStringParams('action', ps_url); 
            var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() === 'true' ? true : false);
            if(!methods.empty(ps_msg, ps_url, ps_describe, debug)){ //ok状态：有返回数据
                var json = JSON.parse(ps_msg);
                if(typeof json.data == 'undefined'){
                    utilities.toast(ps_action, ps_describe, ps_msg, "notData", debug ? false : true);
                    return true;
                }
                if(json.data.length == 0){
                    utilities.toast(ps_action, ps_describe, ps_msg, "zeroData", debug ? false : true);
                    return true;
                }
            }
            return false;
        },

        /**
         * 判断接口是否进入ajax error状态
         * 当接口执行失败(即进入ajax error状态)时弹出提示信息
         * @param {string} ps_msg 字符串(JSON格式)
         * @param {string} ps_url 接口地址
         * @param {string} ps_describe 接口描述
         * @param {boolean} ps_debug 是否启用调试模式
         * @returns (boolean) 返回值： false 接口正常, true 接口异常(进入ERROR状态)
         */
        wrong: function(ps_msg, ps_url, ps_describe, ps_debug){
            if(typeof ps_url == 'undefined') return false;
            if(typeof ps_describe == 'undefined') ps_describe = '';
            var ps_action = utilities.getStringParams('action', ps_url); 
            var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() === 'true' ? true : false);
            utilities.toast(ps_action, ps_describe, ps_msg, "errors", debug ? false : true);
            return true;
        }
    }



    /*------------------------------------------------------------------------------------------------
    *                                       2.工具库
    ------------------------------------------------------------------------------------------------*/
    var utilities = {
        /**
         * ajax接口消息提示 / 消息冒泡
         * @param {string} ps_action 接口名称(英文)
         * @param {string} ps_describe 接口描述(中文)
         * @param {string} ps_msg 接口返回的字符串
         * @param {string} ps_type 错误类型. 值："empty" 空,  "notObject" 非标准JSON, "notData" 不含data属性, "zeroData" 空数组, "fails" 接口有通,但执行失败, "errors" 接口进入error状态
         * @param {boolean} ps_isFriendMsg 是否只显示友好提示信息.
         */
        toast:function(ps_action, ps_describe, ps_msg, ps_type, ps_isFriendMsg){
            var action = (ps_action != '' && ps_action != null && typeof ps_action != 'undefined') ? ps_action : '';
            var description = ps_describe === '' ? '' : '“' + ps_describe + '”';
            var msg = ps_msg;
            if(ps_isFriendMsg){
                this.dialogs(infos["friend"]);
            }else{  
                var tips = '';
                if(ps_type == "fails"){ // 接口有通(即进入success),但执行失败.
                    if(this.isStringInCludeArrayElement(ps_msg, overtimeArr)){ // 直接使用返回的字符串作为错误信息. eg. {return:"登录超时"}
                        tips += ps_msg;
                    }else{ // 自定义错误信息. eg. {return:"error", data:"保存失败"}
                        tips += (msg == '' ? '操作失败！' : msg);
                        // tips += (action == '' ? '' : '<br>请检查' + description + '接口：' + action);
                    }
                }else if(ps_type == "errors"){ //接口不通(即进入error)
                    tips += infos[ps_type]; //eg. "Error，接口出错"
                    tips += (action == '' ? '' : '<br>请检查' + description + '接口：' + action);
                }else{ // 接口有通(即进入success),但返回的字符串有错
                    tips += '返回出错！'
                    tips += infos[ps_type] == '' ? '' : '<br>错误类型：' + infos[ps_type];
                    tips += action == '' ? '' : '<br>接口名称：' + description + ' ' + action;
                    if(msg.toString().replace(/([ ]+)/g, '')  !== '' && !$.isEmptyObject(msg)){
                        tips += '<br>返回的字符串：' + msg;
                    }
                }
                this.dialogs(tips);
            }
        },


        /**
         * 弹出提示信息对话框
         * @param {string} ps_str 提示信息字符串
         */
        dialogs:function(ps_str){
            var message = ps_str;
            if(typeof neuiDialog != 'undefined'){
                neuiDialog.alert({
                    caption: '提示',
                    message: message,
                    buttons: ['确定']
                })
            }else{
                message = message.toString().replace(/\<br\>/g, '\n'); //<br>换行\n以实现换行
                alert(message);
            }
        },

        htmlEncode: function(ps_str){
            var temp = document.createElement("div");
            (temp.textContent != null) ? (temp.textContent = ps_str) : (temp.innerText = ps_str);
            var output = temp.innerHTML.toString().replace(/\"/g, '&quot;').replace(/\'/g, '&apos;'); //单双引号转义
            output = output.replace(/\r/g, '').replace(/\n/g, '').replace(/\t/g, ''); //回车、换行、制表符替换成空
            output = output.replace(/\\/g, '/'); //反斜杠替换成斜杠
            temp = null;
            return output;
        },
    
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
        getStringParams:function(ps_key, ps_url){
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
         * 判断字符串是否为JSON格式
         * @param {string} ps_str 字符串
         * return {boolean} 返回值：true 字符串是JSON格式, false 不是JSON格式
         */
        isJsonString:function(ps_str){
            if(typeof ps_str === 'string'){
                try{
                    var obj = JSON.parse(ps_str);
                    if(typeof obj == 'object' && obj) return true;
                    else return false;
                }catch(e){
                //console.log('error:' + str + '!!!' + e);
                return false;
                }
            }
            //console.log('it is not a string!');
            return false;
        },
    
    
        /**
        * 判断字符串中是否包含一维数组的某个元素
        * @param {string} ps_str 字符串
        * @param {array} ps_arr 一维数组
        * @returns {boolean} 返回值：true 是, false 否
        */
        isStringInCludeArrayElement:function(ps_str, ps_arr){
            var result = false;
            if(ps_str.toString().replace(/\ +/g, '') === '') return result;
            for(var i = 0; i < ps_arr.length; i++){
                if(ps_str.indexOf(ps_arr[i]) >= 0){
                    result = true;
                    break;
                }
            }
            return result;
        }
    }



    /*------------------------------------------------------------------------------------------------
    *                                       3.对外暴露插件接口
    ------------------------------------------------------------------------------------------------*/
   /*  $.fn.extend({
        a:function(){}
        b:function(){}
    }) */
    $.fn.neuiAjax = function(method){
        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }else if(typeof method === 'object' || !method){
            return methods.init.apply(this, arguments);
        }else{
            $.error('Method ' + method + ' does not exist in jQuery control');
        }
    }


 })(jQuery);




//========================================================================================================================
//                                                          二、定义函数供外部调用
//========================================================================================================================
var ajax = function(options){
    $('body').neuiAjax('ajax', options);
}

var toolTip = {
    /**
     * 判断接口返回的字符串是否为空，常用于增删改操作时
     * 即：当接口执行成功(进入success后),但返回的信息为空或空对象时则弹出提示信息. eg1. ''. eg2. {}
     * @param {string} ps_msg 字符串(JSON格式)
     * @param {string} ps_url 接口地址
     * @param {string} ps_describe 接口描述
     * @param {boolean} ps_debug 是否启用调试模式
     * @returns (boolean) 返回值： true 接口一切正常, false 接口有错误
     */
    emptyTips: function(ps_msg, ps_url, ps_describe, ps_debug){
        return $('body').neuiAjax('empty', ps_msg, ps_url, ps_describe, ps_debug);
    },


    /**
     * 判断接口返回的字符串是否ok(即是否正确)，常用于获取数据时
     * 即：当接口执行成功(进入success后),但返回的信息return或result字段不等于ok时则弹出提示信息. 
     * eg1. var res = {return:"error", data:"失败了"} 或 var res = {result:"error", data:"失败了"}  
     * eg2. var res = {"return":"登录超时"}             或 var res = {result:"登录超时"}
     * @param {string} ps_msg 字符串(JSON格式)
     * @param {string} ps_url 接口地址
     * @param {string} ps_describe 接口描述
     * @param {boolean} ps_debug 是否启用调试模式
     * @returns (boolean) 返回值： true 接口一切正常, false 接口有错误
     */
    mistakeTips: function(ps_msg, ps_url, ps_describe, ps_debug){
        return $('body').neuiAjax('mistake', ps_msg, ps_url, ps_describe, ps_debug);
    },


    /**
     * 判断接口返回的字符串中的数组元素长度是否为零，常用于获取数据时
     * 即：当接口执行成功(进入success后), 但返回的数组长度为零则弹出提示信息. eg. var res = {data:[]}
     * @param {string} ps_msg 字符串(JSON格式)
     * @param {string} ps_url 接口地址
     * @param {string} ps_describe 接口描述
     * @param {boolean} ps_debug 是否启用调试模式
     * @returns (boolean) 返回值： true 接口一切正常, false 接口有错误
     */
    zeroLengthTips:function(ps_msg, ps_url, ps_describe, ps_debug){
        return $('body').neuiAjax('zero', ps_msg, ps_url, ps_describe, ps_debug);
    },


    /**
     * 判断接口是否进入ajax error状态
     * 当接口执行失败(即进入ajax error状态)时弹出提示信息
     * @param {string} ps_msg 字符串(JSON格式)
     * @param {string} ps_url 接口地址
     * @param {string} ps_describe 接口描述
     * @param {boolean} ps_debug 是否启用调试模式
     * @returns (boolean) 返回值： true 接口一切正常, false 接口有错误
     */
    wrongTips: function(ps_msg, ps_url, ps_describe, ps_debug){
        return $('body').neuiAjax('wrong', ps_msg, ps_url, ps_describe, ps_debug);
    }
}


