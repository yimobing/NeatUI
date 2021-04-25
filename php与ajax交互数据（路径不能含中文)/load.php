<?php
    header('Content-Type: text/html; charset=gb2312'); 
    $action = $_POST["action"];
    
    $username = "张三";
    $password = "李四";
    // $data = '{"username":"' .$username. '", "password":"' .$password. '"}';

     $data = ' {"data":[{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx1", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx2", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx3", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx4", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx5", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx6", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx7", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx8", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx9", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"},{"title":"诸葛亮，字孔明，号卧龙，琅琊阳都人，三国蜀汉丞相xxx10", "date":"2020-12-31", "img":"https://inews.gtimg.com/newsapp_bt/0/13039858001/1000"}]}';


    sleep(1); // 延迟N秒执行
    
    echo json_encode($data);//输出json数据

?>