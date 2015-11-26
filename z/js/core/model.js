/**
 * Created by Atul on 5/20/2015.
 */


$.model = (function () {

    var proto={

        init: function (id,props,config) {
            if(this.setupModel(id,props,config)===false){return}
            //$.extend(this,{boundRecord: null,__bindCache:null,scopeid:null,zscoped:null,attributes:null})
            this.zscoped={}
            this.__bindCache={}
            var ths = this;
            if(this.boundRecord) {
                ths.bindRecord();
            }
            //if(this.afterInitialize){
            //    this.afterInitialize.apply(this,arguments);
            //}

        },
        initModelInstance: function() {},

        getBoundMap: function () {
            var ret = {}
            $.keys(this._bound).forEach(function (k) {
                ret[k] = this.get(k)
            }, this )
            return ret
        } ,
        bindRecord: function (rec) {

            if (rec && rec.__record__) {
                rec.__bound = 1
                this.boundRecord = rec
            } else {
                rec = null
            }
            if (this.boundRecord && (rec || !this.boundRecord.__bound)) {
                this.boundRecord.__bound = 1
                var record = this.boundRecord

                this.onchange("*", function (rec) {
                    if (rec.name == "id" || !record.hasField(rec.name)) {
                        return
                    }
                    record.set(rec.name, rec.value)
                })
            }
            return this

        },

        watch: function (nm, fn) {
            $.watchProperty(this,nm,fn)
            return this
        },
        unwatch: function () {
            return this
        },
        unbind: function (nm) {
            if (this._bound && this._bound[nm]) {
                this._bound[nm].forEach(function (it) {

                })
            }
            return this
        },
         digest: function (dom, scopeid,scoped ) {
            var force
            if(scoped !=null && typeof(scoped)!="object"){force=scoped;scoped=null;}
            var scope=scoped||this;
            this._complied||(this._complied={});

            scopeid=scopeid||(this.scopeid|| (this.scopeid=$.UUID()));
            var compiled=this._complied[scopeid]
            if(!compiled||force){
                this._complied[scopeid]=compiled=$.scanDom(dom ,scopeid,scope);
                //this._complied[scopeid]=compiled=this.compile(dom,scopeid, scope)
            }
            if(compiled){
                compiled.reset(scope);
            }
            return this
        },
        compile: function (dom,scopeid,scope) {
            scopeid=scopeid||(this.scopeid|| (this.scopeid=$.UUID()));
            this._complied||(this._complied={});
            return this._complied[scopeid]=$.scanDom(dom ,scopeid,scope||this);
        },
        updateProperties: function (rec) {return this.update(rec)},
        getController :function (e) {
            if (!this._controller) {
                $.defineValue(this, "_controller", {value: $.controller.create(this, e), enumerable: true, configurable: true, writable: false})
            }
            return this._controller
        },scanDom:function(el,scope,scopeid){
            scopeid=scopeid||this.scopeid;
            scope=scope || this
            scope._complied||(scope._complied={});
            if(!(scope._complied && scope._complied[scopeid])){
                return scope.compile(el, scopeid||this.scopeid)
            }
            return scope._complied[scopeid].scan(el);

        }


    };
    //var kls = $.baseModel.extend("model",proto)
    var kls = $.simpleModel.extend("model",proto)
    //var kls = Klass("$.model" ,$.baseModel,proto)
    //kls.classMeta._enhanced = true
    return kls

})();

