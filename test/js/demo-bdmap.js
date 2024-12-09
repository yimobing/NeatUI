

neuiBdmap('test_3_1', {
    width: 400,
    height: 400
});

//setTimeout(() => {
    // neuiBdmap.setCenterPointLabelTitle('我的');
//}, 2000);


// neuiBdmap('test_3_2', {
//     width: 400,
//     height: 400
// });

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