/**
/**
 * Created by Atul on 5/20/2015.
 */

           /* Object.observe2(this.attributes,function(recs){
                var C=this.__config, deps=C.__depends,O=this.attributes;
                var uniqs={},todisp=[],deplist=[]
                for(var i= 0,l=recs||[],ln= l.length;i<ln;i++) {
                    uniqs[recs[i].name] = recs[i];
                }
                for(var i= 0,l=Object.keys(uniqs),ln= l.length;i<ln;i++) {
                    var r0=uniqs[l[i]],
                        r={name:r0.name,oldValue:r0.oldValue,newValue:r0.newValue,value:r0.newValue,object:O },
                        nm=r.name;
                    if(r.type=="delete"||r.type=="remove"){//??
                        continue
                    }
                    if(!("newValue" in r0)){
                        r.value= r.newValue=O[nm]
                    }
                    //if(r.value===r.oldValue){continue}
                    //if(!(nm in this)){continue}
                    if(deps[nm]){
                        var D=C.descriptors
                        for(var i2= 0,l2=deps[nm],ln2= l2.length;i2<ln2;i2++) {
                            deplist.indexOf(l2[i2]) == -1 && deplist.push(l2[i2])
                        }
                    }
                    todisp.push(r)
                }
                var D=C.descriptors
                for(var i = 0, ln = deplist.length;i<ln;i++){
                    var nm=deplist[i];
                    if(D[nm] && D[nm].get){
                        var curr=O[nm],nu=D[nm].get.call(this,this)
                        if(typeof(curr)=="number" && !isNaN(nu)){nu=Number(nu)}
                        if(nu!=curr){
                            O[nm]=nu
                        }
                    }
                }
                this.firePropertyChangeEv(todisp);
            }.bind(this));*/
