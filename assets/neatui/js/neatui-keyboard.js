/**
 * * [neuiKeyboard]
 * * 数字键盘控件
 * * Author: mufeng
 * * QQ：1614644937
 * * Date: 2017.11.28
 * * Update: 2022.02.22
*/

/*+--------------------------------------------------------------------------------------------+*/
(function ($) {
	$.fn.extend({
		neuiKeyboard: function (options) {

			var defaults = {
				object: null, // 当前调用数字键盘的元素对象(返回给前台页面,方便调用) 前台调用方法eg1. this.object[0].id; // 当前元素的ID  eg2.this.object[0].className; // 当前元素class
				mode: '', // 键盘模式,默认空(可选). mobile 移动端模式, computer 电脑端模式. 控件会根据终端设备自由切换模式, 移动端模式下键盘使用绝对定位, 电脑端模式下键盘使用相对定位, 某些情况下,在移动端强制使用电脑端模式效果会更好.
				size: 'normal', // 键盘尺寸,仅在mode='computer'时有效(可选). normal 正常(默认), small 小型, little 较小型, tiny 微型
				theme: 'normal', // 样式风格(可选)，默认'normal'。值: normal 默认中规中矩的, popular 现代流行的。
				title: '', // 键盘抬头标题(可选), 默认空。theme 参数值为popular时，本参数失效。
				hasPoint: true, // 是否有小数点(可选),默认true
				hasMinus: false, // 是否有负号(可选),默认false
				minimum: null, // 输入最小值(可选)
				maximum: null, // 输入最大值(可选)
				
				openBack: null, // 打开(点击元素)时的回调函数(可选)。常用于输入框on focus事件。返回值格式. {element: '当前元素对象', value:'当前元素值'}
				numericBack: null, // 点击数字键时的回调函数(可选)。常用于输入框on input事件。返回值格式. {element: '当前元素对象', value:'当前元素值', key: '当前数字键盘键对象'}
				spaceBack: null, // 点击退格键(删除键)时的回调函数(可选)。 {element: '当前元素对象', value:'当前元素值', key: '当前数字键盘键对象'}
				closeBack: null  // 关闭时的回调函数(可选)。常用于输入框on blur事件。 {element: '当前元素对象'}
			}
			var settings = $.extend({}, defaults, options);
			this.each(function () {
				var $this = $(this);
				settings.object = $this; // 当前元素对象
				$this.parent().css('position', 'relative'); // 添加relative属性，不然假光标可能太长！// add 201809
				var classname = $this[0].className; // 当前选择器class
				var id = $this.attr('id'); // 当前选择器ID
				var selector = '.' + classname;
				if (classname == '') var selector = '#' + id;

				// 元素onfocus属性添加this.blur()防止聚焦时调起系统自带的输入法 add 20210322-1
				var _onfocusStr = typeof $(this).attr('onfocus') == 'undefined' ? '' : $(this).attr('onfocus');
				if(_onfocusStr.indexOf('this.blur()') < 0) _onfocusStr += _onfocusStr == ''  ? 'this.blur()' : ';this.blur()';
				_onfocusStr.replace(/[;]+/g, ';');
				$(this).attr('onfocus', _onfocusStr);

				// 火狐浏览器input输入框无法使用click事件呼起数字键盘 add 20190606-1
				var mouseEvent = 'click input';
				if (navigator.userAgent.toLocaleLowerCase().indexOf('firefox') > -1 && $this[0].tagName.toLocaleLowerCase() == 'input') {
					mouseEvent = 'focus';
				}

				// $this.on('click input', function(event) {
				$this.on(mouseEvent, function (event) { // edit 20190606-1 本行 
					// ·--------第1步，先关闭数字键盘(必须!)
					$('.ne-keyboard-layer').remove();
					// ·--------第2步，再调用关闭函数 add by chr 20230228-1
					if (settings.closeBack){
						var $currentThis = Array.isArray($.PRIVATEOBJECTARR) ? 
							( $.PRIVATEOBJECTARR.length == 0 ? $this : $.PRIVATEOBJECTARR[$.PRIVATEOBJECTARR.length - 1] ) : 
							$this;
						settings.closeBack({
							element: $currentThis
						});
					}
					// 控件对象加入私有数组中
					if(typeof $.PRIVATEOBJECTARR == 'undefined'){
						$.PRIVATEOBJECTARR = [];
					}
					$.PRIVATEOBJECTARR.push($this);

					// ·--------其它步骤
					//
					var topClass = settings.title == '' ? ' shadow-top' : '';
					var themeClass = settings.theme == 'popular' ? ' fashion-popular' : '';
					// 生成数字键盘节点
					var html = '<div class="ne-keyboard-layer' + topClass + themeClass + '">';
					html += settings.theme != 'popular' ? '' : '<div class="keyboard__down"><span>关闭</div>'; // 关闭
					html += settings.theme == 'popular' ? '' : (settings.title == '' ? '' : '<div class="keyboard__title">' + settings.title + '</div>');
					html += [
						'<div class="keyboard__edit clearfix">',
							'<div class="keyboard__keys keyboard__num">',
								'<div class="num">1</div>',
								'<div class="num">2</div>',
								'<div class="num">3</div>',
								'<div class="num">4</div>',
								'<div class="num">5</div>',
								'<div class="num">6</div>',
								'<div class="num">7</div>',
								'<div class="num">8</div>',
								'<div class="num">9</div>',
							'</div>',
							'<div class="keyboard__keys keyboard__operate">',
								(
									settings.hasPoint == true ? 
										'<div class="num keyboard__dot">.</div>'
										:
										(settings.hasMinus == true ? '' : '<div class="keyboard__fill"></div>' )
								),
								(
									settings.hasMinus == true ? 
										'<div class="num keyboard__minus">-</div>'
										:
										'' 
								),
								'<div class="num keyboard__zero">0</div>',
								'<div class="keyboard__backspace"></div>', // 删除
							'</div>',
						'</div>'
					].join('\r\n');
					
					
					settings.theme == 'popular' ? '' : html += '<div class="keyboard__complete">完成</div>';
					html += '</div>';
					if ($('.ne-keyboard-layer').length == 0) {
						$('body').append(html);
						$('body').css({ // 控件上不允许选择文本 add 20210323-1
							'-webkit-text-size-adjust': 'none',
							'-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
							'-webkit-touch-callout': 'none', /*禁用系统默认菜单*/
						    '-webkit-user-select': 'none' /*禁止用户选择文本*/
						})
					}

					// pc端时
					if (!isDeviceMobile() || settings.mode == 'computer') {
						$('.ne-keyboard-layer').addClass('pc');
						var _sizeClass = settings.size;
						if (typeof _sizeClass != 'undefined' && _sizeClass != '' && _sizeClass != 'normal') {
							$('.ne-keyboard-layer').addClass(_sizeClass);
						}
						var winH = $(window).outerHeight(true); // 视窗高
						var eleH = $this.outerHeight(true); // 元素高度
						var selfH = 0; // 自身高度
						$('.ne-keyboard-layer>div').each(function () {
							selfH += $(this).outerHeight(true);
						})
						var top = $this.offset().top + eleH + 15,
							left = $this.offset().left,
							width = $this.outerWidth(true);
						// var style = 'position:absolute;top:' + top + 'px;left:' + left + 'px;right:100%;min-width:200px;max-width:640px;width:' + width + 'px;bottom:100%;border:1px solid #ddd;"';

						if (winH - top - selfH <= 0) {
							top = top - selfH - eleH - 25;
							if (top < 0) top = 5;
						}

						var style = 'top:' + top + 'px;left:' + left + 'px;width:' + width + 'px;height:' + selfH + 'px;"';
						$('.ne-keyboard-layer').attr('style', style);
					}


					// edit 20210322-1 这段不要
					// 解决Bug：“ios系统手机（如iphone）若先输入数据（即先弹出内置输入法）再输入数字（即调用本控件）的话，则数字键盘会被遮盖住”的问题
					/* if (/iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())) {
						var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
						window.scrollTo(0, '-' + scrollTop); // 负号表示页面向下滚动
					} */

					// ======如果元素被数字键盘遮盖住 ，则元素向上滚动，摆脱被遮住
					var winH = $(window).height();  // 视窗高度
					var scrollT = $(window).scrollTop(); // 滚动条滚动的距离
					var docH = $(document).height(); // 整个文档的高度，body的高度. 关系：scrollHeight = winH + scrollT
					var selfH = $this.get(0).offsetHeight; // 元素高度
					var topH = $this.offset().top - scrollT; // 元素相对顶部的距离
					var botH = winH - topH - selfH; // 元素相对底部的距离
					var numH = $('.ne-keyboard-layer').get(0).offsetHeight; // 数字键盘高度
					// console.log('视窗高度',winH,'\n滚动条滚动的距离：',scrollT,'\n文档的高度：',docH,'\n当前元素的高度：',selfH,'\n前元素距离顶部的距离：',topH,'\n当前元素距离底部的距离：',botH,'\n数字键盘高度：',numH);

					// edit 20210322-1
					// ·判断输入框是否被数字键盘档柱
					var datum = selfH; // 20; // 加的基数
					var padH = 0; // body padding-bottom值, 默认0
					var scrollH = 0; // 控件调起时滚动条要滚动的距离
					var isNeedRolled = true; // 是否需要滚动, 默认true
					if(botH <= numH){ // 1.被档住了, 即：元素距离底部的距离 < 数字键盘高度
						if(winH + scrollT < docH){ // ①还能向下滚
							var nextH = docH - winH - scrollT; // 能够继续向下滚的距离
							if(nextH + botH < numH){ // 继续向下滚到底部时元素还是被数字键盘遮挡住
								// console.log('aaa');
								padH = numH - (nextH + botH) + datum;
								scrollH = docH - winH + padH;
							}else{ // 继续向下滚到底部时元素没有被数字键盘遮挡住
								// console.log('bbb');
								scrollH = scrollT + (numH - botH) ;
							}
						}else{ // ②滚动到底了
							// console.log('docH：', docH, '\nwinH:', winH, '\nbodyH：', $('body').height())
							// console.log('ddd'); // test1
							padH = numH - botH + datum;
							if($('body').height() < winH){ // 如果内容还没占满一屏
								padH += winH - $('body').height();
							}
							scrollH = scrollT + padH;
						}
					}else{ // 2.没有被挡柱
						isNeedRolled = false;
						scrollH = scrollT + (numH - botH);
					}
					if(padH != 0) $('body').css('paddingBottom', padH); // 强制body有padding
					if(isNeedRolled) $('html, body').animate({scrollTop: scrollH + datum}, 200); // 强制滚动


					event.stopPropagation(); // 阻止冒泡(必须!)
					if (settings.openBack){
						var tag = $this[0].tagName.toLocaleLowerCase();
						settings.openBack({
							element: $this,
							value: tag == 'input' || tag == 'textarea' ? $this.val() : ($this.html($this.html()))
						});
					}
					if (typeof (keyboardUi.showCursor) == 'function' && typeof (keyboardUi.removeCursor) == 'function') {
						keyboardUi.removeCursor($this); // 移除所有假光标 add 20180507-1
						keyboardUi.showCursor($this); // 添加假光标 
					}

					// ======点击数字键盘及当前点击的元素以外的区域时隐藏/删除数字键盘
					$(document).on('click', function (e) {
						if ($(e.target).closest(selector).length != 0) return; // e.target.closest(selector).length==0 说明点击的不是元素selector区域,反之则是
						isInputLegal($this); // 检验输入是否合法 add 20181126
						$('body').removeAttr('style'); // 移除html,body设置的style样式 add 20171220-1
						// $('.ne-keyboard-layer').remove();
						$('.ne-keyboard-layer').slideUp('fast', function () { // edit 20190605 把其它函数移到 slideUp里面
							$(this).remove();
							if (settings.closeBack){
								settings.closeBack({
									element: $this
								});
							}
							if (typeof (keyboardUi.removeCursor) == 'function') keyboardUi.removeCursor($this); // 移除当前节点以外的所有假光标
						})

						// e.stopPropagation(); // 这句不能加，不然会影响其它控件
					})

					// ======数字键事件
					$('.keyboard__edit .num').on('click', function (e) {
						e.preventDefault(); // 防止手机端输入时屏幕移动
						var type = $this[0].tagName.toLocaleLowerCase(); // 绑定元素的类型（即标签名称):input span div select 
						// console.log('点击数字键，当前点击的元素类型为：',type);
						var innerHtml = this.innerHTML;
						var value = $this.val() + innerHtml,
							html = $this.html() + innerHtml;
						// test1
						// if($(this).hasClass('keyboard__minus')){ // 负号
						// 	value = value.toString().replace(//g, '-');
						// }
						if (type == 'input' || type == 'textarea') { // input textarea时
							// var value = $this.val();
							// value += this.innerHTML;
							// $this.val(value);
							$this.val(value);
						} else { // div,span等时
							// var html = $this.html();
							// html += this.innerHTML;
							// $this.html(html);
							$this.html(html);
						}
						if (typeof (keyboardUi.removeCursor) == 'function') keyboardUi.removeCursor($this); // 移除当前节点以外的所有假光标
						if (settings.numericBack){
							settings.numericBack({
								element: $this,
								value: type == 'input' || type == 'textarea' ? value : html,
								key: this // 当前点了哪个键
							});
						}
						e.stopPropagation(); // 阻止冒泡(让点击数字键盘以外的区域隐藏/删除数字键盘事件不生效)
					});

					// ======删除事件、退格事件
					$('.keyboard__backspace').on('click', function (e) {
						e.preventDefault(); // 防止手机端输入时屏幕移动
						var type = $this[0].tagName.toLocaleLowerCase(); // 绑定元素的类型（即标签名称):input span div select 
						// console.log('点击删除键，当前点击的元素类型为：',type);
						var oDivValue = $this.val(),
							oDivHtml = $this.html();
						var value = oDivValue.substring(0, oDivValue.length - 1),
							html = oDivHtml.substring(0, oDivHtml.length - 1);
						if (type == 'input' || type == 'textarea') { // input textarea时
							$this.val(value);
						} 
						else { // div,span等时
							$this.html(html);
						}
						if (typeof (keyboardUi.removeCursor) == 'function') keyboardUi.removeCursor($this); // 移除当前节点以外的所有假光标
						if (settings.spaceBack){
							settings.spaceBack({
								element: $this,
								value: type == 'input' || type == 'textarea' ? value : html,
								key: this, // 当前点了哪个键
							});
						}
						e.stopPropagation();

					});



					// ======点号等其它填空事件
					$('.keyboard__fill').on('click', function (e) {
						e.preventDefault(); // 防止手机端输入时屏幕移动
						e.stopPropagation();
					});


					// ======完成输入事件
					$('.keyboard__complete').on('click', function (e) {
						$('body').removeAttr('style'); // 移除html,body设置的style样式add 20171220-1
						// $('.ne-keyboard-layer').remove();
						$('.ne-keyboard-layer').slideUp('fast', function () { // edit 20190605 把其它函数移到 slideUp里面
							$(this).remove();
							if (settings.closeBack) settings.closeBack(); // 关闭数字键盘时的回调函数
							/*
							if(settings.minimum!=null || settings.maximum!=null){ // 检查输入值是否合法
								var value = parseFloat(keyboardUi.getEleValue($this));
								if(value<settings.minimum || value > settings.maximum){
									keyboardUi.alert(settings.minimum,settings.maximum); 
								}
								$(document).on('click','#confirm_alert',function(){
									if(value<settings.minimum) keyboardUi.giveEleValue($this,settings.minimum);
									if(value>settings.maximum) keyboardUi.giveEleValue($this,settings.maximum);
									$(this).parent().remove();
									$('.keyboard_mask').remove();
								})
							}
							*/
							isInputLegal($this); // 检验输入是否合法 edit 20181126
							if (typeof (keyboardUi.removeCursor) == 'function') keyboardUi.removeCursor($this); // 移除当前节点以外的所有假光标	 
						})

						e.stopPropagation();

					});


				}) // end this.on('click')




				/**
				* 检测是否手机端/移动设备
				* 若是，则返回true
				*/
				function isDeviceMobile() {
					var userAgentInfo = navigator.userAgent.toLowerCase();
					// console.log(userAgentInfo);
					var Agents = ["mobile", "android", "iphone", "sysbian", "windows phone", "iPad", "ipod", "blackberry"];
					var flag = false;
					for (var i = 0; i < Agents.length; i++) {
						if (userAgentInfo.indexOf(Agents[i]) >= 0) {
							flag = true;
							break;
						}
					}
					return flag;
				}

				/**
				*检查输入值是否合法(介于最大值与最小值之间)
				*@param inputObject 当前输入框对象
				* add 20181126
				*/
				function isInputLegal(inputObject) {
					if (settings.minimum != null || settings.maximum != null) {
						var value = parseFloat(keyboardUi.getEleValue(inputObject));
						var smaller = 'data-smaller',
							larger = 'data-larger';
						if (Array.isArray(settings.minimum)) {
							for (var i = 0; i < settings.minimum.length; i++) {
								var id = settings.minimum[i].id.replace('#', '').replace('.', '');
								if (inputObject[0].id == id || inputObject[0].className == id) {
									if (value < settings.minimum[i].value) {
										inputObject.attr(smaller, settings.minimum[i].value);
										var end = '';
										if (Array.isArray(settings.maximum)) {
											if (settings.maximum[i].id.replace('#', '').replace('.', '') == id)
												end = settings.maximum[i].value;
										}
										keyboardUi.alert(settings.minimum[i].value, end);
									}
								}

							}
						} else {
							if (value < settings.minimum) keyboardUi.alert(settings.minimum, '');
						}
						if (Array.isArray(settings.maximum)) {
							for (var i = 0; i < settings.maximum.length; i++) {
								var id = settings.maximum[i].id.replace('#', '').replace('.', '');
								if (inputObject[0].id == id || inputObject[0].className == id) {
									if (value > settings.maximum[i].value) {
										inputObject.attr(larger, settings.maximum[i].value);
										var start = '';
										if (Array.isArray(settings.minimum)) {
											if (settings.minimum[i].id.replace('#', '').replace('.', '') == id)
												start = settings.minimum[i].value;
										}
										keyboardUi.alert(start, settings.maximum[i].value);
									}
								}
							}
						} else {
							if (value > settings.maximum) keyboardUi.alert('', settings.maximum);
						}

						$(document).on('click', '#confirm_alert', function () { // 关闭确认窗口时
							if (Array.isArray(settings.minimum)) {
								var s_value = typeof (inputObject.attr(smaller)) == 'undefined' ? '' : inputObject.attr(smaller);
								if (s_value != '') keyboardUi.giveEleValue(inputObject, s_value);
							} else {
								if (value < settings.minimum) keyboardUi.giveEleValue(inputObject, settings.minimum);
							}

							if (Array.isArray(settings.maximum)) {
								var l_value = typeof (inputObject.attr(larger)) == 'undefined' ? '' : inputObject.attr(larger);
								if (l_value != '') keyboardUi.giveEleValue(inputObject, l_value);
							} else {
								if (value > settings.maximum) keyboardUi.giveEleValue(inputObject, settings.maximum);
							}

							$(this).parent().remove();
							$('.keyboard_mask').remove();
						})
					}

				} // END OF FUNCTION isInputLegal


			}) // end $this.each
		}
	});


})(jQuery);




