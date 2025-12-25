/**
 * [neuiBdmap]
 * 百度地图插件 纯JS原生版 
 * 使用的百度地图API版本： JS API 2.0 或者 3.0 版本
 * Version：v1.0.1
 * 还差的功能：参数整合
 * [兼容说明]：本插件兼容 ie9及以上版本，但不兼容ie8及以下版本(本身百度地图api文件就不支持ie8及以下版本)
 * Author: Mufeng
 * QQ: 1614644937
 * Date: 2024.12.03
 * Update: 2025.12.22
 */


/**
 * 插件官网：https://github.com/yimobing/neatui
 * [百度地图开源库]
   开源库汇总：https://lbsyun.baidu.com/index.php?title=jspopular/openlibrary

  · 鼠标绘制工具条库
    库文件：http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js
    类参考：http://api.map.baidu.com/library/DrawingManager/1.4/docs/symbols/BMapLib.DrawingManager.html
    示例： https://lbsyun.baidu.com/jsdemo/demo/f0_7.htm

  ·GeoUtils类库：
    http://api.map.baidu.com/library/GeoUtils/1.2/src/GeoUtils_min.js

  · 加载检索信息窗口：
    http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js
 */


/**
 * 【关于对覆盖物的标记】
    说明：
    百度地图API中对覆盖物标记的方法有两种
    一种用 overlay.name='同一个字符串' 来标记同一个覆盖物(如多边形覆盖物)，即同一种覆盖物的 name 属性相同。name 属性也可以自定义名称为 name2, name3等
    另一种是用 overlay.identifier='一直变化的字符串' 来标记每一个覆盖物，即每一个覆盖物哪怕是同一种覆盖物，它们的 identifier 都不相同
    // eg.
    overlay.name = 'anniu_biaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
    overlay.identifier = layUid; // 添加覆盖物唯一标识符

    1. 本插件中使用 name 属性来标记相同的覆盖物，name 的值及含义如下：
    // 标记覆盖物类型,方便清除指定覆盖物时用
    duobianxing_biaoji // 多边形覆盖物 polygon
    dian_biaoji // 图像标注覆盖物(点标记覆盖物) Marker
    wenben_biaoji // 文本标注覆盖物 Label
    center_dian_biaoji // 中心点图像标注覆盖物(点标记覆盖物) Marker
    center_wenben_biaoji // 中心点文本标注覆盖物 Label
    anniu_biaoji // 按钮覆盖物。一般是显示在多边形上面的按钮
    info_biaoji // 文本信息覆盖物。一般是显示在多边形上面的文本信息

    2. 本插件中使用 identifier 属性来标记每一个覆盖，identifier 的值及含义如下
    // 添加覆盖物唯一标识符
    identity_duobianxing_1 // 每个多边形唯一标识符，后面的数字 1 表示 第1个多边形
    identity_duobianxing_1_btn // 每个多边形内部按钮唯一标识符，后面的 1_btn 表示第1个多边形内部的按钮
    identity_duobianxing_1_text //  每个多边形内部文本信息唯一标识符，后面的 1_text 表示第1个多边形内部的文本信息
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

        // 1. 地图初始化参数(前台参数)
        this.defaults = {
            // 编程语言环境(可选)。注：不同环境下地图展示与交互可能有不同,故可能需要区分下。
            environment: {
                language: '.net' // 语言类型(可选)： 默认.net。值： .net 即Csharp .aspx页面, .php即php页面
            },
            // 地图大小。width/height参数值：数值型或百分比类型(如1920, 1920px, 90%)表示具体的大小, 字符串型 auto 表示自动调整, fn 表示在setSize/onResize函数中设置。注：百分比值会转化成浏览器视窗大小*百分比值。
            width: 'auto', // 宽(可选)，默认auto
            height: 'auto', // 高(可选)，默认auto
            autoResize: true, // 窗口变化时是否自动调整地图大小(可选)，默认true
            setSize: null, // 初始化时用函数设置大小(可选)，默认null。优先权大于参数width/height/autoResize
            onResize: null, // 窗口大小变化时用函数设置大小(可选)，默认null。优先权大于参数width/height/autoResize
            // 地图缩放级别(可选)，默认11。 值：3-19
            zoom: 11,
            // 中心点(可选)
            center: {
                visible: true, // 是否显示中心点标注(可选)，默认true
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
                switchType: { // 切换地图类型(可选)
                    enable: false, // 是否开启(可选)，默认false
                    types: ['normal', 'satellite', 'hybrid'], // 配置地图类型(可选)。数组元素可添加的值: normal 普通街道视图, satellite 卫星视图, hybrid 卫星和路网的混合视图 
                    direction: '', // 位置(可选)，默认空右下角。值： topLeft 左上角, topRight 右上角, bottomLeft 左下角, bottomRight 右下角
                    offset: { // 位置偏移量(可选)
                        width: 10, // 水平方向数值(可选)，默认10
                        height: 50 // 竖直方向数值(可选)，默认50
                    }
                },
                copyright: { // 版权信息(可选)
                    enable: false, // 是否开启(可选)，默认false
                    direction: '', // 位置(可选)，默认空右下角。值： topLeft 左上角, topRight 右上角, bottomLeft 左下角, bottomRight 右下角
                    content: '', // 版权文本信息(可选)，默认空
                    offset: { // 位置偏移量(可选)
                        width: 10, // 水平方向数值(可选)，默认10
                        height: 5 // 竖直方向数值(可选)，默认5
                    }
                },
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

            // 信息窗功能(可选)
            infos: {
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
            // 隐藏节点
            hideContentNodeClassName: 'bdmap__hide_content', // 自定义隐藏节点样式名
            hideCsharpReloadBtnId: 'btn-net-reload-page', // Charp .net 环境下刷新按钮ID属性值
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
         * @param {Selector} elem 地图容器节点ID,即根节点绑定的ID属性值
         * @param {Object} options 地图初始化参数
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
        //  create 开头的函数，用于：创建地图的各种操作效果
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
            var nodeRoot = document.getElementById(container); // 根节点
            var nodeParent = nodeRoot.parentNode; // 父节点
            var nodeBody = document.getElementsByTagName('body'); // body节点
            nodeRoot.classList.add('ne-bd-map-root');
            // · 设置地图大小 (高度一定设置,不然在服务器环境如.net地图可能不显示)
            var w = me.settings.width.toString().toLocaleLowerCase().replace(/\s+/g, ''),
                h = me.settings.height.toString().toLocaleLowerCase().replace(/\s+/g, ''),
                width = parseFloat(w.replace(/(px|%|vw|vh)/g, '')),
                height = parseFloat(h.replace(/(px|%|vw|vh)/g, ''));
            if (isNaN(width)) width = 0;
            if (isNaN(height)) height = 0;
            // console.log('w：', w, '\h：', h);
            // console.log('width：', width, '\nheight：', height);
            // 函数：设置地图大小
            var fnSetMapSize = function () {
                var winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                    winH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                    left = utils.getElementLeft(nodeParent),
                    top = utils.getElementTop(nodeParent);
                // console.log('视窗宽：', winW, '\n视窗高：', winH);
                var bodyW = 0, bodyH = 0; // 内容大小
                if (nodeBody != null && nodeBody.length > 0) {
                    bodyW = utils.getElementWidth(nodeBody[0]);
                    bodyH = utils.getElementHeight(nodeBody[0]);
                    winW = winW > bodyW ? bodyW : winW;
                    winH = winH > bodyH ? bodyH : winH;
                }
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
                /**
                 * 公式：
                    地图父节点高度 = winH - top - 地图父节点(垂直方向margin总和)
                    地图容器高度 = 地图父节点高度 - 地图父节点(垂直方向padding总和) - 自身(垂直方向margin总和+padding总和)
                 */
                var selfMpbObj = helpers._getElementMarginPaddingBorder(nodeRoot),
                    fatMpbObj = helpers._getElementMarginPaddingBorder(nodeParent);
                var fatW = winW,
                    fatH = winH,
                    realW = width,
                    realH = height;
                if (w.indexOf('auto') >= 0 || w === '') {
                    fatW = winW - left - fatMpbObj["marginHorizontal"];
                    realW = fatW - fatMpbObj["paddingHorizontal"] - (selfMpbObj["marginHorizontal"] + selfMpbObj["paddingHorizontal"]);
                }
                if (h.indexOf('auto') >= 0 || h === '') {
                    fatH = winH - top - fatMpbObj["marginVertical"];
                    realH = fatH - fatMpbObj["paddingVertical"] - (selfMpbObj["marginVertical"] + selfMpbObj["paddingVertical"]);
                }
                // if (realW == 0) realW = winW;
                // if (realH == 0) realH = winH;

                // console.log('------------------------');
                // console.log('body宽：', bodyW, '\nbody高：', bodyH);
                // console.log('视窗调整后宽：', winW, '\n视窗调整后高：', winH);
                // console.log('Left：', left, '\nTop：', top);
                // console.log('地图宽：', realW, '\n地图高：', realH);
                // console.log('父节点宽：', fatW, '\n父节点高：', fatH);
                // console.log('------------------------');

                // 设置地图容器大小
                nodeRoot.setAttribute('style', 'width: ' + realW + 'px; height: ' + realH + 'px');
                // 设置地图父节点大小。分开写是为了防止父节点是body时会覆盖掉body原有样式
                // nodeParent.setAttribute('style', 'width: ' + fatW + 'px; height: ' + fatH + 'px');
                nodeParent.style.setProperty('width', fatW + 'px'); 
                nodeParent.style.setProperty('height', fatH + 'px');
            }

            // · 初始化设置地图大小
            if (w != 'fn' || h != 'fn') {
                fnSetMapSize();
            }
            // · 根据初始化及窗口大小变化的函数来设置地图大小
            if (me.settings.setSize) {
                me.settings.setSize();
            }
            if (me.settings.onResize) {
                window.onresize = function () {
                    if (me.settings.autoResize) {
                        fnSetMapSize();
                    }
                    me.settings.onResize();
                }
            }


            // · 创建创建地图实例并初始化
            var zoom = me.settings.zoom;
            var centerVisible = me.settings.center.visible,
                centerCity = me.settings.center.city == '' ? me.defaults.center.city : me.settings.center.city,
                centerCoordinate = me.settings.center.coordinate == '' ? me.defaults.center.coordinate : me.settings.center.coordinate.toString().replace(/\s+/g, ''), // 当中心点坐标为空时,设定一个默认坐标
                centerLng = centerCoordinate.split(',')[0],
                centerLat = centerCoordinate.split(',')[1],
                centerCaption = me.settings.center.caption,
                centerDescribe = me.settings.center.describe,
                centerEnableDrag = me.settings.center.enableDrag,
                centerComplete = me.settings.center.complete,
                centerDragEnd = me.settings.center.dragEnd;
        
            // 第1步 创建地图实例
            if (typeof BMap == 'undefined') {
                var tips = '请先引入百度地图Javascript API 文件！<br>按F12通过控制台查看具体错误信息';
                var errs = tips.toString().replace(/(<br>)/g, '\n');
                utils.dialogs(tips);
                console.error(errs);
                console.log('引入方法：<script type="text/javascript" src="https://api.map.baidu.com/api?v=2.0&ak=您的密钥"></script>');
                console.log('请参考：https://lbsyun.baidu.com/index.php?title=jspopular/guide/helloworld');
                return;
            }
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
            // 切换地图类型
            if (me.settings.draft.switchType.enable) {
                me.setMapType({
                    types: me.settings.draft.switchType.types,
                    direction: me.settings.draft.switchType.direction,
                    offset: me.settings.draft.switchType.offset
                });
            }
            // 添加版权信息
            if (me.settings.draft.copyright.enable) {
                me.setMapCopyright({
                    direction: me.settings.draft.copyright.direction,
                    content: me.settings.draft.copyright.content,
                    offset: me.settings.draft.copyright.offset
                });
            }
            // 个性化地图
            if (me.settings.draft.personalize.enable) {
                me.setMapFashion({
                    bases: me.settings.draft.personalize.basePaint,  // 是否使用底图模式(干净清爽)
                    styles: me.settings.draft.personalize.baseStyle // 地图风格
                });
            }
            // 添加自定义隐藏节点
            var environment = me.settings.environment;
            var language = environment.language.toString().toLocaleLowerCase();
            if (language != '') {
                var hidClassName = me.settings.hideContentNodeClassName;
                var hidNode = document.getElementsByClassName(hidClassName);
                if (hidNode == null || (hidNode != null && hidNode.length == 0)) {
                    var hidContentNode = document.createElement('div');
                    hidContentNode.className = hidClassName; // 'bdmap__hide_content';
                    hidContentNode.style.setProperty('display', 'none');
                    utils.insertAfter(hidContentNode, document.getElementById(elem));
                    if (language == '.net') {
                        var refreshHtml = [
                            '<div class="bdmap__hide_refresh">',
                                '<button type="" id="' + me.settings.hideCsharpReloadBtnId + '" style="display: none;">ASP.NET刷新页面用(type属性要放空)</button>',
                            '</div>'
                        ].join('\r\n')
                        hidContentNode.innerHTML = refreshHtml; // 创建.net环境下刷新页面的节点
                    }
                }
            }

            // 第5步，添加中心点文本标注
            if (centerVisible) {
                me.clearAllOverlay(); // 先清空所有覆盖物
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
            }
            // 鼠标右键点击事件
            mouseHelper._mouseRightClick(me, maper);
            // 鼠标左键点击事件
            mouseHelper._mouseClick(me, maper, {
                center: { 
                    title: centerCaption, 
                    describe: centerDescribe
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
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;

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
                coordinate = finals.coordinate.toString().replace(/\s+/g, ''),
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
            if (type == 'zhongxin') {
                oneMark.name2 = 'center_dian_biaoji';
            }
            maper.addOverlay(oneMark);
            me.settings.overlays.push(oneMark); // 全局赋值
            me.settings.markerLays.push(oneMark);

            // 添加文本标注和信息窗
            if (title != '') {
                // 添加文本标注
                var lbClassName = 'ne__bd_label_bdLabel';
                if (type == 'zhongxin') {
                    lbClassName += ' ne__bd_label_bdCentralLabel';
                }
                var lbText = '<div class="' + lbClassName + '">' + title + '</div>',
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
                label.enableMassClear(); // 允许覆盖物被清除
                label.name = 'wenben_biaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
                if (type == 'zhongxin') {
                    label.name2 = 'center_wenben_biaoji';
                }
                label.setStyle({
                    padding: '10px',
                    height: '30px',
                    lineHeight: '30px',
                    // backgroundColor: "#fff",
                    borderRadius: '5px',
                    borderColor: '#ccc',
                    color: 'blue',
                    fontSize: '16px',
                    fontFamily: '微软雅黑'
                });
                oneMark.setLabel(label); // 绑定文本标注到点标记上
                maper.addOverlay(label);
                // 更改文本标注节点样式及位置
                setTimeout(function () {
                    var lbNode = document.getElementsByClassName(lbClassName); // 延时一下才能取非空节点
                    if (lbNode != null && lbNode.length > 0) {
                        lbNode[0].parentNode.classList.add('ne__bd_label'); // 给父节点添加一个样式名
                        if (type == 'zhongxin') {
                            // 全局赋值2
                            me.$opts.$centerLabelNode = lbNode[0]; // 中心点文本标注节点
                        }
                    }
                    dotHelper._setLabelPositionAndSize(me, lbNode); // 调整文本标注的大小和位置
                }, 100);
            
                // 添加信息窗口
                dotHelper._addInfoWindow(me, oneMark, markPoint, {
                    title: title,
                    describe: describe,
                    message: message
                });

                // 全局赋值1
                me.settings.overlays.push(label);
                me.settings.labelLays.push(label);
            }
           
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
                    dotHelper._setLabelPositionAndSize(me, lbNode); // 调整文本标注的大小和位置
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
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var originals = {
                points: [], // 多边形经纬度坐标数组，即多边形覆盖物坐标组成的二维数组，有N个多边形数组就有N个元素。
                // 格式：
                // [
                //     [ {lng: '', lat: ''}, {lng: '', lat: ''}, {lng: '', lat: ''}, ..], // 第1个多边形的N个点
                //     [ {lng: '', lat: ''}, {lng: '', lat: ''}, {lng: '', lat: ''}, ..],// 第2个多边形的M个点
                //     [ {lng: '', lat: ''}, {lng: '', lat: ''}, {lng: '', lat: ''}, ..] // 第3个多边形的L个点
                // ];
                hideValues: [], // 多边形覆盖物标识符数组，即多边形覆盖物隐藏值组成的一维数组(可选)，默认空数组。格式：[1001, 1002, 1003]。注：当界面上对某个多边形进行操作需用到该多边形的"隐藏值ID字段"时,可把后端提供的N个多边形的"隐藏值ID字段"push到本参数数组里传递进来，界面可通过按钮中的data-bh属性取得该隐藏值。
                titles: [], // 自定义每个多边形覆盖标题即文本描述数组(可选),默认空数组。数组元素支持HTML
                titleStyle: {}, // 自定义每个多边形覆盖物标题即文本描述信息的样式(可选),默认空对象但是有默认的样式。对象内的键值写法要遵循css驼峰写法. eg. { fontSize: "14px", borderRadius: "4px"}
                bgColors: [], // 自定义每个多边形覆盖物背景色数组(可选),默认空数组。优先权大于 skinOptions.fillColor和strokeColor。格式：['#1296db', '#ff0000', '#ffffff']
                editable: true, // 多边形是否可修改形状(可选)，默认true。值为true时多边形点上将出现一个白色的小正方形可拖动改变形状。
                buttons: { // 按钮(可选)
                    enable: false,  // 是否添加操作按钮(可选)，默认false
                    text: '删除', // 操作按钮的文本，默认'删除'
                    callback: null // 回调函数(可选)，默认null。返回值e { id: '隐藏值ID字段', polyObj: "多边形覆盖物对象", polyLayId: '多边形覆盖物唯一标识符', btnLayId: '按钮覆盖物唯一标识符'}
                },
                skinOptions: { // 外观配置项(可选)。
                    fillColor: "red", // 填充颜色(可选)，默认红色。当参数为空时，圆形将没有填充效果。
                    fillOpacity: 0.65,  // 填充的透明度，取值范围0-1(可选)，默认0.65。
                    strokeWeight: 1, // 边线的宽度，以像素为单位(可选)，默认1px。
                    strokeStyle: "solid", // 边线的样式，solid或dashed(可选)，默认solid。
                    strokeColor: "red", // 边线颜色(可选)，默认红色。
                    strokeOpacity: 0.8 // 边线透明度，取值范围0-1(可选)，默认0.8。
                }
            }
            var finals = utils.combine(true, originals, options || {});
            var points = finals.points,
                hideValues = finals.hideValues,
                bgColors = finals.bgColors,
                titles = finals.titles,
                titleStyle = finals.titleStyle,
                editable = finals.editable,
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
            var newPoints = [];
            if (typeof points != 'undefined') {
                for (var i = 0; i < points.length; i++) {
                    var one = points[i];
                    for (var k = 0; k < one.length; k++) {
                        var row = one[k];
                        if (row instanceof BMap.Point == false) {
                            one[k] = new BMap.Point(row.lng, row.lat);
                        }
                    }
                    newPoints.push(one);
                }
            }
            else {
                console.error('函数' + arguments.callee.name + '()，参数options.points为undefined，请检查');
            }
            // console.log('符合要求的数组：', newPoints);

            // 创建多边形覆盖物
            var defaultBgColor =  skinOptions.fillColor; 
            for (var i = 0; i < newPoints.length; i++) {
                var onePoint = newPoints[i],
                    oneBgColor = bgColors.length == 0 ? '' : typeof bgColors[i] == 'undefined' ? '' : bgColors[i],
                    oneTitle = titles.length == 0 ? '' : typeof titles[i] == 'undefined' ? '' : titles[i],
                    ids = hideValues.length == 0 ? '' : typeof hideValues[i] == 'undefined' ? '' : hideValues[i];
                var ply = new BMap.Polygon(onePoint, skinOptions);
                try {
                    if (editable) {
                        ply.enableEditing();
                    }
                    ply.name = 'duobianxing_biaoji'; // 覆盖物分类标识符（标记覆盖物类型,方便清除指定类型的覆盖物）
                    // 自定义每个多边形的颜色
                    if (oneBgColor != '') {
                        ply.setFillColor(oneBgColor); // 设置多边形填充颜色
                        ply.setStrokeColor(oneBgColor); // 设置多边形边线颜色
                        // ply.setFillOpacity(.65); // 设置透明度. 0到1
                    }
                    // 统计多边形个数, 给覆盖物添加唯一标识符
                    var total = 1; // 统计多边形覆盖物个数
                    var polyOverlay = maper.getOverlays();
                    polyOverlay.map(function (item) {
                        if (item.name === 'duobianxing_biaoji') {
                            total++;
                        }
                    });
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

                    var coord = polygonHelper._getPolyCenter(ply),  // 获取多边形中心点
                        plyNo = ids,
                        longitude = coord.lng,
                        latitude = coord.lat;
                    // 给覆盖物添加文本信息
                    if (oneTitle != '') {
                        polygonHelper._addOverlayLabel(me, ply, {
                            longitude: longitude,
                            latitude: latitude,
                            plyUid: plyUid, // 覆盖物唯一标识符，默认空
                            plyNo: plyNo, // 覆盖物对应的编号，默认空(可选)。新增时为空
                            title: oneTitle,
                            labelStyle: titleStyle,
                            content: ''
                        });
                    }
                    // 给覆盖物添加操作按钮
                    if (buttoned) {
                        polygonHelper._addOverlayButton(me, ply, {
                            longitude: longitude,
                            latitude: latitude,
                            plyUid: plyUid, // 覆盖物唯一标识符，默认空
                            plyNo: plyNo, // 覆盖物对应的编号，默认空(可选)。新增时为空
                            btnText: btnText, // 按钮文本，默认'删除'(可选)
                            btnCallback: btnCallback // 按钮回调函数，默认null(可选)
                        });
                    }
                }
                catch (e) { }
            }
        },


        /**
         * 在地图创建一个自定义的浮层
         * @param {Object} 参数。格式见函数内代码
         */
        createFloatingLayer: function (options) {
            var me = this;
            helpers._createSomeContent(me, options);
        },








        //————————————————————————————————————————————————
        //  remove 和 clear 开头的函数，用于：清除或清空覆盖物
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 清除全部覆盖物
         */
        clearAllOverlay: function(){
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
         * 清除中心点标记覆盖物
         */
        clearCenterOverlay: function () {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var allOverlay = maper.getOverlays();
            allOverlay.map(function(item){
                if(item.name2 === 'center_dian_biaoji'){
                    maper.removeOverlay(item);
                }
                if(item.name2 === 'center_wenben_biaoji'){
                    maper.removeOverlay(item);
                }
            })
        },

         
         
        //————————————————————————————————————————————————
        /**
         * 清除全部点标记覆盖物
         */
        clearAllMarkOverlay: function () {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
         * @param {Array} ps_uid_arr 要删除的覆盖唯一标识组成的数组。当前多边形覆盖物及内部的子覆盖物(如按钮)唯一标识符组成的数组。eg. ['当前多边形覆盖物的唯一标识符', '内部按钮覆盖物的唯一标识']
         */
         removeOnePolyOverlay: function (ps_uid_arr) {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
        //  get 开头的函数，用于：获取地图各种对象及数据
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 获取地图实例化对象
         * @returns {Object} 返回地图实例化对象。值为null表示还未实例化
         */
         getMap: function(){
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            return me.$opts.$maper;
        },

        /**
         * 获取地图当前缩放级别
         * @returns {Number} 返回缩放级别
         */
        getZoom: function () {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            return maper.getZoom();
        },

        /**
         * 获取地图当前中心点
         * @returns {Point} 返回中心点地理坐标点
         */
        getCenter: function () {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            return me.$opts.$centerMarker;
        }, 


        /**
         * 获取地图中心点标记文本标注节点
         * @returns {HTML Dom} 返回中心点文本标节点
         */
        getCenterLabelNode: function () {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            return me.$opts.$centerLabelNode;
        },


        /**
         * 获取国内某个城市的坐标/根据城市获取坐标
         * @param {String} ps_city 城市名称.eg. '北京市'
         * @returns {Function} callback 回调函数。返回值需在回调函数function(e){}中获取。e 为Object类型时表该城市所在的地理坐标点，为String类型时表示没找到该城市
         * [调用示例]
            neuiBdmap.getPointByCity('泉州市', function(point){
                console.log('坐标点：', point); // 格式： K {lng: 118.682446, lat: 24.879952, pf: 'inner'}
            });
         */
        getPointByCity: function (ps_city, callback) {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
           
            var geoc = new BMap.Geocoder(); // 创建地理编码实例
            // 回调函数，用于处理地理编码请求后的结果
            geoc.getPoint(ps_city, function(point) {
                if (point) 
                    callback(point);
                else 
                    callback('未能找到该城市');
            }, "中国"); // 第三个参数为城市所在的Country或Region
        },


        
        /**
         * 获取一组坐标的中心点/根据坐标获取中心点坐标
         * @param {Array} ps_coord_arr 坐标数组，是一个包含多个坐标的数组，每个坐标是一个Point对象或者是一个包含经度和纬度的对象。格式 [{ lng: 118.602675, lat: 24.917578 }, { lng: 118.61906, lat: 24.904994 }, { lng: 118.609143, lat: 24.897783 }, // ... 更多坐标 ];
         * @returns 返回该组坐标的中心点坐标，值是由经纬度组成的对象。格式：{ lng: "经度(有可能空)", lat: "纬度(有可能空)" }
         */
        getCoordinateCenter: function (ps_coord_arr) {
            if (!Array.isArray(ps_coord_arr) || ps_coord_arr.length == 0) {
                return {
                    lng: '',
                    lat: ''
                }
            }
            // 累加所有坐标点
            var x = 0, y = 0;
            for (var i = 0; i < ps_coord_arr.length; i++) {
                x += parseFloat(ps_coord_arr[i].lng);
                y += parseFloat(ps_coord_arr[i].lat);
            }
            // 计算平均值以获取中心点并返回
            var digit = 6; // 保留的小数位数
            return{ 
                lng: parseFloat(x / ps_coord_arr.length).toFixed(digit),
                lat: parseFloat(y / ps_coord_arr.length).toFixed(digit)
            }
        },



        //————————————————————————————————————————————————
        /**
         * 获取所有多边形坐标数据
         * @returns {Array} 返回所有多边形(假设有N个)经纬度坐标字符串组成的二维数组
         * 返回值格式：
            [
                ['118.599547,24.9246154', '118.607812,24.9197654', '118.594948,24.91308'], // 第2个多边形
                ['118.602206,24.914588', '118.612986,24.912294', '118.606302,24.906198'],  // 第2个多边形
            ]
         */
        getPolyCoordinateData: function () {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
                coordArr.push(helpers._converCoordinateArray2StringArray(arr[i]));
            }
            // console.log('coordArr：', coordArr);
            return coordArr;
        },



        //————————————————————————————————————————————————
        /**
         * 获取最后一个多边形覆盖物的经纬度信息 (该函数仅内部测试用) test2
         */
        getLastPolyOverLay: function () {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            // var box = me.settings.myPolygon ? me.settings.myPolygon : me.settings.overlays[me.settings.overlays.length - 1];
            var box = me.settings.overlays.length == 0 ? me.settings.myPolygon : me.settings.overlays[me.settings.overlays.length - 1];
            // var coordinateArr = typeof box == 'undefined' ? [] : typeof box.Ao == 'undefined' ? [] : box.Ao;
            var coordinateArr = typeof box == 'undefined' ? [] : box.getPath();
            // console.log('box:', box)
            // console.log('最后一个覆盖物信息：', coordinateArr);
        },





        //————————————————————————————————————————————————
        //  set 开头的函数，用于：设置或重置地图数据
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 设置中心点标记的标题
         * @param {HTML|String} ps_content 标题内容。支持HTML
         */
        setCenterPointLabelTitle: function (ps_content) {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var node = document.getElementsByClassName('ne__bd_label_bdCentralLabel');
            if (node != null && node.length > 0) {
                // var reg = /.*<[^>]+>.*/; // 验证是有标签
                node[0].innerHTML = ps_content;
                dotHelper._setLabelPositionAndSize(me, node); // 调整文本标注的大小和位置
            }
        },



        /**
         * 设置地图中心点
         * !!!警告：请勿在地图初始化参数center.complete函数中调用本函数setMapCenter()，否则会陷入死循环导致页面崩溃！
         * @param {String} ps_coord_or_city 经纬度坐标或城市名.eg. '116.183501,40.030609' 或 '北京市'
         * @param {Object} options 其它参数。参见函数内代码
         */
        setMapCenter: function(ps_coord_or_city, options) {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var originals = {
                zoom: -1, // 缩放级别(可选)，默认-1。值不是3到19之间的整数时会自动缩放到合适的级别
                title: ps_coord_or_city, // 标题(可选)，默认为经纬度坐标或城市名。支持HTML
                describe: '' // 描述信息(可选)，默认空。支持HTML
            }
            var finals = utils.combine(true, originals, options || {});
            var zoom = finals.zoom,
                title = finals.title,
                describe = finals.describe;
            
            // 先清空中心点标记覆盖物
            me.clearCenterOverlay();
            // 再创建中心点标记
            var coordCity = ps_coord_or_city;
            if (helpers._examineStringIsCoordinate(coordCity)) {
                // 根据坐标设置中心点
                var arr = coordCity.toString().replace(/\s+/g, '').split(','),
                    lng = arr[0], lat = arr[1];
                    point = new BMap.Point(lng, lat),
                    coordinate = lng + ',' + lat;
                maper.setCenter(point); // 设置中心点坐标
                fnReCreateCenterAndDoneEvent(coordinate); // 重建中心点标记并执行一系列事件
            }
            else {
                // 根据城市设置中心点
                if (coordCity.toString().replace(/\s+/g, '') !== '') {
                    maper.setCenter(coordCity); // 设置中心点城市
                    // 获取城市对应的坐标
                    me.getPointByCity(coordCity, function (e) {
                        if (typeof e == 'object') {
                            var coordinate = e.lng + ',' + e.lat;
                            // console.log('坐标：', coordinate); // 118.682446,24.879952
                            fnReCreateCenterAndDoneEvent(coordinate); // 重建中心点标记并执行一系列事件
                        }
                    });
                }
            }

            // 设置缩放级别
            if (typeof zoom != 'undefined' && helpers._examineZoomIsValid(zoom)) {
                // console.log('缩放级别：', zoom);
                maper.setZoom(parseInt(zoom));
            }
           

            /**
             * 重建中心点标记并执行一系列事件
             * @param {String} ps_coordinate 中心点地理坐标。eg. '经度,纬度'
             */
            function fnReCreateCenterAndDoneEvent(ps_coordinate) {
                // 添加中心点标注
                me.createMarker({
                    type: 'zhongxin',
                    coordinate: ps_coordinate,
                    title: title,
                    describe: describe,
                    message: '',
                    dragable: me.settings.center.enableDrag,
                    finishCallback: me.settings.center.complete,
                    dragEndCallback: me.settings.center.dragEnd
                });
                // 鼠标右键点击事件
                mouseHelper._mouseRightClick(me, maper);
                // 鼠标左键点击事件
                mouseHelper._mouseClick(me, maper, {
                    center: { 
                        title: coordCity, 
                        describe: ''
                    }
                });
            }
        },

         
         
        /**
         * 设置/切换地图类型
         * @param {Object} options 参数。参见函数内代码
         */
        setMapType: function (options) {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var originals = {
                types: ['normal', 'satellite'], // 配置地图类型(可选)。数组元素可添加的值: normal 普通街道视图, satellite 卫星视图, hybrid 卫星和路网的混合视图 
                direction: '', // 位置(可选)，默认空右下角。值： topLeft 左上角, topRight 右上角, bottomLeft 左下角, bottomRight 右下角
                offset: { // 位置偏移量(可选)
                    width: 10, // 水平方向数值(可选)，默认10
                    height: 50 // 竖直方向数值(可选)，默认50
                }
            }
            var finals = utils.combine(true, originals, options || {});
            var typeArr = finals.types,
                direction = finals.direction.toString().toLocaleLowerCase(),
                offset = finals.offset;
            // 组成要的值
            var dTypes = [];
            for (var i = 0; i < typeArr.length; i++) {
                var value = typeArr[i].toString().toLocaleLowerCase();
                var oneType = helpers._getMapType(value);
                if (oneType != '') dTypes.push(oneType);
            }
            // console.log('地图类型：', dTypes);
            if (direction.replace(/\s+/g, '') === '') direction = 'bottomRight';
            var anchor = helpers._getControlAnchor(direction);
            // 切换地图类型
            var dOffW = isNaN(parseFloat(offset.width)) ? originals.offset.width : parseFloat(offset.width),
                dOffH = isNaN(parseFloat(offset.height)) ? originals.offset.height : parseFloat(offset.height);
            var mtype1 = new BMap.MapTypeControl({
                mapTypes: dTypes,
                anchor: anchor,
                offset: new BMap.Size(dOffW, dOffH) // 偏移量
            });
            maper.addControl(mtype1);
            // 地图、卫星、三维（相当于地图、混合、三维) 有问题，不能用
           /*  var city = '泉州市'; // me.settings.city;
            var mtype2 = new BMap.MapTypeControl({
                anchor: anchor,
                offset: new BMap.Size(10, 50)
            });
            maper.addControl(mtype2);
            maper.setCurrentCity(city); //由于有3D图，需要设置城市哦 */
        },


        /**
         * 设置/添加地图版权信息
         * @param {Object} options 参数对象
         */
        setMapCopyright: function (options) {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var originals = {
                direction: '', // 位置(可选)，默认空表示右下角。值： topLeft 左上角, topRight 右上角, bottomLeft 左下角, bottomRight 右下角
                content: '', // 版权文本信息(可选)，默认空
                offset: { // 位置偏移量(可选)
                    width: 10, // 水平方向数值(可选)，默认10
                    height: 5 // 竖直方向数值(可选)，默认5
                }
            }
            var finals = utils.combine(true, originals, options || {});
            var direction = finals.direction.toString().toLocaleLowerCase(),
                content = finals.content,
                offset = finals.offset;
            // console.log('版权内容：', content);
            // 组成要的值
            if (direction.replace(/\s+/g, '') === '') direction = 'bottomRight';
            var anchor = helpers._getControlAnchor(direction);
            // 添加版权信息
            var dOffW = isNaN(parseFloat(offset.width)) ? originals.offset.width : parseFloat(offset.width),
                dOffH = isNaN(parseFloat(offset.height)) ? originals.offset.height : parseFloat(offset.height);
            var cr = new BMap.CopyrightControl({
                anchor: anchor,
                offset: new BMap.Size(dOffW, dOffH)
            })
            maper.addControl(cr); //添加版权控件
            var bs = maper.getBounds(); // 地图可视区域
            cr.addCopyright({
                id: 1002, // 默认百度地图有一个版权，id为1，故这里要设置非1的其它值
                bounds: bs,
                content: '<div class="ne__bd_copyright">' + content + '</div>',
            }); 
        },



        /**
         * 设置地图样式、个性化地图
         * @param {object} opts 参数对象
         * [参考] https://lbs.baidu.com/index.php?title=open/custom
         */
        setMapFashion: function(options){
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
                    style: style // 设置地图底图样式
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



        /**
         * 设置某个行政区边界(地点定位功能)
         * 即：创建省、直辖市、地级市、或区县的行政边界
         * @param {String} name 行政区域名称,一般是省、直辖市、地级市、或区县的名称。eg. 福建省, 泉州市, 丰泽区
         * @param {Function} callback 回调函数(可选)。数据以回调函数的参数形式返回。返回值e格式：{ coords: "边界经纬度标数组,用于创建边界(N个多边形)", geos: "边界地理坐标数组,用于调整地图视野" }
        */
        setRegionBoundary: function(name, callback){
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            // 查询行政区域的边界
            var bdary = new BMap.Boundary(); // 创建行政区域搜索的对象实例
            bdary.get(name, function (rs) {
                // console.log('rs：', rs);
                var coordinateArr = [], // 边界经纬度坐标数组，二维数组。用于创建N个多边形
                    geoPointArr = []; // 边界地理坐标数组，一维数组。用于调整地图视野
                var count = rs.boundaries.length; // 行政区域的点有多少个
                for (var i = 0; i < count; i++) {
                    var boundaryStr = rs.boundaries[i];
                    // console.log('坐标字符串：', boundaryStr);
                    var oneRegion = [];
                    var tempArr = boundaryStr.split(';');
                    for (var k = 0; k < tempArr.length; k++){
                        var oneStr = tempArr[k].toString().replace(/\s+/g, '');
                        var oneArr = oneStr.split(',');
                        var lng = oneArr[0], lat = oneArr[1];
                        oneRegion.push({
                            lng: lng,
                            lat: lat
                        });
                        geoPointArr.push(new BMap.Point(lng, lat));
                    }
                    coordinateArr.push(oneRegion);
                }
                // console.log('行政区域边界经纬度标数组：', coordinateArr);
                // console.log('行政区域边界地理坐标数组：', geoPointArr);
                // 创建行政区域边界
                if (coordinateArr.length > 0) {
                    // 最大的那个多边形行政区域才添加文本信息
                    var titleArr = [];
                    var defaultIndex = 0;
                    var maxLen = coordinateArr[defaultIndex].length;
                    var maxIndex = defaultIndex;
                    for (var i = defaultIndex + 1; i < coordinateArr.length; i++) {
                        var nowLen = coordinateArr[i].length;
                        if (nowLen > maxLen) {
                            maxIndex = i;
                            maxLen = nowLen;
                        }
                    }
                    // console.log('maxLenIndex：', maxIndex);
                    for (var i = 0; i < coordinateArr.length; i++) {
                        var txt = maxIndex == i ? name : '';
                        titleArr.push(txt);
                    }
                    me.clearAllOverlay(); // 清除全部覆盖物
                    // 创建行政区域边界
                    me.createPolygonOverlays({
                        points: coordinateArr,
                        titles: titleArr,
                        titleStyle: {
                            backgroundColor: "#fff",
                            border: "0",
                            borderRadius: "20px",
                            color: "#0064fc", // "#5a5d63",
                            fontSize: "28px",
                            fontWeight: "550",
                            boxShadow: "none",
                            opacity: .75,
                            filter: "alpha(opacity=75)",
                            filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=75)"
                        },
                        editable: false,
                        skinOptions: {
                            fillColor: "#fff",
                            fillOpacity: .3,
                            strokeWeight: 2,
                            strokeStyle: "dashed",
                            strokeColor: "#0064fc",
                            strokeOpacity: 1
                        }
                    });
                }
                else {
                    utils.dialogs('抱歉，没有找到对应的地点边界1');
                }

                // 根据坐标自动调整地图视野
                if (geoPointArr.length > 0) {
                    maper.setViewport(geoPointArr);
                }
                // 回调
                if (callback) {
                    callback({
                        coords: coordinateArr, // 边界经纬度标数组,用于创建边界(N个多边形)
                        geos: geoPointArr // 边界地理坐标数组,用于调整地图视野
                    });
                }
            });
        },



        /**
         * 设置某个地点的边界(地点定位功能)
         * 即：使用本地检索方法获取某个地点的边界
         * @param {String} name 地点名称，一般是小地名,比如某个小区、学校、商场等
         * @param {Function} callback 回调函数(可选)。数据以回调函数的参数形式返回。返回值e格式：{ coords: "边界经纬度标数组,用于创建边界(N个多边形)", geos: "边界地理坐标数组,用于调整地图视野" }
         */
        setLocationBoundary: function (name, callback) {
            var me = this;
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            // 使用本地检索方法获取某个地点的边界
            var local = new BMap.LocalSearch(maper, {
                renderOptions: {
                    map: maper
                }
            });
            var fnName = arguments.callee.name.toString();
            // 设置添加标注后的回调函数。参数： pois: Array ，通过marker属性可得到其对应的标注
            local.setMarkersSetCallback(function (pois) {
                // console.log('pois：', pois);
                me.clearAllOverlay(); // 清除全部覆盖物
                // // 创建标注点
                // for (var i = 0; i < pois.length; i++) {
                //     var onePois = pois[i];
                //     var point = onePois.point;
                //     var lng = point.lng, lat = point.lat;
                //     var marker = new BMap.Marker(point);
                // }
                // 根据获取到的poi id，查询边界坐标集合并画多边形
                var uid = pois.length > 0 && typeof pois[0].uid != 'undefined' ? pois[0].uid : '';
                if (typeof jQuery == 'undefined') {
                    var F12Info = '<br>按F12通过控制台查看具体错误信息';
                    var tips = '提醒：函数' + fnName + '()需jQuery库文件的支持<br>请先引入jq文件<br>可从以下网址合适版本的jquery文本<br>https://www.bootcdn.cn/jquery/' + F12Info;
                    var errs = tips.toString().replace(/(<br>)/g, '\n');
                    utils.dialogs(tips);
                    console.error(errs)
                    return;
                }
                fnQueryUid(uid, callback);
            });
            // 根据检索词发起检索
            local.search(name);
            // me.clearAllOverlay(); // 清除全部覆盖物

            // 子函数：百度地图获取根据POI(感兴趣点)区域边界
            // @param {String|Number} uid 
            function fnQueryUid(uid, callsBack) {
                $.ajax({
                    async: false,
                    url: "http://map.baidu.com/?pcevaname=pc4.1&qt=ext&ext_ver=new&l=12&uid=" + uid,
                    dataType: "jsonp", // jsonp用于解决主流浏览器的跨域数据访问的问题
                    jsonp: "callback", //传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为 callback
                    timeout: 3000,
                    success: function (res) {
                        var content = res.content;
                        // console.log('content：', content);
                        var coordinateArr = [], // 边界经纬度坐标数组，二维数组。用于创建N个多边形
                            geoPointArr = []; // 边界地理坐标数组，一维数组。用于调整地图视野
                        // 创建地点边界
                        if (null != content.geo && content.geo != undefined) { // 有找到地点
                            var geo = content.geo;
                            var result = helpers._convertGeoString2Points(geo);
                            coordinateArr = result.locates;
                            geoPointArr = result.geos;
                            // console.log('geo：', geo);
                            // console.log('经纬度坐标数组', coordinateArr);
                            // console.log('地理坐标数组：', geoPointArr);
                            var titleArr = [];
                            for (var i = 0; i < coordinateArr.length; i++){
                                titleArr.push(name);
                            }
                            // 创建地点边界
                            me.createPolygonOverlays({
                                points: coordinateArr,
                                titles: titleArr,
                                titleStyle: {
                                    backgroundColor: "#fff",
                                    border: "0",
                                    borderRadius: "20px",
                                    color: "#0064fc", // "#5a5d63",
                                    fontSize: "28px",
                                    fontWeight: "550",
                                    boxShadow: "none",
                                    opacity: .75,
                                    filter: "alpha(opacity=75)",
                                    filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=75)"
                                },
                                editable: false,
                                skinOptions: {
                                    fillColor: "#fff",
                                    fillOpacity: .3,
                                    strokeWeight: 2,
                                    strokeStyle: "solid",
                                    strokeColor: "#0064fc",
                                    strokeOpacity: 1
                                }
                            });
                        }
                        else { // 没找到地点
                            utils.dialogs('抱歉，没有找到对应的地点边界2');
                        }

                        // 根据坐标自动调整地图视野
                        if (geoPointArr.length > 0) {
                            maper.setViewport(geoPointArr);
                        }
                        // 回调
                        if (callsBack) {
                            callsBack({
                                coords: coordinateArr, // 边界经纬度标数组,用于创建边界(N个多边形)
                                geos: geoPointArr // 边界地理坐标数组,用于调整地图视野
                            });
                        }
                    }
                });
            }
        },






        
        //————————————————————————————————————————————————
        //          check 开头的函数为校验函数
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 校验经纬度坐标是否有效
         * @param {String} ps_str 一个字符串或经纬度字符串。 eg. '经度,纬度'
         * @returns {Boolean} 返回布尔值true or false
         */
        checkCoordinateIsValid: function (ps_str) {
            return helpers._examineStringIsCoordinate(ps_str);
        },


        /**
         * 校验地图缩放级别是否有效(是否在3到19之间)
         * @param {Number} ps_str 地图缩放级别。数值类型, 值3到19
         * @returns {Boolean} 返回布尔值true or false
         */
        checkZoomIsValid: function(ps_str){
            return helpers._examineZoomIsValid(ps_str);
        },




         
        //————————————————————————————————————————————————
        //          其它操作函数
        //————————————————————————————————————————————————
        //————————————————————————————————————————————————
        /**
         * 刷新页面数据、重载页面(Csharp .net 环境下使用)
         * .net环境下可用此函数取代 window.location.reload(); 
         * @param {Boolean} ps_is_net 是否.net环境(可选)，默认true。值为false时将使用 window.location.reload() 进行页面重载操作重载
         */
        reloadPageWhenCsharp: function (ps_is_net) {
            var me = this;
            var isNetEnVironment = typeof ps_is_net == 'undefined' ? true : (ps_is_net === false ? false : true);
            // 普通页面时
            if (!isNetEnVironment) {
                window.location.reload(); // 重载页面
            }
            else {
                // .net的.aspx页面时，使用隐藏按钮 .click() 的刷新方式，可以解决页面重载的诸多问题
                var node = document.getElementById(me.settings.hideCsharpReloadBtnId);
                if (node == null) {
                    var tips = '提醒：调用函数' + arguments.callee.name + '()之前需先设置地图初始化参数 environment.language的值为".net"';
                    console.error(tips);
                    setTimeout(function() {
                        utils.dialogs(tips);
                    }, 100);
                    
                    return;
                }
                node.click(); // ASP.NET中 使用这个
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
         * @param {Object} me 当前插件对象
         * @param {String} fnName 某个函数名。用函数内可使用  arguments.callee.name 来获取函数名
         * @returns {Boolean} 返回布尔值true或false。
         */
        _examineIsInstantiate: function (me, fnName) {
            var F12Info = '<br>按F12通过控制台查看具体错误信息';
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
         * 校验一个字符串是否为经纬度坐标
         * @param {String} ps_str 一个字符串或经纬度字符串。 eg. '经度,纬度'
         * @returns {Boolean} 返回布尔值true or false
         */
        _examineStringIsCoordinate: function (ps_str) {
            if (typeof ps_str == 'undefined') return false;
            // var reg = /^\d+(\.\d+)?,\d+(\.\d+)?$/; // 验证一个字符串是否为经纬度坐标。不允许有空格
            var reg = /^(\s+)?\d+(\.\d+)?(\s+)?,(\s+)?\d+(\.\d+)?(\s+)?$/; // 验证一个字符串是否为经纬度坐标。允许逗号前后有空格，经度前及纬度后有空格
            return reg.test(ps_str) ? true : false;
        },


        /**
         * 校验地图缩放级别是否有效，即是否在3到19之间
         * @param {Number} ps_str 数值型字符串
         * @returns {Boolean} 返回布尔值true or false
         */
        _examineZoomIsValid: function (ps_str) {
            var reg = /^[3-9]$|^1[0-9]$/; // 3到9的任意数字或者以1开头后面跟着0到9的任意数字
            return reg.test(ps_str) ? true : false;
        },


        /**
         * 将经纬度坐标数组转化成字符串数组
         * @param {array} ps_coord_arr 经纬度坐标数组. eg. [{lng:"116.387112", lat:"39.920977"}, {lng:"116.387112", lat:"39.920977"}]
         * @returns {array} 返回字符串数组. eg. ["116.387112,39.920977", "116.387112,39.920977"]
         */
        _converCoordinateArray2StringArray: function(ps_coord_arr){
            var strArr = []
            for(var i = 0; i < ps_coord_arr.length; i++){
                strArr.push(ps_coord_arr[i].lng + "," + ps_coord_arr[i].lat);
            }
            return strArr;
        },


        /**
         * 获取地图控件的定位方式
         * @param {String} ps_value_str 控件位置。值：topLeft 左上角, topRight 右上角, bottomLeft 左下角, bottomRight 右下角
         * @returns {ControlAnchor} 返回百度地图控件的定位方式值
         */
        _getControlAnchor: function (ps_value_str) {
            var anchor = BMAP_ANCHOR_BOTTOM_RIGHT;
            if (ps_value_str == 'topleft') anchor = BMAP_ANCHOR_TOP_LEFT; // 地图的左上角
            if (ps_value_str == 'topright') anchor = BMAP_ANCHOR_TOP_RIGHT; // 地图的右上角
            if (ps_value_str == 'bottomleft') anchor = BMAP_ANCHOR_BOTTOM_LEFT; // 地图的左下角
            if (ps_value_str == 'bottomright') anchor = BMAP_ANCHOR_BOTTOM_RIGHT; // 地图的右下角
            return anchor;
        },


        /**
         * 获取地图的类型
         * @param {String} ps_value_str 地图类型。值： normal 普通街道视图, satellite 卫星视图, hybrid 卫星和路网的混合视图 
         * @returns {MapType} 返回地图类型值
         */
        _getMapType: function (ps_value_str) {
            var tmp_value = BMAP_NORMAL_MAP;
            if (ps_value_str == 'normal') tmp_value = BMAP_NORMAL_MAP; // 普通街道视图
            if (ps_value_str == 'satellite') tmp_value = BMAP_SATELLITE_MAP; // 卫星视图
            if (ps_value_str == 'hybrid') tmp_value = BMAP_HYBRID_MAP; // 卫星和路网的混合视图
            return tmp_value;
        },



        /**
         * 获取某个元素的margin,padding值
         * @param {HTMLElement} o HTML节点元素
         * @returns {Object} 返回margin和padding的参数对象
         */
         _getElementMarginPaddingBorder: function (o) {
            var style = utils.getElementStyle(o);
            var mt = parseFloat(style.marginTop.toString().replace(/px/g, '')),
                mb = parseFloat(style.marginBottom.toString().replace(/px/g, '')),
                ml = parseFloat(style.marginLeft.toString().replace(/px/g, '')),
                mr = parseFloat(style.marginRight.toString().replace(/px/g, '')),
                pt = parseFloat(style.paddingTop.toString().replace(/px/g, '')),
                pb = parseFloat(style.paddingBottom.toString().replace(/px/g, '')),
                pl = parseFloat(style.paddingLeft.toString().replace(/px/g, '')),
                pr = parseFloat(style.paddingRight.toString().replace(/px/g, ''));
            var bt = parseFloat(style.borderTopWidth.toString().replace(/px/g, '')),
                bb = parseFloat(style.borderBottomWidth.toString().replace(/px/g, '')),
                bl = parseFloat(style.borderLeftWidth.toString().replace(/px/g, '')),
                br = parseFloat(style.borderRightWidth.toString().replace(/px/g, ''));
            if (isNaN(mt)) mt = 0;
            if (isNaN(mb)) mb = 0;
            if (isNaN(ml)) ml = 0;
            if (isNaN(mr)) mr = 0;
            if (isNaN(pt)) pt = 0;
            if (isNaN(pb)) pb = 0;
            if (isNaN(pl)) pl = 0;
            if (isNaN(pr)) pr = 0;

            if (isNaN(bt)) bt = 0;
            if (isNaN(bb)) bb = 0;
            if (isNaN(bl)) bl = 0;
            if (isNaN(br)) br = 0;

            return {
                marginTop: mt,
                marginBottom: mb,
                marginLeft: ml,
                marginRight: mr,
                paddingTop: pt,
                paddingBottom: pb,
                paddingLeft: pl,
                paddingRight: pr,
                borderTop: bt,
                borderBottom: bb,
                borderLeft: bl,
                borderRight: br,
                // 汇总1
                marginHorizontal: ml + mr, // 水平方向上的margin值
                marginVertical: mt + mb, // 垂直方向上的margin值
                paddingHorizontal: pl + pr, // 水平方向上的padding值
                paddingVertical: pt + pb, // 垂直方向上的padding值
                
                // 汇总2
                borderHorizontal: bt + bb,  // 水平方向上的border值
                borderVertical: bl + br // 垂直方向上的border值   
            }
        },


        /**
         * 在地图上创建一些自定义的内容
         * @param {Object} me 当前插件对象
         * @param {Object} 参数。格式见函数内代码
         */
        _createSomeContent: function (me, options) {
            var originals = {
                extClass: "", // 自定义内容节点样式名(可选)，默认空
                position: "absolute", // 定位方式(可选)，默认absolute。值：fixed 固定定位, absolute 绝对定位
                zIndex: 1, // 层级(可选)，默认1
                top: 50, // 顶部偏移量(可选)，默认50。值为auto时表示不起作用
                right: 25, // 右侧偏移量(可选)，默认25。值为auto时表示不起作用
                left: "auto", // 左侧偏移量(可选)，默认auto表示不起作用
                bottom: "auto", // 底部偏移量(可选)，默认auto表示不起作用
                opacity: 0.9, // 透明度(可选)，默认0.9。值：0到1
                title: "", // 标题(可选)，默认空
                content: "" // 内容(可选)，默认空。支持HTML
            }
            var finals = utils.combine(true, originals, options || {});
            //
            var extClass = finals.extClass.toString().replace(/(\#|\.|\s+)/g, ''),
                position = finals.position,
                zIndex = finals.zIndex,
                top = finals.top.toString().replace(/(px||vm|vw|vh|em|rem)/g, ''),
                right = finals.right.toString().replace(/(px||vm|vw|vh|em|rem)/g, ''),
                left = finals.left.toString().replace(/(px||vm|vw|vh|em|rem)/g, ''),
                bottom = finals.bottom.toString().replace(/(px||vm|vw|vh|em|rem)/g, ''),
                opacity = isNaN(parseFloat(finals.opacity)) ? 0.9 : parseFloat(finals.opacity),
                title = finals.title,
                content = finals.content;
            if (isNaN(parseInt(zIndex))) zIndex = originals.zIndex;
            if (isNaN(parseFloat(top))) top = originals.top;
            if (isNaN(parseFloat(right))) right = originals.right;
            if (isNaN(parseFloat(left))) left = originals.left;
            if (isNaN(parseFloat(bottom))) bottom = originals.bottom;
            if (opacity > 1) opacity = parseFloat(opacity / 100).toFixed(1);
            var opacityPercent = (opacity * 100).toFixed(0);
            // 利用Object对象将样式对象转化成样式字符串
            var styleObj = {
                position: position,
                "z-index": zIndex,
                top: top == 'auto' ? top : top + 'px',
                right: right == 'auto' ? right : right + 'px',
                left: left == 'auto' ? left : left + 'px',
                bottom: bottom == 'auto' ? bottom : bottom + 'px',
                opacity: opacity,
                filter: 'alpha(opacity=' + opacityPercent + ')',
                filterProgid: 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacityPercent + ')'
            }
            var styleStr = '';
            for (var v in styleObj) {
                var keys = v.toString() == 'filterProgid' ? 'filter' : v;
                styleStr += keys + ': ' + styleObj[v] + '; ' // eg. 'position: fixed;'
            }
            styleStr = styleStr.toString().substring(0, styleStr.length - 2); // 去掉最后一个分号
            // console.log('styleStr：', styleStr);
            // 创建说明性节点
            var statementClass = 'bdmap__mouse';
            var extMouseClass = extClass === '' ? '' : ' ' + extClass,
                extTitleClass = extClass === '' ? '' : ' ' + (extClass + '_title'),
                extStepClass = extClass === '' ? '' : ' ' + (extClass + '_content');
            var mouseClassName = statementClass + extMouseClass,
                titleClassName = statementClass + '_title' + extTitleClass,
                stepClassName = statementClass + '_content' + extStepClass;
            var shuoHtml = [
                (function () {
                    var tmpHtml = title.toString().replace(/\s+/g, '') === '' ?
                        ''
                        :
                        '<div class="' + titleClassName + '">' + title + '</div>';
                    return tmpHtml;
                })(),
                (function () {
                    var tmpHtml = content.toString().replace(/\s+/g, '') === '' ?
                        ''
                        :
                        '<div class="' + stepClassName + '">' + content + '</div>'
                    return tmpHtml;
                })()
            ].join('\r\n');

            // 先移除：如果存在，则先移除
            var nodeCollection = document.getElementsByClassName(statementClass);
            if (nodeCollection.length > 0) {
                var nodeToRemove = nodeCollection[0];
                var nodeParent = nodeToRemove.parentNode;
                if (nodeParent != null) {
                    nodeParent.removeChild(nodeToRemove);
                }
            }
            // 再创建
            var shuoDiv = document.createElement('div');
            shuoDiv.className = mouseClassName;
            shuoDiv.innerHTML = shuoHtml;
            shuoDiv.setAttribute('style', styleStr);
            utils.insertAfter(shuoDiv, document.getElementById(me.$opts.$container));
            // 区域显示或隐藏
            var titleCollection = document.getElementsByClassName(titleClassName),
                listCollection = document.getElementsByClassName(stepClassName);
            if (titleCollection.length > 0 && listCollection.length > 0) {
                var titleDom = titleCollection[0],
                    listDom = listCollection[0];
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
        },



        /**
         * 坐标转换：将编码过的多边形geo地理坐标字符串转化成地理坐标数组
         * @param {String} ps_geo_str 编码过的多边形geo地理坐标字符串
         * @returns {Object} 返回值为一个对象。格式：{ locates: "边界经纬度标数组,用于创建地点边界(N个多边形)", geos: "边界地理坐标数组,用于调整地图视野" }
         */
        _convertGeoString2Points: function(ps_geo_str) {
            // console.log(coordinate);
            var locateCoordinateArr = [], // 地点边界经纬度坐标数组，二维数组。用于创建N个多边形
                geoPointArr = []; // 地点边界地理坐标数组，一维数组。用于调整地图视野
            var pointStr = '';
            if (ps_geo_str) {
                var projection = BMAP_NORMAL_MAP.getProjection(); // 返回地图类型所使用的投影实例
                if (ps_geo_str && ps_geo_str.indexOf("-") >= 0) {
                    ps_geo_str = ps_geo_str.split('-');
                }
                // 取点集合
                var tempCoArr = ps_geo_str[1];
                if (tempCoArr && tempCoArr.indexOf(",") >= 0) {
                    tempCoArr = tempCoArr.replace(";", "").split(",");
                }
                // 分割点，两个一组，组成百度米制坐标
                var tempCoordArr = [];
                for (var i = 0, len = tempCoArr.length; i < len; i++) {
                    var obj = new Object();
                    obj.lng = tempCoArr[i];
                    obj.lat = tempCoArr[i + 1];
                    tempCoordArr.push(obj);
                    i++;
                }
                // 遍历米制坐标，转换为经纬度
                var oneLocateArr = [];
                for (var i = 0, len = tempCoordArr.length; i < len; i++) {
                    var pos = tempCoordArr[i];
                    var point = projection.pointToLngLat(new BMap.Pixel(pos.lng, pos.lat));
                    var pStr = [point.lng, point.lat].toString(); // eg. '经度,纬度'
                    pointStr += (pStr + ";");
                    if(pStr.replace(/\s+/g, '') !== ''){
                        // pointArr.push(pStr);
                        var lngLatArr = pStr.split(",");
                        var lng = isNaN(parseFloat(lngLatArr[0])) ? '' : parseFloat(lngLatArr[0]),
                            lat = isNaN(parseFloat(lngLatArr[1])) ? '' : parseFloat(lngLatArr[1]);
                        geoPointArr.push(new BMap.Point(lng, lat));
                        oneLocateArr.push({
                            lng: lng,
                            lat: lat
                        });
                    }
                }
                locateCoordinateArr.push(oneLocateArr);
            }
            return {
                locates: locateCoordinateArr, // 边界经纬度标数组,用于创建地点边界(N个多边形)
                geos: geoPointArr // 边界地理坐标数组,用于调整地图视野
            }
        }
    };



    //================================================================
    //  点标记功能
    //================================================================
    var dotHelper = {
        /**
         * 添加信息窗口
         * @param {Object} 当前插件对象
         * @param {Marker} marker 点标记覆盖物
         * @param {Point} point 点标记地理坐标点
         * @param {Object} options 参数对象
         */
        _addInfoWindow: function (me, marker, point, options) {
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
                title : '<div class="ne__bd_info_title">' + title + '</div>', // 标题。支持HTML内容
                message: messsge // 短信内容(可选)。完整的短信内容包括：自定义部分+位置链接，不设置时，显示默认短信内容。短信内容最长为140个字
            }
            var infoContent = '<div class="ne__bd_info_describe">' + describe + '</div>';
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
         * @param {Object} 当前插件对象
         * @param {HTMLCollection} node 当前点标记节点
         */
        _setLabelPositionAndSize: function (me, node) {
            if (node != null && node.length > 0) {
                var selfNode = node[0],
                    fatherNode = node[0].parentNode;
                // 自动调整文本标位置/设置父节点定位偏移量
                var w = utils.getElementWidth(selfNode),
                    h = utils.getElementHeight(selfNode);
                // console.log('w：', w, '\nh：', h);
                var styles = utils.getElementStyle(fatherNode);
                var pdLeft = parseFloat(styles.paddingLeft);
                var pl = isNaN(pdLeft) ? 0 : pdLeft;
                var left = - ((w - pl) / 2),
                    top = - (h + parseFloat(me.settings.markers.markOptions.image.size) / 2);
                fatherNode.style.setProperty('top', top + 'px');
                fatherNode.style.setProperty('left', left + 'px');
            } 
        },


    };


    //================================================================
    //  鼠标左右键点击监听功能
    //================================================================
    var mouseHelper = {
        /**
         * 鼠标右键点击事件
         * @param {Object} me 当前插件对象
         * @param {Object} maper 地图实例化对象
         */
        _mouseRightClick: function (me, maper) {
            maper.addEventListener("rightclick", function (e) {
                // alert(e.point.lng + "," + e.point.lat);
            });
        },


        /**
         * 鼠标左键点击事件
         * @param {Object} me 当前插件对象
         * @param {Object} maper 地图实例化对象
         * @param {Object} 参数对象。参见函数内代码
         */
        _mouseClick: function (me, maper, options) {
            var originals = {
                center: { // 中心点(可选)
                    title: '', // 标题(可选)，默认空。支持HTML
                    describe: '' // 描述信息(可选)，默认空。支持HTML
                }
            }
            var finals = utils.combine(true, originals, options || {});

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
                    var longitude = e.point.lng, latitude = e.point.lat;
                    var centerCoordinate = longitude + ',' + latitude,
                        centerCaption = finals.center.title,
                        centerDescribe = finals.center.describe,
                        centerEnableDrag = me.settings.center.enableDrag,
                        centerComplete = me.settings.center.complete,
                        centerDragEnd = me.settings.center.dragEnd;
                    me.clearCenterOverlay(); // 清空中心点标记覆盖物
                    me.createMarker({ // 重建点标记
                        type: 'zhongxin',
                        coordinate: centerCoordinate,
                        title: centerCaption, 
                        describe: centerDescribe,
                        message: '',
                        dragable: centerEnableDrag,
                        finishCallback: centerComplete,
                        dragEndCallback: centerDragEnd 
                    });
                    if (me.settings.center.clickCallback) {
                        me.settings.center.clickCallback({
                            lng: longitude,
                            lat: latitude
                        });
                    }
                }
            });
        }
    };


    //================================================================
    //  百度地图鼠标绘制功能
    //================================================================
    var drawHelper = {
        /**
         * 启用鼠标绘制功能
         * 参考：鼠标绘制工具条库 https://lbsyun.baidu.com/index.php?title=jspopular/openlibrary
         * @param {Object} me 当前插件对象
         * @param {Object} maper 地图实例化对象
         * @param {Object} 参数对象。参见函数内代码
         */
        _turnOnDrawing: function (me, maper, options) {
            var _this = this;
            if (typeof BMapLib == 'undefined') {
                var tips = '请先引入百度地图Javascript API “鼠标绘制工具条库”开源库文件！<br>按F12通过控制台查看具体错误信息';
                var errs = tips.toString().replace(/(<br>)/g, '\n');
                utils.dialogs(tips);
                console.error(errs);
                console.log('引入方法：<script type="text/javascript" src="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js"></script>');
                console.log('类参考：http://api.map.baidu.com/library/DrawingManager/1.4/docs/symbols/BMapLib.DrawingManager.html');
                console.log('示例： https://lbsyun.baidu.com/jsdemo/demo/f0_7.htm');
                return;
            }

            var originals = {
                enable: true, // 是否启用鼠标绘图功能(可选)，默认true。
                drawingModes: [ // 工具栏上可以选择出现的绘制模式(可选)，默认空数组表示不显示任何绘制模式。请将需要显示的模式值以数组形式传入。数组元素值：dot 画点(画位置), circle 画圆, line 画线, gon 画多边形, rectangle 画矩形
                    // 'dot', // 画点(画位置)
                    // 'circle', // 画圆
                    // 'line', // 画线
                    // 'gon',  // 画多边形
                    // 'rectangle'  // 画矩形
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
                drawingOptions = finals.drawingOptions,
                buttoned = finals.operateButton.buttoned,
                btnText = finals.operateButton.btnText,
                stepDescription = finals.stepDescription,
                drawModeArr = finals.drawingModes;

            // 设置绘制模式
            var drawingModes = [];
            for (var i = 0; i < drawModeArr.length; i++){
                var value = drawModeArr[i].toString().toLocaleLowerCase();
                var oneMode = '';
                if (value == 'dot') oneMode = BMAP_DRAWING_MARKER;
                if (value == 'circle') oneMode = BMAP_DRAWING_CIRCLE;
                if (value == 'line') oneMode = BMAP_DRAWING_POLYLINE;
                if (value == 'gon') oneMode = BMAP_DRAWING_POLYGON;
                if (value == 'rectangle') oneMode = BMAP_DRAWING_RECTANGLE;
                if(oneMode != '') drawingModes.push(oneMode);
                // oneMode 值说明
                // BMAP_DRAWING_MARKER, // 画点(画位置)
                // BMAP_DRAWING_CIRCLE, // 画圆
                // BMAP_DRAWING_POLYLINE, // 画折线
                // BMAP_DRAWING_POLYGON, // 画多边形
                // BMAP_DRAWING_RECTANGLE // 画矩形
            }

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

                helpers._createSomeContent(me, {
                    extClass: "",
                    position: "absolute",
                    zIndex: 1,
                    top: 50, 
                    right: 25,
                    left: "auto",
                    bottom: "auto",
                    opacity: 0.9,
                    title: stepDescription.title,
                    content: stepDescription.content.toString().replace(/\s+/g, '') === '' ? stepHtml : stepDescription.content
                });
            }
            
            // 只有允许时才继续执行
            if (enable == false) return;
            
            // 实例化鼠标绘制工具, 创建鼠标绘制管理类实例化对象
            var drawManager = new BMapLib.DrawingManager(maper, {
                isOpen: false, // 是否开启绘制模式
                enableDrawingTool: true, // 是否显示工具栏
                drawingToolOptions: { // 可选的输入参数，非必填项
                    anchor: BMAP_ANCHOR_TOP_RIGHT, // 位置
                    offset: new BMap.Size(5, 5), // 偏离值
                    scale: 0.8, // 工具栏缩放比例
                    drawingModes: drawingModes // 工具栏上可以选择出现的绘制模式(可选),将需要显示的DrawingType以数组型形式传入，如[BMAP_DRAWING_MARKER, BMAP_DRAWING_CIRCLE] 
                },
                enableCalculate: enableCalculate, // 绘制是否进行测距(画线时候)、测面(画圆、多边形、矩形)
                circleOptions: drawingOptions, // 圆的样式
                polylineOptions: drawingOptions, // 折线的样式
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
                var ply = e.overlay;
                // console.log('plyxx：', ply);
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
                    polygonHelper._addOverlayButton(me, ply, {
                        longitude: coord.lng,
                        latitude: coord.lat,
                        plyUid: plyUid, // 覆盖物唯一标识符，默认空
                        plyNo: plyNo, // 覆盖物对应的编号，默认空(可选)。新增时为空
                        btnText: btnText // 按钮文本，默认'删除'(可选)
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
                
                // 默认的画折线、多边形完成之后它会关闭地图绘制状态(鼠标会自动切换为一只手),但画点、折线、矩形完成后并不会关闭地图绘制状态
                if (['marker', 'circle', 'rectangle'].indexOf(e.drawingMode) >= 0) {
                    drawManager.close(); // 设置画点、折线、矩形时完成后关闭地图的绘制状态，使鼠标切换为一只手
                }
                // 全局赋值1
                // me.settings.drawMode = ['polyline', 'polygon'].indexOf(e.drawingMode) >= 0 ? 'hander' : e.drawingMode; // 画折线、多边形完成之后它会自动切换到鼠标为一只手
                me.settings.drawMode = 'hander';
            });
        },



        /*
        * 绘图切换事件，即当绘图工具切换到“拖动地图”模式(光标呈现为一只手)时
        * @param {Object} me 当前插件对象
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
        * 获取多边形中心点/获取某个多边形的中心点
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
         * 给多边形覆盖物添加文本标注
         * @param {Object} me 当前插件对象
         * @param {Polygon} 多边形覆盖物对象
         * @param  {Object} 其它参数
         */
        _addOverlayLabel: function (me, polyObj, options) {
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
            var maper = me.$opts.$maper;
            var originals = {
                longitude: '', // 操作按钮所在经度坐标
                latitude: '', // 操作按钮所在纬度坐标
                plyUid: '', // 多边形覆盖物唯一标识符，默认空
                plyNo: '', // 多边形覆盖物对应的编号，默认空(可选)。新增时为空
                title: '', // 多边形覆盖物自定义的文本信息(可选),默认空
                labelStyle: { // 多边形覆盖物文本信息样式(可选)，默认空对象
                    padding: '3px 6px',
                    backgroundColor: "#fff", // 填充颜色。当参数为空时，圆形将没有填充效果。
                    borderColor: "#fff", // #2196F3
                    borderRadius: '2px',
                    color: "#666", // #5e9fdc
                    fontSize: "11px",
                    boxShadow: "0 1px 0px #fafafa",
                    opacity: 1,
                    filter: "alpha(opacity=100)",
                    filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=100)"
                },
                content: '' // 多边形覆盖上的内容(可选), 默认空
            }
            var finals = utils.combine(true, originals, options || {});
            var position = new BMap.Point(finals.longitude, finals.latitude),
                plyUid = finals.plyUid,
                plyNo = finals.plyNo,
                title = finals.title,
                lbStyle = finals.labelStyle,
                content = finals.content;
            var textUid = plyUid + '_text'; // 多边形文本信息唯一标识符 eg. 'identity_duobianxing_5_btn'
            // console.log('多边形覆盖物对象：', polyObj);
            var txtHtml = '<div class="bmap__polygon_info" data-ply-overlay="' + polyObj + '" data-bh="' + plyNo + '" data-ply-uid="' + plyUid + '" data-ply-txt-uid="' + textUid + '">' + title + '</div>';
            var btOpts = {
                position: position, // 指定文本标注所在的地理位置. eg.new BMap.Point(118.599547, 24.9246154) 
                offset: new BMap.Size(-50, -30) //设置文本偏移量  
                // offset: new BMap.Size(0, 0) //设置文本偏移量  
            }
            var label = new BMap.Label(txtHtml, btOpts);  // 创建文本标注对象  
            label.enableMassClear(); // 允许覆盖物被清除
            label.name = 'info_biaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
            label.identifier = textUid; // 添加多边形文本信息唯一标识符
            label.setStyle(lbStyle);
            maper.addOverlay(label);

            // 全局赋值1
            me.settings.overlays.push(label);
            me.settings.labelLays.push(label);
        },



        /**
         * 给多边形覆盖物添加操作按钮
         * @param {Object} me 当前插件对象
         * @param {Polygon} 多边形覆盖物对象
         * @param {Object} 其它参数
         */
        _addOverlayButton: function (me, polyObj, options) {
            if (!helpers._examineIsInstantiate(me, arguments.callee.name)) return;
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
            var position = new BMap.Point(finals.longitude, finals.latitude),
                plyUid = finals.plyUid,
                plyNo = finals.plyNo,
                btnText = finals.btnText;
            
            var btnUid = plyUid + '_btn'; // 多边形按钮唯一标识符 eg. 'identity_duobianxing_5_btn'
            // console.log('多边形覆盖物对象：', polyObj);
            var btHtml = '<div class="bmap__polygon_del" data-ply-overlay="' + polyObj + '" data-bh="' + plyNo + '" data-ply-uid="' + plyUid + '" data-ply-bt-uid="' + btnUid + '">' + btnText + '</div>';
            var btOpts = {
                position: position, // 指定文本标注所在的地理位置. eg.new BMap.Point(118.599547, 24.9246154) 
                offset: new BMap.Size(-50, -30) //设置文本偏移量  
                // offset: new BMap.Size(0, 0) //设置文本偏移量  
            }
            var label = new BMap.Label(btHtml, btOpts);  // 创建文本标注对象  
            label.enableMassClear(); // 允许覆盖物被清除
            label.name = 'anniu_biaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
            label.identifier = btnUid; // 添加多边形按钮唯一标识符
            label.setStyle({
                padding: '6px 10px',
                backgroundColor: "#fff", // 填充颜色。当参数为空时，圆形将没有填充效果。
                borderColor: "#f66877",
                borderRadius: '4px',
                color: "#666",
                fontSize: "12px"
            });
            maper.addOverlay(label);

            // 全局赋值1
            me.settings.overlays.push(label);
            me.settings.labelLays.push(label);

            // 点击按钮事件/多边形的按钮点击事件
            label.addEventListener('click', function (e) {
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
                        id: ls_data_bh, // 隐藏值ID字段
                        polyObj: polyObj, // 多边形覆盖物对象
                        polyLayId: plyUid, // 多边形覆盖物唯一标识符
                        btnLayId: btnUid // 按钮覆盖物唯一标识符
                    });
                }
            });
        },
         
         
         
        /**
         * 显示覆盖物点坐标 (这个函数目前没用到，因为对应界面元素是隐藏的)
         * @param {Object} me 当前插件对象
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
         * @param {Object} me 当前插件对象
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
            } else {
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
//                              兼容IE
//————————————————————————————————————————————————————————————————————————————————————
(function () {
    // classlist 兼容ie
    if (document.body.classList == null && Element) {
        var wjClassList = {
            el: null,
            names: [],
            getClass: function () {
                var cNames = this.el.className;
                this.names = cNames ? cNames.trim().split(/\s+/) : [];
            },
            genClass: function () {
                this.el.className = this.names.join(" ");
            },
            add: function (cName) {
                var i = this.contains(cName);
                if (i === false) {
                    this.names.push(cName);
                    this.genClass();
                }
            },
            remove: function (cName) {
                var i = this.contains(cName);
                if (typeof i == "number") {
                    this.names[i] = "";
                    this.genClass();
                }
            },
            toggle: function (cName) {
                var i = this.contains(cName);
                if (i === false) {
                    this.add(cName);
                } else {
                    this.remove(cName);
                }
            },
            contains: function (cName) {
                this.getClass();

                var i, len = this.names.length;
                for (i = 0; i < len; i++) {
                    if (this.names[i] == cName) {
                        return i; // 如果存在，返回索引
                    }
                }
                return false;
            },
        };

        // 在不支持classList的浏览器中, 在Element的原型中写入此方法
        Object.defineProperty(Element.prototype, 'classList', {
            get: function () {
                wjClassList.el = this;
                return wjClassList;
            }
        });
    }
})();



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