$.model.from = function (props) {
    var nu=new $.model(props)
    return nu
}
$.model.make = function () {
    var nu, props = {}, id=null, proparr, addtnl = {}, args = [].slice.call(arguments), boundscope;
    if (typeof(args[0]) == "string" && !/\s/.test(args[0].trim())) {
        id = args.shift()
    }

    if (args.length > 1) {
        if (args[args.length - 1] && $.isPlain(args[args.length - 1])) {
            addtnl = args.pop()
        }
    }
    if (args[0] && typeof(args[0]) == "object") {
        if (!$.isPlain(args[0])) {
            boundscope = args.shift()
        }
        else {
            proparr = args.shift()
        }
    } else if (args[0] && typeof(args[0]) == "string") {
        if (args.length > 1) {
            proparr = args.slice()
        } else {
            proparr = args[0].split(/\s+/)
        }

    }

    var klassprops = {}
    if ($.isArray(proparr)) {
        props = proparr.reduce(function (m, k) {
            if (typeof(k) == "string") {
                m[k] = null;
            }
            else if ($.isPlain(k)) {
                if (k.name) {
                    m[k.name] = k;
                }
                else if (Object.keys(k).length == 1) {
                    var k1 = Object.keys(k)[0];
                    m[k1] = k[k1];
                }
            }
            return m
        }, {});
    } else if ($.isPlain(proparr)) {
        props = proparr
    }
    klassprops=props;
    if ($.isPlain(addtnl)) {
       // $.extend(klassprops, addtnl)
    }
    var statics=klassprops.statics
    delete klassprops.statics
    //klassprops.properties = props

    if (addtnl && addtnl.init) {
        addtnl.afterInitialize = addtnl.init
        delete addtnl.init
    }
    var baseModel=null
    if(klassprops.baseModel && klassprops.baseModel.newInstance){
        baseModel=klassprops.baseModel
        delete klassprops.baseModel;
        nu =  new baseModel(id,klassprops)

    } else{
        nu =  $.model.newInstance(id,klassprops)
    }
    //klassprops.init = "super";
     if($.isPlain(addtnl)){
        $.extend(nu,addtnl)
    }

    var nuctor =  nu.asCtor(!!baseModel)
    if (boundscope) {
        nu.boundscope = boundscope
    }
    /* nu.properties.onchange("boundRecord",function(){
     nu.bindRecord();
     },true)*/
    return nuctor
};

$.model.Collection = Klass("$.model.Collection", (function () {
        var proto = {
            items: null, itemKlass: null, name: null, nameProp: "", nameMap: null,
            init: function () {
                this.setup()
            },
            setup: function () {
                this.nameMap={}
                if (this.itemKlass) {
                    this.items = List.create(this.items || []).chainable(this.itemKlass)
                } else {
                    this.items = List.create(this.items || []);
                }
                if (this.itemAlias) {
                    var al = String(this.itemAlias);
                    al = al.charAt(0).toUpperCase() + al.substr(1)
                    this["update" + al + "s"] = this.updateItems
                    this["find" + al] = this.find
                }
            },
            getNames: function () {
                return this.items.collect(this.nameProp || "name")
            },
            updateItems: function (map) {
                $.each(map, function (v, k) {
                    var f
                    if (f = this.find(k)) {
                        f.updateProperties(v);
                    }
                }, this)
            },
            findAll: function (k) {
                return this.items.findAll(k)
            },

            find: function (k, extndd) {
                if (typeof(k) == "string") {
                    var r = this.nameMap[this.normalizeName(k)]
                    if (!r && extndd && !/id$/.test(k)) {
                        r = this.nameMap[this.normalizeName(k + "_id")]
                    }
                    if (r) {
                        return r;
                    }
                }
                var col = (typeof(k) == "number" && !isNaN(k)) ? this.items.findById(k) : this.items.find(k)
                if (!col) {

                    console.log(  k)
                }
                return col
            },
            prep: function (v) {
                return v
            },
            at:function(i){
                if(typeof(i)=="number" && !isNaN(i)){
                    return this.items[i]
                }
            },
            size: function () {return this.items.length},
            add: function () {
                if (arguments.length == 1 && Array.isArray(arguments[0])) {
                    for (var i = 0, l = arguments[0], ln = l.length; i < ln; i++) {
                        this.add(l[i])
                    }
                    return this
                }
                var v = this.prep.apply(this, arguments)
                if (v) {
                    var v1 = v;
                    var kls = this.itemKlass;
                    if (kls && !(v instanceof kls)) {
                        v1 = kls.newInstance?kls.newInstance(v):new kls(v)
                    }
                    this.items.add(v1)
                    if (this.nameProp){
                        if(typeof(this.nameProp)=="function"){
                            nameProp=this.nameProp(v1,this)
                        } else{
                            nameProp=this.nameProp
                        }

                        if ( nameProp&&v1[ nameProp]) {
                            this.nameMap[this.normalizeName(v1[ nameProp])] = v1
                        }
                    }
                }
                return this
            },
            remove: function (i) {
                var v = this.find(i)
                if (v) {
                    this.items.remove(v)
                }
                return this
            },
            eachItem: function (fn, ctx) {
                this.items.each(fn, ctx || this);
                return this

            },
            collect: function (fn, ctx) {
                return this.items.collect(fn, ctx || this)
            },
            normalizeName: function (k) {
                return k
            }
        }

        return proto;
    })()
);