/**--------------------------------------------
* neuiLoadMore
* 下拉更多插件
* Author: ChenMufeng
* Date: 2018.8.1
* UpDate: 2020.7.13
-------------------------------------------*/
(function($){
	$.fn.extend({
		neuiLoadMore:function(options){
			var defaults = {
				loadMethod: 'click', //数据加载方式(可缺省), click 手动点击加载(默认), scroll 滚动加载
				scrollRegion: 'locale', //滚动方式(可缺省). locale “局部滚动”(默认), window “全局滚动(整个窗口滚动)”. (仅当loadMethod='scroll'时有效)
				//pages: 1,	//总页数,默认1页(可缺省,尚未用到本参数)
				pagesize: 20, //每页数量(可缺省,默认20条)
				curpage: 1, //当前页码(必须,传递给前台用)
				noDataTips: '抱歉，暂无数据', //无数据时提示文字
				moreText: '点击加载更多', //加载更多的文字提示文字
				overText: '没有更多了', //所有数据加载完后的提示文字
				scrollHeight: null, //滚动区域高度,默认单位:px(可缺省,请在css中限制滚动高度)
				createBool: true, //是否允许下拉,值:true,false,默认true
				animate: true, //是否转圈(可缺省)，默认true
				getHTML: null, //滚动节点内部HTML
				getJson: null, //调用json
			}
			var settings = $.extend({},defaults,options);
			var parent = $(this); //拼接父节点
			var loadMethod = settings.loadMethod == 'scroll' ? 'scroll' : 'click',
				scrollRegion = settings.scrollRegion == 'window' ? 'window' : 'locale',
				pages = settings.pages,
				pagesize = settings.pagesize,
				createBool = settings.createBool;
			var botTxt = settings.overText, //'—— · 我是有底线的 · ——',
				moreTxt = settings.moreText, //'点击加载更多',
				moreImg = '<img style="margin-right:5px;vertical-align:top;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxOTUyMDY4MzE1QTMxMUVBQjMzRTk1NkFGNDVBNTU4RiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxOTUyMDY4NDE1QTMxMUVBQjMzRTk1NkFGNDVBNTU4RiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjE5NTIwNjgxMTVBMzExRUFCMzNFOTU2QUY0NUE1NThGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjE5NTIwNjgyMTVBMzExRUFCMzNFOTU2QUY0NUE1NThGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+vmHrJQAAAWdJREFUeNqkU7FKA0EQndldI1gKQkDsLCxSKJYSsEolCKlstLSz8FP8A9FebFWEVPEDLAQtRGz8AonxsuObyx2Xu9u9BJxl2b2ZN2/fDTMsIqR2dz+giG0z0QrOYSjY6+2npylcEts7QrKHHVy5uVmaiLWhqN0QryqK2iTb/yZayExxYazFjSsqSoqcYbLwSENBNAQYOVt+2MwiFLTkmnXpIznGS4iIpyBVZG1Ylbpi8dKvMWeqLMfV2HAtTQGSAy9yDnBLXzSVWuW1SdVM8Wc4jmpEbPgDid3xWN71e7nFNTXqUzJgHlGfU+R81zob8Wdm7kPVzehHPpGwYbgYFL37RGhE9OA9rRvmrcaGBKBPwoMkkdfs37xyMeh+E7kFyWqVJNrZKPoxW37B9QlCvrDfwHMBXwcku6EcF288OYS8Kxa6TlUZHsK3SZH+d82DICeQNwFrx5N0m1rVzZ8quQTZ2rw5/BNgAGt+jM83piMrAAAAAElFTkSuQmCC">';
					
			
			var	_botStr = '<div class="loadmore load-bottom cursor-normal" style="margin:20px auto;text-align:center;font-size:16px;">'+
							botTxt +
						  '</div>';
			var	_moreStr = '<div class="loadmore" style="margin:20px auto;text-align:center;font-size:16px;cursor:pointer">'+ 
								moreImg	+ moreTxt + 
							'</div>';
			var _pageStr = '<input type="hidden" id="hide_loadmore_curpage" value="1">';
		 	var _animateStr = '<div class="load_animate" style="margin:20px auto;text-align:center;font-size:16px;"><img src="data:image/gif;base64,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"></div>';
			

			//--------1. 手动点击加载--------
			if(loadMethod == 'click'){
				if(createBool && pcLoadMoreUi.checkJsonHasData(settings.getJson()) ){ //允许下拉，且json有数据时
					settings.curpage = 1; //页码重置为1
					$('#hide_loadmore_curpage').remove(); //删除旧页码节点(刷新操作再次调用本插件时,这一步是必须的)
					//初始化
					$('body').append(_pageStr); //创建新"页码"节点
					settings.getHTML(); //创建"滚动节点内部HTML"
					if(settings.getJson().data.length >= pagesize) $(parent).append(_moreStr); //创建"加载更多"节点
					//滚动高度
					var winH = $(window).height(),
						H = winH - 100;
					if(settings.scrollHeight){
						var h = settings.scrollHeight >= winH ? H : settings.scrollHeight;
						$(parent).attr('style','height:auto; max-height:'+h+'px; overflow-y:auto;');
					}else{
						if($(parent).outerHeight() >= winH) $(parent).css('height', H);
					}
					//点击加载更多
					$(parent).off('click','.loadmore').on('click', '.loadmore', function(){ //off click解除绑定是必须的
						var json = settings.getJson();
						if(pcLoadMoreUi.checkJsonHasData(json)){ //json={data:[]}
							var length = json.data.length;
							if(length < pagesize){
								$(parent).find('.loadmore').remove();
								$(parent).append(_botStr);
								createBool = false; 
								return;
							}else{
								settings.curpage++;
								$('#hide_loadmore_curpage').val(settings.curpage); //页码加1
								if(settings.curpage > 1) $(parent).find('.loadmore').remove(); //删除"加载更多"
								if(settings.animate) $(parent).append(_animateStr); //创建"转圈"
								if(!$.isEmptyObject(json)){
									settings.getHTML(); //继续创建"滚动节点内部HTML"
									setTimeout(function(){
										$(parent).find('.load_animate').remove(); //销毁"转圈"
									},100)
									$(parent).append(_moreStr); //继续创建"加载更多"
								}
							}
						}else{ //json='' 或 json={}
							$(parent).find('.loadmore').remove();
							$(parent).append(_botStr);
							createBool = false; 
							return;
						}
					})		
				}else{
					settings.getHTML();
					$(parent).empty().append('<div class="noDataTips" style="margin:20px auto;text-align:center;font-size:16px;">'+settings.noDataTips+'</div>'); //先清空原有节点数据,再显示无数据的提醒文字
				}
			}
			

			//--------2. 滚动加载--------
			if(loadMethod == 'scroll'){
				if(createBool && pcLoadMoreUi.checkJsonHasData(settings.getJson()) ){ //允许下拉，且json有数据时
					settings.curpage = 1; //页码重置为1
					settings.getHTML();
					if(settings.getJson().data.length >= pagesize){
						showAnimate(); //开始转圈
					}else{
						if($('.load-bottom').length == 0)
						$(parent).append(_botStr);
					}

					var winH = window.screen.height; //$(window).height(); //屏幕高度
					if(scrollRegion == 'window'){ //1.“全局滚动(整个窗口滚动)”
						var dom = window;
						dom.onscroll = function(){
							if(settings.createBool && !$(parent).is(':visible')) settings.createBool = false;
							else{
								if($('.load-bottom').length == 0) settings.createBool = true;
							}
							if(!settings.createBool) return;
							var clientHeight = window.innerHeight || Math.min(document.documentElement.clientHeight,document.body.clientHeight); //窗口可视范围高度
							var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop; //窗口滚动距离
							var scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight); //窗口文档高度（包括超出视窗的溢出部分）
							elementScrollFunc(clientHeight, scrollTop, scrollHeight);
						}
					}else{ //2. “局部滚动”
						var dom = parent[0];
						var contentHeight = 0;
						if(settings.scrollHeight){
							contentHeight = parseFloat(settings.scrollHeight.toString().replace(/[^\d]/g, ''));
						}else{
							contentHeight = parent[0].offsetHeight;
							if(contentHeight > winH) contentHeight = winH;
						}
						dom.setAttribute('style', 'height:auto; max-height:'+ contentHeight +'px; overflow-y:auto;');
						dom.onscroll = function(){
							if(settings.createBool && !$(parent).is(':visible')) settings.createBool = false;
							else{
								if($('.load-bottom').length == 0) settings.createBool = true;
							}
							if(!settings.createBool) return;
							var clientHeight = contentHeight;
							var scrollTop = dom.scrollTop;
							var scrollHeight = 0;
							$(parent).children().each(function(i){
								scrollHeight += $(this).outerHeight(true);
							})
							elementScrollFunc(clientHeight, scrollTop, scrollHeight);
						}
					}
				}else{
					settings.getHTML();
					$(parent).empty().append('<div class="noDataTips" style="margin:20px auto;text-align:center;font-size:16px;">'+settings.noDataTips+'</div>'); //先清空原有节点数据,再显示无数据的提醒文字
				} //END if(createBool)

				
				function elementScrollFunc(clientHeight, scrollTop, scrollHeight){
					//console.log('clientHeight:', clientHeight, '\nscrollTop:', scrollTop, '\nscrollHeight：', scrollHeight);
					if(clientHeight + scrollTop >= scrollHeight){
						var json = settings.getJson();
						destroyAnimate(); //结束转圈
						settings.curpage++;
						$('#hide_loadmore_curpage').val(settings.curpage); //页码加1
						if(!$.isEmptyObject(json)){
							var nowPageDataLen = typeof json.data == 'undefined' ? 0 : json.data.length; //当前页数据条数
							if(nowPageDataLen >= pagesize){
								settings.getHTML(); //继续创建"滚动节点内部HTML"
								showAnimate(); //开始转圈
							}
							else{
								if($('.load-bottom').length == 0) $(parent).append(_botStr);
								settings.createBool = false;
							}
								
						}
					}
				}

				//创建转圈
				function showAnimate(){
					if(settings.animate && $(parent).find('.load_animate').length == 0) $(parent).append(_animateStr); 
				}

				//销毁转圈
				function destroyAnimate(){
					$(parent).find('.load_animate').remove(); //销毁"转圈"
				}
			}






		} 
	});
})(jQuery);




/**--------------------------------------------
* loadMoreUI 对象
-------------------------------------------*/
var pcLoadMoreUi = {
	//函数：判断json对象中的data数组是否有数据(数组或单个数据)有 返回 true; 无 返回 false
	checkJsonHasData:function(json){
		 var flag = true;
		 if(typeof(json)!='object') flag = false; //不是json对象
		 if(typeof(json)=='object' && typeof(json.data)=='undefined') flag = false; //是json对象,但不存在数组
		 if(typeof(json)=='object' && typeof(json.data)!='undefined' && json.data.length<=0) flag = false; //是json对象，也存在数组，但数组长度为0(没数据)
		 return flag;
	}
	
}