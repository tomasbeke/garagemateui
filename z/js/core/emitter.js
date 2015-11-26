
$.emitter=(function(){
    var HIGHESTPRIORITY=1000,PROPEVENTNAME="propertychange"
    function _cleanObj(){return Object.create(null)}

    function _getCallbacks(ev0,createifnot,options){
        var ev=_fixname.call(this,ev0);
        this._listenrs||(this._listenrs=_cleanObj());
        if(!this._listenrs[ev]&&createifnot){
            this._listenrs[ev]= $.callbacks(ev,this.delegate,options)

        }
        if(this._listenrs[ev] && options && options.sticky){
            options.stickyPromise=options.stickyPromise||Promise.deferred()
        }
        return this._listenrs[ev]
    }
    function _dispatch(ev0,firstarg){
        var ev=_fixname.call(this,ev0)
        if(this._listenrs&&this._listenrs[ev]){
            return this._listenrs[ev].dispatch(arguments)
        }
    }

    function _fixname(ev){
        if(!ev){ev=this.config.defaultEv}
        return !ev?this.config.defaultEv:String(ev).replace(/^(on)|[\s]+/g,"").toLowerCase()
    }

    function Observer(ctx){
        this.init(ctx)
    }
    var proto={}
    proto.init=function(ctx){
        this._listenrs=_cleanObj();
        this.config={cancelEventOnFalse:false,defaultEv:null,ctx:ctx};
        if(ctx!=null){this.delegate=ctx}
        this.__shared={}
    }
    proto.hasListener=function(ev0,verified){ var ev=verified===true?ev0:_fixname.call(this,ev0)
        var hndl=_getCallbacks.call(this,ev);
        return  (hndl&&!hndl.isEmpty())
    }
    proto.pause=function(){
        this.__paused=true
        return  this
    }
    proto.resume=function(){
        delete this.__paused
        return  this
    }
    proto.delegate=null;
    proto.on=function on(ev0,fn,optns){  var ths=this
        optns=optns||{}

        if(typeof(ev0)=="string"){
            if(ev0.indexOf(" ")>0){
                ev0.split(/\s+/).forEach(function(k){ths.on(k,fn,optns)},ths);
                return
            } else if(/\$once$/.test(ev0)){
                ev0=ev0.replace(/\$once$/,"")
                optns.once=true
            }
        }

        var lhandle,ev=String(ev0),id=optns.id;

        if(!optns.id && ev.indexOf(".")>0) {var arr=ev.split(/\./);
            ev=arr.shift();
            if(arr.length){id=arr.pop()}
        }
        if(id=="fn"||id=="@"){id=fn.name||fn._name}
        optns.priority||(optns.priority=0);
        if(optns.priority<0){optns.priority=HIGHESTPRIORITY+optns.priority} ;

        if(id){optns.id=id}
        lhandle=_getCallbacks.call(this,ev,true)
        if(ths.sp_events&&ths.sp_events[ev]&&ths.sp_events[ev].setup){
            ths.sp_events[ev].setup.call(ths,ev,optns)
        }
        lhandle.add(fn,optns)

        lhandle.__shared=this.__shared
        return lhandle
    }
    proto.off=function(ev0,fn,id){

        var ev=_fixname.call(this,ev0)
        var lhandle=_getCallbacks.call(this,ev)
        if(!lhandle ){
            if(!id ){

            }
        }
        if(lhandle){
            lhandle.remove(fn,id)
            if(lhandle.isEmpty()){
                if( this.sp_events&&this.sp_events[ev]&&this.sp_events[ev].clear){this.sp_events[ev].clear.call(this,ev)}
            }
        }
        return this
    }
    proto._handlePropchangeEvent=function(rec){
        if(rec && rec.name){
            this.fire(PROPEVENTNAME+"-"+rec.name.replace(/\./g,"___"),rec)
            if(rec.name!="*"&&this.hasListener(PROPEVENTNAME+"-*")){
                this.fire(PROPEVENTNAME+"-*",rec)
            }
        }
    }
    proto.onpropertychange=function(propname,fn,opts){
        var ths=this
        if(typeof(propname)=="function"){opts=fn;fn=propname; propname="*"  }


        var props = String(propname).split(/[\s,]+/);
        var ctx = this.delegate||this,properties="properties"in ctx?ctx.properties:ctx;
        if(this.__paused){return}
        if(fn===false||fn===null||opts===false){
            if(!ths.hasListener(PROPEVENTNAME)){return}
            for (var idx = 0, ln = props.length; idx < ln; idx++) {
                var prop = props[idx].replace(/\./g,"___");
                ths.off("propertychange-"+prop,fn,opts&&opts.id?opts.id:opts )
                ths.off("propertychange-"+props[idx],fn,opts&&opts.id?opts.id:opts )

            }
            return;
        }
        if(!ths.hasListener(PROPEVENTNAME)){
            ths.register(PROPEVENTNAME,{})
            ths.on(PROPEVENTNAME,ths._handlePropchangeEvent.bind(ths))
        }
        if(properties&&typeof(properties.getItem)=="function") {
            for (var idx = 0, ln = props.length; idx < ln; idx++) {
                var prop = props[idx];
                //this.observer.onpropertychange(prop, callback , opts);
                if (prop != "*" && properties.getItem(prop) != null) {
                    var val = properties.getItem(prop);
                    fn.call(ctx, {name: prop, value: val, newValue: val, oldValue: null})
                }
            }
        }
        for (var idx = 0, ln = props.length; idx < ln; idx++) {
            var prop = props[idx].replace(/\./g,"___");
            ths.on("propertychange-"+prop ,   fn )
        }
        return ths
    }
    proto.setConfig=function(k,v){this.config[k]=v; }
    proto.register=function(ev,lhandle){
        if(lhandle===true){lhandle={sticky:true}}
        var nu= _getCallbacks.call(this,ev,true,lhandle)
        //if(lhandle && lhandle.sticky){nu._sticky=true}
        return nu
    }
    proto.registerSpecial=function(ev0,setup,clr){
        var ths=this ,ev=String(ev0).toLowerCase()
        var sp=ths.sp_events||(ths.sp_events=Object.create(null));
        if(sp[ev]){return}

        sp[ev]=(function(s,c){var _setup=typeof(s)=="function"?s:function(){},
            _clear=typeof(c)=="function"?c:function(){};
            return {
                setup:_setup ,
                clear:_clear
            }
        })(setup,clr)
        return ths;
    }

    proto.trigger=function(ev){this.fire.apply(this,arguments)}
    proto.fireAsync=function(){var a=$.makeArray(arguments);
        setTimeout(function(){this.fire.apply(this,a)}.bind(this),0)}
    proto.once=function(ev0,fn,optns){
        optns=optns||{};optns.once=true
        return this.on(ev0,fn,optns)
    }
    proto.stop=function(immediate,a){
        if(arguments.length==1&&immediate&&typeof(immediate)=="object"){a=immediate;immediate=false}
        if(a &&a.stopPropagation){
            a.stopPropagation()
            if(immediate&&a.stopImmediatePropagation){
                a.stopImmediatePropagation()
            }
        }
    }
    proto.fire=function(ev0){
        if(this.__paused){return}
        var lhandle=_getCallbacks.call(this,ev0 )
        return lhandle?lhandle.dispatch.apply(lhandle,[].slice.call(arguments,1)) :null
    }
    Observer.prototype=proto;
    Observer.prototype.constructor=Observer;
    Observer.prototype.augment=function(ctx,triggerfn){
        var nu=this;
        nu.delegate=ctx
        if(!("on" in ctx)){ctx.on=function(){this.on.apply(this,arguments);return this.delegate}.bind(nu)}
        if(!("off" in ctx)){ctx.off=function(){this.off.apply(this,arguments);return this.delegate}.bind(nu)}
        if(!("onpropertychange" in ctx)){ctx.onpropertychange=function(){this.onpropertychange.apply(this,arguments);return this.delegate}.bind(nu)}
        if(!("fire" in ctx)){ctx.fire=function(){this.fire.apply(this,arguments);return this.delegate}.bind(nu)}
        if(triggerfn){nu.trigger=triggerfn.bind(nu)}
        ctx.emitter=nu

    };

    var ret= function(ctx,augment,triggerfn){
        var nu= new Observer(ctx)
        if(ctx&&augment){
            nu.augment(ctx,triggerfn)
        }
        return nu;
    }
    ret.augment= function(ctx){return ret(ctx,true);}
    function simpleMutationObsetver(delegate,config){
        this._owner=delegate||{};  this.wc=0;
        this._config= $.isPlain(config)?config:{}
    }


    simpleMutationObsetver.prototype={
        wc:null,_owner:null, _handles:null ,que:null,_config:null,
        isObserving:function(nm){
            return this._handles&&this._handles[nm]&&this._handles[nm].length
        },
        forProperty:function(nm){
            var ths=this;
            return {
                on:(function(emitter,name){
                    return function(fn){
                        var a=[].slice.call(arguments)
                        if(a.length>1 && typeof(a[0])!="function" && typeof(a[1])=="function"){a.shift();}
                        a.unshift(name)
                         return emitter.on.apply(emitter,a)
                    }
                })(this,nm),
                trigger:function(name,rec){
                    if(!rec){return}
                     if(rec && typeof(rec)=="object" && ("value" in rec || "newValue" in rec )){ rec.name=name; }
                    else{
                         return
                     }
                      return this.fire(rec)
                }.bind(this,nm)
            }
        },
        addToQueue:function(rec){
            if(this.que && rec && rec.name){
                for(var l=this.que,i=l.length-1,q;q=l[i],i>=0;i--){
                    if(q && q.name===rec.name){l.splice(i,1)}
                }
                this.que.push(rec)
                return true
            }
        },
        clearQueue:function(){
            if(this.que===null){return}
            var  que=this.que.slice();
            this.que=null;
            if(! que.length ){return}
            var  all=(this._owner.catchallcallback||this.catchallcallback||this.catchall )||this.wc
                 if(this._handles||all) {
                    var h=this._handles
                    while (que.length) {
                        var r=que.shift();
                        if((h && h[r.name])||all){
                            this.fire(r)
                        }
                    }
                }

            return;
        },
        queue:function(flag){
            if(flag===false){
                this.clearQueue( )
            } else{
                if(!this.que){this.que=[]}
                return false
            }
            return this
        },
        _fire:function(lst,rec,torem){
            var res
            for (var i = 0, ln = lst.length,fn; fn = lst[i], i < ln; i++) {
                if(!fn){continue}
                var ret,opts=fn[1]||{},fun=fn[0];
                if(typeof(fun) !== "function"){continue;}
                if(opts.filter){
                    if(!opts.filter.call(this._owner,rec,opts)){
                        continue;
                    }
                }
                try {
                    ret = fun.call(this._owner, rec)
                } catch(e){
                    $.handleEx(e,"simpleMutationObsetver: while firing "+rec.name +"+"+rec.value+" "+fun);
                }
                 if((this._config.removeonfalse || opts.removeonfalse) && ret===false){
                    torem.push(i)
                }
                else if(opts.once){
                    torem.push(i)
                }
                res=ret
                //fn.call(this._owner, rec);
            }
            return res;
        },

        fire:function(){
            var rec,ls=[],ob=this,propchange=!(nm=="clear"||nm=="reset"),c_all=(this._owner.catchallcallback||this.catchallcallback||this.catchall );
            var mrec=this._mrec||(this._mrec=$.mutationRecordGen(this._owner)),first=arguments[0];

            if(first===true ){ alert("clearQueue");
                return this.clearQueue( )
            }
            if(arguments.length==1&&first&&typeof(first)=="object"){
                rec=first
            }
            else{
                rec=mrec(first,arguments[1],arguments[2])
            }
            if (typeof(arguments[3]) == "string") {
                rec.valueLabel = arguments[3];
            }
            var nm=rec.name;
            if(!nm||typeof(nm)!="string"){return}

            if(this.addToQueue(rec)){
                return this
            }

            if(ob._handles&&ob._handles[nm]){
                ls=ob._handles[nm]
            }
            var torem=[]

            if(ls.length){
                torem=[]
                this._fire(ls,rec,torem);
                while(torem.length){
                    ls.splice(torem.pop(),1)
                }

            }
            if(propchange && ob.wc){
                torem=[]
                var wclst=ob._handles["*"];
                this._fire(wclst,rec,torem);
                if(torem.length){
                    while(torem.length){
                        wclst.splice(torem.pop(),1)
                    }
                    ob.wc=wclst.length
                }
            }
            if(c_all && typeof(c_all) === "function"){
                c_all.call(this._owner, rec);
            }

             return this._owner
        } ,
        on:function(nm,fn,opts){
            if(Array.isArray(nm)){
                for(var i=0;i<nm.length;i++){
                    this.on(nm[i],fn)
                }
                return this._owner
            }
            var ob=this, f1,h=ob._handles||(ob._handles={});

            if(typeof(nm)=="function"){fn=nm;nm="*"}
            f1= $.fnize(fn)
            if(typeof(f1 )!="function"){
                return
            }

            if(!nm || nm==="*"){nm="*";ob.wc++;}
            h[nm]||(h[nm]=[]);
            if(typeof(opts)=="boolean"){
                opts.once=opts
            }
            opts=opts||{}

            for(var l=h[nm],i= l.length-1;i>=0;i--){
                if(f1==l[i][0]){
                    return this._owner
                }
            }

            h[nm].push([f1,opts])
            return this._owner
        } ,
        off:function(nm,fn){var ob=this,h=ob._handles;
            if(!h||!h[nm]){return}
            for(var l=h[nm],i= l.length-1;i>=0;i--){
                if(fn==null||fn==l[i][0]){
                    l.splice(i,1);
                }
            }
            if(!h[nm].length){
                delete ob._handles[nm]
            }
            return this._owner
        }
    }
    ret.simpleMutationObsetver=function(delegate){
        return new simpleMutationObsetver(delegate)

    }
    ret.simpleObserver=function(delegate,config){
        return (function(dlg,cnfg){
            var LISTENERS,_config=cnfg||{},_delegate=dlg||null
            if(!$.isPlain(_config)){_config={}}
            _config.count=0
            function removeList(nm,torem){
                var L=LISTENERS[nm];if(!L){return}
                while(torem.length){
                    L.splice(torem.pop(),1);
                    _config.count--
                }
                if(!L.length){delete LISTENERS[nm]}
            }
            var api= {
                add:function(nm,fn,optns,batched){
                    var options,toret
                    if(batched===true) {
                        options= optns;
                    } else{
                        if(typeof(nm)=="function"){optns=fn;fn=nm;nm=_config.defEv;optns=null}
                        if(typeof(fn)=="string"){fn= $.fnize(fn,{scope:_delegate})}
                        if(!nm || typeof(fn)!="function"){return}

                        if($.isPlain(optns)){options= $.clone(optns)}

                        else{options={}
                            if(typeof(optns)=="string"){options.id=optns}
                            if(optns==true){ options.once=true}
                        }
                        if($.isPlain(batched)){//additional/pverride config
                            $.extend(config,batched);
                        }
                        options.fn=fn
                         LISTENERS||(LISTENERS={});
                        var arr=nm.trim().indexOf(" ")>0?nm.split(/\s+/):(Array.isArray(nm)?nm:null)
                        if(arr){
                            if(!options.id){options.id= $.UUID()}
                            arr.forEach(function(a){
                                    this.add(a,fn,options,true)
                                }.bind(this)
                            );
                             return options
                        }

                    }
                    LISTENERS[nm]||(LISTENERS[nm]=[]);
                    var id=options.id||{},handle=LISTENERS[nm].find(function(a){return a.fn===fn || a.id===id})
                    if(!handle){
                         LISTENERS[nm].push(options);
                         _config.count++
                    }
                    if(batched!==true && !options.remove){
                        options.remove=function (opts,type) {
                            if (opts.id) {
                                return this.removeById(opts.id)
                            }
                            this.remove(type, opts.fn)
                        }.bind(this, options,nm)

                    }
                    return options
                },
                removeById:function(nm){
                    if(!LISTENERS){return}
                    for(var i= 0,l=Object.keys(LISTENERS),ln= l.length;i<ln;i++){
                        var torem=[]
                        LISTENERS[l[i]].forEach(function(a,i){a.id===nm && torem.push(i)});
                        torem.length && removeList(l[i],torem)
                    }
                },
                destroy:function(nm,fn){
                    if(!LISTENERS){return}
                    for(var i= 0,l=Object.keys(LISTENERS),ln= l.length;i<ln;i++){
                        LISTENERS[l[i]].forEach(function(a,i){ a=null;});
                        LISTENERS[l[i]].length=0;
                        delete LISTENERS[l[i]]
                    }
                    _config.count=0;
                    LISTENERS=null;
                },
                hasListeners:function(nm){
                    if(!nm || !_config.count){return !!_config.count}
                    return  LISTENERS && (LISTENERS[nm] || LISTENERS["*"]|| LISTENERS["**"])
                },
                remove:function(nm,fn){
                    if(!nm || !LISTENERS){return}
                    if(!LISTENERS[nm]){
                        return this.removeById(nm)
                    }
                    var torem=[],L=LISTENERS[nm]
                    L.forEach(function(a,i){a.fn===fn  && torem.push(i)})
                    removeList(nm,torem)
                },
                dispatch:function(nm,data){
                    if(nm && typeof(nm)=="object" && nm.type){data=nm;nm=data.type}
                    if(!(LISTENERS && LISTENERS[nm]&& LISTENERS[nm].length)){return}
                    var torem=[],L=LISTENERS[nm],C=_config,stopon=("stopon" in C)?{v:C.stopon}:null
                    for(var i= 0,ln= L.length|| 0,H;H=L[i],i<ln;i++){
                        if(!H){continue}
                        try{
                            if((C.filter && C.filter(_delegate,data)===false)||(typeof(H.filter)=="function" && H.filter(_delegate,data)===false)){continue}
                            var res=H.fn.call(_delegate,data)
                            if(stopon !==null && stopon.v===res){break;}
                        }  catch(e){
                            console.log(e,"Error while dispatching "+nm  )
                        }
                        H && H.once && torem.push(i)
                    }
                    removeList(nm,torem)
                }
            }
            api.hasListener=api.hasListeners
            api.on=api.add
            api.off=api.remove
            api.once=function(ev,fn,optns){
                return this.add(ev,fn,optns,{once:true})
            }
            api.fire=api.dispatch
            return api;
        })(delegate,config)
    }

    return ret
})();

