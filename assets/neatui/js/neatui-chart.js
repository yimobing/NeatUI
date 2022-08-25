https://www.highcharts.com.cn/

/**
 * [neuiChart]
 * 交互图表控件
 * [说明] 本控件基于highcharts交互图表控件，使用本控件之前必须先引入 highcharts.js
 * [highcharts官网] https://www.highcharts.com.cn/
 * Version：v1.0.0
 * Author: Mufeng
 * QQ: 1614644937
 * Date: 2022.08.15
 * Update: 2022.08.25
 */
;(function($){

    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    //  对外暴露接口
    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    $.fn.neuiChart = function(method){
        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }else if(typeof method === 'object' || !method){
            return methhods.init.apply(this. arguments);
        }else{
            $.error('Method ' + method + ' does not exist in jQuery');
        }
    };



    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    //  定义methods对象
    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    var methods = {

        /**
         * 初始化
         * @param {object} ootions 参数对象
         * @returns 
         */
        init: function(element, options){
            var me = element;
            if(element.length == 0){
                alert('控件绑定的节点不存在，请检查');
                return;
            }
            if(typeof Highcharts == 'undefined'){
                alert('交互图表控件不存在，请引入highcharts.js');
                return;
            }
            // 获取节点ID、类名属性
            var attrClass = element[0].className,
                attrId = element.attr('id'),
                isIdExisted = typeof attrId == 'undefined' || attrId.replace(/([ ]+)/g, '') === '' ? false : true; // ID属性是否存在
            // console.log('类名属性:', attrClass, '\nid属性:', attrId);
            var selector = !isIdExisted ? 
                    ( '.' + attrClass.replace(/([ ]+)/g, '.') )
                    : 
                    ( '#' + attrId.toString().replace(/([ ]+)/g, '') );
            var id = !isIdExisted ? '#neChart' : '#' + attrId;
            var className = '.' + attrClass.replace(/([ ]+)/g, '.');
            // console.log('className：', className, '\nID：', id, '\nselector：', selector);
            // console.log('-------------------')
            // 全局赋值
            me.id = id;
            me.className = className;
            me.selector = selector;
            // 更新节点信息
            element.addClass('ne-chart');
            element.attr('id', id.toString().replace(/\#/g, ''));
            
            // 交互图导出模块。请引入 exporting.js(导出jpg、png、pdf等) 和 export-data.js（导出excel），具体请参考 https://www.hcharts.cn/docs/basic-lang
            Highcharts.setOptions({  // 语言汉化
                lang:{
                    contextButtonTitle: "图表导出菜单",
                    viewFullscreen: "全屏显示", 
                    downloadJPEG: "下载 JPEG 图片",
                    downloadPDF: "下载 PDF 文件",
                    downloadPNG: "下载 PNG 文件",
                    downloadSVG: "下载 SVG 文件",
                    downloadCSV: "下载 CSV 文件",
                    downloadXLS: "下载 XLS (Excel) 文件",
                    printChart: "打印图表"
                }
            });
            var dafaultMenuItem = Highcharts.getOptions().exporting.buttons.contextButton.menuItems; // 默认的导出菜单选项是一个数组
            var extOrigins = { // 自定义导出模块选项
                enabled: true, // 是否启用
                filename: "图表导出", // 导出的文件名
                buttons: {
                    contextButton: {
                        // 自定义导出菜单项目及顺序
                        menuItems: [
                            // dafaultMenuItem[k]; // k 值：
                            // 0 全屏显示, 1 打印图表, 2 没有任何选项哦, 3 下载png, 4 下载jpg, 5 下载pdf, 
                            // 6 下载svg文件, 7 没有任何选项，8 下载 csv文件，9 下载Excel(.xls)文件， 10 view data table
                            dafaultMenuItem[0],
                            {separator: true},
                            dafaultMenuItem[4],
                            dafaultMenuItem[3],
                            dafaultMenuItem[5],
                            dafaultMenuItem[6],
                            dafaultMenuItem[8],
                            dafaultMenuItem[9],
                            dafaultMenuItem[1]
                            /*
                            {
                                text: "下载 PDF 文件",
                                onclick: function() {
                                    this.exportChart({
                                        type: "application/pdf"
                                    });
                                }
                            },
                            {
                                text: "自定义项目",
                                onclick: function() {
                                    alert("自定义项目");
                                }
                            },
                            dafaultMenuItem[1],
                            {
                                text: "跳转链接",
                                onclick: function() {
                                    window.location.href= "https://www.xxxxxxx.com";
                                }
                            }
                            */
                        ]
                    }
                }
            }


            // 默认参数
            var defaults = {
                // 自定义的参数
                title: "", // 标题(可选)
                subTitle: "", // 副标题(可选)
                source: { }, // 数据源
                xField: "", // x轴字段
                yField: "", // y轴字段
                xText: "", // x轴文字
                yText: "", // y轴文字
                //
                yUnit: "", // y轴单位(可选)
                yDigit: "", // y轴保留几位小数(可选)，默认空表示0位
                dateStart: "", // 开始日期(可选)
                dateEnd: "", // 结束日期(可选)
                exporting: { // 自定义导出模块选项
                    enabled: true, // 是否启用
                    filename: "图表导出", // 导出的文件名
                    fullScreen: true, // 导出项里是否有“全屏显示”项(可选)，默认true
                    items: ["JPG", "PNG", "PDF", "SVG", "CSV", "XLS", "PRINT"], // 导出项及顺序(可选)。JPG 图片, PNG图片, PDF 文档, SVG 图片, CSV 表格, XLS 表格, PRINT 打印图表
                },
                xAxis: { // x轴
                    rotate: { // 旋转(可选)
                        enable: true, // 文字是否旋转(可选)，默认true
                        rotation: -45 // 文字旋转角度(可选)，默认-45度。autoRotation=false时本参数失效
                    },
                    wrap: { // 换行(可选)
                        enable: false, // 文字换行显示(可选)，默认false。 true 时文字将不旋转，且一行仅有一个字
                        isDate: false // 文字是否日期类型(比如2022-08-16)(可选)，默认false。true时且wrap=true，则x轴文字将顺时针旋转90度，以实现换行效果
                    }
                },
                // 控件内置参数
                copyRight: { // 版权所有(可选)
                    enabled: false, // 是否启用(可选), 默认false
                    text: "小巧UI框架版权所有", // 版权声明文字
                    href: "javascript:void(0)", // 链接
                    position: { // 位置(可选)
                        align: "right",
                        x: -10,
                        verticalAlign: "bottom",
                        y: -5
                    },
                    style: { // 样式(可选)
                        cursor: "pointer",
                        color: "#909090",
                        fontSize: "10px"
                    }
                }
            }

            //
            var settings = $.extend(true, {}, defaults, options || { });
            // 设置导出选项
            var exportes = typeof options.exporting == 'undefined' ? defaults.exporting : options.exporting;
            extOrigins.enabled = exportes.enabled;
            extOrigins.filename = exportes.filename;
            extOrigins.buttons.contextButton.menuItems = [ ]
            if(exportes.fullScreen){
                extOrigins.buttons.contextButton.menuItems.push(dafaultMenuItem[0]);
                extOrigins.buttons.contextButton.menuItems.push( {separator: true} );
            }
            for(var i = 0; i < exportes.items.length; i++){
                var row = exportes.items[i].toLocaleUpperCase();
                var name = '';
                if(row == 'JPG') name = dafaultMenuItem[4];
                if(row == 'PNG') name = dafaultMenuItem[3];
                if(row == 'PDF') name = dafaultMenuItem[5];
                if(row == 'SVG') name = dafaultMenuItem[6];
                if(row == 'CSV') name = dafaultMenuItem[8];
                if(row == 'XLS') name = dafaultMenuItem[9];
                if(row == 'PRINT') name = dafaultMenuItem[1];
                extOrigins.buttons.contextButton.menuItems.push(name);
            }
            settings.exporting = extOrigins;
            // 全局赋值
            me.opts = settings;
            return me;
            // //
            // return this.each(function(){
            //     var $this = $(this); // 控件元素对象
            //     helpers._createBarGraph(me);
            // })

        }, // END INIT



        /**
         * 生成柱状图
         * @param {object} options 对数对象
         */
        bar: function(options){
            var me = methods.init(this, options);
            return this.each(function(){
                var $this = $(this); // 控件元素对象
                helpers._createBarGraph(me);
            })
        },


        /**
         * 生成饼状图
         * @param {object} options 对数对象
         */
         pie: function(options){
            var me = methods.init(this, options);
            return this.each(function(){
                var $this = $(this); // 控件元素对象
                helpers._createPieGraph(me);
            })
        },



        /**
         * 生成柱状图
         * @param {object} options 对数对象
         */
         line: function(options){
            var me = methods.init(this, options);
            return this.each(function(){
                var $this = $(this); // 控件元素对象
                helpers._createLineGraph(me);
            })
        }




    }; // END METHODS








    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    //  内部对象，对象中的函数仅供内部使用，故用下划线_开头表示私有函数
    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    var helpers = {

        /**
         * 生成柱状图
         */
         _createBarGraph: function(me){
            var source = me.opts.source,
                title = me.opts.title,
                subTitle = me.opts.subTitle,
                xText = me.opts.xText,
                yText = me.opts.yText,
                yUnit = me.opts.yUnit,
                yDigit = me.opts.yDigit,
                dateStart = me.opts.dateStart,
                dateEnd = me.opts.dateEnd,
                exporting = me.opts.exporting,
                copyRight = me.opts.copyRight, 
                bindNode = me.id.replace(/\#/g, '');
            // console.log('绑定的节点：', bindNode);
            // console.log('数据源:', source);
            var xArr = convert._getBarXData(source, me);
            var yArr = convert._getBarYData(yText, source, me);
            //
            var titleText = title.toString().replace(/([ ]+)/g, '') !== '' ? 
                            title 
                            : 
                            '根据 <strong>' + xText + '</strong> 统计 <strong>' + yText + '</strong>';
            if(dateStart != '' && dateEnd != ''){
                titleText += [
                    '<em style="margin-left:10px; font-size:12px; color:#f60;">（'+dateStart+' 至 ' + dateEnd + '）</em>'
                ].join('\r\n')
            }
            exporting.filename = tools.filterHTML(titleText) + tools.getChartFileNameSuffix();

            // x轴方向文字换行
            var xAxis = me.opts.xAxis;
            var autoRotation = me.opts.xAxis.rotate.enable,
                rotation = autoRotation === false ? 0 : me.opts.xAxis.rotate.rotation,
                isNewLine = me.opts.xAxis.wrap.enable,
                isDate = me.opts.xAxis.wrap.isDate;
            var useHTML = false;
            if(isNewLine && !isDate){ // 非日期类型的换行
                useHTML = false;
                autoRotation = false;
                rotation = 0;
                // 两个字符之间加换行符<br>
                var tmpArr = [ ]
                for(var i = 0; i < xArr.length; i++){
                    var row1 = xArr[i];
                    var str = '';
                    for(var j = 0; j < row1.length; j++){
                        var row2 = row1[j];
                        var n = row2.charAt(j);
                        str += row2 + '<br>';
                    }
                    tmpArr.push(str);
                }
                xArr = tmpArr;
            }
            else if(isNewLine && isDate){ // 日期类型的换行
                autoRotation = true;
                rotation = 90;
            }

            // 柱状图参数
            var options = {
                chart: {
                    type: 'column'
                },
                title: {
                    text: titleText
                },
                subtitle: {
                    text: subTitle
                },
                exporting: exporting,
                credits: copyRight, // 版权信息
                xAxis: {
                    categories: xArr,
                    crosshair: true, 
                    labels: {
                        autoRotation: autoRotation, // true | false
                        rotation: rotation, // -45
                        useHTML: useHTML // true | false
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: yText + ( yUnit.toString().replace(/([ ]+)/g, '') === '' ? '' : ('（' + yUnit + '）') )
                    }
                },
                series: yArr,
                tooltip: {
                    // head + 每个 point + footer 拼接成完整的 table
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}：</td>' +
                    '<td style="padding:0;"><b>{point.y:.' + yDigit + 'f} ' + yUnit +' </b></td></tr>', // point.y:.2f 表示保留2位小数，point.y:.0f 表示保留0位小数
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        borderWidth: 0
                    }
                },
                legend:{ // 是否显示x轴图标
                    enabled: false
                }
            }

            var chart = Highcharts.chart(bindNode, options); // 创建柱状图
        },



        /**
         * 生成饼状图
         */
        _createPieGraph: function(me){
            var source = me.opts.source,
                title = me.opts.title,
                subTitle = me.opts.subTitle,
                xText = me.opts.xText,
                yText = me.opts.yText,
                yUnit = me.opts.yUnit,
                yDigit = me.opts.yDigit,
                dateStart = me.opts.dateStart,
                dateEnd = me.opts.dateEnd,
                exporting = me.opts.exporting,
                copyRight = me.opts.copyRight, 
                bindNode = me.id.replace(/\#/g, '');
            // console.log('绑定的节点：', bindNode);
            // console.log('数据源:', source);
            var yArr = convert._getPieYData(yText, source, me); 
            //
            var titleText = title.toString().replace(/([ ]+)/g, '') !== '' ? 
                            title 
                            : 
                            '根据 <strong>' + xText + '</strong> 统计 <strong>' + yText + '</strong>';
            if(dateStart != '' && dateEnd != ''){
                titleText += [
                    '<em style="margin-left:10px; font-size:12px; color:#f60;">（'+dateStart+' 至 ' + dateEnd + '）</em>'
                ].join('\r\n')
            }
            exporting.filename = tools.filterHTML(titleText) + tools.getChartFileNameSuffix();
            // 饼状图参数
            var options = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: titleText
                },
                subtitle: {
                    text: subTitle
                },
                exporting: exporting,
                credits: copyRight, // 版权信息
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.' + yDigit + 'f}%</b> ({point.y}' + yUnit + ')'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.' + yDigit + 'f} % <br>({point.y}' + yUnit + ')', //point.y:.2f 表示保留2位小数，point.y:.0f 表示保留0位小数
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: yArr
            }
            var chart = Highcharts.chart(bindNode, options); // 生成饼状图
        },



        /**
         * 生成折线图
         */
        _createLineGraph: function(me){
            var source = me.opts.source,
                title = me.opts.title,
                subTitle = me.opts.subTitle,
                xText = me.opts.xText,
                yText = me.opts.yText,
                yUnit = me.opts.yUnit,
                yDigit = me.opts.yDigit,
                dateStart = me.opts.dateStart,
                dateEnd = me.opts.dateEnd,
                exporting = me.opts.exporting,
                copyRight = me.opts.copyRight, 
                bindNode = me.id.replace(/\#/g, '');
            // console.log('绑定的节点：', bindNode);
            // console.log('数据源:', source);
            var xArr = convert._getLineXData(source, me);
            var yArr = convert._getLineYData(yText, source, me);
            //
            var titleText = title.toString().replace(/([ ]+)/g, '') !== '' ? 
                            title 
                            : 
                            '根据 <strong>' + xText + '</strong> 统计 <strong>' + yText + '</strong>';
            if(dateStart != '' && dateEnd != ''){
                titleText += [
                    '<em style="margin-left:10px; font-size:12px; color:#f60;">（'+dateStart+' 至 ' + dateEnd + '）</em>'
                ].join('\r\n')
            }
            exporting.filename = tools.filterHTML(titleText) + tools.getChartFileNameSuffix();

            // x轴方向文字换行
            var xAxis = me.opts.xAxis;
            var autoRotation = me.opts.xAxis.rotate.enable,
                rotation = autoRotation === false ? 0 : me.opts.xAxis.rotate.rotation,
                isNewLine = me.opts.xAxis.wrap.enable,
                isDate = me.opts.xAxis.wrap.isDate;
            var useHTML = false;
            if(isNewLine && !isDate){ // 非日期类型的换行
                useHTML = false;
                autoRotation = false;
                rotation = 0;
                // 两个字符之间加换行符<br>
                var tmpArr = [ ]
                for(var i = 0; i < xArr.length; i++){
                    var row1 = xArr[i];
                    var str = '';
                    for(var j = 0; j < row1.length; j++){
                        var row2 = row1[j];
                        var n = row2.charAt(j);
                        str += row2 + '<br>';
                    }
                    tmpArr.push(str);
                }
                xArr = tmpArr;
            }
            else if(isNewLine && isDate){ // 日期类型的换行
                autoRotation = true;
                rotation = 90;
            }

            // 折线图参数
            var options = {
                title: {
                    text: titleText
                },
                subtitle: {
                    text: subTitle
                },
                exporting: exporting,
                credits: copyRight, // 版权信息
                xAxis: {
                    categories: xArr,
                    crosshair: true,
                    labels: {
                        autoRotation: autoRotation, // true | false
                        rotation: rotation, // -45
                        useHTML: useHTML // true | false
                    }
                },
                yAxis: {
                    title: {
                        text: yText + ( yUnit.toString().replace(/([ ]+)/g, '') === '' ? '' : ('（' + yUnit + '）') )
                    }
                },
                series: yArr,
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y:.' + yDigit + 'f} ' + yUnit +'</b>' //point.y:.2f 表示保留2位小数，point.y:.0f 表示保留0位小数
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },
                /*
                plotOptions: {
                    series: {
                        label: {
                            connectorAllowed: false
                        },
                        pointStart: 2010
                    }
                },
                */
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            legend: {
                                layout: 'horizontal',
                                align: 'center',
                                verticalAlign: 'bottom'
                            }
                        }
                    }]
                }
            }
            var chart = Highcharts.chart(bindNode, options); // 生成折线图
        }
        
    } // END HELPERS








    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    //  数据转换对象，对象中的函数仅供内部使用，故用下划线_开头表示私有函数
    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    var convert = {

        /**
         * 将数据源转化成柱状图x轴数组
         * @param {object} ps_source 数据源
         * @param {object} me 控件参数对象
         * @returns {Array} 返回数组
         */
         _getBarXData: function(ps_source, me){
            if(typeof ps_source.data == 'undefined'){
                return false;
            }
            var xField = me.opts.xField;
            var arr = [];
            for(i = 0; i < ps_source.data.length; i++){
                var row = ps_source.data[i];
                arr.push(row[xField]);
            }
            return arr;
        },



        /**
         * 将数据源转化成柱状图y轴数组
         * @param {string} yText y轴名称
         * @param {object} ps_source 数据源
         * @param {object} me 控件参数对象
         * @returns {Array} 返回数组
         */
        _getBarYData: function(yText, ps_source, me){
            if(typeof ps_source.data == 'undefined'){
                return false;
            }
            var yField = me.opts.yField;
            var arr = [];
            var dataArr = [];
            for(i = 0; i< ps_source.data.length; i++){
                var row = ps_source.data[i];
                dataArr.push(row[yField]);
            }
            dataArr = eval('[' + String(dataArr) + ']'); //字符串数组变成数字数组：eg. ['1','2','3'] => [1,2,3]
            var ps_source = {"name": yText, "data": dataArr};
            arr.push(ps_source);
            return arr;
        },


        
        /**
         * 将数据源转化成饼状图y轴数组
         * @param {string} yText y轴名称
         * @param {object} ps_source 数据源
         * @param {object} me 控件参数对象
         * @returns {Array} 返回数组
         */
        _getPieYData: function(yText, ps_source, me){
            if(typeof ps_source.data == 'undefined'){
                return false;
            }
            var xField = me.opts.xField,
                yField = me.opts.yField;
            var arr = [];
            var dataArr = [];
            for(i = 0; i < ps_source.data.length; i++){
                var row = ps_source.data[i];
                var name = row[xField],
                    y = row[yField];
                y = eval(String(y));
                dataArr.push({"name":name, "y":y, " sliced":true, "selected":true});  
            }
            arr.push({"name": yText + '占比', "colorByPoint": true, "data": dataArr});
            return arr;                 
        },



        /**
         * 将数据源转化成折线图x轴数组
         * @param {object} ps_source 数据源
         * @param {object} me 控件参数对象
         * @returns {Array} 返回数组
         */
        _getLineXData: function(ps_source, me){
            if(typeof ps_source.data == 'undefined'){
                return false;
            }
            var xField = me.opts.xField;
            var arr = [];
            for(i = 0;i < ps_source.data.length; i++){
                var row = ps_source.data[i];
                arr.push(row[xField]);
            }
            return arr;
        },



        /**
         * 将数据源转化成折线图y轴数组
         * @param {string} yText y轴名称
         * @param {object} ps_source 数据源
         * @param {object} me 控件参数对象
         * @returns {Array} 返回数组
         */
        _getLineYData: function(yText, ps_source, me){
            if(typeof ps_source.data == 'undefined'){
                return false;
            }
            var yField = me.opts.yField;
            var arr = [];
            var dataArr = [];
            for(i = 0;i < ps_source.data.length; i++){
                var row = ps_source.data[i];
                dataArr.push(row[yField]);
            }
            dataArr = eval('[' + String(dataArr) + ']'); //字符串数组变成数字数组：eg. ['1','2','3'] => [1,2,3]
            var ps_source = {"name": yText, "data": dataArr};
            arr.push(ps_source);
            return arr;
        }


    }; // END CONVERT








    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    //  工具箱
    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    var tools = {
        /**
         * 过滤HTML代码
         * @param {string} ps_str 原始字符串
         * @returns {string} 返回新字符串
         */
        filterHTML: function(ps_str) {
            var ps_str = ps_str.replace(/<\/?[^>]*>/g, ''); // 去除HTML
            ps_str = ps_str.replace(/[|]*\n/, '') // 去除行尾空格
            ps_str = ps_str.replace(/\ +/g,''); // 去掉空格
            ps_str = ps_str.replace(/&npsp;/ig, ''); // 去掉npsp
            return ps_str;
        },


        /**
         * 获取导出文件名后辍
         * @returns {string} 返回文件名后辍字符串
         */
        getChartFileNameSuffix: function(){
            var mydate = new Date(),
                year = mydate.getFullYear(),
                month = mydate.getMonth()+1;
                day = mydate.getDate(),
                hour = mydate.getHours(),
                minute = mydate.getMinutes(),
                seconds = mydate.getSeconds();
            if(month < 10) month = '0' + month;
            if(day < 10) day = '0' + day;
            if(hour < 10) hour = '0' + hour;
            if(minute < 10) minute = '0' + minute;
            if(seconds < 10) seconds = '0' + seconds;
            var today = year + '' + month + '' + day + '' + hour + '' + minute + ''+ seconds;
            return today;
        }

    }; // END TOOLS




    


    
})(jQuery);