/*+--------------------------------------------------------------------------------------------+*/
/* keyboardVisualLength()函数
* Jquery获取文本长度（单位:px) add 2018.4.17  20190605-1
* 思路：直接在String的原型中添加获取文字宽度的函数
* 主要思路是添加一个隐藏的标签(eleLenRuler)，每次对该标签赋值后，通过获取该标签的长度来获取文字宽度。需要注意的是，只有已经被添加到DOM中的标签才能获取长度。
* @param fontStr 字体大小. eg1.14px, eg2.16px 
* eg1. var len = $('#input').val().keyboardVisualLength();
* eg2. var len = $('#input').val().keyboardVisualLength('18px');
*/
String.prototype.keyboardVisualLength = function (fontStr) {
	// 根据屏幕分辨率判断当前网页字体大小 add 20180509-1
	var w = $(window).width();
	var size = '16px';
	if (typeof (fontStr) != 'undefined') {
		size = fontStr;
	} else {
		if (w <= 360 && w >= 320) size = '12px';
		if (w > 360 && w < 400) size = '14px';
		if (w >= 400) size = '14.93333px';
		if (w >= 414) size = '14.70px';
		if (w >= 480) size = '17.92px';
	}

	var node = '#eleLenRuler';
	var _str = '<span id="' + node.replace('#', '').replace('.', '') + '" style="visibility: hidden;white-space:nowrap;font-size:' + size + '"></span>'; // font-size大小也会影响文字宽度(一般网页默认字体大小为16px) edit 20180509-1
	if ($(node).length == 0) $('body').append(_str);
	$(node).text(this);
	return $(node)[0].offsetWidth;
}




