/**
 * Created by Atul on 5/20/2015.
 */
function browser() {
    var t = true, o = {};
    (function (scp, ns, fctr) {
        var b = fctr(navigator.userAgent, navigator.vendor || "").browser || {}, pr, st = document && document.defaultView && document.defaultView.getComputedStyle;
        if (st) {
            pr = (st ? st(document.documentElement || document.body, null).cssText.match(/;\s*\-([\w]+)\-[\w\-]+\s*:/) || [""] : [""]).pop()
            if (pr) {
                b.x = pr
            }
        }
        b.css3pr = "-" + b.x + "-";
        b.prefix = b.x;
        b.name = b.n;
        b.version = b.v;
        b[b.n.toLowerCase()] = true;
        if (b.x) {
            b[b.x] = b[b.x.toLowerCase()] = true;
        }
        delete b.x;
        delete b.n;
        delete b.v;
        var fidx=(location.href||"").toLowerCase().indexOf("file");
        if(fidx>=0 && fidx<2){
            b.hostedApp=true
        }
        ((b.msie && b.version > 8) || (b.chrome && b.version >= 10) || (b.firefox && b.version >= 4) || (b.safari && b.version >= 5) || (b.opera && b.version >= 10)) ? b.modern = t :
            ((b.msie && b.version <= 8) || (b.chrome && b.version < 10) || (b.firefox && b.version < 4) || (b.safari && b.version < 5) || (b.opera && b.version < 10)) ? b.obsolete = t : b.modern = t
        b.isTouchDevice =
            (navigator.MaxTouchPoints > 0)
            ||  (navigator.msMaxTouchPoints > 0)
            ||  (typeof($d) != "undefined" && $.viewPort && $.viewPort.get().width < 450)
            ||  b.hostedApp;

        if (b.isTouchDevice) {
            window.isTouchDevice = true
        }
        scp[ns] = b;
        Object.freeze(b);
        delete scp[ns];
        $.defineProperty(scp, ns, {value: b, writable: false, configurable: false, enumerable: false})
    })($, "browser",
        function x11(e, vndr) {
            var o = {}

            function test(re, txt) {
                return re.test(txt)
            };
            function match(txt, re, i) {
                var r = txt.match(re);
                return i == null ? !!r : (r || [])[i]
            }

            var t = !0 , iph = test(/iphone/i, e), m = /firefox\/(\d+(\.\d+)?)/i, h = test(/firefox/i, e), a, i, r, v = /version\/(\d+(\.\d+)?)/i, g;
            o.browser = test(/(msie|trident)/i, e) ? {n: "Internet Explorer", x: "ms", msie: t, it: t, IE: t, v: match(e, /(msie |rv:)(\d+(\.\d+)?)/i, 2)} :
                (r = test(/chrome|crios/i, e)) ? {n: test(/opera/i, vndr) ? "Opera" : "Chrome", x: "webkit", chrome: t, v: match(e, /(?:chrome|crios)\/(\d+(\.\d+)?)/i, 1)} :
                    (test(/opera|opr/i, e) || test(/opera/i, vndr)) ? {n: "Opera", x: 0} :
                        (i = test(/phantom/i, e)) ? {n: "PhantomJS", x: "webkit", phantom: t, v: match(e, /phantomjs\/(\d+(\.\d+)+)/i, 1)} :
                            (a = test(/silk/i, e)) ? {n: "Amazon Silk", x: "webkit", android: t, mobile: t, v: match(e, /silk\/(\d+(\.\d+)?)/i, 1)} :
                                test(/touchpad/i, e) ? {n: "TouchPad", x: "webkit", touchpad: t, v: match(e, /touchpad\/(\d+(\.\d+)?)/i, 1)} :
                                    test(/ip(hone|pad)/i, e) ? (g = {n: iph ? "iPhone" : "iPad", x: "webkit", mobile: t, ios: t, iphone: iph, ipad: !iph}, v.test(e) && (g.v = match(e, v, 1)), g) :
                                        test(/android/i, e) ? {n: "Android", x: "webkit", android: t, mobile: t, v: ( match(e, v) || match(e, m), 1)} :
                                            test(/safari/i, e) && !r && !i && !a ? {n: "Safari", x: "webkit", safari: t, v: match(e, v, 1)} :
                                                test(/gecko\//i, e) ? (g = {n: "Gecko", x: "moz", gecko: t, mozilla: t, v: match(e, m, 1)}, h && (g.n = "Firefox"), g) :
                                                    test(/seamonkey\//i, e) ? {n: "SeaMonkey", x: "moz", seamonkey: t, v: match(e, /seamonkey\/(\d+(\.\d+)?)/i, 1)} : {};
            return o
        });
    return o.browser;
}