/**
 * 图片压缩上传插件 neuiCanvasUpload
 * Version: v2.1.2
 * Author: Mufeng
 * Date: 2020.05.07 (初始)、2023.05.19 (迭代)
 * pubdate: 2026.03.10 (v2.1.2 IE10兼容修复)
 * 兼容性：IE10+、Chrome、Firefox、Edge；依赖 jQuery 1.8+
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
 * maxWidth      {Number}       【仅压缩场景生效】图片宽度最大缩放目标值（像素），默认1200；
 *                              1. 仅当autoCompressWhenOverLimit=true且图片原始宽度>该值时，自动按比例缩放到该宽度；
 *                              2. 若图片原始宽度≤该值，不缩放，保持原宽度；
 *                              3. 缩放后高度按原宽高比自动计算，不拉伸变形；
 *                              4. 服务器接收的图片宽度=缩放后宽度（仅压缩模式且宽度超限），否则为原始宽度
 * maxSize       {Number}       【拦截/压缩场景均生效】图片最大体积（KB），默认2048；
 *                              拦截模式下超限直接提示，压缩模式下超限自动压缩
 * maxCount      {Number}       单次最大上传数量，默认9
 * maxTotalPixels{Number}       【全局强制限制】图片最大总像素数（宽×高），默认8192*8192；
 *                              1. 该参数优先级最高，配置后所有浏览器统一遵循此限制；
 *                              2. 仅当未配置该参数时，才会使用browserPixelLimits中对应浏览器的阈值；
 *                              3. 拦截模式下超限直接提示，压缩模式下超限自动压缩
 * browserPixelLimits {Object}  【兜底兼容配置】不同浏览器最大支持的像素数（仅未配置maxTotalPixels时生效），默认{ie:8192*8192, edge_legacy:8192*8192, chrome:16384*16384, default:8192*8192}；
 *                              1. 该参数仅在maxTotalPixels未配置时生效；
 *                              2. 如需统一限制图片最大尺寸，直接配置maxTotalPixels即可
 * fileType      {Array}        支持的文件类型，默认['jpg','png','jpeg']
 * autoCompressWhenOverLimit {Boolean} 超限是否自动压缩，false=拦截提示，true=自动压缩，默认false
 * ---------------- 样式/交互配置 ----------------
 * showThumb     {Boolean}      是否显示缩略图，默认false（按需启用）；
 *                              仅设置为true时，插件才会创建缩略图容器并渲染缩略图
 * thumbWidth    {Number}       缩略图宽度，默认100
 * thumbContainer {String}      缩略图容器选择器，默认"#thumbs"（插件自动创建容器）
 * showProgressCloseBtn {Boolean} 是否显示进度条关闭按钮，默认false；
 *                              true=显示「✖+关闭」按钮，false=隐藏关闭按钮，仅保留进度显示
 * alertZIndex   {Number}       提示弹窗z-index层级，解决遮挡问题，默认10000
 * alertShowTime {Number}       压缩场景提示弹窗自动关闭时间（秒），默认3；拦截场景需手动关闭
 * ---------------- 回调配置 ----------------
 * callBack      {Function}     上传完成回调，参数：(文件数组, 当前上传节点DOM)，默认null
 * onProgress    {Function}     压缩进度回调，参数：(进度百分比)，默认null
 * onFileComplete{Function}     单个文件处理完成回调，默认null
 * loadingCallback {Function}   加载状态回调，参数：(是否加载中)，默认null
 * ---------------- 高级配置 ----------------
 * decodeTimeout {Number}       图片解码超时时间，默认10000
 * forceConvertFormat {Boolean} 是否强制转换图片格式，默认true
 * targetFormat  {String}       目标压缩格式，默认'image/jpeg'
 * browserCompatible {Boolean}  是否开启浏览器兼容模式，默认false
 */
