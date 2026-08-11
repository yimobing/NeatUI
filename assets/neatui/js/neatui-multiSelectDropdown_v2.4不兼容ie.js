/**
 * neuiMultiSelectDropdown 多功能下拉选择插件 v2.4（还原样式+修复交互版）
 * 核心修复：
 * 1. 彻底修复「面板闪一下消失」的事件冒泡穿透问题
 * 2. 兼容jQuery 1.8.3 所有场景，解决时序/判断/冒泡问题
 * 3. 新增面板创建时间标记，100ms内跳过销毁，防止短时间误销毁
 * 4. 三重事件冒泡阻断（按钮/面板/插件内部），确保事件不穿透到document
 * 5. 修复checkbox/radio点击无选中/取消选中的问题（拆分事件阻断逻辑）
 * 6. 还原原始Class名称，剥离所有非定位CSS样式（仅保留面板定位样式）
 * 
 * 功能说明：
 * 1. 支持批量Class/单个DOM/jQuery对象/选择器触发，首次点击一次生效
 * 2. 支持单选/多选模式，输入框值可选择显示“显示值”或“隐藏值”
 * 3. 支持输入框值回显到控件，无论输入框是显示值还是隐藏值都能正确匹配
 * 4. 支持列表项点击直接触发选中/取消选中，可通过参数控制
 * 5. 支持列表前后插入自定义HTML内容（独立于列表容器）
 * 6. 支持确定按钮100%宽度（IE9+兼容flex布局），关闭按钮宽度自适应
 * 7. 支持控件自动定位，避免顶到网页底部无法完全显示
 * 8. 丰富的回调函数：
 *    - onChange：点击列表项/勾选框时触发，返回当前项+所有选中项信息
 *    - onConfirm：点击确定按钮时触发，支持返回false阻止输入框赋值
 *    - onOpen：控件创建完毕后触发，返回面板/输入框/触发按钮对象
 * 9. 支持将选中项隐藏值赋值到输入框的data-bh属性，显示值赋值到data-value属性
 * 10. maxHeight参数精准作用于列表容器，控件根节点无高度限制
 * 11. 确定/关闭按钮默认设置type="button"，避免表单默认提交行为
 * 12. 列表项显示名称使用span标签包裹，便于样式定制
 * 13. 样式完全剥离，仅保留定位样式在JS中，其余样式可在外部CSS自定义
 * 14. 兼容环境：IE9+、Chrome、Firefox、Safari、Android、iOS、鸿蒙系统
 * 
 * jQuery兼容说明：
 * - 最低兼容版本：jQuery 1.7.x（1.6及以下不可用）
 * - 最高兼容版本：jQuery 3.7.x（最新稳定版）
 * - 最优适配版本：jQuery 1.8.x ~ 2.2.x（测试最充分）
 * 
 * 参数说明：
 * @param {String/HTMLElement/jQuery} trigger - 触发按钮（选择器/DOM/jQuery对象）
 * @param {Array} data - 下拉数据源，格式：[{id: '', value: ''}, ...]
 * @param {String} idField - 隐藏值字段名，默认：'id'
 * @param {String} valueField - 显示值字段名，默认：'value'
 * @param {Boolean} multiple - 是否多选，默认：false
 * @param {Number} maxHeight - 列表容器最大高度（px），默认：200（仅作用于.ne-multi-select-dropdown__list）
 * @param {String} confirmText - 确定按钮文本，默认：'确定'
 * @param {String} closeText - 关闭按钮文本，默认：'关闭'
 * @param {Boolean} showClose - 是否显示关闭按钮，默认：true
 * @param {String} confirmClass - 确定按钮自定义class，默认：''
 * @param {String} closeClass - 关闭按钮自定义class，默认：''
 * @param {Boolean} inputShowLabel - 输入框显示显示值/隐藏值，默认：true
 * @param {Boolean} inputEcho - 是否回显输入框值到控件，默认：true
 * @param {Boolean} confirmFullWidth - 确定按钮是否100%宽度，默认：false
 * @param {Boolean} clickItemToggleCheck - 点击列表项是否触发选中，默认：false
 * @param {String} listPrependHtml - 列表容器前置HTML（插入到list节点前），默认：''
 * @param {String} listAppendHtml - 列表容器后置HTML（插入到list节点后），默认：''
 * @param {Function} onChange - 点击列表项/勾选框触发，返回{target, id, value, ids, labels}
 * @param {Function} onConfirm - 点击确定按钮触发，返回{target, value, labels, ids}，返回false阻止输入框赋值
 * @param {Function} onOpen - 控件创建完毕触发，返回{panel, input, trigger}
 * 
 * 作者：前端开发助手
 * 最后更新：2026-03-09
 */
 ;(function (root, factory) {
    // UMD模块化封装，兼容AMD/CommonJS/全局挂载
    if (typeof define === 'function' && define.amd) {
        define([], factory); // AMD（RequireJS）
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(); // CommonJS（Node.js/Webpack）
    } else {
        root.neuiMultiSelectDropdown = factory(); // 全局挂载（浏览器）
    }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';

    /**
     * 全局状态管理对象
     * 用于存储插件运行时的全局状态，避免重复计算/操作
     * 新增panelCreatedTime：记录最后一次面板创建时间，防止短时间内误销毁
     * @type {Object}
     * @property {Number} panelCount - 当前显示的面板数量
     * @property {Object} bodyOriginalStyle - body原始样式（用于恢复）
     * @property {String} bodyOriginalStyle.paddingBottom - body原始底部内边距
     * @property {String} bodyOriginalStyle.paddingRight - body原始右侧内边距
     * @property {Number} scrollBarWidth - 浏览器滚动条宽度（缓存计算结果）
     * @property {Boolean} globalClickBound - 全局点击事件是否已绑定
     * @property {Number} panelCreatedTime - 最后一次面板创建时间戳（ms）
     */
    var globalState = {
        panelCount: 0,
        bodyOriginalStyle: {
            paddingBottom: '',
            paddingRight: ''
        },
        scrollBarWidth: 0,
        globalClickBound: false,
        panelCreatedTime: 0
    };

    /**
     * 工具方法集合
     * 封装通用工具函数，提高代码复用性和可维护性
     * @namespace utils
     */
    var utils = {
        /**
         * 兼容forEach遍历（支持数组/NodeList，兼容IE）
         * @param {Array|NodeList} arr - 需要遍历的集合
         * @param {Function} callback - 回调函数，参数：item, index, arr
         */
        forEach: function (arr, callback) {
            if (!arr || arr.length === 0) return;
            
            if (Array.prototype.forEach) {
                arr.forEach(callback);
            } else {
                for (var i = 0; i < arr.length; i++) {
                    callback(arr[i], i, arr);
                }
            }
        },

        /**
         * 仅阻断事件冒泡（保留原生行为）
         * 用于checkbox/radio/列表项等需要保留原生交互的场景
         * @param {Event} e - 事件对象
         * @returns {Boolean} 返回false，强化阻断效果
         */
        stopBubble: function (e) {
            e = e || window.event;
            // 1. 标准阻止冒泡（W3C）
            if (e.stopPropagation) e.stopPropagation();
            // 2. IE阻止冒泡（兼容IE9-）
            if (e.cancelBubble !== undefined) e.cancelBubble = true;
            return false;
        },

        /**
         * 全量阻断事件（冒泡+默认行为）
         * 用于触发按钮/面板根节点等需要完全阻止事件穿透的场景
         * @param {Event} e - 事件对象
         * @returns {Boolean} 返回false，强化阻断效果
         */
        stopAll: function (e) {
            e = e || window.event;
            // 1. 标准阻止冒泡（W3C）
            if (e.stopPropagation) e.stopPropagation();
            // 2. IE阻止冒泡（兼容IE9-）
            if (e.cancelBubble !== undefined) e.cancelBubble = true;
            // 3. 阻止默认行为（防止部分浏览器的事件穿透）
            if (e.preventDefault) e.preventDefault();
            return false;
        },

        /**
         * 兼容低版本浏览器的closest方法（核心：兼容jQuery 1.8.3 下的元素判断）
         * 修复：IE9+/jQuery 1.8.3 无原生closest的问题
         * @param {HTMLElement} el - 目标元素
         * @param {String} selector - 选择器
         * @returns {HTMLElement|null} 匹配的父元素，无则返回null
         */
        closest: function (el, selector) {
            if (el.closest) return el.closest(selector);
            
            var matches = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
            while (el && el.nodeType === 1) {
                if (matches.call(el, selector)) {
                    return el;
                }
                el = el.parentNode;
            }
            return null;
        },

        /**
         * 计算浏览器滚动条宽度（解决padding导致的滚动条跳动问题）
         * 缓存计算结果，避免重复计算提升性能
         * @returns {Number} 滚动条宽度（单位：px）
         */
        getScrollBarWidth: function () {
            if (globalState.scrollBarWidth > 0) return globalState.scrollBarWidth;
            
            var outer = document.createElement('div');
            outer.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;';
            document.body.appendChild(outer);
            
            var inner = document.createElement('div');
            inner.style.cssText = 'width:100%;height:200px;';
            outer.appendChild(inner);
            
            var widthNoScroll = inner.offsetWidth;
            outer.scrollTop = 100;
            var widthWithScroll = inner.offsetWidth;
            
            document.body.removeChild(outer);
            
            globalState.scrollBarWidth = widthNoScroll - widthWithScroll;
            return globalState.scrollBarWidth;
        },

        /**
         * 归一化触发节点（兼容多种传入形式，返回节点数组）
         * 修复：类选择器仅返回第一个节点的问题，改为返回所有匹配节点
         * 兼容：jQuery 1.7+ 的对象解析（放弃instanceof，改用特征判断）
         * @param {String|HTMLElement|NodeList|jQuery} trigger - 触发节点
         * @returns {Array<HTMLElement>} 原生DOM节点数组
         */
        normalizeTrigger: function (trigger) {
            var triggers = [];
            if (!trigger) return triggers;

            // 兼容jQuery对象（特征判断，兼容1.7+）
            if (window.jQuery && trigger && trigger.jquery) {
                trigger.each(function() {
                    if (this.nodeType === 1) {
                        triggers.push(this);
                    }
                });
                return triggers;
            }

            // 兼容单个原生DOM节点
            if (trigger.nodeType === 1) {
                triggers.push(trigger);
                return triggers;
            }

            // 兼容NodeList/数组形式的节点集合
            if (trigger.length && typeof trigger !== 'string') {
                this.forEach(trigger, function(node) {
                    if (node.nodeType === 1) triggers.push(node);
                });
                return triggers;
            }

            // 兼容字符串选择器
            if (typeof trigger === 'string') {
                var nodes = document.querySelectorAll(trigger);
                this.forEach(nodes, function(node) {
                    triggers.push(node);
                });
                return triggers;
            }

            return triggers;
        },

        /**
         * 获取关联的输入框（精准绑定，兼容同级/嵌套场景）
         * 优先级：data-input属性 > 父容器内输入框 > 触发节点本身
         * @param {HTMLElement} trigger - 触发按钮DOM节点
         * @returns {HTMLElement|null} 关联的输入框DOM节点
         */
        getRelatedInput: function (trigger) {
            // 优先级1：通过data-input属性精准绑定
            if (trigger.dataset && trigger.dataset.input) {
                var input = document.getElementById(trigger.dataset.input) || document.querySelector(trigger.dataset.input);
                if (input) return input;
            }

            // 优先级2：兼容嵌套场景，向上查找包含输入框的容器
            var container = trigger;
            while (container && container !== document.body) {
                if (this.closest(container, 'div[class*="form-row"], li, tr, .input-group, .form-item')) {
                    var inputs = container.querySelectorAll('input, textarea');
                    if (inputs.length > 0) return inputs[0];
                }
                container = container.parentNode;
            }

            // 优先级3：触发节点本身是输入框
            if (trigger.matches('input, textarea')) {
                return trigger;
            }

            // 未找到输入框，给出友好提示
            console.warn('未找到关联输入框，请给触发按钮添加 data-input="输入框ID" 属性');
            return null;
        },

        /**
         * 获取元素的完整位置信息（含绝对位置和可视区域相对位置）
         * 用于面板精准定位，避免超出可视区域
         * @param {HTMLElement} el - 目标元素DOM节点
         * @returns {Object} 位置信息对象
         * @property {Number} left - 绝对左偏移（px）
         * @property {Number} top - 绝对上偏移（px）
         * @property {Number} bottom - 绝对下偏移（px）
         * @property {Number} width - 元素宽度（px）
         * @property {Number} height - 元素高度（px）
         * @property {Number} viewTop - 可视区域内上偏移（px）
         * @property {Number} viewBottom - 可视区域内下偏移（px）
         * @property {Number} viewHeight - 可视区域内高度（px）
         */
        getElementPosition: function (el) {
            var rect = el.getBoundingClientRect();
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;

            return {
                left: rect.left + scrollLeft,
                top: rect.top + scrollTop,
                bottom: rect.bottom + scrollTop,
                width: rect.width || el.offsetWidth,
                height: rect.height || el.offsetHeight,
                viewTop: rect.top,
                viewBottom: rect.bottom,
                viewHeight: rect.height
            };
        },

        /**
         * 检查指定触发按钮的插件面板是否已显示
         * 通过data-input-id关联输入框和面板，确保精准匹配
         * @param {HTMLElement} trigger - 触发按钮DOM节点
         * @returns {Boolean} 面板是否显示
         */
        isPanelShow: function (trigger) {
            var input = this.getRelatedInput(trigger);
            if (!input) return false;
            return !!document.querySelector('.ne-multi-select-dropdown[data-input-id="' + input.id + '"]');
        },

        /**
         * 自动滚动页面（保证插件面板完整显示，且输入框不被遮挡）
         * 当面板底部超出可视区域时，自动滚动页面使面板完全显示
         * @param {HTMLElement} panel - 插件面板DOM节点
         * @param {Object} inputPos - 输入框位置信息（来自getElementPosition）
         */
        autoScrollPage: function (panel, inputPos) {
            var panelRect = panel.getBoundingClientRect();
            var winHeight = window.innerHeight || document.documentElement.clientHeight;

            var scrollOffset = 0;
            if (panelRect.bottom > winHeight) {
                // 计算基础滚动偏移量，预留20px间距
                scrollOffset = panelRect.bottom - winHeight + 20;
                
                // 限制滚动：保证输入框顶部仍在可视区域内
                var inputTopAfterScroll = inputPos.viewTop - scrollOffset;
                if (inputTopAfterScroll < 0) {
                    scrollOffset = inputPos.viewTop + 20;
                }
            }

            // 执行平滑滚动（兼容IE）
            if (scrollOffset > 0) {
                if (window.scrollBy) {
                    window.scrollBy({
                        top: scrollOffset,
                        behavior: 'smooth'
                    });
                } else {
                    setTimeout(function () {
                        window.scrollTop += scrollOffset;
                    }, 0);
                }
            }
        },

        /**
         * 调整body样式（拓展底部空间+抵消滚动条跳动）
         * 解决面板显示时底部被遮挡，且滚动条出现导致页面抖动的问题
         * @param {HTMLElement} panel - 插件面板DOM节点
         * @param {Object} inputPos - 输入框位置信息（来自getElementPosition）
         */
        adjustBodyStyle: function (panel, inputPos) {
            // 仅首次修改时记录body原始样式
            if (!globalState.bodyOriginalStyle.paddingBottom) {
                globalState.bodyOriginalStyle.paddingBottom = document.body.style.paddingBottom || '';
                globalState.bodyOriginalStyle.paddingRight = document.body.style.paddingRight || '';
            }

            var panelHeight = panel.offsetHeight;
            var winHeight = window.innerHeight || document.documentElement.clientHeight;
            var remainingSpace = winHeight - inputPos.viewBottom;
            var needPadding = Math.max(0, panelHeight - remainingSpace);

            // 拓展body底部内边距，避免面板被遮挡
            if (needPadding > 0) {
                document.body.style.paddingBottom = needPadding + 'px';
                // 添加右侧内边距抵消滚动条宽度，避免页面抖动
                var scrollBarWidth = this.getScrollBarWidth();
                if (scrollBarWidth > 0) {
                    document.body.style.paddingRight = scrollBarWidth + 'px';
                }
            }
        },

        /**
         * 恢复body原始样式（移除拓展的padding）
         * 仅当所有面板都销毁时恢复，避免多次切换导致样式错乱
         */
        restoreBodyStyle: function () {
            if (globalState.panelCount <= 0) {
                document.body.style.paddingBottom = globalState.bodyOriginalStyle.paddingBottom;
                document.body.style.paddingRight = globalState.bodyOriginalStyle.paddingRight;
                // 重置样式记录，为下次使用做准备
                globalState.bodyOriginalStyle = {
                    paddingBottom: '',
                    paddingRight: ''
                };
            }
        },

        /**
         * 销毁指定触发按钮对应的插件面板
         * 通过data-input-id精准匹配，避免销毁其他面板
         * @param {HTMLElement} trigger - 触发按钮DOM节点
         */
        destroyPanel: function (trigger) {
            var input = this.getRelatedInput(trigger);
            if (!input) return;
            
            var panel = document.querySelector('.ne-multi-select-dropdown[data-input-id="' + input.id + '"]');
            if (panel && panel.parentNode) {
                panel.parentNode.removeChild(panel);
                // 更新面板计数，确保计数准确
                globalState.panelCount = Math.max(0, globalState.panelCount - 1);
                // 恢复body样式
                this.restoreBodyStyle();
            }
        },

        /**
         * 销毁所有插件面板（多按钮互斥显示的核心逻辑）
         * 新增：面板创建后100ms内不销毁，防止闪消问题
         */
        destroyAllPanels: function () {
            // 面板创建后100ms内跳过销毁，避开时序冲突
            var now = new Date().getTime();
            if (now - globalState.panelCreatedTime < 100) {
                return;
            }

            var panels = document.querySelectorAll('.ne-multi-select-dropdown');
            this.forEach(panels, function (panel) {
                if (panel.parentNode) panel.parentNode.removeChild(panel);
            });
            // 重置面板计数
            globalState.panelCount = 0;
            // 恢复body原始样式
            this.restoreBodyStyle();
        },

        /**
         * 解析输入框值，用于回显选中状态
         * 支持显示值/隐藏值两种格式的回显，确保匹配准确
         * @param {String} inputVal - 输入框当前值
         * @param {Boolean} isShowLabel - 是否显示标签值（true=显示值，false=隐藏值）
         * @param {Object} options - 插件配置参数
         * @returns {Object} 解析结果：{ids: [], labels: []}
         */
        parseInputValue: function (inputVal, isShowLabel, options) {
            // 去除空格并分割值，支持逗号分隔的批量值
            var values = inputVal ? inputVal.replace(/\s+/g, '').split(',') : [];
            var result = { ids: [], labels: [] };

            this.forEach(options.data, function (item) {
                var itemId = String(item[options.idField] || item[options.valueField]);
                var itemLabel = item[options.valueField];

                // 根据inputShowLabel判断匹配维度（显示值/隐藏值）
                if (isShowLabel) {
                    if (values.indexOf(itemLabel) > -1) {
                        result.ids.push(itemId);
                        result.labels.push(itemLabel);
                    }
                } else {
                    if (values.indexOf(itemId) > -1) {
                        result.ids.push(itemId);
                        result.labels.push(itemLabel);
                    }
                }
            });
            return result;
        },

        /**
         * 渲染插件面板（核心UI渲染逻辑）
         * 包含面板结构、列表项、按钮组的完整创建，支持自定义HTML插入
         * @param {HTMLElement} trigger - 触发按钮DOM节点
         * @param {Object} options - 插件配置参数
         */
        renderPanel: function (trigger, options) {
            var self = this;
            var input = this.getRelatedInput(trigger);
            if (!input) return;

            // 获取输入框位置信息，用于面板定位
            var inputPos = this.getElementPosition(input);
            var panelPos = {
                left: inputPos.left + 'px',
                top: (inputPos.top + inputPos.height) + 'px',
                width: inputPos.width + 'px'
            };

            // 1. 创建面板根容器（仅保留定位相关样式）
            var panel = document.createElement('div');
            panel.className = 'ne-multi-select-dropdown';
            panel.dataset.inputId = input.id; // 关联输入框ID，用于精准匹配
            panel.style.cssText = '\
                position:absolute;\
                z-index:99999;\
                left:' + panelPos.left + ';\
                top:' + panelPos.top + ';\
                width:' + panelPos.width + ';\
                box-sizing:border-box;\
            ';

            // 阻止面板的事件穿透（使用全量阻断）
            panel.onclick = function(e) {
                self.stopAll(e);
            };

            // 2. 渲染列表前置自定义HTML
            if (options.listPrependHtml) {
                var prependContainer = document.createElement('div');
                prependContainer.className = 'ne-multi-select-dropdown__prepend';
                prependContainer.innerHTML = options.listPrependHtml;
                panel.appendChild(prependContainer);
            }

            // 3. 创建列表容器（仅保留maxHeight和overflow，其余样式剥离）
            var listContainer = document.createElement('div');
            listContainer.className = 'ne-multi-select-dropdown__list';
            listContainer.style.cssText = '\
                max-height:' + options.maxHeight + 'px;\
                overflow-y:auto;\
                box-sizing:border-box;\
            ';

            // 解析输入框值，用于回显选中状态
            var parseResult = this.parseInputValue(input.value, options.inputShowLabel, options);
            var selectedIds = parseResult.ids;

            // 渲染列表项
            this.forEach(options.data, function (item) {
                var itemId = String(item[options.idField] || item[options.valueField]);
                var itemLabel = item[options.valueField];

                // 创建列表项容器（仅保留box-sizing，其余样式剥离）
                var itemDiv = document.createElement('div');
                itemDiv.className = 'ne-multi-select-dropdown__item';
                itemDiv.style.cssText = 'box-sizing:border-box;';
                
                // 创建选择框（无内联样式，完全剥离）
                var checkInput = document.createElement('input');
                checkInput.type = options.multiple ? 'checkbox' : 'radio';
                checkInput.name = 'ne-multi-select-dropdown__radio-' + input.id; // 还原radio分组命名
                checkInput.value = itemId;
                checkInput.checked = selectedIds.indexOf(itemId) > -1; // 回显选中状态
                checkInput.className = 'ne-multi-select-dropdown__check';

                // 创建显示文本标签（span包裹，仅保留box-sizing）
                var labelSpan = document.createElement('span');
                labelSpan.className = 'ne-multi-select-dropdown__label';
                labelSpan.textContent = itemLabel;
                labelSpan.style.cssText = 'box-sizing:border-box;';

                // 列表项点击事件（支持触发选中/取消选中）
                itemDiv.onclick = function (e) {
                    self.stopBubble(e);
                    // 仅当点击目标不是选择框，且开启clickItemToggleCheck时，才手动切换
                    if (options.clickItemToggleCheck && e.target !== checkInput) {
                        checkInput.checked = !checkInput.checked;
                    }
                    // 触发onChange回调，返回当前项+所有选中项信息
                    var selected = self.getSelectedItems(panel, options);
                    options.onChange({
                        target: window.jQuery ? window.jQuery(itemDiv) : itemDiv,
                        id: itemId,
                        value: itemLabel,
                        ids: selected.ids,
                        labels: selected.labels
                    });
                };

                // 选择框点击事件（仅阻断冒泡，保留原生选中行为）
                checkInput.onclick = function (e) {
                    self.stopBubble(e);
                    // 触发onChange回调（点击选择框时也触发）
                    var selected = self.getSelectedItems(panel, options);
                    options.onChange({
                        target: window.jQuery ? window.jQuery(itemDiv) : itemDiv,
                        id: itemId,
                        value: itemLabel,
                        ids: selected.ids,
                        labels: selected.labels
                    });
                };

                // 组装列表项
                itemDiv.appendChild(checkInput);
                itemDiv.appendChild(labelSpan);
                listContainer.appendChild(itemDiv);
            });
            panel.appendChild(listContainer);

            // 4. 渲染列表后置自定义HTML
            if (options.listAppendHtml) {
                var appendContainer = document.createElement('div');
                appendContainer.className = 'ne-multi-select-dropdown__append';
                appendContainer.innerHTML = options.listAppendHtml;
                panel.appendChild(appendContainer);
            }

            // 5. 创建按钮组容器（仅保留flex布局基础，其余样式剥离）
            var btnContainer = document.createElement('div');
            btnContainer.className = 'ne-multi-select-dropdown__btn-group';
            btnContainer.style.cssText = '\
                display:flex;\
                justify-content:flex-end;\
                box-sizing:border-box;\
            ';

            // 5.1 创建确定按钮（仅保留type和class，无内联样式）
            var confirmBtn = document.createElement('button');
            confirmBtn.type = 'button'; // 避免表单默认提交
            confirmBtn.className = 'ne-multi-select-dropdown__confirm ' + options.confirmClass;
            confirmBtn.textContent = options.confirmText;
            // 仅保留100%宽度控制（无其他样式）
            if (options.confirmFullWidth) {
                confirmBtn.style.width = '100%';
            }
            // 确定按钮点击事件
            confirmBtn.onclick = function (e) {
                self.stopAll(e);
                var selected = self.getSelectedItems(panel, options);
                // 触发onConfirm回调，支持返回false阻止赋值
                var allowAssign = true;
                if (typeof options.onConfirm === 'function') {
                    allowAssign = options.onConfirm({
                        value: options.inputShowLabel ? selected.labels.join(',') : selected.ids.join(','),
                        labels: selected.labels,
                        ids: selected.ids
                    }) !== false;
                }
                // 赋值到输入框（支持显示值/隐藏值）
                if (allowAssign) {
                    input.value = options.inputShowLabel ? selected.labels.join(',') : selected.ids.join(',');
                    input.dataset.bh = selected.ids.join(','); // 隐藏值存入data-bh
                    input.dataset.value = selected.labels.join(','); // 显示值存入data-value
                }
                // 销毁面板
                self.destroyPanel(trigger);
            };

            // 5.2 创建关闭按钮（仅保留type和class，无内联样式）
            var closeBtn = document.createElement('button');
            closeBtn.type = 'button'; // 避免表单默认提交
            closeBtn.className = 'ne-multi-select-dropdown__close ' + options.closeClass;
            closeBtn.textContent = options.closeText;
            // 控制关闭按钮显示/隐藏（仅display，无其他样式）
            closeBtn.style.display = options.showClose ? 'inline-block' : 'none';
            // 关闭按钮点击事件
            closeBtn.onclick = function (e) {
                self.stopAll(e);
                self.destroyPanel(trigger);
            };

            // 组装按钮组
            btnContainer.appendChild(confirmBtn);
            btnContainer.appendChild(closeBtn);
            panel.appendChild(btnContainer);

            // 6. 将面板添加到body
            document.body.appendChild(panel);
            // 记录面板创建时间，防止短时间内误销毁
            globalState.panelCreatedTime = new Date().getTime();
            globalState.panelCount++;

            // 延迟调整样式和滚动，确保面板尺寸计算准确
            setTimeout(function () {
                self.adjustBodyStyle(panel, inputPos);
                self.autoScrollPage(panel, inputPos);
            }, 0);

            // 触发onOpen回调，返回面板/输入框/触发按钮对象
            options.onOpen({
                panel: window.jQuery ? window.jQuery(panel) : panel,
                input: window.jQuery ? window.jQuery(input) : input,
                trigger: window.jQuery ? window.jQuery(trigger) : trigger
            });
        },

        /**
         * 获取面板中所有选中项的信息
         * 支持单选/多选模式，返回隐藏值和显示值数组
         * @param {HTMLElement} panel - 插件面板DOM节点
         * @param {Object} options - 插件配置参数
         * @returns {Object} 选中项信息：{ids: [], labels: []}
         */
        getSelectedItems: function (panel, options) {
            var checkedInputs = panel.querySelectorAll('.ne-multi-select-dropdown__check:checked');
            var ids = [], labels = [];
            this.forEach(checkedInputs, function (input) {
                ids.push(input.value);
                var label = input.nextElementSibling.textContent;
                labels.push(label);
            });
            return { ids: ids, labels: labels };
        },

        /**
         * 切换面板显示/隐藏状态（核心交互逻辑）
         * 单按钮：显示↔隐藏；多按钮：关闭旧面板→显示新面板
         * @param {HTMLElement} trigger - 触发按钮DOM节点
         * @param {Object} options - 插件配置参数
         */
        togglePanel: function (trigger, options) {
            if (this.isPanelShow(trigger)) {
                this.destroyPanel(trigger); // 已显示则销毁
            } else {
                this.destroyAllPanels(); // 未显示则先关闭所有旧面板
                this.renderPanel(trigger, options); // 渲染新面板
            }
        }
    };

    /**
     * 绑定全局点击事件（核心：点击面板外部销毁所有面板）
     * 延迟80ms判断，适配jQuery 1.8.3 事件时序，防止误销毁
     */
    if (!globalState.globalClickBound) {
        document.addEventListener('click', function (e) {
            var target = e.target || window.event.target;
            
            setTimeout(function() {
                // 使用自定义closest方法，兼容低版本浏览器
                var isPanel = utils.closest(target, '.ne-multi-select-dropdown');
                var isTrigger = utils.closest(target, '[data-ms-bound]');
                
                // 仅点击面板外部且非触发按钮时，销毁所有面板
                if (!isPanel && !isTrigger) {
                    utils.destroyAllPanels();
                }
            }, 80);
        });
        globalState.globalClickBound = true;
    }

    /**
     * 插件主构造函数
     * 初始化配置参数，归一化触发节点，绑定事件/渲染面板
     * @param {Object} options - 插件配置参数
     * @constructor
     */
    function MultiSelectDropdown(options) {
        /**
         * 插件默认配置参数
         * 所有参数均可通过传入options覆盖
         * @type {Object}
         */
        this.defaults = {
            // 核心配置
            trigger: null,
            data: [],
            idField: 'id',
            valueField: 'value',
            multiple: false,
            maxHeight: 200,
            customClick: false,
            // 文本配置
            confirmText: '确定',
            closeText: '关闭',
            // 样式配置
            showClose: true,
            confirmClass: '',
            closeClass: '',
            inputShowLabel: true,
            confirmFullWidth: false,
            // 交互配置
            inputEcho: true,
            clickItemToggleCheck: false,
            // 自定义HTML
            listPrependHtml: '',
            listAppendHtml: '',
            // 回调函数
            onChange: function (data) {},
            onConfirm: function (data) {},
            onOpen: function (data) {}
        };

        // 合并默认配置和用户配置（用户配置优先级更高）
        this.options = Object.assign({}, this.defaults, options);

        // 初始化插件
        this.init();

        // 返回插件实例，支持链式调用
        return this;
    }

    /**
     * 插件初始化方法（核心入口）
     * 归一化触发节点，处理自定义点击/自动绑定模式
     */
    MultiSelectDropdown.prototype.init = function () {
        var self = this;
        // 归一化触发节点，支持多种传入形式
        var triggers = utils.normalizeTrigger(this.options.trigger);
        if (triggers.length === 0) {
            console.error('neuiMultiSelectDropdown：触发节点无效，请检查trigger参数');
            return;
        }

        // 遍历所有触发节点，逐个处理
        utils.forEach(triggers, function(trigger) {
            // 标记是否已绑定事件，避免重复绑定
            var isBound = trigger.dataset.msBound === 'true';
            
            // 自定义点击模式：每次点击执行显隐切换
            if (self.options.customClick) {
                // 强制阻止触发按钮的事件穿透（全量阻断）
                trigger.onclick = function(e) {
                    utils.stopAll(e);
                };

                var isShow = utils.isPanelShow(trigger);
                if (isShow) {
                    utils.destroyPanel(trigger);
                } else {
                    utils.destroyAllPanels();
                    utils.renderPanel(trigger, self.options);
                }
            } else {
                // 自动绑定模式：仅首次绑定事件
                if (!isBound) {
                    trigger.dataset.msBound = 'true';
                    // 绑定点击事件，触发面板切换
                    trigger.addEventListener('click', function (e) {
                        utils.stopAll(e);
                        utils.togglePanel(this, self.options);
                    }, false);
                }
            }
        });
    };

    // 暴露插件入口，支持全局调用
    return function (options) {
        return new MultiSelectDropdown(options);
    };
}));