/**
 * web workers 演示示例
 * 
 */



 var i = 0;
 /**
  * 计数函数
  */
 var timer = null;
 function counters(){
    i++;
    // console.log('i：', i);
    // 向主线程传递数据(返回结果值)
    postMessage({
        value: i
    });
    timer = setTimeout("counters()", 500);
}
 
counters(); // 这里要调用一下函数哦，不然不会运行

