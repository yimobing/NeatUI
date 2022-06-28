/*
 * [neuiPicker]
 * Picker选择器控件
 * 基于 WeUI v1.1.3 开发而成 (https://weui.io) (https://github.com/weui/weui) 
 * 参考文档：https://www.kancloud.cn/ywfwj2008/weuijs/274304
 * Author: Mufeng
 * Date: 2021.06.03
 * Update: 2021.06.03
 */


//==============================================================================================================
//														“自定义选择器组件”
//==============================================================================================================
if(typeof jQuery == 'undefined'){
	var errs = '错误警告：您还没有引入jQuery，请先引入';
	alert(errs);
	console.log(errs);
}
;(function($){
	$.fn.extend({
		neuiPicker: function(opts){
			var self = this;
			//输入框设为只读,不允许弹出软键盘
			var _onfocusStr = typeof this.attr('onfocus') == 'undefined' ? '' : this.attr('onfocus');
			_onfocusStr += ';this.blur()';
			_onfocusStr = _onfocusStr.replace(/([\;]+)/g, ';').replace(/(^;)(.*?)/g, '$2');
			this.attr({
				readonly: true,
				onFocus: _onfocusStr
			})
			//
			var defaults = {
				caption: "", // 标题(字符型)，默认空(可选)。
				// 数据源
				source: {}, // 单列数据源(object型或字符型)，第1列的数据源。1、字符型：值china, 当选择器为省市区县三级联动且使用系统数据源时,只需填值china即可. 2、object型标准格式: {data:[{value:"显示值", id:"隐藏值", disabled:"是否禁用项,布尔型"}]}, 其中：id、disabled可选
				columns: [], // 多列数据源(数组型)(可选)。第2、3、4...列的数据源组成数组. eg. [{}, {}, {}]
				format: { // 自定义数据源字段(Object对象)(可选)。注意：每个数据源的字段必须一样，不能数据源1字段是a，数据源2字段是b
                    value: ["value"], // 显示值字段(数组型)。默认数据中字段为value或mc都可以。
					hid: ["id"], // 隐藏值字段(数组型)(可选)。默认数据中字段为id或bh都可以。
                    forbid: "disabled" // 项禁用字段(字符型)(可选)
                },
				autoFill: true, // 点确定时是否自动填充值到输入框元素(可选),默认true
				value: "", // 默认选项的值(字符型)(可选)，默认空。优先权小于输入框的value属性值，在不指定默认选项值时则默认选中的项为：输入框的值所在的项，若输入框无值则为中间项(奇数项时)或偏下一项(偶数项时)
				depth: '', // 限制选择器深度(数值型)，默认值空(可选)。也就是选择器有多少列，取值为1-3。若为空则根据items项的深度自动调整(或取第一项的深度), 若不为空则将会按照参数设定的值显示N级数据(即使数据源中的级数比N大)
				joint: "-", // 多列或级联选择器时选项值之间的连接符号(可选)，默认短横线'-'。
				itemIncludeJointChar: false, // 数据源中是否含有连接符号(可选)，默认false。当数据源中含有连接符号时,设置本参数为true时可解决“下拉选择中项与输入框的值不对应”的问题。
				cascade: false, // 是否级联选择器(可选)，默认false
				district: false, // 是否省市区县联动选择器(可选)，默认false。值为true且使用系统数据源时,请设置source参数的值为'china'.

				// 节点DOM
				className: "",  // 自定义选择器类名(字符型)，默认空(可选)。
				id: "default" + methods.getRandomWord(8, 12), // 作为选择器的唯一标识(字符型)(可选)，默认值"default"。作用是以id缓存当时的选择。（当你想每次传入的defaultValue都是不一样时，可以使用不同的id区分，也就是每次id不一样同一个页面才能使用多个选择器，不然数据会错乱）。
				container: "body", // 指定容器(字符型)(可选), 默认body。eg. '#selector'
				// 回调
				onConfirm: function(e){ }, // 在点击"确定"之后的回调。回调返回选中的结果(Array)，数组长度依赖于选择器的层级(可选)。e格式：{id:"新隐藏值", value:"新显示值", oldId:"旧隐藏值", oldValue:"旧显示值"}
				onChange: function(e){ }, // 在选择器选中的值发生变化的时候回调(可选)。e格式：{id:"新隐藏值", value:"新显示值", oldId:"旧隐藏值", oldValue:"旧显示值"}
				onClose: function(){ } // 选择器关闭后的回调(可选)。
			}
			var settings = $.extend(true, {}, defaults, opts || {});

			/**
			 * 注
			 * d 开头表示“自定义选择器组件”参数
			 * t 开头表示“原始选择器组件”参数
			 */

			//----------------------------------------
			// ·取值
			//----------------------------------------
			var dCaption = settings.caption,
				dSource = settings.source,
				dColumns = settings.columns,
				dAutoFill = settings.autoFill,
				dValue = settings.value,
				dFormat = settings.format,
				dDepth = settings.depth,
				dJoint = settings.joint,
				dItemIncludeJointChar = settings.itemIncludeJointChar,
				dCascade = settings.cascade,
				dDistrict = settings.district,	
				dClassName = settings.className,
				dId = settings.id,
				dContainer = settings.container;
			// ·标记是否中断
			var isGoOn = true;

			
			//----------------------------------------
			// ·选择器深度
			//----------------------------------------
			// ·省市区县三级联动使用系统数据源
			var chineseSource = { data:[] }
			if(dCascade && dDistrict && dSource == 'china'){
				if(typeof iosProvinces == 'undefined' || typeof iosCitys == 'undefined' || typeof iosCountys == 'undefined'){
					var errs = '警告！请先引入“全国省市区数据源”\njquery.chineseDistricts.js';
					alert(errs);
					console.log(errs);
					return;
				}
				for(var i = 0; i < iosProvinces.length; i++){
					var row1 = iosProvinces[i];
					var provinceId = row1.id, provinceName = row1.value;
					var provinceOne = { "province": provinceName, "provinceId": provinceId, data: [] }
					if(dDepth == '' || dDepth >=2 ){ // 这里判断可减少不必要的循环次数
						for(var j = 0; j < iosCitys.length; j++){
							var row2 = iosCitys[j];
							var cityParentId = row2.parentId, cityId = row2.id, cityName = row2.value;
							var cityOne = { "city": cityName, "cityId": cityId , data: [] }
							if(dDepth == '' || dDepth >=3 ){ // 这里判断可减少不必要的循环次数
								for(var k = 0; k < iosCountys.length; k++){
									var row3 = iosCountys[k];
									var countyParentId = row3.parentId, countyId = row3.id, countyName = row3.value;
									var countyOne = { "county": countyName, "countyId": countyId, data: [] }
									if(countyParentId == cityId){
										cityOne.data.push(countyOne);
									}
								}
							}
							if(cityParentId == provinceId){
								provinceOne.data.push(cityOne);
							}
						}
					}
					chineseSource.data.push(provinceOne);
				}	
				dSource = chineseSource;
			}
			// console.log('chineseSource：', chineseSource)


			// ·数据源转化成标准数组格式. eg. [{label:"显示值", value:"隐藏值", disabled: "是否禁用,布尔型"}]
			var tDepth = dDepth;
			var tSourceSingle = [], // 单列数据源
				tSourceMultiple = [], // 多列数据源
				tSourceAll = []; // 全部数据源
			//
			var countLevel = 0, // 层级深度
				levelsArray = []; // 层级数组
			var level1IdArr = [], level2IdArr = [], level3IdArr = [], // 各层级ID数组
				level1StartId = 110000, level2StartId = 210000, level3StartId = 310000; // 各层级起始ID
			if(dCascade){ // 级联选择器
				var _shengName = _shiName = _quName = '',
					_shengId = _shiId = _quId = '';
				if(dDistrict){ // 省市区三级联动时默认的字段名
					_shengName = "province";
					_shengId = "provinceId";
					_shiName = "city";
					_shiId = "cityId";
					_quName = "county";
					_quId = "countyId";
				}				
				var _level1Name = dFormat.value[0], _level2Name = dFormat.value[1], _level3Name = dFormat.value[2],
					_level1Id = dFormat.hid[0], _level2Id = dFormat.hid[1], _level3Id = dFormat.hid[2];
				if(typeof dSource.data != 'undefined' && (dDepth == '' || dDepth >=1) ){ // 第1层
					countLevel = 1;
					$.each(dSource.data, function(k1, items1){
						var level1Ids = level1StartId + (k1 + 1);
						level1IdArr.push(level1Ids);
						var levels1Name = typeof items1[_level1Name] != 'undefined' ? items1[_level1Name] : items1[_shengName],
							levels2Id = typeof items1[_level1Id] != 'undefined' ? items1[_level1Id] : (typeof items1[_shengId] == 'undefined' ? level1Ids: items1[_shengId]);
						var one1 = { label: levels1Name, value: levels2Id, children: [] }
						if(typeof items1.data != 'undefined' && (dDepth == '' || dDepth >=2) ){ // 第2层
							countLevel = 2;
							$.each(items1.data, function(k2, items2){
								var level2Ids = ( k1 == 0 ? level2StartId + (k2 + 1) : level2IdArr[level2IdArr.length - 1] + 1 );
								level2IdArr.push(level2Ids);
								var levels2Name = typeof items2[_level2Name] != 'undefined' ? items2[_level2Name] : items2[_shiName],
									levels2Id = typeof items2[_level2Id] != 'undefined' ? items2[_level2Id] : (typeof items2[_shiId] == 'undefined' ? level2Ids : items2[_shiId]);
								var one2 = { label: levels2Name, value: levels2Id, children: [] }
								if(typeof items2.data != 'undefined' && (dDepth == '' || dDepth >=3) ){ // 第3层
									countLevel = 3;
									$.each(items2.data, function(k3, items3){
										var level3Ids = ( k1 == 0 && k2 == 0 ? level3StartId + (k3 + 1) : level3IdArr[level3IdArr.length - 1] + 1 );
										level3IdArr.push(level3Ids);
										var levels3Name = typeof items3[_level3Name] != 'undefined' ? items3[_level3Name] : items3[_quName],
											levels3Id = typeof items3[_level3Id] != 'undefined' ? items3[_level3Id] : (typeof items3[_quId]== 'undefined' ? level3Ids : items3[_quId]);
										var one3 = { label: levels3Name, value: levels3Id }
										one2.children.push(one3);
									})
								}
								one1.children.push(one2);
							})
						}
						levelsArray.push(one1);
					})	
				}
			}
			else{ // 普通选择器：单列、多列
				// 校验数据完整性 add 20220628-1
				if(typeof dSource == 'undefined'){
					alert('前台未指定数据源，或输入时未返回数据源！');
					return;
				}
				if(dSource.toString().replace(/([ ]+)/g, '') === ''){
					alert('暂无数据，后台返回空字符串""');
					return;
				}
				
				// if(Object.keys(dSource).length === 0){
				if(JSON.stringify(dSource) === '{}'){
					alert('暂无数据，后台返回空对象{}');
					return;
				}
				if(typeof dSource.data == 'undefined'){
					alert('请检查数据源是否包含data属性，正确的格式：{data:[]}');
					return;
				}

				if(dSource.data.length == 0){
					alert('对不起，暂无数据');
					return;
				}

				// 开始执行
				if(typeof dSource.data != 'undefined'){ // 单列
					countLevel = 1;
					$.each(dSource.data, function(i, items){
						var level1Ids = level1StartId + (i + 1);
						level1IdArr.push(level1Ids);
						var _value = dFormat.hid[0],
							_label = dFormat.value[0],
							_disabled = dFormat.forbid;
						// edit 20210830-1 下4行
						// var value = typeof items[_value] == 'undefined' ? level1Ids : items[_value],
						// 	label = typeof items[_label] == 'undefined' ? '' : items[_label],
						var value = typeof items[_value] == 'undefined' ? (typeof items["id"] == 'undefined' ? ( typeof items["bh"] == 'undefined' ? level1Ids : items["bh"]) : items["id"] ) : items[_value],
							label = typeof items[_label] == 'undefined' ? (typeof items["value"] == 'undefined' ? ( typeof items["mc"] == 'undefined' ? 'undefined' : items["mc"]) : items["value"] ) : items[_label],
							disabled = typeof items[_disabled] == 'undefined' ? false : (items[_disabled] === true ? true : false);
						if(label == 'undefined'){
							var errs = '警告！自定义数据源字段format参数的字段名' + _label + '有错误，请检查！';
							alert(errs);
							console.log(errs);
							isGoOn = false;
							return false;
						}
						var one = { value: value, label: label, disabled: disabled }
						levelsArray.push(one);
					})
				}
				if(dColumns.length > 0){ // 多列
					countLevel += dColumns.length;
					tSourceMultiple = new Array(dColumns.length);
					for(var k = 0; k < tSourceMultiple.length; k++){
						tSourceMultiple[k] = [];
					}
					for(var k = 0; k < dColumns.length; k++){
						var tmpSource = dColumns[k];
						$.each(tmpSource.data, function(i, items){
							var level1Ids = level1StartId + (i + 1);
							level1IdArr.push(level1Ids);
							var _value = dFormat.hid[0],
								_label = dFormat.value[0],
								_disabled = dFormat.forbid;
							// edit 20210830-1 下4行
							// var value = typeof items[_value] == 'undefined' ? level1Ids : items[_value],
							// 	label = typeof items[_label] == 'undefined' ? '' : items[_label],
							var value = typeof items[_value] == 'undefined' ? (typeof items["id"] == 'undefined' ? ( typeof items["bh"] == 'undefined' ? level1Ids : items["bh"]) : items["id"] ) : items[_value],
								label = typeof items[_label] == 'undefined' ? (typeof items["value"] == 'undefined' ? ( typeof items["mc"] == 'undefined' ? 'undefined' : items["mc"]) : items["value"] ) : items[_label],
								disabled = typeof items[_disabled] == 'undefined' ? false : (items[_disabled] === true ? true : false);
							if(label == ''){
								var errs = '警告！自定义数据源字段format参数的字段名有错误，请检查！';
								alert(errs);
								console.log(errs);
								isGoOn = false;
								return false;
							}
							var one = { value: value, label: label, disabled: disabled }
							tSourceMultiple[k].push(one);
						})
					}
				}
			}
			// console.log('第一层ID数组：', level1IdArr, '\n第二层ID数组：', level2IdArr, '\n第三层ID数组：', level3IdArr);
			// console.log('多列数据源：', tSourceMultiple);

			//----------------------------------------
			// ·全局赋值
			//----------------------------------------
			tDepth = countLevel;
			tSourceSingle = levelsArray;

			//----------------------------------------
			// ·选择器默认值
			//----------------------------------------
			// 所有单列、多列数据源组成一个数组,数组中每个元素都是一个object型
			var sourceArray = []
			for(var i = 0; i < tSourceSingle.length; i++){
				var row = tSourceSingle[i];
				sourceArray.push(row);
			}
			for(var i = 0; i < tSourceMultiple.length; i++){
				var arr = tSourceMultiple[i];
				for(var j = 0; j < arr.length; j++){
					var row = arr[j];
					sourceArray.push(row);
				}
			}
			// 新老值
			var oldValue = methods.getValueOfElement(self), // 老的显示值
				oldId = typeof self.attr('data-bh') == 'undefined' ? '' : self.attr('data-bh'); // 老的隐藏值
			if(oldId == '') oldId = (methods.getSourceHidValueByRevealValue(tSourceSingle, oldValue, dJoint, dItemIncludeJointChar)).join(dJoint);
			var initValue = (oldValue == '' ? dValue : oldValue); // 输入框或选择器默认显示值
			var tDefaultValue = []
			// 默认选项选中哪一个
			if(initValue != ''){
				tDefaultValue = methods.getSourceHidValueByRevealValue(sourceArray, initValue, dJoint, dItemIncludeJointChar);
			}else{
				tDefaultValue = [ Math.ceil(tSourceSingle.length / 2) ];
			}

			// 打印信息
			// console.log('单列数据源：', tSourceSingle)
			// console.log('多列数据源：', tSourceMultiple)
			// console.log('老的显示值:', oldValue, '\n老的隐藏值：',oldId, '\n隐藏值数组：', tDefaultValue);


			//----------------------------------------
			// ·把参数传给“原始选择器组件”
			//----------------------------------------
			if(!isGoOn) return;
			// 配置项
			var paramsObject = {
				defaultValue: tDefaultValue, // 默认选项的值，数组型
				depth: tDepth, // depth 选择器深度，数值型，默认值空。 也就是选择器有多少列，取值为1-3，如果为空，则根据items项的深度自动调整(或取第一项的深度)

				className: dClassName, // 自定义选择器类名(字符型)，默认空(可选)
				id: dId, // 作为选择器的唯一标识，字符型，默认值"default"。作用是以id缓存当时的选择。（当你想每次传入的defaultValue都是不一样时，可以使用不同的id区分，也就是每次id不一样同一个页面才能使用多个选择器，不然数据会错乱）。
				container: dContainer == '' ? 'body' : dContainer, // 指定容器(字符型)(可选), 默认body。eg. '#selector'

				// 回调
				onConfirm: function (result) { // 在点击"确定"之后的回调，函数型。 回调返回选中的结果(Array)，数组长度依赖于选择器的层级
					// console.log('您正在点确定按钮', result);
					var id = value = '';
					for(var i = 0; i < result.length; i++){
						var row = result[i];
						id += row.value + dJoint;
						value += row.label + dJoint;
					}
					id = id.substr(0, id.length - dJoint.length);
					value = value.substr(0, value.length - dJoint.length);

					if(dAutoFill) methods.giveValue2Element(self, value, id); // 给元素赋值
					var e = {id: id, value: value, oldId: oldId, oldValue: oldValue}
					if(settings.onConfirm) settings.onConfirm(e); // 回调
				},
				onChange: function (result) { // 在选择器选中的值发生变化的时候回调，函数型。
					//console.log(item, index);
					// console.log('您正在改变选项', result);
					var id = value = '';
					for(var i = 0; i < result.length; i++){
						var row = result[i];
						id += row.value + dJoint;
						value += row.label + dJoint;
					}
					id = id.substr(0, id.length - dJoint.length);
					value = value.substr(0, value.length - dJoint.length);
					// methods.giveValue2Element(self, value, id); // 给元素赋值,如果要在选项改变时界面上输入框的值也随之改变的话
					var e = {id: id, value: value, oldId: oldId, oldValue: oldValue}
					if(settings.onChange) settings.onChange(e);
				},
				onClose: function(){ // 选择器关闭后的回调，函数型。
					// console.log('您选择了关闭');
					if(settings.onClose) settings.onClose();
				}
			}		
			// ·整合数据源
			for(var i = 0; i < tSourceMultiple.length; i++){ // 添加到数组中
				tSourceAll.push(tSourceMultiple[i]);''
			}
			tSourceAll.unshift(tSourceSingle); // 添加到数组中作为第一个元素
			tSourceAll.push(paramsObject); // 添加到数据中作为最后一个元素
			// console.log('全部数据源：', tSourceAll); // 打印信息
			// ·调用原始选择器组件,并传递参数
			weui.picker.apply(null, tSourceAll); // 将数组中的每一个元素作为参数传递给函数 weui.picker()

			// ·hack操作
			$('.neatui-picker__title').text(dCaption);
			
		}
	})



	var methods = {
		/*
		* 生成N位随机数(字母+数字组成)
		* @param {number} min 最小位数(固定位数)
		* @param {number} max 最大位数(可选), 默认max=min
		* @param {boolean} isRandomed 是否任意长度(可选). true 是(默认), false 否. 值为false时,生成的字符长度为min指定的位数
		*/
		getRandomWord: function(min, max, isRandomed) {
			max = typeof max == 'undefined' ? min : max;
			isRandomed = typeof isRandomed == 'undefined' ? true : (isRandomed === false ? false : true);
			var str = ''
			var range = min
			var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
			// 随机产生
			if (isRandomed) {
				range = Math.round(Math.random() * (max - min)) + min
			}
			for (var i = 0; i < range; i++) { // eslint-disable-line
				var pos = Math.round(Math.random() * (arr.length - 1))
				str += arr[pos]
			}
			return str;
		},


		/**
		 * 给某个dom元素赋值
		 * @param {dom} ps_obj  dom对象
		 * @param {string} ps_str 要赋的显示值
		 * @param {string} ps_hid 要赋的隐藏值
		 */
		giveValue2Element: function(ps_obj, ps_str, ps_hid){
			var ele = ps_str instanceof jQuery ? ps_obj : $(ps_obj);
			var tagname = ele[0].tagName.toLocaleLowerCase();
			if(tagname == 'input' || tagname == 'textarea') ele.val(ps_str).attr('data-bh', ps_hid);
			else ele.text(ps_str).attr('data-bh', ps_hid);
		},

		/**
		 * 获取某个dom元素的值
		 * @param {dom} ps_obj dom对象
		 * @returns {string} 返回该dom元素的值
		 */
		getValueOfElement: function(ps_obj){
			var ele = ps_obj instanceof jQuery ? ps_obj : $(ps_obj);
			var tagname = ele[0].tagName.toLocaleLowerCase();
			return ( tagname == 'input' || tagname == 'textarea' ? ele.val() : ele.text() );
		},

		/**
		 * 在数据源数组中通过label获取对应的value
		 * JSON解析递归调用：应用于JSON无限层级嵌套解析成一维数组
		 * @param {array} ps_src_arr 数据源数组. eg.[{label:"显示值", value:"隐藏值", disabled:"是否禁用"}]
		 * @param {string} ps_reveal_value 对象中的显示值
		 * @param {array} ps_hid_arr 隐藏值数组,调用时只需要传递空数组. eg.[]
		 * @returns {array} 返回隐藏值一维数组(仅单个元素). eg. ['1001']
		 */
		getSourceValueByLabel: function(ps_src_arr, ps_reveal_value, ps_hid_arr) {
			var _this = this;
			ps_src_arr.filter(function(item){
				if(ps_reveal_value == item.label) 
				ps_hid_arr.push(item.value);
				if(item.children && item.children.length) {
					_this.getSourceValueByLabel(item.children, ps_reveal_value, ps_hid_arr)
				}
			})
			return ps_hid_arr.length == 0 ? [''] : ps_hid_arr;
		},

		/**
		 * 在数据源数组中通过显示值获取对应的隐藏值
		 * @param {array} ps_src_arr 数据源数组. eg.[{label:"显示值", value:"隐藏值", disabled:"是否禁用"}]
		 * @param {string} ps_reveal_value 显示值(输入框或选择器默认值)
		 * @param {string} ps_hyphen_char 默认值连字符，即分割符
		 * @param {string} ps_item_include_hyphen_char 数据源中是否含有连接符号
		 * @returns {array} 返回隐藏值一维数组(单个或多个元素). eg. ['1001', '1002', '1003']
		 */
		getSourceHidValueByRevealValue: function(ps_src_arr, ps_reveal_value, ps_hyphen_char, ps_item_include_hyphen_char){
			var hidArr = [];
			if(ps_item_include_hyphen_char){
				var arr = this.getSourceValueByLabel(ps_src_arr, ps_reveal_value, []);
				hidArr.push(arr[0]);
			}else{
				var splitArr = ps_reveal_value.split(ps_hyphen_char);
				for(var i = 0; i < splitArr.length; i++){
					var text = splitArr[i];
					var arr = this.getSourceValueByLabel(ps_src_arr, text, []);
					// console.log('arr数组：', arr)
					hidArr.push(arr[0]);
				}
			}
			return hidArr;
		}
	}


})(window.jQuery);








