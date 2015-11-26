(function(){
    var inc=0
    var proto={
        model: null,   template: null,  templatefn: null, styles: null, klass:null, layout: null, title: null,  state:null, el:null, id:null,visible:null,uuid:null,
        rendered:null,  selector:null,urlhash:null,label:null,
        tagName:null,autoshow:null,_parent:null,
        controller:null,index:0,visibleFirst:null,
        init: function () {
            this.initView()
        },
        initView:function () {
            this.__isSimpleView=true
            this.$=this.$||$d.util.createScopedDollar("el")
            this.el = this.el||$d(document.createElement(this.tagName||"div"))
            if(!this.$content){
                this.$content=this.$;
            }
            //if(this.auto==null){this.auto=true}

            $d.hide(this.el)
            this.children=List.create([])
            this._origid=this.id
            if(!this.id){
                this.id="SimpleView_"+(++inc)
            }
            this.uuid=this.id;
            if(!this.urlhash){this.urlhash=this.id}
            this.origel=this.el
            if(!$d.attr(this.el,"zscope")){
                $d.attr(this.el,"zscope",this.uuid)
            }
            $d.domdata(this.el,"uuid",this.uuid)
            this.onpropertychange("rendered",function(rec){
                if(rec.value) {
                    if (!this.auto && !this.visible) {
                        //this.hide();
                    }
                    if(this.visible) {
                        this.digest(true)
                    }
                    this.observer.fireAsync("rendered",this.el)
                }

            }.bind(this))

            this.onpropertychange("model",function(rec){
                if(this.visible && rec.value) {
                    //this.digest(true)
                }
            });
            this.onpropertychange("visible",function(){
                if(this.visible){

                    if(this.visibleFirst==null){
                        this.visibleFirst=true
                    } else{
                        this.visibleFirst=false
                    }
                    this.onAttach();
                    this.observer.fireAsync("attach",this.el)
                    if(this.layout=="fill"){
                        if(this.selector){
                            // $d.fillContainer(this.el.parent(),"min")
                        }
                        if(this.el.isAttached()){
                            $d.fillContainer(this.el,"min")
                        } else {
                            this.el.onAttach(
                                function(el){
                                    $d.fillContainer(el,"min")

                                }
                            )
                        }

                    }
                    if(this.controller){
                        this.controller.call(this,this.el,this.visibleFirst)
                    }
                    this.digest()

                    this.observer.fireAsync("visible",this.el)
                }

            }.bind(this))
            this.observer.register("attach",{sticky:true})
            this.initModel();
        },
        digest:function(force){
            if (this.model && this.isRendered() ) {
                if(!this.uuid){this.uuid=this.id}
                var scopeid=this.model.scopeid=this.uuid,selector="[z-scope='"+ scopeid+"']";
                var scopedel= $d.selfOrDown(this.el,selector)||this.el
                if(!scopedel.is(selector)){
                    scopedel.attr("z-scope",scopeid);
                }
                this.model._parentController=this.getController();
                if(!force && scopedel.data("zscoped") && scopedel.data("zscoped").scopeid==this.uuid){
                    this.model.digest(scopedel,this.uuid);
                } else{
                    this.model.digest(scopedel,this.uuid,force)
                }

            } else{

            }

        },
        defaultSetViewImpl:function(old,nu){
            old && old!==nu && old.hide()
            nu.show()

        },
        setViewImpl:function(old,nu){
            return this.defaultSetViewImpl(old,nu)

        },
        isVisible:function(){
            return this.visible
        },
        initModel:function(model){
            model=model||this.model;
            if(!model && this._origid){
                var modelname=this._origid+"Model"
                var nu = $.requireModule(modelname)||$.requireModule("models/"+modelname)||$.requireModule("models/"+ $.capitalize(modelname))
                if(nu && typeof(nu)=="function"){
                    model=nu
                }

            }
            else if(typeof( model)=="string"){
                model=$.requireModule( "models/"+model)
            }
            if(model && typeof(model)=="function"){
                this.model=new model();
            }
            return this.model
        },
        eachChildView:function(fn,ctx){
            (this.children||[]).forEach(
                fn,ctx||this
            );
            return this
        },
        findChildView:function(nm,deep){
            var ch=this.getChildView(nm)
            if(ch){
                return ch
            }
            if(deep){
                return this.children.find(function(it){return it.findChildView(nm,true)})
            }

        },
        getChildView:function(nm){
            if(!nm){return}
            if(SimpleView.isView(nm) && this.children.indexOf(nm)>=0){
                return nm
            }
            if(this[nm] && SimpleView.isView(this[nm])){
                return this[nm]
            }
            if(typeof(nm)=="string"){
                return this.children.find(function(it){return it.urlhash==nm||it.id==nm})
            }

        },
        setView:function(nm,data){
            if(!nm || !("activeview" in this)){
                this.properties.addProperty("activeview");
            }
            if(nm===true){
                nm=this.children[0]
            }

            var nu
            if(!this.isRendered()){
                this.observer.register("afterRender",{sticky:true})
                this.observer.on("afterRender",function(nm,data){
                    if(this.isRendered()) {
                        this.setView(nm,data)
                    }
                }.bind(this,nm,data))
                return
            }
            var parts
            if(typeof(nm)=="string" && nm.indexOf("/")>0 && !this.getChildView(nm)){
                parts=nm.split("/");
                nm=parts.shift()
            }
            if(SimpleView.isView(nm)){nu=nm}
            else if(this[nm] && SimpleView.isView(this[nm])){nu=this[nm]}
            if(!nu || (this.activeview===nu&&nu.visible)){
                return
            }
            var current=this.activeview;
            this.observer.fire("beforeviewchange",{current:this.activeview,new:nu})
            //this.children.each(function(it){it===nu || it.hide()})
            var pr=this.setViewImpl(current,nu )

            this.activeview=nu;
            if($.isPlain(data)){
                nu.model.update(data)
            }
            this.observer.fireAsync("viewchange",nu)
            nu.observer.fireAsync("resize")
            if(pr && pr.then){
                pr.then(function(){
                        this.activeview.observer.fireAsync("viewactive")
                        this.observer.fireAsync("afterviewchange",{current:current,new:nu})}.bind(this)
                )
            } else{
                this.activeview.observer.fireAsync("viewactive")
                this.observer.fireAsync("afterviewchange",{current:current,new:nu})
            }

            if(typeof(app)!="undefined" && typeof(app.fire)=="function"){
                app.fire("viewchanged",nu);
            }
            if(parts){
                nu.setView(parts.join("/"))
            }
            return this;
        },
        remove:function(nu){
            var idx=this.children.indexOf(nu)
            if(idx>=0){
                this.children.splice(idx,1);
            }
            this.children.forEach(function(chld,i){chld.index=i});
        },
        add:function(nu){
            if(!nu){return}
            if($.isArray(nu)){
                nu.forEach(this.add.bind(this))
                return this;
            }

            var chld
            if(typeof(nu)=="function"){
                chld=nu();
            } else if($.isPlain(nu)){
                chld=new SimpleView(nu)
            } else if(SimpleView.isView(nu)){
                chld=nu;
            } else if(typeof(nu)=="string" ) {
                chld = new SimpleView({id:nu})
            }
            if(chld){
                this.properties.addProperty(chld.id)
                this.properties.setItem(chld.id,chld)
                if(this.visible){
                    chld.appendTo(this.el);

                }
                chld._parent=this;
                chld.index=this.children.length
                this.children.add(chld)
                if(chld.selector && !chld.template){
                    chld.render(this.el)
                }
            }

            return chld;
        },
        onAttach: function () {  },
        isRendered: function () {   return this.rendered  },
        destroy: function () {
            $d.remove(this.el)
            if(this._parent){
                this._parent.remove(this)
            }
            this.el=null;
            return this
        },
        hide: function (anim,animconfig) {
            this.observer.fire("beforehide",this.el)
            //this.children && this.children.forEach(function(it){it && it.isRendered() && it.hide()})
            this.el.addClass("view-hidden")
            this.hideImpl(anim,animconfig)
            this.observer.fire("hide",this.el)
            this.observer.fire("afterhide",this.el)
            if(this.container){this.container.hide()}
            this.visible=false;
            return this
        },
        hideImpl: function (anim,animconfig) {
            $d.hide(this.el,anim,animconfig)
        },
        showImpl: function (anim,animconfig) {
            $d.show(this.el,anim,animconfig)
        },

        show: function (anim,animconfig) {
            if(this.visible){
                return
            }
            this.observer.fire("beforeshow",this.el);
            if(!this.isRendered()){
                this.visible=false;
                this.render().then(function(){
                    if(!$d.attr(this.el,"zscope")){
                        $d.attr(this.el,"zscope",this.uuid)
                    }

                    if(this.container){this.container.show()}
                    this.showImpl(anim,animconfig)
                    this.observer.fire("show",this.el);
                    this.visible=true;
                    this.children && this.children.forEach(function(it){it.isRendered() || it.appendTo(this.el)},this)

                    this.observer.fireAsync("aftershow",this.el);
                }.bind(this));
            }
            else{
                this.visible=false;
                if(!$d.attr(this.el,"zscope")){
                    $d.attr(this.el,"zscope",this.uuid)
                }
                if(this.container){this.container.show()}
                var pr=this.showImpl(anim,animconfig)

                this.observer.fire("show",this.el);
                this.visible=true;
                this.children && this.children.forEach(function(it){it.isRendered() || it.appendTo(this.el)},this)
                if(pr && pr.then){
                    pr.then(function(){
                        this.observer.fireAsync("aftershow",this.el);}.bind(this)
                    )
                } else{
                    this.observer.fireAsync("aftershow",this.el);
                }

            }
            this.el.removeClass("view-hidden")
            return this
        },
        setContent: function (content,noclear) {
            if(content==null){return}
            if(!noclear){
                this.$content().clear()
            }
            if(typeof(content)=="string"){
                this.$content().html(content)
            } else{
                this.$content().append(content)
            }

        },
        insertBefore: function (dom) {
            var target=$d(dom.el||dom)
            this.render($d.parent(target)).then(
                function(){
                    if(target){
                        this.el=$d(target.parent().el.insertBefore(this.el.el,target.el))
                    }
                }.bind(this)
            )
        },
        insertAfter: function (dom) {
            var target=$d(dom.el||dom)
            this.render($d.parent(target)).then(
                function(){
                    var target2
                    if(target){
                        target2=$d(target.el.nextElementSibling)
                    }
                    this.el=$d(target2.parent().el.insertBefore(this.el.el,target2?target2.el:null))

                }.bind(this)
            )
        },
        replace: function (dom) {
            var target=$d(dom.el||dom)
            this.render($d.parent(target)).then(
                function(){
                    if(target){
                        this.el=$d(target.parent().el.insertBefore(this.el.el,target.el))
                        target.remove()
                    }
                }.bind(this)
            )
        },
        appendTo: function (dom) {
            var container
            if(!(dom && $d(dom))){return}
            container=$d(dom)
            var toret=Promise.deferred()
            if(this.isRendered()){
                if(container.contains(this.el)){
                    toret.resolve(this.el);
                    return
                }
                this.el.addClass("__temp__")
                $d.append(container,this.el)
                this.el=container.q(".__temp__")
                this.el.removeClass("__temp__");
                if($d.isAttached(this.el)){
                    toret.resolve(this.el)
                } else {
                    setTimeout(function(){toret.resolve(this.el)}.bind(this),100)
                }
            } else{
                var curr=container.q("[data-uuid='"+this.uuid+"']")
                if(curr){
                    curr.remove();
                }
                this.render(container)
            }

            return toret

        },
        rerender: function (container) {
            this.renderedPromise=null;
            this.rendered=false;
            this.el.clear();
            this.render(container);
        },
        _ensurePanels: function () {},
        _onrender: function (container) {
            this.rendered=true;
            this._ensurePanels()
            var container=$d(container)||(this._parent?this._parent.$content():$d(document.body))
            var newel
            if(!container.contains(this.el)) {

                if (this.selector) {
                    if (container && container.has(this.selector)) {
                        newel = $d(container.q(this.selector).el.appendChild(this.el.el));
                    }
                } else    {
                    newel = $d(container.el.appendChild(this.el.el))
                }
            }
            if(newel && newel.el!==this.el.el){
                this.el=newel;
            }
            if (this.el &&  !this.el.parent() ) {
                this.el=$d(document.body.appendChild(this.el.el))
            }
            if(this.klass){
                this.el.addClass(this.klass)
            }
            if(this.styles){
                this.el.css(this.styles)
            }
            this.renderedPromise && this.renderedPromise.resolve(this.el)
            if(!$d.attr(this.el,"z-scope")){
                if(!this.uuid){this.uuid=this.id}
                $d.attr(this.el,"z-scope",this.uuid)
            }
            this.afterRender();
            if(this.visible) {
                this.digest(true)
            } else{
                if(this.autoshow){
                    this.show();
                }
            }


            this.observer.fireAsync("afterRender")


        },
        render: function (container) {
            if(this.renderedPromise){
                return this.renderedPromise;
            }

            var pr=this.renderedPromise=Promise.deferred()
            //pr.then(this._onrender.bind(this))

            this.beforeRender();
            if(this.rendered){
                return pr
            }

            this._oldel=this.el
            this.el = this.el||$d(document.createElement("div"))
            if(this.model && this.title){
                this.model.setItem("title",this.title);
            }
            var idselector="[data-uuid='"+this.uuid+"']",rendered=0;
            var curr=this.el.q(idselector),pending
            if(curr){
                curr.remove();
            }

            if(this.model && this.logic){
                var logic=this.logic;
                if(typeof(this.logic)=="function"){
                    logic=this.logic()
                }
                if(logic){this.model.update(logic);}
            }
            if(this._origid && !this.template && typeof(app)!="undefined"){
                if(app.hasResource(this._origid)){
                    this.template=this._origid;
                }
            }
            if(!this.templatefn && this.template){
                if(typeof(this.template)=="function"){
                    this.templatefn=this.template
                }
                else if( typeof(this.template)=="string"){
                    if(this.template.indexOf("<")==0){
                        this.templatefn = $.template(this.template)
                    }else{
                        var res=typeof(app)!="undefined" && app.getResource?app.getResource(this.template):null
                        if(res && typeof(res)=="string"){
                            this.setContent(res)
                            this._onrender( container) ;
                        } else{
                            this.fragmentview=$.fragmentview(this.template)
                            pending=1
                            this.fragmentview.load().then(function(frag){
                                this.setContent(frag)
                                this._onrender(container ) ;
                            }.bind(this));
                        }


                    }
                }
                if(this.templatefn){
                    var frag=this.templatefn(this.model)
                    this.setContent( frag)
                    this._onrender(container ) ;
                }
            } else{


            }
            if(!this.rendered && !pending){
                this._onrender( container) ;
            }
            if(!pending){
                //pr.reject();
                this.renderedPromise=null;
            }



            return pr
        },
        beforeRender: function () {
            this.observer.fire("beforeRender")
        },
        afterRender: function () {
        }
    }
    proto.isSimpleView=true;
    proto.addChildView=proto.add
    var SimpleView=Klass("SimpleView",proto);
    SimpleView.isView=function(nu){
        return typeof(nu)=="object" && (nu.__isSimpleView || (nu instanceof SimpleView) || (nu.__super  && nu.__super instanceof SimpleView))
    }
    SimpleView.panel=Klass("SimpleView.panel",SimpleView,{
        init:function( ) {
            this.$=this.$||$d.util.createScopedDollar("el")
            this.el = this.el||$d(document.createElement(this.tagName||"div"))
            this._ensurePanels()
            this.$content = $d.util.createScopedDollar(".view-content","el")
            this.$header = $d.util.createScopedDollar(".view-header","el")
            this.$footer = $d.util.createScopedDollar(".view-footer","el")
            this.initView()
        },
        _ensurePanels:function(){
            this.el.q(".view-content")||this.el.append("div.view-content")
            this.el.q(".view-header")||this.el.prepend("div.view-header")
            this.el.q(".view-footer")||this.el.append("div.view-footer")
        }
    })
    SimpleView.collection=Klass("SimpleView.collection",SimpleView,{
        models:null,modelType:null,viewTypet:null,
        list:null,
        init:function( ){
            var view=arguments[0]
            if(view && typeof(view)=="function" ){
                this.viewType=view;
            }
            this.list=List.from([])

            List.Observable(this.list)
            this.initView()
        },
        ensureList:function(){

            if(!this._savedmodels || ($.isArrayLike(this.models) && this.viewType && !this.children.length)){
                this._savedmodels=this._savedmodels||([])
                var models=this.children.map(function(c){return c.model})
                var savedmodels=this._savedmodels.map(function(c){return c.__origdata})
                var mdlctor=this.modelType|| $.model,viewType=this.viewType;;
                var nulist=[]
                for(var i= 0,l=this.models||[],ln= l.length;i<ln;i++){
                    var mdl
                    if(savedmodels.indexOf(l[i])>=0){
                        nulist.push(this._savedmodels[savedmodels.indexOf(l[i])])
                        continue
                    }
                    if(l[i] && l[i].__isModel){mdl=l[i]}
                    else if(mdlctor){
                        mdl=new mdlctor(l[i])

                    }
                    if(mdl){
                        mdl.__origdata=l[i]
                        nulist.push(mdl)
                    }
                }
                for(var i= 0,l=nulist,ln= l.length;i<ln;i++) {
                    if(models.indexOf(nulist[i])==-1){
                        nulist[i].index=i;
                        this.addChildView(new viewType({model: nulist[i], autoshow: true}))
                    }
                }
                for(var i= 0,l=(this.children||[]).slice(),ln= l.size();i<ln;i++) {
                    if(!(l[i] && l[i].model)){continue}
                    if(nulist.indexOf(l[i].model)==-1){
                        l[i].destroy && l[i].destroy();
                    }
                }
                this._savedmodels=nulist;
                this.children.sort(function(a,b){
                    return (a.model||{}).index - (b.model||{}).index
                })
            }
        },

        beforeRender:function(){
            this.ensureList();
        }

    });
    ZModule.register("SimpleView",SimpleView)
    $.View=SimpleView
})();

