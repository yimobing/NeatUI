/**********************************************
* 将json（数组）转化成html5交互图所需的json（数组）
**********************************************/


 var $cfg_bindObjID = 'chartDiv'; //绑定的节点ID
 var subTitle = '(数据来源：快评)'; //数据来源
 //版权信息
 var copyRight = {
    //enabled: false, // 禁用版权信息
    text:'"快评"评估询价服务平台',
    href:'javascript:void(0)',
    position: {
        align: 'right',
        x: -10,
        verticalAlign: 'bottom',
        y: -5
    },
    style: {
        cursor: 'pointer',
        color: '#909090',
        fontSize: '10px'
    }
}

/*+-----------------------------------+*/
//=====HTML5交互图导出模块。请引入 exporting.js(导出jpg、png、pdf等) 和 export-data.js（导出excel）
//本地化导出按钮中的文字(即导出按钮汉化)，具体请参考 https://www.hcharts.cn/docs/basic-lang
Highcharts.setOptions({
    lang:{
        contextButtonTitle: "图表导出菜单",
        downloadJPEG:"下载 JPEG 图片",
        downloadPDF:"下载 PDF 文件",
        downloadPNG:"下载 PNG 文件",
        downloadSVG:"下载 SVG 文件",
        downloadCSV: '下载 CSV 文件',
        downloadXLS: '下载 XLS (Excel) 文件',
        printChart:"打印图表"
    }
});
var dafaultMenuItem = Highcharts.getOptions().exporting.buttons.contextButton.menuItems; //默认的导出菜单选项，是一个数组
//console.log(dafaultMenuItem);
//=====自定义导出模块选项
var $exportingJson = {
    enabled:true, //是否启用导出模块
    filename:'图表导出', //导出的文件名
    buttons: {
        contextButton: {
            // 自定义导出菜单项目及顺序
            menuItems: [
                //dafaultMenuItem[k]; //k值：0 全屏显示, 1 打印图表, 2 没有任何选项哦, 3 下载png, 4 下载jpg, 5 下载pdf, 6 下载svg文件, 7 没有任何选项，8 下载 csv文件，9 下载Excel(.xls)文件， 10 view data table
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
                    text: '下载 PDF 文件',
                    onclick: function() {
                        this.exportChart({
                            type: 'application/pdf'
                        });
                    }
                },
                {
                    text: '自定义项目',
                    onclick: function() {
                        alert('自定义项目');
                    }
                },
                dafaultMenuItem[1],
                {
                    text: '跳转链接',
                    onclick: function() {
                        window.location.href= 'https://www.xxxxxxx.com';
                    }
                }
                */
            ]
        }
    }
} //end exporting







////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**----------------
 * 转换图表对象
 * ----------------*/
