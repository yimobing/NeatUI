/**
 * [neuiBdmap]
 * 百度地图控件
 * Version：v1.0 待开发！！！
 * Author: Mufeng
 * QQ: 1614644937
 * Date: 2021.06.18
 * Update: 2021.07.16
 *
 * 官网：https://github.com/yimobing/neuiBdmap
 * [百度地图资源库]
 * 鼠标绘制工具：http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js
 * GeoUtils类库：http://api.map.baidu.com/library/GeoUtils/1.2/src/GeoUtils_min.js
 * 加载检索信息窗口：http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js
 */
// (function ($) {
//     $.fn.extend({
//         bdChinaMap: function(elem, options){
//             return new bdChinaMap($(elem), options);
//         }
//     });

    /**
     * 百度地图类对象
     * 参考：http://mobai.blog.51cto.com/
     */
    function bdChinaMap(opts) {
        var defaults = {
            status: false,
            map: '', // 地图根节点
            
            center: '118.611836,24.918225', // 中心点坐标. eg.'经度,纬度'
            caption: '泉州市', // 中心点说明文字
            zoom: 11, // 缩放级别(3-19)
            point: '', // 地图中心点信息. eg. new BMap.Point(经度,纬度)
    
            marker: '', // 点标记覆盖物
            label: '', // 信息窗覆盖物
            overlays: [], // 全部覆盖物
    
            overlaysCache: [],
            myPoints: [], // 所有坐标点数组
            myPolygon: '',
            myOverlay: [],
            drawingManager: '',
            styleOptions: {
                strokeColor: "red",      // 边线颜色。
                fillColor: "red",        // 填充颜色。当参数为空时，圆形将没有填充效果。
                strokeWeight: 3,        // 边线的宽度，以像素为单位。
                strokeOpacity: 0.8,     // 边线透明度，取值范围0 - 1。
                fillOpacity: 0.3,       // 填充的透明度，取值范围0 - 1。
                strokeStyle: 'solid'    // 边线的样式，solid或dashed。
            }
        }
        var settings = $.extend(true, {}, defaults, opts || {});
        this.opts = settings;
        this.init();
    };



    /**
     * 实例化
     */
    bdChinaMap.prototype.init = function(){
        if (this.opts.status) {
            return;
        }
        this.opts.center = this.opts.center == '' ? '118.611836,24.918225' : this.opts.center; // 当中心点坐标为空时,设定一个默认坐标
        this.opts.status = true;
        this.opts.map = new BMap.Map('map');
        this.opts.point = new BMap.Point(this.opts.center.split(',')[0], this.opts.center.split(',')[1]);
        var map = this.opts.map;
        var styleOptions = this.opts.styleOptions;
        map.centerAndZoom(this.opts.point, 16);
        map.enableScrollWheelZoom();
        // 添加点标记
        var marker = new BMap.Marker(this.opts.point);
        marker.enableDragging();
        marker.name = 'dianbiaoji'; // 标记覆盖物类型,方便清除指定覆盖物时用
        map.addOverlay(marker);
        this.opts.marker = marker;

        // 添加信息窗
        var lbText =  '<div class="bdLabel">' + this.opts.caption + '</div>',
            lbOptions = {
                position: this.opts.point, // 指定文本标注所在的地理位置
                // offset: new BMap.Size(30, -30) // 设置文本偏移量
                width: 0,     // 宽度(220-730) 0 自动调整
                maxWidth:500,  // 最大宽度(220-730)
                height: 0,     // 高度(60-650) 0 自动调整
                offset: { // 位置偏移
                    width: 10, 
                    height: -50
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
        label.name = 'xinxichuang'; // 标记覆盖物类型,方便清除指定覆盖物时用
        marker.setLabel(label); // 绑定信息窗到点标记上
        map.addOverlay(label);
        setTimeout(function(){ // 更改信息窗样式
            $('.bdLabel').parent().addClass('bdMarkerLabel');
        }, 0)
        this.opts.label = label;
        this.dragMarker();

        // 坐标拾取器赋值
        if($('#c-locate').length != 0) $('#c-locate').val(this.opts.center);


        // 实例化鼠标绘制工具
        this.opts.drawingManager = new BMapLib.DrawingManager(map, {
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
            circleOptions: styleOptions, // 圆的样式
            polylineOptions: styleOptions, // 线的样式
            polygonOptions: styleOptions, // 多边形的样式
            rectangleOptions: styleOptions // 矩形的样式
        })
        // 添加鼠标绘制工具监听事件，用于获取绘制结果
        this.opts.drawingManager.addEventListener('overlaycomplete', bdChinaMap.overlaycomplete);


        // 加载多边形testing
        if(this.opts.myPoints.length != 0){
            // 加载多个已有的多边形
            for(var i = 0; i < this.opts.myPoints.length; i++){
                this.opts.myOverlay = this.opts.myPoints[i];
                if (this.opts.myOverlay) {
                    this.opts.loadMyOverlay();
                }
            }
            // console.log('aaa')
        }else{
            // 加载一个已有的多边形
            if (this.myOverlay) this.loadMyOverlay();
            // console.log('bbb')
        }
        // 鼠标右键点击事件
        map.addEventListener("rightclick", function (e) {
            alert(e.point.lng + "," + e.point.lat);
        })
    };



   

    /**
     * 加载覆盖物
     */
    bdChinaMap.prototype.loadMyOverlay = function() {
        var map = this.opts.map;
        // this.clearAll();
        map.centerAndZoom(this.opts.point, this.opts.zoom); // 设置地图中心点

        // 创建多边形覆盖物
        var ply = new BMap.Polygon(this.opts.myOverlay, this.opts.styleOptions);
        this.opts.myPolygon = ply;
        try { 
            ply.enableEditing(); 
            ply.name = 'duobianxing'; // 标记覆盖物类型,方便清除指定覆盖物时用
        } 
        catch (e) { 

        };
        ply.addEventListener("lineupdate", function (e) { // 拖动边线进行编辑时监听事件
            // console.log('e:', e)
            bdChinaMap.showLatLon(e.currentTarget.ha);
        })
        // bdChinaMap.showLatLon(myPolygon.getPath()); // 绘制完成时显示覆盖物点信息 testing
        map.addOverlay(ply);
    };


    /**
     * 显示覆盖物点坐标
     */
    bdChinaMap.prototype.showLatLon = function (a) {
        // console.log('a：', a)
        var len = a.length;
        var s = '';
        var arr = [];
        for (var i = 0; i < len - 1; i++) {
            arr.push([a[i].lng, a[i].lat]);
            s += '<li>' + a[i].lng + ',' + a[i].lat + '<span class="red" title="删除" onclick="bdChinaMap.delPoint(' + i + ')">X</span></li>';
        }
        this.opts.overlaysCache = arr;
        $("#panelWrap")[0].innerHTML = '<ul>' + s + '</ul>';
    };



    /**
     *绘制完成后回调获得覆盖物信息
    */
    bdChinaMap.prototype.overlaycomplete = function (e) {
        e.overlay.name = 'duobianxing'; // 标记覆盖物类型,方便清除指定覆盖物时用
        bdChinaMap.overlays.push(e.overlay);
        if(typeof e.overlay.enableEditing != 'undefined') e.overlay.enableEditing();
        e.overlay.addEventListener("lineupdate", function (e) { // 拖动边线进行编辑时监听事件
            // console.log('e:', e);
            bdChinaMap.showLatLon(e.currentTarget.ha);
        });
        if(typeof e.overlay.getPath != 'undefined'){ // 绘制完成时显示覆盖物点信息 testing
            bdChinaMap.showLatLon(e.overlay.getPath());
        }
    };

    /**
     * 删除覆盖物点坐标
     */
    bdChinaMap.prototype.delPoint = function (i) {
        if (this.opts.overlaysCache.length <= 3) {
            alert('不能再删除, 请保留3个以上的点.');
            return;
        }
        this.opts.overlaysCache.splice(i, 1);
        var a = this.opts.overlaysCache;
        var newOverlay = [];
        for (var i in a) {
            newOverlay.push(new BMap.Point(a[i][0], a[i][1]));
        }
        this.opts.myOverlay = newOverlay;
        this.loadMyOverlay();
    };

    /**
     * 拖动点标记事件
     */
    bdChinaMap.prototype.dragMarker = function(){
        // 拖拽点标记时会触发此事件
        var marker = this.opts.marker;
        marker.addEventListener('dragend', function(e){
            var x = e.point.lng,
                y = e.point.lat;
            // console.log('x:',x, '\ny:',y)
            var ele = $('#c-locate');
            if(ele.length == 0) return;
            ele.val( x + ',' + y);
        })
    };
    
    /**
     * 清除覆盖物
     */
    bdChinaMap.prototype.clearAll = function () {
        var r = confirm('确认清除所有覆盖物？');
        if(r !== true) return;
        var map = this.opts.map;
        var overlays = this.opts.overlays;
        for (var i = 0; i < overlays.length; i++) {
            map.removeOverlay(overlays[i]);
        }
        this.opts.overlays.length = 0
        map.removeOverlay(this.opts.myPolygon);
        this.opts.myPolygon = '';
    };


    /**
     *取覆盖物的经纬度
    */
    bdChinaMap.prototype.getOverLay = function () {
        // var box = this.opts.myPolygon ? this.opts.myPolygon : this.opts.overlays[this.opts.overlays.length - 1];
        var box = this.opts.overlays.length == 0 ? this.opts.myPolygon : this.opts.overlays[this.opts.overlays.length - 1];
        var coordinateArr = typeof box == 'undefined' ? [] : typeof box.Ao == 'undefined' ? [] : box.Ao;
        // console.log('box:', box)
        console.log('最后一个覆盖物信息：', coordinateArr);
    };

    /**
     * 获取覆盖物个数
     */
    bdChinaMap.prototype.getCount = function () {
        var n = 0;
        if (this.opts.myPolygon) {
            n++;
        };
        if (this.opts.overlays) {
            n = n + this.opts.overlays.length;
        };
        // console.log('当前覆盖物个数：', n);
    };

    
// })(jQuery);