/*+--------------------------------------------------------------------------------------------+*/
/***************
*keyboardUi对象
****************/
var keyboardUi = {

	/**
	* 添加假光标 
	* edit 20210323-1
	*/
	showCursor: function (obj) {
		/*
		var value = pickUp.getEleValue(obj);
		var _width = 25 + (value.length * 16); // 文字宽度(大概值)
		*/
		// 输入框
		var _fatBot = 0; // 父元素padding-bottom
		var _fatLef = 0; // 相对父元素左侧距离
		var _fontsize = 12; // 字体大小
		var _height = 0; // 自身高度
		var _margL = 0; // margin-left
		var _padL = 0; // padding-left
		var _textW = 0; // 文本宽度
		
		var _width = 0; // 假光标LEFT值
		var _radixNumc = /iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase()) ? this.getEleValue(obj).length - 1 : 0;

		if ($(obj).length > 0) {
			var textAlign = typeof $(obj).css('text-align') == 'undefined' ? 'left' :$(obj).css('text-align');
			var boxWidth = obj[0].offsetWidth; // 输入框宽
			// console.log('输入框宽：', boxWidth);
			_fatBot = typeof ($(obj).parent().css('paddingBottom')) == 'undefined' ? 0 : parseFloat($(obj).parent().css('paddingBottom').replace(/(px|%)/g, ''));
			_fatLef = $(obj).position().left; // 相对父元素左侧距离
			// _fatLef = $(obj).offset().left; // 相对body左侧距离
			_fontsize = typeof ($(obj).css('font-size')) == 'undefined' ? '14px' : $(obj).css('font-size'); // eg.18px
			_height = obj[0].offsetHeight;
			_margL = typeof $(obj).css('marginLeft') == 'undefined' ? 0 : parseFloat($(obj).css('marginLeft').replace(/(px|%)/g, ''));
			_padL = typeof $(obj).css('paddingLeft') == 'undefined' ? 0 : parseFloat($(obj).css('paddingLeft').replace(/(px|%)/g, ''));
			_textW = keyboardUi.getEleValue(obj).keyboardVisualLength(_fontsize); // 通过字体大小测量文本宽
			_width = _fatLef + _margL + _padL + _textW + _radixNumc;
			if(textAlign == 'center'){ // 当文本居中显示时
				_width += Math.floor(( boxWidth - _textW) / 2 - _padL);
			}
			// console.log('fatherLeft：',_fatLef,  '\nmargin-left',_margL, '\npadding-left：',_padL, '\n_text_width：',_textW, '\n_radixNumc:',_radixNumc, '\n_width：', _width); // test1
			//  console.log('_fontsize：', _fontsize);
			//  console.log('----------------------')
		}
		// 假光标
		var _curH = _fontsize; // 高度
		var _curBot = parseFloat(_fatBot) + ((parseFloat(_height) - parseFloat(_curH)) / 2); // 垂直居中
		var _bottomStr = ' bottom:' + _curBot + 'px!important;transform:translateY(0%)';
		if (obj.siblings('.icon-cursor').length == 0) obj.after('<i class="icon-cursor" style="left:' + _width + 'px;height:' + _curH + '!important;' + _bottomStr + '"></i>');
		obj.parent().css('postion', 'relative'); // 父级元素相对定位
	},


	/**
	* 移除假光标
	*/
	removeCursor: function (obj) {
		// 点当前元素以外的区域时,删除假光标
		$('body').on('click', function (e) {
			if ($(e.target).closest(obj).length != 0) return; // e.target.closest(selector).length==0 说明点击的不是元素selector区域,反之则是
			obj.parents().find('.icon-cursor').remove();
		})
		obj.parents().find('.icon-cursor').remove(); // 移除当前以外的所有假光标
		if ($('.ne-keyboard-layer').length > 0) keyboardUi.showCursor(obj); // edit 20190605
	},


	/*
	* 获取元素的值
	* @param {object} obj 元素id或class   eg.obj='#locate'
	* 元素类型可能是 input|textarea|span|div 
		input、textarea取值 $(obj).val(); 
		div、span取值 $(obj).text()或$(obj).html()
	*/
	getEleValue: function (obj) {
		if ($(obj).length > 0) {
			var value = '';
			var result = $(obj)[0].tagName.toLocaleLowerCase();
			if (result == 'input' || result == 'textarea') value = $(obj).val();
			else value = $(obj).html();
			return value;
		}
	},


	/*
	* 函数：给元素赋值
	* @param obj 元素id或class   eg.obj='#locate'
	* @param value 要赋的值
	* 元素类型可能是 input|textarea|span|div 
	* input、textarea取值 $(obj).val();
		div、span取值 $(obj).text()或$(obj).html()
	*/
	giveEleValue: function (obj, value) {
		if ($(obj).length > 0) {
			var result = $(obj)[0].tagName.toLocaleLowerCase();
			if (result == 'input' || result == 'textarea') $(obj).val(value);
			else $(obj).html(value);
		}
	},



	/*
	*函数：数字键盘弹出框
	*/
	alert: function (minimum, maximum) {
		var node = '.keyboard__alert';
		var txt = '值只能介于：' + minimum + ' - ' + maximum;
		if (maximum == '') txt = '请输入大于等于' + minimum + '的数！';
		if (minimum == '') txt = '请输入小于等于' + maximum + '的数！';
		var _html = '<div class="' + node.replace('.', '').replace('#', '') + '">' +
			'	<div class="t">提示</div>' +
			'	<div class="c">' + txt + '</div>' +
			'	<div class="f" id="confirm_alert">确定</div>' +
			'</div>';
		if ($(node).length == 0) $('body').append(_html);
		keyboardUi.mask();
	},


	/*
	*函数：数字键盘遮罩
	*/
	mask: function () {
		var node = '.keyboard_mask';
		var _html = '<div class="' + node.replace('.', '').replace('#', '') + '"></div>';
		if ($(node).length == 0) $('body').append(_html);
	}

}; // END keyboardUi


