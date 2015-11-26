$d.util=$d._util={
    tagNames:'html head meta head  link  title base  body style  nav header footer main aside article section h1 h2 h3 h4 h5 h6 hgroup h1 h6 div p pre blockquote hr ul ol li ul ol dl dt dd span a em strong b i u s mark small del ins del sup sub dfn code  var samp kbd q cite ruby rt ruby rp ruby br wbr bdo bdi table caption tr td th thead tfoot tbody colgroup col colgroup img figure figcaption map area video audio source video audio   track script noscript  object param object embed iframe canvas abbr  address meter progress time form button input textarea select option select optgroup label fieldset legend keygen command datalist menu output details summary acronym abbr applet embed object bgsound audio basefont big  center dir ul font  frame frameset noframes strike s tt code samp xmp pre'.split(/\s+/),
    _fx:[], defrule:"",cloadiv:null,_currentmousePos:{x:0,y:0},__hiddenprop:null,
    animframe : window.requestAnimationFrame.bind(window),
	nativeMethods : {
        "string": "anchor  big  blink  bold  charAt  charCodeAt  concat  fixed  fontcolor  fontsize  indexOf  italics  lastIndexOf  link  localeCompare  match  replace  search  slice  small  split  strike  sub  substr  substring  sup  toLowerCase  toLocaleLowerCase  toLocaleUpperCase  toUpperCase".split(/\s+/),
        "number": "toExponential toFixed toPrecision".split(/\s+/),
        "math": "abs  acos  asin  atan  atan2  ceil  cos  exp  floor  log  max  min  pow  random  round  sin  sqrt  tan".split(/\s+/),
        "date": "getDate  getDay  getMonth  getFullYear  getHours  getMilliseconds  getMinutes  getSeconds  getTime  getTimezoneOffset  getUTCDate  getUTCDay  getUTCFullYear  getUTCHours  getUTCMilliseconds  getUTCMinutes  getUTCMonth  getUTCSeconds  getYear  setDate  setFullYear  setHours  setMilliseconds  setMinutes  setMonth  setSeconds  setTime  setUTCDate  setUTCFullYear  setUTCHours setUTCMilliseconds  setUTCMinutes  setUTCMonth  setUTCSeconds  setYear  toDateString  toISOString  toLocaleDateString  toLocaleString  toLocaleTimeString  toTimeString  toUTCString".split(/\s+/),
        "boolean": []
    },
    getHiddenProp : function() {
        if ($d._util.__hiddenprop) {
            return $d._util.__hiddenprop
        }
        var prefixes = ['webkit', 'moz', 'ms', 'o'],
            doc = document;
        if ('hidden' in doc) {
            $d._util.__hiddenprop = 'hidden';
        } // if 'hidden' is natively supported just return it
        else { // otherwise loop over all the known prefixes until we find one
            for (var i = 0; i < prefixes.length; i += 1) {
                if ((prefixes[i] + 'Hidden') in doc) {
                    $d._util.__hiddenprop = prefixes[i] + 'Hidden';
                }
            }
        }
        // otherwise it's not supported
        return $d._util.__hiddenprop;
    },
    storeCurrentPos:function(ev){
        var p=$d._util._currentmousePos||($d._util._currentmousePos={});
        if(ev&&ev.x!=null){
            p.x=ev.x;
            p.y=ev.y;
        }
        if(ev && ev.target && ev.target!=document && ev.target!=document.body){
            $d._util._currentmousePos.target=ev.target.id||ev.target
        }
    },
    createScopedDollar : function(elprop,base) {
        return (function(prop,root){
            var rootEl=root
            return function(selector) {
                var parent=null,scoped
                if(rootEl){parent=$d($.resolveProperty(this,rootEl))}
                if(parent){
                    scoped=parent.q(prop);
                } else{
                    scoped=$d(prop? $.resolveProperty(this,prop):this)
                }
                 if (!scoped) {
                    return null
                }
                var el=selector ? scoped.q(selector) : scoped
                if(!el){return}
                var scopeddomele=$.objectMap.getOrCreate(this,"scopeddomele")
                if(!scopeddomele){scopeddomele={}}
                if(!selector){selector="."}
                var ret,wr=scopeddomele[selector]
                if(wr && wr.el && wr.el.el===el.el){
                    ret=wr.el
                }
                if(!ret){
                    ret=Object.create(el,{
                        on:{value:$.fn.partial(el.on,"_","_","_",this)} //rcurry scoped delegate
                    })
                    //ret.on= $.fn.partial(el.on,"_","_","_",ret)
                    scopeddomele[selector]={id:el.id,el:ret}
                }

                return ret
            }
        })(elprop,base)
    },
    parseMatrix:function parseMatrix (matrixString) {
    var c = String(matrixString).replace(/matrix|\)|\(/g, "").split(/\s*,\s*/),
        matrix;

    if (c.length === 6) {
        // 'matrix()' (3x2)
        matrix = {
            m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
            m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
            m13: 0,     m23: 0,     m33: 1, m43: 0,
            m14: 0,     m24: 0,     m34: 0, m44: 1
        };
    } else if (c.length === 16) {
        // matrix3d() (4x4)
        matrix = {
            m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
            m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
            m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
            m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
        };

    } else {
        // handle 'none' or invalid values.
        matrix = {
            m11: 1, m21: 0, m31: 0, m41: 0,
            m12: 0, m22: 1, m32: 0, m42: 0,
            m13: 0, m23: 0, m33: 1, m43: 0,
            m14: 0, m24: 0, m34: 0, m44: 1
        };
    }
    return matrix;
},
    _mousePos :(function() {
        var d = null,   de = null,   b = null
        return function _mousePos(e,p ) {
            p = p||{};
            if (d === null) {
                d = document;  de = document.documentElement;  b = document.body
            }
            if (!(e || (e = window.event))) {
                return
            }

            if (e.pageX || e.pageY) {
                p.x = e.pageX;  p.y = e.pageY;
            } else if (e.clientX || e.clientY) {
                p.x = e.clientX + (b.scrollLeft || 0) + (de.scrollLeft || 0);
                p.y = e.clientY + (b.scrollTop || 0) + (de.scrollTop || 0);
            } else {
                if (e.touches || String(e.type).toLowerCase().indexOf("touch") == 0) {
                    var  ev = e,
                        target = (ev.changedTouches||[])[0]||(ev.targetTouches||[])[0]||(ev.targetTouches||[])[0];
                    if (target) {
                        if (target.pageX || target.pageY) {
                            p.x = target.pageX;
                            p.y = target.pageY;
                        } else if (target.clientX || target.clientY) {
                            p.x = target.clientX + (b.scrollLeft || 0) + (de.scrollLeft || 0);
                            p.y = target.clientY + (b.scrollTop || 0) + (de.scrollTop || 0);
                        }
                    }
                }
            }
            return p
        }
    })(),
    scrollPage:function scrollPage(el,scrollDuration,onend) {
        if(typeof(el)=="function"){
            onend=el;
            el=document.body
        }
        if(typeof(scrollDuration)=="function"){
            onend=scrollDuration;
            scrollDuration=0
        }
        if(typeof(onend)!=="function"){
            onend=function(){}
        }
        scrollDuration=scrollDuration||500
        var end=-1;
        if(el && el.nodeType){
            var bounds=el.getBoundingClientRect();
             end=Math.max(el.offsetTop,bounds.top<0?(start+bounds.top):bounds.top) ;
        } else if(typeof(el)=="number"){
            end=el;
        }

        var start = window.scrollY,
            maxOffset= 5,
            scrollStep = Math.PI / ( scrollDuration / 15 ),
            cosParameter = Math.max(end,start ) / 2,
            scrollCount =  0,
            maxIter=10000,//to avoid runaway loop
            running=start,
            inc=start>end?-1:1;
            if(end<0 || Math.abs(running - end) < maxOffset){
                onend();
                return;
            }
        function isDone (endnow) {
            if ( endnow || Math.abs(running - end) < maxOffset || !maxIter) {
                setTimeout(onend,50);
                return true
            }
        }
        requestAnimationFrame(step);
        function step () {
            maxIter--;
            if(isDone ()){return}
            scrollCount = scrollCount + 1;
            var scrollMargin = cosParameter - cosParameter * Math.cos( scrollCount * scrollStep),
                nu=start + (scrollMargin * inc),
                endnow=false;
            if((inc<0 && (nu>running || nu < end)) || (inc>0 && (nu<running|| nu > end))){
                endnow=true; nu=end;
            }
            running=nu;
            window.scrollTo( 0, running );
            if ( !isDone (endnow) ) {
                requestAnimationFrame(step);
            }
        }

    },
    mousePos :function(e,p) {
         if (e && ("x" in e && "y" in e)){
            if(p===null || p===e){return e}
            if(p){
                p.x= e.x;p.y= e.y
                return p
            }
            return {x: e.x,y: e.y}
        }
         return $d.util._mousePos(e,p)
        },
    getActiveElement:function(container){
        var active=$d($d.util._currentmousePos.target||document.activeElement)
        if(active && container && container.nodeType && !container.contains(active.el)){
            active=null
        }
        return  active
    },
    getHoverElement:function(container){
        var activeEls=[].slice.call(document.querySelectorAll(":hover"))
        if(container && container.nodeType){
            activeEls=activeEls.filter(function(a){return container.contains(a)})
        }
        return activeEls.pop()
    },
    isValidTagName:function(a){
        return a && typeof(a)=="string" && (this.tagNames.indexOf(a.toLowerCase())>=0 || (!/[^a-z\-]/i.test(a)  && a.indexOf("-")>0))
    },
    cloak:function(options){
        options=options||{}
        var cloakdiv=$d(document.body.appendChild(document.createElement("div")))
        if(!options.behind){
            cloakdiv.toFront()
        }
        cloakdiv.addClass("cloak")
        cloakdiv.style.cssText="position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:#A2C5E5;opacity:.1;transition:opacity .2s ease"

        cloakdiv.setZ=function() {
            var options=this.data("options")||{}
            if(options.behind && $d(options.behind)) {
                var z = Number($d(options.behind).css("zIndex") || 0),thsZ=(+this.css("zIndex"))||0
                if(z <= thsZ){alert(z)
                    this.css("zIndex", z - 1)
                }


            }
        }
        cloakdiv.setMessage=function setMessage(message,messagestyle){
            var msg=this.q(".cloak-msg")
            if(!(msg && message)){return}
            if(!msg){
                msg=this.append("div.cloak-msg")
            }
            if(messagestyle){
                msg.css(messagestyle)
            }
            if(typeof(message)=="function"){
                msg.html(message(this))
            } else {
                msg.html(String(message||""))
            }
        }
        cloakdiv.resetPos=function(){
            var options=this.data("options")||{}
            var target=options.target?$d(options.target):null,bounds=target?target.bounds():null
            if(bounds){
                this.el.style.height=bounds.height+"px"
                this.el.style.width=bounds.width+"px"
                this.el.style.top=bounds.top+"px"
                this.el.style.left=bounds.left+"px"
            }
        }

        cloakdiv.data("options",$.clone(options))
        cloakdiv.on("click",function(){
            var options=this.data("options")||{}
            if(options.onclick){
                options.onclick.call($d(this))
            }
            if(!options.nodestroy){
                this.remove()
            }
        })
        cloakdiv.style.opacity=options.opacity||.6
        cloakdiv.resetPos()
        $.viewport.on(function(){
            cloakdiv.resetPos()
        })
        cloakdiv.setZ()
            setTimeout(function(){
                cloakdiv.setZ()
            },500)

        return cloakdiv
    },
    documentVisibility:(function(callback){
        var hidden, visibilityChange,callbacks=[];
        function _setup(){
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }
            function _dispatch(){
                var isvis=!document[hidden]
                callbacks.forEach(function(fn){
                    fn(isvis);
                })
            }
            if(visibilityChange){
                document.addEventListener(visibilityChange,_dispatch, false)
            }

            window.addEventListener("unload", function(){
                setTimeout(_dispatch,10)
            });
        }
        return function(callback){
            if(!visibilityChange){_setup()}
            if(typeof(callback)=="function" && callbacks.indexOf(callback)==-1){
                callbacks.push(callback)
            }
        }


    })(),

    parseAnimOptions:function parseAnimOptions(options) {
        var opts={}
        if($.isPlain(options)){opts=options}
        else if(typeof(options)=="number"){opts.duration=options}
        else if(typeof(options)=="string" && options.indexOf("eas")==0){opts.easing=options}
        if(typeof(opts.duration)!=="number"){
            opts.duration=opts.duration=="fast"?200:(opts.duration=="slow"?1000:500)
        }
        if(!opts.duration){opts.duration=500}
        if(!opts.easing){opts.easing="ease"}
        return opts
    },
    addFxRule:function addcssrule(duration, ease,prop) {
        var fx=this._fx,ths=this,defrule=this.defrule;
        if (!fx.length) {
            try {
                var CSSStyleRuleCtor = typeof(CSSStyleRule) != "undefined" ? CSSStyleRule : null
                var re = /^\s*fxtx/
                for(var i= 0,l=$.makeArray(document.querySelectorAll("link[type='text/css']")),ln= l.length;i<ln;i++){
                    var sh=l[i]
                    if (!(sh.sheet && sh.sheet.cssRules)) {
                        continue;
                    };
                    [].slice.call(sh.sheet.cssRules).forEach(function(it) {
                        if (CSSStyleRuleCtor && !(it instanceof CSSStyleRule)) {
                            return
                        }
                        if ((it.cssText + "").indexOf("fxtx") >= 0) {
                            if (!defrule) {
                                var sel = it.cssText.split("{")
                                fx.push(sel.shift().trim())
                                ths.defrule=defrule = sel.join("").replace(/}\s*$/, "").replace(/\s+\ds\s+/g, " SECSs ").trim()
                            } else {
                                fx.push(it.cssText.split("{")[0].trim())
                            }
                        }

                    });
                }
            } catch (e) {
                console.log("addcssrule", e)
            }
        }

        var fxclass = "fxtx",
            ky
        if(!defrule){defrule="transition: all SECSs ease-in !important;"}
        if (duration && !(duration == 1000 && !ease)) {
            var d = duration / 1000;
            if (d < 1) {
                d = "_" + Math.round(d * 10)
            } else {
                d = String(d).replace(/\./g, "_")
            }
            fxclass = (fxclass + (prop || "") + d + (ease || "")).trim()

            if (fx.indexOf("." + fxclass) < 0) {
                var nurule = defrule.replace(/SECS/g, String(d).replace(/^_/, "0.").replace(/_/g, "."))
                if (ease) {
                    nurule = nurule.replace(/ease[\w\-]*/g, ease)
                }
                if (prop) {
                    nurule = nurule.replace(/:/g, ": ").replace(/\s+all\s+/g, " "+prop+" ")
                }

                $d.css.addRule("." + fxclass, nurule.trim());
                fx.push("." + fxclass)
                // console.log("rule",optns.fxclass,nurule)
            }
        }
        return fxclass
    }

};
	
