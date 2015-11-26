/**
 * Created by Atul on 11/28/2014.
 */



function _require(){
    if(typeof(arguments[0])=="string" && self[arguments[0]]){
        return self[arguments[0]]
    }
    if(typeof($)!="undefined" && $.require){
        if(_require.__que){
            var l=_require.__que.slice();
            _require.__que=null;
            while(l.length){
                $.require.apply($, l.shift())
            }
        }
        if(arguments.length){
            return $.require.apply($,arguments)
        }

    }

    _require.__que||(_require.__que=[]);
    _require.__que.push([].slice.call(arguments))
};

var dollar=function(a) {
    var b = [].slice.call(arguments);
    if ("function" == typeof a) {
        self.domready && self.domready(a);
    }
    else {
        if ("string" == typeof a) {
            var c;
            if(("view" == a || "win" == a|| "window" == a)){return $d(window)}
            if(("doc" == a || "document" == a)){return $$(document)}
            if(( "body" == a)){return $$(document.body)}
            if(( "root" == a)){return $$(document.documentElement || document.body)}

            return $d.qq(a)
        }
        if (a && "object" == typeof a) {
            if(a.nodeType||a===window){return a==window?$d(a):$$(a)}
            return ZModule.get.apply(ZModule, a)
        }
    }
};
Object.defineProperty(dollar,"supports",{value:Object.create(null),enumerable:false,writable:false,configurable:false})
dollar.supports.Object_observe=!!Object.observe


    Object.defineProperty ? Object.defineProperty(window, "$", {
        value: dollar,
        writable: !1,
        enumerable: !0,
        configurable: !0
    }) :  window.$ = dollar;

