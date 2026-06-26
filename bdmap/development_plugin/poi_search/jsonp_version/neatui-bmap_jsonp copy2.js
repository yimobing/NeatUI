/*
 * 百度地图周边配套检索工具 - 主JavaScript文件
 * 版本：v1.1.2
 * 功能：使用百度地图API v2.0实现周边配套检索，完全过滤附属设施，添加默认值
 */

// 配置百度地图API密钥（请在此处填入你的AK）
const BAIDU_MAP_AK = 'KmYpNYDatEVqdNvwvDXsbbOvQhTvPg9X';

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
async function searchLocation(address) {
    const url = `http://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(address)}&region=泉州市&output=json&ak=${BAIDU_MAP_AK}&page_size=1`;
    console.log('搜索地点URL:', url);
    const data = await jsonp(url, 10000);
    console.log('搜索地点返回:', data);
    return data;
}

// 周边检索API v2.0
async function searchNearby(location, keyword, radius) {
    const url = `http://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(keyword)}&location=${location}&radius=${radius}&output=json&ak=${BAIDU_MAP_AK}&page_size=20&page_num=0`;
    console.log('周边检索URL:', url);
    const data = await jsonp(url, 10000);
    console.log('周边检索返回:', data);
    return data;
}

// 距离计算 - 使用 Haversine 公式计算两点之间的直线距离（米）
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（千米）
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // 距离（千米）
    return distance * 1000; // 转换为米
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

// 判断POI是否为附属设施（用于排序）
function isSubFacility(poi) {
    const name = poi.name;
    const subFacilityKeywords = [
        '停车场', '北门', '南门', '东门', '西门', '后门', '正门', '侧门',
        '入口', '出口', '东2门', '西2门', '南2门', '北2门',
        '便利店', '超市', '书店', '食堂', '商店', '小卖部'
    ];
    return subFacilityKeywords.some(keyword => name.includes(keyword));
}

// 智能过滤POI
function filterPois(pois, keyword, radius) {
    return pois.filter(poi => {
        const name = poi.name;

        // 1. 距离过滤
        if (poi.distance && poi.distance > radius) {
            return false;
        }

        // 2. 根据关键词过滤
        if (keyword.includes('医院')) {
            // 医院过滤规则
            const exclude = ['卫生院', '诊所', '门诊', '口腔', '牙科',
                           '美容', '整形', '康复', '体检', '药房',
                           '检验', '影像', '血透'];
            if (exclude.some(ex => name.includes(ex))) {
                return false;
            }
            // 排除"医院-科室"格式（如"XX医院-神经科"）
            if (name.includes('医院') && name.includes('-') && !name.includes('-东') && !name.includes('-西') && !name.includes('-南') && !name.includes('-北')) {
                return false;
            }
        } else if (keyword.includes('学校')) {
            // 学校过滤规则 - 完全排除附属设施（包括门）
            const exclude = ['书店', '食堂', '商店', '小卖部', '停车场',
                           '东门', '西门', '南门', '北门', '后门', '正门', '侧门',
                           '入口', '出口', '东2门', '西2门', '南2门', '北2门'];
            if (exclude.some(ex => name.includes(ex))) {
                return false;
            }
            // 排除"学校-附属"格式（如"XX小学-书店"），但保留方向信息
            if (name.includes('学校') && name.includes('-') && !name.includes('-东') && !name.includes('-西') && !name.includes('-南') && !name.includes('-北')) {
                return false;
            }
        } else if (keyword.includes('银行')) {
            // 银行过滤规则
            const exclude = ['ATM', '自助', '24小时', '取款'];
            if (exclude.some(ex => name.includes(ex))) {
                return false;
            }
        }

        return true;
    });
}

