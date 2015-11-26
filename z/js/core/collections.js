;(function(scope){
    /*
     new ItemList({
     reader        :function(d){return d},
     keyprovider   :function(rec){return rec.id},//name or fn
     validator     :function(){return true},
     labelprovider :function(rec){return rec.name},
     comparator    :function(a,b){},
     uniq          :false})

     */
    var defs={
            reader        :{read:function(d){return d} },
            keyprovider   :function(rec){
                if(!(rec && typeof(rec)=="object")){return rec}
                return rec&&typeof(rec)=="object"?(rec.id||(typeof rec.key !="function"?rec.key:null)):rec
            },//name or fn
            validator     :function(){return true},
            labelprovider :function(rec){
                if(!(rec && typeof(rec)=="object")){return String(rec)}
                if(!this.__labelprvdr){this.__labelprvdr=["name","label","title","value"].filter(function(it){return it in rec})[0]};
                return this.__labelprvdr?(rec.get?rec.get(this.__labelprvdr):rec[this.__labelprvdr]):""
            },
            comparator    :function(a,b){return a==b?0:a>b?1:-1},
            uniq          :false},
        abs=Math.abs,min=Math.min.apply.bind(Math.min,Math),max=Math.max.apply.bind(Math.max,Math),
        _at=function(l,v){return l.indexOf(v)}
    function _makeKeyProvider(k){
        if(typeof(k)=="function" ){return k}
        return typeof(k)=="string"?Function("rec","var k='"+k+"';return rec.getEntity?rec.getEntity(k):rec[k]"):null
    }
    function _makeLabelProvider(k){var fn
        if(typeof(k)=="function" ){return k}
        if(typeof(k)=="string" ){
            fn=(k+" ").replace(/([\w]+)(.)/g,function(a,b,c){return (!(c && c=="(")?"_rec":"")+b+c}).trim()
            fn="var m=rec.toMap||rec.toObject;_rec=m?m.call(rec):rec;return "+fn
        }
        return fn?Function("rec",fn):null;
    }
    function _setter(list){
        var arrproto=Array.prototype,c=list.config;
        return function(){
            var read= c.reader.read,uniq= c.uniq
            var i=-1,val,asnew,ln=arguments.length;if(ln===3  ){asnew=arguments[1]}
            if(ln>=2&&typeof(arguments[0])=="number"){
                i=arguments[0];val=read(ln===3?arguments[2]:arguments[1])
            } else{val=read( arguments[0] )}
            if(!uniq||list.indexOf(val)===-1) {i=i>=this.length||i<0?-1:i
                i===-1?arrproto.push.call(list,val):(asnew?arrproto.splice.call(list,i,0,val):(this[i]=val));
            }
            return val
        }
    }
    function _arrtype(a){ return $.isArray(a)}
    function _flattenArgs(all,firstisopts){ if(!(all&&all.length)){return []}
        var vals=[],a=$.isArray(all)?all: $.makeArray(all),optns={}
        if(a.length==1&&$.isArray(a[0])){return a[0]}
        if(a.length==1&&$.isArrayLike(a[0])){
            var ln=a[0].length
            vals=$.makeArray(a.shift())
            if(vals.length==1&&$.isArrayLike(vals[0])){
                vals=$.makeArray(vals.shift())
            }
        }
        if(a.length){
            for(var i= 0,ln= a.length,it;it=a[i],i<ln;i++){
                if($.isArrayLike(it)){
                    [].push.apply(vals,Array.isArray(it)?it:[].slice.call(it))
                } else {vals.push(it)}
            }
        }
        return vals
    }
    function _makeComparator(k){
        var fn,nm=typeof(k)=="string"?k:typeof(k)=="function"? k.name:"" ;
        if(nm){
            if(/^String|Number|Boolean|Date$/i.test(nm)){
                var ctor= nm.charAt(0).toUpperCase()+ nm.substr(1);
                var cnvrtr= ctor ;  if(ctor!="String"){cnvrtr= "+"+ctor}
                fn=Function( "a","b" ,"var aa= "+cnvrtr+"(a),bb= "+cnvrtr+"(b);return aa==bb?0:aa>bb?1:-1")
            }
        }
        if(!fn ){
            if(typeof(k)=="function"){
                return k;
            } else if(typeof(k)=="string"){var cnvrtr=/id|num$/i.test(k)?"Number":/date|time$/i.test(k)?"+Date":"String"
                fn=Function( "a","b" ,"var kynm='"+k+"',aa= "+cnvrtr+"(Object(a)[kynm]),bb= "+cnvrtr+"(Object(b)[kynm]);return aa==bb?0:aa>bb?1:-1")
            } else if(k && k.type && k.name){ var cnvrtr=  k.type
                fn=Function( "a","b" ,"var kynm='"+k.name+"',aa= "+cnvrtr+"(Object(a)[kynm]),bb= "+cnvrtr+"(Object(b)[kynm]);return aa==bb?0:aa>bb?1:-1")
            }
        }
        return typeof(fn)=="function"?fn:null
    }
    function List(){
        if(this === self||!(this instanceof List)){return new List(_flattenArgs(arguments ))}
      this._init.apply(this,arguments)
    }

    List.prototype=Object.create(Array.prototype);
    var Listproto=List.prototype
    Listproto._init=function(){
        this.__initing=true
        try{
        var args=arguments.length==1&&$.isArrayLike(arguments[0])?arguments[0]:_flattenArgs(arguments ),
            optns={},vals=args;

        $.defineProperty(this,"config",{value:{}},false)
        for(var k in defs){
            if(!(k in this.config)){this.config[k]=defs[k]}
            if(k=="reader"){
                for(var k1 in defs[k]){
                    if(!this.config[k][k1]){this.config[k][k1]=defs[k][k1]}
                }
            }
        }


        //his._set=_setter(this  );

        if(vals && vals.length){
            if( this.config.reader.read===defs.reader.read){
               [].push.apply(this,vals)
            }
            else{this.addAll(vals); }
        }
        } finally{delete this.__initing}
    }
    Listproto.getObserver=function(){
        this.config=this.config||{}
        if(!this.config._observer){
            this.config._observer=$.emitter.simpleObserver(this);
        }
        return this.config._observer;

    }
    Listproto._dispatch=function(ev,data){
        var C=this.config=this.config||{}
        var o=C._observer;
        if(!o||C.paused){return}
        var map={"unshift":"add","push":"add","shift":"remove","pop":"remove","splice":"remove"}
                                   var nm=map[ev]||ev;
        if( o.hasListener(nm)) {
            o.fire (nm, {type: nm, action: ev, value: data, collection: this})
        }
        if(nm!="change"&&o.hasListener("change")){
            o.fire("change",{type:"change",action:ev,value:data,collection:this})
        }
    }
    Listproto._set=function(){
        var i=-1,val,asnew,ln=arguments.length;
        if(ln===1&&Array.isArray(arguments[0]) ){
            for(var i=0,l=arguments[0],ln1=l.length;i<ln1;i++){this._set(l[i])}
            return this;
        }
        var list=this,c=this.config,read= c.reader.read,uniq= c.uniq
        if(ln===3  ){asnew=arguments[1]}
        if(ln>=2&&typeof(arguments[0])=="number"){
            i=arguments[0];
            val=read(ln===3?arguments[2]:arguments[1])
        } else{
            val=read( arguments[0] )
        }
        var ln=this.length,mod=0;
        if(!uniq||list.indexOf(val)===-1) {
            if(i<0){
              i=(ln+1)+i
            }
             if(i>=ln){
                [].push.call(list,val)
            } else if(asnew){
                [].splice.call(list,i,0,val)
            } else{
                this[i]=val
            }
            mod=1
        }
        if(mod){
            this._dispatch&&this._dispatch(ln<this.length?"add":"update",val)
        }

        return val
    }
    Listproto.setKeyProvider=function(v){this.config.keyprovider=_makeKeyProvider(v);return this;}
    Listproto.setLabelProvider=function(v){this.config.labelProvider=_makeLabelProvider(v);return this;}
    Listproto.setComparator=function(v){this.config.comparator=_makeComparator(v);return this;}
    Listproto.setReader=function(v){this.config.comparator=_makeComparator(v);return this;}
    Listproto.setConfig=function(c){
        $.extend(this.config,c);
        return this;
    }
    Listproto.prep=function(nu,mutate){
        if( nu===this||nu instanceof List){return nu||this}
        if($.isArrayLike(nu)){
            var nu1= List.from(nu)
            if(this.config && this.config.observable){
                nu1=List.Observable(nu1);
                nu1.config||(nu1.config={})
                nu1.config.observable=true;
            }
return nu1;
        }
        return nu;
    }
    Listproto._invokeNative=function(nm,args){
        var res=Array.prototype[nm].apply(this,[].slice.call(args||[]))
        return this.prep(res)
    }
    Listproto.filter=function(fn0,ctx){
        var fn=List._makefn(fn0,this,true),res=[],l=this;  if(!fn){return}
        this.each(
            function(it,i){  fn.call(ctx,it,i,l)&&res.push(it);  }
        )
        return this.prep(res)
    }
    Listproto.map=function(fn0,ctx){
        var fn=List._makefn(fn0,this),res=[],l=this;  if(!fn){return}
        this.each(
            function(it,i){  res.push(fn.call(ctx==null?it:ctx,it,i,l))}
        )
        return this.prep(res)
    }
    var $BREAK={}
    Listproto.each=Listproto.forEach=function(fn0,ctx){
        var fn=List._makefn(fn0,this );  if(!fn){return this}
        for(var i=0,l=this,ln=l.length;i<ln;i++){
            if(fn.call(ctx,l[i],i)===$BREAK){break;}
        }
        return this
    }
    Listproto.push=function(){var nm="push"
        var res= this._invokeNative(nm,arguments);this._dispatch&&this._dispatch(nm,res);
        return res
    }
    Listproto.pop=function(){var nm="pop"
        var res= this._invokeNative(nm,arguments);this._dispatch&&this._dispatch(nm,res);
        return res
    }
    Listproto.shift=function(){var nm="shift"
        var res= this._invokeNative(nm,arguments);this._dispatch&&this._dispatch(nm,res);
        return res
    }
    Listproto.unshift=function(){var nm="unshift"
        var res= this._invokeNative(nm,arguments);this._dispatch&&this._dispatch(nm,res);
        return res
     }
    Listproto.splice=function(){var nm="splice"
        var res= this._invokeNative(nm,arguments);
        this._dispatch&&this._dispatch(nm,res);
        return res
    }
    Listproto.fill=function(v,start,end){

        var size=this.length;
        if(end==null && start==null){
            start=0;
            end=this.length;
        }
        start=start||0 ;
        if(end==null){
            end=start;
            start=size
        }

        if(!end||end<0){
            end=size
        }
        if(start<0){
            start=size-start
        }
        start= Math.max(0,Number(start)||0) ||0
        if(end<start){
            return this
        }
        var fn=List._makefn(v,this )
        while(this.push(null) < end ){ }

        for(var i=start;i<end ;i++){
            this._set(i,fn.call(this,i))
        }
        return this
    }
    Listproto.slice=function(){
        var res,a=arguments,mutate;
        if(typeof(a[a.length-1])=="boolean"){a=[].slice.call(arguments);mutate=a.pop()}
        res=this.prep([].slice.apply(this,a))

        return res

    }
    Listproto.setUniq=function(flg,tx){if(flg==null){flg=true}
        var clctn=this
        if(this.config.uniq!=flg){

            if(!clctn.empty()){
                clctn= new  List()
            }
            if(flg){
                clctn.push=function(){for(var i= 0,l=arguments,ln=l.length,it;it=l[i],i<ln;i++){this._set(-1,true,it);}}.bind(clctn)
                clctn.unshift=function(){for(var l=arguments,ln=l.length,i= ln-1,it;it=l[i],i>=0;i--){this._set(0,true,it);}}.bind(clctn)
                clctn.splice=function(idx,todel){Array.prototype.splice.call(this,idx,todel||0);
                    for(var l=[].slice.call(arguments,2),ln=l.length,i= ln-1,it;it=l[i],i>=0;i--){this._set(idx,true,it);}}.bind(clctn)
            }
            clctn.config.uniq=flg;
            if(clctn!==this){
                clctn.addAll(this.toArray())
            }

        }
        if(tx){return clctn.collect(tx)}
        return clctn;
    }
    if(!Listproto.reduce){
        Listproto.reduce=function(fn,init){
            var val=init,l=this,skipfirst=arguments.length===1;
             this.each(
                function(it,i){
                    if(skipfirst===true){
                        skipfirst=false;val=it;
                        return
                    }
                    val=fn(val,it,i,l)
                }
            )
            return val;
        }
    }
    if(!Listproto.reduceRight){
        Listproto.reduceRight=function(fn,init){
            var val=init;
            var val=init,l=this,skipfirst=arguments.length===1;
            for(var l=this,ln= l.length,i= ln-1;i>=0;i--){
                val=fn(val,l[i],i,l)
            }
            return val;
        }
    }
    Listproto.every=function(fn0){var l=this,ret=true,fn=List._makefn(fn0,this,true);if(!fn){return}
         this.each(
            function(it,i){
                if(!fn (it, i, l)) { ret=false; return $BREAK  }
            });
                return ret;
    }
    Listproto.some=function(fn0){var ret=false,l=this,fn=List._makefn(fn0,this,true);  if(!fn){return}
        this.each(
            function(it,i){
                if(fn(it,i,l)){ret=true;return $BREAK}
            }
        )
         return ret;
    }
    Listproto.eq=function(val){
        if(this[0]==val ||this===val){return true}
        if(Array.isArray(val)){
             for(var i= 0,l=val,ln= l.length;i<ln;i++){
                 if(l[i]!=this[i]){return false}
             }
        return true;
    }

        return false;
    }
    Listproto.sort=function( cmp){
        if(typeof(cmp)=="string"){
            var arr=cmp.split(/\s+/)
            cmp=List._makefn(cmp,this,true)
        }
        if(typeof(cmp)!="function"){
            var info;
            if(this.config&&this.config.typeInfo){
                info=this.config.typeInfo
            } else{
                var t=this.typeOf();
                this.config.typeInfo=info=$.typeInfo($.isArray(t)?t[0]:t);
            }
            if(info&&info.compareTo){cmp=info.compareTo.bind(info)}
        }
        this._dispatch&&this._dispatch("sort")
        this._invokeNative("sort",cmp?[cmp]:[])
        return this;
    }
    var ignoredMethods=[],chainableProto=null;
    List._getchainableProto=function(){
        if(!chainableProto) {chainableProto=Object.create(null);
            var mutators = "push pop shift unshift splice".split(/\s+/), listMethods = $.getMethods(List.prototype)
            if (!ignoredMethods.length) {
                ignoredMethods = ["findResult", "find", "first", "last", "toArray", "add", "addAll", "getAt", "setAt", "remove", "remove", "clear"];
                $.each(listMethods, function (v, k) {
                    if (ignoredMethods.indexOf(k) >= 0) {
                        return
                    }
                    if (k.charAt(0) == "_" || k == "mixin" || k == "chainable" || k.indexOf("get") == 0 ||
                        /return\s+this\s*;?\s*\}/mg.test(List.prototype[k].toString())) {
                        ignoredMethods.push(k)
                    }
                });
            }
            $.each(listMethods, function (v, k) {

                if (k.charAt(0) == "_" || k == "mixin" || k == "chainable" || k == "prep" || k == "clone") {
                    return
                }
                var d = v.descriptor;
                if (/return\s+this\s*;?\s*\}/mg.test(List.prototype[k].toString())) {
                    chainableProto[k] = Function("List.prototype['" + k + "'].apply(this,arguments);return this;")
                }
                else if (ignoredMethods.indexOf(k) >= 0) {
                    chainableProto[k] = Function("return List.prototype['" + k + "'].apply(this,arguments)")
                } else if (mutators.indexOf(k) >= 0) {
                    chainableProto[k] = Function("return Array.prototype['" + k + "'].apply(this,arguments);")
                } else if (typeof(Array.prototype[k]) == "function") {
                    chainableProto[k] = Function(" return this.__make(Array.prototype['" + k + "'].apply(this,arguments))")
                }

                else {
                    chainableProto["__" + k]=d.value
                    chainableProto[k] = Function("return this.__make(this['__" + k + "'].apply(this,arguments))")
                }
            });
            chainableProto["__make"]= function (l) {
                    if (this.__initing) {
                        return this
                    }
                    var ret
                    if (l && l instanceof List) {
                        ret = l
                    } else {
                        var type = (l && l.length) ? List._getComponentTypeDelegate($.A.findResult(l)) : (this.config._delegate || {}).__type
                        if (type && type.type && this.config._delegate && this.config._delegate.__type.info == type.info) {
                            ret = this.clone().addAll([].slice.call(l || []))
                            //ret=this
                        }
                        else if (type && type.type && l && typeof(l) == "object" && l.length >= 0) {
                            var ll = List.create().addAll(l).chainable()
                            ret = ll
                        } else {
                            ret = l
                        }
                    }
                    if ((ret instanceof List)) {
                        ret.config._shared = this.config._shared || {}
                        if (ret.config._shared.uniq) {
                            ret.flatten(false, true, true)
                        }
                        if (ret !== this) {

                            if (ret.config._shared._methods) {
                                $.each(ret.config._shared._methods, function (v, k) {
                                    if (!ret[k]) {
                                        ret[k] = v
                                    }
                                })
                            }
                        }
                    }
                    return ret
                }
        }
        return chainableProto;
        }
    List._getComponentTypeDelegate=function(obj0){

        var obj=(obj0&&typeof(obj0)=="object"&&obj0.length) ? $.A.findResult(obj0):obj0
        if(!obj ){return}
        if(typeof(obj)=="function"&&Object.keys(obj.prototype).length){obj=obj.prototype}
        var ths,dfn=$.defineValue,delegate={},
            type={};

        if(obj=="element"|| (typeof(Node)!="undefined" && (obj.el||obj) instanceof Node)){
            type.info=$.typeInfo.get("element")
            if(!type.info.category){
                type.info.category=$d
            }
        } else{
            type.info=obj?$.typeInfo.get( obj ):{}
        }

        //if(type && type.collectionDelegate){ return type.collectionDelegate.newInstance(list)         }
        if(type && type.newInstance&&type.info.category){
            return type
        }

         ths=List.create()
        var p=List._getchainableProto();
        for(var fn in p){
            ths[fn]=p[fn];
        }
        obj0.copyConfig&&obj0.copyConfig(ths)
        delegate.__type=type
        ths.config=ths.config||{}
        ths.config._delegate=delegate;
        var allmethods={}
        if(!type.info.category){
            if( type.type=="string"){
                $.require("$.S")
                type.info.category=$.S
            }
        }
        if(type.info.category){
            allmethods=$.getMethods(type.info.category)
        }
        $.each($.getMethods(obj,true),function(v,k){
            if(k &&!(k in allmethods )){
                allmethods[k]=v;
            }
        })





        $.each(allmethods,function(v,k){
            if(v.descriptor && typeof(v.descriptor.value)=="function" ){
                var ds=v.descriptor
                if(type.info.category&&(k in type.info.category)){
                    delegate[k]={ctx:type.info.category,elementAsArg:true,mthd:type.info.category[k]}
                }
                else{delegate[k]={ctx:null,mthd:ds.value}}
                delegate[k].name=k;
                Object.defineProperty(ths,k, {value:(function( propname ){
                    return function(){
                        var r=[],C=this.config,
                            args=[].slice.call(arguments)  ,
                            dl=C._delegate[propname],
                            data=C.__data,hasdata=false,
                            fn=dl.mthd,
                            elAsArg=dl.elementAsArg ,issame=true
                        if(!(data && data.length)){data=null} else{hasdata=true}
                        for(var i= 0,l=this,ln=l.size(),it;it=l[i],i<ln;i++){
                            if(!it){continue}
                            var ths=dl.ctx||it;
                            if(hasdata===true){ths.collectiondata=data[i]}
                            var res=fn.apply(ths,(elAsArg?[it]:[]).concat(args))
                            if(hasdata===true){delete ths.collectiondata}
                            res!=null && r.push(res);
                            if(res!==it){issame=false}
                        }

                        if(issame){return this}
                        else if(r.length){
                            return List.from(r).chainable()
                        }
                        return this
                    }
                })(k),
                    enumerable:true,writable:true,configurable:true})
            }});
        type.newInstance=function(l){
            var c=this.ctor
            var nu=new c();
            $.defineProperty(nu,"__mixedin",{value:true,enumerable:false,configurable:false})
            nu.config._delegate=c._delegate
            nu.config._shared||(nu.config._shared={});
            if(l){
                nu.addAll([].slice.call(l))
            }
            return nu
        }
        type.ctor=function(){
            if(arguments.length){this._init.apply(this,arguments)}
            else{this._init()}

         }

        type.fn=ths;
        type.ctor.prototype=ths;
        type.ctor._delegate=delegate
        return type;
    }
    Listproto.mixin=function(obj0 ){
        return this.chainable(obj0 )
    }
    Listproto.listdata=function(data){
        if($.isArray(data)){this.config.__data=data}
       return this
    }
    Listproto.exit=function(){
        delete this.config.__data
    }
    Listproto.enter=function(data,fn){
        var d=this.config.__data||(this.config.__data=[]);
        if(data){
            [].concat(data).forEach(
                function(k){d.push(k)}
            )
        }
        if(typeof(fn)=="function"){

        }
        return this
    }
    Listproto.chainable=function(obj0 ){
        var obj=obj0||this.findResult()
        var type=List._getComponentTypeDelegate(obj)
        return type?type.newInstance(this.toArray()):this

            /*type.collectionDelegate=ths;
            type.collectionDelegate._log={list:new List()}
            type.collectionDelegate.config._delegate=delegate;
            type.collectionDelegate.newInstance=function(list){

                var nu=this.clone().addAll(list);
                return nu
        }
        return type.collectionDelegate.newInstance(list);
             */
    }
    Listproto.mixinProto=function(obj){

    }
    Listproto.copyConfig=function(l){l&&l.setConfig && l.setConfig(this.config);return l}
    Listproto.unique=Listproto.uniq=function(tx ){  return this.setUniq(true,tx)}
    Listproto.value=function( ){  return this.length==1?this[0]:this}
    Listproto.pluck=function(nm ){  return this.collect("@"+nm)}
    Listproto.invoke=function(nm ){  return this.invokeWith.apply(this,[nm,null].concat([].slice.call(arguments,1)))}
    Listproto.invokeWith=function(nm,ctx ){
        var r=[],args=[].slice.call(arguments,2),fn="function";
        this.each(function(it,i){
            it && typeof(it[nm])===fn&&
            r.push(it[nm].apply(ctx==null?it:ctx,args.concat(it,i,this)))
        })

        return this.prep(r)
        //return this.collect(function(it){return (it && typeof(it[nm])===fn)?it[nm].apply(ctx||it,args):null})
    }
    Listproto.split=function( nm){
        var res=[[]],fn=List._makefn(nm,this);
        return this.reduce(
            function(m,it){
                if(fn(it)){m.push([])}else{m[m.length-1].push(it)}
                return m
            }
            ,[[]]
        )
      }

    Listproto.groupsOf=function( num){  var l=this,rnng=0,n=Math.max(1,~~num) ,res=[[]];
        this.each(function(it,i){
            var k=~~(i/n);k>rnng&&(rnng=res.push([])-1);
            res[rnng].push(it)
        });

        return res
    }
    Listproto.groupBy=function( fn){  var ret={},g=this.collect(fn).map(String);
         this.each(function(it,i){
            (ret[g[i]]||(ret[g[i]]=List.from([]))).push(it)
        });
        return $.LinkedMap(ret);
    }
    Listproto.typeOf=function(extended ){
        var res
        if(extended===true){res=this.collect(function(it){return $.typeInfo(it)}).uniq()}
        else{
            res= this.compact(true,true).collect(function(it){return ({}).toString.call(it).replace(/[\[\]\s]|object/g,"")}).uniq()
        }
        return res?res.value():null
    }
    Listproto.sortBy=function( nm,mutate){  var revrse=0
        if(typeof(nm)=="string" && nm.charAt(0)=="-"){revrse=1;nm=nm.substr(1).trim()}
        var res,fn=List._makefn(nm,this);
        if(mutate===false){res=this.clone(true).sort(function(a,b){var aa=fn(a),bb=fn(b);return aa==bb?0:aa>bb?1:-1})}
        res=this.sort(function(a,b){var aa=fn(a),bb=fn(b);return aa==bb?0:aa>bb?1:-1})
        if(revrse){res.reverse()}
        return res

    }



    Listproto.toArray=function(fn){
        var f=fn?List._makefn(fn,this,false):null;
        var nu=Array.prototype.slice.call(this)
        if(f){
            return [].map.call(this,f)
        }
        return nu
    }
    Listproto.clone=function(withdata){
        var nu,ctor=this.config._delegate&&this.config._delegate.__type&&this.config._delegate.__type.ctor
        if(ctor){nu=new ctor()}
        else{nu= Object.create(this);
            nu.splice(0,this.length+1)
        }
        if(withdata===true){nu.addAll(this.toArray().slice())}
        return nu
    }
    Listproto.getAt=function(i){
        var idx= typeof(i)=="number"?(i<0?this.size()+i:i):this.indexOf(i);
        return idx>=0&& idx<this.length?this[idx]:null
    }

    Listproto.addAt=function(i,a){ this._set(Number(i)||0,true,a );return this}
    Listproto.add=function(a){ this._set(-1,true,a); return this}
    Listproto.reset=function(nu){
         this.clear().addAll(nu);
        return this
    }
    Listproto.addAll=function(a){
        if(!(a&&$.isArray(a))){
            if(arguments.length){
                   a=[].slice.call(arguments)
            }
            else{return this}
        }
        var o=this.config ;
        o.paused=true
        try {
            for(var i=0, ln=a.length, it; it=a[i], i<ln; i++) {
                this._set (-1, true, it)
            }
         }  finally{o.paused=null}
        this._dispatch&&this._dispatch("add",a)

        return this
    }
    Listproto.removeAt=function(i0){
        var i=+i0;
        if(isNaN(i)){return}
        i=i<0?this.length+i:i;
        return i==0?this.shift():this.splice(i,1)[0]}
    Listproto.remove=function(a){var curr
        if(typeof(a)=="number"&&!this.contains(a)){return this.removeAt(a)}
        var i=this.indexOf(a);
        if(i<0){
            var f=this.find(a)
            if(f){i=this.indexOf(f)}
        }
        if(i>=0){curr=this.splice(i,1)[0]} else{return null;}
        return curr
    }
    Listproto.removeAll=function(a) {
        var idx
        for(var i= 0,l=this.findAll.apply(this,arguments),ln = l.length;i<ln;i++) {
            (idx=this.indexOf(l[i]))>=0 && this.splice(idx,1);
        }
        return this
    }
    Listproto.toggle=function(a){var el=this.contains(a);el?this.remove(el):this.add(a);return this;}
    Listproto.empty=function(){
        return this.size()==0
    }
    Listproto.size=function(){
        var cnt=this.length;
        if(typeof(cnt)=="undefined"){
            cnt=0;
             for(var i in this){
                if(this.hasOwnProperty(i)&&!isNaN(i)){cnt=Math.max(cnt,Number(i)+1) }
            }
             try{
                delete this.length
                Object.defineProperty(this,"length",{get:function(){
                    var c=0;
                    for(var i in this){
                        if(this.hasOwnProperty(i)&&!isNaN(i)){c=Math.max(c,Number(i)+1) }
                    }
                    return c;
                },set:function(num){
                    if(num>=0){
                        Array.prototype.splice.call(this,num,1000)
                     }
                },configurable:true})
            } catch(e){}

        }
        return cnt
    }
     Listproto.clear=function( ){var i=-1;
        //while(this[++i]!=null){ this[i]=null}
        this.splice(0,10000);
        this._dispatch&&this._dispatch("clear")
        //this.length=0;

        return this;
    }

    Listproto.contains=function(a){
        return this.indexOf(a)>=0?a:((typeof(a)=="number"&&a>=0&&a<this.length)?this[a]:  this.find (a))
    }
    List._finders={id:function(tofind,config){var prv=config.keyprovider,v=tofind;
        return function(rec){return prv(rec)==v}},
        prop:function(prop,tofind,config){var prv=String(prop),v=tofind;
            return function(rec){return (rec.get?rec.get(prv):rec[prv])==v}
        }
    }
    Listproto.combinations =function combinations () {
         var  args = [].slice.call(arguments),trgt = this  , nounwrap = false
        if (!args.length) { return trgt    }
        var res=List.from();
        while(args.length){
            [].concat(args.shift()||[]).forEach(
                function(a){
                    trgt.each(function (v2,ii) {
                        res.add([v2,a])
                    })

                }
            )

        }

        return   res
    }
    Listproto.permute =function permute() {
        /*
         var res=[],l=[1,3,4,5],cc=[].concat(l);while(cc.length){ cc.forEach(function(y,i){var ll=[].concat(cc);var a=ll.splice(i,1);
         var xxx=[].concat(l);xxx.splice(i,1); xxx.each(function(x,j){xxc=[].concat(xxx);xxc.splice(j,1);res.push([y,x].concat(xxc )) })} ); cc.shift();};res=res.map(String);res.pop();res.sort();res.join("\n")
         */
        var  args = [].slice.call(arguments),trgt = this  , nounwrap = false
        if (!args.length) { return trgt    }
        var res=List.from();

        args.forEach(function (arro,i) {
            trgt.each(function (v2,ii) {
                List.from(arro).each(function (v3,iii) {
                    res.add([v2,v3])
                })
            });
        })
        return   res
    }
    Listproto.getFinderfn=function(propname,predi){
        var fn;
        this.config.finders=this.config.finders||{};
        if(predi&&typeof(predi)=="object"){
             if(predi instanceof RegExp){fn= function(v){return this.re.test((v&&this.p)?v[this.p]:v)}.bind({re:predi,p:propname})}
             if(Array.isArray(predi)){fn= function(v){return this.a.indexOf((v&&this.p)?v[this.p]:v)>=0}.bind({a:predi,p:propname})}
         }
        else {
            if(propname&&predi!=null&&typeof(predi)!="object"){
                    if(propname == "id") {
                        fn=List._finders.id (predi, this.config)
                    }else if(fn=this.config.finders[propname]) {
                        fn=fn (predi);
                    }else if(fn=this.config.finders.prop) {
                        fn=fn (propname, predi);
                    }else {
                        fn=List._finders.prop (propname, predi, this.config);
                    }

            }  else {
                if(!propname && !predi){fn =function(a){return a == predi}}
                else{
                    fn =List._makefn((propname?(propname+" == "):"")+String(predi),this,true)
                }
            }
         }
        return fn;
    }

    Listproto.finder=function(propname,predi,mx,strict){
        var primitiveCheck,byId=propname=="id"  ,fn=null , r=[], ln=this.size ();

        //if(!fn) {
        if(propname==null&&(typeof(predi)=="number"||(typeof(predi)=="string"&&!/[^\w_]/.test(predi)))){
                 propname="id"; byId=true
        }
        if(byId){primitiveCheck=predi}

         fn=(propname == null&&typeof(predi) == "function") ? predi :
                    this.getFinderfn (propname, predi)

        if(typeof(fn)!="function"){
            fn=function(v){return v==predi}
                }
        var lim=Math.max(0,mx|0)||ln+ 1,l=this
         this.each(function(val,i){
             if(byId&&typeof(val)!="object"){if(val!=primitiveCheck){return}}
            else if(!fn(val,i,l)){return}

            if(r.push(val)>=lim){
                return $BREAK
        }
        })

        var res= mx===1? r[0]:this.prep(r)
        return res
    }
    Listproto.first=function(){  return this.getAt(0)}
    Listproto.last=function(){  return this.getAt(-1)}
    Listproto.top=function(howmany){if(!~~howmany){return this.first()}
        return  this.sublist(~~howmany||1) }
    Listproto.bottom=function(howmany){if(!~~howmany){return this.last()}
        return this.sublist(0-(~~howmany||1)) }
    Listproto.rest=function(howmany){return  this.sublist(1) }
    Listproto.sublist=function(nu,end){var res ,ln=this.size()
        if(!nu){nu=0}
        if(nu&&typeof(nu)!="object" && ~~nu !=0){
            if(nu<0){nu=ln +nu}
            end=~~end;if(end<0){end=ln+end}
            if(!(end && end>nu)){end=undefined}
            res=this.slice(nu,end)
        } else if(typeof(nu)=="object" && "length" in nu && nu.length>0){
            res=List.from(nu).setConfig(Object.create(this.config))
        }

        return res
    }
    Listproto.findResults=function(fn1,strict){
        if(typeof(fn1)=="boolean"){strict=fn1;fn1=null}
        var res=[],fn=fn1?List._makefn(fn1,this):null;
        this.each(function(v){
            var it=fn?fn(v):v
            if((!strict&&it)||it!=null){res.push(it)}
        })

        return    this.prep(res)
    };
    Listproto.findResult=function(fn1,strict){
        if(typeof(fn1)=="boolean"){strict=fn1;fn1=null}
        var fn=fn1?List._makefn(fn1,this):null,r=null;
        this.each(function(v){
            var it=fn?fn(v):v
            if((!strict&&it)||it!==null){r= it;return $BREAK}
        })

        return    r
    };
    Listproto.compact=function(strict){
        return  this.removeAll(strict?null:function(it){return !it})
    };

    Listproto.sortIndex=function sortIndex(val,comparat){
        var comparator=comparat||function(a,b){return a-b}
        var idx=this.indexOf(val)
        if(idx>=0){return idx}
        var found=this.sort(comparator).find(function(a){return comparator(a,val)>0})
        if(found!=null){
            idx=this.indexOf(found)
        }
        return idx

     }
    Listproto.avg=function(nm){
        return this.sum(nm)/this.size() }
    Listproto.sum=function(nm){
        var fn=nm?List._makefn(nm,this):function(a){return a};
        return this.reduce(function(m,it){return m+fn(it)},0) }
    Listproto.max=function(nm){
        var fn=nm?List._makefn(nm,this):function(a){return a};
        return this.size()?this.collect(function(it){return {k:it,v:fn(it)}})
            .sort(function(a,b){return a.v-b.v})
            .pop().k:null
    }
    Listproto.min=function(nm){
        var fn=nm?List._makefn(nm,this):function(a){return a};
        var ret=this.size()?this.collect(function(it){return {k:it,v:fn(it)}})
            .sort(function(a,b){return a.v-b.v})[0].k:null
        return ret;
    }
    Listproto.match=(function( ){
        function chk(data ){var d=data,mthchs=true,st=d.rnng,w=0;
            for(var i=0;i<d.fln;i++){var f=d.fns[i];
                if(!(f&&f[1] (d.l.slice(i+d.rnng,i+d.rnng+f[0])))){ mthchs=false;break;}
                w=w+f[0]
            }
             if(mthchs ){
                if(d.res.push(d.l.slice(d.rnng,d.rnng+w))>=d.howmany){return;}
            }
            d.rnng++
            if( d.rnng<=d.max){ chk(data)}
        };
        return function  match(howmany,fnarr){var totln=0,ths=this

            if(typeof(howmany)!="number"){throw new Error("Invalid arguments. 'hownany' must be a number")}
            if(fnarr.length==2&&typeof(fnarr[1])=="function"&&typeof(fnarr[0])=="number"){fnarr=[fnarr]}
            if(typeof(fnarr)=="function"){fnarr=[[1,fnarr]]}
            var  fns=fnarr.map(function(it){var a=Array.isArray(it)?it:[1,it];
                if(a.length==1){a.unshift(1)}
                if(typeof(a[1])!="function") {
                    a[1]=typeof(a[1])=="string"?List._makefn(a[1],ths,true):(function(cnt, val){
                        return function(v){
                            for(var j=0; j<cnt; j++) {
                                if(v[j] != val[j]) {
                                    return false
                                }
                            }
                            return true
                        }
                    }) (a[0], [].concat(a[1]==null?[]:a[1]));


                };
                totln=totln+a[0]
                return a;
            })

            var data={l:this,fns:fns,ln:this.length,res:[],max:this.length-totln,fln:fns.length,rnng:0,howmany:howmany||Number.MAX_SAFE_INTEGER||Number.MAX_VALUE||999999 }
            if(data.fln==1&&data.fns[0][0]==1){data.res=this.filter(data.fns[0][1])}
            else{chk(data);}
            if(data.howmany===1){return data.res[0]}
            return data.res
        }
    })();
    Listproto.matchAll=function(fnarr){
        return this.match(0,fnarr)
    }
    Listproto.matchOne=function(fnarr){
        return this.match(1,fnarr)
    }
    Listproto.asKeyValueSet=function(keyname,valuename){
        keyname=keyname||"key"
        valuename=valuename||"value"
        return this.collect(function(it,i){var m={}
            m[keyname]=i;m[valuename]=it;
            return m
        });
    }
    Listproto.grep=function(fn1,noesc){var ex=fn1
        if(typeof(fn1)=="string"){try{ex=new RegExp(!noesc?RegExp.escape(fn1):fn1)} catch(e){ex=fn1}}
        return this.findAll( ex)
    }
    Listproto.findAll=function(fn1){return  this.finder(null,fn1,0) }
    Listproto.findAllBy=function(prop,val,max){return  this.finder(prop,val,max) }
    Listproto.findBy=function(prop,val){return  this.finder(prop,val,1) }
    Listproto.findById=function(v ,strict){return  this.finder("id",v,1,strict) }
    Listproto.find=function(fn1,nill){if(this.indexOf(fn1)>=0){return fn1}
        if(typeof(fn1)=="string"&&fn1.indexOf("UUID")==0) {
            var map=$.objectMap, r,brek=$BREAK
            this.each (function(val, i){
                if(val&&typeof(val) == "object") {
                    var m=map.get (val)
                    if(m&&m._uuid == fn1) {
                        r=val
                        return brek
                    }
                }
            });
            return r

        }
        return  this.finder(null,fn1,1)
    }
    Listproto.findIndex=function(fn1) {
        var val=this.find(fn1)
        if(val!=null){
            return this.indexOf(val)
        }
        return -1
    }

    List._makefn=function (fn1,_list,asboolean){var fn=fn1 ,wrapidx=0;
        if(fn1&&typeof(fn1)=="object") {
            if(fn1 instanceof RegExp) {   return RegExp.prototype.test.bind (fn1) }
            if(Array.isArray (fn1)) {
                return function(v){  return this.indexOf (v)>=0  }.bind (fn1)
            }
        }
         if(fn1&&typeof(fn1)=="string"&&_list&&_list.length&&_list[0]!=null&&(typeof(Object(_list[0])[fn1])=="function")){
            fn=_list[0][fn1]
        } else if(fn1&&typeof(fn1)=="string"){
          if(/\bi\b/.test(fn1)){
              try{
                  return Function("it,i,arr","return "+fn1.replace(/@\.?/g,"it."))
              } catch(e){}
              wrapidx=1
          } else {
                if(!/\s/.test(fn1) && /^[a-z]/i.test(fn1)){
                    var arr=fn1.split(/\./)
                    if(arr[0]&& arr[0]!=="it"){var prop=arr[0]
                        if(prop.indexOf("(")>=0){prop=prop.substr(0,prop.indexOf("("))}
                        if(prop && _list && _list.length && _list[0]!=null&& prop in Object(_list[0])){
                             fn="it."+fn1
                        }
                    }
                }

          }
        }

        fn=$.fnize( fn, {context:_list,asboolean:asboolean,force:true,args:["it","i","arr"]})
        if(typeof(fn)!="function"){
             fn=Function("return "+((typeof(fn1)=="number"||typeof(fn1)=="boolean")?fn1:("'"+fn1+"'")))
        }

        return fn;
    }
    Listproto.collect=function(fn1){
        var fn = List._makefn(fn1,this,false);
        if(!fn){return}
        var nu
        if(fn.length===1){
            nu=this.map(function(a){return fn(a)});
        }
        else {nu=this.map(fn);}
        return this.prep(nu);
    }
    Listproto.intersect=function(){
         var a=[].slice.call(arguments),all=[]
        if( a.every(function(it){return Array.isArray(it)})){
            all=a;
        } else{all=[a]}
        var res=this.toArray(),torem=[]
        this.each(function(it,idx){
            for(var i=0,ln=all.length;i<ln;i++){var ar=all[i]
                if(ar.indexOf(it)==-1){torem.push(idx);break;}
            }
        });
         while(torem.length){ res.splice(torem.pop(),1) }
        return this.prep(res)


    }
    Listproto.flatten=function(incnulls,uniq,mutate ){
        var res=[]
        function _inner(l){
            if(l&&typeof(l)=="object"&&l.length>0){
                for(var i=0,ln=l.length,it;it=l[i],i<ln;i++){
                    _inner(it)
                }
            } else if(incnulls  || (l!=null)){
                if(!uniq||res.indexOf(l)===-1){res.push(l)}
            }
        }
        _inner(this)
        if(mutate){
            this.clear().addAll(res)
            return this

        }
        return List.from(res)
    }
    List.create=function(){
        var docompact,a=arguments;
        if(a[0]===true){
            docompact=true;
            a=[].slice.call(arguments,1)
        }
        if(typeof (a[0])=="number" && a.length==2 && typeof(a[1])=="function" ){
            var nu= new List()
            nu.fill( a[1],0,  a[0])
            return nu
        }
        if(a.length==1&& List.isList(a[0])){
            return a[0]
        }
        var vals=(!a.length||(a.length==1&&a[0]==null))?[]:_flattenArgs(a)
        return docompact?(new List(vals)).compact():new List(vals)
    }
    List.isList=function(a){
        return a && typeof(a)=="object" && a instanceof List
    }
    List.from=List.create
    List.range=function(){
        var start=arguments[0]|0,end=arguments[1]| 0,inc,nu=[]
        if(arguments.length==1){start=0;end=arguments[0]|0}
        inc=(end-start)/Math.abs(end-start);
        var i=-1,c=Math.abs(end-start)
        while(++i<=c){
            nu.push(start+i)
        }
        return List.from(nu)

    }
    List.$BREAK=$BREAK
   
    /*
     Object.keys(Listproto).forEach(function(k){if(k in Object||k=="_init"){return}
     $.A[k]=(function(mthd){
     var m=mthd;
     return function(list){
     return m.apply(List.from(list),[].slice.call(arguments,1))
     }
     })(Listproto[k]);
     })
     */
    $.A=(function(){
        var PROTO=Array.prototype
        function  fnize(val) {
            return $.fnize(val)
        }
       var A=function(arr){return  toArray(arr)}
        function augment(arr){
            arr=arr||[]
            if( arr.__augmented){return arr}
            if(!A.__protofns){
                A.__protofns=Object.keys(A).filter(function(k){return k.indexOf("_")!=0 && k!="augment"  &&   typeof(A[k])=="function"})
            }
            A.__protofns.forEach(
                function(k){arr[k]=A[k].curry(arr)}
            );
            Object.defineProperty(arr,"__augmented",{value:true,enumerable:false,writable:false,configurable:false})
            return arr
        }
          function toArray(arr,noaugment){
             if(noaugment && noaugment.__augmented){return noaugment}
            if(arr==null){return  augment([])}
            if(typeof(arr)=="string"){return  augment(arr.split(/\s+/))}
            if(typeof(arr)!="object"){return  augment([arr])}
            if(!(arr instanceof Array)){
                return noaugment===true?[].slice.call(arr): augment([].slice.call(arr))
            }
            return noaugment===true?arr: augment(arr);
        }
         function toggle(arrarg,val){
            var arr=toArray(arrarg,this)
            if(!arr.contains(val)){
                arr.add(val)
            } else {arr.remove(val)}
            return arr
        }
        function contains(arrarg,val){
            var arr=toArray(arrarg,this)
            return arr.indexOf(val)>=0
        }
        function each(arrarg,val,ctx){
            var arr=toArray(arrarg,this),BREAK=List.$BREAK
            var fn=val? fnize(val):function(a){return a}
            for(var i= 0,ln=arr.length;i<ln;i++){
                if(fn.call(ctx||arr,arr[i],i,arrarg)===BREAK){
                    break;
                }
            }
        }
        function findResults(arrarg,fn1,strict){var arr=toArray(arrarg,this)
            if(typeof(fn1)=="boolean"){strict=fn1;fn1=null}
            var res=[],fn=fn1?fnize(fn1,this):null;
            arr.each(function(v){
                var it=fn?fn(v):v
                if((!strict&&it)||it!==null){res.push(it)}
            })

            return    augment( res)
        };
        function findResult(arrarg,fn1,strict){var arr=toArray(arrarg,this)
            if(typeof(fn1)=="boolean"){strict=fn1;fn1=null}
            var fn=fn1?fnize(fn1,this):null,r=null;
            arr.each(function(v){
                var it=fn?fn(v):v
                if((!strict&&it)||it!==null){r= it;return $BREAK}
            })

            return    r
        };
        function take(arrarg,howmany){
            var arr=toArray(arrarg,this)
            return arr.splice(0,Number(howmany)||1)
        }
        function last(arrarg,res){
            var arr=toArray(arrarg,this)
            return arr[arr.length-1]
        }
        function first(arrarg,res){
            var arr=toArray(arrarg,this)
            return arr[0]
        }
        function onchange(arrarg,callback){
            var arr=toArray(arrarg,this)
            if(!arr.__observer){
                var C=callback
                Object.observe(arr,arr.__observer=function(recs){
                    var res={len:0}
                    for(var i= 0,ln=recs;i<ln;i++){
                        var R=recs[i]
                        if(R.name=="length" || isNaN(R.name)){continue}
                        var t=R.type=="add"?"added":(R.type+"d")
                        res[t]||(res[t]=[])
                        res[t].push(R.name)
                    }
                    res[t].len=recs[0].object.length
                    C(res);
                })
            }
            arr.push(res)
            return arr
        }
        function add(arrarg,res){
            var arr=toArray(arrarg,this)
            arr.push(res)
            return arr
        }
        function addAll(arrarg,res){
            var arr=toArray(arrarg,this)
            if(res==null){
                return arr
            }
            if((res instanceof Array) || (res && typeof(res)=="object" && typeof(res.length)=="number")){
                PROTO.push.apply(arr,res)

            }
            return arr
        }
        function flatten(arrarg,incnulls,uniq,mutate ){
            var arr=toArray(arrarg,this)
            var res=[]
            function _inner(l){
                if(l&&typeof(l)=="object"&&l.length>0){
                    for(var i=0,ln=l.length,it;it=l[i],i<ln;i++){
                        _inner(it)
                    }
                } else if(incnulls  || (l!=null)){
                    if(uniq&&res.indexOf(l)>-1){return}
                    res.push(l)
                }
            }
            _inner(arr)
            if(mutate!==false){
                arr.clear().addAll(res)
                return arr

            }
            return  augment( res)
        }
        function unique(arrarg ){
            var arr=toArray(arrarg,this)
            var torem=[]
            for(var i= 0,ln=arr.length;i<ln;i++){
                var idx=arr.lastIndexOf(arr[i])
                if(idx>i){torem.push(i)}
            }
            while(torem.length){
                var idx=torem.pop()
                arr.splice(idx,1);
            }
            return arr
        }
        function clear(arrarg){
            var arr=toArray(arrarg,this);
            arr.splice ( 0,arr.length)
            return arr
        }
        function clone(arrarg){
            var arr=toArray(arrarg,this);
            var nu=[],dsecript
            PROTO.push.apply(nu,arr)

            return augment(nu)
        }
        function compact(arrarg,notstrict){
            var arr=toArray(arrarg,this)
            var torem=[]
            for(var i= 0,ln=arr.length;i<ln;i++){
                if(arr[i]==null || (!notstrict && !arr[i])){torem.push(i)}
            }
            while(torem.length){
                var idx=torem.pop()
                arr.splice(idx,1);
            }
            return arr
        }
        function groupBy(arrarg,fnorfield){
            var arr=toArray(arrarg,this)
            var gpmap={}
            for(var i= 0,ln=arr.length;i<ln;i++){
                var val=typeof(fnorfield)=="function"?fnorfield(arr[i],i,arrarg):((arr[i]||{})[fnorfield])
                var k=""
                if(val!=null && (typeof(val)!="object"||typeof(val)!="function")){
                    k=String(val)
                } else{
                    continue
                }
                if(k){
                    if(!gpmap[k]){
                        gpmap[k]=augment([])
                    }
                    gpmap[k].push(arr[i])
                }
            }
            //passes list, key,  to callback
            gpmap.each=function(fn){
                for(var i= 0,l=Object.keys(this),ln=l.length;i<ln;i++){
                    if(typeof(l[i])!="string" || !(this[l[i]] instanceof Array)){continue}
                    fn(this[l[i]],l[i],this)
                }
                return this
            }
            return gpmap
        }
        function groupsOf(arrarg, num){
            var arr=toArray(arrarg,this)
            var rnng=0,n=Math.max(1,~~num) ,res=[[]];
            for(var i= 0,ln=arr.length;i<ln;i++){
                var k=~~(i/n);
                k>rnng&&(rnng=res.push([])-1);
                res[rnng].push(arr[i])
            }
            return res
        }
        function removeAt(arrarg,val){
            var arr=toArray(arrarg,this)
            if(typeof(val)=="number"){
                arr.splice(+val,1)
            }
            return arr
        }
        function avg(arrarg,nm){
            var ln=arrarg.length
            if(!ln){return 0}
            return sum(arrarg,nm)/ln
        }
        function sum(arrarg,nm){
            var arr=toArray(arrarg,this)||[]
            var fn=val? fnize(val):function(a){return a}
            return arr.reduce(function(m,it){
                return m+fn(it)
            },0)
        }
        function max(arrarg,val){
            var arr=arrarg||[]
            var fn=val? fnize(val):function(a){return a}
            var ln=arr.length||0,res=-1,cmprtr=null
            for(var i= 0 ;i<ln;i++){
                var V=fn(arr[i])
                if(cmprtr===null || V>cmprtr){cmprtr=V;res=i}
            }
            return arr[res]
        }
        function min(arrarg,val){
            var arr=arrarg||[]
            var fn=val? fnize(val):function(a){return a}
            var ln=arr.length||0,res=null,cmprtr=null
            for(var i= 0 ;i<ln;i++){
                var V=fn(arr[i])
                if(cmprtr===null || V<cmprtr){cmprtr=V;res=i}
            }
            return arr[res]
        }
        function removeAll(arrarg,val){
            var arr=toArray(arrarg,this)||[]
            if(Array.isArray(val)){var ln=arr.length;
                if(val.every(function(a){return typeof(a)=="number" && a>=0 && a<ln})){
                    val.sort(function(a,b){return b-a})
                    while(val.length){
                        arr.splice(val.pop(), 1)
                    }
                } else {
                    while(val.length){
                        remove(arr,val.pop())
                    }
                }
            }
            if(typeof(val)=="function") {
                var target;
                while (target = arr.find(val)){
                    var idx = arr.indexOf(target)
                    if (idx >= 0) {
                        arr.splice(idx, 1)
                    }

                }
            } else{

            }
            return arr
        }
        function remove(arrarg,val){
            var arr=toArray(arrarg,this)
            var idx=arr.indexOf(arrarg)
            if(idx>=0){
                arr.splice(idx,1)
            } else if(typeof(val)=="number"){
                arr.splice(+val,1)
            } else if(typeof(val)=="function"){
                var target=arr.find(val)
                if(target){
                    idx=arr.indexOf(target)
                    if(idx>=0){
                        arr.splice(idx,1)
                    }
                }
            }
            return arr
        }
        function   collect(arrarg,val,ctx){
            var arr=arrarg
            var fn= fnize(val);
            if(!fn){
                return
            }
            var res=[]
            for(var i= 0,ln=arr.length||0;i<ln;i++){
                res.push(fn.call(ctx||arr,arr[i],i,arr))
            }
            return augment(res);
        }
        function   findAll(arrarg,val){
            var arr=arrarg
            var fn=null
            if(typeof(val)=="function"){fn=val}
            if(typeof(val)=="string" && (val.indexOf("$")>=0 || val.trim().indexOf("->")==0|| val.trim().indexOf("=>")==0) ){
                fn=  fnize(val)
            }
            var res=[],ln=arr.length||0
            if(fn){
                for(var i= 0,ln=arr.length||0;i<ln;i++){
                    fn(arr[i]) &&res.push(arr[i])
                }
            } else{
                for(var i= 0;i<ln;i++){
                    arr[i]==val && res.push(arr[i])
                }
            }

            return augment(res);
        }
        function fill(arrarg,val,start,end){
            if(typeof(arrarg)=="function"){
                end=start
                start=val
                val=arrarg;
                arrarg=[];
            }
            var arr=toArray(arrarg,this)
            var size=arr.length;
            if(end==null && start>0){
                end= start;
                start=0;
            }
            if(end==null && start==null && size){
                start=0;
                end=size;
            }
            start=start||0 ;
            if(start<0){
                start=size+start;
                end=size;
            }
            if(!end||end<0){
                end=size
            }
            start= Math.max(0,Number(start)||0) ||0
            if(end<start){
                return arr
            }

            var fn=null
            if(typeof(val)=="function"){fn=val}
            if(typeof(val)=="string" && (val.indexOf("$")>=0 || val.trim().indexOf("->")==0|| val.trim().indexOf("=>")==0) ){
                fn=  fnize(val)
            }
            for(var i=start;i<end ;i++){
                arr[i]=fn?fn(i):val
            }
            return arr
        }
        function sortBy( arrarg,nm,mutate){
            var arr=toArray(arrarg,this)
            var revrse=0
            if(typeof(nm)=="string" && nm.charAt(0)=="-"){
                revrse=1;
                nm=nm.substr(1).trim()
            }
            var res=mutate===false?  clone(arr):arr,fn=fnize(nm,res);
            res.sort(function(a,b){
                var aa=fn(a),bb=fn(b);
                return aa==bb?0:aa>bb?1:-1
            })
            if(revrse){res.reverse()}
            return res

        }

        Object.assign(A,{
            augment:augment,
            toArray:toArray,
            toggle : toggle ,
            contains : contains ,
            each : each ,
            findResults : findResults ,
            findResult : findResult ,
            take : take ,
            last : last ,
            first : first ,
            add : add ,
            addAll : addAll ,
            flatten : flatten ,
             unique : unique ,
            clear : clear ,
            clone : clone ,
            compact : compact ,
            groupBy : groupBy ,
            groupsOf : groupsOf ,
            removeAt : removeAt ,
            avg : avg ,
            sum : sum ,
            max : max ,
            min : min ,
            removeAll : removeAll ,
            remove : remove ,
            collect : collect ,
            findAll : findAll ,
            fill : fill ,
            sortBy:  sortBy,
            onchange:onchange
        })
        return A;
    })();
    
   
    List.plugin={
        emitter:function(l){var list=List.create(l)
            list.config=list.config||{}
            if(!(list.config&&list.config._observer)){
                list.config=list.config||{};
                var emt=list.config._observer=$.emitter.simpleObserver(list)
                list.fire=emt.fire.bind(emt)
                list.on=emt.on.bind(emt)
                list.off=emt.off.bind(emt)

                list.emitter=emt
            }
            return list
        }   ,

        selectionModel:function(list,config){
            function $SelectionModel(list,config){
                if(typeof(list.unselect)=="function"){return list}
                config=config||{}
                if(typeof(config)=="function"){config.onselect=config}
                var listconfig=config ,l= List.plugin.emitter(list)
                if(l.config._hasSelectionModel) {return list}
                l.config._hasSelectionModel=true

                 if(config.onselect){this.getObserver().on("select",config.onselect)}
                l.toggle=function(el){
                    var multi= listconfig.multi,
                        sl= listconfig.selList||( listconfig.selList=[]);
                    var sel=this.find.apply(this,arguments)
                    if(sel){
                        if(this.isSelected(sel)){
                            this.unselect(sel)
                        } else{
                            this.select(sel)
                        }
                    } else{
                        if(multi){
                            this.each(
                                function(it){
                                    var idx=sl.indexOf(it)
                                    if(idx>=0){
                                        sl.splice(idx,1)
                                    } else{
                                        sl.push(it)
                                    }
                                }
                            );
                            this.getObserver().fire("select",this.getSelection(),this)
                        }
                    }


                }
                l.select=function(){
                    var multi= listconfig.multi,
                        sl= listconfig.selList||( listconfig.selList=[]);
                    var sel=this.find.apply(this,arguments)
                    var i=sel==null?-1:sl.indexOf(sel)
                    if(typeof(multi)=="number" && multi>1){
                        if(sl.length>=multi){return}
                    }
                    if(sel&&i<0){
                        if(!multi){
                            sl[0]&&this.getObserver().fire("unselect",sl[0],this)
                            sl[0]=sel
                        }
                        else{
                            sl.push(sel) }
                        if( listconfig.toggleClass){
                            var c= listconfig.toggleClass;
                            this.each(
                                function(it){
                                    if(!it){return}
                                    if(sl.indexOf(it)==-1){it.removeClass&&it.removeClass(c)}
                                    else{it.addClass&&it.addClass(c)}
                            }
                            )
                        }
                        this.getObserver().fire("select",this.getSelection(),this)
                    }
                    return this
                }
                l.unselect=function(){
                    var sl=this.getSelection();
                    var sel=this.find.apply(this,arguments)
                    var i=sel==null?-1:sl.indexOf(sel)
                    if(i>=0){
                        sl.splice(i,1)
                        var c= listconfig.toggleClass;
                        c&&sel.removeClass&&sel.removeClass(c)
                        this.getObserver().fire("unselect",sl,this)
                    }
                    return this
                }
                l.isSelected=function(el){
                    var sel=this.find.apply(this,arguments)
                    if(sel!=null){
                        return this.getSelection().indexOf(sel)>0
                    }
                }
                l.clearSelection=function(){
                    if( listconfig.selList){
                        listconfig.selList.length=0
                    }
                    return this
                }
                l.getSelection=function(){
                    var  sl= listconfig.selList||( listconfig.selList=[]);
                    return  listconfig.multi?sl:sl[0]
                }
                l.bindToAnchor=function(anchor){

                }
                l.show=function(opts){

                }
                return l
            }
            return $SelectionModel(list,config)
        }
    }
    scope.ItemList=scope.List=List
    scope.UniqList=function(){
        var nu=new  List().setUniq(true).addAll(_flattenArgs(arguments))
        return nu;
    }
    $.collection=List;


    //maplist

})(window);
List.parseList=(function( ){
    var _ItemCtor=null
    function getItemCtor(optns,addtnl){
        if(!_ItemCtor) {
            _ItemCtor=   function (record) {
                if (record === null) {
                    return
                }
                this.init(record)
            };
           var _prototype = {
                init:function(record){
                    if (!record || typeof(record) != "object") {
                        this.record = {id: record == null ? "" : record, label: record == null ? "" : record}
                    }
                    else {
                        this.record = record;
                    }
                }
            };
            Object.defineProperties(_prototype, {
                options: {value: {options: {}}, writable: false, configurable: true, enumerable: false},
                label: {
                    get: function () {
                        return this.record && this.record[this.options.labelname]
                    }, set: function () {
                    }, enumerable: true
                },
                id: {
                    get: function () {
                        return this.record && this.record[this.options.keyname]
                    }, set: function () {
                    }, enumerable: true
                },
                dom: {
                    get: function () {
                        return this.record && this.record._dom
                    }, set: function (el) {
                        this.record && (this.record._dom = $d(el))
                    }, enumerable: true
                }

            });
           _prototype.matchRe = function (val) {
                return val && val.test(this.label || "")
            }
           _prototype.match = function (val) {
                if (val == null) {
                    return
                }
                if (val.test) {
                    return this.matchRe(val)
                }
                return this.record == val || this.matchId(val) || this.matchLabel(val)
            }
           _prototype.matchId = function (id) {
                return this.id == id
            }
           _prototype.matchLabel = function (lbl) {
                return this.label == lbl
            }

            _prototype.constructor = _ItemCtor
            _ItemCtor.prototype=_prototype
            _ItemCtor.makeCtor=function(optns,addtnl){
                var options= addtnl?$.extend({},optns,addtnl):optns
                var ctor=function (record) {
                    this.init(record)
                }
                ctor.prototype=new _ItemCtor(null)
                Object.defineProperty(ctor.prototype, "options",
                    {value: $.isPlain(options)?options:{}, writable: false, configurable: true, enumerable: false}
                );
                if (options && $.isPlain(options)) {
                    if ( $.isPlain(options.itemproto)){
                        $.each(options.itemproto, function (v, k) {
                            ctor.prototype[k] = v;
                        })
                    }
                }
                ctor.prototype.constructor = ctor
                return ctor
            }
        }
        
        return _ItemCtor.makeCtor(optns,addtnl)
    }

    function LookupList(list,optns,addtnl){
        this.options=optns||{};
        Object.defineProperty(this,"_list",{value:[],writable:false,configurable:true,enumerable:false});
        Object.defineProperty(this,"length",{get:function(){return this._list.length},set:function(){},configurable:true,enumerable:true});
        this.parse(list,optns,addtnl)

    }
    LookupList.prototype={}
    LookupList.prototype.parse=function(list,options,addtnl){
        var optns=$.extend({},this.options,options||{})
        var _li, listoptns = optns.list || {}, _list , template,
            labelname = listoptns.labelname || optns.labelName,
            keyname = listoptns.keyname || optns.keyName,
            labelprovider = optns.labelprovider || listoptns.labelprovider,
            keyprovider = optns.keyprovider || listoptns.keyprovider,
            itemtemplate = optns.itemtemplate || listoptns.itemtemplate  //st

        if(typeof(labelprovider)=="string"){
            if(labelprovider.indexOf("$")>=9){
                labelprovider= $.template(labelprovider)
            }
            else{
                labelname=labelprovider;
                labelprovider=null
            }
        }
        if(typeof(keyprovider)=="string"){
            if(keyprovider.indexOf("$")>=9){
                keyprovider= $.template(keyprovider)
            }
            else{keyname=keyprovider;
                keyprovider=null
            }
        }
        if (typeof(list) == "function") {
            list = list()
        }
        if (list && list.data && typeof(list.data) != "function") {
            list.list = list.data
        }
        if (list && list.list) {
            labelname = labelname || list.labelname
            keyname = keyname || list.keyname
            _list = list.list
        } else {
            _list = _list || list
        }
        if (itemtemplate) {
            template = $d.template(itemtemplate)
        }
        if($.isPlainObject(_list)){
            labelname="label"
            keyname="id"
            _list=Object.keys(_list).reduce(function(m,k){
                if(_list[k]!=null && typeof(_list[k])!="object" && typeof(_list[k])!="function"){
                    m.push({id:k,label:String(_list[k])})
                }
                return m
            },[])
        } else if (typeof(_list)=="string") {
            _list=_list.split(/\s+/)
        }
        if (_list && _list.length && (!(labelname &&labelprovider)|| !(keyname && keyprovider))) {
            if (_list[1] || _list[0]) {
                var tst = _list[1] || _list[0]
                if (tst && typeof(tst) == "object") {
                    var kys = typeof(tst.keys)=="function"?tst.keys():Object.keys(tst)
                    if(!keyname) {
                        if (tst.id != null) {  keyname = "id"    }
                        else if (kys.indexOf("id") >= 0) {  keyname = "id"  }
                    }
                    if(!labelname){
                        if(kys.indexOf("label")>=0){labelname = "label"}
                        else if(kys.indexOf("name")>=0){labelname = "name"}
                    }

                    if ((!labelname || !keyname)) {
                        keyname = keyname||kys.shift();
                        labelname = labelname||kys.shift()
                    }

                }
            }
        }
        if (!labelprovider && labelname && labelname.indexOf("$") >= 0) {
            labelprovider = $.template(labelprovider)
        }
        var fin = []
        if (labelprovider || keyprovider) {
            if(!keyprovider && !keyname){keyname="id"}
             for (var i = 0, l = _list, ln = l.length, it; it = l[i], i < ln; i++) {
                if (!it) {
                    continue
                }
                if (typeof(it) == "string"||typeof(it) == "number"||typeof(it) == "boolean") {
                    fin.push({id: it, label: String(it), gp: it.gp || "-"})
                }
                else{
                    var id=keyprovider?keyprovider(it):(typeof(it) == "object" && keyname ? it[keyname] : it)
                    fin.push({id:id , label: labelprovider?labelprovider(it):(typeof(it) == "object" && labelname ? it[labelname] : String(id)), gp: it.gp || "-"})
                }
            }

            keyname =keyname|| "id";
            labelname = labelname||"label";
        } else {
            fin = [].slice.call(_list)
        }
        this.options.keyname=keyname||"id"
        this.options.labelname=labelname||"label"
        if(typeof(labelprovider)=="function"){

        }
        if(!this.__itemCtor){
            this.__itemCtor=getItemCtor(this.options,addtnl);
        }
        var Item=this.__itemCtor;

        this._list.splice(0,this._list.length);
        [].push.apply(this._list,fin.map(function(a){
            return new Item(a)
        }));
        return this
    }
    LookupList.prototype.getList=function(){
        return this._list
    }
    LookupList.prototype.size=function(){
        return this._list.length
    }
    LookupList.prototype.collect=function(fn,ctx){ctx=ctx||null
        return this._list.map(function(a){return fn.call(ctx,a)})
    }
    LookupList.prototype.applyTemplate=function(template,usedata,ctx){
        if(typeof(template)=="string"){template= $.template(template)}
        ctx=ctx||null
        if(usedata===true){
            return this._list.map(function(a){return fn.call(ctx, a.record)})
        }
        return this.collect(template,ctx)
    }

    LookupList.prototype.clearSelection=function(){ delete this.__selection  }
    LookupList.prototype.getSelection=function(id){  return this.__selection  }
    LookupList.prototype.setSelection=function(id){
        this.__selection= this.findModel(id)
    }

    LookupList.prototype.findModel=function(val){
        if(val==null || val instanceof  this.__itemCtor){return val}
        return this._list.find(function(a){
            return a.match(val)
        }.bind(this))
    }

    LookupList.prototype.findByLabel=function(lbl){
        if(id==null){return}
        return this._list.find(function(a){
            return a.matchLabel(lbl)
        }.bind(this))
    }
    LookupList.prototype.findById=function(id){
        if(id==null){return}
        return this._list.find(function(a){
            return a.matchId(id)
        }.bind(this))
    }
    LookupList.prototype.searchText=function(txt,optns){
        this.__cache||(this.__cache={});
        if(!txt){return}
        var reTest
        var filterfn=(this.options||{}).filterfn||(optns||{}).filterfn
        if(!filterfn && typeof(optns)=="function"){
            filterfn=optns;
            optns=null
        }
        if(!$.isPlain(optns)){optns=null}
         optns=optns||this.options||{}
        var flags=[],ops=[]

        if(optns.caseinsenstive ||optns.ignorecase){
            flags.push("i")
        } else if(optns.onlystart||optns.startswith||optns.startsWith||optns.location=="^"){
            ops.push("^")
        } else if(optns.onlyend||optns.endswith||optns.endsWith||optns.location=="$"){
            ops.push("$")
        }
        var ckey=flags.join("")+"--"+ops.join("")+"--"+txt
        if(this.__cache[ckey]){
            reTest=this.__cache[ckey]
        } else{
             ops=ops||[]
            if(typeof(txt)=="string"){
                var re=RegExp.escape(txt)
                if(ops.indexOf("^")>=0){
                    re="^"+re
                } else if(ops.indexOf("$")>=0){
                    re=re+"$"
                }
                reTest=new RegExp(re,flags?flags.join(""):"")

            } else if(txt instanceof RegExp){
                reTest=txt
            }
            if(reTest){
                this.__cache[ckey]= reTest
            }

        }
        if(reTest){
            if(filterfn){
                this._list.forEach(function(a){
                    filterfn.call(this,a,a.matchRe(reTest))
                }.bind(this))
                return this
            }
            else{
                return this._list.filter(function(a){
                    return a.matchRe(reTest)
                }.bind(this))
            }
        }
        return []
    }

  return function(list,optns,addtnl){

      return new LookupList(list,optns,addtnl)

  }


 })();
