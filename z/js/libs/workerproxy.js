/**
 * Created by atul on 9/3/2014.
 */
;(function(scope){
    var self=scope
function copy(src,trgt){
    if(!(src&&typeof(src)=="object")){return src}
    if(trgt==null){return Object.create(src)}
    var own=Object.prototype.hasOwnProperty
    for(var k in src){
        if(own.call(src,k)){trgt[k]=src[k]}
    }
    return trgt;
}
    function _unfixjson(o ){
        if(!(o&&o.hasOwnProperty)){return o}
        if(typeof(o)=="function"){
            var ret={}
            ret[o.name||o._name||"anonymous"]=o.toString()
            return ret
        }
        for(var k in o){
            if(!o[k]){continue}
            if(o.hasOwnProperty(k)){
                if(typeof(o[k])=="string") { var d=o[k];
                    if(d.indexOf ("fn|") == 0) {
                        d=d.substr (3) + ")"
                    }
                    d=d.trim ().replace (/^[\('"]|['"\)]$/g, "").trim ()
                    try {
                        if(d.trim ().indexOf ("function") == 0) {
                            d=(1, eval) ("(" + d + ")")
                        }else {
                            d=Function (d)
                        }
                    } catch(e){}
                    if(typeof(d)=="function"){
                        o[k]=d    
                    }
                     
                }
                 else if( typeof(o[k])=="object"){
                    o[k]=_unfixjson(o[k] )
                }
            }
        }
        return o
    }
    function _fixjson(o ){
        if(!(o&&o.hasOwnProperty)){return o}
        if(typeof(o)=="function"){
            var ret={}
             ret[o.name||o._name||"anonymous"]=o.toString()
            return ret
        }
         for(var k in o){    var v=o[k];
             if(!v){continue}
             if(o.hasOwnProperty(k)){
                 if(typeof(v)=="function"){
                     v=v.toString()
                 }
                else if( typeof(v)=="object"){
                     v=_fixjson(v)
                }
             }
             if(v!==o[k]){o[k]=v}
         }
        return o
    }
    function _parse(v){
          if(!v||typeof(v)=="object"){return v}
        if(typeof(v)=="string"&&(v.charAt(0)=="{"||v.charAt(0)=="[")){
            var s=v;
            try{
                v=JSON.parse(v)}catch (e){
                try{v=(1,eval)(v)}catch (e){
                    v={data:s}
                }
            }
        }
        return v
    }
    function request(ev,target){
        var d=_parse (ev.data),id=d._id,SSC=d.SSC,data;
        var kys=Object.keys(d).filter(function(it){return it!="_id"&&it!="SSC"})
        if(kys.length==1&&kys[0]=="data"){ data=d.data
        } else{data=d}
        this.target=target
        this.event=ev
        this.data=data
        this.id=id
        this.SSC=SSC
        this.type=d.type||data.type||ev.type
        this.createResponse=function(data){
            if(typeof(this.target.postMessage)=="undefined"&&typeof(postMessage)!="undefined"){this.target.postMessage=postMessage}
            return {_id:this.id,SSC:this.SSC,data:data}
        }
        this.respond=function(res){
            target.postMessage (this.createResponse(res))
        }
    }
    function iframerequest(ev,target){
        request.call(this,ev,target)
        this.isiframe=true
        this.respond=function(res){
            this.event.source.postMessage(this.createResponse(res),"*")
        }
    }
    function makeRequest(ev,target,type){
         if(type=="iframe"){
           return new iframerequest(ev,target)
         } else{
             return new request(ev,target)
         }
    }
    function evData(d1){

        var d=_parse (d1),id=d._id,SSC=d.SSC,data;
        var kys=Object.keys(d).filter(function(it){return it!="_id"&&it!="SSC"})
        if(kys.length==1&&kys[0]=="data"){
            data=d.data
        } else{data=d}
         return {
            id:id,SSC:SSC,data:data,type:d.type
        }
    }
var isworker = typeof(window)=="undefined"  ,hasWorker= typeof(Worker) !=="undefined"
var contexturl=location.href.split("/").slice(0,4).join("/")+"/",supportsStructuredCloning=null
    var isiframe=(this.location && this.top&&this.top!==self)
 var tmpltworkerurl=""
    if(!isworker){
       var s=[].filter.call(document.querySelectorAll("script[src]") ,function(a){return a.src.toLowerCase().indexOf("workerproxy")>=0})[0]
        if(s){tmpltworkerurl=s.src}
    }
function wrkr(){
    var _mthdcache={},NILL={NILL:1} ,_data={},
        target=!(isworker||isiframe)?new eventTarget():self ,propertyupdateReq={req:null}
      function sendmessage(msgid,data,source){
            var resp={_id:msgid,SSC:supportsStructuredCloning,data:data}
            if(!supportsStructuredCloning){resp=JSON.stringify(resp)}
          if(isiframe) {
              if(source){source.postMessage (resp,"*")}

          }   else{
              if(typeof(target.postMessage)=="undefined"&&typeof(postMessage)!="undefined"){target.postMessage=postMessage}
               target.postMessage (resp)
          }
    }

    function processmessage(ev){
      var d=evData(ev.data),data=d.data,r=NILL   ,msgid=d.id,ssc=d.SSC;
        var req=makeRequest(ev,target,isiframe?"iframe":(isworker?"worker":""))
        try {
            if(data.init) {    if(typeof(data.init)=="object"){supportsStructuredCloning={SSC:1}}
                //sendmessage(msgid,{ready:{SSC:supportsStructuredCloning}},ev.source)
                req.respond({ready:{SSC:supportsStructuredCloning}})
            }
            if(data.definitions) {
                var df=_unfixjson(data.definitions)
                for(var k in df) {
                    if(df[k]&&(typeof(df[k]) == "function")) {
                        target[k]=df[k];
                    }else {     var savedreq=req;
                        Object.defineProperty (target, k, (function(nm, holder){
                                return {
                                    set: function(v){
                                        var old=holder[nm],rq=propertyupdateReq.req||savedreq;
                                        if(req==savedreq){req.id=null;}
                                        holder[nm]=v;
                                        //sendmessage (0,{type: "propertychange", name: nm, value: v, oldValue: old},src)
                                        propertyupdateReq.req&&propertyupdateReq.req.respond({type: "propertychange", name: nm, value: v, oldValue: old})
                                    },
                                    get: function(){
                                        return holder[nm]
                                    },
                                    configurable: true
                                }
                            }) (k, _data));
                    }
                }

            }
            if(data.Eval||data.cmd == "Eval") {
                var expr=data.Eval||data.expr
                if(typeof(expr) == "string") {
                    r=(1,eval)(expr)
                }
            }
                if(data.import||data.cmd=="import"){   var url=data.url||data.import
                    if(typeof( url) == "string"||Array.isArray ( url)) {
                        var lst=[].concat ( url),pnding=lst.slice() ,evsrc=ev.source
                        if(target.importScripts) {
                            target.importScripts.apply (target, lst)
                            //sendmessage( msgid,{loaded:lst},evsrc)
                            req.respond({loaded:lst})
                        }else if(typeof(document) != "undefined") {
                             var d=document, h=d.head||d.querySelector ("head")||(([].slice.call (d.querySelectorAll ("script[src]")).pop ())||{}).parentNode||d.body
                            if(h) {
                                lst.forEach (function(it){
                                    if(typeof(it) == "string") {
                                        var scr=d.createElement ("script")
                                        scr.onload=function(){var idx=pnding.indexOf(it);idx>=0&&pnding.splice(idx,1)
                                            if(!pnding.length){
                                                //sendmessage( msgid,{loaded:lst},evsrc)
                                                req.respond({loaded:lst})
                                            }
                                        }
                                        h.appendChild (scr).src=it
                                    }
                                })
                            }
                        }
                    }
                }
                if(data.cmd ) {
                    var cx=target, cmd=String (data.cmd),nm = cmd
                    if(cmd !== "import") {
                        if(_mthdcache[data.cmd]){cmd=_mthdcache[data.cmd]}
                        else {
                            if(cmd.indexOf (".")>0) { var arr=cmd.split (/\./)
                                nm=arr.pop();
                                cx=arr.reduce (function(m, it){ if(m) { cx=m; return m[it]} return m }, self)||
                                    arr.reduce (function(m, it){  if(m) { cx=m; return m[it]} return m }, target)
                            } else{
                                if(cmd=self[cmd]){cx=self}
                                else if(cmd=target[cmd]){cx=target}
                            }
                            cmd={cx:cx,fn:nm}
                            if(cx&& typeof( cx[nm] ) == "function") {
                                _mthdcache[data.cmd]=cmd
                            }
                        }
                        if(cmd&&cmd.cx&&cmd.fn) {
                            if(typeof( cmd.cx[cmd.fn] ) == "function") {
                                var a=[].concat (data.args||[]),f=cmd.cx[cmd.fn]
                                r=f.apply (cmd.cx, a)
                            } else{
                                if(data.args&&data.args.value){
                                    r=cmd.cx[cmd.fn] =data.args.value
                                }

                            }

                        }
                    }
             }
            if(r!==NILL){
                //sendmessage( msgid,r,ev.source)
                req.respond(r)
            }
        } catch(e){
            //sendmessage(msgid,{error:true,message:copy(ev,{})},ev.source)
            req.respond({error:true,message:copy(ev,{})})
        }
      }

    if(!(isworker||isiframe)){     return target;}
    else {
        if(isiframe){
            onmessage = this.onmessage =  processmessage ;
            /*(function(ths){
                var nativepostmessage=typeof(postMessage)=="function"?postMessage:ths.postMessage
                ths.postmessage=function(d){nativepostmessage(d,"*")}
            })(self);*/
         }
        else{onmessage =  processmessage     }
    }
 }


    var types={worker:1,iframe:2,eventtarget:3}
  function proxy(optns,loading){
      optns=optns||{}
      if(typeof(optns)=="string"){optns={url:optns}}
      else if(typeof(optns)=="function"){optns={callback:optns}}
      else{
          if(!(optns&&typeof(optns)=="object")){optns={}}
      }
      var use=null//worker,iframe,eventtarget
      if(optns.use=="worker"&&!hasWorker){optns.use=null}
      if(!optns.use){
          if(hasWorker&&!optns.iframe){optns.use="worker"}
          else {optns.use="iframe"}
      }
      var idMap={},url=optns.url
      if(loading!==true&&typeof(eventTarget)=="undefined"){
          var scr=(document.head||document.body).appendChild(document.createElement("script"))
          scr.onload=function(){
              setTimeout(function(){proxy(optns,true)},100);
          }
          scr.src=tmpltworkerurl.replace(/workerproxy/i,"eventtarget")
                     return
      }
      var target=new eventTarget(),worker=null ,_postMessage=function(data){worker.postMessage(data)}
      function workeronmsg(ev){
          var d=evData(ev.data),data=d.data
           if(d&&d.id&&idMap[d.id]) {
              idMap[d.id].call (target, d.data == null ? d : d.data)
              delete idMap[d.id]
          }else if(typeof(d.type) == "string") {
              target.fire (d.type, data)
          }else {
              target.fire ("message", d)
          }
      }
      function _setup(){
          var _data={}
          target.postMessage=function(data,callback){
              if(data==null){return}
              if(data.definitions){ if(typeof(data.definitions)=="function"){
                  var fn=data.definitions;data.definitions={};
                  data.definitions[fn.name||fn._name]=fn
              }
                  var d=copy(data.definitions,{}) ,ths=this
                  Object.keys(d).forEach(function(k){
                      if(typeof(d[k])=="function"){
                          target[k]=function(){ var a=[].slice.call(arguments),callback;
                              if(a.length&&typeof(a[a.length-1])=="function"){callback=a.pop()}
                              var _id=+new Date();
                              if(callback){idMap[_id]=callback}
                              this.postMessage({_id:_id,cmd:k,args:a})

                          }.bind(ths)
                      }   else{
                          Object.defineProperty (target, k, (function(nm, holder){
                              return {
                                  set: function(v){ holder[nm]=v;
                                      this.postMessage ({cmd: nm, args:{value: v}})
                                  },
                                  get: function(){ return holder[nm] },
                                  configurable: true
                              }
                          }) (k, _data));
                      }
                  })
                  data.definitions=_fixjson(copy(data.definitions,{}))
              }
              data._id=data._id||+new Date();
              if(callback){
                  idMap[data._id]=callback
              }
              _postMessage(data)
          }


          target.define=function(data){if(!data){return}
              this.postMessage(data.definitions?data:{definitions:data})
              return this;
          }
          target._worker=worker
          var cb=optns.callback
               target.postMessage({init:{x:1}},function(){
                   if(url){
                       target.postMessage({import:url},cb )
                   }
                   else if(cb){cb.call(target)   }
               } );


       }
      function _setupIframe(ifr){
          worker=ifr.contentWindow||ifr.contentDocument.defaultView;//wrkr()
          _postMessage=function(data){
              worker.postMessage (data, "*")
          }
          worker._frame=ifr;
          window.addEventListener ("message", function(ev){
              if(ev.source === worker) {
                  workeronmsg (ev);
              }
          }, false)
          _setup ()
      }
      if(optns.use=="worker") {
          worker=new Worker (tmpltworkerurl)
          worker.onmessage= workeronmsg
          _setup ()
       } else {
          if(optns.iframe&&!optns.iframe.contentDocument){optns.iframe=null}
          var ifr=optns.iframe
          if(!ifr) {
              optns.iframe=ifr=document.createElement ("iframe")
              ifr.onload=function(){
                  this.onload=null;
                  _setupIframe(ifr)
              }
              ifr.src=contexturl + "html/iframebase.html"
              document.body.appendChild (ifr)
          } else{
              _setupIframe(ifr)
          }
      }
      target._worker=worker
      return target;

  }
   if(isworker||isiframe){
        wrkr()
  } else {
      scope.makeWorker=proxy
  }



})(self)
