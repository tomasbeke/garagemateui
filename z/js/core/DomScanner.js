/**
 * Created by Atul on 6/13/2015.
 * Inspired by Angular
 *
 * Accepts binding declared in attributes as well as curlies
 *
 * Example
 * z-bind="eventhandler"
 *
 */

$.scanDom  = (function () {
	var   DOUBLECURLY_RE = /\{\{/, rem = /\{\{([^}]+)\}\}/g,DOUBLECURLY_EXPRRE=/^\{\{(.*?)\}\}$/,
		ops=/^[>#?!\+]/,
		fn = null
	var SCOPECACHE={},SCOPEMODELCACHE={}
	var UIDirectives={}
	function registerDirective(nm,model){
		if($.isPlain(model)){
			model=new uiDirective(model)
		}
		UIDirectives[nm]=model
	}
	function getDirective(nm){
		return UIDirectives[nm]
	}
	function resolveDirective(nm,config){
		var d=getDirective(nm);
		return d
	}
	function exprInfo(expr,istemplate){
		if(/[^\w\.]/.test(expr)){
			var parsed,args=[],orig=expr
			try{
				if(expr.indexOf("(")>0 && expr.indexOf(")")==expr.length-1){
					var arr=expr.split(/\(/)
					expr=arr.shift()
					args=arr[0].split(/\)/).shift().split(',').map(function(a){
						if(isNaN(a) && !/['"].test(a)/){vars.push(a)}
						return {value:a,type:$.typeInfo.get(a).type}
					})

				}
				if(/[^\|]\|[^\|]/.test(expr)){
					var ar=expr.split(/\|/)
					expr=ar.shift();
					args=ar.map(function(a){return {value:a,type:$.typeInfo.get(a).type}});
				}
				if(expr && args.length){
					return {id:orig,vars:vars ,args:args,fname:expr}
				}
				parsed=istemplate?$.template(expr):$.parseExpr(expr)
			} catch(e){return {id:expr}}
			if(!parsed){parsed={}};
			var vars=(parsed.tokens?parsed.tokens.filter(function(a){return a.type=="id"}).map(function(a){return a.value}):parsed.vars)||[]
			if(parsed.graph && parsed.graph.type=="fn"){
				args=args.concat(parsed.graph.args||[]).map(function(a){return ($.typeInfo.fromType(a.type)).coerce(a.value)});
				return {id:expr,args:args,vars:(parsed.graph.args||[]).filter(function(a){return a && a.type=="id"}).map(function(a){return a.value}),fn:parsed.fn,fnname:parsed.graph.value}
			}
			return {id:expr,vars:vars ,fn:parsed.fn||parsed}
		}
		return {id: expr,vars:[expr]}
	}
	var cntr=Date.now()
	function ELExprModel(el,scopeid){
		this._elid=el
		this.exprModels=[]
		this.scopeid=scopeid
		this.dependmap=[]
		this.attr={}
		this.children=[]
	}
	ELExprModel.prototype.$=function dollar(selector){
		var el=$d(this._elid)
		if(el && selector){
			return el.q(selector)
		}
		return el
	}
	ELExprModel.prototype.setScope=function setScope(scope){
		if(!scope){return}
		var scopeid
		if(typeof(scope)=="string"){
			scopeid=scope
			scope=null
		} else {
			scopeid=scope.scopeid

		}
		if(!scopeid){return}
		if(scopeid && scope) {
			SCOPECACHE[scopeid]=scope
		}
		this.scopeid=scopeid
		if(this.children && this.children.length) {
			this.children.forEach(function(a){
				a.setScope(scopeid)
			})
		}
		if(this.exprModels && this.exprModels.length) {
			this.exprModels.forEach(function(a){
				a.scopeid=scopeid
			})
		}
		return this
	}
	ELExprModel.prototype.hasDependancy=function hasDependancy(nm){
		return this.dependmap.indexOf(nm)>=0
	}
	ELExprModel.prototype.getScopeModel=function (){
		return SCOPECACHE[this.scopeid]
	}
	ELExprModel.prototype.findBinding=function (fn,mode){
		if(typeof(fn)=="string"){
			return (this.exprModels||[]).find(function(a){
				return a.prop==fn
			})
		} else if(typeof(fn)=="function"){
			return (this.exprModels||[]).find(fn)
		}

	}
	ELExprModel.prototype.refresh=function refresh(scopeid){
		if(scopeid) {
			this.setScope(scopeid)
		}
		var model= this.getScopeModel();
		if(!model){
			return
		}
		for(var i= 0,l=this.exprModels||[],ln= l.length;i<ln;i++){
			l[i].calc(model,true)
		}
		if(this.children && this.children.length) {
			this.children.forEach(function(a){
				a.refresh(scopeid)
			})
		}
	}
	function getModelBindings(el){
		var ele=$d(el)
		if(!ele){return}
		return ele.data("_modelbindings_")

	}
	function setModelBindings(el,elexpr){
		var ele=$d(el)
		if(!ele){return}
		return ele.data("_modelbindings_",elexpr)

	}
	/*
	 restrict	    Determines where a directive can be used (as an element, attribute, CSS class, or comment).
	 scope	        Used to create a new child scope or an isolate scope.
	 template	    Defines the content that should be output from the directive. Can include HTML, data binding expressions, and even other directives.
	 templateUrl	Provides the path to the template that should be used by the directive. It can optionally contain a DOM element id when templates are defined in <script> tags.
	 controller	    Used to define the controller that will be associated with the directive template.
	 link	        Function used for DOM manipulation task
	 replace       //true/false
	 */
	function uiDirective(config){
		if(!$.isPlain(config)){config={}}
		this._config=config;
		Object.defineProperties(this,{
			template:{get:function(){return this._config.template },
				set:function(a){this._config.template = a} },
			templateUrl:{get:function(){return this._config.templateUrl },
				set:function(a){this._config.templateUrl = a} },
			replace:{get:function(){return !!this._config.replace },
				set:function(a){this._config.replace = !!a} },
			restrict:{get:function(){return this._config.restrict||"" },
				set:function(a){this._config.restrict = a||""}
			}
		})
	}
	uiDirective.prototype.getScope=function(){
		return SCOPECACHE[this.scopeid]
	}
	uiDirective.prototype.compile=function( element, attrs){
		if(!this._rendered){
			this.render(element, attrs)
		}
		this._compile(this.el, attrs)
	}
	uiDirective.prototype.digest=function( scope,element, attrs){
		if(!this._rendered){
			var attribs=attrs||this._config.attr||{}
			var domattr=$d.attr(element)
			if(domattr && $.isPlain(attribs)){
				attribs=$.extend(domattr,attribs)
			}
			this.render(scope,element, attribs)
		}
		return this._link.bind(this)
	}
	uiDirective.prototype._compile=function( element, attrs){
		var config=this._config
		if(!element){return}
		if(this.replace){
			$.scanDom($d(element),this.scopeid)
		}
		else if(element.firstElementChild){
			if(element.firstElementChild==element.lastElementChild){
				$.scanDom($d(element.firstElementChild),this.scopeid)
			}
		}

		return this._link.bind(this)
	}

	uiDirective.prototype._link=function( scope, element, attrs){

		if(typeof(this._config.link)=="function"){
			this._config.link(scope, element, attrs)
		} else {
			if(this._scoped){
				this._scoped.reset(scope)
			} else{
				this._scoped=$.scanDom(element,scope)
			}

		}
		//fn for refresh
		return function(rec){

		}

	}
	uiDirective.prototype._render=function(scope,element, attrs){
		if(!element){return}
		if(!this._templatefn && this._content){
			this._templatefn=$d.template(this._content)
		}
		if(this._templatefn){
			var content=this._templatefn(scope).trim()
			if(this._config.replace){
				element.el.insertAdjacentHTML('afterEnd', content);
				var nu=element.el.nextElementSibling
				element.remove();
				element=$d(nu)

			} else{
				element.html(content);
			}

		}

		this._rendered=true
		this.el=element

		var linkfn= this._compile(element, attrs)
		if(typeof(linkfn)=="function"){
			linkfn(scope, element, attrs)
		} else {

		}
	}
	uiDirective.prototype.render=function(scope,element, attrs){
		if(element){this.el=$d(element)}
		var element=$d(this.el)
		if(!element || this._rendering){return}
		this._rendering=true
		if(!this._content) {
			if (this._config.template) {
				this._content=this._config.template

			} else if (this._config.templateUrl) {
				var str=app.getResource(this._config.templateUrl,function(scope,element1, attrs1,str){
					this._content=str
					this._render(scope,element1, attrs1)
				}.bind(this,scope,element, attrs))
				return
			}
		}
		this._render(scope,element, attrs)
	}


	function BaseExprModel(){

	}
	//BaseExprModel.prototype.shared={vars:[],dependMap:{}};

	BaseExprModel.prototype.initExpr=function initExpr(expr,op,prop,shared){
		this.el=null
		this.origexpr=this.expr=String(expr).trim();
		this.op=op;
		this.prop=prop
		this.id= "id"+(++cntr)
		if(shared && typeof(shared)=="object" && shared.vars){
			this.shared= shared;
		}

	}
	BaseExprModel.prototype.onTrigger=function(ev){
		if(typeof(this._callback)=="function"){
			this._callback.call(this,ev)
		}
	}
	BaseExprModel.prototype.addTrigger=function( ){
		var el=$d(this.el)
		if(!el){return}
		this._boundtriggerfn||(this._boundtriggerfn=this.onTrigger.bind(this));
		var trigger=this.trigger

		if(trigger=="bind"){
			trigger=this.isIp?"change":"pointer"
		}

		if(trigger=="pointer" || !this.isIp){
			el.on( "click.binder",  this._boundtriggerfn)
		} else{
			if(this.isIp){
				el.el.addEventListener("change",this._boundtriggerfn)
			}
		}


	}
	BaseExprModel.prototype.parseExpr=function parseExpr(exprto ){
		var prop=this.prop,expr=exprto||this.expr
		if(!expr){return}

		if(expr.indexOf("message.")==0){
			this.exprInfo={ismessage:true,messageid:expr.substr("message.".length)}
		} else{
			expr=expr.replace(/([^=<>!])=([^=])/,"$1==$2")
			if(this.istemplate!==false && expr.indexOf("${")>=0){this.istemplate=true}
			this.exprInfo=exprInfo(expr,this.istemplate)||{}
			var vars=this.exprInfo.vars||[this.exprInfo.id]
			this.addVars(vars);
		}

		return this.exprInfo
	}

	BaseExprModel.prototype.applyToDom=function(val){

	}
	BaseExprModel.prototype.inspect = function(a) {
		var format,attr=this.attribs||{}
		if (attr) {
			var type  = attr.format || attr.type;
			if (type) {
				var c = $.typeInfo.typeMap[type];
				if(c && c.coerce && $.typeInfo.defaultType != c && !c.nill && !c.string){this.info = c}
				if(this.info ){
					if(this.info._defaultFormat){
						format=this.info._defaultFormat;
					}
				}
			}
			if(!format){
				format=type
			}
			attr.format=format;
		}
		if(!format) {

		}
		if (format) {
			this.attribs||(this.attribs={});
			this.attribs.format=format
		}
		return this.setupDomSelection()
	}
	BaseExprModel.prototype.setAttr=function(name,val){
		this.attribs||(this.attribs={})
		this.attribs[name]=val
	}
	BaseExprModel.prototype.getScopedModel=function(scopeid){
		return (scopeid && typeof(scopeid)=="string")?SCOPECACHE[scopeid]:SCOPECACHE[this.scopeid]
	}
	BaseExprModel.prototype.calc=function(model,andapply){
		if(!(model && typeof(model.get)=="function")){model=null}
		var  cxt=model||this.getScopedModel(),val  ;
		if(!this.exprInfo){return}
		if(this.exprInfo.ismessage){
			val=app.resolveMessage(this.exprInfo.messageid)
		} else{
			if(!this.exprInfo.fn){
				val=this.exprInfo.id? $.resolveProperty(cxt,this.exprInfo.id):null
			}
			else{
				val=this.exprInfo.fn.call(cxt,cxt)
			}
		}
		if(andapply===true){
			this.applyToDom(val)
		}

		return val;
	}
	BaseExprModel.prototype.setEl=function( el){
		this.el=el;
		this.isIp=!!$d.isFormInput(el)
		if(this.isIp && (this.domprop=="text"||this.domprop=="expr"||this.domprop=="bind"||this.domprop=="model")){this.domprop="val"}
		if(this._callback && this.args && $d.domdata(this.el,"key") && !this.args.some(function(a){return a && a.val=="data-key"})) {
			this.elpropkey="data-key";
			//this.args.push({val:"data-key",isdomprop:true})
		}
		if(this.exprInfo && this.exprInfo.ismessage){
			this.applyToDom(this.calc())
		}
		this.el && this.onEl && this.onEl()
		this.el && this.setupDomSelection();

	}
	BaseExprModel.prototype.setupDomSelection=function( ){
		if(this.trigger){
			this.addTrigger();
		}
	}
	BaseExprModel.prototype.isDependantOn=function(nm){
		return this.vars && this.vars.indexOf(nm)>=0
	}
	BaseExprModel.prototype.addToShared=function(shared){
		var vars=this.vars||(this.vars=[]);
		if(!shared){shared={}}
		shared.vars||(shared.vars=[]);
		shared.dependmap||(shared.dependmap={});
		if(!vars.length){return shared}
		var sh=shared.vars,mp=shared.dependmap
		for(var i= 0,l= vars,ln= l.length;i<ln;i++){
			sh.indexOf(l[i])==-1 && sh.push(l[i]);
			mp[l[i]]||(mp[l[i]]=[]);
			mp[l[i]].indexOf(this.id)==-1 &&  mp[l[i]].push(this.id)
			if(l[i].indexOf(".")>0){
				var nm=l[i].split(".")[0]
				mp[nm]||(mp[nm]=[]);
				mp[nm].indexOf(this.id)==-1 && mp[nm].push(this.id)
			}
		}
		return shared
	}
	BaseExprModel.prototype.addVars=function(vars){
		if( vars){
			if(vars.length==1 && vars[0]==this.origexpr){
				this.isId=true
			}
			var thisvars=this.vars||(this.vars=[]);
			for(var i= 0,l= vars,ln= l.length;i<ln;i++){
				thisvars.indexOf(l[i])==-1 && thisvars.push(l[i]);
				if(l[i].indexOf(".")>0){
					var nm=l[i].split(".")[0]
					thisvars.indexOf(nm)==-1 && thisvars.push(nm);
				}
			}

		}
		if(this.shared){
			this.addToShared(this.shared)
		}
	}
	BaseExprModel.prototype.getTarget=function(target){
		var elem,domprop=this.domprop
		if(target && target.nodeType){
			elem=target;
		} else {
			elem=this.el;
			if(typeof(elem)=="string"){
				elem=document.getElementById(elem)
			}
		}
		return elem||null

	}
	BaseExprModel.prototype.prepareVal=function(val,valueModel){
		if(val===NaN){val=0}
		if(val==null ){val=""}
		var attr=this.attribs,frmt=attr?attr.format:null
		if(val && frmt || typeof(val)=="object"){
			val = $.format(val,frmt)
		}
		if(!val  && attr && attr.defaultvalue!=null){
			if(attr.defaultvalue=="nbsp"){val="&nbsp;"}
			else {val=attr.defaultvalue;}
		}

		//if(this._last===val){return}
		//console.log(this.el,this.domprop,val)
		if(this.domprop=="text"||this.domprop=="val"||this.domprop=="expr"){
			if(val==null ){val=""}
			else if(typeof(val)=="object" && valueModel){{
				val=valueModel.getItem(this.expr)
				if(val==null ){val=""}
			}
			}
		}
		val=String(val).replace(/null|undefined|\[object Object\]/g,"").trim().replace(/,$/g,"")
		return val
	}
	BaseExprModel.prototype.parseArgs=function(str){
		var ar=[]
		if(typeof(str)=="string"){ar=str.split(/\s*,\s*/)}
		else if(Array.isArray(str)){ar=str};
		return ar.map(function(a){
			var v=a.trim(),ret={val:v};
			if(/^[a-z_][\w_\.\-]+$/.test(v)){
				if(v.indexOf("data-")==0 || v.indexOf("style.")==0){
					v.isdomprop=true
					ret.val=ret.val.replace(/^style\./,"")
				} else{v.isexpr=true}
			}
			return ret
		});
	}
	BaseExprModel.prototype.getContext=function( ){
		return this.shared
	}
	BaseExprModel.prototype.execScopedFn=function( fn,A,scope){
		if(!fn){
			return
		}
		A=A||[]
		if(!$.isArray(A)){A=[A]}
		var scopedmodel=scope
		if(scope && scope.model && typeof(scope.model)=="object"){
			scopedmodel=scope.model
		}
		if(typeof(fn)=="string"){
			if(scopedmodel.getController().hasMethod(fn)){
				scopedmodel.getController().invoke(fn,A)
			} else if(scopedmodel!==scope &&  scope.getController && scope.getController().hasMethod(fn)){
				scope.getController().invoke(fn,A)
			} else if(scopedmodel._parentController &&  scopedmodel._parentController.hasMethod(fn)){
				scopedmodel._parentController.invoke(fn,A)
			}
		} else if(typeof(fn)=="function"){
			fn.apply(scope,A)
		}
	}
	BaseExprModel.prototype.execFn=function( fn,scopeid){
		var scope=this.getScopedModel(scopeid)
		if(!scope || scope!= this.shared.model){

		}
		var args=[],elpropval ,scopedmodel=scope

		if(scope && scope.model && typeof(scope.model)=="object"){
			scopedmodel=scope.model
		}

		for(var i= 0,l=this.args||[],ln= l.length;i<ln;i++){
			if(l[i] && typeof(l[i])=="object" && l[i].val && scopedmodel){
				if(l[i].isexpr){args.push($.resolveProperty(scopedmodel,l[i].val))}
				else if(l[i].isdomprop){args.push(el.prop(l[i].val))}
				else{args.push(l[i].val)}
			} else {
				args.push(l[i])
			}
		}

		if(this.elpropkey){
			elpropval=$d.prop(this.el,this.elpropkey)
		} else  {
			var el=$d(this.el)
			if(el&& el.el.type=="date" && el.el.valueAsDate){
				elpropval = +($.date(el.el.valueAsDate)||0)
			}
			else{
				elpropval=$d.val(this.el)
			}
		}
		if(!fn){
			if(scopedmodel && elpropval!=null){
				$.updateProperty(scopedmodel,this.expr,elpropval)
			}
		} else{
			if(this.elpropkey){args.push(elpropval)}
			this.execScopedFn(fn,args,scope)
		}

	}
	function ExprDirectiveModel(config){
		this.dirconfig=config||{} ;
	}
	ExprDirectiveModel.prototype=new BaseExprModel();
	ExprDirectiveModel.prototype.init=function init(expr,op,prop) {
		this.canhaveattr=true
		this._directive=getDirective(prop)
		this.dirconfig=expr;
		if(expr && typeof(expr)=="string"){
			if(expr.indexOf("{")==0){
				try{var x=null; eval("x="+expr);this.dirconfig=x	} catch(e){}
			}
		}


	}
	ExprDirectiveModel.prototype.applyToDom=function applyToDom(value) {

	}
	ExprDirectiveModel.prototype.onEl=function onEl(value) {
		if(this._directive){
			this._directive.digest(this.getScopedModel(),this.el, $.extend({},this.attribs||{},this.dirconfig||{}))
		}
	}

	function ExprBlockModel(blockinfo){
		this.block=blockinfo||{} ;
	}
	ExprBlockModel.prototype=new BaseExprModel();
	ExprBlockModel.prototype.init=function init(expr,op,prop) {this.canhaveattr=true;
		var expr=this.block.expr|| expr
		if( prop=="repeat"){
			var parts=expr.split(/(?:^\|)|(?:^\|)/)
			if(/\s+in\s+/.test(parts[0])){
				var iterators=parts[0].split(/\s+in\s+/)
				this.iterator=iterators[0]
				expr=this.expr=iterators[1]
			} else{
				expr=this.expr=parts[0]
			}
			this.block.op="#"
		}
		this.initExpr(expr, op, "block");
		if(this.block.op==">"){
			this.loadPartial();
			this.applyToDom=function(){};
		} else if(this.block.op=="!"){//comments - nothing
			this.applyToDom=function(){};
		} else if(this.block.op=="#" || this.block.op=="^"){//truthy
			if(this.block.content && Array.isArray(this.block)&& this.block.content.length){
				var txt=this.block.content.join("").replace(/\sid\s*\=\s*['"][\w\_\-]+['"]/g,"").trim()
				if(txt){
					this._eltemplate=$d.template(txt);
				}

			}

			this.parseExpr()
		}
	}
	ExprBlockModel.prototype.loadPartial=function loadPartial( ) {
		app.getResource(this.expr,
			function(a){
				var contnr=$d(this.el),doreplace
				if(!contnr && this.block && this.block.start){
					contnr=$d(this.block.start)
					doreplace=true
				}
				if(!contnr || !contnr.el){
					return
				}
				if(doreplace && contnr.el.parentNode && this.block.op==">"){
					var div=document.createElement("div")
					div.innerHTML=a;
					if(div.childElementCount==1){
						$d(contnr.el.parentNode.insertBefore(div.firstChild,contnr.el))
					}
					else{
						while(div.firstChild){
							contnr.el.parentNode.insertBefore(div.firstChild,contnr.el)
						}
					}
					contnr.el.parentNode.removeChild(contnr.el)
					contnr=null
				}
				else {
					contnr.html(a);
				}
				if(contnr){
					//$.partialView.processScopedStyles(contnr)
					this._eltemplate=$d.template(contnr.html());
				}

			}.bind(this)
		)
	}
	ExprBlockModel.prototype.applyToDom=function applyToDom(value) {
		var val=!!value,show=this.block.op=="#"?val:!val
		var cntnr=$d(this.el),isempty
		if(!cntnr){return}
		if(show){
			if(this.block.isproxyNode){
				if(!(this.block.startMarker && this.block.startMarker.parentNode)){
					var markerstart=document.createComment("block-marker-start:"+this.id)
					this.block.startMarker=cntnr.el.parentNode.insertBefore(markerstart,cntnr.el)
					this.block.endMarker=cntnr.el.parentNode.insertBefore(document.createComment("block-marker-end:"+this.id),cntnr.el)
				}
			}
			var bindings=value && typeof(value)=="object"?value:this.getScopedModel()
			if(!this._eltemplate){
				if(this.block.isproxyNode){
					this._eltemplate=$d.template( cntnr.innerHTML.replace(/\sid=['"][^'"]+?['"]/g," "))
				} else {
					var clone=cntnr.clone(true,true);
					[].forEach.call(clone.querySelectorAll("*"), function (a) {
						if (!(a.innerHTML||"").trim() && a.getAttribute("z-expr")) {
							a.innerHTML = a.getAttribute("z-expr");
						}
					})
					this._eltemplate=$d.template( clone.innerHTML.replace(/\sid=['"][^'"]+?['"]/g," "))
					$d.remove(clone)
				}


			}
			if(this._eltemplate ) {
				if ($.isArrayLike(value) || value instanceof $.model.Collection) {
					if(!value.length){isempty=true}
					if(cntnr){
						$d.clear(cntnr)
					} else{
						cntnr=document.createElement("div")
					}

					var html=[],iterator=this.iterator
					if(value instanceof $.model.Collection){
						html=value.collect(function (v) {
							if(iterator){isempty=false
								var data={};
								data[iterator]=v;
								return this._eltemplate(data)
							}
							return this._eltemplate(v)
						}.bind(this))
					}
					else {
						html = $.collect(value, function (v) {
							if(iterator){isempty=false
								var data={};
								data[iterator]=v;
								return this._eltemplate(data)
							}
							return this._eltemplate(v)
						}, this)
					}

					cntnr.html(html.join(""))
				} else {
					$d.html(cntnr, this._eltemplate(bindings))
				}

			}
			if(this.block.startMarker && this.block.endMarker){
				if(isempty || cntnr.firstChild){
					var elm=this.block.startMarker.nextSibling
					while(elm){
						if(elm==this.block.endMarker){break;}
						var e=elm
						elm=elm.nextSibling
						e.parentNode && e.parentNode.removeChild(e);
					}
				}
				if(cntnr.firstChild){
					while(cntnr.firstChild){
						this.block.endMarker.parentNode.insertBefore(cntnr.removeChild(cntnr.firstChild),this.block.endMarker)
					}
				} else {
					var elm=this.block.startMarker.nextSibling
					while(elm){
						if(elm==this.block.endMarker){break;}
						elm.style && $d.show(elm);
						elm=elm.nextSibling
					}
				}
				$d.hide(cntnr)
			}
			else{
				$d.show(cntnr)
			}
		} else {
			if(this.block.startMarker && this.block.endMarker){
				var elm=this.block.startMarker.nextSibling
				while(elm){
					if(elm==this.block.endMarker){break;}
					elm.style && (elm.style.display="none");
					elm=elm.nextSibling
				}
				$d.hide(cntnr)
			}
			$d.hide(cntnr)
		}

	}



	function ExprModel( expr,op,prop){
		if(expr==null){return}
	}
	ExprModel.prototype=new BaseExprModel();
	ExprModel.prototype.init=function init(expr,op,prop,shared){
		this.canhaveattr=true;
		this.initExpr(expr,op,prop,shared);
		this.parseExpr()
		this.domprop=(prop=="bind"||prop=="model"||prop=="expr")?"text":prop

		if(this.prop=="target"||this.prop=="bindTo"||this.prop=="bindto" ){
			this.trigger="bind"
			this.domprop=this.prop=="target"?"":"ipval"
		}

		if(this.method||(this.exprInfo?this.exprInfo.fnname:null)) {
			if (!this.trigger) {
				this.trigger = "pointer"
			}
		}
		if (this.trigger) {
			this.args=[]
			this._callback=function(){
				var  el=$d(this.el)
				if(!el || el.selfOrUp("[disabled]")){
					console.log("disabled")
					return
				}

				var sid,models=getModelBindings(el)
				if(models ){
					sid=models.scopeid
				}
				this.execFn(this.method ,sid)
			}
		}
	}

	//what happens when vars change
	ExprModel.prototype.applyToDom=function(value,target){
		var elem=this.getTarget(target),domprop=this.domprop
		if(!elem || this.prop=="switch-when"){
			return
		}
		if(typeof(value)=="function"){
			var model=this.getScopedModel()
			value=value.call(model);
		}
		if(!this.isIp && domprop=="text"){
			this.isIp=!!$d.isFormInput(elem)
			if(this.isIp){this.domprop=domprop="ipval"}
		}
		if(domprop=="ipval"){
			domprop=this.isIp?"val":""
		}
		if(!domprop ){return
			/*if(this.trigger=="bind" && this.isIp){
			 domprop="val"
			 } else{
			 return
			 }*/
		}

		var val=this.prepareVal(value)
		if(this.domPropertyHandle){
			this.domPropertyHandle(val, domprop,elem)
		}
		else{
			if(  domprop=="val" ){
				var el=$d(elem.el||elem)
				if(el&& el.el&& el.el.type=="date" && "valueAsDate" in el.el){
					if(val){
						val= $.date(val)
					}
					if(val){
						val=el.el.valueAsDate=new Date((+val) )
						val=+val;
					}
					else{el.value=""}
				}
				else{
					$d.val(elem, val==null?"":val)
				}
			}
			else{
				$d.prop(elem, domprop,val==null?"":val)
			}
		}
		this._last=val
	}
	function ExprSwitchModel(){ }
	ExprSwitchModel.prototype=new ExprModel();
	ExprSwitchModel.prototype.applyToDom=function applyToDom(value) {
		var cntnr=$d(this.el)
		if(!cntnr){return}
		cntnr.descendants(true).each(function(a){
			var chld=getModelBindings(a);
			var bound=chld?chld.findBinding("switch-when"):null
			if(bound && bound.calc()==value){
				$d.show(bound.el)
			} else{
				$d.hide(bound.el)
			}

		})

	}
	function ExprEventModel( expr,op,prop){
		this.invokable=true;
		if(expr==null){return}
		this.init(expr,op,prop )
	}
	ExprEventModel.prototype=new ExprModel();
	ExprEventModel.prototype.init=function init(expr,op,prop) {
		prop=String(prop).replace(/^on/,"").trim()
		//check if a selector is included
		if(typeof(expr)=="string" && !/\s/.test(expr) && expr.indexOf("::")>0){
			var arr=expr.split("::")
			this._selector=arr.pop();
			expr=arr[0]
		}
		this.initExpr(expr, op, prop);
		if(/^[\w+]$/.test(expr)){
			this.exprInfo={expr:expr,id:expr,fn:expr,vars:[]}
		}
		else{
			this.parseExpr()
		}
		this._callback=function(ev){
			if(!this.exprInfo){return}
			var S=this.getScopedModel()
			var args=this.exprInfo.args,A=[].slice.call(arguments) ,scopedmodel=S
			var  el=$d(this.el)
			if(!el || el.selfOrUp("[disabled]")){
				console.log("disabled")
				return
			}
			if(S && S.model && typeof(S.model)=="object"){
				scopedmodel=S.model
			}
			if(args && args.length){
				A= A.concat(args.map(function(a){ return (isNaN(a) && !/['"']/.test(a) && scopedmodel.contains(a))?scopedmodel.get(a):a} ))
			}
			this.execScopedFn(this.exprInfo.fnname||this.exprInfo.fn||this.exprInfo.id,A,S)
		}.bind(this)
	}
	ExprEventModel.prototype.onEl=function init(expr,op,prop) {
		$d.on(this.el,this.prop+".ExprEventModel",this._callback,{selector:this._selector})
	}
	ExprEventModel.prototype.applyToDom=function(value,target){
	}
	function ExprOptionsModel( expr,op,prop){
		if(expr==null){return}
		this.init(expr,op,prop )
	}
	ExprOptionsModel.prototype=new ExprModel();
	ExprOptionsModel.prototype.applyToDom=function(value,target){
		var elem=this.getTarget(target),domprop=this.domprop
		if(!elem){  return }
		$d.addOptions(elem,value)
	}
	function ExprVisibilityModel( expr,op,prop){
		if(expr==null){return}
		this.init(expr,op,prop )
	}
	ExprVisibilityModel.prototype=new ExprModel();
	var falsies=["0" ,"null" ,"undefined" ,"false" ,"hidden" ,"none","hide"]

	ExprVisibilityModel.prototype.applyToDom=function(value,target){
		var elem=this.getTarget(target),domprop=this.domprop
		if(!elem){  return }
		if(!value || (typeof(value)=="string" && falsies.indexOf(value)>=0)){
			if(domprop=="visibility"){
				$d.css(elem,"visibility","hidden")
			}
			else if(domprop=="disappear"){
				$d.disAppear(elem)
			}
			else if(domprop=="hideflex"){
				$d.css(elem,"display","none")
			}
			else {
				$d.hide(elem)
			}
		} else {
			if(domprop=="visibility"){
				$d.css(elem,"visibility","visible")
			}
			else if(domprop=="appear"){
				$d.appear(elem)
			}
			else if(domprop=="hideflex"){
				$d.css(elem,"display","flex")
			}
			else {
				$d.show(elem)
			}
		}
	}
	function ExprClassModel( expr,op,prop){
		if(expr==null){return}
		this.init(expr,op,prop )
	}
	ExprClassModel.prototype=new ExprModel();
	ExprClassModel.prototype.init=function(expr, op, prop){
		this._marker=" -- "
		this.classExpr=expr.replace(/\{\{(.*?)\}\}/, this._marker)
		this.initExpr(expr, op, prop);
	}

	ExprClassModel.prototype.applyToDom=function(value,target){
		var elem=this.getTarget(target),domprop=this.domprop
		if(!value){  value="blank-ph"}
		if(!elem || !value){  return }
		if(!this.classExpr){
			this.classExpr=elem.className.replace(/\{\{(.*?)\}\}/, " -- ")
		}
		var val=String(value)
		var expr=this.classExpr
		if(this._last && this._last==val){return}
		if(this._last){expr=expr.replace(this._last+this._marker,this._marker)}
		elem.className=expr.replace(this._marker,val+this._marker)
		this._last=val
	}

	function ExprStyleModel( expr,op,prop){
		if(expr==null){return}
		this.init(expr,op,prop )
	}
	ExprStyleModel.prototype=new ExprModel();
	ExprStyleModel.prototype.init=function init(expr,op,prop) {
		this.initExpr(expr, op, prop);
		this.stylelist = []
		for(var i= 0,l=expr.split(";"),ln= l.length;i<ln;i++) {
			if(DOUBLECURLY_RE.test(l[i])){
				var ar = l[i].split(":")
				var info=this.parseExpr(ar[1].replace(/\{\{(.*?)\}\}/, "$1").trim())
				this.stylelist.push([ar[0],{fn:info.fn,id:info.id}])
			}
		}
		this.domprop=prop
	}

	ExprStyleModel.prototype.applyToDom=function(value,target){
		var elem=this.getTarget(target),domprop=this.domprop,scope=this.getScopedModel(),scopedmodel=scope

		if(scope && scope.model && typeof(scope.model)=="object"){
			scopedmodel=scope.model
		}
		if(!elem || !scopedmodel){  return }

		if(this.stylelist){
			for(var i= 0,l=this.stylelist,ln= l.length;i<ln;i++) {
				var val,L=l[i]
				if(L[1].fn){
					val=L[1].fn(scopedmodel)
				} else {
					val= $.resolveProperty(scopedmodel,L[1].id)
				}
				if(val!=null){
					if(val===NaN){val=0}
					$d.css(elem,L[0],val)
				}
			}
		}

	}
	registerDirective("toggle",{
		link:function(scope,element,attr){
			element.hover(function(){
				this.css("backgroundColor",attr.reg)
			},function(){
				this.css("backgroundColor",attr.alt)
			})

		}
	})
	registerDirective("showlist",{
		link:function(scope,element,attr){
			element.hover(function(){
				this.css("backgroundColor",attr.reg)
			},function(){
				this.css("backgroundColor",attr.alt)
			})

		}
	})
	registerDirective("calendar",{
		link:function(scope,element,attr){
			var cal= $.require("UI.Calendar");
			element.on("click",function(){
				cal(null,{
					onselect:function(e){
						scope.set(attr.model,e)
						this.view.hide()
					}
				})
			})

		}
	})
	//utils

	function processTextNode(data  ){
		if(!(data.val && String(data.val).trim())){return}
		data.val = data.val.trim().replace(/{{|}}/g, "").trim()
		data.isexpr=true
		//if block operation
		if(/^[\^#\>\/!]/.test(data.val)){
			data.isblock=true;
			data.val= data.val.trim().replace(/^[\^#\>\/!]/,function(a){data.op=a;

				return ""
			}).trim()
			if(data.op==">"){
				data.ispartial=true
			} else if(data.op=="/"){
				data.isblockend=true
			} else if(data.op=="#" || data.op=="^"){
				data.isblockstart=true
			}
		}
		data.name=data.name||"expr"
		return data
	}
	function isInScope(el,scopeid){
		if(el && el.getAttribute && el.getAttribute("z-scope") && el.getAttribute("z-scope") != scopeid){
			var scp=el.getAttribute("z-scope");

			return false
		}
		return true
	}
	function wrapTextNode(elem){
		var expr=elem.textContent.trim()
		var span=document.createElement("span")
		elem.parentNode.replaceChild(span,elem)
		return processTextNode({name:"expr",val:expr,el:$d(span).el,isproxyNode:true})

	}

	function inspectProp(prop,val){
		var data={val:val}
		if (prop.indexOf("data-") == 0) {
			prop = prop.substr("data-".length)
			if (prop == "cmd" || prop == "bind" || prop == "bindTo" || prop == "bindto" || prop == "model" || prop == "binder") {
				data.isexpr = true;
				data.name = prop
				data.domattr=true
				return data;
			}
		}
		var type
		if(getDirective(prop)) {
			data.isexpr=true;
			data.domattr=true
			type="ui"
		}
		else {
			var mtch =  prop.match(/(ui|z|ng)([\-\:[A-Z])([\w\-]+)/)
			if (mtch) {
				type = mtch[1]
				var sep = mtch[2], nm = mtch[3]
				if (sep != ":" && sep != "-") {
					nm = sep.toLowerCase() + nm
				}
				data.domattr=true
				data.isexpr = true;
				prop = nm;
				if (type != "ui") {//directive
					//
					if (type != "ui" && (prop == "format" || prop == "args" || prop == "type" || prop.indexOf("attr-") == 0 || prop == "defval" || prop == "defaultvalue" || prop == "filter"
						|| prop == "order")) {
						if (prop == "defval") {
							prop = "defaultvalue"
						}
						data.isattr = true;
					} else if (prop.indexOf("on") == 0 || prop == "click" || prop.indexOf("mouse") == 0 || prop.indexOf("key") == 0 || prop == "change" || prop == "input") {
						data.isevent = true
						prop = prop.replace(/^on/, "")
					} else {
						data.isexpr = true;
						if (prop == "repeat" || prop == "block" || prop == "switch") {
							data.isblock = true;
						}
					}


				}
			}
		}
		if (data.val  && DOUBLECURLY_RE.test(data.val)) {
			data.isexpr=true;
			data.val = data.val.replace(DOUBLECURLY_EXPRRE, "$1").replace(/"/g, '\\"').trim()
		}
		if(data.isexpr) {
			data.name = prop
			data.type = type
			return data;
		}

	}

	function getBindableProps(el,type,memo){
		if (type == 1 && !isInScope(el, memo.scopeid)) {
			return true; //skip self and children
		}
		var holder=memo.holder
		if(!(el && el.nodeType==1)){return null}
		var props=[],txtnodes=[]
		for (var i = 0, attr=el.attributes,ln = attr.length; i < ln; i++) {
			if(!(attr[i] && attr[i].name)){continue}
			var data=inspectProp(attr[i].name,attr[i].value)
			if(data) {
				props.push(data);
			}
		};
		if (el.firstChild ) {
			var textnodes=[].slice.call(el.childNodes).filter(function(a){return a.nodeType==3 && DOUBLECURLY_RE.test(a.textContent)})
			if(textnodes.length){
				//has only text
				if(textnodes.length==1 && el.childNodes.length==1 && DOUBLECURLY_EXPRRE.test(String(textnodes[0].textContent).trim())){
					props.push({name:"text",val:String(textnodes[0].textContent).trim().replace(DOUBLECURLY_EXPRRE, "$1").replace(/"/g, '\\"').trim()})
				} else {
					textnodes.forEach(
						function(elem){
							data= wrapTextNode(elem)
							data && txtnodes.push(data)
						}
					)
				}
			}
		}
		el.id||$d(el)
		var id=el.id
		if(props.length) {
			holder[id]||(holder[id]={bindings:[]});
			props.map(function(data){
				data.el=el;
				if(!data.isattr){
					holder[ id].bindings.push(data);
				}
				if(data.name && data.name!="text" && !data.isblock){
					holder[ id].attr||(holder[ id].attr={})
					holder[ id].attr[data.name]=data.val
				}
			});
		}
		if(txtnodes && txtnodes.length) {
			txtnodes.map(function(data){
				var el=data.el;
				el.id||$d(el)
				var id=el.id
				holder[id]||(holder[id]={bindings:[]});
				holder[ id].bindings.push(data);
			});
		}
		return holder;
	}
	function  injectPartial (el, template ,memo) {
		var str = app.getResource(template)
		if (str && typeof(str)=="string" && str.length) {
			if(el.nodeType==3) {
				var tmp = el.parentNode.insertBefore(document.createElement("span"), el);
				tmp.insertAdjacentHTML('afterEnd', str);
				tmp.parentNode.removeChild(tmp);
				el.parentNode.removeChild(el);
			} else {
				el.innerHTML=str;
			}
			return
		}
	}
	function  replaceTextNodes (el, type,memo) {
		type = type || el.nodeType
		if (type == 1 && memo.scopeid && !isInScope(el, memo.scopeid)) {
			return true; //skip self and children
		}
		if (type == 1 && el.classList.contains("z-block")) {
			return
		}
		if (type == 3) {
			var partialnodes=[]
			var txt = String(el.textContent).trim()
			var  alltxtnodes=txt.match(/\{\{(.*?)\}\}/g)||[]
			if (alltxtnodes.length) {
				var notmpl=txt.replace(/\{\{(.*?)\}\}/g,"")
				if(!notmpl && alltxtnodes.length==1){
					if(/^\s*\>/.test(alltxtnodes[0].replace(/\{\{(.*?)\}\}/g,"$1").trim())) {
						partialnodes.push(el)
					}
				} else {
					var blocks=[],par= el.parentNode
					txt=txt.replace(/{{(.*?)}}/g,function(a,b){blocks.push(a);return "!~!#~"+(blocks.length-1)+"!~!"})
					txt.split("!~!").forEach(function(a){
						if(!a){return}
						var txt=a;
						if((a.indexOf("#~")==0 && !isNaN(a.substr(2)))){txt=blocks[+(a.substr(2))]}
						var newnode = document.createTextNode( txt )
						par.insertBefore(newnode, el);
					})
					par.removeChild(el);
					for(var i= 0,l=par.childNodes;i< l.length;i++){
						if(l[i].nodeType!=3){continue}
						var txt=l[i].textContent
						if(!txt.match(/\{\{\s*\>\s*(.*?)\}\}/)){continue}
						partialnodes.push(l[i])
					}


				}
				partialnodes.forEach(function (el) {
					var txt = String(el.textContent).trim()
					var nm=txt.replace(/{{|}}/g, "").trim()
					if(/^\s*\>/.test(nm)) {
						nm = nm.replace(/^\s*\>/, "").trim()
						injectPartial(el, nm ,memo)
					}
				});

			}
		} else if (type == 1) {
			var template=el.getAttribute("z-include")||el.getAttribute("z:include")||el.getAttribute("ng-include")||el.getAttribute("ng:include")
			if(template){
				injectPartial(el, template ,memo)
			}
		}


	}
	function findBinding(holder,fn,andremove){
		var res=null
		for(var i= 0,l=Object.keys(holder),ln= l.length;i<ln;i++){
			var elid=l[i];
			if(holder[elid] && holder[elid].bindings && holder[elid].bindings.length){
				if(res=holder[elid].bindings.find(fn )){
					if(andremove===true) {
						holder[elid].bindings.splice(holder[elid].bindings.indexOf(res),1)
					}
					break;
				}
			}
		}
		return res;
	}
	function _resolveBlock(start,memo,data) {
		start.processed=true;
		var name= start.val,container=memo.holder
		var end=findBinding(container,function(b){return b && b.isblockend && b.val==name});
		if(!end){container=data.holder
			end=findBinding(container,function(b){return b && b.isblockend && b.val==name});
		}
		if(end && end.el && start.el){
			end.processed=true;
			if(end.el != start.el){
				if($d(end.el).parent()==$d(start.el).parent()){
					var endid=$d(end.el).id,tocopy=[];
					$d.nextAll(start.el).every(function(e){
						if($d(e).id==endid){return false}
						tocopy.push(e);
					})
					while(tocopy.length){
						$d(start.el).append($d(tocopy.shift()))
					}
				}
				end.isproxyNode && $d.remove(end.el)
			}

			return true
		}
	}
	function _proc(el,data){
		el.el.normalize && el.el.normalize();
		var scopedel= (data.scopeid?$d.selfOrDown(el,"[z-scope='"+data.scopeid+"']"):null)||el
		var memo={holder:{},revHolder:data.revHolder,scopeid:data.scopeid,scope:data.scope,ctor:data.ctor}

		scopedel.traverse({enter:replaceTextNodes,memo:memo});
		scopedel.traverse({enter:getBindableProps,memo:memo});
		Object.keys(memo.holder).forEach(
			function(elid){
				var H=memo.holder[elid],ELExprs=[]
				if(H && H.bindings && H.bindings.length){
					var B = [].slice.call(H.bindings)
					B.forEach(
						function(a){
							if(a.processed||a.isblockend||a.name=="scope"||a.name=="app"){
								return
							}
							if(a.isblockstart && !_resolveBlock(a,memo,data)){
								return
							}
							if(a.name=="switch-when"){
								var expr=a.val
								if(expr && /^[\w\-]+$/.test(expr)&& isNaN(expr)){
									a.val="'"+a.val+"'"
								}
							}

							var ELExpr=memo.ctor(a)
							if(ELExpr) {
								if (ELExpr && ELExpr.canhaveattr) {
									if (H.attr) {
										$.each(H.attr, function (v, k) {
											ELExpr.setAttr(k, v)
										});
									}
								}
								ELExpr.setEl(elid)
								memo.revHolder[ELExpr.id] = ELExpr;
								ELExpr.inspect()
								ELExprs.push(ELExpr)
							}
						}
					);
					if(ELExprs.length) {
						var elbindings = new ELExprModel(elid, memo.scopeid)
						if (memo.root) {
							memo.root.children.push(elbindings)
						} else {
							memo.root = elbindings;
						}
						elbindings.exprModels = ELExprs;
						elbindings.attr = $.clone(H.attr || {})
						setModelBindings(elid, elbindings);


					}
				}
			}
		);
		if(memo.holder && Object.keys(memo.holder).length){
			Object.assign(data.holder,memo.holder)
		}
	}
	function addDataBindings( data) {

		var scope=data.scope,valueModel=data.valueModel,revHolder=data.revHolder, ctor=data.ctor,bindings=data.bindings
		if(!scope){return}
		var scopedModel=scope
		if(scope && scope.model && typeof(scope) == "object"){
			scopedModel=scope.model
		} else {
			scopedModel=scope
		}
		if (bindings.indexOf(scope) == -1) {
			var vars = ctor.shared.vars,listeningon= ctor.shared.listeningon||(ctor.shared.listeningon=[]);
			if (scopedModel && typeof(scopedModel) == "object") {

				var cb = function (rec) {
					var name = rec.qname || rec.name
					if (name && vars.indexOf(name) >= 0) {
						if (rec.object && rec.object == valueModel.attributes) {
						}
						valueModel.set(name, rec.value || rec.newValue);
					}
				};
				for (var i = 0, l = vars, ln = l.length, k; k = l[i], i < ln; i++) {
					if (k && typeof(k) == "string" && listeningon.indexOf(k)==-1) {
						if (scopedModel.onPathChange) {
							scopedModel.onPathChange(k, cb)
						} else if (scopedModel.properties && scopedModel.properties.onPathChange) {
							scopedModel.properties.onPathChange(k, cb)
						}
						listeningon.push(k)
					}
				}
				bindings.push(scope)
			}
		}
		valueModel.update(scopedModel)
		return valueModel;
	}
	function _procInitListener (data) {
		var revHolder=data.revHolder, ctor=data.ctor
		var shared=ctor.shared
		var valueModel = new $.simpleModel(data.scopeid,  shared.vars);
		data.valueModel=valueModel
		shared.valueModel = valueModel
		var mp =  shared.dependmap
		valueModel.on(
			function (rec) {
				if (mp[rec.name]) {var revHolder=data.revHolder
					for (var i = 0, l = mp[rec.name], ln = l.length; i < ln; i++) {
						if (revHolder[l[i]]) {
							var res, M = revHolder[l[i]]
							if (M.isId) {
								res = this.get(M.expr)
							}
							else {
								res = M.calc(this)
							}
							M.applyToDom(res)
						}
					}
				}
			}
		)

		valueModel.update = function (model, reset) {
			if (!(model && typeof(model) == "object")) {
				return
			}
			shared.model=model
			for (var i = 0, l = this.keys(), ln = l.length, k; k = l[i], i < ln; i++) {
				var val = $.resolveProperty(model, k)
				if (val != null || reset) {
					this.set(k, val)
				}
			}
		}


		addDataBindings(data)
		return valueModel
	}
	function createScopedCtor(data){
		return (function(scopeDATA){
			var shared=scopeDATA
			var retctor= function(expr,op,prop){
				var data={}
				if(arguments.length==1 && expr && typeof(expr)=="object"){
					data=expr
					prop=expr.name
					op=expr.op
					expr=expr.val
				}
				var nu

				if(data.ispartial || prop=="partial" || prop=="template" || prop=="include" ){
					return
				}
				if(prop=="switch"){
					nu=new ExprSwitchModel(data)
				}
				else if(data.type=="ui"){
					nu=new ExprDirectiveModel(data)
				} else if(data.isblock || prop=="block"){
					data.expr=expr;
					nu=new ExprBlockModel(data)
				} else if(prop=="cmd" || data.isevent || (prop.indexOf("on")==0 && prop.length>3) ){
					if(prop=="cmd"){prop="click"}
					nu=new ExprEventModel( )
				}
				else if(prop=="visibility"||prop=="hide"||prop=="show"||prop=="appear"||prop=="disappear"||prop=="hideflex") {
					nu = new ExprVisibilityModel()
				} else if(prop=="options"){
					nu = new ExprOptionsModel()
				} else if(prop=="style"){
					nu=new ExprStyleModel()
				} else if(prop=="className"||prop=="class"){
					nu=new ExprClassModel()
				}  else {
					nu=new ExprModel( )
				}
				nu._processed = true;
				nu.shared=shared;
				nu.scopeid=shared.scopeid

				nu.init(expr,op,prop,shared)
				nu.inspect()
				return nu
			}
			retctor.shared=shared
			return retctor
		})(data);
	}
//API
	function createScope(elem,scopeid,scope) {
		var el=$d(elem);
		if(!el){
			return
		}
		var DATA={scopeid:scopeid,scope:scope,vars:[],dependmap:{}}
		if(DATA.scopeid){
			if(!el.is("[z-scope='"+DATA.scopeid+"']")){
			}
		}
		DATA.holder = {};
		DATA.revHolder = {};
		DATA.bindings = []
		DATA.ctor=createScopedCtor(DATA)

		_proc(elem,DATA )
		_procInitListener( DATA);
		DATA.reset=function(model) {
			if(this.scopeid){
				SCOPECACHE[this.scopeid]=model
			}
			if (model  ) {
				this.scope=model;
				addDataBindings(DATA)
			}
			this.valueModel.update(model||this.scope,true)
			this.valueModel.trigger();
			return this;
		}
		DATA.scan=function(elem){
			_proc(elem)
			return this;
		}
		DATA.digest=function(el){
			_proc(el,this );
			return this;
		}

		return DATA
	}
	var api= function(elem,scopeid,scope) {
		if(typeof(scopeid)!="string"){
			if(!scope){scope=scopeid}
			scopeid=null
		}
		if(!(scope && typeof(scope)=="object")){
			scope=null
		}
		var el = $d(elem),holder={};
		if (!el) {
			return
		}
		var scoped=null
		if(!scopeid && scope){
			scopeid=scopeid.scopeid
		}
		if(scopeid && scope){
			SCOPECACHE[scopeid]=scope
		}
		if(scopeid ){
			scoped=SCOPEMODELCACHE[scopeid]
		}

		if(!scoped ){
			scoped= createScope(elem,scopeid,scope)
			if(scopeid && scoped){
				SCOPEMODELCACHE[scopeid]=scoped
			}
		} else {
			scoped.digest(elem)
		}
		return scoped
	}
	api.registerDirective=registerDirective
	return api;
})();