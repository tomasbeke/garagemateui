function baseWorker(scope){

    var isworker=typeof(window)=="undefined",$self=isworker?self:scope ,structuredCloningSupport=null,
        basepath= location.protocol + '//' +location.hostname +(location.port?':'+location.port:'');
    function _parseMessage(data){
        return (typeof(data)=="object")?data:JSON.parse(String(data))
    }
    function _prepareMessage(data){
        if($self._structuredCloningSupport){return data}
        return (typeof(data)=="object")?JSON.stringify( data ):String(data)
    }
    function _sendToHost(data){
        postMessage||(postMessage=$self.postMessage);
        postMessage(_prepareMessage(data))
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
        }else{$self.importScripts=function(){}}
    }
    function log(){_sendToHost({cmd:"log",ctx:"console",args:[].slice.call(arguments)})}
    function error(){_sendToHost({cmd:"error",ctx:"console",args:[].slice.call(arguments)})}
    function warn(){_sendToHost({cmd:"warn",ctx:"console",args:[].slice.call(arguments)})}
    function alert(){_sendToHost({cmd:"alert",args:[].slice.call(arguments)})}
    function print(){_sendToHost({cmd:"alert",args:[].slice.call(arguments)})}

    function xhr(){var req ,data=arguments[0]||{},url=data.url||data ,res
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
            }
            req.open('GET', url, false);
            req.send("");
            // IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
            var success= !req.status && location.protocol == "file:" ||
                (req.status >= 200 && req.status < 300) || req.status == 304 || req.status == 1223 ||  browser.safari && xhr.status == undefined;

            if (  success) {
                var fin,rs,ln,frst,ar,hdrs=req.getAllResponseHeaders?req.getAllResponseHeaders().split(/[\n\r]/).reduce(function(m,k){return ar=k.split(":"),m[ar.shift().trim()]=ar.join(":").trim(),m},{}):{}


                    fin=rs=req.responseText?req.responseText.trim():"";ln=rs.length;frst=rs.charAt(0);
                if(ln&& (String(hdrs["Content-Type"]).toLowerCase().indexOf("json")>=0 ||((frst=="{"||frst=="[")&&(rs.charAt(ln-1)==(frst=="{"?"}":"]"))))){
                    try{fin=JSON.parse(rs)}catch(e){
                        try{fin=(1,eval)(rs+"")}catch(e){}
                    }
                }

                res= {content:fin,headers:hdrs,url:url} ;
            }
            else { res={error:"Could not load resource(" + url + ") result=" + req.status + ":" + req.statusText} }
        } catch(e){
            res={error:"Could not load resource(" + url + ") result=" + e.message}
        }
        return res;
    }
    $self.load=xhr
    //$self.console||($self.console={log:log,warn:warn,error:error});

    function _addDefinition(d0,nm){var d=d0  ,container=$self
        if(typeof(d)=="string"){
            if(nm!="proxyloader"){
                if(d.indexOf("FN|") ==0){d=d.replace(/FN\|/g,"(").replace(/\|FN/g,")")}
                try{d=eval("("+d.trim().replace(/^\(|\)$/g,"")+")")} catch(e){d=d0}
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
        if(typeof(p.container)!="object"){p.container=Object(p.container)}
         res.defined=(p.name in p.container)
        return res
    }
    function _messagefromHost(ev){
        var res,data=_parseMessage(ev.data),ctx=$self ,id=data._msgid
        if(data.import){var lst=Array.isArray(data.import)?data.import:[data.import];
            importScripts.apply($self,lst,function(url){
                _sendToHost({_msgid:id,data:url})
            } );
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
        if(!data.cmd && data.url){data.cmd="load";
            if(!data.args){data.args={url:data.url}}
            else if(typeof(data.args)=="object"){data.args.url=data.url}
        }
        if(data.cmd){
           if(data.cmd=="load"){
               res= $self.load(data.args)
           } else{
                if(!data.ctx && typeof(data.cmd)=="string"){
                    var p=resolvepath(data.cmd)
                    data.ctx= p.container;data.cmd= p.name
                }
                if(data.ctx&&data.ctx in $self){
                    ctx=$self[data.ctx]
                }
                var cmd=ctx[data.cmd];if(!cmd){cmd=$self[data.cmd];ctx=cmd?$self:null}
                if(typeof(cmd)=="function"){
                    var args=[].concat((data.args==null?data:data.args)||[])
                    res=cmd.apply(ctx,args)
                } else {res=cmd}
         }
        }
        if ($self._structuredCloningSupport == null&&ev.data  ) {
            if(String(ev.data).toUpperCase().indexOf('PING')==0){$self._structuredCloningSupport =!!(ev.data.length>=0 && ev.data[0] === 'PING')}
            $self._structuredCloningSupport = !!(typeof(ev.data)=="object");                   // Pingback to parent page:
            res=res||{};
            res.structuredCloningSupport=$self._structuredCloningSupport;
        }
        res=res||{}
        var data={}
        if(res.data){data=res} else{data={data:res}}
        data._msgid=id
        return _sendToHost(data)
    }

    $self.onmessage=_messagefromHost
}


if(typeof(window)=="undefined"&&typeof(document)=="undefined"){
    baseWorker(this);
 }



$.IframeListener=(function(){
    var evmthd = window.addEventListener ? "addEventListener" : "attachEvent",
      remevmthd = window.removeEventListener? "removeEventListener" : "detachEvent",
       messageEvent = evmthd == "attachEvent" ? "onmessage" : "message";
    var loc=location,ctx= loc.pathname.substr(1).split("/").shift(),idcounter=0
    ctx=loc.href.substr(0,loc.href.indexOf(ctx)+ctx.length)+"/"

    function _setupiframe(){
        var args=[].slice.call(arguments)
        var messageApi=args[0]&&args[0].__messageapi?args[0]:{__messageapi:1,dosetup:1};
        messageApi.__api||(messageApi.__api= {
            post:function(data,callback){ },
            on:function(fn){ }
        });

        if(typeof(msgAPI)=="undefined"){
            var scr=document.head.appendChild(document.createElement("script"))
            scr.src=ctx+"js/fw1/msgapi.js";
            window[evmthd](messageEvent,function f(ev){
                if(ev.data=="msgapi"){
                    window[remevmthd](messageEvent,f)
                    args.unshift(messageApi)
                    setTimeout(function(){_setupiframe.apply(null,args)},10)
                 }
            })
         } else{   var api=messageApi.__api
            if(messageApi.dosetup ){ messageApi=msgAPI(this,{structuredCloningSupport:true})}
            messageApi.origin="";
            this.addEventListener("message",function(ev){
                   if(ev.data&&ev.data.msgapi){messageApi.origin=ev.data.msgapi}
                    if(ev.origin===messageApi.origin||(ev.source&&ev.source.location&&ev.source.location.href==messageApi.origin)){
                        var d=ev.data
                        if(d&&d.data){d=d.data}
                    messageApi.digest({data:d,origin:messageApi.origin})
                }
             })
            api.post=function(data){
                _ifr.contentWindow.postMessage( data,messageApi.origin||"*")
            }
            api.on=function(fn){messageApi.on(fn)}

             var _ifr=document.createElement("iframe");
            origin=_ifr.src=ctx+"html/iframebase.html"+"#"+(++idcounter);
            _ifr=document.body.appendChild(_ifr);
            _ifr.style.cssText="height:1px;width:1px;border:0;margin:0;visibility:hidden;position:fixed;top:-10px";
            messageApi.frame=_ifr
            _ifr.__id=idcounter
            return api;
         }
        return messageApi.__api

    }

    return _setupiframe
})()