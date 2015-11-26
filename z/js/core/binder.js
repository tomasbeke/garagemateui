/**
 * Created by Atul on 5/20/2015.
 */
$.binder = (function () {
    var _bindings = [],_cahce={}

    var _binder = function () {
        var config = {}
        if (arguments.length == 1) {
            config = arguments[0]
        }
        else if (arguments.length == 2) {
            config = {source: arguments[0], target: arguments[1]}
        }
        else if (arguments.length == 3) {
            config = {source: arguments[0], trigger: arguments[1], target: arguments[2]}
        }
        else if (arguments.length == 4) {
            config = {source: arguments[0], trigger: arguments[1], target: arguments[2], property: arguments[3]}
        }
        var src = config.src || config.source, target = config.target, srcprop0 = config.srcprop || config.trigger, targetprop0 = config.targetprop || config.property
        var srcobj, targetobj, isdom, srcprop = srcprop0, targetprop = targetprop0
        if (!target) {
            target = src
        }

        if(config.id  ){
            if(target && typeof(target.data)=="function") {
                var bounds = target.data("_bound")
                if (bounds) {
                    if (bounds[config.id]) {
                        return Promise.resolve(bounds[srcprop])
                    }
                }
            }
            if(_cahce[config.id]){
                return Promise.resolve(_cahce[config.id])
            }
        }
        var promises = []

        var srcpr = new Promise(function (res, rej) {
            var rec = {}, prop = srcprop, obj = srcobj
            if(srcobj && srcobj.isPromise){
                res({el:srcobj})
                return;
            }
            if (typeof(src) == "string") {
                if (src.indexOf(".") > 0) {
                    var arr = src.split(/\./);
                    prop = arr.pop();
                    rec.el = $(arr.join("."));
                }
                try {
                    var el = $d(rec.el || src)
                    rec.el = el
                    rec.isdom = true
                } catch (e) {
                }
                if (!rec.isdom) {
                    try {
                        var el = (1, eval)(rec.el || src)
                        rec.el = el
                    } catch (e) {
                    }
                }

            } else if (src && typeof(src) == "object") {
                rec.el = src
                rec.isdom = src.nodeType > 0
            }
            rec.property = prop;
            if (rec.el && !rec.property) {
                if (rec.isdom) {
                    if ($d.is(rec.el,"input")) {
                        rec.property = "value"
                    }
                    else {
                        rec.property = "visibility"
                    }
                }
            }
            if (!(rec.el && rec.property != null)) {
                rej("invalid")
            }
            if (rec.isdom) {
                $d.onAttach(rec.el, function (dom) {
                    rec.el = dom;
                    res(rec)
                })
            }
            else {
                res(rec)
            }
        })
        var targetpr = new Promise(function (res, rej) {
            var rec = {} , prop = targetprop;

            if (typeof(target) == "string") {
                if (target == "print" || target == "dump") {
                    target = "log"
                }
                if (typeof(console[target]) == "function") {
                    rec.fn = console[target].bind(console)
                }

                else if (target.indexOf(".") > 0 && /^[\w\.\-_\$]+$/.test(target)) {
                    var arr = target.split(/\./);
                    rec.name = rec.property = arr.pop();
                    rec.el = arr.join(".");
                }
                try {
                    var el = $d(rec.el)
                    rec.el = el
                    rec.isdom = true
                } catch (e) {
                }
                if (rec.isdom && !rec.name) {
                    rec.name = "visible"
                }
            }
            else if (target && typeof(target) == "object") {
                rec.el = target
                rec.isdom = target.nodeType > 0
            }
            else if (typeof(target) == "function") {
                rec.fn = rec.el = target
            }
            if (!rec.fn) {
                if (typeof(prop) == "function") {
                    rec.fn = prop
                    if (target && typeof(target) == "object") {
                        rec.fn = prop.bind(target)
                    }
                }
            }
            if (!rec.name) {
                if (prop) {
                    if (typeof(prop) == "object") {
                        if ("name" in prop) {
                            rec.name = prop.name;
                            if (prop.value) {
                                if (typeof(prop.value) == "function") {
                                    rec.valueexpr = prop.value
                                    // if(target&&typeof(target)=="object"){rec.fn=prop.value.bind(target)}
                                } else if (typeof(prop.value) == "string") {
                                    if (/\W/.test(prop.value)) {
                                        rec.valueexpr = $.fnize(prop.value) || prop.value;
                                    }
                                }
                            }
                        }
                    } else if (typeof(prop) == "string") {
                        rec.name = prop;
                        rec.property = "value";
                    }
                    rec.options = prop
                }
            }

            if (rec.el && (rec.isdom || typeof(rec.el) == "object") && !rec.fn) {
                if (rec.isdom) {
                    if (!rec.name || rec.name == "value") {
                        var el = rec.el.el || rec.el
                        if ( "form" in el || "onchange" in el) {
                            rec.name = "value";
                            rec.fn = function (datarec) {
                                if(datarec==null){return}
                                var val=typeof(datarec)=="object"?datarec.value:datarec
                                if(typeof(rec.valueexpr) == "function"){
                                    val=rec.valueexpr.call(this, datarec)
                                }
                                return $d(this.target.el).val(val)
                            }
                        } else {
                            rec.name = "visible"
                        }
                    }
                    if (rec.name && !rec.fn) {
                        rec.fn = (function (metarec) {
                            var rec = metarec   , mthdnm, el = $d(rec.el) || rec.el
                            rec.mthd=$d.prop.bind($d, rec.el, rec.name);
                            /*if (!(rec.name == "width" || rec.name == "height") && rec.el && typeof( el[rec.name]) == "function" || typeof($d[rec.name]) == "function") {
                             rec.mthd = $d[rec.name].bind($d, rec.el)
                             } else {
                             mthdnm = $d.css.isStyle(rec.name) ? "css" : "prop"
                             rec.mthd = $d[mthdnm].bind($d, rec.el, rec.name)
                             }*/
                            rec.valueres = typeof(rec.valueexpr) == "function" ? rec.valueexpr : function (r) {
                                return r.value
                            }
                            var curried=null,rcurried=null
                            if( rec.options&&rec.options.args){
                                curried=[].concat(rec.options.args||[])
                                if(curried[0]=="_"){
                                    rcurried=curried.slice(1)
                                    curried=null
                                }
                            }
                            return function (datarec) {
                                var valrec = (datarec && datarec.data) ? datarec.data : datarec
                                var ctx = this.target, v = ctx.valueres.call(this, valrec)
                                if(curried){return ctx.mthd.apply(ctx,curried.concat(v))}
                                else if(rcurried){
                                    return ctx.mthd.apply(ctx,[v].concat(rcurried))
                                }
                                return ctx.mthd(v)
                            }

                        })(rec);


                    }
                } else {
                    if (!rec.name || rec.name == "visible" || rec.name == "show" || rec.name == "visibility") {
                        if (typeof(rec.el.show) == "function" && typeof(rec.el.hide) == "function") {
                            rec.fn = function (r) {
                                this.target.el[(r || {}).value ? "show" : "hide"]()
                            }
                        } else if (typeof(rec.el.toggle) == "function") {
                            rec.fn = function (r) {
                                this.target.el.toggle((r || {}).value)
                            }
                        }
                    } else if (typeof(rec.el.setProperty) == "function") {
                        rec.fn = function (r) {
                            this.target.el.setProperty(this.target.name, (r || {}).value)
                        }
                    } else if ("properties" in rec.el && typeof((rec.el.properties || {}).set) == "function") {
                        rec.fn = function (r) {
                            this.target.el.properties.set(this.target.name, (r || {}).value)
                        }
                    }

                }

            }
            if (!rec.fn) {
                if (rec.property == "value" && rec.name) {
                    rec.fn = function (rec) {
                        if (this.target.el[this.target.name] != rec.value) {
                            this.target.el[this.target.name] = rec.value
                        }
                    }
                }

            }

            if ((rec.el || rec.fn)) {
                if (rec.isdom && !$d.isAttached(rec.el)) {
                    var elem = $d(rec.el)
                    $d.onAttach(elem ? elem.el : rec.el, function (dom) {
                        rec.el = dom;
                        res(rec)
                    })
                }
                else {
                    res(rec)
                }
            }
            else {
                rej("invalid target")
            }

        });


        return new Promise(
            function (res, rej) {
                var record = {src: null, target: null, lastupdate: 0, count: 0, invoke: null }
                Promise.all([srcpr, targetpr]).then(
                    function (list) {
                        record.id=record.id|| $.UUID()
                        record.src = list[0]
                        record.target = list[1]
                        record.invoke = function (datarec) {
                            if (this.target && this.target.fn) {
                                this.target.fn.call(this, datarec)
                            }
                        }
                        res(record);

                    }
                )

            }
        );


    }

    function _bind() {//config
        var nu = _binder.apply(this, arguments), nodefault = 0
        if (arguments.length == 1 && arguments[0] && arguments[0].nodefault) {
            nodefault = 1
        }
        nu.then(function (rec) {
            nu.record = rec;
            rec.promise = nu;

            var src = rec.src.el, prop = rec.src.property
            if(rec.__processed ){}
            else if(src && src.isPromise){
                src.then(function (data) {
                    this.invoke(data)
                }.bind(rec))
                return
            }
            else if (prop && String(prop).indexOf("on") == 0 && ("on" in src)) {
                src.on(prop.substr(2), function (ev) {
                    this.invoke(ev)
                }.bind(rec))
            }
            else if (rec.src.isdom) {
                if (src.type && prop == "value") {
                    (function (ths) {
                        var modrec = $.modRecord("valchange");
                        $d.on(src, "change", function () {
                             modrec.value =  $d.val(this) ;
                         })
                        modrec.on(function (datarec) {
                            this.invoke(datarec)
                        }.bind(ths))
                    })(rec);
                }
                else {
                    $d.watchMutation(src, prop, function (datarec) {
                        this.invoke(datarec)
                    }.bind(rec))
                }
                //$d.on(srcobj,"attrModified",targethandle,{mutation:srcprop})
            } else if (typeof(src.onpropertychange) == "function"||typeof(src.onchange) == "function") {
                var mthd=src.onpropertychange||src.onchange;
                mthd.call(src,prop, function (datarec) {
                    this.invoke(datarec)
                }.bind(rec))
                if(src[prop]!=null){

                }
                nodefault = 1;
            } else {
                $.watchProperty(src, prop, function (valrec) {
                        this.invoke(valrec)
                    }.bind(rec), {quiet: true}
                )
            }
            rec.__processed=true
            if (!nodefault && src[prop]!=null) {
                rec.invoke({value:src[prop]})
            }
            var targetel=rec.target
            if(targetel.el){targetel=targetel.el}
            if(targetel ){
                var bounds
                if(typeof(targetel.data)=="function"){
                    bounds=targetel.data("_bound")
                    if(!bounds){targetel.data("_bound",bounds={})}
                }
                else if(targetel.__id){_cahce[targetel.__id]=rec;}

                if(bounds && prop){
                    bounds[prop] = rec;
                }
            }
        });

        return nu
    }

    return {
        bindAll: function () {
            [].concat.apply([], $.makeArray(arguments)).forEach(function (it) {
                this.bind(it)
            }.bind(this))
        },
        bind: function () {

            return _bind.apply(this, arguments)

        },
        unbind: function (bindd) {

        }

    }
})();