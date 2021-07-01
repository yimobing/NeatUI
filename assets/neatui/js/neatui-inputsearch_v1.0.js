var st = "";
var liVal = "";
var quer = 1;
var liVal_exit = 0;
var onoff = true;
var timer = null;

//=====检测是否手机端,如果是，返回true
function checkIsMobile(){
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

function removeInput() {
	$('#searchUlNew').html("");
	$('#searchListNew').remove();
	quer = 1;
	onoff = true;
}
function neuiInputsearch(options, input) {
	var defaults = {
		oneItemAutoFill: checkIsMobile() ? false : true, //只有一个下拉选项时是否自动填充. 移动端时默认false, pc端时默认true
		noDataDrop: false, //无数据时是否显示“无数据”下拉框. 默认false
		closeButton: true, //是否显示关闭按钮. 默认true
		format: ['id', 'value'], //自定义json字段格式.默认['id', 'value']
		inputChange: null,
		inputBack: null
	};
	var settings = $.extend(defaults, options);
	var _closeStr = !settings.closeButton ? '' : '<div id="ne-input-search-close">关闭</div>';

	var ipt = $(input);

	var str = '<div id="searchListNew">' +
		'	<ul id="searchUlNew">' +
		'	</ul>' +
			_closeStr + 
		'</div>';
	removeInput();

	function setHeight() {

		var searchLiH = $('#searchListNew li').eq(0).eq(0).outerHeight();
		var searchListH = 7 * searchLiH;
		var winH = $(window).height();
		var winW = $(window).width();
		$('#searchUlNew').css({
			'max-height': searchListH
		});

		//定位
		var winH = $(window).outerHeight(true); //视窗高
		var eleH = ipt.outerHeight(true); //元素高度
		var selfH = $('#searchUlNew').outerHeight(true) + $('#ne-input-search-close').outerHeight(true); //自身高度
		var top = ipt.offset().top + eleH + 1,
			left = ipt.offset().left,
			width = ipt.outerWidth(true);
		if(winH - top - selfH <= 0){
			top = top - selfH - eleH - 2;
			if(top < 0) top = 5;
		}
		var style = 'top:' + top + 'px;left:' + left + 'px;width:' + width + 'px;height:' + selfH + 'px;"';
		$('#searchListNew').attr('style',style);


	}

	var arr = [];
	var matchSpring = function () {
		var id = [];
		if (arr.length > 0) {
			for (var i = 0; i < arr.length; i++) {
				id[i] = ' data-id="无" data-bh="无"';
				if (typeof (arr[i].id) != 'undefined' && arr[i].id != '') id[i] = ' data-id="' + arr[i].id + '" data-bh="' + arr[i].id + '"'; //edit 20191212-1
				$('#searchUlNew').append('<li' + id[i] + '>' + arr[i].value + '</li>');
			}
			$('#ne-input-search-zerodata').remove();
		} else {
			if(settings.noDataDrop) {
				$('#searchListNew').prepend('<div id="ne-input-search-zerodata">无数据</div>');
				$('#searchUlNew').hide();
			}
			else $('#ne-input-search-close').remove();
		}
	}
	

	var arrval = settings.inputChange(); //edit 20191129-1
	//初始化
	ipt.attr({ 
		'data-id': '', 
		'data-bh': '',
		'data-value': ''
	})

	if ("undefined" != typeof arrval && typeof (arrval.data) != 'undefined' && arrval != '') { //add 20200827-1
		var newJson = {"data":[]}
		if(settings.format){
			for(var k = 0; k < arrval.data.length; k++){
				var row = arrval.data[k];
				var attrId = settings.format.length == 1 ? null : settings.format[0],
					attrValue = settings.format.length == 1 ? settings.format[0] : settings.format[1];
				newJson.data.push({"id": attrId == null ? (k+1) : row[attrId], "value": row[attrValue]});
			}
			arrval = newJson;
		}
	}


	if ("undefined" != typeof arrval && typeof (arrval.data) != 'undefined' && arrval != '') { //edit 20180622-1
		var bh = [];
		for (var i = 0; i < arrval.data.length; i++) {
			bh[i] = '';
			if (typeof (arrval.data[i].id) != 'undefined' && arrval.data[i].id != '') bh[i] = arrval.data[i].id;
			arr.push({ id: bh[i], value: arrval.data[i].value });
			//arr.push(arrval.data[i].value);
		}
	}

	//if(arr.length==0) return;
	if(typeof arrval.data != 'undefined'){
		if(settings.oneItemAutoFill && arrval.data.length == 1){  //下拉只有一个值时直接填充，无须下拉
			var newId = typeof arrval.data[0].id == 'undefined' ? '无' : arrval.data[0].id;
			var newVal = arrval.data[0].value;
			var oldVal = typeof (ipt.attr('data-oldVal')) == 'undefined' ? '' : ipt.attr('data-oldVal'); //老值(值)
			var oldId = typeof (ipt.attr('data-oldId')) == 'undefined' ? '' : ipt.attr('data-oldId'); //老值(id)
			var tag = ipt.get(0).tagName;
			if (tag == 'DIV' || tag == 'div') {
				ipt.text(newVal);
			} else {
				ipt.val(newVal);
			}
			ipt.attr('data-oldVal', newVal);
			ipt.attr('data-oldId', newId);
			ipt.attr('data-id', newId);
			ipt.attr('data-bh', newId);
			ipt.attr('data-value', newVal);
			ipt.attr('title',newVal);
			if (settings.inputBack) {
				var json = { "id": newId, "value": newVal, "oldId": oldId, "oldValue": oldVal, "object": ipt }
				settings.inputBack(newVal, oldVal, json);
			}
		}else{
			if (onoff) {
				if (quer == 1) {
					//ipt.parent().append(str);
					if(arrval.data.length > 0) $('body').append(str); //拼接节点
					else{
						if(settings.noDataDrop) $('body').append(str); //拼接节点
					}
					quer = 2;
				}
				onoff = false;
				clearTimeout(timer);
			}
		
			st = ipt.val();
			$('#searchUlNew').html("");
		
			matchSpring();
			setHeight();

			if ($('#searchListNew')[0]) {
				var winH = $(window).height();
				var searchUlNewH = $('#searchListNew').outerHeight();
				var searchUlNewHT = winH - searchUlNewH;
				var searchUlNewHTT = $('#searchListNew').offset().top - $(window).scrollTop();
				if (searchUlNewHTT > searchUlNewHT) {
					var searchUlNewHTb = searchUlNewHTT - searchUlNewHT;
					var winScrT = $(window).scrollTop() + searchUlNewHTb;
					$(window).scrollTop(winScrT);
				}
			}

			
			$('#searchUlNew>li').on('click', function (e) {
				e.stopPropagation();
				$(this).css({
					'background': '#b2b2b2'
				})
				//选中后事件
				if (liVal_exit == 0) {
					var newVal = $(this).text(); //新值(值)
					var newId = $(this).attr('data-bh'); //新值（id)
					var oldVal = typeof (ipt.attr('data-oldVal')) == 'undefined' ? '' : ipt.attr('data-oldVal'); //老值(值)
					var oldId = typeof (ipt.attr('data-oldId')) == 'undefined' ? '' : ipt.attr('data-oldId'); //老值(id)
					//alert('newVal:'+newVal + '\noldVal:'+oldVal);
					//赋值
					var tag = ipt.get(0).tagName;
					if (tag == 'DIV' || tag == 'div') {
						ipt.text(newVal);
					} else {
						ipt.val(newVal);
					}
					ipt.attr('data-oldVal', newVal); //add 20180123-1
					ipt.attr('data-oldId', newId);
					ipt.attr('data-id', newId); //add 20180223-1 edti 20191212-1 兼容旧版
					ipt.attr('data-bh', newId); //add 20191212-1
					ipt.attr('data-value', newVal);
					ipt.attr('title',newVal); //add 20191223-1
					//回调函数
					if (settings.inputBack) {
						//edit 20191220-1
						var json = { "id": newId, "value": newVal, "oldId": oldId, "oldValue": oldVal, "object": ipt }
						settings.inputBack(newVal, oldVal, json);
					}
				}
				$('#searchUlNew').html("");
				$('#searchListNew').remove();
				
				quer = 1;
				timer = setInterval(function () {
					onoff = true;
				}, 300);
			});	
		} //ELSE
	}

	$("#ne-input-search-close").click(function (e) {
		e.stopPropagation();
		$('#searchUlNew').html("");
		$('#searchListNew').remove();
		quer = 1;
		onoff = true;
	});

	//=====点击输入框元素以外的地方隐藏下拉区域 add 20191223-1
	// 在同一个页面多个地方(比如多个弹出窗口中)用到本控件时会出现问题,故须注释掉下面的代码 edit 20210626-1
	//$('body').bind('click',function(e){
	/* $(document).on('click', function(e){
		var target = $(e.target); //注:e.target.closest(selector).length==0 说明点击的不是元素selector区域,反之则是
		if(target.closest('#searchListNew').length !=0 || target.closest(ipt).length !=0) return;
		$('#searchListNew').remove(); 
	}); */


	/**/

	/*
	$('#form1').click(function(){
		removeInput();
	});
	*/

}