var convertChart = {

    //--------------------------------------------------------
    /**
     * 将json转成柱状图x轴数组
     * @param {*} json 表格列表数据json
     */
    barXAxis:function(json){
        if(typeof json.data=='undefined'){
            return false;
        }
        var arr = [];
        for(i=0;i<json.data.length;i++){
            var row = json.data[i];
            arr.push(row['tjxm']);
        }
        return arr;
    },
    /**
     * 将json转成柱状图y轴数组
     * @param {*} yText Y轴名称
     * @param {*} json 表格列表数据json
     */
    barYAxis:function(yText,json){
        if(typeof json.data=='undefined'){
            return false;
        }
        var arr = [];
        var dataArr = [];
        for(i=0;i<json.data.length;i++){
            var row = json.data[i];
            dataArr.push(row['tjsz']);
        }
        dataArr = eval('[' + String(dataArr) + ']'); //字符串数组变成数字数组：eg. ['1','2','3'] => [1,2,3]
        var json = {"name":yText, "data":dataArr};
        arr.push(json);
        return arr;
    },


    //--------------------------------------------------------
    /**
     * 将json转成饼状图y轴数组
     * @param {*} yText Y轴名称
     * @param {*} json 表格列表数据json
     */
    pieYAxis:function(yText,json){
        if(typeof json.data=='undefined'){
            return false;
        }
        var arr = [];
        var dataArr = [];
        for(i=0;i<json.data.length;i++){
            var row = json.data[i];
            var name = row['tjxm'],
                y = row['tjsz'];
            y = eval(String(y));
            dataArr.push({"name":name, "y":y, " sliced":true, "selected":true});  
        }
        arr.push({"name": yText + '占比', "colorByPoint": true, "data":dataArr});
        return arr;                 
    },


    //--------------------------------------------------------
     /**
     * 将json转成折线图x轴数组
     * @param {*} json 表格列表数据json
     */
    lineXAxis:function(json){
        if(typeof json.data=='undefined'){
            return false;
        }
        var arr = [];
        for(i=0;i<json.data.length;i++){
            var row = json.data[i];
            arr.push(row['tjxm']);
        }
        return arr;
    },
    /**
     * 将json转成折线图y轴数组
     * @param {*} yText Y轴名称
     * @param {*} json 表格列表数据json
     */
    lineYAxis:function(yText,json){
        if(typeof json.data=='undefined'){
            return false;
        }
        var arr = [];
        var dataArr = [];
        for(i=0;i<json.data.length;i++){
            var row = json.data[i];
            dataArr.push(row['tjsz']);
        }
        dataArr = eval('[' + String(dataArr) + ']'); //字符串数组变成数字数组：eg. ['1','2','3'] => [1,2,3]
        var json = {"name":yText, "data":dataArr};
        arr.push(json);
        return arr;
    }

}






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**----------------
 * 刷新图表对象
 * ----------------*/
