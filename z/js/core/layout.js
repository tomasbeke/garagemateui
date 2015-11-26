if(!("UI" in self)){UI={}};
UI.viewUtils={}
UI.viewUtils.newoftype=function _newoftype(obj){var o=obj||{},nu
    if(o && o.constructor){
        try{nu=new (Function.prototype.bind.apply(o.constructor, [null].concat($.makeArray(arguments,1))))} catch(e){}
    }
    if(!nu){nu=Object.create(Object(o))}
    return nu
}
UI.viewUtils.__idcounter=0
UI.viewUtils.each=function _each(obj,fn,ctx){
    for(var i= 0,l=Object.keys(obj),ln= l.length,k;k=l[i],i<ln;i++){
        fn.call(ctx||null,obj[k],k,obj)
    }
}
UI.viewUtils.isplain=function _isplain(o){
    return o && typeof(o)=="object"&& Object.getPrototypeOf(o)==Object.prototype
}
UI.viewUtils.extend=function _extend(){
    var trgt,srcs,a=$.makeArray(arguments)
    if(!a.length){return {}}
    if(a.length==1){srcs=a;trgt=UI.viewUtils.newoftype(srcs[0])}
    else{trgt= a.shift();srcs=a}
    while(srcs.length){
        UI.viewUtils.each(srcs.shift()||{},function(v,k){trgt[k]=v})
    }
    return trgt
}
UI.viewUtils.defineVals=function defineVal(o,v1){
    var props={}
    Object.keys(v1).forEach(function(k){var v=(typeof(v1[k])=="object"&&("__v" in v1[k]))?v1[k]:{__v:v1[k]}
        props[k]={value: v.__v,enumerable: !!v.e,writable:!!v.w,configurable:!!v.c}
    });
    $.defineProperties(o,props);  return o
}

UI.viewUtils.defineAccsrs=function defineAccsrs(o,v1){
    var props={}
    Object.keys(v1).forEach(function(k){  var v=v1[k]
        props[k]={get: v.g||function(){},set:v.s||function(){},enumerable: !!v.e,configurable:!!v.c}
    });
    $.defineProperties(o,props); return o
}
UI.viewUtils.isArguments=function isArguments(a){
    return ((a&&({}).toString.call(a).indexOf("rguments")>0))
}
UI.viewUtils.isLayout=function isLayout(l){
    UI.viewUtils.los||(UI.viewUtils.los=Object.keys(Layout.impl).filter(function(it){var lo=Layout.impl[it];return it!="base"&&lo&&lo.prototype && typeof(lo.prototype.layout)=="function"}).map(function(it){return it.toLowerCase()}));
    return UI.viewUtils.los.indexOf(String( l).toLowerCase())>=0

}

function layoutOptions(parlayout,addtnlopts){
    var defaultopts={
        id:null,location:null,layout:null,layouts:[],index:0,
        panels:[],resizable:false,draggable:false,collapsible:false,positioned:false,
        rect:{},ui:{},uiklass:[],styles:{},
        height:null,	width:null,	top:null,	left:null,	bottom:null,	right:null,	padding:null,	margin:null,
        inset:null,	outset:null,	insets:null,	outsets:null,

        hideHeader:false,hideFooter:false,hideFrameBars:false,
        createTrigger:false,header:{},footer:{},headerHeight:0,footerHeight:0,
        onshow:null,onhide:null,onrender:null,
        row:null, col:null, rowspan:null, colspan:null,
        hideOnBlur:false,hideOnEsc:false,
        allowdrag:null,  maxtilesperrow:null,  tileminheight:null,  tilewidth:null,  tileminwidth:null,  tilefooter:null,
        url:null,content:null,title:null
    }
}
function viewArgs(){
    var args=$.makeArray(
        UI.viewUtils.isArguments(arguments[0])?arguments[0]  :arguments
    )
    if(args.length==1 && UI.viewUtils.isArguments(args[0])){args=[].slice.call(args[0])}
    if(args.length==1 && UI.viewUtils.isArguments(args[0])){args=[].slice.call(args[0])}

    if(args.length==1 && args[0] && args[0].__parsed){return args[0]}
    if(args.length==1 && Array.isArray(args[0])){args= args[0] }


    var a=$.simpleModel({},{caseinsensitive:true})
    a.addProperties([{name:"styles",reader: "map",alias:["_styles","style"]},
        {name:"rect",reader: "map"},
        {name:"uiklass",reader: {name:"list",delim:/[\s,]+/},alias:["klass"]},
        {name:"components",reader: "list",alias:[]},
        {name:"layouts",value:{},reader: function (v, curr, obj) {
            curr = (curr||$.isPlain(curr)) ? curr : {}
            if (v == null) {return curr}
            var nu = v
            if(typeof(v)=="string"){
                nu=nu.split(/\s+/).reduce(function(m,k,i,arr){m[k] = {}
                    return m
                },{})
            } else if ($.isArrayLike(nu)) {
                nu = {}
                $.each(v, function (it, i) {  nu[it] = {}   })
            }
            if ($.isPlain(nu)) {
                return    $.extend(curr, nu)
            }
            return curr
        },alias:["_layouts","layout"]}
    ]);

    /*a.getDescriptor("styles").valueHolder.__stringParser=function(v){
        return v.split(/\s*;\s*!/).reduce(function(m,k,i,arr){var a= k.split(/\s*[:=]\s*!/);if(a.length==2){m[a[0].trim()]=a[1].trim()}
            return m
        },{});
    }*/
    a.styles={}
    a.uiklass=[]
    a.components=[]
    a.layouts={}
    var cb;
    if(typeof(args[0])=="string"){
        a.id=args.shift()
        if(UI.viewUtils.isLayout(a.id)){
            a.layouts[a.id]={}
        }
        if(["top","left","right","bottom","center"].indexOf(a.id)>=0){ a.location= a.id}
    }
    if(typeof(args[args.length-1])=="function"){
        cb=args.pop()
    }
    if(this.isClickable && this.isClickable()&&args.length){
        if(cb){a.onselect=cb;cb=null}
        else if(typeof(args[0])=="object"&&typeof(args[0].select)=="function"){a.onselect=args[0].select;delete args[0].select}
    }
    while(args[0]&&typeof(args[0])=="string"){
        var v=args.shift();
        if(UI.viewUtils.isLayout(v)) {
            a.layouts[v] = {}
        } else if(["resizable","draggable","collapsible","positioned"].indexOf(String(v).toLowerCase())>=0){
            a[v]=true;
        } else{

        }
        if(!a.location&&["top","left","right","bottom","center"].indexOf(a.id)>=0){ a.location= a.id}
    }
    if(args[0]&&Array.isArray(args[0])){
        var arr=args.shift()
        for(var i= 0,l=arr,ln=l.length;i<ln;i++){
            if(typeof(arr[i])=="string"){
                var v=arr[i];
                if(UI.viewUtils.isLayout(v)){
                    a.layouts[v]={}

                } else{

                }
            } else if(typeof(arr[i])=="object"){
                $.each(arr[i],
                    function(v,k){
                        if(UI.viewUtils.isLayout(k)){
                            a.layouts[k]=v
                        } else{


                        }
                    }
                )
            }
        }
    }
    if(args[0]&& $.isPlain(args[0])){
        var obj=args.shift()
        $.each(obj,
            function(v,k){
                if(v==undefined){return}
                if(k=="id"){a.id=v}
                else if(k=="content"){
                    a.domcontent=v;
                    delete obj.content
                }
                else if(["top","left","right","bottom","center"].indexOf(k)>=0&& v && typeof(v)=="object"){  a.layouts[k]=v}
                else if(["top","left","right","bottom","height","width"].indexOf(k)>=0&&/^[\d\.]/.test(String(v))){
                    if(!a.rect){a.rect={}}
                    a.rect[k]= v
                }else if(a.contains(k)){
                    a[k]=v
                }else if($d.css.isStyle(k)){
                    a.styles[k]= v
                }
                else if(typeof(v)=="string" && UI.viewUtils.isLayout(k)){
                    a.layouts[k]=v
                } else{
                    if(k=="layout"){
                        if(typeof(v)=="string"){v.split(/[\s,]+/).forEach(function(j){a.layouts[j]={}})}
                        else if(Array.isArray(v)){v.forEach(function(j){a.layouts[j]={}})}
                        else {}

                    }
                    else{a[k]=v}
                }
            }
        )
    }
    if(a.header||a.headerHeight||a.footer||a.footerHeight){
        if(!a.layouts){a.layouts={}}
        a.layouts="frame"
    }
    if(a.panels){
        if(typeof(a.panels)=="object"){
            $.each(a.panels,function(v,k){
                if(isNaN(k)){v=v||{}
                    if(typeof(v)=="string"){v={layouts:v}}
                    v.id=k
                    a.components=v
                }
                a.components=v
            })
        } else{

        }

    }
    if(args.length){
        alert("more args")
        for(var i= 0,l=args,ln=l.length;i<ln;i++){
            if(l[i]=="__parsed"){continue}
           // anls(l[i],null,a);

        }
    }

    a.__parsed=true
    if(a.content){
        a.domcontent= a.content;delete a.content
    }
    if(a.hidefooter){a.hideFooter=a.hidefooter}
    if(a.hideheader){a.hideHeader=a.hideheader}
    return a;
}

