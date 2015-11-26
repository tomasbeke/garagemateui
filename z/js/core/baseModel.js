$.observable = function() {

}
$.observable.prototype={
    _ensureInner:function(){
        if(!this.__inner__){
            Object.defineProperty(this,"__inner__",{value:{data:Object.create(null),modcount:0,config:{} },enumerable:false,writable:false,configurable:true})
         }
        this.__inner__.config||(this.__inner__.config={});
        return this.__inner__
    },
    scanProps:function(){
        var C=this._ensureInner().config
        if(C.observing && C.observing.scan){
            C.observing.scan();
        }
        return this
    },
    observeSelf:function(){
        var C=this._ensureInner().config
        if(C.observing){return}
        var ths=this,ignore=[],data=this.__inner__.data
        ignore=Object.getOwnPropertyNames(this).filter(function(k){return  (typeof(ths[k])=="function" || k.indexOf("_")==0)})
        ignore.push("__inner__", "constructor","prototype","__proto__","___toignoreforobserve","set","get")
        C.ignoreprops=ignore.slice()
        if(data && Object.keys(data).length){
            Object.keys(data).forEach(function(k){
                if(ignore.indexOf(k)==-1 && typeof(this[k])=="undefined"){this[k]=data[k]}
            },this);
        }
        this.__inner__.data=this;
        this.___toignoreforobserve=ignore
        Object.observe(this,function(recsarg){
            if(recsarg && recsarg.length){
                var recs=recsarg.slice(),names=recs.map(function(a){return a.name});
                var torem=[]//remove dups and pick latest
                for(var i= 0,ln=names.length;i<ln;i++){
                    var prev=names.indexOf(names[i])
                    if(prev<i){
                        torem.push(recs[prev])
                    }
                }
                while(torem.length){
                    var idx=recs.indexOf(torem.shift()); idx>=0 && recs.splice(idx,1);
                }
                for(var i= 0,ln=recs.length;i<ln;i++){
                    var rec=recs[i],O=(rec||{}).object
                    if(!rec || !rec.name || rec.type=="delete" || !O || !O.__inner__ || !O.__inner__.config || (O.__inner__.config.ignore||[]).indexOf(rec.name)>=0 || !O.__inner__.config.observing ){return}
                    var V=O[rec.name];
                    O._dispatch({name:rec.name,value:V,newValue:V,oldValue:rec.oldValue,object:O})
                }
            }
         });
        delete this.___toignoreforobserve;
        C.observing=Object.getNotifier(this)
        C.observing && C.observing.scan && C.observing.scan()
    },
    setConfig:function(nm,val){this._ensureInner().config[nm]=val},
    getConfig:function(nm){return this._ensureInner().config[nm]},
    preprocess:function(nm,val){
        return val
    },
    toMap:function(){
        var C=this._ensureInner().config
        var d={}
        if(C.observing) {
            this.scanProps()
            var ignore=C.ignore
            Object.keys(this._ensureInner().data).forEach(function (k) {
                if (ignore.indexOf(k) == -1) {
                    d[k] = this[k]
                }
            }, this)
        } else{
            d=Object.assign({},this._ensureInner().data);
        }
        return d
    },
    get:function(nm){nm=this._fixname(nm)
        var D=this._ensureInner().data;
        return D[nm]
    },
    _fixname:function(nm){
        if(this._ensureInner().config.caseinsentive){
            var lc=String(nm||"").toLowerCase()
            if(lc!==nm){
                nm=lc;
            }
        }
        return nm
    },
    _dispatch:function(R,inner){
        inner=inner||this._ensureInner()
        if(!R || !R,name || !inner || !inner.listeners ){
            return
        }
        var  nm= R.name,listeners=inner.listeners,L=listeners[nm],ln2
        inner.modcount++;
        if(L && (ln2=L.length)) {
            if (ln2 === 1) {  L[0].call(this, R)  }
            else {
                for (var i = 0; i < ln2; i++)   L[i].call(this, R)
            }
        }
        if((L=listeners["*"]) && (ln2=L.length)) {
            if (ln2 === 1) {  L[0].call(this, R) }
            else {
                for (var j = 0; j < ln2; j++)    L[j].call(this, R)
            }
        }
    },
    set:function(nm,val){
        nm=this._fixname(nm)

        if(typeof(val)==="undefined" && nm && typeof(nm)=="object"){
            $.each(nm,function(v,k){this.set(k,v)},this);
            return this
        }
        var inner=this._ensureInner(),D=inner.data ;
        var C=inner.config
        if(C && C.ignoreprops && C.ignoreprops.indexOf(nm)>=0){
            return
        }
        var curr=D[nm]
        val=this.preprocess(nm,val,curr)
        if(!(nm in D)){D[nm]=undefined;}//add a value first
        if(curr!=val){
            D[nm]=val;
            if(D===this||(C&&C.observing)){
                return curr
            }
           this._dispatch({name:nm,value:val,newValue:val,oldValue:curr,object:this},inner)
        }

        return curr
    },

    onchange:function(nm,fn){
        if(typeof(nm)=="function"){fn=nm;nm="*"}
        nm=this._fixname(nm)
        var inn=this._ensureInner()
        if(!inn.listeners){inn.listeners={}}
        if(!inn.listeners[nm]){    inn.listeners[nm]=[]}
        inn.listeners[nm].indexOf(fn)==-1 && inn.listeners[nm].push(fn)
     }
}
$.baseModel = function() {
    var UUIDCOUNTER=0
    function update1(a) {
        if (2 == arguments.length && "string" == typeof a) this.setItem(a, arguments[1]);
        else if ($.isPlain(a)){
            var onlyupdate=arguments[1]===true, keys=this.keys(),isplain= $.isPlain(a)
            for (var b in a) {
                if(onlyupdate && keys.indexOf(b)==-1){continue}
                if(!a.hasOwnProperty(b)){continue}
                var val=a[b];
                if(curr && curr.__model){
                    var curr=this.getItem(b, a[b])
                    var mapval=val
                    if(val && val.__isModel){this.setItem(b, val)}
                    else if($.isPlain(val)){
                        curr.update(mapval,onlyupdate)
                    }else if(val && val.toMap){
                        curr.update(val.toMap(),onlyupdate)
                    }

                } else {
                    this.setItem(b, val)
                }
            }

        }
        return this
    }
    function isDescriptor(obj){
        if(obj && $.isPlain(obj) && Object.keys(obj).length){
            if(obj.descriptor||obj.expr){return true}
            if(obj.name ||obj.type ||obj.typeInfo ||obj.defaultValue||obj.renderer||obj.reader ||obj.format||typeof(obj.get)=="function"){
                return true
            }
        }
    }
     function resolveExpr(a) {
        var b = this.toMap();
        if ("function" == typeof a) return a.call(this, b);
        var c = b,
            d = a;
        if ("string" == typeof a) {
            if (this.hasProperty(d)) return this.getItem(d);
            if (d in this && "function" == typeof this[d]) return this[d].call(this);
            if (!/[\s\+\-\*\\\(]/.test(a))
                if (a.indexOf(".") > 0) {
                    var e = a.split(".");
                    d = e.pop(), c = e.reduce(function(a, b) {
                        return a && "object" == typeof a ? (null == a[b] && (a[b] = {}), a[b]) : null
                    }, b)
                } else {
                    var a = $.parseExpr(a);
                    if (a) return a.call(this, map)
                }
            if (c && "object" == typeof c) return d in c && "function" == typeof c[d] ? c[d].call(c) : c[d]
        }
    }
    function toMap(model,compact,deep,loopchk){
        if(!model){return null}
        if(!(loopchk && loopchk.items)){loopchk={lvl:0,items:[]}}
        var res={}
        model && model.keys().forEach(function(name){
            var val =model.getItem(name)
            if(deep && val && typeof(val)=="object"){
                if(loopchk.items.indexOf(val)>=0 ){return null}
                loopchk.items.push(val)
                loopchk.lvl++
                val=isModel(val)?toMap(val,compact,deep,loopchk):val
                loopchk.lvl--
            }
            if(compact && val==null){return}
            res[name]=val
        })
        return res
    }
     function addexpr(nm,expr,optns) {
        var vars=[],haspath={},unres=[],fn
        if(typeof(expr)=="function"){
            fn=expr;
            if(!(optns && optns.vars) ){

                if(bdy.indexOf("[native code]")==-1){

                } else{
                    bdy=null
                }
            } else {
                vars=optns.vars||[]
            }

        } else if(typeof(expr)=="string"){
            bdy=expr


        }
        if(!fn && !bdy){return}
        var keys=this.keys();
        if(!vars.length && bdy){
            var reserved=$.parseUtil.reservedWords,bdy=$.fn.getBody(expr);
            vars=(bdy.match(/[\w\._]+/g)||[]).filter(function(a){return a.indexOf(".")!=0 && reserved.indexOf(a)<0}).map(function(a){var arr= a.split("."),nm= arr.shift();
                if(arr.length){haspath[nm]=a}
                return nm
            });
            unres=vars.filter(function(k){return keys.indexOf(k)<0 && !self[k]})
            vars=vars.filter(function(k){return keys.indexOf(k)>-1})
        }
        var ctx={name:nm,vars:vars||[],haspath:haspath,unres:unres||[],fn:fn,bdy:bdy,lastval:null}
        if(!fn && bdy){
            try{
                ctx.args=ctx.vars
                ctx.fn=Function(vars.join(","), "return "+bdy)
            } catch(e){

            }
        } else if(fn){
            ctx.recordAsArg=true
            ctx.args=["it"]
        }
        if(!ctx.fn){return}
        var toret=(function(cx){
            if(cx.recordAsArg){
                return function(rec){
                    var record=(rec!=null && typeof(rec)=="object")?rec:this
                    var r=cx.fn.call(record,record),old=cx.lastval;
                    if(r!=cx.lastval){cx.lastval=r;
                        record.firePropertyChangeEv({name:cx.name,value: r,newValue: r,oldValue: old})
                    }
                    return r;
                }
            }
            return function(rec){var _=[],C=cx,record=(rec!=null && typeof(rec)=="object")?rec:this
                for(var i= 0,ln=C.args.length;i<ln;i++){
                    var nm=C.args[i],v=record.getItem(nm);
                    if(v==null && C.haspath[nm]){v={}}
                    _.push(v)
                }
                var r=C.fn.apply(this,_),old=C.lastval;
                if(r!=C.lastval){C.lastval=r;
                    record.firePropertyChangeEv({name:C.name,value: r,newValue: r,oldValue: old})
                }
                return r;
            }
        })(ctx);

        toret.data=ctx;
        ctx.exprFn=toret;
        this.addProperty(nm,{descriptor:true,get:toret,set:function(){}})
        this.onchange(ctx.vars.join(" "),function(){
            ctx.exprFn(this)
        })
        return toret;
    }
    function onchangeHandle(M, rec ) {

                var  nm=rec.name,T=rec.type
                if (nm == M.name || T=="remove"|| T=="delete") {
                    return
                }
                var V = rec.newValue || rec.value
                if(V==null && T=="add"){return}
                if (V === undefined && rec.object) {
                    V = rec.newValue = rec.value = rec.object[nm]
                }

                if (M.proxyfields.indexOf(nm) >= 0 && M.valCache[nm] !== V) {
                    M.valCache[nm] = V
                    this.firePropertyChangeEv(rec)
                }
      }

    function linkProps_onchange(meta,nu) {
        if(meta.delegate && meta.changehandle) {
            if (isModel(meta.delegate)) {
                meta.delegate.onchange("*", meta.changehandle, false)
                //meta.delegate.onchange("**", meta.changehandleall, false)
            } else if(Object.unobserve){
                Object.unobserve(meta.delegate,meta.changehandle)
            }
            meta.changehandle=null
            //meta.changehandleall=null
        }
        if(!nu){return}
        if(isModel(nu)){
            //nu.onchange("*",meta.onchangeHandle=function(M,recs) {
            //     recs && recs.length && this.firePropertyChangeEv({name:"**",value:recs,newValue:recs,oldValue:null,object:recs[0].object,type:"list"})
            // }.bind(this,meta))
            nu.onchange("*",meta.changehandle=onchangeHandle.bind(this,meta));
        } else{
             Object.observe(nu,
                meta.changehandle=function(M,recs) {
                    recs && recs.length && this.firePropertyChangeEv({name:"**",value:recs,newValue:recs,oldValue:null,object:recs[0].object,type:"list"})
                    for(var i= 0,ln=recs.length;i<ln;i++){
                        onchangeHandle.call(this,M,recs[i])
                    }
                }.bind(this,meta)
            ,["update"])
        }
    }
    function isModel(obj) {
        return obj && (obj.__model ||obj.__record__ ||obj.__isModel ||obj.isModel) && typeof(obj.get)=="function";
    }
    var modelDelegates=(function modelDelegates() {
        function _setupDelegate(propname,optns){
            var delegate = this.get(propname) , meta;
            var C=this.getConfig();
            if(!C){return}

            C.__proxydelegates || (C.__proxydelegates = {});
            if(!C.__proxydelegates[propname]){
                C.__proxydelegates[propname] = {name: propname, proxyfields: [], valCache: {}} ;
                C.__proxydelegates[propname].refresh=_refresh
            }
            meta=C.__proxydelegates[propname]
            _linkProps.call(this, meta, delegate, optns )
            if(meta.propchangehandle){
                this.onchange(propname,meta.propchangehandle,false);
            }
            this.onchange(propname,meta.propchangehandle=function(a) {
                _linkProps.call(this,meta,a.value || a.newValue,optns)
            });
        }
        function _linkProps(meta,delegate,optns){
            if (! delegate || (meta.delegate && delegate === meta.delegate && meta.processed)) {
                return
            }
            linkProps_onchange.call(this,meta)
            meta.delegate = delegate;

            var propname=meta.name,ths=this,fields=isModel(delegate)?delegate.keys():Object.getOwnPropertyNames(delegate)
            var mthd=delegate.get?"get":(delegate.getItem?"getItem":null)
            var setmthd=delegate.set?"set":(delegate.setItem?"setItem":null)
            var writable=optns && optns.writable
            for(var i= 0,ln=fields.length;i<ln;i++){
                var a=fields[i]
                if(a==propname){
                    continue
                }
                var D=this.getDescriptor(a)
                if(D && D.proxied && D.get){
                    continue
                };
                meta.proxyfields.indexOf(a)==-1 &&  meta.proxyfields.push(a);


                this.addProperty(a, {
                    descriptor: !0,
                    proxied:true,
                    get: (function(fld,prop){
                        return function(){
                            var dlg=this.getItem(prop) ;
                            if(dlg ){
                                return mthd && dlg[mthd]?dlg[mthd].call(dlg,fld):dlg[fld]
                             }
                        }
                    })(a,propname),
                    set: writable?(function(fld,prop){
                        return function(val){
                            var dlg=this.getItem(prop) ;
                            if(dlg ){
                                var D=this.getDescriptor(prop),curr=mthd && dlg[mthd]?dlg[mthd].call(dlg,fld):dlg[fld]
                                if(D.___raw==val||curr==val){
                                    return
                                }
                                D.___raw=val
                                return setmthd && dlg[setmthd]?dlg[setmthd].call(dlg,fld,val):(dlg[fld]=val);
                            }
                        }
                    })(a,propname):function(){}
                })
            }

            if(meta.proxyfields.length) {
                meta.processed = true
            }
            meta.refresh.call(this,meta)
            linkProps_onchange.call(this,meta,delegate)
        }
        function _refresh(M){
            if(M.proxyfields && M.proxyfields.length&& M.delegate){
                var delegate=  this.getItem(M.name),recs=[];
                if(!(delegate || typeof(delegate)=="object")){return}
                var mthd=delegate.get?"get":(delegate.getItem?"getItem":null)
                for(var i= 0,ln= M.proxyfields.length;i<ln;i++){
                    var nm=M.proxyfields[i],
                        v =mthd?delegate[mthd].call(delegate,nm):delegate[nm],
                        old=M.valCache[nm]
                    if(v === old){continue}
                    M.valCache[nm]=v;
                    var rec={name:nm,value:v,newValue:v,oldValue:old}
                    recs.push(rec)
                    this.firePropertyChangeEv(rec)
                }
                //this.firePropertyChangeEv({name:"**",value:recs,newValue:recs,oldValue:null})
            }
        }

        return function(propname, delegatemodel,optns){
            null != delegatemodel && this.setItem(propname, delegatemodel);
            _setupDelegate.call(this,propname,optns)
        }
    })();
    function removeComplex(map){
        if(!(map && typeof(map)=="object")){
            return map;
        }
        if(!($.isPlainObject(map)|| $.isArray(map))){
            return null
        }
        if($.isArray(map)){
            return map.map(removeComplex)
        }
        var jsonmap={}
        for(var k in map){
            var v=map[k];
            if(typeof(v)=="function"){continue}
            if(v && typeof(v)=="object"){
                if($.isPlainObject(v)|| $.isArray(v)){
                    v=removeComplex(v)
                } else {
                    continue
                }
            }
            jsonmap[k]=v
        }
    }
    var proto = {
        init: function(a, b,config) {
            this.initModel(a, b,config);
            this.initModelInstance(a, b,config);
        },
        UUID: function() {
            return this.__uuid ||(this.__uuid=("UUID_"+(++UUIDCOUNTER))+(Math.random().toString(36).substr(2, 5)));
        },
        initModel: function(a, b,config) {
            this.__isModel = !0
            if ( a) {
                if ("function" == typeof a.get || "function" == typeof a.set) {
                    this.__get = a.get;
                        this.__set = a.set;
                    return;
                }
                this.addProperties(a, b)
            }
        },
        dataAvailable:function(){
            if(!this.__onavailablePromise){
                this.__onavailablePromise=Promise.deferred()
            }
            this.__onavailablePromise.resolve(this)
        },
        whenDataAvailable:function(callback){
          if(!this.__onavailablePromise){
              this.__onavailablePromise=Promise.deferred()
          }
            typeof(callback)=="function" && this.__onavailablePromise.then(callback);
          return this.__onavailablePromise;
        },
        initModelInstance: function() {},


        update: function(a) {
            if (2 == arguments.length && "string" == typeof a) {
                this.setItem(a, arguments[1]);
            }
            else if ($.isPlain(a) ){
                for (var b in a) {
                    a.hasOwnProperty(b) && this.setItem(b, a[b]);
                }
            }

            return this
        },
        bindTo:function(myprop,targetObj,targetObjprop){
            if(typeof(targetObj)=="function"){
                this.onPathChange(myprop,targetObj.bind(this))
                return
            };
            if(!this.contains(myprop)){
                this.addProperty(myprop);
            };
            (function(ths,prop,target,targetprop){
                var setTargetVal=function(val){}
                if(typeof(targetprop)=="function"){
                    ths.onPathChange(prop,targetprop.bind(target,ths))
                    return
                }
                if(isModel(target)){
                    target.onPathChange(targetprop,function(prop,rec){
                        this.setItem(prop,rec.value)
                    }.bind(ths,prop))
                    setTargetVal=target.setItem.bind(target,targetprop)
                } else if($.isElement(target)||target.nodeType){
                    if(targetprop==null){targetprop="value"}
                    if($d.isFormInput(target)){
                        $d.on(target,targetprop=="text"||targetprop=="input"?"input":"change",function(prop,ev){
                            this.setItem(prop,$d(ev.target).val())
                        }.bind(ths,prop))
                    } else {
                        targetprop=targetprop||"textContent"
                        if (targetprop) {
                            $d.onMutation(target, [targetprop], function () {

                            })
                        }
                    }
                    setTargetVal=$d(target).val.bind($d(target))
                } else if($.isPlain(target) && typeof(targetprop)=="string"){
                    $.watchProperty(target,targetprop,function(prop,rec){
                        this.setItem(prop,rec.value)
                    }.bind(ths,prop))
                    setTargetVal=$.updateProperty.bind($,target,targetprop)
                }

                ths.onPathChange(prop,function(rec){
                    setTargetVal(rec.value)
                })
            })(this,myprop,targetObj,targetObjprop);
            return this
        },

        watch:function(nm,fn,optns){
            return this.onchange(nm,fn,optns)
        },
        onchange:function(nm,fn,optns){
            if(optns===false){
                if(this.off){
                    this.off(nm,fn)
                } else if(this._onchange){
                    this._onchange(nm,fn,false)
                } else{
                    this.onpropertychange && this.onpropertychange(nm, fn, false)
                }
                return
            }
            if(typeof(nm)=="function"){optns=fn;fn=nm;nm="*"}
            if(Array.isArray(nm)){
                nm.forEach(function(a){this.onchange(a,fn,optns)},this)
                return this
             }
            if(typeof(nm)=="string" && nm.trim().indexOf(" ")>0){
                nm.split(/\s+/).forEach(function(a){this.onchange(a,fn,optns)},this)
                return this
            }
            nm = nm||"*";
            var config={}
            if(optns===true){
                config.once=optns
            } else if(typeof (optns)=="string"){
                config.id=optns
            } else if($.isPlain(optns)){
                $.extend(config,optns)
            }
            var f=$.fnize(fn);

            if(this._onchange){
                this._onchange(nm,f,config)
             } else {
                return this._addListener(nm,f,config)

            }
            //this.onpropertychange(nm, f, config)
            return this
        },
        logic: function() {
            return {}
        },
        applyTemplate: function(a, b) {
            var templateFn = a||this._latsttemplateFn;
            if(this.prepTemplate){
                templateFn=this.prepTemplate(templateFn,b)
            } else if ("function" !== typeof (a)){
                  templateFn=$.template(a)
             }
            var data = $.extend({}, this.toMap(), this.logic() || {}, $.isPlain(b)?b :{});
            var res
            if(this.beforeApplyTemplate){
                var r=this.beforeApplyTemplate(templateFn, b)
                if(r && typeof(r)=="function"){templateFn=r}
            }
            if(!templateFn){return}
            this._latsttemplateFn=templateFn;
            if(typeof(templateFn)=="function"){
                res=templateFn.call(this, data)
            } else{
                res=templateFn.fn?templateFn.fn.call(this, data):null
            }
            if(this.afterApplyTemplate){
                var r=this.afterApplyTemplate(res, b)
                if(r && r!=this){res=r}
            }
            return res
        },
         collectFields: function(a) {
             var fn=$.fnize(a), res=[]
             if(!fn){return}
             this.eachField(function(name,val){res.push(fn.call(this, name,val))})
            return res
        },
        eachField: function(a) {
            var fn=$.fnize(a),keys = this.keys()
            if(!fn || !(keys && keys.length)){return}
            for (var b, c = [],  e = 0 || [], g = keys.length; b = keys[e], g > e; e++) {
                b &&  fn.call(this, b, this.getItem(b)) ;
            }
             return this
        },
        toMap: function(compact,deep) {
            if(compact!==true){compact=false}
            if(deep!==true){deep=false}
            if(this.__busytomap){return null}
            var res={}
            if(deep==true){
                this.__busytomap=true;
                try{
                    res=toMap(this,compact,deep);
                }
                catch(e){console.error(e,"toMap")}
                finally{
                    delete this.__busytomap;
                }
            } else{
                res=toMap(this,compact);
            }
            return res
        },

        toJson: function() {
            var map=removeComplex(this.toMap(true,true));

            return JSON.stringify(map)
        },

        getItem: function(a,nopath) {
            if("string" !== typeof a){return}
            var container = this, name = a,C=this.getConfig();

            if(C &&  C.caseinsensitive && !this.contains(name)) {
                if (this.contains(name.toLowerCase())){
                    name=name.toLowerCase();
                }
            }
            if(!this.contains(name) && C && !C.nopath && nopath !== true && name.indexOf(".") > 0) {
                    var d = name.split(".");
                    name = d.pop()
                    container = d.reduce(function (a, b) {
                        return a && "object" == typeof a ? (null == a[b] && (a[b] = {}), a[b]) : null
                    }, this)

            }
            if(container===this){
                return  container.get( name )
            }
            if(container && "object" == typeof container ){
                if("function" == typeof container.__get){
                    return container.__get.call(container, name )
                } else if("function" == typeof container.get){
                    return  container.get( name )
                } else {
                    return container[name]
                }
            }
        },
        setItem: function(a, b,nopath) {
            var container = this,
                name = a,
                saved = this.getSaved(a,nopath);
            if (this.contains(a) && saved === b) {
                return saved;
            }
            if (nopath!==true && "string" == typeof a && a.indexOf(".") > 0 && !this.hasProperty(a)) {
                var f = a.split(".");
                name = f.pop()
                container = f.reduce(function(a, b) {
                    if(a && "object" == typeof a){return a[b]}
                    return null
                }, this)
            }
            if(container && "object" == typeof container){
                if("function" == typeof container.__set){
                    container.__set.call(container, name, b)
                } else if("function" == typeof container.set){
                    container.set( name, b)
                } else {
                    container[name] = b
                }
            }
            return saved
        },
        linkFields: function(src, fields,writable) {
            if (!(src && "object" == typeof src)) {return}
            var model = this;

            if (isModel(src)) {
                if(fields===null){
                    fields = src.keys();
                }
                var nufields = [],
                    targetfields = Array.isArray(fields) ? fields : String(fields).trim().split(/\s+/);
                targetfields.forEach(function(fld) {
                    model.hasProperty(fld) || model.addProperty(fld);
                    nufields.indexOf(fld)==-1 && nufields.push(fld)
                    model.set(fld,src.getItem(fld))
                });


                src.onchange(function(rec) {
                    nufields.indexOf(rec.name) >= 0 &&  model.set(rec.name, rec.value)
                })
            }

        },
        delegateTo: modelDelegates,

        addProperties: function(a, b) {
            if("string" == typeof a || $.isArray(a)){
                for (var i = 0, arr= $.isArray(a)?a:a.split(/[\s,]+/),ln = arr.length; ln > i; i++) {
                    this.addProperty(arr[i]);
                }
            } else if ($.isPlain(a)) {
                for (var name in a) {
                    if (!Object.hasOwnProperty.call(a,name)) {
                        continue
                    }
                    if (this.hasProperty(name)) {
                        this.setItem(name, a[name])
                    } else {
                        this.addProperty(name, b === true ? {
                            descriptor: true,
                            defaultValue: a[name]
                        } : a[name])
                    }
                }
            }
            return this
        },

        clearValues: function(toignore) {
             for (var a, b = 0, c = this.keys() || [], d = c.length; a = c[b], d > b; b++) {
                 var D=this.getDescriptor(c[b])
                 if(D && D.proxied){
                     continue
                 }
                 if(Array.isArray(toignore) && toignore.indexOf(c[b])>=0){continue}
                 var curr=this.getItem(c[b])

                 if(isModel(curr) && curr.clearValues){
                    !curr.__record__ && curr.clearValues(toignore)
                 }
                 else {
                     this.setItem(c[b], Array.isArray(curr)?[]:null);
                 }
             }
            return this
        },
        contains: function(a) {
            return this.hasProperty(a)
        },
        ifnull: function(name ,val) {
            if(!this.get(name)){
                this.set(name,val)
            }
        },
        firePropertyChangeEv: function(data) {
            var  L=this.__listeners;
            if(typeof(this.defaultListener)=="function"){
                this.defaultListener.call(this,data);
            }
            if(!L ){return}
            if(Array.isArray(data)){
                if(!data.length){return}
                for(var i=0;i<data.length;i++){
                    var  rec=this.getMutationRecord(data[i])
                    if(rec && rec.name && rec.name!="**" && rec.name!="*"){
                        L.dispatch(rec.name,rec)
                        L.dispatch("*",rec)
                    }
                }
                L.dispatch("**",data)
                return this
            }

            var  rec= data && data.name=="**"?data:this.getMutationRecord(data)
            if(!(rec && rec.name )){return}
            L.dispatch(rec.name,rec)
            rec.name !=="**" && rec.name !=="*" && L.dispatch("*",rec) && L.dispatch("**",rec)
            return this;
        },
        getMutationRecord: function(name,old,nulifempty) {
            if(!name || name==="*"){return null}
            if(name && typeof(name)=="object" && name.name){
                return name
            }

            var val=this.getSaved(name)
            if(nulifempty===true && val==null){return null}
            return {  name: name, oldValue: null,  newValue: val,   value: val, object: this   }
        },
        firePropertyChangeEv1: function(a) {
            var impl= this.properties && this.properties.fire ? this.properties.fire(a) :
                this.fire ? this.fire(a) :
                    this.dispatch ? this.dispatch(a)
                        : alert("firePropertyChangeEv must be implemented")
            return this
        },
        _addListener:function(nm,fn,optns) {
            if (!this.__listeners) {
                this.__listeners = $.emitter.simpleObserver(this, {defEv: "*",ignoreDotInName:true})
            }
            if(optns && optns.nonnull){
                optns.filter=function(a){return !(a && a.value !=null)}
            }
            var H=this.__listeners.add(nm,fn,optns)
            if(!H || (optns && optns.nodefault)){return}
            if(H.type !="*" && H.type !="**"){
                if(this.getSaved(nm)!=null){
                    var rec=this.getMutationRecord(nm,null,true)
                    rec &&  H.fn.call( this ,rec)
                }

            } else if(H.type =="*"){
                for (var i = 0, c = this.keys(), d = c.length; d > i; i++) {
                    if(this.getSaved(c[i])!=null){
                        var rec=this.getMutationRecord(c[i],null,true)
                        rec &&  H.fn.call( this ,rec)
                    }

                }
            }
        },
        addExpr:function(nm,expr){
            var D=(expr && expr.expr)?expr:{expr:expr}
            return this.addProperty(nm,D)
        },
        on:function(nm,fn,optns) {
          this._addListener(nm,fn,optns)
            return this
        },
        off:function(nm,fn){
            this.__listeners && this.__listeners.remove(nm,fn)
        },

        copyData:function(src){
            var ths=this
            src.keys().forEach(
                function(k){
                    var D=ths.getDescriptor(k),v=src.getItem(k)
                    if(D && (D.isExpr)){return}
                    if(isModel(v)){
                        var t=ths.getItem(k)
                        if(isModel(t)){
                            t.copyData(v)
                        }
                    } else{
                        ths.setItem(k,v)
                    }
                }
            );
            this.recalcAll();
        },
         makeDescriptor:function(){
             var C=this.getConfig(),args=[];
             if(!C){
                 alert("no Config")
                 return
             }
             if(arguments.length==1 && arguments[0] && typeof(arguments[0])=="object" && arguments[0].length){
                 args=arguments[0]
             } else{args=arguments}
             var name=args[0],isexpr, valdescriptor=args[1],val=args[2]
             if(args.length==1 ){
                 if($.isPlain(args[0]) && args[0].name){
                     name=args[0].name;
                     valdescriptor=args[0];
                     valdescriptor.descriptor=true;
                 } else if(typeof(name)=="string"){
                     valdescriptor={name:name,descriptor:true}
                 }
             }
             if(!(name && typeof(name)=="string")){
                 return
             }
             if(isDescriptor(valdescriptor) ){
                 var ths=this,expr=valdescriptor.expr
                 if(expr){
                         if(typeof(expr)=="function" && !(valdescriptor.vars)){
                             var info=$.fn.info(expr);
                             var str=$.fn.getBody( expr).replace(/[\r\n]/g,";").replace(/'[^']*'/g,"").replace(/"[^"]*"/g,"");
                             var vars1=[],argname=info.args?info.args[0]:null;
                              (" "+str).replace(/([a-z_][\w_]*)\.([a-z_][\w_]*)/ig,function(a,b,c){
                                 if(b!=argname){ return}
                                 if(isNaN(c) && !$.parseUtil.isReservedWord(c,true)){
                                     vars1.push(c)
                                 }
                             });
                             valdescriptor.vars=vars1;
                         }
                       var fn=$.fnize( expr);
                     valdescriptor.fn=fn
                     valdescriptor.isExpr=true
                     if(!valdescriptor.vars){
                         valdescriptor.vars=fn.vars||[]
                     }
                     var vars=valdescriptor.vars
                     if(vars){C.depends||(C.depends={});
                         for(var i= 0,l=vars,ln= l.length;i<ln;i++){
                             C.depends[l[i]]||(C.depends[l[i]]=[]);
                             C.depends[l[i]].push(name)
                         }
                     }
                     valdescriptor.calc=function(model,noset,curr){
                         if(noset!==true && typeof(curr)==="undefined"){
                             curr=model.getSaved?model.getSaved(this.name):model.get(this.name)
                         }
                         var fn=this.fn
                         if(!fn){return}
                         var val=fn.call(model,model)
                         if(noset!==true && val !==curr && model.setItem){
                             model.setItem(this.name,val )
                         }
                         return val
                     }.bind(valdescriptor)
                     isexpr=fn;
                 } else { }
                 valdescriptor.name=name
             } else{
                 val=valdescriptor
                 valdescriptor={name:name};
             }
             if(val==null && (valdescriptor.initValue||valdescriptor.defaultValue)){
                 val=valdescriptor.initValue||valdescriptor.defaultValue;
             }
             //if(val!=null && !(typeof(val)=="number" && isNaN(val))){
             //}


             if(!valdescriptor.typeInfo){
                 if(valdescriptor.type){
                     valdescriptor.typeInfo=$.typeInfo(valdescriptor.type)
                 }
                 if(valdescriptor.initValue||valdescriptor.defaultValue){
                     valdescriptor.typeInfo=$.typeInfo(valdescriptor.initValue||valdescriptor.defaultValue)
                     valdescriptor.type=valdescriptor.typeInfo.type
                 }
             }
            if($.baseModel && $.baseModel._readers && valdescriptor.reader ){
                if(typeof(valdescriptor.reader)=="string" && $.baseModel._readers[valdescriptor.reader]){
                    valdescriptor.reader=$.baseModel._readers[valdescriptor.reader](valdescriptor.readerOptions);
                } else if(typeof(valdescriptor.reader)=="object" && valdescriptor.reader.name && $.baseModel._readers[valdescriptor.reader.name]){
                    valdescriptor.reader=$.baseModel._readers[valdescriptor.reader.name](valdescriptor.reader);
                }
                if(typeof(valdescriptor.reader)!="function"){
                    valdescriptor.reader=null;
                }
            }


             return {descriptor:valdescriptor,value:val}
         },
        isComputed: function(a) {
            return (this.getDescriptor(a)||{}).isExpr
        },
        getSaved:function(){
          return null
        },
        readRecord:function(record){
            return this.readDataRecord(record)
        },
        readDataRecord:function(record,ignorelist){
            if(!(record && typeof(record)=="object")){return  this}
            ignorelist=ignorelist||[]
            if(typeof(ignorelist)=="string"){ignorelist=ignorelist.split(/\s+/)}
            if(!Array.isArray(ignorelist)){ignorelist=[]}
            var kys=this.keys();
            var ths=this
            if(typeof(record.keys)=="function"){
                record.keys().forEach(
                    function(k){
                        var nm=kys.indexOf(k)>=0?k:
                            kys.indexOf(k.replace(/_/g,""))>=0?k.replace(/_/g,""):
                                (kys.indexOf(k.replace(/_(\w)/g,function(a,b){return b.toUpperCase()}))>=0?k.replace(/_(\w)/g,function(a,b){return b.toUpperCase()}):
                                    (kys.indexOf(k.replace(/([A-Z])/g,function(a,b){return "_"+b.toLowerCase()}))>=0?k.replace(/([A-Z])/g,function(a,b){return "_"+b.toLowerCase()}):null)
                                )
                        if(nm){
                            ignorelist.indexOf(nm)==-1 && ths.setItem(nm,this.getItem(k))
                        }
                    },record
                )
            } else  {
                $.each(record,
                    function(val,k){
                        if(typeof k !="string"){return}
                        var nm=kys.indexOf(k)>=0?k:
                            kys.indexOf(k.replace(/_/g,""))>=0?k.replace(/_/g,""):
                                (kys.indexOf(k.replace(/_(\w)/g,function(a,b){return b.toUpperCase()}))>=0?k.replace(/_(\w)/g,function(a,b){return b.toUpperCase()}):
                                    (kys.indexOf(k.replace(/([A-Z])/g,function(a,b){return "_"+b.toLowerCase()}))>=0?k.replace(/([A-Z])/g,function(a,b){return "_"+b.toLowerCase()}):null)
                                )
                        if(nm){
                            ignorelist.indexOf(nm)==-1 && ths.setItem(nm,val)
                        }

                    }
                )
            }
            this.dataAvailable();
            return this

     },
    onPathChange:function onPathChange(propname,callback,optns) {
        var prop=this.resolveName(propname)
        this.onchange(prop,callback,optns)
        if(prop.indexOf(".")==-1){
            return this
        }
        var qname=prop//.replace(/\./g,"__");
        if(!this.contains(qname)){
            var resolvePath= $.resolveProperty;
            (function(base,prop){
                var lastval,
                checkValchange=$.throttle(function checkValchange(){
                    var val=resolvePath(base,prop),
                        old=lastval
                    if(old==val){return}
                    lastval=val
                    base.firePropertyChangeEv({
                        name:prop,  value:val, oldValue:old,   newValue:val, object:base
                    })
                },{tailEnd:true,delay:200})

                var qname=prop//.replace(/\./g,"__");
                var arr=prop.split(".").map(function(n,i){
                        return {name:n,idx:i,object:null,handle:null}
                    }),last
                    arr[arr.length-1]._isLast=true
                    //last=arr[arr.length-1].name;
                function onchange (idx,rec) {

                    var nu=rec.value,nxt,mdl=arr[idx]

                    if(mdl._isLast  ){
                        checkValchange();
                    }
                    else if( nu!=null && (nxt=arr[idx+1]) && nxt.object !== nu ){
                        checkValchange();

                        nxt.object = nu
                        if(isModel(nu)||(typeof(nu.onchange)=="function" && typeof(nu.get)=="function") ){
                            nu.onchange(nxt.name, onchange.bind(this, idx+1),{nodefault:true})
                        }


                        //rec.value.onchange(arr[idx+1], onchange.bind(this, idx+1))
                    }

                }
                arr.reduce(
                    function (cntnr, O,i) {
                        if (cntnr && cntnr.onchange) {
                            O.object=cntnr[O.name];
                            cntnr.onchange(O.name, onchange.bind(base, i),{nodefault:true})
                        }
                        return cntnr?cntnr[O.name]:null;
                    }, base
                );
                checkValchange();
            })(this,prop,callback );


        }

        //this.onchange(qname,function(rec){callback.call(this,{name:rec.name.replace(/__/g,"."),value:rec.value,oldValue:rec.oldValue,newValue:rec.newValue,object:rec.object})})

        return this
    },
        clone:function(deep){
            var ctor=this.constructor
            return this.constructor.newInstance(this.toMap(false,deep))
        },
        recalc:function c(nm) {
            var D=this.getDescriptor(nm)
            if(D && D.calc){
                D.calc(this)
            }
        },
        recalcAll:function recalcAll() {
            for(var i= 0,l=this.keys(),ln= l.length;i<ln;i++){
                var D=this.getDescriptor(l[i])
                if(D && D.calc){
                    D.calc(this)
                }
            }
        },
        createProxy:function createProxy(delegatename) {
            delegatename=delegatename||"propdelegate"
            var props=this.keys().reduce(function(m,k){
                m[k]={descriptor:true,name:k,delegatedTo:delegatename}
                return m
            },{})
            props[delegatename]={descriptor:true}
            return this.constructor.newInstance(props)
        },
        getConfig:function(){ return this.__config},
        resolveName:function(a,config) {
          return a
        },
        getDescriptor: function(a) {
            var C=this.getConfig()
            return ((C||{}).descriptors||{})[this.resolveName(a,C)]
        },
        hasProperty: function(nm) {
            return this.getDescriptor(this.resolveName(nm))
        },

        keys: function() {
            return alert("implement has"), []
        },
        addProperty: function() {
            alert("implement add")
        },
        removeProperty: function() {
            alert("implement removeProperty")
        },
        __isModel:true
     }
    var baseModel= $.createClass(
        function baseModel() {
                alert("Abstract class not be intantiated")
        },
        proto
    );
    //function baseModel() {
     //   self.Klass && arguments[0] === self.Klass || null === arguments[0] || (this.__instance__ = !0, arguments[0] && this.initModel(arguments[0], arguments[0]))
    //}
    //proto.constructor = baseModel
    //baseModel.prototype=proto;
    //baseModel.prototype.shared = {}
    baseModel.isModel = !0;


/*
    var ctorTemplate = function __id__(b) {
        return this instanceof __id__ ? (this.init.apply(this, arguments), void this.initModelInstance()) : new __id__(b, arguments[1])
    }.toString();
    baseModel.extend=function(id,proto){
        var ctor,nu=new baseModel();
        if(id && typeof(id)=="object"){proto=id;id=null}
        if(typeof(id)!="string"){id="ctor_"+Math.random().toString(36).substr(2,5)}
         ctor=eval("(function "+id+"(props){if(!(this instanceof "+id+")){return new "+id+"(props);}  this.init.apply(this,arguments)})")

        if(proto && typeof(proto)=="object") {
            Object.keys(proto).forEach(
                function (k) {
                    if(isNaN(k)){nu[k] = proto[k]}

                }
            )
        }

        if(typeof(nu.init)!="function"){nu.init=function(props){this.initModel(props)}}
        ctor.prototype=nu;
        nu.constructor=ctor;
        ctor.newInstance=function(){return new ctor(arguments[0])}
        return ctor;
    }
    baseModel.extend = function(id, proto) {
        var ctor, nu = new baseModel;
        return id && "object" == typeof id && (proto = id, id = null), "string" != typeof id && (id = "model_" + Math.random().toString(36).substr(2, 5)),
            ctor = eval("(" + ctorTemplate.replace(/__id__/g, id.replace(/\.\-/g, "_")) + ")"), proto && "object" == typeof proto && Object.getOwnPropertyNames(proto).forEach(function(a) {
            isNaN(a) && (nu[a] = proto[a])
        }), "function" != typeof nu.init && (nu.init = function(a, b) {
            this.initModel(a, b)
        }), ctor.prototype = nu, nu.constructor = ctor, ctor.newInstance = function() {
            return new ctor(arguments[0])
        }, ctor
    }*/
    baseModel._readers = {
        array: function  (a) {
            var config = a || {};
            return function(val, current) {
                if (null == val) return [];
                var d = [];
                if(current && $.isArray(current)){
                    d = current
                }
                var nu = val,
                    f = 0;
                if ("string" == typeof val && config.delim ) {
                    nu = val.split(config.delim)
                }
                if (val) {
                    var g = nu._add || val._plus,
                        h = val._remove || val._minus;
                    if (g || h) {
                        if (h && $.isArrayLike(h))
                            for (var i, j, k = 0, l = val.length; j = val[k], l > k; k++)(i = d.indexOf(j)) > -1 && (d.splice(i, 1), f = 1);
                        if (g && $.isArrayLike(g))
                            for (var i, j, k = 0, l = val.length; j = val[k], l > k; k++) config.uniq && d.indexOf(j) >= 0 || (d.push(j), f = 1)
                    }
                }
                if ($.isArrayLike(nu))
                    for (var j, k = 0, l = nu.length; j = nu[k], l > k; k++) {
                        - 1 == d.indexOf(j) && (d.push(j), f = 1);
                    }
                else {
                    f = 1
                    d.push(nu);
                }
                f && $.updateVersion(d)
                return  d
            }
        },
        set: function(b) {
            var c = $.isPlain(b) ? b : {};
            return c.uniq = !0, a(c)
        },
        model: function(a) {
            var config = $.isPlain(a) ? a : {};
            return function(val, old) {
                if (isModel(val) ) {
                    return val;
                }
                if(isModel(old)) {
                    old.update(val)
                    return old;
                }
                if($.isPlain(val)){
                    return $.simpleModel(val)
                }
                return null;
            }
        },
        map: function(a) {
            var config = $.isPlain(a) ? a : {};
            return function(val, current, d) {
                var e = 0;
                if (null === val) return config.noresetOnNull ? current : {};
                var f = val;
                if ("string" == typeof val) {
                    var stringParser = config.stringParser || (d?d.__stringParser:null);
                    if(typeof(stringParser)=="function"){
                        f = stringParser(val)
                    } else{
                        f={}
                        f[val]=null;
                    }

                } else if($.isArrayLike(val)){
                    f = {}
                    $.each(val, function(b, i) {
                        if(!b){return}
                        if(typeof(b)=="object"){
                            if(b.name && "value" in b){
                                f[b.name]= b.value;
                            }
                        }
                        else{
                            f[b]=val[b]==null?null:val[b];
                        }
                    })
                }
                if(!$.isPlain(f)){return config.noresetOnNull ? current : {};}
                if($.isPlain(current)){
                    $.extend(current, f)
                    $.updateVersion(current)
                    return current
                }
                return f
            }
        }
    }

    baseModel._readers.list = baseModel._readers.array
    baseModel.prepareDescriptor = function(name,data,type){
        var descript={descriptor:true}
        if(typeof(name)!="string"){
            type=data;
            data=name;
        }
        if(name){descript.name=name}
        if(typeof(data)=="function"){
            descript.defaultValue=data
        } else if(typeof(data)=="string") {
            descript.name=data;
            if($.isPlain(type)){
                Object.assign(descript,type)
                type=null;
            }
        } else if($.isPlain(data)){
                Object.assign(descript,data)

        }
        if(type) {
            descript.type=type;
        }
        return descript;
    }

    baseModel.registerReader = function(a, b) {
        "function" == typeof b && (baseModel._readers[a] = b)
    }
    return baseModel
}()