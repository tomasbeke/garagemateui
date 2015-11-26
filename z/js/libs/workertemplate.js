/**
 * Created by atul on 2/5/14.
 */

function workerBoilerplate(scope){

    var isworker=typeof(window)=="undefined",$self=isworker?self:scope ,structuredCloningSupport=null,
        basepath= location.protocol + '//' +location.hostname +(location.port?':'+location.port:'');
    var _privateData={}
    var recomments= /\/\*.*?\*\//mg
    var recomments2=  /([^:])\/\/([^\n\r]*)/g
    var __postMessage=$self.postMessage
    function removeComments(  tofix){
        var cnt= 0,i
        while((i=tofix.indexOf("/*"))>=0&&cnt<500){cnt++
            var i2=tofix.indexOf("*/",i)
            if(i2>i){var cmnt=tofix.substr( i,i2 )
                tofix=tofix.substr(0,i )+(/[\r\n]/.test(cmnt)?"\n":"")+tofix.substr(i2+2)
            }
        };
        return tofix.replace( recomments,"\2").replace( recomments2,"\1").replace(/\r/g,"").replace(/[\n]+/g,"\n").trim()
    }
    function _parseMessage(data){
        return (typeof(data)=="object")?data:JSON.parse(String(data))
    }
    function _prepareMessage(data){
        if($self._structuredCloningSupport){return data}
        return (typeof(data)=="object")?JSON.stringify( data ):String(data)
    }
    function _sendToHost(data){
        __postMessage||(__postMessage=$self.postMessage);
        __postMessage(_prepareMessage(data))
    }
    var userAgent = navigator.userAgent.toLowerCase(),browser = {
        version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
        safari: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
        mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
    };

    if(typeof($self.importScripts)=="undefined"){
        if(typeof(document)!="undefined"){
            $self.importScripts=function(data,callback){
                var lst=Array.isArray(data)?data:[data],copy=lst.slice();
                var ss=document.getElementsByTagName("SCRIPT")||[],scrlast=ss.length?ss[ss.length-1]:null
                lst.forEach(function(it){
                    var src=it,nu=ss.insertBefore(document.createElement("script"),scrlast);
                    nu.async=false;
                    nu.onload=function(){var idx=copy.indexOf(it);if(idx>=0){copy.splice(idx,1)}
                        if(!copy.length && typeof(callback)=="function"){callback(it)}
                    }
                    nu.src=src

                })

            }
        }else{$self.importScripts=function(scr){
            [].concat(scr).forEach(
            function(it){xhr({url:it})}
            )

        }}
    }
    function log(){_sendToHost({cmd:"log",ctx:"console",args:[].slice.call(arguments)})}
    function error(){_sendToHost({cmd:"error",ctx:"console",args:[].slice.call(arguments)})}
    function warn(){_sendToHost({cmd:"warn",ctx:"console",args:[].slice.call(arguments)})}
    function alert(){_sendToHost({cmd:"alert",args:[].slice.call(arguments)})}
    function print(){_sendToHost({cmd:"log",ctx:"console",args:[].slice.call(arguments)})}

    function xhr(){

        var req ,data=arguments[0]||{},url,res
        if(typeof(data)=="string"){data={url:data}}
        if(!data.url && data.args && data.args.url){
            data=data.args
        }
        url=data.url
        //=data.url||data
        try{var args=data.args,argsstr=""

            req = new XMLHttpRequest() ;
            if(args && typeof(args)=="object"){Object.keys(args).map(function(k){
                if(typeof(k)!="string"||args[k]==null||args[k]=="" ){return""}
                if(typeof(args[k])=="object"){args[k]=JSON.stringify(args[k])}
                argsstr+=(argsstr?"&":"")+k+"="+args[k]
            })}
            if(argsstr){
                url+=(url.indexOf("?")>0?"&":"?")+argsstr
            }
            if(url.indexOf("//")==0){url="http"+url}
            if(url.indexOf("http")==0 && url.toLowerCase().indexOf(basepath.toLowerCase())==-1){
                if($self.proxyloader){url=$self.proxyloader+($self.proxyloader.indexOf("?")>0?"&":"?")+"proxy="+url}
            } else if(url.indexOf("/")==0 ){
                url=basepath+"/"+url.substr(1)
            }
            req.open('GET', url, false);
            req.setRequestHeader("x-requested-with","xmlhttprequest");
            req.send("");
            // IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
            var success= !req.status && location.protocol == "file:" ||
                (req.status >= 200 && req.status < 300) || req.status == 304 || req.status == 1223 ||  (browser.safari && xhr.status == undefined);

            if (  success) {
                var fin,rs,ln,frst,ar,hdrs=req.getAllResponseHeaders?req.getAllResponseHeaders().split(/[\n\r]/).reduce(function(m,k){
                    var ar=k.split(":");if(!ar[0].trim()){return m}
                    return m[ar.shift().trim()]=ar.join(":").trim(),m},{}):{}


                fin=rs=req.responseText?req.responseText.trim():"";
                ln=rs.length;
                frst=rs.charAt(0);
                if(ln&& rs.indexOf("function")==-1&& (String(hdrs["Content-Type"]).toLowerCase().indexOf("json")>=0 ||( (frst=="{"||frst=="[")&&(rs.charAt(ln-1)==(frst=="{"?"}":"]"))))){

                    try{
                        fin=JSON.parse(rs)
                    }catch(e){
                        try{fin=(1,eval)(rs+"")}catch(e){}
                    }
                }

                res= {responseType:req.responseType,response:fin,status:req.status,statusText:req.statusText, content:fin,headers:hdrs,url:url} ;
            }
            else { res={error:"Could not load resource(" + url + ") result=" + req.status + ":" + req.statusText} }
        } catch(e){
            res={error:"Could not load resource(" + url + ") result=" + e.message}
        }
        return res;
    }
    $self.sendToHost=_sendToHost
    $self.load=xhr
    $self.__handlers={}
    $self.addHandler=function(cmd,fn){
        if(typeof(cmd)=="string" && typeof(fn)=="function"){
            this.__handlers[cmd]=    fn;
        }
    }
    $self.getHandler=function(cmd){
        return this.__handlers[cmd];

    }
    $self.addHandler("load",load);
    //$self.console={log:log,warn:warn,error:error}
    function addModule(nm,callback){
        var res=$self.load(nm);
            if(res && res.response){
                var txt=removeComments(res.response.trim()).trim();
                var api
                try{
                    api=(1,eval)("(function(){ return "+txt+" })()")
                } catch(e){}

                if(api && typeof(api)=="object" ){
                    callback && callback(api)
                }
                return api;
            }

    }
    function _addDefinition(d0,nm){var d=d0  ,container=$self
        if(d.module){
            addModule(d.module)
        }
        if(typeof(d)=="string"&& !/^(http|[\/]+)/.test(d)){
            d= d.trim()
            if(d.indexOf("->")>=0){
                d=Function.apply(self,d.split(/[\-=]>/).map(function(a,i){return i?a.trim():a.trim().replace(/^\(|\)$/g,"").trim()}))
            } else if(d.indexOf("FN|") ==0||d.indexOf("function") ==0||d.indexOf("(function") ==0){d=d.replace(/FN\|/g,"").replace(/\|FN/g,"")
                try{d=eval("("+d.trim().replace(/^\(+|\)+$/g,"")+")")} catch(e){d=d0}
            }
        }
        if(d){
            nm=nm||d.name
            var p=resolvepath(nm)
            if(!p.defined){
                p.container[p.name]=d
            }
        }
    }
    function resolvepath(p){
        var res={container:$self,name:p}
        if(p.indexOf(".")>0){
            var ar=p.split(/\./);res.name=ar.pop()
            res.container=ar.reduce(function(m,k){ (k in m)||(m[k]={});return m[k]},$self)
        }
        if(p.container==null){p.container={}}
        if(typeof(p.container)!="object"&&typeof(p.container)!="function"){p.container=Object(p.container)}
        res.defined=(p.name && p.container&&(p.name in p.container))
        return res
    }
     function _messagefromHost(ev){
        var res,data=_parseMessage(ev.data),ctx=$self ,id=data._msgid  || data.id
        if(data.import){
            var lst=Array.isArray(data.import)?data.import:[data.import];
            importScripts.apply($self,lst,function(url){
                _sendToHost({_msgid:id,data:url})
            } );
        }

        if(data.definitions && data.definitions.module){
            var module=data.definitions.module;
            delete data.definitions.module
            if(!Object.keys(data.definitions).length){delete data.definitions}
            var apiobj=addModule( module)||{} ;
                 var api=apiobj.api?Object.keys(apiobj.api):[];
                if(api.length) {
                    $self[apiobj.name]=apiobj.api
                    res={api:api,name:apiobj.name}
                 }
        }
        if(data.definitions){
            var defs=data.definitions
            if(Array.isArray(defs)){
                defs.forEach(function(it){_addDefinition(it)})
            } else {
                Object.keys(defs).forEach(function(it){_addDefinition(defs[it],it)})
            }
        }

        if(data.Eval){var toeval,argmap=data.ctxargs||{},toev=data.Eval,toev_safe=toev;if(toev.indexOf("return")==-1){toev="return "+toev}
            if(Object.keys(Object(argmap)).length){
                toeval="(function(_){with(_)("+toev+")})"
            } else{toeval="(function(){"+toev+"})"}
            res=eval(toeval)(argmap)
        }
        if(data.cmd=="xhr" || (!data.cmd && data.url)){data.cmd="load";
            if(!data.args){data.args={url:data.url}}
            else if(typeof(data.args)=="object"){data.args.url=data.url}
        }
        if(data.cmd){
            var h=$self.getHandler(data.cmd);
            if(typeof(h)=="function"){
                res= h(data)
            }
            else if(data.cmd=="load"){
                res= $self.load(data.args)
            } else{
                   if (!data.ctx && typeof(data.cmd) == "string") {
                        var p = resolvepath(data.cmd)
                        data.ctx = p.container;
                        data.cmd = p.name
                    }

                    if (data.ctx && data.ctx != $self && data.ctx in $self) {
                        ctx = $self[data.ctx]
                    }
                    var cmd = ctx[data.cmd];
                    if (!cmd) {
                        cmd = $self[data.cmd];
                        ctx = cmd ? $self : null
                    }
                    if (typeof(cmd) == "function") {
                        var args = [].concat((data.args == null ? data : data.args) || [])
                        res = cmd.apply(ctx, args)
                    } else {
                        res = cmd
                    }
             }
        }
        if ($self._structuredCloningSupport == null&&ev.data  ) {
            if(String(ev.data).toUpperCase().indexOf('PING')==0){$self._structuredCloningSupport =!!(ev.data.length>=0 && ev.data[0] === 'PING')}
            $self._structuredCloningSupport = !!(typeof(ev.data)=="object");                   // Pingback to parent page:
            res=res||{};
            res.structuredCloningSupport=$self._structuredCloningSupport;
        }
        if(res==undefined){return}
        res=res||{}
        var data={}
        if(res.data){data=res} else{data={data:res}}
        data._msgid=id
        return _sendToHost(data)
    }
    if(typeof(__postMessage)!="function"){
        _privateData.listeners={message:[],error:[]}
        __postMessage=function(data){var rec={type:"message",data:data}
            if(typeof($self["onmessage"])=="function"){$self["onmessage"](rec)}
            _privateData.listeners.message.forEach(function(it){
                 it(rec);
            })
        }
        $self.postMessage=__postMessage
        $self.removeEventListener=function(ev,fn){

        }
            $self.addEventListener=function(ev,fn){
                _privateData.listeners||(_privateData.listeners={message:[],error:[]});
                if(_privateData.listeners[ev]&&typeof(fn)=="function"){
                    _privateData.listeners[ev].push(fn)
                }
            }


    }

    $self.onmessage=_messagefromHost

};


