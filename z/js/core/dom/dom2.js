//collection methods- each, collect, find findAll flatten keys values size
$d = self.DomCore = function(el0, props) {
    var el = el0,
        cntnr = (props && props.nodeType) ? props : document.body;
    if (cntnr === props) {
        props = null
    }
    if (!el) {
        return null
    }
    if (arguments.length == 2 && arguments[1] && arguments[1].nodeType) {
        cntnr = (arguments[1])
    }
    if (typeof(el) == "string") {
        if (el.indexOf("<") == 0) {
            if (/^<[\w]+>$/.test(el)) {
                el = el.replace(/^<([\w]+)>$/, "<$1></$1>")
            }
            el = $d.insert(cntnr, el, props)
        } else if (el.indexOf("Z:") == 0) {
            el = $d.template(el.substr(2)).render().appendTo(cntnr).lastElementChild
        }

    } else if (Array.isArray(el) || (el!==window && !el.nodeType && typeof(el.length) == "number")) {
        return cntnr ?$d.ex(cntnr).qq(el) : $d.qq(el)
    }
    return $d.ex(el)
};




(function() {
    var _dom = self.DomCore,
        core = self.CoreUtils;

   

    var asList = function() {
        var m = fixargs(arguments),
            s = m.s
        if (m.arr) {
            return m.e
        }
        if (typeof(s) == "string") {
            if (!/\W/.test(s)) {
                s = s + ",#" + s
            }
            return $.makeArray((m.e || document).querySelectorAll(s))
        } else {
            return [].concat(m.e || []).map(_el)
        }
    }
    

     if (document && !document.getBoundingClientRect) {
        document.getBoundingClientRect = function() {
            return document.body.getBoundingClientRect();
        }
    }




    function _el(el) {
        if (!el) {
            return null
        }
        var ret=null
        if (el && (el.nodeType  || el===window|| el.el===window)) {
            ret = el
        }
         else if (typeof(el) == "string") {
            try{
                if(/^[\w\_]\S+$/.test(el)){
                    ret=document.getElementById(el)
                }
                if(!ret){
                    ret=document.querySelector(el)
                }
             } catch(e){
                ret=null;
            }
            if (!ret) {
                ret = ($d.q(el)||{}).el
            }
        }
        return !ret ? null : (ret.el || ret)

    };

    function ancestors(ctx, cnt0) {
        var res = [],
            p = ctx,
            d = document,
            cnt = (cnt0 == null || cnt0 < 0) ? cnt0 = 10000 : cnt0;
        while (p && (p = p.parentNode) && (p !== d)) {
            if (cnt <= res.push(p)) {
                return cnt == 1 ? res[0] : res
            }
        }
        return res
    }

    function _scopedExpr(a) {
        var parts = [],
            v = String(a)
        var v1 = v.replace(/\{\{(.*?)\}\}/g, function(a, b) {
            parts.push(b.trim().replace(/@\.?/g, "it."));
            return "!" + parts.length + "!"
        });
        parts = parts.map(function(it) {
            return Function("it", "it||(it=this);with(it){return " + it.replace(/return/g, "").trim() + "}");
        });

        if (!v1.replace(/!\d!/g, "").trim()) {
            v = parts[0];
        } else {
            var parts1 = parts.slice()
            parts = v1.split(/!\d!/g, "").reduce(function(m, k, i) {
                if (i && (i % 2)) {
                    m.push(parts1.shift())
                };
                m.push(k);
                return m
            }, []);
            v = (function(arr) {
                return function(it) {
                    return arr.map(function(k) {
                        if (typeof(k) == "function") {
                            return k.apply(this, arguments)
                        } else {
                            return k
                        }
                    }, it || this).join("");
                }
            })(parts);
        }
        return v
    }

    //dom shims
    var _idCounter = 0

    function _asNumber(val) {
        return typeof(val) == "number" || !isNaN(val) ? Number(val) : Number(String(val).replace(/[^\d\.]/g, ""))
    }

    function _wrap(el0, valifnotdom) {
        var el = el0,
            nu
        if (!el || (el && el.isDomWrap)) {
            return el
        }
        if (typeof(el) == "string" && !(valifnotdom === true)) {
            el = $d.q(el)
        }
        if (!(el && el.nodeType)) {
            if(el===window){
                return setupWrap(el)
            }
            return valifnotdom === true ? el : null
        }
        if (el && el.nodeType == 3) {
            el = el.parentNode
        }
        if (!el) {
            return null
        }
        if (!el.id) {
            el.id = "anonel_" + el.tagName + "_" + (++_idCounter)
        }
        nu = setupWrap(el);

        return nu
    }

    var _arr = function(arr) {
        if(!arr){return []}
        return arr.nodeType?[arr]:[].slice.call(arr)
    };
    var _ech = function(arr, fn) {
        _arr(arr).forEach(function(it) {
            fn(it)
        })
    };

    function _callRecursively(e, prop, filter, count) {
        var i = 0,
            res = null,maxIter=1000,
            resall = [],
            el = $d.toEl(e);
        if (!el||!prop) {
            return []
        }
        if (typeof filter == "number") {
            count = filter
            filter=null
        }
        if (!count || isNaN(count)) {
            count = 100000
        }
        var filterfn=null
        if(prop in el && typeof(el[prop])!="function" && (!filter || typeof(filter)=="function")) {
            filterfn= filter||function(){return true}
            while (el && (el = el[prop])  &&   ++i<maxIter){
                if((filterfn(el,i,resall)? resall.push(el) :0) > count){break;}
            }
        } else {
            var _is = $d.matches,
                doc = document,
                fn = typeof(prop) == "function" ? prop :
                    function (p) {
                        if (!this || this === self) {
                            return null
                        }
                        return (typeof(this[p]) == "function") ? this[p].call(this) : this[p]
                    }

                filterfn = typeof(filter) == "function" ? filter :
                    typeof(filter) == "string" ?
                        function (elem, i) {
                            return _is(elem, filter)
                        }
                        :
                        function () {
                            return 1
                        };

            var r = fn.call(el, prop, i);
            while (r && r !== doc && (prop in Object(r))) {
                if (filterfn(r, i,resall)) {
                    if (resall.push(r) >= count) {
                        break;
                    }
                }
                r = fn.call(r, prop, i++)
            }
        }
        return resall
    }

    function $n(v, df) {
        if (typeof(v) == "number" && isFinite(v)) {
            return v
        }
        if (typeof(v) == "string" && /^[\-\.]?[\d\.]+/.test(v)) {
            return Number(v.replace(/\D+$/g, "")) || df
        }
        return Number(df) || 0
    }
    function getFnBody(fn) {
        return fn.toString()
            .replace(/^[^{]+?{/m,"")
            .replace(/\}\s*$/,"")
            .trim()
    }
    function ensureProxy(el) {
        var info = $d.__proxywrap__,
            tag = el===window?"win":String(el.tagName).toLowerCase()

        if (!info) {

            var proto={isDomWrap: { value: true, enumerable: false, writable: false, configurable: false } ,
                el: {
                    get: (function(doc){
                        return function() {
                            var dlg=this.___delegate___
                            if (typeof(dlg) == "string") {
                                return doc.getElementById(dlg)
                            }
                            return dlg;
                        }
                    })(document),
                    set: function(el) {
                        el && (this.___delegate___ = el);
                    },
                    enumerable: true, configurable: false
                }
            };

            for(var k in $d){
                if(!(k && typeof(k)=="string") || (k.indexOf("_")==0||k=="el" )){continue}
                 if(typeof($d[k])=="function"){
                    proto[k]= { value:Function("var el=this.el;if(el){return $d['"+k+"'].apply($d,[el].concat([].slice.call(arguments)))}"),
                        writable:false,enumerable:true,configurable:true
                    }
                }
            }

            var base={},
                noop=function () {},
                templatefn=getFnBody(function __name___proxy(){
                    var k='__name__',el=this.el, fn= el?el[k]:null;
                    if(!(fn && typeof(fn)=="function")){return null};
                    var __a=[]
                    for(var i= 0,l=arguments,ln= l.length,a;a=l[i],i<ln;i++){
                        __a.push(a && a.isDomWrap ?a.el:a)
                    }
                    var res= fn.apply(el,__a);
                    return (res && typeof(res)==='object' && !res.nodeType && isFinite(res.length))?[].slice.call(res):res
                }),
                templategetterfn=getFnBody(function(){ return  this.el && this.el['__name__']}) ,
                templatesetterfn=getFnBody(function(){this.el && (this.el['__name__']=arguments[0]);})

            $.defineProperties(base, proto);
            info={
                tags:{},
                base:base,
                extend:function(target) {
                    var nu = {}, nuprops = {}
                    nu = Object.create(this.base);
                    $.each($.getAllProperties(target), function (v) {
                        var nm = v.name ;
                        if (nm == "remove" || nm=="el" || (nm in nu)|| ((v.isMethod && (nm in Object) && Object[nm]===target[nm])||
                            (v.isMethod && (nm in Object.prototype) && Object.prototype[nm]===target[nm]))) {
                            return
                        }
                        if (v.isMethod) {
                            nuprops[nm] = {
                                writable: false,
                                value: Function(templatefn.replace(/__name__/g,nm))

                            }
                        } else {
                            nuprops[nm]= {
                                set: (v.descriptor.set || v.descriptor.writable) ? Function("v", templatesetterfn.replace(/__name__/g, nm)):noop,
                                get: Function(templategetterfn.replace(/__name__/g, nm))
                            }
                         }
                        nuprops[nm].enumerable=true;
                        nuprops[nm].configurable=true;
                    });
                    Object.keys(nuprops).length && $.defineProperties(nu, nuprops);

                    var ctor = function (el) {
                        this.___delegate___=el;
                     }
                    nu.___delegate___ = null;
                    ctor.prototype = nu;
                    ctor.prototype.constructor=ctor
                    return ctor
                }
            }
            $d.__proxywrap__=info
            info.tags["body"]=info.extend(document.body);
            info.base=info.tags["body"].prototype;
        }
        if(tag=="win"){
            info.tags["win"]=info.tags["win"]||Object.create($d(document),{
                    on:{value:function(ev,fn){
                        if(ev=="load"){$(fn);return this}
                        var nm="on"+ev;
                        if(nm in window){
                            window.addEventListener(ev,fn)
                        } else{
                            $d(document).on(ev,fn)
                        }
                        return this
                    }},
                    scrollTop:{value:function(ev,fn){

                        return window.scrollTop
                    }},
                    scrollLeft:{value:function(ev,fn){

                        return window.scrollLeft
                    }},
                    off:{value:function(ev,fn){
                        var nm="on"+ev;
                        if(nm in window){
                            window.removeEventListener(ev,fn)
                        } else{
                            $d(document).off(ev,fn)
                        }
                        return this
                    }}
                })
            return info.tags["win"]
        }
        var wrap = info.tags[tag]
        if (!wrap) {
             if(tag==="doc"){
                info.tags["doc"]=info.extend(el)
            } else {
                var wrkr = document.body.appendChild(document.createElement(tag));
                //info.tags[tag] = wrap = info.base.__clone(wrkr, true);
                info.tags[tag] = wrap = info.extend(wrkr);
                wrkr.parentNode.removeChild(wrkr)
            }
         }

        return new wrap(el);
    }
    var  localcache=null
    function setupWrap(el) {
        if (el && el.isDomWrap) {
            return el
        }
        if(el && el.nodeType==3){el=el.parentNode}

        if (!(el && el.nodeType)) {
            if( el!==window){return}

        }

        var wrapped ,nu
        if(typeof($)!="undefined" && $.objectMap){
            if(localcache && localcache.kys.length){
                for(var i= 0,l=localcache.kys,ln= l.length;i<ln;i++){
                    var mp=$.objectMap.getOrCreate(l[i])
                    mp._wrappedEl=localcache.vals[i]
                }
                localcache=null;
            }

            wrapped = $.objectMap.getOrCreate(el)

        } else {
            localcache||(localcache={kys:[],vals:[]})
            var i=localcache.kys.indexOf(el)
            if(i<0){i=localcache.kys.push(el)-1}
            wrapped = localcache.vals[i]||(localcache.vals[i]={_wrappedEl:null});
        }

        if (!wrapped._wrappedEl) {
            wrapped._wrappedEl = ensureProxy(el)//.__clone(el);
         }
        nu=wrapped._wrappedEl

        return nu
    }

    var _proto = {
        el: _el,  
        holdMouse2: function(el,opts) {
            //calls the callback if mouse is not released until timeout period has elapsed.
            //if no timeout then calls the callback on mouseup.
            if(arguments.length==1){
                opts=el
                el=document.body
            }
            if(!$d(el)){return}
            var EL=$d(el),elem=EL.el
            opts=opts||{}
            function _setup(EL,optns) {
                var intervaltimer = 0, timeouttimer = 0,elem=EL.el
                if(!optns.onend && optns.end){
                    optns.onend =optns.end
                }
                if(!optns.onstart && optns.start){
                    optns.onstart =optns.start
                }
                if(!optns.onstart && optns.start){
                    optns.onstart =optns.start
                }
                function end(ev,nocallback) {
                    document.removeEventListener("mouseup", mup)
                    if(optns.endonmousemove || optns.onmove){
                        document.removeEventListener("mousemove", mmv)
                    }

                    if( optns.once){
                        elem.removeEventListener("mousedown", mdn)
                    }

                    if (intervaltimer) {
                        clearInterval(intervaltimer)
                        intervaltimer = 0
                    }
                    if (timeouttimer) {
                        clearTimeout(timeouttimer)
                        timeouttimer = 0
                    }

                    if (!nocallback && optns.onend) {
                        optns.onend.call(EL, ev, optns)
                    }
                }

                function intrval() {
                    if (optns.oninterval) {
                        optns.oninterval.call(EL, optns)
                    }
                }

                function mmv(ev) {
                    if (optns.onmove) {
                        optns.onmove.call(EL, optns)
                    }
                    if (optns.endonmousemove) {
                        end(ev, !!optns.timeout)
                    }
                }

                function mdn(ev) {
                    end(null,true);
                    if (optns.onstart) {
                        optns.onstart.call(EL, ev, optns)
                    }

                    if (optns.interval && optns.interval > 10) {
                        intervaltimer = setInterval(intrval, optns.interval)
                    }
                    if (optns.timeout && optns.timeout > 10) {
                        timeouttimer = setTimeout(function(){end(null )}, optns.timeout)
                    }
                    setTimeout(function () {
                        document.addEventListener("mouseup", mup)
                        if (optns.endonmousemove || optns.onmove) {
                            document.addEventListener("mousemove", mmv)
                        }
                    }, 1);
                }

                function mup(ev) {
                    end(ev,!!optns.timeout)
                }

                if (optns.ev && optns.ev.type == "mousedown") {
                    optns.once=true;
                    mdn(optns.ev)
                } else {
                    elem.addEventListener("mousedown", mdn)
                }

                return {
                    cancel:function(){
                        optns.once=true;
                        end(null,true);
                    }
                }
            }

            return _setup($d(el),opts);
        },
         trackMouse:(function(options){
			function docev(ev,fn,act){
					document[act+"EventListener"](ev,fn)
				}
			return function(options){	
			   (function(optns){
					optns=optns||{}
					if(typeof(optns)=="function"){ optns={move:optns} }
					$d(document.body).addClass("noselection")
					if(typeof(optns.move)!="function"){
						optns.move=null
					}
					var curpos=null,animframe=$d.util.animframe,currentdelta={pos:{x:0,y:0},delta:{x:0,y:0},el:$d(optns.target)},
						curr=optns.target?$d.offset(optns.target):null,
						pending=0
                   if(optns.applyElPos && !currentdelta.el){
                       optns.applyElPos=false
                   }
                   if(optns.applyElPos && (currentdelta.el.parent().is(document.body) || currentdelta.el.css("position")=="fixed")){
                       curr=currentdelta.el.bounds();
                   }
                   if(optns.applyElPos && currentdelta.el && optns.translate) {
                       currentdelta.translate={x:0,y:0}


                       var currtransform=$d.css(currentdelta.el,"transform")
                       if(currtransform=="none"){currtransform=null}
                       if(currtransform  ){
                           var trdata=currentdelta.el.parseTransform()||""
                           if(trdata && trdata.translate){
                               currentdelta.translate=trdata.translate
                           }
                            optns.currtransform=currtransform
                           //currentdelta.el.css({top:curr.top,left:curr.left})
                       }

                   }
					function end(ev){
						docev("mousemove",mv,"remove");docev("mousedown",end,"remove");docev("mouseup",end,"remove") 
						if(currentdelta) {
                            if(optns.applyElPos && currentdelta.el) {
                                var el = currentdelta.el.el || currentdelta.el;
                                 if (!(optns.translate )) {
                                    //optns.translate &&  el.style.removeProperty("transform")
                                    el.style.left = currentdelta.pos.x + "px"
                                    el.style.top = currentdelta.pos.y + "px"
                                }
                            }

							 typeof(optns.end)=="function" &&  optns.end.call(currentdelta.el,currentdelta,optns.memo)
							currentdelta=null
						}
						
					}
					function mv(ev){if(!currentdelta){return}
						if(!curpos){
							curpos={x:ev.x,y:ev.y}
							typeof(optns.start)=="function" &&  optns.start.call(currentdelta.el,currentdelta,optns.memo)
						}
                        if(!curr){curr=curpos}
						var delta={x:ev.x-curpos.x,y:ev.y-curpos.y}
						currentdelta.pos={x:(curr.left+delta.x),y:(curr.top+delta.y)}
						currentdelta.delta=delta
						if(pending){return}
						pending=1;
						animframe(function(){if(!currentdelta){return}
							setTimeout(function(){pending=0;},10)

                                if(optns.rect){
                                    if(optns.dims) {
                                        currentdelta.lastdelta=currentdelta.lastdelta||currentdelta.delta
                                        for (var i = 0, l = optns.dims, ln = l.length; i < ln; i++) {
                                            if (l[i] == "top" || l[i] == "height" || l[i] == "bottom") {
                                                optns.rect[l[i]] += (currentdelta.delta.y-currentdelta.lastdelta.y)

                                            }
                                            else if (l[i] == "left" || l[i] == "width" || l[i] == "right") {
                                                optns.rect[l[i]] += (currentdelta.delta.x-currentdelta.lastdelta.x)
                                            }
                                            if((l[i]=="height"||l[i]=="width")&& optns.rect[l[i]]<0){
                                                if(l[i]=="height"){
                                                    optns.rect.top=optns.rect.top+(optns.rect.height-1)
                                                    optns.rect.height=Math.abs(optns.rect.height)+1
                                                } else{
                                                    optns.rect.left=optns.rect.left+(optns.rect.width-1)
                                                    optns.rect.width=Math.abs(optns.rect.width)+1
                                                 }
                                             }
                                        }
                                    } else{
                                        optns.rect.top += currentdelta.delta.y
                                        optns.rect.left += currentdelta.delta.x
                                    }
                                }
                                else if(optns.applyElPos && currentdelta.el && optns.translate){
                                    if(!currentdelta.translate || currentdelta.translate.x==null){
                                        currentdelta.translate={x:0,y:0}
                                    }
                                    if(!currentdelta.translatematrix){
                                        var trdata=currentdelta.el.parseTransform()
                                        if(trdata && trdata.transformStyle) {
                                            currentdelta.translatematrix = trdata.transformStyle.replace(/matrix|\)|\(/g, "").split(/\s*,\s*/)
                                            if(currentdelta.translatematrix.length<6){
                                                currentdelta.translatematrix=null
                                            }
                                        }
                                    }
                                    if(currentdelta.translatematrix){
                                        var arr=currentdelta.translatematrix.slice()
                                        arr[4]=(currentdelta.translate.x+currentdelta.delta.x)
                                        arr[5]=(currentdelta.translate.y+currentdelta.delta.y)
                                        currentdelta.el.style.transform="matrix("+(arr.join(","))+")";
                                    }
                                    else{
                                        currentdelta.el.style.transform="translate("+(currentdelta.translate.x+currentdelta.delta.x)+"px,"+(currentdelta.translate.y+currentdelta.delta.y)+"px)";
                                    }
                                }
								else if(optns.applyElPos && currentdelta.el){
                                   currentdelta.el.css({top:currentdelta.pos.y,left:currentdelta.pos.x})
                                }
                            currentdelta.lastdelta=currentdelta.delta

                            optns.move && optns.move.call(currentdelta.el,currentdelta,optns.memo)
						});
					}
					setTimeout(function(){docev("mousemove",mv,"add");docev("mousedown",end,"add");docev("mouseup",end,"add")},0);
				})(options);
			}
		 })(),
         
         
        isPaused: function(e) {
            var el = _wrap(e);
            return el && el.__paused
        },
        isAnimating: function(e) {
            var el = _wrap(e);
            return el && (el.__animatingactive || el.hasClass("animating"))
        },

        moveTo: function(e,x,y,animate) {
            var el = $d(e);
            if (!el) { return }
            if(typeof(y)=="boolean"||$.isPlain(y)){animate=y;y=null}
            if(x && typeof(x)=="object"){
                x= x.x|| x.X|| x.left||0;
                y= x.y|| x.Y|| x.top||0

            }
            if(x==null || y==null){return el}
            if(animate){
                var opts=$d._util.parseAnimOptions(animate)
                var fxclass = $d._util.addFxRule(opts.duration,opts.easing),delay=opts.delay||10
                el.addClass(fxclass);
                if(!opts.notranslate){
                    $.fn.delay(function(){el.css({top:y,left:x})},delay)
                } else{
                    var trans=x+"px,"+y+"px"
                    $.fn.delay(function(){el.el.style.transform="translate("+trans+");"},delay)
                }
                $.fn.delay(function(){el.removeClass(fxclass);},duration +50)
            }

        },
        disAppear: function(e) {
            var el = $d(e), args = [true].concat($.makeArray(arguments, 1));
            if (!el) {
                return
            }
            args.push(function(a){
                this.hide()
            });
            return el.appear.apply(el, args)

        },
        appear: function(e,reverse){
                var el=$d(e)
                if(!el){return}
                var args=[].slice.call(arguments,1)
                args.unshift(el,"clip")
                 return $d.anim.apply(this,args)
            },

        highlight: function(e, color, duration) {
            var el = $d(e);
            if (!el) {
                return
            }
            if (typeof(color) == "number" || color == "fast" || color == "slow") {
                duration = color;
                color = null
            }

            color = color || "yellow"
            var anim = el.anim({
                duration: duration,
                background: color,
                backgroundColor: color
            })
            anim.reverse()
            return anim
        },
        scrollPageTo: function(e) {
            var el = $d(e.el || e);
            if (!el) {
                return
            }
            var par = $d(document.body) //el.getOffsetParent()
            //if(par&&par.parentNode==document.body){par=$d(document.body)}
            //if(el.offsetTop>par.)
            var fr = $d.util.animframe
            var pb = par.bounds(),
                diff = el.bounds().top - (pb.height / 2)
            if (typeof(par.scrollTop) != "number" || (par.scrollTop + 1) != (par.scrollTop + 1)) {
                return
            }
            if (diff > 0) {
                var max = diff;
                fr(function scr() {
                    max = max - 1
                    if (max < 0) {
                        return
                    }
                    par.scrollTop = par.scrollTop + 1
                    var pb = par.bounds(),
                        diff = el.bounds().top - (pb.height / 2)
                    if (diff > 0) {
                        fr(scr)

                    }
                });
            }

        },
        slideUp:function(e ){
            var el=$d(e);
            if(!el || !el.parent()){return}
              var    parof=el.parent().style.overflow;
            el.parent().css("overflow","hidden")
             return $d.anim.apply($d,[el,"transform","translateY(-100%)"].concat([].slice.call(arguments,1))).then(function(a){
                this.element().style.transform="translateY(0px)";
                 if(!parof){
                     this.element().parent().style.removeProperty("overflow")
                 }
                 else{
                     this.element().parent().style.overflow=parof
                 }
                this.element().hide();
            })
        },
        slideDown:function(e ){
            var el=$d(e);
            if(!el || !el.parent()){return}
            var curr=+String(el.css("height")).replace(/[^\d\.]/g,""),of=el.el.style.overflow,parof=el.parent().style.overflow;
            el.parent().css("overflow","hidden")
            el.el.style.overflow="hidden"
            var ht=curr
            if(!ht) {
                //ht = Math.max(el.offsetHeight, $d(el).css({height: "auto"}).show().offsetHeight)
            }
            $d(el).show()
            $d.css(el,"transform","translateY(-100%)")
            var anim= $d.anim.apply($d,[el,"transform","translateY(0)"].concat([].slice.call(arguments,1)))
            return anim.then(function(a){
                if(!parof){
                    this.element().parent().style.removeProperty("overflow")
                }
                else{
                    this.element().parent().style.overflow=parof
                }
                     if(!of){
                         this.element().style.removeProperty("overflow")
                     }
                     else{
                         this.element().style.overflow=of
                     }
                 })

        },
        fadeOut:function(e ){
            return $d.anim.apply($d,[e,"opacity",.01].concat([].slice.call(arguments,1)))
        },
        fadeIn:function(e,opts ){
            if(!$d(e)){return}
            if(+$d.css(e,"opacity") == 1){
                $d.css(e,"opacity",0.1)
            }

            return $d.anim.apply($d,[e,"opacity",opts && opts.opacity?opts.opacity:1].concat([].slice.call(arguments,1)))
         },

        //prop,tovalue..prop,tovalue..   or  {from:{prop:value..},to:{prop:value..}}  or  {prop:{from:value,to:value} ....}

        onTransiotionEnd: (function() {
            var transitionEvent = null;

            function whichTransitionEvent() {
                var t, myDiv, transition;
                myDiv = document.body.appendChild(document.createElement('div'));
                if ('onwebkittransitionend' in window) {
                    transition = 'webkitTransitionEnd';
                } else if ('ontransitionend' in window) {
                    transition = 'transitionend' // Chrome/Saf (+ Mobile Saf)/Android
                } else if ('onotransitionend' in myDiv || navigator.appName == 'Opera') {
                    transition = 'oTransitionEnd'; // Opera
                } else {
                    transition = false;
                } // IE - not implemented (even in IE9) :(*/
                document.body.removeChild(myDiv)
                transitionEvent = transition
                return transitionEvent;
            }
            return function onTransiotionEnd(e, f, opts) {
                if (!transitionEvent) {
                    transitionEvent = whichTransitionEvent()
                }
                  var el = e === document ? e : _el(e);
                if (!(el && typeof(f) == "function")) {
                    return
                }
                var fn = f,
                    isonce =  (opts===true  || (opts && opts.once)),
                    _end = function(ev) {
                        var ret
                        if (isonce) {
                            el.removeEventListener(transitionEvent, _end)
                        }
                        try {
                            ret = fn.call(ev.target, ev);
                        } catch (e) {

                        }
                        if (!isonce && ret === false) {
                            el.removeEventListener(transitionEvent, _end)
                        }

                    };
                (el.el || el).addEventListener(transitionEvent, _end, false);
            }

        })(),
        has:function(el, chk){
            return $d.down(el, chk)
        },
        is: function(e, chk) {
            var el = _el(e);
            if(!el || !chk){return}
            if (el == chk || el == chk.el) {
                return true
            }
            if ((el == document && (chk == "doc" || chk == "document" || chk == "root")) || (el == window && (chk == "win" || chk == "window" || chk == "self"))) {
                return true
            }
             if (typeof(chk) == "string") {
                if (chk == "input") {
                    return $d.isFormInput(el)
                } else if(el.id===chk || el.name===chk || String(el.tagName||"").toLowerCase()=== chk.toLowerCase()  ){
                    return true
                }
                return $d.matches(el, chk)
            }
            return
        },
      
         
		  
        isFormInput: function(e) {
            var el = _el(e);
            if (!el) {
                return
            }
            var t = el.tagName;
            if (t === "INPUT" || (t.indexOf("SELECT")>=0 && el.options) || t === "TEXTAREA" || (t.indexOf("-") > 0 && "onchange" in el && "value" in el)) {
                return true
            }
        },
      
        //last:function _up(el0,sel){},
        //first:function _up(el0,sel){},
        up: function _up(el0, sel) {
            var r = _callRecursively(el0, "parentNode", sel, 1)
            return _wrap(r[0]);
        },
        prev: function prev(e, selector) {
            var el = _el(e);
            if (!el) {
                return null
            }
            if (!selector) {
                return _wrap(el.previousElementSibling)
        }
            var r = _callRecursively(el , "previousElementSibling", selector, 1)
            return _wrap(r[0])
        },
        prevAll: function prevAll(e, selector) {
            var el = _el(e);
            if (!el) {
                return null
            }
            var r = _callRecursively(el , "previousElementSibling", selector, 0)
            return r.map(_wrap)
        },
        prevUnion: function prevUnion(e, selector) {
            return $d.prevAll(e, selector)
        },
        next: function next(e, selector) {
            var el = _el(e);
            if (!el) {
                return null
            }
            if (!selector) {
                return _wrap(el.nextElementSibling)
            }
            var r = _callRecursively(el , "nextElementSibling", selector, 1)
            return _wrap(r[0])
        },
        nextAll: function nextAll(e, selector) {
            var el = _el(e);
            if (!el) {
                return null
            }
            var r = _callRecursively(el , "nextElementSibling", selector, 0)
            return r.map(_wrap)
        },
        closest: function closest(e, selector) {
            return $d.up(e, selector)
        },
        nextUnion: function nextUnion(e, selector) {
            return $d.nextAll(e, selector)
        },
        not: function _not(e, selector) {
            return !$d.is(e, selector)
        },
        parent: function _parent(e,selector) {
            var el = _el(e);
            if (!el) {
                return
            }
            if(selector){
                return $d.up(el,selector)
            }
            return $d(el.parentNode)
        },

        getOffsetParent: function _getoffsetparent(e) {
            var el = _el(e);
            if (!el) {
                return
            }
            if(el.offsetParent){
                return $d(el.offsetParent)
            } else if(el.parentNode && el.parentNode.offsetParent){
                return $d(el.parentNode.offsetParent)
            }
            return $d(el.parentNode)
        },

        selfOrUp: function _selfOrUp(e, sel) {
            var el = _wrap(e);
            return !el ? null : el.matches(sel) ? el : el.up(sel);
        },
        selfOrDown: function _selfOrDown(e, sel) {
            var el = _wrap(e);
            return !el ? null : el.matches(sel) ? el : el.down(sel);
        },

        find: function find(e, selector) {
             return $d.q(e, selector)
        },
        select: function selectEl(el0, selector) {
            var el = el0;
            var list=$d.qq(el, selector);
             if(arguments.length>2){
                  return list.select.apply(list,[].slice.call(arguments,2))
             }
            return list
        },
        contents: function(e, s) {
            var el = $d(e);
            if (!el) {
                return
            }
            return [].slice.call(el.childNodes||[])
        },
        down: function(e, s) {
            var el = _el(e);
            if (!el) { return null }
            if(!s){
                return $d(el.firstElementChild)
            }
            if (typeof(s) == "string") {
                return $d.q(el, s)
            }
            else if (typeof(s) == "number") {
                return $d(el.children[s])
            }
            return null
        },
        at: function(e, includeText) {
            var el = _el(e);
            if (!el || !el.parentNode) {
                return 0
            }
            return [].indexOf.call(el.parentNode[includeText===true ? "childNodes" : "children"],el)
        },
        sibling: function(e, selector) {
            var el = $d(e);
            if (!el) {
                return
            }
            if (typeof(selector) == "number") {
                var idx = el.at() + selector
                return el.parent().down(idx)
            }
            return $d.siblings(el, selector, 1).shift()
        },
        siblings: function(e, selector, count) {
            var el = $d(e);
            if (!el) {
                return
            }
            count = isNaN(count) ? 0 : +count
            var elem=el.el
            if(el.parentNode && !selector && !count){
                return [].slice.call(el.parentNode.children).filter(function(a){
                    return a !==elem}).map($d)
            }
            var r = _callRecursively(el, "previousElementSibling", selector, count)
            if (!count || r.length < count) {
                var r1 = _callRecursively(el, "nextElementSibling", selector, 0)
                if (count) {
                    while (r.length < count && r1.length) {
                        r.push(r1.shift())
                    }
                } else {
                    [].push.apply(r, r1)
                }
            }

            return r.map(_wrap)
        },
        descendants: function descendants(e, selector) {
            var el = _el(e);
            if(!el){return []}
            if(!selector || selector===true){
                return $d.qq( el.children )
            }
            return $d.qq(el,selector)
        },
        parents: function ancestors(e, selector) {
            var r = _callRecursively(e, "parentNode", selector)
            return r.map(_wrap)
        },
        ancestors: function ancestors(e, selector) {
            var r = _callRecursively(e, "parentNode", selector)
            return r.map(_wrap)
        },

        domIndex: function _domIndex(e, includeText) {
            var el = _el(e);
            if(!el){return -1}
            return ("cellIndex" in el) ? el.cellIndex :
                ("sectionRowIndex" in el) ? el.sectionRowIndex :
                    el.parentNode ? [].slice.call(el.parentNode[includeText ? "childNodes" : "children"] || []).indexOf(el) : 0;
            //return _callRecursively(el.parentNode,"previousElementSibling").length
        },
        fillContainer: function(el0, initstyle, watch) {
            if (initstyle === true || $.isPlain(initstyle)) {
                watch = initstyle;
                initstyle = null
            }
            var mins, options
            if ($.isPlain(watch)) {
                options = watch
            } else {
                options = {
                    watch: watch === true,
                    applyMin: initstyle == "min",
                    style: !initstyle || initstyle == "min" ? null : initstyle
                }
            }

            var el = _wrap(el0),
                tow = ["height"],
                par = $d(el.el.offsetParent || el.up())

            function _inner() {

                if (options.style) {
                    el.css(options.style)
                }
                var oht = el.outerHeight(),
                     ih = par.innerHeight()
                var  overflow = par.css("overflow")

                par.css("overflow", "hidden")
                var ht =  ih - (el.offsetTop)
                if (options.bottomOffset) {
                    var offset = options.bottomOffset;
                    if (options.bottomOffset.nodeType) {
                        offset = $d.height(options.bottomOffset)
                    }
                    ht = ht - (Number(offset) || 0)
                }
                if (ht > 0) {
                    if (options.applyMin) {
                        el.css({
                            minHeight: ht + "px"
                        })
                    } else {
                        el.css({
                            height: ht + "px"
                        })
                    }
                }
                if (el.css("position") == "absolute" || el.css("position") == "fixed") {
                    tow.push("width")
                    var iw = par.innerWidth()
                    el.css({
                        w: iw - (el.offsetLeft)
                    })
                }
            }
            _inner();
            if (options.watch === true) {

            }
            return el

        },

        clone: function _clone(e, deep, removeid) {
            var el = _el(e);
            if (!(el && el.cloneNode)) {
                return null
            }
            if (removeid == null) {
                removeid = true
            }
            if (deep == null) {
                deep = true
            }
            var nu = el.cloneNode(!!deep)
            if (removeid) {
                nu.removeAttribute("id");
                [].slice.call(nu.getElementsByTagName("*")).forEach(function(it) {
                    it && it.removeAttribute && it.removeAttribute("id")
                })
            }
            return $d(nu);

        },
        createFragment:function(content){
            var cntnt = document.createDocumentFragment()
            cntnt.qq=function(sel){return $d.q(this.firstChild,sel)};
            cntnt.q=function(sel){return $d.q(this.firstChild,sel)};
            cntnt.html=function(cntnt) {
                if(!cntnt){return this.firstChild?this.firstChild.innerHTML:""}
                var el
                if(typeof(el)=="string"){el=document.createElement("div");el.innerHTML=cntnt;}
                if(!el){return}
                while(this.firstChild){
                    this.removeChild(this.firstChild)
                }
                while(el.firstChild){
                    this.appendChild(el.removeChild(el.firstChild))
                }
                el=null;
                return this;
            }
            cntnt.appendTo=function(el) {
                var par = $d(el);
                if (!par) {
                    return
                }
                return $d(par.el.appendChild(this));
            }
            return cntnt
        },
        addOptions:function(el,optslist,clear){
            var elem=_el(el),list=optslist;
            if(!elem){
                return
            }
            var val=$d.val(el)
            if(clear!==false){
                var options=elem.options
                while(elem.options && elem.options.length){
                    elem.removeChild(elem.options[0]);
                }
            }

            if(typeof(optslist)=="string"){list=optslist.split(/\s+/)}
            if(optslist && optslist.list){list=optslist.list}
            if($.isArray(list)){
                for(var i= 0,ln=list.length;i<ln;i++){
                    var O=list[i],id,label;
                    if(O==null){continue}
                    if(typeof(O)=="object"){
                        id= O.id||O.key||O.value;
                        label= O.label||O.text||id
                    }
                    else {
                        label=id=String(O)
                    }
                    var opt=document.createElement("option")
                    opt.text = label
                    opt.setAttribute && opt.setAttribute("value", id);
                    typeof(elem.add)=="function"?elem.add(opt):elem.appendChild(opt);
                }
            }
            if(val){$d.val(elem,val)}
            return $d(elem);
        },
        
        clipDims: function clip(e) {
            var el = _wrap(e);
            if (!el) {
                return null
            };
            var args = $.makeArray(arguments, 1),
                dims = {
                    top: 1,
                    left: 1
                },
                ascss, upd;
            dims.right = el.offsetWidth;
            dims.bottom = el.offsetHeight;
            var curr = el.css("clip").trim().replace(/([\w]+\()|\)/g, "").split(" ")
            var ln = curr ? curr.length : 0;
            if (ln > 0 && $n(curr[0], -1) > 0) {
                dims.top = $n(curr[0])
            }
            if (ln > 1 && $n(curr[1], -1) > 0) {
                dims.right = $n(curr[1])
            }
            if (ln > 2 && $n(curr[2], -1) > 0) {
                dims.bottom = $n(curr[2])
            }
            if (ln > 3 && $n(curr[3], -1) > 0) {
                dims.left = $n(curr[3])
            }
            if (args && args.length) {
                if (typeof(args[0]) == "boolean") {
                    ascss = args.shift();
                }
            }
            if (args && args.length) {
                if ($.isPlain(args[0])) {
                    $.extend(dims, args[0])
                } else if (Array.isArray(args[0])) {
                    args = args[0]
                }
                if (args && Array.isArray(args) && args.length) {
                    var ln = args ? args.length : 0;
                    if (ln > 0 && $n(args[0], -1) >= 0) {
                        dims.top = $n(args[0])
                    }
                    if (ln > 1 && $n(args[1], -1) >= 0) {
                        dims.right = $n(args[1])
                    }
                    if (ln > 2 && $n(args[2], -1) >= 0) {
                        dims.bottom = $n(args[2])
                    }
                    if (ln > 3 && $n(args[3], -1) >= 0) {
                        dims.left = $n(args[3])
                    }
                }
            }
            var ret = [];
            if (ascss) {
                ("top right bottom left").split(/\s+/).forEach(function(it) {
                    ret.push($n(dims[it]) + "px")
                });
                return "rect(" + ret.join(" ") + ")"
            }
            return dims
        },
        clip: function clip(e) {
            var el = _wrap(e);
            if (!el) {
                return null
            };
            var args = $.makeArray(arguments, 1),
                getter = !args.length || typeof(args[0]) == "boolean"
            var nu = $d.clipDims.apply($d, [el, true, getter ? [] : args])
            if (!getter) {
                return el.css("clip", nu)
            }
            return nu;
        },
        effectiveStyle: function(e, prop) {
            if (e && e === document) {
                return
            }
            var el = _wrap(e);
            if (!el) {
                return
            }
            var v = String(el.css(prop)).trim(),
                p = el.parent()
            //if(!v||v.replace(/\s/g,"")==="rgba(0,0,0,0)"||v==="inherit"||v==="inherited"||v==="auto"){v=""}
            if (!v || v === "inherit" || v === "inherited" || v == "auto") {
                if (p == "backgroundColor" || p == "background-color") {
                    v = el.getBackgroundColour()
                } else if (p && (v === "inherit" || v === "inherited")) {
                    v = p.effectiveStyle(prop)
                } else if (!v || v == "auto") {
                    var info = $d.css.getInfo(prop)
                    if (info.isDimension) {
                        var elem = el.el
                        var off = "offset" + prop.charAt(0).toUpperCase() + prop.substr(1)
                        if (off in elem) {
                            v = elem[off] + "px"
                        }
                    }
                }
            }


            return v;
        },
        opacity: function(el, s) {
            return $d.css(el, "opacity", s)
        },
        detach:function(e){
            var el = $d(e);
            el && el.el && el.el.parentNode && el.el.parentNode.removeChild(el.el)
            return el;
        },
        remove: (function  () {
            function _rem(el){
                var emitter=$d.getEmitter(el,true)
                if(emitter){
                    emitter.fire("removed")
                    emitter.destroy()
                }
                $.objectMap.delete(el)
                el.parentNode && el.parentNode.removeChild(el)
            }

            return function(e, anim, animconfig){
                var el = $d.toEl(e);
                if (!el) { return }
                 if (anim === true) {
                          $d(el).css("overflow","hidden").anim({height:1,width:1}, animconfig).then(function(){
                             _rem(this.element().el)
                         })
                     return el;
                }
                _rem(el)
                return el
            }


        })(),


       
        hide: function(e, anim, animconfig) {
            var el = $d(e);
            if (!el) {
                return
            }
            if (anim === true) {
                if(!$.isPlain(animconfig)){
                    animconfig={
                        opacity: .01
                    }
                }
                return el.anim(animconfig).then(function() {
                    this.element().hide()
                })
            }
            else{
                el.css("display", "none");
            }
            return el
        },
        toggle: function(e, show) {
            if(show===true){return $d.show(e)}
            else if(show===false){return $d.hide(e)}
            else if($d.isVisible(e,true)){return $d.hide(e)}
            return $d.show(e)
        },
        show: function(e, anim, animconfig) {
            var el = $d(e),  css = { display: "" };
            if (!el) {
                return
            }

            if (el.css("visibility") == "hidden") {
                css.visibility = "visible"
            }
            if (anim === true) {
                css.opacity = .1
            }

            el.css(css)
            var curr  =el.css("display")
            if(curr=="none"){curr=null}
            if (!(el.offsetHeight + el.offsetWidth + el.offsetTop)) {
                if(!curr  ){curr="block"}
                curr && el.css("display", curr);
            }
            if (anim === true) {
                return el.anim({
                    opacity: 1
                }, animconfig)
            }
            return el
        },
          outerDims: function(e) {},
        isVisible: function(e,noLayercheck) {
            if(!e){return}

            var i = 0,
               elem = e.el||e

            if (!(elem && elem.nodeType && $d.isAttached(elem))) {
                return false
            }
            var   prop = $d.util.getHiddenProp(),  doc = document
            if (!(elem.offsetHeight && elem.offsetWidth)) {
                return false;
            }
            if (prop && (doc[prop] ||  elem[prop] )) {
                return false;
            }

            var stl = document.defaultView.getComputedStyle(elem)||{},
                b, offsets, vw, addeddot = 0,
                points = ["top", "right", "bottom", "left"];
            //0 wd and ht if no content in some browsers
            var cntnt = elem.innerHTML,notviz=false;
            if (!cntnt) {
                // el.innerHTML = ".";
                //addeddot++
                //stl = $d.css.getComputed(el)
            }
            if (!notviz && (stl.display == "none" || stl.visibility == "hidden" ||   stl.opacity === 0)) {
                notviz=true
            }
            if(!notviz) {
                b = elem.getBoundingClientRect();
                vw = $.viewPort
                if (b.bottom <= 0 || b.right <= 0 || b.left > vw.width || b.top > vw.height) {
                    notviz = true
                }

                if ( !notviz && noLayercheck!==true) {
                    if (!elem.contains(doc.elementFromPoint(b.left + (b.width/ 2), b.top+ (b.height/2)))) {
                        if (!elem.contains(doc.elementFromPoint(b.left + (b.width/ 3), b.top+ (b.height/3)))) {
                            if (!elem.contains(doc.elementFromPoint(b.left + ((2*b.width)/ 3), b.top+ ((2*b.height)/3)))) {
                                notviz = true
                            }

                        }

                    }

                }
            }
            if( notviz) {
                if (addeddot) {
                    el.innerHTML = cntnt || ""
                }
                return false;
            }


            return true

        },
        getBackgroundColour: function getBackgroundColour(e, limitElem) {
            var bgColour = '',
                el = _el(e);
            var styleElem = el;
            var rTrans = /^transparent|rgba\(0, 0, 0, 0\)|auto|inherit$/;
            var style;
            limitElem || (limitElem = document.body);
            while (!bgColour && styleElem !== limitElem.parentNode) {
                style = String($d.css(styleElem, "backgroundColor") || "").trim();
                if (style && !rTrans.test(style)) {
                    bgColour = style;
                    break;
                }
                styleElem = styleElem.parentNode;
            }
            return bgColour;
        },


        bounds: function(e, mode) {
            var el = _wrap(e);
            if (!el) {
                return
            }
            var b=el.el.getBoundingClientRect(),rect={};
            ["top","left","right","bottom","height","width"].forEach(
                function(a){
                    rect[a]=b[a];
                }
            );
            if(mode==="relative"||mode==="rel"){
                var par=el.getOffsetParent()
                if(par){
                    var parb=par.bounds();
                    rect.top=rect.top-parb.top;
                    rect.left=rect.left-parb.left;
                    rect.bottom=rect.bottom-parb.top;
                    rect.right=rect.right-parb.left;
                }
            }
            /*var rect = el.data("_rect")
            if (!rect) {

                el.data("_rect", rect = UI.Rect.create(el))
            } else if (noref !== true) {
                rect.refresh();
            }*/
            return rect;
        },
        innerHeight: function(e, nocache) {
            var el = _wrap(e);
            if (!el) {  return  }
            var box,val=el.el.clientHeight,dims=["border-top-width", "border-bottom-width"]
            if(!val) {box=el.css("box-sizing")
                val = Number(el.css("height").replace(/px$/, "")) || 0
                if (box == "content-box") {
                    return val
                }
                if (box == "border-box") {
                    dims.push("border-top-width", "border-bottom-width", "padding-top", "padding-bottom")
                }
            }
            $.each(el.css(dims),function(v){if(!val || val=="0px"){return}
                val=val-(Number((v||"").replace(/px$/,""))||0)
            })
            return val
        },
        innerWidth: function(e, nocache) {
            var el = _wrap(e);
            if (!el) {  return  }
            var box,val=el.el.clientWidth,dims=["padding-left", "padding-right"]
            if(!val) {box=el.css("box-sizing")
                val = Number(el.css("width").replace(/px$/, "")) || 0
                if (box == "content-box") {
                    return val
                }
                 if (box == "border-box") {
                    dims.push( "border-left-width", "border-right-width")
                }
            }
            $.each(el.css(dims),function(v){if(!val || val=="0px"){return}
                val=val-(Number((v||"").replace(/px$/,""))||0)
            })
            return val
        },
        outerHeight: function(e, nocache) {
            var el = _wrap(e);
            if (!el) { return }

            var val=el.el.offsetHeight
            var box ,dims=["margin-top","margin-bottom"]
            if(!val) {box=el.css("box-sizing")
                val = Number(el.css("height").replace(/px$/, "")) || 0
                if (box == "padding-box") {
                    dims.push("border-top-width", "border-bottom-width")
                } else {
                    dims.push("border-top-width", "border-bottom-width", "padding-top", "padding-bottom")
                }
            }
            $.each(el.css(dims),function(v){if(!val || val=="0px"){return}
                val=val+(Number((v||"").replace(/px$/,""))||0)
            })
            return val
        },
        outerWidth: function(e, nocache) {
            var el = _wrap(e);
            if (!el) { return }
            var val=el.el.offsetWidth
            var box ,dims=["margin-left","margin-right"]
            if(!val) {
                box = el.css("box-sizing")
                val = Number(el.css("width").replace(/px$/, "")) || 0
                if (box == "padding-box") {
                    dims.push("border-left-width", "border-right-width")
                } else {
                    dims.push("border-left-width", "border-right-width", "padding-left", "padding-right")
                }
            }
             $.each(el.css(dims),function(v){if(!val || val=="0px"){return}
                val=val+(Number((v||"").replace(/px$/,""))||0)
            })
            return val
        },
        cummulativeOffsetTop:function(e){
            var el = _el(e), h=0,p=el;
            while(p){
                h=h+(p.offsetTop||0);
                p=p.offsetParent;
            };
            return h
        },
        offset: function offset(e, dim0) {
            offset._dimMap || (offset._dimMap = {
                top: "offsetTop",
                width: "offsetWidth",
                height: "offsetHeight",
                left: "offsetLeft"
            });
            offset._dims || (offset._dims = $.keys(offset._dimMap));
            var el = _el(e),
                dim;
            if (!el) {
                return
            }
            if($.isPlain(dim0)){
                $.each(dim0,function(v,k){
                    var dim = offset._dimMap[String(k).toLowerCase()]
                    if (dim && dim in el) {
                        el[dim]=typeof(v)=="number"?(v+"px"):v;
                    }
                })
            }else{
                if (typeof(dim0)=="string") {
                    dim = offset._dimMap[String(dim0).toLowerCase()]
                }
                if (dim && dim in el) {
                    return el[dim]
                }
            }

            return {
                top: el.offsetTop,
                width: el.offsetWidth,
                height: el.offsetHeight,
                left: el.offsetLeft
            }
        },
        offsetFrom: function offsetFrom(e, other) {
            var el = _wrap(e),
                el2 = _wrap(other);
            if (!(el2 && el)) {
                return
            }
            return el.bounds().minus(el2.bounds())
        },


        absolutize: function(e, addtoroot) {
            var options = {}
            if (typeof(addtoroot) == "boolean") {
                options.appendTo = addtoroot
            } else if ($.isPlain(addtoroot)) {
                $.extend(options, addtoroot)
            }
            if (options.appendTo === true) {
                options.appendTo = document.body
            }

            var el = _wrap(e);
            if (!el) {
                return
            }
            var target=el,ref=options.ref
            if(options.clone && $d(ref) && $d(ref).parent()){
                ref=el
                target = el.clone(true, true).el
                target =  $d($d(ref).parent().el.appendChild(target))
            }


            var offset = target.offset(),
                css = options.css || {}
            css.margin == null && (css.margin = 0);
            if(options.fixed){css.position = "fixed"}
            css.position == null && (css.position = "absolute");

            if (!(target.css.position === "absolute" || target.css.position === "fixed")) {
                var b = ref?$d.bounds( ref):target.bounds(),
                    par, b1
                if(css.position =="fixed"){
                    css.top = b.top
                    css.height = b.height
                    css.width = b.width
                    css.left = b.left
                }  else {
                    if (options.appendTo && target.parent().is(options.appendTo)) {
                        $.extend(css, offset);
                    } else {
                        var nu = {}
                        if(css.position != "fixed"){
                            var rel
                            if (options.appendTo) {
                                rel = $d.bounds(options.appendTo)
                            }

                            if (rel) {
                                b.relativeTo(rel)
                            }
                        }

                        b.getDimensionCss(target, nu)
                        b.getPositionCss(target, "tl", nu)
                        $.extend(css, nu);
                        //par=el.getOffsetParent();  b1=$d.bounds(par) ||{};dims=$d. (par)||{};dims.inner||(dims.inner={})

                        //b.minus({top:b1.top  + dims.inner.top,left:b1.left  + dims.inner.left})
                    }
                    $.compact(css);
                    css.margin = 0;
                }

                if (!options.noApply ) {
                    if (options.appendTo) {
                        options.appendTo = $d(options.appendTo)
                    }
                    if (options.appendTo) {
                        target = options.appendTo.append(target)
                    }
                    target.css(css)
                } else {
                    return css
                }
            }
            return target;
        },
        printEl:(function(){
            function PrintElem(target,stle)
            {
                var allstyles={},_counter= 1 ,vw=document.defaultView,lst=[].slice.call(target.getElementsByTagName("*"));
                lst.unshift(target)
                lst.forEach(function(el){
                    if(el.nodeName=="svg"){return}
                    el.id||(el.id="el_"+(++_counter));
                    var st=vw.getComputedStyle(el),style={};
                    Object.keys(st).forEach(function(k){
                        isNaN(k) && typeof( k)=="string" && st[k] && typeof(st[k])=="string" && (style[k]=st[k]);
                    });
                    allstyles[el.id]=style
                })
                var elem=target.cloneNode(true),lst2=[].slice.call(elem.getElementsByTagName("*"));
                lst2.unshift(elem)
                lst2.forEach(function(el){
                    if(el.nodeName=="svg"){return}
                    var id=el.id;
                    el.removeAttribute && el.removeAttribute("id");
                    var st=allstyles[id]||{};
                     Object.keys(st).forEach(function(k){
                         el.style[k]=st[k];
                     });
                 });
                if(stle){
                    Object.keys(stle).forEach(function(k){
                        elem[k]=stle[k];
                    })
                }
                Popup(elem,target.getBoundingClientRect() );
            }

            function Popup(data,bounds)
            {

                var mywindow = document.body.appendChild(document.createElement("iframe"))//window.open('', 'ClaimCheck', 'height=400,width=600');
                if(!mywindow){return}
                mywindow.src="javascript:"
                mywindow.contentDocument.body.appendChild(data)
                var head=mywindow.contentDocument.head||mywindow.contentDocument.querySelector("head")||mywindow.contentDocument.body;
                [].forEach.call(document.querySelectorAll("link"),function(el){
                    var link=head.appendChild(mywindow.contentDocument.createElement("link"));
                    link.href=el.href;
                });
                mywindow.style.top="-"+bounds.height+"px";  mywindow.style.left="-"+bounds.width+"px";
                mywindow.style.height=(bounds.height+5)+"px"; mywindow.style.width=(bounds.width+5)+"px";
                mywindow.style.padding="0";mywindow.style.position="fixed";  mywindow.style.zIndex=0;

                var win=mywindow.contentWindow||mywindow.contentDocument.defaultView
                if(win){
                    try{win.focus();} catch(e){}
                    win.print();
                }
                setTimeout(function(){mywindow.parentNode.removeChild(mywindow)},100)
                 return true;
            }
            return function(e,style){
                var el=$d(e)
                if(!el){return}
                PrintElem(el.el,style)
                return el;
            }
        })(),
        relativize: function(e, par) {
            var el = _wrap(e);
            if (!el) {
                return
            }
            par = (par ? $d(par) : null) || $d(document.body)
            if (el.contains(par)) {
                return el
            }
            var b = el.bounds(),
                b1 = par.bounds(),
                rel = {
                    top: b.top - b1.top,
                    left: b.left - b1.left
                }
            if ((el.css.position === "absolute" || el.css.position === "fixed")) {
                el.css("position", "relative")
            }
            if (el.parentNode !== par.el) {
                el = par.append(el)
            }
            el.css(rel)
            return el;
        },
        parseTransform: function(e) {
            var el = _wrap(e);
            if (!el) {
                return
            }

            var tr=el.css("transform")||el.css("webkitTransform")||el.css("MozTransform")||el.css("msTransform")
            if(tr=="none"){tr=null}

            var   matrix=tr?$d.util.parseMatrix(tr):{},rotateZ=0,rotateX=0,rotateY=0
            if(matrix && matrix.m11!=null) {
                 rotateY = Math.asin(-matrix.m13)
                rotateX = Math.atan2(matrix.m23, matrix.m33);
                rotateZ = Math.atan2(matrix.m12, matrix.m11);
             }
            var ret= {
                transformStyle: tr,
                matrix: matrix||{},
                skewY:0,
                skewX:0,scale:1,
                rotate: {
                    x: rotateX,
                    y: rotateY,
                    z: rotateZ
                },
                translate: {
                    x: matrix.m41||0,
                    y: matrix.m42||0,
                    z: matrix.m43||0
                }
            };
            if(tr) {
                var a = String(String(tr.split('(')[1]).split(')')[0]).split(',').map(Number);
                ret.skewY = Number(((180 / Math.PI) * Math.atan2(((0 * a[2]) + (1 * a[3])), ((0 * a[0]) - (1 * a[1]))) - 90).toFixed(2).replace(/\.00$/, ""));
                ret.skewX = Number((180 / Math.PI) * Math.atan2(((1 * a[2]) + (0 * a[3])), ((1 * a[0]) - (0 * a[1]))).toFixed(2).replace(/\.00$/, ""));
                var a1 = a[0], b = a[1]
                ret.scale = Number(Math.sqrt(a1 * a1 + b * b).toFixed(2).replace(/\.00$/, ""))
                ret.skew = ret.skewX + "deg," + ret.skewY + "deg"
            }
           return ret
        },
        scale: function(e, nu, anchor) {
            var el = _wrap(e);
            if (!el) {
                return
            }
            if(typeof(nu)=="undefined"){
                return this.parseTransform(el).scale
            }
            var pre = $.browser.css3pr || "";
            if (nu) { //traslation into [dx,dy]=[tx,ty]
                el.el.style[pre + "transform"] = "scale(" + nu + ")"
                el.el.style["transform"] = "scale(" + nu + ")"
            } else{
                el.el.style.removeProperty("transform");
                el.el.style.removeProperty(pre + "transform");
            }
            return nu == null ? "" : el
        },
        translate: function(e, nu, anchor) {
            var el = _wrap(e);
            if (!el) {
                return
            }
            var pre = $.browser.css3pr || "";
            if (nu) { //traslation into [dx,dy]=[tx,ty]
                el.el.style[pre + "transform"] = "translate(" + nu + ")"
                el.el.style["transform"] = "translate(" + nu + ")"
            }
            return nu == null ? "" : el
        },
        skew: function(e, nu, anchor) {
            var el = _wrap(e);
            if (!el) {
                return
            }
            if(typeof(nu)=="undefined"){
                return this.parseTransform(el).skew
            }
            var pre = $.browser.css3pr || "";
            //             var skewY = ((180/Math.PI) * Math.atan2( ((0*a[2])+(1*a[3])),((0*a[0])-(1*a[1]))) - 90;
            //           var skewX = (180/Math.PI) * Math.atan2( ((1*a[2])+(0*a[3])),((1*a[0])-(0*a[1])));
            //        var rotation = ((180/Math.PI) * Math.atan2( ((0*a[2])+(1*a[3])),((0*a[0])-(1*a[1]))) - 90
            //
            if(typeof(anchor)=="number"){nu={x:nu,y:anchor}}
            if (nu) { //sx=sqrt(a*a+b*b) and sy=sqrt(c*c+d*c)
                if(typeof(nu)=="number"){
                    nu=nu+"deg,"+nu+"deg"
                }
                else if(typeof(nu)=="string"){
                    nu=nu.split(",").map(function(a){return a.trim()+"deg"}).join(",")
                } else if($.isPlain(nu)){
                    var obj=nu;nu=""
                    if(obj.x){nu=obj.x+"deg"}
                    if(obj.y){nu += (nu?",":"")+obj.y+"deg"}
                }
                el.el.style[pre + "transform"] = "skew(" + nu + ")"
                el.el.style["transform"] = "skew(" + nu + ")"
            } else{
                el.el.style.removeProperty("transform");
                el.el.style.removeProperty(pre + "transform");
            }
            return  el
        },
        rotation: function(e, nu, anchor) {
            var el = _wrap(e);
            if (!el) {
                return
            }
            if(typeof(nu)=="undefined"){
                return this.parseTransform(el).rotate
            }
            var st = document.defaultView.getComputedStyle(el.el, null),
                angle = 0,
                pre = $.browser.css3pr || "";
            var tr = st.getPropertyValue(pre + "transform") || st.getPropertyValue("transform") || ""
            if (tr) {
                var values = String(String(tr.split('(')[1]).split(')')[0]).split(',');
                var a = values[0],
                    b = values[1],
                    c = values[2],
                    d = values[3];
                if (a != null && b != null) {
                    var scale = Math.sqrt(a * a + b * b),
                        sin = b / scale; // arc sin, convert from radians to degrees, round  DO NOT USE: see update below
                    angle = Math.round(Math.atan2(b, a) * (180 / Math.PI)); //Math.round(Math.asin(sin) * (180/Math.PI));
                }
            }
            if (nu != null && typeof(nu) == "number" || (typeof(nu) == "string" && /\d+deg/.test(nu))) {
                var perspective = st.getPropertyValue(pre + "perspective-origin") || st.getPropertyValue("perspective-origin") || "50% 50%"
                if (anchor) {
                    if (anchor == "topleft") {
                        perspective = "0 0"
                    } else if (anchor == "bottomleft") {
                        perspective = "0 100%"
                    } else if (anchor == "topright") {
                        perspective = "100% 0"
                    } else if (anchor == "bottomright") {
                        perspective = "100% 100%"
                    } else if (/^\d/.test(anchor)) {
                        perspective = anchor
                    }
                }
                el.el.style[pre + "perspective-origin"] = perspective
                el.el.style["perspective-origin"] = perspective

                el.el.style[pre + "transform"] = "rotate(" + nu + (typeof(nu) == "number" ? "deg" : "") + ")"
                el.el.style["transform"] = "rotate(" + nu + (typeof(nu) == "number" ? "deg" : "") + ")"
            }
            return angle
        },

        height: function(e) {
            var el = _wrap(e);
            if (!el) {
                return
            }
            if (arguments.length > 1) {
                return el.css("h", arguments[1]);
            }
            return _asNumber(el.css("h"))
        },
        width: function(e) {
            var el = _wrap(e);
            if (!el) {
                return
            }
            if (arguments.length > 1) {
                return el.css("h", arguments[1]);
            }
            return _asNumber(el.css("w"))
        },
		 E: function(el) {
            return _wrap(el)
        },
        scrolltoView: function(e, pos,anim) {
            var el = _wrap(e);

            if (!el) {
                return
            }
             var scrollable = el.ancestors().find(function(it) {
                return it.scrollHeight > it.offsetHeight + 15
            })
            if (!scrollable) {
                el.el.scrollIntoView(!!pos)
            } else {
                var cnt=0
                      function scroll(){
                        var diff = el.bounds().bottom - scrollable.bounds().bottom
                        if(diff > 10 && cnt>400) {
                            scrollable.scrollTop += 10
                            cnt++
                            $d.util.animframe(scroll)
                         }
                    }
                    $d.util.animframe(scroll)

                    //scrollable.scrollTop += diff
             }
            return el
        },


        
        traverse: function walk(root0, optns) {
            optns = optns || {}
            if (typeof(optns) == "function") {
                optns = {
                    enter: optns
                }
            }
            var noText = optns.noText,
                textOnly = !!optns.textOnly,
                levels = Number(optns.level||0) || 10000
            var enter = typeof(optns.enter) == "function" ? optns.enter : function(){},
                exit = typeof(optns.exit) == "function" ? optns.exit : null,
                root = $d.toEl(root0),
                childProp=noText?"children":"childNodes";
            function _inner(node, lvl,memo) {
                // Call enter callback, and check if it explicitly returns false
                if (!node ) {
                    return
                }
                var t = node.nodeType,ret=enter(node, t, memo)
                if (ret === false) {
                    return false; // And return false
                }
                if(ret!==true){//skip children
                    var nodes = t === 1 ? node[childProp] : null; // Move to first child
                    if (nodes && nodes.length && (levels > lvl)) {
                        for (var i = 0,l=[].slice.call(nodes), ln = l.length, n; n = l[i], i < ln; i++) {
                            if (_inner(n, lvl + 1,memo) === false) {
                                return false;
                            }
                        }
                    }
                }

                // Call exit callback on the parent node and listen for false return value
                if (exit && exit(node, t,memo) === false) {
                    return false;
                }
                return ret;
            }
            _inner(root, 0,optns.memo)

        },
		
		 //isEmpty
        isEmpty: function(e) {
            return !($d.down(e))
        },
        empty: function(e) {
            return this.clear();
        },
        clearWhiteSpace: function(e,andcomments) {
            var el=$d(e), torem=[]
            if(!el){return}
            if(andcomments==null){andcomments=true}
            $d.traverse(el.el,
                function(node, t){
                    if(t===3 || (andcomments && t === 8)){if(!String(node.nodeValue).trim()){torem.push(node)}}
                });
            var elrem
            while(elrem=torem.pop()){
                elrem && elrem.parentNode &&  elrem.parentNode.removeChild(elrem)
            }
            return $d(e)
        },
        clear: function(e) {
            var el = _el(e)
            while (el && el.firstChild) {
                el.removeChild(el.firstChild)
            }
            return _wrap(el);
        },

        ex: _wrap,
        wrap: _wrap,
        st: function(el, par) {
            var clctn, list, dc = _dom,
                selector = el,
                parElem; //,info=setupCollectionWrap()
            if (el && typeof(el) == "object" && el.nodeType) {
                parElem = _el(el);
                selector = par;
            } else if (par && typeof(par) == "object" && par.nodeType) {
                parElem = _el(par);
                selector = el;
            }
            var lst = (typeof(selector) == "string") ? dc.qq(parElem || document, selector) : $.isArrayLike(selector) ? $.makeArray(selector) : null;
            if (!lst && el && el.nodeType) {
                lst = [el]
            }
            clctn = List.from(lst || []).chainable("element")
            if (clctn && clctn.config) {
                var c = clctn.config,
                    d = c._delegate
                c._shared || (c._shared = {});
                c._shared.root = $d(parElem || document)
                if (d && d.__type && d.__type.ctor) {
                    var pr = d.__type.ctor.prototype;
                    if (pr && typeof(pr.root) != "function") {
                        pr.$ = pr.reset = pr.root = function(sel) {
                            return sel ? $d.st(sel, this.config._shared.root) : this.config._shared.root
                        }
                    }
                    if (!c._shared._methods) {
                        clctn.config._shared._methods = {
                            "$": pr.$,
                            "reset": pr.reset,
                            "root": pr.root
                        }
                    }
                }
            }
            //clctn=info.ctor((lst||[]).map(dc.wrap),null,"dom")

            return clctn
        },
       

        toEl: _el,
        isAttached : function(el) {
            if (!el) {return}
            var elem
            if (!(elem = _el(el))) { return }
            var p = elem.el||elem;
            while (p && (p = p.parentNode) && ( p  !== document));
            return p === document

        }
    }

    Object.keys(_proto).forEach(function(k) {
        _dom[k] = _proto[k]
    });
    _dom.prototype = _dom

    _dom._coreHelper = true;
     if (!window.requestAnimationFrame) {
        window.requestAnimation
            = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }
    _dom.onAttach = (function() {
        var doc = document,
            body = document.body,
            docElem = doc.documentElement || doc.body,
            animklass = "nodeInserted";
        var isAttached = $d.isAttached
        function waitForInserton(elm, container) {
            container = container || doc;
            var timeout = 2000,
                p = Promise.deferred()
            if ($d.isAttached(elm)) {
                p.resolve($d(elm))
                return p
            }


            return (function(e, container, pr) {
                if (!e) {
                    return
                }
                var _timer = 0,
                    sel = typeof(e) == "string" ? e : e.nodeType ? ("#" + ($d(e) || {}).id || "") : null,
                    pr;
                if (!sel || sel == "#") {
                    return
                }

                function cleanup() {
                    if (!_timer) {
                        return
                    }
                    clearInterval(_timer);
                    _timer = null
                    var el = container.querySelector(sel)
                    if(el ){
                        el.classList.remove("attach-check")
                    }
                    $d.watchMutation(container, false);
                    document.removeEventListener('DOMNodeInsertedInDocument', chk)
                }
                pr.then(function(){},cleanup)
                function chk() {
                    if (_timer === null) {
                        return
                    }

                    var el = container.querySelector(sel)
                    if (!el) {
                        return
                    }

                    if (isAttached(el)) {
                        cleanup(); pr.resolve($d(el))
                        return el
                    }
                }
                if (!chk()) {
                    _timer = setInterval(chk, timeout);
                    document.addEventListener('DOMNodeInsertedInDocument', chk, false)
                    $d.watchMutation(container,"childList",chk)
                    var el = container.querySelector(sel)
                    if(el){
                        el.classList.add("attach-check")
                        $d.onTransiotionEnd(  el,function(ev){  chk() } ,true);

                    }

                    $d.css(el,$d.__transitionprop||"transition","all  .01s")
                }
                return pr;
            })(elm, container, p)

        }
        return function(el) {
            var args = [].slice.call(arguments, 1),
                callback, container, towatch;
            container = el;

            if (args[0] && (typeof(args[0]) == "string" || args[0].nodeType)) {
                towatch = args.shift();
            }
            if (typeof(args[args.length-1]) == "function") {
                callback = args.pop();
            }
            if (!towatch) {
                towatch = el;
                container = null;
            }
            if (!towatch) {
                console.error("to attach " + towatch)
            }

            var c = container && container.nodeType ? container : document;
            if (el == null) {
                return
            }
            var pr=waitForInserton(towatch, c);
            callback && pr.then(callback)
            return pr;
        }

    })();



    ["mousedown", "mouseup", "mouseover", "keyup", "keydown","dblclick"].forEach(function(k) {
        _dom[k] = Function("e,fn,optns", "$d.on(e,'" + k + "',fn,optns)")
    });
    return _dom
})();



 