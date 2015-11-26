/*
 HTML5 Shiv v3.7.0 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
(function(){"use strict";var e=Object.prototype,t=e.__defineGetter__,n=e.__defineSetter__,r=e.__lookupGetter__,i=e.__lookupSetter__,s=e.hasOwnProperty;if(t&&n&&r&&i){if(!Object.defineProperty){Object.defineProperty=function(e,o,u){if(arguments.length<3){throw new TypeError("Arguments not optional")}o+="";if(s.call(u,"value")){if(!r.call(e,o)&&!i.call(e,o)){e[o]=u.value}if(s.call(u,"get")||s.call(u,"set")){throw new TypeError("Cannot specify an accessor and a value")}}if(!(u.writable&&u.enumerable&&u.configurable)){throw new TypeError("This implementation of Object.defineProperty does not support"+" false for configurable, enumerable, or writable.")}if(u.get){t.call(e,o,u.get)}if(u.set){n.call(e,o,u.set)}return e}}if(!Object.getOwnPropertyDescriptor){Object.getOwnPropertyDescriptor=function(e,t){if(arguments.length<2){throw new TypeError("Arguments not optional.")}t+="";var n={configurable:true,enumerable:true,writable:true},o=r.call(e,t),u=i.call(e,t);if(!s.call(e,t)){return n}if(!o&&!u){n.value=e[t];return n}delete n.writable;n.get=n.set=undefined;if(o){n.get=o}if(u){n.set=u}return n}}if(!Object.defineProperties){Object.defineProperties=function(e,t){var n;for(n in t){if(s.call(t,n)){Object.defineProperty(e,n,t[n])}}}}}
    function fnize(val){return typeof(val)=="function"?val:function(v){return v}.bind(this,val)}
        function getAccessor(){
            if(!("__accesorMap__" in Object(this))){
                this.__accesorMap__ ={set:function(nm,v){this.__val[nm]=fnize.call(this,v)},get:function(nm){return this.__val[nm]()},__val:{}}
                Object.defineProperty(this,"__accesorMap__",{value:{
                         makeGetter:function(nm,val){  return typeof(val)=="function"?val.bind(this,nm):function(k){return this.__accesorMap__.get(k)}.bind(this,nm)} ,
                        makeSetter:function(nm,val){  return typeof(val)=="function"?val.bind(this,nm):function(k,v){this.__accesorMap__.set(k,v)}.bind(this,nm)}
                    },enumerable:false  ,configurable:false
               }) ;
            }
            return this.__accesorMap__
        }
    if(!("__defineGetter__" in Object.prototype)){
        Object.defineProperty(Object.prototype,"__defineGetter__",{value:function(nm,val){return getAccessor.call(this).makeGetter(nm,val)},enumerable:false,configurable:false});
        Object.defineProperty(Object.prototype,"__defineSetter__",{value:function(nm,val){return getAccessor.call(this).makeSetter(nm,val)},enumerable:false,configurable:false});
         }

})();

(function(l,f){function m(){var a=e.elements;return"string"==typeof a?a.split(" "):a}function i(a){var b=n[a[o]];b||(b={},h++,a[o]=h,n[h]=b);return b}function p(a,b,c){b||(b=f);if(g)return b.createElement(a);c||(c=i(b));b=c.cache[a]?c.cache[a].cloneNode():r.test(a)?(c.cache[a]=c.createElem(a)).cloneNode():c.createElem(a);return b.canHaveChildren&&!s.test(a)?c.frag.appendChild(b):b}function t(a,b){if(!b.cache)b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag();
a.createElement=function(c){return!e.shivMethods?b.createElem(c):p(c,a,b)};a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){b.createElem(a);b.frag.createElement(a);return'c("'+a+'")'})+");return n}")(e,b.frag)}function q(a){a||(a=f);var b=i(a);if(e.shivCSS&&!j&&!b.hasCSS){var c,d=a;c=d.createElement("p");d=d.getElementsByTagName("head")[0]||d.documentElement;c.innerHTML="x<style>article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}</style>";
c=d.insertBefore(c.lastChild,d.firstChild);b.hasCSS=!!c}g||t(a,b);return a}var k=l.html5||{},s=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,r=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,j,o="_html5shiv",h=0,n={},g;(function(){try{var a=f.createElement("a");a.innerHTML="<xyz></xyz>";j="hidden"in a;var b;if(!(b=1==a.childNodes.length)){f.createElement("a");var c=f.createDocumentFragment();b="undefined"==typeof c.cloneNode||
"undefined"==typeof c.createDocumentFragment||"undefined"==typeof c.createElement}g=b}catch(d){g=j=!0}})();var e={elements:k.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:"3.7.0",shivCSS:!1!==k.shivCSS,supportsUnknownElements:g,shivMethods:!1!==k.shivMethods,type:"default",shivDocument:q,createElement:p,createDocumentFragment:function(a,b){a||(a=f);
if(g)return a.createDocumentFragment();for(var b=b||i(a),c=b.frag.cloneNode(),d=0,e=m(),h=e.length;d<h;d++)c.createElement(e[d]);return c}};l.html5=e;q(f)})(this,document);
//shims
 //dataset
(function(){
if(!document.documentElement.dataset&&(!Object.getOwnPropertyDescriptor(Element.prototype,"dataset")||!Object.getOwnPropertyDescriptor(Element.prototype,"dataset").get)){var propDescriptor={enumerable:true,get:function(){"use strict";var e,t=this,n,r,i,s,o,u=this.attributes,a=u.length,f=function(e){return e.charAt(1).toUpperCase()},l=function(){return this},c=function(e,t){return typeof t!=="undefined"?this.setAttribute(e,t):this.removeAttribute(e)};
    try{(({})).__defineGetter__("test",function(){});n={}}catch(h){n=document.createElement("div")}
    for(e=0;e<a;e++){o=u[e];if(o&&o.name&&/^data-\w[\w\-]*$/.test(o.name)){r=o.value;i=o.name;s=i.substr(5).replace(/-./g,f);try{Object.defineProperty(n,s,{enumerable:this.enumerable,get:l.bind(r||""),set:c.bind(t,i)})}catch(p){n[s]=r}}}return n}};try{Object.defineProperty(Element.prototype,"dataset",propDescriptor)}catch(e){propDescriptor.enumerable=false;Object.defineProperty(Element.prototype,"dataset",propDescriptor)}};
})();
//Event shim
;(function(){var e=function(){var e,t=3,n=document.createElement("div"),r=n.getElementsByTagName("i");while(n.innerHTML="<!--[if gt IE "+ ++t+"]><i></i><![endif]-->",r[0]);return t>4?t:e}();if(e!==8){return}var t=document.createEventObject().constructor.prototype;Object.defineProperty(t,"bubbles",{get:function(){var e=["select","scroll","click","dblclick","mousedown","mousemove","mouseout","mouseover","mouseup","wheel","textinput","keydown","keypress","keyup"],t=this.type;for(var n=0,r=e.length;n<r;n++){if(t===e[n]){return true}}return false}});Object.defineProperty(t,"defaultPrevented",{get:function(){var e=this.returnValue,t;return!(e===t||e)}});Object.defineProperty(t,"relatedTarget",{get:function(){var e=this.type;if(e==="mouseover"||e==="mouseout"){return e==="mouseover"?this.fromElement:this.toElement}return null}});Object.defineProperty(t,"target",{get:function(){return this.srcElement}});t.preventDefault=function(){this.returnValue=false};t.stopPropagation=function(){this.cancelBubble=true};var n=function(e){return typeof e!=="function"&&typeof e["handleEvent"]==="function"};var r="__eventShim__";var i=function(e,t,i){var s=t;if(n(t)){if(typeof t[r]!=="function"){t[r]=function(e){t["handleEvent"](e)}}s=t[r]}this.attachEvent("on"+e,s)};var s=function(e,t,i){var s=t;if(n(t)){s=t[r]}this.detachEvent("on"+e,s)};HTMLDocument.prototype.addEventListener=i;HTMLDocument.prototype.removeEventListener=s;Element.prototype.addEventListener=i;Element.prototype.removeEventListener=s;window.addEventListener=i;window.removeEventListener=s})();

