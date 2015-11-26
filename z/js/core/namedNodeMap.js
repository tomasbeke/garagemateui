/**
 * Created by Atul on 5/20/2015.
 */

$.namedNodeMap=function(){
    var attr=function(nm,val){this.name=nm;this.value=val}
    attr.prototype.toString=function(){return this.name+"="+this.value}
    var __data=function(){};
    __data.prototype=new Array();
    __data.prototype.contains=function(ky){
        return this.findIndex(ky)>=0
    }
    __data.prototype.remove=function(ky){
        var i=this.findIndex(ky,true)
        if(i[0]>=0){
            this.splice(i[0],1)
        }
        return i[1];
    }
    __data.prototype.get=function(ky){
        return this.findIndex(ky,true)[1]
    }
    __data.prototype.set=function(ky,val){
        if(ky==null){return null}
        var i= this.findIndex(ky)
        if(i>=0){
            this[i].value=val
        } else if (typeof(ky)=="string"){
            this.push(new attr(ky,val))
        }
    }
    __data.prototype.findIndex=function(ky,andVal){
        var toret=-1
        if(ky!=null) {
            if (typeof(ky) == "number") {
                toret = ky
            }
            else if (typeof(ky) == "string") {
                for (var i = 1, l = this, ln = l.length; i < ln; i++) {
                    if (l[i].name === ky) {
                        toret = i
                    }
                }
            } else if (ky && ky instanceof attr) {
                toret = this.indexOf(ky)
            }
        }
        if(toret>=0){
            return andVal===true?[toret,this[toret]]:toret;
        }
        return andVal===true?[-1,null]:-1
    }
    function ctor(){
        if(!(this instanceof ctor)){return new ctor()}
        this.__data=new __data();
    }
    var proto={
        getNamedItem: function getNamedItem(name) {return this.__data.get(name)},
        item: function item(idx) { this.__data[name] },
        removeNamedItem: function removeNamedItem(name) { return this.__data.remove(name) },
        setNamedItem: function setNamedItem(name,value) {return this.__data.set(name,value);  },
    }
    proto.getNamedItemNS=proto.getNamedItem;proto.removeNamedItemNS=proto.removeNamedItem;proto.setNamedItemNS=proto.setNamedItem
    ctor.prototype=proto;
    ctor.newInstance=function(){
        return new ctor();
    }
    $.namedNodeMap= ctor
    return ctor.newInstance();
}