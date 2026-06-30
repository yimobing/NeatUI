<?php 

    // 百度地图 web api 接口调试 - 前后端不分离版 + 无表单版

    header("Content-Type: text/html; charset=UTF-8");

    // 此处填写你在控制台-应用管理-创建应用后获取的AK
    $ak = '2COzFaICuIyVj7V3VetKfmdRVnX8BhVr';
    
    // 发起一个http get请求，并返回请求的结果
    // $url字段为请求的地址
    // $param字段为请求的参数
    function request_get($url = '', $param = array()) {
        if (empty($url) || empty($param)) {
            return false;
        }
        
        $getUrl = $url . "?" . http_build_query($param);
        $curl = curl_init(); // 初始化curl
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // 跳过证书检查   
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2); // 从证书中检查SSL加密算法是否存在
        curl_setopt($curl, CURLOPT_URL, $getUrl); // 抓取指定网页
        curl_setopt($curl, CURLOPT_TIMEOUT, 1000); // 设置超时时间1秒
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1); // curl不直接输出到屏幕
        curl_setopt($curl, CURLOPT_HEADER, 0); // 设置header
        $data = curl_exec($curl); // 运行curl

        if (!$data) {
            print("an error occured in function request_get(): " . curl_error($curl) . "\n");
        }

        curl_close($curl);
        
        return $data;
    }

    // 请求地址
  
    // $url = 'https://api.map.baidu.com/place/v2/search?query=银行&location=39.915,116.404&radius=2000&output=json&ak=您的密钥';

    $url = 'https://api.map.baidu.com/place/v2/search';
    // $url = 'https://api.map.baidu.com/place/v3/region';
    
    $param['ak']   = $ak;
    
    // 构造请求参数
    // 坐标点说明
    // 24.887662,118.605089 浦西万达广场
    // 24.895044,118.608494 尊邸大厦

    $param['location'] = '24.887662,118.605089'; // 中心点坐标。注意这里的值： "纬度 lat, 经度 lng"
    $param['query']   = '学校'; // '小学'; // 检索关键字
    // $param['tag']   = '小学'; // 检索分类偏好。设置不正确可能会返回结果为空数组。与query组合进行检索，多个分类以","分隔 （POI分类），如果需要严格按分类检索，请通过query参数设置
    $param['radius'] = '5000'; // 圆形区域检索半径，单位为米。
    $param['region']   = '泉州市'; // 检索行政区划区域，可以是城市名或城市名区县。eg. '泉州市' 或 '泉州市丰泽区'。注：v2 版本region传城市区县不起作用，因为它以 location 为优先, region传城市区县时并不会过滤出相应数据；v3 版本传城市区县会起作用，因为它会过滤出指定location+region的数据。
    $param['page_size'] = '20'; // 每页返回记录数，默认10，最大值20
    // v3 版本才有的参数
    // $param['region_limit'] = 'true'; // 区域数据召回限制，为true时，仅召回region对应区域内数据。取值为'true'，仅返回region中指定城市检索结果
    // $param['city_limit'] = 'true'; // 指定的区域的返回结果加权，可能返回其他城市高权重结果。若要对返回结果区域严格限制，请使用city_limit参数
    // $param['coord_type'] = '3'; // 传入的坐标类型，1（wgs84ll即GPS经纬度），2（gcj02ll即国测局经纬度坐标），3（bd09ll即百度经纬度坐标），4（bd09mc即百度米制坐标）注："ll为小写LL"坐标详细说明

    $param['output']   = 'json';
   
    $jsonStr = request_get($url, $param);

    // 将原始返回的结果打印出来
    print("请求的原始返回结果为:\n");
    print($jsonStr . "\n");



    // 打印数据
    // 2. 解码为关联数组（必须加 true）
    $data = json_decode($jsonStr, true);

    // 3. 严格校验（核心：防止报错）
    if (json_last_error() !== JSON_ERROR_NONE) {
        die("JSON 解码失败：" . json_last_error_msg());
    }
    if (!isset($data['results']) || !is_array($data['results'])) {
        die("目标数组 `results` 不存在或非数组");
    }

    // 4. 循环打印数组字段
    echo "<h3>POI 列表（关联数组方式）</h3>";
    foreach ($data['results'] as $index => $poi) {
        // 按需打印字段，可加默认值避免未定义索引
        $name = $poi['name'];
        $address = $poi['address'];
        $province = $poi['province'];
        $city = $poi['city'];
        $area = $poi['area'];
        $town = isset($poi['town']) ? $poi['town'] : '';
        echo "第 " . ($index + 1) . " 个：{$name} <br> 地址：{$address}<br>省份：{$province}<br>城市：{$city}<br>区县：{$area}<br>城傎：{$town}<br><br>";
    }


?>