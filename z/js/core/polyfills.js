;
(function(){
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function() {},
            fBound  = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this   : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
};
(function(){
    function namecheck(){}
    if(namecheck.name !=="namecheck"){
        try {
            Object.defineProperty(Function.prototype, "name", {
                get: function () {
                    if (this.__name__ == null) {
                        this.__name__ = this.toString().split(/\(/).shift().replace(/function\s*/, "").trim();
                    }
                    return this.__name__;
                }, set: function () {
                }, enumerable: false
            })
        } catch(e){}
}

})();
//polyfills
self.polyFillNative=function (host,nm,value){
    if(host[nm]!=null){return}
    if(Object.defineProperty){
        var descript={value:value,enumerable:false,writable:false,configurable:true};
        if(value && typeof(value)=="object"&&typeof(value.get)=="function"&&typeof(value.set)=="function"){
            descript=value;
            if(descript.enumerable==null){descript.enumerable=false;}
            if(descript.configurable==null){descript.configurable=true;}
            if(descript.writable!=null){delete descript.writable ;}
        }
        Object.defineProperty(host,nm,descript)
    } else{host[nm] = value;}
}

;(function(global){"use strict";
    function t(e){try{new e;return true}catch(t){return false}}
    if(!("from" in Array) || !("of" in Array)){
        global.polyFillNative(Array,"from",function(e){
            'use strict';
            return e==null?[]:Array.prototype.slice.call(e);
            //       var n,r,i,s,o,u,a,f;n=Object(e);r=+n.length;i=this;if(t(i)){s=Object(new i(r))}else{s=new Array(r)}o=0;while(o<r){u=String(o);a=n.hasOwnProperty(u);if(a){f=n[u];s[o]=f}o++}return s}
        });
        global.polyFillNative(Array,"of"  ,
            function(){
                var p=Array.prototype,tmp=p.slice.call(arguments.length==1&&arguments[0]&&arguments[0].length?arguments[0]:arguments);
                return  p.concat.apply([],tmp)
                //function(){var e,n,r,i,s,o,u,a;e=Object(arguments);n=+e.length;r=this;if(t(r)){i=Object(new r(n))}else{i=new Array(n)}s=0;while(s<n){o=String(s);a=e[o];i[s]=a;s++}return i
            });
    }
})(self );


if(typeof(Date.now)=="undefined"){Date.now=function(){return +(new Date())}}

;(function(){var e=navigator.userAgent.match(/MSIE\s([\d][\d\.]+)/);if(document.documentMode||navigator.appName=="Microsoft Internet Explorer"){
    var t=1;try{var n={};Object.defineProperty(n,"_",{value:9});if(n._===9){t=0}}catch(r){}if(t){Object._defineProperty=Object.defineProperty;Object.defineProperty=function(e,t,n){n=n||{};if(typeof e.__defineGetter__=="function"){if(e.nodeType>0){Object._defineProperty(e,t,n);return}if(n.get){e.__defineGetter__(t,n.get)}if(n.set){e.__defineSetter__(t,n.set)}if(n.value){e[t]=n.value}}else{e[t]=n.value}};Object.defineProperties=function(e,t){for(var n in t){Object.defineProperty(e,n,t[n])}}}}
})();

;(function (M, o, f) {
    function _X(reqMethod, method, fun) { if (reqMethod in o && !(method in {})) o[f][method] = Element[f][method] = Window[f][method] = (typeof(HTMLDocument)=="undefined"?Document:HTMLDocument)[f][method] = fun;  };
    _X(M[0], M[2], function (prop, fun) { o[M[0]](this, prop, { get: fun });});
    _X(M[0], M[3], function (prop, fun) {o[M[0]](this, prop, { set: fun });});
    _X(M[1], M[4], function (prop) {return o[M[1]](this, prop).get|| o[M[1]](this.constructor.prototype, prop).get;});
    _X(M[1], M[5], function (prop) {return o[M[1]](this, prop).set|| o[M[1]](this.constructor.prototype, prop).set;});
})(["defineProperty", "getOwnPropertyDescriptor","__defineGetter__","__defineSetter__","__lookupGetter__","__lookupSetter__"], Object, "prototype");
(function () {
    for(var i=0,l=["addEventListener","removeEventListener","dispatchEvent"],ln=3,k ;k=l[i],i<ln;i++){
        if (!window[k]&&document[k]) {window[k] = document[k].bind(document); }
    }
})();
if(!Object.isSealed){Object.isSealed=function(){return false}}
if(!Object.isExtensible){Object.isExtensible=function(){return true}}
if(!Object.freeze){Object.freeze=function(o){return o}};
if(typeof(Event)!="undefined" && Event.prototype ){
    if(!("stopPropagation" in Event.prototype)){
        Event.prototype.stopPropagation=function(){return false}
    }
    if(!("stopImmediatePropagation" in Event.prototype)){
        Event.prototype.stopImmediatePropagation=function(){return false}
    }
}
if(typeof(MouseEvent)!="undefined" && MouseEvent.prototype && !("x" in MouseEvent.prototype) ){
    Object.defineProperties(MouseEvent.prototype,{
        "__xy__":{value:function(){
                if(this.__xy ){return this.__xy||{}}
                 this.__xy=(typeof($d)!="undefined" && $d.util && $d.util._mousePos)?$d.util._mousePos(this):null
                 return this.__xy||{}
            },enumerable:false
        },
        "x": {
            get: function () {
                return this.__xy__().x;
            }, set: function () { },enumerable:true
        },
        "y": {
            get: function () {
                return this.__xy__().y;
            }, set: function () { },enumerable:true
        },
    })
}

if (!(document.documentElement||document.body).classList &&
        // FF is empty while IE gives empty object
    (!Object.getOwnPropertyDescriptor(Element.prototype, 'classList')  ||
    !Object.getOwnPropertyDescriptor(Element.prototype, 'classList').get)
) {
    Object.defineProperty(Element.prototype,"classList",(function(){
        var __cache={}
        function makeRegExp(s){var string=String(s).trim()
            if(string in __cache){return __cache[string]}
            return __cache[string]=new RegExp("(^| )"+string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")+"( |$)","g");
        }
        var _inner={_el:null,
            toggle:function(s1){  (this._el&&s1)&&this[this.contains(s1)?"remove":"add"](s1,true) },
            contains:function(s){ return this._el&&s&&(" "+this._el.className+" ").indexOf(" "+s+" ")>=0  },
            add:function(s1,verified){
                if(verified!==true&&(!(this._el&&s1)||this.contains(s1))){return}
                this._el.className=this._el.className+" "+String(s1).trim();
            },
            remove:function(s1,verified){var curr
                if(verified!==true&&!( this._el&&s1&&this.contains(s1)&&(curr=this._el.className))){return}
                this._el.className=curr.replace(makeRegExp(s1),"").trim()
            }
        };
        return {get:function(){ _inner._el=this ;return _inner},set:function(){}}
    })())
};
(function () { //just put a place holder
    if (!(document.documentElement||document.body).dataset &&
        (!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset')  ||
        !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
    ) {
        try { // FF enumerates over element's dataset, but not   Element.prototype.dataset; IE9 iterates over both
            Object.defineProperty(Element.prototype, 'dataset', {value:{}});
        } catch (e) { }

    }
})();
!function _addShim( ){
    for(var j=0,args=arguments,ln0=args.length,a;a=args[j],j<ln0;j++) {if(!a){continue;}
        var host=a.shift();if(!(host&&(typeof(host)=="object"||typeof(host)=="function"))){continue}
        while(a.length>1) {
            var nm=a.shift(),mthd=a.shift()
            if(typeof(nm)=="string" && typeof(mthd)=="function"&&!(nm in host)){
                //console.log("shim",nm,mthd)

                self.polyFillNative(host,nm,mthd);
            }
        }
    }
}(
    [   Object,
        "is",function is(v1, v2) {
            if (v1 === 0 && v2 === 0) {return 1 / v1 === 1 / v2; }
            if (v1 !== v1) {return v2 !== v2;}
            return v1 === v2;
        },
        "assign", function(target ) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }

    ] ,

    [Object.prototype,
        "hasOwnProperty" ,
        function(i){   var o=this;
            return i!=null && o!=null &&typeof(o)==="object" && (i in o) && !(Object.getPrototypeOf(o) && Object.getPrototypeOf(o)[i]===o[i]);
        },
        "tap" , function(fn){
            try{fn.apply(this,Array.from(arguments,1))}catch(e){}
            return this;
        }
    ],
    [Object,
        "create" ,function(o1){
        var nu={},f=function(){};f.prototype=o1;
        for(var i= 0,l=Array.from(arguments,1),ln= l.length;i<ln;i++){
            for(var k in l[i]){f.prototype[k]=l[i][k] }
        }
        return new f
    },

    "getPrototypeOf" , function(o1){
        if(o1==null){return null}
        var ret,o=Object(o1);
         if(typeof(o1)=="function"){ret=o1.prototype}
        else if(o.__proto__!=null){ret=o.__proto__}
        else if(typeof(o.constructor)=="function"&&o.constructor.prototype){ret=o.constructor.prototype}
        return ret;
    },
    "keys" , function(o1){
        if (o1 !== Object(o1)) {
            throw new TypeError('Object.keys called on non-object');
        }
        var h=Object.prototype.hasOwnProperty,o=Object(o1),r=[];
        for(var k in o){
            h.call(o,k) && r.push(k)
        };
        return r;
    },
    "getOwnPropertyNames" , function getOwnPropertyNames(object) {
        if (!object || object !== Object(object)) {
            throw new TypeError('Object.getOwnPropertyNames called on non-object');
        }
         var buffer = [], key;
         for (key in object) {
             object.hasOwnProperty(key) && buffer.push(key);
        }
         return buffer;
    }
    ],
    [String.prototype,
        "startsWith" ,function(s){return s&&this.indexOf(s)===0} ,
        "endsWith" ,function(s){return s&&this.lastIndexOf(s)===this.length- s.length},
        "contains" ,function(s){return s&&this.indexOf(s)>=0} ,
        "trim" , function(){return this?this.replace(/^\s+|\s+$/g,""):""}

    ],
    [String ,
        "isNumber" , function(s){return Number.isNumber(+s)} ,
        "isString" ,function(s){return typeof(s)==="string"}
    ],
    [ Array,
        "isArray",function(a){return Object.prototype.toString.call(a) === '[object Array]';}
    ],
    [ Array.prototype,//Array shims
        "indexOf" ,function(v,st){var _is=Object.is,l=this;
        for(var i=Math.max(0,st|0), ln=l.length,k; i<ln;i++){
            if(_is(l[i],v)){return i}
        }
    } ,
        "lastIndexOf" ,function(l,v){var i=-1,r=-1,l=this,ln=l.length
        i=Math.max(r=l.indexOf(v,(ln/2)|0),0);
        while(i<ln-1&&(i=l.indexOf(v,++i))>=0){r=i}
        return r
    } ,
        "find" ,function(v,ctx){var fn=v,l=this;
        if(typeof(v)!="function"){fn=function(k){return k==v?v:null}}
        for(var i=0,l=this,ln=l.length,k;i<ln;i++){ k=l[i]
            if(fn.call(ctx,k,i,l)){return k}
        }
    },
        "findIndex",function(predicate,ths){
        if (this == null) {throw new TypeError('Array.prototype.find called on null or undefined');}
        if (typeof predicate !== 'function') {throw new TypeError('predicate must be a function');}
        for(var i=0,l=this,ln=l.length| 0;i<ln;i++){
            if(predicate.call(ths,l[i],i,l)){return i}
        }
        return -1
    },
        //if no init val then first item of arr the init val
        "reduce" ,function(f ){
        var fn=f,val=arguments[1],ctx=arguments[2],noval=(arguments.length==1||val==null);
        if (typeof f !== 'function') {throw new TypeError('predicate must be a function');}
        for(var i=0,l=this,ln=this.length,k;i<ln;i++){ var k=l[i]
            val=noval?k:fn.call(ctx,val,k,i,this);noval=false;
        }
        return val
    },"reduceRight" ,function(f ){
        var fn=f,val=arguments[1],ctx=arguments[2],noval=(arguments.length==1||val==null)?true:false;
        if(typeof(f)!="function"){throw "a callback function is required"}
        for(var l=this,ln=this.length,i=ln-1,k; i>=0;i--){  k=l[i]
            val=noval===true?k:fn.call(ctx,val,k,i,this);noval=false;
        }
        return val
    },"some" ,function(fn,ctx){
        if(typeof(fn)!="function"){throw "a callback function is required"}
        for(var i=0,l=this,ln=this.length,k;i<ln;i++){   k=l[i]
            if(fn.call(ctx,k,i,this)){return true}
        }
        return false
    },"every" ,function(fn,ctx){
        if(typeof(fn)!="function"){throw "a callback function is required"}
        for(var i=0,l=this,ln=this.length,k;i<ln;i++){   k=l[i]
            if(!fn.call(ctx,k,i,this)){return false}
        }
        return true
    },"contains" ,function(item){ return this.indexOf(item)>=0},
        //part of the Harmony (ECMAScript 6) proposal.
        "keys" ,function(){
        if (this == null) {  throw new TypeError("this is null or not defined");  }
        return Array.prototype.map.call(this,function(it,i){return  i } )

    },
        "entries",function(predicate,ths){   //part of the Harmony (ECMAScript 6) proposal.
        if (this == null) {throw new TypeError('Array.prototype.find called on null or undefined');}
        return Array.prototype.map.call(this,function(it,i){return [i,it]} )
    },
        "fill" ,function(value){
        if (this == null) {  throw new TypeError("this is null or not defined");  }
        var O=Object(this), ln=O.length|0,
            start=arguments.length>1?arguments[1]| 0:0,
            end=arguments.length>2?arguments[2]| 0:ln
        end= Math.max(end<0?ln+end:end,0)||this.length
        start= Math.max(start<0?ln+start:start,0) ;
        if(end<=start){return this}
        while (start < end) {
            O[start] = value;
            start++;
        }
        return O
    }
    ]  ,
    [Number,
        "toInteger", function toInteger (nVal,deflt) { return  Math.round(Number.toNumber(nVal,0)); }  ,
        "isInteger", function isInteger (nVal) { return Number.isNumber(nVal) && Math.floor(nVal) === nVal; }  ,
        "isNumber" , function isNumber (nVal)  {  return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 ; },
        "toNumber" , function toNumber (nVal,deflt)   {  return Number.isNumber(+nVal)?+nVal:deflt} ,
        "to" ,function( b,step,inc,precs){  var n=this,st=Object(n).valueOf(),
        end=Object(b).valueOf(),ret=[],abs=Math.abs,signum=b-n;
        if(typeof(inc)!="boolean" && typeof(inc)=="number"){precs=inc;inc=null}
        if(inc==null && typeof(step)=="boolean"){inc=step;step=1}       ;
        step=(Number(step)||1)*(Number(precs)?1.0:1)
        if(b<n){st=b ;end=n; } else {}
        step= abs(step)
        while(st<=end){ ret.push(st);st+=step  }
        if(ret.length){
            if(b<n){ret.reverse()}
            var lst=ret[ret.length-1]
            if(!inc && ((lst>0 && lst>=b)||(lst<0 && lst<=b))){ret.pop()}
        }
        if(precs){ret=ret.map(function(it){return Number(Number(it).toFixed(precs))})}
        return ret
    }
    ] ,
    [RegExp,
        "escape" ,function( value ) {
        return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }
    ],
    [ Function.prototype,
        "getName" ,function(){return this.__name__||(this.__name__=this.toString().replace(/function\s+([^\(]+)\(.*$/,"$1").trim())}
    ],

    [ Date,
        "now" ,function(){return new Date()},
        "parse" ,function(s){
        try{
            if(typeof(s)=="number" || (typeof(s)=="string" && !isNaN(s))){
                Date.__minlong||(Date.__minlong=(+new Date(1950,1,1)))
                if((+s) > (Date.__minlong||(Date.__minlong=(+new Date(1950,1,1))))){
                    return new Date(+s)
                }
            }
             if(String.isString(s)){ return new Date(s)  }
        } catch(e){
            if(typeof($)!="undefined"&&$.date ) {
                return $.date(s)
            }
        }
        return null
    }
    ]
);

Number.MAX_VALUE||(Number.MAX_VALUE=9007199254740991);
Number.MIN_VALUE||(Number.MIN_VALUE=0-Number.MAX_VALUE);


//setImmediate

//settimeout support for args
setTimeout(function(a){
    if(!(a===99.999)){
        var g=window||self;
        (function(old ){
            var __timeout=old,_throwError=function(e){throw e};
            g.setTimeout=function(f,delay){
                var a=[].slice.call(arguments,2);
                __timeout(function(){
                    try{
                        a.length?f.apply(null,a):f()
                    } catch(e){
                        _throwError(e,f)
                    }
                },delay)
            }
        })(g.constructor&&g.constructor.prototype&&g.constructor.prototype["setTimeout"]?g.constructor.prototype["setTimeout"].bind(g):g.setTimeout.bind(g) );
    }},0,99.999) ;


if(typeof(setImmediate)=="undefined"){
    self.setImmediate=function(fn){return setTimeout(fn,0)}
}

})();
//essential shims end



