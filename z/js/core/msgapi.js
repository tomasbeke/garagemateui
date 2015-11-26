var msgAPI=function(context,cnfg){  var id
    if(context&&typeof(context)!="object"){id=context;context=null}
    var $self=context||this
    var _config={structuredCloningSupport:null,api:{},id:id,isworket:0,proxyloader:null,listeners:[],errorlisteners:[]}
    if(cnfg&&typeof(cnfg)=="object"){Object.keys(cnfg).forEach(function(k){_config[k]=cnfg[k]})}
    function _addDefinition(def,nm){var d;
        if(typeof(def)=="string"){
            if(nm!="proxyloader"){var fnbody
                if(d.indexOf("FN|") ==0){
                    fnbody=d.replace(/^FN\|/ig,"").replace(/\|FN$/g,"").trim()
                } else if(d.indexOf("->") ==0||d.indexOf("=>") ==0){
                    fnbody=d.replace(/[\-\=]>/,"").trim()

                }
                if(fnbody&&fnbody.indexOf("function")==-1){
                    if(!/[\n\r]/.test(fnbody) && fnbody.indexOf("return")==-1){
                        fnbody="return "+fnbody
                    }
                    fnbody="function(){"+ fnbody+"}"
                }
                try{d=eval("("+d.trim().replace(/^\(|\)$/g,"")+")")} catch(e){d=d0}
            }
        } else{  d=def;
            if(def && typeof(def)=="object" ){
                Object.keys(def).forEach(function(k){
                    _addDefinition(def[k],((typeof(nm)=="string"&&nm)?(nm+"."):"")+k)
                })
            }
        }
        if(d){
            if(nm){
                var o=resolvepath(nm)
                o.container[o.name]=d;
                if(typeof(d)=="function"){
                    _config.api[nm]=d;
                }
            }
        }
    };
    function resolvepath(obj){
        var arr=String(obj).split(/\./),nm=arr.pop()
        var container
        if(!arr.length){
            container=$self;
        } else{
            container=arr.reduce(function(m,it){
                return  m[it]||(m[it]={});
            },$self);
        }
        return {container:container,name:nm,obj:container[nm]}
    }
    function dispatchmessage(msg){
        var data=msg
        if(msg.callback){
            msg.callback(msg);
            delete msg.callback
        }
        if(data&&!_config.structuredCloningSupport&&typeof(data)=="object"){
           try{ var d=JSON.stringify({x:msg}).replace(/^({\s*"x"\s*:)|}$/g,"");data=d;} catch(e){}
        }
        if(_config.listeners&&_config.listeners.length){
            _config.listeners.forEach(function(it){it(data)})
        }
    }
    if(typeof($self.console)=="undefined"){
        $self.console={
            log:function log()  {dispatchmessage({cmd:"log",ctx:"console",args:[].slice.call(arguments)})},
            error:function error(){dispatchmessage({cmd:"error",ctx:"console",args:[].slice.call(arguments)})},
            info:function info(){dispatchmessage({cmd:"info",ctx:"console",args:[].slice.call(arguments)})},
            trace:function trace(){dispatchmessage({cmd:"trace",ctx:"console",args:[].slice.call(arguments)})},
            warn:function warn() {dispatchmessage({cmd:"warn",ctx:"console",args:[].slice.call(arguments)})}   ,
            alert:function alert(){dispatchmessage({cmd:"alert",args:[].slice.call(arguments)})} ,
            print:function print(){dispatchmessage({cmd:"alert",args:[].slice.call(arguments)})}
        }
    }
    function xhr(){
        var req ,data={},res
        if(typeof(arguments[0])=="string"){data.url=arguments[0];data = arguments[1]||{}}
        else{data = arguments[0]||{}}
        try{var args=data.args,argsstr=""
            req = new XMLHttpRequest() ;
            if(args && typeof(args)=="object"){Object.keys(args).map(function(k){
                if(typeof(k)!="string"||args[k]==null||args[k]=="" ){return""}
                if(typeof(args[k])=="object"){args[k]=JSON.stringify(args[k])}
                argsstr+=(argsstr?"&":"")+k+"="+args[k]
            })}
            var url=data.url
            if(argsstr){  url+=(url.indexOf("?")>0?"&":"?")+argsstr  }
            if(url.indexOf("//")==0){url="http"+url}
            if(url.indexOf("http")==0 && url.toLowerCase().indexOf(location.hostname.toLowerCase())==-1){
                if(_config.proxyloader){url=_config.proxyloader+(_config.proxyloader.indexOf("?")>0?"&":"?")+"proxy="+url}

            }
            req.open('GET', url, false);
            req.send("");
            // IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
            var success= !req.status && location.protocol == "file:" ||
                ((req.status >= 200 && req.status < 300) || req.status == 304 || req.status == 1223) ;
            if (  success) {
                var fin,rs,ln,frst,ar,hdrs=req.getAllResponseHeaders?req.getAllResponseHeaders().split(/[\n\r]/).reduce(function(m,k){return ar=k.split(":"),m[ar.shift().trim()]=ar.join(":").trim(),m},{}):{}
                fin=rs=req.responseText?req.responseText.trim():"";ln=rs.length;frst=rs.charAt(0);
                 res= {content:rs,headers:hdrs,url:url} ;
            }
            else { res={error:"Could not load resource(" + url + ") result=" + req.status + ":" + req.statusText} }
        } catch(e){
            res={error:"Could not load resource(" + url + ") result=" + e.message}
        }
        return res;
    }
     function _invoke(data){
        var res,ctx=data.ctx,cmd=data.cmd
        var args=[].concat((data.args==null?data:data.args)||[])
        if(cmd=="echo"){
            res = data.message||args.length?args:cmd
        }
        else if(cmd=="load"){
            res = xhr.apply(null,args)
        } else{
            if(typeof($self[cmd])=="function"){ctx=$self;cmd=$self[cmd]}
            if($self.console && typeof($self.console[cmd])=="function"){ctx=$self.console;cmd=$self.console[cmd]}
            if(typeof(cmd)=="function" && ctx&&typeof(ctx)=="object") {

            } else{
                if(typeof(ctx)=="string"){
                    if(ctx in $self){
                        ctx=$self[ctx]
                    } else{
                        var p=resolvepath(cmd)
                        ctx= p.container;
                    }

                }
                if(!(ctx&&typeof(ctx)=="object")){ctx=$self}
                if(typeof(_config.api[cmd])=="function"){
                    res=_config.api[cmd].apply(ctx,args)
                }
                else {cmd=ctx[cmd]  }
            }
            if(typeof(cmd)=="function"){
                res=cmd.apply(ctx,args)
            } else {
                res=cmd
            }
        }
        return res
    }
    function serialize(s,asraw){
        if(typeof(s)=="object"){
            if(Array.isArray(s)){
                var ret= s.map(function(k){return serialize(k,true)})
                return asraw===true?ret:JSON.stringify(ret);
            } else{var ret={};
                Object.keys(s).forEach(function(k){ret[k]=serialize(s[k],asraw)})
                return asraw===true?ret:JSON.stringify(ret);
            }
        } else if(typeof(s)=="function"){return "FN|"+String(s)}
        else{return String(s)}
    }
    function deserialize(s,onfns){
        var ret=s;
        try{
            if(typeof(s)=="string"){
                var fnbody
                if(s.charAt(0)=='"'){s=s.replace(/^"|"$/g,"")}
                 if(!onfns){
                    if(s.charAt(0)=="{"){return JSON.parse(s)}
                    else if(s.charAt(0)=="["){return (JSON.parse("{x:"+s+"}")||{}).x}
                 }
                if(s.indexOf("FN|") ==0){
                    fnbody=d.replace(/^FN\|/ig,"").replace(/\|FN$/g,"").trim()
                } else if(s.indexOf("->") ==0||s.indexOf("=>") ==0){
                    fnbody=s.replace(/[\-\=]>/,"").trim()
                } else if(s.indexOf("function") ==0||s.indexOf("(function") ==0){fnbody=s}
                if(fnbody&&fnbody.indexOf("function")==-1){
                    if(!/[\n\r]/.test(fnbody) && fnbody.indexOf("return")==-1){
                        fnbody="return "+fnbody
                    }
                    fnbody="function(){"+ fnbody+"}"
                }
                if(fnbody){
                    try{
                        ret=eval("("+fnbody.trim().replace(/^\(|\)$/g,"")+")")
                    } catch(e){}
                }
            }
            else if(typeof(s)=="object"){
                if(Array.isArray(s)){
                    return s.map(function(k){return deserialize(k,onfns)})
                } else{ret={};
                    Object.keys(s).forEach(function(k){ret[k]=deserialize(s[k],onfns)})
                    return ret;
                }
            }
        } catch(e){

        }
        return ret;
    }
    function processmessage(msg,id,callback){
        var response={result:null,id:id,callback:callback}
        if(msg.origin || msg.target || (msg.constructor&&String(msg.constructor.name).toLowerCase().indexOf("event")>=0)){
            response.origin=msg.origin;
        }
        var data=msg.data||msg
         //ping
        if(_config.structuredCloningSupport===null){
            if(data.structuredCloningSupport){
                _config.structuredCloningSupport =!!(typeof(data)=="object"&&String(data[0]).toLowerCase()==="yes")
                response.result={structuredCloningSupport:[_config.structuredCloningSupport?"yes":"no"]}
            }
        }
        if(data.origin){ response.origin=data.origin;delete data.origin }
        if(data.data&&Object.keys(data).length==1){data=data.data}

        if(typeof(data)=="string"){
            data=deserialize(data)
        }
        if(data.origin){  response.origin=data.origin;delete data.origin }
        if(data.data&&Object.keys(data).length==1){data=data.data}

        if(typeof(data)=="string"){data={cmd:data=data}}
        if(!response.id){response.id=msg.id||data.id}

        var res
        if(data.definitions||data.api){
            var defs=data.definitions||data.api

            if(Array.isArray(defs)){
                defs.forEach(function(it){_addDefinition(it)})
            } else {

                Object.keys(defs).forEach(function(it){_addDefinition(defs[it],it)})
            }
        }

        if(data.Eval){
            var toeval,argmap=data.ctxargs||{},
                toev=data.Eval,toev_safe=toev;
            if(toev.indexOf("return")==-1){toev="return "+toev}
            if(Object.keys(Object(argmap)).length){
                toeval="(function(_){with(_)("+toev+")})"
            } else{
                toeval="(function(){"+toev+"})"
            }
            res=(1,eval)(toeval)(argmap)
        }
        if(data.fileread){
            if(!$self.requestFileSystemSync&&$self.webkitRequestFileSystemSync){$self.requestFileSystemSyncself=$self.webkitRequestFileSystemSync }
            if($self.FileReaderSync){
                var buffers=[]
                var reader = new FileReaderSync();
                response.result=reader.readAsText(data.fileread);
            }
        }
        if(!data.cmd && data.import){
            data.cmd="importScripts";
            var scripts=[].concat(data.import)
           if($self.importScripts){$self.importScripts.apply($self,scripts)}
        }
        if(!data.cmd && data.url){
            data.cmd="load";
            if(!data.args){data.args={url:data.url}}
            else if(typeof(data.args)=="object"){
                data.args.url=data.url
            }
        }
        if(data.cmd){
            if(data.cmd=="echo"){res=data.message||data.cmd}
            else{res=_invoke(data)}
        }
        if(data.result){res=data.result}
        if(res!==undefined){
            if(res && typeof(res.then)=="function"){
                 res.then(function(r){
                    this.result=r;
                    dispatchmessage(this)
                }.bind(response));
            }
            else {
                response.result=res;
                dispatchmessage(response)
            }
        }

    }
    var api= {
        digest:function(data){var callback,id
            if(typeof(arguments[1])=="function") {
                callback=arguments[1];if(arguments.length>2){id=arguments[2]}
            } else{id=arguments[1]}

            processmessage({data:data,id:id,callback:callback})
        },
        invoke:function(nm,args,id){
            processmessage({data:{cmd:nm,args:args},id:id})
        },
        error:function(fn){
            typeof(fn)=="function" && _config.errorlisteners.push(fn)
        },
        dispatch:function(data){
            dispatchmessage(data)
        },
        on:function(fn){
            typeof(fn)=="function" && _config.listeners.push(fn)
        },
        api:function(){ return Object.keys(_config.api)}     ,
        attach:function(){
                if("postMessage" in $self){
                    _config.listeners.push(function(data){
                        $self.postMessage(data,"*")
                    })
                }
            if("onmessage" in $self &&  $self.addEventListener){
                $self.addEventListener("message",
                    function(ev){
                        processmessage(ev)
                    }
                )
            }
            return this
        }
    }
    api.post=api.digest
    return api

}/**
 * Created by atul on 6/7/14.
 */

self.postMessage && self.postMessage({"msgapi":location.href})
