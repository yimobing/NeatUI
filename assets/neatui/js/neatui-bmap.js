
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
    function MyPlugin(element, options) {
        var me = this;
        // 用户不使用 new 进行实例化时
        if(! (this instanceof MyPlugin)) {
            return new MyPlugin(element, options); // 自动使用 new 进行实例并返回
        }
        // 用户有使用 new 进行实例化时
        if(arguments.length > 0) {
            if(typeof element != 'undefined' && typeof options != 'undefined') {
                me.init(element, options); // 初始化
            }
        }
    };



    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 2. 原型链方法（核心：挂载到构造函数的 prototype 上）
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 初始化
    MyPlugin.prototype = {

        constructor: MyPlugin, // 修复原型构造器批向，防止原型链丢失，必不可少

        /**
         * 初始化
         * @param {String} element 地图容器节点Id。支持格式： id / #id / .className
         * @param {Object} options 可选参数(可选)
         */
        init: function(element, options) {
            var me = this;
            // console.log('初始化');
            var defaults = {
                coordinate: '116.404177, 39.909652', // 中心点经纬度坐标，默认为北京市的坐标(可选)。优先权高于 city 
                city: '北京市', // 中心点城市，默认北京市(可选)
                zoom: 16, // 缩放级别，默认16(可选)。值：3-19
                title: '北京市天安门广场', // 中心点名称(可选)。值不为空时将创建中心点文本标注
                enableScrollWheelZoom: true, // 是否开启滚轮缩放，默认true(可选)
                enableDragging: false, // 中心点是否可拖拽，默认false(可选)
                onDragend: null // 中心点拖拽结束事件(可选)
            }
            var settings = utils.merge(true, {}, defaults, options || {});
            
            me.defaults = defaults;
            me.settings = settings;
            me.element = element;
            me.$opts = {}
            // 创建地图并初始化
            me.createMap();
        },



        /**
         * 创建地图：地图初始化
         */
        createMap: function () {
            var me = this;
            if(typeof BMap == 'undefined') {
                var tips = '请先引入百度地图API文件<br>引入方式： <script src="http://api.map.baidu.com/api?v=2.0&ak=您的密钥(AK,浏览器端)"></script> <!--百度地图api文件-->';
                utils.dialog(tips);
                return;
            }
            var selector = me.element.toString().replace(/(\#|\.)/g, '');
            console.log('selector：', selector)
            if(utils.isDomExist(selector) == false) {
                var tips = '地图容器节点不存在，请检查参数 container 的值' + me.settings.container;
                utils.dialog(tips);
                return;
            }
            var coordinate = me.settings.coordinate,
                zoom = me.settings.zoom;
            var coordObj = helpers._convertCoordinateStringToObject(coordinate);
                centLng = coordObj.lng,  centLat = coordObj.lat;
            // 地图初始化
            var map = new BMap.Map(selector); // 创建地图实例
            var point = new BMap.Point(centLng, centLat); // 设置中心点坐标
            map.centerAndZoom(point, zoom); // 地图初始化并设置地图展示级别
            if(me.settings.enableScrollWheelZoom) {
                map.enableScrollWheelZoom(); // 开启滚轮缩放
            }
            // var viewportOptions = {
            //     margins: [50, 50, 50, 50] // 地图边缘与坐标点的边距（防止点贴边）
            // };
            // map.setViewport(point, viewportOptions); // 根据坐标点自动调整地图视野
            
            // 全局赋值
            me.$opts.$maper = map; // 地图实例化对象
            me.$opts.$element = utils.getDom(selector); // 容器节点对象
            
            // 创建中心点标注
            me.createMarker(point, {
                enableDragging: me.settings.enableDragging,
                enableMassClear: false,
                overLayName: 'overlay-center-mark',
                onDragend: me.settings.onDragend,
                label: {
                    content: me.settings.title
                }
            });
        },



        /**
         * 创建点标注（1个）
         * @param {Point} point 坐标点
         * @param {Object} options 参数对象
         */
        createMarker: function (point, options) {
            var me = this;
            var map = me.getMap();
            var original = {
                category: 'normal', // 坐标点类型，默认normal。值：normal 普通点标注, center 中心点标注, polygon 多边形标注, line 折线标注。
                enableDragging: false, // 是否可拖拽
                enableMassClear: true, // 是否允许覆盖物被清除，默认true(可选)
                onDragend: null, // 拖拽结束事件(可选)。仅当 enableDragging 为 true 有效
                label: { // 文本标注
                    content: '', // 文本标注显示信息，默认空(可选)。值为空时不创建文本标注
                    style: { // 文本标注的样式
                        padding: '10px',
                        height: '30px',
                        lineHeight: '30px',
                        // backgroundColor: "#fff",
                        borderRadius: '5px',
                        borderColor: '#ccc',
                        color: 'blue',
                        fontSize: '16px',
                        fontFamily: '微软雅黑'
                    },
                    option: { // 文本标注可选参数
                        position: point, // 指定文本标注所在的地理位置
                        // offset: new BMap.Size(30, -30) // 设置文本偏移量
                        width: 0, // 宽度(220-730) 0 自动调整
                        maxWidth: 500, // 最大宽度(220-730)
                        height: 0, // 高度(60-650) 0 自动调整
                        offset: { // 位置偏移
                            width: -40,
                            height: -75
                        }
                    }
                }
            }
            var config = utils.merge(true, {}, original, options || {});
            
            if(point == null) {
                var tips = '坐标点为null，请检查！';
                utils.dialog(tips);
                return;
            }
            var enableMassClear = config.enableMassClear,
                category = config.category;
            // 创建点标注
            var marker = new BMap.Marker(point); // 创建点标注实例
            map.addOverlay(marker); // 添加点标注覆盖物
            if(enableMassClear) {
                marker.enableMassClear(); // 允许覆盖物被清除
            }
            if(category.toString().replace(/\s+/g, '') !== '') {
                marker.name = 'tag-mark-' + category; // 标记覆盖物类型(方便清除指定覆盖物)。eg. 'tag-mark-center'
            }
            if(config.enableDragging) {
                marker.enableDragging(); // 点标注可拖拽
                marker.addEventListener("dragend", function (e) {
                    var _point = e.point;
                    var _lng = _point.lng, _lat = _point.lat;
                    if(config.onDragend) {
                        config.onDragend({
                            point: _point,
                            lng: _lng,
                            lat: _lat
                        })
                    }
                });
            }

            // 创建文本标注
            var lbContent = config.label.content, 
                lbStyle = config.label.style,
                lbOption = config.label.option;
            if(lbContent.toString().replace(/\s+/g, '') === '') return;
            var lbRootClassName = 'ne-bd__label',
                lbFatherClassName = 'ne-bd__label_wrap', 
                lbClassName = 'ne-bd__label_text';
            var lbText = [
                '<div class="' + lbFatherClassName + '">',
                    '<div class="' + lbClassName + '">' + lbContent + '</div>',
                '</div>'
            ].join('\r\n')
            // 创建文本标注
            var label = new BMap.Label(lbText, lbOption); // 创建文本标注实例
            map.addOverlay(label); // 添加文本标注覆盖物
            label.setStyle(lbStyle);
            marker.setLabel(label); // 将文本标注绑定到点标注上
            if(enableMassClear) {
                label.enableMassClear(); // 允许覆盖物被清除
            }
            if(category.toString().replace(/\s+/g, '') !== '') {
                label.name = 'tag-label-' + category; // 标记覆盖物类型(方便清除指定覆盖物)。eg. 'tag-label-center'
            }
            
            // 自定义文本标注外观
            setTimeout(function() {
                var nodes = utils.getNodeList(lbClassName);
                if(nodes.length > 0) {
                    for(var i = 0; i < nodes.length; i++) {
                        var currentNode = nodes[i];
                        var parentNode = currentNode.parentNode.parentNode;
                        if(parentNode != null) {
                            // 给文本标注父节点添加一个样式名
                            // parentNode.classList.add(lbRootClassName); // classList 不兼容ie9及以下版本
                            utils.addClass(parentNode, lbRootClassName); 
                        }
                    }
                }
            }, 100);
        },



        /**
         * 获取地图实例化对象
         * @returns {Object} 返回地图实例化对象。值为null时表示还未实例化
         */
        getMap: function () {
            var me = this;
            if(!helpers._examineIsInstantiate(me, arguments.callee.name)) return null;
            return me.$opts.$maper;
        }


    };



    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 3、私有函数：供内部调用
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var helpers = {

        /**
         * 将经纬度坐标字符串转化成对象
         * @param {String} ps_coordinate 经纬度坐标字符串
         * @returns {Object} 返回经纬度坐标对象
         */
        _convertCoordinateStringToObject: function(ps_coordinate) {
            var arr = ps_coordinate.toString().replace(/\s+/g, '').split(',');
            var longitude = arr.length > 0 ? arr[0] : '',
                latitude = arr.length > 1 ? arr[1] : '';
            return {
                lng: longitude,
                lat: latitude
            }
        },



        /**
         * 校验地图是否已初始化和实例化
         * 用于：在调用地图实例化对象me.$opts.$maper之前要进行校验，防止出错
         * @param {Object} me 当前插件对象
         * @param {String} fnName 某个函数名。用函数内可使用  arguments.callee.name 来获取函数名
         * @returns {Boolean} 返回布尔值true或false。
         */
         _examineIsInstantiate: function (me, fnName) {
            var F12Info = '<br>按F12通过控制台查看具体错误信息';
            if (typeof me.$opts == 'undefined') {
                var tips = '地图尚未初始化，无法使用函数' + fnName + '()' + F12Info;
                utils.dialog(tips);
                return false;
            }
            if (me.$opts.$maper == null) {
                var tips = '地图尚未实例化，无法使用函数' + fnName + '()' + F12Info;
                utils.dialog(tips);
                return false;
            }
            return true;
        },

    };


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 4、工具库：通用工具
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var utils = {

        /**
         * 弹出信息容器
         * @param {String} message 信息内容
         */
        dialog: function (message) {
            if(typeof neuiDialog != 'undefined' && typeof neatuiDialog.alert != 'undefined') {
                neuiDialog.alert({
                    message: message,
                    buttons: ['确定']
                })
            }
            else {
                var msg = message.toString().replace(/<br(\s?)(\/?)>/g, '\n');
                alert(msg);
            }
        },

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
        },


        /**
         * 判断选择器对应DOM元素是否存在
         * 兼容 IE6 ~ IE11 / Edge
         * @param {string} selector 选择器，支持格式： id / #id / .className
         * @returns {boolean} 返回布尔值。值：true=存在，false=不存在
         * 参数说明：
         * 1. 只写名称，例如 user，自动按id查询
         * 2. #开头，例如 #user，根据id查询
         * 3. .开头，例如 .user，根据class查询
         */
       isDomExist: function(selector) {
            // 空值直接返回不存在
            if (!selector || typeof selector !== 'string') {
                return false;
            }
            selector = selector.replace(/^\s+|\s+$/g, ''); // 去除首尾空格
            if (selector === '') return false;
            // 自动兼容：传入纯id名（不带#），自动转为id选择器
            var firstChar = selector.charAt(0);
            var realSel = selector;
            if (firstChar !== '#' && firstChar !== '.') {
                realSel = '#' + selector;
                firstChar = '#';
            }
            // IE8及以上、Edge 原生支持 querySelector，优先使用
            if (document.querySelector) {
                return !!document.querySelector(realSel);
            }
            // IE6 / IE7 降级处理（无querySelector、无getElementsByClassName
            var targetName = realSel.slice(1);
            // ID查询
            if (firstChar === '#') {
                return !!document.getElementById(targetName);
            }
            // Class查询 IE6/7 兼容方案
            if (firstChar === '.') {
                var allNodes = document.getElementsByTagName('*');
                // 正则精准匹配完整class，避免 user 匹配 user1 / myuser
                var classReg = new RegExp('(^|\\s)' + targetName + '(\\s|$)');
                for (var i = 0, len = allNodes.length; i < len; i++) {
                    if (classReg.test(allNodes[i].className)) {
                        return true;
                    }
                }
                return false;
            }
            // IE6/7不支持标签、复合、属性选择器，直接返回false
            return false;
        },


        /**
         * 根据选择器获取单个DOM节点对象
         * 兼容浏览器：IE6、IE7、IE8、IE9、IE10、IE11、Edge
         * @param {String} sel 页面元素选择器，支持格式： id / #id / .className
         * @returns {HTMLElement} 返回DOM元素对象，找不到匹配元素返回null
         * 参数说明：
         * 1. 只写名称，例如 user，自动按id查询
         * 2. #开头，例如 #user，根据id查询
         * 3. .开头，例如 .user，根据class查询
         */
        getDom: function(sel) {
            // 非字符串/空值直接返回null
            if (!sel || typeof sel !== 'string') {
                return null;
            }
            // 清除首尾空格
            sel = sel.replace(/^\s+|\s+$/g, '');
            // 纯空白字符串拦截
            if (sel === '') {
                return null;
            }
            var firstChar = sel.charAt(0);
            var realSel = sel;
            // 无#/.默认按ID处理
            if (firstChar !== '#' && firstChar !== '.') {
                realSel = '#' + sel;
                firstChar = '#';
            }
            // IE8+、Edge使用原生选择器API
            if (document.querySelector) {
                return document.querySelector(realSel);
            }
            // 截取#/.后面的名称
            var targetName = realSel.slice(1);
            // IE6/7 ID查询逻辑
            if (firstChar === '#') {
                return document.getElementById(targetName);
            }
            // IE6/7 class兼容查询
            if (firstChar === '.') {
                // 获取页面全部元素
                var allNodes = document.getElementsByTagName('*');
                // 精准匹配完整class，避免模糊匹配
                var classReg = new RegExp('(^|\\s)' + targetName + '(\\s|$)');
                // 遍历匹配class，返回第一个匹配项
                for (var i = 0, len = allNodes.length; i < len; i++) {
                    if (classReg.test(allNodes[i].className)) {
                        return allNodes[i];
                    }
                }
                return null;
            }
            // IE6/7不支持复合/标签/属性选择器，直接返回null
            return null;
        },



        /**
         * 获取节点集合
         * @param {String} ps_classNameId id或class名称的节点（注意：id传字符串，class无需带.）
         * @returns {NodeList} 返回节点集合
         */
        getNodeList: function(ps_classNameId) {
            var elInputClassId = ps_classNameId.toString().replace(/(\#|\.)/g, '');
            // 1. 先尝试通过id获取单个节点
            var elInputNode = document.getElementById(elInputClassId);
            var nodes = [];

            // 2. 处理节点集合：id不存在则通过class获取（querySelectorAll返回NodeList）
            if (elInputNode) {
                // id存在，转为数组（统一格式）
                nodes = [elInputNode];
            } else {
                // id不存在，通过class获取所有匹配节点
                // 兼容IE8+：querySelectorAll，IE6-7需用getElementsByClassName（下文补充）
                var nodeList = document.querySelectorAll('.' + elInputClassId);
                // 将NodeList转为数组（方便循环，兼容IE）
                for (var i = 0; i < nodeList.length; i++) {
                    nodes.push(nodeList[i]);
                }
            }
            return nodes;
        },


         /**
         * 给元素添加类名，兼容IE6~IE9+所有浏览器
         * @param {HTMLElement} el DOM元素
         * @param {String} cls 单个样式类名，不能带空格
         */
        addClass: function(el, cls) {
            if (!el || !cls) return;
            // 已有该class直接返回
            if (this.hasClass(el, cls)) return;
            // 原有className非空加空格分隔
            el.className = el.className ? el.className + ' ' + cls : cls;
        },


        /**
         * 判断某个节点是否已有class
         * @param {HTMLElement} el DOM元素
         * @param {String} cls 单个样式类名，不能带空格
         */
        hasClass: function(el, cls) {
            if (!el.className) return false;
            // 前后空格避免匹配部分字符，比如active匹配active1
            return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
        }


    };



    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 5、暴露公共方法，供用户调用
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return MyPlugin; // 返回对象：暴露构造函数（而非普通对象）
});