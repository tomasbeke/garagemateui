  !function(factory){
       var proto=function proto(s){
           if(s!=null){       //var keys=Object.keys( proto)  ;
               var S=proto
               for(var i= 0,l=Object.keys(S),ln= l.length,k;k=l[i],i<ln;i++){
                   if(typeof(S[k])=="function"&&typeof(s[k])!="function"){s[k]= S[k].bind(S,s)}
               }

           }
       }

      proto.prototype=proto;
      proto.prototype.ex=proto.prototype
      var ex=  proto ;

      var S= factory(proto)
      $.S=proto;//   alert($.S);
      if(typeof(ZModule)!="undefined"){
            ZModule.getWrapper("$.S").resolve(S)
      }
      if(typeof(Data)!="undefined" && Data.TypeInfo){
          var t=Data.TypeInfo.get(String);
          t.category= proto
          t.elementAsArg=true;

          t.category._extender={augment :proto }
      }

}(
        function(S){
var e=S,t=String,
    n=t.prototype.trim,r=t.prototype.trimRight,i=t.prototype.trimLeft,s=function(e){return e*1||0},
    o=function(e,t){if(t<1)return"";var n="";while(t>0)t&1&&(n+=e),t>>=1,e+=e;return n},u=[].slice,
    a=function(e){return e==null?"\\s":e.source?e.source:"["+p.escapeRegExp(e)+"]"},f={lt:"<",gt:">",quot:'"',amp:"&",apos:"'"},l={};for(var c in f)l[f[c]]=c;l["'"]="#39";
var h=function(){function e(e){return Object.prototype.toString.call(e).slice(8,-1).toLowerCase()}var n=o,r=function(){return r.cache.hasOwnProperty(arguments[0])||(r.cache[arguments[0]]=r.parse(arguments[0])),
        r.format.call(null,r.cache[arguments[0]],arguments)};return r.format=function(r,i){var s=1,o=r.length,u="",a,f=[],l,c,p,d,v,m;for(l=0;l<o;l++){u=e(r[l]);
        if(u==="string")f.push(r[l]);else if(u==="array"){p=r[l];if(p[2]){a=i[s];for(c=0;c<p[2].length;c++){if(!a.hasOwnProperty(p[2][c]))throw new Error(h('[_.sprintf] property "%s" does not exist',p[2][c]));a=a[p[2][c]]}}else p[1]?a=i[p[1]]:a=i[s++];if(/[^s]/.test(p[8])&&e(a)!="number")throw new Error(h("[_.sprintf] expecting number but found %s",e(a)));switch(p[8]){case"b":a=a.toString(2);break;case"c":a=t.fromCharCode(a);break;case"d":a=parseInt(a,10);break;case"e":a=p[7]?a.toExponential(p[7]):a.toExponential();break;case"f":a=p[7]?parseFloat(a).toFixed(p[7]):parseFloat(a);break;case"o":a=a.toString(8);break;case"s":a=(a=t(a))&&p[7]?a.substring(0,p[7]):a;break;case"u":a=Math.abs(a);break;case"x":a=a.toString(16);break;case"X":a=a.toString(16).toUpperCase()}a=/[def]/.test(p[8])&&p[3]&&a>=0?"+"+a:a,v=p[4]?p[4]=="0"?"0":p[4].charAt(1):" ",m=p[6]-t(a).length,d=p[6]?n(v,m):"",f.push(p[5]?a+d:d+a)}}return f.join("")},r.cache={},r.parse=function(e){var t=e,n=[],r=[],i=0;while(t){if((n=/^[^\x25]+/.exec(t))!==null)r.push(n[0]);else if((n=/^\x25{2}/.exec(t))!==null)r.push("%");else{if((n=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(t))===null)throw new Error("[_.sprintf] huh?");if(n[2]){i|=1;var s=[],o=n[2],u=[];if((u=/^([a-z_][a-z_\d]*)/i.exec(o))===null)throw new Error("[_.sprintf] huh?");s.push(u[1]);while((o=o.substring(u[0].length))!=="")if((u=/^\.([a-z_][a-z_\d]*)/i.exec(o))!==null)s.push(u[1]);else{if((u=/^\[(\d+)\]/.exec(o))===null)throw new Error("[_.sprintf] huh?");s.push(u[1])}n[2]=s}else i|=2;if(i===3)throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");r.push(n)}t=t.substring(n[0].length)}return r},r
    }() ,
    makeTemplate=function(s){
        var tmplt= $expr.parse(s),values= slice(arguments,1),args={}
        return values.length?tmplt.fn.apply(tmplt,values):tmplt
    }
S.NULLCHAR          =String.fromCharCode(0)
S.repeat            =function repeat(s,n,sep){return s==null?"":Array((n|=0)>0?n:1).join(String(s)+S.NULLCHAR).split(S.NULLCHAR).join(sep==null?"":String(sep))}
S.startsWith        =function startsWith(s,e,t){return s.indexOf(e,t|=0)===t}
S.endsWith          =function endsWith(s,e,t){return s.lastIndexOf(e,t)===(t>=0?t|0:s.length-1)}
S.contains          =function contains(s,e,t){return s.indexOf(e,t|0)!==-1}
S.isBlank           =function isBlank(e){return e==null&&(e=""),/^\s*$/.test(e)}
S.stripTags         =function stripTags(e){return e==null?"":t(e).replace(/<\/?[^>]+>/g,"")}
S.capitalize        =function capitalize(e){return e=e==null?"":t(e),e.charAt(0).toUpperCase()+e.slice(1)}
S.chop              =function chop(e,n){return e==null?[]:(e=t(e),n=~~n,n>0?e.match(new RegExp(".{1,"+n+"}","g")):[e])}
S.clean             =function clean(e){return S.strip(e).replace(/\s+/g," ")}
S.count             =function count(e,n){if(e==null||n==null)return 0;e=t(e),n=t(n);var r=0,i=0,s=n.length;for(;;){i=e.indexOf(n,i);if(i===-1)break;r++,i+=s}return r}
S.chars             =function chars(e){return e==null?[]:t(e).split("")}
S.swapCase          =function swapCase(e){return e==null?"":t(e).replace(/\S/g,function(e){return e===e.toUpperCase()?e.toLowerCase():e.toUpperCase()})}
S.escapeHTML        =function escapeHTML(e){return e==null?"":t(e).replace(/[&<>"']/g,function(e){return"&"+l[e]+";"})}
S.unescapeHTML      =function unescapeHTML(e){return e==null?"":t(e).replace(/\&([^;]+);/g,function(e,n){var r;return Obj.isin(n,f)?f[n]:(r=n.match(/^#x([\da-fA-F]+)$/))?t.fromCharCode(parseInt(r[1],16)):(r=n.match(/^#(\d+)$/))?t.fromCharCode(~~r[1]):e})}
S.escapeRegExp      =function escapeRegExp(e){return e==null?"":t(e).replace(/([.*+?^=!:\${}()|[\]\/\\])/g,"\\$1")}
S.splice            =function splice(e,t,n,r){var i=S.chars(e);return i.splice(~~t,~~n,r),i.join("")}
S.toArray           =function toArray(s){return s.split("")}
S.join              =function join(t){var e=u.call(arguments); return t==null&&(t=""),e.join(t)}
S.reverse			=function reverse(e){return S.chars(e).reverse().join("")}
S.insert            =function insert(e,t,n){return S.splice(e,t,0,n)}
S.include           =function include(e,n){return n===""?!0:e==null?!1:t(e).indexOf(n)!==-1}
S.lines				=function lines(e){return e==null?[]:t(e).split("\n")}

S.startsWith		=function startsWith(e,n){return n===""?!0:e==null||n==null?!1:(e=t(e),n=t(n),e.length>=n.length&&e.slice(0,n.length)===n)}
S.endsWith			=function endsWith(e,n){return n===""?!0:e==null||n==null?!1:(e=t(e),n=t(n),e.length>=n.length&&e.slice(e.length-n.length)===n)}
S.succ				=function succ(e){return e==null?"":(e=t(e),e.slice(0,-1)+t.fromCharCode(e.charCodeAt(e.length-1)+1))}
S.titleize			=function titleize(e){return e==null?"":("_"+e).replace(/[\-_\s]\w/g,function(a){return String(a).toUpperCase().substr(1)}).replace(/([a-z])([A-Z])/g,function(a,b,c){return b+" "+c.toUpperCase()})
}
S.camelize			=function camelize(e){return S.trim(e).replace(/[-_\s]+(.)?/g,function(e,t){return t.toUpperCase()})}
S.underscored		=function underscored(e){return S.trim(e).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase()}
S.dasherize			=function dasherize(e){return S.trim(e).replace(/([A-Z])/g,"-$1").replace(/[-_\s]+/g,"-").toLowerCase()}
S.classify			=function classify(e){return S.titleize(t(e).replace(/_/g," ")).replace(/\s/g,"")}
S.humanize			=function humanize(e){return S.capitalize(S.underscored(e).replace(/_id$/,"").replace(/_/g," "))}
S.trim				=function trim(e,r){return e==null?"":!r&&n?n.call(e):(r=a(r),t(e).replace(new RegExp("^"+r+"+|"+r+"+$","g"),""))}
S.ltrim				=function ltrim(e,n){return e==null?"":!n&&i?i.call(e):(n=a(n),t(e).replace(new RegExp("^"+n+"+"),""))}
S.rtrim				=function rtrim(e,n){return e==null?"":!n&&r?r.call(e):(n=a(n),t(e).replace(new RegExp(n+"+$"),""))}
S.truncate			=function truncate(e,n,r){return e==null?"":(e=t(e),r=r||"...",n=~~n,e.length>n?e.slice(0,n)+r:e)}
S.prune				=function prune(e,n,r){if(e==null)return""; e=t(e),n=~~n,r=r!=null?t(r):"...";if(e.length<=n)return e;var i=function(e){return e.toUpperCase()!==e.toLowerCase()?"A":" "},s=e.slice(0,n+1).replace(/.(?=\W*\w*$)/g,i);return s.slice(s.length-2).match(/\w\w/)?s=s.replace(/\s*\S+$/,""):s=S.rtrim(s.slice(0,s.length-1)),(s+r).length>e.length?e:e.slice(0,s.length)+r}
S.words				=function words(e,t){return S.isBlank(e)?[]:S.trim(e,t).split(t||/\s+/)}
S.pad				=function pad(e,n,r,i){e=e==null?"":t(e),n=~~n;var s=0;r?r.length>1&&(r=r.charAt(0)):r=" ";switch(i){case"right":return s=n-e.length,e+o(r,s);case"both":return s=n-e.length,o(r,Math.ceil(s/2))+e+o(r,Math.floor(s/2));default:return s=n-e.length,o(r,s)+e}}
S.lpad				=function lpad(e,t,n){return S.pad(e,t,n)}
S.rpad				=function rpad(e,t,n){return S.pad(e,t,n,"right")}
S.lrpad				=function lrpad(e,t,n){return S.pad(e,t,n,"both")}
S.sprintf			=h
S.vsprintf			=function vsprintf(e,t){return t.unshift(e),h.apply(null,t)}
S.toNumber			=function toNumber(e,n){if(e==null||e=="")return 0;e=t(e);var r=s(s(e).toFixed(~~n));return r===0&&!e.match(/^0+$/)?Number.NaN:r}
S.toPixels			=function toPixels(e,n){return e?(Number(t(e).replace(/[a-zA-Z]+$/g,""))||0):0}
S.numberFormat		=function numberFormat(e,t,n,r){if(isNaN(e)||e==null)return"";e=e.toFixed(~~t),r=typeof r=="string"?r:",";var i=e.split("."),s=i[0],o=i[1]?(n||".")+i[1]:"";return s.replace(/(\d)(?=(?:\d{3})+$)/g,"$1"+r)+o}
S.strRight			=function strRight(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.indexOf(n):-1;return~r?e.slice(r+n.length,e.length):e}
S.strRightBack		=function strRightBack(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.lastIndexOf(n):-1;return~r?e.slice(r+n.length,e.length):e}
S.strLeft			=function strLeft(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.indexOf(n):-1;return~r?e.slice(0,r):e}
S.strLeftBack		=function strLeftBack(e,t){if(e==null)return"";e+="",t=t!=null?""+t:t;var n=e.lastIndexOf(t);return~n?e.slice(0,n):e}
S.toSentence		=function toSentence(e,t,n,r){t=t||", ",n=n||" and ";var i=e.slice(),s=i.pop();return e.length>2&&r&&(n=S.rtrim(t)+n),i.length?i.join(t)+n+s:s}
S.slugify			=function slugify(e){if(e==null)return"";var n="?àáäâãåæ??èéëêìíïî??òóöôõøùúüûñç??",r="aaaaaaaaceeeeeiiiilnoooooouuuunczz",i=new RegExp(a(n),"g");return e=t(e).toLowerCase().replace(i,function(e){var t=n.indexOf(e);return r.charAt(t)||"-"}),S.dasherize(e.replace(/[^\w\s-]/g,""))}
S.surround			=function surround(e,t){return[t,e,t].join("")}
S.quote				=function quote(e){return S.surround(e,'"')}
S.levenshtein		=function levenshtein(e,n){if(e==null&&n==null)return 0;if(e==null)return t(n).length;if(n==null)return t(e).length;e=t(e),n=t(n);var r=[],i,s;for(var o=0;o<=n.length;o++)for(var u=0;u<=e.length;u++)o&&u?e.charAt(u-1)===n.charAt(o-1)?s=i:s=Math.min(r[u],r[u-1],i)+1:s=o+u,i=r[u],r[u]=s;return r.pop()}
S.strip				=S.trim
S.lstrip			=S.ltrim
S.rstrip			=S.rtrim
S.center			=S.lrpad
S.rjust				=S.lpad
S.ljust				=S.rpad
S.contains			=S.include
S.q					=S.quote

S.lower 			=function lower(str){return String(str).toLowerCase()}
S.upper 			=function upper(str){return String(str).toUpperCase()}
S.evalJSON 			=function evalJSON(str){return JSON.parse(str)}
S.toURI				=function toURI(slf){return $.Url(slf)  }
S.fetch				=function fetch(slf){return S.toURI(slf).get().response.text}
S.toLocal			=function toLocal(slf){return _s(slf)}
S.compare			=function toLocal(slf,s2){return (slf==s2)?0:(Object(slf).valueOf()>Object(s2).valueOf()?1:-1)}
S.toJSON			=function toJSON(str){return $S.quote(str)}
S.EvalX			    =function Evalx(x){return S.EvalMe(s,x)}
S.EvalMe			 =function EvalMe(s){var a=[].slice.call(arguments,1),l=a.length,f=$.Expr.parse(s).fn;
    return !l?f():((l==1)?f(a[0]): f.apply(null,a))
}
S.toExpr			=function toExpr(s){return $.Expr.parse(s)}
S.toFunction		=function toExpr(s){return $.Expr.parse(s).fn}
S.toFn              = S.toFunction

S.toRegExp			=function toRegExp(str,flgs){
    return (Object(str) instanceof RegExp)?str:new RegExp(S.escapeRegExp(String(str)),[].concat(flgs||[]).join(""))}
S.toRe				=S.toRegExp
S.toRegEx			= S.toRegExp

S.toDate			=function toDate(str){return new Date(str)}
S.toNumber			=function toNumber(str){return ~~(str.replace(/[^\s\.]/g,""))||0}
S.toElement			=function toElement(str){return $d(str)}

S.load				=function load(str,pars){return $.xhr.get({url:str,parameters:pars,async:false})}  //assumes its url
S.removeSpecialChars=function removeSpecialChars(str){return ""}
S.translate			=function translate(str){return _s(str)}
S.format			=function format(str,frmt){return str}
S.normalize			=function normalize(str) { return String(str).split(/\s+/).join(" ");}//replace(/^\s*|\s(?=\s)|\s*$/g, "");  }// Replace repeated spaces, newlines and tabs with a single sp
S.isEmpty			=function isEmpty(str){ return !(""+str).strip().length }
S.quote				=function quote(s){var _=extns; return s? _.surround( _.escape( _.unquote(s))):"" }
S.unquote			=function unquote(s){return s?s.replace(/^(['"])(.*)\1$/g,"$2"):""}
S.padLeft			=function padLeft(str,wth,ln) { ln=ln||0 ;return (str.length>=ln?"":Array(ln-(str.length-1)).join(wth||" "))+str;}
S.padRight			=function padRight(str,wth,ln) { ln=ln||0 ;return str+(str.length>=ln?"":Array(ln-(str.length-1)).join(wth||" "));}
S.entityify			=function entityify(s) {s=s+"";  return s.replace(/&/g, "&amp;").replace(/</g,"&lt;").replace(/>/g, "&gt;"); }
S.at				=function at(str,idx){return str.charAt(~~idx||0)}

S.appendTo			=function appendTo(slf,obj){var mthd=(obj.append||obj.push||obj.concat||obj.add);mthd && mthd.call(obj,String(slf));return this}
S.append			=function append(slf,s2){return String.prototype.concat(slf,String(s2))}
S.add				=S.append
S.grep			    =function grep(s,s2,flgs){return s.match(S.toRe(s2,flgs))||[]}
S.withOut			=function withOut(s,s2,flgs){return s.replace(S.toRe(s2,flgs),"")}
S.minus				=S.withOut
S.Eval              =function(s){return $.globalEval(s)}
S.isJSON            =function(s){return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(String(s).replace(/"(\\.|[^"\\])*"/g, '')))}
S.visualLength		=function visualLength(str ,css){if(!str ){return 0}
    var d= String.__workerdom
    if(!d){
        d=String.__workerdom=document.body.appendChild(document.createElement("span"))
        d.style.cssText="visibility:visible;z-index:-1;width:auto;white-sp:nowrap;padding:0;margin:0;position:absolute;height:auto:top:-50px;"
        d.style.display="none"
    }
    if(css){var curr=d.style.cssText;d.style.cssText=d.style.cssText+css;css=curr}
    d.style.display="";	d.innerHTML=String(str)
    var ln=d.scrollWidth
    d.innerHTML="";
    if(css){d.style.cssText=css}
    d.style.display="none"
    return ln||0
}
S.escape=function escape(s){
    var c, i, l = s.length, q=single?"'":'"',o = "", escprfx='\\';
    for (i = 0; i < l; i += 1) {
        c = s.charAt(i);
        if (c >= ' ') { if (c == '\\' || c == q) {   o += '\\'; }
            o += c;
        } else {
            if(c=='\b'||c=='\f'||c=='\n'||c=='\r'||c=='\t'){o += escprfx+c}
            else {   c = c.charCodeAt();  o += '\\u00' + Math.floor(c / 16).toString(16) +(c % 16).toString(16);  }
        }
    }
    return o
}
//multilevel
S.toMap=      function (s,pairdelim,valuedelim){var re= S.Re(valuedelim);s.split(S.toRe(pairdelim)).collectMapEntries(function(it){return it.split(re)})}
S.tokenize=      (function (s){
    var escapeRegExp      =function escapeRegExp(e){return e==null?"":String(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")},
        Re=function(e,f){return new RegExp(escapeRegExp(e),f)}
    var _inner=function _inner(s,a){
        return a.length?s.split(a.shift()).map(function(it){return a.length?_inner(it, a.slice(0)):it}):s
    }
    return function tokenize(s){
        var a=[].slice.call(arguments,1).filter(function(it){return typeOf(it)=="string"}).map(function(it){return  Re(it)}),tks=[];
        if(!a.length){return s.split(/\s/)}
        return _inner(s,a)
    }
})();
S.occurrencesOf=      function(str,nm){return S.occurrences(str)[nm]}
S.maxOccurrence=      function(str){return $.collect(S.occurrences(str),function(v,k){return [v,k]}).sort(function(a,b){return b[0]-a[0]}).shift().pop()}
S.occurrences=      function(str){ return String(str).split("").frequency() }
S.inflect= function inflect(s,suffix) {var _self=s;
    var index = _self.indexOf(' ');
    if (index >= 0)
        return _self.slice(0, index).inflect(suffix) + _self.slice(index);
    // pos == 'v', or vp has single word
    var vowels = "aeiou",
        inflections = {'ed': {'set': 'set'}},
        key = _self.toLowerCase(),
        value = (inflections[suffix]||{})[key];
    if (!value) {
        value = key;
        var lastChar = key.charAt(key.length-1);
        //info(0, key);
        switch (lastChar) {
            case 'y':
                if (suffix == 'ed')
                    value = value.slice(0, value.length-1) + 'i';
                break;
            case 'e':
                value = value.slice(0, value.length-1);
                break;
        }
        if (key == value &&
            // CVC -> VCVV
            vowels.indexOf(value.charAt(value.length-1)) < 0 &&
            vowels.indexOf(value.charAt(value.length-2)) >= 0 &&
            vowels.indexOf(value.charAt(value.length-3)) < 0)
            value += value.charAt(value.length-1);
        value += suffix;
    }
    // TODO: capitalize
    return value;
}
S.$$        =function $$(str){  if(typeof(arguments[1])=="function"){}
    if(/(^|[^\w\$\{])\$(\{|[\w])/.test(trim(str))){return  makeTemplate.apply(null,arguments)} else {return str}}
S.pad       =function pad(str,val,ln){return ln>0?this.padRight(str,val,ln):this.padRight(str,val,ln*-1)}

S.hashCode=function hashCode(str){
    return (function _hashCode(s){
        var res = Number.MIN_VALUE
        for (var i = 0,  len = s.length; i < len; i++) {
            var res1 = res  * 3 + s.charCodeAt(i); // or hash = ((hash<<5)-hash)+str.charCodeAt(i);hash &= hash; // Convert to 32bit integer
            var res1 = res  + (3 * s.charCodeAt(i));
            if(Infinity===res1){
                res=res+"."+_hashCode(s.substr(i+1))
                break;
            }  else {res =res1}

        }

        return res
    })(str)

//tokenize--------------------------------------------
//  Adapted from Douglas Crockford's tokens.js
//----------------------------------------------------
// Produce an array of simple token objects from a string.
// A simple token object contains these members:
//      type: 'name', 'string', 'number', 'operator'
//      value: string or number value of the token
//      from: index of first character of the token
//      to: index of the last character + 1

// Comments of the // type are ignored.
// Operators are by default single characters. Multicharacter
// operators can be made by supplying a string of prefix and
// suffix characters.
// characters. For example,
//      '<>+-&', '=>&:'
// will match any of these:
//      <=  >>  >>>  <>  >=  +: -: &: &&: &&

S.tokens=function(string,prefix,suffix){var i;var s,t=string,n=prefix,r=suffix;var o=0;var u=t.length;var a;var f;var l;var c=[],currenttoken;
    function copytoken(t){return {type:t.type,value:t.value,from:t.from,to:t.to}}
    c.errors=[]
    var h=function(msg,token){c.errors.push({msg:msg,token:copytoken(token)})}            //throw new SyntaxError(msg+":\n"+JSON.stringify(token))
    var p=function(e,t){var nu={type:e,value:t,from:s,to:o,prev:currenttoken,index:c.length}
        return currenttoken=nu
    };
    if(!t){return}if(typeof n!=="string"){n="?<>+-&"}if(typeof r!=="string"){r="|:.=>&:"}i=t.charAt(o);while(i){s=o;if(i<=" "){o+=1;i=t.charAt(o)}else if(i>="a"&&i<="z"||i>="A"&&i<="Z"){l=i;o+=1;for(;;){i=t.charAt(o);if(i>="a"&&i<="z"||i>="A"&&i<="Z"||i>="0"&&i<="9"||i==="_"){l+=i;o+=1}else{break}}c.push(p("name",l))}else if(i>="0"&&i<="9"){l=i;o+=1;for(;;){i=t.charAt(o);if(i<"0"||i>"9"){break}o+=1;l+=i}if(i==="."){o+=1;l+=i;for(;;){i=t.charAt(o);if(i<"0"||i>"9"){break}o+=1;l+=i}}if(i==="e"||i==="E"){o+=1;l+=i;i=t.charAt(o);if(i==="-"||i==="+"){o+=1;l+=i;i=t.charAt(o)}if(i<"0"||i>"9"){h(p("number",l),"Bad exponent")}do{o+=1;l+=i;i=t.charAt(o)}while(i>="0"&&i<="9")}if(i>="a"&&i<="z"){l+=i;o+=1;h(p("number",l),"Bad number")}a=+l;if(isFinite(a)){c.push(p("number",a))}else{h(p("number",l),"Bad number")}}else if(i==="'"||i==='"'){l="";f=i;o+=1;for(;;){i=t.charAt(o);if(i<" "){h(p("string",l),(i==="\n"||i==="\r"||i===""?"Unterminated string.":"Control character in string.",p("",l)))}if(i===f){break}if(i==="\\"){o+=1;if(o>=u){h(p("string",l),"Unterminated string")}i=t.charAt(o);switch(i){case"b":i="\b";break;case"f":i="\f";break;case"n":i="\n";break;case"r":i="\r";break;case"t":i="	";break;case"u":if(o>=u){h(p("string",l),"Unterminated string")}i=parseInt(t.substr(o+1,4),16);if(!isFinite(i)||i<0){h(p("string",l),"Unterminated string")}i=String.fromCharCode(i);o+=4;break}}l+=i;o+=1}o+=1;c.push(p("string",l));i=t.charAt(o)}else if(i==="/"&&t.charAt(o+1)==="/"){o+=1;for(;;){i=t.charAt(o);if(i==="\n"||i==="\r"||i===""){break}o+=1}}else if(n.indexOf(i)>=0){l=i;o+=1;while(true){i=t.charAt(o);if(o>=u||r.indexOf(i)<0){break}l+=i;o+=1}c.push(p("operator",l))}else{o+=1;c.push(p("operator",i));i=t.charAt(o)}}c.iterator=function(){var e=function(t){if(t==null){return}if(/whitespace/i.test(t)){t=/\s+/}var n,r;if(typeof (t.valueOf?t.valueOf():t)!="object"){r=new RegExp("^"+String(t.valueOf())+"$")}else{if(t.constructor==RegExp){r=t}else if(typeof t=="function"){n=t}}if(r){n=Function.prototype.call.bind(RegExp.prototype.test,t)}return n};var t=function(t){var n=t.slice(),r=-1,i=n.length,s={};n.forEach(function(e,t){e.idx=t;e.blockidx=0});Object.defineProperties(s,{blockidx:{get:function(){return this.current.blockidx},set:function(){},enumerable:true},from:{get:function(){return this.current.from},set:function(){},enumerable:true},idx:{get:function(){return this.current.idx},set:function(e){this.current.idx=e},enumerable:true},to:{get:function(){return this.current.to},set:function(e){this.current.to=e},enumerable:true},type:{get:function(){return this.current.type},set:function(e){this.current.type=e},enumerable:true},value:{get:function(){return this.current.value},set:function(e){this.current.value=e},enumerable:true},toString:{value:function(){return JSON.stringify(this.current)}},hasNext:{get:function(){return r<i-1},set:function(){}},current:{get:function(){return n[r]||{}},set:function(){}},next:{get:function(){if(r>=i-1){return null}return n[++r]},set:function(){}},peek:{value:function(e){e=e||1;var t=e+r;if(t>=0&&t<=i-1){return n[t]}}},peekSafe:{value:function(e){return this.peek(e)||{}}},prior:{get:function(){if(r<=0){return null}return n[--r]},set:function(){}},advanceby:{value:function(e){e=e||1;var t=e+r;if(t>=0&&t<=i-1){return n[t]}}},skip:{value:function(t){if(t==null){return}var i=-1,s=e(t),o=0,u=n.length-1;while(!re.test(this.peekSafe(++o))&&o<u){r=r+o;break}return this.current}},until:{value:function(t){var n=e(t);while(!n(this.peekSafe(++o))&&o<i){r=r+o;break}}},each:function(e){n.forEach(e);return this},map:function(e){return n.map(e)},filter:function(e){n=n.filter(e);i=n.length;n.slice().reverse().forEach(function(t,r){if(!e(t,r)){n.splice(n.length-(r+1),1)}});i=n.length;return this}});return s};return t(this)};
    return c
}

/*Object.keys( S).filter(function(it){return typeof( S[it])=="function"}).map(function(it){return "this."+it+"=EX."+it+".curry(_slf);\n"})  +
"}";   var XTNDR=eval("(function XTNDR(){var _slf=new String(this),EX=$S;\n"  +
    Object.keys($S).filter(function(it){return typeof($S[it])=="function"&&!(it=="tokens" || it=="augment"||it=="inflect")})
        .map(function(it){return "_slf."+it+"="+$S[it].toString().replace(/\(([^\)]*?)\)\s*\{/,rpl )  }).join(";\n")  +   "\nreturn _slf;})"

);*/


    return a
}

function ctor(s){
    for(var i= 0,l=Object.keys(S),ln= l.length,k;k=l[i],i<ln;i++){
        if(typeof(S[k])=="function"){s[k]= S[k].bind(S,s)}
    }
}
var rpl= function(a,b){
    var arr=b.split(/,/),nm=arr.shift(); return "("+arr.join(",")+"){var "+nm+"=this; "};



//native ext
/* "capitalize words $$ titleize toURI toRe toElement format toNumber isBlank empty startsWith endsWith has contains".split(/\s+/).forEach(function(it){
 String.prototype[it] || (  String.prototype[it]=(function(k,mthd){
 var m=Function.apply.bind(mthd,null);
 return function(){
 return m([this].concat([].slice.call(arguments)))
 }})(it,S[it])   );
 })*/
      var STRING=String
STRING.prototype.trim  || ( STRING.prototype.trim =function(){ return this.replace(/^\s+|\s+$/g,"") }   );
STRING.prototype.strip || ( STRING.prototype.strip=function(){ return this.trim()}  );
STRING.prototype.$$$        =function $$$(){
    if(arguments.length && typeof(arguments[0])=="function") {
        return this.$$$_.apply(this,arguments)
    }
    return this.$$.apply(this,arguments)
}
            S.$$$_  =function $$$_(){
    var cfnv ,str=this,fnidx=0
    var cfn= arguments[fnidx],ctx=null ,mthds=[]
    if(arguments.length>fnidx && typeof(arguments[fnidx])=="function"){cfn=arguments[fnidx]}
    ;cfn=cfn||function(ctx,expr){
        var __res ;
        //if(typeof(expr)=="function" && ctx[expr.name]){with(ctx){ctx[expr.name]()}
        with(ctx){var out=ctx.out;__res= eval(expr) };if(ctx.out && ctx.out.length){__res=ctx.out.slice();ctx.out=[];}
        return (__res && typeof(__res)!="string" && ("join" in Object(__res)))?__res.join(""):String(__res==null?"":String(__res))

    }

    var   x0 =String.fromCharCode(0) ,_wrp=function(a){return  x0+a+ x0},reExpr=/\$([\w]+)?{([^{]*)\}/g,reVar=/\$([\w\._]+)/g,reEmbedchk =/\${([^\}]*){([^\}]*)}/g

    //remove embedded
    var lkup=[],reRestore=new RegExp(x0+"([\d]+)","g"),mthds=[],listnames=[]
    while(reEmbedchk.test(str)){str=str.replace(reEmbedchk,function(a,b,c,d){var pre="${";return pre+b+ (x0 +lkup.push("{"+c+"}"))})};
    var nu1=str.replace(reExpr,function(a,a1,b){
        if(a1){
            var ar=b.split(/->/),bdy=ar.pop();
            if(bdy.indexOf("return")==-1){
                var last=bdy.split(/\n;/).pop();bdy=bdy.substr(0,bdy.length-last.length)+";\nreturn "+last;
            }
            //var out=[];
            bdy=bdy.replace(/out\s*<<(.*?)(\n|;|$)/g,function(a,b,c){return "out.push("+b+")"+c})
            var nm="fn"+(+Date.now()),m="(function "+nm+"(it){"+bdy+"})";//out.length=0
            var list=(ar[0]||"list");listnames.push(list);if(a1=="each"||a1=="forEach"){a1="map"}
            mthds.push([nm,m]);
            b=list+"."+((a1 in Array.prototype)?a1:"map")+"(" +nm+")"
        }
        return _wrp(b.replace(reRestore,function(a,b){return lkup[Number(b)]}).
            replace(reVar,function(a,b){return _wrp(b)}))});
    nu1=nu1.replace(reVar,function(a,b){return _wrp(b)});
    var fn= function(){
        var __a=[].slice.call(arguments),ctx=null
        if(__a.length ){
            ctx=Object.create(null)
            var vars=nu1.split(x0).filter(function(it,i){return (i%2)==0}).map(String)
            vars.push.apply(vars,listnames)
            if(__a.length==1 && __a[0] && Object(__a[0])===__a[0]){
                ctx=__a[0]
            } else {
                vars.forEach(function(it){if(__a.length ){ctx[it]=__a.shift()}})
            }
            ctx.out=[];ctx.each= $.each;ctx.map= $.collect;ctx.collect= $.collect;var out=ctx.out
            mthds.forEach(function(it){with(ctx){ctx[it[0]]=eval(it[1])}})

            return nu1.split(x0).map(function(it,i){return (((i+1)%2)==0)?cfn(ctx,it):it}).join('')
        }

        return nu1.split(x0).map(function(it,i){return (((i+1)%2)==0)?cfn(it):it}).join('')
    }
    fn._expr=nu1.split(x0)
    return fn;  }

       return S;
} );