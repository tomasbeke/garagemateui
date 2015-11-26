;(function(){
function ZModuleModel(ns,value,config){
this.init(ns,value,config)
}
    function resolveModule(data,promise){
        var modulefn,val=null;
        if(typeof(data)=="string" && /function\s*\(/.test(data)&& data.indexOf("module.exports")>0){
            modulefn=Function("module",data)

        }  else if(typeof(data)=="function"){
            var args=(data.toString().match(/^function[^\(]*\(([^\)]*)\)/)||[])[1]
            if(args && args.trim()=="module"){
                modulefn=data;
            }
        }
        if(modulefn) {
            var deflt = null, object = {_: {}}
            Object.defineProperty(object._, "exports", {
                set: function (a) {
                    deflt = a;
                    delete this.exports
                    if(promise && promise.resolve){
                        promise.resolve(a);
                    }
                } ,
                get: function () {
                },
                configutable: !0
            })
            modulefn(object._)
            val= deflt;
        }
   return val
    }
function resolveBootStrapped(ns,promise){
    var val=null;
    if(ns && typeof(ns)=="string" && typeof($) !="undefined" && $.getBootstrapData){
        var modulefn,
            data=$.getBootstrapData(ns,"modules")||$.getBootstrapData(String(ns).toLowerCase(),"modules")
        if(data){
            val=resolveModule(data,promise)
        }
    }
    return val;
}
ZModuleModel.prototype={
    init:function(ns,value,config){
        this.promise=Promise.deferred()
        this.config={}

        if(config){
            if(typeof(config)=="string"){
                this.config.url= config;
            } else if(typeof(config)=="function"){
                this.promise.then(config)
            } else if(typeof(config)=="object"){
                if(typeof(config.callback)=="function"){
                    this.promise.then(config.callback);
                    delete config.callback;
                }
                Object.assign(this.config,config)
            }

        }
        if(arguments.length>3 && typeof(arguments[3])=="function"){
            this.promise.then(arguments[3]);
        }
        this._value=null;

        if(typeof(ns)=="string"){
            if(ns.indexOf("/")>=0 ||ns.indexOf("{")>=0){
                if(!this.config.url){
                    this.config.url=ns;

                    ns=ns.replace("libs/","").replace(/\{resource\}/,"").replace(/\$resource/,"").replace(/^\//,"").trim()
                    if(ns!=this.config.url){
                        this.altNS=this.config.url;
                    }
                }

            }
            else if(ns.indexOf(".")>0){
                var arr=ns.split(".");
                var name=arr.pop()
                this.name=name
                this.path=arr.slice()
                this.container=arr.reduce(
                    function(m,k){
                        return m?m[k]:null
                    },self
                );
            }
            this.NS=ns;
            this.name=this.name||ns
        } else if(ns && (typeof(ns)=="object") && (ns.name||ns.ns)){
            this.NS=ns.name||ns.ns
            Object.assign(this.config,ns)
        }
        if(!this.config.url && typeof($) !="undefined" && $.getBootstrapData){
            var cachedTemplates=$.getBootstrapData("cachedtemplates")
            if(this.NS  && cachedTemplates && cachedTemplates[this.NS]) {
                if(typeof(cachedTemplates[this.NS])=="string"||Array.isArray(cachedTemplates[this.NS])){
                    this.config.url = cachedTemplates[this.NS]
                } else {
                    $.extend(this.config,cachedTemplates[this.NS] )
                }

            }
        }


        Object.defineProperty(this,"value",{get:function(){return this._value},set:function(v){
                 this.resolve(v)
            }})
        this.then= this.promise.then.bind(this.promise)
        if(value!=null){
            this.resolve(value)
        } else {
            this.inspect()
        }
     },
    resolve:function(value){
        if(value==null ){
            if(!this._inspecting) {
                this._inspecting = 1
                this.inspect()
            } else{
                value=this.inspectContainer()
            }
        }
        if(value != null){
            this._value=value;
            this._inspecting=0
            this.promise.resolve(value)
        }
        return this._value;

    },
    inspectContainer:function(){
        if(!this.container && this.path){
            this.container=this.path.reduce(
                function(m,k){
                    return m?m[k]:null
                },self
            );
        } else {
            if(self[this.NS]!=null){
                return self[this.NS]
            }
        }

        if(this.container && this.name){
            return this.container[this.name]
        }
    },
    isResolved:function(){
        return this.inspect()
    },
    inspect:function(){
        if(this._value ){return this._value}

        var data=this.inspectContainer()
        if(!data && typeof($) !="undefined" && $.getBootstrapData){
            data=$.getBootstrapData(this.NS,"modules")||$.getBootstrapData(String(this.NS).toLowerCase(),"modules")
            if(data){
                data = this.resolveContent(data)

            }
        }

        if(data){
            return this.resolve(data)
         } else {
            if(this._value==null && !this.config.url) {
                if (this.NS && !/\W/.test(this.NS)) {
                    if (typeof(app) != "undefined" && app.resourcelib) {
                        this.config.url = String(app.resourcelib).replace(/[\\\/]$/, "") + "/" + this.NS
                        var parts=this.config.url.split("/").pop().split(".")
                        if(parts.length==1){
                            this.config.url=this.config.url+".js"
                        }
                    }
                }
            }
        }
    },
    resolveDependancies:function(dependanciesarg,callback){
        dependanciesarg=dependanciesarg||this.config.dependancies || this.config.dependencies
        if( dependanciesarg){
            var dependancies=Array.isArray(dependanciesarg)?dependanciesarg:[dependanciesarg]
            this._depends=dependancies.map(function(a){ return ZModule.from(a)});
            var allpromises=this._depends.filter(function(a){ return !a.isResolved()}).map(function(a){return a.process();})

            if(allpromises.length){
                var promises=Promise.all(allpromises)
                promises.finally(callback)
                return promises
            }
        }
        callback()
    },
    resolveContent:function(data){
        var val=data,modulefn
        this.config.source=data
        var result=resolveModule(data,this.promise)
        if(result==null){
            if(typeof(data)=="string"){
                val=val.trim();
                var first=val.charAt(0)
                if(/function\s*\(/.test(val) || ((first=="{"||first=="]") && val[val.length-1]==first)){
                    try{
                        result=(1,eval)("("+val+")")
                    } catch(e){result=null}
                }
            }
        }



        return result
    },

    processUrl:function(callback){
        if(this.config.url){
            var url=this.config.url
            if(typeof(url)=="string" && (url=url.trim()) && (url.indexOf("libs/")==0||url.indexOf("$resource/")==0||
                url.indexOf("{resource}")==0)){
                if (typeof(app) != "undefined" && app.resourcelib) {
                    url = String(app.resourcelib).replace(/[\\\/]$/, "") + "/" + url.replace(/^libs\//,"")
                            .replace(/^\$resource\//,"")
                            .replace(/^\{resource\}/,"")
                            .replace(/^\//,"")
                    var parts=url.split("/").pop().split(".")
                    if(parts.length==1){
                        url=url+".js"
                    }
                }
                this.config.url=url;
            }
            var type=this.config.type||this.config.contenttype
            if(typeof(this.config.url)=="string" && !type){
                if(/\.css$/.test(this.config.url)){type=="css"}
                else if(/\.js$/.test(this.config.url)){type=="js"}
                else if(/\.html?$/.test(this.config.url)){type=="html"}
                else if(/\.partial?$/.test(this.config.url)){type=="html"}
                else if(/[\\\/]theme[\\\/]/.test(this.config.url)){type=="css"}
                else if(/[\\\/]js[\\\/]/.test(this.config.url)){type=="js"}
                this.config.type=type
            }

            var b = ResURL.from(this.config.url, type),content,url= b.fixUrl()
            if(type=="css"){
                b.insert().then(
                    function () {
                        this.inspect()
                    }.bind(this)
                );
            }
            b.load(function(data){
                if(!data){return}
                if(typeof(data)=="string") {
                    if (!type) {
                        if (data.indexOf("function(") >= 0) {
                            type = "js";
                        }
                    }
                    if (type == "js") {
                        if (data.indexOf("module.exports") > 0) {
                            content = this.resolveContent(data)
                            if (content) {
                                if (this.config.synccallback) {
                                    this.config.synccallback(content);
                                }
                                this.resolve(content)
                                return
                            }
                        } else {
                            b.insert().then(this.inspect.bind(this));
                            return
                        }
                    }
                }
                this.resolve(data)
            }.bind(this)
                ,{isresource:true,sync:true}
            )


        }
    },
    process:function(){
        if(this._processing || this.isResolved()){return}
        this._processing=1
        if(!this.inspect()){
            if(this.config.url){
                if(Array.isArray(this.config.url)){
                    this.resolveDependancies(this.config.url,function(){
                        var vals=null
                        if(this._depends){
                            vals=this._depends.map(function(a){return a.value})
                        }
                        this.resolve(vals)
                    }.bind(this))
                }
                else{
                    this.resolveDependancies(null,this.processUrl.bind(this))
                }
            }
        }
        return this
    }

}
ZModule=self.ZModule={};
ZModule._cached={}
ZModule.isResolved=function(ns){
    if(typeof(ns)=="string" && this._cached[ns]){
          return this._cached[ns]

    }
}
ZModule.from=function(ns,value,config,callback){
     if(Array.isArray(ns) && ns.every(function(a){return typeof(a)=="string"})){
        config=config||{}
        config.url=ns;
        ns=ns.join(";");
    }
    var nu
    if(typeof(ns)=="string"){
        if(this._cached[ns]){
            nu= this._cached[ns]
        }
    }
    if(!nu && ns && typeof(ns)=="object" && ns instanceof ZModuleModel){
        nu=ns
    }
    if(nu ){

        if(typeof(config)=="function"){callback=config}
        else if(config && config.callback){callback=config.callback}
        if(typeof(callback)=="function"){nu.then(callback)}
    } else {

        nu=new ZModuleModel(ns,value,config,callback)
        this._cached[nu.NS]=nu;
        if(nu.altNS){
            this._cached[nu.altNS]=nu;
        }
    }

    return nu
}
ZModule.get=function(ns,value,config){
    var nu
    if(config==null && typeof(value)=="function"){
        config={callback:value}
        nu= ZModule.from(ns,null,config)
    } else{
        nu=ZModule.from(ns,value,config)
    }
    nu.process()
    return nu.value;
}
ZModule.getWrapper=function(ns,value,config){
    return ZModule.from(ns,value,config)
}
ZModule.register=function(ns,value,config){
    return ZModule.from(ns,value,config||{})
}
ZModule.resource=function(ns,value,config){

    return ZModule.from(ns,value,config)
}
    $.requireResource=function(nm,callback) {
        if(Array.isArray(nm)){
            nm.forEach(function(a){
                if(typeof(a)=="string"){

                }
            })
        }
        var val=$.requireModule(nm,callback)
        if (val != null) {
            ZModule.from(nm, val)
        } else {
            var path=(typeof(app)!="undefined" && app.resourcelib)?app.resourcelib+"/"+nm+".js":""
            ZModule.get(nm, null, path?{url:path,callback:callback}:callback)
        }
        return val;
    }
$.requireModule=function(nm,callback){
    var wrapper=ZModule.isResolved(nm),val
    if(wrapper){
        val =wrapper.value
    }
    if(val==null) {
        val = resolveBootStrapped(nm)

    }
    if(val){
        if(typeof(callback)=="function"){
            callback(val)
        }
    }
    return val;
}
    $.requireLazy=function(){
        return $.require.apply(this,arguments);
    }
ZModule.require=$.require=function(){
    var a = [].slice.call(arguments), callback = typeof(a[a.length - 1]) == "function" ? a.pop() : null
    var all = [], resolved = [], unresolved = []
    while (a.length) {
        var it = a.shift()
        if (Array.isArray(it)) {
            Array.prototype.push.apply(all, it)
        }
        else {
            all.push(it)
        }
    }
    if (!all.length) {return}
    var res=null
    if (all.length==1) {
        if(typeof(all[0])=="string" && self[all[0]]){
            res= self[all[0]]
        } else{
            res= ZModule.get(all[0],null,callback)
        }

     }
    if(res===null) {
        var allvals = []
        var allpromises = all.map(function (k, i) {
            var z = ZModule.from(k);
            z.process()
            allvals.push(z.value)
            return z.promise
        })

        if (callback) {
            Promise.all(allpromises).then(callback)
        }
        return allvals
    }
    if(res && res.isPromise){
        if (callback) {
            res.then(callback)
        }
    }
    return res;
 }

})();
