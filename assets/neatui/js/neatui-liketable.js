/**
* [neuiLikeTable]
* 类表格控件
* 特点: 支持多表格，在单表格时支持分页方式为“下拉加载更多”
* Author:ChenMufeng
* Date: 2020.03.26
* Update:2024.10.16

*/
(function($){

	/**-------------------------------------------------------
	 * 严格判断一个值是否等于NaN
	 * @param {*} value 
	 * ISNAN("听风是风"); //false
	 * ISNAN("123听风是风"); //false
	 * ISNAN(123); //false
	 * ISNAN(NaN); //true
	 */
	//const ISNAN = (value) => value !== value; //IE不支持箭头函数的写法
	function ISNAN(value){
		return value !== value;
	}

	
	///==================================================================///
	var tablePC = function(){
		var _this = null; //控件对象
		var _settings = {} //控件参数
		return {
			init:function(options){
				_this = this;
				$.privateProperty.selectorCurrent = _this;
				//将节点选择器去重后,加入数组中
				$.privateProperty.selectorArray.push(_this.selector);
				$.privateProperty.selectorArray = distinctArray($.privateProperty.selectorArray);
				var defaults = {
					setJson:{}, //列字段配置
					dataJson:{}, //表格数据
					pureRow:false, //是否创建一条空行记录,即表格一条记录也没有却要凭空新增一行(可选).值：true 是, false 否(默认). 将本参数值设为true, dataJson设为空对象{}或单行数据{name:"张三"}
					exportExcel:{ //导出excel功能(可选)
						enable: true, //是否启用(可选).默认true
						filename:'导出报表-', //文件名（可选）.系统默认的excel文件名为：'导出报表-'
						fileAutoTime:true, //导出的文件自动添加时间(hh:mm:ss)作为文件名的一部分。默认true
						extension: '.xls' //拓展名。 .xls(excel 2003)(默认), .xlsx (excel 2007,2010)
					},
					pagination:{ //表格分页参数json
						enable: true, //是否启用分页（可选）。true 是（默认），false 否. 当参数 loadMore=true时, 本参数不起作用(此时默认false)
						className: '', // 自定义分页节点样式名，默认空(可选)。eg. 'fenye-dibu-1' // add 20241016-1
						loadMore: false, //分页是否使用“下拉加载更多”方式,默认false(只支持单表格,多表格尚不支持). 当值为true时, 参数enable不起作用(此时默认为false)
						pageSize:25, //每页几条记录，默认25（可选）
						pageCount:null, //总页数（必须）
						pageMode:'list', //分页方式（可选）。list 列表形式（默认），select下拉形式
						pageInfos:true, //是否显示分页统计信息，默认true（可选）
						pageList:{ //pageMode='list'时(可选)
							listSize:5  //显示几个页码，默认5(可选），litSize>pageCount时显示所有页码.
						},
						pageSelect:{ //pageMode='select'时（可选）
							allPage:true, //全部按钮（即：通过此按钮可一次性加载全部数据）（可选）
							homePage:true, //首页按钮（可选）
							prevPage:true, //上一页按钮（可选）
							nextPage:true, //下一页按钮（可选）
							lastPage:true, //最后一页（尾页）按钮（可选）
							dropPage:true //下拉页码（一页页显示）按钮（可选）
						},				
						callback:function(e){ //回调函数（必须）.e是一个包含当前页码、每页记录数、总页数等信息的json.eg {button:"分页", curpage:1, pagesize:20, pageCount:3}
							/*
							var ls_curpage = e.curpage; //前台返回当前页码
							var tableJson = {"data":[]}//从后台读取当前页json数据		
							var subJson = [{"b1":"78.5"},{a1:"800", a2:"700", a3:"5000"}]; //subJson格式：可以是单个json或多个json组成的数组
							//return 可以是单个json或多个json组成的数组
							//return tableJson; //eg1. 单个json
							return [tableJson,subJson]; //eg2.多个json组成的数组
							*/
						}
					}
				}
				var settings = $.extend(true, {}, defaults, options || {});
				
				//创建一行空记录 20201110-1
				
				if(settings["pureRow"]){
					var oneJson = settings["dataJson"];
					if(oneJson == '' || $.isEmptyObject(oneJson) || (typeof oneJson.data != 'undefined' && oneJson.data.length == 0) ){ //数据源为空对象{}
						var oneEmptyRowJson = createAnEmptyData(settings.setJson);
							settings["dataJson"] = {data:[oneEmptyRowJson]}
					}else{ //数据源为非空对象
						if(typeof oneJson.data != 'undefined' && oneJson.data.length != 0){ //数组对象 eg. {data:[{"name":"张三"}]}
							settings["dataJson"] = oneJson;
						}else{ //一维对象 eg.{"name":"张三"}
							settings["dataJson"] = {data:[oneJson]}
						}
					}
				}

				//
				var datasource = settings.dataJson;
				var configure = settings.setJson;
				var htmlArr = configure.capHTML;
				var nestDepth = typeof configure["nestDepth"] == 'undefined' ? 1 : parseInt(configure["nestDepth"]);
				var pendMethod = typeof configure["pendMethod"] == 'undefined' ? "empty" : configure["pendMethod"];

				if(pendMethod == 'empty'){
					_this.empty(); //清空数据
				}

				var defaultTip = '抱歉，没有找到相应数据..';
				var tips = typeof configure["emptyDataTips"] == 'undefined' ? defaultTip : configure["emptyDataTips"] == '' ? defaultTip : configure["emptyDataTips"];
				var nodataNode = '.ne-like-nodata';
				var nodataHtml = '<div class="' + nodataNode.toString().replace(/[\.\#]/g, '') + '"><span>' + tips + '</span></div>';
				if(nestDepth >= 2){
					if(!checkSourceHasData(datasource)){
						_this.hide();
						if($(nodataNode).length == 0) $(_this).after(nodataHtml);
						else $(nodataNode).show();
					}else{
						_this.show();
						$(nodataNode).hide();
						for(var i=0; i< datasource.data.length; i++){
							settings.dataJson = datasource.data[i];
							if(checkSourceHasData(settings.dataJson)){
								if(isArray(htmlArr)) settings.setJson.capHTML = htmlArr[i];
								createPageList(settings);				
								createBookList(settings);
							}
						}
					}
				}else{
					if(!checkSourceHasData(datasource)){
						_this.hide();
						if($(nodataNode).length == 0) $(_this).after(nodataHtml);
						else $(nodataNode).show();
					}else{
						_this.show();
						$(nodataNode).hide();
						createPageList(settings);
						createBookList(settings);
					}
				}

				//自定义标题HTML
				var relatedEle = $.privateProperty.selectorCurrent.selector.replace(/[\.\#]/g,'');
				if(pendMethod == 'empty'){
					$.privateProperty.captionArray[relatedEle] = htmlArr; //全局赋值
				}else{ // pendMethod=='insert'
					if($.privateProperty.insertTimes == 0) $.privateProperty.captionArray[relatedEle] = [];
					for(var k = 0; k < htmlArr.length; k++){
						$.privateProperty.captionArray[relatedEle].push(htmlArr[k]);
					}
					$.privateProperty.insertTimes++;
				}

				$.privateProperty.educeExcel = settings.exportExcel; //全局赋值

				_settings = settings; //全局赋值
			
			},
			getObject:function(){ //获取对象
				var obj = $.privateProperty.selectorCurrent == null ? _this : $.privateProperty.selectorCurrent 
				return obj;
			},
			getSettings:function(){ //获取参数
				return _settings;
			}
		}

	}(); //END FUNCTION //注：函数表达式后面加括号()，当js解析到此函数表达式时便能立即调用函数




	///==================================================================///
	/**
	 * 创建表格
	 * @param {object}} ps_opt 前台提供的参数
	 * @param {object} ps_params 控件内部参数(可选). 
	 * 本参数可用于:
		1.指定要清除的某个表格节点,并创建新表格节点
		2.指定某个表格列排序方式
		3.清空所有表格节点
		eg.
		{ 
			root:"", //当前某个表格的根节点(可选)
			dump:false, //追加数据的方式,即是否清空表格节点(可选),默认true
			sort:false, //是否点表头排序时(可选), 默认false
			isAdding:false, //是否新增记录时(可选),默认false add 20201114-1
			outfit:false, //是否要清空表头,即重建表头防止表头一直追加列(可选). 默认false
			montage:"behind" //追加记录方式(可选). behind 追加到后面(默认), before 追加到最前面
			undefinedEmpty:false //是否将undefined变成空(可选). 默认false
		}
	 */
	var createBookList = function(ps_opt, ps_params){
		var _this = tablePC.getObject();
		var tableIdClass = $.privateProperty.tableRootElement;
		var prefixEle = tableIdClass.replace(/[\.\#]/g, ''), //ID Class前辍
			eleNode = '#' + prefixEle + '-' + generateRandChar(); //新根节点
		var settings = ps_opt;
		var configure = settings.setJson,
			datasource = settings.dataJson,
			oldNode = typeof ps_params == 'undefined' ? eleNode : (typeof ps_params["root"] == 'undefined' ? eleNode : ps_params["root"]); //旧根节点
		var dump = typeof ps_params == 'undefined' ? true : ( typeof ps_params["dump"] == 'undefined' ? true : (ps_params["dump"] === false ? false : true)); //默认true
		var runSort = typeof ps_params == 'undefined' ? false : (typeof ps_params["sort"] == 'undefined' ? false : (ps_params["sort"] === true ? true : false)); //默认false
		var runAdd = typeof ps_params == 'undefined' ? false : (typeof ps_params["isAdding"] == 'undefined' ? false : (ps_params["isAdding"] === true ? true : false)); //默认false add 20201114-1
		var clearTbHead = typeof ps_params == 'undefined' ? false : (typeof ps_params["outfit"] == 'undefined' ? false : (ps_params["outfit"] === true ? true : false)); //默认false
		var montage = typeof ps_params == 'undefined' ? 'behind' : (typeof ps_params["montage"] == 'undefined' ? 'behind' : (ps_params["montage"] === 'before' ? 'before' : 'behind')); //默认behind
		var isUndefinedEmpty = typeof ps_params == 'undefined' ? false : (typeof ps_params["undefinedEmpty"] == 'undefined' ? false : (ps_params["undefinedEmpty"] === true ? true : false)); //默认false

		//console.log('ps_params：', ps_params, '-eleNode：', eleNode); //test2
		var nowpage = parseInt($.privateProperty.pageCurpage[_this.selector.replace(/[\.\#]/g,'')]);
		if($.privateProperty.singleScroll) nowpage = $.privateProperty.singleCurpage;
		if(isNaN(nowpage)) nowpage = 1;

		var columnsArr = configure["columns"];
		if(!configure || $.isEmptyObject(configure)){
			console.log('警告：请设置SETJSON');
			return;
		}
		if(!datasource || $.isEmptyObject(datasource)){
			console.log('警告：请设置DATAJSON');
			return;
		}
		if(!isArray(columnsArr)){
			console.log('警告：COLUMNS不是数组');
			return;
		}
		if(typeof datasource == 'string' || isArray(datasource)){
			console.log('警告：列表数据不是标准JSON');
			return;
		}


		/*+------------------------------+*/
		//---公用
		//固定值/默认值
		//var barHeight = 28; //水平滚动条高度或垂直滚动条宽度
		var barHeight = getScrollbarWidth(); //水平滚动条高度或垂直滚动条宽度. 17px\28px
		var trackBtHeight = 5; //滚动条两端按钮高
		var ceilPad = 5; //单元格padding值
		var ceilW = 42; //默认列宽. eg. 50 edit 20221115 by mufeng
		var btnW = 35; //默认按钮宽. eg. 30
		var marginL = 2; //默认单元格元素之间的间距2px
		var columnHasMargin = true; //列之间是否有margin值

		//外层字段
		var caption = typeof configure["caption"] == 'undefined' ? '' : configure["caption"],
			capHTML = typeof configure["capHTML"] == 'undefined' ? '' : configure["capHTML"],
			headHeight = typeof configure["headHeight"] == 'undefined' ? 'auto' : (configure["headHeight"] == 'auto' ? 'auto' : parseFloat(configure["headHeight"]) + 'px'),
			headHasBgColor = typeof configure["headHasBgColor"] == 'undefined' ? true : (configure["headHasBgColor"] === false ? false : true), //默认true
			headWrap = typeof configure["headWrap"] == 'undefined' ? false : (configure["headWrap"] === true ? true : false), //默认false. add 20200408-1
			headSubWrap = typeof configure["headSubWrap"] == 'undefined' ? true : (configure["headSubWrap"] === false ? false : true), //默认true
			rowHeight = typeof configure["rowHeight"] == 'undefined' ? 'auto' : parseFloat(configure["rowHeight"]),
			tbodyHeight = typeof configure["tbodyHeight"] == 'undefined' ? 'auto' : parseFloat(configure["tbodyHeight"]),
			topHeight = typeof configure["topHeight"] == 'undefined' ? 'auto' : parseFloat(configure["topHeight"]),
			botHeight = typeof configure["botHeight"] == 'undefined' ? 'auto' : parseFloat(configure["botHeight"]),
			nestDepth = typeof configure["nestDepth"] == 'undefined' ? 1 : parseInt(configure["nestDepth"]),
			widthMinusTwoFold = typeof configure["widthMinusTwoFold"] == 'undefined' ? true : configure["widthMinusTwoFold"] === false ? false : true;

		var customize = typeof configure["customize"] == 'undefined' ? null : configure["customize"];
		var primaryKey = typeof configure["primaryKey"] == 'undefined' ? null : configure["primaryKey"];
		var isCheckboxCol = typeof configure["isCheckboxCol"] == 'undefined' ? false : (configure["isCheckboxCol"] === true ? true : false); //默认false
		var isSerialCol = typeof configure["isSerialCol"] == 'undefined' ? true : (configure["isSerialCol"] === false ? false : true); //默认true
		var isCeilLine = typeof configure["isCeilLine"] == 'undefined' ? false : (configure["isCeilLine"] === true ? true : false); //默认false
		var isRowHeightEqual = typeof configure["isRowHeightEqual"] == 'undefined' ? false : (configure["isRowHeightEqual"] === true ? true : false); //默认false
		var isVerticalScrollBar = typeof configure["isVerticalScrollBar"] == 'undefined' ? false : (configure["isVerticalScrollBar"] === true ? true : false); //默认false
		var isShowBrowserVerticalBar = nestDepth > 1 ? true : isVerticalScrollBar;
	
		var stateColumn = typeof configure["stateColumn"] == 'undefined' ? null : configure["stateColumn"],
			isStateCol = stateColumn == null ? false : (typeof stateColumn["show"] == 'undefined' ? false : (stateColumn["show"] === true ? true : false)); //默认false
			stateInitValue = stateColumn == null ? '' : (typeof stateColumn["value"] == 'undefined' ? '' : stateColumn["value"]),
			unsaveText = stateColumn == null ? '未保存' : (typeof stateColumn["unsaveText"] == 'undefined' ? '未保存' : stateColumn["unsaveText"]),
			savedText = stateColumn == null ? '已保存' : (typeof stateColumn["savedText"] == 'undefined' ? '已保存' : stateColumn["savedText"]);

		var isSorted = typeof configure["isSorted"] == 'undefined' ? true : (configure["isSorted"] === false ? false : true); //默认true
		var serialColumnWidth = customize == null ? ceilW : parseFloat(customize["serialColumnWidth"]);
		var discoloration = customize == null ? false: customize["discoloration"] === true ? true : false;
		var retainIllegalChar = customize == null ? false: customize["retainIllegalChar"] === true ? true : false;

		//重写
		rowHeight = isNaN(rowHeight) ? 'auto' : rowHeight;
		tbodyHeight = isNaN(tbodyHeight) ? 'auto' : tbodyHeight;
		topHeight = isNaN(topHeight) ? 'auto' : topHeight;
		topHeight = topHeight == 'auto' ? 0 : parseFloat(topHeight);
		botHeight = isNaN(botHeight) ? 'auto' : botHeight;
		botHeight = botHeight == 'auto' ? 0 : parseFloat(botHeight);
		nestDepth = isNaN(nestDepth) ? 1 : nestDepth;
		serialColumnWidth = isNaN(serialColumnWidth) ? ceilW : serialColumnWidth;

		//设值
		//var hPT = headHeight > 35 ? (!headWrap ? (headHeight - 21) / 2 : '') : ''; //edit 20200408-1
		//var _hPTStr = hPT == '' ? '' : 'padding-top:' + hPT + 'px;';
		var _capStr = capHTML == '' ? (caption == '' ? '' : '<h2 class="cap-title">' + caption + '</h2>') : capHTML;
		var _captionStr = _capStr == '' ? '' : '<div class="table-caption caption">' + _capStr + '</div>';
		var _headBgClass = headHasBgColor ? ' has-bg-color' : '';
		var _headSubClass = headSubWrap ? ' has-sub-wrap' : '';
		var _headStyle = headHeight == 'auto' ? '' : 'style="height:' + headHeight + '"';
		var _tbClass = isCeilLine ? ' has-border ceil-pad-' + ceilPad : '';

		/*+------------------------------+*/
		//---创建外层节点
		var _allHTML = [
			'<div class="' + prefixEle + ' like-table' + _tbClass + ' showjson outer" id="' + eleNode.replace(/[\#\.]/g, '') + '">',
				'<div class="inner">',
					_captionStr,
					'<div class="table-content">',
						//test5
						'<div class="table-scrollbar" style="width:' + barHeight + 'px"><div class="scrollbar-div"></div></div>',
						//'<div class="thumb"></div><div class="table-scrollbar" style="width:' + barHeight + 'px"><div class="scrollbar-div"></div></div>',
						'<div class="table-inner">',
							'<div class="block-info table-info"></div><!--/.block-info-->',
							'<div class="block-list table-list">',
								'<div class="list-title column' + _headBgClass + _headSubClass + '"' + _headStyle + '></div><!--/.list-title-->',
								//'<div class="list-title column" style="height:' + headHeight + ';' + _hPTStr + '"></div><!--/.list-title-->',
								'<div class="list-content"></div><!--/.list-content-->',
							'</div><!--/block-list-->',
						'</div><!--/.table-inner-->',
					'</div><!--/.table-content-->',
				'</div><!--/.inner-->',
			'</div><!--/.section-table-->'
		].join('\r\n');


		var $moreNode = null;
		//console.log('旧节点oldNode:', $(oldNode)); //test2
		if($(oldNode).length > 0) { //已有节点时（再加载）(用于表头排序、下拉加载更多)
			if(runSort){ //排序时
				$(_allHTML).insertBefore($(oldNode)); //在旧节点前插入新节点
				$(oldNode).remove(); //移除旧节点
				$moreNode = $(eleNode);
				//$(eleNode).attr('id', $(oldNode).selector.replace(/[\.\#]/g,'')); //test3
				//$moreNode = $(oldNode);
				//console.log('点我了排序'); //test2
			}else{
				$moreNode = $(oldNode);
			}
		}else{ //无节点时（用于加载数据，如点查询按钮、分页按钮）
			//console.log('没点排序'); //test2
			if(_this.length > 0){ 
				//if(dump) _this.empty();
				_this.append(_allHTML);
				//_this.empty().append(_allHTML);
			}
			else {
				//$(eleNode).remove();
				$('body').append(_allHTML); 
			}
			$moreNode = $(eleNode);
		}
		if(runAdd && runSort){ //add 20201114-1
			$moreNode.prev().remove();
		}

		if(!isShowBrowserVerticalBar) $('body').css('overflow-y', 'hidden');


		/*+------------------------------+*/
		//定义父节点
		//var $parent = $(eleNode);
		var $parent = $moreNode;
		//console.log('新节点parent:', $parent, ' \neleNode：', $(eleNode)); //test2
		

		/*+------------------------------+*/
		//全局对象赋值
		$.privateProperty.tableRootNode = $parent; 
		$.privateProperty.tableNestDepth = nestDepth;
		$.privateProperty.options = settings;
		$.privateProperty.unchangeTxt = unsaveText;
		$.privateProperty.changedTxt = savedText;
		$.privateProperty.remainIllegalChar = retainIllegalChar;


		/*+------------------------------+*/
		//---创建表头与表身
		var snippetArr = []; //代码片段(二维数组,每个元素是一个json对象. eg. [{row:"行索引", "message":"JS代码"}, [{row:"行索引", "message":"JS代码"}])
		var _headHTML = _bodyHTML = '';
		$.each(datasource.data, function(i, items){ //循环数据(行)
			var pagesize = ISNAN(parseInt(settings.pagination.pageSize)) ? 25 : parseInt(settings.pagination.pageSize); //默认每页25条记录
			var xuhao = parseInt(nowpage - 1) * pagesize + (i + 1);
			if(settings.pagination.loadMore){ //下拉更多时
				xuhao += (parseInt(nowpage - 1) * parseInt(settings.pagination.pageSize));
			}
			//console.log('nowpage:', nowpage, ' xuhao:', xuhao);

			var _rowClass = !discoloration ?  '' : ( xuhao %2 == 0 ? ' interlacing' : '');
			var _rowStyleStr = rowHeight == 'auto' ? '' : ' style="height:' + rowHeight + 'px"';
			_bodyHTML +=  '<div class="list-one column' + _rowClass + '"' + _rowStyleStr + '>';
			for(var j = 0; j < columnsArr.length; j++){ //循环配置(列)
				var row = columnsArr[j];
				//__·内层字段
				var title = row["title"],
					subtitle = typeof row["subtitle"] == 'undefined' ? null : row["subtitle"],
					field = typeof row["field"] == 'undefined' ? null : row["field"],
					hide = typeof row["hide"] == 'undefined' ? null : row["hide"] === '' ? null : row["hide"],
					orderway = typeof row["orderway"] == 'undefined' ? '' : row["orderway"],
					must = typeof row["must"] == 'undefined' ? '0' : (row["must"] == true ? '1' : '0'),
					unique = typeof row["unique"] == 'undefined' ? '0' : (row["unique"] == true ? '1' : '0'),
					width = typeof row["width"] == 'undefined' ? ceilW : (parseFloat(row["width"]) < ceilW ? ceilW : parseFloat(row["width"])),
					height = typeof row["height"] == 'undefined' ? 'auto' : parseFloat(row["height"]),
					type = typeof row["type"] == 'undefined' ? 'string' : row["type"],
					mode = typeof row["mode"] == 'undefined' ? 'normal' : row["mode"],
					name = typeof row["name"] == 'undefined' ? null : row["name"],
					label = typeof row["label"] == 'undefined' ? null : row["label"],
					fontSize = typeof row["fontSize"] == 'undefined' ? null : row["fontSize"],
					fontColor = typeof row["fontColor"] == 'undefined' ? null : row["fontColor"],
					b_alt = typeof row["b_alt"] == 'undefined' ? null : row["b_alt"],
					b_onlyImage = typeof row["b_onlyImage"] == 'undefined' ? false : (row["b_onlyImage"] == true ? true : false), //默认false
					align = typeof row["align"] == 'undefined' ? 'left' : row["align"],
					colHeadBgColor = typeof row["colHeadBgColor"] == 'undefined' ? '' : row["colHeadBgColor"],
					colHeadColor = typeof row["colHeadColor"] == 'undefined' ? '' : row["colHeadColor"],
					colArrowColor = typeof row["colArrowColor"] == 'undefined' ? '' : row["colArrowColor"],
					sticky = typeof row["sticky"] == 'undefined' ? false : (row["sticky"] === true ? true : false), //默认false
					readonly = typeof row["readonly"] == 'undefined' ? false : (row["readonly"]=== true ? true : false), //默认false
					disabled = typeof row["disabled"] == 'undefined' ? false : (row["disabled"]=== true ? true : false), //默认false
					border = typeof row["border"] == 'undefined' ? 'all' : row["border"],
					r_unit = typeof row["r_unit"] == 'undefined' ? null : row["r_unit"],
					r_icon = typeof row["r_icon"] == 'undefined' ? null : row["r_icon"],
					b_icon = typeof row["b_icon"] == 'undefined' ? null : row["b_icon"],
					display = typeof row["display"] == 'undefined' ? 'all' : row["display"],
					value = typeof row["value"] == 'undefined' ? '' : row["value"],
					asHidVal = typeof row["asHidVal"] == 'undefined' ? false : (row["asHidVal"] == true ? true : false), //默认false
					defaults = typeof row["default"] == 'undefined' ? '' : row["default"],
					hiddens = typeof row["hidden"] == 'undefined' ? '' : row["hidden"],
					component = typeof row["component"] == 'undefined' ? null : row["component"],
					format = typeof row["format"] == 'undefined' ? null : row["format"],
					code = typeof row["code"] == 'undefined' ? null : row["code"],
					choice = typeof row["choice"] == 'undefined' ? null : row["choice"],
					digit = typeof row["digit"] == 'undefined' ? '' : ( ISNAN(parseInt(row["digit"])) ? '' : parseInt(row["digit"]) ),
					subtotal = typeof row["subtotal"] == 'undefined' ? '0' : row["subtotal"] == true ? '1' : '0', //默认false(即0)
					merge = typeof row["merge"] == 'undefined' ? null : row["merge"]; //add 20201110-2

				//__·重算值
				height = isNaN(height) ? 'auto' : height;
				if(colHeadBgColor != '') columnHasMargin = false;
				//console.log('列名：', title, '列宽:',width, '列模式：',mode);


				//__·校验：
				//必须有field字段	
				if(mode != 'button' && mode.indexOf('mark') < 0 && (field == null || field == '')){
					var tips = title == '' ? '' : '【' + title + '】一列';
					console.log('警告：SETJSON COLUMNS第' + (i+1) + '个元素' + tips + '必须填写FIELD属性');
					return;
				}

				//__·设定
				var _displayStr = display != 'none' ? '' : ';display:none;';
				var _colClass = (field == '' || field == null) ? 'col-' + mode : 'col-' + field;
				var _stickyClass = sticky ? ' foremost' : '';
				var _alignClass = align == 'left' ? '' : ' ' + align;
				var _colBgColorStr = colHeadBgColor == '' ? '' : ';background-color:' + colHeadBgColor;
				var _colColorStr = colHeadColor == '' ? '' : ';color:' + colHeadColor;
				var _arrowStyle = colArrowColor == '' ? '' : ' style="color:' + colArrowColor + '"';
				var _cellColorStr = fontColor == null ? '' : ';color:' + fontColor;
				var _cellSizeStr = fontSize == null ? '' : ';font-size:' + fontSize;
				

				//__·表头
				//头部HTML
				if(i == 0){
					var _arrowSvg = !isSorted ? '' : '<i class="arrow-svg-wrap"' + _arrowStyle + '><i class="fa fa-caret-up"></i><i class="fa fa-caret-down"></i></i>';
					var _arrowStr = mode == 'button' ? '' : _arrowSvg;
					if(j == 0){ //前面列
						if(isCheckboxCol){
							_headHTML += '<div class="col-checkbox" data-title="复选框" data-field="multiple" data-sort="' + orderway + '" data-must="0" data-unique="0" style="width:' + serialColumnWidth + 'px"><span>选择</span></div>'; //序号列
						}
						if(isSerialCol){
							_headHTML += '<div class="col-order" data-title="序号" data-field="xuhao" data-sort="' + orderway + '" data-must="0" data-unique="0" style="width:' + serialColumnWidth + 'px"><span>序号</span></div>'; //序号列
						}	
						if(primaryKey != null){ //主键列
							var keyArr = typeof primaryKey["field"] == 'undefined' ? [] : primaryKey["field"];
							var show = typeof primaryKey["show"] == 'undefined' ? false : primaryKey["show"] === true ? true : false; //默认false
							if(isArray(keyArr)){
								var _showStyle = show ? '' : 'style="display:none"';
								if(keyArr.length >= 1) _headHTML += '<div class="col-key"' + _showStyle + ' data-title="主键" data-field="key" data-must="0" data-unique="0"><span>主键</span>' + _arrowStr + '</div>';
							}
						}		
					}

					//中间列
					var _subtitleStr = subtitle == null ? '' : '<em>' + subtitle + '</em>';
					var _dataMeshDirecStr = _dataMeshNumcStr = '';
					if(merge != null){
						var direction = typeof merge["direction"] == 'undefined' ? null : (merge["direction"] == 'prev' ? 'prev' : 'next');
						var numeral = typeof merge["numeral"] == 'undefined' ? null : ( ISNAN(parseInt(merge["numeral"])) ? null : parseInt(merge["numeral"]) );
						_dataMeshDirecStr = ' data-mesh-direc="' + direction + '"';
						_dataMeshNumcStr = ' data-mesh-numc="' + numeral + '"';
					}
					var _dataDefaultStr = defaults == '' ? '' : ' data-default="' + defaults + '"';
					var _dataHideStr = hiddens == '' ? '' : ' data-hidden="' + hiddens + '"';
					_headHTML += '<div class="' + _colClass + _stickyClass + '" data-title="' + title + '" data-field="' + field + '" data-type="' + type +　'" data-sort="' + orderway + '" data-must="' + must + '" data-unique="' + unique + '" data-digit="' + digit + '" data-sub="' + subtotal + '"' + _dataDefaultStr + _dataHideStr + _dataMeshDirecStr + _dataMeshNumcStr + ' style="width:' + width + 'px' + _displayStr + _colBgColorStr + _colColorStr + '"><span>' + title + '</span>' + _subtitleStr + _arrowStr + '</div>';
					
					//后面列
					if(j == (columnsArr.length - 1)){
						if(isStateCol) {
							_arrowStr = _arrowSvg;
							//_headHTML += '<div class="col-status" data-sort="' + orderway + '"><span>状态</span>' + _arrowStr + '</div>'; //状态列
							_headHTML += '<div class="col-status" data-title="状态" data-field="status" data-sort="' + orderway + '" data-must="0" data-unique="0"><span>状态</span>' + '</div>'; //状态列
						}
					}
				}

				//__·表身
				var _editBoxStr = '', _compoBoxStr = '';
				var _borderClass = border != 'none' ? '' : ' no-border'; 
				var _readonlyStr = !readonly ? '' : ' readonly';
				var _disabledStr = !disabled ? '' : ' disabled';
				var _bIconStr = b_icon == null ? ''  : '<i class="fa fa-' + b_icon + '"></i>';
				var cWidth = 0;
				var cAlign = '';
				if(component != null){ //单元格内容组合		
					cAlign = typeof component["align"] == 'undefined' ? 'right' : component["align"];
					var	cMode = typeof component["mode"] == 'undefined' ? 'button' : component["mode"],
						cLabel =typeof component["label"] == 'undefined' ? '' : component["label"],
						cPlaceholder = typeof component["placeholder"] == 'undefined' ? '' : component["placeholder"],
						cName = typeof component["name"] == 'undefined' ? '' : component["name"],
						cWidth = typeof component["width"] == 'undefined' ? btnW  : parseFloat(component["width"]);
					if(cMode == 'button'){
						var _marginStr = cAlign == 'left' ? 'margin-right:' + marginL +'px;' : 'margin-left:' + marginL + 'px;';
						var _btnClass = cName == '' ? '' : 'btn-' + cName;
						var _cHeightStr = height == 'auto' ? '' : 'height:' + height + 'px;';
						var _cStyleStr = ' style="width:' + cWidth + 'px;' + _cHeightStr + _marginStr + 'padding:0;"';
						_compoBoxStr = '<button type="button" class="' + _btnClass + '"' +  _cStyleStr + '>' + cLabel + '</button>';
					}
				}

				var eWidth = width - cWidth - marginL;
				if(isCeilLine) eWidth -= ceilPad * 2 + 2; //有边线时要减去padding*2，再减去边线宽2px
				var _eWidthStr = eWidth == width ? '' : 'width:' + eWidth+ 'px;';
				var _eHeightStr = height == 'auto' ? '' : 'height:' + height + 'px';				
				var _fieldClass = (field == null || field == '') ? '' : 'i-t-' + field;
				var _nameClass = (name == null || name == '') ? '' : ' ' + name;

				//取数据值
				var textVal = (value == '' ? items[field] : value);
				if(isUndefinedEmpty){
					textVal = typeof textVal == 'undefined' ? '' : textVal;
				}
				var initialVal = textVal;
				if(mode.indexOf('mark') >= 0) textVal = value;
				if(digit != '' && checkIsXiaoshu(textVal)){ //保留N位小数
					textVal = parseInt(digit) < 0 ? textVal : parseFloat(textVal).toFixed(parseInt(digit));
				}
				if(format != null){ //计算公式，即“当值是由同一行某些单元格算出来”时（可选）.
					var reg = /\[\"(.+?)\"\]/g;
					try{
						if(reg.test(format)){
							var str = format.replace(reg, 'items["$1"]');
							str = str.replace(/eval\((.*)\)/g, '$1'); //去掉eval()
							var result = eval(str);
							//if(!isNaN(result)) textVal = result;
							if(!ISNAN(result)) textVal = result;
							if(typeof textVal == 'undefined' || textVal.toString().indexOf('undefined') >= 0) textVal = '';
						}
					}catch(err){
						if(typeof textVal == 'undefined' || textVal.toString().indexOf('undefined') >= 0) textVal = '';
						//console.log(err);
						console.log('警告：列字段配置时出错！' + title + '一列“format”参数值字段没有用双引号引用起来，即字段["ABC"]双引号必须是成对的');
					}
				}

				if(code != null){ //代码片段，存储表格每行要执行的js代码
					var reg = /\[\"(.+?)\"\]/g;
					try{
						if(reg.test(code)){
							var str = code.replace(reg, 'items["$1"]');
							str = str.replace(/eval\((.*)\)/g, '$1'); //去掉eval()
							var result = eval(str);
							//console.log('字符串：',str, '\n结果：',result);
							snippetArr.push({"row": i, "message": !ISNAN(result) ? result : ""});
						}
					}catch(err){
						//console.log(err);
						console.log('警告：列字段配置时出错！' + title + '一列“code”参数值字段没有用双引号引用起来，即字段["ABC"]双引号必须是成对的');
					}
				}
				
				//placeholder
				var _placeholderStr = '';
				var _focusStr = '';
				var _blurStr = '';
				var _placeholderWenzi = readonly ? '选择' : '填写';
				if(parseInt(must) == 1){
					_placeholderStr = ' placeholder="请' + _placeholderWenzi + '' + title + '"';
					_focusStr = ' onfocus="this.placeholder=\'\'"';
					_blurStr = ' onblur="this.placeholder=\'请' + _placeholderWenzi + '' + title + '\'"';
				}
				var _dataBhStr = '';
				if(hide != null) _dataBhStr = ' data-bh="' + (typeof items[hide] == 'undefined' ? '' : items[hide]) + '"';
				else{
					if(asHidVal) _dataBhStr = ' data-bh="' + initialVal + '"';
				}
				
				
				//判断类型
				if(mode.indexOf('normal') >= 0){ //纯文本
					_editBoxStr = textVal;
					if(navigator.appName == "Microsoft Internet Explorer"){ //解决ie浏览器中内容为空时即使设置了宽度也不占据空间的bug
						if(textVal == ''){
							_editBoxStr = '<span class="' + _fieldClass + _nameClass + _borderClass + '"' + _dataBhStr + '>' + textVal + '</span>';
						}
					}
				}
				if(mode.indexOf('span') >= 0){ //span标签
					_editBoxStr = '<span class="' + _fieldClass + _nameClass + _borderClass + '"' + _dataBhStr + '>' + textVal + '</span>';
				}
				if(mode.indexOf('input') >= 0){ //单行文本
					_editBoxStr = '<input type="text" class="' + _fieldClass + _nameClass + _borderClass + '" value="'+ textVal + '"' + _dataBhStr + _readonlyStr + _disabledStr + _placeholderStr + _focusStr + _blurStr + ' style="' + _eWidthStr + _eHeightStr + '">';
				}
				if(mode.indexOf('textarea') >= 0){ //多行文本
					_editBoxStr = '<textarea class="' + _fieldClass + _nameClass + _borderClass + '"' + _dataBhStr + _readonlyStr + _disabledStr + _placeholderStr + _focusStr + _blurStr + ' style="' + _eWidthStr + _eHeightStr + '">' + textVal + '</textarea>';
				}
				if(mode.indexOf('button') >= 0){ //按钮
					var _w = eWidth * 0.8;
					if(isNaN(_w)) _w = btnW;
					if(_w < btnW) _w = btnW;
					var _btnClass = field == null || field == '' ? '' : ' btn-' + field; // edit 20221115 by mufeng
					var _altTitle = b_alt == null ? label : b_alt;
					var _lbTextStr = b_onlyImage ? '' : label;
					_editBoxStr = '<button type="button" class="border-zero' + _btnClass + _nameClass + '" title="' + _altTitle + '" style="width:' + _w + 'px; height:28px; line-height:28px; padding:0;' + _cellSizeStr + _cellColorStr + '">' + _bIconStr + _lbTextStr + '</button>';
				}
				if(mode.indexOf('radio') >= 0){ //radio单选
					var yesVal = '1', noVal = '0';
					var yesText = '是', noText = '否';
					if(choice != null){
						yesVal = typeof choice["yes"] == 'undefined' ? '1' : choice["yes"];
						noVal = typeof choice["no"] == 'undefined' ? '0' : choice["no"];
						yesText = parseInt(yesVal) != 1 ?  yesVal : '是';
						noText = parseInt(noVal) != 0 ? noVal : '否';
					}
					//console.log('field:', field, ' value:', items[field], ' textVal:', textVal, ' yesVal:', yesVal, ' noVal:',noVal, 'yesText:',yesText, ' noText:',noText); //test
					if(mode.indexOf('tick') >= 0 || mode.indexOf('on-off') >= 0){ //单选“打勾”
						var _checkedStr = textVal == yesVal ? ' checked="checked"' : '';
						var _colorClass = '';
						if(mode.indexOf('white') >= 0) _colorClass = ' white';
						else if(mode.indexOf('blue') >= 0) _colorClass = ' blue';
						else if(mode.indexOf('green') >= 0) _colorClass = ' green';
						else if(mode.indexOf('red') >= 0) _colorClass = ' red';
						else _colorClass = ' white';
						var _shapeClass = '';
						if(mode.indexOf('tick') >= 0){
							if(mode.indexOf('square') >= 0) _shapeClass = ' square';
							else if(mode.indexOf('circle') >= 0) _shapeClass = ' circle';
							else _shapeClass = ' square';
							_shapeClass += '-tick';
						}
						if(mode.indexOf('on-off') >= 0) _shapeClass += ' on-off';
						_editBoxStr = '<div class="cell-radio-single">'+
										'<input type="checkbox" class="ne-checkbox' + _shapeClass + _colorClass + ' i-t-' + field + _nameClass + '"' + _readonlyStr + _disabledStr + _checkedStr + '>'+
									 '</div>';
					}
					if(mode.indexOf('whether') >= 0){ //单选“是否"
						var _checkYesStr = textVal == yesVal ? ' checked="checked"' : '',
							_checkNoStr = textVal == noVal ? ' checked="checked"' : '';
						_editBoxStr = '<div class="cell-radio-group">'+
										'<div class="group">'+
											'<input type="radio" name="' + field + '-' + (i + 1) + '" id="' + field + '-yes-' + (i + 1) + '" class="ne-radio green' + _nameClass + '" value="' + yesVal + '"' + _checkYesStr + _readonlyStr + _disabledStr + '>'+
											'<label for="' + field + '-yes-' + (i + 1) + '">' + yesText + '</label>'+
										'</div>'+
										'<div class="group">'+
											'<input type="radio" name="' + field + '-' + (i + 1) + '" id="' + field + '-no-' + (i + 1) + '" class="ne-radio green' + _nameClass + '" value="' + noVal + '"' + _checkNoStr + _readonlyStr + _disabledStr + '>'+
											'<label for="' + field + '-no-' + (i + 1) + '">' + noText + '</label>'+
										'</div>'+
									'</div>';
					}
				}

				//列表HTML
				if(j == 0){ //前面列
					if(isCheckboxCol) _bodyHTML += '<div class="col-checkbox center" style="width:50px; min-height:20px;"><input type="checkbox" class="ne-checkbox square-tick white i-t-multiple" style="margin:0 auto"></div>'; //复选列 test
					if(isSerialCol) _bodyHTML += '<div class="col-order center" style="width:' + serialColumnWidth + 'px"><span>' + xuhao + '</span></div>'; //序号列
					if(primaryKey != null){ //主键列
						var keyArr = typeof primaryKey["field"] == 'undefined' ? [] : primaryKey["field"];
						var show = typeof primaryKey["show"] == 'undefined' ? false : primaryKey["show"] === true ? true : false; //默认false
						if(isArray(keyArr)){
							var _showStyle = show ? '' : 'style="display:none"';
							var tempVal = '';
							for(var k = 0; k < keyArr.length; k++){				
								tempVal += items[keyArr[k]] + ',';			 	
							}
							var keylist = tempVal == '' ? '' : tempVal.substr(0, tempVal.length - 1);
							if(keyArr.length >= 1) 
								_bodyHTML += '<div class="col-key"' + _showStyle + '><input type="text" class="i-t-key" value="' + keylist + '" disabled></div>';
						}
					}
				}

				//中间列
				var _colContentStr = '';
				if(cAlign == 'left') _colContentStr = _compoBoxStr + _editBoxStr;
				else _colContentStr = _editBoxStr + _compoBoxStr;
				var _rUnitStr = r_unit == null ? '' : '<em class="em-unit">' + r_unit + '</em>';
				var _rIconStr = r_icon == null ? ''  : '<i class="i-icon fa fa-' + r_icon + '"></i>';
				_bodyHTML += '<div class="' + _colClass + _alignClass + _stickyClass + '" data-column-index="' + j + '" style="width:' + width + 'px' + _cellColorStr + _cellSizeStr + _displayStr + '">'+ 
								_colContentStr + _rUnitStr + _rIconStr + 
							'</div>';
				
				//后面列
				if(j == (columnsArr.length - 1)){
					if(isStateCol) {
						_bodyHTML +='<div class="col-status">'+
									' <input type="text" class="i-t-state no-border" value="' + stateInitValue + '" disabled>'+
									'</div>'; //状态列
					}
				}

			} //END 循环配置(列)

			_bodyHTML += '</div><!--/.list-one-->';

		}) //END 循环数据(行)

		/*+------------------------------+*/
		//__·拼接节点
		var $titleNode = $parent.find('.list-title');
		var $contentNode =  $parent.find('.list-content');
		if(settings.pagination.loadMore){
			if(nowpage == 1){
				if(clearTbHead) $titleNode.empty();
				$titleNode.append(_headHTML);
			}else{
			}
			if(montage == 'before') $contentNode.prepend(_bodyHTML);
			else $contentNode.append(_bodyHTML);
		}else{
			if(clearTbHead) $titleNode.empty();
			$titleNode.append(_headHTML);
			if(montage == 'before') $contentNode.prepend(_bodyHTML);
			else $contentNode.append(_bodyHTML);
		}

		/*+------------------------------+*/
		//__·执行每一行的JS代码
		//console.log('所有行JS代码数组:', snippetArr);
		$parent.find('.list-one').each(function(m){
			for(var n = 0; n < snippetArr.length; n++){
				var oneJson = snippetArr[n];
				var index = oneJson["row"],
					jscode = oneJson["message"];
				if(index == m){
					eval(jscode);
					//console.log('每一行JS代码:', jscode);
				}
			}
		})

		/*+------------------------------+*/
		//__· 创建小计行
		createSubRow($parent);
		

		/*+------------------------------+*/
		//__·有某些列表头自定义了背景色,则各列统一没有margin
		if(isCeilLine === false && columnHasMargin === false) $parent.addClass('no-col-margin');

		/*+------------------------------+*/
		//__·调整列顺序
		$('.list-title>div,.list-one>div', $parent).each(function(){
			if($(this).hasClass('foremost')) $(this).insertBefore($(this).parent().children().eq(0));
		})


		/*+------------------------------+*/
		//__·设置表格外观
		setTableSkin();

		function setTableSkin(){
			var isIE = navigator.appName == "Microsoft Internet Explorer" ? true : false;
			var ieVersion = isIE && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace('MSIE','')); //IE版本
			//宽度
			var winW = $(window).outerWidth(true);
			var winH = $(window).outerHeight(true);
			var width = 0;
			$parent.find('.list-title>div').each(function(){
				if($(this).is(':visible')){
					var text = $(this).text();
					var w = $(this).outerWidth(true);
					width += w;
					//console.log('text:',text,' w:',w);
				}
			});

			// 解决某种特殊情况下 ie 浏览器引发的bug add 20241016-1
			// 当表格的父节点显示、隐藏、再显示时，比如两个切片A、B下各有一个表格。默认显示切片A下的表格，当点击切片B时，隐藏切片A，再点击切片A时，此时在ie浏览器中切片A里的表格宽度就会变成0
			// 也就是说，ie浏览器切片节点的显示隐藏会触发resize函数
			// 这时表格宽度为0，就必须记录一下上一次的表格的宽度值
			if (checkIsIE()) { // ie 浏览器时
				if (width != 0) $.recordLastInnerWidth = width;
				else if (width == 0) {
					width = $.recordLastInnerWidth;
				}
			}
			
			// testing
			var offsetTop = $parent.offset().top, //距离屏幕顶部距离
				offsetLeft = $parent.offset().left; //距离屏幕左侧距离
			var isOverScreen = width < winW ? false : true; //表格宽是否超过屏幕宽			
			var innerW = width + 25; //var innerW = !isOverScreen ? 'auto' : width + 50;
			var bodyPad = parseFloat($('body').css('padding-left').toString().replace(/[\px]/g,''));
			var wrapPad = parseFloat($('.wrap').css('padding-left').toString().replace(/[\px]/g,''));
			//var minusW = (isNaN(wrapPad) || typeof wrapPad == 'undefined' || isNaN(bodyPad) || typeof bodyPad == 'undefined') ? 20 : bodyPad + wrapPad;
			var minusW = offsetLeft; //直接计算距离屏幕左侧距离

			var toperH = topHeight > offsetTop && topHeight < winH ? topHeight : offsetTop,
				boterH = botHeight + $($.privateProperty.footerNode).outerHeight(true);
			var	tableW = widthMinusTwoFold ? parseFloat(winW - 2 * parseFloat(minusW) - 5) : parseFloat(winW - parseFloat(minusW) - 5),
				//tableH = parseFloat(winH - toperH - boterH - bodyPad - wrapPad - 5),
				tableH = parseFloat(winH - toperH - boterH - 10),
				captionH = parseFloat($parent.find('.table-caption').children().length == 0 ? 0 : $parent.find('.table-caption').outerHeight(true)),
				titleH = parseFloat($parent.find('.list-title').outerHeight(true));
			
			if(isIE) { //IE浏览器时
				//captionH = parseFloat($parent.find('.table-caption').height()) - 10;
				//titleH = parseFloat($parent.find('.list-title').height()) - 10;
			}
			var contentH = 0;
			if(nestDepth == 1){ //只有一张表格
				contentH = tbodyHeight == 'auto' ? parseFloat(tableH - titleH - captionH - 30) : tbodyHeight;
				if(contentH < 0) contentH = winH - titleH - captionH - 35;
			}
			else{ //多张表格时
				contentH = tbodyHeight == 'auto' ? $parent.find('.list-content').outerHeight(true) : tbodyHeight;
			}
			// console.log('$parent：', $parent);
			// console.log('offsetLeft：', offsetLeft);
			// console.log('winH:',winH, 'toperH:', toperH, ' boterH:',boterH, ' titleH:',titleH, ' captionH:',captionH, ' tableH:',tableH, 'contentH:',contentH);
			// console.log('tableW：', tableW);

			$parent.find('.table-content').css({'width':tableW});
			$parent.find('.table-inner').css({'width':innerW}); 
			titleH = parseFloat($parent.find('.list-title').outerHeight(true)); //重新赋值,兼容IE,因为IE中此时titleH会发生变化（必须!!)
			$parent.find('.list-content').css({'max-height':contentH, 'margin-top': titleH}); /*设定滚动区域高度 22为横向滚动条的高度*/
			
			//修正“是否超过屏幕宽”小幅度偏差的问题 add 20201015-1
			isOverScreen = parseFloat(tableW.toString().replace(/px/g, '')) < parseFloat(innerW.toString().replace(/px/g, '')) ? true : false;
			//alert('tableW:' + tableW + '\ninnerW:'+ innerW + '\nisOverScreen:' + isOverScreen);

			//重置表头高度
			var theadHeight = titleH;
			$parent.find('.list-title>div').css({'height': theadHeight});
			/*$parent.find('.list-title>div').each(function(){
				if($(this).children('em').length == 0){
					//$(this).children('span').css('height',theadHeight);
					$(this).children('span').css('padding-top', theadHeight / 4);
				}
			})*/
			$parent.find('.list-title .arrow-svg-wrap').css('top', (theadHeight - $parent.find('.list-title .arrow-svg-wrap').outerHeight(true))/2);
			
			//兼容ie,设置表格整体高度
			if(checkIEVersion() <= 9) { //ie9及以下版本浏览器时
				var _titleH = $parent.find('.list-title').outerHeight(); //注意outerHeight没true
				var ch = tableH;
				$parent.find('.table-content').css({'height': ch}); //防止拖动水平滚动条时表各高度一直变化
				$parent.find('.list-content').css({'max-height': contentH + barHeight});
				if(checkIEVersion() <= 8) { //ie8及版本浏览器时设置表头高度,防止表头一直抖动变高
					$parent.find('.list-title').css({'height':_titleH});
				}
			}

			//一级表头合并 add 20201110-2
			var mergedStartIndex = -1; //起始索引
			var mergedEndIndex = -1; //结束索引
			var mergedArr = [];
			$parent.find('.list-title>div').each(function(u){
				var _direc = $(this).attr('data-mesh-direc'),
					_numc = $(this).attr('data-mesh-numc');
				if(typeof _direc == 'undefined') _direc = '';
				if(typeof _numc == 'undefined') _numc = '';
				if(_numc != ''){ //向下
					if(_direc == 'next'){
						mergedStartIndex = u;
						mergedEndIndex = u + parseInt(_numc) - 1;
					}else{ //向下
						mergedEndIndex = u;
						mergedStartIndex = u - parseInt(_numc) + 1;
					}
					mergedArr.push({"start":mergedStartIndex, "end":mergedEndIndex, "direction":_direc});
				}
			})
			//console.log('mergedArr:', mergedArr);
			for(var a = 0; a < mergedArr.length; a++){
				var one = mergedArr[a];
				var _direction = one["direction"],
					_start = one["start"],
					_end = one["end"];
				var _w = 0;
				//console.log('_w1:', _w);
				$parent.find('.list-title>div').each(function(u){
					if(u >= _start && u <= _end){
						_w += $parent.find('.list-one:first-child>div').eq(u).outerWidth(true);
						//console.log('_w3:', _w, '-u:', u);
					}
					if(_direction == 'next'){ //向下
						if(u > _start && u <= _end)
							$(this).hide();
					}else{ //向上
						if(u >= _start && u < _end)
							$(this).hide();
					}
				})
				var index = _direction == 'next' ? _start : _end;
				$parent.find('.list-title>div').eq(index).css('width', _w);
			}


			
			//设置单元格高度 test8
			//if(isCeilLine){ //有单元格边线时
				if(isRowHeightEqual){ //每一行的行高相同
					var ceilHeightArr = [];
					$parent.find('.list-one>div').each(function(){
						var _h = $(this).outerHeight(true);
						ceilHeightArr.push(_h);
					})
					var maxHeight = ceilHeightArr[0]; //求最大值
					for(var i = 0; i < ceilHeightArr.length - 1; i++){
						maxHeight = maxHeight < ceilHeightArr[i+1] ? ceilHeightArr[i+1] : maxHeight;
					}
					if(maxHeight < 28) maxHeight = 28; //最小行高
					$parent.find('.list-one>div').each(function(){
						$(this).css('height', maxHeight);
					})
				}else{ //每一行的行高不同，会根据每一行的内容自动调整
					$parent.find('.list-one').each(function(){
						var ceilHeightArr = [];
						$(this).find('div').each(function(){
							var _h = $(this).outerHeight(true);
							ceilHeightArr.push(_h);
						})
						var maxHeight = ceilHeightArr[0]; //求最大值
						for(var i = 0; i < ceilHeightArr.length - 1; i++){
							maxHeight = maxHeight < ceilHeightArr[i+1] ? ceilHeightArr[i+1] : maxHeight;
						}
						if(maxHeight < 28) maxHeight = 28; //最小行高
						$(this).find('div').each(function(){
							$(this).css('height', maxHeight);
						})
					})	
				}
			//}



			//假垂直滚动条
			var scrollbarInnerH = 0;
			$parent.find('.list-content>div').each(function(v){
				if($(this).is(':visible')){
					var h = $(this).outerHeight(true);
					scrollbarInnerH += h;
				}
				
			})
			var listH = $parent.find('.list-content').outerHeight(); //列表高(行数据高度总和)
			//var scrollbarOuterH = checkIEVersion() <= 9 ? 	listH + barHeight : listH - barHeight;
			var scrollbarOuterH = listH;
			if(isOverScreen){
				//if(!checkIsIE()) scrollbarOuterH -=  barHeight + 2 * trackBtHeight;
				//else scrollbarOuterH -= trackBtHeight;
				if(checkBrowserType() == 'chrome' || checkIsIE()) scrollbarOuterH += barHeight + trackBtHeight;
			}
			//alert('barHeight:' + barHeight + '\nlistH:' + listH + '\nh2:' + scrollbarOuterH); //test4
			$parent.find('.table-scrollbar').css({'top': titleH, 'height': scrollbarOuterH});
			$parent.find('.scrollbar-div').css({'height': scrollbarInnerH}); //scrollbarInnerH + barHeight + 2 * trackBtHeight

			//test5
			//var thumbHeight = ($parent.find('.list-content')[0].clientHeight / $parent.find('.list-content')[0].scrollHeight) * 100 + '%';
			//$parent.find('.thumb').css('height', thumbHeight);

			//宽超屏幕宽时显示假垂直滚动条，否则隐藏之
			if(!isOverScreen){
				$parent.find('.table-scrollbar').hide();
			}else{
				if(checkIsIE()){
					if($parent.find('.table-content').outerHeight(true) - barHeight < $parent.find('.table-inner').outerHeight(true)) $parent.find('.table-scrollbar').show();
					else $parent.find('.table-scrollbar').hide();
				}else{
					if($parent.find('.table-content').outerHeight(true) + barHeight > tableH) $parent.find('.table-scrollbar').show();
					else $parent.find('.table-scrollbar').hide();
				}
			}


			//拖动水平滚动条时
			//$parent.find('.like-table').on('scroll',function(){
			$parent.find('.table-content').on('scroll',function(){    
				var scrollL = parseFloat($(this).scrollLeft());
				$parent.find('.table-scrollbar').css('right', 0 - scrollL);
				//if(tableW + scrollL >= innerW) $parent.find('.table-scrollbar').hide(); //到最右侧时
				//else $parent.find('.table-scrollbar').show(); //不到最右侧时
			})
			
			//假垂直滚动条上下滚动时
			$parent.find('.table-scrollbar').on('scroll',function(){
			//$parent.find('.table-scrollbar').on('drag',function(){
				//console.log('loadMore:',settings.pagination.loadMore, '-bool:',$.privateProperty.singleCreateBool); //test
				var scrollT = $(this).scrollTop();
				$parent.find('.list-content').scrollTop(scrollT);
				var isIE = checkIsIE();
				//模拟下拉加载更多
				if(settings.pagination.loadMore && $.privateProperty.singleCreateBool){
					//console.log('1111'); //test
					var clientHeight = $(this).outerHeight(true);
					var scrollTop = $(this).scrollTop();
					var scrollHeight = 0;
					$(this).siblings().find('.list-content').children().each(function(i){
						scrollHeight += $(this).outerHeight(true);
					})
					//console.log('clientHeight：',clientHeight, '\nscrollTop：',scrollTop, '\nscrollHeight：',scrollHeight);
					if(clientHeight + scrollTop >= scrollHeight){
						showAnimate();
						$.privateProperty.singleScroll = true; //全局赋值
						$.privateProperty.singleCurpage++; //页码+1
						var curpage = $.privateProperty.singleCurpage;
						
						//console.log('滚动到底了, 当前页码：', curpage); 
						if(isIE){
							loadScroll(curpage);
							setTimeout(function(){
								destroyAnimate();
							},100)
						}else{
							var mypromise = new Promise(function(resolve, reject){
								loadScroll(curpage);
								resolve(true);
							})
							mypromise.then(function(res){
								if(res){
									setTimeout(function(){
										destroyAnimate();
									},100)
								}
							})
						}
					}
				}
			})
			//表格内容上下滚动时 test5
			$parent.find('.list-content').on('scroll',function(){
				var scrollT = $(this).scrollTop();
				$parent.find('.table-scrollbar').scrollTop(scrollT);
				//var top = (scrollT * 100 / $(this)[0].scrollHeight) + '%';
				//console.log('top:', top);
				//$parent.find('.thumb')[0].style.top = top;
			})

		} //END FUNCTION setTableSkin
	


		/*+------------------------------+*/
		//__·浏览器窗口大小变化时重置大小
		$(window).on('resize', function () {
			setTableSkin();
		})
		
		/*+------------------------------+*/
		//__·绑定控件
		bindControl($parent);

		/*+------------------------------+*/
		//__·状态栏标记
		onFocusInputFunc($parent);
		
		/*+------------------------------+*/
		//__·回调(输入框或按钮点击事件))
		//$parent.find('button:button').off('click').on('click',function(){
		$parent.off('click', 'button:button,input,textarea').on('click', 'button:button,input,textarea', function(){ //兼容动态新增的行
			var row_index = $(this).parents('.list-one').index();
			var allJson = getFormData($parent);
			var oneJson = allJson["data"][row_index]; //只取当前行数据
			oneJson["target"] = $(this); //同时返回当前元素的jq对象
			//console.log('oneJson:', oneJson); 
			var colIndex = parseInt($(this).parent().attr('data-column-index'));
			if(ISNAN(colIndex)){
				//colIndex = -1;
				return;
			}
			var items = columnsArr[colIndex];
			if(items.callBack){
				items.callBack(oneJson);
			}
		})
		

		/*+------------------------------+*/
		//__·点击表头进行排序
		if(isSorted){
			$parent.find('.list-title>div').on('click',function(){
				var $this = $(this);
				var className = $this.parents(tableIdClass).parent()[0].className,
					idName = $this.parents(tableIdClass).parent()[0].id,
					ele = idName || className;
				$.privateProperty.selectorCurrent = $(idName != '' ? '#' + ele : '.' + ele); //全局赋值

				//test
				$.privateProperty.singleScroll = false; //全局赋值
				$.privateProperty.singleCurpage = 1; //页码重置为1
				/*if(!isSorted) {
					alertDialog('您已禁用排序功能', 1);
					return;
				}*/

				//edit 20201114-1
				//var sortSource = datasource;
				var sortSource = {data:[]}
				if(nestDepth >= 2){
					sortSource = datasource;
				}else{
					sortSource = $.privateProperty.options["dataJson"];
				}
				if(!sortSource || $.isEmptyObject(sortSource)) return;
				
				var scrollT = $parent.find('.table-scrollbar').scrollTop();
				var scrollL = $parent.find('.table-content').scrollLeft();
				
				var field = $this.attr('data-field'); //字段名称
				var type = $this.attr('data-type'); //字段类型
				var sort = typeof $this.attr('data-sort') == 'undefined' ? 'raise' : ($this.attr('data-sort') == '' ? 'raise' : $this.attr('data-sort')); //排序方式
				var reorder = sort == 'raise' ? 'down' : 'raise';
				//列字段重新排序
				for(i = 0; i < configure["columns"].length; i++){
					var row = configure["columns"][i];
					var key = typeof row["field"] == 'undefined' ? '' : row["field"];
					if(key == field)
						row["orderway"] = reorder;
					else
						row["orderway"] = '';
				}

				var oldDataSource = $.extend(true, {}, sortSource || {}); //(!!必须)原来的json不会因ps_arr改变而受影响 edit 20201114-1
				var newArr = JsonSort(oldDataSource.data, field, type, reorder);
				var newDataSource = {data: newArr}
				
				//数据已修改则提示之,防止不小心弄没了
				var isNoSaveData = false;
				$parent.find('.list-one').each(function(){
					var status = $(this).find('.i-t-state').val();
					if(status == unsaveText) {
						isNoSaveData = true;
						return false;
					}
				})
				if(isNoSaveData){
					var tips = '您有数据未保存，确认要排序？';
					alertDialog(tips, 2, sortTableData);
				}else{
					sortTableData();
				}	
				function sortTableData(){
					showAnimate('排序中..');
					setTimeout(function(){	
						//更新表头
						var relatedEle = _this.selector.replace(/[\.\#]/g,'');
						var htmlArr = $.privateProperty.captionArray[relatedEle]; 
						var index = $parent.index();
						var nestDepth = typeof configure["nestDepth"] == 'undefined' ? 1 : parseInt(configure["nestDepth"]);
						if(nestDepth >= 2){
							if(isArray(htmlArr)) configure.capHTML = htmlArr[index];
						}
						//更新表数据
						var compose = {
							setJson: configure,
							dataJson: newDataSource,
							pagination: settings.pagination
						}
						var parameter = {
							"root": eleNode,
							"sort": true,
							"undefinedEmpty": isUndefinedEmpty, //add 20201114-1
							"isAdding": runAdd //add 20201114-1
						}
						$.refreshData(compose, parameter);

						//水平、垂直滚动条滚回原处
						var $node = $.privateProperty.tableRootNode;
						$node.find('.table-scrollbar').animate({scrollTop: scrollT}, 50);
						$node.find('.table-content').animate({scrollLeft: scrollL}, 50);
						
						destroyAnimate();
					},100)
				}
			});
		}	



	}; //END FUNCTION



	/**
	 * 创建小计行
	 * @param {object} ps_obj 表格根节点对象
	 */
	var createSubRow = function(ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;

		if(ps_obj.find('.list-one').length < 2) return; //小于2行中断执行
		var subColumnIndexArr = [];
		ps_obj.find('.list-title>div').each(function(u){
			var index = u;
			var needSub = parseInt($(this).attr('data-sub')) == 1 ? true : false;
			if(needSub) subColumnIndexArr.push(u);
		})
		//console.log('subColumnIndexArr:', subColumnIndexArr)	
		var subValueArr = [];
		var dotArr = [];
		for(var m = 0; m < subColumnIndexArr.length; m++){
			var index = subColumnIndexArr[m];
			var total = 0;
			var dot = ps_obj.find('.list-title').children().eq(index).attr('data-digit');
			dotArr.push(dot);
			ps_obj.find('.list-one').each(function(){
				var _this = $(this).children().eq(index); //列
				var _mine = _this, //没有任何子元素的列
					_span = _this.find('span');
					_input = _this.find('input:text'),
					_textarea = _this.find('textarea'),
					_radioGroup = _this.find('.cell-radio-group'),
					_radioSingle = _this.find('.cell-radio-single');
				var arr = [_mine, _span, _input, _textarea, _radioGroup, _radioSingle];
				//if(i == 0) console.log('列:', j+ 1, ' 列名:', title); 
				var bh = '', id = '', value = '';
				for(var m = 0; m < arr.length; m++){
					var _ele = arr[m];
					if(_ele.length > 0){
						bh = typeof _span.attr('data-bh') == 'undefined' ? '' : _span.attr('data-bh');
						id = typeof _span.attr('data-id') == 'undefined' ? '' : _span.attr('data-id');
						bh = id === '' ? bh : id;
						var tagname = _ele[0].tagName.toLocaleLowerCase();
						if(tagname == 'input' || tagname == 'textarea'){
							value = _ele.val();
						}else{
							value = _ele.text();
						}
						if(_ele.find('input:checkbox').length != 0){
							value = _ele.find('input:checkbox').prop('checked') ? 1 : 0;
						}
						if(_ele.find('input:radio').length != 0){
							value = _ele.find('input:radio:checked').val();
						}
						var bools = $.privateProperty.remainIllegalChar ? false : true;
						value = colations.html(value, bools); //过滤html标签
					}
				}
				total += parseFloat(value);
			})
			subValueArr.push({"column":index, "value":total});
		}
		//console.log('subValueArr:', subValueArr, 'dotArr:',dotArr);
		if(subValueArr.length == 0) return;

		var clone = ps_obj.find('.list-one:last-child').clone().addClass('list-summary').removeClass('interlacing'); //复制最后一行
		clone.children().each(function(u){
			$(this).empty();
			if(u == 0) $(this).addClass('col-summary').text('小计');
			for(var m = 0; m < subValueArr.length; m++){
				var dot = dotArr[m];
				var one = subValueArr[m];
				var index = one["column"],
					value = one["value"];
				if(dot != '') value = parseInt(dot) < 0 ? value: value.toFixed(parseInt(dot));
				if(u == index){
					$(this).html('<span>' + value + '</span>');
				}
			}
		})
		ps_obj.find('.list-content').append(clone);
	}


	/**
	 * 绑定控件
	 * @param {object} ps_obj 表格根节点对象
	 */
	var bindControl = function(ps_obj){
		ps_obj.find('input:text:not(.no-border), textarea:not(.no-border)').each(function(){
			var $this = $(this);
			var colIndex = $this.parent().index();
			var $head = ps_obj.find('.list-title').children().eq(colIndex);
			var type = $head.attr('data-type');
			var wenzi = $head.text();
			if(type != '' && type != null && typeof type != 'undefined'){
				if(type.indexOf('date') >= 0 ){ //日期类型
					if(typeof neuiCalendar == 'undefined'){
						console.log('“' + wenzi + '”是日期类型，需请引入日历控件');
						return false;
					}
					if(typeof neuiCalendar.neDate != 'function') return false;
					neuiCalendar.neDate($this);
				}
			}
		})
	}

	/**
	 * 输入框值改变时，更改状态栏值
	 * 当单元格值发生变化时，状态栏的文本也变化
	 * @param {object} ps_obj 表格根节点对象
	 */
	var onFocusInputFunc = function(ps_obj){
		ps_obj.on('focus','input:text:not(.no-border), textarea:not(.no-border)',function(){
			var $this = $(this);
			var $state = $this.parents('.list-one').find('.i-t-state');
			if($state.val() == '' || $state.val() == savedText){ //只有已保存状态的,才赋值旧值
				$this.attr('data-focus-value', $this.val());
			}
		})
		//ps_obj.on('input','input:text:not(.no-border),textarea:not(.no-border)',function(){
		ps_obj.find('input:text:not(.no-border), textarea:not(.no-border)').bind('input propertychange', function(){ //兼容IE9-
			var $this = $(this);
			var $state = $this.parents('.list-one').find('.i-t-state');
			//限制输入类型
			var value = $this.val();
			var colIndex = $this.parent().index();
			var type = ps_obj.find('.list-title').children().eq(colIndex).attr('data-type');
			if(type.indexOf('float') >= 0 && type.indexOf('negative') >= 0){ //正负小数
				value = limitation.negativeFloat(value);
				$this.val(value);
			}
			if(type == 'float' || (type.indexOf('float') >= 0 && type.indexOf('positive') >= 0)){ //正小数
				value = limitation.onlyFloat(value);
				$this.val(value);
			}
			if(type.indexOf('int') >= 0 && type.indexOf('negative') >= 0){ //正负整数
				value = limitation.negativeInterval(value);
				$this.val(value);
			}
			if(type == 'int' || (type.indexOf('int') >= 0 && type.indexOf('positive') >= 0)){ //正整数
				value = limitation.onlyInterval(value);
				$this.val(value);
			}
			//更改状态
			var nowValue = $this.val(); //新值
			var oldValue = $this.attr('data-focus-value'); //旧值
			if(nowValue != oldValue){
				$state.addClass('red').val(unsaveText);
			}else{
				$state.removeClass('red').val(savedText);
			}
		})
	}

	/**
	 * 获取表格内部表单数据
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	var getFormData = function(ps_obj){
		var error = {"data":[]}
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return error;
		if(ps_obj.length == 0) return error;
		var rowArr = [];
		ps_obj.find('.list-one').not('.list-summary').each(function(i){ //行(不包含小计行、合计行)
			if($(this).children().length == 0) return false; // 中断循环
			var ls_row_index = i;
			var ls_hang_hao = ls_row_index + 1;
			var columnArr = [];
			var rowJson = {}
				rowJson["row"] = ls_hang_hao;
				rowJson["rowIndex"] = ls_row_index;
			for(var j = 0; j < $(this).children().length; j++){ //列
				var _thead = ps_obj.find('.list-title').children().eq(j);
				var title = _thead.attr('data-title');
				var field = _thead.attr('data-field');
				var must = _thead.attr('data-must');
				var unique = _thead.attr('data-unique');
				if(typeof title == 'undefined' || title == null || title == 'null') title = '';
				if(typeof field == 'undefined' || field == null || field == 'null') field = '';
				if(typeof must == 'undefined' || must == null || must == 'null') must = '0';
				if(typeof unique == 'undefined' || unique == null || unique == 'null') unique = '0';
				title = colations.html(title);
				var _this = $(this).children().eq(j);
				var _mine = _this, //没有任何子元素的列
					_span = _this.find('span');
					_input = _this.find('input:text'),
					_textarea = _this.find('textarea'),
					_radioGroup = _this.find('.cell-radio-group'),
					_radioSingle = _this.find('.cell-radio-single');
				var arr = [_mine, _span, _input, _textarea, _radioGroup, _radioSingle];
				//if(i == 0) console.log('列:', j+ 1, ' 列名:', title); 
				var bh = '', id = '', value = '';
				for(var m = 0; m < arr.length; m++){
					var _ele = arr[m];
					if(_ele.length > 0){
						bh = typeof _ele.attr('data-bh') == 'undefined' ? '' : _ele.attr('data-bh');
						id = typeof _ele.attr('data-id') == 'undefined' ? '' : _ele.attr('data-id');
						bh = id === '' ? bh : id;
						var tagname = _ele[0].tagName.toLocaleLowerCase();
						if(tagname == 'input' || tagname == 'textarea'){
							value = _ele.val();
						}else{
							value = _ele.text();
						}
						if(_ele.find('input:checkbox').length != 0){
							value = _ele.find('input:checkbox').prop('checked') ? 1 : 0;
						}
						if(_ele.find('input:radio').length != 0){
							value = _ele.find('input:radio:checked').val();
						}

						var bools = $.privateProperty.remainIllegalChar ? false : true;
						value = colations.html(value, bools); //过滤html标签
					}
				}
				var columnIndex = j + 1;
				if(field != '') rowJson[field] = {"column":columnIndex, "title":title, "bh":bh, "value":value, "must":must, "unique":unique}

			} //END 列

			rowArr.push(rowJson);

		}) //END 行
		
		/*格式：
		var json = {
			data:[
				{row:"1", name:{column:"0", title:"姓名", bh:"", value:"张三"}, sex:{column:"1", title:"性别", bh:"", value:"男"}}
				{row:"2", name:{column:"0", title:"姓名", bh:"", value:"李四"}, sex:{column:"1", title:"性别", bh:"", value:"女"}}
			]
		}
		*/
		var resJson = {"data":rowArr}
		//console.log('resJson:', resJson);
		return resJson;
	}; //END FUNCTION


	/**
	 * 触发浏览器窗口变化事件
	 * 即触发window onresize事件
	 * IE兼容说明：只支持IE9及以上版本, IE8及以下版本不支持
	 * Bug说明：表头会慢慢变大
	 */
	var onResizeFunc = function(){
		if(document.createEvent){
			var event = document.createEvent('HTMLEvents');
			event.initEvent('resize', true, true);
			window.dispatchEvent(event);
		}else if(document.createEventObject){
			if(window.fireEvent) window.fireEvent('onresize'); //ie8不支持
		}
	}


	/**
	 * 重置表格外观(设置表格整体高度) 兼容ie
	 * @param {object} ps_obj 表格根节点对象
	 */
	var resetTableAppearance = function(ps_obj){
		if(checkIEVersion() <= 8) { //ie8及以下版本浏览器时
			//宽度
			var winW = $(window).outerWidth(true);
			var winH = $(window).outerHeight(true);
			var width = 0;
			ps_obj.find('.list-title>div').each(function(){
				if($(this).is(':visible')){
					var text = $(this).text();
					var w = $(this).outerWidth(true);
					width += w;
					//console.log('text:',text,' w:',w);
				}
			})
			var isOverScreen = width < winW ? false : true; //表格宽是否超过屏幕宽
				var _barH = 20;
			var _titleH = ps_obj.find('.list-title').outerHeight(); //注意outerHeight没true
				_contentH = ps_obj.find('.list-content').outerHeight();
			var ch = _titleH + _contentH + _barH; 
			if(!isOverScreen) ch = ch - _barH + 10;
			ps_obj.find('.table-content').css({'height': ch}); //防止拖动水平滚动条时表各高度一直变化
			ps_obj.find('.list-title').css({'height':_titleH}); //防止表头一直抖动变高
			//假垂直滚动条
			var scrollbarInnerH = 0;
			ps_obj.find('.list-content>div').each(function(v){
				if($(this).is(':visible')){
					var h = $(this).outerHeight(true);
					scrollbarInnerH += h;
				}
				
			})
			var scrollbarOuterH = ps_obj.find('.list-content').outerHeight(true) + 17; 
			ps_obj.find('.table-scrollbar').css({'top': ps_obj.find('.list-title').outerHeight(true), 'height': scrollbarOuterH});
			ps_obj.find('.scrollbar-div').css({'height': scrollbarInnerH});
		}
	}



	/**
	 * 新增一行(非空行)  edit 20201114-1
	 * 即在有数据的列表上添加一行,且该行各列值不空
	 * @param {object} ps_source 数据源
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	var insertNewRow = function(ps_source, ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;

		var opt = $.privateProperty.options;
		var old_source = opt["dataJson"];
		var new_source = {}
		if(ps_source !== '' && !$.isEmptyObject(ps_source)){
			if(typeof ps_source.data != 'undefined') new_source = ps_source;
			else new_source = {data:[ps_source]}
		}else{
			new_source = {data:[{}]}
		}
		opt["dataJson"] = new_source;
		var montage = 'before';
		$.refreshData(opt, {"root":ps_obj, "dump":false, "isAdding":true, "outfit":true, "montage":montage, "undefinedEmpty":true});
		//界面上
		var _parent = ps_obj.find('.list-content');
		var new_row_hao = _parent.children().length; //新行号
		var dom = montage == 'before' ? _parent.children(':first-child') : _parent.children(':last-child');
		dom.find('.cell-radio-group>div').each(function(k){ //重置radio单选
			var _radio = $('input:radio', this);
			var name = _radio.attr('name').toString().replace(/[\d]/g, ''),
				id = _radio.attr('id').toString().replace(/[\d]/g, '');
			_radio.attr({'name': name + new_row_hao, 'id': id + new_row_hao});
			$('label', this).attr('for', id + new_row_hao);
			if(k == 0) $(this).find('input:radio').removeAttr('checked'); //最后一个选中
			else $(this).find('input:radio').attr('checked', true);
		})
		_parent.children().each(function(i){ //循环每一列
			var index = i + 1;
			$(this).find('.col-order>span').text(index); //重置序号
		})
		ps_obj.find('.list-content, .table-scrollbar').animate({scrollTop: 0}, 'slow'); //滚动条滚动到顶部

		//数据源更改,排序时才不会依然是原先的数据源
		var allSource = {data:[]}
		for(var m = 0; m < old_source.data.length; m++) allSource.data.push(old_source.data[m]);
		for(var m = 0; m < new_source.data.length; m++) allSource.data.push(new_source.data[m]);
		$.privateProperty.options["dataJson"] = allSource;

	}; //END FUNCTION




	/**
	 * 新增一行(空行)
	 * 即在有数据的列表上添加一行,且该行各列值为空
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	var addNewRow = function(ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;
		var _parent = ps_obj.find('.list-content');	
		var new_row_hao = _parent.children().length + 1; //新行号(行索引值+1)
		var cloneDom = _parent.children().eq(0).clone();
		//cloneDom.find('input:text, textarea').val(''); //清空输入框
		cloneDom.children().each(function(){ //清空每一列的值(没有任何标签的列)
			var colIndex = $(this).index();
			var $head = ps_obj.find('.list-title').children().eq(colIndex);
			var defaults = $head.attr('data-default'),
				hiddens = $head.attr('data-hidden');
			var value = typeof defaults == 'undefined' ? '' : defaults;
			var bh = typeof hiddens == 'undefined' ? '' : hiddens;
			if($(this).children().length == 0){
				$(this).text(value);
				if(bh != '') $(this).attr('data-bh', bh);
			}else{
				$(this).find('input:text, textarea').val(value);
				if(bh != '') $(this).find('input:text, textarea').attr('data-bh', bh);
			}
		})
		cloneDom.find('input:checkbox').removeAttr('checked'); //清空checkbox
		cloneDom.find('.cell-radio-group>div').each(function(k){ //重置radio单选
			var _radio = $('input:radio', this);
			var name = _radio.attr('name').toString().replace(/[\d]/g, ''),
				id = _radio.attr('id').toString().replace(/[\d]/g, '');
			_radio.attr({'name': name + new_row_hao, 'id': id + new_row_hao});
			$('label', this).attr('for', id + new_row_hao);
			if(k == 0) $(this).find('input:radio').removeAttr('checked'); //最后一个选中
			else $(this).find('input:radio').attr('checked', true);
		})
		_parent.prepend(cloneDom); //克隆一列
		_parent.children().each(function(i){ //循环每一列
			var index = i + 1;
			$(this).find('.col-order>span').text(index); //重置序号
		})
		ps_obj.find('.list-content, .table-scrollbar').animate({scrollTop: 0}, 'slow'); //滚动条滚动到顶部
		//各个事件重载
		bindControl(ps_obj); //重载“绑定控件”
		onFocusInputFunc(ps_obj); //重载“输入框值变化事件”
		onResizeFunc(); //重置“表格外观”(适用于非ie的现代浏览器、ie9、ie9+)
		resetTableAppearance(ps_obj); //重置“表格外观”(兼容ie8)
		ps_obj.find('.list-title').css({'height':ps_obj.find('.list-title').outerHeight()}); //防止表头一直抖动变高

	}; //END FUNCTION


	/**
	 * 删除一行
	 * @param {number} ps_row_index 行索引值
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	var deleteAnRow = function(ps_row_index, ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;
		var _parent = ps_obj.find('.list-content');
		if(typeof ps_row_index == 'undefined') return;
		if(ISNAN(parseInt(ps_row_index))) return;
		if( _parent.children().length < (parseInt(ps_row_index) + 1) ) return;
		var rowIndex = parseInt(ps_row_index);
		//界面上移除
		_parent.children().eq(rowIndex).remove();
		_parent.children().each(function(i){ //循环每一列
			var index = i + 1;
			$(this).find('.col-order>span').text(index); //重置序号
		})
		onResizeFunc(); //重置“表格外观”(适用于非ie的现代浏览器、ie9、ie9+)
		resetTableAppearance(ps_obj); //重置“表格外观”(兼容ie8)
		ps_obj.find('.list-title').css({'height':ps_obj.find('.list-title').outerHeight()}); //防止表头一直抖动变高
		//数据源更改,排序时才不会依然是原先的数据源
		var opt = $.privateProperty.options;
		var old_source = opt["dataJson"];
		var del_source = {data:[]}
		if(old_source.data.length >= (rowIndex + 1)){
			del_source.data = old_source.data.splice(rowIndex, 1);
		}
		$.privateProperty.options["dataJson"] = old_source;
	}; //END FUNCTION


	/**
	 * 重置某一行的状态列
	 * @param {Number} ps_row_index 行索引值(可选). 值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {String} ps_status 状态. saved 已保存(默认), unsave 未保存
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	var changeStateColumn = function(ps_row_index, ps_status, ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;
		var status = typeof ps_status == 'undefined' ? 'saved' : (ps_status == 'unsave' ? 'unsave' : 'saved');
		// console.log('status：', status)
		var _conObj = ps_obj.find('.list-content');
		var oneRowArr = [ps_row_index]; //单行
		var allRowArr = []; //所有行
		var len = _conObj.children().length;
		for(var i = 0; i < len; i++) allRowArr.push(i);
		var arr = typeof ps_row_index == 'undefined' || ps_row_index == 'all' ? allRowArr : oneRowArr;
		for(var i = 0; i < arr.length; i++){
			var _state = _conObj.children().eq(arr[i]).find('.i-t-state');
			if(status == 'saved')
				_state.val($.privateProperty.changedTxt).removeClass('red'); //状态更改为"已保存"
			else
				_state.val($.privateProperty.unchangeTxt).addClass('red'); //状态更改为"未保存"
		}
	}; //END FUNCTION


	
	/**
	 * 校验数据完整性（即某个单元格必填，不能为空）
	 * @param {Number} ps_row_index 指定要校验的行(行索引值)(可选,默认所有行), 值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {object} ps_obj 当前表格对象(可选)
	 * @return {string} 返回空或“某个单元格值不能为空”的提示信息
	 */
	var checkHollowRow = function(ps_row_index, ps_obj){
		var error = '空空如也，一条记录也没有，请先添加数据';
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return error;
		if(ps_obj.length == 0) return error;
		var json = getFormData(ps_obj);
		var rowIndex = ps_row_index;
		var arr = typeof rowIndex == 'undefined' || rowIndex == 'all' ? json["data"] : [json["data"][parseInt(rowIndex)]];
		var tips = '';
		for(var i = 0; i < arr.length; i++){
			var row = arr[i];
			var index = row["row"];
			for(var c in row){
				var one = row[c];
				if(typeof one == 'object'){
					if(parseInt(one["must"]) == 1 && one["value"] == ''){
						tips = '第' + index + '行请填写: ' + one["title"];
						break;
					}
				}
			}
			if(tips != '') break;
		}
		return tips;

	}; //END FUNCTION


	
	/**
	 * 校验重复行（即某个单元格值必须唯一）
	 * @param {object} ps_obj 当前表格对象(可选)
	 * @return {string} 返回空，或“A单元格与B单元格值相同”的提示信息
	 */
	var checkInterateRow = function(ps_obj){
		var error = '空空如也，一条记录也没有，请先添加数据';
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return error;
		if(ps_obj.length == 0) return error;
		var json = getFormData(ps_obj);
		var tempArr = json["data"];
		//将单元格值必须唯一的列组成数组
		//格式： [{"title":"姓名", "field":"username", "data":["张三", "李四", "王五"]}, {"title":"性别", "field":"sex", "data":["男", "男", "女"]}]
		//其中：数组中的每一个元素代表某一列，元素中的data代表该列N行的值(组成的数组)
		var columnsArr = [];
		for(var i = 0; i < tempArr.length; i++){ //循环行
			var row = tempArr[i];
			for(var c in row){ //循环列
				var field = c; //c是字段
				var one = row[c];
				if(typeof one == 'object'){
					var title = one["title"],
						value = one["value"];
						unique = parseInt(one["unique"]);
					if(unique == 1){
						columnsArr.push({"title": title, "field": field, "value":value});
					}
				}
			}
		}
		//console.log('columnsArr:', columnsArr);
		//去重
		var map = {}, dest = [];
		for(var i = 0; i < columnsArr.length; i++){
			var ai = columnsArr[i];
			var title = ai["title"],
				field = ai["field"],
				value = ai["value"];
			if(!map[field]){
				dest.push({
					"title": title,
					"field": field,
					"data": [value]
				});
				map[field] = ai;
			}else{
				for(var j = 0; j < dest.length; j++){
					var one = dest[j];
					if(one["field"] == field){
						one.data.push(value);
						break;
					}
				}
			}
		}
		//console.log('dest:', dest);

		//检验是否重复
		var tips = '';
		for(var i = 0; i < dest.length; i++){
			var row = dest[i];
			var title = row["title"];
			var arr = row["data"];
			for(var m = 0; m < arr.length; m ++){
				var index1 = m + 1;
				var value1 = arr[m];
				for(var n = m + 1; n < arr.length; n++){
					var index2 = n + 1;
					var value2 = arr[n];
					if(value2 == value1){
						tips = title + '：第' + index2 + '行与第' + index1 + '行一样';
						break;
					}
				}
				if(tips != '') break;
			}
			if(tips != '') break;
		}

		return tips;

	}; //END FUNCTION



	
	/**
	* 给指定的某行某些列赋值
	* @param {Number} ps_row_index 行索引值
	* @param {array} ps_field_arr 列字段组成的数组
	* @param {array} ps_value_arr 列值组成的数组
	* @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	*/
	var giveValue2Columns = function(ps_row_index, ps_field_arr, ps_value_arr, ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;
		var _head = ps_obj.find('.list-title');
		var _parent = ps_obj.find('.list-content');
		if(typeof ps_row_index == 'undefined') return;
		if(ISNAN(parseInt(ps_row_index))) return;
		if( _parent.children().length < (parseInt(ps_row_index) + 1) ) return;
		if(!isArray(ps_field_arr)) return;
		if(!isArray(ps_value_arr)) return;
		if(ps_field_arr.length != ps_value_arr.length) return;

		var rowIndex = parseInt(ps_row_index);
		_parent.children().eq(ps_row_index).children().each(function(i){ //循环每一列
			var index = i;
			var field = _head.children().eq(i).attr('data-field');
			var _this = $(this);
			for(var i = 0; i < ps_field_arr.length; i++){
				var tmp_field = ps_field_arr[i],
					tmp_value = ps_value_arr[i];
				if(tmp_field == field){
					if(_this.children().length == 0){ //没有任何子元素的列
						_this.text(tmp_value);
					}else{
						var _ele = _this.children();
						var tagname = _ele[0].tagName.toLocaleLowerCase();
						if(tagname == 'input' || tagname == 'textarea'){
							_ele.val(tmp_value);
						}else if(tagname == 'span'){
							_ele.text(tmp_value);
						}else{
							if(_this.find('.cell-radio-single').length != 0){
								if(_ele.find('input:checkbox').length != 0){
									_ele.find('input:checkbox').prop('checked', parseInt(tmp_value) == 1 ? true : false);
								}
							}
							if(_this.find('.cell-radio-group').length != 0){
								if(_ele.find('input:radio').length != 0){
									_ele.find('input:radio').each(function(){
										if($(this).val() == tmp_value) $(this).prop('checked', true);
									})
								}
							}
						}
					}
				} //IF
			}
		})
	}; //END FUNCTION



	/**
	 * 指定某一行某些列为只读状态
	 * 常用于：某一列，在列表时只读,但新增时又要求可输入
	 * @param {Array} ps_en_arr 列字段英文组成的数组
	 * @param {Number} ps_row_index 行索引值(可选,默认所有行). 值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	var setColumnsReadonly = function(ps_en_arr, ps_row_index, ps_obj){
		setColumnsReadWrite('onlyread', ps_en_arr, ps_row_index, ps_obj);
	}; //END FUNCTION



	/**
	 * 指定某一行某些列为可写状态
	 * 常用于：某一列，在列表时只读,但新增时又要求可输入
	 * @param {Array} ps_en_arr 列字段英文组成的数组
	 * @param {Number} ps_row_index 行索引值(可选,默认所有行).值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	var setColumnsCanWrite = function(ps_en_arr, ps_row_index, ps_obj){
		setColumnsReadWrite('writeable', ps_en_arr, ps_row_index, ps_obj);
	}; //END FUNCTION



	/**
	 * 指定某一行某些列为可写或只读
	 * @param {string} ps_type 类型. onlyread 只读, writeable 可写
	 * @param {Array} ps_en_arr 列字段英文组成的数组
	 * @param {Number} ps_row_index 行索引值(可选,默认所有行). 值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	var setColumnsReadWrite = function(ps_type, ps_en_arr, ps_row_index, ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;
		var error = '抱歉，参数错误！第一个参数必须为数组，且数组不能为空数组';
		if(!isArray(ps_en_arr)){
			console.log(error);
			return;
		}
		if(ps_en_arr.length == 0){
			console.log(error);
			return;
		}
		var oneRowArr = [ps_row_index]; //单行
		var allRowArr = []; //所有行
		var len = ps_obj.find('.list-content').children().length;
		for(var i = 0; i < len; i++) allRowArr.push(i);
		var arr = typeof ps_row_index == 'undefined' || ps_row_index == 'all' ? allRowArr : oneRowArr;
		for(var k = 0; k < ps_en_arr.length; k++){
			var field1 = ps_en_arr[k];
			for(var i = 0; i < arr.length; i++){
				var _row = ps_obj.find('.list-content').children().eq(arr[i]); // edit 20241010-1
				_row.children().each(function(j){
					var field2 = ps_obj.find('.list-title').children().eq(j).attr('data-field');
					if(field1 == field2){
						var $input = $(this).find('input:text, textarea, input:radio, input:checkbox');
						if(ps_type == 'onlyread') $input.attr('disabled', true);
						if(ps_type == 'writeable') $input.removeAttr('disabled');
					}
				})
			}
		}
	}; //END FUNCTION



	/**
	 * 全选
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	var chooseAllRow = function(ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;
		var _checkbox = ps_obj.find('input:checkbox.i-t-multiple');
		_checkbox.prop('checked', true);
	}; //END FUNCTION

	/**
	 * 反选
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	var reverseAllRow = function(ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;
		var _checkbox = ps_obj.find('input:checkbox.i-t-multiple');
		ps_obj.find('input:checkbox.i-t-multiple').each(function(){
			$(this).is(':checked') ? $(this).prop('checked', false) : $(this).prop('checked', true);
		})
	}; //END FUNCTION

	/**
	 * 全不选
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	var chooseNoneRow = function(ps_obj){
		if(typeof ps_obj == 'undefined') ps_obj = $($.privateProperty.tableRootNode);
		if(typeof ps_obj == 'undefined') return;
		if(ps_obj.length == 0) return;
		var _checkbox = ps_obj.find('input:checkbox.i-t-multiple');
		_checkbox.prop('checked', false);
	}; //END FUNCTION





	///==================================================================///
	/**
	 * 创建分页
	 * @param {*} settings
	 * @param {*} ps_params. json参数,表示分页是否需要重建(可选). true 第1次加载,或通过搜索按钮点击加载数据时需要重建(默认), false 通过上下翻页加载数据时无需重建. json 格式 {"rebuild":false} 
	 */
	var createPageList = function(settings, ps_params){
		var _this = tablePC.getObject();
		//console.log('_this:',_this); //
		var bindTNode = _this.selector; //eg. .panel1, eg. #panel2
		var rootNode = $.privateProperty.tableRootNode;
		var pageNode = $.privateProperty.pageRootElement;
		var pageId = '#' + getNodePureString(pageNode) + '-' + generateRandChar();
		//是否有导出excel按钮
		var excelEnable = typeof settings.exportExcel == 'undefined' ? true : (settings.exportExcel.enable === false ? false : true); //默认true
		//分页
		if(!settings.pagination){
			console.log('请检查分页参数pagination名称是否正确？');
			return false;
		}
		var page = settings.pagination;
		if(page.loadMore) page.enable = false;
		//console.log('page:',page);
		if(!page.enable){
			//console.log('如需开启分页功能，请设置参数{pagination:{enable:true}}');
			return false;
		}
		if(!page.pageCount || !isStrPositiveInteger(page.pageCount)){
			console.log('请设置总分页数，比如10页：{pagination:{pageCount:10}}');
			return false;
		}

		var isRebuild = typeof ps_params == 'undefined' ? true : ps_params["rebuild"] === false ? false : true;
		if (isRebuild) { // 重建页码
			$.privateProperty.pageTotal[_this.selector.replace(/[\.\#]/g, '')] = page.pageCount; //全局赋值
			$.privateProperty.recordTotal[_this.selector.replace(/[\.\#]/g, '')] = typeof page.recordCount == 'undefined' ? '' : page.recordCount;
			$.privateProperty.pagePerpage[_this.selector.replace(/[\.\#]/g, '')] = page.pageSize;
			// 当前页码重置为1 add 20231106-1
			$.privateProperty.pageCurpage[_this.selector.replace(/[\.\#]/g, '')] = 1;
		}
		var nowpage = parseInt($.privateProperty.pageCurpage[_this.selector.replace(/[\.\#]/g,'')]);
		var page_count = $.privateProperty.pageTotal[_this.selector.replace(/[\.\#]/g, '')];
		var record_count = $.privateProperty.recordTotal[_this.selector.replace(/[\.\#]/g, '')];
		var page_perpage = $.privateProperty.pagePerpage[_this.selector.replace(/[\.\#]/g, '')];

		var _html = '<div class="' + getNodePureString(pageNode) + '" id="' + getNodePureString(pageId) + '" data-bind-table="' + bindTNode + '">';	
		if(page.pageMode=='select'){
			var btn = page.pageSelect;
			if(!btn){
				//console.log('请设置参数pageSelect');
				return;
			}
			if(excelEnable) _html+='<div class="page-excel btn-excel"><i class="fa fa-file-excel-o"></i>导出EXCEL</div>';
			if(btn.allPage) _html+='<div class="page-all"><i class="fa fa-bars"></i>全部</div>';
			if(btn.homePage) _html+='<div class="page-home"><i class="fa fa-backward"></i>首页</div>';
			if(btn.prevPage) _html+='<div class="page-prev"><i class="fa fa-chevron-up"></i>上一页</div>';
			if(btn.nextPage) _html+='<div class="page-next"><i class="fa fa-chevron-down"></i>下一页</div>';
			if(btn.lastPage) _html+='<div class="page-end"><i class="fa fa-step-forward"></i>尾页</div>';
			_html += '<div class="page-every">每页<em>' + page_perpage + '条记录</em></div>';
			if(btn.dropPage) {
				_html+=	'<div class="page-goto">第<select id="page-select">';				
				for(i=0;i<page_count;i++){
					var j = i+1;
					_html+='<option value="'+j+'">'+j+'</option>';
				}
				_html+=' </select>页</div>';
			}
		}else{ //page.pageMode=='list'
			if(typeof nowpage == 'undefined' || isNaN(nowpage)) nowpage = Math.ceil(parseInt(page_count) / 2) - 1;
			var btn = page.pageList;
			if(!btn){
				console.log('请设置参数pageList');
				return;
			}
			if(excelEnable) _html+='<div class="page-excel btn-excel"><i class="fa fa-file-excel-o"></i>导出EXCEL</div>';
			_html+='<div class="page-num"><ul>';
			
			var size = parseInt(btn.listSize) < 3 ? 3 : parseInt(btn.listSize),
				count = parseInt(page_count);	
			if(nowpage>count) nowpage = count;
			if(nowpage<1) nowpage = 1;
			var numc = size - 3,
				leftAmount = Math.ceil(numc/2),
				rightAmount = Math.floor(numc/2),
				leftStart = nowpage - leftAmount,
				rightEnd = nowpage + rightAmount;
			if(leftStart<=1){
				rightEnd+= leftAmount - (nowpage - 2);
				leftStart = 1;
			}
			if(rightEnd>=count){
				leftStart-= rightEnd - count + 1;
				rightEnd = count;
			}				
			//console.log('count:',count,'\nsize:',size,'\nnumc:',numc,'\nleftAmount:',leftAmount,'\nleftStart:',leftStart,'\nrightAmount:',rightAmount,'\nrightEnd:',rightEnd);
			if(count<=size){
				for(i=0;i<page_count;i++){
					var j = i+1;		
					var _class = nowpage == j ? ' class="on"' : '';				
					_html+='<li'+_class+'>'+j+'</li>';
				}
			}else{
				if(leftStart!=1) _html+='<li>1</li>';
				if(leftStart-1>1) _html+='<li class="dotted">...</li>';					
				for(i=leftStart;i<nowpage;i++){
					_html+='<li>'+i+'</li>';
				}
				_html+='<li class="on">'+nowpage+'</li>';
				for(i=nowpage;i<rightEnd;i++){
					_html+='<li>'+(i+1)+'</li>';
				}
				if(rightEnd<count-1) _html+='<li class="dotted">...</li>';					
				if(rightEnd!=count) _html+='<li>'+count+'</li>';
			}	
			_html+='</ul></div>';
		}

		if(page.pageInfos){
			_html+='<div class="page-infos">共<em>'+page_count+'</em>页</div>';
			if(record_count != '') _html += '<div class="page-record"><em>' + record_count + '条记录</em></div>';
		}
		_html+='</div>';

		if($('*[data-bind-table="' + bindTNode + '"]').length > 0) 
			$('*[data-bind-table="' + bindTNode + '"]').remove();
		//$(pageNode).remove(); //删除旧节点
		//$(rootNode).after(_html); //拼接节点

		//将分页信息添加到底部节点中 edit 20241016-1
		var footNode = $.privateProperty.footerNode;
		if ($(footNode).length == 0) {
			var _footClassStr = settings.pagination.className.toString().replace(/\s+/g, '') === '' ? '' : ' class="' + settings.pagination.className.toString().replace(/(\#|\.)/g, '') + '"';
			$('body').append('<div id="' + getNodePureString(footNode) + '"' + _footClassStr + '></div>');
		}
		$(footNode).append(_html).css({'height': $(footNode).children().outerHeight(true)});
		

		//执行其它操作
		//$('#page-select').val(nowpage); //下拉选中
		$('*[data-bind-table="' + _this.selector + '"]').find('#page-select').val(nowpage); //下拉选中

		donePageSeriesEvent(settings); //执行系列事件
	};



	///==================================================================///
	/**
	 * 执行分页系列事件
	 * 如首页、上一页等点击事件
	 */
	var donePageSeriesEvent = function(ps_set){
		var _this = tablePC.getObject();
		var opt = ps_set;

		//var pageCount = parseInt(opt.pagination.pageCount);
		var pageCount = $.privateProperty.pageTotal[_this.selector.replace(/[\.\#]/g, '')];

		var nowpage = parseInt($.privateProperty.pageCurpage[_this.selector.replace(/[\.\#]/g,'')]);
		nowpage = isNaN(nowpage) ? 1 : nowpage;
	
		var pageNode = $.privateProperty.pageRootElement + '[data-bind-table="' + _this.selector + '"]';

		//全部按钮
		var isBatched = typeof opt.pagination.tinyVolume == 'undefined' ? false : (opt.pagination.tinyVolume === true ? true : false); //是否分批次展示数据,默认false
		$(pageNode).find('.page-all').on('click',function(){
			nowpage = 1;
			opt.pagination.pageCount = 1;
			$.privateProperty.pageCurpage[_this.selector.replace(/[\.\#]/g,'')] = 1;
			if(isBatched == false) loadJson("全部", nowpage, $(this), true);
		})
		

		//首页按钮
		$(pageNode).find('.page-home').on('click',function(){
			loadJson("首页", 1, $(this));
		})
		//上一页按钮
		$(pageNode).find('.page-prev').on('click',function(){
			nowpage = nowpage - 1 <= 0 ? 1 : nowpage - 1;
			loadJson("上一页", nowpage, $(this));
		})
		//下一页按钮
		$(pageNode).find('.page-next').on('click',function(){
			nowpage = nowpage + 1 > pageCount ? pageCount : nowpage + 1;
			loadJson("下一页", nowpage, $(this));
		})
		//尾页按钮
		$(pageNode).find('.page-end').on('click',function(){
			loadJson("尾页", pageCount, $(this));
		})
		//分页下拉按钮
		$(pageNode).find('#page-select').on('change',function(){
			nowpage = $(this).get(0).selectedIndex + 1;
			loadJson("下拉页码", nowpage, $(this));
		})
		//页码按钮
		$(pageNode).find('.page-num li:not(.dotted)').on('click',function(){
			nowpage = parseInt($(this).text());
			if(nowpage<0) nowpage = 1;
			loadJson ("数字页码", nowpage, $(this));
		})
		//导出excel按钮
		$(pageNode).find('.btn-excel').on('click',function(){
			derive2Excel(opt.exportExcel);
		})

	}; //END FUNCTION



	///==================================================================///
	/**
	 * 根据页码加载json数据
	 * @param {string} ps_type 点击的分页按钮类型
	 * @param {number} nowpage 当前页码
	 * @param {object} obj 当前分页按钮对象
	 * @param {boolean} ps_entire 是否点了"全部"按钮
	 */
	var loadJson = function(ps_type, nowpage, obj, ps_entire){
		var ele = obj.parents($.privateProperty.pageRootElement).attr('data-bind-table');
		var nowpage = typeof nowpage == 'undefined' ? 1 : nowpage;
		$.privateProperty.selectorCurrent = $(ele); //全局赋值
		$.privateProperty.pageCurpage[ele.replace(/[\.\#]/g, '')] = nowpage; //全局赋值
		var allpages = parseInt($.privateProperty.pageTotal[ele.replace(/[\.\#]/g, '')]); //总页数
		if(ISNAN(allpages)) allpages = 1;
		var _this = tablePC.getObject();
		var levels = $.privateProperty.tableNestDepth;
		var opt = tablePC.getSettings();

		var isRebuild = typeof ps_entire == 'undefined' ? false : ps_entire === true ? true: false; //默认false
		$.refreshPage(opt, {"rebuild":isRebuild}); //刷新分页
		
		if(opt.pagination.pageCount == 1 && !ps_entire) return;
		if(opt.pagination.callback){ //回调函数给前台
			var pageSize = parseInt(opt.pagination.pageSize);
			var ls_page_size = ps_entire ? allpages * pageSize : pageSize; 
            var infos = {"button":ps_type, "curpage":nowpage, "pagesize":ls_page_size, "pageCount":opt.pagination.pageCount}
			var jsonArr = opt.pagination.callback(infos);
			 
			showAnimate();
			var getHeadingHTML = {}
            setTimeout(function(){
                if(isArray(jsonArr)){ 
					/**
                     *返回值格式：
						1.单个json 
							eg. return tableJson
						2.json或函数名组成的数组或嵌套数组:
							eg. return [tableJson, getXXHTML  
							eg. return [tableJson, [subJson]]
							eg. return [tableJson, [subJson, totalJson]]
							eg. return [tableJson, [subJson], getXXHTML 
							eg. return [tableJson, [subJson, totalJson], getXXHTML        
							其中:
							tableJson  表格列表数据json
							getXXHTML 获取表格标题自定义HTML的函数(这里只需要传递函数名)
							subJson    小计json
							totalJson  合计json
                    */
                    opt.dataJson = jsonArr[0];
					if(isArray(jsonArr[1])) opt.subJson = jsonArr[1];
                    if(typeof jsonArr[1] === 'function') getHeadingHTML = jsonArr[1];
                    if(typeof jsonArr[2] === 'function') getHeadingHTML = jsonArr[2];
					
                }else{ //前台返回值是一个json.eg. var json = {name:"张三"}
                    opt.dataJson = jsonArr; 
				}
				
				if(!opt.pagination.loadMore) _this.empty(); //清空所有节点(必须!!)

				var relatedEle = $.privateProperty.selectorCurrent.selector.replace(/[\.\#]/g,'');
				$.privateProperty.captionArray[relatedEle] = []; //先清空数组
				var originData = opt.dataJson;
				
                if(levels >=2){
					if(typeof opt.dataJson == 'undefined'){ destroyAnimate(); return; }
					if(typeof opt.dataJson.data == 'undefined'){ destroyAnimate(); return; }
                    for(var k=0; k<opt.dataJson.data.length; k++){
						opt.dataJson = opt.dataJson.data[k]; //赋新值					
						if(typeof getHeadingHTML === 'function') {
							var oneHtml = getHeadingHTML(opt.dataJson, k + 1); //表标题
							opt.setJson.capHTML = oneHtml;
							$.privateProperty.captionArray[relatedEle].push(oneHtml); //元素加入数组. 全局赋值
						}
                        $.refreshData(opt, {"dump":false}); //刷新表格
                        opt.dataJson = originData; //重置为原值
                    }
                }else{
					var json =  {"dump":false}
					if(opt.pagination.loadMore) json["root"] = ele;
					$.refreshData(opt, json); //刷新表格
                }
				destroyAnimate();
            },100)  
		}
	}; //END FUNCTION





	///==================================================================///
	/**
	 * 下拉加载更多
	 * @param {*} curpage 当前页码
	 */
	var loadScroll = function(curpage){
		var _this = tablePC.getObject();
		var levels = $.privateProperty.tableNestDepth;
		var opt = tablePC.getSettings();
		if(opt.pagination.pageCount == 1) return;
        if(opt.pagination.callback){ //回调函数给前台
            var infos = {"button":"分页", "curpage":curpage, "pagesize":opt.pagination.pageSize, "pageCount":opt.pagination.pageCount}
			var jsonArr = opt.pagination.callback(infos); 
			var getHeadingHTML = {}      
			//showAnimate();
            //setTimeout(function(){
                if(isArray(jsonArr)){ 
					/**
                     *返回值格式：
						1.单个json 
							eg. return tableJson
						2.json或函数名组成的数组或嵌套数组:
							eg. return [tableJson, getXXHTML  
							eg. return [tableJson, [subJson]]
							eg. return [tableJson, [subJson, totalJson]]
							eg. return [tableJson, [subJson], getXXHTML 
							eg. return [tableJson, [subJson, totalJson], getXXHTML        
							其中:
							tableJson  表格列表数据json
							getXXHTML 获取表格标题自定义HTML的函数(这里只需要传递函数名)
							subJson    小计json
							totalJson  合计json
                    */
                    opt.dataJson = jsonArr[0];
					if(isArray(jsonArr[1])) opt.subJson = jsonArr[1];
                    if(typeof jsonArr[1] === 'function') getHeadingHTML = jsonArr[1];
                    if(typeof jsonArr[2] === 'function') getHeadingHTML = jsonArr[2];
					
                }else{ //前台返回值是一个json.eg. var json = {name:"张三"}
                    opt.dataJson = jsonArr; 
				}

				if(!$.isEmptyObject(opt.dataJson)){
					var json =  {"dump":false, "root":_this.find($.privateProperty.tableRootElement)}
					$.refreshData(opt, json); //刷新表格
					if(opt.dataJson.data.length < parseInt(opt.pagination.pageSize)){
						$.privateProperty.singleCreateBool = false;
					}

				}
 
				//destroyAnimate();
            //},100)  
		}
	}; //END FUNCTION





	///==================================================================///
	/**
	 * 将分页绑定到表格选择器（即切换分页显示状态）
	 * 备注：每个选择器对应一个分页
	 * @param {*} method 分页显示方式，即同一可视区域内是否可以同时显示（N个选择器对应的）N个分页. true 可以， false 不可以（默认）
	 */
	var bindPage2Selector = function(method){
		var isShowThemeTime = typeof method == 'undefined' ? false : method === true ? true : false; //是否同时显示多个分页,默认false
		var arr = $.privateProperty.selectorArray;
		if(!isShowThemeTime){
			for(var i=0; i < arr.length; i++){
				var ele = arr[i];
				if($(ele).is(':visible')){
					$('*[data-bind-table="' + ele + '"]').show().siblings().hide();
					break;
				}
			}
		}
	};




	///==================================================================///
	/**
	 * 导出excel功能
	 * 将数据导出excel
	 * @param {*} options 导出参数(可选)
	 */
	var derive2Excel = function(options){
		var defaults = {
			enable: true, //是否启用(可选).默认true
			filename:'导出报表', //文件名（可选）.系统默认的excel文件名为：'Excel Document Name
			fileAutoTime:true, //导出的文件自动添加时间(hh:mm:ss)作为文件名的一部分。默认true
			extension: '.xls' //拓展名。 .xls(excel 2003)(默认), .xlsx (excel 2007,2010)
		}
		var opt = $.extend(true, {}, opt, options || {});	
		
		var tbNode = $.privateProperty.tableRootNode;
		var excelNode = $.privateProperty.excelRootNode;
		//判断问题
		if($(tbNode).length==0){
			alertDialog('表格根节点 ' + tbNode +' 不存在，请检查');
			return;
		}
		if(navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE",""))<11){
			alertDialog('导出EXCEL功能暂不支持IE11以下版本的浏览器\n请使用360(极速模式)、火狐（Firefox）、谷歌（Chrome）等高级浏览器！');
			return;
		}
		//参数设置
		var flag = false;
		if(typeof($('.btn-excel').table2excel)=='function') flag = true;
		if(!flag){
			alertDialog('要使用导出功能，必须引入：\njquery.table2excel.min.js');
		}else{
			var mydate = new Date(),
					year = mydate.getFullYear(),
					month = mydate.getMonth()+1;
					day = mydate.getDate(),
					hour = mydate.getHours(),
					minute = mydate.getMinutes(),
					seconds = mydate.getSeconds();
			if(month<10) month = '0'+month;
			if(day<10) day = '0'+day;
			if(hour<10) hour = '0'+hour;
			if(minute<10) minute = '0'+minute;
			if(seconds<10) seconds = '0'+seconds;
			var today = year+''+month+''+day+''+hour+''+minute+''+seconds;
			
			var $filename = typeof opt.filename == 'undefined' ? defaults.filename : (opt.filename == '' ? defaults.filename : opt.filename),
					$fileAutoTime = typeof opt.fileAutoTime == 'undefined' ? true : opt.fileAutoTime,
					$fileext = typeof opt.extension == 'undefined' ? '.xls' : (opt.extension =='' ? '.xls' : opt.extension);
			if($fileAutoTime) $filename += '-' + today;
			
			var $fileext = ".xls"; //导出的excel文件拓展名
			if(navigator.userAgent.toLocaleLowerCase().indexOf('firefox')>-1){ //火狐浏览器时要带后缀
				$filename = $filename + $fileext;
			}

			//将DIV标签转化成table标签, 即将类表格标签转化成表格标签，如下：
			/*<table> 
				<thead> <tr><th>姓名</th><th>性别</th></tr> </thead> 
				<tbody> <tr><td>阮小七</td><td>男</td></tr> <tr><td>孙二娘</td><td>女</td></tr> </tbody> 
			</table>
			*/
			var titleHTML = $(tbNode).find('.list-title').prop('outerHTML');
			var contentHTML = $(tbNode).find('.list-content').prop('outerHTML');
			var theadHTML = titleHTML.replace(/\<div class="list-title(.+?)">(.*)<\/div>/g, '<thead class="list-title$1"><tr>$2</tr></thead>');
				theadHTML = theadHTML.replace(/<div/g, '<th').replace(/div>/g, 'th>');
			var tbodyHTML = contentHTML.replace(/\<div class="list-content(.+?)">(.*)<\/div>/g, '<tbody class="list-content$1">$2</tbody>');
				tbodyHTML = tbodyHTML.replace(/\<div class="list-one(.+?)">(.*?)<\/div><!--\/\.list-one-->/g, '<tr class="list-one$1">$2</tr>');
				tbodyHTML = tbodyHTML.replace(/<div/g, '<td').replace(/div>/g, 'td>');
				tbodyHTML = tbodyHTML.replace(/<textarea(.*?)>(.*?)<\/textarea>/g, '$2'); //过滤textarea
			//console.log('头部HTML:', titleHTML, '\n内容HTML:',contentHTML);
			//console.log('表头HTML:', theadHTML, '\n表身HTML:',tbodyHTML);
			var allHTML = theadHTML + tbodyHTML;
				//allHTML = allHTML.replace(/<input(.*?)value="(.*?)"(.*?)(\/?)>/g, '$2'); //过滤input(肯定有value属性)
				allHTML = allHTML.replace(/<input(.*?)value((="(.*?)")?)(.*?)(\/?)>/g, '$4'); //过滤input(可能没有value属性)
				allHTML = allHTML.replace(/<span(.*?)>(.*?)<\/span>/g, '$2'); //过滤span
				allHTML = allHTML.replace(/<em(.*?)>(.*?)<\/em>/g, '$2'); //过滤em
			var tableHTML = '<table class="' + excelNode.replace(/[\#\.]/g, '') + '" style="display:none">' + allHTML + '</table>';
			$('body').append(tableHTML); //拼接节点

			//执行操作
			showAnimate('正在导出EXCEL..');
			setTimeout(function(){
				$(document).find(excelNode).table2excel({
					exclude: ".noExl", //不要导出的行
					name: "Excel Document Name", //导出的excel文档名称,默认Excel Document Name
					filename: $filename, //excel文件名
					fileext: $fileext, //文件后辍名
					exclude_img: true, //是否排除导出图片 (exclude 表示不包括)
					exclude_links: true, //是否排除导出超链接 (exclude 表示不包括)
					exclude_inputs: true //是否排除导出输入框中的内容 (exclude 表示不包括)
				})
				$(document).find(excelNode).remove(); //移除节点
				destroyAnimate();
			},100)
		}

	}; //END FUNCTION







	///==================================================================///
	/**
	 * 生成随机字符串(数字+字母组成)
	 */
	var generateRandChar = function(){
		var str = Math.random().toString(36).substr(2);
		return str;
	}; //END FUNCTION

	/**
	 * 判断数据源是否为空
	 * 即判断JSON对象中的data数组是否有数据(数组或单个数据)
	 * true json非空（即有值）。eg.var json={"data":[{"value":"1001"}]}
	 * false json为空。eg1. var json=''; eg2.var json={}; eg3.var json={data:[]}. eg4. var jso = {d:[{}]} 非data字段
	 * @param {object} ps_source json数据
	 */
	var checkSourceHasData = function(ps_source){
		var flag = false;
		if(typeof ps_source == 'object'){
			if(!$.isEmptyObject(ps_source)){ //ps_source!={}
				if(typeof ps_source.data != 'undefined'){
					if(ps_source.data.length > 0) flag = true;
				}
			}
		}
		return flag;
	}; //END FUNCTION


	/**
	 * 获取浏览器滚动条高度或宽度（垂直滚动宽度、水平滚动条高度）
	 */
	var getScrollbarWidth = function(){
        var oP = document.createElement('p'), styles = {
            width: '100px',
            height: '100px',
            overflowY: 'scroll',
        }, i, widthOfBar;
        for (i in styles){
            oP.style[i] = styles[i];
        }
        document.body.appendChild(oP);
		widthOfBar = oP.offsetWidth - oP.clientWidth;
		if(checkIsIE()) oP.removeNode(true);
		else oP.remove();
        return widthOfBar;
	};


	/**
	 * 判断是否数组（兼容ie8)
	 * @param {*} str 要检测的字符串或数组
	 * return 返回值 true 表示是数组，false 表示非数组 
	 */
	var isArray = function(str){
		return Object.prototype.toString.call(str) == "[object Array]";
	}; //END FUNCTION

	/*ie9以下浏览器不支持js filter*/
	if(!Array.prototype.filter){
		Array.prototype.filter = function(fun /*,thisp*/){
			var len = this.length;
			if(typeof fun != 'function'){
				throw new TypeError();
			}
			var res = new Array();
			var thisp = arguments[1];
			for(var i=0; i< len; i++){
				if(i in this){
					var val = this[i]; //in case fun mutates this
					if(fun.call(thisp, val, i, this)){
						res.push(val);
					}
				}
			}
			return res;
		};
	}

	/*ie9以下浏览器不支持 js indexOf*/
	if(!Array.prototype.indexOf){
		Array.prototype.indexOf = function(elt /*,from*/){
			var len = this.length >>> 0;
			var from = Number(arguments[1]) || 0;
			from = (from < 0)
				? Math.ceil(from)
				: Math.floor(from);
			if(from < 0) from += len;
			for(; from < len; from++){
				if(from in this && this[from] === elt) return from;
			}
			return -1;
		};
	}


	/**
	 * 数组去重
	 * @param {*} arr 旧数组
	 */
	var distinctArray = function(arr){
		var newArr = arr.filter(function(element, index, self){
			return self.indexOf(element) === index;
		})
		return newArr;
	}; //END FUNCTION

	var showAnimate = function(ps_str){
		if(typeof neui != 'undefined') {
			if(typeof neui.showAnimate === 'function') neui.showAnimate(ps_str);
		}
	};

	var destroyAnimate = function(){
		if(typeof neui != 'undefined') {
			if(typeof neui.destroyAnimate === 'function') neui.destroyAnimate();
		}
	};


	
	/**
	 * 根据不同数据类型返回不同的值
	 */
	var returnValueByDataType = function(ps_value, ps_type){
		var value = ps_value;
		if(ps_type.indexOf('int') >= 0) value = parseInt(ps_value);
		if(ps_type.indexOf('float') >= 0 || ps_type.indexOf('percentage') >= 0 || ps_type.indexOf('decimal') >= 0) value = parseFloat(ps_value.toString().replace('%',''));
		return value;
	}; //END FUNCTION
	

	/**
	 * JSON排序
	 * @param {Array} ps_arr 数组。eg. [{"age":"25","height":"170"},{"age":"26","height":"180"}]
	 * @param {string} ps_key 字段英文
	 * @param {string} ps_type 字段类型(整形,字符型等) . string 字符型，int 整形， float 浮点型，percentage 百分数，decimal 小数
	 * @param {string} ps_sorting 方式。down 降序(默认), up 升序
	 * @returns {json} 返回新json
	 * eg.
		var willSort = {data:[{"age":"25","height":"170"},{"age":"26","height":"180"}]};
		var arr = obj.data;
		var json = jsonsort(arr,'age','int','down'); //按age字段降序
		var json = jsonsort(arr,'age','int','raise'); //按age字段升序
	*/
	var JsonSort = function(ps_arr, ps_key, ps_type, ps_sorting){
		var arr = ps_arr;
		for(var j = 1, jl = arr.length; j < jl; j++){
			var temp = arr[j],
				val = returnValueByDataType(temp[ps_key],ps_type), 
				i = j-1;
			if(ps_sorting=='raise'){ //升序
				while(i >=0 && returnValueByDataType(arr[i][ps_key],ps_type)>val){
					arr[i+1] = arr[i];
					i = i-1;    
				}
			}else{//降序
				while(i >=0 && returnValueByDataType(arr[i][ps_key],ps_type)<val){
					arr[i+1] = arr[i];
					i = i-1;    
				}
			}
			arr[i+1] = temp;				
		}
		return arr;
	}; //END FUNCTION
	


	/**
	 * 根据表格列字段配置数组，创建一条空的数据源 20201110-1
	 * @param {array} ps_set_source 表格列字段配置数据
	 * @returns {object} 返回一条值为空的JSON对象
	 */
	var createAnEmptyData = function(ps_set_source){
		var newArr = [];
		var json = {}
		var column_arr = ps_set_source["columns"];
		for(var i = 0; i < column_arr.length; i++){
			var one = column_arr[i];
			var field = one["field"];
			var value = typeof one["default"] == 'undefined' ? '' : one["default"],
				bh = typeof one["hidden"] == 'undefined' ? '' : one["hidden"],
				asHidVal = typeof one["asHidVal"] == 'undefined' ? false : (one["asHidVal"] == true ? true : false); //默认false
			if(asHidVal) value = (bh == '' ? value : bh);
			if(typeof field != 'undefined'){
				if(field != ''){
					json[field] = value;
				}
			}
		}
		return json;
	};



			
	/**
	 * 弹出提示窗口
	 * @param {*} ps_str 提示文字
	 * @param {*} ps_btn_num 按钮数量
	 * @param {*} ps_callback 回调函数
	 */
	var alertDialog = function(ps_str, ps_btn_num, ps_callback){
		var tips = ps_str;
		var buttons = ps_btn_num == 2 ? ['确定','取消'] : ['确定'];
		if(typeof neuiDialog!='undefined'){
			neuiDialog.alert({
				caption: '提示',
				message: tips,
				buttons: buttons,
				callBack:function(ret){
					if(ret == 1){							
						if(typeof ps_callback === 'function'){
							ps_callback();
						}
					}
				}
			})
		}else{
			tips = ps_str.toString().replace(/\<br\>/g,'\n');
			if(ps_btn_num == 1) alert(tips);
			else{
				var message = confirm(tips); //确定取消
				if(message === true){
					if(typeof ps_callback === 'function'){
						ps_callback();
					}
				}else{
					//..
				}
			}				
		}
	}; //END FUNCTION
	


	/**
	 * 检测字符串是否正整数（不包括零）
	 * true 是， false 否
	 * eg. 3 和 '3' 都是正整数
	 * @param {*} str 
	 */
	var isStrPositiveInteger = function(str){
		var reg = /^\+?[1-9][0-9]*$/;
		if(reg.test(str)) return true;
		else return false;
	}; //END FUNCTION


	
	/**
	 * 返回纯字符串的节点信息
	 * 即过滤节点的class属性中的点号.和井号#
	 * @param {*} str 
	 */
	var getNodePureString = function(str){
		return str.replace(/#|\./g, '');
	}; //END FUNCTION


	/**
	 * 检验字符串是否小数或整数（正负小数、正负整数）
	 * @param {string} str 字符串
	 * @param {string} isPositiveOrNegative 检验类型（可缺省）。值：'both' 正负小数、正负整数(默认),'positive' 正整数、正小数，'negative' 负整数、负小数
	 */
	var checkIsXiaoshu = function(str, isPositiveOrNegative){
		var types = typeof isPositiveOrNegative == 'undefined' ? 'both' : isPositiveOrNegative;
		var reg = /^\-?[0-9]+\.?[0-9]+$/; 
		if(types == 'positive') reg = /^[0-9]+\.?[0-9]+$/; //正整数、正小数
		if(types == 'negative') reg = /^\-[0-9]+\.?[0-9]+$/; //负整数、负小数
		var bools = !reg.test(str) ? false : true;
		return bools;
	};


	/**
	* 检测是否IE浏览器
	* @returns {Booleans} 返回值：true 是ie, false 非ie
	*/
	var checkIsIE = function(){
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
		var isIE = window.ActiveXObject || "ActiveXObject" in window;
		return isIE ? true : false;
	};

	/**
	 * 检测浏览器类型(ie,firefox,google chrome,safari,opera)
	 */
	var checkBrowserType = function(){ //
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
        var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器 
        //var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器 
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        //var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否IE的Edge浏览器 
        var isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
        var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器 
        var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器 
        var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1&&!isEdge; //判断Chrome浏览器 
    
        if (isIE)  
        { 
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);"); 
            reIE.test(userAgent); 
            var fIEVersion = parseFloat(RegExp["$1"]); 
            if(userAgent.indexOf('MSIE 6.0')!=-1){
                return "ie6";
            }else if(fIEVersion == 7){ 
                return "ie7"; //ie7或ie5
            }else if(fIEVersion == 8){ 
                return "ie8";
            }else if(fIEVersion == 9){ 
                return "ie9";
            }else if(fIEVersion == 10){ 
                return "ie10";
            } else if(userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)){ 
                return "ie11";
            }else{ 
                return "0"; //IE版本过低(ie5以下版本)
            } 
        }        
        if (isFF) { return "firefox";} 
        if (isOpera) { return "opera";} 
        if (isSafari) { return "safari";} 
        if (isChrome) { return "chrome";} 
        if (isEdge) { return "edge";} 
	};


	/**
	 * 检测IE浏览器版本号,
	 * 如果是ie浏览器则返回IE版本号，否则返回-1
	 */
	var checkIEVersion = function(){
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        if (isIE)  
        { 
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);"); 
            reIE.test(userAgent); 
            var fIEVersion = parseFloat(RegExp["$1"]); 
            if(userAgent.indexOf('MSIE 6.0')!=-1){
                return 6;
            }else if(fIEVersion == 7){ 
                return 7; //ie7或ie5
            }else if(fIEVersion == 8){ 
                return 8;
            }else if(fIEVersion == 9){ 
                return 9;
            }else if(fIEVersion == 10){ 
                return 10;
            } else if(userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)){ 
                return 11;
            }else{ 
                return 0; //IE版本过低(ie5以下版本)
			}
		}else{
			return '抱歉，不是IE浏览器，无法检测IE版本';
		} 
	};
	



	/**
	 * colations对象,用于过滤某些东西
	 */
	var colations = {
		/**
		 * 过滤HTML代码
		 * @param {string} str 原字符串 
		 * @param {boolean} isHTML 是否过滤html,css,js,换行,空格等多余内容. true 是(默认)， false 否
		 * @returns {string} 返回无html标签的新字符串
		 */
		html:function(str, isHTML){
			var flag = typeof isHTML == 'undefined' ? true : (isHTML == false ? false : true);
			if(flag){ //1.过滤标签(会保留标签之间的内容,但标签去掉)
				if(typeof str == 'undefined' || str == null) return '';
				var str = str.toString().replace(/\<style[\s\S]*>[\s\S]*<\/style>/g,''); //过滤css
				str = str.replace(/\<script[\s\S]*>[\s\S]*<\/script>/g,''); //过滤JS
				str = str.replace(/<[^<>]+?>/g,'');  //过滤html标签
				str = str.replace(/\ +/g,''); //去掉空格
				str = str.replace(/[\r\n]+?/g,''); //去掉换行
				str = str.replace(/(&nbsp;|&ensp;|&emsp;|&thinsp;)/ig, ''); //去掉nbsp、ensp、emsp、thinsp等空格
			}
			if(typeof HTMLEncode === 'function') str = HTMLEncode(str); //2.标签转化成字符串
			return str;
			//return str.replace(/<[^<>]+?>/g,'');
		},


		/**
		 * 过滤字符串中相同的字符 
		 * 一组字符串中相同的字符只保留第一个
		 * @param {string} ps_str 原始字符串
		 * @param {string} ps_char 要替换的字符（可选）.若缺省则默认替换所有相同字符,否则只替换指定字符
		 * @returns {string} 返回新字符串
		 */
		repeatedChar:function(ps_str, ps_char){
			var char = typeof ps_char == 'undefined' ? '' : ps_char;
			var result = ps_str.replace(/./g, function(s,index){
				return ps_str.indexOf(s) == index ? s : char == '' ? '' : (char == s ? '' : s);
			});
			return result;
		},

		
		/**
		 * 将html标签转化成字符串
		 *（如：将<转化成&lt;>转化成&gt;) 
		* @param {string} str html代码
		* @returns {string} 返回去掉标签的字符串
		*/
		HTMLEncode:function(str) {
			var temp = document.createElement("div");
			(temp.textContent != null) ? (temp.textContent = str) : (temp.innerText = str);
			var output = temp.innerHTML.toString().replace(/\"/g,"&quot;").replace(/\'/g,"&apos;"); //双引号转化成&quot; 单引号转化成 &apos; 
			output = output.replace(/\r/g,"").replace(/\n/g,"").replace(/\t/g,"").replace(/\\/g,"/"); //回车\换行\制表符替换成空, 反斜杠\替换成对应斜杠/
			temp = null;
			return output;
		}

	}; //END colations对象


	/**
	 * limitation对象, 用于限制输入类型
	 */
	var limitation = {
		/**
		 * 只能输入：正整数
		 * eg. 10
		 * @param {string} str 字符串值
		 * @return {number} 返回字符
		 */
		onlyInterval: function(str){
			var value = str.toString().replace(/[^\d]/g,'');
			return value;
		},
	
		/**
		 * 只能输入：正小数
		 * eg. 10.53
		 * @param {string} str 字符串值
		 * @return {number} 返回字符
		 */
		onlyFloat: function(str){
			var value = str.toString().replace(/[^\d\.]/g,'');
			value = colations.repeatedChar(value, '.'); //只保留一个小数点
			return value;
		},
	
		/**
		 * 只能输入：正负整数（即正整数、负整数）
		 * 适用于：手机号码、固定电话
		 * @param {string} str 字符串值
		 * @return {number} 返回字符
		 */
		negativeInterval: function(str){
			var value = str.toString().replace(/[^\d\-]/g,'');
			value = colations.repeatedChar(value, '-'); //只保留一个负号
			value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; //把负号提到最前面
			return value;
		},
	
		/**
		 * 只能输入：正负小数（即正整数、负整数、正小数、负小数）
		 * eg. 10.53, -10.53 
		 * @param {string} str 字符串值
		 * @return {number} 返回字符
		 */
		negativeFloat: function(str){
			var value = str.toString().replace(/[^\d\.\-]/g,'');
			value = colations.repeatedChar(value, '.'); //只保留一个小数点
			value = colations.repeatedChar(value, '-'); //只保留一个负号
			value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; //把负号提到最前面
			return value;
		}
	
	}; //END limitation对象




	///==================================================================///
	/**
	 * 添加私有属性、方法到全局对象中
	 * 这些属性、方法不对外开放，只有控件内部可调用，外部无法修改其值
	 * 内部调用方法：
	 * eg1. $.aaa();
	 * eg2. $.privateProperty.xx
	 */
	$.extend({
		refreshData:createBookList, //刷新表格数据
		refreshPage:createPageList, //刷新分页
		privateProperty:{
			excelRootNode:'.ne-excel-table', //EXCEL导出表格时的根节点
			tableRootNode:'.ne-like-table', //表格根节点(用于全局赋值,值会改变)
			tableRootElement:'.ne-like-table', //表格根节点(用于调用,值一直不变)		
			tableNestDepth:1, //表格列表数据json嵌套层次.默认1.(有几个Data就是几层嵌套).
			footerNode:'#ne-pager-foot', //底部根节点
			pageRootElement:'.pagelist', //分页根节点
			pageCurpage:{}, //分页当前页码
			pageTotal:{}, //分页总页数
			pagePerpage:{}, //分页每页条数
			recordTotal: {}, //分页总记录数
			educeExcel:{}, //导出excel
			insertTimes:0, //数据添加方式为"追加插入到最后面"时追加了几次数据(默认0)
			selectorArray:[], //控件节点数组
			selectorCurrent:null, //当前控件节点
			options:{}, //控件参数
			captionArray:{}, //表标题json.eg. {a:[], b:[]}

			unchangeTxt:'未保存', //状态列数据有更改时的文字
			changedTxt:'已保存', //状态列数据无更改时的文字

			remainIllegalChar:false, //单元格内容是否保留非法字符(防止向数据库写入非法字符)(可选). true 是, false 否(默认).  true时会保留html标签之间正常的字符,但标签去掉; false时虽不过滤标签，但标签会被转成字符串.

			singleCurpage: 1, //下拉加载更多分页页码
			singleScroll: false, //是否是“下拉加载更多”,默认false
			singleCreateBool: true //标记“下拉加载更多”是否执行
		}
	});



	/**
	 * 对外暴露接口，供前端调用
	 */
	$.fn.extend({
		neuiLikeTable: tablePC.init,
		bindPage2Selector: bindPage2Selector,
		getFormData: getFormData,
		insertNewRow: insertNewRow,
		addNewRow: addNewRow,
		deleteAnRow: deleteAnRow,
		changeStateColumn: changeStateColumn,
		checkHollowRow:checkHollowRow,
		checkInterateRow:checkInterateRow,
		setColumnsReadonly:setColumnsReadonly,
		setColumnsCanWrite:setColumnsCanWrite,
		giveValue2Columns:giveValue2Columns,
		chooseAllRow:chooseAllRow,
		reverseAllRow:reverseAllRow,
		chooseNoneRow:chooseNoneRow,
		derive2Excel: derive2Excel
	});
	

})(jQuery);







/*-------------------------
 * 供前台调用的方法
-------------------------*/
var neuiLikeTable = {
	/**
	 * 导出EXCEL
	 * @param {object} ps_params 导出参数(可选)
	 */
	export2Excel:function(ps_params){
		$('body').derive2Excel(ps_params);
	},

	/**
	 * 切换分页显示状态
	 * 即分页会自动随着绑定节点(表格)显示或隐藏，类似：一夫一妻，夫唱妇随
	 * @param {boolean} ps_pattern 是否
	 */
	switchPageState:function(ps_pattern){
		$('body').bindPage2Selector(ps_pattern);
	},

	/**
	 * 获取表格表列表数据（即表格表单数据）
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选). eg. $('.section-table-area').find('.ne-like-table')
	 */
	getTableListData:function(ps_obj){
		return $('body').getFormData(ps_obj);
	},



	/**
	 * 获取表格选中行的数据（所有“选择”一列打钩的记录组成的数据）
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	getTableSelectedData:function(ps_obj){
		var json = $('body').getFormData(ps_obj);
		var source = {data:[]}
		$.each(json.data, function(i, item){
			if(typeof item["multiple"] != 'undefined'){
				if(item["multiple"]["value"] == 1) source.data.push(item);
			}
		})
		return source;
	},



	/**
	 * 新增一行(非空行)  add 20201112-1
	 * 即在有数据的列表上添加一行,且该行各列值不空
	 * @param {object} ps_source 数据源
	 * @param {object} ps_obj 当前表格对象(可选)
	 */
	insertOneRow:function(ps_source, ps_obj){
		$('body').insertNewRow(ps_source, ps_obj);
	},

	/**
	 * 新增一行(空行)
	 * 即在有数据的列表上添加一行,且该行各列值为空
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	addOneRow:function(ps_obj){
		$('body').addNewRow(ps_obj);
	},

	/**
	 * 删除某一行
	 * @param {number} ps_row_index 行号索引值
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	deleteOneRow:function(ps_row_index, ps_obj){
		$('body').deleteAnRow(ps_row_index, ps_obj);
	},


	/**
	 * 重置某一行的状态列为“已保存”
	 * @param {Number} ps_row_index 行号索引值(可选,默认所有行). 值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {String} ps_status 状态. saved 已保存(默认), unsave 未保存
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	changeRowStatus:function(ps_row_index, ps_status, ps_obj){
		$('body').changeStateColumn(ps_row_index, ps_status, ps_obj);
	},

	/**
	 * 校验数据完整性（即某个单元格必填，不能为空）
	 * @param {Number} ps_row_index 指定要校验的行(行索引值)(可选,默认所有行), 值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 * @return {string} 返回空或“某个单元格值不能为空”的提示信息
	 */
	checkEmptyRow:function(ps_row_index, ps_obj){
		return $('body').checkHollowRow(ps_row_index, ps_obj);
	},

	/**
	 * 校验重复行（即某个单元格值必须唯一）
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 * @return {string} 返回空，或“A单元格与B单元格值相同”的提示信息
	 */
	checkRepeatRow:function(ps_obj){
		return $('body').checkInterateRow(ps_obj);
	},

	/**
	 * 指定某一行某些列为只读状态
	 * 常用于：某一列，在列表时只读,但新增时又要求可输入
	 * @param {Array} ps_en_arr 列字段英文组成的数组
	 * @param {Number} ps_row_index 行索引值(可选,默认所有行).值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	setSomeColumnReadonly:function(ps_en_arr, ps_row_index, ps_obj){
		$('body').setColumnsReadonly(ps_en_arr, ps_row_index, ps_obj);
	},

	/**
	 * 给指定的某行某些列赋值
	 * @param {Number} ps_row_index 行索引值
	 * @param {array} ps_field_arr 列字段组成的数组
	 * @param {array} ps_value_arr 列值组成的数组
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	giveValue2SomeColumn:function(ps_row_index, ps_field_arr, ps_value_arr, ps_obj){
		$('body').giveValue2Columns(ps_row_index, ps_field_arr, ps_value_arr, ps_obj);
	},


	/**
	 * 指定某一行某些列为可写状态
	 * 常用于：某一列，在列表时只读,但新增时又要求可输入
	 * @param {Array} ps_en_arr 列字段英文组成的数组
	 * @param {Number} ps_row_index 行索引值(可选,默认所有行).值：0,1,2,3 等具体某一行的索引值, all 表示所有行
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	setSomeColumnCanWrite:function(ps_en_arr, ps_row_index, ps_obj){
		$('body').setColumnsCanWrite(ps_en_arr, ps_row_index, ps_obj);
	},


	/**
	 * 全选
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	selectAllRow:function(ps_obj){
		$('body').chooseAllRow(ps_obj);
	},

	/**
	 * 反选
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	invertAllRow:function(ps_obj){
		$('body').reverseAllRow(ps_obj);
	},

	/**
	 * 全不选
	 * @param {object} ps_obj 指定表格根节点对象(当页面只有一张表格时则可选)
	 */
	selectNoneRow:function(ps_obj){
		$('body').chooseNoneRow(ps_obj);
	}




}

