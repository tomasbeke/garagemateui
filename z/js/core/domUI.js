$.domUI = function(a) {
    var toignore = [];
    if(typeof(a)=="string"){
        toignore = a.split(/[\s,]+/)
        a=null;
    } else if(Array.isArray(a)){
        toignore= a.slice();a=null;
    }
    var model = $.simpleModel({
        style: {  reader: "map",readerOptions:{
            stringParser:function(a){
                return a.split(";").reduce(function(m,k){
                    var arr=k.split(":");m[arr[0].trim()]=String(arr[1]||"").trim();return m;
                },{})
            }}
        },
        klass: { reader: "list",readerOptions:{delim:" "}  },
        attr: { reader: "map" },
        data: {  reader: "map" },
        props:{ reader: "map" },
        delegate:null,
        listeners:null
    } );
    if(a && $.isElement(a)){
        model.delegate=a;
    }
    model.rescan=function(){
        var noti=Object.getNotifier(this)
        if(noti && typeof(noti.scan)=="function"){noti.scan()}
    }
    model.readConfig=function(config){
        if($.isPlain(config)){
            var ths=this;
            $.each(config,function(v,k){
                if(ths.hasProperty(k) ){
                    ths.set(k,v)
                } else {
                    var isstyle = $d.css.isStyle(k)
                    if(isstyle && isstyle.js && ths.style){
                        ths.style[isstyle.js]=v;
                    } else if($d.isValidAttrName(ths.delegate,k)){
                        ths.attr[k]=v;
                    }
                }
            });
        }
    },
    model.updateUI=function(val){
        if($.isPlain(val)){
            var ths=this;
            $.each(val,function(v,k){
                ths.setUI(k,v);
            });
        }
    }
    model.getUIProp=function(nm){
        if(typeof(nm)=="string" && /\s/.test(nm.trim())){nm=nm.trim().split(/\s+/)}
        if(Array.isArray(nm)){
            var ths=this;
            return nm.reduce(nm,function(m,k){
                var val=ths.getUIProp(k)
                if(val!=null){m[k]=val}
                return m
            },{});
        }
        if(this.hasProperty(nm) ){
            return this.get(nm)
        }
        var isstyle = $d.css.isStyle(nm)
        if(isstyle && isstyle.js && this.style){
            return this.style[isstyle.js]
        }
        if(this.props && this.props[nm]){
            return this.props[nm]
        }
        if(this.attr && this.attr[nm]){
            return this.attr[nm]
        }
        if(this.data && this.data[nm]){
            return this.data[nm]
        }
        if(this.listeners && this.data[nm]){
            return this.data[nm]
        }
    }
    model.setUI=function(nm,val){
         if(!(nm && typeof(nm)=="string")){
             return
         }
        var isstyle = $d.css.isStyle(nm),ths=this ;
        if(isstyle && isstyle.js ){
            ths.style[isstyle.js] = val
        } else if(this.hasProperty(nm) ){
            ths.set(nm,val)
        } else if("css" == nm || "styles" == nm ){
            ths.style = val || {}
        } else if("class" == nm || "classname" == nm.toLowerCase()){
            this.klass = val
        }  else if("dataset" == nm || /^data[A-Z\-]\w*$/.test(nm)){
            if(nm!="dataset"){nm=nm.replace(/^data/,"");nm=nm.charAt(0).toLowerCase()+nm.substr(1).replace(/[A-Z]/g,function(a){return "-"+ a.toLowerCase()})
                this.data[nm]=val
            }
            else{this.data = val}
        } else {
            if($d.isValidAttrName(nm)){
                ths.attr || (ths.attr = {});
                if(val && nm.indexOf('on')==0 && (typeof(val)=="function"||typeof(val.callback)=="function")){
                    ths.listeners[nm]=val
                }
                else {
                    ths.attr[nm] = val
                }
            } else{
                ths.props || (ths.props = {});
                ths.props[nm] = val
            }
            return
        }
    }
    model.applyUI=function(el){
        this.rescan();
        var elem=$d(el)||$d(this.delegate)
        if(!elem){return}
        if(elem){
            this.style && Object.keys(this.style).length && elem.css(this.style)
            elem.addClass(this.klass).attr(this.attr).prop(this.prop)
        }
        if(this.listeners && Object.keys(this.listeners).length){
            $.each(this.listeners,function(v,k){
                var cb,optns={}
                if(v.callback){cb= v.callback;optns=v;}
                else{cb=v;}
                elem.on(k+".domui",cb,optns);
            })
        }
        return elem;
    }
    model.listeners={};
    model.style={};
    model.klass=[];
    model.attr={};
    model.data={};
    model.props={}
    $.observe(model, function(recs) {
        var arr=Array.isArray(recs)?recs:[recs]
        for(var i=0;i<arr.length;i++){
            var rec=arr[i],ths=model;
            var nm = rec.name,type=rec.type;
            if(type ==="remove" || type ==="delete" || (ths.hasProperty(nm) && nm!="id")){continue}
            if (!nm || "length" == nm || !isNaN(nm) || (toignore.indexOf(nm) >= 0) || !(ths && ths.style)) { continue}
            if(rec.oldValue !=null){
                ths.setUI(nm,rec.oldValue)
            }
            ths.setUI(nm,rec.newValue||rec.value||ths[rec.name])
            if("add" === type){
                //delete this[nm]
            }
        }

    },["update"]);
    return model
}
$.domUI.addTo = function(a, b, c) {
    var d = $.domUI(c);
    if (b = b, a) {
        var e = a;
        a.properties && (e = a.properties);
        var f = a[b];
        e.addProperty ? (e.removeProperty(b), e.addProperty(b, {
            reader: function(c, d) {
                var e = 0;
                if (d || (d = a[b]), d = d || {}, d.style || (d.style = {}), d.attr || (d.attr = {}), d.data || (d.data = {}), d.klass || (d.klass = []), null == c) return d;
                var f = c;
                return "string" == typeof f ? (f.indexOf(":") > 0 ? d.style == f.split(";").reduce(function(a, b) {
                    var c = b.split(":");
                    return 2 == c.length && (a[c[0]] = c[1]), a
                }, {}) : d.klass = f.split(/\s+/), e = 1) : $.isArrayLike(f) && (e = 1, d.klass = [].slice.call(f)), $.isPlain(f) && Object.keys(f).length && (e = 1, $.extend(d, f)), e && $.updateVersion(d), d
            }
        }), e.set(b, d)) : (delete a[b], $.defineProperty(a, b, function(a) {
            var b = $.baseModel._readers.map(a);
            return {
                set: function(c) {
                    return null == c ? (a.__curr.style = {}, a.__curr.attr = {}, void(a.__curr.klass = [])) : void(a.__curr = b(c, a.__curr, a.holder))
                },
                get: function() {
                    return a.__curr
                }
            }
        }({
            name: b,
            holder: a,
            __curr: d
        }))), f && (a[b] = f)
    }
    return d
}
