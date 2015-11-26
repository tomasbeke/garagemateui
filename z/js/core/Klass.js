/**
 * Created by Atul on 5/20/2015.
 */


    self.Klass = function () {
    function _createBaseKlass() {
        function t() {
            this.isPrototype = true
        }

        var e = "baseKlass";
        var n = function () {
        };
        $.defineProperty(n, "isKlass", {value: true, writable: false, enumerable: false, configurable: false});
        var r = new n;
        r.defaultproperty = null;
        r.fire = function () {
            if (this.observer) {
                this.observer.fire.apply(this.observer, arguments)
            }
            return this
        };
        r.is = function (e) {
            var t = typeof n == "string", n = typeof e == t ? String(e).toLowerCase() : e;
            return n === this || this.constructor && (n === this.constructor || n === this.constructor.name) || t && (n == this.name || n == this.classMeta.simpleName) || typeof n == "function" && this instanceof n
        };
        r.uuid = function () {
            return $.UUID(this)
        };
        r.on = function () {
            if (this.observer) {
                ("state" in this) && this.state && (this.state.hasObservers = true);
                this.observer.on.apply(this.observer, arguments)
            }
            return this
        };
        r.getController = function (e) {
            if (!this._controller) {
                $.defineValue(this, "_controller", {value: $.controller.create(this, e), enumerable: true, configurable: true, writable: false})
            }
            return this._controller
        };
        r.onpropertychange = function (name, callback, opts) {
            if (typeof name == "function") {
                opts=callback ;
                callback = name;
                name= this.defaultproperty
            }
            this.properties.onchange(name, callback.bind(this) , opts)
            //this.observer.onpropertychange(name, callback , opts);

        }
        r.observerInit = function () {
            return this
        }
        $.defineProperty(r, "state", {get: function () {
            delete this.state;
            var e;
            $.defineProperty(this, "state", {value: e = {}, enumerable: true, configurable: true, writable: false});
            return e
        }, set: function () { }, enumerable: true, configurable: true});
        $.defineProperty(r, "observer", {get: function () {
            if (!(this.__isinstance__ && typeof Util !== "undefined" && $.emitter)) {
                return null
            }
            $.emitter(this, true);
            delete this.observer;
            $.defineProperty(this, "observer", {value: this.emitter, enumerable: true, configurable: true, writable: false});
            this.observerInit(this.emitter);
            return this.emitter
        }, set: function () {
        }, enumerable: true, configurable: true});
        $.defineProperty(r, "expando", {get: function () {
            if (!this.__isinstance__){return null}
            delete this.expando;
            return $.expando.augment(this,"expando")
        }, set: function () {
        }, enumerable: true, configurable: true});
        r.updateProperties = function (e) {
            this.properties.update(e)
        }
        r.invoke = function (e, t) {
            if (t == null) {
                t=[]
            } else if (typeof (t) === "object" && t.length!=null) {
                t=Array.isArray(t)?t:[].slice.call(t)
            }
            else {
                if (typeof t !== "object") {
                    t = [t]
                } else if (!Array.isArray(t)) {
                    if (t.length) {
                        t = [].slice.call(t)
                    } else {
                        t = [t]
                    }
                }
            }
            if (e.indexOf("Super.") === 0) {
                var n = e.substr("Super.".length);
                return this.__super[n] ? this.__super[n].apply(this, t) : null
            }
            return this.__proto[e].apply(this, t);
        };
        r.newInstance = function () {
            return this.constructor.newInstance.apply(this.constructor, arguments)
        };
        r.extend = function () {
            return this.constructor.extend.apply(this, arguments)
        };
        r._ex_ = function () {
            var e = arguments[0], t = this.constructor;
            if (typeof e == "string" && arguments.length > 1) {
                e = {};
                e[arguments[0]] = arguments[1]
            }
            if (t && e && $.isPlain(e)) {
                $.each(e, function (e, n) {
                    t.fn[e] = n
                })
            }
            return this
        };
        r.data = function () {
            return this.expando(arguments)
        };
        $.defineProperty(r, "__fromBaseKlass", {value: true, writable: false, enumerable: true, configurable: false});
        if (!r.isKlass) {
            $.defineProperty(r, "isKlass", {value: true, writable: false, enumerable: true, configurable: false})
        }
        n.prototype = r;
        n.prototype.constructor = n;
        return n
    }

    function _create() {
        var e = _createCtor(arguments);
        return e
    }

    var _cleanObj = function () {
        return Object.create(null)
    }, _curried = function (t) {
        var n = t;
        return function () {
            return this.invoke(n, [].slice.call(arguments))
        }
    }, _baseKlass = null, _KlassInit = function (t) {
        var n = self.Klass._PROTOINIT;
        return function () {
            if (arguments[0] === n) {
                Object.defineProperty(this,  "__isinstance__", {value: true, writable: false, enumerable: false, configurable: false});
                return
            }
            this.__initializing = true;
            try {
                var e = [];
                for (var t = 0, r = arguments.length; t < r; t++) {
                    var i = arguments[t];
                    if (i && typeof i == "object" && {}.toString.call(i).indexOf("Arguments") >= 0) {
                        [].push.apply(e, [].slice.call(i))
                    } else {
                        e.push(i)
                    }
                }
                var meta = this.__meta || (this.__meta = _cleanObj()),cb=function (e) {
                    if (!this.__initializing || e.value != null) {
                        //console.log("propertychange",e.name,e.value)
                        this.fire("propertychange", e)
                    }
                    return e.value
                }.bind(this);
                var props=new meta.propertyCtor(null,null,{delegate:this})

                Object.defineProperties(this, {__isinstance__: {value: true, writable: false, enumerable: false, configurable: false},
                    properties: {value: props, writable: false, enumerable: false, configurable: false}});
                this.Super=Object.create(this.constructor._Super)
                this.Super.__inst=this;
                this.Super._invoke=function(nm,a){return this.__super && typeof(this.__super[nm])=='function'?this.__super[nm].apply(this,a):null}.bind(this)
            } finally {
                delete this.__initializing
            }
            if (typeof this.beforeInitialize == "function") {
                this.beforeInitialize(e)
            }
            var mixins=null
            //this.properties.setListener(cb);
            if (e.length == 1 && e[0] && e[0].constructor && e[0].constructor.prototype === Object.prototype &&
                (!meta.ctorArgs || meta.ctorArgs.length === 0 || meta.ctorArgs.length && e.length > meta.ctorArgs.length)) {
                var o = {};
                if ($.isPlain(e[0])) {
                    var u = e[0];
                    if(u.mixin && $.isPlain(u.mixin)){
                        mixins=u.mixin;
                        delete u.mixin;
                    }
                    $.each(u, function (e, t) {
                        if (typeof e == "function") {
                            this[t] = e
                        } else {
                            o[t] = e
                        }
                    }, this)
                }
                this.updateProperties(o)
            }
            props.on(cb)
            if (typeof this.initialize == "function") {
                this.initialize.apply(this, e)
            }
            var a = this.__meta.events, f = this.onInitialize || this.afterInitialize || this.oninitialize;
            if (typeof f == "function") {
                f.call(this)
            }
            if (a && a.init) {
                [].concat(a.init).forEach(function (e) {
                    e.call(this)
                }, this)
            }
            //this.properties.getObserver().queue(false)

            if (a) {
                var l = a, c = this.observer;
                for (var h in l) {
                    h != "init" && c.on(h, l[h])
                }
            }
        }
    }, _createCtor = function _createCtor() {
        var ns = "", par, args = [];
        for (var i = 0, ln = arguments.length; i < ln; i++) {
            var a = arguments[i];
            if (a && typeof a == "object" && {}.toString.call(a).indexOf("Arguments") >= 0) {
                [].push.apply(args, $.makeArray(a))
            } else {
                if(a!=null){args.push(a)}
            }
        }
        var _super = {me:function(){
            var caller=arguments.callee.caller,nm=caller.name||caller._name
            if(!nm && this.__inst){
                if(!nm && this.__inst.__proto){
                    for(var k in this.__inst.__proto){if(this.__inst.__proto[k]===caller){nm=k;break;}}
                }
                if(!nm){
                    for(var k in this.__inst){
                        if(this.__inst[k]===caller){nm=k;break;}
                    }
                }
            }
            if(!nm){
                for(var k in this)if(this[k]==caller){nm=k;break;}
            }
            if(nm&&nm!=="me"&&nm!=="_invoke"){return this._invoke(nm,[].slice.call(arguments))}

        }}, __super = {}, __meta, defprops = _cleanObj(), proto = {}, nuproto = args.pop(), statics = {}, props = {};
        var protoctor = function () {
            this.isPrototype = true
        }, __proto = _cleanObj();
        if (typeof args[0] == "string") {
            ns = String(args.shift())
        }
        __meta = {ns: ns, statics: {}, simpleName: ns.split(/\./).pop()};
        par = args.shift() || null;
        if (par && typeof par == "object" && Object.getPrototypeOf(par) === Object.prototype) {
            par = null
        }
        var _init = nuproto.init || nuproto.initialize;
        if (_init === "super" && par) {
            _init = nuproto.init = typeof _init == "function" ? _init : Object.getPrototypeOf(par).init;
            delete nuproto.initialize
        }
        var mixins = [], _oninit = [];
        if (nuproto.mixin || nuproto.mixins) {
            [].push.apply(mixins, [].concat(nuproto.mixin || nuproto.mixins));
            delete nuproto.mixin;
            delete nuproto.mixins
        }
        if (par) {
            if (typeof par == "string") {
                par = ZModule.get(par)
            }
            if (typeof par == "function") {
                if (par.isKlass) {
                    par = new par(Klass._PROTOINIT)
                } else {
                    par = par.__isklass?par:par.prototype
                }
            }
            if (!(par && (typeof par == "object"||typeof par == "function"))) {
                par = {}
            }
            if (par && par.isKlass) {
                var m = par.__meta || {};
                if (m.defaultProperties) {
                    for (var k in m.defaultProperties) {
                        defprops[k] = m.defaultProperties[k]
                    }
                }
                if (m.mixins && m.mixins.length) {
                    [].push.apply(mixins, m.mixins)
                }
                if (m && m.statics) {
                    Object.keys(m.statics).forEach(function (e) {
                        statics[e] = m.statics[e]
                    })
                }
                var p1 = par.__proto || par;
                for (var k in p1) {
                    if (k == "init" || k == "initialize" || k == "observer" || k == "emitter" || k == "data") {
                        continue
                    }
                    if (typeof p1[k] == "function") {
                        __proto[k] = p1[k]
                    }
                }
            }
        }
        if (!(par && par.__fromBaseKlass)) {
            if (!_baseKlass) {
                _baseKlass = _createBaseKlass()
            }
            var nupar = new _baseKlass
            var toextend=null
            if(par ){
                if(typeof(par)=="function"){
                    toextend=new par(Klass._PROTOINIT)
                } else if(typeof(par)=="object"){
                    toextend=par
                }
            }
            if(toextend){
                for(var k in toextend){
                    //if(toextend.hasOwnProperty(k)){
                    if(k in nupar || (nuproto && typeof(nuproto)=="object" && k in nuproto) || k.indexOf("__")==0 || k in Object || k in Object.prototype){continue}
                    nupar[k]= toextend[k];
                    // }
                }
            }
            par=nupar
        }
        Klass.optimize(par);
        if (mixins.length) {
            $.each(mixins, function (e) {
                var t = typeof e == "object" ? e : Klass.mixins[e];
                if (t && typeof t == "object") {
                    $.each(t, function (e, t) {
                        if (t == "__init" || t == "init" || t == "setup") {
                            _oninit.push(e)
                        } else {
                            nuproto[t] = e
                        }
                    })
                }
            })
        }
        protoctor.prototype = par || _cleanObj();
        __super =  Object.create(protoctor.prototype);
        if (!_createCtor._ctorcounter) {
            _createCtor._ctorcounter = 0
        }
        var name = String(ns || "anonymouse_ctor_" + ++_createCtor._ctorcounter).replace(/[\W]/g, "_");
        var ctorfn = function __c__() {
            var e = __c__;
            if (!(this instanceof e)) {
                return new e(arguments)
            }
            this.__klassInitilize.apply(this, arguments)
        };
        var init, ctor = (1, eval)("(" + ctorfn.toString().replace(/__c__/g, name) + ")");
        proto = new protoctor;
        proto.__klassInitilize = _KlassInit();
        if (nuproto) {
            if (nuproto.properties) {
                var nuprops = nuproto.properties;
                if (typeof nuprops == "string") {
                    nuprops = nuprops.split(/\s+/)
                }
                if ($.isPlain(nuprops)) {
                    $.each(nuprops, function (e, t) {
                        defprops[t] = e
                    })
                } else if ($.isArray(nuprops)) {
                    nuprops.reduce(function (e, t) {
                        e[t] = null;
                        return e
                    }, defprops)
                }
                delete nuproto.properties
            }
            init = nuproto.init || nuproto.initialize;
            ["toString", "valueOf", "initialize", "init", "invoke", "getProperty", "setProperty"].forEach(function (e) {
                if (e in nuproto) {
                    __proto[e] = proto[e] = nuproto[e];
                    delete nuproto[e]
                }
            });
            Object.keys(nuproto).forEach(function (e) {
                if (typeof e == "string") {
                    if (e === e.toUpperCase() || e.indexOf("static") == 0) {
                        var t = e.replace(/^(?:static[s]?)\.?(.*)$/i, "$1"), n = nuproto[e];
                        if (!t && n && typeof n == "object") {
                            Object.keys(n).forEach(function (e) {
                                if (typeof n[e] == "function") {
                                    statics[e] = n[e]
                                } else {
                                    statics[e] = n[e]
                                }
                            })
                        } else if (t) {
                            if (n && typeof n == "function") {
                                statics[t] = n
                            } else {
                                statics[t] = n
                            }
                        }
                        return
                    }
                    if (e.indexOf("__") == 0) {
                        return
                    }
                    if (typeof nuproto[e] == "function") {
                        var r = nuproto[e];
                        if (r.name && r.name.match(/\$([\w]+)(\$(\d+))?/)) {
                            var i = r.name.match(/\$([\w]+)(\$(\d+))?/), s = i[1], o = Number(i.pop()) || 0;
                            if (s && typeof $[s] == "function") {
                                var u = [r];
                                if (o) {
                                    u.push(o)
                                }
                                r = $[s].apply($, u)
                            }
                        }
                        __proto[e] = r;
                        if (e != "onpropertychange" && e.toLowerCase() != "oninitialize" &&e.indexOf("on") == 0 && e.length > 2) {
                            var a = e.substr(2);
                            if (a == "init") {
                                _oninit.push(nuproto[e])
                            } else {
                                __meta.events || (__meta.events = {});
                                __meta.events[e.substr(2)] = nuproto[e];
                                proto[e] = nuproto[e]
                            }
                        } else {
                            if (e.indexOf("_") == 0) {
                                proto[e] = nuproto[e]
                            } else {
                                proto[e] = nuproto[e]//_curried(e)
                            }

                        }
                        if (typeof __super[e] == "function" && e!="onpropertychange"&& e!="delete") {
                            _super[e] = eval("(function " + e + "(){return this._invoke?this._invoke('" + e + "',[].slice.call(arguments)):null})")
                        }
                        if(proto[e] && !proto[e].name){
                            proto[e]._name=e;
                        }
                    } else {
                        defprops[e] = nuproto[e]
                    }
                }
            })
        }
        if (_oninit.length) {
            __meta.events || (__meta.events = {});
            __meta.events.init = _oninit.slice()
        }
        __meta.defaultProperties = null;
        if (Object.keys(defprops).length) {
            __meta.defaultProperties = _cleanObj();
            for (var k in defprops) {
                __meta.defaultProperties[k] = $.clone(defprops[k], true)
            }
        }
        if (proto.init && !proto.initialize) {
            proto.initialize = proto.init
        }
        __meta.mixins = mixins;
        var staticvars = Object.keys(statics).reduce(function (e, t) {
            if (typeof statics[t] == "function") {
                e.ctorvars[t] = e.fns[t] = {value: statics[t], enumerable: true}
            } else {
                e.ctorvars[t] = {get: function (e) {
                    var t = e;
                    return function () {
                        return this.prototype && this.prototype[t]
                    }
                }(t), set: function (e) {
                    var t = e;
                    return function (e) {
                        this.prototype && (this.prototype[t] = e)
                    }
                }(t), enumerable: false};
                e.vars[t] = statics[t]
            }
            return e
        }, {fns: {}, vars: {}, ctorvars: {}});
        //init0, callback, ctx, enhanced b, c, a, d
        var propmodel=$.simpleModel({})
        propmodel.setDelegate(proto)
        propmodel.addProperties(__meta.defaultProperties||{})
        propmodel.setItem("statics",staticvars.vars||{})
        __meta.propertyCtor=propmodel.asCtor();

        /*$.observableMap.augment(proto, $.clone(staticvars.vars, true), function (e) {
            if (!this.__initializing || e.value != null) {
            }
            return e.value
        });*/
        if (Object.keys(staticvars.fns).length) {
            Object.defineProperties(proto, staticvars.fns)
        }
        if (Object.keys(staticvars.ctorvars).length) {
            Object.defineProperties(ctor, staticvars.ctorvars)
        }
        __meta.statics = statics;
        if (init) {
            __meta.ctorArgs = String(init.toString().split(/[\n\r]/).shift().split(/[\)\(]/)[1] || "").trim().split(/\,/).map(function (e) {
                return e.trim()
            });
            if (__meta.ctorArgs.length && !__meta.ctorArgs[0]) {
                __meta.ctorArgs = []
            }
        } else {
            __meta.ctorArgs = []
        }
        Object.freeze(__super);
        $.defineProperty(proto, "__proto", {value: __proto, writable: false, enumerable: true, configurable: false});
        $.defineProperty(proto, "__super", {value: __super, writable: false, enumerable: true, configurable: true});
        $.defineProperty(proto, "Super", {value: null, writable: true, enumerable: true, configurable: true});
        delete proto.__meta;
        $.defineProperty(proto, "__meta", {value: __meta, writable: false, enumerable: true, configurable: false});
        $.defineProperty(proto, "classMeta", {value: __meta, writable: false, enumerable: true, configurable: false});
        $.defineProperty(ctor, "_Super", {value: _super, writable: false, enumerable: false, configurable: false});
        $.defineProperty(ctor, "isKlass", {value: true, writable: false, enumerable: false, configurable: false});
        $.defineProperty(ctor, "ns", {value: ns, writable: false, enumerable: false, configurable: false});
        $.defineProperty(ctor, "classMeta", {get: function () {
            return this.prototype.__meta
        }, set: function () {
        }, enumerable: false, configurable: false});
        if (init) {
            proto.initialize = init
        }
        ctor.prototype = proto;
        ctor.prototype.constructor = ctor;
        ctor.newInstance = function () {
            return $.newInstance(this, arguments)
        }.bind(ctor);
        ctor.createCollection = function () {
            var e = [].concat.apply([], $.makeArray(arguments)), t = this;
            var n = new t(self.Klass._PROTOINIT);
            var r = List.from(e || []).chainable(n);
            return r
        }.bind(ctor);
        ctor.fn = ctor.prototype;
        ctor.optimize=function(inst,asctor){
            if(!inst){var ctor=this
                inst=new ctor();
                asctor=true
            }

            var proto=this.prototype,__proto=proto.__proto
            for(var i= 0,l=$.keys(__proto),ln= l.length,k;k=l[i],i<ln;i++){
                if(typeof(__proto[k])=="function" && k!="invoke"){
                    inst[k]= __proto[k];
                }
            }
            if(asctor){
                var ctor=function(){}
                ctor.prototype=inst;
                ctor.prototype.constructor=ctor
                return ctor;
            }
            return inst;
        }

        ctor.inherit = ctor.extend = function () {
            var e = this, t, n = $.makeArray(arguments);
            if (typeof n[0] == "string") {
                t = n.shift()
            }
            if(t){n.unshift(t);}
            n.unshift(e);
            var r = _createCtor.apply(null, n);
            return r
        }.bind(ctor);
        if (ctor.ns) {
            self.ZModule&&self.ZModule.register(ctor.ns, ctor)
        }
        return ctor
    };
    var ret = function () {
        if (!_baseKlass) {
            _baseKlass = _create(_cleanObj())
        }
        return _create.apply(null, arguments)
    };
    ret.simple = function () {
        function initialize(e) {
            if(arguments.length==1&&arguments[0]&&arguments[0].__ignore){return}
            var args = [].slice.call(arguments);
            this.config = Object.create(null);
            this.__isinstance__ = true;
            if(this.withObserver) {
                setupObs.call(this );
            }
            if (this.init) {
                this.init.apply(this, args)
            }

        }
        function setupObs(override,removemethods){
            if(override && this.observer){
                delete this.observer
            }
            if(removemethods || !this.observer){
                if(this.constructor && this.constructor.prototype){
                    var proto=this.constructor.prototype;
                    "on off fire onpropertychange".split(/[,\s]+/).forEach(function(k){
                        if(!proto[k]){delete this[k]}
                    },this)
                }
            }
            if(!this.observer) {
                $.defineProperty(this,"observer", {
                    get: function () {
                        if (!this.__instance__) {
                            return null
                        }

                        delete this.observer;
                        $.emitter.augment(this)
                        $.defineProperty(this,"observer", {value: this.emitter, configurable: true, enumerable: true})
                        return this.emitter;
                    }, set: function () {}, configurable: true, enumerable: true
                })
            }
        }
        function make(parent, proto, staticObject) {
            function konstructor() {
                if (!(this instanceof konstructor)) {
                    var f = konstructor.bind.apply(konstructor, [null].concat([].slice.call(arguments)));
                    return new f();
                }
                var args=arguments;
                if (args.length == 1 && args[0] && typeof args[0] == "object" && args[0].toString && ({}).toString.call(args[0]).indexOf("Arguments") > 0) {
                    args = [].slice.call(arguments[0])
                }
                initialize.apply(this, args)
            }

            if (arguments.length == 1) {
                if (typeof parent == "object") {
                    proto = parent;
                    parent = function () { }
                } else if (typeof parent == "function") {
                    proto = {}
                }
            }

            proto.asProto = function (setupinst) {
                this.__instance__=false;
                function ctor( ){
                    var args=arguments
                    if (args.length == 1 && args[0] && typeof args[0] == "object" && args[0].toString && ({}).toString.call(args[0]).indexOf("Arguments") > 0) {
                        args=[].slice.call(arguments[0])
                    }
                    if(!(this instanceof ctor)){
                        var f = ctor.bind.apply(ctor, [null].concat([].slice.call(arguments)));
                        return new f();
                    }
                    this.__instance__=true;
                    if(this.withObserver) {
                        setupObs.call(this, true, true);
                    }
                    setupinst=setupinst||this.setupInstance
                    setupinst && setupinst.apply(this,args)
                }
                ctor.prototype=this
                ctor.prototype.constructor=ctor
                ctor.newInstance=ctor.prototype.newInstance=function(){ return new ctor(arguments)}
                return ctor
            }
            proto.uuid = function () { return $.UUID(this)};
            //ctor, proto, superClass, staticObject
            var nu = $.createClass(konstructor, proto || {}, parent, staticObject || {});
            nu.newInstance=nu.prototype.newInstance=function(){ return new nu(arguments)}

            nu.extend = function (proto) {   return make(this, proto)  };
            nu.fn = nu.prototype;
            return nu
        }

        var e = false, t = /xyz/.test(function () {  xyz }) ? /\b_super\b/ : /.*/;
        var r = function () {
            if (e) {
                return
            }
            initialize.call(this, arguments)
        };
        return make
    }();
    ret.create = ret;
    ret.extend = function () {
        if(typeof(arguments[0])=="string"){return _create.apply(null,[arguments[0],this].concat([].slice.call(arguments,1)))}
        return _create.apply(null,[this].concat([].slice.call(arguments)))
    }
    ;
        ret.lazyInit=function(klass,initPars){
            return function(){
                return new klass(initPars)
            }
        }
    //self.ZModule.register(ret);
    return ret
}();
self.Klass.optimize=function(inst,asctor){
    var ctor,isctor
    if(!inst){
        return null
    }
    if(typeof(inst)=="function"){
        ctor=inst;inst=ctor.newInstance();
        isctor=true
    } else{
        ctor=inst.constructor
    }
    var proto=ctor.prototype,__proto=proto.__proto
    for(var i= 0,l=$.keys(__proto),ln= l.length,k;k=l[i],i<ln;i++){
        if(typeof(__proto[k])=="function" && k!="invoke"){
            inst[k]= __proto[k];
        }
    }
    if(isctor){
        var ctor=function(){}
        ctor.prototype=inst;
        ctor.prototype.constructor=ctor
        return ctor;
    }
    return inst;
}
self.Klass._PROTOINIT = {};
self.Klass.mixins = {config: {__init: function () {
    var e = $.simpleModel();
    e.onchange("*",function (e) {
        this.fire("configchange", e)
    }.bind(this));
    this.properties.addProperty("config",null);
    this.properties.setItem("config",e);
}, setConfig: function (e, t) {
    var n = this.config;
    if (e && $.isPlain(e)) {
        $.each(e, function (t) {
            n[t] = e[t]
        })
    } else {
        n[e] = v
    }
    return this
}, getConfig: function (e) {
    var t = this.config, n = {};
    if (e && $.isArray(e)) {
        $.each(e, function (k) {
            n[k] = e[k]
        })
    } else {
        return t[e]
    }
    return n
}}};