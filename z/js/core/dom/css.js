$.__css = function( $d,CACHES){
    var SUPPORTSCALC=null,__domworker=null
    var CONVERTTOREM=true,BASEREMRATIO=0,varMap={}, calcMap={},_proxy,remcalc=null,remworker=null,MAGICNUM=0.1991,remcalcCached=MAGICNUM,dimmatcher=/(\-?[\d\.]+)([a-z]+)$/i,checkcnt=0
    var NOUNITS=['columnCount','fillOpacity','flex','flexGrow','flexShrink','fontWeight','lineClamp','lineHeight','opacity','order','orphans','strokeOpacity','widows','zIndex','zoom'];
    function _el(el){
        return $d.toEl(el)
    }
    function num(v){
        if(v==null){return 0}
        if(typeof(v)=="number"){return Number(v)}
        if(typeof(v)=="string"){
            return Number(v.replace(/[^\d\.]/g,""))||0;
        }
        return 0;
    }
    function supportsCalc(){
        if(SUPPORTSCALC==null){
            var w=document.body.appendChild(document.createElement("div"));
            w.style.height="100vh"
            var initheight=w.offsetHeight
            w.style.height="calc(100vh-10px)"
            SUPPORTSCALC=Math.abs((initheight-10) - w.offsetHeight) < 5;
            document.body.removeChild(w)
        }
        return SUPPORTSCALC
    }
    var resizelistener=null
    function remratio(){
        if(!BASEREMRATIO){
            remworker=remworker||document.body.appendChild(document.createElement("div"));
            remworker.style.cssText="margin:0;overflow:hidden;padding:0;padding:0;border:none;position:fixed;height:1px;width:1px;top:-1px;left:0;z-index:0"
            remcalc=document.body.appendChild(document.createElement("div"));
            remcalc.style.cssText="margin:0;overflow:hidden;padding:0;padding:0;border:none;position:fixed;height:1px;width:1rem;top:-1px;left:0;z-index:0"
            BASEREMRATIO=remcalc.offsetWidth
            //remcalc.parentNode.removeChild(remcalc)
            //alert(BASEREMRATIO)
            console.log(BASEREMRATIO)
        }
        if(!resizelistener && typeof($d)!="undefined" && $.viewport){
            $d.__resetRemRatio = $d.__resetRemRatio||function(){  BASEREMRATIO=0; };
            $.viewport.on(resizelistener=function(){
                BASEREMRATIO=0;
            })
        }
        return  BASEREMRATIO//remcalc.offsetWidth
    }
    function topx(val){
        var dim,num
        if(typeof(val)=="number"){num =val}
        else if(typeof(val)=="string"){
            var m=val.match(dimmatcher)
            if(m){
                dim=m[2];num=Number(m[1])||0
            }
        }
        if(dim=="px"){return num}
        if(num && (!dim || dim=="rem")){return num*remratio()}
        else {
            if(dim){
                //var r=remratio()
                //remworker.style.width= val;
                num=null;
                return val
            }
        }
        return num==null?val:num
    }
    function torem(val){
        var dim,num
        if(typeof(val)!="string"){return val}
        var m=val.match(dimmatcher)
        if(!m){
            return val
        }
        dim=m[2];num=Number(m[1])||0
        if(dim!="px"  || !num || (num>0 && num<=1)){return val}
        if(num && (dim=="px")){return (num/remratio()).toFixed(3)}
        else {return val
            /*if(dim){
             var r=remratio()
             remworker.style.width= val;
             return remworker.offsetWidth?(remworker.offsetWidth/remratio()).toFixed(3):val
             }*/
        }
        return num==null?val:num
    }
    function  converttorem(  str){var r=remratio();
        var htmlblocks=[],cache={}
        var ret = str.replace(/([\d\.]+)px/g,function(a,b){
            if(cache[b]){return cache[b]}
            var n=Number(b);
            if(!n || n<=1){return a}
            return cache[b]=(n?((n/r).toFixed(3)):0)+"rem"
        })
        htmlblocks.length=0;htmlblocks=null;cache=null;
        return ret
    }
    function _css(el ,ky){el=_el(el);if(!el){return}
        var args=[].slice.call(arguments,2),notranslate
        if(args[args.length-1]===true){notranslate=args.pop()}
        if(el==document){el=el.documentElement||el}
        var m={},res ,tp=typeof(ky),frst=args[0];
        if(typeof(frst)==="undefined"&&args.length==1){args=[]}
        if(Array.isArray(el)){
            res=[];
            for(var i= 0,ln=el.length;i<ln;i++){res.push(_css.apply(null,[el[i],ky].concat(args)))};
        } else if(tp=="string"){ var doset=typeof(frst)!="undefined"
            if(ky=="rotate"){res=$d.rotation(el,frst)}
            else{
                if(ky=="skew"||ky=="translate"){if(doset){frst=String(frst).indexOf(ky)==-1?(ky+"("+frst+")"):frst}else{res=""};ky="transform";}
                res=_css.get(el,ky);
                res=doset?_css.set(el,ky,frst,res,notranslate):res
            }
        }
        else if(tp=="object"){
            if(Array.isArray(ky)){res=_css.getMulti(el,ky )}
            else if(tp=="object"){_css.setMap(el,ky,notranslate);res= el}
        }
        return (res&&res.nodeType)?$d(res):res;
    }
    function _getComputed(el0){
        var el=document.body;
        var computedStyle=(document.defaultView&&document.defaultView.getComputedStyle)?(function(vw){
                var f=vw.getComputedStyle;
                return function(el){return el?f((el.el||el),null):null}})(document.defaultView)
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
            ;
        _css.getComputed=computedStyle;
        return el0?computedStyle(el0):null

    }

    function _notify(el,rec){  return;
        if(!(el._islistening&&el._islistening.indexOf("propertychange")>=0)){return}
        setTimeout(
            function(){$d(el).trigger( "propertyChange",{data:rec})}
            ,0);
    }
    function applyVars(string){
        if(!_css._varmap){_css.setVarMap()}

        if((string&&(string.indexOf("@")>=0||string.indexOf("$")>=0))&&_css._varmap){
            return string.replace(/[@\$]([\-\w]+)/g,function(a,k){return (_css._varmap[k]||{}).val||k})
        }
        string=converttorem(string)

        return string
    }
    function calcresolver(delegate,prop,fn,val){
        if(fn=="val" || fn=="px"){return num(val)}
        if(!delegate){return 0}

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
            return   delegate?num($d.prop(delegate,prop)):0;
        }
        val=num(val)
        if(fn=="vh"){ return $.viewport.height*val}
        if(fn=="vw"){ return $.viewport.width*val}
        if(fn=="vmax"){ return Math.max($.viewport.height,$.viewport.width)*val}
        if(fn=="vmin"){ return Math.min($.viewport.height,$.viewport.width)*val}
        var worker= __domworker
        if(!worker){
            worker=document.body.appendChild(document.createElement("div"))
            worker.style.position="fixed" ;
            worker.style.height="1px"; worker.style.width="1px"
            worker.style.overflow="hidden"
            __domworker=worker
        }
        //worker.style.display=""
        $d.css(worker,prop,val+fn);
        var ret= num($d.css(worker,prop));
        worker.style.height="1px"; worker.style.width="1px";
        return ret
    }
    function calcExprhandle(a,nm){
        if(/([\-\+\*\/])/.test(a)){return a};
        if(/^([\d\.]+)(rem|rm|px|\%|in|vh|vw|vmax|vmin)?$/.test(a)){
            return a.replace(/^([\d\.]+)(rem|rm|px|\%|in|vh|vw|vmax|vmin)?$/,function(a,b,c){c=c||"val";return "_(this,'"+nm +"','"+(c=="%"?"perc":c)+"',"+b+")"})
        }
        return "_('attr','"+a+"')"
    }
    function parseCalcExpr(nm,expr){
        expr=expr.trim().replace(/^calc\s*\(|\)$/g,"").trim()
        var varmap=_css._varmap||{}
        expr=(expr+" ").replace(/[@\$]([\-\w]+)\s/g,function(a,k){return (( varmap[k]||{}).val||k)+" "}).trim()

        return Function("_"," return "+expr.replace(/([\-\+\*\/])/g," $1 ").split(/\s+/).map(function(val){
                 return calcExprhandle(val,nm)
            }).join(" "))
    }
    var calcREsolvers={
        "%":function resolveCalcPerc(prop,val){
            return calcREsolvers.perc(prop,val)
        },
        "perc":function resolveCalcPerc(prop,val){
            return function(el){
                var par=el.offsetParent||el.parentNode
                if(!par){return 0}
                if(prop=="height"){return (par.offsetHeight||Number(String(document.defaultView.getComputed(par).height).replace(/[a-z]+$/i,""))) * val}
                if(prop=="width"){return (par.offsetWidth||Number(String(document.defaultView.getComputed(par).width).replace(/[a-z]+$/i,""))) * val}
                return 0
            }
        },
        "vh":function resolveCalcPerc(prop,val){
            return function(el){return $.viewport.height}
        },
        "vw":function resolveCalcPerc(prop,val){
            return function(el){return $.viewport.width}
        },
        "vmax":function resolveCalcPerc(prop,val){
            return function(el){return Math.max($.viewport.height,$.viewport.width)}
        },
        "vmin":function resolveCalcPerc(prop,val){
            return function(el){return Math.min($.viewport.height,$.viewport.width)}
        },
        "px":function resolveCalcPerc(prop,val){
            return function(el){return val}
        },
        "rem":function resolveCalcPerc(prop,val){
            return function(el){return val*16}
        },
        "em":function resolveCalcPerc(prop,val){
            return function(el){return val*16}
        },
        "unit":function resolveCalcPerc(prop,val,unit){
            return function(el){return val}
        },
        "nounit":function resolveCalcPerc(prop,val){
            return function(el){return +val}
        },
        "val":function resolveCalcPerc(prop,val){
            return function(el){return (+val)||0}
        }
    }
    var calcops={
        "-":function(l,r){
            return function(el){
                return l(el) - r(el)
            }
        },
        "+":function(l,r){
            return function(el){
                return l(el) + r(el)
            }
        },
        "*":function(l,r){
            return function(el){
                return l(el) * r(el)
            }
        },
        "/":function(l,r){
            return function(el){
                return l(el) / r(el)
            }
        }
    }
    var calcMap_processed={}
    function resolveCalcs(){
        for(var k in calcMap_processed){
            var m=calcMap_processed[k]
            if(m && m.selector){
                for(var i= 0,l=document.querySelectorAll(m.selector),ln=l.length;i<ln;i++){
                    var el=l[i],val=m.fn(el)
                    el.style[m.prop]=val+"px";
                }
            }
        }
    }
    function parseCalc(prop,expr){
        var v = expr.split(/\s+/);
        var lft=(String(v[0]).match(/(\d+)(\D+)?$/)||[]).slice(1);
        var rght=(String(v[2]).match(/(\d+)(\D+)?$/)||[]).slice(1);
        var op=v[1]||"";
        var lres,rres
        var val=Number(lft[0]),unit=String(lft[1]||"").toLowerCase()
        if(!unit){lres=calcREsolvers.nounit(prop,val)}
        else if(!calcREsolvers[unit]){lres=calcREsolvers[unit](prop,val)}
        else {lres=calcREsolvers.unit(prop,val,unit)}
        var val2=Number(rght[0]),unit2=String(rght[1]||"").toLowerCase()
        if(!unit2){rres=calcREsolvers.nounit(prop,val2)}
        else if(!calcREsolvers[unit2]){rres=calcREsolvers[unit2](prop,val2)}
        else {rres=calcREsolvers.unit(prop,val2,unit2)}

        return calcops[op](lres,rres)

    }
    function processCalc(){
        for(var k in calcMap){
            if(Array.isArray(calcMap[k])){
                for(var i= 0,l=calcMap[k],ln=l.length;i<ln;i++){
                    if(!calcMap_processed[k+"__"+l[i][0]]){
                        calcMap_processed[k+"__"+l[i][0]]={prop:l[i][0],selector:k,fn:parseCalc(l[i][0],l[i][1])}
                    }

                 }
            }
        }
    }
    function checkCalcs(selector,rules){
        if(typeof(rules)=="string"){var b=selector;
            rules.replace(/([\w\-]+)\s*:\s*calc\(([^\)]+)\)/mg,function(a,c,d){
                var ar=calcMap[b.trim()]||(calcMap[b.trim()]=[]);
                ar.push([c.trim(),d.trim()])
            })
        } else {
            selector.replace(/^\s*([^{]+){.*?([\w\-]+)\s*:\s*calc\(([^\)]+)\)/mg,function(a,b,c,d){
                var ar=calcMap[b.trim()]||(calcMap[b.trim()]=[]);
                ar.push([c.trim(),d.trim()])
            })
        }
        processCalc()
    }
    _css.getCalcs = function(){
        return calcMap
    }
    _css.checkCalcs = checkCalcs
    _css.applyVars = applyVars
    _css.setStyle = function (el0,ky,val ){
        var el=el0.el||el0,rem=val?torem(val):val
        if(rem!=val && !isNaN(rem)){rem=rem+"rem"}
        el.style[ky]=rem
        return el0
    }
    _css.set = function (el0,ky,val,curr,notranslate,batched){
        var el=_el(el0);if(!el){return null}
        var m=_css.prep(el,ky,val,curr==null?_css.get(el,ky):curr),info;
        if(!m){return}
        ky=m.name||ky;
        info= m.info
        if(val===null||val=="-delete-"){el.style.removeProperty(ky);}

        else {
            val=m.value
            var isnum=(typeof(val)=="number" || (val && typeof(val)=="string" && !isNaN(val)));
            if(info.isDimension){
                if(isnum ){
                    if(NOUNITS.indexOf(name)>-1){
                        notranslate = true
                        //do nothing
                    }   else{
                        val = val + "px"
                    }
                }

                if (notranslate !== true && CONVERTTOREM && val && String(val).indexOf("calc") == -1) {
                    var val1 = torem(val)
                    if (Number(val1) == val1 && val != val1) {
                        val = val1 + "rem"
                    }
                }
            }

            el.style.setProperty(m.info.css,val)
        }
        if(batched){m.el=el;return m}
        _notify(el,m)
        return el;
    }

    _css.setMap = function (el0,map,notranslate){ var el=_el(el0),recs=[]; if(!(el&&map&&typeof(map)=="object")){return null}
        var props=Object.keys(map),vals=_css.getMulti(el,props)||{};
        recs=Object.keys(map).map(function(k){return _css.set(el,k,map[k],vals[k],notranslate,true) })
        _notify(el,recs);
        return el;
    }

    _css.get= function (el0,ky ){   var el=_el(el0);if(!el){return null}
        return  _css.getComputed(el) [_css.prep(el,ky).name]
    }
    _css.getMulti= function (el0,arr){ var el=_el(el0); if(!el){return null}
        var res={}, m,comp=_css.getComputed(el)
        for(var i= 0,l=$.makeArray(arr),ln=l.length;i<ln;i++){
            m=_css.prep(el,l[i])
            res[m.name]=comp[m.name];
        }
        return res;

    }
    var abbr={w:"width",h:"height","t":"top","r":"right","b":"bottom",l:"left",z:"zIndex",
        o:"overflow",op:"opacity",mxw:"max-width",mnw:"min-width",
        d:"display",bg:"background",bgc:"background-color"}
    var units={"z-index":"number","opacity":"number", "zoom":"number","border-top":"border","border-right":"border","border-left":"border","border-bottom":"border"}
    var valueabbr={"abs":"absolute"}
    var ruleabbr={"abs":"position:absolute","rel":"position:relative"}
    "hwtrbl".split("").forEach(function(it){units[abbr[it]||it]="dimension"});
    units["max-height"]=units["max-width"]=units["min-height"]=units["min-width"]="dimension";
    units["radius"]="dimension"
    _css.abbr=abbr;
    _css.units=units
    _css.valueabbr=valueabbr
    _css.ruleabbr=ruleabbr
    var bdy=document.body;
    _css.fixName=function(s0){var s=String(abbr[s0]||s0);
    }
    _css.isStyle= function isStyle(k){
        if(!k || !isNaN(k) || k=="text"||k=="value"||k=="length"||k=="style"||k=="css"||k=="content"){return false}
        return  getInfo(k,true)
    }

    var _infoCache=null
    var getRecord=(function(el,nm0){
        var  recordctor=null,transormfns={
            skew:{getValue:function(){return $d.skew(this.el)},setValue:function(v){return $d.skew(this.el,v)}},
            translate:{getValue:function(){return $d.translate(this.el)},setValue:function(v){return $d.translate(this.el,v)},
                rotate:{getValue:function(){return $d.rotation(this.el)},setValue:function(v){return $d.rotation(this.el,v)}  }
            }};
        return function(el,nm0,val){
            if(!recordctor){
                var comp=$d.css.getComputed
                recordctor=function recordctor(el,nm,val){
                    this.el=$d(el);
                    this.info=getInfo(nm)
                    this.name=this.info.js
                    if(transormfns[nm]){
                        this.getValue= transormfns[nm].getValue
                        this.setValue= transormfns[nm].setValue
                    }
                    if(val!=null){this.value=val}
                    else {this.value=this.getValue()}

                }
                recordctor.prototype={
                    el:null,isStyle:true,value:null,name:null,info:null,oldValue:null,
                    getValue:function(elem){
                        var el=elem||this.el,k=this.name;
                        if(el){el=el.el||el}
                        if(typeof(el)=="string"){el=($d(el)||{}).el}
                        return el?comp(el)[k]:null//(el&&el.style)?el.style[k]||:null
                    },
                    setValue:function(v,elem){k=this.name;
                        var el=elem||this.el,k=this.name;
                        if(el){el=el.el||el}
                        if(typeof(el)=="string"){el=($d(el)||{}).el}
                        if(!el){return null}

                        if(typeof(v)=="function"){v= v.call(el,el,k)}
                        if(this.info.isDimension && !isNaN(v) && k.indexOf("line")!=0){v=v+"px"}
                        return (el&&el.style)&&(el.style[k]=v);
                    }}
                $.defineProperty(recordctor.prototype,"valueAsNumber",function(){
                    var v=this.getValue();
                    if(!v){return v}
                    if(/\s/.test(String(v))){return v}
                    if(v=="auto"||v=="inherit"||String(v).indexOf("%")>0){return v}
                    if(this.info.numeric){
                        return Number(this.info.isDimension?String(v).replace(/\D+$/g,""):this.value)||0
                    }
                    return 0;
                })
                $.defineProperty(recordctor.prototype,"valueAsInt",function(){
                    return Math.round(this.valueAsNumber)

                })
            }

            return new recordctor(el,nm0,val)
        }

    })();
    var _cachedRecords={}
    var getCachedRecord=function(el,nm0){
        var ret=_cachedRecords[nm0],e=$d(el);
        if(!ret ){
            ret=_cachedRecords[nm0]=getRecord(e,nm0)
        }
        if(ret){
            ret.el=e
        }
        return ret;
    }
    function gatherStyles(){
        if(_infoCache){return _infoCache}
        _infoCache={}
        var vendorkey,worker=document.body.appendChild(document.createElement("div"))
        var a=document.defaultView.getComputedStyle(worker,null),prefixs=[]
        for(var i=0,ln=a.length;i<ln;i++){

            var k=a[i],data= {name:k,defValue:k=="display"?"":a[k]} ;
            if(!k || !isNaN(k) || k=="text"||k=="value"||k=="length"||k=="cssText"||k=="style"||k=="css"||k=="content"){continue}
            var nm=k;
            if(k.indexOf("-")==0) {
                if(!vendorkey) {
                    vendorkey = "-" + k.substr(1).split(/-/).shift() + "-"
                }
                k = k.substr(vendorkey.length)

                data.vendor=vendorkey;

            }

            data.js= k.replace(/(^|\w)\-(\w)/g, function (a, b, c) {
                return (b || "") + c.toUpperCase()
            })
            data.css= k.replace(/[A-Z]/g, function (a) {
                return "-"+a.toLowerCase()
            });
            if(data.css.indexOf("-")>0){var arr=data.css.split("-")
                arr.pop();var prefx=arr.join("-")
                prefixs.indexOf(prefx)==-1 && prefixs.push(prefx)
                if(arr.length>1){arr.pop();prefx=arr.join("-")
                    prefixs.indexOf(prefx)==-1 && prefixs.push(prefx)
                }
            }

            data.unit=units[data.css]||units[data.css.split("-").pop()]
            data.numeric=data.unit=="dimension" || data.unit=="number",
                data.isDimension=data.unit=="dimension" ;
            if(Object.freeze){Object.freeze(data)}

            _infoCache[nm]=data
            _infoCache[data.css]=data
            _infoCache[data.js]=data
        };
        ["rotate","skew","translate"].forEach(function(k){
            _infoCache[k]= $.clone(_infoCache["transform"])
            _infoCache[k].fnname="transform"
        });
        if(!_infoCache["borderRadius"] ){
            _infoCache["borderRadius"]=_infoCache["border-radius"]={ js:"borderRadius",  css:"border-radius",isDimension:true,numeric:true}
        };
        prefixs.forEach(function(k){
            if(!_infoCache[k] ) {
                _infoCache[k] = {js: k, css: k}
            }
        });

    }


    function getInfo(nm0,nullifnot){
        if(!_infoCache){gatherStyles()}
        var nm=String(nm0)
        if(nm in _infoCache){return _infoCache[nm]}
        if((nm=abbr[nm0]) && nm in _infoCache){return _infoCache[nm]}
        if(!nullifnot){nm=nm||nm0
             return {js:nm,  css:nm,unresolved:true}
        }
        return null
    }
    var _slice=Array.prototype.slice
    _css.prep=function(el){var a=_slice.call(arguments,1),memo=a[0];
        if( typeof(memo)!="object"){
            memo={name:a[0],value:a[1],curr:a[2]}
        }
        var info,vtype
        if(!(info=memo.info)){info=memo.info=getInfo(memo.name)}
        memo.name=info.js
        if(!memo.value){return memo}
        vtype=typeof(memo.value)
        if(vtype =="function"){
            memo.value=memo.value.call($d(el),el,getCachedRecord(el,memo.name));
        }
        if(vtype==="string"){
            memo.value=_css.valueabbr[memo.value]||memo.value
            if(memo.value.indexOf("calc(")>=0 ||/\-?[\d\.]+(%|\w+)/.test(memo.value)) {
                return memo
            }
            if(/^\-?[\d\.]+$/.test(memo.value)){
                var value=Number(memo.value)
                if(!isNaN(value)){memo.value=value;vtype="number"}
            }
        }
        if((info.isDimension && vtype=="number")   ){
            if(String(memo.name).indexOf("line")!=0&&memo.value!=0){memo.value=memo.value+"px"}
            return memo
        }
        var c,unit=info.unit,v =memo.value,t=vtype,nm=memo.name;
        if( vtype!="string"|| !info.numeric||CACHES.cssvalueCache[v]===null||v=="-delete-" ||   !/\W/.test(v) ){
            return memo
        }
        var origx=memo.value;
        if(CACHES.cssvalueCache[origx]){
            v=CACHES.cssvalueCache[origx]
        }  else{
            //simple arithmatic anfd relative values - +10 , -10
            if(/^([\/\+\*]|(\- ))\s*([\d\.]+)$/.test(v)){
                var curr=_css.getNum(memo.curr|| $.css(el,nm))
                try {
                    v = (1, eval)(curr + v)
                } catch(e){
                    v=null
                }
                if(v==null){
                    var nm1=nm.charAt(0).toUpperCase()+nm.substr(1),nm2="offset"+nm1;
                    c="Number(String($d.css.getComputed(this)['"+nm+"']).replace(/[^\\d\\.\\-]/g,''))"
                    v=Function( "var el=this,it=this;return "+c+" " + origx)
                }

            }else  {
                if(/^@(\.)?([\w]+)(\([^\)]*\))?$/.test(v) ){
                    v=v.replace(/@(\.)?([\w]+)(\([^\)]*\))?/g,function(a,b,c,d){
                        if(d&&c in el && typeof(el[c])=="function"){
                            if(typeof($d[c])=="function"){
                                var args=d.replace(/^\(|\)$/g,"").split(",")
                                if(args.length){v= el[c].apply(el,args)}
                                else {v= el[c]()}
                            }
                        }
                        else if(c=="value"||c=="val"){v=$d.val(c)}
                        else if(c && _css.isStyle(c)){
                            v= _css.get(el,c)}
                        else{  var el0=el.el||el
                            if(c in el0){v=el0[c]}
                            else {v= el0.getAttribute(c)}
                        }
                        return v
                    })
                }
                if(/[^\w\.\-%]/.test(v)&&!/^\-\d+/.test(v)){
                    v=functionize( v)
                }
            }

        }
        var fn;
        if(v!=null){
            if(typeof(v)=="function"){fn=v;
                try{
                    v= fn.call($d(el),memo.name,memo.curr,memo)
                } catch(e){ fn=null; v= null;
                    CACHES.cssvalueCache[origx]=null}
            }
            if(v!=null){   var v1=v;
                if(info.numeric&&!/%$/.test(v+"")){
                    v=_css.getNum ( v1);v=v==null?v1:v
                    if(String(memo.name).indexOf("line")!=0&&info.isDimension&&!isNaN(v)){v=v+"px"}
                }
                memo.value=v
            }
        }
        if(fn&&typeof(fn)=="function"){
            CACHES.cssvalueCache[origx]=fn;
        }
        return memo;
    }

    _css.getWorkStyleSheet=function(){
        if(!CACHES.workersheet){
            var all=document.querySelectorAll("link[type='text/css']")
            if(all&&all.length){
                CACHES.workersheet=all[all.length-1]
            }
            if(!CACHES.workersheet){
                var style = document.createElement("style");
                style.appendChild(document.createTextNode(""));// WebKit hack :(
                document.head.appendChild(style);
                CACHES.workersheet=style.sheet;
            }
            if(CACHES.workersheet&&CACHES.workersheet.sheet){
                CACHES.workersheet=CACHES.workersheet.sheet
            }
        };

        //CACHES.workersheet.cssRules||(CACHES.workersheet.cssRules=CACHES.workersheet.rules);
        // var r=CACHES.workersheet.cssRuleArray||(CACHES.workersheet.cssRuleArray=[]);
        // r.length=0;
        // [].push.apply(r,$.makeArray(CACHES.workersheet.cssRules));
        return CACHES.workersheet ;
    }
    _css.findRule=function(nm){var ret={}, fn=$.fnize(nm)
        var res=$.makeArray( _queryOne("link[type='text/css']").sheet.cssRules).map(function(it){return it.cssText+""}).filter(function(s){
            return s&&fn(s)
        })
        if(res&&res.length){
            res.forEach(function(k){var arr=k.split("{");
                if(arr.length==2){ret[arr[0].trim()]=arr.join().replace(/\}\s*$/,"").trim()}
            })
        }
        return ret
    }
    _css.removeRule=function(selector,rule){
        var sheet=_css.getWorkStyleSheet();
        if(sheet && sheet.cssRules){
            var m=(sheet.deleteRule||sheet.removeRule).bind(sheet),
                rules=[].filter.call(sheet.cssRules,function(it,i){
                    return (it && it.selectorText&&it.selectorText==selector)? i+1:false}).sort();
            while(rules.length) {
                m(rules.pop()-1)
            }
        }
        delete CACHES.cssruleCache[selector]


    }
    _css.fixUrl=function fixUrl(url) {
        var arr=String(url).split(/\[\/\\]/)
        var parts=location.href.split(/#/).shift().split(/\/\//).pop().split(/\//)
        parts

    }
    _css.addRules=function addRules(selectormap) {
        var id
        if(arguments.length==2&&typeof(arguments[0])=="string"){
            id=arguments[0];selectormap=arguments[1]
        }
        CACHES.cssruleGroupCache=CACHES.cssruleGroupCache||{};

        if(id&& CACHES.cssruleGroupCache[id]){return }
        _css.addRule(selectormap)
        if(id){
            CACHES.cssruleGroupCache[id]=true
        }

    }
    function stringifyrules1(k,v,holder) {
        var val,info=getInfo(k);
        val=_css.valueabbr[v]||v
        if(info&&val!=null){
            if(k.indexOf("line")!=0&&info.isDimension&&!isNaN(String(val))){
                val=val+"px"
            }
            holder&&holder.push(info.css+":"+val)
            return info.css+":"+val
        }
        return holder
    }
    function stringifyrules(rules) {
        var ph=[], allrules=[]
        if(typeof(rules)!="string"){
            if($.isPlain(rules)){
                $.each(rules,function(v,k){ stringifyrules1(k,v,allrules) })
            }

        } else {

            if(rules.indexOf ("(data:")>=0||rules.indexOf ("(data :")>=0) {
                rules=rules.replace (/\((data\s*:[^\)]+)\)/g, function(a, b){
                    return "dataurl" + ph.push (a)
                })
            }
            if(rules.indexOf (";")>0) {
                //_css.abbr,_css.valueabbr _css.ruleabbr
                rules.split(";").map(function(k1){
                    if(_css.ruleabbr[k1]) {
                        k1=_css.ruleabbr[k1]
                    }
                    var arr=String(k1).split(":")
                    if(arr.length>1&&arr[0].trim ()) {
                        stringifyrules1(arr.shift().trim(),arr.shift().trim(),allrules)
                    }
                })
            }else {
                allrules.push (rules)
            }
        }
        var ret=allrules.join(";") +";"
        if(ph.length){ret=ret.replace(/dataurl([\d]+)/g,function(a,b){return ph[Number(b)-1]||""})}
        return ret;
    }
    _css.addRule=function addRule(selector, rules, index) {
        if(!selector){return}
        if(typeof(selector)=="object"){
            if(typeof(rules)=="number"){index=rules}
            if($.isPlain(selector)){
                $.each(selector,function(v,k){
                    addRule(k,v,index)
                })
            }
            return;
        }

        //var sheet=_css.getWorkStyleSheet();


        var nurules=stringifyrules(rules)||""
        selector=String(selector).trim()
        nurules=applyVars(String(nurules)).trim()
        if(!supportsCalc()){
            //checkCalcs(selector,String(nurules))
        }

        if(!nurules||nurules==";"){return}

        if(selector in CACHES.cssruleCache && CACHES.cssruleCache[selector]==nurules){return}
        if(!CACHES.__workersheet){
            var styleEl = document.createElement('style')
            // Append style element to head
            styleEl = document.head.appendChild(styleEl);
            // Grab style sheet
            CACHES.__workersheet= styleEl.sheet;

        }
        var sheet = CACHES.__workersheet;
        try {
            if (!(index && typeof(index) == "number")) {
                index = (sheet.cssRules || []).length
            }
        } catch(e){
            console.log(e)
            index=0;
        }
        if(!index){
            index=0
        }
        try {
            if (sheet.insertRule) {

                sheet.insertRule(selector + "{" + nurules + "}", index || 0);
            }
            else if (sheet.addRule) {
                sheet.addRule(selector, nurules, index || 0);
            } else {
            }
        } catch(e){}
        CACHES.cssruleCache[selector]=nurules
    }
    _css.parse=function(){var mp={},prefix;
        var prefixed=[].filter.call(_css.getComputed(document.body||document.documentElement ),function(it){
            return it[0]=="-"})
            .map(function(it){prefix||(prefix=it.replace(/(-[\w]+-).*/,"$1")); return it.substr(prefix.length)
            });
        qq(document ,"style").forEach(function(s){
            s.textContent.split(/}/).reduce(function(m,it){var arr=it.split(/{/);if(arr.length>1){
                m[arr[0].trim()]=arr[1].trim().split(/;/)
                    .reduce(function(m1,it1){var arr1=it1.split(/:/);if(arr1.length>1){m1[arr1[0].trim()]=arr1[1].trim()}return m1},{});
            }
                return m
            },mp);
        });
        var nu={};
        for(var k in mp){  var mm=mp[k]
            for(var k1 in mm){
                if(prefixed.indexOf(k1)>=0){nu[k]||(nu[k]=[]);nu[k].push(prefix+k1+":" +mm[k1]);}
                else if(mm[k1] && mm[k1].indexOf("gradient")>0){
                    mm[k1].replace(/(.*?)\((.*?)\)$/,function(a,b,c){
                        var arr=c.split(",")
                        arr[0]=arr[0].replace(/to\s+(\w+)/,function(a,b){return b=="top"?"bottom":b=="left"?"right":b=="right"?"left":"top"});
                        nu[k]||(nu[k]=[]);
                        nu[k].push(k1+":" +prefix+b+"("+ arr.join(",") +" )")
                    });
                }

            } }
        for(var k in nu){
            if(nu[k] && nu[k].length){_css.addRule(k,nu[k].join(";"))}
        }

    }
    function getNum(val){
        if(val==null){return null}
        if( typeof(val)=="number"){return val}
        else if( typeof(val)=="string"){
            if( /^\-?[\d\.]+([\w]{2})?$/.test(val)){
                return Number(val.replace(/[^\-\.\d]/g,""))
            }
        } else if(!isNaN(+val)){ return +val;}

        return null

    }
    _css.setVarMap=function(data,calcs){
        if(_css._varmap && Object.keys(_css._varmap).length){
            return
        }
        if(!data ){
            if($.getBootstrapData){
                data=$.getBootstrapData("cssvarmap")
                calcs=$.getBootstrapData("calcmap")
            }
        }

        if(data){
            _css._varmap=$.extend(_css._varmap||{},data)
        }
        if(calcs){
            $.extend(calcMap||{},calcs)
            if(Object.keys(calcMap).length){
                if(!supportsCalc()){
                    $.each(calcMap,function(calcarr,selector){
                        if(calcarr && calcarr.length){
                            while(calcarr.length){
                                var prop=calcarr.shift()
                                var expr=calcarr.shift()
                                if(expr){
                                   /* var fn=parseCalcExpr(prop,expr)
                                    if(fn){
                                         //fn.call(el,calcresolver)
                                    }*/
                                }
                            }
                        }
                    })
                }
            }
        }
    };
    _css.getInfo=getInfo;
    _css.getRecord=getRecord
    _css.getNum=getNum;
    _css.getComputed=_getComputed
    return _css;
}  ;
