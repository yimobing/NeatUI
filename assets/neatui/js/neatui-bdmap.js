/**
 * [neuiBdmap]
 * 百度地图控件 纯JS原生版
 * Version：v1.0.1
 * 还差的功能：参数整合
 * Author: Mufeng
 * QQ: 1614644937
 * Date: 2021.06.18
 * Update: 2024.11.22
 */


/**
 * 官网：https://github.com/yimobing/neatui
 * [百度地图资源库]
 * 鼠标绘制工具：http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js
 * GeoUtils类库：http://api.map.baidu.com/library/GeoUtils/1.2/src/GeoUtils_min.js
 * 加载检索信息窗口：http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js
 */


/**
 * 【关于对覆盖物的标记】
    说明：
    百度地图API中对覆盖物标记的方法有两种
    一种用 overlay.name='同一个字符串' 来标记同一个覆盖物(如多边形覆盖物)，即同一种覆盖物的 name 属性相同
    另一种是用 overlay.identifier='一直变化的字符串' 来标记每一个覆盖物，即每一个覆盖物哪怕是同一种覆盖物，它们的 identifier 都不相同
    // eg.
    overlay.name = 'anniu_biaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
    overlay.identifier = layUid; // 添加覆盖物唯一标识符

    1. 本控件中使用 name 属性来标记相同的覆盖物，name 的值及含义如下：
    // 标记覆盖物类型,方便清除指定覆盖物时用
    duobianxing_biaoji // 多边形覆盖物 polygon
    dian_biaoji // 图像标注覆盖物(点标记覆盖物) Marker
    wenben_biaoji // 文本标注覆盖物 Label
    anniu_biaoji // 按钮覆盖物。一般是显示在多边形时面的按钮

    2. 本控件中使用 identifier 属性来标记每一个覆盖，identifier 的值及含义如下
    // 添加覆盖物唯一标识符
    identity_duobianxing_1 // 每个多边形唯一标识符，后面的数字 1 表示 第1个多边形
    identity_duobianxing_1_btn // 每个多边形内部按钮唯一标识符，后面的 1_btn 表示第1个多边形内部的按钮
 */


