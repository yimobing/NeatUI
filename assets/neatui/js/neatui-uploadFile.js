/**
 * [NeUploadFile]
 * !! 文件上传控件
 * [功能] 支持批量上传图片、PDF、EXCEL、WORD等文件(需后端配合写接口)
 * [开发方式] 原生JS开发，无须jq
 * [兼容性] 支持chrome, 火狐、ie8+等浏览器
 * Version：v1.0.0
 * Author: MuFeng
 * Date: 2023.05.24
 * Update: 2023.05.29
 */
//================================================================================================
//              一、控件开始
//================================================================================================
;(function(root, factory){
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.NeUploadFile = factory();
    }
})(this, function(){

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  开始调用
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var NeUploadFile = function(){
        var me = this;
        /**
         * !! 控件初始化
         * @param {string} elem 绑定的节点，如'#app', '.app'
         * @apram {string} options 控件参数
         */
        this.init = function(elem, options){
            var opts = typeof (options) === "function" ? options() : options;
            methods.UpInit(me, elem, options);
        };

        /**
         * !! 上传处理中
         * @param {Number} index 当前正在上传的那个文件索引值
         * @param {Number} value 当前文件已上传的大小(已上传多少KB)
         * @param {Number} max 当前文件的全部上传后的大小(KB)
         */
        this.handleProgress = function(index, value, max){
            methods.UpHandle(me, index, value, max);
        };

        /**
         * !! 上传失败时
         * @param {Number} index 失败的那个文件索引值
         */
        this.handleFail = function(index){
            methods.UpFail(me, index);
        };
        // var opts = typeof (options) === "function" ? options() : options;
        // return new UpInit(elem, opts);
    };



    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  内置函数库 methods
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var methods = {

        //————————————————————————————————————————————————
        /**
         * 控件初始化
         * @param {object} me 控件自身对象
         * @param {string} elem 控件绑定的根节点。如 '.app', '#app'
         * @param {object} options 控件传递过来的参数
         * @returns 
         */
        UpInit: function(me, elem, options){
            // 默认参数
            var defaults = {
                enable: true, // 是否启用上传功能(可选)，默认true
                fileType: [], // ['png', 'gif', 'jpg', 'jpeg', 'pdf'], // 文件类型限制(必须)，默认为空，表示不限制文件类型
                fileSize: 300, // 文件大小限制，单位KB(可选)，默认300KB。若是以MB为单位，如要限制成20MB，则写成 20*1024
                multiple: true, // 是否允许使用批量上传功能(可选)，默认true
                width: 600, // 区域宽度，默认单位为px(可选)，默认600px。可传像素值600或600px表示600px，或传百分比'60%'
                increment: true, // 文件是否使用“增量模式”进行上传(可选)，默认true。true 是表示“增量模式”， false 否表示“替换模式”
                // [增量模式说明] 
                // true 每次选择文件会和“已有列表中的文件”进行比较，若有新文件则把它添加到列表中，若无则不添加; 
                // false 每次选择文件会把“已有列表中的文件”替换成当前选择的文件。
                // 举例：“已有列表中的文件”为[1,2,3,4]，当前选择了文件[2,3,5,6]，则true时列表中的文件会变成[1,2,3,5,6]，false时列表中文件会变成[2,3,5,6]

                chooseButtonLabel: '选择文件', // 选择文件按钮的显示文字(可选)，默认'选择文件'
                upButtonLabel: '开始上传', // 上传按钮的显示文字(可选)，默认'开始上传'
                suggestionLabel: '', // 建议信息(可选)，默认空。若为空系统将根据文件类型及限制的大小输出一段文字，如”只能上传png/gif/jpg/jpeg文件，且大小不超过500KB”
                successLabel: '上传成功', // 上传成功后显示的提示文字(可选)，默认'上传成功'
                failLabel: '上传失败', // 上传失败后的显示的提示文字(可选)，默认'上传失败'
                showThumb: true, // 是否显示缩略图(可选)，默认true
                showSize: true, // 是否显示文件大小(可选)，默认true
                showProgress: true, // 是否显示进度条(可选)，默认true
                showCross: true, // 是否显示打叉图标用以删除当前文件(可选)，默认true
                showOrder: true, // 是否显示文件序号(可选)，默认true

                overflow: 'auto', // 上传文件列表如果超过一屏，是否显示滚动条(可选)，默认auto。值：auto 使用浏览器的滚动条, scroll 使用区区域的滚动条(可本区域显示自己的滚动条)
                maxHeight: 0, // 自定义文件列表高度，仅当overflow='scroll'时有效(可选)，默认0。当overflow='scroll'时，系统将自会自动调整区域高度，若想自定义一个高度请设置具体的高度值，如370表示370px

                form: { // 上传区域表单功能(可选)
                    // 内置表单
                    enable: true, // 是否启用内置表单功能(可选)，默认true
                    valid: true, // 点上传按钮是内置表单是否必填(可选)，默认true
                    label: '文件名', // 内置表单的文本(可选)，默认'文件名'
                    placeholder: '', // 内置表单输入框的placeholder属性值(可选)，默认true
                    // 外置表单，即自定义表单
                    customHTML: '' // 外置表单(可选)，非空时内置表单功能将不起作用。只有在enable=true且当前参数值不为空时才起作用。
                }
            }

            var settings = helpers.extend(true, {}, defaults, options || {}); // 合并参数对象
            if(settings.enable == false){ // 不启用时中断
                return;
            }
            me.$opts = settings; // 全局赋值

            // 全局属性
            var tagFileId = 'choice'; // input type file 节点的id属性
                tagListClassName = 'neUpload__list', // 文件列表节点的className
                tagThumbClassName = 'thumb', // 缩略图节点className
                tagFormInClassName = 'neUpload__form_built_in', // 内置表单节点的className
                tagFormOutClassName = 'neUpload__form_built_out'; // 自定义表单节点的className

            // 取值，变量以c开头
            var cWidth = settings.width,
                cMultiple = settings.multiple,
                cFileType = settings.fileType,
                cFileSize = settings.fileSize,
                cIncrement = settings.increment,
                cMaxHeight = settings.maxHeight.toString().replace(/px/g, ''),
                cSuggestLabel = settings.suggestionLabel,
                cShowProgress = settings.showProgress;

            // 改造成所需的值，变量以d开头
            var dWidth = cWidth.toString().indexOf('px') >=0 || cWidth.toString().indexOf('%') >= 0 ? cWidth : cWidth + 'px';
            var dFileType = '';
            var dFileArr = [];
            if(Array.isArray(cFileType)){
                for(var i = 0; i < cFileType.length; i++){
                    var _type = cFileType[i].toString().toLocaleLowerCase().replace(/\./g, ''); // 转成小写并去掉点号
                    // 转成 input type file accept属性值
                    var _format = '';
                    if(_type == 'jpg' || _type == 'jpeg'){ // 图片
                        _format = 'image/jpeg';
                    }
                    else if(_type == 'png'){
                        _format = 'image/png';
                    }
                    else if(_type == 'gif'){
                        _format = 'image/gif';
                    }
                    else if(_type == 'pdf'){ // PDF文档
                    _format = 'application/pdf';
                    }
                    else if(_type == 'xls'){  // EXCEL文档
                        _format = 'application/vnd.ms-excel';
                    }
                    else if(_type == 'xlsx'){
                        _format = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    }
                    else if(_type == 'docx'){ // WORD文档
                        _format = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    }
                    else if(_type == 'doc'){
                        _format = 'application/msword';
                    }
                    else if(_type == 'mp3'){ // 视频
                        _format = 'audio/mpeg';   
                    }
                    else if(_type == 'mp4'){
                        _format = 'audio/mp4, video/mp4';
                    }
                    dFileArr.push(_format);
                }
                dFileType = Array.from(new Set(dFileArr)).join(','); // 数组去重后变成字符串
            }
            else{
                helpers.prompt('fileType参数要为数组格式，请检查！');
                return;
            }
            var dMultipleStr = cMultiple === false ? '' : ' multiple="multiple"'; // 上传时是选择多个文件，还是单个文件
            var dUseOutForm = settings.form.customHTML.toString().replace(/([\s]+)/g, '') === '' ? false : true; // 是否使用外置表单
            var dStatusClassName = cShowProgress ? '' : ' no-speed'; // 无进度条时的样式
            var dSuggestLabel = cSuggestLabel.toString().replace(/(\s+)/g, '') !== '' ? cSuggestLabel : ('只能上传' + cFileType.join('、') + '文件，且大小不超过' + helpers.getFormatSize(cFileSize));
                

            // 创建根节点
            var idsClasses = elem.toString().replace(/(#|\.)/g, '');
            var appNode = document.getElementById(idsClasses) || document.getElementsByClassName(idsClasses)[0];
            if(typeof appNode == 'undefined'){
                helpers.prompt('您绑定的节点不存在，请检查' + elem.toString() + '是否存在');
                return;
            }
            var rootNode = document.createElement('div');
            rootNode.className = 'ne__upload';
            rootNode.style.width = dWidth;
            appNode.appendChild(rootNode);

            // 创建顶部节点
            var _topHtml = [
                '<div class="neUpload__top">',
                    '<div class="neUpload__choose">',
                        '<div class="neUpload__file">',
                            '<button type="button" id="btn__choose">' + settings.chooseButtonLabel + '</button>',
                            '<input type="file" id="' + tagFileId + '" accept="' + dFileType + '"' + dMultipleStr + '>',
                        '</div><!--/.neUpload__file-->',
                        '<p>' + dSuggestLabel + '</p>',
                    '</div>',
                    '<div class="neUpload__operate">',
                        '<button type="button" id="btn_upload">' + settings.upButtonLabel + '</button>',
                    '</div>',
                '</div><!--/.neUpload__top-->',
                ' <div class="' + tagListClassName + '">',
                '</div>'
            ].join('\r\n');
            rootNode.innerHTML = _topHtml;

            // 取节点
            var fDom = document.getElementById(tagFileId); // 选择文件的节点
            var listDom = document.getElementsByClassName(tagListClassName)[0]; // 文件列表节点
            // 设置节点
            if(settings.overflow == 'scroll'){
                var winH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // 视窗高
                var offsetTop = helpers.getElementTop(listDom);
                // console.log('视窗高：', winH, '\n顶部距离：', offsetTop);
                var scrollHeight = (winH - offsetTop - 10) + 'px';
                if(cMaxHeight != 'auto' && parseFloat(cMaxHeight) > 0){
                    scrollHeight = cMaxHeight + 'px';
                }
                listDom.style.height = 'auto';
                listDom.style.maxHeight = scrollHeight;
                listDom.style.overflowY = 'auto';
            }
            
            // 全局赋值
            me.$fileDom = fDom;
            me.$listDom = listDom;

            // !!!Event：选择文件按钮发生变化事件 / 选择文件后
            var filesArr = []; // 所有要上传的文件组成数组
            fDom.addEventListener('change', function(e){
                // var fList = fDom.files;
                var fList = [];
                if(cIncrement){ // 1.文件使用“增量模式”上传
                    if(fDom.files.length == 0) fList = filesArr;
                    else {
                        fList = filesArr.map(function(item){
                            return item;
                        });
                        for(var i = 0; i < fDom.files.length; i++){
                            var item1 = fDom.files[i];
                            var isEqual = false;
                            for(var k = 0; k < filesArr.length; k++){
                                var item2 = filesArr[k];
                                if(helpers.isObjectEqual(item1, item2)){
                                    isEqual = true;
                                    break;
                                }
                            }
                            if(!isEqual){
                                fList.push(item1);
                            }
                        }
                    }
                }
                else{ // 2.文件使用“替换模式”上传
                    // 考虑到用户选择文件时有时会点“取消”按钮
                    fList = fDom.files.length == 0 ? filesArr : fDom.files; // 如果第1次选了N个文件, 第2次一个也没选，这时文件默认是空的，但不能让它空
                }
                // console.log('文件列表：', fList);
                // if(fList.length == fDom.files.length) return;

                if(fList.length > 0){
                    helpers.addClass(me.$listDom, 'loaded'); //  列表有边框
                }
                filesArr = []; // 先重置为空(必须)
                var _listHtml = '';
                for(var i = 0; i < fList.length; i++){
                    var item = fList[i];
                    filesArr.push(item);
                    var _name = item.name,
                        _size = Math.ceil(item.size / 1024), // bite变kb
                        _type = item.type;
                    var _nameNotSuffix = _name.substr(0, _name.lastIndexOf('.')); // 文件名无后辍。 最后一个点号出现的索引值
                    _listHtml += [
                        '<div class="neUpload__one">',
                            (
                                // 匿名函数马上执行
                                (function(){
                                    // 序号
                                    var _tmpHtml = '';
                                    if(settings.showOrder){
                                        _tmpHtml += '<div class="neUpload__order">' + (i + 1) + '</div>';
                                    }
                                    return _tmpHtml;
                                })()
                            ),     
                            (
                                
                                // 匿名函数马上执行
                                (function(){
                                    // 缩略图
                                    var _tmpHtml = '';
                                    if(settings.showThumb){
                                        _tmpHtml = [
                                            '<div class="neUpload__thumb">',
                                                '<img class="' + tagThumbClassName + '" src="">',
                                            '</div>'
                                        ].join('\r\n')  
                                    }
                                    return _tmpHtml;
                                })()
                            ),
                            '<div class="neUpload__detail">',
                                '<div class="neUpload__form">',
                                    (
                                        // 匿名函数马上执行
                                        (function(){
                                            // 内置表单
                                            var _tmpHtml = '';
                                            if(settings.form.enable){ 
                                                _tmpHtml = [
                                                    '<div class="' + tagFormInClassName + '">',
                                                        '<span>' + settings.form.label + '：</span>',
                                                        '<input type="text" placeholder="' + settings.form.placeholder + '" onblur="this.placeholder=\'' + settings.form.placeholder + '\'" onfocus="this.placeholder=\'\'" value="' + _nameNotSuffix + '">',
                                                    '</div>'
                                                ].join('\r\n')
                                            }
                                            return _tmpHtml;
                                        })()
                                    ),
                                    (
                                        // 匿名函数马上执行
                                        (function(){
                                            // 自定义表单
                                            var _tmpHtml = '';
                                            if(settings.form.enable){
                                                if(dUseOutForm){
                                                    _tmpHtml = [
                                                        '<div class="' + tagFormOutClassName + '">',
                                                        settings.form.customHTML,
                                                        '</div>'
                                                    ].join('\r\n')
                                                }
                                            }
                                            return _tmpHtml; 
                                        })()
                                    ),
                                '</div><!--/.neUpload__form-->',
                                '<div class="neUpload__info">',
                                    (
                                        // 匿名函数马上执行
                                        (function(){
                                            var tmpSize = helpers.getFormatSize(_size);
                                            var _tmpHtml = '';
                                            if(settings.showSize){
                                                _tmpHtml += '<span class="neUpload__info_size">' + tmpSize + '</span>';
                                            }
                                            return _tmpHtml;
                                        })()
                                    ),
                                    '<span class="neUpload__info_name">' + _name + '</span>',
                                '</div>',
                                '<div class="neUpload__progress">',
                                    '<span class="neUpload__progress_state' + dStatusClassName + '">等待上传</span>',
                                    (
                                        (function(){
                                            var _tmpHtml = '';
                                            if(cShowProgress){
                                                _tmpHtml= [
                                                    '<progress value="0" max="100"></progress>',
                                                    '<span class="neUpload__progress_percent">0%</span>'
                                                ].join('\r\n')
                                            }
                                            return _tmpHtml;
                                        })()
                                    ),
                                '</div>',
                            '</div><!--/.neUPload__details-->',
                            (
                                // 匿名函数马上执行
                                (function(){
                                    var _tmpHtml = '';
                                    if(settings.showCross){
                                        _tmpHtml += '<div class="neUpload__remove"></div>'; // 打叉节点(删除)
                                    }
                                    return _tmpHtml;
                                })()
                            ),
                            '<div class="neUpload__tick" style="display: none"></div>', // 打勾节点(成功)
                            '<div class="neUpload__sigh" style="display: none"></div>', // 感叹节点(失败)
                        '</div><!--/.neUpload__one-->'
                    ].join('\r\n')
                }

                listDom.innerHTML = _listHtml;

                // 删除某个文件、界面上移除某个文件
                var removeDom = document.querySelectorAll('.neUpload__remove');
                var delCount = 0; // 统计删的个数
                var oldArr = filesArr.map(function(item){ return item; }); // 原数组。数组直接赋值本质是引用，使用map防止对数组进行操作后会改变原数组。
                removeDom.forEach(function(item, index){
                    item.addEventListener('click', function(){
                        var oldElement = oldArr[index]; // 要移除的文件在原文件中的索引值
                        var newIndex = filesArr.indexOf(oldElement);
                        // 更新列表
                        var parentNode = item.parentNode,
                            grandNode = parentNode.parentNode;
                            nextBrotherDom = helpers.getAllNextElement(parentNode), // 后面的兄弟节点
                        // console.log('祖父节点：', grandNode, '\n父节点：', parentNode);
                        // console.log('后面的兄弟节点：', nextBrotherDom);
                        grandNode.removeChild(parentNode); // 移除当前节点
                        nextBrotherDom.forEach(function(v, cIndex){ // 更新序号
                            v.getElementsByClassName('neUpload__order')[0].innerText = newIndex + cIndex + 1;
                        });
                        // 更新数据
                        // filesArr.splice(index, 1); // 不能这样
                        filesArr.splice(newIndex, 1); // 要这样
                        // console.log('旧索引(index)：', index);
                        // console.log('新索引：', newIndex);
                        // console.log('旧文件：', oldArr);
                        // console.log('新文件：', filesArr);
                        if(filesArr.length == 0){
                            helpers.removeClass(me.$listDom, 'loaded'); // 列表无边框
                        }
                        delCount++;
                    });
                });
                

                // 缩略图预览(只有图片才有缩略图,其它文件无缩略图哦~~)
                var thumbList = document.querySelectorAll('.' + tagThumbClassName);
                if(thumbList.length > 0){
                    for(var i = 0; i < thumbList.length; i++){
                        var $img = thumbList[i],
                            file = fList[i];
                        // console.log('图片节点：', $img, '\n文件：', file);
                        // 1.这样不行，只能有一张缩略图
                        // var reader = new FileReader();
                        // reader.onload = function(){
                        //     console.log('result：', reader.result)
                        //     $img.src = reader.result;
                        // }
                        // if (file) {
                        //     reader.readAsDataURL(file);
                        // } else {
                        //     $img.src = "";
                        // }
                        // 2.像这样才可以有多张缩略图
                        var reader = new FileReader();
                        reader.onload = (
                            function(aImg) { 
                                return function(e) { 
                                    aImg.src = e.target.result; 
                                };
                            }
                        )($img);
                        if(file){
                            reader.readAsDataURL(file);
                        }
                        else{
                            $img.src = '';
                        }
                    }
                }
            });
            


            // !!!Event：点击上传文件按钮、开始上传按钮
            var btnUpDom = document.getElementById('btn_upload');
            btnUpDom.addEventListener('click', function(e){
                var fList = filesArr; // 这里不能直接取 fDom.files，因为界面上有可能移除文件
                // console.log('文件列表1：', filesArr);
                // console.log('文件列表2:', fDom.files);
                // ·------各种判断------
                // 必须要选择文件才能上传
                if(fList.length == 0){
                    helpers.prompt('请选择要上传的文件！');
                    return;
                }
                // 获取文件信息组成数组
                var fNames = [], // 文件名数组(含后辍)，如['aaa.jpg', 'bbb.png']
                    fSizes = [], // 文件大小(单位：KB)数组，如[50, 30, 80]
                    fTypes = []; // 文件类型数组，即文件名后辍数组，如['.pdf', '.jpg', '.png']
                var fNotSufNames = []; // 文件名数组(不含后辍)
                for(var i = 0; i < fList.length; i++){
                    var _file = fList[i];
                    // console.log('一个文件：', _file);
                    var _name = _file.name,
                        _size = Math.ceil(_file.size / 1024),
                        // type = one.type,
                        _type = _name.substr(_name.lastIndexOf('.')).toLocaleLowerCase(); // 文件名后辍，不包含点号
                    fNames.push(_name);
                    fSizes.push(_size);
                    fTypes.push(_type);
                    fNotSufNames.push(_name.substr(0, _name.lastIndexOf('.')));
                }
                // console.log('文件名(有后辍)：', fNames);
                // console.log('文件大小：', fSizes);
                // console.log('文件类型：', fTypes);
                // console.log('文件名(无后辍)：', fNotSufNames);
                // 限制文件大小
                var nowIndex = null, nowSize = null;
                for(var i = 0; i < fSizes.length; i++){
                    var _file = fSizes[i]
                    if(_file > cFileSize){
                        nowIndex = i;
                        nowSize = _file;
                        break;
                    }
                }
                if(nowIndex != null){
                    var currentSize = helpers.getFormatSize(nowSize),  // 当前文件大小
                        maxSize = helpers.getFormatSize(cFileSize);  // 允许的最大大小
                    helpers.prompt('上传文件不得大于' + maxSize + '<br>第' + (nowIndex + 1) + '个文件大小为' + currentSize + '，已超过' + maxSize);
                    return;
                }
                // 限制文件类型
                var newArr = fTypes.map(function(item){
                    return item.replace(/\./g, ''); // 去掉点号
                })
                var nowIndex = null, nowType = '';
                for(var i = 0; i < newArr.length; i++){
                    var _type = newArr[i];
                    if(cFileType.indexOf(_type) < 0){
                        nowIndex = i;
                        nowType = _type;
                        break;
                    }
                }
                if(nowIndex != null){
                    helpers.prompt('您上传的文件不是' + cFileType.join(',') + '文件<br>(第' + (nowIndex + 1) + '个文件为' + nowType + '文件)');
                    return;
                }
                

                // ·------取表单数据------
                // 内置表单
                var inFormData = [];
                // 格式1：
                // var inList = document.querySelectorAll('.' + tagFormInClassName + ' input[type="text"], textarea');
                // for(var i = 0; i < inList.length; i++){
                //     inFormData.push({
                //         value: inList[i].value
                //     });
                // }
                // 格式2
                var inList = document.querySelectorAll('.' + tagFormInClassName);
                inList.forEach(function(item){
                    var $input = item.querySelectorAll('input[type="text"], textarea');
                    var arr = [];
                    for(var i = 0; i < $input.length; i++){
                        arr.push($input[i].value);
                    }
                    inFormData.push({
                        value: arr
                    })
                });
                // console.log('内置表单值：', inFormData);
                // 外置表单
                var outFormData = [];
                var outList = document.querySelectorAll('.' + tagFormOutClassName);
                outList.forEach(function(item){
                    var $box = item.querySelectorAll('input[type="text"], textarea');
                    var arr = [];
                    for(var i = 0; i < $box.length; i++){
                        arr.push($box[i].value);
                    }
                    outFormData.push({
                        value: arr
                    })
                });
                // console.log('外置表单值：', outFormData);
                // 没有表单时，直接返回文件名数组，处理成统一的格式
                var singleNameData = [];
                for(var i = 0; i < fNotSufNames.length; i++){
                    singleNameData.push({
                        value: [fNotSufNames[i]]
                    })
                }
                var fileData = settings.form.enable ? ( dUseOutForm ? outFormData : inFormData) : singleNameData;


                // ·------开始执行上传操作------
                // 隐藏某些文本信息
                var successDom = document.querySelectorAll('.neUpload__progress_state');
                successDom.forEach(function(item){
                    item.style.display = 'none';
                });
                // 回调
                if(settings.callBack){
                    settings.callBack({
                        "files": fList, // 文件列表
                        "fileNames": fNames, // 文件名数据
                        "fileSizes": fSizes,
                        "fileTypes": fTypes,
                        "fileData": fileData, // 表单数据
                        "fileDom": fDom, // 选择文件按钮DOM对象
                        "uploadDom": btnUpDom // 上传文件按钮DOM对象
                    })
                }
            });
        }, // END UpInit()



        //————————————————————————————————————————————————
        /**
         * 事件处理
         * @param {object} me 控件自身对象
         * @param {Number} index 当行文件索引值
         * @param {Number} value 当前文件已上传的大小
         * @param {Number} max 当前文件总大小
         */
        UpHandle: function(me, index, value, max){
            // var dom = me.$listDom;
            // console.log('dom：', dom);
            var lists = document.querySelectorAll('.neUpload__one');
            for(var i = 0; i < lists.length; i++){
                var proDom = lists[i].getElementsByTagName('progress')[0];
                var percentDom = lists[i].getElementsByClassName('neUpload__progress_percent')[0];
                var successDom = lists[i].getElementsByClassName('neUpload__progress_state')[0];
                var removeDom = lists[i].getElementsByClassName('neUpload__remove')[0];
                var tickDom = lists[i].getElementsByClassName('neUpload__tick')[0];
                var sighDom = lists[i].getElementsByClassName('neUpload__sigh')[0];
                if(index == i){
                    // 更新进度条
                    proDom.setAttribute('value', value);
                    proDom.setAttribute('max', max);
                    // 更新百分比
                    var percent =  (parseFloat(value) / parseFloat(max)) * 100;
                    percentDom.innerText = parseInt(percent) == 100 ? '100%' : percent.toFixed(2) + '%';
                    // 更新状态：显示“上传中”或“上传成功”或“上传失败”字样
                    successDom.removeAttribute('style');
                    if(value == max){
                        successDom.innerText = me.$opts.successLabel;
                        // 更新状态：打勾
                        removeDom.style.display = 'none'; // 隐藏打叉节点
                        sighDom.style.display = 'none'; // 隐藏感叹节点
                        tickDom.style = ''; // 显示打勾节点
                    }
                    else{
                        successDom.innerText = '上传中..';
                    }
                    
                }
            }
        }, // END UpHandle()



        //————————————————————————————————————————————————
        /**
         * !!! 上传失败 testing
         * @param {object} me 控件自身对象
         * @param {Number} index 当行文件索引值
         */
        UpFail: function(me, index){
            var lists = document.querySelectorAll('.neUpload__one');
            for(var i = 0; i < lists.length; i++){
                var successDom = lists[i].getElementsByClassName('neUpload__progress_state')[0];
                var tickDom = lists[i].getElementsByClassName('neUpload__tick')[0];
                var sighDom = lists[i].getElementsByClassName('neUpload__sigh')[0];
                if(index == i){
                    tickDom.style.display = 'none'; // 隐藏打勾节点
                    sighDom.style = ''; // 显示感叹节点
                    // 更新状态：显示“上传失败”字样
                    successDom.removeAttribute('style');
                    successDom.innerText = me.$opts.failLabel;
                    helpers.addClass(successDom, 'red');
                }
            }
        }, // END UpFail

    }; // END methods





    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  工具库，帮助对象 helpers
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var helpers = {

        /**
         * !! 弹出提示信息
         * @param {string} str 提示信息字符串 
         */
        prompt: function(str){
            if(typeof neuiDialog != 'undefined' && typeof neuiDialog.alert == 'function'){
                neuiDialog.alert({
                    animate: true,
                    message: str,
                    buttons: ['确定']
                });
            }
            else{
                alert(str.toString().replace(/(\<br\>)/g, '\n').replace(/\//g, ''));
            }
        },


        /**
         * !! 添加节点的class样式
         * @param {HTML DOM} ele DOM元素
         * @param {string} cls class属性值
         */
        addClass: function(ele, cls){
            if (!this.hasClass(ele, cls)) ele.className += " " + cls;
        },

        /**
         * !! 移除某个节点的class样式
         * @param {HTML DOM} ele DOM元素
         * @param {string} cls class属性值
         */
        removeClass: function(ele, cls) {
            if (this.hasClass(ele, cls)) {
                var newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
                while (newClass.indexOf(' ' + cls + ' ') >= 0) {
                    newClass = newClass.replace(' ' + cls + ' ', ' ');
                }
                ele.className = newClass.replace(/^\s+|\s+$/g, '');
            }
        },

        
        /**
         * !! 判断某个节点是否有某个class样式
         * @param {HTML DOM} ele DOM元素
         * @param {string} cls class属性值
         * @returns {boolean} 返回布尔值true或false
         */
        hasClass: function(ele, cls) {
            cls = cls || '';
            if (cls.replace(/\s/g, '').length == 0) return false; //当cls没有参数时，返回false
            return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
        },


        /**
         * !! 获取格式化后的文件大小
         * @param {string} file_size 文件大小
         * @returns {string} 返回带有单位KB或MB或GB的文件大小
         */
        getFormatSize: function(file_size){
            var reg = /^[0-9]+(\.[0-9]+)?/;
            if(!reg.test(file_size)){
                this.prompt('传递的文件大小参数不是数字类型，请检查');
                return;
            }
            var unit = (file_size / 1024) < 1 ? 'KB' : ( (file_size / (1024 * 1024)) < 1 ? 'MB' : 'GB');
            var size = '';
            if(unit == 'KB'){
                size = file_size;
            }
            else if(unit == 'MB'){
                size = parseFloat(file_size / 1024).toFixed(2);
            }
            else if(unit == 'GB'){
                size = parseFloat( file_size / (1024 * 1024) ).toFixed(2);
            }
            if(size.toString().substring(size.toString().lastIndexOf('.') + 1) == '00') { // 如果最后面两个小数是00，则00不要
                size = size.substring(0, size.lastIndexOf('.'));
            }
            size += unit;
            return size;
        },



        /**
         * !! 判断两个对象是否完全相等，判断两个对象是否相等
         * @param {object} obj1 对象1
         * @param {object} obj2 对象2
         * @returns {boolean} 返回布尔值，true 是, false 否
         */
        isObjectEqual: function(obj1, obj2){
            var o1 = obj1 instanceof Object;
            var o2 = obj2 instanceof Object;
            // 判断是不是对象
            if(!o1 || !o2){
                return obj1 === obj2;
            }
            //.keys() 返回一个对象的自身，可枚举属性kes值组成的数组
            // 例如：数组返回下表： let arr = ['a', 'b', 'c'] Object.keys(arr); // 结果 0, 1, 2
            if(Object.keys(obj1).length !== Object.keys(obj2).length){
                return false;
            }
            for(var o in obj1){
                var t1 = obj1[o] instanceof Object;
                var t2 = obj2[o] instanceof Object;
                if(t1 && t2){
                    if(!this.isObjectEqual(obj1[o], obj2[o])){
                        return false;
                    }
                }
                else if(obj1[o] !== obj2[o]){
                    return false;
                }
            }
            return true;
        },


        /**
         * !! 原生js获取后面所有的兄弟节点 (兼容ie6+)
         * 注：已排除文本、空格，换行符
         * @param {HTML DOM} o 当前元素对象节点
         * @returns {Array} 返回数组，数组中的元素为dom对象
         */
        getAllNextElement: function(o){
            var arr = [];
            var parent = o.parentNode;
            if(parent == null) return [];
            var index = -1;
            for(var i = 0; i < parent.children.length; i++){
                var child = parent.children[i];
                if(child == o){
                    index = i;
                }else{
                    if(index != -1 && i > index) arr.push(child);
                }
            }
            return arr;
        },




         /**
         * 原生js获取元素style属性
         * [用途]：原生js获取元素margin外边距、内边距padding
         * [注意]：返回值中的各个属性值带单位px
         * 兼容性：兼容IE、火狐、谷歌
         * @param {HTML DOM} o DOM元素。
         * @returns {object} 返回元素的各种css属性组成的数组。
         * [示例]
            var div = document.getElementById("user");
            var style = getElementStyle(div);
            alert(style.marginTop);
        */
        getElementStyle: function(o){
            //  兼容IE和火狐谷歌等的写法
            if (window.getComputedStyle) {
                var style = getComputedStyle(o, null);
            } else {
                style = o.currentStyle; // 兼容IE
            }
            return style;
        },



        /**
         * 原生js获取元素到浏览器顶部的距离，即offsetTop
         * 注：不能直接使用obj.offsetTop，因为它获取的是你绑定元素上边框相对离自己最近且position属性为非static的祖先元素的偏移量
         * @param {HTML DOM} o DOM元素。
         * @returns {number} 返回距离值
         */
        getElementTop: function(o) {
            var actualTop = o.offsetTop;
            var current = o.offsetParent;
            while (current !== null) {
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }
            // 当HTML节点有设置margin值时
            var docStyle = this.getElementStyle(document.documentElement), // HTML节点
                docMarTop = Math.ceil(docStyle.marginTop.toString().replace(/([\px]+)/g, ''));
            actualTop += docMarTop;
            return actualTop;
        },


        
        /**
         * !! 原生JS合并对象1
         * 即用一个或多个对象来扩展一个对象，返回被拓展的对象
         * 注：本函数很好的模拟了JQ extend合并对象
         * @param {boolean} deep 是否深度合并对象(可选),默认false
         * @param {object} target 目标对象，其他对象的成员属性将被附加到该对象上。
         * @param {object} object1 第1个被合并的对象(可选)。
         * @param {object} objectN 第N个被合并的对象(可选)。
         *  [调用示例] 
            格式：extend(deep, target, defs, opts);
            eg. extend(defs, opts); // 浅合并
            eg. extend(false, defs, opts); // 浅合并
            eg. extend({}, defs, opts); // 浅合并
            eg. extend(false, {}, defs, opts); //浅合并
            eg. extend(true, defs, opts); // 深合并
            eg. extend(true, {}, defs, opts); //深合并
        * [jq合并对象的方法]
            $.extend(deep, target, obj1, obj2, ..., objN);
        */
        extend: function(){
            var options, name, src, copy, deep = false, target = arguments[0], i = 1, length = arguments.length;
            if (typeof (target) === "boolean") deep = target, target = arguments[1] || {}, i = 2; // eg. extend(true, {}, defs, opts || {});
            if (typeof (target) !== "object" && typeof (target) !== "function") target = {}; // eg.
            if (length === i) target = this, --i;
            if(deep){ 
                // 深度合并
                for (; i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        target = fnExtendObject(target, options);
                    }
                }
            }else{ 
                // 浅合并
                for (; i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        for (name in options) {
                            src = target[name], copy = options[name];
                            if (target === copy) continue;
                            if (copy !== undefined) target[name] = copy;
                        }
                    }
                }
            }
            // console.log('target：', target)
            return target;
    
    
            /**
             * 子函数：递归深度合并JSON对象
             * 注：遇到相同元素级属性，以defs为准。
             * 参考：https://www.cnblogs.com/catgatp/p/9189228.html
             * @param {object} defs 第1个被合并的对象
             * @param {object} opts 第2个被合并的对象
             * @returns {object} 返回合并后的目标对象，所有被合并的对象的成员属性将被附加到该对象上。
             */
             function fnExtendObject(defs, opts){
                if(!fnIsJson(defs)  || !fnIsJson(opts)){
                    alert('参数不是JSON对象，请检查！');
                    return {};
                }
                var target = JSON.parse(JSON.stringify(defs)); // 赋值而不改变原对象(注意：对象直接赋值是引用赋值，会改变原对象)
                // 遇到相同元素级属性，以 minor 为准
                // 不返还新Object，而是 main 改变
                var mergeObj = function(minor, main) {
                    for(var key in minor) {
                        if(main[key] === undefined) { // 不冲突的，直接赋值 
                            main[key] = minor[key];
                            continue;
                        }
                        // 冲突了，如果是Object，看看有么有不冲突的属性; 不是Object 则以 minor 为准为主
                        // console.log(key)
                        if(fnIsJson(minor[key]) || fnIsArray(minor[key])) { // arguments.callee 递归调用，并且与函数名解耦 
                            // console.log("is json")
                            //arguments.callee(minor[key], main[key]);
                            mergeObj(minor[key], main[key]);
                        }else{
                            main[key] = minor[key];
                        }
                    }
                }
                mergeObj(opts, target);
                return target;
            }
            /**
             * 子函数：判断是否JSON对象
             */
            function fnIsJson(o) {
                return typeof o == "object" && (o != null && o.constructor == Object);
            }
            /**
             * 子函数：判断是否数组
             */
            function fnIsArray(o) {
                return Object.prototype.toString.call(o) == '[object Array]';
            }
        }

    }; // END helpers




    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  返回控件对象给前端调用
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //———————————————————————————————————————————————— 
    return NeUploadFile; // 返回对象
});




//================================================================================================
//              二、兼容IE
//================================================================================================
// 数组indexOf方法
if(!Array.indexOf){
    Array.prototype.indexOf = function(el){ 
        for (var i=0,n=this.length; i<n; i++){
            if (this[i] === el){
                return i;
            }
        }
        return -1;
    }  
};