<?php
// PHP5.3 解除JSON中文\u转义，全局可用函数（挪到最顶部！）
function json_unescape_unicode($str)
{
    return preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/', function ($matches) {
        return mb_convert_encoding(pack('H*', $matches[1]), 'UTF-8', 'UCS-2BE');
    }, $str);
}

// PHP5.3 兼容接口请求页面
$ak = '2COzFaICuIyVj7V3VetKfmdRVnX8BhVr'; // 百度地图api ak
$url = 'https://api.map.baidu.com/place/v2/search'; // 检索的地址
$output = 'json'; // 输出格式，默认json

$location = '24.887662,118.605089'; // 中心点坐标。注意这里的值： "纬度 lat, 经度 lng"
$query = ''; // 检索关键字
$radius = '1000'; // 圆形区域检索半径，单位为米
$region = '泉州市'; // 检索行政区划区域
$pagesize = '20'; // 每页返回记录数，默认10，最大值20

// v3 版本才有的参数
$region_limit = 'false';
$city_limit = 'false';
$coord_type = '3';

$jsonResult = ''; // 格式化JSON字符串（展示用）
$jsonData = array(); // 存放解码后的PHP数组（循环取值用）
$errorMsg = ''; // 错误信息，默认空

// 接收表单提交
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 获取输入参数，过滤特殊字符
    $ak = trim(isset($_POST['ak']) ? $_POST['ak'] : '');
    $url = trim(isset($_POST['url']) ? $_POST['url'] : '');
    $output = trim(isset($_POST['output']) ? $_POST['output'] : '');

    $location = trim(isset($_POST['location']) ? $_POST['location'] : '');
    $query = trim(isset($_POST['query']) ? $_POST['query'] : '');
    $radius = trim(isset($_POST['radius']) ? $_POST['radius'] : '');
    $region = trim(isset($_POST['region']) ? $_POST['region'] : '');
    $pagesize = trim(isset($_POST['pagesize']) ? $_POST['pagesize'] : '');

    $region_limit = trim(isset($_POST['region_limit']) ? $_POST['region_limit'] : '');
    $city_limit = trim(isset($_POST['city_limit']) ? $_POST['city_limit'] : '');
    $coord_type = trim(isset($_POST['coord_type']) ? $_POST['coord_type'] : '');

    // 简单校验
    if (empty($ak)) {
        $errorMsg = 'AK密钥不能为空';
    } elseif (empty($region)) {
        $errorMsg = '区域/城市不能为空';
    } elseif (!is_numeric($radius) || $radius <= 0) {
        $errorMsg = '半径必须为大于0的数字';
    } else {
        // 拼接接口地址（place v2 不要传url参数）
        $apiUrl = 'http://api.map.baidu.com/place/v2/search';
        $queryParam = array(
            'ak' => $ak,
            'output' => $output,
            'location' => $location,
            'query' => $query,
            'radius' => $radius,
            'region' => $region,
            'pagesize' => $pagesize,
            'region_limit' => $region_limit,
            'city_limit' => $city_limit,
            'coord_type' => $coord_type
        );
        $queryStr = http_build_query($queryParam);
        $fullUrl = $apiUrl . '?' . $queryStr;

        // PHP5.3 请求接口
        $opts = array(
            'http' => array(
                'timeout' => 10
            )
        );
        $context = stream_context_create($opts);
        $response = @file_get_contents($fullUrl, false, $context);

        if ($response === false) {
            $errorMsg = '接口请求失败，请检查网络、AK权限或接口地址';
        } else {
            // 解码为PHP数组，存入$jsonData（循环专用）
            $jsonData = json_decode($response, true);
            $tempJson = json_encode($jsonData, JSON_PRETTY_PRINT);
            $tempJsonCn = json_unescape_unicode($tempJson);
            $jsonResult = $tempJsonCn;
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title> 百度地图 web api 接口调试 - 前后端不分离版 + 有表单版 </title>
    <style>
        * {
            box-sizing: border-box;
            font-size: 14px;
        }
        .box {
            width: 90%;
            max-width: 900px;
            margin: 20px auto;
        }
        .form-item {
            margin: 10px 0;
        }
        label {
            display: inline-block;
            width: 150px;
        }
        input {
            padding: 6px;
            width: 300px;
        }
        button {
            padding: 8px 20px;
            background: #007bff;
            color: #fff;
            border: none;
            cursor: pointer;
        }
        .err {
            color: red;
            margin: 10px 0;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            white-space: pre-wrap;
            word-break: all;
            max-height: 600px;
            overflow: auto;
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>
    <div class="box">
        <h3>接口参数提交工具</h3>
        <form method="post" action="">
            <div class="form-item">
                <label>AK密钥 ：</label>
                <input type="text" name="ak" value="<?php echo htmlspecialchars($ak, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>请求地址 ：</label>
                <input type="text" name="url" value="<?php echo htmlspecialchars($url, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>输出方式 ：</label>
                <input type="text" name="output" value="<?php echo htmlspecialchars($output, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>中心点坐标 ：</label>
                <input type="text" name="location" value="<?php echo htmlspecialchars($location, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>关键词 ：</label>
                <input type="text" name="query" value="<?php echo htmlspecialchars($query, ENT_QUOTES); ?>"  placeholder="请输入关键词">
            </div>
            <div class="form-item">
                <label>半径(m) ：</label>
                <input type="text" name="radius" value="<?php echo htmlspecialchars($radius, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>区域 ：</label>
                <input type="text" name="region" value="<?php echo htmlspecialchars($region, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>每页记录数 ：</label>
                <input type="text" name="pagesize" value="<?php echo htmlspecialchars($pagesize, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>是否限制指定区县 ：</label>
                <input type="text" name="region_limit" value="<?php echo htmlspecialchars($region_limit, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>是否限制当前城市 ：</label>
                <input type="text" name="city_limit" value="<?php echo htmlspecialchars($city_limit, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <label>传入的坐标类型 ：</label>
                <input type="text" name="coord_type" value="<?php echo htmlspecialchars($coord_type, ENT_QUOTES); ?>">
            </div>
            <div class="form-item">
                <button type="submit">发起接口请求</button>
            </div>
        </form>

        <!-- 错误提示 -->
        <?php if (!empty($errorMsg)) : ?>
            <div class="err"><?php echo htmlspecialchars($errorMsg, ENT_QUOTES); ?></div>
        <?php endif; ?>

        <?php
        // 修复：使用 $jsonData（数组），不是$jsonResult（字符串）
        $poiList = array();
        if (isset($jsonData) && is_array($jsonData) && isset($jsonData['results'])) {
            $poiList = $jsonData['results'];
        }
        if (!is_array($poiList)) {
            $poiList = array();
        }

        if (count($poiList) > 0) {
            echo '<h4>POI 列表（关联数组方式）</h4>';
            foreach ($poiList as $index => $item) {
                $name = isset($item['name']) ? $item['name'] : '';
                $address = isset($item['address']) ? $item['address'] : '';
                $province = isset($item['province']) ? $item['province'] : '';
                $city = isset($item['city']) ? $item['city'] : '';
                $area = isset($item['area']) ? $item['area'] : '';
                $town = isset($item['street_id']) ? $item['street_id'] : '';

                echo "第 " . ($index + 1) . " 个：{$name} <br>";
                echo "地址：{$address}<br>";
                echo "省份：{$province}<br>";
                echo "城市：{$city}<br>";
                echo "区县：{$area}<br>";
                echo "城镇：{$town}<br><br>";
            }
        } elseif (!empty($jsonResult)) {
            echo "<p>暂无POI数据</p>";
        }
        ?>

        <!-- JSON结果展示 -->
        <?php if (!empty($jsonResult)) : ?>
            <h4>接口返回JSON数据：</h4>
            <pre><?php echo htmlspecialchars($jsonResult, ENT_QUOTES); ?></pre>
        <?php endif; ?>
    </div>
</body>
</html>