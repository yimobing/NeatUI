<?php
    /**
     * 页面名称： 后端接口地址文件
     * 功能及版本： 百度地图WebAPI接口调试 - 前后端分离版（有表单）
     */
    header("Content-Type: application/json; charset=utf-8");
    header("Cache-Control: no-cache, must-revalidate");
    // 允许跨域，本地调试用，生产改为指定域名
    header("Access-Control-Allow-Origin: *");

    // 统一返回封装函数
    function returnJson($code, $msg, $data = array()){
        $res = array(
            'code' => $code,
            'msg'  => $msg,
            'data' => $data
        );
        echo json_encode($res);
        exit;
    }

    // 接收前端AJAX传参
    $ak = trim(isset($_REQUEST['ak']) ? $_REQUEST['ak'] : '');
    $url = trim(isset($_REQUEST['url']) ? $_REQUEST['url'] : '');
    $output = trim(isset($_REQUEST['output']) ? $_REQUEST['output'] : '');
    $location = trim(isset($_REQUEST['location']) ? $_REQUEST['location'] : '');
    $query = trim(isset($_REQUEST['query']) ? $_REQUEST['query'] : '');
    $radius = trim(isset($_REQUEST['radius']) ? $_REQUEST['radius'] : '');
    $region = trim(isset($_REQUEST['region']) ? $_REQUEST['region'] : '');
    $tag = trim(isset($_REQUEST['tag']) ? $_REQUEST['tag'] : '');
    $pagesize = trim(isset($_REQUEST['pagesize']) ? $_REQUEST['pagesize'] : '');
    $region_limit = trim(isset($_REQUEST['region_limit']) ? $_REQUEST['region_limit'] : '');
    $city_limit = trim(isset($_REQUEST['city_limit']) ? $_REQUEST['city_limit'] : '');
    $coord_type = trim(isset($_REQUEST['coord_type']) ? $_REQUEST['coord_type'] : '');
    $scope = trim(isset($_REQUEST['scope']) ? $_REQUEST['scope'] : '');

    // 参数校验
    if(empty($ak)){
        returnJson(1001, 'AK密钥不能为空');
    }
    if(empty($region)){
        returnJson(1002, '区域参数不能为空');
    }
    if(!is_numeric($radius) || $radius <= 0){
        returnJson(1003, '半径必须是大于0的数字');
    }

    // 拼接百度地图接口
    // 地点检索接口地址
    // v2： http://api.map.baidu.com/place/v2/search
    // v3： http://api.map.baidu.com/place/v3/region
    $apiUrl = $url; 

    $params = array(
        'ak' => $ak,
        'output' => $output,
        'location' => $location,
        'query' => $query,
        'radius' => $radius,
        'region' => $region,
        'tag' => $tag,
        'pagesize' => $pagesize,
        'region_limit' => $region_limit,
        'city_limit' => $city_limit,
        'coord_type' => $coord_type,
        'scope' => $scope
    );
    $queryStr = http_build_query($params);
    $fullUrl = $apiUrl . '?' . $queryStr;

    // PHP5.3 请求第三方接口
    $opts = array(
        'http' => array('timeout' => 10)
    );
    $context = stream_context_create($opts);
    $response = @file_get_contents($fullUrl, false, $context);

    if($response === false){
        returnJson(500, '请求第三方接口失败');
    }
    $originData = json_decode($response, true);

    // 返回数据给前端JS
    returnJson(0, '请求成功', $originData);
?>