/**
 * Created by Atul on 5/20/2015.
 */
$.numberFormat = (function () {

    var _formatCache = {
            "###,###.##": { name: "deflt", decimalSep: ".", groupSep: ",", decimals: 2, groupsize: 3, lastgroupsize: 3},
            "###,##0.00": { name: "numeric", decimalSep: ".", groupSep: ",", decimals: 2, groupsize: 3, lastgroupsize: 3},
            "###,##0": { name: "int", decimalSep: ".", groupSep: ",", negformat: "", decimals: 2, groupsize: 3, lastgroupsize: 3},
            "$###,##0": { name: "int", decimalSep: ".", groupSep: ",", negformat: "", decimals: 2, groupsize: 3, lastgroupsize: 3}

        }, defformat = "###,####.##", _formatCacheByName = null,
        defpattern = { decimalSep: ".", groupSep: ",", format: "", negformat: "", wrap: ["", ""], decimals: 2, groupsize: 2, lastgroupsize: 3}
    var makepattern = function (rcvr) {
        rcvr || (rcvr = {});
        Object.keys(defpattern).forEach(function (k) {
            rcvr[k] = $.clone(defpattern[k])
        })
        return defpattern;
    }


    return function numberFormat(v0, f, ashtml) {
        if(typeof(v0)=="string"&& !v0.trim()){return ""}
        if(!v0 && v0!==0){return ""}
        var n = ~~v0;
        var patternstr = "", pattern = {}, sign = "", res = [], v = String(v0).replace(/[^\.\d]/g, "").trim()
        if (n < 0) {
            sign = "-"
        }
        makepattern(pattern)
        pattern.wrap = pattern.wrap||["", ""]
        if (!_formatCacheByName) {
            _formatCacheByName = {}
            $.each(_formatCache, function (v, k) {
                if (v) {
                    v.format = k;
                    _formatCacheByName[v.name || k] = v

                }
            })
        }
        if (!f) {
            f = _formatCacheByName.deflt;
        }
        if (f && typeof(f) == "object") {
            Object.keys(f).forEach(function (k) {
                pattern[k] = f[k]
            })
        } else {
            var a = String(f), types = a.split(/;/).filter(function (a) {
                return String(a).trim().length > 1
            })
            patternstr = a;
            if (types.length > 1) {
                if (!n && types[2]) {
                    a = types[2];
                    v = "0";
                }
                if (n < 0 && types[1]) {
                    sign = "";
                    a = types[1]
                }
                else {
                    a = types[0]
                }
                patternstr = a;
            }
            patternstr = a;
            if (_formatCache[a] || _formatCacheByName[a]) {
                pattern = _formatCache[a] || _formatCacheByName[a]
                if (!pattern.format) {
                    pattern.format = a;
                }
            } else {
                var seps = []
                if (/\.0+$/.test(a)) {
                    if (a.indexOf(",") > 0) {
                        seps = [",", "."]
                    }
                    else {
                        seps = ["", "."]
                    }
                }
                else {
                    seps = a.substr(1).match(/[\,\.]/g) || []//^\[\]%\s\w\#\(\)\-\+\$
                    if (seps.length == 1 && seps[0] == ".") {
                        seps = ["", "."]
                    }
                    else {
                        while (seps.length > 2) {
                            seps.shift()
                        }
                    }
                }

                pattern.groupSep = seps.shift();
                if (seps.length) {
                    pattern.decimalSep = seps.pop();
                }
                a = a.replace(/^[^#\d\.]+/g, function (b) {
                    if (/^\[[^\]]+\]/.test(b)) {
                        b = b.replace(/^\[([^\]]+)\]/, function (a1, b1) {
                            pattern.color = b1;
                            return ""
                        })
                    }
                    pattern.wrap[0] = b;
                    return ""
                })
                a = a.replace(/[^#\d\.]+$/g, function (a) {
                    pattern.wrap[1] = a;
                    return ""
                })
                if (a.charAt(0) == "(" && a.charAt(a.length - 1) == ")") {
                    pattern.wrap = [a.charAt(0), a.charAt(a.length - 1)]
                    a = a.substring(1, a.length - 1)
                }
                pattern.format = a

            }
        }
        if (!(pattern.top && pattern.groupsize) && pattern.format) {
            var df1 = pattern.format.split(pattern.decimalSep)
            pattern.top = df1.shift();
            pattern.decimalformat = df1.pop() || ""
            if (pattern.groupSep && pattern.top.indexOf(pattern.groupSep) > 0) {
                var parts = pattern.top.split(pattern.groupSep).map(function (it) {
                    return it.replace(/[^\d\#]/g, "").length
                })
                pattern.groupsize = parts[0] || 0
                pattern.lastgroupsize = parts[parts.length - 1] || 0;
            }
        }

        var fin = [], dec = [] ,
            vparts = v.split("."), v0 = vparts.shift(), decpart = String(vparts[0] || ""),
            sarr = v0.split(""), ln = sarr.length,
            w = pattern.lastgroupsize , cn = 0;
        if (w && w > 0 && w < sarr.length) {
            [].unshift.apply(res, sarr.splice(ln - w, w));
            ln = sarr.length
            ln && res.unshift(pattern.groupSep);
        }

        if (pattern.groupsize && pattern.groupsize > 1) {
            cn = 0
            w = pattern.groupsize
            while (sarr.length > w) {
                if (++cn > 20) {
                    break;
                }
                [].unshift.apply(res, sarr.splice(sarr.length - w, w));
                sarr.length && res.unshift(pattern.groupSep);
            }
        }
        if (sarr.length) {
            [].unshift.apply(res, sarr)
        }
        String(pattern.top).split("").reverse().forEach(function (k) {
            if ((k == "#" || k == pattern.groupSep)) {
                res.length && fin.unshift(res.pop())
            } else if (k == "0") {
                fin.unshift(res.length ? res.pop() : k)
            } else {
                fin.unshift(k)
            }
        });
        if (res.length) {
            [].unshift.apply(fin, res);
        }


        if (pattern.decimalformat && pattern.decimalformat.length) {
            for (var i = 0, l = pattern.decimalformat.split(""), ln = l.length; i < ln; i++) {
                if ((l[i] == "#" || l[i] == "0") && decpart.length > i) {
                    dec.push(decpart.charAt(i))
                }
                else if (l[i] != "#") {
                    dec.push(l[i])
                }
            }
        }
        patternstr && (_formatCache[patternstr] || (_formatCache[patternstr] = pattern));
        if (dec.length) {
            fin.push(pattern.decimalSep + dec.join(""))
        } else {
            decpart = ""
        }
        if (sign) {
            fin.unshift(sign)
        }
        pattern.wrap = pattern.wrap||["", ""]
        fin.unshift(pattern.wrap[0] || "");
        fin.push(pattern.wrap[1] || "")

        if (ashtml && pattern.color) {
            fin.unshift("<span style='color:" + pattern.color + "'>");
            fin.push("</span>")
        }
        while (fin.length && !fin[0]) {
            fin.shift()
        }
        if (fin[0] == ",") {
            fin.shift()
        }
        return fin.join("")
    }
    return numberFormat
})();