/**
 * Created by Atul on 5/20/2015.
 */
function toJson(obj0, options) {    //+ ":"+(v.isMethod?"Function":"Property")+"|"+(v.own?"":" inherited")+"|"
    var obj = obj0;
    if(!$.isPlain(options)){
        if(options===true){options={extended:true}}
        else if(typeof(options)==="function"){options={resolver:options}}
        else{options={}}
    }
    var isplain=$.isPlain,repeatcheck=[],repeatcheckres=[],cnt= 0,resolvefn,isdom= 0,domdefs={
        "spellcheck":true,"tabIndex":-1,"translate":true,"contentEditable":"inherit"
    }
    var resolver=function(){
        return function resolve(k,obj,first){
            if(k&&isNaN(k)){
                var klc=String(k).toLowerCase();
                if(!isdom && obj && obj.nodeType>0){isdom=1}
                if(isdom &&(klc.indexOf("parent")>=0 || k=="childNodes" || k=="cssRules" ||k=="classList" || k=="nextElementSibling" || k=="lastChild" || k=="firstChild" || k=="lastElementChild" || k=="firstElementChild" || k=="previousElementSibling" || k=="nextSibling" || k=="previousSibling" || klc.indexOf("html")>=0||(klc.indexOf("text")>=0)||klc.indexOf("owner")>=0||klc=="namespaceuri"||klc=="baseuri"||klc=="nodename"||klc=="localname"||
                    (domdefs[k]&&domdefs[k]==obj))){
                    return undefined
                }
            }

            if(!(obj&&typeof(obj)=="object")){
                return obj||undefined
            }
            //if(first!==true && obj.id){return obj.id}
            var idx=repeatcheck.indexOf(obj), re;
            if(idx>=0){
                //console.log("repeat",k,obj.id)
                return obj.id||obj.nodeName||obj.nodeType||undefined
            }
            if(first!==true) {
                repeatcheck.push(obj)
            }
            if (typeof(obj.toMap)=="function"){
                re= obj.toMap()
            } else if (obj.properties&&typeof(obj.properties.toMap)=="function"){
                re= obj.properties.toMap()
                //} else if ( typeof(obj.toJSON)=="function"){
                //     re= JSON.parse(obj.toJSON())
                // } else if ( typeof(obj.toJson)=="function"){
                //     re= JSON.parse(obj.toJson())
                //}else if (obj.properties&&typeof(obj.properties.toJSON)=="function"){
                //    re= JSON.parse(obj.properties.toJSON())
            }else  if(options.resolver){
                re=options.resolver(k,obj)
            } else if(options.serializefunctions){
                var isarr=Array.isArray(obj),nu=isarr?[]:{}
                for(var i= 0,l=Object.keys(obj),ln=l.length,it;it=l[i],i<l.length;i++){
                    if( typeof(obj[it])=="function"){
                        nu[it]=obj[it].toString()
                    }  else{
                        nu[it]=obj[it]
                    }
                }
                re= nu;
            } else{
                if(obj.nodeType && obj.nodeType==3){re=String(obj.textContent||"").trim()?{nodeType:3,nodeValue:obj.textContent}:undefined}
                else if(isdom&& k=="style" && obj.nodeType==1){
                    re = {}
                    for (var i=0,l=obj.style||[],ln=l.length;i<ln;i++){
                        re[l[i]]= l[l[i]]
                    }
                } else if(isdom&& k=="attributes"  ){re={}
                    var cnt=0
                    for(var i=0,ln=obj.length||0;i<ln;i++){  var k=obj[i].name;if(!(k=="className"||k=="class"||k=="style"||k.indexOf("data-")==0)){
                        re[k]=obj[i].value;cnt++
                    }};
                    if(!cnt){re=undefined;}
                }
                else if((Array.isArray(obj)||typeof(obj.length)=="number") && obj.length===0){return undefined}
                else if(obj.length>0 && ("0" in obj)){
                    if(isdom&& k=="style" && obj.nodeType==1){
                        re = {}
                        for (var i=0,l=obj.style||[],ln=l.length;i<ln;i++){
                            re[l[i]]= l[l[i]]
                        }
                    } else {
                        var ret = [].slice.call(obj)
                        if (ret && ret.length === obj.length && ret[0] === obj[0]) {
                            //console.log(obj.length,ret.length,k,typeof(obj.valueOf()))
                            re = ret
                        } else {
                            re = obj
                        }
                    }
                } else{
                    if(isdom&& k=="dataset" && !Object.keys(obj).length){return undefined}
                    re=obj
                }

            }
            if(re!=null ){
                //repeatcheckres[idx]=re
            }
            return re==null?undefined:re
        }
    }
    resolvefn=resolver()
    var r=resolvefn("",obj,true)
    if(!(r&&typeof(r)=="object")){
        try {
            return String(obj)
        } catch(e){
            return undefined
        }
    }
    if(repeatcheck[0]===obj){repeatcheck.shift()}
    var fin
    try {
        fin=JSON.stringify(obj,resolvefn,options.indent);
    } catch(e){console.log(e)
        return undefined
    }

    while(repeatcheck.length){
        repeatcheck[0]=null;repeatcheck.shift();
    }
    return fin;
}