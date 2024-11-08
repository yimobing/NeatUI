/**
 * [neuiProgressBar]
 * 进度条控件
 * 说明：使用原生JS开发，无需引用户Jq等其它js文件
 * Author：Mufeng
 * Date: 2024.10.22
 * Update: 2024.11.08
 */
; (function (root, factory) {
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.NProgress = factory();
    }
})(this, function () {

    //================================================================
    // 构造函数
    //================================================================
    function Widget() {
        this.defaults = {
            // 主题样式
            theme: '', // 主题，默认空(可选)。值： red 红色, blue 蓝色, green 绿色, orange 橙色
            extClass: '', // 自定义节点样式名，默认空(可选)。支持多个样式名.eg. 'aaa'. eg. 'aaa bbb'
            // 大小与位置
            parentNode: '', // 绑定控件到到某个父节点下，默认空绑定到body最后面script/style标签前(可选)。eg. '.div1'. eg. '#div2'
            position: 'relative', // 定位方式，默认空表示相对定位(可选)。值： relative 相对定位, absolute 绝对定位, fixed 固定定位
            zIndex: 99, // 定位层级，默认99(可选)
            width: 400, // 自定义区域宽度，默认400(可选)
            height: 100, // 自定义区域高度，默认100(可选)
            hasBorder: true, // 区域是否显示边框，默认true(可选)
            hasRadius: true, // 区域是否有圆角，默认true(可选)
            hasShadow: true, // 区域是否有阴影，默认true(可选)
            bar: { // 进度条外观(可选)
                shape: 'rectangle', // 形状，默认长方形(可选)，值： rectangle 长方形, annulus 环形(圆形)
                height: 20, // 高度，默认20px(可选)。仅当 shape = 'rectangle'时有效。
                borderRadius: 10, // 圆角值，默认10px(可选)。仅当 shape = 'rectangle'时有效。
            },
            mask: { // 遮罩(可选)
                enable: true, // 是否显示遮罩，默认true(可选)。仅当 position = 'absolute' 或 fixed 时才有效。注：遮罩层级系统会自动计算,永远比控件小1。
                opacity: 0.5, // 遮罩透明度，默认0.5(可选)。当值大于 1 将自动转化成除以100的小数，比如 80 表示 0.8
                closeOnceClick: false // 点击遮罩时是否自动关闭控件，默认false(可选)
            },
            // 常用属性
            showSpeed: true, // 是否显示百分比进度，默认true(可选)
            showTitle: true, // 是否显示标题，默认true(可选)
            titleText: '正在处理中，请稍侯', // 标题文本，有默认值(可选)
            showSubtitle: true, // 是否显示副标题，默认true(可选)
            subtitleFormat: '当前/总数', // 副标题格式，默认'当前/总数'(可选)。系统会自动将其转化成'当前50/总数100' 的格式。注：参数值中的反斜杠要与参数 subtitleSeparator 保持一致。
            subtitleSeparator: '/', // 副标题分割符，默认反斜杠/(可选)。
            showOver: true, // 是否在进度加载100%时显示完成，默认true(可选)
            overText: '加载完成', // 进度完成的文字，默认'加载完成'(可选)。仅当showOver=true时有效。
            showFail: true, // 是否在进度加载失败时显示失败，默认true(可选)。注：需手动调用函数 neuiProgressBar.showFailureInfo() 才会显示出来。
            failText: '加载失败', // 进度失败的文字，默认'加载失败'(可选)。仅当 showFail=true时有效。
            showClose: false, // 是否显示关闭按钮，默认false(可选)。注：可手动调用函数 neuiProgressBar.showCloseDownButton() 强制显示出来。
            showConsume: true, // 是否显示耗时时间，默认true(可选)。注：可手动调用函数 neuiProgressBar.showTimeConsuming() 强制显示出来。
            min: 0, // 进度条最小值，默认0表示(0/max)%(可选)
            max: 100, // 进度条最大值，默认100(可选)
            current: 0, // 进度条初始位置。默认0表示(0/max)%(可选)。注意：值不为0时控件创建完成后系统将自动执行进度条动画。请注意，值不为0时，若 duration 设置过小可能会影响覆盖后续自定义的进度条动画，导致设置的进度条不显示。
            duration: 5, // 动画时长，默认5(可选)。单位毫秒。注意：建议值设为5-100，若值太小比如为0可能会导致动画太快看不到效果，值太大比如1000可能导致动画太慢超过实际后端执行速度。
            cycleBegin: 0, // 循环起始值，默认0(可选)。注：用于解决 for(var m = 0; m < 100; m++) 和 for(m = 1; i <= 100; m++) 这两种情况，前者请设置参数值为0，后者请设置参数值为 1。
            // 回调
            callback: null // 回调函数，默认null(可选)。如需在控件创建完后执行其它事件，请写在回调函数中
        }
    };


    //================================================================
    // 原型模式定义实例方法
    //================================================================
    Widget.prototype = {
        /**
         * 控件初始化
         * @param {Ojbect} options 控件参数
         */
        init: function (options) {
            var me = this;
            me.settings = utils.combine(true, me.defaults, options || {});
            me.$opts = me.settings; // 全局赋值1
            // console.log('defaults：', me.defaults);
            // console.log('settings：', me.settings);
            var _themeClass = me.settings.theme == '' ? '' : ' ' + me.settings.theme.toString().replace(/(\.|\#)/g, ''),
                _extClass = me.settings.extClass == '' ? '' : ' ' + me.settings.extClass.toString().replace(/(\.|\#)/g, ''),
                _current = parseFloat(me.settings.current.toString().replace(/(%|px)/g, '')),
                _parentNode = me.settings.parentNode,
                _width = me.settings.width.toString().replace(/(px|rem|em|vem|vh|%)/g, '') + 'px',
                _height = me.settings.height.toString().replace(/(px|rem|em|vem|vh|%)/g, '') + 'px';
            // 定义样式名或ID名
            var classIdRoot = 'ne-progress-bar', // 根节点样式名或ID名
                classIdMask = 'ne-progress-mask', // 遮罩节点样式名或ID名
                classIdOver = 'ne__progress_over', // 进度完成节点样式名或ID名
                classIdFail = 'ne__progress_fail', // 进度失败节点样式名或ID名
                classIdClose = 'ne__progress_close', // 关闭按钮节点样式名或ID名
                classIdConsume = 'ne__progress_consume'; // 耗时时间节点样式名或ID名
            // 全局赋值2
            me.$opts.$classNameRoot = classIdRoot; // 根节点样式名
            me.$opts.$classNameMask = classIdMask; // 遮罩节点样式名
            me.$opts.$classNameOver = classIdOver; // 进度完成节点样式名
            me.$opts.$classNameFail = classIdFail; // 进度失败节点样式名
            me.$opts.$classNameClose = classIdClose; // 关闭按钮节点样式名
            me.$opts.$classNameConsume = classIdConsume; // 耗时时间节点样式名
            me.$opts.$codeHtmlOver = '<div class="' + classIdOver + '">' + me.settings.overText + '</div>'; // 进度完成HTML字符串
            me.$opts.$codeHtmlFail = '<div class="' + classIdFail + '">' + me.settings.failText + '</div>'; // 进度失败HTML字符串
            me.$opts.$codeHtmlClose = '<div class="' + classIdClose + '" title="关闭进度条"></div>';; // 关闭按钮HTML字符串
            me.$opts.$codeHtmlConsume = '<div class="' + classIdConsume + '"></div>';; // 耗时时间HTML字符串
           

            // 创建根节点
            var rootNode = document.createElement('div');
            rootNode.className = classIdRoot;
            rootNode.className += _extClass;
            rootNode.className += !me.settings.hasBorder ? '' : ' has-border';
            rootNode.className += !me.settings.hasRadius ? '' : ' has-radius';
            rootNode.className += !me.settings.hasShadow ? '' : ' has-shadow';
            rootNode.style.setProperty('width', _width);
            rootNode.style.setProperty('height', _height);

            // 节点存在时，移除节点(防止重复)
            if (document.getElementsByClassName(classIdRoot).length != 0 || document.getElementsByClassName(classIdMask).length != 0) {
                // 移除进度条节点
                Array.from(document.getElementsByClassName(classIdRoot)).forEach(function (item) {
                    item.remove();
                });
                // 移除遮罩节点
                Array.from(document.getElementsByClassName(classIdMask)).forEach(function (item) {
                    item.remove();
                });
            }

            // 节点不存在时，创建根节点内容
            if (document.getElementsByClassName(classIdRoot).length == 0) {
                // 创建根节点
                if (_parentNode != '') {
                    var parentClassId = _parentNode.toString().replace(/(\.|\#)/g, '');
                    var fatherNode = _parentNode.indexOf('.') >= 0 ?
                        document.getElementsByClassName(parentClassId)[0]
                        :
                        document.getElementById(parentClassId);
                    if (fatherNode == null) {
                        console.error('绑定的父节点“' + _parentNode + '”不存在');
                        utils.appendChild(rootNode, document.body);
                    }
                    else {
                        fatherNode.appendChild(rootNode);
                    }
                }
                else {
                    utils.appendChild(rootNode, document.body);
                }

                // 创建根节点内容
                if (me.settings.bar.shape == 'rectangle') {
                    var _barShapeClass = ' fashion-' + (me.settings.bar.shape == '' ? 'rectangle' : me.settings.bar.shape),
                        _barH = me.settings.bar.height.toString().replace(/(px|rem|em|vem|vh|%)/g, '')
                    _barRadius = me.settings.bar.borderRadius.toString().replace(/(px|rem|em|vem|vh|%)/g, '');
                    var _heightStr = _barH == me.defaults.bar.height.toString() ? '' : 'height: ' + (_barH + 'px'),
                        _radiusStr = _barRadius == me.defaults.bar.borderRadius.toString() ? '' : ';border-radius: ' + (_barRadius + 'px');
                    var _barStyle = ' style="' + _heightStr + _radiusStr + '"';
                    var _percent = utils.getRatio(_current, parseFloat(me.settings.max)) + '%';
                    var _innerHtml = [
                        '<div class="ne__progress_content">',
                            // 标题和副标题 (匿名函数马上执行)
                            (function () {
                                var _tmpHtml = !me.settings.showTitle && !me.settings.showSubtitle ? '' :
                                    [
                                        '<div class="ne__progress_caption">',
                                            (function () {
                                                return !me.settings.showTitle ? '' : '<div class="ne__progress_title">' + me.settings.titleText + '</div>';
                                            })(),
                                            (function () {
                                                return !me.settings.showSubtitle ? '' : '<div class="ne__progress_subtitle"></div>';
                                            })(),
                                        '</div>'
                                    ].join('\r\n');
                                return _tmpHtml;
                            })(),
                            // 进度完成节点 (匿名函数马上执行)
                            (function () {
                                // var _tmpStyle = !me.settings.showOver ? ' style="display: none"' : '';
                                // var _tmpHtml = '<div class="ne__progress_over"' + _tmpStyle + '>' + me.settings.overText + '</div>';
                                var _tmpHtml = !me.settings.showOver ? '' : me.$opts.$codeHtmlOver;
                                return _tmpHtml;
                            })(),
                            // 进度失败节点 (匿名函数马上执行)
                            (function () {
                                // var _tmpStyle = !me.settings.showFail ? ' style="display: none"' : '';
                                // var _tmpHtml = '<div class="ne__progress_fail"' + _tmpStyle + '>' + me.settings.failText + '</div>';
                                var _tmpHtml = !me.settings.showFail ? '' : me.$opts.$codeHtmlFail;
                                return _tmpHtml;
                            })(),
                            // 关闭按钮节点 (匿名函数马上执行)
                            (function () {
                                // var _tmpStyle = !me.settings.showClose ? ' style="display: none"' : '';
                                // var _tmpHtml = '<div class="ne__progress_close"' + _tmpStyle + '></div>';
                                var _tmpHtml = !me.settings.showClose ? '' : me.$opts.$codeHtmlClose;
                                return _tmpHtml;
                            })(),
                            '<div class="ne__progress_strip' + _barShapeClass + _themeClass + '"' + _barStyle + '>',
                                '<span class="ne__progress_strip_cartoon" style="width: ' + _percent + '">',
                                // 百分比值节点 (匿名函数马上执行)
                                (function () {
                                    var _tmpHtml = !me.settings.showSpeed ? '' : '<em class="ne__progress_strip_text">' + _percent + '</em>';
                                    return _tmpHtml;
                                })(),
                                '</span>',
                            '</div>',
                            // 耗时时间节点 (匿名函数马上执行)
                            (function () {
                                // var _tmpStyle = !me.settings.showConsume ? ' style="display: none"' : '';
                                // var _tmpHtml = '<div class="ne__progress_consume"' + _tmpStyle + '></div>';
                                var _tmpHtml = !me.settings.showConsume ? '' : me.$opts.$codeHtmlConsume;
                                return _tmpHtml;
                            })(),
                        '</div><!--/.ne__progress_content-->'
                    ].join('\r\n');
                }
                // 拼接内容
                utils.appendHTML(_innerHtml, rootNode);
            }

            // 全局赋值3
            me.$opts.$nodeRoot = rootNode; // 根节点
            me.$opts.$nodeBarContent = document.getElementsByClassName('ne__progress_content')[0]; // 内容节点
            me.$opts.$nodeBarStrip = document.getElementsByClassName('ne__progress_strip')[0]; // 进度条节点
            me.$opts.$nodeBarCartoon = document.getElementsByClassName('ne__progress_strip_cartoon')[0]; // 位置动画节点
            me.$opts.$nodeBarText = document.getElementsByClassName('ne__progress_strip_text')[0]; // 位置文本节点
            me.$opts.$nodeBarTitle = document.getElementsByClassName('ne__progress_title')[0]; // 标题节点
            me.$opts.$nodeBarSubtitle = document.getElementsByClassName('ne__progress_subtitle')[0]; // 副标题节点
            me.$opts.$nodeBarOver = document.getElementsByClassName(classIdOver)[0]; // 进度完成节点
            me.$opts.$nodeBarFail = document.getElementsByClassName(classIdFail)[0]; // 进度失败节点
            me.$opts.$nodeBarClose = document.getElementsByClassName(classIdClose)[0]; // 关闭按钮节点
            me.$opts.$nodeBarConsume = document.getElementsByClassName(classIdConsume)[0]; // 耗时时间按钮节点
            // 全局赋值4 (标记作用)
            me.$opts.$startPosition = parseFloat(me.settings.min); // 进度条初始位置
            me.$opts.$startProportion = 0; // 进度条初始进度，即初始占比，默认0表示0%
            me.$opts.$loopCount = 0;  // 在循环内进度条循环的次数，默认0
            me.$opts.$loopBeginValue = 0; // 耗时计时器定时起始值，默认0
            me.$opts.$loopTimers = null; // 耗时计时器定时对象，默认null test1
            me.$opts.$loopStartTime = new Date().getTime(); // 耗时计时器开始时间，默认1970年至今的毫秒数
            me.$opts.$loopEndTime = null // 耗时计时器结束时间，默认null
            
            // 定位方式不是相对定位时
            if (me.settings.position != '' && me.settings.position != 'relative') {
                rootNode.className += ' ' + me.settings.position;
                rootNode.style.setProperty('z-index', me.settings.zIndex);
                var maskNode = helpers._createMask(me); // 创建遮罩
                if (me.settings.mask.closeOnceClick) { // 点击遮罩层时关闭控件
                    // var maskNode = document.getElementsByClassName(me.$opts.$classNameMask)[0];
                    maskNode.addEventListener('click', function () {
                        rootNode.remove();
                        maskNode.remove();
                    });
                }
                // 全局赋值3
                me.$opts.$nodeMask = maskNode;
            }
            helpers._onClickCloseBtn(me); // 点击关闭按钮时关闭控件
            // 回调
            if (me.settings.callback) {
                me.settings.callback();
            }
            if (_current != 0) {
                me.updatePosition(_current);
            }
        },



        /** 
         * 同步或异步设置当前进度条“增量值”(一般在for/forEach循环内使用)
         * 即：渐进性地更新当前进度占整个进度条的“百分比值”
         * @param {Number} increment 当前进度条“增量值”。“增量值”含义说明：比如进度条总长为 500，当前“增量值”为10，则系统会自动计算进度条“进度位置”占比为10/500 * 100% = 2%，即“百分比值”为2
         * @param {Object} opts 其它参数(可选)。用于设置同步或异步，默认同步。格式: { async: true或false }  true 异步, false 同步
         */
        updateProgress: function (increment, opts) {
            var me = this;
            if (typeof me.settings == 'undefined') {
                var tips = '进度条控件尚未初始化，请先调用 neuiProgressBar(options) 进行初始化';
                console.error(tips);
                // alert(tips);
                return;
            }
            if (typeof increment == 'undefined' || isNaN(parseFloat(increment))) {
                var tips = arguments.callee.name + '函数参数错误，请检查！';
                console.error(tips);
                return;
            }

            var realIncresing = me.settings.cycleBegin <= 0 ? (increment + 1) : increment;
            if (realIncresing > me.settings.max) realIncresing = me.settings.max;
            var nowRate = utils.getRatio(realIncresing, me.settings.max);
            var duration = me.settings.duration < 0 ? 0 : me.settings.duration;
            // 副标题文本动态赋值
            if (typeof me.$opts.$nodeBarSubtitle != 'undefined') {
                var subHtml = '';
                var subArr = me.settings.subtitleFormat.split(me.settings.subtitleSeparator);
                if (Array.isArray(subArr)) {
                    var preStr = subArr[0],
                        nextStr = subArr[1];
                    subHtml = preStr + realIncresing + me.settings.subtitleSeparator + nextStr + me.settings.max; // eg. '当前50/总数100'
                }
                else {
                    subHtml = realIncresing + me.settings.subtitleSeparator + me.settings.max; // eg. '50/100'
                }
                me.$opts.$nodeBarSubtitle.innerHTML = '(' + subHtml + ')';
            }
            //
            me.$opts.$loopCount++; // 全局赋值4
            if (me.$opts.$loopCount == 1) { // 第1次循环时
                me.$opts.$startProportion = nowRate;
                helpers._setConsumingTimer(me); // 开启耗时计时器定时 test1 
            }
            // console.log('循环次数：', me.$opts.$loopCount);
            // console.log('当前进度：', nowRate + '%');
            // console.log('-------------------');
            // 同步或异步操作
            var isAsync = typeof opts == 'undefined' ?
                false :
                (
                    typeof opts != 'object' ?
                        false :
                        (
                            typeof opts.async == 'undefined' ?
                                false :
                                (opts.async === true ? true : false)
                        )
                );
            // console.log('isAsync：', isAsync);
            // 同步版本
            if (isAsync == false) {
                (function (i) {
                    // 起始进度默认延时一定要设为0，否则会等待N毫秒后才开始执行
                    var timers = null, // 延迟函数ID
                        intervals = 0;  // 执行间隔时间，单位毫秒
                    if (i == me.$opts.$startProportion) { // 初始进度
                        intervals = 0;
                    }
                    else {
                        // 清除延迟操作
                        if (timers != null) {
                            clearTimeout(timers);
                            timers = null;
                        }
                        intervals = duration * (i - me.$opts.$startProportion);
                    }
                    timers = helpers._setProgressAnimate(me, intervals, i);
                })(nowRate);
            }
            // 异步版本
            else {
                return new Promise(function (resolve, reject) {
                    var i = nowRate;
                    // 起始进度默认延时一定要设为0，否则会等待N毫秒后才开始执行
                    var timers = null, // 延迟函数ID
                        intervals = 0;  // 执行间隔时间，单位毫秒
                    if (i == me.$opts.$startProportion) { // 初始进度
                        intervals = 0;
                    }
                    else {
                        // 清除延迟操作
                        if (timers != null) {
                            clearTimeout(timers);
                            timers = null;
                        }
                        intervals = duration;
                    }
                    timers = helpers._setProgressAnimate(me, intervals, i, resolve);
                });
            }
        },



        /**
         * 同步设置当前进度条“进度位置”(一般在for/forEach循环外使用)
         * 即：一次性地更新当前进度占整个进度条的“百分比值”
         * @param {Number|String} incrementOrPercent 当前进度条“增量值”或“百分比值”，值带百分号%时为“百分比值”，否则为“增量值”。“增量值”含义说明：比如进度条总长为 500，当前“增量值”为10，则系统会自动计算进度条“进度位置”占比为10/500 * 100% = 2%，即“百分比值”为2
         */
        updatePosition: function (incrementOrPercent) {
            var me = this;
            if (typeof incrementOrPercent == 'undefined') {
                var tips = arguments.callee.name + '函数参数错误，请检查！';
                console.error(tips);
                return;
            }
            var progress = 0;
            if (incrementOrPercent.toString().indexOf('%') > 0) {
                progress = incrementOrPercent.toString().replace(/\%/g, '');
            }
            else {
                var nowRate = utils.getRatio(incrementOrPercent, me.settings.max);
                var start = me.$opts.$startPosition; // 当前进度条“进度位置”
                progress = start + nowRate;
            }
            
            if (parseFloat(progress) > 100) progress = 100;
            helpers._setPositionAnimate(me, progress);
            helpers._setConsumingTimer(me); // 开启耗时计时器定时 test1 
        },



        /**
         * 手动显示进度失败信息
         */
        showFailureInfo: function () {
            var me = this;
            if (typeof me.$opts.$nodeBarFail != 'undefined') me.$opts.$nodeBarFail.style.setProperty('display', 'block');
            else {
                utils.prependHTML(me.$opts.$codeHtmlFail, me.$opts.$nodeBarContent);
                me.$opts.$nodeBarFail = document.getElementsByClassName(me.$opts.$classNameFail)[0]; // 全局赋值3
                me.$opts.$nodeBarFail.style.setProperty('display', 'block');
            }
            helpers._clearConsumingTimer(me); // 清空耗时计时器定时
        },


        /**
         * 手动显示耗时时间信息
         */
         showTimeConsuming: function () {
            var me = this;
            if (typeof me.$opts.$nodeBarConsume != 'undefined') me.$opts.$nodeBarConsume.style.setProperty('display', 'block');
            else {
                utils.appendHTML(me.$opts.$codeHtmlConsume, me.$opts.$nodeBarContent);
                me.$opts.$nodeBarConsume = document.getElementsByClassName(me.$opts.$classNameConsume)[0]; // 全局赋值3
                me.$opts.$nodeBarConsume.style.setProperty('display', 'block');
                if (me.$opts.$loopStartTime != null && me.$opts.$loopEndTime != null) {
                    var timeStr = utils.getTimeDiffrence({
                        method: 'milliseconds',
                        earlierTime: me.$opts.$loopStartTime,
                        laterTime: me.$opts.$loopEndTime
                    });
                    // console.log('timeStr：', timeStr);
                    me.$opts.$nodeBarConsume.innerHTML = '耗时 ' + timeStr;
                }
            }
        },
         
         
        /**
         * 手动显示关闭按钮
         */
        showCloseDownButton: function () {
            var me = this;
            if (typeof me.$opts.$nodeBarClose != 'undefined') me.$opts.$nodeBarClose.style.setProperty('display', 'block');
            else {
                utils.prependHTML(me.$opts.$codeHtmlClose, me.$opts.$nodeBarContent);
                me.$opts.$nodeBarClose = document.getElementsByClassName(me.$opts.$classNameClose)[0]; // 全局赋值3
                me.$opts.$nodeBarClose.style.setProperty('display', 'block');
                helpers._onClickCloseBtn(me); // 点击关闭按钮时关闭控件
            }
        },


        



        /**
         * 销毁控件
         * @param {Object} 包含延时等参数在内的对象
         * @paam {Function} callback 回调函数
         */
        destroy: function (opts, callback) {
            var me = this;
            var settings = {
                duration: 0, // 延时销毁的时长，默认0。单位毫秒
                success: null,  // 成功时执行的函数
                fail: null // 失败时执行的函数
            }
            var config = utils.combine(true, settings, opts || {});
            var intervals = config.duration;
            // var defTime = 0; // 默认延时时长，单位毫秒
            // var intervals = typeof ps_duration == 'undefined' ? defTime : (isNaN(parseFloat(ps_duration)) ? defTime : parseFloat(ps_duration)); // 执行间隔时间，单位毫秒
            var timers = setTimeout(function () {
                if (me.$opts == null || typeof me.$opts == 'undefined') {
                    if (config.fail) {
                        config.fail('进度条节点不存在(可能是还没有初始化)，故不用销毁');
                    }
                    return;
                }
                var node1 = me.$opts.$nodeRoot,
                    node2 = me.$opts.$nodeMask;
                if (node1 != null && typeof node1 != 'undefined') node1.remove();
                if (node2 != null && typeof node2 != 'undefined') node2.remove();
                if (config.success) {
                    config.success();
                }
                clearTimeout(timers);
                helpers._clearConsumingTimer(me); // 清空耗时计时器定时
            }, intervals);
        },
    };





    //================================================================
    // 帮助函数库
    //================================================================
    var helpers = {
        /**
         * 设置进度条“增量值”动画
         * 即：一般在循环内时延迟执行函数
         * @param {Object} me 当前控件对象
         * @param {Number} intervals 延迟间隔时长，单位毫秒
         * @param {Number} n 闭包参数
         * @param {Function} resolve Promise的resolve函数(可选)
         * @returns 返回延迟函数的ID
         */
         _setProgressAnimate: function (me, intervals, n, resolve) {
            var _this = this;
            return setTimeout(function () {
                // console.log('当前进度i值：', n);
                // console.log('---------------');
                var percentage = n + '%';
                // 进度100%时才显示完成
                if (n < 100) { // 进度 < 100%
                    if(typeof me.$opts.$nodeBarOver != 'undefined') me.$opts.$nodeBarOver.style.setProperty('display', 'none');
                }   
                else{ // 进度 = 100%
                    if(typeof me.$opts.$nodeBarOver != 'undefined') me.$opts.$nodeBarOver.style.setProperty('display', 'block');
                    if (typeof me.$opts.$nodeBarFail != 'undefined') me.$opts.$nodeBarFail.style.setProperty('display', 'none');
                    me.$opts.$loopEndTime = new Date().getTime();  // 全局赋值4
                    _this._clearConsumingTimer(me); // 清空耗时计时器定时
                }
                _this._setBarWidthAndText(me, percentage);
                if(typeof resolve == 'function') resolve(); // 异步操作成功，调用resolve
            }, intervals);
        },


        /**
         * 设置进度条“进度位置”动画效果
         * 即：一般在循环外时使用
         * @param {Object} me 当前控件对象
         * @param {Number} pos 当前进度条“百分比值”，是一个数值类型。eg.当前进度条已经进行到48%，则传值48
         */
         _setPositionAnimate: function (me, pos) {
            var _this = this;
            var start = 0;
            var timers = setInterval(fnAnimates(), me.settings.duration);
            function fnAnimates() {
                if (start > pos) {
                    // console.log('开始start：', start);
                    // console.log('进度pos：', pos);
                    // console.log('---------');
                    // 进度100%时才显示完成
                    if (pos < 100) { // 进度 < 100%
                        if(typeof me.$opts.$nodeBarOver != 'undefined') me.$opts.$nodeBarOver.style.setProperty('display', 'none');
                    } 
                    else { // 进度 = 100%
                        if(typeof me.$opts.$nodeBarOver != 'undefined') me.$opts.$nodeBarOver.style.setProperty('display', 'block');
                        if(typeof me.$opts.$nodeBarFail != 'undefined') me.$opts.$nodeBarFail.style.setProperty('display', 'none');
                    }
                    clearInterval(timers);
                    timers = null;
                    _this._clearConsumingTimer(me); // 清空耗时计时器定时
                }
                else {
                    var percentage = start + '%';
                    _this._setBarWidthAndText(me, percentage);
                    start++;
                }    
                return fnAnimates;
            }
        },
         
         
         /**
          * 设置进度条当前占比占比宽度和显示文本
          * @param {Object} me 当前控件对象
          */
        _setBarWidthAndText(me, percentage) {
            if(typeof me.$opts.$nodeBarCartoon != 'undefined') me.$opts.$nodeBarCartoon.style.setProperty('width', percentage); // 进度条占比形状
            if(typeof me.$opts.$nodeBarText != 'undefined') me.$opts.$nodeBarText.innerText = percentage; // 进度条占比文本. eg. 48%
        },


        /**
         * 创建遮罩层
         * @param {Object} me 当前控件对象
         * @returns {HTML DOM} 返回遮罩节点DOM对象
         */
        _createMask: function (me) {
            var zIndex = parseInt(me.settings.zIndex) - 1,
                opacity = parseFloat(me.settings.mask.opacity);
            if (isNaN(zIndex)) zIndex = parseInt(me.defaults.zIndex) - 1;
            if (isNaN(opacity)) opacity = me.defaults.mask.opacity;
            if (opacity > 1) {
                opacity = parseFloat(opacity / 100).toFixed(2);
            }
            var alphOpacity = parseFloat(opacity * 100).toFixed(0);
            var maskNode = document.createElement('div');
            maskNode.className = me.$opts.$classNameMask;
            maskNode.setAttribute('style', 'position: fixed; z-index: ' + zIndex + '; top: 0; right: 0; width: 100%; height: 100%; margin: 0 auto; background: #000; opacity: '+ opacity + '; filter: alpha(opacity = ' + alphOpacity + ')');
            utils.insertAfter(maskNode, me.$opts.$nodeRoot);
            return maskNode;
        },

        /**
         * 点击关闭按钮时关闭控件
         * @param {Object} me 当前控件对象
         */
        _onClickCloseBtn: function (me) {
             // 关闭按钮点击事件
             if (typeof me.$opts.$nodeBarClose != 'undefined') {
                me.$opts.$nodeBarClose.addEventListener('click', function () {
                    me.$opts.$nodeRoot.remove();
                    me.$opts.$nodeMask.remove();
                });
            }
        },
        

        /**
         * 开启耗时计时器定时 test1
         * @param {Object} me 当前控件对象
         */
        _setConsumingTimer(me) {
            if (me.settings.showConsume) {
                function fn() {
                    var intervals = 100; // 耗时时间, 单位毫秒
                    me.$opts.$loopTimers = setTimeout(fn, intervals); // 这里填写1000，表示每1秒执行一次
                    var milliseconds = intervals * me.$opts.$loopBeginValue;
                    var seconds = Math.floor(milliseconds / 1000);
                    var tmpStr = milliseconds == 0 ? '' : '耗时' + (seconds == 0 ? (milliseconds / 1000).toFixed(1) + '秒' : utils.getTimeToString(seconds)); // eg. '耗时5秒'; 
                    me.$opts.$nodeBarConsume.innerHTML = tmpStr;
                    me.$opts.$loopBeginValue++;
                }
                fn();
            }
        },


        /**
         * 清空耗时计时器定时 test1
         * @param {Object} me 当前控件对象
         */
        _clearConsumingTimer: function (me) {
            if (me.$opts.$loopTimers != null) { // 清空定时器
                me.$opts.$loopBeginValue = 0; // 重置0 // 全局赋值4 
                clearTimeout(me.$opts.$loopTimers);
                me.$opts.$loopTimers = null;
            }
        }
    };




    //================================================================
    // 工具库
    //================================================================
    var utils = {
        /**
         * 获取百分比值
         * @param {Number} ps_now_value 当前值
         * @param {Number} ps_max_value 最大值
         * @returns {Number} 返回当前值除以最大值的百分比值，不含百分号%
         */
        getRatio: function (ps_now_value, ps_max_value) {
            return Math.floor( (parseFloat(ps_now_value) / parseFloat(ps_max_value)) * 100 )
        },


              
        /**
         * 将秒数转化成用户看得懂的具体时间字符串
         * @param {Number} ps_seconds 秒数(数值类型)。eg. 80 表示 80秒
         * @param {String} 返回具体的时间字符串。eg. 800秒相当于'10分20秒',  5200秒相当于'1小时26分钟40秒'
         */
         getTimeToString: function(ps_seconds){
            if(ps_seconds <= 0) return '0秒';
            return this.getTimeStringByMiliseconds(ps_seconds * 1000); // 时间差。单位毫秒 
        },
         
         
         
        /**
         * 获取两个时间之间的时间差
         * @param {Object} options 参数对象。格式参见函数内 defaults 参数
         * @returns {String} 返回时间差字符串。eg. '2年1天13小时55分钟53秒'
         */
         getTimeDiffrence: function (options){
             var defaults = {
                method: 'dateString', // 时间参数格式，默认dateString。值： dateString 表示日期的字符串值, milliseconds 一个Unix 时间戳整数值，表示自 1970 年 1 月 1 日 00:00:00 UTC（the Unix epoch）以来的毫秒数。
                // 时间参数格式：可以是1970年1月1日以来至某个时间的毫秒数(如63208553000)，也可以是时间戳，或某个时间字符串(比如' 2024-11-07 09:15:38')。
                earlierTime: new Date().getMilliseconds(), // 较早的时间，默认1970年的毫秒数。eg. '2024-11-07 10:03:12', 
                laterTime: new Date().getTime() // 较晚的时间，默认1970年至今的毫秒数。eg. '2026-11-08 23:59:05'
            }
            var earlierTime = options.earlierTime || defaults.earlierTime,
                laterTime = options.laterTime || defaults.laterTime,
                method = options.method || defaults.method;
            var nD = 365; // 一年几天，默认365天
            var d1 = 0,  // 将时间转化成时间戳。自1970年1月1日以来的毫秒数
                d2 = 0;
            if(method == 'dateString'){
                d1 = new Date(earlierTime).getTime(),
                d2 = new Date(laterTime).getTime();
            }
            else if(method == 'milliseconds'){
                d1 = new Date(parseInt(earlierTime)).getTime(),
                d2 = new Date(parseInt(laterTime)).getTime();
            }
            else {
                console.error(arguments.callee.name + '参数传递错误，method 不是有效的参数值');
                return '';
            }
            var jiangeshijian = d2 - d1; // 时间差。单位毫秒
            return this.getTimeStringByMiliseconds(jiangeshijian);
        },

         
         
        /**
         * 通过毫秒数返回一个用户看得懂的具体时间字符串
         * @param {Number} ps_milliseconds 毫秒时间(数值类型)。eg. 2500 表示 2500 毫秒
         * @returns {String} 返回时间字符串。eg. 9328000 毫秒 相当于'2小时35分钟28秒' eg. 31672410000 毫秒 相当于 '1年1天13小时53分钟30秒'
         */
        getTimeStringByMiliseconds: function(ps_milliseconds){
            var nD = 365; // 一年几天，默认365天
            var dMilliseconds = ps_milliseconds; // 时间差。单位毫秒
            // console.log('ps_milliseconds：', ps_milliseconds);
            var dSeconds = Math.floor(dMilliseconds / 1000), // 时间差。单位秒
                dMinutes = dSeconds >= 60 ? Math.floor(dSeconds / 60) : 0, // 分钟
                dHours = dMinutes >= 60 ? Math.floor(dMinutes / 60) : 0, // 小时
                dDays = dHours >= 24 ? Math.floor(dHours / 24) : 0, // 天
                dYears = dDays > nD ? Math.floor(dDays / nD) : 0; // 年
            // console.log('-------- 时间信息 ----------');
            // console.log('开始时间：', earlierTime);
            // console.log('结束时间：', laterTime);
            // console.log('总毫秒数：', dMilliseconds);
            // console.log('总秒数：', dSeconds);
            // console.log('总分钟数：', dMinutes);
            // console.log('总小时数：', dHours);
            // console.log('总天数：', dDays);
            // console.log('总年数：', dYears);
            
            var year = 0, day = 0, hour = 0, minute = 0, second = 0, millisecond = 0;
            // if(dYears >= 1){ //... }
            year = dYears; // 年
            day = dDays - ( year * nD ); // 天
            hour = dHours - ( (year * nD + day) * 24 ); // 小时
            minute = dMinutes - ( ( (year * nD + day) * 24 + hour ) * 60 ); // 分钟
            second = dSeconds - ((((year * nD + day) * 24 + hour) * 60 + minute) * 60); // 秒
            if (dMilliseconds < 1000) millisecond = dMilliseconds; // 毫秒 (只有小于1秒时才使用毫秒)
            // console.log('-------- 时间相差 ----------');
            // console.log('年：', year);
            // console.log('天：', day);
            // console.log('小时：', hour);
            // console.log('分钟：', minute);
            // console.log('秒：', second);
            var str = ''; // 用时字符串。eg. '2年10天12小时45分钟15秒';
            str += year <= 0 ? '' : year + '年';
            str += day <= 0 ? '' : day + '天';
            str += hour <= 0 ? '' : hour + '小时';
            str += minute <= 0 ? '' : minute + '分钟';
            str += second <= 0 ? '' : second + '秒';
            str += millisecond <= 0 ? '' : (millisecond / 1000).toFixed(1) + '秒';
            // console.log('用时：', str);
            return str;
        },


        /**
         * 原生JS合并对象2
         * 即用两个对象来拓展，返回拓展后的新对象
         * @param {Boolean} deep 是否深度合并，默认false
         * @param {Bbject} defs 第1个被合并的对象(可选)
         * @param {Object} opts 第2个被合并的对象(可选)
         * @param {Object} method 其它操作方式(可选)
            参数 method = {
                isToEmptyObject: true, // 是否合并到空对象上
                includePrototype: true, // 是否遍历合并源对象原型链上的属性，默认true
                forEach: function(target, name, sourceItem) {
                    target[name] = sourceItem + 'hello， 自定义每个合并项';
                    return target;
                }
            }
        * @returns {Object} 返回合并后的目标对象
        */
        combine: function(deep, defs, opts, method){
            var options = {};
            if(typeof deep === 'boolean') options = { isDeep: deep === false ? false : true };
            else options =  { isDeep: false }
            if (typeof method === 'object') options = method;

            /**
             * 子函数：合并对象
             * @param {object} options 选项
             * @returns {object} 返回合并后的对象
             * [参考]：https://segmentfault.com/a/1190000011492291
             * [示例]
                // eg1.普通合并(浅合并)
                var target = EXT().merge(data1, data2);
                // eg2. isDeep 选择是否进行深合并。true 深度合并, false 浅合并，默认true
                var target = EXT({ isDeep: false }).merge(data1, data2);
                // eg3. includePrototype：选择是否要遍历对象的原型链，默认为 true
                var target = EXT({ includePrototype: false }).merge(data1, data2);
                // eg4. forEach：对每个合并项进行自定义处理
                var target = EXT({
                    forEach: function(target, name, sourceItem) {
                        target[name] = sourceItem + 'hello， 自定义每个合并项';
                        return target;
                    }
                }).merge(data1, data2);
            */
            function EXT(options) {
                return new EXT.prototype.init(options);
            };
            EXT.fn = EXT.prototype = {
                type: function(o) {
                    return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
                },
                typeMap: {
                    object: function() {
                        return {};
                    },
                    array: function() {
                        return [];
                    }
                },
                // 默认配置项
                defaults: {  
                    isDeep: true, // 是否深合并，默认true
                    isToEmptyObject: true, // 是否合并到空对象上
                    includePrototype: true, // 是否遍历合并源对象原型链上的属性，默认true
                    forEach: function(target, name, sourceItem) { // 用于对每个合并项进行自定义修正
                        target[name] = sourceItem;
                        return target;
                    }
                },
                // 将配置项合并到默认配置项
                init: function(options) {
                    for (var name in options) {
                        this.defaults[name] = options[name];
                    }
                    return this;
                },
                merge: function() {
                    var self = this,
                        _default = self.defaults,
                        i = 1,
                        length = arguments.length,
                        // 根据是否全并到空对象{}中，决定对象采取”引用”还是“只赋值不引用”的方式
                        // config = arguments[0] || {},
                        config = _default.isToEmptyObject ? JSON.parse(JSON.stringify(arguments[0] || {})) : arguments[0] || {}, // 默认配置项
                        source,
                        configItem,
                        sourceItem,
                        tiType,
                        siType,
                        clone,
                        name;
                    // console.log('默认配置项defs：', defs, '\n默认配置项config：', config, '\n第1个参数：', arguments[0]);
                    for (; i < length; i++) {
                        // 判断源对象是否为空
                        if ((source = arguments[i]) != null) {
                            for (name in source) {
                                var hasPro = source.hasOwnProperty(name);
                                // 是否遍历源对象的原型链
                                if (hasPro || _default.includePrototype) {
                                    configItem = config[name];
                                    sourceItem = source[name];
                                    tiType = self.type(configItem);
                                    siType = self.type(sourceItem);
                                    // 防止出现回环
                                    if (config === sourceItem) {
                                        continue;
                                    }
                                    // 如果复制的是对象或者数组
                                    if (_default.isDeep && sourceItem != null && self.typeMap[siType]) {
                                        clone = configItem != null && tiType === siType ? configItem : self.typeMap[siType]();
                                        // 递归
                                        config[name] = self.merge(clone, sourceItem);
                                    } else {
                                        clone = hasPro ? config : config.__proto__;
                                        // 处理每一个合并项
                                        clone = _default.forEach.call(self, clone, name, sourceItem);
                                    }
                                }
                            }
                        }
                    }
                    return config;
                }
            };
            EXT.fn.init.prototype = EXT.fn;

            // 调用并返回结果
            return EXT(options).merge(defs, opts);
        },


           
        /**
         * 原生js prepend字符串
         * 即：向父节点中添加子节点HTML字符串，将把该HTML插入到父节点内部的最前面
         * @param {String} str 子节点字符串
         * @param {HTML DOM} el 父节点
         */
        prependHTML: function(str, el) {
            var divTemp = document.createElement("div"),
                nodes = null,
                fragment = document.createDocumentFragment();
            divTemp.innerHTML = str;
            nodes = divTemp.childNodes;
            for (var i = 0, length = nodes.length; i < length; i += 1) {
                fragment.appendChild(nodes[i].cloneNode(true));
            }
            // 插入到容器的前面 - 差异所在
            el.insertBefore(fragment, el.firstChild);
            // 内存回收？
            nodes = null;
            fragment = null;
        },
    
    
        /**
         * 原生js append字符串
         * 即：向父节点中添加子节点HTML字符串，将把该HTML插入到父节点内部的最后面
         * @param {String} str 子节点字符串
         * @param {HTML DOM} el 父节点
         */
         appendHTML: function(str, el){
            HTMLElement.prototype.appendStr = function(str) {
                var divTemp = document.createElement("div"), nodes = null, 
                    fragment = document.createDocumentFragment(); // 文档片段，一次性append，提高性能
                divTemp.innerHTML = str;
                nodes = divTemp.childNodes;
                for (var i=0, length=nodes.length; i<length; i+=1) {
                fragment.appendChild(nodes[i].cloneNode(true));
                }
                this.appendChild(fragment);
                // 据说下面这样子世界会更清净
                nodes = null;
                fragment = null;
            }
            el.appendStr(str);
        },

         
        /**
         * 重定义并优化原生的 Node.appendChild 方法
         * 向父节点中添加子节点，并将子节点插入到父节点内部的最后面，但在script/style节点前面
         * @param {HTML DOM} newNode childNode 子节点
         * @param {HTML DOM} fatherNode  父节点
         * add 20240929-1
         */
        appendChild: function (childNode, fatherNode) {
            var childrenNode = fatherNode.children; // 获取父节点的直接子元素
            // 将子节点插入到内部的最后面，但不包括style和script元素
            for (var i = childrenNode.length - 1; i >= 0; i--) { // 循环倒装一下
                if (childrenNode[i].tagName === "STYLE" || childrenNode[i].tagName === "SCRIPT" || childrenNode[i].className === 'controls') {
                    continue; // 跳过style和script元素
                }
                this.insertAfter(childNode, childrenNode[i]);
                break; // 只插入一次，因为新节点会被插入到最后一个style/script元素之前
            }
        },

        /**
         * 原生js在已存在的节点向后面插入新节点(兼容ie9-)
         * @param {HTML DOM} newNode 新节点
         * @param {HTML DOM} existingNode 已存在的节点
         */
        insertAfter: function(newNode, existingNode) {
            if (typeof existingNode == 'undefined' || existingNode == null) {
                console.error('节点不存在');
                return;
            }
            var parent = existingNode.parentNode;
            if (parent == null) {
                console.error('父节点不存在');
                return;
            }
            // 最后一个子节点 lastElementChild兼容其他浏览器 lastChild  兼容ie678;
            var lastNode = parent.lastElementChild || parent.lastChild;
            // 兄弟节点同样也是有兼容性
            var siblingNode = existingNode.nextElementSibling || existingNode.nextSibling;
            if (lastNode == existingNode) // 先判断目标节点是不是父级的最后一个节点，如果是的话，直接给父级加子节点就好
            { 
                parent.appendChild(newNode);
            }
            else // 不是最好后一个节点  那么插入到目标元素的下一个兄弟节点之前（就相当于目标元素的insertafter）
            { 
                parent.insertBefore(newNode, siblingNode);
            }
        },


    };


    //================================================================
    // 返回对象
    //================================================================
    return Widget;
});

//================================================================
//  创建“既是函数又是对象”的实例
//================================================================
function createNewInstace(config){
    // 说明：bind()就是将函数绑定到某个对象上。 例如：f.bind(obj)，实际上可以理解为 obj.f()
    // 实例化一个对像
    var context = new NProgress(config); // context 是一个实例化的对象，只能当对象使用，不能当函数使用。
    // 创建请求函数
    var instance = NProgress.prototype.init.bind(context); // instance 是一个函数，由 bind 返回的一个新函数，可以调用 instance()。
    // 将 对象原型链 prototype 对象中的方法添加到 instance 函数对象中
    // 为了实现能够将 instance 函数作为对象使用，我们就要将 对象原型链 prototype 对象中的方法添加给 instance 。毕竟函数也一个对象，也能够添加方法。
    Object.keys(NProgress.prototype).forEach(function (item) {
        instance[item] = NProgress.prototype[item].bind(context);
    });
    // 为 instance 函数对象添加属性
    Object.keys(context).forEach(function (item) {
        instance[item] = context[item];
    })
    return instance;
}

var neuiProgressBar = createNewInstace();



