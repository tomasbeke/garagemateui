
(function(context) {
    function TypeInfo(a, b, c, d) {
        if (!(this instanceof TypeInfo)) return TypeInfo.get(arguments[0]);
        if ("function" != typeof a && (a = Object), this.ctor = a.name || a.toString().replace(/function\s*([^\(]*)\(.*/, "$1").trim(), this.ctorfn = a, this.type = "", d = d || {}, this.type = this.id = this.ctor.toLowerCase(), this.defaultValue = b, "function" == typeof c && (this.coerce = c), d)
            for (var e, f = 0, g = Object.keys(d), h = g.length; e = g[f], h > f; f++) "function" == typeof d[e] && (this[e] = d[e])
    }

    function _extendType(a, b) {
        var c = {};
        return Object.keys(b).forEach(function(a) {
            c[a] = {
                value: b[a],
                enumerable: !0
            }
        }), Object.create(a, c)
    }
    var OProto = Object.prototype,
        ArrProto = Array.prototype,
        TRUE = function() {
            return !0
        }, FALSE = function() {
            return !1
        }, ARRAYLIKES = [],
        $defineProperty = function(a, b, c) {
            return "undefined" != typeof $ && $.defineProperty ? $.defineProperty(a, b, c) : Object.defineProperty(a, b, c)
        } ;


      TypeInfo.prototype = {
        prep: function(a) {
            return a
        },

        validate: function(a) {
            return null != a
        },
        format: function(a) {
            return "object" == typeof a ? a : String(a)
        },
        coerce: function(a) {
            return a
        },
        createInstance: function(a) {
            var b, c = this.ctorfn,
                d = [].slice.call(arguments),
                e = d.length;
            return c && (b = e ? 1 == e ? new c(d[0]) : 2 == e ? new c(d[0], d[1]) : 3 == e ? new c(d[0], d[1], d[2]) : new c(a) : new c), b
        },
        random: function() {
            if (Util.random.setup(), "function" == typeof Util.random[this.type]) {
                var a = Util.random[this.type];
                return proto = Object.getPrototypeOf(this), delete proto.random, delete this.random, proto.random = a, a.apply(null, arguments)
            }
            return null
        },
        isType: function(a) {
            return TypeInfo.getInfoFromValue(a).id === this.id
        },
        isPrimitive: function() {
            return~ ["string", "number", "boolean"].indexOf(this.type)
        },
        compareTo: function(a, b) {
            var c = this.coerce(a),
                d = this.coerce(b);
            return c  == d ? 0 : c > d ? 1 : -1
        },
        equals: function(a, b) {
            return !this.compareTo(a, b)
        },
        minus: function(a, b) {
            return this.coerce(a) - this.coerce(b)
        },
        plus: function(a, b) {
            return this.coerce(a) + this.coerce(b)
        },
        size: function() {
            return 0
        },
        augment: function(a) {
            return this.coerce(a)
        },
        isInfo: !0
    }
    TypeInfo.isPlain = function(a) {
        return null == a ? !1 : Object.getPrototypeOf(Object(a)) === OProto
    }
    TypeInfo.newInstance = function() {
        var a = [].slice.call(arguments, 1),
            b = function() {}, c = this.ctorfn.prototype;
        b.prototype = c;
        var d = new b,
            a = [].slice.call(arguments, 1);
        return a.unshift(a[0]), c.constructor.apply(d, a)
    }
    TypeInfo.isEmpty = function(a) {
        return null == a ? !0 : !a || (a.isEmpty ? a.isEmpty() : a && "object" == typeof a && ("length" in a && 0 === a.length || a.size && 0 === a.size() || 0 === Object.keys(Object(a)).length))
    }
    TypeInfo.isPrimitive = function(a) {
        return !(Object(a) === a)
    }
    TypeInfo.replaceDash = null

    TypeInfo.asDate = function(a) {
        return TypeInfo.isDate(a)
    }
    TypeInfo.__mindate = +new Date(1900, 1, 1)
    TypeInfo.isDate = function(a) {
        return a?$.date.from(a):null
    }
    TypeInfo.asDouble = function(a, b) {
        return b && 3 == arguments.length && arguments[2] && $.isArray(arguments[2]) && (b = 0), TypeInfo.isNumber(a) ? parseFloat(a) : b || 0
    }
    TypeInfo.asNumber = function(a, b) {
        return b && 3 == arguments.length && arguments[2] && $.isArray(arguments[2]) && (b = 0), TypeInfo.isNumber(a) ? Number(a) : b || 0
    }
    TypeInfo.asInt = function(a) {
        return~~ a
    }
    TypeInfo.isNumber = function(a, b, c) {
        return "number" == typeof a ? !0 : c ? !1 : b && "string" != typeof a ? !1 : "0" == a || ~~a || a && a.valueOf && ~~a.valueOf() ? !0 : !1
    }
    TypeInfo.arrayLike = function(a) {
        return $.isArray(a) || a && "object" == typeof a && isFinite(a.length) && a.length >= 0 && a.length === Math.floor(a.length) && a.length < 4294967296
    }
    TypeInfo.asType = function(a, b, c) {
        if (c && null == a) return null;
        var d = TypeInfo.getInfo(b);
        return d.coerce ? d.coerce(a, c) : null
    }

    var _datetype = [Date, null,
        function(a) {
            return $.date.asDate(a)
        }, {
            format: function(a, b) {
                return $.date.format(a, b=="double"||b=="number"?"":b )
            },
            compareTo: function(a, b) {
                var c = +this.coerce(a) - +this.coerce(b);
                return c ? c > 0 ? 1 : -1 : 0
            }

        }
    ];
    TypeInfo.nill = function() {
        return null
    }
    TypeInfo.typeAbbr = {
        num: "number",
        str: "string",
        bool: "boolean"
    }
    TypeInfo.getMap = function() {
        var _get = function(a, b, c, d) {
                var e = new TypeInfo(a, b, c, d);
                return e.primitive = ["number", "float", "string", "boolean", "numeric"].indexOf(e.type) >= 0, e[e.type] = !0, e
            }, datepartMap = null,
            _typeMap = {
                number: _get(Number, 0, function(a) {
	                if("number" == typeof a){return a}
	                return ("string" == typeof a && !isNaN(a)) ? Number(a):this.defaultValue
                }, {
                    _defaultFormat: "###,###.##",
                    format: function(a, b) {
                        var c = this.coerce(a);
                        return b = b || "###,###.##", b && "#" != b ? $.numberFormat(c, b) : String(c)
                    },
                    compareTo: function(a, b) {
                        var c = this.coerce(a) - this.coerce(b);
                        return c ? c > 0 ? 1 : -1 : 0
                    }
                }),
                "float": _get(1.1.constructor, 0, function(a) {
	                if("number" == typeof a){return a}
                    return ("string" == typeof a && !isNaN(a)) ? Number(a):this.defaultValue
                }, {
                    format: function(a, b) {
                        return b = b || this._defaultFormat || "###,###.00", $.numberFormat(a, b)
                    },
                     compareTo: function(a, b) {
                        var c = this.coerce(a) - this.coerce(b);
                        return c ? c > 0 ? 1 : -1 : 0
                    }
                }),

                date: _get.apply(null, _datetype),
                time: _get(Date, null, function(a) {
                    return $.date.asTime(a)
                }, {
                    format: function(a, b) {
                        var c = TypeInfo.TIME.coerce(a);
                        return c ? c.format(b || "hh:nn tt") : ""
                    }
                }),
                string: _get(String, "", function(a) {
                    return String(a)
                }, {
                    plus: function(a, b) {
                        return this.coerce(a).concat(String(b))
                    },
                    minus: function(a, b) {
                        return this.coerce(a).replace(String(b), "")
                    }
                }),
                array: _get(Array, null, function(a) {
                    return $.makeArray(a)
                }),
                "boolean": _get(Boolean, null, function(a) {
                    return !(null == a || 0 == +a || /false|no|0/i.test(String(a)))
                }, {
                    compareTo: function(a) {
                        var b = +this.coerce(a) === +a.value;
                        return b ? b > 0 ? 1 : -1 : 0
                    }
                }),
                regexp: _get(RegExp, null, function(a, b) {
                    return a instanceof RegExp ? a : "string" == typeof a ? new RegExp(String(a), b || "") : null
                }),
                plain: _get(Object, null, function(a) {
                    return a
                }),
                object: _get(Object, null, function(a) {
                    return a
                }),
                nill: _get(TypeInfo.nill, null, TypeInfo.nill, {
                    compareTo: function() {
                        return -1
                    },
                    minus: function(a, b) {
                        return a || b
                    },
                    plus: function(a, b) {
                        return a || b
                    }
                }),
                element: _get(function(a) {
                    return ($d(a) || {}).el
                }, $d)
            };


        _typeMap["float"].isFloat = function() {
            return !0
        }
        _typeMap["float"]["float"] = _typeMap["float"].numeric = !0
        _typeMap.numeric = _typeMap["float"]
        _typeMap.money = _typeMap["float"]
        _typeMap.double = _typeMap["float"]
        _typeMap.timestamp = _typeMap.datetime = _get.apply(null, _datetype)
        _typeMap.timestamp.coerce = function(a) {
            return $.date.from(a)
        }
        _typeMap.timestamp._defaultFormat = "datetime"
        _typeMap.timestamp.format = function(a, b) {
            var c = this.coerce(a);
            return c ? c.format(b || "hh:nn tt") : ""
        }
        _typeMap.time.format = function(a, b) {
            var c = this.coerce(a);
            return c ? c.format(b || "hh:nn tt") : ""
        }
        _typeMap.email = _get(function(a) {
            return String(a)
        }, "", function(a) {
            return String(a)
        }, {
            validate: function(a) {
                return this.Re.test(String(a))
            }
        })
        _typeMap.email.Re = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/, _typeMap.telephone = _get(function(a) {
            return String(a)
        }, "", function(a) {
            return String(a)
        }, {
            validate: function(a) {
                return this.Re.test(String(a))
            }
        })
        _typeMap.telephone.Re = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/;
        var toeval = [];
        _typeMap.promise = _get(Promise, null, function(a) {
            return null == a ? a : Promise.cast(a)
        })
            _typeMap.currency = _extendType(_typeMap.money, {
            _defaultFormat: "$ ###,###.00"
        })
        TypeInfo.typeMap = _typeMap, Object.keys(_typeMap).forEach(function(a) {
            "string" == typeof a && 0 != String(a).indexOf("_") && (TypeInfo[a.toUpperCase()] = _typeMap[a])
        })
        Object.keys(_typeMap).forEach(function(a) {
            var b = a.charAt(0).toUpperCase() + a.substr(1);
            TypeInfo.prototype["is" + b] || toeval.push("TypeInfo.prototype.is" + b + "=(function is" + b + "(){var nm='" + a + "';return this.type?(this.type==nm || this.type.name==nm || this.id==nm):false})")
            TypeInfo.prototype["as" + b] || toeval.push("TypeInfo.prototype.as" + b + "=(function as" + b + "(v,nodefifnull){return TypeInfo.asType(v,this.type,nodefifnull)})")
	        TypeInfo["is" + b] || toeval.push("TypeInfo.is" + b + "=(function is" + b + "(v){return (v==null)?false: v.constructor&&v.constructor.name==='" + b + "'; })")
            TypeInfo["as" + b] || toeval.push("TypeInfo.as" + b + "=(function as" + b + "(v){return TypeInfo.asType(v,'" + a + "')})")
         });
        eval(toeval.join(";\n"))
	    _typeMap.plain.plain = !0
	    _typeMap.plain.object = !0
	    _typeMap.plain.primitive = !1;
        var any = new TypeInfo(Object, null, function(a) {
            return a
        });
        return any.any = !0, any.isDefault = !0, Object.freeze(any), TypeInfo.defaultType = _typeMap.any = any, (TypeInfo.getMap = function() {
            return _typeMap
        })()
    }
    TypeInfo.fromType = function(a) {
        return "string" == typeof a ? TypeInfo.getMap()[TypeInfo.typeAbbr[a] || a] : TypeInfo.inspect(a)
    }
    TypeInfo.inspect = TypeInfo.of = TypeInfo.get = TypeInfo.getInfo = function(a, b, c) {
        if (a && a.nodeType) return TypeInfo.getMap().element;
        var d, e = a,
            f = TypeInfo.getMap();
        if (null == a && null != b && ("string" == typeof b || "function" == typeof b) && (a = b, b = null), null == a) return TypeInfo.getMap().string;
        if (a && "object" == typeof a && a instanceof TypeInfo) return a;
        if ("string" != typeof a)
            if ("function" == typeof a) e = a;
            else if (TypeInfo.isPlain(a)) {
                if (f.plain) return f.plain
            } else a.constructor && (e = a.constructor);
        else {
            if (d = a.toLowerCase(), f && d in f) return f[d];
            if (e = window[a] || window[a.charAt(0).toUpperCase() + a.substr(1)], !e && /html|element|document/i.test(a) && (e = Node), e) {
                var g;
                if (ZModule.get(a, function(a) {
                        g = a
                    }), g)
                    if ("function" == typeof g) {
                        var h = new TypeInfo(g, null);
                        h.klassCtor = g.isKlass, h.fn = !0, h.ctor = g, TypeInfo.getMap()[a] = h, h.isType = function(a) {
                            var b = this.ctor;
                            return a && "object" == typeof a && a instanceof b
                        }
                    } else {
                        var h = new TypeInfo(g.constructor, null);
                        h.module = g, h.fn = !0, h.ctor = g, TypeInfo.getMap()[a] = h, h.isType = function(a) {
                            var b = this.ctor;
                            return a && "object" == typeof a && a instanceof b
                        }
                    }
            } else if (isNaN(a) ? TypeInfo.isDate(a) && (a = "date") : a = "number", f && d in f) return f[d]
        } if ("function" != typeof e && (e = a.constructor), !e) return TypeInfo.defaultType;
        var i = e.name || e.toString().replace(/function\s*([^\(]*)\(.*/, "$1").trim();
        return d = i.toLowerCase(), !f[d] && c && (f[d] = new TypeInfo(e, b, c)), f[d] || TypeInfo.defaultType
    }

    TypeInfo.getInfoFromValue = function(a) {
        if (null == a || a.nill) return TypeInfo.getMap().nill;
        var b, c = typeof a;
        return "string" == c ? isNaN(a) ? TypeInfo.isDate(a) && (c = "date") : c = "number" : "object" == c && (c = a instanceof Date ? "date" : a.constructor && a.constructor.name ? a.constructor.name : {}.toString.call(a).substr(8).slice(0, -1).trim()), b || TypeInfo.getInfo(a)
    };


    var Active = context,
        entCache = {},_allEntities=null,_allEntitiesPr=null,entCachePromises={};
    Active.defineLocalEntity=function(name,cols,optns,promise){
        var m=entCache[name]||new Active.Meta(name,cols,optns?optns.dataoptions:{});
        if(!entCachePromises[name]){
            entCachePromises[name]=Promise.resolve(entCache[name]=m)
        }

        if(typeof(optns)=="function"){optns={callback:optns}}
        if(optns && optns.callback){
            entCachePromises[name].then(optns.callback)
        }
        return m
    }
    Active._processMeta=function(data){

        Object.keys(data.entities).forEach(
            function (k) {
                entCache[k] = {rawmap: data.entities[k],meta:null}
            }
        );
        Object.keys(entCachePromises).forEach(
            function (name) {
                var nu=Active.getEntity(name)
                nu && entCachePromises[name].resolve(nu)


            }
        );
        if (data.metaversion && typeof(localStorage) != "undefined") {
            localStorage.setItem("app__meta", JSON.stringify(data))
        }
        _allEntities = data;
        _allEntitiesPr.resolve(_allEntities);
    }
    Active.loadEntityMeta=function(callback){
        if(!_allEntitiesPr) {
            _allEntitiesPr = Promise.deferred()
        }
        if(typeof(callback)=="function"){
            _allEntitiesPr.then(callback)
        }
        if(_allEntities){
            return
        }

        var saveddata=null
        if(self.__appinit && self.__appinit.metaversion &&  typeof(localStorage)!="undefined" ){
            var  saved=localStorage.getItem("app__meta")
            if(saved){
                var saveddata=JSON.parse(saved)
                if(saveddata && saveddata.metaversion === self.__appinit.metaversion){
                    Active._processMeta(saveddata)
                } else {saveddata=null}
            }
        }
        if(!saveddata){
            app.remoteDirective("allmeta", {}).then(function (a) {
                try {
                    var data = typeof(a) == "string" ? eval(a) : a
                    if (data && Object.keys(data).length) {

                        if (!data.entities) {
                            alert("No entity meta found")
                            return
                        }
                        Active._processMeta(data)
                    }
                } catch (i) {
                    _allEntitiesPr.reject({error: i.toLocaleString(), url: url})
                }
            });
        }
    }
    Active.getEntity=function(name,nocache){
        if(!_allEntitiesPr) {
            Active.loadEntityMeta()
        }
        if (entCache[name] && entCache[name].rawmap) {
            if(nocache===true && entCache[name].meta){
                return entCache[name].meta
            }
            var nu=new Active.Meta(name, entCache[name].rawmap, entCache[name].dataoptions || {});
            if(nocache!==true){
                entCache[name].meta=nu
            }
            return nu
        }
    }
    Active.defineEntity=function(name,cols,optns0 ){
        var optns=optns0||{}
         if(typeof(cols)=="function"&&optns0==null){optns=cols;cols=null}
        if(typeof(optns)=="function"){optns={callback:optns}}

        var processing=entCachePromises[name]
        if(!processing){
            entCachePromises[name]=Promise.deferred()
        }
        if(!_allEntitiesPr) {
            Active.loadEntityMeta();
        }
        var nu=Active.getEntity(name)
         if (nu) {
            entCachePromises[name].resolve(nu)
        }
        if(typeof(optns.callback)=="function") {
            if(nu){
                optns.callback(nu)
            } else {
                entCachePromises[name].then(optns.callback)
            }
        }
        return entCachePromises[name];
       /*




                var servicePath = optns && optns.servicePath ? optns.servicePath : (self.app || {}).servicePath;
                var url = servicePath + "?cmd=allmeta";
                $.xhr.jsonp(url, {}, function (b) {
                    try {
                        var data
                        if (b) {
                            if (typeof(b) == "string") {
                                data = eval(b)
                            } else {
                                data = b;
                            }
                            if (data && Object.keys(data).length) {
                                _allEntities = data;
                                _allEntitiesPr.resolve(_allEntities);
                            }
                        }
                    } catch (i) {
                        e({
                            error: i.toLocaleString(),
                            url: url
                        })
                    }
                })
            }
            _allEntitiesPr.then(function(name,cols,optns0,all){
                Active.defineEntity(name,cols,optns0,p);
            }.bind(this,name,cols,optns0))
            return p
        }

        if(optns.callback){
            entCachePromises[name].then(optns.callback)
        }


             if(cols&&(Array.isArray(cols)|| $.isPlain(cols))) {
                 Active.defineLocalEntity(name,cols,optns)
                 processing=true;
            }
        if(!processing) {

            var servicePath = (optns && optns.servicePath) ? optns.servicePath : (self.app || {}).servicePath
            if (servicePath) {
                var url = servicePath + "?entity=" + name + "&info=1"
                $.xhr.jsonp(url, {}, function (name,d) {
                    try {
                        var m
                        var p = entCachePromises[name]
                        var r = (d && typeof(d) == "string") ? JSON.parse(d) : d;
                        if (r && typeof(r) == "object") {
                            if (r.error) {
                                p.reject(r.error)
                            }
                            else {
                                m = new Active.Meta(name, r, optns ? optns.dataoptions : {});
                                entCache[name] = m

                                p.resolve(m)
                            }
                        }

                        else {
                            p.reject(r)
                        }
                    } catch (e) {
                        p.reject({error: e.toLocaleString(), url: url})
                    }
                    ;
                }.bind(this,name));
            }
        }
         return   entCachePromises[name];
        */
    }
	//all names are lowercase
    Active.Record = $.baseModel.extend({
        init:function(data){
            this.setupRecord()
        } ,
        setupRecord:function(){
            this.__record__= Object.create(null);
            if(!this.__config){
                var config={keys:[],aliases:{} ,entitymeta:null}
                Object.defineProperty(this, "__config", {value:config,writable:false,configurable:true,enumerable:false})
            }
            if(!this.__config.descriptors){
                Object.defineProperty(config, "descriptors", {value:Object.create(null),writable:false,configurable:true,enumerable:false})
            }
        },
        getSaved:function(k){
            var nm
            if(!this.__config || !this.__record__||!(nm= this.__config.aliases[k])){return}
            return this.__record__[nm]
        },
        _get:function(k){
            var C=this.__config,nm,res
            if(k=="rownum"||k=="idx"){return this.index||0}
            if(!C || !this.__record__||!(nm= C.aliases[k])){return}
            var M=C.descriptors[nm]
            if(M && M.fn ){
                var fn=M.fn;
                res= this.__record__[nm]=fn(this)
            } else{res= this.__record__[nm]}
            if(res==null){return ""}
            return res
        },
        getDisplayValue:function(nm){
            var res=this._get(nm)
            if(!res){return ""}
            var M=this.__config.descriptors[nm]
            if(M && M.col){
                 var v= M.col.getDisplayValue?M.col.getDisplayValue(res):res
                if(v!=nm){res=v}
            }
            return res;
        },
        get:function(k,raw ){
            var C=this.__config,nm,res
            if(k=="rownum"||k=="idx"){return this.index||0}
            if(!C || !this.__record__||!(nm= C.aliases[k])){return}
            var M=C.descriptors[nm]
            if(M && M.fn ){
                var fn=M.fn;
                res= this.__record__[nm]=fn(this)
            } else{res= this.__record__[nm]}
            var mode=this.__templateMode
            if( mode && (raw!==true)){//
                var col= M.col
                 if(col){
                    res=col.getDisplayValue?col.getDisplayValue(res):res
                     var rndr=(typeof(mode.renderer)=="string" && typeof(col[mode.renderer])=="function")?col[mode.renderer]:col.cellRenderer;
                    res=rndr?rndr.call(col, res==null?" ": res , res):res;
                }
                if(" NaN undefined null [object Object] 0 ".indexOf(String(" " + res + " ")) >= 0){res=""}
            }
            return res
        },
        keys:function(){
	        return this.__config?this.__config.keys.slice():[]
        },
        _set:function(nm,v,curr,M,noev){
            if(!nm){return curr}
            var tosave=M&&M.reader?M.reader(v):v
            if(curr===tosave){
                return curr
            }
            this.__record__[nm]=tosave
            this.__mod||(this.__mod=[]);
            this.__mod.indexOf(nm)==-1 && this.__mod.push(nm)
            !(noev===true) &&  this.firePropertyChangeEv( {name:nm,value:tosave,newValue:tosave,oldValue:curr,object:this,type:"update"})
            return tosave
        },
        getConfig:function(){return this.__config||(this.__config={});},
        set:function(k,v,recalc,noev){
            var C=this.__config
            if(!this.__record__ || !C || !C.aliases[k]){return }
            var nm=C.aliases[k],M= C.descriptors,curr=this.__record__[nm] ;
            if(recalc!==true && this._set(nm,v,curr,M[nm]||{},noev )===curr){
                return
            }
            if(C.depends && C.depends[nm]){
                for(var i=0,l=C.depends[nm],ln=l.length,nm1;nm1=l[i],i<ln;i++) {
                    if(nm1  && M[nm1] && nm1 !==nm && M[nm1].isExpr){
                        M[nm1].calc(this )
                     }
                }
            }
            return curr
        },
        addProperty:function(nm,descript,meta){
            if(!descript ||!this.__config ){return}
            var D=this.makeDescriptor(nm,descript)
            if(!(D && D.descriptor)){return}
            var valdescriptor=D.descriptor
            var a=meta||valdescriptor.meta||(this.__config.entitymeta?this.__config.entitymeta.findField(nm):null)||{name:nm}
            var config=this.__config,holder=this
            delete valdescriptor.meta
            var getter=valdescriptor.getter||"return this.__record__ && this.get('!')",
	            setter=valdescriptor.setter||"return this.__record__ && this.set('!',v)"
            var nm= String(a.name||"").toLowerCase(),
                descriptor={
	                get:Function(getter.replace('!',nm)),
	                set:Function("v",setter.replace('!',nm)),
	                enumerable:true,configurable:false
                }
            config.keys.indexOf(a.name)==-1 && config.keys.push(a.name)
            config.aliases[nm]=config.aliases[a.name]=nm
            var T= a.typeInfo||{}
            var rdr=null
            if(!T.primitive || !T.date){
                rdr=T.date? $.date: T.coerce
            }
            config.descriptors[nm]= $.extend(valdescriptor,{col:a,defaultValue: a.defaultValue,
                typeInfo:T,reader:rdr ,cache:{"NULL":a.defaultValue},isprimitive: T.primitive,isdate:T.date});
            if(nm || !(nm in holder)) {
                Object.defineProperty(holder, nm, descriptor)
            }
            if(nm.indexOf("_")>0){//normalized
                var nm1= nm.replace(/\_/g,"")
                if(!nm1 || nm1 in holder){return}
                config.aliases[nm1]=nm
                Object.defineProperty(holder,nm1,descriptor)
            }
            if(valdescriptor.isExpr){
                 if(this.__record__){
                    valdescriptor.calc(this)
                }
             }
        },
        clear:function( ) {
            var C = this.__config, R = this.__record__
            if (!R || !C) {
                return  this
            }
            var M=C.descriptors||{},A=C.aliases
            for (var i = 0, l = this.keys() || [], ln = l.length, k; k = l[i], i < ln; i++) {
                k && (R[k] = (M[k]||{}).defaultValue)
            }
            delete this.__mod;
            this.__dirty__=false
            return  this
        },
        reset: function(a) {if(!this.__record__){return}
            this.clear();
            this.firePropertyChangeEv("reset")
            a && this.read(a)
            delete this.__mod;
            return  this
        },
	    readTo:function(data ,config,holder){
		    var   C=config ,R=holder||{}, M,A
		    if( !(C && C.descriptors && C.aliases) || !data){return }
		    M=C.descriptors||{}
		    A=C.aliases
		    if(data&&typeof(data)=="object"){
			    var nm,c=0
			    if($.isArray(data)){
				    for(var i=0,l=C.keys ||[],ln=l.length,k;k= l[i ],i<ln;i++) {
					    if(k &&  M[k] && data[i]!=null){
                            R[k]=M[k].reader?M[k].reader(data[i]):data[i]
                            c++
                        } ;
					    //k && this.set(k,data[i],null,M[k] )
				    }
			    } else{
				    for(var i=0,l=Object.keys(data)||[],ln=l.length,k;k=l[i],i<ln;i++) {
					    if(k && (nm=A[k]||A[(k+"").toLowerCase()]) && M[nm] ) {
                            R[nm]=M[nm].reader?M[nm].reader(data[k]):data[k];
                            c++
					    //(nm=A[k]) && (k in data) && this.set(nm,data[k],null,M[nm] )
                        }
				    }
			    }
                if(c){this.__dirty__=true}
		    };
		    return R
	    },
        read:function(data ){
	        //performance- for initial read no need to check dependancies or dispatch change events
	        if(!this.__record__ || !this.__config || !data){return  this}
            this.readTo(data,this.__config,this.__record__)
            this.recalcAll();
            return this

        },
        hasField: function(a) { return ((this.__config||{}).aliases||{})[a] },
        setLabelExpr: function(a) {
            this.addExpr(this.labelExpr="labelexpr", a)
        },
        getLabelValue: function() {
            var a;
            if("labelExpr" in this.labelExpr){
                return this.get(this.labelExpr);
            }
            var meta=this.__config.entitymeta
            if(meta && meta.getLabel){
                return meta.getLabel(this)
            }
            var titlefield=meta?meta.find(function(a) {
                return a.titlefield
            }):null
            if(titlefield){
                return this.get(this.labelExpr = titlefield.name);
            }
            return ""
        },
        update:function(a){return this.read(a)},

        mod: function() {
            return this.__mod||[]
        },
        resetStatus: function() {
            delete this.__mod;
	        return this
        },
        prepTemplate:function(a){
            if(a && a.__recordprepped){return a}
            var fn=$.template(a);

            var nu=(function(f){
                return function(rec,trans){
                    if(!rec){return ""}
                    rec.__templateMode={}
                    var idx="number" == typeof trans?trans:0;
                    if(idx){rec.index=idx}
                    var c = f.call(this,rec);
                    if("function" == typeof trans){
                        c = trans(c)
                    }
                    if(idx){delete rec.index}
                    delete rec.__templateMode;
                    return c;

                }
            })(fn)
            Object.keys(fn).forEach(function(k){nu[k]=fn[k]})
            nu.__recordprepped=true
            nu.fn=nu;
            return nu
        },
        applyTemplate: function(a, idx) {
            if(!this.__record__){return}
            a = this.prepTemplate(a)
            return a(this)
        },
        resolveName: function(a,config) {
            config=config||this.__config;

            return (config && config.aliases[a])||a
        },
        refresh: function() {
            return this.provider && this.id > 0 ? this.provider.getRecord(this.id) : Promise.reject("No provider found")
        },
        save: function() {
            this.mod();
            return this.provider ? this.id > 0 ? this.provider.update(this) : this.provider.insert(this) : Promise.reject("No provider found")
        }
    })
    Active.Record.makeStoreTemplate=function(meta ,catchall){
        var holder=new Active.Record()
        holder.__config.entitymeta=meta
        meta.eachItem(function(a) {if(!a||!a.name||!isNaN(a.name)){return}
            holder.addProperty(a.name,{descriptor:true,meta:a})
        });
        var ctor=$.createClass(function ctor(data,dataprepped){
            this.__record__= dataprepped===true?data:Object.create(null);
            this.__mod=[];
            this.__dirty__=false
            if(dataprepped!==true){
                this.reset(data)
            }
        },holder,null,{})
        ctor.prototype.static={};
        ctor.prototype.newInstance=ctor.newInstance.bind(ctor)
        ctor.prototype.sharedState={RESETMODE:false, BATCHMODE:false, REGULAR:false}
        ctor.fn=ctor.prototype
        return ctor;
    }




    Active.Column=$.model.make("entitycolumn",
        ["id","name", "type", "entity", "safe", "encodehtml", "aliasmap", "typeInfo", "actualtype",
            "renderer", "fieldrenderer","required", "readonly", "cellRenderer", "list", "primaryEntity",
            "hasLookup", "dataIndex", "defaultValue", "profileimage", "label","index","viewonly","titlefield",
            "decodevalue", "format","ui","cellui","searchalias"
        ],
        {
            initModelInstance:function(){
                this.__initModelInstance=true;
                $.domUI.addTo(this,"ui","iptype combo nolabel labeltop labelwidth wrapklass wrapstyle block hidden")
                $.domUI.addTo(this,"cellui","combo nolabel labeltop labelwidth wrapklass wrapstyle block hidden")
                this.setUpColumn.apply(this,arguments)
            },
            setUpUI:function(){

            },
            setUpColumn:function(){
                this.setUpUI()
                this.id=Active.Meta.normalizeName(this.name||"--none--")

                // this.ui={klass:[],style:{},attr:{},iptype:null,hidden:null }
                var name=arguments[0],type=arguments[1],props=arguments[2]
                if(arguments.length==1&&typeof(name)=="object" ){
                    props=name
                } else if(name&& typeof(name)=="string"){
                    props=props   ||{}
                    props.name=name;props.type=type;
                }

                this.updateProperties(props)
                //props={label,validations,display,lookup}
                this.onchange("list",function(rec){
                    if(rec&&rec.value&&rec.value.length){
                        if(this.lookuplistPromise){
                            this.lookuplistPromise.resolve(rec)
                        }
                        this.hasLookup=true
                    }
                    this.lookuplistPromise=null
                    this._lookupmap=null
                }.bind(this))
                this.lookup=new Data.Lookup(this)
            }   ,
            updateProperties:function(props ){
                this.setUpUI()
                var ui=this.ui;
                if(props &&typeof(props)=="object" && Object.keys(props).length){
                    if(typeof(props.format)=="function"){props.format={fn:props.format}}
                    if(props.type){
                        props.typeInfo = $.typeInfo(props.actualtype||props.type);
                    }
                    this.update(props);
                } else {

                }

                if(!this.dataIndex){
                    this.setItem("dataIndex",this.name.replace(/\W+/g,"_").toLowerCase())
                }
                var type=this.type,actualtype=this.actualtype
                if(!this.typeInfo && !type){

                    var name=this.name
                    if(/date/i.test(name||"")){type="date"}
                    else if(/time/i.test(name||"")){type="time"}
                    else if(/(id|num|year|month)$/i.test(name||"")){type="number"}
                    else {type="string"}
                    this.setItem("type",type)
                }
                if(!this.typeInfo && (actualtype||type)){
                    var typeInfo
                    if(actualtype&&TypeInfo.typeMap&&TypeInfo.typeMap[actualtype]){typeInfo=TypeInfo.getInfo(actualtype)}
                    else{typeInfo=TypeInfo.getInfo(type)}
                    this.setItem("typeInfo",typeInfo)
                }
                this.cellRenderer=(this.cellRenderer||function(a){return a}).bind(this)

                if(!this.label){
                    this.label=  String(this.name||"").replace(/[_\.]/g," ").replace(/([A-Z])/g," $1").replace(/([a-z])name/g,"$1 Name")
                        .replace(/_id$/g,"")
                        .replace(/^[a-z]/g,function(a){
                            return a.toUpperCase()
                        })
                }
                if(this.reader && typeof(this.reader)=="string" && this.reader.indexOf("FN|")==0){
                    try{this.reader=(0,eval)("("+this.reader.substr(3)+")")} catch(e){this.reader=null}
                }
                if(typeof(this.reader)!="function"){this.reader=null}
                if(this.fieldrenderer=="rte"){
                    this.cellRenderer=function(v){
                        return "<pre>"+String(v).replace(/\[TS\]/gi,"<").replace(/\[TE\]/gi,">")+"</pre>"
                    }
                }
                if(!this.hasLookup&&(this.list||this.primaryEntity)){this.hasLookup=true}
                if(this.defaultValue==null && this.typeInfo){this.defaultValue=this.typeInfo.defaultValue}
                if(this.actualtype&&this.actualtype!=this.type){
                    if(this.type=="date"&&!this.format){
                        this.format=this.actualtype
                    }
                }
                if(this.safe &&!this.format){
                    this.format=function(v){return String(v).replace(/>/g,"&gt;")
                        .replace(/</g,"&lt;").replace(/script/g,"s_ript")
                        .replace(/function/g,"f_nction").replace(/eval/g,"e_al").replace(/on([\w]+)/g,"o_$1")
                    }
                }
                if(this.encodehtml &&!this.format){
                    this.format=function(v){return String(v).replace(/>/g,"&gt;").replace(/</g,"&lt;")}
                }
                if(this.list){
                    // this.getLookupValueMap()
                }
                if(!this.index){
                    this.index=100
                }
             } ,

            read:function(val ){
                if(val==null){return TypeInfo.ValueNull}
                if(this.decodevalue&&typeof(val)=="string"){val=val.replace(/</g,"&lt;").replace(/>/g,"&gt;")}
                var ret=this.reader?this.reader(val):(this.typeInfo&&this.typeInfo.coerce?this.typeInfo.coerce(val):val);
                return ret
            },
            resetLookup:function(){},
            getLookupValueMap:function(k){
                var p=Promise.deferred()
                if(this._lookupmap){p.resolve(this._lookupmap)}
                else{
                    if(this.list&&this.list.length){
                        this._lookupmap=this.list.reduce(function(m,it){m[it.id]=it.label
                            return m},{})
                        p.resolve(this._lookupmap)
                    }
                    else{
                        this.getLookupList().then(
                            function(list){var arr= (list||{}).list||list
                                if(!arr){return}
                                if(!$.isArray(arr)){ arr=[]}
                                var lc=String(k).toLowerCase()
                                var mp=arr.reduce(function(m,it){if(it&&it.id){m[it.id]=it.label}
                                    return m},{})
                                this._lookupmap=mp;
                                p.resolve(mp)

                            }.bind(this)
                        );
                    }
                }
                return p;
            },
            getLookupValue:function(k){
                var p=Promise.deferred()
                if(this._lookupmap){p.resolve(this._lookupmap[k])}
                else{
                    this.getLookupList().then(
                        function(list){
                            if(list){var lc=String(k).toLowerCase(),data=list.data||list.list||list
                                if($.isArray(data)) {
                                    var tuple = (list.list || list).find(function (it) {
                                        return String(it.id).toLowerCase() == lc || String(it.label).toLowerCase() == lc
                                    })
                                    p.resolve((tuple||{}).label)
                                    return;
                                }
                            }
                            //p.reject()
                        }
                    );
                }
                return p;
            },
            getDynaLookupList:function(lookupid,callback){
                if(  typeof app =="undefined"){return}
                var url=app.servicePath+"?entity="+this.entity+"&lookuplist="+this.name+ "&lookupid="+lookupid

                var ths=this
                $.xhr.jsonp(url,{},function(d){
                    var list=(d.list||d),keyname="id",labelname="label";
                    if($.isArray(list)&&list[0]){
                        if(typeof(list[0])!="object"){
                            list=list.map(function(it){return {id:String(it),label:String(it)}})
                        }
                        else{
                            var kys=Object.keys(list[0])
                            keyname=("id" in list[0])?"id":kys[0];
                            labelname=("label" in list[0])?"label":(("name" in list[0])?"name":kys.pop());
                            if(keyname&&(keyname!="id"||labelname!="label")){
                                list=list.map(function(it){return {id:it[keyname],label:it[labelname]}})
                                keyname="id";labelname="label"
                            }
                        }
                    }

                    var lookuplist={keyname:keyname,labelname:labelname,list:list}
                    //  if(ths.lookuplistPromise){ths.lookuplistPromise.resolve(lookuplist)}
                    callback && callback(lookuplist) ;
                } );
            },
            getLookupList:function(refresh,getuniqifnolookup,lookupid) {
                var p = this.lookuplistPromise
                if (getuniqifnolookup) {
                    p = this.uniqlookuplistPromise
                }
                if (p) {
                    return p
                }
                var url

                if (this.list || this.primaryEntity || this.lookuplist || getuniqifnolookup) {
                    p = Promise.deferred();
                    if (getuniqifnolookup) {
                        this.uniqlookuplistPromise = p
                    }
                    else {
                        this.lookuplistPromise = p
                    }
                    var list = this.list || this.lookuplist
                    if (this.list || (!refresh && this.lookuplist)) {
                        p.resolve(list)
                    } else {
                        if (typeof app != "undefined") {
                            url = app.servicePath + "?entity=" + this.entity + "&lookuplist=" + this.name + (lookupid ? ("&lookupid=" + lookupid) : "")
                        }

                        $.xhr.jsonp(url, {}, function (d) {
                            var list = (d.list || d), keyname = "id", labelname = "label";
                            if (list.error) {
                                list = []
                            }
                            if ($.isArray(list)) {
                                list = list.map(function (it) {
                                    if (it == null) {
                                        return {id: "", label: ""}
                                    }
                                    if (typeof(it) != "object") {
                                        return {id: String(it), label: String(it)}
                                    }
                                    return {id: it.id, label: it.label || it.name}
                                })
                                keyname = "id";
                                labelname = "label"
                            }

                            this.lookuplist = {keyname: keyname, labelname: labelname, list: list}
                            p.resolve(this.lookuplist);
                        }.bind(this));
                    }


                } else {
                    if (!p) {
                        p =this.lookuplistPromise
                        if(!p){
                            p =this.lookuplistPromise=Promise.deferred()
                        }
                        p.resolve();

                    }
                    else {
                        p.resolve()
                    }
                }
                return p
            },
            getDisplayValue:function(v){  //this.type&&this.type.format&&!this.meta.hasLookup)?this.type.format(v):String(v);
                //hasLookup)?this.type.format(v):String(v)
                var lkup
                if(!v){

                    if(this.defaultValue){
                        if(this.defaultValue.label){lkup=this.defaultValue.label;v=this.defaultValue.value}
                        else {v=this.defaultValue}
                    } else{
                        v=this.typeInfo.defaultValue}
                    if(!v && this.typeInfo.date){return ""}
                }

                if(!lkup){

                    this.getLookupValueMap()
                    var keyv=v
                    if(this.typeInfo&&this.typeInfo.isDate()){
                        keyv=+this.typeInfo.coerce(v)
                    }
                    keyv=keyv||v;
                    if(this.hasLookup&&this._lookupmap&&Object.keys(this._lookupmap).length){
                        lkup=this._lookupmap[keyv+""] || v
                    }
                    else if(this.format&&typeof(this.format.fn||this.format)=="function"){
                        lkup=(this.format.fn||this.format)(v)
                    } else{
                        if(v && typeof(v.format)=="function"){
                            lkup=v.format()
                        } else {
                            var t = this.typeInfo;
                            if (t.isNumber() ) {
                                if(!(this.name == "id" || /_?id$/i.test(this.name))) {
                                    var a = this.actualtype;

                                    if (typeof(this.format) == "string" || a == "dollar" || a == "currency" || a == "money") {
                                        lkup = t.format(v, this.format)
                                    }
                                    else if (a == "integer" || a == "number") {
                                        lkup =  Math.round(Number(v))
                                    }
                                    else {
                                        lkup = String(v)
                                    }
                                } else{
                                    lkup =  Math.round(Number(v))
                                }
                            }
                            else {
                                lkup = t.format(v, this.format)
                            }
                        }
                    }
                }
                return String(lkup==null?v:lkup)
            },
            validate:function(v){
                var i=this.typeInfo,val=v;
                if(i && i.isNumber()){
                    if(!TypeInfo.isNumber(v)){return null}
                    val=i.coerce?i.coerce(v):v ;
                    if(this.actualtype=="decimal"||this.actualtype=="dollar"||this.actualtype=="numeric"||this.actualtype=="currency"||this.actualtype=="money"){}
                    else if(i.isNumeric()){if(Math.floor(val)<v){val=Number(val.toFixed(2))} }
                    else{val=Math.round(val)}

                }
                return val;
            },

            getUIInstance:function(ctor0,specs){
                var ctor=ctor0||Active.UIField;
                var nu=new ctor(this.toMap())

                if(this.ui){nu.ui=$.extend(nu.ui||{},this.ui)}

                nu.statics||(nu.statics={});
                if(specs){
                    nu.update(specs)
                }
                return nu
            }

        }
    )
    Active.UIField = Data.Column.extend({
        ip: null,
        wrapel: null,
        val: null,
        hidden: null,
        listvw: null,
        labelel: null,labelstyle:null,
        valueWrap: null,
        defaultproperty: "val",
        wrapstyle: null,
        wrapklass: null,
        wasvalid: null,
        inline: null,
        resetState: function() {},
        buildFragment: function() {
            this.fieldTemplate || (this.fieldTemplate = $.require("UI.Form").defaultFieldTemplate);
            var a = this.fieldTemplate(this);
            if(a && a.nodeType==11){a= a.firstChild}
            this.wrapel = $d(a), this.labelel = this.wrapel.q(".ui-ip-label");
            this.ip = this.wrapel.q("input,textarea,select");
           $.emitter.augment(this)
            return this
        },
        sync: function() {},
        build: function(a, b) {
            b = b || {};
            var c = this.name,
                d = a || {}, e = this;

            t
            if (!(!e || e.hidden || e.ui && e.ui.hidden)) {
                var f, g, h = {
                        formDom: d.formDom,
                        layoutTemplate: d.layoutTemplate,
                        dom: d.formDom ? d.formDom.q(".field-wrap2[data-key='" + c + "']") : null,
                        fieldKlass: d.fieldKlass,
                        model: d.model,
                        panel: d.panel,
                        meta: d.meta
                    }, i = $.require("UI.Form"),
                    j = this,
                    k = i.models;
                if (!h.layoutTemplate || h.dom) {
                    if (h.model ){
                        h.model.hasProperty(c) || h.model.addProperty(c, {
                            type: j.typeInfo
                        });
                        h.model.onchange(c, function(a) {
                            this.setValue(a.value, a.valueLabel)
                        }.bind(this))

                        $.extend(e.ui, b.ui)
                        b.label && (e.label = b.label)
                        ("combo" == e.iptype || "combo" == e.ui.iptype) && (e.ui.combo = !0, e.ui.iptype = "search");
                    }

                    var n = e.renderer;
                    if (!n && e.fieldrenderer && (n = k[e.fieldrenderer]), !n) {
                        if ("time" == e.type || "time" == e.actualtype) {
                            for (var o = [], p = 0, q = $.date().format("mm/dd/yyyy"); 24 > p;) {
                                for (var r = 0; 4 > r; r++) {
                                    var s = (0 == p || 12 == p ? 12 : (12 + p) % 12) + ":" + (15 * r || "00") + (p >= 12 ? " pm" : " am");
                                    o.push({
                                        id: +new Date(q + " " + s),
                                        label: s
                                    })
                                }
                                p++
                            }
                            e.list = o, n = k.datalist
                        }
                        var t = e.ui || {}, u = t.iptype || "text";
                        n = k[e.type] || k[t.iptype || e.iptype] || k[e.name], e.hasLookup && (n = k.datalist),
                        ("checkbox" == u || "bool" == u || "bool" == e.type || "boolean" == e.type || "tinyint" == e.actualtype) &&
                        (n = k["boolean"]), ("img" == e.type || "img" == u) && (n = k.img), "function" == typeof n && (n = {
                            render: n
                        })
                    }
                    n && (e.renderer = n);
                    var v = b,
                        w = j.toMap();
                    if (!/color$/.test(e.name) || u && ("text" != u || e.renderer) || (u = "color"), v && "object" == typeof v) {
                        var x = $.clone(v.ui || v);
                        if (x.klass) {
                            var y = String.isString(x.klass) ? x.klass.split(/\s+/) : [].concat(x.klass || []);
                            [].push.apply(j.ui.klass, y)
                        }
                        x.iptype && (j.ui.iptype = x.iptype, delete x.iptype),
                        (x.css || x.style) && (j.ui.style || (j.ui.style = {}), $.extend(j.ui.style, x.css || x.style),
                            delete x.css, delete x.style), x.attr && (j.ui.attr || (j.ui.attr = {}), $.extend(j.ui.attr, x.attr), delete x.attr),
                            $.keys(x).forEach(function(a) {
                                $d.css.isStyle(a) && (j.ui.style || (j.ui.style = {}), j.ui.style[a] = x[a], delete x[a]), /^label\w+/.test(a) && (j.ui[a] = x[a], delete x[a])
                            }),
                            $.keys(w).forEach(function(a) {
                                $d.css.isStyle(a) && (j.ui.style || (j.ui.style = {}), j.ui.style[a] = w[a]), /^label\w+/.test(a) && (j.ui[a] = w[a])
                            }),
                            j.update(x)
                    }
                    try {
                        j.render({
                            model: h.model,
                            panel: h.panel,
                            meta: h.meta
                        })
                    } catch (z) {
                        console.error(z)
                    }
                    if (g = j.wrapel, (!h.dom || !h.dom.q("input[name='" + c + "'],select[name='" + c + "'],textarea[name='" + c + "']")) && h.formDom) {
                        var A = h.formDom.q(".field-wrap2[data-key='" + c + "']") || h.formDom.q(".field-wrap[data-key='" + c + "']");
                        A && (j.wrapel = g ? A.append(g) : A, f = 1), !f && g && (j.wrapel = h.formDom.append(g))
                    }
                    j.wrapel = j.wrapel || j.ip;
                    var B = j.ip;
                    if(B){
                        j.ui.iptype && !j.renderer && (B.type = j.ui.iptype);
                        ("id" == e.name || e.hidden) && (B.type = "hidden", j.wrapel.hide());
                        "email" == e.name && "text" == B.type && (B.type = "email") ;
                        j.ui.width && (B.style.width = j.ui.width + "px")
                        j.ui.height && (B.style.height = j.ui.height + "px")
                        j.ui.style && $d.css(B, j.ui.style)
                            $d.addClass(B, j.ui.klass || [])
                            $d.prop(B, j.ui.attr || {})
                        j.hasLookup && !j.readonly && "search" != B.type && !/SELECT/i.test(B.tagName) && $d.up(B).addClass("glyph-ddn");
                        j.typeInfo && j.typeInfo.isDate() && $d(B).after("Z!div.gl-icon-cfndar[marginLeft:-20]");
                        j.ui.nolabel && g.addClass("nolabel")
                        j.ui.labeltop && g.addClass("label-top")
                        j.ui.block && g.css("display", "block")
                        j.hidden && j.wrapel && $d.hide(j.wrapel);
                    }
                    var C = j.ui.labelwidth;
                    if (C) {
                        var D = j.wrapel.q(".ui-ip-label");
                        D && (D.style.width = C + ("auto" == C ? "" : "px"))
                    }
                    var L = e.labelstyle|| e.ui.labelstyle;
                    if(L){
                        var D = j.wrapel.q(".ui-ip-label");
                        D && D.css(L)
                    }
                    var E = e.wrapklass || e.ui.wrapklass;
                    j.wrapel && E && String(E).split(/[\s,]/).forEach(function(a) {
                        j.wrapel.classList.add(a)
                    });
                    var F = e.wrapstyle|| e.ui.wrapstyle;
                    if(F){
                        $d.css(j.wrapel || $d.parent(this.ip), F);
                    }

                    this.ip && $d.on(this.ip, "click", function() {
                        this.fire("selection")
                    }.bind(this));

                    if(!this.inline && j.wrapel){
                        //j.wrapel.addClass("field-wrap-inline")
                    }
                    return this
                }
            }
        },
        render: function(a) {
            var b = (this.typeInfo.type, this),
                c = this.renderer;
           // this.fire("beforerender")
            this.ip || this.buildFragment()
            c && (c && c.init && c.init(b, a), c.render && c.render(this, a));
            this.applyUI()
           // this.fire("afterrender")
            return this
        },
        applyUI: function() {},
        onchange: function(a) {
            return this.on("change", a)
        },
        oninput: function(a) {
            return this.on("input", a)
        },
        isModified: function() {},
        applyFormat: function(a) {
            var b = a;
            if(this.type=="date" && typeof(this.format)=="string"){
                return $.date.format(a,this.format);
            }
            return this.format && "function" == typeof(this.format.fn || this.format) && (this.hasLookup && (this.getLookupValueMap(), this._lookupmap && this._lookupmap[String(b)] && (b = this._lookupmap[String(b)])), b = (this.format.fn || this.format)(b)), b
        },
        setValue: function(a, b) {
            var c = this.validate(a);
            if (null !== c && c != this.valueOf() && this.ip  && this.ip.dataset.val != c) {
                if (this.ip.dataset.val = c, b && b != c) c = this.applyFormat(b);
                else if (!this.ip.is("input,select,textarea") || "text" == this.ip.el.type || "search" == this.ip.el.type) {
                    var d;
                    if (this.format && (d = this.applyFormat(c), c == d ? d = null : c = d), !d)
                        if (this.hasLookup) {

                            var e = c;
                            this.getLookupValueMap(), this.typeInfo && this.typeInfo.isDate() && (e = +this.typeInfo.coerce(c)), e = e || c, this._lookupmap && this._lookupmap[e || c] ? c = this._lookupmap[e] : this.getLookupValue(e).then(function(a) {
                                var b = a || c;

                                this.ip.val(b)
                            }.bind(this))
                        } else {
                            c = this.typeInfo.format(c);
                        }
                    "date" == this.ip.el.type && "valueAsDate" in this.ip.el ? (this.ip.el.valueAsDate = new Date(c), c = null) : c = null == d ? c : d
                }

                return (null == c || "null" == a || "0" == String(c)) && (c = ""), this.ip.val(c), this
            }
        }
    });
   Active.Meta = Klass($.model.Collection, {
        columns: {},
        _normalizedNames: [],
        _provider: null,
        nameProp: "name",
        itemAlias: "field",
        init: function(a, b, c) {
            this.itemKlass = Active.Column, this.setup(), this.columns = this.nameMap || (this.nameMap = {});
            var d = [];
            if (c = c || {}, this.name = a, "string" == typeof b) d = b.split(/[\s,]/).reduce(function(a, b) {
                var c = b.trim().split(/=:/);
                return a.push({
                    name: c.shift().trim(),
                    type: c.shift()
                }), a
            }, []);
            else if (b && "object" == typeof b) {
                var e = [];
                if ($.isArray(b)) e = b.slice();
                else
                    for (var f in b) {
                        var g = {
                            name: f
                        };
                        if ("string" == typeof b[f]) g.type = b[f];
                        else
                            for (var h in b[f]) g[h] = b[f][h];
                        e.push(g)
                    }
                d = $.clone(e, !0)
            }
            $.each(d, function(a, b) {
                "object" != typeof a || a.name || "string" != typeof b || (a.name = b), this.add(a)
            }, this), !c.autogenid && "id" in this.nameMap || (this.autogenid = !0)
        },
        getLabel: function(a) {
            if (!this.__labelcol) {
                var b, c;
                this.eachItem(function(a) {
                    a && !b && "string" == a.type && (c || (c = a.name), a.name.indexOf("label") >= 0 || a.name.indexOf("lbl") >= 0 ? b = a.name : a.name.indexOf("name") >= 0 && (b = a.name))
                }), b || (b = c), this.__labelcol = b
            }
            return a ? a.get(this.__labelcol) : null
        },
        getProvider: function(a) {
            var b = a ? null : this._provider;
            b || (b = new Data.UrlProvider(("undefined" != typeof app ? app.servicePath : Data.servicePath || "router") + "?entity=" + this.name), b.entity = this.name), a || (this._provider = b)
            b.meta=this
            return b
        },
        createStore: function(provider, options) {
            if(!options && $.isPlain(provider)){
                options=provider;
                provider=null;
            }
            $.isPlain(options) || (options = {});
            if(!(provider && typeof(provider)=="object")){
                provider = this.getProvider(provider === !0)
            }
            options.provider = provider;
            var c = new Data.store(this, options);
            return c
        },

        createRecord: function(data, provider) {
            if(!this.recordProto){
                this.recordProto=Data.Record.makeStoreTemplate(this)
            }

            provider || (provider = this.getProvider());
            var c = this.recordProto.newInstance();
            if(data ){
                if(!isNaN(data) && data > 0 && provider){
                    provider.load({criteria:{id:data}}).then(function(a) {
                        var rec=a.data||a
                        c.update(Array.isArray(rec)?rec[0]:rec)
                    })
                } else if($.isPlain(data)){
                    c.update(data)
                }
            }
            return  c
        },
        prep: function(a, b) {
            {
                var c = arguments[2] || {};
                Active.Meta.normalizeName
            }
            if ("object" == typeof a ? c = a : (c.name = a, c.type = b || c.type), c.entity = this.name, c.name) {
                var d = this.normalizeName(c.name);
                d && this._normalizedNames.push(d)
            }
            return c
        },
        normalizeName: function(a) {
            return Active.Meta.normalizeName(a)
        }
    });
    Active.Meta.normalizeName = function(a) {
        return a && "object" == typeof a && (a = a.name), a && "string" == typeof a ? String(a).replace(/[\W]/g, "").toLowerCase() : ""
    }
    Active.Lookup = Klass("Data.Lookup", {
        field: null,
        list: null,
        lookuplist: null,
        init: function(a) {
            this.field = a || {}, this.onpropertychange("list", function(a) {
                a && a.value && a.value.length && (this.lookuplistPromise && this.lookuplistPromise.resolve(a), this.field.hasLookup = !0), this.lookuplistPromise = null, this._lookupmap = null
            }.bind(this))
        },
        clear: function() {
            this.lookuplist = null
        },
        getLookupValue: function(a) {
            var b = Promise.deferred();
            return this._lookupmap ? b.resolve(this._lookupmap[a]) : this.getList().then(function(c) {
                if (c) {
                    var d = String(a).toLowerCase(),
                        e = (c.list || c).find(function(a) {
                            return String(a.id).toLowerCase() == d || String(a.label).toLowerCase() == d
                        });
                    b.resolve((e || {}).label)
                }
            }), b
        },
        getDynaLookupList: function(a, b) {
            if ("undefined" != typeof app) {
                var c = app.servicePath + "?entity=" + this.field.entity + "&lookuplist=" + this.field.name + "&lookupid=" + a;
                $.xhr.jsonp(c, {}, function(a) {
                    var c = a.list || a,
                        d = "id",
                        e = "label";
                    if ($.isArray(c) && c[0])
                        if ("object" != typeof c[0]) c = c.map(function(a) {
                            return {
                                id: String(a),
                                label: String(a)
                            }
                        });
                        else {
                            var f = Object.keys(c[0]);
                            d = "id" in c[0] ? "id" : f[0], e = "label" in c[0] ? "label" : "name" in c[0] ? "name" : f.pop(), !d || "id" == d && "label" == e || (c = c.map(function(a) {
                                return {
                                    id: a[d],
                                    label: a[e]
                                }
                            }), d = "id", e = "label")
                        }
                    var g = {
                        keyname: d,
                        labelname: e,
                        list: c
                    };
                    b && b(g)
                })
            }
        },
        getList: function(a, b, c) {
            if (this.lookuplistPromise) return this.lookuplistPromise;
            var d, e = Promise.deferred();
            if (this.lookuplistPromise = e, this.list || this.field.primaryEntity || this.lookuplist || b) {
                var f = this.list || this.lookuplist;
                this.list || !a && this.lookuplist ? e.resolve(f) : ("undefined" != typeof app && (d = app.servicePath + "?entity=" + this.field.entity + "&lookuplist=" + this.field.name + (c ? "&lookupid=" + c : "")), $.xhr.jsonp(d, {}, function(a) {
                    var b = a.list || a,
                        c = "id",
                        d = "label";
                    if (b.error && (b = []), $.isArray(b) && b[0])
                        if ("object" != typeof b[0]) b = b.map(function(a) {
                            return {
                                id: String(a),
                                label: String(a)
                            }
                        });
                        else {
                            var e = Object.keys(b[0]);
                            c = "id" in b[0] ? "id" : e[0], d = "label" in b[0] ? "label" : "name" in b[0] ? "name" : e.pop(), !c || "id" == c && "label" == d || (b = b.map(function(a) {
                                return {
                                    id: a[c],
                                    label: a[d]
                                }
                            }), c = "id", d = "label")
                        }
                    this.lookuplist = {
                        keyname: c,
                        labelname: d,
                        list: b
                    }
                    this.lookuplistPromise && this.lookuplistPromise.resolve(this.lookuplist)
                }.bind(this)))
            } else {
                this.lookuplistPromise && this.lookuplistPromise.resolve();
            }
            return this.lookuplistPromise
        }
    });

    Active.criteria=Klass({
            meta:null,_holder:{},listPromises:{},_cached:null,
            checkIfModified:function(noev){
                var expr=this.toJson()||null;
                if(this._cached!==expr){ this._cached =expr;
                    this.fire("change")
                }
            },
            remove:function(k,v){
                var el=this.findElement(k,true)
                if(arguments.length==1){v=null}
                if(el){var nm=el.col
                    if(v==null||!($.isArray(el.val)&&el.val.length)){delete this._holder[nm]}
                    else{   var idx
                        if(typeof(v)=="number"){idx=v}
                        else{    var fnd=[].concat(el.val||[]).find(function(it){return it.value==v})
                            idx=fnd?[].concat(el.val||[]).indexOf(fnd):-1;
                        }
                        if( idx>=0){
                            el.val.splice(idx,1)
                        }
                    }
                }
                this.checkIfModified(false);
                return this
            },
            getLookupList:function(nm,refresh,crit ){
                if(!this.listPromises[nm]){
                    var f=this.meta?this.meta.findField(nm):{name:nm}
                    if(f && f.getLookupList){
                        this.listPromises[nm]=f.getLookupList(refresh,true,crit)
                    }
                }
                return this.listPromises[nm]

            },
            findElement:function(k){
                if(!k){return null}
                if(typeof(k)=="object"&&k.col&&k.val&&typeof(k.val)=="object"){return k}

                return this._holder[k]
            },
            empty:function(){ return Object.keys(this.toMap()).length<1},
            setCondition:function(col,v,lbl){
                var elm=this.findElement(col )
                if(!elm){this.append(col);
                    elm=this.findElement(col )
                }
                if(elm){
                    var nm=col
                    if($.isArray(elm.val)){
                        elm.val.length=0
                    }  else{elm.val=[]}
                    this.append(nm,v,"=",lbl)
                }
            },
            update:function(col,v,lbl,idx){ if(!this.meta) {}
                if(v==null){return}
                idx=typeof(idx)=="number"?idx:-1
                if(idx>=0){if(!(v&&typeof(v)=="object")){v={value:v,label:lbl||v}}
                    var elm=this.findElement(col )
                    if(elm ){
                        var meta=this.meta.findField(col)
                        if(meta && meta.searchalias){
                         //   alert(2);
                        }
                        if(!$.isArray(elm.val)){elm.val.value=v.value;elm.val.label=v.label}
                        else{ elm.val.splice(idx,1,v)   }
                        if(elm&&elm.val&&elm.val.length>1){var nll=elm.val.find(function(it){return it&&it.value==null});
                            if(nll){elm.val.splice(elm.val.indexOf(nll),1)}
                        }
                    }
                }
                this.checkIfModified(false);
            },
            parseCriteria:function(str){
                var arr= str.split(/\s/),crit={}
                if(arr.length==3 && /[\=\>\<!]/.test(arr[1])){
                    crit.value=arr[2]
                    crit.name==arr[0]
                    crit.op=arr[1];
                    this.append(crit.name,crit.value,crit.op)
                    return crit
                } else {
                    var gr=$.makeGraph(str)
                    if(gr && gr.graph){
                        if(gr.graph.op){
                            this.append(gr.graph)
                        }
                    }
                }
                return this
            },
            append:function(nm,v,op,lbl,isnew){
                if(!this.meta) {}
                if(arguments.length==1){
                    if(typeof (nm)=="number" || !isNaN(nm)){
                        v=nm; nm="id"; op="=";
                    } else if(nm && typeof (nm)=="object"){
                        if(nm.l && nm.r && nm.op){
                            if(nm.r.op || nm.l.op) {
                                if (nm.l.op) {
                                    this.append(nm.l)
                                    if(nm.l.l && this._holder[nm.l.l.value]){
                                        this._holder[nm.l.l.value].op2=nm.op
                                    }
                                }
                                if (nm.r.op) {
                                    this.append(nm.r)
                                }
                                return this
                            }
                            v=nm.r.value;
                            nm=nm.l.value;
                            op=nm.op;

                        };

                    } else if(typeof (nm)=="string"){
                        //var tokens=$.tokenize(nm)
                        var arr= nm.split(/\s/)
                        if(arr.length==3 && /[\=\>\<!]/.test(arr[1])){
                            v=arr[2];
                            nm=arr[0];
                            op=arr[1];
                        }
                    }
                }
                var val= v,col,f=this.meta?this.meta.findField(nm,true):{name:nm},cntu=true
                if(!f){return}
                col= f.name;op=op||"="
                var elm,curr  =this._holder[col]||(this._holder[col]={col:col,type: f.type||"",title: f.label,val:{value:v,label:lbl}});
                if(lbl&&["and","or","||","&&","+","-","*"].indexOf(String(lbl))>=0){curr.op2==lbl;lbl=null;}
                if(arguments.length>1){
                    lbl=(!lbl||lbl==v)&&f.getDisplayValue? f.getDisplayValue(v):lbl
                    if(op=="="&&curr.col){
                        if(!(curr.val && $.isArray(curr.val))){curr.val=[curr.val]}
                        if(!curr.val.find(function(it){return it&&it.value==v})){
                            curr.val.push({value:v,label:lbl})
                        }
                        elm=curr
                        cntu=false
                    }else{
                        $.extend(this._holder[col],{op:op,val:{value:v,label:lbl}})
                    }
                    elm=this._holder[col]
                    if(elm&&elm.val&&elm.val.length>1){var nll=elm.val.find(function(it){return it&&it.value==null});
                        if(nll){elm.val.splice(elm.val.indexOf(nll),1)}
                    }


                    this.checkIfModified(false);
                }
                return this;
            },
            collect:function(fn){  var res=[],mp=this.toMap()
                for(var i= 0,l=Object.keys(mp),ln=l.length;i<ln;i++ ){
                    res.push(fn(l[i],mp[l[i]]))
                }
                return res;
            },
            toModel:function(){
                var ret={map:this.toMap(true)}
                ret.fields=Object.keys(ret.map);
                ret.collect=function(fn){  var res=[]
                    for(var i= 0,l=this.fields,ln=l.length;i<ln;i++ ){
                        res.push(fn(l[i],this.map[l[i]]))
                    }
                    return res;
                }.bind(ret);
                return ret;
            },
            toMap:function(prune){
                var ret={},mp=this._holder
                Object.keys(mp).forEach(function(it){
                    if(!mp[it] || (prune && (mp[it].val==null||String(mp[it].val.value).trim()=="") )){return}

                    else {
                        ret[it]=mp[it]
                    }
                });

                return ret;
            },
            prep:function(){
                if(!("IN" in self )){
                    self.IN=function(val){
                        if(val==null||!val.valueOf){return !1}
                        var v=String(val.valueOf())
                        return [].slice.call(arguments,1).some(function(it){
                            var v1=String((it!=null&&it.valueOf)?it.valueOf():it);
                            return v1==v
                        });
                    }
                }
            },
            clone:function(){
                var nu=new Data.criteria();
                nu._holder=JSON.parse(JSON.stringify(this._holder))
                nu.meta=this.meta
                nu._cached=this._cached
                return nu;
            },
            toJson:function(){return JSON.stringify(this._holder)},
            toExpr:function( mode ){var mp=this._holder;
                this.prep()
                mode=mode||"js"
                var ret=[],cnt=0;
                var AND=mode=="js"?"&&":"and",
                    OR=mode=="js"?"||":"or",
                    EQ=mode=="js"?"==":"=",
                    prefix=mode=="js"?"it.":"";
                var list=  Object.keys(mp).map(function(it){
                    var v,nm=prefix+it,
                        m =mp[it]||{},
                        ret1=[] ,
                        val=m?m.val:null
                    if(!val  || (val==null||val=='')||($.isArray(val)&&!val.length)){return ""}
                    m.op=m.op||(m.op="=");
                    var op=(m.op=="="||m.op=="=="?EQ:m.op),
                        type=m.type,
                        valList=[].concat(val||[]);
                    if(!type || type=="any"){
                        if(valList.every(function(a){return typeof(a.value)=="number" || (typeof(a.value)=="string" && !isNaN(a.value))})){
                            type="number"
                        }
                    }
                    var nu=valList.map(function(v1){
                        if(!v1||v1.value==null||v1.value=="undefined"){return ""}
                        var val1,value=v1.value ;
                        if(type=="number"||type=="int"||type=="float" ||type=="long"){
                            val1=Number(value)||0
                        }
                        else if(String(type).indexOf("date")>=0||String(type).indexOf("time")>=0){
                            val1=(+new Date(value))
                        }
                        else {
                            val1= "'"+ String(value).replace(/^["']|['"]$/g,"")+"'"
                        }
                        return val1
                    }).filter(function(it){return String(it).trim()})
                    var v;
                    if(nu.length<=1){nu=nu[0]}
                    if(nu!=null){
                        if($.isArray( nu)){
                            if(mode=="sql"){
                                v=nm+" in ("+nu.join(",")+")"
                            }
                            else{
                                v="IN("+ nm+","+nu.join(",")+")"
                            }
                        }
                        else {v=nm + " "+op + " "+ nu}
                        if(v){ret1.push(v)};
                    }
                    cnt +=ret1.length
                    var ret=ret1.join(" "+OR+" ").trim()
                    return {value:ret,op:m.op2};
                });
                list.forEach(function(it,i,ar){if(!it){return}
                    var v=it.value,op=it.op
                    if(op=="or"||op=="OR"||op=="||"){op=OR}
                    else if(!op || op=="and"||op=="AND"||op=="&&"){op=AND}
                    if(v && v.replace(/[\|'"\s]/g,"").trim()) {
                        var s=cnt>2 || op==OR ?"("+v+")":v
                        ret.push(s)
                        if(i<ar.length-1){
                            ret.push(op)
                        }

                    }
                });
                var last=String(ret[ret.length-1])
                if(last && (last=="and"  || last=="&&")){
                    ret.pop()
                }
                ret=  ret.join(" ");

                return ret;
            },
            toSql:function(){
                return this.toExpr("sql");
            },
            toJs:function(asfn){
                var ret=  String(this.toExpr("js")||"").trim()
                if(asfn){
                    ret=!ret?function(){return true}:Function("it","return ("+ ret.replace(/\sand\s/g," && ").replace(/\sor\s/g," || ").replace(/([^=])=([^=])/g,"$1==$2")+")")
                }

                return ret;
            },
            toString:function(){
                return this.toJs();
            }
        }
    );
    Active.criteria.toCriteria=function(o){
        if(!o||typeof(o)=="string"||typeof(o)=="number"){return o==null?"":String(o)}
        var arr=[]
        if($.isPlain(o)){
            $.each(o,function(v,k){
                arr.push(k+"="+(!isNaN(Number(v))?v:"'"+v+"'"))
            })
            return arr.join(" and ")
        } else if($.isArray(o)){
            return $.collect(o,function(v,k){
                return Active.criteria.toCriteria(v)
            }).join(" or ")

        }
        return ""

    }
    Active.Sort=Klass("Data.Sort",{
            sortCols:null,multi:null,sortfn:null,
            init:function(sortcrit,sortdir){


            },
            update:function(sortcrit,sortdir){
                if(sortcrit){
                    var nu=this.parse(sortcrit,sortdir);
                    if($.serialize(nu)!== $.serialize(this.sortCols)){

                    }
                }
                return this;
            },
            parse:function(sortcrit,sortdir){
                var arr=[],col
                if(typeof(sortcrit)=="string"){
                    arr=sortcrit.split(/[,\s]}/);

                } else if(Array.isArray(sortcrit)){
                    arr=sortcrit.slice()
                }
                return arr.map(
                    function(col){
                        var dir=sortdir||""
                        if(/^([+\-]|[da01]!])/i.test(col)){
                            dir=col.charAt(0);
                            col=col.substr(1)
                            if(col.charAt(0)=="!"){col=col.substr(1)}
                        }
                        dir=(dir=="-"||dir=="d"||dir=="D"||dir=="0")?"d":"a"
                        return col?{col:col,dir:dir}:null
                    }
                ).filter(function(a){return a});

            }

        }

    );
    Active.pager=Klass(
        //this.store=store;this.sortcol=null;this.sortdir=null;; this.pageno=1;this.pagesize=20;this.totalrows=0
        {   sortcol:null,
            sortdir:null,  cachekey:null,  filter:null,
            pageno:1,
            pagesize:20,
            totalrows:0  ,
            init:function(store){this.store=store;
                //this.properties.addExpr("isCachedLocal","totalrows==store.records.length")
                this.properties.addExpr("startrow",{expr:function(rec){ return rec.pagesize<=0?1:Math.max(1,rec.endrow-rec.pagesize+1)},vars:["pagesize","endrow"]})
                this.properties.addExpr("endrow",{expr:function(rec){
                    return rec.pagesize<=0 || rec.pagesize > rec.totalrows?rec.totalrows:Math.min(rec.totalrows,rec.pageno*rec.pagesize)},vars:["pageno","pagesize","totalrows"]})
                this.properties.addExpr("totalpages",{expr:function(rec){return rec.pagesize?Math.max(1,rec.pagesize>0?Math.ceil(rec.totalrows/rec.pagesize):1):1},vars:["pagesize","totalrows"]})
            }
            ,applySort:function(s){
            if(this.update({sort :s})){
                this.loadPage()
                //this.fire("update");
            }
            return this ;
        }
            ,next:function(){ return this.nav(this.pageno+1)  }
            ,nav:function(p){
            var ret=this.update(p=="-1"?this.totalpages:p)
            if(ret){
                this.fire("update");
                //return this.loadPage()
            };
            return this;
        }
            ,previous:function(){return this.nav(this.pageno-1) },
            recalc:function(  num ){
                if(this.isCachedLocal){
                    this.totalrows=num>0?num:
                        Math.max(this.totalrows,this.store.size());
                }
                if(!this.pageno){this.pageno=1}
                return this
            }
            ,reset:function(){this.totalrows=0;this.pageno=0;this.sortcol=null;}, //pageno,sort,filter
            refreshViewIfNeeded:function(){
                if(this.isCachedLocal){
                    if(this.filter){
                        this.store.filter(this.filter);
                    }

                    if(this.sort){
                        this.store.filter(this.sort);
                    }
                    if(this.pagesize<this.store.size()){
                        this.store.records.splice(this.pagesize,this.store.size())
                    }
                }
            }
            ,update:function(){
            this.recalc()
            var st,end,sort,page=0 ,filter,args=[].slice.call(arguments)  ,first=args[0] ,curr=this.properties.toMap()
            if(!isNaN(first)){first={pageno:Math.max(1,Number(first))}}
            if(first && typeof (first)=="object"){
                ["pageno","pagesize","totalrows" ].forEach(function(k){
                    if(k && typeof(k)=="string"&& k in this&&first[k]>=0){
                        this[k]=first[k]}
                },this)

                if(first.cachekey){this.cachekey=first.cachekey}

                this.pageno=Math.max(1,Math.min(this.pageno,this.totalpages))
                if(curr.pageno!=this.pageno){page=this.pageno}
            }
            //  var v=first.pageno||(typeof(args[0])=="number"?args[0]:0)
            first=first||{}
            var sortdir,sortcol,v=first.sort||(typeof(args[1])=="string"?args[1]:"")
            if(v && typeof(v)=="string"){
                if(/^[\+\-]/.test(v)){sortdir= v.charAt(0)=="+"?"a":"d";v= v.substr(1)}
                else if(/^[ad]:/.test(v)){sortdir= v.charAt(0);v= v.substr(2)}
                else if(/[\s:][ad]$/.test(v)){var arr=v.split(/[\s:]+/);sortdir= arr.pop();v= arr.shift()}
                sortcol=this.store.meta.findField(v)
                if(sortcol){sortcol=sortcol.name}
            }
            if(sortcol){
                if(!(sortcol==this.sortcol&&this.sortdir==sortdir)){
                    if(!sortdir){sortdir=this.sortdir=="a"?"d":"a"}
                    this.sortcol=sortcol;this.sortdir=sortdir||"a"
                    sort=sortdir+":"+sortcol
                }
            }
            var v=first.filter  ;
            v=String(v)=="0"?"":v
            if(v!=null &&  v!=this.filter){filter=v||"_clear_"}
            //if(sort){this.store.sort(sort);this.sortcol=sort}
            if(filter!=null){
                this.filter= String(filter).trim()
                if(this.filter.charAt(0)=="("&&/\)$/.test(this.filter)&&this.filter.split("(").length==2){
                    this.filter=this.filter.replace(/^\(|\)$/g,"").trim()
                }
            }
            if(page||sort||filter){
                return true;
            }
            if( this.isCachedLocal==null && this.totalrows==this.store.size(true) && !this.filter){
                 this.isCachedLocal=true
            }
        },//pageno,sort,filter
            load:function(){},
            getVisibleRecordCount:function(){return this.getPageRecords().length},
            getPageRecords:function(){//page
                var vis=[]
                if( this.store && this.endrow && this.endrow>=this.startrow){
                    vis= this.store.records.slice(this.startrow-1,this.endrow)
                }  else{vis=this.store.records.slice()}
                return vis;

            },
            loadPage:function(callback){//pageno,sort,filter
                if(this.loadingPromise){
                    if(typeof(callback)=="function"){this.loadingPromise.then(callback)}
                    return this.loadingPromise
                }
                if(this.store){this.store.clear();}
                this.fire("pageloadstart")
                try{
                    var vis    , pr=   Promise.deferred() ,props=$.compact(this.properties.toMap(),true);
                    var timer=setTimeout(function(p){timer=0
                        this.fire("pageloadend")
                        if(this.loadingPromise&&this.loadingPromise===p){
                            this.loadingPromise.reject("timed out")
                            this.loadingPromise=null;
                            this.fire("pageloadend")
                        }
                    }.bind(this,pr),15000)

                    this.loadingPromise=pr

                    if(this.store && this.store.provider){
                        this.store.provider.load({page:props,store:this.store,pager:this}).then(function(data){
                                if(timer){clearTimeout(timer);this.loadingPromise=null}
                                var recs=data.data||data
                                if(data && data.page){
                                    this.update(data.page)
                                }
                                else if(recs.length){
                                    this.totalrows=recs.length
                                }
                                //dont load lookups again
                                if(this.includelookups==null || this.includelookups){
                                    this.includelookups=false;
                                }
                                this.fire("pageloadend")
                            }.bind(this),
                            function(){
                                this.fire("pageloadend")
                            }.bind(this)
                        ) ;
                        if(this.pagesize==-1){
                            this.isCachedLocal=true
                        }
                        var props=this.properties.toMap(),ths=this;
                        this.store.observer.once("dataloadcompleted",function(){
                            this.loadingPromise=null
                            pr.resolve(this.getList())
                        });
                    } else{
                        if(props.filter){
                            this.store.filter(props.filter);
                            var cnt=this.store.size()
                            this.totalrows=cnt;
                            this.pageno=1
                        }
                        if(props.sortcol ){
                            this.store.sort(props.sortcol);
                        }
                        this.loadingPromise=null
                        pr.resolve(this.getPageRecords())
                    }
                    pr.finally(function(recs){
                            this.loadingPromise=null
                            typeof(callback)=="function" &&callback.call(this,recs)
                            this.observer.fireAsync("pageloadend")
                        }.bind(this)
                    );
                } finally{
                    //this.observer.fireAsync("pageloadend")
                }
                return pr;
            },
            getPage:function(noload,callback){//pageno,sort,filter
                if(typeof(noload)=="function"){callback=noload;noload=false;}
                this.recalc()//.update.apply(this,arguments);

                if(typeof(callback)!="function"){callback=function(){}}
                var vis    , pr=   Promise.deferred()
                var props=this.properties.toMap();
                if(!(noload===true)  ){
                    pr=this.loadPage(callback)
                } else{
                    pr.resolve(this.getPageRecords())
                }

                return pr
            }
            ,makeMessage:function(st,end){  //this.totalrows=this.store.size();
            return "Page "+this.pageno+ " rows "+st + " to "+end+" of "+this.totalrows+(this.sortcol?(" sorted by "+this.sortcol):"")
        }
            ,toString:function(){var p= this.pageno ;
            return this.pagesize<0?"":this.makeMessage(((p-1) * this.pagesize)+1,((p) * this.pagesize))
        }

        });

    Active.Provider=Klass({
        store:null,loader:null,isLocal:true,defaultArgs:null,
        onInitialize:function(){ var ths=this;
            this.onpropertychange("loader",function(r){
                r.value.store=ths.store;

            })
        },
        getUniqValues:function(col){},//            if(this.pager.isCachedLocal){return this.getList(true).collect(col).uniq(String).sort()}
        getDataForUpdate:function(rec,forupdate){
            var data={},id,plainobj=$.isPlain(rec)
            if(rec){
                id=plainobj?rec.id:rec.get("id")
                if(forupdate&&typeof(rec.mod)=="function"){
                    var mods=rec.mod( )
                    if(mods.length){
                        for(var i= 0,ln=mods.length;i<ln;i++){
                            data[mods[i]]=rec.get(mods[i])
                        }
                    }
                }
                else{
                    data=( rec.toMap)?rec.toMap(true,true):(plainobj? $.clone(rec):rec)
                }
                delete data.id;
                if(id&&forupdate&&Object.keys(data).length){
                    data.id=id;
                }

            }
            if(!Object.keys(data).length){console.log("nothing to update");data=null}
            var isdate=$.is.date;
            $.each(data,function(v,k){
                if(isdate(v)){
                    data[k]=+v;
                }})
            return data
        },
        save:function(rec){
            if(rec&&rec.id>0){
                return rec._delete_?this["delete"](rec):this.update(rec)
            } else{return this.insert(rec)}
        },
        insert:function(rec){  },
        "delete":function(id){ },
        update:function(rec){   },
        getRecord:function(crit){   var p=Promise.deferred()
            if(crit&&!isNaN(crit)&&crit>0){
                crit='{"id":'+crit+'}'
            }
            this.load({criteria:crit,count:1,includelookups:false}).then(function(d0){var d=d0.data||d0;

                if(d&&d.length==1){d=d[0]}

                if(d){p.resolve(d)} else{p.reject("not found:"+crit)}
            })
            return p
        },
        getValue:function(id,col){   var p=Promise.deferred()
            var crit={id:id  ,field:col}

            this.load({criteria:crit,count:1 }).then(function(d0){var d=d0.data;
                if(d0&&d0.data&&typeof(d0.data)=="object"&&d0.data.length){d=d0.data[0]}
                if(d){p.resolve(d)} else{p.reject("not found:"+crit)}
            })
            return p
        },
        load:function(opns){
            //criteria,store,pager,callback
            var optns={}
            if(!opns || $.isPlain(opns)){
                Object.assign(optns,opns||{})
            } else {
             }
            if(arguments.length>1){
             }


            if(this.loadPromise&& this.loadPromise._state){$.handleEx("already in progress "+this.loadPromise._state)}
            this.loadPromise=Promise.deferred();



            var crit,args={},store=optns.store,pager=optns.pager ;
            delete optns.store;
            delete optns.pager;
            delete optns.callback
            if(pager && !optns.page){
                optns.page=pager.toMap? pager.toMap():pager
            }
            if(optns.criteria) {
                if (typeof(optns.criteria) == "number" && optns.criteria > 0) {
                    optns.criteria = "id=" + optns.criteria
                }
                else if (optns.criteria && (optns.criteria.criteria || optns.criteria.data || typeof(optns.criteria) == "string")) {
                    optns.criteria = Active.criteria.toCriteria(optns.criteria.criteria || optns.criteria.data || optns.criteria)
                }
            }
            if(store&&store.defaultCriteria){
                var defcrit=store.defaultCriteria;
                if(defcrit){
                    if(typeof(defcrit)=="function"){defcrit=defcrit(store)}
                    if(typeof(defcrit)=="string" && !/[\W]/.test(String(defcrit))){
                        defcrit=String(defcrit)
                        if(store.meta.findField(defcrit)){
                            var v=store.meta.findField(defcrit).defaultValue
                            if(v==null&&optns.criteria && optns.criteria[v]!=null){v=optns.criteria[v]}
                            if(typeof(v)=="function"){v=v(store)}
                            defcrit=defcrit+"="+ v

                        }
                    }
                    else{defcrit=Active.criteria.toCriteria(defcrit)}
                }
            }
            if(defcrit&&(!optns.criteria||(typeof(optns.criteria)=="string" && optns.criteria.replace(/\s+/g,"").indexOf(defcrit.replace(/\s+/g,"")==-1)))){
                optns.criteria=defcrit+(optns.criteria?(" and "+optns.criteria):"")
            }
             if($.isPlain(this.defaultArgs)){
                $.extend( optns,this.defaultArgs)
            }
            if(store&&$.isPlain(store.defaultArgs)){
                $.extend( optns,store.defaultArgs)
            }
             if(!optns.page &&pager){optns.page=$.compact(pager.properties.toMap(),true)}


            var entity=this.entity||((store||{}).meta||{}).name//,u=this.fixUrl(this.url)
            if(entity){
                optns.entity=entity;
            }
            if(optns.includelookups==null){
                optns.includelookups = true
            }
            var onload=function(pager,d){
                if(typeof(d)=="string"){

                }
                var res=d,page=d.page,data=d.data ;
                 if(d.mode=="list"){
                    data=[]
                    if(d.fields&&d.data&&d.data.length>0){var f=d.fields  ,ln2=f.length
                        for(var i=0,l=d.data,ln=l.length,r;r=l[i],i<ln;i++){
                            var rec={}
                            for(var i2=0,l2=r,c;c=l2[i2],i2<ln2;i2++){
                                (c||c===0)&&(rec[f[i2]]=r[i2]);
                            }
                            data.push(rec)
                        }
                    }
                    d.data=data
                }

                if(this.reader){
                    res=this.reader(d);
                }
                this.loadLoadCompleted(res,page)


                if(page&&pager){
                    pager.update(page)}
            }
            this.loadData(optns,onload.bind(this,pager))  ;
            if(typeof(optns.callback)=="function"){
                this.loadPromise.then(optns.callback)
            }
            return this.loadPromise;
            ;
        },
        loadX:function(args,doload,pager){
            if(this.loadPromise&& this.loadPromise._state){;
                $.handleEx("already in progress "+this.loadPromise._state)}
            this.loadPromise=Promise.deferred();
            this.observer.fire("loadstarted");
            var crit;
            if(args) {
                if (typeof(args) == "number" && args > 0) {
                    crit = "id=" + args
                }
                else if (args && (args.criteria || args.data || typeof(args) == "string")) {
                    crit = Active.criteria.toCriteria(args.criteria || args.data || args)
                }
            }
            if(this.store&&this.store.defaultCriteria){
                var defcrit=this.store.defaultCriteria;
                if(defcrit){
                    if(typeof(defcrit)=="function"){defcrit=defcrit(this.store)}
                    if(!/[\W]/.test(String(defcrit))){defcrit=String(defcrit)
                        if(this.store.meta.findField(defcrit)){
                            var v=this.store.meta.findField(defcrit).defaultValue
                            if(v==null&&args[v]!=null){v=args[v]}
                            if(typeof(v)=="function"){v=v(this.store)}
                            defcrit=defcrit+"="+ v

                        }
                    }
                    else{defcrit=Active.criteria.toCriteria(defcrit)}
                }
            }
            if(defcrit&&(!crit||(crit.replace(/\s+/g,"").indexOf(defcrit.replace(/\s+/g,"")==-1)))){
                crit=defcrit+(crit?(" and "+crit):"")
            }
            if(!args||typeof(args)!="object"){args={}}
            if(crit){args.criteria=crit}

            if(this.defaultArgs){
                $.extend( args,this.defaultArgs)
            }
            if(this.store&&this.store.defaultArgs){
                $.extend( args,this.store.defaultArgs)
            }
            this.loadData(args,doload,pager)  ;
            return this.loadPromise;
        },
        loadLoadCompleted:function(data){

            this.observer.fire("dataavailable",data);
            this.loadPromise && this.loadPromise.resolve(data);
            this.loadPromise=null;
        },
        loadData:function(args){throw new Error("not implemented - loaddata")},

        dataset:function(criteria){
            var args=typeof(criteria)=="string"?{criteria:criteria}:criteria
            return this.load(args);}
    });

    Active.Cookie=(function(){
        function createCookie(name,value,days) {
            var expires = ""
            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                expires = "; expires="+date.toGMTString();
            }
            document.cookie = name+"="+value+expires+"; path=/";
        }

        function readCookie(name) {
            var nameEQ = name + "=",ca = String(document.cookie).split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        }

        function eraseCookie(name) {createCookie(name,"",-1);}
        return {
            set:createCookie,
            get:readCookie,
            clear:eraseCookie
        }
    })();
    Active.LocalStorageProvider=Klass( Active.Provider,{
        type:null,storage:null,local:null,storekey:null,//local or session
        init:function(type){
            this.storekey="storekey_"+Date.now();
            this.storage=Data.Storage(this.type||"local")
            this.storage.setItem(this.storagekey,this.local={});
        },
        getUniqValues:function(col){var p=Promise.deferred();
            var res=this.store?this.store.getList(true).pluck(col).uniq():null
            p.resolve(res);return p

        },
        update:function(rec){
            var map=this.getDataForUpdate(rec,true),p=Promise.deferred();;
            if(!map){return}

            this.local[map.id]=map;
            this.storage.setItem(this.storekey,this.local)
            this.fire("data",{action:"update",record:rec})
            p.resolve(rec)
            return p
        },
        insert:function(rec){
            var map=this.getDataForUpdate(rec),id=rec.id||(Date.now()+Math.round(Math.random()*100)),
                p=Promise.deferred();
            if(!map){p.resolve(null)
                return p
            }
            this.local[id]=map;
            this.storage.setItem(this.storekey,this.local)
            rec.id=id
            this.fire("data",{action:"insert",record:rec})
            p.resolve(rec)
            return p
        },
        "delete":function(rec){
            var p=Promise.deferred();
            delete this.local[rec.id]
            this.storage.setItem(this.storekey,this.local)
            this.fire("data",{action:"delete",record:rec})
            p.resolve(rec)
            return p
        },
        persist:function(data0){
            var data=data0||(this.store?this.store.collect(function(it){return it.toMap(true)}):[])
            if($.isArray(data)){this.local=data.reduce(function(m,it){m[it.id]=it;return m;},{});}
            this.storage.setItem(this.storekey,this.local)



        },

        loadData:function(argmap,onload, pager){argmap=argmap||{}
            var al=this.storage.getItem(this.storekey);
            var alld= Object.keys(al).map(function(it){return al[it]})
            if(typeof(argmap.criteria)=="function"){alld=alld.filter(argmap.criteria)}
            //Active.Loader
            this.loadLoadCompleted(alld)
            if(typeof(onload)=="function"){onload(al)}
            return alld;
        },
        getRecord:function(id){ return Promise.resolve(this.local[id])}
    }) ;
    Active.readDataset=function(nm,data,config){  config=config||{}
        var  res={},ent//,pr=Promise.deferred();

        if(nm && typeof(nm)=="object"){data=nm;nm=config.name}
        if(typeof(data)=="string"){
            if(data.charAt(0)=="{"){
                res=Function("js","return eval(js)")("("+data+")");
            } else {
                res.rows=data.split(/\n/);
                res.datadef=res.rows.shift()
            }
        } else if(data){
            if(data.meta){   res.datadef=data.meta  }
            if(data.data){  res.rows=data.data }
            else if($.isArray(data)){res.rows=data}

        }
        var store=     config.store

        var pr=   Active.defineEntity(nm,res.datadef).then(
            function(ent){
                if(config.onMeta){config.onMeta(ent)}
                if(res.rows&&res.rows.length){
                    res.rows=res.rows.map(function(line,i){
                        return  (typeof(line)=="string" )?line.split(/,/) : line
                    });
                }
                if(!store && ent){
                    store=new Active.store(ent)
                    if(config.onStore){config.onStore(ent)}
                }
                if(typeof(config.callback)=="function") {pr.then(config.callback)}

                if(config.doadd){
                    if(store  && res.store && res.rows){
                        store.observer.once("dataloadcompleted",function(){pr.resolve(res)});
                        store.addAll(res.rows);
                    }
                }  else { pr.resolve(res)}
            }
        )



        return pr
    }

    Active.RandomDataProvider=Klass(Active.LocalStorageProvider,{
        store:null, random:null,
        init:function(store){if(store){this.store=store;}
            this.random||(this.random=Util.random.setup());
        },
        loadData:function(numberofrows,onload, pager){ numberofrows||(numberofrows=100);
            var fns=[],nms=[]  ;
            if(this.store){
                this.random||(this.random=Util.random.setup());
                this.store.meta.eachItem(function(c,nm){
                    var r,nm0=nm.toLowerCase(),fn= c.typeInfo.random
                    if(nm=="id"){r=(function(){var __counter=0;return function(){return ++__counter}})();}
                    else{ if(nm0!="name"&&/name$/.test(nm0)){nm0=nm0.replace(/name$/,"").replace(/\W/g,""); }
                        if(typeof(Util.random[nm0])=="function"){fn=Util.random[nm0]}
                        r=fn.bind(Util.random);
                        if(!r || r()==null){
                            r=function(){return ""} }
                    }
                    fns.push(r);nms.push(nm)
                });
                var rows=[],ln=nms.length
                while( --numberofrows>=0){   var d={}
                    for(var i=0;i<ln;i++){
                        d[nms[i]]=fns[i]();
                    }
                    rows.push(d)
                } ;
                // this.persist()
                if(typeof(onload)=="function"){onload(rows)}
                this.loadLoadCompleted(rows)

            }
        }
    });
    Active.UrlProvider=Klass(Active.Provider,{    resURL:null,entity:null,includelookups:null,
        url:null,PATH:null,store:null,reader:null, _lookupcache:{},
        "static.getBasePath":function(){
            return this.PATH||(this.PATH=location.href.split("/").slice(0,4).join("/")+"/");;
        },
        init:function( url,reader,onload){
            this.reader=reader;  this.isLocal=false
            if(!Data.workerservice){
                //Data.workerservice=$.services.ServiceImpl.asWorkerScript("js/DataService.js",["loaddata"])
            }
            if(typeof(onload)=="function"){
                this.on("load",onload)
            }
            this.setUrl(url)

            // if(this.store){this.store.pager.isCachedLocal=false}

        },
        setUrl:function(url){
            this.resURL=ResURL.from(url)
            if(!this.entity&&this.resURL.args.entity){this.entity=this.resURL.args.entity}
            this.url=this.resURL.url
            //if(this.PATH&&typeof(url)=="string"&&!/[^\w_]/.test(url)){url=this.PATH+"?entity="+url}
            // if(url){this.url=ZModule.ResourceURL.resolve(url)}
        },
        clearCache:function(){this._lookupcache={}},
        getUniqValues:function(col0){  var col=col0
            var promise=Promise.deferred();
            if(this._lookupcache&&this._lookupcache[col]){
                promise.resolve(this._lookupcache[col])}
            else{
                var meta=this.entity||((this.store||{}).meta||{}).name//,u=this.fixUrl(this.url)
                this.resURL.updateArgs({ entity:meta,columns:"distinct:"+col })
                var pr= this.resURL.load(),cache=this._lookupcache
                //  var pr= $.xhr.get(u,{args:{ columns:"distinct:"+col }}),cache=this._lookupcache;
                pr.then(function(d){var nm=col,lst=(d.data||d);
                    var res= $.isArray(lst)?lst.map(function(it){if(!(nm in Object(it))){nm=Object.keys(it)[0]}
                        return it[nm]||""}):null  ;
                    if(d.page){}
                    cache[col]=res
                    promise.resolve(res)
                })
            }
            return promise
        },

        loadData:function( args,onload){
            if(args&&args.page&&args.page.properties){
                args.page=args.page.properties.toMap()
            }
            if(args&&args.page&&args.page.filter){
                args.page.filter=String(args.page.filter).replace(/it\./g,"").replace(/\.IN\s*\(/," in (").replace(/IN\(\s*(\w+),/,function(a,b){return b+" in ("})
            }
             this.resURL.updateArgs(args)
            if(Data.workerservice){
                Data.workerservice.loaddata(this.resURL.build(),onload)
            }
            else{
                this.resURL.load(onload)
            }
        } ,
        insert:function(rec,store){
            var recuuid=null
            store=store||this.store
            if($.isPlain(rec)){

            } else if(rec.uuid) {recuuid=rec.uuid()}
            var pr=Promise.deferred()
            var data=this.getDataForUpdate(rec)
            if(!data){
                pr.reject("Nothing to insert")
            } else {

                this.resURL.updateArgs({entity: this.entity, save: 1})
                $.xhr.post(this.resURL.build(), {params: {data: data}}, function (rest) {
                    var nu, rec = rest.data || rest
                    if (rest ) {

                        this.observer.fireAsync("data", {
                            target: this,
                            type: recuuid ? "update" : "insert",
                            record: rec
                        });
                        /*this.store.observer.fireAsync("data", {
                         target: this,
                         type: recuuid ? "update" : "insert",
                         record: nu
                         });*/
                    }
                    pr.resolve(nu || rec)
                }.bind(this))
            }
            return pr
        },
        "delete":function(id){
            var pr=Promise.deferred(),rec
            if(id&&typeof(id)=="object"&&id.id){id=id.id}
            if(!(id&&id>0)){
                pr.reject("invalid record. A valid id is required")
            } else {
                this.resURL.updateArgs({entity: this.entity, del: 1,id:id})
                $.xhr.jsonp(this.resURL.build(), {params: {data: {id: id}}}, function (rest) {

                    this.observer.fireAsync("data",  {target: this, id:id,type: "delete"})
                    /*if (this.store) {
                     this.store.remove(id)
                     this.store.observer.fireAsync("data", {target: this, id:id,type: "delete"});

                     }*/
                    pr.resolve();
                }.bind(this))
            }
            return pr
        },
        update:function(rec){    var p=Promise.deferred()
            if(!rec||(rec.id==null||isNaN(rec.id))){
                p.reject("invalid record. A valid id is required")
                return p
            }
            var id=rec.id,recuuid=rec.uuid?rec.uuid():null
            var data=this.getDataForUpdate(rec,true)
            if(data){
                if(Object.keys(data).length<=1){console.log("nothing to save");
                    p.reject({error:"Nothins to update"})
                    return p
                }
                this.resURL.updateArgs({entity:this.entity,save:1})
                $.xhr.post(this.resURL.build(),{data:data},function(rest){
                        if(!rest||rest.error){
                            p.reject(rest?rest.error:"request failed")
                        } else{
                            if(recuuid){rec.update(rest)}
                            this.observer.fireAsync("data",  {record:rec,target:this,type:"update"})
                            // if(this.store){
                            //     this.store.observer.fireAsync("data",{record:rec,target:this,type:"update"});
                            // }
                        }

                        p.resolve(rec||data)
                    }.bind(this)
                );

            } else{p.reject({error:"Nothins to update"})}
            return p
        }
    });
    var storeproto = {
        loader: null,
        meta: null,
        optns: null,
        pager: null,
        provider: null,
        lastAdded: null,
        defaultCriteria: null,
        stats: null,
        proxyStore: null,
        proxyStoreFn: null,

        initialize:function(meta,optns){
            this.optns=optns||{}  ;
            if(meta){this.meta=meta;}
            this._idcounter=0;
            this.stats={deleted:[]}
            this.pager=new Active.pager(this)
            this._recordCtor=Active.Record.makeStoreTemplate(meta,function(rec){
                if(rec.name=="clear" || rec.name=="reset"){return}
                this.dispatchDataEv( "value", rec.object,rec );
            })
            this.dataRecordPrototype=this._recordCtor.prototype
            this.StoreRecordProto=this._recordCtor.prototype
            this.sorter=this.sorter||function(nm){
                    if(typeof(nm)=="function"){return nm}
                    var f=this.meta.findField(nm),t=f.typeInfo
                    return function(a,b){return t.compareTo(a.get(nm),b.get(nm))}
                }
            this.optns.reader||(this.optns.reader=function(meta,data){

                if(data && typeof(data)=="object"&&data instanceof this._recordCtor){
                    return data
                }
                var  nu=   this._recordCtor.newInstance( data) ;
                if(meta.autogenid && !Number(nu.id)){
                    if(!this._idcounter&&this.getList().pluck){
                        this._idcounter  =this.size()?this.getList().pluck("id").max():0
                    }
                    nu.id=++ this._idcounter
                }
                return nu
            }.bind(this,this.meta));



            //if(!this.records){this.records=List.create()}


            if(this.optns.chainable){
                this.records = List.create().chainable(this.dataRecordPrototype)
            } else {
                this.records=List.create()
            }
            var lst=this.records

            lst.setKeyProvider(function(rec){return rec.id})
            lst.config.finders={
                prop:function(prop,val){var p=prop,v=val;
                    return function(rec){return rec.get(p)==v}
                }
            }
            lst.config.reader={read:function(data){
                if(data && data.__record__){return data}
                return this.optns.reader(data)
            }.bind(this)}

            var ths=this

            this.onpropertychange("provider",function(r){
                if(!r.value){return}
                r.value.store=ths;
                if(this._recordCtor){this._recordCtor.prototype.provider= r.value}

                r.value.on("loadstarted",function(d){
                    //ths.clear();
                })

                r.value.on("dataavailable",function(d){
                    //if(!d) {return}
                    var data=d||{},pg,fields
                    if(d.data||d.rows){data= d.data||d.rows
                        pg= d.page
                        fields= d.fields
                    }
                    if(pg){ths.pager.update(pg)}
                    ths.addAll(data, d.mode)
                })
            },true) ;
            if(this.optns.provider){
                this.provider=this.optns.provider

            }
            if(!this.provider&&Data.servicePath){
                this.provider=this.meta.getProvider(true)
                this.provider.store=this
            }
            if(this.provider){
                //this.provider.store=this
                this.provider.on("data",function(ev){
                    this.handleDataEv(ev)
                }.bind(this))

            }
            if(this.optns && this.optns.loader){this.loader=this.optns.loader}
        },
        setupProxyStore:function(){
            if(this.proxyStore){
                this.properties.remove("records")
                delete this.records;
                this.properties.add("records",{
                    descriptor:true,
                    get:function(){
                        if(!this.proxyStore){return null}
                        return this.proxyStore.records.findAll(this.proxyStoreFn||function(a){return a})
                    },
                    set:function(){ }
                })
                this.properties.remove("provider")
                this.properties.add("provider",{
                    descriptor:true,
                    get:function(){
                        return this.proxyStore && this.proxyStore.provider
                    },
                    set:function(){ }
                })
            }
        },

        addExpr:function(nm,expr){this._recordCtor.prototype.addExpr(nm,expr);return this;},
        endBatch:function(){
            if(this.StoreRecordProto){this.StoreRecordProto.sharedState.BATCHMODE=false}
            // console.log("this.templateTuple.state.__resetmode",this.templateTuple.state.__resetmode)
            return this;
        },
        startBatch:function(){
            if(this.StoreRecordProto){this.StoreRecordProto.sharedState.BATCHMODE=true}
            // console.log("this.templateTuple.state.__resetmode",this.templateTuple.state.__resetmode)
            return this;
        },
        setOriginalList:function(list,assgn){
            if(assgn===true){
                this.__origrecords=list
            }
            else{
                this.getOriginalList().reset(list)
            }
        },
        renderRecords:function(template,callback){
            var p=(this.records.size()?this.records.first():this.StoreRecordProto).prepTemplate(template)
	        var res=[]
	        for(var i= 0,l=this.records,ln= l.length;i<ln;i++){
		        var r=l[i]
		        r.index=i
		        res.push(r.applyTemplate(p))
	        }
            if(typeof(callback)=="function"){
                callback.call(this,res);
            }
            return res;
        },
        getOriginalList:function(){
            if(!this.__origrecords){
                this.__origrecords=List.create()
            }
            return this.__origrecords
        },
        getList:function(orig){

            if(this.getOriginalList().size()<this.records.size()) {
                this.getOriginalList().reset(  this.records )
            }
            return orig===true && this.getOriginalList().size() ?this.getOriginalList():this.records
        },
        clear:function(a) {
            this.records.clear(a);
            this.__origrecords && this.__origrecords.clear(a);
        },
        filter:function(fn){var orig=this.getList(true),recs=this.getList()
            if(!orig.size()){orig.addAll(recs.toArray())}
            recs.clear()
            if(fn=="_clear_"||(arguments.length==1 &&  !arguments[0])) {recs.addAll(orig.toArray());return this}
            else{
                var f=orig.findAll.apply(orig,arguments);
                recs.addAll(f)
            }
            return this
        },

        size:function(totalsize){return this.getList(totalsize===true).size()},
        sort:function(nm,dir,nopagerupdate){
            if(typeof(dir)=="boolean"){nopagerupdate=dir;dir=""}
            var l=this.getList(true);
            if(nopagerupdate!==true && typeof nm=="string") {
                if (this.pager.sortcol && this.pager.sortcol === nm) {
                    dir = (this.pager.sortdir || 1) * -1;
                }
                this.pager.sortcol = nm;
                this.pager.sortdir = dir || 1;
            }
            if(!nm){return}
            if(!l.size()){return this}
            l.sort(this.sorter( nm));
            var rev=(dir=="d"||dir=="-"||dir=="0"||dir=="-1")
            if(rev){l.reverse()}
            l.forEach(function(it,i){it.viewindex=i})
            return this;
        },
        applySortAndFilter:function(pager,mode) {
            if(!(pager&&typeof(pager)=="object")){pager=null}
            pager=pager||this.pager
            if(pager && pager.isCachedLocal) {
                if (pager && pager.filter) {
                    this.filter(pager.filter)
                }
                if (pager && pager.sortcol) {
                    this.sort(pager.sortcol, pager.sortdir, true)
                }
            }
            return this
        },
        on:function(nm,fn,optns){
            if(typeof(nm)=="string"){var arr=[],type="data"
                if(nm.indexOf(":")>0){
                    arr=nm.split(":")
                    type=arr.shift()
                    nm=arr.join(":")
                }
                var idarr=nm.split(".")

                if(["value","update","insert","delete","add","load"].indexOf(idarr[0])>=0){
                    nm=idarr.shift()
                    var action=nm,cb=fn;
                    this.observer.on(type+(idarr.length?("."+idarr[0]):""),function(rec){
                        if(rec.action==action){
                            cb.call(this,rec)
                        }
                    },optns)
                    return this
                }

            }
            this.observer.on(nm,fn,optns)
        },
        addRecords:function(data0,mode){
            if(!data0){return}
	        var st=Date.now()
             var batchsize=200,data,startbatch=this.StoreRecordProto&&this.StoreRecordProto.sharedState.BATCHMODE;

            if(!data0){data=[]}
            else{if(data0.rows){data=data0.rows} else{data=data0.data||data0}
                if(data.rows){data=data.rows}
            }
            data=$.isArray(data)?data:[data];
            var origrecs=this.getList(true),ordered=[] ,nulst=[];;
            if(!origrecs.length){origrecs.push.apply(origrecs,this.getList().toArray().slice())}
            var idlist=origrecs.map(function(it){return String(it.id)})  ,
                idlist2=this.getList().map(function(it){return String(it.id)
                })
            //idlist.sort();
            var mod=0
            if(mode===true){
                this.getList().clear()
                nulst=data.slice()
            } else {
                //nulst=data.slice()
                for(var i=0, l=data, ln=data.length, r; r=l[i], i<ln; i++) {
                    var idx=idlist.indexOf (String (r.id));
                    if(r &&r.id&& idx>=0){
                        origrecs[idx].update(r);
                        if(origrecs[idx].mod().length){
                            mod=1
                        }
                    }
                    if(idlist2.indexOf (String (r.id)) == -1) {
                        nulst.push (r)
                    }

                }
            }

            //if no new records .. preserve the order of incoming data
            if(!nulst.length) {
                /*var nuid=data.map(function(it){return String (it.id)})
                 for(var i=0,l=nuid,ln=nuid.length,r;r=l[i],i<ln;i++){
                 var idx=idlist.indexOf(r);
                 if(  idx>=0){
                 ordered.push(origrecs[idx])
                 }else{ordered.push(data[i])}
                 }
                 var nuid2=ordered.map(function(it){return String (it.id)})
                 if(nuid2.toString()!=nuid.toString()) {
                 mod=1
                 this.getList().reset(ordered);
                 this.lastAdded = this.getList().last()
                 }*/

            }else{
                mod=1
                if( this.optns.loadasync && nulst.length>batchsize){
                    var lst=nulst   ;
                    if(!startbatch){this.startBatch();}
                    var dd= nulst.slice(),tot=dd.length,bnd=function(lst,remaining,last){
                        this.getList().addAll(lst );
                        this.observer.fireAsync("dataloadprogress",{total:tot,pending:remaining,processed:tot-remaining,perc:((tot-remaining )/tot)*100});
                        if( last===true){ data=  this.getList().last() ;
                            this.endBatch()
                            this.dispatchDataEv("load",data );
                            this.fire("datasetModified","load");
                            this.fire("dataloadcompleted");
                            this.getList(true).reset(this.getList().slice());
                             return 0
                        }

                    }.bind(this )
                    var f=$.debounce(bnd,true);
                    var last=dd.pop()
                    if(this.pager.pagesize>0){bnd.call(this,dd.splice(0,this.pager.pagesize+10),dd,false) }
                    while(dd.length){f(dd.splice(0,batchsize),0,false)}
                    f([last],0,true);
                     return this
                } else {
                    if( nulst.length){
                        if(startbatch){this.startBatch();  }
	                    var lst=this.getList()
                        this.lastAdded=lst.addAll(nulst).last()
                         if(startbatch){this.endBatch()}
                    }
                }
            }
            this.getList().getObserver().on("clear",function(r){

            })

            if(mod) {

                var mode=nulst.length > 1 ? "load" : (nulst.length ? "insert" : "update")
                this.dispatchDataEv(mode,this.lastAdded );
                this.fire("datasetModified", "load");
                this.fire("dataloadcompleted");
            }
            return this;
        },
        handleDataEv:function(ev){
            var store=this,nu,  record=ev.record||{},id=ev.id||record.id

            if(id){
                nu= store.find( id)
            }
            if(ev.type=="delete"){
                if(ev.id){var deleted=store.stats.deleted||[]
                    var rem=deleted.find(function(r){return r && r.id==ev.id})
                    if(rem){deleted.splice(deleted.indexOf(rem),1)}
                    else{
                        store.dispatchDataEv("delete",nu );
                    }
                }
                nu && store.records.remove(nu)
                return
            }
            if(ev.type=="insert"){
                if(!nu){
                    store.add(record)
                    nu=store.lastAdded
                } else {
                    nu.update(record)
                    nu.id=record.id
                }

            }
            if(id > 0 && record){
                record.id=id
            }
            nu && nu.update( record);
            if(id > 0 && nu){
                nu.id=id
            }
            nu && nu.resetStatus()
        },
        dispatchDataEv:function(type,record,evrecord){
            this.fire("data", {
                action: type,type: type,
                record: record,datarecord:evrecord
            });
        },
        addAll:function(data,mode){
            return this.addRecords(data,mode);

        },
        load:function( ){
            var a=[].slice.call(arguments);
            var optns={},callback
            if(typeof(a[a.length-1])=="function"){callback= a.pop()}
            if(!a.length){
                optns={}
            }
            else if(a.length==1){
                if($.isPlain(a[0])){optns=a[0]}
                else if(a[0]===true){optns.includelookups=false}
                else if(typeof(a[0])==="string"){optns.criteria=a[0]}
                else if(typeof(a[0])==="number"){optns.criteria="id="+a[0]}
            } else {
                alert("args")


            }
             var p=optns.pager||this.pager,pr;
            if(callback){optns.callback=callback}
            if(optns.includelookups==null && this.includelookups!=null){
                optns.includelookups= this.includelookups;
            }
            if(optns.includelookups==null && p && p.includelookups!=null){
                optns.includelookups= p.includelookups;
            }
            optns.store=this;
            if((!this.provider && !optns.criteria && p && p.pagesize!=-1  && p.getPage) ){
                pr=p.getPage()
             } else if(this.provider){
                if(p && p.properties && p.properties.toMap){
                    optns.page=p.properties.toMap()
                }
                pr=this.provider.load(optns);
            }
            return pr;
            //return this.provider?this.provider.load(data,doload):null
        },

        getMods:function(){
            return this.stats.deleted.concat(this.getList(true).findAll(function(a){return a && a.mod()}))
        },
        hasMods:function(){
            return this.getMods().length;
        },
        remove:function(data,nostats){
            var id=data.id||data
            var rec=this.findById(id)
            if(rec&&!nostats){
                this.getList().remove(rec)
                this.getList(true).remove(rec)
                if(this.stats.deleted && this.stats.deleted.indexOf(rec)==-1) {
                    rec.__deleted=true;
                    this.stats.deleted.push(rec)
                }
            }
            this.applySortAndFilter()
            this.dispatchDataEv( "delete", rec );
            return this;
        },
        addRecord:function(data,pos){
            var id=data.id
            this.add(data,pos);
            if(id){return this.findById(id)}
            return this.lastAdded;
        },
        add:function(data,pos){
            if(data && data.id){
                var rec=this.findById(data.id)
                if(rec){
                    rec.update(data)
                    this.applySortAndFilter()
                    return this;
                }
            }
            return this.addRecords([data]);
        },
        update:function(rec,data){
            if(rec===true){rec=this.lastAdded}
            if(rec && rec.update&&data&&typeof(data)=="object"){
                rec.update(data);
                this.applySortAndFilter()
                this.dispatchDataEv( "update", rec );
            }
        },
        findById:function(id,onlyvis){
            return this.records.findById(Number(id))
        },
        clone:function(){
            var nu=new Data.store(this.properties.toMap());
            nu.setOriginalList(this.getList(true).clone(true))
            nu.records=this.getList().clone(true)
            return true;
        },
        findBy:function(nm,val,onlyvis){var k=nm
            var col=this.meta?this.meta.findField(nm):null
            if(col){k=col.name}
            var fn=typeof(val)=="function"?val:function(it){return  it && it[k]==val}
            return this.getList(!onlyvis).find(fn);
        }
    }
    var returnself = ["each", "clear"];
    [ "first", "last", "each", "groupBy", "collect", "find", "findAll"].forEach(function(a) {
        try {
            storeproto[a] = Function("var res=this.getList()['" + a + "'].apply(this.getList(),arguments);return " + (returnself.indexOf(a) >= 0 ? "this" : "res"))
        } catch (b) {}
    })

    Active.store = Klass(storeproto)

    Active.store.createFilteredClone = function(a, b) {
        $.fnize(b)
    }

     context.TypeInfo = TypeInfo;
    var Storage = function() {
        function a(a) {
            var b = a;
            return null == b ? b : (b && "object" == typeof b ? isNaN(+b) ? "function" == typeof(b.toJson || b.toJSON) ? b = (b.toJSON || b.toJson)() : ("function" == typeof b.toMap && (b = b.toMap()), Object.keys(b).forEach(function(a) {
                "function" == typeof b[a] && (b[a] = "FN|" + b[a].toString())
            }), b = JSON.stringify(b)) : b = +b : "function" == typeof b && (b = "FN|" + b.toString()), b)
        }

        function b(a) {
            var b = a;
            if (b && "string" == typeof b) {
                var c = b.charAt(0),
                    d = b.charAt(b.length - 1);
                "[" == c && "]" == d || "{" == c && "}" == d ? b = JSON.parse(b) : (0 == b.indexOf("FN|") || 0 == b.indexOf("function")) && (b = b.replace(/^FN\|/, ""), b = (1, eval)("(" + b + ")"))
            }
            return b
        }

        function c(a) {
            return a
        }

        function d() {
            var a = [],
                b = [],
                c = void 0;
            return {
                getItem: function(d) {
                    if (!d) return c;
                    var e = a.indexOf(d);
                    return e >= 0 ? b[e] : c
                },
                removeItem: function(a) {
                    return this.setItem(a)
                },
                setItem: function(d, e) {
                    if (!d) return c;
                    var f = e,
                        g = a.indexOf(d),
                        h = c;
                    if (g >= 0) {
                        if (h = b[g], h === f) return h;
                        if (f === c) return a.splice(g, 1), b.splice(g, 1), this.length = a.length, h
                    } else g = (this.length = a.push(d)) - 1;
                    return b[g] = f, h
                },
                has: function(b) {
                    return a.indexOf(b) >= 0
                },
                key: function(b) {
                    return a[0 > b ? this.length + b : b]
                },
                clear: function() {
                    a.length = 0, b.length = 0
                },
                length: 0
            }
        }

        function e(a, b, e, f) {
            var g = e || c,
                h = f || c,
                i = b || c,
                j = a || d(),
                k = {}, l = {}.dummyundefined,
                m = "function" == typeof j.has ? "has" : "contains" == typeof j.has ? "contains" : null,
                n = {
                    getItem: function(a) {
                        return h(j.getItem(i(a)))
                    },
                    removeItem: function(a) {
                        return this.setItem(a)
                    },
                    setItem: function(a, b, c) {
                        var d = i(a),
                            e = g(b),
                            f = d ? j.setItem(d, g(b)) : null;
                        if (!c && d && e !== l && f !== e)
                            for (var h = [].concat(k[d] || [], k["*"] || []).filter(function(a) {
                                return !a.cond || a.cond(d, e, f)
                            }); h.length;) h.shift().callback(d, e, f);
                        return f
                    },
                    key: function(a) {
                        return j.key(a)
                    },
                    on: function() {
                        var a, b = arguments[0],
                            c = arguments[2],
                            d = arguments[1];
                        "function" == typeof b && (c = d, d = b, b = ""), "function" == typeof d && (a = b ? i(b) : "*", k[a] || (k[a] = []), k[a].push({
                            callback: d,
                            cond: c
                        }))
                    },
                    clear: function() {
                        j.clear()
                    },
                    collect: function(a, b) {
                        for (var c, d = [], e = j, f = 0, g = this.length; c = e.key(f), f++; g > f) d.push(a.call(b, e.getItem(c), c));
                        return d
                    },
                    contains: function(a) {
                        return m ? j[m](a) : !(this.getItem(a) === l)
                    },
                    each: function(a, b) {
                        for (var c, d = j, e = 0, f = this.length; c = d.key(e), e++; f > e) a.call(b, d.getItem(c), c)
                    }
                };
            return $defineProperty(n, "length", {
                get: function() {
                    return j.length
                },
                set: function() {},
                configurable: !1,
                enumerable: !1
            }), n
        }
        var f = {
            local: window.localStorage,
            session: window.sessionStorage
        }, g = {};
        return function(c, d) {
            var h, i = String(c);
            return i = "sessionStorage" == i ? "session" : "local", h = !! f[i], h ? g[i] || (g[i] = e(f[i], d, h ? a : null, h ? b : null)) : e(null, d, null, null)
        }
    }();
    context.Storage = Storage, context.Storage.local = function(a) {
        var b = Storage("local");
        return a && "string" == typeof a ? 2 == arguments.length ? (b.setItem(a, arguments[1]), b) : b.getItem(a) : b
    }
    context.Storage.session = function(a) {
        var b = Storage("session");
        return a && "string" == typeof a ? 2 == arguments.length ? (b.setItem(a, arguments[1]), b) : b.getItem(a) : b
    }
    context.DB = function() {
        function a(a, b) {
            var c = _promise();
            return "function" == typeof a && c.then(a, b), c
        }

        function b(a) {
            var b = a,
                c = {
                    impl: b,
                    count: function() {
                        return b._count.apply(b, arguments)
                    },
                    size: function() {
                        return b._count.apply(b, arguments)
                    },
                    getKeys: function() {
                        return b._getKeys.apply(b, arguments)
                    },
                    get: function() {
                        return b._get.apply(b, arguments)
                    },
                    put: function() {
                        return b._put.apply(b, arguments)
                    },
                    "delete": function() {
                        return b._remove.apply(b, arguments)
                    },
                    clear: function() {
                        return b._clear.apply(b, arguments)
                    },
                    hasIndex: function() {
                        return !1
                    },
                    iterate: function() {},
                    query: function() {},
                    makeKeyRange: function() {}
                };
            return c.batch = function(a, b) {
                var c = b,
                    d = a,
                    e = [].slice.call(arguments),
                    f = ($.isArray(e[0]) ? e.shift() : null, [].concat(e || [])),
                    g = function(a, b, e) {
                        return c._batch(a, b, e), d
                    };
                return g.set = function(a, b, c, d) {
                    var e = [].concat.apply(f, [].slice.call(arguments));
                    return f.length = 0, [].push.apply(f, e.map(function(a) {
                        if (!b) return a;
                        var c = {
                            type: b
                        };
                        return "object" != typeof a ? c.key = a : c.value = a, c
                    })), g(f, c, d)
                }, g.put = function(a, b, c) {
                    return this.set(a, "put", b, c)
                }, g.remove = function(a, b, c) {
                    return this.set(a, "remove", b, c)
                }, g.get = function(a, b, d) {
                    return c._getBatch(a, b, d)
                }, g
            }(c, b), c
        }

        function c(c, e, f) {
            [].slice.call(arguments);
            f = "function" == typeof f ? f : function() {};
            var g = a(f);
            if (!d) {
                "number" == typeof e && (e = {
                    version: e
                });
                var h = "https://github.com/firien/IndexedDB-polyfill/blob/index_fix/indexedDB.polyfill.js",
                    h = "js/IDBStore.js",
                    i = {
                        storeName: c,
                        storePrefix: "IDBWrapper-",
                        dbVersion: 1,
                        keyPath: "id",
                        autoIncrement: !0,
                        indexes: [],
                        onStoreReady: function() {
                            g.resolve(this.db)
                        },
                        onError: function(a) {
                            throw a
                        }
                    };
                return Object.keys(i).forEach(function(a) {
                    e[a] = e[a] || i[a]
                }), ZModule.register("IDBStore", h).process().promise.then(function() {
                    d = {
                        db: new IDBStore(e)
                    }, d._put = function() {
                        var b, c, d, e = [],
                            f = {}, g = [].slice.call(arguments),
                            h = g.length;
                        return "function" == typeof g[h - 1] && (f.success = g.pop()), "function" == typeof g[h - 1] && (f.error = g.pop()), 2 == g.length && (d = g.shift()), c = g.shift(), c && !d && (d = c.id || c.key), d && (e.push(d), delete c.id, delete c.key), b = a(f.success, f.error), e.push(c, b.resolve, b.reject), this.db.put.apply(this.db, e), b
                    }.bind(d), d._count = function(b, c, d) {
                        var e = a(c, d);
                        return this.db.count(e.resolve, e.reject), e
                    }, d._get = function(b, c, d) {
                        var e = a(c, d);
                        return this.db.get(b, e.resolve, e.reject), e
                    }, d._getKeys = function() {}, d._getAll = function(b, c) {
                        var d = a(b, c);
                        return this.db.getAll(d.resolve, d.reject), d
                    }, d._remove = function(b, c, d) {
                        var e = a(c, d);
                        return this.db.remove(b, e.resolve, e.reject), e
                    }, d._clear = function(b, c) {
                        var d = a(b, c);
                        return this.db.clear(d.resolve, d.reject), d
                    }, d._batch = function(b, c, d) {
                        var e = a(c, d);
                        return this.db.batch(b, e.resolve, e.reject), e
                    }, d._getBatch = function(b, c, d, e) {
                        var f = a(c, d);
                        return this.db.getBatch(b, f.resolve, f.reject, e), f
                    }, g.resolve(b(d))
                }), g
            }
        }
        var d = window.indexedDB;
        return {
            open: function() {
                return c.apply(this, arguments)
            },
            createStore: function(a) {
                return c.apply(this, [a, 1].concat([].slice.call(arguments, 1)))
            },
            close: function() {}
        }
    }


})(self.Data = {});
