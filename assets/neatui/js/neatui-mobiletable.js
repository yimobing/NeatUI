/**
* [neuiMobileTable] 
* 移动端表格控件
* author: ChenMufeng
* Date: 2020.05.26
* Update: 2025.11.10
*/

/* 
* 获取文本长度（单位:px)
* 思路：直接在String的原型中添加获取文字宽度的函数
* 主要思路是添加一个隐藏的标签(eleLenRuler)，每次对该标签赋值后，通过获取该标签的长度来获取文字宽度。需要注意的是，只有已经被添加到DOM中的标签才能获取长度。
* @param fontStr 字体大小. eg1.14px, eg2.16px 
* eg1. var len = $('#input').val().keyboardVisualLength();
* eg2. var len = $('#input').val().keyboardVisualLength('18px');
*/
String.prototype.keyboardVisualLength = function(fontStr) {
	//根据屏幕分辨率判断当前网页字体大小 add 20180509-1
	var w = $(window).width();
	var size = '16px';
	if(typeof(fontStr)!='undefined'){
		size = fontStr;
	}else{
		if(w<=360&&w>=320) size='12px';
		if(w>360&&w<400) size='14px';
		if(w>=400) size='14.93333px';
		if(w>=414) size='14.70px';
		if(w>=480) size='17.92px';
	}

	var node = '#eleLenRuler';
	var _str = '<span id="'+node.replace('#','').replace('.','')+'" style="visibility: hidden;white-space:nowrap;font-size:'+size+'"></span>'; //font-size大小也会影响文字宽度(一般网页默认字体大小为16px) edit 20180509-1
	if($(node).length==0) $('body').append(_str);
	$(node).text(this);
	return $(node)[0].offsetWidth;
}


var defaultEle = '.ne-mobileTable'; //默认表格拼接节点

