$.xhr = function() {
    var transport=null,__jsonpcallbackcache=0
    function createCORSRequest(method, url) {
        var xhr = _transport();
        if ("withCredentials" in xhr) {
            xhr.open(method, url, true);
            xhr.withCredentials = true;
        } else if (typeof XDomainRequest != "undefined") {
            // Otherwise, check if XDomainRequest.
            // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
            xhr = new XDomainRequest();
            xhr.open(method, url);

        } else {
            // Otherwise, CORS is not supported by the browser.
            xhr = null;

        }
        return xhr;
    }

    function _transport(){
        if(!transport){
            var lst=[
                function(){return typeof(XMLHttpRequest2)!="undefined"?new XMLHttpRequest2():null;},
                function(){return new XMLHttpRequest();},
                function(){return  new ActiveXObject('Msxml2.XMLHTTP');},
                function(){return new ActiveXObject('Microsoft.XMLHTTP');}
            ]
            for (var i=0;i<3;i++){var it=lst[i]
                try{
                    if(lst[i]()){transport=lst[i];break;};
                } catch(e){}
            }
        }
        return   transport();
    }
    function toMap(args){
        if(!(args && typeof(args)=="object")){return args}
        var data={};
        Object.keys(args).forEach(function(k){
            if(args[k]!=null){  data[k]=_ser(args[k])}
        }) ;

        return data;
    }
    function _ser(o){var d=(o&&o.valueOf)? o.valueOf():o;
        if(d!=null&&!isNaN(+d)){d=  +d }
        if(!d||typeof(d)!="object"){return String(d)}
        if(d.toJson||d.toJSON){return (d.toJson||d.toJSON)()}
        else{
            if($.isArray(d)){d=JSON.stringify(d)}
            else{ d= d.toMap?d.toMap(true):toMap(d)}
        }
        return JSON.stringify(d).replace(/^"+|"+$/g,"");
    }
    function toQStr(o,deep){
        if(!o){return ""}
        var dat=(o)  ,data=[];
        if(dat&&typeof(dat)=="object"){

            Object.keys(dat).forEach(function(k){
                if(String(k).indexOf("promise")>=0){return}
                var d=dat[k]
                if(d!=null&&!isNaN(+d)){d=  +d }
                if(!d||typeof(d)!="object"){d= String(d)}
                if(d.toJson||d.toJSON){d= (d.toJson||d.toJSON)()}
                else{var mp=d.toMap?d.toMap(true):d
                    d= deep?_ser(mp):JSON.stringify(mp)
                }
                data.push(k+"="+encodeURIComponent(d.trim()));
            })
        }  else{data.push(dat)}
        return  data.join("&");
    }




    function _resolveArgs() {
        var mthd, callback, optns = {}, url,
            a = /arguments/i.test(({}).toString.call(arguments[0])) ?
                [].concat.apply($.makeArray(arguments[0]), $.makeArray(arguments, 1)) :
                $.makeArray(arguments);
        var argmap = $.inspectArgs(arguments), data = {}
        while ((argmap.obj || []).length) {
            var f = argmap.obj.shift() || {};
            if ($.isPlain(f.val)) {
                $.extend(optns, f.val);
            }
            else if (self.ResURL && ResURL.isURI(f.val)) {
                optns.URI = f.val
            } else {
            }
        }
        while ((argmap.str || []).length) {
            var f = argmap.str.shift() || "";
            if (/^(get|post|put|delete)$/i.test(f.val)) {
                optns.method = b
            }
            else if (!optns.url) {
                optns.url = f.val
            }
        }
        while ((argmap.fun || []).length) {
            if (!optns.callback) {
                optns.callback = argmap.fun.shift().val
            }
            else {
                optns.error = argmap.fun.shift().val
            }
        }
        if (argmap.boo) {
            optns.sync = argmap.boo.shift().val
        }
        if (optns.async != null && optns.sync == null) {
            optns.sync = !optns.async
        }
        if ((optns.args && optns.args.params) || (optns.params)) {
            optns.args = optns.params || optns.args.params
        }
        optns.args = optns.args || optns.params || optns.pars || optns.parameters
        if (optns.args && optns.args.data) {
            optns.data = $.extend(optns.data || {}, optns.args.data);
            delete optns.args.data;
        }
        return optns
    }
    function _inst(){
        var config=_resolveArgs(arguments)
        if( config.debug||(arguments[1]&&arguments[1].debug)){
            this._debug=true;delete  config.debug
        }
        if(!config.uri&&config.URI){
            config.uri=config.URI.build()
        }
        this.init(config.url,config)
    }
    //three main fns - prepareParms, prepcessResponse, send

    var  resolvedurlsCache = {}, xhrWorker = null,
        validResponsetypes = "document json blob arraybuffer text json".split(/\s+/),
        noSocket = !1;
    _inst.prototype={
        config:null,url:null,  transport:null,responseHeaders:null,
        _processSocket:function _process(url,optns) {
            var optns = this.config || {}
        },
        _process:function _process(url,optns) {
            var optns = this.config || {}
        },
        prepareParams:function(){
            var data,args={};

            for(var i= 0,l=["params","args","pars"];i<3;i++){
                var p=this.config[l[i]]
                if(p){
                    if(!$.isPlain(p)){
                        if(typeof p !="object" || Array.isArray(p)){
                            args[l[i]]=p
                        }

                    }
                    else{$.extend(args,p)}
                }
            }

            var res= $.omit(this.config,["url","uri","params","args","pars","data","method","type","cmd","target","token","sync","responseType","headers"])
            var info=$.pluck(this.config,["type","cmd","target","token"])
            $.each(res,function(v,k){
                if(v){
                    if(v && ((typeof(v)=="object" && !($.isPlain(v)||$.isArray(v)))||(typeof(v)=="function")) ){
                        //delete res[k]
                    } else if(v!=null){
                        args[k]=v;
                    }
                }
            });
            if(this.config.data){
                data= this.config.data;
            }
            return {
                args:args,data:data,info:info||{}
            }
        },
        process:function _process() {
            var params = this.prepareParams()
            var optns = this.config || {}, ths = this
            if(this.URI && self.cachedHTMLTemplates){
                if(self.cachedHTMLTemplates[this.URI.path+"/"+this.URI.file] ){
                    var data=self.cachedHTMLTemplates[this.URI.path+"/"+this.URI.file].replace(/\[NL\]/g,"\n").replace(/`/g,'"');
                    this.onComplete({result: data,status:"ok"})
                    return this._promise
                }
            }

            var sync = optns.async === false || optns.sync === true,
                doSocks = $.webSocket && $.webSocket.isAvailable() && !sync && optns.method != "POST"

            //doSocks = false
            if (doSocks && this.URI && (String(this.URI.build()).indexOf(String(app.servicePath)) != 0 || /\.(htm|html|js|json|css)$/i.test(this.URI.file))) {
                doSocks = false
            }
            if (doSocks) {
                var type = params.info.type || params.info.cmd
                if (params.info.cmd) {

                } else {
                    type = "route"
                }
                $.webSocket.dispatch(type, $.extend({}, params.info, (this.URI || {}).args, params.args, {data: params.data}), function (data,errmsg) {
                    if(data===false){
                        if(!$.webSocket.isAvailable()){
                            debugger;
                            this.process()
                        }
                        else{
                            this._promise.reject(errmsg)
                        }
                    }
                    else{
                        this.onComplete(data)
                    }
                }.bind(this));
                /*$.webSocket.onError(function (q) {
                    if(!$.webSocket.isAvailable()){
                        debugger;
                        ths.process()
                    }
                    else{
                        ths.onerror(q)
                    }
                    //socket error

                })*/
                return this._promise;
            }
            var method = optns.method ? optns.method.toUpperCase() : "GET"
            if (method == "POST" && optns.form) {
                params.data = new FormData(optns.form);
            }

            var a;
            if (method != "POST") {

                a = $.extend({}, params.info, params.args, {data: params.data})
                if (a.data == null || !$.keys(a.data).length) {
                    delete a.data
                }

                delete params.data;
            } else {
                a = $.extend({}, params.args)
                if (this.URI && this.URI.args && this.URI.args.data) {
                    params.data = params.data || {}
                    $.extend(params.data, this.URI.args.data)
                    delete this.URI.args.data;
                }
            }



            if (!this.URI) {
                this.URI = ResURL.from(app.servicePath)
            }
            this.URI.updateArgs(a, true)
            if (this.URI && this.URI.isCrossSite && ResURL.getRoot() && ResURL.getRoot().host == this.URI.host) {
                this.URI.isCrossSite = false
            }


            // Read in the image file as a data URL.
            var url = this.URI.fixUrl(),ISFILESYS

            if (/file:/i.test(url)) {ISFILESYS=true
                var   errorHandler = function (e) {

                    this._promise && this._promise.reject(e)
                }.bind(this)

                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                if (!window.filebase && location.href.indexOf("index.html") > 0) {
                    window.filebase = location.href.substr(0, location.href.indexOf("index.html"))
                }
                if (window.filebase && url.indexOf(window.filebase) >= 0) {
                    //url = url.substr(window.filebase.length)
                }

            }

            else {
                if (method == "GET" && this.URI && this.URI.isCrossSite) {
                    var orig = this.url;
                    this.url = url;
                    var res = _inst.jsonp(this)
                    this.url = orig;
                    return res;
                }

                if (method == "GET" && !sync) {
                    if (!xhrWorker && $.worker ) {
                        xhrWorker = $.worker.setup(null,true);
                    }

                    if (xhrWorker) {
                         xhrWorker.load(url).then(function (data) {
                            ths.onComplete(data)
                        }, function (data) {
                            ths.onComplete(data)
                        })
                        return this._promise
                    }

                }
            }

            var xhr=_transport();
            xhr.open( method,url,!sync)
            if(optns.responseType&&validResponsetypes.indexOf(optns.responseType)>=0){
                try{
                    xhr.responseType=optns.responseType
                } catch(e){}
            }
            if(!optns.headers){ optns.headers={} }
            if($.browser){  optns.headers["x-ua"]=$.browser.prefix+"/"+$.browser.version  }
            optns.headers["x-requested-with"]="xmlhttprequest"
            $.each(optns.headers,
                function(v,k){  xhr.setRequestHeader(k,v); }
            )
            //withCredentials

            ths.transport=xhr
            xhr.onload=function(){
                 this.onComplete()}.bind(this)
            xhr.onerror=function(e){
                console.log(e,this)
                this._promise.reject({type: e.type,message: e.message,data: e.data})}.bind(this)
            var d=params.data;
            if(method == "POST" && d) {
                if (typeof(d) == "string") {
                    d = decodeURIComponent(decodeURI(d))
                }
                if (typeof(d) != "string") {
                    d = JSON.stringify(d);
                }
            }
            xhr.send(d||null );
            if(sync){
                if(xhr.responseText){this.onComplete()}
            }
            return  ths._promise


        },

        onComplete:function(req0,issocketorjsonp){if(this._done){return}
            this._done=true
            var result,ths=this,req=req0||this.transport
            if(!req){return {}}
            ths.responseHeaders=req.headers||(req.getAllResponseHeaders?req.getAllResponseHeaders().split(/[\n\r]/).reduce(function(m,k){
                    var ar=k.split(":");if(!ar[0].trim()){return m}
                    return m[ar.shift().trim()]=ar.join(":").trim(),m},{}):{})||{};
            var success
            if(issocketorjsonp ){
                success=!req.error;
            }
            else {
                success = (!req.status && location.protocol == "file:") || (String(req.status).toUpperCase() == "OK") ||
                    (req.status >= 200 && req.status < 300) || req.status == 304 || req.status == 1223 || ($.browser.safari && req.status === undefined);
            }
            if( success){
                result=ths.prepareResult(req,issocketorjsonp)
                if(ths.config.sync){
                    ths.fire("load",result);
                }
                ths._promise.resolve(result)
            } else {
                result={error:""}
                var err=req.error
                if(!err && req.data){
                    err=req.data.error||req.data
                }
                if(err&&typeof(err)=="object"){
                    if(err instanceof Error){
                        result.error=req.error.message||req.error.toString()
                    } else{
                        result.error=err.message||JSON.stringify(err)
                     }
                } else{
                    result.error=err
                }
                ths._promise.reject(result.error)
            }
            return result;
        },

        init:function(url,config){
            this.config=config||{}

            var uri=config.URI||ResURL.make(url)
            if(config.args){
                uri.updateArgs(config.args,true)
            }
            if(this.config.cmd) {
                uri.updateArgs({cmd:this.config.cmd},true)

            }
            this.URI=uri
            this.url=uri.build();
            if(this.config.cmd && this.url.indexOf("?")==-1){
                var cmd=this.config.cmd
                //if(this.url.split(/[#\?]/).shift().split("/").pop()!="router"){this.url=this.url+"/router"}
                this.url=this.url+(this.url.indexOf("?")>0?"&":"?")+ cmd
            }
            this.callbacks={progress:[],load:[],error:[],loadstart:[],abort:[],timeout:[],loadend:[]}
            if(this.config.callback){
                this.callbacks.load.push(this.config.callback);
                delete this.config.callback
            }
            this._promise  =Promise.deferred();
            this._promise.then(
                this.fire.bind(this,"load"),
                this.fire.bind(this,"error")
            )
            //this.then=this._promise.then.bind(this._promise)
        },
        prepareResult:function(xhr,issocketorjsonp){xhr=xhr||{}
            var txt= issocketorjsonp===true?(xhr.response||xhr.data):(xhr.response||xhr.responseText||xhr.result||xhr.results||xhr.data)
            var responseType=xhr.responseType||this.config.responseType
            var r0=( responseType=="document"&&xhr.responseXML)?xhr.responseXML:txt,r
            //document  jso   arraybuffer text json
            var r=r0;
            if( responseType=="blob"){
                r = new Blob([this.response], {type: this.config.type});
            }else if( responseType=="document"||xhr.responseXML  ){
                var doc=null
                if(!xhr.responseXML&&typeof(txt)=="string"&&typeof(DOMParser)!="undefined") {
                    var oParser=new DOMParser ();
                    var oDom=oParser.parseFromString (txt, "text/html");
                    doc=oDom.documentElement
                } else if(xhr.responseXML&&xhr.responseXML.documentElement&&xhr.responseXML.documentElement.querySelector){
                    doc=xhr.responseXML.documentElement
                }
                // print the name of the root element or error message
                //dump(oDOM.documentElement.nodeName == "parsererror" ? "error while parsing" : oDOM.documentElement.nodeName);
                var div=document.createElement("div")
                if(doc){
                    var h=doc.querySelector("head")
                    if(h){
                        while(h.firstChild){
                            var c=h.removeChild(h.firstChild);
                            if(c&&(String(c.tagName)=="SCRIPT"||String(c.tagName)=="LINK")) {
                                div.appendChild (c)
                            } else {
                                if(c&&String(c.tagName)=="TITLE"&&c.textContent) {
                                    var h1=document.createElement("H1")
                                    h1.className="doc-title"
                                    h1.textContent=c.textContent
                                    div.insertBefore(h1,div.firstChild)
                                }
                            }
                        }
                    }
                    var b=doc.querySelector("body")
                    if(b){
                        while(b.firstChild){
                            div.appendChild(b.removeChild(b.firstChild))
                        }
                    }
                } else {
                    //  var doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
                    //  var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');

                    try{
                        if(typeof(txt)=="string"){
                            div.innerHTML=txt.replace("<!DOCTYPE html>","").trim().replace(/<[\/]?html>/g,"").trim()

                        }
                    } catch(e){}
                }
                if(div && div.firstChild){
                    var d=document.createDocumentFragment()
                    while(div.firstChild){
                        d.appendChild(div.removeChild(div.firstChild))
                    }
                    r=d;
                }
                div=null;

            } else {
                if(typeof(txt)=="string"){
                    r=txt
                    if(/^<!\w/.test(r)){
                        //html
                    } else if(this.config.Eval){var r1
                        try{r1=(1,eval)(r);r=r1} catch(e){}
                    }else if( responseType=="json"||(
                            r.indexOf("function")==-1 && (
                                (r.indexOf("{")==0&&r.lastIndexOf("}")== r.length-1)||
                                (r.indexOf("[")==0&&r.lastIndexOf("]")== r.length-1)
                            ))){
                        try{
                            r=JSON.parse(r)
                        } catch(e){
                            var __;
                            try{eval("__="+r);r=__} catch(e){}
                        }
                    } else{

                    }
                }
                var data=(r||{}).data
                if(data&&typeof(data)=="string"){
                    if(data.indexOf("{")==0||data.indexOf("[")==0){
                        r.data=JSON.parse(data)
                    }
                }

            }
            return r
        },

        fire:function(ev,data){
            if(Array.isArray(this.callbacks[ev])&&this.callbacks[ev].length){
                while(this.callbacks[ev].length){
                    var fn=this.callbacks[ev].shift()
                    //};
                    //for(var i=0,l=this.callbacks[ev],ln=l.length,fn;fn=l[i],i<ln;i++){
                    if(typeof(fn)=="function"){
                        if(fn==console.log){fn.call(console,data)}
                        else if(fn.toString().indexOf("native code")>0){fn(data)}
                        else{fn.call(this,data)}
                    }
                }
            }
        },
        on:function(ev,fn){
            if(typeof(fn)=="function"&&ev&&Array.isArray(this.callbacks[ev])){
                this.callbacks[ev].push(fn)
            }
            return this
        },
        onloadstart:function(fn){  return this.on('loadstart', fn)  },// the request starts.
        onprogress:function(fn)	{  return this.on('progress', fn)  	},//  While loading and sending data.
        onabort:function(fn)	{  return this.on('abort', fn)  	},// the request has been aborted. For instance, by invoking the abort() method.
        onerror:function(fn)	{  return this.on('error', fn)  	},// the request has failed.
        onload:function(fn) 	{  return this.on('load', fn)  		},// the request has successfully completed.
        ontimeout:function(fn)	{  return this.on('timeout', fn)  	},// the author specified timeout has passed before the request could complete.
        onloadend:function(fn)	{  return this.on('loadend', fn)  	} ,
        _go:function(config){
            this.config.method=this.config.method||"GET";
            if(config){
                if(typeof(config.listener)=="function"){
                    ["load","loadstart","error","abort","timeout","loadend"].forEach(function(k){
                        this["on"+k]=config.listener.curry(k)
                    },this)
                }
                if(typeof(config)=="object"){$.extend(this.config,config)}
                else if(typeof(config)=="function"){this.onload(config)}
            }
            if(this.config.callback){this.onload(this.config.callback);delete this.config.callback}

            return this.process()
        },

        get: function(a) {
            return this._go(a)
        },
        post:function(config){
            this.config.method="POST";
            if(config&&typeof(config)=="object"&&config.tagName=="FORM"){
                this.config.form=config
                config=null
            }
            return this._go(config)
        },
        ajax: function(a, b) {
            return this._go(b)
        },
        sync: function(a) {
            return this.config.async = !1, this._go(a)
        },
        then: function(a, b) {
            return "function" == typeof a ? this._promise ? this._promise.then(a, "function" != typeof b ? void 0 : b) : null : void 0
        },
        json: function(a) {
            return this.config.responseType = "json", this._go(a)
        }
    }
    _inst.sendBinary=function(){
        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function (sData) {
                var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
                for (var nIdx = 0; nIdx < nBytes; nIdx++) {
                    ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
                }
                /* send as ArrayBufferView...: */
                this.send(ui8Data);
                /* ...or as ArrayBuffer (legacy)...: this.send(ui8Data.buffer); */
            };
        }
    };

    _inst.get=function(url,config,optns){
        return new _inst(url,config,optns)._go()
    }
    _inst.remote=function(cmd,config,optns){
        if(config===true){optns=true;config=null}
        if(typeof(config)=="function"){config={callback:config}}
        if(!$.isPlain(config)){config={}}
        config.cmd=cmd;
        return _inst.jsonp(app.servicePath,config,optns)
    }

    _inst.Get=function(url,config,optns){
        return new _inst(url,config,optns)._go()
    }
    _inst.post=function(url,config,optns){
        var nu=new _inst(url,config,optns)
        nu.config.method="POST";
        if(config&&typeof(config)=="object"&&config.tagName=="FORM"){
            nu.config.form=config
            config=null
        }
        return nu._go()
    }
    _inst.ajax=function(url,config,optns){
        var nu=new _inst(url,config,optns)
        return nu._go()
    }
    _inst.sync=function(url,config,optns){
        var nu=new _inst(url,config,optns)
        nu.config.async=false;
        return nu._go()
    }

    _inst.json=function(url,config,optns){
        var nu=new _inst(url,config,optns)
        nu.config.responseType="json"
        return nu._go()
    }
    _inst.directive = function(cmd, pars,callback) {
        var url=app.servicePath
        var optns={cmd:cmd,pars:pars,callback:callback}
        return _inst.get(url,optns)
    }
    _inst.jsonp=(function(){
        var __tempfns={},_counter=100,_head=(document.getElementsByTagName("head")||[])[0]||null,
            _body=(document.getElementsByTagName("body")||[])[0]||null ,_doc=document,__jsonp={}
        window.__jsonp=__jsonp;
        function jsonpcall(url,callbackname,callback){
            var fnnm="cb"+(++_counter)
            url=url+(url.indexOf("?")>0?"&":"?")+callbackname+"=__jsonp."+fnnm ;
            var cnt=0;
            //url=url.replace(/%[3D2B0]+/)
            while(/%\w\w/.test(url)&&++cnt<10){
                url=decodeURIComponent(url)
            }
            var scrpt=_doc.createElement("script")
            scrpt.onerror=function(e){
                console.log("Call to service failed",url)
                callback({"error":"Call to service failed"},true)
            }
            _head.appendChild(scrpt);
            __jsonp[fnnm]=(function(nm,scrpt,callback){
                return function(data){
                    try{
                        scrpt.parentNode&&scrpt.parentNode.removeChild(scrpt);
                        delete __jsonp[nm]
                    } catch(e){}
                    if(data==null){
                        callback({"error":"_"},true )
                    }
                    else{
                        callback({response:data})
                    }
                    //callback(data==null?"error":"load",data)

                }
            })(fnnm,scrpt,callback);
            scrpt.setAttribute("src",url)
            scrpt.src=url
            if(scrpt.getAttribute("src")!=url){
                scrpt.setAttribute("src",url)
            }
        }
        var defCallbackname="jsonpcallback"
        return function(url,config,optns){
            var nu,procargs= 0,oncomplete=null
            if(typeof(optns)=='function'){oncomplete=optns;optns=null}
            if(typeof(url)=="string" && /^(http|file)/i.test(url) && typeof(config)=="function"&& (!optns || typeof(optns)=="string"||optns===true)){
                if(optns===true) {
                    var uid = "", cid = window.CLIENTID
                    if (typeof(app) != "undefined" && app.user) {
                        uid = app.user.id
                    }
                    if (uid || cid) {
                        if (url.indexOf("&") > 0||url.indexOf("?") > 0) {
                            url = url + "&_clientid=" + cid + "&_userid=" + uid
                        }
                        else {
                            url = url + "?_clientid=" + cid + "&_userid=" + uid
                        }
                    }
                }
                return jsonpcall(url ,optns||defCallbackname, config)
            }
            else if(url && url instanceof  _inst){
                nu=url;
            }
            else{
                if(optns===true){optns=null}
                nu=new _inst(url,config,optns)
                procargs=1
                //if(config){
                // if(typeof(config)=="object"){$.extend(nu.config,config)}
                // else if(typeof(config)=="function"){nu.onload(config)}
                //}
            }
            var g=self,nm,url , callbackname=nu.config.callbackname||"jsonpcallback"
            if(nu.URI&&procargs){
                if(nu.config.args){
                    nu.URI.updateArgs(nu.config.args,true)
                }
            }
            url=nu.URI.fixUrl()
            if(_head===null){  _doc=document
                _head=_doc.getElementsByTagName("head")[0]||null
                _body=_doc.getElementsByTagName("body")[0]||null
            }
            nu.config.method=nu.config.method||"GET";
            if(oncomplete){
                nu._promise.then(oncomplete)
            }
            jsonpcall(url , callbackname,
                function(data,iserr){
                    if(iserr){nu._promise.reject(data)}
                    else{nu.onComplete(data,true)}
                }
            )



            return  nu
        }   })()

    return _inst
}();