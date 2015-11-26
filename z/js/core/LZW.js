/**
 * Created by Atul on 5/20/2015.
 */
var LZW  ={
    encode: function (t) {
        var n = {}, r = (t + "").split(""), i = [], s, o = r[0], u = 256;
        for (var a = 1, f = r.length, s; s = r[a], a < f; a++) {
            if (o + s in n) {
                o += s
            } else {
                i.push(o.length > 1 ? n[o] : o.charCodeAt(0));
                n[o + s] = u;
                u++;
                o = s
            }
        }
        i.push(o.length > 1 ? n[o] : o.charCodeAt(0));
        for (var a = 0, l = i.length; a < l; a++) {
            i[a] = String.fromCharCode(i[a])
        }
        return i.join("")
    }, decode: function (t) {
        var n = {}, r = (t + "").split(""), i = r[0], s = i, o = [i], u = 256, a;
        for (var f = 1, l = r.length; f < l; f++) {
            var c = r[f].charCodeAt(0);
            a = c < 256 ? r[f] : n[c] ? n[c] : s + i;
            o.push(a);
            n[u] = s + (i = a.charAt(0));
            u++;
            s = a
        }
        return o.join("")
    }
}