/**
 * Created by Atul on 12/5/2014.
 */
!function(scope) {
    /*
     new ItemList({
     reader        :function(d){return d},
     keyprovider   :function(rec){return rec.id},//name or fn
     validator     :function(){return true},
     labelprovider :function(rec){return rec.name},
     comparator    :function(a,b){},
     uniq          :false})

     */
    var defs = {
            reader: {
                read: function (d) {
                    return d
                }
            },
            keyprovider: function (rec) {
                return rec && typeof(rec) == "object" ? rec.id : rec
            },//name or fn
            validator: function () {
                return true
            },
            labelprovider: function (rec) {
                return this.__labelprvdr ||
                    (this.__labelprvdr = ["name", "label", "title", "value"].filter(function (it) {
                        return it in rec
                    })[0]);
                return this.__labelprvdr ? (rec.get ? rec.get(this.__labelprvdr) : rec[this.__labelprvdr]) : ""
            },
            comparator: function (a, b) {
                return a == b ? 0 : a > b ? 1 : -1
            },
            uniq: false
        },
        abs = Math.abs, min = Math.min.apply.bind(Math.min, Math), max = Math.max.apply.bind(Math.max, Math),
        _at = function (l, v) {
            return l.indexOf(v)
        }

    function _makeKeyProvider(k) {
        if (typeof(k) == "function") {
            return k
        }
        return typeof(k) == "string" ? Function("rec", "var k='" + k + "';return rec.getEntity?rec.getEntity(k):rec[k]") : null
    }

    function _makeLabelProvider(k) {
        var fn
        if (typeof(k) == "function") {
            return k
        }
        if (typeof(k) == "string") {
            fn = (k + " ").replace(/([\w]+)(.)/g, function (a, b, c) {
                return (!(c && c == "(") ? "_rec" : "") + b + c
            }).trim()
            fn = "var m=rec.toMap||rec.toObject;_rec=m?m.call(rec):rec;return " + fn
        }
        return fn ? Function("rec", fn) : null;
    }

    function _setter(list) {
        var arrproto = Array.prototype, c = list.config;
        return function () {
            var read = c.reader.read, uniq = c.uniq
            var i = -1, val, asnew, ln = arguments.length;
            if (ln === 3) {
                asnew = arguments[1]
            }
            if (ln >= 2 && typeof(arguments[0]) == "number") {
                i = arguments[0];
                val = read(ln === 3 ? arguments[2] : arguments[1])
            } else {
                val = read(arguments[0])
            }
            if (!uniq || list.indexOf(val) === -1) {
                i = i >= this.length || i < 0 ? -1 : i
                i === -1 ? arrproto.push.call(list, val) : (asnew ? arrproto.splice.call(list, i, 0, val) : (this[i] = val));
            }
            return val
        }
    }
    function _toarr(a,coerce) {
        var t=_arrlike(a)
        if(!t){return coerce?(a==null?[]:[a]):null}
        return t===1?a:[].slice.call(a)
    }
    var lastcheck=null,lastres=0
    function _arrlike(a) {
        if(lastcheck===a){return lastres}
        lastcheck=a; lastres=0
        if((a&&typeof(a)=="object")) {
            if (_arrtype(a)) {
                lastres=1
            }
            else{lastres= (a.length && isFinite(a.length) && a.length >= 0) ? 2 : 0}
        }
        return lastres
    }
    function _arrtype(a) {
        return Array.isArray(a) || (a.constructor&&a.constructor.name==="Array");//&&({}).toString.call(a)=="[object Array]")
    }

    function _flattenArgs(all, deep, holder) { holder=holder||[]
        var   a = _toarr(all);
        if (!a) {
            if(all!==undefined){holder.push(all)}
            return holder
        }

        var   optns = {},undef=undefined,dp=deep
        for (var i = 0, ln = a.length, it; it = a[i], i < ln; i++) {
            var arr=_toarr(it)
            if (arr&&( dp!==0.01009)) {
                dp=deep?1:0.01009
                for(var i2= 0,ln2=arr.length;i2<ln2;i2++) {
                    if(arr[i2]===undef){continue}
                    if(arr[i2]&&typeof(arr[i2])=="object"){
                        _flattenArgs(arr[i2],dp,holder)
                    } else if(arr[i2]!==undef){
                        holder.push(arr[i2])
                    }
                }

            } else if(it!==undef){
                holder.push(it)
            }
        }

        return holder
    }

    function _makeComparator(k) {
        var fn, nm = typeof(k) == "string" ? k : typeof(k) == "function" ? k.name : "";
        if (nm) {
            if (/^String|Number|Boolean|Date$/i.test(nm)) {
                var ctor = nm.charAt(0).toUpperCase() + nm.substr(1);
                var cnvrtr = ctor;
                if (ctor != "String") {
                    cnvrtr = "+" + ctor
                }
                fn = Function("a", "b", "var aa= " + cnvrtr + "(a),bb= " + cnvrtr + "(b);return aa==bb?0:aa>bb?1:-1")
            }
        }
        if (!fn) {
            if (typeof(k) == "function") {
                return k;
            } else if (typeof(k) == "string") {
                var cnvrtr = /id|num$/i.test(k) ? "Number" : /date|time$/i.test(k) ? "+Date" : "String"
                fn = Function("a", "b", "var kynm='" + k + "',aa= " + cnvrtr + "(Object(a)[kynm]),bb= " + cnvrtr + "(Object(b)[kynm]);return aa==bb?0:aa>bb?1:-1")
            } else if (k && k.type && k.name) {
                var cnvrtr = k.type
                fn = Function("a", "b", "var kynm='" + k.name + "',aa= " + cnvrtr + "(Object(a)[kynm]),bb= " + cnvrtr + "(Object(b)[kynm]);return aa==bb?0:aa>bb?1:-1")
            }
        }
        return typeof(fn) == "function" ? fn : null
    }

    function List() {
        if (this === self || !(this instanceof List)) {
            return new List(arguments)
        }
        this._init.apply(this, arguments)
    }

    var ListUtils={
        proxiedMethods:null,
        listCtor:null,
        createList:function(a,b){
            if(this.listCtor){var c=this.listCtor
                return c.newInstance?c.newInstance(a,b):new c(a,b)
            }
        },
        getProxiedMethods:function(){
            if(this.proxiedMethods){return this.proxiedMethods}
            var mutators = "push pop shift unshift splice".split(/\s+/)
            var invokeMap=$.cleanObj(),array = $.cleanObj(),ctor=ListUtils.listCtor,listproto=ctor?ctor.prototype:null,ignoredMethods={},
                holder={invokeMap:invokeMap,array:array };
            if(!listproto){return null;}
            this.proxiedMethods=holder
            $.each($.getMethods(listproto), function (v, k) {
                if (!ignoredMethods.length) {
                    ignoredMethods = ["findResult", "find", "first", "last", "toArray", "add", "addAll", "getAt", "setAt", "remove",  "clear"];
                    $.each($.getMethods(listproto), function (v, k) {
                        var ths = this
                        if (ignoredMethods.indexOf(k) >= 0) {
                            return
                        }
                        if (k.charAt(0) == "_" || k == "mixin" || k == "chainable" || k.indexOf("get") == 0 ||
                            /return\s+this\s*;?\s*\}/mg.test(listproto[k].toString())) {
                            ignoredMethods.push(k)
                        }
                    });
                }
                if (k.charAt(0) == "_" || k == "mixin" || k == "chainable" || k == "prep" || k == "clone") {
                    return
                }

                if (/return\s+this\s*;?\s*\}/mg.test(listproto[k].toString())) {
                    invokeMap[k]={fn:listproto[k],returns:"this"}
                    //ths[k] = Function("List.prototype['" + k + "'].apply(this,arguments);return this;")
                }
                else if (ignoredMethods.indexOf(k) >= 0) {
                    invokeMap[k]={mthd:listproto[k],returns:"result"}
                    //ths[k] = Function("return List.prototype['" + k + "'].apply(this,arguments)")
                } else if (mutators.indexOf(k) >= 0) {
                    invokeMap[k]={mthd:Array.prototype[k]}
                    //ths[k] = Function("return Array.prototype['" + k + "'].apply(this,arguments);")
                } else if (typeof(Array.prototype[k]) == "function") {
                    invokeMap[k]={mthd:Array.prototype[k] }
                    //ths[k] = Function("return this.__make(Array.prototype['" + k + "'].apply(this,arguments))")
                }

                else if( v.descriptor && typeof( v.descriptor.value)=="function"){
                    invokeMap[k]={mthd:v.descriptor.value }
                    //Object.defineProperty(ths, "__" + k, {value: d.value, enumerable: false})
                    //ths[k] = Function("return this.__make(this['__" + k + "'].apply(this,arguments))")
                }
                array[k]=Function("return this.__list?this.__list.__invoke('" + k + "',arguments):null;")
                invokeMap[k].name=k
                invokeMap[k].arrayOp=true
            });
            return this.proxiedMethods
        },
        getComponentTypeDelegate : function _getComponentTypeDelegate( obj0) {
            var obj = (obj0 && typeof(obj0) == "object" && obj0.length) ? [].filter.call(obj0,function(it){return it})[0] : obj0
            if (!obj) {
                return
            }
            if (typeof(obj) == "function" && Object.keys(obj.prototype).length) {
                obj = obj.prototype
            }
            var ths, dfn = $.defineValue, delegate = {},type = {},proxiedMethods=ListUtils.getProxiedMethods()||{};

            if (obj == "element" || (typeof(Node) != "undefined" && (obj.el || obj) instanceof Node)) {
                type.info = $.typeInfo.get("element")
                if (!type.info.category) {
                    type.info.category = $d
                }
            } else {
                type.info = obj ? $.typeInfo.get(obj) : {}
            }

            //if(type && type.collectionDelegate){ return type.collectionDelegate.newInstance(list)         }
            if (type && type.newInstance && type.info.category) {
                return type
            }
            /* ths = function thsList() {
             this._init.apply(this, arguments.length == 1 ? arguments[0] : arguments)
             }*/
            ths = ListUtils.createList()

            obj0.copyConfig && obj0.copyConfig(ths)
            delegate.__type = type
            Object.defineProperty(ths,"__array",{value: Object.create(proxiedMethods.array),enumerable:false,writable:false,configurable:true})
            ths.config = ths.config || {}
            ths.config._delegate = delegate;
            var allmethods = {}
            if (!type.info.category) {
                if (type.info.type == "string") {
                    ZModule.require("$.S" )
                    type.info.category = $.S
                }
            }
            if (type.info.category) {
                allmethods = $.getMethods(type.info.category)
            }
            $.each($.getMethods(obj, true), function (v, k) {
                if (k && !(k in allmethods )) {
                    allmethods[k] = v;
                }
            })

            /*Object.defineProperty(ths, "__make", {
             value: function (l) {
             if (this.__initing) {
             return this
             }
             var ret
             if (l && l instanceof List) {
             ret = l
             } else {
             var type = (l && l.length) ? List._getComponentTypeDelegate($.A.findResult(l)) : (this.config._delegate || {}).__type
             if (type && type.type && this.config._delegate && this.config._delegate.__type.info == type.info) {
             ret = this.clone().addAll($.makeArray(l || []))
             //ret=this
             }
             else if (type && type.type && l && typeof(l) == "object" && l.length >= 0) {
             var ll = this.newInstance().addAll(l).chainable()
             ret = ll
             } else {
             ret = l
             }
             }
             if ((ret instanceof List)) {
             ret.config._shared = this.config._shared || {}
             if (ret.config._shared.uniq) {
             ret.flatten(false, true, true)
             }
             if (ret !== this) {

             if (ret.config._shared._methods) {
             $.each(ret.config._shared._methods, function (v, k) {
             if (!ret[k]) {
             ret[k] = v
             }
             })
             }
             }
             }
             return ret
             }, enumerable: false
             });*/
            //invokeMap[k]={fn:k,returns:"this"}
            var invokeMap=Object.create(ListUtils.getProxiedMethods().invokeMap)
            $.each(allmethods, function (v, k) {
                if (v.descriptor && typeof(v.descriptor.value) == "function") {
                    var ds = v.descriptor
                    if (type.info.category && (k in type.info.category)) {
                        delegate[k] = {ctx: type.info.category, elementAsArg: true, mthd: type.info.category[k]}
                        invokeMap[k]= {ctx: type.info.category, elementAsArg: true, mthd: type.info.category[k]}
                    }
                    else {
                        delegate[k] = {ctx: null, mthd: ds.value}
                        invokeMap[k]={ctx: null, mthd: ds.value}
                    }
                    delegate[k].name = k;
                    invokeMap[k].name = k;
                    invokeMap[k].delegate=true;
                    delegate[k].delegate=true;
                    ths[k]=Function("return this.__invoke('"+k+"',arguments)")
                    /* Object.defineProperty(ths, k, {
                     value: (function (del) {
                     delg = del;
                     return function () {
                     var r = [],
                     args = [].slice.call(arguments),
                     dl = this.config._delegate[k],
                     fn = dl.mthd,
                     elAsArg = dl.elementAsArg, issame = true
                     this.each(function (it) {
                     if (!it) {
                     return
                     }
                     var res = fn.apply(dl.ctx || it, (elAsArg ? [it] : []).concat(args))
                     res != null && r.push(res);
                     if (res !== it) {
                     issame = false
                     }
                     })
                     if (issame) {
                     return this
                     }
                     else if (r.length) {
                     return this.newInstance(r).chainable()
                     }
                     return this
                     }
                     })(delegate[k]),
                     enumerale: true, writable: true, configurable: true
                     })*/
                }
            });
            type.newInstance = function (l) {
                var c = this.ctor
                var nu = new c();
                $.defineProperty(nu, "__mixedin", {value: true, enumerable: false, configurable: false})
                nu.config._delegate = c._delegate
                nu.config._shared || (nu.config._shared = {});
                if (l) {
                    nu.addAll([].slice.call(l))
                }
                return nu
            }
            type.ctor = function () {
                this._init.apply(this, arguments)

            };
            delegate.__invokeMap=invokeMap
            type.ctor.prototype = ths;
            type.ctor._delegate = type.ctor.prototype._delegate= delegate
            return type;
        }

    }

    List.__needsinit = true;


    function _makeProto(Listctor){

        var Listproto, ifr = document.body.appendChild(document.createElement("iframe"));
        ifr.src = 'javascript:';
        var win = ifr.contentWindow || (ifr.contentDocument.defaultView)
        if (win) {
            Listproto = win.Array.prototype
            ifr = null;
            win = null
        } else {
            Listproto = Object.creat1e(Array.prototype)
        }

        ListUtils.listCtor=Listctor
        Listctor.prototype = Listproto;
        Listproto.__invoke = function(k,arglist){
            if(this.__initing||!(k&&typeof(k)==="string"&&k!="__invoke")){return this}
            if( !(this._delegate&&typeof(this._delegate[k].mthd)=="function")){
                if(typeof(this[k])=="function"){
                    return this[k].apply(this,arguments[1]||[])
                } else{
                    return null;
                }
            }

            var info=this._delegate[k],
                result=[],
                args = [].slice.call(arguments[1]),
                fn = info.mthd,
                elAsArg = !!info.elementAsArg,
                issame = true,
                ctx=info.ctx||null

            if(info.arrayOp) {
                if(typeof( fn)=="string"){
                    result=this.constructor.prototype[ fn].apply(this,args)
                } else if(typeof( fn)=="function"){
                    result=info.fn.apply(this,args)
                }
                if(info.returns==="this"){return this}
                if(info.returns==="result"){return result}
            } else if(info.delegate&&typeof(fn)=="function"){{
                for(var i= 0,l=this,ln=this.size(),it;it=l[i],i<ln;i++){
                    if (!it) {
                        continue
                    }
                    var res = fn.apply(ctx || it, elAsArg === true? [it].concat(args) :  args )
                    res != null && result.push(res);
                    if (res !== it) {
                        issame = false
                    }
                }
                if ( issame||!result.length) {
                    return this
                }
            }
                var ret,ctor=this.constructor
                if (result && ctor&&result instanceof ctor) {
                    ret = result
                } else {
                    var type = (result && result.length) ?  ListUtils.getComponentTypeDelegate( result ) : (this._delegate || {}).__type
                    var info=(type||{}).info||type
                    if (info&& info.type && this._delegate && this._delegate.__type && this._delegate.__type.info === info) {
                        ret = this.clone().addAll(result)
                        //ret=this
                    }
                    else if (info && info.type && result && typeof(result) == "object" && result.length >= 0) {
                        ret = ListUtils.createList().addAll(result).chainable()
                    } else {
                        ret = result
                    }
                }
                if (ctor&&(ret instanceof ctor ) && ret !== this) {
                    var config=this.config||(this.config={});
                    ret.config=ret.config||config;
                    if(config._shared!==ret.config._shared) {
                        ret.config._shared = config._shared
                        if (config._shared.uniq) {
                            ret.flatten(false, true, true)
                        }
                        if (config._shared._methods) {
                            var mthds = config._shared._methods;
                            for (var i = 0, l = Object.getOwnPropertyNames(mthds), ln = l.length, k; k = l[i], i < ln; i++) {
                                if (k && !(k in ret)) {
                                    ret[k] = mthds[k]
                                }
                            }
                        }
                    }
                }
                return ret

            }
        }
        Listproto._init = function () {
            this.__initing = true
            try {
                var args = arguments.length == 1 && $.isArray(arguments[0]) ? arguments[0] : _flattenArgs(arguments,true),
                    optns = {} ;

                Object.defineProperty(this,"array",{value: Object.create(this.__array,{__list:{value:this}}),enumerable:false,writable:false,configurable:false})
                var config={}
                for (var k in defs) {
                    if (!(k in config)) {
                        config[k] = defs[k]
                    }
                    if (k == "reader") {
                        for (var k1 in defs[k]) {
                            if (! config[k][k1]) {
                                config[k][k1] = defs[k][k1]
                            }
                        }
                    }
                }
                Object.defineProperty(this,"config",{value:config,enumerable:false,writable:false,configurable:false})

                //his._set=_setter(this  );

                if (args && args.length) {
                    this.addAll(args);
                }
            } finally {
                delete this.__initing
            }
        }
        Listproto.getObserver = function () {
            this.config = this.config || {}
            if (!this.config._observer) {
                this.config._observer = $.emitter(this);
            }
            return this.config._observer;

        }
        Listproto._dispatch = function (ev, data) {
            this.config = this.config || {}
            var o = this.config._observer;
            if (!o || this.config.paused) {
                return
            }
            var map = {"unshift": "add", "push": "add", "shift": "remove", "pop": "remove", "splice": "remove"}
            var nm = map[ev] || ev;
            if (o.hasListener(nm)) {
                o.fire(nm, {type: nm, action: ev, value: data, collection: this})
            }
            if (nm != "change" && o.hasListener("change")) {
                o.fire("change", {type: "change", action: ev, value: data, collection: this})
            }
        }
        Listproto._set = function () {
            var i = -1, val, asnew, ln = arguments.length;
            if (ln === 1 && Array.isArray(arguments[0])) {
                for (var i = 0, l = arguments[0], ln1 = l.length; i < ln1; i++) {
                    this._set(l[i])
                }
                return this;
            }
            var list = this, c = this.config, read = c.reader.read, uniq = c.uniq
            if (ln === 3) {
                asnew = arguments[1]
            }
            if (ln >= 2 && typeof(arguments[0]) == "number") {
                i = arguments[0];
                val = read(ln === 3 ? arguments[2] : arguments[1])
            } else {
                val = read(arguments[0])
            }
            var ln = this.length, mod = 0;
            if (!uniq || list.indexOf(val) === -1) {
                i = i >= ln || i < 0 ? -1 : i
                i === -1 ? [].push.call(list, val) : (asnew ? [].splice.call(list, i, 0, val) : (this[i] = val));
                mod = 1
            }
            if (mod) {
                this._dispatch && this._dispatch(ln < this.length ? "add" : "update", val)
            }

            return val
        }
        Listproto.setKeyProvider = function (v) {
            this.config.keyprovider = _makeKeyProvider(v);
            return this;
        }
        Listproto.setLabelProvider = function (v) {
            this.config.labelProvider = _makeLabelProvider(v);
            return this;
        }
        Listproto.setComparator = function (v) {
            this.config.comparator = _makeComparator(v);
            return this;
        }
        Listproto.setReader = function (v) {
            this.config.comparator = _makeComparator(v);
            return this;
        }
        Listproto.setConfig = function (c) {
            $.extend(this.config, c);
            return this;
        }
        Listproto.prep = function (nu, mutate) {
            if (nu === this || nu instanceof this.constructor) {
                return nu || this
            }
            if ($.isArray(nu)) {
                return this.newInstance(nu)
            }
            return nu;
        }
        Listproto._invokeNative = function (nm, args) {
            var res = Array.prototype[nm].apply(this, [].slice.call(args || []))
            return this.prep(res)
        }
        Listproto.filter = function (fn0, ctx) {
            var fn = _makefn(fn0, this, true), res = [], l = this;
            if (!fn) {
                return
            }
            this.each(
                function (it, i) {
                    fn.call(ctx, it, i, l) && res.push(it);
                }
            )
            return this.prep(res)
        }
        Listproto.map = function (fn0, ctx) {
            var fn = _makefn(fn0, this), res = [], l = this;
            if (!fn) {
                return
            }
            this.each(
                function (it, i) {
                    res.push(fn.call(ctx, it, i, l))
                }
            )
            return this.prep(res)
        }
        var $BREAK = {}
        Listproto.each = Listproto.forEach = function (fn0, ctx) {
            var fn = _makefn(fn0, this);
            if (!fn) {
                return this
            }
            for (var i = 0, l = this, ln = l.length; i < ln; i++) {
                if (fn.call(ctx, l[i], i) === $BREAK) {
                    break;
                }
            }
            return this
        }
        Listproto.push = function () {
            var nm = "push"
            var res = this._invokeNative(nm, arguments);
            this._dispatch && this._dispatch(nm, res);
            return res
        }
        Listproto.pop = function () {
            var nm = "pop"
            var res = this._invokeNative(nm, arguments);
            this._dispatch && this._dispatch(nm, res);
            return res
        }
        Listproto.shift = function () {
            var nm = "shift"
            var res = this._invokeNative(nm, arguments);
            this._dispatch && this._dispatch(nm, res);
            return res
        }
        Listproto.unshift = function () {
            var nm = "unshift"
            var res = this._invokeNative(nm, arguments);
            this._dispatch && this._dispatch(nm, res);
            return res
        }
        Listproto.splice = function () {
            var nm = "splice"
            var res = this._invokeNative(nm, arguments);
            this._dispatch && this._dispatch(nm, res);
            return res
        }
        Listproto.fill = function (v, start, end) {
            start = start | 0;
            end = end | 0
            var size = this.length;
            if (!end || end < 0) {
                end = size
            }
            if (start < 0) {
                start = size - start
            }
            start = Math.max(0, start) || 0
            if (end < start) {
                return this
            }
            var fn = _makefn(v, this)
            while (this.push(null) < end) {
            }
            for (var i = start; i < end; i++) {
                this._set(i, fn.call(this, i))
            }
            return this
        }
        Listproto.slice = function () {
            var res, a = arguments, mutate;
            if (typeof(a[a.length - 1]) == "boolean") {
                a = [].slice.call(arguments);
                mutate = a.pop()
            }
            res = this.prep([].slice.apply(this, a))

            return res

        }
        Listproto.setUniq = function (flg) {
            if (flg == null) {
                flg = true
            }
            if (this.config.uniq != flg) {
                this.config.uniq = flg;
                if (flg) {
                    this.push = function () {
                        for (var i = 0, l = arguments, ln = l.length, it; it = l[i], i < ln; i++) {
                            this._set(-1, true, it);
                        }
                    }.bind(this)
                    this.unshift = function () {
                        for (var l = arguments, ln = l.length, i = ln - 1, it; it = l[i], i >= 0; i--) {
                            this._set(0, true, it);
                        }
                    }.bind(this)
                    this.splice = function (idx, todel) {
                        Array.prototype.splice.call(this, idx, todel || 0);
                        for (var l = [].slice.call(arguments, 2), ln = l.length, i = ln - 1, it; it = l[i], i >= 0; i--) {
                            this._set(idx, true, it);
                        }
                    }.bind(this)
                }
            }
            return this;
        }
        if (!Listproto.reduce) {
            Listproto.reduce = function (fn, init) {
                var val = init, l = this, skipfirst = arguments.length === 1;
                this.each(
                    function (it, i) {
                        if (skipfirst === true) {
                            skipfirst = false;
                            val = it;
                            return
                        }
                        val = fn(val, it, i, l)
                    }
                )
                return val;
            }
        }
        if (!Listproto.reduceRight) {
            Listproto.reduceRight = function (fn, init) {
                var val = init;
                var val = init, l = this, skipfirst = arguments.length === 1;
                for (var l = this, ln = l.length, i = ln - 1; i >= 0; i--) {
                    val = fn(val, l[i], i, l)
                }
                return val;
            }
        }
        Listproto.every = function (fn0) {
            var l = this, ret = true, fn = _makefn(fn0, this, true);
            if (!fn) {
                return
            }
            this.each(
                function (it, i) {
                    if (!fn(it, i, l)) {
                        ret = false;
                        return $BREAK
                    }
                });
            return ret;
        }
        Listproto.some = function (fn0) {
            var ret = false, l = this, fn = _makefn(fn0, this, true);
            if (!fn) {
                return
            }
            this.each(
                function (it, i) {
                    if (fn(it, i, l)) {
                        ret = true;
                        return $BREAK
                    }
                }
            )
            return ret;
        }
        Listproto.eq = function (val) {
            if (this[0] == val || this === val) {
                return true
            }
            if (Array.isArray(val)) {
                for (var i = 0, l = val, ln = l.length; i < ln; i++) {
                    if (l[i] != this[i]) {
                        return false
                    }
                }
                return true;
            }

            return false;
        }
        Listproto.sort = function (cmp) {
            if (typeof(cmp) == "string") {
                cmp = _makefn(cmp, this, true)
            }
            if (typeof(cmp) != "function") {
                var info;
                if (this.config && this.config.typeInfo) {
                    info = this.config.typeInfo
                } else {
                    var t = this.typeOf();
                    this.config.typeInfo = info = $.typeInfo($.isArray(t) ? t[0] : t);
                }
                if (info && info.compareTo) {
                    cmp = info.compareTo.bind(info)
                }
            }
            this._dispatch && this._dispatch("sort")
            this._invokeNative("sort", cmp ? [cmp] : [])
            return this;
        }
        var ignoredMethods = []

        Listproto.mixin = function (obj0) {
            alert("Listproto.mixin")
            return this.chainable(obj0)
        }
        Listproto.listdata = function (data) {
            if ($.isArray(data)) {
                this.config.__data = data
            }
            return this
        }
        Listproto.exit = function () {
            delete this.config.__data
        }
        Listproto.enter = function (data) {
            var d = this.config.__data || (this.config.__data || []);
            if (data) {
                [].concat(data).forEach(
                    function (k) {
                        d.push(k)
                    }
                )
            }
            return this
        }

        Listproto.mixinProto = function (obj) {

        }
        Listproto.copyConfig = function (l) {
            l && l.setConfig && l.setConfig(this.config);
            return l
        }
        Listproto.unique = Listproto.uniq = function (tx) {
            return new Set(this.toArray(tx))
        }
        Listproto.value = function () {
            return this.length == 1 ? this[0] : this
        }
        Listproto.pluck = function (nm) {
            return this.collect("@" + nm)
        }
        Listproto.invoke = function (nm) {
            return this.invokeWith.apply(this, [nm, null].concat([].slice.call(arguments, 1)))
        }
        Listproto.invokeWith = function (nm, ctx) {
            var r = [], args = [].slice.call(arguments, 2), fn = "function";
            this.each(function (it, i) {
                it && typeof(it[nm]) === fn &&
                r.push(it[nm].apply(ctx == null ? it : ctx, args.concat(it, i, this)))
            })

            return this.prep(r)
            //return this.collect(function(it){return (it && typeof(it[nm])===fn)?it[nm].apply(ctx||it,args):null})
        }
        Listproto.split = function (nm) {
            var res = [[]], fn = _makefn(nm, this);
            return this.reduce(
                function (m, it) {
                    if (fn(it)) {
                        m.push([])
                    } else {
                        m[m.length - 1].push(it)
                    }
                    return m
                }
                , [[]]
            )
        }
        Listproto.groupsOf = function (num) {
            var l = this, rnng = 0, n = Math.max(1, ~~num), res = [[]];
            this.each(function (it, i) {
                var k = ~~(i / n);
                k > rnng && (rnng = res.push([]) - 1);
                res[rnng].push(it)
            });

            return res
        }
        Listproto.groupBy = function (fn) {
            var ret = {}, g = this.collect(fn).map(String),ths=rhis;
            this.each(function (it, i) {
                (ret[g[i]] || (ret[g[i]] = ths.newInstance([]))).push(it)
            });
            return $.LinkedMap(ret);
        }
        Listproto.typeOf = function (extended) {
            var res = this.compact(true, true).collect(function (it) {
                return ({}).toString.call(it).replace(/[\[\]\s]|object/g, "")
            }).uniq()
            if (extended === true) {
                res = res.map(function (it) {
                    return $.typeInfo(it)
                })
            }
            return res.value()
        }
        Listproto.sortBy = function (nm, mutate) {
            var revrse = 0
            if (typeof(nm) == "string" && nm.charAt(0) == "-") {
                revrse = 1;
                nm = nm.substr(1).trim()
            }
            var res, fn = _makefn(nm, this);
            if (mutate === false) {
                res = this.clone(true).sort(function (a, b) {
                    var aa = fn(a), bb = fn(b);
                    return aa == bb ? 0 : aa > bb ? 1 : -1
                })
            }
            res = this.sort(function (a, b) {
                var aa = fn(a), bb = fn(b);
                return aa == bb ? 0 : aa > bb ? 1 : -1
            })
            if (revrse) {
                res.reverse()
            }
            return res

        }


        Listproto.toArray = function (fn) {
            var f = fn ?  _makefn(fn, this, false) : null;
            if (f) {
                return [].map.call(this, f)
            } else {
                return Array.prototype.slice.call(this)
            }

        }
        Listproto.clone = function (withdata) {
            var nu
            if (this.newInstance) {
                nu = this.newInstance()
            }
            else {
                nu = Object.create(this);
                nu.splice(0, this.length + 1)
            }
            if (withdata === true) {
                nu.addAll(this.toArray().slice())
            }
            return nu
        }
        Listproto.getAt = function (i) {
            var idx = typeof(i) == "number" ? (i < 0 ? this.size() + i : i) : this.indexOf(i);
            return idx >= 0 && idx < this.length ? this[idx] : null
        }

        Listproto.addAt = function (i, a) {
            this._set(Number(i) || 0, true, a);
            return this
        }
        Listproto.add = function (a) {
            this._set(-1, true, a);
            return this
        }
        Listproto.reset = function (nu) {
            this.clear().addAll(nu);
            return this
        }
        Listproto.addAll = function (a) {
            var args=arguments

            if (!(a && Array.isArray(a))) {
                if (args.length) {
                    a = [].slice.call(args)
                }
                else {
                    return this
                }
            }
            if (a.length==1&&a[0]&&typeof (a[0])=="object"&&({}).toString.call(a[0])=="[object Arguments]") {a=a[0]}
            var o = this.config;
            o.paused = true
            try {
                for (var i = 0, ln = a.length, it; it = a[i], i < ln; i++) {
                    this._set(-1, true, it)
                }
            } finally {
                o.paused = null
            }
            this._dispatch && this._dispatch("add", a)

            return this
        }
        Listproto.removeAt = function (i0) {
            var i = i0 < 0 ? this.length + i0 : i0;
            return i == 0 ? this.shift() : this.splice(i, 1)[0]
        }
        Listproto.remove = function (a) {
            var curr
            if (typeof(a) == "number" && !this.contains(a)) {
                return this.removeAt(a)
            }
            var i = this.indexOf(a);
            if (i < 0) {
                var f = this.find(a)
                if (f) {
                    i = this.indexOf(f)
                }
            }
            if (i >= 0) {
                curr = this.splice(i, 1)[0]
            } else {
                return null;
            }
            return curr
        }
        Listproto.toggle = function (a) {
            var el = this.contains(a);
            el ? this.remove(el) : this.add(a);
            return this;
        }
        Listproto.size = function () {
            var cnt = this.length;
            if (typeof(cnt) == "undefined") {
                cnt = 0;
                for (var i in this) {
                    if (this.hasOwnProperty(i) && !isNaN(i)) {
                        cnt = Math.max(cnt, Number(i) + 1)
                    }
                }
                try {
                    delete this.length
                    Object.defineProperty(this, "length", {
                        get: function () {
                            var c = 0;
                            for (var i in this) {
                                if (this.hasOwnProperty(i) && !isNaN(i)) {
                                    c = Math.max(c, Number(i) + 1)
                                }
                            }
                            return c;
                        }, set: function (num) {
                            if (num >= 0) {
                                Array.prototype.splice.call(this, num, 1000)
                            }
                        }, configurable: true
                    })
                } catch (e) {
                }

            }
            return cnt
        }
        Listproto.clear = function () {
            var i = -1;
            while (this[++i] != null) {
                this[i] = null
            }
            this.splice(0, 10000);
            this._dispatch && this._dispatch("clear")
            //this.length=0;

            return this;
        }
        Listproto.toString = function () {
            return this.join(" ")
        }
        Listproto.toJSON = function () {
            var ar = this.toArray().map(function (it) {
                return typeof(it) == "function" ? "FN|" + it.toString() : it
            });
            return JSON.stringify(ar)
        }
        Listproto.contains = function (a) {
            return this.indexOf(a) >= 0 ? a : ((typeof(a) == "number" && a >= 0 && a < this.length) ? this[a] : this.find(a))
        }
        var _finders = {
            id: function (tofind, config) {
                var prv = config.keyprovider, v = tofind;
                return function (rec) {
                    return prv(rec) == v
                }
            },
            prop: function (prop, tofind, config) {
                var prv = String(prop), v = tofind;
                return function (rec) {
                    return (rec.get ? rec.get(prv) : rec[prv]) == v
                }
            }
        }
        Listproto.combinations = function combinations() {
            var args = [].slice.call(arguments), trgt = this, nounwrap = false
            if (!args.length) {
                return trgt
            }
            var res = this.newInstance();
            while (args.length) {
                [].concat(args.shift() || []).forEach(
                    function (a) {
                        trgt.each(function (v2, ii) {
                            res.add([v2, a])
                        })

                    }
                )

            }

            return res
        }
        Listproto.permute = function permute() {
            /*
             var res=[],l=[1,3,4,5],cc=[].concat(l);while(cc.length){ cc.forEach(function(y,i){var ll=[].concat(cc);var a=ll.splice(i,1);
             var xxx=[].concat(l);xxx.splice(i,1); xxx.each(function(x,j){xxc=[].concat(xxx);xxc.splice(j,1);res.push([y,x].concat(xxc )) })} ); cc.shift();};res=res.map(String);res.pop();res.sort();res.join("\n")
             */
            var args = [].slice.call(arguments), trgt = this, nounwrap = false
            if (!args.length) {
                return trgt
            }
            var res = this.newInstance(),ths=this;

            args.forEach(function (arro, i) {
                trgt.each(function (v2, ii) {
                    ths.newInstance(arro).each(function (v3, iii) {
                        res.add([v2, v3])
                    })
                });
            })
            return res
        }
        Listproto.getFinderfn = function (propname, predi) {
            var fn;
            this.config.finders = this.config.finders || {};
            if (predi && typeof(predi) == "object") {
                if (predi instanceof RegExp) {
                    fn = function (v) {
                        return this.re.test((v && this.p) ? v[this.p] : v)
                    }.bind({re: predi, p: propname})
                }
                if (Array.isArray(predi)) {
                    fn = function (v) {
                        return this.a.indexOf((v && this.p) ? v[this.p] : v) >= 0
                    }.bind({a: predi, p: propname})
                }
            }
            else {
                if (propname && typeof(predi) != "object") {
                    if (propname == "id") {
                        fn =  _finders.id(predi, this.config)
                    } else if (fn = this.config.finders[propname]) {
                        fn = fn(predi);
                    } else if (fn = this.config.finders.prop) {
                        fn = fn(propname, predi);
                    } else {
                        fn =  _finders.prop(propname, predi, this.config);
                    }

                } else {
                    fn = _makefn((propname ? (propname + " == ") : "") + predi, this, true)
                }
            }
            return fn;
        }

        Listproto.finder = function (propname, predi, mx, strict) {
            var primitiveCheck, byId = propname == "id", fn = null, r = [], ln = this.size();

            //if(!fn) {
            if (propname == null && (typeof(predi) == "number" || (typeof(predi) == "string" && !/[^\w_]/.test(predi)))) {
                propname = "id";
                byId = true
            }
            if (byId) {
                primitiveCheck = predi
            }

            fn = (propname == null && typeof(predi) == "function") ? predi :
                this.getFinderfn(propname, predi)

            if (typeof(fn) != "function") {
                fn = function (v) {
                    return v == predi
                }
            }
            var lim = Math.max(0, mx | 0) || ln + 1, l = this
            this.each(function (val, i) {
                if (byId && typeof(val) != "object") {
                    if (val != primitiveCheck) {
                        return
                    }
                }
                else if (!fn(val, i, l)) {
                    return
                }

                if (r.push(val) >= lim) {
                    return $BREAK
                }
            })

            var res = mx === 1 ? r[0] : this.prep(r)
            return res
        }
        Listproto.first = function () {
            return this.getAt(0)
        }
        Listproto.last = function () {
            return this.getAt(-1)
        }
        Listproto.top = function (howmany) {
            if (!~~howmany) {
                return this.first()
            }
            return this.sublist(~~howmany || 1)
        }
        Listproto.bottom = function (howmany) {
            if (!~~howmany) {
                return this.last()
            }
            return this.sublist(0 - (~~howmany || 1))
        }
        Listproto.rest = function (howmany) {
            return this.sublist(1)
        }
        Listproto.sublist = function (nu, end) {
            var res, ln = this.size()
            if (!nu) {
                nu = 0
            }
            if (nu && typeof(nu) != "object" && ~~nu != 0) {
                if (nu < 0) {
                    nu = ln + nu
                }
                end = ~~end;
                if (end < 0) {
                    end = ln + end
                }
                if (!(end && end > nu)) {
                    end = undefined
                }
                res = this.slice(nu, end)
            } else if (typeof(nu) == "object" && "length" in nu && nu.length > 0) {
                res = this.newInstance(nu).setConfig(Object.create(this.config))
            }

            return res
        }
        Listproto.findResults = function (fn1, strict) {
            if (typeof(fn1) == "boolean") {
                strict = fn1;
                fn1 = null
            }
            var res = [], fn = fn1 ? _makefn(fn1, this) : null;
            this.each(function (v) {
                var it = fn ? fn(v) : v
                if ((!strict && it) || it != null) {
                    res.push(it)
                }
            })

            return this.prep(res)
        };
        Listproto.findResult = function (fn1, strict) {
            if (typeof(fn1) == "boolean") {
                strict = fn1;
                fn1 = null
            }
            var fn = fn1 ? _makefn(fn1, this) : null, r = null;
            this.each(function (v) {
                var it = fn ? fn(v) : v
                if ((!strict && it) || it !== null) {
                    r = it;
                    return $BREAK
                }
            })

            return r
        };
        Listproto.compact = function (strict) {
            var nu = this.filter(function (it) {
                return strict ? it != null : !!it
            })
            this.length = 0;
            Array.prototype.pushsplice.apply(this, [0, this.length])
            Array.prototype.push.apply(this, nu)
            return this
        };

        Listproto.sortIndex = function (val, comparator) {
            var fl = Math.floor, ths = this.toArray(), v = val, d, ceil = Math.ceil, abs = Math.abs;
            return (function (cmp, min, _at) {
                return function (l, v) {
                    var l1 = l.map(cmp.curry(v));
                    return _at(l, _at(l1, min(l1)))
                }
            })(function (a, b) {
                    return Math.abs(a - b)
                },
                min = Math.min.apply.bind(Math.min, Math),
                function (l, v) {
                    return l.indexOf(v)
                })
        }
        Listproto.avg = function (nm) {
            return this.sum(nm) / this.size()
        }
        Listproto.sum = function (nm) {
            var fn = nm ? _makefn(nm, this) : function (a) {
                return a
            };
            return this.reduce(function (m, it) {
                return m + fn(it)
            }, 0)
        }
        Listproto.max = function (nm) {
            var fn = nm ? _makefn(nm, this) : function (a) {
                return a
            };
            return this.size() ? this.collect(function (it) {
                return {k: it, v: fn(it)}
            })
                .sort(function (a, b) {
                    return a.v - b.v
                })
                .pop().k : null
        }
        Listproto.min = function (nm) {
            var fn = nm ? _makefn(nm, this) : function (a) {
                return a
            };
            var ret = this.size() ? this.collect(function (it) {
                return {k: it, v: fn(it)}
            })
                .sort(function (a, b) {
                    return a.v - b.v
                })[0].k : null
            return ret;
        }
        Listproto.match = (function () {
            function chk(data) {
                var d = data, mthchs = true, st = d.rnng, w = 0;
                for (var i = 0; i < d.fln; i++) {
                    var f = d.fns[i];
                    if (!(f && f[1](d.l.slice(i + d.rnng, i + d.rnng + f[0])))) {
                        mthchs = false;
                        break;
                    }
                    w = w + f[0]
                }
                if (mthchs) {
                    if (d.res.push(d.l.slice(d.rnng, d.rnng + w)) >= d.howmany) {
                        return;
                    }
                }
                d.rnng++
                if (d.rnng <= d.max) {
                    chk(data)
                }
            };
            return function match(howmany, fnarr) {
                var totln = 0, ths = this
                if (typeof(howmany) != "number") {
                    throw new Error("Invalid arguments. 'hownany' must be a number")
                }
                if (fnarr.length == 2 && typeof(fnarr[1]) == "function" && typeof(fnarr[0]) == "number") {
                    fnarr = [fnarr]
                }

                var fns = fnarr.map(function (it) {
                    var a = Array.isArray(it) ? it : [1, it];
                    if (a.length == 1) {
                        a.unshift(1)
                    }
                    if (typeof(a[1]) != "function") {
                        a[1] = typeof(a[1]) == "string" ? _makefn(a[1], ths, true) : (function (cnt, val) {
                            return function (v) {
                                for (var j = 0; j < cnt; j++) {
                                    if (v[j] != val[j]) {
                                        return false
                                    }
                                }
                                return true
                            }
                        })(a[0], [].concat(a[1] == null ? [] : a[1]));


                    }
                    ;
                    totln = totln + a[0]
                    return a;
                })

                var data = {
                    l: this,
                    fns: fns,
                    ln: this.length,
                    res: [],
                    max: this.length - totln,
                    fln: fns.length,
                    rnng: 0,
                    howmany: howmany || Number.MAX_SAFE_INTEGER || Number.MAX_VALUE || 999999
                }
                if (data.fln == 1 && data.fns[0][0] == 1) {
                    data.res = this.filter(data.fns[0][1])
                }
                else {
                    chk(data);
                }
                if (data.howmany === 1) {
                    return data.res[0]
                }
                return data.res
            }
        })();
        Listproto.matchAll = function (fnarr) {
            return this.match(0, fnarr)
        }
        Listproto.matchOne = function (fnarr) {
            return this.match(1, fnarr)
        }
        Listproto.grep = function (fn1, noesc) {
            var ex = fn1
            if (typeof(fn1) == "string") {
                try {
                    ex = new RegExp(!noesc ? RegExp.escape(fn1) : fn1)
                } catch (e) {
                    ex = fn1
                }
            }
            return this.findAll(ex)
        }
        Listproto.findAll = function (fn1) {
            return this.finder(null, fn1, 0)
        }
        Listproto.findAllBy = function (prop, val, max) {
            return this.finder(prop, val, max)
        }
        Listproto.findBy = function (prop, val) {
            return this.finder(prop, val, 1)
        }
        Listproto.findById = function (v, strict) {
            return this.finder("id", v, 1, strict)
        }
        Listproto.find = function (fn1) {
            if (this.indexOf(fn1) >= 0) {
                return fn1
            }
            if (typeof(fn1) == "string" && fn1.indexOf("UUID") == 0) {
                var map = $.objectMap, r = null
                this.each(function (val, i) {
                    if (val && typeof(val) == "object") {
                        var m = map.get(val)
                        if (m && m._uuid == fn1) {
                            r = val
                            return $BREAK
                        }
                    }
                });

                if (r != null) {
                    return r
                }
            }
            return this.finder(null, fn1, 1)
        }

        function _makefn(fn1, _list, asboolean) {
            var fn = fn1, wrapidx = 0;
            if (fn1 && typeof(fn1) == "object") {
                if (fn1 instanceof RegExp) {
                    return RegExp.prototype.test.bind(fn1)
                }
                if (Array.isArray(fn1)) {
                    return function (v) {
                        return this.indexOf(v) >= 0
                    }.bind(fn1)
                }
            }
            if (fn1 && typeof(fn1) == "string" && _list && _list.length && _list[0] && (typeof(_list[0][fn1]) == "function")) {
                fn = _list[0][fn1]
            } else if (fn1 && typeof(fn1) == "string") {
                if (/\bi\b/.test(fn1)) {
                    try {
                        return Function("it,i,arr", "return " + fn1.replace(/@\.?/g, "it."))
                    } catch (e) {
                    }
                    wrapidx = 1
                }
            }

            fn = $.fnize(fn, {context: _list, asboolean: asboolean, force: true, args: ["it", "i", "arr"]})
            if (typeof(fn) != "function") {
                fn = Function("return " + ((typeof(fn1) == "number" || typeof(fn1) == "boolean") ? fn1 : ("'" + fn1 + "'")))
            }

            return fn;
        }
        Listproto.collect = function (fn1) {
            var fn = _makefn(fn1, this, false);
            if (!fn) {
                return
            }
            var nu = this.map(fn);
            return this.prep(nu);
        }
        Listproto.intersect = function () {
            var a = [].slice.call(arguments), all = []
            if (a.every(function (it) {
                    return Array.isArray(it)
                })) {
                all = a;
            } else {
                all = [a]
            }
            var res = this.toArray(), torem = []
            this.each(function (it, idx) {
                for (var i = 0, ln = all.length; i < ln; i++) {
                    var ar = all[i]
                    if (ar.indexOf(it) == -1) {
                        torem.push(idx);
                        break;
                    }
                }
            });
            while (torem.length) {
                res.splice(torem.pop(), 1)
            }
            return this.newInstance(res)


        }
        Listproto.newInstance=function(list){
            var ctor=(((this.config||{})._delegate||{}).__type||{}).ctor||((this._delegate||{}).__type||{}).ctor
            //var ctor=this.constructor||this.prototype.constructor||((this._delegate||{}).__type||{}).ctor
            if(ctor){
                return new ctor(list)
            }
        }
        Listproto.flatten = function (incnulls, uniq, mutate) {
            var res = []

            function _inner(l) {
                if (l && typeof(l) == "object" && l.length > 0) {
                    for (var i = 0, ln = l.length, it; it = l[i], i < ln; i++) {
                        _inner(it)
                    }
                } else if (incnulls || (l != null)) {
                    if (!uniq || res.indexOf(l) === -1) {
                        res.push(l)
                    }
                }
            }

            _inner(this)
            if (mutate) {
                this.clear().addAll(res)
                return this
            }
            return this.newInstance(res)
        }

        Listproto.chainable = function (obj0) {
            var obj = obj0 || this.findResult()
            var type =  ListUtils.getComponentTypeDelegate(obj)
            return type ? type.newInstance(this.toArray()) : this
        }

    }



    List.create=function(){
        if(List.__needsinit){
            _makeProto(List);
            List.__needsinit=null;
            ListUtils.listCtor=List;
            if(!List.prototype.__array){
                var proxiedMethods=ListUtils.getProxiedMethods(List)
                Object.defineProperty(List.prototype,"__array",{value: Object.create(proxiedMethods.array),enumerable:false,writable:false,configurable:true})
            }
            $.A=function(){return List.from(arguments)}
            Object.keys(List.prototype).forEach(function(k){if(k in Object||k=="_init"){return}
                $.A[k]=(function(mthd){
                    var m=mthd;
                    return function(list){
                        return m.apply(List.from(list),[].slice.call(arguments,1))
                    }
                })(List.prototype[k]);
            })
        }
        var docompact,a=arguments;if(a[0]===true){docompact=true;a=[].slice.call(arguments,1)}
        if(a.length==1&&a[0] instanceof List){return a[0]}
        var vals=(!a.length||(a.length==1&&a[0]==null))?[]:_flattenArgs(a,false)
        return docompact?(new List(vals)).compact():new List(vals)
    }
    List.from=List.create
    List.range=function(){
        var start=arguments[0]|0,end=arguments[1]| 0,inc,nu=[]
        if(arguments.length==1){start=0;end=arguments[0]|0}
        inc=(end-start)/Math.abs(end-start);
        var i=-1,c=Math.abs(end-start)
        while(++i<=c){
            nu.push(start+i)
        }
        return List.from(nu)

    }

    List.plugin={
        emitter:function(l){var list=List.create(l)
            list.config=list.config||{}
            if(!(list.config&&list.config._observer)){
                list.config=list.config||{};
                var emt=list.config._observer=$.emitter(list)
                list.fire=emt.fire.bind(emt)
                list.on=emt.on.bind(emt)
                list.off=emt.off.bind(emt)

                list.emitter=emt
            }
            return list
        }   ,

        selectionModel:function(list,config){
            function $SelectionModel(list,config){
                config=config||{}
                if(typeof(config)=="function"){config.onselect=config}
                var listconfig=config ,l= List.create(list)
                if(l.config._hasSelectionModel) {return list}
                l.config._hasSelectionModel=true

                List.plugin.emitter(l )
                if(config.onselect){this.on("select",config.onselect)}
                l.select=function(){
                    var multi= listconfig.multi,
                        sl= listconfig.selList||( listconfig.selList=[]);
                    var sel=this.find.apply(this,arguments)
                    var i=sel==null?-1:sl.indexOf(sel)
                    if(sel&&i<0){
                        if(!multi){
                            sl[0]&&this.fire("unselect",sl[0],this)
                            sl[0]=sel
                        }
                        else{sl.push(sel) }
                        if( listconfig.toggleClass){
                            var c= listconfig.toggleClass;
                            this.each(
                                function(it){
                                    if(!it){return}
                                    if(sl.indexOf(it)==-1){it.removeClass&&it.removeClass(c)}
                                    else{it.addClass&&it.addClass(c)}
                                }
                            )
                        }
                        this.fire("select",this.getSelection(),this)
                    }
                    return this
                }
                l.unselect=function(){
                    var sl=this.getSelection();
                    var sel=this.find.apply(this,arguments)
                    var i=sel==null?-1:sl.indexOf(sel)
                    if(i>=0){
                        sl.splice(i,1)
                        var c= listconfig.toggleClass;
                        c&&sel.removeClass&&sel.removeClass(c)
                        this.fire("unselect",sl,this)
                    }
                    return this
                }
                l.clearSelection=function(){
                    if( listconfig.selList){
                        listconfig.selList.length=0
                    }
                    return this
                }
                l.getSelection=function(){
                    var  sl= listconfig.selList||( listconfig.selList=[]);
                    return  listconfig.multi?sl:sl[0]
                }
                return l
            }
            return $SelectionModel(list,config)
        }
    }
    scope.List=List
    //maplist

}(window);
List.Observable=function(l){
    var list=List.create(l)
    if(!list.emitter) {
        list.emitter=$.emitter (list)
        $.observe (list, {},function(ev){
            list.emitter&&list.emitter.fire (ev.type, ev)
        })
    }
    return list

}
ObservableList=(function( ){
    var ARRPROTO=Array.prototype,ARR=Array
    function _arr(v){return [].slice.call(v)}
    function _isarr(v){return ARR.isArray(v)}
    function _isarrLike(v){ return v?(_isarr(v)||(typeof(v)=="object"&&typeof(v.length)=="number"&&isFinite(v.length)&&v.length>=0)):!1}
    function _defineprop(o,k){
        Object.defineProperty(o.__proto__||o,String(k),{set:Function("v","this._set("+k+",v)"),get:Function("return this._get("+k+")"),enumerable:true,configurable:true})

    }

    function core(o){
        var _inner=[],_length=0,_listeners=[]
        var coreproto= {
            _state:{value:{instance:0,capacity:100,haslisteners:0,batchmode:0,reset:0,discarded:0},enumerable:false,writable:false,configurable:false},
            _get:{value:function(i){this.scan();
                return _inner[i]
            },enumerable:false,writable:false,configurable:true} ,
            _ensureCapacity:{value:function(v){
                var evalstr=[],props={},st=this._state
                if(v < st.capacity){return this}
                for(var i=st.capacity;i<v;i++){
                    evalstr.push( "props['"+i+"']={set:function(v){this._set("+i+",v)},get:function(){return this._get("+i+")},enumerable:true,configurable:true}")
                }
                all=evalstr.join("; ");
                eval( all );
                Object.defineProperties(this.__proto__||this,props);
                st.capacity=v;
                return this
            }},
            scan:{value:function scan(){
                if(scan._busy){return}
                scan._busy=1
                try{
                    var l
                    if((l=Object.keys(this)).length){
                        var exp=this._state.expando||(this._state.expando=[]);
                        for(var i=0,ln=l.length,k;k=l[i],i<ln;i++){
                            if(exp.indexOf(k)>=0){continue}
                            exp.push(k)
                            if(!isNaN(k)){
                                var v=this[k];  delete this[k]
                                this._set(Number(k),v,true)
                            }
                        }
                    }
                }finally{scan._busy=0}
                return this
            },enumerable:false,writable:false,configurable:true},
            _sz:{value:function(v){this.scan()
                if(typeof(v)=="number"&&v>=0){
                    _length=_inner.length=v;
                };
                return _length||0
            },enumerable:false,writable:false,configurable:true} ,
            _rem:{value:function(i,howmany){
                if(i===true){   //clear
                    for(var i=0,l=_inner,ln=l.length;i<ln;i++){ l[i]=null; }
                    _length=_inner.length=0;
                    this._dispatch( {type:"clear"})
                    return []
                }
                var r,ln=(howmany|0)||1
                if(ln===1&&(i===0||i===-1)){
                    r=(i===-1)?_inner.pop():_inner.shift()
                } else{
                    r= _inner.splice(i<0?_length+i:i,ln)
                }
                _length=_inner.length
                this._dispatch( {type:"remove",data:r})
                return r;
            },
                enumerable:false,writable:false,configurable:true
            } ,
            reverse:{value:function(){return _inner.reverse();this._dispatch( {type:"order",reverse:true})},enumerable:false,writable:false,configurable:true} ,
            sort:{value:function(fn){return fn?_inner.sort(fn):_inner.sort();
                this._dispatch( {type:"order"})
            },enumerable:false,writable:false,configurable:true} ,
            _set:{value:function(i,v,insert){
                if(_isarrLike(i)){ v=i;i=-1; }
                i=i|0;
                var ln=_length||_inner.length,idx=i,curr
                if(_isarrLike(v)){
                    if(i===-1){_length=ARRPROTO.push.apply(_inner, _arr(v))}
                    else if(i===0){_length=ARRPROTO.unshift.apply(_inner, _arr(v))}
                    else{ARRPROTO.splice.apply(_inner, [i,0].concat(_arr(v)))
                        _length=_inner.length
                    }
                } else{
                    idx=i<0?ln+i:i
                    if(insert===true||idx>=ln){
                        if(idx>=ln||i===-1){ _length=_inner.push(v)}
                        else if(idx===0){_length=_inner.unshift(v)}
                        else{
                            _inner.splice(idx,0,v)
                            _length=_inner.length
                        }
                    } else{
                        curr=_inner[idx]
                        if((typeof(v)!="object" && curr===v)||(curr&&v&&curr.$version&&curr.$version===v.$version)){return curr}
                        _inner[idx]=v
                    }
                }
                if(_length==null){_length=_inner.length}
                this._ensureCapacity(_length)
                this._dispatch({type:insert?"add":"update",index:idx,value:v,newValue:v,oldValue:curr})
                return curr
            },enumerable:false,writable:false,configurable:true
            }
        }
        Object.defineProperties(o,coreproto);
        return o
    }
    function ObservableList(capacity,nulist){
        core(this)
        capacity=(capacity|0)||100
        this._ensureCapacity(capacity)
        this._state.instance=true;
        if(nulist!=null){
            this._set(nulist)
        }

    }
    var props={
        emitter:{get:function(){
            if(!(this._state&&this._state.instance)){return null}
            var _listeners={add:[],remove:[],update:[],order:[],"change":[]};
            var nu={
                on:function(type,fn){
                    if(!fn && typeof(type)=="function"){fn=type;type="change";}

                    if(typeof(fn)=="function"&&_isarr(_listeners[type])&&_listeners[type].indexOf(fn)==-1){
                        _listeners[type].push(fn)
                    }
                    this._state.haslisteners++
                    return this
                },
                off:function(type,fn){
                    if(_isarr(_listeners[type])&&_listeners[type].indexOf(fn)>-1){
                        _listeners[type].splice(_listeners[type].indexOf(fn),1)
                    }return this
                },
                fire:function(ev){var type=ev.type,ln,l=(_isarr(_listeners[type])?_listeners[type]:[]).concat(_listeners["*"])
                    if(ln=l.length){
                        for(var i=0;  i<ln;i++){
                            typeof(l[i])=="function" && l[i].call(this,ev)
                        };
                    }
                    return this
                }
            }
            delete this["emitter"]
            nu.fire=nu.fire.bind(this)
            nu.on=nu.on.bind(this)
            Object.defineProperty(this,"emitter",{value:nu,enumerable:false,writable:false,configurable:true})
            return nu;
        },set:function(){}
            ,enumerable:false, configurable:true},
        _dispatch:{value:function(ev){
            if(!this._state.haslisteners){return}
            this.emitter.fire(ev);
            return this
        },enumerable:false,writable:false,configurable:true
        },
        unshift:{value:function(){
            for(var i=0,l=[].slice.call(arguments),ln=l.length;i<ln;i++){
                this._set(0,l[i],true)
            };
            return this._sz()
        },enumerable:false,writable:false,configurable:true
        } ,
        splice:{value:function(i,l,a){
            var r=l?this._rem(i,l):[],
                aa=[].slice.call(arguments,2);
            while(aa.length){this._set(i,aa.pop(),true );}
            return r
        },enumerable:false,writable:false,configurable:true
        } ,
        slice:{value:function(s,e){
            var st=s|0,end=e|0,l=this._sz(),r=[];
            st=Math.min(l,st<0?l+st:st);
            end=Math.min(l,end<0?l+end:end);if(end<st||!end){end=l}
            for(var i=st;i<end;i++){r.push(l[i])};

            return r
        },enumerable:false,writable:false,configurable:true} ,
        shift:{value:function(){return this._rem(0)},enumerable:false,writable:false,configurable:true} ,
        push:{value:function(a){
            for(var i=0,l=[].slice.call(arguments),ln=l.length;i<ln;i++){
                this._set(-1,l[i],true)
            };
            return this._sz()
        },enumerable:false,writable:false,configurable:true} ,
        pop:{value:function(){
            return this._rem(-1)
        },enumerable:false,writable:false,configurable:true} ,
    }
    var proto= Object.create(null);
    Object.getOwnPropertyNames(ARRPROTO).forEach(function(k){
        if(typeof(k)=="string"  && typeof(ARRPROTO[k])=="function"&&  props[k]===undefined  ){
            props[k]= {value:eval("(function(){return ARRPROTO['"+k+"'].apply(_inner,arguments)})") ,enumerable:false,writable:false,configurable:true}
        }
    })

    var evalstr=[]
    for(var i=0;i<100;i++){
        evalstr.push( "props['"+i+"']={set:function(v){this._set("+i+",v)},get:function(){return this._get("+i+")},enumerable:true,configurable:true}")
    }

    var all=evalstr.join("; ");
    eval( all );props.length={get:function(){return this._sz()},set:function(v){this._sz(v)},enumerable:false,configurable:true}
    Object.defineProperties(proto,props);


    ObservableList.prototype=proto
    ObservableList.prototype.constructor=ObservableList
    return ObservableList
})();

/*

 var nu=new ObservableList()  ;
 nu.emitter.on("update",function(e){console.log(e.newValue===55)})
 nu[9]=55
 nu[9]==55
 var t,c=1000,i,arr=Array(c);
 t=Date.now();i=0;while(++i<c){arr[i]=i};console.log(Date.now()-t);
 t=Date.now();i=0;while(++i<c){nu[i]=i};console.log(Date.now()-t)*/
