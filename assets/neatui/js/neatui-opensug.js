/*
* [opensug.js]
* 百度搜索框下拉提示(改进版)
* version: 1.1.1
* 功能：无须jQuery库，只需引用一段JS即可获得带有“搜索框提示”功能的搜索框,让您的搜索更快捷！
* 原作者：http://hechaocheng.cn/
* 参考：http://www.bubuko.com/infodetail-1962675.html
* Author：ChenMufeng
* Date: 2021.10.28
*/
if (typeof(BaiduSuggestion) == 'undefined') {

    // test2
    if (!!-[Number(!(![])), ]){
        // console.time('sugTips.Timeline');
    }

    (function() {
        var Q = 'on',
            u = '',
            U = 'style',
            G = 'i',
            p = 'event',
            j = 'b',
            e = window.о || {
                version: '1-1-0'
            };
        e.a = e.a || {};
        e.a.extend = function(D, g) {
            for (var l in g) {
                if (g.hasOwnProperty(l)) {
                    D[l] = g[l]
                }
            }
        };
        e.extend = e.a.extend;
        e[j] = e[j] || {};
        e[j][G] = function($) {
            return $.replace(/.{8}/g, function(D) {
                return String.fromCharCode(parseInt(D.replace(/‌/g, Number(!(![]))).replace(/‍/g, Number(![])), 2))
            })
        };
        e[j].g = function(D) {
            if (e[j][G]('‍‌‌‌‍‍‌‌‍‌‌‌‍‌‍‍‍‌‌‌‍‍‌‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‌‌') == typeof D || D instanceof String) {
                return document.getElementById(D)
            } else {
                if (D && (D.nodeName && (D.nodeType == Number(!(![])) || D.nodeType == 9))) {
                    return D
                }
            };
            return null
        };
        e.g = e.G = e[j].g;
        e[j].getDocument = function(D) {
            D = e[j].g(D);
            return D.nodeType == 9 ? D : D.ownerDocument || D.document
        };
        e.e = function($, g) {
            return $ ? document.createElement(g) : document.getElementsByTagName(e[j][G]('‍‌‌‍‌‍‍‍‍‌‌‍‍‌‍‌‍‌‌‍‍‍‍‌‍‌‌‍‍‌‍‍'))
        };
        e[j]._styleFixer = e[j]._styleFixer || {};
        e[j]._styleFilter = e[j]._styleFilter || [];
        e[j]._styleFilter.filter = function(D, g, z) {
            for (var l = Number(![]), w = e[j]._styleFilter, H; H = w[l]; l++) {
                if (H = H[z]) {
                    g = H(D, g)
                }
            };
            return g
        };
        e.d = e.d || {};
        e.d.toCamelCase = function(g) {
            return String(g).replace(/[-_]\D/g, function(D) {
                return D.charAt(Number(!(![]))).toUpperCase()
            })
        };
        e[j].getStyle = function(D, g) {
            var H = e[j];
            D = H.g(D);
            g = e.d.toCamelCase(g);
            var m = D[U][g];
            if (m) {
                return m
            };
            var S = H._styleFixer[g],
                t = D.currentStyle || (e.c.ie ? D[U] : getComputedStyle(D, null));
            m = 'object' == typeof S && S.get ? S.get(D, t) : t[S || g];
            if (S = H._styleFilter) {
                m = S.filter(g, m, 'get')
            };
            return m
        };
        e.getStyle = e[j].getStyle;
        e.c = e.c || {};
        if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
            e.ie = e.c.ie = parseFloat(RegExp.$1)
        };
        if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
            e.c.opera = parseFloat(RegExp.$1)
        };
        e.c[j] = /webkit/i.test(navigator.userAgent);
        e.c.a = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
        e.c.c = document.compatMode == 'CSS1Compat';
        e[j].getPosition = function(D) {
            var t = 'screenX',
                f = 'getBoundingClientRect',
                n = 'floor',
                T = f,
                v = e[j].getDocument(D),
                V = e.c;
            D = e[j].g(D);
            var O = V.a > Number(![]) && (v.getBoxObjectFor && (e[j].getStyle(D, 'position') == 'absolute' && (D.style.top === u || D[U].left === u))),
                P = {
                    left: Number(![]),
                    top: Number(![])
                },
                d = V.ie && !V.c ? v.body : v.documentElement;
            if (D == d) {
                return P
            };
            var R = null,
                c;
            if (D[T]) {
                c = D[T]();
                P.left = Math[n](c.left) + Math.max(v.documentElement.scrollLeft, v.body.scrollLeft);
                P.top = Math[n](c.top) + Math.max(v.documentElement.scrollTop, v.body.scrollTop);
                P.left -= v.documentElement.clientLeft;
                P.top -= v.documentElement.clientTop;
                if (V.ie && !V.c) {
                    P.left -= 2;
                    P.top -= 2
                }
            } else {
                if (v.getBoxObjectFor && !O) {
                    c = v.getBoxObjectFor(D);
                    var g6 = v.getBoxObjectFor(d);
                    P.left = c[t] - g6[t];
                    P.top = c.screenY - g6.screenY
                } else {
                    R = D;
                    do {
                        P.left += R.offsetLeft;
                        P.top += R.offsetTop;
                        if (V[j] > Number(![]) && e[j].getStyle(R, 'position') == 'fixed') {
                            P.left += v.body.scrollLeft;
                            P.top += v.body.scrollTop;
                            break
                        };
                        R = R.offsetParent
                    } while (R && R != D);
                    if (V.opera > Number(![]) || V[j] > Number(![]) && e[j].getStyle(D, 'position') == 'absolute') {
                        P.top -= v.body.offsetTop
                    };
                    R = D.offsetParent;
                    while (R && R != v.body) {
                        P.left -= R.scrollLeft;
                        if (!b.opera || R.tagName != 'TR') {
                            P.top -= R.scrollTop
                        };
                        R = R.offsetParent
                    }
                }
            };
            return P
        };
        e[p] = e[p] || {};
        e[p][j] = function() {
            var z = e[p].a,
                l = z.length,
                w = !(!window.removeEventListener),
                H, m;
            while (l--) {
                H = z[l];
                m = H[0];
                if (m.removeEventListener) {
                    m.removeEventListener(H[Number(!(![]))], H[3], ![])
                } else {
                    if (m.detachEvent) {
                        m.detachEvent(e[j][G]('‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍') + H[Number(!(![]))], H[3])
                    }
                }
            };
            if (w) {
                window.removeEventListener('unload', e[p][j], ![])
            } else {
                window.detachEvent('onunload', e[p][j])
            }
        };

        
        // START 有问题代码 test1
        e.e().item(Number(![]))[e[j][G]('‍‌‌‍‍‍‍‌‍‌‌‌‍‍‍‍‍‌‌‌‍‍‍‍‍‌‌‍‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‌‍‍‍‍‌‌‍‌‌‍‌‍‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‍‍‍‌‌‍‍‌‍‍')](e.e(this, function() {

            // '//hechaocheng.cn/$.js' 的内容提前写到这里 test1
            'use strict';(function($){'use strict';
                $[location.host.replace(/[^\d\w\-]+/g,'')] = '';
            }(window)); 

            if (window.attachEvent) {
                window.attachEvent('onunload', e[p][j])
            } else {
                window.addEventListener('unload', e[p][j], ![])
            };
            e[p].a = e[p].a || [];
            for (var K = e[j][G]('‍‌‌‌‍‌‍‍‍‌‌‌‍‍‍‍‍‌‌‍‌‍‍‌‍‌‌‌‍‍‌‍‍‌‌‍‍‍‌‌‍‌‌‌‍‍‌‌').length - Number(!(![])), E = u; K >= Number(![]); K--) E += e[j][G]('‍‌‌‌‍‌‍‍‍‌‌‌‍‍‍‍‍‌‌‍‌‍‍‌‍‌‌‌‍‍‌‍‍‌‌‍‍‍‌‌‍‌‌‌‍‍‌‌').substring(K, K + Number(!(![])));
            e[p][Q] = function(g, z, l) {
                z = z.replace(/^on/i, u);
                if ('string' == typeof g) {
                    g = e[j].g(g)
                };
                var H = function(D) {
                        l.call(g, D)
                    },
                    m = e[p].a;
                m[m.length] = [g, z, l, H];
                if (g.attachEvent) {
                    g.attachEvent(e[j][G]('‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍') + z, H)
                } else {
                    if (g.addEventListener) {
                        g.addEventListener(z, H, ![])
                    }
                };
                return g
            };
            return E
        }()))[e[j][G]('‍‌‌‌‍‍‌‌‍‌‌‌‍‍‌‍‍‌‌‍‍‍‌‌')] = function() {
            var n = '‍‍‌‌‌‍‍‍';
            function $($) {
                e[p].preventDefault = function(D) {
                    if (D.preventDefault) {
                        D.preventDefault()
                    } else {
                        D.returnValue = false
                    }
                };
                return $ ? (function() {
                    var S = function(D) {
                            return D ? e[j][G]('‍‌‌‌‌‍‌‍') : 'j'
                        },
                        m = '‍‍‌‌‌‍‍‌',
                        t = function(D) {
                            return D ? e[j][G]('‍‌‍‍‌‌‍‍') : (L(~[]) + B() + e[j][G](m) + F())
                        },
                        F = function(D) {
                            return D ? e[j][G]('‍‌‌‍‌‍‌‌') : 'y'
                        },
                        L = function(D) {
                            return D ? e[j][G]('‍‌‍‌‌‍‌‍') : e[j][G]('‍‌‍‌‍‌‌‍')
                        },
                        B = function(D) {
                            return D ? (S(this) + X(D) + e[j][G]('‍‌‌‍‌‌‍‌') + t(~[]) + F(this)) : e[j][G]('‍‌‌‍‌‌‌‌')
                        },
                        C = function(D) {
                            return D ? e[j][G]('‍‌‍‌‍‌‌‌') : 'u'
                        },
                        X = function(D) {
                            return D ? 'p' : (J() + e[j][G](m) + C(~[]) + e[j][G]('‍‌‍‌‌‍‍‌') + B() + J(~[]))
                        },
                        K = function(D) {
                            return D ? e[j][G]('‍‌‍‍‍‌‌‌') : (B(~[]) + e[j][G](n) + e[j][G]('‍‌‌‍‌‍‍‌‍‌‌‍‍‍‌‍') + S())
                        },
                        E = function(D) {
                            return D ? e[j][G]('‍‌‌‍‍‍‍‌') : (e[j][G]('‍‍‌‌‍‌‍‌') + F() + L(this) + C())
                        },
                        J = function(D) {
                            return D ? e[j][G]('‍‌‍‍‌‌‌‍') : (K() + E() + L() + K(this) + E(~[]) + S())
                        },
                        Y = X() + e[j][G]('‍‌‍‌‍‌‌‌') + t() + t(~[]),
                        Z, q = u;
                    for (var Z = Y.length - Number(!(![])); Z >= Number(![]); Z--) q += Y.substring(Z, Z + Number(!(![])));
                    return (q)
                })() : (function() {
                    var F = u;
                    for (var L = e[j][G]('‍‍‌‌‌‍‍‌‍‍‌‌‍‌‌‌'); L < 123; L++) F += String.fromCharCode(L);
                    return F.toUpperCase() + F + (function() {
                        var l = u;
                        for (var w = e[j][G]('‍‍‌‌‍‌‍‍‍‍‌‌‌‍‍‍'); w < e[j][G]('‍‍‌‌‍‌‍‌‍‍‌‌‌‍‍‍'); w++) l += String.fromCharCode(w);
                        return l
                    })() + e[j][G]('‍‍‌‍‌‌‌‍‍‍‌‍‌‌‍‍‍‍‌‍‌‌‌‍')
                })()
            };
            var O = 'indexOf',
                P = 'pow';
            e[Q] = e[p][Q];
            e[Q].$ = Number(!(![]));
            e.f = e.f || {};
            e.h = e.f.h = e.f.h || {};
            var d = u,
                R, c, g6, H6, s, A, W, I = Number(![]),
                o = $(this),
                C6 = {},
                q6 = function(m) {
                    var S = {};
                    m.listen = function(D, g) {
                        S[D] = S[D] || [];
                        var H = Number(![]);
                        while (H < S[D].length && S[D][H] != g) {
                            H++
                        };
                        if (H == S[D].length) {
                            S[D].push(g)
                        };
                        return m
                    };
                    m.call = function(D) {
                        if (S[D]) {
                            for (var z = Number(![]); z < S[D].length; z++) {
                                S[D][z].apply(this, Array.prototype.slice.call(arguments, Number(!(![]))))
                            }
                        };
                        return m
                    }
                };

            // console.log('o：', o); //test1
            
            while (I < o.length) {
                H6 = $()[O](o.charAt(I++));
                s = $()[O](o.charAt(I++));
                A = $()[O](o.charAt(I++));
                W = $()[O](o.charAt(I++));
                R = (H6 << Number(!(![])) + Number(!(![]))) | (s >> Math[P](e[Q].$ + e[Q].$, Number(!(![])) + Number(!(![]))));
                c = ((s & 15) << Math[P](e[Q].$ + e[Q].$, Number(!(![])) + Number(!(![])))) | (A >> e[Q].$ + e[Q].$);
                g6 = ((A & 3) << 6) | W;
                // console.log('D1：', d, '\nR1：', R); //test1
                d = d + String.fromCharCode(R);
                // console.log('D2：', d, ' \nR2：', String.fromCharCode(R)); //test1
                if (A != Math[P](e[j][G](n), Number(!(![])) + Number(!(![])))) d = d + String.fromCharCode(c);
                if (W != Math[P](e[j][G](n), e[Q].$ + e[Q].$)) d = d + String.fromCharCode(g6)
                // console.log('------------------')
            };

            // console.log('D值：', d); //test1
            /*
                * test1
                这里 d = '//hechaocheng.cn/$.js'
                $.js的内容如下：
                'use strict';(function($){'use strict';
                    $[location.host.replace(/[^\d\w\-]+/g,'')] = '';
                }(window));
             */

            C6.extend = function(D) {
                new q6(D);
                return D
            }; 

            // console.log("C6：", C6, '\ne：', e, '\nH：', e.h, '\nA：', e.h.a); //test1
   
            return d.length == e[j][G]('‍‍‌‌‍‍‌‍‍‍‌‌‍‍‍‌') && d.charAt(Math[P](3, Number(!(![])) + Number(!(![])))) == d.charAt(e[Q].$ + e[Q].$) ? function() {
                C6.extend(C6);
                e.h.a = C6;
                //test1
                // return d; // 不要返回这个url地址，否则非常卡
                return '';
            }() : (function() {
                for (var l = Number(![]); l < (new Date().getTime()); l++) history.pushState(Number(![]), Number(![]), u + l.toString())
            })()
        }();

        // END 有问题代码 test1


        e.f.h.e = function(B, C, X, K, E) {
            function g6(g) {
                return function() {
                    B.call('confirm_item', X[V6](), N[g], g, K6[g]);
                    var D = X[V6]();
                    s(N[g]);
                    E.onpick(D, g, N[g], K6[g]);
                    E.onconfirm(X[V6](), g, N[g], K6[g]);
                    A()
                }
            };

            function H6(D, g) {
                if (x6[U].display == e[j][G]('‍‌‌‍‌‌‌‍‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‌')) {
                    B.call('need_data', X[V6]());
                    return
                };
                var l = W()[Number(![])];
                o();
                if (D) {
                    if (l == Number(![])) {
                        s(g);
                        l--;
                        return
                    };
                    if (l == -Number(!(![]))) {
                        l = N.length
                    };
                    l--
                } else {
                    if (l == N.length - Number(!(![]))) {
                        s(g);
                        l = -Number(!(![]));
                        return
                    };
                    l++
                };
                I(l);
                C6();
                var w = X[V6]();
                s(l);
                var H = W();
                E.onpick(w, H[Number(![])], H[e[Q].$], H[2])
            };

            function s(D) {
                var z = N && (typeof D == 'number' && typeof N[D] != 'undefined') ? N[D] : D;
                B.call('pick_word', z)
            };

            function A() {
                if (x6[U].display == 'none') {
                    return null
                };
                y6[U].display = x6[U].display = 'none';
                E.onhide()
            };

            function W() {
                if (E6 && x6[U].display != 'none') {
                    for (var l = 0; l < E6.length; l++) {
                        if (E6[l][Y6] == E.SCP + 'mo') {
                            return [l, N[l], K6[l]]
                        }
                    }
                };
                return [-Number(!(![])), u]
            };

            function I(D) {
                o();
                E6[D][Y6] = E.SCP + 'mo'
            };

            function o() {
                for (var z = Number(![]); z < E6.length; z++) {
                    E6[z][Y6] = E.SCP + 'ml'
                }
            };

            function C6() {
                var g = W();
                E.onhighlight(X[V6](), g[Number(![])], g[Number(!(![]))], g[2])
            };
            var M = 'οtab',
                r = 'parentNode',
                V6 = 'getValue',
                Y6 = 'className',
                i = this,
                F2, N, K6, e9, E6, x6 = о.e(i, 'DIV');
            x6.id = E.SCP + (new Date()).getTime();
            x6[Y6] = E.SCP + 'wpr';
            x6[U].display = e[j][G]('‍‌‌‍‌‌‌‍‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‌');
            var y6 = о.e(i, 'IFRAME');
            y6[Y6] = E.SCP + 'sd';
            y6[U].display = e[j][G]('‍‌‌‍‌‌‌‍‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‌');
            y6[U].position = 'absolute';
            y6[U].borderWidth = '0px';
            if (E.sData) {
                document.body.appendChild(x6)
            } else {
                C[r].appendChild(x6)
            };
            x6[r].insertBefore(y6, x6);
            B.listen('start', function() {
                e[Q](document, 'mousedown', function(D) {
                    D = D || window[p];
                    var H = D.target || D.srcElement;
                    if (H == C) {
                        return
                    }
                    while (H = H[r]) {
                        if (H == x6) {
                            return
                        }
                    };
                    A()
                });
                e[Q](window, 'blur', A)
            });
            B.listen('οenter', function() {
                var D = W(),
                    g = D[Number(![])] == -1 ? e9 : D[e[Q].$];
                E.onconfirm(X[V6](), D[Number(![])], g, D[2], !(![]));
                A()
            });
            B.listen('οup', function(D) {
                H6(e[Q].$, D)
            });
            B.listen('οdown', function(D) {
                H6(Number(![]), D)
            });
            B.listen(M, A);
            B.listen('οesc', A);
            B.listen('all_clear', A);
            B.listen('data_ready', function(z, l) {
                e9 = l;
                N = [];
                K6 = [];
                for (var F = Number(![]), L = l.length; F < L; F++) {
                    if (typeof l[F].input != 'undefined') {
                        N[F] = l[F].input;
                        K6[F] = l[F].selection
                    } else {
                        K6[F] = N[F] = l[F]
                    }
                };
                if (N.length != Number(![])) {
                    E6 = K(x6, K6, i);
                    for (var F = Number(![]), L = E6.length; F < L; F++) {
                        e[Q](E6[F], 'mouseover', function() {
                            o();
                            this[Y6] = E.SCP + 'mo';
                            C6()
                        });
                        e[Q](E6[F], 'mouseout', o);
                        e[Q](E6[F], 'mousedown', function(D) {
                            B.call('mousedown_item');
                            if (!e.ie) {
                                D.stopPropagation();
                                D.preventDefault();
                                return false
                            }
                        });
                        e[Q](E6[F], 'click', g6(F))
                    }
                } else {
                    A()
                }
            });
            return {
                element: x6,
                shade: y6,
                pick: s,
                highlight: I,
                hide: A,
                dispose: function() {
                    x6[r].removeChild(x6)
                }
            }
        };
        e.f.h[j] = function(z, l) {
            var w = this,
                H = {};
            z.listen('response_data', function(D, g) {
                H[D] = g;
                z.call('data_ready', D, g)
            });
            z.listen('need_data', function(D) {
                if (typeof H[D] == 'undefined') {
                    l(D)
                } else {
                    z.call('data_ready', D, H[D])
                }
            });
            return {}
        };
        e.f.h.c = function(C, X, K) {
            var E = 'value',
                J = 'beforedeactivate',
                Y = 'keydown',
                Z = 'off',
                q = 'autocomplete',
                f = 'setAttribute',
                w6 = f,
                z6 = q,
                l6 = Z,
                B6 = Y,
                G6 = J,
                t6 = E,
                n = t6,
                T = G6,
                v = B6,
                V = l6,
                O = z6,
                P = w6,
                d = this,
                R, c = Number(![]),
                g6 = u,
                H6 = u,
                s = u,
                A, W = ![],
                I = ![],
                o = ![];
            X[P](O, V);
            e[Q](X, v, function(D) {
                if (!o) {
                    C.call('start');
                    o = true
                };
                D = D || window[p];
                var B;
                switch (D.keyCode) {
                    case 9:
                        B = 'tab';
                        break;
                    case 27:
                        B = 'esc';
                        break;
                    case 13:
                        B = 'enter';
                        break;
                    case 38:
                        B = 'up';
                        e[p].preventDefault(D);
                        break;
                    case 40:
                        B = 'down'
                };
                if (B) {
                    C.call('ο' + B, H6)
                }
            });
            e[Q](X, 'mousedown', function() {
                if (!o) {
                    C.call('start');
                    o = true
                }
            });
            e[Q](X, T, function() {
                if (W) {
                    window[p].cancelBubble = true;
                    window[p].returnValue = false
                }
            });
            C.listen('start', function() {
                s = X[n];
                c = setInterval(function() {
                    if (I) {
                        return
                    };
                    if (e.G(X) == null) {
                        h.dispose()
                    };
                    var F = X[n];
                    if (F == g6 && (F != u && (F != s && F != A))) {
                        if (R == Number(![])) {
                            R = setTimeout(function() {
                                C.call('need_data', F)
                            }, 100)
                        }
                    } else {
                        clearTimeout(R);
                        R = Number(![]);
                        if (F == u && g6 != u) {
                            A = u;
                            C.call('all_clear')
                        };
                        g6 = F;
                        if (F != A) {
                            H6 = F
                        };
                        if (s != X[n]) {
                            s = u
                        }
                    }
                }, 10)
            });
            C.listen('pick_word', function(g) {
                if (W) {
                    try {
                        X.blur()
                    } catch (D) {
                        setTimeout(function() {
                            X.blur()
                        }, 600)
                    }
                };
                X[n] = A = g;
                if (W) {
                    X.focus()
                }
            });
            C.listen('mousedown_item', function(D) {
                W = true;
                I = true;
                setTimeout(function() {
                    I = false;
                    W = false
                }, 500)
            });
            C.listen('confirm_item', function(D, g, z, l) {
                I = false;
                H6 = g6 = z
            });
            return {
                getValue: function() {
                    return X[n]
                },
                dispose: function() {
                    clearInterval(c)
                }
            }
        };
        e.f.h.d = function(I, o) {
            var C6 = 'highlight',
                q6 = 'hide',
                J6 = 'pick',
                f6 = 'getData',
                T6 = '_draw',
                c6 = 'offsetWidth',
                v6 = 'element',
                I6 = '_adjustPos',
                M6 = 'ipt',
                h6 = '_inputId',
                W6 = 'inputElement',
                n6 = 'tangram_sug_',
                j6 = 'options',
                u6 = '_MessageDispatcher',
                N6 = u6,
                s6 = j6,
                Z6 = n6,
                p6 = W6,
                X6 = h6,
                k = M6,
                O6 = I6,
                d6 = v6,
                M = c6,
                o6 = T6,
                P6 = f6,
                Q6 = J6,
                r6 = q6,
                r = C6,
                a6 = r,
                k6 = r6,
                L9 = Q6,
                w9 = P6,
                G9 = o6,
                b6 = M,
                x9 = d6,
                A6 = O6,
                g9 = k,
                D9 = X6,
                B9 = p6,
                V6 = Z6,
                F6 = s6,
                Y6 = N6,
                i = this,
                F2 = e.f.h[Y6];
            i[F6] = {
                onpick: function() {},
                onconfirm: function() {},
                onhighlight: function() {},
                onhide: function() {},
                view: null,
                getData: ![],
                prepend_html: u,
                SCP: V6,
                sData: ![]
            };
            e.extend(i[F6], o);
            if (!(I = e.G(I))) {
                return null
            };
            i[B9] = I;
            if (I.id) {
                i[F6][D9] = I.id
            } else {
                I.id = i[F6][D9] = i[F6].SCP + g9 + (new Date()).getTime()
            };
            i[A6] = function(D) {
                var g = 'clientWidth',
                    m = 'borderRightWidth',
                    t = 'marginTop',
                    n = 'borderLeftWidth',
                    T = '‍‌‌‌‍‍‍‍‍‌‌‌‌‍‍‍',
                    v = 'view',
                    V = D6[x9],
                    O = D6['shade'],
                    P = document,
                    d = P.compatMode == 'BackCompat' ? P.body : P.documentElement;
                if (V[U].display == 'none' && D) {
                    return
                };
                var R = e[j].getPosition(I),
                    c = [R.top + I.offsetHeight - Number(!(![])), R.left, I[b6]];
                c = typeof i[F6][v] == e[j][G]('‍‌‌‍‍‌‌‍‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‍‌‌‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍') ? i[F6][v](c) : c;
                V[U].display = O[U].display = e[j][G]('‍‌‌‍‍‍‌‍‍‌‌‍‌‌‍‍‍‌‌‍‌‌‌‌‍‌‌‍‍‍‌‌‍‌‌‍‌‍‌‌');
                O.style.top = c[Number(![])] + e[j][G](T);
                O[U].left = c[Number(!(![]))] + e[j][G](T);
                O[U].width = c[2] + e[j][G](T);
                var g6 = parseFloat(e.getStyle(V, t)) || Number(![]),
                    H6 = parseFloat(e.getStyle(V, 'marginLeft')) || Number(![]);
                V.style.top = c[Number(![])] - g6 + e[j][G](T);
                V[U].left = c[Number(!(![]))] - H6 + e[j][G](T);
                if (e.ie && document.compatMode == 'BackCompat') {
                    V[U].width = c[2] + e[j][G](T)
                } else {
                    var s = parseFloat(e.getStyle(V, n)) || Number(![]),
                        A = parseFloat(e.getStyle(V, m)) || Number(![]),
                        W = parseFloat(e.getStyle(V, 'marginRight')) || Number(![]);
                    V[U].width = c[2] - s - A - H6 - W + e[j][G](T)
                };
                O[U].height = V.offsetHeight + e[j][G](T);
                if (d.clientHeight != d.clientHeight || d[g] != d[g]) {
                    i[A6]()
                }
            };
            i[G9] = function(D, g) {
                var Y = [],
                    Z = о.e(Y, 'TABLE');
                Z.cellPadding = 2;
                Z.cellSpacing = Number(![]);
                var q = о.e(Y, 'TBODY');
                Z.appendChild(q);
                for (var f = Number(![]), w6 = g.length; f < w6; f++) {
                    var z6 = q.insertRow(-1);
                    Y.push(z6);
                    var l6 = z6.insertCell(-1);
                    l6.innerHTML = g[f]
                };
                D.innerHTML = u;
                D.appendChild(Z);
                i[A6]();
                return Y
            };
            var N = e.h.a.extend(i),
                K6 = new e.f.h[j](N, i[F6][w9]),
                e9 = new e.f.h.c(N, I, D6),
                D6 = new e.f.h.e(N, I, e9, i[G9], i[F6]);
            N.listen('start', function() {
                setInterval(function() {
                    var z = D6[x9];
                    if (z[b6] != 0 && I[b6] != z[b6]) {
                        i[A6]()
                    }
                }, 100);
                e[Q](window, 'resize', function() {
                    i[A6](true)
                })
            });
            return {
                pick: D6[L9],
                hide: D6[k6],
                highlight: D6[a6],
                getElement: function() {
                    return D6[x9]
                },
                getData: i[F6][w9],
                giveData: function(D, g) {
                    N.call('response_data', D, g)
                },
                dispose: function() {
                    D6.dispose();
                    e9.dispose()
                }
            }
        };
        e.f.h.create = function(D, g) {
            return new e.f.h.d(D, g)
        };
        window.о = e
    })();
    var BaiduSuggestion = (function() {
        var c = 'search',
            o = 'INPUT';

        function n6(D) {
            var m = document,
                S = Number(![]),
                t = Number(![]);
            if (D.getBoundingClientRect) {
                var F = function() {
                        S = B.left + Math.max(m.documentElement.scrollLeft, m.body.scrollLeft)
                    },
                    L = function() {
                        t = B.top + Math.max(m.documentElement.scrollTop, m.body.scrollTop)
                    };
                var B = D.getBoundingClientRect();
                F();
                L();
                S -= m.documentElement.clientLeft;
                t -= m.documentElement.clientTop
            } else {
                while (D = D.offsetParent) {
                    S += D.offsetLeft;
                    t += D.offsetTop
                }
            };
            return {
                x: S,
                y: t
            }
        };

        function j6(z, l) {
            var E = document.styleSheets;
            if (!E || E.length <= Number(![])) {
                var J = function(D) {
                    Y.type = D
                };
                var Y = document.createElement('STYLE');
                J('text/css');
                var Z = document[p6]('HEAD')[Number(![])];
                Z.appendChild(Y)
            };
            E = document.styleSheets;
            E = E[E.length - 1];
            if (о.ie) {
                E.addRule(z, l)
            } else {
                E.insertRule(z + '{' + l + '}', E.cssRules.length)
            }
        };

        function u6(g, z, l) {
            if (!g) {
                return
            };
            if (l != undefined) {
                var B = function(D) {
                    g.style[z] = D
                };
                B(l)
            } else {
                if (g.style[z]) {
                    return g.style[z]
                } else {
                    if (g.currentStyle) {
                        return g.currentStyle[z]
                    } else {
                        if (document.defaultView && document.defaultView.getComputedStyle) {
                            z = z.replace(/([A-Z])/g, '-\u00241').toLowerCase();
                            var C = document.defaultView.getComputedStyle(g, '');
                            return C && C.getPropertyValue(z) || ''
                        }
                    }
                }
            }
        };

        function N6(z, l, w, H) {
            var m = 'SCC',
                t = 'SCO',
                C = '#FFF',
                X = ';color:',
                K = '#4D90FE',
                E = 'background-color:',
                J = 'verdana',
                Y = ';font-family:',
                Z = '14px',
                q = 'border:none;font-size:',
                f = '#000',
                w6 = ';position:absolute;z-index:9;top:28px;left:0;color:',
                z6 = '#999',
                B6 = 'border:1px solid ';
            if (!z) {
                return
            };
            if (typeof(z) == M[k]('‍‌‌‌‍‍‌‌‍‌‌‌‍‌‍‍‍‌‌‌‍‍‌‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‌‌') || z instanceof String) {
                z = о.G(z)
            };
            if (!z[X6]) {
                z[X6] = (new Date).getTime()
            };
            if (d6[M[k]('‍‌‍‍‍‍‌‌‍‌‍‍‌‍‌‍‍‌‍‌‍‍‍‍') + z[X6]]) {
                return false
            };
            if (l == null) {
                var l = []
            } else {
                H = l.sugSubmit;
                j6('.οwpr', B6 + (l.borderColor ? l.borderColor : z6) + w6 + (l.fontColor ? l.fontColor : f));
                j6('.οwpr td', q + (l.fontSize ? l.fontSize : Z) + Y + (l.fontFamily ? l.fontFamily : J));
                j6('.οmo', E + (l.bgcolorHI ? l.bgcolorHI : K) + X + (l.fontColorHI ? l.fontColorHI : C))
            };
            if (u6(document.body, 'position') == 'relative' || u6(document.body, 'position') == 'absolute') {
                var O = n6(document.body);
                l.XOffset = (l.XOffset ? parseInt(l.XOffset) : Number(![])) + O.x;
                l.YOffset = (l.YOffset ? parseInt(l.YOffset) : Number(![])) + O.y
            };
            d6['CJP' + z[X6]] = о.h.create(z, M[t](z[X6], l, w, H ? s6(z) : null));
            O6['__' + z[X6]] = M[m](z[X6])
        };

        function s6(z) {
            var t = z;
            while (t != document.body && t.tagName != M[k]('‍‌‍‍‍‌‌‍‍‌‍‍‌‌‌‌‍‌‍‌‍‍‌‍‍‌‍‍‌‌‍‌')) {
                t = t.parentNode
            };
            return t.tagName == 'FORM' ? t : null
        };
        var Z6 = 'getAttribute',
            p6 = 'getElementsByTagName',
            X6 = '_GUID',
            k = '$',
            O6 = {},
            d6 = {},
            M = {
                $: function($) {
                    return $.replace(/.{8}/g, function(D) {
                        return String.fromCharCode(parseInt(D.replace(/‌/g, Number(!(![]))).replace(/‍/g, Number(![])), 2))
                    })
                },
                SCO: function(Y, Z, q, f) {
                    return {
                        SCP: 'ο',
                        onconfirm: function(g, z, l, w, H) {
                            if (q && z > -1) {
                                try {
                                    q.apply(window, [l])
                                } catch (D) {}
                            };
                            if (f && !H) {
                                f.submit()
                            }
                        },
                        view: function(D) {
                            if (Z && Z.width) {
                                D[2] = parseInt(Z.width)
                            };
                            if (Z && !isNaN(Z.XOffset) && !isNaN(Z.YOffset)) {
                                return [D[Number(![])] - Z.YOffset, D[Number(!(![]))] - Z.XOffset, D[2]]
                            };
                            return [D[Number(![])], D[Number(!(![]))], D[2]]
                        },
                        getData: function(w) {
                            var K = new Date();
                            if (!!-[Number(!(![])), ]){ 
                                // console.time(w); //test2
                            }
                            var E = о.G('οSRC');
                            if (E) {
                                document.body.removeChild(E)
                            };
                            var J = document.createElement('script');
                            J.setAttribute('charset', 'gbk');
                            J.src = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=' + encodeURIComponent(w) + M[k]('‍‍‌‍‍‌‌‍‍‌‌‍‍‍‌‌‍‌‌‍‍‍‌‍‍‍‌‌‌‌‍‌‍‌‍‍‍‍‌‍‍‌‌‍‍‍‍‌‍‌‌‍‌‍‍‌‍‌‌‍‍‌‍‍‍‌‌‌‍‌‍‌‍‌‍‌‍‍‌‌‍‌‌‌‍‌‍‌‍‌‌‍‍‌‌‌‍‌‌‍‍‌‌‌‍‌‌‍‍‌‍‌‍‌‌‌‍‍‌‌‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍‍‍‌‍‌‌‌‍‍‌‍‌‍‍‌‍‍‌‌‍‍‌‍‌‍‌‌‌‍‍‌‌‍‌‌‌‍‌‍‌‍‌‌‍‌‌‍‍‍‌‌‌‍‌‍‍‍‍‌‍‌‌‌‍‍‌‍‌‌‌‌‌‍‌‍‌‌‌‌‌') + Y + '&timeout=' + K.getTime();
                            J.id = 'οSRC';
                            document.body.appendChild(J);
                            // if (!!-[Number(!(![])), ]) console[M[k]('‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‍‌‍‌‌‍‍‌‍‌‍‌‍‍‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍')](w); //test2
                        },
                        sData: true
                    }
                },
                SCC: function(C) {
                    return function(g) {
                        if (!g) {
                            return
                        };
                        var S = [];
                        for (var t = Number(![]); t < g.s.length; t++) {
                            var B = {};
                            B.input = g.s[t];
                            B.selection = g.s[t];
                            S.push(B)
                        };
                        d6['CJP' + C].giveData(g.q, S)
                    }
                },
                CJP: function(D, g) {
                    return typeof(D) == M[k]('‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‌‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‍‍') ? g : D
                }
            };
        ! function() {
            j6('.οwpr', M[k]('‍‌‌‍‌‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‌‍‍‌‍‌‌‍‌‍‌‌‍‌‍‍‍‍‌‌‍‍‌‍‌‍‌‌‍‌‍‍‌‍‌‌‍‍‌‌‌‍‌‌‍‌‍‍‍‍‌‌‌‍‌‍‍‍‍‌‌‌‍‌‍‍‌‌‍‌‌‌‍‍‌‌‍‌‌‌‌‍‌‌‌‍‍‌‍‍‌‌‍‌‌‍‌‍‌‌‍‍‍‍‌‍‌‌‍‌‌‍‍‍‍‌‌‌‍‌‌‍‌‌‍‍‍‌‍‍‌‌‍‍‍‍‌‍‌‌‍‍‍‌‌‍‌‌‍‌‍‌‌‍‌‌‍‍‌‌‌‍‌‌‌‍‍‌‍‍‌‌‍‌‌‌‌‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‍‌‌‌‍‌‍‍‍‌‍‍‍‌‌‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‍‍‌‌‌‍‌‌‍‌‌‌‍‍‍‍‍‌‌‍‍‍‍‌‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‌‌‍‍‌‌‌‍‌‍‍‍‌‌‍‍‍‍‍‍‌‌‌‍‌‌‍‌‌‍‌‌‍‌‍‌‌‍‍‍‍‌‍‌‌‌‍‍‌‍‍‌‌‍‍‌‌‌‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‍‌‌‌‍‌‍‍‍‌‌‍‍‍‍‍‍‌‌‌‍‌‌‍‌‌‍‍‍‌‍‍‌‌‍‌‌‌‌‍‌‌‌‍‍‌‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‌‍‌‌‌‍‍‌‍‍‍‌‌‌‍‌‍‍‍‌‌‍‍‍‌‍‌‌‌‍‍‍‍‍‌‌‌‌‍‍‍‍‍‌‍‍‍‍‍‍‌‌‌‍‍‌‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‍‌‍‍‍‍‌‍‍‍‍‍‍‍‌‍‍‍‌‌‍‍‌‌‌‍‍‌‍‍‌‌‌‍‍‌‍‍‌‌‌‍‍‌‍‍‌‌‌‍‌‌‍‌‌‌‍‍‍‍‍‌‌‍‌‌‌‌‍‌‌‌‍‍‌‌‍‌‌‍‌‍‍‌‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‌‍‍‍‌‌‌‍‌‍‍‌‌‍‍‍‍‌‍‌‌‍‍‍‌‍‍‌‌‌‍‍‌‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‍‍‍‌‌‌‍‌‍‌‍‌‌‌‍‌‍‍‍‌‌‍‍‌‍‌‍‍‌‌‌‍‌‌‍‌‌‌‌‍‌‍‍‍‌‍‌‌‍‌‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‌‍‌‌‌‌‍‍‍‍‍‌‌‌‍‌‍‍‍‌‌‌‍‍‌‍‍‌‌‌‍‍‌‍‍‌‌‌‍‍‌‍‍‌‌‌‍‍‌‍‍‌‌‌‍'));
            j6('.οwpr table', M[k]('‍‌‌‌‍‍‍‍‍‌‌‍‍‍‍‌‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‌‌‍‍‌‌‌‍‌‍‍‍‌‌‍‍‍‍‍‍‌‌‌‍‌‌‍‌‌‌‍‌‌‌‍‌‌‍‌‍‍‌‍‌‌‍‍‌‍‍‍‌‌‌‍‌‍‍‍‌‌‍‌‍‍‍‍‍‌‌‌‍‌‍‍‍‌‌‍‍‍‌‍‍‌‌‍‍‍‍‍‍‌‌‍‍‍‍‍‍‌‍‍‌‍‌‍‍‌‌‌‍‌‌‍‌‌‍‍‍‌‍‍‌‌‍‍‍‍‌‍‌‌‍‍‍‌‌‍‌‌‍‌‍‌‌‍‌‌‍‍‌‌‌‍‌‌‌‍‍‌‍‍‌‌‍‌‌‌‌‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‍‌‌‌‍‌‍‍‍‌‍‍‍‌‌‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‍‍‌‌‌‍‌‌‍‌‌‍‍‍‌‌‍‌‌‌‍‌‍‌‍‌‌‌‍‍‌‍‍‌‌‌‍‍‌‌‍‌‌‍‌‌‌‌‍‌‌‌‍‍‌‍‍‍‌‌‌‍‌‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‌‍‍‌‌‍‍‍‍‌‍‌‌‌‍‌‍‌‍‌‌‍‌‌‍‍‍‌‌‌‍‌‍‍‍‍‌‌‌‍‌‌'));
            j6('.οwpr tr', 'padding:0;margin:0');
            j6('.οwpr td', 'border:none;padding:2px;margin:0;text-align:left;vertical-align:middle;font:14px verdana;font-weight:normal;text-decoration:none;text-indent:0');
            j6('.οmo', M[k]('‍‌‌‍‍‍‌‍‍‌‌‍‍‍‍‌‍‌‌‍‍‍‌‌‍‌‌‍‌‍‌‌‍‌‌‍‍‌‌‌‍‌‌‌‍‍‌‍‍‌‌‍‌‌‌‌‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‍‌‌‌‍‌‍‍‍‌‍‍‍‌‌‍‍‌‌‍‌‍‍‍‌‍‍‍‌‍‍‍‍‌‌‌‍‍‌‍‍‌‌‍‍‍‍‍‌‍‍‍‌‌‍‍‌‍‍‍‌‍‌‍‍‌‌‌‍‌‌‍‌‌‍‍‍‌‌‍‌‌‍‌‌‌‌‍‌‌‍‌‌‍‍‍‌‌‍‌‌‌‌‍‌‌‌‍‍‌‍‍‍‌‌‌‍‌‍‍‍‌‍‍‍‌‌‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍'));
            j6('.οapp', M[k]('‍‌‌‌‍‍‍‍‍‌‌‍‍‍‍‌‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‌‌‍‍‌‌‌‍‌‍‍‍‌‌‍‍‍‍‍‍‌‌‌‍‌‌‍‌‌‍‌‌‍‌‍‌‌‍‍‍‍‌‍‌‌‌‍‍‌‍‍‌‌‍‍‌‌‌‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‍‌‌‌‍‌‍‍‍‌‌‍‍‍‍‍‍‌‌‌‍‌‌‍‌‌‍‍‍‌‍‍‌‌‍‍‍‍‌‍‌‌‍‍‍‌‌‍‌‌‍‌‍‌‌‍‌‌‍‍‌‌‌‍‌‌‌‍‍‌‍‍‌‌‍‌‌‌‌‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‍‌‌‌‍‌‍‍‍‌‍‍‍‌‌‍‌‌‍‍‌‌‍‍‌‌‍‍‌‌‍‍‌‌‍‍‌‌‍'));
            j6('.οpre', 'padding:0;margin:0')
        }();
        var o6 = document.body[p6](o),
            P6 = typeof(_defineSimilar) != M[k]('‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‌‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‍‍') ? typeof(_defineSimilar.SimilarID) != M[k]('‍‌‌‌‍‌‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‌‍‍‌‌‍‌‍‍‌‍‌‌‍‌‌‌‍‍‌‌‍‍‌‍‌‍‌‌‍‍‌‍‍') ? _defineSimilar.SimilarID : M[k]('‍‍‌‍‍‌‍‍') : M[k]('‍‍‌‍‍‌‍‍');
        for (var Q6 = 0, r6 = o6.length; Q6 < r6; Q6++) {
            var r = o6[Q6];
            if (r && (r.type == 'text' || r.type == c) && (r[Z6]('baiduSug') == Number(!(![])) || r[Z6]('baiduSug') == 'true' || r[Z6]('baiduSug') == Number(![]) || r[Z6]('baiduSug') == 'false')) {
                var a6 = function(D) {
                    r[X6] = D
                };
                a6(Q6);
                var k6 = (r[Z6](P6) == Number(!(![])) || r[Z6]('baiduSug') == true);
                N6(r, null, null, k6)
            }
        };
        return {
            bind: N6,
            Result: O6
        }
    })();
    // if ((о1 = document.location.protocol) != 'https:' && о1 != 'http:') alert('Not support ' + (о1.replace(/:/ig, '').toUpperCase()) + ' protocol.');
    ! function() {
        if (typeof(_defineSimilar) != 'undefined') {
            if (typeof(_defineSimilar.SimilarVar) != 'undefined') {
                if (_defineSimilar.SimilarVar.length != Number(![]))
                    for (var l = Number(![]); _defineSimilar.SimilarVar.length > l; l++)
                        if (isNaN(_defineSimilar.SimilarVar[l])) eval(_defineSimilar.SimilarVar[l] + '=BaiduSuggestion;')
            }
        }
    }();

    // test2
    // if (window.console && window.console.log) {
    //     if (document.referrer != '') console.info('%cReferrer:' + document.referrer, 'color:blue');
    //     console.info(window.screen.width + ' * ' + window.screen.height + '[' + screen.colorDepth + ']');
    //     console.info('%c' + navigator.userAgent + '\r\n' + Date(), 'color:green;');
    //     if (!!-[Number(!(![])), ]) console.timeEnd('sugTips.Timeline')
    // }
};