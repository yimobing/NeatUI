/**
 * [NeConfiguration]
 * 楼盘房号数据配置控件
 * Version：1.0.0
 * compatible：ie8 and ie8+
 * Website: https://github.com/yimobing/neatui
 * Author: ChenMufeng
 * Date: 2021.08.02
 * Update: 2021.08.02
 */

;(function(root, factory){
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.NeConfiguration = factory();
    }
})(this, function(){
    var net = { };
    //================================================================
    var NeConfiguration = function(){
        var me = this;

        /**
         * ********************************
         *          楼盘房号数据配置
         * ********************************
            [字段说明]
            val 表示显示值(要显示在界面上)，
            hid 表示隐藏值(无须显示在界面上,只需隐藏起来,后续操作能取到值即可)
            [字段名称]
            val1    显示值1：字段名称(中文)、显示名称
            val2    显示值2：字段值(即字段名称对应的值)、显示值(输入框值)
            val3    显示值3：右边文字，一般是单位。eg. 平方米,元,万元,元/平方米
            val4    显示值4：提示文字，一般用于必填时若为空就提示某些信息(输入框占位符placeholder)
            hid1    隐藏值1：控件类型。值：空, 无, 楼盘, 幢号, 楼层, 房号, 建筑面积, 储藏间面积, 产权年限
            hid2    隐藏值2：控件属性。值：空, 无, 日期, 数字, 单选, 下拉
                            hid1=""时，hid2的值：空
                            hid1="无"时，hid2的值：空, 无, 日期, 数字, 单选, 下拉
                            hid1!="" && hid!="无"时，hid2的值：空(一般为空,也可能为其它值)
            hid3    隐藏值3：控件属性标识。值：空, 非空。当为普通下拉类型(hid2="下拉")时，需要根据hid3获取下拉数据。
            hid4    隐藏值4：是否多行。值：1 多行(input), 0 单行(textarea)
            hid5    隐藏值5：是否必填。值：1 是, 0 否
            hid6    隐藏值6：字段名称(英文)
            [要点说明]
            选择房号后建筑面积值要(根据后台返回的值)自动填充；
            隐藏值1为“无”时，才须判断隐藏值2；
            隐藏值1为“建筑面积”、“储藏间面积”时，直接采用数字类型(只能输入数字和小数点)；
            隐藏值1为“产权年限”时，直接采用下拉类型；
            隐藏值1为空时，(根据隐藏值4)直接采集单行或多行类型；
            隐藏值2为空或“无”时，(根据隐藏值4)直接采集单行或多行类型；
            保存时，要取到显示值2、隐藏值5、隐藏值6；
        */

        /**
         * 生成楼盘房号数据配置表单
         * @param {HTML DOM} elem 绑定的dom节点
         * @param {object} opts 参数对象 
         * @returns 返回
         */
        me.houses = function(element, options){
            var defaults = {
                source: {}, // 数据源
                layout: { // 布局(可选)
                    theme: "popular", // 主题(可选)。值： popular 现代流行风(默认), normal 普通经典风
                    inputIcon: false, // 输入框是否使用图标(可选), 默认false
                    inputCross: true, // 输入框右侧是否有打叉图标(可选), 默认true
                    inputMust: true, // 输入框不能为空时右侧是否显示星号(可选), 默认true
                    houseRightButton: false // 是否楼盘名称右侧显示查询按钮(可选), 默认false
                },
                controls: { // 控件调用(可选)
                    calendar: {  // 日历控件(可选)
                        enable: true, // 是否启用(可选)，默认true
                        empty: true, // 初始时日期是否为空(可选)。值：true 是(默认), false 否(当天日期)。
                        theme: "blue", // 主题(可选)，值：green 绿色, blue 蓝色(默认)
                        format: "YYYY-MM-DD", // 日期格式(可选)。值: "YYYY-MM-DD" 年-月-日(默认), "YYYY-MM-DD hh:mm:ss" 年-月-日 时:分:秒, "YYYY-MM-DD hh:mm" 年-月-日 时:分
                        minDate: "1840-01-01", // 最小日期(可选)。格式须与format一样，否则会出错。 eg1. 2018-09-30  eg2. 2018-09-30 00:00:00
                        maxDate: "2200-12-31", // 最大日期(可选)。格式须与format一样式，否则会出错。eg1. 2200-12-31  eg2. 2200-12-31 23:59:59
                        callBack: null // 回调(可选)
                    },
                    keyboard: { // 数字键盘控件(可选)
                        enable: false // 是否启用(可选)，默认false
                    }
                }
            }
            var selector = element.indexOf('#') >= 0 ? element.replace(/([\#]+)/g, '') :  ( element.indexOf('.') >= 0 ? tools.getClassNameString(element) : element.replace(/([\#\.]+)/g, '') );
            // --------全局赋值--------
            me.$opts = net.extend(true, {}, defaults, options || {}); // 控件参数
            me.$selector = selector;  // 节点ID或CLass属性值(不含选择器符号井号#或点号.). eg. 'floor'
            me.$elem = element; // 节点ID或Class属性值(含选择器符号井号#或点号.). eg.'#floor', '.floor'
            me.$obj = document.getElementById(selector) == null ? document.getElementsByClassName(selector)[0] : document.getElementById(selector); // 元素dom对象
            // console.log('生成房号配置数据\nelem：', me.$elem, '\noptions：',me.$opts);

            me.$obj.className += 'neConfigurate ne-form';
            me.$obj.className += me.$opts.layout.theme != 'popular' ? '' : ' theme-popular';

            //
            var source = me.$opts.source;
            // ·--------校验数据格式--------
            if(!tools.isJsonObject(source)){
                alert('source参数不是JSON对象，请检查！');
                return;
            }
            if(typeof source.data === 'undefined'){
                alert('source参数不含data属性，请检查！');
                return;
            }
            // ·--------循环项--------
            for(var i = 0; i < source.data.length; i++){
                var items = source.data[i];
                var val1 = items.val1,
                    val2 = items.val2,
                    val3 = items.val3,
                    val4 = items.val4,
                    hid1 = items.hid1,
                    hid2 = items.hid2,
                    hid3 = items.hid3,
                    hid4 = items.hid4,
                    hid5 = items.hid5,
                    hid6 = items.hid6;
                var _hid1 = ' data-hid1="' + hid1 + '"', 
                    _hid3 = ' data-hid3="' + hid3 + '"', 
                    _hid5 = ' data-hid5="' + hid5 + '"', 
                    _hid6 = ' data-hid6="' + hid6 + '"';
                var _placeholder = ' placeholder="' + val4 + '"',
                    _onblur = ' onblur="this.placeholder=\'' + val4 + '\'"';
                var	_LHtml = '', // 左边内容
                    _UHtml = '', // 单位等内容
                    _RHtml = ''; // 右边内容
                var _mustHtml = hid5 != '1' ? '' : '<div class="item-cell" data-type="must">*</div>'; // 必填项星号*
                // 输入框
                var tagName = 'input', // 标签类型。值：input(默认), radio, textarea
                    types = 'text'; // type属性。值: text 文本(默认), number 数字, checkbox 复选(单选、多选)
                    ids = '', // ID属性
                    className = 'click-input', // class属性
                    readonly = false; // 输入框是否只读。 true 只读,不允许手动输入，false 可手动输入
                // 其它
                var  icons = '', // 输入框修饰图标
                    boxWidth = ''; // box宽度

                // 右边文字
                if (val3 != '') {
                    var _unitStyle = !me.$opts.layout.inputCross ? '' : ' has-cell-cross';
                    _UHtml = '<em class="r-unit' + _unitStyle + '">' + val3 + '</em>';
                }			

                // 隐藏值1是空时
                if (hid1 == '') {	
                    if (hid4.toString() == '1') { // 多行文本
                        tagName = 'textarea';
                        className += ' click-textarea';
                        icons = ' icon-textarea';
                    }else{ // 单行文本
                        className += ' click-single-input';
                        icons = ' icon-text';
                    }
                } else { // 隐藏值1是“无”时	
                    if (hid1 == '无') {
                        if (hid2 == '日期') { // 调用日期控件
                            className += ' click-date';
                            icons = ' icon-calendar';
                            me.$opts.controls.calendar.enable ? readonly = true : readonly = false;
                        }			
                        if (hid2 == '数字') { // 调用数字键盘
                            className += ' click-num';
                            icons = ' icon-numeric';
                            me.$opts.controls.keyboard.enable ? readonly = true : readonly = false;
                            // types = 'number'; // 只能输入数字(部分手机不支持)
                            if (val1.indexOf('面积') >= 0) icons = ' icon-metre';
                        }
                        if (hid2 == '单选') {
                            tagName = 'radio';
                            className += ' click-radio ne-switch';
                            types = 'checkbox';
                        }
                        if (hid2 == '下拉') {
                            className += ' click-dropdown';
                            icons = ' icon-drop';
                            readonly = true;
                        }
                        if (hid2 == '无' || hid2 == '') {
                            if (hid4.toString() == '1') { // 多行文本
                                tagName = 'textarea';
                                className += ' click-textarea';
                                icons = ' icon-textarea';
                            }else{ // 单行文本
                                className += ' click-single-input';
                                icons = ' icon-text';
                            }
                        }

                    } else { // 隐藏值1不是"无"

                        // 注：click-hand 表示可从下拉切换成手动输入，clear-relation 表示关联数据(楼盘值改变，关联的那几栏值要清空)
                        // 楼盘名称、幢号、楼层、房号是关联数据
                        // 所有通过下拉选择数据的元素都要加上class名称：click-hand

                        if(hid1 == '楼盘' || hid1 == '幢号' || hid1 == '楼层' || hid1 == '房号'){
                            className += ' clear-relation';
                            tagName =  hid4.toString() == '1' ? 'textarea' : 'input';
                            if(hid1 == '楼盘') {
                                className += ' click-search';
                                ids = 'house';
                                icons = ' icon-house';
                                boxWidth = '100%';
                                if(me.$opts.layout.houseRightButton)
                                    _RHtml = '<div class="item-cell"><button type="button" id="btn-query-house">查询</button></div>';
                            }else{
                                className += ' click-hand';
                                readonly = true;
                                if (hid1 == '幢号'){
                                    className += ' click-build';
                                    ids = 'build';
                                    icons = ' icon-build';
                                }
                                if (hid1 == '楼层'){
                                    className += ' click-floor';
                                    ids = 'floor';
                                    icons = ' icon-floor';
                                }
                                if (hid1 == '房号'){
                                    className += ' click-room';
                                    ids = 'room';
                                    icons = ' icon-room';
                                }
                            }
                        }

                        if (hid1 == '产权年限') {
                            className += ' click-hand click-property';
                            ids = 'property';
                            icons = ' icon-clock';
                            readonly = true;
                        }

                        if (hid1 == '建筑面积') { // 调用数字键盘
                            className += ' click-num click-jzmj';
                            ids = 'jzmj';
                            icons = ' icon-metre';
                            readonly = true;
                            // types = 'number'; // 只能输入数字(部分手机不支持)
                        }

                        if (hid1 == '储藏间面积') { // 调用数字键盘
                            className += ' click-num click-ccjmj';
                            ids = 'ccjmj';
                            icons = ' icon-metre';
                            readonly = true;
                            // types = 'number'; // 只能输入数字(部分手机不支持)
                        }
                    }
                }


                // 节点拼接
                var _idStr = ids == '' ? '' : ' id="' + ids + '"';
                var _hideStr = hid1 == '' ? '' : ' data-hide="' + hid1 + '"';
                var _readStr = readonly ? ' readonly="readonly"' : '';
                var _blur = readonly ? 'this.blur();' : '';
                var _onfocus = ' onfocus="this.placeholder=\'\';' + _blur + '"';
                
                if(tagName == 'input') { // input
                    _LHtml = '<input type="' + types + '"' + _idStr + ' class="' + className + '" value="' + val2 + '"' + _placeholder + _onfocus + _onblur + _hideStr + _hid1 + _hid3 + _hid5 + _hid6 + _readStr + '>';
                }else if(tagName == 'textarea'){ // textarea
                    _LHtml = '<textarea' + _idStr + ' class="' + className + '"' + _placeholder + _onfocus + _onblur + _hideStr + _hid1 + _hid3 + _hid5 + _hid6 + _readStr + '>' + val2 + '</textarea>';
                }else{ // radio单选开关
                    var _checkStr = '';
                    var value = 0;
                    if (val2.toString() === 'true' || val2.toString() == '1') {
                        _checkStr = ' checked="checked"';
                        value = 1;
                    }
                    _LHtml = '<input type="' + types + '"' + _idStr + ' class="' + className + '" value="' + value + '"' + _hideStr + _hid1 + _hid3 + _hid5 + _hid6 + _checkStr + '>';
                }
                

                var _crossStyle = me.$opts.layout.houseRightButton && _RHtml != '' ? ' has-cell-btn' : '';
                _RHtml += me.$opts.layout.inputCross && types == 'text' ? '<div class="item-cell' + _crossStyle + '" data-type="cross"></div>' : '';
                var _boxWClass = boxWidth == '' ? '' : (boxWidth == '100%' ? ' w-100' : '');
                var _iconStr = icons == '' || me.$opts.layout.inputIcon === false ? '' : '<i class="icon' + icons + '"></i>';
                var _outerHtml = [
                        '<div class="eform-row' +  _boxWClass + '">',
                            '<div class="item-l">',
                                ( me.$opts.layout.theme != 'popular' ? '' : _iconStr ),
                                '<label>' + val1 + '</label>',
                            '</div>',
                            '<div class="item-r">',
                            ( me.$opts.layout.theme == 'popular' ? '' : _iconStr ),
                            _LHtml,
                            _UHtml,
                            '</div>',
                        _RHtml,
                        ( !me.$opts.layout.inputMust ? '' : _mustHtml ),
                        '</div>'
                ].join('\r\n');
                tools.appendHTML(_outerHtml, me.$obj);
            } // END FOR

            // ·--------根据控件类型调用相应控件--------
            // 日期类型
            var dateNode = document.getElementsByClassName('click-date');
            if(me.$opts.controls.calendar.enable){
                // 调用日历控件
                Array.from(dateNode).forEach(function(el, i){
                    if(typeof neuiCalendar == 'object'){
                        if(typeof neuiCalendar.neDate === 'function'){
                            // console.log('el：', el);
                            neuiCalendar.neDate(el, {
                                empty: me.$opts.controls.calendar.empty,
                                theme: me.$opts.controls.calendar.theme,
                                format: me.$opts.controls.calendar.format,
                                minDate: me.$opts.controls.calendar.minDate,
                                maxDate: me.$opts.controls.calendar.maxDate
                            }, me.$opts.controls.calendar.callBack)
                        }
                    }
                })
            }

            // 数字类型
            var numeralNode = document.getElementsByClassName('click-num'); // 数字类型
            if(me.$opts.controls.keyboard.enable){
                // 调用数字键盘控件
                Array.from(numeralNode).forEach(function(el, i){
                    if(typeof el.neuiKeyboard === 'function'){
                        el.fadeIn(400).neuiKeyboard({
                            title:'数字键盘'
                            // mode: 'computer',
                            // size: 'normal' // 键盘尺寸,仅在mode='computer'时有效(可缺省). normal 正常(默认), small 小型, little 较小型, tiny 微型	
                            // hasPoint:false, // 是否有小数点(可缺省),默认true
                        })
                    }
                })
            }else{ 
                // 直接输入
                Array.from(numeralNode).forEach(function(el, i){
                    el.addEventListener('input', function(){
                        var value = this.value;
                        var reg = /[^\d\.]/g; // 只允许输入数字、小数点
                        value = value.toString().replace(reg,'');
                        value = tools.repeatedChar(value, '.'); // 只保留一个小数点
                        this.value = value;
                    })
                    el.addEventListener('blur', function(){
                        var value = this.value;
                        var reg = /^(.*?)\.$/;
                        if(reg.test(value)){ // 小数点后没有东西了
                            this.value = value.replace(/([\.]+)/g, ''); // 去掉小数点
                        }
                    })
                })
            }
            
            // ·--------操作事件--------
            // 单选开关
            /* var radioNode = document.getElementsByClassName('ne-switch');
            Array.from(radioNode).forEach(function(el, i){
                el.addEventListener('click', function(){
                    if(this.value == 1){
                        this.setAttribute('checked', false);
                        this.setAttribute('value', 0);
                    }else{
                        this.setAttribute('checked', true);
                        this.setAttribute('value', 1);
                    }
                })
            }) */
            
            // 打叉图标
            var crossNode = document.querySelectorAll('[data-type="cross"]');
            Array.from(crossNode).forEach(function(el, i){
                el.addEventListener('click', function(){
                    var siblingArr = [];
                    var brother = this.parentNode.children;
                    for(var i = 0, len = brother.length; i < len; i++){ // 获取兄弟节点
                        if(brother[i] != this) siblingArr.push(brother[i]);
                    }
                    Array.from(siblingArr).forEach(function(sib){ // 循环兄弟节点,查找到input,textarea元素并清空其值
                        var child = sib.children;
                        for(var i = 0, len = child.length; i < len; i++){
                            var tagname = child[i].tagName.toString().toLocaleLowerCase();                          
                            if(tagname == 'input' || tagname == 'textarea'){
                                child[i].value = '';
                            }
                        }
                    })
                })
            })
        };



        /**
         * 生成交易税费表单
         */
        me.taxes = function(){

        };



    };



    //================================================================
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
    net.extend = function(){
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



    //================================================================
    /**
     * 工具库
     */
    var tools = {
        /**
         * 判断是否JSON对象
         * @param {object} ps_obj 目标对象
         * @returns 返回布尔值. true 是, false 否
         */
        isJsonObject: function(ps_obj){
            return typeof(ps_obj) == "object" && Object.prototype.toString.call(ps_obj).toLowerCase() == "[object object]" && !ps_obj.length;
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
         * 原生js append字符串
         * 即：向已存在的节点对象后面追加HTML字符串
         * @param {string} str 字符串
         * @param {HTML DOM} el 已存在的节点对象
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
         * 原生js prepend字符串
         * 即：向已存在的节点对象前面追加HTML字符串
         * @param {string} str 字符串
         * @param {HTML DOM} el 已存在的节点对象
         */
        prependHTML: function(str, el) {
            var divTemp = document.createElement("div"), nodes = null
                , fragment = document.createDocumentFragment();
        
            divTemp.innerHTML = str;
            nodes = divTemp.childNodes;
            for (var i=0, length=nodes.length; i<length; i+=1) {
            fragment.appendChild(nodes[i].cloneNode(true));
            }
            // 插入到容器的前面 - 差异所在
            el.insertBefore(fragment, el.firstChild);
            // 内存回收？
            nodes = null;
            fragment = null;
        },

        /**
         * 原生js在已存在的节点向后面插入新节点(兼容ie9-)
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
         * 原生js移除指定节点(兼容ie11-)
         * @param {HTML DOM} node 要移除的节点
         */
        removeNode: function(node){
            // node.remove();
            node.parentNode.removeChild(node);
        },

        /**
         * 过滤字符串中相同的字符
         * 即字符串中相同的字符只保留第一个
         * @param {string} ps_str 原字符中
         * @param {string} ps_char 指定要过滤的字符(可选). 若缺省则默认替换所有相同的字符
         * @returns {string} 返回新字符串
         * eg.
            repeatedChar('0.56.578.59', '.'); //0.5657859
            repeatedChar('0.56.578.59'); //0.56789
        */
        repeatedChar: function(ps_str, ps_char){
            var char = typeof ps_char == 'undefined' ? '' : ps_char;
            var result = ps_str.replace(/./g, function(s, index){
                return ps_str.indexOf(s) == index ? s : ( char == '' ? '' : (char == s ? '' : s) );
            })
            return result;
        }

    };
    




    //================================================================
    //                  ie兼容
    //================================================================
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


    

    //================================================================
    return NeConfiguration; // 返回对象


});