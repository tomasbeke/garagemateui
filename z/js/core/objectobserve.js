/**
 * Created by Atul on 12/3/2014.
 */
//---------------
if (!Object.observe) {
    (function (root) {

        var TIMER=0,INTERVAl=1500,_cache=[], getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
            defineProperty = Object.defineProperty, hasOwn = Object.prototype.hasOwnProperty, min = Math.min, i = setTimeout;

        function holder(object, onchange, fn) {
            var _notOwn = ["constructor", "prototype", "__proto__"];
            for (var k in object) {
                if (!hasOwn.call(object, k)) {
                    _notOwn.push(k)
                }
            }
            return {
                object: object,   keys: [], notown: _notOwn,  que: [],listeners:typeof(onchange)=="function"?[onchange]:[]
            }
        }

        function findNotifier(object) {
             for (var i = 0,C=_cache,   ln = C.length; i < ln; i++) {
                if (C[i] && C[i]._inner && C[i]._inner.object === object) {
                    return C[i];
                }
            }
            return null
        }
        function makeNotifier(object, onchange,options ) {
            var observer = new Notifier(object, onchange,options);
            _cache.push(observer);
            return observer
        }
        function _unobserve(obj, callback) {
            var idx,observer =  findNotifier(obj) ;
            if (observer) {var lidx=-1
                if(observer._inner && (lidx=observer._inner.listeners.indexOf(callback))>=0){
                    observer._inner.listeners.splice(lidx,1)
                }

                if(!observer._inner.listeners.length){
                    _cache.splice(_cache.indexOf(observer), 1)
                    observer._inner.object=null;
                    delete observer._inner.object;
                    delete observer._inner
                }

            }
        }

        function makeDescriptor(objnotifier ,propname) {

            var data=objnotifier._inner,object=data.object,propertyDescriptor = getOwnPropertyDescriptor( object, propname) || {};
            if(data.notown.indexOf(propname)>=0){return}
            if (Object.prototype.watch) {
                Object.prototype.watch.apply(object,[propname, function (propname, oldVal, newval) {
                    this.addQueue({type: "update" ,name: propname, newValue: newval, value: newval, oldValue: oldVal})
                    return newval;
                }.bind(objnotifier)])
            }
            else {
                var oldVal = object[propname],
                _setter=typeof(propertyDescriptor.set)=="function"?propertyDescriptor.set:null,
                _getter=typeof(propertyDescriptor.get)=="function"?propertyDescriptor.get:null
                if(propertyDescriptor.configurable!==false) {
                    try {
                        delete object[propname]
                    } catch (e) {
                    }
                }
                if(propname in object){
                    return
                };
                var descriptor={enumerable: propertyDescriptor.enumerable, configurable: propertyDescriptor.configurable};
                (function(name,D,notifier,G,S,val){
                    var currentVal = val, looper = 0
                    D.get = G||function () { return currentVal  }
                    D.set = function (newval) {
                            if (looper||currentVal === newval) {
                                return currentVal
                            }
                            looper = 1;
                            var oldVal = currentVal
                            try {
                                if(S){
                                    S(newval)
                                    if(!this || this===self){
                                        if(notifier._inner && notifier._inner.object) {
                                            newval = notifier._inner.object[name]
                                        }
                                    }
                                    else{
                                        newval=this[name]
                                    }
                                    if (currentVal === newval) {  return  }
                                }
                                currentVal=newval
                                if(!notifier.__blocked__){
                                    notifier.addQueue({type: "update" ,name: name, newValue: currentVal, value: currentVal, oldValue: oldVal})
                                 }
                            } finally {
                                looper = 0
                            }
                            return oldVal
                        };

                })(propname,descriptor,objnotifier,_getter,_setter,oldVal);

                 defineProperty(object, propname,descriptor)
            }
        }
        function _watcher(prop,noque ) {
            var data = this._inner;
            if(data.keys.indexOf(prop) == -1 && data.notown.indexOf(prop)==-1){
                var val = data.object[prop];
                data.keys.push(prop);
                makeDescriptor(this, prop );
                if(!noque){
                    this.addQueue({type: "add", name: prop, value: val, newValue: val });
                }
            }
            return this
        }
        function _scan(c,isinit){


        }
        function onInterval(){
            return setTimeout((function (cache) {
                    var C=cache
                return function _monitor() {
                    var ln = C.length;
                    if(!ln){
                        if(TIMER){clearTimeout(TIMER);TIMER=0}
                        return
                    }
                    for (var i = 0; i < ln; i++)  {
                        C[i].__onlyupdates || C[i].scan( )
                    }
                    TIMER=setTimeout(_monitor,INTERVAl)
                }
              })(_cache)
              , INTERVAl);
        }


          var Notifier = function (object, onchange ,options) {//t, n, r
                if(options && Array.isArray(options) && options.length==1 && options[0]=="update"){
                    this.__onlyupdates=true;options={}
                }
                else if(options && options.acceptList&& options.acceptList.length==1 && options.acceptList[0]=="update"){
                    this.__onlyupdates=true
                }

                var h = holder(object, onchange );
              options=options||{}
              if(options && Array.isArray(options.ignore)){
                  h.notown=h.notown||[];
                  [].push.apply(h.notown,options.ignore)
              }

                if(!(options.acceptList && options.acceptList.length)){this.acceptList=null}
                else {this.acceptList=options.acceptList.slice()}
              h.propvalidator=options.propvalidator
              if(typeof(h.propvalidator)!="function"){h.propvalidator=function(){}}
                h.watch = _watcher.bind(this);

                Object.defineProperty(this, "_inner", {value: h, writable: false, configurable: false, enumerable: false});
                this.scan(true)
                if(!TIMER && !this.__onlyupdates && this.acceptList && (this.acceptList.indexOf("delete")>=0||this.acceptList.indexOf("add")>=0)){
                        onInterval();
                }

        };
        Notifier.prototype.scan = function ( isinit) {
            var c=this,inner=c._inner, object = inner.object, keys = inner.keys,allkeys=Object.keys(object),ignore=inner.notown ||[] ;
            var propvalidator=inner.propvalidator

            if(!allkeys.length && !keys.length){return}
            for (var  i = allkeys.length - 1, k; k = allkeys[i], i >= 0; i--) {
                k && keys.indexOf(k) == -1 && ignore.indexOf(k) == -1 && propvalidator(k)!==false && inner.watch(k,isinit);
            }
            if(!this.acceptList || this.acceptList.indexOf("delete")>=0) {
                for (var j = keys.length - 1, k; k = keys[j], j >= 0; j--) {
                    k && allkeys.indexOf(k) == -1 && ignore.indexOf(k) == -1 && keys.splice(i, 1) && c.addQueue({type: "remove", name: k});
                }
            }
        }
        Notifier.prototype.performChange=function (type,fn ) {
            this.__blocked__=true;
            var res
            try{
                res= fn.call(this)
            } finally{
                this.__blocked__=false;
                if(res && typeof(res)=="object"){
                    var rec={}
                    for(var k in res){
                        rec[k]=res[k];
                    }
                    rec.type=type;
                    rec.object=this._inner.object;
                    this.notify(rec);
                }
            }


        }
        Notifier.prototype.addProperty = function (nm ) {
            _watcher(nm,true)
        }
        Notifier.prototype.deliverChangeRecords = function ( ) {
            this._timer=0;
            var que=this._inner.que
            que && que.length && this.notify(que.splice(0, que.length))
        };
        Notifier.prototype.addQueue = function (rec) {
            var _inner=this._inner
            _inner.que.push(rec);
            this._timer ||(this._timer=setTimeout(this.deliverChangeRecords.bind(this), 50));
        }
        Notifier.prototype.notify = function (records) {
            if(!(records&&typeof(records)=="object")){return}
            if(!Array.isArray(records)){records=[records]}
            if (!(records && records.length)) {
                return
            }

            var  recordsln=records.length,object=this._inner.object
            for (var i = 0; i < recordsln; i++) {
                records[i] && (records[i].object=object)
            }
                var l = this._inner.listeners, ln = l.length
                if (ln === 1) {
                    l[0](records)
                } else {
                    for (var i = 0; i < ln; i++) {
                        l[i](records)
                    }
                }

        };




        root.getNotifier   =function (object, onchange,options) {
            return findNotifier(object)||makeNotifier(object,onchange,options )
        };
        root.observe   =function (object, onchange ,options) {
            if(!$.isPlain(options)){options={}}
            if(Array.isArray(object.___toignoreforobserve)){
                options.ignore=object.___toignoreforobserve.slice();
                delete object.___toignoreforobserve;
            }
            if(object.___propvalidator){
                options.propvalidator=object.___propvalidator
                delete object.___propvalidator;
            }
            var Notifier = Object.getNotifier  (object, null,options  );
            if(Notifier && typeof(onchange)=='function'){
                Notifier._inner.listeners.indexOf(onchange)==-1 && Notifier._inner.listeners.push(onchange)
            }
            return Notifier
        };
        root.unobserve =_unobserve



    })(Object)
}
Object.observeProperties=function(object, onchange ,options){
    if(!$.isPlain(options)){options={}}
    if(options.toignoreforobserve){
        object.___toignoreforobserve=options.toignoreforobserve;
    }
    if(options.propvalidator){
        object.___propvalidator=options.propvalidator;
    }
    var acceptList=["update"]
    if(options.acceptList){
        if(Array.isArray(options.acceptList)){acceptList=options.acceptList.slice}
        if(options.acceptList=="update"){acceptList=["update"]}
     }
    var ret= root.observe(object, onchange ,acceptList)
    delete object.___propvalidator
    delete object.___toignoreforobserve
    return ret;
}
;