// 返回el对象css样式中的property属性值
function getStyle(el, property) {
    var result = '';
    if (getComputedStyle) {
        result = getComputedStyle(el)[property];
    } else {
        result =  el.currentStyle[property];
    }
    return result;
}



/* 对el对象css样式中的属性值进行更改，更改的内容在properties里面，properties是一个
属性对象数组，对每一个properties里的每一个对象值进行修改，并且产生由快到慢的动画
效果变化 */
function animate(el, properties) {
    clearInterval(el.timeId);
    console.log('properties：', properties)
    // 产生动态效果的方法
    el.timeId = setInterval(function () {
        for (var property in properties) {
            var current;
            var target = properties[property];
            // console.log('target：', target);
            // 分为两种参数，一种是透明度，范围是0到1的变化
            if (property == "opacity") {
                current = Math.round(getStyle(el, "opacity") * 100);
            }
            // 另一种是像素的变化，如width , height 等
            else {
                current = parseInt(getStyle(el, property));
            }
            // 属性的变化速度（由快到慢）
            var speed = (target - current) / 30;
            // console.log('speed：', speed)
            // ceil向上取整  floor向下取整
            speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
            // 重新设置el对象 css中的样式
            if (property == "opacity") {
                el.style.opacity = (current + speed) / 100;
            } else {
                el.style[property] = current + speed + "px";
            }
        }
    }, 20);

}