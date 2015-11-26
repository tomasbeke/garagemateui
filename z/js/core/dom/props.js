(function() {
    var CACHES = {
        fnCache: Object.create(null),
        cssvalueCache: Object.create(null),
        cssruleCache: Object.create(null),
        cssruleGroupCache: Object.create(null)
        //elCache: new WeakMap()
    }



    var _css = $.__css($d, CACHES)
    var _klass = (function() {
        var opmap = {

            addClass: "a",
            removeClass: "r",
            hasClass: "h",
            "Klass": "t",
            "toggleClass": "t",
            "+": "a",
            "-": "r"
        }
        function _proc(op,args){
            var res = null,
                el, klss
            if(op=="t" && typeof(args[args.length-1])=="boolean"){
                op=args.pop()?"a":"r"
            }
            var elem = $d(args.shift()), CL,flag,ln
            if(typeof(args[args.length-1])=="boolean"){
                flag=args.pop()
            }
            klss = args.length <= 1 ? args[0] : args
            if(!(elem &&  (el=elem.el) &&  (CL=elem.el.classList))){return}
            if (!op) {
                return [].slice.call(CL);
            }

            if(typeof(klss)=="function"){
                klss=klss.call(elem,elem)
            }
            if(typeof(klss)=="string"){
                klss=klss.split(/\s+/)
            }

            ln=klss.length;

            if (op == "r" && klss && typeof(klss) == "object" && (klss instanceof RegExp)) {
                [].slice.call(CL).forEach(function(a){klss.test(a) && CL.remove(a)})
            }
            if(Array.isArray(klss) && ln) {
                if (op == "a") {
                    for (var i = 0; i < ln; i++) {
                        CL.add(klss[i])
                    }
                } else if (op == "r") {
                    for (var i = 0; i < ln; i++) {
                        var kls = klss[i];
                        if (typeof(kls) == "string") {
                            CL.remove(kls)
                        } else if (kls && typeof(kls) == "object" && (kls instanceof RegExp)) {
                            [].slice.call(CL).forEach(function (a) {
                                kls.test(a) && CL.remove(a)
                            })
                        }
                    }

                } else if (op == "h") {
                    var  contains = true;
                    for (var i = 0; i < ln; i++) {
                        if (!CL.contains(klss[i])) {
                            contains = false;
                        }
                    }
                    return contains
                } else if (op == "t") {
                    for (var i = 0; i < ln; i++) {
                        if(flag==null){CL.toggle(klss[i])}
                        flag?CL.add(klss[i]):CL.remove(klss[i])

                    }

                }
            }
            return elem;
        }
        function toret(){
            return _proc("",[].slice.call(arguments))
        }
        toret.add=function(){
            return _proc("a",[].slice.call(arguments))
        }
        toret.remove=function(){
            return _proc("r",[].slice.call(arguments))
        }
        toret.toggle=function(){
            return _proc("t",[].slice.call(arguments))
        }
        toret.has=function(){
            return _proc("h",[].slice.call(arguments))
        }
        return toret
    })();

    var _prop = (function() {
        var _aliasMap = {
                value: "val",
                "style": "css"
            },
            _pending = [],
            inbatch = 0
        var _mutators = [],
            booleans=["appear","disappear","visible","readonly","disabled","checked","visibility","hidden","focus","selected"];
        var map= null,inloop= 0,
            _nameMap={
                readonly:"readOnly"
            },
            _html= function(el) {
                var a1 = arguments[1],
                    outer = a1 === true,
                    toadd = (a1 == null || typeof(a1) === "boolean") ? null:a1
                if (toadd != null) {
                    if (toadd == ".") {
                    }
                    el.innerHTML = String(toadd)
                } else {
                    var ret
                    if (outer) {
                        if ("outerHTML" in el) {
                            ret = el.outerHTML
                        } else {
                            if (el.parentNode && el.parentNode.childElementCount == 1) {
                                ret = el.parentNode.innerHTML
                            } else {
                                var d = document.createElement("div")
                                ret = d.appendChild(el.cloneNode(true))
                                ret = d.innerHTML
                                d.innerHTML = ""

                            }
                        }
                    } else {
                        ret = el.innerHTML
                    }
                    return ret;
                }

                return el
            },
            _toBoolean=function(val) {
                if (val && !(val == "0" || val == "false")) {
                    return true
                }
                return false
            }
            ,
            _isUndef=function(val){
                return val==undefined
            },
            _domAttr=function(el,nm,val){
                if(el && el.getAttribute){
                     if(val===null || val=="-delete-"){
                        el.removeAttribute?el.removeAttribute(nm):el.setAttribute(nm,null);
                    }
                    else if(!_isUndef(val)){
                         el.setAttribute(nm,val)
                    } else{
                         if($.isPlain(nm)){
                             $.each(nm,function(v,k){
                                 el.setAttribute(k,v)
                             });
                             return el;
                         }
                        return el.getAttribute(nm)
                    }
                }
                return el;
            },
            _val=function(el ,val){
                var origval=val,type=String(el.type||"").toLowerCase(),tagName=String(el.tagName).toLowerCase(),
                    isip=((type||tagName.indexOf("select")==0 || tagName=="textarea") && ("value" in el) && tagName!="button" && type !="button"&& type !="img")
                if( val && typeof(val)=="object"){
                    if(val instanceof Date ){
                        if(val.getFullYear()<1971 && val.toLocaleTimeString){
                            val=val.toLocaleTimeString()
                        } else if(!val.getMinutes() && (val.getHours()==12 || !val.getHours()) && val.toLocaleDateString){
                            val=val.toLocaleDateString()
                        } else{
                            val=val.toLocaleString?val.toLocaleString():val.toString();
                        }

                    } else if(val.hasOwnProperty("toString")){
                        val=val.toString()
                    } else{
                        if(val.label!=null){
                            val=val.label
                        } else if(val.value!=null){
                            val=val.value
                        } else if(val.newValue!=null){
                            val=val.newValue
                        } else  {
                            val=JSON.stringify(val)
                        }
                    }
                }
                if(isip){
                    var isDate=(type.indexOf("date")>=0 || type.indexOf("time")>=0)
                    if(_isUndef(val)){
                        if( tagName.indexOf("select") == 0){
                            return  el.selectedIndex >= 0 ? ( el.options[ el.selectedIndex] || {}).value : null
                        }
                        if(el.type=="checkbox" || el.type=="radio" ){
                            //if(el.value && el.checked){return el.value}
                            return !!el.checked
                        }
                        if(isDate && el.valueAsDate){
                            return el.valueAsDate;
                        } else if(type.indexOf("number")>=0 && el.valueAsNumber !=null){
                            return el.valueAsNumber;
                        }
                        return el.value;
                    }
                    else {
                        var cntu=true
                        if(val==null){
                             if(el.type=="checkbox" || el.type=="radio" ){
                                el.checked=false
                            } else{el.value="";}
                            cntu=false
                        }

                        if(cntu && isDate && origval    ){
                            var dt=origval instanceof Date?origval: $.date(origval)
                            if(dt && dt.toNative){
                                dt=dt.toNative()
                            }
                            if(dt && ("valueAsDate" in el)) {
                                el.valueAsDate = dt;
                                cntu=false
                            }
                        }

                        if(cntu){
                            if( tagName.toLowerCase().indexOf("select") == 0){
                                 var  opts=el.options||[],selIndex=-1
                                for(var i= 0,ln=opts.length;i<ln;i++){var value=opts[i].value;if(value==null){value=""}
                                    if(value==val || opts[i].text==val){selIndex=i;break;}
                                }
                                if(selIndex>=0 && selIndex!=el.selectedIndex){
                                    el.selectedIndex=selIndex;
                                 }
                            } else  {
                                if(el.type=="checkbox" || el.type=="radio" ){
                                    if(el.value!=null && el.value==val){val=true}
                                     el.checked=_toBoolean(val);
                                }
                                else{
                                    el.value=val;
                                }
                            }

                        }

                    }
                } else {
                    if( type=="img" || tagName=="img"){
                        if(!val){
                            return el.src
                        }
                        if(val && val!==el.getAttribute("src") && val!=el.src) {
                            el.src = val;
                        }
                    } else {
                        if(_isUndef(val)){
                            return el.childElementCount?el.innerHTML:el.textContent
                        }
                        if(val==null){val=""}
                        if(typeof(val)=="string" && val.indexOf("<")==0){
                            el.innerHTML=val
                        } else{
                            el.textContent=val
                        }

                    }
                }
                return el;
            },
            _data=function(el,nm,val){
                if(!el.dataset){return}
                if(typeof(nm)=="string"){
                    if(nm.indexOf("data-")==0){nm=data.substr("data-".length)}
                    if(_isUndef(val)){
                        return el.dataset[nm];
                    }
                    else{
                        el.dataset[nm]=val;
                    }
                }
                return el;
            }
        return function prop(e , name) {
            var el ,a = [].slice.call(arguments);
            if(e && e.nodeType && e.nodeType===3){e= e.parentNode}
            if ( e && !e.nodeType && (Array.isArray(e) || (typeof(e) == "object"   && ("length" in e)))) {
                var res = []
                a.shift()
                for (var i = 0, l = e, ln = l.length; i < ln; i++) {
                    res.push(prop.apply(this, [l[i]].concat(a)))
                }
                return res;
            }
            el=$d.toEl(e)
            if (!el ) {
                return
            }
            var D = $d
            if (!el) {
                return
            }
            inloop=1
            if(map===null){
                map={
                    "klass":_klass,"class":_klass,"className":_klass,"classname":_klass,
                    "addclass":_klass.add,"removeclass":_klass.remove,"toggleclass":_klass.toggle,"hasclass":_klass.has,
                    "css":_css,"style":_css,"styles":_css,
                    "val":_val,"text":_val,"value":_val,
                    "attr":_domAttr,
                    "data":_data,
                    html:_html
                }
            }

            var mthd  ,
                val = arguments[2],
                hasval = arguments.length > 2,
                addtnl = [].slice.call(arguments, 3)
            if ($.isPlain(name)) {
                var p = prop
                for (var i = 0, l = $.keys(name), ln = l.length; i < ln; i++) {
                    p(el, l[i], name[l[i]])
                }
                return el
            } else if ($.isArray(name)) {
                var res = {}
                var p = prop,args= a.slice(2)
                for (var i = 0, l = name, ln = l.length; i < ln; i++) {
                    res[l[i]] = p.apply(null, [el,l[i]].concat(args))
                }
                return res
            }
            if (typeof(name)!='string'){return null}
            name=_nameMap[name]||name;
            var  ret=null,lc=name.toLowerCase()
            if (!map[lc] && lc.indexOf("remove") == 0 && lc.length > 6) {
                var nm1 = name.substr(6).toLowerCase();
                if (nm1 == "attr" || nm1 == "prop" || nm1 == "class" || nm1 == "data") {
                    a.push(null);
                    val=null;
                    lc=name = nm1
                }
            }
            var isbool
            if ( booleans.indexOf(lc)>=0) {
                isbool=(lc=="readonly"||lc=="disabled"||lc=="checked")
                val=_toBoolean(val)
                if (name.indexOf("visib") >= 0) {
                    name = "visibility"
                    mthd = val ? D.show : D.hide
                } else if (lc == "toggle") {
                    mthd = $d.isVisible(el,true) ? D.hide:D.show;
                } else if (lc == "disappear") {
                    mthd = val ? D.disAppear : D.appear
                } else if (lc == "appear") {
                    mthd = val ? D.appear : D.disAppear
                } else if (lc.indexOf("hidden") >= 0) {
                    mthd = val ? D.hide : D.show
                } else if (lc == "selected") {
                    if ( type == "radio" ||  type == "checkbox") {
                         name = "checked"
                    }
                }
                if (name == "focus" || name == "blur") {
                    mthd = name;
                }
                if(mthd){
                    a.splice(1, 1);
                }
            }
            if(!mthd && typeof(map[name]||map[lc])=="function"){
                mthd = map[name]||map[lc];
                a.splice(1, 1);
             }
            if (val && typeof(val) == "function" && name.indexOf("on")!=0 ) {
                val = val.apply($d(el), [].slice.call(arguments, 2))
            }
            if(!mthd){
                if(_isUndef(val)){hasval=false}
                if (typeof(D[name]) == "function"){
                    mthd = D[name]
                    a.splice(1, 1);
                }
                 else if (map.css.isStyle(name)) {
                    ret=map.css.apply($d, a)

                } else if (name in el  || isbool) {
                     if(hasval){
                        el [name]=val
                       ret=el;
                    } else{
                        ret =  el[name];
                     }
                 } else{
                    ret = map.attr(el,name,val)
                }
            }
            if(mthd && typeof(mthd)=="function"){
                ret = mthd.apply($d, a)
            }
            if  ( ret==el || (ret||{}).el==el ) {
                return $d(el)
            }
            if(ret && ret.nodeType) {
                return $d(ret)
            }
            return ret;
            /*  if (typeof(propname) == "string") {
				  if(propname=="attr"){

				  }

				  var nm = name
				  var lc = nm.toLowerCase(),
					  nm1,
					  mthd ;//= map[nm]||map[lc]
				  if(nm.indexOf("on")==0){
					  if(typeof(val)=="function"){
						  el[nm] = val;
					  }
					  return el[nm];
				  }
				  if(map[nm]||map[lc]){
					  // mthd=map[nm]||map[lc];
					  //if (mthd && typeof(mthd) == "string") {
					  //     mthd=$d[mthd]
					  // }
				  }
				  if (!mthd && val != null && (typeof(val) == "boolean" || String(val) == "1" || String(val) == "0" || String(val) == "true" || String(val) == "false")) {
					  if(!(val == "1" || val == "true"|| val === true)){val=false}
					  else{val=!!val}
					  if (typeof(nm) == "string" && booleans.indexOf(lc)>=0) {
						  if (nm.indexOf("visib") >= 0) {
							  nm = "visibility"
							  mthd = val ? D.show : D.hide
						  } else if (lc == "disappear") {
							  mthd = val ? D.disAppear : D.appear
						  } else if (lc == "appear") {
							  mthd = val ? D.appear : D.disAppear
						  } else if (nm.indexOf("hidden") >= 0) {
							  mthd = val ? D.hide : D.show
						  } else if (nm == "selected") {
							  if (elem.type == "radio" || elem.type == "checkbox") {
								  val = _toBoolean(val);
								  nm = "checked"
							  }
						  }
						  if (nm == "focus" || nm == "blur") {
							  mthd = nm;
						  }
					  }

				  }
				  if (!mthd) {
					  if (lc.indexOf("remove") == 0 && lc.length > 6) {
						  nm1 = nm.substr(6).toLowerCase();
						  if (nm1 == "attr" || nm1 == "prop" || nm1 == "data") {
							  a.push(null);
							  lc=nm = nm1
						  }
					  }
					  if(lc=="readonly"||lc=="disabled"){
						  if(hasval){
							  val=val?lc:null
							  a[a.length-1]=val;
						  }
					   }
					  if (lc.indexOf("visib") == 0 && (val === null||val === false)) {
						  val = "hidden"
					  }
					  if (lc.indexOf("class") >= 0 || lc.indexOf("klass") >= 0) {
						  mthd = _klass;
						  a.splice(1, 1);
						  a.unshift(nm)
					  } else if (nm == "css" || nm1 === "css" || nm1 === "style" || nm1 === "styles") {
						  mthd = _css;
						  a.splice(1, 1)
					  } else if (nm == "attr") {
						  mthd = _attr;
						  a.splice(1, 1)
					  } else if (typeof(D[nm]) == "function") {
						  mthd = D[nm];
						  a.splice(1, 1)
					  } else if (_css.isStyle(nm)) {
						  mthd = _css;
					  } else if ((nm in elem)) {
						  mthd = ""
					  } else if (!(nm in elem)) {
						  mthd = _attr;
					  }
					  if (mthd == "prop" || mthd === D.prop) {
						  mthd = ""
					  }
				  }

				  if (mthd && typeof(mthd) == "function") {
					  return mthd.apply(D, a)
				  } else {
					  if (hasval) {

						  el[nm] = val;
						  if(el.getAttribute(nm)!=val){el.setAttribute(nm,val)}
						  return el
					  }
					  return el[nm]
				  }*/
            }

    })();


    _prop.curryMethod = function(mthd) {
        var a = mthd;
        return function(el) {
            var ln = arguments.length
            if (ln === 1) {
                return _prop(el, a)
            } else if (ln === 2) {
                return _prop(el, a, arguments[1])
            } else if (ln === 3) {
                return _prop(el, a, arguments[1], arguments[2])
            }
            var args = [el, a]
            for (var i = 1; i < ln; i++) {
                args.push(arguments[i])
            }
            return _prop.apply(this, args)
        }
    }


        $d.val= function(e ) {
            var elem = $d(e);
            if (!elem) {
                return
            }
            var v=arguments[1]
            if(typeof(elem.__valHandle)=="function"){
                return elem.__valHandle.call(elem,v)
            }
            return $d.prop(elem,"value",v)
        }

        $d.html=  _prop.curryMethod("html")
        $d._val=  _prop.curryMethod("val")
        $d.text= _prop.curryMethod("text")
        $d.klass= _klass
        $d.removeClass=  _prop.curryMethod("removeClass")
        $d.addClass=  _prop.curryMethod("addClass")
        $d.hasClass=  _prop.curryMethod("hasClass")
        $d.toggleClass=  _prop.curryMethod("toggleClass")
        $d.prop= _prop
        $d.css= _css
        $d.attr= _prop.curryMethod("attr")
        $d.removeAttr=_prop.curryMethod("removeAttr")

        $d.removeData= function removeData(e, name) {
            return this.data(e, name, null);
        }
        $d.removeProp= function removeProp(e, name) {
            return this.prop(e, name, null);;
        }
        $d.isValidAttrName= function(e, k) {
            var el = e;
            if (arguments.length == 1 && typeof(e) == "string") {
                k = e; el = document.body
            }
             return ((el && typeof(k) == "string") && (
                    (el.hasAttribute && el.hasAttribute(k))||(el.getAttribute && el.getAttribute(k)!=null)
                    ||
                    ((k in el) || k == "id" || k == "name"|| ["readonly","disabled"].indexOf(k.toLowerCase())>=0)
                )
            )  ;
        }

		 $d.data= function(e) {
            var el = $d(e );
            if (!el) {
                return
            }
            if(!el.__expando){
                el.__expando = $.expando(el,"data",function(nm,val){
                    if (this.el && this.el.dataset) {
                        if((val==null || (typeof(val)!="object"  && typeof(val)!="function")) && typeof(this.el.dataset[nm])!="undefined"){
                            if(val!=null){this.el.dataset[nm]=val;return;}
                            return this.el.dataset[nm]
                        }
                    }
                    return false;
                }.bind(this))
            }
            return el.__expando.apply(el, [].slice.call(arguments, 1));
        }
        $d.domdata= function(e, k, v) {
            var el = $d.toEl(e);
            if (!el) {
                return
            }
            if (el.dataset) {
                if (typeof(v) == "undefined") {
                    return el.dataset[k]
                } else {
                    el.dataset[k] = v
                }
            }
            return $d(el)
        }
		
})();		