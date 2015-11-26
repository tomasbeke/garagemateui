/**
 * Created by Atul on 5/20/2015.
 */

$.listCollection = function (vks,confg) {
    var ctor=function(init,cnfig){
        if(!(this instanceof ctor)){return new ctor(init,cnfig)}
        var config={}
        if($.isPlain(cnfig)){config=cnfig}
        else{
            if(typeof(cnfig)=="boolean"){config={caseinsensitive:cnfig}}
            else if(typeof(cnfig)=="function"){config={nameresolver:cnfig}}
        }
        if(typeof(init)=="boolean"){config.caseinsensitive=init;init=null}
        else if(typeof(init)=="function"){config.nameresolver=init;init=null}

        var data=$.objectMap.getOrCreate(this,"observer")
        this.__last=[null,false];
        this.__config={}
        $.extend(this.__config,config)

        this.__config.casemap={};
        if(init && typeof(init)=="object"){
            var _d=data
            if(Array.isArray(init)|| $.isPlain(init)){
                $.extend(this,init);
            } else {
                if($.isArrayLike(init)){
                    for(var i=0,l=init,ln= l.length;i<ln;i++){
                        this.add(l[i])
                    }
                }
                for(var i=0,l= $.keys(init),ln= l.length;i<ln;i++){
                    if(l[i]!=="length" && isNaN(l[i]) && typeof(init[l[i]])!="function") {
                        this[l[i]]=init[l[i]]
                    }
                }
            }
        }

        $.observe(this, {onlyonchange:true,ignorearrayops:true},
            function(rec){var r= rec.value||[],_d=data,currp=_d.paused,obj=this
                if(r.length){
                    for(var i= 0,ln= r.length;i<ln;i++){
                        if(r[i]){
                            var it=r[i],v=it.name,nm=v
                            if(nm=="length"||!isNaN(v)){continue}
                            _d.paused=true
                            try {
                                if (it.type === "delete" && it.type === "remove") {
                                    obj.remove(nm)
                                } else {
                                    obj.add(nm)
                                }
                            } catch(e){throw e;  } finally {
                                if(!currp){delete _d.paused}
                            }
                        }
                    }
                }
            });
        if(this.__config.notextensible||this.__config.extensible===false||this.__config.seal ){
            this.__config._sealed=true
        }
    };
    ctor.prototype=new Array();
    ctor.prototype.__resolveName=function(ky,val){
        var nm= ky,orig,c=this.__config,lst=this.__last
        if(lst[0]===ky){return lst[1]}

        lst[0]=ky;
        if(c.nameresolver ){
            nm=c.nameresolver(ky,val)
            if(nm===false||nm==null){
                return lst[1]=false;
            }
        }
        orig=nm
        if(typeof(nm)=="string" &&isNaN(nm)&& c.caseinsensitive){
            nm=nm.toLowerCase()
        }
        return lst[1]=nm
    }
    ctor.prototype.add=function(v){
        var nm= this.__resolveName(v),orig=v
        if(nm===false){return}
        if(this.indexOf(nm)==-1){ this.push(nm)}
        if(orig!==nm){
            this.__config.casemap[nm].indexOf(orig)==-1&&this.__config.casemap[nm].push(orig);
        }
        return this
    }
    ctor.prototype.remove=function(v){
        var nm= this.__resolveName(v),orig=v
        if(nm===false){return}
        var curr=this[nm],_d=this.__config
        if(this.indexOf(nm)>-1){
            this.splice(this.indexOf(nm),1)
        }
        if(_d.caseinsensitive && _d.casemap[nm]){var map=_d.casemap[nm]
            while(map.length){
                delete this[map.shift()];
            }
        }
        return curr
    }
    ctor.prototype.contains=function(v){
        var nm= this.__resolveName(v),orig=v
        if(nm===false){return}
        return this.indexOf(nm)>=0||this.indexOf(orig)>-1
    }
    ctor.prototype.toggle=function(v){
        this.contains(v)?this.remove(v):this.add(v)
        return this
    }
    ctor.prototype.constructor=ctor;
    ctor.newInstance=function(init,config){ return new ctor(init,config)}
    $.listCollection=ctor

    return ctor.newInstance(vks,confg)
}