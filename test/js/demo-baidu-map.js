/*
 * 百度地图周边配套检索工具 - 主JavaScript文件
 * 版本：v2.0.0
 * 功能：整合25个POI分类，智能匹配，城市选择，优化UI交互，全面优化过滤规则
 */

// 配置百度地图API密钥（请在此处填入你的AK）
var BAIDU_MAP_AK = 'KmYpNYDatEVqdNvwvDXsbbOvQhTvPg9X';

// POI分类配置数据（25个完整分类）
var POI_CATEGORIES = {
    // ==================== 快速选择分类（8个）====================
    'school': {
        name: '学校',
        icon: '🏫',
        typeKeyword: '教育',
        matchKeywords: ['学校', '中学', '小学', '高中', '大学', '幼儿园', '职校', '技校', '学院'],
        excludeKeywords: ['书店', '食堂', '商店', '小卖部', '停车场',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门',
                         '驾校', '驾驶培训', '培训中心', '训练营', '考训中心',
                         '托儿所', '托管班', '补习班', '培训学校'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '小学', value: '小学' },
            { name: '中学', value: '中学' },
            { name: '高中', value: '高中' },
            { name: '大学', value: '大学' },
            { name: '幼儿园', value: '幼儿园' }
        ]
    },
    'hospital': {
        name: '医院',
        icon: '🏥',
        typeKeyword: '医疗',
        matchKeywords: ['医院', '卫生院', '诊所', '门诊部', '卫生站', '急救中心'],
        excludeKeywords: ['口腔', '牙科',
                         '美容', '整形', '康复', '体检', '药房',
                         '检验', '影像', '血透', '名医馆',
                         '健康管理中心', '疾控中心',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '综合医院', value: '综合医院' },
            { name: '专科医院', value: '专科医院' },
            { name: '卫生院', value: '卫生院' },
            { name: '诊所', value: '诊所' }
        ]
    },
    'bank': {
        name: '银行',
        icon: '🏦',
        typeKeyword: '金融',
        matchKeywords: ['银行', '信用社', '农商行', '农信社'],
        excludeKeywords: ['ATM', '自助', '24小时', '取款', '取款机',
                         '理财中心', 'VIP室', '客户服务中心',
                         '自助银行', '自助服务', '金融中心',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '营业网点', value: '银行' },
            { name: 'ATM', value: 'ATM' }
        ]
    },
    'market': {
        name: '超市',
        icon: '🛒',
        typeKeyword: '购物',
        matchKeywords: ['超市', '卖场', '商场', '购物中心'],
        excludeKeywords: ['便利店', '小卖部', '水果店', '蔬菜店',
                         '杂货店', '粮油店', '烟酒店'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '大型超市', value: '大型超市' },
            { name: '便利店', value: '便利店' },
            { name: '菜市场', value: '菜市场' }
        ]
    },
    'restaurant': {
        name: '餐饮',
        icon: '🍽️',
        typeKeyword: '餐饮',
        matchKeywords: ['餐饮', '饭店', '餐厅', '美食', '美食城'],
        excludeKeywords: ['小吃摊', '夜市', '奶茶店', '咖啡厅',
                         '酒吧', 'KTV', '网吧', '茶座',
                         '甜品店', '烘焙店', '饮品店', '快餐连锁'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '饭店', value: '饭店' },
            { name: '快餐', value: '快餐' },
            { name: '小吃', value: '小吃' }
        ]
    },
    'gas_station': {
        name: '加油站',
        icon: '⛽',
        typeKeyword: '交通设施',
        matchKeywords: ['加油站', '加气站'],
        excludeKeywords: ['充电站', '新能源',
                         '充电桩', '充电点'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '加油站', value: '加油站' }
        ]
    },
    'park': {
        name: '公园',
        icon: '🏟️',
        typeKeyword: '风景名胜',
        matchKeywords: ['公园', '广场', '绿地', '景区'],
        excludeKeywords: ['游乐场', '景点', '风景区',
                         '度假村', '度假山庄', '游乐中心'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '公园', value: '公园' },
            { name: '广场', value: '广场' },
            { name: '绿地', value: '绿地' }
        ]
    },
    'express': {
        name: '快递',
        icon: '📮',
        typeKeyword: '物流',
        matchKeywords: ['快递', '物流', '驿站'],
        excludeKeywords: ['代收点', '自提柜', '快递柜',
                         '菜鸟驿站', '丰巢柜'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '快递站', value: '快递站' },
            { name: '驿站', value: '驿站' }
        ]
    },

    // ==================== 补充分类（17个）====================
    'government': {
        name: '政府',
        icon: '🏛️',
        typeKeyword: '政府|政府机构',
        matchKeywords: ['政府', '机关', '办事处', '政务中心'],
        excludeKeywords: ['停车场', '食堂', '商店',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '市政府', value: '市政府' },
            { name: '区政府', value: '区政府' },
            { name: '街道办事处', value: '街道办事处' }
        ]
    },
    'community': {
        name: '小区',
        icon: '🏘️',
        typeKeyword: '住房|住宅小区',
        matchKeywords: ['小区', '社区', '住宅区', '公寓'],
        excludeKeywords: ['停车场', '物业', '商业街', '商场',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '住宅小区', value: '住宅小区' },
            { name: '公寓', value: '公寓' },
            { name: '别墅区', value: '别墅区' }
        ]
    },
    'bus': {
        name: '公交',
        icon: '🚌',
        typeKeyword: '交通设施|公交车站',
        matchKeywords: ['公交', '公交站', '公交车站', '站台'],
        excludeKeywords: ['停车场', '调度室', '维修点',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '公交站', value: '公交站' },
            { name: 'BRT', value: 'BRT' },
            { name: '公交枢纽', value: '公交枢纽' }
        ]
    },
    'subway': {
        name: '地铁',
        icon: '🚇',
        typeKeyword: '交通设施|地铁站',
        matchKeywords: ['地铁', '地铁站', '轻轨'],
        excludeKeywords: ['停车场', '调度室', '维修点',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '地铁站', value: '地铁站' },
            { name: '轻轨站', value: '轻轨站' }
        ]
    },
    'parking': {
        name: '停车场',
        icon: '🅿️',
        typeKeyword: '交通设施|停车场',
        matchKeywords: ['停车场', '停车'],
        excludeKeywords: ['收费亭', '管理室',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '露天停车场', value: '露天停车场' },
            { name: '地下停车场', value: '地下停车场' },
            { name: '立体车库', value: '立体车库' }
        ]
    },
    'shopping_mall': {
        name: '商场',
        icon: '🏬',
        typeKeyword: '购物|购物中心',
        matchKeywords: ['商场', '购物中心', '百货', '商城'],
        excludeKeywords: ['停车场', '仓库', '办公楼',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '购物中心', value: '购物中心' },
            { name: '百货商场', value: '百货商场' },
            { name: '步行街', value: '步行街' }
        ]
    },
    'hotel': {
        name: '酒店',
        icon: '🏨',
        typeKeyword: '酒店|酒店',
        matchKeywords: ['酒店', '宾馆'],
        excludeKeywords: ['停车场', '餐厅', '会议室',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '星级酒店', value: '星级酒店' },
            { name: '快捷酒店', value: '快捷酒店' },
            { name: '宾馆', value: '宾馆' }
        ]
    },
    'market_farm': {
        name: '市场',
        icon: '🏪',
        typeKeyword: '购物|市场',
        matchKeywords: ['市场', '农贸市场', '菜市场'],
        excludeKeywords: ['超市', '便利店', '商场',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '农贸市场', value: '农贸市场' },
            { name: '菜市场', value: '菜市场' },
            { name: '批发市场', value: '批发市场' }
        ]
    },
    'culture': {
        name: '文体',
        icon: '🎭',
        typeKeyword: '文化',
        matchKeywords: ['体育馆', '文化', '图书馆', '活动中心'],
        excludeKeywords: ['停车场', '食堂', '商店',
                         '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                         '入口', '出口', '东2门', '西2门', '南2门', '北2门'],
        subcategories: [
            { name: '全部', value: '' },
            { name: '体育馆', value: '体育馆' },
            { name: '图书馆', value: '图书馆' },
            { name: '文化馆', value: '文化馆' }
        ]
    },
    'cemetery': {
        name: '陵园',
        icon: '⚠️',
        typeKeyword: '殡葬|陵园',
        matchKeywords: ['陵园', '公墓', '殡仪馆'],
        excludeKeywords: [],
        subcategories: [
            { name: '全部', value: '' },
            { name: '陵园', value: '陵园' },
            { name: '公墓', value: '公墓' }
        ]
    },
    'garbage_station': {
        name: '垃圾站',
        icon: '🗑️',
        typeKeyword: '市政|垃圾处理',
        matchKeywords: ['垃圾站', '垃圾转运'],
        excludeKeywords: [],
        subcategories: [
            { name: '全部', value: '' },
            { name: '垃圾站', value: '垃圾站' },
            { name: '垃圾转运站', value: '垃圾转运站' }
        ]
    },
    'substation': {
        name: '变电站',
        icon: '⚡',
        typeKeyword: '市政|变电站',
        matchKeywords: ['变电站', '变电所'],
        excludeKeywords: [],
        subcategories: [
            { name: '全部', value: '' },
            { name: '变电站', value: '变电站' },
            { name: '变电所', value: '变电所' }
        ]
    }
};

