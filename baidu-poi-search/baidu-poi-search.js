/**
 * BaiduPoiSearch - 百度地图POI搜索插件
 * 版本：v3.1.2
 * 作者：Vibe Coding Agent
 * 功能：多分类POI搜索、智能过滤、API使用统计、双布局支持
 * 兼容：IE11+（ES5语法）
 */

 (function(window) {
    'use strict';

    // 插件版本号
    var VERSION = 'v3.1.2';

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
            poiCache: {}  // POI缓存，避免重复搜索
        };
        
        // 状态管理
        this.state = {
            selectedCategories: [],  // 已选分类
            selectedSubcategories: {},  // 已选子分类 {categoryKey: subcategoryValue}
            isSearching: false,      // 是否正在搜索
            currentLayout: 'split',  // 当前布局模式
            multiSelectMode: false,  // 多选模式
            callbackCounter: 0       // JSONP回调函数计数器
        };
        
        // API使用统计
        this.apiUsage = this.loadApiUsage();
        
        // 事件注册表
        this.events = {};
        
        // 地图实例（预留）
        this.mapInstance = null;
    }

    /**
     * 默认配置选项
     */
    BaiduPoiSearch.prototype.defaults = {
        // === 百度地图配置 ===
        apiKey: '',              // 百度地图API密钥
        dailyLimit: 100,         // 每日API调用限制次数
        defaultCity: '泉州市',   // 默认城市
        
        // === 布局配置 ===
        layoutMode: 'split',     // 'split'（左右）或 'fullscreen'（全屏）
        
        splitLayout: {
            mapWidth: '70%',      // 地图容器宽度
            searchWidth: '30%',   // 搜索面板宽度
            mapPosition: 'left',  // 地图位置：'left' 或 'right'
            resizable: true,      // 是否可拖动调整宽度
            minWidth: 300,        // 搜索面板最小宽度
            maxWidth: 600         // 搜索面板最大宽度
        },
        
        fullscreenLayout: {
            searchPosition: 'top-right',  // 搜索面板位置
            searchWidth: 400,             // 搜索面板宽度
            maxHeight: 600,               // 搜索面板最大高度
            draggable: true,              // 是否可拖动位置
            collapsible: true,            // 是否可折叠
            collapsed: false,             // 默认是否折叠
            autoCollapse: false           // 地图操作时自动折叠
        },
        
        searchPanel: {
            id: 'poi-search-panel',
            className: 'poi-search-panel'
        },
        
        mapContainer: {
            id: 'baidu-map-container',
            className: 'baidu-map-container',
            autoResize: true
        },
        
        // === 多选配置 ===
        enableMultiSelect: true,      // 启用多选模式
        selectionLimit: 5,            // 单次选择数量限制
        selectionLimitWarning: 3,     // 显示警告的选择数量阈值
        
        // === API使用配置 ===
        showApiUsage: true,           // 显示API使用情况
        apiUsageStorageKey: 'baidu_poi_api_usage',  // localStorage键名
        
        // === 搜索配置 ===
        defaultRadius: 1000,          // 默认搜索半径（米）
        
        // === 回调函数 ===
        onInit: null,                 // 初始化完成
        onLayoutChange: null,         // 布局切换
        onMapInit: null,              // 地图初始化
        onSearchStart: null,          // 搜索开始
        onSearchProgress: null,       // 搜索进度
        onSearchComplete: null,       // 搜索完成
        onResultClick: null,          // 点击结果
        onError: null                 // 错误处理
    };

    /**
     * POI分类配置数据（25个完整分类）
     */
    BaiduPoiSearch.prototype.getPOICategories = function() {
        return {
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
                matchKeywords: ['银行', '信用社', '农商行', '邮储'],
                excludeKeywords: ['ATM', '自助', '24小时', '取款',
                                 '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '国有银行', value: '国有银行' },
                    { name: '商业银行', value: '商业银行' },
                    { name: '信用社', value: '信用社' }
                ]
            },
            'market': {
                name: '超市',
                icon: '🏪',
                typeKeyword: '购物',
                matchKeywords: ['超市', '商场', '百货', '购物中心'],
                excludeKeywords: ['便利店', '水果店', '菜店',
                                 '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '大型超市', value: '大型超市' },
                    { name: '便利店', value: '便利店' },
                    { name: '购物中心', value: '购物中心' }
                ]
            },
            'restaurant': {
                name: '餐饮',
                icon: '🍽️',
                typeKeyword: '餐饮',
                matchKeywords: ['餐厅', '饭店', '美食', '小吃', '快餐', '火锅'],
                excludeKeywords: ['咖啡', '奶茶', '饮品',
                                 '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '中餐', value: '中餐' },
                    { name: '西餐', value: '西餐' },
                    { name: '快餐', value: '快餐' }
                ]
            },
            'gas_station': {
                name: '加油站',
                icon: '⛽',
                typeKeyword: '交通',
                matchKeywords: ['加油站', '加气站', '充电站'],
                excludeKeywords: ['便利店', '洗车',
                                 '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '中石油', value: '中石油' },
                    { name: '中石化', value: '中石化' }
                ]
            },
            'park': {
                name: '公园',
                icon: '🌳',
                typeKeyword: '休闲娱乐',
                matchKeywords: ['公园', '广场', '绿地'],
                excludeKeywords: ['游乐场', '动物园', '植物园',
                                 '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '城市公园', value: '城市公园' },
                    { name: '社区公园', value: '社区公园' }
                ]
            },
            'express': {
                name: '快递',
                icon: '📦',
                typeKeyword: '物流',
                matchKeywords: ['快递', '物流', '驿站'],
                excludeKeywords: ['便利店',
                                 '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '快递网点', value: '快递网点' },
                    { name: '物流中心', value: '物流中心' }
                ]
            },

            // ==================== 更多分类（17个）====================
            'government': {
                name: '政府',
                icon: '🏛️',
                typeKeyword: '政府机构',
                matchKeywords: ['政府', '行政', '办事处', '服务中心'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '政府机关', value: '政府机关' },
                    { name: '服务中心', value: '服务中心' }
                ]
            },
            'community': {
                name: '小区',
                icon: '🏘️',
                typeKeyword: '住宅',
                matchKeywords: ['小区', '公寓', '住宅区'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '商品房', value: '商品房' },
                    { name: '保障房', value: '保障房' }
                ]
            },
            'bus': {
                name: '公交',
                icon: '🚌',
                typeKeyword: '交通设施',
                matchKeywords: ['公交', '公交站', '公交枢纽'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '公交站', value: '公交站' },
                    { name: '公交枢纽', value: '公交枢纽' }
                ]
            },
            'subway': {
                name: '地铁',
                icon: '🚇',
                typeKeyword: '交通设施',
                matchKeywords: ['地铁', '地铁站', '轻轨'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '地铁站', value: '地铁站' }
                ]
            },
            'parking': {
                name: '停车场',
                icon: '🅿️',
                typeKeyword: '交通设施',
                matchKeywords: ['停车场', '停车库', '车位'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '地面停车场', value: '地面停车场' },
                    { name: '地下车库', value: '地下车库' }
                ]
            },
            'shopping_mall': {
                name: '商场',
                icon: '🏬',
                typeKeyword: '购物',
                matchKeywords: ['商场', '购物中心', '百货大楼'],
                excludeKeywords: ['便利店',
                                 '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
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
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '星级酒店', value: '星级酒店' },
                    { name: '快捷酒店', value: '快捷酒店' }
                ]
            },
            'market_farm': {
                name: '市场',
                icon: '🥬',
                typeKeyword: '购物',
                matchKeywords: ['菜市场', '农贸市场', '海鲜市场'],
                excludeKeywords: ['便利店', '超市',
                                 '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '菜市场', value: '菜市场' },
                    { name: '农贸市场', value: '农贸市场' }
                ]
            },
            'culture': {
                name: '文体',
                icon: '🎭',
                typeKeyword: '休闲娱乐',
                matchKeywords: ['图书馆', '文化馆', '体育馆', '体育场'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' },
                    { name: '图书馆', value: '图书馆' },
                    { name: '体育馆', value: '体育馆' }
                ]
            },
            'cemetery': {
                name: '陵园',
                icon: '⛪',
                typeKeyword: '殡葬服务',
                matchKeywords: ['陵园', '公墓', '墓地'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' }
                ]
            },
            'garbage_station': {
                name: '垃圾站',
                icon: '🗑️',
                typeKeyword: '公共服务',
                matchKeywords: ['垃圾站', '垃圾转运站'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
                subcategories: [
                    { name: '全部', value: '' }
                ]
            },
            'substation': {
                name: '变电站',
                icon: '⚡',
                typeKeyword: '基础设施',
                matchKeywords: ['变电站', '变电所'],
                excludeKeywords: ['东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                                 '入口', '出口'],
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
            console.log('百度地图API初始化完成，BMap 对象已创建');
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

            // 绑定事件
            self.bindEvents();

            // 更新API使用情况显示
            self.updateApiUsageUI();

            // 应用初始布局
            self.setLayoutMode(self.options.layoutMode);

            // 触发初始化完成事件
            self.trigger('onInit', self);

            console.log('BaiduPoiSearch 插件初始化完成');
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
            '<button id="btn-split-layout" class="active" data-layout="split">左右布局</button>' +
            '<button id="btn-fullscreen-layout" data-layout="fullscreen">全屏布局</button>' +
            '</div>' +
            '</div>';
        
        // API使用情况
        if (this.options.showApiUsage) {
            html += '<div class="api-usage">' +
                '<div class="api-stats">' +
                '<span>已用：<strong id="api-used">0</strong>次</span>' +
                '<span>剩余：<strong id="api-remaining">100</strong>次</span>' +
                '<span>限制：<strong id="api-limit">100</strong>次</span>' +
                '</div>' +
                '<span class="api-version">插件版本：' + VERSION + '</span>' +
                '</div>';
        }
        
        // 搜索表单
        html += '<div class="search-form">' +
            '<div class="form-group">' +
            '<label for="city">🏙️ 城市</label>' +
            '<input type="text" id="city" value="' + this.options.defaultCity + '" placeholder="例如：北京市">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="location">📍 位置名称</label>' +
            '<input type="text" id="location" value="泉州浦西万达广场" placeholder="例如：泉州浦西万达广场">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="keyword">🔍 关键词</label>' +
            '<input type="text" id="keyword" value="学校" placeholder="例如：学校、医院、银行">' +
            '<button class="btn-filter" id="filterBtn" style="display: none;">筛选</button>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="radius">📏 搜索半径</label>' +
            '<div class="radius-input-wrapper">' +
            '<input type="number" id="radius" value="' + this.options.defaultRadius + '" min="100" max="10000">' +
            '<span class="radius-unit">米</span>' +
            '</div>' +
            '</div>' +
            '<div id="errorMessage" class="alert alert-error" style="display: none;"></div>' +
            '<div class="button-group">' +
            '<button class="btn btn-primary" id="searchBtn">开始搜索</button>' +
            '<button class="btn btn-secondary" id="clearBtn">清空</button>' +
            '</div>' +
            '</div>';
        
        // 单选/多选模式切换
        if (this.options.enableMultiSelect) {
            html += '<div class="multi-select-section">' +
                '<div class="select-mode-toggle">' +
                '<button class="mode-btn active" data-mode="single" id="btnSingleMode">🔘 单选</button>' +
                '<button class="mode-btn" data-mode="multiple" id="btnMultipleMode">☑️ 多选</button>' +
                '</div>' +
                '<span id="selectedCount" style="display: none;">已选 0 个</span>' +
                '</div>';
        }
        
        // 快速选择
        html += '<div class="quick-select-section">' +
            '<div class="quick-select-title">快速选择</div>';
        
        var categories = this.cache.categories;
        var categoryKeys = Object.keys(categories).slice(0, 8); // 前8个
        
        for (var i = 0; i < categoryKeys.length; i++) {
            var key = categoryKeys[i];
            var cat = categories[key];
            html += '<button class="quick-btn" data-category="' + key + '">' + cat.icon + ' ' + cat.name + '</button>';
        }
        
        html += '<button class="quick-btn-more" id="moreBtn">更多 ↓</button>' +
            '</div>';
        
        // 更多分类
        html += '<div class="quick-select-section" id="moreSection" style="display: none;">' +
            '<div class="quick-select-title">更多分类</div>';
        
        var moreCategoryKeys = Object.keys(categories).slice(8); // 剩余的
        for (var i = 0; i < moreCategoryKeys.length; i++) {
            var key = moreCategoryKeys[i];
            var cat = categories[key];
            html += '<button class="quick-btn" data-category="' + key + '">' + cat.icon + ' ' + cat.name + '</button>';
        }
        
        html += '</div>';
        
        // 已选分类标签区
        if (this.options.enableMultiSelect) {
            html += '<div class="selected-categories" id="selectedCategories" style="display: none;">' +
                '<div class="selected-title">已选分类：</div>' +
                '<div class="selected-tags" id="selectedTags"></div>' +
                '<button class="btn-clear-all" id="clearAllBtn">清空所有</button>' +
                '<button class="btn-filter-categories" id="filterCategoriesBtn" style="display: none;">筛选子分类</button>' +
                '</div>';
        }

        // 子分类筛选下拉框
        html += '<div class="filter-dropdown" id="filterDropdown" style="display: none;">' +
            '<div class="filter-header">' +
            '<span>📂 选择分类和子分类</span>' +
            '<button class="btn-close" id="closeFilter">×</button>' +
            '</div>' +
            '<div class="filter-body">' +
            '<div id="filterCategoriesContainer">' +
            '<p style="text-align: center; color: #999; padding: 20px;">请先选择分类</p>' +
            '</div>' +
            '</div>' +
            '<div class="filter-footer">' +
            '<button class="btn btn-secondary" id="cancelFilter">取消</button>' +
            '<button class="btn btn-primary" id="applyFilter">确定</button>' +
            '</div>' +
            '</div>';
        
        // 搜索结果
        html += '<div class="search-results" id="searchResults" style="display: none;">' +
            '<div class="results-header">' +
            '<h3>📊 搜索结果</h3>' +
            '<span id="resultsCount"></span>' +
            '</div>' +
            '<div class="tabs">' +
            '<button class="tab active" data-tab="report">📄 配套报告</button>' +
            '<button class="tab" data-tab="list">📋 详细列表</button>' +
            '</div>' +
            '<div class="tab-content active" id="reportTab">' +
            '<textarea class="report-textarea" id="reportText" readonly></textarea>' +
            '<div class="report-actions">' +
            '<button class="btn btn-secondary" id="copyReportBtn">📋 复制报告</button>' +
            '<button class="btn btn-secondary" id="downloadReportBtn">💾 下载文件</button>' +
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
        
        // 搜索按钮
        document.getElementById('searchBtn').addEventListener('click', function() {
            self.handleSearch();
        });
        
        // 清空按钮
        document.getElementById('clearBtn').addEventListener('click', function() {
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
        
        // 单选/多选模式切换
        if (this.options.enableMultiSelect) {
            var btnSingleMode = document.getElementById('btnSingleMode');
            var btnMultipleMode = document.getElementById('btnMultipleMode');

            if (btnSingleMode && btnMultipleMode) {
                btnSingleMode.addEventListener('click', function() {
                    self.setMultiSelectMode(false);
                });

                btnMultipleMode.addEventListener('click', function() {
                    self.setMultiSelectMode(true);
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
        
        // 复制报告
        var copyReportBtn = document.getElementById('copyReportBtn');
        if (copyReportBtn) {
            copyReportBtn.addEventListener('click', function() {
                self.copyReport();
            });
        }
        
        // 下载报告
        var downloadReportBtn = document.getElementById('downloadReportBtn');
        if (downloadReportBtn) {
            downloadReportBtn.addEventListener('click', function() {
                self.downloadReport();
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
            var keywords = keyword.split(/[,，、\s]+/);
            for (var i = 0; i < keywords.length; i++) {
                var kw = keywords[i].trim();
                if (kw) {
                    var catKey = this.findCategoryByKeyword(kw);
                    if (catKey) {
                        categories.push(catKey);
                    }
                }
            }
        }
        
        // 添加已选分类
        categories = categories.concat(this.state.selectedCategories);
        
        // 去重
        categories = this.unique(categories);
        
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
        this.trigger('onSearchStart', params);
        
        // 更新UI
        var searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.textContent = '搜索中...';
        }
        
        // 获取位置坐标
        this.getLocationCoordinate(params.city, params.location, function(center, error) {
            if (error) {
                self.state.isSearching = false;
                self.showError(error);
                self.trigger('onError', error);
                
                if (searchBtn) {
                    searchBtn.disabled = false;
                    searchBtn.textContent = '开始搜索';
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
        var geocoder = new BMap.Geocoder();

        // 使用完整的地址格式：城市 + 位置
        var fullAddress = city + location;

        geocoder.getPoint(fullAddress, function(point) {
            if (point) {
                console.log('位置坐标获取成功:', location, point);
                callback({
                    lat: point.lat,
                    lng: point.lng,
                    name: location,
                    address: ''
                });
            } else {
                callback(null, '无法找到该位置，请检查名称是否正确');
            }
        });
    };

    /**
     * 搜索多个分类
     * @param {Array} categories - 分类列表
     * @param {String} city - 城市
     * @param {Object} center - 中心点坐标
     * @param {Number} radius - 搜索半径
     */
    BaiduPoiSearch.prototype.searchMultipleCategories = function(categories, city, center, radius) {
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
                var searchBtn = document.getElementById('searchBtn');
                if (searchBtn) {
                    searchBtn.disabled = false;
                    searchBtn.textContent = '开始搜索';
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

                // 显示结果
                self.displayResults();

                // 触发搜索完成事件
                self.trigger('onSearchComplete', self.cache.results);

                if (hasError) {
                    self.showError('部分搜索失败，请查看控制台');
                }
                return;
            }

            var categoryKey = categories[searchIndex];
            searchIndex++;

            self.searchPoiByCategory(categoryKey, city, center, radius, function(pois, error) {
                if (error) {
                    console.error('搜索失败:', categoryKey, error);
                    hasError = true;
                } else {
                    results[categoryKey] = pois;
                }

                completed++;

                // 触发进度事件
                self.trigger('onSearchProgress', {
                    completed: completed,
                    total: total,
                    category: categoryKey
                });

                // 搜索下一个分类
                searchNext();
            });
        }

        // 开始搜索
        searchNext();
    };

    /**
     * 搜索单个分类的POI
     * @param {String} categoryKey - 分类键
     * @param {String} city - 城市
     * @param {Object} center - 中心点坐标
     * @param {Number} radius - 搜索半径
     * @param {Function} callback - 回调函数
     */
    BaiduPoiSearch.prototype.searchPoiByCategory = function(categoryKey, city, center, radius, callback) {
        var self = this;

        var category = this.cache.categories[categoryKey];
        if (!category) {
            callback(null, '分类不存在');
            return;
        }

        // 创建一个临时的 map 实例用于 LocalSearch
        var map = new BMap.Map("temp_map_" + categoryKey);

        // 使用百度地图SDK搜索
        var local = new BMap.LocalSearch(map, {
            onSearchComplete: function(results) {
                if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                    // 转换结果格式
                    var pois = [];
                    for (var i = 0; i < results.getCurrentNumPois(); i++) {
                        var poi = results.getPoi(i);

                        // 检查是否在排除列表中
                        var excluded = false;
                        for (var j = 0; j < category.excludeKeywords.length; j++) {
                            var keyword = category.excludeKeywords[j];
                            if (poi.title.indexOf(keyword) !== -1) {
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

                    // 按距离排序
                    pois.sort(function(a, b) {
                        return a.distance - b.distance;
                    });

                    callback(pois);
                } else {
                    callback(null, '搜索失败');
                }
            }
        });

        // 搜索周边，使用中心点坐标
        var centerPoint = new BMap.Point(center.lng, center.lat);
        local.searchNearby(category.name, centerPoint, radius);
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

    /**
     * 显示搜索结果
     */
    BaiduPoiSearch.prototype.displayResults = function() {
        if (!this.cache.results) {
            return;
        }
        
        var resultsDiv = document.getElementById('searchResults');
        resultsDiv.style.display = 'block';
        
        // 更新结果数量
        var stats = this.cache.results.stats;
        var resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = '共找到 ' + stats.total + ' 个设施';
        }
        
        // 生成报告
        this.generateReport();
        
        // 生成详细列表
        this.generatePoiList();
    };

    /**
     * 生成配套报告
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

    /**
     * 生成POI详细列表
     */
    BaiduPoiSearch.prototype.generatePoiList = function() {
        if (!this.cache.results) {
            return;
        }
        
        var results = this.cache.results.results;
        var categories = this.cache.categories;
        var poiList = document.getElementById('poiList');
        
        var html = '';
        
        for (var key in results) {
            if (results.hasOwnProperty(key) && results[key].length > 0) {
                var category = categories[key];
                var pois = results[key];
                
                html += '<div class="poi-category-group">' +
                    '<h4 class="category-title">' + category.icon + ' ' + category.name + '（' + pois.length + '个）</h4>';
                
                for (var i = 0; i < pois.length; i++) {
                    var poi = pois[i];
                    html += '<div class="poi-item" data-poi-id="' + poi.id + '">' +
                        '<div class="poi-name">' + poi.name + '</div>' +
                        '<div class="poi-info">' +
                        '<span class="poi-distance">距离：' + poi.distance + '米</span>' +
                        '<span class="poi-address">' + poi.address + '</span>' +
                        '</div>' +
                        '</div>';
                }
                
                html += '</div>';
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

    /**
     * 处理POI点击
     * @param {String} poiId - POI ID
     */
    BaiduPoiSearch.prototype.handlePoiClick = function(poiId) {
        var poi = this.findPoiById(poiId);
        if (poi) {
            // 触发点击事件
            this.trigger('onResultClick', poi);
        }
    };

    /**
     * 根据ID查找POI
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

    /**
     * 处理快速选择
     * @param {String} categoryKey - 分类键
     * @param {HTMLElement} btn - 按钮元素
     */
    /**
     * 处理快速选择
     * @param {String} categoryKey - 分类键
     * @param {HTMLElement} btn - 按钮元素
     */
    BaiduPoiSearch.prototype.handleQuickSelect = function(categoryKey, btn) {
        // 判断运行时状态，不是配置项
        if (!this.state.multiSelectMode) {
            // 单选模式
            this.state.selectedCategories = [categoryKey];

            // 清除其他按钮的高亮
            this.clearSelectedButtons();
            btn.classList.add('selected');

            // 更新关键词输入框
            this.updateKeywordInput();

            return;
        }

        // 多选模式
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

        // 更新关键词输入框（多选模式也更新）
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

        console.log('子分类筛选已应用:', this.state.selectedSubcategories);
    };

    /**
     * 更新已选分类UI
     */
    BaiduPoiSearch.prototype.updateSelectedCategoriesUI = function() {
        if (!this.options.enableMultiSelect) {
            return;
        }

        var selectedCount = document.getElementById('selectedCount');
        var selectedCategories = document.getElementById('selectedCategories');
        var selectedTags = document.getElementById('selectedTags');
        var filterCategoriesBtn = document.getElementById('filterCategoriesBtn');

        var count = this.state.selectedCategories.length;

        // 更新计数
        if (selectedCount) {
            if (count > 0 && this.state.multiSelectMode) {
                selectedCount.style.display = 'inline';
                selectedCount.textContent = '已选 ' + count + ' 个';
            } else {
                selectedCount.style.display = 'none';
            }
        }

        // 更新标签区
        if (selectedCategories && selectedTags) {
            if (count > 0 && this.state.multiSelectMode) {
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
        
        // 切换内容
        var reportTab = document.getElementById('reportTab');
        var listTab = document.getElementById('listTab');
        
        if (tabName === 'report') {
            reportTab.classList.add('active');
            listTab.classList.remove('active');
        } else {
            reportTab.classList.remove('active');
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

    /**
     * 复制报告
     */
    BaiduPoiSearch.prototype.copyReport = function() {
        var reportTextarea = document.getElementById('reportText');
        if (reportTextarea) {
            reportTextarea.select();
            try {
                document.execCommand('copy');
                alert('报告已复制到剪贴板');
            } catch (e) {
                alert('复制失败，请手动复制');
            }
        }
    };

    /**
     * 下载报告
     */
    BaiduPoiSearch.prototype.downloadReport = function() {
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
        this.trigger('onLayoutChange', mode);
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
     * 事件触发
     * @param {String} event - 事件名
     * @param {*} data - 事件数据
     * @returns {Object} this
     */
    BaiduPoiSearch.prototype.trigger = function(event, data) {
        if (!this.events[event]) {
            return this;
        }
        
        // 支持onXXX回调函数
        if (typeof this.options[event] === 'function') {
            this.options[event].call(this, data);
        }
        
        // 触发事件监听器
        for (var i = 0; i < this.events[event].length; i++) {
            this.events[event][i].call(this, data);
        }
        
        return this;
    };

    /**
     * 获取地图实例（预留接口）
     * @returns {Object|null} 地图实例
     */
    BaiduPoiSearch.prototype.getMap = function() {
        return this.mapInstance;
    };

    /**
     * 初始化地图（预留接口）
     */
    BaiduPoiSearch.prototype.initMap = function() {
        // 地图初始化逻辑将在后续实现
        console.log('地图初始化接口预留');
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
        this.mapInstance = null;
        
        var container = document.getElementById(this.options.searchPanel.id);
        if (container) {
            container.innerHTML = '';
        }
    };

    // 暴露到全局
    window.BaiduPoiSearch = BaiduPoiSearch;

})(window);
