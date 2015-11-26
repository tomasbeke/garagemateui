;(function(){
    $.Event=function(type ){
        return {
            type:type
        }
    };
    $.event={special:{}};

$.extend($d,{

        trigger: function(e, type, dat, options) {
            function copyProps(inst, d, opns) {
                ["x", "y", "pageX", "pageY", "touches", "changedTouches"].concat(Object.keys(inst)).forEach(
                    function(k) {
                        if (k == "type") {
                            return
                        }
                        var v = null
                        if (k in d) {
                            v = d[k]
                        } else if (k in opns && opns[k]) {
                            v = opns[k]
                        }
                        if (v && /element|target/i.test(k)) {
                            var dm = $d(v)
                            v = dm ? dm.el : null
                        } else {
                            if (!v || typeof(v) == "function" || v === inst[k]) {
                                v = null
                            }
                        }
                        if (v == null) {
                            return
                        }
                        try {
                            inst[k] = (typeof(v) == "object" && "length" in v) ? [].slice.call(v) : v
                        } catch (e) {}
                    }
                );
                if (opns.originalEvent) {
                    inst.originalEvent = opns.originalEvent
                } else if (data.originalEvent) {
                    inst.originalEvent = data.originalEvent
                }
            }


            var el = $d.toEl(e),
                data = {};
            if(type && typeof(type)=="object"){
                options=type
                type=options.type;
            }
            if (!options && dat && dat.options) {
                options = dat.options;
                delete dat.options
            }
            if (dat && dat.data) {
                options = dat;
                data = dat.data
                delete options.data;
            } else {
                data = dat || {}
            }
            data = data || {}
            options = options || {}

            if (!$.isPlain(data)) {
                data = {
                    data: data
                }
            }
            var id
            type = String(type).toLowerCase()
            if(type.indexOf(".")>0){
                var arr=type.split(".")
                type=  arr.shift()
                id=arr.join(".");
            }
            var evnt,view=document.defaultView,ctor=null,ctorname,intprops={
                'view': view,
                'bubbles': options.bubbles==null?true:options.bubbles,
                'cancelable': options.cancelable==null?true:options.cancelable
            };
            if (/^mouse/i.test(type)||type=="click") {
                ctorname="MouseEvents"
                 if(typeof(MouseEvent)=="function"){
                    ctor=MouseEvent;
                }

            }
            if (/^key/i.test(type)) {
                var character = data ? (data.data || data.key || data|| data.keyCode||"") : " "
                if (character && typeof(character) == "number") {
                    character = String.fromCharCode(character)
                 } else if(typeof(character)!="string"){character=""}
                ctorname="KeyboardEvent"
                if(typeof(KeyboardEvent)=="function"){
                    ctor=KeyboardEvent;
                }
                intprops.key=character
            } else if (("on"+type) in el) {
                ctorname="Event"
                if(typeof(Event)=="function"){
                    ctor= Event;
                }
             }  else {
                ctorname="CustomEvent";
                if(typeof(CustomEvent)=="function"){
                    ctor= CustomEvent;
                }
            }
            if(ctor){
                evnt= new ctor(type,intprops)
            } else{
                evnt = document.createEvent(ctorname);
                var initfn="init"+ctorname
                if(typeof(evnt[initfn])!="function"){
                    initfn="init"+ctorname.replace(/s$/,"")
                }
                if(typeof(evnt[initfn])=="function"){
                    evnt[initfn](type,intprops)
                }
            }
            if(evnt && !evnt.isDefaultPrevented){
                evnt.isDefaultPrevented=function(){return false;}
            }
            if(evnt) {
                copyProps(evnt, data, options)
                evnt.data = data
                el.dispatchEvent(evnt);

            } else{
                if (el.fireEvent) { // ie
                     el.fireEvent("on" + type);
                }
            }


            return evnt
        },
		__SpecialEventHandlers: (function() {
            var sp=null
            function registerSpecial(ev,setup,clear){
                $.event.special[ev]={setup:setup,clear:clear}
            }
            function _setup() {
                sp = $.event.special
                registerSpecial("wheel", function () {
                    var el = $d(this.delegate)
                    $d.addWheelListener(el, function (ev) {
                        $d(el).getEmitter().fire("wheel", ev)
                    });
                }, function () {
                    $d.addWheelListener(this.delegate, null)
                });
                registerSpecial("inview", function (ev) {
                    var _check = function _check(ev) {
                        var el = $d(this.delegate)
                        if (el && el.isVisible()) {
                            $d.watchMutation(el, false);
                            el.getEmitter().fire("inview", ev)
                            var hiddenanc = $d.data(el, "hiddenanc")
                            if (hiddenanc) {
                                $d.watchMutation(hiddenanc, false);
                                $d.data(el, "hiddenanc", null)
                            }
                            return true
                        }
                    }.bind(this)
                    if (_check()) {
                        return;
                    }
                    var el = $d(this.delegate)
                    $d.watchMutation(el, "offsetHeight style", _check);
                    var hiddenanc = $d.ancestors(el).find(function (a) {
                        return a.style.display == "none" || a.style.visibility == "hidden"
                    })
                    if (hiddenanc) {
                        $d.data(el, "hiddenanc", hiddenanc)
                        $d.watchMutation(hiddenanc, "display visibility", function (ev) {
                            if (!this.isVisible()) {
                                return
                            }
                            _check()
                        });
                    }

                }, function () {
                    var el = this.delegate
                    if(! $d(el)){return}
                    $d.watchMutation(el, false);
                    if ($d.data(el, "hiddenanc")) {
                        $d.watchMutation($d.data(el, "hiddenanc"), false);
                        $d.data(el, "hiddenanc", null)
                    }
                });

                registerSpecial("overflow", function () {
                    var el = this.delegate,emitter=this,isoverflow=false;
                    function _check( ){
                        var ev= {type:"overflow",data:{},target:el}
                        var nu=!!(el && el.scrollWidth>(el.offsetWidth+10) )
                        if(nu!==isoverflow){
                            isoverflow=nu;
                            ev.data.overflow=isoverflow;
                            emitter.fire(  ev)
                        }
                    }
                     $d.addResizeListener(el, _check);
                    _check();
                }, function () {
                    $d.removeResizeListener(this.delegate)
                });
                registerSpecial("resize", function () {
                    var el = this.delegate,emitter=this;
                    $d.addResizeListener(el, function (ev) {
                        emitter.fire("resize", ev)
                    });
                }, function () {
                    $d.removeResizeListener(this.delegate)
                });
                if (!document.body["onmouseleave"]) {
                    var dochandle = null,
                        lst = [];
                    (function () {
                        function h1(nm) {
                            var ths = this,
                                el = $d(this.delegate),
                                elem = el.el,
                                type = nm
                            if (!el || el.data("hover_handle")) {
                                return
                            }

                            function handle(ev) {
                                var target = ev.target,
                                    rel = ev.relatedTarget;
                                if (elem.contains(target) && (rel && !elem.contains(rel))) {
                                    if (!el.data("_entered")) {
                                        el.data("_entered", 1)
                                        ths.fire("mouseenter", ev)
                                    }
                                } else if (rel == elem && !elem.contains(target) && el.data("_entered")) {
                                    el.data("_entered", null)
                                    ths.fire("mouseleave", ev)
                                }
                            }

                            if (!dochandle) {
                                dochandle = function (ev) {
                                    for (var i = 0, ln = lst.length; i < ln; i++) {
                                        lst[i].call(this, ev)
                                    }
                                }
                                document.addEventListener("mouseover", dochandle)
                            }
                            lst.push(handle)
                            el.data("hover_handle", handle)
                        }

                        function h2(nm) {
                            var el = $d(this.delegate),
                                elem = el.el,
                                type = nm
                            if(!el){return}
                            var handle = el.data("hover_handle")
                            el.data("hover_handle", null)
                            var idx = lst.indexOf(handle)
                            if (idx >= 0) {
                                lst.splice(idx, 1)
                            }
                            if (dochandle && !lst.length) {
                                document.removeEventListener("mouseover", dochandle);
                                dochandle = null
                            }

                        }

                        registerSpecial("mouseleave", h1, h2)
                        registerSpecial("mouseenter", h1, h2)
                    })();
                }

                registerSpecial("transitionend", function (ev) {
                    if(!$d(this.delegate)){return}
                    $d(this.delegate).onTransiotionEnd(
                        (function () {
                            $d(this.delegate).getEmitter().fire("transitionend", ev)
                        }).bind(this)
                    )


                }, function () {
                })

                registerSpecial("visible", function (ev, optns) {
                    optns = optns || {}
                    var oldtimer = $d.data(this.delegate, "visiblitytimer")
                    if (oldtimer) {
                        oldtimer.cancel();
                    }

                    var timer
                    var pt = document.elementFromPoint.bind(document);

                    function isvis(memo) {
                        var e = memo.el ;
                        if (e && $d.isVisible(e, !optns.checkz)) {
                            return true
                        }
                        return false
                    }

                    function cancel(memo) {
                        var eltimer = memo.timer
                        if (eltimer) {
                            try{eltimer.cancel();} catch(e){}
                        }
                        memo.timer = null
                    }

                    var memo = {el: this.delegate}
                    function _check(memo) {
                        if (!(memo.el && $d.isAttached(memo.el))) {
                            if (!memo.visibility) {
                                cancel(memo);
                                return true
                            }
                        }
                        if (isvis(memo) === memo.visibility) {
                            $d(memo.el).getEmitter().fire("visible", {
                                type: "visible",
                                target: memo.el,
                                data: {visible: memo.visibility}
                            })
                            if (!optns.once ) {
                                memo.visibility = !memo.visibility

                            } else {
                                cancel(memo)
                                return true
                            }
                        }
                    }
                    if(optns.checktoggle){
                        memo.visibility = !isvis(memo)
                    }
                    else{
                        memo.visibility = true
                        optns.once=true;
                    }
                    if(!optns.checktoggle){optns.once=true}
                    setTimeout(function(){
                        if(!_check(memo)){
                            memo.timer = $.timer.until(500,_check , function end(res, memo) {
                                cancel(memo)
                            }, memo)
                            memo.timer && memo.timer.start()
                        }
                    },100)


                }, function (memo) {
                    cancel(memo)
                });
                registerSpecial("searchcancel",
                    function(ev, optns0){
                        if(this.delegate && this.delegate.type!=="search"){return }
                        $d.on(this.delegate,"click.searchcancel", function (ev) {
                            var el = this.delegate
                            var b=$d.bounds(el)
                            if(ev.x && ev.x < b.right && (b.right - ev.x) < 20){//clicked on clear link
                                ev.stopImmediatePropagation()
                            }
                            this.fire("searchcancel", ev )
                        }.bind(this));
                    },
                    function (fn) {if(!$d(this.delegate)){return}
                        this.off("click", "searchcancel")
                    }
                );
                registerSpecial("focusin",
                    function (ev, optns0) {
                        var fn= $.throttle(function(ev){
                            this.fire("focusin", ev )
                        }.bind(this ),{topEnd:true})
                        $d.onAttach(this.delegate,function( el){
                            el.data("focus_handle",fn)
                            el.el.addEventListener( "focus",fn );  el.el.addEventListener( "focusin",fn ); el.el.addEventListener( "DOMFocusIn",fn );

                        })

                    },
                    function (fn) {
                        if(!(this.delegate && this.delegate.el)){return}
                        var fn=this.delegate.data("focus_handle"),el=this.delegate.el
                        if(fn && el){
                             el.el.removeEventListener( "focus",fn );  el.el.removeEventListener( "focusin",fn ); el.el.removeEventListener( "DOMFocusIn",fn );
                        }
                     });
                registerSpecial("focusout",
                    function (ev, optns0) {
                        var fn= $.throttle(function(ev){
                            this.fire("focusout", ev )
                        }.bind(this ),{topEnd:true})
                        $d.onAttach(this.delegate,function( el){
                            el.data("focus_handle",fn)
                            el.el.addEventListener( "blur",fn );  el.el.addEventListener( "focusout",fn ); el.el.addEventListener( "DOMFocusOut",fn );

                        })

                    },
                    function (fn) {
                        if(!(this.delegate && this.delegate.el)){return}
                        var fn=this.delegate.data("focus_handle"),el=this.delegate.el
                        if(fn && el){
                            el.el.removeEventListener( "focus",fn );  el.el.removeEventListener( "focusin",fn ); el.el.removeEventListener( "DOMFocusIn",fn );
                        }
                    });
                registerSpecial("enter",
                    function (ev, optns0) {
                        $d.on(this.delegate,"keydown.enter", function (ev) {
                            (ev.keyCode==13) && this.fire("enter", ev );
                        }.bind(this));
                    },
                    function (fn) {
                        this.off("keydown", "enter")
                    });
                registerSpecial("esc",
                    function (ev, optns0) {
                        $d.on(this.delegate,"keydown.esc", function (ev) {
                            (ev.keyCode==27) && this.fire("esc", ev );
                        }.bind(this));
                    },
                    function (fn) {
                        this.off("keydown", "esc")
                    });
                registerSpecial("attrmodified",
                    function (ev, optns0) {
                        var optns = (optns0 || {}).mutation || optns0
                        $d.watchMutation(this.delegate, optns, function (rec) {
                            if (!rec) {
                                return
                            }
                            $d(this).getEmitter().fire("attrmodified", ev, rec)
                        })
                    },
                    function (fn) {if(!$d(this.delegate)){return}
                        var rec = $d(this.delegate).data("_mutation")
                        rec.remove(fn)
                    });

                registerSpecial("attach",
                    function (ev, optns0) {
                        var optns = (optns0 || {}).mutation || optns0
                        var selector=optns.selectortocheck||optns.selector
                        $d.onAttach(this.delegate,selector,function(el){
                            $d(el).getEmitter().fire("attach", {target:el} )
                        })
                    },
                    function (fn) {  });

                function genmobileev( nm) {
                    registerSpecial(nm, function () {
                        if (!$d.__pointerEvents) {
                            //$d._setupPointerEvents();
                            $d.__pointerEvents=true;
                        }
                        var handle = $d.data(el, nm + "_handle")
                        if (handle) {
                            return
                        }
                        var ths = this,
                            el = ths.delegate
                        handle = function (ev) {
                            if (ev && ev.target && !el.contains(ev.target.el || ev.target)) {
                                return
                            } else {
                                ths.fire(nm, ev)
                            }
                        }
                        document.addEventListener(nm, handle)
                        $d.data(el, nm + "_handle", handle)
                    }, function () {
                        var handle = $d.data(el, nm + "_handle")
                        $d.data(el, nm + "_handle", null)
                        document.removeEventListener(nm, handle)

                    })

                };
                ["swipe", "swipeleft", "swiperight", "swipeup", "swipedown", "tap", "dbltap"].forEach(
                    function (k) {
                        genmobileev( k)
                    }
                )
            }
            return function (){
                if(!sp){_setup()}
                return sp;
            }

        })(),



        _pointerEvent: function _pointerEvent(e, ev, fn, cap) {
            var el = $d(e),
                evmap = {
                    mousedown: "touchstart",
                    mouseup: "touchend",
                    mousemove: "touchmove",
                    mouseleave: "touchleave",
                    click: "tap"
                }
            if (!el) {
                return
            }
            if (window.isTochDevice == null) {
                window.isTochDevice = !!($.browser && ($.browser.isTouchDevice || $.browser.touch || $.browser.mobile))
            }
            if (!(window.isTouchDevice && evmap[ev])) {
                return $d.on(e, ev, fn)
            }
            ev = evmap[ev]

            if (typeof(fn) === "function" && ev == "tap") {
                var elem = el.el
                elem.addEventListener(evmap.mousedown, function c(ev) {
                    var t = ev.target;
                    this.addEventListener(evmap.mouseup, function mup(ev1) {
                        this.removeEventListener(evmap.mouseup, mup)
                        if (ev1.target === t) {
                            var data = {
                                originalEvent: ev1
                            }
                            Object.keys(ev1).forEach(function(k) {
                                if (k != "type" && ev1[k] && typeof(ev1[k]) != "function") {
                                    data[k] = ev1[k]
                                }
                            })
                            el.trigger("tap", {
                                custom: true,
                                data: data
                            })
                        }
                    })
                }, !!cap)
            }
            if (fn === false) {
                el.el.removeEventListener(ev)
            } else {
                var f = function(ev) {
                    var t = (ev.touches || [])[0],
                        x = ev.x,
                        y = ev.y
                    if (!t && ev.changedTouches && ev.changedTouches.length) {
                        t = ev.changedTouches[0]
                    }
                    var nutarget
                    if (t && t.pageX) {
                        ev.x = t.pageX
                        nutarget = t.target
                        ev.y = t.pageY
                    }
                    if (!nutarget && ev.originalEvent) {
                        if (ev.originalEvent.target) {
                            nutarget = ev.originalEvent.target
                        }
                    }
                    if (nutarget) {
                        ev.target = nutarget
                    }
                    var evt = ev
                    if (nutarget && ev.target != nutarget) {
                        evt = $.clone(ev);

                        evt.stopPropagation = ev.stopPropagation.bind(ev)
                        evt.stopImmediatePropagation = ev.stopImmediatePropagation.bind(ev)
                        evt.preventDefault = ev.preventDefault.bind(ev)
                        evt.target = nutarget;
                    }
                    fn.call(this, evt)
                }
                el.el.addEventListener(ev, f, !!cap)
            }
            return el
        },
        pointerselect: function pointerselect(e, fn, cap) {
            return $d._pointerEvent(e, "click", fn, cap)
        },
        pointerenter: function pointerenter(e, fn, cap) {
            return $d.on(e, "mouseenter", fn, cap)
        },
        pointerleave: function pointerleave(e, fn, cap) {
            return $d.on(e, "mouseleave", fn, cap)
        },
        pointerdown: function pointerdown(e, fn, cap) {
            return $d._pointerEvent(e, "mousedown", fn, cap)
        },
        pointerup: function pointerup(e, fn, cap) {
            return $d._pointerEvent(e, "mouseup", fn, cap)
        },
        pointermove: function pointermove(e, fn, cap) {
            return $d._pointerEvent(e, "mousemove", fn, cap)
        },
        pointerover: function pointerenter(e, fn, cap) {
            return $d._pointerEvent(e, "mouseover", fn, cap)
        },
        off: function _off(el0, ev, fn, id) {
            var el = $d(el0),
                emitter
            if (!el) {
                return
            }
            emitter = $d.getEmitter(el)
            if (emitter) {
                if (typeof(ev) == "string" && ev.indexOf(".") > 0) {
                    var arr = ev.split(/\./)
                    ev = arr.shift()
                    id = arr.join(".")
                }
                if (typeof(fn) == "string") {
                    emitter.off(ev, fn)
                } else {
                    emitter.off(ev, fn, id)
                }
            }
            return el
        },
        outside:function(el ,optns){
            var elem = $d(el)
            if (!elem) {
                return
            }
            optns=optns||{}
            if(typeof(optns)=="function"){
                optns={callback:optns}
            };

            return (function(elem,options){
                var chk=function(){return true}
                if( typeof(options.test)=="function"){
                    chk=options.test
                }
                var cleared=false
                function mup(ev){
                    if(!elem.contains(ev.target) && chk.call(elem,ev.target,ev)){
                        clearEvents( )
                    }
                }
                function kup(ev){
                    if(ev && !(ev.target && ev.target.type) && ev.keyCode==27 && chk.call(elem,ev.target,ev)){
                        clearEvents( )
                    }
                }
                function clearEvents( noev){
                    document.removeEventListener("mousedown",mup)
                    document.removeEventListener("keydown",kup)
                    if(options.callback && noev!==true ){
                        options.callback.call(elem,noev)
                        options.callback=null;
                    }
                    cleared=true;
                }
                setTimeout(function(){
                    clearEvents( true);
                    cleared=false;
                    if( options.esc!==false) {
                        document.addEventListener("keyup", kup)
                    }
                    if(options.ignoreblur!==true) {
                        document.addEventListener("mousedown",mup)
                    }
                },1);
                return {
                    cancel: function(){
                        if(this._cancelled){return}
                        this._cancelled=true
                        clearEvents(true);
                    } ,
                    el:elem
                }


            })(elem,optns);

        },
    _on: (function _on() {

        var keyM=null,_curry=null,_supportsMouseXY=false;
        var filters={
            mousepos:function( ev){
                if(!("x" in ev)){
                    $d.util.mousePos(ev,null)
                } else {
                    _supportsMouseXY=true
                }
                return true
            },
            lclick:function(ev){
                return !((ev.which && ev.which == 3) || (ev.button && ev.button == 2))
            },
            selector:function(selector,ev){
                return $d.selfOrUp(ev.target,selector)||null
            },
            kbdkey:function(selector,ev){
                if (ev && ev.keyCode == 16) {
                    return true
                }
                keyM||(keyM = $.eventUtil);
                if (keyM.is(ev, selector)) {
                    return true
                } else {
                    ev.preventDefault && ev.preventDefault();
                    return false
                }
            }
        }
        function _parseEv(ev,options){
            var arrsel = ev.split(/::/),
                selector="",
                id, evnm, arr,once,evlist
            ev = arrsel.shift();
            options=options||{}
            if(typeof(options)=="string"){options={selector:options}}
            if(typeof(options)=="boolean"){options={once:options}}
            if(!$.isPlain(options)){
                options={}
            }
            if(/[\s\,]/.test(ev)){
                evlist=ev.split(/[\s\,]/).map(function(a){return a.trim()})
            } else{
                selector = arrsel.join("::");
                arr = ev.split(/\./);
                evnm = arr.shift();
                id = arr.join(".");
                arr = evnm.split(/!/);
                evnm = arr.shift();
                if(arr.length ){
                    if(arr[0]=="once"){options.once=true}
                    else {options.async=true}
                }
            }


            if(selector){options.selector=selector}
            if(id){options.id=id}
            options.ev=evlist||evnm
            var evfilters=[]
            if(evlist){options.islist=true;evnm=evlist.join(",")}
            if(/^key/i.test(evnm)){
                options.keyboard=true
            } else if(/mouse|click/i.test(evnm)){
                options.mouse=true
                _supportsMouseXY || evfilters.push( filters.mousepos )
                if(!(evnm=="rightclick" || evnm=="rclick") && /mousedown|mouseup|click/i.test(evnm)){
                    evfilters.push( filters.lclick)
                }
            }
            if( options.selector){
                _curry||(_curry=$.fn.curry);

                if(options.keyboard ){
                    evfilters.push(_curry(filters.kbdkey,options.selector))
                }
                else {
                    evfilters.push(_curry(filters.selector,options.selector))
                }
            }
            if(evfilters.length){
                options.filters=evfilters;
            }
            return options
        }

        function _process(e, ev, fn, optns,scopeddelegate) {
            var elem = $d(e);
            if (!elem) {
                return
            }
            if($.isPlain(ev)){
                $.each(function(val,key){
                    _process(e,key,val,optns,scopeddelegate)
                })
                return elem;
            }
            var fun = $.fnize(fn,{scope:elem}), options = _parseEv(ev, optns)
            if(typeof(fun)!="function"){return}
            var emitter = elem.getEmitter( )
            if(!emitter){return}
            if (options.islist) {
                options.scopeddelegate=scopeddelegate
                options.ev.forEach(function (evnm) {
                    emitter.on(evnm, fun, options);
                })
            } else {options.scopeddelegate=scopeddelegate
                emitter.on(options.ev, fun, options);
            }
        }


        return function(el0, ev, fn, optns,scopeddelegate) {
            if (Array.isArray(el0)) {
                el0.forEach(function(e) {
                    _process(e, ev, fn, optns,scopeddelegate)
                })
            } else {
                _process(el0, ev, fn, optns,scopeddelegate)
            }

            return Array.isArray(el0) ? el0 : $d(el0 )
        }

    })()
    ,
    one: function on(e, ev, fn, optns,scopeddelegate) {
        optns=optns||{}
        optns.once=true;
       return  $d.on( e, ev, fn, optns,scopeddelegate)
    },
        on: function on(e, ev, fn, optns,scopeddelegate) { //events [, selector ] [, data ], handler )
            var options={},handler=fn
            if(typeof(scopeddelegate)=="function"){
                handler=scopeddelegate;
                scopeddelegate=null;
                options.data=optns
                optns=null;
            }

            if(typeof(optns)=="function"){
                handler=optns;
            }
            if(typeof(fn)=="string"){
                options.selector=fn;
            }
            if(typeof(optns)=="string"){
                options.selector=optns;
            }
            if($.isPlain(optns)){
                $.extend(options,optns)
            }
            if(!(scopeddelegate && typeof(scopeddelegate)=="object")){
                scopeddelegate=null
            }
            if(typeof(ev)=="string" && ev.indexOf(":")>0){
                var arr=ev.split(":")
                options.selector=arr[1];
                ev=arr[0];
            }
            return   $d._on(e, ev, handler, options,scopeddelegate)
        },
        getEmitter:(function(){
            var customEvs=[
                "removed","attached"
            ]
            function _emitter(e){
                this.delegate=e;
                this.listeners={};
            }
            _emitter.prototype={
                on:function(ev,fn,opts){
                    var elem=$d(this.delegate)
                    if(!elem){return}
                    opts=opts||{};
                    var listeners=this.listeners[ev]||(this.listeners[ev]={type:ev,list:[]}),l=listeners.list,ln=listeners.list.length,sp_events=$d.__SpecialEventHandlers()
                    if(ln){
                        var id=opts.id
                        for(var i= 0 ;i<ln;i++){
                            if((id && l[i].opts.id==id) || l[i].fn==fn){return l[i]}
                        }
                    }
                    var data={opts:opts,fn:fn};
                    if(customEvs[ev] || opts.custom){listeners.custom=true}
                    listeners.list.push(data)
                    if(sp_events&&sp_events[ev]&&sp_events[ev].setup){
                        sp_events[ev].setup.call(this,ev,opts)
                        listeners.sp_event=sp_events[ev];
                    } else{
                         if( !listeners._domhandler && !listeners.custom){
                             elem.el.addEventListener(ev,listeners._domhandler=this.fire.bind(this));

                        }
                    }

                },
                removeAll:function(){
                    var dlg=$d(this.delegate);
                    if(!dlg){return}
                    var listeners=this.listeners,el=dlg.el;
                     for(var i= 0,l=Object.keys(this.listeners),ln= l.length;i<ln;i++){
                        var k=l[i],listener=this.listeners[k]
                        if(!listener ){continue}
                        listener._domhandler && el.removeEventListener(k,listener._domhandler);
                         if(listener.sp_event && listener.sp_event.clear){
                            listener.sp_event.clear.call(this)
                        }
                        delete this.listeners[k];
                    }
                    return
                },
                off:function(ev,fn){
                    var dlg=$d(this.delegate);
                    if(!dlg){return}
                    if(ev===null ){
                        return this.removeAll();
                    }
                    var el=dlg.el,alllisteners=this.listeners,listeners=alllisteners[ev];
                    if(!listeners){//if not ev but id
                        for(var i= 0,l=Object.keys(alllisteners),ln= l.length;i<ln;i++){
                            var k=l[i],listener=alllisteners[k]
                            if(!(listener && listener.list && listener.list.length)){continue}
                            for(var list=listener.list,j= list.length-1;j>=0;j--){
                                if(list[j] && list[j].opts && list[j].opts.id===ev){
                                    list.splice(j,1)
                                }
                            }
                        }
                    } else {
                        var list=listeners.list,ln=list.length,torem=[]
                        if(ln){
                            var id=typeof(fn)=="string"?fn:null
                            for(var i= 0;i<ln;i++){
                                if((id && list[i] && list[i].opts.id===id) || list[i].fn===fn ){
                                    torem.push(list[i]);
                                }
                            }
                            while(torem.length){
                                var i=list.indexOf(torem.shift())
                                i>=0 && list.splice(i,1)
                            }
                        }
                        if(listeners.sp_event && listeners.sp_event.clear){
                            listeners.sp_event.clear.call(this)
                        }
                        if(!list.length && list._domhandler  ){
                            dlg.el.removeEventListener(ev,listeners._domhandler );
                            delete this.listeners[ev];
                        }
                    }
                },
                destroy:function(){
                   this.removeAll(null)
                    delete this.delegate
                },
                fireAsync:function(ev){
                    setTimeout(this.fire.bind(this,ev),1);
                },
                fire:function(ev){
                    var elem=$d(this.delegate);
                    if(!elem || !ev){return}
                    var res,ennm,l,ln,torem=[]
                    if(typeof(ev)=="string"){
                         ev={type:ev,target:elem.el}
                    }
                    ennm=ev.type;
                    if(this.listeners[ennm]){
                        l=this.listeners[ennm].list
                        ln=l.length


                        for(var i= 0;i<ln;i++){
                            var ret=null,options=l[i].opts,fn=l[i].fn
                            if(options.filters){
                                for(var i1= 0,l1=options.filters,ln1= l1.length;i1<ln1;i1++){
                                    ret=l1[i1](ev);
                                    if(!ret){return;}
                                }
                            }
                            if(ret && typeof(ret)=="object"){
                                res= fn.call(options.scopeddelegate||elem,ev,ret)
                            }
                            else{res=  fn.call(options.scopeddelegate||elem,ev)}
                            if(res===false || options.once) {
                                torem.push(l[i])
                            }

                        }
                    }
                    while(torem.length){
                        var i= l.indexOf(torem.shift())
                        i>=0 && l.splice(i,1)
                    }
return res;
                }
            }

            function getEmitterInstance(el,onlyifexists){
                if(!el) {return}
                 var emitter = el.data("_emitter")
                if (!emitter && !onlyifexists) {
                    el.data("_emitter", emitter = new _emitter(el))
                }
                return emitter
            }
            return function (el0,onlyifexists){
                 return  getEmitterInstance($d(el0),onlyifexists)

            }
        })(),
    focusin: function(e, enter, exit, selector) {

    },
    focusout: function(e, enter, exit, selector) {

    },
		hover: function(e, enter, exit, selector) {
            var el = $d(e);
            if (!el) {
                return
            }
            var h = [enter, exit].map(function(fn) {
                return (typeof(fn) != "function") ? function() {} : fn
            });
            if (selector && typeof(selector) == "string") {
                var curr = null;
                el.on("mousemove", function(ev) {
                    var t = $d.up(ev.target, selector);
                    if (!t) {
                        return
                    }
                    if (curr && (curr.el.contains(t.el))) {
                        return
                    }
                    if (el.contains(t) && $d.matches(t, selector)) {
                        if (curr) {
                            h[1].call(this, ev, curr)
                        }
                        curr = t;
                        h[0].call(this, ev, $d(t))
                    } else if (curr) {
                        h[1].call(this, ev, $d(curr))
                        curr = null;
                    }
                });
                el.on("mouseleave", function(ev) {
                    if (this.contains(ev.target)) {
                        return
                    }
                    if (curr) {
                        h[1].call(this, ev, $d(curr))
                        curr = null;
                    }
                });
                return el;
            }
            el.on("mouseenter", h[0]);
            el.on("mouseleave", h[1])
            return el
        }
		});
})();		
		//} end