$.simpleModel = (function () {
    function _extend(target,src) {
        for(var k in src){
            if(!(src.hasOwnProperty(k))){continue}
            target[k]=src[k]
        }
        return target
    }
    function simpleModelold(id,props) {
        if((this==$ || this==self) || !(this instanceof simpleModel)){return new simpleModel(id,props)}
        if(id===null&& props==null){//as a proto
            var defprops=$.extend({}, this.toMap())
            if(Object.keys(defprops).length){
                this.__defaultProps=defprops
            } else {this.__defaultProps=null}
            return
        }
        this.init(id,props)
    }
    function isDescriptor(obj){
        if(obj && $.isPlain(obj) && Object.keys(obj).length){
            if(obj.descriptor||obj.expr){return true}
            if(obj.name ||obj.type ||obj.typeInfo ||obj.defaultValue||obj.renderer||obj.reader ||obj.format){
                return true
            }
        }
    }
    function __define(k,hasexpr,aliasfor){
        if(this.__verifieddescriptors && this.__verifieddescriptors.indexOf(k)>=0){return}
        if(String(k).indexOf("__")==0||k=="attributes"){return}
        this.__verifieddescriptors||(this.__verifieddescriptors=[]);
        var Get=(Object.getOwnPropertyDescriptor(this,k)||{}).get
        if(typeof(Get)=="function"){
            this.__verifieddescriptors.push(k);
            return
        }

        if(k in this ){
            delete this[k];
        }
        aliasfor=aliasfor||k
        if(!(k in this)){
            Object.defineProperty(this,k,{
                get:Function("return this.attributes?this.get('"+aliasfor+"'):null"),
                set:hasexpr?function(){}:Function("v","return this.attributes?this.set('"+aliasfor+"',v):null"),
                configurable:true,
                enumerable:true
            })
        }
        this.__verifieddescriptors.push(k);



        if(this.__delegate && !this.__config.nofields ){// !(k in this.__delegate)
            var propfield=this.__config.delegatePropertyName||"properties"
             delete this.__delegate[k];
            Object.defineProperty(this.__delegate,k,{
                get:Function("return this."+propfield+"?this."+propfield+".get('"+aliasfor+"'):null"),
                set:hasexpr?function(){}:Function("v","return this."+propfield+"?this."+propfield+".set('"+aliasfor+"',v):null"),
                configurable:true,
                enumerable:true
            })
        }
        return this
    }

    var simpleModel =  $.baseModel.extend({
    //simpleModel.prototype={
        init:function(id,props,config){
            delete this.__setupmodel__;
            this.setupModel(id,props,config)
        },
        setupProps:function(props,config){
            var C=this.getConfig();
            if(!C) {
                C={}
                if(config && $.isPlain(config)){
                    Object.assign(C,config)
                }
                Object.defineProperty(this, "__config", {
                    value: C, writable: false, configurable: true, enumerable: false
                })
            }
            this.__initiliazing=true;
            var nuprops=null
            if($.isPlain(props)){
                nuprops=props
            }
            if(!this.__config.depends){
                this.__config.depends={ }
            }
            var d = {};
            if(this.__config.descriptors) {
                var descriptors = C.descriptors||{};
                 for(var i= 0,l=Object.keys(descriptors),ln= l.length;i<ln;i++){
                     var a=l[i]
                    if(a=="statics"){continue}
                     var D=descriptors[a]
                    D.raw=null;
                    d[a]=null;
                    if(nuprops && a in nuprops) {d[a] = nuprops[a];delete nuprops[a]}
                    else if(typeof(D.defaultValue)=="function"){d[a] = D.defaultValue.call(this,a)}
                     else if(!D.isExpr && D.defaultValue && (typeof(D.defaultValue)!="object" || $.isPlain(D.defaultValue) || Array.isArray(D.defaultValue))){
                        d[a] = $.clone(D.defaultValue)
                     }
                }
            } else{
                C.descriptors={};
            }
            this.initModel({
                get: this.get,
                set: this.set
            });

            //this.update(d);
            if(nuprops && Object.keys(nuprops).length){
                this.addProperties(nuprops);
            }
            else if (props && typeof(props) == "object") {
                this.addProperties(props);
            }
            Object.keys(d).length && this.update(d);
            this.__initiliazing=false;
        },
        setupModel:function(id,props,config){
            if((id && id.__asProto__) || this.__setupmodel__){return false}
            this.__setupmodel__=true;
            //if(id===null && props==null && config==null){return}
            if( id && typeof(id)=="object" ){
                props=id;id=null;
            }


            if(this.attributes){delete this.attributes}
            Object.defineProperty(this,"attributes",{value:{},writable:false,configurable:true,enumerable:false})

            var dlg=null
            if(props && props.__delegate){
                dlg=props.__delegate
                delete props.__delegate;

            } else if(config && config.delegate){
                dlg=config.delegate
                delete config.delegate;
            }
            if(dlg){
                this.setDelegate(dlg);
            }

            this.setupProps(props,config);

            if(this.afterInitialize){
                this.afterInitialize.apply(this,arguments)
            }
            if(this.initModelInstance){
                this.initModelInstance.apply(this,arguments)
            }
        },
        getConfig:function(){return this.__config||(this.__config={});},
        trigger:function(nm){
            var L=this.__listeners
            if(!L){return}
            if (!nm || "*" == nm) {
                for (var i = 0, c = this.keys(), d = c.length; d > i; i++) {
                    c[i] && "*" !== c[i]   && L.hasListeners(c[i]) && this.firePropertyChangeEv(c[i]);
                }
                return this
            }
            return L.hasListeners(nm) && this.firePropertyChangeEv(nm);
        },
        createProxy:function createProxy(delegatename) {
            delegatename=delegatename||"propdelegate"
            var props=this.keys().reduce(function(m,k){
                m[k]={descriptor:true,name:k,delegatedTo:delegatename}
                return m
            },{})
            props[delegatename]={descriptor:true}
            var nu=new $.simpleModel(props)
            return nu
        },
        getSaved:function(nm){
            return this.attributes && this.attributes[nm]
        },
        _setInner: function(name, val) {
             if (!this.attributes || !(name && "string" == typeof name)) {
                return
            }
            var C=this.__config,O=this.attributes,   DS=C.descriptors,initiliazing=this.__initiliazing
                , curr = O[name],D=DS[name]||{},raw=val;
                    if(raw==null && curr==null){curr=raw}

                 if(D.reader){
                    val=D.reader(raw,curr, this);
                     if(val==null && curr==null){curr=val}
                 }
                if(typeof(D.set)=="function"){
                    D.set.call(this,val)
                 }
                else if (!(curr === val ) ) {//&& D.raw!==raw
                    D.raw=raw
                    if(name.indexOf(".")>0){
                        $.updateProperty(this.attributes, name, val, true)
                        var root = name.split(".")[0];
                        if(!this.contains(root)){
                            __define.call(this,root)
                        }
                    }
                    O[name] = val
                    if(C.depends && C.depends[name]){
                        for(var i2= 0,l2=C.depends[name],ln2= l2.length;i2<ln2;i2++) {
                            var nm=l2[i2],DSX=DS[nm]
                            if(nm!=name && DSX && DSX.calc){
                                if(!DSX.calcThrottled){
                                    DSX.calcThrottled=  $.throttle(DSX.calc,{tailend:true,delay:100})
                                }

                                DSX.calcThrottled(this,false,this.attributes[nm])
                             }
                        }
                    }
                    if(!(val==null&&initiliazing) ) {
                        this.firePropertyChangeEv({name:name,value:val,newValue:val,oldValue:curr,object:this,type:"update"});
                     }


                 }

            return curr
         },

        set:function(k,v){
            if(!this.attributes){return}
            if(arguments.length===1 && k && typeof(k)=="object"){
                if(Array.isArray(k)){
                    for(var i= 0 ,ln= k.length;i<ln;i++){
                        this.set(k[i],null)
                    }
                } else{
                    for(var nm in k){
                        if(!(Object.hasOwnProperty.call(k,nm))){continue}
                        this.set(nm,k[nm])
                    }
                }

                return this
            }
            if(typeof(k)!="string" || k=="__config"||k=="attributes"||k=="__listeners"||k=="__delegate"){return}
            if(!(k in this) || !(k in this.attributes && !(this.getDescriptor(k)||{}).delegatedTo)){
                if(v && v.descriptor){
                    return this.addProperty(k,v)
                }
                this.addProperty(k );
            }
            return this._setInner(k,v)
        },
        get:function(k){
            if(!(this.attributes && k && typeof(k)=="string")){return}
            var val=null,D=this.getDescriptor(k)
            if(D){
                if(D.delegatedTo && this.attributes[D.delegatedTo]) {
                    val=this.attributes[D.delegatedTo][k]
                } else{
                    if(typeof(D.get)=="function"){
                        if(D.proxied){
                            return D.get.call(this,this);
                        }
                        this.attributes[k]=D.get.call(this,this)
                    } else if(D.calc  ){
                        this.attributes[k]=D.calc(this,true,this.attributes[k]==null?null:this.attributes[k])
                    }
                    val=this.attributes[k]
                }

            } else {
                val = k in this.attributes ? this.attributes[k] :
                    $.resolveProperty(this.attributes, k, true)
            }

            return val
        },

        /*add:function(k){

        },*/



        getDescriptor: function(a) {
            return a && "string" == typeof a ? this.__config.descriptors[a] || this.__config.descriptors[a.toLowerCase()] : null
        },
        keys: function() {
            return Object.keys(this.__config.descriptors)
        },
        asCtor:function(notbase){
            var nuctor=function(id,props,config){
                if(typeof(this.init)=="function"){
                    this.init(id,props,config)
                }
                if(!this.__setupmodel__ && typeof(this.setupModel)=="function"){
                    this.setupModel(id,props,config)
                }
            }
            var proto=this,DS=(this.__config||{}).descriptors,props=this.keys()
            if(proto.__config){
                DS= proto.__config.descriptors
                if(DS){
                    for(var i= 0,l=props,ln= l.length;i<ln;i++){
                        var D=DS[l[i]];
                        if(D.defaultValue==null && !D.calc){
                            var defaultValue=this.get(l[i])
                            if(defaultValue !=null && (typeof(defaultValue)!="object" || $.isPlain(defaultValue) || Array.isArray(defaultValue)) ){
                                 D.defaultValue= $.clone(defaultValue);
                            }
                        }
                        D.__busy= D.__saved=null;
                    }
                }
            }
            delete this.__verifieddescriptors
            delete this.__setupmodel__
            delete this.__initiliazing

            var ctor=$.createClass(nuctor,this,null,this.statics)

            if(ctor.prototype.__listeners){
                ctor.prototype.__listeners.destroy()
                delete ctor.prototype.__listeners;
            }
           /* if(notbase===true) {
                for (var i = 0, l = props, ln = l.length; i < ln; i++) {
                    var k = l[i], D = DS[k];
                    if(k=="statics"||!D){continue}
                    delete ctor.prototype[k];
                    if (!(k in ctor.prototype)) {
                        var aliasfor = D.aliasfor || k;
                        Object.defineProperty(ctor.prototype, k, {
                            get: Function("return this.attributes?this.get('" + aliasfor + "'):null"),
                            set: (D.isExpr || D.calc) ? function () {
                            } : Function("v", "return this.attributes?this.set('" + aliasfor + "',v):null"),
                            configurable: true,
                            enumerable: true
                        })
                    }
                }
            }*/
            delete ctor.prototype.attributes;
            return ctor;
        },
        getDelegate: function(orself) {
            return this.__delegate||(orself===true?this:null)
        },
        setDelegate: function(a) {
            if(a && typeof(a)=="object" && a!==this.__delegate){
                this.__delegate=a;

            }

        },
        refresh: function() {},
        addProperty: function() {
            var C=this.__config
            if( !this.attributes){
                return
            }
            var descriptor=this.makeDescriptor(arguments),valdescriptor,name,origname,val
            if(descriptor && descriptor.descriptor){
                valdescriptor=descriptor.descriptor
                origname=name = valdescriptor.name
                val=descriptor.value
            } else{
                return
            }
            if(C.caseinsensitive ){
                name=name.toLowerCase()
            }
            var exists=C.descriptors[name]
            C.descriptors[name]=$.extend(C.descriptors[name] || {}, valdescriptor||{})

             __define.call(this,name,!!valdescriptor.isExpr);

            if(origname!=name && !(origname in this )  ){
                 __define.call(this,origname,!!valdescriptor.isExpr,name);
            }
            if(valdescriptor.typeInfo && valdescriptor.typeInfo.date && !valdescriptor.reader){
                valdescriptor.reader=valdescriptor.typeInfo.coerce
            }

            if( this.attributes){
                if(!(name in this.attributes)){
                    this.attributes[name]=null;
                }
                this._setInner(name,val)
                if(valdescriptor && valdescriptor.calc && !this.__initiliazing){
                    try {
                         valdescriptor.calc(this,false,null)
                    } catch(e){}
                }
            }


            return this
        },
        removeProperty: function(a) {
            var C=this.__config;
            if(!this.hasProperty(a)){
                return
            }
            delete C.descriptors[a]
            //this.__defaultProps && delete this.__defaultProps[a]
            delete this[a]
             if(this.__delegate){delete this.__delegate[a]}
            delete this.attributes[a]
        }
     })
    simpleModel.from=function(data){
        if(!data ){return}
        var props={}
        if(typeof(data)=="string"){
            data.split(/\s+/).forEach(function(k){props[k]=null})
        } else if(typeof(data)=="object"){
            if(Array.isArray(data)){
                data.forEach(function(k){props[k]=null})
            } else{
                for(var k in data){
                    if(!(data.hasOwnProperty(k)) || !isNaN(k) || k=="length"){continue}
                    props[k]=data[k]
                  }
             }
        }
        return new simpleModel(props)
    }
    simpleModel.make = function (delegate,props,statics,addtional) {
         var klassprops = props
        //klassprops.init = "super";
        var propmodel=$.simpleModel.newInstance( )
        delete propmodel.__setupmodel__
        delete propmodel.__initiliazing
        if(delegate && typeof(delegate)=="object" && !$.isPlain(delegate)&& !$.isArray(delegate)) {
            propmodel.setDelegate(delegate)
        }
        propmodel.addProperties(props)
        var staticprops={}
        if(statics && typeof(statics)=="object"){
            $.each(statics,function(v,k){
                if(typeof(v)=="function"){
                    propmodel[k]= v;
                }
                else {staticprops[k]=v}
            })
        }
        propmodel.setItem("statics",staticprops||{})

        var nuctor =  propmodel.asCtor()
        return nuctor
    };
    simpleModel.extend1 = function(id,proto){
        var base=this
        if(id && typeof(id)=="object"){
            proto=id;
            id=null;
        }
         var nu=new base({__asProto__:true} )
         var defprops= {}
        if(proto && typeof(proto)=="object"){
            if(!Array.isArray(proto)){
                for(var k in proto){
                    if(!(proto.hasOwnProperty(k))){continue}
                    if(typeof(proto[k])=="function" ){
                        nu[k]= proto[k]
                    } else{
                        defprops[k]=proto[k]
                    }

                }
            } else{
                proto.forEach(function(k){defprops[k]=null})
            }
        }
        if(Object.keys(defprops).length){
            nu.setupProps( defprops)
        }


        var ctor=nu.asCtor()
         //ctor.prototype.__defaultProps=Object.keys(defprops).length?defprops:null;
         return ctor;
    }
    return simpleModel;
})();