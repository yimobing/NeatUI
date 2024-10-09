/**
 * [neuiFrame]
 * IFRAME框架控件
 * 调用控件即可直接嵌入一个iframe页面，浏览器窗口调整时，iframe子页面大小也会自动调整
 * Author：Mufeng
 * Date: 2024.10.08
 * Update: 2024.10.09
 */
; (function (root, factory) {
    if (typeof define === 'function' && define.amd) { // AMD规范
        define(factory);
    }
    else if (typeof exports === 'object') { // CommonJS规范
        module.exports = factory();
    }
    else { // 浏览器全局变量(root 即 window)
        root.neuiFrame = factory();
    }
})(this, function () {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  一、开始调用
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // [注] 实例属性(因为是独立的, 不共享)建议使用“构造函数模式”进行定义; 实例方法(因为要共享)建议使用“原型模式”进行定义
    /**
     * !! 构造函数
     * @param {HTML DOM Node} elem 绑定的节点。eg. '#ID节点', '.类名节点'
     * @param {Ojbect} options 参数配置项
     */
     function NFrame(elem, options) {
        // “构造函数模式”定义实例属性，这些属性是独立的，即改变某个实例的属性并不影响其它实例的属性
        // this.a = '';
        // this.b = '';
        // this.c = '';
        var opts = typeof (options) === "function" ? options() : options;
        if (typeof elem != 'undefined' && typeof options != 'undefined') { // 构造函数当成普通函数使用时
            return new FrameInitialize(this, elem, opts);
        }
    };



    /**
     * !!! 控件对象初始化
     * @param {Object} me 构造函数对象，一般为 this 
     * @param {HTML DOM} elem 绑定的元素。eg. '#ID节点', '.类名节点'
     * @param {Ojbect} options 参数配置项
     */
    function FrameInitialize(me, elem, options) {
        // console.log('初始化');
        var defaults = {
            src: '', // 框架链接地址(必须)
            refresh: false, // 是否刷新绑定的节点中的页面，默认false(可选)。值为true 时将重建页面，false 时不会重建页面。注：当点击不同按钮时要在同一个绑定的节点下面显示不同的页面，请将本参数设为true。
            // 指定框架宽高。注：当框架实际宽高<=0时，系统将自动把浏览器视窗高度作为框架宽高。
            width: 'auto', // 框架宽度，默认auto表示系统自动计算(可选)。接受百分比如50%、带或不带单位的数值型如100px。
            height: 'auto', // 框架高度，默认auto表示系统自动计算(可选)。接受百分比如50%、带或不带单位的数值型如100px。
            // 自定义框架左侧、右侧距离。仅当 width != 'auto' 时有效
            left: 'auto', // 框架以外左侧距离，默认auto(可选)。接受带或不带单位的数值型如100px。值：auto 或 0 系统将自动计算。
            right: 'auto', // 框架以外右侧距离，默认auto(可选)。接受带或不带单位的数值型如100px。值：auto 或 0 系统将自动计算。
            // 自定义框架顶部、底部距离。仅当 height != 'auto' 时有效
            top: 'auto', // 框架以外顶部距离，默认auto(可选)。接受带或不带单位的数值型如100px。值：auto 或 0 系统将自动计算。
            bottom: 'auto', // 框架以外底部距离，默认auto(可选)。接受带或不带单位的数值型如100px。值：auto 或 0 系统将自动计算。
            // 框架误差纠正，若不想启用误差纠正功能，请设置参数 width, height 为具体数值即可。注：以下参数当 width = 'auto' 时宽度纠正参数失效，height = 'auto' 时高度纠正参数失效。
            corrected: true, // 是否启用框架宽高值误差纠正功能，默认true(可选)
            inaccuracy: 0, // 统一设置框架宽高误差值，默认0(可选)。建议值14，仅当 corrected = true 且 deviation.enable = false 时有效。注：1.系统将在框架宽高基础上再减去该参数的值。2.参数值为0时，自动将把浏览器滚动条宽度作为误差值。
            deviation: { // 分开设置框架宽高误差值(可选)。仅当 corrected 且 deviation.enable = true 时 有效。生效后参数 inaccuracy 失效。
                enable: false, // 是否启用，默认false(可选)
                horizontal: 0, // 水平方向宽度误差值，默认0(可选)。注：系统将在框架宽度基础上再减去该参数的值。
                vertical: 0 // 垂直方向高度误差值，默认0(可选)。注：系统将在框架高度基础上再减去该参数的值。
            },
            // 回调函数
            resize: null // 浏览器窗口大小变化时的回调函数，默认null(可选)
        }
        var settings = helpers.extend(true, {}, defaults, options || {}); // 合并对象
        me.$defaults = defaults;
        me.$opts = settings; // 方便其它地方直接调用
        // 创建内容
        var randChar = helpers.getRandomChar();
        var rootClassName = 'fm__root_' + randChar,
            skeletonClassName = 'fm__body_' + randChar;
        var allHtml = [
            '<div class="ne__frame ' + rootClassName + '">',
                '<iframe class="ne__fm_body ' + skeletonClassName + '" id="ne-fm-body" name="ne-fm-name" scrolling="yes" frameborder="0" src="' + me.$opts.src + '"></iframe>',
            '</div>'
        ].join('\r\n');
        var classId = elem.toString().replace(/(#|\.)/g, '');
        // console.log('aaa：', document.getElementsByClassName(classId).length);
        // console.log('bbb：', document.getElementById(classId));
        // 判断节点是否存在
        var userNode = document.getElementById(classId) != null ?
            document.getElementById(classId) :
            (
                document.getElementsByClassName(classId).length == 0 ? null : document.getElementsByClassName(classId)[0]
            );
        if (userNode == null) {
            var tmpStr = elem.toString().indexOf('#') >= 0 ? 'id' : (elem.toString().indexOf('.') >= 0 ? 'class' : '');
            var errTips = tmpStr == '' ?
                '绑定的节点' + elem + '不存在，请检查！' :
                '不存在' + tmpStr + '="' + classId + '"的节点，请检查！';
            helpers.dialogs(errTips);
            return;
        }
        // console.log('子节点：', userNode.childNodes, '\n子节点数量：', userNode.childNodes.length);
        // 是否刷新绑定的节点中的页面
        if (me.$opts.refresh == false) {
            if (userNode.childNodes.length == 0) { // 绑定的节点下面只能创建一个框架
                helpers.appendHTML(allHtml, userNode);
                methods._setControlStyle(me, userNode, rootClassName, skeletonClassName);
            }
        }
        else {
            userNode.innerHTML = ''; // 清空内容
            // 重建内容
            helpers.appendHTML(allHtml, userNode);
            methods._setControlStyle(me, userNode, rootClassName, skeletonClassName);
        }
        // 回调
        if (me.$opts.resize) {
            window.addEventListener('resize', methods._handleWindowChange(me));
        }
    };


    
    // “原型模式”定义实例方法，这些方法是共享的
    /**
     * !! 初始化
     * @param {HTMLDOM } o 绑定的节点。eg. '#ID节点', '.类名节点'
     * @param {Object} opts 参数配置项
     */
    NFrame.prototype.init = function (o, opts) {
        new FrameInitialize(this, o, opts);
    };








    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  二、内置函数库 methods
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var methods = {
        /**
         * 设置控件样式
         * @param {Object} me 控件自身对象
         * @param {HTMLDOM} 用户绑定的节点
         * @param {String} root_class_name 根节点样式名
         * @param {String} skeleton_class_name 框架节点样式名
         */
        _setControlStyle: function (me, user_node, root_class_name, skeleton_class_name) {
            var rootNode = document.getElementsByClassName(root_class_name)[0],
                skeletonNode = document.getElementsByClassName(skeleton_class_name)[0];
            // 设置样式
            var w = me.$opts.width.toString().replace(/(px|rem|vw|vh)/g, ''), // 高
                h = me.$opts.height.toString().replace(/(px|rem|vw|vh)/g, ''), // 高
                l = me.$opts.left.toString().replace(/(px|rem|vw|vh)/g, ''), // 左侧距离
                r = me.$opts.right.toString().replace(/(px|rem|vw|vh)/g, ''), // 右侧距离
                t = me.$opts.top.toString().replace(/(px|rem|vw|vh)/g, ''), // 顶部距离
                b = me.$opts.bottom.toString().replace(/(px|rem|vw|vh)/g, ''); // 底部距离
            var winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                winH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            var offsetLeft = helpers.getElementLeft(user_node), // 元素距离视窗左侧的偏移量
                offsetTop = helpers.getElementTop(user_node); // 元素距离视窗顶部的偏移量
            // console.log('视窗宽：', winW, '\n元素距离左侧的偏移量：', offsetLeft);
            // console.log('视窗高：', winH, '\n元素距离顶部的偏移量：', offsetTop);
            var reg = /(auto|0)/;
            var leftW = reg.test(l) ? offsetLeft : l,
                rightW = reg.test(r) ? 0 : r,
                topH = reg.test(t) ? offsetTop : t,
                botH = reg.test(b) ? 0 : b;
            var incorrectVal = parseFloat(me.$opts.inaccuracy.toString().replace(/(px|rem|vw|vh)/g, ''));
            var numcW = 0, numcH = 0;
            if (me.$opts.corrected && me.$opts.deviation.enable) {
                numcW = parseFloat(me.$opts.deviation.horizontal.toString().replace(/(px|rem|vw|vh)/g, ''));
                numcH = parseFloat(me.$opts.deviation.vertical.toString().replace(/(px|rem|vw|vh)/g, ''));
            }
            else if (me.$opts.corrected && me.$opts.deviation.enable === false) {
                var value = (incorrectVal == 0 ? helpers.getScrollbarWidth() : incorrectVal);
                numcW = value;
                numcH = value;
            }
            // console.log('框架宽度误差值：', numcW, ', 高度误差值：', numcH);
            var realW = (w == 'auto' || w == '') ? (winW - leftW - rightW - numcW) : w,
                realH = (h == 'auto' || h == '') ? (winH - topH - botH - numcH) : h;
            if (realW.toString().indexOf('%') < 0) { // 宽度不是百分比时
                if (realW <= 0) realW = winW;
                realW += 'px';
            }
            if (realH.toString().indexOf('%') < 0) { // 高度不是百分比时
                if (realH <= 0) realH = winH;
                realH += 'px';
            }
            // console.log('框架真实宽度：', realW, ', 真实高度：', realH);
            rootNode.style = 'width: ' + realW + '; height: ' + realH + ';'; // 'width: 100%; height: 100%;';
            skeletonNode.style = 'width: 100%; height: 100%;  overflow: auto; -webkit-overflow-scrolling: touch;';
        },



        /**
         * 浏览器窗口大小发生变化时
         * @param {Object} me 控件自身对象
         */
        _handleWindowChange: function (me) {
            // console.log('浏览器窗口大小发生变化了');
            me.$opts.resize({});
        },


    }; // END methods



    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  三、工具库，帮助对象 helpers
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var helpers = {
         /**
         * 弹出提示信息对话框
         * @param {string} ps_str 提示信息字符串
         */
          dialogs:function(ps_str){
            var message = ps_str;
            if(typeof neuiDialog != 'undefined'){
                neuiDialog.alert({
                    message: message,
                    buttons: ['确定']
                })
            }else{
                message = message.toString().replace(/\<br\>/g, '\n'); //<br>换行\n以实现换行
                alert(message);
            }
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
            * 原生js获取元素style属性
            * [用途]：原生js获取元素margin外边距、内边距padding
            * [注意]：返回值中的各个属性值带单位px
            * 兼容性：兼容IE、火狐、谷歌
            * @param {HTML DOM} o DOM元素. 
            * @returns {object} 返回元素的各种css属性组成的数组。
            * [示例]
            var div = document.getElementById("user");
            var style = getElmentStyle(div);
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
        * 获取元素到浏览器顶部的距离，即offsetTop
        * 注：不能直接使用obj.offsetTop，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
        * @param {HTML DOM} o dom元素
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
            * 获取元素到浏览器左侧的距离，即offsetLeft
            * 注：不能直接使用obj.offsetLeft，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
            * @param {HTML DOM} element dom元素
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
         * 获取浏览器滚动条宽度
         * [适用性] 适用于指定区域内容溢出时出现了滚动条，此时就可以用本方法获取滚动条宽度
         * [兼容性] 兼容IE5+
         * @returns {number} 返回滚动条宽度值。一般各大浏览器滚动条的值均在17-21之间
         * edit 20241008
         */
        getScrollbarWidth: function(){
            // 方法2：
            var oP = document.createElement('p'), styles = {
                width: '100px',
                height: '100px',
                overflowY: 'scroll',
            }, i, widthOfBar;
            for (i in styles){
                oP.style[i] = styles[i];
            }
            document.body.appendChild(oP);
            widthOfBar = oP.offsetWidth - oP.clientWidth;
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
            var isIE = window.ActiveXObject || "ActiveXObject" in window ? true : false;
            if(isIE) oP.removeNode(true);
            else oP.remove();
            return widthOfBar;
        },


    }; // END helpers


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  四、返回对象
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return NFrame;
});