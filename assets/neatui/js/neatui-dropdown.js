/*-------------------------
* [neuiDropdown]
* 下拉联动控件V2.1
* 适用于：PC、移动端
* Author: Mufeng
* Update: 2020.09.04
-------------------------*/
(function($){
	
	var dropdownPC = function(){

		var defaults = {
			//参数：公用
			caption: '', //下拉标题(可选).默认空.一般只在position='fixed'时使用
			position: 'absolute', //定位方式(可选). absolute 相对(默认), fixed 绝对
			json: {}, //json数据(可选)。当react=true时，本参数前台传递的值失效，json自动调用省市区三级联动的数据
			format: ["bh","mc"], //自定义json字段格式(数组)(可选)。eg.{"bh":"1001","mc":"张三"}。当react=true时，本参数前台传递的值失效，系统将默认使用：["bh","mc"]
			explained: true, //下拉项是否含说明性文字(可选), 默认true. 值为true时选中下拉项后将自动过滤掉这些说明性文字,即输入框不会包含说明性文字)
			areaFormat: ['province', 'city', 'county'], //地区显示值JSON格式(可选)
			keyFormat: ['provinceId', 'cityId', 'countyId'], //地区隐藏值JSON格式(可选)
			beautifyScrollBar: true, // 省市区同框联动时是否美化滚动条样式，默认true。 false时将使用传统的滚动条样式 add 20220718-2

			//·参数：省市区三级联动下拉
			react: false, //是否开启省市区三级联动下拉(可选)
			region: 'province', //省市区三级联动下拉类型(可选)。province 省份（默认）, city 城市， county 区县。（仅当react=true时有效）
			relatedNode:{}, //省市区三级联动下拉关联节点（即省市区3个节点的ID或ClassName)(可选,系统会自动调用).格式.eg.{"province":"#i-t-province", "city":"#i-t-city", "county":"#i-t-county"}

			//·参数：省市区同框联动下拉
			chain: false, //是否开启省市区同框联动下拉(可选).默认false
			level: 3, //省市区同框联动下拉的级别，值为2或3（仅当chain=true有效)(可选)。值：2 两级联动(省份、城市）， 3 三级联动（省份、城市、区县）(默认)
			delimiter:'-', //省市区同框联动结果值使用的分隔符(可选)。默认短横线-

			//·参数：公用
			id:'', //选择框默认值（隐藏的ID等键值)(可选)
			value:'', //选择框默认值（显示值）(可选)
			entire:'', //默认下拉值（即：默认下拉列表新增一个选项），当本参数不为空时，则默认输入框的值为entire的值，且系统将会在下拉中自动新增一项（且为第一项）值为本参数的值
			isEntireRegion: 'all', // 默认下拉值添加在哪里(可选). all 省份、城市、区县上都加(默认), province 仅加在省份上, city 仅加在城市上, county 仅加在区县上. add 20220727-1
			showCloseButton: true, //是否显示关闭按钮(可选)。默认true
			closeButtonAppearance: 'text', //关闭按钮的外观(可选). text 文字（默认），image 图片.
			callback: function(e){}, //回调函数(小写的b)。e.id 选中值的id(新值id), e.value 选中值的value(新值id), e.oldId 老值ID, e.oldValue 老值，e.prevId 上一个值ID, e.prevValue 上一个值, e.object 输入框对象
			callBack: function(e){}, //回调函数（大写的B，兼容旧版)
			zIndex:0, //自定义z-index(可选).默认0(不起作用)
			height: 32, //下拉项高度

			// add 20220718-1
			dropMaxHeight: 200, // 下拉区域最大高度(可选), 默认200px
			besidesClose: [ ], // 指定点击页面其它哪些地方时不关闭控件(可选)，默认空数组。一般用于点击非输入框(比如某个按钮)时，这时如果不排除掉这个按钮会发现点了按钮没反应。
				// 数组元素可以是选择器字符串、JQ对象或DOM对象。eg. ['#id1', '#id2', '.className1', $('#btn1'), document.getElementById('id1') ]

			responseEvent:'click' //响应的事件.默认click（暂时未用到该参数）
		};

		//自定义省市区数据源
		var customs = {
			pcProvinces:[],
			pcCitys:[],
			pcCountys:[]
		}

		var settings = {};
		
		var showBlock = function(ev,object){
			//console.log('ev:',ev);
			var options = {}
			if(typeof ev.data != 'undefined') {
				ev.stopPropagation();
				options = ev.data; //ev.data接收参数
			}else{
				options = ev;
			}
			settings = $.extend({},defaults,options||{});
			//控件对象
			var OBJ = typeof ev.data != 'undefined' ? $(this) : object;
			//旧值
			var oldKey = typeof OBJ.attr("data-bh") == "undefined" ? "" : OBJ.attr("data-bh"),
				oldText = getElementValue(OBJ);	
			//参数
			var gCaption = settings.caption == 'undefined' ? '' : settings.caption,
				gPosition = typeof settings.position == 'undefined' ? 'absolute' : settings.position,
				gJson = settings.json,
				//gFormat = isArray(settings.format) ? (settings.format.length ==2 ? settings.format : defaults.format): defaults.format,
				gFormat = isArray(settings.format) ? (settings.format.length ==2 ? settings.format : [defaults.format[0], settings.format[0]]): defaults.format, //edit 20200904-1
				gExplained = typeof settings.explained == 'undefined' ? true : (settings.explained == false ? false : true),
				gReact = settings.react,
				gRegion = settings.region,
				gRelatedNode = settings.relatedNode
				gChain = settings.chain,
				gBeautifyScrollBar = settings.beautifyScrollBar,
				gLevel = parseInt(settings.level) < 2 || parseInt(settings.level) > 3 ? 3 : parseInt(settings.level),
				gDelimiter = settings.delimiter,
				gId = settings.id,
				gValue = settings.value,
				gEntire = typeof settings.entire == 'undefined' ? '' : settings.entire,
				gEntireRegion = typeof settings.isEntireRegion  == 'undefined' ? 'all' : settings.isEntireRegion, // add 20220727-1
				gCnClose = typeof settings.isCnClose == 'undefined' ? true : (settings.isCnClose === false ? false : true), //默认true
				gCloseButtonAppearance = typeof settings.closeButtonAppearance == 'undefined' ? 'text' : settings.closeButtonAppearance,
				gCnPartEmpty = typeof settings.isCnPartEmpty == 'undefined' ? false : (settings.isCnPartEmpty === true ? true : false), //默认false
				gCnAllEmpty = typeof settings.isCnAllEmpty == 'undefined' ? false : (settings.isCnAllEmpty === true ? true : false), //默认false
				gZIndex = parseInt(settings.zIndex),
				gHeight = parseInt(settings.height) > 0 ? settings.height : defaults.height;

			var gBh = typeof OBJ.attr('data-bh') == 'undefined' ? '' : OBJ.attr('data-bh'),
				gMc = getElementValue(OBJ),
				gPlaceholder = OBJ.attr('placeholder'),
				gPlaceholder = typeof gPlaceholder=='undefined' || gPlaceholder=='' ? '请选择' : gPlaceholder;	
			
			var _captionStr = gCaption == '' ? '' : '<div class="ne-drop-down-caption">' + gCaption + '</div>';
			//=====创建节点
			var nodeClassName = gChain ? ' ne-drop-beauty ' + gCloseButtonAppearance : '';
			nodeClassName += gBeautifyScrollBar ? ' ne-drop-beautify-scrollbar' : ''; // add 20220718-2
			if(checkIsMobile()) nodeClassName += ' ne-drop-mobile';
			var _ouhtml = '<div class="ne-drop-down'+nodeClassName+'">'+ _captionStr + 
							'<div class="ne-drop-down-list"></div>'+
						'</div>';
			if($('.ne-drop-down').length==0){
				// 使用after而非append拼接在body之后，避免受body中定义的css影响,特别是定义了body{ overflow: hidden; } 时可能导致控件绝对定位时被遮挡住 edit 20220718-1
				$('body').after(_ouhtml);
			}

			//=====定位根节点
			var $parent = $('.ne-drop-down');
			var child = $parent.find('.ne-drop-down-list');

			//=====省市区数组
			var provinceSourceArr = []; //省份数组
			var citySourceArr = []; //城市数组
			var countySourceArr = []; //区县数组
			var composedSourceArr = []; //省市区合成的数组

			//=====根据不同下拉类型，合成不同数组
			if(gReact || gChain){ //省市区三级联动下拉 或 省市区同框联动下拉
				var areaArr = settings.areaFormat;
				var keyArr = settings.keyFormat;
				if(!isJsonNull(gJson)){ //自定义省市区数据源
					for(var i in customs){ //先清空customs内所有数组元素（必须）
						customs[i] = [];
					}

					if(typeof gJson.data != 'undefined'){
						for(i=0;i<gJson.data.length;i++){
							var row1 = gJson.data[i];
							var _shengId = typeof row1.id == 'undefined' ? '1'+(i+1)+'0000' : row1.id;
							var provinceName = row1[areaArr[0]],
								provinceHid = row1[keyArr[0]];
							customs.pcProvinces.push({'id':_shengId, 'value':provinceName, 'parentId':'0', 'hid':provinceHid});
							if(typeof row1.data != 'undefined'){
								for(j=0;j<row1.data.length;j++){
									var row2 = row1.data[j];
									var _shiId = typeof row2.id == 'undefined' ? '1'+(i+1)+'0'+(j+1)+'00' : row2.id;
									var cityName = row2[areaArr[1]],
										cityHid = row2[keyArr[1]];
									customs.pcCitys.push({'id':_shiId, 'value':cityName, 'parentId':_shengId, 'hid':cityHid});
									if(typeof row2.data != 'undefined'){
										for(var k=0;k<row2.data.length;k++){
											var row3 = row2.data[k];
											var _quId = typeof row3.id == 'undefined' ? '1'+(i+1)+'0'+(j+1)+'0'+(k+1) : row3.id;
											var countyName = row3[areaArr[2]],
												countyHid = row3[keyArr[2]];
											customs.pcCountys.push({'id':_quId, 'value':countyName, 'parentId':_shiId, 'hid':countyHid});
										}
									}
								}
							}
						}
					}

					//console.log('自定义的省份数据：',customs.pcProvinces,'\n城市数据：',customs.pcCitys,'\n区县数据：',customs.pcCountys);
				}
				gFormat = defaults.format;
				provinceSourceArr = !isJsonNull(gJson) ? customs.pcProvinces : null;
				citySourceArr = !isJsonNull(gJson) ? customs.pcCitys : null;
				countySourceArr = !isJsonNull(gJson) ? customs.pcCountys : null;
				if(gReact){
					var _districtJson = {} //地区json
					if(gRegion=="province") {
						if(gRelatedNode!="" || gRelatedNode!={}){
							gRelatedNode["province"] = (typeof OBJ[0].id == "undefined" || OBJ[0].id == "") ? '.' + OBJ[0].className : '#' + OBJ[0].id;
						}
						_districtJson = getProvinceJson(provinceSourceArr);
						//placeholder+="国家";
					}
					if(gRegion=="city"){
						if(gRelatedNode!="" || gRelatedNode!={}){
							gRelatedNode["city"] =  (typeof OBJ[0].id == "undefined" || OBJ[0].id == "") ? '.' + OBJ[0].className : '#' + OBJ[0].id;
						}
						var _shengId = $(gRelatedNode.province).attr("data-bh");
						_shengId = (typeof _shengId == 'undefined' || _shengId == '') ? getProvinceIDByCityName(gMc,citySourceArr) : _shengId; //先根据城市名称获取省份ID
						_shengId = _shengId == '' ? getProvinceIDByProvinceName($(gRelatedNode.province).val(),provinceSourceArr) : _shengId; //若取不到省份ID,再根据省份名称获取省份ID
						_districtJson = getCityJson(_shengId,citySourceArr);
						gPlaceholder+="省份";
					}
					if(gRegion=="county"){
						if(gRelatedNode!="" || gRelatedNode!={}){
							gRelatedNode["county"] = (typeof OBJ[0].id == "undefined" || OBJ[0].id == "") ? '.' + OBJ[0].className : '#' + OBJ[0].id;
						}
						var _shiId = $(gRelatedNode.city).attr("data-bh");
						_shiId = (typeof _shiId == 'undefined' || _shiId == '') ? getCityIDByCountyName(gMc,countySourceArr) : _shiId; //先根据区县名称获取城市ID
						_shiId = _shiId == '' ? getCityIDByCityName($(gRelatedNode.city).val(),citySourceArr) : _shiId; //若取不到城市ID,再根据城市名称获取城市ID
						_districtJson = getCountyJson(_shiId,countySourceArr);
						gPlaceholder+="城市";
					}	
					composedSourceArr = [_districtJson]; 
				}
				if(gChain){ //是省市区同框联动下拉
					var _arr = [];
					var _shengId = '', _shiId = '', _quId = '';
					var _shengName = '', _shiName = '', _quName = '';
					var _linkId = OBJ.attr('data-bh');
					var _linkName = getElementValue(OBJ);
					if(typeof _linkId != 'undefined'){
						_arr = _linkId.split(gDelimiter),
						_shengId = _arr[0],
						_shiId = _arr[1],
						_quId = gLevel != 3 ? '' : _arr[2];
						_shengName = getProvinceNameByProvinceId(_shengId,provinceSourceArr);
						_shiName = getCityNameByCityId(_shiId,citySourceArr);
					}else{
						_arr = _linkName.split(gDelimiter),
						_shengName = _arr[0],
						_shiName = _arr[1],
						_quName = gLevel != 3 ? '' : _arr[2];
					}
					//console.log("arr:",_arr);

					// edit 20220719-1
					// composedSourceArr = getChainArray(_shengName, _shiName);
					composedSourceArr = getChainArrs(_shengName, _shiId);

					//console.log('省名：',_shengName,' 市名：',_shiName,' 区名：',_quName, ' arr:',composedSourceArr);
				}
			}else{ //单个下拉
				composedSourceArr = [gJson];
			}//END IF
			//console.log('省份数组：',provinceSourceArr,' \n城市数组：',citySourceArr,'\n区县数组：',countySourceArr,'\n省市区合成数组:',composedSourceArr);

			//=====创建下拉列表
			createPullDownList(gBh, gMc, composedSourceArr);


			//=====pos位置/设置控件位置
			var pos = OBJ.offset();
			var p_h = OBJ.outerHeight(true);
			//若是在表格中
			var tdNode = "";
			if(OBJ.parents("td").length>0 ) tdNode = "td";
			if(OBJ.parents("th").length>0) tdNode = "th";
			if(tdNode!=""){
				pos = OBJ.parents(tdNode).offset();
				p_h = OBJ.parents(tdNode).outerHeight();
			}
			var left = pos.left - 10,
				top = pos.top + p_h,
				width = parseFloat(OBJ.outerWidth(true));
			//宽度自动调整
			var minW = 180; //最小宽度300
			if(gChain) minW = 300; //省市区同框联动下拉时
			if(width < minW) {
				left = left - (minW - width);
				left = left < 0 ? 0 : left;
				width = minW;
			}
			if(top + $parent.outerHeight(true) > $(window).outerHeight(true)){ //当默认下拉方向朝下时,如果高度超过屏幕高,则更改下拉方向为朝上
				top = top - $parent.outerHeight(true) - p_h - 1; //下拉方向:朝上
				if(top < 0) top = 5; //朝上超过高度时,top设为0
			}
			var _css = {'position':'absolute', 'left':left+'px', 'top':top+'px', 'display':'block', 'width':width}
			if(gPosition == 'fixed'){
				_css = {'position':'fixed', 'left':0, 'top':top+'px', 'display':'block', 'width':'100%', 'margin':'0 auto'}
			}
			$parent.css(_css);
			if(gZIndex > 0) $parent.css('z-index',gZIndex);


			var prevProvinceName = prevCityName = prevCountyName = ''; // add 20220718-3

			//=====选中某个下拉选项
			child.off('click').on('click','li:not(".wrong-tips")',function(e){ //off('click) 先释放掉,不然回调函数可能执行两次
				e.stopPropagation(); //阻止冒泡	
				var colIndex = $(this).parents('.ne-drop-down-column').index();
				//上一个值
				var prevKey = typeof OBJ.attr("data-bh") == "undefined" ? "" : OBJ.attr("data-bh");
				var prevText = getElementValue(OBJ); 
				//新值
				var tempStr = $(this).html().toString().replace(/<[^<>]+?>/g, '`'); //说明性文字(过滤html标签)
				tempStr = tempStr.replace(/(\`+)/g, '`');
				var newSmZi = tempStr.replace(/(.*)`(.*)`$/g, '$2');
				var newText = $(this).text();
				if(newSmZi == newText) newSmZi = ''; 
				if(gExplained) newText = newText.replace(newSmZi, '');
				//console.log('gExplained:', gExplained, ' \n下拉项:', newText, '\n说明文字:', newSmZi)
				var newKey = $(this).attr("data-bh");
				var newHid = typeof $(this).attr('data-hid') == 'undefined' ? '' : $(this).attr('data-hid');
				newKey = typeof newKey == "undefined" ? "" : newKey;
				//var regNumber = /^\d+$/; //检测字符串是否为数字型
				//console.log('newKey:',newKey,' regY:',regNumber.test(newKey));
				if(newKey != "" && !gChain){ // edit 20220718-3
					giveValue2SelectBox(newText, newKey, newHid); //给选择框赋值
				}
				if(gReact){ //联动下拉，清空关联值		
					if(prevText!=newText){ //前后值不一样
						if(gRegion=="province"){
							assignElementValue($(gRelatedNode.city), "");
							$(gRelatedNode.city).attr('data-bh', '');
							assignElementValue($(gRelatedNode.county, ""));
							$(gRelatedNode.county).attr('data-bh', '').attr('data-hid', '');
							//$(relatedNode.city).val("").attr("data-bh",""); //清空市值
							//$(relatedNode.county).val("").attr("data-bh",""); //清区县值
						}
						if(gRegion=="city"){
							assignElementValue($(gRelatedNode.county), "");
							$(gRelatedNode.county).attr('data-bh', '').attr('data-hid', ''); 
							//$(relatedNode.county).val("").attr("data-bh",""); //清空区县值
						}
					}
				}
				if(gChain){ //省市区同框联动下拉
					var _sourceArray = [];
					var _districtArr = gValue.split(gDelimiter);

					// edit 20220718-3
					// var	_shengName = _districtArr[0], _shiName = _districtArr[1], _quName = gLevel != 3 ? '' : _districtArr[2];
					var	_shengName = prevProvinceName == '' ? _districtArr[0] : prevProvinceName, 
						_shiName = prevCityName == '' ? _districtArr[1] : prevCityName,
						_quName = gLevel != 3 ? '' : (prevCountyName == '' ? _districtArr[2] : prevCountyName);

					var _shengId = '', _shiId = '', _quId = '';
					var _shengHid = '', _shiHid = '', _quHid = '';
					var _shiJson = _quJson = {};

					if(colIndex==0) { //省份改变时
						_shengId = newKey;
						_shengName = newText;
						_shengHid = newHid;
						if(_shengName == gEntire){ //点了省份下拉选项"全部"
							_shengId = _shiId = _quId = gEntire;
							_shengName = _shiName = _quName = gEntire;
							_shengHid = _shiHid = _quHid = gEntire;
							if(gCnClose) closeWidget();
							gLevel = 1; // 当城市为“全部”时，点市就要关闭按钮 add 20220718-3	
						}else{		
							_shiJson = getCityJson(_shengId,citySourceArr);
							if(_shiJson.data.length == 0){ // 当市没有值时，点省就要关闭按钮 add 20220718-1
								gLevel = 1;
							}
							if(_shiJson.data.length>0){
								_shiId = _shiJson.data[0].bh;
								_shiName = _shiJson.data[0].mc;
								_shiHid = _shiJson.data[0].hid;
								_quJson = getCountyJson(_shiId,countySourceArr);
								if(_quJson.data.length>0){
									_quId = _quJson.data[0].bh;
									_quName = _quJson.data[0].mc;
									_quHid = _quJson.data[0].hid;
								}
							}
						}

						// add 20220718-3
						prevProvinceName = _shengName;
						prevCityName = _shiName;
						prevCountyName = _quName;
					}

					if(colIndex==1) { //城市改变时	
						_shiId = newKey;
						_shiName = newText;
						_shiHid = newHid;
						if(_shiName == gEntire){ //点了城市下拉选项"全部"
							_shiId = _quId = gEntire;
							_shiName = _quName = gEntire;
							_shiHid = _quHid = gEntire;
							//console.log('prevText:', prevText);
							var _nameArr = prevText.split(gDelimiter);

							// edit 20220718-3
							// if(isArray(_nameArr)){
							// 	_shengName = _nameArr[0];
							// 	_shengId = getProvinceIDByProvinceName(_shengName);
							// 	_shengHid = getProvinceHidByProvinceName(_shengName, provinceSourceArr);
							// 	if(_shengId == '') _shengId = gEntire;
							// 	if(_shengHid == '')	_shengHid = gEntire;
							// }
							if(isArray(_nameArr)){
								_shengName = prevProvinceName == '' ? _nameArr[0] : prevProvinceName;
								_shengId = getProvinceIDByProvinceName(_shengName);
								_shengHid = getProvinceHidByProvinceName(_shengName, provinceSourceArr);
								if(_shengId == '') _shengId = gEntire;
								if(_shengHid == '')	_shengHid = gEntire;
								gLevel = 2; // 当城市为“全部”时，点市就要关闭按钮 add 20220718-3	
							}

							if(gCnClose) closeWidget();
						}else{
							// edit 20220719-1
							// _shengId = getProvinceIDByCityName(_shiName, citySourceArr);
							_shengId = getProvinceIDByCityId(_shiId, citySourceArr);
							_shengName = getProvinceNameByProvinceId(_shengId, provinceSourceArr);
							_shengHid = getProvinceHidByProvinceId(_shengId, provinceSourceArr);
							_quJson = getCountyJson(_shiId,countySourceArr);
							
							if(_quJson.data.length == 0){ // 当区县没有值时，点市就要关闭按钮 add 20220718-1
								gLevel = 2;
							}

							if(_quJson.data.length>0){
								_quId = _quJson.data[0].bh;
								_quName = _quJson.data[0].mc;
								_quHid = _quJson.data[0].hid;
							}
						}

						// add 20220718-3
						prevProvinceName = _shengName;
						prevCityName = _shiName;
						prevCountyName = _quName;
					}


					if(colIndex==2){ //区县改变时
						_quId = newKey;
						_quName = newText;	
						_quHid = newHid;
						if(_quName == gEntire){ //点了区县下拉选项"全部"
							_quId = gEntire;
							_quName = gEntire;
							_quHid = gEntire;
							var	_nameArr = prevText.split(gDelimiter);
							// edit 20220718-3
							// if(isArray(_nameArr)){
							// 	_shengName = _nameArr[0];
							// 	_shengId = getProvinceIDByProvinceName(_shengName);
							// 	_shengHid = getProvinceHidByProvinceName(_shengName, provinceSourceArr);
							// 	_shiName = _nameArr[1];
							// 	_shiId = getCityIDByCityName(_shiName);
							// 	_shiHid = getCityHidByCityName(_shiName, citySourceArr);
							// 	if(_shengId == '') _shengId = gEntire;
							// 	if(_shengHid == '')	_shengHid = gEntire;
							// 	if(_shiId == '') _shiId = gEntire;
							// 	if(_shiHid == '')_shiHid = gEntire;
							// }
							if(isArray(_nameArr)){
								_shengName = prevProvinceName == '' ? _nameArr[0] : prevProvinceName;
								_shengId = getProvinceIDByProvinceName(_shengName);
								_shengHid = getProvinceHidByProvinceName(_shengName, provinceSourceArr);
								_shiName = prevCityName == '' ? _nameArr[1] : prevCityName;
								_shiId = getCityIDByCityName(_shiName);
								_shiHid = getCityHidByCityName(_shiName, citySourceArr);
								if(_shengId == '') _shengId = gEntire;
								if(_shengHid == '')	_shengHid = gEntire;
								if(_shiId == '') _shiId = gEntire;
								if(_shiHid == '')_shiHid = gEntire;
							}
							
						}else{
							// edit 20220719-1
							// _shiId = getCityIDByCountyName(_quName, countySourceArr);
							_shiId = getCityIDByCountyID(_quId, countySourceArr);
							_shiName = getCityNameByCityId(_shiId, citySourceArr);
							_shiHid = getCityHidByCityId(_shiId, citySourceArr);
							// _shengId = getProvinceIDByCityName(_shiName, citySourceArr);
							_shengId = getProvinceIDByCityId(_shiId, citySourceArr);
							_shengName = getProvinceNameByProvinceId(_shengId, provinceSourceArr);
							_shengHid = getProvinceHidByProvinceId(_shengId, provinceSourceArr);
						}

						// add 20220718-3
						prevProvinceName = _shengName;
						prevCityName = _shiName;
						prevCountyName = _quName;
					}


					var _districtName = _shengName + gDelimiter + _shiName; //eg.'福建省-泉州市'
					var _districtId = _shengId + gDelimiter + _shiId; //eg.'350000-350500'
					var _districtHid = _shengHid + gDelimiter + _shiHid; 
					if(gLevel == 3){
						_districtName =  _districtName + gDelimiter + _quName; //eg.'福建省-泉州市-丰泽区'
						_districtId = _districtId + gDelimiter + _quId; //eg.'350000-350500-350503'
						_districtHid = _districtHid + gDelimiter + _quHid;
					}
					
					// add 20220718-1
					// var repReg = eval('/(\-|请选择)/g'); // gDelimiter gPlaceholder
					var repReg = eval('/(\\' + gDelimiter + '|' + gPlaceholder + ')/g');
					if(_districtName.toString().replace(repReg, '') === ''){
						_districtName = '';
						_districtId = '';
						_districtHid = '';
					}

					//var reg = eval("/([" + gDelimiter + "]+)/g");
					_districtHid = _districtHid.toString().replace(/undefined/g, '');
					
					//console.log('x1-省市区ID:',_districtId, ' \n省市区名称:',_districtName);
					//将省市区下拉值中的“全部”替换成空
					if(gEntire != '' && gCnPartEmpty){
						//var reg = new RegExp("^\\-" + gEntire + "$", "g"); //不行
						//var reg = new RegExp(/-全部/g); //可以
						var reg1 = eval('/\-' + gEntire + '/g'); //正则表达式使用变量. 替换'-全部'(可以)
						_districtName = _districtName.replace(reg1, '').replace(/\-undefined/g, '').replace(/undefined/g, '');	
					}
					if(gEntire != '' && gCnAllEmpty){
						var reg1 = eval('/\-' + gEntire + '/g'); //正则表达式使用变量. 替换'-全部'(可以)
						_districtName = _districtName.replace(reg1, '').replace(/\-undefined/g, '').replace(/undefined/g, '');	
						var reg2 = eval('/' + gEntire + '/g');
						_districtName = _districtName.replace(reg2, '').replace(/\-undefined/g, '').replace(/undefined/g, '');	;
					}

					//console.log('x2-省市区ID:',_districtId, ' \n省市区名称:',_districtName);
					// edit 20220719-1
					// _sourceArray = getChainArray(_shengName,_shiName);
					_sourceArray = getChainArrs(_shengName, _shiId);
					createPullDownList(_districtId, _districtName, _sourceArray); //更新下拉

					//edit 20220718-3
					// giveValue2SelectBox(_districtName, _districtId, _districtHid); //给选择框赋值
					if(gChain){ // 省市区县同框下拉
						if(colIndex == (gLevel - 1)){
							giveValue2SelectBox(_districtName, _districtId, _districtHid); //给选择框赋值
						}
					}else{
						giveValue2SelectBox(_districtName, _districtId, _districtHid); //给选择框赋值
					}

					newText = _districtName;
					newKey = _districtId;
					newHid = _districtHid;	
				}

				
				//调用回调函数
				var resJson = {"id":newKey, "value":newText, "explanation":newSmZi, "oldId":oldKey, "oldValue":oldText, "prevId":prevKey, "prevValue":prevText, "object":OBJ}
				//省市区县隐藏值
				if(gReact){ //三级联动下拉
					if(gRegion == 'province') {
						resJson["provinceId"] = newHid;
						OBJ.attr('data-provinceId', newHid);
					}
					if(gRegion == 'city') {
						resJson["cityId"] = newHid;
						OBJ.attr('data-cityId', newHid);
					}
					if(gRegion == 'county') {
						resJson["countyId"] = newHid;
						OBJ.attr('data-countyId', newHid);
					}
				}
				if(gChain){ //三级同框下拉
					var provinceHideValue = cityHideValue = countyHideValue = '';
					var hideValueArr = newHid.split(gDelimiter);
					if(isArray(hideValueArr)){
						provinceHideValue = hideValueArr[0];
						if(hideValueArr.length >= 2) cityHideValue = hideValueArr[1];
						if(hideValueArr.length == 3) countyHideValue = hideValueArr[2];
					}
					if(typeof provinceHideValue  == 'undefined' || provinceHideValue == 'undefined') provinceHideValue = '';
					if(typeof cityHideValue  == 'undefined' || cityHideValue == 'undefined') cityHideValue = '';
					if(typeof countyHideValue  == 'undefined' || countyHideValue == 'undefined') countyHideValue = '';

					resJson["provinceId"] = provinceHideValue;
					resJson["cityId"] = cityHideValue;
					resJson["countyId"] = countyHideValue;

					OBJ.attr('data-provinceId', provinceHideValue);
					OBJ.attr('data-cityId', cityHideValue);
					OBJ.attr('data-countyId', countyHideValue);

					// 回调
					if(colIndex == gLevel - 1){
						if(typeof settings.callback == "function") settings.callback(resJson); //小写的回调
						if(typeof settings.callBack == "function") settings.callBack(resJson); //大写的回调(兼容旧版)
					}
				}else{
					// 回调
					if(typeof settings.callback == "function") settings.callback(resJson); //小写的回调
					if(typeof settings.callBack == "function") settings.callBack(resJson); //大写的回调(兼容旧版)
				}
				



				// 关闭控件
				if(!gChain || colIndex == gLevel - 1){
					closeWidget();
				}

				/**关闭控件 */
				function closeWidget(){
					//parent.slideUp("fast","linear"); //隐藏
					$parent.remove(); //移除
				}
				function giveValue2SelectBox(ps_text, ps_key, ps_hid){
					assignElementValue(OBJ, ps_text);
					OBJ.attr('title', ps_text); //添加title属性,防止输入框太短文字显示不全时鼠标移动到上面可以显示所有文字
					OBJ.attr('data-bh', ps_key);
					OBJ.attr('data-hid', ps_hid == 'undefined' || typeof ps_hid == 'undefined' ? '' : ps_hid);
				}
			})
	

			//=====关闭按钮
			if(settings.showCloseButton) {
				$parent.find('.ne-drop-down-close').remove();
				$parent.append('<div class="ne-drop-down-close' + ' ' + gCloseButtonAppearance + '">关闭</div>');
				child.addClass('no-box-shadow');
				$parent.find('.ne-drop-down-close').on('click',function(){
					$parent.remove();
				})
			}
			
			//=====点击输入框元素以外的地方隐藏下拉区域 edit 20220718-1
			//$('body').bind('click',function(e){
			$(document).on('click', function(e){
				var target = $(e.target); // 注:e.target.closest(selector).length==0 说明点击的不是元素selector区域,反之则是
				if($parent.length>0){
					// if(target.closest(OBJ).length != 0) return;
					var isCanClose = true; // 是否能关闭控件
					if(target.closest(OBJ).length != 0 || target.closest($parent).length != 0) {
						isCanClose = false;
					}
					for(var i = 0; i < settings.besidesClose.length; i++){
						var one = settings.besidesClose[i];
						var _nowSelector = one instanceof jQuery == false ?
								(
									!isDomObject(one) ? one : 
									( one.getAttribute('id') != null ? '#' + one.getAttribute('id') : getStringClassName(one.getAttribute('class')) )
								)
								:
								( one[0].getAttribute('id') != null ? '#' + one[0].getAttribute('id') : getStringClassName(one[0].getAttribute('class')) );		
						if(e.target == e.target.closest(_nowSelector)){
							isCanClose = false;
							break;
						}
					}

					if(isCanClose){
						// parent.slideUp('fast','linear'); //隐藏下拉
						$parent.remove(); // 移除下拉
					}
				}
			});
			
			
			/**
			 * 获取省市区同框联动下拉数组1
			 * @param {*} ps_shengName 省份名称
			 * @param {*} ps_shiName 城市名称
			 */
			function getChainArray(ps_shengName, ps_shiName){
				var _provinceJson = getProvinceJson(provinceSourceArr);
				if(ps_shengName == '' || typeof ps_shengName == 'undefined') ps_shengName = _provinceJson.data[0].mc;
				var _shengId = getProvinceIDByProvinceName(ps_shengName, provinceSourceArr);
				var	_cityJson = getCityJson(_shengId, citySourceArr);
				if( ps_shiName == '' || typeof ps_shiName == 'undefined')  {
					if(_cityJson.data.length > 0)
						ps_shiName = _cityJson.data[0].mc;
				}
				var	_shiId = getCityIDByCityName(ps_shiName, citySourceArr);
				var	_countyJson = getCountyJson(_shiId, countySourceArr);
				//console.log('——x1省名：',_shengName, '市名：',_shiName);
				//console.log('——x2省数组：',provinceSourceArr,' 市数组：',citySourceArr, ' 区数组：',countySourceArr)
				//console.log('——x3省份json:',_provinceJson,' 城市json:',_cityJson, ' 区县jon:',_countyJson);
				var _arr = [];
				_arr.push(_provinceJson);
				_arr.push(_cityJson);
				if(gLevel == 3) _arr.push(_countyJson);
				return _arr;
			}



			/**
			 * 获取省市区同框联动下拉数组2 add 20220719-1
			 * @param {*} ps_shengName 省份名称
			 * @param {*} ps_shiId 城市编号
			 */
			 function getChainArrs(ps_shengName, ps_shiId){
				var _provinceJson = getProvinceJson(provinceSourceArr);
				if(ps_shengName == '' || typeof ps_shengName == 'undefined') ps_shengName = _provinceJson.data[0].mc;
				var _shengId = getProvinceIDByProvinceName(ps_shengName, provinceSourceArr);
				var	_cityJson = getCityJson(_shengId, citySourceArr);
				if( ps_shiId == '' || typeof ps_shiId == 'undefined')  {
					if(_cityJson.data.length > 0)
						ps_shiId = _cityJson.data[0].bh;
				}
				var	_shiId = ps_shiId;
				var	_countyJson = getCountyJson(_shiId, countySourceArr);
				//console.log('——x1省名：',_shengName, '市名：',_shiName);
				//console.log('——x2省数组：',provinceSourceArr,' 市数组：',citySourceArr, ' 区数组：',countySourceArr)
				//console.log('——x3省份json:',_provinceJson,' 城市json:',_cityJson, ' 区县jon:',_countyJson);
				var _arr = [];
				_arr.push(_provinceJson);
				_arr.push(_cityJson);
				if(gLevel == 3) _arr.push(_countyJson);
				return _arr;
			}
			
			/**
			 * 创建下拉列表
			 * @param {*} ps_initId 初始下拉id
			 * @param {*} ps_initVal 初始下拉值
			 * @param {*} ps_jsonArr 下拉数据源json组成的数组
			 */
			function createPullDownList(ps_initId, ps_initVal, ps_jsonArr){
				var _arrLength = ps_jsonArr.length;
				var _highlightIndexArr = [];
				var _inHtml = '';
				// add 20220718-1
				var maxHeight = settings.dropMaxHeight.toString().replace(/px/g, '');
				var _dropClassName = '';
				var _ulStyle = ' style="max-height:' + maxHeight + 'px"';

				for(var k = 0; k < ps_jsonArr.length; k++){
					_dropClassName = !gChain ? '' : ( k == 0 ? ' drop-province' : k == 1 ? ' drop-city' : ' drop-county');
					var _dataSource = ps_jsonArr[k];
					var _isZeroToolTip = gReact || gChain ? false : true;
					var _standardJson = jsonChange(_dataSource, gFormat, _isZeroToolTip); //标准格式json(转化成标准格式的json）。单个下拉时data空才报错，省市区三联动下拉或同框下拉不报错
					//console.log('_dataSource:', _dataSource, ' xx_standardJson:', _standardJson);
					var colW = 100/_arrLength;
					var ieVersion = getInternetExplorerVersion();
					if(ieVersion >=6 && ieVersion <= 7) colW = Math.floor(colW);
					
					_inHtml+='<div class="ne-drop-down-column' +  _dropClassName + '" style="width:' + colW + '%"><ul' + _ulStyle + '>'; // edit 20220718-1

					//html拼接 edit 20220727-1
					var _locateIndex = 0;
					if(typeof _standardJson.data!="undefined"){ //正确
						var _liStyleStr = ' style="min-height:'+gHeight+'px;line-height:1.5;"';
						var _mcArr = ps_initVal.indexOf(gDelimiter) >= 0 ? ps_initVal.split(gDelimiter) : [ps_initVal];
						var _bhArr = ps_initId.indexOf(gDelimiter) >= 0 ? ps_initId.split(gDelimiter) : [ps_initId];
						if(_standardJson.data.length>0){
							if(gEntire!='') _inHtml += '<li class="li-item-whole" data-bh="'+gEntire+'" data-hid="' + gEntire + '"'+_liStyleStr+'>'+gEntire+'</li>'; //系统自动加的下拉项
							$.each(_standardJson.data,function(m,items){ //根据目标输入框的值自动定位到对应选项
								//console.log('gBH:',gBh)
								var _classNameStr = '';
								if(_bhArr[k]==items.id || _mcArr[k]==items.value) { //设置高亮
									_classNameStr = ' class="on"';
									_locateIndex = m;
									_highlightIndexArr.push(_locateIndex);
								}
								var _hid = items.hide == 'undefined'  || typeof items.hid == 'undefined' ? '' : items.hid;
								_inHtml+= '<li data-bh="'+items.id+'" data-hid="' + _hid + '"' + _classNameStr + _liStyleStr + ' >'+items.value+'</li>';
							})
							//console.log('mc:',gMc,'\nentire:',gEntire,'json:',_standardJson.data[_locateIndex]);
							//if(gMc!='' && gEntire=='') obj.attr('data-bh',_standardJson.data[_locateIndex].id); //如果目标输入框有值，那就给目标输入框赋data-bh
							if(gMc == _standardJson.data[_locateIndex].value) OBJ.attr('data-bh',_standardJson.data[_locateIndex].id); //如果目标输入框有值，那就给目标输入框赋data-bh
						}else{
							var text = gEntire == '' ? gPlaceholder : gEntire;
							_inHtml+='<li class="li-item-whole"' + _liStyleStr + '>' + text + '</li>';
						}
					}else{ //出错了
						_inHtml+='<li class="wrong-tips">'+_standardJson+'</li>';
					}
					_inHtml+='</ul></div>';
					
				} //END FOR	

				//显示节点
				child.empty().append(_inHtml);

				// add 20220727-1
				if(gEntireRegion == 'province'){
					$('.ne-drop-down-column.drop-city, .ne-drop-down-column.drop-county').find('.li-item-whole').remove();
				}
				if(gEntireRegion == 'city'){
					$('.ne-drop-down-column.drop-province, .ne-drop-down-column.drop-county').find('.li-item-whole').remove();
				}
				if(gEntireRegion == 'county'){
					$('.ne-drop-down-column.drop-province, .ne-drop-down-column.drop-city').find('.li-item-whole').remove();
				}

				//重置标题
				if(gCaption != '') $parent.find('.ne-drop-down-caption').text(gCaption);
				else $parent.find('.ne-drop-down-caption').remove();

				//if(getInternetExplorerVersion() <=7 && getInternetExplorerVersion() != -1) child.css('height', parent.outerHeight(true)); 
				$parent.slideDown('fast','linear'); 
				//定位到当前值
				for(var k=0;k<ps_jsonArr.length;k++){
					var _$grand = child.find('.ne-drop-down-column').eq(k).find('ul');
					var _scrollT = _$grand.find('li').outerHeight() * (_highlightIndexArr[k] - 1);
					_$grand.animate({scrollTop:_scrollT},10); //滚动到指定位置
				}
			}
			
			
		};

		return {
			init:function(opt){
				//不能在初始化时作全局赋值,不能控件无法多处调用;需在click事件中才进行全局赋值
				//opt = $.extend({},defaults,opt||{});
				//console.log('控件初始化'); //只能用console.log() 不能用 alert()
				//settings = opt; //全局赋
				//默认值赋值
				if(opt.id) $(this).attr('data-bh',opt.id); //选择框初始id
				if(opt.value) {
					assignElementValue($(this),opt.value); //选择框初始值
					$(this).attr('title',opt.value); //添加title属性,防止输入框太短文字显示不全时鼠标移动到上面可以显示所有文字
				}
				//点击时调用控件
				return this.each(function(){
					if(opt.responseEvent=='custom'){
						showBlock(opt,$(this));
					}else{ 
						$(this).on('click',opt,showBlock); //传递参数 opt 并调用函数showBlock()
					}
				})
			}
		}

	}();


	
	/*+------------------------------------------------+*/
	/**
	 * 判断是否数组（兼容ie8)
	 * @param {*} str 要检测的字符串或数组
	 * return 返回值 true 表示是数组，false 表示非数组 
	 */
	var isArray = function(str){
		return Object.prototype.toString.call(str) == "[object Array]";
	}

	/**
	 * 判断二维json是否未定义或为空
	 * @param {} json 
	 * 当json是标准的二维json且有数据时，返回false, 否则返回true
	 */
	var isJsonNull = function(json){
		var str = (json!='' && json!={} && typeof json.data!='undefined') ? false: true;
		return str;
	}


	/**
	 * 检测是否手机端
	 * @param {boolean} 返回值 如果是手机端则返回true,否则false
	 */
	var checkIsMobile = function(){
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
	}


	/**
	 *检测IE浏览器版本号
	 */
	var getInternetExplorerVersion = function(){
		if(navigator.appName == "Microsoft Internet Explorer"){ //是ie
			var version = parseInt(navigator.appVersion.split(";")[1].toString().replace(/[ ]/g, "").replace("MSIE",""));
			return version;
		}else{
			return -1; //'抱歉，不是IE浏览器，无法检测IE版本';
		}
	}

	/**
	 * 取某个元素的值
	 * @param {*} obj 元素jq对象
	 */
	var getElementValue = function(obj){
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
	var assignElementValue = function(obj,value){
		var tagname = typeof obj[0] == 'undefined' ? '' : obj[0].tagName.toLocaleLowerCase();
		var isInput = true;
		if(tagname!='input' && tagname!='area') isInput = false;
		isInput ? obj.val(value) : obj.text(value);
	}


	/*+------------------------------------------------+*/
	/**
	 * 将不符合下拉规范的json转换成标准化的json.eg. {id:'1',value:'中国'}
	 * @param {*} ps_json 标准的json数据. eg. {"data":[{"bh":"1001","mc":"张三"},{"bh":"1001","mc":"李四"}]}
	 * @param {*} ps_fieldArr 不标准的json字段（数组）.eg.["bh","mc"]
	 * @param {*} ps_dataZeroTips 数据为空时是否报错(可选).默认true
	 * return 返回值为标准的json或错误信息： 标准json eg. {"data":[{"id":"1001","value":"张三"},{"id":"1001","value":"李四"}]}  
	 */
	var jsonChange = function(ps_json, ps_fieldArr, ps_dataZeroTips){
		var _isZeroToolTip = typeof ps_dataZeroTips == 'undefined' ? true :  (ps_dataZeroTips===false ? false : true);
		var error = "控件异常：";
		if(ps_json==""){
			error+="json为空";
			//console.log(error);
			return error;
		}else if(ps_json=={}){
			error+="json无数据";
			//console.log(error);
			return error;
		}else if(typeof ps_json.data == "undefined"){
			error+="json或data字段未定义，即：json = {} 或 json = {abc:[{},{}]} 请把abc换成data";
			//onsole.log(error);
			return error;
		}
		if(_isZeroToolTip){
			if(ps_json.data.length==0){
				//error += "下拉数据为空，即：json = {data:[ ]}";
				error = "抱歉，无可选下拉数据..";
				return error;
			}
		}
		var jsonArr = ps_json.data;
		var newJsonArr= [], id = [], value = [], hid = [];
		for(var i=0;i<jsonArr.length;i++){
			hid[i] = jsonArr[i].hid;
			if(typeof(jsonArr[i].bh)=='undefined') id[i] = [i];
			else id[i] = jsonArr[i].bh;
			//if(typeof($json[i].mc)=='undefined') value[i] = '';
			if(typeof(jsonArr[i].mc)=='undefined') value[i] = jsonArr[i].value;
			else value[i] = jsonArr[i].mc;				
			if(typeof(ps_fieldArr) == 'object'){
				var e0 = ps_fieldArr[0], e1 = ps_fieldArr[1];
				if(typeof(e1)!='undefined'){ //arr数组有两个元素时
					id[i] = typeof(jsonArr[i][e0])=='undefined' ? [i] : jsonArr[i][e0];
					value[i] = typeof(jsonArr[i][e1])=='undefined' ? jsonArr[i].value : jsonArr[i][e1];
				}else{ //arr数组只有1个元素时
					id[i] = i; // id[i] = [i]; 
					value[i] = typeof(jsonArr[i][e0])=='undefined' ? jsonArr[i].value : jsonArr[i][e0];
				}
			}
			newJsonArr.push({id:id[i], value:value[i], hid:hid[i]});
		}	
		//console.log('newJsonArr:', newJsonArr);
		//return newJsonArr;
		return {"data":newJsonArr};
	};





	/**
	 * 判断是否dom对象 add 20220718-1
	 * 首先要对HTMLElement进行类型检查，因为即使在支持HTMLElement的浏览器中，类型却是有差别的，在Chrome,Opera中HTMLElement的类型为function，此时就不能用它来判断了
	 * @param {object} ps_obj 目标对象
	 * @returns {boolean} 返回布尔值. true 是, false 否
	 */
	var isDomObject = function(ps_obj){
		return ( typeof HTMLElement === 'object' ) ?
			ps_obj instanceof HTMLElement
			:
			ps_obj && typeof ps_obj === 'object' && ps_obj.nodeType === 1 && typeof ps_obj.nodeName === 'string';
	};
	

	/**
	 * 获取字符串对应的元素节点(供jq调用)  add 20220718-1
	 * eg1. 'floor' <=> '.floor'
	 * eg2. 'floor build' <=> '.floor.build'
	 * @param {string} ps_str 字符串
	 * @returns 返回元素节点字符串
	 */
	var getStringClassName = function(ps_str){
		if(ps_str.replace(/([ ]+)/g, '') === '') return '';
		var arr = ps_str.replace(/([ ]+)/g, ' ').split(' ');
		var str = '';
		for(var i = 0; i < arr.length; i++){
			str += '.' + arr[i];
		}
		return str;
	};


	/*+------------------------------------------------+*/
	//获取全国省、市、区县数据（需在对应页面引入省市县(区)数据源chineseDistricts.js
	/**
	 * 获取省份json
	 * 数组iosProvinces是数据源中的省份数组
	 * @param {*} arr 指定省份数据源用哪个数组(可选)
	 */
	var getProvinceJson = function(arr){
		var provinceArray = typeof arr == 'undefined' || arr == null ? iosProvinces : arr;
		var $provinceJson = {data:[]};
		var $json = {};
		for(var i=0;i<provinceArray.length;i++){
			$json = {bh:provinceArray[i].id, mc:provinceArray[i].value, hid:provinceArray[i].hid};
			$provinceJson.data.push($json);
		}
		return $provinceJson;
	};

	/**
	 * 获取省份ID获取对应城市json
	 * 数组iosCitys是数据源中的市数组
	 * @param {*} ps_shengId 省份对应的编号ID
	 * @param {*} ps_shiArr 指定城市数据源用哪个数组(可选)
	 */
	var getCityJson = function(ps_shengId, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _cityJson = {data:[]};
		var $json = {};
		if(ps_shengId!=''&&typeof(ps_shengId)!='undefined'){
			for(var i=0;i<_cityArr.length;i++){
				if(_cityArr[i].parentId==ps_shengId){
					$json = {bh:_cityArr[i].id, mc:_cityArr[i].value, hid:_cityArr[i].hid};
					_cityJson.data.push($json);
				}
			}		
		}
		return _cityJson;
	};
	
	/**
	 * 获取城市ID获取对应区县json
	 * 数组iosCountys是数据源中的县(区)数组
	 * @param {*} ps_shiId 市对应的编号ID
	 * @param {*} ps_quArr 指定区县数据源用哪个数组(可选)
	 */
	var getCountyJson = function(ps_shiId, ps_quArr){
		var _countyArr = typeof ps_quArr == 'undefined'  || ps_quArr == null ? iosCountys : ps_quArr;
		var _countyJson = {data:[]};
		var $json = {};
		if(ps_shiId!=''&&typeof(ps_shiId)!='undefined'){	
			for(var i=0;i<_countyArr.length;i++){
				if(_countyArr[i].parentId==ps_shiId){
					$json = {bh:_countyArr[i].id, mc:_countyArr[i].value, hid:_countyArr[i].hid};
					_countyJson.data.push($json);
				}
			}		
		}
		return _countyJson;
	};





	/*+------------------------------------------------+*/
	/**
	 * 获取省份隐藏值（根据省份名称）
	 * @param {*} ps_shengName 省份名称
	 * @param {*} ps_shengArr 指定省份数据源用哪个数组(可选)
	 */
	var getProvinceHidByProvinceName = function(ps_shengName, ps_shengArr){
		var _provinceArr = typeof ps_shengArr == 'undefined'  || ps_shengArr == null ? iosProvinces : ps_shengArr;
		var _provinceHid = '';
		for(i=0;i<_provinceArr.length;i++){
			if(ps_shengName==_provinceArr[i].value){
				_provinceHid = _provinceArr[i].hid;
				break;
			}
		}
		return typeof _provinceHid == 'undefined' ? '' : _provinceHid;
	 };


	/**
	 * 获取省份编号（根据省份名称）
	 * @param {*} ps_shengName 省份名称
	 * @param {*} ps_shengArr 指定省份数据源用哪个数组(可选)
	 */
	var getProvinceIDByProvinceName = function(ps_shengName, ps_shengArr){
		var _provinceArr = typeof ps_shengArr == 'undefined'  || ps_shengArr == null ? iosProvinces : ps_shengArr;
		var _provinceId = '';
		for(i=0;i<_provinceArr.length;i++){
			if(ps_shengName==_provinceArr[i].value){
				_provinceId = _provinceArr[i].id;
				break;
			}
		}
		return _provinceId;
	 };


	/**
	 * 获取省份编号（根据城市名称）
	 * @param {*} ps_shiName 城市名称
	 * @param {*} ps_shiArr 指定城市数据源用哪个数组(可选)
	 */
	 var getProvinceIDByCityName = function(ps_shiName, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _provinceId = '';
		for(i=0;i<_cityArr.length;i++){
			if(ps_shiName==_cityArr[i].value){
				_provinceId = _cityArr[i].parentId;
				break;
			}
		}
		return _provinceId;
	 };


	 /**
	 * 获取省份编号（根据城市名称）add 20220719-1
	 * @param {*} ps_shiId 城市编号
	 * @param {*} ps_shiArr 指定城市数据源用哪个数组(可选)
	 */
	var getProvinceIDByCityId = function(ps_shiId, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _provinceId = '';
		for(i=0;i<_cityArr.length;i++){
			if(ps_shiId==_cityArr[i].id){
				_provinceId = _cityArr[i].parentId;
				break;
			}
		}
		return _provinceId;
	 };

	 
	 /**
	  * 获取省份名称（根据省份ID）
	  * @param {*} ps_shengId 省份ID
	  * @param {*} ps_shengArr 指定省份数据源用哪个数组(可选)
	  */
	 var getProvinceNameByProvinceId = function(ps_shengId, ps_shengArr){
		var _provinceArr = typeof ps_shengArr == 'undefined'  || ps_shengArr == null ? iosProvinces : ps_shengArr;
		var _provinceName = '';
		for(i=0;i<_provinceArr.length;i++){
			if(ps_shengId==_provinceArr[i].id){
				_provinceName = _provinceArr[i].value;
				break;
			}
		}
		return _provinceName;
	};

	/**
	  * 获取省份隐藏值（根据省份ID）
	  * @param {*} ps_shengId 省份ID
	  * @param {*} ps_shengArr 指定省份数据源用哪个数组(可选)
	  */
	 var getProvinceHidByProvinceId = function(ps_shengId, ps_shengArr){
		var _provinceArr = typeof ps_shengArr == 'undefined'  || ps_shengArr == null ? iosProvinces : ps_shengArr;
		var _provinceHid = '';
		for(i=0;i<_provinceArr.length;i++){
			if(ps_shengId==_provinceArr[i].id){
				_provinceHid = _provinceArr[i].hid;
				break;
			}
		}
		return _provinceHid;
	};



	 /**
     * 获取城市隐藏值（根据城市名称）
	 * @param {*} ps_shiName 城市名称
	 * @param {*} ps_shiArr指定城市数据源用哪个数组(可选)
	 */
	var getCityHidByCityName = function(ps_shiName, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _cityHid = '';
		for(i=0;i<_cityArr.length;i++){
			if(ps_shiName==_cityArr[i].value){
				_cityHid = _cityArr[i].hid;
				break;
			}
		}
		return typeof _cityHid == 'undefined' ? '' : _cityHid;
	};


	 /**
     * 获取城市编号（根据城市名称）
	 * @param {*} ps_shiName 城市名称
	 * @param {*} ps_shiArr指定城市数据源用哪个数组(可选)
	 */
	var getCityIDByCityName = function(ps_shiName, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _cityId = '';
		for(i=0;i<_cityArr.length;i++){
			if(ps_shiName==_cityArr[i].value){
				_cityId = _cityArr[i].id;
				break;
			}
		}
		return _cityId;
	};

	 /**
	 * 获取城市编号（根据区县名称）
	 * @param {*} ps_quName 区县值
	 * @param {*} ps_quArr 指定区县数据源用哪个数组(可选)
	 */
	var getCityIDByCountyName = function(ps_quName, ps_quArr){
		var _countyArr = typeof ps_quArr == 'undefined'  || ps_quArr == null ? iosCountys : ps_quArr;
		var _cityId = '';
		for(i=0;i<_countyArr.length;i++){
			if(ps_quName==_countyArr[i].value){
				_cityId = _countyArr[i].parentId;
				break;
			}
		}
		return _cityId;
	};


	/**
	 * 获取城市编号（根据区县编号） add 20220719-1
	 * @param {*} ps_quId 区县编号
	 * @param {*} ps_quArr 指定区县数据源用哪个数组(可选)
	 */
	 var getCityIDByCountyID = function(ps_quId, ps_quArr){
		var _countyArr = typeof ps_quArr == 'undefined'  || ps_quArr == null ? iosCountys : ps_quArr;
		var _cityId = '';
		for(i=0;i<_countyArr.length;i++){
			if(ps_quId==_countyArr[i].id){
				_cityId = _countyArr[i].parentId;
				break;
			}
		}
		return _cityId;
	};


	/**
     * 获取城市隐藏值（根据城市编号）
	 * @param {*} ps_shiId 城市编号
	 * @param {*} ps_shiArr 指定城市数据源用哪个数组(可选)
	 */
	var getCityHidByCityId = function(ps_shiId, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _cityHid = '';
		for(i = 0; i < _cityArr.length; i++){
			if(ps_shiId == _cityArr[i].id){
				_cityHid = _cityArr[i].hid;
				break;
			}
		}
		return _cityHid;
	};


	 /**
     * 获取城市名称（根据城市编号）
	 * @param {*} ps_shiId 城市编号
	 * @param {*} ps_shiArr 指定城市数据源用哪个数组(可选)
	 */
	var getCityNameByCityId = function(ps_shiId, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _cityName = '';
		for(i=0;i<_cityArr.length;i++){
			if(ps_shiId==_cityArr[i].id){
				_cityName = _cityArr[i].value;
				break;
			}
		}
		return _cityName;
	};
	
	
	

	
 
	 





	/*+------------------------------------------------+*/
	/**
	 * 对外暴露接口
	 */
	$.fn.extend({
		neuiDropdown:dropdownPC.init
	});

	/*
	$.extend({
		dropdown:{
			
		}
	});
	*/

})(jQuery);




/*-------------------------
 * [neuiDropdown对象]
 * 让前台可自由在click事件中调用控件
 * @param {object} opt 参数
 * @param {object} obj 对象
-------------------------*/
var neuiDropdown = function(opt,obj){
	opt['responseEvent'] = 'custom';
	$(obj).neuiDropdown(opt);
}