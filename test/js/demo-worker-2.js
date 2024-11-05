/**
 * web workers 演示示例
 * 
 */



// 事件监听器，收到主线程的消息时会响应
onmessage = function (event) {
    console.log('我接收到了主线程向我发来的数据');
    // console.log('event：', event);
    var data = event.data;
    var value = data + '我爱中国';
    // start testing
    console.log('self：', self);
    console.log('typeof ajax-2：', typeof $.ajax);
    neuiDialog.alert({
        animate: true,
        message: '很好，很不错',
        buttons: ['确定']
    });
    // END testing
   
    // 向主线程传递数据(返回结果值)
    postMessage({
        value: value
    })
}
