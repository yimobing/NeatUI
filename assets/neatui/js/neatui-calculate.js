/**************************
** ★★★★★★★★★★★★★
** 乘法小插件(calculate对象)
* Author: CHR
* QQ:     1614644937
* Date:   2017.11.30
** ★★★★★★★★★★★★★
** 功能:自动四舍五入,可传递保留小数位的参数
* @param obj 乘法结果绑定的元素的id或class值 | eg. obj='#result'
* @param e1  乘法分子1绑定的元素id或class | eg. e1='#jzmj'
* @param e2  乘法分子2绑定的元素id或class | eg. e2='#tdmj'
* @param digit 乘法结果保留的小数位,默认两位 | eg. digit=5
* 前台调用示例.
eg1.
calculate.init(e1,e2,e3); 					//初始化(页面一加载就算两个结果),默认2位小数
calculate.mutiplication(e1,e2,e3,5); //输入框变化时重新计算相乘结果,保留5位小数

eg2.计算两个数相乘的结果
var selector1 = '#jzmj', //id值1 绑定的乘法元素1
		selector2 = '#tdmj', //id值2  绑定的乘法元素2
		selector  = '#result'; //id值 绑定的乘法结果元素
calculate.init(selector,selector1,selector2); 					//初始化(页面一加载就算两个结果)，默认保留2位小数
calculate.mutiplication(selector,selector1,selector2,5); //输入框变化时重新计算相乘结果，保留5位小数
*/


var neuiCalculate = {
	init:function(obj,e1,e2,digit){ //===初始化
		var val = parseFloat($(e1).val()) * parseFloat($(e2).val());
		var decimal = this.digit(digit);
		this.result(obj,val,decimal); //calculate.result(result);
		
	},
	mutiplication:function(obj,e1,e2,digit){ //===文本框输入变化时
		$(e1 + ',' + e2).on('input',function(){
			var val = '';
			if($(this).attr('id') == e1.replace('#','')) val = parseFloat($(this).val()) * parseFloat($(e2).val());
			else val = parseFloat($(this).val()) * parseFloat($(e1).val());
			var decimal = calculate.digit(digit);
			calculate.result(obj,val,decimal); //这里不能使用this.result(val);因为this是指on('input')这个对象了
		});
	},
	
	result:function(obj,value,decimal){ //===赋值给乘法结果文本框
		var value = value.toFixed(decimal); //保留2位小数
		if(!isNaN(value)) $(obj).val(value);
		//else $(obj).val('输入无效,请输入数字哦!');
		else $(obj).val('');
	},
	digit:function(num){
		var decimal = '';
		if(typeof(num)=='undefined' || num =='') decimal = 2; //不传递参数时默认保留的2位小数
		else decimal = num; //
		return decimal;
	}
};