// 参考： https://blog.csdn.net/weixin_48037671/article/details/124042099
// https://www.jianshu.com/p/bf2b762c6572
// https://www.cnblogs.com/chenj-v/p/10029869.html
// https://www.zhihu.com/question/26832065/answer/2787263274?utm_id=0
// https://www.cnblogs.com/mybilibili/p/10411159.html
//————————————————————————————————————————————————
// 工厂模式
function person(name, age, food) {
    // var o = new Object();
    // o.name = name;
    // o.age = age;
    // o.food = food;
    // o.sayName = function (val) {
    //     return this.name + '、' + val;
    // }
    var o = {
        name: name,
        age: age,
        food: food,
        sayName: function (val) {
            return this.name + '、' + val;
        }
    }
    return o;
}
var p1 = person('张三1', 18, '吃萝卜');
var p2 = person('李四', 19, '吃米粉');
console.log(p1);
console.log(p2);
// 所有实例都是Object类型，但不是person的实例
console.log('是否对象类型：', p1 instanceof Object); // true
console.log('是否对象类型：', p1 instanceof person); // false
// 可直接调用工厂模式的属性或方法
var name = p1.sayName('赵钱');
var age = p1.age;
console.log('姓名：', name, '\n年龄：', age);
console.log('---------------------');

//————————————————————————————————————————————————
// 构造函数
function Person(name, age, food) {
    this.name = name;
    this.age = age;
    this.food = food;
    this.sayName = function (val) {
        return this.name + '、' + val;
    }
    console.log('我是构造函数，调用我了');
}

// 以函数方式调用
Person('小孙', 29, '吃菜头');

// 以构造函数方式调用
var p3 = new Person('小王', 25, '吃面线');
var p4 = new Person('小赵', 26, '吃骨头1');
console.log(p3);
console.log(p4);
// 所有实例都是Object类型，同时也是Person的实例
console.log('是否对象类型：', p3 instanceof Object); // true
console.log('是否对象类型：', p3 instanceof Person); // false
var name = p3.sayName('孙李');
var age = p3.age;
var name4 = p3.sayName('孙李');
console.log('姓名：', name, '\n年龄：', age);
console.log('方法相等吗', p3.sayName === p4.sayName);
console.log('---------------------');