if(typeof(window)=="undefined"){
    workerBoilerplate(this);
} else {
    (function(boilerplate){
        if(typeof(self.Worker)=="undefined"){
            self.Worker=function(scr){
                boilerplate(this)
                if(typeof(scr)=="string"){this.importScripts([scr])}
            }
            self.Worker.prototype={  onmessage:null,  terminate:function(){},  }
        }
        boilerplate.makeworker=function( callback){
            var url="";
            var scr=[].slice.call(document.getElementsByTagName("script")).filter(function(a){return a && a.src && a.src.indexOf("workertemplate.")>=0})[0]
            if(scr){
                url=scr.src
            }
            if(!url) {
                var base = [].slice.call(document.getElementsByTagName("script")).filter(function (a) {
                    return a && a.src && a.src.indexOf("core.js") >= 0
                })[0];
                if (base) {
                    var arr = base.src.split(/\//), idx = arr.indexOf("js")
                    if (idx >= 0) {
                        url = arr.slice(0, idx + 1).join('/') + "/workertemplate.js"
                    }
                }
            }
            if(!url){url=location.href.split(/\//).slice(0,4).join("/")+"/js/workertemplate.js"}
            var w= new Worker(url)
            w.parsemessage=function(data){return (typeof( data)=="object")? data:JSON.parse(String( data))}
            function prepareMessageforfn(data){
                for(var i= 0,l=Object.keys(data),ln = l.length;i<ln;i++){
                    if(typeof(data[l[i]])=="function"){data[l[i]]=data[l[i]].toString().trim()}
                    else if(typeof(data[l[i]])=="object"){
                        data[l[i]]=prepareMessageforfn(data[l[i]])
                    }
                }
                return data
            }
            w.prepareMessage=function _prepareMessage(data){
                data=prepareMessageforfn(data)
                return (typeof(data)=="object")?JSON.stringify( data ):String(data)
            }
             w._postmessage=w.postMessage
            w.post=w.postMessage=function(data,callback){
                data._msgid= data._msgid||++_idcounter;
                 var id=data._msgid,dd=this.prepareMessage(data)
                 var pr,res
                if(typeof(Promise)!="undefined"){
                    pr=Promise.deferred()
                    pr._ispromise=true
                }
                callbacks[String(id)]=pr
                if(callback && callback.memo){pr._memo=callback.memo}

                if(callback&&( typeof(callback)=="function"||typeof(callback.callback)=="function") ){
                    var fn=callback.callback||callback||function(){};
                    pr.then(fn)
                }
                res=this._postmessage(dd)
                return pr
            }

            w._onmessage=w.onmessage
            delete w.onmessage;
            try{
            Object.defineProperty(w,"onmessage",{
                    set:function(fn){  this.addEventListener("message",fn)   },
                    get:function(){return this._onmessage}}
            );
            } catch(e){}
            var _idcounter= 0,callbacks={};
            function addToApi(nm,methods){
                w1=this
                if(methods && Array.isArray(methods)&&nm){
                    var prx={}
                    methods.forEach(function(k){
                        if(k=="module"){return}
                        prx[k]=w1.invoke.bind(w1,nm+"."+k)
                    })
                    w1.api[nm]=prx
                } else if(nm){
                    w1.api[nm]=w.invoke.bind(w,nm)
                }
            }
            w.addToApi=addToApi
            w.getContent=function(url,callback){
                return this.postMessage({ cmd:"xhr",url:url},callback)
             }
            w.invoke=function(nm){
                var a=[].slice.call(arguments,1),callback,args=[];
                if(typeof(a[a.length-1])=="function"){callback= a.pop()}
                if(a.length==1){args= a.shift()}
                else{[].push.apply(args,a)};

                var arr=nm.split(/\./),cmd=arr.pop(),ctx=arr.shift()
                return this.postMessage({
                        cmd:cmd,
                        ctx:ctx,
                        args:Array.isArray(args)?args:[args]}
                    ,callback
                )
            }
            w.define=function(nm,obj0,callback){
                var w1=this,d={},obj=obj0;
                if(obj==null){d=nm;}
                else{d[nm]=obj}
                if(typeof(callback)!="function"){callback=null}

                this.postMessage({definitions:d},callback)
                if(obj && typeof(obj)=="object"&&nm&&nm!="module") {
                    addToApi.call(this,nm, Object.keys(obj))
                }

            }
            w.api={};
            w._addEventListener=w.addEventListener
            w.load=function(url0,callback){
                var url=ZModule.ResourceURL(url0)
                var p= this.post({cmd:"load",args:{url:url}})
                if(typeof(callback)=="function"){p.then(callback)}
                return p

            }
            w.on=function(fn){w.addEventListener("message",fn)}
            w.addEventListener=function(ev,mthd){return this._addEventListener(ev,ev=="message"?
                function(f,ev){
                    var copy={};for(var k in ev){copy[k]=ev};copy.data=this.parsemessage(ev.data);
                    f.call(this,copy)}.bind(w,mthd):
                mthd)}
            w.addEventListener("message",function(ev){var ctx=self,res,data=ev.data
                if(data.structuredCloningSupport!=null){this._structuredCloningSupport=data.structuredCloningSupport||(data.data && data.data.structuredCloningSupport);
                    return
                }
                 if(data._msgid && callbacks[String(data._msgid)]){ var id=String(data._msgid);
                    var f=callbacks[id];delete callbacks[id];
                    if(f){var d= (data && typeof(data)=="object" && "data" in data)?data.data:data
                        if(f._memo){d.memo= f._memo}
                        if(f._ispromise) {f.resolve(d)}
                        else if(typeof(f)=="function"){f(d)}
                    }
                }
                if(data.cmd){
                    if(!data.ctx && typeof(data.cmd)=="string"&&data.cmd.indexOf(".")>0){
                        var arr=data.cmd.split(/\./);
                        data.ctx=arr.shift();data.cmd=arr.join(".")
                    }
                    if(data.ctx&&data.ctx in  self){
                        ctx= self[data.ctx]
                    }
                    var cmd=ctx[data.cmd]
                    if(typeof(cmd)=="function"){
                        var args=[].concat(data.args||[])
                        res=cmd.apply(ctx,args)
                    } else {res=cmd}
                    if(res!=null){
                        this.postMessage(res)
                    }
                }
            });
            w.postMessage(['PING']);
            if(typeof(callback)=="function"){w.on(callback)}
            return w;
        }
    })(workerBoilerplate)
}