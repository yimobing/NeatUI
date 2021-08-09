/**
* [neuiDialog]
* 对话框插件
* Author: ChenMufeng
* Date: 2018.8.30
* Update:2021.08.09
*/
//(function($){
//	$.fn.extend({

	/**-----------------
	 * 内容提示窗
	------------------*/
	var neuiDialog = {
		notice:function(options){
			var self = this;
			var defaults = {
				message: '内容提示窗', //提示信息
				delay: 2000, //关闭窗口延时时间(可选),默认2秒,单位：毫秒

				nodeID:'', //自定义弹出窗口根节点ID(可选),默认空
				mask:'#' + self.generateMaskNode() + '-' + self.generateRandChar(), //遮罩节点
				animate: false, //是否启用转圈(可选),默认false
				loadTxt: '', //转圈文字(可选),默认空
				loadDelay: 100, //转圈延迟时间(animate=true时有效)(可选).默认100,单位：毫秒
				zIndex: '', //自定义窗口层级(可选), 默认空(系统会自动分配层级)
				width: 'auto', //自定义宽度(可选). 默认auto. 其它值eg. 30, 30px
				height: 'auto', //自定义高度(可选). 默认auto. 其它值eg. 30, 30px
				fontSize: '14px', //文字大小(可选). 默认14px. 其它值eg. 12, 12px
				shadow: false, //是否有阴影及边框, 仅当 showMask=false时有效(可选). 默认true
				showMask: true, //是否启用遮罩(可选), 默认true。 true值只有当属性location='center'时起作用
				maskOpacity: 65, //遮罩透明度(可选), 默认85. 若该值大于1, 则将该值除以100即得到真正的透明度: eg. 100 即透明度1, 80 即透明度0.80, 1 即透明度0.01, 0.5 即透明度0.5
				location: 'center', //位置(可选). 值：center 水平垂直居中(默认), top 顶部, bottom 底部。当值为top、bottom时(一般移动端才如此设置),窗口会沾满屏幕
				theme: 'default', //主题(可选). 值： default 默认, primary 首选(深蓝色), black 黑色, success 成功(绿色), info 信息(浅蓝色), warn 警告(橙色), danger 错误(红色)
				backColor: '', //自定义背景色(可选). 默认空. 值不为空时优先权高于参数theme
				foreColor: '', //自定义前景色(文字颜色)(可选). 默认空. 值不为空时优先权高于参数theme
				callBack: function(){} //回调(可选)
			}
			var settings = $.extend({}, defaults, options);
			var nodeID = settings.nodeID,
				message = settings.message == '' ? '内容提示窗' : settings.message,
				shade = settings.mask,
				animate = settings.animate ? true : false,
				loadTxt = settings.loadTxt,
				loadDelay = settings.loadDelay == '' ? 100 : settings.loadDelay,
				maskOpacity = settings.maskOpacity == '' ? '' : isNaN(parseInt(settings.maskOpacity)) ? '' : settings.maskOpacity, 
				delay = settings.delay,
				zIndex = settings.zIndex == '' ? '' : (parseInt(settings.zIndex) < 111 ? 111 : parseInt(settings.zIndex)),
				width = settings.width == '' ? 'auto' : (settings.width.toString().replace(/px/g, '')),
				height = settings.height == '' ? 'auto' : (settings.height.toString().replace(/px/g, '')),
				shadow = settings.shadow == false ? false : true, //默认true
				showMask = settings.showMask == false ? false : true, //默认true	
				location = settings.location == '' ? 'center' : settings.location,
				theme = settings.theme == '' ? 'default' : settings.theme,
				backColor = settings.backColor == '' ? '' : settings.backColor,
				foreColor = settings.foreColor == '' ? '' : settings.foreColor;
			if(location != 'center') showMask = false;
			//
			var weuiParent = '.ne-dialog-notice',
				IdClass = weuiParent.replace(/[\#\.]/g,''),
				eleId = '#' + IdClass + '_' + self.generateRandChar();
			var parentId = nodeID == '' ? eleId : nodeID;
			var nodeStr = ' id="' + parentId.replace(/[\#\.]/g,'') + '"';

			var widthClass = width == 'auto' ? '' : ' has-width';
			var heightClass = height == 'auto' ? '' : ' has-height';
			var shadowClass = showMask ? '' : (shadow ? ' has-shadow' : '');
			var themeClass = theme == 'default' ? '' : ' ' + theme;

			var _widthStr = width == 'auto' ? '' : 'width:' + width + 'px;';
			var _heightStr = height == 'auto' ? '' : 'height:' + height + 'px; line-height:' + height + 'px;';
			var _backColorStr = backColor == '' ? '' : 'background-color:' + backColor + ';';
			var _foreColorStr = foreColor == '' ? '' : 'color:' + foreColor + ';';
			var _layStyle = ' style="' + _widthStr + _heightStr + _backColorStr + _foreColorStr + '"';

			var level = zIndex < 999 ? '' : 'z-index:' + (zIndex + 1) + ';'; //默认窗口层级999
			var locateClass = ' ' + location;
			var _noticeStyle = level == '' ? '' : ' style="' + level + '"';

			var _html = '<div class="' + IdClass + locateClass + '"' + nodeStr + ' data-maskId="' + shade + '"' + _noticeStyle + '>'+
							'<div class="help-layout' + widthClass + heightClass + shadowClass + themeClass + '"' + _layStyle + '>'+
								'<div>' + message + '</div>'+
							'</div>'+
						'</div>';
			
			if(animate){
				self.showAnimate(loadTxt);
				setTimeout(function(){
					openNotice();
					self.destroyAnimate(); //销毁转圈
				}, loadDelay)
			}else{
				openNotice();
			}

			setTimeout(function(){
				closeNotice(eleId);
			}, delay)

			//打开
			function openNotice(){
				$('body').append(_html);
				if(showMask) self.openMask(shade, zIndex, maskOpacity); //打开遮罩
			}

			//关闭
			function closeNotice(obj){
				var mask_id = $(obj).attr('data-maskId');
				if(mask_id.replace(/[\#\.]/g,'')!='') $(mask_id).remove();
				else $(obj).next(shade).remove();
				$(obj).remove();

				//edit 20210305-1
				/* $('html,body').removeAttr('style'); //解除禁止滚动(pc端)
				if(self.checkIsMobile()){
					$('html,body').off('touchmove,touchstart'); //解除禁止滚动(手机端)1//$(window).off('touchmove,touchstart');
					window.removeEventListener('touchmove', self.winScroll, {passive:false}); 	//解除禁止滚动(手机端)2(解除window绑定的touchmove事件)
				} */
				self.letWinRoll();
				
				if(settings.callBack){
					settings.callBack();
				}
			}
		},



		/**-----------------
		* 弹出窗
		------------------*/
		alert:function(options){
			var self = this;
			var defaults = {
				//后台自用参数
				mask:'#' + self.generateMaskNode() + '-' + self.generateRandChar(), //遮罩节点
				//前台可用参数
				nodeID:'', //自定义弹出窗口根节点ID(可选),默认空
				animate:false, //是否开启转圈特效.是|true,否|false,默认true
				loadTxt:'', //转圈文字(animate=true时有效).默认空
				loadDelay:100, //转圈延迟时间(animate=true时有效).默认100（单位：毫秒）
				popup:true, //是否允许弹出窗口. 是|true,否|false,默认true
				bubbleRet:1, //popup=false时,指定默认执行第几个按钮事件(默认值1). eg. popup=false,bubbleRet=2,表示不弹出窗口,但默认执行第2个按钮里的事件
				caption:'', //标题.默认空。"提示"
				message:'欢迎使用对话框插件！', //提示信息.默认"欢迎使用对话框插件！"
				buttons:['确定','取消'], //按钮名称.默认['确定','取消']
				theme:'', //插件主题(可选). 蓝色|blue,黑色|black,绿色|green,红色|red,橙色|orange,紫色|purple.默认空''
				btnColor:['','black'], //按钮颜色.蓝色|blue,黑色|black,绿色|green,红色|red,橙色|orange,紫色|purple.默认绿色
				btnFont:{size:'',bold:false}, //按钮字体. size|文字大小(默认16号), bold|文字是否加粗(默认false)
				btnDirection:'horizontal', //按钮方向	.水平|horizontal,垂直|vertical,默认水平.
				zIndex:'', //窗口层级(可选)(新版用), 默认空(系统会自动添加层级).
				maskZindex:'', //窗口层级(可选)(兼容旧版), 默认空(系统会自动添加层级)
				maskOpacity: '', //遮罩透明度(可选), 默认85. 若该值大于1, 则将该值除以100即得到真正的透明度: eg. 100 即透明度1, 80 即透明度0.80, 1 即透明度0.01, 0.5 即透明度0.5
				showCross:false, //是否显示右上角打叉图标(关闭按钮). 显示|true,不显示|false,默认不显示
				closeWindow:true, //是否一点击按钮就关闭窗口,默认true
				closeAll:false, //是否关闭所有弹出窗口。true 是， false 否（默认）。当短时间内弹出多个窗口时，点击按钮是否一键关闭所有窗口。该参数特别有用，特别是在on('input',function(){})事件里就可能出现多个窗口。
				callBack:null //回调函数(可选)
				
			}
			var settings = $.extend({},defaults,options);
			
			//...初始定义
			var shade = settings.mask,
					nodeID = settings.nodeID,
					animate = settings.animate,
					loadTxt = settings.loadTxt,
					loadDelay = settings.loadDelay,
					popup = settings.popup,
					bubbleRet = settings.bubbleRet>settings.buttons.length ? 1 : settings.bubbleRet,
					caption = settings.caption,
					message = typeof settings.message == 'undefined' || settings.message == '欢迎使用对话框插件！' ? '' : settings.message,
					theme = settings.theme,
					buttons = settings.buttons,
					btnColor = settings.btnColor,
					btnSize = settings.btnFont.size,
					btnBold = settings.btnFont.bold,
					btnDirection = settings.btnDirection,
					zIndex1 = settings.maskZindex == '' ? '' : (parseInt(settings.maskZindex) < 111 ? 111 : parseInt(settings.maskZindex)),
					zIndex2 = settings.zIndex == '' ? '' : (parseInt(settings.zIndex) < 111 ? 111 : parseInt(settings.zIndex)),
					maskOpacity = settings.maskOpacity == '' ? '' : isNaN(parseInt(settings.maskOpacity)) ? '' : settings.maskOpacity,
					showCross = settings.showCross;
			var zIndex = zIndex2 == '' ? zIndex1 : zIndex2;
			
			//...插件根节点及Class、ID
			var weuiParent = '.ne-dialog-alert',
					IdClass = weuiParent.replace(/[\#\.]/g,''),
					eleId = '#' + IdClass + '_' + self.generateRandChar();
			var parentId = nodeID == '' ? eleId : nodeID;
			var nodeStr = ' id="' + parentId.replace(/[\#\.]/g,'') + '"';
			//...HTML
			var themeClass = theme=='' ? '' : ' theme '+theme,			
				btnClass = btnDirection=='vertical' ? ' vertical' : '',
				crossStyle = showCross==true ? '' : ' style="display:none"';
			var level = zIndex < 999 ? '' : 'z-index:' + (zIndex + 1) + ';'; //默认窗口层级999
			var _alertStyle = level == '' ? '' : ' style="' + level + '"';
			var _contentClassName = caption.toString().replace(/([ ]+)/g, '') === '' ? ' no-caption' : '';
			var _captionClassName = message.toString().replace(/([ ]+)/g, '') === '' ? ' no-content' : '';
			var _alertContentStr = message == '' ? '' : '<div class="alert-content' + _contentClassName + '">'+message+'</div><!--/alert-content-->';
			var _html = '<div class="' + IdClass + '"' + nodeStr + ' data-maskId="' + shade + '"' + _alertStyle + '>'+
						'	<div class="alert-layout'+themeClass+'">'+
								'<div class="alert-close ne-dialog-close"'+crossStyle+'></div>'+
								( caption.toString().replace(/([ ]+)/g, '') === '' ? '' : '<div class="alert-caption' + _captionClassName + '">'+caption+'</div><!--/alert-caption-->' ) +
								_alertContentStr+
								'<div class="alert-button-group'+btnClass+'">';
							for(var i=0;i<buttons.length;i++){
								var colorClass = btnColor[i]=='' || typeof(btnColor[i])=='undefined' ? '' : ' '+btnColor[i],
										sizeStyle = btnSize=='' || typeof(btnSize)=='undefined' ? '' : 'font-size:'+btnSize+'px;',
										boldStyle = btnBold!=true || typeof(btnBold)=='undefined' ? '' :　' font-weight:bold;';
								
								var widthStyle = btnClass=='' ? ( self.ieversion() <= 8 ? ' width:'+ 100/buttons.length + '%'+';' : '') : '';
								var style = (sizeStyle=='' && boldStyle=='' && self.ieversion() > 8) ? '' :  ' style="'+sizeStyle+boldStyle+widthStyle+'"';
								_html+='<button type="button" class="alert-btn alert-btn-'+i+colorClass+'"'+style+'>'+buttons[i]+'</button>';
							}
							_html+='	</div><!--/alert-button-group-->'+
									'	</div>'+
									'</div>';
			
			//...创建插件
			if(popup){ //...允许弹窗
				if(animate){ //有转圈
					self.showAnimate(loadTxt); //显示转圈
					setTimeout(function(){
						openAlert(zIndex, maskOpacity);
						self.destroyAnimate(); //销毁转圈
					},loadDelay)
				}else{
					openAlert(zIndex, maskOpacity);
				} //IF(animate)
			}else{ //...不许弹窗
				if(animate){ //有转圈
					self.showAnimate(loadTxt); //显示转圈
					setTimeout(function(){
						var ret = bubbleRet; //默认执行哪个按钮里的事件
						if(settings.callBack) settings.callBack(ret);
						self.destroyAnimate(); //销毁转圈
					},loadDelay)
				}else{
					var ret = bubbleRet; //默认执行哪个按钮里的事件
					if(settings.callBack) settings.callBack(ret);
				}
			} //IF(popup)
			
			
			//...按钮点击事件
			$(document).off('click', parentId + ' .alert-button-group>.alert-btn').on('click', parentId + ' .alert-button-group>.alert-btn',function(){
				var $this = $(this);
				var ret = $(this).index()+1;
				if(settings.callBack){
					settings.callBack(ret);
				}
				if(settings.closeWindow) closeAlert($this);	
				if(settings.closeAll){
					$(weuiParent).remove();
					$('.ne-dialog-mask').remove();
				}
			})
				
			//...关闭按钮事件
			$(document).off('click', parentId + ' .alert-close').on('click', parentId + ' .alert-close',function(){
				closeAlert($(this));
			});
			
			
			/*函数：打开对话框*/
			function openAlert(ps_mask_zindex, ps_mask_opacity){
				$('body').append(_html); //创建HTML
				self.openMask(shade, ps_mask_zindex, ps_mask_opacity); //打开遮罩
				
			}
			
			/*函数：关闭对话框 @param obj 当前点击的对象*/
			function closeAlert(obj){
				var mask_id = $(obj).parents(weuiParent).attr('data-maskId');
				if(mask_id.replace(/[\#\.]/g,'')!='') $(mask_id).remove();
				else $(obj).parents(weuiParent).next(shade).remove();
				$(obj).parents(weuiParent).remove();
				
				//edit 20210305-1
				// $('html,body').removeAttr('style'); //解除禁止滚动(pc端)
				// if(self.checkIsMobile()){
				// 	$('html,body').off('touchmove,touchstart'); //解除禁止滚动(手机端)1//$(window).off('touchmove,touchstart');
				// 	window.removeEventListener('touchmove', self.winScroll, {passive:false}); 	//解除禁止滚动(手机端)2(解除window绑定的touchmove事件)
				// }
				self.letWinRoll();
			}
			
		}, //END function alert();
		
		
		
		
		/**-----------------
		* 输入框
		-------------------*/
		feedback:function(options){
			var self = this;
			//...插件根节点及Class、ID
			var weuiParent = '.ne-dialog-feedback',
				IdClass = weuiParent.replace(/[\#\.]/g,'');
			var parentId = '#' + IdClass + '_' + self.generateRandChar();
			//...默认参数
			var defaults = {
				//后台自用参数
				mask: '#' + self.generateMaskNode() + '-' + self.generateRandChar(), //遮罩节点
				//前台可用参数
				animate: true, //是否显示转圈.默认true
				loadTxt: '', //转圈文字(animate=true时有效).默认空
				loadDelay: 100, //转圈延迟时间(animate=true时有效).默认100（单位：秒）
				zIndex: '', //自定义窗口层级(可选), 默认空(系统会自己添加层级)
				maskOpacity: '', //遮罩透明度(可选), 默认85. 若该值大于1, 则将该值除以100即得到真正的透明度: eg. 100 即透明度1, 80 即透明度0.80, 1 即透明度0.01, 0.5 即透明度0.5
				popup: true, //是否允许弹出窗口. 是|true,否|false,默认true
				bubbleRet: 1, //popup=false时,指定默认执行第几个按钮事件(默认值1). eg. popup=false,bubbleRet=2,表示不弹出窗口,但默认执行第2个按钮里的事件
				caption: '', //左侧标题.默认空
				textAlign: 'left', //左侧标题文字水平位置(可选), left 居左(默认), center 居中, right 居右
				fontWeight: 'normal', //左侧标题是否加粗(可选). normal 不加粗(默认), bold 加粗
				fontSize: '18px', //左侧标题字体大小(可选), 默认18px
				value: '', //输入框初始化值,默认空
				tips: '', //输入框提示文字,默认空
				notes: '', //输入框右侧内容,默认空
				type: 'input', //输入框类型.input|单行文本,textarea|多行文本,默认input
				buttons: ['确定'], //按钮(数组类型),默认['确定']
				btnDirection: 'horizontal', //按钮方向(可选).水平|horizontal,垂直|vertical,默认水平.
				btnBgColor: [''], //按钮背景颜色(可选).蓝色|blue,黑色|black, 灰色|gray,绿色|green,红色|red,橙色|orange,紫色|purple.默认绿色
				btnWidth: '', //按钮大小(默认80px左右). 值：100% 按钮宽度100%, 100px 按钮宽度100px, 其它值...
				btnAlign: '', //按钮水平位置(默认居右). left 居左, center 居中, right 居右
				keyboard: false, //是否启用数字键盘,默认false
				numcNode: null, //当参数html不等于空时,自定义要调用"数字键盘控件"的节点（值为数组形式 eg.['#ID1','#ID2']）,默认null.
				html: '', //自定义输入框内容（自定义HTML）.默认空,插件调用默认html来填充;非空时将使用自定义的html来填充，此时caption/content/tips/notes/type参数将自动失效.
				conMargin: '15px auto', //中间内容margin值 (可选),默认15px auto
				conPadding: '', //中间内容padding (可选),默认空
				minWidth: -1, //窗口最小宽度(必须为正整数)(可选)
				maxWidth: -1, //窗口最大宽度(必须为正整数)(可选)
				fullScreen: false, //是否启用全屏(可选). 默认false add 20210327-1
				showButton: true, //是否显示按钮,默认true
				showCross: true, //是否显示右上角打叉图标(关闭按钮). 显示|true,不显示|false,默认显示
				// add 20210709-1 下2行
				showBack: false, //是否显示左上角返回图标(可选)，默认false。
				backText: '返回', //左上角显示返回图标时的文字(可选)，默认‘返回'。

				closeWindow: false, //是否禁用按钮(是否一点击按钮就关闭窗口,默认true)
				openBack: null, //窗口加载完成后的回调函数
				callBack: null, //点按钮后的回调函数(可选)
				closeFeed: function(){ //关闭窗口, 供callBack等函数调用,用来关闭窗口(可选)
					closeFeedback($(parentId));
				}
			}
			var settings = $.extend({},defaults,options);
			
			//...初始定义
			var shade = settings.mask,
				animate = settings.animate,
				loadTxt = settings.loadTxt,
				loadDelay = settings.loadDelay,
				zIndex = settings.zIndex == '' ? '' : (parseInt(settings.zIndex) < 111 ? 111 : parseInt(settings.zIndex)),
				maskOpacity = settings.maskOpacity == '' ? '' : isNaN(parseInt(settings.maskOpacity)) ? '' : settings.maskOpacity,
				popup = settings.popup,
				caption = settings.caption,
				textAlign = settings.textAlign == '' ? '' : ' ' + settings.textAlign,
				fontWeight = settings.fontWeight == 'bold' ? ' bold' : '',
				fontSize = settings.fontSize == '' ? '' : settings.fontSize.toString().replace(/px/g, '') + 'px',
				value = settings.value,
				tips = settings.tips,
				notes = settings.notes
				type = settings.type,
				buttons = settings.buttons,
				btnDirection = settings.btnDirection,
				btnBgColor = settings.btnBgColor,
				btnWidth = settings.btnWidth,
				btnAlign = settings.btnAlign,
				keyboard = settings.keyboard,
				numcNode = settings.numcNode,
				html = settings.html,
				conMargin = settings.conMargin,
				conPadding = settings.conPadding,
				minWidth = settings.minWidth,
				maxWidth = settings.maxWidth,
				showCross = settings.showCross,
				// add 20210709-1 下2行
				showBack = settings.showBack,
				backText = settings.backText,

				showButton = settings.showButton;

			//...HTML
			var _tips = _content = _notes = '';

			// add and edit 20210709-1 下2行
			var crossStyle = showCross == true ? '' : ' style="display:none"',
				backStyle = showBack == true ? '' : ' style="display:none"';

			var _btnAStr = btnAlign == '' ? '' : ' ' + btnAlign;
			var btnClass = btnDirection == 'vertical' ? ' vertical' : '';
			var _widhStr = btnWidth == '' ? 
				(self.ieversion() <= 11 ? (btnClass == '' ? ' width:'+ (100/buttons.length - 2.5) + '%'+';' : '') : '') 
				: 
				' width:' + btnWidth + ';'
				;
			var btnStyle = ' style="' + _widhStr + '"';
			if(html){
				_content = html;
			}else{
				if(tips!='') _tips = ' placeholder="'+tips+'" onfocus="this.placeholder=\'\'" onblur="this.placeholder=\''+tips+'\'"';
				if(type=='input') _content = '<input type="text" class="feedback-input numeric-txt" value="'+value+'"'+_tips+'>';
				if(type=='textarea') _content = '<textarea class="feedback-textarea numeric-txt"'+_tips+'>'+value+'</textarea>';
				_notes = notes =='' ? '' : '<span class="feedback-notes">'+notes+'</span>';
			}

			//按钮
			var _btnHtml = '';
			if(showButton){
				var _btnHtml = '<div class="feedback-button-group' + _btnAStr + btnClass + '">';
						for(var i = 0; i < buttons.length; i++){
							if(self.isArray(btnWidth)){
								if(btnWidth.length == buttons.length){
									_widhStr = ' width:' + btnWidth[i].toString();
									btnStyle = ' style="' + _widhStr + '"';
								}
							}
							var colorClass = btnBgColor[i] == '' || typeof(btnBgColor[i]) == 'undefined' ? '' : ' ' + btnBgColor[i];
							_btnHtml+='	<button type="button" class="feedback-btn feedback-btn-' + i + colorClass + '"' + btnStyle + '>' + buttons[i] + '</button>';
						}
						_btnHtml+='</div>';
			}

			//标题 add and edit 20210709-1 下3行
			textAlign = !showBack ? textAlign : (caption.toString().replace(/([ ]+)/g, '') !== '' ? ' center' : textAlign); // 有返回图标时强制标题居中
			var _capClass = textAlign + fontWeight;
			_capClass += !showBack ? '' : (backText.toString().replace(/([ ]+)/g, '') === '' ? ' has-back-noText' : ' has-back-hasText');
			var _capStyle = fontSize == '' ? '' : ' style="font-size:' + fontSize + '"';

			//内容
			var _cmarginStr = '', _cpaddingStr = '';
			if(conMargin!='') _cmarginStr = 'margin:' + conMargin + ';';
			if(conPadding!='') _cpaddingStr = 'padding:' + conPadding + ';';
			var _contentStyle = ' style="' + _cmarginStr + _cpaddingStr + '"';
			//窗口
			var _minWidthStr = _maxWidthStr = '';
			var regNumc = /^\d+$/; //正则验证数字
			if(minWidth!='' && regNumc.test(minWidth)) _minWidthStr = 'min-width:' + minWidth + 'px;';
			if(maxWidth!='' && regNumc.test(maxWidth)) _maxWidthStr = 'max-width:' + maxWidth + 'px';
			var _layStyle = (_minWidthStr == '' && _maxWidthStr == '') ? '' : ' style="' + _minWidthStr + _maxWidthStr + '"';
			var _layClassName = caption.toString().replace(/([ ]+)/g, '') !== '' ? '' : ' has-caption-noText'; // add 20210709-1
			//html
			var _html = '<div class="'+IdClass+'" id="' + parentId.replace(/[\#\.]/g,'') + '" data-maskId="' + shade + '">'+
									'	<div class="feedback-layout' + _layClassName + '"' + _layStyle + '>'+ // edit 20210709-1
									'		<div class="feedback-close feedback-back ne-dialog-back"'+backStyle+'>' + backText + '</div>'+ // add 20210709-1
									'		<div class="feedback-close ne-dialog-close"'+crossStyle+'></div>'+
									'		<div class="feedback-caption' + _capClass + '"' + _capStyle + '>'+caption+'</div>'+
									'		<div class="feedback-content"' + _contentStyle + '>'+_content+_notes+'</span></div>'+ _btnHtml +
									'	</div>'+
									'</div>';
					
			
			
			//...创建插件
			if(popup){ //...允许弹窗
				if(animate){ //有转圈
					self.showAnimate(loadTxt); //显示转圈
					setTimeout(function(){
						openFeedback();
						self.destroyAnimate(); //销毁转圈
					},loadDelay)
				}else{
					openFeedback();
				} //IF(animate)
				
			}else{ //...不许弹窗
				if(animate){ //有转圈
					self.showAnimate(loadTxt); //显示转圈
					setTimeout(function(){
						var ret = bubbleRet; //默认执行哪个按钮里的事件
						if(settings.callBack) settings.callBack(ret);
						self.destroyAnimate(); //销毁转圈
					},loadDelay)
				}else{
					var ret = bubbleRet; //默认执行哪个按钮里的事件
					if(settings.callBack) settings.callBack(ret);
				}
			} //IF(popup)
			

			//...调用数字键盘
			setTimeout(function(){
				if(keyboard){
					if(html==''){ //==1.输入框内容为默认
						var $numeric = $('.numeric-txt');
						if(typeof($numeric.neuiKeyboard)==='function'){
							$numeric.neuiKeyboard(); //输入框采用数字键盘
							$numeric.on('focus',function(){
								$(this).blur(); //或this.blur(); //禁止调用手机输入法
								//$(this).attr('readOnly','true'); //输入框只读
								//$(this).attr('disabled','disabled'); //输入框不可编辑
							})
						}
					}else{ //==2.输入框内容为自定义HTML
						if(numcNode != null){
							if(typeof(numcNode)=='object'){ //是object(数组),eg.['.back-input','.back-note']
								for(var i=0;i<numcNode.length;i++){
									if(typeof($(numcNode[i]).neuiKeyboard)==='function'){//如果函数存在
										$(numcNode[i]).neuiKeyboard();
										
										$(numcNode[i]).on('focus',function(){
											$(this).blur();
										})
									}
								}
							}else{ //是string(字符串),eg.'.back-input'
								if(typeof($(numcNode).neuiKeyboard)==='function'){//如果函数存在
									$(numcNode).neuiKeyboard();
									$(numcNode).on('focus',function(){
										$(this).blur();
									})
								}
							}
						}
					}
				}
			},100);
			
			
			//...按钮点击事件
			$(document).off('click',parentId + ' .feedback-button-group>.feedback-btn').on('click',parentId + ' .feedback-button-group>.feedback-btn',function(){
				var $this = $(this);
				var ret = $(this).index()+1;
				if(settings.callBack){
					settings.callBack(ret);
				}
				if(settings.closeWindow) closeFeedback($this); //关闭窗口
			})
		 
			//...关闭按钮事件
			$(document).off('click', parentId + ' .feedback-close').on('click', parentId + ' .feedback-close',function(){
				closeFeedback($(this));
			});
			


			// --------------------------------------------------------------------------------
			//  				BUG: ios 苹果系列产品设备问题解决
			//			bug: 解决“fixed弹层点击输入框无法输入文字(无法聚焦)”的bug add 20210407-1
			// --------------------------------------------------------------------------------
			// 总结：
			// click,focus事件虽然可使输入框正常输入文字,但聚焦时输入框会被遮挡住;
			// blur事件刚好可使输入框正常输入文字,且聚焦时输入框不会被遮挡柱
			var elements = (weuiParent + ' textarea:not([readonly]):not([disabled])') + ',' + (weuiParent + ' input:text:not([readonly]):not([disabled])') + ',' + (weuiParent + ' div[contenteditable=true]');
			$(document).off('blur', elements).on('blur', elements, function(){ //事件: focus, click, blur
				var target = this;
				//if(/iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())){ //仅对苹果设备起作用
					// 方法1：使用scrollTo
					var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
					// //window.scrollTo(0, scrollTop);
					// window.scrollTo({
					// 	left: 0, //x轴
					// 	top: scrollTop, //y轴
					// 	behavior: 'smooth'
					// })
					// 方法2：使用scrollIntoView
					target.scrollIntoView(true); //滚动target元素的父容器，使被调用的元素对用户可见。
				//}
			})

			
			
			/*函数：打开输入框*/
			function openFeedback(){
				$('body').append(_html); //创建HTML
				self.openMask(shade, zIndex, maskOpacity); //打开遮罩
				setTimeout(function(){ //延迟一下,防止获取的宽、高有误
					var zIndex = parseInt(document.getElementById(shade.replace(/[\#\.]/g,'')).style.zIndex) + 1;
					//var box = document.getElementsByClassName('ne-dialog-alert')[0];
					var box = self.getByClass('ne-dialog-alert')[0];
					var winW = $(window).width(),
							winH = $(window).height(),
							capH = $(parentId).find('.feedback-caption').outerHeight(true),
							btnH = $(parentId).find('.feedback-button-group').outerHeight(true),
							objW = $(parentId).children().outerWidth(true),
							objH = $(parentId).children().outerHeight(true),
							left = (winW - objW) / 2,
							top =  (winH - objH) / 4;
					
					var _layout = $(parentId).find('.feedback-layout');
					var layMarginTop = parseFloat(_layout.css('marginTop').replace('px', '')),
						layMarginBottom = parseFloat(_layout.css('marginBottom').replace('px', '')),
						layPaddingTop = parseFloat(_layout.css('paddingTop').replace('px', '')),
						layPaddingBottom = parseFloat(_layout.css('paddingBottom').replace('px', '')),
						layH = layMarginTop + layMarginBottom + layPaddingTop + layPaddingBottom;
					var _content = $(parentId).find('.feedback-content');
					var conMarginTop = parseFloat(_content.css('marginTop').replace('px', '')),
						conMarginBottom = parseFloat(_content.css('marginBottom').replace('px', '')),
						conExtraH = conMarginTop + conMarginBottom; 
					//console.log('winH:', winH, ' objH:', objH, 'capH:', capH, ' btnH:', btnH, ' layH:', layH, ' conExtraH:', conExtraH);
					
					//内容超过一屏高度时
					if(top < 0){
						var btnMarginTop = 12;
						//objH = winH * 0.8;
						top = 15;
						contentH1 = objH - capH - btnH;
						contentH = winH - 2 * top -  layH - capH - conExtraH - btnH - btnMarginTop;
						$(parentId).find('.feedback-content').css('height', contentH);
						//子元素高度不能为100%，否则移动端实测时内部将无法滚动，故这里要强制子元素高度为auto,
						$(parentId).find('.feedback-content').children().css({ 
							'height': 'auto'
							//'overflowY':'auto', 
							//'-webkit-overflow-scrolling':'touch'
						})

						$(parentId).find('.feedback-button-group').css('margin-top', btnMarginTop);
					}

					//add edit 20210327-1
					if(settings.fullScreen){ //全屏
						$(parentId).css({
							zIndex:zIndex, 
							left: '0px',
							right: '0px',
							top: '0px',
							bottom: '0px',
							maxWidth: '100%'
						})
						$(parentId).find('.feedback-layout').css({
							height: '100%',
							maxHeight: '100%',
							borderRadius: '0'
						})
					}else{
						$(parentId).css({'z-index':zIndex, 'left':left,'top':top, 'right':left});
					}

					if(settings.openBack){
						settings.openBack();
					}

					
					//————————————————————————————————————————————————————————————————
					// Bug解决：安卓时软键盘弹出导致背景色透明，输入框错位 add 20210515-1
					//————————————————————————————————————————————————————————————————
					//————————————————START 安卓设备时————————————————
					var bottom = top;
					var ua = navigator.userAgent.toLocaleLowerCase();
					var isAndroid = ua.indexOf('android') > -1 || ua.indexOf('adr') > -1 ? true : false;
					if(isAndroid){
					    var softboardH = 0; // 软键盘高
					 	var innerHeight = window.innerHeight;
					 	var eleParent = document.getElementById(parentId.toString().replace(/[\#\.]/g, ''));
						var style = window.getComputedStyle(eleParent, null);
						var oldTop = Math.ceil(style.top.toString().replace(/px/g, ''));
						var oldBot = Math.ceil(style.bottom.toString().replace(/px/g, ''));
						 // alert('原Top：' + oldTop + '\n原Bot：' + oldBot);
						window.addEventListener('resize', function(){
						    var newInnerHeight = window.innerHeight;
						    if (innerHeight > newInnerHeight) { // 键盘弹出事件处理

							    softboardH = innerHeight - newInnerHeight; // 软键盘高
								var curElement = document.activeElement;
					 			var selfH = curElement.offsetHeight;
								var distanceTop = $(curElement).offset().top;
								var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
								var offsetTop = distanceTop - scrollTop;
								var offsetBot = Math.ceil(winH - offsetTop - selfH);
								var newTop = oldTop - (softboardH - offsetBot) - 10; //oldBot;
								// alert('视窗口距离：' + winH + '\n顶部距离：' + distanceTop + '\n滚动距离：' + scrollTop + '\n相对顶部距离：' + offsetTop + '\n自身距离：' + selfH + '\n底部距离：' + offsetBot + '\n软键盘高：' + softboardH + '\n原Top：' + oldTop + '\n新Top：' + newTop);

								if(offsetBot < softboardH){
									$(parentId).css({
										top: newTop + 'px' // 重置位置
									})
								}

						    } else { // 键盘收起事件处理\

					    		$(parentId).css({
									top: oldTop  + 'px' // 还原位置
								})

						    }
						})
					}
					//————————————————END 安卓设备时————————————————


				}, 0)
			}
			
			/*函数：关闭输入框 @param obj 当前点击的对象*/
			function closeFeedback(obj){
				var id = $(obj)[0].id;
				var _btFather = $(obj).parents(weuiParent);
				var _parent = typeof id == 'undefined' ? _btFather : (id == parentId.toString().replace(/[\#\.]/g, '') ? $(obj) : _btFather);
				var mask_id = _parent.attr('data-maskId');
				if(mask_id.replace(/[\#\.]/g,'')!='') $(mask_id).remove();
				else _parent.next(shade).remove();
				_parent.remove();
				
				//edit 20210305-1
				/* $('html,body').removeAttr('style'); //解除禁止滚动(pc端)
				if(self.checkIsMobile()){
					$('html,body').off('touchmove,touchstart'); //解除禁止滚动(手机端)1//$(window).off('touchmove,touchstart');
					window.removeEventListener('touchmove',self.winScroll,{passive:false}); 	//解除禁止滚动(手机端)2(解除window绑定的touchmove事件)
				} */
				self.letWinRoll();

			}
			
			
			
		}, //end function feedback();
		
		





		//======================================================================================
		/**------------------------------------------------------
		 * getElementsByClassName 兼容IE8(含)以下浏览器
		 * @param {*} name 
		 */
		getByClass:function(name){
			//如果浏览器支持会得到一个函数体
			if(document.getElementsByClassName){
				return document.getElementsByClassName(name);
			}
			//把所有的元素获取到
			var allItems = document.getElementsByTagName('*');
			var newArr = [];
			//查找每一个元素的className 看其中含不启name
			for(var i = 0; i < allItems.length; i++){
				var classNames = allItems[i].className; //"test test111"
				var arrClass = classNames.split(" ");
				for(var j = 0; j < arrClass.length; j++){
					if(arrClass[j] == name){
						newArr.push(allItems[i]);
					}
				}
			}
			return newArr;
		},

		/*关闭所有输入框窗口,供外部调用*/
		closeFeedWindow:function(){
			$('.ne-dialog-feedback').next('.ne-dialog-mask').remove();
			$('.ne-dialog-feedback').remove();

			//edit 20210305-1
			/* 
			$('html,body').removeAttr('style'); //解除禁止滚动(pc端)
			if(this.checkIsMobile()){
				$('html,body').off('touchmove,touchstart'); //解除禁止滚动(手机端)1//$(window).off('touchmove,touchstart');
				window.removeEventListener('touchmove',self.winScroll,{passive:false}); 	//解除禁止滚动(手机端)2(解除window绑定的touchmove事件)
			} */
			this.letWinRoll();
		},



		//======================================================================================
		/**
		 * 生成随机字符串(数字+字母组成)
		 * @return {string} 返回字符串
		 * 
		*/
		generateRandChar:function(){
			var str = Math.random().toString(36).substr(2);
			return str;
		},
		
		/**
		 * 生成遮罩节点
		 * return {string} 返回节点class或id属性
		 */
		generateMaskNode:function(){
			var str = 'ne-dialog-mask'; //请不要添加井号#或者点号.
			return str;
		},

		/**
		* 显示转圈
		* @param {string} str 转圈文字
		*/
		showAnimate:function(str){
			var txt = typeof(str)=='undefined' ? '' : (str=='' ? '' : str);
			var spanTxt = txt=='' ? '' : '<span class="txt">'+txt+'</span>';
			var _html='<div class="ne-dialog-loading">'+
						'	<div class="ne-dialog-animate"><i class="icon icon-load"></i>'+spanTxt+'</div>'+ //edit 20180616-1
						'</div>';
			if($('.ne-dialog-loading').length==0) $('body').append(_html);
		},
		
		/**
		* 销毁转圈
		*/
		destroyAnimate:function(){
			$('.ne-dialog-loading').remove();
		},

		/**
		* 创建遮罩
		* @param {string} Id 遮罩ID
		* @param {number} ps_mask_zindex 遮罩层级(可选)
		* @param {number} ps_mask_opacity 遮罩透明度(可选)
		*/
		openMask:function(Id, ps_mask_zindex, ps_mask_opacity){	
			var cusomZindex = typeof ps_mask_zindex == 'undefined' ? '' : ps_mask_zindex;
			var customOpacity = typeof ps_mask_opacity == 'undefined' ? '' : ( isNaN(parseInt(ps_mask_opacity)) ? '' : (ps_mask_opacity >= 1 ? (ps_mask_opacity / 100).toFixed(2) : ps_mask_opacity) );
			var point = this.generateMaskNode();
			var node = typeof(Id)=='undefined' ? '#'+point : Id;
			var name = node.indexOf('#')>=0  ? node.replace('#','') : node;
			var _str = '<div class="'+point+'" id="'+name+'"></div>';
			if($(node).length==0) $('body').append(_str);

			//edit 20210305-1
			/* 
			var scrollHeight = document.body.scrollHeight == 0 ? document.documentElement.scrollHeight : document.body.scrollHeight; //整个网页高度(内容高度)
			//$(node).attr('style',"position:fixed;top:0;left:0;right:0;z-index:50;width:100%;height:100%;background-color:rgba(0,0,0,.35);background-color:#000;opacity:0.35;filter:Alpha(opcity=35);");
			//$('html,body').css({'height':scrollHeight,'overflow':'hidden'}); 
			$('html,body').attr('style','width:100%;height:'+scrollHeight+'px;overflow:hidden'); //禁止滚动(pc端)	 注意,若'height':'100%'则会闪屏
			if(this.checkIsMobile()){
				var dom = document.getElementById(node.toString().replace(/[\#\.]/g, ''));
				dom.addEventListener('touchmove', this.winScroll, {passive:false}); //禁止滚动（手机端,兼容chome手机模拟)
			} */
			this.preventWinRoll();
			
			var zindex = 110, //遮罩基准z-index值(也可取css中的z-index值 110)
					count = $('.'+point).length, //遮罩数量统计
					m_zindex = zindex+ count; //当前遮罩z-index
			if(cusomZindex != '') m_zindex = cusomZindex;
			$('#'+name).css('z-index',m_zindex);
			if(customOpacity != '') $('#'+name).css('opacity', customOpacity);
		},

		/**
		 * 检测是否手机端
		 * @return {boolean} 返回值: true 是手机端, false 不是手机端
		 */
		checkIsMobile:function(){ 
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
		 * 禁止滚动(手机端)
		 * touchemove中添加event.preventDefault()后会阻止浏览器默认的滚动
		*/
		winScroll:function(event){ 
			event.preventDefault();
		},

		/**
		 * 检测IE浏览器版本号
		 * @returns {number|string} 若是ie浏览器则返回对应版本号(整数), 否则返回一段文字
		 */
		ieversion:function(){
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
		},

		/**
		 * 判断是否数组（兼容ie8)
		 * 因原始JS方法:Array.isArray(str)存在IE兼容问题,故自定义了isArray()函数
		 * @param {*} str 要检测的字符串或数组
		 * return {*} 返回值. true 是数组, false 非数组
		 */
		isArray:function(str){
			return Object.prototype.toString.call(str) == "[object Array]";
		},

		/**
		* 阻止“浮层滚动时windows窗体也随之滚动” add 20210305-1
		*/
		preventWinRoll: function(){
			$('html').addClass('noscroll');
			$.FeedLayScroll($('.ne-dialog-notice'), '.help-layout');
			$.FeedLayScroll($('.ne-dialog-alert'), '.alert-layout');
			$.FeedLayScroll($('.ne-dialog-feedback'), '.feedback-content');
			$.FeedLayScroll($('.ne-dialog-mask'), '.ne-dialog-mask');
		},

		/**
		* 不再阻止“windows窗体滚动” add 20210305-1
		*/
		letWinRoll: function(){
			$('html').removeClass('noscroll');
		}
		
	};




	/**
	 * [ios弹出层或遮罩滚动穿透问题] add 20210305-1
	 * 即：web移动端浮层滚动时阻止window窗体滚动
	 * 适用于：fixed 弹出层手在遮罩或弹出层内容中尝试进行滚动时，发现windows窗体也会跟随滚动
	 * @param {object | element} container 表示委托的浮层容器元素（$包装器对象），或者页面其他比较祖先的元素. eg. $('.layer')
	    但是，非常不建议使用$(document)或者$(document.body)等对象作为委托容器，因为可能会出现类似下面这样的错误提示：Unable to preventDefault inside passive event listener due to target being treated as passive.
	 * @param {string | selector} selectorScrollable 表示container中可以滚动的元素的选择器(不需要用$包装器对象)，表示真正的滚动的主体。 eg. '.scrollable'
	 * 参考：https://www.zhangxinxu.com/wordpress/2016/12/web-mobile-scroll-prevent-window-js-css/
	*/
	$.FeedLayScroll = function(container, selectorScrollable) {
	    // 如果没有滚动容器选择器，或者已经绑定了滚动时间，忽略
	    if (!selectorScrollable || container.data('isBindScroll')) {
	        return;
	    }

	    // 是否是搓浏览器
	    // 自己在这里添加判断和筛选
	    var isSBBrowser;

	    var data = {
	        posY: 0,
	        maxscroll: 0
	    };

	    // 事件处理
	    container.on({
	        touchstart: function (event) {
	            //var events = event.touches[0] || event; //JQ 3.0+
	            var events = event.originalEvent.targetTouches[0] || event; //JQ 2.0-

	            // 先求得是不是滚动元素或者滚动元素的子元素
	            var elTarget = $(event.target);

	            if (!elTarget.length) {
	                return;
	            }

	            var elScroll;

	            // 获取标记的滚动元素，自身或子元素皆可
	            if (elTarget.is(selectorScrollable)) {
	                elScroll = elTarget;
	            } else if ((elScroll = elTarget.parents(selectorScrollable)).length == 0) {
	                elScroll = null;
	            }

	            if (!elScroll) {
	                return;
	            }

	            // 当前滚动元素标记
	            data.elScroll = elScroll;

	            // 垂直位置标记
	            data.posY = events.pageY;
	            data.scrollY = elScroll.scrollTop();
	            // 是否可以滚动
	            data.maxscroll = elScroll[0].scrollHeight - elScroll[0].clientHeight;
	        },
	        touchmove: function (event) {
	            // 如果不足于滚动，则禁止触发整个窗体元素的滚动
	            if (data.maxscroll <= 0 || isSBBrowser) {
	                // 禁止滚动
	                event.preventDefault();
	            }
	            // 滚动元素
	            var elScroll = data.elScroll;
	            // 当前的滚动高度
	            var scrollTop = elScroll.scrollTop();

	            // 现在移动的垂直位置，用来判断是往上移动还是往下
	            //var events = event.touches[0] || event; //JQ 3.0+
	            var events = event.originalEvent.targetTouches[0] || event; //JQ 2.0-

	            // 移动距离
	            var distanceY = events.pageY - data.posY;

	            if (isSBBrowser) {
	                elScroll.scrollTop(data.scrollY - distanceY);
	                elScroll.trigger('scroll');
	                return;
	            }

	            // 上下边缘检测
	            if (distanceY > 0 && scrollTop == 0) {
	                // 往上滑，并且到头
	                // 禁止滚动的默认行为
	                event.preventDefault();
	                return;
	            }

	            // 下边缘检测
	            if (distanceY < 0 && (scrollTop + 1 >= data.maxscroll)) {
	                // 往下滑，并且到头
	                // 禁止滚动的默认行为
	                event.preventDefault();
	                return;
	            }
	        },
	        touchend: function () {
	            data.maxscroll = 0;
	        }
	    });

	    // 防止多次重复绑定
	    container.data('isBindScroll', true);
	};
	
	

	//});
//})(jQuery);