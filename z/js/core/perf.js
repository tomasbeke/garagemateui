/**
 * Created by Atul on 5/20/2015.
 */
$.perf=function(fns,a,tmes,cb){
    function go(fnarr,args,times,callback){

        var c=Math.max(1,times||0),cnt=fnarr.length,a=args.length?args:null,tms=[],now=typeof(performance)!="undefined" && performance.now?performance.now.bind(performance):Date.now
        function _then(){
            if(!callback || callback==="log"){console.log(tms.join("\n"))}
            else if(typeof(callback)=="function"){callback(tms)}
        }
        var rnng=-1
        function _do(){
            rnng++
            var i= c,fn=fnarr[rnng],t=now()
            if(a){
                while(--i)  fn.apply(null, a.concat(i))
            } else{
                while(i--)fn(i)
            }
            tms.push(((fn.name||"")+" " +((now() - t))).trim())
            if(rnng<cnt-1){setTimeout(_do,0)}
            else{_then()}
        }
        _do()
    }
    if(typeof(tmes)=="function"){
        if(typeof(cb)=="number"){
            var n=cb;
            cb=tmes
            tmes=n;
        } else{cb=tmes;tmes=100}
    }
    return{
        fns:fns,
        args:a,times:tmes,callback:cb,
        runWithArgs:function(a,times,callback){
            if(typeof(times)=="function"){
                if(typeof(callback)=="number"){
                    var n=callback;
                    callback=times
                    times=n;
                }
            }
            var args=[]
            if(!(!isNaN(times) && Number(times)>1)){times=this.times}
            if(typeof(callback)!=="function"){callback=this.callback}
            if(a!=null){args=[].concat(a)}
            else {args=[].concat(this.args||[])}
            go(this.fns,args,times,callback)
        },
        run:function(times,callback){
            this.runWithArgs(null,times,callback)
        }
    }
}
$.makeVisitor = (function () {
    var visitor=function(ctx,router){
        this.delegate=ctx||this;
        this.router=router;
        if($.isPlain(router)){
            $.each(router,function(v,k){
                this[k]=v;
            },this)
        }
    }
    visitor.prototype.visit=function(target){
        if(typeof(this.router)=="function"){
            var mthd=this.router.call(this.delegate,target);
            if(typeof(mthd)=="string" && this.delegate){mthd=this.delegate[mthd]}
            if(mthd && typeof(mthd)=="function"){
                mthd.call(this.delegate,target)
            }
        }
    }

    return function makeVisitor(ctx,router){
        var nu=new visitor(ctx,router)
        return nu;
    }

})();
