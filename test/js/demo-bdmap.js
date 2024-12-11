

neuiBdmap('test_3_1', {
    // width: 400,
    // height: 400
    center: {
        visible: true, // 是否显示中心点标注(可选)，默认true
        city: "", // 城市(可选)，默认空。值：空时根据坐标定位, 非空时根据城市定位。eg.'泉州市', eg.'泉州市惠安县'。
        coordinate: "116.404177,39.909652",  // 坐标(可选)，默认为首都北京天安门广场的坐标, eg."经度,纬度"。
        caption: "北京市", // 标题文字(可选)，默认'北京市'。支持HTML
        describe: "", // 描述文字(可选)，默认空。支持HTML
        complete: null, // 创建完成回调(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
        enableClickCreateNew: false, // 是否启用点击地图时在点击位置新建中心点坐标(可选)，默认false。
        clickCallback: null, // 点击地图时在点击位置新建中心点坐标的回调函数(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
        enableDrag: true, // 是否允许拖拽(可选)，默认false
        dragEnd: null // 拖拽结束回调(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
    },
});

//setTimeout(() => {
    // neuiBdmap.setCenterPointLabelTitle('我的');
//}, 2000);


neuiBdmap('test_3_2', {
    width: 400,
    height: 400,
    center: {
        visible: true, // 是否显示中心点标注(可选)，默认true
        city: "", // 城市(可选)，默认空。值：空时根据坐标定位, 非空时根据城市定位。eg.'泉州市', eg.'泉州市惠安县'。
        coordinate: "116.404177,39.909652",  // 坐标(可选)，默认为首都北京天安门广场的坐标, eg."经度,纬度"。
        caption: "北京市", // 标题文字(可选)，默认'北京市'。支持HTML
        describe: "", // 描述文字(可选)，默认空。支持HTML
        complete: null, // 创建完成回调(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
        enableClickCreateNew: false, // 是否启用点击地图时在点击位置新建中心点坐标(可选)，默认false。
        clickCallback: null, // 点击地图时在点击位置新建中心点坐标的回调函数(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
        enableDrag: true, // 是否允许拖拽(可选)，默认false
        dragEnd: null // 拖拽结束回调(可选)，默认null。返回值e为当前点标记的经纬度 { lng: 经度, lat : 纬度}
    },
});

// neuiBdmap.setCenterPointLabelTitle('你的');





// // 创建地图实例
// var map = new BMap.Map("test_3_1");
// map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);

// // 创建自定义Overlay
// function LabelOverlay(point, html) {
//     this._point = point;
//     this._html = html;
//   }
   
//   LabelOverlay.prototype = new BMap.Overlay();
   
//   LabelOverlay.prototype.initialize = function(map) {
//     var div = this._div = document.createElement("div");
//     div.style.position = "absolute";
//     div.innerHTML = this._html;
    
//     // 将HTML内容添加到地图中
//     map.getPanes().labelPane.appendChild(div);
    
//     // 保存map对象实例
//     this._map = map;
    
//     // 初始化时更新位置
//     this.updatePosition();
    
//     return div;
//   };
   
//   LabelOverlay.prototype.updatePosition = function() {
//     var position = this._map.pointToOverlayPixel(this._point);
//     this._div.style.left = position.x + "px";
//     this._div.style.top = position.y + "px";
//   };
   
//   // 创建HTML内容的标签
//   var htmlContent = '<div style="color:red;">这里是<b>HTML</b>内容</div>';
//   var point = new BMap.Point(116.401398,39.916527);
   
//   // 创建自定义Overlay实例，并添加到地图上
//   var myOverlay = new LabelOverlay(point, htmlContent);
//   map.addOverlay(myOverlay);