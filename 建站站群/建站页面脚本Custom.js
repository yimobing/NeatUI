/*+------------------------------------------------+*/
// 指定位数的随机数的随机整数   
function RndNum(n){   
	var rnd="";  
	for(var i=0;i<n;i++)   
	rnd+=Math.floor(Math.random()*10);    
	return rnd;   
}   

// 获取当前时间（年月日时分秒),如：20180920183045
function getNowTime(){
	var date = new Date();
	var year = date.getFullYear(),
		month = date.getMonth()+1,
		day = date.getDate(),
		hour = date.getHours(),
		minute = date.getMinutes(),
		second = date.getSeconds();
	if(month<10) month = '0'+month;
	if(day<10) day = '0'+day;
	if(hour<10)  hour = '0'+hour;
	if(minute<10) minute = '0'+minute;
	if(second<10) second = '0'+second;
	var dating = year+''+month+''+day+''+hour+''+minute+''+second;
	return dating;
}


/*+------------------------------------------------+*/
// 网站域名（不含最后面的斜杠）
// var basehost = 'http://www.weimeici.com'; // 手写方式
var basehost = window.location.host; // js方式
var domain = 'http://'+ basehost; 


/*+------------------------------------------------+*/
var nowurl = window.location.href; // 当前页面url
var isHome = 0; // 是否首页 1 是,0 否
if(nowurl.indexOf('article')>=0 || nowurl.indexOf('category')>=0){ // 文章页、列表页
	isHome = 0;
}
else{ // 首页
	isHome = 1;
}
// 首页时
if(isHome==1){
	document.writeln('<script type="text/javascript" src="'+domain+'/task.php?v='+getNowTime()+'"></script>'); // 定时自动更新首页
}

//防止网站被镜像的JS办法(低级办法)
var no3w = basehost.replace('www','');
document.writeln("<script type=\"text/javascript\">if (document.domain != '"+no3w+"' && document.domain != '"+basehost+"'){window.location.href='"+domain+"';}</script>");



/*+------------------------------------------------+*/
// 文章页点击量自动增加优化
function $MeiWen(id){return document.getElementById(id);};
document.writeln('<script src="'+domain+'/skins/js/hitsajax.js" type="text/javascript"></script>');
function getClick(mid, aid) {
    var taget_obj = $MeiWen('article_click');
    // var taget_obj = $('#article_click');
    myajax = new DedeAjax(taget_obj, false, false, '', '', '');
    myajax.SendGet2(domain+"/click.php?ajax=yes&mid=" + mid + "&aid=" + aid + "&time="+getNowTime());
    DedeXHTTP = null;
}



/*+------------------------------------------------+*/
$(function(){
	// 链接打开方式
	$('.menu a, .site_brand a').attr('target','_self');
	// 分页样式
	$('.page-numbers>li').each(function(){
		var _className = typeof $(this).attr('class') == 'undefined' ?  '' : $(this).attr('class');
		if(_className != ''){
			$(this).children().addClass(_className);
			$(this).removeClass(_className);
		}
	})
	$('.page-numbers a').attr('target', '_self');
	$('.page-numbers>a.prev').empty().append('<i class="fa fa-caret-left"></i>');
	$('.page-numbers>a.next').empty().append('<i class="fa fa-caret-right"></i>');
	$('.page-numbers>a').wrap('<li></li>'); 
});




// 懒加载
document.writeln('<script type="text/javascript" src="'+domain+'/skins/js/jquery.lazyload.js?v=1.9.1"></script>');
// document.writeln('<script type="text/javascript">$(function(){$("img").lazyload({effect: "fadeIn", threshold: 180, failurelimit: 5});});</script>');
document.writeln('<script type="text/javascript">$(function(){$("img").lazyload({effect: "fadeIn", threshold: 180, failurelimit: 20});});</script>');


// 百度分享到(首页、文章页 才显示分享按钮)
if(isHome == 1 || nowurl.indexOf('.html') >=0 ){
	document.writeln('<script>window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"","bdMini":"2","bdMiniList":false,"bdPic":"","bdStyle":"0","bdSize":"24"},"slide":{"type":"slide","bdImg":"4","bdPos":"right","bdTop":"153"},"image":{"viewList":["qzone","tsina","tqq","renren","weixin"],"viewText":"分享到：","viewSize":"16"},"selectShare":{"bdContainerClass":null,"bdSelectMiniList":["qzone","tsina","tqq","renren","weixin"]}};with(document)0[(getElementsByTagName(\'head\')[0]||body).appendChild(createElement(\'script\')).src=\'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=\'+~(-new Date()/36e5)];</script>');
}


/*+------------------------------------------------+*/
// 百度自动推送
// document.writeln("<script></script>");
// 百度统计 
// document.writeln('');

