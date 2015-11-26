/**
 * Created by Atul on 5/20/2015.
 */
$.overload = (function () {
    var typemap = {
        s: "string", str: "string", "string": "string",
        n: "number", num: "number", "number": "number", "1": "number",
        d: "date", date: "date", dat: "date",
        b: "boolean", bool: "boolean", "boolean": "boolean",
        a: "array", arr: "array", "list": "array",
        f: "fn", fn: "fn",
        o: "object", object: "object", "plain": "object",
        e: "element", el: "element", "dom": "element",
        u: "other",
        p: "plain",
        y: "any", ".": "any", ".": "any", "*": "any"
    }

    function noop() {
        return
    }



    var validateMap = {
        "string": function (nullable, df, t) {
            return {df: df == null ? null : String(df), fn: function (v) {
                return    !!((v == null && nullable) || typeof(v) == "string"    )
            }}
        },
        "number": function (nullable, df, t) {
            return {df: df == null ? null : +df, fn: function (v) {
                return  !!((v == null && nullable) || (typeof(v) == "number"   && !isNaN(v)) )
            }}
        },
        "boolean": function (nullable, df, t) {
            return {df: df || false, fn: function (v) {
                return  !!((v == null && nullable) || typeof(v) == "boolean"  )
            }}
        },
        "array": function (nullable, df, t) {
            return {df: df == "[]" ? [] : df, fn: function (v) {
                return  !!((v == null && nullable) || (Array.isArray(v) || (typeof(v) == "object" && v.length >= 0) ))
            }}
        },
        "date": function (nullable, df, t) {
            return {df: null, fn: function (v) {
                return  !!((v == null && nullable) || (typeof(v) == "object" && v instanceof Date) )
            }}
        },
        "object": function (nullable, df, t) {
            return {df: df == "{}" ? {} : df, fn: function (v) {
                return  !!((v == null && nullable) || (typeof(v) == "object")    )
            }}
        },
        "fn": function (nullable, df, t) {
            return  {df: df || null, fn: function (v) {
                return    !!((v == null && nullable) || (typeof(v) == "function")    )
            }}
        },
        "plain": function (nullable, df, t) {
            return {df: df == "{}" ? {} : df, fn: function (v) {
                return  !!((v == null && nullable) || $.isPlain(v))
            }}
        },
        "any": function (nullable, df, t) {
            return {df: df, fn: function (v) {
                return  typeof(v) != "undefined"
            }}
        },
        "other": function (nullable, df, t) {
            var o = t.split(".").reduce(function (m, k) {
                return m ? m[k] : m
            }, self);
            if (o) {
                var ctor = null;
                if (typeof(o) == "object" && !$.isPlain(v)) {
                    ctor = o.constructor;
                    if (o.constructor && (o.constructor !== Object)) {
                        ctor = o.constructor
                    }
                }
                else if (typeof(o) == "function") {
                    ctor = o;
                }
                if (ctor) {
                    return {df: df, fn: function (v) {
                        return  (v == null && nullable) || (typeof(v) == "object" && v instanceof ctor)
                    }}
                }
                if (typeof(o) == "object") {
                    return validateMap.plain(nullable, df, t)
                }
            }
            return validateMap.any(nullable, df, t)
        },
        "element": function (nullable, df, t) {
            return {df: df, fn: function (v) {
                return  (v == null && nullable) || (typeof(v) == "object" && (v.nodeType || v === self))
            }}
        }
    };

    function validatar(t0, nullable, df) {
        var t = t0
        if (typeof(t0) == "string") {
            t = String(t0).toLowerCase()
            if (!typemap[t]) {
                t = ZModule.get(t) || "y"
            }
        } else {
            t = t0
        }
        if (typeof(t) == "function") {
            return (function (t, n, d) {
                return {df: d, fn: function (v) {
                    return (n && v == null) || (v && typeof(v) == "object" && v instanceof t)
                }}
            })(t0, nullable, df);
        } else if (typeof(t) == "object") {
            return (function (t, n, d) {
                return {df: d, fn: function (v) {
                    return (n && v == null) || (v && Object.get(v) == "object" && Object.getPrototypeOf(v) == t)
                }}
            })(t0, nullable, df);
        }
        if (!typemap[t]) {
            t = "y"
        }
        return validateMap[typemap[t]](nullable, df, typemap[t0] || t0)

    }

    function _parse() {
        var mp , deffn0, allmp = [];
        if (arguments.length == 2 && typeof(arguments[1]) == "function") {
            deffn0 = arguments[1];
            mp = arguments[0]
        } else if (typeof(arguments[0]) == "function") {
            deffn0 = arguments[0];
            var a = [].slice.call(arguments, 1);
            if (a.length == 1) {
                mp = a[0]
            } else {
                while (a.length > 1) {
                    var args = a.shift(), fn = a.shift()
                    if (typeof(fn) == "function") {
                        allmp.push({t: args, fn: fn})
                    }
                }
            }
        }
        if (mp && $.isPlain(mp)) {
            $.each(mp, function (v, k) {
                allmp.push({t: k, fn: v})
            })
        }
        var all = []
        allmp.forEach(function (m) {
            var a = [], k = m.t, vfn = m.fn, arr = [];
            if (typeof(k) == "string") {
                arr = k.split(";")
            } else if (Array.isArray(k)) {
                arr = k;
            }
            arr.forEach(function (v) {
                if (!v) {
                    return
                }
                var arr = []
                if (typeof(v) == "string") {
                    arr = v.split(";")
                }
                else if (Array.isArray(v)) {
                    arr = v.slice()
                }

                var t = arr.shift(), nullable = false, df

                df = arr[0]
                if (df == "") {
                    df = null
                }
                if (df == null) {
                    nullable = false
                }
                if (df != null) {
                    if (df == "nill") {
                        nullable = true;
                        df = null
                    }
                    else if (df == "*") {
                        df = t == "number" ? 0 : ""
                    }
                    else if (/\W/.test(df)) {
                        try {
                            var x = (1, eval)("(" + df + "}");
                            df = x;
                        } catch (e) {
                        }
                    } else {
                        if (t == "number") {
                            df = (+df) || 0
                        }
                        else if (f == "fn" && df == "noop") {
                            df = noop
                        }
                    }
                }
                var f = validatar(t, nullable, df)
                f.t = t;
                f.splat = df == "*"
                f.nullable = nullable;
                a.push(f)
            });
            a._nonnullable = a.filter(function (it) {
                return !it.nullable
            }).length
            a._nullable = a.length - a._nonnullable
            all.push({args: a, fn: vfn, len: a.length})
        });
        all.sort(function (a, b) {
            return b.len - a.len
        });
        var ln = all.length;

        function _res(a) {
            var ln2 = a.length
            for (var i = 0; i < ln; i++) {
                if (ln2 != all[i].len) {
                    continue;
                }
                var it = all[i], args = it.args, ln1 = args.length
                var good = it.fn
                for (var j = 0; j < ln1; j++) {
                    if (!args[j].fn(a[j])) {
                        good = null;
                        break
                    }
                    if (a[j] == null) {
                        a[j] = args[j].df
                    }
                }
                if (good) {
                    break;
                }
            }
            if (good) {
                return good
            }
        }

        var deffn = deffn0 || noop
        var ret = function () {
            var a = [];
            if (arguments[0] && ({}).toString.call(arguments[0]).indexOf("Arguments") > 0) {
                a = [].slice.call(arguments[0]).concat([].slice.call(arguments, 1))
            } else {
                a = [].slice.call(arguments)
            }
            var f = _res(a) || deffn
            return f.apply(this, a)
        }
        return ret;
    }

    return _parse
})();
$.overload.compositeAccessor = function (deffn, getterfn, setterfn, setterMapfn, getterArr) {
    if (!setterMapfn) {
        setterMapfn = function setterMapfn(mp) {
            $.each(mp, function (v, k) {
                setterfn(k, v)
            });
            return this
        }
    }
    if (!getterArr) {
        getterArr = function getterArr(arr) {
            return arr.reduce(function (m, v, i) {
                m[v] = getterfn(v);
                return m
            }, {})
        }
    }
    return $.overload(deffn, "s", getterfn, "s;y", setterfn, "o", setterMapfn, "a", getterArr)
}