List.Observable=function(l){
    var list=List.create(l)
    if(!list.emitter) {
        list.emitter=$.emitter (list)
        $.observe (list, {ignorearrayops:true,onlyonchange:true},function(recs){
            if(recs && recs.length&&list.emitter){
                var ev,em=list.emitter;
                while(ev=recs.shift()){
                    if(ev.type=="delete" || !isNaN(ev.name) || ev.name=="length"){continue}
                    console.log(ev.type, ev)
                    ev.type&&em.fire (ev.type, ev)
                }
            }

        })
    }
    list.config||(list.config={});
    list.config.observable=true
    return list

}
ObservableList=(function( ){
    var ARRPROTO=Array.prototype,ARR=Array
    function _arr(v){return [].slice.call(v)}
    function _isarr(v){return ARR.isArray(v)}
    function _isarrLike(v){ return v?(_isarr(v)||(typeof(v)=="object"&&typeof(v.length)=="number"&&isFinite(v.length)&&v.length>=0)):!1}
    function _defineprop(o,k){
        Object.defineProperty(o.__proto__||o,String(k),{set:Function("v","this._set("+k+",v)"),get:Function("return this._get("+k+")"),enumerable:true,configurable:true})

    }

    function core(o){
        var _inner=[],_length=0,_listeners=[]
        var coreproto= {
            _state:{value:{instance:0,capacity:100,haslisteners:0,batchmode:0,reset:0,discarded:0},enumerable:false,writable:false,configurable:false},
            _get:{value:function(i){this.scan();
                return _inner[i]
            },enumerable:false,writable:false,configurable:true} ,
            _ensureCapacity:{value:function(v){
                var evalstr=[],props={},st=this._state
                if(v < st.capacity){return this}
                 for(var i=st.capacity;i<v;i++){
                    evalstr.push( "props['"+i+"']={set:function(v){this._set("+i+",v)},get:function(){return this._get("+i+")},enumerable:true,configurable:true}")
                }
                all=evalstr.join("; ");
                eval( all );
                Object.defineProperties(this.__proto__||this,props);
                st.capacity=v;
                return this
            }},
            scan:{value:function scan(){
                if(scan._busy){return}
                scan._busy=1
                try{
                    var l
                    if((l=Object.keys(this)).length){
                        var exp=this._state.expando||(this._state.expando=[]);
                        for(var i=0,ln=l.length,k;k=l[i],i<ln;i++){
                            if(exp.indexOf(k)>=0){continue}
                            exp.push(k)
                            if(!isNaN(k)){
                                var v=this[k];  delete this[k]
                                this._set(Number(k),v,true)
                            }
                        }
                    }
                }finally{scan._busy=0}
                return this
            },enumerable:false,writable:false,configurable:true},
            _sz:{value:function(v){this.scan()
                if(typeof(v)=="number"&&v>=0){
                    _length=_inner.length=v;
                };
                return _length||0
             },enumerable:false,writable:false,configurable:true} ,
                _rem:{value:function(i,howmany){
                    if(i===true){   //clear
                        for(var i=0,l=_inner,ln=l.length;i<ln;i++){ l[i]=null; }
                        _length=_inner.length=0;
                        this._dispatch( {type:"clear"})
                        return []
                    }
                    var r,ln=(howmany|0)||1
                    if(ln===1&&(i===0||i===-1)){
                        r=(i===-1)?_inner.pop():_inner.shift()
                    } else{
                        r= _inner.splice(i<0?_length+i:i,ln)
                    }
                    _length=_inner.length
                    this._dispatch( {type:"remove",data:r})
                    return r;
                },
                    enumerable:false,writable:false,configurable:true
                } ,
            reverse:{value:function(){return _inner.reverse();this._dispatch( {type:"order",reverse:true})},enumerable:false,writable:false,configurable:true} ,
            sort:{value:function(fn){
                return fn?_inner.sort(fn):_inner.sort();
                this._dispatch( {type:"order"})
            },enumerable:false,writable:false,configurable:true} ,
            _set:{value:function(i,v,insert){
                    if(_isarrLike(i)){ v=i;i=-1; }
                    i=i|0;
                    var ln=_length||_inner.length,idx=i,curr
                    if(_isarrLike(v)){
                        if(i===-1){_length=ARRPROTO.push.apply(_inner, _arr(v))}
                        else if(i===0){_length=ARRPROTO.unshift.apply(_inner, _arr(v))}
                        else{ARRPROTO.splice.apply(_inner, [i,0].concat(_arr(v)))
                            _length=_inner.length
                        }
                    } else{
                        idx=i<0?ln+i:i
                        if(insert===true||idx>=ln){
                            if(idx>=ln||i===-1){ _length=_inner.push(v)}
                            else if(idx===0){_length=_inner.unshift(v)}
                            else{
                                _inner.splice(idx,0,v)
                                _length=_inner.length
                            }
                        } else{
                            curr=_inner[idx]
                            if((typeof(v)!="object" && curr===v)||(curr&&v&&curr.$version&&curr.$version===v.$version)){return curr}
                            _inner[idx]=v
                        }
                    }
                    if(_length==null){_length=_inner.length}
                    this._ensureCapacity(_length)
                    this._dispatch({type:insert?"add":"update",index:idx,value:v,newValue:v,oldValue:curr})
                    return curr
                },enumerable:false,writable:false,configurable:true
                }
            }
            Object.defineProperties(o,coreproto);
        return o
    }
    function ObservableList(capacity,nulist){
         core(this)
        capacity=(capacity|0)||100
         this._ensureCapacity(capacity)
        this._state.instance=true;
        if(nulist!=null){
            this._set(nulist)
        }

    }
    var props={
        emitter:{get:function(){
            if(!(this._state&&this._state.instance)){return null}
            var _listeners={add:[],remove:[],update:[],order:[],"change":[]};
            var nu={
                on:function(type,fn){
                    if(!fn && typeof(type)=="function"){fn=type;type="change";}

                    if(typeof(fn)=="function"&&_isarr(_listeners[type])&&_listeners[type].indexOf(fn)==-1){
                        _listeners[type].push(fn)
                    }
                    this._state.haslisteners++
                    return this
                },
                off:function(type,fn){
                    if(_isarr(_listeners[type])&&_listeners[type].indexOf(fn)>-1){
                        _listeners[type].splice(_listeners[type].indexOf(fn),1)
                    }return this
                },
                fire:function(ev){var type=ev.type,ln,l=(_isarr(_listeners[type])?_listeners[type]:[]).concat(_listeners["*"])
                    if(ln=l.length){
                        for(var i=0;  i<ln;i++){
                            typeof(l[i])=="function" && l[i].call(this,ev)
                        };
                    }
                    return this
                }
            }
            delete this["emitter"]
            nu.fire=nu.fire.bind(this)
            nu.on=nu.on.bind(this)
            Object.defineProperty(this,"emitter",{value:nu,enumerable:false,writable:false,configurable:true})
            return nu;
        },set:function(){}
            ,enumerable:false, configurable:true},
        _dispatch:{value:function(ev){
            if(!this._state.haslisteners){return}
            this.emitter.fire(ev);
            return this
        },enumerable:false,writable:false,configurable:true
        },
        unshift:{value:function(){
            for(var i=0,l=[].slice.call(arguments),ln=l.length;i<ln;i++){
                this._set(0,l[i],true)
            };
            return this._sz()
        },enumerable:false,writable:false,configurable:true
        } ,
        splice:{value:function(i,l,a){
            var r=l?this._rem(i,l):[],
                aa=[].slice.call(arguments,2);
            while(aa.length){this._set(i,aa.pop(),true );}
            return r
        },enumerable:false,writable:false,configurable:true
        } ,
        slice:{value:function(s,e){
            var st=s|0,end=e|0,l=this._sz(),r=[];
            st=Math.min(l,st<0?l+st:st);
            end=Math.min(l,end<0?l+end:end);if(end<st||!end){end=l}
            for(var i=st;i<end;i++){r.push(l[i])};

            return r
        },enumerable:false,writable:false,configurable:true} ,
        shift:{value:function(){return this._rem(0)},enumerable:false,writable:false,configurable:true} ,
        push:{value:function(a){
            for(var i=0,l=[].slice.call(arguments),ln=l.length;i<ln;i++){
                this._set(-1,l[i],true)
            };
            return this._sz()
        },enumerable:false,writable:false,configurable:true} ,
        pop:{value:function(){
            return this._rem(-1)
        },enumerable:false,writable:false,configurable:true} ,
    }
    var proto= Object.create(null);
    Object.getOwnPropertyNames(ARRPROTO).forEach(function(k){
        if(typeof(k)=="string"  && typeof(ARRPROTO[k])=="function"&&  props[k]===undefined  ){
            props[k]= {value:eval("(function(){return ARRPROTO['"+k+"'].apply(_inner,arguments)})") ,enumerable:false,writable:false,configurable:true}
        }
    })

    var evalstr=[]
    for(var i=0;i<100;i++){
        evalstr.push( "props['"+i+"']={set:function(v){this._set("+i+",v)},get:function(){return this._get("+i+")},enumerable:true,configurable:true}")
    }

var all=evalstr.join("; ");
eval( all );props.length={get:function(){return this._sz()},set:function(v){this._sz(v)},enumerable:false,configurable:true}
Object.defineProperties(proto,props);


ObservableList.prototype=proto
ObservableList.prototype.constructor=ObservableList
return ObservableList
})();

/*

var nu=new ObservableList()  ;
nu.emitter.on("update",function(e){console.log(e.newValue===55)})
nu[9]=55
nu[9]==55
var t,c=1000,i,arr=Array(c);
t=Date.now();i=0;while(++i<c){arr[i]=i};console.log(Date.now()-t);
t=Date.now();i=0;while(++i<c){nu[i]=i};console.log(Date.now()-t)*/
