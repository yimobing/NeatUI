/**
 * [neuiPullmore]
 * 移动端下拉加载更多控件
 * 说明：本控件模拟微信聊天历史记录
 * Author: ChenMufeng
 * Date: 2021.04.02
 * Update: 2021.04.06
 */

(function($){
    // 【名词解释】移动端中,
    // 下滚(下方) + 上拉：滚动条向下滚动↓, 手按按住屏幕向上滑动↑
    // 上滚(上方) + 下拉：滚动条向上滚动↑, 手按钮住屏幕向下滑动↓

    var $win = $(window);
    var $doc = $(document);

    $.fn.neuiPullmore = function(options){
        return new MyPullMore(this, options);
    };

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
        me.$element.wrap('<div class="' + me.opts.root + '"></div>');
        me.$element.before('<div class="' + me.opts.nodeUp.father + '"></div>');
        me.$domRoot = $('.' + me.opts.root);
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
                var error = '请设置滑动区域高度，scrollHeight参数值必须大于0.\n注意：最大高度不能大于WINDOWS视窗高度：$(window).height()';
                alert(error);
                console.log(error);
                return;
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
        //setTimeout(function(){
            var y = me._scrollContentHeight - me._scrollWindowHeight;
            me.$scrollArea[0].scrollTo({
                top: y, //y轴
                behavior: "instant" //smooth 平滑滚动, instant 瞬间滚动,默认值auto
            })
       //}, 100)

      

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
        var _cellH = me.$element.children().eq(0).outerHeight(); //每条记录的高度
        var _topH = me.opts.scrollArea == window ? me._offsetTop : 0;
        var _yPos = _cellH * (me.opts.pagesize - 1) + _topH;
        //console.log('每条记录高度：',_cellH, '\n总高度：', _yPos);
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




})(jQuery);