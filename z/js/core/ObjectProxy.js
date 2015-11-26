/**
 * Created by Atul on 5/20/2015.
 */
function makeProxy(target) {
    var par = target, nuProps = {}, props = [], proxyhandler = arguments[1], asfirstarg = arguments[2] === true, argunwrapper = arguments[4],
        checkforCollection = arguments[3] === true ? true : false;
    argunwrapper = typeof(argunwrapper) != "function" ? function(a){return a} : argunwrapper
    if (proxyhandler == null) {
        proxyhandler = Object.create(null)
    }
    if (!proxyhandler.___proto) {
        $.defineProperty(proxyhandler, "___proto", {
            value: target,
            writable: false,
            enumerable: false,
            configurable: false
        })
        $.defineProperty(proxyhandler, "valueof", {
            value: function () {
                return this.___baseel
            }, writable: false, enumerable: false, configurable: true
        })
    }
    while (par && (typeof(par) == "object" || typeof(par) == "function") && par != Object.prototype) {
        for (var i = 0, l = Object.keys(par), ln = l.length, k; k = l[i], i < ln; i++) {
            if (!~props.indexOf(k) && !(k in proxyhandler)) {
                props.push(k)
            }
        }
        par = Object.getPrototypeOf(par);

    }
    for (var i = 0, l = props, ln = l.length, k; k = l[i], i < ln; i++) {
        if (typeof(k) != "string" || (k == "el" || k.indexOf("__") == 0)) {
            continue
        }
        var valuefn,descrptor = Object.getOwnPropertyDescriptor(target, k) || {}, argun = function(){ argunwrapper};
        if (typeof(target[k]) == "function" || ("value" in descrptor && (typeof(descrptor.value) == "function" ))) {
            (function (propname, f,pr) {

                var fun= Function.prototype.apply.bind(f);
                if(asfirstarg) {
                    if (checkforCollection) {
                        valuefn = function () {
                            var r = [], args = [].map.call(arguments,argun), a,it;
                            for (var i = 0, l = this, ln = l.length; i < ln; i++) {
                                (it = l[i]) && typeof(it) === "object" && r.push(fun(it.___proto, [it].concat(args)))
                            }
                            return r;
                        }
                    } else {
                        valuefn = function () {
                            return   fun(this.___proto, [this].concat([].map.call(arguments,argun)))
                        }
                    }
                } else {
                    if (checkforCollection) {
                        valuefn = function () {
                            var r = [], args = [].map.call(arguments,argun),   it;
                            for (var i = 0, l = this, ln = l.length;  i < ln; i++) {
                                (it = l[i])  && typeof(it) === "object" && r.push(fun(argun(it),  args ))
                            }
                            return r;
                        }
                    } else {
                        valuefn = function () {
                            return   fun(argun(this) ,  [].map.call(arguments,argun))
                        }
                    }
                }
                /* if (checkforCollection) {
                 descrip.value = function () {
                 var r = [], fun = fn, args = [].map.call(arguments,argun), a;
                 for (var i = 0, l = this, ln = l.length, it; it = l[i], i < ln; i++) {
                 it && typeof(it) === "object" && r.push(fun.apply(it.___proto, [it].concat(args)))
                 }
                 return r;
                 }
                 } else {var fun=f;
                 descrip.value = function () {
                 fun.apply(it.___proto, [it].concat(args))
                 return fn(this, [].map.call(arguments,argun))
                 }
                 }
                 }
                 var fn = asfirstarg ? function (ths, args) {
                 return f.apply(ths.___proto, [ths].concat(args))
                 } : function (ths, args) {
                 return f.apply(ths.___baseel || (argun ? argun(ths) : ths), args)
                 }
                 if (checkforCollection) {
                 descrip.value = function () {
                 var r = [], fun = fn, args = [].map.call(arguments,argun), a;
                 for (var i = 0, l = this, ln = l.length, it; it = l[i], i < ln; i++) {
                 if ((it != null && typeof(it) === "object")) {
                 r.push(fun(it, args))
                 }
                 }
                 return r;
                 }
                 } else {
                 descrip.value = function () {
                 return fn(this, [].map.call(arguments,argun))
                 }
                 }
                 */
                valuefn._name = propname;
                for (var i2 = 0, l2 = Object.keys(f), ln2 = l2.length, k2; k2 = l2[i2], i2 < ln2; i2++) {
                    k2 && (valuefn[k2] = f[k2]);
                }
                pr[propname] =  {
                    value: valuefn,
                    enumerable: !!descrptor.enumerable
                };
            })(k, typeof(target[k]) == "function"?target[k] : descrptor.value,nuProps)
        }
        else {
            (function (kk, pr) {
                var nm = kk;
                var sttr = checkforCollection ? function (v) {
                    [].forEach.call(this, function (it) {
                        it && (it[nm] = v);
                    });
                } : function (v) {
                    (this.___baseel || this.___proto||{})[nm] = v;
                }
                var gttr = checkforCollection ? function () {
                    return [].map.call(this, function (it) {
                        return (it || {})[nm]
                    })
                } : function () {
                    return (this.___baseel || this.___proto||{})[nm]
                }

                pr[nm] = {get: gttr, set: sttr, enumerable: true}
            })(k, nuProps)
        }
    }
    Object.defineProperties(proxyhandler, nuProps)
    return proxyhandler
}