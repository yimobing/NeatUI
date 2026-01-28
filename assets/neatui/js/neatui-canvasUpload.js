/**
 * [neatUiCanvas]
 * pc端利用canvas上传图片、并实现图片压缩
 * 兼容性：支持火狐、谷歌、360、Microsoft Edge等现代浏览器，IE仅支持IE9+(即IE10、IE11)
 * Author: ChenMufeng
 * Date: 2020.05.07、2023.05.19
 * Update: 2026.01.28
 */
(function($){

    ///========================================================================================///
    /*+------------------------------------------------+*/
    /**
     * addEventListener兼容ie低版本
     */
    var Event = {};
    Event.addEvents = function(target, eventType, handle){
        if(document.addEventListener){
            Event.addEvents = function(target, eventType, handle){
                target.addEventListener(eventType, handle, false); //其它浏览器支持addEventListener事件
            };
        }else{
            Event.addEvents = function(target,eventType,handle){
                target.attachEvent('on' + eventType, function(){ //IE8及以下浏览器只支持attachEvent事件
                    handle.call(target, arguments);
                });
            };
        };
        Event.addEvents(target, eventType, handle);
    };
    /*
    * 调用方法如下，其中 document 表示某个document节点，eg.document.getElementById('file')
    eg1. Event.addEvents(document,"click",function(){ alert('ok'); });
    eg2. Event.addEvents(document.getElementById('file'),"click",function(){ alert('ok'); });
    */



    /*+------------------------------------------------+*/
    var uploadFile = function(options){
        var defaults = {
            browserCompatible: false, // 是否支持ie10以下的低版本浏览器,默认false
            selector: null, // 上传标签dom对象,一般为<input type="file" id="file">标签的dom对象。格式：dom对象或#id或#classname。注：此参数与 container 只需二选一
            container: '', // 父容器节点，动态节点时用。当有动态增加的节点要上传时就需要把事件绑定到父容器节点上才能触发事件。注：此参数与 selector 只需二选一。
            events: 'change', // 触发上传的事件,默认change
            maxWidth: 1200, // 图片最大宽度(PX),默认1200(可选)。尺寸最大可设1200px
            maxSize: 200, // 图片最大质量(KB),默认200(可选)
            minSize: 1, // 图片最小质量(KB),默认1(可选)
            quality: 0.7, // 压缩系数,0-1之间,默认0.7(可选) 
            fileType: [], // ["png", "gif", "jpg", "jpeg", "pdf"], // 图片类型限制(必须)，默认为空，表示不限制类型
            callBack: null // 回调。返回值参数：arr, el。其中 arr格式：[{index:"图片索引", url:"图片base64地址", files:"压缩后图片信息json", oldFiles:"压缩前图片信息json"}]。el 为inut[type="file"]DOM节点
        }
        var settings = $.extend(true, {}, defaults, options || {});
        var elNode = settings.selector,
            container = settings.container,
            browserCompatible = settings.browserCompatible,
            events = settings.events;
        var maxWidth = settings.maxWidth,
            maxSize = settings.maxSize,
            minSize = settings.minSize,
            quality = settings.quality;

        // 限制图片类型
        var dFileType = '';
        var dFileArr = [];
        if(Array.isArray(settings.fileType)){
            for(var i = 0; i < settings.fileType.length; i++){
                var _type = settings.fileType[i].toString().toLocaleLowerCase().replace(/\./g, ''); // 转成小写并去掉点号
                // 转成 input type file accept属性值
                var _format = '';
                if(_type == 'jpg' || _type == 'jpeg'){ // 图片
                    _format = 'image/jpeg';
                }
                else if(_type == 'png'){
                    _format = 'image/png';
                }
                else if(_type == 'gif'){
                    _format = 'image/gif';
                }
                else if(_type == 'pdf'){ // PDF文档
                _format = 'application/pdf';
                }
                else if(_type == 'xls'){  // EXCEL文档
                    _format = 'application/vnd.ms-excel';
                }
                else if(_type == 'xlsx'){
                    _format = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                }
                else if(_type == 'docx'){ // WORD文档
                    _format = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                }
                else if(_type == 'doc'){
                    _format = 'application/msword';
                }
                else if(_type == 'mp3'){ // 视频
                    _format = 'audio/mpeg';   
                }
                else if(_type == 'mp4'){
                    _format = 'audio/mp4, video/mp4';
                }
                dFileArr.push(_format);
            }
            dFileType = Array.from(new Set(dFileArr)).join(','); // 数组去重后变成字符串
        }
        // else{
        //     alert('fileType参数要为数组格式，请检查！');
        //     return;
        // }
       
        
        // if (typeof (elNode) == "string") {
        //     // elNode = document.getElementById(elNode);
        // }
        // if(elNode == '' || elNode == null || typeof elNode == 'undefined'){
        //     alert('找不到上传节点DOM对象\n请检查<input type="file">标签的ID属性值与获取Dom对象的ID是否一致');
        //     return false;
        // }
        // console.log('elNode:', elNode)
        var elements = [];
        if (typeof (elNode) == "string") {
            // 根据class/id获取节点
            var idElement = document.getElementById(elNode.toString().replace(/\#/g, ''));
            if (idElement) {
                elements.push(idElement);
            }
            else {
                var node = elNode.indexOf('.') >= 0 ? elNode : '.' + elNode;
                var classElements = document.querySelectorAll(node);
                elements = Array.prototype.slice.call(classElements);
            }
        }
        else {
            elements.push(elNode);
        }
        if(elements.length == 0) {
            alert('找不到上传节点DOM对象\n请检查<input type="file">标签的ID属性值与获取Dom对象的ID是否一致');
            return;
        }
        // console.log('elements：', elements)

        var pureIdClassName = container.toString().replace(/(\#|\.)/g, '');

        var eleParent = null;
        if(container != '') { 
            // case1.事件绑定到父节点上(当有动态增加的input type="file"时需要这样)
            var idParent = document.getElementById(pureIdClassName);
            if(idParent) {
                eleParent = idParent;
            }
            else {
                eleParent = document.querySelector('.' + pureIdClassName);
            }
            if(eleParent == null) {
                // 兜底：若没有固定父容器，绑定到body上(不推荐，性能较差)
                eleParent = document.body;
            }
            if(eleParent != null) {
                // 父容器下所有input type="file"节点限制图片类型
                var allInput = eleParent.getElementsByTagName('input');
                for(var i = 0; i < allInput.length; i++){
                    var someInput = allInput[i];
                    // 兼容ie下type属性可能被动态修改的情况(用getAttribute获取原始值)
                    if(someInput.getAttribute('type') == 'file') {
                        someInput.setAttribute('accept', dFileType); // 设置图片类型   
                    }   
                }
                // 父容器触发change事件
                Event.addEvents(eleParent, events, function(e){
                    var event = e || window.event;
                    var target = event.target || event.srcElement;
                    // 找到 input type="file"节点
                    if(target && target.type === 'file') {
                        fnRunChangeEvent(target, e);

                        // 关键步骤：清空值以允许重新选择相同文件 add 20260128-1
                        // // target.value = ''; 
                        // resetFileInput(target);
                    }
                }, false)
            }
        }
        
        else { 
            // case2.事件直接绑定到 input type="file"上。有动态新增的节点时会导致无效，故有缺陷
            // 添加功能出发监听事件
            elements.forEach( function(dom, index) {
                dom.setAttribute('accept', dFileType); // 设置图片类型
                Event.addEvents(dom, events, function(e){
                    fnRunChangeEvent(dom, e);
                    // 关键步骤：清空值以允许重新选择相同文件 add 20260128-1
                    // // dom.value = ''; 
                    // resetFileInput(dom);
                }, false);
            });
            // console.log('xxx')
        }


        // 重置file input type file 文件输入控件（兼容所有浏览器，重点适配IE） add 20260128-1
        function resetFileInput(fileInput) {
            if (fileInput) {
                // IE浏览器特殊处理
                if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.userAgent.indexOf('Trident') !== -1) {
                    // 方法1：通过克隆节点重置（IE有效）
                    var newInput = fileInput.cloneNode(true);
                    newInput.onchange = fileInput.onchange;
                    fileInput.parentNode.replaceChild(newInput, fileInput);
                } else {
                    // 其他浏览器直接清空value
                    fileInput.value = '';
                    // 对于现代浏览器的额外处理
                    if (fileInput.files) {
                        fileInput.files = new DataTransfer().files;
                    }
                }
            }
        }

        // input file change 事件
        function fnRunChangeEvent(dom, e){
            if(!browserCompatible){
                var version = getInternetExplorerVersion();
                if(version < 10){
                    alert('上传功能不支持当前浏览器！\n您正在使用的是老掉牙的IE' + version + '浏览器，请升级至IE10、IE11，或使用360、谷歌、火狐等现代浏览器');
                    return false;
                }
            }
            var that = this;
            var files = null;
            //var files = e.target.files;
            //alert(e.target.value);
            //console.log('files:', files);
            
            if (!dom.files) { // 不支持files对象（IE10以下浏览器) edit 20260108-1
                /*
                *1.低版本IE由于JS安全问题，不允许JS访问本地文件,所以无法获取files对象
                对于低版本的IE可以使用ActiveXObject获取文件对象, 但是默认情况下
                ActiveXObject为不可用的, 所以要想使用此对象要先启用设置, 即:
                方法1：
                    Tools(工具) / Internet options(选项) / Security(安全) / Custom level(自定义级别)
                    找到"Initialize and script ActiveX controls not marked as safe for scripting"，设置为"Enable(not secure)"即可.
                方法2：通过js new一个ActiveXObject（仅本地调试可用）
                */
                var fso = null;
                var path = "";
                var files = null;
                
                // ===== 核心修复1：增加ActiveX创建容错，兼容IE9安全策略 =====
                try {
                    // IE9需先确认ActiveX支持，且优先用32位IE运行
                    if (typeof ActiveXObject !== "undefined") {
                        // 尝试创建FSO对象，捕获"Automation服务器不能创建对象"错误
                        fso = new ActiveXObject("Scripting.FileSystemObject");
                    } else {
                        throw new Error("当前浏览器不支持ActiveXObject");
                    }
                } catch (e) {
                    alert("IE9文件操作失败：\n1. 请将页面加入「本地intranet区域」\n2. 启用ActiveX控件（工具→Internet选项→安全→自定义级别）\n3. 以管理员身份运行32位IE\n错误详情：" + e.message);
                    // 降级处理：终止后续逻辑，避免页面崩溃
                    return;
                }

                /*
                * 2.获取文件路径
                出于安全性的考虑，低版本IE上传文件时屏蔽了真实的本地文件路径,
                以C:\fakepath\**取而代之, 所以默认情况下ie8及以下浏览器通过fileEle.value 不能获取到
                文件的真实路径.
                如果想获取真实路径, 有两种方式:
                    1. 通过设置IE的安全设置, 即:
                        Tools(工具) / Internet options(选项) / Security(安全) / Custom level(自定义级别)
                        找到"Include local directory path when uploading files to a server"，设置为"Enable"
                    2. 使用JS获取, 即:
                        fileEle.select().blur();
                        var filePath = document.selection.createRange().text;
                */
                // ===== 核心修复2：IE9路径获取容错，避免selection为空 =====
                try {
                    dom.select();
                    dom.blur();
                    // IE9下document.selection可能为空，增加判断
                    var selRange = document.selection.createRange();
                    if (selRange && selRange.text) {
                        path = selRange.text;
                    } else {
                        // 兜底：尝试从value中截取伪路径（虽非真实路径，但避免空值）
                        path = dom.value.replace(/^C:\\fakepath\\/, "");
                        alert("无法获取真实文件路径，请开启IE安全设置：\nInclude local directory path when uploading files to a server");
                    }
                } catch (e) {
                    alert("获取文件路径失败：" + e.message);
                    return;
                }

                // 3.获取文件对象
                // ===== 核心修复3：增加路径非空判断 + FSO方法容错 =====
                try {
                    if (fso && path && fso.FileExists(path)) { // 判断文件是否存在
                        files = fso.GetFile(path); // 获取文件对象
                    } else {
                        throw new Error("文件不存在或路径无效：" + path);
                    }
                } catch (e) {
                    alert("获取文件对象失败：" + e.message + "\n请确认文件路径正确且IE已开启本地路径显示权限");
                    return;
                }

                // console.info("文件类型:" + files.type);
                // console.info("文件名称:" + files.name);
                // console.info("文件大小:" + files.size);
                
                // ===== 核心修复4：调用压缩函数前增加对象校验 =====
                if (files) {
                    compressFile({
                        object: files,
                        maxWidth: maxWidth,
                        index: 0,
                        maxSize: maxSize,
                        minSize: minSize,
                        quality: quality,
                        callBack: function(e) {
                            var index = e["index"];
                            arr.push(e);
                            if (index == (len - 1)) {
                                if (settings.callBack) { // 回调
                                    // console.log('dom2：', dom);
                                    settings.callBack(arr, dom);
                                    that.value = ''; // 加不加都行，解决无法上传重复图片的问题。
                                }
                            }
                        }
                    });
                } else {
                    alert("文件对象为空，无法执行压缩操作");
                }
            }

            else{ 

                files = e.target.files;
                var arr = [];
                var len = files.length;
                for(var k = 0; k < len; k++){
                    var fileObj = files[k];  //var fileObj = files[0]; //this.files[0];
                    //console.log('fileObj:', fileObj);
                    compressFile({
                        object: fileObj,
                        maxWidth: maxWidth,
                        index: k,
                        maxSize: maxSize,
                        minSize: minSize,
                        quality: quality,
                        callBack: function(e){
                            var index = e["index"];
                            arr.push(e);
                            if(index == (len - 1)){
                                if(settings.callBack){ //回调
                                    settings.callBack(arr, dom);

                                    // 关键步骤：清空值以允许重新选择相同文件 add 20260128-1
                                    // that.value = ''; //加不加都行，解决无法上传重复图片的问题。
                                    // dom.value = '';
                                    resetFileInput(dom); 
                                }
                            }
                        }
                    })
                }
            }
        }
    };





    /*+------------------------------------------------+*/
    /**
     * 利用canvas进行图片压缩，并转化成base64地址
     * @param {*} options 
     */
    var compressFile = function(options){
        var defaults = {
            object: null, //图片对象,一般为<input type="file" id="file">标签已有的files属性,获取方式: $('#file').files[0] 或 this.files[0]
            callBack: null, //回调. callBack:function(e), 其中 e格式：{index:"图片索引", url:"图片base64地址", files:"压缩后图片信息json", oldFiles:"压缩前图片信息json"}

            index:0, //当前图片索引值(用于当有多张图片需要压缩时),默认0(可选)
            maxWidth: 1200, //图片最大宽度(PX),默认1200(可选)
            maxSize: 200, //图片最大质量(KB),默认200(可选)
            minSize: 5, //图片最小质量(KB),默认5(可选)
            quality: 0.7 //压缩系数,0-1之间,默认0.7(可选)
        }
        //var settings = $.extend(true, {}, defaults, options || {}); //IE9及以下浏览器不支持深度合并
        var settings = $.extend({}, defaults, options || {});

        var fileObj = settings.object,
            index = settings.index,
            maxWidth = settings.maxWidth,
            maxSize = settings.maxSize,
            minSize = settings.minSize,
            quality = settings.quality;
        //console.log('fileObj:', fileObj);

        //校验类型
        var ieVersion = getInternetExplorerVersion();
        if(ieVersion < 10){ //ie10-
            if (!/[jpg|png|gif|bmp|jpeg](.*?)/.test(fileObj.type.toString().toLocaleLowerCase())) {
                alert("请确保文件为图像类型");
                return false;
            }
        }else{ //not ie or ie9+
            if (!/image\/\w+/.test(fileObj.type)) {
                alert("请确保文件为图像类型");
                return false;
            }
        }

        //开始执行
        var image = new Image();
        var reader = new FileReader();//读取客户端上的文件
        reader.onload = function (e) {
            //var url = reader.result; //读取到的文件内容.这个属性只在读取操作完成之后才有效,并且数据的格式取决于读取操作是由哪个方法发起的.所以必须使用reader.onload，
            //image.src = url; //reader读取的文件内容是base64,利用这个url就能实现上传前预览图片
            image.src = e.target.result;
        }
        reader.readAsDataURL(fileObj); //预览图片
        image.onload = function () {
            //生成比例
            var width = image.width, height = image.height;
            //计算缩放比例
            var rate = 1;
            if (width >= height) {
                if (width > maxWidth) {
                    rate = maxWidth / width;
                }
            } else {
                if (height > maxWidth) {
                    rate = maxWidth / height;
                }
            }
            //生成canvas
            var canvas = document.createElement("canvas");
                context = canvas.getContext("2d"),
                imageWidth = width * rate,
                imageHeight = height * rate;
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            context.drawImage(image, 0, 0, imageWidth, imageHeight);
            /*
            canvas.toDataURL(type, encoderOptions); 
            type 可选, 图片格式，默认为 image/png
            encoderOptions 可选，在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略。
            */
            // edit by chr 20230502
            var cType = fileObj.type; // 'image/png' 或 'image/jpeg' 一定要和原图片的一样,比如原图片是png,如果这里写成jpeg,则会卡死掉
            var base64 = canvas.toDataURL(cType, quality); //转成base64
            //将图片压缩到自己想要的质量KB，quality初始值根据情况自定
            while (base64.length / 1024 > maxSize) { //①高于最大质量(KB)时
                quality -= 0.01;
                base64 = canvas.toDataURL(cType, quality);
            }
            while (base64.length / 1024 < minSize) { //②防止最后一次压缩低于最低质量(KB)，只要quality递减合理，无需考虑
                quality += 0.001;
                base64 = canvas.toDataURL(cType, quality);
            }


            //转成file对象
            /*
            //方法1：base64直接转换成file对象(存在兼容性问题)
            var arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1], 
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) { //转成blob,并更新图片信息
                u8arr[n] = bstr.charCodeAt(n);
            }
            //var files = new window.File([new Blob([u8arr], {type: mime})], 'test.jpeg', {type: 'image/jpeg'}); //转成file
            var files = new File([new Blob([u8arr], {type: mime})], 'test.jpeg', {type: 'image/jpeg'}); //转成file
            */
            //方法2：先将base64转换成blob对象，再将blob对象转换成file对象。
            var files = blobToFile(dataURLtoBlob(base64), fileObj.name);
            
            if(settings.callBack){ //回调,返回图片URL(base64)、图片信息
                settings.callBack({
                    "index": index,
                    "url": base64,
                    "files": files,
                    "oldFiles": fileObj
                })
            }
        }
        
    };




    /*+------------------------------------------------+*/
    /**
     * 获取ie浏览浏览浏览器版本号
     * 如果是ie浏览器则返回对应版本号
     */
    var getInternetExplorerVersion = function(){
        var version = 999;
        if(navigator.appName.toLocaleLowerCase() == 'microsoft internet explorer'){
            version = parseInt(navigator.userAgent.toLocaleLowerCase().split(';')[1].toString().replace(/msie/g, '').replace(/[ ]/g,''));
        }
        return version;
    };



    /*+------------------------------------------------+*/
    //base64直接转化成file对象兼容性问题，故需将base64转换成blob对象，再将blob对象转换成file对象。
    // 写法1：不兼容ie10
    /**
     * 将base64转换为blob对象
     * @param {*} dataurl base64地址
     * @return {*} 返回 blob对象
     */
    // var dataURLtoBlob = function(dataurl) {
    //     var arr = dataurl.split(','),
    //         mime = arr[0].match(/:(.*?);/)[1],
    //         bstr = atob(arr[1]),
    //         n = bstr.length,
    //         u8arr = new Uint8Array(n);
    //     while (n--) {
    //         u8arr[n] = bstr.charCodeAt(n);
    //     }
    //    // console.log('u8arr：', u8arr, '\nmine：', mime, '\nbstr：', n)
    //     return new Blob([u8arr], {type: mime });
    // }
 

    // 写法2：兼容ie10的写法 add 20260108-1
    /**
     * 将base64转换为blob对象
     * @param {*} dataurl base64地址
     * @return {*} 返回 blob对象
     */
    var dataURLtoBlob = function(dataurl) {
        // 修复1：移除全角空格，规范变量声明（IE10 解析严格）
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length;
        // 修复2：替换 Uint8Array（IE10 不支持），改用 ArrayBuffer + DataView
        var arrayBuffer = new ArrayBuffer(n);
        var dataView = new DataView(arrayBuffer); // IE10 支持 DataView/ArrayBuffer

        while (n--) {
            dataView.setUint8(n, bstr.charCodeAt(n)); // 逐字节写入数据
        }
        // console.log('arrayBuffer：', arrayBuffer, '\nmime：', mime, '\nbstr：', n);

        // 修复3：IE10 兼容的 Blob 创建（参数格式严格符合要求）
        try {
            // IE10 要求：数据必须是数组 + options 必须有 type（即使为空）
            return new Blob([arrayBuffer], { type: mime });
        } catch (e) {
            // 兜底：若仍报 InvalidStateError，简化 options
            return new Blob([arrayBuffer], { type: mime || '' });
        }
    }


    /**
     * 将blob对象转换成file对象
     * @param {*} theBlob blob对象
     * @param {*} fileName 文件名
     * 调用方法：blobToFile(dataURLtoBlob(dataurl), fileName)
     */
    var blobToFile = function(theBlob, fileName){
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        theBlob.type = 'image/jpeg';
        return theBlob;
    }








    ///========================================================================================///
    /*+------------------------------------------------+*/
    /**
     * 对外暴露接口
     */
    $.fn.extend({
        uploadFile: uploadFile, //上传文件(内含压缩文件功能)
        compressFile: compressFile //压缩文件
    });


})(jQuery);






/**--------------------------------
 * neuiCanvasUpload 对象
 --------------------------------*/
var neuiCanvasUpload = {
    uploadFile: $('body').uploadFile,
    compressFile: $('body').compressFile
}