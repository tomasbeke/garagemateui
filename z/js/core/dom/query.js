(function(){
    var selectorfn = function(s, lst) {
        if (typeof(s) == "function") {
            return lst.filter(s)
        }
        if (typeof(s) == "number") {
            if (s < 0) {
                s = lst.length + s
            }
            s = Math.min(0, Math.min(s, lst.length - 1))
            return lst.slice(s, s + 1)
        }
        if (typeof(s) == "string") {
            var _is = _dom.is.bind(_dom)
            return lst.filter(function(it) {
                return _is(it, s)
            })
        }
    }
	function _fixSelector(sel) {
        if (/\binput\b/.test(sel) && !/\btextarea\b/.test(sel)&& !/\bselect\b/.test(sel)) {
            sel = [sel, sel.replace(/input/g, "textarea"), sel.replace(/input/g, "select")].join(",")
        }
        if(sel.charAt(0)==">"){
            sel=sel.substr(1)
        }
        if(/#[A-Za-z]/.test(sel)){
            sel=sel.replace(/.*(?=#[^\s]*$)/, '')// strip for ie7
        }

         sel=sel.replace(/\[([^\=]+)\s*\=\s*([^'"][^\]]+)/g, "[$1='$2']")//[data-key=aaa]=>[data-key='aaa']
        return sel.trim()
    }
	
    function fixargs(args) {
        var c, s, a = [].slice.call(arguments[0])
        a = a.filter(function(it) {
            if (it && (it.nodeType || it.isDomWrap)) {
                c = it;
                return false
            }
            return !!it
        });
        if (a.length) {
            if (a.length == 1 && typeof(a[0]) == "object" && a[0].length) {
                return {
                    s: null,
                    e: $.makeArray(a[0]),
                    arr: true
                }
            }

            if (!s && typeof(a[0]) == "string") {
                s = a.shift()
            } else if (!c) {
                c = a.shift()
            }
            if (!s && typeof(a[0]) == "string") {
                s = a.shift()
            } else if (!c) {
                c = a.shift()
            }
        }

        return {
            s: typeof(s) == "string" ? s : null,
            e: $d.toEl(c)
        }
    }
 var _matches = function(el, selector) {
        var documentElement = document.documentElement || document,
            matchesProp = "m oM msM mozM webkitM".split(" ").reduce(function(result, prefix) {
                var propertyName = prefix + "atchesSelector";
                return result || (result = propertyName in documentElement ? propertyName : null);
            }, null);
        var nu = matchesProp ?
            function(e0, sel) {
                var e = $d.toEl(e0);
                if(!sel || !e){return}
                if(typeof(sel)=="function"){
                    return sel($d(e))
                }
                if(typeof(sel)!="string"){return}
                if(_isCustomSelector(sel)) {
                    $d.__zSelector||($d.__zSelector=$.require("zSelector"));
                    if ($d.__zSelector && $d.__zSelector.getEngine) {
                        return $d.__zSelector.getEngine().matches(e, sel)
                    }
                    return e && e[matchesProp] && e[matchesProp](sel)
                }
                return e && e[matchesProp] && e[matchesProp](sel)
            } :
            function(e0, sel) {
                var e = $d.toEl(e0);
                if(!sel || !e){return}
                if(typeof(sel)=="function"){
                    return sel(e)
                }
                return  typeof(sel)=="string" && e.parentNode && [].indexOf.call(e.parentNode.querySelectorAll(sel),e) >= 0
            };
        _matches = nu;
        return nu(el, selector)
    }
    function _matcheList(list,sel,count){
        var res=[], l=list||[],ln= l.length;
        if(count==null || typeof(count)!="number"){count=ln+1}
        for(var i= 0;i<ln;i++){
            if(_matches(l[i],sel)){
                if(res.push(l[i])>= count){break}
            }
        }
        return res;
    }
	function q(el,sel) {
        if(sel==null && el && el.nodeType){return $d(el)}
        if(sel && sel.nodeType){return $d(sel)}

        var m = fixargs(arguments)
        if (!m.s) {
            return null
        }

        return $d(_queryOne(m.s, m.e))
    }

    function _querySel(selector, dom,cnt) {
        var sel = selector,res
        cnt=cnt||999999
        dom=dom || document
        if(typeof(sel)=="string" && sel.indexOf(">")==0){
            sel=sel.substr(1).trim()
            if(!sel){
                return [].slice.call(dom.children,0,cnt)
            }
            res=[]
            var match=_matches,rnng=0;
            [].slice.call(dom.children).every(function(a){
                if(match(a,sel)){
                    if((rnng=res.push(a))>=cnt){return false}
                }
                return true
            });
            return res
        }
        sel = _fixSelector(selector),res
        if (/^[\.#]?[\w\-_]+$/.test(sel) ) {
            var c = sel.charAt(0),
                s = sel
            if (c == "." && dom.getElementsByClassName) {
                res = dom.getElementsByClassName(s.substr(1))
            } else if (c == "#") {
                if(dom===document){
                    res=[document.getElementById(s.substr(1))]
                } else{

                    res= cnt===1?[dom.querySelector(s)]:dom.querySelectorAll(s)
                }

            } else {
                if(cnt===1){
                    res=[dom.querySelector(s)||(dom.querySelector("#"+s))||dom.getElementsByTagName(s)[0]]
                } else{
                    if(/^[a-z]/i.test(s)){
                        res=dom.getElementsByTagName(s)
                        if(!res.length){
                            res=dom===document?[document.getElementById(s)]:dom.querySelectorAll("#"+s)
                        }
                    }
                }
              }

        } else {

            res = cnt===1?[dom.querySelector(sel)]:dom.querySelectorAll(sel)
        }
        if(res && res.length==1 && !res[0]){res=[]}
        if(res && cnt && cnt < res.length ){
            return [].slice.call(res,0,cnt)
        }
        return res||[];
    }
    function _isCustomSelector(selector) {
        return (selector.indexOf(":visible")>=0 || selector.indexOf(" < ")>=0)
    }

    function _doquery(selector, dom,cnt) {
        if(typeof(dom)=="number"){
            cnt=dom;
            dom=null
        }
        dom=dom||document
        cnt=cnt||999999
        var res=[]

        if(_isCustomSelector(selector)){
            if(!$d.__zSelector){
                $d.__zSelector= $.require("zSelector")
            }
            if($d.__zSelector && $d.__zSelector.getEngine){
                res=$d.__zSelector.getEngine().query(selector,dom,cnt)
            }
        } else{
            res=_querySel(selector,dom,cnt)
        }
        if(res){
            if(cnt && cnt < res.length ){
                res= [].slice.call(res,0,cnt)
            }
            if(!Array.isArray(res)){
                res= [].slice.call(res);
            }
        }

        return res||[];
    }
    function _queryOne(sel, dom) {
        return _doquery(sel, dom,1)[0];

    }
     function _qall(selector,par) {
        return _doquery(selector, par);
    }
    $d._doquery=_doquery;
	$.extend($d,{
        matchAll: _matcheList,
		matches :  function(el,sel) {

				return _matches.apply(this, arguments)
			},
		q :  q,
		is :  function(e, chk) {
				if (e == chk) {
					return true
				}
				if (e == document && (chk == "doc" || chk == "root")) {
					return true
				}
				if (e == window && (chk == "win" || chk == "self")) {
					return true
				}
				var el = $d.toEl(e);
				if (!el || !chk) {
					return
				}
				if (el == chk || el == chk.el) {
					return true
				}
				if (typeof(chk) == "string") {
					if (chk == "input") {
						return $d.isFormInput(el)
					}
					return _matches.apply(this, arguments)
				}
				return
			}
	})
	
})();	