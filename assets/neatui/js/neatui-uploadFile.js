/**
 * [NeUploadFile]
 * jQuery文件上传控件
 * 支持批量上传图片、PDF等文件
 * Version：v1.0.0
 * Author: Mufeng
 * Date: 2023.05.24
 * Update: 2023.05.24
 */

/**
 * 
 * 参数设置：
    var defaults = {
        enable: true, // 是否启用上传功能(可选)，默认true
        width: '800px', // 区域宽度，默认单位为px(可选)，默认800px。可传像素值500表示500px，或传百分比'50%'
        multiple: true, // 是否允许使用批量上传功能(可选)，默认true
        fileType: ['image/png', 'image/jpeg', 'application/pdf'], // 文件类型限制(可选)，默认为图片及pdf文件。数组中的每个元素为<input type="file">标签accept属性值。
        fileSize: 100, // 文件大小限制，单位kb(可选)，默认100kb
        chooseButtonLabel: '选择文件', // 选择文件按钮的显示文字(可选)，默认'选择文件'
        upButtonLabel: '开始上传', // 上传按钮的显示文字(可选)，默认'开始上传'
        suggestionLabel: '只能上传jpg/png文件，且不超过50kb', // 建议信息(可选)
        successLabel: '上传成功', // 上传成功后显示的提示文字(可选)，默认上传成功
        showThumb: true, // 是否显示缩略图(可选)，默认true
        showSize: true, // 是否显示文件大小(可选)，默认true
        showProgress: true, // 是否显示进度条(可选)，默认true
        showCross: true, // 是否显示打叉图标用以删除当前文件(可选)，默认true
        overflow: 'auto', // 上传文件列表如果超过一屏，是否显示滚动条(可选)，默认auto。值：auto 使用浏览器的滚动条, scroll 使用区区域的滚动条(可本区域显示自己的滚动条)
  
        form: { // 上传区域表单功能(可选)
            // 内置表单
            enable: true, // 是否启用内置表单功能(可选)，默认true
            valid: true, // 点上传按钮是内置表单是否必填(可选)，默认true
            label: '案件编号', // 内置表单的文本
            placeholder: '', // 内置表单输入框的placeholder属性值(可选)，默认true
            // 自定义表单
            html: '' // 自定义表单(可选)，非空时内置表单功能将不起作用
        }
    }
 */