(function(){
    document.addEventListener("mousedown", $d._util.storeCurrentPos);
    document.addEventListener("keydown", $d._util.storeCurrentPos);

})();
$.eventUtil = function() {
    function a(a) {
        if (!e) {
            e = Object.keys(h).reduce(function(a, b) {
                return a[h[b]] = b, a
            }, {});
            for (var b = 65; 90 >= b;) e[h[b] = String.fromCharCode(b)] = b, e[h[b + 32] = String.fromCharCode(b + 32)] = b + 32, b++
        }
        return "number" == typeof a ? a : null != a ? e[a] : e
    }

    function b(a, b) {
        $.each(a, function(a, c) {
            c in b || ("function" == typeof a ? b[c] = Function("var nm='" + c + "';return this.origEvent&&typeof(this.origEvent[nm])=='function'&&this.origEvent[nm].apply(this.origEvent,arguments)") : Object.defineProperty(b, c, {
                get: Function("return this.origEvent && this.origEvent['" + c + "']"),
                set: Function("v", "return this.origEvent && (this.origEvent['" + c + "']=v)")
            }))
        })
    }

    function c(a) {
        var c = a.constructor.name,
            d = k[c],
            e = k.eventproto,
            f = function() {};
        e || (k.eventproto = e = function(a) {
            this.origEvent = a
        }, b(Event.prototype || {}, e.prototype), e.prototype._kmfns = j, $.each(j, function(a, b) {
            e.prototype[b] || "function" != typeof a || (e.prototype[b] = Function("a", "var nm='" + b + "';return this.origEvent && this._kmfns[nm]&&this._kmfns[nm].call(this._kmfns,this.origEvent,a)"))
        }), Object.defineProperties(e.prototype, {
            element: {
                get: function() {
                    return this.origEvent ? $d(this.origEvent.target) : null
                },
                set: f
            }
        }), e.prototype.stop = function(a, b) {
            this.origEvent && (this.origEvent.stopPropagation(), a && this.origEvent.stopImmediatePropagation && this.origEvent.stopImmediatePropagation(), (b || 2 === a) && this.origEvent.preventDefault && this.origEvent.preventDefault())
        }, e.prototype.find = function(a) {
            return $d.selfOrUp(this.target, a)
        }, e.prototype.trigger = function(a, b) {
            if (a && a.nodeType) {
                var c = document.createEvent("Event"),
                    d = {};
                for (var e in this) "function" == typeof this[e] || e in d || "type" == e || "target" == e || (c[e] = c[e]);
                return b && (c.data = b), c.target = a, a.dispatchEvent(c), c
            }
        }), d || (d = k[c] = function(a) {
            this.origEvent = a
        }, d.prototype = new e(null), b(a, d.prototype));
        var g = new d(a);
        return g.target && 3 == g.target.nodeType && (g.target = g.target.parentNode), "x" in g || (g.x = a.pageX || a.clientX + bdy.scrollLeft + docel.scrollLeft, g.y = a.pageY || a.clientY + bdy.scrollTop + docel.scrollTop), g
    }

    function d(a, b, d) {
        if (a && "object" == typeof a && a instanceof Event) return c(a);
        if (a && "string" == typeof a) {
            var e = a,
                f = d || {}, g = document.createEvent("Event");
            if (!d && b && "object" == typeof b && (f = b), g.initEvent(e, "bubbles" in f ? f.bubbles : !0, "cancelable" in f ? f.cancelable : !0), b && "object" == typeof b)
                for (var h in b) "type" != h && "target" != h && (g[h] = b[h]);
            return g
        }
    }
    var e, f = function() {
        var a = [],
            b = $.makeArray(arguments);
        return 2 != b.length || isNaN(b[0]) || isNaN(b[1]) || (b = [
            [b[0], b[1]]
        ]), b.forEach(function(b) {
            var c, d, e = [];
            b.length ? (c = b[0], d = b[1]) : c = d = b;
            for (var f = Math.max(d, c), g = c > d, h = Math.min(d, c); f >= h;) g ? e.unshift(h) : e.push(h), h++;
            [].push.apply(a, e)
        }), a
    }, g = function() {
        var a = arguments[0],
            b = f.apply(this, $.makeArray(arguments, 1));
        return b.indexOf(a) >= 0
    }, h = {
        0: "nill",
        8: "backspace",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "break",
        20: "capslock",
        27: "escape",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "insert",
        46: "delete",
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        65: "a",
        66: "b",
        67: "c",
        68: "d",
        69: "e",
        70: "f",
        71: "g",
        72: "h",
        73: "i",
        74: "j",
        75: "k",
        76: "l",
        77: "m",
        78: "n",
        79: "o",
        80: "p",
        81: "q",
        82: "r",
        83: "s",
        84: "t",
        85: "u",
        86: "v",
        87: "w",
        88: "x",
        89: "y",
        90: "z",
        91: "windowkeyleft",
        92: "windowkeyright",
        93: "select",
        96: "numpad0",
        97: "numpad1",
        98: "numpad2",
        99: "numpad3",
        100: "numpad4",
        101: "numpad5",
        102: "numpad6",
        103: "numpad7",
        104: "numpad8",
        105: "numpad9",
        106: "multiply",
        107: "add",
        109: "subtract",
        110: "decimal",
        111: "divide",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scrolllock",
        186: "semicolon",
        187: "equal",
        188: "comma",
        189: "dash",
        190: "period",
        191: "forwardslash",
        192: "graveaccent",
        219: "openbracket",
        220: "backslash",
        221: "closebraket",
        222: "singlequote"
    }, i = {
        op: "isArithmaticOperator",
        sep: "isSep",
        punc: "isPunc",
        alphanum: "isAlphaNum",
        num: "isNum",
        nav: "isNav",
        "char": "isChar",
        id: "isValidIdentifierPart"
    }, j = {
        getKeyNamesMap: a,
        isSep: function() {
            return 0
        },
        isPunc: function() {
            return 0
        },
        isNav: function(a) {
            return a = a.keyCode || a, g(a, 33, 40) ? a : null
        },
        getKeyName: function(a) {
            var k=a.keyCode || a
            return h[k]
        },
        isNum: function(a) {
            return a = a.keyCode || a, 48 == a || 96 == a ? "0" : g(a, [48, 57], [96, 105]) ? a : null
        },
        isChar: function(a) {
            return a = a.keyCode || a, g(a, [65, 90], [97, 122]) ? a : null
        },
        isValidIdentifierPart: function(a) {
            return a = a.keyCode || a, g(a, [48, 57], [97, 122], [65, 90], 36, 95) ? a : null
        },
        isAlphaNum: function(a) {
            return a = a.keyCode || a, this.isChar(a) || this.isNum(a) ? a : null
        },
        isArithmaticOperator: function(a) {
            return a = a.keyCode || a, g(a, [106, 111]) ? a : null
        },
        is: function(b, c) {
            var d = c,
                e = "string" == typeof c ? String(c).split("-") : [];
            if (b && "object" == typeof b && (d = c.keyCode), e.length > 1) return e.every(function(a) {
                return this.is(b, a)
            }, this);
            if (b && "object" == typeof b && c + "Key" in b) return b[c + "Key"] ? c : null;
            var f = b && "object" == typeof b && null != b.keyCode ? b.keyCode : b;
            return "string" == typeof c && i[c] ? this[i[c]](f) : a(c) == f ? f : null
        },
        hasModifier: function(a) {
            return a && a.target && a.type ? a.ctrlKey || a.shiftKey || a.altKey : g(a, [16, 18]) ? a : null
        },
        isCtrlKey: function(a) {
            return a && a.target && a.type ? a.ctrlKey : this.is(a, "ctrl")
        },
        isAltKey: function(a) {
            return a && a.target && a.type ? a.altKey : this.is(a, "alt")
        },
        isShiftKey: function(a) {
            return a && a.target && a.type ? a.shiftKey : this.is(a, "shift")
        },
        isEnter: function(a) {
            return this.is(a, "enter")
        },
        isEsc: function(a) {
            return this.is(a, "escape")
        },
        isRightClick: function(a) {
            return a && a.target && a.type ? a.which && 3 == a.which || a.button && 2 == a.button : null
        }
    }, k = {};
    return $.extend(d, j), d.augment = c, d.trigger = d.fire = function(a, b, c, d) {
        var d = d || {}, e = document.createEvent("Event");
        if (e.initEvent(b, "bubbles" in d ? d.bubbles : !0, "cancelable" in d ? d.cancelable : !0), c && "object" == typeof c)
            for (var f in c) "type" != f && "target" != f && (e[f] = c[f]);
        return e.target = a, a.dispatchEvent(e), e
    }, d
}(),
 $d.toFront = function(a, b) {
    var c = $d(a),
        d = c ? c.el : null;
    if (d) {
        var e = d.getBoundingClientRect();
        if (!e.height) {
            if (!b) return c;
            c.show()
        }
        var f = document.elementFromPoint(e.left + e.width / 2, e.top + e.height / 2),
            g = document.elementFromPoint(e.left + 1, e.top + 1);
        if (d.contains(f) && d.contains(g)) return c;
        if (!$d._maxZ || b===true) {
            var h = [],vw=document.defaultView,mx=0;
            for( var i=0,l=document.body.querySelectorAll("*"),ln=l.length,z;i<ln;i++){
                z=(+vw.getComputedStyle(l[i])["z-index"])||0;z>mx && (mx=z)
            }
            $d._maxZ = mx+1

        }
        if((Number(d.style.zIndex)||0) <= $d._maxZ){
            $d._maxZ=$d._maxZ+1
            d.style.zIndex = $d._maxZ
        }

        return c
    }
}, $d.cloneLayout = function(a, b) {
    b || (b = document.body.appendChild(document.createElement("div")));
    var c = a.style.display;
    a.style.display = "";
    var d = a.getBoundingClientRect();
    return b.style.cssText = $d.css.getComputed(a).cssText, a.style.display = c, b.style.position = "absolute", ["top", "left", "height", "width"].forEach(function(a) {
        b.style[a] = d[a] + "px"
    }), b
}, $d.alias = function(a) {
    return Object.keys($d).reduce(function(a, b) {
        return a[b] = $d[b], a
    }, a)
}, $d.template = function() {
    function _tokenize(a) {
        var b = String(a).replace(/\$\{([^\}]+)\}/g, "`$1`").replace(/\{\{(.*?)}}/g, "`$1`").match(/([\w][\w\$@-]*)|([\^]+)|([#\{\}+\=\-\!\*\(\)\]\.\[>])|`[^`]+`|./g) || [];
        return b
    }

    function _parse(a, b, c) {
        var d = b || {
                    tag: "root",
                    c: []
                }, e = d,
            f = function(b) {
                var d;
                return "root" == b ? d = {
                    id: ++_idcntr,
                    c: [],
                    tag: b,
                    par: e
                } : "(" == b ? (d = h(), d && (d.par = e, d.isGroup = !0, e.c.push(d))) : e.c.push(d = {
                    id: ++_idcntr,
                    txt: "",
                    c: [],
                    klass: [],
                    tag: b || "div",
                    tagadded: !! b,
                    props: {},
                    par: e
                }), d ? (util.checkrepeats(d, a, c), util.parseattrib(a, d, c), e = d, d) : void 0
            }, g = function(b) {
                if (!markers.el[b] || !isstr(b)) return e;
                if ("^" == b) e = e.par || e;
                else {
                    var c, d = "+" == b ? e.par : e,
                        h = abbr[a[0]] || a[0];
                    ("(" == h || alltags.indexOf(h) >= 0) && (c = h, a.shift()), c = c || ("+" == b ? e.tag : tagMap[e.tag]), e = d, f(c)
                }
                isstr(a[0]) && markers.el[a[0]] && g(a.shift())
            }, h = function() {
                var b, d = util.untilblockEnd(a, "(");
                if (d && d.length) {
                    for (b = _parse(d, null, c); b && b.par;) b = b.par;
                    "root" == b.tag && b.c && 1 == b.c.length && (b = b.c[0]), b.tagadded && "div" == String(b.tag).toLowerCase() && b.klass.push("ignoretag"), b.isGroup = !0
                }
                return b
            };
        for (a.slice(); a.length;) {
            var i = a.shift(),
                j = alltags.indexOf(i);
            i && "`" != String(i).charAt(0) && (isarr(i) ? i.length && (e = _parse(i, e, c), e.ignoretag = !0) : (j >= 0 || "(" == i ? (f(i), markers.el[a[0]] && g(a.shift())) : g(i), util.checkrepeats(e, a, c)))
        }
        return d
    }

    function _apiHolder(a) {
        return a.render = function() {
            this._html = this.fn.apply(null, arguments)
            this._fragment = this._el = null
            return this
        }, a.html = function() {
            return this._html || this.render.apply(this, arguments), this._html
        }, a.appendTo = function(a, b) {
            var c = $d(a || document.body);
            if (!c) return null;
            var d = c.el.appendChild(this.fragment);
            return b ? $d(d) : c
        }, $.defineProperty(a, "fragment", function() {
            if (worker || (worker = document.createElement("div")), !this._fragment)
                for (this._fragment = document.createDocumentFragment(), worker.innerHTML = this.html(); worker.firstChild;) this._fragment.appendChild(worker.removeChild(worker.firstChild));
            return this._fragment
        }), $.defineProperty(a, "el", function() {
            return this._el ? this._el : (this._container || (this._container = document.body), this._el = $d.append(this._container, this.fragment))
        }), a._html = null, a._el = null, a._fragment = null, a._container = null, a
    }

    function domtemplate(a) {
        /[a-z]/i.test(a) ? /^<[a-z]+>$/i.test(a) && (a = "<" + a.replace(/\W/g, "") + "></" + a.replace(/\W/g, "") + ">") : a = "<" + a + "></" + a + ">", a = String(a).replace(/<([^><]+?)>/g, function(a, b) {
            if (0 == b.indexOf("/") || /\s/.test(b)) return a;
            var c = {}, d = [];
            /\[/.test(b) && (b = b.replace(/\[([^\]]+)\]/g, function(a, b) {
                return b.split(";").forEach(function(a) {
                    var b = a.split(/[\:\=]/);
                    c[b[0]] = b[1]
                }), " "
            })), /\S\.\S/.test(b) && (b = b.replace(/\.([\S]+)/g, function(a, b) {
                return [].push.apply(d, b.split(/\./)), ""
            }));
            var e = ["<" + b];
            return $.each(c, function(a, b) {
                e.push(b + "='" + String(null == a ? b : a).replace(/^'|'$/g, "") + "'")
            }), d.length && e.push("class='" + d.join(" ") + "'"), e.push("input" == b || "img" == b || "hr" == b || "br" == b ? "/>" : ">"), e.join(" ")
        });
        a=a.replace(/\{\{(.*?)}}/g, "\${$1}");
        var b; - 1 == a.indexOf("$") ? (b = function(a) {
            return function() {
                return a
            }
        }(a), b.fn = b) : b = $.template(a);
        var c = _apiHolder(b);
        return c
    }

    function tmplm(a, b) {
        b = b || {};
        var c, d = String(a).trim(),
            e = null;
        if (b && b.nodeType && (b = {
                container: b
            }), b && b.container && (e = $d(b.container)), "<" == d.charAt(0)) {
            if (c = domtemplate(d), e) {
                var f = e.append(c(b.data));
                c = e.id == f.id ? e.lastElementChild : e
            }
            return c
        }
        var g = $.clone(b),
            h = _parse(_tokenize(d), null, g);
        c = new util.wrapApi("root" != h.tag ? {
            c: [h],
            tag: "root"
        } : h, b);
        var i = c.render(b.data),
            j = i.html();
        if (/\$\{[\w\.]+\}/.test(j) || /\$[\w\.]+/.test(j)) return j = j.replace(/\$\{([a-z][\w\.]+)?\}/g, function(a, b) {
            return "$" + b
        }), c = domtemplate(j);
        var k = function(a) {
            return this.render(a).html()
        }.bind(c);
        return Object.keys(c).forEach(function(a) {
            k[a] = "function" == typeof c[a] ? c[a].bind(c) : c[a]
        }), k
    }
    var markers = {
            el: {
                ">": 1,
                "^": 1,
                "+": 1
            },
            pr: {
                ".": 1,
                "#": 1,
                "[": 1,
                "{": 1,
                "}": 1
            }
        }, tagMap = {
            ul: "li",
            tr: "td",
            em: "span"
        }, alltags = "section article header footer ip lbl b a abbr acronym address area b i tt sub sup  big small, hr base bdo big blockquote body br button caption cite code col colgroup dd del dfn div dl dt em fieldset form h1 h2 h3 h4 h5, and h6 head html i img input ins kbd label legend li link map meta noscript object ol optgroup option p param pre q samp select small span strong style sub sup table tbody td textarea tfoot th thead title tr tt ul var".split(/\s+/),
        abbr = {
            "pos:a": "position:absolute",
            abs: "position:absolute",
            rel: "position:relative",
            "t:d": "type=date",
            "t:n": "type=number",
            "pos:r": "position:relative",
            "o:a": "overflow:auto",
            bgc: "background-color",
            bg: "background",
            "d:b": "display:block",
            "d:ib": "display:inline-block",
            r: "right",
            b: "bottom",
            t: "top",
            l: "left",
            w: "width",
            h: "height",
            "b:1": "border:1px solid #ccc",
            "t:h": "type:hidden",
            ip: "input",
            lbl: "label",
            fs: "fieldset"
        }, abbrkeys = {
            mrg: "margin",
            pd: "padding",
            bg: "background",
            bgc: "background-color"
        }, abbrvalues = {}, defvalues = {}, blocktags = {
            "(": ")",
            "[": "]",
            "{": "}"
        }, isstr = function(a) {
            return "string" == typeof a
        }, isarr = function(a) {
            return Array.isArray(a)
        }
    var util = {
            parseProps: function(a, b, c) {
                var d = (c ? c.abbr : {}) || {};
                return a.split(/\s*;\s*/).map(function(a) {
                    return String(d[a] || abbr[a] || a).trim().split(/\s*[:=]\s*/)
                }).reduce(function(a, b) {
                    var c = d[b[0]] || abbr[b[0]] || abbrkeys[b[0]] || b[0],
                        e = 1 == b.length ? defvalues[c] || c : d[b[1]] || abbrvalues[b[1]] || b[1];
                    return $d.css.isStyle(c) ? (a.style || (a.style = {}), !isNaN(Number(e)) && 0 != c.indexOf("line") && /top|left|right|bottom|height|width/i.test(c) && (e += "px"), a.style[c] = e) : a[c] = e, a
                }, b || {})
            },
            untilblockEnd: function a(b, c, d) {
                var e, f = [],
                    g = blocktags[c];
                if (!g) return [];
                for (; b.length && (e = b.shift()) != g;) f.push(d || e != c ? e : a(b, c));
                return f
            },
            resolveExpr: function(x, op) {
                return /\W/.test(x) ? function(__c, expr) {
                    with(__c) return eval(expr)
                }(op, x) : x
            },
            resolveValue: function(a, b, c, d) {
                var e = c + 1;
                return a && "string" == typeof a && isNaN(a) ? /^[a-z][\w\-]+$/i.test(a) ? a : (a && "string" == typeof a && (a.indexOf("$") >= 0 || a.indexOf("`") >= 0) && (/\$[\w_]+\.n/.test(a) && (a = a.replace(/(\$[\w_]+)\.n/g, "$1." + c)), a = a.replace(/\$([a-z][\w\-\.]*)|`([^`]+)`/gi, function(a, f, g) {
                    var h = f || g;
                    if (/^\d?n\s*([\+\-]\s*\d)?$/.test(h)) return (1, eval)(h.replace(/(\d)n/g, "$1 * n").replace(/\bn\b/g, e + ""));
                    if (null != d.context) {
                        if ("it" == h && "object" != typeof d.context) return d.context;
                        if (null != d.context[h]) return d.context[h];
                        if (!/^[a-z][\w_\.]*$/i.test(h) && d.context) return util.resolveExpr(h, d.context || {})
                    }
                    return "n" == h ? c + 1 : b ? b(h, d.memo) : a
                })), d.abbr && (a = d.abbr[a] || a), a && "string" == typeof a && isNaN(a) ? abbr[a] || abbrvalues[a] || a : a) : a
            },
            parseattrib: function(a, b, c) {
                for (var d; a && a.length && markers.pr[d = a[0]];)
                    if (a.shift(), "." == d) b.klass.push(a.shift());
                    else if ("{" == d) b.txt = util.untilblockEnd(a, d, !0).join("");
                    else if ("[" == d) util.parseProps(util.untilblockEnd(a, d, !0).join(""), b.props, c);
                    else {
                        if ("#" != d) break;
                        b.props.id = a.shift()
                    }
                return b
            },
            checkrepeats: function(a, b, c) {
                if (b && "*" == b[0]) {
                    b.shift();
                    var d = b.shift();
                    a.repeats = isNaN(d) ? d : Number(d), util.parseattrib(b, a, c)
                }
            },
            renderProps: function(a, b, c, d, e) {
                var f = util.resolveValue;
                a.klass.length && a.klass[0] && a.klass.forEach(function(a) {
                    var c = a;
                    /^[\w\-]+$/.test(a) || (c = f(a, null, -1, d)), c && b.classList && b.classList.add(c)
                }), Object.keys(a.props).forEach(function(g) {
                    if (g) {
                        var h = g,
                            i = a.props[h];
                        if ("style" == h) {
                            var j = {};
                            [].concat(i).forEach(function(a) {
                                var b = "";
                                if ("string" == typeof a) b = a.split(/\s*;\s* /).forEach(function(a) {
                                    if (abbr[a]) return abbr[a];
                                    a.split(/\s*:\s* /).map(function(a) {
                                        return f(a, e, c, d)
                                    })
                                });
                                else if ("object" == typeof a) {
                                    var c = -1;
                                    b = $.each(a, function(a, b) {
                                        j[b] = f(a, e, ++c, d)
                                    })
                                }
                            }), $d.css(b, j)
                        } else if (b && b.dataset && /^(data)?\-/.test(h)) h = h.substr("-" == h[0] ? 1 : "data-".length), b.dataset[h.replace(/\-\w/g, function(a) {
                            return a.substr(1).toUpperCase()
                        })] = f(i, e, c, d);
                        else if (b && b.setAttribute) try {
                            b.setAttribute(h, f(i, e, c, d))
                        } catch (k) {
                            console.error(k,"error" )
                        }
                    }
                }), a.txt && (b.textContent = f(a.txt, e, c, d))
            },
            render: function b(a, c) {
                c = c || 0;
                var d, e = this.resolver,
                    f = this.optns;
                if (a.el || ("root" == a.tag || a.ignoretag ? (a.el = document.createDocumentFragment(), a.el.asroot = !0) : (a.el = document.createElement(a.tag || "div"), a.el.asroot = !0)), d = a.el, a.c.length && a.c.map(b, this).forEach(function(a) {
                        var b = a.el;
                        b && d.appendChild(b)
                    }), "root" != a.tag && (util.renderProps(a, a.el, c, f, e), a.repeats)) {
                    var g = 0,
                        h = document.createDocumentFragment();
                    if (a.repeats > 0)
                        for (; g < a.repeats;) {
                            var i = a.el.cloneNode(!0);
                            util.renderProps(a, i, g, f, e), h.appendChild(i), g++
                        } else if (this.optns.context) {
                        var j = this.optns.context[a.repeats] || this.optns.context;
                        Array.isArray(j) && j.forEach(function(b, c) {
                            var d = a.el.cloneNode(!0);
                            util.renderProps(a, d, c, {
                                context: b
                            }, e), h.appendChild(d), g++
                        })
                    }
                    a._fragment = h, a.el = h
                }
                return a
            },
            wrapApi: function(a, b) {
                var c = this,
                    d = null;
                return c.Root = a, c._optns = c.optns = b || {}, c.el || (c.el = document.createDocumentFragment()), Object.defineProperty(c, "fragment", {
                    get: function() {
                        return this._fragment || this.el || this.render(), this._fragment || this.el
                    },
                    set: function() {}
                }), c.getFragment = function() {
                    return this.fragment
                }, c.replace = function(a, b) {
                    if (a) {
                        this._fragment || this.render();
                        var c, d = a,
                            e = this.fragment;
                        if (e && d.nodeType) return d = d.el || d, d.parentNode && (c = d.parentNode.appendChild(e), d.parentNode.insertBefore(c, d), d.parentNode.removeChild(d)), $d(b ? c : d)
                    }
                }, c.appendTo = function(a, b) {
                    if (a) {
                        this._fragment || this.render();
                        var c, d = a,
                            e = this.fragment;
                        if (e && d.nodeType) return d = d.el || d, d.appendChild && (c = d.appendChild(e)), $d(b ? c : d)
                    }
                }, c.html = function() {
                    if (this._fragment || this.render(), !d) {
                        var a = this.appendTo(document.createElement("div"));
                        d = a.innerHTML
                    }
                    return d = d.replace(/`([^`]+)?`/g, "${$1}")
                }, c.renderList = function(a, b) {
                    this.render(b)
                }, c.render = function(a) {
                    a && (this.optns || (this.optns = {}), this.optns.context = a, this.resolver = util.makeResolver(this.optns)), d = this.el = this._fragment = null, util.render.call(this, this.Root, 0);
                    var b = this._fragment = this.Root.el;
                    return b && 11 == b.nodeType && (b.childElementCount && 1 != b.childElementCount || (b = b.firstElementChild || b.firstChild)), this.el = b, this
                }, c.__wrapped = !0, c
            },
            makeResolver: function(a) {
                return function(a) {
                    if ("function" == typeof a) return a;
                    if (a && "object" == typeof a) {
                        if ("function" == typeof a.resolver) return a.resolver;
                        Array.isArray(a) && (a = {
                            context: a
                        });
                        var b = a.context || a.scope;
                        if (b) {
                            var c = a;
                            return function(a, b) {
                                var d = c.context || c.scope;
                                if (null == a) return "";
                                if (!/^[a-z][\w\._]*$/i.test(String(f).trim())) return util.resolveExpr(a, d);
                                var e = String(a).split("."),
                                    f = e.shift(),
                                    g = "it" == f ? d : d[f],
                                    h = "function" == typeof g ? g(b) : g;
                                if (e.length) {
                                    var i = e.pop();
                                    e.length && (h = e.reduce(function(a, b) {
                                        return a[b] || {}
                                    }, h)), h = h[i]
                                }
                                return h
                            }
                        }
                    }
                    return function(a) {
                        return a
                    }
                }(a)
            }
        }, _idcntr = 0,
        _api = null,
        worker = null;
    return tmplm
}();

$.partialview = $.fragmentview = Klass("$.fragmentview", {
    dom: null,
    _domwrap: null,
    model: null,
    url: null,
    fragment: null,
    _compiled: null,
    scripts: null,
    styles: null,
    scopeid: null,
    init: function() {
        var a = arguments[0];
        this.url || "string" != typeof a || (this.url = a)
    },
    promisify: function(a) {
        return this._pr = a || Promise.deferred(), this.then = function(a, b) {
            "string" == typeof a && "function" == typeof this[a] && (a = this[a]);
            var c = this._pr ? this._pr.then(a.bind(this), b) : null;
            return delete this._pr, c
        }.bind(this), this
    },
    load: function() {
        return this._loadPr || (this._loadPr = Promise.deferred(), this.fragment ? this._loadPr.resolve(this.fragment) : this.loadFragment().then(function(a) {
            this.fragment = a, this._loadPr.resolve(this.fragment)
        }.bind(this), function(a) {
            this._loadPr.reject(a)
        }.bind(this))), this.promisify(this._loadPr)
    },
    digest: function(a) {
        return a && (this.model = a), a = this.model, a && this.dom && a.digest(this.dom), this
    },
    compile: function(a) {
        return a && (this.model = a), a = this.model, this._compiled || this.dom && (this._compiled = a.compile(this.dom)), this
    },
    setDom: function(a) {
        $d(a) && (this.dom = $d(a).addClass(this.scopeid))
    },

    replace: function(a) {
        return this.load().then(function(b) {
            var c, d = a.el || a;
            d.parentNode && (c = $d.append(d.parentNode, b), d.parentNode.insertBefore(c.el, d), d.parentNode.removeChild(d)), this.setDom(c), this.digest()
        }.bind(this))
    },
    appendTo: function(a) {
        return !this.dom || a && !this.dom.parent().is(a) ? this.load().then(function(b) {
            return this.setDom($d.append(a, b)), this.digest(), this.dom
        }.bind(this)) : this.promisify()
    },
    scopeStyle: function(a, b, c) {
        var d = a.cssText;
        if (c = c || new RegExp("^\\." + sc + "[\\s\\>\\.\\[:]"), 1 == a.type && d) {
            d = d.replace(/scope__ph/g, b);
            var e = d.indexOf("{"),
                f = d.substr(0, e).replace(/[\n\r]/g, " ").trim(),
                g = $d.css.applyVars(d.substr(e));
            f = f.split(/\s*,\s*/).map(function(a) {
                return a = a.trim().replace(/^&/g, b).trim(), (c.test(a + " ") ? "" : b + " ") + a
            }).join(", "), d = f + g
        }
        return d
    },
    processStyles: function(a) {
        var _chkCalcs= $d.css.checkCalcs;
        for (var b = this.scopeStyle.bind(this), c = 0, d = "STYLE" == a.tagName ? [a] : a.querySelectorAll("style"); c < d.length; c++) {
            var e = document.body.appendChild(d[c].parentNode ? d[c].parentNode.removeChild(d[c]) : d[c]);
            if (e) {
                var f;
                if (e.sheet && e.sheet.cssRules && -1 == String(e.className).indexOf("no-scope") && e.getAttribute("scoped")) {
                    var g = [],
                        h = e.getAttribute("scoped") || "",
                        i = h;
                    i && 0 != i.indexOf(".") && (i = "." + i);
                    for (var j = new RegExp("^\\." + h + "[\\s\\>\\.\\[:]"), k = 0, l = e.sheet.cssRules, m = l.length; m > k; k++) {
                        var n = l[k];
                        if (4 == n.type && n.cssRules && n.media) {
                            for (var o = [], p = 0, q = n.cssRules, r = q.length; r > p; p++) {
                                var s = q[p];
                                s && 1 == s.type && o.push(b(s, i, j))
                            }
                            o.map(_chkCalcs)
                            g.push("@media " + (n.media.mediaText || "") + " {" + o.join("\n") + "\n}")
                        } else {
                            var txt=""
                            if(1 == n.type){
                                txt=b(n, i, j)
                            } else {
                                txt=n.cssText
                            }
                            _chkCalcs(txt)
                            g.push(txt)
                        }
                    }
                    f = g.join("\n")
                }
                if (f) try {
                    var t = document.body.appendChild(document.createElement("style"));
                    t.textContent = f, e.parentNode.removeChild(e)
                } catch (u) {
                    console.error(u)
                }
            }
        }
    },
    processScripts: function(a) {
        for (var b = 0, c = a.querySelectorAll("script:not([src])"); b < c.length; b++)
            if (c[b]) {
                var d = c[b].textContent || c[b].innerText;
                if (d) try {
                    (1, eval)(d), c[b].parentNode.removeChild(c[b])
                } catch (e) {
                    console.error(e)
                }
            }
    },
    processContent: function(a, b) {
        if(!b){return}
        var c = [],
            d = null,
            e = this;
        if (b = b.replace(/Xcr ipt/g,"script").replace(/\@include\s*\(?(["'\w\.\-]+)\s*\)?/g, function(a, b) {
                var d = b.replace(/['"]/g, "").trim();
                return c.push(d), "<span class='load-place-holder' data-name='" + d + "'></span>"
            }).replace(/\{{\s*\>\s*([\w\.\-_]+)\s*}}/g, function(a, b) {
                var d = b.trim();
                return c.push(d), "<span class='load-place-holder' data-name='" + d + "'></span>"
            }), b.trim().indexOf("<style") >= 0) {
            var f = b.indexOf("<style"),
                g = b.indexOf("</style>", f);
            if (g > f) {
                var h = b.substr(f, g - f),
                    i = "scope__ph";
                h = h.replace(/\&/g, i)
                h = $d.css.applyVars(h)
                b = b.substr(0, f) + h + b.substr(g)
            }
        }
        var j = document.createElement("div")
        j.innerHTML=b;
        $d.clearWhiteSpace(j, !0);
        var k = c.map(function(a) {
            var b, c = a.split(".");
            1 == c.length && c.push("html");
            var d = c.pop();
            "js" != d && "html" != d && "htm" != d && "partial" != d && "template" != d && "css" != d && "json" != d ? (c.push(d), c.push("html")) : c.push(d), d = c.pop(), a = c.join("."), b = a.split("/");
            var e, f = j.querySelector('.load-place-holder[data-name="' + a + '"]');
            if ("html" == d) {
                1 == b.length && b.unshift("app", "data");
                var g = Promise.deferred(),
                    h = b.join("/") + "." + d,
                    i = $.partialview(h);
                return i.replace(f).then(function() {
                    g.resolve()
                }), g
            }
            if ("css" == d) {
                1 == b.length && b.unshift("app", "theme");
                var h = b.join("/") + "." + d;
                return e = ResURL.from(h), e.insert({
                    type: d,
                    replace: f
                })
            }
            if ("js" == d) {
                if (1 == b.length || 0 == a.indexOf("app") ? b.unshift("modules") : 2 == b.length && b.unshift("app", "js"), b.indexOf("module") > 0) {
                    {
                        var g = Promise.deferred(),
                            k = this;
                        ZModule.get("app." + a, null, {
                            asexports: !0,
                            url: b.join("/") + "." + d,
                            callback: function() {
                                k[a] ? ($d.remove(f), g.resolve(k[a])) : g.reject(a + " not found  " + location.href + "  " + location.hostname + "  " + (document.querySelector("script[src]") || {}).src)
                            }
                        })
                    }
                    return g
                }
                var h = b.join("/") + "." + d;
                return e = ResURL.from(h), e.insert({
                    type: d,
                    replace: f
                })
            }
        }).filter(function(a) {
            return a
        });
        d = k.length ? Promise.all(k) : Promise.resolve(" ")
        d.then(function() {
            e.processStyles(j), e.processScripts(j);
            for (var b = document.createDocumentFragment(); j.firstChild;) b.appendChild(j.removeChild(j.firstChild));
            a.resolve(b)
        })
    },
    loadFragment: function() {
        var a = Promise.deferred(),
            b = this.url;
        return this.scopeid || (this.scopeid = this.model ? this.model.scopeid : ""), this.scopeid || (this.scopeid = "scoped_" + $.UUID(this.model)), b && 0 == b.indexOf("<") ? this.processContent(a, b) :
            app.getResource(b, this.processContent.bind(this, a)), a
    }
});
$.partialview.scopeStyle=function(rule,scklass,re){
    var text=rule.cssText
    re=re||new RegExp("^\\."+sc+"[\\s\\>\\.\\[:]")
    if (rule.type == 1 && text) {
        text=text.replace(/scope__ph/g,scklass)
        var idx=text.indexOf("{")
        var sstext = text.substr(0,idx).replace(/[\n\r]/g, " ").trim(),styles=$d.css.applyVars(text.substr(idx))

        sstext = sstext.split(/\s*,\s*/).map(function (a) {
            a=a.trim().replace(/^&/g, scklass).trim()
            return (re.test(a +" ")?"": (scklass + " ")) + a
        }).join(", ");
        text=sstext+styles
    }
    return text;
}
$.partialview.processScopedStyles=function(container){
    var scopeStyle=$.partialview.scopeStyle ;
    for(var i= 0,l=container.tagName=="STYLE"?[container]:container.querySelectorAll("style");i< l.length;i++){
        var  el=document.body.appendChild(l[i].parentNode?l[i].parentNode.removeChild(l[i]):l[i])
        if(el){
            var scr
            if( el.sheet && el.sheet.cssRules && String(el.className).indexOf("no-scope")==-1&&el.getAttribute("scoped")) {

                var arr=[],sc = el.getAttribute("scoped")||"",scklass=sc;
                if(scklass && scklass.indexOf(".")!=0){scklass="."+scklass}
                var re=new RegExp("^\\."+sc+"[\\s\\>\\.\\[:]");
                for(var j= 0,rules=el.sheet.cssRules,ln= rules.length;j<ln;j++){
                    var rule=rules[j]
                    if(rule.type==4&&rule.cssRules&&rule.media){
                        var arr1=[]
                        for(var ii= 0,rules2=rule.cssRules,ln2= rules2.length;ii<ln2;ii++){
                            var rule2=rules2[ii]
                            if(rule2 && rule2.type==1){
                                arr1.push(scopeStyle(rule2,scklass,re))
                            }
                        }
                        arr.push("@media "+(rule.media.mediaText||"")+" {"+ arr1.join("\n")+"\n}")
                    } else if(rule.type==1){
                        arr.push(scopeStyle(rule,scklass,re))
                    } else{
                        arr.push(rule.cssText)
                    }
                }
                scr=arr.join("\n")
            }
            if(scr){
                try {
                    var style=document.body.appendChild(document.createElement("style"))
                    style.textContent=scr;
                    el.parentNode.removeChild(el)
                } catch(e){
                    console.error(e)
                }
            }
        }
    }

}

$.DataCollection = Klass("$.DtaaCollection", {
    dom: null,
    items:null,
    itemodel: null,
    itemtemplate: null,
    parsed: null,
    container: null,
    init: function() {
        this.items=List.create(this.list||[])
        this.template && (this.parsed = $.template(this.template))
    },
    render: function() {
        var a;
        return this.parsed && (a = this.parsed(this.model)), this.fragment ? this.fragment.html(a) : this.fragment = $d.createFragment(a), this
    },
    insertAt: function(a) {
        a = a || this.selector;
        this.render();
        return this.selector = a, this.dom && this.dom.remove(), a && this.container.q(a) ? (this.container.q(a).html(""), this.dom = this.fragment.appendTo(this.container.q(a))) : this.dom = this.fragment.appendTo(this.container), this
    },
    appendTo: function() {
        return this.insertAt("append")
    },
    replaceWith: function(a) {
        return this.insertAt(a)
    }
});
$.DataView = Klass("$.DataView", {
    dom: null,
    model: null,
    template: null,
    parsed: null,
    container: null,
    init: function() {
        if (this.model) {
            var a = this;
            this.model.on(function() {
                a.render()
            })
        }
        this.template && (this.parsed = $.template(this.template))
    },
    render: function() {
        var a;
        return this.parsed && (a = this.parsed(this.model)), this.fragment ? this.fragment.html(a) : this.fragment = $d.createFragment(a), this
    },
    insertAt: function(a) {
        a = a || this.selector;
        this.render();
        return this.selector = a, this.dom && this.dom.remove(), a && this.container.q(a) ? (this.container.q(a).html(""), this.dom = this.fragment.appendTo(this.container.q(a))) : this.dom = this.fragment.appendTo(this.container), this
    },
    appendTo: function() {
        return this.insertAt("append")
    },
    replaceWith: function(a) {
        return this.insertAt(a)
    }
});
$.dataview = Klass("$.dataview", {
    dom: null,
    _domwrap: null,
     model: null,
    _selectors: {},
    config: {},
    elementTemplate: null,
    elements: null,
    url: null,
    template: null,
    templatefn: null,
    init: function() {
         var a;
        a = arguments[0] && "object" != typeof arguments[0] ? arguments[0] : this.template, !this.url && "string" == typeof a && 0 != a.indexOf("<") && a.indexOf("/") > 0 && -1 == a.indexOf("$") ? this.url = a : a && this.parse(a), this.elements = List.create(), this.config.watchElements && (List.plugin.emitter(this.elements), this.elements.on("change", function() {
            this.renderElements()
        }.bind(this)))
    },
    renderElement: function() {},
    addElements: function(a) {
        for (var b = 0, c = [].concat(a || []); b < c.length; b++) null == c[b] || this.elements.indexOf(c[b]) >= 0 || this.elements.add(c[b]);
        return this
    },
    addElement: function(a) {
        return this.addElements([a])
    },
    parse: function(a) {
        var b = this;
        return b.tmplt = "", "function" == typeof a ? (b.templatefn = a, a) : null == a ? "function" == typeof b.templatefn ? b.templatefn : null : (b.tmplt = a && "object" == typeof a && a.nodeType ? $d.html(a, !0) : String(a), b.tmplt = b.tmplt.trim().replace(/^['"]|['"]$/g, "").trim(), b.templatefn = $d.template(b.tmplt), "function" != typeof b.templatefn && "string" == typeof a && (b.templatefn = function() {
            return a
        }), b.templatefn && b.templatefn.vars && $.each(b.templatefn.vars, function(a) {
         }), b._parsed = "function" == typeof b.templatefn, this)
    },
    clear: function() {
        return this.dom && $d.clear(this.dom), this
    },
    updateScope: function() {
     },
    appendTo: function(a, b, c) {
        null != b && "object" != typeof b && (c = !! b, b = null), c === !0 && $d(a).clear();
        var d = $d(a).append(this.getElement(b));
        return  this.dom = $d(d)
    },
    clone: function() {
        var a = $.dataview(this.templatefn);
        $.each(this._selectors, function(b, c) {
            a.addSelector(c, b)
        });
        return a
    },
    html: function(a) {
        (a || !this._domwrap) && this.render(a)
        return $d.html(this._domwrap)
    },
    getFragment: function(a) {
        return this.render(a, !0)
    },
    getElement: function(a) {
        return (!this.dom || a) && this.render(a), this.dom
    },
    addSelector: function(a, b) {
        return 1 == arguments.length && a && "object" == typeof a ? $.each(function(a, b) {
            this.addSelector(b, a)
        }, this) : "string" == typeof a && ("string" == typeof b ? this._selectors[a] = Function("var d=this.dom||this._domwrap;return  d?$d.q(d,'" + b + "'):null") : "function" == typeof b && (this._selectors[a] = b),
            this.properties.addProperty(a, {descriptor:true,
            get: this._selectors[a],
            set: function() {}
        })), this
    },
    on: function() {},
    renderElements: function(a) {
        if (this.elementTemplate && this.elements && this.elements.length) {
            "string" == typeof this.elementTemplate && (this.elementTemplate = $.dataview(this.elementTemplate));
            var b = this.elementswrap || a || this.dom;
            $d(b).clear(), this.elements.each(function(a) {
                if (a) {
                    var c = this.elementTemplate.appendTo(b, a);
                    a.__elem = c, c && ($d.addClass(c, "-dataview-element-"), $d.data(c, "_listelemid", $.UUID(a)))
                }
            }, this);
            var c = this;
            $d.on(b, "click.pointerclick", function(a, d) {
                if (d) {
                    $d(b).st(".active").removeClass("active"), $d.addClass(d, "active"); {
                        c.elements.select(d.data("_listelemid"))
                    }
                }
            }, ".-dataview-element-"), List.plugin.selectionModel(this.elements)
        }
        return this
    },
    rerender: function(model, domcontainer) {
        var f = this.templatefn(model);
        if(domcontainer){
            $d.html(domcontainer,f||"");
            this.dom=domcontainer
        }
        return this
    },
    render: function(a, b, c) {
        var d, e = $d(b);
        if (a ){this._domwrap = null}
        if (!this._domwrap) {
            var f = this.templatefn(a);
            this._domwrap = document.createElement("div")
            this._domwrap.innerHTML = f.trim()
         }
        if (b === !0 ? e = document.createDocumentFragment() : e && c && e.clear(), e) {
            for (d = this._domwrap.cloneNode(!0); d.firstChild;) e.appendChild(d.removeChild(d.firstChild));
            return this.dom = $d(d), e && 1 == e.nodeType && this.model && this.model.scan(e), this.renderElements(e), e
        }
        var g = (this._domwrap.firstChild === this._domwrap.lastChild ? this._domwrap.firstChild : this._domwrap).cloneNode(!0);
        this.dom = g
        this.model && this.model.scan(g)
        this.renderElements(g)
        return  g
    }
});

$d.clearSelections = function() {
    var a = window.getSelection();
    if (!a.isCollapsed) {
        var b = a.getRangeAt(0);
        a.removeAllRanges(), document.designMode = "on", a.addRange(b), a.removeAllRanges(), document.designMode = "off"
    }
};
$d.builder = function() {
    function a(a, b, c, d, e) {
        return "string" == typeof c && "class" != e && (String(c).indexOf("$") >= 0 || String(c).indexOf("@") >= 0) && (c = $.parseExpr(c, {
            context: b
        })(a || b)), ("number" == typeof c || "string" == typeof c && !isNaN(Number(c))) && /top|left|height|width|top|bottom/i.test(d) && -1 == d.indexOf("line") && (c += "px"), c
    }

    function b(b, c, d) {
        if ("string" == typeof d[d.length - 1]) {
            var f = d.pop();
            c[/INPUT|SELECT|TEXTAREA/i.test(c.tagName) ? "value" : "innerHTML"] = a(b, c, f, "text", "value")
        }
        for (; d.length;) {
            var g = d.shift(),
                h = typeof g;
            "string" == h ? c.setAttribute("id", g) : g && "object" == h && Object.keys(g).forEach(function(d) {
                d in e.style ? c.style[d] = a(b, c, g[d], d, "css") : "klass" == d ? String(g[d]).split(/\s*,\s*/).forEach(function(a) {
                    c.classList.add(a.trim())
                }) : 0 == d.indexOf("-") || 0 == d.indexOf("data-") ? c.dataset[d.replace(/^data/, "").replace(/^\-/, "")] = g[d] : d && "string" == typeof d && c.setAttribute(d, a(b, c, g[d], d, "attr"))
            })
        }
    }

    function c() {
        e || (e = document.createElement("div"));
        var a, c = document.createElement("root"),
            f = c,
            g = null,
            h = function(c) {
                if (g) {
                    var d = $.makeArray(arguments),
                        e = g.slice();
                    return g = null, e.forEach(function(a) {
                        var b = d.slice();
                        b.push(a), h.apply(this, b)
                    }, this), this
                }
                var i = $.makeArray(arguments, 1),
                    j = this.el = f.appendChild(document.createElement(c));
                return b.call(this, a, j, i), this
            };
        return this.root = c, this.data = function() {
            return g = $.makeArray(arguments), this
        }, this.add = function() {
            if (f = this.el, arguments.length) {
                var a = $.makeArray(arguments),
                    b = a[0];
                b && "string" == typeof b && -1 != d.indexOf(b.toUpperCase()) || (b = "UL" == f.tagName || "OL" == f.tagName ? "LI" : "TR" == f.tagName ? "TD" : "TBODY" == f.tagName ? "TR" : "COLSET" == f.tagName ? "COL" : "SPAN", a.unshift(b)), h.apply(this, a)
            }
            return this
        }, d.forEach(function(a) {
            this[a] = h.bind(this, a)
        }, this), this
    }
    var d = "A ABBR ACRONYM ADDRESS BDO BLOCKQUOTE BR BUTTON CAPTION CITE CODE COL COLGROUP DD DEL DFN DIV DL DT EM FIELDSET FORM H1 H2 H3 H4 H5 H6 HR IMG INPUT INS KBD LABEL LEGEND LI LINK OBJECT OL OPTGROUP OPTION P PARAM PRE SAMP SCRIPT SELECT SPAN STRONG STYLE TABLE TBODY TD TEXTAREA TFOOT TH THEAD TR UL".split(/\s+/),
        e = null;
    return c
}() ;

;(function(scope){
    var transitionprop=null
    var callbacks=null,objTemplate;
    function getflowcb(fn,type){
        if(!(type=="over"||type=="under")){type=null}
        var  flow = type == 'over';

        return function(e){
            if (!type || type=="all" || (e.type == (type + 'flow') ||
                ((e.orient == 0 && e.horizontalOverflow == flow) ||
                (e.orient == 1 && e.verticalOverflow == flow) ||
                (e.orient == 2 && e.horizontalOverflow == flow && e.verticalOverflow == flow))
                )) {
                e.flow = type;
                return fn.call(this, e);
            }
        }
    }

    function addInnerObject(element, callback){
        var elem=element.el||element
        var currlistener=elem.querySelector(".resize-listener-object")
        if(currlistener && currlistener.parentNode==elem){elem.removeChild(currlistener)}
         var listener=document.createElement("object")
        listener.style.cssText="position:absolute;top:0;left:0;height:1%;width:1%;display: block;z-index:-1;background:transparent;overflow: hidden;pointer-events: none;";

        listener.type = 'text/html';
        listener.data = 'about:blank';
        listener.className="resize-listener-object"
       // var listener=objTemplate.cloneNode(true),
        var timer= 0,_saved=[0,0],_pending=0
        listener.__resizeElement__=$d(element).id
        listener.onload=function (){
            this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
            this.contentDocument.defaultView.addEventListener('resize', function(){
                     callback(this.__resizeTrigger__)
             });
        }
        elem.appendChild(listener)

    }
    function addFlowListener2(element, type , fn){
        if(typeof(type)=="function"){fn=type;type=null}
        if(!type && !('OverflowEvent' in window)){
            addFlowListener2(element, "under", fn)
            addFlowListener2(element, "over", fn)
            return
        }
        var   callback,el=$d(element);
        type=type||"all"
        var ev='OverflowEvent' in window ? 'overflowchanged' : type + 'flow'
        if(fn==null){
            callback=el.data("flowListener"+ev)
            if(callback){el.el.removeEventListener(ev, callback);}
            return;
        }
        callback=getflowcb(fn,ev)
        el.data("flowListener"+type,callback)
        el.el.addEventListener(ev, callback, false);

    };
    function addTransitionListener(el,callback){
        if(!transitionprop){
            transitionprop="transition"
            var bdyprop=$d.css.getComputed(document.body)||{},csseprfx=$.browser.css3pr||""
            if(bdyprop[transitionprop]==null&&bdyprop[csseprfx+transitionprop]!=null){
                transitionprop=csseprfx+transitionprop
            }
            $d.__transitionprop=transitionprop
        };
        $d.onTransiotionEnd(  el,function(ev){
            if(ev.target&&ev.target.style){ev.target.style.removeProperty(transitionprop)}
            if(callback(this)===false){return}

            setTimeout(function(){addTransitionListener(el,callback)},200);
        } ,true);
        $d.css(el,transitionprop,"all  .01s")
    }

    function _getTarget(elem){
        return (elem===document || elem ===document.body ||(elem.parentNode===document.body&&elem.style.position!="absolute"&&elem.style.position!="fixed") )?window:elem;
    }

    var winresizefn=null;
    function windowResizeListener( el,onlyresize){

        if(!winresizefn){
            winresizefn=[]
            winresizefn.remove=function(id){
                if(!id){return}
                var idx=winresizefn.indexOf(id.id||id)
                idx>=0 && winresizefn.splice(idx,1);
            }
            $.viewport.on(
                function(data){
                    var rem=[]
                    for(var i= 0,ln=winresizefn.length;i<ln;i++){
                        var target=winresizefn[i] ;
                        if(callbacks.dispatch({type:"resize",target:target})===false){
                            rem.push(winresizefn[i])
                        }
                    }
                    while(rem.length){
                        winresizefn.remove(rem.shift())
                    }
                })
        }
        winresizefn.push( el )
    }

    function addBoundsListener(element, fn,optns){
        optns=optns||{}
        var minoffset=optns.minoffset;
        if(!(typeof (minoffset)=="number" && minoffset>=1)){
            minoffset=2
        }
        if(!callbacks){
            callbacks= $.callbacks(null,null,{defaultFilter:function( ctx  ,fnargs,o){
                var ev=fnargs[0];
                if(ev && ev.target===window){return true}
                if(o && ctx && ev && ev.target && ev.target.id===ctx.id){

                    var targetel=ev.target
                    if(!$d.data(targetel,"_boundslistener")){return false}
                    var b=targetel.getBoundingClientRect();
                    o.cached||(o.cached=[]);
                    if(Math.abs(o.cached[0]-b.width)<=minoffset && Math.abs(o.cached[1]-b.height)<=minoffset){
                        if(o.onlyresize===true){
                            return
                        }
                        if(Math.abs(o.cached[2]-b.left)<=minoffset && Math.abs(o.cached[3]-b.top)<=minoffset){
                            return
                        }
                    }

                    o.cached[0]=ev.width=b.width;
                    o.cached[1]=ev.height=b.height;
                    o.cached[2]=ev.left=b.left;
                    o.cached[3]=ev.top=b.top;
                    return true
                }
                return
            }});
        }
        if(element===window || element===document){
            windowResizeListener(window)
            callbacks.add(fn,{ctx :window,onlyresize:true})
            return
        }
        var  el=$d(element)
        if(!el){
            $d.onAttach(element,function(el){
                addBoundsListener(el,this.fn,this.optns);
                setTimeout(function(){
                    if(!el.offsetHeight){
                        return;
                    }
                    callbacks.dispatch({type:"resize",target:el})
                },10);
            }.bind({fn:fn,optns:optns}));
            return;
        }
        var ellisteners=el.data("_boundslistener");
        if(!ellisteners){el.data("_boundslistener",ellisteners=[])}
        ellisteners.push(fn)
        callbacks.add(fn,{ctx :el,onlyresize:!!optns.onlyresize });

        if(el.el.tagName=="IFRAME"||el.el.onresize){
            el.el.onresize= function(){_
                if(callbacks.dispatch({type:"resize",target:this})===false){
                    this.onresize=null;
                }
            }
            return
        }
        windowResizeListener(el);
        if(optns && optns.noInnerObject!==true){
            addInnerObject(el,function(target){
                if(typeof(target)=="string"){target=document.getElementById(target)}
                if(target && callbacks.dispatch({type:"resize",target:target})===false){
                    var listener=target.querySelector(".resize-listener-object")
                    if(listener && $d(listener) && $d(listener).parent() && $d(listener).parent().is(target)){$d(listener).remove()}
                }
            });
        }else {

            addTransitionListener(el, function (target) {
                if (typeof(target) == "string") {
                    target = document.getElementById(target)
                }
                if (callbacks.dispatch({type: "resize", target: target}) === false) {
                    return false
                }
            });

            /*  addFlowListener2(el,null,function(){
             var target=this;
             if(callbacks.dispatch({type:"resize",target:target})===false){
             addFlowListener2(target);
             return false
             }
             });*/

            if (optns && optns.timer) {
                setTimeout(function _to(el) {
                    var target = el;
                    if (callbacks.dispatch({type: "resize", target: target}) === false) {
                        return
                    }
                    setTimeout(_to, 5000, el)
                }, 2000, el)
            }
        }
        addFlowListener2(el,null,function(){
            var target=this;
            if(callbacks.dispatch({type:"resize",target:target})===false){
                addFlowListener2(target);
                return false
            }
        });
    }
    function removeBoundsListener(element, fn){
        $d.data(element,"_boundslistener",null)
    };
    scope.addBoundsListener=addBoundsListener//(myElement, myResizeFn);
    scope.removeBoundsListener=removeBoundsListener//(myElement, myResizeFn);

})($d);
(function(scope,window,document) {

    var prefix = "", _addEventListener, onwheel, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
        document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
            "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    scope.addWheelListener = function( elem, callback, useCapture ) {
        if(callback==null){
            var listene=$d.data(elem,"_wheellistener");
            if(listene){
                $d(elem).el.removeEventListener(prefix + eventName,listene);
                $d.data(elem,"_wheellistener",null);
            }
        }
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
        $d.data(elem,"_wheellistener",callback);
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        if(!elem[ _addEventListener ]){return}

        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
            !originalEvent && ( originalEvent = window.event );
            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };

            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.detail;
            }
            return callback.call( scope(elem),event );

        }, useCapture || false );
    }

})($d,window,document); //$d.addWheelListener

$d.addResizeListener=function(el,fn){ $d.addBoundsListener(el,fn,{onlyresize:true})}//(myElement, myResizeFn);
$d.removeResizeListener=function(el,fn){ $d.removeBoundsListener(el,fn )};


(function(a) {
        function b() {
            this.fake = !0, this.boundary = "--------FormData" + Math.random(), this._fields = []
        }
        a.FormData || (b.prototype.append = function(a, b) {
            this._fields.push([a, b])
        }, b.prototype.toString = function() {
            var a = this.boundary,
                b = "";
            return this._fields.forEach(function(c) {
                if (b += "--" + a + "\r\n", c[1].name) {
                    var d = c[1];
                    b += 'Content-Disposition: form-data; name="' + c[0] + '"; filename="' + d.name + '"\r\n', b += "Content-Type: " + d.type + "\r\n\r\n", b += d.getAsBinary() + "\r\n"
                } else b += 'Content-Disposition: form-data; name="' + c[0] + '";\r\n\r\n', b += c[1] + "\r\n"
            }), b += "--" + a + "--"
        }, a.FormData = b)
})(self);

document.registerElement("time-input", {
    prototype: Object.create(HTMLElement.prototype, {
        date: {
            set: function(a) {
                if ("Invalid Date" == a && (a = null), !(this.__date == a || this.__date && a && +this.__date == +a)) {
                    this.__date = a;
                    var b = document.createEvent("Event");
                    b.initEvent("change", !0, !0), this.dispatchEvent(b), "function" == typeof this.onchange && this.onchange(b)
                }
            },
            get: function() {
                return this.__date
            }
        },
        onchange: {
            value: null,
            writable: !0
        },
        value: {
            set: function(a) {
                var b, c = $.date.asTime(a);
                if (!c || "Invalid Date" == c) return this.elhr = this.elmin = this.elap = "", void(this.date = null);
                b = c.getHours();
                var d = c.getMinutes(),
                    e = 15 - (d + 15) % 15;
                45 >= d && e && 15 != e && (d += e), d > 45 && (b++, d = 0), this.elhr.value = 12 == b ? "12" : String(b % 12), this.elmin.value = d, this.elap.value = b >= 12 ? "pm" : "am", this.date = c
            },
            get: function() {
                return this.date
            }
        },
        createdCallback: {
            value: function() {
                this.classList.add("time-input"), this.innerHTML = '<select class="hr" ><option value="1" >01:</option><option value="2" >02:</option><option value="3" >03:</option><option value="4" >04:</option><option value="5" >05:</option><option value="6" >06:</option><option value="7" >07:</option><option value="8" >08:</option><option value="9" >09:</option><option value="10" >10:</option><option value="11" >11:</option><option value="12" >12:</option></select><select class="mins" ><option value="0" >00</option><option value="15" >15</option><option value="30" >30</option><option value="45" >45</option></select><select class="ap" ><option value="pm" >PM</option><option value="am" >AM</option></select>', this.elhr = this.firstElementChild, this.elmin = this.elhr.nextElementSibling, this.elap = this.elmin.nextElementSibling, this.elhr.onchange = this.elmin.onchange = this.elap.onchange = function(a) {
                    var b = a.target.parentNode,
                        c = b.date;
                    "Invalid Date" == c && (c = null);
                    var d = c ? new Date(+c) : new Date;
                    d.setHours(Number(b.elhr.value || 0) + ("am" == b.elap.value ? 0 : 12)), d.setMinutes(Number(b.elmin.value)), d.setSeconds(0), d.setMilliseconds(0), b.date = d
                }
            }
        },
        detachedCallback: {
            value: function() {}
        },
        attributeChangedCallback: {
            value: function() {}
        }
    })
});
document.registerElement(
    'combo-box', {
        prototype: Object.create(
            HTMLElement.prototype,

            {
                value: {
                    get: function() {
                        return this.ip && this.ip.value
                    },
                    set: function(v) {
                        return this.ip && (this.ip.value = v);
                    }
                },
                onchange: {
                    get: function() {
                        return this.ip && this.ip.onchange
                    },
                    set: function(v) {
                        return this.ip && (this.ip.onchange = v);
                    }
                },
                config: {
                    value: null,
                    writable: true,
                    enumerable: true,
                    configurable: true
                },
                positionList: {
                    value: function() {
                        if(!$d.isVisible(this,true) && !$d.isVisible(this.firstElementChild,true)){
                            this.hideList();
                            return
                        }

                        var listel = this.config.lookupview
                        if (!listel ||  !listel.scrollHeight ) {
                            return
                        }
                        var b = this.ip.getBoundingClientRect()
                        listel.style.top = b.bottom + "px";
                        listel.style.left = b.left + "px";
                        listel.style.width = b.width + "px";
                        setTimeout(function() {
                            var listel = this.config.lookupview
                            if (!listel || !listel.scrollHeight) {
                                return
                            }
                            var b = listel.getBoundingClientRect(),winDims=$.viewport||{height:window.innerHeight,width:window.innerWidth}
                            var ht = Math.max(30,  b.height, listel.scrollHeight, listel.offsetHeight )
                            if (ht > 10) {
                                listel.style.height = ht + "px";
                            }
                            ht= listel.offsetHeight;
                            var diff = winDims.height - (10 + ht + b.top)
                            if (diff < 0) {
                                listel.style.height =(ht+diff)+"px"
                                listel.style.overflowY ="auto";
                                    //listel.style.top = (b.top + diff) + "px";
                            } else{
                                listel.style.overflowY ="visible";
                                listel.style.height ="auto"
                            }
                            diff = winDims.width - (10 + b.width + b.left)
                            if (diff < 0) {
                                listel.style.left = (b.left + diff) + "px";
                            }
                        }.bind(this))
                    }
                },
                populateList: {
                    value: function(recs){
                        var lookupview = this.config.lookupview
                        if (typeof(lookupview) == "function") {
                            lookupview = lookupview(recs);
                        }
                        if (lookupview && lookupview.show) {
                            if (recs && recs.length) {
                                lookupview.show(recs)
                            } else {
                                lookupview.hide()
                            }
                        }
                    }
                },
                hideList:{
                    value: function() {
                        this.config.currentValue="";
                        if(this.config.lookupview){
                            this.config.lookupview.hide()
                        }
                }},
                setTrigger:{
                    value: function(dom) {
                        this.config.trigger=dom
                        if(dom){
                            $d.on(dom,"click.combotrigger",function(){
                                this.resetList( );
                            }.bind(this))
                        }

                    }},
                displayList:{
                    value: function() {
                    if(this.config.lookupview){
                        var listel=this.config.lookupview
                        listel.style.display = "block";
                        listel.style.opacity = "1";
                        listel.style.overflowY = "auto";
                        this.positionList();
                    }
                }},
                resetList: {
                    value: function() {
                        var config = this.config || (this.config = {});
                        var recs, val =  arguments[0] ,
                            ip = this.ip,ev,
                            currval = config.currentValue
                        if (!arguments.length || typeof(arguments[0]) != "string") {
                            if(arguments[0] && arguments[0].type && arguments[0].target){
                                ev= arguments[0]
                            }

                            if (ev && ev.keyCode === 27) {
                                val = null;
                                ip.value = ""
                            } else if (val !== null) {
                                val = ip ? ip.value : null
                            }
                        }
                        if(ev && String(ev.type).indexOf("key")==0 && ev.keyCode== 13){
                            currval="";
                        }
                        if (val!=null && currval != val) {

                            config.currentValue = String(val)
                            if (val != null && (this.config.min && String(val).length <= this.config.min)) {
                                return
                            }
                            if (this.config.callback) {
                                recs = this.config.callback(val, this,ev)
                            }
                        } else {
                            if (!val) {
                                this.hideList();
                            }
                            return
                        }
                        var cnfg = config,
                            thisel = this
                        var lookupview = config.lookupview
                        if (!lookupview) {
                            var el = document.body.appendChild(document.createElement("div"));
                            el.classList.add("fxtx_height")
                             el.style.cssText = "z-index:20;position:fixed;width:" + ip.offsetWidth + "px;overflow:hidden;overflow-y:auto;max-height:200px;border:1px solid #888;box-shadow:2px 2px 4px #ccc;background-color:white;"
                             el.show = function(recs) {
                                if(config.docClickListener){
                                    document.removeEventListener("click",config.docClickListener)
                                    document.removeEventListener("keyup",config.docClickListener)
                                }
                                 thisel.__records=[];
                                var datarecs = recs || []
                                var b = ip.getBoundingClientRect()
                                var html = ["<ul style='display:block;list-style:none;padding:0;margin:0'>"]
                                for (var i = 0, l = datarecs, ln = l.length; i < ln; i++) {
                                    var id, label
                                    if (typeof(l[i]) == "string" || typeof(l[i]) == "number") {
                                        label = id = l[i]
                                    } else {
                                        id = String(l[i].id == null ? "" : l[i].id) || String(l[i].key == null ? "" : l[i].key) || l[i].value || "";
                                        label = l[i].label || id || "";
                                    }
                                    html.push('<li style="display:block;" class="list-item" data-index="' + i + '" data-key="' + id + '">' + label + "</li>")
                                }
                                 thisel.__records = datarecs.slice();
                                html.push("</ul>")
                                this.innerHTML = html.join("");
                                 thisel.displayList()
                                setTimeout(function(){
                                    document.addEventListener("click",config.docClickListener)
                                    document.addEventListener("keyup",config.docClickListener)
                                },10)


                            }
                            config.docClickListener = config.docClickListener||function docClickListener(ev) {
                                var dohide = true,
                                    doclear;

                                if (ev && ev.type == "keyup") {
                                    if (ev.keyCode == 27||ev.keyCode == 13) {
                                        if (ev.keyCode == 27) {
                                            doclear = true;
                                            ev.stopPropagation()
                                            ev.stopImmediatePropagation()
                                        } else {
                                             return
                                        }
                                    }
                                } else if (ev && ev.target && ($d.up(ev.target,".list-item")||$d.is(ev.target,ip))) {
                                    return
                                }
                                 thisel.hideList()


                            }
                            el.hide = function(ev) {
                                this.style.height = "1px";
                                this.style.width = "1px";
                                 this.style.opacity = ".01";
                                this.style.overflowY = "hidden";

                                document.removeEventListener("click", config.docClickListener)
                                document.removeEventListener("keyup", config.docClickListener)
                                //config.docClickListener(ev);
                            }


                            el.addEventListener("click", function(ev) {
                                var target=$d.up(ev.target,".list-item")
                                if (!target) {
                                    return
                                }
                                ev.stopImmediatePropagation()
                                var key, index = null
                                key = target.getAttribute("data-key")
                                index = Number(target.getAttribute("data-index"))

                                var records=thisel.__records,hideit=true
                                if (records && key && index != null && !isNaN(index) && index >= 0) {
                                    var rec = records[index]
                                    if (config.onselect) {
                                        if(config.onselect.call(ip, rec, records)===false){
                                            hideit=false
                                        };
                                    }

                                }
                                if(!hideit){return}
                                setTimeout(function() {
                                    thisel.hideList();
                                }.bind(this), 100);
                            });
                            window.addEventListener("scroll", this.positionList.bind(this))
                            config.lookupview = lookupview = el;
                            //this.config.lookupview=View.lookupList({ anchor: ip, minHeight: 200 })
                        }
                        if(!recs){return}
                        if(recs.isPromise){
                            recs.then(this.populateList.bind(this) )
                        } else {
                            this.populateList(recs)
                        }

                    }
                },
                createdCallback: {
                    value: function() {
                        this.classList.add("combo-box")
                        this.config = {}
                        this.ip = this.insertBefore(document.createElement("input"), this.firstElementChild);
                        this.ip.type = "search";
                        this.ip.style.display = "block";
                        if (this.getAttribute("placeholder")) {
                            this.ip.setAttribute("placeholder", this.getAttribute("placeholder"))
                        }
                        if (this.getAttribute("min")) {
                            this.config.min = Number(this.getAttribute("min")) || 0
                        }
                        var thisel=this,ip = this.ip,
                            _match = function(v1, v2) {
                                return v1 && v1.toLowerCase().indexOf(v2) == 0
                            },
                            _clearList = function() {
                                this.resetList(null)
                            }.bind(this),
                            _timer = 0,
                            _resetListThrottled = function(ev) {
                                if(this.config.trigger){return}
                                if (ev && ev.keyCode === 27) {
                                    if (_timer) {
                                        clearTimeout(_timer)
                                    }
                                    _timer = 0;
                                    this.resetList(ev);
                                    return;
                                };
                                if (_timer) {
                                    return
                                }

                                _timer = setTimeout(function(ev) {
                                    _timer = 0;
                                    this.resetList(ev);
                                }.bind(this), 100,ev);
                            }.bind(this)
                        ip.addEventListener("click", function(ev){
                            if(this.config.trigger){return}
                            var b=$d.bounds(ev.target)
                            if(ev.x && ev.x < b.right && (b.right - ev.x) < 20){//clicked on clear link
                                _clearList();
                                ev.stopImmediatePropagation()
                            } else {
                                if($d.val(this)){
                                    _resetListThrottled()
                                }

                            }
                        }.bind(this));
                        ip.addEventListener("paste", _resetListThrottled);
                        ip.addEventListener("cut", _resetListThrottled);
                        //ip.addEventListener("blur", _clearList);
                        //ip.addEventListener("focusout", _clearList);
                        ip.addEventListener("keyup", _resetListThrottled);
                        ip.addEventListener("focus", _resetListThrottled);
                        ip.addEventListener("focusin", _resetListThrottled);
                    }
                }
            }
        )
    });

document.registerElement("time-duration", {
    prototype: Object.create(HTMLElement.prototype, {
        onchange: {
            value: null,
            writable: !0
        },
        recalc: {
            value: function(a, b) {
                this.duration = a || this.elduration.value
                this.durationType = b || this.eldurationType.value
                this.value = this.duration + " " + this.durationType
            }
        },
        value: {
            set: function(a) {
                if (this.__value__ != a && !this.__loop__) {
                    this.__loop__ = 1;
                    try {
                        if("string" == typeof a && /^\d/.test(a.trim())){
                            this.elduration.value = String(a).replace(/[^\d\.]/g, "").trim()
                            this.eldurationType.value = String(a).replace(/[\s\d\.]/g, "").trim().charAt(0)||"h"
                            this.__value__ = a;
                        }
                        var b = document.createEvent("Event");
                        b.initEvent("change", !0, !0)
                        this.dispatchEvent(b)
                        "function" == typeof this.onchange && this.onchange(b)
                    } finally {
                        this.__loop__ = 0
                    }
                }
            },
            get: function() {
                return this.__value__
            }
        },
        createdCallback: {
            value: function() {
                this.classList.add("time-duration"), this.duration = 1, this.durationType = "h";
                for (var a = [
                    [.5, "&half;"],
                    [1, "1"]
                ], b = 2; 24 >= b; b++) a.push([b, b + ""]);
                this.style.paddingLeft="0"
                this.style.border="none"
                this.innerHTML = '<select class="val val-duration" value="1"  style="width:4rem">' + a.map(function(a) {
                        return '<option value="' + a[0] + '">' + a[1] + "</option>"
                    }).join("") + '</select><select class="val val-duration-type" style="width:6rem"><option value="h" selected="">Hr(s)</option><option value="d">Day(s)</option><option value="m">Mnth(s)</option></select>',
                this.elduration = this.firstElementChild
                this.eldurationType = this.elduration.nextElementSibling
                this.elduration.value = String(this.duration)
                this.eldurationType.value = this.durationType
                this.elduration.onchange = function() {
                    this.parentNode.recalc(this.value)
                }
                this.eldurationType.onchange = function() {
                    this.parentNode.recalc(null, this.value)
                }
            }
        },
        detachedCallback: {
            value: function() {}
        },
        attributeChangedCallback: {
            value: function() {}
        }
    })
});
document.registerElement("layout-element", {
    prototype: Object.create(HTMLInputElement.prototype, {
        createdCallback: {
            value: function() {}
        },
        attachedCallback: {
            value: function() {}
        },
        detachedCallback: {
            value: function() {}
        }
    })
});
document.registerElement("date-time-input", {
    prototype: Object.create(HTMLElement.prototype, {
        date: {
            set: function(a) {
                if ("Invalid Date" == a && (a = null), !(this.__date == a || this.__date && a && +this.__date == +a)) {
                    this.__date = a, this.render();
                    var b = document.createEvent("Event");
                    b.initEvent("change", !0, !0), this.dispatchEvent(b), "function" == typeof this.onchange && this.onchange(b)
                }
            },
            get: function() {
                return this.__date
            }
        },
        onchange: {
            value: null,
            writable: !0
        },
        value: {
            set: function(a) {
                var b = $.date.asTime(a);
                b && "Invalid Date" != b && (this.date = b)
            },
            get: function() {
                return this.date
            }
        },
        pointerHandle: {
            value: function(a) {
                if ($.eventUtil.isRightClick(a)) return void a.stopPropagation();
                var b = a.target && a.target.dataset && a.target.dataset.key;
                if (b) {
                    var PopupView=$.require("PopupView")
                    var c = $d.data(a.target, "lookuplist");
                    c || (c = new PopupView($.date.lookuplist(b), {
                        anchor: a.target,destroyonhide:true
                        , callback: function (a, b) {
                            this.date && (this.date.update(a, b), this.render())
                        }.bind(this, b)
                    })),
                    c.config.defaultValue = function(a) {
                        var b = this.date[a];
                        return Number(b) || b
                    }.bind(this, b)
                    c.show();
                    $d.data(a.target, "lookuplist", c)
                    c.show()
                }
            }
        },
        render: {
            value: function() {
                var a = this.getAttribute("format") || "mm/dd/yyyy",
                    b = this.date;
                if (b) {
                    this.formatTemplate && this.formatTemplate.format === a || (this.formatTemplate = $.date.getFormatTemplate(a));
                    var c = this.formatTemplate.getTemplateData(b),
                        d = this.style.display,
                        e = this.querySelectorAll(".date-part"),
                        f = 0;
                    e.length || (f = 1, this.innerHTML = this.formatTemplate.resolve(b), e = this.querySelectorAll(".date-part"), this.addEventListener("mousedown", this.pointerHandle)), this.style.display = "none";
                    for (var g, h = 0, i = e.length; g = e[h], i > h; h++)
                        if (g && g.dataset) {
                            var j = g.dataset.key;
                            j && "text" != j && "sep" != j && (f && (g.tabIndex = h + 1), g.innerHTML = null == c[j] ? j : c[j])
                        }
                    this.style.display = d
                }
            }
        },
        activateEdit: {
            value: function(a) {
                var b = a.target,
                    c = b.dateset.key
            }
        },
        deActivateEdit: {
            value: function() {}
        },
        createdCallback: {
            value: function() {
                this.classList.add("date-time-input"), this.date = this.date || $.date();
                var a = this.getAttribute("format"),
                    b = this.date;
                a || (a = (b ? b._defaultFormat : "") || "mm/dd/yyyy", this.__ignorenext = "format", this.setAttribute("format", a)), this.render()
            }
        },
        detachedCallback: {
            value: function() {}
        },
        attributeChangedCallback: {
            value: function(a) {
                return this.__ignorenext === a ? void delete this.__ignorenext : void("format" == a && this.render())
            }
        }
    })
});
/*
function clipper(el){
    if(el&&el.style){
        this.el=el;
    }

    this.inner=[0,0,0,0]



    Object.defineProperties(
        this,{
            "right":{set:function(a){this.inner[this.R]=a},get:function(){return this.inner[this.R]},enumerable:true},
            "width":{set:function(a){this.inner[this.R]=a},get:function(){return this.inner[this.R]},enumerable:true},
            "bottom":{set:function(a){this.inner[this.B]=a},get:function(){return this.inner[this.B]},enumerable:true},
            "height":{set:function(a){this.inner[this.B]=a},get:function(){return this.inner[this.B]},enumerable:true},
            "left":{set:function(a){this.inner[this.L]=a},get:function(){return this.inner[this.L]},enumerable:true},
            "x":{set:function(a){this.inner[this.L]=a},get:function(){return this.inner[this.L]},enumerable:true},
            "top":{set:function(a){this.inner[this.T]=a},get:function(){return this.inner[this.T]},enumerable:true},
            "y":{set:function(a){this.inner[this.T]=a},get:function(){return this.inner[this.T]},enumerable:true},

        }
        );
    this.update(el);

}
clipper.prototype={
    T:0,    R:1,    B:2,    L:3,
    applyCss:function(){
        if(!this.el){return}
        this.el.style.clip='rect('+this.inner.map(function(a){return a && !isNaN()?(a+"px"):a}).join(", ")+")" ;
    },
    fromString:function(val){
        return String(val).replace(/rect|\(|\)/g,"").split(/\s+|,/).map(function(a){
return (a=="0px"?0:a.trim())||0})
    },
    fromCss:function(el){
        el=el||this.el
        if(el&&el.style){
            return this.fromString(document.defaultView.getComputedStyle(el)["clip"]||"")
        }
    },
    getCurrent:function(){
        return this.fromCss(this.el)
    },
    update:function(el){
        if(el==null){return  this}
        var val=el
        if(arguments.length>1){
            val=[].slice.call(arguments)
        }

        var curr=this.getCurrent()||[];
        if(el&&el.style){
            val=this.fromCss(el)
        }
        if(typeof(val)=="string"){
            val=this.fromString(val)
        } else if(typeof(el)=="number"){
            val=[el,el,el,el]
        } else if(!Array.isArray(val) && typeof(val)=="object"){
            "top left height width right bottom x y".split(" ").forEach(
                function(k){
                    if(el[k]!=null){this[k]=el[k]}
               },this
          )
        }

        if(Array.isArray(val)){
            for(var i=0;i<Math.min(val.length,4);i++){
                curr[i]=val[i]
            }
        }
        for(var i=0;i<4;i++){
                this.inner[i]=curr[i]||0;
            }
        return this
    }
}

 */