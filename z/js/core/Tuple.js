/**
 * Created by Atul on 5/20/2015.
 */

$.Tuple=function activeTuple(id,keysordata,modcallback){
    if(!(this instanceof activeTuple)){return new activeTuple(id,keysordata,modcallback)}
    this.memo=null;
    this.keyset=null;
    this.valueset=[];
    if(id && typeof(id)!="string"){

        if(typeof(id)=="function"){
            modcallback=id
            id=null;
        } else if(typeof(id)=="object"){
            keysordata=id;id=null;
            modcallback = keysordata
        }
    }
    if(!(keysordata||typeof(keysordata)=="object")){keysordata=null}
    this.id=id|| $.UUID()
    this.setData(keysordata)
    if(typeof(modcallback)=="function"){
        this.onchange(modcallback)
    }

}
$.Tuple.prototype={
    itemIndex:function(nm){
        return this.keys().indexOf(nm)
    },
    cloneMe:function(withvals) {
        var nu=new $.Tuple();
        nu.keyset=this.keys();
        if(withvals===true){
            nu.setData(this.toMap())

        } else if(withvals && typeof withvals =="object"){
            nu.setData(withvals);
        }
        return nu
    },
    each:function(fn,ctx,exiton){var res=[]
        exiton=exiton===undefined?{}:exiton
        for(var i= 0,l=this.keys(),ln= l.length,nm;nm=l[i],i<ln;i++){
            if(fn.call(ctx||self,this.valueset[i],nm,this)===exiton){break;}
        }
        return this
    },
    keys:function(){return this.keyset||(this.keyset=[])},
    values:function(){var vals=[]
        for(var i= 0,l=this.keys(),ln= l.length,nm;nm=l[i],i<ln;i++){
            vals.push(this.getItem(nm))
        }
        return vals
    },
    transform:function(fn){
        if(this.__readonly){return}
        var fac=this.__facade,facdata=null
        if(fac){
            facdata=$.objectMap.getOrCreate(fac,"objectobserve");
            facdata.paused=true
        }

        for(var i= 0,l=this.keys(),ln= l.length,nm;nm=l[i],i<ln;i++){
            this.valueset[i]=fn(nm,this.getItem(nm));
            if(fac){fac[nm]=this.valueset[i]}
        }
        if(facdata){facdata.paused=false}
        return this
    },
    defineField:function(nm,getter,setter){
        if(this.__readonly){setter=true}
        if(!isNaN(nm)||nm.index("_")==0){return this}
        if(nm in this){
            if(typeof(this[nm])=="function"){return}
            delete this[nm]
        }
        if(nm in this){return this};
        if(this.itemIndex(nm)<0){
            this.setItem(nm,null,true)
        }
        $.defineProperty(this,nm, {
            get:typeof(getter)=="function"?getter:(function(name){return function(){  return this.getItem(name) }})(nm),
            set:typeof(setter)=="function"?setter:(setter===true?function(){}:(function(name){return function(v){    this.setItem(name,v)  }})(nm))  ,
            enumerable:true,configurable:false
        } );
        return this
    },
    getItem:function(nm){
        if(this.__mods && nm in this.__mods ) {
            return this.__mods[nm];
        }
        return this.valueset[this.itemIndex(nm)]
    },
    clear:function( ){
        if(this.__readonly){return}
        this.setData(null,true);
        this.keyset=[]
        this.valueset=[]
    },
    setData:function(keysordata,clear){
        var fac=this.__facade,facdata=null
        if(fac){
            facdata=$.objectMap.getOrCreate(fac,"objectobserve");
            facdata.paused=true
        }
        if(clear ){
            delete this.__mods;
            for(var i= 0,l=this.keys() ,ln= l.length,nm;nm=l[i],i<ln;i++){
                this.valueset[i]=null;
                if(fac){fac[k]=null}
            }
        }
        if(keysordata){
            var ks=this.keys() ;
            if($.isArrayLike(keysordata)){
                if(!ks.length){
                    this.keyset=ks=[].slice.call(keysordata)
                }
                else {
                    for (var i = 0, l = keysordata, ln = l.length, k; k = l[i], i < ln; i++) {
                        if(i<ks.length){
                            this.valueset[i]=k
                        }
                        /*var idx = this.itemIndex(k);
                         if (idx > -1) {
                         idx = ks.push(k) - 1
                         }*/
                    }
                }

            }  else{
                for(var i= 0,l=Object.keys(keysordata),ln= l.length,k;k=l[i],i<ln;i++){
                    if(isNaN(k)){
                        var idx=this.itemIndex(k);
                        if(idx==-1){
                            idx=ks.push(k)-1
                        }
                        this.valueset[idx]=keysordata[k];
                        if(fac){fac[k]=this.valueset[idx]}
                    }
                }
            }
        }
        if(facdata){facdata.paused=false}
        return this
    },
    setItem:function(nm,val,addifnot){
        if(this.__readonly){return}
        var i=this.itemIndex(nm),curr=null,type=null
        if(i>=0){
            curr=this.getItem(nm)
            this.__mods || (this.__mods = {});
            if(val===null){
                delete this.__mods[nm] ;
                trpe="delete"
            }
            else if(curr!==val) {
                this.__mods[nm] = val;
                type="update"
            }
        } else if(addifnot===true){
            type="add"
            this.valueset[this.keys().push(nm)-1]= val ;
        }
        if(type){
            this.__callbacks&&this.__callbacks.dispatch({type:type,name:nm,value:val,newValue:val,oldValue:curr})
            if(this.__facade){
                if(type=="delete"){delete this.__facade[nm]}
                else{this.__facade[nm]=val}
            }
        }
        return curr
    },
    setReadOnly:function(flag){
        if(flag===false){this.__readonly=false;return this}
        this.clearMods(true);
        this.__readonly=true
        return this

    },
    isModified:function(){

        return this.__mods && Object.keys(this.__mods).length
    },
    toMap:function(nonulls){var v=null,res={}
        for(var i= 0,l=this.keys() ,ln= l.length,nm;nm=l[i],i<ln;i++){
            v=this.getItem(nm)
            if(nonulls&&v==null){continue}
            res[nm]=v
        }
        return res
    },
    observerFacade:function(sync){
        if(this.__facade){return this.__facade}

        var keepsync=!!sync
        this.__facade={}
        $.observe(this.__facade,function(r){
            if(r.type=="update"){
                if(this.getItem(r.name)!== r.value){
                    this.setItem(r.name, r.value,keepsync)
                }
            }
        }.bind(this));
        return this.__facade;
    },
    clearMods:function(sync){
        if(this.__readonly){return}
        if(sync&&this.__mods){
            var data= $.clone(this.__mods);
            this.setData($.clone(this.__mods));
        }
        this.__mods=Object.create(null);
        return this
    },
    mods:function(nocopy,asmap){
        if(!asmap){
            return Object.keys(this.__mods||{});
        }
        return this.__mods?(nocopy?this.__mods:$.clone(this.__mods)):{}
    },
    onchange:function(nm,fn,optns){
        if(typeof(nm)=="function"){optns=fn;fn=nm;nm="*"}
        if(!this.__callbacks){
            this.__callbacks= $.callbacks("change",this);
            this.__callbacks.setFilter(function(dlg,args,optns){
                if(optns.propname==="*" || (args[0]&&optns.propname===args[0].name)){
                    return true;
                }
            })
        }
        nm = nm||"*";
        var config={}
        if(typeof (optns)=="boolean"){
            config.once=optns
        } else if(typeof (optns)=="string"){
            config.id=optns
        } else if($.isPlain(optns)){
            $.extend(config,optns)
        }
        if(fn===null){
            this.__config.callbacks.remove(
                fn,config.id
            );
            return
        }
        var f=$.fnize(fn);
        this.__callbacks.add(f,{propname:nm})
        if(nm!=="*"){
            if(this.__mods && (nm in this.__mods)){var v=this.__mods[nm]
                v!==null && f.call(this,{name:nm,value:v,newValue:v})
            }
        }
        return this
    }
}