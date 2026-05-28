
/**
 * 百度地图周连清单关键字
 * 模拟数据
 */

/*+———————————————— 模拟数据 ————————————————+*/   
//——————————————————————————————————————————
// mock 模拟数据 从后台获取搜索结果数据
// 设置延时时长，模拟后端处理或返回数据的时间。
Mock.setup({
    timeout: 1000, // 延时n毫秒返回
});


//——————————————————————————————————————————
// 获取默认搜索组(取所有默认搜索组及对应的默认搜索关键字)
Mock.mock("../fwh_pub/jk_loupan_fujin.ashx?param=9001", "post", function(v){
    // console.log('后台传过来的参数：', v);
    return Mock.mock({
        "return": "ok",
        "data|1-5":[{ 
            "fenzu_bh": "F@id()", 
            "fenzu_mc|+1": ["住宅组", "店铺组", "厂房组", "二手房组", "拆迁组"],
            "data|1-3": [{
                "guanjianzi_bh": "G@id()", 
                "guanjianzi_mc|1": ["学校", "医院", "公园", "超市", "商场", "公交站", "景点", "体育馆", "电影院", "剧院", "餐厅", "酒店", "便利店", "购物中心", "电影院", "博物馆"],
                "juli|+1": [1000, 2000, 3000, 4000, 5000] // 距离，单位：米
            }]
        }]
    });
});



//——————————————————————————————————————————
// 获取默认搜索关键字(取所有默认搜索组下的所有默认搜索关键字，并去重)
Mock.mock("../fwh_pub/jk_loupan_fujin.ashx?param=9002", "post", function(v){
    // console.log('后台传过来的参数：', v);
    return Mock.mock({
        "return": "ok",
        "data|1-3":[{ 
            "guanjianzi_bh": "G@id()", 
            "guanjianzi_mc|1": ["学校", "医院", "公园", "超市", "商场", "公交站", "景点", "体育馆", "电影院", "剧院", "餐厅", "酒店", "便利店", "购物中心", "电影院", "博物馆"],
            "juli|+1": [1000, 2000, 3000, 4000, 5000] // 距离，单位：米
        }]
    });
});




//——————————————————————————————————————————
// 获取关键字分组下拉数据
Mock.mock("../fwh_pub/jk_loupan_fujin.ashx?param=1001", "post", function(v){
    // console.log('后台传过来的参数：', v);
    return Mock.mock({
        "return": "ok",
        "data|3-5":[{ 
            "fenzu_bh": "F@id()", 
            "fenzu_mc|1": ["住宅组", "店铺组", "厂房组", "二手房组", "拆迁组"]
        }]
    });
});


//——————————————————————————————————————————
// 获取全部关键字下拉数据
Mock.mock("../fwh_pub/jk_loupan_fujin.ashx?param=1002", "post", function(v){
    // console.log('后台传过来的参数：', v);
    return Mock.mock({
        "return": "ok",
        "data|3-16":[{ 
            "guanjianzi_bh": "G@id()", 
            "guanjianzi_mc|+1": ["学校", "医院", "公园", "超市", "商场", "公交站", "景点", "体育馆", "电影院", "剧院", "餐厅", "酒店", "便利店", "购物中心", "电影院", "博物馆"],
            "juli|+1": [1000, 2000, 3000, 4000, 5000], // 距离，单位：米
        }]
    });
});


//——————————————————————————————————————————
// 获取关键字分组对应的关键字下拉数据
Mock.mock("../fwh_pub/jk_loupan_fujin.ashx?param=1003", "post", function(v){
    // console.log('后台传过来的参数：', v);
    return Mock.mock({
        "return": "ok",
        "data|5-16":[{ 
            "guanjianzi_bh": "G@id()", 
            "guanjianzi_mc|+1": ["学校", "医院", "公园", "超市", "商场", "公交站", "景点", "体育馆", "电影院", "剧院", "餐厅", "酒店", "便利店", "购物中心", "电影院", "博物馆"],
            // 待后台给字段 testing
            "juli|+1": [1000, 2000, 3000, 4000, 5000], // 距离，单位：米
            "check_moren|0-1": 0 // 是否默认搜索关键字
        }]
    });
});



//——————————————————————————————————————————
// 获取搜索结果数据
Mock.mock("../fwh_pub/jk_loupan_fujin.ashx?param=2001", "post", function(v){
    // console.log('后台传过来的参数：', v);
    var body = v.body;
    var arr = body.split('&');
    var field = 'guanjianzi_mc=';
    var value = arr.filter(function(item, index, self) {
        return item.indexOf(field) === 0;
    })
    // console.log('value', value)
    var keyword = decodeURIComponent(value).split('=')[1];

    if(keyword.indexOf('公交') >= 0)
        var result = {
            return: "ok",
            data: [
                { "name": "客运中心站南门", "zuobiao": "118.617007,24.890789", "address": "1路、 4路、 11路、 11路复线、 21路、 24路、 40路、 42路、 305路、 K1路、 K201路、 K301路、 K307路、 K3路、 K501路、 K503路、 K606路、 K702路长线、 K702路短线", "telephone": "", "sheng": "", "shi": "", "qu": "", "juli_mi": "1000"},
                { "name": "海关大楼", "zuobiao": "", "address": "4路、 6路、 15路、 19路、 21路、 23路、 24路、 28路、 33路、 35路、 49路、 60路", "telephone": "", "sheng": "", "shi": "", "qu": "", "juli_mi": "1000"},
                { "name": "刺桐公园", "zuobiao": "", "address": "7路、 32路、 60路、 202路、 305路、 K1路、 K3路、 K604路、 K701路", "telephone": "", "sheng": "", "shi": "", "qu": "", "juli_mi": "1000"}
            ]
        }
    else 
        var result = {
            return: "ok",
            data: [
                { "name": "丰泽区泉秀实验小学", "zuobiao": "118.60499,24.891375", "address": "福建省泉州市丰泽区泉秀街道浦西路18号x1", "telephone": "0595-230458103111", "sheng": "", "shi": "", "qu": "", "juli_mi": "1000"},
                { "name": "泉州现代中学", "zuobiao": "118.602556,24.894243", "address": "泉州市丰泽区田安南路371号x2", "telephone": "", "sheng": "", "shi": "", "qu": "", "juli_mi": "1000"}
            ]
        }

    return Mock.mock(result);
});



//——————————————————————————————————————————
// 保存数据
var nCount = 0;
Mock.mock("../fwh_pub/jk_loupan_fujin.ashx?param=2002", "post", function(v){
    // console.log('后台传过来的参数：', v);
    return Mock.mock({
        "return": "ok",
        "data": "ok"
    });
    // 模拟中间有失败的情景
    // nCount++;
    // if(nCount == 1)
    //     return Mock.mock({
    //         "return": "ok",
    //         "data": "ok"
    //     });
    // else  if(nCount == 2)
    //     return Mock.mock({
    //         "return": "error",
    //         "data": "失败啦，你xx"
    //     });
    // else 
    //     return Mock.mock({
    //         "return": "ok",
    //         "data": "ok"
    //     });
});

