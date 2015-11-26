/**
 * Created by Atul on 5/20/2015.
 */
(function() {
    var proto = {
        setUpWidget:function(config){
            this.__instance__ = true;
            Object.defineProperties(this,{
                "observer": {
                    set:function(){},
                    get: function () {
                        if (!this.__instance__) { return }
                        var nu
                        delete this.observer;
                        Object.defineProperty(this,"observer", {value: nu = $.emitter.augment(this), writable: false, enumerable: true, configurable: true})
                        return nu;
                    }, configurable: true
                },
                "config": {
                    set: function (object) {
                        if (!this.__instance__) {  return  }
                        delete this.config;
                        var nu = new $.observable()
                         nu.set(object)
                         Object.defineProperty(this,"config", {value: nu, writable: false, enumerable: true, configurable: true})
                        return nu
                    }, get: function () {
                        if (!this.__instance__) { return }
                        var nu
                        delete this.config;
                        Object.defineProperty(this,"config", {value: nu = new $.observable(), writable: false, enumerable: true, configurable: true})
                        return nu;
                    }, configurable: true
                }
            })
            if(config && typeof(config)=="function"){config={render:config}}
            if(config && $.isPlain(config)){
                if(typeof(config.render)=="function"||typeof(config.renderImpl)=="function"){
                    this.renderImpl=config.render||config.renderImpl;
                    delete config.render;
                    delete config.renderImpl
                }
                if(config.tag){
                    this.el=$d(document.createElement(config.tag))
                }
                this.config=config
            };
            if(config.el){
                this.el=$d(config.el)
            }
            this.$ = $d.util.createScopedDollar("el");


        },
        on:function(ev,fn,optns){

        },
        onConfigChange: function (nm, fn) {
            if (typeof(nm) == "function") {
                fn = nm;
                nm = "*"
            }
            var C = this.config;
            if (C) {
                C.onchange(nm, fn);
            }
            return this
        },
        renderImpl:function(){ 
            return this},
        render:function(data){
            if("observer" in this){
                if(this.observer.fire("beforerender")===false){return  this}
            }
            this.renderImpl.apply(this,arguments)
            if("observer" in this){
                this.observer.fire("afterrender")
            }
            return this
        }
    };
    ["appear","disAppear","slideUp","isVisible","slideDown","css", "text", "attr", "html", "insert", "append","appendTo", "prepend", "moveTo", "resize", "clear", "toFront", "hide", "show", "addClass", "removeClass", "hasClass", "isVisible", "clear", "onAttach", "anum"].forEach(
        function (ky) {
            if(ky in proto){return}
            proto[ky] = (function (k1) {
                var k2 = k1;
                return function () {
                    var el=this.el;
                    if(!el){return}
                    var D = $d, m = D[k2],
                        r = m.apply(D, [el].concat([].slice.call(arguments)));
                    return (r ==  el || r ==  el.el) ? this : r
                }
            })(ky)
        }
    );
    ["click", "mousedown", "mouseup", "mouseove", "mouseover", "hover", "keydown", "keyup", "resize", "focus", "blur"].forEach(
        function (ky) {
            proto["on" + ky] = (function (k1) {
                var k2 = k1;
                return function (fn, optns) {
                    var el=this.ip||this.el;
                    if(!el){return}
                    $d.on(el,k2, fn, optns)
                    return this
                }
            })(ky)
        }
    );
    $.widget2 = $.createClass(function (config) {
            if(config){
                this.setUpWidget(config)
            }
        }, proto, { }
    );
    $.widget2.pic= $.createClass(
         function(config){
             this.setUpWidget(config)
             this._content='' +
                 "\
                 <div  class='pic-bar' style='text-align: center'>\
                     <button class='ui-button small smaller'  type='button' data-key='snap'>Snap</button>\
                     <span class='for-upload-file' style='position:relative;overflow:hidden;'>\
                     <button  class='ui-button small smaller'type='button' data-key='upload' style='z-index:1; '>Upload</button>\
                     </span>\
                 </div>"
                 if(this.el){
                     var img=this.el
                     this.el=img.after("<div/>")
                     this.el.addClass('pic-wrap');
                     this.el.html(this._content)
                     this.el.prepend(img)
                 }
        },

        {renderImpl:function(){
            this.el.q("button[data-key='snap']").on("click", this.snap.bind(this))
            //this.el.q("button[data-key='upload']").on("click", this.upload.bind(this))
            this.setupUpload(this.el)
        },
        snap:function _snap(ev){
                    var snapshot= $.require("UI.snapshot")
                    if(!$d(ev.target).up(".pic-wrap")||!($d.is(ev.target,"button")||$d.is(ev.target,"img"))){return}
                    var img=$d(ev.target).up(".pic-wrap").q("img")
                    if(!img){return}
                    var b=img.getBoundingClientRect()
                    snapshot(null,{width:Math.max(180, b.width),top: b.top  ,left: b.left-10 ,callback:function(resultimg,canvas,cntnr){
                        if(resultimg){
                            img.el.src=resultimg.src
                        }
                    }});

        },
            setupUpload:function _setupupload(el){
                var iptemplate=this.iptemplate,uploadbutton,updlbl
                    if(!iptemplate){
                        var d=document.createElement("div"),b
                        d.innerHTML="<input style='width:5px;height:5px;background-color:white;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
                            this.iptemplate=iptemplate= d.removeChild(d.firstChild);d=null;
                        updlbl=this.updlbl=el.q(".for-upload-file")
                        this.uploadbutton=uploadbutton = updlbl.down("button")
                        var ths=this
                        //iploadip=updlbl.insertBefore(iptemplate.cloneNode(true),updlbl.firstChild)
                        updlbl.on("mousemove",function(ev){
                            if(!ths.iploadip){return}
                            var wd=updlbl.offsetWidth+5;
                            //updlbl.style.width=wd+"px";
                            var b=updlbl.el.getBoundingClientRect();

                            if(b.top==0){b=updlbl.el.getBoundingClientRect(); }
                            var pos={}
                            pos.x=(ev.x- (b.left+3));pos.y=(ev.y- (b.top+3));
                            if(pos.y<=0 || pos.x<=0 || pos.y> b.height || pos.x>wd){return}
                            ths.iploadip.style.top=pos.y+"px";
                            ths.iploadip.style.left=pos.x+"px"
                        });
                    }
                this.upload()
                },
            setupIP:function(FILE){
                var img=this.updlbl.up(".pic-wrap").q("img"),el,_upload=this.upload.bind(this),ths=this
                this.FILE=FILE;
                FILE.setupIp(ths.iploadip, {
                    type: 'image', reader: "dataURL",
                    complete: function (pr) {
                        img.src = this.result
                        if (ths.iploadip) {
                            ths.iploadip.parentNode.removeChild(ths.iploadip);
                            ths.iploadip = null;
                            _upload();
                        }
                    }
                })
            },
    upload:function _upload(ev){
                    var updlbl=this.updlbl,trig
                    if(!this.iploadip) {
                        this.iploadip = updlbl.insertBefore(this.iptemplate.cloneNode(true), this.uploadbutton)
                        trig=true
                    }
                    if(this.FILE){
                        this.setupIP(this.FILE)
                    }  else{
                        $.require("$File",this.setupIP.bind(this))
                    }



                }

        },$.widget2
    )
    $.widgetInputWrap= $.createClass(
        function(config){
            this.setupInput(config);
        },
        {
            setupInput:function(config){
                config=config||{}
                this.setupWidget(config)
                if(!this.el){
                    this.el=$d(document.createElement("label"))
                }
                var type=this.config.get("type")||"text"
                var ip=document.createElement('input')
                ip.type=type;
                this.ip=this.el.append(ip);
            },
            renderImpl:function(optns){
                this.el.addClass("form-input-wrap")
                if(this.config.get("label")){
                    this.el.prepend("span.form-input-label").html(this.config.get("label"))
                }
                if(optns){
                    if( optns.type){
                        this.ip.type=optns.type;
                    }
                    if( optns.container){
                        this.el.appendTo(optns.container);
                    }

                }
                return this
            },
            onchange:function(fn, optns){
                this.ip.on("change",fn, optns);
                return this
            },
            val:function(){
                return arguments.length?this.ip.val(arguments[0]):this.ip.val()
            }
        },
        $.widget2,{}
    )
})();