;(function(root, factory){
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.NeUploadFile = factory();
    }
})(this, function(){
    var NeUploadFile = function(elem,options){
        var opts = typeof (options) === "function" ? options() : options;
        return new UpPick(elem, opts);
    };


    //————————————————————————————————————————————————
    function UpPick(elem, options){
        // 默认参数
        var defaults = {
            enable: true, // 是否启用上传功能(可选)，默认true
            width: '800px', // 区域宽度，默认单位为px(可选)，默认800px。可传像素值500表示500px，或传百分比'50%'
            multiple: true, // 是否允许使用批量上传功能(可选)，默认true
            fileType: ['image/png', 'image/jpeg', 'application/pdf'], // 文件类型限制(可选)，默认为图片及pdf文件。数组中的每个元素为<input type="file">标签accept属性值。
            fileSize: 100, // 文件大小限制，单位kb(可选)，默认100kb

            chooseButtonLabel: '选择文件', // 选择文件按钮的显示文字(可选)，默认'选择文件'
            upButtonLabel: '开始上传', // 上传按钮的显示文字(可选)，默认'开始上传'
            suggestionLabel: '只能上传jpg/png文件，且不超过50kb', // 建议信息(可选)
            successLabel: '上传成功', // 上传成功后显示的提示文字(可选)，默认上传成功

            showThumb: true, // 是否显示缩略图(可选)，默认true
            showSize: true, // 是否显示文件大小(可选)，默认true
            showProgress: true, // 是否显示进度条(可选)，默认true
            showCross: true, // 是否显示打叉图标用以删除当前文件(可选)，默认true

            overflow: 'auto', // 上传文件列表如果超过一屏，是否显示滚动条(可选)，默认auto。值：auto 使用浏览器的滚动条, scroll 使用区区域的滚动条(可本区域显示自己的滚动条)
      
            form: { // 上传区域表单功能(可选)
                // 内置表单
                enable: true, // 是否启用内置表单功能(可选)，默认true
                valid: true, // 点上传按钮是内置表单是否必填(可选)，默认true
                label: '案件编号', // 内置表单的文本
                placeholder: '', // 内置表单输入框的placeholder属性值(可选)，默认true
                // 自定义表单
                html: '' // 自定义表单(可选)，非空时内置表单功能将不起作用
            }
        }
        var settings = methods.extend(true, {}, defaults, options || {}); // 合并参数对象
        // 不启用时中断
        if(settings.enable == false){
            return;
        }
        // 取值
        var width = settings.width,
            multiple = settings.multiple,
            fileType = settings.fileType,
            fileSize = settings.fileSize;
            
        // 改造成所需的值
        var dWidth = width.indexOf('px') >=0 || width.indexOf('%') >= 0 ? width : width + 'px';
        var dFileType = '';
        if(Array.isArray(fileType)){
            dFileType = fileType.join(','); // 数组变成字符串
        }
        else{
            // dFileType = 'image/png, image/jpeg';
            methods.prompt('fileType参数要为数组格式，请检查');
            return;
        }
        var dMultipleStr = multiple === false ? '' : ' multiple="multiple"';
            

        //
        var idsClasses = elem.toString().replace(/(#|\.)/g, '');
        var appNode = document.getElementById(idsClasses) || document.getElementsByClassName(idsClasses)[0];
        var rootNode = document.createElement('div');
        rootNode.className = 'ne__upload';
        rootNode.style.width = dWidth;
        appNode.appendChild(rootNode);

        // 全局属性
        var fileTagId = 'choice'; // input type file 节点的id属性
            listTagClassName = 'neUpload__list';
        // 创建节点
        var _topHtml = [
            '<div class="neUpload__top">',
                '<div class="neUpload__choose">',
                    '<div class="neUpload__file">',
                        '<button type="button" id="btn__choose">' + settings.chooseButtonLabel + '</button>',
                        '<input type="file" id="' + fileTagId + '" accept="' + dFileType + '"' + dMultipleStr + '>',
                    '</div><!--/.neUpload__file-->',
                    '<p>' + settings.suggestionLabel + '</p>',
                '</div>',
                '<div class="neUpload__operate">',
                    '<button type="button" id="btn_upload">' + settings.upButtonLabel + '</button>',
                '</div>',
            '</div><!--/.neUpload__top-->',
            ' <div class="' + listTagClassName + '">',
            '</div>'
        ].join('\r\n');
        rootNode.innerHTML = _topHtml;

        // 取节点
        var fDom = document.getElementById(fileTagId); // 选择文件的节点
        var listDom = document.getElementsByClassName(listTagClassName)[0]; // 文件列表节点
        // console.log('dom：', fDom)

        // 事件
        fDom.addEventListener('change', function(e){
            var fileList = fDom.files;
            // console.log('文件列表：', fileList);
            var _listHtml = '';
            for(var i = 0; i < fileList.length; i++){
                var item = fileList[i];
                var _name = item.name,
                    _size = Math.ceil(item.size / 1000), // bite变kb
                    _type = item.type;
                var _nameNotSuffix = _name.substr(0, _name.lastIndexOf('.')); // 文件名无后辍。 最后一个点号出现的索引值
                _listHtml += [
                    '<div class="neUpload__one">',
                        (
                            
                            // 匿名函数马上执行
                            (function(){
                                // 缩略图
                                var _tmpHtml = '';
                                if(settings.showThumb){
                                    _tmpHtml = [
                                        '<div class="neUpload__thumb">',
                                            '<img class="thumb" src="">',
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
                                                '<div class="neUpload__form_built_in">',
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
                                            if(settings.form.html.toString().replace(/([\s]+)/g, '') === ''){
                                                _tmpHtml = [
                                                    '<div class="neUpload__form_built_out">',
                                                    settings.form.html,
                                                    '</div>'
                                                ].join('\r\n')
                                            }
                                        }
                                        return _tmpHtml; 
                                    })()
                                ),
                            '</div><!--/.neUpload__form-->',
                            '<div class="neUpload__info">',
                                '<span class="neUpload__info_size">' + _size + 'KB</span>',
                                '<span class="neUpload__info_name">' + _name + '</span>',
                            '</div>',
                            '<div class="neUpload__progress">',
                                '<span class="neUpload__progress_success">上传成功</span>',
                                '<progress value="30" max="100"></progress>',
                                '<span class="neUpload__progress_percent">75%</span>',
                            '</div>',
                        '</div><!--/.neUPload__details-->',
                        '<div class="neUpload__remove"></div>',
                    '</div><!--/.neUpload__one-->'
                ].join('\r\n')
            }
            listDom.innerHTML = _listHtml;

            // 缩略图预览
            var thumbList = document.querySelectorAll('.thumb');
            if(thumbList.length > 0){
                for(var i = 0; i < thumbList.length; i++){
                    var $img = thumbList[i],
                        file = fileList[i];
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


        //
        var btnDom = document.getElementById('btn_upload');
        btnDom.addEventListener('click', function(){
            var files = fDom.files;
            var formData = new FormData();
            console.log('files:', files);

            formData.append('file', files);
            formData.append('username', '张三');

            console.log('formData：', formData);
            console.log('获取file值：', formData.get('file'));
            console.log('用户名：', formData.getAll('username'));
        });
    };





    //————————————————————————————————————————————————
    var methods = {
        prompt: function(str){
            alert(str);
        },

        /**
         * 原生JS合并对象1
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
    }; // END MERGE 对象


    //————————————————————————————————————————————————
    //...  
    return NeUploadFile; // 返回对象
});