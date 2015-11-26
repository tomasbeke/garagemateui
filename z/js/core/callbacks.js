/**
 * Created by Atul on 12/3/2014.
 */
$.callbacks=function(type,delegate,config ) {
    var config= $.isPlain(config)?config:{}, innerlist = [];
    config.type=type;
    config.state=1;
    config.delegate=delegate
    function _resetIndex() {
        for (var i = 0, ln = innerlist.length; i < ln; i++) {
            if(!innerlist[i].shared){innerlist[i].index = i}
        }
    }
    function _invoke(fn,ctx,fnargs,o,i,torem,typecheck) {
        //try {
        if(o){
            if( (typecheck && o.typecheck && typecheck!== o.typecheck)||
                o._remove||
                (o.filter&&!o.filter.call( ctx  ,fnargs,o))||
                (config.defaultFilter&&!config.defaultFilter( ctx  ,fnargs,o))
            ){
                if(o._remove && torem&& i>=0){torem.push(i)}
                return false
            }  else {
                if(o.ctx){ctx=o.ctx}

            }
        }

        if(config.prepareArgs){fnargs=config.prepareArgs(fnargs)}
        var ln=fnargs.length,
            res=(!ln && !ctx)?fn():(ln===1?fn.call(ctx, fnargs[0]):fn.apply(ctx, fnargs))
        if( o && i>=0 && o.once && torem){torem.push(i)}
        return res
        //} catch(e){

        //}
    }
    function _getHandle(fn,id,shared) {
        if(fn&&typeof(fn)==="string"){id=fn;fn=null}

        for (var ln = innerlist.length, i = ln-1, h; i >=0; i--) {
            h = innerlist[i];
            if(!h || !h.fn ||h._remove){innerlist.splice(i,1);continue}
            if ((id&&h.optns.id===id)||(fn&&h.fn === fn)) {
                return h
            }
        }
        if(id && shared && shared.ids&& shared.ids[id] ){
            return shared.ids[id]
        }
    }

    var dispatcher = {
        dispatch: function _dispatch(evt) {//onlu
            var res
            if(config.state==1){
                var args=evt||{},torem=[],ln=innerlist.length
                config.lastargs=[args];
                var typecheck = args.typecheck || args.type || null,typecheck2=null
                if(!typecheck && typeof(config.typecheck)=="function"){
                    typecheck =config.typecheck(args,config)
                }
                for(var i = 0, h;h=innerlist[i],i<ln;i++){
                    var o=h.optns,fnargs=[args]
                    if(o && o.args&&o.args.length){fnargs=o.args.concat(fnargs)}
                    try {
                        res=_invoke(h.fn,config.delegate||o.ctx || null, fnargs,o,i ,torem,typecheck )
                    } catch(e){
                        $.handleEx(e);
                        console.log(e,"error while dispatch")
                    }
                }
                while(torem.length){
                    innerlist.splice(torem.pop(),1)
                }

            }
            return res
        }
    }

    if(config.type&&config.delegate&&(config.delegate.el||config.delegate).addEventListener){
        config.eventSourcehandle= dispatcher.dispatch ;
        if(!config.noattach) {
            (delegate.el || delegate).addEventListener(config.type, config.eventSourcehandle)
        }
    }
    return {
        setConfig:function(nm,val){if(!nm){return}
            if(typeof(nm)=="string"){config[nm]=val}
            else{$.extend(config,nm);}
            return this;
        },
        getConfig:function(nm){return typeof(nm)=="string"?config[nm]:config},
        dispatch:function(ev){
            if(!config.state){return}
            var args=null
            if(ev&&({}).toString.call(ev)=="[object Arguments]"){args=ev[0]}
            else{args=ev }
            if(config.stickyPromise){
                config.stickyPromise.resolve(ev)
            }
            return dispatcher.dispatch(args)
        },
        setFilter:function(fn){config.defaultFilter=fn;},
        isPaused:function(){return config.state==-1},
        isStopped:function(){return !config.state},
        stop:function(memory){if(!config.state){return}
            innerlist.length=0;
            config.state=0;
            if(memory!=null){if(memory===true){memory=config.lastargs}
                if(!Array.isArray(memory)){memory=[memory]}
            }
        },
        destroy:function(){
            this.stop();
            innerlist=config.lastargs= config.delegate=config.memory=null
        },
        pause:function(){if(config.state==1){config.state=-1}},
        resume:function(){if(config.state==-1){config.state=1}},
        isEmpty:function(){return!(innerlist&&innerlist.length)},
        add:function(fn,opts){if(!config.state){return}
            if(fn===null && opts) {
                this.remove(  opts.id||opts  );
                return
            }
            if(typeof(fn)=="string"){
                if(config.delegate && typeof(config.delegate[fn])=="function"){fn=config.delegate[fn] }
                else if(typeof(console[fn])=="function"){fn=console[fn].bind(console)}
                else if(typeof(self[fn])=="function"){fn=self[fn].bind(self) }
            }
            if(typeof(fn)!="function"){return}
            if(this.isStopped()){
                if(config.memory){
                    _invoke(fn,null,config.memory)
                }
                return;
            }
            var o={}
            if(opts&&typeof(opts)=="object"){o=opts}
            else if(typeof(opts)=="string"){o.id=opts}
            else if(typeof(opts)=="boolean"){o.once=opts}
            if(this._sticky){   o.once=true; }
            if(config.stickyPromise){
                config.stickyPromise.then(fn.bind(config.delegate))
                return
            }
            var h
            h=_getHandle(fn,o.id,this.__shared);
            if(!h){var id=o.id
                h={fn:fn,optns:o}
                if(id && this.__shared){
                    this.__shared.ids||(this.__shared.ids={})
                    if(!this.__shared.ids[id]){
                        h.count=0
                        h.shared=id;
                        this.__shared.ids[id]=h
                    }
                    h.count++
                }
                innerlist.push(h)
            } else {
                //h.fn=fn;
                if(!h.shared) {
                    $.extend(h.optns, o)
                } else{
                    if(innerlist.indexOf(h)==-1){
                        innerlist.push(h)
                        h.count++;
                    }

                }
            }

            if(this._sticky){
                if(config.lastargs){
                    this.dispatch(config.lastargs )
                }
            }
        },
        remove:function(fn,id) {if(!config.state){return}
            var h ;

            if (h= _getHandle(fn,id,this.__shared)) {
                var idx=innerlist.indexOf(h)
                idx>=0 && innerlist.splice(idx, 1);
                if(h.shared) {
                    h.count--;
                    if (h.count<=0 || (typeof(fn) == "string" && h.shared == fn)) {
                        h._remove = true;
                        if (this.__shared && this.__shared.ids && this.__shared.ids[h.shared]) {
                            delete this.__shared.ids[h.shared]
                        }
                    }
                }
                _resetIndex()
            }
            if(!innerlist.length&&config.eventSourcehandle&&config.delegate&&config.delegate.removeEventListener){
                config.delegate.removeEventListener(config.type,config.eventSourcehandle);config.eventSourcehandle=null;
            }
        }
    }
}