
;(function(){
function num(v){
    if(v==null){return 0}
    if(typeof(v)=="number"){return Number(v)}
    if(typeof(v)=="string"){
        return Number(v.replace(/[^\d\.\-]/g,""))||0;
    }
    return 0;
}

function _parseArgs(a){
    var r=[]
    for(var i= 0,ln= a.length,v;v=a[i],i<ln;i++){
        if(v && typeof(v)=="object"&&({}).toString.call(v).indexOf("Arguments")>=0){
            [].push.apply(r,_parseArgs(v))
        }else{
            r.push(v)
        }
    }
    var ln=r.length
    while(ln>0){
        if(typeof(r[ln-1])=="undefined"){
            r.pop()
            ln=r.length
        } else{break;}
    }
    return r


}
function  _parse( ) {

    var args=_parseArgs(arguments),p={left:0,top:0,bottom:0,right:0};
    if(args.length==2&& typeof(args[1])=="object"){p=args.pop();}

    if(args.length==1 && typeof(args[0])=="object"){
        var frst= args[0] ||{},el=frst.nodeType?frst:frst.el
        if(frst.__bounds__){return frst}
        if(el&&el.getBoundingClientRect) {
            frst= el.getBoundingClientRect();
        }else if(frst.type && String(frst.type).indexOf("mouse")>=0){
            var d=document,de=d.documentElement ,dbd=d.body;
            var e=args[0];frst={};
            frst.left=(e.pageX!=null) ? e.pageX : e.clientX + (de.scrollLeft ? de.scrollLeft : dbd.scrollLeft);
            frst.top = (e.pageY!=null) ? e.pageY : e.clientY + (de.scrollTop ? de.scrollTop : dbd.scrollTop);
            //if(e.target){frst.height=num(e.target.offsetHeight);frst.width=num(e.target.offsetWidth)}
        }else if(frst.target&&frst.target.getBoundingClientRect){
            frst= frst.target.getBoundingClientRect();
        }
        if(frst.length){//TRBL
            frst[0]!=null && (p.top=  num(frst[0]));
            frst[1]!=null && (p.right=  num(frst[1]));
            frst[2]!=null && (p.bottom=  num(frst[2]));
            frst[3]!=null && (p.left=  num(frst[3]))
        } else {
            var left=  frst.x||frst.left ,
                top=  frst.y||frst.top ;
            frst.left!=null &&(p.left=   num(left));
            frst.top!=null &&(top>=0.1||top<=-0.1 ) &&(p.top=    num(top) );
            frst.height!=null &&(frst.height>=0.1) &&(p.height=   num(frst.height)) ;
            frst.width !=null&&(frst.width>=0.1 ) &&(p.width=   num(frst.width));
            frst.right !=null&&(frst.right>0.1||frst.right<=-0.1   ) &&(p.right=   num(frst.right));
            frst.bottom !=null&& (frst.bottom>=0.1||frst.bottom<=-0.1 ) &&(p.bottom=   num(frst.bottom));
        }
    } else{
        p.y= p.top =  num(args.shift());
        p.right =  num(args.shift());
        p.bottom =  num(args.shift());
        p.x=p.left =  num(args.shift());
    }
    p.__bounds__=1;
    return p;
}

function getDim(ctx,prop){

}
function resolver(ctx,prop,fn,val){
    if(fn=="val" || fn=="px"){return num(val)}
    if(!ctx.delegate){return 0}
    if(fn=="perc"){
        var par=$d.parent(ctx.delegate)
        if(par){
            var u=prop.charAt(0).toUpperCase()+prop.substr(1)
            if(par["offset"+u]!=null){
                return par["offset"+u]*val
            }
            return num(par.css(prop))*val
        }
        return 0
    }


    if(prop=="attr"){
        return  ctx.delegate?num($d.prop(ctx.delegate,prop)):0;
    }
    val=num(val)
    if(fn=="vh"){ return $.viewport.height*val}
    if(fn=="vw"){ return $.viewport.width*val}
    if(fn=="vmax"){ return Math.max($.viewport.height,$.viewport.width)*val}
    if(fn=="vmin"){ return Math.min($.viewport.height,$.viewport.width)*val}
     var worker=ctx.statics.domworker
    if(!worker){
        worker=document.body.appendChild(document.createElement("div"))
        worker.style.position="fixed" ;
        worker.style.height="1px"; worker.style.width="1px"
        worker.style.overflow="hidden"
        ctx.statics.domworker=worker
    }
    //worker.style.display=""
    $d.css(worker,prop,val+fn);
    var ret= num($d.css(worker,prop));
    worker.style.height="1px"; worker.style.width="1px";
    return ret
 }
var exprhandle=function(a,nm){
    if(/([\-\+\*\/])/.test(a)){return a};
    if(/^([\d\.]+)(rem|rm|px|\%|in|vh|vw|vmax|vmin)?$/.test(a)){
        return a.replace(/^([\d\.]+)(rem|rm|px|\%|in|vh|vw|vmax|vmin)?$/,function(a,b,c){c=c||"val";return "_(this,'"+nm +"','"+(c=="%"?"perc":c)+"',"+b+")"})
    }
    return "_('attr','"+a+"')"
}
function parseExpr(nm,expr){
    expr=expr.trim().replace(/^calc\s*\(|\)$/g,"").trim()
    return Function("_"," return "+expr.replace(/([\-\+\*\/])/g," $1 ").split(/\s+/).map(function(val){return exprhandle(val,nm)}).join(" "))
}
var Gproto={
    addCalc:function(nm,fn){
        this.__exprs ||(this.__exprs={});
        if(typeof(fn)=="string"){
            fn=parseExpr(nm,fn)
        }
        if(typeof(fn)!="function"){return}
        this.__exprs[nm]=fn;
    },
    getAt:function(nm,raw,noexpr){if(!this.__instance){return}
        var val=this.get(nm)
        if(!noexpr && this.__exprs && this.__exprs[nm]){
            val=this.__exprs[nm].call(this,resolver)
            this.set(nm,val);
        }
        else {
            val=this.get(nm)
        }
        if(val==null && !raw){
            val=this.computeVal(nm )
        }
        return val;
    },
    applyConstrains:function(){
        if(this.__constrains){
            $.each(this.__constrains,function(v,k){
                var curr=this.get(k)
                if(!curr ){return}
                var nu=this.preprocess(k,curr,curr)
                if(nu && nu!==curr){
                    this.set(k,nu )
                }
            },this)
        }
    },
    setConstrain:function(nm,fn){
        if(fn==null){
            if($.isPlain(nm)){
                $.each(nm,function(v,k){this.setConstrain(k,v)},this)
            }
            return this
        }
        this.__constrains||(this.__constrains={});
        if(typeof(fn)=="object" && this.__constrains[nm] && typeof(this.__constrains[nm])=="object"){$.extend(this.__constrains[nm],fn)}
        else{
            this.__constrains[nm]=fn
        }
        return this
    },
    preprocess:function(nm,val,curr){
        if(!this.__instance){return}
         if(val==null){
            if(curr==null){return val}
        }
        else {val=num(val)}
        var preprocessers =this.statics.preprocessers
        if(preprocessers !=null && preprocessers[nm]){
            val=preprocessers[nm](val)
        }
        if(val==null){return val}
        if(this.__constrains && this.__constrains[nm]){
            var c=this.__constrains[nm]
            if(typeof(c)=="number") {//min
                val=Math.max(c,val)
            } else if(typeof(c)=="function"){
                val=c.call(this,val)
            } else if(c.max && typeof(c.max)=="number"){
                val=Math.min(c.max,val)
            } else if(c.min && typeof(c.min)=="number"){
                val=Math.max(c.min,val)
            }
        }
        if(val==null || typeof(val)!="number"){return}
        return val
    },
    setAt:function(nm,val){if(!this.__instance){return}
         return this.set(nm,val)

    },
    relativeTo:function(){
        var b=_parse.apply(this,arguments)
        if(b) {
            if(b.top){this.setAt("top",this.get("top") - b.top)}
            if(b.left){this.setAt("left",this.get("left") - b.left)}
        }
        return this
    } ,
    uuid:function(){
        var vals=[]
        for(var i= 0,l=this.statics.dims,ln= l.length;i<ln;i++){
            vals.push(this.get(l[i])||"!");
        }
        if(this.__constrains){vals.push(JSON.stringify(this.__constrains).replace(/"/g,""))}
        return vals.join(" ")
    },
    minus:function(a,b){
        return this.plus.apply([].slice.call(arguments).concat([true]))
    },
    add:function(v){
        var mutate=true,reverse=false,args=[].slice.call(arguments)
        if(args.length>1 && args[args.length-1]===true){reverse=args.pop()}

        if(typeof(v)==="boolean"){mutate=v;v=args[1]}
        if(typeof(v)=="number"){v={top:v,left:v}}
        if(!(v && typeof(v)=="object")){return this}
        var o=this
        for(var i= 0,l=this.statics.dims,ln=l.length;i<ln;i++){
            var k=l[i];
            if(k in v){
                o.setAt(this.get(k,true)+(num(v[k])*(reverse?-1:1)))
            }
        }
        return o
    },
    update:function(){
        var p=_parse(arguments),k;
        if(!p){return this}
        for(var i= 0,l=this.statics.dims,ln= l.length;i<ln;i++){
            k=l[i];
            if(p[k]==null){continue}
            this.setAt(k,p[k]);
        }
        return this
    } ,
    toMap:function(nocomputed,nonull,nocopy){
        var ret={},inner=this._ensureInner?this._ensureInner():null
        if(this.__savedMap && this.__lastmodcount!=null && this.__lastmodcount===inner.modcount){
            ret= nocopy?this.__savedMap:Object.assign({},this.__savedMap )
        }
        if(inner ){
            ret= (nocopy?inner.data:Object.assign({},inner.data))||{}

        } else{
            for(var i= 0,l=this.statics.dims,ln= l.length;i<ln;i++){
                var v=this.getAt(l[i], nocomputed,true);
                if(!(v==null && nonull)){
                    ret[l[i]]=v
                }
            }
            nonull=false;
        }

        this.__lastmodcount=inner.modcount;
        this.__savedMap=ret;
        return ret;
    },
    computeVal:function(nm ){if(!this.__instance){return}
        var map=this.toMap(true),val;
        if(nm=="height" ){
            val= Math.max((map.bottom||0)-(map.top||0),0)
        } else if(nm=="width"){
            val= Math.max((map.right||0)-(map.left||0),0)
        } else if(nm=="right"){
            val= (map.width||0)-(map.left||0)
        } else if(nm=="bottom"){
            val= (map.height||0)-(map.top||0)
        }

        return val;
    },
    reset:function(data){
        for(var i= 0,l=this.statics.dims,ln=l.length;i<ln;i++){
            if(this.getAt(l[i],true)){this.setAt(l[i],0,true)}
        }
        if(data){this.update(data)}
    },
    getCss:function(el,align){
        var css={}
        for(var i= 0,l=this.statics.dims,ln=l.length;i<ln;i++){
            var v=this.get(l[i])
            if(v!=null){
                css[l[i]]=v
            }
        }
        if(align=="br"){
            delete css.top
            delete css.left
        }
        else if(align=="b"){
            delete css.top
        }
        if(align=="r"){
            delete css.left
        }
        if(align==null || align=="tl"){
            delete css.bottom
            delete css.right
        }

        return css
    },
    overlaps:function(rect){
        return (rect.top<this.bottom && rect.bottom>this.top && rect.left<this.right && rect.right>this.left)
    },
    applyCss:function(el){
        var css=this.getCss(el)
        $d.css(el,css);
    }
}
Gproto.plus=Gproto.add
$.G=$.createClass(function(){this.__instance=true
    this.update.apply(this,arguments);
    //if(arguments[0] )
},Gproto,$.observable,{
    dims:"top left bottom right height width".split(/\s+/),
    preprocessers:{height:function(a){
        return Math.max(0,Number(a)||0)},
        width:function(a){return Math.max(0,Number(a)||0)}
    }
 });
Object.defineProperties($.G.prototype,{
    "top":{get:function(){return this.getAt("top",true);},set:function(v){return this.setAt("top",v);},enumerable:true},
    "y":{get:function(){return this.getAt("top",true);},set:function(v){return this.setAt("top",v);},enumerable:true},
    "right":{get:function(){return this.getAt("right",true);},set:function(v){return this.setAt("right",v);},enumerable:true},
    "bottom":{get:function(){return this.getAt("bottom",true);},set:function(v){return this.setAt("bottom",v);},enumerable:true},
    "left":{get:function(){return this.getAt("left",true);},set:function(v){return this.setAt("left",v);},enumerable:true},
    "x":{get:function(){return this.getAt("left",true);},set:function(v){return this.setAt("left",v);},enumerable:true},
    "height":{get:function(){return this.getAt("height",true);},set:function(v){return this.setAt("height",v);},enumerable:true},
    "width":{get:function(){return this.getAt("width",true);},set:function(v){return this.setAt("width",v);},enumerable:true}
});
})();
!function geometry(ns,factory){
    self[ns]||(self[ns]={});
     self.UI||(self.UI={});
    factory(self,self[ns],$);
    if(typeof(ZModule)!="undefined"){ZModule.getWrapper(ns).resolve(null)}
 }("geometry", function(scope,context,$){
    var LOCS=["top","right","bottom","left"]
    function num(v){
        if(isNaN(v)){
            v= /^\d/.test(String(v))?v.replace(/[^\d\.]/g,""):"0";
        }
        return Number(v)||0;
    }
    scope.num=num;
    function  _bounds( ) {

        var args=[].slice.call(arguments),p={left:0,top:0,bottom:0,right:0};
        if(args.length==2&& typeof(args[1])=="object"){p=args.pop();}

        if(args.length==1 && typeof(args[0])=="object"){
            var frst= args[0] ||{},el=frst.nodeType?frst:frst.el
            if(frst.__bounds__){return frst}
            if(el&&el.getBoundingClientRect) {
                frst= el.getBoundingClientRect();
            }else if(String(frst.type).indexOf("mouse")>=0){
                var d=document,de=d.documentElement ,dbd=d.body;
                var e=args[0];frst={};
                frst.left=(e.pageX!=null) ? e.pageX : e.clientX + (de.scrollLeft ? de.scrollLeft : dbd.scrollLeft);
                frst.top= (e.pageY!=null) ? e.pageY : e.clientY + (de.scrollTop ? de.scrollTop : dbd.scrollTop);
                //if(e.target){frst.height=num(e.target.offsetHeight);frst.width=num(e.target.offsetWidth)}
            }else if(frst.target&&frst.target.getBoundingClientRect){
                frst= frst.target.getBoundingClientRect();
            }
            if(frst.length){//TRBL
                p.top=  num(frst[1]);p.right=  num(frst[1]);p.bottom=  num(frst[2]);p.left=  num(frst[3])
            } else {

                var left=  num(frst.x||frst.left)||0,top=  num(frst.y||frst.top)||0;
                (left>=0.1||left<=-0.1)                 &&(p.left=   left);
                (top>=0.1||top<=-0.1 )                  &&(p.top=    top );
                (frst.height>=0.1)                      &&(p.height=   num(frst.height)) ;
                (frst.width>=0.1 )                      &&(p.width=   num(frst.width));
                (frst.right>0.1||frst.right<=-0.1   )   &&(p.right=   num(frst.right));
                (frst.bottom>=0.1||frst.bottom<=-0.1 )  &&(p.bottom=   num(frst.bottom));

            }
        } else{
            p.y= p.top=  num(args.shift());
            p.right=  num(args.shift());
            p.bottom=  num(args.shift());
            p.x=p.left=  num(args.shift());
        }
        p.__bounds__=1;
        return p;
    }
    function  mousePos(e,p) {p=p||{};
        if (!e) var e = window.event;
        if (e.pageX || e.pageY) 	{
            p.x = e.pageX;
            p.y = e.pageY;
        }
        else if (e.clientX || e.clientY) 	{
            p.x = e.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
            p.y = e.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
        }
        return p
    }
    function _parseArgs(a){
        var r=[]
        for(var i= 0,ln= a.length,v;v=a[i],i<ln;i++){
            if(v && typeof(v)=="object"&&({}).toString.call(v).indexOf("Arguments")>=0){
                [].push.apply(r,_parseArgs(v))
            }else{
                r.push(v)
            }
        }
        var ln=r.length
        while(ln>0){
            if(typeof(r[ln-1])=="undefined"){
                r.pop()
                ln=r.length
            } else{break;}
        }
        return r


    }
    function  XY(e,p) {p=p||{};
        if(e && e.__xy__){return e}
        if(!e){return p}
        return _bounds(e,p);

    }
    function _cleanObj(){return Object.create(null);}
    function _addFields(proto,list){
        proto.__props=[].slice.call(list)
        proto.__unit={}
        for(var i= 0,l=list,ln= l.length;i<ln;i++){
            var nm=l[i],nm1=l[i].charAt(0).toUpperCase()+l[i].substr(1);
            var accessors={get:Function("return this.getAt('"+nm+"')"),set:Function("v","return this.setAt('"+nm+"',v)")}
            $.defineProperty(proto,nm,{get:accessors.get,set:accessors.set,enumerable:true});
            proto["set"+nm1]=accessors.set
            proto["add"+nm1]=Function("v","var k='"+nm+"';return this.set"+nm1+"(this.get"+nm1+"()+this.toNum(v))")
            proto["get"+nm1]=accessors.get
        };
        proto._init=function(){
            (function($this){
                var _innervals=_cleanObj(),props=$this.__props;$this.hooks||($this.hooks={});
                for(var i= 0;i<props.length;i++){_innervals[props[i]]=0}
                $this.clear=function(){
                    for(var i= 0;i<props.length;i++){_innervals[props[i]]=0}
                }
                $this.getAt=function(loc,ignorehooks){
                    var h=(ignorehooks===true)?null:this.hooks;
                    return (h&&loc in h&&h[loc].get)?h[loc].get.call(this,_innervals[loc]):_innervals[loc]
                }
                $this.setAt=function(loc,v,ignorehooks){
                    if((loc=="left" && this.rightAligned) || (loc=="top" && this.bottomAligned)){ return}

                    if(typeof(v)=="string"){
                        if(/^[^\d\.]/.test(v)){
                            if(/^([+*%\/]|(- ))/.test(v)){v=$this.getAt(loc,false)+" "+ v}
                            try{v=eval(v);} catch(e){$.handleEx("error eval:"+v+" "+e)}
                        } else if(/[\D]+$/.test(v)){var u;
                            v=Number(v.replace(/[\D]+$/,function(a){u=a;return ""}))||0;
                            u && ($this.__unit[loc]=u);
                        }
                    }
                    var val=num(v),j= 1,h=(ignorehooks===true)?null:this.hooks,old=_innervals[loc];
                    if(val && this._valOffsets && this._valOffsets[loc]){val-=this._valOffsets[loc]}
                    if(!val||old==val){ return}

                    if(h&&loc in h&&h[loc].set){
                        h[loc].set.call(this,val,_innervals[loc])
                    } else{
                        _innervals[loc]= val
                    }

                    //  if(!(ignorehooks===true)&&this.hooks[loc]&&this.hooks[loc].set){this.hooks[loc].set.call(this,val,_innervals[loc]);j=1}
                    //  else{(loc in _innervals)&&(_innervals[loc]= val);j=1; }
                    if(this._listeners&&!this._paused){
                        this.dispatch(loc,val,old)
                    }
                    return this;}
            })(this);
        }
        proto.setValOffsets=function(vals){this._valOffsets||(this._valOffsets=Object.create(null));Object.keys(vals).forEach(function(k){this._valOffsets[k]=Number(vals[k])||0},this)}
        proto.getValOffsets=function(){return this._valOffsets }
        proto.toJSON=function(){return JSON.stringify(this.toObject())  }
        proto.toString=function(){var nm=this.constructor?this.constructor.name:"Props",
            obj={};obj[nm]=this.toObject();
            return JSON.stringify(obj)
        }
        proto.toNum=function(v){ if(isNaN(v)){
            v= /^\d/.test(String(v))?v.replace(/[^\d\.]/g,""):"0";
        }
            return Number(v)||0;
        }
        proto.toMap=proto.toObject=function(ignorehooks){ var ret={},l=this.__props;ignorehooks=!!ignorehooks
            for(var i= 0,ln= l.length;i<ln;i++){ret[l[i]]=this.getAt(l[i],ignorehooks)}
            return ret;
        }
        proto.hasUnit=function(k){ return this.__unit[k]!=null},
            proto.isPerc=function(k){ return this.__unit[k]=="%"},
            proto.getWithUnit=function(k0,par){var k=String(k0).toLowerCase()
                if(this.isPerc(k)&&par&&!isNaN(par[k])) {
                    return par[k]*(this.getAt(k,true)/100)
                }
                return this.getAt(k,true)+(this.hasUnit(k)?this.__unit[k]:0);
            }
        proto.clone=function(){
            var ret={},l=this.__props,data=this.toObject(true),al=this.getAlignment?this.getAlignment():null;

            var nu=new this.constructor(),a2
            if(al){nu.setAlignment(al)      ;a2=al.toLowerCase();
                if(a2.indexOf("r")>=0){delete data.left}
            }
            nu.update(data);
            if(al){  if(nu.right!=data.right){nu.right=data.right}
            }
            return nu;
        }
        proto.minus=function(a,b){
             return this.plus.apply([].slice.call(arguments).concat([true]))
        }
        proto.add=proto.plus=function(v){
            var mutate=true,reverse=false,args=[].slice.call(arguments)
            if(args.length>1 && args[args.length-1]===true){reverse=args.pop()}
            if(typeof(v)==="boolean"){mutate=v;v=args[1]}
            if(typeof(v)=="number"){v={top:v,left:v}}
            var o=mutate?this:this.clone()
            for(var i= 0,l=o.__props,ln=l.length;i<ln;i++){var k=l[i];if(k in v){o.setAt(this.getAt(k,true)+(num(v[k])*(reverse?-1:1)))}}
            return o
        }
        proto.div=function(v){var mutate=true
            if(typeof(v)==="boolean"){mutate=v;v=arguments[1]}
            if(typeof(v)=="number"){v={top:v,left:v}}
            var o=mutate?this:this.clone()
            for(var i= 0,l=o.__props,ln=l.length;i<ln;i++){var k=l[i];if(k in v && v[k]){o.setAt(this.getAt(k,true)/num(v[k]))}}
            return o
        }
        proto.mul=function(v){var mutate=true
            if(typeof(v)==="boolean"){mutate=v;v=arguments[1]}
            if(typeof(v)=="number"){v={top:v,left:v}}
            var o=mutate?this:this.clone()
            for(var i= 0,l=o.__props,ln=l.length;i<ln;i++){var k=l[i];if(k in v){o.setAt(this.getAt(k,true)*num(v[k]))}}
            return o
        }
        proto.relativeTo=function(rect ){var b=_bounds.apply(this,arguments)
            if(b) {
                if(b.top){this.addTop(0- b.top)}
                if(b.left){this.addLeft(0- b.left)}
            }
            return this
        }
        proto.hash=function(){return this.toJSON().replace(/["'\}\{\[\]\s]/g,"")}
        proto.equals=function(o){
            var ctor=this.constructor
            var other=new ctor(o)
            return other.hash()==this.hash()
        }
        proto.reset=function(data){
            "_listeners" in this && (this._listeners.length=0);
            for(var i= 0,l=this.__props,ln=l.length;i<ln;i++){if(this.getAt(l[i],true)){this.setAt(l[i],0,true)}}
            if(data){this.update(data)}
        },
            proto.empty=function(){
                "_listeners" in this && (this._listeners.length=0);
                this.element&&(this.element=null);
                this._paused=!0;
                for(var i= 0,l=this.__props,ln=l.length;i<ln;i++){if(this.getAt(l[i],true)){this.setAt(l[i],0,true)}}
                "insets" in this && (this.insets.destroy());
                "outsets" in this && (this.outsets.destroy());
                this._paused=!1;
            }
        /*proto.reset=function(data,keeplisteners){
            this.clear();
            !keeplisteners&& ("_listeners" in this) && (this._listeners.length=0);
            if(data){this.update(data)}
            return this
        },
            proto.empty=function(){
                for(var i= 0,l=this.__props,ln=l.length;i<ln;i++){if(this.getAt(l[i],true)){return false}}
                return true
            }
        proto.clear=function(){
            this._paused=!1;
            for(var i= 0,l=this.__props,ln=l.length;i<ln;i++){if(this.getAt(l[i],true)){return false}}
            "insets" in this && (this.insets.destroy());
            "outsets" in this && (this.outsets.destroy());
            this._paused=!0;
            return this
        }*/
        proto.destroy=function(){
            this.empty();
            (this.constructor.__cache||(this.constructor.__cache=[])).push(this);

        }
        //ret.width=this.getWidth();ret.height=this.getHeight();
        proto.update=function(){
            var args=[].slice.call(arguments),l=this.__props;;
            if(args.length>1){
                for(var i= 0,ln= l.length;i<ln;i++){
                    if(args[i]>0) this.setAt(l[i],args[i]||0)}
            } else if(args.length==1){
                if((Number(args[0])>0 || typeof(args[0])=="number")&&(args[0] instanceof Offset)){
                    var v=Number(args[0])
                    for(var i= 0,ln= l.length;i<ln;i++){
                        if(l[i]>0)this.setAt(l[i],v)
                    }
                }  else{
                    var b=_bounds(args[0])   ;
                    for(var i= 0,ln= l.length;i<ln;i++){
                        if(l[i] in b){num(b[l[i]]) && this.setAt(l[i],num(b[l[i]])||0)}
                    }
                }
            }
            return this
        }
        proto.on=function(fn,dim0){var dim=dim0?String(dim0).split(/[\s,]+/).map(function(it){return it.trim()}):[]
            if(typeof(fn)!="function"){return}
            if(!this._listeners){this._listeners=[]} ;

            this._listeners.push(function(f,dim,d,val,old){
                if(!dim.length || dim.indexOf(d)>=0 ){f.call(this,d,val,old)
                }
            }.bind(this,fn,dim))
            return this;
        }
        proto.fire=proto.dispatch=function(k,v,old){
            !this._paused&&this._listeners && this._listeners.length && this._listeners.forEach(
                function(it){  it(k,v,old)  },this)
            return this;
        }
    }
    function Point(){    if(!(this instanceof Point)){return new Point(arguments[0],arguments[1],arguments[2])}
        var d=Point.parse.apply(null,arguments)
        Object.defineProperties(this,{
            id:{value:String(d.id),writable:!!d.mutable,enumerable:true,configurable:false},
            x:{value:num(d.x),writable:!!d.mutable,enumerable:true,configurable:false},
            y:{value:num(d.y),writable: !!d.mutable,enumerable:true,configurable:false}
        });
    }
    Point.parse=function(){
        var ln=arguments.length,x=arguments[0],y=arguments[1],id=arguments[2]
        var mutable=false
        if(x===true){mutable=true;x=y;y=id;id=arguments[3]}
        if( x&&typeof(x)=="object"){
            var o=x;
            if(typeof(y)=="string"){id=y}
            if(o.type ){
                var p=mousePos(o);x= p.x;y= p.y;
            } else if(o.nodeType){
                var b=o.getBoundingClientRect?o.getBoundingClientRect():{top:o.offsetTop,left:o.offsetLeft}
                x= b.left;y=b.top
            }else {x= typeof(o.x)=="number"? o.x:num(o.left|| o.width);y=typeof(o.y)=="number"? o.y:num(o.top|| o.height)}
        }
        return {mutable:mutable,x:x,y:y,id:id}
    }
    Point.prototype||(Point.prototype={});
    Object.defineProperties(Point.prototype,
        {"p":{
            get:function(){return Math.sqrt(this.x*this.x + this.y*this.y)},
            set:function(){},
            enumerable:true
        }
        })

    Point.prototype.within=function(o){if(!o){return}
        var r= Rect.from(o);if(!r){return}
        return (r.top<=this.y&& r.bottom>=this.y&&r.left<=this.x&& r.right>=this.x)
    }
    Point.prototype.add=Point.prototype.plus=function( ){ var d=Point.parse.apply(null,arguments) ;
        if(d.x!=null){this.x+= d.x}
        if(d.y!=null){this.y+= d.y}
        return this;
    }
    Point.prototype.restore=function( ){
        if(this._saved){this.x=this._saved[0];this.y=this._saved[1];this._saved=null}
        return this;
    }
    Point.prototype.save=function( ){ this._saved=[this.x,this.y]
        return this;
    }
    Point.prototype.minus=function( ){ var d=Point.parse.apply(null,arguments) ;
        if(d.x!=null){this.x-= d.x}
        if(d.y!=null){this.y-= d.y}
        return this;
    }
    Point.prototype.update=function( ){ var d=Point.parse.apply(null,arguments) ;
        if(d.x!=null){this.x= d.x}
        if(d.y!=null){this.y= d.y}
        return this;
    }
    Point.prototype.applyCss=function(el) {
        if (el && el.style) {
            el.style.top = this.y + "px";
            el.style.left = this.x + "px"
        }
        return this;
    }
    Point.prototype.closest=function(o){
        var p=this.p;
        return [].concat(o).map(function(it){return  new  Point(it);}).sort(function(a,b){var dif=Math.abs(a.p-p)- Math.abs(b.p-p);return !dif?0:dif>0?1:-1})
    }

    Point.prototype.equals=function(o){
        var r=new  Point(o);
        return (r.x==this.x&& r.y==this.y)
    }
    Point.prototype.constructor=Point
    Point.from=function(a,c,d,e){
        if(a && typeof(a)=="object"&&a instanceof Point){return a}
        return new Point(a,c,d,e)
    }

    function Offset(init0){   if(!(this instanceof Offset)){return new Offset(init0)}
        this._init();
        this.update(init0); this.constructor=Offset
    }
    Offset.prototype={ }
    _addFields(Offset.prototype,LOCS.slice());
    Offset.prototype.constructor=Offset;

    function SimpleRect(init0){   if(!(this instanceof SimpleRect)){return new SimpleRect(init0)}
        this._init();
        this.update(init0); this.constructor=SimpleRect
    }
    SimpleRect.prototype={ }
    _addFields(SimpleRect.prototype,["top","left","height","width"]);
    SimpleRect.prototype.constructor=SimpleRect;
    function Rect(){
        if(!(this instanceof Rect)){return new Rect(arguments)}
        var alignment="",a=_parseArgs(arguments)
        if(typeof(a[a.length-1])=="string"){alignment= a.pop()}
        this._init();
        this.constructor=Rect
        this._alignment="";

        if(alignment){
            if(String(alignment).length<=2){
                this.bottomAligned=/b/i.test(String(alignment))
                this.rightAligned=/r/i.test(String(alignment))
            } else {
                this.bottomAligned = /bottom/i.test(String(alignment))
                this.rightAligned = /right/i.test(String(alignment))
            }
        }
        this.insets=this.padding=new Offset();
        this.outsets=this.margins=new Offset();

        this._paused=true
        var init=null
        if(a.length==1){
            init= a.shift()
        }
        if(a.length && a.every(function(a){return typeof(a)=="number"})){
            var b={},ln= a.length;
            ["top","right","bottom","left"].forEach(function(it,i){b[it]=i<ln?Number(a[i]):0});
            //if(b.bottom &&  b.top){b.height= b.bottom- b.top;delete b.bottom}
            //if(b.right &&  b.left){b.width= b.right- b.left;delete b.right}
            init=b;
        }
        if(init && init.nodeType){this.element=init}
        else if(init ){
           // if(this.bottomAligned){delete init.top} else {delete init.bottom}
            //if(this.rightAligned){delete init.left} else {delete init.right}
        }
        this.update(init);
        this._paused=false
    }
     Rect.prototype={  element:null,
        hooks:{bottom:{get:function(val){return val?val:(this.getAt("top",true)+this.getAt("height",true))}},
            right:{get:function(val){  return val?val:(this.getAt("left",true)+this.getAt("width",true))}},
            width:{  get:function(val){return val?val:this.getAt("right",true)-this.getAt("left",true)}},
            height:{  get:function(val){return val?val:this.getAt("bottom",true)-this.getAt("top",true)} }
        },
        addWidth :function(val){return this.setAt("width",this.getWidth()+num(val))},
        addHeight:function(val){return this.setAt("height",this.getHeight()+num(val));},
        getBounds:function( ){  return this.toObject(); },
        update:function(){
            var l=this.__props,b=_bounds.apply(this,arguments)  , r,b ;
            for(var i= 0,ln= l.length;i<ln;i++){ var v,nm=l[i];
                if(nm in b && (v=num(b[v]))){
                    if(!v){continue}
                    if(nm=="right"){r=v;}
                    else if(nm=="bottom"){b=v;}
                    else{this.setAt(nm,v)}
                }
            }
            if(r>1&&!this.getAt("left",true)){this.right=r}
            if(b>1&&!this.getAt("top",true)){this.bottom=b}
        },
      relativeTo:function(rect,offsets,nomutate ){
          if(typeof(offsets)=="boolean"){nomutate=offsets;offsets=[0,0]}
          if(typeof(offsets)=="number"){offsets=[offsets,offsets]}
          if(!Arrat.isArray(offsets)){offsets=[0,0]}
          var cont=Rect.from(rect),bounds=nomutate?this:this.clone()
          offsets[1]=offsets[1]||0
          offsets[0]=offsets[0]||0
          bounds.top=Math.max(offsets[1],bounds.top-cont.top)
          bounds.left=Math.max(offsets[0],bounds.left-cont.left)
          bounds.bottom = Math.min(cont.height-offsets[1],bounds.top + bounds.height)
          bounds.right = Math.min(cont.width-offsets[0],bounds.left + bounds.width);

         return bounds
        },
        setBounds:function( ){ return this.update.apply(this,arguments); },
        getBB:function(margins){
            var l=this.__props
            margins=margins||this.margins||{}
            if(!margins){
                for(var i= 0;i< l.length;i++){margins[l[i]]=num(margins[l[i]])}
            }

            var ret=this.getBounds();
            ret.top-=margins.top;ret.left-=margins.left;
            ret.right+=margins.right ;ret.bottom+=margins.bottom;
            ret.width=ret.right-ret.left;ret.height=ret.bottom-ret.top;
            return ret;
        },
        getContentbox:function(){
            var ret=new Rect(this.getInnerBounds())
            return ret;

        },
        setAlignment:function(a){//if(a){
            var aa=String(a).toLowerCase();
            //["top","left","right","bottom"].forEach(function(it){aa=aa.replace(it,it.charAt(0))}); this._alignment=aa}
            this._alignment=aa
        },
        getAlignment:function(){return this._alignment},
        getInsets:function(offsets){
            offsets=offsets||this.padding||this.insets||new Offset()
            if(!isNaN(offsets)){
                offsets=new Offset({top:offsets,left:offsets,right:offsets,bottom:offsets})
            }
            return offsets;
        },
        getInnerBounds:function(offsets){
            var offsets=this.getInsets( );
            var b=this,ret=b.toMap();
            ret.top =offsets.top;ret.left =offsets.left;
            //ret.right = offsets.right ;ret.bottom =offsets.bottom;
            ret.width= ret.width- (offsets.right+offsets.left);ret.height= ret.height- (offsets.bottom+offsets.top);
            return ret;
        },
        moveTo:function(x,y,alignment){alignment=String(alignment||"").toLowerCase();
            if(arguments.length==1&& x&&typeof(x)=="object"){
                y= x.y||x.top;x= x.x||x.left
            }
            if(alignment.indexOf("right")>=0){ this.setAt("right",x )}
            else{this.setAt("left",x);}
            if(alignment.indexOf("bottom")>=0){this.setAt("bottom",y+this.height)}
            else{this.setAt("top",y);}
            return this;
        },
        moveBy:function(x,y){
            if(arguments.length==1&& x&&typeof(x)=="object"){
                y= x.y||x.top;x= x.x||x.left
            }
            this.addLeft(x);
            this.addTop(y);      return this;
        },
        resizeBy:function(x,y){
            if(arguments.length==1&& x&&typeof(x)=="object"){
                y= x.y||x.top;x= x.x||x.left
            }
            this.addHeight(y);
            this.addWidth(x);    return this;
        },
        resizeTo:function(x,y){
            if(arguments.length==1&& x&&typeof(x)=="object"){
                y= x.y||x.height;x= x.x||x.width
            }
            this.setWidth(num(x));
            this.setHeight(num(y));       return this;
        },
        getPoints:function(){
            var rect=this;
            var ret=[new Point(rect.top,rect.left,"TL" ),
                new Point(rect.top,rect.right,"TR"),
                new Point(rect.bottom,rect.right,"BR"),
                new Point(rect.bottom,rect.left ,"BL")
            ];
            ret.TL=ret[0];ret.TR=ret[1];
            ret.BL=ret[3];ret.BR=ret[2];
            return ret;
        },
         isPoint:function(){
           var ln=arguments.length,first=arguments[0],secnd=arguments[1]
             if(first && typeof (first)=="object" && first instanceof UI.Point){return first}
             if(ln==2 && Number.isNumber(first)&& Number.isNumber(arguments[1])){
                 return UI.Point(first,secnd)
             } else if(ln==1 && first && typeof (first)=="object" && first.x!=null && first.y!=null&& ($.keys(first).length==2 ||(first.width==null && first.height==null) )){
                 return UI.Point(first.x,first.x)
             } else if(ln==1 && $.isArray(first) && Number.isNumber(first[0]) && Number.isNumber(first[1])){
                 return UI.Point(first[0],first[1])
             }
         },
        overlaps:function(rect){
            return (rect.top<this.bottom && rect.bottom>this.top && rect.left<this.right && rect.right>this.left)
        },
        within:function(r,offset){

            offset=Math.max(Number(offset)||0,0)+1
            var rect=Rect.from(r,true);
            return (rect.top<=(this.top+offset) && rect.bottom>=(this.bottom-offset) && rect.left<=(this.left+offset) && rect.right>=(this.right-offset))
        },
         containsPoint:function(r,offset){
             var pt=this.isPoint(r),offset=this.isPoint(offset)||{x:0,y:0}
             if(pt){offset.x=num(offset.x);offset.y=num(offset.y)
                 return ((pt.x - offset.x)>=this.left && (pt.y-offset.y) >=this.top && (pt.x + offset.x) <=this.getAt("right")&& (pt.y+offset.y) <=this.getAt("bottom"))
             }
         },
        contains:function(r,offset){
            var pt=this.isPoint(r)
            if(pt){
                return this.containsPoint(r,offset)
            }
            var rect=Rect.from(r,true);
            return rect.within(this,offset)
        },
        refresh:function(){  if(this.element){this.update(this.element)}},
        applyPositionCss:function(el,aln) {
             $d(el).css(this.getPositionCss(el,aln));
            return this
        },
         getPositionCss:function(el,aln,holder) {if(typeof(aln)!="string"){aln=""}
             el = el || this.element
             if(!(el&&el.nodeType)){return  this}
             var ret=holder||{}  , al=aln||this.getAlignment(), l, r, b,t;
             if(!al) {
                 al = "";
                 if (el.style.right && el.style.right != "auto") {
                     al = al + "right"
                 }
                 if (el.style.bottom && el.style.bottom != "auto") {
                     al = al + "bottom"
                 }
             }
             l=this.__props
             al=al.replace(/right/i,"r").replace(/left/i,"l").replace(/top/i,"t").replace(/bottom/,"b").replace(/center/,"c")
             b=al.indexOf("b")>=0?Math.abs(this.getAt("bottom",true)):0
             r=al.indexOf("r")>=0?Math.abs(this.getAt("right")):0;
             // for(var i= 0;i< l.length;i++){ret[l[i]]=this.getAt(l[i])+"px"}
             if(b){
                 var p="bottom",v=this.getAt(p);
                 ret[p]=Math.abs(v)<=0.2?0:(v)
                 ret["top"]=null
             }
             else{
                 var p="top",v=this.getAt(p);
                 if(v){
                     if(!(Math.abs(v)<=0.2&&el.style.display=="relative")){
                         ret[p]=Math.abs(v)<=0.2?0:(v)
                     }
                 }
                 ret["bottom"]=null
             }
             if(r){
                 var p="right",v=this.getAt(p)

                 ret[p]=Math.abs(v)<=0.2?"0":(v)

                 ret["left"]=null
             }
             else{var p="left",v=this.getAt(p);
                 if(v){
                     if(!(Math.abs(v)<=0.2&&el.style.display=="relative")){
                         ret[p]=Math.abs(v)<=0.2?0:(v)
                     }
                 }
                 ret.right=null
             }
             return ret;
         },
         getDimensionCss:function(el,holder) {
             el=el||this.element
            var ret=holder||{}
             var p="width",v=this.getAt(p,true);
             if(v&&Math.abs(v)>0.2){
                 ret[p]=v
             }
             var p="height",v=this.getAt(p,true);
             if(v&&Math.abs(v)>0.2){
                 ret[p]=v
             }
             return ret;
         },
        applyDimensionCss:function(el) {
           $d(el).css(this.getDimensionCss(el ));
            return this

        },
        applyCss:function(el,aln){
            return  this.applyPositionCss(el,aln).applyDimensionCss(el,aln);
        },
         getCss:function(el,aln){
             var holder={};
             this.getPositionCss(el,aln,holder)
              this.getDimensionCss(el,holder);
             return holder;
         }
    }

    _addFields(Rect.prototype,LOCS.concat(["width","height"]));
    Rect.prototype.constructor=Rect
    Rect.from=Rect.create=function(data,nocache){
        if(data &&typeof(data)=="object"&&data instanceof Rect){return data}
        if(typeof(data)=="boolean"){nocache=data;data=null}
        if(nocache!==true && Rect.__cache && Rect.__cache.length){
            return Rect.__cache.shift().update(data);
        }
        return new Rect(arguments);
    }
    Rect.fromBounds= function(el){
        if(el&&el.getBoundingClientRect){
            var b=el.getBoundingClientRect()
            return new Rect(el)
        }else if(el&&"top" in el){var b=el;
            return new Rect(b.top,b.right,b.bottom,b.left)
        }
    }
    Rect.fromClip= function(el){
        var b=null,mp={"top":0,"right":0,"bottom":0,"left":0}
        if(el&&el.nodeType){
            b=$d.css(el,"clip")
        }else if(typeof(el)=="string"){b=el; }

        if(typeof(b)=="string"){b= b.trim();
            if(b.indexOf("rect")==0){b= b.replace(/rect|[\(\)]/g,"").trim()}
            if(b=="auto"||b=="initial"||b=="inherit"){b=""}
            var arr=["top","right","bottom","left"];
            b.split(/[\s,]/).forEach(function(it,i){
                mp[arr[i]]=Number(it.replace(/[^\d\.]+$/g,"")||0)
            })
        }
        return new Rect(mp)
    }
    Rect.mergeBounds=function(){
         var bounds=arguments.length==1?arguments[0]:[].slice.call(arguments)
        var boundsList=List.from(bounds)
         var outerbounds={
             top:boundsList.collect("top").min()||0,
             left:boundsList.collect("left").min()||0,
             bottom:boundsList.collect("bottom").max()||0,
             right:boundsList.collect("right").max()||0
         }
        outerbounds.height=outerbounds.bottom-outerbounds.top
        outerbounds.width=outerbounds.right-outerbounds.left
        //outerbounds.height=outerbounds.bottom-outerbounds.top;
        //outerbounds.width=outerbounds.right-outerbounds.left
        return new Rect(outerbounds)
     }

    var Visitable={
        accept:function(visitor,memo){
            visitor.visit(this,memo);
        }
    }
    function Visitor(context){
        this.ctx=context;
        this.visit=function(visitable,memo){

        }
    }
     context.Rect=UI.Rect=Rect;
    context.Offset=UI.Offset=Offset;
    context.Point=UI.Point=Point;
    context.SimpleRect=UI.SimpleRect=SimpleRect
    scope.Visitable=Visitable;
})