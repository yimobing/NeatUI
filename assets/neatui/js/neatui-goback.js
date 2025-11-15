/**
 * * [GoBack]
 * * 返回上一页控件
 * * [功能] 纯原生JS开发，调用一下就可以返回上一页，也支持自定义返回一页的链接地址
 * * [适用] 适用于移动端，IOS环境下测试正常
 * * Version：1.0.0
 * * compatible：Mobile App
 * * Website: https://github.com/yimobing/neatui
 * * Author: mengZheng
 * * QQ: 1614644937
 * * Date: 2023.03.01
 * * Update: 2023.03.02
 */

//================================================================================================
//                                          一、创建控件
//================================================================================================
;(function(root, factory){
    if(typeof define === 'function' && define.amd){ // amd
        define(factory);
    } else if(typeof exports === 'object'){ // umd
        module.exports = factory();
    } else{
        window.neGoBack = factory();
    }
})(this, function(){

    var doc = document, win = window;
    var net = { };
    net.idClass = 'negoback'; // 控件根节点ID或Class属性
    net.panelClass = net.idClass + '__panel';
    net.arrowClass = net.idClass + '__arrow';
    net.textClass = net.idClass + '__text';


    //————————————————————————————————————————————————————————————————————————————————
    /**
     * 
     * @param {HTML DOM} elem 绑定的对象
     * @param {object} options 参数对象
     * @returns 
     */
    var neGoBack = function(elem, options){
        var opts = typeof elem == 'object' && typeof options == 'undefined' ? elem : (typeof options === 'function' ? options() : options);
        return new GoPick(elem, opts);
    };



    //————————————————————————————————————————————————————————————————————————————————
    /**
     * 
     * @param {HTML DOM} elem 绑定的对象
     * @param {object} options 参数对象
     */
    function GoPick(elem, options){
        var me = this;
        var defaults = {
            enable: true, // 是否启用(可选)，默认true
            position: "fixed", // 定位方式(可选)，默认fixed
            zIndex: 999, // 定位层级(可选)，默认999
            direction: "leftTop", // 定位方向(可选)。值：leftTop 左上角(默认), leftBottom 左下角, rightTop 右上角, rightBottom 右下角, top 顶部横条, bottom 底部横条。
            top: 0, // 定位上边距离(可选)，默认0px。将根据direction参数有选择性的生效。
            left: 0, // 定位左边距离(可选)，默认0px。将根据direction参数有选择性的生效。
            bottom: 0, // 定位下边距离(可选)，默认0px。将根据direction参数有选择性的生效。
            right: 0, // 定位右边距离(可选)，默认0px。将根据direction参数有选择性的生效。
            text: "返回", // 文字(可选)，默认返回
            showText: true, // 是否显示文字(可选)，默认true
            fontSize: 12,  // 文字大小(可选)，默认12px
            fontColor: "#999", // 文字颜色(可选)，默认#999。eg. #ff0000
            backgroundColor: "#ededed", // 背景色(可选)，默认#ededed
            padding: "10px 12px", // 自定义padding值(可选)，默认值'10px 12px'
            opacity: "1", // 背景透明度(可选)，默认1表示不透明。值 0到1。
            radius: "0 0 8px 0", // 四个角的圆角(可选)。
            // 内容(可选)
            body: {
                padTop: 0 // 设置body区域的距离顶部的距离(可选)，默认0
            },
            // ios设备时(可选)
            ios: {
                backgroundColor: "#fff", // 背景色(可选)，默认#fff
            },
            // 页面滚动时(可选)
            roll: {
                hide: false, // 是否启用自动隐藏功能(可选)，默认false。值为true时，往下滚指定高度的距离就自动隐藏，滚到顶部时又自动显示出来。
                height: 0 // 当autoHide=true时，指定页面往下滚多少距离就自动显示或隐藏控件(可选)，默认0表示一班下滚就自动隐藏。eg. 50 表示班下滚50px就自动隐藏，滚到顶部时就自动显示出来。
            },

            // 回调
            openBack: null, // 打开时(创建控件完成后)的回调函数。返回值格式：{element: "根节点对象", container: "容器节点对象", arrow:"箭头节点对象", text:"文本节点对象"},
            // 指定返回哪一页
            isGoTurn: true, // 是否默认执行点击时返回上一页(可选)，默认true。当不想执行返回上一页操作时，即可把本参数值设为false,然后在回调函数里自定义操作。
            turnBack: null, // 点击返回时的回调函数(可选)。仅在 isGoTurn=false 时有效。返回值格式 {element: "根节点对象", container: "容器节点对象", arrow:"箭头节点对象", text:"文本节点对象", device: "设备类型。 ios 苹果手机, android 安卓手机"}
            // 强制返回哪一页，即当上一页不存在时指定返回哪一页 add 20251115-1
            referEmptyBack: null, // 当上一页不存在(比如直接打开本页)时，点击返回时的回调函数(可选)。优先权大于 isGoTurn 和 turnBack。返回值格式 {element: "根节点对象", container: "容器节点对象", arrow:"箭头节点对象", text:"文本节点对象", device: "设备类型。 ios 苹果手机, android 安卓手机"}
        }
        me.$opts = net.extend(true, {}, defaults, options || {}); // 控件参数对象(深度合并)
        if(me.$opts.enable === false) return;
        // ·取参数值
        var dDirection = me.$opts.direction,
            dTop = me.$opts.top.toString().replace(/px/g, '') + 'px',
            dLeft = me.$opts.left.toString().replace(/px/g, '') + 'px',
            dBottom = me.$opts.bottom.toString().replace(/px/g, '') + 'px',
            dRight = me.$opts.right.toString().replace(/px/g, '') + 'px',
            dFontSize = me.$opts.fontSize.toString().replace(/px/g, '') + 'px',
            dFontColor = me.$opts.fontColor == '' ? '#999' : me.$opts.fontColor,
            dBackgroundColor = me.$opts.backgroundColor == '' ? '#ededed' : me.$opts.backgroundColor,
            dPadding = me.$opts.padding == '' ? '10px 12px' : me.$opts.padding,
            dRadius = me.$opts.radius == '' ? '0 0 8px 0' : me.$opts.radius,
            dOpacity = me.$opts.opacity == '' ? 1 : me.$opts.opacity;
        // IOS时
        if(tools.isAppIOS()){
            dBackgroundColor = me.$opts.ios.backgroundColor == '' ? '#fff' : me.$opts.ios.backgroundColor;
        }

        // ·创建节点
        if(document.getElementsByClassName(net.idClass).length != 0) return; // 已存在，不再创建
        var html = [
            '<div class="' + net.panelClass + '">',
                '<div class="' + net.arrowClass + '"><i></i></div>',
                (
                    me.$opts.showText === false ? '' : '<div class="' + net.textClass + '">' + me.$opts.text + '</div>'
                ),
            '</div>'
        ].join('\r\n');
        var nodeDiv = document.createElement('div');
        nodeDiv.className = net.idClass + ' ' + net.idClass + '__' + tools.generateRandomChar();
        nodeDiv.style.position = me.$opts.position;
        nodeDiv.style.zIndex = me.$opts.zIndex;
        if(dDirection == 'leftBottom'){
            nodeDiv.style.left = dLeft;
            nodeDiv.style.bottom = dBottom;
        }
        else if(dDirection == 'rightTop'){
            nodeDiv.style.right = dRight;
            nodeDiv.style.top = dTop;
        }
        else if(dDirection == 'rightBottom'){
            nodeDiv.style.right = dRight;
            nodeDiv.style.bottom = dBottom;
        }
        else if(dDirection == 'top'){
            nodeDiv.style.top = dTop;
            nodeDiv.style.left = dLeft;
            nodeDiv.style.right = dRight;
            nodeDiv.style.backgroundColor = dBackgroundColor;
            nodeDiv.style.opacity = dOpacity;
            nodeDiv.style.filter = "alpha(opacity=" +  dOpacity * 100 + ")";
            nodeDiv.style.borderBottomColor = '#ededed';
            nodeDiv.style.borderBottomStyle = 'solid';
            nodeDiv.style.borderBottomWidth = '1px';
        }
        else if(dDirection == 'bottom'){
            nodeDiv.style.bottom = dBottom;
            nodeDiv.style.left = dLeft;
            nodeDiv.style.right = dRight;
            nodeDiv.style.backgroundColor = dBackgroundColor;
            nodeDiv.style.opacity = dOpacity;
            nodeDiv.style.filter = "alpha(opacity=" +  dOpacity * 100 + ")";
            nodeDiv.style.borderTopColor = '#ededed';
            nodeDiv.style.borderTopStyle = 'solid';
            nodeDiv.style.borderTopWidth = '1px';
        }
        else{ // 'leftTop'
            nodeDiv.style.left = dLeft;
            nodeDiv.style.top = dTop;
        }
        nodeDiv.innerHTML = html;
        tools.insertAfter(nodeDiv, document.getElementsByTagName('body')[0]); // 拼接节点

        // ·取节点
        me.$nodeRoot = document.getElementsByClassName(net.idClass)[0]; // 根节点
        me.$nodePanel = document.getElementsByClassName(net.panelClass)[0]; // 容器节点
        me.$nodeArrow = document.getElementsByClassName(net.arrowClass)[0]; // 箭头节点
        me.$nodeArrowI = document.getElementsByClassName(net.arrowClass)[0].children[0]; // 箭头子节点
        me.$nodeText = document.getElementsByClassName(net.textClass)[0]; // 文本节点

        // ·各个节点属性设置
        // 容器
        tools.setAttributes(me.$nodePanel, {
            style: {
                "display": "inline-block",
                "padding": dPadding,
                "background-color": dBackgroundColor,
                "border-radius": dRadius,
                "opacity": dOpacity,
                "filter": "alpha(opacity=" +  dOpacity * 100 + ")",
                // "color": "#999",
                "font-size": "10px",
                "cursor": "pointer"
            }
        });
        // 箭头
        tools.setAttributes(me.$nodeArrow, {
            style: {
                "display": "inline-block",
                "vertical-align": "top"
            }
        });
        tools.setAttributes(me.$nodeArrowI, {
            style: {
                "display": "block",
                "width": "8px",
                "height": "8px",
                "margin-top": "5px",
                "border-style": "solid",
                "border-color": dFontColor,
                "border-width": "1px 0 0 1px",
                "-webkit-transform": "rotate(-45deg)",
                "-moz-transform": "rotate(-45deg)",
                "-o-transform": "rotate(-45deg)",
                "-ms-transform": "rotate(-45deg)",
                "transform": "rotate(-45deg)"
            }
        });
        // 文本
        if(typeof me.$nodeText != 'undefined'){
            tools.setAttributes(me.$nodeText, {
                style: {
                    "display": "inline-block",
                    "vertical-align": "top",
                    "font-size": dFontSize,
                    "color": dFontColor
                }
            });
        }
        // body
        if(me.$opts.body.padTop.toString().replace(/px/g, '') != 0){
            document.getElementsByTagName('body')[0].style.paddingTop = me.$opts.body.padTop.toString().replace(/px/g, '') + 'px';
        }

        // ·回调
        // 创建完成后
        if(me.$opts.openBack){
            me.$opts.openBack({
                element: me.$nodeRoot,
                container: me.$nodePanel,
                arrow: me.$nodeArrow,
                text: me.$nodeText
            });
        }
        // 点击返回时 edit 20251115-1
        me.$nodePanel.onclick = function(){
            var sysType = '';
            if (tools.isAppIOS()){
                sysType = 'ios';
            }
            else{
                sysType = 'android';
            }
            
            // 回调
            if(me.$opts.referEmptyBack && document.referrer == '') { // document.referrer 空表示用户直接打开本页面
                me.$opts.referEmptyBack({
                    element: me.$nodeRoot,
                    container: me.$nodePanel,
                    arrow: me.$nodeArrow,
                    text: me.$nodeText,
                    device: sysType
                });
            }
            else {
                if(me.$opts.isGoTurn) {
                    window.history.go(-1);
                }
                else if(me.$opts.turnBack){ // 回调。返回参数为设备类型。值为 ios 或 android  
                    me.$opts.turnBack({
                        element: me.$nodeRoot,
                        container: me.$nodePanel,
                        arrow: me.$nodeArrow,
                        text: me.$nodeText,
                        device: sysType
                    });
                }
            }
        }

        // ·自动隐藏功能
        if(me.$opts.roll.hide){
            var h = parseInt(me.$opts.roll.height.toString().replace(/px/g, ''));
            window.onscroll = function(){
                // var winH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // 视窗高
                var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0; // 视窗滚动距离
                // var scrollH = document.documentElement.scrollHeight || document.body.scrollHeight; // 整个文档高
                if(scrollTop > h) me.$nodeRoot.style.display = 'none';
                else me.$nodeRoot.style.display = 'block';
            }
        }

    }; // END GoPick



    //————————————————————————————————————————————————————————————————————————————————
    /**
     * 原生JS模拟JQ extend合并对象
     * 用一个或多个对象来扩展一个对象，返回被拓展的对象
     * @param {boolean} deep 是否深度合并对象(可选),默认false
     * @param {object} target 目标对象，其他对象的成员属性将被附加到该对象上。
     * @param {object} object1 第1个被合并的对象(可选)。
     * @param {object} objectN 第N个被合并的对象(可选)。
     *  [调用示例]
        格式：extend(deep, target, defs, opts);
        eg1. extend(defs, opts); // 浅合并
        eg2. extend({}, defs, opts); // 浅合并
        eg2. extend(true, defs, opts); // 深合并
        eg3. extend(true, {}, defs, opts); //深合并
     * [jq合并对象的方法]
        $.extend(deep, target, obj1, obj2, ..., objN);
     */
    neGoBack.extend = net.extend = function(){
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
    };






    //————————————————————————————————————————————————————————————————————————————————
    //                          · 工具库类
    //————————————————————————————————————————————————————————————————————————————————
    /**
     * 工具库类
     */
    var tools = {
        /**
         * 原生JS为某个节点设置多个属性
         * @param {HTML DOM} element DOM对象。可以是一个对象，也可是多个对象组成的数组.
         * @param {object} attributes 属性参数。
         * * [整体举例]
            var btn1 = document.createElement('button1');
            var btn2 = document.createElement('button2');
            setAttributes(btn1, {style: {display: 'block', width: '8px', height: '8px'}});
            setAttributes([btn1, btn2], {style: {display: 'block', width: '8px', height: '8px'}});
         * * [DOM对象]
            eg.var testBtn = document.createElement('button');
         * * [属性参数]
            eg1. 设置多个属性 {textContent: '测试按钮', id: 'testBtn', className: 'test'}
            eg2. 支持函数：{onclick: ()=>{ alert('Hello World!'); }}
            eg3. 支持多层方法1： {style: {cssText: 'width: 100%; height: 100%;'}}
            eg4. 支持多层方法2：{style: {display: 'block', width: '8px', height: '8px'}}
         */
        setAttributes: function(element, attributes){
            if(this.isArray(element)){
                for(var i = 0; i < element.length; i++){
                    var elem = element[i];
                    for(let key in attributes){
                        if(Object.prototype.toString.call(attributes[key]) === '[object Object]'){
                            this.setAttributes(elem[key], attributes[key]);
                        }else{
                            elem[key] = attributes[key]; 
                        }
                    }
                }
            }
            else{
                var elem = element;
                for(let key in attributes){
                    if(Object.prototype.toString.call(attributes[key]) === '[object Object]'){
                        this.setAttributes(elem[key], attributes[key]);
                    }else{
                        elem[key] = attributes[key]; 
                    }
                }
            }
        },



        /**
         * 判断是否数组
         * @param {string | array} ps_str 字符串或数组
         * @returns 返回布尔值. true 是数组, false 非数组
         */
        isArray: function(ps_str){
            return Object.prototype.toString.call(ps_str) === "[object Array]";
        },


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
         * 在已存在的节点向后面插入新节点 (兼容ie9-)
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
         * 移除指定节点 (兼容ie11-)
         * @param {HTML DOM} node 要移除的节点
         */
        removeNode: function(node){
            // node.remove();
            node.parentNode.removeChild(node);
        },


        /**
         * 给输入框赋值
         * @param {HTMl DOM} ps_dom DOM节点
         * @param {string} ps_val 要赋的值
         */
         giveValueToElement: function(ps_dom, ps_val){
            var tagname = ps_dom.tagName.toLocaleLowerCase();
            if(tagname == 'input' || tagname == 'textarea') ps_dom.value = ps_val;
            else ps_dom.innerText = ps_val;
        },

        /**
         * 获取输入框的值
         * @param {HTMl DOM} ps_dom DOM节点
         * @returns 返回DOM节点的值
         */
        getElementValue: function(ps_dom){
            var tagname = ps_dom.tagName.toLocaleLowerCase();
            if(tagname == 'input' || tagname == 'textarea') return ps_dom.value;
            else return ps_dom.innerText;
        },

        /**
         * 获取字符串对应的元素节点(供jq调用)
         * eg1. 'floor' <=> '.floor'
         * eg2. 'floor build' <=> '.floor.build'
         * @param {string} ps_str 字符串
         * @returns 返回元素节点字符串
         */
        getStringClassName: function(ps_str){
            if(ps_str.replace(/([ ]+)/g, '') === '') return '';
            var arr = ps_str.replace(/([ ]+)/g, ' ').split(' ');
            var str = '';
            for(var i = 0; i < arr.length; i++){
                str += '.' + arr[i];
            }
            return str;
        },


        /**
         * 获取元素节点对应的字符串(供dom调用)
         * eg1. '.floor' <=> 'floor'
         * eg2. '.floor.build' <=> 'floor build'
         * @param {string} ps_str 元素节点字符串
         * @returns 返回字符串
         */
        getClassNameString: function(ps_str){
            if(ps_str.replace(/([ ]+)/g, '') === '') return '';
            var tmpStr = ps_str.toString().replace(/([\.]+)/g, ' ');
            return ps_str.indexOf('.') == 0 ? (tmpStr.substr(1, tmpStr.length)) : tmpStr;
        },
        
        /**
         * 返回节点对应的DOM
         * eg. '#floor'  <=> document.getElementById('floor')
         * eg2. '.floor' <=> document.getElementsByClassName('floor');
         * @param {string} ps_str 节点字符串
         * @returns 返回HTML DOM
         */
        getIdClassNameStrDom: function(ps_str){
            return ps_str.indexOf('#') >= 0 ? 
                document.getElementById(ps_str.toString().replace(/([\#\.]+)/g, ''))
                :
                document.getElementsByClassName(this.getClassNameString(ps_str));
        },


         /**
         * 原生js获取元素style属性
         * [用途]：原生js获取元素margin外边距、内边距padding
         * [注意]：返回值中的各个属性值带单位px
         * 兼容性：兼容IE、火狐、谷歌
         * @param {HTML DOM} o DOM元素. 
         * @returns {object} 返回元素的各种css属性组成的数组。
         * [示例]
            var div = document.getElementById("user");
            var style = getStyle(div);
            alert(style.marginTop);
        */
        getStyle: function(o){
            //  兼容IE和火狐谷歌等的写法
            if (window.getComputedStyle) {
                var style = getComputedStyle(o, null);
            } else {
                style = o.currentStyle; // 兼容IE
            }
            return style;
        },


        /**
         * 获取元素到浏览器顶部的距离，即offsetTop
         * 注：不能直接使用obj.offsetTop，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
         * @param {HTML DOM} o dom元素
         * @returns {number} 返回距离值
         */
         getTop: function(o) {
            var actualTop = o.offsetTop;
            var current = o.offsetParent;
            while (current !== null) {
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }
            // 当HTML节点有设置margin值时
            var docStyle = this.getStyle(document.documentElement), // HTML节点
                docMarTop = Math.ceil(docStyle.marginTop.toString().replace(/([\px]+)/g, ''));
            actualTop += docMarTop;
            return actualTop;
        },    

         /**
         * 获取元素到浏览器左侧的距离，即offsetLeft
         * 注：不能直接使用obj.offsetLeft，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
         * @param {HTML DOM} element dom元素
         * @returns {number} 返回距离值
         */
        getLeft: function(o) {
            var actualLeft = o.offsetLeft;
            var current = o.offsetParent;
            while (current !== null) {
              actualLeft += current.offsetLeft;
              current = current.offsetParent;
            }
            // 当HTML节点宽度不是100%时
            var winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var docStyle = this.getStyle(document.documentElement), // HTML节点
                docW = parseFloat(docStyle.width.toString().replace(/([\px]+)/g, ''));
            actualLeft += ( window.innerWidth == docW || document.documentElement.clientWidth == docW || document.body.clientWidth == docW ) ? 0 : Math.ceil( (winW - docW) / 2 );
            return actualLeft;
        },

        /**
         * 生成N位随机数(字母+数字组成)
         * @returns {string} 返回字符串
        */
        generateRandomChar: function(){
            var str = Math.random().toString(36).substr(2);
            return str;
        },

        /**
         * 原生JS获取dataset的值(兼容ie11-)
         * 示例：要取某个data-*(比如data-bh)的值 <=> getDataset(DOM元素).bh
         * @param {HTML DOM} ele DOM元素
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
         * 检测是否移动端，判断是否手机端设备
         * @returns {boolean} 返回布尔值. true 是, false 否
         */
        isAppDevice:function(){
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
        isAppIOS: function(){
                var boolean = false;
                if (/iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())){
                    boolean = true;
                }
                return boolean;	
            },

         /**
         * 判断对象是否JSON对象
         * @param {object} ps_obj 目标对象
         * @returns 返回布尔值. true 是, false 否
         */
        isJsonObject: function(ps_obj){
            return typeof(ps_obj) == "object" && Object.prototype.toString.call(ps_obj).toLowerCase() == "[object object]" && !ps_obj.length;
        },


        /**
         * 判断是否dom对象
         * 首先要对HTMLElement进行类型检查，因为即使在支持HTMLElement的浏览器中，类型却是有差别的，在Chrome,Opera中HTMLElement的类型为function，此时就不能用它来判断了
         * @param {object} ps_obj 目标对象
         * @returns {boolean} 返回布尔值. true 是, false 否
         */
        isDomObject: function(ps_obj){
            return ( typeof HTMLElement === 'object' ) ?
                ps_obj instanceof HTMLElement
                :
                ps_obj && typeof ps_obj === 'object' && ps_obj.nodeType === 1 && typeof ps_obj.nodeName === 'string';
        },

        /**
         * 递归深度合并JSON对象
         * 合并结果：不返还新Object，而是target改变
         * 注：遇到相同元素级属性，以defs为准。
         * @param {object} defs 第1个被合并的对象
         * @param {object} tart  第2个被合并的对象
         * @returns {object} 返回目标对象target，所有被合并的对象的成员属性将被附加到该对象上。
         */
        mergeJsonObject: function(defs, tart){
            var tart = { }
            var loopMerged = function(defs, tart) {
                for(var key in defs) {
                    if(tart[key] === undefined) { // 不冲突的，直接赋值 
                        tart[key] = defs[key];
                        continue;
                    }
                    // 冲突了，如果是Object，看看有么有不冲突的属性
                    // 不是Object 则以（minor）为准为主，
                    // console.log(key)
                    if(this.isJsonObject(defs[key]) || this.isArray(defs[key])) { // arguments.callee 递归调用，并且与函数名解耦 
                        // console.log("is json")
                        //arguments.callee(minor[key], main[key]);
                        loopMerged(defs[key], tart[key]);
                    }else{
                        tart[key] = defs[key];
                    }
                }
            }
            loopMerged(defs, tart);
            return tart;
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
        }
    };





    //————————————————————————————————————————————————————————————————————————————————
    //                      · ie兼容
    //————————————————————————————————————————————————————————————————————————————————
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



    //————————————————————————————————————————————————————————————————————————————————
    return neGoBack; // 返回对象

});





//================================================================================================
//                                          二、自定义对象供前台调用
//================================================================================================
var neuiGoBack = {
    /**
     * 加载控件
     * @param {HTML DOM} elem 控件绑定的节点(可选)
     * @param {ojbect} options 控件传递的参数
     */
    load: function(elem, options){
        neGoBack(elem, options);
    },

    
    /**
     * 隐藏控件
     */
    hide: function(){
        var node = document.getElementsByClassName('negoback')[0];
        node.style.display = 'none';
    },


    /**
     * 显示控件
     */
    show: function(){
        var node = document.getElementsByClassName('negoback')[0];
        node.style.display = 'block';
    }


}; // END neuiGoBack