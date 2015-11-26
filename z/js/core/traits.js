/**
 * Created by Atul on 5/20/2015.
 */

$.traits = (function () {
    var _cache={}
    return {
        register:function(name,object,setup){
            if(typeof(object)=="function"){setup=object;object=null}
            _cache[name]={object:object,setup:setup};
        },
        addTrait:function(object,name){
            if(_cache[name]){
                var data=$.objectMap.getOrCreate(object,"traits");
                if(!this.has(object,name)) {
                    if(_cache[name].object && typeof (_cache[name].object)=="object"){
                        $.mixin(object,_cache[name].object)
                    }
                    if (_cache[name].setup) {
                        _cache[name].setup(object,_cache[name].object);
                    }

                    if(!data[name]){
                        data[name]=1
                    }
                }
            }
        },
        has:function(object,name){
            return $.objectMap.getOrCreate(object,"traits")[name];
        },
        isPromise:function(obj){
            return obj && obj.isPromise
        },
        isVisitable:function(obj){
            return obj && typeof(obj.accept)=="function"
        }
    }
})();
