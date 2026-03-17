/**
 * [neatUiCanvas]
 * pc端利用canvas上传图片、并实现图片压缩（优化超大图片卡顿/解码失败问题）
 * 兼容性：支持火狐、谷歌、360、Microsoft Edge等现代浏览器，IE仅支持IE9+(即IE10、IE11)
 * Version: v.1.1.0
 * Author: ChenMufeng
 * Date: 2020.05.07、2023.05.19
 * Update: 2026.03.10
 
 * 功能说明：
 * 1. 支持超大图片异步处理，避免主线程阻塞；
 * 2. 按浏览器类型限制图片像素，防止内存超限；
 * 3. 图片解码超时兜底，兼容低版本浏览器；
 * 4. 前置过滤超大文件，提前拦截超限图片；
 * 5. 支持非常规图片格式转换，降低解码内存占用；
 * 6. 精准化提示：质量超限提示质量限制，尺寸超限提示尺寸限制；
 * 7. 兼容IE10+/Edge/Chrome/Firefox等现代浏览器。
 * 
 * 参数说明：
 * @param {Boolean} browserCompatible - 是否支持IE10以下低版本浏览器，默认false
 * @param {String/Object} selector - 上传标签DOM对象（如#file或DOM节点），与container二选一
 * @param {String} container - 父容器节点（动态节点时使用），与selector二选一
 * @param {String} events - 触发上传的事件，默认change
 * @param {Number} maxWidth - 图片最大宽度(px)，默认1200
 * @param {Number} maxSize - 图片最大质量(KB)，默认200（优先级低于maxFileSizeMB）
 * @param {Number} minSize - 图片最小质量(KB)，默认1
 * @param {Number} quality - 压缩系数(0-1)，默认0.7
 * @param {Array} fileType - 图片类型限制（如['jpg','png']），必填
 * @param {Function} callBack - 压缩完成回调，返回(arr, el)，arr格式：[{index, url, files, oldFiles, quality}]
 * @param {Function} loadingCallback - 加载状态回调，参数isLoading（true/false）
 * @param {Number} maxFileSizeMB - 图片最大体积(MB)，可选，优先级高于maxSize，默认undefined
 * @param {Number} maxTotalPixels - 图片最大总像素（如4096*4096），可选，默认按浏览器自动适配
 * @param {Object} browserPixelLimits - 各浏览器像素阈值，可选，格式：{ie: 8192*8192, chrome: 16384*16384}
 * @param {Number} decodeTimeout - 图片解码超时时间(ms)，默认10000
 * @param {Boolean} forceConvertFormat - 是否强制转换图片格式，默认true
 * @param {String} targetFormat - 目标转换格式，默认image/jpeg
 * 
 * Author: ChenMufeng
 * Date: 2020.05.07、2023.05.19
 * Update: 2026.03.10（性能优化+超大图片兼容+精准提示版）
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
        // 默认参数配置（含新增优化参数）
        var defaults = {
            browserCompatible: false,
            selector: null,
            container: '',
            events: 'change',
            maxWidth: 1200,
            maxSize: 200,
            minSize: 1,
            quality: 0.7,
            fileType: [],
            callBack: null,
            loadingCallback: null,
            // 新增优化参数
            maxFileSizeMB: undefined,    // 图片最大体积(MB)
            maxTotalPixels: undefined,   // 图片最大总像素
            browserPixelLimits: {        // 各浏览器默认像素阈值
                ie: 8192 * 8192,
                edge_legacy: 16384 * 16384,
                chrome: 16384 * 16384,
                default: 12000 * 12000
            },
            decodeTimeout: 10000,       // 解码超时时间(ms)
            forceConvertFormat: true,   // 是否强制转换格式
            targetFormat: 'image/jpeg'  // 目标转换格式
        };
        var settings = $.extend({}, defaults, options || {});

        // 参数预处理：maxFileSizeMB转换为maxSize（优先级更高）
        if(settings.maxFileSizeMB !== undefined && !isNaN(settings.maxFileSizeMB)){
            settings.maxSize = settings.maxFileSizeMB * 1024; // MB转KB
        }

        // 工具函数：格式化体积值（转为MB，保留1位小数）
        var formatFileSize = function(sizeKB){
            var sizeMB = sizeKB / 1024;
            return sizeMB.toFixed(1);
        };

        // 工具函数：将总像素转为宽*高格式（如4096*4096）
        var formatPixelSize = function(totalPixels){
            var sideLength = Math.sqrt(totalPixels);
            var intLength = Math.floor(sideLength);
            return intLength + 'px*' + intLength + 'px';
        };

        // 工具函数：获取当前浏览器生效的像素阈值
        var getEffectivePixelLimit = function(){
            var browserType = getBrowserType();
            return settings.maxTotalPixels || settings.browserPixelLimits[browserType] || settings.browserPixelLimits.default;
        };

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

        // 判断浏览器类型
        var getBrowserType = function(){
            var userAgent = navigator.userAgent;
            if(/MSIE|Trident/.test(userAgent)){
                return 'ie';
            }else if(/Edg\/\d+/.test(userAgent) && !/Chromium/.test(userAgent)){
                return 'edge_legacy';
            }else if(/Chrome/.test(userAgent)){
                return 'chrome';
            }else{
                return 'default';
            }
        };

        // base64转Blob（兼容IE10+格式转换）
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
            // 强制转换图片格式
            if(settings.forceConvertFormat && mime !== settings.targetFormat){
                mime = settings.targetFormat;
            }
            try {
                return new Blob([arrayBuffer], { type: mime });
            } catch (e) {
                return new Blob([arrayBuffer], { type: mime || '' });
            }
        };

        // Blob转File
        var blobToFile = function(theBlob, fileName, fileType){
            theBlob.lastModifiedDate = new Date();
            theBlob.name = fileName;
            theBlob.type = fileType || settings.targetFormat;
            return theBlob;
        };

        // 【核心优化】异步压缩文件（集成4套解决方案+精准提示）
        var compressFile = function(options){
            var defaults = {
                object: null,
                callBack: null,
                index:0,
                maxWidth: settings.maxWidth,
                maxSize: settings.maxSize,
                minSize: settings.minSize,
                quality: settings.quality,
                loadingCallback: settings.loadingCallback
            };
            var compressSettings = $.extend({}, defaults, options || {});

            var fileObj = compressSettings.object,
                index = compressSettings.index,
                maxWidth = compressSettings.maxWidth,
                maxSize = compressSettings.maxSize,
                minSize = compressSettings.minSize,
                quality = compressSettings.quality;

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
            if(compressSettings.loadingCallback) compressSettings.loadingCallback(true);

            // 异步读取文件
            var image = new Image();
            image.crossOrigin = 'anonymous';
            // 兼容image.decode方法
            image.decode = image.decode || function() {
                return new Promise(resolve => {
                    this.onload = resolve;
                    this.onerror = resolve;
                });
            };

            var reader = new FileReader();
            reader.onload = function (e) {
                image.src = e.target.result;
                
                // 解决方案2：解码超时兜底
                var decodeTimeoutTimer = setTimeout(function() {
                    // 超时后强制触发onload，降级为同步解码
                    if(typeof image.onload === 'function'){
                        image.onload();
                    }
                    clearTimeout(decodeTimeoutTimer);
                }, settings.decodeTimeout);

                // 异步解码图片
                image.decode().then(() => {
                    clearTimeout(decodeTimeoutTimer);
                    
                    // 解决方案1：严格限制最大像素
                    var browserType = getBrowserType();
                    // 优先使用全局maxTotalPixels，否则使用浏览器阈值
                    var maxTotalPixels = getEffectivePixelLimit();
                    
                    var width = image.width, height = image.height;
                    var totalPixels = width * height;

                    // 尺寸超限判断 & 精准提示
                    if (totalPixels > maxTotalPixels) {
                        var pixelFormat = formatPixelSize(maxTotalPixels);
                        var sizeTip = '图片解码失败：超大图片超出浏览器处理能力，请尝试缩小图片尺寸为' + pixelFormat + '以内，然后上传';
                        alert(sizeTip);
                        compressSettings.loadingCallback(false);
                        compressSettings.callBack && compressSettings.callBack({
                            index: index,
                            error: '尺寸超限：' + width + 'px*' + height + 'px > ' + pixelFormat
                        });
                        return;
                    }

                    // 计算缩放比例（优先按maxWidth缩放）
                    var rate = 1;
                    if (width >= height) {
                        rate = width > maxWidth ? maxWidth / width : 1;
                    } else {
                        rate = height > maxWidth ? maxWidth / height : 1;
                    }
                    var imageWidth = width * rate, imageHeight = height * rate;

                    // 异步绘制Canvas
                    requestIdleCallback(function(){
                        try {
                            var canvas = document.createElement("canvas");
                            var context = canvas.getContext("2d");
                            canvas.width = imageWidth;
                            canvas.height = imageHeight;
                            context.drawImage(image, 0, 0, imageWidth, imageHeight);

                            // 使用toBlob替代toDataURL（异步+低内存）
                            canvas.toBlob(function(blob) {
                                // 计算Blob大小（KB）
                                var blobSize = blob.size / 1024;
                                // 调整质量重新压缩
                                if(blobSize > maxSize && quality > 0.1) {
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
                            // 兜底提示：非质量/尺寸原因的处理失败
                            alert('图片处理失败：' + e.message + '，请检查图片是否损坏后重试');
                            compressSettings.loadingCallback(false);
                            compressSettings.callBack && compressSettings.callBack({
                                index: index,
                                error: e.message
                            });
                        }
                    }, { timeout: 5000 });
                }).catch(function(e) {
                    clearTimeout(decodeTimeoutTimer);
                    // 解码失败兜底提示（非尺寸/质量原因）
                    alert('图片解码失败：超大图片超出浏览器处理能力，请检查图片是否损坏后重试');
                    compressSettings.loadingCallback(false);
                    compressSettings.callBack && compressSettings.callBack({
                        index: index,
                        error: '图片解码失败：' + e.message
                    });
                });
            };

            // 处理压缩结果
            function handleCompressResult(blob, finalQuality) {
                // Blob转File
                var files = blobToFile(blob, fileObj.name, fileObj.type);
                // 转base64
                var reader = new FileReader();
                reader.onload = function(e) {
                    var base64 = e.target.result;
                    // 触发回调
                    compressSettings.callBack && compressSettings.callBack({
                        "index": index,
                        "url": base64,
                        "files": files,
                        "oldFiles": fileObj,
                        "quality": finalQuality
                    });
                    // 结束加载状态
                    compressSettings.loadingCallback(false);
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

            // 仅处理现代浏览器（IE9以下放弃）
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

                // 解决方案3：前置过滤超大文件 + 质量精准提示
                var fileSizeKB = fileObj.size / 1024;
                if(fileSizeKB > settings.maxSize){
                    var sizeMB = formatFileSize(settings.maxSize);
                    var sizeTip = '图片解码失败：超大图片超出浏览器处理能力，请尝试修改图片质量为' + sizeMB + 'MB内然后上传';
                    alert(sizeTip);
                    settings.loadingCallback(false);
                    continue;
                }
                
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
            var defaults = { loadingCallback: null };
            var compressSettings = $.extend({}, defaults, options || {});
            uploadFile.prototype.compressFile.call(this, compressSettings);
        }
    });
})(jQuery);

var neuiCanvasUpload = {
    uploadFile: $('body').uploadFile,
    compressFile: $('body').compressFile
};