// ==================== 智能匹配函数 ====================

/**
 * 根据关键词智能匹配POI分类
 * @param {string} keyword - 用户输入的关键词
 * @returns {Object|null} { categoryKey: string, category: Object } 或 null
 */
function findCategoryByKeyword(keyword) {
    if (!keyword) return null;

    // 遍历所有分类，查找匹配
    for (var categoryKey in POI_CATEGORIES) {
        if (POI_CATEGORIES.hasOwnProperty(categoryKey)) {
            var category = POI_CATEGORIES[categoryKey];
            var matchKeywords = category.matchKeywords || [];

            // 1. 精确匹配：关键词在matchKeywords列表中
            for (var i = 0; i < matchKeywords.length; i++) {
                if (matchKeywords[i] === keyword) {
                    return { categoryKey: categoryKey, category: category };
                }
            }

            // 2. 名称匹配：关键词等于分类名称
            if (category.name === keyword) {
                return { categoryKey: categoryKey, category: category };
            }
        }
    }

    return null;
}

/**
 * 按分类配置过滤
 * @param {string} name - POI名称
 * @param {Object} category - 分类配置对象
 * @returns {boolean} 是否保留
 */
function filterByCategory(name, category) {
    // 1. 排除关键词过滤
    var excludeKeywords = category.excludeKeywords || [];
    if (excludeKeywords.some(function(ex) { return name.indexOf(ex) !== -1; })) {
        return false;
    }

    // 2. 附属设施过滤（-综合楼、-门诊部等）
    var matchKeywords = category.matchKeywords || [category.name];
    var hasCategoryKeyword = matchKeywords.some(function(kw) { return name.indexOf(kw) !== -1; });

    if (hasCategoryKeyword && name.indexOf('-') !== -1) {
        // 通用方向门禁正则：匹配任何方向的门
        if (!name.match(/-(东|西|南|北|前|后|左|右|正|侧)(\d*)门$/) && !name.match(/-(东|西|南|北)$/)) {
            return false;
        }
    }

    return true;
}

