function combine(deep, defs, opts, method){
    var options = {};
    if(typeof deep === 'boolean') options = { isDeep: deep === false ? false : true };
    else options =  { isDeep: false }
    if (typeof method === 'object') options = method;

    /**
     * 子函数：合并对象
     * @param {object} options 选项
     * @returns {object} 返回合并后的对象
     * [参考]：https://segmentfault.com/a/1190000011492291
     * [示例]
        // eg1.普通合并(浅合并)
        var target = EXT().merge(data1, data2);
        // eg2. isDeep 选择是否进行深合并。true 深度合并, false 浅合并，默认true
        var target = EXT({ isDeep: false }).merge(data1, data2);
        // eg3. includePrototype：选择是否要遍历对象的原型链，默认为 true
        var target = EXT({ includePrototype: false }).merge(data1, data2);
        // eg4. forEach：对每个合并项进行自定义处理
        var target = EXT({
            forEach: function(target, name, sourceItem) {
                target[name] = sourceItem + 'hello， 自定义每个合并项';
                return target;
            }
        }).merge(data1, data2);
    */
    function EXT(options) {
        return new EXT.prototype.init(options);
    };
    EXT.fn = EXT.prototype = {
        type: function(o) {
            return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
        },
        typeMap: {
            object: function() {
                return {};
            },
            array: function() {
                return [];
            }
        },
        // 默认配置项
        defaults: {  
            isDeep: true, // 是否深合并，默认true
            isToEmptyObject: true, // 是否合并到空对象上
            includePrototype: true, // 是否遍历合并源对象原型链上的属性，默认true
            forEach: function(target, name, sourceItem) { // 用于对每个合并项进行自定义修正
                target[name] = sourceItem;
                return target;
            }
        },
        // 将配置项合并到默认配置项
        init: function(options) {
            for (var name in options) {
                this.defaults[name] = options[name];
            }
            return this;
        },
        merge: function() {
            var self = this,
                _default = self.defaults,
                i = 1,
                length = arguments.length,
                // 根据是否全并到空对象{}中，决定对象采取”引用”还是“只赋值不引用”的方式
                // config = arguments[0] || {},
                config = _default.isToEmptyObject ? JSON.parse(JSON.stringify(arguments[0] || {})) : arguments[0] || {}, // 默认配置项
                source,
                configItem,
                sourceItem,
                tiType,
                siType,
                clone,
                name;
            // console.log('默认配置项defs：', defs, '\n默认配置项config：', config, '\n第1个参数：', arguments[0]);
            for (; i < length; i++) {
                // 判断源对象是否为空
                if ((source = arguments[i]) != null) {
                    for (name in source) {
                        var hasPro = source.hasOwnProperty(name);
                        // 是否遍历源对象的原型链
                        if (hasPro || _default.includePrototype) {
                            configItem = config[name];
                            sourceItem = source[name];
                            tiType = self.type(configItem);
                            siType = self.type(sourceItem);
                            // 防止出现回环
                            if (config === sourceItem) {
                                continue;
                            }
                            // 如果复制的是对象或者数组
                            if (_default.isDeep && sourceItem != null && self.typeMap[siType]) {
                                clone = configItem != null && tiType === siType ? configItem : self.typeMap[siType]();
                                // 递归
                                config[name] = self.merge(clone, sourceItem);
                            } else {
                                clone = hasPro ? config : config.__proto__;
                                // 处理每一个合并项
                                clone = _default.forEach.call(self, clone, name, sourceItem);
                            }
                        }
                    }
                }
            }
            return config;
        }
    };
    EXT.fn.init.prototype = EXT.fn;

    // 调用并返回结果
    return EXT(options).merge(defs, opts);
}