$.widget = Klass("$.widget", (function () {
        var proto = {el: null, template: null, elementtemplate: null, elements: [], _rendered: false, value: null,contentclass:null
            ,content:{get:function(){return (this.el&&this.contentclass)?$d.selfOrDown(this.el,this.contentclass):$d(this.el)}},
            name:null,
            tag:null
        };
        proto.mixins = ["config"];
        ["css", "text", "attr", "html", "insert", "append", "prepend", "moveTo", "resize", "clear", "toFront", "hide", "show", "addClass", "removeClass", "hasClass", "isVisible", "clear", "onAttach"].forEach(
            function (ky) {
                proto[ky] = (function (k1) {
                    var k2 = k1;
                    return function () {
                        var D = $d, m = D[k2],
                            r = m.apply(D, [this.el].concat($.makeArray(arguments)));
                        return (r == this.el || r == this.el.el) ? this : r
                    }
                })(ky)
            }
        );
        ["click", "mousedown", "mouseup", "mouseove", "mouseover", "hover", "keydown", "keyup", "resize", "focus", "blur"].forEach(
            function (ky) {
                proto["on" + ky] = (function (k1) {
                    var k2 = k1;
                    return function (fn, optns) {
                        this.el.on(k2, fn, optns)
                        return this
                    }
                })(ky)
            }
        );
        proto.activate = function () {
            if (!this._rendered) {
                this.render();
                this.show()
            }
            return this
        }
        proto.val = function () {
            var v
            if (arguments.length) {
                v = arguments[0];
                if (typeof(this.reader) == "function") {
                    v = this.reader.call(this, arguments[0], arguments[1])
                }
                this.properties.set("value", v);
                return this
            }
            v = this.properties.get("value");
            if (typeof(this.resolver) == "function") {
                v = this.resolver.call(this, v)
            }
            return v
        }
        proto.onchange = function (fn, optns) {
            return this.onpropertychange("value", fn, optns)
        }
        proto.find = function (fn) {
            return this.el.q(fn)
        }
        proto.eachElement = function (fn) {
            this.elements.each(fn, this)
        }
        proto.init = function () {
            if (!this.el) {
                this.el = $d("<"+(this.tag||"div")+">")
            }
            if (this.el) {
                this.el = $d(this.el)
            }
            this.elements = List.create()
        }
        proto.renderimpl = function () {
            return this.el
        }
        proto.addElement = function (data,container) {
            var r=container||this.el
            var el = r.append(data);
            el.addClass("widget__item")
            this.elements.add(el)
            return el
        },
            proto.render = function (data, dom) {
                this.fire("beforerender")
                this.el = $d(this.el)
                data=data||this.list
                var list = $.isArray(data) ? data : (data || {}).list, items, r
                if (list && $.isArray(list) && this.elementtemplate) {
                    if (typeof(this.elementtemplate) == "string") {
                        this.elementtemplate = $d.template(this.elementtemplate)
                    }
                    var t = this.elementtemplate
                    items = data.map(function (a) {
                        return t?t(a):a
                    })
                }

                if ( this.template) {
                    if (typeof(this.template) == "string") {
                        this.template = $d.template(this.template)
                    }
                    r = $d(this.template($.isArray(data)?{list:items}:data))
                } else {
                    if (items) {
                        items = items.map(function (it) {
                            return $d(it)
                        })
                    }
                }

                r = this.renderimpl(r||this.el,items)||r

                if (r) {
                    if(this.el && !this.el.contains(r)){
                        r = this.el.append(r)
                    }

                } else {
                    r = this.el
                }
                this.el=this.el||r;
                if (items) {
                    for (var i = 0, l = items, ln = l.length, k; k = l[i], i < ln; i++) {
                        if (!k) {
                            continue
                        }
                        this.addElement(k,r);
                    }
                }
                var ths = this

                this.el && this.el.on("click.render", function (ev, el) {
                    if ($d.hasClass(ev.target, "ignore-selection") || $d.matches(ev.target, "input")) {
                        return
                    }
                    ths.fire("selection", el || $d.selfOrUp(ev.target, ".widget__item"))
                }, ".widget__item")
                this._rendered = true;
                this.observer.fireAsync("afterrender", r)
                return this;
            }
        proto.appendTo = function (dom) {
            if(!this._rendered){
                this.render();
            }
            this.el = $d.append(dom, this.el)
            return this
        }
        return proto
    })()
);
$.widget.create = function (nm, impl,proto) {
    if (typeof(impl) == "function") {
        impl = {renderimpl: impl}
    }
    impl = impl || {}
    if (impl.render) {
        impl.renderimpl = impl.render;
        delete impl.render
    }
    var addtnl= $.extend({},impl)
    if(proto && $.isPlain(proto)){
        $.extend(addtnl,proto)
    }
    var nu = $.widget.extend(nm, addtnl)
    return nu;


}, $.widget.svg = $.widget.extend({
    properties: {
        src: null,
        content: null,
        contentPromise: null
    },
    init: function() {
        this.contentPromise = Promise.deferred(), this.src || "string" != typeof arguments[0] || (this.src = arguments[0]), "string" == typeof this.src && $.xhr.get(this.src, this.contentPromise.resolve.bind(this.contentPromise))
    },
    renderimpl: function(a) {
        var b = this;
        a = a || this.el, this.contentPromise.then(function(c) {
            var d = c;
            b.srcFormatter && (d = b.srcFormatter.call(b, d)), a && (a.innerHTML = d, b.observer.fire("afterrenderimpl", a))
        })
    }
});

