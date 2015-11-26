var CoreUtils = $;
$.makeDescriptor = function(a, b, c, d, e, f) {
    if (!b) return null;
    var g = {
            enumerable: !1,
            configurable: !1
        }, h = c ? typeof c : "",
        i = d ? typeof d : "",
        j = arguments.length;
    return b = String(b), 3 == j ? "object" == h ? (["enumerable", "configurable", "writable"].forEach(function(a) {
        g[a] = !! c[a], delete c[a]
    }), "value" in c ? g.value = c.value : "function" == typeof c.get || "function" == typeof c.set ? (g.get = c.get || function() {}, g.set = c.set || function() {}) : g.value = c) : "function" == h ? (g.get = c, g.set = function() {}) : g.value = c : ("function" == h ? (g.get = c, "function" == i ? g.set = d : null != d && (f = !! e, e = !! d)) : (g.value = c, f = !! e, e = !! d), g.enumerable = !e, g.configurable = !f), "function" != typeof g.get ? "value" in g || (g.value = null) : delete g.writable, g
}
$.definePropertyLazy = function(a, b) {
    var c = $.makeDescriptor.apply(null, arguments);
    $.defineProperty(a, b, {
        get: function() {
            var d = c.get ? c.get.apply(a) : c.value;
            return delete a[b], $.defineProperty(a, b, c), d
        },
        set: function() {},
        configurable: !0
    })
}
$.defineProperty = function(a, b) {
    var c = $.makeDescriptor.apply(null, arguments);
    if (c) {
        if ("value" in c) return $.defineValue(a, b, c);
        if (Object.defineProperty) b in a && delete a[b], Object.hasOwnProperty.call(a, b) || Object.defineProperty(a, b, c);
        else {
            var d = "get" + b.charAt(0).toUpperCase() + b.substr(1);
            d in a || (a[d] = c.get), d = "set" + b.charAt(0).toUpperCase() + b.substr(1), d in a || (a[d] = c.get)
        }
    }
}
$.defineProperties = function(a, b, c) {
    c = c || {}, $.each(b, function(b, d) {
        $.defineProperty(a, d, $.extend(b, c))
    })
}

    $.defineValue = function(a, b, c, d, e, f) {
    var g = null,
        h = [d, !e, !f];
    b = String(b), g = c && "object" == typeof c && "value" in c && (1 == Object.keys(c).lenght || null != c.writable || null != c.enumerable || null != c.configurable) ? c : {
        value: c
    };
    for (var i, j = ["writable", "enumerable", "configurable"], k = 0; i = j[k], 3 > k; k++) null == g[i] && (g[i] = !! h[k]), g[i] = !! g[i];
    Object.defineProperty ? (b in a && delete a[b], Object.hasOwnProperty.call(a, b) || Object.defineProperty(a, b, g)) : a[b] = g.value
}, $.defineValues = function(a, b) {
    var c = [].slice.call(arguments, 3);
    if (!b || "object" != typeof b) return a;
    for (var d in b) d && "string" == typeof d && Object.hasOwnProperty.call(b, d) && $.defineValue.apply($, [a, d, b[d]].concat(c));
    return a
}

    $.makeProxy2 = (function(){
    function makedescripts(props,interceptor,filter,makefields){
        var nuprops={},noop=function(){},filterarr=null,filterfn=null;
        if($.isArray(filter)){filterarr=filter}
        if(typeof(filter)=="function"){filterfn=filter;filter=null}
        $.each(props,function(descriptorwrp,k){
            if(!isNaN(k)||!descriptorwrp||String(k).indexOf("__")==0){return}
            if(filter&&filter.indexOf(k)>=0){return}
            if(filterfn&&filterfn(k)===false){return}
            var propdescriptor=descriptorwrp.descriptor
            if(!propdescriptor && (descriptorwrp.get||("value" in descriptorwrp))){
                descriptorwrp={descriptor:descriptorwrp}
                if(typeof(descriptorwrp.descriptor.value)=="function"){descriptorwrp.isMethod=true}
                propdescriptor=descriptorwrp.descriptor;
            }
            if(propdescriptor&&propdescriptor.value&&propdescriptor.value.descriptor){descriptorwrp=propdescriptor.value}
            var d={configurable: propdescriptor.configurable,enumerable: propdescriptor.enumerable}
            if(descriptorwrp.isMethod || "value" in descriptorwrp.descriptor){
                d.writable=propdescriptor.writable;
                if(descriptorwrp.isMethod){
                    if(makefields && (k.indexOf("get")==0||k.indexOf("set")==0)){
                        var info= $.fn.info(descriptorwrp.descriptor.value)
                        if(info && info.isAccessor=="get"&&!nuprops[info.fieldname]){
                            var d1={configurable: true,enumerable: true}
                            d1.get=(function( nm,fnnm){return function(){return interceptor("get" ,this.___delegate___,nm,  function(){return this[fnnm]?this[fnnm]():this[nm]});} })( info.fieldname,info.name)
                            d1.set =(function( nm,fnnm){return function(vl){return interceptor("set",this.___delegate___,nm, function(val){ return this[fnnm]&&this[fnnm](val)},vl );} })( info.fieldname,info.name.replace(/^g/,"s"))
                            nuprops[info.fieldname]=d1;
                        }

                    }
                    d.value=(function( nm,f){return function(){return interceptor("method",this.___delegate___,nm, f,[].slice.call(arguments));} })( k,propdescriptor.value ||Function("v","var k='"+k+"',curr=this[k];if(v!==undefined && v!==curr){this[k]=v;}; return curr;") ) }
                else{
                    d.get=(function( nm){return function(){return interceptor("get" ,this.___delegate___,nm,  function(){return this[nm]});} })( k )
                    d.set =(function( nm){return function(vl){return interceptor("set",this.___delegate___,nm, function(val){ this[nm]=val},vl );} })( k )
                }
            }
            else {
                d.get=(function( nm,f){return function(){return interceptor("get",this.___delegate___,nm, f );} })( k,propdescriptor.get||Function("return this['"+k+"']")  )
                d.set=(function( nm,f){return function(vl){return interceptor("set",this.___delegate___,nm,f,vl );} })( k,propdescriptor.set||Function("v","return this['"+k+"']=v") )
            }
            nuprops[k]=d;
        });
        return nuprops
    }
    var _cached={};
    var toret= function(o){
        var interceptor=arguments[1],filter=arguments[2],makefields=arguments[3]
        if(arguments.length==2 && arguments[1]===true){
            interceptor=null;filter=null;makefields=true;
        }
        if(arguments.length==3 && arguments[2]===true){
            filter=null;makefields=true;
        }

        var proxy= $.cleanObj()
        if(typeof(interceptor)!="function"){
            interceptor=function(typ,dlg,nm,f,a){
                if(typ=="get"){return f.call(dlg)}
                if(typ=="set"){return f.call(dlg,a)}

                return typeof(f)=="function"?f.apply(dlg,a):a
            }
        }
        var allprops=$.getAllProperties(o)
        var nuprops=makedescripts(allprops,interceptor,filter,makefields)
        $.defineProperties(proxy,nuprops);
        proxy.___delegate___=o
        /*if(o && typeof o =="object"){
         var ctor,proto=Object.getPrototypeOf(o)
         if(proto&&proto.constructor){
         ctor=proto.constructor
         } else {ctor=o.constructor}
         if(ctor!==Object) {
         proxy.___ctor___ = ctor
         }

         }
         proxy.___constructor__=*/
        proxy.___interceptor___=interceptor
        proxy.__setDelegate=function(o){
            this.___delegate___=o
            return this
        }
        proxy.__add=function( obj,optns){optns=optns||{}
            if(optns==true){optns={fromdescripts:true}}
            if( optns.fromdescripts==null&& $.values(obj).some(function(it){return it.descriptor})){optns.fromdescripts=true }
            var descripts=( optns.fromdescripts)?obj:$.getAllProperties(obj)
            var nuprops=makedescripts(descripts,this.___interceptor___ ,optns.filter)
            $.defineProperties(this,nuprops);
            return this
        }
        proxy.__destroy=function() {

            if (proxy.___delegate___ && proxy.___delegate___.constructor && proxy.___delegate___.constructor.name && proxy.___delegate___.constructor !== Object) {
                _cached[proxy.___delegate___.constructor.name] || (_cached[proxy.___delegate___.constructor.name] = []);
                _cached[proxy.___delegate___.constructor.name].push(proxy)
            }
            proxy.___delegate___ = null;
            delete proxy.___delegate___;
        }
        proxy.__clone=function(dlg,props){
            var nu=Object.create(this)
            if(dlg){nu.__setDelegate(dlg)}
            if(props){var nuprops=null
                if(props==true){
                    if(dlg) {
                        nuprops=$.getAllProperties(dlg)
                        $.keys(nuprops,true).forEach(function(k){
                            if(k in nu){delete nuprops[k]}
                        })
                    }
                }else if($.isPlain(props)){
                    nuprops=props
                }
                nuprops&&nu.__add(nuprops,{fromdescripts:true})
            }
            return nu
        }
        return proxy
    }

    return toret

})();
(function($) {
        function _functionize(a, b) {
            return $.parseExpr(a, b).toFn()
        }
        try {
            Object.keys || (Object.keys = function(a) {
                var b = [];
                for (var c in Object(a)) b.push(c);
                return b
            }), Object.getOwnPropertyNames || (Object.getOwnPropertyNames = function(a) {
                var b = [],
                    c = Object.getPrototypeOf ? Object.getPrototypeOf(a) : a.__proto__ || a.prototype || (a.constructor ? a.constructor.prototype : null);
                for (var d in a) "string" == typeof d && (c && d in c || b.push(d));
                return b
            });
            var getDescriptors = function(a) {
                    for (var b, c = {}, d = Object.getOwnPropertyNames(a), e = 0; e < d.length; e++) {
                        var b = d[e];
                        c[b] = Object.getOwnPropertyDescriptor(a, b)
                    }
                    return c
                }, getProtoParent = function(a) {
                    if ("function" == typeof a) {
                        var b = a.prototype;
                        if (Object(b) === b || null === b) return a.prototype
                    }
                    if (null === a) return null;
                    throw new TypeError
                }, emptyObject = {}, defineProperty = Object.defineProperty,
                ownProps = Object.getOwnPropertyNames,
                getDescript = function(a, b) {
                    for (; null !== a;) {
                        var c = Object.getOwnPropertyDescriptor(a, b);
                        if (c) return c;
                        a = Object.getPrototypeOf(a)
                    }
                    return void 0
                }, CANUSEDESCRIPTORS = ownProps && defineProperty,
                primitiveTypes = {
                    "boolean": Boolean,
                    number: Number,
                    string: String
                }, nativeTypes = ["Arguments", "Array", "Boolean", "Date", "Error", "Function", "JSON", "Math", "Number", "Object", "RegExp", "String"],
                isplain = function(a, b) {
                    return a ? function(c) {
                        return c && "object" == typeof c && (a(c) === b||a(c) === null)
                    } : function(a) {
                        return a && "object" == typeof a && a.constructor && a.constructor.prototype === b
                    }
                }(Object.getPrototypeOf, Object.prototype);

            var _deepCopy = function _deepCopy(src, usector) {
                    function _inner(src, key) {
                        var ret = {}, ctorname;
                        if (null == src || "object" != typeof src || "function" == typeof src) return src;
                        if (key && "string" == typeof key && ignore.indexOf(key) >= 0) return null;
                        src.constructor && (ctorname = src.constructor.name);
                        var idx = _loop.indexOf(src);
                        if (idx >= 0) return _vals[idx];
                        if (idx = _loop.push(src) - 1, _vals[idx] = null, Object.isSealed(src) || !Object.isExtensible(src)) ret = src;
                        else if ($.isArray(src) || src !== window && src.length >= 0 && src.length === $.makeArray(src).length) {
                            ret = [], _vals[idx] = ret, prevgrandobj = src;
                            for (var i = 0, l = $.makeArray(src), ln = l.length; ln > i; i++) ret.push(_inner(l[i], i))
                        } else if (src instanceof Node) ret = src.cloneNode(!0);
                        else if ("function" == typeof src.clone) ret = src.clone(!0);
                        else if ("Date" === ctorname) ret = new Date(src.getTime());
                        else if ("RegExp" === ctorname) ret = eval(src.toString());
                        else if (src.newInstance && src.toMap) ret = src.newInstance(src.toMap());
                        else {ret = null
                            if (  usector) {
                                var proto = Object.getPrototypeOf ? Object.getPrototypeOf(src) : src.__proto__;
                                if ("function" == typeof src.constructor) try {
                                    ret = new src.constructor
                                } catch (e) {}
                                ret || (!proto && src.constructor && (proto = src.constructor.prototype), ret = Object.create(proto))
                            }
                            ret || (ret = {});
                            _vals[idx] = ret;
                            var i = 0,
                                names = Object.getOwnPropertyNames(src);
                            for (prevgrandobj = src; names.length;) {
                                var key = names.shift();
                                if (key && "string" == typeof key && !(key in ret)) try {
                                    ret[key] = _inner(src[key], key)
                                } catch (e) {}
                            }
                        }
                        return null === _vals[idx] && (_vals[idx] = ret), ret
                    }
                    var _loop = [],
                        _vals = [],
                        prevkey = null,
                        prevobj = null,
                        prevgrandobj = null,
                        ignore = ["enabledPlugin", "ownerElement", "bbox", "parentStyleSheet"];
                    return usector !== !0 && (usector = !1), _inner(src)
                },
                _mixin = function(a) {
                    for (var b = Array.from(arguments).slice(1); b.length;) {
                        var c = b.shift();
                        c && "object" == typeof c && singleMixin(a, c, !0)
                    }
                    return a
                }, _extend = function() {
                    var a, b = Array.from(arguments),
                        c = !1;
                    return "boolean" == typeof b[0] && (c = b.shift()), a = b.shift() || {}, "function" != typeof a && (a = Object(a)), _mixin.apply(null, [a].concat(c ? b.map(_deepCopy) : b)), a
                }, _compact = function() {
                    function a(b) {
                        var c, d = [].slice.call(arguments, 1);
                        "boolean" == typeof b && (c = b, b = d.shift());
                        var e = d.shift();
                        if (!b || "object" != typeof b) return [e || b ? !! b : !0, b];
                        var f, g = [],
                            h = $.isArrayLike(b),
                            i = h ? b : $.keys(b);
                        h && (f = []);
                        for (var j, k = i, l = 0, m = k.length; j = h ? l : k[l], m > l; l++) {
                            var n = b[j];
                            if (e && null == n || !e && !n) g.push(j);
                            else if (c && n && "object" == typeof n) {
                                var o = a(!0, n, e);
                                o[0] && g.push(j)
                            }
                        }
                        if (h)
                            for (; g.length;) b.splice(g.pop(), 1);
                        else g.forEach(function(a) {
                            try {
                                delete b[a]
                            } catch (c) {}
                        });
                        return g.length == i.length && (b.__empty = !0), [g.length == i.length, b]
                    }
                    var b = a.apply(this, arguments);
                    return b[1] && b[1].__empty && delete b[1].__empty, b[1]
                }, _defaults = function a(b) {
                    var c, d = [].slice.call(arguments, 1);
                    "boolean" == typeof b && (c = b, b = d.shift());
                    var e = _extend.apply(null, [!0, {}].concat(d));
                    if (!b || "object" != typeof b) return e;
                    for (var f in e) null == b[f] ? b[f] = e[f] : c && "object" == typeof b[f] && e[f] && "object" == typeof e[f] && (b[f] = a(!0, b[f], e[f]));
                    return b
                }, _merge = function b(a) {
                    var c = _extend.apply(null, [!0, {}].concat([].slice.call(arguments, 1)));
                    if (!a || "object" != typeof a) return c;
                    for (var d in c) d in a && a[d] && "object" == typeof a[d] && c[d] && "object" == typeof c[d] ? a[d] = b(a[d], c[d]) : null != c[d] && (a[d] = c[d]);
                    return a
                }, singleMixin2 = function(a, b, c) {
                    var d = {};
                    "function" == typeof c ? d.wrapper = c : "boolean" == typeof c ? d.overwrite = c : $.isArray(c) ? d.filter = function(a) {
                        var b = a;
                        return function(a, c) {
                            return -1 == b.indexOf(c)
                        }
                    }($.makeArray(c)) : c && "object" == typeof c && Object.keys(c).forEach(function(a) {
                        d[a] = c[a]
                    });
                    var e = d.filter;
                    for (var f in b) {
                        var g = b.__lookupGetter__(f),
                            h = b.__lookupSetter__(f),
                            i = d.wrapper;
                        !d.overwrite && f in a || !e || e(b[f], f) || (g || h || i ? ((g || i) && a.__defineGetter__(f, i ? i(g) : g), (h || i) && a.__defineSetter__(f, i ? i(h) : h)) : a[f] = b[f])
                    }
                },
                singleMixin = function singleMixin(dst, src, replaceExisting) {
                    var _has = Object.prototype.hasOwnProperty
                    if (typeof replaceExisting == 'undefined') replaceExisting = false;
                    if (!(dst && (typeof(dst) == "object" || typeof(dst) == "function")) || Object.isSealed(dst) || !(Object.isExtensible(dst))) {
                        return dst
                    }

                    if (CANUSEDESCRIPTORS) {
                        ownProps(src).forEach(function (propName) {
                            var has = _has.call(dst, s)
                            if (typeof(propName) == "string" && (!has || (replaceExisting && !(dst[s] === propName[src])))) {
                                $.defineProperty(dst, propName, getDescript(src, propName));

                            }
                        });
                    }
                    else {
                        for (var s in src) {
                            if (typeof(s) == "string" && _has.call(src, s) && !(s in emptyObject)) {
                                if (replaceExisting || !_has.call(dst, s)) {
                                    dst[s] = src[s];
                                }
                            }
                        }
                    }
                    return dst;
            }, _print = function() {
                    console.log.apply(console, ["print", Date.now()].concat($.makeArray(arguments)))
                }, _log = function() {
                    console.log.apply(console, ["log", Date.now()].concat($.makeArray(arguments)))
                }, _eachWithInherited = function(a, b, c) {
                    for (var d, e = $.BREAKITERATOR, f = a, g = !! $.isArrayLike(a), h = 0, i = g ? f : $.keys(f, !0), j = i.length;
                         (d = g ? h : i[h], j > h) && b.call(c, f[d], d, f) !== e; h++);
                }, _each = function(a, b, c) {
                    if (a) {
                        var d = $.fnize ? $.fnize(b) : b;
                        "function" != typeof d && $.throwTypeError("A callback function is expected");
                        var e = a.__iterator__ || a._each || a.forEach;
                        return "function" != typeof e && (e = null), e = e || ($.isArrayLike(a) ? [].forEach : function(b, c) {
                                for (var d, e = $.BREAKITERATOR, f = a, g = 0, h = ownProps(f), i = h.length;
                                     (d = h[g], i > g) && b.call(c, f[d], d, f) !== e; g++);
                            }), e ? (e.call(a, d, c), a) : void 0
                    }
                }, _types = {
                    number: "number",
                    string: "string",
                    "boolean": "boolean",
                    object: "object",
                    undefined: "undefined"
                }, OProto = Object.prototype,
                ArrProto = Array.prototype,
                FN = "function",
                _istype = function(a, b) {
                    if (a = a || "undefined", null == a || "null" === a || "nill" === a || "undefined" === a) {
                        if (null == b) return !0;
                        a = "null"
                    }
                    var c, d = !b || b.toString ? {}.toString.call(b).substr(8).replace(/\]$/, "").trim() : (b.constructor || {}).name;
                    return d && (null == a || "string" == typeof a ? c = d == String(a).toLowerCase() : "function" == typeof a ? c = d == String(a.name).toLowerCase() || b instanceof a : "object" == typeof a && (c = Object.getPrototypeOf(b) === a)), !! c
                }, _unwrap = function(a) {
                    return a && "object" == typeof a ? a.unwrap ? a.unwrap() : a instanceof Date ? a : a.valueOf ? a.valueOf() : a : void 0
                }, abs = function(a) {
                    return (a ^ a >> 31) - (a >> 31)
                }, round = function(a) {
                    return a + .5 >> 0
                }, ceil = function(a) {
                    return a + 1 >> 0
                }, floor = function(a) {
                    return~~ a
                }, _walk = function(a, b, c) {
                    function d(a, b) {
                        j.fet;
                        var c = typeof a,
                            d = a && a.nodeType ? a.id || a : a;
                        if (g.indexOf(d) >= 0 || "string" == typeof b && (0 == b.indexOf("__") || h.indexOf(b) >= 0) || null == a) return !1;
                        if ("object" == c)
                            if (a.__loopidx) {
                                var e = ++a.__loopidx[2];
                                e > 5 && console.log("looped", b)
                            } else a.__loopidx = [g.push(d), b, 0]
                    }

                    function e(a, g, j, k, l, m, n) {
                        l = l || 0;
                        var o = b(a, g, j, k, l, c, m, n);
                        if (!(o === !1 || m || ++f > 1e3) && (o && null != o.value && (a = o.value), a && "object" == typeof a)) {
                            var p = j + "",
                                q = a;
                            if (a && "function" == typeof a.toMap) q = a.toMap();
                            else if ("length" in a && a.length >= 0) {
                                var r = $.makeArray(q);
                                r.length == q.length && (q = r)
                            }
                            if ($.isArray(q)) {
                                for (var s, t = 0, u = q, v = u.length; s = u[t], v > t; t++)
                                    if (!(h.indexOf(x) >= 0 || null == s || d(s, x) === !1)) {
                                        var w = p + (p ? "." : "") + t;
                                        e(s, t, w, q, l + 1, !s || i(s), p)
                                    }
                            } else
                                for (var s, x, t = 0, u = $.keys(q, !0), v = u.length; x = u[t], v > t; t++)
                                    if (!(h.indexOf(x) >= 0 || d(s = q[x], x) === !1 || null == s)) {
                                        var w = p + (p ? "." : "") + x;
                                        e(s, x, w, q, l + 1, i(s), p)
                                    }
                        }
                    }
                    var f, g = [],
                        h = $.keys(Object.prototype, !0).concat(["instanceCount", "selection", "selectionDirection", "selectionEnd", "selectionStart"]),
                        i = function(a) {
                            return !a || "object" != typeof a || 0 === a.length || 0 === Object.keys(a).length
                        }, j = $.objectMap;
                    e(a, "", "", null, 0);
                    for (var k, l = 0, m = g, n = m.length; k = m[l], n > l; l++) k && k.__loopidx && (delete k.__loopidx, g[l] = null);
                    g.length = 0, g = null
                }, _unflatten = function() {
                    var a = arguments[0],
                        b = $.each,
                        c = "function" == typeof arguments[1] ? arguments[1] : null,
                        d = {};
                    return b(a, function(a, b) {
                        var e = String(b).trim().replace(/\.$/, "").split(/\./),
                            f = e.pop(),
                            g = 0 == e.length ? d : e.reduce(function(a, b) {
                                return a[b] || (a[b] = {}), a[b]
                            }, d);
                        g && (g[f] = c ? c(f, a) : a)
                    }), d
                }, _flatten = function(a, b, c, d) {
                    var e = {}, f = "function" == typeof b ? b : $.isArray(b) ? function(a) {
                        return function(b, c, d) {
                            return -1 == a.indexOf(c) || d
                        }
                    }(b) : function() {
                        return !0
                    };
                    return $.walk(a, function(a, b, g, h, i, j, k, l) {
                        var m;
                        return (m = f(a, b, g, i, k)) === !1 ? !1 : (m && m.leaf && (k = !0), m && k && (null != m.value && (a = m.value), c && l ? (e[l] || (e[l] = d ? Object.create(null) : {}), e[l][b] = a) : e[g] = a), m)
                    }), e
                }, getProtoChain = function(a, b) {
                    if (null == a) return [];
                    var c = Object(a),
                        d = [],
                        e = 0;
                    for (null == b && (b = !0); c && "object" == typeof c && null !== (c = Object.getPrototypeOf(c)) && !(++e > 20) && !(!c || d.indexOf(c) >= 0 || b && c === Object.prototype);) d.push(c);
                    return d
                }, getOwnPropertyDescriptors = function getOwnPropertyDescriptors(obj) {
                    var ret = {}, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
                    if (obj && typeof(obj) == "object") {
                        Object.keys(obj).forEach(function (it) {
                            var v = getOwnPropertyDescriptor(obj, it);
                            if (v && (("value" in v) || (typeof(v.get) == "function"))) {
                                ret[it] = v;
                            }
                        });
                    }
                    return ret
                },
                getPropList = function getPropList(obj0, onlyOwn, option) {
                    if (!obj0) {
                        return {}
                    }
                    var obj = obj0,exclud,askeyvalues,astuple;
                    if (typeof(obj) != "object") {
                        obj = Object(obj)
                    }
                    if(option){
                        if(Array.isArray(option)){exclud=option}
                        else if(option==="askeyvalues"||option==="keyvalues"||option==="keyvalue"){askeyvalues=true}
                        else if(option==="astuple"||option==="tuple"){astuple=true}

                    }
                    var _own = true, r = astuple?[]:Object.create(null), object = obj, exclude = ["constructor", "prototype", "__proto__"].concat(exclud || []);

                    while (object !== null && object != Object.prototype) {
                        for (var i = 0, l = Object.getOwnPropertyNames(object), ln = l.length, k; k = l[i], i < ln; i++) {
                            if (!(k && typeof(k) == "string" && k.indexOf("__") != 0 && exclude.indexOf(k) < 0)) {
                                continue
                            }
                            if(astuple){
                                r.push([k,obj[k]])
                            }
                            else if(askeyvalues) {
                                r[k] =  obj[k]
                            } else{
                                var ds = Object.getOwnPropertyDescriptor(object, k)||{}
                                r[k] = {name: k, own: _own, isMethod: typeof(ds.value ) == "function", descriptor: ds}
                            }

                        }
                        if (onlyOwn) {
                            break;
                        }
                        _own = false
                        object = Object.getPrototypeOf(object)
                    }
                    ;
                    /*
                     try{var m={}
                     for(var i=0,ln=r.length,it;it=r[i],i<ln;i++){
                     if(!(it&&ds[it]&&(("value" in ds[it])||(typeof(ds[it].getEntity)=="function")))){continue}
                     m[it]={name:it,own:_own,isMethod:typeof(ds[it].value)=="function",descriptor:ds[it]}
                     }


                     } catch(e){ console.error(e)}*/
                    return r
                };
            $.define = function(a, b) {
                -1 == a.indexOf(".") && ($[a] = b)
            }
             _extend($, {
                support: {},
                hasSupport: function(a) {
                    return String(a) in this.support ? this.support[String(a)] : !0
                },
                BREAKITERATOR: {},
                print: _print,
                log: _log,
                each: _each,
                getPropertyDescriptor: getDescript,
                 newInstance: function _newoftype(obj) {
                    var o = obj || {}, nu, c = typeof(o) == "function" ? o : o.constructor, a = []
                    if (arguments.length == 2 && arguments[1] && ({}).toString.call(arguments[1]).indexOf("Arguments") > 0) {
                        a = [].slice.call(arguments[1])
                        if (a.length && a[0] && ({}).toString.call(a[0]).indexOf("Arguments") > 0) {
                            a=[].slice.call(a[0])
                        }
                    }
                    else {
                        a = [].slice.call(arguments, 1)
                    }
                    var ln = a.length;
                    if (typeof(c) == "function") {
                        try {
                            if (!ln) {
                                nu = new c
                            }
                            else if (ln == 1) {
                                nu = new c(a[0])
                            }
                            else {
                                nu = new (Function.prototype.bind.apply(c, [null].concat(a)))
                            }
                        } catch (e) {
                        }
                    }
                    if (!nu) {
                        nu = Object.create(Object(o))
                    }
                    return nu
                },
                val: function(a) {
                    var b = a;
                    return null != a && a.valueOf && (b = a.valueOf()), null == b || "object" != typeof b ? b : ("value" in b ? b = b.value : "function" == typeof b.getValue ? b = b.getValue() : b instanceof Node && "textContent" in b && (b = b.textContent), b)
                },
                 disjoint:function(src,target){
                     var res={};
                     if(!(src && typeof(src)=="object")|| !(target && typeof(target)=="object")){return}
                     if($.isArrayLike(src) ){
                         res=[]
                         if(!$.isArrayLike(target)){return}
                         $.each(src,function(v,i){if(target[i]!=v){res.push(v)}})
                         return res
                     }
                     $.each(src,function(v,i){if(target[i]!=v){res[i]=v}})
                     return res
                 },
                 intersect:function(src,target){
                     var res={};
                     if(!(src && typeof(src)=="object")|| !(target && typeof(target)=="object")){return}
                     if($.isArrayLike(src) ){
                         res=[]
                         if(!$.isArrayLike(target)){return}
                         $.each(src,function(v,i){if(target[i]==v){res.push(v)}})
                         return res
                     }
                     $.each(src,function(v,i){if(target[i]==v){res[i]=v}})
                     return res

                 },
                collect: function(a, b, c) {
                    var d = [],
                        e = $.fnize ? $.fnize(b) : b;
                    return _each(a, function(a, b, c) {
                        d.push(e.call(this, a, b, c))
                    }, c), d
                },
                augment: function(a) {
                    if (a) {
                        var b;
                        return "undefined" != typeof Data && Data.TypeInfo && (b = Data.TypeInfo.getInfoFromValue(a)._extender), b && b.augment ? b.augment(a) : "each collect keys values getAllProperties".split(/\s+/).forEach(function(b) {
                            b in a || $.defineValue(a, b, $[b].curry(a), 1, 0, 1)
                        }), a
                    }
                },
                groupBy: function(a, b) {
                    return $.reduce(a, function(a, c, d, e) {
                        var f = b(c, d, e);
                        return a[f] || (a[f] = []), a[f].push(c), a
                    }, {})
                },
                some: function(a, b, c) {
                    var d = !1,
                        e = $.BREAKITERATOR;
                    return $.isArrayLike(a) && [].some ? d = Array.from(a).some(function(a, d, e) {
                        return b.call(c, a, d, e)
                    }, c) : _each(a, function(a, c, f) {
                        return b.call(this, a, c, f) ? (d = !0, e) : void 0
                    }, c), d
                },
                every: function(a, b, c) {
                    var d = !0,
                        e = $.BREAKITERATOR;
                    return $.isArrayLike(a) && [].every ? d = Array.from(a).every(function(a, d, e) {
                        return b.call(c, a, d, e)
                    }, c) : _each(a, function(a, c, f) {
                        return b.call(this, a, c, f) ? void 0 : (d = !1, e)
                    }, c), d
                },
                isArray: function(a) {
                    return !(!a || !(a instanceof Array || a.toString && "[object Array]" == {}.toString.call(a)))
                },
                makeArray: function(a, b) {
                    if (null == a) return [];
                    if ("object" != typeof(a)) return [a];
                    var c = (b && "number" == typeof (b)) ? b : 0;
                    if(Array.isArray(a)){
                        return c?a: a.slice(c)
                    }
                    if(("undefined" != typeof (a.length)) && a.length>=0){
                        return [].slice.call(a,c)
                    }

                    return [a]
                },
                isArrayLike: function(a) {
                    return a && "object" == typeof a && ($.isArray(a) || isFinite(a.length) && a.length >= 0 && a.length === Math.floor(a.length) && a.length < 4294967296)
                },

                isFunction: function(a) {
                    return "function" == typeof a
                },
                isNumber: function(a) {
                    return !(0 !== a && "0" !== a && (!a || "number" != typeof a && "string" != typeof a && "[object Number]" != {}.toString.call(a) || !isFinite(Number(a))))
                },
                isDomElement: function(a) {
                    return a && "object" == typeof a && a === window || a === document || a.nodeType && "undefined" != typeof Node && a instanceof Node
                },
                isElement: function(a) {
                    return a && "object" == typeof a && a.nodeType && "undefined" != typeof Node && a instanceof Node
                },
                toNumber: function(a, b) {
                    return $.isNumber(a) ? +a : null == b ? 0 : +b
                },
                isPlain: isplain,
                 isPlainObject: isplain,
                isJsonString: function(a) {
                    if (!a) return !1;
                    if ("object" == typeof a && ($.isPlain(a) || Array.isArray(a))) return a;
                    if (a && "string" == typeof a && a.length > 3) {
                        var b = a.charAt(0),
                            c = a.charAt(a.length - 1);
                        if ("{" == b && "}" == c && a.indexOf(":") > 0 || "[" == b && "]" == c) try {
                            return JSON.parse(a)
                        } catch (d) {}
                    }
                    return !1
                },
                 toSafeJson: (function(object, options) {
                     function _toSafeJson(object,loopcheck,lvl,config){
                         if(!object || (typeof(object)!="object")){
                             return typeof(object)=="function"?null:String(object)
                         }
                         if(config.maxLevel && lvl>=config.maxLevel){return null}
                         if(loopcheck.indexOf(object)>=0){return null}
                         loopcheck.push(object)
                         var ret
                         if($.isArrayLike(object) && k!=="style"){
                             ret=[]
                             for(var k= 0,ln=object.length;k<ln;k++){
                                 ret.push(_toSafeJson(object[k],loopcheck,lvl+1,config))
                             }
                         } else{
                             ret={}
                             for(var k in object){
                                 if(!isNaN(k) || k==="selectionStart"){continue}
                                 ret[k]=_toSafeJson(object[k],loopcheck,lvl+1,config)
                             }
                         }

                         return ret;
                     }
                     return function(object, options){
                         var loopcheck=[]
                         options=options||{}
                         var data=_toSafeJson(object,loopcheck,0,options)
                         if(data){
                             if(typeof(options.resolver)!="function"){options.resolver=null}
                             if(typeof(options.indent)!="number"){options.indent=null}
                             loopcheck.length=0;
                             loopcheck=null;
                             return JSON.stringify(data,options.resolver||undefined,options.indent||undefined)
                         }
                     }
                 })(),
                toJson1: function(a, b) {
                    var c = a;
                    $.isPlain(b) || (b = b === !0 ? {
                        extended: !0
                    } : "function" == typeof b ? {
                        resolver: b
                    } : {});
                    var d, e = ($.isPlain, []),
                        f = 0,
                        g = {
                            spellcheck: !0,
                            tabIndex: -1,
                            translate: !0,
                            contentEditable: "inherit"
                        }, h = function() {
                            return function(a, c, d) {
                                if (a && isNaN(a)) {
                                    var h = String(a).toLowerCase();
                                    if (!f && c && c.nodeType > 0 && (f = 1), f && (h.indexOf("parent") >= 0 || "childNodes" == a || "cssRules" == a || "classList" == a || "nextElementSibling" == a || "lastChild" == a || "firstChild" == a || "lastElementChild" == a || "firstElementChild" == a || "previousElementSibling" == a || "nextSibling" == a || "previousSibling" == a || h.indexOf("html") >= 0 || h.indexOf("text") >= 0 || h.indexOf("owner") >= 0 || "namespaceuri" == h || "baseuri" == h || "nodename" == h || "localname" == h || g[a] && g[a] == c)) return void 0
                                }
                                if (!c || "object" != typeof c) return c || void 0;
                                var i, j = e.indexOf(c);
                                if (j >= 0) return c.id || c.nodeName || c.nodeType || void 0;
                                if (d !== !0 && e.push(c), "function" == typeof c.toMap) i = c.toMap();
                                else if (c.properties && "function" == typeof c.properties.toMap) i = c.properties.toMap();
                                else if (b.resolver) i = b.resolver(a, c);
                                else if (b.serializefunctions) {
                                    for (var k, l = Array.isArray(c), m = l ? [] : {}, n = 0, o = Object.keys(c), p = o.length; k = o[n], n < o.length; n++) m[k] = "function" == typeof c[k] ? c[k].toString() : c[k];
                                    i = m
                                } else if (c.nodeType && 3 == c.nodeType) i = String(c.textContent || "").trim() ? {
                                    nodeType: 3,
                                    nodeValue: c.textContent
                                } : void 0;
                                else if (f && "style" == a && 1 == c.nodeType) {
                                    i = {};
                                    for (var n = 0, o = c.style || [], p = o.length; p > n; n++) i[o[n]] = o[o[n]]
                                } else if (f && "attributes" == a) {
                                    i = {};
                                    for (var q = 0, n = 0, p = c.length || 0; p > n; n++) {
                                        var a = c[n].name;
                                        "className" != a && "class" != a && "style" != a && 0 != a.indexOf("data-") && (i[a] = c[n].value, q++)
                                    }
                                    q || (i = void 0)
                                } else {
                                    if ((Array.isArray(c) || "number" == typeof c.length) && 0 === c.length) return void 0;
                                    if (c.length > 0 && "0" in c)
                                        if (f && "style" == a && 1 == c.nodeType) {
                                            i = {};
                                            for (var n = 0, o = c.style || [], p = o.length; p > n; n++) i[o[n]] = o[o[n]]
                                        } else {
                                            var r = [].slice.call(c);
                                            i = r && r.length === c.length && r[0] === c[0] ? r : c
                                        } else {
                                        if (f && "dataset" == a && !Object.keys(c).length) return void 0;
                                        i = c
                                    }
                                }
                                return null == i ? void 0 : i
                            }
                        };
                    d = h();
                    var i = d("", c, !0);
                    if (!i || "object" != typeof i) try {
                        return String(c)
                    } catch (j) {
                        return void 0
                    }
                    e[0] === c && e.shift();
                    var k;
                    try {
                        k = JSON.stringify(c, d, b.indent)
                    } catch (j) {
                        return void console.error(j)
                    }
                    for (; e.length;) e[0] = null, e.shift();
                    return k
                },
                ToString: function(a) {
                    if (hasOwn(a, "toString")) return a.toString();
                    var b = $.getValue(a);
                    return "object" == typeof a ? $.toJson(a) : Object(b).toString()
                },
                throwError: function(a) {
                    throw new Error(a)
                },
                throwTypeError: function(a) {
                    throw new TypeError(a)
                },
                eachWithInherited: _eachWithInherited,
                extend: _extend,
                merge: _merge,
                pluck: function(a) {
                    if (!a || "object" != typeof a) return null;
                    var b, c = [].slice.call(arguments, 1),
                        d = {}, e = $.isArrayLike(a);
                    return c.length && "boolean" == typeof c[c.length - 1] && (b = c.pop()), 1 == c.length && c[0] && Array.isArray(c[0]) && (c = c[0]), e && (d = []), c.filter(function(b) {
                        return ("string" == typeof b || "number" == typeof b) && b in a
                    }).forEach(function(b) {
                        !isNaN(b) && e ? d.push(a[b]) : d[b] = a[b]
                    }), d
                },
                omit: function(a) {
                    if (!a || "object" != typeof a) return null;
                    var b, c, d = [].slice.call(arguments, 1),
                        e = a,
                        f = $.isArrayLike(a);
                    if (d.length && "boolean" == typeof d[d.length - 1] && (c = d.pop()), b = 1 == d.length ? [].concat(d[0] || []) : d, f && !$.isArray(a) && (e = $.toArray(a)), c) {
                        for (var g, h = 0, i = b.length; g = i[h], i > h; h++)
                            if (f) {
                                var j = e.indexOf(g);
                                j >= 0 && e.splice(j, 1)
                            } else "string" == typeof g && g in e && c && delete e[g];
                        return a
                    }
                    return e = f ? [] : {}, $.each(a, function(a, c) {
                        -1 == b.indexOf(c) && (f ? e.push(c) : e[c] = a)
                    }), e
                },
                defaults: _defaults,
                compact: _compact,
                equals: function(a, b, c, d) {
                    var e = this;
                    if (a === b || c && a == b) return !0;
                    if (null == a && null != b || null == b && null != a) return !1;
                    var f = a && a.valueOf ? a.valueOf() : a,
                        g = b && b.valueOf ? b.valueOf() : b;
                    if (f === g || c && f == g) return !0;
                    if (typeof f != typeof g) return !1;
                    if (e.is.primitive(f) || e.is.primitive(g)) return f === g;
                    if ($.isArrayLike(a)) return $.isArrayLike(b) ? $.every(a, function(a, d) {
                        return $.equals(a, b[d], c)
                    }) : !1;
                    if (a.constructor && a.constructor !== b.constructor || Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return !1;
                    var h = d ? null : function(a, b) {
                        var c = typeof b;
                        return !("function" == c || "object" == c)
                    }, i = $.flatten(b, h);
                    return $.every($.flatten(a, h), function(a, b) {
                        return $.equals(a, i[b], c)
                    })
                },
                hashCode: function(a) {
                    if (!a) return 0;
                    if (!isNaN(+a)) return +a;
                    var b, c, d, e = 0;
                    if ("object" != typeof a || a.hasOwnProperty("toString")) d = a.toString();
                    else if ($.isPlain(a)) d = JSON.stringify(a);
                    else {
                        if ("object" != typeof a && "function" != typeof a.toMap) return e;
                        d = JSON.stringify(a.toMap())
                    } if (0 == d.length) return e;
                    for (b = 0, c = d.length; c > b; b++) e = (e << 5) - e + d.charCodeAt(b), e |= 0;
                    return Math.abs(e)
                },
                format: function(a, b) {
                    return null == a ? "" : "function" == typeof b ? b(a) : $.isNumber(a) ? $.numberFormat(a, b) : "object" == typeof a && (a instanceof Date || a.__isdate__) ? $.date.format(a, b||a._defaultFormat) : b && $.typeInfo && $.typeInfo.typeMap && $.typeInfo.typeMap[b] ? $.typeInfo.typeMap[b](a) : a
                },
                memoize: function(a, b) {
                    return function(a, b) {
                        var c = [],
                            d = 0,
                            e = {}, f = [self],
                            g = 0,
                            h = 1,
                            i = 2,
                            j = 3,
                            k = 4,
                            l = function() {
                                var l = arguments.length,
                                    m = this,
                                    n = [],
                                    o = e,
                                    p = f.indexOf(m);
                                if (l && p >= 0) {
                                    for (var q, n = arguments, r = [], s = 0; l > s; s++) r.push(n[s] && n[s].valueOf ? n[s].valueOf() : n[s]);
                                    for (var s = d - 1; s >= 0; s--) {
                                        if (q = c[s] || [], o = e, q && q[g] === l && p === q[h]) {
                                            o = q[j];
                                            for (var t = q[i], u = 0; l > u; u++)
                                                if (t[u] !== r[u]) {
                                                    o = e;
                                                    break
                                                }
                                        }
                                        if (o !== e) return q[k]++, o
                                    }
                                }
                                var v = a.apply(m, n);
                                if (l) {
                                    if (d >= b) {
                                        for (var w = [], x = Math.ceil(Math.max(.1 * d, 1)), s = 0; d > s && (1 == c[s][k] && w.push(s), !(w.length >= x)); s++);
                                        for (; w.length;) c.splice(w.pop(), 1)
                                    }
                                    b > d && (0 > p && (p = f.push(m) - 1), d = c.push([n.length, p, r, v, 0]))
                                }
                                return v
                            };
                        return l.__inner = a, l.toString = a.toString.bind(a), l.unmemoize = function() {
                            return c.length = 0, c = null, f.length = 0, f = null, a
                        }, l
                    }(a, Number(b) || 100)
                },
                 clone: function (v, deep,usector) {
                     var r = {},typ=typeof(v);
                      if(!(v && (typ==="object"||typ==="function"))){
                          return v
                      }
                     if(deep === true){
                         return _deepCopy(v,usector)
                     }
                     var nu,isarr=$.isArrayLike(v)
                     if(isarr){
                         nu=[]
                          for(var i= 0,ln= v.length;i<ln;i++){
                              nu[i]=v[i];
                         }
                     } else{nu={}}
                     for(var key in v) {
                         if (typeof(key)!="number") {
                             if(key=="__proto__" ||key=="constructor" ||key=="prototype" ||(key=="length" && (typ=="function"||isarr))){continue}
                             nu[key] = v[key];
                         }
                     }
                     return nu
                 } ,
                cleanObj: function() {
                    var a = Object.create(null);
                    return a
                },
                wrapAndextend: function() {},
                mixin2: function(a) {
                    for (var b = $.makeArray(arguments, 1); b.length;) {
                        var c = b.shift();
                        c && "object" == typeof c && singleMixin2(a, c, !0)
                    }
                    return a
                },
                mixin: _mixin,
                deepCopy: _deepCopy,
                reduce: function(a, b, c, d) {
                    var e = !! d,
                        f = {
                            running: c
                        };
                    return _each(a, function(c, d) {
                        e === !0 ? b(f.running, c, d, a) : f.running = b(f.running, c, d, a)
                    }), f.running
                },
                walk: _walk,
                uniq: function(a) {
                    var b = $.makeArray(a).reduce(function(a, b) {
                        return b in a || (a[b] = 1), a
                    }, {});
                    return Object.keys(b)
                },
                flattenDom: function(a, b) {
                    return _flatten(a, b || function(a, b) {
                            return a && a.nodeType && /(child|sibling|parent|document|stylesheets|node|element)$/i.test(b) ? {
                                leaf: !0,
                                value: "domelement:" + a.id
                            } : /html$/i.test(b) ? !1 : a
                        })
                },
                flatten: _flatten,
                unflatten: _unflatten,
                size: function(a) {
                    return $.isArrayLike(a) ? a.length : $.keys(a).length
                },
                values: function(a, b) {
                    return $.keys(a, b).map(function(b) {
                        return a[b]
                    })
                },
                keys: function(a, b) {
                    return Object.keys(b === !0 ? $.getAllProperties(a) : Object(a))
                },
                hasOwn: function(a, b) {
                    return Object.hasOwnProperty.call(a, b)
                },
                find: function(a, b, c, d) {
                    var e = $.fnize(b, {
                            args: ["value", "key"]
                        }),
                        f = $.isArrayLike(a),
                        g = f ? [] : {}, h = (d ? 0 : $.isArrayLike(a), function(a, b, c) {
                            return e.call(this, a, b, c) ? (f ? g = a : d ? (g = {}, g[b] = a) : g = a, $.BREAKITERATOR) : void 0
                        });
                    return _each(a, h, c), g
                },
                findAll: function(a, b, c, d) {
                    var e = $.fnize(b, {
                            args: ["value", "key"]
                        }),
                        f = $.isArrayLike(a),
                        g = f ? [] : {}, h = function(a, b, c) {
                            e.call(this, a, b, c) && (f ? g.push(a) : g[b] = a)
                        };
                    return f && (d = !1), null == d && (d = !f), _each(a, h, c), d ? g : $.values(g)
                },
                slice: function(a, b) {
                    return $.isArrayLike(a) ? $.makeArray(a, isNaN(b) ? 0 : Number(a)) : null
                },
                getValue: function(a) {
                    if (null == a) return "";
                    var b = "function" == typeof a.valueOf ? a.valueOf() : a,
                        c = b;
                    if ("object" != typeof b) c = b;
                    else {
                        var d = Object.getPrototypeOf(b);
                        if (Object.hasOwnProperty.call(b, "valueOf") || d !== Object.prototype && Object.hasOwnProperty.call(d, "valueOf")) c = b.valueOf();
                        else if ("value" in b) c = b.value;
                        else {
                            var e = Object.keys(b),
                                f = e.length;
                            f || (c = ""), 1 === f && (c = this.getValue(b[e[0]]))
                        }
                    }
                    return c
                },
                inspect: function(a, b) {
                    var c = $.typeInfo(a);
                    return c.properties = getAllProperties(a), b ? $.toJson(c, {
                        serializefunctions: !0
                    }) : c
                },
                is: function() {
                    function a(a, b) {
                        if (Object.is(a, b)) return !0;
                        if (null == b) return !(null != a);
                        if (null == a) return !1;
                        var c = typeof b,
                            d = !1,
                            e = a.constructor,
                            f = e ? e.name : "--unknown--";
                        if ("function" == c && (e === b || f === b.name)) return !0;
                        if ("string" === c)
                            if ("nill" == b) b = "null";
                            else if ("undef" == b) b = "undefined";
                            else if ("fn" == b) b = "function";
                            else if (/^[a-z][\.\/][a-z]/.test(b)) {
                                var g = b.split(/[\.\/]/).reduce(function(a, b) {
                                    return a ? a[b] : a
                                }, self);
                                g && (b = g, c = typeof b)
                            }
                        if ("string" !== c || String(a) != b && typeof a != b && (null != a || "null" != b && "undefined" != b))
                            if ("number" === c) d = +a === b;
                            else if ("boolean" === c) d = !! a === b;
                            else if ("array" === b) d = $.isArrayLike(a);
                            else if ("indexed" === b) d = $.isArrayLike(a) || $.isPlain(a);
                            else {
                                var h = !a || a.toString ? {}.toString.call(a).substr(8).replace(/\]$/, "").trim() : f;
                                "string" == typeof b ? d = h == String(a).toLowerCase() || String((a.constructor || {}).name).toLowerCase() : "function" == typeof b ? d = h == String(a.name) || h == String(a.name).toLowerCase() || a instanceof b : "object" == typeof b && (d = Object.getPrototypeOf(a) === b)
                            } else d = !0;
                        return !!d
                    }
                    return a.instOf = function(b, c) {
                        return null != b && "function" == typeof c && a(b, c)
                    }, a.arrayLike = function(a) {
                        return $.isArrayLike(a)
                    }, a.empty = function b(a, c) {
                        var d;
                        if (!a || !(d = $.val(a)) || 0 === a.length) return !0;
                        var e = !1,
                            f = typeof d;
                        if ("string" == f) return !d.trim();
                        if ("object" != f) return !1;
                        if (!c && (Array.isArray(d) && d.length || Object.keys(d).length)) return !1;
                        e = !0;
                        for (k in d)
                            if ("function" != typeof d[k] && !b(d[k], !0)) {
                                e = !1;
                                break
                            }
                        return e
                    }, a.emptyOrPrimitive = function(b) {
                        return null == b ? !0 : a.empty(b) || "function" != typeof b && "object" != typeof b && [Number, String, Boolean].indexOf(b.constructor) >= 0
                    }, a.obj = function(a) {
                        return a && "object" == typeof a
                    }, a.object = function(a) {
                        return a && "object" == typeof a
                    }, a.element = function(a) {
                        return a && a.nodeType > 0
                    }, a.el = function(a) {
                        return a && a.nodeType > 0
                    }, a.arr = function(a) {
                        return $.isArray("array", a)
                    }, a.reg = function(a) {
                        return a && a.test && a.exec && "ignoreCase" in a
                    }, a.nan = function(a) {
                        return isNaN(a)
                    }, a.bool = function(b) {
                        return a(b, Boolean)
                    }, a.regexp = function(b) {
                        return b && a(b, RegExp)
                    }, a.nullOrUndef = function(a) {
                        return null == a
                    }, a.nill = function(a) {
                        return null === a
                    }, a.primitive = function(a) {
                        return "function" != typeof a && "object" != typeof a && [Number, String, Boolean].indexOf(a.constructor) >= 0
                    }, a.undef = function(a) {
                        return "undefined" == typeof a
                    }, a.instance = function(a) {
                        return a && "object" == typeof a && a.constructor !== Object
                    }, a["native"] = function(a) {
                        if (null == a) return null;
                        if (primitiveTypes[typeof a]) return !0;
                        var b = "object" == typeof a ? a.constructor : a;
                        return b && b.name && nativeTypes.indexOf(b.name) >= 0 ? !0 : /[native\s*code\s*]/.test(String(b))
                    }, a.fromNative = function(a) {
                        return a && a.constructor && nativeTypes.indexOf(a.constructor.name) >= 0
                    }, a.plain = function(a) {
                        return $.isPlain(a)
                    }, a.date = function(a) {
                        return a && (a instanceof Date || (a.constructor && String(a.constructor.name||"").toLowerCase() == "date"))
                    }, ["number", "fn", "string", "boolean", "array", "object", "nill", "undef"].forEach(function(b) {
                        a[b] = function(a) {
                            return function(b) {
                                return $.is(b, a)
                            }
                        }(b)
                    }), Object.freeze && Object.freeze(a), a
                }(),
                propertyWatcher: function() {
                    delete this.propertyWatcher;
                    var a = Object.create(null);
                    return $.emitter(a, !0), $.defineProperty(this, "propertyWatcher", {
                        value: a,
                        configurable: !1,
                        writable: !1
                    }), a
                },
                asType: function(a, b) {
                    return $.typeinfo(a).coerce(b)
                },
                toDomWrap: function(a) {
                    return E(a)
                },
                toDomEl: function(a) {
                    return E.toEl(a)
                },
                parse: function(a, b) {
                    return $.parseExpr(a, b)
                },
                isFn: function(a) {
                    return $.isFunction(a)
                },
                asPredicate: function(a, b) {
                    return b = b || {}, b.as = "boolean", _functionize(a, b)
                },
                asIter: function(a, b) {
                    return b = b || {}, b.as = "iterator", _functionize(a, b)
                },
                fnize: (function () {
                    var __cache={}
                    function createScopedfn(obj,fnnm,args){
                        if (obj && typeof(obj[fnnm]) == "function") {
                            if (args && args.length) {
                                return function (nm, a) {
                                    this[nm].apply(this, a.concat([].slice.call(arguments,3)))
                                }.bind(obj, fnnm, args)
                            }
                            return obj[fnnm].bind(obj)
                        }
                    }
                    function cacheAndReturn(str,fn,optns){
                        if(!(optns && (optns.context||optns.nocache))){
                            __cache[str]=fn
                        }
                        return fn;
                    }
                    return function fnize(fn0, opns0) {
                        var res = null, optns = {}, fn = fn0
                        if (opns0) {
                            if (opns0.context || opns0.ctx) {
                                optns.scope = opns0.context || opns0.ctx;
                                delete optns.ctx;
                                delete optns.context
                            }
                            if (typeof(opns0) == "object") {
                                if (Object.getPrototypeOf(opns0) === Object.prototype) {
                                    optns = opns0
                                }
                                else {
                                    optns.scope = opns0
                                }

                            }
                        }
                        if (typeof(fn0) == "function") {
                            return fn0
                        }
                        if (fn instanceof RegExp) {
                            return RegExp.prototype.test.bind(fn)
                        }
                        if (typeof(fn) == "string") {
                            if (  __cache[fn] && !optns.scope) {
                                return __cache[fn]
                            }
                            var fnnm = fn.trim(), args = []
                            if (fnnm.indexOf("function") == 0) {
                                return (1, eval)("(" + fnnm + ")");
                            }
                            var arr = fnnm.match(/^([\w\.\_]+)\(([^\)]*)\)/)
                            if (arr && arr.length>1) {
                                fnnm = arr[1]
                                args = String(arr[2] || "").split(",").map(function (a) {
                                    return a.trim()
                                })
                            }
                            if (fnnm == "dump" || fnnm == "print") {
                                fnnm = "log"
                            }
                            var fntn=createScopedfn(console,fnnm,args)||createScopedfn(optns.scope,fnnm,args)||createScopedfn(self,fnnm,args);
                            if(fntn){
                                return cacheAndReturn(fn0,fntn,optns);
                            }


                            var strarr = ["Math", "String", "Number", "window", "Object", "document"];
                            [Math, String, Number, window, Object, document].forEach(
                                function (obj, i) {
                                    if (fnnm in obj && typeof(obj[fnnm]) == "function") {
                                        if (fnnm != fn) {
                                            var ex = Util.inspectExpr(fn) || {}, vars = ex.vars || [];
                                            if (!vars.length) {
                                                //vars.push ("it")
                                                res = Function(vars.join(","), "return " + (strarr[i] + "." + fn))
                                            } else {
                                                // res=obj[fn].bind (obj)
                                            }
                                        }
                                    }
                                }
                            );
                            if (!res && this && this !== Function && this !== self && fn in this && typeof(this[fn]) == "function") {
                                res = this[fn].bind(this)
                            }
                            optns.context = optns.context || optns.scope
                            if (!res && optns.context && optns.context.nodeType && fn in Element.prototype) {
                                res = Element.prototype[fn].bind(optns.context)
                            }
                            if (!res) {
                                try {
                                    /*if((1,eval)(fn) ){
                                     res=Function("it",fn.replace(/\@\.?/g,"this."))
                                     } */
                                } catch (e) {
                                }
                            }
                            if (res) {
                                return cacheAndReturn(fn0,res,optns);
                             }
                        }


                        if (arguments.length > 2) {
                            optns = {args: [].slice.call(arguments, 1)}
                        }
                        else if (typeof(opns0) == "boolean") {
                            optns = {force: true}
                        }
                        else if (Array.isArray(opns0)) {
                            optns = {args: opns0}
                        }
                        else if (opns0 && typeof(opns0) != "object") {
                            optns = {args: [opns0]}
                        }
                         if (optns.asIterator) {
                            optns.args = optns.args || []
                            if (!optns.args.length) {
                                optns.args.push("it", "i", "ctx")
                            }
                            if (!optns.args.length < 2) {
                                optns.args.push("i")
                            }
                        }
                        optns = optns || {}
                        var ctx = optns.context || self, fnbdy
                        if (typeof(fn) == "string") {
                            var str = fn.replace(/^\s*FN\|/, "").trim()
                            if (  __cache[str] && !optns.context) {
                                return __cache[str]
                            }
                            if (optns.args && !Array.isArray(optns.args)) {
                                optns.args = String(optns.args).split(/\s*,\s*/)
                            } else if (!Array.isArray(optns.args)) {
                                optns.args = []
                            }
                            if (/^\(?function/.test(str)) {
                                str = str.trim()
                                str = str.replace(/^\(|\)$/g, "").trim()
                                res = (1, eval)("(" + str + ")")
                            } else if (!/[^\w_]/.test(str)) {
                                if (str.indexOf(".") > 0) {
                                    res = str.split(/\./).reduce(function (m, it) {
                                        return m ? m[it] : null
                                    }, self);
                                }
                            }
                            if (!((typeof(res) == "function") || fnbdy)) {
                                if (str == "it" || str == "@") {
                                    fnbdy = "it"
                                }
                                else if (optns.asboolean && !/\D/.test(str)) {
                                    fnbdy = "it == " + str;
                                }
                                else if (str.charAt(0) == ".") {
                                    fnbdy = "it" + str
                                }
                                else if (/^([><!][=]?|[\+\*\%\/]|(\- )|=|(\-\d))/.test(str)) {
                                    fnbdy = "it " + str
                                }
                                else if (/^[\w_]+$/.test(str)) {
                                    if (!optns.asboolean && /^[a-z]/i.test(str)) {
                                        if(optns.args.indexOf(str)>=0){
                                            res=Function(optns.args.join(","),"return "+str)
                                            res.vars=optns.args.slice();
                                        }
                                        else{fnbdy = "it." + str;}
                                    } else if (optns.asboolean) {
                                        fnbdy = "it =='" + str + "'";
                                    }
                                } else if (optns.force) {
                                    //fnbdy = str
                                }
                            }

                            if (!(res || fnbdy)) {
                                if (/^\s*(\([^\)]*\))?\s*\-\>/.test(str)) {
                                    var arr = str.split(/\-\>/), args = "", bdy = arr.pop().trim();
                                    if (arr.length) {
                                        args = arr[0].replace(/[\(\)\s]+/g, "")
                                    }
                                    if (args) {
                                        if (!optns.args) {
                                            optns.args = args.split(/\s*,\s*/)
                                        } else {
                                            optns.args.push(args)
                                        }
                                    }
                                    res = Function(args, bdy.indexOf("return") >= 0 ? bdy : "return " + bdy)

                                } else if (/^[jc]s:]/.test(str)) {
                                    var data = str.substr(4)
                                    if (str.charAt(0) == "j") {
                                        res = Function(data)
                                    }
                                    else {
                                        if (typeof(CoffeeScript) != "undefined") {
                                            var cx = CoffeeScript;
                                            var code = cx.compile(data, {bare: "on"});
                                            code = code.replace(/\n\s*([\w]+);\s*$/, "\nreturn $1;").replace(/return\s+return/, "return ");
                                            res = Function(code)
                                        }
                                        else if (typeof(ZModule) != "undefined") {
                                            var pr = Promise.deferred()
                                            ZModule.resource("CoffeeScript").then(function (cx) {
                                                var code = cx.compile(data, {bare: "on"});
                                                code = code.replace(/\n\s*([\w]+);\s*$/, "\nreturn $1;").replace(/return\s+return/, "return ");
                                                res = Function(code)
                                                pr.resolve(res)
                                            })
                                            if (!res) {
                                                return pr
                                            }
                                        }
                                    }
                                } else {
                                    if(/\$([a-z][\w_]*)/.test(str) && typeof($.template) != "undefined"){
                                             optns = optns || {}
                                            optns.scope = ctx
                                            res = $.template(str, optns).fn
                                     }
                                    else if (typeof($.parseExpr) != "undefined") {
                                        optns = optns || {}
                                        optns.scope = ctx
                                        res = $.parseExpr(str, optns).fn
                                    }
                                }
                            }
                            if (!res && fnbdy) {

                                fnbdy = fnbdy.replace(/^@\.?/g, "it.")
                                    .replace(/([^=])=([^=])/g, "$1 == $2")
                                    .replace(/\sand\s/g, " && ")
                                    .replace(/\sor\s/g, " || ")
                                    .replace(/``/g, '"').replace(/`/g, "'").replace(/([><!~\^\$])\s+\=/g, "$1=").replace(/([><~\^\$])\s*==/g, "$1=")
                                fnbdy = ((optns.addreturn || !/\sreturn/.test(fnbdy)) ? "return " : "") + fnbdy
                                var a = optns.args || []
                                if (a.indexOf("it") == -1 && (/\bit\b/.test(fnbdy))) {
                                    if (!a.length) {
                                        a.push("it")
                                    }
                                    else {
                                        fnbdy = "var it=this;" + fnbdy
                                    }
                                }
                                try {
                                    res = Function(a.join(","), fnbdy)
                                } catch (e) {
                                }
                            }

                        }
                        if (typeof(res) != "function" && optns.force) {
                            res = optns.boolean ?
                                (function (a) {
                                    return function (it) {
                                        return a == it
                                    }
                                }) :
                                (function (a) {
                                    return function () {
                                        return a
                                    }
                                })(fn)

                        }
                        //if(!res){ var t;try{t=eval("("+fn+")")} catch(e){};if(typeof(t)=="function"){res=t}}
                        return cacheAndReturn(fn0,res,optns);

                     }
                })(),
                toFn: function(a, b) {
                    return "string" == typeof b && (b = {
                        as: b
                    }), b = b || {}, _functionize(a, b)
                },
                async: function(a, b) {
                    var c = $.makeArray(arguments, 2),
                        d = this == self || this == self.$ ? null : this;
                    return b = Number(b) || 0,
                        function() {
                            var e = this == self || this == self.$ ? d : this,
                                f = c.concat($.makeArray(arguments)),
                                g = function(b) {
                                    a.apply(this, b)
                                }.bind(e, f);
                            return 0 === b && self.setImmediate ? self.setImmediate(g) : setTimeout(g, b)
                        }
                },
                throttle:function(callback, cnfg) {
                    return (function (callable, config) {

                        var _ = {};
                        if ($.isPlain(config)) { _ = $.clone(config) }
                        else if ($.isNumber(config)) {    _.delay = config;  }
                        else if (typeof(config) == "boolean") { _.topend = config;  }

                        if (!_.topend && (_.topEnd ||_.immediate || _.immidiate || _.immi)) {
                            _.topend =  true
                        }
                        if(!_.topend&&!_.tailend){_.tailend=true}
                        var fn=callable,
                            delay = Math.max($.isNumber(_.delay) ? _.delay : 200, 0),
                            topend = !!_.topend,
                            tailend=!!(_.tailend||_.tailEnd||_.tail),tailendPending=null,
                            val = _.defaultValue,timer= 0,preargs=[].slice.call(arguments,2);
                        function _runner() {
                            timer = null;
                            if(tailendPending ){
                                var data=tailendPending ;tailendPending=null;
                                val = fn.apply(data[0], data[1])
                                //timer = setTimeout(_runner, delay)
                            }
                        }
                        function throttled() {
                            var args=preargs.concat([].slice.call(arguments))

                            if(tailend){
                                tailendPending=[this, args.slice()]
                                //tailend=null;
                             }
                            if (!timer) {
                                if ( topend === true) {
                                    val = fn.apply(this, args)
                                    //topend = null;
                                }
                                timer = setTimeout(_runner, delay)

                            }
                            return val
                        };
                        return throttled
                    })(callback, cnfg)
                } ,
                Quebk: function() {
                    var a, b = null,
                        c = [].concat.apply([], $.makeArray(arguments)),
                        d = c[c.length - 1];
                    d && "object" == typeof d ? (b = d, c.pop()) : b = {}, a = b.context || null;
                    var e = function(b, c) {
                        return new Promise(function(c) {
                            return function(d, e) {
                                try {
                                    var f = c.call(a, b);
                                    Promise.cast(f).then(d)
                                } catch (g) {
                                    e(g)
                                }
                            }
                        }(c))
                    }, f = function g(a) {
                        c.length ? (b.progress && b.progress({
                            remaining: c.length
                        }), e(a, c.shift()).then(g)) : b.callback && b.callback.call(b.context, a)
                    };
                    return {
                        add: function(a) {
                            "function" == typeof a && c.push(a)
                        },
                        start: function(a) {
                            f(a)
                        }
                    }
                },
                Que: function() {

                    return (function (list) {
                        var optns = {}, ctx
                        if ($.isPlain(list[list.length - 1])) {
                            optns = $.clone(list.pop());
                        }
                        list = list.filter(function (a) {
                            return typeof(a) == "function"
                        })
                        var delay = Math.max($.isNumber(optns.delay) ? optns.delay : 0, 0)
                        ctx = optns.context || null

                        var lastResult, _state = -1, includeLastResult = optns.includeLastResult == null || includeLastResult === true

                        function queued() {
                            if (_state < 0) {
                                return
                            }
                            _state = 1;
                            if (arguments.length === 1) {
                                lastResult = arguments[0]
                            }
                            if (list.length) {
                                var data = list.shift(),fn,a=[]
                                if(Array.isArray(data)){fn= data[0];a=data[1]||[]}
                                else {fn= data}
                                a = includeLastResult ? [lastResult].concat(a) : a

                                var result = fn.apply(ctx, a)
                                _state = 0
                                if (result && typeof(result.then) == "function") {
                                    result.then(queued, queued)
                                } else {
                                    lastResult = result;
                                    setTimeout(queued, delay)
                                }
                            }
                        }

                        return {
                            add: function (fn, args) {
                                if (typeof(fn) == "function") {
                                    list.push([fn, (typeof(args) == "object" && args.length != null) ? [].slice.call(args) : [args]])
                                }
                                if (_state > 0) {
                                    queued()
                                }
                            },
                            start: function (a) {
                                _state = 1;
                                if (a != null) {
                                    queued(a)
                                }
                                queued();
                            },
                            stop: function (a) {
                                list.length = 0;
                            }
                        }
                    })([].slice.call(arguments))
                }
                ,
                debounce: function() {
                    function a(a) {
                        return [].slice.call(a)
                    }
                    var b = "function" == typeof setImmediate ? setImmediate : null;
                    return function(c, d) {
                        function e() {
                            i = null, l = Date.now() + h;
                            var a = k.shift();
                            a && (m.apply(a[0], g.concat(a[1])), k.length && (i = setTimeout(e, h)))
                        }
                        var f = {};
                        $.isPlain(d) ? f = $.clone(d) : $.isNumber(d) ? f.delay = d : "boolean" == typeof d && (f.topend = d), (f.topend || f.immediate || f.immidiate || f.immi) && (f.topend = f.tailend === !1);
                        var g = [].slice.call(arguments, 2),
                            h = Math.max($.isNumber(f.delay) ? f.delay : 200, 0),
                            i = ( !! f.topend, null),
                            j = f.defaultValue,
                            k = [],
                            l = 0,
                            m = c,
                            n = function() {
                                k.push([this, a(arguments)]);
                                var c = Math.max(l - Date.now(), 0);
                                return i || (i = !c && b ? b(e) : setTimeout(e, c)), j
                            };
                        return n
                    }
                }(),
                debounce2: function(a, b) {
                    var c = {};
                    "number" == typeof b ? c.delay = b : b && "object" == typeof b && Object.keys(b).forEach(function(a) {
                        c[a] = b[a]
                    }), (b === !0 || c.topend || c.immediate || c.immidiate || c.immi) && (c.topend = !(c.tailend === !0)), c.delay = isNaN(c.delay) || 1 / 0 === c.delay || c.delay === -1 / 0 ? 500 : Number(c.delay || "0") || 0;
                    var d = $.makeArray(arguments, 2),
                        e = c.topend ? 1 : 0,
                        f = Math.max(0, c.delay) || 500,
                        g = a,
                        h = null,
                        i = [],
                        j = c.ctx || (this == self || this == self.$ ? null : this),
                        k = Date.now() + (e ? 0 : f);
                    return function() {
                        i.push({
                            a: d.concat($.makeArray(arguments)),
                            c: this == self || this == self.$ ? j : this
                        }), h || (h = setTimeout(function a() {
                            var b, c = Date.now();
                            return k - c > 50 ? void(h = setTimeout(a, k - c)) : (b = i.shift(), b && b.a && g.apply(b.c, b.a), k = c + f, h = null, e ? (e = 0, h = setTimeout(a, f)) : i.length && setTimeout(a, f), void(e = 0))
                        }, 1 === e ? 0 : f))
                    }
                },
                asCallable: function(a, b) {
                    var c = [].concat.apply([], [b || ""]);
                    if ("function" == typeof a) return a;
                    if ("string" == typeof a) {
                        var d = c.indexOf("it") ? "it" : "this",
                            e = /\sreturn/m.test(a) ? "" : "return ";
                        return Function(b.join(","), e + a.replace(/@/g, d + "."))
                    }
                    return function() {
                        return this.val
                    }.bind({
                            val: a
                        })
                },
                 proxy:function(fn,scope){return fn.bind(scope)},
                makeProxy: function(a) {
                    var b = a,
                        c = {}, d = [],
                        e = arguments[1],
                        f = arguments[2] === !0,
                        g = arguments[4],
                        h = arguments[3] === !0 ? !0 : !1;
                    for (g = "function" != typeof g ? function(a) {
                        return a
                    } : g, null == e && (e = Object.create(null)), e.___proto || ($.defineProperty(e, "___proto", {
                        value: a,
                        writable: !1,
                        enumerable: !1,
                        configurable: !1
                    }), $.defineProperty(e, "valueof", {
                        value: function() {
                            return this.___baseel
                        },
                        writable: !1,
                        enumerable: !1,
                        configurable: !0
                    })); b && ("object" == typeof b || "function" == typeof b) && b != Object.prototype;) {
                        for (var i, j = 0, k = Object.keys(b), l = k.length; i = k[j], l > j; j++)~ d.indexOf(i) || i in e || d.push(i);
                        b = Object.getPrototypeOf(b)
                    }
                    for (var i, j = 0, k = d, l = k.length; i = k[j], l > j; j++)
                        if ("string" == typeof i && "el" != i && 0 != i.indexOf("__")) {
                            var m, n = Object.getOwnPropertyDescriptor(a, i) || {}, o = function() {};
                            "function" == typeof a[i] || "value" in n && "function" == typeof n.value ? ! function(a, b, c) {
                                var d = Function.prototype.apply.bind(b);
                                m = f ? h ? function() {
                                    for (var a, b = [], c = [].map.call(arguments, o), e = 0, f = this, g = f.length; g > e; e++)(a = f[e]) && "object" == typeof a && b.push(d(a.___proto, [a].concat(c)));
                                    return b
                                } : function() {
                                    return d(this.___proto, [this].concat([].map.call(arguments, o)))
                                } : h ? function() {
                                    for (var a, b = [], c = [].map.call(arguments, o), e = 0, f = this, g = f.length; g > e; e++)(a = f[e]) && "object" == typeof a && b.push(d(o(a), c));
                                    return b
                                } : function() {
                                    return d(o(this), [].map.call(arguments, o))
                                }, m._name = a;
                                for (var e, g = 0, i = Object.keys(b), j = i.length; e = i[g], j > g; g++) e && (m[e] = b[e]);
                                c[a] = {
                                    value: m,
                                    enumerable: !! n.enumerable
                                }
                            }(i, "function" == typeof a[i] ? a[i] : n.value, c) : ! function(a, b) {
                                var c = a,
                                    d = h ? function(a) {
                                        [].forEach.call(this, function(b) {
                                            b && (b[c] = a)
                                        })
                                    } : function(a) {
                                        (this.___baseel || this.___proto || {})[c] = a
                                    }, e = h ? function() {
                                        return [].map.call(this, function(a) {
                                            return (a || {})[c]
                                        })
                                    } : function() {
                                        return (this.___baseel || this.___proto || {})[c]
                                    };
                                b[c] = {
                                    get: e,
                                    set: d,
                                    enumerable: !0
                                }
                            }(i, c)
                        }
                    return Object.defineProperties(e, c), e
                },
                mutationRecord: function(name, value, oldValue, object) {
                    return {
                        name: name,
                        value: value,
                        newValue: value,
                        oldValue: oldValue,
                        object: object,
                     }
                },
                mutationRecordGen: function(object, qname) {
                    return function(name, value, oldValue) {
                        return {
                            name: name,
                            value: value,
                            newValue: value,
                            oldValue: oldValue,
                            object: object,
                            qname: qname
                        }
                    }
                },
                mutationRecordGenWithName: function(object, name, qname) {
                    qname = qname || name
                    var cachedOldvalue=null
                    return    function(value, oldValue) {
                             var toret= {
                                name: name,
                                value:  value,
                                newValue: value,
                                oldValue: cachedOldvalue,
                                object: object,
                                qname: qname
                            }
                        if(arguments.length>1){
                            toret.oldValue=cachedOldvalue = arguments[1];
                        } else{cachedOldvalue=value}
                        return toret;
                        }
                },
                resolveProperty: function(a, b, c) {
                    if (1 == arguments.length && "string" == typeof a && (b = a, a = self), !a || "object" != typeof a || !b || "string" != typeof b) return null;
                    if (($.isElement(a) || a.isDomWrap) && typeof($d)!="undefined") return "value" === b ? $d.val(a) : $d.prop(a, b);
                    var d = a,
                        e = b;
                    if ("string" == typeof b && b.indexOf(".") > 0) {
                        var f = b.split(".");
                        e = f.pop(), d = f.reduce(function(a, b) {
                            return a && "object" == typeof a ? $.resolveProperty(a, b) : null
                        }, a)
                    }
                    if (d && "object" == typeof d) {
                        if (!c) {
                            if ("function" == typeof d.get) return d.get(e);
                            if ("function" == typeof d.getItem) return d.getItem(e)
                        }
                        return d[e]
                    }
                    return null
                },


                updateProperty: function(a, b, c, d) {
                    if (a) {
                        if (($.isElement(a) || a.isDomWrap) && typeof($d)!="undefined") return "value" === b ? $d.val(a, c) : $d.prop(a, b, c);
                        var e = a,
                            f = b;
                        if ("string" == typeof b && b.indexOf(".") > 0) {
                            var g = b.split(".");
                            f = g.pop(), e = g.reduce(function(a, b) {
                                return a && "object" == typeof a ? (null == a[b] && (a[b] = {}), a[b]) : null
                            }, a)
                        }
                        if (e && "object" == typeof e) {
                            if (!d) {
                                if ("function" == typeof e.set) return e.set(f, c);
                                if ("function" == typeof e.setItem) return e.setItem(f, c)
                            }
                            e[f] = c
                        }
                        return a
                    }
                },
                destroyObject:function(obj){
                    if(!obj){return}
                    var data=$.objectMap.get(obj,"_watcher_")
                     if (data  && data.props ) {
                       for(var name in data.props){
                           if(data.props[name] && data.props[name].length){
                               for(var i= 0,l=data.props[name],ln= l.length;i<ln;i++) {
                                   if(l[i] && l[i].off) {
                                       l[i].off()
                                   }
                               }
                           }
                       }


                     }
                    $.objectMap.remove(obj);
                  },

                watchProperty : function() {
                    function a(a, b, d) {
                        c || (c = $.isPlain);
                        var e = "function" == typeof d ? d : d.validator;
                        if (a && ("function" == typeof a || "object" == typeof a)) {
                            d = d || {};
                            var f, g = $.objectMap.getOrCreate(a, "_watcher_");
                            g.props || (g.props = {});
                            var h = g.props[b] || (g.props[b] = []),
                                i = h.find(function(a) {
                                    return a.id && a.id === d.id
                                });
                            if (i || (h.push(i = $.extend({
                                    fn: e
                                }, d)), i.prop = b, i.off = function() {
                                    var a = h.indexOf(i);
                                    a >= 0 && h.splice(a, 1), h.length || h.off()
                                }), !h.handle) {
                                h.handle = defHandle.bind(h), f = h.handle;
                                var j, k = d.args;
                                if ($.is.element(a)){ $.onAttach(a, function(c) {
                                    "value" == b && a.type ? (j = $d.on(a, "change", function() {
                                        f($d.val(this))
                                    }), h.off = $d.off.bind($d, a, f)) : (j = $d.watchMutation(c, b, f), h.off = $d.watchMutation.bind($d, a, !1))
                                });
                                } else if ("function" == typeof a.getController && a.getController().hasMethod(b)) {
                                    var l = a.getController().invoke(b, $.isArray(k) ? k : k ? [k] : []);
                                    l ? l.isPromise ? l.then(f) : f(l) : j = f(l)
                                } else "function" == typeof a.onchange ? (j = a.onchange(b, f, d), h.off = a.onchange.bind(a, b, !1, f)) : a.properties ? (j = a.properties.onchange(b, f), h.off = a.properties.onchange.bind(a.properties, b, !1, f)) : "function" == typeof a.onpropertychange ? (j = a.onpropertychange(b, f, d), h.off = a.onpropertychange.bind(a, b, !1, d)) : "function" == typeof a.on ? (j = a.on(b, f, d), h.off = a.off.bind(a, b, !1, d)) : j = $.defineAccessors(a, b, d)
                            }
                            if (b in a && null != a[b]) {
                                var m = a[b];
                                e(m)
                            }
                            return h
                        }
                    }

                    function b(b, c, d, e) {
                        function f(a) {
                            var b = m(a);
                            return b.oldValue != b.newValue && (b.memo = l, k(b)), a
                        }
                        var g = {
                            enumerable: !0,
                            configurable: !0
                        };
                        if (e === !0 ? g.enumerable = !0 : e && "object" == typeof e && $.extend(g, e), arguments[4] === !0 && (g.configurable = !0), d !== !1) {
                            if (arguments[5] === !0 && (g.noAsync = !0), g.id || (g.id = $.UUID()), b && "string" == typeof c) {
                                "object" != typeof b && "function" != typeof b && (b = Object(b));
                                var h = self.setImmediate || (self.setImmediate = function(a) {
                                        return setTimeout(a, 0)
                                    });
                                if (g.overwrite && c in b) try {
                                    delete b[c]
                                } catch (i) {
                                    if (c in b) return void console.log("this property is not configurable", c )
                                }
                                var j, k = g.noAsync === !0 ? d : h.bind(self, d.bind(b)),
                                    l = g.memo,
                                    m = g.recordGenerator || $.mutationRecordGenWithName(b, c);
                                if (/[^\w_\$\.]/.test(c))! function(b, c, d, e) {
                                    j = /\$[a-z]+/.test(c) ? $.template(c) : $.parseExpr(c), j.vars && j.vars.forEach(function(c) {
                                        a(b, c, {
                                            validator: function() {
                                                var res=e(j(b))
                                                 return res
                                            },
                                            id: d.id
                                        })
                                    })
                                }(b, c, g, f,$.throttle(f, {  topend: !0,  delay: 10 }));
                                else if (c.indexOf(".") > 0) {
                                    var n = Date.now(),
                                        o = c.split(".").map(function(a, b) {
                                            return {
                                                name: a,
                                                handle: null,
                                                index: b,
                                                id: b + n
                                            }
                                        });
                                    o.push({
                                        name: "__val__",
                                        term: !0
                                    });
                                    var p = function s(b) {
                                        var c, d = arguments.length;
                                        return d > 1 && (c = arguments[1]), !o[b] || o[b].term ? f(c) : ("function" == typeof c && (c = c.call(this)), c && "object" == typeof c && (o[b].handle = a(c, o[b].name, {
                                            id: String(b + n),
                                            validator: s.bind(c, b + 1)
                                        }))), c
                                    };
                                    p(0, b)
                                } else a(b, c, $.extend({
                                    validator: f
                                }, g)); if (j) try {
                                    j(b)
                                } catch (i) {}
                                return b
                            }
                        } else {
                            var q = $.objectMap.get(b, "watcher");
                            if (q && q.props && q.props[c] && q.props[c].length && g.id) {
                                var r = q.props[c].find(function(a) {
                                    return a.id === g.id && a.prop === c
                                });
                                r && r.off(g.id)
                            }
                        }
                    }
                    var c = $.isPlain;
                    return defHandlone = function(a, b) {
                        this[0] && this[0].fn && this[0].fn.call(b, a)
                    }, defHandle = function(a) {
                        var b = this,
                            d = b.length,
                            e = c(a) && "name" in a && ("newValue" in a || "oldValue" in a) ? null == a.value ? a.newValue : a.value : a;
                        if (1 == d) return this[0].fn && this[0].fn(e);
                        for (var f = 0; d > f; f++) b[f] && b[f].fn && b[f].fn(e)
                    }, b
                }(),
                defineAccessors: function() {
                    function a(a, b, c, d) {
                        var e = 0,
                            f = a,
                            g = c,
                            h = "function" == typeof b ? b : function(a, b, c) {
                                return c
                            }, i = d.set,
                            j = d.get,
                            k = Object.is;
                        return {
                            get: null === j ? function() {
                                return g
                            } : function() {
                                if (1 === e) return g;
                                e = 1;
                                try {
                                    g = j()
                                } catch (a) {
                                    console.log("error getter:")
                                } finally {
                                    e = 0
                                }
                                return g
                            },
                            set: function(a) {
                                if (1 !== e && !k(g, a)) {
                                    e = 1;
                                    try {
                                        g = h(f, g, a), null !== i && i(g)
                                    } catch (b) {
                                        console.error("error setter:"   )
                                    } finally {
                                        e = 0
                                    }
                                }
                            }
                        }
                    }
                    return function(b, c, d) {
                        d = d || {}, "function" == typeof d && (d.validator = d);
                        var e = $.getPropertyDescriptor(b, c) || {};
                        if (e && e.configurable === !1) {
                            if (d.quiet || null == d.quiet) return;
                            throw "property " + c + " is not configurable"
                        }
                        var f;
                        e.get = "function" != typeof e.get ? null : e.get.bind(b), e.set = "function" != typeof e.set ? null : e.set.bind(b), f = "value" in e ? e.value : b[c], delete b[c];
                        var g = a(c, d.validator, f, e, b);
                        return g.configurable = null == d.configurable ? e.configurable : !! d.configurable, g.enumerable = null == d.enumerable ? !0 : !! d.enumerable, delete g.writable, $.defineProperty(b, c, g), g
                    }
                }(),
                 defineLazyProperty: function (holder, nm, propconfig) {
                     var slf = this
                     if ($.isArray(nm)) {
                         nm.forEach(function (it) {
                             this.defineLazyProperty(holder, it, propconfig)
                         }, slf);
                         return
                     }
                     if(nm in holder){  delete holder[nm]  }
                     if(nm in holder){  return }

                     (function(config,object,name){
                         var cnfig={name:name,descriptor:{configurable:config.configurable,enumerable:!!config.enumerable,writable:!!config.writable}};
                         cnfig.provider = typeof(config) == "function" ? config : config.provider ? (config.provider || config.provider.get) : null

                         if (typeof(cnfig.provider) != "function") {
                             cnfig.provider = null;
                         }
                         function redefine(v){
                             var v=arguments.length?arguments[0]:cnfig.provider?cnfig.provider.call(this,cnfig.name):null
                             if(v==null){return}
                             delete this[cnfig.name];
                             cnfig.descriptor.value=v
                             $.defineProperty(this,cnfig.name,cnfig.descriptor)
                             return v
                         };
                         $.defineProperty(object,name,{
                             get:redefine, set:redefine,configurable:true,enumerable:!!config.enumerable
                         })
                     })(propconfig||{},holder,nm);
                     return holder;
                 },
                trompoline: function() {
                    return function() {}
                },
                throttleOnce: function() {
                    function a(a, b) {
                        function c() {
                            var d = j();
                            e = null, f && f > d ? e = setTimeout(c, f - d + b) : a.apply(i, h)
                        }

                        function d() {
                            i = this, h = g.concat([].slice.call(arguments)), f = j() + b, e = e || setTimeout(c, 2 * b)
                        }
                        var e = null,
                            f = 0,
                            g = [].slice.call(arguments, 2),
                            h = [],
                            i = null,
                            j = Date.now || function() {
                                    return +new Date
                                };
                        return d
                    }
                    return a.apply(this, arguments)
                },
                throttleq: function(a, b) {
                    var c = {};
                    "number" == typeof b ? c.delay = b : b && "object" == typeof b && Object.keys(b).forEach(function(a) {
                        c[a] = b[a]
                    });
                    var d, e = !1,
                        f = [],
                        g = c.tailend;
                    return (b === !0 || c.topend || c.immediate || c.immidiate || c.immi) && (e = c.tailend === !1), d = isNaN(c.delay) || 1 / 0 === c.delay || c.delay === -1 / 0 ? 500 : Number(c.delay || "0") || 0, d = Math.max(0, d) || 50, f = [].slice.call(arguments, 2),
                        function(a, b) {
                            function c() {
                                if (h.a) {
                                    var c = h.a.slice();
                                    h.a = null, e = a.apply(h.c, c), d(b.tailend)
                                }
                            }

                            function d(a) {
                                g = setTimeout(function() {
                                    g = null, a && c()
                                }, b.delay)
                            }
                            var e = null,
                                f = 0,
                                g = null,
                                h = {
                                    a: null
                                };
                            return function() {
                                return h.__id = ++f, (b.tailend || !g) && (h.a = b.initargs.concat([].slice.call(arguments)), h.c = this == self || this == self.$ ? b.ctx : this), g || (1 == f && b.topend ? c() : d(!0)), e
                            }
                        }(a, {
                            delay: d,
                            initargs: f,
                            tailend: g,
                            topend: e,
                            ctx: c.ctx || (this == self || this == self.$ ? null : this)
                        })
                },
                getMethods: function(a, b) {
                    var c = {};
                    return Object.keys(c = getPropList(a, !b)).reduce(function(a, b) {
                        return c[b].isMethod && (a[b] = c[b]), a
                    }, {})
                },
                getProperties: function(a, b) {
                    var c = {};
                    return Object.keys(c = getPropList(a, !b)).reduce(function(a, b) {
                        return !c[b].isMethod && (a[b] = c[b]), a
                    }, {})
                },
                getAllProperties: function(a, b, c) {
                    return getPropList(a, b, c)
                },
                 capitalize: function(a) {
                     if(!(a && typeof(a)=="string")){return ""}
                     return a.charAt(0).toUpperCase()+ a.substr(1)
                 },
                titleize: function(a) {
                    if(!(a && typeof(a)=="string")){return ""}
                    return String(a).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_\-]/g, " ").split(/\s+/).map(function(a) {
                        return a ? a.charAt(0).toUpperCase() + a.substr(1) : ""
                    }).join(" ").trim()
                },
                cursorPosition: function(a, b) {
                    b = b || {};
                    var c = document,
                        d = c.documentElement,
                        e = c.body;
                    return b.x = null != a.pageX ? a.pageX : a.clientX + (d.scrollLeft ? d.scrollLeft : e.scrollLeft), b.y = null != a.pageY ? a.pageY : a.clientY + (d.scrollTop ? d.scrollTop : e.scrollTop), b
                },
                LZW: {
                    encode: function(a) {
                        for (var b, b, c = {}, d = (a + "").split(""), e = [], f = d[0], g = 256, h = 1, i = d.length; b = d[h], i > h; h++) f + b in c ? f += b : (e.push(f.length > 1 ? c[f] : f.charCodeAt(0)), c[f + b] = g, g++, f = b);
                        e.push(f.length > 1 ? c[f] : f.charCodeAt(0));
                        for (var h = 0, j = e.length; j > h; h++) e[h] = String.fromCharCode(e[h]);
                        return e.join("")
                    },
                    decode: function(a) {
                        for (var b, c = {}, d = (a + "").split(""), e = d[0], f = e, g = [e], h = 256, i = 1, j = d.length; j > i; i++) {
                            var k = d[i].charCodeAt(0);
                            b = 256 > k ? d[i] : c[k] ? c[k] : f + e, g.push(b), c[h] = f + (e = b.charAt(0)), h++, f = b
                        }
                        return g.join("")
                    }
                },
            observe : function observe(obj1, optns, callback1) {
                if (!(obj1 && (typeof(obj1) == "object" || typeof(obj1) == "function"))) {
                    return
                }
                var options={}
                var remove=optns===false||callback1===false;
                if (typeof(optns) == "function") {
                    var tmp=callback1
                    callback1 = optns;
                    if(tmp!=null){optns=tmp}
                }

                if(optns===true){options.acceptList=["update"]}
                 else if ($.isPlain(optns)) {
                    Object.assign(options,optns)
                }
                if(!callback1 && options.callback){
                    callback1=options.callback;
                }
                if(options.onlyupdates){
                    options.acceptList=["update"]
                }
                var map=$.objectMap.getOrCreate(obj1,"_objobserver")

                if(!map.ondestroy){
                    map.ondestroy=function(obj){
                        Object.unobserve(obj,this.callback);
                        this.callback=null;
                    }
                }
                if(remove && typeof(callback1)=="function"){
                    if(map.listeners && map.listeners.indexOf(callback1)>=0){
                        map.listeners.splice(map.listeners.indexOf(callback1),1);
                        if(!map.listeners.length && map.callback){
                            Object.unobserve(obj1,map.callback);
                            map.callback=null;
                        }
                    }
                    return
                }

                optns=optns||{}


                if(!map.listeners){map.listeners=[]}
                if(!map.callback){
                    map.callback=function(recs){
                        var objmap=null
                        if(!Array.isArray(recs)){recs=[recs]}
                        var data=[]
                        if(recs && recs.length){
                            recs.forEach(function(a){
                                if(!(a && a.name)){return}
                                if(!objmap && a.object){
                                    objmap=$.objectMap.getOrCreate(a.object,"_objobserver")
                                }
                                var ret={type: a.type,name: a.name,object: a.object,oldValue: a.oldValue,newValue: a.newValue,value: a.newValue||a.value}
                                if(!(ret.type=="remove" || ret.type=="delete")){
                                    var val=ret.newValue||ret.value
                                    if(typeof(val) === "undefined" && ret.object){
                                        val= ret.object[ret.name];
                                    }
                                    ret.value=ret.newValue=val;
                                }
                                data.push(ret)
                            });
                            if(objmap  && objmap && objmap.listeners && map.listeners.length){
                                objmap.listeners.forEach(function(fn){
                                    typeof(fn)=="function" && fn(data);
                                })
                            }
                        }

                    }
                    if ($.is.element(obj1) && typeof($d)!="undefined") {
                        if($d.isFormInput(obj1) && optns=="change"){
                            return $d.on(obj1, "change",map.callback)
                        }
                        return $d.watchMutation(obj1, options, map.callback)
                    }
                    else {
                        Object.observe(obj1, map.callback,options.acceptList||undefined)
                        var noti=Object.getNotifier(obj1)||{}
                        if(typeof(noti.scan)!="function"){
                            noti.scan=function(){}
                        }
                    }
                }
                typeof(callback1)=="function" && map.listeners.indexOf(callback1)==-1 && map.listeners.push(callback1)
                return obj1
            },
            lazyInit:function(klass,initPars){
                return function(){
                    return new klass(initPars)
                }
            },
            isModel:     function isModel(obj) {
                return obj && (obj.__model ||obj.__record__ ||obj.__isModel ||obj.isModel) && typeof(obj.get)=="function" && typeof(obj.set)=="function";
            }

            })


            $.defineLazyProperty($, "typeInfo", {
                provider: function() {
                    return "undefined" != typeof Data && Data.TypeInfo ? Data.TypeInfo : null
                }
            })
        } catch (e) {
            $.handleEx(e)
        }
    })($);

//---Module linkedmap-----
$.iterable = function (iterator,config) {
    var _iterator=iterator
    config=config||{}
    var proto = {
        each:function(data,f, ctx){
            var fn= $.fnize(f)
            _iterator(data,fn, ctx||this)
        },
        keys:function(data ){
            var ret=[]
            _iterator(data,function(v,k){
                ret.push(k)
            });
            return ret
        },
        values:function(data ){
            var ret=[]
            _iterator(data,function(v,k){
                ret.push(v)
            });
            return ret
        },
        map:function(data,f ){
            var ret=[],fn= $.fnize(f,{args:["value","key"]})
            _iterator(data,function(v,k){
                ret.push(fn.call(this,v,k))
            },this);
            return ret
        },
        toJSON:function(data ){

            return JSON.stringify(this.toMap())
        },
        toMap:function(data){
            var ret={}
            _iterator(data,function(v,k){
                ret[k]=v
            });
            return ret
        },
        has:function(data,val ){
            var ret=false,tochk=config.keyAsValue
            _iterator(data,function(v,k){
                if(ret){return false}
                ret=(tochk?k:val) === k
            });
            return ret
        },
        size:function(data  ){
            var ret=0
            _iterator(data,function( ){ ret++ });
            return ret
        },
        entries: function (data) {
            var r = []
            _iterator(function (v, k) {
                var A=[k, v];
                A.key=k;A.value=v
                r.push(A)
            })
            return r
        },
        find : function (data,f ,returnaskeyval) {
            var ret=null,fn= $.fnize(f,{args:["value","key"]})
            _iterator(data,function(v,k){
                if(ret!==null){return}
                if(fn.call(this, v,k, data)){ret= returnaskeyval===true?{key:k,value:v}:v ; return config.returnToExit}
            }, this);
            return ret
        },
        some : function (data,f , ctx) {
            var ret=null,fn= $.fnize(f,{args:["value","key"]})
            _iterator(data,function(v,k){if(ret){return}
                if((ret= fn.call(this, v,k, data))){return config.returnToExit}
            }, ctx||this);
            return ret
        },
        overlay: function (data,nuentries) {
            var map={}
            if(Array.isArray(nuentries)){
                nuentries.forEach(function(a){
                    if(Array.isArray(a)){map[a[0]]=a[1]}
                    else if(a && a.key !=null){map[a.key]= a.value}

                })
            } else{map=nuentries}
            $.each(map,function(v,k){
                this.set(k,map[k])
            },data)
            return this

        },
        clear: function (data,nodestroy) {var I=this.__inner()
            _iterator(data,function(v,k){
                this.remove(k )
            },this);
            return this
        },
        every : function (data,f , ctx) {
            var ret=true,fn= $.fnize(f,{args:["value","key"]})
            _iterator(data,function(v,k){
                if(!ret){return}
                if(!(ret= fn.call(this, v,k, data))){return config.returnToExit}
            }, ctx||this);
            return ret
        },
        reduce : function (data ,f ) {
            var ths = data, Nill = {}, val = arguments.length == 2 ? Nill : arguments[2], ctx=arguments[3]||null
                ,fn= $.fnize(f,{args:["holder","value","key"]})
            _iterator(data,function(v,k){
                if (val === Nill) {
                    val = v
                } else {
                    val = fn.call(this, val, v, k, data)
                }
            }, ctx||this)
            return val
        } ,
        sortBy  : function (data ,f, ctx) {
            var tuples=[],mutate,fn= $.fnize(f,{args:["a","b"]})
            if(ctx===true){mutate=true;ctx=null}
            _iterator(data,function(v,k){
                tuples.push({key:k,value:v})
            }, ctx||this);
            tuples.sort(fn)
            if(mutate){
                 tuples.forEach(function(T,i){
                     T.index=i
                    this.set(T)
                },data)
                //this.overlay?this.overlay(tuples):(this.update?this.update(tuples):null);
                return data
            } else {
                return this.newInstance?this.newInstance(tuples):this
            }
        },
        findAll  : function (data ,f, ctx) {
            var ret=[] ,res,mutate,fn= $.fnize(f,{args:["value","key"]})
            if(ctx===true){mutate=true;ctx=null}
            _iterator(data,function(v,k){
                if(res = fn.call(this, v,k, data)){ret.push([k,v])}
            }, ctx||this);
            if(mutate){
                this.clear && this.clear();
                this.overlay?this.overlay(ret):(this.update?this.update(ret):null);
                return this
            } else {
                return this.newInstance?this.newInstance(ret):this
            }
         }


    }

    proto.filter=proto.findAll
    return proto
}
$.iterable.augment=function( proto,propname,dataprop){
    var _iterable=$.iterable()
    var P=propname||"___iterable";
    var D=dataprop||"this"
    for(var i=0,l=Object.keys(_iterable),ln=l.length;i<ln;i++){
        var k=l[i]
        if(typeof(_iterable[k])=="function" && !proto[k]){
            proto[k]=Function("var iter=this."+P+";return iter && iter['"+k+"'].apply(this,["+D+"].concat([].slice.call(arguments)))")
        }
    }
}
$.LinkedMap = (function () {
    var _setup = null, LinkedMap = null,returnToExit={}
    var _iterable=$.iterable(
        function(data,fn,ctx){
            var I = data.__inner();
            var v = I.V, l = I.K;
            for (var i = 0, ln = l.length; i < ln; i++) {
                if(fn.call(ctx, v[i], l[i], data )===returnToExit){break}
            }
        },
        {returnToExit:returnToExit}
    );
    function _getctor() {
        if (!LinkedMap) {

            _setup = true
            var proto = {
                _init: function (iterable) {
                    var __innerdata = {K: [], V: []};
                    this.__inner = function () {
                        return __innerdata
                    };
                    if (iterable && iterable.length) {
                        for (var i = 0, l = iterable, ln = l.length; i < ln; i++) {
                            if (l[i] && l[i].length === 2) {
                                this.set(l[i][0], l[i][1])
                            }
                        }
                    }
                },
                get: function (o) { var I=this.__inner()
                    return I.V[I.K.indexOf(o)]
                },

                set: function (o, val,idx) {var I=this.__inner()
                    var i, curr = null;
                    if(arguments.length==1 && o && typeof(o)=="object"){
                        if(Array.isArray(o)){
                            val=o[1]
                            idx=o[2]
                            o=o[0]
                        } else{
                            val= o.value
                            idx= o.index
                            o= o.key

                        }
                    }
                    if(typeof(idx)=="number" && isFinite(idx)){
                        i=idx;
                        if(i<0){i= Math.max(I.K.length+i,0)}
                        I.K[i] = o;
                    } else{
                        i = I.K.indexOf(o)
                    }

                    if (i < 0) {
                        i = I.K.push(o) - 1
                    } else {
                        curr = I.V[i]
                    }
                    I.V[i] = val;
                    return curr
                },
                remove: function (o) {var I=this.__inner()
                    var l = I.K, i = I.K.indexOf(o) , curr = null;
                    if (i >= 0) {
                        l.splice(i, 1);
                        curr = (I.V.splice(i, 1) || [])[0];
                    }
                    return curr;
                },
                "delete": function (o) {
                    return this.remove(o);
                }
            }
            $.iterable.augment(proto)

            LinkedMap = $.createClass(function LinkedMap(iterable) {
                if (!(this instanceof LinkedMap)) {
                    return new LinkedMap(iterable)
                }
                this.___iterable=_iterable;
                var obj = null;
                if (iterable && typeof(iterable) == "object") {
                    obj = iterable;
                    if (iterable instanceof LinkedMap) {
                        obj = iterable.entries()
                    } else if (!iterable.length) {
                        obj = [];
                        $.each(iterable, function (v, k) {
                            obj.push([k, v])
                        })
                    }
                }
                this._init(obj)
            },proto)

        }
        return LinkedMap
    }

    return function (data) {
        if (!_setup) {
            _getctor()
        }
        return new LinkedMap(data)
    }


})();

try {
    $.objectMap = new WeakMap();
} catch(e){$.handleEx(e);
    $.objectMap=(function() {
        var __data = [], ln = 0
        function _find(k, createifnot) {
            var ret = null
            if (k == null) { return }
            for (var i = 0; i < ln; i++) {
                if (__data[i].k === k) {
                    ret = __data[i];
                    ret.idx = i;
                    break;
                }
            }
            if (ret === null && createifnot === true) {
                ln = __data.push(ret = {k: k, v: null,idx:__data.length})
            } else if (ret && createifnot === false) {
                __data.splice(ret.idx, 1)
                ln = __data.length
                for (var i = 0; i < ln; i++) {__data[i].idx = i;}
                var old = ret.v

                delete ret.v;delete ret.o;  delete ret.k
                ret = null
                return old
            }
            return ret;
        }

        return {
            get: function (k) {
                return (_find(k) || {}).v
            },
            set: function (k, v) {
                if (v === null) { return _find(k, false) }
                var curr = _find(k, true);
                if(curr.v===v){return v}
                curr.o=curr.v; curr.v = v;
                return curr.o
            },
            has: function (k) {
                return _find(k);
            },
            "delete": function (k) {
                return _find(k, false);
            }
        }
     })()
 }
$.objectMap.getOrCreate = (function () {
    var memkey = null, memval = null,meminitkey=null
    return function (ctx, initkey) {
        if (ctx == null || !(typeof(ctx) == "object"|| typeof(ctx) == "function")) {
            throw new TypeError("Only objects for Weakmnap")
        }
        if (memval && memkey === ctx ) {
            if(initkey && memval[initkey]==null){memval[initkey]=Object.create(null)}
            return initkey ? memval[initkey] : memval
        }

        var nu = this.get(ctx);
        nu || (this.set(ctx, nu = Object.create(null)));
        if (initkey && !(initkey in nu)) {
            nu[initkey] = Object.create(null)
        }
        memkey = ctx;
        memval = nu;
        meminitkey=initkey;
        return initkey ? nu[initkey] : nu;
    }
})();


$.browser=(function sniff() {
        var userAgent=navigator.userAgent;
        var data={},alias={Edge:"IE",MSIE:"IE",Trident:"IE",IEMobile:"Mobile","Mac OS":"Mac",Firefox:"Mozilla"},Safarialts=["bb10","playbook","chrome","fire","opera"] ;
        (userAgent.match(/\b(Linux|PhantomJS|Macintosh|Mac OS|Edge|Chrome|Opera|Firefox|WebKit|iPad|iPhone|Trident|Fire|iPod|Android|BB10|PlayBook|MSIE|Android|Mobile|IEMobile|Touch|Windows)/g)||[]).forEach(function(k){
            data[k ]=data[k.toLowerCase()]=true;
            if(alias[k]){data[alias[k].toLowerCase()]=data[alias[k]]=true;}
        });
        data.firefox && (data.gecko=true);
        if(userAgent.indexOf("Safari")>0 && !Safarialts.some(function(a){return data[a]})){
            data.safari=true
        }
        if(data.msie){
            data.version=Number((userAgent.match(/MSIE\s+([\d\.]+)/)||["",""])[1].split(".").slice(0,2).join("."))||(userAgent.match(/rv:([\d\.]+)/)||["",""])[1].split(".").slice(0,2).join(".")

        } else if(data.chrome){
            data.version=Number((userAgent.match(/Chrome\/([\d\.]+)/)||["",""])[1].split(".").slice(0,2).join("."))
        }
        data.version ||(data.version=Number((userAgent.match(/Version\/([\d\.]+)/)||["",""])[1].split(".").slice(0,2).join(".")))
        data.touch ||(data.touch=navigator.maxTouchPoints >0 ||   (navigator.MaxTouchPoints > 0) ||  (navigator.msMaxTouchPoints > 0))
        var fidx=(location.href||"").toLowerCase().indexOf("file");
        if(fidx>=0 && fidx<2){
            data.hostedApp=true
        }
        window.isTouchDevice=data.isTouchDevice=data.touch;
        if(document && (document.documentElement||document.body) && document.defaultView && document.defaultView.getComputedStyle){
            data.prefix=(document.defaultView.getComputedStyle(document.documentElement||document.body).cssText.match(/;\s*\-([\w]+)\-[\w\-]+\s*:/) || [""]).pop()
            data.css3pr = "-" + data.prefix + "-";
            data[data.prefix]=true
        }
        return data
    })();




self.UI = self.UI || {}

$.expando = (function (ctx) {
    var map = null;
    function link(object, key, data) {
        var s = Symbol.for('@@link:' + key);
        return arguments.length === 2 ?
            object[s] : (object[s] = data);
    }
    function _getMap(ctx,preprocessor ) {
        var nu = $.objectMap.getOrCreate(ctx, "expando");

        if (!nu.handle) {
            nu.preprocessor=typeof(preprocessor)=="function"?preprocessor:function(nm,val){return false};
            Object.defineProperty(nu,"data",{value:Object.create(null),writable:false});
            nu.getValue=function getValue(nm) {
                var v= this.preprocessor(nm) ;
                return v===false?this.data[nm]:v
            };

            nu.setValue=function setValue(nm, val) {
                if(val===null){
                    delete this.data[nm];
                    return
                }
                var v= this.preprocessor(nm,val) ;
                if(v===false) {
                    this.data[nm] = val
                }
            };



           var handle = function () {
                    var holder=($.objectMap.get(this)||{}).expando;
                    if(!holder){return}

                    var args = [] ;
                    if (arguments.length == 1 && ({}).toString.call(arguments[0]) == "[object Arguments]") {
                        args = [].slice.call(arguments[0])
                    }
                    else {
                        args = [].slice.call(arguments)
                    }

                    var argln = args.length, first;
                    if (!argln) {
                        return holder.data
                    }
                    first = args[0];
                    if (argln == 1) {
                        if (typeof(first) == "string") {
                            return holder.getValue(first)
                        }
                        if (Array.isArray(first)) {
                            return first.reduce(data, function (m, k) {
                                    if (typeof(k) == "string") {
                                        m[k] = holder.getValue(k);
                                    }
                                    return m
                                },
                                {}
                            );
                        }
                        if ($.isPlain(first)) {
                            for (var i = 0,l=Object.keys(first),ln=l.length; i < ln; i++) {
                                var nm1 = l[i], val1 = first[l[i]]
                                if (typeof(nm1) == "string") {
                                    holder.setValue(nm1,val1)
                                }
                            }

                        }
                    } else if (argln == 2 && typeof(first) == "string") {
                        holder.setValue(first,args[1])
                    } else if (argln > 2) {
                        for (var i = 0; i < argln; i++) {
                            var nm = args[i], val = args[++i]
                            if (typeof(nm) == "string") {
                                holder.setValue(nm,val)
                            }
                        }
                    }
                    return this;
                };
            nu.handle=handle
             /*$.observe(nu.handle,{onlyonchange:true},function(fn,recs){
             var r=recs.value||[]
             for(var i= 0,ln=r.length;i<ln;i++){
             fn.call(this,r[i].name,r[i].value)
             }
             }.bind(ctx,nu.handle))*/
        }
        return  nu.handle;
    }

    var ret= function Expando(ctx) {
        return _getMap(ctx)
    }
    ret.augment=function(ctx,mthdname,preprocessor){
        var fn=_getMap(ctx,preprocessor);
        if(mthdname!==null) {
            mthdname = mthdname || "data"
            ctx[mthdname] = fn;
        }
        return  fn
    }
    return ret;

})();
$.delegateTo=function delegateTo(object,target){
    var targetkey,isuuid
    if(typeof(target)=="string"){
        targetkey=target;
        target=object[target]
    }
    if(!(target && typeof(target)=="object")){
        return object
    }
    function buildDescriptorFn(p,t,f,typ){
        var propName=p,target=t,fn= f,type=typ
        return function( ){
            var T=target
            if (typeof(target)=="string"){T=this[target]}
            if(!(T && typeof(T)=="object")){
                return null
            }
            if(typeof(fn)=="function"){
                return fn.apply(T,arguments )
            } else{var curr=T[propName];
                if(type=="set" || (type=="value" && arguments.length)){
                    T[propName]=arguments[0]
                }
                return curr ;
            }
        }
    }
    function noop(){}

    $.each($.getAllProperties(target),function(descript,propName){
        if (typeof(propName) == "string" && !(propName in object ))  {
            var D=descript.descriptor,T=targetkey||target;
            if(D){
                if(descript.isMethod){
                    $.defineProperty(object, propName, {value: buildDescriptorFn (propName,T,D.value,"value"),
                        enumerable:descript.descriptor.enumerable, writable:descript.descriptor.writable,
                        configurable:descript.descriptor.configurable
                    });
                } else{
                    $.defineProperty(object, propName, {
                        get:descript.descriptor.get?  buildDescriptorFn (propName,T,D.get,"get"):noop
                         ,
                        set:descript.descriptor.set?buildDescriptorFn (propName,T,D.set,"set"):noop,
                        enumerable:descript.descriptor.enumerable,
                        configurable:descript.descriptor.configurable
                    });
                }
            }
        }
    });

    return object
}

$.valueHolder = $.modRecord = function(name,delegate) {
    var onchange=null,_value,_valuelabel="",_name=name,_delegate=delegate||null;
    var toret= {
        on:function(fn){typeof(fn)=="function" && (onchange=fn)},
        getValue:function(){return _value},
        setValue:function(v,lbl){ var old=_value;
            if(old!==v){
                 onchange && onchange({oldValue:old,value: v,newValue:v,name:_name,valueLabel:_valuelabel=lbl,object:_delegate||this})
            }
            return old;
        } ,
        reset:function(){_value=null;_valuelabel="";}
    }
    Object.defineProperty(toret,"record",{set:function(arr){ return this.setValue(arr[0],arr[1])},get:function(){return [_value,_valuelabel]}})
    Object.defineProperty(toret,"value",{set:function(v){ return this.setValue(v)},get:function(){return this.getValue}})
    return toret;
}





$.getVersion = function(a) {
    var b = $.objectMap.getOrCreate(a);
    return b ? (null == b.__version && (b.__version = 1), b.__version) : void 0
}
$.updateVersion = function(a, b) {
    var c = $.objectMap.getOrCreate(a);
    return c ? (null == c.__version && (c.__version = 0), c.__version = null == b ? c.__version + 1 : b, b) : void 0
}

$.UUID = (function() {
    var counter = 1;
    function a() {
        return "UUID_" + (++counter) + Math.random().toString(36).substr(2, 5)
    }

    return function() {
        if (arguments.length) {
            var object = arguments[0];
            if (!(object && ("object" == typeof(object) || "function" == typeof(object)))){
                return object;
            }
            var c = $.objectMap.getOrCreate(b);
            c._uuid || (c._uuid = a())
            return c._uuid
        }
        return a()
    }
})() ;

$.decode = function(a) {
    for (var b = $.makeArray(arguments, 1), c = $.fnize(a, {
        asBoolean: !0
    }), d = (b.length, null); b.length >= 2;) {
        if (c(b.shift())) {
            d = b.shift();
            break
        }
        b.shift()
    }
}






$.inspectArgs=(function( ){
    var infocache={},resusecache=[]
    var toStr=Object.prototype.toString,argStr="[object Arguments]",primitives=["number","string","boolean"]
    function _done(){
        var obj=this;
        for(var j= 0,l1=obj.types,l1n=l1.length;j<l1n;j++){
            var k=l1[j]
            if(obj[k]){
                obj[k].length=0
            };
        }
        obj.args.length=0;  obj.types.length=0;  obj.count=0;
        obj.first=obj.last=null;
        resusecache.push(obj)
    };
    var toRet= function parse( ) {
        var toret =resusecache.shift(),curr={},l= arguments,ln= l.length
        if(!toret ){
            toret ={args:[],types:[],count:0,first:null,last:null};
            toret.cache=_done.bind(toret);
            toret.each=function(typ,fn){
                if(!fn && typeof(typ)=="function"){fn=typ;typ=null}
                var obj=this,a=obj.args.slice();
                if(typ){
                    var UC=String(typ).toUpperCase(),isfn=typeof(typ)
                    a= a.filter(function(it){
                        if(isfn){
                            return it.info.typeInfo.ctorfn==typ
                        }
                        return it.info.type==typ || it.info.klass==typ || it.info[typ]===true || it.info[UC]===true})
                }
                if(a.length){
                    a.forEach(fn)
                }

            }
        }
        if(arguments.length===1 && toStr.call(arguments[0])===argStr){ return parse.apply(null,arguments[0])}
        for(var i= 0;i<ln;i++){
            var val=l[i],kls=toStr.call(val),klsname=kls.substr().substr(8,kls.length-9),typ=typeof(val),k=typ.substr(0,3),info=infocache["_"+klsname]

            if(kls===argStr){
                var part=parse.apply(null,val)
                if(ln==1){toret=part}
                else if(part.count){
                    toret.count+=part.count
                    for(var j= 0,l1=part.types,l1n=l1.length;j<l1n;j++){
                        var k=l1[j]
                        if(!toret[k]){
                            toret.types.push(k)
                            toret[k]=[]
                        };
                        [].push.apply(toret[k],part[k]||[]);
                    }
                    toret.first=toret.first||part.first;
                    [].push.apply(toret.args,part.args||[]);
                    part.cache();
                }
            }  else{
                if(!toret[k]){
                    toret.types.push(k)
                    toret[k]=[]
                }
                if(!info){
                    info={klass:klsname,type:typ,primitive:primitives.indexOf(klsname.toLowerCase())>=0}
                    if(l[i]!=null&&l[i].constructor!==Object&&l[i].constructor!==Function){
                        info.ctor=l[i].constructor;
                    }
                    if($.typeInfo){
                        info.typeInfo=$.typeInfo(info.ctor||info.klass||info.type)
                    }

                    info[k]=info[typ.toUpperCase()]= info[klsname.toUpperCase()]=true;
                    if(!$.isPlain(val)){
                        info=infocache["_"+klsname]=Object.freeze(info)
                    }

                }
                var curr={index:toret.args.length,info:info,val:val}
                toret[k].push(curr)
                toret.args.push(curr)
                if(i===0){toret.first=curr}
                //if(primitives.indexOf(kls.toLowerCase())>=0){curr.primitive=true}

            }
        }
        toret.count=toret.args.length
        return toret;
    }

    return toRet;
})() ;
$.perf=function(fns,a,tmes,cb){
    function go(fnarr,args,times,callback){

        var c=Math.max(1,times||0),cnt=fnarr.length,a=args.length?args:null,tms=[],now=typeof(performance)!="undefined" && performance.now?performance.now.bind(performance):Date.now
        function _then(){
            if(!callback || callback==="log"){console.log(tms.join("\n"))}
            else if(typeof(callback)=="function"){callback(tms)}
        }
        var rnng=-1
        function _do(){
            rnng++
            var i= c,fn=fnarr[rnng],t=now()
            if(a){
                while(--i)  fn.apply(null, a.concat(i))
            } else{
                while(i--)fn(i)
            }
            tms.push(((fn.name||"")+" " +((now() - t))).trim())
            if(rnng<cnt-1){setTimeout(_do,0)}
            else{_then()}
        }
        _do()
    }
    if(typeof(tmes)=="function"){
        if(typeof(cb)=="number"){
            var n=cb;
            cb=tmes
            tmes=n;
        } else{cb=tmes;tmes=100}
    }
    return{
        fns:fns,
        args:a,times:tmes,callback:cb,
        runWithArgs:function(a,times,callback){
            if(typeof(times)=="function"){
                if(typeof(callback)=="number"){
                    var n=callback;
                    callback=times
                    times=n;
                }
            }
            var args=[]
            if(!(!isNaN(times) && Number(times)>1)){times=this.times}
            if(typeof(callback)!=="function"){callback=this.callback}
            if(a!=null){args=[].concat(a)}
            else {args=[].concat(this.args||[])}
            go(this.fns,args,times,callback)
        },
        run:function(times,callback){
            this.runWithArgs(null,times,callback)
        }
    }
};
//copy dome dom methods
["onAttach","css","attr"].forEach(function(k){
    $[k]=(function(mthd){
        return function() {
            if (typeof($d) != "undefined") {
                return $d[mthd].apply($d, arguments);
            }
        }
    })(k);

});


$.makeVisitor = function() {
    var a = function(a, b) {
        this.delegate = a || this, this.router = b, $.isPlain(b) && $.each(b, function(a, b) {
            this[b] = a
        }, this)
    };
    return a.prototype.visit = function(a) {
        if ("function" == typeof this.router) {
            var b = this.router.call(this.delegate, a);
            "string" == typeof b && this.delegate && (b = this.delegate[b]), b && "function" == typeof b && b.call(this.delegate, a)
        }
    },
        function(b, c) {
            var d = new a(b, c);
            return d
        }
}()

$.persistentPromise = function(a) {
    function b(a, b) {
        for (; g.length;) g.shift()[a](b)
    }

    function c(a) {
        h = 1, b(0, a)
    }

    function d(a) {
        h = -1, b(1, a)
    }
    var e, f = Promise.deferred(),
        g = [],
        h = null,
        i = 0,
        j = a || {}, k = null,
        l = null;
    if (e = function(a, c, d) {
            a(d), b(c, d)
        }, null != j.delay) {
        if ("animationframe" == j.delay) {
            var m = typeof($d)!="undefined"?$d.util.animframe:self.requestAnimationFrame.bind(self);
            e = function(a, c, d) {
                m(function() {
                    a(d), b(c, d)
                })
            }
        }
        if ("number" == typeof j.delay) {
            var n = j.delay;
            e = function(a, c, d) {
                setTimeout(function() {
                    a(d), b(c, d)
                }, n)
            }
        }
    }
    return {
        then: function(a, b) {
            return i ? void 0 : ("function" != typeof a && (a = function() {}), "function" != typeof b && (b = function() {}), g.push([a, b]), f.then(c, d), this)
        },
        stop: function() {
            return g.length = 0, i = 1, this
        },
        reject: function(a) {
            f.reject(a)
            return  this
        },
        isFailure: function() {
            return -1 == h
        },
        isSucess: function() {
            return 1 == h
        },
        isInit: function() {
            return null === h
        },
        isPending: function() {
            return 0 == h
        },
        resolve: function(a) {
            f.resolve(a)
            return this
        },
        onreset: function(a) {
            return "function" == typeof a && (k = a), this
        },
        onmessage: function(a) {
            return "function" == typeof a && (l = a), this
        },
        updateStatus: function(a) {
            return l && l(a), this
        },
        reset: function(a) {
            if (i) return this;
            var b = this.isInit();
            return h = 0, b || (f = Promise.deferred()), null != a && l && l(a), k && k(a), this
        }
    }
}
$.services=(function(){
    var registery={};
    var Services= {
        register:function(name,service){
            registery[String(name).toLowerCase()]=service
        },
        unregister:function(name,api){
            delete registery[name]
        },
        findApi:function(name){
            var S=this.findService(name)
            return S && S.getApi()
        }
        ,
        findService:function(name){
            return registery[String(name).toLowerCase()]
        } ,

        define:function(name,api,impl){
            var ServiceImpl=$.require("js/libs/ServiceImpl.js",function(ServiceImpl){
                var service=new ServiceImpl(name,impl,api)

                return registery[String(name).toLowerCase()]=service
            });
            return registery[String(name).toLowerCase()]
        },
        defineModule:function(moduleurl,asWorker){
            if(asWorker===true){
                return ServiceImpl.asWorker(moduleurl)
            }
            return ServiceImpl.asModule(moduleurl)
        }
    }
    var ServiceImpl=function(name,impl,methods) {
        var _impl = impl, _name = name, _api = {}
        function invoke(fn,arg){
            if( _impl &&  _impl[fn]){
                return  _impl[fn].apply( _impl,[].slice.call(arguments,1))
            }
        }
        if(!methods && impl){
            methods=Object.keys(impl).filter(function(a){return typeof(impl[a])=="function"})
        }
        if (methods && Array.isArray(methods)) {
            for (var i = 0, ln = methods.length; i < ln; i++) {
                _api[methods[i]] = invoke.bind(this, methods[i])
            }
        }
        this.setImpl=function(impl){
            if(impl){
                _impl=impl;
            }
        }
        this.getApi=function(){ return _api; }
        this.register=function(){
            var ths=this
            Services.register(_name,ths)
        }
    }
    ServiceImpl.asModule=function(moduleurl){
        var service,pr=Promise.deferred()
        $.xhr.get(ResURL.from(moduleurl),function(data){
                if(typeof(data)=="string") {
                    try {var __={}
                        eval("__.x=" + data);
                        data = __.x
                    } catch (e) {}
                }
                if (data && data.name && data.api) {
                    service=new ServiceImpl(data.name,data.api, Object.keys(data.api))
                    service.register();
                    pr.resolve(service)
                } else{
                    pr.reject()
                }
            }
        );
        return pr
    }
    ServiceImpl.asWorkerScript=function(url,api){
        var w= $.worker.fromScript(url );
        api=api||{}
        var methods=Array.isArray(api)?api:api.methods,API={}
        if(methods){
            methods.forEach(function(ky){
                API[ky]=(function(nm,wrkr){var k=nm
                    return function() {
                        var args=[].slice.call(arguments),callback
                        if(typeof(args[args.length-1])=="function"){
                            callback=args.pop()
                        }
                        if(args.length==1){args=args[0]}
                        wrkr.sendMessage({cmd: k,args:args},callback)
                    }
                    })(ky,w)
            })
        }
        w.sendMessage({cmd:"config",config:{servicepath:app.servicePath}})
        return API;
    }
    ServiceImpl.asWorker=function(moduleurl){
        var wrkr=$.worker.build()
        var service,pr=Promise.deferred()
        wrkr.define("module",ResURL.from(moduleurl).build(),function(a) {
            if (a.name && a.api) {
                wrkr.addToApi(a.name, a.api)
                service=new ServiceImpl(a.name, wrkr.api[a.name],a.api)
                service.register();
                pr.resolve(service)
            } else{
                pr.reject()
            }
        });
        return pr
    }
    Services.ServiceImpl=ServiceImpl
    return Services;
})();