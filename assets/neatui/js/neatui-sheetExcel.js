
/**
 * --------------------------------------------------------------------------------
 * [neuiSheetExcel]
 * 导入导出EXCEL控件
 * 利用JS实现纯前端导入和导出excel文件 (基于SheetJS出品的js-xlsx库进行二次封装)
 * [局限说明] 本控件只支持xlsx格式即excel 2007+。对于xls格式即excel 2003及以下产品不支持！
 * [原生库说明]
    由SheetJS出品的js-xlsx是一款非常方便的只需要纯JS即可读取和导出excel的工具库，功能强大，支持格式众多，支持xls、xlsx、ods(一种OpenOffice专有表格文件格式)等十几种格式。本控件全部都是以xlsx格式为例。
 * [缺点说明]
    sheetJS库基础版(免费的)无法实现带样式导出(如字体大小、单元格居中等)，但可以使用基于其扩展的开源项目xlsx-js-style来实现，即xlsx-js-style用于实现基本表格样式。
 * [库文件参考]
    ~~~~~~~~~~~~~~~~~~~~~~~~~~
    【sheetJS js-xlsx 基础库】
    ~~~~~~~~~~~~~~~~~~~~~~~~~~
    说明：有分基础版和完整版2个版本, 基础版免费，完整版加入了更多功能故是收费的
    官网： https://sheetjs.com/
    GitHub： https://github.com/SheetJS/sheetjs/blob/master/dist/
    其中： xlsx.core.min.js 是基础版(免费的), xlsx.full.min.js 是完整版(有些功能要收费的)。一般下载基础版(免费的)即可。
    参考：
     1. https://blog.csdn.net/lgd1917/article/details/122449774
     2. http://t.zoukankan.com/javalinux-p-15631834.html
     ~~~~~~~~~~~~~~~~~~~~~~~~~~
    【xlsx-js-style 表格样式库】
    ~~~~~~~~~~~~~~~~~~~~~~~~~~
    说明：开源免费，核心API就是SheetJS的
    NPM:  https://www.npmjs.com/package/xlsx-js-style
    GitHub： https://github.com/gitbrent/xlsx-js-style/blob/master/dist/
    其中：下载 xlsx.bundle.js 即可
    参考：
    1. https://www.jianshu.com/p/72f668099403
    2. https://www.jianshu.com/p/80091cf3201a
 * --------------------------------------------------------------------------------
 * Author: Mufeng
 * Date: 2024.09.29
 * Update: 2024.10.22
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
        window.NXcls = factory();
    }
})(this, function(){

    //================================================================
    // 构造函数
    //================================================================
    function Widget() {
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
                filename: '导出文件', // 导出的文件名(可选)
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
    Widget.prototype.intitialize = function (options) {
        if (typeof XLSX == 'undefined') {
            var tips = '错误警告1：导入导出EXCEL控件需SheetJS js-xlsx工具库(xlsx.core.min.js)支持。<br>请先引入此JS文件。<br>如无，请先下载xlsx基础版(免费的)<br>https://github.com/SheetJS/sheetjs/blob/master/dist/xlsx.core.min.js<br>官网：https://sheetjs.com';
            console.error(tips.toString().replace(/<br>/g, '\n'));
            utils.dialogs('当前控件基于js-xlsx<br>请引入: xlsx.core.min.js<br>具体信息F12查看控制台');
            return;
        }
        this.opts = options;
        // this.settings = utils.extend(true, {}, this.defaults, this.opts || {});
        this.settings = utils.combine(true, this.defaults, this.opts || {});
    };


    

    //———————————————————————————————————————————————————
    /**
     * !!! 创建控件
     * @param {Object} options 控件参数
     */
    Widget.prototype.createSheetsExcels = function (options) {
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
    Widget.prototype.exportExcel = function (arr, opts) {
        if (typeof this.settings == 'undefined') {
            this.intitialize({});
        }
        // arr 示例数据 eg.
        // var arr = [
        //     // ['主要信息', null, null, '其它信息', null], // 特别注意合并的地方后面预留2个null
        //     ['姓名', '性别', '年龄', '籍贯', '注册时间'],
        //     ['张文远', '男', 18, '福建省-泉州市-鼓楼区', new Date()],
        //     ['李桂英', '女', 22, '福建省-泉州市-丰泽区', new Date()],
        //     ['赵胜才', '男', "45", '福建省-泉州市-晋江市', new Date()]
        // ];
        // var sheet = XLSX.utils.aoa_to_sheet(arr);
        // sheet['!merges'] = [
        //     // 设置A1-C1的单元格合并
        //     {s: {r: 0, c: 0}, e: {r: 0, c: 2}}
        // ];
        // 需要注意的地方就是被合并的单元格要用null预留出位置，否则后面的内容（本例中是第四列其它信息）会被覆盖。

        // 单元格样式 格式 eg.
        var cellFormatStyle = {
            font: { // 字体设置
                sz: 9, // 大小
                bold: false // 是否加粗
                // ,color: { // 颜色
                //     rgb: '000000' // 十六进制，不带#
                // },
                // name: 'Arial', // 字体名称，如 宋体, 仿宋, 微软雅黑, Microsoft YaHei, Arial, Calibri
                // italic: false, // 是否斜体
                // strike: false, // 是否中划线,中间删除线
                // underline: false // 是否下划线
            },
            alignment: { // 对齐方式
                horizontal: "left", // 水平对齐. "left" or "center" or "right"
                vertical: "center", // 垂直对齐. "top" or "center" or "bottom"
                wrapText: true // 是否允许文本换行
            },
            border: { // 单元格边框
              // eg. { style: 'thin', color: { rgb: 'dddddd' } } 
              // 其中 style 的值: dashDotDot, dashDot, dashed, dotted, hair, mediumDashDotDot, mediumDashDot, mediumDashed, medium, slantDashDot, thick, thin
              top: { style: 'thin' },
              right: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' }
            }
            // ,fill: { // 单元格填充
            //     bgColor: { // 背景色
            //         rgb: '1296db' // 十六进制，不带#
            //     },
            //     fgColor: { // 前景色
            //         rgb: 'ffffff'
            //     },
            //     patternType: 'solid' // 值： solid 或 none
            // },
            // numFmt: "",  // 对数字类型的单元格进行格式化，类型为数字或字符串。可能的值. "0",  "0.0%", "0.00%", "0.00%;\\(0.00%\\);\\-;@",  "m/dd/yy" 
        };

        // 选项参数 opts 
        var origions = {
            sheetName: 'sheet1', // 工作表名，默认 sheet1(可选)
            filename: '', // 自定义导出的文件名，默认空(可选)。本参数方便单独调用本函数时使用。当本参数值不为空时，优先权高于参数 export.filename
            merged: { // 表格单元格合并(可选)
                enable: false, // 是否启用功能，默认false(可选)
                pattern: [ // 单元格合并方式，是一个数组，默认空数组(可选)。每个数组由包含s和e构成的对象组成，s表示开始，e表示结束，r表示行，c表示列。r从0开始,0表示第1行,1第2行,以此类推; c也从0开始,0表示第1列,1表示第2列,以此类推。
                    // { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // 比如，这里设置第1行A1-C1的单元格合并
                    // { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } } // 比如，这里设置第2行B2-E2的单元格合并
                ]
            },
            columnWidth: { // 表格单元格列宽(可选)
                enable: false, // 是否启用功能，默认false(可选)
                pattern: [ // 单元格列宽方式，是一个数组，默认空数组(可选)。每个数组由包含wch或wpx构成的对象组成，wpx 字段表示以像素为单位，wch 字段表示以字符为单位(1个汉字等于2个字符)。
                    // 注：数组中第N个元素代表表格第N列。若表格共有M列,则数组元素个数<=M,即数组元素个数可以小于M个
                    // { wch: 30 }, // 比如，这里设置第1列的宽。30表示30/2=15个字
                    // { wch: 40 }, // 比如，这里设置第2列的宽。40表示40/2=20个字
                ]
            },
            styled: { // 表格单元格样式(可选)
                enable: false, // 是否启用功能，默认false(可选)
                allowEveryCell: false, // 所有单元格样式，是否给所有单元格设置一个默认的样式，默认false(可选)。仅当 enable = true 时有效。
                pattern: [ // 个别单元格样式，默认空数组(可选)。注：个别单元格的样式将覆盖所有单元格设置的样式。
                    // cell 某个单元格如 A1, B1, C1; format 单元格样式, 是一个Object对象, 格式参考变量 cellFormatStyle, 默认null表示不配置样式
                    // { cell: "A1", format: null },
                    // { cell: "B1", format: null }, 
                    // { cell: "C1", style: cellFormatStyle },
                ]
            }
        }
        var config = utils.combine(true, origions, opts || {});
        // 导出的文件名
        var today = utils.getCurrentTime();
        var randStr = utils.getRandomWord(8, 12, true);
        var sheet_name = config.sheetName.toString();
        var file_name = config.filename.toString().replace(/\s+/g, '') !== '' ?
            config.filename
            :
            (
                this.settings.export.filename + '-' + ( this.settings.export.withNowTime ? today : randStr )
            );
        // 数据变成工作表
        var work_sheet = XLSX.utils.aoa_to_sheet(arr);
        // 合并单元格
        if (config.merged.enable) { 
            work_sheet['!merges'] = config.merged.pattern;
        }
        // 设置单元格列宽
        if (config.columnWidth.enable) {
            work_sheet['!cols'] = config.columnWidth.pattern;
        }
        // 设置单元格样式. 以下是样式设置，样式设置放在组织完数据之后
        if (config.styled.enable) {
            if (!utils.isJsFileLoaded('xlsx.bundle.js')) {
                var tips = '错误警告2：设置导出数据的单元格样式需xlsx-js-style工具库(xlsx.bundle.js)支持，请引入此JS文件<br>该库文件用于设置导出EXCEL数据时单元格的样式！<br>如不加载该库文件，则您所设置的样式将不起作用！<br>下载地址：https://github.com/gitbrent/xlsx-js-style/blob/master/dist/xlsx.bundle.js';
                console.error(tips.toString().replace(/<br>/g, '\n'));
                utils.dialogs('请引入: xlsx.bundle.js <br>该库文件用于设置单元格样式<br>具体信息查看F12控制台');
            }
            else {
                // 设置所有单元格样式
                if (config.styled.allowEveryCell) {
                    Object.keys(work_sheet).forEach(key => {
                        // 非!开头的属性都是单元格
                        if (!key.startsWith("!")) {
                            // 注意：now_styes 只能定义在 forEach 循环内，否则单元格的数据要是为数值型的话，部分会显示为 1900/1/22
                            var now_styes = {
                                font: {
                                    sz: 9
                                },
                                alignment: {
                                    horizontal: "left",
                                    vertical: "center",
                                    wrapText: true
                                },
                                border: {
                                    top: { style: 'thin' },
                                    right: { style: 'thin' },
                                    bottom: { style: 'thin' },
                                    left: { style: 'thin' }
                                }
                            };
                            work_sheet[key].s = now_styes;
                        }
                    });
                }
                
                // 设置个别单元格样式
                for (var i = 0; i < config.styled.pattern.length; i++) {
                    var one = config.styled.pattern[i];
                    var _cell = one.cell, _format = one.format;
                    // console.log('typeof：', typeof work_sheet[_cell].s);
                    if (_format != null) {
                        if (typeof (work_sheet[_cell]) == 'undefined')
                            console.error('无法设置单元格' + _cell + '的样式，因为它可能是合并后的单元格或者根本不存在此单元格，请检查！')
                        else
                            work_sheet[_cell].s = _format;
                    }
                }
            }
        }
        // 数据格式化并导出
        this.openDownloadDialog(this.sheet2blob(work_sheet, sheet_name), file_name + '.xlsx');
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
    Widget.prototype.readingWorkbookFromLocalFile = function (file, callback) {
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
    Widget.prototype.readWorkbook = function (wb) {
        var sheetNames = wb.SheetNames; // 工作表名称集合
        var worksheet = wb.Sheets[sheetNames[0]]; // 这里我们只读取第一张sheet
        // opts 格式 eg.
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
    Widget.prototype.csv2table = function (csv) {
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
    Widget.prototype.openDownloadDialog = function(url, saveName) {
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
     * @param {Object} sheet 工作表实例化对象
     * @param {String} sheetName 工作表名(可选)。默认sheet1
     * @returns {Object} 返回一个blob对象
     */
    Widget.prototype.sheet2blob = function(sheet, sheetName) {
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
         * 判断是否加载了某个JS文件
         * @param {String} jsFilePath js文件名称或文件路径. eg. aaa.js
         * @returns {Boolean} 返回布尔值true或false
         */
        isJsFileLoaded: function(jsFilePath) {
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src && scripts[i].src.includes(jsFilePath)) {
                    return true;
                }
            }
            return false;
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
         * 原生JS合并对象2
         * 即用两个对象来拓展，返回拓展后的新对象
         * @param {boolean} deep 是否深度合并，默认false
         * @param {object} defs 第1个被合并的对象(可选)。
         * @param {object} opts 第2个被合并的对象(可选)。
         * @param {object} method 其它操作方式(可选). 
            可传值1：选择是否要遍历对象的原型链(默认true) { includePrototype: false } 。 
            可传值2：foreach 对每个合并项进行自定义处理. {
                    forEach: function(target, name, sourceItem) {
                        target[name] = sourceItem + 'hello， 自定义每个合并项';
                        return target;
                    }
                }
        * @returns {object} 返回合并后的目标对象
        */
        combine: function(deep, defs, opts, method){
            var options = {};
            if(typeof deep === 'boolean') options = { isDeep: deep === false ? false : true };
            else options =  { isDeep: false }
            if(typeof method === 'object') options = method;
            /**
             * 子函数：合并对象
             * @param {object} options 选项
             * @returns {object} 返回合并后的对象
             * [参考]：https://segmentfault.com/a/1190000011492291
             * [示例]
                // eg1.普通合并(浅合并)
                var target = EXT().merge(data1, data2);
                // eg2. isDeep 选择是否进行深合并。true 深度合并, false 浅合并，默认true
                var target = EXT({ isDeep: false }).merge(data1, data2);
                // eg3. includePrototype：选择是否要遍历对象的原型链，默认为 true
                var target = EXT({ includePrototype: false }).merge(data1, data2);
                // eg4. forEach：对每个合并项进行自定义处理
                var target = EXT({
                    forEach: function(target, name, sourceItem) {
                        target[name] = sourceItem + 'hello， 自定义每个合并项';
                        return target;
                    }
                }).merge(data1, data2);
            */
            function EXT(options) {
                return new EXT.prototype.init(options);
            };
            EXT.fn = EXT.prototype = {
                type: function(o) {
                    return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
                },
                typeMap: {
                    object: function() {
                        return {};
                    },
                    array: function() {
                        return [];
                    }
                },
                // 默认配置项
                defaults: {
                    // 是否深合并
                    isDeep: true,
                    // 是否遍历合并源对象原型链上的属性
                    includePrototype: true,
                    // 用于对每个合并项进行自定义修正
                    forEach: function(target, name, sourceItem) {
                        target[name] = sourceItem;
                        return target;
                    }
                },
                // 将配置项合并到默认配置项
                init: function(options) {
                    for (var name in options) {
                        this.defaults[name] = options[name];
                    }
                    return this;
                },
                merge: function() {
                    var self = this,
                        _default = self.defaults,
                        i = 1,
                        length = arguments.length,
                        target = arguments[0] || {},
                        source,
                        targetItem,
                        sourceItem,
                        tiType,
                        siType,
                        clone,
                        name;
                    for (; i < length; i++) {
                        // 判断源对象是否为空
                        if ((source = arguments[i]) != null) {
                            for (name in source) {
                                var hasPro = source.hasOwnProperty(name);
                                // 是否遍历源对象的原型链
                                if (hasPro || _default.includePrototype) {
                                    targetItem = target[name];
                                    sourceItem = source[name];
                                    tiType = self.type(targetItem);
                                    siType = self.type(sourceItem);
                                    // 防止出现回环
                                    if (target === sourceItem) {
                                        continue;
                                    }
                                    // 如果复制的是对象或者数组
                                    if (_default.isDeep && sourceItem != null && self.typeMap[siType]) {
                                        clone = targetItem != null && tiType === siType ? targetItem : self.typeMap[siType]();
                                        // 递归
                                        target[name] = self.merge(clone, sourceItem);
                                    } else {
                                        clone = hasPro ? target : target.__proto__;
                                        // 处理每一个合并项
                                        clone = _default.forEach.call(self, clone, name, sourceItem);
                                    }
                                }
                            }
                        }
                    }
                    return target;
                }
            };
            EXT.fn.init.prototype = EXT.fn;

            // 调用并返回结果
            return EXT(options).merge(defs, opts);
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
    return Widget;
});


//———————————————————————————————————————————————————————————————————
// 二、创建“既是函数又是对象”的实例
//———————————————————————————————————————————————————————————————————
function createNewInstace(config){
    // 说明：bind()就是将函数绑定到某个对象上。 例如：f.bind(obj)，实际上可以理解为 obj.f()
    // 实例化一个对像
    var context = new NXcls(config); // context 是一个实例化的对象，只能当对象使用，不能当函数使用。
    // 创建请求函数
    var instance = NXcls.prototype.createSheetsExcels.bind(context); // instance 是一个函数，由 bind 返回的一个新函数，可以调用 instance()。
    // 将 对象原型链 prototype 对象中的方法添加到 instance 函数对象中
    // 为了实现能够将 instance 函数作为对象使用，我们就要将 对象原型链 prototype 对象中的方法添加给 instance 。毕竟函数也一个对象，也能够添加方法。
    Object.keys(NXcls.prototype).forEach(function (item) {
        instance[item] = NXcls.prototype[item].bind(context);
    });
    // 为 instance 函数对象添加属性
    Object.keys(context).forEach(function (item) {
        instance[item] = context[item];
    })
    return instance;
}
var neuiSheetExcel = createNewInstace();