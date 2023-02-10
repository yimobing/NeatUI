https://www.highcharts.com.cn/

/**
 * [neuiChart]
 * 交互图表控件 => 测试版
 * [说明] 本控件基于highcharts交互图表控件，使用本控件之前必须先引入 highcharts.js
 * [highcharts官网] https://www.highcharts.com.cn/
 * Version：v1.0.0
 * Author: Mufeng
 * QQ: 1614644937
 * Date: 2022.08.15
 * Update: 2023.02.10
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

    // add 20221108-1 by mufeng
    $.fn.extend({
        /**
         * 绘制曲线
         * @param {object} options 参数对象
         */
        drawCurvedLine: function(options){
            widgets._drawCurvedLine(options);
        },

        drawGuideLine: function(options){
            widgets._drawGuideLine(options);
        }
    });



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
    //  内部助手对象，用于辅助开发
    // 对象中的函数仅供内部使用，故用下划线_开头表示私有函数
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
            var chart = null;
            var options = {
               
                title: {
                    text: titleText
                },
                subtitle: {
                    text: subTitle
                },
                exporting: exporting,
                credits: copyRight, // 版权信息

                // INFO: X轴
                xAxis: {
                    categories: xArr,
                    crosshair: true,
                    labels: {
                        autoRotation: autoRotation, // true | false
                        rotation: rotation, // -45
                        useHTML: useHTML // true | false
                    },
                    // TEST: 动态增加标示线(x轴,与y轴平行)
                    plotLines:[{
                        color: 'red',            //线的颜色，定义为红色
                        dashStyle: 'longdashdot',//标示线的样式，默认是solid（实线），这里定义为长虚线
                        value: 4,                //定义在哪个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
                        width: 2                 //标示线的宽度，2px
                    }],

                    // TEST: 动态增加标示带
                    plotBands: [{
                        from: 5,               // 标示带开始值
                        to: 8,                 // 标示带结束值
                        label: {              // 标示带文字标签配置，详见API
                            text: '五月份',
                            align: 'center',
                            // textAlign: 'center', // 水平对齐。left, center, right
                            verticalAlign: 'middle' // 垂直对齐。top, middle, bottom
                        },
                        color: '',            // 标示带背景颜色
                        borderWidth: 1,        // 标示带边框宽度
                        borderColor: 'green',        // 标示带边框颜色
                        id: 'aaa',                 // 标示带 id，用于删除等操作
                        zIndex: 5,              // 标示带层叠，用于调整显示层次
                        events: {             // 事件，支持 click、mouseover、mouseout、mousemove等事件
                            click: function(e) {
                            },
                            mouseover: function(e) {
                            },
                            mouseout: function(e) {
                            },
                            mousemove: function(e) {
                            }
                        }
                
                    }]
                },

                // INFO: Y轴
                yAxis: {
                    title: {
                        text: yText + ( yUnit.toString().replace(/([ ]+)/g, '') === '' ? '' : ('（' + yUnit + '）') )
                    }
                    // TEST:动态增加标示线(y轴,与x轴平行)
                    ,plotLines:[{
                        color: 'green',           //线的颜色，定义为红色
                        dashStyle:'solid',     //默认值，这里定义为实线
                        value: 1200,               //定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
                        width: 2                //标示线的宽度，2px
                    }]
                },
                series: yArr,

                // INFO: 数据提示框
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y:.' + yDigit + 'f} ' + yUnit +'</b>' //point.y:.2f 表示保留2位小数，point.y:.0f 表示保留0位小数
                    // 固定位置显示数据提示框
                    // ,positioner: function() {
                    //     return {
                    //         x: 60,
                    //         y: 80
                    //     }
                    // }   
                },
                
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },
              
                // TEST: 图表事件
                chart: {
                    events: {
                        click: function(){
                            alert('点了图表111');
                        }
                    }
                },

                // TEST: 标示线事件1。这个会起作用，但 mouseOver 只触发一次，要移出图表再移进去才会触发多次
                plotOptions: {
                    series: {
                        /* label: {
                            connectorAllowed: false
                        },
                        pointStart: 2010, */
                        events: {
                            // TODO: 图例点击事件，不起作用
                            legendItemClick: function(e) {
                                /*
                                 * 默认实现是显示或隐藏当前数据列，e 代表事件， this 为当前数据列
                                 */
                                alert(555);
                                return false;
                            },
                            mouseOver: function(e){
                                console.log('移到标示线上面e：', e)
                            },
                            click: function(e){
                                console.log('点了标示线e：', e)
                            }
                        },

                        // 数据列事件
                        point: {
                            events: {
                                // INFO: 鼠标移动到数据列上时触发
                                mouseOver:function(e){
                                    // var chart = this.series.chart;
                                    // console.log('e：', e);
                                    var x = this.x;
                                    var y = this.y;
                                    console.log('x:', this.x, 'y:', this.y);
                                    // console.log('chart：', chart);
                                    // console.log('series：', this.series)
                                    var p = this.series.points[2]; // this.series[0].points[0];
                                    // console.log('p：', p);
                                    // chart.tooltip.refresh([ p ]);  // this.tooltip.refresh(p);
                                    addPlot(2); 
                                }
                            }
                        }
                    }
                },

                // TEST: 标示线事件2。这个不起作用 EMO
                plotLines:[{
                    //..., 省略代码
                    events:{
                        click:function(){
                             //当标示线被单击时，触发的事件
                             alert(1);
                        },
                        mouseover:function(){
                            //当标示线被鼠标悬停时，触发的事件
                            alert(2);
                        },
                
                        mouseout:function(){
                            //当标示线被鼠标移出时，触发的事件
                        },
                
                        mousemove:function(){
                            //当标示线被鼠标移动(时，触发的事件
                        }
                    }
                }],

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

            chart = Highcharts.chart(bindNode, options); // 生成折线图


            // TEST: 通过变量activePoint设置标识区/标识线位置
            function addPlot(activePoint) {
                 // 先删除标识线、标识区
                chart.xAxis[0].removePlotLine();
                chart.xAxis[0].removePlotBand();
                 // 再动态添加标识线
                chart.xAxis[0].addPlotLine({
                    value: activePoint,
                    color: '#b2cada',
                    width: 2,
                    zIndex: 1,
                });
                // 再动态添加标识区
                chart.xAxis[0].addPlotBand({
                    from: activePoint - 0.3,
                    to: activePoint + 0.3,
                    color: '#e4f2ff',
                })
            }


            
        }
  

    }; // END HELPERS





    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    //  部件对象，用于将自己写的部分代码封装成控件供前台调用
    // 对象中的函数仅供内部使用，故用下划线_开头表示私有函数
    //  add 20221108-1 by mufeng
    //———————————————————————————————————————————————————————————————————————————————————————————————————————————
    var widgets = {

        /**
         * 两点之间创建曲线
         * @param {object} options 对数对象
         */
         _drawCurvedLine: function(options){
            var defaults = {
                xyAxis: [ ], // xy轴坐标点数组(svg的)。要画线的所有点数组成数组，数组元素两两之间画一条线。eg. [{x: 'svg横坐标', y: 'svg纵坐标'}, {x: 'svg横坐标', y: 'svg纵坐标'}]
                dotAmount: 0, // 有几个点要画线(可选)。默认0。至少要有2个及以上的点画线才可以画线，单个点没法画线。

                lineColor: 'purple', // 线条颜色(可选)。默认紫色
                lineWidth: 2, // 线条宽度(可选)。默认2px
                
                offset: 80, // 曲线弯曲度(弯曲方向)(可选)。值：大于0向上，小于0向下，等于0则为直线
                always: false, // 是否可以一直画线(可选)。默认false。值为true时，假设要画线的点为3个，则界面上点击3次会画2条线，当击第5次时前面的线会清除掉，第4、5次点击的两个点画一条线，第5、6次点击的点画一条线

                svgObject: document.getElementsByClassName('highcharts-root')[0], // SVG DOM对象(可选)。如不传递，系统会自动获取SVG根节点对象。
                cleaned: false, // 是否清除所有曲线(可选)。默认false。如果要清空所有曲线，本参数传true即可。  
                callBack: null // 回调函数(可选)。传递一个参数event
            }
            var settings = $.extend(true, {}, defaults, options || {} );
            if(settings.svgObject == null || typeof settings.svgObject == 'undefined') return;
            //
            var idsClasses = 'curvature';
            var id = idsClasses + '-' + Math.floor(Math.random() * 10000);
            // 根据限定的条件删除之前节点
            var nodes = document.getElementsByClassName(idsClasses);
            var maxLineCount = parseInt(settings.dotAmount) - 1; // 最多画几条线，默认1(可选)
            if(isNaN(maxLineCount)) maxLineCount = 1;
            if(settings.always === true && nodes.length >= maxLineCount){
                for(var i = nodes.length - 1; i >= 0; i--){
                    if(nodes[i] != null) nodes[i].parentNode.removeChild(nodes[i]);
                }
                // $('.' + idsClasses).remove();
            }
            // 清除所有线
            if(settings.cleaned){ // 清除所有线
                for(var i = nodes.length - 1; i >= 0; i--){
                    if(nodes[i] != null) nodes[i].parentNode.removeChild(nodes[i]);
                }
                $.canDraw = true; // 重置为true
            }
            // 指定点为0时，不画线
            if(isNaN(parseInt(settings.dotAmount)) || parseInt(settings.dotAmount) <= 0) return;

            //test1
            // console.log('canDraw:', $.canDraw);
            // console.log('-------------------');
            // 限制绘制
            if($.canDraw === false) return; // test1
            
            // START 开始绘制 ~~~~~~~~~~~~~~~~
            var coordinateArr = settings.xyAxis;
            var start = coordinateArr.length - 2,
                end = coordinateArr.length - 1;
            if(start < 0) return;
            var p1x = parseFloat(coordinateArr[start].x),
                p1y = parseFloat(coordinateArr[start].y),
                p2x = parseFloat(coordinateArr[end].x),
                p2y = parseFloat(coordinateArr[end].y);
            // mid-point of line:
            var mpx = (p2x + p1x) * 0.5;
            var mpy = (p2y + p1y) * 0.5;
            // angle of perpendicular to line:
            var theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;
            // distance of control point from mid-point of line:
            var offset = settings.offset; // 调整曲线的弯曲方向向上或向下，即弯曲度
            // location of control point:
            var c1x = mpx + offset * Math.cos(theta);
            var c1y = mpy + offset * Math.sin(theta);

            // show where the control point is:
            // var c1 = document.getElementById("cp");
            // c1.setAttribute("cx", c1x);
            // c1.setAttribute("cy", c1y);
            // construct the command to draw a quadratic curve
            var d = "M" + p1x + " " + p1y + " Q " + c1x + " " + c1y + " " + p2x + " " + p2y;
            var SVG_NS = "http://www.w3.org/2000/svg";
            var svg = settings.svgObject; // document.getElementById('svgTest10');
            // var path = document.createElement('path'); // 使用此句无法显示路径
            var path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('class', idsClasses);
            path.setAttribute('id', id);
            path.setAttribute('stroke-width', settings.lineWidth);
            path.setAttribute('stroke', settings.lineColor);
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('fill', 'transparent');
            // path.setAttribute('d', curve);
            svg.appendChild(path);
            var curveElement = document.getElementById(id);
            curveElement.setAttribute("d", d);
            // 清除曲线
            // curveElement.setAttribute("d", "M0 0");
            // END 结束绘制 ~~~~~~~~~~~~~~~~
            // 回调
            if(settings.callBack){
                settings.callBack({
                    xyAxis: coordinateArr
                });
            }      
            // test1
            if(settings.always === false && coordinateArr.length == parseInt(settings.dotAmount)) $.canDraw = false;

        },



        /**
         * 绘制标示线
         * 即：绘制与x轴或y轴平行的线
         * @param {object} options 参数对象
         */
        _drawGuideLine: function(options){
            var defaults = {
                graphicObject: null, // 图表对象(即图表初始化的实例对象)
                event: null, // 图表点击位置的对象，即click事件里传递的参数对象
                xyAxis: [ ], // x、y轴svg坐标点数组。要画线的所有点数组成数组，数组元素两两之间画一条线。eg. [{x: 'svg横坐标', y: 'svg纵坐标'}, {x: 'svg横坐标', y: 'svg纵坐标'}]
                yData: [ ], // 要画的与x轴平行的直线组成数组，数组有几个元素，就代表有几条直线。eg. [{"value":"y轴数值", "description":"文本描述"}, {"value":"y轴数值", "description":"文本描述"} 
                dotAmount: 0, // 限定取几个点(可选)。默认0。至少要有2个及以上的点画线才可以画线，单个点没法画线。

                cleaned: false, // 是否清除所有线(可选)。默认false。如果要清空所有曲线，本参数传true即可
                callBack: null // 回调函数(可选)。传递一个参数event
            }
            var settings = $.extend(true, {}, defaults, options || {} );
            var chart = settings.graphicObject,
                event = settings.event;
            if(chart == null) return;
           
            // 记录要删除的Y线
            if(typeof $.toDelYLineIdsArr == 'undefined') $.toDelYLineIdsArr = [ ];
            // 清除所有线条
            if(settings.cleaned){ // 清除所有线
                for(var i = 0; i < $.toDelYLineIdsArr.length; i++){
                    chart.yAxis[0].removePlotLine($.toDelYLineIdsArr[i]);
                }
                chart.xAxis[0].removePlotLine('XLINE'); // 先删除标志线
                $.newDraw = true; // 重置为true
            }
            // console.log('要删除的id数组1：', $.toDelYLineIdsArr);
            // console.log('数组：', settings.xyAxis, '\n点数：', settings.dotAmount);
            // console.log('newDraw:', $.newDraw); 
            // console.log('-------------------');
            // 指定点为0时，不画线
            if(isNaN(parseInt(settings.dotAmount)) || parseInt(settings.dotAmount) <= 0) return;
            // 指定取N个点，只有当点了第N个点时才画线
            if(settings.xyAxis.length < parseInt(settings.dotAmount)) return;

            // START 开始绘制 ~~~~~~~~~~~~~~~~
            // 在y轴(与x轴平行)上画一条直线(标示线)
            var yPlotLine = {
                id: '', // 指定线的Id,删除线时需用到
                color: 'blue', // 线的颜色，定义为红色
                value: event.point.close, // 9 // 定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
                width: 1, // 标示线的宽度，2px
                dashStyle: 'solid', // 线条样式。值： solid, dash, dot
                label: {
                    text: '水平不错',
                    // align: 'left',
                    // textAlign: 'center',
                    // verticalAlign: 'middle',
                    x: event.chartX - 5,
                    y: event.chartY / 6,
                    style: {
                        'background-color': 'red',
                        'font-size': '16px',
                        'color': 'blue'
                    }
                }
            }
            var yData = settings.yData;
            for(var i = 0; i < yData.length; i++){
                var row = yData[i];
                var yIds = 'YLINE-' + Math.floor(Math.random() * 10000);
                // console.log('yIds:', yIds);
                $.toDelYLineIdsArr.push(yIds);

                yPlotLine.id = yIds;
                yPlotLine.value = row["value"];
                yPlotLine.label.text = row["description"];
                // chart.yAxis[0].removePlotLine(yIds); // 先删除标志
                // chart.yAxis[0].addPlotLine(yPlotLine);
                if($.newDraw == false) return;
                chart.yAxis[0].addPlotLine(yPlotLine);
            }
            // console.log('要删除的id数组2：', $.toDelYLineIdsArr);

            // 在x轴上画一条与y轴平行的直线(标示线)
            if(settings.yData.length > 0){
                // chart.xAxis[0].removePlotLine('XLINE'); // 先删除标志线
                chart.xAxis[0].addPlotLine({
                    id: 'XLINE', // 线的ID，删除时要用到
                    color: 'blue', // 线的颜色，定义为红色
                    value: event.point.category, // 定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
                    width: 1, // 标示线的宽度，2px
                    dashStyle: 'solid', // 线条样式。值： solid, dash, dot
                    // label: {
                    //     text: '垂直好的',
                    //     align: 'left',
                    //     textAlign: 'center'
                    // }
                })
            }
            // END 结束绘制 ~~~~~~~~~~~~~~~~

            // 回调
            if(settings.callBack){
                settings.callBack({
                    xyAxis: settings.xyAxis
                });
            }

            // 能否画线标记，借助于前一步画的曲线有设置id和class属性来判断
            var lineIdsClasses = 'curvature'; // 曲线的类名className属性，只能通过这个来判断当前画了多少条线了，哎~
            var nodes = document.getElementsByClassName(lineIdsClasses);
            if(nodes.length >= parseInt(settings.dotAmount) - 1){
                $.newDraw = false;
            }

        }



    }; // END WIDGETS








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






//———————————————————————————————————————————————————————————————————————————————————————————————————————————
//  自定义函数，供前台直接调用 add 20221108-1 by mufeng
//———————————————————————————————————————————————————————————————————————————————————————————————————————————
var neChartDrawCurveLine = function(options){
    $('body').drawCurvedLine(options);
};

var neChartDrawGuideLine = function(options){
    $('body').drawGuideLine(options);
};