/**
 * 通用过滤（当没有匹配分类时）
 * @param {string} name - POI名称
 * @param {string} keyword - 搜索关键词
 * @returns {boolean} 是否保留
 */
function filterGeneral(name, keyword) {
    // 通用规则：只过滤明显的附属设施
    if (name.indexOf('-') !== -1 && name.indexOf(keyword) !== -1) {
        if (!name.match(/-(东|西|南|北|前|后|左|右|正|侧)(\d*)门$/) && !name.match(/-(东|西|南|北)$/)) {
            return false;
        }
    }
    return true;
}

// IE版本检测
function detectIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');

    if (msie > 0) {
        // IE 10 or older
        var version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        return version;
    }

    if (trident > 0) {
        // IE 11
        var rv = ua.indexOf('rv:');
        return 11;
    }

    return false; // 不是IE
}

// 显示IE升级提示
function showIEUpgradeAlert() {
    var ieVersion = detectIE();
    if (ieVersion && ieVersion <= 9) {
        var alertHtml = '<div id="ieUpgradeAlert" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:white;padding:30px;border-radius:10px;max-width:500px;text-align:center;">' +
            '<h2 style="color:#e74c3c;margin-top:0;">⚠️ 浏览器版本过低</h2>' +
            '<p style="color:#333;line-height:1.6;">您正在使用 Internet Explorer ' + ieVersion + '，此版本已过时且不受支持。</p>' +
            '<p style="color:#333;line-height:1.6;">请升级到最新版浏览器以获得最佳体验：</p>' +
            '<div style="margin:20px 0;">' +
            '<a href="https://www.google.cn/chrome/" target="_blank" style="display:inline-block;padding:10px 20px;margin:5px;background:#4285f4;color:white;text-decoration:none;border-radius:5px;">Chrome</a>' +
            '<a href="https://www.microsoft.com/edge" target="_blank" style="display:inline-block;padding:10px 20px;margin:5px;background:#0078d7;color:white;text-decoration:none;border-radius:5px;">Edge</a>' +
            '</div>' +
            '</div>' +
            '</div>';
        document.body.insertAdjacentHTML('afterbegin', alertHtml);
    }
}

