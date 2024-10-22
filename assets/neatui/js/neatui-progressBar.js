//————————————————————————————————————————————————————————————————————————————————————
// 封装实例2：控件对象既可当函数使用，又可当对象使用。
//————————————————————————————————————————————————————————————————————————————————————
/**
 * [neuiProgressBar]
 * 进度条控件
 * Author：Mufeng
 * Date: 2024.10.22
 * Update: 2024.10.22
 */
; (function (root, factory) {
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.NProgress = factory();
    }
})(this, function () {

    //================================================================
    // 构造函数
    //================================================================
    function Widget() {
        this.defaults = {
            // 主题样式
            theme: '', // 主题，默认空(可选)。值： red 红色, blue 蓝色, green 绿色, orange 橙色
            extClass: '', // 自定义节点样式名，默认空(可选)。支持多个样式名.eg. 'aaa'. eg. 'aaa bbb'
            // 大小与位置
            parentNode: '', // 绑定控件到到某个父节点下(可选)。eg. '.div1'. eg. '#div2'
            position: 'relative', // 定位方式，默认空表示相对定位(可选)。值： relative 相对定位, absolute 绝对定位, fixed 固定定位
            zIndex: 99, // 定位层级，默认99(可选)
            width: 300, // 自定义区域宽度，默认300(可选)
            height: 100, // 自定义区域高度，默认100(可选)
            hasBorder: true, // 区域是否显示边框，默认true(可选)
            hasRadius: true, // 区域是否有圆角，默认true(可选)
            hasShadow: true, // 区域是否有阴影，默认true(可选)
            mask: { // 遮罩(可选)
                enable: true, // 是否显示遮罩，默认true(可选)。仅当 position = 'absolute' 或 fixed 时才有效。
                zIndex: 98,  // 遮罩层级，默认98(可选)
                opacity: 0.5, // 遮罩透明度，默认0.5(可选)。当值大于 1 将自动转化成除以100的小数，比如 80 表示 0.8
                closeOnceClick: true, // 点击遮罩时是否自动关闭控件，默认true(可选)
            },
            buttons: { // 按钮
                enable: false, // 是否显示关闭按钮，默认true(可选)
                btnText: '关闭' // 关闭按钮文本，默认'关闭'(可选)
            },

            // 常用属性
            showSpeed: true, // 是否显示百分比进度，默认true(可选)
            showOver: true, // 是否显示进度完成，默认true(可选)
            overText: '加载完成', // 进度完成的文字，默认'加载完成'，仅当showOver=true时有效。(可选)
            min: 0, // 进度条最小值，默认0表示0%(可选)
            max: 100, // 进度条最大值，默认100表示100%完成(可选)
            current: 100, // 进度条当前位置，默认100表示100%(可选)
            duration: 0, // 动画时长，默认0，单位毫秒(可选)
            // 回调
            callback: null // 控件创建完后的回调函数，默认null(可选)
        }
    };


    //================================================================
    // 原型模式定义实例方法
    //================================================================
    Widget.prototype = {
        /**
         * 控件初始化
         * @param {Ojbect} options 控件参数
         */
        init: function (options) {
            var me = this;
            me.settings = utils.combine(true, me.defaults, options || {});
            me.$opts = me.settings;
            var _themeClass = me.settings.theme == '' ? '' : ' ' + me.settings.theme.toString().replace(/(\.|\#)/g, ''),
                _extClass = me.settings.extClass == '' ? '' : ' ' + me.settings.extClass.toString().replace(/(\.|\#)/g, ''),
                _current = parseFloat(me.settings.current.toString().replace(/(%|px)/g, '')),
                _parentNode = me.settings.parentNode,
                _width = me.settings.width.toString().replace(/(px|rem|em|vem|vh|%)/g, '') + 'px',
                _height = me.settings.height.toString().replace(/(px|rem|em|vem|vh|%)/g, '') + 'px';
            // 创建节点
            var rootClassId = 'ne-progress-bar'; // 根节点样式名或ID名
            var rootNode = document.createElement('div');
            rootNode.className = rootClassId;
            rootNode.className += _extClass;
            rootNode.className += !me.settings.hasBorder ? '' : ' has-border';
            rootNode.className += !me.settings.hasRadius ? '' : ' has-radius';
            rootNode.className += !me.settings.hasShadow ? '' : ' has-shadow';
            rootNode.style.setProperty('width', _width);
            rootNode.style.setProperty('height', _height);
            if (document.getElementsByClassName(rootClassId).length == 0) {
                if (_parentNode != '') {
                    var parentClassId = _parentNode.toString().replace(/(\.|\#)/g, '');
                    var fatherNode = _parentNode.indexOf('.') >= 0 ?
                        document.getElementsByClassName(parentClassId)[0]
                        :
                        document.getElementById(parentClassId);
                    if (fatherNode == null) {
                        console.error('绑定的父节点“' + _parentNode + '”不存在');
                        utils.appendChild(rootNode, document.body);
                    }
                    else {
                        fatherNode.appendChild(rootNode);
                    }
                }
                else {
                    utils.appendChild(rootNode, document.body);
                }
                // 创建根节点内容
                var percent = helpers.getRates(_current, parseFloat(me.settings.max));
                var _innerHtml = [
                    // 匿名函数马上执行
                    (function () {
                        var _overHtml = '<div class="ne__progress_message">' + me.settings.overText + '</div>';
                        return (
                            !me.settings.showOver ? '' : _overHtml
                        )
                    })(),
                    '<div class="ne__progress_bar' + _themeClass + '">',
                    '<span class="ne__progress_bar_value" style="width: ' + percent + '%">',
                    // 匿名函数马上执行
                    (function () {
                        var _pHtml = '<em class="ne__progress_bar_text">' + percent + '%</em>';
                        return (
                            !me.settings.showSpeed ? '' : _pHtml
                        )
                    })(),
                    '</span>',
                    '</div>'
                ].join('\r\n');
                utils.appendHTML(_innerHtml, rootNode);
            }

            // 全局赋值
            me.$opts.rootNode = rootNode;
            me.$opts.rootClassName = rootClassId;
            me.$opts.maskClassName = 'ne-progress-mask'; // 遮罩节点样式名
            // 回调
            if (me.settings.callback) {
                me.settings.callback();
            }
            // me.setProgress(_current);
            
            // 定位方式不是相对定位时
            if (me.settings.position != '' && me.settings.position != 'relative') {
                rootNode.className += ' ' + me.settings.position;
                rootNode.style.setProperty('z-index', me.settings.zIndex);
                helpers.createMask(me); // 创建遮罩
                if (me.settings.mask.closeOnceClick) { // 点击遮罩层时
                    var maskNode = document.getElementsByClassName(me.$opts.maskClassName)[0];
                    maskNode.addEventListener('click', function () {
                        rootNode.remove();
                        maskNode.remove();
                    });
                }
            }
        },


        /**
         * 创建进度条动画，并设置进度条当前位置
         * @param {Number} ps_now_rate_val 进度条当前位置。比如 max = 500，当前位置为100，则系统会自动计算进度占比为100/500 = 20%
         */
        setProgress: function (ps_now_rate_val) {
            var me = this;
            // console.log('ps_now_rate_val：', ps_now_rate_val);
            var nowRate = helpers.getRates(ps_now_rate_val, me.settings.max);
            var timer = setInterval(fnAnimates(), me.settings.duration);
            var k = 0;
            function fnAnimates() {
                if (typeof k == 'undefined') k = 0;
                // console.log('k：', k);
                if (k > nowRate) {
                    // $("#message").html("加载完毕！").fadeIn("slow");// 显示加载完毕提示
                    document.getElementsByClassName('ne__progress_message')[0].style.setProperty('display', 'block');
                    clearInterval(timer);
                    timer = null;
                }
                else {
                    var percent = k + '%';
                    document.getElementsByClassName('ne__progress_bar_value')[0].style.setProperty('width', percent);
                    document.getElementsByClassName('ne__progress_bar_text')[0].innerText = percent;
                    k++;
                }
                
                return fnAnimates;
            }
        }
    };





    //================================================================
    // 帮助函数库
    //================================================================
    var helpers = {
        /**
         * 获取百分比值
         * @param {Number} ps_now_value 当前值
         * @param {Number} ps_max_value 最大值
         * @returns {Number} 返回百分比值，不含百分号%
         */
        getRates: function (ps_now_value, ps_max_value) {
            return Math.floor((parseFloat(ps_now_value) / parseFloat(ps_max_value)) * 100)
        },


        /**
         * 创建遮罩层
         * @param {Object} me 控件参数
         */
        createMask: function (me) {
            var zIndex = parseInt(me.settings.mask.zIndex),
                opacity = parseFloat(me.settings.mask.opacity);
            if (isNaN(zIndex)) zIndex = me.defaults.mask.zIndex;
            if (isNaN(opacity)) opacity = me.defaults.mask.opacity;
            if (opacity > 1) {
                opacity = parseFloat(opacity / 100).toFixed(2);
            }
            var alphOpacity = parseFloat(opacity * 100).toFixed(0);
            var maskNode = document.createElement('div');
            maskNode.className = me.$opts.maskClassName;
            maskNode.setAttribute('style', 'position: fixed; z-index: ' + zIndex + '; top: 0; right: 0; width: 100%; height: 100%; margin: 0 auto; background: #000; opacity: '+ opacity + '; filter: alpha(opacity = ' + alphOpacity + ')');
            utils.insertAfter(maskNode, me.$opts.rootNode);
        }
    };




    //================================================================
    // 工具库
    //================================================================
    var utils = {
    
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
         * 重定义并优化原生的 Node.appendChild 方法
         * 向父节点中添加子节点，并将子节点插入到父节点内部的最后面，但在script/style节点前面
         * @param {HTML DOM} newNode childNode 子节点
         * @param {HTML DOM} fatherNode  父节点
         * add 20240929-1
         */
        appendChild: function (childNode, fatherNode) {
            var childrenNode = fatherNode.children; // 获取父节点的直接子元素
            // 将子节点插入到内部的最后面，但不包括style和script元素
            for (var i = childrenNode.length - 1; i >= 0; i--) { // 循环倒装一下
                if (childrenNode[i].tagName === "STYLE" || childrenNode[i].tagName === "SCRIPT" || childrenNode[i].className === 'controls') {
                    continue; // 跳过style和script元素
                }
                this.insertAfter(childNode, childrenNode[i]);
                break; // 只插入一次，因为新节点会被插入到最后一个style/script元素之前
            }
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


    };


    //================================================================
    // 返回对象
    //================================================================
    return Widget;
});

//================================================================
//  创建“既是函数又是对象”的实例
//================================================================
function createNewInstace(config){
    // 说明：bind()就是将函数绑定到某个对象上。 例如：f.bind(obj)，实际上可以理解为 obj.f()
    // 实例化一个对像
    var context = new NProgress(config); // context 是一个实例化的对象，只能当对象使用，不能当函数使用。
    // 创建请求函数
    var instance = NProgress.prototype.init.bind(context); // instance 是一个函数，由 bind 返回的一个新函数，可以调用 instance()。
    // 将 对象原型链 prototype 对象中的方法添加到 instance 函数对象中
    // 为了实现能够将 instance 函数作为对象使用，我们就要将 对象原型链 prototype 对象中的方法添加给 instance 。毕竟函数也一个对象，也能够添加方法。
    Object.keys(NProgress.prototype).forEach(function (item) {
        instance[item] = NProgress.prototype[item].bind(context);
    });
    // 为 instance 函数对象添加属性
    Object.keys(context).forEach(function (item) {
        instance[item] = context[item];
    })
    return instance;
}

var neuiProgressBar = createNewInstace();



