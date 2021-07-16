/**
 * [ajax自定义封装]
 * Author: mufeng
 * Date: 2021.01.04
 * Update: 2021.01.04
 */

/**
 * ie8-兼容原生js bind函数
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
}

function ajax(options){
    if(!window.jQuery){
        neuiAjax.dialogs('未发现jQuery文件，请引入！');
        return;
    }
    var defaults = {
       heading: "", //接口描述(中文)
       debug: false, //是否启用调试模式,默认false. 调试模式下会把具体错误信息提示给用户看,非调试模式下只会给用户友好提示信息
       async: false,
       type: "GET",
       dataType: "html",
       cache: false,
       url: "",
       data: { },
       success: function(res){ },
       error: function(res){
           var debug = typeof this.debug == 'undefined' ? false : (this.debug.toString().toLocaleLowerCase() == 'true' ? true : false);
           if(debug){
               var tips = 'Error，接口出错误';
               var action = neuiAjax.getStringParams('action', this.url);
               if(action !== '' && action != null && typeof action != 'undefined') tips += '<br>' + action;
               if(this.heading !== '') tips += '<br>(' + this.heading + ')';
               neuiAjax.dialogs(tips);  //eg. Error，楼盘名称接口出错误
           }else{
               neuiAjax.dialogs('连接超时，请检查您的网络是否正常，可尝试切换网络'); //Error，出错了
           }
       },
       beforeSend: function(XMLHttpRequest){ },
       complete: function(XMLHttpRequest, textStatus){ }
    }
    var settings = $.extend(true, {}, defaults, options || {});
    $.ajax(settings);
}



var neuiAjax = {
   /**
    * 弹出提示信息对话框
    * @param {string} ps_str 提示信息字符串
    */
   dialogs:function(ps_str){
       if(typeof neuiDialog != 'undefined'){
           neuiDialog.alert({
               caption: '提示',
               message: ps_str,
               buttons: ['确定']
           })
       }else{
           ps_str = ps_str.toString().replace(/\<br\>/g, '\n');
           alert(tips);
       }
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




var toolTip = {
   /**
    * 当接口执行成功(进入success后),但返回的信息错误时(如“返回的字符串为空或error状态”)则弹出提示信息
    * @param {string} ps_msg 字符串(JSON格式)
    * @param {string} ps_url 接口地址
    * @param {string} ps_describe 接口描述
    * @param {boolean} ps_debug 是否启用调试模式
    * @returns (boolean) 返回值： true 接口一切正常, false 接口有错误
    */
   emptyTips: function(ps_msg, ps_url, ps_describe, ps_debug){
       if(typeof ps_url == 'undefined') return false;
       if(typeof ps_describe == 'undefined') ps_describe = '';
       var friendlyMsg = '读取失败，请重试！', //友好提示信息
       var tips = ps_describe.toString().replace(/([ ]+)/g, '') === '' ? '' : '[' + ps_describe + ']'; //eg.
       var ps_action = neuiAjax.getStringParams('action', ps_url); 
       var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() === 'true' ? true : false);
       //1.返回空字符串(即''或{})
       if(!ps_msg || $.isEmptyObject(ps_msg)){
           tips += '<br>错误！返回的字符串为空';
           tips += '<br>请检查接口：' + ps_action;
           var messages = debug ? tips : friendlyMsg;
           neuiAjax.dialogs(messages);
           return true;
       }
       if(!neuiAjax.isJsonString(ps_msg)){
           if(ps_msg !== ''){
               tips += '<br>错误！返回的字符串不是JSON格式(可能含有回车、换行等特殊字符)';
               tips += '<br>请检查接口：' + ps_action;
               tips += '<br>返回的字符串如下';
               tips += '<br>' + ps_msg;
               var messages = debug ? tips : friendlyMsg;
               neuiAjax.dialogs(messages);
               return true;
           }
       }
       //2.执行失败
       //接口执行失败可能返回两种格式: 
       //①return格式. eg. 成功：{return: "ok"}, 失败： {return:"error", data:"失败信息"} 或 {return:"登录超时"}
       //②result格式：eg. 成功：{result: "ok"}, 失败： {result:"error", data:"失败信息"} 或 {result:"登录超时"}
       //当返回的信息里return或result字段里含有“登录超时”等字眼时，则直接弹出返回的信息，否则弹出自定义的错误信息
       var json = JSON.parse(ps_msg);
       var formatArr = ['return', 'result'] //两种格式
       var warnArr = ['登录超时', '次数超过'];
       if(typeof json["return"] != 'undefined'){
           if(json["return"] != 'ok'){
               var messages = typeof json["data"] == 'undefined' ? '' : json["data"];
               prompErrorMsg(messages);
               return true;
           }
       }
       if(typeof json["result"] != 'undefined'){
           if(json["result"] != 'ok'){
               var messages = typeof json["data"] == 'undefined' ? '' : json["data"];
               prompErrorMsg(messages);
               return true;
           }
       }

       function prompErrorMsg(toast){
           if(neuiAjax.isStringInCludeArrayElement(toast, warnArr)){ //直接弹出返回的信息
               neuiAjax.dialogs(toast);
           }else{ //弹出自定义的错误信息
               tips += '<br>错误！请检查接口：' + ps_action;
               tips += '<br>返回的字符串如下';
               tips += '<br>' + ps_msg;
               var messages = debug ? tips : friendlyMsg;
               neuiAjax.dialogs(messages);
           }
       }
       return false;
   },


   /**
    * 当接口执行成功(进入success后), 但返回的数组长度为零(即{data:[]})则弹出提示信息
    * @param {string} ps_msg 字符串(JSON格式)
    * @param {string} ps_url 接口地址
    * @param {string} ps_describe 接口描述
    * @param {boolean} ps_debug 是否启用调试模式
    * @returns (boolean) 返回值： true 接口一切正常, false 接口有错误
    */
   zeroLengthTips: function(ps_msg, ps_url, ps_describe, ps_debug){
       if(typeof ps_url == 'undefined') return false;
       if(typeof ps_describe == 'undefined') ps_describe = '';
       var friendlyMsg = '连接超时，请检查您的网络是否正常，可尝试切换网络！', //友好提示信息
       var tips = ps_describe.toString().replace(/([ ]+)/g, '') === '' ? '' : '[' + ps_describe + ']'; //eg.
       var ps_action = neuiAjax.getStringParams('action', ps_url); 
       var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() === 'true' ? true : false);
       if(!this.emptyTips(ps_msg, ps_url, ps_debug, ps_debug)){ //ok状态：有返回数据
           var json = JSON.parse(ps_msg);
           if(typeof json.data == 'undefined'){
               tips += '<br>错误！返回的字符串不含data属性';
               tips += '<br>请检查接口：' + ps_action;
               var messages = debug ? tips : friendlyMsg;
               neuiAjax.dialogs(messages);
               return true;
           }
           if(json.data.length == 0){
               tips += '<br>错误！返回的字符串data数组为空，即data:[]';
               tips += '<br>请检查接口：' + ps_action;
               var messages = debug ? tips : friendlyMsg;
               neuiAjax.dialogs(messages);
               return true;
           }
       }
       return false;
   },

   /**
    * 当接口执行失败(即进入error状态)时弹出提示信息
    * @param {string} ps_msg 字符串(JSON格式)
    * @param {string} ps_url 接口地址
    * @param {string} ps_describe 接口描述
    * @param {boolean} ps_debug 是否启用调试模式
    * @returns (boolean) 返回值： true 接口一切正常, false 接口有错误
    */
   wrongTips: function(ps_msg, ps_url, ps_describe, ps_debug){
       if(typeof ps_url == 'undefined') return false;
       if(typeof ps_describe == 'undefined') ps_describe = '';
       var friendlyMsg = '连接超时，请检查您的网络是否正常，可尝试切换网络！', //友好提示信息
       //var tips = ps_describe.toString().replace(/([ ]+)/g, '') === '' ? '' : '[' + ps_describe + ']'; //eg.
       //var ps_action = neuiAjax.getStringParams('action', ps_url);
       var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() === 'true' ? true : false);
       if(debug){
           var tips = 'Error，接口出错'; 
           var action = neuiAjax.getStringParams('action', ps_url);
           if(action != '' && action != null && typeof action != 'undefined') tips += '<br>' + action;
           if(ps_describe !== '') tips += '<br>(' + ps_describe + ')';
           neuiAjax.dialogs(tips); //eg. Error, 楼盘名称接口出错
           return true;
       }else{
           neuiAjax.dialogs(friendlyMsg);
           return true;
       }
       return false;
   }

}