// JSONP请求函数
function jsonp(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const callbackName = 'jsonp_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // 设置超时
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('请求超时'));
        }, timeout);

        // 清理函数
        function cleanup() {
            if (window[callbackName]) {
                delete window[callbackName];
            }
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
            clearTimeout(timeoutId);
        }

        // 创建全局回调函数
        window[callbackName] = function(data) {
            cleanup();
            resolve(data);
        };

        // 处理错误
        script.onerror = function() {
            cleanup();
            reject(new Error('JSONP请求失败'));
        };

        // 设置src
        script.src = url + '&callback=' + callbackName;

        // 添加到页面
        document.body.appendChild(script);
    });
}

// 使用Place API搜索地点（替代地理编码API）
async function searchLocation(address, city) {
    var url = 'http://api.map.baidu.com/place/v2/search?query=' + encodeURIComponent(address) + '&region=' + encodeURIComponent(city) + '&output=json&ak=' + BAIDU_MAP_AK + '&page_size=1';
    console.log('搜索地点URL:', url);
    var data = await jsonp(url, 10000);
    console.log('搜索地点返回:', data);
    return data;
}

// 周边检索API v2.0
async function searchNearby(location, keyword, radius, category, useTag) {
    var url = 'http://api.map.baidu.com/place/v2/search?query=' + encodeURIComponent(keyword) + '&location=' + location + '&radius=' + radius + '&output=json&ak=' + BAIDU_MAP_AK + '&page_size=20&page_num=0';

    // 如果使用了分类和标签功能，添加tag参数
    if (category && useTag && category.typeKeyword) {
        url += '&tag=' + encodeURIComponent(category.typeKeyword);
    }

    console.log('周边检索URL:', url);
    var data = await jsonp(url, 10000);
    console.log('周边检索返回:', data);
    return data;
}