(function ($, window) {
    // 全局样式仅插入一次（兼容IE10：移除模板字符串，改用字符串拼接）
    if (!document.getElementById('ne-upload-style')) {
        var style = document.createElement('style');
        style.id = 'ne-upload-style';
        // IE10兼容：使用字符串拼接替代模板字符串
        var styleContent = 
            '/* 进度条样式 - 仅压缩场景显示 */' +
            '.ne-progress-container {' +
            '    position: fixed;' +
            '    z-index: 9999;' +
            '    left: 50%;' +
            '    top: 50%;' +
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
            '    display: flex;' +
            '    justify-content: space-between;' +
            '    align-items: center;' +
            '    margin-bottom: 10px;' +
            '}' +
            '.ne-progress-title {' +
            '    font-size: 14px;' +
            '    color: #333;' +
            '    font-weight: 500;' +
            '}' +
            '/* 进度条关闭按钮 - 默认隐藏，配置开启后显示 */' +
            '.ne-progress-close {' +
            '    display: inline-flex;' +
            '    align-items: center;' +
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
            '    transition: all 0.2s;' +
            '    font-family: "Microsoft Yahei", sans-serif;' +
            '    -webkit-font-smoothing: antialiased;' +
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
            '    transition: width 0.3s ease;' +
            '}' +

            '/* 提示弹窗样式 - 优化关闭按钮位置，避免遮挡文字 */' +
            '.ne-alert-container {' +
            '    position: fixed;' +
            '    z-index: 10000;' +
            '    left: 50%;' +
            '    top: 50%;' +
            '    transform: translate(-50%, -50%);' +
            '    background: #fff;' +
            '    padding: 30px 30px 25px;' + /* 增加顶部内边距，避免遮挡 */
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
            '/* 提示弹窗关闭按钮 - 悬浮右上角，不遮挡文字 */' +
            '.ne-alert-close {' +
            '    position: absolute;' +
            '    top: -10px;' +
            '    right: -10px;' + /* 移出弹窗主体，悬浮右上角 */
            '    display: inline-flex;' +
            '    align-items: center;' +
            '    justify-content: center;' +
            '    width: 28px;' +
            '    height: 28px;' +
            '    line-height: 28px;' +
            '    text-align: center;' +
            '    font-size: 14px;' +
            '    color: #666;' +
            '    cursor: pointer;' +
            '    border-radius: 50%;' + /* 圆形按钮 */
            '    background: #fff;' +
            '    border: 1px solid #e6e6e6;' +
            '    transition: all 0.2s;' +
            '    font-family: "Microsoft Yahei", sans-serif;' +
            '    -webkit-font-smoothing: antialiased;' +
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

            '/* 缩略图容器样式 - 插件自动创建，强制样式避免覆盖 */' +
            '.ne-thumb-box {' +
            '    display: flex;' +
            '    flex-wrap: wrap;' +
            '    gap: 8px;' +
            '    margin-top: 10px;' +
            '    padding: 10px;' +
            '    border: 1px dashed #e6e6e6;' +
            '    border-radius: 4px;' +
            '}' +
            '.ne-thumb-item {' +
            '    width: 100px !important;' +
            '    height: 100px !important;' +
            '    object-fit: cover !important;' +
            '    border-radius: 4px !important;' +
            '    box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;' +
            '    border: 1px solid #f5f5f5 !important;' +
            '    display: block !important;' +
            '}';
        style.textContent = styleContent;
        document.head.appendChild(style);
    }

    /**
     * 插件核心构造函数
     * @param {Object} options 配置参数
     */
    function neuiCanvasUpload(options) {
        var me = this;
        // 实例唯一ID，确保多实例隔离
        me.instanceId = 'ne-upload-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        
        // 默认配置（v2.1.2：IE10兼容，无逻辑变更）
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
            fileType: ['jpg','png','jpeg'],
            autoCompressWhenOverLimit: false,
            maxTotalPixels: 8192*8192, // 全局强制限制（优先级最高）
            browserPixelLimits: { // 兜底兼容配置（仅未配置maxTotalPixels时生效）
                ie: 8192*8192,
                edge_legacy: 8192*8192,
                chrome: 16384*16384,
                default: 8192*8192
            },
            // 高级配置
            decodeTimeout: 10000,
            forceConvertFormat: true,
            targetFormat: 'image/jpeg',
            browserCompatible: false,
            // 样式/交互配置
            showThumb: false, // 默认关闭缩略图
            thumbWidth: 100,
            thumbContainer: "#thumbs",
            showProgressCloseBtn: false, // 进度条关闭按钮默认隐藏
            alertZIndex: 10000,
            alertShowTime: 3,
            // 回调配置
            callBack: null,
            onFileComplete: null,
            onProgress: null,
            loadingCallback: null
        };

        // 合并配置
        me.opt = $.extend(true, {}, me.defaults, options || {});
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
         * 兜底创建缩略图容器（仅showThumb=true时执行）
         */
        createThumbContainer: function() {
            var me = this;
            var $thumbContainer = $(me.opt.thumbContainer);
            
            // 若容器不存在，自动创建并添加到body
            if (!$thumbContainer.length) {
                $thumbContainer = $('<div id="' + me.opt.thumbContainer.replace('#', '') + '"></div>');
                $('body').append($thumbContainer);
            }
            
            // 确保内部box存在
            if (!$thumbContainer.find('.ne-thumb-box').length) {
                $thumbContainer.append('<div class="ne-thumb-box"></div>');
            }
        },

        /**
         * 体积单位转换（KB/MB自适应）
         * @param {Number} sizeKB 体积（KB）
         * @returns {Object} {value: 转换后数值, unit: 单位(KB/MB)}
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
         * @param {Event} e 事件对象
         * @param {jQuery} $currentInput 当前触发的input节点
         */
        handleFileChange: function(e, $currentInput) {
            var me = this;
            // 获取文件列表
            var files = Array.prototype.slice.call(e.target.files || []);
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
                    // 仅压缩场景销毁进度条
                    if (isCompressMode) {
                        me.hideProgress();
                    }
                    // 加载状态回调
                    if (typeof me.opt.loadingCallback === 'function') {
                        me.opt.loadingCallback(false);
                    }
                    // 补全callBack第二个参数
                    if (typeof me.opt.callBack === 'function') {
                        me.opt.callBack(resultList, $currentInput[0]);
                    }
                    // 重置input
                    me.resetFileInput($currentInput[0]);
                    return;
                }

                // 处理单个文件
                var file = files[done];
                me.compressFile(file, done, total, isCompressMode, function(result) {
                    // 单个文件回调
                    if (typeof me.opt.onFileComplete === 'function') {
                        me.opt.onFileComplete(result);
                    }
                    if (result) resultList.push(result);
                    // 进度更新（仅压缩场景执行）
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
         * 单个文件处理 - 修复maxTotalPixels优先级+先体积后像素判断
         * @param {File} file 文件对象
         * @param {Number} index 文件索引
         * @param {Number} total 总数量
         * @param {Boolean} isCompressMode 是否压缩模式
         * @param {Function} callback 回调函数
         */
        compressFile: function(file, index, total, isCompressMode, callback) {
            var me = this;
            // 文件类型校验
            var fileExt = file.name.split('.').pop().toLowerCase();
            if (me.opt.fileType.indexOf(fileExt) === -1) {
                me.instanceAlert('不支持' + fileExt + '格式，请选择' + me.opt.fileType.join('/') + '格式', false);
                callback(null);
                return;
            }

            // 体积校验与单位转换（先判断体积）
            var fileSizeKB = file.size / 1024;
            var fileSize = me.convertSizeUnit(fileSizeKB);
            var maxSize = me.convertSizeUnit(me.opt.maxSize);
            
            // 像素限制逻辑修复：maxTotalPixels优先级最高，仅未配置时才用browserPixelLimits
            var actualMaxPixels;
            if (me.opt.maxTotalPixels !== undefined && me.opt.maxTotalPixels !== null) {
                // 配置了maxTotalPixels，优先使用（全局强制限制）
                actualMaxPixels = me.opt.maxTotalPixels;
            } else {
                // 未配置maxTotalPixels，使用浏览器对应阈值
                actualMaxPixels = me.opt.browserPixelLimits[me.getBrowserType()] || me.opt.browserPixelLimits.default;
            }
            // 计算限制像素的宽高显示格式（取整）
            var limitPixelWH = Math.sqrt(actualMaxPixels).toFixed(0) + '*' + Math.sqrt(actualMaxPixels).toFixed(0);

            // 加载图片获取真实尺寸
            var img = new Image();
            var reader = new FileReader();
            reader.onload = function(e) {
                img.onload = function() {
                    var realWidth = img.width;
                    var realHeight = img.height;
                    var realTotalPixels = realWidth * realHeight;
                    var realPixelWH = realWidth + '*' + realHeight; // 实际像素宽高格式
                    
                    // 超限判断：先体积，后像素（严格按顺序）
                    var isOverLimit = false;
                    var tip = '';

                    // 第一步：判断体积超限
                    if (fileSizeKB > me.opt.maxSize) {
                        tip = '图片体积' + fileSize.value + fileSize.unit + '超过限制' + maxSize.value + maxSize.unit;
                        isOverLimit = true;
                    }

                    // 第二步：体积未超限，再判断像素超限
                    if (!isOverLimit && realTotalPixels > actualMaxPixels) {
                        tip = '图片像素' + realPixelWH + 'px超过限制' + limitPixelWH + 'px';
                        isOverLimit = true;
                    }

                    // 第三步：两者都超限，拼接提示
                    if (fileSizeKB > me.opt.maxSize && realTotalPixels > actualMaxPixels) {
                        tip = '图片体积' + fileSize.value + fileSize.unit + '超过限制' + maxSize.value + maxSize.unit + '，像素' + realPixelWH + 'px超过限制' + limitPixelWH + 'px';
                        isOverLimit = true;
                    }

                    // 严格区分场景
                    if (!isCompressMode) {
                        // 拦截模式：超限提示
                        if (isOverLimit) {
                            me.instanceAlert(tip, false);
                            callback(null);
                            return;
                        }
                        // 拦截模式：未超限，按需显示缩略图
                        if (me.opt.showThumb) {
                            me.appendThumb(file);
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
                        // 压缩模式：未超限直接返回
                        if (!isOverLimit) {
                            if (me.opt.showThumb) {
                                me.appendThumb(file);
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

                        // 压缩模式：超限自动压缩
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        var w = realWidth;
                        var h = realHeight;

                        // 第一步：按maxWidth缩放（仅宽度超限）
                        if (w > me.opt.maxWidth) {
                            h = h * me.opt.maxWidth / w;
                            w = me.opt.maxWidth;
                        }

                        // 第二步：确保总像素不超过actualMaxPixels
                        if (w * h > actualMaxPixels) {
                            var ratio = Math.sqrt(actualMaxPixels / (w * h));
                            w = w * ratio;
                            h = h * ratio;
                        }

                        // 绘制压缩图片
                        canvas.width = w;
                        canvas.height = h;
                        ctx.drawImage(img, 0, 0, w, h);

                        // 转换为Blob（异常捕获确保缩略图执行）
                        canvas.toBlob(function(blob) {
                            if (!blob) {
                                me.instanceAlert('图片压缩失败，请重试', true);
                                callback(null);
                                return;
                            }
                            var compressedFile = new File([blob], file.name, { type: blob.type });
                            if (me.opt.showThumb) {
                                me.appendThumb(compressedFile);
                            }
                            callback({
                                file: compressedFile,
                                index: index,
                                originSize: file.size,
                                compressedSize: blob.size,
                                originWidth: realWidth,
                                compressedWidth: w,
                                originHeight: realHeight,
                                compressedHeight: h,
                                originPixels: realTotalPixels,
                                compressedPixels: w * h,
                                quality: me.opt.quality
                            });
                        }, me.opt.targetFormat, me.opt.quality);
                    }
                };

                // 图片加载错误
                img.onerror = function() {
                    me.instanceAlert('图片加载失败，请检查文件是否损坏', false);
                    callback(null);
                };

                // 图片加载超时
                setTimeout(function() {
                    if (!img.complete) {
                        img.src = '';
                        me.instanceAlert('图片加载超时', false);
                        callback(null);
                    }
                }, me.opt.decodeTimeout);

                // 读取图片
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        /**
         * 重置input
         * @param {DOM} fileInput 当前input节点
         */
        resetFileInput: function(fileInput) {
            if (!fileInput) return;
            fileInput.value = '';
            // IE兼容
            if (window.navigator.userAgent.indexOf('MSIE') >= 0 || window.navigator.userAgent.indexOf('Trident') >= 0) {
                var newInput = fileInput.cloneNode(true);
                fileInput.parentNode.replaceChild(newInput, fileInput);
                if (!this.isContainerMode) {
                    $(newInput).off(this.opt.events)
                        .on(this.opt.events, function(e) {
                            this.handleFileChange(e, $(this));
                        }.bind(this));
                }
            }
        },

        /**
         * 渲染进度条（根据配置显示/隐藏关闭按钮，兼容IE10移除模板字符串）
         * @param {Number} percent 进度百分比
         * @param {Number} done 已完成数量
         * @param {Number} total 总数量
         */
        renderProgress: function(percent, done, total) {
            var me = this;
            var progressId = 'ne-progress-' + me.instanceId;
            var $progress = $('#' + progressId);
            
            if (!$progress.length) {
                // 兼容IE10：使用字符串拼接替代模板字符串
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
                
                // 仅当配置开启时绑定关闭按钮事件
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
         * 提示弹窗（兼容IE10移除模板字符串）
         * @param {String} message 提示内容
         * @param {Boolean} isCompressScene 是否压缩场景（true=自动关闭，false=手动关闭）
         */
        instanceAlert: function(message, isCompressScene) {
            var me = this;
            var alertId = 'ne-alert-' + me.instanceId + '-' + (isCompressScene ? 'compress' : 'intercept');
            
            var $alert = $('#' + alertId).filter('[data-instance-id="' + me.instanceId + '"]');
            if (!$alert.length) {
                // 兼容IE10：使用字符串拼接替代模板字符串
                var alertHTML = '<div id="' + alertId + '" class="ne-alert-container" data-instance-id="' + me.instanceId + '" style="z-index: ' + me.opt.alertZIndex + ';">';
                alertHTML += '<span class="ne-alert-close">';
                alertHTML += '<span class="ne-alert-close-icon">✖</span>';
                alertHTML += '</span>';
                alertHTML += '<div class="ne-alert-content">' + message + '</div>';
                alertHTML += '</div>';
                
                $alert = $(alertHTML);
                // 提示弹窗关闭按钮事件（始终显示）
                $alert.find('.ne-alert-close').on('click', function() {
                    $alert.hide().remove();
                });
                $('body').append($alert);
            } else {
                $alert.find('.ne-alert-content').html(message);
                $alert.css('z-index', me.opt.alertZIndex);
            }

            $alert.show();
            // 仅压缩场景自动关闭
            if (isCompressScene) {
                setTimeout(function() {
                    $alert.hide().remove();
                }, me.opt.alertShowTime * 1000);
            }
        },

        /**
         * 渲染缩略图（仅showThumb=true时执行）
         * @param {File} file 图片文件
         */
        appendThumb: function(file) {
            var me = this;
            if (!me.opt.showThumb) return;

            // 确保容器存在（兜底）
            me.createThumbContainer();
            
            var $thumbContainer = $(me.opt.thumbContainer);
            var $thumbBox = $thumbContainer.find('.ne-thumb-box');

            var reader = new FileReader();
            // 异常捕获确保执行
            reader.onload = function(e) {
                try {
                    $thumbBox.append('<img src="' + e.target.result + '" class="ne-thumb-item" alt="上传缩略图">');
                } catch (err) {
                    me.instanceAlert('缩略图渲染失败', true);
                }
            };
            reader.onerror = function() {
                me.instanceAlert('缩略图读取失败', true);
            };
            reader.readAsDataURL(file);
        },

        /**
         * 获取浏览器类型（用于匹配pixelLimits）
         * @returns {String} 浏览器类型
         */
        getBrowserType: function() {
            var userAgent = navigator.userAgent;
            if (/MSIE|Trident/.test(userAgent)) return 'ie';
            if (/Edg\/\d+/.test(userAgent) && !/Chromium/.test(userAgent)) return 'edge_legacy';
            if (/Chrome/.test(userAgent)) return 'chrome';
            return 'default';
        }
    };

    // 对外暴露接口（保留原始调用方式）
    window.neuiCanvasUpload = {
        uploadFile: function(options) {
            return new neuiCanvasUpload(options);
        }
    };

    // jQuery扩展
    $.fn.neuiCanvasUpload = function(options) {
        return this.each(function() {
            options.container = this;
            new neuiCanvasUpload(options);
        });
    };

})(jQuery, window);