var neuiMobileTable = {
	/**
	 * 创建系统表格
	 * 	@param {json} dataSource 表格行数据JSON
	 * @param {array} frozenJson 固定表头列JSON。无固定表头列时，传空数组，即 frozenJson = {}
	 * @param {json} scrollSource 数据表头列JSON
	 * @param {json} configureSource 自定义配置JSON(可缺省)
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 */
	createTable:function(dataSource, scrollSource, frozenJson, configureSource, domEle){
		/**
		 * data-* 说明
		 * data-mark="omit" 代表该行、列或元素可省略(保存、删除时可排除这些数据)
		 * data-nature="sub" 代表合计行或合计值元素
		 * data-hand="yes" 代表这是手动空行记录（可人为创建的，要删除之）
		 */
		var _this = this;
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		var _allHTML = [
			'<div class="grid grid-frozen frozen">',
				'<table class="table">',
					'<thead class="thead">',
					'</thead>',
					'<tbody class="tbody">',
					'</tbody>',
				'</table>',
			'</div><!--/.grid-->',
			'<div class="grid grid-regular regular">',
				'<table class="table">',
					'<colgroup class="colgroup"></colgroup>',
					'<thead class="thead">',
					'</thead>',
					'<tbody class="tbody">',
					'</tbody>',
				'</table>',
			'</div><!--/.grid-->'
		];

		var noDataHtml = '<div class="no-data-tips">抱歉，查无数据..</div>';
		var nodeBorderClassName = 'child-no-empty';

		if(typeof dataSource.data != 'undefined'){
			
			if(dataSource.data.length > 0){
				$(node).empty().append(_allHTML.join('\r\n'));
				$(node).removeClass(nodeBorderClassName).addClass(nodeBorderClassName);
			}else{
				$(node).removeClass(nodeBorderClassName).empty().append(noDataHtml);
			}
		}
		else{
			$(node).removeClass(nodeBorderClassName).empty().append(noDataHtml);
			//alert('列表数据JSON不含data属性，请检查！');
			return;
		}

		//---- ----
		var keyArr = typeof scrollSource.primaryKey == 'undefined' ? [] : scrollSource.primaryKey; //主键数组
		var discoloration = typeof scrollSource.discoloration == 'undefined' ? false : (scrollSource.discoloration == true ? true : false); //是否隔行变色,默认false
		var isCeilLine = typeof scrollSource.isCeilLine == 'undefined' ? true : (scrollSource.isCeilLine == false ? false : true); //是否有边线,默认true
		if(discoloration) $(node).find('.tbody').addClass('two-line-bg-color');
		if(!isCeilLine) $(node).find('.tbody').addClass('ceil-no-border');

		//---- ----
		var hasHandRow = false; //是否手动空行记录
		var dataAttrHand = ''; 
		//当数据为空时,先手动创建一行空记录,以便后面点[增加]按钮时可以使用clone复制上的一行数据
		if(typeof dataSource.data == 'undefined') dataSource["data"] = [];
		if(dataSource.data.length == 0){
			var emptyJson = {}
			for(var j = 0; j < keyArr.length; j++){
				var field = keyArr[j];
				emptyJson[field] = '';
			}
			for(var j = 0; j < scrollSource.columns.length; j++){
				var one = scrollSource.columns[j];
				var field = one.field;
				emptyJson[field] = '';
			}
			var emptySource = {data:[emptyJson]} 
			dataSource = emptySource;
			//console.log('emptySource:', emptySource);
			hasHandRow = true;
		}
		if(hasHandRow) dataAttrHand = ' data-hand="yes"';
		

		//----自定义的列（如选择、序号、操作等）----
		var settings = {}
		var isCheckedCol = true, //是否有选择列
			isOrderCol = true; //是否有序号列
		var operationArr = []; //操作列按钮
		var operationWidth = 50; //操作列宽度
		if(typeof configureSource != 'undefined'){
			if(!$.isEmptyObject(configureSource)){
				isCheckedCol = configureSource.check;
				isOrderCol = configureSource.order;
				if(typeof isCheckedCol == 'undefined') isCheckedCol = true;
				if(typeof isOrderCol == 'undefined') isOrderCol = true;
				if(typeof configureSource.operate != 'undefined'){
					operationArr = configureSource.operate.buttons;
					operationWidth = configureSource.operate.width;
					if(typeof operationArr == 'undefined') operationArr = [];
					if(typeof operationWidth == 'undefined') operationWidth = 50;
					operationWidth = operationWidth.toString().replace(/[^\d]/g, '');
				}
			}
		}

		//----固定表格----
		var frozenWidth = ''; //固定表格宽度
		var fHeadHtml = '<tr>';
		var fBodyHtml = '';
		var fBodyArr = []; //二维数组.eg. [['你好','中国'], ['欢迎', '我家'], ['来到', '做客']]
		//·自定义的列（如选择、序号等）表头部分----
		if(isCheckedCol) fHeadHtml += '<th>选择</th>';
		if(isOrderCol) fHeadHtml += '<th>序号</th>';
		if(typeof frozenJson.columns != 'undefined'){
			frozenWidth = typeof frozenJson.width == 'undefined' ? '' : frozenJson.width.toString().replace(/[^\d]/g, '');
			for(var i = 0; i < frozenJson.columns.length; i++){ //固定列头的列
				var item = frozenJson.columns[i];
				var title = item.title;
				fHeadHtml += '<th>' + title + '</th>';
				var arr = [];
				for(var j = 0; j < item.rows.length; j++){
					var rowname = item.rows[j];
					//fBodyHtml += '<tr>';
					//fBodyHtml += '<td>' + rowname + '</td>';
					//fBodyHtml += '</tr>';
					var html = '<td>' + rowname + '</td>';
					arr.push(html);
				}
				fBodyArr.push(arr);
			}

			//将二维数组合并成一维数组.
			//eg. 将[['你好','中国'], ['欢迎', '我家'], ['来到', '做客']] 变成 ['你好欢迎来到', '中国我家做客']
			if(frozenJson.columns.length > 0){
				var newArr = []; //一维数组
				if(typeof frozenJson.columns[0].rows != 'undefined'){
					var arrLen = frozenJson.columns[0].rows.length;
					var tempArr = new Array(arrLen);
					for(var k = 0; k < arrLen; k++){
						tempArr[k] = '';
					}
					for(var i = 0; i < fBodyArr.length; i++){
						var arr = fBodyArr[i];
						for(var j = 0; j < arr.length; j++){
							tempArr[j] += arr[j];
							if(i == fBodyArr.length - 1) newArr.push(tempArr[j]);
						}
					}
					//console.log('newArr', newArr);
					for(var i = 0; i < newArr.length; i++){
						fBodyHtml += '<tr>' + newArr[i] + '</tr>';
					}
				}
			}
		}




		//·自定义的列（如选择、序号等）表身部分
		var preBodyArr = [];
		$.each(dataSource.data, function(i, item){
			var xuhao = i + 1;
			if(hasHandRow) xuhao = 0;
			var html = '<tr' + dataAttrHand + '>';
			if(isCheckedCol) html += '<td class="center" data-mark="check"><input type="checkbox" class="meui-checkbox square-tick green"></td>';
			if(isOrderCol) html += '<td class="left" data-mark="order">' + xuhao + '</td>';
			html += '</tr>';
			//console.log('html1:', html);
			preBodyArr.push(html);
		})
		fHeadHtml +='</tr>';
		

		//----可移动表格----
		//表身主体数据
		var rGroupHtml = '';
		var rHeadHtml = '<tr>';
		var rBodyHtml = '';
		var totalJson = {}
		$.each(dataSource.data, function(i, item){ //行循环
			var xuhao = i + 1; //行号
			var keyStr = ''; //键值
			for(var k = 0; k < keyArr.length; k++){
				keyStr += item[keyArr[k]] + ',';
			}
			keyStr = keyStr.substr(0, keyStr.lastIndexOf(','));
			rBodyHtml += '<tr data-key="' + keyStr + '"' + dataAttrHand + '>';
			for(var j = 0; j < scrollSource.columns.length; j++){ //列循环
				var one = scrollSource.columns[j];
				var title = one.title,
					field = one.field,
					mode = typeof one.mode == 'undefined' ? 'input' : one.mode,
					type = typeof one.type == 'undefined' ? 'string' : one.type,
					width = typeof one.width == 'undefined' ? '' : parseFloat(one.width),
					height = typeof one.height == 'undefined' ? '' : parseFloat(one.height),
					digit = typeof one.digit == 'undefined' ? '' : parseInt(one.digit),	
					readonly = typeof one.readonly == 'undefined' ? false : one.readonly == true ? true : false, //默认false
					disabled = typeof one.disabled == 'undefined' ? false : one.disabled == true ? true : false, //默认false
					visible = typeof one.visible == 'undefined' ? true : one.visible == false ? false : true, //默认true
					bgWhite = typeof one.bgWhite == 'undefined' ? false : one.bgWhite == true ? true : false, //默认false
					rUnit = typeof one.r_unit == 'undefined' ? '' : one.r_unit,
					align = typeof one.align == 'undefined' ? '' : one.align,
					display = typeof one.display == 'undefined' ? '' : one.display;
			
				var rUnitWidth = rUnit == '' ? 0 : rUnit.keyboardVisualLength('12px'); //右侧单位宽
				var textboxWidth = rUnitWidth > 0 ? (width == '' ? '' : width - rUnitWidth) : '';
				//var _textboxWidthStr = textboxWidth == '' ? '' : ' width:' + textboxWidth + 'px;'; //输入框宽
				var _textboxWidthStr = '';
				//console.log('width:', width, '-runitWidth:', rUnitWidth)
				

				//var _widthStr = width == '' ? '' : ' min-width:' + width + 'px;';
				var _widthStr = width == '' ? '' : 'width:' + width + 'px;';
				
				
				var _visibleStr = visible ? '' : ' display:none;';
				var _readonlyStr = !readonly ? '' : ' readonly="readoly"';
				var _disabledStr = !disabled ? '' : ' disabled="disabled"';
				var _runitStr = rUnit == '' ? '' : '<em class="r-unit">' + rUnit + '</em>';
				var _classStr = !bgWhite ? '' : ' bg-white';
				var _cellClassStr = align == '' ? '' : ' class="' + align + '"';

				var _styleStr = ' style="' + _visibleStr + _widthStr + '"';

				//单元格值
				var value = item[field];
				if(digit != '') value = (value == '' ? 0 : parseFloat(value).toFixed(2));


				//单元格类型判断
				if(type.indexOf('decimal') >= 0){ //小数（要转百分数）
					value = _this.decimal2Percent(value, 'round', digit).toString().replace('%', '');
				}
				var _dButtonDom = '';
				var _texboxVisibleStr = ''; //是否可见
				var _textHeightStr = ''; //高
				if(type.indexOf('button') >= 0){ //按钮类型
					_texboxVisibleStr = ' display:none;'; //输入框就不显示
					var dBtnName = '',
						dBtnZero = '',
						dBtnNoneZero = '',
						dBtnEmpty = '',
						dBtnText = '';
					var btnShowText = '';
					if(display != ''){
						dBtnName = typeof display["name"] == 'undefined' ? 'btn-freedom' : display["name"];
						dBtnZero = typeof display["zero"] == 'undefined' ? '是' : display["zero"];
						dBtnNoneZero = typeof display["nonezero"] == 'undefined0' ? '否' : display["nonezero"];
						dBtnEmpty = typeof display["empty"] == 'undefined' ? '' : display["empty"];  //第2优先权
						dBtnText = typeof display["text"] == 'undefined' ? '' : display["text"]; //第1优先权
						if(dBtnText == ''){ //
							if(parseInt(value) == 0) btnShowText = dBtnZero;
							if(parseInt(value) != 0) btnShowText = dBtnNoneZero;
							if(value == '') btnShowText = dBtnEmpty == '' ? '按钮' : dBtnEmpty;
						}else{
							btnShowText = dBtnText;
						}
					}
					_dButtonDom = '<button type="button" class="' + dBtnName + '">' + btnShowText + '</button>';
				}
				if(type.indexOf('bool') >= 0){ //布尔类型
					var yesText  = '是', noText = '否';
					if(display != ''){
						noText = typeof display["zero"] == 'undefined' ? '否' : display["zero"];
						yesText = typeof display["nonezero"] == 'undefined' ? '是' : display["nonezero"];
					}	
					if(parseInt(value) == 1) value = yesText;
					else value = noText;
				}

				var _dRadioDom = '';
				if(type.indexOf('radio') >= 0){ //单选类型
					_texboxVisibleStr = ' display:none;'; //输入框就不显示
					var _rCheckedYesStr = parseInt(value) == 1 ? ' checked="true"' : '',
						_rCheckedNoStr =  parseInt(value) == 1 ? '' : ' checked="true"';
					var yesText = '是', noText = '否';
					var yesValValue = '1', noValValue = '0';
					var nameText = 'sex'; //radio组的name属性
					if(display != ''){
						noText = typeof display["zero"] == 'undefined' ? '否' : display["zero"];
						yesText = typeof display["nonezero"] == 'undefined' ? '是' : display["nonezero"];
						noValValue = typeof display["zeroValue"] == 'undefined' ? '0' : display["zeroValue"];
						yesValValue = typeof display["nonezeroValue"] == 'undefined' ? '1' : display["nonezeroValue"];
						nameText = typeof display["name"] == 'undefined' ? 'sex' : display["name"];
						value = parseInt(value) == 1 ? yesValValue : noValValue; //重新给输入框赋值
					}
					_dRadioDom = '<div class="m-radio-group">' + 
										'<div class="radio green">'+
											'<input type="radio" name="' + nameText + '-' + xuhao + '" id="t-' + nameText + '-yes-' + xuhao + '" value="' + yesValValue + '"' + _rCheckedYesStr + '>'+
											'<label for="t-' + nameText + '-yes-' + xuhao + '">' + yesText + '</label>'+
										'</div>'+
										'<div class="radio green">'+
										'	<input type="radio" name="' + nameText + '-' + xuhao + '" id="t-' + nameText + '-no-' + xuhao + '" value="' + noValValue + '"' + _rCheckedNoStr + '>'+
										'	<label for="t-' + nameText + '-no-' + xuhao + '">' + noText + '</label>'+
										'</div>'+
									'</div>';
					
				}
				if(mode.indexOf('none') < 0 && mode.indexOf('input') < 0){ //无标签、input标签时不设置单元格高
					_textHeightStr = ' height:' + height + 'px;';
				}


				//最后设置输入框style属性
				//var _texboxStyle = ' style="' + _widthStr + _texboxVisibleStr + '"'; 
				var _texboxStyle = ' style="' + _texboxVisibleStr + _textHeightStr + _textboxWidthStr + '"'; //输入框样式
				
				
				//单元格colgroup节点
				rGroupHtml += '<col style="' + _widthStr + '"></col>';

				//单元格td节点
				var _textboxAttrStr = ' class="i-e-' + field + _classStr + '" data-field="'+ field + '" data-type="'+ type + '"' + _texboxStyle + _readonlyStr + _disabledStr;
				//console.log('_textboxAttrStr:', _textboxAttrStr);
				var _textboxEleStr = '';
				if(mode == 'none') _textboxEleStr = value;
				if(mode == 'input') _textboxEleStr = '<input type="text" value="'+ value + '"' + _textboxAttrStr + '>';
				if(mode == 'textarea') _textboxEleStr = '<textarea' + _textboxAttrStr + '>'+ value + '</textarea>';
				if(mode == 'span') _textboxEleStr = '<span' + _textboxAttrStr + '>'+ value + '</span>';
				rBodyHtml += '<td data-field="'+ field + '"'+ _cellClassStr + _styleStr +'>'+ 
								//'<input type="text" value="'+ value + '" class="i-e-' + field + _classStr + '" data-field="'+ field + '" data-type="'+ type + '"' + _texboxStyle + _readonlyStr + _disabledStr + '>'+
								_textboxEleStr + 
								_runitStr + 
								_dButtonDom +
								_dRadioDom + 
							'</td>';
				//单元格th表头节点
				if(i == 0) {
					rHeadHtml += '<th'+ _styleStr +'>' + title + '</th>';
				}
			} //end 列循环
			//自由列
			if(i == 0){
				if(operationArr.length > 0) rHeadHtml += '<th style="width:' + operationWidth + 'px">操作</th>';
			}
			if(operationArr.length > 0){ //操作按钮组
				rBodyHtml += '<td class="center" style="width:' + operationWidth + 'px">';
				for(var k = 0; k < operationArr.length; k++){
					var json = operationArr[k];
					var btTitle = json.title,
						btClass = json.name;
					rBodyHtml += '<button type="button" class="'+ btClass + '">' + btTitle + '</button>';
				}			
				rBodyHtml += '</td>';
			}
			rBodyHtml += '</tr>';
		}) //end 行循环
		rHeadHtml += '</tr>';


		if(dataSource.data.length >= 2){
			//·创建合计行
			var totalArr = [];
			var rUnitArr = [];
			var alignArr = [];
			var hasSubRow = false; //是否有合计行
			for(var j = 0; j < scrollSource.columns.length; j++){
				var one = scrollSource.columns[j];
				var isSub = typeof one.subTotal == 'undefined' ? false : (one.subTotal == true ? true : false);
				if(isSub){
					hasSubRow = true;
					break;
				}
			}
			var numericReg = /^[\-\.0-9]+$/; //验证是否数值类型
			for(var j = 0; j < scrollSource.columns.length; j++){ //循环列
				var one = scrollSource.columns[j];
				var field = one.field;
					rUnit = typeof one.r_unit == 'undefined' ? '' : one.r_unit,
					align = typeof one.align == 'undefined' ? '' : one.align;
				var amountVal = 0;
				$.each(dataSource.data, function(i, item){
					var value = item[field];
					if(numericReg.test(value)) amountVal += (value == '' ? 0 : parseFloat(value));
					else amountVal = '';
				})
				totalArr.push(amountVal);
				rUnitArr.push(rUnit);
				alignArr.push(align);
			}
			if(hasSubRow){
				var colspan = 1;
				if(isCheckedCol) colspan++;
				if(isOrderCol) colspan++;
				fBodyHtml += '<tr data-mark="omit" data-nature="sub">'+
								'<td class="td-heji" colspan="' + colspan + '">合计</td>'+
							'</r>';
				rBodyHtml += '<tr data-mark="omit" data-nature="sub">';
				for(var j = 0; j < scrollSource.columns.length; j++){
					var one = scrollSource.columns[j];
					var digit = typeof one.digit == 'undefined' ? '' : parseInt(one.digit),
						isSub = typeof one.subTotal == 'undefined' ? false : (one.subTotal == true ? true : false),
						visible = typeof one.visible == 'undefined' ? true : one.visible == false ? false : true; //默认true
					var value = totalArr[j] == '' ? '' : digit == '' ? totalArr[j] : (totalArr[j] == '' ? 0 : parseFloat(totalArr[j]).toFixed(digit));
					var _runitStr = rUnitArr[j]  == '' ? '' : '<em class="r-unit">' + rUnitArr[j] + '</em>';
					var _cellClassStr = alignArr[j] == '' ? '' : ' ' + alignArr[j];
					var _styleStr = visible ? '' : ' style="display:none"';
					if(isSub){
						rBodyHtml += '<td class="td-heji' + _cellClassStr + '"' + _styleStr + '>'+
									'<input type="text" value="' + value + '" data-mark="omit" data-nature="sub" disabled>'+ _runitStr +
								'</td>';
					}else{
						rBodyHtml += '<td class="td-heji' + _cellClassStr + '"' + _styleStr + '></td>';
					}
				}
				rBodyHtml += '</tr>';
			}
		}

		//----拼接节点----
		$(node).find('.grid-frozen .thead').append(fHeadHtml);
		$(node).find('.grid-frozen .tbody').append(fBodyHtml);
		//$(node).find('.grid-regular .colgroup').append(rGroupHtml);
		$(node).find('.grid-regular .thead').append(rHeadHtml);
		$(node).find('.grid-regular .tbody').append(rBodyHtml);


		//----拼接自定义的列(如选择、序号等)----
		if(typeof frozenJson.columns != 'undefined'){
			if(frozenJson.columns.length > 0){
				$(node).find('.grid-frozen .tbody>tr:not([data-mark="omit"])').each(function(i){
					var html = preBodyArr[i].toString().replace('<tr>', '').replace('</tr>', '');
					$(this).prepend(html);
					//console.log('xxx'); 
				})
			}else{
				$(node).find('.grid-frozen .tbody').prepend(preBodyArr.join('\r\n'));
			}
		}else{
			$(node).find('.grid-frozen .tbody').prepend(preBodyArr.join('\r\n'));
			//console.log('yyy');
		}

		//----没有固定表头列JSON时，有合计行和没合计行时作特殊处理----
		if($(node).find('.grid-frozen .tbody>tr[data-mark="omit"]').length > 0){
			$(node).find('.grid-frozen .thead>tr').each(function(){
				if($(this).children().length == 0){
					$(this).append('<th></th>');
				}
			})
			$(node).find('.grid-frozen .tbody>tr:not([data-mark="omit"])').each(function(){
				if($(this).children().length == 0){
					$(this).append('<td></td>');
				}
			})
		}



		//----隐藏手动空行记录----
		$(node).find('.grid-frozen .tbody>tr[data-hand="yes"]').hide();
		$(node).find('.grid-regular .tbody>tr[data-hand="yes"]').hide();


		//----设置固定表格最大宽度----
		if(!isNaN(frozenWidth)) {
			$(node).find('.grid-frozen').css('max-width', frozenWidth + 'px');
		}

		//----设置单元格高----
		$(node).find('.grid-regular .thead>tr').each(function(i){ //表头单元格
			var index = i;
			var tdHeightArr = [];
			$(node).find('.grid-frozen .thead>tr').eq(index).find('th').each(function(){
				var h = $(this).outerHeight(true);
				tdHeightArr.push(h);
			})
			$(this).find('th').each(function(){
				var h = $(this).outerHeight(true);
				tdHeightArr.push(h);
			})
			var max = tdHeightArr[0];
			for(var i = 1; i < tdHeightArr.length; i++){
				var cur = tdHeightArr[i];
				cur > max ? max = cur : null;
			}
			$(this).find('th').css('height', max);
			$(node).find('.grid-frozen .thead>tr').eq(index).find('th').css('height', max);
		})

		$(node).find('.grid-regular .tbody>tr').each(function(i){ //表身单元格
			var index = i;
			$(this).find('td').each(function(){ //如果单元格中任何子元素
				if($(this).children('span, input, textarea').length == 0) $(this).css('padding', '5px 8px');
			})
			var tdHeightArr = [];
			$(node).find('.grid-frozen .tbody>tr').eq(index).find('td').each(function(){
				var h = $(this).outerHeight(true);
				tdHeightArr.push(h);
			})
			$(this).find('td').each(function(){
				var h = $(this).outerHeight(true);
				tdHeightArr.push(h);
			})
			var max = tdHeightArr[0];
			for(var i = 1; i < tdHeightArr.length; i++){
				var cur = tdHeightArr[i];
				cur > max ? max = cur : null;
			}
			$(this).find('td').css('height', max);
			$(node).find('.grid-frozen .tbody>tr').eq(index).find('td').css('height', max);
		})
		
		//----输入事件----
		this.inputEvent(node);
		//----RADIO单选事件----
		this.radioEvent(node);
	},


	/**
	 * 检验是否苹果或谷歌内核浏览器
	 * @return {Boolean} 返回值： true 是, false 否
	 */
	checkWebkitBrowser:function(){
		return navigator.userAgent.indexOf('AppleWebKit') >= 0 ? true : false;
	},

	/**
	 * 输入事件
	 * @param {*} node 根节点
	 */
	inputEvent:function(node, obj){
		var _this = this;
		$(node).find('.grid-regular .tbody input:text').on('input',function(){
			var value = $(this).val();
			var dataType = $(this).attr('data-type');
			var reg = ''; //正则
			if(dataType.indexOf('decimal') >= 0){
				reg = /[^\d\.\-]/g; //小数：只允许数字、小数点、负数
				if(dataType.indexOf('positive') >= 0) reg = /[^\d\.]/g; //正小数：只允许数字、小数点
				if(dataType.indexOf('negative') >= 0) reg = /[^\d\.\-]/g; //负小数：只允许数字、小数点、负号
			}
			if(dataType.indexOf('int') >= 0) {
				reg = /[^\d\-]/g; //整型：只允许数字、负号
				if(dataType.indexOf('positive') >= 0) reg = /[^\d]/g; //正整型：只允许数字
				if(dataType.indexOf('negative') >= 0) reg = /[^\d\-]/g; //负整型：只允许数字、负号
			}
			if(dataType.indexOf('float') >= 0)  {
				reg = /[^\d\-\.]/g; //浮点型：只允许数字、小数点、负号
				if(dataType.indexOf('positive') >= 0) reg = /[^\d\.]/g; //正浮点型：只允许数字、小数点
				if(dataType.indexOf('negative') >= 0) reg = /[^\d\-\.]/g; //负浮点型：只允许数字、小数点、负号
			}
			if(dataType != 'string' && dataType != 'radio'){ //数值类型时限制输入内容
				value = value.toString().replace(reg,'');
				if(dataType.indexOf('negative') >= 0){ //只允许输入负数时,强制在最前面添加负号
					if(value != '' && value != 0) value = '-' + value;
				}
				value = _this.repeatedChar(value, '.'); //只保留一个小数点
				value = _this.repeatedChar(value, '-'); //只保留一个负号
				value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; //把负号提到最前面
				$(this).val(value);	
			}
		})
	},

	/**
	 * RADIO单选事件
	 * @param {*} node 根节点
	 */
	radioEvent:function(node){
		$(node).find('.grid-regular .tbody input:radio').on('change',function(){
			var rname = $(this).attr('name');
			var value = $('input:radio[name="' + rname + '"]:checked').val();
			//console.log('abc' + value);
			$(this).parents('.m-radio-group').siblings('input:text').val(value); //给输入框赋值
		})
	},




	/**
	 * 全选
	 */
	selectAll:function(){
		var cb = $('.grid-frozen input:checkbox');
        cb.prop('checked', true);
	},

	/**
	 * 全不选
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 */
	selectNone:function(domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		var cb = $(node).find('.grid-frozen input:checkbox');
		cb.prop('checked', false);
	},

	/**
	 * 反选
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 */
	selectReverse:function(domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		$(node).find('.grid-frozen input:checkbox').each(function(){
			if($(this).prop('checked')) $(this).prop('checked', false);
			else $(this).prop('checked', true);
		})
	},

	/**
	 * 增加一行
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 */
	addOneRow:function(domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		//----复制固定表格行----
		var trCount1 = $(node).find('.grid-frozen .tbody>tr').length;
		var ignoreCount1 = $(node).find('.grid-frozen .tbody>tr[data-mark="omit"]').length;
		var copyObj1 = $(node).find('.grid-frozen .tbody>tr').eq(trCount1 - ignoreCount1 - 1);
		var html1 = copyObj1.clone(); //克隆一行
		var xuhao = parseInt(html1.find('td[data-mark="order"]').text()) + 1; //新行的序号
		html1.find('td[data-mark="order"]').text(parseInt(xuhao))
		if(typeof html1.attr('data-hand') != 'undefined') { //移除隐藏的空行
			html1.prev().remove(); //移除前一行
			html1.removeAttr('data-hand');
		}
		if(!html1.is(':visible')) html1.show();
		html1.insertAfter(copyObj1); //插入到最后一行后面

		//----复制可移动表格行----
		var trCount2 = $(node).find('.grid-regular .tbody>tr').length;
		var ignoreCount2 = $(node).find('.grid-regular .tbody>tr[data-mark="omit"]').length;
		var copyObj2 = $(node).find('.grid-regular .tbody>tr').eq(trCount2 - ignoreCount2 - 1);
		var html2 = copyObj2.clone(); //克隆一行
		//清空原有值,或设置默认值
		/*html2.find('input:text').each(function(i){
			var dataType = $(this).attr('data-type');
			if(dataType == 'radio') $(this).val(0); //radio值默认0
			else $(this).val(''); 
		})*/
		html2.find('input:text').val(''); //清空原有值
		if(typeof html2.find('input:text').attr('data-bh') != 'undefined')
			html2.find('input:text').attr('data-bh', '');
		if(typeof html2.find('input:text').parents('tr').attr('data-key') != 'undefined')
			html2.find('input:text').parents('tr').attr('data-key', '');
		html2.find('.m-radio-group>div').each(function(i){ //radio类型
			var name = $('input:radio', this).attr('name').toString().replace(/[\d]/g, ''),
				id = $('input:radio', this).attr('id').toString().replace(/[\d]/g, '');
			$('input:radio', this).attr({'name': name + xuhao, 'id': id + xuhao});
			if(i == html2.find('.m-radio-group>div').length - 1){
				$('input:radio', this).prop('checked', true);  //最后一个选中
				var choosedValue = $('input:radio', this).val();
				$('input:radio', this).parents('.m-radio-group').siblings('input:text').val(choosedValue); //RADIO选中值重新赋值
			}
			$('label', this).attr('for', id + xuhao);
		})
		if(typeof html2.attr('data-hand') != 'undefined') { //移除隐藏的空行
			html2.prev().remove();
			html2.removeAttr('data-hand');
		}
		if(!html2.is(':visible')) html2.show();
		html2.insertAfter(copyObj2); //插入到最后一行后面

		//----输入事件----
		this.inputEvent(node);
		//----RADIO单选事件----
		this.radioEvent(node);
	},


	/**
	 * 获取所有行数据(即每一行的值)
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 * @return {array} 返回json格式的数组. 
	 * 返回值格式：eg. [{keyValue:"主键", colname1:"列1字段", colname2:"列2字段"}]
	 */
	getAllRowData:function(domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		var arr = [];
		$(node).find('.grid-regular .tbody>tr:not([data-mark="omit"]):not([data-hand="yes"])').each(function(i){
			var ls_bh = typeof $(this).attr('data-key') == 'undefined' ? '' : $(this).attr('data-key');
			var json = {}
			json["rowIndex"] = i; //行索
			json["keyValue"] = ls_bh; //主键值
			$(this).find('td').each(function(){ //单元格内部无任何元素时
				if($(this).children('span, input, textarea').length == 0){
					var field = $(this).attr('data-field');
					if(typeof field != 'undefined') json[field] = $(this).text();
				}
			})
			$(this).find('input:text, span, textarea').each(function(){
				var tagName = $(this)[0].tagName.toLocaleLowerCase();
				var field = $(this).attr('data-field');
				var value = tagName != 'input' && tagName != 'textarea' ?  $(this).text() : $(this).val();
				if(typeof field != 'undefined') json[field] = value; //字段值
			})
			arr.push(json);
		})
		return arr;
	},


	/**
	 * 获取单行数据（表格内部某个按钮点击的当前行数据）.
	 * @param {object} obj 按钮对象
	 */
	getOneRowData:function(obj){
		var json = {}
		json["rowIndex"] = obj.parents('tr').index(); //行索引
		json["keyValue"] = typeof obj.parents('tr').attr('data-key') == 'undefined' ? '' : obj.parents('tr').attr('data-key'); //主键值
		obj.parents('tr').find('td').each(function(){  //单元格内部无任何元素时
			if($(this).children('span, input, textarea').length == 0){
				var field = $(this).attr('data-field');
				if(typeof field != 'undefined') json[field] = $(this).text();
			}
		})
		obj.parents('tr').find('input:text, span, textarea').each(function(){
			var tagName = $(this)[0].tagName.toLocaleLowerCase();
			var field = $(this).attr('data-field');
			var value = tagName != 'input' && tagName != 'textarea' ?  $(this).text() : $(this).val();
			if(typeof field != 'undefined') json[field] = value; //字段值
		})
		return json;
	},



	/**
	 * 获取多行数据（选中的多行数据）
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 * @param {array} 返回json格式的数组.
	 * 返回值格式：eg. [{keyValue:"主键", colname1:"列1字段", colname2:"列2字段"}]
	 */
	getMultiRowData:function(domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		var arr = [];
		$(node).find('.grid-frozen .tbody>tr:not([data-mark="omit"])').each(function(i){
			var $this = $(this);
			var cb = $(this).find('input:checkbox');
			if(cb.prop('checked')){
				var tr = $(node).find('.grid-regular .tbody>tr').eq(i);
				var json = {}
				var ls_bh = tr.attr('data-key');
				json["rowIndex"] = i; //行索引
				json["keyValue"] = ls_bh; //主键值
				tr.find('td').each(function(){
					if($(this).children('span, input, textarea').length == 0){
						var field = $(this).attr('data-field');
						if(typeof field != 'undefined') json[field] = $(this).text();
					}
				})
				tr.find('input:text, span, textarea').each(function(){
					var tagName = $(this)[0].tagName.toLocaleLowerCase();
					var field = $(this).attr('data-field');
					var value = tagName != 'input' && tagName != 'textarea' ?  $(this).text() : $(this).val();
					json[field] = value; //字段值
				})
				arr.push(json);
			}
		})
		return arr;
	},


	/**
	 * 删除单行 / 界面上移除单行（表格内部某个按钮点击的当前行数据）
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 * @param {object|number} objOrRowIndex  按钮对象或行索引
	 */
	delOneRow:function(objOrRowIndex, domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		var index = '';
		if(typeof objOrRowIndex === 'object') { //参数为对象时
			var tr = objOrRowIndex.parents('tr');
			index = tr.index(); 
			tr.remove();
		}else { //参数为数值类型(行索引)时
			index = objOrRowIndex;
			$(node).find('.grid-regular .tbody>tr').eq(index).remove();
		}		
		$(node).find('.grid-frozen .tbody>tr').eq(index).remove();
		this.updateRowOrder();//更新行号
	},



	/**
	 * 删除多行 / 界面上移除多行（选中的多行数据）
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 */
	delMultiRow:function(domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		var arr = [];
		$(node).find('.grid-frozen .tbody>tr:not([data-mark="omit"])').each(function(i){
			var $this = $(this);
			var cb = $(this).find('input:checkbox');
			if(cb.prop('checked')){
				$this.attr('data-mark', 'bin'); //标记该行要删除
				$(node).find('.grid-regular .tbody>tr').eq(i).attr('data-mark', 'bin'); //标记该行要删除
			}
		})
		$(node).find('.grid-frozen .tbody>tr:not([data-mark="omit"])').each(function(){
			var $this = $(this);
			if($this.attr('data-mark') == 'bin') $this.remove();
		})
		$(node).find('.grid-regular .tbody>tr:not([data-mark="omit"])').each(function(){
			var $this = $(this);
			if($this.attr('data-mark') == 'bin') $this.remove();
		})
		this.updateRowOrder();//更新行号
	},


	/**
	 * 更新行号
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 */
	updateRowOrder:function(domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		$(node).find('.grid-frozen .tbody>tr:not([data-mark="omit"])').each(function(i){
			$(this).find('td[data-mark="order"]').text(i+1);
		})
	},


	/**
	 * 给某一行的赋值(即赋主键值)
	 * @param {number} index 行索引
	 * @param {*} value 主键值
	 * @param {object|string} domEle 自定义接接节点(可缺省)
	 */
	givePrimaryValue2OneRow:function(index, value, domEle){
		var node = typeof domEle == 'undefined' ? defaultEle : (typeof domEle == 'object' || domEle != '' ? domEle : defaultEle);
		$(node).find('.grid-regular .tbody>tr').eq(index).attr('data-key', value);
	},


	/**
	 * 校验数据完整性（即某个单元格必填，不能为空）
	 * @param {array} saveArr 表格所有行数据组成的JSON数组
	 * @param {array} fieldEnArr 列字段英文（数组）
	 * @param {array} fieldCnArr 列字段中文（数组）
	 * @return {string} 返回空或“某个单元格值不能为空”的提示信息
	 */
	checkEmptyRow:function(saveArr, fieldEnArr, fieldCnArr){
		var tips = '';
		if(fieldCnArr.length != fieldEnArr.length) tips = '您传递的最后两个参数数组长度不一致，请检查！';
		for(var i = 0; i < saveArr.length; i++){
			var row = saveArr[i];
			var index = row["rowIndex"] + 1;
			for(var k = fieldEnArr.length - 1; k >= 0; k--){
				var field = fieldEnArr[k];
				var colvalue = row[field],
					colname = fieldCnArr[k];
				if(colvalue == '') tips = '第' + index + '行：请输入' + colname;
			}
			if(tips != '') break;
		}
		return tips;
	},


	/**
	 * 校验重复行（即某个单元格值必须唯一）
	 * @param {array} saveArr 表格所有行数据组成的JSON数组
	 * @param {array} fieldEnArr 列字段英文（数组）
	 * @param {array} fieldCnArr 列字段中文（数组）
	 * @return {string} 返回空，或“A单元格与B单元格值相同”的提示信息
	 */
	checkRepeatRow:function(saveArr, fieldEnArr, fieldCnArr){
		var tips = '';
		if(fieldCnArr.length != fieldEnArr.length) tips = '您传递的最后两个参数数组长度不一致，请检查！';
		for(var k = fieldEnArr.length - 1; k >= 0; k--){
			var field = fieldEnArr[k];
			var colname = fieldCnArr[k];
			for(var i = saveArr.length - 1; i >= 0; i--){
				var row1 = saveArr[i];
				var index1 = row1["rowIndex"] + 1,
					colvalue1 = row1[field];
				for(var j = i - 1; j >=0; j--){
					var row2 = saveArr[j];
					var index2 = row2["rowIndex"] + 1,
						colvalue2 = row2[field];
					if(colvalue1 == colvalue2) tips = colname + '：第' + index1 + '行与第' + index2 + '行一样';
				}
			}
		}
		return tips;
	},



	/**
	 * 小数转化成百分数
	 * eg. 0.5 <=> 50%
	 * @param {*} ps_decimalStr 小数字符串
	 * @param {*} ps_method 取值方式:
		round 四舍五入，eg1. Math.floor(12.3)=12, eg2. Math.floor(12.8)=13
		loor 向下取数（即舍去小数，仅取整数部分）. 
		ceil 向上取整(即舍去小数，即小数部分一律向整数部分进位，整数部分+1)
	 * @param {*} ps_digit 小数位数,仅当ps_method='round'时有效（默认-1，即不处理原样返回.eg. 56.23% <=> 0.5623）
	 * @param {*} ps_isEmptyTips 空值时是否返回一个默认字符串，默认false
	 * eg.
	 	Math.floor(0.05)=0, eg2.Math.floor(12.3)=12, eg3. Math.floor(12.8)=12
		Math.ceil(0.05)=1, eg2. Math.ceil(12.3)=13, eg3. Math.ceil(12.8)=13
	 */
	decimal2Percent:function(ps_decimalStr, ps_method, ps_digit, ps_isEmptyTips){
		var method = typeof ps_method == 'undefined' || ps_method == '' ? 'round' : ps_method;
		var digit = typeof ps_digit == 'undefined' || ps_digit == '' ? -1 : parseInt(ps_digit);
		var isEmptyTips = typeof ps_isEmptyTips == 'undefined' ? false : (ps_isEmptyTips == true ? true : false);
		var percent = '';
		var decimal = ps_decimalStr.toString().replace(/[\%]/g,'');
		decimal = this.repeatedChar(decimal,'.'); //只保留第1个小数点，其余去掉
		if(decimal != ''){
			if(method == 'round') {
				//percent = ps_decimalStr * 100;
				percent = decimal * 1000000 / 10000; //解决小数乘法bug
				if(digit >= 0) percent = percent.toFixed(digit);
			}
			if(method == 'floor') percent = Math.floor(decimal);
			if(method == 'ceil') percent = Math.ceil(decimal);
		}else{
			if(ps_isEmptyTips) percent = "如30%，请输入0.3";
		}
		return percent == '' ? '' : percent + '%';
	},

	/**
	 * 过滤字符串中相同的字符 
	 * 一组字符串中相同的字符只保留第一个
	 * @param {*} ps_str 原始字符串
	 * @param {*} ps_char 要替换的字符（可缺省）.若缺省则默认替换所有相同字符,否则只替换指定字符
	 * eg. var str = "0.56.578.59"
	 * var newStr = repeatedChar(str); //结果：0.56789 所有相同字符只保留第一个
	 * var newStr = repeatedChar(str, '.'); //结果 0.5657859 只替换相同的小数点（保留第一个小数点）
	 */
	repeatedChar:function(ps_str, ps_char){
		var char = typeof ps_char == 'undefined' ? '' : ps_char;
		var result = ps_str.replace(/./g, function(s,index){
			return ps_str.indexOf(s) == index ? s : char == '' ? '' : (char == s ? '' : s);
		});
		return result;
	}

}