// 距离计算 - 使用 Haversine 公式计算两点之间的直线距离（米）
function calculateDistance(lat1, lng1, lat2, lng2) {
    var R = 6371; // 地球半径（千米）
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c; // 距离（千米）
    return distance * 1000; // 转换为米
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

// 判断POI是否为附属设施（用于排序）
function isSubFacility(poi) {
    var name = poi.name;
    var subFacilityKeywords = [
        '停车场', '北门', '南门', '东门', '西门', '后门', '正门', '侧门',
        '入口', '出口', '东2门', '西2门', '南2门', '北2门',
        '便利店', '超市', '书店', '食堂', '商店', '小卖部'
    ];
    return subFacilityKeywords.some(function(keyword) { return name.indexOf(keyword) !== -1; });
}

// 智能过滤POI
function filterPois(pois, keyword, radius, categoryKey) {
    // 如果没有传入categoryKey，尝试智能匹配
    var matchedCategory = null;
    if (categoryKey && POI_CATEGORIES[categoryKey]) {
        matchedCategory = POI_CATEGORIES[categoryKey];
    } else {
        // 智能匹配：根据关键词查找对应的分类配置
        var matchResult = findCategoryByKeyword(keyword);
        if (matchResult) {
            matchedCategory = matchResult.category;
            console.log('智能匹配到分类:', matchResult.categoryKey, matchResult.category.name);
        }
    }

    return pois.filter(function(poi) {
        var name = poi.name;

        // 1. 距离过滤
        if (poi.distance && poi.distance > radius) {
            return false;
        }

        // 2. 根据匹配的分类配置过滤
        if (matchedCategory) {
            return filterByCategory(name, matchedCategory);
        } else {
            // 3. 没有匹配的分类，使用通用过滤
            return filterGeneral(name, keyword);
        }
    });
}

// 生成结构化报告
function generateReport(communityName, location, pois, keyword, radius, categoryKey) {
    // 先计算距离
    var poisWithDistance = pois
        .filter(function(poi) { return poi.location; })
        .map(function(poi) {
            return Object.assign({}, poi, {
                distance: calculateDistance(
                    location.lat,
                    location.lng,
                    poi.location.lat,
                    poi.location.lng
                )
            });
        });

    // 智能过滤
    var filteredPois = filterPois(poisWithDistance, keyword, radius, categoryKey);

    // 排序：优先显示非附属设施
    var sortedPois = filteredPois.sort(function(a, b) {
        // 如果一个是附属设施，一个不是，非附属设施优先
        var aIsSub = isSubFacility(a);
        var bIsSub = isSubFacility(b);
        if (aIsSub && !bIsSub) return 1;
        if (!aIsSub && bIsSub) return -1;
        // 如果都是或都不是，按距离排序
        return a.distance - b.distance;
    }).slice(0, 10); // 取前10个

    var report = '【' + communityName + ' - 周边配套情况报告】\n\n';
    report += '1、外部配套设施状况\n';
    report += '   (1) 公共服务设施：\n';

    if (sortedPois.length > 0) {
        sortedPois.forEach(function(poi, index) {
            report += '   距离' + poi.name + '约' + Math.round(poi.distance) + '米';
            if (index < sortedPois.length - 1) {
                report += '、';
            }
        });
        report += '，' + keyword + '配套较' + (sortedPois.length >= 3 ? '完善' : sortedPois.length >= 1 ? '一般' : '缺乏') + '。\n';
    } else {
        report += '   ' + radius + '米范围内未发现' + keyword + '相关设施。\n';
    }

    report += '\n2、位置分析\n';
    report += '   (1) 小区位置：' + communityName + '\n';
    report += '   (2) 搜索范围：' + radius + '米\n';
    report += '   (3) 搜索关键词：' + keyword + '\n';
    report += '   (4) 搜索结果：共找到' + filteredPois.length + '个' + keyword + '相关设施\n';

    report += '\n3、详细设施列表（按距离排序）\n';
    if (sortedPois.length > 0) {
        sortedPois.forEach(function(poi, index) {
            report += '   ' + (index + 1) + '. ' + poi.name + '\n';
            report += '      - 距离：约' + Math.round(poi.distance) + '米\n';
            report += '      - 地址：' + (poi.address || '暂无地址') + '\n';
            if (poi.area) {
                report += '      - 区域：' + poi.area + '\n';
            }
            report += '      - 经纬度：(' + poi.location.lat + ', ' + poi.location.lng + ')\n';
        });
    } else {
        report += '   未找到相关设施。\n';
    }

    return { report: report, sortedPois: sortedPois };
}

// 显示错误信息
function showError(message) {
    $('#errorMessage').text(message).fadeIn();
}

// 渲染POI列表
function renderPoiList(pois) {
    var html = '';
    if (pois.length > 0) {
        pois.forEach(function(poi, index) {
            var isSub = isSubFacility(poi);
            var subBadge = isSub ? '<span class="poi-badge">附属设施</span>' : '';
            html += '<div class="poi-item ' + (isSub ? 'poi-item-sub' : '') + '">' +
                '<div class="poi-name">' +
                (index + 1) + '. ' + poi.name +
                '<span class="poi-distance">' + Math.round(poi.distance) + '米</span>' +
                subBadge +
                '</div>' +
                '<div class="poi-info">' +
                '<strong>地址：</strong>' + (poi.address || '暂无地址') + '<br>' +
                (poi.area ? '<strong>区域：</strong>' + poi.area + '<br>' : '') +
                '<strong>经纬度：</strong>(' + poi.location.lat + ', ' + poi.location.lng + ')' +
                '</div>' +
                '</div>';
        });
    } else {
        html = '<div class="alert alert-info">未找到符合条件的设施</div>';
    }
    $('#poiList').html(html);
}

// 复制报告
function copyReport() {
    var reportText = $('#reportText').val();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(reportText).then(function() {
            alert('报告已复制到剪贴板！');
        }).catch(function() {
            alert('复制失败，请手动复制');
        });
    } else {
        // IE11兼容
        var textArea = document.createElement('textarea');
        textArea.value = reportText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('报告已复制到剪贴板！');
        } catch (e) {
            alert('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    }
}

// 下载报告
function downloadReport() {
    var reportText = $('#reportText').val();
    var communityName = $('#communityName').val();
    var blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = communityName + '_配套报告.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// 显示版本历史
function showVersionHistory() {
    console.log('showVersionHistory 被调用');

    var versionHtml = '<div style="max-height: 500px; overflow-y: auto; padding: 20px; max-width: 600px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">' +
        '<h2 style="margin-top: 0; color: #1e293b;">📋 版本历史</h2>' +
        '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #667eea;">' +
        '<h3 style="margin-top: 0; color: #667eea; margin-bottom: 10px;">v2.0.0 (2026-04-08)</h3>' +
        '<p style="margin: 5px 0; font-weight: 600;">🎉 重大更新</p>' +
        '<ul style="margin: 10px 0; padding-left: 20px;">' +
        '<li>✅ 整合25个完整POI分类（从8个扩展到25个）</li>' +
        '<li>✅ 添加"更多"按钮，显示所有分类</li>' +
        '<li>✅ 新增城市选择功能</li>' +
        '<li>✅ 实现智能匹配功能</li>' +
        '<li>✅ 优化UI交互逻辑</li>' +
        '<li>✅ 修复门禁过滤问题</li>' +
        '</ul>' +
        '</div>' +
        '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #64748b;">' +
        '<h3 style="margin-top: 0; color: #64748b; margin-bottom: 10px;">v1.3.0 (之前版本)</h3>' +
        '<ul style="margin: 10px 0; padding-left: 20px;">' +
        '<li>✅ 使用百度地图API v2.0实现周边配套检索</li>' +
        '<li>✅ Place API搜索地点</li>' +
        '<li>✅ 智能过滤POI</li>' +
        '<li>✅ 自动生成结构化报告</li>' +
        '</ul>' +
        '</div>' +
        '<p style="text-align: center; margin-top: 20px;">' +
        '<button onclick="closeVersionHistory()" style="padding: 10px 30px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background 0.3s;" onmouseover="this.style.background=\'#4338ca\'" onmouseout="this.style.background=\'#667eea\'">关闭</button>' +
        '</p>' +
        '</div>';

    // 创建模态框
    var modal = document.createElement('div');
    modal.id = 'versionHistoryModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = versionHtml;

    console.log('模态框创建完成，准备添加到页面');
    document.body.appendChild(modal);
    console.log('模态框已添加到页面');

    // 添加点击遮罩关闭功能
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeVersionHistory();
        }
    });
}

