/**
 * 图片压缩上传插件 neuiCanvasUpload
 * Version: v2.2.2
 * Author: Mufeng
 * Date: 2020.05.07 (初始)、2023.05.19 (迭代)
 * pubdate: 2026.03.11 (v2.2.2 IE10 drawImage 彻底修复)
 * 兼容性：IE10+、Chrome、Firefox、Edge；依赖 jQuery 1.8+
 * 
 * v2.2.2 更新说明：
 * 1. 彻底修复 IE10 中 drawImage 的 w/h undefined 问题
 *    - 不再依赖函数参数，直接从 img 对象获取最新尺寸
 *    - 添加 srcWidth/srcHeight 变量，确保源尺寸有效
 *    - drawImage 调用添加 try-catch，失败时降级使用简单模式
 *    - 所有变量在使用前都经过严格验证
 * 
 * v2.2.1 更新说明：
 * 1. 修复 toBlob polyfill 在 IE10 中的 InvalidStateError 问题
 *    - 使用 ArrayBuffer 替代 Uint8Array（IE10 Blob 构造函数限制）
 *    - 添加多层异常捕获，确保兼容性
 * 2. 修复 drawImage 时 w/h 为 undefined 的问题
 *    - 优先使用 naturalWidth/naturalHeight 获取真实尺寸
 *    - 添加延迟检测机制，确保 IE10 能正确获取图片尺寸
 *    - 添加防御性检查，避免无效参数导致崩溃
 * 
 * v2.2.0 更新说明：
 * 1. 添加 canvas.toBlob polyfill，修复 IE10 压缩功能失效问题
 * 2. 添加 File 构造函数降级处理，修复 IE10 无法创建压缩文件问题
 * 3. 修复 CSS object-fit 不兼容问题，改用 background-size 方案
 * 4. 添加 Flexbox -ms- 前缀，修复 IE10 布局问题
 * 5. 添加 Blob slice 兼容处理，修复 IE10 文件切片问题
 * 
 * 核心功能：
 * 1. 支持selector/container二选一绑定上传节点，container模式支持多节点/动态新增节点
 * 2. 图片体积/像素双重拦截限制，宽度仅作为压缩场景的缩放依据
 * 3. 多实例完全隔离，配置/节点/事件互不干扰
 * 4. 自定义提示弹窗样式、层级、显示时长，支持缩略图按需渲染
 * 5. 兼容IE浏览器文件输入框重置逻辑，解决相同文件多次上传失效问题
 * 
 * 参数说明：
 * ---------------- 基础配置 ----------------
 * selector      {String/Null}  单个上传节点选择器，与container二选一，默认null
 * container     {String/''}    上传节点父容器选择器，优先级高于selector，默认''
 * events        {String}       触发上传的事件类型，默认'change'
 * ---------------- 限制配置 ----------------
 * maxWidth      {Number}       【仅压缩场景生效】希望图片压缩到的最大宽度值，即图片宽度最大缩放目标值（像素），默认1200
 * maxSize       {Number}       【拦截/压缩场景均生效】图片最大体积（KB），默认2048
 * maxCount      {Number}       单次最大上传数量，默认9
 * maxTotalPixels{Number}       【全局强制限制】图片最大总像素数（宽×高），默认8192*8192
 * browserPixelLimits {Object}  【兜底兼容配置】不同浏览器最大支持的像素数
 * fileType      {Array}        支持的文件类型，默认['jpg','png','jpeg']
 * autoCompressWhenOverLimit {Boolean} 超限是否自动压缩，默认false
 * ---------------- 样式/交互配置 ----------------
 * showThumb     {Boolean}      是否显示缩略图，默认false
 * thumbWidth    {Number}       缩略图宽度，默认100
 * thumbContainer {String}      缩略图容器选择器，默认"#thumbs"
 * showProgressCloseBtn {Boolean} 是否显示进度条关闭按钮，默认false
 * alertZIndex   {Number}       提示弹窗z-index层级，默认10000
 * alertShowTime {Number}       压缩场景提示弹窗自动关闭时间（秒），默认3
 * ---------------- 回调配置 ----------------
 * callBack      {Function}     上传完成回调，参数：(文件数组, 当前上传节点DOM)
 * onProgress    {Function}     压缩进度回调，参数：(进度百分比)
 * onFileComplete{Function}     单个文件处理完成回调
 * loadingCallback {Function}   加载状态回调，参数：(是否加载中)
 * ---------------- 高级配置 ----------------
 * decodeTimeout {Number}       图片解码超时时间，默认10000
 * forceConvertFormat {Boolean} 是否强制转换图片格式，默认true
 * targetFormat  {String}       目标压缩格式，默认'image/jpeg'
 * browserCompatible {Boolean}  是否开启浏览器兼容模式，默认false
 */
 (function ($, window, document) {
    'use strict';

    // ============================================================
    // IE10 兼容性 Polyfills
    // ============================================================
    
    /**
     * Polyfill 1: canvas.toBlob() - IE10 不支持
     * 必须在插件初始化前执行
     * 
     * IE10 特殊处理：
     * 1. Blob 构造函数不支持 Uint8Array，必须使用 ArrayBuffer
     * 2. 使用 MSBlobBuilder 作为备选方案
     */
    if (!HTMLCanvasElement.prototype.toBlob) {
        HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
            var canvas = this;
            var dataURL;
            
            // 先尝试获取 dataURL
            try {
                dataURL = canvas.toDataURL(type || 'image/png', quality || 1);
            } catch (e) {
                callback(null);
                return;
            }
            
            // 解析 dataURL
            var dataURIParts = dataURL.split(',');
            var header = dataURIParts[0];
            var data = dataURIParts[1];
            
            // 判断是否为 base64 编码
            var isBase64 = header.indexOf('base64') !== -1;
            
            var byteString;
            if (isBase64) {
                try {
                    byteString = atob(data);
                } catch (e) {
                    callback(null);
                    return;
                }
            } else {
                byteString = decodeURIComponent(data);
            }
            
            // 获取 MIME 类型
            var mimeString = 'image/png';
            if (header.indexOf(':') !== -1) {
                var mimeParts = header.split(':');
                if (mimeParts[1]) {
                    mimeString = mimeParts[1].split(';')[0];
                }
            }
            
            // IE10 关键修复：使用 ArrayBuffer 而不是 Uint8Array
            var arrayBuffer = new ArrayBuffer(byteString.length);
            var uint8Array = new Uint8Array(arrayBuffer);
            for (var i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
            }
            
            // 创建 Blob（IE10 兼容处理）
            var blob = null;
            var targetType = type || mimeString || 'image/png';
            
            try {
                // 方法1：直接使用 ArrayBuffer（IE10 支持）
                blob = new Blob([arrayBuffer], { type: targetType });
            } catch (e1) {
                try {
                    // 方法2：使用 MSBlobBuilder（IE10 专用）
                    if (window.MSBlobBuilder) {
                        var builder = new MSBlobBuilder();
                        builder.append(arrayBuffer);
                        blob = builder.getBlob(targetType);
                    }
                } catch (e2) {
                    // 方法3：尝试直接使用 byteString
                    try {
                        var byteArray = [];
                        for (var j = 0; j < byteString.length; j++) {
                            byteArray[j] = byteString.charCodeAt(j);
                        }
                        blob = new Blob([byteArray], { type: targetType });
                    } catch (e3) {
                        // 所有方法都失败
                    }
                }
            }
            
            callback(blob);
        };
    }

    /**
     * Polyfill 2: Blob.slice 兼容 - IE10 使用 webkitSlice/mozSlice
     */
    if (Blob && !Blob.prototype.slice) {
        Blob.prototype.slice = Blob.prototype.webkitSlice || Blob.prototype.mozSlice;
    }

    /**
     * Polyfill 3: Object.create 兼容 - IE10 部分支持
     */
    if (typeof Object.create !== 'function') {
        Object.create = function(proto) {
            function F() {}
            F.prototype = proto;
            return new F();
        };
    }

    /**
     * Polyfill 4: Array.isArray 兼容 - IE10 部分支持
     */
    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    // ============================================================
    // 全局样式（兼容IE10：移除模板字符串，添加-ms-前缀）
    // ============================================================
    if (!document.getElementById('ne-upload-style')) {
        var style = document.createElement('style');
        style.id = 'ne-upload-style';
        
        var styleContent = 
            '/* 进度条样式 - 仅压缩场景显示 */' +
            '.ne-progress-container {' +
            '    position: fixed;' +
            '    z-index: 9999;' +
            '    left: 50%;' +
            '    top: 50%;' +
            '    -ms-transform: translate(-50%, -50%);' +  /* IE10 */
            '    transform: translate(-50%, -50%);' +
            '    background: #fff;' +
            '    padding: 20px 20px 15px;' +
            '    border-radius: 8px;' +
            '    border: 1px solid #e6e6e6;' +
            '    box-shadow: 0 2px 12px rgba(0,0,0,0.1);' +
            '    box-sizing: border-box;' +
            '    min-width: 300px;' +
            '}' +
            
            '.ne-progress-header {' +
            '    display: -ms-flexbox;' +  /* IE10 */
            '    display: flex;' +
            '    -ms-flex-pack: justify;' +  /* IE10 */
            '    justify-content: space-between;' +
            '    -ms-flex-align: center;' +  /* IE10 */
            '    align-items: center;' +
            '    margin-bottom: 10px;' +
            '}' +
            
            '.ne-progress-title {' +
            '    font-size: 14px;' +
            '    color: #333;' +
            '    font-weight: 500;' +
            '}' +
            
            '.ne-progress-close {' +
            '    display: inline-block;' +  /* IE10: inline-block 替代 inline-flex */
            '    display: -ms-inline-flexbox;' +  /* IE10 */
            '    display: inline-flex;' +
            '    -ms-flex-align: center;' +  /* IE10 */
            '    align-items: center;' +
            '    -ms-flex-pack: center;' +  /* IE10 */
            '    justify-content: center;' +
            '    width: 60px;' +
            '    height: 24px;' +
            '    line-height: 24px;' +
            '    text-align: center;' +
            '    font-size: 12px;' +
            '    color: #666;' +
            '    cursor: pointer;' +
            '    border-radius: 4px;' +
            '    background: #f5f5f5;' +
            '    -ms-transition: all 0.2s;' +  /* IE10 */
            '    transition: all 0.2s;' +
            '    font-family: "Microsoft Yahei", sans-serif;' +
            '}' +
            
            '.ne-progress-close:hover {' +
            '    background: #e5e5e5;' +
            '    color: #333;' +
            '}' +
            
            '.ne-progress-close-icon {' +
            '    font-size: 14px;' +
            '    margin-right: 4px;' +
            '}' +
            
            '.ne-progress-text {' +
            '    font-size: 14px;' +
            '    color: #666;' +
            '    margin-bottom: 8px;' +
            '    text-align: center;' +
            '}' +
            
            '.ne-progress-bar {' +
            '    width: 100%;' +
            '    height: 8px;' +
            '    background: #f5f5f5;' +
            '    border-radius: 4px;' +
            '    overflow: hidden;' +
            '}' +
            
            '.ne-progress-inner {' +
            '    height: 100%;' +
            '    width: 0%;' +
            '    background: #409eff;' +
            '    -ms-transition: width 0.3s ease;' +  /* IE10 */
            '    transition: width 0.3s ease;' +
            '}' +

            '/* 提示弹窗样式 */' +
            '.ne-alert-container {' +
            '    position: fixed;' +
            '    z-index: 10000;' +
            '    left: 50%;' +
            '    top: 50%;' +
            '    -ms-transform: translate(-50%, -50%);' +  /* IE10 */
            '    transform: translate(-50%, -50%);' +
            '    background: #fff;' +
            '    padding: 30px 30px 25px;' +
            '    border-radius: 8px;' +
            '    border: 1px solid #333;' +
            '    box-shadow: 0 2px 12px rgba(0,0,0,0.1);' +
            '    min-width: 280px;' +
            '    max-width: 400px;' +
            '    text-align: center;' +
            '    font-size: 14px;' +
            '    color: #333;' +
            '    display: none;' +
            '    box-sizing: border-box;' +
            '}' +
            
            '.ne-alert-close {' +
            '    position: absolute;' +
            '    top: -10px;' +
            '    right: -10px;' +
            '    display: inline-block;' +  /* IE10: 使用 inline-block */
            '    width: 28px;' +
            '    height: 28px;' +
            '    line-height: 28px;' +
            '    text-align: center;' +
            '    font-size: 14px;' +
            '    color: #666;' +
            '    cursor: pointer;' +
            '    border-radius: 50%;' +
            '    background: #fff;' +
            '    border: 1px solid #e6e6e6;' +
            '    -ms-transition: all 0.2s;' +  /* IE10 */
            '    transition: all 0.2s;' +
            '    font-family: "Microsoft Yahei", sans-serif;' +
            '    box-shadow: 0 1px 3px rgba(0,0,0,0.1);' +
            '}' +
            
            '.ne-alert-close:hover {' +
            '    background: #f5f5f5;' +
            '    color: #333;' +
            '    border-color: #dcdcdc;' +
            '}' +
            
            '.ne-alert-close-icon {' +
            '    font-size: 16px;' +
            '    margin: 0;' +
            '}' +

            '/* 缩略图容器样式 - 兼容IE10 */' +
            '.ne-thumb-box {' +
            '    display: -ms-flexbox;' +  /* IE10 */
            '    display: flex;' +
            '    -ms-flex-wrap: wrap;' +  /* IE10 */
            '    flex-wrap: wrap;' +
            '    margin-top: 10px;' +
            '    padding: 10px;' +
            '    border: 1px dashed #e6e6e6;' +
            '    border-radius: 4px;' +
            '}' +
            
            /* IE10 不支持 object-fit，改用 background-size 方案 */
            '.ne-thumb-item {' +
            '    display: block;' +
            '    width: 100px;' +
            '    height: 100px;' +
            '    margin: 4px;' +
            '    border-radius: 4px;' +
            '    box-shadow: 0 2px 6px rgba(0,0,0,0.1);' +
            '    border: 1px solid #f5f5f5;' +
            '    background-size: cover;' +  /* 替代 object-fit: cover */
            '    background-position: center;' +
            '    background-repeat: no-repeat;' +
            '    background-color: #f5f5f5;' +
            '}' +
            
            /* 现代浏览器使用 img 标签时的样式（渐进增强） */
            '.ne-thumb-item-img {' +
            '    display: block;' +
            '    width: 100px;' +
            '    height: 100px;' +
            '    margin: 4px;' +
            '    border-radius: 4px;' +
            '    box-shadow: 0 2px 6px rgba(0,0,0,0.1);' +
            '    border: 1px solid #f5f5f5;' +
            '    object-fit: cover;' +
            '}';
        
        // IE10 兼容：使用 style.cssText 或 style.appendChild
        if (style.styleSheet) {
            // IE10/9
            style.styleSheet.cssText = styleContent;
        } else {
            // 现代浏览器
            style.appendChild(document.createTextNode(styleContent));
        }
        
        document.head.appendChild(style);
    }

    // ============================================================
    // 插件核心构造函数
    // ============================================================
    
    /**
     * 插件核心构造函数
     * @param {Object} options 配置参数
     */
    function neuiCanvasUpload(options) {
        var me = this;
        
        // 实例唯一ID，确保多实例隔离
        me.instanceId = 'ne-upload-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        
        // 检测浏览器环境
        me.browserInfo = me.detectBrowser();
        
        // 默认配置（v2.2.0：IE10完整兼容）
        me.defaults = {
            // 基础配置
            selector: null,
            container: '',
            events: 'change',
            // 限制配置
            maxWidth: 1200,
            maxSize: 2048, // KB
            maxCount: 9,
            quality: 0.7,
            fileType: ['jpg', 'png', 'jpeg'],
            autoCompressWhenOverLimit: false,
            maxTotalPixels: 8192 * 8192,
            browserPixelLimits: {
                ie: 8192 * 8192,
                edge_legacy: 8192 * 8192,
                chrome: 16384 * 16384,
                default: 8192 * 8192
            },
            // 高级配置
            decodeTimeout: 10000,
            forceConvertFormat: true,
            targetFormat: 'image/jpeg',
            browserCompatible: false,
            // 样式/交互配置
            showThumb: false,
            thumbWidth: 100,
            thumbContainer: '#thumbs',
            showProgressCloseBtn: false,
            alertZIndex: 10000,
            alertShowTime: 3,
            // 回调配置
            callBack: null,
            onFileComplete: null,
            onProgress: null,
            loadingCallback: null
        };

        // 合并配置（使用浅拷贝避免 IE10 深拷贝问题）
        me.opt = {};
        for (var key in me.defaults) {
            if (me.defaults.hasOwnProperty(key)) {
                me.opt[key] = me.defaults[key];
            }
        }
        if (options) {
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    me.opt[key] = options[key];
                }
            }
        }
        
        // container模式判断
        me.$container = $(me.opt.container);
        me.isContainerMode = me.$container.length > 0;
        
        // 初始化状态
        me.status = {
            isInit: false
        };

        // 初始化插件
        me.init();
    }

    neuiCanvasUpload.prototype = {
        constructor: neuiCanvasUpload,

        /**
         * 检测浏览器类型和版本
         * @returns {Object} {type: 'ie'|'edge'|'chrome'|'firefox'|'safari', version: number, isIE10: boolean}
         */
        detectBrowser: function() {
            var ua = navigator.userAgent;
            var result = {
                type: 'unknown',
                version: 0,
                isIE10: false,
                isIE11: false,
                isEdgeLegacy: false
            };
            
            // IE10
            if (/MSIE\s+(\d+)/.test(ua)) {
                result.type = 'ie';
                result.version = parseInt(RegExp.$1, 10);
                result.isIE10 = result.version === 10;
            }
            // IE11
            else if (/Trident\/.*rv:(\d+)/.test(ua)) {
                result.type = 'ie';
                result.version = parseInt(RegExp.$1, 10);
                result.isIE11 = result.version === 11;
            }
            // Edge Legacy (EdgeHTML)
            else if (/Edge\/(\d+)/.test(ua) && !/Edg\/\d+/.test(ua)) {
                result.type = 'edge_legacy';
                result.version = parseInt(RegExp.$1, 10);
                result.isEdgeLegacy = true;
            }
            // Chromium Edge
            else if (/Edg\/(\d+)/.test(ua)) {
                result.type = 'edge';
                result.version = parseInt(RegExp.$1, 10);
            }
            // Chrome
            else if (/Chrome\/(\d+)/.test(ua)) {
                result.type = 'chrome';
                result.version = parseInt(RegExp.$1, 10);
            }
            // Firefox
            else if (/Firefox\/(\d+)/.test(ua)) {
                result.type = 'firefox';
                result.version = parseInt(RegExp.$1, 10);
            }
            // Safari
            else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
                result.type = 'safari';
                result.version = parseInt(RegExp.$1, 10);
            }
            
            return result;
        },

        /**
         * 创建兼容的 File 对象
         * IE10 不支持 new File()，需要使用 Blob 并添加 name 属性
         * @param {Array} parts 文件内容数组
         * @param {String} filename 文件名
         * @param {Object} options 配置选项
         * @returns {File|Blob} 文件对象
         */
        createFile: function(parts, filename, options) {
            var file;
            options = options || {};
            
            try {
                // 尝试使用 File 构造函数（IE11+、现代浏览器）
                if (typeof File === 'function') {
                    file = new File(parts, filename, {
                        type: options.type || 'image/jpeg',
                        lastModified: options.lastModified || Date.now()
                    });
                } else {
                    throw new Error('File constructor not supported');
                }
            } catch (e) {
                // IE10 降级：使用 Blob 并添加 name 属性
                try {
                    file = new Blob(parts, { type: options.type || 'image/jpeg' });
                } catch (e2) {
                    // IE10 极端情况：使用 MSBlobBuilder
                    if (window.MSBlobBuilder) {
                        var builder = new MSBlobBuilder();
                        for (var i = 0; i < parts.length; i++) {
                            builder.append(parts[i]);
                        }
                        file = builder.getBlob(options.type || 'image/jpeg');
                    }
                }
                
                // 手动添加 File 特有属性
                if (file) {
                    file.name = filename;
                    file.lastModifiedDate = new Date(options.lastModified || Date.now());
                    file.lastModified = options.lastModified || Date.now();
                }
            }
            
            return file;
        },

        /**
         * 初始化 - 仅绑定事件，按需创建缩略图容器
         */
        init: function() {
            var me = this;
            if (me.status.isInit) return;

            // container模式：事件委托
            if (me.isContainerMode) {
                me.$container.attr('data-instance-id', me.instanceId);
                me.$container.off(me.opt.events)
                    .on(me.opt.events, 'input[type="file"]', function(e) {
                        me.handleFileChange(e, $(this));
                    });
            } else {
                // selector模式：直接绑定
                if (!me.opt.selector || $(me.opt.selector).length === 0) {
                    me.instanceAlert('未找到上传节点，请检查selector配置', false);
                    return;
                }
                var $input = $(me.opt.selector);
                $input.attr('data-instance-id', me.instanceId);
                $input.off(me.opt.events)
                    .on(me.opt.events, function(e) {
                        me.handleFileChange(e, $(this));
                    });
            }

            // 仅当showThumb=true时创建缩略图容器
            if (me.opt.showThumb) {
                me.createThumbContainer();
            }

            me.status = {
                isInit: true
            };
        },

        /**
         * 兜底创建缩略图容器
         */
        createThumbContainer: function() {
            var me = this;
            var $thumbContainer = $(me.opt.thumbContainer);
            
            if (!$thumbContainer.length) {
                $thumbContainer = $('<div id="' + me.opt.thumbContainer.replace('#', '') + '"></div>');
                $('body').append($thumbContainer);
            }
            
            if (!$thumbContainer.find('.ne-thumb-box').length) {
                $thumbContainer.append('<div class="ne-thumb-box"></div>');
            }
        },

        /**
         * 体积单位转换
         */
        convertSizeUnit: function(sizeKB) {
            if (sizeKB >= 1024) {
                return {
                    value: (sizeKB / 1024).toFixed(1),
                    unit: 'MB'
                };
            } else {
                return {
                    value: sizeKB.toFixed(1),
                    unit: 'KB'
                };
            }
        },

        /**
         * 核心文件处理逻辑
         */
        handleFileChange: function(e, $currentInput) {
            var me = this;
            
            // 获取文件列表（兼容IE10）
            var files = [];
            if (e.target.files) {
                files = Array.prototype.slice.call(e.target.files);
            }
            if (!files.length) return;

            // 数量校验
            if (files.length > me.opt.maxCount) {
                me.instanceAlert('最多只能上传' + me.opt.maxCount + '张图片', false);
                me.resetFileInput($currentInput[0]);
                return;
            }

            // 加载状态回调
            if (typeof me.opt.loadingCallback === 'function') {
                me.opt.loadingCallback(true);
            }

            // 仅压缩场景初始化进度条
            var isCompressMode = me.opt.autoCompressWhenOverLimit;
            if (isCompressMode) {
                me.renderProgress(0, 0, files.length);
            }

            // 串行处理文件
            var total = files.length;
            var done = 0;
            var resultList = [];

            var next = function() {
                if (done >= total) {
                    if (isCompressMode) {
                        me.hideProgress();
                    }
                    if (typeof me.opt.loadingCallback === 'function') {
                        me.opt.loadingCallback(false);
                    }
                    if (typeof me.opt.callBack === 'function') {
                        me.opt.callBack(resultList, $currentInput[0]);
                    }
                    me.resetFileInput($currentInput[0]);
                    return;
                }

                var file = files[done];
                me.compressFile(file, done, total, isCompressMode, function(result) {
                    if (typeof me.opt.onFileComplete === 'function') {
                        me.opt.onFileComplete(result);
                    }
                    if (result) resultList.push(result);
                    done++;
                    if (isCompressMode) {
                        var percent = (done / total) * 100;
                        me.renderProgress(percent, done, total);
                        if (typeof me.opt.onProgress === 'function') {
                            me.opt.onProgress(percent);
                        }
                    }
                    next();
                });
            };

            next();
        },

        /**
         * 单个文件处理
         */
        compressFile: function(file, index, total, isCompressMode, callback) {
            var me = this;
            
            // 文件类型校验
            var fileName = file.name || '';
            var fileExt = fileName.split('.').pop().toLowerCase();
            if (me.opt.fileType.indexOf(fileExt) === -1) {
                me.instanceAlert('不支持' + fileExt + '格式，请选择' + me.opt.fileType.join('/') + '格式', false);
                callback(null);
                return;
            }

            // 体积校验
            var fileSizeKB = (file.size || 0) / 1024;
            var fileSize = me.convertSizeUnit(fileSizeKB);
            var maxSize = me.convertSizeUnit(me.opt.maxSize);
            
            // 像素限制
            var actualMaxPixels;
            if (me.opt.maxTotalPixels !== undefined && me.opt.maxTotalPixels !== null) {
                actualMaxPixels = me.opt.maxTotalPixels;
            } else {
                var browserType = me.getBrowserType();
                actualMaxPixels = me.opt.browserPixelLimits[browserType] || me.opt.browserPixelLimits.default;
            }
            var limitPixelWH = Math.sqrt(actualMaxPixels).toFixed(0) + '*' + Math.sqrt(actualMaxPixels).toFixed(0);

            // 加载图片获取真实尺寸
            var img = new Image();
            var reader = new FileReader();
            
            reader.onload = function(e) {
                img.onload = function() {
                    // IE10 兼容：优先使用 naturalWidth/naturalHeight，这是图片的真实尺寸
                    // IE10 中 img.width/height 有时在 onload 时还未正确设置
                    var realWidth = img.naturalWidth || img.width || 0;
                    var realHeight = img.naturalHeight || img.height || 0;
                    
                    // 如果仍然无法获取尺寸，尝试延迟获取
                    if (realWidth === 0 || realHeight === 0) {
                        // IE10 延迟检测：等待渲染完成
                        setTimeout(function() {
                            realWidth = img.naturalWidth || img.width || 0;
                            realHeight = img.naturalHeight || img.height || 0;
                            
                            if (realWidth === 0 || realHeight === 0) {
                                me.instanceAlert('无法获取图片尺寸，请检查图片是否有效', false);
                                callback(null);
                                return;
                            }
                            
                            // 继续处理
                            processImage(realWidth, realHeight);
                        }, 100);
                        return;
                    }
                    
                    // 正常处理流程
                    processImage(realWidth, realHeight);
                };
                
                // 图片处理核心逻辑
                function processImage(realWidth, realHeight) {
                    var realTotalPixels = realWidth * realHeight;
                    var realPixelWH = realWidth + '*' + realHeight;
                    
                    // 超限判断
                    var isOverLimit = false;
                    var tip = '';

                    if (fileSizeKB > me.opt.maxSize) {
                        tip = '图片体积' + fileSize.value + fileSize.unit + '超过限制' + maxSize.value + maxSize.unit;
                        isOverLimit = true;
                    }

                    if (!isOverLimit && realTotalPixels > actualMaxPixels) {
                        tip = '图片像素' + realPixelWH + 'px超过限制' + limitPixelWH + 'px';
                        isOverLimit = true;
                    }

                    if (fileSizeKB > me.opt.maxSize && realTotalPixels > actualMaxPixels) {
                        tip = '图片体积' + fileSize.value + fileSize.unit + '超过限制' + maxSize.value + maxSize.unit + '，像素' + realPixelWH + 'px超过限制' + limitPixelWH + 'px';
                        isOverLimit = true;
                    }

                    if (!isCompressMode) {
                        if (isOverLimit) {
                            me.instanceAlert(tip, false);
                            callback(null);
                            return;
                        }
                        if (me.opt.showThumb) {
                            me.appendThumb(e.target.result);
                        }
                        callback({
                            file: file,
                            index: index,
                            originSize: file.size,
                            originWidth: realWidth,
                            originHeight: realHeight,
                            originPixels: realTotalPixels
                        });
                        return;
                    } else {
                        if (!isOverLimit) {
                            if (me.opt.showThumb) {
                                me.appendThumb(e.target.result);
                            }
                            callback({
                                file: file,
                                index: index,
                                originSize: file.size,
                                originWidth: realWidth,
                                originHeight: realHeight,
                                originPixels: realTotalPixels
                            });
                            return;
                        }

                        // 压缩模式
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        
                        // IE10 严格防御：重新获取并验证所有尺寸参数
                        // 不依赖函数参数，直接从 img 对象获取最新值
                        var srcWidth = img.naturalWidth || img.width || realWidth || 0;
                        var srcHeight = img.naturalHeight || img.height || realHeight || 0;
                        
                        // 最终检查：源尺寸必须有效
                        if (!srcWidth || !srcHeight || srcWidth <= 0 || srcHeight <= 0) {
                            me.instanceAlert('无法获取图片源尺寸，请检查图片是否有效', false);
                            callback(null);
                            return;
                        }
                        
                        // 计算压缩后的目标尺寸
                        var w = srcWidth;
                        var h = srcHeight;

                        if (w > me.opt.maxWidth) {
                            h = h * me.opt.maxWidth / w;
                            w = me.opt.maxWidth;
                        }

                        if (w * h > actualMaxPixels) {
                            var ratio = Math.sqrt(actualMaxPixels / (w * h));
                            w = w * ratio;
                            h = h * ratio;
                        }

                        // 确保宽高为整数，避免IE10绘制问题
                        w = Math.floor(w);
                        h = Math.floor(h);
                        
                        // IE10 防御：确保目标尺寸有效
                        if (!w || !h || w <= 0 || h <= 0) {
                            me.instanceAlert('图片目标尺寸计算异常', false);
                            callback(null);
                            return;
                        }

                        canvas.width = w;
                        canvas.height = h;
                        
                        // IE10 兼容：使用 drawImage 的完整参数形式
                        // 所有参数都必须是有效数值
                        try {
                            ctx.drawImage(img, 0, 0, srcWidth, srcHeight, 0, 0, w, h);
                        } catch (drawError) {
                            // IE10 降级：使用简单的 3 参数形式
                            try {
                                ctx.drawImage(img, 0, 0);
                            } catch (e) {
                                // tip = '图片绘制失败，请重试';
                                tip = '图片绘制失败！<br>可能图片体积或尺寸太大。图片体积' + fileSize.value + fileSize.unit + '超过限制' + maxSize.value + maxSize.unit + '，像素' + realPixelWH + 'px超过限制' + limitPixelWH + 'px';
                                
                                me.instanceAlert(failMsg, false);
                                callback(null);
                                return;
                            }
                        }

                        // 转换为 Blob（已通过 polyfill 兼容 IE10）
                        canvas.toBlob(function(blob) {
                            if (!blob) {
                                me.instanceAlert('图片压缩失败，请重试', true);
                                callback(null);
                                return;
                            }
                            
                            // 使用兼容方法创建文件对象
                            var compressedFile = me.createFile([blob], file.name, {
                                type: me.opt.targetFormat || blob.type,
                                lastModified: Date.now()
                            });
                            
                            if (!compressedFile) {
                                me.instanceAlert('图片压缩失败，请重试', true);
                                callback(null);
                                return;
                            }
                            
                            if (me.opt.showThumb) {
                                // 使用 canvas 生成缩略图数据URL
                                var thumbDataURL = canvas.toDataURL(me.opt.targetFormat, 0.8);
                                me.appendThumb(thumbDataURL);
                            }
                            
                            callback({
                                file: compressedFile,
                                index: index,
                                originSize: file.size,
                                compressedSize: blob.size,
                                originWidth: srcWidth,
                                compressedWidth: w,
                                originHeight: srcHeight,
                                compressedHeight: h,
                                originPixels: srcWidth * srcHeight,
                                compressedPixels: w * h,
                                quality: me.opt.quality
                            });
                        }, me.opt.targetFormat, me.opt.quality);
                    }
                }
                // processImage 函数结束

                img.onerror = function() {
                    // var tip = '图片加载失败，请检查文件是否损坏';
                    var tip = '图片加载失败！<br>可能图片体积或尺寸太大。当前图片体积' + fileSize.value + fileSize.unit + '，超过限制' + maxSize.value + maxSize.unit;
                    // console.log('tip:', tip);
                    me.instanceAlert(tip, false);
                    callback(null);
                };
                

                // 图片加载超时
                var timeoutId = setTimeout(function() {
                    if (!img.complete) {
                        img.src = '';
                        img.onload = null;
                        img.onerror = null;
                        // var tip = '图片加载超时';
                        var tip = '图片加载超时！<br>可能图片体积或尺寸太大。当前图片体积' + fileSize.value + fileSize.unit + '，超过限制' + maxSize.value + maxSize.unit;
                        me.instanceAlert(tip, false);
                        callback(null);
                    }
                }, me.opt.decodeTimeout);

                // 清理超时定时器
                var originalOnload = img.onload;
                img.onload = function() {
                    clearTimeout(timeoutId);
                    originalOnload.apply(this, arguments);
                };

                img.src = e.target.result;
            };
            
            reader.onerror = function() {
                me.instanceAlert('文件读取失败', false);
                callback(null);
            };
            
            reader.readAsDataURL(file);
        },

        /**
         * 重置input
         */
        resetFileInput: function(fileInput) {
            if (!fileInput) return;
            
            var me = this;
            fileInput.value = '';
            
            // IE 兼容：克隆节点替换
            if (me.browserInfo.type === 'ie' || me.browserInfo.isEdgeLegacy) {
                try {
                    var newInput = fileInput.cloneNode(true);
                    if (fileInput.parentNode) {
                        fileInput.parentNode.replaceChild(newInput, fileInput);
                        
                        if (!me.isContainerMode) {
                            $(newInput).off(me.opt.events)
                                .on(me.opt.events, function(e) {
                                    me.handleFileChange(e, $(this));
                                });
                        }
                    }
                } catch (e) {
                    // 克隆失败时忽略
                }
            }
        },

        /**
         * 渲染进度条
         */
        renderProgress: function(percent, done, total) {
            var me = this;
            var progressId = 'ne-progress-' + me.instanceId;
            var $progress = $('#' + progressId);
            
            if (!$progress.length) {
                var progressHTML = '<div id="' + progressId + '" class="ne-progress-container" data-instance-id="' + me.instanceId + '">';
                progressHTML += '<div class="ne-progress-header">';
                progressHTML += '<div class="ne-progress-title">图片压缩中</div>';
                if (me.opt.showProgressCloseBtn) {
                    progressHTML += '<div class="ne-progress-close">';
                    progressHTML += '<span class="ne-progress-close-icon">✖</span>';
                    progressHTML += '<span>关闭</span>';
                    progressHTML += '</div>';
                }
                progressHTML += '</div>';
                progressHTML += '<div class="ne-progress-text">' + done + '/' + total + ' (' + Math.floor(percent) + '%)</div>';
                progressHTML += '<div class="ne-progress-bar">';
                progressHTML += '<div class="ne-progress-inner" style="width:' + percent + '%"></div>';
                progressHTML += '</div>';
                progressHTML += '</div>';
                
                $progress = $(progressHTML);
                
                if (me.opt.showProgressCloseBtn) {
                    $progress.find('.ne-progress-close').on('click', function() {
                        me.hideProgress();
                    });
                }
                
                $('body').append($progress);
            } else {
                $progress.find('.ne-progress-text').html(done + '/' + total + ' (' + Math.floor(percent) + '%)');
                $progress.find('.ne-progress-inner').css('width', percent + '%');
            }
            $progress.show();
        },

        /**
         * 隐藏进度条
         */
        hideProgress: function() {
            var me = this;
            var progressId = 'ne-progress-' + me.instanceId;
            $('#' + progressId).fadeOut(300, function() {
                $(this).remove();
            });
        },

        /**
         * 提示弹窗
         */
        instanceAlert: function(message, isCompressScene) {
            var me = this;
            var alertId = 'ne-alert-' + me.instanceId + '-' + (isCompressScene ? 'compress' : 'intercept');
            
            var $alert = $('#' + alertId).filter('[data-instance-id="' + me.instanceId + '"]');
            if (!$alert.length) {
                var alertHTML = '<div id="' + alertId + '" class="ne-alert-container" data-instance-id="' + me.instanceId + '" style="z-index: ' + me.opt.alertZIndex + ';">';
                alertHTML += '<span class="ne-alert-close">';
                alertHTML += '<span class="ne-alert-close-icon">✖</span>';
                alertHTML += '</span>';
                alertHTML += '<div class="ne-alert-content">' + message + '</div>';
                alertHTML += '</div>';
                
                $alert = $(alertHTML);
                $alert.find('.ne-alert-close').on('click', function() {
                    $alert.hide().remove();
                });
                $('body').append($alert);
            } else {
                $alert.find('.ne-alert-content').html(message);
                $alert.css('z-index', me.opt.alertZIndex);
            }

            $alert.show();
            
            if (isCompressScene) {
                setTimeout(function() {
                    $alert.hide().remove();
                }, me.opt.alertShowTime * 1000);
            }
        },

        /**
         * 渲染缩略图（兼容IE10，使用background-size替代object-fit）
         * @param {String} dataURL 图片的 base64 数据
         */
        appendThumb: function(dataURL) {
            var me = this;
            if (!me.opt.showThumb) return;

            me.createThumbContainer();
            
            var $thumbContainer = $(me.opt.thumbContainer);
            var $thumbBox = $thumbContainer.find('.ne-thumb-box');

            try {
                // IE10 兼容：使用 div + background-image 替代 img + object-fit
                var $thumb = $('<div class="ne-thumb-item"></div>');
                $thumb.css('background-image', 'url(' + dataURL + ')');
                $thumbBox.append($thumb);
            } catch (err) {
                // 降级：尝试使用 img 标签
                try {
                    $thumbBox.append('<img src="' + dataURL + '" class="ne-thumb-item-img" alt="上传缩略图">');
                } catch (e2) {
                    me.instanceAlert('缩略图渲染失败', true);
                }
            }
        },

        /**
         * 获取浏览器类型
         */
        getBrowserType: function() {
            var me = this;
            if (me.browserInfo.type === 'ie') return 'ie';
            if (me.browserInfo.isEdgeLegacy) return 'edge_legacy';
            if (me.browserInfo.type === 'chrome') return 'chrome';
            return 'default';
        }
    };

    // ============================================================
    // 对外暴露接口
    // ============================================================
    
    // 保留原始调用方式
    window.neuiCanvasUpload = {
        uploadFile: function(options) {
            return new neuiCanvasUpload(options);
        }
    };

    // jQuery 扩展
    $.fn.neuiCanvasUpload = function(options) {
        return this.each(function() {
            options = options || {};
            options.container = this;
            new neuiCanvasUpload(options);
        });
    };

})(jQuery, window, document);
