/**
 * Created by Atul on 5/20/2015.
 */
function PropertyWatcher( ) {
    var fncache={},counter= 1,isplain= $.isPlain
    defHandlone=function(rec,ctx){
        this[0] && this[0].fn && this[0].fn.call(ctx,rec)
    },
        defHandle=function( rec){

            var l=this, ln= l.length,val=(isplain(rec) && ("name" in rec && ("newValue" in rec||"oldValue" in rec)))?(rec.value==null?rec.newValue:rec.value):rec
            if(ln==1){
                return this[0].fn && this[0].fn ( val)
            }
            for(var i= 0;i<ln;i++){
                if(l[i] && l[i].fn){
                    l[i].fn ( val)
                }
            }
        }
    function _onchange( obj, prop, optns) {
        isplain||(isplain= $.isPlain);
        var fn=typeof(optns)=="function"?optns:optns.validator,off=null
        if(!(obj && ( typeof(obj)=="function" || typeof(obj)=="object"))){return}
        optns=optns||{}
        var data=$.objectMap.getOrCreate(obj,"_watcher_"),handle
        if(!data.props){data.props={}}
        var handles=data.props[prop]||(data.props[prop]=[]);
        var curr=handles.find(function(it){return  (it.id && it.id===optns.id )})
        if(curr  ){
            //if(typeof(fn)=="function"){curr.fn=fn;}

        } else{
            handles.push(curr= $.extend({fn:fn},optns))
            curr.prop=prop
            curr.off=function(){
                var idx=handles.indexOf(curr)
                if(idx>=0){handles.splice(idx,1)}
                if(!handles.length){handles.off()}
            }
        }
        if(!handles.handle) {
            handles.handle = defHandle.bind(handles )
            handle = handles.handle
            var ret, args = optns.args
            if (obj.nodeType) {
                $d.onAttach(obj, function (dom) {
                    if (prop == "value" && obj.type) {
                        ret = $d.on(obj, "change", function () {
                            handle(  $d.val(this) )
                        })
                        handles.off = $d.off.bind($d, obj, handle)
                    }
                    else {
                        ret = $d.watchMutation(dom, prop, handle)
                        handles.off = $d.watchMutation.bind($d, obj, false)
                    }
                })

            }
            else if (typeof(obj.getController) == "function" && obj.getController().hasMethod(prop)) {
                var res = obj.getController().invoke(prop, $.isArray(args) ? args : (args ? [args] : []))
                if (res) {
                    if (res.isPromise) {
                        res.then(handle)
                    } else {
                        handle(res)
                    }
                }
                else {
                    ret = handle(res)
                }
            }
            else if (typeof(obj.onchange) == "function") {
                ret = obj.onchange(prop, handle, optns)
                handles.off = obj.onchange.bind(obj, prop, false, handle)
            }
            else if (obj.properties) {
                ret = obj.properties.onchange(prop, handle)
                handles.off = obj.properties.onchange.bind(obj.properties, prop, false, handle)
            } else if (typeof(obj.onpropertychange) == "function") {
                ret = obj.onpropertychange(prop, handle, optns)
                handles.off = obj.onpropertychange.bind(obj, prop, false, optns)
            } else if (typeof(obj.on) == "function") {
                ret = obj.on(prop, handle, optns)
                handles.off = obj.off.bind(obj, prop, false, optns)
            } else {
                ret = $.defineAccessors(obj, prop, optns)
            }
        }
        if(prop in obj && obj[prop]!=null ){
            var val=obj[prop]
            fn( val )
        }
        return handles
    }
    function watchProperty(object, name, onchange, optns0) {
        var optns = {enumerable: true, configurable: true}
        if (optns0 === true) {
            optns.enumerable = true
        }
        else if (optns0 && typeof(optns0) == "object") {
            $.extend(optns, optns0)
        }

        if (arguments[4] === true) { optns.configurable = true }
        if(onchange===false) {
            var data = $.objectMap.get (object, "watcher")
            if (data  && data.props && data.props[name]) {
                if(data.props[name].length){
                    if(optns.id){
                        var found=data.props[name].find(function(it){return it.id===optns.id&&it.prop===name})
                        if(found){
                            found.off(optns.id)
                        }
                    }
                }
            }
            return;
        }
        if (arguments[5] === true) {  optns.noAsync = true  }
        if(!optns.id){optns.id= $.UUID()}
        if (!(object && ( typeof(name) == "string"))) {  return }
        if (typeof(object) != "object" && typeof(object) != "function") {  object = Object(object) }
        //if(!(name in object)){
        var sti = self.setImmediate || (self.setImmediate = function (fn) { return setTimeout(fn, 0) })
        if (optns.overwrite && name in object) {
            try {
                delete object[name]
            } catch(e){
                if(name in object){
                    console.log("this property is not configurable",name,object)
                    return
                }
            }
        }
        var ch = optns.noAsync === true ? onchange  : sti.bind(self, onchange.bind(object )), memo = optns.memo
        var mrec=optns.recordGenerator||$.mutationRecordGenWithName(object,name)

        function _valdispatcher(val) {
            var mod=mrec( val )
            if( mod.oldValue != mod.newValue) {
                mod.memo=memo
                ch(mod);
                //if(typeof(nu)!="undefined" && val!=nu){val=mod.newValue=mod.value=nu}
            }
            return val;
        }
        var parsed;
        if(/[^\w_\$\.]/.test(name)){
            (function(obj,nm,optns,throttled){
                parsed=/\$[a-z]+/.test(nm)?$.template(nm):$.parseExpr(nm)
                if(parsed.vars){
                    parsed.vars.forEach(function(k){
                        _onchange(obj,k,{validator:function(){
                            throttled( parsed(obj) )},id:optns.id })
                    })
                }
            })(object,name,optns,$.throttle(_valdispatcher,true));
        }
        else if(name.indexOf(".")>0){
            var idseed=Date.now(),arr=name.split(".").map(function(a,i){return {name:a,handle:null,index:i,id:i+idseed}});
            arr.push({name:"__val__",term:true})
            var _next=function _next(index){
                var k, old, val,rec,argslength=arguments.length
                if(argslength>1){
                    val=arguments[1]
                }

                if(!arr[index]||arr[index].term){
                    _valdispatcher( val)
                } else {
                    if (typeof(val) == "function") {
                        val = val.call(this)
                    }
                    if (val && typeof(val) == "object") {
                        arr[index].handle=_onchange(val, arr[index].name, {id:String(index + idseed),validator:_next.bind(val, index + 1) })
                    }
                }
                return val
            }
            _next(0,  object )

        } else{
            _onchange(object, name, $.extend({validator:_valdispatcher},optns))
        }
        if(parsed){
            try {
                parsed(object)
            } catch(e){}
        }
        return  object
    }
    return watchProperty
}