//————————————————————————————————————————————————————————————————————————————————————
// 
//————————————————————————————————————————————————————————————————————————————————————
; (function (root, factory) {
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.NBD = factory();
    }
})(this, function () {

    //================================================================
    // 构造函数
    //================================================================
    function Widget(elem, options) {

        // 1. 前台参数
        this.defaults = {
            // 编程语言环境(可选)。注：不同环境下地图展示与交互可能有不同,故可能需要区分下。
            environment: {
                language: '.net' // 语言类型(可选)： 默认.net。值： .net 即Csharp .aspx页面, .php即php页面
            },
            // 地图大小。width/height参数值：数值型或百分比类型(如1920, 1920px, 90%)表示具体的大小, 字符串型 auto 表示自动调整, fn 表示在setSize/onResize函数中设置。注：百分比值会转化成浏览器视窗大小*百分比值。
            width: '999', // 宽(可选)，默认auto
            height: 'auto', // 高(可选)，默认auto
            setSize: null, // 初始化时用函数设置大小(可选)，默认null。优先权大于width/height。
            onResize: null, // 窗口大小变化时用函数设置大小(可选)，默认null。优先权大于width/height。
            // 地图缩放级别(可选)，默认11。 值：3-19
            zoom: 11,
            // 中心点(可选)
            center: {
                city: "", // 城市(可选)，默认空。值：空时根据坐标定位, 非空时根据城市定位。eg.'泉州市', eg.'泉州市惠安县'。
                coordinate: "116.404177,39.909652",  // 坐标(可选)，默认为首都北京天安门广场的坐标, eg."经度,纬度"。
                caption: "北京市", // 标题文字(可选)，默认'北京市'。支持HTML
                describe: "", // 描述文字(可选)，默认空。支持HTML
                complete: null, // 创建完成回调(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
                enableClickCreateNew: false, // 是否启用点击地图时在点击位置新建中心点坐标(可选)，默认false。
                clickCallback: null, // 点击地图时在点击位置新建中心点坐标的回调函数(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
                enableDrag: false, // 是否允许拖拽(可选)，默认false
                dragEnd: null // 拖拽结束回调(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
            },

            // 功能与配置项(可选)
            draft: { // 地图底图功能(可选)
                platOptions: { // 地图默认配置项(可选)。
                    enableMapClick: false, // 是否启用底图景点可点功能(可选)，默认false。
                    minZoom: 3, // 地图允许展示的最小级别
                    maxZoom: 19, // 地图允许展示的最大级别
                    // mapType: BMAP_NORMAL_MAP, // 地图类型，默认为BMAP_NORMAL_MAP (启用此会报错,原因未知)
                    enableHighResolution: true, // 是否启用使用高分辨率地图。在iPhone4及其后续设备上，可以通过开启此选项获取更高分辨率的底图，v1.2,v1.3版本默认不开启，v1.4默认为开启状态
                    enableAutoResize: true // 是否自动适应地图容器变化，默认启用
                },
                enableWheelZoom: true, // 是否开启鼠标滚轮缩放功能，仅对PC上有效(可选)，默认true。
                personalize: { // 个性化地图(可选)
                    enable: false, // 是否启用(可选)，默认false
                    basePaint: false, // 是否使用个性化的底图模式(干净清爽)(可选)，默认false。
                    baseStyle: '', // 地图风格，默认空表示使用默认设置。仅当basePaint为false时有效。值： normal 普通风格, light 清新蓝风格, dark 黑夜风格, bluish 清新蓝绿风格, grayscale 高端灰风格, hardedge 强边界风格, darkgreen 青春绿风格, pink 浪漫粉风格, midnight 午夜蓝风格, grassgreen 自然绿风格, googlelite 精简风格(底图模式,干净清爽), redalert 红色警戒风格
                }
            },

            // 点标记功能(可选)
            markers: {
                markOptions: { // 点标记默认配置项(可选)。
                    image: { // 自定义图标(可选)
                        enable: false, // 是否允许自定义图标(可选)，默认false
                        path: "assets/neatui/img/", // 图片路径(可选)
                        icon: "bmap_locate_blue.png", // 图片名称(可选)
                        size: 50 // 图片大小(可选)
                    }
                }
            },
            infos: { // 信息窗口功能(可选)。
                enable: false, // 是否启用(可选)，默认false
                width: 0, // 宽(可选)。单位像素，取值范围：0, 220 - 730, 其中0表示自动调整宽
                height: 0, // 高(可选)。单位像素，取值范围：0, 60 - 650，其中0表示自动调整高
                method: "mouseover" // 打开方式(可选). mouseover 鼠标经过点标记时(默认)，click 鼠标点击点标记时
            }
        }

        // 2. 内部参数
        this.config = {
            status: false, // 地图状态(可选)，默认false。值：true 已加载, false 未加载
            clickTimes: 0, // 记录地图被点击的次数(可选)，默认0。
            loadTimes: 0, // 记录地图重载的次数(可选)，默认0。
            // 覆盖物集合
            overlays: [], // 所有覆盖物集合
            markerLays: [], // 点标记覆盖物集合
            labelLays: [], // 信息窗覆盖物集合
            polyLays: [], // 多边形覆盖物集合
            // 前台前过来的点坐标 test 1
            overlaysCache: [],
            // myPoints: [], // 所有坐标点数组
            // myOverlay: [], // 所有覆盖物数组
             
            // 鼠标绘制管理类 BMapLib.DrawingManager
            drawMode: "", // 当前绘制模式(可选)，默认空。值：空 无任何绘制操作, hander 拖动地图(鼠标为一只手), marker 画点, circle 画圆, polyline 画线,  polygon 画多边形, rectangle 画矩形。

            // 以下参数是没用到的, 后期完善后可删除
            // 多边形覆盖物(多个) 以下参数待重新整合 test1
            // myPolyIdentifiers: [], // 覆盖物标识符数组(即一个标识符对应一个覆盖物)(可选)。
            // myPolyGroupNames: [], // 覆盖物分类数组(可选)。eg.["学校", "便利店", "旅游景点"] 分别表示学校、便利店、旅游景点三种不同类型的覆盖物
            // myPolyAllPoints: [], // 所有覆盖物的点坐标数组(可选)。
            // myPolyOnePoints: [], // 一个覆盖物的点坐标数组(可选)。
            // myPolyOnePointCache: [], // 一个覆盖物的点坐标数组(临时变量，用于记录这些点一个个删除后的剩余的点)(可选)。

            // 多边形覆盖物(单个) 以下参数待重新整合 test1
            // myPolygon: "", // 当前覆盖物对象(可选)。
            // myPolyHidValue: "", // 当前覆盖物隐藏值(可选)。当前端删除某个覆盖物时，如删除接口需传递某个参数，则可使用本参数。

            // test1
            // myLayIdentifier: [], // 覆盖物标识符数组(即让一个标识符对应一个覆盖物)
            // myLayNumber: '', // 覆盖物编号
            // myGroupName: [], // 覆盖物分组名称数组.
        }

    };



    //================================================================
    // 原型模式定义实例方法，供外部调用
    //================================================================
    Widget.prototype = {

        //————————————————————————————————————————————————
        /**
         * 初始化
         * @param {Selector} elem 地图根节点绑定的ID属性名
         * @param {Object} options 参数对象
         */
        init: function (elem, options) {
            var me = this;
            var settings = utils.combine(true, me.defaults, me.config);
            me.settings = utils.combine(true, settings, options || {}); // 全局赋值1
            me.$opts = { // 全局赋值2
                $maper: null, // 地图实例化对象
                $container: null, // 地图根节点容器ID
                $nodeRoot: null, // 地图根节点DOM
                $zoom: null, // 地图缩放级别
                $centerPoint: null, // 地图中心点地理坐标
                $centerMarker: null, // 中心点图像标注实例
                $centerLabelNode: null, // 中心点文本标注节点
                $polygon: null // 多边形覆盖物。是一个Object对象
            }
            me.createMap(elem);
        },





        //————————————————————————————————————————————————
        //  create开头的函数，用于：创建控件效果
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 创建地图并初始化
         * @param {Selector} elem 地图根节点绑定的ID属性名
         */
        createMap: function (elem) {
            var me = this;
            // if (me.settings.status) return;  // 只允许地图加载一次
            // 全局赋值1
            me.settings.loadTimes++;
            me.settings.status = true;
            // · 地图根节点
            var container = elem.toString().replace(/(\#|\.)/g, '');
            var nodeRoot = document.getElementById(container);
            nodeRoot.classList.add('ne-bd-map-root');
            // · 设置地图大小
            var w = me.settings.width.toString().toLocaleLowerCase().replace(/\s+/g, ''),
                h = me.settings.height.toString().toLocaleLowerCase().replace(/\s+/g, ''),
                width = parseFloat(w.replace(/(px|%|vw|vh)/g, '')),
                height = parseFloat(h.replace(/(px|%|vw|vh)/g, ''));
            if (isNaN(width)) width = 0;
            if (isNaN(height)) height = 0;
            // console.log('w：', w, '\h：', h);
            // console.log('width：', width, '\nheight：', height);
            if (w != 'fn' || h != 'fn') {
                var winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                    winH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                    left = utils.getElementLeft(nodeRoot),
                    top = utils.getElementTop(nodeRoot);
                // console.log('left：', left, '\ntop：', top);
                // 纯数字时，eg. 800
                // var numReg = /^([0-9]+)$/gim;
                // if (numReg.test(width)) width += 'px';
                // if (numReg.test(height)) height += 'px';
                // 百分数时转化换具体数值，eg. 80%
                if (w.indexOf('%') >= 0) {
                    width = parseFloat(width) / 100 * winW;
                }
                if (h.indexOf('%') >= 0) {
                    height = parseFloat(height) / 100 * winH;
                }
                // 计算真实宽高
                var realW = width, realH = height;
                if (w.indexOf('auto') >= 0 || w === '') {
                    realW = winW - left;
                }
                if (h.indexOf('auto') >= 0 || h === '') {
                    realH = winH - top - 15;
                }
                if (realW == 0) realW = winW;
                if (realH == 0) realH = winH;
                // console.log('真实宽度：', realW, '\n真实高度：', realH);
                nodeRoot.setAttribute('style', 'width: ' + realW + 'px;height: ' + realH + 'px'); // 设置地图宽高
                if (nodeRoot.parentNode != null) {
                    var fatherH = realH + 15;
                    nodeRoot.parentNode.style.setProperty('height', fatherH + 'px'); // 设置地图父节点宽高
                }
            }

            // · 根据初始化及窗口大小变化的函数来设置地图宽高
            if (me.settings.setSize) {
                me.settings.setSize();
            }
            if (me.settings.onResize) {
                window.onresize = function () {
                    me.settings.onResize();
                }
            }


            // · 创建创建地图实例并初始化
            var zoom = me.settings.zoom;
            var centerCity = me.settings.center.city == '' ? me.defaults.center.city : me.settings.center.city,
                centerCoordinate = me.settings.center.coordinate == '' ? me.defaults.center.coordinate : me.settings.center.coordinate, // 当中心点坐标为空时,设定一个默认坐标
                centerLng = centerCoordinate.split(',')[0],
                centerLat = centerCoordinate.split(',')[1],
                centerCaption = me.settings.center.caption,
                centerDescribe = me.settings.center.describe,
                centerEnableDrag = me.settings.center.enableDrag,
                centerComplete = me.settings.center.complete,
                centerDragEnd = me.settings.center.dragEnd;
            // 第1步 创建地图实例
            var platOptions = me.settings.draft.platOptions;
            var maper = new BMap.Map(container, platOptions);
            // 第2步 设置中心点坐标
            var centerPoint = new BMap.Point(centerLng, centerLat);
            // 第3步 地图初始化同时设置地图展示级别
            maper.centerAndZoom(centerPoint, zoom);
            if(centerCity.toString().replace(/\s+/g, '') !== ''){
                maper.setCenter(centerCity);
            }

            // 全局赋值2
            me.$opts.$maper = maper; // 地图实例化对象
            me.$opts.$container = elem; // 地图容器ID
            me.$opts.$nodeRoot = nodeRoot; // 地图根节点DOM
            me.$opts.$zoom = zoom; // 地图缩放级别
            me.$opts.$centerPoint = centerPoint; // 中心点地理坐标

            // 第4步，开始与地图进行交互操作
            // 允许使用鼠标滚轮控制缩放
            if (me.settings.draft.enableWheelZoom) {
                maper.enableScrollWheelZoom();
            }
            // 个性化地图
            if (me.settings.draft.personalize.enable) {
                me.setMapFashion({
                    bases: me.settings.draft.personalize.basePaint,  // 是否使用底图模式(干净清爽)
                    styles: me.settings.draft.personalize.baseStyle // 地图风格
                });
            }

            // 先清空所有覆盖物
            me.clearAllOverlay();
            // 添加中心点标记
            me.createMarker({
                type: 'zhongxin',
                coordinate: centerCoordinate,
                title: centerCaption, 
                describe: centerDescribe,
                message: '',
                dragable: centerEnableDrag,
                finishCallback: centerComplete,
                dragEndCallback: centerDragEnd 
            });

            // 添加自定义的HTML节点
            var environment = me.settings.environment;
            var language = environment.language.toString().toLocaleLowerCase();
            if (language != '') {
                var hidContentNode = document.createElement('div');
                hidContentNode.className = 'bdmap__hide_content';
                hidContentNode.style.setProperty('display', 'none');
                utils.insertAfter(hidContentNode, document.getElementById(elem));
                if (language == '.net') {
                    var refreshHtml = [
                        '<div class="bdmap__hide_content_refresh">',
                            '<button type="" id="btn-net-reload-page" style="display: none;">ASP.NET刷新页面用(type属性要放空)</button>',
                        '</div>'
                    ].join('\r\n')
                    hidContentNode.innerHTML = refreshHtml; // 创建.net环境下刷新页面的节点
                }
            }

            // 鼠标右键点击事件
            maper.addEventListener("rightclick", function (e) {
                // alert(e.point.lng + "," + e.point.lat);
            });

            // 鼠标左键点击事件
            maper.addEventListener('click', function (e) {
                // console.log('点我了e：', e);
                me.settings.clickTimes++; // 全局赋值1
                // 点击地图时把中心点坐标移到点击位置
                if (me.settings.center.enableClickCreateNew) {
                    // 当前有覆盖物时，则不执行点击事件(即在覆盖物上点击时，只执行覆盖物的click事件，但不执行map的click事件)
                    if (e.overlay) return;
                    // 当前处于绘图模式时，则不执行点击事件
                    // console.log('mode:', me.settings.drawMode);
                    if (me.settings.drawMode != '' && me.settings.drawMode != 'hander') return;
                    var lng = e.point.lng, lat = e.point.lat;
                    me.clearAllMarkOverlay(); // 清空点标记覆盖物
                    me.createMarker({ // 重建点标记
                        type: 'zhongxin',
                        coordinate: lng + ',' + lat,
                        title: centerCaption, 
                        describe: centerDescribe,
                        message: '',
                        dragable: centerEnableDrag,
                        finishCallback: centerComplete,
                        dragEndCallback: centerDragEnd 
                    });
                    if (me.settings.center.clickCallback) {
                        me.settings.center.clickCallback({
                            lng,
                            lat
                        });
                    }
                }
            });
        },



        //————————————————————————————————————————————————
        /**
         * 创建或添加一个图像标注覆盖物(点标记覆盖物)
         * @param {Object} options 参数对象。格式参见函数内部代码
         * @returns {Marker} 返回当前图像标注实例
         */
        createMarker: function(options){
            var me = this;
            if (typeof me.$opts == 'undefined') {
                console.error('地图尚未初始化，无法使用函数' + arguments.callee.name);
                return;
            }
            var maper = me.$opts.$maper;
            if (maper == null) {
                console.error('地图尚未实例化，无法使用函数' + arguments.callee.name);
                return;
            }
            var originals = {
                type: '', // 坐标类型(可选)，默认空。值： zhongxin 中心点坐标, 空 表示其它类型。
                coordinate: '', // 坐标经纬度字符串. eg. '经度,纬度'
                title: '', // 标题(可选)，默认空。支持HTML
                describe: '', // 描述信息(可选)，默认空。支持HTML
                message: '', // 信息窗口短信内容(可选)，默认空
                dragable: false, // 是否允许拖拽(可选)，默认false
                finishCallback: null, // 创建完成回调(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
                dragEndCallback: null // 拖拽结束回调(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
            }
            var finals = utils.combine(true, originals, options || {});
            var type= finals.type,
                coordinate = finals.coordinate,
                title = finals.title,
                describe = finals.describe,
                message = finals.message,
                dragable = finals.dragable;
            //
            var arr = coordinate.split(',');
            var longitude = arr[0], latitude = arr[1];
            var markPoint = new BMap.Point(longitude, latitude);;
            // 添加点标记
            var makeOptions = me.settings.markers.markOptions;
            var iconUrl = makeOptions.image.path + makeOptions.image.icon,
                iconSize = new BMap.Size(makeOptions.image.size, makeOptions.image.size),
                iconOptions = {
                    // offset: new BMap.Size(0, 0),
                    // imageOffset: new BMap.Size(0, 0),
                    anchor: new BMap.Size(5, 10) // 图标的定位锚点。此点用来决定图标与地理位置的关系，是相对于图标左上角的偏移值，默认等于图标宽度和高度的中间值
                };
            var markerOptions = { }
            if(makeOptions.image.enable){
                markerOptions.icon = new BMap.Icon(iconUrl, iconSize, iconOptions);
            }
            var oneMark = new BMap.Marker(markPoint, markerOptions);
            oneMark.name = 'dian_biaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
            maper.addOverlay(oneMark);
            me.settings.overlays.push(oneMark); // 全局赋值
            me.settings.markerLays.push(oneMark);

            // 添加信息窗
            var lbClassName = 'bdLabel';
            if (type == 'zhongxin') {
                lbClassName += ' bdCentralLabel';
            }
            var lbText =  '<div class="' + lbClassName + '">' + title + '</div>',
                lbOptions = {
                    position: markPoint, // 指定文本标注所在的地理位置
                    // offset: new BMap.Size(30, -30) // 设置文本偏移量
                    width: 0,     // 宽度(220-730) 0 自动调整
                    maxWidth: 500,  // 最大宽度(220-730)
                    height: 0,     // 高度(60-650) 0 自动调整
                    offset: { // 位置偏移
                        width: -40, 
                        height: -75
                    }
                }
            var label = new BMap.Label(lbText, lbOptions);
            label.setStyle({
                color: 'blue',
                borderRadius: '5px',
                borderColor: '#ccc',
                padding: '10px',
                fontSize: '16px',
                height: '30px',
                lineHeight: '30px',
                fontFamily: '微软雅黑'
            })
            label.name = 'wenben_biaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
            oneMark.setLabel(label); // 绑定文本标注到点标记上
            maper.addOverlay(label);
            // 更改文本标注节点样式及位置
            setTimeout(function () {
                var lbNode = document.getElementsByClassName(lbClassName); // 延时一下才能取非空节点
                if (lbNode != null && lbNode.length > 0) {
                    lbNode[0].parentNode.classList.add('ne_bd_label'); // 给父节点添加一个样式名
                    if (type == 'zhongxin') {
                        // 全局赋值2
                        me.$opts.$centerLabelNode = lbNode[0]; // 中心点文本标注节点
                    }
                }
                dotHelper.setLabelPositionAndSize(me, lbNode); // 调整文本标注的大小和位置
            }, 100);
            
            // 添加信息窗口
            dotHelper._addInfoWindow(me, oneMark, markPoint, {
                title,
                describe,
                message
            });

            // 全局赋值1
            me.settings.overlays.push(label);
            me.settings.labelLays.push(label);
           
            // 创建完成事件
            if (finals.finishCallback) {
                if (type == 'zhongxin') {
                    // 全局赋值2
                    me.$opts.$centerMarker = oneMark; // 中心点图像标注实例
                }
                // 创建完成时会触发此事件
                finals.finishCallback({
                    lng: longitude,
                    lat: latitude
                });
            }
            // 拖拽事件
            if (dragable) {
                oneMark.enableDragging();
                // 拖拽完成时会触发此事件
                oneMark.addEventListener('dragend', function (e) {
                    if (finals.dragEndCallback) {
                        finals.dragEndCallback({
                            lng: e.point.lng,
                            lat: e.point.lat
                        });
                    }
                    var lbNode = document.getElementsByClassName(lbClassName); // 这里取到的可能是空节点
                    dotHelper.setLabelPositionAndSize(me, lbNode); // 调整文本标注的大小和位置
                });
            }

            return oneMark;
        },


        
        //————————————————————————————————————————————————
        /**
         * 创建绘图工具栏
         * @param {Object} 参数对象。参数参见函数代码
         */
        createDrawingToolbar: function (options) {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            // 实例化鼠标绘制工具
            drawHelper._turnOnDrawing(me, maper, options);
        },
         
         
         
        //————————————————————————————————————————————————
        /**
         * 创建多个多边形覆盖物
         * @param {Object} options 参数对象。格式见函数
         */
        createPolygonOverlays: function (options) {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var originals = {
                points: [], // 多边形覆盖物坐标组成的二维数组，有N个多边形数组就有N个元素。
                // 格式：
                // [
                //     [ {lng: '', lat: ''}, {lng: '', lat: ''}, {lng: '', lat: ''}, ..], // 第1个多边形的N个点
                //     [ {lng: '', lat: ''}, {lng: '', lat: ''}, {lng: '', lat: ''}, ..],// 第2个多边形的M个点
                //     [ {lng: '', lat: ''}, {lng: '', lat: ''}, {lng: '', lat: ''}, ..] // 第3个多边形的L个点
                // ];
                hideValues: [], // 多边形覆盖物隐藏值组成的一维数组(可选)，默认空数组。格式：[1001, 1002, 1003]。注：当界面上对某个多边形进行操作需用到该多边形的"隐藏值ID字段"时,可把后端提供的N个多边形的"隐藏值ID字段"push到本参数数组里传递进来，界面可通过按钮中的data-bh属性取得该隐藏值。
                buttons: { // 按钮(可选)
                    enable: false,  // 是否添加操作按钮(可选)，默认false
                    text: '删除', // 操作按钮的文本，默认'删除'
                    callback: null // 回调函数(可选)，默认null。返回值e { id: '隐藏值ID字段', polyLayId: '多边形覆盖物唯一标识符', btnLayId: '按钮覆盖物唯一标识符'}
                },
                skinOptions: { // 外观配置项(可选)。
                    strokeColor: "red", // 边线颜色(可选)，默认红色。
                    fillColor: "red", // 填充颜色(可选)，默认红色。当参数为空时，圆形将没有填充效果。
                    strokeWeight: 1, // 边线的宽度，以像素为单位(可选)，默认1px。
                    strokeOpacity: 0.8, // 边线透明度，取值范围0-1(可选)，默认0.8。
                    fillOpacity: 0.65,  // 填充的透明度，取值范围0-1(可选)，默认0.65。
                    strokeStyle: "solid" // 边线的样式，solid或dashed(可选)，默认solid。
                }
            }
            var finals = utils.combine(true, originals, options || {});
            var points = finals.points,
                hideValues = finals.hideValues,
                buttoned = finals.buttons.enable,
                btnText = finals.buttons.text,
                btnCallback = finals.buttons.callback,
                skinOptions = finals.skinOptions;
            // 全局赋值2
            me.$opts.$polygon = {
                useButton: buttoned,
                buttonText: btnText
            }
            // me.clearAllOverlay();
            // maper.centerAndZoom(me.$opts.$centerPoint, me.$opts.$zoom); // 设置地图中心点

            // 数据转化
            var newPoints = []
            for (var i = 0; i < points.length; i++) {
                var one = points[i];
                for (var k = 0; k < one.length; k++) {
                    var row = one[k];
                    one[k] = new BMap.Point(row.lng, row.lat);
                }
                newPoints.push(one);
            }
            // console.log('符合要求的数组：', newPoints);

            // 创建多边形覆盖物
            for (var i = 0; i < newPoints.length; i++) {
                var onePoint = newPoints[i];
                var ids = hideValues.length == 0 ? '' : hideValues[i];
                var ply = new BMap.Polygon(onePoint, skinOptions);
                try {
                    ply.enableEditing();
                    ply.name = 'duobianxing_biaoji'; // 覆盖物分类标识符（标记覆盖物类型,方便清除指定类型的覆盖物）
                    // 统计多边形个数, 给覆盖物添加唯一标识符
                    var total = 1; // 统计多边形覆盖物个数
                    var polyOverlay = maper.getOverlays();
                    polyOverlay.map(function (item) {
                        if (item.name === 'duobianxing_biaoji') {
                            total++;
                        }
                    })
                    var plyUid = 'identity_duobianxing_' + total;
                    ply.identifier = plyUid; // 添加多边形唯一标识符
                    maper.addOverlay(ply);
                    // 全局赋值1
                    // me.settings.myPolygon = ply; 
                    me.settings.overlays.push(ply);
                    me.settings.polyLays.push(ply);
                    // 改变多边形形状
                    ply.addEventListener("lineupdate", function (event) { // 拖动边线进行编辑时监听事件
                        // console.log('覆盖物属性发生变化event:', event);
                        if (me.settings.clickTimes != 0) me.settings.drawMode = 'polygon'; // 全局赋值1
                        polygonHelper._showLatLon(me, event.currentTarget.ha);
                    });
                    ply.addEventListener("mouseover", function (event) { // 鼠标进入时的监听事件
                        // console.log('鼠标进入了event：', event)
                        me.settings.drawMode = 'polygon'; // 全局赋值1
                    });
                    ply.addEventListener("mouseout", function (event) { // 鼠标离开多边形区域时的监听事件
                        // console.log('鼠标离开了event：', event)
                        me.settings.drawMode = 'hander'; // 全局赋值1
                    });
                    // polygonHelper._showLatLon(me, ply.getPath()); // 绘制完成时显示覆盖物点信息
                    
                    // 给覆盖物添加操作按钮
                    if (buttoned) {
                        var coord = polygonHelper._getPolyCenter(ply),  // 获取多边形中心点
                            plyNo = ids;
                        polygonHelper._addOverlayButton(me, {
                            longitude: coord.lng,
                            latitude: coord.lat,
                            plyUid, // 覆盖物唯一标识符，默认空
                            plyNo, // 覆盖物对应的编号，默认空(可选)。新增时为空
                            btnText, // 按钮文本，默认'删除'(可选)
                            btnCallback // 按钮回调函数，默认null(可选)
                        });
                    }
                }
                catch (e) { }
            }
        },








        //————————————————————————————————————————————————
        //  remove和clear开头的函数，用于：清除或清空覆盖物
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 清除全部覆盖物
         */
         clearAllOverlay: function(){
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            // var r = confirm('确认清除所有覆盖物？');
            // if(r !== true) return;
            var overlays = me.settings.overlays;
            for (var i = 0; i < overlays.length; i++) {
                maper.removeOverlay(overlays[i]);
            }
            me.settings.overlays = []; // 全局赋值1
            // maper.removeOverlay(me.settings.myPolygon);
            // me.settings.myPolygon = '';
        },

         
         
        //————————————————————————————————————————————————
        /**
         * 清除全部点标记覆盖物
         */
        clearAllMarkOverlay: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var allOverlay = maper.getOverlays();
            allOverlay.map(function(item){
                if(item.name === 'dian_biaoji'){
                    maper.removeOverlay(item);
                }
            })
        },



        //————————————————————————————————————————————————
        /**
         * 清空全部文本覆盖物
         */
        clearAllLabelOverlay: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var allOverlay = maper.getOverlays();
            allOverlay.map(function(item){
                if(item.name === 'wenben_biaoji'){
                    maper.removeOverlay(item);
                }
            })
        },



        //————————————————————————————————————————————————
        /**
         * 清除一个多边形覆盖物、清除某个多边形覆盖物
         * @param {string} ps_ply_uid 多边形覆盖物唯一标识符
         * @param {string} ps_btn_uid 多边形覆盖物上面的按钮覆盖物唯一标识符
         * @param {Array} ps_uid_arr 要删除的覆盖唯一标识组成的数组。当前多边形覆盖物及内部的子覆盖物(如按钮)唯一标识符组成的数组。eg. ['当前多边形覆盖物的唯一标识符', '内部按钮覆盖物的唯一标识']
         */
         removeOnePolyOverlay: function (ps_uid_arr) {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var allOverlay = maper.getOverlays();
            allOverlay.map(function(item){
                // if(item.identifier === ps_ply_uid){
                //     maper.removeOverlay(item);
                // }
                // if(item.identifier === ps_btn_uid){
                //     maper.removeOverlay(item);
                // }
                for (var i = 0; i < ps_uid_arr.length; i++){
                    if(item.identifier === ps_uid_arr[i]){
                        maper.removeOverlay(item);
                    }
                }
            })
        },
         
         
         
        /**
         * 清除全部多边形覆盖物
         */
        clearAllPolyOverlay: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var allOverlay = maper.getOverlays();
            allOverlay.map(function(item){
                if(item.name === 'duobianxing_biaoji' || item.name == 'anniu_biaoji'){
                    maper.removeOverlay(item);
                }
            })
        },



        // /**
        //  * 清空线覆盖物
        //  */
        // clearLineOverlay: function(){
        // },
        // /**
        //  * 清空圆覆盖物
        //  */
        // clearCircleOverlay: function(){
        // },
        // /**
        //  * 清空矩形覆盖物
        //  */
        // clearRectangleOverlay: function(){
        // },
    







        //————————————————————————————————————————————————
        //  get开头的函数，用于：获取地图各种对象及数据
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 获取地图实例化对象
         * @returns {Object} 返回地图实例化对象。值为null表示还未实例化
         */
         getMap: function(){
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            return me.$opts.$maper;
        },

        /**
         * 获取地图当前缩放级别
         * @returns {Number} 返回缩放级别
         */
        getZoom: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            return maper.getZoom();
        },

        /**
         * 获取地图当前中心点
         * @returns {Point} 返回中心点地理坐标点
         */
        getCenter: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            return maper.getCenter();
        },

        /**
         * 获取地图根节点容器元素
         * @returns {HTMLElement} 返回地图容器元素
         */
        getContainer: function () {
            var maper = this.getMap();
            return maper.getContainer();
        },

        /**
         * 获取地图中心点标记图像标注实例
         * @returns {Marker} 返回中心点标记图像标注实例
         */
        getCenterMarker: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            return me.$opts.$centerMarker;
        }, 


        /**
         * 获取地图中心点标记文本标注节点
         * @returns {HTML Dom} 返回中心点文本标节点
         */
        getCenterLabelNode: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            return me.$opts.$centerLabelNode;
        },



        //————————————————————————————————————————————————
        /**
         * 获取所有 多边形坐标数据
         * @returns {Array} 返回字符串型坐标数组
         */
        getPolyCoordinateData: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            // 获取多边形的点坐标
            var arr = [];
            var allOverlay = maper.getOverlays();
            allOverlay.map(function(item, index){
                // console.log('item：', item);
                if(item.name === 'duobianxing_biaoji'){
                    // console.log('item：', item);
                    // console.log('path：', item.getPath());
                    // arr.push(item.ha); // !!!不要使用.ha,因为这个参数名称百度会经常变动 edit 20210923-1
                    arr.push(item.getPath());
                }
            })
            // console.log('tempArr:', arr)
            // 将经纬度坐标转化成字符串型数组
            var coordArr = [ ];
            for(var i = 0; i < arr.length; i++){
                coordArr.push(helpers.converCoordinateArray2StringArray(arr[i]));
            }
            // console.log('coordArr：', coordArr);
            return coordArr;
        },

         
         
        //————————————————————————————————————————————————
        /**
         * 获取最后一个多边形覆盖物的经纬度信息 test2
         */
        getLastPolyOverLay: function () {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            // var box = me.settings.myPolygon ? me.settings.myPolygon : me.settings.overlays[me.settings.overlays.length - 1];
            var box = me.settings.overlays.length == 0 ? me.settings.myPolygon : me.settings.overlays[me.settings.overlays.length - 1];
            // var coordinateArr = typeof box == 'undefined' ? [] : typeof box.Ao == 'undefined' ? [] : box.Ao;
            var coordinateArr = typeof box == 'undefined' ? [] : box.getPath();
            // console.log('box:', box)
            // console.log('最后一个覆盖物信息：', coordinateArr);
        },





        //————————————————————————————————————————————————
        //  set开头的函数，用于：设置或重置地图数据
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 设置中心点标记的标题
         * @param {HTML|String} ps_content 标题内容。支持HTML
         */
        setCenterPointLabelTitle: function (ps_content) {
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var node = document.getElementsByClassName('bdCentralLabel');
            if (node != null && node.length > 0) {
                // var reg = /.*<[^>]+>.*/; // 验证是有标签
                node[0].innerHTML = ps_content;
                dotHelper.setLabelPositionAndSize(me, node); // 调整文本标注的大小和位置
            }
        },



        /**
         * 设置地图样式、个性化地图
         * @param {object} opts 参数对象
         * [参考] https://lbs.baidu.com/index.php?title=open/custom
         */
        setMapFashion: function(options){
            var me = this;
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;

            var originals = {
                bases: false, // 是否使用底图模式(干净清爽), 默认false
                styles: 'normal' // 地图风格。值： normal 默认地图样式, light 清新蓝风格, dark 黑夜风格, bluish 清新蓝绿风格, grayscale 高端灰风格, hardedge 强边界风格, darkgreen 青春绿风格, pink 浪漫粉风格, midnight 午夜蓝风格, grassgreen 自然绿风格, googlelite 精简风格, redalert 红色警戒风格
            }
            var finals = utils.combine(true, originals, options || {});
            // 方案1：快速设置地图样式
            var style = finals.bases ? 'googlelite' : finals.styles;
            if (style.toString().replace(/\s+/g, '') !== '') {
                maper.setMapStyle({
                    features: ['point', 'road', 'water', 'land', 'building'], // 设置地图上展示的元素种类(这个参数不起作用，奇怪!!!)。值：point 兴趣点, road 道路, water 河流, land 陆地, building 建筑物
                    style // 设置地图底图样式
                });
            }
            /*
            [style 值]
            normal 普通风格
            light 清新蓝风格
            dark 黑夜风格
            bluish 清新蓝绿风格
            grayscale 高端灰风格
            hardedge 强边界风格
            darkgreen 青春绿风格
            pink 浪漫粉风格
            midnight 午夜蓝风格
            grassgreen 自然绿风格
            googlelite 精简风格
            redalert 红色警戒风格
            */
            

            // 方案2：自定义地图样式
            /* var poilabelOnOff = manmadeOnOff = 'on'; // = buildingOnOff = districtlabelOnOff = 'on';
            if(settings.bases){
                poilabelOnOff = 'off';
                manmadeOnOff = 'on';
            }else{
                poilabelOnOff = 'on';
                manmadeOnOff = 'on';
            }
            var styleArray =  [{
                    "featureType": "poilabel",
                    "elementType": "all",
                    "stylers": {
                        "visibility": poilabelOnOff // 是否显示兴趣点(即常见地标性地点，如教育、医疗、娱乐、酒店、餐饮、大厦、小区等). on 是, off 否
                    }
                },{
                    "featureType": "manmade",
                    "elementType": "all",
                    "stylers": {
                        "visibility": manmadeOnOff // 是否显示所有人造区域. on 是, off 否
                    }
                }
                // ,{
                //     "featureType": "building",
                //     "elementType": "all",
                //     "stylers": {
                //         "visibility": "on" // 是否显示建筑物. on 是, off 否
                //     }
                // },{
                //     "featureType": "districtlabel",
                //     "elementType": "labels",
                //     "stylers": {
                //         "visibility": "on" // 是否显示行政村注. on 是, off 否
                //     }
                // }
            ]
            map.setMapStyle({
                styleJson: styleArray
            }) */

        },







        //————————————————————————————————————————————————
        //          其它操作函数
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 刷新页面数据(Csharp .net 环境下使用)
         * @param {Boolean} ps_is_net 是否.net环境(可选)，默认true
         */
        reloadPageWhenCsharp: function (ps_is_net) {
            var isNetEnVironment = typeof ps_is_net == 'undefined' ? true : (ps_is_net === false ? false : true);
            // 普通页面时
            if (!isNetEnVironment) {
                window.location.reload(); // 重载页面
            }
            else {
                // .net的.aspx页面时，使用隐藏按钮 .click() 的刷新方式，可以解决页面重载的诸多问题
                var node = document.getElementById('btn-net-reload-page');
                if (node != null) {
                    node.click(); // ASP.NET中 使用这个
                }
            }
        },

    };





    //================================================================
    // 函数库，供内部调用
    //================================================================
    var helpers = {
        /**
         * 校验地图是否已初始化和实例化
         * 用于：在调用地图实例化对象me.$opts.$maper之前要进行校验，防止出错
         * @param {Object} me 当前控件对象
         * @param {String} fnName 某个函数名。用函数内可使用  arguments.callee.name 来获取函数名
         * @returns {Boolean} 返回布尔值true或false。
         */
        examineIsInstantiate: function (me, fnName) {
            var F12Info = '<br>按F12可通过控制台查看具体错误信息';
            if (typeof me.$opts == 'undefined') {
                var tips = '地图尚未初始化，无法使用函数' + fnName + '()' + F12Info;
                var errs = tips.toString().replace(/(<br>)/g, '\n');
                utils.dialogs(tips);
                console.error(errs);
                return false;
            }
            if (me.$opts.$maper == null) {
                var tips = '地图尚未实例化，无法使用函数' + fnName + '()' + F12Info;
                var errs = tips.toString().replace(/(<br>)/g, '\n');
                utils.dialogs(tips);
                console.error(errs);
                return false;
            }
            return true;
        },



        /**
         * 将经纬度坐标数组转化成字符串数组
         * @param {array} ps_coord_arr 经纬度坐标数组. eg. [{lng:"116.387112", lat:"39.920977"}, {lng:"116.387112", lat:"39.920977"}]
         * @returns {array} 返回字符串数组. eg. ["116.387112,39.920977", "116.387112,39.920977"]
         */
        converCoordinateArray2StringArray: function(ps_coord_arr){
            var strArr = []
            for(var i = 0; i < ps_coord_arr.length; i++){
                strArr.push(ps_coord_arr[i].lng + "," + ps_coord_arr[i].lat);
            }
            return strArr;
        },

        
    };



    //================================================================
    //  点标记功能
    //================================================================
    var dotHelper = {
        /**
         * 添加信息窗口
         * @param {Object} 当前控件对象
         * @param {Marker} marker 点标记覆盖物
         * @param {Point} point 点标记地理坐标点
         * @param {Object} options 参数对象
         */
        _addInfoWindow: function (me, marker, point, options) {
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            if (!me.settings.infos.enable) return;
            var originals = {
                title: '', // 标题(可选)，默认空。支持HTML
                describe: '', // 内容或描述，比如点标记的地址(可选)，默认空。支持HTML
                message: '' //  短信内容(可选)(这个貌似没用)。完整的短信内容包括：自定义部分+位置链接，不设置时，显示默认短信内容。短信内容最长为140个字
            }
            var finals = utils.combine(true, originals, options || {});
            var title = finals.title,
                describe = finals.describe,
                messsge = finals.message;
            var infoOptions = {
                width : me.settings.infos.width, // 宽。单位像素，取值范围：0, 220 - 730
                height: me.settings.infos.height, // 高。单位像素，取值范围：0, 60 - 650
                title : '<div class="bdInfoTitle">' + title + '</div>', // 标题。支持HTML内容
                message: messsge // 短信内容(可选)。完整的短信内容包括：自定义部分+位置链接，不设置时，显示默认短信内容。短信内容最长为140个字
            }
            var infoContent = '<div class="bdInfoDescribe">' + describe + '</div>';
            var infoDow = new BMap.InfoWindow(infoContent, infoOptions);  // 创建信息窗口对象 
            marker.addEventListener(me.settings.infos.method, function(){       
                maper.openInfoWindow(infoDow, point);
            })

            if(me.settings.infos.method == 'mouseover'){
                marker.addEventListener('mouseout', function () {
                    maper.closeInfoWindow()
                });
            }
        },


        /**
         * 调整文本标注的大小和位置
         * @param {Object} 当前控件对象
         * @param {HTMLCollection} node 当前点标记节点
         */
        setLabelPositionAndSize: function (me, node) {
            if (node != null && node.length > 0) {
                var selfNode = node[0],
                    fatherNode = node[0].parentNode;
                // 自动调整文本标位置/设置父节点定位偏移量
                var w = utils.getElementWidth(selfNode),
                    h = utils.getElementHeight(selfNode);
                // console.log('w：', w, '\nh：', h);
                var styles = utils.getElementStyle(fatherNode);
                var pdLeft = parseFloat(styles.paddingLeft);
                isNaN(pdLeft) ? 0 : pdLeft;
                var left = - ((w - pdLeft) / 2),
                    top = - (h + parseFloat(me.settings.markers.markOptions.image.size) / 2);
                fatherNode.style.setProperty('top', top + 'px');
                fatherNode.style.setProperty('left', left + 'px');
            } 
        },


    };





    //================================================================
    //  百度地图鼠标绘制功能
    //================================================================
    var drawHelper = {
        /**
         * 启用鼠标绘制功能
         * 参考：鼠标绘制工具条库 https://lbsyun.baidu.com/index.php?title=jspopular/openlibrary
         * @param {Object} me 当前控件对象
         * @param {Object} maper 地图实例化对象
         * @param {Object} 参数对象。参见函数内代码
         */
        _turnOnDrawing: function (me, maper, options) {
            var _this = this;
            var originals = {
                enable: true, // 是否启用鼠标绘图功能(可选)，默认true。
                drawingModes : [  // 工具栏上可以选择出现的绘制模式(可选)，将需要显示的DrawingType以数组型形式传入，如[BMAP_DRAWING_MARKER, BMAP_DRAWING_CIRCLE] 将只显示画点和画圆的选项.
                    // BMAP_DRAWING_MARKER, // 画点(画位置)
                    // BMAP_DRAWING_CIRCLE, // 画圆
                    BMAP_DRAWING_POLYLINE, // 画线
                    BMAP_DRAWING_POLYGON, // 画多边形
                    BMAP_DRAWING_RECTANGLE // 画矩形
                ],
                enableCalculate: false, // 绘制是否进行测距(画线时候)、测面(画圆、多边形、矩形)(可选)，默认false
                drawingOptions: { // 鼠标绘图配置项，即鼠标绘制管理类配置项(可选)。
                    strokeColor: "red", // 边线颜色(可选)，默认红色。
                    fillColor: "red", // 填充颜色(可选)，默认红色。当参数为空时，圆形将没有填充效果。
                    strokeWeight: 1, // 边线的宽度，以像素为单位(可选)，默认1px。
                    strokeOpacity: 0.8, // 边线透明度，取值范围0-1(可选)，默认0.8。
                    fillOpacity: 0.65,  // 填充的透明度，取值范围0-1(可选)，默认0.65。
                    strokeStyle: "solid" // 边线的样式，solid或dashed(可选)，默认solid。
                },
                operateButton: { // 操作按钮(可选)
                    buttoned: false, // 是否添加操作按钮(可选)，默认false
                    btnText: '删除' // 操作按钮的文本(可选)，默认'删除'
                },
                stepDescription: { // 绘制步骤说明(可选)
                    enable: true, // 是否启用功能(可选)，默认true
                    title: '绘制步骤说明', // 标题(可选)，有默认值
                    content: '', // 自定义详细的绘制步骤说明(可选)，默认空。支持HTML
                }
            }
            var finals = utils.combine(true, originals, options || {});
            var enable = finals.enable,
                enableCalculate = finals.enableCalculate,
                drawingModes = finals.drawingModes,
                drawingOptions = finals.drawingOptions,
                buttoned = finals.operateButton.buttoned,
                btnText = finals.operateButton.btnText,
                stepDescription = finals.stepDescription;
            if (enable == false) return;

            // 创建绘制步骤说明节点
            if (stepDescription.enable) {
                var stepHtml = [
                    '<p class="bold">一、绘制步骤(正方形)：</p>',
                    '<p>1、选择绘制工具；</p>',
                    '<p>2、按住鼠标左键，在地图任意位置上拖动<br>放开鼠标左键，即可完成绘制</p>',
                    '<p>3、拖动图形上的白色小正方框，可更改形状。</p>',
                    '<p class="bold">二、绘制步骤(线条、多边形等)：</p>',
                    '<p>1、选择绘制工具；</p>',
                    '<p>2、点击地图任意位置(作为起始点)；</p>',
                    '<p>3、移动鼠标，再次点击地图任意位置<br>(就会出现线条或形状)；</p>',
                    '<p>4、重复上一步；</p>',
                    '<p>5、双击鼠标，完成绘制；</p>',
                    '<p>6、拖动图形上的白色小正方框，可更改形状。</p>',
                ].join('\r\n');

                var shuoHtml = [
                    '<div class="bdmap__mouse-title">' + stepDescription.title + '</div>',
                    '<div class="bdmap__mouse-step">',
                        // 匿名函数马上执行
                        (function () {
                            var _content  = stepDescription.content;
                            return _content.toString().replace(/\s+/g, '') === '' ? stepHtml : _content;  
                        })(),
                    '</div>'
                ].join('\r\n');
                var shuoDiv = document.createElement('div');
                shuoDiv.className = 'bdmap__mouse';
                shuoDiv.innerHTML = shuoHtml;
                utils.insertAfter(shuoDiv, document.getElementById(me.$opts.$container));
                // 绘制步骤区域显示或隐藏
                var titleDom = document.getElementsByClassName('bdmap__mouse-title')[0],
                    listDom = document.getElementsByClassName('bdmap__mouse-step')[0];
                titleDom.onclick = function () {
                    if (listDom.offsetWidth > 0 || listDom.offsetHeight > 0) { // 显示时
                        titleDom.classList.add('angle-down');
                        listDom.style.setProperty('display', 'none');
                    }
                    else { // 隐藏时 
                        titleDom.classList.remove('angle-down');
                        listDom.style.setProperty('display', 'block');
                    }
                }
            }
            
            // 实例化鼠标绘制工具, 创建鼠标绘制管理类实例化对象
            var drawManager = new BMapLib.DrawingManager(maper, {
                isOpen: false, // 是否开启绘制模式
                enableDrawingTool: true, // 是否显示工具栏
                drawingToolOptions: { // 可选的输入参数，非必填项
                    anchor: BMAP_ANCHOR_TOP_RIGHT, // 位置
                    offset: new BMap.Size(5, 5), // 偏离值
                    scale: 0.8, // 工具栏缩放比例
                    drawingModes, // 工具栏上可以选择出现的绘制模式(可选),将需要显示的DrawingType以数组型形式传入，如[BMAP_DRAWING_MARKER, BMAP_DRAWING_CIRCLE] 
                },
                enableCalculate, // 绘制是否进行测距(画线时候)、测面(画圆、多边形、矩形)
                circleOptions: drawingOptions, // 圆的样式
                polylineOptions: drawingOptions, // 线的样式
                polygonOptions: drawingOptions, // 多边形的样式
                rectangleOptions: drawingOptions // 矩形的样式
            });
            // 添加绘图切换事件
            _this._drawCursorHand(me);
            // 添加鼠标绘制工具监听事件，用于获取绘制结果
            // 绘制点完成后，派发的事件接口
            // drawManager.addEventListener('markercomplete', function(e, overlay){ })
            // 绘制圆完成后，派发的事件接口
            // drawManager.addEventListener('circlecomplete', function(e, overlay){ })
            // 绘制线完成后，派发的事件接口
            // drawManager.addEventListener('polylinecomplete', function(e, overlay){ })
            // 绘制多边形完成后，派发的事件接口
            // drawManager.addEventListener('polygoncomplete', function(e, overlay){ })
            // 绘制矩形完成后，派发的事件接口
            // drawManager.addEventListener('rectanglecomplete', function(e, overlay){})
            // 鼠标绘制完成后，派发总事件的接口
            drawManager.addEventListener('overlaycomplete', function (e) {
                // 绘制完成后回调获得覆盖物信息
                e.overlay.name = 'duobianxing_biaoji'; // 覆盖物分类标识符（标记覆盖物类型,方便清除指定类型的覆盖物）
                // 统计多边形个数, 给覆盖物添加唯一标识符
                var total = 0;
                var allOverlay = maper.getOverlays();
                allOverlay.map(function (item) {
                    if (item.name === 'duobianxing_biaoji') {
                        total++;
                    }
                })
                var plyUid = 'identity_duobianxing_' + total;
                e.overlay.identifier = plyUid; // 添加多边形唯一标识符
                if (typeof e.overlay.enableEditing != 'undefined') e.overlay.enableEditing();
                // 全局赋值1
                me.settings.overlays.push(e.overlay);
                me.settings.polyLays.push(e.overlay);
                // 给覆盖物添加操作按钮
                if (buttoned) {
                    var coord = polygonHelper._getPolyCenter(e.overlay),  // 获取多边形中心点
                        plyNo = '';
                    polygonHelper._addOverlayButton(me, {
                        longitude: coord.lng,
                        latitude: coord.lat,
                        plyUid, // 覆盖物唯一标识符，默认空
                        plyNo, // 覆盖物对应的编号，默认空(可选)。新增时为空
                        btnText // 按钮文本，默认'删除'(可选)
                    });
                }
                // 改变多边形形状
                e.overlay.addEventListener("lineupdate", function (event) { // 拖动边线进行编辑时监听事件
                    // console.log('event:', event);
                    me.settings.drawMode = e.drawingMode; // 全局赋值
                    polygonHelper._showLatLon(me, event.currentTarget.ha);
                });
                e.overlay.addEventListener("mouseover", function (event) { // 鼠标进入时的监听事件
                    // console.log('鼠标进入了e：', e)
                    me.settings.drawMode = e.drawingMode; // 全局赋值
                });
                e.overlay.addEventListener("mouseout", function (event) { // 鼠标离开时的监听事件
                    // console.log('鼠标离开了e：', e)
                    me.settings.drawMode = 'hander'; // 全局赋值
                });
                if (typeof e.overlay.getPath != 'undefined') { // 绘制完成时显示覆盖物点信息
                    polygonHelper._showLatLon(me, e.overlay.getPath());
                }
                
                // 全局赋值1
                me.settings.drawMode = ['polyline', 'polygon'].indexOf(e.drawingMode) >= 0 ? 'hander' : e.drawingMode; // 画点、线完成之后它会自动切换到鼠标为一只手
            });
        },



        /*
        * 绘图切换事件，即当绘图工具切换到“拖动地图”模式(光标呈现为一只手)时
        * @param {Object} me 当前控件对象
        */
        _drawCursorHand: function (me) {
            var handDom = document.getElementsByClassName('BMapLib_hander')[0],
                markDom = document.getElementsByClassName('BMapLib_marker')[0],
                cirDom = document.getElementsByClassName('BMapLib_circle')[0],
                lineDom = document.getElementsByClassName('BMapLib_polyline')[0],
                plyDom = document.getElementsByClassName('BMapLib_polygon')[0],
                rectDom = document.getElementsByClassName('BMapLib_rectangle')[0];
            if (typeof handDom != 'undefined') {
                handDom.onclick = function () {
                    me.settings.drawMode = 'hander';
                }
            }
            if (typeof markDom != 'undefined') {
                markDom.onclick = function () {
                    me.settings.drawMode = 'marker';
                }
            }
            if (typeof cirDom != 'undefined') {
                cirDom.onclick = function () {
                    me.settings.drawMode = 'circle';
                }
            }
            if (typeof lineDom != 'undefined') {
                lineDom.onclick = function () {
                    me.settings.drawMode = 'polyline';
                }
            }
            if (typeof plyDom != 'undefined') {
                plyDom.onclick = function () {
                    me.settings.drawMode = 'polygon';
                }
            }
            if (typeof rectDom != 'undefined') {
                rectDom.onclick = function () {
                    me.settings.drawMode = 'rectangle';
                }
            }
        }
    };





    //================================================================
    //  百度地图多边形功能
    //================================================================
    var polygonHelper = {

        /**
        * 获取多边形中心点
        * @param {overlay} ps_ply 多边形覆盖物对象
        * @returns {Object} 返回多边形中心点坐标。格式： { lng: "经度", lat: "纬度" }
        */
        _getPolyCenter: function (ps_ply) {
            var x = 0, y = 0;
            var path = ps_ply.getPath();//返回多边型的点数组；ply是多边形覆盖物
            for (var k = 0; k < path.length; k++) {
                x = x + parseFloat(path[k].lng);
                y = y + parseFloat(path[k].lat);
            }
            x = x / path.length;
            y = y / path.length;
            return { lng: x, lat: y }
        },



        /**
         * 给多边形覆盖物添加操作按钮
         * @param {Object} me 当前控件对象
         * @param {Object} 参数对象
         */
        _addOverlayButton: function (me, options) {
            if (!helpers.examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var originals = {
                longitude: '', // 操作按钮所在经度坐标
                latitude: '', // 操作按钮所在纬度坐标
                plyUid: '', // 多边形覆盖物唯一标识符，默认空
                plyNo: '', // 多边形覆盖物对应的编号，默认空(可选)。新增时为空
                btnText: '删除', // 按钮文本，默认'删除'(可选)
                btnCallback: null // 按钮回调函数，默认null(可选)。返回值e { id: '隐藏值ID字段', polyLayId: '多边形覆盖物唯一标识符', btnLayId: '按钮覆盖物唯一标识符'}
            }
            var finals = utils.combine(true, originals, options || {});
            var ps_position = new BMap.Point(finals.longitude, finals.latitude),
                plyUid = finals.plyUid,
                plyNo = finals.plyNo,
                btnText = finals.btnText;
            
            var opts = {
                position: ps_position, // 指定文本标注所在的地理位置. eg.new BMap.Point(118.599547, 24.9246154) 
                offset: new BMap.Size(0, 0) //设置文本偏移量  
                // offset: new BMap.Size(30, 50) //设置文本偏移量  
            }
            
            var lbBtn = new BMap.Label('<div class="bmap__polygon_del" data-bh="' + plyNo + '">' + btnText + '</div>', opts);  // 创建文本标注对象  
            lbBtn.enableMassClear(); // 允许覆盖物被清除
            lbBtn.name = 'anniu_biaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
            var btnUid =  plyUid + '_btn'; // eg. 'identity_duobianxing_5_btn'
            lbBtn.identifier = btnUid; // 添加按钮唯一标识符
            lbBtn.setStyle({
                color: "black",
                fontSize: "12px",
                backgroundColor: "#fff", // 填充颜色。当参数为空时，圆形将没有填充效果。
                color: "#666",
                // borderColor: "#2196F3",
                padding: '6px 10px',
                borderRadius: '4px'
            });
            maper.addOverlay(lbBtn);
            me.settings.overlays.push(lbBtn); // 全局赋值

            lbBtn.addEventListener('click', function (e) {
                 // console.log('e：', e, '\ncontent：', e.target.content);
                 var content = e.target.content;
                 var reg = /^\<(.*?)data-bh="(.*?)"(.*?)>(.*?)\<\/(.*?)\>/g; // 提取data-*值
                 var ls_data_bh = content.replace(reg, '$2');
                 if (ls_data_bh === '' || typeof ls_data_bh == 'undefined' || ls_data_bh == null) {
                    me.removeOnePolyOverlay([plyUid, btnUid]); // 删除当前多边形覆盖物
                    return;
                }
                if (finals.btnCallback) { // 按钮回调函数
                    finals.btnCallback({
                        id: ls_data_bh,
                        polyLayId: plyUid,
                        btnLayId: btnUid
                    });
                }
            });
        },
         
         
         
        /**
         * 显示覆盖物点坐标 (这个函数目前没用到，因为对应界面元素是隐藏的)
         * @param {Object} me 当前控件对象
         * @param {Array} a 覆盖物点坐标数组。格式： [{lng: 经度, lat: "纬度"}, {lng: 经度, lat: "纬度"}]
         */
        _showLatLon: function (me, a) {
            // console.log('a：', a)
            var len = a.length;
            var s = '';
            var arr = [];
            // html节点 test2
            for (var i = 0; i < len - 1; i++) {
                arr.push([a[i].lng, a[i].lat]);
                s += '<li>' + a[i].lng + ',' + a[i].lat + '<span class="red" title="删除" onclick="this._delPoint(' + i + ')">X</span></li>';
            }
            me.settings.overlaysCache = arr;
             // html节点 test2
            var node = document.getElementById('panelWrap');
            if (node != null && node.length > 0) {
                node[0].innerHTML = '<ul>' + s + '</ul>';
            }
        },


        /**
         * 删除覆盖物点坐标  (这个函数目前没用到，因为对应界面元素是隐藏的)
         * @param {Object} me 当前控件对象
         * @param {Number} i 覆盖物点坐标数组循环值
         */
        _delPoint: function (me, i) {
            if (me.settings.overlaysCache.length <= 3) {
                alert('不能再删除, 请保留3个以上的点.');
                return;
            }
            me.settings.overlaysCache.splice(i, 1);
            var a = me.settings.overlaysCache;
            var newOverlay = [];
            for (var i in a) {
                newOverlay.push(new BMap.Point(a[i][0], a[i][1]));
            }
            // me.settings.myOverlay = newOverlay;
            // me.createPolygonOverlays(newOverlay);
        },
     

    };






    //================================================================
    // 工具库
    //================================================================
    var utils = {
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
         * 原生JS合并对象2
         * 即用两个对象来拓展，返回拓展后的新对象
         * @param {Boolean} deep 是否深度合并，默认false
         * @param {Bbject} defs 第1个被合并的对象(可选)
         * @param {Object} opts 第2个被合并的对象(可选)
         * @param {Object} method 其它操作方式(可选)
            参数 method = {
                isToEmptyObject: true, // 是否合并到空对象上
                includePrototype: true, // 是否遍历合并源对象原型链上的属性，默认true
                forEach: function(target, name, sourceItem) {
                    target[name] = sourceItem + 'hello， 自定义每个合并项';
                    return target;
                }
            }
        * @returns {Object} 返回合并后的目标对象
        */
        combine: function(deep, defs, opts, method){
            var options = {};
            if(typeof deep === 'boolean') options = { isDeep: deep === false ? false : true };
            else options =  { isDeep: false }
            if (typeof method === 'object') options = method;

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
                    isDeep: true, // 是否深合并，默认true
                    isToEmptyObject: true, // 是否合并到空对象上
                    includePrototype: true, // 是否遍历合并源对象原型链上的属性，默认true
                    forEach: function(target, name, sourceItem) { // 用于对每个合并项进行自定义修正
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
                        // 根据是否全并到空对象{}中，决定对象采取”引用”还是“只赋值不引用”的方式
                        // config = arguments[0] || {},
                        config = _default.isToEmptyObject ? JSON.parse(JSON.stringify(arguments[0] || {})) : arguments[0] || {}, // 默认配置项
                        source,
                        configItem,
                        sourceItem,
                        tiType,
                        siType,
                        clone,
                        name;
                    // console.log('默认配置项defs：', defs, '\n默认配置项config：', config, '\n第1个参数：', arguments[0]);
                    for (; i < length; i++) {
                        // 判断源对象是否为空
                        if ((source = arguments[i]) != null) {
                            for (name in source) {
                                var hasPro = source.hasOwnProperty(name);
                                // 是否遍历源对象的原型链
                                if (hasPro || _default.includePrototype) {
                                    configItem = config[name];
                                    sourceItem = source[name];
                                    tiType = self.type(configItem);
                                    siType = self.type(sourceItem);
                                    // 防止出现回环
                                    if (config === sourceItem) {
                                        continue;
                                    }
                                    // 如果复制的是对象或者数组
                                    if (_default.isDeep && sourceItem != null && self.typeMap[siType]) {
                                        clone = configItem != null && tiType === siType ? configItem : self.typeMap[siType]();
                                        // 递归
                                        config[name] = self.merge(clone, sourceItem);
                                    } else {
                                        clone = hasPro ? config : config.__proto__;
                                        // 处理每一个合并项
                                        clone = _default.forEach.call(self, clone, name, sourceItem);
                                    }
                                }
                            }
                        }
                    }
                    return config;
                }
            };
            EXT.fn.init.prototype = EXT.fn;

            // 调用并返回结果
            return EXT(options).merge(defs, opts);
        },


            
        /**
         * 原生js prepend字符串
         * 即：向父节点中添加子节点HTML字符串，将把该HTML插入到父节点内部的最前面
         * @param {String} str 子节点字符串
         * @param {HTML DOM} el 父节点
         */
        prependHTML: function(str, el) {
            var divTemp = document.createElement("div"),
                nodes = null,
                fragment = document.createDocumentFragment();
            divTemp.innerHTML = str;
            nodes = divTemp.childNodes;
            for (var i = 0, length = nodes.length; i < length; i += 1) {
                fragment.appendChild(nodes[i].cloneNode(true));
            }
            // 插入到容器的前面 - 差异所在
            el.insertBefore(fragment, el.firstChild);
            // 内存回收？
            nodes = null;
            fragment = null;
        },
    
    
        /**
         * 原生js append字符串
         * 即：向父节点中添加子节点HTML字符串，将把该HTML插入到父节点内部的最后面
         * @param {String} str 子节点字符串
         * @param {HTML DOM} el 父节点
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
            if (typeof existingNode == 'undefined' || existingNode == null) {
                console.error('节点不存在');
                return;
            }
            var parent = existingNode.parentNode;
            if (parent == null) {
                console.error('父节点不存在');
                return;
            }
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
         * 原生js获取元素宽度
         * add 20241112-1
         * @param {HTML DOM} o 某个元素
         * @returns 返回该元素的宽度值
         */
        getElementWidth: function(o) {
            if (!o) return 0;
            // 获取元素的宽度，考虑元素可能被隐藏
            var styles = this.getElementStyle(o);
            var w = o.offsetWidth;
            var paddingLeft = parseFloat(styles.paddingLeft);
            var paddingRight = parseFloat(styles.paddingRight);
            var borderLeft = parseFloat(styles.borderLeftWidth);
            var borderRight = parseFloat(styles.borderRightWidth);
            // 如果元素被隐藏，宽度可能为0，此时使用内部尺寸作为参考
            if (w === 0 && !isNaN(paddingLeft) && !isNaN(paddingRight) && !isNaN(borderLeft) && !isNaN(borderRight)) {
                w = o.clientWidth;
                w += isNaN(paddingLeft) ? 0 : paddingLeft;
                w += isNaN(paddingRight) ? 0 : paddingRight;
                w += isNaN(borderLeft) ? 0 : borderLeft;
                w += isNaN(borderRight) ? 0 : borderRight;
            }
            return w;
        },



        /**
         * 原生js获取元素高度
         * add 20241122-1
         * @param {HTML DOM} o 某个元素
         * @returns 返回该元素的宽度值
         */
        getElementHeight: function(o) {
            if (!o) return 0;
            // 获取元素的宽度，考虑元素可能被隐藏
            var styles = this.getElementStyle(o);
            var h = o.offsetHeight;
            var paddingTop = parseFloat(styles.paddingTop);
            var paddingBottom = parseFloat(styles.paddingBottom);
            var borderTop = parseFloat(styles.borderTopWidth);
            var borderBottom = parseFloat(styles.borderBottomWidth);
            // 如果元素被隐藏，宽度可能为0，此时使用内部尺寸作为参考
            if (h === 0 && !isNaN(paddingTop) && !isNaN(paddingBottom) && !isNaN(borderTop) && !isNaN(borderBottom)) {
                h = o.clientHeight;
                h += isNaN(paddingTop) ? 0 : paddingTop;
                h += isNaN(paddingBottom) ? 0 : paddingBottom;
                h += isNaN(borderTop) ? 0 : borderTop;
                h += isNaN(borderBottom) ? 0 : borderBottom;
            }
            return h;
        },
        
    };


    //================================================================
    // 返回对象
    //================================================================
    return Widget;
});




//————————————————————————————————————————————————————————————————————————————————————
//                              创建“既是函数又是对象”的实例
//————————————————————————————————————————————————————————————————————————————————————
function createNewInstace(element, config){
    // 说明：bind()就是将函数绑定到某个对象上。 例如：f.bind(obj)，实际上可以理解为 obj.f()
    // 实例化一个对像
    var context = new NBD(element, config); // context 是一个实例化的对象，只能当对象使用，不能当函数使用。
    // 创建请求函数
    var instance = NBD.prototype.init.bind(context); // instance 是一个函数，由 bind 返回的一个新函数，可以调用 instance()。
    // 将 对象原型链 prototype 对象中的方法添加到 instance 函数对象中
    // 为了实现能够将 instance 函数作为对象使用，我们就要将 对象原型链 prototype 对象中的方法添加给 instance 。毕竟函数也一个对象，也能够添加方法。
    Object.keys(NBD.prototype).forEach(function(item){
        instance[item] = NBD.prototype[item].bind(context);
    });
    // 为 instance 函数对象添加属性
    Object.keys(context).forEach(function(item){
        instance[item] = context[item];
    })
    return instance;
}

var neuiBdmap = createNewInstace();