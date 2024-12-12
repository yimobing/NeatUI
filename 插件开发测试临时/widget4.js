; (function (root, factory) {
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        // window.MyCounty = factory()
        var fns = factory();
        window.MyCounty = fns.MyCounty;
        window.MyPlugin = fns.MyPlugin;
    }
})(this, function () {
    // 插件构造函数，即对外暴露的函数名，挂载到 window 对象上
    function MyCounty(element, config) {
        if (arguments.length == 0) {
            return new MyPlugin();
        }
        else {
            var elem = element, opts = config;
            if (arguments.length == 1 && typeof element === 'object') {
                elem = '';
                opts = config;
            }
            return new MyPlugin(elem, opts);
        }
    }

    // 定义一个新的构造函数(私有函数)
    var MyPlugin = function (elem, options) {
        // console.log('this：', this); // 这里的this指向函数本身
        if (arguments.length != 0) {
            this.init(elem, options);
            // MyPlugin.prototype.init(elem, options); // 这样调用会导致多个实例化对象指向都是相同的
        }
    };
    // 新的构造函数原型模式定义实例方法，仅内部调用(私有的)
    MyPlugin.prototype = {
        init: function (elem, opts) {
            // 初始化代码，比如添加事件监听器等
            this.defaults = {
                backgroundColor: 'lightcyan', // 背景色
                intervals: 2000 // 多少毫秒后文字变大
            }
            this.settings = combine(true, this.defaults, opts);
            var color = this.settings.backgroundColor;
            this.changeBackground(elem, color);
        },
        /**
         * 改变元素背景色
         * @param {Selector} elem 元素
         * @param {String} color 背景色颜色值
         */
        changeBackground: function (elem, color) {
            if (elem == '' || elem == null) {
                console.error('绑定的节点为空，请检查!');
                return;
            }
            this.element = document.querySelector(elem); // 根据选择器获取插件根元素(绑定的元素)
            this.element.style.backgroundColor = color;
            // 延时操作，可查看插件根元素(绑定的元素)是否分别生效，还是只是最后一个根元素生效
            var duration = typeof this.settings == 'undefined' ? 2000 : this.settings.intervals;
            setTimeout(() => {
                console.log('-------- START：第4种写法 --------');
                console.log('根元素-ID：', elem);
                console.log('根元素-节点：', this.element);
                this.element.style.fontSize = "24px"; // 让字体增大
            }, duration);
        }
    };
    
    // 返回对象
    // return MyCounty;
    return {
        MyCounty: MyCounty,
        MyPlugin: MyPlugin
    }
});


//————————————————————————————————————————————————————————————————————————————————————
//                              创建“既是函数又是对象”的实例
//————————————————————————————————————————————————————————————————————————————————————
function createNewInstace(element, config) {
    // 说明：bind()就是将函数绑定到某个对象上。 例如：f.bind(obj)，实际上可以理解为 obj.f()
    // 实例化一个对像
    var context = new MyPlugin(element, config); // context 是一个实例化的对象，只能当对象使用，不能当函数使用。
    // 创建请求函数
    var instance = MyPlugin.prototype.init.bind(context); // instance 是一个函数，由 bind 返回的一个新函数，可以调用 instance()。
    // 将 对象原型链 prototype 对象中的方法添加到 instance 函数对象中
    // 为了实现能够将 instance 函数作为对象使用，我们就要将 对象原型链 prototype 对象中的方法添加给 instance 。毕竟函数也一个对象，也能够添加方法。
    Object.keys(MyPlugin.prototype).forEach(function(item){
        instance[item] = MyPlugin.prototype[item].bind(context);
    });
    // 为 instance 函数对象添加属性
    Object.keys(context).forEach(function(item){
        instance[item] = context[item];
    })
    return instance;
}



var plugins = createNewInstace();
// var plugins1 = new createNewInstace();
// var plugins2 = new createNewInstace();
// window.plugins = new createNewInstace();
