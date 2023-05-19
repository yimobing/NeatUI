/**
 * [neatUiCanvas]
 * 前端图片压缩并上传
 * 兼容性：支持火狐、谷歌、360、Microsoft Edge等现代浏览器，IE仅支持IE9+(即IE10、IE11)
 * Author: ChenMufeng
 * Date: 2020.05.07
 * Update: 2023.05.19
 */
(function($){

    ///========================================================================================///
    /*+------------------------------------------------+*/
    /**
     * addEventListener兼容ie低版本
     */
    var Event = {};
    Event.addEvents = function(target, eventType, handle){
        if(document.addEventListener){
            Event.addEvents = function(target, eventType, handle){
                target.addEventListener(eventType, handle, false); //其它浏览器支持addEventListener事件
            };
        }else{
            Event.addEvents = function(target,eventType,handle){
                target.attachEvent('on' + eventType, function(){ //IE8及以下浏览器只支持attachEvent事件
                    handle.call(target, arguments);
                });
            };
        };
        Event.addEvents(target, eventType, handle);
    };
    /*
    * 调用方法如下，其中 document 表示某个document节点，eg.document.getElementById('file')
    eg1. Event.addEvents(document,"click",function(){ alert('ok'); });
    eg2. Event.addEvents(document.getElementById('file'),"click",function(){ alert('ok'); });
    */



    /*+------------------------------------------------+*/
    var uploadFile = function(options){
        var defaults = {
            browserCompatible: false, //是否支持ie10以下的低版本浏览器,默认false
            selector: null, //上传标签dom对象,一般为<input type="file" id="file">标签的dom对象
            events: 'change', //触发上传的事件,默认change
            callBack: null, //回调. callBack:function(arr), 其中 arr格式：[{index:"图片索引", url:"图片base64地址", files:"压缩后图片信息json", oldFiles:"压缩前图片信息json"}]

            maxWidth: 1200, //图片最大宽度(PX),默认1200.(可缺省)
            maxSize: 200, //图片最大质量(KB),默认200.(可缺省)
            minSize: 5, //图片最小质量(KB),默认5.(可缺省)
            quality: 0.7 //压缩系数,0-1之间,默认0.7.(可缺省) 
        }
        var settings = $.extend(true, {}, defaults, options || {});
        var dom = settings.selector,
            browserCompatible = settings.browserCompatible,
            events = settings.events;
        var maxWidth = settings.maxWidth,
            maxSize = settings.maxSize,
            minSize = settings.minSize,
            quality = settings.quality;
        if (typeof (dom) == "string") {
            dom = document.getElementById(dom);
        }
        if(dom == '' || dom == null || typeof dom == 'undefined'){
            alert('找不到上传节点DOM对象\n请检查<input type="file">标签的ID属性值与获取Dom对象的ID是否一致');
            return false;
        }

        //添加功能出发监听事件
        Event.addEvents(dom, events, function(e){
            if(!browserCompatible){
                var version = getInternetExplorerVersion();
                if(version < 10){
                    alert('上传功能不支持当前浏览器！\n您正在使用的是老掉牙的IE' + version + '浏览器，请升级至IE10、IE11，或使用360、谷歌、火狐等现代浏览器');
                    return false;
                }
            }
            var that = this;
            var files = null;
            //var files = e.target.files;
            //alert(e.target.value);
            //console.log('files:', files);
            if(!dom.files){ //不支持files对象（IE10以下浏览器)
                /*
                *1.低版本IE由于JS安全问题，不允许JS访问本地文件,所以无法获取files对象
                对于低版本的IE可以使用ActiveXObject获取文件对象, 但是默认情况下
                ActiveXObject为不可用的, 所以要想使用此对象要先启用设置, 即:
                方法1：
                    Tools(工具) / Internet options(选项) / Security(安全) / Custom level(自定义级别)
                    找到"Initialize and script ActiveX controls not marked as safe for scripting"，设置为"Enable(not secure)"即可.
                方法2：通过js new一个ActiveXObject
                */
                var fso = new ActiveXObject("Scripting.FileSystemObject");
                /*
                * 2.获取文件路径
                出于安全性的考虑，低版本IE上传文件时屏蔽了真实的本地文件路径,
                以C:\fakepath\**取而代之, 所以默认情况下ie8及以下浏览器通过fileEle.value 不能获取到
                文件的真实路径.
                如果想获取真实路径, 有两种方式:
                    1. 通过设置IE的安全设置, 即:
                        Tools(工具) / Internet options(选项) / Security(安全) / Custom level(自定义级别)
                        找到"Include local directory path when uploading files to a server"，设置为"Enable"
                    2. 使用JS获取, 即:
                        fileEle.select().blur();
                        var filePath = document.selection.createRange().text;
                */
                dom.select();
                dom.blur();
                var path = document.selection.createRange().text;
                //3.获取文件对象
                if(fso.FileExists(path)){ //判断文件是否存在
                    files = fso.GetFile(path); //获取文件对象
                }
                //console.info("文件类型:" + files.type);
                //console.info("文件名称:" + files.name);
                //console.info("文件大小:" + files.size);
                compressFile({
                    object: files,
                    maxWidth: maxWidth,
                    index: 0,
                    maxSize: maxSize,
                    minSize: minSize,
                    quality: quality,
                    callBack: function(e){
                        var index = e["index"];
                        arr.push(e);
                        if(index == (len - 1)){
                            if(settings.callBack){ //回调
                                settings.callBack(arr);
                                that.value = ''; //加不加都行，解决无法上传重复图片的问题。
                            }
                        }
                    }
                })

            }else{ 

                files = e.target.files;
                var arr = [];
                var len = files.length;
                for(var k = 0; k < len; k++){
                    var fileObj = files[k];  //var fileObj = files[0]; //this.files[0];
                    //console.log('fileObj:', fileObj);
                    compressFile({
                        object: fileObj,
                        maxWidth: maxWidth,
                        index: k,
                        maxSize: maxSize,
                        minSize: minSize,
                        quality: quality,
                        callBack: function(e){
                            var index = e["index"];
                            arr.push(e);
                            if(index == (len - 1)){
                                if(settings.callBack){ //回调
                                    settings.callBack(arr);
                                    that.value = ''; //加不加都行，解决无法上传重复图片的问题。
                                }
                            }
                        }
                    })
                }
            }

        }, false);



    };





    /*+------------------------------------------------+*/
    /**
     * 利用canvas进行图片压缩，并转化成base64地址
     * @param {*} options 
     */
    var compressFile = function(options){
        var defaults = {
            object: null, //图片对象,一般为<input type="file" id="file">标签已有的files属性,获取方式: $('#file').files[0] 或 this.files[0]
            callBack: null, //回调. callBack:function(e), 其中 e格式：{index:"图片索引", url:"图片base64地址", files:"压缩后图片信息json", oldFiles:"压缩前图片信息json"}

            index:0, //当前图片索引值(用于当有多张图片需要压缩时),默认0(可缺省)
            maxWidth: 1200, //图片最大宽度(PX),默认1200.(可缺省)
            maxSize: 200, //图片最大质量(KB),默认200.(可缺省)
            minSize: 5, //图片最小质量(KB),默认5.(可缺省)
            quality: 0.7 //压缩系数,0-1之间,默认0.7.(可缺省)
        }
        //var settings = $.extend(true, {}, defaults, options || {}); //IE9及以下浏览器不支持深度合并
        var settings = $.extend({}, defaults, options || {});

        var fileObj = settings.object,
            index = settings.index,
            maxWidth = settings.maxWidth,
            maxSize = settings.maxSize,
            minSize = settings.minSize,
            quality = settings.quality;
        //console.log('fileObj:', fileObj);

        //校验类型
        var ieVersion = getInternetExplorerVersion();
        if(ieVersion < 10){ //ie10-
            if (!/[jpg|png|gif|bmp|jpeg](.*?)/.test(fileObj.type.toString().toLocaleLowerCase())) {
                alert("请确保文件为图像类型");
                return false;
            }
        }else{ //not ie or ie9+
            if (!/image\/\w+/.test(fileObj.type)) {
                alert("请确保文件为图像类型");
                return false;
            }
        }

        //开始执行
        var image = new Image();
        var reader = new FileReader();//读取客户端上的文件
        reader.onload = function (e) {
            //var url = reader.result; //读取到的文件内容.这个属性只在读取操作完成之后才有效,并且数据的格式取决于读取操作是由哪个方法发起的.所以必须使用reader.onload，
            //image.src = url; //reader读取的文件内容是base64,利用这个url就能实现上传前预览图片
            image.src = e.target.result;
        }
        reader.readAsDataURL(fileObj); //预览图片
        image.onload = function () {
            //生成比例
            var width = image.width, height = image.height;
            //计算缩放比例
            var rate = 1;
            if (width >= height) {
                if (width > maxWidth) {
                    rate = maxWidth / width;
                }
            } else {
                if (height > maxWidth) {
                    rate = maxWidth / height;
                }
            }
            //生成canvas
            var canvas = document.createElement("canvas");
                context = canvas.getContext("2d"),
                imageWidth = width * rate,
                imageHeight = height * rate;
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            context.drawImage(image, 0, 0, imageWidth, imageHeight);
            /*
            canvas.toDataURL(type, encoderOptions); 
            type 可选, 图片格式，默认为 image/png
            encoderOptions 可选，在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略。
            */
            // edit by chr 20230502
            var cType = fileObj.type; // 'image/png' 或 'image/jpeg' 一定要和原图片的一样,比如原图片是png,如果这里写成jpeg,则会卡死掉
            var base64 = canvas.toDataURL(cType, quality); //转成base64
            //将图片压缩到自己想要的质量KB，quality初始值根据情况自定
            while (base64.length / 1024 > maxSize) { //①高于最大质量(KB)时
                quality -= 0.01;
                base64 = canvas.toDataURL(cType, quality);
            }
            while (base64.length / 1024 < minSize) { //②防止最后一次压缩低于最低质量(KB)，只要quality递减合理，无需考虑
                quality += 0.001;
                base64 = canvas.toDataURL(cType, quality);
            }


            //转成file对象
            /*
            //方法1：base64直接转换成file对象(存在兼容性问题)
            var arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1], 
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) { //转成blob,并更新图片信息
                u8arr[n] = bstr.charCodeAt(n);
            }
            //var files = new window.File([new Blob([u8arr], {type: mime})], 'test.jpeg', {type: 'image/jpeg'}); //转成file
            var files = new File([new Blob([u8arr], {type: mime})], 'test.jpeg', {type: 'image/jpeg'}); //转成file
            */
            //方法2：先将base64转换成blob对象，再将blob对象转换成file对象。
            var files = blobToFile(dataURLtoBlob(base64), fileObj.name);
            
            if(settings.callBack){ //回调,返回图片URL(base64)、图片信息
                settings.callBack({
                    "index": index,
                    "url": base64,
                    "files": files,
                    "oldFiles": fileObj
                })
            }
        }
        
    };




    /*+------------------------------------------------+*/
    /**
     * 获取ie浏览浏览浏览器版本号
     * 如果是ie浏览器则返回对应版本号
     */
    var getInternetExplorerVersion = function(){
        var version = 999;
        if(navigator.appName.toLocaleLowerCase() == 'microsoft internet explorer'){
            version = parseInt(navigator.userAgent.toLocaleLowerCase().split(';')[1].toString().replace(/msie/g, '').replace(/[ ]/g,''));
        }
        return version;
    };



    /*+------------------------------------------------+*/
    //base64直接转化成file对象兼容性问题，故需将base64转换成blob对象，再将blob对象转换成file对象。
    /**
     * 将base64转换为blob对象
     * @param {*} dataurl base64地址
     * @return {*} 返回 blob对象
     */
    var dataURLtoBlob = function(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime });
    }

    /**
     * 将blob对象转换成file对象
     * @param {*} theBlob blob对象
     * @param {*} fileName 文件名
     * 调用方法：blobToFile(dataURLtoBlob(dataurl), fileName)
     */
    var blobToFile = function(theBlob, fileName){
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        theBlob.type = 'image/jpeg';
        return theBlob;
    }








    ///========================================================================================///
    /*+------------------------------------------------+*/
    /**
     * 对外暴露接口
     */
    $.fn.extend({
        uploadFile: uploadFile, //上传文件(内含压缩文件功能)
        compressFile: compressFile //压缩文件
    });


})(jQuery);






/**--------------------------------
 * neuiCanvas对象
 --------------------------------*/
var neuiCanvas = {
    uploadFile: $('body').uploadFile,
    compressFile: $('body').compressFile
}