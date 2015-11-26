/**
 * Created by Atul on 1/5/2015.
 */
self.NUM=(function(){
    var __counter=1;
    function NUM(v,unit,mutable,listener){
        var ismutable=mutable===true||unit===true
        this.__id="NUM_"+(++__counter);
        Object.defineProperties(
            this,{
                "number":ismutable?(function(v){var inner=v;
                    return {get:function(){return inner},
                        set:function(v){
                            var curr=inner,nuval=null
                            if(typeof(v)=="number"){nuval=v;}
                            else {
                                var nu = NUM.parseNumber(v,true);
                                nuval = nu[0];
                                if(nu[1]){this.unit=nu[1]}
                            }
                            if(inner!== nuval){
                                inner= nuval ||0
                                this.compute(null,nuval )
                            }
                            if(v!=null&&this.empty){
                                this.empty=false
                            }
                            return curr
                        },
                        enumerable:true,condigurable:false}})(v||0):{value:v,writable:false,enumerable:true,condigurable:true},
                "unit":{value:typeof(unit)=="string"?unit:"",writable:ismutable,enumerable:true,condigurable:true},
                "mutable":{value:!!ismutable,writable:false,enumerable:true,condigurable:true}
            }
        );
        if(v==null){this.empty=true}
        if(listener){
            this.setListener(listener)
        }
    }
    NUM.prototype=Object.create(Number.prototype)


    NUM.prototype.valueOf=function valueOf(){return this.number },
        NUM.prototype.toString=function toString(){return this.number+this.unit },
        NUM.prototype.eq=function eq(v){
            if(this.invalid){return}
            if(this==nu){return true}
            var nu=NUM.parse(v)
            return (this.number===nu.number && this.unit===nu.unit)
        }
    NUM.prototype.compareTo=function compareTo(v){if(this.invalid){return}
        var nu=NUM.parse(v)
        return this.eq(nu)?0:(this.GT(nu)?1:-1)
    }
    NUM.prototype.reset=function reset(nu){
        this.empty=true
        if(nu!=null){this.number=nu}
    }
    NUM.prototype.destroy=function destroy(){
        delete NUM.__cache  [this.__id]
        this.__listener=null
    }
    NUM.prototype.setRelated=function setRelated(ref,bind){
        var me = this, rf
        if(ref&&typeof(ref)=="object" && ref instanceof NUM ) {
            rf = NUM.__cache[ref.__id];
            if(bind){
                ref.setListener(
                    function(v){
                        me.compute(v)
                    }
                )
            }
        } else{
            rf=ref
        }

        this._related=rf;
    }
    NUM.prototype.setOffset=function setOffset(ref){
        this.__offset=NUM.parse(ref,true);
    }
    NUM.prototype.setListener=function setListener(listener,bind){
        var l
        if(typeof(listener)=="function"){l={fn:listener}}
        else if(typeof(listener.fn)=="function"){l=listener}
        if(l){
            if(!this.__listener){this.__listener=l}
            else{
                this.__listener.more=this.__listener.more||[]
                this.__listener.more.push(l)
            }
        }
    }
    NUM.prototype.compute=function compute(ref,nu ) {
        if(this.__busy||(ref==null&&nu==null&&this._related==null)){
            if(this.__computed==null){this.__computed=this.number}
            return this.__computed
        }
        this.__busy=true
        var nuval=this.__computed;
        try{
            ref=ref||this._related;
            if(ref&&typeof(ref)=="string" && ref.indexOf("NUM)")==0) {
                var ref1=NUM.__cache[ref]
                if(!ref1){
                    if(this._related==ref){this._related=null}
                    return
                } else{ref1=ref}
            }
            nu=nu==null?this.number:nu
            if(typeof(this._related)=="function"){
                nuval=this._related(nu, ref)
            }
            else if(ref){
                var refnum
                if(ref instanceof NUM){refnum=ref.compute()}
                else{refnum=NUM.parseNumber(ref)||0}
                if(this.unit==="%"){nuval= Number((refnum *(nu/100)).toFixed(2))}
            } else{
                nuval=nu
            }
            if(this.__offset){
                nuval=nuval-this.__offset.compute()
            }
            if(!(this.__computed===nuval)) {
                this.__computed = nuval
                this.__modified = true
                if (this.__listener) {
                    this.__listener.fn.call(this, nuval, this.unit, this.__listener.memo)
                    if (this.__listener.more) {
                        for (var i = 0, l = this.__listener.more, ln = l.length || 0; i < ln; i++) {
                            l[i] && l[i].fn && l[i].fn.call(this, nuval, this.unit, this.__listener.memo)
                        }
                    }
                }
            }
        } finally{
            this.__busy=false
        }

        return nuval
    }
    NUM.prototype.neg=function neg(v){
        if(this.invalid){return}
        return NUM.parse(0-this.number,this.unit)
    }
    NUM.prototype.isEmpty=function isEmpty(){
        if(this.invalid||this.empty||!this.number){return true}
        return
    }
    NUM.prototype.LT=function LT(v){if(this.invalid){return}
        var nu=NUM.parseNumber(v)
        return nu===null?true:(this.number<nu)
    }
    NUM.prototype.GT=NUM.prototype.MT=function MT(v){if(this.invalid){return}
        var nu=NUM.parseNumber(v)
        return nu===null?true:(this.number>nu)
    }
    NUM.prototype.ME=function ME(v){if(this.invalid){return}
        var nu=NUM.parseNumber(v)
        return  nu===null?true:(this.number>=nu)
    }
    NUM.prototype.LE=function LE(v){if(this.invalid){return}
        var nu=NUM.parseNumber(v)
        return  nu===null?true:(this.number<=nu)
    }
    NUM.prototype.withUnit=function withUnit(ref){
        return this.number+this.unit
    }
    NUM.prototype.add=function add(ref){var nu=NUM.parseNumber(ref)||0
        if(this.mutable){this.number+=nu;return this}
        return NUM.parse(this.number+nu)
    }
    NUM.prototype.minus=function minus(ref){var nu=NUM.parseNumber(ref)||0
        if(this.mutable){this.number-=nu;return this}
        return NUM.parse(this.number-nu )
    }
    NUM.prototype.mul=function mul(ref){var nu=NUM.parseNumber(ref)||0
        if(this.mutable){this.number*=nu;return this}
        return NUM.parse(this.number*nu )
    }
    NUM.prototype.div=function div(ref){var nu=NUM.parseNumber(ref)||0
        if(this.mutable){this.number/=nu;return this}
        return NUM.parse(nu ?this.number/nu :0)
    }
    NUM.prototype["mod"]=function(ref){var nu=NUM.parseNumber(ref)||0
        if(this.mutable){this.number%=nu;return this}
        return NUM.parse(this.number%nu )
    }
    if(Object.getOwnPropertyNames){
        Object.getOwnPropertyNames(Number.prototype).forEach(function(k){
            if(!k ||k=="constructor"||typeof(Number.prototype[k])!="function" || NUM.prototype.hasOwnProperty(k)){return}
            NUM.prototype[k]=Function("return Number.prototype['"+k+"'].apply(this.number,arguments)")
        })
        var objprops=Object.getOwnPropertyNames(Object)
        Object.getOwnPropertyNames(Number).filter(function(k){
            if(objprops.indexOf(k)==-1){
                NUM[k]=Number[k]
            }
        });
    }
    NUM.prototype.plus=NUM.prototype.add
    NUM.prototype.sub=NUM.prototype.less=NUM.prototype.minus
    NUM.__cache={}
    NUM.__cache_reuse=[]
    NUM.parseNumber= function numparsenumber(v,withunit){
        var nm=0,isempty= 0,invalid=0,unit
        if(typeof(v)=="number"){
            nm=v;
        } else {
            if(v==null){ isempty=1;v=0}
            var v1= +v
            if(!isNaN(v1)){
                nm=v1;
            } else  if(typeof(v)=="string"){
                var arr=v.match(/^([-]?[\d\.]+)(.*)$/)
                if(arr){unit=arr[2];nm=Number(arr[1])}
                else{invalid=1;}
            }
        }
        if(invalid){nm= null;}
        if(isempty){nm= 0;}
        return withunit?[nm,unit]:nm
    }
    NUM.parse= function numparse(v ,mutable){
        var listener;
        if(mutable&&(typeof(mutable)=="function"||typeof(mutable.fn)=="function")){
            listener=mutable;mutable=true
        }
        var nm=0,isempty= 0,invalid=0,unit
        if(!NUM._invalid){
            NUM._invalid=new NUM(0,"")
            Object.defineProperty(
                NUM._invalid,"invalid",{value:true,writable:false,enumerable:true,configurable:false} );
            Object.defineProperty(
                NUM._invalid,"empty",{value:true,writable:false,enumerable:true,configurable:false} );
        }
        if(!NUM._zero){
            NUM._zero=new NUM(0,"")
            Object.defineProperty(
                NUM._zero,"empty",{value:true,writable:false,enumerable:true,configurable:false} );
        }

        if(v && v instanceof NUM){return v}
        if(!mutable&&(v==null||v=="")){ return NUM._invalid }
        else if(!mutable&&(v=="0"||v===0||v===false)){return NUM._invalid }
        else if(!mutable&&NUM.__cache_reuse[v]&&NUM.__cache[NUM.__cache_reuse[v]]){return NUM.__cache[NUM.__cache_reuse[v]]}
        var prsd=NUM.parseNumber(v||0,true)
        if(!mutable&&prsd[1]===null){return NUM._invalid;}
        if(!mutable&&prsd[1]===0){return NUM._zero;}
        var nu=new NUM(prsd[0]||0,prsd[1]||"",mutable,listener);

        NUM.__cache[nu.__id]=nu;
        if(!mutable){
            if(prsd[0]){
                NUM.__cache_reuse.push[v]=nu.__id
            }
        }
        return nu
    }
    return NUM
})();

