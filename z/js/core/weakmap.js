;
(function () {
    if (typeof WeakMap != "undefined"&&typeof Map != "undefined"&&typeof WeakSet != "undefined"&&typeof Set != "undefined") {return}

        function makeProto(asmap,primitivesallowedaskeys){
            var _proto = {};
            var directives={ LENGTH:"___length___",CLEAR:"___clear___", KEYS:"___keys___",VALUES:"___values___",ENTRIES:"___entries___"}
            _proto.init=function(initdata){
                  this.__store=(function(){
                     var _keys=[],_values=[]
                     return function(key){
                         if(key==null){return}
                         if(typeof(key)=="string" && (key.indexOf("___")==0||[key])){
                             directives[key]=directives[key]||key;
                             if(key==="___length___") {
                                 return _keys.length;
                             }else if(key==="___clear___") {
                                 for(var i= 0,ln=_keys.length;i<ln;i++){_keys[i]=null;  _values[i]=null}
                                 _keys.length=0;  _values.length=0;
                                 return;
                             }else if(key==="___keys___"){
                                 return arguments[1]===true?_keys:_keys.slice()
                             } else if(key==="___values___"){
                                 return arguments[1]===true?_keys:_values.slice()
                             } else if(key==="___entries___"){

                                 return _keys.reduce(function(m,val,idx){m.push([idx,val]);return m},[])
                             }
                         }
                         if(!primitivesallowedaskeys&&typeof(key)!="object"){
                             throw "primities are not allowed as keys"
                         }
                         var idx=_keys.indexOf(key),val=arguments[1],old=_values[idx]
                         if(arguments.length==2){
                             if(val===null) {
                                 if (idx >= 0) {
                                     _keys.splice(idx, 1)
                                     _values.splice(idx, 1)
                                 }
                             } else if(val==="__has__"){
                                 return !(idx >= 0)
                             } else {
                                 if (idx < 0) {
                                     idx = _keys.push(key) - 1
                                 }
                                 _values[idx] = arguments[1]
                             }

                         }
                         return old
                     }
                })();

                if (initdata && typeof(initdata)=="object" && initdata.length) {
                    var asmap=this.asmap,store=this.__store
                    for (var n = 0, r = initdata, i = initdata.length,entry;entry=initdata[n], n < i; n++) {
                        if (entry!=null && (!asmap ||entry.length === 2)) {
                            if(asmap){
                                store(entry[0], entry[1])
                            } else{
                                store(entry)
                            }
                        }
                    }
                }
            }
            Object.defineProperty(_proto, "asmap", {value:!!asmap,writable:false,enumerable:false })
            Object.defineProperty(_proto, "primitivesallowedaskeys", {value:!!primitivesallowedaskeys,writable:false,enumerable:false })

            if(asmap) {
                _proto.forEach = function (fn, ctx) {
                    if (typeof fn != "function") { return  }
                    var keys = this.data(directives.KEYS,true),vals = this.data(directives.VALUES,true)
                    for (var r = 0, ln = keys.length; r < ln; r++) {
                        fn.call(ctx, vals[r], keys[r], this)
                    }
                };
            } else{
                _proto.forEach = function (fn, ctx) {
                    if (typeof fn != "function") { return  }
                    var keys = this.data(directives.KEYS,true)
                    for (var r = 0, ln = keys.length; r < ln; r++) {
                        fn.call(ctx, keys[r], r, this)
                    }
                };
            }


            if(asmap){
                _proto.has = function (name) {  return this.__store(name,"__has__")  };
                _proto.set = function (name,val) { this.__store(name,val)  };
                _proto.get = function (name) { this.__store(name)  };
            }
            else{
                _proto.has = function (name) {  return this.data(directives.VALUES,true).indexOf(name)>=0  };
                _proto.add = function (name) { this.__store(name,1)  };
            }
            _proto.clear = function () {   this.__store(directives.CLEAR); return this };
            _proto["delete"] =  function (name) {  return this.__store(name,null) };
             _proto.keys =      function () {   return this.data(directives.KEYS) };
            _proto.values =     function () {   return this.data(directives.VALUES) };
            _proto.entries =    function () {   return this.data(directives.ENTRIES)   };
            Object.defineProperty(_proto, "length", {
                get: function () {
                   return  this.__store?this.__store(directives.LENGTH):-1
                }, set: function () {
                    throw "invalid operation. length can not be set"
                }, enumerable: true, configurable: true
            })
            return _proto


        }
    if (typeof WeakMap == "undefined") {
        self.WeakMap = function weakMap(initdata) {
            if (!(this instanceof weakMap)) {  return new weakMap(t)  }
            this.init(initdata);
         }
        self.WeakMap.prototype=makeProto(true,false);
        self.WeakMap.prototype.constructor=self.WeakMap
    }
    if (typeof WeakSet == "undefined") {
        self.WeakSet = function weakSet(e) {
            if (!(this instanceof weakSet)) { return new weakSet(e)  }
            this.init(e);
        }
        self.WeakSet.prototype=makeProto(false,false);
        self.WeakSet.prototype.constructor=self.WeakSet
    }
    if (typeof Map == "undefined") {
         self.Map =  function map(t) {
                if (!(this instanceof map)) { return new map(e)  }
                this.init(t);
            }
            self.Map.prototype=makeProto(true,true);
        self.Map.prototype.constructor=self.Map
     }
    if (typeof Set == "undefined") {
        self.Set = function set(initdata) {
            if (!(this instanceof set)) { return new set(e)  }
            this.init(initdata);
        }
        self.Set.prototype=makeProto(false,true);
        self.Set.prototype.constructor=self.Set
    }
})();
