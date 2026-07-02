
;(function(root, factory) {
    if(typeof define === 'function' && define.amd) {
        define(factory);
    }
    else if(typeof exports === 'object') {
        module.exports = factory();
    }
    else {
        root.NeExample = factory();
    }
})(this, function () {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 1. 定义构造函数（核心：原型链的基础）
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    function MyPlugin(elem, options) {
        var me = this;
        // 用户不使用 new 进行实例化时
        if(! (this instanceof MyPlugin)) {
            return new MyPlugin(elem, options); // 自动使用 new 进行实例并返回
        }
        // 用户有使用 new 进行实例化时
        if(arguments.length > 0) {
            if(typeof elem != 'undefined' && typeof options != 'undefined') {
                me.init(elem, options); // 初始化
            }
        }
    };



    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 2. 原型链方法（核心：挂载到构造函数的 prototype 上）
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 初始化
    MyPlugin.prototype.init = function (element, options) {
        var me = this;
        // console.log('初始化');
        var defaults = {
            intervals: 100,
            backgroundColor: 'beige',
            color: '#000',
            fontSize: 16
        }
        var settings = utils.merge(true, {}, defaults, options || {});
        me.$element = element;
        me.$defaults = defaults;
        me.$settings = settings;
        me.changeColor(); // 改变颜色
    };

    // 改变颜色
    MyPlugin.prototype.changeColor = function () {
        var me = this;
        var bgColor = me.$settings.backgroundColor,
            fontColor = me.$settings.color,
            fontSize = me.$settings.fontSize;
        var selector = me.$element.toString().replace(/(\#|\.)/g, '');
        var elDom = document.getElementById(selector);
        if(elDom != null) {
            setTimeout(function() {
                elDom.style.backgroundColor = bgColor;
                elDom.style.color = fontColor;
                elDom.style.fontSize = fontSize + 'px';
            }, me.$settings.intervals);
        }
    };



    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 3、私有函数：供内部调用
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var helpers = {
        _fn1: function () {
            
        },
        _fn2: function () {
            
        }
    };


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 4、工具库：通用工具
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var utils = {
        
        /**
         * 原生JS对象合并
         * 兼容IE6+，支持深浅合并，不污染原对象
         * @param {Boolean} [deep] 可选，是否开启深拷贝；true深合并，false浅合并，不传默认false
         * @param {Object} target 必传，合并基准目标对象
         * @param {Object} source1 必传，待合并源对象1
         * @param {Object} [source2,...sourceN] 可选，多个待合并源对象，支持无限个
         * @returns {Object} 返回全新合并后的对象
         * @usage
         * 浅合并（第一层覆盖，嵌套对象直接替换）
         * var res1 = utils.merge(false, {a:1}, {b:2}, {a:99});
         * 深合并（嵌套对象递归合并，数组/日期/正则直接覆盖）
         * var defaults = {name:"默认",info:{age:18}};
         * var userOpts = {name:"张三",info:{sex:"男"}};
         * var res2 = utils.merge(true, {}, defaults, userOpts);
         */
        merge: function () {
            var deep = false;
            var args = Array.prototype.slice.call(arguments);
            // 判断第一个参数是否为布尔值，代表是否深拷贝
            if (typeof args[0] === 'boolean') {
                deep = args.shift();
            }
            // 没有传入需要合并的对象，直接返回空对象
            if (args.length === 0) {
                return {};
            }
            // 取出目标对象，手动浅拷贝一层，不污染原始入参
            var target = args.shift();
            var copyTarget = {};
            for (var k in target) {
                if (Object.prototype.hasOwnProperty.call(target, k)) {
                    copyTarget[k] = target[k];
                }
            }
            target = copyTarget;
            // 循环所有待合并源对象
            for (var i = 0; i < args.length; i++) {
                var source = args[i];
                // 跳过null、undefined、基础类型
                if (!source || typeof source !== 'object') {
                    continue;
                }
                // 遍历源对象自有属性
                for (var key in source) {
                    if (!Object.prototype.hasOwnProperty.call(source, key)) {
                        continue;
                    }
                    var srcVal = source[key];
                    var tarVal = target[key];
                    // 判断是否是纯普通对象：排除数组、Date、RegExp、null
                    var isPlainObj = srcVal !== null
                        && typeof srcVal === 'object'
                        && !Array.isArray(srcVal)
                        && !(srcVal instanceof Date)
                        && !(srcVal instanceof RegExp);
                    // 深合并逻辑：仅普通对象递归
                    if (deep && isPlainObj) {
                        target[key] = this.merge(true, {}, tarVal || {}, srcVal);
                    } else {
                        // 数组、日期、正则、基础类型直接覆盖
                        target[key] = srcVal;
                    }
                }
            }
            return target;
        }
    };



    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 5、暴露公共方法，供用户调用
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return MyPlugin; // 返回对象：暴露构造函数（而非普通对象）
});