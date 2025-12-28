<?php 
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
    $url = 'https://api.map.baidu.com/place/v2/search';
    // $url = 'https://api.map.baidu.com/place/v2/search?query=银行&location=39.915,116.404&radius=2000&output=json&ak=您的密钥';
    
    // 构造请求参数 116.413387,39.910924
    $param['location']   = '24.895044,118.608494'; // 中心点坐标。注意这里的值： "纬度 lat, 经度 lng"
    $param['query']   = '小学'; // 检索关键字
    $param['tag']   = '小学'; // 检索分类偏好。设置不正确可能会返回结果为空数组。与query组合进行检索，多个分类以","分隔 （POI分类），如果需要严格按分类检索，请通过query参数设置
    $param['radius'] = '1000'; // 圆形区域检索半径，单位为米。
    
    $param['region']   = '泉州'; // 检索行政区划区域
    $param['city_limit'] = 'true'; // 取值为'true'，仅返回region中指定城市检索结果
    $param['output']   = 'json';
    $param['ak']   = $ak;
    // $param['coord_type'] = '3'; // 传入的坐标类型，1（wgs84ll即GPS经纬度），2（gcj02ll即国测局经纬度坐标），3（bd09ll即百度经纬度坐标），4（bd09mc即百度米制坐标）注："ll为小写LL"坐标详细说明

    $res = request_get($url, $param);

    // 将原始返回的结果打印出来
    print("请求的原始返回结果为:\n");
    print($res . "\n");
?>