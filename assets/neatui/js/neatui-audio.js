/**
 * 音视频播放控件
 * Author：ChenMufeng
 * Date: 2022.06.24
 * Pubdate: 2022.06.24
 */


;(function($){

    $.fn.extend = function(options){
        return new MyAudioPlay(this, options);
    }

    
    var MyAudioPlay = function(element, options){
        var audio, media;
        var me = this;
        me.$element = element;
        me.init(options);
    }


      
    //————————————————————————————————————————————————————————————————————————————————
    //                                       原型对象    
    //————————————————————————————————————————————————————————————————————————————————
    MyAudioPlay.prototype.init = function(options){
        var me = this;
        // 参数
        var defaults = {
            // 音频源
            source: [ ], // 声音文件名称(数组)
            path: '', // 声音文件相对路径(可选)
            sound: '', // 默认声音文件(可选)
            // 节点
            audioNode: '', // 音频节点(可选)，默认空。空时系统将在body中自动创建一串音频代码用于播放音频
            audioVisible: true, // 音频节点是否可见，默认true(可选)
            // 播放条件
            delay: 3, // 延迟多少时间才自动播放(即页面加载完成后多久开始播放声音)，默认3秒(可选)
            auto: false, // 是否自动播放，默认false(可选)
            loop: false, // 是否循环播放，默认false(可选)
            // 定时器
            timing: false, // 是否定时播放，默认false(可选)
            intervals: 10, // 定时器间隔(播放间隔时长)。单位秒，默认10(可选)
            // 回调
            playBack: function(){ // 开始播放回调(可选)

            },
            pauseBack: function(){ // 暂停播放回调(可选)

            },
            stopBack: function(){ // 停止播放回调(可选)

            },
            skipBack: function(){ // 跳转播放回调(可选)

            }
        }

        me.opts = $.extend(true, {}, defaults, options || {});
        me.$media = me.opts.audioNode;
        me.$source = me.$media.find('source');

        // 马上播放
        if(me.opts.sound && me.opts.auto){
            var initTimes = parseInt(me.opts.delay);
            var count = 1; // 计数器
            var sh = setInterval(function(){
                count++;
                if(count % initTimes == 0){ // 取余(整数倍)
                    me.play(me.opts.sound);
                    // 只执行一次就把定时器销毁，以免系统卡顿
                    clearInterval(sh);
                    sh = null;
                }
            }, 1000);
        }

        // 定时播放
        if(me.opts.timing){
            // var duration = 0; // 音频时长(秒) 
            var timer = setInterval(function() {
                playSound(me, me.opts.sound);
            },  parseFloat(me.opts.intervals) * 1000);
        }
    };





    /**
     * 播放音频
     */
    MyAudioPlay.prototype.play = function(mp3){
        var me = this;
        var id = $(me.opts.audioNode).find('audio').attr('id');
        var media = document.getElementById(id);

        if (window.WeixinJSBridge) {
            WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                media.play();
            }, false);
        } else {
            document.addEventListener("WeixinJSBridgeReady", function () {
                WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                    media.play();
                });
            }, false);
        }
        playSound(me, mp3);
        media.play(); // 必须,否则在非微信中(即手机内置浏览器中)打开时不会播放
    };




      
    //————————————————————————————————————————————————————————————————————————————————
    //                                       函数体       
    //————————————————————————————————————————————————————————————————————————————————
    /**
     * 播放声音操作
     * @param {string} mp3 音频文件(相对地址或绝对地址)
     */
    function playSound(me, mp3){
        if(typeof mp3 == 'undefined') mp3 = '';
        // 1.电脑端、安卓这样就可以自动播放了
        me.$source[0].src = mp3;
        
        // 2.准备开始播放时(这段代码并非必须,加上比较保险)
        media.oncanplay = function(){
            media.play(); 
            // alert("hi,声音准备开始播放了");
        }

        // 3.自动播放兼容：苹果iphone(ios)中内置浏览器safri直接播放音频
        // 实测：对大部分ios版本用内置浏览器或在微信中打开网页都有效
        // 说明1：iphone浏览器safri需等待用户交互动作后才能播放media,即如果你没有得到用户的action就播放的话就会被safri拦截
        // 说明2：本方案其实是个障眼法，因为一般人打开手机网站手指总会不经意就碰到屏幕
        if (/iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())) {
            //$('html,body').on('touchstart', function() { //总是
            $('html,body').one('touchstart', function() { //只一次        
                media.play(); 
            })
        }

        // 4.自动播放兼容：苹果iphone(ios)部分ios版本可能要先load下才能播放       
        media.load();  

        // 5.自动播放兼容：微信中打开时在苹果iphone(ios)中自动播放音频
        // 一般须在head标签中引入微信的js：http://res.wx.qq.com/open/js/jweixin-1.0.0.js，且在微信Weixin JSAPI的WeixinJSBridgeReady才能生效。
        // 注意1：WeixinJSBridgeReady只会触发一次，若微信已经ready了，但还没执行到你监听这个ready事件的代码，那么你的监听是没用的，
        // 注意2：WeixinJSBridgeReady只适合一开始就自动播放声音，若你是做那种微信场景（打开页面模拟收到很多条微信，每条微信都要播放那段音效）或初始化故意延时几秒才播放声音，实际上这种兼容方案也是无效的
        // 注意3：若监听里面添加alert调试,一般在微信中打开链接是不会alert的，而是刷新页面时才会alert出来
        // 注意4：若删了下面代码,在微信中部分iphone(ios)版本是不会自动播放声音的     
        document.addEventListener("WeixinJSBridgeReady", function () { 
            media.play();  
            // alert("Hi,微信中的部分苹果iphone(ios)版本");
        }, false);
    }








    //————————————————————————————————————————————————————————————————————————————————
    //                                       工具箱       
    //————————————————————————————————————————————————————————————————————————————————
    var tools = {
        /**
         * 获取音频节点代码
         * @returns {HTML} 返回HTML代码
         */
        createAudioCode: function(){
            return [
                '<audio id="audio" controls="controls" autoplay="autoplay">',
                    '<source src="" type="audio/mpeg"/>',
                    '抱歉，当前设备不支持音频文件',
                '</audio>'
            ].join('\r\n')
        }
    }







})(jQuery);




// ;(function root(root, factory){
//     if(typeof define === 'function' && define.amd){
//         define(factory);
//     }else if(typeof exports === 'object'){
//         module.exports = factory();
//     }else{
//         window.neuiAudioPlay = factory();
//     }
// })(this, function(){




//     return neuiAudioPlay;
// });