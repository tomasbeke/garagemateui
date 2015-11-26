/**
 * Created by Atul on 5/20/2015.
 */

$.simpleValueHolder = (function ( ) {

    var INIT={},defreader=function(a){return a};

    function simpleValueHolder(config,onchange){
        if(config==null){return}
        this.config=config||{}
        if((!this.config.reader || this.config.reader==defreader) && (this.config.type||this.config.typeInfo)){
            this.config.typeInfo= this.config.typeInfo||$.typeInfo.get(this.config.type)
            if(this.config.typeInfo){
                this.config.reader=this.config.typeInfo.coerce
            }
        }
        this.config.reader=this.config.reader||defreader;

        this.config.labels=this.config.labels||{}
        this.__data={orig:INIT}

        Object.defineProperty(this,"value",{
            get:function(){return this.__data?this.__data.val:null},
            set:function(v){
                if(!this.__data ){return}
                var D=this.__data,old=D.val,val=this.read(v,old),deflt;
                /*if (val==null && (deflt=this.config.defaultValue)!=null) {
                 if(typeof(deflt) == "function"){
                 val=deflt(this.config.name)
                 } else{val=deflt}
                 }*/
                var mod=(old!=val)//this.config.comparator?this.config.comparator(val,old):
                if(mod){
                    D.old=old;  D.val=val;
                    if(D.orig===INIT && val!=null){D.orig=val}
                    this.fire()
                }
            }
        });
        var ths=this
        this.set=function(v){return ths.value=v}
        this.get=function(v){return ths.value}
        if(this.config.defaultValue!=null){this.__data.val=this.config.defaultValue}
        if(typeof(onchange)=="function"){this.on(onchange)}
    }
    simpleValueHolder.prototype={
        isDirty:function(){return this.__data  && this.__data.orig!==INIT && this.__data.orig!==this.__data.val},
        isEmpty:function(){return !this.__data  || this.__data.orig===INIT },
        reset:function(a){
            if(!this.__data ){return}
            this.__data.orig=INIT
            this.value=a;
        },
        val:function(a){
            var ret=arguments.length?(this.value=a):this.value;
            if(this.config  && ret!=null && arguments.length>1 ){
                this.config.labels[ret+""]=arguments[1]
            }
            return ret;
        },
        format:function(format){
            if(this.config  && this.config.formatter){return this.config.formatter(this.value,format||this.config.format)}
            return $.format(this.value,format||this.config.format);
        },
        read:function(val,old){
            return this.config.reader(val,old,this);
        },
        off:function(fn){
            this.__listeners && this.__listeners.indexOf(fn)>-1 && this.__listeners.splice(this.__listeners.indexOf(fn),1);
            return this
        },
        getRecord:function(){
            var v=this.__data.val
            return {name:this.config.name,value:v,newValue:v,oldValue:this.__data.old,valueLabel:v==null?"":this.config.labels[v]}
        },
        on:function(fn,other){
            if(typeof(fn)!="function"){if(typeof(other)=="function"){fn=other;} else{return}};
            (this.__listeners||(this.__listeners=[])).push(fn);
            return this
        },
        fire:function(){
            if(!this.__data || (this._state&&this._state.paused)){return}
            var rec=this.getRecord();
            //console.log(rec);
            this.__listeners && this.__listeners.forEach(function(fn){ fn(rec) });
        },
        clone:function(onchange){
            var nu=new this.constructor(this.config,onchange);
            return nu;
        },
        valueOf:function(){   return this.value; },
        toJSON:function(){ return JSON.stringify(this.value);  },
        toString:function(){  return this.toJSON();  }
    }
    Object.defineProperties(simpleValueHolder.prototype,{
        "reader":{get:function(){return this.config && this.config.reader},set:function(v){return this.config && typeof(v)=="function" && (this.config.reader=v)}},
        "typeInfo":{get:function(){return this.config && this.config.typeInfo},
            set:function(v){
                if(!this.config){return}
                var t=v && $.typeInfo.get(v)
                if(t){
                    this.config.typeInfo=t;
                    this.reader= t.coerce;
                }
            }
        },
        isnill:{get:function(){return this.isEmpty()},set:function(v){}}
    });
    simpleValueHolder.prototype.dispatch=simpleValueHolder.prototype.fire
    simpleValueHolder.prototype.constructor=simpleValueHolder;
    simpleValueHolder.for=function(config,onchange){return new simpleValueHolder(config,onchange);}
    return  simpleValueHolder
})();