/**
 * [neuiWechat]
 * 微信聊天控件
 */

;(function($){
	// Element.scrollTo() 兼容ie
	if (!window.scrollTo) {
		window.scrollTo = function(option) {
			window.scrollLeft = option.left;
			window.scrollTop = option.top;
		};
	}
	if (!document.body.scrollTo) {
		Element.prototype.scrollTo = function(option) {
			this.scrollLeft = option.left;
			this.scrollTop = option.top;
		};
	}
	
	//
	var win = window;
	var doc = document;
	var $win = $(win);
	var $doc = $(doc);
	$.fn.neuiWechat = function(options){
		return new MyChat(this, options)
	};

	var MyChat = function(element, options){
		var me = this;
		me.messageRoot = '.cose'; // 聊天消息根节点
		me.rollRoot = '.as-lay-main'; // 滚动根节点
		me.timer = null; // 消息定时器
		me.state = true; // 消息是否发送成功,默认true
		me.$element = element;
		me.init(options);
	};



	//----------------------------------------------------------------------------------------------------------------------------------------------------------------
	//								1、微信聊天控件
	//----------------------------------------------------------------------------------------------------------------------------------------------------------------
	MyChat.prototype.init = function(options){
		var me = this;
		var defaults = {
			aside: { // 侧栏窗口参数
				// 前台提供的变量
				caption: "微信聊天", // 标题,可自定义HTML(可选)
				toper: "", // 顶部,自定义HTML(可选).
				cross: true, // 是否显示关闭图标(可选),默认false
				back: true, // 是否显示返回按钮(可选),默认false
				showBackText: true, // 是否显示返回按钮的文字(可选),默认true
				capWrap: false, // 标题是否单独一行(可选),默认true. 值为false时,标题将与顶部的关闭、返回按钮在同一行
				isPcImage: false, // 是否要同时在pc端使用图片上传功能(可选),默认false。 true时上传图片将使用pc方式。记得引用相应的控件。add 20230519-1
				// 内部写死的变量
				content: "", // 内容,可自定义HTML(可选)
				footer: me.getContent(), // 底部,自定义HTML(可选).
				adaptive: false, // 窗口是否自适应内容大小(可选). true 是, false 否(默认)
				frozen: true, // 是否冻结顶部、中间及底部,即各部分是否使用绝对定位(可选). true 是(默认), false 否. false时控件大小自适应内容
				showButton: false,
				offset: { 
					left: 0,
					right: 0,
					top: 0,
					bottom: 0
				},
				zIndex: 999, // 层级z-index,默认999(可选)
				openCallBack: function(e){
					// 先往内部填充一个节点作为聊天消息区域的根节点
					e.eleMain.append('<div class="' + me.messageRoot.toString().replace(/[\.\#]/g, '') + '"></div>');
					// 调用系列事件
					me.doneEvent(e);
					
				},
				btnCallBack: function(ret, e){ }
			},

			roll: { // 上拉滚动参数
				// 前台提供的变量
				// 注①：当 autoLoad=true, cleanUp=true 时, 则：页面一打开就会清空滑动区域已有数据,且马上加载第1页数据
				autoLoad: true, // 是否自动加载数据,默认true(可选).
				cleanUp: false,  // 是否先清空滑动区域已有数据,默认true(可选). true时只对第1页有效
				pagesize: 20, // 每页记录数,默认20(可选).
				delay: 0, // 转圈延迟时间,单位:毫秒(可选),默认0。本地调试用，只为看到转圈效果. 
				threshold: 50, //预加载距离,即提前加载距离(可选).
				getData: '',  // 前台获取并返回数据源. 参数e为当前页码等组成的一维对象
				// 内部写死的变量
				//scrollArea: window, // 滚动区域,默认绑定元素自身(可选). 可填充值：window
				scrollHeight: 0, // 自定义滑动区域高度,默认0(可选). 当scrollArea绑定的元素不是window时,则必须手动设置本参数值,否则控件不会执行.
				onlyCircle: true, // 是否只显示转圈效果,默认true(可选). true时label参数无效.
				loadUpFn: function(e){ // 上滚函数. 参数e为数据源、当前页码等组成的一维对象
					var source = e.source, nowpage = e.curpage;
					me.createData(source, me.messageRoot);
				}
			},
			
			source: { // 数据源
				user: { // 当前用户信息 ajax({})
					identifier: "", // 用户号或用户标识,默认空
					surname: "", // 用户姓名或昵称,默认空
					profile: "" // 用户头像,默认空
				},
				field: { // 自定义字段格式(可选)
					// 主键
					keys: "chat_bh", // 记录主键
					// 用户
					avatar: "user_tx", // 用户头像
					userNo: "user_hm", //用户编号
					userName: "user_xm", // 用户姓名或昵称
					// 消息类型
					checkWord: "check_word", // 消息类型是否炒文字
					checkPhoto: "check_pic", // 消息类型是否为图片
					checkVoice: "check_voice", // 消息类型是否为语音
					// 消息内容
					value: "value1", // 内容. 消息类型为文本时
					thumb: "value1",  // 小图. 消息类型为图片时
					picture: "value2", // 大图. 消息类型为图片时
					// 日期
					date: "create_time" // 聊天时间
				}, 
			},
			enableVoice: true, // 是否启用语音,默认true(可选)。
			enablePolling: true, // 是否启用定时器,默认true(可选)
			intervals: 5, // 消息定时器时长,默认5,单位：秒(可选).
			bubbleMsg: 50, // 若有新消息，滚动条距离底部多远显示新消息数量,默认50px(可选).
			inputMinHeight: 32, // 输入框最小高度,默认32(可选).
			inputMaxHeight: 100, // 输入框最大高度,默认32(可选).
			alwaysShowSend: false, // 是否一直显示发送区, 默认false(可选).
			events: { // 系列事件. 须返回操作结果给控件. ajax({})
				send: function(e){ }, // 发送消息按钮. e 格式 {type:"消息类型", content:"消息内容"}. type值：word 文字, voice 语音
				getNews: function(){ }, // 获取最新消息. 注意：返回格式为Object对象或Promise对象, 即若AJAX为同步则返回消息数据Object一维对象; 若AJAX为异步,则返回消息数据写在resolve()中的Promise对象
				album: function(){ }, // 相册图片,返回给控件单张或多张图片(小图、大图组成的对象). 注意：返回的是promise对象. 
									 // 返回的图片数据格式：eg.{thumb: ls_pic_url, picture: ls_pic_url_big}或{data:[{thumb: ls_pic_url, picture: ls_pic_url_big}, {thumb: ls_pic_url, picture: ls_pic_url_big}]}
			}
		}

		me.opts = $.extend(true, {}, defaults, options || {});

		// 先打开聊天窗口
		me.openChat(me.opts.aside);


	};




	/**
	 * 执行聊天窗口系列事件
	 * @param {object} e 侧栏节点组成的一维对象
	 */
	MyChat.prototype.doneEvent = function(e){
		var me = this;
		var zIndex = me.opts.aside.zIndex;
		// =====重算滚动区域高度
		//var height = e.eleMain.css('height').toString().replace(/px/g, '') - 50;
		//me.opts.roll.scrollHeight = height; //test1

		// =====输入框自动增高
		me.fnEditTextAutoHeight();

		// =====聊天历史消息往上翻页
		me.pullup($(me.rollRoot), me.opts.roll);

		// =====输入框被输入法挡住问题
		// me.fnIosImeNotCoverInput();

		// =====定时更新聊天消息
		if(me.opts.events.getNews){
			if(me.opts.enablePolling && me.timer == null){
				me.timer = setInterval(function(){
					var result = me.opts.events.getNews();
					if(result instanceof Promise){ // 返回的是Promise对象时
						result.then(function(res){
							updateNews(res);
						}).catch(function(err){
							me.utilities.openToast(err);
						})
					}
					else{ // 返回的是Object对象时
						updateNews(result);
					}

					function updateNews(source){
						// 消息冒泡：当用户在离底部某一段距离上查看消息历史记录时, 如有新消息则冒泡显示新消息数量，点消息数量时才强制滚动条滚动到底部
						var docH = $(me.rollRoot)[0].scrollHeight,
							viewH = $(me.rollRoot).height(),
							scrollH =  $(me.rollRoot).scrollTop();
						// console.log('docH:', docH, '\nviewH:',viewH, '\nscrollH:',scrollH);
						var botH = me.opts.bubbleMsg.toString().replace(/px/g,'');
						botH = isNaN(Math.floor(botH)) ? 50 : Math.floor(botH);
						if(docH - viewH - scrollH > botH){ // 离底部距离
							var len = source.data.length;
							var msgCount = parseInt($('.bubbling').text()) + len;
							var msgText = msgCount > 99 ?  "99+" : msgCount;
							if(msgCount > 0) $('.bubbling').text(msgText).show();
						}
						me.createData(source, me.messageRoot, 'append'); // 加载新消息
						// me.fnScrollToBottom(); // 直接强制滚动条滚动到底部
					}

				}, Math.floor(me.opts.intervals) * 1000)
			}
		}

	
		// =====聊天界面初始化配置
		// 根据配置显示或隐藏语音功能区
		if(!me.opts.enableVoice){ // 不启用语音功能时
			// $('.talk__switch-voice').hide(); // 隐藏语音输入图标
			// $('.talk__switch-input').hide(); // 隐藏文字输入图标
			$('.talk__switch').hide(); // 隐藏语音输入图标、文字输入图标
		}
		// 根据配置显示或隐藏发送区
		if(me.opts.alwaysShowSend){
			$('.talk__send').show();
		}
		// 根据配置显示pc端上传图片区域 add 20230519-1
		if(me.opts.aside.isPcImage){
			$('.chit__item-pcUp').show();
		}


		// =====聊天界面系列事件
		// 点语音输入图标<=>输入状态切换成语音输入
		$('.talk__switch-voice').off('click').on('click', function(){
			$(this).hide().siblings().show();
			$('.talk__textbox').hide(); // 隐藏输入区
			$('.talk__press').show(); // 显示按住说话区
			$('.talk__more').show(); // 显示加号按钮
			$('.talk__send').hide(); // 隐藏发送区
			if($('.chat__chit').is(':visible')){
				me.fnRecoverMessageAreaHeight('plus'); // 重置消息区高度
				$('.chat__chit').hide(); // 隐藏展开区
			}
		})
		// 点文字输入图标<=>输入状态切换成文字输入
		$('.talk__switch-input').off('click').on('click', function(){
			if(me.opts.enableVoice){ // 当启用语音功能时
				$(this).hide().siblings().show(); // 隐藏文字输入图标、显示语音输入图标
			}
			$('.talk__textbox').show().children().focus();
			$('.talk__press').hide();
			$('.chat__chit').hide(); // 隐藏展开区
			if($('#c-chat-touch').val() != ''){ // 如果输入框非空
				$('.talk__more').hide(); // 隐藏加号按钮
				$('.talk__send').show(); // 显示发送区
			}
		})
		// 点加号按钮选择其它输入方式
		$('.talk__more').off('click').on('click', function(){
			if(me.opts.enableVoice){ // 当启用语音功能时
				$('.talk__switch-input').hide(); // 隐藏文字输入图标
				$('.talk__switch-voice').show(); // 显示语音输入图标
			}
			if(!$('.chit__more').is(':visible')){ // 展开区不显示时
				$('.chat__chit').show().find('.chit__more').show().siblings().hide(); // 显示展开区+功能项，隐藏表情项等
				$('.talk__textbox').show().children().blur(); // 显示输入区，输入框失焦
				$('.talk__press').hide(); // 隐藏按住说话区
				me.fnRecoverMessageAreaHeight('minus'); // 重置消息区高度
			}else{ // 展开区有显示时
				$('.chat__chit').hide(); // 隐藏展开区
				$('.talk__textbox').children().focus(); // 输入框聚焦
				me.fnRecoverMessageAreaHeight('plus'); // 重置消息区高度
			}
		})
		// 点表情按钮
		$('.talk__expression').off('click').on('click', function(){
			if(!$('.chit__expression').is(':visible')){ // 展开区不显示时
				$('.chat__chit').show().find('.chit__expression').show().siblings().hide(); // 显示展开区+表情项，隐藏功能项等
				$('.talk__textbox').show().children().focus(); // 显示输入区，输入框聚焦
				$('.talk__press').hide(); // 隐藏按住说话区
			}else{ // 展开区有显示时
				$('.chat__chit').hide(); // 隐藏展开区
				$('.talk__textbox').show().children().focus(); // 显示输入区，输入框聚焦
			}
		})
		// 输入框聚焦事件
		$('#c-chat-touch').on('focus', function(){
			if($('.chit__more').is(':visible')){ // 功能项有显示时
				$('.chat__chit').hide().children().hide(); // 隐藏展开区及所有子项
				me.fnRecoverMessageAreaHeight('plus'); // 重置消息区高度
			}
			if(isIOSDevice()){ // 若是ios设备，添加一个class属性，防止ios输入法上面的“完成”一栏挡住输入框
				$('.chat').addClass('is-ios-device');
			}
		})
		// 输入框失焦
		// $('#c-chat-touch').on('blur', function(){
			
		// })
		// 输入框输入事件
		$('#c-chat-touch').on('input', function(){
			var value = $(this).html(); //test3
			if(filterEmptyStr(value) != ''){
				$('.talk__send').show(); // 显示发送区
				// $('.talk__more').hide(); // 隐藏加号按钮(暂时一直让显示加号按钮)
			}else{
				if(me.opts.alwaysShowSend === false) $('.talk__send').hide(); // 隐藏发送区
				$('.talk__more').show(); // 显示加号按钮
			}
		})
		// 点发送按钮
		$('#btn_talk_send').off('click').on('click', function(){
			me.sendMessage(); //这个滚动条要弄到最底部，且html是拼接到最后面的即append，而非prepend
		})
		// 点相册, 上传图片 test5
		$('.chit__item-album').off('click').on('click', function(){
			if(!checkMobileDevice()){
				me.utilities.openToast('电脑端(PC)无法上传图片，请在手机上进行操作');
				return;
			}
			me.uploadImage();
		})
		// 点击冒泡消息
		$('.bubbling').off('click').on('click', function(){
			$(this).text(0).hide();
			me.fnScrollToBottom(); // 强制滚动条滚动到底部	
		})
		// 重新发送消息（发送失败，重试） test5
		$(me.messageRoot).off('click', '.cose__text-fail').on('click', '.cose__text-fail', function(){
			var index = $(this).parents('.cose__one').index();
			var value = $(this).parent().siblings('.cose__text-content').html();
			me.sendMessage(index, value);
		})
		// 消息图片预览事件
		$(me.messageRoot).off('click', '.cose__text img').on('click', '.cose__text img', function(e){ // 部分ios中事件委托为document时不执行
			e.stopPropagation(); //必须!阻止冒泡(否则图片预览时第2次无法预览)
			var bigImgArr = [], smallImgArr = [];
			var imgSrc = $(this).attr('data-pic-url-big');
			$('.cose__one').each(function(){
				var $img = $('.cose__text img', this);
				if($img.length > 0){
					var smallImgSrc = $img.attr('src'), bigImgSrc = $img.attr('data-pic-url-big');
					if(typeof bigImgSrc == 'undefined' || bigImgSrc == '') bigImgSrc = smallImgSrc; //若大图为空，则取小图当作大图
					if(smallImgSrc != '') smallImgArr.push(smallImgSrc);
					if(bigImgSrc != '') bigImgArr.push(bigImgSrc);
				}
			});
			// console.log('当前图片：', imgSrc, '\n所有图片大图数组：', bigImgArr);
			if(checkMobileDevice()){
				//console.log('小图地址：', smallImgArr, '\n大图数组：', bigImgArr)
				if(typeof wx != 'undefined'){
					if(typeof wx.previewImage != 'undefined'){
						parent.parent.parent.parent.parent.wx.previewImage({ // 多个parent,保证多个iframe嵌套时可正常预览图片
							current: imgSrc, // 当前图片地址
							urls: bigImgArr // 所有图片地址
						})
					}
				}
			}else{
				if(typeof $(this).neuiMagnify !== 'function'){
					window.open(imgSrc, '_blank'); // 打窗口中打开
					return;
				}
				$(this).neuiMagnify({
					source: {
						current: imgSrc,
						urls: bigImgArr
					},
					getImageTitleAuto: false,
					footerToolbar: [
						'zoomIn',
						'zoomOut',
						'prev',			
						'next',
						'actualSize',
						'rotateRight',
						'rotateLeft'
					]
				});
			}

		})
		

	};





	//================================================================
	/**
	 * 发送按钮, 发送聊天消息 test5
	 * @param {string} ps_index 消息所在行索引值(可选)
	 * @param {string} ps_str 消息内容(可选)
	 */
	MyChat.prototype.sendMessage = function(ps_index, ps_str){
		var me = this;
		var $eleInputBox = $('#c-chat-touch');
		var value = typeof ps_str == 'undefined' ? htmlEncode($eleInputBox.html()) :  htmlEncode(ps_str);
		me.state = typeof ps_str == 'undefined' ? true : false;
		if(filterEmptyStr(value) == ''){
			me.utilities.openToast('请输入聊天内容');
			return;
		}
		//console.log('value:', value);
		// 调用事件
		if(me.opts.events){
			if(me.opts.events.send){
				if(me.state){
					var dataJson = me.fnAtonceMessage(value, '', '1', '0', '0');
					me.createData(dataJson, me.messageRoot, 'append');
					me.fnScrollToBottom(); // 强制滚动条滚动到底部
				}else{
					typeof ps_index == 'undefined' ? 
					$('.cose__one:last-child').find('.cose__text-fail').hide()
					:
					$('.cose__one').eq(ps_index).find('.cose__text-fail').hide();
				}
				var eleTextStatus = 
					typeof ps_index == 'undefined' ? 
					$('.cose__one:last-child').find('.cose__text-status') // 消息状态节点
					:
					$('.cose__one').eq(ps_index).find('.cose__text-status');
				var eleTextLoad = eleTextStatus.children('.cose__text-load');
					eleTextFail = eleTextStatus.children('.cose__text-fail');
				 // 显示消息转圈状态
				 eleTextStatus.show();
				 eleTextLoad.show();
				// 执行后台操作,并返回成功失败标记. result='ok' 表示成功, 其余值为失败
				var result = me.opts.events.send({ "type":"word", "content":value}); // type 消息类型(word 文字, voice 语音), content 消息内容
				//console.log('result:', result);
				if(result == 'ok'){ // 成功
					setTimeout(function(){
						eleTextStatus.hide();
						eleTextLoad.hide();	
					}, 100)
				}else{ // 失败
					setTimeout(function(){
						eleTextLoad.hide();
						eleTextFail.show();	
					}, 200);
				}
				
				$eleInputBox.html('');
				if(me.opts.alwaysShowSend === false) $('.talk__send').hide(); // 隐藏发送区
				$('.talk__more').show(); // 显示加号按钮
				$('#c-chat-touch').focus(); // 输入框聚焦
				me.fnEditTextAutoHeight(); // 重置输入框自动增高
				// if(isIOSDevice()){ // 若是ios设备,移除class属性
				// 	$('.chat').removeClass('is-ios-device');
				// }
			}
		}
	};

	/**
	 * 上传图片
	 */
	MyChat.prototype.uploadImage = function(){
		var me = this;
		if(me.opts.events){
			if(me.opts.events.album){
				me.opts.events.album().then(function(res){ // 执行后台操作
					var imageJson = res;
					var isError = false;
					var errors = '前台album()函数执行完成后必须返回给控件图片数据！\n单张图片格式：{thumb:"小图地址", picture:"大图地址"}；\n多张图片格式：{data:[{thumb:"小图地址", picture:"大图地址"}]}';
					if(!imageJson || $.isEmptyObject(imageJson)) isError = true;
					if(typeof imageJson.data == 'undefined' && (typeof imageJson["thumb"] == 'undefined' || typeof imageJson["picture"] == 'undefined') ) isError = true;
					// if(typeof imageJson["thumb"] == 'undefined' || typeof imageJson["picture"] == 'undefined') isError = true;
					if(isError){
						console.log(errors);
						me.utilities.openToast(errors);
						return;
					}
					$('.chat__chit').hide().children().hide(); // 隐藏展开区及所有子项
					me.fnRecoverMessageAreaHeight('plus'); // 重置消息区高度
					if(typeof imageJson.data == 'undefined') imageJson = {data:[imageJson]} // 单张图片变成多张图片的格式
					// 插入图片
					var dataJson = {data:[]}
					$.each(imageJson.data, function(i, items){
						if(typeof items["thumb"] == 'undefined' || typeof items["picture"] == 'undefined'){
							console.log(errors);
							me.utilities.openToast(errors);
							return false;
						}
						var smallImageUrl = items["thumb"], //小图
							bigImageUrl = items["picture"]; //大图
						var tempJson = me.fnAtonceMessage(smallImageUrl, bigImageUrl, '0', '1', '0'); // {data:[{}]}
						dataJson.data.push(tempJson.data[0]);
					})
					me.createData(dataJson, me.messageRoot, 'append');
					me.fnScrollToBottom(); // 强制滚动条滚动到底部

				}).catch(function(err){
					me.utilities.openToast(err);
				})
			}
		}
	};



	//================================================================
	/**
	 * 输入框自动增高
	 */
	 MyChat.prototype.fnEditTextAutoHeight = function(){
		var me = this;
		expandTextArea($('#c-chat-touch'), {initHeight: me.opts.inputMinHeight, maxHeight: me.opts.inputMaxHeight});
	};
	
	/**
	 * 关闭定时器 test2
	 */
	 MyChat.prototype.fnCloseInterval = function(){
		var me = this;
		if(me.timer != null){
			clearInterval(me.timer);
			me.timer = null;
		}
	};

	// 强制滚动条滚动到底部 test5
	MyChat.prototype.fnScrollToBottom = function(){
		var me = this;
		var y = $(me.rollRoot)[0].scrollHeight - $(me.rollRoot).height();
		if($(me.rollRoot)[0].scrollTo){
			$(me.rollRoot)[0].scrollTo({
				top: y, //y轴
				behavior: "instant" //smooth 平滑滚动, instant 瞬间滚动,默认值auto
			})
			// alert('支持scrollTo')
		}else{
			$('.cose__one:last-child')[0].scrollIntoView({
				behavior: "smooth",
				block: "end",
				inline: "nearest"
			})
			// alert('支持scrollIntoView')
		}
		$('.bubbling').text(0).hide(); // 消息不再冒泡
	};

	/**
	 * 重置消息区高度
	 * @param {string} ps_method 高度是增加还是减少. plus 增加, minus 减少
	 */
	MyChat.prototype.fnRecoverMessageAreaHeight = function(ps_method){
		var me = this;
		var _bottom = Math.floor($(me.rollRoot).css('bottom').toString().replace(/px/g, ''));
		var _ch = $('.chat__chit').outerHeight(true);
		//console.log('_bottom:', _bottom, '\nch:',_ch);
		if(ps_method == 'minus') me._chitMoreHeight = _ch;
		var _h = ps_method == 'plus' ? _bottom - me._chitMoreHeight : _bottom + _ch;
		if(_h < 0) _h = $('.as-lay-footer').outerHeight(true) > 60 ? 49 : $('.as-lay-footer').outerHeight(true);
		$(me.rollRoot).css({ bottom: _h});
	};

	/**
    * 解决ios等第三方输入法软键盘唤起时底部输入框被遮挡问题
    */
	MyChat.prototype.fnIosImeNotCoverInput = function(){
		var me = this;
		if(isIOSDevice()){
			var timing = null;
			//$('.as-lay-footer').css('position','absolute'); // 更改定位为absolute
			var bfscrolltop = document.body.scrollTop; // 获取软键盘唤起前浏览器滚动部分的高度
			$('#c-chat-touch').focus(function(){ // input获取焦点时触发事件
				timing = setInterval(function(){ // 设置一个计时器，时间设置与软键盘弹出所需时间相近
					document.body.scrollTop =  document.body.scrollHeight; // 获取焦点后将浏览器内所有内容高度赋给浏览器滚动部分高度
				}, 100)
			}).blur(function(){ // 设定输入框失去焦点时的事件
				clearInterval(timing); // 清除计时器
				timing = null;
				// document.body.scrollTop = bfscrolltop; // 将软键盘唤起前的浏览器滚动部分高度重新赋给改变后的高度. 这行可能会导致聊天发送消息要点两次
			})
		}
	};


	/**
	 * 马上显示消息,即若当前用户是“我”,则界面上立即显示“我”发的这条消息
	 * @param {string} ps_value 消息内容：文字、语音或图片小图地址
	 * @param {string} ps_pic 图片大图地址,默认空
	 * @param {string} ps_isWord 消息类型是否为文字. 1 是, 0 否
	 * @param {string} ps_isPhoto 消息类型是否为图片. 1 是, 0 否
	 * @param {string} ps_isVoice 消息类型是否为语音. 1 是, 0 否
	 * @returns {object} 返回单个元素的数组对象
	 */
	 MyChat.prototype.fnAtonceMessage = function(ps_value, ps_pic, ps_isWord, ps_isPhoto, ps_isVoice){
		var me = this;
		var format = me.opts.source.field;
		var oneJson = {}
		oneJson[format.keys] = '';
		oneJson[format.avatar] = me.opts.source.user.profile;
		oneJson[format.userNo] = me.opts.source.user.identifier;
		oneJson[format.userName] = me.opts.source.user.surname;
		oneJson[format.checkWord] = ps_isWord;
		oneJson[format.checkPhoto] = ps_isPhoto;
		oneJson[format.checkVoice] = ps_isVoice;
		if(ps_isWord == '1' || ps_isVoice == '1'){ // 文字或语音
			oneJson[format.value] = ps_value;
			oneJson[format.picture] = '';
		}
		if(ps_isPhoto == '1'){ //图片
			oneJson[format.thumb] = ps_value;
			oneJson[format.picture] = ps_pic;
		}
		oneJson[format.date] = dateFormat(getToday(), 'HH:mm:ss'); //'yyyy-MM-dd HH:mm:ss' eg.'2021-04-08 23:58:14';
		return {data:[oneJson]}
	};




	//================================================================
	/**
	 * 获取聊天界面HTML
	 * @returns {string|HTML} 返回HTML字符串
	 */
	 MyChat.prototype.getContent = function(){
		var me = this;
		var _html = [
			'<div class="bubbling" style="display: none">0</div>',
			'<div class="chat">',
				'<div class="chat__talk">',
					'<div class="talk__group talk__more"><i></i></div><!--/.talk__more-->',	
					'<div class="talk__group talk__switch">',
						'<div class="talk__switch-voice"><i></i></div>',
						'<div class="talk__switch-input" style="display:none"><i></i></div>',
					'</div><!--/.talk__switch-->',
					//'<div class="talk__textbox"><textarea id="c-chat-touch"></textarea></div><!--/.talk__input-->',
					'<div class="talk__textbox"><div id="c-chat-touch" contenteditable="true"></div></div><!--/.talk__input-->',
					'<div class="talk__press" style="display: none"><input type="text" id="btn-chat-press" placeholder="按住 说话" onfocus="this.blur()" readonly></div>',
					//'<div class="talk__group talk__expression"><i></i></div><!--/.talk__expression-->',
					'<div class="talk__group talk__send" style="display: none"><button type="button" id="btn_talk_send">发送</button></div><!--/.talk__send-->',
				'</div><!--/.chat__talk-->',
				'<!--[========展开区========]-->',
				'<div class="chat__chit" style="display: none">',
					'<!--[=====表情项项=====]-->',
					'<div class="chit__expression" style="display: none">这里是表情区域</div><!--/.chit__expression-->',
					'<!--[=====功能项=====]-->',
					'<div class="chit__more" style="display: none">',
						'<div class="chit__item chit__item-album"><i></i><span>相册</span></div><!--/.chit__item-->',
						// add 20230519-1	
						'<div class="chit__item chit__item-pcUp" style="display: none">',
							'<input type="file" name="files" id="file" class="img-input" accept="image/*" multiple>',
							'<i></i>',
							'<span>上传图片</span>',
						'</div><!--/.chit__item-->',
						// '<div class="chit__item chit__item-camera"><i></i><span>拍摄</span></div><!--/.chit__item-->',
						// '<div class="chit__item chit__item-video"><i></i><span>视频通话</span></div><!--/.chit__item-->',
						// '<div class="chit__item chit__item-locate"><i></i><span>位置</span></div><!--/.chit__item-->',
						// '<div class="chit__item chit__item-sound"><i></i><span>语音输入</span></div><!--/.chit__item-->',
						// '<div class="chit__item chit__item-favourite"><i></i><span>我的收藏</span></div><!--/.chit__item-->',
						// '<div class="chit__item chit__item-card"><i></i><span>名片</span></div><!--/.chit__item-->',
						// '<div class="chit__item chit__item-file"><i></i><span>文件</span></div><!--/.chit__item-->',
					'</div><!--/.chit__more-->',
				'</div><!--/.chat__chit-->',
			'</div><!--/.chat-->',
		].join('\r\n');
		return _html;
	};


	
	/**
	 * 创建聊天消息历史记录HTML
	 * @param {object} ps_source 数据源
	 * @param {string} ps_node 拼接根节点
	 * @apram {string} ps_method 拼接方式(可选). append 接后面, prepend 接前面(默认)
	 */
	 MyChat.prototype.createData = function(ps_source, ps_node, ps_method){
		var me = this;
		var node = ps_node;
		var method =ps_method === undefined ? 'prepend' : ps_method;
		if(!ps_source || $.isEmptyObject(ps_source)) return;
		if(typeof ps_source.data == 'undefined') return;
		if(ps_source.data.length == 0) return;
		var currentUser = me.opts.source.user.identifier; //当前用户
		if(currentUser === ''){
			var errors = '请设置当前用户\n注意：未设置当前用户聊天时无法区分哪个是“我”';
			console.log(errors);
			me.utilities.openToast(errors);
			return;
		}
		var format = me.opts.source.field; // 字段
		// 开始拼接
		var _html = '';
		$.each(ps_source.data, function(i, items){
			// 消息类型
			var isWord = parseInt(items[format.checkWord]), // 是否文字
				isPhoto = parseInt(items[format.checkPhoto]), // 是否图片
				isVoice = parseInt(items[format.checkVoice]); // 是否语音
			// 用户判断
			var isMine =  items[format.userNo] == currentUser ? true : false; //聊天消息是否为当前用户自己的
			var _className = !isMine ? ' others' : ' active';
			if(isPhoto) _className += ' isThumb';
			// 消息内容
			var thumbUrl = items[format.thumb],
				pictureUrl = items[format.picture];
			var smallImageUrl = thumbUrl == '' ? pictureUrl : thumbUrl, // 小图地址
				bigImageUrl = pictureUrl == '' ? thumbUrl : pictureUrl; // 大图地址
			var _textStr = '';
			if(isWord) _textStr = htmlDecode(items[format.value]);
			if(isPhoto) _textStr = '<img src="' + smallImageUrl + '" data-pic-url-big="' + bigImageUrl + '">';
			if(isVoice) _textStr = [
				'<audio controls autoplay="autoplay">',
					'<source src="' + items[format.value] + '" type="audio/mpeg">您当前设备不支持音频文件</source>',
				'</audio>'
			].join('\r\n');
			
			// 用户头像
			var _avatarStr = [
				'<div class="cose__avatar">',
					'<img src="' + items[format.avatar] + '">',
				'</div><!--/.cose__image-->'
			].join('\r\n');
			// 消息内容
			var _contentStr = [
				'<div class="cose__content">',
					'<div class="cose__date">' + items[format.date] + '</div>',
					'<div class="cose__nick"><span>' + items[format.userName] + '</span></div>',
					'<div class="cose__text" data-bh="' + items[format.keys] + '">',
						'<div class="cose__text-status" style="display: none">',
							'<div class="cose__text-load" style="display: none"></div>',
							'<div class="cose__text-fail" style="display: none">',
								'<div class="cose__text-renew"></div>',
								'<div class="cose__text-reset">重试</div>',
							'</div>',
						'</div><!--/.cose__text-status-->',
						'<div class="cose__text-content">' + _textStr + '</div>',
					'</div>',
				'</div><!--/.cose__content-->'
			].join('\r\n');
			// 位置调整
			var _innerStr = !isMine ? (_avatarStr + _contentStr) : (_contentStr + _avatarStr); //调换下位置
			// 拼接
			_html += [
				'<div class="cose__one' + _className + '">',
					_innerStr,
				'</div><!--/.cose__one-->'
			].join('\r\n');
		})


		if(method == 'prepend') 
			$(node).prepend(_html);
		if(method == 'append') 
			$(node).append(_html);
	};






	//----------------------------------------------------------------------------------------------------------------------------------------------------------------
	//										2、侧栏窗口控件
	//----------------------------------------------------------------------------------------------------------------------------------------------------------------
	/**
	 * 创建聊天窗口
	 * @param {object} opt 参数对象
	 */
	MyChat.prototype.openChat = function(opt){
		var me = this;
		var self = this;
		var defaults = {
			caption: "", // 标题,可自定义HTML(可选)
			toper: "", //顶部,自定义HTML(可选).
			content: "", // 内容,可自定义HTML(可选)
			footer: "", //底部,自定义HTML(可选).

			cross: false, //是否显示关闭图标(可选),默认false
			back: false, //是否显示返回按钮(可选),默认false
			showBackText: true, // 是否显示返回按钮的文字(可选),默认true
			capWrap: true, //标题是否单独一行(可选),默认true. 值为false时,标题将与顶部的关闭、返回按钮在同一行
			adaptive: false, //窗口是否自适应内容大小(可选). true 是, false 否(默认)
            frozen: true, //是否冻结顶部、中间及底部,即各部分是否使用绝对定位(可选). true 是(默认), false 否. false时控件大小自适应内容

			//按钮参数有两种格式
			buttons: ["确定"], // 按钮(可选)
			/* buttons: [ // 按钮(可选)
				{text: "重置", name: "btn-reset", width: "100%", class: "ne-btn", backColor: "", foreColor: "", radius: "0"},
				{text: "完成", name: "btn-complete", width: "100%", class: "ne-btn info", backColor: "", foreColor: "", radius: "0"}
			], */
			showButton: true, //是否显示按钮(可选),默认true
			
			offset: { //位置偏移,由此可设置窗口位置(可选)
				left: 40,
				right: 0,
				top: 0,
				bottom: 0
			},
			radius: 0, //圆角边框值(可选)
			zIndex: 3, //层级z-index(可选)
			animate: { //动画(可选)
				enable: true, //是否启用
				direction: 'left' //动画方向(可选). left 向左(默认), right 向右, top 向上, bottom 向下
			},
			noneSelfClickClose: true, //是否点击窗口以外区域就关闭窗口(可选),默认true. 值为false时常用于多个侧栏嵌套时,除第1个侧栏外其它侧栏要求点击非窗口区域就关闭窗口
			btnClickClose: false, //是否一点击按钮就关闭窗口(可选),默认false. 值为true时用于无须校验数据等其它操作,此时须前台手动调用函数才会关闭窗口
			//回调
			openCallBack: function(e){ }, //创建完成后的回调. e格式: {eleRoot:"根节点", eleLay:"layer节点", eleMain:"中间主体节点", eleTop:"顶部节点", eleFoot:"底部节点"}
			btnCallBack: function(ret, e){ }, //按钮回调(可选). ret 按钮索引值+1, e 同openCallBack()的e参数
			//前台调用
			closeAside: function(){ //关闭当前窗口, 供btnCallBack等回调函数调用,用来关闭窗口(可选)
				shutSide();
			},
			closeAll: function(){ //关闭所有窗口, 供btnCallBack等回调函数调用,用来关闭窗口(可选)
				shutAll();
			}
		}
		var settings = $.extend(true, {}, defaults, opt || {});
		var zIndex = settings.zIndex,
			animate = settings.animate,
			offset = settings.offset,
			radius = settings.radius,
			cross = settings.cross,
			back = settings.back,
			showBackText = settings.showBackText,
			adaptive = settings.adaptive,
			frozen = settings.frozen;
		var anEnable = animate.enable,
			anDirection = ' cartoon-' + animate.direction,
			offLeft = offset.left,
			offRight = offset.right,
			offTop = offset.top,
			offBottom = offset.bottom;		
		// 多个侧栏嵌套时：z-index自动增加
		var aZindex = parseInt(zIndex); //默认z-index为3
		if($('.chat-aside').length != 0){
			var basicZindex = parseInt($('.chat-aside').css('zIndex'));
			aZindex = aZindex < basicZindex ? basicZindex + 3 : aZindex;
		}
		var laZindex = aZindex - 1;
			mZindex =  aZindex - 2;
		var _aZindexStr = _laZindexStr = _mZindexStr = '';
		if(aZindex != 3){ //不是默认的z-index值3时
			_aZindexStr = ' z-index:' + aZindex + ';';
			_laZindexStr = ' z-index:' + laZindex + ';';
			_mZindexStr = ' z-index:' + mZindex + ';';
		}
		// 样式
		var _offLeftStr = offLeft == '' || offLeft == 0 ? '' : ' left: ' + offLeft + 'px;',
			_offRightStr = offRight == '' || offRight == 0 ? '' : ' right: ' + offRight + 'px;',
			_offTopStr = offTop == '' || offTop == 0 ? '' : ' top: ' + offTop + 'px;',
			_offBottomStr = offBottom == '' || offBottom == 0 ? '' : ' bottom: ' + offBottom + 'px;';
			_layRadiusStr = radius == '' || radius == 0 ? '' : ' border-radius:' + radius + 'px;';

		var _sideStyle = ' style="' + _aZindexStr + '"';
		var _maskStyle = ' style="' + _mZindexStr + '"';
		var _layStyle = ' style="' + _offLeftStr + _offRightStr + _offTopStr + _offBottomStr + _layRadiusStr + _laZindexStr + '"';
		var _footClassName = _layRadiusStr == '' && !adaptive ? '' : ' has-padding';
		var _layClassName = _layRadiusStr == '' && !adaptive ? '' : ' has-radius';
			_layClassName += frozen ? '' : ' unfreeze';

		// 创建浮层
		var captionHtml = settings.caption,
			captionClass = settings.capWrap ? '' : ' has-cap-nowrap';
			contentHtml = settings.content,
			btnHtml = '',
			topHtml = settings.toper,
			footHtml = settings.footer;
			backHtml = !showBackText ? '' : '<span>返回</span>';
		var btnLen = settings.buttons.length;
		if(settings.showButton){
			for(var i = 0; i < btnLen; i++){
				var len = settings.buttons.length;
				var row = settings.buttons[i];
				if(typeof row == 'string'){
					var _className = '';
					if(btnLen == 1) _className = ' blue';
					if(i >= 1) _className = ' blue';
					if(i >= 2) _className = ' green';
					btnHtml += '<button type="button" class="ne-btn no-radius' + _className + '">' + row + '</button>';
				}
				if(typeof row == 'object'){
					var btnText = row["text"],
						btnName = typeof row["name"] == 'undefined' ? '' : row["name"],
						btnWidth = typeof row["width"] == 'undefined' ? '100%' : (row["width"] == '' ? '100%' : row["width"]),
						btnClass = typeof row["class"] == 'undefined' ? '' : row["class"],
						btnBackColor = typeof row["backColor"] == 'undefined' ? '' : row["backColor"],
						btnForeColor = typeof row["foreColor"] == 'undefined' ? '' : row["foreColor"],
						btnRadius = typeof row["radius"] == 'undefined' ? '' : row["radius"];
					var _idStr = btnName == '' ? '' : ' id="' + btnName + '"';	
						_classStr = btnClass == '' ? ' class="ne-btn"' : ' class="' + btnClass + '"';
					var _widthStr = btnWidth == '' ? '' : ' width:' + btnWidth + ';',
						_backColorStr = btnBackColor == '' ? '' : ' background-color: ' + btnBackColor + ';',
						_foreColorStr = btnForeColor == '' ? '' : ' color:' + btnForeColor + ';',
						_btnRadiusStr = btnRadius == '' ? '' : ' border-radius:' + btnRadius + 'px;';
					var _styleStr = ' style="' + _widthStr + _backColorStr + _foreColorStr + _btnRadiusStr + '"';
					btnHtml += '<button type="button"' + _idStr + _classStr + _styleStr + '>' + btnText + '</button>';
				}
			}
		}
		var isShowHeader = (captionHtml == '' && !back && !cross) ? false : true;
		var rootId = 'chat-aside-' + Math.random().toString(36).substr(2); //根节点ID.生成字母数字的随机字符
		// HTML
		var allHtml = [
			'<div class="chat-aside" id="' + rootId + '"' + _sideStyle + '>',
				'<i class="aside-mask"' + _maskStyle + '></i>',
				'<div class="aside-layer' + anDirection + _layClassName + '"' + _layStyle + '>',
					!isShowHeader ? '' : 
					[
					'<div class="as-lay-header' + captionClass + '">',
						'<div class="lay-header-top">',
							!back ? '' : '<div class="header-top-back"><i></i>' + backHtml + '</div>',
							!cross ? '' : '<div class="header-top-cross"><i></i></div>',
						'</div>',
						(captionHtml == '' ? '' : '<div class="lay-header-caption">' + captionHtml + '</div>'),
						(topHtml == '' ? '' : '<div class="lay-header-custom">' + topHtml + '</div>'),
					'</div>'
					].join('\r\n'),
					'<div class="as-lay-main">',
						contentHtml,
					'</div>',
					'<div class="as-lay-footer' + _footClassName + '">',
						(btnHtml == '' ? '' : '<div class="lay-footer-button">' + btnHtml + '</div>'),
						(footHtml == '' ?  '' : '<div class="lay-footer-custom">' + footHtml + '</div>'),
					'</div>',
				'</div>',
			'</div>'
		].join('\r\n');
		

		// 拼接并初始化
		var eleRoot = null; //根节点选择器. 全局变量
		var selectorObj = { } //控件各个节点选择器组成的对象
		$(allHtml).appendTo('body').animate({}, function(e){
			eleRoot = $('#' + rootId); //全局赋值
			var elAside = this.id == '' ? $('.' + this.className) : $('#' + this.id);
			elAside.addClass('active'); // 回调加动画
			preventLayerPutWinRoll(elAside, '.as-lay-main'); // 阻止窗体随浮层滚动. 不要用$(eleRoot).find('.as-lay-main'),否则移动端实测内部无法滚动
			//子元素高度不能为100%，否则移动端实测时内部将无法滚动，故这里要强制子元素高度为auto
			$(eleRoot).find('.as-lay-main').children().css({ 
				'height': 'auto'
				//'overflowY':'auto', 
				//'-webkit-overflow-scrolling':'touch'
			})
			
			selectorObj = { 
				eleRoot: $(eleRoot).find('.chat-aside'), 
				eleLay: $(eleRoot).find('.aside-layer'), 
				eleMain: $(eleRoot).find('.as-lay-main'), 
				eleTop: $(eleRoot).find('.as-lay-header'), 
				eleFoot: $(eleRoot).find('.as-lay-footer') 
			}
			
			if(adaptive){ //自适应内容
				var winH = $(window).height();
				var eleH = 0;
				$(eleRoot).find('.aside-layer').children().each(function(k){
					eleH += $(this).outerHeight(true);
				})
				var top = parseFloat(( winH - eleH ) / 2 );
				$(eleRoot).find('.aside-layer').css({
					'left': '5%',
					'right': '5%',
					'top': top + 'px',
					'bottom': top + 'px',
					'borderRadius': '4px'
				})
			}
			// 外观调整
			var topH = $(eleRoot).find('.as-lay-header').outerHeight(true),
				botH = $(eleRoot).find('.as-lay-footer').outerHeight(true);
			if(topH != 0) topH += topH == null ? 0 : 0;
			if(botH != 0) botH += botH == null ? 0 : 0; //10;
			// 根据iframe嵌套层次修改高度
			// var parentTop = getFrameOffsetTop(); // 嵌入页面距离浏览器顶疗的距离
			// // console.log('parentTop:', parentTop);
			// if(parentTop != 0){
			// 	eleRoot.css({
			// 		bottom:  botH
			// 	})
			// }
			$(eleRoot).find('.as-lay-main').css({
				top: topH + 'px',
				bottom: botH + 'px'
			})
			if(settings.openCallBack) settings.openCallBack( selectorObj );
			// 按钮回调
			$(eleRoot).find('.as-lay-footer button').on('click', function(){ //点击按钮
				if(settings.btnClickClose) shutSide($(this));
				var index = $(this).index() + 1;
				if(settings.btnCallBack) settings.btnCallBack(index, selectorObj );
			})
			// 遮罩回调
			$(eleRoot).find('.aside-mask').on('click', function(){
				if(settings.noneSelfClickClose) shutSide($(this));
			})
			// 关闭按钮、返回按钮回调
			$(eleRoot).find('.header-top-back, .header-top-cross').on('click', function(){
				shutSide($(this));
			})


			//BUG: ios 苹果系列产品设备问题解决<=>bug: 解决ios中“fixed弹层点击输入框无法输入文字(无法聚焦)”的bug add 20210407-1
			// 总结：ios中
			// click,focus事件虽然可使输入框正常输入文字,但聚焦时输入框会被遮挡住;
			// blur事件刚好可使输入框正常输入文字,且聚焦时输入框不会被遮挡柱
			var textboxNode = '#' + rootId;
			var elements = (textboxNode + ' textarea') + ',' + (textboxNode + ' input:text') + ',' + (textboxNode + ' div[contenteditable=true]');
			$(document).off('blur', elements).on('blur', elements, function(){ //事件: focus, click, blur
				var target = this;
				//if(/iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())){ //仅对ios设备起作用
					// 方法1：使用scrollTo
					// var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
					// window.scrollTo({
					// 	left: 0, //x轴
					// 	top: scrollTop, //y轴
					// 	behavior: 'smooth'
					// })
					// 方法2：使用scrollIntoView
					target.scrollIntoView(true); //滚动target元素的父容器，使被调用的元素对用户可见。
				//}
			})
		})
		
		// 关闭当前窗口
		function shutSide(ps_obj){
			var ele = typeof ps_obj == 'undefined' ? 
						eleRoot
						: 
						( ps_obj instanceof jQuery ? ps_obj : $(ps_obj) ).parents('.chat-aside');
			ele.remove();
			if($('.chat-aside').length == 0) letWinRoll(); // 让窗体可自由滚动
			me.fnCloseInterval(); // 关闭定时器test2
		}
		// 关闭所有窗口
		function shutAll(){
			$('.chat-aside').remove();
			letWinRoll(); // 让窗体可自由滚动
			me.fnCloseInterval(); // 关闭定时器test2
		}
	};





	//----------------------------------------------------------------------------------------------------------------------------------------------------------------
	//												3、下拉加载更多控件
	//----------------------------------------------------------------------------------------------------------------------------------------------------------------
	/**
	 * 下拉加载更多
	 * @param {object} ele 绑定的元素对象
	 * @param {options} options 参数
	 */
	MyChat.prototype.pullup = function(ele, options){
		var $win = $(window);
		var $doc = $(document);
		var MyPullMore = function(element, options){
			var me = this;
			me.$element = element;
			me.isLock = false; // 是否锁定,默认false
			me.loading = false; // loading状态, 默认false
			me.isData = true; // 是否有数据,默认true
			me.curpage = 0; // 当前页码,默认0
			me.$scrollArea = window; // 滑动区域JQ对象
			me._scrollContentHeight = 0; // 文档高度
			me._scrollWindowHeight = 0; // 可视高度
			me._scrollTop = 0; // 滚动距离
			me.init(options);
		};
	
		MyPullMore.prototype.init = function(options){
			var me = this;
			var defaults = {
				scrollArea: me.$element, // 滚动区域,默认绑定元素自身(可选). 可填充值：window
				scrollHeight: 0, // 自定义滑动区域高度,默认0(可选). 当scrollArea绑定的元素不是window时,则必须手动设置本参数值,否则控件不会执行.
	
				// 注②：当 autoLoad=true, cleanUp=true 时, 则：页面一打开就会清空滑动区域已有数据,且马上加载第1页数据
				autoLoad: true, // 是否自动加载数据,默认true(可选).
				cleanUp: true, // 是否先清空滑动区域已有数据,默认true(可选). true时只对第1页有效
	
				pagesize: 20, // 每页记录数,默认20(可选).
				threshold: 50, //预加载距离,即提前加载距离(可选).
				delay: 0, // 转圈延迟时间,单位:毫秒(可选),默认0。本地调试用，只为看到转圈效果.
				
				label: { // 自定义上滚文本(可选)
					more: '↓下拉加载更多',
					load: '加载中',
					empty: '没有更多了'
				},
				onlyCircle: true, // 是否只显示转圈效果,默认true(可选). true时label参数无效.
	
				getData: '', // 前台获取并返回数据源. 参数e为当前页码等组成的一维对象
				loadUpFn: '', // 上滚函数. 参数e为数据源、当前页码等组成的一维对象   
			}
			me.opts = $.extend(true, {}, defaults, options || {});	
			// 当前元素添加自定义的CLASS属性
			me.$element.addClass('nePull__slide');	
			// 设置HTML节点
			me.opts.root = 'ne__pulling';
			me.opts.nodeUp = {
				father: 'nePull__up',
				more: 'nePull__more',
				load: 'nePull__load',
				empty: 'nePull__empty'
			}
			var loadLabel = !me.opts.onlyCircle ? '<em>' + me.opts.label.load + '</em>' : '';
			me.opts.domUp = {
				more: '<div class="' + me.opts.nodeUp.more + '">' + me.opts.label.more + '</div>',
				load: '<div class="' + me.opts.nodeUp.load + '"><span class="loading"></span>' + loadLabel + '</div>',
				empty: '<div class="' + me.opts.nodeUp.empty + '">' + me.opts.label.empty + '</div>'
			}
			//me.$element.wrap('<div class="' + me.opts.root + '"></div>');
			me.$element.prepend('<div class="' + me.opts.nodeUp.father + '"></div>'); //test1
			//me.$element.before('<div class="' + me.opts.nodeUp.father + '"></div>');
			//me.$domRoot = $('.' + me.opts.root);
			me.$domUp = $('.' + me.opts.nodeUp.father);
			if(!me.opts.onlyCircle){
				me.$domUp.append(me.opts.domUp.more);
			}	
			// 获取当前元素距离顶部、底部的偏移量
			var selfHeight = me.$element.get(0).offsetHeight;
			var offsetTop = me.$element.offset().top;
			var offsetBottom = $(window).height() - offsetTop - selfHeight;
			if(offsetBottom < 0) offsetBottom = 0;
			me._offsetTop = offsetTop;
			me._offsetBottom = offsetBottom;
			//console.log('offsetTop:', offsetTop, '\noffsetBottom:',offsetBottom)
			// 预加载距离
			if(me.opts.threshold === 0 || me.opts.threshold === ''){
				me._threshold = Math.floor(me.$domUp.height() * 1/3);
			}else{
				me._threshold = me.opts.threshold;
			}
	
	
			// 判断绑定元素
			if(me.opts.scrollArea == window){
				me.$scrollArea = $win;
				me._scrollContentHeight = $doc.height();
				me._scrollWindowHeight = $win.height();
			}else{
				var SH = me.opts.scrollHeight === '' ? 0 : Math.floor(me.opts.scrollHeight.toString().replace(/px/g, ''));
				//console.log('滑动区域高度:', SH, '\n视窗高度：', $win.height())
				if(SH == 0 || SH > $win.height()){
					// var error = '请设置滑动区域高度，scrollHeight参数值必须大于0.\n注意：最大高度不能大于WINDOWS视窗高度：$(window).height()';
					// alert(error);
					// console.log(error);
					// return;
				}else{
					me.$element.css({
						'height': SH,
						'overflow-y': 'auto',
						'-webkit-overflow-scrolling': 'touch'
					})
				}
				me.$scrollArea = me.$element;
				me._scrollContentHeight = me.$element[0].scrollHeight;
				me._scrollWindowHeight = me.$element.height();
			}
	
	
			// 清空滑动区域已有数据
			fnClearHistory(me);
	
			// 自动加载
			fnAutoLoad(me);

			
			// 先强制滚动条位于底部
			// setTimeout(function(){
				if(me.$scrollArea.find('.cose').children().length != 0){
					var docH = me.$scrollArea[0].scrollHeight, winH = me.$scrollArea.height();
					// console.log('docH:', docH, '\nwinH:', winH); //test3
					var y = me._scrollContentHeight - me._scrollWindowHeight;
					// console.log('y:', y); //test3
					me.$scrollArea[0].scrollTo({
						top: y, //y轴
						behavior: "instant" //smooth 平滑滚动, instant 瞬间滚动,默认值auto
					})
				}
			// }, 1000)

		  
	
			// 窗口调整
			$win.on('resize', function(){
				clearTimeout(me.timer);
				me.timer = setTimeout(function(){
					if(me.opts.scrollArea == window){
						me._scrollWindowHeight = window.innerHeight; // 重新获取win可视区域高
					}else{
						me._scrollWindowHeight = me.$element.height();
					}
					fnAutoLoad(me);
				}, 150)
			})
	
			// 执行滚动
			me.$scrollArea.on('scroll', function(){
				me._scrollTop = me.$scrollArea.scrollTop();
				//onsole.log('滚动距离：', me._scrollTop)
				//console.log('相减少：', me._scrollTop - me._threshold)
				if( !me.isLock && !me.loading && (me._scrollTop - me._threshold) <= 0){
					//console.log('滚动到顶部了');
					fnToUp(me);
				}
			})
		};
	
		// 重置加载
		MyPullMore.prototype.resetLoad = function(){
			var me = this;
			me.loading = false; // loading状态置为false
			if(me.isData){ // 有数据
				me.$domUp.html(''); 
				if(!me.opts.onlyCircle) me.$domUp.html(me.opts.domUp.more); 
				fnRecoverContentHeight(me); // 重置文档高度
				fnRecoverScrollPosition(me); //重置滚动条位置
				//fnAutoLoad(me); // 继续自动加载
			}else{ // 无数据
				setTimeout(function(){ //给一个小延迟,以显示转圈再销毁转圈
					if(!me.opts.onlyCircle) me.$domUp.show().html(me.opts.domUp.empty);
					else me.$domUp.hide();
				}, 1000)
			}
		};
	
	
		//================================================
		//                   上滚事件
		//================================================
		// 清空绑定元素已有数据
		function fnClearHistory(me){
			if(me.opts.cleanUp){
				if(me.curpage == 0){
					//console.log('111');
					me.$element.empty();
					fnRecoverContentHeight(me);
				}
			}
		}
	
	
		 // 自动加载：如果文档高度小于可视高度，数据较少，则自动加载下方数据
		 function fnAutoLoad(me){
			if(me.opts.loadUpFn != '' && me.opts.autoLoad){
				//console.log('aaa')
				//console.log('文档高度：', me._scrollContentHeight, '\n预加载高度：', me._threshold, '\n可视高度：', me._scrollWindowHeight);
				if( (me._scrollContentHeight - me._threshold) <= me._scrollWindowHeight){
					//console.log('222')
					fnToUp(me);
				}
			}
		}
	
	
		//  上滚函数
		function fnToUp(me){
			me.loading = true;
			me.curpage++; //页码加1
			me.$domUp.html(me.opts.domUp.load);
			me._oldScrollHeight = me.$scrollArea[0].scrollHeight; // 旧文档高度
			var source = me.opts.getData({curpage: me.curpage});
			if(!fnCheckHasData(source, me)){
				me.isLock = true; // 锁定
				me.isData = false; // 无数据
				me.resetLoad();
			}
			var callback = {source: source, curpage: me.curpage}
			if(me.opts.delay === '' || me.opts.delay === 0){
				fnLoadDataUp(me, callback);
			}else{
				setTimeout(function(){
					fnLoadDataUp(me, callback);
				}, Math.floor(me.opts.delay))
			}
		}
	
		// 加载上滚数据
		function fnLoadDataUp(me, callback){
			me.opts.loadUpFn(callback);
			me.resetLoad();
		}

		//================================================
		//                   公共库
		//================================================
		 /**
		 * 重置文档高度
		 * @param {object} me 控件参数对象
		 */
		function fnRecoverContentHeight(me){
			if(me.opts.scrollArea == window){
				me._scrollContentHeight = $doc.height();
			}else{
				me._scrollContentHeight = me.$element[0].scrollHeight;
			}
		}
	
		// 重置滚动条位置
		function fnRecoverScrollPosition(me){
			// var _cellH = me.$element.children().eq(0).outerHeight(); //每条记录的高度
			// var _topH = me.opts.scrollArea == window ? me._offsetTop : 0;
			// var _yPos = _cellH * (me.opts.pagesize - 1) + _topH;
			var _yPos = me._scrollContentHeight - me._oldScrollHeight - 30;
			//console.log('每条记录高度：',_cellH, '\n总高度：', _yPos);
			//console.log('旧文档高度：', me._oldScrollHeight, '\n2新文档高度2：', me._scrollContentHeight, '\nyPos:',_yPos)
			me.$scrollArea[0].scrollTo({
				top: _yPos, //y轴
				behavior: "instant" //smooth 平滑滚动, instant 瞬间滚动,默认值auto
			})
		}
	
		/**
		 * 校验数据源是否有数据
		 * @param {object} ps_source 数据源
		 * @returns {boolean} 返回布尔值. true 有, false 无
		 */
		 function fnCheckHasData(ps_source, ps_me){
			if(!ps_source || $.isEmptyObject(ps_source)) return false;
			if(typeof ps_source.data == 'undefined') return false;
			if(ps_source.data.length == 0) return false;
			if(ps_source.data.length < ps_me.opts.pagesize) return false;
			return true;
		}

		// 实始化加载控件 test1
		new MyPullMore(ele, options);
	};


	/**
	 * 工具库
	 */
	MyChat.prototype.utilities = {
		openToast: function(ps_str){
			var html = [
				'<div class="prompt">',
					'<div class="prompt__mask"></div>',
					'<div class="prompt__content">',
						'<span>' + ps_str + '</span>',
					'</div>',
				'</div>'
			].join('\r\n');
			if($('.prompt').length == 0)
				$(html).appendTo('body');
			setTimeout(function(){
				$('.prompt').fadeOut('fast').remove();
			}, 1000)
		},
		closeToast: function(){
			$('.prompt').fadeOut('fast').remove();
		}
	};





	//----------------------------------------------------------------------------------------------------------------------------------------------------------------
	//																	4、内置函数
	//----------------------------------------------------------------------------------------------------------------------------------------------------------------
	//========================================
	/**
	 * 过滤所有空字符. 即过滤空格、换行、制表符、空字符对尖的html编码(eg. &ngsp;也表格空格)
	 * @param {string} ps_str 原字符串
	 * @returns {string} 返回去掉所有空格后的新字符串
	 */
	function filterEmptyStr(ps_str){
		if(ps_str === '') return '';
		// console.log('ps_str1:', ps_str);
		var str = htmlDecode(ps_str);
		str = str.toString().replace(/\<style[\s\S]*>[\s\S]*<\/style>/g, ''); // 过滤css
		str = str.replace(/\<script[\s\S]*>[\s\S]*<\/script>/g, ''); // 过滤js
		str = str.replace(/<[^<>]+?>/g, ''); //过滤标签
		str = str.toString().replace(/(nbsp;|ensp;|emsp;|thinsp;|amp;|&)/ig, ''); //去掉 &nbsp; &ensp; &emsp; &thinsp;等转义的空格
		str = str.replace(/\ +/g, ''); // 去掉空格
		str = str.replace(/[\r\n]+?/g, ''); //去掉换行
		// console.log('ps_str2:', str);
		return str;
	};


	/**
	* 不再阻止“windows窗体滚动”(让窗体可自由滚动)
	*/
	function letWinRoll(){
		$('html').removeClass('chat-noscroll');
	};

	/**
	 * 阻止“浮层滚动时windows窗体也随之滚动”(阻止窗体随浮层滚动)
	 * 即：web移动端浮层滚动时阻止window窗体滚动
	 * 用于解决：ios弹出层或遮罩滚动穿透问题
	 * 兼容说明：ios中 fixed 弹出层手在遮罩或弹出层内容中尝试进行滚动时，发现windows窗体也会跟随滚动
	 * @param {object | element} container 表示委托的浮层容器元素（$包装器对象），或者页面其他比较祖先的元素. eg. $('.layer')
		但是，非常不建议使用$(document)或者$(document.body)等对象作为委托容器，因为可能会出现类似下面这样的错误提示：Unable to preventDefault inside passive event listener due to target being treated as passive.
	* @param {string | selector} selectorScrollable 表示container中可以滚动的元素的选择器(不需要用$包装器对象)，表示真正的滚动的主体。 eg. '.scrollable'
	* 参考：https://www.zhangxinxu.com/wordpress/2016/12/web-mobile-scroll-prevent-window-js-css/
	*/
	function preventLayerPutWinRoll(container, selectorScrollable){
		//CSS部分
		$('html').addClass('chat-noscroll');
		// ·JS部分
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
				data.elScroll = elScroll; // 当前滚动元素标记
				data.posY = events.pageY; // 垂直位置标记
				data.scrollY = elScroll.scrollTop();
				data.maxscroll = elScroll[0].scrollHeight - elScroll[0].clientHeight; // 是否可以滚动
			},
			touchmove: function (event) {
				// 如果不足于滚动，则禁止触发整个窗体元素的滚动
				if (data.maxscroll <= 0 || isSBBrowser) {
					event.preventDefault(); // 禁止滚动
				}
				var elScroll = data.elScroll; // 滚动元素
				var scrollTop = elScroll.scrollTop(); // 当前的滚动高度

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
				if (distanceY > 0 && scrollTop == 0) { // 上边缘检测，往上滑，并且到头
					event.preventDefault(); // 禁止滚动的默认行为
					return;
				}
				if (distanceY < 0 && (scrollTop + 1 >= data.maxscroll)) { // 下边缘检测，往下滑，并且到头
					event.preventDefault(); // 禁止滚动的默认行为
					return;
				}
			},
			touchend: function () {
				data.maxscroll = 0;
			}
		})
		container.data('isBindScroll', true); // 防止多次重复绑定
	};


	 /**
     * 将标签转换成字符串（即HTML编码）
     * HTML与字符串互转义
     * @param {string} ps_str 含有标签的字符串
     * @returns {string} 返回不含标签的字符串
     * eg1.将 < 转义成 &lt; eg2.将 > 转义成 &gt;
     */
	function htmlEncode(ps_str){
		var temp = document.createElement("div");
        (temp.textContent != null) ? (temp.textContent = ps_str) : (temp.innerText = ps_str);
        var output = temp.innerHTML.toString().replace(/\"/g, '&quot;').replace(/\'/g, '&apos;'); //单双引号转义
        output = output.replace(/\r/g, '').replace(/\n/g, '').replace(/\t/g, ''); //回车、换行、制表符替换成空
		output = output.replace(/&lt;div&gt;([\s\S]*?)&lt;\/div&gt;/g, '&lt;p&gt;$1&lt;/p&gt;');  // 去掉div标签
        output = output.replace(/\\/g, '/'); //反斜杠替换成斜杠
        temp = null;
        return output;
	};


    /**
     * 将字符串转换成标签（即HTML解码）
     * 字符串与HTMl互转义
     * @param {string} ps_str 字符串
     * @returns {string} 返回含有标签的字符串
     * eg1. 将 &lt; 转义成 < eg2.将 &gt; 转义成 >
     */
	 function htmlDecode(ps_str){
        var temp = document.createElement('div');
        temp.innerHTML = ps_str;
        var output = temp.innerText ||temp.textContent;
        temp = null;
        return output;
    };


	/**
	 * 获取当天日期. eg.2017-09-05 14:32:21
	 * @param {boolean} isZeroize 小于10的时间是否被零, 默认true(可选).
	 */
	function getToday(isZeroize){
		var mydate = new Date();
		var Y = mydate.getFullYear(),
			M = mydate.getMonth() + 1,
			D = mydate.getDate(),
			h = mydate.getHours(),
			m = mydate.getMinutes(),
			s = mydate.getSeconds();
		var bools= isZeroize === undefined ? true : (isZeroize === false ? false : true);
		if(bools){//小于10的月分及天数前面是否补0(默认补0，如果函数传递参数false则不补0)
			if(M < 10) M = '0' + M;
			if(D < 10) D = '0' + D;
			if(h < 10) h = '0' + h;
			if(m < 10) m = '0' + m;
			if(s < 10) s = '0' + s;
		}
		return (Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s);
	};

	/**
	 * 格式化日期 / 标准化日期时间
	 * 说明: 该方法有效防止后台传数据格式发生变化. eg.10-19-2017 <==> 2017/10/19
	 * 思路：后台的时间日期 => 时间戳 =>标准的时间日期 y=年，m=月，d=天，h=时，u=分，s=秒
	 * @param {string} dateTime 日期字符串
	 * @param {string} formatStr 日期格式(可缺省).默认返回"年-月-日 时:分:秒"的格式. eg1. "yyyy-MM-dd HH:mm:ss" 返回"年-月-日 时:分:秒"eg2. "yyyy-MM-dd" 返回"年-月-日"
	 * @returns {string} 返回标准化日期字符串
	 */
	 function dateFormat(dateTime, formatStr){
		var me = this;
		var dateTime = isIOSDevice() || isIeBrowser() ? dateTime.toString().replace(/-/g, '/') :  dateTime; // 短横线-换成斜杠/以兼容ios和ie
		var formatStr = typeof formatStr == 'undefined' ? 'yyyy-MM-dd HH:mm:ss' : formatStr;
		var dateParse = Date.parse(new Date(dateTime));//转成时间戳
		var time = new Date(dateParse);//再转成标准时间
		var y = String(time.getFullYear());
		var m = String(time.getMonth()+1);
		var d = String(time.getDate());
		var h = String(time.getHours());
		var u = String(time.getMinutes());
		var s = String(time.getSeconds());
        if(m < 10) m = '0' + m;
        if(d < 10) d = '0' + d;
        if(h < 10) h = '0' + h;
        if(u < 10) u = '0' + u;
        if(s < 10) s = '0' + s;
		if(formatStr == 'yyyy-MM-dd HH:mm:ss') return y + '-' + m + '-' + d + ' ' + h + ':' + u + ':' + s;
		else if(formatStr == 'yyyy-MM-dd HH:mm') return y + '-' + m + '-' + d + ' ' + h + ':' + u;
        else if(formatStr == 'MM-dd HH:mm:ss') return m + '-' + d + ' ' + h + ':' + u + ':' + s;
        else if(formatStr == 'MM-dd HH:mm') return m + '-' + d + ' ' + h + ':' + u;
		else if(formatStr == 'yyyy-MM-dd') return y + '-' + m + '-' + d;
		else if(formatStr == 'dd/MM/yyyy') return d + '/' + m + '/' + y;
		else if(formatStr == 'MM/dd/yyyy') return m + '/' + d + '/' + y;
		else if(formatStr == 'yyyy/MM/dd') return y + '/' + m + '/' + d;
		else if(formatStr == 'MM-dd') return m + '-' + d;
		else if(formatStr == 'dd/MM') return d + '/' + m;
		else if(formatStr == 'HH:mm:ss') return h + ':' + u + ':' + s;
		else if(formatStr == 'HH:mm') return h + ':' + u;
		else return {"year":y, "mon":m, "day":d, "hours":h, "minutes":u, "seconds":s}; //return m+"/"+d//直接输入自己想要的格式
	};

	/**
	 * 判断是否ios设备
	 * @returns {boolean} 返回布尔值. true 是, false 否
	 */
	function isIOSDevice(){
		return /iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase()) ? true : false;
	};


	/**
	 * 判断是否ie浏览器
	 * @returns {boolean} 返回布尔值. true 是, false 否
	 */
	function isIeBrowser(){
		return window.ActiveXObject || "ActiveXObject" in window ? true : false;
	}

	/**
	 * 获取嵌入页面距离浏览器顶部的距离
	 */
	function getFrameOffsetTop(){
		var tagname = 'iframe';
		var frame = window.parent.document.getElementsByTagName(tagname)[0];
		var top = typeof frame == 'undefined' ? 0 : frame.offsetTop;
		return top;
		//iframe多层时test4
		// var tagname = 'iframe';
		// var list = window.parent.document.getElementsByTagName(tagname);
		// var list2 = window.parent.parent.document.getElementsByTagName(tagname);
		// var parents = window.top;
		// console.log('iframe长度444：', window.top.document.getElementsByTagName(tagname)[0].document.getElementsByTagName(tagname));
		// console.log('list：', list, '\nlist333：', list2);
		// var top = 0;
		// for(var i = 0; i < list.length; i++){
		// 	console.log('i:', i);
		// 	top += typeof list[i] == 'undefined' ? 0 : list[i].offsetTop;
		// }
		// console.log('top:', top);
		// return top;

	};


	/**
	 * 检测是否移动端，判断是否手机端设备
	 * @returns {boolean} 返回布尔值. true 是, false 否
	 */
	function checkMobileDevice(){
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
	};



	/**
	* 输入框自动增加高度(适用于单个输入框元素)
	* @param {object} el 多行输入框的js或jq对象
	* @param {object} opt 自定义初始高度、最大高度等参数组成的一维对象(可选). eg. {initHeight: 28, maxHeight: 120}
	* eg. var el = document.getElementById('id');
	* eg. var el = $('#输入框ID');
	*/
	function expandTextArea(el, opt){
		var defaults = {
			initHeight: 28,
			maxHeight: 120
		}
		var settings = $.extend(true, {}, defaults, opt || {} );
		var _height = typeof opt == 'undefined' ? null : isNaN(parseInt(opt.initHeight)) ? null : parseInt(opt.initHeight),
			_maxHeight = typeof opt == 'undefined' ? null : isNaN(parseInt(opt.maxHeight)) ? null : parseInt(opt.maxHeight);
		var _isContinue = true;
		if(el instanceof jQuery) el = el[0]; //jq对象转化成js对象
		var setStyle = function(el, h){
			if(!_isContinue) return;
			el.style.height = 'auto';
			el.style.height = ( typeof h == 'undefined' || h == null ? el.scrollHeight : parseInt(h.toString().replace(/px/g, '')) )  + 'px';
			el.style.maxHeight = ( typeof h == 'undefined' || h == null ? el.scrollHeight : parseInt(h.toString().replace(/px/g, '')) )  + 'px';
			// console.log(el.scrollHeight);
			//限制最大高度
			var _elHeight = parseInt(el.style.height.toString().replace(/px/g, ''));
			//console.log('输入框高度：', _elHeight, '-限制最大高度：', _maxHeight);
			if(_maxHeight != null){
				if(_elHeight >= _maxHeight){
					el.style.height = _maxHeight;
					el.style.maxHeight = _maxHeight;
					//console.log('超过了')
					_isContinue = false;
				}
			}
		}
		var delayedResize = function(el) {
			window.setTimeout(function(){
				setStyle(el)
			}, 0)
		}
		if(el.addEventListener){
			el.addEventListener('input',function(){
				setStyle(el)
			},false);
			setStyle(el, _height)
		}else if(el.attachEvent){
			el.attachEvent('onpropertychange',function(){
				setStyle(el)
			})
			setStyle(el)
		}
		// if(window.VBArray && window.addEventListener) { // IE9
		// 	el.attachEvent("onkeydown", function() {
		// 			var key = window.event.keyCode;
		// 			if(key == 8 || key == 46) delayedResize(el);
		// 	});
		// 	el.attachEvent("oncut", function(){
		// 		delayedResize(el);
		// 	}) // 处理粘贴
		// }
	   	if(window.VBArray) { // IE
			if(window.addEventListener){
				el.addEventListener("keydown", function() {
					var key = window.event.keyCode;
					if(key == 8 || key == 46) delayedResize(el);
				});
				el.addEventListener("cut", function(){  // 处理粘贴
					delayedResize(el);
				})
			}else if(el.attachEvent){
				el.attachEvent("onkeydown", function() {
					var key = window.event.keyCode;
					if(key == 8 || key == 46) delayedResize(el);
				});
				el.attachEvent("oncut", function(){  // 处理粘贴
					delayedResize(el);
				})
			}
		}
	};
	
	

})(jQuery);




