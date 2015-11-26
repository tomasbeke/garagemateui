self.appFactory = function() {


    function _init() {

        ctor = Klass("appklass", {
            user: {},
            router: null,
            name: null,
            dependancies: [],
             templates: null,
            modules: [],
            messages:{msg01:"test message"},
            entitFies: {},
            contextPath: null,
            routerPath: null,
            init: function(a, b, c) {
                this.docReadyPromise = Promise.deferred()
                this.params = String(location.search).replace(/^\?/, "").split("&").reduce(function(a, b) {
                    var c = b.indexOf("=");
                    return -1 == c ? a[b] = !0 : a[b.substr(0, c)] = b.substr(c + 1), a
                }, {})

                c && $.extend(this, c), this.observer.register("ready", {
                    sticky: !0
                })
                this.user=this.user||{}
                this.user.appversion=window.APPVERSION
                this.observer.register("initapp", {
                    sticky: !0
                })
                this.on("ready", function() {
                    var  b = Promise.deferred();
                    Promise.all([a , this.docReadyPromise]).then(function() {
                        this.fire("init")
                     }.bind(this))
                    var router=$.require("$.router")
                    if( router){
                        this.router =  router(this)
                        this.router.watchHashChange()
                        b.resolve(this.router)
                    }
                    else{
                        alert("router not av")
                    }
                })
                this.on("viewready", function() {
                    try {
                        this.scanBindings()
                    } catch (a) {}
                    if (this.router) {
                        var b = this.router.getHash();
                        /*if (b) {
                            var c = String(b).split(/\./);
                            this.modules.indexOf(c[0]) >= 0 && this.loadModule(c.shift(), c)
                        }*/
                    }
                })
                this.dependancies.length ? ZModule.get(this.dependancies).then(function() {
                    this.observer.fireAsync("ready")
                }.bind(this)) : this.observer.fireAsync("ready")
            },
            resolveMessage:function(message) {
                if(!this.messages){return message}
                var msgid = message instanceof Array ? message[0] : message;
                var lookup = this.messages[msgid] || msgid;

                if (message instanceof Array) {
                    for (var i = 1; i < message.length; i++) {
                        lookup = lookup.replace('$' + i, message[i]);
                    }
                }

                return lookup;             
            },
            bootstrap: function(build,rooturl,contextpath,serviceurl,resourcelib) {
                window.CLIENTID=Math.random().toString(36).substr(2)
                document.cookie="x-clientid=" + window.CLIENTID + ";expires=0;"
                if(contextpath=="ROOT"){contextpath=""}
                if(self.ResURL){
                     self.ResURL.setRoot(rooturl||"",contextpath||"")
                 }
                this.resourcelib=resourcelib
                this.setUser({ appversion:window.APPVERSION,build:"{BUILD}","contextpath":rooturl||"","servicepath":serviceurl||""})
                this.docReadyPromise.resolve();
                this.fire('initapp');

            },
            loadModule: function(a, b) {
                var pr2=Promise.deferred()
                var ns=[a+"/" + a,a,"app." + a].filter(function(k){return $.getBootstrapData(k,"modules");})[0]
                var module=$.require(ns)

                typeof(b)=="function" && pr2.finally(b)
                if(!module){
                    pr2.reject()
                } else if(module.isPromise){
                    module.finally(function(a){pr2.resolve(a)})
                } else {
                    pr2.resolve(module)
                }
                /*if(module){
                    this.getResource(a,function(template){
                        if(template && $.partialView){
                            $.partialView(template)
                        }
                        if(module){
                            pr2.resolve(module)
                        }
                    });
                }*/


                return pr2
            },

        onRemote:function(type,callback){
            if($.webSocket){
                $.webSocket.on(type ,callback);
            }


        },
            remoteDirective:function(cmd,args,callback,callbackerr){
                if(args && args.args && Object.keys(args).length==1){args=args.args}
                if(!args){args={}}
                //if local then donot apply time zone offset
                args.tmzoffset=(location.href.indexOf("localhost")>=0 || location.href.indexOf("127.0.0.1")>=0)?0: (new Date()).getTimezoneOffset()/60
                var pr=$.xhr.get(app.servicePath,{cmd:cmd,args:args })
                    pr.then(
                    function(data){
                        if(data && data.error){app.splashError(data.error)}
                        typeof(callback)=="function" && callback(data)
                        return data
                    },
                    function(data){
                        var error=data?(data.error||data):"An error occurred"
                        if(typeof(callbackerr)=="function"){
                            callbackerr(error);
                        } else{
                            app.splashError(error)
                        }
                    }
                );
                return pr;
            },
            getEntity: function(a, b, c) {
                 null != b && "object" != typeof b && (c = c || 1 === b || b === !0, b = null);
                var  e = String(a).toLowerCase();
                if (a) {this.entities||(this.entities={});
                    var f = this.entities[e]|| (this.entities[e] = {
                            promise: Promise.deferred(),
                            entity: null
                        });
                    if (!f.entity) {
                        f.entity = 0;
                        var g = this;
                        Data.defineEntity(a, b, {
                            nocache: c
                        }).then(function(a) {

                            if(a && a.name && g.entities[e]){

                                g.entities[e].entity = a
                                g.entities[e].promise.resolve(a)
                            }
                        }, function() {
                            g.entities[e] && g.entities[e].promise.reject("")
                        })
                    }
                } else Promise.reject("invalid name");
                return f.promise
            },
            defineView:function(id,props,proto){
                if($.isPlain(id)){
                    proto=props
                    props=id;
                    id=props.id;
                }
                var SimpleView=$.require("SimpleView")
                var klass=SimpleView;
                if(!$.is.emptyOrPrimitive(proto)){
                    klass=SimpleView.extend(proto)
                }
                return $.lazyInit(klass,props);
            },
            addModule: function(a, b, c) {
                var d = "function" == typeof b ? b(this) : b;
                return this.properties.set(a, d), c !== !0 && ZModule.register("app." + a, d), this[a] && this.observer.fireAsync("moduleaavailable", this[a]), this
            },
            activate: function() {},
            showMessage: function(a) {
                var b = $d(document.querySelector(".app-message")) || $d("<div>").css({
                        position: "absolute",
                        t: -10,
                        left: "50%",
                        w: 400,
                        h: 1,
                        borderRadius: "5px",
                        marginLeft: "-200px",
                        opacity: .1,
                        fontSize: "140%",
                        border: "1px solid #ccc",
                        bgc: "yellow",
                        textAlign: "center",
                        paddingTop: "12px",
                        color: "black"
                    }).addClass(["fxtx", "app-message", "nowrap"]);
                b.removeClass("fxtx").css("opacity", .8).toFront().html(a).css({
                    h: 50
                }).addClass("fxtx"), setTimeout(function() {
                    b.css({
                        opacity: 0,
                        height: "1px"
                    })
                }, 5e3)
            },
            scanBindings: function() {
                return
            },

            isLoggedIn: function() {if(!this.user){return}
                if(this.user.loggedIn && !this.user.id){
                    this.user.loggedIn=false
                }

                return this.user.loggedIn
            },
            clearUserInfo: function(path, callback) {
                var storage= window.localStorage//:window.sessionStorage
                if("undefined" != typeof storage){
                    storage.setItem("sessionuser", "{}");
                    storage.setItem("sessionuser", null)
                }
                Data.Cookie.set("_lid_",null)
            },
            restoreUserInfo: function(path, callback) {
                var storage= window.localStorage//:window.sessionStorage
                if (typeof(storage) != "undefined") {
                    var u = storage.getItem("sessionuser")
                    if (u) {
                        try {
                            u = JSON.parse(u)
                            return u;
                        } catch (e) {
                            $.handleEx("storage:sessionuser", e);
                        }
                    }
                }
            },
            saveUserInfo: function(path, callback) {
                var storage= window.localStorage//:window.sessionStorage
                if (this.user && this.user.id && typeof(storage) != "undefined") {
                     storage.setItem("sessionuser", JSON.stringify(this.user))
                }
            },
            hasResource: function(path) {
                if(-1 == path.indexOf("/")){
                    path = "app/data/" + path
                }
                /\.\w+$/.test(path) || (path += ".html");
                return $.getBootstrapTemplate(path )||$.getBootstrapTemplate(path.replace(/^app/,"theme") );
            },
            getResource: function(path, callback) {
                var result  = this.hasResource(path);
                if(!result){
                    result=$.xhr.get(path ,{contenttype:"html",sync:true},callback)
                } else{
                    callback && callback(result)
                }
                return result
            },

            setUpSession: function(user ) {
                if(!user ){
                    user  = this.user||(this.user={});
                }
                if(!(user  && user .id)){return}

                if(this.contextpath){
                    user .contextpath = this.contextpath
                }
                if(!self.CLIENTID){
                    self.CLIENTID = Math.random().toString(36).substr(2)
                }

                if(!this.user || (this.user && this.user !== user) ){
                    this.setUser(user )
                    document.cookie = "x-clientid=" + self.CLIENTID + ";expires=0;"
                }
                this.user.appversion=window.APPVERSION||"0"
                if (this.user.id) {
                    this.saveUserInfo()
                    if(app.userDetails){
                        if ( app.userDetails.__loaded!== this.user.id) {
                            app.userDetails.update( this.user);
                            app.userDetails.load( this.user.id)
                            app.userDetails.__loaded= this.user.id
                        }
                        app.userDetails.whenAvailable(function(){
                            this.user.fullname=app.userDetails.fullname
                            this.saveUserInfo()
                        }.bind(this))
                     }
                }
                return Promise.resolve()
            },
            promptNewAccount: function(callback) {
                var PopupView=$.require("PopupView")
                var popupView=new PopupView({centered:true,title:"New Account",hideonblur:false,showcancellink:true,destroyonhide:true})
                this.getResource("useraccount",function(c){
                    popupView.el.addClass("useraccount-form")
                    popupView.setContent(c)
                    popupView.el.css("position","fixed")
                    popupView.show()
                    var form=popupView.el.q("form")
                    form.action=app.servicePath+"?newaccount=1"
                     var submit=form.q("button")
                    var callbackurl=form.q("#callbackurl")
                    if(callbackurl){
                        callbackurl.val(app.contextPath)
                    }
                    var loginip=$d(".app-auth #auth_loginid");
                    form.el.onsubmit = function (ev) {
                         var invalids,pw=this.elements.pw
                        if(String(pw.value||"").trim().length<6 ){
                             pw.value=this.elements.confirmpw.value="";
                        }
                        if(this.elements.confirmpw.value!=pw.value){
                            this.elements.confirmpw.value="";
                        }
                        invalids=[].filter.call(this.elements,function(a){return a.checkValidity && a.checkValidity()?null:a})
                        if(invalids && invalids.length){
                            form.addClass("show-error");
                            form.on("input",function onip(){form.removeClass("show-error");form.off("input",onip)})
                             return  false;
                        };
                        app.observer.once("response_newaccount",function(data){
                            if(data && data.result){
                                data=data.result.data||data.result
                            }

                            if(loginip && data.loginid){loginip.value=data.loginid;}
                            app.splash("An Account has been created.<br/>Please login to your account.");
                            popupView.hide()
                            if(typeof(callback)=="function"){
                                callback(data);
                            }
                        })
                    }
                })
            },
            _promptLogin: function(dom,callback,currlogonid) {
                var pr,b=dom
                if (b) {
                    b.show();
                    var form = b.down(".app-auth-form"),
                        loginid = b.down(".app-auth-loginid"),
                        pw = b.down(".app-auth-pw"),
                        btn = b.down(".app-auth-enter"),
                        link = b.down("#auth__link"),
                        msg = b.down(".login-msg");
                    //  form.el.action=app.user.servicepath+"?newaccount=1"
                    form.onsubmit=function(ev){ev.preventDefault();return false;}
                    if(currlogonid){
                        loginid && loginid.val(currlogonid)
                    }
                    if (form.data("_setup")) return;
                    var ths = this;
                    function setup() {
                        form.data("_setup",1)
                        form.css("display", "block")
                        //this.hide()
                        loginid.value=(Data.Cookie.get("_lid_")||"").replace(/null|undefined/g,"").trim();
                        loginid.el.focus();
                        loginid.on("input", function() {
                            msg && msg.clear()
                        });
                        btn.on("click", function() {
                            pr = Promise.deferred();
                            var _id=String(loginid.val() || "").trim(),_pw=String(pw.val() || "").trim()
                            Data.Cookie.set("_lid_",_id||"")
                            if ( _id && _pw) {
                                ths.authenticate(_id, _pw, pr)
                                pr.then(callback.bind(ths), function(a) {
                                    msg && msg.html(a || "Invalid id or password")
                                })
                            }
                        })
                    }
                    if(link){
                        link.on("click",setup )
                    } else{
                        setup()
                    }


                }
                return pr;
            },
            promptLogin: function(callback,aspopup,currlogonid) {
                callback = callback || function() {};
                var vw=null,b = $d(".app-auth");
                if(aspopup || !(b && b.isVisible(true))){
                    this.getResource("appauth",function(html){
                        var vw=$.require("PopupView").newInstance({
                            top:1,width:280, destroyonhide:true
                        })
                        vw.setContent(html);
                        vw.show()
                        vw.el.addClass("center-horizontal")
                        b = vw.el.q(".app-auth")
                        var app=this
                        this._promptLogin(b,function(data){
                            vw.hide()
                            callback.call(app,data)
                        })
                    }.bind(this));
                    return
                }
                return this._promptLogin(b,callback,currlogonid);
                

            },
            signOut: function(hash) {
                this.clearUserInfo()

                var path=this.contextPath
                $.xhr.jsonp(app.servicePath + "?resetsession=1", function(data) {

                })
                if(path && hash){
                    //path=path+"#"+hash
                }
                path && window.location.reload(true)
            },
            authenticateSession: function(token) {
                var promise = Promise.deferred();
                $.xhr.jsonp(app.servicePath + "?sessiontoken=" + token  + "&authenticatesession=1", function(data) {
                    data && data.response && (data = data.response);
                    data = data.data || data;
                    if(data && data.id > 0 ){
                        app.setUpSession(data);
                        promise.resolve(data||"")
                    }
                    else{
                        app.signOut();
                        promise.reject("Invalid session token .. signing out")
                    }
                });
                return promise
            },
            authenticate: function(uid, pw, c, d) {
                var promise, f = this;
                if (c && c.isPromise) {
                    promise = c;
                }
                else {
                    promise = Promise.deferred();
                    var g = "function" == typeof c ? c : function() {}, h = "function" == typeof d ? d : function() {};
                    promise.then(g, h)
                }
                $.xhr.jsonp(app.servicePath + "?auth_loginid=" + uid + "&auth_pw=" + (pw || "") + "&authenticate=1", function(a) {
                    a && a.response && (a = a.response);
                    var b = a.data || a;
                    if(b && b.id > 0 ){
                        f.setUpSession(b)
                        promise.resolve(b||"")
                    }
                    else{
                        promise.reject("Invalid id or password")
                    }
                })
                return promise
            },
            createUser: function(a) {
                return delete a.pw2, a[""] && delete a[""], $.xhr.get(this.servicePath + "?newaccount=" + JSON.stringify(a), function(a) {
                 })
            },
            route: function(a, b) {
                this.router && this.router.route(a, b)
            },
            loadFragment: function(a) {
                var b = Promise.deferred();
                return -1 == a.indexOf("/") && (a = "app/data/" + a), -1 == a.indexOf(".html") && (a += ".html"), this.getResource(a, function(a) {
                    for (var c = $d('<div>').html(a), d = 0, e = c.querySelectorAll("style"); d < e.length; d++)
                        if (e[d]) {
                            var f = e[d].textContent || e[d].innerText;
                            if (f) try {
                                var g = document.body.appendChild(document.createElement("style"));
                                g.textContent = f, e[d].parentNode.removeChild(e[d])
                            } catch (h) {
                             }
                        }
                    for (var d = 0, e = c.querySelectorAll("script:not([src])"); d < e.length; d++)
                        if (e[d]) {
                            var f = e[d].textContent || e[d].innerText;
                            if (f) try {
                                (1, eval)(f), e[d].parentNode.removeChild(e[d])
                            } catch (h) {
                             }
                        }
                    b.resolve(c)
                }), b
            },
            getUser: function() {
                return this.user
            },
            setUser: function(a) {
                 if (null === a) {
                    this.user && (this.user = {}, Data.Cookie.set("user", null));
                    this.user.appversion=window.APPVERSION||"0"
                }
                else {
                     if(!this.user){
                         this.user=$.extend({}, a)}
                     else{
                         $.extend(this.user, a)
                     }
                    this.user.appversion=window.APPVERSION||"0"
                     if(this.user.id){
                         this.user.loggedIn = !0
                         Data.Cookie.set("user", this.user.id)
                     }


                     a.servicepath && (this.servicePath = a.servicepath)
                     if (null != a.contextpath) {

                        var c = ResURL.setRoot(a.contextpath);
                        this.contextURI = c
                         this.contextPath = c.build();
                         if(!/\/$/.test(this.contextPath)){
                             this.contextPath = this.contextPath + "/"
                         };
                         /*if(this.contextpath){
                             var cx=this.contextpath.replace(/[\/\\]$/,"")
                             var arr=cx.split("/")
                             if(arr.pop()==contextpath){
                                this.contextpath=arr.join("/")
                             }
                         }*/
                            this.routerPath = this.contextPath + "router";
                         this.servicePath || (this.servicePath = this.routerPath);
                    }
                    this.fire("user", this.user)
                }
            },
            showMessage: function(a, b,nocache) {
                var c = this,vw=c.messagevw;
                b = b || {}
                if(nocache===true || !vw){
                    var defcss={textAlign:"center",borderRadius:"5px",padding:"10px"};
                    var PopupView=$.require("PopupView")
                    vw = new PopupView({
                        klass:"app-message",resizable:true,showcancellink:true,modal:true,centered:true,minWidth:300,offset:1,
                        animateShow:{anchor:"c"},
                        minHeight:50,
                        css: b.css?Object.assign(defcss, b.css):defcss});
                    if(nocache!==true){
                        c.messagevw=vw
                    }
                }



                if(b.title){vw.config.options.title=b.title };
                vw.setContent(typeof(a)=="string"?a: (a.message||a))
                vw.show();
                return vw
            },
            notify: function(msg, mode) {
                if(!this._notifydiv){
                    this._notifydiv=document.createElement("div")
                    this._notifydiv.innerHTML="<div style='position:absolute;top:0;padding:10px;left:0;width:100%;height:100%'></div>"
                    this._notifydiv.style.cssText="z-index:10;position:fixed;bottom:0;right:0;text-align:center;min-width:80px;background:#111;opacity:.7;color:white;width:auto;max-width:100px;height:1px;overflow:hidden;display:none;"
                    this._notifydiv.className="fxtx_25"
                    document.body.appendChild(this._notifydiv)
                }
                if(msg){
                    this._notifydiv.firstElementChild.innerHTML=msg
                    this._notifydiv.style.display="block";
                    setTimeout(function(){
                        this._notifydiv.style.height="40px";
                    }.bind(this),5)
                    setTimeout(function(){
                        this._notifydiv.style.height="1px";
                        setTimeout(function(){
                            this._notifydiv.style.display="none";

                        }.bind(this),500)
                    }.bind(this),1500)
                } else{
                    this._notifydiv.firstElementChild.innerHTML=""
                }
            },
            splashWarning: function(a, b) {
                var config={mode:"warn"}
                if($.isPlain(b)){
                    Object.assign(config,b);
                    b=null
                }
                app.splash(a, b,config)
            },
            splashInfo: function(a, b) {
                var config={mode:"info"}
                if($.isPlain(b)){
                    Object.assign(config,b);
                    b=null
                }
                app.splash(a, b,config)
            },
            splashError: function(a, b) {
                var config={mode:"error"}
                if($.isPlain(b)){
                    Object.assign(config,b);
                    b=null
                }
                app.splash(a, b,config)
             },
            splash: function(message, timeout,opts) {
                if(!message){return}
                var options={}
                if(arguments.length==2 && timeout && typeof(timeout)!="number"){
                    opts=timeout;
                    timeout=null
                }
                if(opts==true){
                    options.mode="error";
                } else if($.isPlain(opts)){
                    Object.assign(options,opts)
                }

                if(typeof(timeout)=="number"){
                    options.timeOut=timeout
                }
                var PopupView=$.require("PopupView")
                if(!message){
                     return
                }
                if(message && typeof(message)=="object") {

                    if (message instanceof Array) {
                        message = message.join(" ");
                    } else {
                        message = message.message||message;
                        if(message && typeof(message)=="object"){
                            message=JSON.stringify(message);
                        }
                    }
                }
                message=this.resolveMessage(message)
                return PopupView.splash(message,options);
            }
        })
    }
    var ctor = null;
    return {
        create: function(a, b) {
            ctor || _init();
            var c = new ctor(a, b);
            return c
        }
    }
}();

window.addEventListener("message",function iframemsg(e){
    var data= e.data,cntinue=false
    if(e.origin && typeof(app)!="undefined" ){
        var path=app.servicePath||(app.user && app.user.servicepath)
         if(path && path.toLowerCase().indexOf(e.origin.toLowerCase())!=-1){
             cntinue=true
         }
    }
    if(!cntinue){
        return
    }
    if(typeof(data)=="string"){
        try {
            data = eval("(" + data + ")")
        } catch(e){data={}}
    }


    if(!data.type){
        return
    }
    if(data.status=="error"){
        var msg=(data.result&&data.result.message)||data.result
        app.splash("<div style='color:red;'>Error</div>"+ (msg||"Unknown error"));
    } else {
      app.observer.fireAsync("response_"+data.type,data)
    }
    //window.removeEventListener("message",iframemsg);
})