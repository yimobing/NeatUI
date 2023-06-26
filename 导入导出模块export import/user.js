var user = {
    name: '张三',
    sex: '男',
    age: 18
}

var message = {
    welcome: '欢迎光临'
}

var color = {
    value: 'green'
}


// const name = 'PengSir'
// setTimeout(() => {
//     console.log('name1：', name);
//     exports.name = 'test';
// }, 1000);
// console.log('name2：', name)
// exports.name = name;
var school1 = '泉州六中';


var notice = ({
    message = '',
    duration = 1.5
}) => {
    console.log('消息：', message);
    console.log('延时：', duration);
}



export const school = school1;  // '泉州五中';
export const grade = '三年级八班';
export {
    user as user,
    message as message
}


export default color;

// 这时导出整个对象
// export default {
//     color,
// };


// 导出一个函数
// export default function info() {
//     return notice(options);
// }