// 关闭版本历史
function closeVersionHistory() {
    console.log('closeVersionHistory 被调用');
    var modal = document.getElementById('versionHistoryModal');
    if (modal) {
        console.log('找到模态框，准备移除');
        document.body.removeChild(modal);
        console.log('模态框已移除');
    } else {
        console.log('未找到模态框');
    }
}

// 页面加载完成后绑定事件
$(document).ready(function() {
    // IE版本检测
    showIEUpgradeAlert();

    // 搜索按钮点击事件
    $('#searchBtn').click(async function() {
        const city = $('#city').val().trim();
        const communityName = $('#communityName').val().trim();
        const keyword = $('#keyword').val().trim();
        const radius = parseInt($('#radius').val()) || 500;

        // 验证输入
        if (!city || !communityName || !keyword) {
            showError('请输入城市、小区名称和关键词');
            return;
        }

        if (BAIDU_MAP_AK === 'your_baidu_map_ak_here') {
            showError('请先配置百度地图API密钥（AK）');
            return;
        }

        // 显示加载状态
        $('#searchBtn').prop('disabled', true).text('搜索中...');
        $('#errorMessage').hide();
        $('#resultCard').hide();

        try {
            console.log('开始搜索...');
            console.log('城市:', city, '小区:', communityName, '关键词:', keyword, '半径:', radius);

            // 获取分类和子分类信息
            var categoryKey = $('#categorySelect').val();
            var subcategoryValue = $('#subcategorySelect').val();
            var useTag = $('#useTagCheckbox').is(':checked');
            var category = categoryKey ? POI_CATEGORIES[categoryKey] : null;

            console.log('分类:', categoryKey, '子分类:', subcategoryValue, '使用标签:', useTag);

            // 步骤1：搜索地点（使用Place API）
            console.log('步骤1：搜索地点');
            var locationData = await searchLocation(communityName, city);

            if (locationData.status !== 0) {
                showError('搜索地点失败：' + (locationData.message || '未知错误'));
                console.error('搜索地点错误:', locationData);
                return;
            }

            if (!locationData.results || locationData.results.length === 0) {
                showError('无法找到该小区，请检查小区名称是否正确');
                console.error('搜索地点结果无效:', locationData);
                return;
            }

            var location = locationData.results[0].location;
            var locationStr = location.lat + ',' + location.lng;
            console.log('小区位置:', location);

            // 步骤2：周边检索
            console.log('步骤2：周边检索');
            var nearbyData = await searchNearby(locationStr, keyword, radius, category, useTag);

            if (nearbyData.status !== 0) {
                showError('周边检索失败：' + (nearbyData.message || '未知错误'));
                console.error('周边检索错误:', nearbyData);
                return;
            }

            var pois = nearbyData.results || [];
            console.log('找到POI数量:', pois.length);

            // 步骤3：生成报告
            var result = generateReport(communityName, location, pois, keyword, radius, categoryKey);
            var report = result.report;
            var sortedPois = result.sortedPois;

            // 显示结果
            $('#resultInfo').text(communityName + ' 周边 ' + radius + '米内的 ' + keyword);
            $('#resultCount').text('共找到 ' + sortedPois.length + ' 个');
            $('#reportText').val(report);
            renderPoiList(sortedPois);
            $('#resultCard').fadeIn();

            console.log('搜索完成');

        } catch (error) {
            showError('搜索失败：' + error.message);
            console.error('搜索错误:', error);
        } finally {
            $('#searchBtn').prop('disabled', false).text('开始搜索');
        }
    });

    // 清空按钮点击事件
    $('#clearBtn').click(function() {
        $('#city').val('泉州市');
        $('#communityName').val('泉州浦西万达广场');
        $('#keyword').val('学校');
        $('#filterBtn').hide();
        $('#radius').val('1000');
        $('#errorMessage').hide();
        $('#resultCard').hide();
    });

    // Tab切换
    $('.tab').click(function() {
        $('.tab').removeClass('active');
        $(this).addClass('active');

        var tabName = $(this).data('tab');
        $('.tab-content').removeClass('active');
        $('#' + tabName + 'Tab').addClass('active');
    });

    // 初始化分类下拉框
    function initCategorySelect() {
        var select = $('#categorySelect');
        select.empty();
        select.append('<option value="">-- 请选择分类 --</option>');

        for (var key in POI_CATEGORIES) {
            if (POI_CATEGORIES.hasOwnProperty(key)) {
                var category = POI_CATEGORIES[key];
                select.append('<option value="' + key + '">' + category.icon + ' ' + category.name + '</option>');
            }
        }
    }

    // "更多"按钮点击事件
    $('#moreBtn').click(function() {
        var moreSection = $('#moreSection');
        var isVisible = moreSection.is(':visible');

        if (isVisible) {
            moreSection.slideUp(200);
            $(this).text('更多 ↓');
        } else {
            moreSection.slideDown(200);
            $(this).text('收起 ↑');
        }
    });

    // 快速选择按钮点击事件
    $('.quick-btn').click(function() {
        var categoryKey = $(this).data('category');
        var category = POI_CATEGORIES[categoryKey];

        // 更新关键词输入框
        $('#keyword').val(category.name);

        // 显示筛选按钮
        $('#filterBtn').show();

        // 自动选中对应的分类（为筛选功能做准备）
        $('#categorySelect').val(categoryKey);
        updateSubcategorySelect(categoryKey);
    });

    // 关键词输入框input事件
    $('#keyword').on('input', function() {
        var keyword = $(this).val().trim();

        // 获取所有快速选择的分类名称
        var quickSelectKeywords = [];
        $('.quick-btn').each(function() {
            var categoryKey = $(this).data('category');
            var category = POI_CATEGORIES[categoryKey];
            if (category && category.name) {
                quickSelectKeywords.push(category.name);
            }
        });

        // 如果关键词为空或不在快速选择列表中，隐藏筛选按钮
        if (!keyword || !quickSelectKeywords.includes(keyword)) {
            $('#filterBtn').hide();
        } else {
            $('#filterBtn').show();
        }
    });

    // 筛选按钮点击事件
    $('#filterBtn').click(function() {
        $('#filterDropdown').fadeIn(200);
    });

    // 关闭筛选下拉框
    $('#closeFilter').click(function() {
        $('#filterDropdown').fadeOut(200);
    });

    // 取消筛选
    $('#cancelFilter').click(function() {
        $('#filterDropdown').fadeOut(200);
    });

    // 应用筛选
    $('#applyFilter').click(function() {
        var categoryKey = $('#categorySelect').val();
        var subcategoryValue = $('#subcategorySelect').val();

        if (subcategoryValue && subcategoryValue !== '全部') {
            // 如果选择了子分类，使用子分类作为关键词
            $('#keyword').val(subcategoryValue);
        } else if (categoryKey && POI_CATEGORIES[categoryKey]) {
            // 否则使用分类名称
            $('#keyword').val(POI_CATEGORIES[categoryKey].name);
        }

        $('#filterDropdown').fadeOut(200);
    });

    // 点击下拉框外部关闭
    $(document).click(function(e) {
        if ($(e.target).closest('#filterDropdown').length === 0 &&
            $(e.target).closest('#filterBtn').length === 0) {
            $('#filterDropdown').fadeOut(200);
        }
    });

    // 分类下拉框变化事件
    $('#categorySelect').change(function() {
        var categoryKey = $(this).val();
        updateSubcategorySelect(categoryKey);
    });

    // 更新子分类下拉框
    function updateSubcategorySelect(categoryKey) {
        var subcategoryGroup = $('#subcategoryGroup');
        var subcategorySelect = $('#subcategorySelect');

        subcategorySelect.empty();

        if (categoryKey && POI_CATEGORIES[categoryKey] && POI_CATEGORIES[categoryKey].subcategories) {
            var subcategories = POI_CATEGORIES[categoryKey].subcategories;

            // 添加子分类选项
            for (var i = 0; i < subcategories.length; i++) {
                var sub = subcategories[i];
                subcategorySelect.append('<option value="' + sub.value + '">' + sub.name + '</option>');
            }

            // 显示子分类组
            subcategoryGroup.show();
        } else {
            // 隐藏子分类组
            subcategoryGroup.hide();
        }
    }

    // 初始化
    initCategorySelect();
});
