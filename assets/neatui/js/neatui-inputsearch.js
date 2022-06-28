/**
* [neuiInputsearch]
* 输入下拉控件 
* 版本 v2.0
* 兼容情况：兼容ie8及ie8+
* Website: https://github.com/yimobing/neatui
* Author: chenMufeng
* Date: 2021.07.01
* Update: 2021.11.04
*/



;(function root(root, factory) {
    if(typeof define === 'function' && define.amd){ // amd
        define(factory);
    } else if(typeof exports === 'object'){ // umd
        module.exports = factory();
    } else{
        window.neuiInputsearch = factory();
    }
})(this, function(){

    //================================================================
    //                      · 控件开发
    //================================================================
    var doc = document, win = window;
    var net = {};

    // 两种调用方式：
    // 1. "INNER" 内部方式调用(即Click等事件写在控件里面)： XX(elem, options);
    // 2. "OUTER" 外部方式调用(即Click等事件写在前台页面)： $('#elem').on('input', function() { XX(options, $('#elem')); })
    var neuiInputsearch = function(elem, options){
        var obj = tools.isJsonObject(options) ? 
        typeof elem === 'string' ? tools.getIdClassNameStrDom(elem): (elem instanceof jQuery ? elem : null)
        : 
        options; 
        obj = obj instanceof jQuery ? obj[0] : obj; // 输入框元素DOM对象
        var caller = tools.isJsonObject(options) ? "INNER" : "OUTER"; // 调用方式
        var opts = tools.isJsonObject(options) ? options : elem;
        var ele = tools.isJsonObject(options) ? 
                (typeof elem === 'string' ? elem : (elem instanceof jQuery ? elem.selector : null))
                :
                ( typeof options === 'string' ? 
                    options : 
                    ( 
                        options instanceof jQuery ?  
                        ( typeof options.attr('id') == 'undefined' ? tools.getStringClassName(options.attr('class')) : '#' + options.attr('id'))
                        : 
                        ( tools.isDomObject(options) ? (options.id === '' ?  tools.getStringClassName(options.className) : '#' + options.id) : null )
                    ) 
                );
        // console.log('ele：', ele);
        if(ele == null){
            tools.dialogs('输入下拉控件参数传递有误，第一个参数elem必须绑定元素节点或jq对象，如"#name" 或 $("#name")！');
            return;
        }
        return new inputDrop(ele, opts, obj, caller);
    };



    //================================================================
    // 用一个或多个对象来扩展一个对象，返回被拓展的对象
    /* neuiInputsearch.extend = net.extend = function(defaults, options){
        var target = defaults;
        var src, copy;
        for(var name in options){
            src = target[name], copy = options[name];
            if(typeof copy !== 'undefined') target[name] = copy;
        }
        return target;
    }; */


    /**
     * 原生JS模拟JQ extend合并对象
     * 用一个或多个对象来扩展一个对象，返回被拓展的对象
     * @param {boolean} deep 是否深度合并对象(可选),默认false
     * @param {object} target 目标对象，其他对象的成员属性将被附加到该对象上。
     * @param {object} object1 第1个被合并的对象(可选)。
     * @param {object} objectN 第N个被合并的对象(可选)。
     *  [调用示例]
        格式：extend(deep, target, defs, opts);
        eg1. extend(defs, opts); // 浅合并
        eg2. extend({}, defs, opts); // 浅合并
        eg2. extend(true, defs, opts); // 深合并
        eg3. extend(true, {}, defs, opts); //深合并
     * [jq合并对象的方法]
        $.extend(deep, target, obj1, obj2, ..., objN);
     */
    neuiInputsearch.extend = net.extend = function(){
        var options, name, src, copy, deep = false, target = arguments[0], i = 1, length = arguments.length;
        if (typeof (target) === "boolean") deep = target, target = arguments[1] || {}, i = 2; // eg. extend(true, {}, defs, opts || {});
        if (typeof (target) !== "object" && typeof (target) !== "function") target = {}; // eg.
        if (length === i) target = this, --i;
        if(deep){ 
            // 深度合并
            for (; i < length; i++) {
                if ((options = arguments[i]) != null) {
                    target = fnExtendObject(target, options);
                }
            }
        }else{ 
            // 浅合并
            for (; i < length; i++) {
                if ((options = arguments[i]) != null) {
                    for (name in options) {
                        src = target[name], copy = options[name];
                        if (target === copy) continue;
                        if (copy !== undefined) target[name] = copy;
                    }
                }
            }
        }
        // console.log('target：', target)
        return target;


        /**
         * 子函数：递归深度合并JSON对象
         * 注：遇到相同元素级属性，以defs为准。
         * 参考：https://www.cnblogs.com/catgatp/p/9189228.html
         * @param {object} defs 第1个被合并的对象
         * @param {object} opts 第2个被合并的对象
         * @returns {object} 返回合并后的目标对象，所有被合并的对象的成员属性将被附加到该对象上。
         */
         function fnExtendObject(defs, opts){
            if(!fnIsJson(defs)  || !fnIsJson(opts)){
                alert('参数不是JSON对象，请检查！');
                return {};
            }
            var target = JSON.parse(JSON.stringify(defs)); // 赋值而不改变原对象(注意：对象直接赋值是引用赋值，会改变原对象)
            // 遇到相同元素级属性，以 minor 为准
            // 不返还新Object，而是 main 改变
            var mergeObj = function(minor, main) {
                for(var key in minor) {
                    if(main[key] === undefined) { // 不冲突的，直接赋值 
                        main[key] = minor[key];
                        continue;
                    }
                    // 冲突了，如果是Object，看看有么有不冲突的属性; 不是Object 则以 minor 为准为主
                    // console.log(key)
                    if(fnIsJson(minor[key]) || fnIsArray(minor[key])) { // arguments.callee 递归调用，并且与函数名解耦 
                        // console.log("is json")
                        //arguments.callee(minor[key], main[key]);
                        mergeObj(minor[key], main[key]);
                    }else{
                        main[key] = minor[key];
                    }
                }
            }
            mergeObj(opts, target);
            return target;
        }
        /**
         * 子函数：判断是否JSON对象
         */
        function fnIsJson(o) {
            return typeof o == "object" && (o != null && o.constructor == Object);
        }
        /**
         * 子函数：判断是否数组
         */
        function fnIsArray(o) {
            return Object.prototype.toString.call(o) == '[object Array]';
        }
    };

    // 自定义控件参数(仅限控件里面使用)
    net.idClass = 'neInputsearch'; // 根节点id或class属性值
    


    
    //================================================================
    /**
     * 
     * @param {string} elem 输入框元素节点. eg.'#floor', '.floor'
     * @param {object} options 控件参数
     * @param {HTML DOM} obj 输入框元素节点DOM对象
     * @param {string} method 调用方式
     * @returns 
     */
    function inputDrop(elem, options, obj, method){
        var me = this;
        var defaults = {
            // 控件调用的两种方式：
            // 方法1、“根据控件事件触发方式及返回的数据源”调用控件
            event: "input", // 事件触发方式(可选)，默认input。值：input 在输入框元素中输入文字时, click 点击输入框元素时
            inputBack: function(e){ // 根据事件触发方式返回数据源(可选)。
                var value = e.value;
                var source = {data:[]}
                return source; // 返回数据源
            },
            // 方法2、“在on input 或 on input 事件中指定数据源”调用控件
            source: {}, // 数据源。
            
            // 字段
            format: [ ], // 自定义数据源字段(可选)，默认空数组。若数据源字段为id, value或bh, mc，控件将自动识别(即本参数值为空数组即可)。参数格式：eg1. ["value"], eg2.["id", "value"] 其中, "id" 表示隐藏值字段, "value" 表示显示值字段。
            notes: "", // 自定义下拉项中说明性文字字段(可选), 默认空。eg. "bz"
            // 定位    
            position: "fixed", // 定位方式(可选)，默认fixed。值：fixed 固定定位(即相对浏览器窗口定位)，absolute 绝对定位(即相对输入框元素定位)。
            zIndex: 1, // 自定义控件层级(可选)，默认1。
            width: "auto", // 宽度(可选)，默认auto根据输入框元素自动调整。
            height: 200, // 高度(可选)，默认200。
            animate: false, // 是否启用动画效果(可选), 默认false。

            // 控件标识
            caption: "", // 标题(可选)，默认空。
            value: "", // 输入框元素默认值，仅当event='click'时有效(可选)，默认空。
            id: "", // 作为控件的唯一标识(可选)，默认空。
            className: "",  // 自定义控件类名(可选)，默认空。
            
            // 下拉项设置
            itemHeight: 36, // 每一项的高度(可选)，默认36
            explained: true, // 是否选中下拉项后自动过滤说明性文字(可选)，默认true。
            // 若想要下拉项中有说明性文字,则可在数据源非编号字段中添加em或span标签. eg {"bh":"1001", "mc":"张三<em>一个大好人</em>"}, 那么"一个大好人"就是说明性文字了.
            autoFill: { // 自动填充值到输入框元素中(可选)。
                selectedFill: true, // 选中下拉项后是否自动填充(可选)，默认true。
                oneItemFill: false // 只有一个下拉项时是否自动填充(可选)，默认false。值：auto 根据设备自动判断(移动端false，pc端true), true 自动填充, false 手动点下拉项填充。
            },
            noData: { // 无数据时(可选)。
                enable: true, // 无数据时是否显示“无数据”下拉项(可选)，默认true。
                label: "无数据" // 自定义无数据时显示的下拉项值(可选)，默认无数据。
            },
            entire: { // 给数据源自动添加一个下拉项(可选)。
                enable: false, // 是否启用(可选), 默认false。
                text: "全部", // 下拉项显示值(可选), 默认"全部"。
                hid: "全部" // 下拉项隐藏值, 默认"全部"。
            },

            // 按钮
            closeButton: { // 关闭按钮(可选)。
                enable: true, // 是否显示关闭按钮(可选)，默认true
                theme: "text", // 关闭按钮样式(可选)。值：text 文字按钮(默认), image 图标按钮
                direction: "default" // 关闭按钮位置(可选)。值： default 底部居中(默认), topCenter 顶部居中, leftTop 左上角, rightTop 右上角, leftBottom 左下角, rightBottom 右下角。
            },

            // 控件关闭 add 20211113-1
            besidesClose: [ ], // 指定点击页面其它地方关闭控件时排除哪些节点，即点击这些节点不会关闭控件(可选)，默认空数组。数组元素可以是选择器字符串、JQ对象或DOM对象。eg. ['#id1', '#id2', '.className1', $('#btn1'), document.getElementById('id1') ]
   
            // 回调
            onConfirm: function(e){ // 选择某一项后的回调(可选)。e 格式：{dom: "当前输入框元素DOM对象", id: "新的隐藏值", value: "新的显示值", oldId: "旧的隐藏值", oldValue: "旧的显示值"}
            },
            onClose: function(e){ // 关闭后的回调(可选)。e 格式：{dom: "当前输入框元素DOM对象", id: "新的隐藏值", value: "新的显示值"}
            }
        }

        // 全局赋值
        this.$opts = net.extend(true, {}, defaults, options || {}); // 控件参数对象(深度合并)
        var selector = elem.indexOf('#') >= 0 ?  
                    elem.replace(/([\#]+)/g, '') 
                    : 
                    ( elem.indexOf('.') >= 0 ? tools.getClassNameString(elem) : elem.replace(/([\#\.]+)/g, '') );
        this.$ids = document.getElementById(selector);
        this.$classes = document.getElementsByClassName(selector);
        //
        this.$method = method; // 调用方式。 值： "OUTER" 外部调用,  "INNER" 内部调用
        this.$selector = selector; // 输入框元素节点ID或CLass属性值(不含选择器符号井号#或点号.). eg. 'floor'
        this.$elem = elem; // 输入框元素节点ID或Class属性值(含选择器符号井号#或点号.). eg.'#floor', '.floor'
        this.$elements = this.$ids == null ? this.$classes : [this.$ids]; // 输入框元素DOM对象集合（所有元素，数组对象）
        // this.$dom = document.getElementById(selector) == null ? document.getElementsByClassName(selector)[0] : document.getElementById(selector); // 输入框元素节点DOM对象
        this.$obj = this.$dom = obj; // 输入框元素DOM对象（单个元素，当前对象）
    
        // 控制台输出
        // console.log('opts：',this.$opts);
        // console.log('ids：',this.$ids);
        // console.log('classes：',this.$classes);
        // console.log('method：', this.$method);
        // console.log('selector：', this.$selector);
        // console.log('elem：',this.$elem);
        // console.log('elements：', this.$elements);
        // console.log('object：', this.$obj);
        // console.log('DOM：', this.$dom);
        // console.log('--------------------------------------');

        // 初始化
        if(typeof this.$dom == 'undefined' || this.$dom == null){
            tools.dialogs("控件绑定的节点有错误，请查询是否存在以下节点\n" + elem);
            return;
        }
        // 初始化
        this.init();

    };





    //================================================================
    //                          · 原型函数或对象
    //================================================================
    /**
     * 初始化
     */
    inputDrop.prototype.init = function(){
        var me = this;
        if(me.$method == "INNER"){
            Array.from(me.$elements).forEach(function(element, i){
                // element.addEventListener(me.$opts.event, function(){
                //     me.createControl(element);
                // })
                tools.addEventListener(element, me.$opts.event, function(e){ // 兼容ie8-
                    me.createControl(element);
                })
            })
        } else if(me.$method == "OUTER"){
            me.createControl(me.$obj);
        }
    };

    inputDrop.prototype.createControl = function(valCell){
        var me = this;
        var opts = me.$opts;
        var format = opts.format, source = opts.source;
        var dFieldId = "id", dFieldValue = "value"; // 默认数据源字段1
        var dFieldHid = "bh", dFieldName = "mc"; // 默认数据源字段2
        var fFieldId = tools.isArray(format) ? (format.length > 1 ? format[0] : dFieldId) : dFieldId,
            fFieldValue = tools.isArray(format) ? ( format.length > 1 ? format[1] : ( format.length == 1 ? format[0] : dFieldValue) ) : dFieldValue,
            fFieldBz = opts.notes;
        // 判断数据源
        var inputValue = tools.getElementValue(valCell); // 当前输入框元素的值
        var dataSource = me.$method == "INNER" ? opts.inputBack({value: inputValue}) : source;
        if(typeof dataSource == 'undefined'){
            tools.dialogs('前台未指定数据源，或输入时未返回数据源！');
            return;
        }
        if(dataSource.toString().replace(/([ ]+)/g, '') === ''){
            tools.dialogs('暂无数据，后台返回空字符串""');
            return;
        }
        
        // if(Object.keys(dataSource).length === 0){
        if(JSON.stringify(dataSource) === '{}'){
            tools.dialogs('暂无数据，后台返回空对象{}');
            return;
        }
        if(typeof dataSource.data == 'undefined'){
            tools.dialogs('请检查数据源是否包含data属性，正确的格式：{data:[]}');
            return;
        }

        // 列表HTML
        var listHtml = '';
        var liHeight = isNaN(Math.floor(opts.itemHeight)) ? 32 : Math.floor(opts.itemHeight);
        var _liStyle = ' style="min-height:' + liHeight + 'px"';
        if(opts.entire.enable){ // 给数据源自动增加一个下拉项
            var _liClassName = opts.entire.text == inputValue ? ' class="on"' : '';
            listHtml += '<li data-bh="' + opts.entire.hid + '"' +_liClassName + _liStyle + '>' + opts.entire.text + '</li>';
        }
        for(var i = 0; i < dataSource.data.length; i++){ // 循环数据源中的下拉项
            var row = dataSource.data[i];
            var bh = typeof row[dFieldId] != 'undefined' ? 
                    row[dFieldId] : 
                    ( 
                        typeof row[dFieldHid] != 'undefined' ?
                        row[dFieldHid] :
                        ( fFieldId == dFieldId ? (i + 1) : row[fFieldId] )  
                    ),
                value = typeof row[fFieldValue] == 'undefined' ? (typeof row[dFieldName] == 'undefined' ? row[fFieldValue] : row[dFieldName]) : row[fFieldValue],
                beiZhu = fFieldBz.toString().replace(/([ ]+)/g, '') === '' ? '' : ( typeof row[fFieldBz] == 'undefined' ? '' : row[fFieldBz]);
            var _liClassName = ( value == inputValue ) ? ' class="on"' : '';
            value += beiZhu == '' ? '' : '<em>(' + beiZhu + ')</em>'
            listHtml += '<li data-bh="' + bh + '"' + _liClassName + _liStyle + '>' + value + '</li>';
        }
        // 输入框元素默认值
        if(me.$opts.event == 'click' && me.$opts.value.toString().replace(/([ ]+)/g, '') !== '') {
            tools.giveValueToElement(valCell, me.$opts.value);
        }

        // 标题HTML
        var capHtml = opts.caption.replace(/([ ]+)/g, '') === '' ? '' : '<div class="neInputsearch__cap">' + opts.caption + '</div>';
        // 关闭按钮
        var btn = opts.closeButton;
        var btEnable = false, btTheme = '', btDirection = '';
        if(typeof btn === 'object') {
            btEnable = btn.enable === true ? true : false;
            btTheme = btn.theme;
            btDirection = btn.direction;
        }
        var _btClassNameStr = btTheme != 'image' ? ' isText' : ' isPicture',
            _btTextStr = btTheme != 'image' ? '关闭' : '';
            _btClassNameStr += ' ' + btDirection;
            _paneClassNameStr = btTheme == 'text' && btDirection == 'default' ? '' : ' has-radius';
        var btnHtml = !btEnable ? '' : [
            '<div class="neInputsearch__btn' + _btClassNameStr + '">',
                '<button type="button">' + _btTextStr + '</button>',
            '</div><!--/.neInputsearch__btn-->',
        ].join('\r\n');
        // 定位
        var position = opts.position,
            zIndex = isNaN(parseInt(opts.zIndex)) ? 1 : parseInt(opts.zIndex),
            width = isNaN(Math.floor(opts.width.toString().replace(/px/g, ''))) ? 'auto' : Math.floor(opts.width.toString().replace(/px/g, '')),
            height = isNaN(Math.floor(opts.height)) ? 200 : Math.floor(opts.height),
            animate = opts.animate === true ? true : false;
        var _paneStyle = ' style="max-height:' + height + 'px"';
        // 下拉值设置
        var enableNoData = dataSource.data.length == 0 ? opts.noData.enable : false,
            noDataText = opts.noData.label.toString().replace(/([ ]+)/g, '') === '' ? '无数据' : opts.noData.label;
        // 拼接HTML
        var allHtml = [
            ( btDirection.toLocaleLowerCase().indexOf('top') >= 0 ? btnHtml : '' ),
            capHtml,
            (
                enableNoData ? '' : 
                [
                    '<div class="neInputsearch__pane' + _paneClassNameStr + '"' + _paneStyle + '>',
                        '<ul>' + listHtml + '</ul>',
                    '</div><!--/.neInputsearch__pane-->'
                ].join('\r\n')
            ),
            (
                !enableNoData ? '' : '<div class="neInputsearch__zero">' + noDataText + '</div>'
            ),
            ( btDirection.toLocaleLowerCase().indexOf('top') >= 0 ? '' : btnHtml )
        ].join('\r\n');

        // 拼接节点
        // 1.输入框父节点处理
        var faCell = valCell.parentNode; //父节点
        faCell.style.position = 'relative';
        // 宽、高等距离
        var valWidth = valCell.offsetWidth,
            valHeight = valCell.offsetHeight,
            faHeight = faCell.offsetHeight,
            faWidth = faCell.offsetWidth;
        var selfH = valCell.offsetHeight, // 元素自自高
            selfW = valCell.offsetWidth;
        var top = faHeight + 2,
            left = 0;
        // console.log('top：', top)
        // console.log('width:', width, '\valWidth:', valWidth)
        // 2.控件处理
        me.removeControl(); // 先移除控件
        // 3.拼接处理
        var _eClassNameStr = opts.className.replace(/([ ]+)/g, '') === '' ? '' : ' ' + opts.className;
        var nodeDiv = document.createElement('div');
        nodeDiv.className = net.idClass + ' ne_input_search_' + tools.generateRandomChar() + _eClassNameStr;
        opts.id === 'default' ||  opts.id.replace(/([ ]+)/g, '') === '' ? '' : nodeDiv.id = opts.id;
        width == 'auto' ? nodeDiv.style.width = valWidth + 'px' : nodeDiv.style.width = width + 'px';
        nodeDiv.innerHTML = allHtml;
        nodeDiv.style.position = 'absolute';
        nodeDiv.style.zIndex = zIndex;
        if(opts.position == 'fixed'){
            left = tools.getLeft(valCell); //valCell.offsetLeft;
            top = tools.getTop(valCell); //valCell.offsetTop;
            // console.log('left：', left, '\ntop：', top, '\nselfH：', selfH);
            nodeDiv.style.top = (top + selfH + 1) + 'px';
            nodeDiv.style.left = left + 'px';
            tools.insertAfter(nodeDiv, document.getElementsByTagName('body')[0]); // 在后面插入节点
        }else{
            nodeDiv.style.top = top + 'px';
            tools.insertAfter(nodeDiv, valCell); // valCell.after(nodeDiv); 在后面插入节点
        }
        
        // 当控件下边缘已到达网页底部且视觉上被遮挡住时 add 20211104
        var nodeH = parseFloat(window.getComputedStyle(nodeDiv).height.toString().replace(/px/g, '')), // 元素高
            winH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight, // 视窗高，浏览器网页可视区域高
            scrollH = document.documentElement.scrollHeight || document.body.scrollHeight, // 网页卷起来的高，网页文档高
            scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0; // 浏览器滚动条滚动的距离
            offsetTop = tools.getTop(nodeDiv); // 元素上边距离距离视窗的偏移量
        var distanceTop = offsetTop - scrollTop; // 元素距离视窗顶部的距离 = 元素上边距离距离视窗的偏移量 - 浏览器滚动条滚动的距离
        // console.log('元素高：', nodeH);
        // console.log('视窗高：', winH);
        // console.log('网页卷起来的高：', scrollH);
        // console.log('浏览器滚动条滚动的距离：', scrollTop);
        // console.log('元素上边距离距离视窗的偏移量：', offsetTop);
        // console.log('元素距离视窗顶部的距离：', distanceTop);
        // var formula1 = nodeH + ' + ' + distanceTop + ' = ' + (distanceTop + nodeH) + ' >= ' + winH + ' ?';
        // console.log('①元素下边会被视窗挡住的条件为：元素高 + 元素距离视窗顶部的距离 >= 视窗高')
        // console.log('即公式：', formula1);
        // var formula2 = winH + ' + ' + scrollTop + ' = ' + (winH + scrollTop) + ' >= ' + scrollH + ' ?';
        // console.log('②滚动条滚动到底部的条件：视窗高 + 浏览器滚动条滚动的距离 >= 网页卷起来的高');
        // console.log('即公式：', formula2);
        // console.log('--------------------------');
        if(nodeH + distanceTop >= winH){
            // console.log('高度大于了，元素被遮挡了，部分看不见了');
            window.scrollTo({
                top: scrollH,
                left: 0,
                behavior: 'instant'
            })
        }  
        
        

        // 全局赋值
        me.$root = document.getElementsByClassName(net.idClass)[0]; // 根节点
        me.$ul = typeof document.getElementsByClassName('neInputsearch__pane')[0] == 'undefined' ? 
                null 
                : 
                document.getElementsByClassName('neInputsearch__pane')[0].children[0]; // ul列表节点
        me.$noneData = typeof document.getElementsByClassName('neInputsearch__zero')[0] == 'undefined' ? 
                    null
                    :
                    document.getElementsByClassName('neInputsearch__zero')[0]; // 无数据时的节点
        me.$close = document.getElementsByClassName('neInputsearch__btn')[0]; // 关闭按钮节点
        if(typeof me.$oldId == 'undefined'){ // 第1次时才赋值
            me.$oldId = valCell.getAttribute('data-bh') == null ? '' : valCell.getAttribute('data-bh'); // 旧的隐藏值
        }

        // 下拉项定位
        me.scrollItemIntoView(); // 滚动到指定下拉项

        // 取旧的显示值
        var old_value = valCell.getAttribute('data-old-value'); // 取data-旧的显示值
        if(old_value == null){ // 第1次时才赋值
            var now_value = tools.getElementValue(valCell)
            // console.log('now_value', now_value)
            me.$oldValue = now_value; // 全局赋值
        }else{
            me.$oldValue = old_value; // 全局赋值
        }
    

        // 触发事件 
        if(me.$ul != null) me.chooseItem(valCell); // 选中下拉项事件
        if(me.$noneData != null) me.nodata(); // 选中无数据时的项
        me.chooseButton(valCell); // 点击关闭按钮关闭控件
        document.onclick = function(event){ // 点击页面其它地方关闭控件
            var target = event.target || event.srcElement;
            var closest1 = target.closest('.' + net.idClass); // 控件节点 
            var closest2 = target.closest(me.$elem); // 输入框元素节点
            // edit 20211113-1
            // if( (closest1 == null && closest2 == null) || (!closest1 && !closest2)){
            //     me.removeControl();
            // }
            var isCanClose = true; // 是否能关闭控件
            if(target == closest1 || target == closest2) isCanClose = false;
            for(var i = 0; i < me.$opts.besidesClose.length; i++){
                // if(target == target.closest(me.$opts.besidesClose[i])){
                //     isCanClose = false;
                //     break;
                // }
                var one = me.$opts.besidesClose[i];
                var _nowSelector = one instanceof jQuery == false ?
                        (
                            !tools.isDomObject(one) ? one : 
                            ( one.getAttribute('id') != null ? '#' + one.getAttribute('id') : tools.getStringClassName(one.getAttribute('class')) )
                        )
                        :
                        ( one[0].getAttribute('id') != null ? '#' + one[0].getAttribute('id') : tools.getStringClassName(one[0].getAttribute('class')) )
                if(target == target.closest(_nowSelector)){
                    isCanClose = false;
                    break;
                }   
            }
            if(isCanClose){
                me.removeControl();   
            }
        }
    },


    /**
     * 滚动到当前高亮的下拉项
     */
    inputDrop.prototype.scrollItemIntoView = function(){
        var me = this;
        if(me.$ul == null) return;
        var realHeight = 0, // 实际高
        limitHeight = me.$ul.parentNode.offsetHeight; // 限制高
        var child = me.$ul.children;
        var currentItem = null;
        for(var i = 0; i < child.length; i++){
            var lis = child[i];
            realHeight += lis.offsetHeight;
            if(lis.getAttribute('class') != null && lis.getAttribute('class').indexOf('on') >= 0){
                currentItem = lis;
            }
        }
        /**
         *  scrollIntoView参数：
            behavior 定义动画过渡效果(可选)。值："auto"或 "smooth" 之一。默认为 "auto"。
            block 定义垂直方向的对齐(可选)。值："start", "center", "end", 或 "nearest"之一。默认为 "start"。
            inline 定义水平方向的对齐(可选)。值："start", "center", "end", 或 "nearest"之一。默认为 "nearest"。
         */
        if(currentItem != null && realHeight > limitHeight) {
            currentItem.scrollIntoView({behavior: "auto", block: "center", inline: "nearest"});
        }

    },



    /**
     * 选择某一项、选中下拉项
     * @param {HTML DOM} ps_element 当前输入框元素DOM对象
     */
    inputDrop.prototype.chooseItem = function(ps_element){
        var me = this;
        if(me.$ul == null) return;
        var child = me.$ul.children;
        for(var i = 0; i < child.length; i++){
            var lis = child[i];
            var bh = tools.getDataset(lis).bh, // lis.dataset.bh,
                value = lis.innerText; 
            if(me.$opts.explained){ // 过滤下拉项中的说明性文字
                var tempStr = lis.innerHTML.toString().replace(/<[^<>]+?>/g, '`'); // 说明性文字(过滤html标签)
                tempStr = tempStr.replace(/(\`+)/g, '`');
                var newSmZi = tempStr.replace(/(.*)`(.*)`$/g, '$2');
                if(newSmZi == value) newSmZi = ''; 
                value = value.replace(newSmZi, '');
            }
            if(child.length == 1 && fnGetIsOneFill(me)){ // 只有一个下拉项时
                fnFillValue2Box(me, ps_element, bh, value);
            }
            // console.log('隐藏值：', bh, ' - 显示值：', value);
            (function(hid, val){ // 使用闭包才能正确传值。hid 隐藏值, val 显示值
                lis.onclick = function(){
                    fnFillValue2Box(me, ps_element, hid, val);
                }
            })(bh, value)
        }
    };



    /**
     * 点击关闭按钮
     * @param {HTML DOM} ps_element 当前输入框元素DOM对象
     */
    inputDrop.prototype.chooseButton = function(ps_element){
        var me = this;
        var btn = document.getElementsByClassName('neInputsearch__btn')[0];
        if(typeof btn == 'undefined') return;
        btn.onclick = function(){
            if(me.$opts.onClose) // 关闭后的回调
                me.$opts.onClose({dom: ps_element, id: me.$oldId, value: me.$oldValue});
            if(me.$root){
                tools.removeNode(me.$root); // 关闭控件
            }
        }
    };


    
    /**
     * 选中无数据时的项
     */
    inputDrop.prototype.nodata = function(){
        var me = this;
        document.getElementsByClassName('neInputsearch__zero')[0].onclick = function(){
            if(me.$root){
                tools.removeNode(me.$root); // 关闭控件
            }
        }
    };




    /**
     * 移除控件
     */
    inputDrop.prototype.removeControl = function(){
        var div = document.getElementsByClassName(net.idClass);
        if(div.length != 0 ){
            tools.removeNode(div[0]); // 关闭控件
        }
    };

    


    //================================================================
    //                         · 自定义函数
    //================================================================
    /**
     * 把值填充到输入框元素中
     * @param {object} ps_this 控件参数对象
     * @param {HTML DOM} ps_element 输入框元素DOM对象
     * @param {string} ps_bh 隐藏的值
     * @param {string} ps_val 显示的值
     */
    function fnFillValue2Box(ps_this, ps_element, ps_bh, ps_val){
        var me = ps_this;
        if(me.$opts.autoFill.selectedFill || (me.$ul.children.length == 1 && fnGetIsOneFill(me))){
            ps_element.setAttribute('data-bh', ps_bh); // 给当前元素赋隐藏值
            tools.giveValueToElement(ps_element, ps_val); // 给当前元素赋显示值
        }
        if(me.$opts.onConfirm)  // 选择某一项后回调
            me.$opts.onConfirm({dom: ps_element, id: ps_bh, value: ps_val, oldId: me.$oldId, oldValue: me.$oldValue});
        if(me.$root){
            tools.removeNode(me.$root); // 关闭控件
        }
        
        // 全局赋值 (旧的隐藏值、显示值再次赋值)
        ps_element.setAttribute('data-old-value', ps_val); // 设置data-旧的显示值
        me.$oldId = ps_bh;
        me.$oldValue = ps_val;
    };

    /**
     * 获取只有一个下拉项时是否自动填充输入框元素
     * @param {object} ps_this 控件参数对象
     * @returns {boolean} 返回布氽值true或false
     */
    function fnGetIsOneFill(ps_this){
        var me = ps_this;
        return me.$opts.autoFill.oneItemFill == 'auto' ? ( tools.isAppDevice() ? false : true ) : me.$opts.autoFill.oneItemFill;
    };


    /**
     * 递归深度合并 JSON对象
     * 合并结果：不返还新Object，而是target改变
     * 注：遇到相同元素级属性，以defs为准。
     * @param {object} defs 第1个被合并的对象
     * @param {object} target  第2个被合并的对象
     * @returns {object} 返回目标对象target，所有被合并的对象的成员属性将被附加到该对象上。
     */
    function fnExtendObject(defs, target){
        var target = { }
        var mergeObj = function(defs, target) {
            for(var key in defs) {
                if(target[key] === undefined) { // 不冲突的，直接赋值 
                    target[key] = defs[key];
                    continue;
                }
                // 冲突了，如果是Object，看看有么有不冲突的属性
                // 不是Object 则以（minor）为准为主，
                // console.log(key)
                if(tools.isJsonObject(defs[key]) || tools.isArray(defs[key])) { // arguments.callee 递归调用，并且与函数名解耦 
                    // console.log("is json")
                    //arguments.callee(minor[key], main[key]);
                    mergeObj(defs[key], target[key]);
                }else{
                    target[key] = defs[key];
                }
            }
        }
        mergeObj(defs, target);
        return target;
    };



    //================================================================
    //                          · 工具库类
    //================================================================
    /**
     * 工具库类
     */
    var tools = {
        
        /**
         * 判断是否数组
         * @param {string | array} ps_str 字符串或数组
         * @returns 返回布尔值. true 是数组, false 非数组
         */
        isArray: function(ps_str){
            return Object.prototype.toString.call(ps_str) === "[object Array]";
        },


        /**
         * 让IE<=8浏览器兼容addEventListener
         * 默认的ie8\ie7\ie6等低版本ie浏览器不支持js的addEventListener方法,只支持attachEvent方法,故需定个兼容函数
         * @param {object} ele 绑定的元素
         * @param {string} event 事件
         * @param {function} fn 函数体
         * eg.
            var usernameDom = document.getElementById('#username');
            if(usernameDom == null) return;
            //兼容ie8-的写法
            this.addEventListener(usernameDom,'paste',function(e){})
            //不兼容ie8-的原生js
            usernameDom.addEventListener('paste', function (e){})
        */
        addEventListener:function(ele,event,fn){
            if(ele.addEventListener){
                ele.addEventListener(event,fn,false);
            }else{
                ele.attachEvent('on'+event,fn.bind(ele)); //js原生bind()函数也有兼容问题,故也需写个兼容函数
            }
        },

        /**
         * 在已存在的节点向后面插入新节点 (兼容ie9-)
         * @param {HTML DOM} newNode 新节点
         * @param {HTML DOM} existingNode 已存在的节点
         */
        insertAfter: function(newNode, existingNode) {
            var parent = existingNode.parentNode;
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

        /**
         * 移除指定节点 (兼容ie11-)
         * @param {HTML DOM} node 要移除的节点
         */
        removeNode: function(node){
            // node.remove();
            node.parentNode.removeChild(node);
        },


        /**
         * 给输入框赋值
         * @param {HTMl DOM} ps_dom DOM节点
         * @param {string} ps_val 要赋的值
         */
         giveValueToElement: function(ps_dom, ps_val){
            var tagname = ps_dom.tagName.toLocaleLowerCase();
            if(tagname == 'input' || tagname == 'textarea') ps_dom.value = ps_val;
            else ps_dom.innerText = ps_val;
        },

        /**
         * 获取输入框的值
         * @param {HTMl DOM} ps_dom DOM节点
         * @returns 返回DOM节点的值
         */
        getElementValue: function(ps_dom){
            var tagname = ps_dom.tagName.toLocaleLowerCase();
            if(tagname == 'input' || tagname == 'textarea') return ps_dom.value;
            else return ps_dom.innerText;
        },

        /**
         * 获取字符串对应的元素节点(供jq调用)
         * eg1. 'floor' <=> '.floor'
         * eg2. 'floor build' <=> '.floor.build'
         * @param {string} ps_str 字符串
         * @returns 返回元素节点字符串
         */
        getStringClassName: function(ps_str){
            if(ps_str.replace(/([ ]+)/g, '') === '') return '';
            var arr = ps_str.replace(/([ ]+)/g, ' ').split(' ');
            var str = '';
            for(var i = 0; i < arr.length; i++){
                str += '.' + arr[i];
            }
            return str;
        },


        /**
         * 获取元素节点对应的字符串(供dom调用)
         * eg1. '.floor' <=> 'floor'
         * eg2. '.floor.build' <=> 'floor build'
         * @param {string} ps_str 元素节点字符串
         * @returns 返回字符串
         */
        getClassNameString: function(ps_str){
            if(ps_str.replace(/([ ]+)/g, '') === '') return '';
            var tmpStr = ps_str.toString().replace(/([\.]+)/g, ' ');
            return ps_str.indexOf('.') == 0 ? (tmpStr.substr(1, tmpStr.length)) : tmpStr;
        },
        
        /**
         * 返回节点对应的DOM
         * eg. '#floor'  <=> document.getElementById('floor')
         * eg2. '.floor' <=> document.getElementsByClassName('floor');
         * @param {string} ps_str 节点字符串
         * @returns 返回HTML DOM
         */
        getIdClassNameStrDom: function(ps_str){
            return ps_str.indexOf('#') >= 0 ? 
                document.getElementById(ps_str.toString().replace(/([\#\.]+)/g, ''))
                :
                document.getElementsByClassName(this.getClassNameString(ps_str));
        },


         /**
         * 原生js获取元素style属性
         * [用途]：原生js获取元素margin外边距、内边距padding
         * [注意]：返回值中的各个属性值带单位px
         * 兼容性：兼容IE、火狐、谷歌
         * @param {HTML DOM} o DOM元素. 
         * @returns {object} 返回元素的各种css属性组成的数组。
         * [示例]
            var div = document.getElementById("user");
            var style = getStyle(div);
            alert(style.marginTop);
        */
        getStyle: function(o){
            //  兼容IE和火狐谷歌等的写法
            if (window.getComputedStyle) {
                var style = getComputedStyle(o, null);
            } else {
                style = o.currentStyle; // 兼容IE
            }
            return style;
        },


        /**
         * 获取元素到浏览器顶部的距离，即offsetTop
         * 注：不能直接使用obj.offsetTop，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
         * @param {HTML DOM} o dom元素
         * @returns {number} 返回距离值
         */
         getTop: function(o) {
            var actualTop = o.offsetTop;
            var current = o.offsetParent;
            while (current !== null) {
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }
            // 当HTML节点有设置margin值时
            var docStyle = this.getStyle(document.documentElement), // HTML节点
                docMarTop = Math.ceil(docStyle.marginTop.toString().replace(/([\px]+)/g, ''));
            actualTop += docMarTop;
            return actualTop;
        },    

         /**
         * 获取元素到浏览器左侧的距离，即offsetLeft
         * 注：不能直接使用obj.offsetLeft，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
         * @param {HTML DOM} element dom元素
         * @returns {number} 返回距离值
         */
        getLeft: function(o) {
            var actualLeft = o.offsetLeft;
            var current = o.offsetParent;
            while (current !== null) {
              actualLeft += current.offsetLeft;
              current = current.offsetParent;
            }
            // 当HTML节点宽度不是100%时
            var winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var docStyle = this.getStyle(document.documentElement), // HTML节点
                docW = parseFloat(docStyle.width.toString().replace(/([\px]+)/g, ''));
            actualLeft += ( window.innerWidth == docW || document.documentElement.clientWidth == docW || document.body.clientWidth == docW ) ? 0 : Math.ceil( (winW - docW) / 2 );
            return actualLeft;
        },

        /**
         * 生成N位随机数(字母+数字组成)
         * @returns {string} 返回字符串
        */
        generateRandomChar: function(){
            var str = Math.random().toString(36).substr(2);
            return str;
        },

        /**
         * 原生JS获取dataset的值(兼容ie11-)
         * 示例：要取某个data-*(比如data-bh)的值 <=> getDataset(DOM元素).bh
         * @param {HTML DOM} ele DOM元素
         * @returns 返回dataset集合.
         */
        getDataset: function(ele){
            if(ele.dataset){
                return ele.dataset;
            }else{
                var attrs = ele.attributes,//元素的属性集合
                    dataset = {},
                    name,
                    matchStr;
                for(var i = 0;i<attrs.length;i++){
                    //是否是data- 开头
                    matchStr = attrs[i].name.match(/^data-(.+)/);
                    if(matchStr){
                        //data-auto-play 转成驼峰写法 autoPlay
                        name = matchStr[1].replace(/-([\da-z])/gi,function(all,letter){
                            return letter.toUpperCase();
                        });
                        dataset[name] = attrs[i].value;
                    }
                }
                return dataset;
            }
        },

        /**
         * 检测是否移动端，判断是否手机端设备
         * @returns {boolean} 返回布尔值. true 是, false 否
         */
        isAppDevice:function(){
            var userAgentInfo = navigator.userAgent.toLowerCase();
            //console.log(userAgentInfo);
            var Agents = ["mobile","android","iphone","sysbian","windows phone","iPad","ipod","blackberry"];
            var flag = false;
            for(var i=0; i<Agents.length; i++){
                if(userAgentInfo.indexOf(Agents[i])>=0){
                    flag = true;
                    break;
                }
            }
            return flag;
        },

         /**
         * 判断对象是否JSON对象
         * @param {object} ps_obj 目标对象
         * @returns 返回布尔值. true 是, false 否
         */
        isJsonObject: function(ps_obj){
            return typeof(ps_obj) == "object" && Object.prototype.toString.call(ps_obj).toLowerCase() == "[object object]" && !ps_obj.length;
        },


        /**
         * 判断是否dom对象
         * 首先要对HTMLElement进行类型检查，因为即使在支持HTMLElement的浏览器中，类型却是有差别的，在Chrome,Opera中HTMLElement的类型为function，此时就不能用它来判断了
         * @param {object} ps_obj 目标对象
         * @returns {boolean} 返回布尔值. true 是, false 否
         */
        isDomObject: function(ps_obj){
            return ( typeof HTMLElement === 'object' ) ?
                ps_obj instanceof HTMLElement
                :
                ps_obj && typeof ps_obj === 'object' && ps_obj.nodeType === 1 && typeof ps_obj.nodeName === 'string';
        },

        /**
         * 递归深度合并JSON对象
         * 合并结果：不返还新Object，而是target改变
         * 注：遇到相同元素级属性，以defs为准。
         * @param {object} defs 第1个被合并的对象
         * @param {object} tart  第2个被合并的对象
         * @returns {object} 返回目标对象target，所有被合并的对象的成员属性将被附加到该对象上。
         */
        mergeJsonObject: function(defs, tart){
            var tart = { }
            var loopMerged = function(defs, tart) {
                for(var key in defs) {
                    if(tart[key] === undefined) { // 不冲突的，直接赋值 
                        tart[key] = defs[key];
                        continue;
                    }
                    // 冲突了，如果是Object，看看有么有不冲突的属性
                    // 不是Object 则以（minor）为准为主，
                    // console.log(key)
                    if(this.isJsonObject(defs[key]) || this.isArray(defs[key])) { // arguments.callee 递归调用，并且与函数名解耦 
                        // console.log("is json")
                        //arguments.callee(minor[key], main[key]);
                        loopMerged(defs[key], tart[key]);
                    }else{
                        tart[key] = defs[key];
                    }
                }
            }
            loopMerged(defs, tart);
            return tart;
        },


        /**
         * 弹出提示信息对话框
         * @param {string} ps_str 提示信息字符串
         */
         dialogs:function(ps_str){
            var message = ps_str;
            if(typeof neuiDialog != 'undefined'){
                neuiDialog.alert({
                    caption: '提示',
                    message: message,
                    buttons: ['确定']
                })
            }else{
                message = message.toString().replace(/\<br\>/g, '\n'); //<br>换行\n以实现换行
                alert(message);
            }
        }
    };




    //================================================================
    //                      · ie兼容
    //================================================================
     /**
     * ie9-兼容原生js bind
     * 因为js addEventListener为兼容ie8-,会重写addEventListener，但重写的函数会使用到原生的js bind函数
     */
    if(!Function.prototype.bind){
        Function.prototype.bind = function(){
            if(typeof this !== 'function'){
                throw new TypeError('Function.prototype.bind - what is trying to be bounded is not callable');
            }
            var _this = this;
            var obj = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            return function(){
                _this.apply(obj, args);
            }
        }
    };

    /**
     * ie9-兼容document.getElementsByClassName
     */
     if (!document.getElementsByClassName) {
        document.getElementsByClassName = function (className, element) {
            var children = (element || document).getElementsByTagName('*');
            var elements = new Array();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var classNames = child.className.split(' ');
                for (var j = 0; j < classNames.length; j++) {
                    if (classNames[j] == className) {
                        elements.push(child);
                        break;
                    }
                }
            }
            return elements;
        };
    };


    /**
     * ie9-兼容forEach
     */
    if(!Array.prototype.forEach){
        Array.prototype.forEach = function(callback){
            for (var i = 0; i < this.length; i++){
                callback.apply(this, [this[i], i, this]);
            }
        }
    };


    /**
     * ie11- 兼容matches
     */
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
    };

    /**
     * ie11- 兼容closest方法（用于查找父元素）
     */
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;

            do {
                if (Element.prototype.matches.call(el, s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    };

    /**
     * ie11-兼容Array.from
     */
    if (!Array.from) {
        Array.from = (function () {
            var toStr = Object.prototype.toString;
            var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
            };
            var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
            };
            var maxSafeInteger = Math.pow(2, 53) - 1;
            var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
            };
            // The length property of the from method is 1.
            return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;
            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);
            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined");
            }  
            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                throw new TypeError('Array.from: when provided, the second argument must be a function');
                }
                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                T = arguments[2];
                }
            }
            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);
            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
            };
        }());
    };

    

    //================================================================
    //                  · 返回对象供前台调用
    //================================================================
    return neuiInputsearch;
    
});