//==============================================================================================================
//														“微信原始选择器组件”
//==============================================================================================================
!function(e, t) {
	"object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.weui = t() : e.weui = t()
} (this,
function() {
	return function(e) {
		function t(i) {
			if (n[i]) return n[i].exports;
			var o = n[i] = {
				exports: {},
				id: i,
				loaded: !1
			};
			return e[i].call(o.exports, o, o.exports, t),
			o.loaded = !0,
			o.exports
		}
		var n = {};
		return t.m = e,
		t.c = n,
		t.p = "",
		t(0)
	} ([function(e, t, n) {
		"use strict";
		function i(e) {
			if (e && e.__esModule) return e;
			var t = {};
			if (null != e) for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
			return t.
		default = e,
			t
		}
		function o(e) {
			return e && e.__esModule ? e: {
			default:
				e
			}
		}
		function r(e) {
			"object" != ("undefined" == typeof e ? "undefined": f(e)) && (e = {
				label: e,
				value: e
			}),
			s.
		default.extend(this, e)
		}
		function a() {
			function e() { (0, s.
			default)(a.container).append(v),
				s.
			default.getStyle(v[0], "transform"),
				v.find(".neatui-picker__shade").addClass("neatui-animate-fade-in"),
				v.find(".neatui-picker").addClass("neatui-animate-slide-up")
			}
			function t(e) {
				t = s.
			default.noop,
				v.find(".neatui-picker__shade").addClass("neatui-animate-fade-out"),
				v.find(".neatui-picker").addClass("neatui-animate-slide-down").on("animationend webkitAnimationEnd",
				function() {
					v.remove(),
					w = !1,
					a.onClose(),
					e && e()
				})
			}
			function n(e) {
				t(e)
			}
			function i(e, t) {
				if (void 0 === h[t] && a.defaultValue && void 0 !== a.defaultValue[t]) {
					var n = a.defaultValue[t],
					o = 0,
					u = e.length;
					if ("object" == f(e[o])) for (; o < u && n != e[o].value; ++o);
					else for (; o < u && n != e[o]; ++o);
					o < u && (h[t] = o)
				}
				v.find(".neatui-picker__group").eq(t).scroll({
					items: e,
					temp: h[t],
					onChange: function(e, n) {
						if (e ? d[t] = new r(e) : d[t] = null, h[t] = n, c) d.length == y && a.onChange(d);
						else if (e.children && e.children.length > 0) v.find(".neatui-picker__group").eq(t + 1).show(),
						!c && i(e.children, t + 1);
						else {
							var o = v.find(".neatui-picker__group");
							o.forEach(function(e, n) {
								n > t && (0, s.
							default)(e).hide()
							}),
							d.splice(t + 1),
							a.onChange(d)
						}
					},
					onConfirm: a.onConfirm
				})
			}
			if (w) return w;
			var o = arguments[arguments.length - 1],
			a = s.
		default.extend({
				id:
				"default",
				className: "",
				container: "body",
				onChange: s.
			default.noop,
				onConfirm: s.
			default.noop,
				onClose: s.
			default.noop
			},
			o),
			u = void 0,
			c = !1;
			if (arguments.length > 2) {
				var l = 0;
				for (u = []; l < arguments.length - 1;) u.push(arguments[l++]);
				c = !0
			} else u = arguments[0];
			b[a.id] = b[a.id] || [];
			for (var d = [], h = b[a.id], v = (0, s.
		default)(s.
		default.render(m.
		default, a)), y = o.depth || (c ? u.length: p.depthOf(u[0])), _ = "", k = y; k--;) _ += g.
		default;
			return v.find(".neatui-picker__bd").html(_),
			e(),
			c ? u.forEach(function(e, t) {
				i(e, t)
			}) : i(u, 0),
			v.on("click", ".neatui-picker__shade",
			function() {
				n()
			}).on("click", ".neatui-picker__action",
			function() {
				n()
			}).on("click", "#neatui-picker-confirm",
			function() {
				a.onConfirm(d)
			}),
			w = v[0],
			w.hide = n,
			w
		}
		function u(e) {
			var t = s.
		default.extend({
				id:
				"datePicker",
				onChange: s.
			default.noop,
				onConfirm: s.
			default.noop,
				start: 2e3,
				end: 2030,
				cron: "* * *"
			},
			e);
			"number" == typeof t.start ? t.start = new Date(t.start + "/01/01") : "string" == typeof t.start && (t.start = new Date(t.start.replace(/-/g, "/"))),
			"number" == typeof t.end ? t.end = new Date(t.end + "/12/31") : "string" == typeof t.end && (t.end = new Date(t.end.replace(/-/g, "/")));
			var n = function(e, t, n) {
				for (var i = 0,
				o = e.length; i < o; i++) {
					var r = e[i];
					if (r[t] == n) return r
				}
			},
			i = [],
			o = d.
		default.parse(t.cron, t.start, t.end),
			r = void 0;
			do {
				r = o.next();
				var u = r.value.getFullYear(), f = r.value.getMonth() + 1, c = r.value.getDate(), l = n(i, "value", u);
				l || (l = {
					label: u + "年",
					value: u,
					children: []
				},
				i.push(l));
				var h = n(l.children, "value", f);
				h || (h = {
					label: f + "月",
					value: f,
					children: []
				},
				l.children.push(h)), h.children.push({
					label: c + "日",
					value: c
				})
			} while (! r . done );
			return a(i, t)
		}
		Object.defineProperty(t, "__esModule", {
			value: !0
		});
		var f = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?
		function(e) {
			return typeof e
		}: function(e) {
			return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol": typeof e
		},
		c = n(1),
		s = o(c),
		l = n(5),
		d = o(l);
		n(6);
		var h = n(7),
		p = i(h),
		v = n(8),
		m = o(v),
		y = n(9),
		g = o(y);
		r.prototype.toString = function() {
			return this.value
		},
		r.prototype.valueOf = function() {
			return this.value
		};
		var w = void 0,
		b = {};
		t.
	default = {
			picker: a,
			datePicker: u
		},
		e.exports = t.
	default
	},
	function(e, t, n) {
		"use strict";
		function i(e) {
			return e && e.__esModule ? e: {
			default:
				e
			}
		}
		function o(e) {
			var t = this.os = {},
			n = e.match(/(Android);?[\s\/]+([\d.]+)?/);
			n && (t.android = !0, t.version = n[2])
		}
		Object.defineProperty(t, "__esModule", {
			value: !0
		});
		var r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?
		function(e) {
			return typeof e
		}: function(e) {
			return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol": typeof e
		};
		n(2);
		var a = n(3),
		u = i(a),
		f = n(4),
		c = i(f);
		o.call(c.
	default, navigator.userAgent),
		(0, u.
	default)(c.
	default.fn, {
			append: function(e) {
				return e instanceof HTMLElement || (e = e[0]),
				this.forEach(function(t) {
					t.appendChild(e)
				}),
				this
			},
			remove: function() {
				return this.forEach(function(e) {
					e.parentNode.removeChild(e)
				}),
				this
			},
			find: function(e) {
				return (0, c.
			default)(e, this)
			},
			addClass: function(e) {
				return this.forEach(function(t) {
					t.classList.add(e)
				}),
				this
			},
			removeClass: function(e) {
				return this.forEach(function(t) {
					t.classList.remove(e)
				}),
				this
			},
			eq: function(e) {
				return (0, c.
			default)(this[e])
			},
			show: function() {
				return this.forEach(function(e) {
					e.style.display = "block"
				}),
				this
			},
			hide: function() {
				return this.forEach(function(e) {
					e.style.display = "none"
				}),
				this
			},
			html: function(e) {
				return this.forEach(function(t) {
					t.innerHTML = e
				}),
				this
			},
			css: function(e) {
				var t = this;
				return Object.keys(e).forEach(function(n) {
					t.forEach(function(t) {
						t.style[n] = e[n]
					})
				}),
				this
			},
			on: function(e, t, n) {
				var i = "string" == typeof t && "function" == typeof n;
				return i || (n = t),
				this.forEach(function(o) {
					e.split(" ").forEach(function(e) {
						o.addEventListener(e,
						function(e) {
							i ? this.contains(e.target.closest(t)) && n.call(e.target, e) : n.call(this, e)
						})
					})
				}),
				this
			},
			off: function(e, t, n) {
				return "function" == typeof t && (n = t, t = null),
				this.forEach(function(i) {
					e.split(" ").forEach(function(e) {
						"string" == typeof t ? i.querySelectorAll(t).forEach(function(t) {
							t.removeEventListener(e, n)
						}) : i.removeEventListener(e, n)
					})
				}),
				this
			},
			index: function() {
				var e = this[0],
				t = e.parentNode;
				return Array.prototype.indexOf.call(t.children, e)
			},
			offAll: function() {
				var e = this;
				return this.forEach(function(t, n) {
					var i = t.cloneNode(!0);
					t.parentNode.replaceChild(i, t),
					e[n] = i
				}),
				this
			},
			val: function() {
				var e = arguments;
				return arguments.length ? (this.forEach(function(t) {
					t.value = e[0]
				}), this) : this[0].value
			},
			attr: function() {
				var e = arguments;
				if ("object" == r(arguments[0])) {
					var t = arguments[0],
					n = this;
					return Object.keys(t).forEach(function(e) {
						n.forEach(function(n) {
							n.setAttribute(e, t[e])
						})
					}),
					this
				}
				return "string" == typeof arguments[0] && arguments.length < 2 ? this[0].getAttribute(arguments[0]) : (this.forEach(function(t) {
					t.setAttribute(e[0], e[1])
				}), this)
			}
		}),
		(0, u.
	default)(c.
	default, {
			extend: u.
		default,
			noop: function() {},
			render: function(e, t) {
				var n = "var p=[];with(this){p.push('" + e.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');";
				return new Function(n).apply(t)
			},
			getStyle: function(e, t) {
				var n, i = (e.ownerDocument || document).defaultView;
				return i && i.getComputedStyle ? (t = t.replace(/([A-Z])/g, "-$1").toLowerCase(), i.getComputedStyle(e, null).getPropertyValue(t)) : e.currentStyle ? (t = t.replace(/\-(\w)/g,
				function(e, t) {
					return t.toUpperCase()
				}), n = e.currentStyle[t], /^\d+(em|pt|%|ex)?$/i.test(n) ?
				function(t) {
					var n = e.style.left,
					i = e.runtimeStyle.left;
					return e.runtimeStyle.left = e.currentStyle.left,
					e.style.left = t || 0,
					t = e.style.pixelLeft + "px",
					e.style.left = n,
					e.runtimeStyle.left = i,
					t
				} (n) : n) : void 0
			}
		}),
		t.
	default = c.
	default,
		e.exports = t.
	default
	},
	function(e, t) { !
		function(e) {
			"function" != typeof e.matches && (e.matches = e.msMatchesSelector || e.mozMatchesSelector || e.webkitMatchesSelector ||
			function(e) {
				for (var t = this,
				n = (t.document || t.ownerDocument).querySelectorAll(e), i = 0; n[i] && n[i] !== t;)++i;
				return Boolean(n[i])
			}),
			"function" != typeof e.closest && (e.closest = function(e) {
				for (var t = this; t && 1 === t.nodeType;) {
					if (t.matches(e)) return t;
					t = t.parentNode
				}
				return null
			})
		} (window.Element.prototype)
	},
	function(e, t) {
		/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
		"use strict";
		function n(e) {
			if (null === e || void 0 === e) throw new TypeError("Object.assign cannot be called with null or undefined");
			return Object(e)
		}
		function i() {
			try {
				if (!Object.assign) return ! 1;
				var e = new String("abc");
				if (e[5] = "de", "5" === Object.getOwnPropertyNames(e)[0]) return ! 1;
				for (var t = {},
				n = 0; n < 10; n++) t["_" + String.fromCharCode(n)] = n;
				var i = Object.getOwnPropertyNames(t).map(function(e) {
					return t[e]
				});
				if ("0123456789" !== i.join("")) return ! 1;
				var o = {};
				return "abcdefghijklmnopqrst".split("").forEach(function(e) {
					o[e] = e
				}),
				"abcdefghijklmnopqrst" === Object.keys(Object.assign({},
				o)).join("")
			} catch(e) {
				return ! 1
			}
		}
		var o = Object.getOwnPropertySymbols,
		r = Object.prototype.hasOwnProperty,
		a = Object.prototype.propertyIsEnumerable;
		e.exports = i() ? Object.assign: function(e, t) {
			for (var i, u, f = n(e), c = 1; c < arguments.length; c++) {
				i = Object(arguments[c]);
				for (var s in i) r.call(i, s) && (f[s] = i[s]);
				if (o) {
					u = o(i);
					for (var l = 0; l < u.length; l++) a.call(i, u[l]) && (f[u[l]] = i[u[l]])
				}
			}
			return f
		}
	},
	function(e, t, n) {
		var i, o; !
		function(n, r) {
			r = function(e, t, n) {
				function i(o, r, a) {
					return a = Object.create(i.fn),
					o && a.push.apply(a, o[t] ? [o] : "" + o === o ? /</.test(o) ? ((r = e.createElement(r || t)).innerHTML = o, r.children) : r ? (r = i(r)[0]) ? r[n](o) : a: e[n](o) : "function" == typeof o ? e.readyState[7] ? o() : e[t]("DOMContentLoaded", o) : o),
					a
				}
				return i.fn = [],
				i.one = function(e, t) {
					return i(e, t)[0] || null
				},
				i
			} (document, "addEventListener", "querySelectorAll"),
			i = [],
			o = function() {
				return r
			}.apply(t, i),
			!(void 0 !== o && (e.exports = o))
		} (this)
	},
	function(e, t) {
		"use strict";
		function n(e, t) {
			if (! (e instanceof t)) throw new TypeError("Cannot call a class as a function")
		}
		function i(e, t) {
			var n = t[0],
			i = t[1],
			o = [],
			r = void 0;
			e = e.replace(/\*/g, n + "-" + i);
			for (var u = e.split(","), f = 0, c = u.length; f < c; f++) {
				var s = u[f];
				s.match(a) && s.replace(a,
				function(e, t, a, u) {
					u = parseInt(u) || 1,
					t = Math.min(Math.max(n, ~~Math.abs(t)), i),
					a = a ? Math.min(i, ~~Math.abs(a)) : t,
					r = t;
					do o.push(r),
					r += u;
					while (r <= a)
				})
			}
			return o
		}
		function o(e, t, n) {
			var o = e.replace(/^\s\s*|\s\s*$/g, "").split(/\s+/),
			r = [];
			return o.forEach(function(e, t) {
				var n = u[t];
				r.push(i(e, n))
			}),
			new f(r, t, n)
		}
		Object.defineProperty(t, "__esModule", {
			value: !0
		});
		var r = function() {
			function e(e, t) {
				for (var n = 0; n < t.length; n++) {
					var i = t[n];
					i.enumerable = i.enumerable || !1,
					i.configurable = !0,
					"value" in i && (i.writable = !0),
					Object.defineProperty(e, i.key, i)
				}
			}
			return function(t, n, i) {
				return n && e(t.prototype, n),
				i && e(t, i),
				t
			}
		} (),
		a = /^(\d+)(?:-(\d+))?(?:\/(\d+))?$/g,
		u = [[1, 31], [1, 12], [0, 6]],
		f = function() {
			function e(t, i, o) {
				n(this, e),
				this._dates = t[0],
				this._months = t[1],
				this._days = t[2],
				this._start = i,
				this._end = o,
				this._pointer = i
			}
			return r(e, [{
				key: "_findNext",
				value: function() {
					for (var e = void 0;;) {
						if (this._end.getTime() - this._pointer.getTime() < 0) throw new Error("out of range, end is " + this._end + ", current is " + this._pointer);
						var t = this._pointer.getMonth(),
						n = this._pointer.getDate(),
						i = this._pointer.getDay();
						if (this._months.indexOf(t + 1) !== -1) if (this._dates.indexOf(n) !== -1) {
							if (this._days.indexOf(i) !== -1) {
								e = new Date(this._pointer);
								break
							}
							this._pointer.setDate(n + 1)
						} else this._pointer.setDate(n + 1);
						else this._pointer.setMonth(t + 1),
						this._pointer.setDate(1)
					}
					return e
				}
			},
			{
				key: "next",
				value: function() {
					var e = this._findNext();
					return this._pointer.setDate(this._pointer.getDate() + 1),
					{
						value: e,
						done: !this.hasNext()
					}
				}
			},
			{
				key: "hasNext",
				value: function() {
					try {
						return this._findNext(),
						!0
					} catch(e) {
						return ! 1
					}
				}
			}]),
			e
		} ();
		t.
	default = {
			parse: o
		},
		e.exports = t.
	default
	},
	function(e, t, n) {
		"use strict";
		function i(e) {
			return e && e.__esModule ? e: {
			default:
				e
			}
		}
		var o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?
		function(e) {
			return typeof e
		}: function(e) {
			return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol": typeof e
		},
		r = n(1),
		a = i(r),
		u = function(e, t) {
			return e.css({
				"-webkit-transition": "all " + t + "s",
				transition: "all " + t + "s"
			})
		},
		f = function(e, t) {
			return e.css({
				"-webkit-transform": "translate3d(0, " + t + "px, 0)",
				transform: "translate3d(0, " + t + "px, 0)"
			})
		},
		c = function(e) {
			for (var t = Math.floor(e.length / 2), n = 0; e[t] && e[t].disabled;) if (t = ++t % e.length, n++, n > e.length) throw new Error("No selectable item.");
			return t
		},
		s = function(e, t, n) {
			var i = c(n);
			return (e - i) * t
		},
		l = function(e, t) {
			return e * t
		},
		d = function(e, t, n) {
			return - (t * (n - e - 1))
		};
		a.
	default.fn.scroll = function(e) {
			function t(e) {
				y = e,
				w = +new Date
			}
			function n(e) {
				g = e;
				var t = g - y;
				u(m, 0),
				f(m, b + t),
				w = +new Date,
				_.push({
					time: w,
					y: g
				}),
				_.length > 40 && _.shift()
			}
			function i(e) {
				if (y) {
					var t = (new Date).getTime(),
					n = k - h.bodyHeight / 2;
					if (g = e, t - w > 100) E(Math.abs(g - y) > 10 ? g - y: n - g);
					else if (Math.abs(g - y) > 10) {
						for (var i = _.length - 1,
						o = i,
						r = i; r > 0 && w - _[r].time < 100; r--) o = r;
						if (o !== i) {
							var a = _[i],
							u = _[o],
							f = a.time - u.time,
							c = a.y - u.y,
							s = c / f,
							l = 150 * s + (g - y);
							E(l)
						} else E(0)
					} else E(n - g);
					y = null
				}
			}
			var r = this,
			h = a.
		default.extend({
				items:
				[],
				scrollable: ".neatui-picker__content",
				offset: 3,
				rowHeight: 34,
				onChange: a.
			default.noop,
				temp: null,
				bodyHeight: 238
			},
			e),
			p = h.items.map(function(e) {
				return '<div class="neatui-picker__item' + (e.disabled ? " neatui-picker__item_disabled": "") + '">' + ("object" == ("undefined" == typeof e ? "undefined": o(e)) ? e.label: e) + "</div>"
			}).join(""),
			v = (0, a.
		default)(this);
			v.find(".neatui-picker__content").html(p);
			var m = v.find(h.scrollable),
			y = void 0,
			g = void 0,
			w = void 0,
			b = void 0,
			_ = [],
			k = window.innerHeight;
			if (null !== h.temp && h.temp < h.items.length) {
				var j = h.temp;
				h.onChange.call(this, h.items[j], j),
				b = (h.offset - j) * h.rowHeight
			} else {
				var x = c(h.items);
				h.onChange.call(this, h.items[x], x),
				b = s(h.offset, h.rowHeight, h.items)
			}
			f(m, b);
			var E = function(e) {
				b += e,
				b = Math.round(b / h.rowHeight) * h.rowHeight;
				var t = l(h.offset, h.rowHeight),
				n = d(h.offset, h.rowHeight, h.items.length);
				b > t && (b = t),
				b < n && (b = n);
				for (var i = h.offset - b / h.rowHeight; h.items[i] && h.items[i].disabled;) e > 0 ? ++i: --i;
				b = (h.offset - i) * h.rowHeight,
				u(m, .3),
				f(m, b),
				h.onChange.call(r, h.items[i], i)
			};
			m = v.offAll().on("touchstart",
			function(e) {
				t(e.changedTouches[0].pageY)
			}).on("touchmove",
			function(e) {
				n(e.changedTouches[0].pageY),
				e.preventDefault()
			}).on("touchend",
			function(e) {
				i(e.changedTouches[0].pageY)
			}).find(h.scrollable);
			var S = "ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch;
			S || v.on("mousedown",
			function(e) {
				t(e.pageY),
				e.stopPropagation(),
				e.preventDefault()
			}).on("mousemove",
			function(e) {
				y && (n(e.pageY), e.stopPropagation(), e.preventDefault())
			}).on("mouseup mouseleave",
			function(e) {
				i(e.pageY),
				e.stopPropagation(),
				e.preventDefault()
			})
		}
	},
	function(e, t) {
		"use strict";
		Object.defineProperty(t, "__esModule", {
			value: !0
		});
		t.depthOf = function e(t) {
			var n = 1;
			return t.children && t.children[0] && (n = e(t.children[0]) + 1),
			n
		}
	},
	function(e, t) {
		e.exports = '<div class="<%= className %>"> <div class=neatui-picker__shade></div> <div class=neatui-picker> <div class=neatui-picker__hd> <a href=javascript:; data-action=cancel class=neatui-picker__action>取消</a> <span class=neatui-picker__title></span> <a href=javascript:; data-action=select class=neatui-picker__action id=neatui-picker-confirm>确定</a> </div> <div class=neatui-picker__bd></div> </div> </div> '
	},
	function(e, t) {
		e.exports = "<div class=neatui-picker__group> <div class=neatui-picker__mask></div> <div class=neatui-picker__indicator></div> <div class=neatui-picker__content></div> </div>"
	}])
});