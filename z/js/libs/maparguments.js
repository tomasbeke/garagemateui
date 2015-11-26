/**
 * Created by Atul on 11/24/2014.
 */
mapArguments: (function () {
    var alias = {   ".": "any", "any": "any",
        n: "number", num: "number",
        "number": "number",
        "int": "number",
        "1": "number", "d": "number", "fl": "float",
        s: "string",
        str: "string",
        "string": "string",
        chr: "string",
        a: "array", arr: "array",
        "array": "array",
        o: "object", "obj": "object",
        "object": "object",
        dt: "date",
        "date": "date", "ts": "date",
        b: "boolean", "bool": "boolean",
        "boolean": "boolean",
        func: "function", "f": "function",
        fn: "function"
    }

    function _resolveargs(a0, arr) {
        arr || (arr = []);
        if (!(a0 && typeof(a0) == "object")) {
            arr.push(a0)
        }
        else if (("toString" in a0) && ({}).toString.call(a0).indexOf("Arguments") >= 0) {
            for (var i = 0, l = a0, ln = l.length, it; it = l[i], i < ln; i++) {
                if (l[i] == "___proto__") {
                    continue
                }
                _resolveargs(it, arr)
            }
        } else {
            arr.push(a0)
        }
        return arr
    }

    return function () {

        var names = [], args = [], a1, ret = {count: 0, args: [], map: {}, match: true};
        if (!arguments.length) {
            return ret
        }
        ;
        if (arguments.length == 1) {
            _resolveargs(arguments[0], args)
        }
        else {
            _resolveargs(arguments, args);
            names = args.shift()
        }
        ;


        var nms = (names || []).slice(), anames = []
        if (args.length != nms.length) {
            ret.match = false;
        }
        for (var i = 0, l = args, ln = args.length, v; v = l[i], i < ln; i++) {
            if (v == "__proto__") {
                continue
            }
            var t = typeof(v), nn = nms.shift();
            var type, m = {name: nn, type: t, value: v}
            ret.args.push(m);
            if (!nn && v) {
                if (v.constructor && v.constructor.name) {
                    m.type = v.constructor.name;
                    m.type = alias[String(m.type).toLowerCase()] || m.type
                }
            }
            else {
                var a = String(nn).split(":"), nm = a.shift(), type0 = a.shift(), deflt = a.shift()
                type = type0 ? (alias[type0] || type0) : null
                if (!type && alias[nm]) {
                    type = nm
                }
                m.name = nm;
                ret.map[nm] = null;
                if (type && !alias[type0] && typeof(Data) != "undefined" && $.typeInfo) {
                    var t1 = $.typeInfo(type);
                    if (t1 && t1.ctor) {
                        type = t1.ctor
                        if (v && typeof(v) == "object" && v instanceof t1.ctor) {
                            t = type
                        }
                    }
                } else {
                }
                m.type = type
                if (type == "number" && t == "string" && !isNaN(v)) {
                    t = type;
                    v = Number(v)
                }
                if (type == "any" || type == t) {
                    var k0 = nm || (t + i), k = k0

                    //while(k in ret.map){k=k0+"_"+(++i)};
                    m.map[k] = v
                } else {
                    ret.match = false
                }

            }

        }
        ret.count = args.length;
        return ret;
    }
})()