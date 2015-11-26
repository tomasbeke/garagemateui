/**
 * Created by Atul on 5/20/2015.
 */
$.LinkedMap = (function () {
    var _setup = null, LinkedMap = null

    function _getctor() {
        if (!LinkedMap) {
            LinkedMap = function LinkedMap(iterable) {
                if (!(this instanceof LinkedMap)) {
                    return new LinkedMap(iterable)
                }
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
            }
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
                size: function () {
                    return this.keys(true).length
                },
                has: function (o) {
                    return this.keys(true).indexOf(o) >= 0
                },
                keys: function (nocopy) {
                    var i = this.__inner();
                    return i ? (nocopy === true ? i.K : i.K.slice()) : []
                },
                values: function (nocopy) {
                    var i = this.__inner();
                    return i ? (nocopy === true ? i.V : i.V.slice()) : []
                },
                get: function (o) {
                    return this.values(true)[this.keys(true).indexOf(o)]
                },
                set: function (o, val) {
                    var i = this.keys(true).indexOf(o) , curr = null;
                    if (i < 0) {
                        i = this.keys(true).push(o) - 1
                    } else {
                        curr = this.values(true)[i]
                    }
                    this.values(true)[i] = val;
                    return curr
                },
                overlay: function (nuentries) {
                    var v = this.values(true), l = this.keys(true),ln=nuentries.length;
                    if(l.length>ln){l.length=0;v.length=0;}
                    for(var i= 0,it;it=nuentries[i],i<ln;i++) {
                        l[i]=it[0];v[i]=it[1]
                    }
                    return this
                },
                clear: function (nodestroy) {
                    var v = this.values(true), l = this.keys(true);
                    if(!nodestroy) {
                        for (var i = 0, ln = l.length; i < ln; i++) {
                            l[i] = v[i] = null
                        }
                    }
                    l.length = v.length = 0;
                    return this
                },
                "delete2": function (o) {
                    var l = this.keys(true), i = k.indexOf(o) , curr = null;
                    if (i >= 0) {
                        l.splice(i, 1);
                        curr = (this.values(true).splice(i, 1) || [])[0];
                    }
                    return curr;
                },
                forEach: function (callbackFn, thisArg, ctx) {
                    if (typeof(callbackFn) != "function") {
                        return null
                    }
                    var v = this.values(true), l = this.keys(true);
                    for (var i = 0, ln = l.length; i < ln; i++) {
                        callbackFn.call(thisArg, v[i], l[i], ctx == null ? thisArg : ctx)
                    }
                    return this
                },
                entries: function () {
                    var r = []
                    this.forEach(function (v, k) {
                        r.push([k, v])
                    })
                    return r
                }
            }


            proto.each = function (fn, ctx) {
                this.forEach(fn, ctx)
            };
            proto.sortBy = function (fn, mutate) {
                var vals = this.entries()||[],nuentries=[], target;
                this.entries().sort(function (a, b) {
                        return fn({key: a[0], value: a[1]}, {key: b[0], value: b[1]})
                    }
                ).forEach(function (a) {nuentries.push(a)})

                target =mutate?this: new LinkedMap()
                target.overlay(nuentries);
                return target
            }
            proto.map = function (fn, ctx) {
                var r = [], t = this;
                this.each(function (v, k) {
                    r.push(fn.call(ctx, v, k, t))
                });
                return r
            }
            proto.pluck = function (k1) {
                return this.map(function (v, k) {
                    return v ? v[k1] : null
                })
            }
            proto.invoke = function (fnnm) {
                var a = [].slice.call(arguments, 1);
                return this.map(function (v, k) {
                    return v && typeof(v[fnnm]) == "function" && v[fnnm].apply(null, a)
                })
            }
            proto.filter = function (fn, ctx, mutate) {
                var r = [], t = this, target;
                if (typeof(ctx) == "boolean") {
                    mutate = ctx;
                    ctx = null
                }
                this.forEach(function (v, k) {
                    fn.call(ctx, v, k, t) && r.push([k, v])
                });
                target =mutate?this: new LinkedMap()
                target.overlay(r);
                return target
            }
            proto.find = function (fn, ctx) {
                for (var i = 0, r = this.entries(), ln = r.length; i < ln; i++) {
                    if (fn.call(ctx, r[i][1], r[i][0], this)) {
                        return r[i]
                    }
                }
            }
            proto.some = function (fn, ctx) {
                return !!this.find(fn, ctx)
            }
            proto.every = function (fn, ctx) {
                for (var i = 0, r = this.entries(), ln = r.length; i < ln; i++) {
                    if (!fn.call(ctx, r[i][1], r[i][0], this)) {
                        return false
                    }
                }
                return true
            }
            proto.reduce = function (fn, init, ctx) {
                var ths = this, Nill = {}, val = arguments.length == 1 ? Nill : init
                this.forEach(function (v, k) {
                    if (val === Nill) {
                        val = v
                    } else {
                        val = fn.call(ctx, val, v, k, ths)
                    }
                })
                return val
            }
            proto.findAll = function (fn, ctx) {
                return this.filter(fn, ctx)
            }
            proto.findResults = function (fn, ctx) {
                return this.map(typeof(fn) != "function" ? function (v) {
                    return v
                } : fn, ctx).filter(function (a,b) {
                    return !!a
                })
            }
            proto.findResult = function (fn, ctx) {
                var ent = null
                for (var i = 0, r = this.entries(), ln = r.length; i < ln; i++) {
                    if (ent = fn.call(ctx, r[i][1], r[i][0], this)) {
                        break
                    }
                }
                return ent ? {key: ent[0], value: ent[1]} : null
            }
            proto.getAt = function (i) {
                var ent
                if (typeof(i) == "number") {
                    ent = this.entries()[i < 0 ? this.size() + i : i]
                } else {
                    ent = this.entries().filter(function (t) {
                        return t[0] && t[0] == i
                    })[0]
                }
                return ent ? {key: ent[0], value: ent[1]} : null
            }
            proto.first = function () {
                return this.getAt(0)
            }
            proto.last = function () {
                return this.getAt(-1)
            }
            LinkedMap.prototype = proto;
        }
        return LinkedMap
    }

    var _linkedmap = function (data) {
        if (!_setup) {
            _getctor()
        }
        return new LinkedMap(data)
    }
    return _linkedmap

})();