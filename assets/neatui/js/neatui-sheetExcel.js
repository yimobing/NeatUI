
/**
 * [neuiSheetExcel]
 * 导入导出EXCEL控件
 * 利用JS实现纯前端导入和导出excel文件 (基于SheetJS出品的js-xlsx库进行二次封装)
 * [局限说明] 本控件只支持xlsx格式即excel 2007+。对于xls格式即excel 2003及以下产品不支持！
 * [原生库说明]
    由SheetJS出品的js-xlsx是一款非常方便的只需要纯JS即可读取和导出excel的工具库，功能强大，支持格式众多，支持xls、xlsx、ods(一种OpenOffice专有表格文件格式)等十几种格式。本控件全部都是以xlsx格式为例。
 * [参考]
    官网：https://sheetjs.com/
    GitHub：https://github.com/SheetJS/sheetjs/blob/master/dist/xlsx.full.min.js
    文档：
    1. https://blog.csdn.net/lgd1917/article/details/122449774
    2. http://t.zoukankan.com/javalinux-p-15631834.html
 * Author: Mufeng
 * Date: 2024.09.29
 * Update: 2024.10.08
*/

//———————————————————————————————————————————————————————————————————
// 一、控件对象
//———————————————————————————————————————————————————————————————————
;(function(root, factory){
    if (typeof define === 'function' && define.amd) { // amd
        define(factory);
    } else if (typeof exports === 'object') { // umd
        module.exports = factory();
    } else {
        window.EXCELS = factory();
    }
})(this, function(){

    //================================================================
    // 构造函数
    //================================================================
    function EXCELS(options) {
        this.defaults = {
            // 这两个参数一般没用
            idClass: 'sheet', // 根节点样式名(可选)
            operationClassName: 'sheet__operate', // 操作区域节点样式名(可选)
            // 导入功能模块
            import: {
                enable: true, // 是否启用，默认true(可选)
                appendToParentNode: '', // 指定绑定到某个父节点下，这里填写父节点的class样式名，默认空(可选)
                btnClassName: 'btn-daoru', // 按钮样式名(可选)
                btnText: '导入EXCEL(2007+)', // 按钮文本名(可选)
                format: { // 数据输出方式(可选)
                    /*'A'|number|string[]*/
                    header: 'number', // 值：'A' 把表头当作表身数据， number 或 string[] 表头单独出来即表头还是表头数据
                    /** Default value for null/undefined values */
                    defval: '' // 给空的单元格赋值为空字符串，避免单元格被跳过(JSON解析出来后缺少相应的key)
                },
                canSecondChooseSameFile: true, // 是否能再次选择同名文件进行导入，默认true(可选)。值为false时，页面没刷新的情况下，同名文件不能第2次选择导入
                callback: null // 回调函数(可选)。 e 参数为数组，数组中每个元素为一个object对象，表示表格中的一行数据。
            },
            // 导出功能模块(可选)
            export: {
                enable: true, // 是否启用，默认true。注：当前端不传递 export 参数时，默认不启用，即相当于 export.enable = false
                appendToParentNode: '', // 指定绑定到某个父节点下，这里填写父节点的class样式名，默认空(可选)
                btnClassName: 'btn-daochu', // 按钮样式名(可选)
                btnText: '导出EXCEL(2007+)', // 按钮文本名(可选)
                filename: '导出Excel', // 导出的文件名(可选)
                withNowTime: true, // 导出的文件名后面是否加上当前时间，默认true(可选)。值：true 时后面加上当前时间，false 时后面加上随机字符
                callback: null // 回调函数(可选)。 e 参数为空对象，不传递任何数据。
            },
            // 预览功能模块(可选)
            preview: {
                enable: true,  // 是否启用，默认true(可选)。注：当前端不传递 preview 参数时，默认不启用，即相当于 preview.enable = false
                appendToParentNode: '', // 指定绑定到某个父节点下，这里填写父节点的class样式名，默认空(可选)
                nodeId: 'output', // 预览数据绑定的节点ID(可选)
                title: '导入数据预览', // 标题内容，空时表示没有标题(可选)
                hasTitleRow: true, // 预览时是否添加列索引，即添加表头A、B、C、D、E、F .. 这行，默认true(可选)
            }
        }
    };



    //================================================================
    // 原型添加相关的方法
    //================================================================
    //———————————————————————————————————————————————————
    /**
     * !!! 参数配置初始化
     * @param {Object} options 控件参数
     */
    EXCELS.prototype.intitialize = function (options) {
        if (typeof XLSX == 'undefined') {
            var message = '导出导出EXCEL控件需SheetJS工具库(xlsx.core.min.js)支持。<br>请先引入此JS文件。<br>如无，请先下载<br>https://github.com/SheetJS/sheetjs/blob/master/dist/xlsx.full.min.js<br>官网：https://sheetjs.com';
            console.log(message.toString().replace(/<br>/g, '\n'));
            utils.dialogs(message);
            return;
        }
        this.opts = options;
        this.settings = utils.extend(true, {}, this.defaults, this.opts || {});
    };


    

    //———————————————————————————————————————————————————
    /**
     * !!! 创建控件
     * @param {Object} options 控件参数
     */
    EXCELS.prototype.createSheetsExcels = function (options) {
        var _this = this;
        this.intitialize(options);
        if (typeof this.settings == 'undefined') return;
        // 导入节点HTML
        var impDiv = document.createElement('div');
        impDiv.className = 'sheet__operate_daoru';
        impDiv.innerHTML = [
            '<input type="file" id="sheet-upload" style="display:none;" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>',
            '<button type="button" class="btn-dao btn-dao-ru ' + this.settings.import.btnClassName + '">' + this.settings.import.btnText + '</button>'
        ].join('\r\n');
        // 导出节点HTML
        var expDiv = null;
        if (typeof this.opts.export != 'undefined' && this.settings.export.enable) {
            expDiv = document.createElement('div');
            expDiv.className = 'sheet__operate_daochu';
            expDiv.innerHTML = [
                '<button type="button" class="btn-dao btn-dao-chu ' + this.settings.export.btnClassName + '">' + this.settings.export.btnText + '</button>'
            ].join('\r\n');
        }
        // 预览节点HTML
        var prewDiv = null;
        if (typeof this.opts.preview != 'undefined' && this.settings.preview.enable) {
            prewDiv = document.createElement('div');
            prewDiv.className = 'sheet__output';
            prewDiv.style = "display: none";
            var _titleStr = this.settings.preview.title == '' ? '' : '<div class="sheet__output_caption">' + this.settings.preview.title + '</div>';
            prewDiv.innerHTML = [
                _titleStr,
                '<div class="sheet__output_table" id="' + this.settings.preview.nodeId + '" contenteditable></div>'
            ].join('\r\n');
        }
        // 创建控件根节点
        var rootDiv = null;
        if (document.getElementsByClassName(this.settings.idClass).length == 0) { // 不存在，才创建
            rootDiv = document.createElement('div');
            rootDiv.className = this.settings.idClass;
            utils.prependChild(rootDiv, document.body); // 将指定节点插入到body节点中且最前面
        }
        // 创建导入+导出节点
        if (this.settings.import.enable || this.settings.export.enable) {
            var opertDiv = document.createElement('div');
            opertDiv.className = this.settings.operationClassName;
            rootDiv.appendChild(opertDiv);
            // 将导入节点作为子节点插入到指定节点中
            if (this.settings.import.enable) {
                var impFatherClassName = this.settings.import.appendToParentNode;
                if (impFatherClassName == '') opertDiv.appendChild(impDiv);
                else document.getElementsByClassName(impFatherClassName)[0].appendChild(impDiv);
            }
            // 将导出节点作为子节点插入到指定节点中
            if (typeof this.opts.export != 'undefined' && this.settings.export.enable) {
                if (expDiv != null) {
                    var expFatherClassName = this.settings.export.appendToParentNode;
                    if (expFatherClassName == '') opertDiv.appendChild(expDiv);
                    else document.getElementsByClassName(expFatherClassName)[0].appendChild(expDiv);
                }
            }
            // 判断操作区域子节点是否空，若空则删除该节点
            if (opertDiv.childNodes.length == 0) {
                utils.removeNode(opertDiv);
            }
        }
        // 创建预览节点
        if (typeof this.opts.preview != 'undefined' && this.settings.preview.enable) {
            if (prewDiv != null) {
                var prewFatherClassName = this.settings.preview.appendToParentNode;
                if (prewFatherClassName == '') rootDiv.appendChild(prewDiv);
                else document.getElementsByClassName(prewFatherClassName)[0].appendChild(prewDiv);
            }
        }

        // 判断根节点内容是否为空，若空则删除根节点
        if (rootDiv.childNodes.length == 0) {
            utils.removeNode(rootDiv);
        }

        // 执行导入操作
        if (this.settings.import.enable) {
            var _impNode = document.getElementsByClassName(this.settings.import.btnClassName);
            if (_impNode.length != 0) {
                var uploadDom = document.getElementById('sheet-upload');
                _impNode[0].onclick = function () {
                    // console.log('aaa,我要开始导入数据了');
                    uploadDom.click();
                }
                uploadDom.addEventListener('change', function (e) {
                    // console.log('bbb,我要开始导入数据了');
                    var files = e.target.files;
                    if (files.length == 0) return;
                    var f = files[0];
                    if (!/\.xlsx$/g.test(f.name)) {
                        utils.dialogs('仅支持读取xlsx格式！');
                        return;
                    }
                    _this.readingWorkbookFromLocalFile(f, function (workbook) {
                        var sourceArr = _this.readWorkbook(workbook);
                        // console.log('数据源：', sourceArr);
                        if (_this.settings.import.callback) {
                            _this.settings.import.callback(sourceArr);  // 导入回调函数
                            if (_this.settings.import.canSecondChooseSameFile) {
                                uploadDom.value = ''; // 清空 input file 中的文件，如此同名文件便能第2次选择，否则同名文件只能选择一次
                            }
                        }
                    });
                });
            }
        }

        // 执行导出操作
        if (this.settings.export.enable) {
            var _expNode = document.getElementsByClassName(this.settings.export.btnClassName);
            if (_expNode.length != 0) {
                _expNode[0].onclick = function () {
                    if (_this.settings.export.callback) {
                        _this.settings.export.callback({});  // 导出回调函数
                    }
                }
            }
        }
    };
    
        
    
    //———————————————————————————————————————————————————
    /**
     * 执行导出EXCEL数据
     * @param {Array} arr 二维数组
     * @param {Object} opts 导出其它选项参数(可选)
     */
    EXCELS.prototype.exportExcel = function (arr, opts) {
        if (typeof this.settings == 'undefined') {
            this.intitialize({});
        }
        // arr 示例数据
        // var arr = [
        //     // ['主要信息', null, null, '其它信息'], // 特别注意合并的地方后面预留2个null
        //     ['姓名', '性别', '年龄', '注册时间'],
        //     ['张三', '男', 18, new Date()],
        //     ['李四', '女', 22, new Date()]
        // ];
        // var sheet = XLSX.utils.aoa_to_sheet(arr);
        // sheet['!merges'] = [
        //     // 设置A1-C1的单元格合并
        //     {s: {r: 0, c: 0}, e: {r: 0, c: 2}}
        // ];
        // 需要注意的地方就是被合并的单元格要用null预留出位置，否则后面的内容（本例中是第四列其它信息）会被覆盖。

        // 开始执行
        // 选项参数 opts 
        var origions = {
            merged: false, // 是否合并某些单元格，默认false
            mergeMethod: [ // 单元格合并方式，是一个数组。每个数组由包含s和e构成的对象组成，s表示开始，e表示结束，r表示行，c表示列。
                { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } } // 比如，这里设置A1-C1的单元格合并
            ],
            filename: '' // 自定义导出的文件名，默认空(可选)。本参数方便单独调用本函数时使用。当本参数值不为空时，优先权高于参数 export.filename
        }
        var config = utils.extend(true, {}, origions, opts || {});
        // 导出的文件名
        var today = utils.getCurrentTime();
        var randStr = utils.getRandomWord(8, 12, true);
        var file_name = config.filename.toString().replace(/\s+/g, '') !== '' ?
            config.filename
            :
            (
                this.settings.export.filename + '-' + ( this.settings.export.withNowTime ? today : randStr )
            );
        // 执行导出操作
        var sheet = XLSX.utils.aoa_to_sheet(arr);
        if (config.merged) { // 合并单元格
            sheet['!merges'] = config.mergeMethod;
        }
        this.openDownloadDialog(this.sheet2blob(sheet), file_name + '.xlsx');
    };
        
    


    //———————————————————————————————————————————————————
    //          以下N个方法为SheetJS原生提供的方法
    //———————————————————————————————————————————————————
    /**
     * 读取本地excel文件
     * @param {Object} file 本地excel文件
     * @param {Function} callback 回调函数
     * @returns {} 返回一个叫WorkBook的对象
     */
    EXCELS.prototype.readingWorkbookFromLocalFile = function (file, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary' 
            }); 
            // type 值
            // base64: 以base64方式读取；
            // binary: BinaryString格式(byte n is data.charCodeAt(n))
            // string: UTF8编码的字符串；
            // buffer: nodejs Buffer；
            // array: Uint8Array，8位无符号数组；
            // file: 文件的路径（仅nodejs下支持） 
            if (callback) callback(workbook);
        };
        reader.readAsBinaryString(file);
    };


    /**
     * 读取excel表格、读取workbook对象
     * @param {workbook} wb workbook对象
     */
    EXCELS.prototype.readWorkbook = function (wb) {
        var sheetNames = wb.SheetNames; // 工作表名称集合
        var worksheet = wb.Sheets[sheetNames[0]]; // 这里我们只读取第一张sheet
        // var opts = {
        //     /*'A'|number|string[]*/
        //     header: 'A', // 值：'A' 把表头当作表身数据，number 或 string[] 表头单独出来即表头还是表头数据
        //     /** Default value for null/undefined values */
        //     defval: ''// 给空的单元格赋值为空字符串，避免单元格被跳过(JSON解析出来后缺少相应的key)
        // }
        var opts = this.settings.import.format;
        // 将导入数据以表格的形式展示在界面上
        if (typeof this.opts.preview != 'undefined' && this.settings.preview.enable) {
            document.getElementsByClassName('sheet__output')[0].style = ''; // 显示预览区域
            var csv = XLSX.utils.sheet_to_csv(worksheet, opts); // 生成CSV格式
            document.getElementById(this.settings.preview.nodeId).innerHTML = this.csv2table(csv);
        }
        // 返回导入数据供调用
        var source = XLSX.utils.sheet_to_json(worksheet, opts); // 生成JSON格式
        return source;
    };



    /**
     * 将csv转换成简单的表格
     * 注意：会忽略单元格合并，在第一行和第一列追加类似excel的索引
     * @param {csv} csv csv对象
     * @returns {HTML} 返回表格table的HTML代表
     */
    EXCELS.prototype.csv2table = function (csv) {
        var _this = this;
        var html = '<table>';
        var rows = csv.split('\n');
        // rows.shift(); // 删除第一行
        rows.pop(); // 删除最后一行没用的
        rows.forEach(function (row, idx) {
            var columns = row.split(',');
            columns.unshift(idx + 1); // 添加行索引
            if (_this.settings.preview.hasTitleRow) {
                if (idx == 0) { // 添加列索引，即表头A、B、C、D、E、F .. 这行
                    html += '<tr>';
                    for (var i = 0; i < columns.length; i++) {
                        html += '<th>' + (i == 0 ? '' : String.fromCharCode(65 + i - 1)) + '</th>';
                    }
                    html += '</tr>';
                }
            }
            html += '<tr>';
            columns.forEach(function (column) {
                html += '<td>' + column + '</td>';
            });
            html += '</tr>';
        });
        html += '</table>';
        return html;
    };



    /**
     * 通用的打开下载对话框方法，没有测试过具体兼容性
     * @param url 下载地址，也可以是一个blob对象，必选
     * @param saveName 保存文件名，可选
     */
    EXCELS.prototype.openDownloadDialog = function(url, saveName) {
        if (typeof url == 'object' && url instanceof Blob) {
            url = URL.createObjectURL(url); // 创建blob地址
        }
        var aLink = document.createElement('a');
        aLink.href = url;
        aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
        var event;
        if (window.MouseEvent) event = new MouseEvent('click');
        else {
            event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);
    };
    


    /**
     * 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
     * @param {} sheet 
     * @param {*} sheetName 
     * @returns {Object} 返回一个blob对象
     */
    EXCELS.prototype.sheet2blob = function(sheet, sheetName) {
        sheetName = sheetName || 'sheet1';
        var workbook = {
            SheetNames: [sheetName],
            Sheets: {}
        };
        workbook.Sheets[sheetName] = sheet;
        // 生成excel的配置项
        var wopts = {
            bookType: 'xlsx', // 要生成的文件类型
            bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
            type: 'binary'
        };
        var wbout = XLSX.write(workbook, wopts);
        var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        // 字符串转ArrayBuffer
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
        return blob;
    };




    //———————————————————————————————————————————————————
    // 函数



    //================================================================
    // 工具库
    //================================================================
    var utils = {
        /**
         * 弹出提示信息对话框
         * @param {string} ps_str 提示信息字符串
         */
         dialogs:function(ps_str){
            var message = ps_str;
            if(typeof neuiDialog != 'undefined'){
                neuiDialog.alert({
                    message: message,
                    buttons: ['确定']
                })
            }else{
                message = message.toString().replace(/\<br\>/g, '\n'); //<br>换行\n以实现换行
                alert(message);
            }
        },



        /**
         * !!! 原生JS合并对象1
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
                    utils.dialogs('参数不是JSON对象，请检查！');
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
        },



        /**
         * 原生js向父节点中添加子节点，并将子节点插入到父节点内部的最前面
         * @param {HTML DOM} newNode newNode 子节点
         * @param {HTML DOM} existingNode  已存在的节点
         * add 20240929-1
         */
        prependChild: function (childNode, fatherNode) {
            var childrenNode = fatherNode.children; // 获取父节点的直接子元素
            // 将子节点插入到内部的最前面，但不包括style和script元素
            for (var i = 0; i < childrenNode.length; i++) {
                if (childrenNode[i].tagName === "STYLE" || childrenNode[i].tagName === "SCRIPT" || childrenNode[i].className === 'controls') {
                    continue; // 跳过style和script元素
                }
                fatherNode.insertBefore(childNode, childrenNode[i]);
                break; // 只插入一次，因为新节点会被插入到第一个非style/script元素之前
            }
        },
        


        /**
         * 原生js移除指定节点(兼容ie11-)
         * @param {HTML DOM} node 要移除的节点
         */
        removeNode: function(node){
            // node.remove();
            node.parentNode.removeChild(node);
        },



        /**
         * 获取当前时间
         * @returns 返回当前时间，精确到时分秒。 eg. 20240930121117
         */
        getCurrentTime: function () {
            var mydate = new Date(),
                year = mydate.getFullYear(),
                month = mydate.getMonth() + 1;
                day = mydate.getDate(),
                hour = mydate.getHours(),
                minute = mydate.getMinutes(),
                seconds = mydate.getSeconds();
            if (month < 10) month = '0' + month;
            if (day < 10) day = '0' + day;
            if (hour < 10) hour = '0' + hour;
            if (minute < 10) minute = '0' + minute;
            if (seconds < 10) seconds = '0' + seconds;
            var today = year + '' + month + '' + day + '' + hour + '' + minute + '' + seconds;
            return today;
        },


        /*
        * 生成N位随机数(字母+数字组成)
        * @param {number} min 最小位数(固定位数)
        * @param {number} max 最大位数(可选), 默认max=min
        * @param {boolean} isRandomed 是否任意长度(可选). true 是(默认), false 否. 值为false时,生成的字符长度为min指定的位数
        */
        getRandomWord: function(min, max, isRandomed) {
            max = typeof max == 'undefined' ? min : max;
            isRandomed = typeof isRandomed == 'undefined' ? true : (isRandomed === false ? false : true);
            var str = ''
            var range = min
            var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
            // 随机产生
            if (isRandomed) {
                range = Math.round(Math.random() * (max - min)) + min
            }
            for (var i = 0; i < range; i++) { // eslint-disable-line
                var pos = Math.round(Math.random() * (arr.length - 1))
                str += arr[pos]
            }
            return str;
        },
    };


    //================================================================
    // 返回对象
    //================================================================
    return EXCELS;
});


//———————————————————————————————————————————————————————————————————
// 二、创建“既是函数又是对象”的实例
//———————————————————————————————————————————————————————————————————
function createNewInstace(config){
    // 说明：bind()就是将函数绑定到某个对象上。 例如：f.bind(obj)，实际上可以理解为 obj.f()
    // 实例化一个对像
    var context = new EXCELS(config); // context 是一个实例化的对象，只能当对象使用，不能当函数使用。
    // 创建请求函数
    var instance = EXCELS.prototype.createSheetsExcels.bind(context); // instance 是一个函数，由 bind 返回的一个新函数，可以调用 instance()。
    // 将 对象原型链 prototype 对象中的方法添加到 instance 函数对象中
    // 为了实现能够将 instance 函数作为对象使用，我们就要将 对象原型链 prototype 对象中的方法添加给 instance 。毕竟函数也一个对象，也能够添加方法。
    Object.keys(EXCELS.prototype).forEach(function (item) {
        instance[item] = EXCELS.prototype[item].bind(context);
    });
    // 为 instance 函数对象添加属性
    Object.keys(context).forEach(function (item) {
        instance[item] = context[item];
    })
    return instance;
}
var neuiSheetExcel = createNewInstace();