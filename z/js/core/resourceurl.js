/**
 * Created by Atul on 11/23/2014.
 */
self.ResURL= (function(){
         var root = null,loc = null,isstore=false
        function remSlash( path,which){ //0 - both, 1 = left, 2 - right
            if(!path){return ""}
            var re=/^\/|\/$/g
            if(which){re=which==1?/^\//:/\/$/}
            return String(path).replace(re,"")
        }
    function _decode(v){if(!v){return ""}
        return String(v).replace(/%3D/g,"=").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%7B/g,"{").replace(/%7D/g,"}").replace(/%3A/g,":").replace(/%22/g,'"').replace(/%20/g,' ')
            .replace(/^"|"$/g,"").replace(/^"|"$/g,"").trim()
    }
    function _encode(v){if(!v){return ""}
        return  v
    }
    function parseString(o,data){
        return _decode(o).split("&").reduce(function(m,a){var arr= a.split("=")
            if(arr.length>1){m.push(a)}
            return m
        },data)
    }
    function toQStr(o,deep){
        if(!o){return ""}
        var dat=(o)  ,data=[];
        if(dat&&typeof(dat)=="object"){

            Object.keys(dat).forEach(function(k){
                if(String(k).indexOf("promise")>=0){return}
                var d=dat[k]
                if(d!=null&&!isNaN(+d)){d=  +d }
                if(d && typeof(d)=="object"&& d instanceof Date){
                    d=+d
                }
                if(!d||typeof(d)!="object"){d= String(d)}
                if(d.toJson||d.toJSON){d= (d.toJson||d.toJSON)()}
                else{
                    var mp=d.toMap?d.toMap(true):d
                    d= deep?_ser(mp):JSON.stringify(mp)
                }
                data.push(k+"="+_encode(d ));
            })
        }  else{
            if(typeof (dat)=="string"){
                parseString(dat,data)
            }
         }
        return  data.join("&");
    }
    var _cache={}
    var _ctxProps=["scheme","protocol","port","host","hostname","isfile","contextPath","contextUrl","isCrossSite","origin","hostip"];
    var _nonctxProps=["path","file","search","search","hash"],
        keys = ['source', 'scheme', 'host', 'userInfo', 'user', 'pass', 'hostname', 'port',
            'relative', 'pathname', 'directory', 'file', 'query', 'hash'
        ];
    var  parser = {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional
    };
    function _parse(url){
        var query
        if(!/^(http|file)/i.test(url)){
            url=remSlash(url)
            if(root){
                if(root.contextPath && url.indexOf(root.contextPath)==0){
                    url=remSlash(url.substr(root.contextPath.length))
                }
                url=root.contextPath?[root.hostname,remSlash(root.contextPath),url].join("/"):[root.hostname,url].join("/")
            }
        }
        var parts=parser["loose"].exec(url) , uri = {}, i = 14;

        while (i--) {
            if (parts[i]) {
                uri[keys[i]] = parts[i];
            }
        }
        query = uri[keys[12]] || '';
        uri.args={}
        query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(a, nm, val) {
            if (nm) {
                uri.args[nm] = val;
            }
        });
        if(!uri.hostname && root){
            uri.hostname=root.hostname
            uri.port=root.port
            uri.scheme=root.scheme
            uri.contextPath=root.contextPath
            uri.contextUrl=root.contextUrl
        }
        if(uri.hostname){
            if(uri.port){
                uri.host=uri.hostname+":"+uri.port
            } else{uri.host=uri.hostname}
            if(/\d{2,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(uri.hostname)){
                uri.hostip=uri.hostname;
            }
        }
        if( uri.scheme){
            uri.protocol=uri.scheme+":"
        }
        uri.path=remSlash(uri.pathname||"")
        uri.host=remSlash(uri.host||"")
        if(uri.host){
            uri.origin=uri.protocol+"//"+uri.host
        }
        delete uri.source;
        return uri;
    }
        function ctor(str1,ctx ){
            Object.defineProperty(this,"hash", {
                get:function(){
                    return this.__hash||(this.__hash="");
                },
                set:function(val) {
                    if(val && typeof(val)=="string"){
                        if(val.charAt(0)=="#"){val=val.substr(1)}
                        this.__hash=val
                    }
                },enumerable:true,configurable:true
            });
             Object.defineProperty(this,"search", {
                get:function(){
                    return this.__search=this.args?toQStr(this.args):"";
                },
                set:function(val) {
                    this.updateArgs(val);
                 },enumerable:true,configurable:true
        });
            Object.defineProperty(this,"path",{
                get:function(){return this.__path||(this.__path="");},
                set:function(val){
                    var str1 = remSlash(val)
                    str1 = str1.replace(/\\/g, "/")
                    var lastisslash = str1[str1.length - 1] == "/"
                    str1 = remSlash(str1)
                    var arr=[],str=str1;
                    if(str1.indexOf("//")>=0){
                        arr = str1.split(/\/\//)
                        str = arr.pop();
                        this.scheme = arr[0] || ""
                    }
                    if(str1.indexOf("#")>=0) {
                        arr = str.split("#");
                        str = arr.shift();
                        this.hash = arr.join("#");
                    }
                    if(str1.indexOf("?")>=0) {
                        arr = str.split(/\?/);
                        str = arr.shift();
                        this.search = arr.join("?")
                    }

                    var path=remSlash(str),host,p=remSlash(str)
                    if(/^\w[\w\.:]+\/?$/.test(str)) {
                       host = str
                    } else if(!this.host){
                        arr= p.split("/")
                        host = arr.shift() || "";
                        path = remSlash(arr.join("/"))
                    }


                    if(this.host && path.toLowerCase().indexOf(this.host.toLowerCase())==0){
                        path=path.substr(this.host.length)
                    }
                    else if(host && !this.host){
                        this.host=remSlash(host);
                    }
                    if (!lastisslash && path) {
                        arr = path.split("/");
                        this.file = remSlash(arr.pop());
                        path = arr.join("/")
                    }
                    if(path && root){
                        var first= path.split("/")[0]
                        if(root.contextPath && this.host==root.host && first==root.contextPath){
                            var arr=path.split("/");arr.shift()
                            path=arr.join("/")
                            if(!root.contextUrl){
                                root.contextUrl=root.host+"/"+(root.contextPath?(remSlash(root.contextPath)+"/"):"")
                            }
                            this.contextUrl=root.contextUrl
                        }

                    }


                    this.__path=remSlash(path);
                },
                enumerable:true,configurable:true
            })
            this.init(str1,ctx)

        }

        ctor.prototype={
            scheme: null, host: null, contextPath: null, contextUrl:null,search: null,hash: null,isCrossSite:null,"file":null,args:null,
            hostname: null,url:null,pathname: null,port: null,protocol: "http:",hostip:null,origin:null,
            init:function(str1,ctx){
                if(ctx){this.contextPath=remSlash(ctx)}
                this.url=str1||""
                 this.hash=this.search=this.scheme=this.host=this.path=this.file="";
                this.args={};
                this.url=str1||""
                if(str1===false){return}


                this.inspect()
            },

            inspect:function(){
                var str1=this.url;
                var parts=_parse(str1)
                for(var k in parts){
                    if(k in this && typeof(parts[k])!=="function"){
                        this[k]=parts[k]
                    }
                }
                this.args=this.args||{};

                if(str1 && !root&&str1.toLowerCase().indexOf("file:")>=0){
                    this.isfile=true
                    //if(location.href.indexOf("index.html")>0){
                    var path=location.href.split("/")
                    path.pop();
                    this.host=path.join("/")
                    //}
                    return
                }
                 if(root&&this.origin!=root.origin){
                     if(this.hostip && !(this.hostip==root.hostip && this.port==root.port)){
                         this.isCrossSite=true
                     } else if(!this.hostip){
                         this.isCrossSite=true
                     }
                  }
             },
            update:function(obj){
                if(obj&&typeof(obj)=="object"){
                    for(var k in obj){
                        if(obj.hasOwnProperty(k)&&k in this&&typeof(this[k])!="function"){
                            if(k=="args"){this.updateArgs(obj[k])}
                            else{this[k]=obj[k]}
                        }
                    }
                } else if (typeof obj =="string"){
                    this.inspect(obj)
                }
                return this;
            },
            updateArgs:function(val,extnd){
                if(!extnd || val===false){this.args={}}
                 if (!val) { return}

                this.args=this.args||{};
                if (typeof val=="string") {
                     if(val.charAt(0)=="#"){val=val.substr(1)}
                      String(val).split("&").reduce(function (m, it) {
                        if (it) {
                            var ar = it.split("=");
                            m[ar.shift()] = decodeURIComponent(ar[0] || "")
                        }
                        return m;
                    }, this.args)
                } else if (typeof val=="object") {var args=this.args;
                    if(Array.isArray(val)){
                        val.forEach(function(k){args[k]=""})
                    }
                    else{
                        for(var k in val){
                            if(typeof(k)=="string"&&val.hasOwnProperty(k)){
                                if(k.indexOf("promise")==-1&& val[k]&&typeof(val[k])=="object"&&(Object.getPrototypeOf(val[k])!=Object.prototype||val[k].promise)){continue}
                                if(val[k]==null){continue}
                                args[k]=val[k]
                            }
                        }
                    }
                } else if (typeof val=="number") {
                    this.args.id=val;
                }

                return this
            },
            isFile:function(){
                return this.isfile
            },
            toString:function(){
                 return this.isfile?(this.contextUrl +this.path):(this.protocol+"//"+this.contextUrl +this.path)
            },
            cache:function(){_cache[this.toString()]=this },
            restorePath:function(){this.path=this.originalpath||this.path;return this },
            savePath:function(){
                if(this.originalpath==null){this.originalpath=this.path};return this
            },
            appendPath:function(part){
                var arr=[]
                if(arguments.length>1){arr=[].slice.call(arguments)}
                else{arr=[].concat(arguments[0]||[])}
                arr=arr.filter(function(a){return a.trim()})
                if(arr.length==1 && arr[0].indexOf("/")>=0){
                    arr=arr[0].aplit("/")
                }
                var thspath=(this.path||"").split("/");
                if(arr.length){
                    if(arr[0]=="."){arr.shift()}
                    while(arr[0]==".."){
                        arr.shift();
                        thspath.pop();
                    }
                }
                this.path=thspath.concat(arr).filter(function(k){return k.trim()}).join("/")
                return this
            },
            buildAbsPath:function(rootpath){ //this.contextPath+"/"
                if(this.isfile){return (this.contextUrl||"")+remSlash(this.buildPath(true,true))}
                return remSlash(rootpath)+"/"+remSlash(this.buildPath(true,true))
            },
            buildPath:function(noscheme,nohost){
                var res= [nohost===true?"":remSlash(this.contextUrl||this.host) ,remSlash(this.path),this.file].filter(function(it){return it &&it.trim()}).join("/")
                if(noscheme!==true && this.protocol && res.indexOf(this.protocol)!=0){
                    res=this.protocol+"//"+res
                }
                return res

            },
            build:function( force){
                if(force!==true && this.url && this.isFrozen){return this.url}
                var p=this.buildPath(),search
                var q=[]
                if(this.args&&Object.keys(this.args).length){
                    if(this.args && this.args.args){
                        var a=this.args.args;delete this.args.args;
                        if($.isPlain(a)){
                            $.extend(this.args,a)
                        }

                    }
                    for(var k in this.args){
                        if(k=="_userid"||k=="_clientid"){continue}
                        if(this.args.hasOwnProperty(k)){var v=this.args[k]||""
                            if(typeof(v)=="object"){
                                if(v instanceof Date){
                                    v=+v
                                } else{
                                    if(Object.keys(v).length){v=JSON.stringify(v)}
                                    else {continue}
                                }

                            }
                            q.push(k+"="+_encode( v))
                        }
                    }

                 };
                var arr= p.split("/"),ln=arr.length
                if(arr[ln-1]==arr[ln-2]){arr.pop();p=arr.join("/")}
                search=q.length?q.join("&"):""
                if(search){
                     p= p.replace(/\?+$/,"")+"?"+search
                }

                if(this.hash){p=p+"#"+this.hash}
                this.url=p;
                return p
            },

            copyContextProps:function(nu){if(!nu){return}
                for(var l=_ctxProps,ln=l.length,i=0;i<ln;i++){
                     if(this[l[i]]){nu[l[i]]=this[l[i]]}
                }
                return nu
            },
            isSame:function(nu) {
                if(!nu){return}
                var cnt=0
                for(var l=[].concat(_ctxProps,_nonctxProps),ln=l.length,i= 0,k;k=l[i],i<ln;i++){
                     if(k && k in nu ){
                        var v=String(nu[k]||"")
                        if(k=="search"&&v&v.charAt(0)=="?"){v= v.substr(1)}
                        if(v!=this[k]){return}
                    } else{cnt++}
                }
                return cnt>0;
            },
            copyPropsOf:function(nu){if(!(nu&&(typeof nu=="object"))){return}
                for(var l=[].concat(_ctxProps,_nonctxProps),ln=l.length,i= 0,k;k=l[i],i<ln;i++){
                    if(k && k in nu ){
                        var v=String(nu[k]||"")
                        if(k=="search"&&v&v.charAt(0)=="?"){v= v.substr(1)}
                        else if(k=="hash"&&v&v.charAt(0)=="#"){v= v.substr(1)}
                        if(v){this[k]=v}
                     }
                }

                return this
            },
            copyProps:function(nu){if(!nu){return}

                for(var l=_nonctxProps,ln=l.length,i=0;i<ln;i++){
                     nu[l[i]]=this[l[i]]
                }
                return nu
            },
            clone:function(full){
                var nu=new ctor(false);
                this.copyContextProps(nu)
                    if(full){this.copyProps(nu)}
                return nu
            },
            relativeURL:function(path){
                var url=path;
                if(!/^(http|file)/i.test(url)){
                    url=remSlash(url)
                    url=this.savePath().appendPath(url).build(true)
                    this.restorePath()
                  }
                return url;

            },
            parent:function(mutate){
                var nu=mutate===true?this:this.clone()
                if(nu.path){var arr=nu.path.split('/');arr.splice(-1,1);nu.path=arr.join("/")}
                return nu
            },
            resolve:function(part){
                var nu,lastisslash
                if(!part||part=="."){ return this}
                if(part.indexOf("//")==0){part=this.protocol+part}
                if(/^\w[\w\.:]+\/?$/.test(part)){
                    part="http://"+part
                }
                if(part.indexOf("http")==0){
                    nu=new ctor(part)
                    var first=nu.path.split("/")[0]
                    if(this.contextPath&&first==this.contextPath){
                        var arr=nu.path.split("/");arr.shift()
                        nu.path=arr.join("/")
                        this.copyContextProps(nu)

                    }
                    if(nu.host!=this.host ){
                        nu.isCrossSite=true
                    } else{nu.isCrossSite=false}
                } else {
                    nu=this.clone()
                    var path=remSlash(part)
                    if(this.contextPath && path.split("/")[0]==this.contextPath){path=this.contextPath}
                    var nupart=path||"",ctxarr=String(this.path||"").split(/\//)
                    while(nupart.indexOf("..")==0){
                        ctxarr.pop()
                        nupart=remSlash(nupart.substr(2) )
                    }
                    if(nupart.indexOf(".")==0){nupart=nupart.substr(1)}
                    nu.path=remSlash(remSlash(ctxarr.join("/") )+"/"+nupart.trim())

                  }
                if(nu.isCrossSite&&(nu.host==this.host||(ResURL.getRoot()&&nu.host==ResURL.getRoot().host))){
                    nu.isCrossSite=false
                }
                return nu
            },
            load:function(callback,options){
                var opts={}
                if(callback&&typeof(callback)!="function"){options=callback;callback=null}
                if(options===true){opts.sync=true}
                else if(options&&typeof(options)=="object") {opts=options}
                opts.onerror=function(){ }
                return $.xhr.get(this ,opts,callback)
                //return $.xhr.jsonp(this ,opts,callback)
            },
            fixUrl:function(u){
                var url=u||this.build()
                if(location.href.indexOf(url)>=0&&self.app&&self.app.contextPath&&url.indexOf(app.contextPath)==0){
                   // url=url.substr(app.contextPath.length).split("?")[0]
                }
                var urlarr=url.split("#")
                if(!/\.\w{2,5}/.test(urlarr[0])){var p=urlarr[0]
                    var uid="",cid=window.CLIENTID
                    if(typeof(app)!="undefined" && app.user){uid=app.user.id}
                    if(uid || cid) {
                        if (p.indexOf("&") > 0||p.indexOf("?") > 0) {
                            p = p + "&_clientid=" +cid+ "&_userid=" +uid
                        }
                         else {
                            p = p + "?_clientid=" + cid + "&_userid=" + uid
                        }
                        urlarr[0]=p
                    }
                    url=urlarr.join("#");
                }

                return url
            },
            setDom:function(dom){
                var t=String(dom.nodeName||dom.tagName).toLowerCase() ,url=this.fixUrl()
                if(dom instanceof CSSStyleDeclaration){  dom.backgroundImage="url("+url+")"  }
                else if("href" in dom){dom.href=url}
                else if("src" in dom){dom.src=url}
                if(t=="img"||t=="script"||t=="iframe"){dom.src=url}
                else if(t=="link"){dom.href=url}
                if(t=="script"){dom.type=dom.type||"text/javascript"}
                else if(t=="link"||t=="css"){dom.type=dom.type||"text/css";dom.rel=dom.rel||"stylesheet"}
                if(dom&&dom.tagName)
                    return this
            },
            freeze:function(){
                if(this.isFrozen){return}
                Object.freeze&&Object.freeze(this)
                this.isFrozen=true
                return this;
            },
            restore:function(name,savecurr){
                if(!this._log){return}
                var entry;
                if(name){
                    var idx
                    for(var l=this._log,ln= l.length,i=ln- 1,lg;lg=l[i],i>=0;i--){
                        if(lg && lg.name==name){
                            entry=lg;
                            idx=i;
                            break;
                        }
                    }
                    if(idx>=0){this._log.splice(idx,1)}
                } else {
                    entry=this._log.pop();
                }

                if(entry){
                    if(savecurr){
                        this.save()
                    }
                    this.copyPropsOf(entry.data)
                }

                return entry;
            },
            toMap:function(full){
                var map={};
                full?this.copyProps(map):this.copyContextProps(map)
                map.url=this.build()
                return map;
            },
            save:function(name,memo){
                this._log=this._log||[]
                var map=this.toMap()
                name=name||map.url;
                var entry={name:name,data:map,memo:memo}
                this._log.push(entry)
                return entry
            },
             insert:function(optns){
                var promise,url=this.fixUrl(),nocache=false
                 var config={}
                 if(optns!=null) {
                     if (typeof(optns) == "boolean") {
                         config.nocache = optns;
                     }
                     else if (typeof(optns) == "string") {
                         config.type = optns;
                     }
                     else if (typeof(optns) == "function") {
                         config.callback = optns;
                     }
                     else if (typeof(optns) == "object") {
                         $.extend(config,optns);
                     }
                 }
                var type=config.type||this.type
                if(!config.nocache&&_cache[url]){
                    promise=_cache[url]
                    typeof(config.callback) =="function"&&promise.then(config.callback)
                    return promise
                }

                promise=Promise.deferred();
                typeof(config.callback) =="function"&&promise.then(config.callback)
                var tag= "script"
                if(!type){
                    if(!this.ext){
                        if(this.file){
                            this.ext=this.file.split(/\./).pop();
                        }
                    }
                    if(this.ext){
                        type=this.ext
                        this.type=this.type||this.ext
                        if(this.ext=="htm"){this.type="html"}
                    }

                }
                if(type=="html"||(this.ext=="html")){tag="html"}
                else if(type=="css"||(this.ext=="css")){tag="link"}
                else if(type=="js"||(this.ext=="js")){tag="script"}
                if(tag=="html"){
                    this.load(tag,function(r){
                        if(r&&dom&&dom.appendChild){
                            r=dom.appendChild(r)
                        }
                        promise.resolve(r)
                    },true)
                }
                else{
                    var nu,par=document.head||document.querySelector("head")||document.body
                    if(config.before||config.replace){
                        par=$d.parent(config.before||config.replace)||par
                     }
                    nu=par.appendChild(document.createElement(tag))
                     nu.onload=function(){promise.resolve()}
                    this.setDom(nu);
                }
                _cache[url]=promise;
                return promise;
            }
        }

        var api= {
            parse:_parse,
            make:function(u,base,forroot){
                if(!forroot && !root){
                    /*if(location.href.toLowerCase().indexOf("file://")>=0){
                        root=new ctor(location.href)
                    }*/
                    if(self.app&&self.app.contextPath){
                        var p=self.app.contextPath.substr(self.app.contextPath.indexOf("//")+2).split(/\//)
                        root=this.make(self.app.contextPath,p[0]||"",true)
                    } else{

                    }

                }
                if(u&&typeof(u)=="object") {
                    if (u instanceof ctor) {
                        return u
                    } else{var url=u.href||u.src||u.url
                       var nu= new ctor(url)
                        if(!url){nu.copyPropsOf(u);}
                        nu.inspect()
                        return nu;
                    }
                }

                if(!u || u=="/"){return root}
                if(u && _cache[u]){
                    return _cache[u]
                }

                if(root ){

                     return root.resolve(u)
                }
                return new ctor(u,base)
            },
            isURI:function(u){return (u&&typeof(u)=="object" && u instanceof ctor)},
            getRoot:function(){
                //if(root && root.isFile && !root.contextPath)
                return root
            },
            getWinLocation:function(){
                if(!loc && self.location){loc=api.from(location);}
                return loc
            },
            setRoot:function(path,ctx){
                if(root&&root.isFile()){
                    return root
                }

                root=this.make(path,ctx,true)
                if(!root.contextPath){
                    if(root.file && root.file.indexOf(".")==-1){
                        root.contextPath=root.file;
                        root.file="";

                    }
                }
                if(loc){
                    if(loc.host!=root.host){
                        var contextPath=root.contextPath,contextUrl=root.contextUrl
                        loc.copyContextProps(root);
                        root.contextPath=contextPath;
                    }
                }
                if(root.contextPath){
                    var rt=remSlash(root.host),cx=remSlash(root.contextPath);
                    if(rt.split("/").pop()==cx){
                        var arr=rt.split("/");arr.pop();
                        rt=arr.join("/")
                    }
                    root.contextUrl=rt+"/"+cx+"/"
                }

                root.freeze();
                return root
            }
        }
        api.from=api.make
   /* if(location.href.toLowerCase().indexOf("file:")>=0){
        root=new ctor(location.href)
    }*/
    api.ResourceURL= function(url){ return api.from(url).build()}
    loc=api.from(location);
    loc.freeze();
    if(typeof(ZModule)!="undefined"){ZModule.ResourceURL=api.ResourceURL}
    return api

})();