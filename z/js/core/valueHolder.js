/**
 * Created by Atul on 5/20/2015.
 */

$.valueHolder = $.modRecord = (function (name, addtnlprops) {
    var base = null, baseEx = null, UNDEF = undefined, RESET = [], extended = null;
    function defreader(val) {return val}
    function _init(nm, addtnl, enhanced) {
        var proto = null;
        if (base === null) {
            base = {oldValue: null, raw: null, valueLabel: null, memo: null, isnill:null,mods:null,
                set: function (v) {this.value=v},
                get: function (v) {return this.value},
                clone: function (v) {
                    var nu = Object.create(this)
                    return nu.reset()
                },

                formatter: function (v) {
                    return this._config.formatter(v)
                },
                reset: function (nu) {
                    this.oldValue = null;
                    this.valueLabel = null;
                    this.value = nu==null?RESET:nu;
                    return this;
                },
                toMap: function () {var v=this.__
                    return {value: v, valueLabel: this.valueLabel || v, newValue: v, oldValue: this.oldValue, name: this._config.name, origValue: null }
                },
                off: function (fn) {
                    return this.on(false, fn)
                },
                format: function (arg) {
                    return  this._config.formatter(this.__)
                },
                read:function(v,r){
                    if (typeof(v) == "function" || v == null) {
                        return v
                    }
                    r = r||this._config.reader;
                    if(r){
                        return r(v,this.oldValue,this)
                    }
                    var t = this._config.typeInfo;
                    if (t   && t.coerce) {
                        return t.coerce(v);
                    }

                    return  v
                },
                dispatch: function () {
                    if (this.__ === RESET){  return }
                    var C=this.__callbacks;
                    if(C){var v=this.__,c=this._config
                        var m={value: v, valueLabel: this.valueLabel || v, newValue: v, oldValue: this.oldValue, name: c.name };
                        if(typeof(C)=="function") {
                            C(m)
                        }else {
                            var fire=(C.trigger||C.dispatch||C.fire);
                            if(fire){
                                fire.call(C,m)
                            }
                            else if(Array.isArray(C)){
                                for (var i = 0, ln = C.length, it; it = C[i], i < ln; i++) {
                                    it && it.call(this, m , this)
                                }
                            }
                        }
                    }
                },
                on: function (fn,sticky) {
                    var C=this.__callbacks||(this.__callbacks=[]),nm=this._config.name;
                    if(typeof(C.on)=="function"){  C.on(nm,fn) }
                    else if(Array.isArray(C)){
                        if(C.indexOf(fn)==-1){   C.push(fn)  }
                    }  else if(typeof(C.add)=="function"){
                        C.add(nm,fn)
                    }
                    if (!this.isnill){this.dispatch();}
                    return this
                },
                extend: function () {
                    $.defineProperties(this, extended);
                    return this;
                }

            }

            //$.defineValue(base,"name",null,false,false,false)
            $.defineProperty(base, "newValue", {get: function () {
                return this.__
            }, set: function (v) {  }   })
            $.defineProperty(base, "record", {set: function (rec) {
                if (!(rec && typeof(rec) == "object")) {
                    return
                }
                var label, v
                if ($.isArray(rec)) {
                    label = rec[1];
                    v = rec[0]
                }
                else {
                    label = rec.label;
                    v = rec.value || rec.id
                }
                //if(label){this.valueLabel=label}
                if (v != null) {
                    this.value = {val: v, __withlabel: label || ""};
                }

            }, get: function () {
                return this.toMap()
            }})
            $.defineProperty(base, "reader", {get: function () {
                return this._config.reader||defreader
            },set:function(v){
                if(v===null||typeof(v)=="function"){this._config.reader=v}
            }
            });
            $.defineProperty(base, "typeInfo", {
                get: function () {
                    return this._config.typeInfo||$.typeInfo?$.typeInfo.defaultType:null
                },
                set: function (v) {
                    if (v != null) {
                        this._config.typeInfo = $.typeInfo.get(v)
                    }
                }, configurable: true
            }),
                $.defineProperty(base, "value", {set: function (v0) {
                        var nu = this, v, curr, undef = UNDEF, label
                        if (v0 && typeof(v0) == "object" && v0.__withlabel != null) {
                            v = v0.val;
                            label = v0.__withlabel
                        } else {
                            v = v0
                        }
                        if (nu.__edit === v) {
                            return
                        }
                        nu.__edit = v
                        if (v === RESET) {
                            v = v.shift()
                            nu.__ = nu.oldValue = null;
                            this.mods = 0;
                            nu.origValue = v
                            if (v == null) {
                                return
                            }
                        }

                        curr = nu.__
                        var val;
                        nu.raw = v;
                        val = v==null?v:nu.reader(v, curr, nu);
                        if((curr==null && val!=null) || (curr!=null && val==null) ){

                        } else {
                            if (val === undef || (nu.equals ? nu.equals(curr, val) : (curr == val ||
                                ((typeof(val) == "string" || typeof(curr) == "string") && String(val) == String(curr))))) {
                                if (val && typeof(val) == "object") {
                                    var vr = $.getVersion(val)
                                    if (vr && this.__lastversion !== vr) {
                                        this.__lastversion = vr
                                    } else {
                                        return
                                    }
                                } else {
                                    return
                                }

                            }
                        }
                        //nu.valueLabel=null
                        nu.oldValue = curr;
                        nu.__ = val;
                        if(this.isnill && val!=null&&val!==RESET){

                            this.isnill=false;
                            this.typeInfo;
                        }
                        this.mods++
                        if (nu.origValue === RESET && (val != null || this.mods > 1)) {
                            nu.origValue = val
                        }
                        nu.valueLabel = label;
                        this.dispatch()
                    }, get: function () {
                        return this.__
                    }

                    }
                );
            /*$.defineProperty(base,"typeInfo",
             {
             get:  function( ){ return this.__t||(this.__t=$.typeInfo.getInfoFromValue(this.raw))},
             set:  function(v){if(v!=null){
             this.__t=$.typeInfo.get(v)
             }
             }
             })*/
            extended = {
                //onpropertychange:{value:function(){return this.on(arguments[arguments.length-1])}},
                //onchange:{value:function(){return this.on(arguments[arguments.length-1])}},
                delta: {value: function (fromprev) {
                    return this.__ - ((fromprev || this.origValue === RESET) ? this.oldValue : this.origValue)
                }, configurable: true, writable: true
                },
                isEmpty: {value: function () {
                    return $.empty(this.__)
                }},
                isDirty: {value: function () {
                    return this.origValue !== this.__ && this.origValue !== RESET
                }, configurable: true, writable: true
                },
                equals: {value: function (v) {
                    return !this.compareTo(v)
                }, configurable: true, writable: true },

                val: {value: function (doformat) {
                    return doformat ? this._config.format() : this.__
                } },
                toJSON: {value: function () {
                    return JSON.stringify(this.__)
                } },
                reader: {value: function (v) {
                    if (typeof(v) == "function" || v == null) {
                        return v
                    }
                    var t = this._config.typeInfo;
                    if (!t || (t && (t.nill || t.any || (t.primitive && typeof(v) == "object"))) ) {
                        t = this._config.typeInfo = $.typeInfo.getInfoFromValue(v)
                    }

                    return  t &&t.coerce? t.coerce(v) : v
                },
                    configurable: true, writable: true },
                toString: {value: function () {
                    return  String(this.__)
                }  },
                compareTo: {value: function (v0) {
                    var v1 = this.raw, v = v0 != null && v0.valueOf ? v0.valueOf() : v0;
                    if (!isNaN(+v1) && !isNaN(+v0)) {
                        v1 = +v1;
                        v0 = +v0
                    }
                    return  v1 === v ? 0 : v1 > v ? 1 : -1
                }, configurable: true, writable: true
                },
                valueOf: {value: function () {
                    return  this.raw
                }, configurable: true, writable: true},
                data:  {value: function(){
                    delete this.data;
                    return $.expando.augment(this).call(this,arguments)
                }, writable: false , enumerable: true, configurable: true
                }
            }
        }
        if (enhanced && !baseEx) {
            baseEx = Object.create(base, extended);
        }
        proto = enhanced ? baseEx : base

        var map = Object.create(proto, {name: {value: nm, writable: false, configurable: false, enumerable: true},
            _modelinstance: {value: true, writable: false, configurable: false, enumerable: true},
            _config:{value: {
                name:nm,  typeInfo:$.typeInfo?$.typeInfo.defaultType:null,
                __lastversion:null,mods:0  ,
                formatter:function(x){return x},
                reader:null
            }, writable: false, configurable: false, enumerable: false},
        }) , v = null

        map.origValue = null
        if (addtnl != null && typeof(addtnl) == "object") {
            if (addtnl.value != UNDEF) {
                v = addtnl.value;
                delete addtnl.value
            }
            if (addtnl.type != UNDEF) {
                map._config.typeInfo = $.typeInfo.get(addtnl.type);
                delete addtnl.type
            }
            if (enhanced) {
                map.memo = {}
            }
            $.extend(map, addtnl)
        }
        else if (addtnl != null) {
            v = addtnl;
            addtnl = null
        }
        map.isnill=true
        map.reset(v);
        return map
    };
    return function (name, addtnlprops) {
        var enhanced = 0,callback
        if (typeof(addtnlprops) == "boolean") {
            enhanced = addtnlprops;
            if (arguments[2] && typeof(arguments[2]) == "object") {
                addtnlprops = arguments[2]
            } else{addtnlprops={}}
        }
        else if (addtnlprops && (addtnlprops.type||addtnlprops.enhanced)) {
            enhanced = 1;
        }
        var props={}
        if($.isPlain(addtnlprops)){$.extend(props,addtnlprops)}
        delete props.enhanced
        var callback= props.callbacks
        if( callback ){delete props.callbacks}
        var c
        if(typeof (props.comparator)=="function"){
            c=props.comparator
            delete props.comparator
        }
        var nu=_init(name, props, enhanced);
        if(c) {
            nu.compareTo = c
            if (!nu.equals) {
                nu.equals = function (curr,val) {
                    return !this.compareTo( curr,val)
                }

            }
        }
        nu.mods=0;
        nu.__callbacks=callback
        if(!nu.typeInfo && $.typeInfo){
            nu.typeInfo=props.type?$.typeInfo.get(props.type):$.typeInfo.defaultType
        }
        return  nu
    };
})();
$.modRecord.RESET = {};
