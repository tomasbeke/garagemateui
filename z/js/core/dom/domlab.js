/**
 * Created by Atul on 12/17/2014.
 */
domAttrSet:(function(){
    var worker=null,computedStyle=null,
        abbr={
            w:"width",h:"height","t":"top","r":"right","b":"bottom",l:"left",z:"zIndex",
            o:"overflow",op:"opacity",mxw:"max-width",mnw:"min-width",
            d:"display",bg:"background",bgc:"background-color"
        },
        abbrSet={

        },
        abbrValue={

        }
    var _worker=null,ignoreexpr=[],exprcache={}
    var boolProps={
        readonly:"readOnly",disabled:"disabled",draggable:"",formnnovalidate:"formNoValidate",novalidate:"formNoValidate",
        defaultChecked:"",checked:"",hidden:"",incremental:"",isContentEditable:"",required:"",
        spellcheck:"",translate: "translate",webkitgrammar: "webkitGrammar",webkitspeech: "webkitSpeech",webkitdirectory: "webkitdirectory",
        willvalidate: "willValidate",validate: "willValidate"
    }
    function toel(e){
        if(typeof(e)=="string"){return ($d(e)||{}).el}
        return e?(e.el||e):null
    }
    function _resolveSimple( v0,el ){  var v=v0,cmpl;
        if(ignoreexpr.indexOf(v0)>-1){return v}
        if(exprcache[v0]){v=exprcache[v0]; }
        else {
            if(v.indexOf("?")==0){v=v.substr(1).trim();cmpl=1 }

            if(/[\s\+\*\/\%\@\(\)]/.test(v)||(v.charAt(0)=="-")){
                v=v.replace(/(^|\W)([a-zA-Z]+)\b/g,function(a,b,c){if(!b||!(b=="@"||b==".")){
                    return (b||"")+"this.prop('"+c +"')"}})
                cmpl=1

            }
            if(cmpl){
                try{ v=$.parseExpr(v).toFn()} catch(e){
                    ignoreexpr.push(v0);v=v0
                }
            }
        }
        if(typeof(v)=="function"){exprcache[v0]=v}
        return v
    }
    function _resolve(v0,p,el ){
        var v=v0
        if(typeof(v0)=="string"&&v0.length  ){
            v=_resolveSimple( v0 )
            if(typeof(v)!="function" && (v in el || v in $d(el)||isStyle(v))){
                v=_get(el,v)
            }
        }
        if(typeof(v)==="function"){v= v.call($d(el),p)}

        return v
    }
    function  _resolveName( p0,el){
        var p= _resolveSimple( p0 )
        if(typeof(p0)=="string"){
            p=abbr[p0.toLowerCase()]||p0.toLowerCase()
            p= _resolveSimple( p )
        }
        if(typeof(p)=="function"){p={value:p.call($d(el))}}
        return p
    }

    function isFormEle(el){
        var t=String(el.tagName).toLowerCase()
        return t=="input"||t=="textarea"||t=="select"||t=="selectmultiple"
    }
    function asBool(n){
        return !(!n||n.valueOf()===false||n=="false"||n=="0"||n=="no")
    }
    function asNum(n){
        return (!isNaN(n)&&typeof(n)=="number")?n:
            (Number(String(n).replace(/[^\d\.]/g,""))||0)
    }
    var computed=function computed(elem){
        var el=document.body;
        var computedStyle=(document.defaultView&&document.defaultView.getComputedStyle)?
            (function(vw){var f=vw.getComputedStyle;
                return function(el){return el?f((el.el||el),null):null}
            })(document.defaultView)

            :("currentStyle" in el)?function(el){
            if(!el){return null}
            var e=("el" in el?el.el:el),stl= e.currentStyle
            if(!stl){e.offsetHeight;
                e.style && (e.style.zoom=1); stl= e.currentStyle
                if(!stl&&"currentStyle" in e){
                    while(!e.currentStyle){e.style.zoom=.99;e.offsetHeight;e.offsetWidth;e.style.zoom=1;}
                }
            }
            return stl
        }:function(el){return el?(el.el||el).style:null}

        computed=computedStyle;

        return computedStyle(elem)
    }

    function resolveType(p,el,holder){
        if(!p){return null}
        if(!el){el=_worker||(_worker=document.createElement("div"))}
        var t;

        if(p.indexOf("class")>=0||p=="klass"||p.indexOf("classlist")>=0 ){t="klass"}
        else if($d.css.isStyle(p)){
            t="style"
        }else if(p in el){
            t="prop";
        } else if(p=="value"||p=="val"||p=="text"||p=="html"){
            t="val"
        } else if(boolProps[p]){t="bool"}
        else if(p.indexOf("data-")==0||p.indexOf("d-")==0){t="data"}
        else{
            t="attr"
        }
        return t;
    }
    function endsWith(s,c){
        return (c.length==1?s[s.length - 1]: s.substr(s.length - c.length))==c}
    function isBoolean(){ }
    function _set(el,p0,v0,type){ var ret,v=v0

        var info,p=_resolveName( p0,el)  ,ret
        if(!(p&&typeof(p)=="string")){return}

        var t=type||resolveType(p,el)
        var  del=v===null||v=="-delete-"
        if(!del &&t=="style"){
            if(/^[\+\*\/%\-]\s*\d+$/.test(v)){
                var curr=asNum(_get(el,p))
                v=(1,eval)(curr+v)
            } else{
                v=_resolve(v,p,el)
            }
        }
        if(t=="klass"){
            var l=Array.isArray(v)?v:String(v).split(/[\s,]+/),ln=l.length,vv=el.classList
            if(p.indexOf("has")>0){
                for(var i=0,l,k;k=l[i].trim(),i<ln;i++){
                    if(k&&vv.contains(k)){ret=true;break;}
                }
            } else if(p.indexOf("add")>0){
                for(var i=0,l,k;k=l[i].trim(),i<ln;i++){
                    k&&vv.add(k)
                }
            } else if(p.indexOf("remove")>0){
                for(var i=0,l,k;k=l[i].trim(),i<ln;i++){
                    k&&vv.remove(k)
                }
            }

        } else  if(t=="bool"){
            p=boolProps[p]
            if(del||!asBool(v)){el[p]=false;
                el.removeAttribute(p)
            } else{
                el[p]=true
            }
        }

        else if(t=="val"){
            if(del){v=""}
            if(isFormEle(el)){
                if(el.type=="radio"||el.type=="checkbox"){el.checked=asBool(v)}
                else{ el.value=v}
            }
            else {el[p=="html"?"innerHTML":"textContent"]=v}
        } else if(t=="prop"){
            if(del){v=""}
            el[p0] = v;
            if(el[p0]!==v){ret=el.setAttribute(p0,v)}

        } else if(t=="style"){  info=$d.css.isStyle(p)
            if(del){el.style.removeProperty(info.css)}
            else{
                if(info.number||info.dim){
                    if(p.indexOf("line")!=0&&(!(endsWith(v,"%")||v==="auto"||v==="inherit"||v==="")&&!isNaN(v))){
                        v=v+"px"
                    }
                }
                else if(info.number&&isNaN(v)){
                    return
                }
                el.style[p]=info.fnname?(info.fnname+"("+v+")"):v
            }
        } else if(t=="data"){

            el.dataset[p.substr(5)]=del?null:v
        }
        else {
            if(del){el.removeAttribute(p,v)}
            else {el.setAttribute(p,v)}
        }
    }
    function _get(el,p0,type,cmp){
        var p=_resolveName( p0,el)  ,ret ,info
        if(!(p&&typeof(p)=="string")){return}
        if(p.value){return p.value}
        var t=type||resolveType(p,el)
        if(t==="klass"){
            ret=$.makeArray(el.classList)
        } else if(t==="bool"){
            ret=!!el[boolProps[p]]
        } else if(t==="val"){
            ret=isFormEle(el)?el.value:el[p=="html"?"innerHTML":"textContent"]
        } else if(t==="prop"){
            ret=el[p0]
            if(ret==null){ret=el.getAttribute(p0)}
        }
        else if( t==="style"){info=$d.css.isStyle(p)
            ret=(cmp||computed(el)||{})[info.css]
        } else if(t==="data"){
            ret=el.dataset[p0.substr(5)]
        }
        else {
            ret=el.getAttribute(p0)
        }

        return ret;
    }
    return {el:null,
        apply:function(holder,el0){
            var el=toel(el0 ) ;
            if(!el){return}
            //{style:{},klass:[],attr:{},prop:{}}
            for(var i=0,l=Object.keys(holder),ln=l.length,k;k=l[i],i<ln;i++){
                if(k=="klass"&&holder.klass.length){_set(el,k+"add",holder.klass,k)}
                else {
                    for(var i2=0,l2=Object.keys(holder[k]||{}),ln2=l2.length,k2;k2=l2[i2],i2<ln2;i2++){
                        _set(el,k2,holder[k][k2],k)
                    }
                }
            }
            return el
        },
        update:function(p,v,holder){
            if(holder==null&&v&&v.attr){holder=v;v=null}
            holder||(holder={style:{},klass:[],attr:{},prop:{}});
            if(!p){return holder}
            if( typeof(p)=="object"){
                for(var i=0,l=Object.keys(p),ln=l.length,k;k=l[i],i<ln;i++){
                    var t=resolveType(k)
                    if(t=="style"||t=="attr"||t=="prop"){holder[t][k]=p[k]}
                    else if(t=="klass"){[].push.apply(holder.klass,(Array.isArray(p[k])?p[k]:String(p[k]).split(/[,\s]+/)))}
                }
            }else{
                var t=resolveType(p )
                if(t=="style"||t=="attr"||t=="prop"){holder[t][p]=v}
                else if(t=="klass"){[].push.apply(holder.klass,(Array.isArray(v)?v:String(v).split(/[,\s]+/)))}
            }
            return holder
        },
        set:function(){
            var a=$.makeArray(arguments),e=a.shift(),el=toel(e) ,p=a.shift(),v=a.shift(), t,r;
            if(!(el&&p)){return }
            if(a.length){t=a.shift()}
            if(p&& typeof(p)=="object"){if(typeof(v)=="string"&&!t){t=v;}
                for(var i=0,l=Object.keys(p),ln=l.length,k;k=l[i],i<ln;i++){
                    if(typeof(k)=="string"){_set(el,k,p[k],t)}
                }
            } else if(p&&typeof(p)=="string"){
                _set(el,p,v,t)
            }
            return e;

        },
        get:function(e,p,type){
            var el=toel(e) ,r;if(!(el&&p)){return }
            if(Array.isArray(p)){r={};var cmp=computed(el)
                for(var i=0,ln=p.length,k;k=p[i],i<ln;i++){
                    if(typeof(k)=="string"){r[k]=_get(el,k,type,cmp)}
                }
            } else if(typeof(p)=="string"){r=_get(el,p,type)}
            return r
        }

    }

})()