//function View( ){
//if(this === self){return new View(View.viewArgs.apply(this,$.makeArray(arguments)))}
//   this._init.apply(this,arguments)
//}
;(function UILayout( ){

    function _renderer(view){
        this._view=view;
        this._template=null
        this._elementtemplate=null
    }
    _renderer.prototype={
        render:function(nm,args){
            if(args==null){args=[]}
            else if(typeof(args)!="object"){args=[args]}
            var mthd=this._methods[nm]||this[nm]  ||this._view[nm]
            if(typeof(mthd)=="function"){
                return mthd.apply(this._view,Array.isArray(args)?args:[].slice.call(args||[]))
            }
            return null
        }

    }

    var Component=$.Component=self.Component=Klass("Component",{
        config:null,  needsRedraw:null, hidden:"no",  isComponent:true ,
        init:function(id){
            this.initComponent.apply(this,arguments);
        } ,
        //onInitialize1:function(){var args=[].slice(this.__tempargs||[]);delete this.__tempargs; this.initComponent(args);},
        initComponent:function(a){
            this.needsRedraw=true
            this.$=$d.util.createScopedDollar("el")
            var config= viewArgs.call(this, UI.viewUtils.isArguments(arguments[0])?arguments[0]:arguments);

            if(config && config.isComponent){return config}
            var _id=    config.id||config.location||("uicomponent_"+(++UI.viewUtils.__idcounter))
            var compo=List.Observable([]).setKeyProvider("id");

            var props={
                id:{value:_id,writable:false,enumerable:true,configurable:false},
                panels:{get:function(){
                    return this.components.findAll(function(it){
                        return it &&!(it.hasLayout("FrameBar")||it.isPositioned())
                    });
                },set:function(){},enumerable:true,configurable:false},
                components:{value:compo,writable:false,enumerable:true,configurable:false},
                config:{value:config,writable:false,enumerable:true,configurable:false},
                computed:{
                    get:function(){
                        var nu=UI.Rect.create(this.rect.toMap(true));delete this.computed;
                        nu.setAlignment(this.rect.getAlignment())

                        $.defineProperty(this,"computed",{value:nu,writable:false,configurable:false,enumerable:true})
                        return nu;
                    },
                    set:function(v){ },
                    enumerable:true ,configurable:true
                },
                viewlayouts:{value:List.create().setKeyProvider( "name"),enumerable:true,configurable:false},
                rect:{value:UI.Rect.create(),enumerable:true},
                uiklass:{get:function(){return this.config.uiklass||(this.config.uiklass=[])},
                    set:function(v){
                        this.config.uiklass=v;
                    },enumerable:true
                },
                styles:{
                    get:function(){return this.config.style} ,
                    set:function(v){  v!=null && (this.config.style=v) },enumerable:true
                },
                el:{
                    get:function(){
                        if(!this.__el){
                            this.__el=(this.config.el&&$d(this.config.el))||$d(this._crEl())
                            this.__elid=this.__el.id
                        }
                        return this.__el;
                    },
                    set:function(el0){  if(!el0){return}
                        var el=el0?el0.el||el0:null,c=this.config,curr=(this.__el||{}).el||this.__el;
                        if(el&& !(curr===el)){
                            if(curr && curr.parentNode){
                                curr.parentNode.removeChild(curr);
                            }
                            //el.classList.add("layout-panel")
                            this.__el=$d(el);
                            this.__elid=this.__el.id;
                            this.config._content=null;
                        }
                    },configurable:false,enumerable:true
                },
                contentWrap:{
                    get:function(){
                        if(!this.config._content && this.hasLayout("panel")){
                            var nu=this._crEl(true)
                            nu.className="layout-panel-content pre-attach"
                            this.contentWrap=nu;

                        }
                        return this.config._content||this.el
                    },
                    set:function(el0){ if(!el0){return}
                        var el=el0?el0.el||el0:null,c=this.config;
                        var curr=c._content;curr=curr?curr.el:null
                        if(el&& curr!=el){
                            if(el.parentNode!==this.el.el&&el!==this.el.el){
                                if(curr){el=this.el.el.insertBefore(el,curr)}
                                else{el=this.el.el.appendChild(el)}
                            }
                            try{if(curr && curr!=this.el.el&& curr.parentNode){curr.parentNode.removeChild(curr)}} catch(e){
                                console.error(e,curr,el)}
                            var nu=$d(el);
                            c._content=nu
                            $d.addClass(c._content,"layout-panel-content");

                            this.setContentDims()
                        }

                    }
                    ,configurable:false,enumerable:true
                }
            }
            $.defineProperties(this,props);
            if(config.layoutOptions){this.config=config.layoutOptions}
            if(config.el){this.el=config.el;delete config.el}
            var content=config.content||config.domcontent
            if(content&&content.nodeType){this.contentWrap=content;delete config.content;delete config.domcontent}
            else {

            }
            if(config.rect){ this.rect.setBounds(config.rect); }
            var dims=[ "padding","margin","insets","outsets"];
            // var al="tl";if(config.right!=null||config.bottom!=null){al=config.right==null?"b":config.bottom==null?"r":"br"}
            for(var i= 0,l=dims;i< l.length;i++){
                if(config[l[i]]){
                    var v=config[l[i]];
                    if(Number(v)>=0){   v={top:v,left:v,right:v,bottom:v} }
                    if(l[i]=="padding"||l[i]=="insets"||l[i]=="inset"){
                        this.rect.padding.update(v)}
                    else if(l[i]=="margin"||l[i]=="outsets"||l[i]=="outset"){
                        this.rect.margins.update(v)}

                }
            };

            $.each(this.config.layouts,function(v,l){this.addLayout(l,v)},this)
            $.each(this.config.components,function(v,l){this.add(v)},this)

            this.__initcomplete=true
        } ,
        observerInit:function(obs){
            for(var i=0,l=Object.keys(this.config||{}),ln=l.length,k;k=l[i],i<ln;i++){
                if(k&&typeof(this.config[k])=="function"&&String(k).indexOf("on")==0){
                    obs.on(k.substr(2),this.config[k])
                    this.config["_"+k] =this.config[k];delete this.config[k];
                }
            }
        },
        $content:function(sel){return sel?this.contentWrap.q(sel):this.contentWrap},
        setConfig:function(k,v){this.config[k]=v;return this},
        addAbs:function( config0){var config=config0||{}
            if(typeof(config0)=="string"){config={pos:config0}}
            var css={},margins=[0,0],pos=(config.pos||"left").toString().toLowerCase()
            delete config.pos

            var c=new $.Component(config),rect=c.rect;
            c.config.positioned=true
            if(pos.indexOf("top")>=0){rect.top=0.2}
            if(pos.indexOf("left")>=0){rect.left=0.2}
            if(pos.indexOf("bottom")>=0){rect.bottom=0.2}
            if(pos.indexOf("right")>=0){rect.left=0;rect.right=rect.right||1;}
            rect.setAlignment(pos)
            if(pos.indexOf("center")>=0){
                c.config.styles={margin:/top|bottom/.test(pos)?"0 auto":"auto 0"}
            }
            this.add(c)
            c.__layout=c.layout
            c.layout=function(){
                //  this.rect.setAlignment(pos)
                this.__layout.apply(this,arguments)
            }
            //c.on("afterrender",function(){this.rect.applyCss(this.el);} );
            return c
        },
        addInline:function(compo,config0){
            var config=config0||{}
            config.fitcontent=true;
            var c=new $.Component(config);
            return c;
        },
        add:function(){
            return this.addChild.apply(this,arguments)
        },
        addChild:function(a0){
            var a=a0;
            if(!(a0 && a0.isComponent)){
                if(this.isView){
                    a=new $.View( viewArgs.call(this,arguments))
                } else{a=new $.Component( viewArgs.call(this,arguments))}

            }
            if(a&&a.isComponent){
                a._parent=this;
                a.config.index=this.components.size()  ;
                this.components.push(a);
            }
            var id= a.id;
            if(id && !(id in this)) { this[id]=a;}
            return a;
        },
        setRect:function(){this.rect.setBounds.apply(this.rect,arguments)},
        getRect:function(){return this.rect},
        fill:function(){
            this.viewlayouts.unshift(new Layout(this._parent?"fill":"viewport") );
        },
        fillViewPort:function(){
            this.viewlayouts.unshift(new Layout("fill") );
        },
        getViewPort:function(){
            var b;
            if(this._parent){
                b=this._parent.getContentDims()
                var bb=this._parent.el.getBoundingClientRect();
                b.top+=bb.top;b.left+=bb.left
            } else{
                b=new UI.Rect($.viewPort.get());
            }
            return b
        }   ,
        insertGlyph:function(shape,cntnr){
            var  svgNS = "http://www.w3.org/2000/svg",s=document.createElementNS(svgNS,"svg"),
                p=s.appendChild(document.createElementNS(svgNS,"path"));
            p.setAttributeNS(null,"d","M5,5 l5,5 l5,-5 Z");
            s.style.height="20px";
            p.setAttributeNS(null,"fill","#ccc");
            if(cntnr){
                cntnr.appendChild(s)
            }
            return s
        } ,
        addButton:function(){
            if($.isArray(arguments[0])){var config=arguments[1]
                arguments[0].forEach(function(it){this.addButton(it,config)},this)
                return this
            }
            var optns={},a=$.makeArray(arguments),callback;


            if(typeof(a[a.length-1])=="function"){callback= a.pop()}
            if($.isPlain(a[a.length-1])){optns= a.pop();}
            if(a.length>=1){
                if(typeof(a[0])=="string"){optns.name=a[0]}
                if(typeof(a[1])=="string"){optns.location=a[1]}
            }
            callback&&(optns.callback=callback);
            var frbar ,bar,but

            if(!optns.location){
                frbar=this.buttonBar||this.footerbar
                bar=frbar?frbar.el.q(".ui-button-bar"):this.el.q(".ui-button-bar")

            } else {
                frbar =frbar||this[String(optns.location=="bottom"||optns.location=="footer"?"footer":"header")+"bar"]
            }
            if(!frbar && !bar){bar=this.el.q(".ui-button-bar")||this.buttonBar}
            if(!frbar && !bar){
                frbar= Layout.impl.FrameBar.setup("buttonBar", optns.location||"bottom",this ,{ height:40, style:{whiteSpace:"nowrap"} })



            }

            if(!bar && frbar ){
                if(!(bar=frbar.el.q(".ui-button-bar"))){
                    frbar.el.insert("<div class='ui-button-bar ui-button-bar-center'></div>")
                    bar=frbar.el.q(".ui-button-bar")
                }
            }
            var name=optns.name||optns.key||optns.label,label=optns.label||String(name).replace(/^\w|-\w|_/g,function(a,b){return ((a[0]=="-"||a[0]=="_")?a.substr(1):a).toUpperCase()})
            if(frbar){
                if(frbar.rect && frbar.rect.height<20){
                    frbar.rect.height=40;
                }
                if(this.isVisible()){
                    this.layout();
                } else{
                    //frbar.layout();
                }
            }
            if(bar){
                if(bar.isView){bar=bar.el}
                bar=$d(bar)
                if(bar!=this.buttonBar){this.buttonBar=bar}
                var kls=[].concat("ui-button", optns.small?["small"]:"",optns.klass||[]).join(" ");
                var html="<button class='"+kls+"' data-key='"+name+"'>"+label+"</button>"
                if(optns.ascombo){
                    html="<span  class='"+kls+"' data-key='"+name+"'><span class='button-text' style='line-height: 1.2;margin-right:10px;'>"+name+"</span><span class='combo-glyph' style='display:inline-block; border-left:1px solid #999;width:16px;float:right;'></span></span>"
                }
                if(bar.html().trim()=="."){bar.el.innerHTML=""}
                but=bar.append(html)

                if(optns.klass){bar.addClass(optns.klass)}
                if(optns.style){bar.css(optns.style)}
                var g=but.querySelector(".combo-glyph")
                if(g){ but.style.height="1.4em";but.style.paddingRight="5px"
                    $d.css(but.querySelector(".button-text"),{"float":"left",lineHeight: 1.2});
                    this.insertGlyph("",g)
                }
                if(!$d.isAttached(but)){
                    $d.onAttach(but,function(){
                         $d(but).on("click",optns.callback.bind(this))
                     }.bind(this))
                }
                else {
                    $d(but).on("click",optns.callback.bind(this))
                }
                 if(optns.align){
                    bar.addClass("ui-button-bar-"+optns.align)
                }
                but.disable=function(){this.disabled=true}
                but.enable=function(){this.disabled=null}
            };

            return but
        },
        render:function(dom){ return },
        reLayout:function(){  return this.layout(true)},
        resetLayout:function( ){
            this.computed.reset(this.getRect().toMap(true));
            this.el && this.el.st(".resizer").remove();
            this.data("_layoutsession",0)
            var aln=this.getRect().getAlignment()
            if(aln){
                this.computed.setAlignment(aln)
            }
            for(var i=0,l=this.components,ln= l.length,it;it=l[i],i<ln;i++){
                it.resetLayout();
            }
            return this;
        },
        scanBindings:function scanBindings(){
            this.el.compile(this,null)
        },
        getContentDims:function(){
            var m=this.contentWrap.data("_saveddims")
            if(m){
                delete m.height; delete m.width;delete m["undefined"]
            }


            var ret=m||{top:0,left:0,right:0,bottom:0},htoffset=0;
            this.contentWrap.css({margin:0})
            if(m){
                this.contentWrap.data("_saveddims",m);
            }
            if(!this.computed){return ret}
            if(this.components.size()){
                var panellinksbar=this.panellinksbar
                var fr=this.components.filter(function(it){return it&&it.hasLayout("framebar")&&it.isVisible()}).forEach(
                    function(it){
                        if(panellinksbar && panellinksbar===it){panellinksbar=null}
                        var d=it.data("dim");if(!it.el){return}
                        //to relative
                        if(it.config.location=="top"||it.config.location=="bottom"){
                            htoffset+=(it.computed||it.rect).getAt("height",true)||0
                        }
                        //ret[it.config.location=="top"?"height1":it.config.location]+=(it.computed||it.rect).getAt(d,true)||0

                        //ret[it.config.location]+=(it.computed||it.rect).getAt(d,true)||0
                    }
                );
                if(panellinksbar){
                    htoffset+=(panellinksbar.computed||panellinksbar.rect).getAt("height",true)||0
                }
            }  ;

            var bb=new UI.Offset()//this.computed.getContentbox()
                ,insets=this.getRect().getInsets()
            ret.left+=(bb.left+(insets.left||0));ret.right+=(bb.right+(insets.right||0))
            ret.top+=(bb.top+(insets.top||0)); ret.bottom+=(bb.bottom+(insets.bottom||0));
            ret.height=this.computed.height-(ret.top+(ret.bottom||0)+htoffset )
            if(ret.height<=0){ret.height=this.el.height()-this.contentWrap.offsetTop
            }
            //Width removed
            //ret.width=this.computed.width-(ret.left+(ret.right||0) );
            //if(ret.width<=0){ret.width=this.el.width()}
            if(ret.top==0){ret.top=0.2}
            delete ret.bottom;delete ret.right ;
            return new UI.Rect(ret);
        },
        insertContent:function(c,clear){
            if(c=="."){alert(88)}
            this.contentWrap.insert(c,clear?"refresh":"append");
            return this;
        },

        befshow:function(){
            $d.removeClass(this.el,"_hidden");
            this.hidden="no";

            this.el.style.display="";this.el.style.visibility="visible"

            this.fire("beforeshow");
            //if(this.components.length )
            if(!this.state.layoutcompleted || this.components.some(function(it){return !it.state.layoutcompleted})){
                this.layout(true)
            }
            if(this.config.animateShow){
                var animoptions=typeof(this.config.animateShow)=="object"?this.config.animateShow:{}
                animoptions.anchor=this.config.animateShow.anchor||""
                if(!animoptions.anchor){
                    if(this.config.bottomAligned){animoptions.anchor +="b"}
                    if(this.config.rightAligned){animoptions.anchor+="r"}

                }
                if(animoptions.anchor && animoptions.anchor.length<=3){animoptions.anchor=animoptions.anchor.charAt(0)}
                 this.el.appear(animoptions);
             }
            return this;
        },
        aftshow:function(){
            if(this.el.hasClass("__hh")){ }
            if(!this.state.firstlayoutcompleted){
                //this.observer.register("show",{throttle:{delay:10,immediate:true}});
                //this.observer.register("hide",{throttle:{delay:10,immediate:true}});
            }
            this.hidden="no";
            if(!this.state.firstlayoutcompleted){this.state.firstlayoutcompleted=true}
            if(this.needsRedraw){
                this.layout();
            }
            this.fire("show");
            if(this.isVisible()){
                this.components.each(function(it){
                    if(it.isVisible()){it.fire("show")}
                });
            }
            this.observer.fireAsync("aftershow");
            return this;
        },
        showAll:function(){this.panels.invoke("show");return this;},
        forceShow:function(){
            if(this._parent && !this._parent.isVisible()){
                this._parent.forceShow()
            }
            return  this.show()
        },
        show:function(){
            this.befshow()
            this.aftshow()
            return this},
        befhide:function(){
            return this;
        },

        afthide:function(){
            this.hidden="yes";
            function _do(){
                this.el.addClass("_hidden")
                this.el.style.display="none"
                this.el.style.visibility="hidden"
                this.fire("hide");
                this.components.each(function(it){it.fire("hide")});
            }
            if(this.config.animateHide){
                var ths=this
                var anim=this.el.disAppear().then(_do.bind(this))

            } else{
                _do.call(this)
            }

            return this;
        },
        hide:function(){
            this.hidden="yes";
            var p=this.befhide();
            if(p&&p.then){
                p.then(this.afthide.bind(this))
            }else{this.afthide()}
            return this  },
        isHidden:function(){
            if(this.hidden==="yes" || (this._parent &&  this._parent.isHidden())){return true}
        },
        isVisible:function(){
            if(!(this.el.isAttached()&&this.el.isVisible())){return false}
            if(this._parent && !this._parent.isVisible()){return false}


            var ishidd=this.isHidden();
            if(!ishidd&&this._parent&&this.hasLayout("framebar")&&
                ((this._parent.headerbar==this  &&(this._parent.config.hideFrameBars|| this._parent.config.hideHeader))
                ||(this._parent.footerbar==this  &&(this._parent.config.hideFrameBars|| this._parent.config.hideFooter))
                )){
                ishidd=true   ;
            }
            if(!ishidd&&this.el.hasClass("_hidden")){this.hidden="yes"; }
            return !ishidd
        },
        isPositioned:function(){return !!this.config.positioned},
        iscollapsed:function(){return this.state.collapsed},
        _crEl:function(rel){
            var nu=document.createElement("div");
            //nu.className="layout-panel" ;
            nu.style.position="relative"
            //nu.style.display="relative"
            return $d(nu);
        },
        attach:function(cntnr,dom){
            if(!(this._attached && this.el)){
                if(cntnr){this.config.container=cntnr;}
                if(!this.config.container && !this.isRoot()&&this._parent){this.config.container=(this.hasLayout("FrameBar")||this.isPositioned())?this._parent.el:this._parent.contentWrap}
                this._attach(this.config.container,dom);
             }
        },
        expand:function( ){this.state.collapsed=null;
            if(this.data("_savedRect")){ this.rect.update(this.data("_savedRect"));this.data("_savedRect",null);}
            if(this.state.layoutcompleted){
                if(this.isPositioned()||!this._parent){this.layout( )}
                else {this._parent.layout( )}
            }
            return this;
        },
        collapse:function( ){
            var optns=this.config ||{},anchorPos=(optns.anchorPos?String(optns.anchorPos):optns.location||"l").toLowerCase();
            ["top","left","right","bottom"].forEach(function(it){anchorPos=anchorPos.replace(it,it.charAt(0))});
            var _savedRect=this.rect.toMap(true),nu=this.rect,curr=this.getRect();nu.update(curr.toMap(true));
            this.data("_savedRect",_savedRect);
            if(!curr.getAlignment()&&anchorPos){curr.setAlignment(anchorPos);}
            anchorPos=curr.getAlignment()

            if(anchorPos.indexOf("b")>=0||anchorPos.indexOf("t")>=0){nu.height=20}
            if(anchorPos.indexOf("l")>=0||anchorPos.indexOf("r")>=0){nu.width=20}
            if(anchorPos.indexOf("b")>=0){nu.top=nu.top+(nu.height-20)}
            if(anchorPos.indexOf("r")>=0){nu.left=nu.left+(nu.width-20)}
            this.state.collapsed=true;
            if(this.state.layoutcompleted){
                if(this.isPositioned()||!this._parent){this.layout(true)}
                else {this._parent.layout( )}
            }
            return this;
        },
        applyUI:function( ){
            var cmp=this.computed;
            if(this.config.positioned &&this.config.styles.position!="fixed"){
                this.config.styles.position="absolute"
            }

            this.el.css(this.config.styles)
            var klass=$.makeArray(this.config.uiklass);
            this.config.uiklass=null;
            if(this.isView){
                klass.unshift("defBg");klass.unshift("layout-panel")
                this.isView=true
            } else{
                klass.unshift("def-content-style");klass.unshift("layout-component")
                this.isComponent=true
            }
            if(!this.isRoot()&&(!this.computed.height||!this.computed.width)){
                if(this._parent.panels.length==1&&!this.hasLayout("FrameBar")){
                    var rect=this._parent.getContentDims()
                    if(rect.height>0&&rect.width>0){
                        this.computed.width=rect.width;
                        this.computed.height=rect.height
                    }
                }
            }
            if(this._attached&&cmp&&cmp.notReady!==true){
                //  this.el.style.cssText=""

                var css=cmp.getCss(this.el);
                var layouts=this.config.layouts

                if(!this.isPositioned()){
                    delete css.top
                    delete css.left
                    if(this.hasLayout("relative")||this.el.css("position")=="relative"){
                        delete css.width
                    }
                    css.position="relative";
                    if(css.height){
                        if(this.hasLayout("relative")){
                            if(!this.hasLayout("fill")){
                                css.minHeight=css.height
                                delete css.height;
                            }

                        }
                        //css.minHeight=css.height
                    }
                }
                if(this.config.style && this.config.style.position){
                    css.position=this.config.style.position
                }
                this.el.css(css)

                if(this.config.fitcontent){
                    //this.el.css({height:"auto"  })
                }
            }

            if(this.footerbar&&(this.config.hideFrameBars|| this.config.hideFooter|| this.hideFooter)){
                this.footerbar.hide() ;
                this.footerbar.hidden=true
            }
            if(this.headerbar&&(this.config.hideFrameBars|| this.config.hideHeader)){

                this.headerbar.hide()
                this.headerbar.hidden=true
            }
            if(this.config.fitcontent&&this.footerbar&&!this.footerbar.hidden){

            }
            if(this.config.location){this.el.dataset.loc=this.config.location;
                klass.unshift("layout-location-"+this.config.location)
            }
            if(this.id){this.el.dataset.id=this.id}
            this.viewlayouts.forEach(function(lo){if(!lo.name){if(lo.constructor){lo.name=String(lo.constructor.name).split(/\_/).pop()  }}

                lo.name&&klass.unshift("layout-"+String(lo.name).toLowerCase())});
            this.config.uiklass=klass;

            var all=[].concat(klass).join(" ").split(/\s+/)
            var arrows=all.filter(function(a){return a.indexOf("arrow_box-")==0})
            if(arrows.length){
                this.el.removeClass(["arrow_box-top","arrow_box-right","arrow_box-bottom","arrow_box-left"])
            }
            if(arrows.length>1){
                var arrow=arrows.pop();
                while(arrows.length){
                    all.splice(all.indexOf(arrows.shift()),1)
                }
                all.push(arrow);
            }
            var i=all.indexOf("defBg")
            if(i>=0){all.splice(i,1)}
            all.unshift("defBg")
            this.el.addClass(all)
            if(this.headerbar&&(this.config.hideFrameBars|| this.config.hideHeader)){
                this.headerbar.hide()
            }
            if(this.el.css("height")=="0px"){
                this.el.css("height","auto")
            }
            this.setContentDims();
            if(!this.data("plugin_proc")){
                setTimeout(function(){
                    this.data("plugin_proc",1)
                    try{
                        if(this.config.draggable){
                            View.plugins.draggable.attach(this,(this.headerbar||this.data("draghandle")||this ) );
                        }
                        if(this.config.resizable ){  //|| (this.config.location && this._parent && this.config.index<(this._parent.components.length-1))
                            View.plugins.resizable.attach(this);
                        }
                    }catch(e){
                        this.data("plugin_proc",0)
                    }
                }.bind(this),1000);
            }
            var url=this.config.url
            if(!url && this.config.content && typeof(this.config.content)=="string" && this.config.content.indexOf("http")==0){
                url=this.config.content
            }
            if(url && !this.contentWrap.q("iframe")){
                var ifr=document.createElement("iframe" );
                ifr.border=ifr.margin=ifr.padding=0;ifr.height=ifr.width=ifr.style.height=ifr.style.width="99.9%";

                ifr.src= url;
                this.contentWrap.clear().el.appendChild(ifr)
            }
            if(this.panels ){
                var fitcontent = this.panels.find(function(it){return it&&it.config.fitcontent})
                if(fitcontent){
                    var ht=fitcontent.el.height(),diff=Math.abs(ht-(fitcontent.rect.height||0))
                    var last=fitcontent.data("_klasthtchk")|| 0,now=Date.now()
                    if(ht&&(Math.abs(now-last)>100) && diff>10){
                        fitcontent.rect.height=ht
                        fitcontent.data("_klasthtchk",now)
                        setTimeout(this.layout.bind(this),10)
                    }

                }

            }
        },
        setDomContent:function(){
            if(this.contentWrap && (this.config.domcontent||this.config.hasdomcontent)){
                if (this.config.domcontent && this.config.domcontent.nodeType && this.contentWrap.contains(this.config.domcontent)) {
                    delete this.config.domcontent;
                    this.config.hasdomcontent=true;
                }
                var torem=[];
                [].slice.call(this.contentWrap.el.children).forEach(function(el){ if(el&&el.__domcontent){torem.push(el)}});
                while(torem.length){
                    var x=torem.pop();
                    x&& x.parentNode&&x.parentNode.removeChild(x);
                }
                var curr=this.contentWrap.children;

                this.contentWrap.insert(typeof(this.config.domcontent) == "function" ? this.config.domcontent.call(this, this.contentWrap) : this.config.domcontent);
                [].slice.call(this.contentWrap.el.children).forEach(function(el){
                    if(curr.indexOf(el)==-1){el.__domcontent=true}
                });
            }
        },
        setContentDims:function(){
            if(this.config._content && this.computed){
                var re=this.getContentDims()

                if(this.config.fitcontent){
                    var css={position:"relative",top:"-delete-" ,height:"-delete-" ,width:"-delete-" ,left: "-delete-"}
                    var pd=this.config.padding
                    if(pd){css.margin=[pd.top,pd.right,pd.bottom,pd.left].map(function(it){return it+"px"}).join(" ")}
                    if(css.height){
                        if(this.hasLayout("relative")||(css.height<20 && !this.rect.height)){
                            //css.minHeight=css.height
                            delete css.height;
                        }
                        //css.minHeight=css.height
                    }
                    this.contentWrap.css(css)
                } else {
                    var css=re.getCss(this.contentWrap);
                    if(css.height){
                        if(this.hasLayout("relative")||(css.height<20 && !this.rect.height)){
                            //css.minHeight=css.height
                            delete css.height;
                        }
                        //css.minHeight=css.height
                    }
                    this.contentWrap.css(css);
                }
                if(this.config.styles&&(this.config.styles["background"]||this.config.styles["backgroundColor"]||this.config.styles["background-color"]||this.config.styles["backgroundImage"])){
                    this.contentWrap.css({background:"transparent"})

                }
                if(this.config.contentui&&typeof(this.config.contentui)=="object"){
                    this.contentWrap.prop(this.config.contentui)
                }
                if(this.config.contentScrollable){var dir=String(this.config.contentScrollable);if(!/^[x,y]/i.test(dir)){dir=""}
                    this.contentWrap.css("overflow"+(dir.toUpperCase()),"auto")
                }

                this.contentWrap.removeClass("pre-attach")
            }
            if(this.contentWrap && this.config.domcontent) {
                if(!this.setDomContent_throttled){
                    this.setDomContent_throttled= $.throttle(this.setDomContent)
                }
                this.setDomContent_throttled()

            }

            return this
        },
        inspectLayouts:function(ofchildren){

            if(ofchildren) {
                if (this.panels.length == 1 && !this.panels[0].hasLayout("fill") && this.panels[0].rect.height <= 1) {
                    var it = this.panels[0];
                    if (it && it.hasLayout("frame")) {
                        it.addLayout("fill")
                    }
                } else {
                    for (var i = 0, l = this.panels, ln = l.length, it; it = l[i], i < ln; i++) {
                        if (!it||(it.config && it.config.hasCssLayout)) {
                            continue
                        }
                        if (!it.viewlayouts.length && it instanceof View) {
                            it.viewlayouts.push(new Layout("Panel"))
                            if (!it.hasLayout("framebar") && !it.isPositioned() && !(it.rect.height || it.rect.width || it.rect.top || it.rect.left)) {
                                it.viewlayouts.push(new Layout("fill"))
                            }
                            it.needsRedraw = true
                        }
                    }
                }
                return;
            }
            if(this.config.hasCssLayout){return}
            if(this._parent && !(this._parent.hasLayout("grid")||this._parent.hasLayout("grid2"))&&this._parent.components.length==1){
                if(!(this.hasLayout("FrameBar")||this.hasLayout("row")||this.rect.height>1||this.hasLayout("column")|| this.isPositioned()||this.iscollapsed())){
                    this.addLayout("fill")
                }
            }
        },
        _attach:function(cntnr,dom){
            if(this._attached && this.el){return}
            if(dom){this.el=$d(dom)}
            this.el||(this.el=this._crEl());
            var el=$d.toEl(this.el),cw=$d.toEl(this.contentWrap)
            this.inspectLayouts()
            if(this.isRoot()){
                cntnr=cntnr||document.body;
                cntnr.appendChild(el);
            }
            if(cntnr && cntnr.appendChild && !cntnr.contains(el)){
                this.el=$d(cntnr.appendChild(el))
            }

            this._attached=true;
            this.applyUI();

            for(var i=0,l=this.components,ln= l.length,it;it=l[i],i<ln;i++){
                it._attach((it.hasLayout("FrameBar")||it.isPositioned())?el:cw)
            }


            return this
        }  ,
        findLayout:function(l){
            if(!this.viewlayouts){this.viewlayouts=List.create()}
            if(!this.viewlayouts.findAll){
                this.viewlayouts=List.create(this.viewlayouts)
            }
            var fnd,s=typeof(l)=="string"?l:(l?l.name:null);
            if(fnd = Layout.findLayout(l)){
                return this.viewlayouts.findAll(function(it){return it instanceof fnd}).shift();
            }

            return  null
        },
        hasLayout:function(l){return !!this.findLayout(l)},
        replaceLayout:function(nu,old,optns){
            if(old){ this.removeLayout(old)}
            this.addLayout(nu,optns)
            return this;
        },
        removeLayout:function(l){l= String(l).toLowerCase();var vw=this
            var ll=(this.viewlayouts.toArray()).filter(function(it,i){
                if(String(it.name||it.__meta.simpleName).toLowerCase()==l){it.clearLayout(vw);return false;}
                return true;});
            this.viewlayouts.clear().addAll(ll)
            this.resetLayout()
            return this;
        },
        addLayout:function(l0, options){
            if(this.hasLayout(l0)){return this}
            var l=  Layout(l0,options,this );if(!l){return this}
            if(this.viewlayouts.some(function(it){return it.name== l.name})){return this}
            this.config[l.name] =options
             this.viewlayouts.add(l);
            return this;
        },
        getConfig:function(nm){return this.config[nm]},
        setConfig:function(nm,val){this.config[nm]=val;return this},
        render:function(){ },
        destroy:function(){
            if(this.contentWrap&&this.contentWrap!=this.el){
                this.contentWrap.remove();
            }
            this.el.remove();

        },
        layout:function(noreset){
            if(!this._attached){ this.attach()  }
            if(this.el){

                if(this.state&&(!this.state.rendered || this.state.needsRender)){
                    this.state.rendered=true
                    this.fire("beforerender")
                    this.render();

                    this.fire("render")

                }

                this.applyUI();
                this.fire("afterrender")
            }
        },
        isClickable:function(){return false},

        isRoot:function(){return !this._parent}
    });

    var View=$.View=self.View=Klass("View",$.Component,{ headerbar:null,footerbar:null,isView:true,
        init:function(id){

            this.initComponent(arguments);
        }   ,
        watchDimensions:function(cb){
            if(!this.data("_resizelistener")){
                var _self=this
                this.el.on("resize",typeof(cb)=="function"?cb.bind(this):function(ev){
                    this.fire("resize",ev.data)
                }.bind(this),{id:"_view_resize_"+this.id})
                this.data("_resizelistener",1)
            }
        },
        layout_inner:function layout(noreset){
            if(!this._attached){ this.attach()  }
            var cmprsd=this.iscollapsed()
            if(noreset!==true&&!cmprsd){
                this.resetLayout();
            }
            if(this.state&&(!this.state.rendered || this.state.needsRender)){
                this.state.rendered=true
                this.fire("beforerender")
                this.render();
                this.fire("render")

            }

            if(this.headerbar&&(this.config.hideFrameBars|| this.config.hideHeader)){
                this.headerbar.hide();
            }
            if(this.footerbar&&(this.config.hideFrameBars|| this.config.hideFooter)){
                this.footerbar.hide()
                this.footerbar.el.addClass("__hh")
            }
            if(!cmprsd){
                this.viewlayouts.sort(function(aa,bb){  return Number(aa.priority||0)  - Number(bb.priority||0)}).reverse()
                if(!this.viewlayouts.length && this instanceof View){
                    this.viewlayouts.push(new Layout("Panel"))
                    this.inspectLayouts()

                }

                for(var i= 0,l=this.viewlayouts,ln= l.length;i<ln;i++){
                    l[i].doLayout(this)
                }
            }
            this.needsRedraw=false;
            var cnt=this.components.length
            if(typeof(cnt)=="undefined"){
                cnt=this.components.size();
            }
            if(cnt){
                this.computed.insets=new UI.Offset();
                this.inspectLayouts(true)

                for(var i=0,l=this.components,ln= cnt,it;it=l[i],i<ln;i++){if(!it){continue}
                    if(it.config.collapsible&&!it.hasLayout("collapsible")){
                        it.addLayout("collapsible")
                    }

                    if(!it.isHidden()){
                        it.layout(noreset)
                    } else{it.needsRedraw=true}
                }

                this.setContentDims();
            }

            if(this.el){this.applyUI();}
            if(this.config.resizable ){
                View.plugins.resizable.attach(this);
            }
            this.fire("afterrender")
            return this;
        },
        ensureOrder:function(){ if(!this._parent){return this}
            try {
                var el=this.el, wrap=this._parent.contentWrap

                if(el.dataset.loc == "top"&&(el.at ()>wrap.at ()&& !wrap.contains (el))) {
                    wrap.parent ().el.insertBefore (el.el, el.hasClass ("layout-titlebar") ? wrap.parent ().el.firstChild : wrap.el)
                }
            } catch(e){}
            return this
        },
        layout:function layout(noreset){
            var st=this.state;
            if(st._layoutinprogress){ return}//
            st._layoutinprogress=1;
            try {
                var res = this.fire("beforelayout");
                if (res === false) {

                    return this
                }
                if (this.data("_layoutsession")) {
                }//return
                this.layout_inner(noreset)
                st.layoutcompleted || (st.layoutcompleted = 1);
                //to relative
                this.observer.fire("afterlayout")
                this.ensureOrder()

                for (var i = 0, l = this.components, ln = l.length, it; it = l[i], i < ln; i++) {
                    it && it.ensureOrder && it.ensureOrder()
                }


            } catch(e){console.error(e)
            } finally{st._layoutinprogress=0;}
            //}
            return this;
        }

    } );
    function Toolbar(){  }
    Toolbar.ToolItem=function ToolItem(){  }

    function Layout(impl,data,vw){
        var $this,_impl;
        _impl= typeof(impl)=="string"?Layout.findLayout(impl):impl;;
        if( _impl&&! _impl.isKlass){ _impl=null;}

        if( !_impl){$.handleEx("invalid layout "+impl+".. reverting to panel");
            _impl=Layout.impl.Panel;
            //this.priority=this._impl.priority
        }
        $this=new _impl(vw,data); if(vw){$this._view=vw;}
        $.emitter($this,true);
        return $this;
    }

//self.Component=Component;
//self.View=View;
    self.Layout=Layout



    Layout.resolveConfig=function(impl,config0){
        var config=config0||{},_impl= typeof(impl)=="string"?Layout.findLayout(impl):impl;;

        if(!(_impl&&typeof(_impl.layout)=="function")){
            if(typeof(impl)=="object"){
                config=  impl;
            }
        }

        else {
            if(typeof(impl)=="string" && !_impl.name){_impl.name=impl}
            config.layout=impl;
        }
        return config

    }
    Layout._isValidLayoutName=function(impl0){
        if(!(impl0 && typeof(impl0)=="string")){return}

        if(!Layout._names) {
            Layout._names || (Layout._names = Object.keys(Layout.impl).map(function (it) {
                ;
                Layout.impl[it].prototype && (Layout.impl[it].prototype.name = it);
                return it
            }));
            Layout._nameslc = Layout._names.map(function (k) {
                return k.toLowerCase()
            })
        }
        var lc=impl0.toLowerCase()
        var idx=Layout._nameslc.indexOf(lc)
        if(idx==-1) {
            idx = Layout._names.indexOf(lc.replace(/s$/, ""))
        }
        if(idx==-1) {
            idx = Layout._names.indexOf(lc+"s")
        }
        if(idx>=0){
            return Layout._names[idx]
        }

    }
    Layout.findLayout=function(impl0){
        if(!(impl0 && typeof(impl0)=="string")){
            if( impl0&& impl0.isKlass && String(impl0.ns).indexOf("Layout.impl")==0){ return impl0;}
            return null
        }
        var impl =Layout._isValidLayoutName(impl0)
        if(impl){
            return Layout.impl[impl]
        }

    }
    Layout.prototype={
        doLayout:function(vw){
            this._impl && this._impl.layout(vw)
        }
    }

    Layout.impl={}
    Layout.impl.base=self.Klass("Layout.impl.base",{name:null,config:{}, _view:null, view:null,view1:null,
        doLayout:function(vw){
            this._view=vw;
            var config=vw.config[this.name]||{}

            this.config=UI.viewUtils.extend({},UI.viewUtils.extend(vw.config),typeof(config)=="object"?config:{})

            return this.layout(vw)
        },
        clearLayout:function(vw){},

        initialize:function(vw){ this._view=vw},
        onInitialize:function(){ this.name=String(this.classMeta.simpleName).toLowerCase() },
        layout:function(){},
        setup:function(){}
    });
    Layout.impl.PanelSet=self.Klass("Layout.impl.PanelSet",Layout.impl.base,{
//Layout.impl.PanelSet={name:null,
        layout:function PanelSet( layout,options){
            var lo=this.config ,loopts=lo[layout]||{};

        }});
    Layout.impl.Collapsible=self.Klass("Layout.impl.Collapsible",Layout.impl.base,{
//Layout.impl.PanelSet={name:null,
        toollink:null,
        resetIcon:function(){
            $d(this.toollink).removeClass("gl-icon-collapse gl-icon-expand")
            $d(this.toollink).addClass("gl-icon-"+(this._view.iscollapsed()?"expand":"collapse"))
        },
        layout:function Collapsible( layout,options){  var vw=this._view
            var bar=vw.headerbar||vw,al=String(vw.config.alignment||vw.config.location||"l").charAt(0).toLowerCase()
            vw.config.doAnimate={duration:"fast",ease:"easeout"}
            if(!this.toollink){
                var link=bar.el.insert("<div  style='position:absolute;"+(al.indexOf("r")>=0?"left":"right")+":1px;"+(al.indexOf("b")>=0?"bottom":"top")+":0;' class='ui-button-gl notext gl-icon-collapse ui-tool-item icon-backward'>x</div>")
                link.on("click",function(ev){
                    this._view.iscollapsed()?this._view.expand():this._view.collapse();
                    this.resetIcon()
                }.bind(this));
                this.toollink=link;
                //if(al=="t"){stangle="90" } else if(al=="b"){stangle="270"  } else if(al=="r"){stangle="180"}
                /// try{link.style[$.browser.css3pr+"transform"]=link.style["transform"]="rotate("+stangle+"deg)"} catch(e){}
            }
            //vw.config.alignment=al
            if(vw.config.initcollapse&&!vw.state.layoutcompleted){vw.collapse();this.resetIcon()}
        }});
    Layout.impl.Cards=self.Klass("Layout.impl.Cards",Layout.impl.base,{priority:1, active:null,

        layoutLayers:function(vw){
            if(this._busy){ return}
            this._busy=true;
            try{
                var ui=self.UI,list=vw.panels,panels=[]
                var rect=vw.getContentDims().toMap(true)  ;rect.top=0.1;rect.left=0;
                vw.showPanel=function(nm){  nm=String(nm).replace(/[#\/]/g,"").trim()
                    var pnl=this.panels.find(function(it){return it&&it.id==nm});
                    if(!pnl){return}
                    if(this.fire("beforepanelselection",pnl)===false){return}
                    pnl&&pnl.show()
                }
                vw.hidePanel=function(nm){  nm=String(nm).replace(/[#\/]/g,"").trim()
                    var pnl=this.panels.find(function(it){return it&&it.id==nm});
                    pnl&&pnl.hide()
                }
                function _show(data){
                    var p=typeof(data)=="string"?data:data.name
                    vw.showPanel(String(p).split("/").pop())
                }
                vw.on("afterlayout.afterlayout-"+this.id,function(v){
                    if(typeof(app)!="undefined"&&app.router){
                        var vwnm=vw.id,pp=this.panels.findAll(function(it){return !it.isHidden()&&!it.hasLayout("framebar")});
                        pp.forEach(
                            function(it){
                                app.router.add(vwnm+"/"+it.id,{name:vwnm+"/"+it.id})
                                app.router.on(vwnm+"/"+it.id,_show)
                            }
                        )


                    }
                    if(!this.active){
                        var viz=this.panels.find(function(it){return it.isActivePanel})||this.panels.find(function(it){return !it.isHidden()&&!it.hasLayout("framebar")});
                        var i=-1
                        if(viz){i=this.panels.indexOf(viz)}
                        if(i<0){i=this.config.defaultPanel||0}
                        if(this.panels[i]){this.panels[i].isActivePanel=true}

                        this.active=this.panels[i]
                    }
                    if(this.active&&this.active!=this){
                        this.panels.each(function(it){it.hide()});
                        if(!this.active.isVisible()||!this.active.state.firstlayoutcompleted){
                            this.active.show()

                        }//else{
                        //  }
                        //this.active.show()
                    }
                });
                for(var i= 0,l=list,ln= l.length,it;it=l[i],i<ln;i++){
                    it.computed.update(rect);it.config.index=i;
                    var ths=vw;
                    if(!it.data("_evtsetup")){it.data("_evtsetup",1)
                        it.on("beforeshow",function(){this.computed.top=.1;});
                        it.on("show.panelselection", function(v){
                            if(!(this._parent&&this._parent.hasLayout("cards")&&this.state.firstlayoutcompleted)) {return}

                            var _id=this.id,el=this._parent.el.q(".view-tab-link[data-key='"+(_id)+"']");
                            v.panels.forEach(function(p){
                                if(p.id!=_id ){
                                    p.isActivePanel=false;
                                    p.isVisible()&&p.hide()
                                }
                            }) ;
                            this._parent.el.qq(".panel-links-bar .selected").forEach(function(it){
                                $d.removeClass(it,"selected")}) ;
                            if(el){el.addClass("selected");}
                            ths.active=this ;

                            this.isActivePanel=true

                            ths.fire("panelselection",this)
                        }.curry(vw) )
                        ths.on ("panelselection", function(p){
                            if(typeof(app) != "undefined"&&app.router) {
                                app.router.pushState ({path: vw.id + "/" + p.id})
                            }
                        })
                    }
                }
                this._panels=list;
            } catch(e) {$.handleEx("panelselection",e)}
            finally{this._busy=false}
        },

        onInitialize:function(){
            if(!this._view){
                this.onpropertychange("_view",function(v){if(!v || v.value==null){return}
                    this._view.on("beforelayout",function(){
                        var w=this.contentWrap; if(!w||w==this.el){     this.contentWrap=this._crEl(true); }
                    });
                }.bind(this))
            } else{
                var w=this._view.contentWrap; if(!( w) ||w==this._view.el){  this._view.contentWrap=this._view._crEl(true); }
            }//  var w=this._view.contentWrap;  if(! w ||w==this._view.el){    this._view.contentWrap=this._view._crEl(); }  }

        },
        clearLayout:function(vw){
            this._view.panels.forEach(function(it){
                it.observer.off("cardlayout");it.data("_evtsetup",0)})  ;
            this._view.panellinksbar && this._view.panellinksbar.hide()
        },
        layout:function Cards( ){   this.layoutLayers(this._view)  }});


    Layout.impl.Accordion=self.Klass("Layout.impl.Accordion",Layout.impl.Cards,{ contentHeight:null,hdht:null,__active:null,hdrklass:".layout-accordian-header",
        clearLayout:function(vw){
            this._view.panels.forEach(function(it){
                it.computed.top=0.1;it.observer.off("show.cardlayout");it.show();
                it.data("_evtsetup",0)})  ;
            this._view.el.qq(".layout-accordian-header").forEach(function(p){p.parentNode.removeChild(p)});
        },
        _resetDims:function ( ){
            var  idx=-1,single=this.hdht,target=null,targettop=0,ht= this.contentHeight,vw=this._view,hdrlist=[],rnng=0 ;
            hdrlist=vw.el.qq(this.hdrklass)
            if(this.__active){idx=this.__active.config.index}
            var contentshadow=vw.el.q(".content-shadow"),tp
            contentshadow.css({h:ht+single+single})
            hdrlist.forEach(function(it,i){single||(single=it.offsetHeight);
                var curr=it.offsetTop,val=rnng
                if((curr-10)<=(single&&hdrlist.length)){tp=curr+single}
                it._height=it._height||it.offsetHeight;
                if(i==idx){var up=(curr>(single*hdrlist.length)),t=tp//( Math.max(0,i)  )*single;
                    target=it; contentshadow.css("t",t);
                    if(up){contentshadow.css("h",ht+single+single);}
                    contentshadow.show()
                    if(up){contentshadow.css("h",0.1);}
                    else{contentshadow.css("h",0.1);contentshadow.css("t",t+ht+single+single);}
                    rnng+=ht; setTimeout(function(){ contentshadow.hide(); },1000)
                }
                it.style.top=val+"px";
                rnng+=single;
            });


        },
        calc:function(sub){
            var vw=this._view,ui=self.UI,list=vw.panels,panels=[]
            var rect=vw.getContentDims().toMap(true);
            var offset=vw.el.qq(this.hdrklass).reduce(function(m,it){return m+Math.max(20,it._height||it.offsetHeight||0)},0)
            this.hdht=offset/list.length  ;sub.computed.left=0.1;
            var ht=rect.height-offset;
            sub.computed.height= ht-5
        },
        _showPanel:function(pnl){var v=this._view
            var curr= this.__active;
            this.__active=pnl;
            this.calc(pnl)
            var _id=pnl.id ;
            v.panels.forEach(function(p){  p.id!=_id  && p.isVisible()&&p.hide()}) ;
            pnl.show()
            this._resetDims();

        },
        layout:function  ( ){
            var single,ht= 0,vw=this._view,hdrlist=[] ,first=false;
            var ths=this;
            if(vw.panels&&!vw.el.q(this.hdrklass)){first=true
                var kls=this.hdrklass.substr(1),hdrs=vw.panels.map(function(it,i){
                    // it.config.animateShow={anchor:"top",duration:"fast"};
                    it.config.index=i;return "<div class='ui-darker "+kls+"' data-index='"+i+"' data-key='"+it.id+"' style='z-index:100;height:2em'>"+(it.config.label||it.config.title)+"</div>"
                }).join("")
                vw.contentWrap.insert(hdrs)
                vw.contentWrap.insert("<div class='ui-darker fxtx_5 content-shadow' style='position:absolute;z-index:99;width:100%;left:0;'></div>")
                //vw.contentWrap.css("overflow","hidden");
                var maxtop=Math.max(50,vw.contentWrap.st(".layout-accordian-header").height().sum()),layout=this
                vw.contentWrap.on("click::"+this.hdrklass,function(ev,el){
                    if(el.hasClass("sel-panel")){return}
                    vw.contentWrap.st(".layout-accordian-header").removeClass("sel-panel")
                    var idx=el.dataset.index,k=el.dataset.key
                    var p=vw.panels[idx] ,rnng=0 ;
                    if(p) {
                        el.addClass("sel-panel");

                        //p.config.animateShow={anchor:el.offset("top")>maxtop?"bottom":"top",duration:"fast"};
                        layout._showPanel(p)
                        // setTimeout(function () {    p.show()  }, 600);
                    }
                })


            }

            var ui=self.UI,list=vw.panels,panels=[]
            var rect=vw.getContentDims().toMap(true);
            var offset=vw.el.qq(this.hdrklass).reduce(function(m,it){return m+Math.max(it._height||it.offsetHeight||0,20)},0)
            this.hdht=offset/list.length  ;rect.left=0;
            var ht=rect.height-offset;   this.contentHeight= rect.height=ht-5

            for(var i= 0,l=list,ln= l.length,it;it=l[i],i<ln;i++){
                rect.top=this.hdht*(i+1);it.calc=
                    it.computed.update(rect); it.computed.height=this.contentHeight; it.computed.left=0.1;
                if(!it.data("_evtsetup")){it.data("_evtsetup",1)
                    it.hdrklass=this.hdrklass;
                    it.on("show.cardlayout",function(v){
                        var curr= v.__active;
                        if(curr!=this){  v._showPanel(this)}
                    }.curry(this))
                }
            }
            if(first) {
                var idx = 0
                if (typeof(vw.config.defaultIndex) == "number" && list[vw.config.defaultIndex]) {
                    idx = vw.config.defaultIndex;
                }
                if (list[idx]) {
                    this.__active = list[idx];
                    this._resetDims()
                    this._showPanel(this.__active)

                    vw.el.st(this.hdrklass).addClass("fxtx_5")
                }
            } else {
                this._resetDims()
            }
        }
    })
    Layout.impl.SlideMenu=self.Klass("Layout.impl.SlideMenu",Layout.impl.Cards,{
        bar:null,
        layout:function SlideMenu( ){
            (function(impl){
                var vw=impl._view ;
                if(vw.config.createTrigger&&vw.config.createTrigger!="done"){

                    var hdr=vw.headerbar||(vw._parent?vw._parent.headerbar:null),pos=vw.config.menupos||"left";

                    var trig=hdr.addAbs({
                        pos:"leftbottom",
                        uiklass:["slide-menu-trigger"],
                        style:{textAlign:"center",zIndex:1,padding:"0 5px",border:"1px solid #ccc",borderRadius:"2px",cursor:"pointer",textShadow:"1px 1px 1px #999"   },
                        height:20
                    })
                    vw.config.triggerComponent=trig;
                    var triglabel=hdr.addAbs({
                        pos:"leftbottom",style:{textAlign:"left",textIndent:"40px",zIndex:0,fontSize:"1.1em",background:"transparent",textShadow:"1px 1px 1px #999",letterSpacing:".1em"},
                        uiklass:["slide-menu-trigger-label"],
                        height:20,width:200
                    })

                    vw.config.triggerComponentLabel=triglabel
                    trig.el.html("&nbsp;|||&nbsp;")
                    vw.config.linkbar=vw.config.linkbar||{width:200,height:"99%",top:0.2,pos:pos,trigger:".slide-menu-trigger"}
                    vw.config.createTrigger="done"
                }
                if(!vw.panellinksbar){
                    var config=vw.config,trigger,bar,pos
                    config.linkbar=config.linkbar||{}
                    config.linkbar.pos=config.linkbar.pos||"left"
                    config.linkbar.width=config.linkbar.width||200
                    vw.panellinksbar=vw.addAbs(config.linkbar)
                    vw.panellinksbar.rect.width=config.linkbar.width
                    vw.panellinksbar.config.uiklass=["fxtx_5","ui-slide-menu","ui-slide-menu-"+config.linkbar.pos]
                    var wd0=config.linkbar.width||200
                    vw.panellinksbar.toggle=function(show){
                        var wd,ht,panel=this  ,op=1 ,z=0
                        if(show==null){show=!!panel.el.hasClass("width-collapsed")}
                        if(!show){
                            panel.el.addClass("width-collapsed").hide()
                            wd=1;ht=panel._parent.computed.height;op=.01
                        } else{
                            panel.el.removeClass("width-collapsed").show()
                            ht=panel._parent.computed.height
                            wd=wd0;z=500
                            $d(document).on("mousedown",function mdown(ev){
                                if(!vw.panellinksbar.el.contains(ev.target)){vw.panellinksbar.toggle(false)}
                                $d(document).off("mousedown",mdown)
                            })
                        }
                        panel.computed.width=wd
                        //panel.computed.height=ht
                        panel.config.styles={opacity:op,width:wd,height:ht,zIndex:z}
                        panel.layout()
                    }
                    if(config.linkbar.trigger||vw.config.triggerComponent){
                        var selector=vw.config.triggerComponent?("#"+vw.config.triggerComponent.el.id):("#"+vw.el.id+" "+config.linkbar.trigger)
                        $d.onAttach(selector,function(el){
                            $d(el.el).on("click",function(){
                                vw.panellinksbar.toggle()
                            })
                        });
                    }
                    if(vw.panels){
                        var tmpl=$d.template("<div class='view-link' data-key='$id'><label>$title</label></span>")
                        var selcolor="#eee",html=vw.panels.map(function(it,i){
                            it.config.styles={"border-top":"none"}
                            it.headerbar&&it.headerbar.el.css("bgc",selcolor)
                            it.config._title=it.config.title|| it.config.label||it.config.id||("Tab "+(i+1));
                            if(!it.id){it.id= it.config._title};
                            return tmpl({id:it.id,title:it.config._title})}).join("")
                        vw.panellinksbar.insertContent(html)
                        vw.panellinksbar.el.on("click",function(ev,el){
                            var _id=el.dataset.key
                            var pnl=vw.panels.filter(function(p){ return (p.id==_id)||(p.hide()&&0)}).shift();
                            if(pnl){
                                pnl.computed.update(vw.getContentDims().toMap(true))
                                pnl.show()
                                // pnl.layout(true)
                            }
                        },{selector:".view-link"})
                        vw.on("panelselection",function(pnl){
                            if(pnl){
                                var lbl=this.el.q(".slide-menu-trigger-label")
                                if(lbl){lbl.html(pnl.config._title)}
                                this.panellinksbar.toggle(false);
                                // pnl.layout(true)
                            }
                        })

                        vw.panellinksbar.toggle(false);
                    }

                }
                impl.view1=5;
                impl.layoutLayers(vw)
                vw .panellinksbar.show()
            })(this);
        }
    });
    Layout.impl.Tab=self.Klass("Layout.impl.Tab",Layout.impl.Cards,{bar:null,

        layout:function Tab( ){  var vw=this._view ;

            if(!vw.panellinksbar){
                if(vw.headerbar&&!vw.config.isDialog&&!vw.config.title){
                    vw.headerbar.show();
                    vw.headerbar.rect.height=(!vw.headerbar.rect.height||vw.headerbar.rect.height<=30)?35:vw.headerbar.rect.height
                    vw.panellinksbar=vw.headerbar;
                } else{ vw.panellinksbar=Layout.impl.FrameBar.setup("tabbar","top",vw ,{ height:"35px", style:{whiteSpace:"nowrap"} })}


                if(vw.panels){var selcolor

                    var tmpl=$.template("<span class='view-tab-link' data-key='$id'><label>$title</label></span>")
                    var html=vw.panels.map(function(it,i){
                        it.config.styles={"border-top":"none"}
                        it.headerbar&&it.headerbar.el.css("bgc",selcolor)
                        it.config._title=it.config.label||it.config.title|| it.config.id||("Tab "+(i+1));
                        if(!it.id){it.id= it.config._title};
                        return tmpl({id:it.id,title:it.config._title})}).join("")
                    vw.panellinksbar.insertContent(html+"<div class='view-tab-link-gutter'></div>")
                    var first=vw.panellinksbar.el.q(".view-tab-link.selected")
                    if(!first){
                        first=vw.panellinksbar.el.q(".view-tab-link").addClass("selected")
                        selcolor=first.css("bgc")
                        first.removeClass("selected")
                    } else{selcolor=first.css("bgc")}
                    if(vw.panellinksbar.el.scrollWidth>(vw.panellinksbar.el.offsetWidth+5)){
                    }
                    vw.panellinksbar.contentWrap.on("click",function(ev,el){
                        var _id=el.dataset.key
                        var pnl=vw.panels.filter(function(p){ return (p.id==_id)||(p.hide()&&0)}).shift();
                        if(pnl){
                            pnl.computed.update(vw.getContentDims().toMap(true))
                            //pnl.config.animateShow={anchor:"left",duration:"fast"}
                            //pnl.config.animateHide={anchor:"right" }
                            pnl.show()
                            // pnl.layout(true)
                        }
                    },{selector:".view-tab-link"})
                    vw.panellinksbar.config.uiklass="panel-links-bar"
                }

            }

            this.view1=5;
            this.layoutLayers(vw)
            vw .panellinksbar.show()

        }
    } );
    Layout.impl.FrameBar=self.Klass("Layout.impl.FrameBar",Layout.impl.base,{  priority:12,

        layout:function FrameBar(){ var vw=this._view
            if(!vw._parent){return}
            var loc=vw.data("loc"),curr=vw._parent.computed.insets[loc]|| 0,dim;
            if(loc=="top"||loc=="bottom"){
                dim="height"  ;
                vw.computed.width=(vw._parent.computed.getContentbox().width);
            } else{
                dim="width" ;
                vw.computed.height=vw._parent.computed.getContentbox().height;
            }

            //if(curr>1){vw.computed[loc]=curr}
            vw._parent.computed.insets[loc]=vw.getRect()[dim]
        } ,
        "static.setup": function(id,loc,vw,optns){
            if(id && vw.data(id)){return vw.data(id)}
            optns=optns||{}
            optns.style=optns.style||{}
            optns.style.backgroundColor=optns.backgroundColor||optns.style.backgroundColor ;
            if(loc=="header"){loc="top"}
            if(loc=="footer"){loc="bottom"}
            var panel=new $.View(optns),offst= 0,dim=loc=="top"||loc=="bottom"?"height":"width",rect=panel.getRect();
            if(loc=="top" && vw.config.headerHeight>10){
                panel.rect.height=vw.config.headerHeight
            }
            if(loc=="bottom" && vw.config.footerHeight){
                panel.rect.height=vw.config.footerHeight
            }
            if(panel.isVisible()&&panel.rect.height<1){

                panel.rect.height=40 ;
            }
            ;
            panel.addLayout("framebar") ;
            panel.uiklass="layout-framebar-"+loc;
            //to relative


            if(loc=="top"||loc=="bottom"){dim="height"
                if(loc=="top"){rect.top=rect.top<=.1?0.2:rect.top;}

                //to relative
                rect.left=0.2;rect.width=0.2;panel.styles.position="relative"
                //panel.config.styles.width="100%"

                //rect.left=0.2;
                //panel.styles.width="100%"   ;
                //rect.width=(vw.getRect().getContentbox().width);
            } else{
                dim="width"
                panel.config.styles.height="100%"   ;
                rect.height=vw.getRect().getContentbox().height;

            }


            optns.bounds && rect.update(optns.bounds);
            vw.data(id,panel);
            panel.config.location=loc;
            panel.data("loc",loc);
            panel.data("type",id);
            panel.data("dim",dim);
            if(id ) {
                vw[id]=panel;
            }
            vw.add(panel);
            if(!((vw.el.el.querySelector(".layout-panel-content")||{}).parentNode==vw.el.el)){
                var ch=[].slice.call(vw.el.el.children).filter(function(it){return it&&it.parentNode&&!$d.hasClass(it,"layout-panel")})
                    .map(function(it){return it.parentNode.removeChild(it)});
                vw.el.insert("<div class='layout-panel-content'></div>")
                vw.contentWrap=vw.el.q(".layout-panel-content")
                while(ch.length) {vw.el.appendChild(ch.shift())}
            }
            if(loc=="top" && optns.title ){
                if(!panel.el.q(".panel-title")){
                    panel.el.insert("<h3 class='panel-title'>&nbsp;"+optns.title+"</h3>","top")
                }
                panel.config.uiklass="layout-titlebar"
            }

            if(vw.panels.size()){
                var fr=vw.components.filter(function(it){
                    return panel!=it&&it.hasLayout("framebar")&&it.config.location==loc}).forEach(
                    function(it){
                        if(it.isVisible()) { offst+=(it.computed||it.getRect()).getAt(dim,true)}
                    }
                )
            }  ;
            if(offst){rect[loc]=offst; }
            //top=0.1;hdr.getRect().left=0.1
            //vw.getRect().insets[loc]=rect[dim];

            //vw.computed.insets[loc]  += rect[dim]
            //vw._parent.getRect().insets[loc]+=vw.getRect()[dim]
            return panel;
        } });
    Layout.impl.Panel=self.Klass("Layout.impl.Panel",Layout.impl.base,{layout:function Panel(){
        var vw=this._view  ,config=this.config
        if(config.header){
            Layout.impl.FrameBar.setup("headerbar","top",vw,config.header)
            //  Layout.impl.FrameBar.rect.top=Math.max(Layout.impl.FrameBar.rect.top,0.2)
        }
        if(config.footer){
            Layout.impl.FrameBar.setup("footerbar","bottom",vw,config.footer)
        }

    }});

    Layout.impl.inline= self.Klass("Layout.impl.Inline",Layout.impl.base,{
        layout:function inline(){ var vw=this._view
            vw.styles.display="inline-block"
        }
    });
    Layout.impl.Tiles= self.Klass("Layout.impl.Tiles",Layout.impl.base,{
        initialize:function initialize(vw,optns0){
            var first =true
            vw.on("afterlayout", $.throttle(function(){
                var el=vw.el,config=vw.config||{}

                this._layout()
                if(first&&(config.allowdrag!==false)) {first=false;
                    function _setup(){
                        var p=vw.panels;
                        if(!(p&&p.length)) {
                            setTimeout (_setup, 500);
                            return
                        }
                        var current=null, maxz=0
                        for(var x=0, l=p; x<l.length; x++) {
                            (function(pnl){
                                pnl&&pnl.el.on("mousedown",function(){
                                    $d.trackMouse ({
                                        target: this,
                                        start: function(){
                                            if(pnl.state.maximized){return false}
                                        },
                                        move: function move (ev){
                                            if(!maxz) {
                                                $d (document.body).css ({cursor: "move"})
                                                maxz=el.qq (".tile-panel").reduce (function(z, it){
                                                    return Math.max (z, Number ($d.css (it, "zIndex"))||0)
                                                }, maxz||0)
                                                $d.css (this, "zIndex", ++maxz);
                                                $d.data (this, "_start", $d.css (this, ["top", "left"]))
                                            }
                                            $d.css (this, ev.data.pos)
                                            var t1, b=$d (this).bounds (), t, delta=ev.data.delta;
                                            $d (this).hide ()
                                            t=document.elementFromPoint (b.left, b.top);
                                            if(t) {
                                                t1=$d.qq (".tile-panel").filter (function(a){
                                                    return a.contains (t)
                                                })[0];
                                            }
                                            ;
                                            if(!t1) {
                                                t=document.elementFromPoint (b.left + b.width / 2, b.top + b.height / 2);
                                                t1=$d.qq (".tile-panel").filter (function(a){
                                                    return a.contains (t)
                                                })[0];
                                            }
                                            $d (this).show ();
                                            $d.data (this, "_current", t1||null)

                                        }, end: function end (ev){
                                            var _current=$d.data (this, "_current"), s=$d.data (this, "_start");
                                            $d.data (this, "_start", null);
                                            $d.data (this, "_current", null)
                                            $d (document.body).css ({cursor: "auto"})
                                            maxz=0
                                            if(_current) {
                                                var n=$d.css (_current, ["top", "left"])
                                                $d.css (_current, s)
                                                $d.css (this, n)
                                            }else {
                                                $d.css (this, s)
                                            }
                                        }
                                    })
                                });
                            }) (l[x])
                        }
                    }
                    setTimeout(_setup,1000)
                }
            }.bind(this),50) )
        }  ,
        layout:function (){   },
        _layout:function tile(){
            var vw=this._view,margin=5 ;
            var rect=vw.getContentDims() ,totht=rect.height,totwd=rect.width,
                config=vw.config||{},minht=config.tileminheight||0,minwd=config.tileminwidth||0,
                ht=config.tileheight||0,wd=config.tilewidth||0,maxtilesperrow=config.maxtilesperrow||3

            var rnngwd=5,rnnght=5,tilefooter=config.tilefooter,tileConfig=config.tileconfig||{};

            if(!tilefooter){tileConfig.hideFooter=true }
            else if(!isNaN(tilefooter)){tileConfig.footer={height:tilefooter}}
            else if(typeof(tilefooter)=="object"){tileConfig.footer=tilefooter}
            tileConfig.styles||(tileConfig.styles={});
            tileConfig.klass=[].concat(tileConfig.klass||[]);
            tileConfig.klass.push("fxtx_5","tile-panel")

            if(!ht){ht=Math.max(minht||150,Math.min(300,Math.floor((totht-(margin*(3+1)))/3)))}
            if(!wd){wd=Math.max(minwd||150,Math.min(300,Math.floor((totwd-(margin*(maxtilesperrow+1)))/maxtilesperrow)))}
            vw.contentWrap.css({overflow:"auto"})

            //if(!tilefooter&&tilefooter!==false){tilefooter=20}
            var toolbar=$d("<div class='tile-toolbar'></div>")
            // var toolbar=View.IconBar()
            // toolbar.getBar().addClass("tile-toolbar")
            //$d("<div class='tile-toolbar'></div>")
            vw.panels.forEach(function(it){

                if(it.state.maximized){
                    it._parent.contentWrap.css({overflow:"hidden"})
                    setTimeout(function(){
                        if(!it.data("_saveddims")) {
                            it.data ("_saveddims", it.computed.toMap())
                        }
                        var w=it._parent.contentWrap.innerWidth(),h=it._parent.contentWrap.innerHeight()


                        //it.el.css({height:b.height-8,width:b.width-8,top:0.2,left:0.2}).toFront(true)
                        it.computed.update({height:h-8,width:w-8,top:0.2,left:0.2})
                        it.layout(true)
                    },100)
                } else {
                    it.config.set (tileConfig)

                    it.config.title=it.config.title||it.id||""
                    it.addLayout ("frame");
                    if(rnngwd + wd>totwd) {
                        rnnght+=(ht + 5);
                        rnngwd=5
                    }
                    it.rect.height=ht;
                    it.rect.width=wd;
                    it.rect.top=rnnght;
                    it.rect.left=rnngwd;
                    if(!it._toolbar) {
                        it._toolbar=it.headerbar.el.append (toolbar.cloneNode (true))
                    }
                    it.layout( )
                }


                if(it.config.showmaxmin&&!it._toolbar.q(".maxmin")){
                    app.router.add({name:it._parent.id+"/"+it.id+"/restored",handle:function(){
                        var it=this;
                        it.state.maximized=false
                        var b=it.data("_saveddims")
                        b && it.computed.update(b)
                        it.layout(true)
                        it._parent.panels.forEach(function(el){el.show()})
                        it._parent.contentWrap.css({overflow:"auto"})
                        $d(it.el).anim({rotate:it.state.maximized?360:0}).start()
                    }.bind(it)})
                    app.router.add({name:it._parent.id+"/"+it.id+"/maximized",handle:function(){
                        var it=this;
                        it.state.maximized=true
                        it.data("_saveddims",it.computed.toMap())
                        //it.el.css({height:b.height-8,width:b.width-8,top:0.1,left:0.1}).toFront(true)
                        var w=it._parent.contentWrap.innerWidth(),h=it._parent.contentWrap.innerHeight()
                        it._parent.panels.forEach(function(el){if(el!=it){el.hide()}})

                        it._parent.contentWrap.css({overflow:"hidden"})
                        it.computed.update({height:h-8,width:w-8,top:0.2,left:0.2})
                        it.layout(true)
                        $d(it.el).anim({rotate:it.state.maximized?360:0}).start()
                    }.bind(it)})
                    it._toolbar.append("<span class='tile-toolbar-item maxmin'></span>").css({"z-index":0})
                        .on("click",function(ev){
                            it.state.maximized=!it.state.maximized
                            if(!it.state.maximized){
                                app.router.route(it._parent.id+"/"+it.id+"/restored")
                                // it.layout(true)
                            } else{
                                app.router.pushState( it._parent.id+"/"+it.id+"/restored" ,true)
                                app.router.route(it._parent.id+"/"+it.id+"/maximized")
                            }
                            $d(ev.target).toggleClass("max")
                            ev.stopPropagation()


                        }.bind(it))
                }
                rnngwd+=(wd+5)
            })
            toolbar.remove()
        }
    });
    Layout.impl.Flow=self.Klass("Layout.impl.Flow",Layout.impl.base,{
        layout: function flow() {
            this._view.config.styles={"position":"relative"}

        }
    })

    Layout.impl.relative=self.Klass("Layout.impl.Relative",Layout.impl.base,{
        layout: function relative() {
            this._view.config.styles={"position":"relative"}

        }
    })
    Layout.impl.Border=self.Klass("Layout.impl.Border",Layout.impl.base,{
        layout:
            function Border(){ var config=this.config ,vw=this._view
                var ui=self.UI,locs=vw.panels.reduce(function(m,it){
                    var l=it.config.location||(it.config.location="none");
                    m[l]||(m[l]=[]);
                    m[l].push(it);return m;
                },{});
                var rect=vw.getContentDims() ,offsets=new ui.Offset();
                ["top","bottom","left","right"].forEach(
                    function(loc,i){if(!locs[loc]){return}

                        var dim=i>1?"width":"height",otheredge=loc=="right"||loc=="bottom";
                        for(var i= 0,l=locs[loc],ln= l.length,it;it=l[i],i<ln;i++){
                            var rect1=it.computed;
                            rect1.top= offsets.top||0.01 ;
                            rect1.left=(offsets.left||0.1);
                            if(loc=="left" ){
                                rect1.top=(offsets.top );
                                rect1.left=(offsets.left );
                                offsets[loc]=offsets[loc]+rect1.width
                            } else if(loc=="right" ){
                                rect1.top=(offsets.top );
                                offsets[loc]=offsets[loc]+rect1.width
                                rect1.left=(rect.width-offsets.right);
                            }
                            else if(loc=="top" ){
                                offsets[loc]=offsets[loc]+rect1.height
                            } else if(loc=="bottom" ){
                                offsets[loc]=offsets[loc]+rect1.height
                                rect1.top=rect.height-offsets.bottom;
                            }

                            if(loc=="bottom"||loc=="top" ){
                                rect1.width=rect.width//-(offsets.left+offsets.right);
                                it.config.stretchedDimension="width"
                                it.config.flexDimension="height"
                            }
                            else if(loc=="left"||loc=="right"){
                                rect1.height=rect.height-(offsets.top+offsets.bottom);
                                it.config.stretchedDimension="height"
                                it.config.flexDimension="width"
                            }

                        }
                    }

                );
                /*["top","bottom","left","right"].forEach(
                 function(loc,i){if(!locs[loc]){return}

                 var dim=i>1?"width":"height",otheredge=loc=="right"||loc=="bottom";
                 for(var i= 0,l=locs[loc],ln= l.length,it;it=l[i],i<ln;i++){
                 var rect1=it.computed;
                 rect1.top= offsets.top||0.01 ;  rect1.left=(offsets.left||0.1);
                 if(loc=="bottom"||loc=="top" ){
                 rect1.width=rect.width-(offsets.left+offsets.right);
                 it.config.stretchedDimension="width"
                 it.config.flexDimension="height"
                 }
                 else if(loc=="left"||loc=="right"){
                 rect1.height=rect.height-(offsets.top+offsets.bottom);
                 rect1.top=(offsets.top );
                 it.config.stretchedDimension="height"
                 it.config.flexDimension="width"
                 }
                 switch(loc){
                 case "left":break;case "top":break;
                 case "right":
                 rect1.left +=(rect.width-(offsets.left+rect1.width+offsets.right));
                 break;
                 case "bottom":rect1.top+=(rect.height-(rect1.height+offsets.top+offsets.bottom));break;
                 }
                 offsets[loc]=offsets[loc]+(rect1[dim] )
                 }
                 }

                 );*/
                if(locs.center){
                    var it=locs.center[0]
                    var rect1=it.computed;
                    rect1.top=offsets.top;rect1.left=offsets.left;
                    rect1.width=rect.width-(offsets.left+offsets.right);
                    rect1.height=rect.height-(offsets.top+offsets.bottom);
                }

            }});
    Layout.impl.Simple=self.Klass("Layout.impl.Simple",Layout.impl.base,{layout:function Simple(el){ var vw=this._view
        if(el && el.nodeType){ vw.el=DomCore(el)}
        var elem=vw.el;


    }});
    Layout.impl.Positioned=self.Klass("Layout.impl.Positioned",Layout.impl.base,{layout:function Positioned( rect){ }

    });
    Layout.impl.Popup=self.Klass("Layout.impl.Popup",Layout.impl.base,{priority:1,
        initialize:function initialize(vw,optns0){
            var optns=UI.viewUtils.extend(vw.config,optns0||{})
            View.applyNobileOptions(optns)

            "top left height width".split(/\s+/).forEach(
                function(k){if((!vw.rect[k]||vw.rect[k]<1)&&optns[k]){vw.rect[k]=optns[k]; }}
            )



            vw.uiklass =["def-popup-style",optns.rightAligned?"right-aligned":"left-aligned",optns.bottomAligned?"bottom-aligned":"top-aligned"];
            optns.draggable=!!optns.draggable
            optns.bottomAligned=optns.bottomAligned==null?true:optns.bottomAligned
            vw.config.positioned=true;   optns.popup||(optns.popup={});
            var anchor=optns.anchor|| optns.popup["anchor"]//||optns.flyout.anchorPos||optns.anchorPos||vw.config.anchorPos
            if(anchor){vw.config.anchor=anchor}
            var centered= optns.centered||optns.popup["centered"]//||optns.flyout.anchorPos||optns.anchorPos||vw.config.anchorPos
            if(centered){vw.config.centered=centered}
            var dochandle,_onkd,evtnm="mousedown",_defer=function(fn,delay){
                var ths=this,a=$.makeArray(arguments,2);
                setTimeout(function(){fn.apply(ths,a)} ,delay)
            }
            if(vw.config.fitcontent){
                vw.on("afterlayout.afterlayout-"+vw.id,function(){
                    //this.el.css({height:"auto" })
                    this.contentWrap&&this.contentWrap.css({height:"auto" ,width: "auto"})

                },{async:true} )
            }
            ;
            var _hide=function hide( ){     //if(!dochandle){return}
                    if(this.state.dragging){return}
                    if(dochandle){document.removeEventListener(evtnm,dochandle)}
                    dochandle=null
                }.bind(vw),
                _show=function _show(anchr){

                    if(_show.busy){return this}
                    _show.busy=true
                    try{
                        if(anchr&&anchr.nodeType){this.config.anchor=anchr}
                        this.befshow()
                        this.layout();
                        if(this._parent && this.config.inline){
                        } else {
                            var domcontainer=this.el,anchor=this.config.anchor?UI.Rect.create(this.config.anchor):null,
                                rect=this.computed;//UI.Rect.create(this.config.anchor||evt);
                            if(this.rect.top<1 && anchor){ rect.top=anchor.bottom}
                            if(this.rect.left<1 && anchor){ rect.left=anchor.left}
                            rect.height=Math.max(this.rect.height,this.computed.height)
                            domcontainer.show().bounds() .moveTo(rect.left,rect.top)
                            domcontainer.toFront()
                            domcontainer.removeClass("layout-height-collapsed")

                            if(this.config.fitcontent ){
                                setTimeout(function(){
                                    var ht=this.computed.height,ht2=this.contentWrap.scrollHeight+this.contentWrap.offsetTop
                                    if(ht2-ht <0){ return }

                                    //this.el.css({height:"auto"  })
                                }.bind(vw),600)
                            }
                            //if(dochandle){document.removeEventListener(evtnm,dochandle)}
                            if(this.config.hideOnBlur){
                                _defer.call(this,function(){   var vw=this,el=vw.el
                                    document.addEventListener(evtnm,dochandle=function docmouseup(evt){
                                        if(evt.which==3||el.contains(evt.target)||(this.config.anchor && this.config.anchor.nodeType && this.config.anchor.contains(evt.target))){
                                            return
                                        }

                                        document.removeEventListener(evtnm,docmouseup);
                                        if( !vw.config.hideOnBlur){
                                            return
                                        }
                                        vw.hide( )
                                    }.bind(this) );}.bind(this) ,500);

                            }
                            if(this.config.hideOnEsc!==false || this.config.hideOnBlur) {
                                document.body.addEventListener("keyup", _onkd = function onkd(e) {
                                    if(e.target && $d.isFormInput(e.target)){return}
                                    if (!(this.isVisible(true))) {
                                        document.body.removeEventListener("keyup", _onkd);
                                        return;
                                    }
                                    if (e.keyCode != 27) {
                                        return
                                    }
                                    document.body.removeEventListener("keyup", _onkd);
                                    if (this && this.isVisible(true)) {
                                        this.hide();
                                    }
                                }.bind(vw))
                            }
                        }
                    }finally{_show.busy=null}

                    return this.aftshow()
                }.bind(vw)
            vw.show=_show;
            vw.on("hide",_hide)
        },
        positionArrow:function(pos){
            var vw=this._view
            if(vw.uiklass && vw.uiklass.length){
                var klass=vw.uiklass;
                 klass.filter(function(a){return a.indexOf("arrow_box-")==0}).forEach(
                    function(a){
                        klass.splice(klass.indexOf(a),1)
                    }
                )
            }

            vw.uiklass="arrow_box-"+pos
        },
        layout:function Popuplayout(){

            function _layout(){
                var vw=this._view    ,config=vw.config
                var b,r=vw.computed;
                if(vw._parent){
                    //
                }
                if( config.anchor){
                    b=UI.Rect.create(  config.anchor).toMap()
                }
                if( config.centered){
                     var b=vw.getViewPort()
                    var container=vw._parent?vw._parent.contentWrap:( config.container||document)
                    if(container==document){
                        b={height:$.viewport.height,width:$.viewport.width,left:0,top:0}
                    }

                    //if(!container){
                    if(!config.__resizehandle) {
                        $.viewport.on (config.__resizehandle=function(ev){
                             vw.layout();
                        })//}
                    }
                     r.left=Math.max(1, b.left + ((b.width - vw.el.offsetWidth) /2));
                    r.top= Math.max(1,b.top+ ((b.height -  vw.el.offsetHeight)/2));
                    vw.el.css({top:r.top,left:r.left})
                } else if( config.anchor){
                    var bb=vw.getViewPort(),pos=config.anchorpos||config.anchorPos
                    var container=vw._parent?vw._parent.contentWrap:( config.container||document)
                    if(container==document){
                        bb={height:$.viewport.height,width:$.viewport.width,left:0,top:0}
                    }
                    b.top= b.top-bb.top ;b.left= b.left-bb.left
                    r.width= vw.getRect().width||b.width;
                    if(Number(vw.config.minwidth)>1){
                        r.width=Math.max(r.width,vw.config.minwidth)
                    }
                    r.height= r.height||250;
                    r.left= b.left
                    if(pos){

                        if(pos=="pointer"){
                            var arrow="left",anim="l"
                            r.top= Math.max(1,(b.top - Math.floor((r.height-b.height)/2)))
                            r.left= b.left+b.width+10
                            if(r.left+ r.width > bb.width){
                                r.left=  Math.max(1,b.left - (r.width+10));
                                arrow="right";anim="r"
                            }
                            if(r.top+ r.height > bb.height){
                                r.top = Math.max(1,b.top-(r.height+10));
                                r.left=  Math.max(1,(b.left+(b.width/2)) - Math.floor(r.width/2));
                                arrow="bottom";anim="b"
                            }
                            if(!(vw.config.animateShow && vw.config.animateShow.anchor)){
                                if($.isPlain(vw.config.animateShow) ){vw.config.animateShow.anchor=anim+"c"}
                                else{
                                    vw.config.animateShow={anchor:anim+"c",duration:"fast" }
                                }
                            }
                            this.positionArrow(arrow)
                            vw.el.css({top:r.top,left:r.left})

                        }
                    } else if(config.rightAligned||config.bottomAligned ){
                        if(config.rightAligned){
                            r.left= (b.left - r.width );
                        }
                        if(config.bottomAligned){
                            r.top= (b.top - r.height );
                        }

                    }
                    r.top= r.top>1? r.top: config.bottomAligned?(b.bottom||b.top+b.height):b.top;;
                    //Math.max(r.width,

                } else {
                    if(vw.getRect().top >1&&vw.getRect().left >1){
                        r.width= vw.getRect().width||(b||{}).width||200;
                    }

                    r.height= r.height||250;
                }

                var vp=$.viewport.get()
                if(vp.height<r.height){r.height=vp.height-10}
                var diff=vp.height-(r.top+ r.height+10)

                if(diff<0){
                    r.top = Math.max(1,r.top+diff)
                    if(pos=="pointer"){
                        if(b && b.top > r.top+ r.height){
                            this.positionArrow("bottom")
                        }

                    }

                }
                if(vp.width<r.width){r.width=vp.width-10}

                diff=vp.width -(r.left+ r.width+5)
                if(diff<0){
                    r.left+=diff;
                }
                if(vw.config.hideOnBlur){
                }

            }
            _layout.call(this )
            this._view.on("aftershow",_layout.bind(this),{once:true})
        }

    });
    Layout.impl.Flyout=self.Klass("Layout.impl.Flyout",Layout.impl.base,{priority:1,
        initialize:function initialize(vw,optns0){
            if(optns0){vw.config=optns0}
            var optns=vw.config
            optns.flyout||(optns.flyout={});
            var anchorPos=vw.config.anchorPos=optns.anchorPos||optns.flyout["anchorPos"]//||optns.flyout.anchorPos||optns.anchorPos||vw.config.anchorPos

            if(vw && vw.rect){
                vw.rect.setAlignment(anchorPos)
                //vw.getRect().on(function(){  },"right")
            }
        },
        layout:function Flyout( ){ var vw=this._view  ,config=this.config;
            vw.config.positioned=true;
            vw.uiklass="layout-panel-collapseible";
            var anchorPos= config.anchorPos //||optns.flyout.anchorPos||optns.anchorPos||vw.config.anchorPos
            if(anchorPos=String(anchorPos).toLowerCase()){
                if(String(anchorPos).indexOf("r")>=0){
                    //vw.computed.setAt("right",vw.config.right||1)
                }
                if(String(anchorPos).indexOf("b")>=0){
                    //  vw.computed.bottom=vw.computed.bottom>=1?vw.computed.bottom:1
                    //vw.computed.top=0;
                }
            }
            // if(!optns.initExpanded){}




        }});
    Layout.impl.Frame=self.Klass("Layout.impl.Frame",
        Layout.impl.base,{priority:2,
            initialize:function Frame(vw,optns0){
                var layoutops= UI.viewUtils.extend(vw.config||{},optns0) ,  frameops=  layoutops||{}
                var hdr=vw.headerbar,ftr=vw.footerbar
                vw.rect.padding=vw.rect.padding||(vw.config.framepadding ==null?5:vw.config.framepadding) ;
                if(!hdr){
                    var hdrframeops=frameops.header||(frameops.header={}) ;

                    hdrframeops.style||(hdrframeops.style={});
                    hdrframeops.title=hdrframeops.title||layoutops.title
                    //hdrframeops.style.lineHeight=
                    hdrframeops.style.height=hdrframeops.style.height||hdrframeops.height;
                    hdr=  Layout.impl.FrameBar.setup("headerbar","top",vw,hdrframeops)

                }

                if(!ftr ){
                    var ftrframeops=frameops.footer||(frameops.footer={}) ;
                    ftrframeops.style =ftrframeops.style ||{};
                    //ftrframeops.style.lineHeight=
                    ftrframeops.height=ftrframeops.height    ;

                    ftrframeops.bounds=ftrframeops.bounds||{};ftrframeops.bounds.bottom=1;
                    ftr=  Layout.impl.FrameBar.setup("footerbar","bottom",vw,ftrframeops)
                    ftr.getRect().setAlignment("b")
                }


            },
            layout:function Frame( ){ var vw=this._view;
                var  frameops=this.config

                var hdr=vw.headerbar,ftr=vw.footerbar
                if(!hdr){
                    var hdrframeops=frameops.header||frameops;
                    hdrframeops.style||(hdrframeops.style={});
                    hdrframeops.style.height=(hdrframeops.height||vw.getRect().height)+"px";
                    hdrframeops.title=hdrframeops.title||frameops.title;
                    hdr=  Layout.impl.FrameBar.setup("headerbar","top",vw,hdrframeops)
                }
                var w=vw.getRect().width ;
                hdr.getRect().width=w;
                if(hdr.config&& hdr.computed ){hdr.computed.width=w}
                if(!ftr ){
                    var ftrframeops=frameops.footer||frameops;
                    ftrframeops.style||(ftrframeops.style={});
                    ftrframeops.style.height=ftrframeops.height||ftrframeops.style.height||32
                    ftr=  Layout.impl.FrameBar.setup("footerbar","bottom",vw,ftrframeops)
                }
                ftr.getRect().width=w;
                if(ftr.config && ftr.computed ){ftr.computed.width=w}
                //vw.getRect().insets.bottom=30;
                //header
                //footer


            }});
    var StackedProto={layout:function Stacked( loc){
        var vw=this._view,ui=self.UI,list=vw.panels,config=this.config,
            dim=(loc=="row")?"height":"width" ,
            other=dim==="width"?"height":"width",
            runningdim=loc=="row"?"bottom":"right",
            pos=dim==="width"?"left":"top",
            otherpos=pos==="top"?"left":"top";

        var rect=vw.getContentDims().toMap(true),offsets=new ui.Offset();   rect.top=rect.left=0.1;
        //  if(loc=="row"){offsets.top=rect.top} else{offsets.left=rect.left}
        var av =rect[dim]-list.reduce(function(m,it){return m=m+it.getRect().getAt(dim,true)},0),
            autocompo=list.filter(function(it){return    it.getRect().getAt(dim,true)<2});
        if(autocompo.length){
            var auto=av/autocompo.length;
            autocompo.forEach(function(it){it.computed[dim]=auto})
        }
        for(var i= 0,l=list,ln= l.length,it;it=l[i],i<ln;i++){
            if(it.isPositioned()){continue}
            it.config.stretchedDimension=other
            it.config.flexDimension=dim
            var rect1=it.computed;  //it.config.location=loc;
            rect1 [pos]=offsets[runningdim];
            rect1[otherpos]= rect[otherpos]+0.01;
            rect1[other]= rect[other];
            offsets[runningdim]=offsets[runningdim]+rect1[dim];
        }
    } };

    Layout.impl.Stacked=self.Klass("Layout.impl.Stacked",Layout.impl.base,StackedProto);

    Layout.impl.Column=self.Klass("Layout.impl.Column",Layout.impl.base,{priority:2,layout:function Column( ){ var vw=this._view;
        if(!vw._parent){return}
        var cdims=vw.getRect()._parent.getContentDims()
        vw.computed.top=0.1;vw.computed.height=cdims.height;
    }});
    Layout.impl.Block=self.Klass("Layout.impl.Block",Layout.impl.base,{priority:2,layout:function Block( ){ var vw=this._view;
        if(!vw._parent){return}
        vw.computed.left=0.1;
        vw.computed.setWidth(vw._parent.getRect().getContentbox().width);}
    });
    Layout.impl.Rows=self.Klass("Layout.impl.Rows",Layout.impl.base,{layout:function Rows( ){
        var vw=this._view; StackedProto.layout.call( this,"row"); }});
    Layout.impl.hbox=self.Klass("Layout.impl.vbox",Layout.impl.base,{layout:function vbox( ){
        var vw=this._view;
        StackedProto.layout.call( this,"row"); }});
    Layout.impl.vbox=self.Klass("Layout.impl.hbox",Layout.impl.base,{layout:function hbox( ){
        var vw=this._view; StackedProto.layout.call( this,"column"); }});
    Layout.impl.Columns=self.Klass("Layout.impl.Columns",Layout.impl.base,{layout:function Columns( ){
        var vw=this._view; StackedProto.layout.call( this,"column"); }});
    Layout.impl.Viewport=self.Klass("Layout.impl.Viewport",Layout.impl.base,{
        _vwprt:null,_view:null,priority:10,
        setup:function(){ },
        layout:function layout( ){ var vw=this._view;
            this._view=this._view||vw;if(!this._view){return}
            this._vwprt||(this._vwprt=$.viewport.get());
            if(!this._view.data("_resizesetup")){this._view.data("_resizesetup",1)
                function _viewresize(ev){
                    var r=  r=$.viewport.get()
                    if(!(r.height>0&&r.width>0)){return}
                    if(this.el && this.el.parentNode){
                        if(Math.abs(r.height-this.computed.height)>2){
                            this.computed.setHeight(r.height);

                        }
                        if(Math.abs(r.width-this.computed.width)>2){
                            this.computed.setWidth(r.width);
                        }
                        //this.fire("resize",r);
                        this.components.forEach(function(it){
                            it.needsRedraw=true
                        })
                        this.layout(true);
                    }}

                if(this._view.isRoot()){
                    $.viewport.on (_viewresize.bind(this._view))//}
                }

                //  this._view.on("resize",
            }
            var margin=this._view.rect.margins;

            this._view.computed.setHeight(this._vwprt.height-(margin.top +margin.bottom));
            this._view.computed.setWidth(this._vwprt.width-(margin.left +margin.right));
            if(margin.top){this._view.computed.top=margin.top}
            if(margin.left){this._view.computed.left=margin.left}
        }
    } );
    Layout.impl.Fill=self.Klass("Layout.impl.Fill",Layout.impl.base,{priority:9,
        layoutFill:function Fill( ){
            var vw=this._view;
            var rect;
            if(vw._parent){
                if(!(vw._parent.state._layoutinprogress||!vw._parent._parent  ||(vw._parent._parent&& vw._parent._parent.state.layoutcompleted))){
                    vw._parent.observer.once("afterlayout",function(){});
                }

                rect=vw._parent.getContentDims()
                vw.computed.update({height:rect.height-vw.el.offsetTop, width:rect.width})
            } else{
                var container=vw.config.container?
                    (vw.config.container.contentWrap||vw.config.container):
                    ((vw.isRoot() && vw.el && vw.el.el.parentNode&& vw.el.el.parentNode.offsetHeight)?
                        vw.el.el.parentNode:
                        vw._parent?vw._parent.el:null
                    );
                var el=container?DomCore(container):null;
                if(!vw.data("_container")){vw.data("_container",el)}
                if(el&&el.offsetHeight){
                    if(!(vw.data("_containerresizeListener")&&vw.data("_container")==el)){
                        el.on("resizeX",function(ev){if(!vw.isVisible()){return}
                            var r=ev.data,mod;
                            if(Math.abs(r.height-vw.computed.height)>2){mod=true;}//vw.computed.setHeight(r.height);}
                            if(Math.abs(r.width-vw.computed.width)>2){mod=true;}//vw.computed.setWidth(r.width);}
                            mod && vw.layout();
                        });
                        vw.data("_containerresizeListener",1)
                    }
                    if(!vw.iscollapsed()&&vw.isVisible()){
                        vw.computed.update({height:el.clientHeight, width:el.clientWidth})
                    }
                }


            }
        },
        layout:function Fill( ) {
            this.layoutFill()
        }
    });
    Layout.impl.cube3d=self.Klass("Layout.impl.cube3d",Layout.impl.base,{
        _initui:function(){
            if(this._viewport){return}
            var el = document.createElement('div'),
                transformProps = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
                transformProp = support(transformProps),
                transitionDuration = 'transitionDuration WebkitTransitionDuration MozTransitionDuration OTransitionDuration msTransitionDuration'.split(' '),
                transitionDurationProp = support(transitionDuration);

            function support(props) {
                for(var i = 0, l = props.length; i < l; i++) {
                    if(typeof el.style[props[i]] !== "undefined") {
                        return props[i];
                    }
                }
            }
            var outer=this._view.el;
            var mouse = { start : {} },
                touch = document.ontouchmove !== undefined,
                viewport = {  view:this._view,
                    x: -10, y: 20,
                    el: null,
                    move: function(coords) {
                        if(coords) {
                            if(typeof coords.x === "number") viewport.x = coords.x;
                            if(typeof coords.y === "number") viewport.y = coords.y;
                        }

                        viewport.el.style[transformProp] = "rotateX("+viewport.x+"deg) rotateY("+viewport.y+"deg)";
                    },
                    reset: function() {
                        this.move({x: 0, y: 0});
                    }
                };
            viewport.el=  DomCore.q('.threed-cube').el
            viewport.duration = function() {
                var d = touch ? 50 : 500;
                viewport.el.style[transitionDurationProp] = d + "ms";
                return d;
            }();

            document.onkeydown=function(evt) {
                switch(evt.keyCode)
                {
                    case 37:  viewport.move({y: viewport.y - 90}); break;// left
                    case 38:  evt.preventDefault(); viewport.move({x: viewport.x + 90});break;// up
                    case 39: viewport.move({y: viewport.y + 90}); break;// right
                    case 40:  evt.preventDefault();viewport.move({x: viewport.x - 90}); break;// down
                    case 27: viewport.reset();  break; //esc
                    default:
                        break;
                };
            }
            var _active
            document.onmousedown =document.ontouchstart= function(evt) {
                delete mouse.last;
                if(_active) {
                    stopped=true ;
                    document.onmouseup=null ;document.onmousemove=null;  return
                }
                if(DomCore (evt.target).is('a, iframe')) {
                    return true;
                }
                if(!(viewport.view  && viewport.view.el.q(".threedviewport"))){
                    return;
                }
                var stopped
                evt.touches ? evt = evt.touches[0] : null;
                mouse.start.x = evt.pageX;
                mouse.start.y = evt.pageY;
                document.onmousemove=function(event) {if(stopped===true){document.onmousemove=null;stopped=null;return}
                    // Only perform rotation if one touch or mouse (e.g. still scale with pinch and zoom)
                    if(!touch || !(event.touches.length > 1)) {
                        event.preventDefault();
                        // Get touch co-ords
                        event.touches ? event = event.touches[0] : null;
                        moveviewport( event,{x: event.pageX, y: event.pageY});
                    }
                };

                document.onmouseup= function mu() {     stopped=true
                    document.onmouseup=null ;document.onmousemove=null;
                };
            }

            function moveviewport(evt, movedMouse) {
                // Reduce movement on touch screens
                var movementScaleFactor = touch ? 4 : 3;
                if (!mouse.last) {
                    mouse.last = mouse.start;
                } else {
                    if (forward(mouse.start.x, mouse.last.x) != forward(mouse.last.x, movedMouse.x)) {
                        mouse.start.x = mouse.last.x;
                    }
                    if (forward(mouse.start.y, mouse.last.y) != forward(mouse.last.y, movedMouse.y)) {
                        mouse.start.y = mouse.last.y;
                    }
                }

                viewport.move({
                    x: viewport.x + parseInt((mouse.start.y - movedMouse.y)/movementScaleFactor),
                    y: viewport.y - parseInt((mouse.start.x - movedMouse.x)/movementScaleFactor)
                });

                mouse.last.x = movedMouse.x;
                mouse.last.y = movedMouse.y;

                function forward(v1, v2) {
                    return v1 >= v2 ? true : false;
                }
            }

            this._viewport     =viewport;
            //  })();





            /* var vw=this._view;
             var xAngle = 0, yAngle = 0;
             document.addEventListener('keydown', function(e) {  var vw=this._view;
             if(!vw.isVisible()){return}
             var vwp=vw.el.q(".threedviewport");
             if(!vwp){  return}
             switch(e.keyCode) {
             case 37:yAngle -= 90; break; // left
             case 38:xAngle += 90; break; // up
             case 39:yAngle += 90; break; // right
             case 40:xAngle -= 90; break; // down
             };
             vwp.style.webkitTransform = "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)";
             }.bind(this), false);*/
        } ,
        clearLayout:function(){
            var vw=this._view,b=$.browser;
            var vwp=vw.el.q(".threedviewport");
            if(vwp){
                vw.el.el.insertBefore(vwp.firstChild,vwp.el||vwp)
                vw.el.el.removeChild(vwp.el||vwp)
            }
            var _savescssText=vw.contentWrap.data("_savescssText");
            if(_savescssText) {vw.contentWrap.el.style.cssText=_savescssText;}
            vw.contentWrap.el.style[b.csspr+""]
            vw.contentWrap.removeClass("threed-cube")
            vw.panels.forEach(function(it,i){it.el.removeClass("cube-face","cube-face-"+(i+1))});
        },
        layout:function(){

            var vw=this._view,cd=vw.getContentDims(),vwp=vw.el.q(".threedviewport");
            vw.el.css("opacity",0.1)
            if(!vwp){
                vwp=vw.el.el.insertBefore(document.createElement("div"),vw.el.el.firstChild)
                vwp.className="threedviewport";
                vwp.appendChild(vw.contentWrap.el)
            }
            vw.contentWrap.data("_savescssText",vw.contentWrap.el.style.cssText)
            var r=this._view.getContentDims().toMap(true) ;
            this._view.panels.forEach(function(it){it.computed.update({top: r.top,left: r.left, height:550,width: 550})});

            setTimeout(function(){
                    vw.contentWrap.addClass("threed-cube").css({ height:550,width:550 })
                    vw.panels.forEach(function(it,i){
                        it.el.css({height:510,width:510,left:0.1 ,top:0.1}) ;
                        it.el.addClass("cube-face","cube-face-"+(i+1))
                        //  it.el.el.style.removeProperty("left");it.el.el.style.removeProperty("top")
                    });

                    if(!this._viewport){this._initui()};
                    vw.el.css("opacity",1)
                }.bind(this),100
            ) ; }})
    Layout.impl.Grid2=self.Klass("Layout.impl.Grid2",Layout.impl.base,{
        layout:function Grid( ){
            var vw=this._view;
            vw.grid=this;
            vw._throttled||(vw._throttled=$.throttle(vw.layout.bind(vw)))
            var optns=vw.config||{}
            var c=vw.computed,r=vw.rows||optns.gridrows,cl=   vw.columns||optns.gridcolumns,first
            if(!vw.data("_gridsetup")){
                vw.data("_gridsetup",1)
                first=true
                vw.properties.set("gridcolumns",cl||1)
                vw.properties.set("gridrows",r||1)
            }
            var  d= {h:c.height/vw.rows,w: c.width/vw.columns}

            if(first){
                vw.panels.forEach(function(it,i){
                    it.properties.set("row",it.config.row||1)
                    it.properties.set("col",it.config.col||1)
                    it.properties.set("rowspan",it.config.rowspan||1)
                    it.properties.set("colspan",it.config.colspan||1)
                    it.onpropertychange("row col rowspan colspan", vw._throttled )
                    it.config.uiklass="gridcell gridcell"+i
                })
                //vw.watchDimensions()
                //    vw.onpropertychange("gridcolumns gridrows", vw._throttled)
                vw.on("resize",vw._throttled);
            }
            if(vw.gridcolumns && vw.gridrows){
                var currrow=1,currcol= 1 ,gridrows=vw.gridrows||1,gridcolumns=vw.gridcolumns||1
                var  d= {h:c.height/ gridrows,w: c.width/ gridcolumns}
                var rows=Array( gridrows +1).join("0").split("").map(function(it,i){return i}),
                    columns=Array( gridcolumns  +1).join("0").split("").map(function(it,i){return i}) ,allcels=[]

                var allcels=List.from(rows).permute(columns)
                    .collect(function(it,i){var r=it[0],c=it[1]
                        return {id:"r"+(r+1)+"c"+(c+1),row:r+1,column:c+1 }
                    })//.sortBy(function(it){return (10+it.row)+((it.column*1.1)/10.0)})
                //.collect(function(it,i){it.index=i;return it}) ;

                var rnng=1,compos=vw.components.filter(function(it,i){return !(it.isPositioned()||it.hasLayout("framebar"))})
                if(!compos.length){return}
                var totcells=gridcolumns*gridrows

                vw.components.forEach(function(it,i){if(it.isPositioned()||it.hasLayout("framebar")){return}

                    var compo=it;
                    var cells=[],rowspan=it.rowspan||1, colspan=it.colspan||1, row=currrow,col= currcol,endrow=row,endcol=col
                    if(col<0){col=gridcolumns+col+1}
                    if(row<0){row=gridrows+row+1}
                    it.config.uiklass="gridcell gridcell"+i
                    if(rowspan>1||colspan>1){
                        endrow=currrow+rowspan-1;endcol=Math.min(currcol+colspan-1,gridcolumns)
                        allcels.findAll(function(it){return !it.taken&&(it.row>=currrow&&it.row<=endrow)&&(it.column>=currcol&&it.column<=endcol)})
                            .each(function(c){cells.push(c);c.taken=1;c.panel=compo})
                    }


                    it.properties.set("row",row)
                    it.properties.set("col",col)
                    it.properties.set("rowspan",rowspan)
                    it.properties.set("colspan",colspan)
                    if(col+colspan-1>gridrows){col=col-((col+colspan)-(gridrows+1))}
                    var data= {top: d.h*(row-1)+0.2,left: d.w*(col-1)+0.2,height: d.h*rowspan,width: d.w*colspan }
                    it.properties.set("cells",cells)
                    currcol=endcol+1  ;
                    //allcels[rnng-1]&&(allcels[rnng-1].taken=1);
                    rnng++;
                    /*while(allcels[rnng-1]){var cl=allcels[rnng-1]
                     if(!cl.taken){
                     if(allcels[rnng]&&allcels[rnng].taken){
                     cl.taken=1
                     } else{
                     currcol=cl.column
                     break;
                     }

                     }
                     rnng++
                     } */
                    if(endcol>=gridcolumns){
                        currrow=currrow+rowspan;
                        //currcol=1
                    }
                    it.computed.update(data )
                    if(first){
                        it.onpropertychange("row col rowspan colspan", vw._throttled )
                    }
                })


                this.cellDims=d

            }



        }      });
    Layout.impl.Fit=self.Klass("Layout.impl.Fit",Layout.impl.base,{layout:function Fit( ){ var vw=this._view; }});
    View.plugins={}
    View.plugins.draggable=(function(){
        return {
            attach:function(vw,trigger){
                if(trigger){ var _timer=0,dragel=0,_active=0,baseel=vw.el
                    var evs={move:"mousemove",down:"mousedown",up:"mouseup"}
                    trigger.el.on(evs.down,function(evt){
                        if($d.is(evt.target,".slide-menu-trigger,.top-right-cancel,.link")){return}
                        var lastVals=null;
                        if(evt.which==3||_active){return}
                        if(_active || $d.hasClass(evt.target,"resizer")||$d.is(evt.target,"input,.nodrag")||$d.up(evt.target,".nodrag")){return}
                        _active=1


                        $d(document.body).addClass("noselection")
                        var frm=$d.util.animframe,qu=[],currvw=vw,targetEl=(currvw.isPositioned()?currvw._parent:vw)||vw,
                            startdims={pos:$d.util.mousePos(evt),top:vw.el.el.offsetTop,left:vw.el.el.offsetLeft},
                            stop=function(evt){
                                var a=_active;_active=0
                                document.removeEventListener(evs.move,mv)
                                document.removeEventListener(evs.up,stop)
                                setTimeout(function(){document.body.classList.remove("noselection")},1000)
                                if(_timer){clearInterval(_timer);_timer=0}

                                $d.st(".dragger-ghost").remove()

                                dragel=null
                                if(a<=2 || !(lastVals&&(lastVals.top||lastVals.left))){
                                    return
                                }

                                vw.rect.top=Math.max(5,lastVals.top);
                                vw.rect.left=Math.max(5,lastVals.left);
                                vw.config.anchor=null;
                                if(currvw.el){currvw.el.removeClass("fxtx_25")}
                                frm(targetEl.layout.bind(targetEl));
                            },
                            mv=function(evt){
                                if(! _active){return}
                                if(!dragel){
                                    dragel=baseel.el.cloneNode(false),dragel.className="dragger-ghost";
                                    dragel=vw.el.el.parentNode.insertBefore(dragel  ,vw.el.el.nextSibling)
                                    dragel.onmousedown=stop
                                }
                                if(!_timer){
                                    _timer=setInterval(function(){ if(_timer&&_active && (Date.now()-_active)>2000){stop()}})
                                }
                                _active=Date.now()
                                var st={} ;
                                if(evt){
                                    var pos=$d.util.mousePos(evt),delta={x:pos.x-startdims.pos.x,y:pos.y-startdims.pos.y}
                                    st={top:startdims.top+delta.y,left:startdims.left+delta.x}
                                    qu.push(st)
                                    frm(function(){
                                        var vv=qu.pop();
                                        if(vv&&dragel&&dragel.style){
                                            dragel.style.top=vv.top+"px";dragel.style.left=vv.left+"px"
                                        }
                                    });

                                    lastVals=st
                                }
                            }

                        document.addEventListener(evs.up,stop)
                        setTimeout(function(){  _active=1
                            mv();
                            document.addEventListener(evs.move,mv)
                        },100)


                    })
                }
            }
        }
    })();
    View.Panel=function(){
        var layoutoptns= viewArgs.call(this, arguments );
        var vw=new $.View( layoutoptns);
        vw.addLayout("panel")
        return vw
    }
    View.Viewport=function(){
        var layoutoptns= viewArgs.call(this, arguments );
        var vw=new $.View( layoutoptns);
        vw.addLayout("Viewport")
        return vw
    }
    View.popup=function(optns){
        var layoutoptns= viewArgs.call(this, arguments );
        //if($.isArray(layoutoptns.viewlayouts)){layoutoptns.viewlayouts.push()}
        layoutoptns.layouts="popup";
        View.applyNobileOptions(layoutoptns)
        var vw=new $.View( layoutoptns);
        if(layoutoptns.padding&&!(optns||{}).nocontentwrap){vw.contentWrap=vw._crEl()}
        vw.moveBy=function(pt){
            if(this.rect.top<1){this.rect.update(this.computed.toMap())}
            this.rect.moveBy.apply(this.rect,arguments)
            if(this.isVisible()){
                this.layout()
            }
            return this
        }
        vw.moveTo=function(pt){
            this.rect.moveTo.apply(this.rect,arguments)
            if(this.rect.top<1){this.rect.update(this.computed.toMap())}

            if(this.isVisible()){
                this.show().layout()
            }
            return this
        }

        vw.setSize=function(w,h,nolayout){
            var vp=$.viewport.get(),lo=this.computed,mod
            if(w&&w>10){
                var nu=Math.min(vp.width *.9,w)
                if(nu&&Math.abs(nu-this.computed.width)>2){
                    this.computed.width=nu;mod=1
                }
            }
            if(h&&h>10){
                var nu=Math.min(vp.height *.9,h)
                if(nu&&Math.abs(nu-this.computed.height)>2){
                    this.computed.height=nu;mod=1
                }
            }
            if(this.rect.top<1){this.rect.update(this.computed.toMap())}
            if(mod){
                this.computed.moveTo.apply(this.computed,arguments)
            }

            if(!nolayout&&this.isVisible()){
                this.show().layout()
            }
            return this
        }
        return vw
    }
    View.lookupList_mobile=function(optn ,c ){
        optn=optn||{}
        var ip0=optn.anchor||optn.ip,vlist0=optn.list||[],ascombo0=optn.ascombo,callback = c
        if(vlist0){vlist0=vlist0.list  ||vlist0}

        if(!ip0||ip0.__dsv){return};
        if($.browser.safari){ascombo0=false};

        function _build(ip,vlist,ascombo,cb0){

            var id=ip.id+"_datalist",cb=typeof(cb0)=="function"?cb0:function(){}
            if(document.getElementById(id)){ return }

            var dsvwrap,valuerec =$.modRecord("valchange");
            vlist=vlist.list||vlist
            if(!ascombo){
                dsvwrap=document.createElement("div")
                dsvwrap.style.height="1px";
                dsvwrap.tabindex=dsvwrap.tabIndex=1
                dsvwrap.style.overflow="hidden"
            }
            var dsv=document.createElement(ascombo?"datalist":"select"),curr=null
            if(dsvwrap){
                dsvwrap.appendChild(dsv)
                dsvwrap=ip.parentNode.insertBefore(dsvwrap,ip)
                //dsvwrap.className="fxtx";
                dsv.style.width="100%"
            } else{
                dsv=ip.parentNode.insertBefore(dsv,ip)
            }
            dsv.style.paddingLeft= "0px";
            dsv.style.paddingRight= "0px";
            var origlist=vlist
            var list =_parseList(vlist,{})

            dsv.setAttribute("id",id)
            list.forEach(function(k,i){
                var opt=document.createElement("option")
                opt.text = k.label==null?k: k.label
                opt.setAttribute && opt.setAttribute("value",k.id==null?k: k.id);
                typeof(dsv.add)=="function"?dsv.add(opt):dsv.appendChild(opt);
            });
            function _deactivate(){

                if(dsvwrap){
                    dsvwrap.style.height="1px";
                } else{
                    dsv.style.display="none";
                }
                ip.style.display=ip._display||"";
                valuerec && valuerec.setValue(null)
            }
            function onchange(ev){
                var val=$d.val(ascombo?ip:this),id
                if(curr===val){return}
                if(!ascombo&& $d.is(ip,"input,select")){
                    $d.val(ip,val);
                }
                var it=list.find(function(item){return item && item.id==val})

                if(it){
                    var rec=it
                    if(rec&&rec.label){
                        id=  rec.id||rec.value
                        val=rec.label||id
                    }
                } else{
                    id=val
                }
                curr=val
                valuerec.setValue(id,val)
                if(ev && ev.type=="change"){
                    _deactivate();
                }

            }

            var busy=0
            function _activate(init){ //if(busy){return}
                busy=1
                var target=dsvwrap||dsv
                try{

                    dsv.style.height=target.style.height=(Math.max(ip.offsetHeight,20))+"px"
                    target.style.width=(ip.offsetWidth )+"px";
                    "margin-left margin-right padding-left".split(/\s/).forEach(
                        function(k){target.style[k]=$d.css(ip,k);}
                    );
                    "font-size font-family line-height padding-top text-align padding-bottom".split(/\s/).forEach(
                        function(k){dsv.style[k]=$d.css(ip,k);}
                    );
                    target.style.display="block"
                    target.style.opacity=1;
                    var v=$d.val(ip);
                    var it=list.find(function(it){return it.label==v||it==v})
                    if(it){
                        var id=it.id==null?it:it.id
                        $d.val(dsv,id);
                    }
                    ip._display=$d.css(ip,"display");
                    if(init!==true){
                        ip.style.display="none"
                        setTimeout(function(){ $d(dsv).trigger("mousedown")  },20);
                    }
                } finally{ setTimeout(function(){busy=0},35);}

            }
            if(!ascombo){
                var target=dsvwrap||dsv
                target.style.border="none";target.style.outline="none";target.style.background="transparent"
                dsv.style.border="none";dsv.style.outline="none";dsv.style.background="transparent"
                ip.readOnly=ip.readonly=true;
                target.style.color=$d.getBackgroundColour(ip);
                dsv.addEventListener("change",function(ev){ onchange.call(this,ev) })
                ip.addEventListener("focus",_activate)
                target.addEventListener("focus",_activate)
                ip.addEventListener("mousedown",_activate)
                dsv.addEventListener("blur",_deactivate )

                dsv.onchange=onchange
                //_activate(true)
            } else{
                ip.oninput=onchange
                ip.addEventListener("change",function(ev){ onchange.call(this,ev) })
                ip.setAttribute("list",id);
            }
            ip.__dsv=1
            valuerec.on(function(rec){
                $d.val(ip,rec.valueLabel)
                cb(rec )
            })
            return {
                show:function(list){
                    _activate()

                },
                hide:function(){}
            }
        }

        return _build(ip0.el||ip0,vlist0,ascombo0,callback);

    }
    function _parseList(list,optns,vw ) {
        optns || (optns = {});

        var _li, listoptns = optns.list || {},
            labelname = listoptns.labelname || optns.labelname,
            keyname = listoptns.keyname || optns.keyname,
            labelprovider = optns.labelprovider || listoptns.labelprovider,
            itemtemplate = optns.itemtemplate || listoptns.itemtemplate  //st

        if (list && list instanceof Data.store || (list.list && list.list instanceof Data.store)) {
            var store = list.list || list;
            var recs = List.plugin.selectionModel(store.records);
            if(vw){
                vw.on("select", function (rec) {
                    var id=(typeof(rec)=="object" && "value" in rec )?rec.value:rec
                    var r = recs.findById(id)
                    if (r) {
                        recs.select(r)
                    }
                })
            }

            keyname = "id"
            _list = recs.collect(function (it) {
                return {id: it.id, label: it.getLabelValue()}
            })

            labelname = "label"
        } else {
            if (typeof(list) == "function") {
                list = list()
            }
            if (list && list.data && typeof(list.data) != "function") {
                list.list = list.data
            }
            if (list && list.list) {
                labelname = labelname || list.labelname
                keyname = keyname || list.keyname
                _list = list.list
            } else {
                _list = _list || list
            }
        }


        if (typeof(_list) == "function") {
            _list = _list()
        }
        if (!$.isArrayLike(_list)) {
            _list = []
        }
        var gps = [], gpmap = {}, template
        var fin = []
        if (itemtemplate) {
            template = $d.template(itemtemplate)
        }
        else {
            if (_list && _list.length && (!labelname || !keyname)) {
                if (_list[0]) {
                    var tst = _list[1] || _list[0]
                    if (typeof(tst) == "object") {
                        var kys = Object.keys(tst)
                        keyname = kys[0];
                        labelname = kys[1]
                        if (keyname == "label") {
                            keyname = labelname;
                            labelname = "label"
                        }
                        else if (labelname == "id") {
                            labelname = keyname;
                            keyname = "id"
                        }
                    }
                }
            }
        }
        _list || (_list = []);
        if (!labelprovider && labelname && labelname.indexOf("$") >= 0) {
            labelprovider = $.template(labelprovider)
        }

        if (labelprovider) {

            for (var i = 0, l = _list, ln = l.length, it; it = l[i], i < ln; i++) {
                if (!it) {
                    continue
                }
                fin.push({id: keyname ? it[keyname] : it, label: labelprovider(it), gp: it.gp || "-"})
            }

            keyname = "id";
            labelname = "label";
        } else {
            fin = $.makeArray(_list)
        }
        fin.labelname=labelname
        fin.keyname=keyname
        return fin;
    }
    View.lookupList=(function(){
        var _cachedIdmap={},isTouchDevice=true
        return function(optn ,c ){
            var nomatch=null;
            optn=optn||{}
            if(optn.id && _cachedIdmap[optn.id]){
                var vw=_cachedIdmap[optn.id];
                return vw;

            }
            var proc=function(o,callback){

                var optns=o ||{}
                var cb=callback||optns.callback;
                delete optns.callback;      optns.draggable=false;
                if(optns.container){optns.aspanel=true}

                optns.hideOnBlur==null&&(optns.hideOnBlur=!optns.aspanel);
                optns.hideonselection==null&&(optns.hideonselection=!optns.aspanel);
                if(optns.nowrap){optns.styles||(optns.styles={});optns.styles.whiteSpace="nowrap"}
                if(!optns.width){optns.minwidth=110}
                var vw = optns.aspanel?View.Panel(optns):View.popup(optns)
                vw.valuerec =$.modRecord("valchange");
                if(optns.aspanel&&!vw.rect.height){
                    //vw.addLayout("fill")
                }
                //  if(!optns.aspanel){vw.config.fitcontent=true}
                vw.contentWrap.css("overflow-y","auto")

                var _comboSearch=function(ev){
                    var first,d=ev.target,srch=String(ev.target.value).toLowerCase(),wrpr=this.contentWrap;
                    if(srch== d.dataset.lastsearch){return}
                    d.dataset.lastsearch=srch

                    wrpr.qq(".filter-listbox li.filtered-out").forEach(function(it){
                        it.classList.remove("filtered-out")
                    });
                    wrpr.qq(".filter-listbox li em").forEach(function(it){var em=it.el||it
                        em.parentNode.insertBefore(document.createTextNode(em.textContent),em);
                        em.parentNode.removeChild(em)
                    });
                    if(srch.length){
                        first=srch.charAt(0)
                        if(first=="^"||first=="$"||first=="~"){srch=srch.substr(1)}
                        else{first=null}
                    }
                    if(!srch.length){return}
                    var l=wrpr.qq(".filter-listbox li[data-key]"),vis=l.length
                    for(var i=0,ln=l.length,it;it=l[i],i<ln;i++){if(!(it&&it.textContent)){continue}
                        if(String(it.textContent).toLowerCase().indexOf(srch)==-1){
                            it.classList.add("filtered-out")
                            vis--
                        } else {
                            var re="("+srch.replace(/([.*+?^=!:\${}()|[\]\/\\])/g,"\\$1")+")"
                            if(first=="^") {re=first+re}
                            else if(first=="$") {re=re+first}
                            it.innerHTML=it.textContent.replace(new RegExp(re,"ig"),"<em>$1</em>")
                        }
                    }

                    if(!vis){
                        wrpr.st(".list-gp-title").hide()
                        //wrpr.qq(".list-gp-title")
                        nomatch=wrpr.q(".no-match-msg")
                        if(!nomatch){wrpr.insert("Z:div.no-match-msg[abs;top:20px;height:20px;w:100%;left:0;text-align:center;]{No Match found}");
                            nomatch=wrpr.q(".no-match-msg")
                        }
                        nomatch&&nomatch.show()
                    }else{nomatch&&nomatch.hide()
                        wrpr.st(":not(.filtered-out)").groupBy(function(it){
                            return it.dataset.gp}).eachEntry(function(nm,lst){if(!lst.length){return}
                            var gp=lst.length&&lst[0].hasClass("list-gp-title")?lst[0]:null
                            if(gp){
                                if(lst.length==1){
                                    gp.hide()
                                }  else{gp.show()   }
                            }
                        });

                        wrpr.qq(".list-gp-title").forEach(function(iy){iy.show()})
                    }

                }.bind(vw)
                optns.doSearch=_comboSearch
                var _content=function(list ){  optns||(optns={});
                    var fin =_parseList(list,optns,vw),keyname=fin.keyname,labelname=fin.labelname
                    var gps=[],gpmap={},
                        template=$d.template( "<li style='position:relative;' ${disabled?'item-disabled':''} data-gp='$gp' data-key='$"+( keyname||"it")+"'>$"+( labelname||"it")+"</li>");
                    for(var i= 0,l=fin,ln= l.length,it;it=l[i],i<ln;i++){
                        if(!it){continue}
                        it.gp||(it.gp="-");
                        if(gps.indexOf(it.gp)==-1){gps.push(it.gp)};
                        (gpmap[it.gp]||(gpmap[it.gp]=[])).push(it)
                    }

                    if(gps.indexOf("-")==-1){gps.push("-");}
                    //  if()
                    var cntn=$d.template(
                        "div.listbox-container.layout-list-popup>ul.layout-fit-container.filter-listbox.defcontentBg{-list-}"
                    ).el

                    var content=[]
                    if(gps.length>1){
                        var gpdoms={}
                        $.each(gpmap,function(v,k){
                            gpdoms[k]=v.map(function(it){return  template(it)})
                        });
                        $.each(gps,function(k){var v=gpdoms[k];if(!v){return}

                            if(k&&k!="-"){content.push("<div data-gp='"+k+"'class='no-data-row list-gp-title'><label>"+k+"</label></div>")}
                            v.length&&[].push.apply(content,v);
                        });
                    }  else if(gps[0]&&gpmap[gps[0]]){content=gpmap[gps[0]].map(function(it){return  template(it)})}


                    $d(cntn).q(".filter-listbox").html(content.join(""))//.css({w:cntn.clientWidth});
                    this.contentWrap.clear().insert(cntn)

                    var wrpr= this.contentWrap;
                    if(optns.nowrap){this.el.addClass("nowrap")}
                    $d(cntn).st("li").addClass("list-row").css({"overflow":"hidden","overflowY":"auto"});
                }
                var _render=function(list ){  optns||(optns={});
                    _content.call(this,list )
                    if(optns.ascombo&&!optns.ip){if(optns.anchor&&optns.anchor.tagName=="INPUT"){optns.ip=optns.anchor}}
                    if(optns.ascombo&&optns.ip){
                        var ip=optns.ip.el||optns.ip
                        $d.prop(ip,"readOnly",false);
                        if(ip.type=="search"){
                            $d.on(ip,"click",function(evt){
                                var b=$d.bounds(evt.target)
                                if($d.util.mousePos(evt).x>b.right-20){//clicked on clear
                                    ip.value=""
                                    $d.trigger(ip,"input")
                                    evt.stopPropagation();
                                }
                            })
                        }

                        $d.on(optns.ip,"input",_comboSearch)

                    }
                }
                if(optns.list  ){
                    if(optns.list  instanceof Promise){
                        optns.list.then(function(data){_render.call(vw,data,optns)})
                    } else{
                        _render.call(vw,optns.list ,optns)
                    }

                }
                var hideonselection=!(optns.hideonselection===false||optns.hideOnBlur===false)

                vw.contentWrap.on("click",function(evt){
                    var rw=$d.find(evt.target,"[data-key]"),lbl,v; if(!rw){return}
                    if(evt.which==3||rw.hasClass("no-data-row")||($d(evt.target).hasClass("no-hide")||evt.target.tagName=="INPUT"&&evt.target.nodeType==3)   ){
                        return
                    }
                    if(rw){

                        vw.valuerec.record=[rw.dataset.key,rw.textContent]

                    }
                })
                if(typeof(cb)=="function"){ vw.on("select",cb)}


                var lastList=null
                vw._show=vw.show
                vw.befhide=function(){
                    var pr=Promise.deferred()
                    // this.el.hide();
                    this.el.css({overflow:"hidden"}).st(".filter-listbox").css({overflow:"hidden"})
                    return this.el.disAppear({a:"top", iter:10})
                }
                vw.destroy=function(){
                    if(this.id){
                        delete _cachedIdmap[this.id]
                        if(this.el){
                            this.el.remove();
                        }
                    }
                }
                vw.show=function(list,anchor){

                    this.layout( )
                    if(anchor!=null){this.config.anchor=anchor}

                    if(list  ) {
                        if(vw.contentWrap.qq(".list-row").length){
                            _content.call(this,list )  ;
                        } else{
                            _render.call(this,list )
                        }
                    }
                    this.valuerec&&this.valuerec.reset()
                    this.el.css("opacity",".1")
                    this._show()

                    var f=vw.contentWrap.q(".filter-listbox");
                    if(f){
                        f.css({bottom:"auto",height:"auto"})
                        if(f.scrollWidth>20&&f.scrollWidth<200){
                            f.st(".list-row").css({whiteSpace:"nowrap"})
                            if(f.scrollWidth>(vw.computed.width+2)){
                                var w=f.scrollWidth
                                vw.el.css("overflow","hidden")
                                if(vw.el.css("position")!="relative"){vw.el.css({width: w})}

                                f.parent().css({width: w+18})
                                vw.rect.width= vw.computed.width= w+20
                                vw.el.css("overflow","auto")
                            }

                        }
                        if(f.scrollHeight>50){
                            var d=f.scrollHeight-(vw.computed.height-f.offsetTop);
                            if(d<0){var nu= vw.computed.height+d
                                vw.el.css({height:nu+10})
                                if(f.parent()!=vw.el){
                                    f.parent().css({height:nu})
                                }
                                vw.computed.height=nu+10
                                setTimeout(function(){this.layout( true)}.bind(this),10)

                            }

                        }
                    }
                    this.el.toFront()
                    this.el.css({overflow:"hidden",opacity:1});
                    this.el.st(".filter-listbox").css({overflow:"hidden"});
                    var w= this.rect.width|| this.el.width||150
                    // this.el.show();
                    var view=this;
                    var pr=this.el.appear({a:"top",iter:10, end:function(){ this.css({overflow:"auto","clip":null})
                    }});
                    if(pr && pr.then){
                        var val=view.config.defaultValue||view.config.val||view.config.currentValue
                        if(val && typeof(val)!="object" ){var v=val
                            if(typeof(val)=="function"){
                                v=val(view)
                            }
                            var el=view.el.q('.list-row[data-key="'+v+'"]')
                            if(el){el.el.scrollIntoView(true)}
                        }
                    }
                    return this
                }
                vw.on("aftershow",function(){ this.contentWrap.css({"overflow":"hidden","overflow-y":"auto"})})
                vw.on("show",function(){
                    var el=this.el.q(".layout-list-popup"),d=this.getContentDims();
                    var last=this.el.q(".layout-list-popup .list-row:last-child")
                    if(!last){return}
                    if(!this.hasLayout("fill")){
                        var height=this.getRect().height
                        if(height<5){
                            height=last.offsetTop+last.offsetHeight+5
                            this.computed.height=height
                            if(el){var css={h:height}
                                if(el.css("position")!="relative"){css.width= d.width}
                                el.css(css)
                                this.el.css({h:height})
                            }
                        }} else{
                        //this.el.css({h:height})
                    }
                    this.el.toFront();
                })
                return vw
            };


            var vwport=$.viewport.get()
            optn.anchor=optn.anchor||optn.ip
            if(optn.addEvent&&optn.anchor &&!optn.nonative  ){//&& ($d.is(optn.anchor,"input")||$d.is(optn.anchor,"select")&& $.browser.isTouchDevice

                if(optn.list&&$.isArray(optn.list)&&typeof(optn.list[0])=="string"){
                    optn.list=optn.list.map(function(it){return typeof(it)=="string"||typeof(it)=="number"?{id:it,label:String(it)}:it})
                }
                var records=null
                if(optn.list && optn.list.getList){
                    records=optn.list.getList();
                }
                var tocallback=c;
                var lkup = View.lookupList_mobile(optn,function(rec){
                    if(records && records.getObserver){
                        var record=records.findById(rec.value)
                        records.getObserver().fire("select",record)
                    } else  if(optn.list){
                        record=optn.list.find(function(item){return item && item.id==rec.value})
                        if(record){
                            if(tocallback){tocallback(rec.value,rec.valueLabel)}
                        }
                    } else {
                        if(tocallback){tocallback(rec.value,rec.valueLabel)}
                    }


                })
                //lkup && lkup.show();
                /*$d.on(optn.anchor,"mousedown.listbox",function(ev){
                 ev.stopPropagation();
                 lkup.show();
                 });*/
                return lkup;
            } else{
                if($.browser.isTouchDevice&&!optn.height){
                    // optn.width=optn.height="90%";optn.left=optn.top="5%"
                    // optn.style.backgroundColor="#fff"
                }
            }

            if(!optn.height){optn.height=200}
            if(optn.addEvent&&optn.anchor){
                var lookuplist=null ,ret={
                    show:function(){},
                    hide:function(){},
                    view:null
                }
                if($.isArray(optn.list)){ lookuplist=optn.list;delete optn.list} ;
                return (function(optns,callback, list){
                    var vw =null
                    $d.on(optns.anchor,"mousedown.listbox",function(ev){
                        var ip=this;
                        if(!vw){
                            vw=proc(optns,callback)
                            vw.valuerec.on(function(rec){
                                vw.fire("select",rec.value,rec.valueLabel,vw)
                                optns.hideonselection && vw.hide();
                            })
                        }
                        ret.view=vw
                        if(typeof(list)=="function"){list=list()}
                        if(ip.type=="search"&&($d.bounds(ip).right-ev.x)<30){
                            $d.val(ip,"")
                            optns.doSearch&&optns.doSearch({target:ip.el||ip})
                        }
                        vw.layout().show(  list,ip)
                    })
                    return ret
                })(optn,c,lookuplist)
            }  else {
                View.applyNobileOptions(optn)
                var vw= proc(optn,c )
                vw.valuerec.on(function(rec){
                    vw.fire("select",rec.value,rec.valueLabel,vw)
                    optn.hideonselection && vw.hide();
                })
                vw.view=vw;
                return vw
            }




        }
    })();

    View.applyNobileOptions=function(layoutoptns){
        if($.browser.isTouchDevice  ){
            layoutoptns.uiklass=[].concat(layoutoptns.uiklass||[],"mobile-popup")
            var vw=$.viewport.get()
            if(!layoutoptns.height){
                layoutoptns.height=vw.height*.9;
                layoutoptns.width=vw.width*.9
                layoutoptns.left=vw.width*.05
                layoutoptns.top=vw.height*.05
                layoutoptns.style.backgroundColor="#fff"
            }
        }
    }
    View.Dialog=function(optns){
        if(typeof(optns)=="string"){var title=optns;
            if(arguments.length==2&&arguments[1]&&typeof(arguments[1])=="object"){optns=arguments[1];optns.title=title}
            else{optns={title:optns}}
        }
        var layoutoptns=optns ||(optns ={});
        layoutoptns.draggable=(layoutoptns.draggable==null?true:!!layoutoptns.draggable);
        layoutoptns.style=layoutoptns.style||{}
        if(!(layoutoptns.top&&layoutoptns.left)&&!layoutoptns.anchor){layoutoptns.centered=true}
        View.applyNobileOptions(layoutoptns)
        layoutoptns.style.position="fixed"

        var vwp=$.viewport.get(),isperc=0
        layoutoptns.isperc=null
        if(!layoutoptns.height){layoutoptns.height=vwp.height/2}
        if(!layoutoptns.width){layoutoptns.width=Math.min(vwp.width*.9,500)}
        if(layoutoptns.height&&String(layoutoptns.height).indexOf("%")>0){
            var perc=Number(String(layoutoptns.height).replace(/[^\d\.]/g,""));
            layoutoptns.isperc||(layoutoptns.isperc={})
            layoutoptns.isperc.height=perc
            layoutoptns.height=(perc/100)*vwp.height
        }
        if(layoutoptns.width&&String(layoutoptns.width).indexOf("%")>0){
            var perc=Number(String(layoutoptns.width).replace(/[^\d\.]/g,""));
            layoutoptns.isperc||(layoutoptns.isperc={})
            layoutoptns.isperc.width=perc
            layoutoptns.width=(perc/100)*vwp.width
        }

        //optns.style.zIndex=optns.style.zIndex||1000
        //layoutoptns.title||(layoutoptns.title="Dialog");
        layoutoptns.isDialog=true
        if(!(layoutoptns.hideFooter||layoutoptns.hideFrameBars)){
            layoutoptns.footer=layoutoptns.footer||{};
            layoutoptns.footer.style=layoutoptns.footer.style||{}
        }
        if(!(layoutoptns.hideHeader||layoutoptns.hideFrameBars)) {
            layoutoptns.header = layoutoptns.header || {};
            layoutoptns.header.style = layoutoptns.header.style || {}
            if (layoutoptns.title) {
                layoutoptns.header.height = layoutoptns.header.height || 26
            }
        }
        //layoutoptns.footer.height+=10
        //optns.padding=15
        layoutoptns.uiklass="layout-dialog"

        var vw=new $.View( layoutoptns );
        //if(layoutoptns.animateShow){vw.config.animateShow=animateShow}
        if(layoutoptns.isperc ){
            $.viewport.on($.throttle(function(){ var vwp=$.viewport.get(), targetvw=this;
                if(layoutoptns.isperc.height){
                    targetvw.rect.height=(layoutoptns.isperc.height/100)*vwp.height
                }
                if(layoutoptns.isperc.width){
                    targetvw.rect.width=(layoutoptns.isperc.width/100)*vwp.width
                }
                targetvw.components.forEach(function(it){
                    it.needsRedraw=true
                })
                targetvw.layout();
                targetvw.fire("resize")
            }.bind(vw)))
        }
        var modal=null
        if(layoutoptns.modal){
            vw.on("beforeshow",function(){
                if($d.isAttached(modal)){$d.remove(modal)}
                modal=$d("<div>").css({position:"fixed",top:0,left:0,width:"100%",height:"100%",bgc:"#ccc",opacity:.6}).toFront()
                    .on("click",function(ev){
                        if(this.isVisible()){
                            this.hide()
                        } else{
                            $d.hide(modal)
                        }
                    }.bind(this))

                if(!this.config.animateShow){
                    //modal.appear({anchor:"c",from:{width:this.computed.width,height:this.computed.height},iter:20,end:function(){ } })
                }
            })
            vw.on("show",function(){
                this.el.toFront(true)
            })

            vw.on("hide",function(){
                if($d.isAttached(modal)){
                    //this.el.show();
                    modal.disAppear({anchor:"c",iter:20,end:function(){modal.remove();modal=null}})
                }
            })
        }
        vw.addLayout("frame")
        vw.addLayout("popup")
        vw.footerbar&&vw.footerbar.insertContent("<div class='ui-button-bar-center ui-button-bar'></div>")
        vw.setTitle=function(lbl){var d=this.el.q(".panel-title");d && d.html(lbl);return this}
        vw.on("beforelayout.dialog",function(){
            if(this.rect){
                /*var vp=$.viewport.get(),lo=this.rect
                if(lo.width&&lo.width>1){
                    lo.width=Math.min(vp.width *.98,lo.width)
                }
                if(lo.height&&lo.height>1){
                    if(Math.max(this.el.offsetHeight,lo.height)>vp.height *.98) {
                        lo.height = Math.min(vp.height * .98, Math.max(this.el.offsetHeight, lo.height))
                    }
                }*/
            }
            this.inspectLayouts(true)
        });
        vw.on("afterlayout.dialog",function(){
            var vp=$.viewport.get(),lo=this.computed,mod
            /*if(lo.width&&lo.width>10){
                var nu=Math.min(vp.width *.98,lo.width)
                if(nu&&Math.abs(nu-lo.width)>2){
                    lo.width=nu;mod=1
                }
            }
            if(lo.height&&lo.height>10){
                if(Math.max(this.el.offsetHeight,lo.height)>vp.height *.98) {

                    var nu=Math.min(vp.height *.98,Math.max(this.el.offsetHeight,lo.height))
                    if(nu&&Math.abs(nu-lo.height)>2){
                        lo.height=nu;mod=1
                    }
                }
            }*/
            if(this.footerbar){
                if(this.footerbar.el.q(".ui-button") && !$d.isVisible(this.footerbar.el)){
                    this.config.footerheight=this.footerbar.rect.height=this.footerbar.computed.height=this.footerbar.config.height = this.footerbar.el.height()
                     //lo.height= lo.height+ht
                }
            }
            if(mod){
                lo.applyCss(this.el)
            }
             this.setContentDims()  ;vw=this;var _onkd
            if(this.footerbar){

                if(this.footerbar.el.q(".ui-button") && (!$d.isVisible(this.footerbar.el) || (this.footerbar.el.bounds().bottom - 10) > this.el.bounds().bottom)){
                    this.contentWrap.css({height:this.contentWrap.height()- this.footerbar.el.height()})

                     //lo.height= lo.height+ht
                }
                this.footerbar.el.css("position","absolute")
            }
            if(vw.headerbar&&!this.el.q(".top-right-cancel")){
                vw.headerbar.el.insert("<div class='top-right-cancel'>x</div>") ;

                this.el.q(".top-right-cancel").toFront(true).pointerselect( function(e){
                    e.stopPropagation&&e.stopPropagation();
                    e.stopImmediatePropagation&&e.stopImmediatePropagation();
                    this.hide()
                }.bind(this))
                var el=this.el.q(".top-right-cancel")
                var title=el.up().down(".panel-title")
                if(title&&el.offsetLeft>100){
                    //title.css({w:el.offsetLeft})
                }

            }
            if(vw.headerbar&&vw.config.title){
                vw.headerbar.show()
                vw.headerbar.el.show()
            }

            if(modal){
                var z=Number(modal.css("zIndex"))+1

                z > 1 && this.el.css({zIndex:z})
            }
            else{this.el.toFront() ;}
        })
        return vw
    }
    View.plugins.resizable=(function(){
        var tmplate={ }
        tmplate.b=tmplate.t=tmplate.height=document.createElement("div"); tmplate.height.className="resizer resizer-height resizer-to"
        tmplate.r=tmplate.l=tmplate.width=document.createElement("div");tmplate.width.className="resizer resizer-width resizer-to"
        tmplate.br=document.createElement("div");tmplate.br.className="resizer resizer-br resizer-to"
        tmplate.bl=document.createElement("div");tmplate.bl.className="resizer resizer-bl resizer-to"
        tmplate.tl=document.createElement("div");tmplate.tl.className="resizer resizer-tl resizer-to"
        tmplate.tr=document.createElement("div");tmplate.tr.className="resizer resizer-tr resizer-to"
        function _setupEl(vw,nu,al){
            [].forEach.call(document.querySelectorAll(".dragger-ghost"),function(t){t.parentNode && t.parentNode.removeChild(t)});

            var dims=[],nuel=DomCore(nu),baseel=vw.el,_active=false,preserve=vw.config.preserveratio,pri="width",sec="height";
            if(vw.config.flexDimension){dims.push(vw.config.flexDimension)}
            if(vw.config.preserveratio){
                if(vw.config.primaryDimension!="width"){pri="height";sec="width"}

                if(typeof(vw.config.preserveratio)!="number"){vw.config.preserveratio=vw.rect[sec]/vw.rect[pri]}

            }
            var evs={move:"mousemove",down:"mousedown",up:"mouseup"}
            $d.on(nuel,evs.down,function(evt){if(_active){return}
                if(evt.which==3){return}

                var dragel=baseel.el.cloneNode(false),lastVals=null;dragel.className="resizer-ghost";
                dragel=baseel.el.parentNode.insertBefore(dragel  ,baseel.el.nextSibling)
                // dragel.onmousedown=function(){this.parentNode&&this.parentNode.removeChild(this)}
                _active=0
                document.body.classList.add("noselection")
                var frm=$d.util.animframe,qu=[],currvw=vw,targetvw=(currvw._parent&&(currvw._parent.hasLayout("border")||!currvw.isPositioned()))?currvw._parent:currvw,
                    startdims={pos:$d.util.mousePos(evt),height:baseel.offsetHeight,width:baseel.offsetWidth,top:baseel.offsetTop,left:baseel.offsetLeft},

                    mv=function(evt){  if(!dragel){return}
                        var st={} ;
                        var pos=$d.util.mousePos(evt),delta={x:pos.x-startdims.pos.x,y:pos.y-startdims.pos.y}
                        if(!dims.length || dims.indexOf("width")>=0){
                            st.width=(startdims.width+((al.indexOf("r")>=0?1:-1)*delta.x))
                            if(al.indexOf("l")>=0){st.left=(startdims.left+delta.x) }
                        }
                        if(!dims.length || dims.indexOf("height")>=0){
                            st.height=(startdims.height+((al.indexOf("b")>=0?1:-1)*delta.y))
                            if( al.indexOf("t")>=0){st.top=(startdims.top+delta.y) }
                        }

                        qu.push(st)
                        frm(function(){
                            var vv=qu.pop();
                            if(preserve&&vv[pri]){vv[sec]=vv[pri]*preserve}
                            if(vv&&dragel&&dragel.style){for(var k in vv){dragel.style[k]=vv[k]+"px"}}
                        });

                        lastVals=delta
                    },mup=function(){
                        _active=0;
                        document.removeEventListener(evs.move,mv)
                        document.removeEventListener(evs.up,mup)
                        setTimeout(function(){document.body.classList.remove("noselection")},10)
                        if(currvw.el){currvw.el.removeClass("fxtx_25")}
                        if((dragel&&lastVals&&(lastVals.x||lastVals.y))){
                            var r=currvw.getRect();

                            r.width=dragel.offsetWidth
                            r.height=dragel.offsetHeight
                            if(preserve){r[sec]=r[pri]*preserve}
                            if(!(currvw._parent&&currvw._parent.hasLayout("border"))){
                                var y=lastVals.y;

                                if(al.indexOf("t")>=0){  r.top=r.top+y }
                                var x=lastVals.x ;
                                if(al.indexOf("l")>=0){
                                    r.left=r.left+x
                                }
                            }

                            targetvw.components.forEach(function(it){
                                it.needsRedraw=true
                            })
                            targetvw.layout();
                            targetvw.fire("resize")

                        }
                        $d.st(".resizer-ghost").remove()
                        dragel=null;



                    }
                document.addEventListener(evs.move,mv)
                document.addEventListener(evs.up,mup)

            })
        }
        return {

            attach:function(vw,trigger){
                var loc=vw.config.location,nu,al=vw.getRect().getAlignment() ;

                if( vw.el){
                    if(!al && vw.isPositioned()&&vw.config.anchorPos){al=vw.config.anchorPos}
                    if(vw.config.flexDimension){al=vw.config.flexDimension=="width"?(loc=="right"?"l":"r"):(loc=="bottom"?"t":"b")}
                    if(al && al.length==2){
                        switch(vw.config.anchorPos){
                            case "tl":al="br";break;
                            case "tr":al="bl";break;
                            case "bl":al="tr";break;
                            case "br":al="tl";break;}
                        //if(al=="tl"){al=="br"}
                    }

                    if(!al && loc){al=loc.charAt(0);
                        if(loc=="top"||loc=="bottom"||loc=="row"){
                            if(loc=="bottom"){ al="t"; }
                            else { al="b"; }
                        }
                        else if(loc=="left"||loc=="right"||loc=="column"){
                            if(loc=="right"){  al="l"}
                            else { al="r"}
                        }
                    }

                    if(al&& $d.el(trigger)){nu=trigger}
                    else {if(!al&&vw.isPositioned()){
                        if(!vw.el.querySelector(".resizer")){
                            var n=vw.el.el.appendChild(tmplate["bl"].cloneNode(true))
                            n.className+="bl";_setupEl(vw,n,"bl")
                            var n1=vw.el.el.appendChild(tmplate["br"].cloneNode(true))
                            n1.className+="br"
                            _setupEl(vw,n1,"br")
                        }
                    } else if(al){
                        if(!trigger && al&&tmplate[al] &&!vw.el.querySelector(".resizer")){
                            nu=vw.el.el.appendChild(tmplate[al].cloneNode(true))
                            nu.className+=al
                        }
                    }

                    }


                }

                if(nu){ _setupEl(vw,nu,al) }
            }
        }

    })();

    var Button=Klass("View.Button", $.Component,{

        isClickable:function(){return true},
        insertGlyph:function insertGlyph(shape,cntnr){
            var  svgNS = "http://www.w3.org/2000/svg",s=document.createElementNS(svgNS,"svg"),
                p=s.appendChild(document.createElementNS(svgNS,"path"));
            p.setAttributeNS(null,"d","M5,5 l5,5 l5,-5 Z");
            s.style.height="20px";
            p.setAttributeNS(null,"fill","#ccc");
            if(cntnr){
                cntnr.appendChild(s)
            }
            return s
        },
        layout:function(){     var parconfig=this._parent.config
            var kls=["ui-button-bar-el","ui-button"].concat((parconfig.small||this.config.small)?"small":[],(parconfig.large||this.config.large)?"large":[]);
            var label=this.config.label||String(this.config.name||this.config.text||this.config.id||"button").replace(/^\w/,function(a){return a.toUpperCase()}).replace(/\[\-\s](\w)/,function(a,b){return b.toUpperCase()})
            var name=this.config.name||this.config.label||this.config.id||"button"

            var html="<button class='"+kls.join(" ")+"' data-key='"+name+"'>"+label+"</button>"

            if(this.config.sep||this.config.text=="|"||name=="|"){kls=[]
                html="<span  class='ui-button ui-button-bar-el ui-button-sep'>|</span>"
            }

            else if(this.config.ascombo){kls.push("ui-button-combo")
                html="<span  class='"+kls.join(" ")+"' data-key='"+name+"'><span class='button-text' style='line-height: 1.2;margin-right:10px;'>"+label+"</span><span class='combo-glyph' style='border-left:1px solid #999;width:16px;float:right;'></span></span>"
            }else if(this.config.text){kls=[]
                html="<span  class='ui-button-bar-el ui-button-text'>"+String(this.config.text).replace(/^\w/,function(a){return String(a).toUpperCase()})+"</span>"
            } else if(this.config.glyph){var v=typeof(this.config.glyph)=="number"?String.fromCharCode(this.config.glyph):this.config.glyph;
                html="<span  class='"+kls.join(" ")+"' data-key='"+name+"'><span class='glyph' style='display:inline-block; border-left:1px solid #999;width:16px;float:right;'>"+v+"</span><span class='button-text' style='line-height: 1.2;margin-right:10px;'>"+label+"</span></span>"
            }
            //ZModule.getEntity("$.S");
            this.el.html(html)
            this.el=$d(this.el.firstElementChild)
            var g=this.el.querySelector(".combo-glyph")
            if(g){  this.el.style.paddingRight="5px"
                $d.css(this.el.querySelector(".button-text"),{"float":"left",lineHeight: 1.2})
                this.insertGlyph("",g)
            }
            this.el.on("click",function(ev){
                if($d.hasClass(ev.target,"ui-button-sep")||$d.hasClass(ev.target,"disabled")){return}
                this.fire("select",ev)
            }.bind(this))
            //this.insertContent(html)
        }
    });
    var ToolBar=Klass("View.ToolBar",$.Component,{
            addTool:function(){},
            addLabel:function(){},
            layout:function(){

            }
        }
    );


    var ButtonBar=Klass("View.ButtonBar",$.Component,{
            addButton:function(config){config=config||{}
                if($.isArray(config)){
                    for(var i=0,l=config,ln=l.length;i<ln;i++){
                        this.addButton(l[i])
                    }
                    return this;
                }
                this.add(new Button(arguments))

                var nu=this.components.last()
                if(nu&&typeof(config)=="string"){nu.config.name=config}
                return nu;
            },
            addSep:function(optns){var nu=this.addButton.apply(this,arguments);nu.config.sep=true;return nu;},
            addLabel:function(optns){var nu=this.addButton.apply(this,arguments);
                if(typeof(optns)=="string"){nu.config.text=optns}
                return nu;
            },
            findLocation:function(){
                var cntnbar,bar=(this.el&&this.el.is(".ui-button-bar"))?this.el:null
                if(!bar){
                    bar=this._parent.el.q(".ui-button-bar")
                    if(!bar){
                        if(this._parent.hasLayout("framebar")){
                            cntnbar=this._parent
                        } else {
                            var loc = this._parent.config.barlocation || this._parent.config.location
                            if (loc == "footer" || loc == "header") {
                                loc += "bar"
                            }
                            cntnbar = (loc ? this._parent[loc] : null) || this._parent["headerbar"] || this._parent["footerbar"]
                        }
                        if(cntnbar){
                            if(!cntnbar.el.selfOrDown(".ui-button-bar")) {
                                cntnbar.insertContent("<div class='ui-button-bar ui-button-bar-center'></div>")
                            }
                        }
                        bar=cntnbar.el.selfOrDown(".ui-button-bar")
                    }

                }
                return bar
            },
            layout:function(){
                var cntnbar,bar=this.findLocation()
                if(bar){
                    this.el=$d(bar);
                    bar.addClass(['ui-button-bar','ui-button-bar-center'].concat((this.config.small)?"small":[],(this.config.large)?"large":[])
                    )
                    var compo=this;

                    this.components.each(function(c){
                        c.layout();
                        compo.el.append(c.el);
                    });
                }

            }
        }
    );
    var ButtonGroup=Klass("View.ButtonGroup",ButtonBar,{list:[],
            select:function(nm){

            },
            render:function(){
                if(this.list  ){
                    var gpid=this.id
                    return "<ul>"+(this.list.map(function(it,i){var d={gpid:gpid,id:gpid+"_"+i,value:it.id,label:it.label}
                            return '<li><input id="$id"  name="$gpid" type="radio" value="$value"/><label for="$id">$label</label></li>'.replace(/\$(\w+)/g,function(a,b){return d[b]||""})
                        }).join("")) + "</ul>"
                }
            },
            layout:function(){
                var bar=$d(this.findLocation());if(!bar){return  this}
                $d.addClass(bar,"ui-button-group")
                bar.html(this.render()||"")
                bar.st("input").on("change",function(evt){
                    this.fire("selected",{name:this.id,value:evt.target.value,newValue:evt.target.value,valueLabel:evt.target.nextElementSibling.textContent})
                }.bind(this))
                this._bar=bar
                return this
            }
        }
    );
    View.readDom=function(rootnode){
        function _getConfig(dom){
            var styles=null,klasses=[].slice.call(dom.classList||[]),lo=String(dom.dataset.layout || "").split(/\s+/)
            var toret={}
            if(dom.style){
                [].slice.call(dom.style).forEach(function(k){
                    if(k=="visibility"){return}
                    styles||(styles={});

                    styles[k]=dom.style[k]
                })
            }
            if(dom.attributes){
                [].slice.call(dom.attributes).forEach(function(k){
                    var nm=String(k.name);if(nm&&nm.indexOf("data-")==0){nm=nm.substr("data-".length).replace(/(\w)\-/g,function(a,b){return b.toUpperCase()})}
                    if(k.value&&nm&&isNaN(nm)&&nm!="style"&&nm!="class"&&nm!="layout"){
                        toret[nm]= k.value
                    }
                })
            }

            if(styles){toret.styles=styles}
            if(klasses.length){toret.klass=klasses}
            if(lo.length&&lo[0]){toret.layout=lo}
            return toret
        }
        function _makeview(dom,config){
            if(!(dom&&dom.dataset)){return }
            config=config||_getConfig(dom)
            if(!config.layout){
                return
            };
            var ch=[],els=[];
            [].slice.call(dom.childNodes).forEach(function (it) {
                if(it.tagName=="IMG"){}
                if (it.nodeType==1 && it.dataset && it.dataset.layout) {
                    var c=_getConfig(it)
                    if( c.layout&&(c.layout[0]=="header"|| c.layout[0]=="footer")){
                        var l=c.layout[0];delete c.layout
                        c.domcontent =String(it.innerHTML).trim()
                        config[l] =c
                    }
                    else {
                        ch.push([it,_makeview(it,c)])

                    }
                } else {
                    if(it.nodeType==1||(it.nodeType==3&&String(it.nodeValue||"").trim())) {
                        config.domcontent = it;

                    }
                }
                //pnl.contentWrap.el.appendChild(it);
            });
            if(ch.length){config.panels=ch.map(function(it){return it[1];})}

            /* var pnl=new View(config);
             ch.forEach(function(it){
             var nu = _makeview(it[0],it[1] );
             if (nu) {
             pnl.add(nu);
             }
             });*/

            return config
        }
        var rootpanel,rootdom=rootnode||document.querySelector("panel,view,[ispanel]")
        if(rootdom) {
            rootdom.normalize && rootdom.normalize();
            var torem=[];
            [].slice.call(rootdom.getElementsByTagName("*")).forEach(function(it){if(it.nodeType==3&&!String(it.nodeValue).trim()){torem.push(it)}});
            while(torem.length){
                var el=torem.pop();
                el&&el.parentNode&&el.parentNode.removeChild(el);
            }

            var cnfg = _makeview(rootdom)
            rootdom.style.visibility="hidden"
            if(cnfg){
                rootpanel=new View(cnfg)
            }
            rootdom.parentNode.removeChild(rootdom)
        }
        return rootpanel
    }
    View.IconBar=function(view,opts){
        if(!opts&& $.isPlain(view)){opts=view;view=null}
        var _bar=null,els={},_lastel=null,options= $.extend({floatable:false,controller:null,style:null,listener:null,template:null,basclass:"ui-button-gl"},opts||{})
        if(typeof(options.listener)!=="function"){options.listener=null}

        if(options.controller&&typeof(options.controller.invoke)!=="function"){options.controller=null}
        if(!options.controller&&view && view.getController ){
            options.controller=view.getController();
        }


        var api={
            getBar:function(){
                if(!_bar){
                    _bar=$d("<div/>").css({ w:"auto" ,overflow:"hidden",paddingBottom: "2px"})
                    _lastel=_bar.append('<span class="ui-button-gl ignore-link1 edge-handle"></span>')
                    if(options.style){_bar.css(options.style)}

                    _bar.on("mousedown",function(ev){
                        ev.stopPropagation&&ev.stopPropagation()
                        var memo={b:_bar.bounds()}
                        if(_bar.parent().el!=document.body||!_bar.data("_origparent")){
                            var bp=UI.Rect.from(memo.b.toMap(),true),bp2=_bar.parent().bounds() ;
                            bp.left=Math.min(bp2.left,bp.left-15)
                            bp.top=Math.min(bp2.top,bp.top-15)
                            bp.right=Math.max(bp2.right,bp.right+15)
                            bp.bottom=Math.max(bp2.bottom,bp.bottom+15)

                            _bar.data("_origparent",_bar.parent().id)
                            _bar.data("_origbounds", bp)
                            _bar.data("_orignext",( _bar.next()||{}).id)
                            _bar=_bar.appendTo(document.body)
                            _bar.addClass("layout-floating")
                            _bar.css({top:  memo.b.top,left:  memo.b.left,h:  memo.b.height,width: memo.b.width,position:"fixed"}).toFront(true)
                        }

                        $d.trackMouse({
                            target:_bar,
                            memo:memo ,
                            start:function(ev,memo){memo.point=UI.Point.from(true,memo.b.left,memo.b.top)  },
                            move:function(ev,memo){
                                memo.point.save().plus(ev.data.delta).applyCss(_bar.el).restore();
                            },end:function(ev,memo){memo.b.refresh()
                                var origpar=$d(_bar.data("_origparent"))
                                if(origpar && !_bar.parent().is(origpar)){
                                    var  bp=_bar.data("_origbounds")
                                    if(bp&&bp.contains(memo.b )) {
                                        var _orignext=$d(_bar.data("_orignext"))
                                        if(_orignext&&_orignext.parent().is(origpar)){_bar=_orignext.before(_bar)}
                                        else{_bar=origpar.append(_bar)}
                                        _bar.data("_origparent",null)
                                        if(!origpar.isAnimating()){origpar.highlight();}
                                        _bar.removeClass("layout-floating")
                                    } else{
                                        _bar.addClass("layout-floating")
                                    }

                                }
                            }

                        })
                    },".gl-icon-draghandle")
                    _bar.pointerselect(function(ev){
                        if(ev&&ev.target&&$d.is(ev.target,".ui-button-gl")){
                            var nm=ev.target.dataset.cmd
                            if(nm==="sep"||nm==="text"||ev.target.classList.contains("disabled") ||ev.target.classList.contains("ignore-link1")){return}
                            var el=els[nm];
                            if(el){
                                if(options.listener){
                                    options.listener(nm,ev)
                                }
                                if(options.controller){
                                    options.controller.invoke(nm,[ev])
                                }
                                if(el.callback){
                                    el.callback(ev)
                                }
                            }
                        }
                    })
                    if(options.floatable){
                        _lastel.addClass("gl-icon-draghandle")
                    } else{
                        _lastel.addClass("gl-icon-blank")
                    }
                }
                return _bar
            },
            getLink:function(nm){
                if(typeof(nm)=="string"){
                    return els[nm]
                } else if(typeof(nm)=="number"){
                    //
                }
            },
            addText:function(txt,pos){this.add("text",{text:txt,pos:pos});return this},
            addSep:function(txt){this.add("sep");return this},
            add:function(nm,detail,pos){

                if(Array.isArray(nm)){
                    nm.forEach(function(k){this.add(k)},this)
                    return this;
                }
                var data={}
                if($.isPlain(detail)){data=detail}
                else if(typeof(detail)=="function"){data.callback=detail}
                else if(typeof(detail)=="string"){data.text=detail}
                else if(typeof(detail)=="number"){data.pos=detail}
                if(typeof(pos)=="number"){data.pos=pos}
                if(nm.indexOf("text")==0){data.key=data.key||nm;nm="textwrap"}
                if(nm.indexOf("sep")==0&&nm!="sep"){data.key=data.key||nm;nm="sep"}
                data.key=data.key||nm

                if(nm!="sep" && nm!="textwrap" &&els[data.key]){return els[data.key]}
                if(data.pos=="top"){data.pos=0}
                var klas="gl-icon-"+nm
                if(!options.template){
                    var dom=$d("<span class='ui-button-gl'></span>")
                    options.template=dom.el.cloneNode(true)
                    dom.remove();
                }
                var bar=this.getBar()

                var nu
                if(nm=="text"){
                    nu=$d("<span/>")
                    if(data.text){
                        nu.text(data.text)
                    }
                }
                else {
                    nu = options.template.cloneNode(true)
                }
                nu.dataset.cmd = data.key
                var before=_lastel
                if(typeof(data.pos)=="number"){
                    if(data.pos==0){before=bar.down()}
                    else {
                        before=bar.down(data.pos)
                    }
                } else if(typeof(data.pos)=="string") {
                    if (els[data.pos]) {
                        before = els[data.pos].el
                    }
                }
                before=before||_lastel
                nu=before.before(nu)
                nu.addClass(klas)
                if(data.klass||data.className){
                    nu.addClass(data.klass||data.className)
                }
                var wdgt={el: nu, name: nm}
                if(nm!="sep" && nm!="textwrap") {
                    if (typeof(data.callback) == "function") {
                        wdgt.callback = data.callback
                    }
                    els[nm]=wdgt
                } else{
                    nu.addClass("disabled")
                }

                return wdgt

            },
            enable:function(nm){
                [].concat(nm||[]).forEach(
                    function(k){
                        if(els[k]){
                            els[k].el.removeClass("disabled")
                        }
                    }
                )
                return this;
            },
            disable:function(nm){
                [].concat(nm||[]).forEach(
                    function(k){
                        if(els[k]){
                            els[k].el.addClass("disabled")
                        }
                    }
                )
                return this;
            },
            setConfig:function(nm,val){
                options[nm]=val;
            },
            appendTo:function(dom){
                _bar=$d(dom).append(this.getBar())

                return this;
            }

        }
        return api;
    }

})();
