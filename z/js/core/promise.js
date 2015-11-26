/**
 * Created by Atul on 12/3/2014.
 */
;(function Promiseouter(scope,ns){
    var PENDING="pending",REJECTED="rejected",RESOLVED="resolved",TYPEFUNCTION="function"
    function _noop(){}
    function _invoke(f,args) {
        if(_isfn(f)){
            return f.apply(this,[].slice.call(args))
        }
    }
    function _fn(f){
        if(f==null){return _noop}
        if(_isfn(f)){return f}
        return (function(a){return function(){return a}})(f)
    }
    function _isfn(f){return typeof(f)===TYPEFUNCTION}

    if(!_isfn(scope[ns]) ) {
        self.Promise=function  (fn){
            var _callbacks=[], PromiseStatus=PENDING, PromiseValue=null;
            this._boundto=self
            function _dispatch (){var fns=arguments[0];
                if(fns && fns.length  && _isfn(fns[0]) ){
                     _callbacks.push (fns.slice());
                }
                if(PromiseStatus === PENDING) {  return  }
                var i=PromiseStatus === RESOLVED ? 0 : 1, v=PromiseValue
                while(_callbacks.length) {
                    try{ var f=_callbacks.shift()[i]
                        _invoke.call(this,f,[v])
                    } catch(e){$.handleEx(f,e)}
                }
            }
            function _updateStatus_priv (nu, v){
                PromiseStatus=nu;
                PromiseValue=v
                _dispatch.call (this)
            }
            function _updateStatus (nu, v){
                if(PromiseStatus !== PENDING) {
                    return
                }
                if(v && (v instanceof Promise||typeof(v.then)=="function")){
                    v.then(_updateStatus_priv.bind(this,nu))
                    return
                }
                _updateStatus_priv.call (this,nu, v)
            }

            this["catch"]=function(f){  return this.then (null, f)  }
            this.then=function(){
                var nu,onresolve=arguments[0], onreject=arguments[1]
                nu=Promise.deferred();
                //if(this._boundto){nu.promise=nu.promise.bind(this._boundto)}
                _dispatch.call (this, [function(a){
                    try{_invoke.call (this,onresolve,[a]);
                        nu.resolve(a);
                    } catch(e){$.handleEx(e,"_dispatch")}
                }, function(a){
                    _invoke.call (this,onreject,[a]);
                    nu.reject(a);
                }]);
                return nu.promise||nu
            }
            if(_isfn(fn) ) {
                fn(_updateStatus.bind (this, RESOLVED), _updateStatus.bind (this,REJECTED))
            }else if(fn&&(_isfn(fn.then) ||fn instanceof Promise)) {
                fn.then ( _updateStatus.bind (this, RESOLVED ), _updateStatus.bind (this, REJECTED))
            }else {
                _updateStatus.call (this, RESOLVED, fn)
            }
        };
    }
    var Promise=self.Promise

     Promise.prototype.spread||(Promise.prototype.spread=function(fn){return this.then(function(){fn.apply(this,arguments)});});
    if(!Promise.prototype["finally"]){
        Object.defineProperty(self.Promise.prototype,"finally",{value:function(fn){ return this.then(fn,fn);},enumerable:true,writable:false,configurable:false})
    }

    /* Promise.prototype.bind||(Promise.prototype.bind=function(thisarg){ if(thisarg==null){return this}
     var p=Promise.deferred(); p.promise._boundto=thisarg;
     this.then(p.resolve ,p.reject )
     return p.promise
     });
     Promise.bind=function(thisArg){return Promise.resolve(undefined).bind(thisArg)}
     */
    Promise.cast||(Promise.cast=function(a){
        var p;
        if(a instanceof Promise){p=a}
        else if(a&&a.promise && a.promise instanceof Promise){p=a.promise}
        else{p=_isfn(a) ?new Promise(a):Promise.resolve(a);}
        return p
    });
    Promise.race||(Promise.race=function(a){
        var nu=Promise.deferred(),l=[].concat(a||[]),done=0
        for(var i=0,ln=l.length;i<ln;i++){
            Promise.cast(l[i]).then(function(a){done++;ln=0;nu.resolve(a)},function(a){ })
        }
        return nu.promise;
    });
    Promise.chain=function(a){
        var  l=[].concat(a||[])
        var ret=Promise.deferred();
        function _next(val){
            if(l.length){
                Promise.cast(l.shift()).then(_next);
            }  else{
                ret.resolve(val)
            }
        }
        _next(null)
        return ret.promise
    }
    Promise.method||(Promise.method=function(a){ return function(){return Promise.cast(a.apply(this,arguments))} });
    //in case any rejection defererred is also rejected
    Promise.all||(Promise.all=function(a){
        var nu=Promise.deferred(),l=[].concat(a||[]),done=0,pending=[],res=[],err=0
        function _check(p,a){
            if(err){return}
            var idx=pending.indexOf(p);
            if(idx>=0){
                pending[idx]=null;
                res[idx]=a
            }

            if(!pending.filter(function(it){return it!=null}).length){
                nu.resolve(res)
            }
        }
        for(var i=0,ln=l.length;i<ln;i++){
            pending.push(1)
            res.push(null)
        }
        for(var i=0,ln=l.length;i<ln;i++){
            var p;

            if(l[i] instanceof Promise){p=l[i]}
            else if(l[i]&&l[i].promise && l[i].promise instanceof Promise){p=l[i].promise}
            else {p=Promise.cast(l[i]);}
            pending[i]=p
            p.then(
                function(a){ _check(this.p,a); }.bind({p:p}),
                function(a){
                    err= 1;
                    nu.reject(a)
                    //_check(this.p,a)
                }.bind({p:p})
            )
        }
        return nu.promise ;
    });
    Promise.resolve||(Promise.resolve=function(a){
        return new Promise(function(res){res(a)})
    });
    Promise.reject||(Promise.reject=function(a){
        return new Promise(function(res,rej){rej(a)})
    })
    Promise.defer||(Promise.defer=function(){
        var holder={ fn:null,done:null}//not ready
        var nu=new Promise(function(resolvefn,rejectfn){
            holder.fn=(function(fn1,fn2){
                return function(resolved,v){
                    if(resolved){
                        try{   fn1(v)} catch(e){$.handleEx("Promise.defer",e )}
                    }
                    else{
                        fn2(v)
                    }
                }
            })(resolvefn,rejectfn);
            if(holder.done){
                holder.fn(holder.done[0],holder.done[1])
            }
        })


        nu.resolve=function(v){
                // try {
                if (!holder.fn && !holder.done) {
                    holder.done = [true, v]
                } else {
                    holder.fn(true, v)
                }
            }
        nu.reject=function(v){
                if(!holder.fn&&!holder.done) {
                    holder.done=[false,v]}
                else{
                    holder.fn(false,v)
                }
            }


        nu.promise=nu;

        return nu
    });
    Promise.deferred=function(){
        var dfr=Promise.defer();
        if(!dfr.then){dfr.then=dfr.promise.then.bind(dfr.promise)}
        if(!dfr.finally){dfr.finally=function(fn){return this.promise.then(fn,fn)}}
        dfr.isPromise=true
        return dfr;
    }
    Promise.create=function(){
        if(!arguments.length){return Promise.deferred()}
        return Promise.cast(arguments[0])
    }
    scope[ns]=Promise

    Object.defineProperty(Promise.prototype,"isPromise",{value:true,enumerable:true,writable:false,configurable:false})
})(this,"Promise");