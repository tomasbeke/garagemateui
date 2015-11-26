/**
 * Created by atul on 3/9/14.
 * history.replaceState()
 * window.onpopstate
 * history.pushState(stateObj, "page 2", "bar.html");
 */
!function(ns,factory){

  if(typeof(ZModule)!="undefined"){
      ZModule.getWrapper(ns).resolve(factory())
  }

}("$.router",function(){
        var _listeners=null,currenturl=null,baseUrl=null,useHistory=false//typeof(self.history)!="undefined"
        function _getBaseUrl(){
            if(self.app){baseUrl=self.app.contextPath}
            if(!baseUrl){
                var ori=location.origin||(location.protocol+"://"+location.hostname+(location.port?(":"+location.port):""))
                baseUrl=ori+"/"+location.pathname.substr(1).split("/").shift()  +"/"
            }
            return baseUrl
        }
        function _resolveUrl(url0){
            var url=String(url0)
            if(!url||url=="/"||url=="root"){url=_getBaseUrl()}
                else if(url.indexOf("#")==0){
                    return location.href.split(/\#/).shift()+url
                } else{var basenoproto=_getBaseUrl().toLowerCase().replace(/^http[s]?:\/\//i,"")
                    var urlnoproto=url.toLowerCase().replace(/^http[s]?:\/\//i,"")
                    if(urlnoproto.indexOf(basenoproto)>=0){
                        url=_getBaseUrl()+urlnoproto.substr(basenoproto.length)
                    } else{if(url.indexOf("/")==0){url=ur.substr(1)}
                        url=_getBaseUrl()+url
                    }

                }
            return url
        }
        function _getHash(){
            return _fix(location.hash)
        }
        function _setHash(s0){
            var s=_fix(s0)
            if(s==_getHash()){return}
            location.hash=s
        }
    function _dispatch(h){
        if(currenturl===location.href){
            return
        }
        currenturl=location.href

         _listeners.dispatch(h) ;
    }
    function _onHashChange(fn){
        if(!_listeners){
            _listeners= $.callbacks()
            var ths=this
             window.addEventListener("hashchange",
                function(){
                    setTimeout(function(){
                        var h=_getHash()
                        _dispatch(h)
                    },10)
                })
            window.onpopstate =function(ev){
               var data=ev.state
                if(!(data&&data.name)){return}
                setTimeout(function(){_dispatch(data.name||data.url)},10);
            }
         }
        if(typeof(fn)=="function"){_listeners.add(fn)}
    }
        function _fix(s){
                return String(s).replace(/^#[\/]?/,"").trim()
        }

    return function(ctx){
         var routes={},currenthash=null,_ctx=ctx||null;
         var api={
             _locationHashChanged:function locationHashChanged(hash0) {
                 var h=_fix(hash0)
                 if(currenthash==h){return}
                 this.route(h)
            },
             hasPath:function(nm){
                 return routes[String(nm).toLowerCase()];
             },
            getCurrentPath:function(){
                  return currenthash;
            },
            getLocationArgs:function(){
                var srch=location.search,args={};
                if(srch){
                    args=srch.replace(/^\?/,"").trim().split("&").reduce(function(m,k){
                        if(k){
                            var arr=k.split("=")
                            m[arr.shift()]=arr.pop()||"";
                        }
                        return m
                    },{})
                }
                return args
            },
            add:function(path,handle0,data){var handle=handle0
                if(arguments.length==1){
                     if(path){data=path;}
                    path=data.name||data.url
                }
                data=data||{}
                if(handle0&&typeof(handle0)=="object"){data=handle0}
                else if( handle0 ){data.handle=handle0}
                data.name=path;
                 if(path&&typeof(path)=="string" ){
                     routes[path.toLowerCase()]=data
                 }
                 return this
             },
             watchHashChange:function(){
                 _onHashChange(this._locationHashChanged.bind(this))
             },
             getHash:function(){
                return _getHash()
            },
             normaiseHash:function(path){
                 return String(path||"").replace(/^\#[\/]?/,"")
             },
             pushState:function(data,nonav){
                 var path
                 if(typeof(data)=="string"){
                     path=data;
                     data=null;
                 } else if(data){
                     path=data.path||data.name||data.url
                 }

                 if(!path||path=="undefined"){
                     return
                 }

                 var curr=this.hasPath(path)
                 if(curr){
                     if(this.getHash()==path){
                         return
                     }
                     if(data && typeof(data)=="object" ){
                         $.extend(curr,data);
                     }
                 }
                 else {data=data||{}
                     data.name=path
                     data.url=_resolveUrl (data.url||path)
                 }
                 if(!useHistory){
                     path=_fix(path)
                    // if(path.indexOf("#")!=0){path="#"+path}
                       if(nonav===true){currenthash= path }
                     _setHash(path)
                 }
                 if(!curr){
                     this.add(data )
                 }
                 if(useHistory && history.pushState){
                     if(history.state&&history.state.url===data.url){return}
                     history.pushState(data, data.title||data.name, data.url);
                 }
             },
             setHash:function(s){
                 _setHash(s)
             },
             sync:function( ){
                 if(currenthash!=this.getHash()){
                    this.route(this.getHash())
                 }
             },
             on:function(fn){_listeners.add(fn)},
             isCurrent:function(p){
                  return (p&&p==this.getHash())
             },
             route:function(path){
                 var a=[].slice.call(arguments,1),ret
                if(path=="back" && typeof(history)!="undefined"){
                    history.back()
                    return
                }
                 var p=this.hasPath(path)
                 if(p) {
                     var hash=_fix(p.name)
                     if(!p||(currenthash == hash)||(p.url&&p.url === currenturl)) {
                         return  this
                     }
                     currenthash=hash;
                     //if(typeof(p.handle)=="function"){
                     if(this.getHash()!=hash){
                         this.setHash(hash)
                     }
                     if(p.url){
                         currenturl= p.url;
                     }
                     if(p&&typeof(p.handle)=="function") {
                         if(a.length) {
                             p.handle.apply (_ctx, a)
                         }else {
                             p.handle.call (_ctx)
                         }
                     } else if(p&&p.handle=="load") {
                         $.xhr.get(p.url,{responseType:"html"})
                      }
                     if(_ctx&&_ctx.emitter&&typeof(_ctx.emitter.fireAsync)=="function"){
                         _ctx.emitter.fireAsync("viewchange",hash)
                     }
                     //}
                 }
                 this.fire(String(path) ,p||{name:path})



                 return this
             }
          }
        api.register=api.add

            $.emitter(api,true)
            return api
        }
    }
) ;