var refreshChart = {

    //--------------------------------------------------------
     /**
      * 刷新柱状图数据
      * @param {*} opt json参数
      */
    barData:function(opt){
        var defaults = {
            dataSource: {}, //表格json
            xText: '', //x轴文字
            yText: '', //y轴文字
            yUnit: '' //y轴单位,如元,万元,平米
        }
        var settings = $.extend(true,{},defaults,opt);
        var source = settings.dataSource,
            xText = settings.xText,
            yText = settings.yText,
            yUnit = settings.yUnit,
            dateStart = settings.dateStart,
            dateEnd = settings.dateEnd;

        var xArr = convertChart.barXAxis(source);
        var yArr = convertChart.barYAxis(yText,source);
        console.log('source：', source, '\nyText：', yText)

        var $titleText =  '根据 <strong>'+xText+'</strong> 统计 <strong>'+yText+'</strong><em style="margin-left:10px;font-size:12px;color:#f60;">（'+dateStart+' 至 '+dateEnd+'）</em>';
        $exportingJson.filename = filterChartHTMLTag($titleText) + getChartFileNameSuffix();
        //console.log('xArr:',xArr,'\nyArr:',yArr);
        var options = {
			chart: {
				type: 'column'
			},
			title: {
				text: $titleText
			},
			subtitle: {
				text: subTitle
            },
            exporting: $exportingJson,
			credits: copyRight, //版权信息
			xAxis: {
				categories:xArr,
				crosshair: true
			},
			yAxis: {
				min: 0,
				title: {
					text: yText + '（'+yUnit+'）'
				}
			},
			tooltip: {
				// head + 每个 point + footer 拼接成完整的 table
				headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
				'<td style="padding:0"><b>{point.y:.0f} ' + yUnit +' </b></td></tr>', //point.y:.2f 表示保留2位小数，point.y:.0f 表示保留0位小数
				footerFormat: '</table>',
				shared: true,
				useHTML: true
			},
			plotOptions: {
				column: {
					borderWidth: 0
				}
			},
			legend:{ //是否显示x轴图标
				enabled:false
			},
			series:yArr
        }
        
		var chart = Highcharts.chart($cfg_bindObjID,options);
    },


    //--------------------------------------------------------
     /**
      * 刷新饼状图数据
      * @param {*} opt json参数
      */
    pieData:function(opt){
        var defaults = {
            dataSource: {}, //表格json
            xText: '', //x轴文字
            yText: '', //y轴文字
            yUnit: '' //y轴单位,如元,万元,平米
        }
        var settings = $.extend(true,{},defaults,opt);
        var source = settings.dataSource,
            xText = settings.xText,
            yText = settings.yText,
            yUnit = settings.yUnit,
            dateStart = settings.dateStart,
            dateEnd = settings.dateEnd;
        var yArr = convertChart.pieYAxis(yText,source); 
        var $titleText =  '根据 <strong>'+xText+'</strong> 统计 <strong>'+yText+'</strong><em style="margin-left:10px;font-size:12px;color:#f60;">（'+dateStart+' 至 '+dateEnd+'）</em>';
        $exportingJson.filename = filterChartHTMLTag($titleText) + getChartFileNameSuffix();
        //console.log('yArr:',yArr)   
        var options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: $titleText
            },
            subtitle: {
                text:subTitle
            },
            exporting: $exportingJson,
            credits: copyRight, //版权信息
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %', //point.y:.2f 表示保留2位小数，point.y:.0f 表示保留0位小数
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series:yArr
        }

        var chart = Highcharts.chart($cfg_bindObjID,options);
    },


    //--------------------------------------------------------
     /**
      * 刷新折线图数据
      * @param {*} opt json参数
      */
    lineData:function(opt){
        var defaults = {
            dataSource: {}, //表格json
            xText: '', //x轴文字
            yText: '', //y轴文字
            yUnit: '' //y轴单位,如元,万元,平米
        }
        var settings = $.extend(true,{},defaults,opt);
        var source = settings.dataSource,
            xText = settings.xText,
            yText = settings.yText,
            yUnit = settings.yUnit,
            dateStart = settings.dateStart,
            dateEnd = settings.dateEnd;
        var xArr = convertChart.barXAxis(source);
        var yArr = convertChart.barYAxis(yText,source);
        var $titleText =  '根据 <strong>'+xText+'</strong> 统计 <strong>'+yText+'</strong><em style="margin-left:10px;font-size:12px;color:#f60;">（'+dateStart+' 至 '+dateEnd+'）</em>';
        $exportingJson.filename = filterChartHTMLTag($titleText) + getChartFileNameSuffix();
        //console.log('xArr:',xArr,'\nyArr:',yArr);
        var options = {
			title: {
				text: $titleText
			},
			subtitle: {
				text: subTitle
            },
            exporting: $exportingJson,
            credits: copyRight, //版权信息
			xAxis: {
			        categories:xArr,
			        crosshair: true
			},
			yAxis: {
				title: {
					text: yText + '（'+yUnit+'）'
				}
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y:.0f} ' + yUnit +'</b>' //point.y:.2f 表示保留2位小数，point.y:.0f 表示保留0位小数
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
			series: yArr,
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
        var chart = Highcharts.chart($cfg_bindObjID,options);
    }

   
} //end refreshChart 对象




/**
 * 过滤html标签
 * @param {*} msg 
 */
function filterChartHTMLTag(msg) {
    var msg = msg.replace(/<\/?[^>]*>/g, ''); //去除HTML Tag
    msg = msg.replace(/[|]*\n/, '') //去除行尾空格
    msg = msg.replace(/\ +/g,''); //去掉空格
    msg = msg.replace(/&npsp;/ig, ''); //去掉npsp
    return msg;
}

/**
 * 返回导出文件名后辍.eg 20191109165813
 */
function getChartFileNameSuffix(){
    var mydate = new Date(),
        year = mydate.getFullYear(),
        month = mydate.getMonth()+1;
        day = mydate.getDate(),
        hour = mydate.getHours(),
        minute = mydate.getMinutes(),
        seconds = mydate.getSeconds();
    if(month<10) month = '0'+month;
    if(day<10) day = '0'+day;
    if(hour<10) hour = '0'+hour;
    if(minute<10) minute = '0'+minute;
    if(seconds<10) seconds = '0'+seconds;
    var today = year+''+month+''+day+''+hour+''+minute+''+seconds;
    return today;
}