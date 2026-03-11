/**
 * [neatUiCanvas]
 * pc端利用canvas上传图片、并实现图片压缩（优化超大图片卡顿问题）
 * 兼容性：支持火狐、谷歌、360、Microsoft Edge等现代浏览器，IE仅支持IE9+(即IE10、IE11)
 * Version: v.1.0.1
 * Author: ChenMufeng
 * Date: 2020.05.07、2023.05.19
 * Update: 2026.03.10
 */
 (function($){
    // 兼容IE的事件绑定
    var Event = {};
    Event.addEvents = function(target, eventType, handle){
        if(document.addEventListener){
            Event.addEvents = function(target, eventType, handle){
                target.addEventListener(eventType, handle, false);
            };
        }else{
            Event.addEvents = function(target,eventType,handle){
                target.attachEvent('on' + eventType, function(){
                    handle.call(target, arguments);
                });
            };
        };
        Event.addEvents(target, eventType, handle);
    };

    // 核心：上传文件逻辑（优化版）
    var uploadFile = function(options){
        var defaults = {
            browserCompatible: false,
            selector: null,
            container: '',
            events: 'change',
            maxWidth: 1200, // 建议降低默认值，比如800px，进一步减少计算量
            maxSize: 200,
            minSize: 1,
            quality: 0.7,
            fileType: [],
            callBack: null,
            // 新增：加载状态回调（用于显示loading）
            loadingCallback: null
        }
        var settings = $.extend({}, defaults, options || {});
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
                var _type = settings.fileType[i].toString().toLocaleLowerCase().replace(/\./g, '');
                var _format = '';
                if(_type == 'jpg' || _type == 'jpeg'){
                    _format = 'image/jpeg';
                }else if(_type == 'png'){
                    _format = 'image/png';
                }else if(_type == 'gif'){
                    _format = 'image/gif';
                }else if(_type == 'pdf'){
                    _format = 'application/pdf';
                }else if(_type == 'xls'){
                    _format = 'application/vnd.ms-excel';
                }else if(_type == 'xlsx'){
                    _format = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                }else if(_type == 'docx'){
                    _format = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                }else if(_type == 'doc'){
                    _format = 'application/msword';
                }else if(_type == 'mp3'){
                    _format = 'audio/mpeg';   
                }else if(_type == 'mp4'){
                    _format = 'audio/mp4, video/mp4';
                }
                dFileArr.push(_format);
            }
            dFileType = Array.from(new Set(dFileArr)).join(',');
        }

        // 获取目标元素
        var elements = [];
        if (typeof (elNode) == "string") {
            var idElement = document.getElementById(elNode.toString().replace(/\#/g, ''));
            if (idElement) {
                elements.push(idElement);
            } else {
                var node = elNode.indexOf('.') >= 0 ? elNode : '.' + elNode;
                var classElements = document.querySelectorAll(node);
                elements = Array.prototype.slice.call(classElements);
            }
        } else {
            elements.push(elNode);
        }
        if(elements.length == 0) {
            alert('找不到上传节点DOM对象');
            return;
        }

        // 重置file input（兼容所有浏览器）
        function resetFileInput(fileInput) {
            if (fileInput) {
                if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.userAgent.indexOf('Trident') !== -1) {
                    var newInput = fileInput.cloneNode(true);
                    newInput.onchange = fileInput.onchange;
                    fileInput.parentNode.replaceChild(newInput, fileInput);
                } else {
                    fileInput.value = '';
                    if (fileInput.files) {
                        fileInput.files = new DataTransfer().files;
                    }
                }
            }
        }

        // 获取IE版本
        var getInternetExplorerVersion = function(){
            var version = 999;
            if(navigator.appName.toLocaleLowerCase() == 'microsoft internet explorer'){
                version = parseInt(navigator.userAgent.toLocaleLowerCase().split(';')[1].toString().replace(/msie/g, '').replace(/[ ]/g,''));
            }
            return version;
        };

        // base64转Blob（兼容IE10）
        var dataURLtoBlob = function(dataurl) {
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length;
            var arrayBuffer = new ArrayBuffer(n);
            var dataView = new DataView(arrayBuffer);
            while (n--) {
                dataView.setUint8(n, bstr.charCodeAt(n));
            }
            try {
                return new Blob([arrayBuffer], { type: mime });
            } catch (e) {
                return new Blob([arrayBuffer], { type: mime || '' });
            }
        }

        // Blob转File
        var blobToFile = function(theBlob, fileName, fileType){
            theBlob.lastModifiedDate = new Date();
            theBlob.name = fileName;
            theBlob.type = fileType || 'image/jpeg';
            return theBlob;
        }

        // 【核心优化】异步压缩文件（拆分主线程阻塞）
        var compressFile = function(options){
            var defaults = {
                object: null,
                callBack: null,
                index:0,
                maxWidth: 1200,
                maxSize: 200,
                minSize: 5,
                quality: 0.7,
                loadingCallback: null // 新增：加载状态回调
            }
            var settings = $.extend({}, defaults, options || {});

            var fileObj = settings.object,
                index = settings.index,
                maxWidth = settings.maxWidth,
                maxSize = settings.maxSize,
                minSize = settings.minSize,
                quality = settings.quality;

            // 校验类型
            var ieVersion = getInternetExplorerVersion();
            if(ieVersion < 10){
                if (!/[jpg|png|gif|bmp|jpeg](.*?)/.test(fileObj.type.toString().toLocaleLowerCase())) {
                    alert("请确保文件为图像类型");
                    return false;
                }
            }else{
                if (!/image\/\w+/.test(fileObj.type)) {
                    alert("请确保文件为图像类型");
                    return false;
                }
            }

            // 触发加载中状态
            if(settings.loadingCallback) settings.loadingCallback(true);

            // 【优化1】异步读取文件（避免同步阻塞）
            var image = new Image();
            // 关键：跨域/大图片处理
            image.crossOrigin = 'anonymous';
            // 限制图片解码尺寸（防止超大图片内存爆炸）
            image.decode = image.decode || function() {
                return new Promise(resolve => {
                    this.onload = resolve;
                    this.onerror = resolve;
                });
            };

            var reader = new FileReader();
            reader.onload = function (e) {
                image.src = e.target.result;
                // 【优化2】异步解码图片（释放主线程）
                image.decode().then(() => {
                    // 【优化3】限制最大像素（防止Canvas尺寸超限）
                    var MAX_PIXELS = 16384 * 16384; // 浏览器Canvas最大像素阈值
                    var width = image.width, height = image.height;
                    var totalPixels = width * height;
                    
                    // 如果总像素超过阈值，强制缩放到阈值内
                    if(totalPixels > MAX_PIXELS) {
                        var scale = Math.sqrt(MAX_PIXELS / totalPixels);
                        width = width * scale;
                        height = height * scale;
                    }

                    // 计算缩放比例（优先按maxWidth缩放）
                    var rate = 1;
                    if (width >= height) {
                        rate = width > maxWidth ? maxWidth / width : 1;
                    } else {
                        rate = height > maxWidth ? maxWidth / height : 1;
                    }
                    var imageWidth = width * rate, imageHeight = height * rate;

                    // 【优化4】使用requestIdleCallback异步绘制Canvas
                    requestIdleCallback(function(){
                        try {
                            var canvas = document.createElement("canvas");
                            var context = canvas.getContext("2d");
                            canvas.width = imageWidth;
                            canvas.height = imageHeight;
                            context.drawImage(image, 0, 0, imageWidth, imageHeight);

                            // 【核心优化】用toBlob替代toDataURL（异步+低内存）
                            canvas.toBlob(function(blob) {
                                // 计算Blob大小（KB）
                                var blobSize = blob.size / 1024;
                                // 仅当大小超出阈值时，才调整质量重新压缩（避免反复循环）
                                if(blobSize > maxSize && quality > 0.1) {
                                    // 直接计算目标质量，而非逐次递减（减少编码次数）
                                    var targetQuality = quality * (maxSize / blobSize);
                                    targetQuality = Math.max(0.1, Math.min(0.9, targetQuality));
                                    canvas.toBlob(function(newBlob) {
                                        handleCompressResult(newBlob, targetQuality);
                                    }, fileObj.type, targetQuality);
                                } else if(blobSize < minSize && quality < 0.9) {
                                    var targetQuality = quality * (minSize / blobSize);
                                    targetQuality = Math.max(0.1, Math.min(0.9, targetQuality));
                                    canvas.toBlob(function(newBlob) {
                                        handleCompressResult(newBlob, targetQuality);
                                    }, fileObj.type, targetQuality);
                                } else {
                                    handleCompressResult(blob, quality);
                                }

                                // 释放Canvas内存
                                canvas.width = 0;
                                canvas.height = 0;
                            }, fileObj.type, quality);
                        } catch (e) {
                            alert('图片处理失败：' + e.message);
                            settings.loadingCallback(false);
                            settings.callBack && settings.callBack({
                                index: index,
                                error: e.message
                            });
                        }
                    }, { timeout: 5000 }); // 5秒超时，避免卡死
                }).catch(function(e) {
                    console.error('图片解码失败：', e);
                    alert('图片解码失败：' + e.message);
                    settings.loadingCallback(false);
                    settings.callBack && settings.callBack({
                        index: index,
                        error: e.message
                    });
                });
            };

            // 处理压缩结果
            function handleCompressResult(blob, finalQuality) {
                // Blob转File
                var files = blobToFile(blob, fileObj.name, fileObj.type);
                // 转base64（仅在需要时，优先用Blob上传）
                var reader = new FileReader();
                reader.onload = function(e) {
                    var base64 = e.target.result;
                    // 触发回调
                    settings.callBack && settings.callBack({
                        "index": index,
                        "url": base64,
                        "files": files,
                        "oldFiles": fileObj,
                        "quality": finalQuality
                    });
                    // 结束加载状态
                    settings.loadingCallback(false);
                };
                reader.readAsDataURL(blob);
            }

            // 读取文件
            reader.readAsDataURL(fileObj);
        };

        // 处理change事件
        function fnRunChangeEvent(dom, e){
            if(!browserCompatible){
                var version = getInternetExplorerVersion();
                if(version < 10){
                    alert('上传功能不支持IE' + version + '浏览器，请升级至IE10+或使用现代浏览器');
                    return false;
                }
            }

            // 仅处理现代浏览器（IE9以下放弃，避免内存爆炸）
            if(!dom.files) {
                alert('超大图片处理不支持IE9及以下浏览器，请使用Chrome/Firefox');
                return;
            }

            var files = e.target.files;
            var arr = [];
            var len = files.length;
            // 触发全局加载状态
            if(settings.loadingCallback) settings.loadingCallback(true);
            
            for(var k = 0; k < len; k++){
                var fileObj = files[k];
                // 过滤非图片文件
                if(!/image\/\w+/.test(fileObj.type)) continue;
                
                compressFile({
                    object: fileObj,
                    maxWidth: maxWidth,
                    index: k,
                    maxSize: maxSize,
                    minSize: minSize,
                    quality: quality,
                    loadingCallback: settings.loadingCallback,
                    callBack: function(e){
                        if(e.error) {
                            console.error('压缩失败：', e.error);
                            return;
                        }
                        arr.push(e);
                        if(arr.length == len){
                            if(settings.callBack){
                                settings.callBack(arr, dom);
                            }
                            resetFileInput(dom);
                            // 结束加载状态
                            if(settings.loadingCallback) settings.loadingCallback(false);
                        }
                    }
                });
            }
        }

        // 绑定事件
        var pureIdClassName = container.toString().replace(/(\#|\.)/g, '');
        var eleParent = null;
        if(container != '') { 
            eleParent = document.getElementById(pureIdClassName) || document.querySelector('.' + pureIdClassName) || document.body;
            var allInput = eleParent.getElementsByTagName('input');
            for(var i = 0; i < allInput.length; i++){
                var someInput = allInput[i];
                if(someInput.getAttribute('type') == 'file') {
                    someInput.setAttribute('accept', dFileType);
                }   
            }
            Event.addEvents(eleParent, events, function(e){
                var event = e || window.event;
                var target = event.target || event.srcElement;
                if(target && target.type === 'file') {
                    fnRunChangeEvent(target, e);
                }
            }, false);
        } else { 
            elements.forEach( function(dom, index) {
                dom.setAttribute('accept', dFileType);
                Event.addEvents(dom, events, function(e){
                    fnRunChangeEvent(dom, e);
                }, false);
            });
        }
    };

    // 对外暴露接口
    $.fn.extend({
        uploadFile: uploadFile,
        compressFile: function(options){
            // 兼容旧接口，调用优化后的compressFile
            var defaults = { loadingCallback: null };
            var settings = $.extend({}, defaults, options || {});
            uploadFile.prototype.compressFile.call(this, settings);
        }
    });
})(jQuery);

var neuiCanvasUpload = {
    uploadFile: $('body').uploadFile,
    compressFile: $('body').compressFile
}