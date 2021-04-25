/**
 * [neuiSearchBox]
 * 搜索框控件
 * Version：v1.0.0
 * Author: Mufeng
 * QQ: 1614644937
 * Date: 2021.03.06
 * Update: 2021.03.23
 */
(function ($) {


    /*------------------------------------------------------------------------------------------------
    *                                       通用方法库
    ------------------------------------------------------------------------------------------------*/
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
                                _mainStr += '<input type="text"' + _nameStr + _classStr + ' value="' + value + '" placeholder="' + placeholder + '" onblur="this.placeholder=\'' + placeholder + '\'" onfocus="this.placeholder=\'\'"' + _readStr + '>';
                            }
                            if(type == 'textarea'){
                                _mainStr += '<textarea' + _nameStr + _classStr + ' placeholder="' + placeholder + '" onblur="this.placeholder=\'' + placeholder + '\'" onfocus="this.placeholder=\'\'"' + _readStr + '>' + value + '</textarea>';
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





    /*------------------------------------------------------------------------------------------------
    *                                       对外暴露控件接口
    ------------------------------------------------------------------------------------------------*/
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





//=====搜索框控件
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
}

