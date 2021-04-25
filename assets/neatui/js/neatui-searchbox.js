/**
 * [neuiSearchBox]
 * 搜索框自动动化控件
 * Author：chenMufeng
 * Date: 2019.11.01
 * Update:2020.4.20
 */

 (function($){
    $.fn.extend({
        neuiSearchBox:function(options){
            var $this = this;
            var defaults = {
                inputBox:{},
                searchButton:{}
            }
            var settings = $.extend({},defaults,options||{});

            //私有成员
            $.extend({
                searchRootElement:'.ne-searchbox', //根节点 
                textElement:'.search-text', //搜索输入框根节点
                buttonElement:'.search-button', //按钮按钮根节点
                rowElment:'.box-one', //行节点className
                colElement:'.collist', //列节点className
                colBtnElement:'.btn', //含按钮的列节点额外的className
                labelElement:'.label', //文本节点className
                boxElement:'.box', //输入框节点className
                headElement:'#header' //默认顶部header节点ID
            });

            var rootNode = $.searchRootElement,
                textNode = $.textElement,
                buttonNode = $.buttonElement,
                rowNode = $.rowElment,
                colNode = $.colElement,
                colBtnNode = $.colBtnElement,
                labelNode = $.labelElement,
                boxNode = $.boxElement,
                headNode = $.headElement;
           var  parentClassID = rootNode.replace(/#|\./g,''), //去掉井号#或点号.
                textClassId = textNode.replace(/#|\./g,''), //去掉井号#或点号.
                buttonClassId = buttonNode.replace(/#|\./g,''), //去掉井号#或点号.
                rowClassId = rowNode.replace(/#|\./g,''), //去掉井号#或点号.
                colClassId = colNode.replace(/#|\./g,''), //去掉井号#或点号.
                colBtnClassId = colBtnNode.replace(/#|\./g,''), //去掉井号#或点号.
                labelClassId = labelNode.replace(/#|\./g,''), //去掉井号#或点号.
                boxClassId = boxNode.replace(/#|\./g,''), //去掉井号#或点号.
                headClassId = headNode.replace(/#|\./g,''); //去掉井号#或点号.

            //检验节点
            if($this.length == 0){
                console.log('错误1：绑定的目标节点不存在，请检查');
				return false;
            }

            //参数
            var putInHead = typeof settings.putInHead == 'undefined' ? false : (settings.putInHead === true ? true : false); //默认false
            var inputBox = settings.inputBox,
                searchButton = settings.searchButton,
                isBtnGroupNewLine = typeof searchButton["wrap"] == 'undefined' ? true : (searchButton["wrap"] === false ? false : true), //按钮组是否换行显示,默认true
                isBtnGoupSticky = typeof searchButton["sticky"] == 'undefined' ? false : (searchButton["sticky"] === true ? true : false), //按钮组是否换行显示,默认false
                isBtnGroupJoined = typeof searchButton["compacted"] == 'undefined' ? false : (searchButton["compacted"] === true ? true : false); //按钮组是否紧接着搜索框组,默认false
            //
            var column = typeof inputBox.column == 'undefined' ? 3 : parseInt(inputBox.column);

            //样式
            var sameline = ''; //同一行时的样式
            if(!isBtnGroupNewLine) sameline = ' inline';

            //1.搜索框
            if(typeof inputBox.group == 'undefined'){
                console.log('错误2：未设置搜索框参数group，无法创建搜索框');
                return false;
            }
            var _outerHtml1 = '<div class="' + textClassId + sameline + '">' +
                             '  <div class="' + rowClassId + '">';
            $.each(inputBox.group,function(i,items){
                var title = typeof items["title"] == 'undefined' ? null : (items["title"] == '' ? null : items["title"]),
                    field = typeof items["field"] == 'undefined' ? null : (items["field"]== '' ? null : items["field"]),
                    type = typeof items["type"] == 'undefined' ? 'string' : items["type"],
                    readonly = typeof items["readonly"] == 'undefined' ? false : items["readonly"] == true ? true : false,
                    disabled = typeof items["disabled"] == 'undefined' ? false : items["disabled"] == true ? true : false,
                    width = typeof items["width"] == 'undefined' ? 'x1' : items["width"],
                    textAlign = typeof items["textAlign"] == 'undefined' ? 'left' : items["textAlign"],
                    textWidth = typeof items["textWidth"] == 'undefined' ? '' : items["textWidth"],
                    icon = typeof items["icon"] == 'undefined' ? '' : items["icon"],
                    must = typeof items["must"] == 'undefined' ? '1' : (items["must"] === true ? '1': '0'),
                    databh = typeof items["id"] == 'undefined' ? '' : items["id"],
                    value = typeof items["value"] == 'undefined' ? '' : items["value"],
                    checked = typeof items["checked"] == 'undefined' ? true : (items["checked"] === true ? true : false),
                    dates = typeof items["date"] == 'undefined' ? '' : (items["date"] == '' ? '' :  items["date"]),
                    entire = typeof items["entire"] == 'undefined' ? '' : items["entire"],
                    wrap = typeof items["wrap"] == 'undefined' ? false : (items["wrap"] === true ? true : false), //默认true
                    source = typeof items["source"] == 'undefined' ? null : items["source"],
                    format = typeof items["format"] == 'undefined' ? null : items["format"];
                if(icon.indexOf('fa-') < 0) icon = 'fa-' + icon;
                var errorTxt = '';
                if(!title) errorTxt+= '错误3：搜索框名称title不能为空\n';
                if(!field) errorTxt+= '错误4：搜索框id field不能为空\n';
                if(errorTxt!==''){
                    console.log(errorTxt);
                    return false;
                }
                var iClassName = '';
                var _iDataBh = '';
                var _iValue = '';
                var _iClass = '';
                var _iReadOnlyStr = !readonly ? '' : ' readonly="readonly"';
                var _iDisabledStr = !disabled ? '' : ' disabled="disabled"';
                var _iStyle = '';
                var _boxStr = '';
                var _dIndex = ' data-index="'+i+'"';
                var _dField = ' data-field="' + field + '"';
                var _dType = ' data-type="' + type + '"';
                var _dMust =  ' data-must="' + must + '"';
                var _dSource = '';
                var _dFormat = '';
                var _dDate = '';
                var _dEntire = '';
     
                if(type.indexOf('radio') < 0){
                    var itype = 'text';
                    //var icheckValue = ''; //checkbox时的值
                    var _icheckedStr = '';
                    var iClassName = isStrPositiveInteger(width) ? '' :  'w-x' + width.replace(/\D/g,''); //把非数字的字符过滤掉.eg. 3x 变成 3
                    var _iStyle = isStrPositiveInteger(width) ? ' style="width:'+width+'px"' : '';
                    //console.log('2-title:',title,' width:',width,' 是否正数：',isStrPositiveInteger(width))
                    if(type.indexOf('string') >= 0){
                        icon = icon != '' ? icon : 'fa-text-width';
                        _iValue = ' value="'+value+'"';
                    }
                    if(type.indexOf('checkbox') >= 0){
                        var cThemeArr = type.toString().match(/\[(.+?)\]/g); //提取中括号中的内容
                        var cShape = '', cColor = '';
                        var _cClass = '';
                        if(cThemeArr != null){
                            cShape = ' ' + cThemeArr[0].replace(/\[(.*)\]/g, '$1');
                            if(cThemeArr.length > 1) cColor = ' ' + cThemeArr[1].replace(/\[(.*)\]/g, '$1');
                            _cClass = cShape + cColor;
                        }
                        if(_cClass != '') iClassName += ' ne-checkbox' + _cClass + '';
                        else iClassName += ' original-checkbox';
                        icon = '';
                        itype = 'checkbox';
                        //icheckValue = value;
                        _icheckedStr = parseInt(value) == 1 ? ' checked="checked"' : '';
                    }
                    if(type.indexOf('drop') >= 0 || type.indexOf('react') >= 0){
                        _iDataBh = ' data-bh="'+databh+'"';
                    }
                    if(type.indexOf('drop') >= 0 || type.indexOf('react') >= 0 || type.indexOf('date') >= 0){
                        _iReadOnlyStr = ' readonly="readonly"';
                        _iValue = ' value="'+value+'"';
                        _dSource = source == null ? '' : " data-source='"+JSON.stringify(source)+"'"; //json变成字符串
                        _dEntire = entire == '' ? '' : ' data-entire="'+entire+'"';
                        //console.log('format:',format.join(","));
                        if(type.indexOf('drop') >= 0){
                            icon = icon != '' ? icon : 'fa-chevron-down';
                            _dFormat = format == null ? '' : ' data-format="'+format.join(",")+'"'; //数组转字符串
                        }
                        if(type.indexOf('react')>=0){
                            icon = icon != '' ? icon : 'fa-toggle-down';
                            //_iClass = ' class="'+type.replace(/(.*)\[(.*)\]/g,'$1 $2')+'"';
                            iClassName += ' ' + type.replace(/(.*)\[(.*)\]/g,'$1 $2');
                        }
                        if(type.indexOf('date') >= 0){
                            icon = 'fa-calendar-o';
                            _dDate = ' data-date="'+dates+'"';
                        }
                    }
                    _iClass = ' class="' + iClassName + '"';
                    var _iconStr = '<i class="fa '+icon+'"></i>';
                    _boxStr = _iconStr + '<input type="'+itype+'"'+_iClass+' id="i-s-'+field+'"' + _iReadOnlyStr + _iDisabledStr + _iValue + _iDataBh + _icheckedStr + _iStyle + '/>';

                }else{ //radio类型

                    var rThemeArr = type.toString().match(/\[(.+?)\]/g);
                    var _rClass = rThemeArr == null ? '' : ' ' + rThemeArr[0].replace(/\[(.*)\]/g, '$1'); //提取中括号中的内容
                    var _rClassStr = _rClass == '' ? '' : ' class="ne-radio' + _rClass + '"';
                    var ls_name_id = "radio-" + field + "-" + (i + 1);
                    var check_yes_text = '是',
                        check_no_text = '否';
                    if(typeof items["option"] != 'undefined'){
                        check_yes_text = items["option"][0];
                        check_no_text = items["option"][1];
                    }
                    //console.log('value:',value)
                    var _checkedYStr = value == '' ? '' : (check_yes_text==value ?  ' checked="checked"' : '');
                    var _checkedNStr = value == '' ? ' checked="checked"' : (check_no_text==value ? ' checked="checked"' : '');
                    if(_checkedYStr == _checkedNStr) _checkedNStr = ' checked="checked"';
                    _boxStr =  '     <div class="sbox-radio">' +
                                '		<input type="radio" name="' + ls_name_id + '" value="1"' + _rClassStr + ' id="' + ls_name_id + '-yes"' + _checkedYStr + _iReadOnlyStr + _iDisabledStr + '>' +
                                '		<label for="' + ls_name_id + '-yes">'+check_yes_text+'</label>' +
                                '	</div>' +
                                '	<div class="sbox-radio">' +
                                '		<input type="radio" name="' + ls_name_id + '" value="0"' + _rClassStr + ' id="' + ls_name_id + '-no"' + _checkedNStr + _iReadOnlyStr + _iDisabledStr + '>' +
                                '		<label for="' + ls_name_id + '-no">'+check_no_text+'</label>' +
                                '	</div>';
                }
                var _lbStyle = textWidth == '' ? '' : ' style="width:'+textWidth.toString().replace(/\D/g,'')+'px;"'; //去掉非数字的字符
                var _label = '<label'+_lbStyle+'>'+title+'</label>';
                var _lbStr =  '<div class="'+labelClassId+'">'+_label+'</div>';
                var _lbLStr = _lbRStr = '';
                if(textAlign=='right') _lbRStr = _lbStr;
                else _lbLStr = _lbStr;
                var _intHtml = '<div class="'+colClassId+'">' + _lbLStr + 
                            //'   <div class="'+labelClassId+'">'+_label+'</div>'+
                            '   <div class="'+boxClassId+'"' + _dIndex + _dField + _dType + _dMust + _dSource + _dFormat + _dDate + _dEntire + '>' + _boxStr + '</div>'+  _lbRStr + 
                            '</div>';
                //换行(强制换行或按指定的列数换行)
                if(wrap || (i!=0 && (i+1)%column==1&&!inputBox.group[i-1]["wrap"])){
                    _outerHtml1+='</div><div class="'+rowClassId+'">';
                }
                _outerHtml1+=_intHtml;
            })
            _outerHtml1 +='  </div>' + 
                         '</div>';
            
            //拼接节点
            $this.append('<div class="' + parentClassID + '"></div>').children().append(_outerHtml1);
            var seaHeadClass = 'ne-search-head';
            if($(headNode).length > 0) $(headNode).addClass(seaHeadClass);
            if(putInHead){
                if($(headNode).length > 0) $(headNode).prepend($(rootNode));
                else{
                    $('body').prepend('<div id="' + headClassId + '" class="' + seaHeadClass + '"></div>');
                    $(headNode).append($this);
                }
            }

            //2.搜索按钮
            if(typeof searchButton.group == 'undefined'){
                console.log('错误1：未设置搜索按钮参数group，无法创建搜索按钮');
                return false;
            }         
            var _btnHtml = '';
            $.each(searchButton.group,function(i,items){
                var title = !items["title"] ? '按钮'+(i+1) : items["title"],
                    field = !items["field"] ? 'btn_search_'+(i+1) : items["field"],
                    width = !items["width"] ? '' : parseInt(items["width"]),
                    color = !items["color"] ? '' : items["color"],
                    bgColor = !items["bgColor"] ? '' : items["bgColor"],
                    icon = !items["icon"] ? '' : items["icon"],
                    theme = !items["theme"] ? '' : items["theme"],
                    skin = !items["skin"] ? '' : items["skin"],
                    relation = !items["relation"] ? '' : items["relation"].join(','); //数组转字符串  
                var _idStr = ' id="'+field+'"';
                var _widthStr = width == '' ? '' : 'width:'+width+'px;',
                    _colorStr = color == '' ? '' : 'color:'+color+';',
                    _bgColorStr = bgColor == '' ? '' : 'background-color:'+bgColor+';';
                //var  _styleStr = theme != '' ? '' : ' style="' + _widthStr + _colorStr + _bgColorStr + '"';
				var  _style1 = theme != '' ? '' :  _colorStr + _bgColorStr;
				var _styleStr = ' style="' + _widthStr + _style1 + '"';
								
                var _iconStr = icon == '' ? '' : '<i class="fa '+icon+'"></i>';

                var _themeStr = theme == '' ? '' : theme;
                var _skinStr = skin == '' ? '' : ' ' + skin;
                var _classStr = ' class="' + _themeStr + _skinStr + '"';

                var _relationStr = relation == '' ? '' : ' data-related="'+relation+'"';
                //console.log('_colorStr:',_colorStr,'\nbgColorStr:',_bgColorStr,'\nstyleStr:',_styleStr)           
                _btnHtml += '<div class="' + colClassId + ' ' + colBtnClassId + '">' + 
                            '   <button type="button"' + _idStr + _classStr + _styleStr + _relationStr + '>'+title+'</button>' + _iconStr +
                            '</div>';
            })
            
            var _outerHtml2= '<div class="' + buttonClassId + sameline + '">' + 
                          ' <div class="' + rowClassId + '">' + _btnHtml + 
                          ' </div>' +
                          '</div>';
            //拼接节点
            $this.append(_outerHtml2);

            //按钮组置顶(放在搜索框组前面)
            if(isBtnGoupSticky) {
                $(buttonNode).addClass('foremost').insertBefore($(textNode));
            }

            //按钮组紧接着搜索框组（即按钮组紧接在搜索框组后面，不换行）
            if(isBtnGroupJoined){
                $(document).find(rootNode).children(':last-child').children(':last-child').append($(document).find(buttonNode).find(colNode).clone());
		        $(document).find(buttonNode).remove();
            }
            

            //回调
            $.each(searchButton.group,function(i,items){
				var isCheckComplete = typeof items.checkForm == 'undefined' ? true : 	(items.checkForm===false ? false : true); //是否检验表单完整性，默认true
                if(items.callback){ //回调
                    $(document).on('click', '#' + items.field, function(){
                        var returnArr = [];
                        var json1 = {} //一维json,按字段英文来
                        var json2 = {}  //一维json,按字段中文来,且json进行简化
                        json1["button"] = items.title;
                        json2["button"] = items.title;
                        json2["按钮"] = items.title;
                        var $node = $(textNode).find(colNode).not(colBtnNode);
                        for(k=0;k<$node.length;k++){
                            var $col = $node.eq(k);
                            var $lb = $col.find(labelNode).children('label');
                            var $box = $col.find(boxNode);
                            var $input = $box.children('input');
                            var datatype = $box.attr('data-type');
                            var datamust =  $box.attr('data-must');
                            var datafield = $box.attr('data-field');
                            //console.log('datatype:',datatype);
                            var prefix = '请输入';
                            var bh = "";
                            var value = '';
                            var text = $lb.text();
                            if(datatype.indexOf('string') >= 0 || datatype.indexOf('date') >= 0) value = $input.val();
                            else{
                                if(datatype.indexOf('radio') >= 0) value = $box.find('input:radio:checked').val();
                                else if(datatype.indexOf('checkbox') >= 0) value = $input.is(':checked') ? "1" : "0";
                                else if(datatype.indexOf('drop') >= 0 || datatype.indexOf('react') >= 0){
                                    prefix = '请选择';
                                    bh = typeof $input.attr('data-bh') == 'undefined' ? '' : $input.attr('data-bh');
                                    value = $input.val();
                                }else{
                                    value = $input.val();
                                }
                            }
                            var tips = prefix + text; //空项提示信息
                            var oneJson = {"title":text, field:datafield, "bh":bh, "value":value}
                            var oneJson2 = {"bh":bh, "value":value}
                            //returnArr.push(oneJson);            
                            if(typeof items.relation!='undefined'){ //关联搜索框时只返回关联的数据
                                for(m=0;m<items.relation.length;m++){
                                    if(items.relation[m] == text){
                                        if(isCheckComplete){if(!checkFormComplete(datamust,value,tips)) return false;}
                                        json1[datafield] = oneJson; //一维嵌套json
                                        json2[text] = oneJson2;
                                    }
                                }
                            }else{ //不关联搜索框时则返回所有数据
                                if(isCheckComplete){if(!checkFormComplete(datamust,value,tips)) return false;}
                                json1[datafield] = oneJson; //一维嵌套json
                                json2[text] = oneJson2;
                            }
                        }
                        //var returnJson1 = {"button":items.title, "data":returnArr};  //数组形式的json
                        //items.callback(returnJson1);
                        items.callback(json1, json2);
                    })

                    //函数：判断搜索框表单是否完整（必填项为空时则提醒之）
                    function checkFormComplete(must,value,tips){ 
                        if(must!="0" && value==''){
                            if(typeof neuiDialog!='undefined'){
                                if(typeof neuiDialog.alert === 'function'){
                                    neuiDialog.alert({
                                        caption:'提示',
                                        message:tips,
                                        buttons:["确定"]
                                    })
                                }
                            }else{
                                alert(tips);
                            }
                            return false;
                        }else{
                            return true;
                        }    
                    }
                }
            })


                  
            //4.搜索按钮与搜索框关联
            for(i=0;i<$(buttonNode).find(rowNode).length;i++){
                for(j=0;j<$(buttonNode).find(rowNode).eq(i).find(colNode).length;j++){
                    var $btnCol = $(buttonNode).find(rowNode).eq(i).find(colNode).eq(j);
                    var related = $btnCol.find('button').attr('data-related');
                    if(typeof related!='undefined'){
                        var arr = related.split(','); //字符串转数组
                        var lastText = arr[arr.length-1];
                        for(k=0;k<$(textNode).find(rowNode).length;k++){
                            for(p=0;p<$(textNode).find(rowNode).eq(k).find(colNode).length;p++){
                                var $txtCol = $(textNode).find(rowNode).eq(k).find(colNode).eq(p);
                                var lbText = $txtCol.find('label').text();
                                if(lastText == lbText){
                                    $btnCol.insertAfter($txtCol);
                                }
                            }
                        }
                    }
                }
            }



            //5.执行事件
            doneInputClickEvent(); //执行input系列事件

            //6.子函数
            function doneInputClickEvent(){
                $this.find(colNode).find(boxNode).find('input:text').each(function(){
                    var _this = $(this);
                    var parent = $(this).parents(boxNode);
                    var index = parent.attr('data-index');
                    var type = parent.attr('data-type');
                    var wenzi = parent.siblings().find('label').text();
                    //1.无须click才触发
                    if(type.indexOf('date') >= 0){
                        if(typeof neuiCalendar == 'undefined'){
                            console.log('“' + wenzi + '” 需引入日历控件');
                            return;
                        } 
                        var value = $(this).val(); //先取值
                        neuiCalendar.neDate($(this), false); //再调用日历控件
                        //if(value==''){
                            var dates = parent.attr('data-date');
                            if(dates=='当天') assignElementValue($(this),neuiCalendar.getNowtime());
                            if(dates=='本月初') assignElementValue($(this),neuiCalendar.getMonthFirstDay());
                            if(dates=='本月末') assignElementValue($(this),neuiCalendar.getMonthLastDay());
                            if(dates=='本季初') assignElementValue($(this),neuiCalendar.getQuarterStartDay());
                            if(dates=='本季末') assignElementValue($(this),neuiCalendar.getQuarterEndDay());
                            if(dates=='本年初') assignElementValue($(this),neuiCalendar.getYearFirstDay());
                            if(dates=='本年末') assignElementValue($(this),neuiCalendar.getYearLastDay());
                            if(dates=='本年度') assignElementValue($(this),neuiCalendar.getYear());
                            if(dates=='本月份') assignElementValue($(this),neuiCalendar.getMonth());
                            if(dates=='本日') assignElementValue($(this),neuiCalendar.getDay());
                        //}
                    }
                    //2.需要click才触发
                    _this.on('click',function(){
                        var source = typeof parent.attr('data-source') == 'undefined' ? {} : JSON.parse(parent.attr('data-source')); //json字符串转成json
                        var format = typeof parent.attr('data-format') == 'undefined' ? '' : parent.attr('data-format').split(','); //字符串转数组
                        if(type.indexOf('drop') >= 0){
                            if(typeof neuiDropdown == 'undefined'){
                                console.log('“' + wenzi + '” 需引入下拉控件');
                                return;
                            } 
                            var entire = typeof parent.attr('data-entire') == 'undefined' ? '' : parent.attr('data-entire');
                            neuiDropdown({
                                entire: entire,
                                json:source,
                                format:format,
                                callback: function(e){
                                    if(inputBox.group[index].callback){
                                        inputBox.group[index].callback(e);
                                    }
                                }
                            },_this)
                        }
                        if(type.indexOf('react')>=0){
                            if(typeof neuiDropdown == 'undefined'){
                                console.log('“' + wenzi + '” 需引入下拉控件');
                                return;
                            }
                            var entire = typeof parent.attr('data-entire') == 'undefined' ? '' : parent.attr('data-entire');
                            var $provinceObj = $this.find('.react.province'),
                                $cityObj = $this.find('.react.city'),
                                $countyObj = $this.find('.react.county');
                            var region = '';
                            if(type.indexOf('province')>=0) region = 'province';
                            if(type.indexOf('city')>=0) region = 'city';
                            if(type.indexOf('county')>=0) region = 'county';
                            neuiDropdown({
                                entire: entire,
                                react:true,
                                region:region,
                                json:source,
                                relatedNode:{"province":$provinceObj, "city":$cityObj, "county":$countyObj},
                                callback: function(e){
                                    if(inputBox.group[index].callback){
                                        inputBox.group[index].callback(e);
                                    }
                                }
                            },_this)
                        }
                    })
                })

            } //END FUNCTION




            /**
             * 检测字符串是否正整数（不包括零）
             * true 是， false 否
             * eg. 3 和 '3' 都是正整数
             * @param {*} str 
             */
           function isStrPositiveInteger(str){
                var reg = /^\+?[1-9][0-9]*$/;
                if(reg.test(str)) return true;
                else return false;
            }
    

            /**
             * 取某个元素的值
             * @param {*} obj 元素jq对象
             */
            function getElementValue(obj){
                var tagname = obj[0].tagName.toLocaleLowerCase();
                var isInput = true;
                if(tagname!='input' && tagname!='area') isInput = false;
                return isInput ? obj.val() : obj.text();
            }

            /**
             * 给某个元素赋值
             * @param {*} obj 元素jq对象
             * @param {*} value 要赋的值
             */
            function assignElementValue(obj,value){
                var tagname = obj[0].tagName.toLocaleLowerCase();
                var isInput = true;
                if(tagname!='input' && tagname!='area') isInput = false;
                isInput ? obj.val(value) : obj.text(value);
            }
             
        }
    });
 })(jQuery);
 