$.widget.form = $.widget.extend({
        properties: {
            meta: null,
            labelPos: null,
            formPrefix:null
        },
        init: function() {
            this.tag="form"

        }
    }
);

$.widget.formElement = $.widget.extend({
    properties: {
        meta: null,
        name: null,
        label: null,
        labelPos: null,
        iptype:null,
        ip:null,
        formPrefix:null,
        renderer:null,
        valueformatter:null
    },
    init: function() {
        this.tag="label"
        this.onpropertychange("label",function(rec){
            var lbl=this.el.q(".form-element-label")
            if(lbl){lbl.html(rec.value==null?"":rec.value)}
        });
        this.onpropertychange("value",function(rec){
            this.updateIpValue(rec.value)
        })
        this.onpropertychange("valueformatter",function(rec){
            var raw=this._raw
            if(raw){this._raw=null}
            this.updateIpValue(raw)
        })

    },
    getIpValue:function(){
        var val,ip=this.ip
        if(ip.type=="checkbox"||ip.type=="radio"){
            if(ip.checked){
                val= String(ip.value||"").trim();
                if(!val){val=true}
            } else{return}
        } else{val=ip.value}
        return val
    },
    addOptions:function(lst,clr){
        if(this.ip){
            this.ip.addOptions(lst,clr)
        } else{
            this._litopts=[lst,clr]
            this.onpropertychange("ip",function(rec){
                if(this.ip && this._litopts){
                    this.ip.addOptions(this._litopts[0],this._litopts[1])
                    this._litopts=null;
                }
            })
        }
    },
    onInputChange:function(){
        var val=this.getIpValue()
        this.observer.fire("input",val)
    },
    onValueChange:function(){
        this._raw=this.value=this.getIpValue()
    },
    updateIpValue:function(val){
        var v=val,curr=this.getIpValue();
        if(this._raw===val){return}
        this._raw=val;
        if(this.valueformatter){
            v=this.valueformatter(val)
        }
        if(curr==v){return}
        if(this.ip){
            this.ip.val(v);
        }

    },
    renderimpl: function(a) {
        var iphtml,prefix=this.formPrefix||""
        if(!this.el.q("input")){
            var renderer=this.renderer
            if(typeof(this.renderer)=="function"){
                iphtml=this.renderer();
            } else{
                if(this.iptype=="select"){
                    iphtml="<select class='form-element-ip' name='"+(prefix+(this.name||""))+"' data-key='"+(this.name||"")+"' ><option value=''>-"+(this.name)+"-</option></select>"
                } else if(this.iptype=="textarea"){
                    iphtml="<textarea class='form-element-ip' name='"+(prefix+(this.name||""))+"' data-key='"+(this.name||"")+"' > </textarea>"
                } else {
                    iphtml="<input class='form-element-ip' name='"+(prefix+(this.name||""))+"' data-key='"+(this.name||"")+"' type='"+(this.iptype||"text")+"'/>"
                }
            }

            this.el.html("<span class='form-element-label'>"+(this.label||"")+"</span>"+iphtml)
        }


        this.ip=this.el.q(".form-element-ip")||this.el.q("input");
        this.ip.el.addEventListener("change",this.onValueChange.bind(this))
        this.ip.el.addEventListener("input",this.onInputChange.bind(this))
    }
});

