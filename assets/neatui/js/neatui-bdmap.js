/**
 * [neuiBdmap]
 * 百度地图控件
 * Version：v1.0 待开发！！！
 * Author: Mufeng
 * QQ: 1614644937
 * Date: 2021.06.18
 * Update: 2021.07.16
 */


/**
 * 官网：https://github.com/yimobing/neatui
 * [百度地图资源库]
 * 鼠标绘制工具：http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js
 * GeoUtils类库：http://api.map.baidu.com/library/GeoUtils/1.2/src/GeoUtils_min.js
 * 加载检索信息窗口：http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js
 */
;(function($){
    $.fn.neuiBdmap = function(options){
        return new MyBdp(this, options);
    };

    var MyBdp = function(element, options){
        var me = this;
        me.$elem = element;
        me.init(options);
    };


    //================================================================
    //
    //================================================================
    MyBdp.prototype.init = function(opts){
        var me = this;
        var defaults = {
            // ------------------------
            //          1、前台参数
            // ------------------------
            center: { // 中心点
                city: "", // 中心点城市(可选)，默认空。值：空时根据中心点坐标定位, 非空时根据中心点城市定位。eg.'泉州市', eg.'泉州市惠安县'。
                point: "116.404177,39.909652",  // 中心点坐标(可选)，默认为首都北京天安门广场的坐标, eg."经度,纬度"。
                caption: "", // 中心点标题文字(可选)，默认空。
                describe: "", // 中心点描述文字(可选)，默认空。
            },
            zoom: 11, // 缩放级别(可选)，默认11。 值：3-19

            // 功能与配置项
            maps: { // 地图功能(可选)
                mapOptions: { // 地图默认配置项(可选)。
                    enableMapClick: true, // 是否启用底图景点可点功能(可选)，默认true。
                    enableScrollWheelZoom: true, // 是否开启鼠标滚轮缩放功能，仅对PC上有效(可选)，默认true。
                    enableClickCreateNewCenter: false // 是否启用点击地图时在点击位置新建中心点坐标(可选)，默认false。
                }
            },
            draws: { // 鼠标绘图功能(可选)。
                enable: false, // 是否启用鼠标绘图功能(可选)，默认false。
                drawingModes : [  // 工具栏上可以选择出现的绘制模式(可选)，将需要显示的DrawingType以数组型形式传入，如[BMAP_DRAWING_MARKER, BMAP_DRAWING_CIRCLE] 将只显示画点和画圆的选项.
                    // BMAP_DRAWING_MARKER, // 画点(画位置)
                    // BMAP_DRAWING_CIRCLE, // 画圆
                    BMAP_DRAWING_POLYLINE, // 画线
                    BMAP_DRAWING_POLYGON, // 画多边形
                    BMAP_DRAWING_RECTANGLE // 画矩形
                ],
                drawingOptions: { // 鼠标绘图配置项，即鼠标绘制管理类配置项(可选)。
                    strokeColor: "red", // 边线颜色(可选)，默认红色。
                    fillColor: "red", // 填充颜色(可选)，默认红色。当参数为空时，圆形将没有填充效果。
                    strokeWeight: 1, // 边线的宽度，以像素为单位(可选)，默认1px。
                    strokeOpacity: 0.8, // 边线透明度，取值范围0-1(可选)，默认0.8。
                    fillOpacity: 0.65,  // 填充的透明度，取值范围0-1(可选)，默认0.65。
                    strokeStyle: "solid" // 边线的样式，solid或dashed(可选)，默认solid。
                }
            },
            markers: { // 点标记功能
                enableDrag: false, // 是否允许拖动点标记(可选)。

                markOptions: { // 点标记默认配置项(可选)。
                    image: { // 自定义点标记图标及其它属性(可选)
                        enable: false, // 是否启用(可选)，默认false
                        path: "assets/neatui/img/", // 图片路径(可选)
                        icon: "bmap_locate_blue.png", // 图片名称(可选)
                        size: 50 // 图片大小(可选)
                    }
                }
            },
            infos: { // 信息窗口功能(可选)。
                enable: false, // 是否启用(可选)，默认false
                method: "mouseover", // 打开方式(可选). mouseover 鼠标经过点标记时(默认)，click 鼠标点击点标记时
                title : "", // 标题(可选)。默认为中心点说明文字，支持HTML内容
                message: "", // 短信内容(可选)(这个貌似没用)。完整的短信内容包括：自定义部分+位置链接，不设置时，显示默认短信内容。短信内容最长为140个字
                content: "", // 内容或描述，比如点标记的地址(可选)。默认空，支持HTML内容
                width: 0, // 宽(可选)。单位像素，取值范围：0, 220 - 730, 其中0表示自动调整宽
                height: 0 // 高(可选)。单位像素，取值范围：0, 60 - 650，其中0表示自动调整高
            },   
            

            // ------------------------
            //          2、内部参数
            // ------------------------
            map: "", // 地图对象(可选)，默认空。
            status: false, // 地图状态(可选)，默认false。值：true 已加载, false 未加载
            // 覆盖物集合
            overlays: [], // 所有覆盖物集合
            markerLays: [], // 点标记覆盖物集合
            labelLays: [], // 信息窗覆盖物集合

            // 多边形覆盖物(多个)
            myPolyIdentifiers: [], // 覆盖物标识符数组(即一个标识符对应一个覆盖物)(可选)。
            myPolyGroupNames: [], // 覆盖物分类数组(可选)。eg.["学校", "便利店", "旅游景点"] 分别表示学校、便利店、旅游景点三种不同类型的覆盖物
            myPolyAllPoints: [], // 所有覆盖物的点坐标数组(可选)。
            myPolyOnePoints: [], // 一个覆盖物的点坐标数组(可选)。
            myPolyOnePointCache: [], // 一个覆盖物的点坐标数组(临时变量，用于记录这些点一个个删除后的剩余的点)(可选)。

            // 多边形覆盖物(单个)
            myPolygon: "", // 当前覆盖物对象(可选)。
            myPolyHidValue: "", // 当前覆盖物隐藏值(可选)。当前端删除某个覆盖物时，如删除接口需传递某个参数，则可使用本参数。

            // 鼠标绘制管理类 BMapLib.DrawingManager
            drawManager: "", // 鼠标绘制管理类实例化对象(可选)，默认空。
            drawMode: "", // 当前绘制模式(可选)，默认空。值：空 无任何绘制操作, hander 拖动地图(鼠标为一只手), marker 画点, circle 画圆, polyline 画线,  polygon 画多边形, rectangle 画矩形。

            // 次数记录
            clickTimes: 0, // 记录地图被点击的次数(可选)，默认0。
            loadTimes: 0, // 记录地图重载的次数(可选)，默认0。

           
        };
        var settings = $.extend(true, {}, defaults, opts || { });
        me.$defaults = defaults;
        me.$opts = settings;
    };



    /**
     * 创建地图
     */
    MyBdp.prototype.createMap = function(){
        var me = this;
        // if (this.status) { // 只允许地图加载一次
        //     return;
        // }
        this.loadTimes++;
        this.center = this.center == '' ? '118.611836,24.918225' : this.center; // 当中心点坐标为空时,设定一个默认坐标
        this.status = true;
        var options = {
            enableMapClick: this.default.enableMapClick
        }
        this.map = new BMap.Map('map', options);
        this.point = new BMap.Point(this.center.split(',')[0], this.center.split(',')[1]);
        var map = this.map;
        var drawOptions = this.drawOptions;
        map.centerAndZoom(this.point, 16);
        map.enableScrollWheelZoom();
        if(this.city.toString().replace(/([ ]+)/g, '') !== ''){
            map.setCenter(this.city);
        }
        // 先清空所有覆盖物
        me.clearOverlay();
        // 添加点标记
        this.addMarker();
        // 添加信息窗口
        this.addInfoWindow();

        // 实例化鼠标绘制工具
        this.drawManager = new BMapLib.DrawingManager(map, {
            isOpen: false, // 是否开启绘制模式
            enableDrawingTool: true, // 是否显示工具栏
            drawingToolOptions: { // 可选的输入参数，非必填项
                anchor: BMAP_ANCHOR_TOP_RIGHT, // 位置
                offset: new BMap.Size(5, 5), // 偏离值
                scale: 0.8, // 工具栏缩放比例
                drawingModes : [  // 工具栏上可以选择出现的绘制模式(可选),将需要显示的DrawingType以数组型形式传入，如[BMAP_DRAWING_MARKER, BMAP_DRAWING_CIRCLE] 将只显示画点和画圆的选项.
                    // BMAP_DRAWING_MARKER, // 画点(画位置)
                    // BMAP_DRAWING_CIRCLE, // 画圆
                    BMAP_DRAWING_POLYLINE, // 画线
                    BMAP_DRAWING_POLYGON, // 画多边形
                    BMAP_DRAWING_RECTANGLE // 画矩形
                ]
            },
            enableCalculate: false, // 绘制是否进行测距(画线时候)、测面(画圆、多边形、矩形)
            circleOptions: drawOptions, // 圆的样式
            polylineOptions: drawOptions, // 线的样式
            polygonOptions: drawOptions, // 多边形的样式
            rectangleOptions: drawOptions // 矩形的样式
        })
        // 添加绘图切换事件
        this.drawCursorHand();

        // 添加鼠标绘制工具监听事件，用于获取绘制结果
        // 绘制点完成后，派发的事件接口
        // this.drawManager.addEventListener('markercomplete', function(e, overlay){ })
        // 绘制圆完成后，派发的事件接口
        // this.drawManager.addEventListener('circlecomplete', function(e, overlay){ })
        // 绘制线完成后，派发的事件接口
        // this.drawManager.addEventListener('polylinecomplete', function(e, overlay){ })
        // 绘制多边形完成后，派发的事件接口
        // this.drawManager.addEventListener('polygoncomplete', function(e, overlay){ })
        // 绘制矩形完成后，派发的事件接口
        // this.drawManager.addEventListener('rectanglecomplete', function(e, overlay){})
        // 鼠标绘制完成后，派发总事件的接口
        this.drawManager.addEventListener('overlaycomplete', function(e){
            // 绘制完成后回调获得覆盖物信息
            e.overlay.name = 'duobianxing'; // 覆盖物分类标识符（标记覆盖物类型,方便清除指定类型的覆盖物）
            // 统计多边形个数, 给覆盖物添加唯一标识符
            var count = 0;
            var allOverlay = map.getOverlays();
            allOverlay.map(function(item){
                if(item.name === 'duobianxing'){
                    count++;
                }
            })
            var layUid = 'duobianxing-' + count;
            e.overlay.identifier = layUid; // 添加覆盖物唯一标识符
            //
            me.overlays.push(e.overlay); // 全局赋值
            if(typeof e.overlay.enableEditing != 'undefined') e.overlay.enableEditing();
            // 给覆盖物添加操作按钮
            var lngLat = me.getPolyCenter(e.overlay);  // 获取多边形中心点
            var point = new BMap.Point(lngLat.lng, lngLat.lat); // this.myPolyOnePoints[0];
            me.addOverlayButton(point, '', layUid);  
            //
            e.overlay.addEventListener("lineupdate", function (event) { // 拖动边线进行编辑时监听事件
                // console.log('event:', event);
                me.drawMode = e.drawingMode; //全局赋值
                me.showLatLon(event.currentTarget.ha);
            })
            e.overlay.addEventListener("mouseover", function(event){ // 鼠标进入时的监听事件
                // console.log('鼠标进入了e：', e)
                me.drawMode = e.drawingMode; // 全局赋值
            })
            e.overlay.addEventListener("mouseout", function(event){ // 鼠标离开时的监听事件
                // console.log('鼠标离开了e：', e)
                me.drawMode = 'hander'; // 全局赋值
            })
            if(typeof e.overlay.getPath != 'undefined'){ // 绘制完成时显示覆盖物点信息
                me.showLatLon(e.overlay.getPath());
            }
            // 全局赋值 (画点、线完成之后它会自动切换到鼠标为一只手)
            me.drawMode = (e.drawingMode == 'polyline' || e.drawingMode == 'polygon') ? 'hander' : e.drawingMode; // 全局赋值
        })


        // 加载多边形
        if(this.myPolyAllPoints.length != 0){ // 加载多个已有的多边形
            for(var i = 0; i < this.myPolyAllPoints.length; i++){
                this.myPolyOnePoints = this.myPolyAllPoints[i];
                this.myPolyHidValue = this.myPolyIdentifiers[i];
                if (this.myPolyOnePoints) {
                    this.loadPolyOverlay();
                }
            }
        }else{  // 加载一个已有的多边形
            if (this.myPolyOnePoints) this.loadPolyOverlay();
        }
        // 鼠标右键点击事件
        map.addEventListener("rightclick", function (e) {
            // alert(e.point.lng + "," + e.point.lat);
        })
        // 鼠标左键点击事件
        map.addEventListener('click', function(e){
            // console.log('点我了e：', e);
            me.clickTimes++; // 全局赋值
            if(me.clickCreateNewCenter){ // 点击地图时把中心点坐标移到点击位置
                // 当前有覆盖物时，则不执行点击事件(即在覆盖物上点击时，只执行覆盖物的click事件，但不执行map的click事件)
                if(e.overlay) return;
                // 当前处于绘图模式时，则不执行点击事件
                // console.log('mode:', me.drawMode);
                if(me.drawMode != '' && me.drawMode != 'hander') return;
                var lng = e.point.lng,  lat = e.point.lat;
                me.removeMarkerOverlay();
                me.addMarker(new BMap.Point(lng, lat));
                me.addInfoWindow();
                // 输入框赋值
                var ele = $('#c-locate');
                if(ele.length == 0) return;
                ele.val( lng + ',' + lat);
            }
        })
    };


    



    /**
     * 返回覆盖物所在的MAP对象
     */
    MyBdp.prototype.getMap = function(){

    };

    /**
     * 添加点标记
     */
    MyBdp.prototype.addMarker = function(){

    };

    /**
     * 添加信息窗口
     */
    MyBdp.prototype.addInfoWindow = function(){

    };

    /**
     * 清空所有覆盖物
     */
    MyBdp.prototype.clearAllOverlay = function(){

    };

    /**
     * 清空点标记覆盖物
     */
    MyBdp.prototype.clearMarkerOverlay = function(){

    };

    /**
     * 清空文本覆盖物
     */
    MyBdp.prototype.clearLabelOverlay = function(){

    };


    /**
     * 清空多边形覆盖物
     */
    MyBdp.prototype.clearPolygonOverlay = function(){

    };

    /**
     * 清空线覆盖物
     */
    MyBdp.prototype.clearPolylineOverlay = function(){

    };

    /**
     * 清空圆覆盖物
     */
    MyBdp.prototype.clearCircleOverlay = function(){

    };

    /**
     * 清空矩形覆盖物
     */
    MyBdp.prototype.clearRectangleOverlay = function(){

    };



    //================================================================
    //                          
    //================================================================
    /**
     * bdUtilities对象，控件内部对象
     */
    var bdUtilities = {

    }; // END bdUtilities对象


    //================================================================
    //                          
    //================================================================
    /**
     * tools对象，公用函数库
     */
    var tools = {

    }; // END tools对象




})(jQuery);