$.getBootstrapTemplate = function(a) {
    var b = $.getBootstrapData(a, "templates");
    return b && (b = b.replace(/\[NL\]/g, "\n").replace(/`/g, '"')), b
}
$.getBootstrapData= function(key,type){
    var data= $.__bootstrapdata;
    if(!data){
        data=$.__bootstrapdata=self.__bootstrap__;
    }
    if(data){
        if(typeof(key)=="string" ){
            if(!data[key] &&  key.indexOf("data/")==0){
                key="app/"+key
            }
            var data1=data
            if(!type && key.indexOf("app/data")==0){
                type="templates"
            }
            if(type && data[type]){
                data1=  data[type];
            }
            if(data1[key]){
                return data1[key];
            } else {
                if(type=="templates" ){
                    if(data1[key+".html"]){
                        return data1[key+".html"]
                    }
                }
                if(type=="modules" ){
                    if(data1[key+".js"]){
                        return data1[key+".js"]
                    }
                }
                if(key.indexOf(".")>0){
                    return key.split(".").reduce(function(m,k){
                        return m&&m[k]
                    },data1)
                }
            }
        }

    }

};
$.createClass= function createClass() {//ctor, proto, superClass, staticObject
    function classconstructor(){
        if(null === arguments[0] && arguments.length==1){return}
        if(!(this instanceof classconstructor)){
            return classconstructor.newInstance(arguments)
        }
        var init=this.init||this.initialize
        if(typeof(init)=="function"){
            init.apply(this,arguments);
        } else if(typeof(this.initModelInstance)=="function"){
            this.initModelInstance.call(this );
        }
    }
    var args=[].slice.call(arguments),proto, superClass, staticObject,ctor,needsinitclass
    if(!args[0] || typeof(args[0])=="function"||typeof(args[0])=="string"){
        ctor=args.shift()
    }
    proto=args.shift();

    superClass=args.shift();
    staticObject=args.shift();

    if(typeof(ctor)!=="function"){
        needsinitclass=true
        var ctorname=typeof(ctor)=="string"?ctor:("ctor_" + Math.random().toString(36).substr(2, 5))
        var defname=$.createClass.defaultClassconstructor.name||"classconstructor"
        ctor =  (1,eval).call(null,"("+ $.createClass.defaultClassconstructor.toString().replace(new RegExp("\\b"+defname+"\\b","g"),ctorname) +")")
    }
    if(!proto){proto={}}
    if(proto.statics){
        staticObject=proto.statics;
        delete proto.statics
    }
     var descriptors = {},superClassproto=null
    if (arguments.length >= 3 && typeof superClass === 'function') {
        ctor.__proto__ = superClass;
        var b = superClass.prototype;
        if (Object(b) === b || null === b) {superClassproto= b}

        for (var propnames = Object.keys(proto), i = 0; i < propnames.length; i++) {
            var name = propnames[i];if(name=="constructor"||name=="__proto__"){continue}
            descriptors[name] = Object.getOwnPropertyDescriptor(proto, name)
            descriptors[name].enumerable=true;
        }
        ctor.prototype = Object.create(superClassproto, descriptors);
    } else {
        ctor.prototype = proto;
    }
    ctor.prototype||(ctor.prototype={});
    ctor.prototype.statics||(ctor.prototype.statics={});
    if(staticObject){
        var staticdescript={}
        for (var propnames = (Object.getOwnPropertyNames||Object.keys)(staticObject), i = 0; i < propnames.length; i++) {
            var name = propnames[i];
            staticdescript[name] = Object.getOwnPropertyDescriptor(staticObject, name)
        }
        Object.defineProperties(ctor, staticdescript)
        Object.defineProperties(ctor.prototype.statics, staticdescript)
    } else {
        ctor.prototype.statics = {}
    }
     ctor.newInstance=function( ){
        var  nu, c =  this, args = []
        if (arguments.length == 1 && arguments[0] && ({}).toString.call(arguments[0]).indexOf("Arguments") > 0) {
            args = [].slice.call(arguments[0])
            if (args.length && args[0] && ({}).toString.call(args[0]).indexOf("Arguments") > 0) {
                args=[].slice.call(args[0])
            }
        }
        else {
            args = [].slice.call(arguments)
        }
        var ln = args.length;
             try {
                 if(!ln){nu=new c()}
                 else if(ln===1) {
                     nu=new c(args[0])
                 }
                 else {
                     nu=new (Function.prototype.bind.apply(c, [null].concat(args)))
                 }
            } catch (e) {console.error(e,"while new Instance")
            }
          return nu
    } ;
    ctor.extend=function(nuctor, proto, staticObject){
        var ctor=nuctor
        if(nuctor && !(typeof(nuctor)==="function"||typeof(nuctor)==="string")){
            ctor=null;staticObject=proto
            proto=typeof(nuctor)==="object"?nuctor:null;
        }
        return  createClass(ctor, proto, this,staticObject)
    }
    if(needsinitclass){
        ctor.prototype.__initClass=function __initClass(){
            //if(null === arguments[0] && arguments.length==1){return}
            var init=this.init||this.initialize
            if(typeof(init)=="function"){
                init.apply(this,arguments);
            } else if(typeof(this.initModelInstance)=="function"){
                this.initModelInstance.call(this );
            }
        }
    }

    ctor.prototype.constructor=ctor;
    return ctor;
}
$.createClass.defaultClassconstructor=function classconstructor(){
    if(null === arguments[0] && arguments.length==1){return}
    if(!(this instanceof classconstructor)){
        return classconstructor.newInstance(arguments)
    }
    var init=this.init||this.initialize
    if(typeof(init)=="function"){
        init.apply(this,arguments);
    } else if(typeof(this.initModelInstance)=="function"){
        this.initModelInstance.call(this );
    }
};

 $.handleEx= (function(){
    var checkloop,_alias={
        lineNumber:"line",linenumber:"line",column:"line","fn":"functionName","detail":"description"
    };
    var mouse_ellog=[],mousepos=[],lastel=null;

    function captureUser(ev){
        try {
            var t = ev.target, bdy = document.body, docEl = document.documentElement
            if (!t || lastel === t || t === bdy || t === docEl) {
                return
            }
            lastel = t;
            var hier = [ev.type, ev.ts || Date.now(), [ev.x || mousepos[0], " ", ev.y || mousepos[1]].join("")], zscope, title = document.querySelector('.page-title')
            if (title) {
                hier.push("Page:" + title.textContent)
            }
            hier.push(t.className)
            while (t && t.parentNode && t !== bdy) {
                if (t.getAttribute) {
                    zscope = t.getAttribute("zscope") || t.getAttribute("z-scope") || ""
                    zscope && hier.push(zscope)
                }
                t=t.parentNode;
            }
            mouse_ellog.push(hier.join(" | "))
        } catch (e){}
    }
    Date.now||(Date.now=function(){return (new Date()).getTime()});
   /*window.addEventListener("mousemove",function(ev){
        mousepos[0]=ev.x||ev.clientX + (ev.scrollLeft || 0 );
       mousepos[1]=ev.y||ev.clientY + (ev.scrollTop || 0)
       mousepos[2]=ev.target.id
    });
    window.addEventListener("focus",captureUser)
    window.addEventListener("mousedown",captureUser)
    window.addEventListener("keyup",captureUser)
    */

    var getPrototypeOf = Object.getPrototypeOf || function (a) {
            return a ? (a.constructor || {}).prototype : null
        }, objproto = Object.prototype
    var stackproperty="",stackParser=null;
    function StackFrame() {
         Object.defineProperty(this,"_",{value:{},enumerable:false,writable:false,configurable:false})

            var functionName, args, fileName, lineNumber, columnNumber
        if(arguments.length==1 && arguments[0] && typeof(arguments[0])=="object"){
            functionName=arguments[0].functionName;args=arguments[0].args;fileName=arguments[0].fileName; lineNumber=arguments[0].lineNumber;
            columnNumber=arguments[0].columnNumber
        } else{
            functionName=arguments[0];args=arguments[1];fileName=arguments[2]; lineNumber=arguments[3];columnNumber=arguments[4]
        }
        this.setFunctionName(functionName);
        this.setArgs(args);
        this.setFileName(fileName);
        this.setLineNumber(lineNumber);
        this.setColumnNumber(columnNumber);
    };
    var proto={}
    "functionName args fileName lineNumber columnNumber".split(/\s+/).forEach(
        function(k){
            var cap= k.charAt(0).toUpperCase()+ k.substr(1);
            proto["get"+cap]=Function("return this._."+k)
            proto["set"+cap]=Function("v","this._."+k+"=v");
            Object.defineProperty(proto,k,{get:Function("return this._ && this._."+k+";"),set:Function("v","return this._ && typeof(v)!='undefined' && (this._."+k+"=v);"),
                enumerable:true,configurable:true})
        }
    );
    proto.toString= function() {
        if(!this._){return ""}
        var functionName = this.getFunctionName() || '';
        var args = '(' + (this.getArgs() || []).join(',') + ')';
        var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
        var lineNumber = (this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
        var columnNumber = (this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
        return "Error"+functionName + args + fileName + lineNumber + columnNumber;
    }
    proto.toMap=function(){
        return Object.assign({},this._||{})
    }
    StackFrame.prototype=proto;

    function ErrorStackParser( ) {

        var FIREFOX_SAFARI_STACK_REGEXP = /\S+\:\d+/;
        var CHROME_IE_STACK_REGEXP = /\s+at /;
        return {
            /**
             * Given an Error object, extract the most information from it.
             * @param error {Error}
             * @return Array[StackFrame]
             */
            parse: function  (error) {
                try {
                    if(error.stack && Array.isArray(error.stack)){return error.stack}
                    if (typeof(error.stacktrace)=="string" && (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined')) {
                        return this.parseOpera(error);
                    } else if (error.stack && typeof(error.stack)=="string" && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                        return this.parseV8OrIE(error);
                    } else if (error.stack && typeof(error.stack)=="string" && error.stack.match(FIREFOX_SAFARI_STACK_REGEXP)) {
                        return this.parseFFOrSafari(error);
                    } else {
                        throw new Error('Cannot parse given Error object');
                    }
                } catch(e){
                    console.error("error while parsing error stack",e)
                }
            },

            /**
             * Separate line and column numbers from a URL-like string.
             * @param urlLike String
             * @return Array[String]
             */
            extractLocation: function (urlLike) {
                var locationParts = urlLike.split(':');
                var lastNumber = locationParts.pop();
                var possibleNumber = locationParts[locationParts.length - 1];
                if (!isNaN(parseFloat(possibleNumber)) && isFinite(possibleNumber)) {
                    var lineNumber = locationParts.pop();
                    return [locationParts.join(':'), lineNumber, lastNumber];
                } else {
                    return [locationParts.join(':'), lastNumber, undefined];
                }
            },

            parseV8OrIE: function  (error) {
                return error.stack.split('\n').slice(1).map(function (line) {
                    var tokens = line.replace(/^\s+/, '').split(/\s+/).slice(1);
                    var locationParts = this.extractLocation(tokens.pop().replace(/[\(\)\s]/g, ''));
                    var functionName = (!tokens[0] || tokens[0] === 'Anonymous') ? undefined : tokens[0];
                    return new StackFrame(functionName, undefined, locationParts[0], locationParts[1], locationParts[2]);
                }, this);
            },

            parseFFOrSafari: function (error) {
                return error.stack.split('\n').filter(function (line) {
                    return !!line.match(FIREFOX_SAFARI_STACK_REGEXP);
                }, this).map(function (line) {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.shift() || undefined;
                    return new StackFrame(functionName, undefined, locationParts[0], locationParts[1], locationParts[2]);
                }, this);
            },

            parseOpera: function  (e) {
                return this.parseOpera11(e);

            },
            // Opera 10.65+ Error.stack very similar to FF/Safari
            parseOpera11: function (error) {
                if(!error.stack){return []}
                return error.stack.split('\n').filter(function (line) {
                    return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) &&
                        !line.match(/^Error created at/);
                }, this).map(function (line) {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionCall = (tokens.shift() || '');
                    var functionName = functionCall
                            .replace(/<anonymous function(: (\w+))?>/, '$2')
                            .replace(/\([^\)]*\)/g, '') || undefined;
                    var argsRaw;
                    if (functionCall.match(/\(([^\)]*)\)/)) {
                        argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                    }
                    var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ? undefined : argsRaw.split(',');
                    return new StackFrame(functionName, args, locationParts[0], locationParts[1], locationParts[2]);
                }, this);
            }
        };
    };
    function appException() {
        if (!(this instanceof appException)) {
            return new appException(arguments)
        }
        try {
            var args = []
            if (arguments.length == 1 && ({}).toString.call(arguments[0]).indexOf("Arguments") >= 0) {
                args = [].slice.call(arguments[0])
            } else {
                args = [].slice.call(arguments);
            }
            Object.defineProperty(this, "ts", {value:Date.now(),writable: false, enumerable: true})
            Object.defineProperty(this, "_", {
                value: {
                    message: "", description: "",  url: "", line: "",  col: "", stack: [],source:"",userlog:[],
                }, writable: false, configurable: true, enumerable: false
            })
            var sourceException = null;
            if (args[args.length - 1] === true) {
                args.pop();
            }
            if (args[args.length - 1] instanceof Error) {
                sourceException = args.pop();
            }
            this._.userlog=[].slice.call(document.querySelectorAll(":hover"),2).reverse().slice(0,3).map(function(a){
                return {id: a.id,name: a.name,zscope: a.getAttribute?(a.getAttribute("z-scope")||a.getAttribute("zscope")):null,klass: a.className,val: a.value}
            });
            if (args.length   && args.slice(0, args.length - 1).every(function (a) {
                    return typeof(a) !== "object"
                })) {
                this._.message = args.shift();
                this._.url = args.shift();
                this._.line = args.shift();
                this._.col = args.shift();
                if(this.line && !isNaN(this.line) && Number(this.line)>=0){
                    this.isglobal=true
                }
            }

            for (var i = 0, ln = args.length; i < ln; i++) {
                var val = args[i]
                if (val instanceof Error) {
                    sourceException = val;
                } else if (typeof(val) == "string") {
                    if (this._.message) {
                        this._.description = val
                    } else {
                        this._.message = val
                    }
                }
            }
            if (sourceException) {
                if(!this._.message){this._.message=sourceException.message}
                if(!this._.name){this._.name=sourceException.name}
                if(!this._.description && (sourceException.details||sourceException.description)){this._.description=sourceException.details||sourceException.description}
                this._.source=sourceException.toString()
                this.parseStack(sourceException);
            }
            this._.uuid=[this._.message, this._.url, this._.line].filter(function(a){return a}).join(",")
            this._.counter=1;
            this._.ts=Date.now();
            if (this._.url && this._.line) {
                this.parseStack({
                    fileName: this._.url||"",
                    lineNumber: this._.line||0,
                    columnNumber: this._.col||""
                })
            }
        } catch(e){
            console.log("Exception while appexception",e);
        }
    }
    appException.prototype=Object.create(Error.prototype);
    appException.prototype.parseStack=function(stack){
        if(!stackParser){
            stackParser=ErrorStackParser();
        }
        if(stack instanceof Error){
            this.stack=stackParser.parse(stack);
        } else if(stack){
            if(typeof(stack)=="object"){
                this.stack=new StackFrame(stack);
            }
        }



    }
    Object.defineProperties(
        appException.prototype,{
            type:{get:function(){return this._ && this._.name},set:function(v){this._ && (this._.name=v);}},
            name:{get:function(){return this._ && this._.name},set:function(v){this._ && (this._.name=v);}},
            message:{get:function(){return this._ && this._.message||""},set:function(v){this._ && (this._.message=v);}},
            description:{get:function(){return this._ && this._.description},set:function(v){
                if(!this._){return}
                if(this._.description){this._ && (this._.description=this._.description+"\n"+v)}
                else{this._.description=v;}
            }},

            url:{get:function(){return this._ && this._.url},set:function(v){this._ && (this._.url=v)}},
            line:{get:function(){return this._ && this._.line},set:function(v){this._ && (this._.line=v)}},
            col:{get:function(){return this._ && this._.col},set:function(v){this._ && (this._.col=v)}},
            functionName:{get:function(){return this._ && this._.functionName},set:function(v){this._ && (this._.functionName=v)}},
            userlog:{get:function(){return this._ && this._.userlog},set:function(v){this._ && Array.isArray(v) && (this._.userlog=v)}},

            stack:{get:function(){
                if(!this._){return []}
                return this._.stack||(this._.stack=[]);
            },set:function(v){if(!this._){return}
                this._.stack||(this._.stack=[]);
                if(Array.isArray(v)){
                    [].push.apply(this._.stack,v)
                } else{

                    this._.stack.push(v)
                }
            }}
        }
    );
    appException.prototype.toString=function(){
        var errorMessage =(this.name||"")

        if (this.message) errorMessage += ': ' + (this.message||"")
        if(this.isglobal){errorMessage += ': global handler' }
        if (this.description) errorMessage += ': ' + (this.description||"")
        errorMessage = errorMessage + this.stack.map(function(a){return a.toString()}).join("\n");
        return errorMessage
    }
    appException.prototype.toMap = function () {
        var map = Object.assign({},this._||{})
        map.stack=this.stack.map(function(a){return a.toMap()})
        return map
    }
    appException.prototype.toJSON = function () {
        return JSON.stringify(this.toMap())
    }
    //msg, url, line, col, error
    return function (a) {
        if(checkloop || (a && (a.rethrown||a.__processed))){return}
        var tothrow=null,rethrow
        checkloop=1
        try{
            if(!stackproperty){
                var err = new Error()
                stackproperty=err["stacktrace"]?"stacktrace":"stack"
                err=null
            }
            if (arguments[arguments.length - 1] === true) {
                rethrow = true;
            }
            tothrow = new appException(arguments);
            if(!tothrow.stack.length ){
                var err = new Error();
                tothrow.parseStack(err)
                if(tothrow.stack.length){
                    tothrow.stack.shift()
                    if(tothrow.isglobal ){
                        tothrow.stack.shift();
                    }
                }
            }
            tothrow.__processed=true;
            if (rethrow) {  tothrow.rethrown=true;
            } else {
                if (self.app && app.debug) {
                    app.notify && app.notify(tothrow.message )
                }
                if (typeof(console) == "undefined") {

                }
                else {
                    console.log("Error",  tothrow.toString())
                }
                if(typeof($bugzy)!="undefined"){
                    $bugzy.handleException(tothrow)
                } else {var storage=self.sessionStorage||self.localStorage
                    if(storage){
                        $.handleEx._cache.push(tothrow.toMap())
                        storage.setItem("appexceptions",JSON.stringify($.handleEx._cache))
                    }
                }
            }

        } catch(e) {
            console.log(">>>>>>> Error  while handling",e);
        } finally{
            checkloop=0
        }
        if(rethrow){
            //throw tothrow;
        }
        return tothrow;
    }
})();
$.handleEx._cache=[];
(function(){
    var storage=self.sessionStorage||self.localStorage
    if(storage){
        var lst=storage.getItem("appException")
        if(lst){
            try{
                lst=JSON.parse(lst)
                lst && lst.length && ($.handleEx._cache=lst);
            } catch(e){}
        }
    }
})();
window.onerror=function(errorMsg, url, lineNumber,col){
    var key=[errorMsg, url, lineNumber].filter(function(a){return a}).join(",")
    var curr=$.handleEx._cache.filter(function(a){return a.uuid==key})[0]
    if(curr){
        curr.lastts=Date.now();
        curr.count||(curr.count=1);
        curr.count++
        return;
    }

    try{
        $.handleEx(errorMsg, url, lineNumber,col)

    } catch(e){  }
}

$.notify = function(a) {
    var b, c = String(a);
    "Notification" in window && ("granted" === Notification.permission ? b = new Notification(c) : "denied" !== Notification.permission && Notification.requestPermission(function(a) {
        "granted" === a && (b = new Notification(c))
    }))
};


!function(nm, factory) {
    self[nm] = factory()
}("domready", function() {
    var LOADED=false,TIMER= 0,__readyhold=false;
    function _dispatch() {
        var fn;
             for (; fn = callbacks.shift();) {
                try {
                    fn()
                } catch (e) {}
            }

    }

    function _nowready() {
        _doc[removeEvent](onreadystatechange, _checkready)
         _dispatch()
    }

    function _checkready() {

        if (!LOADED) {
            if ("undefined" == typeof $d || __readyhold) {
                if(!TIMER){
                    TIMER=setInterval(_checkready, 50);
                }
                 return
            }
            LOADED = true
            if(TIMER){
                clearInterval(TIMER);TIMER=0;
            }
            setTimeout(_nowready, 20)
        }
    }
    var  callbacks = [],
        _doc=document,
         addEvent = _doc.addEventListener ? "addEventListener" : _doc.attachEvent ? "attachEvent" : null,
        removeEvent = _doc.removeEventListener ? "removeEventListener" : _doc.detachEvent ? "detachEvent" : null,
        onreadystatechange = "detachEvent" == removeEvent ? "onreadystatechange" : "DOMContentLoaded",
        onload = "detachEvent" == removeEvent ? "onload" : "load",
        doScroll = (_doc.documentElement || {}).doScroll;

        LOADED = (doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(_doc.readyState || "XX");
    if(!LOADED){
        _doc[addEvent](onreadystatechange, _checkready);
        window[addEvent](onload, function loadfn() {
            window[removeEvent](onload, loadfn)
            LOADED || _checkready()
        }, !1)
    }
    $.holdReady=function(flag){
         __readyhold=!!flag
        if(!__readyhold){
            _dispatch();
        }
    }
    return function(b) {
            if("function" == typeof b){
                callbacks.push(b)
            }
        LOADED && _dispatch()
     }
});