$.widget.editable = $.widget.extend({
    properties: {
        meta: null,
        record: null
    },
    init: function() {
        ("string" == typeof this.meta || $.isPlain(this.meta)) && (this.meta = new Data.Column(this.meta))
    },
    clear: function() {
        return this.el = this.meta = null, this.columnIndex = -1, this
    },
    getValue: function() {
        var a = this.record;
        return a ? a.get(this.name) : void 0
    },
    setValue: function(a) {
        var b = this.record;
        return b ? b.set(this.name, a) : this
    },
    update: function(a, b) {
        return this.setValue(this.name, a), b && this.render(a), this
    },
    renderValue: function(a) {
        if (a = null == a ? this.getValue() : a, this.config.renderer) return this.config.renderer(a, this);
        var b = this.meta ? this.meta.getDisplayValue(a) : a;
        return this.meta && this.meta.cellRenderer ? this.meta.cellRenderer(b) : b
    },
    render: function(a) {
        return this.content.html(this.renderValue(a)), this
    }
});

$.widget.list = $.widget.extend({
    properties: {
        list: null,
        store: null
    },
    init: function(a) {
        this.el || (this.el = $d("<div>")), this.el && (this.el = $d(this.el)), "function" == typeof a && (a = a());
        var b;
        if (a && "object" == typeof a) {
            if ($.is(a, List)) b = List.plugin.selectionModel(c.records);
            else if ($.is(a, Data.store)) {
                var c = a;
                b = List.plugin.selectionModel(c.records); {
                    c.meta
                }
            } else b = List.from($.isArrayLike(a) ? a : []);
            List.plugin.selectionModel(b)
        }!b && this.list ? List.plugin.selectionModel(this.list) : this.list = b, this.elementtemplate || (this.elementtemplate = function(a) {
            return "<li style='position:relative;' data-key='" + this.keyprovider(a) + "'>" + this.labelprovider(a) + "</li>"
        }.bind(b)), this.template || (this.template = "div.listbox-container.layout-list-popup>ul.layout-fit-container.filter-listbox.defcontentBg{-list-}")
    },
    renderimpl: function(a) {
        this.config.nowrap && this.el.addClass("nowrap"), $d(a).st("li").addClass("list-row").css({
            overflow: "hidden",
            overflowY: "auto"
        })
    },
    parseList: function(a) {
        if (a) {
            "function" == typeof a && (a = a());
            var b;
            if (a && "object" == typeof a) {
                if ($.is(a, List)) b = List.plugin.selectionModel(store.records);
                else if ($.is(a, Data.store)) {
                    this.store = a, b = List.plugin.selectionModel(this.store.records); {
                        store.meta
                    }
                } else if ($.isArrayLike(a)) {
                    var c = a.map(function(a) {
                        return a && "object" == typeof a ? a : {
                            id: a,
                            label: String(a)
                        }
                    });
                    b = List.from(c)
                } else b = List.from([]);
                List.plugin.selectionModel(b)
            }!b && this.list ? List.plugin.selectionModel(this.list) : this.list = b
        }
    }
});

