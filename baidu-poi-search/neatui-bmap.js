/**
 * BaiduPoiSearch - 百度地图POI搜索插件
 * 作者：Vibe Coding Agent
 * 功能：多分类POI搜索、智能过滤、API使用统计、双布局支持
 * 兼容：IE11+（ES5语法）
 */

 (function(window) {
    'use strict';

    // 插件版本号
    var VERSION = 'v3.6.4'; // 注：3.6.3 的beta4和beta4-final可用, beta5-7是垃圾版本不可用

    /**
     * BaiduPoiSearch 构造函数
     * @param {Object} options - 配置选项
     */
    function BaiduPoiSearch(options) {
        // 合并配置选项
        this.options = this.extend({}, this.defaults, options);
        
        // 缓存数据
        this.cache = {
            results: null,
            categories: this.getPOICategories(),
            poiCache: {},  // POI缓存，避免重复搜索
            categoryColors: {}  // 分类颜色缓存，同分类固定颜色
        };
        
        // 状态管理
        this.state = {
            selectedCategories: [],  // 已选分类
            selectedSubcategories: {},  // 已选子分类 {categoryKey: subcategoryValue}
            isSearching: false, // 是否正在搜索
            currentLayout: 'split',  // 当前布局模式
            multiSelectMode: false,  // 多选模式
            callbackCounter: 0       // JSONP回调函数计数器
        };
        
        // API使用统计
        this.apiUsage = this.loadApiUsage();
        
        // 事件注册表
        this.events = {};
        
        // 地图实例（搜索和标注共用）
        this.mapRenderer = null;
        
        // 标注数组（用于清除旧标注）
        this.markers = [];
        
        // 存储的中心点（用于地图初始显示）
        this.currentCenter = null;
    }

    /**
     * 默认配置选项
     */
    BaiduPoiSearch.prototype.defaults = {
        // === 百度地图配置 ===
        apiKey: '', // 百度地图API密钥
        defaultCity: '泉州市', // 默认城市
        defaultCoordinate: '118.6, 24.9', // 默认中心点坐标

        // === API使用量配置 ===
        // 百度api对个人用户流量及并发量皆有限制，每日限制请求次数100或5000，不可同时发起3个以上请求
        // API使用量流量及并发量控制配置
        dailyLimit: 100, // 每日API调用限制次数
        defaultDelay: 400, // 默认延迟（毫秒）
        concurrentLimit: 3, // 指定并发量阈值
        overLimitDelay: 1000, // 超过并发量时的延迟（毫秒）

        // === 地图配置 ===
        draft: {
            id: 'bd-container', // 地图容器根节点Id
            // autoResize: true // 此参数没用，作废
            enabled: true, // 是否启用地图
            zoom: 14, // 默认缩放级别（3-19）
            enableWheelZoom: true, // 是否启用鼠标滚轮缩放
            autoViewPort: true, // 是否自动调整视野显示所有标注
            maxPointsPerCategory: 10, // 每个分类最多显示几个标注
            maxTotalPoints: 30, // 所有分类最多显示几个标注
            highlightColor: '#E60000', // 高亮颜色
            switchCategoryConfirm: false // 切换分类时是否提示（默认不提示）
        },
 
        // === 搜索配置 ===
        defaultLocation: '泉州浦西万达广场', // 默认位置名称
        defaultKeyword: '学校', // 默认关键词。可多个，中间用顿号或逗号分隔：如：学校、医院、银行
        defaultRadius: 1000, // 默认搜索半径（米）

        // === 多选配置 ===
        enableMultiSelect: true, // 启用多选模式
        selectionLimit: 5, // 单次选择数量限制
        selectionLimitWarning: 3, // 显示警告的选择数量阈值
        defaultCategoryCount: 15, // 快速按钮默认显示的分类数量

        // === 布局配置 ===
        layoutMode: 'split', // 'split'（左右）或 'fullscreen'（全屏）

        // // 下面的2个参数不起作用，都是写死在css里了
        // splitLayout: {
        //     mapWidth: '70%', // 地图容器宽度
        //     searchWidth: '30%', // 搜索面板宽度
        //     mapPosition: 'left',  // 地图位置：'left' 或 'right'
        //     resizable: true, // 是否可拖动调整宽度
        //     minWidth: 300, // 搜索面板最小宽度
        //     maxWidth: 600 // 搜索面板最大宽度
        // },
        // fullscreenLayout: {
        //     searchPosition: 'top-right',  // 搜索面板位置
        //     searchWidth: 400, // 搜索面板宽度
        //     maxHeight: 600, // 搜索面板最大高度
        //     draggable: true, // 是否可拖动位置
        //     collapsible: true, // 是否可折叠
        //     collapsed: false, // 默认是否折叠
        //     autoCollapse: false // 地图操作时自动折叠
        // },

        // API使用情况提示
        showApiUsage: true, // 是否显示API使用情况
        apiUsageStorageKey: 'baidu_poi_api_usage',  // localStorage键名

        // 搜索面板
        searchPanel: {
            id: 'poi-search-panel',
            className: 'poi-search-panel'
        },
        
        // === 回调函数 ===
        onInit: null, // 初始化完成
        onLayoutChange: null, // 布局切换
        onMapInit: null, // 地图初始化
        onSearchStart: null, // 搜索开始
        onSearchProgress: null, // 搜索进度
        onSearchOvered: null, // 搜索完成
        onResultClick: null, // 点击结果
        onError: null, // 错误处理
        
        
        // === 报告模板生成规则配置 ===
        // 判断类型	适用因素	判断依据
        // 按距离	与重要场所 (设施) 的距离	最近设施的距离
        // 按数量	住宅聚集度、停车方便程度	设施数量
        // 按种类 + 数量	道路状况、公交线路	种类和数量

        // 距离阈值（米）
        distanceThreshold: {
            near: 3000, // < 3000米 = 近
            medium: 5000  // < 5000米 = 一般，>= 5000米 = 较远
        },
        // 数量阈值（个）
        countThreshold: {
            high: 5, // >= 5个 = 较高
            medium: 2     // >= 2个 = 一般，< 2个 = 较低
        },
        // 评语配置、判断类型配置
        commentRules: {
            // 按距离判断
            '与重要场所(设施)的距离': {
                type: 'distance',
                categories: ['school', 'hospital', 'bank', 'subway', 'park', 'government'],
                keywords: {
                    near: '与重要场所(设施)的距离均近', // 最近<500m
                    medium: '与重要场所(设施)的距离一般', // 最近<1000m
                    far: '与重要场所(设施)的距离较远' // 最近>=1000m
                }
            },
            // 按数量判断
            '住宅聚集度': {
                type: 'count',
                categories: ['community'],
                keywords: {
                    high: '住宅聚集度较高', // >=5个
                    medium: '住宅聚集度一般', // 3-4个
                    low: '住宅聚集度较低' // <3个
                }
            },
            '道路状况': {
                type: 'count',
                categories: ['road'],
                keywords: {
                    high: '道路通达度较高',
                    medium: '道路通达度一般',
                    low: '道路通达度较低'
                }
            },
            '停车方便程度': {
                type: 'count',
                categories: ['parking'],
                keywords: {
                    easy: '停车位较多，停车方便',
                    normal: '停车位一般',
                    difficult: '停车位较少，停车不便'
                }
            }
        }
    };

    /**
     * POI分类配置数据（25个完整分类）
     * 参考百度地图文档： https://lbs.baidu.com/index.php?title=open/poitags
     */
    BaiduPoiSearch.prototype.getPOICategories = function() {
        return {
            // ==================== POI 分类匹配规则配置 ====================
            // ======== 快速选择分类：有利因素 ========
            'government': {
                name: '政府', // 名称
                icon: '🏢', // emoji图标
                typeKeyword: '政府机构', // 百度地图 POI 主类型。目前此参数没用，只是预留
                matchKeywords: [ // 包含的关键词。目前没有用于搜索，即不会参与搜索，只参与过滤
                    '政府', '行政', '办事处', '服务中心', '政务', '管委会', '街道办', '镇政府', '乡政府'
                ],
                excludeKeywords: [ // 不包含的、过滤或排除的关键词
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '停车场', '车库', '公厕', '卫生间', '大门'
                ],
                subcategories: [ // 子分类
                    { name: '全部', value: '' },
                    { name: '政府机关', value: '政府机关' },
                    { name: '政务服务中心', value: '政务服务中心' },
                    { name: '街道/乡镇', value: '街道办事处' }
                ]
            },
			'stadium': {
                name: '体育馆',
                icon: '⚽',
                typeKeyword: '体育馆',
                matchKeywords: [
                    '体育馆', '体育中心', '运动场', '体育场', '全民健身中心', '文体中心', '公共运动场'
                ],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口', 
                    '停车场', '商铺',
                    '私教', '会所', '搏击', '瑜伽', 
                    '俱乐部', '健身', '健身房', '健身馆',
                    '游泳馆', '运动馆', '游泳馆(私人)', '运动馆(商业)'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '公共体育馆', value: '公共体育馆' },
                    { name: '市民体育中心', value: '市民体育中心' },
                    { name: '文体活动中心', value: '文体中心' }
                ]
            },
			'school': {
                name: '学校',
                icon: '🏫',
                typeKeyword: '教育',
                matchKeywords: ['学校', '中学', '小学', '高中', '大学', '幼儿园', '职校', '技校', '学院'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '警务室', '保安室', '停车', '宿舍', 
                    '食堂', '商店', '小卖部', '便利店', '分店', '小吃', '奶茶', '饮料',
                    '培训学校', '培训中心', '训练营', '考训中心', '补习班', '托儿所', '托管班', '书店', '驾校', '驾驶培训'
                ],
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
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '警务室', '保安室', '停车', '宿舍', 
                    '食堂', '商店', '小卖部', '便利店', '分店', '小吃', '奶茶', '饮料',
                    '口腔', '牙科',
                    '美容', '整形', '康复', '体检', '药房',
                    '检验', '影像', '血透', '名医馆',
                    '健康管理中心', '疾控中心'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '综合医院', value: '综合医院' },
                    { name: '专科医院', value: '专科医院' },
                    { name: '卫生院', value: '卫生院' },
                    { name: '诊所', value: '诊所' }
                ]
            },
			'community': {
                name: '小区',
                icon: '🏠',
                typeKeyword: '住宅',
                matchKeywords: ['小区', '公寓', '住宅区'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '警务室', '保安室', '停车', '宿舍', 
                    '食堂', '商店', '小卖部', '便利店', '分店', '小吃', '奶茶', '饮料'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '商品房', value: '商品房' },
                    { name: '保障房', value: '保障房' }
                ]
            },
			'bank': {
                name: '银行',
                icon: '🏦',
                typeKeyword: '金融',
                matchKeywords: ['银行', '信用社', '农商行', '邮储'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    'ATM', '自助', '24小时', '取款'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '国有银行', value: '国有银行' },
                    { name: '商业银行', value: '商业银行' },
                    { name: '信用社', value: '信用社' }
                ]
            },
			
			'park': {
                name: '公园',
                icon: '🌿',
                typeKeyword: '休闲娱乐',
                matchKeywords: ['公园', '广场', '绿地'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '游乐场', '动物园', '植物园'
               ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '城市公园', value: '城市公园' },
                    { name: '社区公园', value: '社区公园' }
                ]
            },
            'bus': {
                name: '公交',
                icon: '🚌',
                typeKeyword: '交通设施',
                matchKeywords: ['公交', '公交站', '公交枢纽'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口'
               ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '公交站', value: '公交站' },
                    { name: '公交枢纽', value: '公交枢纽' }
                ]
            },
			'parking': {
                name: '停车场',
                icon: '🅿️',
                typeKeyword: '交通设施',
                matchKeywords: ['停车场', '停车库', '车位'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口'
               ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '地面停车场', value: '地面停车场' },
                    { name: '地下车库', value: '地下车库' }
                ]
            },
			'road': {
                name: '道路',
                icon: '🚥',
                typeKeyword: '道路',
                matchKeywords: ['路', '大道', '大街', '街', '公路', '快速路', '高速',
                    '高架', '大桥', '桥', '隧道', '匝道', '环路', '干线',
                    '支路', '巷', '弄', '国道', '省道', '县道'],
                excludeKeywords: [
                    '小区', '园区', '厂区', '校区', '院区', '商城', '商场',
                    '广场', '公馆', '金街', '步行街', '内部路', '园区路',
                    '便道', '步道', '通道', '消防通道', '步行街', '地下通道', '路口', '交叉口', '辅路', '辅道'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '城市主路', value: '城市主路' },
                    { name: '快速路/高架', value: '快速路' },
                    { name: '高速公路', value: '高速公路' },
                    { name: '桥梁/隧道', value: '桥梁隧道' },
                    { name: '街巷/支路', value: '街巷支路' }
                ]
            },
            
			'market': {
                name: '超市',
                icon: '🏪',
                typeKeyword: '购物',
                matchKeywords: ['超市', '商场', '百货', '购物中心'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '便利店', '水果店', '菜店'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '大型超市', value: '大型超市' },
                    { name: '便利店', value: '便利店' },
                    { name: '购物中心', value: '购物中心' }
                ]
            },
			'shopping_mall': {
                name: '商场',
                icon: '🏬',
                typeKeyword: '购物',
                matchKeywords: ['商场', '购物中心', '百货大楼'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '便利店'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '大型商场', value: '大型商场' },
                    { name: '购物中心', value: '购物中心' }
                ]
            },
            'hotel': {
                name: '酒店',
                icon: '🏨',
                typeKeyword: '住宿服务',
                matchKeywords: ['酒店', '宾馆', '旅馆', '招待所'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '星级酒店', value: '星级酒店' },
                    { name: '快捷酒店', value: '快捷酒店' }
                ]
            },
			'gas_station': {
                name: '加油站',
                icon: '⛽',
                typeKeyword: '交通',
                matchKeywords: ['加油站', '加气站', '充电站'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '便利店', '洗车'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '中石油', value: '中石油' },
                    { name: '中石化', value: '中石化' }
                ]
            },

			'market_farm': {
                name: '市场',
                icon: '🏬',
                typeKeyword: '购物',
                matchKeywords: ['菜市场', '农贸市场', '海鲜市场'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '便利店', '超市'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '菜市场', value: '菜市场' },
                    { name: '农贸市场', value: '农贸市场' }
                ]
            },

            // test1
            'culture': {
                name: '文体',
                icon: '📚',
                typeKeyword: '休闲娱乐',
                matchKeywords: [
                    '图书馆', '文化馆', '文化宫', '展览馆', '博物馆', '美术馆', '艺术馆',
                    '影剧院', '剧院', '剧场', '木偶剧院', '大剧院', '青少年宫',
                    '文体中心', '文化中心', '陈列馆', '会展中心', '体育馆', '体育场', 
                    '全民健身中心'
                ],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    'KTV', '酒吧', '网咖', '密室',
                    '私人影院', '健身会所', '商业娱乐', '电玩城'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '文博展馆', value: '博物馆,美术馆,展览馆,艺术馆' },
                    { name: '文化活动', value: '文化馆,文化宫,青少年宫,文体中心' },
                    { name: '剧院剧场', value: '影剧院,剧场,剧院,木偶剧院' },
                    { name: '公共体育', value: '体育馆,体育场' }
                ]
            },

			'subway': {
                name: '地铁',
                icon: '🚇',
                typeKeyword: '交通设施',
                matchKeywords: ['地铁', '地铁站', '轻轨'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '地铁站', value: '地铁站' }
                ]
            },
            'company': {
                name: '公司',
                icon: '📊',
                typeKeyword: '企业办公',
                matchKeywords: ['公司', '企业', '集团', '总部', '办公楼', '商务中心', '科创园', '企业园区'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '商铺', '门店', '超市', '餐饮', '小店', '营业点'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '企业公司', value: '企业' },
                    { name: '办公大厦', value: '办公楼' },
                    { name: '产业园区', value: '企业园区' }
                ]
            },
            'factory': {
                name: '厂房',
                icon: '🏭',
                typeKeyword: '工业厂区',
                matchKeywords: ['厂房', '工厂', '工业区', '工业园', '生产车间', '制造厂区', '加工基地'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口',
                    '商铺', '写字楼', '商住', '商场', '门店'
                ],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '工业厂房', value: '厂房' },
                    { name: '工业园区', value: '工业园' },
                    { name: '生产工厂', value: '工厂' }
                ]
            },

            // ======== 快速选择分类：不利因素 ========
            'cemetery': {
                name: '陵园',
                icon: '⛪',
                typeKeyword: '殡葬服务',
                matchKeywords: ['陵园', '公墓', '墓地'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口'
                ],
                subcategories: [
                    { name: '全部', value: '' }
                ]
            },
            'garbage_station': {
                name: '垃圾站',
                icon: '♻️',
                typeKeyword: '公共服务',
                matchKeywords: ['垃圾站', '垃圾转运站'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口'
                ],
                subcategories: [
                    { name: '全部', value: '' }
                ]
            },
            'substation': {
                name: '变电站',
                icon: '⚡',
                typeKeyword: '基础设施',
                matchKeywords: ['变电站', '变电所'],
                excludeKeywords: [
                    '门', '正门', '后门', '侧门', '东门', '西门', '南门', '北门', '入口', '出口'
                ],
                subcategories: [
                    { name: '全部', value: '' }
                ]
            }
        };
    };



    /**
     * 加载百度地图API脚本
     * @param {String} ak - 百度地图API密钥
     * @param {Function} callback - 加载完成后的回调函数
     */
    BaiduPoiSearch.prototype.loadBaiduMapScript = function(ak, callback) {
        if (!ak) {
            console.error('百度地图API密钥（apiKey）未配置，请设置 options.apiKey');
            callback && callback(false);
            return;
        }

        // 检查是否已加载
        if (window.BMap) {
            console.log('百度地图API已加载');
            callback && callback(true);
            return;
        }

        // 定义全局回调函数
        window.baiduMapInit = function() {
            // console.log('百度地图API初始化完成，BMap 对象已创建');
            callback && callback(true);
        };

        // 动态加载百度地图API脚本，使用callback参数
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://api.map.baidu.com/api?v=3.0&ak=' + ak + '&callback=baiduMapInit';
        script.async = true;

        script.onerror = function() {
            console.error('百度地图API加载失败，请检查 apiKey 是否正确');
            callback && callback(false);
        };

        document.head.appendChild(script);
    };

    /**
     * 初始化插件
     */
    BaiduPoiSearch.prototype.init = function() {
        var self = this;

        // 加载百度地图API
        this.loadBaiduMapScript(this.options.apiKey, function(success) {
            if (!success) {
                // 加载失败，显示错误信息
                var container = document.getElementById(self.options.searchPanel.id);
                if (container) {
                    container.innerHTML = '<div class="error-message">' +
                        '<h3>❌ 百度地图API加载失败</h3>' +
                        '<p>请检查 apiKey 是否正确配置</p>' +
                        '</div>';
                }
                return;
            }

            // 检查容器是否存在
            var container = document.getElementById(self.options.searchPanel.id);
            if (!container) {
                console.error('搜索面板容器不存在:', self.options.searchPanel.id);
                return;
            }

            // 创建UI
            self.createUI();
            
            // 初始化地图、百度地图初始化
            self.initMap();

            // 绑定事件
            self.bindEvents();

            // 更新API使用情况显示
            self.updateApiUsageUI();

            // 应用初始布局
            self.setLayoutMode(self.options.layoutMode);

            // 触发初始化完成事件
            self.triggerX('onInit', self);

            // console.log('BaiduPoiSearch 插件初始化完成');
        });
    };

    /**
     * 创建UI界面
     */
    BaiduPoiSearch.prototype.createUI = function() {
        var container = document.getElementById(this.options.searchPanel.id);
        
        var html = '<div class="panel-header">' +
            '<div class="panel-title">' +
            '<h2>🗺️ 周边配套检索</h2>' +
            '<span class="plugin-version">' + VERSION + '</span>' +
            '</div>' +
            '<div class="layout-toggle">' +
            '<button type="button" id="btn-split-layout" class="active" data-layout="split">左右布局</button>' +
            '<button type="button" id="btn-fullscreen-layout" data-layout="fullscreen">全屏布局</button>' +
            '</div>' +
            '</div>';
        
        // API使用情况
        if (this.options.showApiUsage) {
            html += '<div class="api-usage">' +
                        '<span class="api-version">百度地图api v3.0 每日流量限制</span>' +
                        '<div class="api-stats">' +
                            '<span>已用：<strong id="api-used">0</strong>次</span>' +
                            '<span>剩余：<strong id="api-remaining">100</strong>次</span>' +
                            '<span>限制：<strong id="api-limit">100</strong>次</span>' +
                        '</div>' +
                '</div>';
        }
        
        // 搜索表单
        html += '<div class="search-form">' +
            '<div class="form-row">' +
            '<div class="form-group">' +
            '<label for="city">城市</label>' +
            '<input type="text" id="city" value="' + this.options.defaultCity + '" placeholder="北京市">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="location">位置名称</label>' +
            '<input type="text" id="location" value="' + this.options.defaultLocation + '" placeholder="小区或楼盘名称">' +
            '</div>' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group">' +
            '<label for="keyword">关键词</label>' +
            '<input type="text" id="keyword" value="' + this.options.defaultKeyword + '" placeholder="如：学校、医院、银行">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="radius">半径</label>' +
            '<div class="radius-input-wrapper">' +
            '<input type="number" id="radius" value="' + this.options.defaultRadius + '" min="100" max="10000">' +
            '<span class="radius-unit">米</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div id="errorMessage" class="alert alert-error" style="display: none;"></div>' +
            '<div class="button-group">' +
            '<button type="button" class="btn btn-primary" id="btn-search">开始搜索</button>' +
            '<button type="button" class="btn btn-secondary btn-auto" id="btn-clear">清空</button>' +
            '</div>' +
            '</div>';
        
        // 已选分类计数（始终显示）
        html += '<div class="multi-select-section">' +
            '<span id="selectedCount" style="display: none;">已选 0 个</span>' +
            '</div>';
        
        // 快速选择
        html += '<div class="quick-select-section">' +
            '<div class="quick-select-title">快速选择</div>';
        
        var categories = this.cache.categories;
        var categoryCount = this.options.defaultCategoryCount || this.defaults.defaultCategoryCount;
        var categoryKeys = Object.keys(categories).slice(0, categoryCount); // 前N个
        
        for (var i = 0; i < categoryKeys.length; i++) {
            var key = categoryKeys[i];
            var cat = categories[key];
            html += '<button type="button" class="quick-btn" data-category="' + key + '">' + cat.icon + ' ' + cat.name + '</button>';
        }
        
        html += '<button type="button" class="quick-btn-more" id="moreBtn">更多 ↓</button>' +
            '</div>';
        
        // 更多分类
        html += '<div class="quick-select-section" id="moreSection" style="display: none;">' +
            '<div class="quick-select-title">更多分类</div>';
        
        var moreCategoryKeys = Object.keys(categories).slice(categoryCount); // 剩余的
        for (var i = 0; i < moreCategoryKeys.length; i++) {
            var key = moreCategoryKeys[i];
            var cat = categories[key];
            html += '<button type="button" class="quick-btn" data-category="' + key + '">' + cat.icon + ' ' + cat.name + '</button>';
        }
        
        html += '</div>';
        
        // 已选分类标签区
        html += '<div class="selected-categories" id="selectedCategories" style="display: none;">' +
            '<div class="selected-title">已选分类：</div>' +
            '<div class="selected-tags" id="selectedTags"></div>' +
            '<button type="button" class="btn-clear-all" id="clearAllBtn">清空所有</button>' +
            // '<button type="button" class="btn-filter-categories" id="filterCategoriesBtn" style="display: none;">筛选子分类</button>' +
            '</div>';

        // 子分类筛选下拉框
        html += '<div class="filter-dropdown" id="filterDropdown" style="display: none;">' +
            '<div class="filter-header">' +
            '<span>📂 选择分类和子分类</span>' +
            '<button type="button" class="btn-close" id="closeFilter">×</button>' +
            '</div>' +
            '<div class="filter-body">' +
            '<div id="filterCategoriesContainer">' +
            '<p style="text-align: center; color: #999; padding: 20px;">请先选择分类</p>' +
            '</div>' +
            '</div>' +
            '<div class="filter-footer">' +
            '<button type="button" class="btn btn-secondary" id="cancelFilter">取消</button>' +
            '<button type="button" class="btn btn-primary" id="applyFilter">确定</button>' +
            '</div>' +
            '</div>';
        
        // 搜索结果
        html += '<div class="search-results" id="searchResults" style="display: none;">' +
            '<div class="results-header">' +
            '<h3>📊 搜索结果</h3>' +
            '<span id="resultsCount"></span>' +
            '</div>' +
            '<div id="showAllMarkersBtnContainer" style="display: none; margin-bottom: 8px;">' +
            '<button class="btn btn-secondary" id="showAllMarkersBtn">🔙 显示全部标注</button>' +
            '</div>' +
            '<div class="tabs">' +
            '<button type="button" class="tab active" data-tab="brief">📝 报告描述</button>' +
            '<button type="button" class="tab" data-tab="template">📄 报告模板</button>' +
            '<button type="button" class="tab" data-tab="report">📋 位置分析</button>' +
            '<button type="button" class="tab" data-tab="list">📊 详细列表</button>' +
            '</div>' +
            '<div class="tab-content active" id="briefTab">' +
            '<textarea class="report-textarea" id="briefText"></textarea>' +
            '</div>' +
            '<div class="tab-content" id="templateTab">' +
            '<textarea class="report-textarea" id="templateText"></textarea>' +
            '<div class="report-actions">' +
            '<button type="button" class="btn btn-secondary" id="btn-copy-template">📋 复制</button>' +
            '<button type="button" class="btn btn-secondary" id="btn-down-template">💾 下载</button>' +
            '</div>' +
            '</div>' +
            '<div class="tab-content" id="reportTab">' +
            '<textarea class="report-textarea" id="reportText"></textarea>' +
            '<div class="report-actions">' +
            '<button type="button" class="btn btn-secondary" id="btn-copy-position">📋 复制</button>' +
            '<button type="button" class="btn btn-secondary" id="btn-down-position">💾 下载</button>' +
            '</div>' +
            '</div>' +
            '<div class="tab-content" id="listTab">' +
            '<div class="poi-list" id="poiList"></div>' +
            '</div>' +
            '</div>';
        
        container.innerHTML = html;
    };

    /**
     * 绑定事件
     */
    BaiduPoiSearch.prototype.bindEvents = function() {
        var self = this;
        // 布局切换
        document.getElementById('btn-split-layout').addEventListener('click', function() {
            self.setLayoutMode('split');
        });
        
        document.getElementById('btn-fullscreen-layout').addEventListener('click', function() {
            self.setLayoutMode('fullscreen');
        });
        
        // 百度地图输入下拉功能 test1
        var mapInstance = this.mapRenderer;
        var suggestId = 'location'; // 绑定关键词输入框的id
        var domSuggestDropHideArea = document.createElement('div');
        domSuggestDropHideArea.id = 'searchResultPanel';
        domSuggestDropHideArea.style.display = 'none';
        document.body.appendChild(domSuggestDropHideArea);
        if(document.getElementById(suggestId) != null) {
            function G(id) {
                return document.getElementById(id);
            }
            var ac = new BMap.Autocomplete({ // 建立一个自动完成的对象
                input: suggestId,
                location: this.mapRenderer
            });
            ac.addEventListener("onhighlight", function (e) {
                // 鼠标放在下拉列表上的事件
                var str = "";
                var _value = e.fromitem.value;
                var value = "";
                if (e.fromitem.index > -1) {
                    value =
                        _value.province +
                        _value.city +
                        _value.district +
                        _value.street +
                        _value.business;
                }
                str =
                    "FromItem<br />index = " +
                    e.fromitem.index +
                    "<br />value = " +
                    value;

                value = "";
                if (e.toitem.index > -1) {
                    _value = e.toitem.value;
                    value =
                        _value.province +
                        _value.city +
                        _value.district +
                        _value.street +
                        _value.business;
                }
                str +=
                    "<br />ToItem<br />index = " +
                    e.toitem.index +
                    "<br />value = " +
                    value;
                G("searchResultPanel").innerHTML = str;
            });
            var myValue;
            ac.addEventListener("onconfirm", function (e) {
                // 鼠标点击下拉列表后的事件
                var _value = e.item.value;
                myValue =
                    _value.province +
                    _value.city +
                    _value.district +
                    _value.street +
                    _value.business;
                G("searchResultPanel").innerHTML =
                    "onconfirm<br />index = " +
                    e.item.index +
                    "<br />myValue = " +
                    myValue;
                // var results = ac.getResults(); // 这里是所有下拉项的信息，也没有坐桃城
                // console.log('results：', results)
                setPlace(); // 地点定位并取到坐标
            });
        }
        // 获取下拉选中项的坐标
        function setPlace() {
            mapInstance.clearOverlays(); // 清除地图上所有覆盖物
            function myFun() {
                var result = local.getResults();
                var total = result.getNumPois(); // 结果总数
                // console.log('total：', total);
                if(total > 0) {
                    var pp = result.getPoi(0).point; // 获取第一个智能搜索的结果
                    // var lng = pp.lng, lat = pp.lat; // 下拉选项的坐标信息
                    // 创建标注点
                    // map.centerAndZoom(pp, 18);
                    // map.addOverlay(new BMap.Marker(pp)); // 添加标注
                }
            }
            var local = new BMap.LocalSearch(mapInstance, {
                onSearchComplete: myFun // 智能搜索
            });
            local.search(myValue);
        }


        // 开始搜索按钮
        document.getElementById('btn-search').addEventListener('click', function() {
            self.handleSearch();
        });
        
        // 清空按钮
        document.getElementById('btn-clear').addEventListener('click', function() {
            self.handleClear();
        });
        
        // 关键词输入
        var keywordInput = document.getElementById('keyword');
        keywordInput.addEventListener('input', function() {
            self.handleKeywordInput(this.value);
        });
        
        // 快速选择按钮（事件委托）
        var quickSelectSection = document.querySelector('.quick-select-section');
        if (quickSelectSection) {
            quickSelectSection.addEventListener('click', function(e) {
                if (e.target.classList.contains('quick-btn')) {
                    var category = e.target.getAttribute('data-category');
                    self.handleQuickSelect(category, e.target);
                }
            });
        }
        
        // 更多按钮
        var moreBtn = document.getElementById('moreBtn');
        if (moreBtn) {
            moreBtn.addEventListener('click', function() {
                var moreSection = document.getElementById('moreSection');
                var isHidden = moreSection.style.display === 'none';
                moreSection.style.display = isHidden ? 'block' : 'none';
                this.textContent = isHidden ? '收起 ↑' : '更多 ↓';
            });
        }
        
        // 更多分类区域也需要绑定事件（使用 querySelectorAll 修复）
        var moreSection = document.getElementById('moreSection');
        if (moreSection) {
            moreSection.addEventListener('click', function(e) {
                if (e.target.classList.contains('quick-btn')) {
                    var category = e.target.getAttribute('data-category');
                    self.handleQuickSelect(category, e.target);
                }
            });
        }
        
        // 清空所有按钮
        var clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                self.clearAllCategories();
            });
        }

        // 筛选子分类按钮
        var filterCategoriesBtn = document.getElementById('filterCategoriesBtn');
        if (filterCategoriesBtn) {
            filterCategoriesBtn.addEventListener('click', function() {
                self.showFilterDropdown();
            });
        }

        // 筛选下拉框事件
        var closeFilterBtn = document.getElementById('closeFilter');
        var cancelFilterBtn = document.getElementById('cancelFilter');
        var applyFilterBtn = document.getElementById('applyFilter');
        var filterDropdown = document.getElementById('filterDropdown');

        if (closeFilterBtn) {
            closeFilterBtn.addEventListener('click', function() {
                filterDropdown.style.display = 'none';
            });
        }

        if (cancelFilterBtn) {
            cancelFilterBtn.addEventListener('click', function() {
                filterDropdown.style.display = 'none';
            });
        }

        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', function() {
                self.applyFilter();
                filterDropdown.style.display = 'none';
            });
        }
        
        // Tab切换
        var tabs = document.querySelectorAll('.tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', function(e) {
                self.handleTabClick(e.target);
            });
        }
        

        // 报告模板复制按钮：复制报告
        var eleBtnTemplateCopy = document.getElementById('btn-copy-template');
        if (eleBtnTemplateCopy) {
            eleBtnTemplateCopy.addEventListener('click', function() {
                self.copyTemplateReport();
            });
        }

        // 报告模板下载按钮：下载报告
        var eleBtnTemplateDown = document.getElementById('btn-down-template');
        if (eleBtnTemplateDown) {
            eleBtnTemplateDown.addEventListener('click', function() {
                self.downloadTemplateReport();
            });
        }

        // 位置分析复制按钮：复制位置信息
        var eleBtnPositionCopy = document.getElementById('btn-copy-position');
        if (eleBtnPositionCopy) {
            eleBtnPositionCopy.addEventListener('click', function() {
                self.copyPosition();
            });
        }

        // 位置分析下载按钮：下载位置信息
        var eleBtnPositionDown = document.getElementById('btn-down-position');
        if (eleBtnPositionDown) {
             eleBtnPositionDown.addEventListener('click', function() {
                 self.downloadPosition();
             });
        }


        // 显示全部标注按钮
        var showAllMarkersBtn = document.getElementById('showAllMarkersBtn');
        if (showAllMarkersBtn) {
            showAllMarkersBtn.addEventListener('click', function() {
                self.showAllCategoryMarkers();
            });
        }
    };

    /**
     * 处理搜索
     */
    BaiduPoiSearch.prototype.handleSearch = function() {
        var city = document.getElementById('city').value.trim();
        var location = document.getElementById('location').value.trim();
        var keyword = document.getElementById('keyword').value.trim();
        var radius = parseInt(document.getElementById('radius').value) || this.options.defaultRadius;
        
        this.hideError(); // 先隐藏错误信息

        if (!location) {
            this.showError('请输入位置名称');
            return;
        }
        
        if (!keyword && this.state.selectedCategories.length === 0) {
            this.showError('请输入关键词或选择分类');
            return;
        }
        
        // 解析关键词
        var categories = [];
        if (keyword) {
            // 支持逗号、顿号、空格分隔
            var keywords = keyword.split(/[,，、\s]+/); // 关键词分隔符支持中英文逗号、顿号
            for (var i = 0; i < keywords.length; i++) {
                var kw = keywords[i].trim();
                if (kw) {
                    var catKey = this.findCategoryByKeyword(kw);
                    if (catKey) {
                        // 记录原始关键词，用于精确搜索
                        categories.push({
                            key: catKey,
                            searchKeyword: kw  // 使用用户输入的原始关键词
                        });
                    }
                }
            }
        }
        
        // 添加已选分类（点击按钮选择的分类使用分类名称搜索）
        for (var j = 0; j < this.state.selectedCategories.length; j++) {
            var selectedKey = this.state.selectedCategories[j];
            // 检查是否已存在
            var exists = false;
            for (var k = 0; k < categories.length; k++) {
                if (categories[k].key === selectedKey) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                categories.push({
                    key: selectedKey,
                    searchKeyword: null  // 使用分类名称
                });
            }
        }
        
        // 去重
        var uniqueKeys = [];
        var uniqueCategories = [];
        for (var m = 0; m < categories.length; m++) {
            if (uniqueKeys.indexOf(categories[m].key) === -1) {
                uniqueKeys.push(categories[m].key);
                uniqueCategories.push(categories[m]);
            }
        }
        categories = uniqueCategories;
        
        if (categories.length === 0) {
            this.showError('未找到匹配的分类');
            return;
        }
        
        // 检查选择数量限制
        if (categories.length > this.options.selectionLimit) {
            this.showError('单次最多选择' + this.options.selectionLimit + '个分类');
            return;
        }
        
        // 检查剩余次数
        if (categories.length > this.apiUsage.limit - this.apiUsage.used) {
            this.showError('剩余次数不足（剩余' + (this.apiUsage.limit - this.apiUsage.used) + '次）');
            return;
        }
        
        // 执行搜索
        this.search({
            city: city,
            location: location,
            radius: radius,
            categories: categories
        });
    };

    /**
     * 执行搜索
     * @param {Object} params - 搜索参数
     */
    BaiduPoiSearch.prototype.search = function(params) {
        var self = this;
        
        if (this.state.isSearching) {
            console.warn('正在搜索中，请勿重复操作');
            return;
        }
        
        this.state.isSearching = true;
        
        // 触发搜索开始事件
        this.triggerX('onSearchStart', params);


        // 更新UI
        var eleBtnSearch = document.getElementById('btn-search');
        if (eleBtnSearch) {
            eleBtnSearch.disabled = true;
            eleBtnSearch.textContent = '搜索中...';
        }
        
        // 获取位置坐标
        this.getLocationCoordinate(params.city, params.location, function(center, error) {
            if (error) {
                self.state.isSearching = false;
                self.showError(error);
                self.triggerX('onError', error);
                
                if (eleBtnSearch) {
                    eleBtnSearch.disabled = false;
                    eleBtnSearch.textContent = '开始搜索';
                }
                return;
            }
            
            // 搜索所有分类
            self.searchMultipleCategories(params.categories, params.city, center, params.radius);
        });
    };

    /**
     * 获取位置坐标
     * @param {String} city - 城市
     * @param {String} location - 位置名称
     * @param {Function} callback - 回调函数
     */
    BaiduPoiSearch.prototype.getLocationCoordinate = function(city, location, callback) {
        // 使用共享的Map实例，避免创建多个实例占用并发连接
        var local = new BMap.LocalSearch(this.mapRenderer, {
            onSearchComplete: function(results) {
                if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                    if (results.getCurrentNumPois() > 0) {
                        var poi = results.getPoi(0);
                        // console.log('位置坐标获取成功:', location, '坐标:', poi.point.lng, poi.point.lat);
                        callback({
                            lat: poi.point.lat,
                            lng: poi.point.lng,
                            name: location,
                            address: poi.address || ''
                        });
                    } else {
                        callback(null, '无法找到该位置，请检查名称是否正确，也有可能是流量超限被百度限制1');
                    }
                } else {
                    callback(null, '无法找到该位置，请检查名称是否正确，也有可能是流量超限被百度限制2');
                }
            }
        });

        // 在城市范围内搜索位置
        local.searchInBounds(location, new BMap.Bounds(
            new BMap.Point(117.5, 24.5),
            new BMap.Point(119.5, 25.5)
        ));
    };

    /**
     * 搜索多个分类
     * @param {Array} categories - 分类列表，每个元素是 {key, searchKeyword}
     * @param {String} city - 城市
     * @param {Object} center - 中心点坐标
     * @param {Number} radius - 搜索半径
     */
    BaiduPoiSearch.prototype.searchMultipleCategories = function(categories, city, center, radius) {
        // console.log('categories：', categories); // eg. {key: 'culture', searchKeyword: '文体'}
        var self = this;
        var total = categories.length;
        var completed = 0;
        var results = {};
        var hasError = false;

        // 递归逐个发起请求，避免并发JSONP请求导致的跨域问题
        var searchIndex = 0;

        function searchNext() {
            if (searchIndex >= categories.length) {
                // 所有搜索完成
                self.state.isSearching = false;

                // 更新API使用统计
                self.updateApiUsage(total);

                // 恢复搜索按钮
                var eleBtnSearch = document.getElementById('btn-search');
                if (eleBtnSearch) {
                    eleBtnSearch.disabled = false;
                    eleBtnSearch.textContent = '开始搜索';
                }

                // 保存结果
                self.cache.results = {
                    searchParams: {
                        city: city,
                        location: center,
                        radius: radius,
                        categories: categories
                    },
                    results: results,
                    stats: self.calculateStats(results)
                };

                console.log('cache：', self.cache); // testing1

                // 显示结果
                self.displayResults();
                
                // 在地图上添加标注
                self.addMarkersToMap(center);

                // 控制台打印JSON结果（方便调试）
                // console.log('搜索按钮-打印搜索结果:', self.cache.results);

                // 触发搜索完成事件
                self.triggerX('onSearchOvered', self.cache.results);

                if (hasError) {
                    self.showError('部分搜索失败，请查看控制台');
                }
                return;
            }

            var categoryItem = categories[searchIndex];
            var categoryKey = categoryItem.key;
            var searchKeyword = categoryItem.searchKeyword;  // 原始关键词
            searchIndex++;

            self.searchPoiByCategory(categoryKey, city, center, radius, searchKeyword, function(pois, error) {
                if (error) {
                    console.error('搜索失败:', categoryKey, error);
                    hasError = true;
                } else {
                    results[categoryKey] = pois;
                }

                completed++;

                // 触发进度事件
                self.triggerX('onSearchProgress', {
                    completed: completed,
                    total: total,
                    category: categoryKey
                });

                // 根据分类数量决定延迟时间
                var delay;
                if (total <= self.options.concurrentLimit) {
                    // 分类数量在限制内，使用默认延迟
                    delay = self.options.defaultDelay;
                } else {
                    // 分类数量超过限制，使用超限延迟
                    delay = self.options.overLimitDelay;
                }
                
                // 搜索下一个分类
                setTimeout(function() {
                    searchNext();
                }, delay); // 延时，防止并发受限
            });
        }

        // 开始搜索
        searchNext();
    };

    /**
     * 搜索单个分类的POI：根据关键词搜索数据 test1
     * 百度地图api周边搜索
     * @param {String} categoryKey - 分类键
     * @param {String} city - 城市
     * @param {Object} center - 中心点坐标
     * @param {Number} radius - 搜索半径
     * @param {String} searchKeyword - 原始搜索关键词（可选，用于精确搜索）
     * @param {Function} callback - 回调函数
     */
    BaiduPoiSearch.prototype.searchPoiByCategory = function(categoryKey, city, center, radius, searchKeyword, callback) {
        // console.log('categoryKey：', categoryKey)
        // console.log('searchKeyword：', searchKeyword); // test3
        var self = this;

        var category = this.cache.categories[categoryKey];
        if (!category) {
            callback(null, '分类不存在');
            return;
        }
        
        // 如果提供了原始关键词（如"小学"），使用它搜索；否则使用分类名称（如"学校"）
        var keyword = searchKeyword || category.name;

        // 使用共享的Map实例，避免创建多个实例占用并发连接
        var local = new BMap.LocalSearch(this.mapRenderer, {
            // test1
            // renderOptions: {
            //     map: this.mapRenderer, 
            //     autoViewport: false
            // },
            
            onSearchComplete: function(results) {
                // console.log('results：', results);
                if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                    // 转换结果格式
                    var pois = [];
                    for (var i = 0; i < results.getCurrentNumPois(); i++) {
                        var poi = results.getPoi(i);

                        // 检查是否在排除列表中
                        var excluded = false;
                        for (var j = 0; j < category.excludeKeywords.length; j++) {
                            var excludeKeyword = category.excludeKeywords[j];
                            if (poi.title.indexOf(excludeKeyword) !== -1) {
                                excluded = true;
                                break;
                            }
                        }

                        if (excluded) {
                            continue;
                        }

                        // 计算距离
                        var distance = self.calculateDistance(center.lat, center.lng, poi.point.lat, poi.point.lng);

                        pois.push({
                            id: categoryKey + '-' + i,
                            name: poi.title,
                            address: poi.address || '',
                            location: {
                                lat: poi.point.lat,
                                lng: poi.point.lng
                            },
                            distance: Math.round(distance),
                            category: categoryKey,
                            categoryName: category.name
                        });

                        
                    }
                    console.log('pois-1：', pois); // testing1
                    // 按距离排序
                    pois.sort(function(a, b) {
                        return a.distance - b.distance;
                    });
                    console.log('pois-2：', pois); // testing1

                    callback(pois);
                } else {
                    callback(null, '搜索失败');
                }
            }
        });

        // 搜索周边，使用中心点坐标，关键词优先使用原始输入
        var centerPoint = new BMap.Point(center.lng, center.lat);
        // console.log('keyword：', keyword, '\nenterPoint：', centerPoint, '\nradius：', radius); // test3
        local.searchNearby(keyword, centerPoint, radius);
    };

    /**
     * 过滤POI
     * @param {Array} pois - POI列表
     * @param {Object} category - 分类配置
     * @param {Object} center - 中心点坐标
     * @returns {Array} 过滤后的POI列表
     */
    BaiduPoiSearch.prototype.filterPois = function(pois, category, center) {
        var filtered = [];
        
        for (var i = 0; i < pois.length; i++) {
            var poi = pois[i];
            var name = poi.name;
            
            // 检查是否在排除列表中
            var excluded = false;
            for (var j = 0; j < category.excludeKeywords.length; j++) {
                var keyword = category.excludeKeywords[j];
                if (name.indexOf(keyword) !== -1) {
                    excluded = true;
                    break;
                }
            }
            
            if (excluded) {
                continue;
            }
            
            // 计算距离
            var distance = this.calculateDistance(center.lat, center.lng, poi.location.lat, poi.location.lng);
            
            filtered.push({
                id: category.key + '-' + i,
                name: name,
                address: poi.address || '',
                location: {
                    lat: poi.location.lat,
                    lng: poi.location.lng
                },
                distance: Math.round(distance),
                category: category.key,
                categoryName: category.name
            });
        }
        
        // 按距离排序
        filtered.sort(function(a, b) {
            return a.distance - b.distance;
        });
        
        return filtered;
    };

    /**
     * 计算两点之间的距离（Haversine公式）
     * @param {Number} lat1 - 点1纬度
     * @param {Number} lng1 - 点1经度
     * @param {Number} lat2 - 点2纬度
     * @param {Number} lng2 - 点2经度
     * @returns {Number} 距离（米）
     */
    BaiduPoiSearch.prototype.calculateDistance = function(lat1, lng1, lat2, lng2) {
        var R = 6371000; // 地球半径（米）
        var dLat = this.toRad(lat2 - lat1);
        var dLng = this.toRad(lng2 - lng1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    /**
     * 角度转弧度
     * @param {Number} degrees - 角度
     * @returns {Number} 弧度
     */
    BaiduPoiSearch.prototype.toRad = function(degrees) {
        return degrees * Math.PI / 180;
    };

    /**
     * 根据关键词查找分类
     * @param {String} keyword - 关键词
     * @returns {String|null} 分类键
     */
    BaiduPoiSearch.prototype.findCategoryByKeyword = function(keyword) {
        var categories = this.cache.categories;
        
        for (var key in categories) {
            if (categories.hasOwnProperty(key)) {
                var category = categories[key];
                
                // 检查分类名称
                if (category.name === keyword) {
                    return key;
                }
                
                // 检查匹配关键词
                for (var i = 0; i < category.matchKeywords.length; i++) {
                    if (category.matchKeywords[i] === keyword) {
                        return key;
                    }
                }
            }
        }
        
        return null;
    };

    /**
     * 计算统计信息
     * @param {Object} results - 搜索结果
     * @returns {Object} 统计信息
     */
    BaiduPoiSearch.prototype.calculateStats = function(results) {
        var total = 0;
        var byCategory = {};
        
        for (var key in results) {
            if (results.hasOwnProperty(key)) {
                var count = results[key].length;
                byCategory[key] = count;
                total += count;
            }
        }
        
        return {
            total: total,
            byCategory: byCategory
        };
    };




    //————————————————————————————————————————————————
    /**
     * 显示搜索结果
     */
    BaiduPoiSearch.prototype.displayResults = function() {
        if (!this.cache.results) {
            return;
        }
        
        var resultsDiv = document.getElementById('searchResults');
        resultsDiv.style.display = 'block';
        
        var stats = this.cache.results.stats;
        var searchParams = this.cache.results.searchParams;
        
        // 更新结果数量 - 显示关键词
        var eleResultCount = document.getElementById('resultsCount');
        if (eleResultCount) {
            // 获取搜索关键词
            var keywords = [];
            var categories = this.cache.categories;
            for (var key in searchParams.categories) {
                var cat = searchParams.categories[key];
                if (cat.searchKeyword) {
                    keywords.push(cat.searchKeyword);
                } else if (categories[cat.key]) {
                    keywords.push(categories[cat.key].name);
                }
            }
            var keywordText = keywords.length > 0 ? '关键词：' + keywords.join('、') + '；' : '';
            eleResultCount.innerHTML = keywordText + '共找到<em>' + stats.total + '</em>个设施';
        }
        
        // 生成报告描述（brief）
        this.generateBriefReport();
        
        // 生成位置分析报告
        this.generateReport();
        
        // 生成报告模板
        this.generateTemplateReport();
        
        // 生成详细列表
        this.generatePoiList();
    };


    //————————————————————————————————————————————————
    /**
     * 生成报告模板：估价报告模板
     */
     BaiduPoiSearch.prototype.generateTemplateReport = function() {
        var templateTextarea = document.getElementById('templateText');
        if (!templateTextarea) return;
        
        var results = this.cache.results;
        if (!results || !results.results) {
            templateTextarea.value = '请先进行POI搜索，再生成报告模板。';
            return;
        }
        
        var report = '';
        
        report += '估价技术报告\n';
        report += '一、估价对象描述与分析\n';
        report += 'I.区位状态描述与分析\n\n';

        // 1，位置状况
        report += '1、位置状况\n\n';
        
        // (1)坐落
        report += '(1)坐落：\n';
        
        // (2)方位
        report += '(2)方位：\n';
        
        // (3)与重要场所(设施)的距离：【动态生成】
        report += '(3)与重要场所(设施)的距离：';
        var distanceInfo = this.generateDistanceReport(results.results);
        if (distanceInfo) {
            report += distanceInfo.desc + '，' + distanceInfo.comment + '。\n';
        } else {
            report += '\n';
        }
        
        // (5)楼幢位置
        report += '(5)楼幢位置：\n';
        
        // (6)朝向
        report += '(6)朝向：\n';
        
        // (7)楼层
        report += '(7)楼层：\n';
        
        // (8)住宅聚集度：【动态生成】
        report += '(8)住宅聚集度：';
        var communityInfo = this.generateCommunityReport(results.results);
        if (communityInfo) {
            report += communityInfo.desc + '，' + communityInfo.comment + '。\n';
        } else {
            report += '\n';
        }
        
        report += '\n';
        
        // 2，交通状况
        report += '2、交通状况\n\n';
        
        // (1)道路状况：【动态生成】
        report += '(1)道路状况：';
        var roadInfo = this.generateRoadReport(results.results);
        if (roadInfo) {
            report += roadInfo.desc + '，' + roadInfo.comment + '。\n';
        } else {
            report += '\n';
        }
        
        // (2)出入可利用交通工具：【动态生成公交部分】
        report += '(2)出入可利用交通工具：出入可利用私家车，自行车、出租车及公交车等；';
        var busInfo = this.generateBusReport(results.results);
        if (busInfo) {
            report += busInfo + '。\n';
        } else {
            report += '\n';
        }
        
        // (3)交通管制情况
        report += '(3)交通管制情况：\n';
        
        // (4)停车方便程度：【动态生成】
        report += '(4)停车方便程度：';
        var parkingInfo = this.generateParkingReport(results.results);
        if (parkingInfo) {
            report += parkingInfo.comment + '。\n';
        } else {
            report += '\n';
        }
        
        // report += '综上，交通状况较优。\n'; // 这里要改 test1
        
        templateTextarea.value = report;
    };

    /**
     * 生成距离描述
     */
    BaiduPoiSearch.prototype.generateDistanceReport = function(results) {
        var allPois = [];
        var excludeCategories = ['road', 'community', 'bus', 'parking']; // 排除掉：道路、小区、公交、停车场
        for (var key in results) {
            if (excludeCategories.indexOf(key) === -1 && results[key]) {
                allPois = allPois.concat(results[key]);
            }
        }
        
        if (allPois.length === 0) return '';
        
        allPois.sort(function(a, b) { return a.distance - b.distance; });
        var top3 = allPois.slice(0, 3);
        
        var desc = '';
        for (var i = 0; i < top3.length; i++) {
            desc += '距离' + top3[i].name + '约' + top3[i].distance + '米';
            if (i < top3.length - 1) {
                desc += '、';
            }
        }
        
        var nearest = top3[0].distance;
        var nearThreshold = this.options.distanceThreshold.near;
        var mediumThreshold = this.options.distanceThreshold.medium;
        var comment;
        if (nearest < nearThreshold) {
            comment = this.options.commentRules['与重要场所(设施)的距离'].keywords.near;
        } else if (nearest < mediumThreshold) {
            comment = this.options.commentRules['与重要场所(设施)的距离'].keywords.medium;
        } else {
            comment = this.options.commentRules['与重要场所(设施)的距离'].keywords.far;
        }
        
        return { desc: desc, comment: comment };
    };

    /**
     * 生成住宅聚集度描述
     */
    BaiduPoiSearch.prototype.generateCommunityReport = function(results) {
        var pois = results['community'];
        if (!pois || pois.length === 0) return '';
        
        var count = pois.length;
        var names = pois.slice(0, 5).map(function(p) { return p.name; }).join('，');
        
        var desc = '区域内有' + names + '等';
        var highThreshold = this.options.countThreshold.high;
        var mediumThreshold = this.options.countThreshold.medium;
        var comment;
        if (count >= highThreshold) {
            comment = this.options.commentRules['住宅聚集度'].keywords.high;
        } else if (count >= mediumThreshold) {
            comment = this.options.commentRules['住宅聚集度'].keywords.medium;
        } else {
            comment = this.options.commentRules['住宅聚集度'].keywords.low;
        }
        
        return { desc: desc, comment: comment };
    };

    /**
     * 生成道路状况描述
     */
    BaiduPoiSearch.prototype.generateRoadReport = function(results) {
        var pois = results['road'];
        if (!pois || pois.length === 0) return '';
        
        var count = pois.length;
        var roads = pois.slice(0, 8).map(function(p) {
            return p.name.replace(/\(.*\)/, '').replace(/（.*）/, '');
        });
        
        var desc = '周边有' + roads.join('，') + '等';
        var highThreshold = this.options.countThreshold.high;
        var mediumThreshold = this.options.countThreshold.medium;
        var comment;
        if (count >= highThreshold) {
            comment = this.options.commentRules['道路状况'].keywords.high;
        } else if (count >= mediumThreshold) {
            comment = this.options.commentRules['道路状况'].keywords.medium;
        } else {
            comment = this.options.commentRules['道路状况'].keywords.low;
        }
        
        return { desc: desc, comment: comment };
    };

    /**
     * 生成公交描述
     */
    BaiduPoiSearch.prototype.generateBusReport = function(results) {
        var placeMaxLen = 10; // 超过N个，用等结尾，比如"地点1,地点2等"
        var pois = results['bus'];
        if (!pois || pois.length === 0) return '';
        
        // var stationName = pois[0].name;
        var address = pois[0].address.toString().replace(/\s+/g, '').replace(/(;)/g, '、'); // 公交线路
        var busMaxPois = pois.slice(0, placeMaxLen).map(function(p) { return p.name; });
        var busNameStr = '"' + busMaxPois.join('、') + (pois.length <= placeMaxLen ? '"' : '"等');


        var report = '周边有' + busNameStr + pois.length + '个公交站点，';
        
        if (pois.length >= 3) {
            report += '有' + address + '等公交线路，公交班次较多，辐射范围较广，公共交通便捷度较好';
        } else if (pois.length >= 1) {
            report += '有' + address + '等公交线路，公交班次一般，辐射范围普通，公共交通便捷度一般';
        } else {
            report += '公共交通便捷度一般';
        }
        
        return report;
    };

    /**
     * 生成停车方便程度描述
     */
    BaiduPoiSearch.prototype.generateParkingReport = function(results) {
        var pois = results['parking'];
        if (!pois || pois.length === 0) return '';
        
        var count = pois.length;
        var highThreshold = this.options.countThreshold.high;
        var mediumThreshold = this.options.countThreshold.medium;
        var comment;
        if (count >= highThreshold) {
            comment = this.options.commentRules['停车方便程度'].keywords.easy;
        } else if (count >= mediumThreshold) {
            comment = this.options.commentRules['停车方便程度'].keywords.normal;
        } else {
            comment = this.options.commentRules['停车方便程度'].keywords.difficult;
        }
        
        return { comment: comment };
    };




    //————————————————————————————————————————————————
    /**
     * 生成报告描述（brief）
     */
    BaiduPoiSearch.prototype.generateBriefReport = function() {
        var briefTextarea = document.getElementById('briefText');
        if (!briefTextarea) return;
        
        var results = this.cache.results;
        if (!results || !results.results) {
            briefTextarea.value = '';
            return;
        }
        
        var report = '';
        var searchParams = results.searchParams;
        var poiResults = results.results;
        // console.log('报告描述-打印搜索结果poiresult：', poiResults)
        
        // 获取搜索时使用的关键词
        var searchKeywords = [];
        if (searchParams.categories) {
            for (var key in searchParams.categories) {
                var cat = searchParams.categories[key];
                if (cat.searchKeyword) {
                    searchKeywords.push(cat.searchKeyword);
                }
            }
        }

        // 关键词不是公交时，显示eg：区域内有 公园：北滨江安全文化公园、北滨江公园·浦西园、泉州北滨江公园田安园、北滨江公园沉洲园；医院：东南医院、东湖医院、人民医院、第二医院等。
        var placeMaxLen = 10; // 超过N个，用等结尾，比如"地点1,地点2等"
        var composeStr = '';
        for(var v in poiResults) {
            var one = poiResults[v];
            // console.log('one：', one)
            if(v != 'bus') { // 关键词不是公交时
                var placeMaxPois = one.slice(0, placeMaxLen).map(function(p) { return p.name; });
                // console.log('placePois：', placePois)
                if(one.length > 0) {
                    var category = one[0].categoryName;
                    composeStr += category + '：' + placeMaxPois.join('、');
                    if(one.length > placeMaxLen) composeStr += '等';
                    composeStr += '；\n\n';
                }
            }
        }
        composeStr = composeStr.replace(/(;|；|;\n|；\n)$/, '。'); // 最后一个符号是分号时，替换成句号
        if(composeStr != '') report += '区域内有\n' + composeStr;

        // 关键词是“公交”时，显示“出入可利用交通工具...”
        var keywordIncludesBus = false; // 检查用户输入的关键词是否包含"公交"
        if (searchParams.categories) {
            for (var key in searchParams.categories) {
                var cat = searchParams.categories[key];
                if (cat.searchKeyword && cat.searchKeyword.indexOf('公交') !== -1) {
                    keywordIncludesBus = true;
                    break;
                }
            }
        }
        // 公交时 显示eg. 出入可利用私家车、公交车、自行车及出租车等；周边有“aa,bb”等公交站点，有1路、2路等10条公交线路停靠。
        if (keywordIncludesBus) {
            var busPois = poiResults['bus'];
            report += report == '' ? '' : '\n';
            report += '出入可利用交通工具\n';
            report += '出入可利用私家车、公交车、自行车及出租车等；';
            
            if (busPois && busPois.length > 0) {
                // var stationName = busPois[0].name;
                var address = busPois[0].address.toString().replace(/\s+/g, '').replace(/(;)/g, '、'); // 公交线路
                var busMaxPois = busPois.slice(0, placeMaxLen).map(function(p) { return p.name; });
                var busNameStr = '"' + busMaxPois.join('、') + (busPois.length <= placeMaxLen ? '"' : '"等');
                report += '周边有' + busNameStr + busPois.length + '个公交站点';
                
                var busLines = [];
                for (var i = 0; i < Math.min(busPois.length, 5); i++) {
                    busLines.push(busPois[i].name.replace('站', ''));
                }
                if (busLines.length > 0) {
                    report += '，有' +  address + '等公交线路停靠。'; 
                }
            }
        }

        briefTextarea.value = report;
    };




    //————————————————————————————————————————————————
    /**
     * 生成位置分析
     */
    BaiduPoiSearch.prototype.generateReport = function() {
        if (!this.cache.results) {
            return;
        }
        
        var searchParams = this.cache.results.searchParams;
        var results = this.cache.results.results;
        var stats = this.cache.results.stats;
        
        var report = '';
        
        // 标题
        report += '【' + searchParams.location.name + ' - 周边配套情况报告】\n\n';
        
        // 配套设施状况
        report += '1、外部配套设施状况\n';
        
        var categories = this.cache.categories;
        for (var key in results) {
            if (results.hasOwnProperty(key) && results[key].length > 0) {
                var category = categories[key];
                var pois = results[key];
                
                report += '   (' + (Object.keys(results).indexOf(key) + 1) + ') ' + category.name + '设施：\n';
                
                // 前3个最近的设施
                var count = Math.min(3, pois.length);
                for (var i = 0; i < count; i++) {
                    report += '   距离' + pois[i].name + '约' + pois[i].distance + '米';
                    if (i < count - 1) {
                        report += '、';
                    }
                }
                report += '，';
                
                // 评价
                if (pois.length >= 3) {
                    report += category.name + '配套完善。\n';
                } else if (pois.length >= 1) {
                    report += category.name + '配套较好。\n';
                } else {
                    report += category.name + '配套不足。\n';
                }
            }
        }
        
        report += '\n';
        
        // 位置分析
        report += '2、位置分析\n';
        report += '   (1) 位置名称：' + searchParams.location.name + '\n';
        report += '   (2) 所在城市：' + searchParams.city + '\n';
        report += '   (3) 搜索范围：' + searchParams.radius + '米\n';
        report += '   (4) 搜索分类：';
        
        var categoryKeys = Object.keys(results);
        for (var i = 0; i < categoryKeys.length; i++) {
            var key = categoryKeys[i];
            report += categories[key].name;
            if (i < categoryKeys.length - 1) {
                report += '、';
            }
        }
        report += '\n';
        report += '   (5) 搜索结果：共找到' + stats.total + '个相关设施\n\n';
        
        // 详细设施列表
        report += '3、详细设施列表（按分类和距离排序）\n';
        
        var index = 1;
        for (var key in results) {
            if (results.hasOwnProperty(key) && results[key].length > 0) {
                var category = categories[key];
                var pois = results[key];
                
                report += '   【' + category.name + '】\n';
                
                for (var i = 0; i < pois.length; i++) {
                    var poi = pois[i];
                    report += '   ' + (index++) + '. ' + poi.name + '\n';
                    report += '      - 距离：约' + poi.distance + '米\n';
                    report += '      - 地址：' + poi.address + '\n';
                    report += '      - 经纬度：(' + poi.location.lat + ', ' + poi.location.lng + ')\n';
                }
            }
        }
        
        // 显示报告
        var reportTextarea = document.getElementById('reportText');
        if (reportTextarea) {
            reportTextarea.value = report;
        }
    };



    //————————————————————————————————————————————————
    /**
     * 生成POI详细列表
     */
    BaiduPoiSearch.prototype.generatePoiList = function() {
        var self = this;
        if (!this.cache.results) {
            return;
        }
        
        var results = this.cache.results.results;
        var categories = this.cache.categories;
        var poiList = document.getElementById('poiList');
        
        var html = '';
        
        // 分类序号
        var catIndex = 1;
        
        for (var key in results) {
            if (results.hasOwnProperty(key) && results[key].length > 0) {
                var category = categories[key];
                var pois = results[key];
                
                html += '<div class="poi-category-group">' +
                    '<h4 class="category-title">' + catIndex + '. ' + category.icon + ' ' + category.name + '（' + pois.length + '个）</h4>';
                
                for (var i = 0; i < pois.length; i++) {
                    var poi = pois[i];
                    html += '<div class="poi-item" data-poi-id="' + poi.id + '">' +
                        '<div class="poi-name">(' + (i + 1) + ')' + poi.name + '</div>' +
                        '<div class="poi-info">' +
                        '<span class="poi-distance">距离：' + poi.distance + '米</span>' +
                        '<span class="poi-address">' + poi.address + '</span>' +
                        '</div>' +
                        '</div>';
                }
                
                html += '</div>';
                catIndex++;
            }
        }
        
        if (poiList) {
            poiList.innerHTML = html;
            
            // 绑定点击事件
            var poiItems = poiList.querySelectorAll('.poi-item');
            for (var i = 0; i < poiItems.length; i++) {
                poiItems[i].addEventListener('click', function(e) {
                    var poiId = this.getAttribute('data-poi-id');
                    self.handlePoiClick(poiId);
                });
            }
        }
    };




    //————————————————————————————————————————————————
    /**
     * 处理POI点击
     * @param {String} poiId - POI ID
     */
    BaiduPoiSearch.prototype.handlePoiClick = function(poiId) {
        var self = this;
        var poi = this.findPoiById(poiId);
        if (!poi) {
            return;
        }
        
        // 先尝试高亮标注（如果标注存在）
        var highlighted = this.highlightMarker(poi);
        
        if (!highlighted) {
            // 标注不在当前显示列表中（被 maxTotalPoints 过滤了）
            var config = this.options.draft;
            
            if (config.switchCategoryConfirm) {
                // 需要确认
                var category = this.cache.categories[poi.category];
                var confirmed = confirm('该POI已被过滤（不在当前显示范围内）。\n\n是否切换到只显示「' + category.name + '」分类？');
                
                if (confirmed) {
                    // 切换到只显示该分类的模式，并高亮点
                    this.showCategoryMarkersOnly(poi.category, poi);
                }
            } else {
                // 直接切换，不提示
                this.showCategoryMarkersOnly(poi.category, poi);
            }
        }
        
        // 触发点击事件
        this.triggerX('onResultClick', poi);
    };

    /**
     * 只显示指定分类的标注
     * @param {String} categoryKey - 分类键
     * @param {Object} highlightPoi - 需要高亮的POI（可选）
     */
    BaiduPoiSearch.prototype.showCategoryMarkersOnly = function(categoryKey, highlightPoi) {
        var results = this.cache.results;
        if (!results || !results.results) {
            return;
        }
        
        var pois = results.results[categoryKey] || [];
        if (pois.length === 0) {
            return;
        }
        
        // 清除当前标注
        this.clearMarkers();
        
        // 记录当前是否处于分类切换模式
        this.state.categoryFilterMode = categoryKey;
        
        // 只添加该分类的标注
        var points = [];
        var config = this.options.draft;
        
        for (var i = 0; i < pois.length; i++) {
            var poi = pois[i];
            var point = new BMap.Point(poi.location.lng, poi.location.lat);
            points.push(point);
            
            // 获取分类颜色
            var categoryColor = this.getCategoryColor(poi.category);
            
            // 创建标注
            var marker = new BMap.Marker(point);
            
            // 处理名称（公交站保留"站"后缀）
            var displayName = this.formatPoiName(poi);
            
            // 创建标签（Label在标注点上方，白色背景+彩色边框）
            var label = new BMap.Label(displayName, {
                offset: new BMap.Size(-25, -35)  // 调整到标注点上方
            });
            label.setStyle({
                border: '2px solid ' + categoryColor,
                borderRadius: '6px',
                padding: '3px 8px',
                backgroundColor: 'white',
                fontSize: '12px',
                color: categoryColor,
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap'
            });
            
            marker.setLabel(label);
            marker.poiData = poi;
            
            // 点击标注显示详情
            var self = this;
            marker.addEventListener('click', (function(p) {
                return function() {
                    self.showPoiInfoWindow(p);
                };
            })(poi));
            
            // 添加到地图
            this.mapRenderer.addOverlay(marker);
            this.markers.push(marker);
        }
        
        // console.log('已切换到只显示「' + categoryKey + '」分类，共 ' + pois.length + ' 个标注');
        
        // 自动调整视野
        if (config.autoViewPort && points.length > 0) {
            this.fitViewPort(points);
        }
        
        // 如果指定了需要高亮的POI，高亮它
        if (highlightPoi) {
            var self = this;
            setTimeout(function() {
                self.highlightMarker(highlightPoi);
            }, 100);
        }
        
        // 显示"显示全部"按钮
        var showAllBtnContainer = document.getElementById('showAllMarkersBtnContainer');
        if (showAllBtnContainer) {
            var category = this.cache.categories[categoryKey];
            showAllBtnContainer.innerHTML = '<button type="button" class="btn btn-secondary" id="showAllMarkersBtn">🔙 显示全部标注（当前：' + category.name + '）</button>';
            showAllBtnContainer.style.display = 'block';
            // 重新绑定点击事件
            document.getElementById('showAllMarkersBtn').addEventListener('click', function() {
                self.showAllCategoryMarkers();
            });
        }
    };

    /**
     * 显示所有分类的标注
     */
    BaiduPoiSearch.prototype.showAllCategoryMarkers = function() {
        if (!this.cache.results || !this.currentCenter) {
            return;
        }
        
        // 清除当前标注
        this.clearMarkers();
        
        // 清除分类过滤模式
        this.state.categoryFilterMode = null;
        
        // 重新添加所有分类的标注
        this.addMarkersToMap(this.currentCenter);
        
        // console.log('已切换回显示全部分类');
    };
    /**     * 根据ID查找POI
     * @param {String} poiId - POI ID
     * @returns {Object|null} POI对象
     */
    BaiduPoiSearch.prototype.findPoiById = function(poiId) {
        if (!this.cache.results) {
            return null;
        }
        
        var results = this.cache.results.results;
        
        for (var key in results) {
            if (results.hasOwnProperty(key)) {
                for (var i = 0; i < results[key].length; i++) {
                    if (results[key][i].id === poiId) {
                        return results[key][i];
                    }
                }
            }
        }
        
        return null;
    };



    //————————————————————————————————————————————————
    /**
     * 报告模板复制按钮：复制报告
     */
    BaiduPoiSearch.prototype.copyTemplateReport = function() {
        var templateTextarea = document.getElementById('templateText');
        if (templateTextarea) {
            var text = templateTextarea.value;
            if (!text) {
                alert('报告模板内容为空');
                return;
            }
            
            // 尝试使用现代API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                    alert('报告已复制到剪贴板');
                }).catch(function() {
                    // fallback: 使用传统方法
                    self.fallbackCopyText(text);
                });
            } else {
                // fallback: 使用传统方法
                this.fallbackCopyText(text);
            }
        }
    };

    /**
     * 报告模板下载按钮：下载报告
     */
    BaiduPoiSearch.prototype.downloadTemplateReport = function() {
        var templateTextarea = document.getElementById('templateText');
        var locationName = document.getElementById('location').value || '配套报告';
        
        if (templateTextarea) {
            var blob = new Blob([templateTextarea.value], { type: 'text/plain;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = locationName + '_报告模板.txt';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    /**
     * 位置分析复制按钮：复制位置信息
     */
    BaiduPoiSearch.prototype.copyPosition = function() {
        var reportTextarea = document.getElementById('reportText');
        if (reportTextarea) {
            this.fallbackCopyText(reportTextarea.value);
        }
    };

    /**
     * 位置分析下载按钮：下载位置分析信息
     */
     BaiduPoiSearch.prototype.downloadPosition = function() {
        var reportTextarea = document.getElementById('reportText');
        var locationName = document.getElementById('location').value || '配套报告';
        
        if (reportTextarea) {
            var blob = new Blob([reportTextarea.value], { type: 'text/plain;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = locationName + '_配套报告.txt';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    /**
     * 备用复制方法
     */
    BaiduPoiSearch.prototype.fallbackCopyText = function(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('报告已复制到剪贴板');
        } catch (e) {
            alert('复制失败，请手动复制');
        }
        document.body.removeChild(textarea);
    };


 

    




    //————————————————————————————————————————————————
    /**
     * 处理快速选择
     * @param {String} categoryKey - 分类键
     * @param {HTMLElement} btn - 按钮元素
     */
    /**
     * 处理快速选择（始终为多选模式）
     * @param {String} categoryKey - 分类键
     * @param {HTMLElement} btn - 按钮元素
     */
    BaiduPoiSearch.prototype.handleQuickSelect = function(categoryKey, btn) {
        var index = this.state.selectedCategories.indexOf(categoryKey);

        if (index === -1) {
            // 选中
            this.state.selectedCategories.push(categoryKey);
            btn.classList.add('selected');
        } else {
            // 取消选中
            this.state.selectedCategories.splice(index, 1);
            btn.classList.remove('selected');
        }

        // 更新关键词输入框
        this.updateKeywordInput();

        // 更新已选分类UI
        this.updateSelectedCategoriesUI();
    };

    /**
     * 处理关键词输入
     * @param {String} value - 输入值
     */
    BaiduPoiSearch.prototype.handleKeywordInput = function(value) {
        // 清除已选分类（当用户开始手动输入时）
        if (value && this.state.selectedCategories.length > 0) {
            this.state.selectedCategories = [];
            this.clearSelectedButtons();
            this.state.selectedSubcategories = {};
        }

        this.updateSelectedCategoriesUI();
    };

    /**
     * 更新关键词输入框
     * 单选模式：显示单个分类名
     * 多选模式：显示分类列表（用顿号分隔）
     */
    BaiduPoiSearch.prototype.updateKeywordInput = function() {
        var keywordInput = document.getElementById('keyword');
        if (!keywordInput) return;

        if (this.state.selectedCategories.length === 0) {
            keywordInput.value = '';
            return;
        }

        var names = [];
        for (var i = 0; i < this.state.selectedCategories.length; i++) {
            var key = this.state.selectedCategories[i];
            var category = this.cache.categories[key];
            names.push(category.name);
        }

        keywordInput.value = names.join('、');
    };

    /**
     * 设置多选模式
     * @param {Boolean} isMultiSelect - 是否多选模式
     */
    BaiduPoiSearch.prototype.setMultiSelectMode = function(isMultiSelect) {
        this.state.multiSelectMode = isMultiSelect;

        // 更新按钮状态
        var btnSingleMode = document.getElementById('btnSingleMode');
        var btnMultipleMode = document.getElementById('btnMultipleMode');

        if (btnSingleMode && btnMultipleMode) {
            btnSingleMode.classList.toggle('active', !isMultiSelect);
            btnMultipleMode.classList.toggle('active', isMultiSelect);
        }

        // 如果切换到单选模式，只保留第一个选中的分类
        if (!isMultiSelect && this.state.selectedCategories.length > 1) {
            var firstCategory = this.state.selectedCategories[0];
            this.state.selectedCategories = [firstCategory];
            this.clearSelectedButtons();
            var firstBtn = document.querySelector('.quick-btn[data-category="' + firstCategory + '"]');
            if (firstBtn) {
                firstBtn.classList.add('selected');
            }
        }

        // 更新关键词输入框
        this.updateKeywordInput();

        // 更新已选分类UI
        this.updateSelectedCategoriesUI();
    };

    /**
     * 显示筛选下拉框
     */
    BaiduPoiSearch.prototype.showFilterDropdown = function() {
        var filterDropdown = document.getElementById('filterDropdown');
        var filterCategoriesContainer = document.getElementById('filterCategoriesContainer');

        if (!filterDropdown || !filterCategoriesContainer) {
            return;
        }

        // 生成筛选分类HTML
        var html = '';

        for (var i = 0; i < this.state.selectedCategories.length; i++) {
            var categoryKey = this.state.selectedCategories[i];
            var category = this.cache.categories[categoryKey];

            html += '<div class="filter-category-group">' +
                '<h4>' + category.icon + ' ' + category.name + '</h4>';

            if (category.subcategories && category.subcategories.length > 1) {
                html += '<select class="subcategory-select" data-category="' + categoryKey + '">';

                for (var j = 0; j < category.subcategories.length; j++) {
                    var sub = category.subcategories[j];
                    var selected = this.state.selectedSubcategories[categoryKey] === sub.value ? 'selected' : '';
                    html += '<option value="' + sub.value + '" ' + selected + '>' + sub.name + '</option>';
                }

                html += '</select>';
            } else {
                html += '<p style="color: #999; font-size: 12px;">无子分类</p>';
            }

            html += '</div>';
        }

        if (html === '') {
            html = '<p style="text-align: center; color: #999; padding: 20px;">请先选择分类</p>';
        }

        filterCategoriesContainer.innerHTML = html;
        filterDropdown.style.display = 'block';
    };

    /**
     * 应用筛选
     */
    BaiduPoiSearch.prototype.applyFilter = function() {
        var subcategorySelects = document.querySelectorAll('.subcategory-select');

        // 清空之前的子分类选择
        this.state.selectedSubcategories = {};

        for (var i = 0; i < subcategorySelects.length; i++) {
            var select = subcategorySelects[i];
            var categoryKey = select.getAttribute('data-category');
            var subcategoryValue = select.value;

            this.state.selectedSubcategories[categoryKey] = subcategoryValue;
        }

        // console.log('子分类筛选已应用:', this.state.selectedSubcategories);
    };

    /**
     * 更新已选分类UI
     */
    BaiduPoiSearch.prototype.updateSelectedCategoriesUI = function() {
        var selectedCount = document.getElementById('selectedCount');
        var selectedCategories = document.getElementById('selectedCategories');
        var selectedTags = document.getElementById('selectedTags');
        var filterCategoriesBtn = document.getElementById('filterCategoriesBtn');

        var count = this.state.selectedCategories.length;

        // 更新计数
        if (selectedCount) {
            if (count > 0) {
                selectedCount.style.display = 'inline';
                selectedCount.textContent = '已选 ' + count + ' 个';
            } else {
                selectedCount.style.display = 'none';
            }
        }

        // 更新标签区
        if (selectedCategories && selectedTags) {
            if (count > 0) {
                selectedCategories.style.display = 'block';

                var html = '';
                var categories = this.cache.categories;

                for (var i = 0; i < this.state.selectedCategories.length; i++) {
                    var key = this.state.selectedCategories[i];
                    var category = categories[key];
                    var subcategoryText = '';

                    // 显示子分类（如果已选择）
                    if (this.state.selectedSubcategories[key] && this.state.selectedSubcategories[key] !== '') {
                        subcategoryText = '（' + this.state.selectedSubcategories[key] + '）';
                    }

                    html += '<span class="selected-tag">' + category.icon + ' ' + category.name + subcategoryText + ' <span class="tag-close" data-category="' + key + '">×</span></span>';
                }

                selectedTags.innerHTML = html;

                // 绑定关闭事件
                var closeButtons = selectedTags.querySelectorAll('.tag-close');
                var self = this;
                for (var i = 0; i < closeButtons.length; i++) {
                    closeButtons[i].addEventListener('click', function(e) {
                        e.stopPropagation();
                        var catKey = this.getAttribute('data-category');
                        self.removeSelectedCategory(catKey);
                    });
                }

                // 显示筛选子分类按钮（仅当有子分类时）
                var hasSubcategories = false;
                for (var i = 0; i < this.state.selectedCategories.length; i++) {
                    var key = this.state.selectedCategories[i];
                    var category = this.cache.categories[key];
                    if (category.subcategories && category.subcategories.length > 1) {
                        hasSubcategories = true;
                        break;
                    }
                }

                if (filterCategoriesBtn) {
                    filterCategoriesBtn.style.display = hasSubcategories ? 'inline-block' : 'none';
                }
            } else {
                selectedCategories.style.display = 'none';
            }
        }
    };

    /**
     * 移除已选分类
     * @param {String} categoryKey - 分类键
     */
    BaiduPoiSearch.prototype.removeSelectedCategory = function(categoryKey) {
        var index = this.state.selectedCategories.indexOf(categoryKey);
        if (index !== -1) {
            this.state.selectedCategories.splice(index, 1);
            delete this.state.selectedSubcategories[categoryKey]; // 清空子分类选择

            // 移除按钮高亮
            var btn = document.querySelector('.quick-btn[data-category="' + categoryKey + '"]');
            if (btn) {
                btn.classList.remove('selected');
            }

            this.updateKeywordInput(); // 更新关键词输入框
            this.updateSelectedCategoriesUI();
        }
    };

    /**
     * 清空所有分类
     */
    BaiduPoiSearch.prototype.clearAllCategories = function() {
        this.state.selectedCategories = [];
        this.state.selectedSubcategories = {}; // 清空子分类选择
        this.clearSelectedButtons();
        this.updateKeywordInput(); // 清空关键词输入框
        this.updateSelectedCategoriesUI();
    };

    /**
     * 清除所有按钮的高亮
     */
    BaiduPoiSearch.prototype.clearSelectedButtons = function() {
        var selectedButtons = document.querySelectorAll('.quick-btn.selected');
        for (var i = 0; i < selectedButtons.length; i++) {
            selectedButtons[i].classList.remove('selected');
        }
    };

    /**
     * 高亮选中按钮
     * @param {String} categoryKey - 分类键
     * @param {HTMLElement} btn - 按钮元素
     */
    BaiduPoiSearch.prototype.highlightSelectedButton = function(categoryKey, btn) {
        var allButtons = document.querySelectorAll('.quick-btn');
        for (var i = 0; i < allButtons.length; i++) {
            allButtons[i].classList.remove('selected');
        }
        
        if (btn) {
            btn.classList.add('selected');
        }
    };

    /**
     * 处理Tab切换
     * @param {HTMLElement} tab - Tab元素
     */
    BaiduPoiSearch.prototype.handleTabClick = function(tab) {
        var tabName = tab.getAttribute('data-tab');
        
        // 更新Tab样式
        var tabs = document.querySelectorAll('.tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
        }
        tab.classList.add('active');
        
        // 隐藏所有Tab内容
        var briefTab = document.getElementById('briefTab');
        var reportTab = document.getElementById('reportTab');
        var listTab = document.getElementById('listTab');
        var templateTab = document.getElementById('templateTab');
        
        if (briefTab) briefTab.classList.remove('active');
        if (reportTab) reportTab.classList.remove('active');
        if (listTab) listTab.classList.remove('active');
        if (templateTab) templateTab.classList.remove('active');
        
        // 显示对应的Tab内容
        if (tabName === 'brief' && briefTab) {
            briefTab.classList.add('active');
        } else if (tabName === 'template' && templateTab) {
            templateTab.classList.add('active');
        } else if (tabName === 'report' && reportTab) {
            reportTab.classList.add('active');
        } else if (tabName === 'list' && listTab) {
            listTab.classList.add('active');
        }
    };

    /**
     * 处理清空
     */
    BaiduPoiSearch.prototype.handleClear = function() {
        document.getElementById('city').value = this.options.defaultCity;
        document.getElementById('location').value = '';
        document.getElementById('keyword').value = '';
        document.getElementById('radius').value = this.options.defaultRadius;

        this.state.selectedCategories = [];
        this.state.selectedSubcategories = {}; // 清空子分类选择
        this.clearSelectedButtons();
        this.updateSelectedCategoriesUI();

        var resultsDiv = document.getElementById('searchResults');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
        }

        this.hideError();
    };

    /**
     * 显示错误信息
     * @param {String} message - 错误信息
     */
    BaiduPoiSearch.prototype.showError = function(message) {
        var errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    };

    /**
     * 隐藏错误信息
     */
    BaiduPoiSearch.prototype.hideError = function() {
        var errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    };



    //————————————————————————————————————————————————
    /**
     * 设置布局模式
     * @param {String} mode - 布局模式：'split' 或 'fullscreen'
     */
    BaiduPoiSearch.prototype.setLayoutMode = function(mode) {
        if (mode !== 'split' && mode !== 'fullscreen') {
            console.error('无效的布局模式:', mode);
            return;
        }
        
        var container = document.querySelector('.poi-search-app');
        if (!container) {
            console.warn('容器不存在');
            return;
        }
        
        // 移除旧布局类
        container.classList.remove('layout-split', 'layout-fullscreen');
        
        // 添加新布局类
        container.classList.add('layout-' + mode);
        
        // 更新按钮状态
        var splitBtn = document.getElementById('btn-split-layout');
        var fullscreenBtn = document.getElementById('btn-fullscreen-layout');
        
        if (splitBtn && fullscreenBtn) {
            splitBtn.classList.toggle('active', mode === 'split');
            fullscreenBtn.classList.toggle('active', mode === 'fullscreen');
        }
        
        this.state.currentLayout = mode;
        
        // 触发布局切换事件
        this.triggerX('onLayoutChange', mode);
    };

    /**
     * 获取当前布局模式
     * @returns {String} 布局模式
     */
    BaiduPoiSearch.prototype.getLayoutMode = function() {
        return this.state.currentLayout;
    };

    /**
     * 加载API使用统计
     * @returns {Object} API使用统计
     */
    BaiduPoiSearch.prototype.loadApiUsage = function() {
        var today = new Date().toISOString().split('T')[0];
        var stored = null;
        
        try {
            stored = localStorage.getItem(this.options.apiUsageStorageKey);
        } catch (e) {
            console.warn('无法读取localStorage:', e);
        }
        
        if (stored) {
            try {
                var data = JSON.parse(stored);
                if (data.date === today) {
                    return data;
                }
            } catch (e) {
                console.warn('解析API使用统计失败:', e);
            }
        }
        
        // 新的一天，重置计数
        return {
            date: today,
            used: 0,
            limit: this.options.dailyLimit
        };
    };

    /**
     * 保存API使用统计
     */
    BaiduPoiSearch.prototype.saveApiUsage = function() {
        try {
            localStorage.setItem(this.options.apiUsageStorageKey, JSON.stringify(this.apiUsage));
        } catch (e) {
            console.warn('无法保存API使用统计:', e);
        }
    };

    /**
     * 更新API使用统计
     * @param {Number} count - 使用的次数
     */
    BaiduPoiSearch.prototype.updateApiUsage = function(count) {
        this.apiUsage.used += count;
        this.saveApiUsage();
        this.updateApiUsageUI();
    };

    /**
     * 更新API使用情况UI
     */
    BaiduPoiSearch.prototype.updateApiUsageUI = function() {
        if (!this.options.showApiUsage) {
            return;
        }
        
        var apiUsed = document.getElementById('api-used');
        var apiRemaining = document.getElementById('api-remaining');
        var apiLimit = document.getElementById('api-limit');
        
        if (apiUsed) {
            apiUsed.textContent = this.apiUsage.used;
        }
        if (apiRemaining) {
            apiRemaining.textContent = this.apiUsage.limit - this.apiUsage.used;
        }
        if (apiLimit) {
            apiLimit.textContent = this.apiUsage.limit;
        }
    };

    /**
     * 获取API使用情况
     * @returns {Object} API使用统计
     */
    BaiduPoiSearch.prototype.getApiUsage = function() {
        return {
            used: this.apiUsage.used,
            remaining: this.apiUsage.limit - this.apiUsage.used,
            limit: this.apiUsage.limit,
            date: this.apiUsage.date
        };
    };

    /**
     * 重置API使用统计
     */
    BaiduPoiSearch.prototype.resetApiUsage = function() {
        var today = new Date().toISOString().split('T')[0];
        this.apiUsage = {
            date: today,
            used: 0,
            limit: this.options.dailyLimit
        };
        this.saveApiUsage();
        this.updateApiUsageUI();
    };

    /**
     * 设置每日限制
     * @param {Number} limit - 限制次数
     */
    BaiduPoiSearch.prototype.setDailyLimit = function(limit) {
        if (typeof limit === 'number' && limit > 0) {
            this.options.dailyLimit = limit;
            this.apiUsage.limit = limit;
            this.saveApiUsage();
            this.updateApiUsageUI();
        }
    };

    /**
     * 获取所有分类
     * @returns {Object} 分类配置
     */
    BaiduPoiSearch.prototype.getCategories = function() {
        return this.cache.categories;
    };

    /**
     * 获取单个分类
     * @param {String} key - 分类键
     * @returns {Object|null} 分类配置
     */
    BaiduPoiSearch.prototype.getCategory = function(key) {
        return this.cache.categories[key] || null;
    };

    /**
     * 获取搜索结果
     * @param {String} categoryKey - 分类键（可选）
     * @returns {Object|null} 搜索结果
     */
    BaiduPoiSearch.prototype.getResults = function(categoryKey) {
        if (!this.cache.results) {
            return null;
        }
        
        if (categoryKey) {
            return this.cache.results.results[categoryKey] || null;
        }
        
        return this.cache.results;
    };

    /**
     * 获取搜索统计
     * @returns {Object|null} 统计信息
     */
    BaiduPoiSearch.prototype.getSearchStats = function() {
        if (!this.cache.results) {
            return null;
        }
        
        return this.cache.results.stats;
    };

    /**
     * 事件注册
     * @param {String} event - 事件名
     * @param {Function} callback - 回调函数
     * @returns {Object} this
     */
    BaiduPoiSearch.prototype.on = function(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return this;
    };

    /**
     * 事件移除
     * @param {String} event - 事件名
     * @param {Function} callback - 回调函数（可选）
     * @returns {Object} this
     */
    BaiduPoiSearch.prototype.off = function(event, callback) {
        if (!this.events[event]) {
            return this;
        }
        
        if (!callback) {
            this.events[event] = [];
        } else {
            this.events[event] = this.events[event].filter(function(cb) {
                return cb !== callback;
            });
        }
        
        return this;
    };

    /**
     * 自定义事件触发
     * @param {String} event - 事件名
     * @param {*} data - 事件数据
     * @returns {Object} this
     */
    BaiduPoiSearch.prototype.triggerX = function(event, data) {
        // this.events 压根不存在，不能直接调用！
        // if (!this.events[event]) {
        //     console.log('bbb');
        //     return this;
        // }
        // 支持onXXX回调函数
        if (typeof this.options[event] === 'function') {
            this.options[event].call(this, data);
        }
        
        // 触发事件监听器
        // for (var i = 0; i < this.events[event].length; i++) {
        //     this.events[event][i].call(this, data);
        // }

        // 触发配置项的回调函数
        if (this.options[event]) {
            this.options[event](data);
        }
        
        return this;
    };


    /**
     * 获取地图实例（预留接口）
     * @returns {Object|null} 地图实例
     */
    BaiduPoiSearch.prototype.getMap = function() {
        return this.mapRenderer;
    };

    /**
     * 初始化地图、百度地图初始化
     */
    BaiduPoiSearch.prototype.initMap = function() {
        var self = this;
        var config = this.options.draft;
        
        // 如果未启用地图，直接返回
        if (!config.enabled) {
            console.log('地图功能未启用');
            return;
        }
        
        var containerId = this.options.draft.id;
        var container = document.getElementById(containerId);
        
        if (!container) {
            var tip = '地图容器不存在:' + containerId;
            console.error(tip);
            alert(tip);
            return;
        }
        
        // 创建地图渲染实例
        this.mapRenderer = new BMap.Map(containerId);
        
        // 设置缩放级别
        var zoom = config.zoom || 14;
        
        // 默认显示位置（使用默认城市）
        var defaultCity = this.options.defaultCity;
        var defaultCoordinate = this.options.defaultCoordinate;

        var coordArr = defaultCoordinate.split(',');
        var mmLng = coordArr.length > 0 ? coordArr[0] : '', 
            mmLat = coordArr.length > 1 ? coordArr[1] : '';
        var cityCenter = new BMap.Point(mmLng, mmLat); // 泉州默认坐标
        
        // 初始化地图中心点
        this.mapRenderer.centerAndZoom(cityCenter, zoom);
        // this.mapRenderer.centerAndZoom(defaultCity, zoom); // 这个要使用到检索服务

        // 创建地图中心点标注
        // if(coordArr.length > 1) {
        //     var mmMarker = new BMap.Marker(cityCenter);
        //     this.mapRenderer.addOverlay(mmMarker);
        // }
        
        // 设置鼠标滚轮缩放
        if (config.enableWheelZoom) {
            this.mapRenderer.enableScrollWheelZoom();
        } else {
            this.mapRenderer.disableScrollWheelZoom();
        }
        
        // 添加地图类型控件
        this.mapRenderer.addControl(new BMap.MapTypeControl());
        
        // 添加缩放控件
        this.mapRenderer.addControl(new BMap.NavigationControl());
        
        // console.log('地图初始化完成');
        
        // 触发地图初始化完成事件
        this.triggerX('onMapInit', this.mapRenderer);
    };

    /**
     * 在地图上添加标注
     * @param {Object} center - 中心点坐标
     */
    BaiduPoiSearch.prototype.addMarkersToMap = function(center) {
        var self = this;
        var config = this.options.draft;
        
        // 如果未启用地图或地图未初始化，直接返回
        if (!config.enabled || !this.mapRenderer) {
            return;
        }
        
        // 保存中心点
        this.currentCenter = center;
        
        // 清除旧标注
        this.clearMarkers();
        
        // 获取搜索结果
        var results = this.cache.results;
        if (!results || !results.results) {
            return;
        }
        
        // 获取配置参数
        var maxPerCategory = config.maxPointsPerCategory || 5;
        var maxTotal = config.maxTotalPoints || 15;
        
        // 第一阶段：每个分类取前N个
        var filteredByCategory = {};
        var categoryKeys = Object.keys(results.results);
        
        for (var i = 0; i < categoryKeys.length; i++) {
            var key = categoryKeys[i];
            var pois = results.results[key] || [];
            // 每个分类取前maxPerCategory个（已按距离排序）
            filteredByCategory[key] = pois.slice(0, maxPerCategory);
        }
        
        // 第二阶段：所有分类合并，取前maxTotal个
        var allPois = [];
        for (var j = 0; j < categoryKeys.length; j++) {
            var catKey = categoryKeys[j];
            var catPois = filteredByCategory[catKey];
            for (var k = 0; k < catPois.length; k++) {
                allPois.push(catPois[k]);
            }
        }
        
        // 按距离排序（已排好，只需取前maxTotal个）
        allPois.sort(function(a, b) {
            return a.distance - b.distance;
        });
        
        // 取前maxTotal个
        var finalPois = allPois.slice(0, maxTotal);
        
        // 如果没有标注点，直接返回
        if (finalPois.length === 0) {
            console.log('没有可显示的标注点');
            return;
        }
        
        // 添加标注点
        var points = [];
        for (var m = 0; m < finalPois.length; m++) {
            var poi = finalPois[m];
            var point = new BMap.Point(poi.location.lng, poi.location.lat);
            points.push(point);
            
            // 获取分类颜色
            var categoryColor = this.getCategoryColor(poi.category);
            
            // 创建标注
            var marker = new BMap.Marker(point);
            
            // 处理名称（公交站保留"站"后缀）
            var displayName = this.formatPoiName(poi);
            
            // 创建标签，使用分类颜色，Label在标注点上方，白色背景+彩色边框
            var label = new BMap.Label(displayName, {
                offset: new BMap.Size(-25, -35)  // 调整到标注点上方
            });
            label.setStyle({
                border: '2px solid ' + categoryColor,
                borderRadius: '6px',
                padding: '3px 8px',
                backgroundColor: 'white',
                fontSize: '12px',
                color: categoryColor,
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap'
            });
            
            marker.setLabel(label);
            
            // 保存POI数据到marker，用于点击事件
            marker.poiData = poi;
            
            // 点击标注显示详情
            marker.addEventListener('click', (function(p) {
                return function() {
                    self.showPoiInfoWindow(p);
                };
            })(poi));
            
            // 添加到地图
            this.mapRenderer.addOverlay(marker);
            
            // 保存标注引用
            this.markers.push(marker);
        }
        
        // console.log('已添加 ' + finalPois.length + ' 个标注点');
        
        // 自动调整视野
        if (config.autoViewPort && points.length > 0) {
            this.fitViewPort(points);
        }
    };

    /**
     * 获取分类对应的颜色（随机颜色，同分类固定）
     * @param {String} categoryKey - 分类键
     * @returns {String} 颜色值
     */
    BaiduPoiSearch.prototype.getCategoryColor = function(categoryKey) {
        // 如果已有缓存的颜色，直接返回
        if (this.cache.categoryColors[categoryKey]) {
            return this.cache.categoryColors[categoryKey];
        }
        
        // 生成随机颜色
        var h = Math.floor(Math.random() * 360);
        var s = 65 + Math.floor(Math.random() * 25); // 65-90%
        var l = 45 + Math.floor(Math.random() * 15); // 45-60%
        
        var color = 'hsl(' + h + ',' + s + '%,' + l + '%)';
        
        // 缓存颜色
        this.cache.categoryColors[categoryKey] = color;
        
        return color;
    };

    /**
     * 格式化POI名称（用于标注显示）
     * @param {Object} poi - POI对象
     * @returns {String} 格式化后的名称
     */
    BaiduPoiSearch.prototype.formatPoiName = function(poi) {
        var name = poi.name || '';
        
        // 公交站：确保显示"站"后缀
        if (poi.category === 'bus' || poi.category === 'subway') {
            // 如果名称不以"站"结尾，加上"站"字
            if (!name.endsWith('站')) {
                name = name + '站';
            }
        }
        
        return name;
    };

    /**
     * 清除所有标注
     */
    BaiduPoiSearch.prototype.clearMarkers = function() {
        if (!this.mapRenderer) {
            return;
        }
        
        for (var i = 0; i < this.markers.length; i++) {
            this.mapRenderer.removeOverlay(this.markers[i]);
        }
        this.markers = [];
    };

    /**
     * 自动调整视野
     * @param {Array} points - 标注点数组
     */
    BaiduPoiSearch.prototype.fitViewPort = function(points) {
        if (!this.mapRenderer || points.length === 0) {
            return;
        }
        
        // 如果只有一个点，设置固定视野
        if (points.length === 1) {
            this.mapRenderer.centerAndZoom(points[0], this.options.draft.zoom || 14);
            return;
        }
        
        // 使用setViewport自动调整视野
        this.mapRenderer.setViewport(points, {
            margins: [50, 50, 50, 50]
        });
    };

    /**
     * 高亮指定标注点
     * @param {Object} poi - POI数据
     */
    BaiduPoiSearch.prototype.highlightMarker = function(poi) {
        var self = this;
        var config = this.options.draft;
        var highlightColor = config.highlightColor || '#E60000';
        
        // 取消其他标注的高亮
        this.unhighlightAllMarkers();
        
        // 查找对应的标注
        for (var i = 0; i < this.markers.length; i++) {
            var marker = this.markers[i];
            if (marker.poiData && marker.poiData.id === poi.id) {
                // 找到目标标注
                var point = new BMap.Point(poi.location.lng, poi.location.lat);
                
                // 移动地图中心到该点
                this.mapRenderer.panTo(point);
                
                // 高亮Label样式（白色背景，彩色边框）
                var label = marker.getLabel();
                if (label) {
                    label.setStyle({
                        border: '3px solid ' + highlightColor,
                        borderRadius: '6px',
                        padding: '4px 10px',
                        backgroundColor: 'white',
                        fontSize: '13px',
                        color: highlightColor,
                        fontWeight: 'bold',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                        whiteSpace: 'nowrap',
                        transform: 'scale(1.1)'
                    });
                }
                
                // 打开信息窗口
                this.showPoiInfoWindow(poi);
                
                // 触发点击事件
                this.triggerX('onResultClick', poi);
                
                return true;
            }
        }
        
        // 如果没找到，返回false
        return false;
    };

    /**
     * 取消所有标注的高亮
     */
    BaiduPoiSearch.prototype.unhighlightAllMarkers = function() {
        for (var i = 0; i < this.markers.length; i++) {
            var marker = this.markers[i];
            var poi = marker.poiData;
            
            if (poi) {
                // 恢复原始分类颜色
                var originalColor = this.getCategoryColor(poi.category);
                var label = marker.getLabel();
                
                if (label) {
                    label.setStyle({
                        border: '2px solid ' + originalColor,
                        borderRadius: '6px',
                        padding: '3px 8px',
                        backgroundColor: 'white',
                        fontSize: '12px',
                        color: originalColor,
                        fontWeight: 'bold',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        whiteSpace: 'nowrap',
                        transform: 'scale(1)'
                    });
                }
            }
        }
    };

    /**
     * 显示POI信息窗口
     * @param {Object} poi - POI数据
     */
    BaiduPoiSearch.prototype.showPoiInfoWindow = function(poi) {
        if (!this.mapRenderer) {
            return;
        }
        
        var point = new BMap.Point(poi.location.lng, poi.location.lat);
        var infoWindow = new BMap.InfoWindow(
            '<div style="padding: 10px;">' +
            '<h4 style="margin: 0 0 8px 0;">' + poi.name + '</h4>' +
            '<p style="margin: 4px 0; color: #666;">分类: ' + poi.categoryName + '</p>' +
            '<p style="margin: 4px 0; color: #666;">地址: ' + (poi.address || '暂无') + '</p>' +
            '<p style="margin: 4px 0; color: #999;">距离: ' + poi.distance + '米</p>' +
            '</div>',
            {
                width: 250,
                height: 0,
                enableAutoPan: true,
                enableCloseOnClick: true
            }
        );
        
        this.mapRenderer.openInfoWindow(infoWindow, point);
        
        // 触发点击事件
        this.triggerX('onResultClick', poi);
    };

    /**
     * 对象扩展
     * @param {Object} target - 目标对象
     * @returns {Object} 扩展后的对象
     */
    BaiduPoiSearch.prototype.extend = function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    };

    /**
     * 数组去重
     * @param {Array} arr - 数组
     * @returns {Array} 去重后的数组
     */
    BaiduPoiSearch.prototype.unique = function(arr) {
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            if (result.indexOf(arr[i]) === -1) {
                result.push(arr[i]);
            }
        }
        return result;
    };

    /**
     * 销毁插件
     */
    BaiduPoiSearch.prototype.destroy = function() {
        this.cache = null;
        this.state = null;
        this.events = null;
        this.mapRenderer = null;
        
        var container = document.getElementById(this.options.searchPanel.id);
        if (container) {
            container.innerHTML = '';
        }
    };

    // 暴露到全局
    window.BaiduPoiSearch = BaiduPoiSearch;

})(window);
