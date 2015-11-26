/* Created by Atul on 3/20/2015.
 */
    function DOMImpl(){

        var doLog=1;
        var origwin=self;
        function _noop(){}
        var pushall=Array.prototype.push,document,window={},selectorEngineImpl=null;
        var util  = (function(){
            var __uid= 0;
            var elCache={}//uniqueId to element
            var tokCache={}//uniqueId to token
            return {
                getUUID:function getUUID() {return ++__uid},
                makeToken: function _makeToken(tag, par, idx) {

                    if (idx == null && par && par.ch) {
                        idx = par.ch.length || 0
                    }
                    var uuid=util.getUUID();
                    return tokCache[uuid] = util.setParent({
                        uniqueId: uuid,
                        idx: idx,
                        par: null,
                        posIdx: "",
                        lvl: -1,
                        tag: tag,
                        attr: Object.create(null),
                        ch: []
                    }, par)

                },
				deserialize:function _deserialize(data,doc){
					if(type(data)=="string"){
						data=JSON.parse(data)
					}
					doc=doc||document
						function _deser(nodedata){
							if(!(nodedata && nodedata.tag)){return null}
							var node=doc.createElement(nodedata.tag)
							if(nodedata.attr){var a=nodedata.attr
								for(var k in a){ 
									node.setAttribute(k,a[k])
									//node.setAttribute(k,a[k])									
								}
								//node.attr
							} 
							if(nodedata.ch && nodedata.ch.length){
								nodedata.ch.forEach(function(ch){
									var nu=_deser(ch);
 									nu && node.appendChild(nu);
								})
							}
							return node
						}
					var res=_deser(data)
					return res;
				},
				serialize:function _serialize(root){
					var loopchk=[]
					function _ser(node){
						if(!(node && node.__object)){return null}
						if(loopchk.indexOf(node.uniqueId)>=0){return null}
						loopchk.push(node.uniqueId);
						var obj=node.__object,map={}
						map.tag=obj.tag
						if(obj.attr){
							var a=obj.attr;
							for(var k in obj.attr){
								var val
								if(typeof(a[k])=="function"){
									val=a[k].toString()
								} else if(typeof(a[k])=="object" && (a[k].nodeType || a[k].__object)){
									val=_ser(a[k])		
 								} else{
									val=a[k]
								}
								if(val){
									map.attr||(map.attr={});
									map.attr[k]=val
								}
								
							}
						} 
						map.ch=(obj.ch||[]).map(_ser)
						return map;
					}
					var all=_ser(root)
					loopchk.length=0;
					loopchk=null;
					return all
				},
                addToCached: function findCachedEl(uid,el) {
                    if(!uid ||!el){return}
                    elCache[uid]=el
                },
                findCachedEl: function findCachedEl(val) {
                    if (!val) {
                        return null
                    }
                    if (val instanceof Node) {
                        return val
                    }
                    if (val.uniqueId && elCache[val.uniqueId + ""]) {
                        return elCache[val.uniqueId + ""]
                    }
                    if (typeof(val) === "string" || typeof(val) === "number") {
                        return elCache[String(val)]

                    }
                },
                findToken: function findToken(val) {
                    if (!val || val.uniqueId) {
                        return val
                    }
                    var el = util.findCachedEl(val)
                    if (el) {
                        return el.__object
                    }
                    if (typeof(val) === "string" || typeof(val) === "number") {
                        return tokCache[val + ""]
                    }
                },
                setParent: function _setParent(token, parent) {
                    var object = util.findToken(token),
                        par = util.findToken(parent)
                    if (!par || !object) {
                        return token
                    }

                    if (object.idx == null || isNaN(object.idx) || object.idx < 0) {
                        object.idx = Math.max(0, par.ch.indexOf(object))
                    }
                    par.posIdx || (par.posIdx = "0");
                    object.par = par.uniqueId;
                    object.posIdx = par.posIdx + "." + object.idx;
                    object.lvl = par.lvl + 1;
                    object.par = par.uniqueId;
                    if (object.idx < par.ch.length - 1) {
                        var pos = par.posIdx;
                        for (var i = 0, l = par.ch, ln = l.length; i < ln; i++) {
                            l[i].idx = i
                            l[i].posIdx = pos + "." + i
                        }
                    }
                    return token;
                },
                reEscape:function reEscape(k){
                    return k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                },
                makeNode:function(object,parent){
                    return Node.from(object,parent)
                }
            }
        })();
         function  Event(type,options){
            this.type=type;
            options=options||{}
             this.bubbles =!!options.bubbles
             this.cancelable=!!options.cancelable
             this.target=options.target
             this.data=options.data
            this._cancelled=0
        }
        Event.prototype={
            stopPropagation:function(){this._cancelled=1},
            stopImmidiatePropagation:function(){this._cancelled=2},
            preventDefault:function(){this._cancelled=3}
        }

         function  EventTarget(){}
        //Register an event handler of a specific event type on the EventTarget.
        EventTarget.prototype.addEventListener=function(ev, handle, useCapture){
            if(!this.__props){return}
            this.__props.__eventHandlers||(this.__props.__eventHandlers={});
            if(!this.__props.__eventHandlers[ev]){
                this.__props.__eventHandlers[ev]=[];
            }
            var handles=this.__props.__eventHandlers[ev]||(this.__props.__eventHandlers[ev]=[]);
            for ( var i=0,ln=handles.length;i<ln;i++){
                if(handles[i].handle===handle){return}
            }
            handles.push({useCapture:useCapture,handle:handle})
        };
        //Removes an event listener from the EventTarget.
        EventTarget.prototype.removeEventListener=function(ev, handle){
            if(this.__props && this.__props.__eventHandlers && this.__props.__eventHandlers[ev]){
                var handles=this.__props.__eventHandlers[ev];
                for ( var i=0,ln=handles.length;i<ln;i++){
                    if(handles[i].handle===handle){
                        handles.splice(i,1);
                        return
                    }
                }
            }

        }
        //Dispatch an event to this EventTarget.
        // @TODO add logic for bubbling and capture
        EventTarget.prototype.dispatchEvent=function(ev, data){

            if(ev &&  this.__props ){
                var type=typeof(ev)=="string"?ev:ev.type
                var handles=(this.__props.__eventHandlers||{})[type]||[], _stopped=0;
                if(!(handles.length || this["on"+type])){return}
                var event=typeof(ev)=="object"?ev:new Event(type,{
                    target:this,
                    data:data
                });
                if(typeof(this["on"+type])=="function"){
                    if(this["on"+type].call(this,event)===false){
                        event._cancelled=1;
                    }
                }
                for ( var i=0,ln=handles.length;i<ln;i++){
                    if(event._cancelled){
                        break;
                    }
                    if(handles[i].handle.call(this,event)===false){
                        event._cancelled=1;
                    }
                }
            }

        };
        function  DefaultView(){
            this.__props={};
            this.location={href:""};
            this.getComputedStyle=function(el){
                return (Node.from(el)||{}).style||{}
            }
        }
        DefaultView.prototype=new EventTarget();
        window=new DefaultView()
        //DOM Impl
        function  Document(){
            util.addToCached("document",this)
            Node.call(this,{tag:"document",ch:[],uniqueId:"document",attr:Object.create(null)});
            this.documentElement=null;
            this.body=null
            this.head=null
            this.defaultView=window;
            this.toString=function(){return "[object HTMLDocument]"}
        }

        function  DOMTokenList(el ){
            this.el=el
            var curr=el.__getprop("class")
            if(curr){pushall.apply(this,curr.split(/\s+/))}
        }

        DOMTokenList.prototype=Object.create(Array.prototype)
        DOMTokenList.prototype.onchange=function(){ this.el.__setprop("class",this.join(" "))}
        DOMTokenList.prototype.add=function(nm){this.contains(nm) || this.push(nm);this.onchange("add")}
        DOMTokenList.prototype.remove=function(nm){this.contains(nm) && this.splice(this.indexOf(nm),1);this.onchange("remove")}
        DOMTokenList.prototype.contains=function(nm){return this.indexOf(nm)>=0}
        DOMTokenList.prototype.toggle=function(nm){this.contains(nm)?this.add(nm):this.remove(nm);this.onchange("modify")}
        function  Attr(nm,val){
            this.name=nm
            this.value=val
        }
        function  DOMStringMap(el){
            this.el=el
            for(var i= 0,l=Object.keys(el.__props||{}),ln=l.length,attr;attr=l[i],i<ln;i++){
                //if array op then no go
                if(!attr || attr.indexOf("data-")!==0){continue}
                var nm=attr.substr("data-".length).replace(/\-(\w)/g,function(a,b){return b.toUpperCase()})

                Object.defineProperty(this,nm,{
                    get:Function("return this.el.getAttribute('"+attr+"')"),set:Function("v","return this.el.setAttribute('"+attr+"',v)")
                })

            }
            this.__ignorenext=[]
            Object.observe(this,function(recs){
                for(var i= 0,ln=recs.length,rec;rec=recs[i],i<ln;i++){
                    if(!rec || rec.type=="delete"){continue}
                    var nm=rec.name,attrname,dataname
                    if(nm=="__ignorenext"){
                        continue
                    }
                    if(rec.object.__ignorenext[0]===nm){
                        rec.object.__ignorenext[0]=null
                        continue
                    }
                    if(nm.indexOf("data-")==0){attrname=nm;dataname=nm.substr("data-".length).replace(/\-(\w)/g,function(a,b){return b.toUpperCase()})}
                    else{dataname=nm;attrname="data-"+nm.replace(/[A-Z]/g,function(a,b){return "-"+b.toLowerCase()})}

                    var val=rec.object[nm]
                    if(rec.type=="add"){

                        rec.object.__ignorenext[0]=dataname
                        delete rec.object[nm]
                        Object.defineProperty(rec.object,dataname,{
                            get:Function("return this.el.getAttribute('"+attrname+"')"),set:Function("v","return this.el.setAttribute('"+attrname+"',v)")
                        })
                    }
                    if(nm!=attrname){
                        rec.object.el.setAttribute( attrname,val)
                    }
                }
            })
        }
        function  NamedNodeMap(el ){
            this.el=el;


        }
        NamedNodeMap.prototype=Object.create(Array.prototype)
        NamedNodeMap.prototype.getIdx=function(nm){
            return this.indexOf(nm)
        }
        NamedNodeMap.prototype.getNamedItem=function(nm){
            if(!isNaN(nm)){return this[Number(nm)]}
            if(nm==="className"){nm="class"}
            //if(this.indexOf(nm)===-1){return null}
            return {name:nm,value:this.el.__getprop(nm)}
        }
        NamedNodeMap.prototype.item=function(nm){
            return (this.getNamedItem(nm)||{}).value
        }
        NamedNodeMap.prototype.removeNamedItem=function(nm){
            if(nm==="className"){nm="class"}
            if(nm==="class"||nm=="style"){return}
            if(String(nm).indexOf("data-")==0){
                delete this.el.dataset[nm.substr("data-".length).replace(/\-(\w)/g,function(a,b){return b.toUpperCase()})]
            }
            delete this.el.__object.attr[nm]
            //var idx=this.getIdx(nm)
            //if(idx>=0){return this.splice(idx,1)[0]}
        }
        NamedNodeMap.prototype.setNamedItem=function(nm,val){
            if(nm==="className"){nm="class"}
            var curr=this.el.__setprop(nm,val,true)
            if(String(nm).indexOf("data-")==0){
                this.el.dataset[nm.substr("data-".length).replace(/\-(\w)/g,function(a,b){return b.toUpperCase()})]=val;
            }
            return curr;
        }

        function  NodeList(el ){   }
        NodeList.prototype=Object.create(Array.prototype)

        function  HTMLCollection(el ){   }
        HTMLCollection.prototype=Object.create(Array.prototype)

        function  CSSStyleDeclaration(el){
            this.el=el
            var curr=el.getAttribute("style")
            if(curr){var ths=this
                curr.split(";").forEach(function(collector,val,i){
                    var arr=val.split(":")
                    if(arr.length==2){
                        ths.setProperty(arr[0],arr[1])
                    }
                } );
            }
            Object.observe(this,function(recs){
                for(var i= 0,ln=recs.length,rec;rec=recs[i],i<ln;i++){
                    if(!rec){continue}
                    var nm=rec.name
                    //if array op then no go
                    if(nm=="length" || nm=="cssText" || !isNaN(nm)){continue}
                    rec.object.setProperty(nm,rec.object[nm])
                }
            })
        }

        CSSStyleDeclaration.prototype=Object.create(Array.prototype)
        Object.defineProperty(CSSStyleDeclaration.prototype,"cssText",{
            get:function(){
                if(!this.el){return}
                var holder=[]
                for(var i= 0,l=this,ln= l.length;i<ln;i++){
                    holder.push(l[i]+":"+(this[nm]||this[String(nm).replace(/-\w/g,function(a){return a.charAt(1).toUpperCase()})]))
                }
                return holder.join(";");
            },
            set:function(s){if(!this.el){return}
                var ths=this;
                s.split(";").forEach(function(k){
                    var arr= k.split(":")
                    if(arr.length==2){
                        ths[arr[0]]=arr[1];
                    }
                })
            }
        })
        CSSStyleDeclaration.prototype.setProperty=function(nm,val){
            if(nm=="length" || nm=="cssText" || !isNaN(nm) || typeof(val)==="object"||typeof(val)==="function"){return}
            var css= String(nm).replace(/[A-Z]/g,function(a){return "-"+ a.toLowerCase()})
            if(this.indexOf(css)==-1){this.push(css)}
            this[nm]=val
        }
        CSSStyleDeclaration.prototype.getPropertyValue=function(nm){return this[nm]}
        var queryMethods={
            byTag:function(tag,parent){
                return parent.getElementsByTagName(tag)
            },
            byClass:function(kls,parent){
                return parent.getElementsByClassName(kls)
            },
            byId:function(id,parent){
                return parent.getElementById(id)
            },
            byAttrValue:function(nm,val,parent){
                var ret=[]
                traverse(parent.__object ,function(o,up){
                    if(o.attr  && o.attr[nm]==val){ret.push(Node.from(o,up));}
                });
                return ret;
            },
            byAttr:function(nm,parent){
                var ret=[]
                traverse(parent.__object  ,function(o,up){
                    if(o.attr &&  nm in o.attr){ret.push(Node.from(o,up));}
                });
                return ret;
            }
        }
        function queryAll(selector,parent,count ){
            if(!selectorEngineImpl){
                selectorEngineImpl=SelectorEngine(document)
            }
            return selectorEngineImpl.query(selector,parent,count)||[];
        }
        function traverse(el,callback,includeself,par){
            if(includeself && callback(el,par)===true){return true}
            for(var i= 0,l=el.ch||[] ,ln= l.length;i<ln;i++){
                if(traverse(l[i],callback,true,el)===true){return true}
            }
        }

        /*
         */
        function Node(object,parent){
            if(!object){return}
            if(!object.uniqueId){
                object.uniqueId= util.getUUID()
            }

            util.addToCached(object.uniqueId,this)

            this.__isInstance=true;
            var p= parent
            if(parent){
                util.setParent(object,parent)
            }
            object.tag||(object.tag="");
            object.attr||(object.attr={});
            object.ch||(object.ch=[]);
            //hidden core
            Object.defineProperty(this,"__isInstance",{value:true,enumerable:false,writable:false,configurable:true});
            Object.defineProperty(this,"__object",{value:object,enumerable:false,writable:false,configurable:true}); //{lvl:1,tag: "", attr: {}, ch: []}
            //---

            if(object.tag=="html"){
                document.__object.ch=[object]
                document.documentElement=this;
            }
            else if(object.tag=="body"){
                document.body=this;
            }
            else if(object.tag=="head"){
                document.head=this;
            }
            this.nodeType=1;

            if(object.text!=null||object.tag=="#text"||object.tag=="#comment"){
                this.nodeType=3
                this.__object.attr={tag:"#text"}
            } else{
                if(additional[this.nodeName]){
                    Object.defineProperties(this,additional[this.nodeName])
                }
            }
        }
        Node.prototype=new EventTarget();

        var nodeProtoprops={
            toString:{value:function(){var tag=String(this.tagName).toLowerCase()
                return "[object HTML"+tag.charAt(0).toUpperCase()+tag.substr(1)+"Element]"}
            },
            __props:{get:function(){
                if(this.nodeType!==1||!this.__isInstance){return null}
                delete this.__props;
                var nu=this.__object.attr||(this.__object.attr={});
                Object.defineProperty(this,"__props",{value:nu,writable:false,enumerable:false,configurable:true})
                return nu;
            },
                set:_noop,enumerable:false,configurable:true
            },
            attributes:{get:function(){
                if(this.nodeType!==1||!this.__isInstance){return null}
                delete this.attributes;
                var nu=new NamedNodeMap(this);
                Object.defineProperty(this,"attributes",{value:nu,writable:false,enumerable:true,configurable:true})
                return nu;
            },
                set:_noop,enumerable:true,configurable:true
            },
            nodeName:{get:function(){
                return (this.tagName||"").toLowerCase()},
                set:_noop,enumerable:true
            },
            localName:{get:function(){
                return (this.tagName||"").toLowerCase()},
                set:_noop,enumerable:true
            },
            tagName:{get:function(){
                return String(this.__object.tag).toUpperCase()},
                set:_noop,enumerable:true
            },
            id:{get:function(){return this.nodeType!==1||!this.__isInstance?null:this.__getprop("id")},
                set:function(id){if(!this.__props||this.nodeType!==1||!this.__isInstance){return null}
                    //idCache[id]=this.__object.uniqueId
                    return this.__setprop("id",id)
                },enumerable:true
            },
            parentNode:{get:function(){
                return Node.from(this.__object.par)
            },
                set:function(p){if(!this.__isInstance){return}
                    util.setParent(this ,p)

                },enumerable:true },

            children:{get:function(){
                if(this.nodeType!==1||!this.__isInstance){return []}
                var res=[]
                for(var i= 0,l=this.__object.ch,ln= l.length;i<ln;i++){
                    if(l[i].tag!=="#text"){
                        res.push(Node.from(l[i],this))
                    }
                }
                return res
            },set:_noop,enumerable:true },
            childNodes:{get:function(){
                if(this.nodeType!==1||!this.__isInstance){return []}
                var res=[]
                for(var i= 0,l=this.__object.ch,ln= l.length;i<ln;i++){
                    res.push(Node.from(l[i],this))
                }
                return res
            },set:_noop,enumerable:true },
            childElementCount:{get:function() {if(this.nodeType!==1||!this.__isInstance){return 0}
                return this.__object.ch.filter(function(a){return a.nodeType==1}).length
            },set:_noop,enumerable:true
            },
            previousElementSibling:{get:function(){if( !this.__isInstance){return null}
                var prev=this.previousSibling
                while(prev){
                    if(prev.nodeType===1){return prev}
                    prev=prev.previousSibling;
                }
            },set:_noop,enumerable:true},
            nextElementSibling:{get:function(){if( !this.__isInstance){return null}
                var el=this.nextSibling
                while(el){
                    if(el.nodeType===1){return el}
                    el=el.nextSibling;
                }
            },set:_noop,enumerable:true},
            nextSibling:{get:function(){if( !this.__isInstance){return null}
                var p=Node.from(this.__object.par)
                if(!p||!p.__object){return null}
                var ch=p.__object.ch;
                var i=ch.indexOf(this.__object)
                return i>=0?Node.from(ch[i+1],p):null

            },set:_noop,enumerable:true },
            previousSibling:{get:function(){if( !this.__isInstance){return null}
                var p=Node.from(this.__object.par)
                if(!p||!p.__object){return null}
                var ch=p.__object.ch;
                var i=ch.indexOf(this.__object)
                return i>0?Node.from(ch[i-1],p):null

            },set:_noop,enumerable:true
            },
            lastChild:{get:function(){
                if(this.nodeType!==1||!this.__isInstance){return null}
                var ch=this.__object.ch;
                return Node.from(ch[ch.length-1],this)

            },set:_noop,enumerable:true
            },
            lastElementChild:{get:function(){
                var el=this.lastChild
                while(el){
                    if(el.nodeType===1){return el}
                    el=el.previousSibling;
                }

            },set:_noop,enumerable:true
            },
            firstChild:{get:function(){
                if(this.nodeType!==1||!this.__isInstance){return null}
                return Node.from(this.__object.ch[0],this)
            },set:_noop,enumerable:true
            },
            firstElementChild:{get:function(){
                var el=this.firstChild
                while(el){
                    if(el.nodeType===1){return el}
                    el=el.nextSibling;
                }
            },set:_noop,enumerable:true
            },
            textContent:{
                get:function() {if(!this.__isInstance){return}
                    return this.nodeType!==1?this.__object.text:this.innerHTML
                }
                ,set:function(val){
                    if(!this.__isInstance){return}
                    if(this.nodeType!==1){
                        this.__object.text=val
                    } else{
                        this.innerHTML=val;
                    }
                },enumerable:true
            },
            nodeValue:{get:function(){
                return this.textContent;},set:function(v){this.textContent=v},enumerable:true
            },
            innerText:{get:function(){
                return this.nodeValue;},set:function(v){this.nodeValue=v},enumerable:true
            },
            innerHTML:{get:function(){
                if(this.nodeType!==1||!this.__isInstance){return null}
                //serialized
                var O=this.__object;
                if(this.nodeType!==1){return O.text}
                return ["<",O.tag," ",
                    Object.keys(O.attr).reduce(function(collector,k){
                        collector.push(k+"=\""+O.attr[k]+"\"");return collector
                    },[]).join(" "),
                    ">",
                    this.childNodes.map(function(a){return a.innerHTML}).join("\n") ,
                    "</", O.tag,">"
                ].join("")
            },set:function(string){
                if(!this.__isInstance){return}
                var root=_parse(string)
                this.ch=[];
                this.appendChild(root);

            },  enumerable:true
            }
        };
        ["offsetHeight","offsetWidth","offsetTop","offsetLeft","clientHeight","clientWidth","clientTop","clientLeft","scrollHeight","scrollWidth","scrollTop","scrollLeft"].forEach(
            function(k){nodeProtoprops[k]={value:0,writable:true}}
        );
        [  "prefix", "shadowRoot", "tabIndex", "title", "translate", "onabort", "onautocomplete", "onautocompleteerror", "onbeforecopy", "onbeforecut", "onbeforepaste", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncopy", "oncuechange", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onpaste", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onsearch", "onseeked", "onseeking", "onselect", "onselectstart", "onshow", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onvolumechange", "onwaiting", "onwebkitfullscreenchange", "onwebkitfullscreenerror", "onwheel"].forEach(
            function(k){nodeProtoprops[k]={get:Function("return this.__getprop('"+k+"')"),set:Function("v","return this.__setprop('"+k+"',v)"),enumerable:true,configurable:true}}
        );
        var additional={
            "input":{
                "value":{get:Function("return this.__getprop('value')"),set:Function("v","return this.__setprop('value',v)"),enumerable:true,configurable:true},
                "type":{get:Function("return this.__getprop('type')"),set:Function("v","return this.__setprop('type',v)"),enumerable:true,configurable:true},
                "onchange":{get:Function("return this.__getprop('onchange')"),set:Function("v","return this.__setprop('onchange',v)"),enumerable:true,configurable:true},
                "oninput":{get:Function("return this.__getprop('oninput')"),set:Function("v","return this.__setprop('oninput',v)"),enumerable:true,configurable:true}
            },
            "img":{
                "src":{get:Function("return this.__getprop('src')"),set:Function("v","return this.__setprop('src',v)"),enumerable:true,configurable:true}
            },
            "iframe":{
                "href":{get:Function("return this.__getprop('href')"),set:Function("v","return this.__setprop('href',v)"),enumerable:true,configurable:true}
            }
        };
        additional.script=additional.img;
        additional.link=additional.iframe;
        additional.textbox=additional.select=additional.button=additional.input;
        nodeProtoprops.contentEditable= {get:function(){return this.__getprop("contentEditable")||"inherit"},set:function(v){return this.__setprop("contentEditable",v)},enumerable:true,configurable:true}
        nodeProtoprops.draggable={get:function(){return !!this.__getprop("draggable")},set:function(v){return this.__setprop("draggable",!v||v=="0"||v=="false"?false:!!v)},enumerable:true,configurable:true}
        nodeProtoprops.isContentEditable= {get:function(){return !!this.__getprop("isContentEditable");   },set:function(v){return this.__setprop("isContentEditable",!v||v=="0"||v=="false"?false:!!v)},enumerable:true,configurable:true}

        nodeProtoprops.parentElement=nodeProtoprops.parentNode;
        Object.defineProperties(
            Node.prototype,nodeProtoprops
        );

        Node.prototype.__getprop=function(name ){
            var p=this.__props;
            if(!p){return null}
            return p[name]
        }
        Node.prototype.__setprop=function(name,v ){
            var p=this.__props;
            if(!p){return null}
            var curr=p[name]
            if(curr!==v){p[name]=v}
            return curr;
        }
        Node.prototype.insertBefore=function(child,before){
            if(!child ||!this.__isInstance){return null}
            if(!before||!before.__object){return this.appendChild(child)}
            var idx=this.__object.ch.indexOf(before.__object)
            var p=child.parentNode
            if(p){p.removeChild(child)}
            if(idx>=0){
                this.__object.ch.splice(idx+1,0,child)
            } else{this.__object.ch.push(child)}
            util.setParent(child.__object,this.__object,idx)
            return  child
        }
        Node.prototype.appendChild=function(child){
            if(!child ||!this.__isInstance){return null}
            var p=child.parentNode
            if(p){p.removeChild(child)}
            util.setParent(child.__object,this.__object)
            this.__object.ch.push(child.__object)
            return  child
        }
        Node.prototype.contains=function(child){
            if(!child || !child.__object||!this.__isInstance){return null}
            var pos=this.compareDocumentPosition(child)
            return pos===16||pos===0
        }
        Node.prototype.compareDocumentPosition=function(other){
            if(!other || !other.__object||!this.__isInstance){return null}
            if(this===other){return 0}
            var thispos=this.__object.posIdx,pos=other.__object.posIdx
            if(!pos || !thispos){return 1 }//DISCONNECTED
            if(thispos && pos){
                if(pos.indexOf(thispos)===0){
                    return 16  //CONTAINED_BY
                }
                if(thispos.indexOf(pos)===0){
                    return 8  //CONTAINS
                }
                var thisarr=thispos.split(/\./),arr=pos.split(/\./),cmn=-1
                for(var i= 0,ln= arr.length;i<ln;i++){
                    if(thisarr[i]==arr[i]){cmn=i}
                    else{break;}
                }
                if(cmn>=0){
                    if(thisarr[cmn+1]!=null && arr[cmn+1]!=null ){
                        if(Number(thisarr[cmn+1])>Number(arr[cmn+1])){
                            return 2 //POSITION_PRECEDING.
                        } else {
                            return 4 //FOLLOWING .
                        }
                    }
                }

            }
            return 1
        }
        Node.prototype.removeChild=function(child){debugger;
            if(!child || !child.__object||!this.__isInstance){return null}
            var p=child.parentNode
            if(!p || p!==this){
                return
            }
            var idx=this.__object.ch.indexOf(child.__object)
            if(idx>=0){this.__object.ch.splice(idx,1)}
            child.__object.par=null
            return child
        }
        Node.prototype.getAttribute=function(nm,val){return this.__isInstance && this.__getprop(nm,true)}
        Node.prototype.setAttribute=function(nm,val){this.__isInstance &&  this.attributes.setNamedItem(nm,val)}
        Node.prototype.removeAttribute=function(nm){if(this.__isInstance){return this.attributes.removeNamedItem(nm)}}
        Node.prototype.hasAttribute=function(nm){return  this.__isInstance && nm in this.__props}
        Node.prototype.getElementById = function(id){
            if(!id || !this.__isInstance){return null}
            var ret=null
            traverse(this.__object ,function(o,up){
                if(o.attr  && o.attr["id"]===id){ret=Node.from(o,up);return true}
            });
            return ret;
        }
        Document.prototype=Object.create(Node.prototype);
        Document.prototype.createElement=function(tag){
            return Node.from(util.makeToken(tag))
        }
        Document.prototype.createComment=function(tag){
            return Node.from({tag:"#comment"})
        }

        Node.from=function(object,parent){
            if(!object){return null}
            var obj=util.findCachedEl(object)
            if(!obj){
                var tok=util.findToken(object)
                if(tok){
                    if(tok.tag=="document"){return document}
                    if(tok.text!=null||tok.tag=="#text"||tok.tag=="#comment"){
                        return new TextElement(tok,parent)
                    }
                    return new Element(tok,parent)
                }
            }
            if(parent){
                util.setParent(obj,parent)
            }
            return obj;

        }
        function TextElement(object,parent){
            if(typeof(object)=="string"){object={text:object}}
            object.attr={};
            object.ch=[];
            Node.call(this,object,parent);
        }
        TextElement.prototype=Object.create(Node.prototype);
        TextElement.prototype.toString=function(){
            return "[object Text]"
        }
        function Element(object,parent){
            Node.call(this,object,parent);

        }
        Element.prototype=Object.create(Node.prototype);
        Object.defineProperties(
            Element.prototype,{
                //lazy props
                className:{get:function(){
                    return this.nodeType!==1||!this.__isInstance?null:(this.__getprop("class")||"")},
                    set:function(kls){
                        if(!kls||this.nodeType!==1||!this.__isInstance){return}
                        var curr=this.__getprop("class")||""
                        if(curr.split(/\s+/).indexOf(kls)===-1){this.__setProp("class",(curr+" "+kls).trim())}
                    }
                    ,enumerable:true
                },
                dataset:{get:function(){
                    if(this.nodeType!==1||!this.__isInstance){return null}
                    delete this.dataset;
                    var nu=new  DOMStringMap(this);
                    Object.defineProperty(this,"dataset",{value:nu,writable:false,enumerable:true,configurable:true})
                    return nu;
                },
                    set:_noop,enumerable:true,configurable:true
                },
                classList:{get:function(){
                    if(this.nodeType!==1||!this.__isInstance){return null}
                    delete this.classList;
                    var nu=new  DOMTokenList(this);
                    Object.defineProperty(this,"classList",{value:nu,writable:false,enumerable:true,configurable:true})
                    return nu;
                },
                    set:_noop,enumerable:true,configurable:true
                },

                style:{get:function(){
                    if(this.nodeType!==1||!this.__isInstance){return null}
                    delete this.style;
                    var nu=new  CSSStyleDeclaration(this);
                    Object.defineProperty(this,"style",{value:nu,writable:false,enumerable:true,configurable:true})
                    return nu
                },
                    set:_noop,enumerable:true,configurable:true
                }
            }
        );

        Element.prototype.querySelector = function(sel){
            if(!sel || !this.__isInstance){return null}
            return queryAll(sel,this,1)[0];
        }
        Element.prototype.querySelectorAll = function(sel){
            if(!sel || !this.__isInstance){return null}
            if(sel=="*"){return this.getElementsByTagName("*")}
            return queryAll(sel,this);
        }
        Element.prototype.getElementsByTagName = function(tag){
            if(!tag || !this.__isInstance){return null}
            var ret=[],tagName=tag.toUpperCase()
            traverse(this.__object ,function(o,up){
                o.tag && o.tag !=="#text"  && (tag==="*"  || o.tag.toUpperCase() === tagName ) && ret.push(Node.from(o,up));
            });
            return ret;
        }
        Element.prototype.getElementsByClassName = function(kls){
            if(!kls || !this.__isInstance){return null}
            var ret=[],re=new RegExp("(^|\\s)"+util.reEscape(kls)+"(\\s|$)","")
            traverse(this.__object ,function(o,up){
                if(o.attr  && o.attr["class"] && re.test(o.attr["class"])){ret.push(Node.from(o,up));}
            });
            return ret;
        }

        document=new Document({tag:"document"});
        ["querySelector","querySelectorAll","getElementsByClassName","getElementsByTagName"].forEach(function(k){
            document[k]=  Element.prototype[k].bind(document);
        });
        Node.prototype.ownerDocument=document;
        Node.prototype.lang="";
        Node.prototype.baseURI="";
        Node.prototype.namespaceURI= "http://www.w3.org/1999/xhtml"

    return util
}