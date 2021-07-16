/**
* [neuiInputsearch]
* 输入下拉控件 
* 版本 v2.0
* Website: https://github.com/yimobing/neatui
* Author: chenMufeng
* Date: 2021.07.01
* Update: 2021.07.01
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

    var doc = document, win = window;
    var net = {};

    //================================================================
    // 两种调用方式：
    // 1.外部方式调用： XX(elem, options);
    // 2.内部方式调用： $('#elem').on('input', function() { XX(options, $('#elem')); })
    var neuiInputsearch = function(elem, options){
        var obj = tools.isJsonObject(options) ? 
        typeof elem === 'string' ? tools.getIdClassNameStrDom(elem): (elem instanceof jQuery ? elem : null)
        : 
        options; 
        obj = obj instanceof jQuery ? obj[0] : obj; // 输入框元素DOM对象
        var caller = tools.isJsonObject(options) ? "OUTER" : "INNER"; // 调用方式
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
    // 用一个或多个对象来扩展一个对象，返回被拓展的对象
    neuiInputsearch.extend = net.extend = function(){
        var options, name, src, copy,deep = false, target = arguments[0], i = 1, length = arguments.length;
        if (typeof (target) === "boolean") deep = target, target = arguments[1] || {}, i = 2;
        if (typeof (target) !== "object" && typeof (target) !== "function") target = {};
        if (length === i) target = this, --i;
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name], copy = options[name];
                    if (target === copy) continue;
                    if (copy !== undefined) target[name] = copy;
                }
            }
        }
        return target;
    };

    // 自定义控件参数(仅限控件内部使用)
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
            format: [ ], // 自定义数据源字段(可选)，默认空数组。
            // 定位    
            position: "relative", // 定位方式(可选)，默认relative。值：relative 相对定位(即相对元素定位), absolute 绝对定位(即相对浏览器窗口定位)，fixed 绝对定位。
            zIndex: 1, // 自定义控件层级(可选)，默认1。
            width: "auto", // 宽度(可选)，默认auto根据元素自动调整。
            height: 200, // 高度(可选)，默认200。
            animate: false, // 是否启用动画效果(可选), 默认false

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
                oneItemFill: "auto", // 只有一个下拉项时是否自动填充(可选)，默认auto。值：auto 根据设备自动判断(移动端false，pc端true), true 自动填充, false 手动点下拉项填充。
            },
            noData: { // 无数据时(可选)。
                enable: true, // 无数据时是否显示“无数据”下拉项(可选)，默认true。
                label: "无数据" // 自定义无数据时显示的下拉项值(可选)，默认无数据。
            },

            // 按钮
            closeButton: { // 关闭按钮(可选)。
                enable: true, // 是否显示关闭按钮(可选)，默认true
                theme: "text", // 关闭按钮样式(可选)。值：text 文字按钮(默认), image 图标按钮
                direction: "default" // 关闭按钮位置(可选)。值： default 底部居中(默认), topCenter 顶部居中, leftTop 左上角, rightTop 右上角, leftBottom 左下角, rightBottom 右下角。
            },

            // 回调
            onConfirm: function(e){ // 选择某一项后的回调(可选)。
            },
            onClose: function(e){ // 关闭后的回调(可选)。
            }
        }

        // 全局赋值
        this.$method = method; // 调用方式。 值： "OUTER" 内部调用,  "INNER" 外部调用
        this.$elem = elem; // 入框元素节点. eg.'#floor', '.floor'
        var selector = elem.indexOf('#') >= 0 ?  
                    elem.replace(/([\#]+)/g, '') 
                    : 
                    ( elem.indexOf('.') >= 0 ? tools.getClassNameString(elem) : elem.replace(/([\#\.]+)/g, '') );
        this.$selector = selector; // 当前元素选择器的ID属性值或Class类名
        this.$obj = obj; // 输入框元素节点DOM对象
        this.$ids = document.getElementById(selector);
        this.$classes = document.getElementsByClassName(selector);
        this.$elements = this.$ids == null ? this.$classes : [this.$ids];
        this.$dom = document.getElementById(selector) == null ? document.getElementsByClassName(selector)[0] : document.getElementById(selector); // 当前元素节点
        this.$opts = net.extend(defaults, options || {}); // 控件参数对象
        // 控制台输出 testing
        // console.log('method：', this.$method);
        // console.log('elem：',this.$elem);
        // console.log('selector：', this.$selector);
        // console.log('Object对象：', this.$obj);
        // console.log('ID属性DOM：',this.$ids);
        // console.log('Class属性DOM：',this.$classes);
        // console.log('DOM对象：', this.$dom);
        // console.log('opts：',this.$opts);
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
    //                          原型函数或对象
    //================================================================
    /**
     * 初始化
     */
    inputDrop.prototype.init = function(){
        var me = this;
        if(me.$method == 'OUTER'){
            Array.from(me.$elements).forEach(function(element, i){
                element.addEventListener(me.$opts.event, function(){
                    me.createControl(element);
                })
            })
        } else if(me.$method == 'INNER'){
            me.createControl(me.$obj);
        }
    };

    inputDrop.prototype.createControl = function(valCell){
        var me = this;
        var opts = me.$opts;
        var format = opts.format, source = opts.source;
        var dFieldId = "id", dFieldValue = "value";
        var fFieldId = tools.isArray(format) ? (format.length > 1 ? format[0] : dFieldId) : dFieldId,
            fFieldValue = tools.isArray(format) ? ( format.length > 1 ? format[1] : ( format.length == 1 ? format[0] : dFieldValue) ) : dFieldValue;
        // 判断数据源
        var inputValue = tools.getElementValue(valCell); // 当前输入框元素的值
        var dataSource = me.$method == 'OUTER' ? opts.inputBack({value: inputValue}) : source;
        if(typeof dataSource == 'undefined'){
            tools.dialogs('前台未指定数据源，或输入时未返回数据源！');
            return;
        }
        if(typeof dataSource.data == 'undefined'){
            tools.dialogs('请检查数据源是否包含data属性，正确的格式：{data:[]}');
            return;
        }
        // 列表HTML
        var listHtml = '';
        for(var i = 0; i < dataSource.data.length; i++){
            var row = dataSource.data[i];
            var bh = fFieldId == dFieldId ? (i + 1) : row[fFieldId],
                value = row[fFieldValue];
            var liHeight = isNaN(Math.floor(me.$opts.itemHeight)) ? 32 : Math.floor(me.$opts.itemHeight);
            var _liStyle = ' style="min-height:' + liHeight + 'px"';
            listHtml += '<li data-bh="' + bh + '"' + _liStyle + '>' + value + '</li>';
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
        me.removeNode(); // 先移除控件
        var _eClassNameStr = opts.className.replace(/([ ]+)/g, '') === '' ? '' : ' ' + opts.className;
        var nodeDiv = document.createElement('div');
        nodeDiv.className = net.idClass + ' ne_input_search_' + tools.generateRandomChar() + _eClassNameStr;
        opts.id === 'default' ||  opts.id.replace(/([ ]+)/g, '') === '' ? '' : nodeDiv.id = opts.id;
        width == 'auto' ? '' : nodeDiv.style.width = width + 'px';
        nodeDiv.style.zIndex = zIndex;
        nodeDiv.innerHTML = allHtml;
        valCell.after(nodeDiv);
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
        if(typeof me.$oldValue == 'undefined'){ // 第1次时才赋值
            me.$oldValue = tools.getElementValue(valCell); // 旧的显示值
        }
        // 触发事件 
        if(me.$ul != null) me.chooseItem(valCell); // 选中下拉项事件
        if(me.$noneData != null) me.nodata(); // 选中无数据时的项
        me.closeButton(); // 关闭事件
    }



    /**
     * 选择某一项
     */
    inputDrop.prototype.chooseItem = function(valCell){
        var me = this;
        var child = me.$ul.children;
        for(var i = 0; i < child.length; i++){
            var lis = child[i];
            var bh = tools.getDataset(lis).bh, // lis.dataset.bh,
                value = lis.innerText; 
            if(me.$opts.explained){ // 过滤下拉项中的说明性文字
                var tempStr = lis.innerHTML.toString().replace(/<[^<>]+?>/g, '`'); //说明性文字(过滤html标签)
                tempStr = tempStr.replace(/(\`+)/g, '`');
                var newSmZi = tempStr.replace(/(.*)`(.*)`$/g, '$2');
                if(newSmZi == value) newSmZi = ''; 
                value = value.replace(newSmZi, '');
            }
            if(child.length == 1 && fnGetIsOneFill(me)){ // 只有一个下拉项时
                fnFillValue2Box(me, valCell, bh, value);
            }
            // console.log('隐藏值：', bh, ' - 显示值：', value);
            (function(hid, val){ // 使用闭包才能正确传值。hid 隐藏值, val 显示值
                lis.onclick = function(){
                    fnFillValue2Box(me, valCell, hid, val);
                }
            })(bh, value)
        }
    };

    
    /**
     * 选中无数据时的项
     */
    inputDrop.prototype.nodata = function(){
        var me = this;
        document.getElementsByClassName('neInputsearch__zero')[0].onclick = function(){
            if(me.$root) me.$root.remove(); // 关闭控件
        }
    };


    /**
     * 关闭按钮
     */
    inputDrop.prototype.closeButton = function(){
        var me = this;
        var btn = document.getElementsByClassName('neInputsearch__btn')[0];
        if(typeof btn == 'undefined') return;
        btn.onclick = function(){
            if(me.$opts.onClose) // 关闭后的回调
                me.$opts.onClose({id: me.$oldId, value: me.$oldValue});
            if(me.$root) me.$root.remove(); // 关闭控件
        }
    };

    /**
     * 移除控件
     */
    inputDrop.prototype.removeNode = function(){
        var div = document.getElementsByClassName(net.idClass)
        if(div.length != 0 ) div[0].remove();
    };

    


    //================================================================
    //                         自定义函数
    //================================================================
    /**
     * 把值填充到输入框元素中
     * @param {object} ps_this 控件参数对象
     * @param {string} ps_bh 隐藏的值
     * @param {string} ps_val 显示的值
     */
    function fnFillValue2Box(ps_this, ps_element, ps_bh, ps_val){
        var me = ps_this;
        if(me.$opts.autoFill.selectedFill || (child.length == 1 && fnGetIsOneFill(me))){
            ps_element.setAttribute('data-bh', ps_bh); // 给当前元素赋隐藏值
            tools.giveValueToElement(ps_element, ps_val); // 给当前元素赋显示值
        }
        if(me.$opts.onConfirm)  // 选择某一项后回调
            me.$opts.onConfirm({id: ps_bh, value: ps_val, oldId: me.$oldId, oldValue: me.$oldValue});
        if(me.$root) me.$root.remove(); // 关闭控件
        // 全局赋值 (旧的隐藏值、显示值再次赋值)
        me.$oldId = ps_bh;
        me.$oldValue = ps_val;
    }

    /**
     * 获取只有一个下拉项时是否自动填充输入框元素
     * @param {object} ps_this 控件参数对象
     * @returns {boolean} 返回布氽值true或false
     */
    function fnGetIsOneFill(ps_this){
        var me = ps_this;
        return me.$opts.autoFill.oneItemFill == 'auto' ? ( tools.isAppDevice() ? false : true ) : me.$opts.autoFill.oneItemFill;
    }



    //================================================================
    //                          工具库类
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
    }


    //================================================================
    return neuiInputsearch;
});