// 生成结构化报告
function generateReport(communityName, location, pois, keyword, radius) {
    // 先计算距离
    const poisWithDistance = pois
        .filter(poi => poi.location)
        .map(poi => ({
            ...poi,
            distance: calculateDistance(
                location.lat,
                location.lng,
                poi.location.lat,
                poi.location.lng
            )
        }));

    // 智能过滤
    const filteredPois = filterPois(poisWithDistance, keyword, radius);

    // 排序：优先显示非附属设施
    const sortedPois = filteredPois.sort((a, b) => {
        // 如果一个是附属设施，一个不是，非附属设施优先
        const aIsSub = isSubFacility(a);
        const bIsSub = isSubFacility(b);
        if (aIsSub && !bIsSub) return 1;
        if (!aIsSub && bIsSub) return -1;
        // 如果都是或都不是，按距离排序
        return a.distance - b.distance;
    }).slice(0, 10); // 取前10个

    let report = `【${communityName} - 周边配套情况报告】\n\n`;
    report += `1、外部配套设施状况\n`;
    report += `   (1) 公共服务设施：\n`;

    if (sortedPois.length > 0) {
        sortedPois.forEach((poi, index) => {
            report += `   距离${poi.name}约${Math.round(poi.distance)}米`;
            if (index < sortedPois.length - 1) {
                report += '、';
            }
        });
        report += `，${keyword}配套较${sortedPois.length >= 3 ? '完善' : sortedPois.length >= 1 ? '一般' : '缺乏'}。\n`;
    } else {
        report += `   ${radius}米范围内未发现${keyword}相关设施。\n`;
    }

    report += `\n2、位置分析\n`;
    report += `   (1) 小区位置：${communityName}\n`;
    report += `   (2) 搜索范围：${radius}米\n`;
    report += `   (3) 搜索关键词：${keyword}\n`;
    report += `   (4) 搜索结果：共找到${filteredPois.length}个${keyword}相关设施\n`;

    report += `\n3、详细设施列表（按距离排序）\n`;
    if (sortedPois.length > 0) {
        sortedPois.forEach((poi, index) => {
            report += `   ${index + 1}. ${poi.name}\n`;
            report += `      - 距离：约${Math.round(poi.distance)}米\n`;
            report += `      - 地址：${poi.address || '暂无地址'}\n`;
            if (poi.area) {
                report += `      - 区域：${poi.area}\n`;
            }
            report += `      - 经纬度：(${poi.location.lat}, ${poi.location.lng})\n`;
        });
    } else {
        report += `   未找到相关设施。\n`;
    }

    return { report: report, sortedPois: sortedPois };
}

// 显示错误信息
function showError(message) {
    $('#errorMessage').text(message).fadeIn();
}

// 渲染POI列表
function renderPoiList(pois) {
    let html = '';
    if (pois.length > 0) {
        pois.forEach((poi, index) => {
            const isSub = isSubFacility(poi);
            const subBadge = isSub ? '<span class="poi-badge">附属设施</span>' : '';
            html += `
                <div class="poi-item ${isSub ? 'poi-item-sub' : ''}">
                    <div class="poi-name">
                        ${index + 1}. ${poi.name}
                        <span class="poi-distance">${Math.round(poi.distance)}米</span>
                        ${subBadge}
                    </div>
                    <div class="poi-info">
                        <strong>地址：</strong>${poi.address || '暂无地址'}<br>
                        ${poi.area ? `<strong>区域：</strong>${poi.area}<br>` : ''}
                        <strong>经纬度：</strong>(${poi.location.lat}, ${poi.location.lng})
                    </div>
                </div>
            `;
        });
    } else {
        html = '<div class="alert alert-info">未找到符合条件的设施</div>';
    }
    $('#poiList').html(html);
}

// 复制报告
function copyReport() {
    const reportText = $('#reportText').val();
    navigator.clipboard.writeText(reportText).then(() => {
        alert('报告已复制到剪贴板！');
    }).catch(() => {
        alert('复制失败，请手动复制');
    });
}

// 下载报告
function downloadReport() {
    const reportText = $('#reportText').val();
    const communityName = $('#communityName').val();
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${communityName}_配套报告.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// 页面加载完成后绑定事件
$(document).ready(function() {
    // 搜索按钮点击事件
    $('#searchBtn').click(async function() {
        const communityName = $('#communityName').val().trim();
        const keyword = $('#keyword').val().trim();
        const radius = parseInt($('#radius').val()) || 500;

        // 验证输入
        if (!communityName || !keyword) {
            showError('请输入小区名称和关键词');
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
            console.log('小区:', communityName, '关键词:', keyword, '半径:', radius);

            // 步骤1：搜索地点（使用Place API）
            console.log('步骤1：搜索地点');
            const locationData = await searchLocation(communityName);

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

            const location = locationData.results[0].location;
            const locationStr = `${location.lat},${location.lng}`;
            console.log('小区位置:', location);

            // 步骤2：周边检索
            console.log('步骤2：周边检索');
            const nearbyData = await searchNearby(locationStr, keyword, radius);

            if (nearbyData.status !== 0) {
                showError('周边检索失败：' + (nearbyData.message || '未知错误'));
                console.error('周边检索错误:', nearbyData);
                return;
            }

            const pois = nearbyData.results || [];
            console.log('找到POI数量:', pois.length);

            // 步骤3：生成报告
            const { report, sortedPois } = generateReport(communityName, location, pois, keyword, radius);

            // 显示结果
            $('#resultInfo').text(`${communityName} 周边 ${radius}米内的 ${keyword}`);
            $('#resultCount').text(`共找到 ${sortedPois.length} 个`);
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
        $('#communityName').val('泉州浦西万达广场');
        $('#keyword').val('学校');
        $('#radius').val('1000');
        $('#errorMessage').hide();
        $('#resultCard').hide();
    });

    // Tab切换
    $('.tab').click(function() {
        $('.tab').removeClass('active');
        $(this).addClass('active');

        const tabName = $(this).data('tab');
        $('.tab-content').removeClass('active');
        $(`#${tabName}Tab`).addClass('active');
    });
});
