/**
 * [NeForm]、[neuiSearchBox]
 * 表单配置控件，含：表单控件、搜索框控件
 * Version：1.0.0
 * compatible：ie8 and ie8+
 * Website: https://github.com/yimobing/neatui
 * Author: ChenMufeng
 * QQ: 1614644937
 * Date: 2021.03.06
 * Update: 2021.08.065
 */

/*———————————————————————————————————————————————————————————————————————————————————————————————
 *                                    一、表单控件(原生JS)
———————————————————————————————————————————————————————————————————————————————————————————————*/
 ;(function(root, factory){
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.NeForm = factory();
    }
})(this, function(){
    var net = { };
    //================================================================
    //                      NeForm对象
    //================================================================
    var NeForm = function(){
        var me = this;

        /**
         * ********************************
         *          数据源字段说明
         * ********************************
            --------------------------------
            ①. 数据源类型为“标准表单”，即“标准配置数据”
            --------------------------------
            [字段名称]
            title       字段名称(中文), 即显示名称
            field       字段名称(英文), 即ID属性
            type        输入框类型(可选)。值：文本,日期, 数字, 单选, 下拉
            value       初始值(可选), 默认空。当type="单选"时, value="1"表示选中, value="0"表示不选中
            unit        右边文字,一般是单位(可选), 默认空。eg. 平方米,元,万元,元/平方米
            phone       是否电话类型(可选)。值：true, false 否(默认)
            must        是否必填项(可选)。值：true 是, false 否(默认)
            multiple    是否多行(可选)。值: true 是, false 否(默认)
            readonly    是否强制为只读(可选), 默认false
            disabled    是否强制为禁用(可选), 默认false
            icon    自定义图标名称(即className)(可选), 默认图标名称为field参数值
            attribute   自定义属性(可选), 默认空。如：data-*属性， 多个属性之间用空格分开。eg. "data-toggle='1' data-vip='5'"         

            --------------------------------
            ②.数据源类型为“楼盘表单”,即“楼盘房号配置数据”
            --------------------------------
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
         * 创建表单
         * @param {string} elem 根节点ID或Class选择器字符串。eg1.'#user', eg2.'.user'
         * @param {object} opts 参数对象 
         */
        me.forms = function(elem, options){
            var defaults = {
                source: {}, // 数据源
                type: "standard", // 数据源类型(即数据源字段类型)。值：standard “标准表单”,即“标准配置数据”(默认), rooms “楼盘表单”,即“楼盘房号配置数据”
                animate: false, // 是否启用转圈动画特效(可选), 默认false
                houses: { // “楼盘房号配置数据”时(可选)
                    houseRightButton: false, // 是否楼盘名称右侧显示查询按钮(可选), 默认 false
                    switches: {
                        enable: true, // 是否允许手动输入(可选), 默认true
                        scope: "related", // 切换成手动输入的元素范围(可选)。值：related 仅限关联元素(默认), self 仅限自身元素, all 所有使用下拉选择的元素
                    }
                },
                layout: { // 布局(可选)
                    theme: "popular", // 主题(可选)。值： popular 现代流行风(默认), normal 普通经典风
                    inputIcon: false, // 输入框是否使用图标(可选), 默认 false
                    inputCross: true, // 输入框右侧是否有打叉图标(可选), 默认 true
                    inputMust: false, // 输入框不能为空时右侧是否显示必填星号*(可选), 默认 false
                    mustAlign: "left" // 必填星号*位置, 仅当inputMust=true时有效(可选)。值：left (默认) 居左, right 居右。
                }, 
                controls: { // 控件调用(可选)
                    calendar: {  // 日历控件(可选)
                        enable: true, // 是否启用(可选)，默认 true
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
            var selector = elem.indexOf('#') >= 0 ? elem.replace(/([\#]+)/g, '') :  ( elem.indexOf('.') >= 0 ? tools.getClassNameString(elem) : elem.replace(/([\#\.]+)/g, '') );
            // --------全局赋值--------
            me.$opts = net.extend(true, {}, defaults, options || {}); // 控件参数
            me.$selector = selector;  // 节点ID或CLass属性值(不含选择器符号井号#或点号.). eg. 'floor'
            me.$elem = elem; // 节点ID或Class属性值(含选择器符号井号#或点号.). eg.'#floor', '.floor'
            me.$obj = document.getElementById(selector) == null ? document.getElementsByClassName(selector)[0] : document.getElementById(selector); // 元素dom对象
            // console.log('生成房号配置数据\nelem：', me.$elem, '\noptions：',me.$opts);
            // --------添加class属性--------
            me.$obj.className += ' ne-configuration ne-form';
            me.$obj.className += me.$opts.layout.theme != 'popular' ? '' : ' theme-popular';
            me.$obj.className += me.$opts.layout.inputMust && me.$opts.layout.mustAlign == 'left' ? ' has-must-left' : '';
            // ·--------校验数据格式--------
            var source = me.$opts.source;
            if(!tools.isJsonObject(source)){
                alert('source参数不是JSON对象，请检查！');
                return;
            }
            if(typeof source.data === 'undefined'){
                alert('source参数不含data属性，请检查！');
                return;
            }
            // ·--------按数据源类型--------
            if(me.$opts.animate && typeof neui !== 'undefined' && typeof neui.showAnimate === 'function') neui.showAnimate();
            // setTimeout(function(){
                // ①.数据源类型为“标准表单”,即“标准配置数据”
                if(me.$opts.type == 'standard') {
                    me.$obj.className += ' ne-config-standard';
                    formUI.createStandardForm(me);
                }
                // ②.数据源类型为“楼盘表单”,即“楼盘房号配置数据”
                if(me.$opts.type == 'rooms') {
                    me.$obj.className += ' ne-config-rooms';
                    formUI.createHouseForm(me);
                }
                formUI.callControls(me); // 根据控件类型调用相应控件
                formUI.doneEvents(me); // 执行一系列操作事件
                if(me.$opts.animate && typeof neui !== 'undefined' && typeof neui.destroyAnimate === 'function') neui.destroyAnimate();
            // }, 100)
        };



        /**
         * 切换成手动输入
         * @param {HTML DOM || jQuery Object} o 当前元素dom对象或jq选择器对象
         * @param {string} limit 切换的范围(可选)。值：related 仅限关联元素(默认), self 仅限自身元素, all 所有使用下拉选择的元素
         */
        me.switchHandEnter = function(o, limit){
            var elem = o instanceof jQuery ? o[0] : o;
            var scope = typeof limit == 'undefined' ? 'related' : limit,
                idName = elem.id,
                className = elem.className;    
            if(typeof className == 'undefined') return;
            if(typeof neuiDialog == 'undefined') return;
            if(typeof neuiDialog.alert !== 'function') return;
            var $this = this;

            //alert('className:'+className);
            // 1.允许手动输入
            if(me.$opts.houses.switches.enable) {
                if(className.indexOf('build') >= 0){ // 如果是幢号
                    neuiDialog.alert({
                        animate: true,
                        caption: '提示',
                        message: '系统暂无该楼盘数据<br>请确认楼盘名称是否正确',
                        buttons: ['名称错误，重新输入', '名称正确，允许我手动输入'],
                        btnDirection: 'vertical',
                        callBack: function(ret){
                            if(ret == 1){
                                // 楼盘名称清空并聚焦
                                var el = document.querySelector('#house');
                                el.value = ''; // 楼盘名称清空
                                tools.setFocus(el); // 光标聚焦
                                // 隐藏打叉图标
                                var nextNodes = tools.getSiblingElement(el.parentNode);
                                for(var i = 0; i < nextNodes.length; i++){
                                    var next = nextNodes[i];
                                    var attr = next.getAttribute('data-type');
                                    if(typeof attr != 'undefined' && attr == 'cross'){
                                        next.style.display = 'none';
                                    }
                                }
                            }else if(ret == 2){
                                formUI.switchToHand(scope, elem);
                            }
                        }
                    })
                }else{ //如果是楼层、房号等
                    neuiDialog.alert({
                        animate: true,
                        caption: '提示',
                        message: '系统无数据，将为您自动切换手动输入',
                        buttons: ['确定'],
                        callBack:function(){
                            formUI.switchToHand(scope, elem);
                        }
                    })
                }
            }

            // 2.不允许手动输入
            else {
                var message = '';
                if(className.indexOf('build') >= 0) message = '幢号';
                if(className.indexOf('floor') >= 0) message = '楼层';
                if(className.indexOf('room') >= 0) message = '房号';
                if(className.indexOf('property') >= 0) message = '产权年限';
                neuiDialog.alert({
                    caption: '提示',
                    message: '对不起，该楼盘暂无' + message + '数据',
                    buttons: ['确定']
                })
            }
        };
        


        //-----------------------------------------------------
        //                  表单公用函数
        //-----------------------------------------------------
        /**
         * 判断表单是否有数据
         * @param {HTML DOM || jQuery Object} 表单根节点dom对象或jq选择器对象
         * @returns {boolean} 返回布尔值。true 有数据, false 无数据
         * 返回值为数组arr
         * arr.length>0 则面板有数据,否则没有数据
         */
         me.isFormHasData = function(o){
            var arr = [];
            o = tools.anyToDomObject(o);
            var child = tools.getChildElement(o);
            Array.from(child).forEach(function(el){
                var input = el.querySelectorAll('textarea, input[type="text"], input[type="checkbox"]');
                Array.from(input).forEach(function(ele){
                    var type = ele.getAttribute('type');
                    var value = '';
                    if(type == null || type == 'text') {
                        value = ele.value;
                    }
                    else if(type == 'checkbox') {
                        value = ele.checked ? 1 : 0;
                    }
                    // console.log('值：', value);
                    if(type == 'checkbox') {
                        if(value != 0) arr.push(value);
                    }
                    else {
                        if(value.toString().replace(/([ ]+)/g, '') !== '') arr.push(value);
                    }
                   
                })
            })
            return arr.length > 0 ? true : false;
        };



        /**
         * 判断表单是否全部为输入类型，而不包含下拉类型
         * @return {boolean} 返回值： true 全是输入类型, false 不全是输入类型(有下拉类型)
         */
        me.isFormAllCanWrite = function(){
            var result = true; //默认是
            $('.showform .eform-box').each(function(){
                var eleClassName = '.click-hand';
                if($(eleClassName,this).length != 0){ //有下拉类型
                    result = false; //重置为否
                    return false;
                }
            })
            return result;
        };
    

        /**
         * 校验表单格式与完整性
         * 符合eform格式的表单都可以用此校验方法
         * @param {string | selector} ps_node 表单根节点
         * @param {number} ps_dialog_zIndex 对话框层级(可选).默认z-index 114
         * @returns {boolean} 返回布尔值. true 数据正常, false 数据异常
         */
        me.examineForm = function(ps_node, ps_dialog_zIndex){
            var tips1 = '';
            var tips2 = '';
            $(ps_node).find('.eform-one').each(function(){
                var label = $('.eform-l label', this).text(),
                    value = $('input, textarea', this).val();
                    isMust = $('.r-star', this).length > 0 ? true : false;
                    isPhone = $('.icon-tel', this).length > 0 ? true : false;
                //console.log('label:', label, '-value:', value, '-isMUst:',isMust, '-isPhone:',isPhone)
                if(isMust && value == '') tips1 += label + '、';
                if(isMust && isPhone && !checker.checkTel(value, 'both')) tips2 += label + '、';
            })
            //校验完整性
            if(tips1 != ''){
                meuiDialog.alert({
                    zIndex: ps_dialog_zIndex,
                    animate: true,
                    caption: '提示',
                    message: '请填写：' + tips1.substr(0, tips1.length - 1),
                    buttons: ['确定']
                })
                return false;
            }
            //校验电话
            if(tips2 != ''){
                meuiDialog.alert({
                    zIndex: ps_dialog_zIndex,
                    animate: true,
                    caption: '提示',
                    message: '请填写正确的：' + tips2.substr(0, tips2.length - 1),
                    buttons: ['确定']
                })
                return false;
            }
            return true;
        };

        
        /**
         * 获取整个表单数据
         * @return {json} 返回JSON数组
         */
         me.getFormData = function(){
            var json = {}
            $('.showform .eform-box').each(function(){
                var eleClassName = '.click-input';
                var title = $('label',this).text(), //显示名称（会变)
                    hide = typeof $(eleClassName,this).attr('data-hide') == 'undefined' ? '' : $(eleClassName,this).attr('data-hide'), // 英文字段值 
                    hid1 = typeof $(eleClassName,this).attr('data-hid1') == 'undefined' ? '' :  $(eleClassName,this).attr('data-hid1'), //隐藏值1（不会变)
                    id = $(eleClassName,this)[0].id,
                    className = $(eleClassName,this)[0].className.toString().replace(/click-input /g,''),
                    bh = typeof $(eleClassName,this).attr('data-bh') == 'undefined' ? '' :  $(eleClassName,this).attr('data-bh'),
                    value = $(eleClassName,this).val();
                var oneJson = {"title":title, "id":id, "className":className, "bh":bh, "value":value}
                json[hide] = oneJson;
            })
            return json;
        };





        //-----------------------------------------------------
        //                  “标准表单”专用函数
        //-----------------------------------------------------
        /**
         * 获取“标准表单”数据
         * @param {array|string} ps_type 数组或字符串. 'array' JSON数据(默认）， 'tooltip' 提示信息
         * @param {array|string} 返回值为数组或字符串
         */
        me.getStandardFormData = function(ps_type){
            var json = {}
            $('.showsheet .eform-box').each(function(){
                var eleClassName = '.click-input';
                var title = $('label',this).text(), //显示名称（会变)
                    hid1 = typeof $(eleClassName,this).attr('data-hid1') == 'undefined' ? '' :  $(eleClassName,this).attr('data-hid1'), //隐藏值1（不会变)
                    id = $(eleClassName,this)[0].id,
                    className = $(eleClassName,this)[0].className.toString().replace(/click-input /g,''),
                    bh = typeof $(eleClassName,this).attr('data-bh') == 'undefined' ? '' :  $(eleClassName,this).attr('data-bh'),
                    value = $(eleClassName,this).val();
                var oneJson = {"title":title, "id":id, "className":className, "bh":bh, "value":value}

                var field = (hid1 == '' || hid1 == '无' ? title : hid1);
                json[field] = oneJson;
            })

            var tips = '';
            var dialog1 = '';
            var dialog2 = '';
            $('.showsheet .eform-box').each(function(){
                if($(this).is(':visible')){
                    var text = $('label',this).text();
                    var placeholder = (typeof $('.click-input',this).attr('placeholder') == 'undefined') ? '' : $('.click-input',this).attr('placeholder');
                    var value = $('.click-input',this).val();
                    if(placeholder!='' && value=='') dialog1 += text + '、';
                    //console.log('text:',text,' placeholder:',placeholder, ' value:',value);
                    if(value != '' && $(this).find('.eform-tel').length > 0){ //验证电话格式
                        if(!checker.checkTel(value, 'both')) dialog2 += '请填写正确的' + text;
                    }
                }
            })
            tips += dialog1 == '' ? '' : '请填写' + dialog1.substr(0, dialog1.length - 1) +'<br>'; //去掉最后一个字符
            tips += dialog2 == '' ? '' : dialog2;

            var types = typeof ps_type == 'undefined' ? 'array' : ps_type;
            if(types == 'array') return json;
            if(types == 'tooltip') return tips;
        };





        //-----------------------------------------------------
        //                  “楼盘表单”专用函数
        //-----------------------------------------------------
        /**
         * 判断“楼盘表单”是否有数据
         * 返回值为数组arr
         * arr.length>0 则面板有数据,否则没有数据
         */
        me.isRoomFormHasData = function(){
            var arr = [];
            $('.showjson .eform-box').each(function(){
                var value = $('.click-input',this).val();
                if(value != '' && value != 0) arr.push({"value":value});
            })
            return arr; 
        };


        /**
         * 判断抵押物类型是否为住宅
         * @returns {boolean} 返回值：true 是住宅, false 非住宅,即“其他(如商业、工业等非住宅用途)”
         */
         me.isRoomFormPawnTypeHouse = function(){
            var hid1Arr = [];
            $('.showform .eform-box').each(function(){
                var eleClassName = '.click-input';
                var title = $('label',this).text(), //显示名称（会变)
                    hid1 = typeof $(eleClassName,this).attr('data-hid1') == 'undefined' ? '' :  $(eleClassName,this).attr('data-hid1'); //隐藏值1（不会变)
                    hid1Arr.push(hid1);
            })
            //console.log('arr:', hid1Arr);
            var houseArr = ['楼盘', '幢号', '楼层', '房号']; //住宅类型hid1必备的值
            var count = 0;
            for(var i = 0; i < hid1Arr.length; i++){
                var hid1 = hid1Arr[i];
                for(var j = 0; j < houseArr.length; j++){
                    var value = houseArr[j];
                    if(hid1 == value) count++;
                }
            }
            var result = count >= houseArr.length ? true : false; //是否住宅
            return result;
        },

            
        /**
         * 过滤楼盘名称中的特殊字符
         */
        me.filterRoomFormHouseChar = function(str){
            //过滤html
            var str = str.toString().replace(/\<style[\s\S]*>[\s\S]*<\/style>/g,''); //过滤css
            str = str.replace(/\<script[\s\S]*>[\s\S]*<\/script>/g,''); //过滤JS
            str = str.replace(/<[^<>]+?>/g,'');  //过滤html标签
            str = str.replace(/\ +/g,''); //去掉空格
            str = str.replace(/[\r\n]+?/g,''); //去掉换行
            str = str.replace(/&npsp;/ig, ''); //去掉npsp;
            //str = str.replace(/[\w\d\_\-?？!！]/g,''); //过滤数字、字母、下划线、短线、问号，感叹号等
            return str;
        };

        
        /**
         * 点击关联元素中任意一个，提示用户“前面的数据是否为空”
         * 也就是前面栏的数据如果为空，则当前栏不允许输入或选择下拉
         * 用于：楼盘名称、幢号、楼层、房号等关联数据
         * @param {object} obj 当前对象
         * @return {string} 返回提示信息（空表示前面的数据是完整的）
         */
        me.warnRoomFormRelatedPreviousEmpty = function(obj){
            var index = $(obj).parents('.eform-box').index();
            var warnInfo = '';
            for(i=0;i<index;i++){
                var $eq = $('.showjson .eform-box').eq(i);
                var text = $eq.find('label').text();
                var value = $eq.find('.click-input').val();
                if(value=='') warnInfo+=text + '、';
            }
            if(warnInfo!='')
                warnInfo = '请填写：' + warnInfo.substr(0,warnInfo.length-1); //去掉最后一个符号
            return warnInfo;
        };


        /**
         * 上级元素值改变，则清空下级关联元素数据
         * 用于：楼盘名称、幢号、楼层、房号等关联数据
         * @param {object} obj 当前对象
         * @param {string} oValue 老值
         * @param {string} nValue 新值
         * eg.
         * 楼盘名称改变：清空幢号、楼层、房号
         * 幢号改变：清空楼层、房号
         * 楼层改变：清空房号
         */
        me.clearRoomFormRelatedSubordinateData = function(obj, oValue, nValue){
            if(nValue != oValue){
                $(obj).parents('.eform-box').nextAll().find('.clear-relation').val('').attr('data-bh','');
            }
        };


        /**
         * 获取“楼盘表单”数据
         * @param {array|string} ps_type 数组或字符串. 'array' 数组(默认）， 'tooltip' 提示信息
         * @param {array|string} 返回值为数组或字符串
         */
        me.getRoomFormData = function(ps_type){
            var arr = [];
            var warnInfo = '';
            var tips = ''; //检验完整性的提示信息
            var oneJson = {}
            $('.showjson .eform-box').each(function(){
                var eleClassName = '.click-input';
                if($(eleClassName,this).length>0){
                    var val2 = $(eleClassName,this).val(),
                        hid5 = $(eleClassName,this).data('hid5'),
                        hid6 = $(eleClassName,this).data('hid6');
                    onejson = {"val2":val2, "hid5":hid5, "hid6":hid6}
                    if(hid5=='1' && val2 ==''){
                        warnInfo += $('label',this).text() + '、';
                    }
                }
                arr.push(onejson);
            });
            
            for(var i=0;i<arr.length;i++){ //数组去重
                for(var j=i+1;j<arr.length;){
                    if(arr[i].val2==arr[j].val2 && arr[i].hid5==arr[j].hid5 && arr[i].hid6==arr[j].hid6) arr.splice(j,1);
                    else j++;
                }
            }
            tips =  warnInfo == '' ? '' : '请填写：' + warnInfo.substr(0,warnInfo.length - 1);	
            //console.log('types:',types,'\ntips:',tips,'\narr:',arr);
            var types = typeof ps_type == 'undefined' ? 'array' : ps_type;
            if(types == 'array') return arr;
            if(types == 'tooltip') return tips;
        };




 
    }; //END NeForm





    //================================================================
    //                      表单控件UI对象
    //================================================================
    var formUI = {
        /**
         * 生成“标准表单”,即“标准配置数据”
         * @param {object} me 控件对象参数
         */
        createStandardForm: function(me){
            var source = me.$opts.source;
            var _outerHtml = '';
            // 循环项
            for(var i = 0; i < source.data.length; i++){
                var items = source.data[i];
                var title = items["title"],
                    field = items["field"],
                    type = typeof items["type"] == 'undefined' ? '文本' : items["type"],
                    value = typeof items["value"] == 'undefined' ? '' : items["value"],
                    unit = typeof items["unit"] == 'undefined' ? '' : items["unit"],
                    phone = typeof items["phone"] == 'undefined' ? false : items["phone"] === true ? true : false,
                    must = typeof items["must"] == 'undefined' ? false : items["must"] === true ? true : false,
                    multiple = typeof items["multiple"] == 'undefined' ? false : items["multiple"] === true ? true : false,
                    readonly = typeof items["readonly"] == 'undefined' ? false : items["readonly"] === true ? true : false,
                    disabled = typeof items["disabled"] == 'undefined' ? false : items["disabled"] === true ? true : false,
                    icon = typeof items["icon"] == 'undefined' ? field : items["icon"],
                    attribute = typeof items["attribute"] == 'undefined' ? '' : items["attribute"];
                
                //
                var _LHtml = '', // 左边内容
                    _RHtml = '', // 右边内容
                    _UHtml = '', // 单位、电话内容
                    _IcoHtml = ''; // 图标内容
                
                // 输入框
                var tagName = !multiple ? 'input' : 'textarea', // 标签类型。值：input(默认), radio, textarea
                    types = 'text', // type属性。值: text 文本(默认), number 数字, checkbox 复选(单选、多选)
                    ids = field, // ID属性
                    className = '', // class属性
                    checked = ''; // checked属性。值：空 表示没有这个属性, true 表示选中, false 不选中
                //
                if(type == '文本') {
                    types = 'text';
                }
                if(type == '日期') {
                    className = 'click-date';
                    readonly = true;
                }
                if(type == '数字') {
                    // types = 'number';
                    className = 'click-num';
                }
                if(type == '单选') {
                    types = 'checkbox';
                    className = 'ne-switch';
                    checked = parseInt(value) == 1 ? true : false;
                }
                if(type == '下拉') {
                    readonly = true;
                }
                //
                if(phone){
                    className += ' click-tel';
                }
                //
                var chooseText = (!readonly ? '请填写' : '请选择'); //+title,
                    _looseFocusStr = !readonly ?  '' : ';this.blur()';
                var _classNameStr = ' class="' + className + '"',
                    _placeholderStr = !must ? '' : ' placeholder="' + chooseText + '"',
                    _blurStr = !must ? '' : ' onblur="this.placeholder=\'' + chooseText + '\'"';
                    _focusStr = !must ? ( !readonly ? '' : ' onfocus="this.blur()"') : ' onfocus="this.placeholder=\'\'' + _looseFocusStr + '"',
                    _readonlyStr = !readonly ? '' : ' readonly',
                    _disabledStr = !disabled ? '' : ' disabled',
                    _btnStr = '', // 按钮
                    _checkStr = checked == '' ? '' : (checked ? ' checked': ''),
                    _attStr = attribute == '' ? '' : ' ' + attribute.toString().replace(/\'/g, '"').replace(/([ ]+)/g, ' '),
                    _unitClass = !me.$opts.layout.inputCross ? '' : ' has-cell-cross';
                    _crossClass = ''; // me.$opts.houses.houseRightButton && _btnStr != '' ? ' has-cell-btn' : '';
                    _crossStyle = value.toString().replace(/([ ]+)/g, '') !== '' ? '' : ' style="display: none"';
                var _attrListStr = ' id="' + ids + '"' + _classNameStr + _attStr + _placeholderStr + _blurStr + _focusStr + _readonlyStr + _disabledStr; // 所有公用属性串
                //
                var _iconStr = !me.$opts.layout.inputIcon ? '' : (icon == '' ? '' : '<i class="icon icon-' + icon + '"></i>'),
                    _unitStr = unit == '' ? '' : '<em class="r-unit' + _unitClass + '">' + unit + '</em>',
                    _phoneStr = phone == '' ? '' : '<em class="r-tel' + _unitClass + '"><a></a></em>';
                var _crossStr = ( types == 'text' && me.$opts.layout.inputCross ) ? '<div class="item-cell' + _crossClass + '" data-type="cross"' + _crossStyle + '></div>' : '',
                    _mustStr = must && me.$opts.layout.inputMust ? '<div class="item-cell" data-type="must">*</div>' : '';
                //
                var _inputStr = '';
                if(tagName == 'input'){
                    _inputStr = '<input type="' + types + '" value="' + value + '"' + _checkStr + _attrListStr + '>';
                }
                if(tagName == 'textarea'){
                    _inputStr = '<textarea' + _attrListStr + '>' + value + '</textarea>';
                }
                // 节点拼接
                _LHtml += _inputStr;
                _RHtml += _btnStr + _crossStr + _mustStr;
                _UHtml += _unitStr + _phoneStr;
                _IcoHtml += _iconStr;
                // 拼接HTML
                _outerHtml += [
                    '<div class="eform-row">',
                        '<div class="item-l">',
                            ( me.$opts.layout.theme != 'popular' ? '' : _IcoHtml ),
                            '<label>' + title + '</label>',
                        '</div>',
                        '<div class="item-r">',
                            ( me.$opts.layout.theme == 'popular' ? '' : _IcoHtml ),
                            _LHtml,
                            _UHtml,
                        '</div>',
                        _RHtml,
                    '</div><!--/.eform-row-->'
                ].join('\r\n');

            } // END FOR
     
            tools.removeAllChildren(me.$obj); // 先清空元素内容
            tools.appendHTML(_outerHtml, me.$obj); // 再添加新内容
        },


        /**
         * 生成“楼盘表单”,即“楼盘房号配置数据”
         * @param {object} me 控件对象参数
         */
        createHouseForm: function(me){
            var source = me.$opts.source;
            var _outerHtml = '';
            for(var i = 0; i < source.data.length; i++){
                var items = source.data[i];
                var val1 = items["val1"],
                    val2 = items["val2"],
                    val3 = items["val3"],
                    val4 = items["val4"],
                    hid1 = items["hid1"],
                    hid2 = items["hid2"],
                    hid3 = items["hid3"],
                    hid4 = items["hid4"],
                    hid5 = items["hid5"],
                    hid6 = items["hid6"];
                var _hid1 = ' data-hid1="' + hid1 + '"', 
                    _hid3 = ' data-hid3="' + hid3 + '"', 
                    _hid5 = ' data-hid5="' + hid5 + '"', 
                    _hid6 = ' data-hid6="' + hid6 + '"';
                var _placeholder = ' placeholder="' + val4 + '"',
                    _onblur = ' onblur="this.placeholder=\'' + val4 + '\'"';
                var	_LHtml = '', // 左边内容
                    _UHtml = '', // 单位等内容
                    _BtHtml = '', // 按钮内容
                    _RHtml = ''; // 右边内容
                var _MustHtml = hid5 != '1' ? '' : '<div class="item-cell" data-type="must">*</div>'; // 必填项星号*
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
                    var _unitClass = !me.$opts.layout.inputCross ? '' : ' has-cell-cross';
                    _UHtml = '<em class="r-unit' + _unitClass + '">' + val3 + '</em>';
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
                                // boxWidth = '100%';
                                if(me.$opts.houses.houseRightButton)
                                    _BtHtml = '<div class="item-cell"><button type="button" id="btn-query-house">查询</button></div>';
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
                            me.$opts.controls.keyboard.enable ? readonly = true : readonly = false;
                            // types = 'number'; // 只能输入数字(部分手机不支持)
                        }

                        if (hid1 == '储藏间面积') { // 调用数字键盘
                            className += ' click-num click-ccjmj';
                            ids = 'ccjmj';
                            icons = ' icon-metre';
                            me.$opts.controls.keyboard.enable ? readonly = true : readonly = false;
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
                //
                var _boxWClass = ''; // boxWidth == '' ? '' : (boxWidth == '100%' ? ' w-100' : ''); // 宽
                var _iconStr = icons == '' || me.$opts.layout.inputIcon === false ? '' : '<i class="icon' + icons + '"></i>'; // 图标
                //
                var _crossClass = me.$opts.houses.houseRightButton && _BtHtml != '' ? ' has-cell-btn' : '';
                var _crossStyle = val2.toString().replace(/([ ]+)/g, '') !== '' ? '' : ' style="display: none"';
                _RHtml += types == 'text' && me.$opts.layout.inputCross 
                            ? '<div class="item-cell' + _crossClass + '" data-type="cross"' + _crossStyle + '></div>' 
                            : 
                            '';
                _RHtml += _BtHtml; // 右侧内容
                // 拼接HTML
                _outerHtml += [
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
                        ( !me.$opts.layout.inputMust ? '' : _MustHtml ),
                        '</div>'
                ].join('\r\n');

            } // END FOR

            tools.removeAllChildren(me.$obj); // 先清空元素内容
            tools.appendHTML(_outerHtml, me.$obj); // 再添加新内容
            this.loadExchangeModule(me);
        },




        /**
         * 加载切换输入模块：“如查无数据，请选择手动输入”、“取消手动输入”
         * @param {object} me 控件对象参数
         */
        loadExchangeModule: function(me){
             var _tmpHtml = [
                '<div class="block__switch block__switch-hand">',
                    '<span>如查无数据，请选择</span>',
                    '<button type="button" id="btn-manual">手动输入</button>',
                '</div>',
                '<div class="block__switch block__switch-select" style="display: none">',
                    '<button type="button" id="btn-dropdown">取消手动输入</button>',
                '</div>',
            ].join('\r\n');
            var switchNode = tools.createOneNextNode(me.$obj, "switch");
            switchNode.innerHTML = _tmpHtml; 
        },

        /**
         * 调用控件
         * @param {object} me 控件对象参数
         */
        callControls: function(me){
            // 日期类型
            var dateNode = document.getElementsByClassName('click-date');
            if(me.$opts.controls.calendar.enable){
                // 调用日历控件
                Array.from(dateNode).forEach(function(el, i){
                    if(typeof neuiCalendar == 'object'){
                        if(typeof neuiCalendar.neDate === 'function'){
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
            var numeralNode = document.getElementsByClassName('click-num');
            if(me.$opts.controls.keyboard.enable){
                // 调用数字键盘控件
                Array.from(numeralNode).forEach(function(el, i){
                    if(typeof el.neuiKeyboard === 'function'){
                        el.fadeIn(400).neuiKeyboard({
                            title:'数字键盘'
                            // mode: 'computer',
                            // size: 'normal' // 键盘尺寸,仅在mode='computer'时有效(可选). normal 正常(默认), small 小型, little 较小型, tiny 微型	
                            // hasPoint:false, // 是否有小数点(可选),默认 true
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

            // 电话类型(电话高亮)
            var inputNode = document.getElementsByClassName('click-tel');
            Array.from(inputNode).forEach(function(el, i){
                el.addEventListener('input', function(){ // 输入事件
                    var value = this.value;
                    var reg = /[^\d\-]/g; // 只允许输入数字、短横线
                    value = value.toString().replace(reg,'');
                    value = tools.repeatedChar(value, '-'); // 只保留一个短横线
                    this.value = value;
                    var next = tools.getNextElement(this);
                    if(next != null){
                       var child = tools.getFirstChildElement(next);
                       var className = child.className;
                        if(tools.isTel(value)){
                            child.className += className.indexOf('hover') >= 0 ? '' : 'hover';
                        }else{
                            child.className = '';
                        }
                    }
                })   
            })
        },


        /**
         * 执行事件
         * @param {object} me 控件对象参数
         */
        doneEvents: function(me){
            var _this = this;
            // 单选开关
            // var radioNode = document.getElementsByClassName('ne-switch');
            // Array.from(radioNode).forEach(function(el, i){
            //     el.addEventListener('click', function(){
            //         if(this.value == 1){
            //             this.setAttribute('checked', false);
            //             this.setAttribute('value', 0);
            //         }else{
            //             this.setAttribute('checked', true);
            //             this.setAttribute('value', 1);
            //         }
            //     })
            // })
            
            // 打叉图标
            var crossNode = document.querySelectorAll('[data-type="cross"]');
            Array.from(crossNode).forEach(function(el, i){
                el.addEventListener('click', function(e){
                    e.stopPropagation();
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
                                child[i].value = ''; // 清空输入框值
                                el.style = 'display: none;'; // 隐藏打叉图标
                            }
                        }
                    })
                })
            })

            // 输入框元素在输入或点击时
            var inputNode = document.querySelectorAll('input[type="text"], textarea');
            Array.from(inputNode).forEach(function(el, i){
                el.addEventListener('input', function(){ // 输入事件
                    var value = this.value;
                    var next = tools.getNextElement(this.parentNode);
                    if(next != null){
                        // 打叉图标根据需要显示或隐藏
                        this.value.toString().replace(/([ ]+)/g, '') !== '' ? next.style = '' : next.style = 'display: none;';
                    }
                })
                el.addEventListener('click', function(){ // 点击事件
                    var _this = this;
                    var next = tools.getNextElement(this.parentNode);
                    var oldValue = this.value;
                    if(next != null){
                        // 打叉图标根据需要显示或隐藏
                        var intervals = null;
                        var seconds = 0;
                        intervals = setInterval(function(){ // 定时器监测输入框是否发生了变化
                            seconds++;
                            var newValue = _this.value;
                            // console.log('老值：', oldValue, '\n新值：', newValue, '\n当前秒数：', seconds);
                            // console.log('---------------')
                            if(newValue != oldValue){
                                newValue.toString().replace(/([ ]+)/g, '') !== '' ? next.style = '' :  next.style = 'display: none;';
                            }
                            if(seconds > 6){ // N秒后关闭定时器
                                clearInterval(intervals);
                                intervals = null;
                            }
                        }, 1000)
                    }
                })      
            })


            // “楼盘房号配置数据”时(可选)
            if(me.$opts.type == 'rooms'){
                var manualNode = document.getElementById('btn-manual'),
                    dropNode = document.getElementById('btn-dropdown');
                if(manualNode == null || dropNode == null) return;
                manualNode.addEventListener('click', function(){ // 切换成手动输入
                    _this.switchToHand('related');
                })
                dropNode.addEventListener('click', function(){ // 切换成下拉，即取消手动输入
                    _this.switchToSelect('related');
                })
            }
        },



         /**
         * 切换成手动输入
         * @param {string} scope 要切换手动输入的范围(可选)。related 仅限关联元素(默认), self 仅自身元素, all 所有使用下拉选择的元素
         * @param {HTML DOM}} o 当前点击的元素对象(可选)
         */
          switchToHand:function(scope, o){
            var pale = typeof scope == 'undefined' ? 'related' : scope;
            var elem = '';
            if(pale == 'self') elem = o instanceof jQuery ? o[0] : o;
            if(pale == 'related') elem = document.getElementsByClassName('clear-relation click-hand');
            if(pale == 'all') elem = document.getElementsByClassName('click-hand');

            // 设置元素可写入
            var setCanWrite = function(el){
                var _placeholder = typeof el.getAttribute('placeholder') == 'undefined' ? '' : el.getAttribute('placeholder').toString().replace(/选择/g, '输入'),
                    _onblur = typeof el.getAttribute('onblur') == 'undefined' ? '' : el.getAttribute('onblur').toString().replace(/选择/g, '输入'),
                    _onfocus = typeof el.getAttribute('onfocus') == 'undefined' ? '' : el.getAttribute('onfocus').toString().replace(/(this\.blur\(\))/g, '').replace(/([\;]+)/g, ';');
                el.classList.remove('click-hand');
                el.classList.add('click-select');
                el.removeAttribute('readonly');
                el.removeAttribute('onfocus');
                el.setAttribute('onfocus', _onfocus);
                el.setAttribute('placeholder', _placeholder);
                el.setAttribute('onblur', _onblur);
            }
            if(elem.item) // 元素对象集合, NodeList 对象
                Array.from(elem).forEach(function(el){
                    setCanWrite(el);
                })
            else // DOM对象
                setCanWrite(elem);
            // 根据切换范围
            if(pale == 'self'){ // 只切换自身
                if(typeof o != 'undefined' && o != ''){
                    o = o instanceof jQuery ? o[0] : o;
                    tools.setFocus(o); // 光标聚焦
                }
            }else{
                // 显示“取消手动输入”，隐藏“如查无数据，请选择手动输入”
                var parent = document.getElementById('btn-manual').parentNode;
                parent.style.display = 'none';
                tools.getNextElement(parent).style.display = '';
            }
        },



        /**
         * 切换成下拉选择
         * @param {string} scope 要切换手动输入的范围(可选)。related 仅限关联元素(默认), self 仅自身元素, all 所有使用下拉选择的元素
         * @param {HTML DOM} obj 当前对象(可选)
         */
        switchToSelect: function(scope, o){
            var pale = typeof scope == 'undefined' ? 'related' : scope;
            var elem = '';
            if(pale == 'self') elem = o instanceof jQuery ? o[0] : o;
            if(pale == 'related') elem = document.getElementsByClassName('clear-relation click-select');
            if(pale == 'all') elem = document.getElementsByClassName('click-select');
            var setCannotWrite = function(el){
                var _blur = 'this.blur();',
                    _onfocus = "this.placeholder='';this.blur();",
                    _placeholder = typeof el.getAttribute('placeholder') == 'undefined' ? '' : el.getAttribute('placeholder').toString().replace(/(输入|填写)/g, '选择'),
                    _onblur = typeof el.getAttribute('onblur') == 'undefined' ? '' : el.getAttribute('onblur').toString().replace(/(输入|填写)/g, '选择');
                el.classList.add('click-hand');
                el.classList.remove('click-select');
                el.setAttribute('readonly', true);
                el.removeAttribute('onfocus');
                el.setAttribute('onfocus', _onfocus);
                el.setAttribute('placeholder', _placeholder);
                el.setAttribute('onblur', _onblur);
            }
            if(elem.item) // 元素对象集合, NodeList 对象
                Array.from(elem).forEach(function(el){
                    setCannotWrite(el);
                })
            else // DOM对象
                setCanWrite(elem);  
            if(pale != 'self'){
                // 显示“如查无数据，请选择手动输入”，隐藏“取消手动输入”
                var parent = document.getElementById('btn-dropdown').parentNode;
                parent.style.display = 'none';
                tools.getPrevElement(parent).style.display = '';
            }
        }


       


    }; // END formUI
    


    //================================================================
    //                      EXTEND拓展对象
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
    }; // END net.extend



    //================================================================
    //                      工具库
    //================================================================
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
         * 光标聚焦，并移动到最后
         * 默认的调用element.focus()光标会在最前面，故需重写focus
         * @param {HTML DOM} 要聚焦的元素
         */
        setFocus: function(o){
            if (o.setSelectionRange) {
                o.focus();
                o.setSelectionRange(o.value.length, o.value.length);
            } else {
                var range = o.createTextRange(); // 创建Range对象操作文本
                range.moveStart('character', o.value.length); // 修改文档的开始节点，向后移动长度
                range.collapse(false);  // true 移动到开始, false 移动到最后
                range.select();
            }
        },


        /**
         * 在当前元素后面创建一个新元素(新元素指定class类名属性)
         * 注：该新元素的class属性命名规则和当前元素的第一个class类名一样。
            eg. 已有节点class="pp__content a b c"，新元素指定class必须包含client，则新元素的class="pp__client"
            eg. 已有节点class="pp-content a b c"，新元素指定class必须包含client，则新元素的class="pp-client"
            eg. 已有节点class="pp_content a b c"，新元素指定class必须包含client，则新元素的class="pp_client"
            eg. 已有节点class="pp a b c"，新元素指定class必须包含client，则新元素的class="client"
         * @param {HTML DOM} o 当前元素
         * @param {string} cname 指定新元素的class类名
         * @returns {HTML DOM} 返回新元素对象
         */
        createOneNextNode: function(o, cname){
            if(typeof o.className == 'undefined' ) return null;
            var tmpClassName = o.className.toString().split(' ')[0];
            var jointArr = [ '__', '_', '-' ]; // 可能的分割符组成的数组
            var indexArr = [ ]; // 分割符在字符串的位置组成的数组
            for(var i = 0; i < jointArr.length; i++){
                indexArr.push(tmpClassName.indexOf(jointArr[i]));
            }
            var index = this.getArrayMaxValue(indexArr); // 取最大值
            var jointChar = ''; // 新元素类名连接符
            for(var i = 0; i < jointArr.length; i++){
                var char = jointArr[i];
                if(tmpClassName.indexOf(char) >= 0){
                    jointChar = char;
                    break;
                }
            }
            // console.log('连字符：', jointChar);
            if(jointChar == '') jointChar = '__';
            var realClassName = tmpClassName.substr(0, index).toString().replace(/([]+)/g, '');
            // console.log('jointArr：', jointArr, '\ntmpClassName：',tmpClassName, '\nindex：', index, '\nrealClassName：', realClassName);
            var finalClassName = realClassName + ( realClassName === '' ? '' : jointChar ) + cname;
            var tempNode = document.getElementsByClassName(finalClassName)[0];
            if(tempNode == null){
                tempNode = document.createElement('div');
                tempNode.className = finalClassName;
                tempNode.className += finalClassName == cname ? '' : ' ' + cname;
                this.insertAfter(tempNode, o);
            }
            return tempNode;
        },


        /**
         * 取数组中的最大值
         * @param {array} arr 数组
         * @returns {number} 返回数组中最大的值的那个元素
         */
        getArrayMaxValue: function(arr){
            var max = arr[0];
            for(var i = 0; i < arr.length; i++){
                max = max < arr[i + 1] ? arr[i + 1] : max;
            }
            return max;
        },

        /**
         * 获取字符串对应的元素节点(供jq调用)
         * eg1. 'floor' <=> '.floor'
         * eg2. 'floor build' <=> '.floor.build'
         * @param {string} ps_str 字符串
         * @returns 返回元素节点
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
         * @param {string} ps_str 元素节点
         * @returns 返回字符串
         */
        getClassNameString: function(ps_str){
            if(ps_str.replace(/([ ]+)/g, '') === '') return '';
            var tmpStr = ps_str.toString().replace(/([\.]+)/g, ' ');
            return ps_str.indexOf('.') == 0 ? (tmpStr.substr(1, tmpStr.length)) : tmpStr;
        },


        
        /**
         * 将未知的对象转化为dom对象
         * @param {selector || Query Object || HTML DOM} o 未知的对象。几种可能的值如下：
            选择器 '.user', '#user' 
            jq对象 '.user', '#user'
            dom对象 document.getElementById('#user') 或 document.getElementsByClassName('user')
         * @returns {HTML DOM} 返回dom对象(注意不是元素集合nodeList)
         */
        anyToDomObject: function(o){
            // var str = o.toString().replace(/([\#\.]+)/g, ''); // 去掉井号#和点号.
            if(o == null) return null;
            return o instanceof jQuery ? 
                o[0] : 
                ( o.nodeName ?  // 判断是否dom对象
                    o : 
                    (
                        o.item ? // nodeList对象
                        o[0] : 
                        (   document.getElementById(o.toString().replace(/([\#\.]+)/g, '')) != null ? 
                            document.getElementById(o.toString().replace(/([\#\.]+)/g, '')) : 
                            document.getElementsByClassName(o.toString().replace(/([\#\.]+)/g, ''))[0]
                        )
                    ) 
                );
        },


        /**
         * 原生js获取子节点集合(不含孙子节点) (兼容ie6+)
         * 注：已排除文本、空格，换行符
         * @param {HTML DOM} o 当前节点
         * @returns {NodeList || null} 返回子节点集合或null
         */
        getChildElement: function(o){
            if(o == null) return null;
            var children = o.childNodes;
            for (var i = 0; i < children.length; i++) {
                var s = children[i].nodeName,
                    r = children[i].nodeValue;
                if (s == "#comment" || (s == "#text" && /\s/.test(r))) { // 排除注释节点或文本节点或空节点(空或换行)
                    o.removeChild(children[i]);
                }
            }
            return o.childNodes; // return o.children;
        },

        /**
         * 原生js获取第一个子节点 (兼容ie6+)
         * 注：已排除文本、空格，换行符
         * @param {HTML DOM} o 当前节点
         * @returns {HTML DOM || null} 返回元素对象或null
         */
         getFirstChildElement: function(o){
            if(o == null) return null;
            return o.children[0];
        },

        /**
         * 原生js获取最后一个子节点 (兼容ie6+)
         * 注：已排除文本、空格，换行符
         * @param {HTML DOM} o 当前节点
         * @returns {HTML DOM || null} 返回元素对象或null
         */
         getLastChildElement: function(o){
            if(o == null) return null;
            return o.children[o.children.length - 1];
        },


        /**
         * 原生js获取所有兄弟节点
         * @param {HTML DOM} o 当前节点
         * @returns {Array} 返回兄弟节点组成的数组
         */
        getSiblingElement: function(o) {
            var a = [];
            var p = o.parentNode.children;
            for(var i = 0, len = p.length; i< len; i++) {
                if(p[i] !== o) a.push(p[i]);
            }
            return a;
        },
            

        /**
         * 原生js获取下一个兄弟节点 (兼容ie6+)
         * 注：已排除文本、空格，换行符
         * @param {HTML DOM} o 当前节点
         * @returns {HTML DOM || null} 返回元素对象或null
         */
        getNextElement: function(o){
            if(o == null) return null;
            var e = o.nextSibling;
            if(e == null){ // 测试节点是否存在，否则返回null
                return null;
            }
            if(e.nodeType == 3){ // 如果元素为文本节点
                var two = this.getNextElement(e);
                if(two != null && two.nodeType == 1)
                    return two;
            }else{
                if(e.nodeType == 1){ // 确认节点为元素节点才返回
                    return e;
                }else{
                    return null;
                }
            }
        },


        /**
         * 原生js获取上一个兄弟节点 (兼容ie6+)
         * 注：已排除文本、空格，换行符
         * @param {HTML DOM} o 当前节点
         * @returns {HTML DOM || null} 返回元素对象或null
         */
         getPrevElement: function(o){
            if(o == null) return null;
            var e = o.previousSibling;
            if(e == null){ // 测试节点是否存在，否则返回null
                return null;
            }
            if(e.nodeType == 3){ // 如果元素为文本节点
                var two = this.getPrevElement(e);
                if(two != null && two.nodeType == 1)
                    return two;
            }else{
                if(e.nodeType == 1){ // 确认节点为元素节点才返回
                    return e;
                }else{
                    return null;
                }
            }
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
         * 删除节点下所有子节点，即清空元素内容(类似jq .empty())
         * @param {HTML DOM} o 当前节点
         */
        removeAllChildren: function(o){
            while (o.hasChildNodes()) {
                o.removeChild(o.lastChild);
            }　
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
        },

        /**
         * 判断是否手机号码(正则表达式验证)
         * @param {string} str 电话字符串
         * @param {options} 验证类型等参数组成的对象. eg. {pattern: "mobilephone"}.
         * @returns {boolean} 返回布尔值. true 是, false 否
         */
        isTel:function(str, options){
            var defaults = {
                mode: "standard", //校验模式. standard 标准模式,严格校验电话格式(默认), loose 宽松模式,只校验电话位数
                pattern: "mobilephone", //验证类型(只在mode="standard"时有效). mobilephone 只验证是否移动电话(默认), telephone 只验证是否固话, both 移动电话或固话皆可以
                bit: { //校验的电话位数(只在mode="loose"时有效)
                    from: 6, //校验6位.与to配合使用,可与to值相等
                    to: 12 //校验12位.与from配合使用,可与from值相等
                }
            }
            var settings = $.extend(true, {}, defaults, options || {});
            var mode = settings.mode,
                pattern = settings.pattern;
                bit = settings.bit;
            var from = parseInt(bit.from),
                to = parseInt(bit.to);

            var bools = false;
            if(mode == 'standard'){ //标准校验模式
                //var reg1 = /^0?1[3|4|5|7|8|9][0-9]\d{8}$/; //手机号码：13,14,15,17,18,19开头电话号码
                var reg1 = /^(0|86)?1\d{10}$/; //手机号码：11位数字. 最前面的 0是长途冠码, 86是中国区号
                var reg2 = /^((0|\+)?86(\s{1})?)?(0?\d{2,3}(\-|\s{1})?)?\d{7,8}$/; //固定电话：前面086或+86是中国区号, 中间10或010或0595是区号, 后面7-8位是号码	
                if(pattern == 'mobilephone'){ //只能移动电话
                    bools = reg1.test($.trim(str)) ? true : false;
                }
                if(pattern == 'telephone'){ //只能固话(固定电话)
                    bools = reg2.test(str) ? true : false;
                }
                if(pattern == 'both'){ //移动电话或固话
                    bools = reg1.test($.trim(str)) || reg2.test(str) ? true : false;
                }
            }else{ //宽松校验模式
                //if(str.trim().length == 11) return true; //只检验是否11位
                //if(str.trim().length <= 12 && str.trim().length >= 6) return true; //只检验是否6-12位(含固话、手机号）,不兼容ie8(若节点不存在，直接str.trim()会报错）
                if($.trim(str).length <= to && $.trim(str).length >= from) return true; //只检验是否6-12位(含固话、手机号), 兼容ie8及以下版本
            }

            return bools;
        }

    }; // END tools
    


    //================================================================
    //                      ie兼容
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
    //                      返回对象
    //================================================================
    return NeForm; 

});



/*———————————————————————————————————————————————————————————————————————————————————————————————
 *                                   二、搜索框控件(jQuery)
———————————————————————————————————————————————————————————————————————————————————————————————*/
var neuiSearchBox = {
    /**
     * 获取表单
     * @param {object} opt 参数对象 
     * @returns {html} 返回表单HTML字符串
     */
    getForm: function(opt){
        return $('body').neuiSearchBox('init', opt);
    },

    /**
     * 执行表单内部系列事件
     */
    doneEvent: function(){
        $('body').neuiSearchBox('events');
    }
};
;(function ($) {
    //================================================================
    //                      通用方法库
    //================================================================
    var methods = {

        /**
         * 初始化
         * @param {object} opt 参数对象
         */
        init: function(opt){
            var self = this;
            var defaults = {
                enableLocale: true, //是否启用本地演示数据源. true 是(默认), false 否
                source: [], //自定义数据源
            }
            var settings = $.extend(true, {}, defaults, opt || {});
            var enableLocale = settings.enableLocale,
                source = settings.source;
            if(enableLocale) source = methods.getLocaleSource();

            //HTML
            var valueHtml = '';
            var allHtml = '<div class="ne-search-form">';
            //循环
            if(Array.isArray(source)){
                
                for(var i = 0; i < source.length; i++){
                    var row = source[i];
                    var type = typeof row["type"] == 'undefined' ? 'input' : row["type"],
                        label = typeof row["label"] == 'undefined' ? '您没有填写搜索项字段item' : row["label"],
                        hid = typeof row["hid"] == 'undefined' ? '' : row["hid"];
                        value = typeof row["value"] == 'undefined' ? '' : row["value"],
                        names = typeof row["name"] == 'undefined' ? '' : row["name"],
                        aClass = typeof row["class"] == 'undefined' ? '' : row["class"],
                        readonly = typeof row["readonly"] == 'undefined' ? false : (row["readonly"] == true ? true : false),
                        placeholder = typeof row["placeholder"] == 'undefined' ? '' : row["placeholder"],
                        data = typeof row["data"] == 'undefined' ? '' : row["data"];
                    var _headClassName = '';
                    var _iconClassName = '';
                    var _mainClassName = '';
                    var _hidStr = hid == '' ? '' : ' data-bh="' + hid + '"';
                    var _readStr = readonly == true ? ' readonly' : '';
                    var _blurStr = readonly == true ? ';this.blur()' : '';
                    var _nameStr = names == '' ? '' : ' id="' + names + '"';
                    var _classStr = aClass == '' ? '' : ' class="' + aClass + '"';
                    valueHtml = [
                        '<div class="search-box-head-value"' + _hidStr + '>' + value + '</div>'
                    ].join('\r\n');

                    var _mainStr = '';
                    var _valueStr = '';
                    var _itemIdStr = ''; //搜索项元素ID标识
                    var _mainStyle = '';

                    if(type == 'input' || type == 'textarea'){ //单行或多行输入
                        _valueStr = '';
                        _headClassName = ' search-box-head-text no-border';
                        _iconClassName = ' none';
                        _mainClassName = '';
                        _itemIdStr = '';
                        _mainStyle = '';
                        if(typeof row.group != 'undefined'){ //复合型输入框
                            _mainStr += '<div class="search-box-main-group">';
                            for(var k = 0; k < row.group.length; k++){
                                var one = row.group[k];
                                var _blabel = typeof one["label"] == 'undefined' ? '' : one["label"],
                                    _bnames = typeof one["name"] == 'undefined' ? '' : one["name"],
                                    _bClass = typeof one["class"] == 'undefined' ? '' : one["class"],
                                    _bvalue = typeof one["value"] == 'undefined' ? '' : one["value"],
                                    _bplaceholder = typeof one["placeholder"] == 'undefined' ? '' : one["placeholder"],
                                    _breadonly = typeof one["readonly"] == 'undefined' ? false : (one["readonly"] == true ? true : false);
                                var _gReadStr = _breadonly == true ? ' readonly' : '';
                                var _gNameStr = _bnames == '' ? '' : ' id="' + _bnames + '"';
                                var _gClassStr = _bClass == '' ? '' : ' class="' + _bClass + '"'; 
                                var _gInputStr = '';
                                if(type == 'input'){
                                    _gInputStr = '<input type="text"' + _gNameStr + _gClassStr + ' value="' + _bvalue + '" placeholder="' + _bplaceholder + '" onblur="this.placeholder=\'' + _bplaceholder + '\'" onfocus="this.placeholder=\'\'"' + _gReadStr + '>';
                                }
                                if(type == 'textarea'){
                                    _gInputStr = '<textarea' + _gNameStr + _gClassStr + ' placeholder="' + placeholder + '" onblur="this.placeholder=\'' + placeholder + '\'" onfocus="this.placeholder=\'\'"' + _gReadStr + '>' + value + '</textarea>';
                                }
                                _mainStr += [
                                    '<div class="sgroup">',
                                        '<label>' + _blabel + '</label>',
                                        _gInputStr,
                                    '</div>'
                                ].join('\r\n');
                            }
                            
                            _mainStr += '</div><!--/.search-box-main-group-->';

                        }else{ //单个输入框
                            if(type == 'input'){
                                _mainStr += '<input type="text"' + _nameStr + _classStr + ' value="' + value + '" placeholder="' + placeholder + '" onblur="this.placeholder=\'' + placeholder + '\'" onfocus="this.placeholder=\'\'' + _blurStr + '"' + _readStr + '>';
                            }
                            if(type == 'textarea'){
                                _mainStr += '<textarea' + _nameStr + _classStr + ' placeholder="' + placeholder + '" onblur="this.placeholder=\'' + placeholder + '\'" onfocus="this.placeholder=\'\'' + _blurStr + '"' + _readStr + '>' + value + '</textarea>';
                            }
                        }
                    }

                    if(type == 'drop'){ //下拉
                        _valueStr = valueHtml;
                        _headClassName = ' search-box-head-drop';
                        _iconClassName = '';
                        _mainClassName = '';
                        _itemIdStr = _nameStr;
                        _mainStyle = '';
                    }
                    if(type == 'radio' || type == 'checkbox'){ //单选、多选
                        if(Array.isArray(data)){
                            _valueStr = valueHtml;
                            _headClassName = ' search-box-head-choose' + ( type == 'radio' ? ' search-box-head-radio' : ' search-box-head-checkbox');
                            _iconClassName = ' down';
                            _mainClassName = ( type == 'radio' ? ' search-box-main-radio' : ' search-box-main-checkbox');
                            _itemIdStr = _nameStr;
                            _mainStyle = ' style="display: none"';
                            _mainStr += '<div class="search-box-main-item">';
                            var isSingleMoreCheckCount = 0; //单选时是否有多个选中项
                            for(var k = 0; k < data.length; k++){
                                var one = data[k];
                                var _id = typeof one["id"] == 'undefined' ? '' : one["id"],
                                    _bvalue = typeof one["value"] == 'undefined' ? '' : one["value"],
                                    _checked = typeof one["checked"] == 'undefined' ? false : (one["checked"] == true ? true : false);						
                                if(type == 'radio'){ //单选时默认只能有一个选中
                                   if(_checked)  isSingleMoreCheckCount++;
                                    if(_bvalue == value) _checked = true;
                                    else _checked = _checked ? true : false;
                                    if(isSingleMoreCheckCount > 1) _checked = false;
                                }
                                
                                var _bhStr = _id == '' ? '' : ' data-bh="' + _id + '"';
                                var _className = _checked ? ' checked' : '';
                                _mainStr += '<div class="option' + _className + '"' + _bhStr + '>' + _bvalue + '</div>';
                            }
                            
                            _mainStr += '</div><!--/.search-box-main-item-->';
                        }
                    }			
                    allHtml += [
                        '<div class="search-box"' + _itemIdStr + '>',
                            '<div class="search-box-head' + _headClassName + '">',
                                '<div class="search-box-head-label">',
                                    '<label>' + label + '</label>',
                                '</div>',
                                _valueStr,
                                '<div class="search-box-head-icon' + _iconClassName + '"></div>',
                            '</div><!--/.search-box-head-->',
                            '<div class="search-box-main' + _mainClassName + '"' + _mainStyle + '>',
                                _mainStr,
                            '</div><!--/.search-box-main-->',
                        '</div><!--/.search-box-->',
                    ].join('\r\n');
                }
            }
            allHtml += '</div><!--/.ne-search-form-->';

            return allHtml;
        },


        /**
         * 默认数据源(演示用)
         * @returns {array} 返回数组对象
         */
        getLocaleSource: function(){
            /**
             * 自定义数据源参数说明：
                · type 搜索类型. input 单行输入框(默认), textarea 多行输入框, drop 下拉, radio 单选, checkbox 多选
                · label 搜索项文本
                · name 搜索项(或输入框)ID(可选)
                · class 搜索项(或输入框)Class(可选)
                · hid 	默认隐藏值(可选). 只当搜索类型为单选时有效
                · value 默认显示值(可选). 只当搜索类型为单行、多行输入、单选、下拉时有效.
                · readonly 是否只读(可选). true 是, false 否(默认)
                · placeholder 提示文字(可选). 只当搜索类型为单行、多行输入时有效.
                · group 复合型输入框,即多个输入框组合的数组(可选). 常见于开始日期、结束日期组合
                    label 文本描述(可选)
                    name 输入框ID(可选)
                    class 输入框Class(可选)
                    value 默认值(可选)
                    placeholder 提示文字(可选)
                    readonly 是否只读(可选). true 是, false 否(默认)
                · data 内层循环数组(可选). 只当搜索类型为单选、多选时有效.
                    value 显示值
                    id 隐藏值(可选)
                    checked 是否默认选中(可选), 只当搜索类型为单选或多选时有效. true 是, false 否(默认). 注意:单选时如果有多条记录是选中的,则系统会强制只有第一个选中,其它皆不选中
            */
           
            //内置演示数据源
            var arr = [
                {"type":"input", "label":"精准搜索", "name":"s-user", "placeholder":"输入会员ID搜索"},
                {"type":"textarea", "label":"备注", "name":"s-notes"},
                {"type":"input", "label":"咨询日期", "group": [
                    {"label":"自", "name":"s-startDate", "class":"nedate", "value":"2021-03-06", "placeholder":"开始日期", "readonly": true},
                    {"label":"至", "name":"s-endDate", "class":"nedate", "value":"2021-03-31", "placeholder":"结束日期", "readonly": true}
                ]},
                {"type":"drop", "label":"所在地区(下拉)", "name":"s-area" , "value":"福建省-泉州市-丰泽区"},
                {"type":"radio", "label":"职业(单选)", "name":"s-duty", "hid":"1001", "value":"白领", "data":[
                    {"id":"1000", "value":"不限"},
                    {"id":"1001", "value":"医生"},
                    {"id":"1002", "value":"教师"},
                    {"id":"1003", "value":"白领"},
                    {"id":"1003", "value":"蓝领"},
                    {"id":"1003", "value":"工人"}
                ]},
                {"type":"checkbox", "label":"年龄(多选)", "name":"s-age", "data":[
                    {"id":"1001", "value":"0-6岁", "checked": true},
                    {"id":"1002", "value":"7-16岁", "checked": true},
                    {"id":"1003", "value":"17-25岁", "checked": true},
                    {"id":"1004", "value":"26-40岁"},
                    {"id":"1005", "value":"40-50岁"},
                    {"id":"1006", "value":"50-70岁"},
                    {"id":"1007", "value":"70岁以上"},
                ]}
            ]
            return arr;
        },


        /**
         * 执行搜索框内部系列事件
         */
        events: function(){
            var elSChoosed = $('.search-box-head-choose');
            if(elSChoosed.length != 0){
                elSChoosed.on('click', function(){
                    var elSiblings = $(this).siblings('.search-box-main');
                    var elSIcon= $(this).find('.search-box-head-icon')
                    if(!elSiblings.is(':visible')){
                        elSiblings.slideDown('fast');
                        elSIcon.removeClass('down').addClass('up');
                    }else{
                        elSiblings.slideUp('fast');
                        elSIcon.removeClass('up').addClass('down');
                    }
                })
                //单选
                $('.search-box-main-radio .option').on('click', function(){
                    $(this).addClass('checked').siblings().removeClass('checked');
                })
                //多选
                $('.search-box-main-checkbox .option').on('click', function(){
                    $(this).hasClass('checked') ? $(this).removeClass('checked') : $(this).addClass('checked');
                })
            }
        }



    } //END methods


    //================================================================
    //                      对外暴露控件接口
    //================================================================
    $.fn.neuiSearchBox = function(method){
        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }else if(typeof method === 'object' || !method){
            return methods.init.apply(this, arguments);
        }else{
            $.error('Method ' + method + ' does not exist');
        }
    }
})(jQuery);