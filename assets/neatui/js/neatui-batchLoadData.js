/**
 * [neuiBatchesData]
 * 分批加载数据控件
 * 特点：可根据"滚动条滚动到底部的次数"将大量数据分批次展示, 防止卡顿
 * eg. 假设数据源有一百条数据,分批次展示,第1次5条,第2次5条...到第20次把数据全部展示完成
 * 控件内函数首字母大小写说明: 大写为内部使用, 小写为供外部调用
 * Author:ChenMufeng
 * Date: 2020.04.22
 * Update:2020.04.22
 * 
 * 
*/



function BatchLoadData(){
	this.options = {
		datasource:{}, //JSON数据源
		totalSize:0, //数据源总记录数
		itemSize:10, //每次展示几条数据
	}
}

BatchLoadData.prototype = (function(){

	/**
	 * 设置参数
	 * @param {*} options 
	 */
	function setOptions(options){
		for(var attr in options){
			this.options[attr] = options[attr];
		}
		var source = this.options.datasource;
		var totalSize = typeof source["data"] == 'undefined' ? 0 : source["data"].length;
		var itemSize = totalSize < this.options.itemSize ? totalSize : this.options.itemSize;

		this.options.itemSize = itemSize;
		this.options.totalSize = totalSize;
		this.pos = 0; //滚动到底次数,默认0
		
	}



	/**
	 * 获取滚动条可滚动到底部的(最大)次数
	 */
	function GetScrollMaxTimes(_this){
		//console.log('options:', _this.options)
		var length = _this.options.totalSize;
		var times = length < _this.options.itemSize ? 0 : Math.ceil(length / _this.options.itemSize);
		return times - 1;
	}


	/**
	 * 创建滚动节点
	 * @param {*} dom 滚动节点. 可以是节点字符串ID值, 或节点对象(如window)
	 */
	function createDom(dom){
		var _this = this;
		if(typeof dom == 'string'){
			var bar = document.createElement(dom);
			bar.style.width = '19px';
			bar.style.overflowY = 'scroll';
			bar.style.overflowX = 'hidden';
			dom = document.getElementById(dom);
		}else{
			
		}
		
		if(dom.attachEvent){ //兼容IE7、IE8
            dom.attachEvent('onscroll',function(){ WindowScroll(_this); })
        }else{
        	dom.addEventListener('scroll',function(){ WindowScroll(_this); }, false)
		}
	}


	
	/**
	 * 获取当前要展示的数据
	 */
	function getData(){
		var _this = this;
		var totalSize = _this.options.totalSize;
		var itemSize = _this.options.itemSize;
		var startIndex = _this.pos * itemSize;
		var $json = {data:[]}
		for(var i = 0; i < itemSize; i++){
			var endIndex = totalSize - 1;
			var nowIndex =  startIndex > endIndex ? endIndex : startIndex;
			var index = nowIndex + i;
			//console.log('index:', index);
			if(index > endIndex) {
				break;
			}
			var row = _this.options.datasource.data[index];
			$json.data.push(row);
		}
		return $json;
	}




	/**
	 * 普通节点滚动时
	 * @param {*} _this 
	 */
	function DomScroll(_this){

	}


	/**
	 * window节点滚动时
	 * @param {*} _this 
	 */
	function WindowScroll(_this){
		var winH = $(window).height();
		var docH = $(document).height();
		var top = $(window).scrollTop();
		if( (winH + top) >= (docH - 50) ){ //滚动条滚动到底部(预留50px前)了
			_this.pos++; //滚动到底次数+1
			if(_this.pos <= GetScrollMaxTimes(_this)){
				//console.log('滚动到底部了,第', _this.pos, '次'); //testing
				_this.onScroll(_this.pos);
			}
		}
	}


	return {
		setOptions: setOptions, //设置参数
		createDom: createDom, //创建滚动节点,若是window节点,只需传递对象: window
		getData: getData, //获取当前批次要展示的数据
		onScroll: null //滚动条滚动时
	};



})();




