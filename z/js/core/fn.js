$.fn = function() {
    function fn() {
        return $.fn.resolve.apply(null, arguments)
    }

    function _fninfo(a, b) {
        var c = {
            name: "",
            args: [],
            arity: 0
        };
        if ("string" == typeof a && b && (c.name = a, a = b[a]), "function" != typeof a) return null;
        c.name = a.name || c.name || a.__name__, c.arity = a.length;
        var d = a.toString();
        return (!c.name || c.arity) && d.replace(/function([^\(]*)\(([^\)]+)\)/g, function(a, b, d) {
            c.name = c.name || b.trim(), c.args = d.trim().split(/\s*,\s*/)
        }), d.indexOf("[native code]") > 0 && (c.native = !0), !c.name && b && "object" == typeof b && (c.name = Object.keys(b).filter(function(c) {
                return b[c] === a
            })[0] || ""), c.name && 0 == c.name.indexOf("get") && c.name.length > 3 && c.name.charAt(3).toUpperCase() === c.name.charAt(3) && !c.args.length ? (c.fieldname = c.name.charAt(3).toLowerCase() + c.name.substr(4), c.isAccessor = "get") : c.name && 0 == c.name.indexOf("set") && c.name.length > 3 && c.name.charAt(3).toUpperCase() === c.name.charAt(3) && 1 == c.args.length && (c.fieldname = c.name.charAt(3).toLowerCase() + c.name.substr(4), c.isAccessor = "set"), c
    }

    function _wrap(orig, nu, options) {
        var optns = options || {}
        var preargs = [].slice.call(arguments, 3),fn
        if(optns===true){optns={argsaslist:true}}
        if(!preargs.length && optns.args){preargs=[].concat(optns.args)}
        else {optns.argsaslist=optns.argsaslist||optns.argsasarray||optns.asarray||optns.asalist}
        if (optns.argsaslist) {
            if(!preargs.length){preargs=false;}
            if (optns.thisasarg) {
                var ctx=optns.context||null
                fn= function () {
                    var args=preargs?preargs.concat([].slice.call(arguments)):[].slice.call(arguments);
                    return nu.call(ctx===null?this:ctx, orig,this,args);
                }
            } else {var ctx=optns.context||null
                fn=function () {
                    var args=preargs?preargs.concat([].slice.call(arguments)):[].slice.call(arguments)
                    return nu.call(this, orig,args);
                }
            }
        } else{
            preargs.unshift(orig)
            var ctx=optns.context||null
            if (optns.thisasarg) {
                fn=function () {
                    var args=preargs.concat([].slice.call(arguments));
                    args.unshift(this)
                    return nu.apply(ctx===null?this:ctx, args);
                }
            } else {
                fn=function () {
                    var args=preargs.concat([].slice.call(arguments));
                    return nu.apply(ctx===null?this:ctx, args);
                }
            }
        }
        if(fn){
            fn.___inner=orig
        }
        return fn;
    }

    function _ispartialArg(a) {
        return "string" == typeof a && ("_" === a || "?" === a|| "*" === a)
    }

    function _partialArgs(fn, optns) {
        var info = _fninfo(fn) || {}, args = [].slice.call(arguments, 2),align
        if(typeof(optns)=="string"){align=optns;optns=null}
        if(!$.isPlain(optns)){optns={}}
        info.partials = {args:[],align:align,indexes:[],optns:optns}
        if (info && (align || info.arity || args.length)) {
            if (args.length && args.some(_ispartialArg)) {

                var partialidx = []
                args.forEach(function (k, i) {
                    if (_ispartialArg(k)) {
                        partialidx.push([i, k])
                    }
                })
                if (partialidx.length) {
                    var ln = partialidx.length - 1;
                    info.partials.indexes= partialidx
                     if (partialidx.length> 1 && partialidx[0][1] == "*") {
                        align = "left";
                    }
                    else if (partialidx.length > 1 && partialidx[ln][1] == "*") {
                        align = "right";
                    }
                    info.partials.args = args;
                }
                info.partials.align = align;
                info.partials.curryargs = align ? args.filter(function (a) {
                    return !_ispartialArg(a)
                }) : args
            }
            info.origfn=fn

        }

        function pendingresolve(memo) {
            var args=[].slice.call(arguments[1])
            var splatIdx=-1
             while(args.length && memo.indexes.length){
                 var I=memo.indexes.shift()
                 if(I && I[0]>=0){
                     if(I[1]=="*"){splatIdx=I[0]}
                     else{memo.args[I[0]]=memo.align=="left"?args.pop():args.shift()}
                 }

            }
            if(memo.indexes.length) {
                if (memo.chain) {
                    return function () {
                        pendingresolve(memo, arguments)
                    }
                } else {
                    while(memo.indexes.length){
                        memo.args[memo.indexes.shift()[0]]=null
                    }
                }
            }
            if(splatIdx>=0 && args.length){
                memo.args.splice.apply(memo.args,[splatIdx,1].concat(args))
            }
            return memo.fn.apply(memo.ctx,memo.args)
        }
        return function(){
            var args=[].slice.call(arguments)
            if(info.partials && info.partials.args){
                 return pendingresolve({indexes:info.partials.indexes.slice(),args:info.partials.args.slice(),fn:info.origfn,ctx:this,chain:info.partials.optns.chain},args)
            }
            return info.origfn.apply(this, arguments)
        }


    }
    fn.wrap2 = function(a, b, c) {
        c = c || null;
        var d = $.fn.resolve(a, c);
        return d ? function() {
            var a = [d].concat([].slice.call(arguments));
            return b.apply(null === c ? this : c, a)
        } : null
    }
    var _fnCache={}
    fn.getCached = function(nm) {
        if(typeof(nm)=="function"){nm=nm.name}
        return _fnCache[nm];
    }
    fn.cache = function(nm,fn) {
        if(typeof(nm)=="function"){fn=nm;nm=fn.name}
        if(nm){_fnCache[nm]=fn;}
    }
    fn.getBody = function(a) {
        return (a || {}).toString().replace(/^([^\{]+\{)|}$/g, "").trim()
    }
    fn.getBody = function(a) {
        return (a || {}).toString().replace(/^([^\{]+\{)|}$/g, "").trim()
    }
    fn.curry = function(fn) {
        var initargs = arguments[1] && {}.toString.call(arguments[1]).indexOf("Arguments") >= 0 ? [].slice.call(arguments[1]) : [].slice.call(arguments, 1)
        return (function(fn, args) {var slice=Array.prototype.slice
                return function() {
                    return fn.apply(this, args.concat(slice.call(arguments)))
                }
            })(fn, initargs)
    }
    fn.rcurry = function(fn) {
        var initargs =  arguments[1] && {}.toString.call(arguments[1]).indexOf("Arguments") >= 0 ? [].slice.call(arguments[1]) : [].slice.call(arguments, 1)
        return (function(fn,  args) {
            var slice=Array.prototype.slice
                return function() {
                    return fn.apply(this, slice.call(arguments).concat(args))
                }
            })(fn, initargs)
    }
    fn.partial = function(a) {
        return _partialArgs.apply(this, [a, ""].concat([].slice.call(arguments, 1)))
    }
    fn.partialChain = function(a) {
        return _partialArgs.apply(this, [a, {chain:true}].concat([].slice.call(arguments, 1)))
    }
    fn.serialize = function(a) {
        return "FN|(" + a.toString() + ")"
    }
    fn.deserialize = function(str) {
        return str && "string" == typeof str && "FN|" == str.substr(0, 3) ? eval(str.substr(3)) : null
    }
    fn.wrap = _wrap
    fn.unwrap = function(a) {
        return a.__inner
    }
    fn.info = _fninfo
    fn.block = function() {}
    fn.getCached = function() {
        var a = {};
        return function(b, c) {
            return c = c || b.name, c ? a[c] || (a[c] = b) : b
        }
    }()
    fn.defer = function(a, b) {
        var c = [].slice.call(arguments, 2),
            d = $.fnize(a);
        return b && Number(b) > 0 || (b = 0), c.unshift(d, b), Function.apply.bind(setTimeout, self, [d, b, 4, 3])
    }
    fn.delay = function(a, b) {
        var c = [].slice.call(arguments),
            d = c[0] = $.fnize(a);
        return $.isNumber(b) || (b = 0), c[1] = Math.max(b, 0), c.length > 2 ? setTimeout.apply(self, c) : setTimeout(d, b)
    }
    fn.resolve = function(fn, ctx) {
        (!ctx || "object" != typeof ctx && "function" != typeof ctx) && (ctx = null);
        var f = fn;
        if ("string" == typeof fn) {
            if (fn.indexOf(".") > 0) {
                var arr = fn.split("."),
                    nm = arr.pop();
                try {
                    var ctx1 = null;
                    f = eval("ctx1 = " + arr.join(".")), ctx1 && (ctx = ctx1, f = ctx[nm])
                } catch (e) {}
            } else console && console[fn] ? ctx = console : Math[fn] && (ctx = Math), ctx || (ctx = self), f = ctx[fn];
            "function" != typeof f && (f = $.fnize(f, {
                context: ctx
            }))
        }
        return "function" != typeof f ? null : f
    }
    fn.spyOn = function(a, b) {
        var c, d = function() {};
        return b && "function" == typeof a[b] ? c = a[b] : "function" == typeof a && (c = a), d.returnValue = function(a) {
            return function() {}
        }, d

    }

    fn.traceCall = function() {
        var nu = new Error("for tracing");
        if(nu.stackTrace){

        }
    }
    fn.Eval=function(a,ctx,onerror){
        var res
        try {
            if (ctx && typeof(ctx) == "object") {
                with(ctx){res=eval(a)}
            } else{
                res = (1, eval)(a)
            }
        } catch(e){
            if(typeof(onerror)=="function"){onerror(e,a)}
            else{
                throw e;
            }
        }
        return res
    }

    fn.generators = function() {
        function a(a) {
            return {}.toString.call(a).indexOf("Arguments") >= 0
        }

        function b(a, b) {
            return [].slice.call(a, b || 0)
        }
        return {
            getObjectProperty: function(a) {},
            getPropertyValue: function(a) {
                return function(b) {
                    return b ? Array.isArray(b) ? b.reduce(function(b, c) {
                        return b[a] = c[a], b
                    }, {}) : b[a] : void 0
                }
            },
            setObjectProperty: function(a) {
                return null == a ? function() {} : function(b, c) {
                    return a[b] = c
                }
            },
            setPropertyValue: function(a) {
                return function(b, c) {
                    return b && (b[a] = c)
                }
            },
            invokeProperty: function(c) {
                var d = a(arguments[1]) ? b(arguments[1]) : b(arguments, 1),
                    e = null;
                return function(f) {
                    return f && "function" == typeof f[c] ? f[c].apply(null === e ? this : f, d.concat(a(arguments[1]) ? b(arguments[1]) : b(arguments, 1))) : null
                }
            },
            wrap: fn.wrap
        }
    }();
    Function.prototype.curry || (Function.prototype.curry = function() {
        return $.fn.curry(this, arguments)
    });
    Function.prototype.curry || (Function.prototype.rcurry = function() {
        return $.fn.rcurry(this, arguments)
    });
    return fn
}()