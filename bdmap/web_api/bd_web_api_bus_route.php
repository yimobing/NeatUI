<?php 

    /**
     * 百度地图公交线路（WEB API）
     * 参考：https://lbsyun.baidu.com/faq/api?title=webapi/guide/webservice-lwrouteplanapi/transit
     */
    header('Content-type:text/json;charset=utf-8');
    //----------------------------------------
    // 接收前端POST过来的参数
    $start = $_POST["origion"]; // 出发地经纬度坐标。格式： '经度,纬度'
    $end = $_POST["destination"]; // 目的地经纬度坐标。格式：'经度,纬度'
    // 打散成数组
    $sArr = explode(',', $start);
    $eArr = explode(',', $end);
    // 重新组合成字符串
    $origion = $sArr[1].','.$sArr[0]; // 格式：'纬度,经度'
    $destination = $eArr[1].','.$eArr[0]; // 格式：'纬度,经度'


    //----------------------------------------
    // 百度地图WEB API 调用
    // 此处填写你在控制台-应用管理-创建应用后获取的AK
    $ak = '2COzFaICuIyVj7V3VetKfmdRVnX8BhVr'; // 您的百度地图AK。
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
    $url = 'https://api.map.baidu.com/directionlite/v1/transit';
    
    // 构造请求参数
    // 示例：泉州古城 = '24.917104,118.593277' ;  中骏世界城 = 24.917104,118.656518
    $param['origin'] = $origion; // '24.917104,118.593277'; // 出发地，格式: '纬度,经度'
    $param['destination'] = $destination; // '24.917104,118.656518'; // 目的地，格式: '纬度,经度'
    $param['ak']   = $ak;

    $res = request_get($url, $param);


    //----------------------------------------
    // 将原始返回的结果打印出来
    // print("请求的原始返回结果为:\n");
    // print($res . "\n");

    //----------------------------------------
    // 输出到前台
    echo $res; // 将JSON对象直接传给前端
    // echo json_encode($res);  // 将JSON字符串转化成JSON对象并传给前端


?>