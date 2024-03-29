/**
 * [neuiLoadmore]
 * 移动端下拉加载更多，上拉刷新控件
 * Author: ChenMufeng
 * Date: 2021.03.31
 * Pudate: 2023.02.08
 */
;(function($){
    // 【名词解释】移动端中,
    // 下滚(下方) + 上拉：滚动条向下滚动↓, 手按按住屏幕向上滑动↑
    // 上滚(上方) + 下拉：滚动条向上滚动↑, 手按钮住屏幕向下滑动↓
    var doc = document;
    var win = window;
    var $doc = $(doc);
    var $win = $(win);

    $.fn.neuiLoadmore = function(options){
        return new MyLoadMore(this, options);
    }


    //================================================
    var MyLoadMore = function(element, options){
        var me = this;
        me.$element = element;

        me.isLockDown = false; // 是否锁定(禁用)下滚. 滚动条↓ 手指↑
        me.isLockUp = false; // 是否锁定(禁用)上滚. 滚动条↑ 手指↓
        me.upInsertDOM = false;   // 上方是否插入DOM,默认false

        me.direction = 'down'; //滚动条滚动方向. down 下滚↓; up 上滚↑
        me.loading = false; // loading状态,默认false
        me.curpage = 0; // 当前页码,默认0
        me.source = {} // 数据源 tet2
        //me._scrollContentHeight = 0; // 文档高度
        //me._scrollWindowHeight = 0; // 可视高度
        me._scrollTop = 0; // 滚动距离,默认0
        me._threshold = 0; // 预加载距离,默认0
        me.isData = true; // 是否有数据,默认true
        //
        me.init(options);
    }
    
    MyLoadMore.prototype.init = function(options){
        var me = this;
        var defaults = {
            scrollArea: me.$element, // 滑动区域, 默认绑定元素自身(可选). 值：window(全局滚动), 'self' 绑定元素自身(局部滚动), '.content' 绑定特定class'content'的节点。// test1
            scrollHeight: 0, // 自定义滑动区域高度,默认0(可选). 当scrollArea绑定的元素不是window时,则必须手动设置本参数值,否则控件不会执行.

            // 列表有多个拼接根节点时
            pingSelector: '', // 自定义列表拼接根DOM节点,默认空(可选). 一般用于TAB选项卡且列表拼接根节点有多个时. eg.['.dom1', '.dom2']
            // 注②：当 autoLoad=true, cleanUp=true 时, 则：页面一打开就会清空滑动区域已有数据,且马上加载第1页数据
            autoLoad: true, // 是否自动加载,默认true(可选). true时如果文档高度小于可视高度无须下滚就会自动加载第1页数据, false时须下滚才加载第1页数据
            cleanUp: true, // 是否先清空滑动区域已有数据,默认true(可选). true时只对第1页有效
            
            pagesize: 20, // 每页记录数,默认20条(可选).
            threshold: 50, // 预加载距离,即提前加载距离(可选).比如到底部边缘上方50px时提前加载
            distance: 50, // 拉动距离,默认50(可选). 用于解决“由于部分Android中UC和QQ浏览器头部有地址栏，并且一开始滑动页面隐藏地址栏时，无法触发scroll和resize”的Bug
            delay: 0, // 转圈延迟时间,默认0(可选). 单位毫秒。用于前端无ajax时测度数据用，设置此值即可看到转圈效果.
            labelDown: { // 下滚文本(可选)
                more: '↑上拉加载更多', // 底部时默认文字(可选)
                load: '加载中', // 加载(可选)
                nodata: '抱歉，暂无数据', // 无数据(第1页就没有数据)(可选)
                empty: '没有更多了'// 没有更多了(第2,3,4..页时没有数据)(可选)
            },
            labelUp: { // 上滚文本(可选)
                more: '↓下拉刷新',
                update: '↑释放更新',
                load: '加载中'
            },
            getData: function(e){ },  //从前台获取并返回数据源. 参数e为当前页码等组成的一维对象
            loadDownFn: '', // 下方函数,默认空(可选). 参数e为数据源、当前页码等组成的一维对象
            loadUpFn : '' // 上方函数,默认空(可选). 参数e为数据源、当前页码等组成的一维对象
        }
        me.opts = $.extend(true, {}, defaults, options || {});
                    
        // 当前元素添加自定义的CLASS属性
        me.$element.addClass('neRoll__slide');

        // 设置HTML节点
        me.opts.root = 'ne__rolling';
        me.opts.domDown = { //下滚文本
            father: 'neRoll__down',
            more: '<div class="neRoll__more">' + me.opts.labelDown.more + '</div>',
            load: '<div class="neRoll__load"><span class="loading"></span><em>' + me.opts.labelDown.load + '</em></div>',
            nodata: '<div class="neRoll__nodata">' + me.opts.labelDown.nodata + '</div>',
            empty: '<div class="neRoll__empty">' + me.opts.labelDown.empty + '</div>'
        }
        me.opts.domUp = {
            father: 'neRoll__up',
            more: '<div class="neRoll__more">' + me.opts.labelUp.more + '</div>',
            update: '<div class="neRoll__update">' + me.opts.labelUp.update + '</div>',
            load: '<div class="neRoll__load"><span class="loading"></span><em>' + me.opts.labelUp.load + '</em></div>'
        }


        // test1
        var pingArr = me.opts.pingSelector;
        var isMutipleDom = false; // 是否有多个拼接节点
        if(pingArr != '' && pingArr instanceof Array){
            isMutipleDom = pingArr.length > 1 ? true : false;
        }
        
        // 使用iframe嵌入页面(即当前页面被嵌入到某个父页面中)，且当前设备为ios苹果手机时
        if (top.location != self.location && /iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())){
            if(me.opts.scrollArea == win){
                me.opts.scrollArea = 'self';
            }
		}
        

        // 设定滚动区域节点，scrollArea 参数值不为 windows时 add by chr 20230202
        if(me.opts.scrollArea != win){
            // test1 test2
            // me.opts.scrollArea = me.$element;
            if(isMutipleDom){// 多个拼接根节点时
                if(me.opts.scrollArea == 'self'){ // 默认绑定的元素自身
                    if($('.ne__roll_area').length == 0) me.$element.siblings().andSelf().wrapAll('<div class="ne__roll_area"></div>');
                    me.opts.scrollArea = $('.ne__roll_area');
                } 
                else{ // 绑定前台指定的节点
                    me.opts.scrollArea = $(me.opts.scrollArea); 
                }
            }
            else{
                if(me.opts.scrollArea == 'self'){ // 默认绑定的元素自身
                    if($('.ne__roll_area').length == 0) me.$element.wrap('<div class="ne__roll_area"></div>');
                    me.opts.scrollArea = $('.ne__roll_area');
                } 
                else{ // 绑定前台指定的节点
                    me.opts.scrollArea = $(me.opts.scrollArea); 
                }
                // console.log('scrollArea：', me.opts.scrollArea);
            }
        }

        // 若是下滚，则事先在下方插入DOM
        if(me.opts.loadDownFn != ''){
            // me.$element.wrap('<div class="' + me.opts.root + '"></div>');
            // me.$element.after('<div class="' + me.opts.domDown.father + '">'+ me.opts.domDown.more + '</div>');
            // me.$domRoot = $('.' + me.opts.root);
            // me.$domDown = $('.' + me.opts.domDown.father);

            // test1
            // console.log('scrollArea：', me.opts.scrollArea);
            if(isMutipleDom){ // 多个拼接根节点时
                if(me.opts.scrollArea == win){
                    if($('.' + me.opts.root).length == 0)
                        me.$element.siblings().andSelf().wrapAll('<div class="' + me.opts.root + '"></div>');
                    else
                        me.$element.parent().next().remove();
                    me.$element.parent().after('<div class="' + me.opts.domDown.father + '">'+ me.opts.domDown.more + '</div>');
                }
                else{ 
                    // test2
                    if($('.' + me.opts.root).length == 0)
                        me.opts.scrollArea.wrap('<div class="' + me.opts.root + '"></div>');
                    else
                        me.opts.scrollArea.children(':last-child').remove();
                    me.opts.scrollArea.append('<div class="' + me.opts.domDown.father + '">'+ me.opts.domDown.more + '</div>');
                }
            }else{ // 单个拼接根节点
                if(me.opts.scrollArea == win){
                    if($('.' + me.opts.root).length == 0)
                        me.$element.wrap('<div class="' + me.opts.root + '"></div>');
                    else
                        me.$element.next().remove();
                    me.$element.after('<div class="' + me.opts.domDown.father + '">'+ me.opts.domDown.more + '</div>');
                }
                else{
                    if($('.' + me.opts.root).length == 0)
                        me.opts.scrollArea.wrap('<div class="' + me.opts.root + '"></div>');
                    else
                        me.opts.scrollArea.children(':last-child').remove();
                    me.opts.scrollArea.append('<div class="' + me.opts.domDown.father + '">'+ me.opts.domDown.more + '</div>');
                }
            }
            me.$domRoot = $('.' + me.opts.root);
            me.$domDown = $('.' + me.opts.domDown.father);
        }

      
        // 计算预加载距离
        if(me.opts.threshold === ''){
            me._threshold = Math.floor(me.$domDown.height() * 1/3); //默认滑到加载区2/3处时加载
        }else{
            me._threshold = me.opts.threshold;
        }


        // 判断滚动区域，设置初始文档高度、可视高度
        if(me.opts.scrollArea == win || me.opts.scrollArea == 'window'){ // 滑动区域为WINDOWs
            me.$scrollArea = $win;
            me._scrollContentHeight = doc.documentElement.clientHeight || doc.body.clientHeight; // 获取win显示区高度  —— 这里有坑
            //!!!一定不要使用下面这句,否则真实环境下会有问题
             // me._scrollContentHeight = $doc.height(); //或doc.documentElement.scrollHeight || doc.body.scrollHeight; //文档高度
            me._scrollWindowHeight =  $win.height(); // win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight; //可视高度

        }else{ // 滑动区域为元素自身，则必须手动设定高度
            // test1
            // var SH = me.opts.scrollHeight === '' ? 0 : Math.floor(me.opts.scrollHeight.toString().replace(/px/g, ''));
            // //console.log('滑动区域高度:', SH, '\n视窗高度：', $win.height())
            // if(SH == 0 || SH > $win.height()){
            //     var error = '请设置滑动区域高度，scrollHeight参数值必须大于0.\n注意：最大高度不能大于WINDOWS视窗高度：$(window).height()';
            //     alert(error);
            //     console.log(error);
            //     return;
            // }else{
            //     me.$element.css({
            //         'height': SH,
            //         'overflow-y': 'auto',
            //         '-webkit-overflow-scrolling': 'touch'
            //     })
            // }

            // me.$scrollArea = me.opts.scrollArea instanceof jQuery ? me.opts.scrollArea : $(me.opts.scrollArea);
            // me._scrollContentHeight = me.$element[0].scrollHeight; //文档高度
            // me._scrollWindowHeight = me.$element.height(); //可视高度
            // //console.log('可视高度：', me.$element.css('height'))

            me.$scrollArea = me.opts.scrollArea instanceof jQuery ? me.opts.scrollArea : $(me.opts.scrollArea);
            var SH = me.opts.scrollHeight === '' ? 0 : Math.floor(me.opts.scrollHeight.toString().replace(/px/g, ''));
            //console.log('滑动区域高度:', SH, '\n视窗高度：', $win.height())
            if(SH == 0 || SH > $win.height()){
                var error = '请设置滑动区域高度，scrollHeight参数值必须大于0.\n注意：最大高度不能大于WINDOWS视窗高度：$(window).height()';
                alert(error);
                console.log(error);
                return;
            }else{
                me.$scrollArea.css({
                    'height': SH,
                    'overflow-y': 'auto',
                    '-webkit-overflow-scrolling': 'touch'
                })
            }
            me._scrollContentHeight = me.$scrollArea[0].scrollHeight; //文档高度
            me._scrollWindowHeight = me.$scrollArea.height(); //可视高度
            //console.log('可视高度：', me.$scrollArea.css('height'))
        }

    
        
        // 清空滑动区域已有数据
        fnClearHistory(me);

        // 自动加载
        fnAutoLoad(me);
     
        // 窗口调整
        $win.on('resize', function(){
            clearTimeout(me.timer);
            me.timer = setTimeout(function(){
                if(me.opts.scrollArea == win){
                    me._scrollWindowHeight = win.innerHeight; // 重新获取win可视区域高
                }else{
                    // test1
                    // me._scrollWindowHeight = me.$element.height();
                    me._scrollWindowHeight = me.$scrollArea.height();
                }
                fnAutoLoad(me);
            }, 150)
        });


        //--------START ios bug：当前页面被iframe嵌入时, $(window)对象可能会被识别为父页面的对象，导致$(window).on('scroll')不执行 edit by chr 20230202
        /* if (top.location != self.location && /iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())){ // 使用iframe嵌入页面(即当前页面被嵌入到某个父页面中)，且当前设备为ios苹果手机时
            if(me.$scrollArea == $win){
                // window.location.host非空表示是web目录，空值表示页面直接打开(此时window.parent.document会涉及跨域报错问题)
                var $obj = window.location.host !== '' ? $('iframe', window.parent.document) : $(window);
                var h = $obj.height();
                $('html, body').css({
                    'overflow-y': 'scroll',
                    '-webkit-overflow-scrolling': 'touch',
                    'height': h
                })
                me.$scrollArea = $('body'); // 把滚动区域设为body即可
            }
		} */
        //--------END IOS BUG

        // 加载下滚 
        // Bug注意: 要先off一下,否则在多个选项卡中当每页记录数数比较大(比如20条),会出现未滚动到底部就多次加载数据导致系统卡顿
        me.$scrollArea.off('scroll').on('scroll', function(){
            me._scrollTop = me.$scrollArea.scrollTop(); //滚动距离
            //console.log('me.loading:', me.loading); //tet1
            //console.log('me.loading:', me.loading, '\nme.isLockDown:',me.isLockDown, '\n值是否小于：', (me._scrollContentHeight - me._threshold) <= (me._scrollWindowHeight + me._scrollTop)); //tet1
            // console.log('文档高：', me._scrollContentHeight, '\n预加载高：',me._threshold, '\nDomDown高：', me.$domDown.height(), '\n可视高：', me._scrollWindowHeight, '\n滚动距离：',me._scrollTop);
            // alert('文档高：'+ me._scrollContentHeight+ '\n预加载高：'+me._threshold+ '\nDomDown高：'+ me.$domDown.height()+ '\n可视高：'+ me._scrollWindowHeight+ '\n滚动距离：'+me._scrollTop);

            //test1
            // if(me.opts.loadDownFn != '' && !me.loading  && !me.isLockDown && (me._scrollContentHeight - me._threshold) <= (me._scrollWindowHeight + me._scrollTop)){
            if(me.opts.loadDownFn != '' && !me.loading  && !me.isLockDown && (me._scrollContentHeight - me._threshold - me.$domDown.height()) <= (me._scrollWindowHeight + me._scrollTop)){
                //console.log('我要开始滚动了');
                fnToDown(me);
            }
        });
        


        // 加载上滚,绑定触摸
        me.$element.on('touchstart', function(e){
            if(!me.loading){
                fnTouches(e);
                fnTouchstart(e, me);
            }
        })
        me.$element.on('touchmove', function(e){
            if(!me.loading){
                fnTouches(e);
                fnTouchmove(e, me);
            }
        })
        me.$element.on('touchend', function(e){
            if(!me.loading){
                fnTouchend(me);
            }
        })
  
    };


     // 重置加载
     MyLoadMore.prototype.resetLoad = function(){
        var me = this;
        if(me.direction == 'up' && me.upInsertDOM){ //上滚时
            me.$domUp.css({'height':'0'}).on('webkitTransitionEnd mozTransitionEnd transitionend', function(){
                me.loading = false;
                me.upInsertDOM = false;
                $(this).remove();
                
                // console.log('me.isData:', me.isData)
                me.$domDown.show(); // 显示下方提示文字 tet1
                if(me.isData){ // 有数据
                    me.$domDown.html(me.opts.domDown.more); // 重置下方DOM
                    fnRecoverContentHeight(me);
                }else{
                    setTimeout(function(){ //给一个小延迟,以显示转圈再销毁转圈
                        if(me.curpage == 1 && me.opts.cleanUp && fnCheckZeroData(me.source, me)) //tet2
                            me.$domDown.html(me.opts.domDown.nodata);
                        else
                            me.$domDown.html(me.opts.domDown.empty);
                    }, Math.floor(me.opts.delay))
                }
            })
        }else if(me.direction == 'down'){ // 下滚时
            me.loading = false; // loading状态置为false
            if(me.isData){ // 有数据
                me.$domDown.html(me.opts.domDown.more);
                fnRecoverContentHeight(me); // 重置文档高度
                //fnAutoLoad(me); // 继续自动加载
            }else{ // 无数据
                // test1 下N行
                var delays = Math.floor(me.opts.delay) > 500 ? Math.floor(me.opts.delay) : 1000;
                setTimeout(function(){ //给一个小延迟,以显示转圈再销毁转圈
                    if(me.curpage == 1 && me.opts.cleanUp && fnCheckZeroData(me.source, me)) //tet2
                        me.$domDown.html(me.opts.domDown.nodata);
                    else
                        me.$domDown.html(me.opts.domDown.empty);
                }, delays);
            }
        }
    };

    /**
     * 无数据
     * @param {boolean} flag 布尔值(可选). true 无数据(默认), false 有数据
     */
    MyLoadMore.prototype.noneData = function(flag){
        var me = this;
        if(flag === undefined || flag == true){
            me.isData = false; //无数据了
        }else{
            me.isData = true; //依然有数据
        }
    };

    /**
     * 锁定,禁用滚动,不再滚动.
     * @param {string} direction 要锁定的滚动方向. up 上滚 down 下滚
     */
    MyLoadMore.prototype.lock = function(direction){
        var me = this;
        //me.isLockDown = true; //锁定
        if(direction === undefined){ // 不指定锁定的滚动方向
            if(me.direction == 'up'){ // 上滚
                me.isLockUp = true;
            }else if(me.direction == 'down'){ //上滚
                me.isLockDown = true;
            }else{
                me.isLockUp = true;
                me.isLockDown = true;
            }
        }else if(direction == 'up'){ // 指定锁定上滚
            me.isLockUp = true;
        }else if(direction == 'down'){ // 指定锁定下滚
            me.isLockDown = true;
            me.direction = 'down'; // 为解决DEMO5中tab效果bug，因为滑动到下面，再滑上去点tab，direction=up，所以有bug
        }
    };


    // 解锁滚动、解禁滚动
    MyLoadMore.prototype.unlock = function(){
        var me = this;
        me.isLockDown = false;
        me.isLockUp = false;
        me.direction = 'down';  // 为解决DEMO5中tab效果bug，因为滑动到下面，再滑上去点tab，direction=up，所以有bug
    };


    
    //================================================
    //                  下滚事件
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
        if(me.opts.loadDownFn != '' && me.opts.autoLoad){
            //console.log('aaa')
            //console.log('文档高度：', me._scrollContentHeight, '\n预加载高度：', me._threshold, '\n可视高度：', me._scrollWindowHeight);
            if( (me._scrollContentHeight - me._threshold) <= me._scrollWindowHeight){
                //console.log('222')
                fnToDown(me);
            }
        }
    }

    // 下滚函数
    // 使用Promise对象解决ajax异步问题
    function fnToDown(me){
        me.direction = 'down';
        //开始加载
        me.loading = true; // loading状态置为true
        me.curpage++; // 页码加1
        // alert('curpage：' + me.curpage); //test1
        me.$domDown.show(); // 显示下方提示文字 tet1
        me.$domDown.html(me.opts.domDown.load);

        // ·从前台获取数据
        // 使用setTimeout解决Bug：当获取数据时ajax为同步(async=false)请求时线程阻塞会使得代码前后改变元素的操作(如.append,.html)的UI线程也被阴塞掉(此时操作不起作用或效果被延迟出现). 这里如不使用setTimeout,loading效果将不会延迟显示,很诡异!!!
        // 一般的，前台获取数据的AJAX使用异步取数(async=true)时,即可避免本Bug
        setTimeout(function(){
            var result = me.opts.getData({curpage: me.curpage});
            if(typeof result == 'undefined'){
                alert('前台写法错误，请检查获取数据的函数是否有返回值！');
            }
            if(result instanceof Promise){ // Promise对象
                result.then(function(res){
                    runDown(res);
                }).catch(function(err){
                    alert(err);
                })
            }
            else if(typeof result.promise != 'undefined'){ // JQ Deferred对象
                $.when(result).done(function(res){
                    runDown(res);
                }).fail(function(err){
                    alert('ERROR，出错啦');
                })
            }
            else{ // 普通JSON对象
                runDown(result);
            }

        }, 0)


        function runDown(source){
            me.source = source; //tet2
            if(!fnCheckHasData(source, me)){
                me.lock();
                me.noneData(true);
            }
            var callback = { curpage: me.curpage, source: source }
            if(me.opts.delay === 0 || me.opts.delay === ''){
                fnLoadDataDown(me, callback);
            }else{
                setTimeout(function(){
                    fnLoadDataDown(me, callback);
                }, Math.floor(me.opts.delay))
            }
        }
    }



    // 加载下滚数据
    function fnLoadDataDown(me, callback){
        me.opts.loadDownFn(callback);
        me.resetLoad();
    }




 


    //================================================
    //                  上滚事件
    //================================================
    // touches
    function fnTouches(e){
        if(!e.touches){
            e.touches = e.originalEvent.touches;
        }
    }

    // touchstart
    function fnTouchstart(e, me){
        me._startY = e.touches[0].pageY;
        me.touchScrollTop = me.$scrollArea.scrollTop();  // 记住触摸时的scrolltop值
    }

    // touchmove
    function fnTouchmove(e, me){
        me._curY = e.touches[0].pageY;
        me._moveY = me._curY - me._startY;
        if(me._moveY > 0){ //手指向下滑动
            me.direction = 'up';
        }else if(me._moveY < 0){ //手指向上滑动
            me.direction = 'down';
        }
        var _absMoveY = Math.abs(me._moveY); // 取绝对值
        // 加载上方
        if(me.opts.loadUpFn != '' && me.touchScrollTop <= 0 && me.direction == 'up' && !me.isLockUp){
            e.preventDefault();
            me.$domUp = $('.' + me.opts.domUp.father);
            if(!me.upInsertDOM){  // 如果加载区没有DOM
                if($('.' + me.opts.domUp.father).length == 0) {
                    // test1
                    // me.$element.before('<div class="' + me.opts.domUp.father + '"></div>');
                    if(me.opts.scrollArea == win){
                        me.$element.before('<div class="' + me.opts.domUp.father + '"></div>');
                    }
                    else{
                        me.$scrollArea.prepend('<div class="' + me.opts.domUp.father + '"></div>');
                    }
                }
                me.upInsertDOM = true;
            }
            fnTransition(me.$domUp, 0);
            // 下拉
            if(_absMoveY <= me.opts.distance){ // 指定距离 <= 下拉距离
                me._offsetY = _absMoveY;
                me.$domUp.html(me.opts.domUp.more); // todo：move时会不断清空、增加dom，有可能影响性能，下同
            }else if(_absMoveY > me.opts.distance && _absMoveY <= me.opts.distance * 2){  // 指定距离 > 下拉距离, 但 <= 指定距离*2
                me._offsetY = me.opts.distance + (_absMoveY-me.opts.distance) * 0.5;
                me.$domUp.html(me.opts.domUp.update);
            }else{  // 下拉距离 > 指定距离*2
                me._offsetY = me.opts.distance + me.opts.distance * 0.5 + (_absMoveY-me.opts.distance * 2) * 0.2;
            }
            me.$domUp.css({'height': me._offsetY});
        }
    }

    // touchend
    function fnTouchend(me){
        var _absMoveY = Math.abs(me._moveY);
        if(me.opts.loadUpFn != '' && me.touchScrollTop <= 0 && me.direction == 'up' && !me.isLockUp){
            fnTransition(me.$domUp, 300);
            if(_absMoveY > me.opts.distance){
                fnToUp(me);
            }else{
                me.$domUp.css({'height':'0'}).on('webkitTransitionEnd mozTransitionEnd transitionend',function(){
                    me.upInsertDOM = false;
                    $(this).remove();
                });
            }
            me._moveY = 0;
        }
    }


    // 上滚函数
    // 使用Promise异步获取数据
    function fnToUp(me){
        //开始加载
        me.loading = true;
        me.curpage = 1; // 重置页码为1
        me.$domUp.css({'height': me.$domUp.children().height()});
        me.$domUp.html(me.opts.domUp.load);
        me.$domDown.hide(); // 隐藏下方提示文字 tet1
        me.$element.empty(); // 清空滑动区域数据
        // 从前台获取数据
        var result = me.opts.getData({curpage: me.curpage});
        if(result instanceof Promise){
            result.then(function(res){
                runUp(res);
            }).catch(function(err){
                alert(err);
            })
        }else{
            runUp(result);
        }
        function runUp(source){
            me.source = source; //tet2
            var callback = { curpage: me.curpage, source: source } //回调参数
            if(me.opts.delay === 0 || me.opts.delay === ''){
                fnLoadDataUp(source, me, callback);
            }else{
                setTimeout(function(){
                    fnLoadDataUp(source, me, callback);
                }, parseInt(me.opts.delay))
            }
        }
    }

    // 加载上滚数据     
    function fnLoadDataUp(source, me, callback){
        if(!fnCheckHasData(source, me)){ //tet1
            //me.lock();
            me.noneData(true);
        }else{
            me.noneData(false);
        }
        me.opts.loadUpFn(callback);
        me.resetLoad();
        if(fnCheckHasData(source, me)) me.unlock(); // 解锁loadDownFn里锁定的情况 edit 20220524-1
        // me.noneData(false); // 解锁loadDownFn里无数据的情况 tet1
    }
  





    
    //================================================
    //                   公共库
    //================================================
    /**
     * 重置文档高度
     * @param {object} me 控件参数对象
     */
    function fnRecoverContentHeight(me){
        if(me.opts.scrollArea == win){
            me._scrollContentHeight = $doc.height(); //或 doc.documentElement.scrollHeight || doc.body.scrollHeight; //文档高度
            //!!!!一定不要使用下面这句,否则真实环境下会出问题
            // me._scrollContentHeight = doc.documentElement.clientHeight || doc.body.clientHeight; // 获取win显示区高度  —— 这里有坑

        }else{
            me._scrollContentHeight = me.$element[0].scrollHeight;
        }
    }


    /**
     * css过渡
     * @param {object} dom DOM的JQ对象
     * @param {number} num 完成效果的时间(单位:毫秒)
     */
    function fnTransition(dom,num){
        dom.css({
            '-webkit-transition':'all ' + num + 'ms',
            'transition':'all ' + num + 'ms'
        });
    }


    /**
     * 校验数据源是否有数据
     * @param {object} ps_source 数据源
     * @param {object} ps_me 当前插件对象
     * @returns {boolean} 返回布尔值. true 有, false 无
     */
    function fnCheckHasData(ps_source, ps_me){
        if(!ps_source || $.isEmptyObject(ps_source)) return false;
        if(typeof ps_source.data == 'undefined') return false;
        if(ps_source.data.length == 0) return false;
        if(ps_source.data.length < ps_me.opts.pagesize) return false;
        return true;
    }

    /**
     * 判断数据源是否为空
     * @param {object} ps_source 
     * @param {object} ps_me 当前插件对象
     * @returns {boolean} 返回布尔值。 true 数据源为空, false 数据源非空(至少有1条数据)
     */
    function fnCheckZeroData(ps_source, ps_me){
        if(!ps_source || $.isEmptyObject(ps_source)) return true;
        if(typeof ps_source.data == 'undefined') return true;
        if(ps_source.data.length == 0) return true;
        return false;
    }


})(window.jQuery);