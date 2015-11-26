/**
 * Created by Atul on 9/6/2015.
 */
$.simpleTemplate=function(str2){
	if(typeof(str2)!="string"){return }
	//simple
	var vars=[]
	str2.replace(/\$([a-z][\w.]+)/g,function(a,b){
		var nm=b.split(/\./).shift();vars.indexOf(nm)==-1 && vars.push(nm)
	})
	var fn= (function(str,varlist ){
		var string=str,res=$.resolveProperty,vars=varlist
		function resolveTemplate(obj){
			return string.replace(/\$([a-z][\w\.]+)/ig,function(a,b){
				var data=obj;
				if(!(obj && typeof(obj)=="object")  ){
					if(vars.length==1){data={};data[vars[0]]=obj}
				}
				var v= b.indexOf(".")>0?res(data,b):data[b]
				return v==null?"":String(v)
			})
		}
		return function(obj){
			var data=obj
			if(!(obj && typeof(obj)=="object") ){
				if(vars.length==1){data={};data[vars[0]]=obj}
			}
			if(data && typeof(data)=="object"){
				return $.isArrayLike(data)?[].map.call(data,resolveTemplate).join(""):resolveTemplate(data)
			}
		}
		return ""
	})(str2,vars )
	fn.fn=fn;
	fn.vars=vars
	fn.qvars=[]
	return fn
}
$.templatehandlebar=function(str,opts) {//"<li>${rr+2} $each{ eeee }</li>"
	//replce with ph registerHelper > registerPartial registerHelper SafeString escapeExpression create isEmpty root first index key last level
	function escapeExpression(a){
		return String(a).replace(/\</g,"&lt;").replace(/\>/g,"&gt;")
	}
	function safeString(a){
		return a==null?"":String(a)
	}
	return (function(expr,options){
		options=options||{}
		var ph=[],origstr=expr.replace(/\t/g,'    ')//each ! & ^
		//block
		var str=origstr.replace(/\{\{([\#\^])(each|list\s+)?([\w]+)}}(.*?)\{\{\/\3}}/g,function(a,op,fn,name,content,i){
			if(op=="!"){return ""}
			var data={value:name.trim(),op:op,index:i,end:i+a.length,fn:fn,block:content}
			var i=ph.push(data)
			return '\t!'+i+'!\t'
		})

		//expr
		var arr=str.replace(/\{\{([^\}]+)\}\}/g,function(a,nm,i){
			nm=nm.trim()
			var data={value:nm ,index:i,end:i+a.length}
			if(nm.charAt(0)==">"){
				var arr1=nm.substr(1).trim().replace(/\s*\=\s*/g,"=").split(/\s+/)
				if(options.resolveTemplate){
					var nu=options.resolveTemplate(arr1.shift())
					if(typeof(nu)=="string"){
						data={template:$.templatehandlebar(nu,options)}
						if(arr1.length && arr1[0]){
							data.additional=arr1.reduce(function(m,k){
								var i=k.indexOf("=");
								if(i>0){
									m[k.substr(0,i).trim()]=k.substr(i+1).trim()
								}
							},{})
						}
					}
				}
			}
			else if(nm.charAt(0)=="&"){
				data.noescape=true;
				nm=nm.substr(1).trim()
			}
			var i=ph.push(data)
			return '\t!'+i+'!\t'
		}).split('\t')

		ph.forEach(
			function(a){
				if(a.block){
					a.template=$.templatehandlebar(a.block,opts)
				}
			}
		);
		function _resolve(D,scope,index,noloop){
			if(!scope){return ""}
			var res="",V= D.value
			if(V){
				if(V=="@index"||V=="@key"){
					res= index
				} else {
					var v = scope[V]
					if (typeof(v) == "function") {
						res= v.call(scope)
					} else if ($.isArray(v)) {
						res= [].slice.call(vS).map(function (a, i) {
							return _resolve(D, a, i, true)
						}).join("")
					} else {
						if (v == null) {
							if(options.helpers && typeof(options.helpers[V]) == "function"){
								res=options.helpers[V].call(scope)
							}
							else if (!noloop && typeof(V) == "string" && /\s/.test(V)) {
								res= V.replace(/([\S]+)/g, function (a) {
									return noloop ? a : _resolve({value:a}, scope, index, true)
								});
							} else if(/\W/.test(V)){
								try {
									var r,allscope= scope;
									if(D.additional){
										allscope=$.extend({},scope,D.additional);
									}
									with (allscope) { r=eval(V) }
									res = r;
								} catch(e){
									res =V;
								}
							}
							else{
								res=D.additional?D.additional[V]:V
							}
						} else {
							res=v;
						}
					}
				}
			}
			if(res==null){return ""}
			if(D.noescape!==true){
				return escapeExpression(res)
			}
			return res
		}
		function retfn(scope,index){
			if($.isArrayLike(scope)){
				return [].slice.call(scope).map(retfn).join("");
			}
			scope=scope||{};
			var res=arr.map(
				function(a){
					if(!a){return a}
					var res1=a
					if(/^!\d+\!$/.test(a)){
						var D=ph[Number(a.replace(/\!/g,""))-1]
						if(D){
							if(D.template) {
								var S=D.value?scope[D.value]:scope
								if(!S){
									if(D.op=="^"){resq=D.block}
									else{
										res1=""
									}
								}
								if (D.fn == "each"||D.fn == "list") {
									res1=$.collect(D.value, function (v, k) {
										return D.template(S[v],k)
									}).join("")
								} else {
									if($.isArray(S)){
										res1=[].slice.call(S).map(function(a,i){
											var v2= D.template(a,i)
											return v2
										}).join("")
									} else{
										res1=D.template(S,index)
									}
								}
							} else {
								res1=_resolve(D ,scope,index)
							}
						}
						//return ""
					}
					return res1==null?"":res1;
				}
			).join("")

			return res;
		}
		retfn.fn=retfn;

		return retfn;
	})(str,opts);
}

$.templatedollar=  function(str,opts){
	if(typeof(str)!="string"){return str}
	function makeArgMap(argus,nmes,ctx){

		var _x=Object.create(ctx||null),vals=[],names=(nmes||[]).slice(),args=$.makeArray(arguments[0],0),_=args[0];
		var  firstisobj=_ && typeof(_)=="object"&&!$.isArray(_)
		// if(!names.length){names.push("it")}
		var varln =names.length,provider=ctx.__valueprovider;
		if(provider && provider.getValProvider){provider=provider.getValProvider.call(ctx.ctx)}
		if(varln==2 && names[1]=="it"){varln=1}
		if(firstisobj&&_.newValue!=null&&("oldValue" in _)&&names[0]== _.name){_=_.value}
		if(ctx.__iter){
			var k=names[0];  if(args[0] && args[0] instanceof List){args[0]=args[0].toArray()}
			if($.isArray(args[0])){_x[k]= args[0].slice()}
			else{_x[k]= (firstisobj&&(k in _))?_[k]:[].concat.apply([],$.makeArray(args,varln-1))}
		}else {
			if(args.length==1 && varln>=1&&firstisobj){
				for(var i= 0,ln=names.length,k;k=names[i],i<ln;i++){
					_x[k]=_[k]
				}
			} else{
				for(var i= 0,ln=names.length,k;k=names[i],i<ln;i++){
					_x[k]=args[i]
				}
			}
		}


		var df=provider?(typeof(provider)=="function"?provider:(provider.get||provider)):null;
		for(var i= 0,ln=names.length,k;k=names[i],i<ln;i++){
			var val;
			if(k!="it"){
				val=_x[k]
				if(k && k!="it" && df ){
					var p=typeof(df)=="function"?df.call(ctx.ctx,k):(k in provider)?provider[k]:df
					if(p){_x[k]=val=typeof(p)=="function"?p.call(ctx,k): p;}
				} else if(!val && firstisobj&& (k in _)){_x[k]=val=_[k]}
			}
			vals.push(_x[k])
		}

		if(names.length==1&& vals[0]&&typeof( vals[0])=="object"&&(names[0] in  vals[0])){
			vals[0]= vals[0][names[0]]
		}

		return {mp:_x,vals:vals,names:names}
	}
	opts=opts||{}
	var expr=[],mmap={each:"map",collect:"collect"},valprovider=opts.valueprovider,K1=function(a){return a};
	function getFnBody(m,mdl){   var fn

		switch(m){
			case "map":;case "collect":;case "each":;case "forEach":
			var listname=mdl.arg||"list"
			fn=  function __fn__(){ var _=arguments[0]||[],__list=[];
				if(Array.isArray(_)){
					if(_.length==1&&Array.isArray(_[0])){_=_[0]}
					if(Array.isArray(_)){
						if(_.length==1&&_[0]) {
							if(Array.isArray (_[0])) {
								_=_[0]
							}
						}
					}
				}
				if(Array.isArray(_)) {  __list=_}
				if(__list.length&&__list[0]&&Array.isArray(__list[0].list||__list[0].l)){__list=__list[0].list||__list[0].l;}

				return __list.map(function(it,i,arr){
						return this.__iter.call(this.ctx,it)
					}
					,this).join('')
			};
			fn.vars=[listname]
			break;
			case "elseiff":;case "iff":fn=  function __fn__(){
			var _val=function(v){var vv=typeof(v)=="function"?v:(typeof(this[v])=="function"?this[v]:null)
				return vv?vv.call(this,this):(v)
			};
			return  _val.call(_val.call(this,arguments[0])?arguments[1]:arguments[2]  )
		};break;
			case "switchby":fn=  function __fn__( ){
				var _val=function(v){var vv=typeof(v)=="function"?v:(typeof(this[v])=="function"?this[v]:null)
					return vv?vv.call(this,this):(v)
				};
				var v=_val.call(this,arguments[0]);
				return $.makeArray(arguments,1).filter(function(it){return it && it.name==v})[0];
			};break;
		}
		return  fn
	}
	//$each
	var lastIf=null
	var str2=str.replace(/\{\{/g,"${").replace(/\}\}/g,"}").replace(/\$([^\{\$]*)?\{([^\}]+?)\}/g,function(a,b,c){
		var barg=""
		if(b&&b.indexOf("(")>0){
			var bara=b.split(/[\(\)]/);
			b=bara.shift().trim();
			barg=bara.shift().trim()
		}
		var mdl={x:c,m:b,arg:barg,type:b||"test",condition:null,i:expr.length,template:true,priority:1,idx:expr.length};
		if(!b){
			mdl.template=/\$\w+/.test(c)
		}  else{
			var ar= c.split(/\->/);
			mdl.argname= barg||(ar.length>1?ar.shift().trim().replace(/^\(|\)$/g,""):"").trim();
			mdl.x=ar.join("->")
			if(b=="else"){
				mdl.priority=9;
				mdl.m=mdl.argname="";
				if(lastIf){
					lastIf._else.push(mdl)
				}
				return ""
			}
			else if(b=="if"||b=="iff"||b=="elseiff"||b=="elseif"||b=="else"||b=="switch"||b=="when"){
				if(b=="if"){b="iff"}
				else if(b=="elseif" ){b="elseiff"}
				//   var argexpr=argexpr.replace(/(["'])([^\1]*?)\1/g,function(a,b,c){aa.push(a);return "!"+aa.length+"!"})
				//      .replace(/\(([^\)]*?)\)/g,function(a,b,c){aa.push(a);return "!"+aa.length+"!"})
				//argexpr= argexpr.split(/\s*,\s*/).map(function(k){return k.replace(/!(\d+)!/g,function(a,b){return aa[Number(b)-1]})});
				//  argexpr=argexpr.replace(/!(\d+)!/g,function(a,b){return aa[Number(b)-1]});
				mdl.priority=10;
				mdl.conditionstr=barg
				var arr=String(mdl.conditionstr||"").trim().split(/\s+/)
				if(arr.length==3){
					if(arr[1]=="is"||arr[1]=="="){arr[1]="=="}
					if(arr[2] && isNaN(arr[2]) && (arr[2].charAt(0)!='"' ||arr[2].charAt(0)!="'")){arr[2]="'"+arr[2].replace(/'/g,"\\'")+"'"}
				}
				mdl.conditionstr=arr.join(" ").trim()
				mdl.condition=  $.parseExpr(mdl.conditionstr,null,{prefix:"it"}   )
				mdl.m=mdl.argname="";
				if(b=="elseiff"){
					if(lastIf){
						lastIf._else.push(mdl)
					}
					return ""
				} else {
					mdl._else=[]
					lastIf=mdl
				}
			}
		}
		expr.push(mdl);
		return "|X"+expr.length+"|"
	});
	function parseMod(mod){
		var fn,qvars=[],vars=[],
			singleVar=/^[a-z_][\w_]*$/i.test(String(mod.x))
		fn=singleVar?{fn:K1}:
			mod.template?$.template(mod.x,mod):
				$.parseExpr(mod.x,null,{prefix:mod.argname||"it"})
		//if(mod.argname){vars}
		vars=singleVar?[mod.x]:fn.vars.slice();
		if(fn.tokens) {
			qvars = fn.tokens.filter(function (a) {
				return a.type == "id" || a.type == "fn" || a.type2 == "fn"
			}).map(function (a) {
				var v = a.value, arr = String(v).split(".");
				return {path: v, name: arr[0], haspath: arr.length > 1, type: a.type2}
			});
		}
		var fnctx=Object.create(null),mthd=mod.m ;
		Object.defineProperty(fnctx, "toString",{value:function(){
			if(this.__lop){return ""}
			var r =""
			try{
				this.__lop=true;
				r=Object.keys(this).map(function(k){
						return (this[k]==this||Object.getPrototypeOf(this[k])==this|| k.indexOf("_")==0)?"":(k+":"+this[k])},this
				).join("");
			} catch(e){} finally{delete this.__lop}
			return r;
		} ,enumerable:false});
		fnctx.fn=fn.fn;  ;fnctx.vars= vars.slice();fnctx.qvars= qvars.slice()
		var mthdfn=mthd?getFnBody(mthd,mod):"";
		if(mthdfn){
			fnctx.__iter=fnctx.fn
			var argname=mod.argname||fnctx.vars.length==1?fnctx.vars[0]:"list";
			if(mthdfn.vars) {
				fnctx.vars=mthdfn.vars
			}else{
				fnctx.vars= vars.slice();
				if(fnctx.vars.indexOf(argname)==-1){
					fnctx.vars.unshift( argname)
				}
			}

			fnctx.fn=mthdfn.bind(fnctx)
		} else{delete fnctx.__iter}

		fnctx.__valueprovider=valprovider
		function wrp(){
			var ctx=wrp.context,a;ctx.ctx=this
			// return fnctx.fn.apply(null,a.slice())
			if(ctx.vars.length==1 && ctx.vars[0]=="it"&&typeof(arguments[0])=="object"){a=[arguments[0]]}
			else{
				var args=makeArgMap(arguments,ctx.vars,ctx);
				a=args.vals

			}
			return fnctx.fn.apply(null,a.slice())
		}
		wrp.context=fnctx
		wrp.vars=fnctx.vars
		wrp.qvars=fnctx.qvars
		wrp.fn=wrp
		wrp.condition=mod.condition
		wrp.string=mod.conditionstr||mthd|| mod.x
		if(mod._else){
			wrp._else=mod._else.map(parseMod)
		}
		return wrp;

	}
	//
	var vars=[],qvars=[],fin=[],ret;

	var exprarr=str2.replace(/\$(@?[\w][\w\.]*)/g,
		function(a,b){
			return "|X"+expr.push({x:b,i:expr.length})+"|"
		}).split(/\|/)   ;

	fin=exprarr.map(function(it,i,arr){
		if(/^X\d/.test(it)) {
			var mod = expr[Number(it.substr(1)) - 1] || {}
			return parseMod(mod)
		} else{
			var ret=  {};
			ret.vars=[]
			ret.qvars=[]

			ret.fn=it;
			ret.string= it
			return ret;
		}

	} );

	fin.forEach(function(it){
		if(it && it.vars){
			it.vars.forEach(function(k,i){
				if(k!="it" && vars.indexOf(k)==-1){
					vars.push(k)
					qvars.push((it.qvars||[]).filter(function(a){return a.name==k})[0]||{name:k,path:k});
				}
			});
		}
	});
	var tofilter=fin.filter(function(it,i,arr){return it.condition}).length>0
	ret=function retfn(ctx){
		var a=[].slice.call(arguments),res=[],l=fin
		if(a[0]!=null && typeof(a[0])!="object" && a.length >1 && retfn.vars.length>1){
			var args={};
			retfn.vars.forEach(function(k,i){
				args[k]=a[i]
			})
			a=[args];
		}
		var qvars=retfn.qvars||[]
		for(var i= 0,ln=qvars.length;i<ln;i++){
			if(qvars[i].haspath && a[qvars[i].name]==null){a[qvars[i].name]={}}
		}
		var C=typeof(ctx)=="object"?ctx:null
		var todo=[];
		if(tofilter){
			for(var i= 0,ln=l.length;i<ln;i++){
				var it=l[i];
				if(!it){continue}
				if(it.condition){
					it._condition=it.condition
					it.result=it.condition.fn.apply(this,a)
					if(it.result){
						todo.push(it)
					} else if(it._else){
						if(Array.isArray(it._else)){
							var r =it._else.find(function(b){return b.condition?b.condition.fn.apply(this,a):true},this)
							if(r ){
								todo.push(r )
							}
						}
						else {
							todo.push(it._else)
						}
						//arr[i+2]&&(arr[i+2].type="else"
					}
					continue
				}
				todo.push(it)
			}

		} else{
			todo=l;
		}
		for(var i= 0,l1=todo,ln=l1.length;i<ln;i++){
			var it= l1[i] ,r;
			if(!it){continue}
			if(typeof(it.fn)=="function"){
				r= it.fn.apply(C,a)
			} else {r=String(it.fn)}
			res.push(r==null?"":r);
		}

		return res.join("")
	}



	Object.defineProperties(ret,{
		"toString":{value:function(){return this.array.map(function(it){return it.string||""}).join("\n\t")},enumerable:false},
		"expr":{value:fin,enumerable:false},
		"array":{value:fin,enumerable:false},
		"vars":{value:vars,enumerable:false},
		"qvars":{value:qvars,enumerable:false},
		"fn":{value:ret,enumerable:false}})

	return ret
}
$.template=  function(str,opts){//"<li>${rr+2} $each{ eeee }</li>"
	if(typeof(str)!="string"){return str}
	if(/\$[\{\w]+/.test(str)){
		if(!/\${/.test(str) && !/\$\w+\{/.test(str)){
			return $.templatedollar(str,opts)//$.simpleTemplate(str,opts)
		}
	} else if(/{{/.test(str)){
		return $.templatehandlebar(str,opts)
	}
	return $.templatedollar(str,opts)
};

$.tokenize=function(expr,ignorews){
	if(ignorews==null){ignorews=true}
	var ex,res = [], phescd = String.fromCharCode(1), escd = [],orig=expr;
	var nms = "sq,dq,id,num,num1,num2,op,ws,other".split(","), ln = nms.length;
	ex=expr.replace(/\\(.)/g, function (a, b) {
		return phescd + escd.push(b) + phsescd
	})
		.replace(
		/'([^']*)'|"([^"]*)"|([\$a-zA-Z][\w\.]*)|([\-]?\d+[\.]\d+)|([\-]?[\.]\d+)|([\-]?[\d]+)|(\+\+|\-\-|>\=|<\=|\=\=|\!\=|<>|\?:|\?\.|\|\=|\|\||\&\&|=|>|<|\(|\)|\{|\}|\]|\[|\-|\*|!|,|\\|\/|\?|:|\+|\*|%|\-)|(\s+)|(.+)/g,
		function (all, sq, dq, id, num,num1,num2, op, ws, other, idx) {
			for (var i = 0, l = [].slice.call(arguments, 1, ln + 1); i < ln; i++) {
				var a = l[i]

				if (a != null) {
					if (a) {var t,t2=nms[i]
						if(a.toLowerCase()=="and"){a="&&";t2=t="op"}
						else if(a.toLowerCase()=="or"){a="||";t2=t="op"}
						else {t=i < 1 ? "string" :(nms[i]||"").replace(/\d$/,"")

						}
						a=i <= 1 ? a.replace(/^['"]|['"]$/g, "") : a
						if(ignorews && t=="ws") {}
						else{
							res.push({type: t, value: a, idx: idx, type2: t2})
						}
					}
				}
			}
			return all
		}
	);
	var data={count:0,tokens:res,expr:expr,orig:orig},prev={}
	if(res.length){
		var nws=res.forEach(function(it,i){var t=it.type2||it.type;
			data[t]||(data[t]=[]);
			data[t].indexOf(it.value)==-1&&data[t].push(it.value);
			if(t=="id"&&it.value.indexOf(".")>0){
				var c=it.value.substr(0,it.value.indexOf("."))
				if(c!="this") {
					data.containers = data.containers || []
					data.containers.indexOf(c) == -1 && data.containers.push(c)
				}
			}
			if(prev&&prev.t&&(prev.t=="num"||prev.t=="id"||prev.t=="fn")&&(t=="id"||t=="fn"||t=="num")) {
				data.invalid = "An operator expected after " + prev.v + " at " + prev.i + " but found " + it.value + ", expr:" + expr ;
			}
			if(t!="ws"){data.count++;prev={t:t,v:it.value,i:it.idx}}

		})

	}

	return  data
}
$.makeGraph=(function() {
	function _sl(arr,ofset){return[].slice.call(arr,ofset||0) }
	var _map={"(":")","[":"]","{":"}"},//.transformAll(function(a,i){return {value:a,type:null,i:i}});
		opprefix = '<>+-&?=*/!%|:',suffix = '=>&:',
		OPS={
			"("	    :{type:"A",pre:0,  fn:function(t,p,i,memo) {                },block:")"},
			"{"	    :{type:"A",pre:1,  fn:function(t,p,i,memo) {                },block:"}"},
			"["	    :{type:"A",pre:1,  fn:function(t,p,i,memo) {                },block:"]",member:1},
			"."	    :{type:"A",pre:1,  fn:function(t,p,i,memo) {                },punc:1,member:1},
			"^="	:{type:"A",pre:1,  fn:function(t,p,i,memo) {                },bit:1},
			"?."	:{type:"A",pre:1,  fn:function(t,p,i,memo) {return "(!$1||{}).$2"},nav:1},
			"?:"	:{type:"A",pre:1,  fn:function(t,p,i,memo) {return "$1||$2"},elvis:1},

			"&&"	:{type:"A",pre:2,  fn:function(t,p,i,memo){                },boolean:1},
			"||"	:{type:"A",pre:3,  fn:function(t,p,i,memo){                },boolean:1},
			"++"	:{type:"A",pre:3,  fn:function(t,p,i,memo) {                },unary:1,number:1},
			"--"	:{type:"A",pre:3,  fn:function(t,p,i,memo) {                },unary:1,number:1},

			"!"	    :{type:"A",pre:4,  fn:function(t,p,i,memo) {                },boolean:1},
			"~"	    :{type:"A",pre:4,  fn:function(t,p,i,memo) {                },bit:1},

			"/"	    :{type:"A",pre:5,  fn:function(t,p,i,memo) {                },binary:1,arith:1,number:1},
			"*"	    :{type:"A",pre:5,  fn:function(t,p,i,memo) {                },binary:1,arith:1,number:1},
			"%"	    :{type:"A",pre:5,  fn:function(t,p,i,memo) {                },binary:1,arith:1,number:1},

			"+"	    :{type:"A",pre:6,  fn:function(t,p,i,memo) {                },binary:1,boolean:1,number:1,string:1},
			"-"	    :{type:"A",pre:6,  fn:function(t,p,i,memo) {                },binary:1,arith:1,number:1},

			"<<"	:{type:"A",pre:7,  fn:function(t,p,i,memo) {                },bit:1},
			">>"	:{type:"A",pre:7,  fn:function(t,p,i,memo) {                },bit:1},
			">>>"	:{type:"A",pre:7,  fn:function(t,p,i,memo) {                },bit:1},

			"<"	    :{type:"A",pre:8,  fn:function(t,p,i,memo) {                },binary:1,boolean:1},
			">"	    :{type:"A",pre:8,  fn:function(t,p,i,memo) {                },binary:1,boolean:1},
			"<="	:{type:"A",pre:8,  fn:function(t,p,i,memo) {                },binary:1,boolean:1},
			">="	:{type:"A",pre:8,  fn:function(t,p,i,memo) {                },binary:1,boolean:1},
			"in"    :{type:"A",pre:9,  fn:function(t,p,i,memo) {                },binary:1,boolean:1},
			"=="	:{type:"A",pre:9,  fn:function(t,p,i,memo) {                },binary:1,boolean:1},
			"!="	:{type:"A",pre:9,  fn:function(t,p,i,memo) {                },binary:1,boolean:1},
			"==="	:{type:"A",pre:9,  fn:function(t,p,i,memo) {                },binary:1,boolean:1,strict:1},
			"!=="	:{type:"A",pre:9,  fn:function(t,p,i,memo) {                },binary:1,boolean:1,strict:1},
			"&"	    :{type:"A",pre:10,  fn:function(t,p,i,memo){                },bit:1},
			"|"	    :{type:"A",pre:11,  fn:function(t,p,i,memo){                },bit:1},
			"^"	    :{type:"A",pre:12,  fn:function(t,p,i,memo){                },bit:1},
			"?"	    :{type:"A",pre:15,  fn:function(t,p,i,memo){                },tertiary:1},
			":"	    :{type:"A",pre:15,  fn:function(t,p,i,memo){                },tertiary:1},
			"="	    :{type:"A",pre:17,  fn:function(t,p,i,memo){                },assign:1},
			"+="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },assign:1},
			"-="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },assign:1},
			"*="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },assign:1},
			"%="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },assign:1},
			"<<="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },bit:1},
			">>="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },bit:1},
			">>>="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },bit:1},
			"&="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },bit:1},
			"|="	:{type:"A",pre:17,  fn:function(t,p,i,memo){                },bit:1},
			","	    :{type:"A",pre:18,  fn:function(t,p,i,memo){                },punc:1,argsep:1},
			";"	    :{type:"A",pre:19,  fn:function(t,p,i,memo) {                },punc:1},
			"instanceof":{type:"A",pre:9,  fn:function(t,p,i,memo) {            },binary:1,boolean:1}


		}
	optypes={"+":"arithmatic","-":"arithmatic","*":"arithmatic","/":"arithmatic","%":"arithmatic","++":"arithmatic","--":"arithmatic",
		">":"binary","==":"binary","=":"binary","===":"binary",">=":"binary","!=":"binary","<":"binary","<=":"binary",
		"?":"tertiary","?:":"tertiary","?.":"nav","|=":"exist"
	}
	var cache={}
	function makeel(type,val) {return {type: type, value:val,items: []}}
	function _acceptVisitor( visitor){
		if( !visitor||this==self||this==null){return}
		var item=this
		if(item.items){var items=item.items;
			for(var i= 0,ln=items.length,it;it=items[i],i<ln;i++){
				_acceptVisitor.call(it,visitor)
			}
		} else if(item.op && (item.l||item.r)){
			_acceptVisitor.call(item.l,visitor)
			_acceptVisitor.call(item.r,visitor)
		}
		if(item.args){
			var items=item.args;
			for(var i= 0,ln=items.length,it;it=items[i],i<ln;i++){
				_acceptVisitor.call(it,visitor)
			}
		}

		if(item.type && typeof(visitor[item.type])=="function"){
			visitor[item.type].call(visitor,item)
		} else{
			visitor.visit(item)
		}
	}
	function xarray(){
		return Object.create([],{last:{value:function(){return this[this.length-1]}},first:{value:function(){return this[0]}},empty:{value:function(){return !this.length}}})
	}

	function _make(input,config) {
		var data=input,gr = {}, currentblock = [], blocks = [makeel("root")], idx = 0
		var vars=[],fns=[],vartypes=[],defargnames
		if(typeof(input)=="string") {
			data = $.tokenize(input)
		}
		var tkns=data.tokens ;
		if(!data.vars){data.vars=[]}
		if(!data.qvars){data.qvars=[]}
		if(!data.fns){data.fns=[]}
		if(!data.vartypes){data.vartypes={}}
		for (var i = 0, ln = tkns.length; i < ln; i++) {
			var tkn = tkns[i]
			if (tkn.value == "(" || tkn.value == "{") {
				var nu = makeel("block", tkn.value)
				blocks[idx].items.push(nu)
				blocks.push(nu)
				idx++
			} else if (tkn.value == ")" || tkn.value == "}") {
				blocks.pop()
				idx--
			} else {
				blocks[idx].items.push(tkn)
			}
		}
		if (blocks.length > 1) {
			blocks.pop()
		}
		if (blocks.length == 1) {
			blocks = blocks[0]
		}
		function addVar(mdl,par){
			var nm,ar=[]
			if(!mdl.value||mdl.inscope){return}
			if(mdl.value.indexOf(".")==-1){
				if(Math[mdl.value]){mdl.value="Math."+mdl.value}
			}
			nm=mdl.value
			var origname=nm
			if(String(nm).indexOf(".")>0){
				ar=nm.split(/\./);nm=ar[0]
			} else{ar.push(nm)}
			data.qvars||(data.qvars=[]);
			if(data.vars.indexOf(nm)>-1|| data.fns.indexOf(nm)>-1){return}
			if(data.qvars.indexOf(origname)>-1|| data.fns.indexOf(origname)>-1){return}
			if(nm=="this"||nm=="Math"||(!(nm=="value"||nm=="x"||nm=="y"||nm=="top")&&(nm in self))){}
			else{
				data.vars.push(nm)
				data.qvars.push(origname)
				if(mdl.type=="fn"){ data.fns.push(nm)}
				data.vartypes[nm]={path:ar.join("."),hasmembers:ar.length>1,type:mdl.type}
			}

		}
		function doblock(b) {
			var ret = b
			if (Array.isArray(b.items)) {
				b.items.forEach(function (it, i) {
					it.index = i
				})
			}
			if (Array.isArray(b.items)) {
				if (b.items.length == 1) {
					ret = doblock(b.items[0])
				} else if (b.items.length == 2 && b.items[0].type == "op") {
					ret = {type: "expr", op: b.items[0].value, r: doblock(b.items[1])}
				} else if (b.items.length == 2 && b.items[1].type == "op") {
					ret = {type: "expr", op: b.items[1].value, l: doblock(b.items[0])}
				}
				else if (b.items.length == 3 && b.items[1].type == "op") {
					ret = {type: "expr", op: b.items[1].value, l: doblock(b.items[0]), r: doblock(b.items[2])}
				} else {

					if (b.items.length > 3) {//find op with lowest pre
						var opsidx = []
						for (var i = 0, ln = b.items.length; i < ln; i++) {
							if (b.items[i].type == "op") {
								b.items[i].pre = (OPS[b.items[i].value] || {}).pre || 100
								opsidx.push(b.items[i])
							}
						}

						if (opsidx.length == 2 && opsidx[0].value == "?" && opsidx[1].value == ":") {
							ret = {
								type: "expr",
								op: opsidx[0].value + opsidx[1].value,
								l: doblock({items: b.items.slice(opsidx[0].index + 1, opsidx[1].index)}, ret),
								r: doblock({items: b.items.slice(opsidx[1].index + 1)}, ret),
								c: doblock({items: b.items.slice(0, opsidx[0].index)}, ret)
							}
						} else if (opsidx.length) {
							var min = opsidx[opsidx.length - 1]
							for (var i = 0, ln = opsidx.length; i < ln; i++) {
								if (min.pre > opsidx[i].pre) {
									min = opsidx[i]
								}
							}
							var o = min
							var l = doblock({items: b.items.slice(0, o.index)}, ret)
							var r = doblock({items: b.items.slice(o.index + 1)}, ret)
							ret = {type: "expr", op: o.value, l: l, r: r}
						}
					}

				}
			}
			if (ret.items) {
				var retarr = []
				for (var i = 0, ln = ret.items.length; i < ln; i++) {
					if (ret.items[i].type == "block" && i && ret.items[i - 1] && ret.items[i - 1].type == "id" && ret.items.length == 2) {
						var li = ret.items[i].items.length - 1, args = ret.items[i].items.reduce(function (m, it, i) {
							if (it.value !== ",") {
								m.cur.push(it)
							}
							if (it.value == "," || i == li) {
								m.a.push(doblock({items: m.cur.slice()}, ret));
								m.cur = []
							}
							;
							return m
						}, {cur: [], a: []}).a
						var mm = doblock({type: "fn", value: ret.items[i - 1].value, args: args}, ret)
						if (i && ret.items[i - 1] && ret.items[i - 1].value == ".") {
							mm.inscope = true
						}
						retarr[retarr.length-1]=mm;

					} else {
						retarr.push(doblock(ret.items[i], ret))
					}
				}
				retarr.forEach(function (it, i) {
					it.index = i
				})
				ret.items = retarr;
			} else if (ret && ret.type == "fn") {
				if (ret.value && ret.value.indexOf(".") == -1) {
					if (typeof(Math[ret.value]) == "function") {
						ret.value = "Math." + ret.value
					}
				}
				addVar(ret)

			} else if (ret && ret.type == "id") {
				if (ret.value == "log" || ret.value == "print" || ret.value == "dump") {
					ret = {type: "fn", value: "console.log", args: []}
				}
				else if (ret.value == "true" || ret.value == "false") {
					ret.type = "bool"
				}
				else {
					addVar(ret)
				}
			}
			if (!ret.type && ret.op) {
				ret.type = "expr"
			}
			return ret
		}

		var fin= doblock(blocks),vars,qvars=[]
		data.graph=fin;
		vars=data.vars.filter(function(a){return a!="this" && data.fns.indexOf(a)==-1})
		qvars=data.qvars.filter(function(a){return a!="this" && data.fns.indexOf(a)==-1})
		if(data.fns){var c=(config||{}).context
			data.fns.forEach(function(a){
				if((c&&typeof(c[a])=="function") || (a.indexOf(".")==-1 &&!(self[a]||Math[a]))){
					vars.push(a)
					qvars.push(a)
				}
			})
		}
		vars=vars.map(function(a){return a.indexOf(".")>0? a.split(".").shift():a}).reduce(function(m,a){if(a!="this" && m.indexOf(a)==-1){m.push(a)}return m},[])
		if(!(vars && vars.length)){
			if(data.containers && data.containers.length){
				vars=data.containers.slice()
			}
		}

		data.vars=vars

		return data;
	}
	return function makegraph(input,config){
		var data,info
		if(!input){return}
		if(typeof(input)=="function"){
			info= $.fn.info(input)
			input=$.fn.getBody(input)
		}
		if(typeof(input)=="string" && /\r\n/.test(input)){
			var arr=input.split(/\r\n/).reduce(
				function(m,a){
					if(!a.trim()){return m}

					if(a.trim() && !m.empty()){var last=m.last().trim().charAt(m.last().length-1)
						if(/[,\=\+\-\*\?\.\(\[\{]/.test(last) || /^\s*[,\=\+\-\*\?\.\)\]\}]/.test(a)){
							m[m.length-1]=m[m.length-1]+((last=="."||a[0]==".")?"":" ")+a;
						} else {
							m.push(a)
						}
					}
					return m
				}
				, xarray())
			data={vars:[],fns:[],containers:[]}
			var grl=arr.map(function(it){return _make (it,config)});
			grl.forEach(function(it){
				for(var j= 0,jl=["vars","fns","containers"],jln=jl.length;j<jln;j++){
					var k=jl[j],arr=it?it[k]:null;
					if(arr&&arr.length){
						for(var i= 0,ln=arr.length;i<ln;i++){
							if(data[k].indexOf(arr[i])==-1){
								data[k].push(arr[i])
							}
						}
					}

				}

			})
			data.multiline=true;
			data.graph={items:grl}
		} else{
			data = _make (input,config)

		}
		if(!data){return}
		if(info){
			data.input=input
			data.fnargs=info.args;
		}
		if(data.graph.items && data.graph.type=="root" && data.graph.items.length==1){data.graph=data.graph.items[0]}
		data._parsedvars=data.vars.slice();
		data.options= $.isPlain(config)?config:{}
		data.graph.accept=_acceptVisitor.bind(data.graph)
		return data;
	}

})();

$.parseUtil=(function(){

	var reservedWords="String Math Number break case catch const continue debugger default delete do else export finally for function if import in instanceof let new return super switch this self throw try typeof var void while with null undefined".split(/\s+/),
	  nativeMethods=[]
	return {
		isReservedWord: function (s,checknativemethods) {
			if ( reservedWords.indexOf(s) >= 0) {
				return true
			}
			if (checknativemethods ) {
				if(!nativeMethods.length) {
					nativeMethods = Object.getOwnPropertyNames(String.prototype)
						.concat(Object.getOwnPropertyNames(Object.prototype))
						.concat(Object.getOwnPropertyNames(Number.prototype))
						.concat(Object.getOwnPropertyNames(Array.prototype))
				}
				return nativeMethods.indexOf(s)==-1
			}
		}
	}
})();
$.parseExpr=(function () {

	function _sl(arr,ofset){return[].slice.call(arr,ofset||0) }
	var cache={}

	var _parseArgsGen=function(holder){
		var parseargfn,O=holder.options
		var origCtx=O.context,vars=holder.vars,containers=holder.containers||(holder.containers=[]);
		var provider=O.valueprovider ,
			valueObject=holder.valueObject,args= O.args;
		var vardetails={},ln=vars.length,argResolver=O.argResolver
		for (var i = 0, nm;nm=vars[i], i < ln; i++) {
			var d={name:nm,type:containers.indexOf(nm)>=0?"object":"",idx:i};
			if(d.type){d["_"+ d.type]=true}
			vardetails[String(i)]=vardetails[nm]=d
		}
		vardetails._count=ln;
		if(provider){
			parseargfn =  function _parseArgs1(config,ths, fnargs) {
				var a=[],vars=config.vars,ln=vars.length,ctx=ths||config.context,args=fnargs
				for (var i = 0 ; i < ln; i++) {
					a.push(provider.apply(ctx, [vars[i]].concat(args)))
				}
				return {a: a, ctx: ctx}
			}
		}
		 else {
			if (!argResolver) {
				if (vars[0] && vars[0] == containers[0]) {
					argResolver = "valueobject"
				}
			}
			if (argResolver) {
				if (typeof( argResolver) == "string") {
					var R = argResolver.toLowerCase();
					if (R == "passthrough" || R == "passthru") {
						parseargfn = function _parseArgs1(config,ths, fnargs) {
							return {a: fnargs, ctx: ths}
						}
					} else if (R == "valueobject" || R == "model" || R == "context") {
						parseargfn = function _parseArgs2(config,ths, fnargs) {
							var _val = $.resolveProperty, vars=config.vars,ln = vars.length, container = config.containers[0] || "it"
							var i = 0, f = fnargs[0], a = [], t = typeof(f), valueObject = ((f && (t == "object" || t == "function")) ? f : null) || ths
							if (vars[0] == container) {
								a[0] = valueObject
								i++
								if (ln > 1) {
									var ii = 0;
									if (f === valueObject) {
										ii++
									}
									var fln = fnargs.length
									for (; ii < fln; ii++) {
										a.push(fnargs[ii])
									}
								}
							} else if (valueObject && i < ln) {
								for (; i < ln; i++) {
									a.push(_val(valueObject, vars[i]))
								}
							}
							return {a: a, ctx: valueObject}
						}
					}
				} else if (typeof( argResolver) == "function") {
					parseargfn = argResolver
				}
			}
			else {
				parseargfn = function _parseArgs3(config,ths, fnargs) {
					var data = {ctx: ths || config.context, a: []}, asprop = 0, vars1 = config.vars
					if(config.valueObject){var V=config.valueObject
						for (var i = 0, ln = vars1.length; i < ln; i++) {
							data.a.push(V[vars1[i]])
						}
						return data;
					}
					if (vars1[0] !== "it") {
						if ((fnargs.length == 1 && fnargs[0] && vars1.length > 1 && typeof(fnargs[0]) == "object")) {
							asprop = fnargs[0] || {};
						}
					}

					for (var i = 0, ln = vars1.length; i < ln; i++) {
						var nm = vars1[i];
						if (!nm) {
							continue
						}
						var val = (asprop && nm in asprop) ? asprop[nm] : fnargs[i];
						if (val && typeof(val) == "object" && "name" in val && val.name == nm && "value" in val) {
							data.a.push(val.value)
						} else {
							data.a.push(val)
						}
					}
					return data
				}
			}
		}
		return function(config,ths){
 			return parseargfn(config,(ths ===holder||ths === self)?null:ths,[].slice.call(arguments[2]))
		}
	}
	function serialize(graph,options){
		options=options||{};
		function _ser(o){
			var r=[ ]
			if(!o){return ""}
			if(o.items&&o.items.length){
				r=o.items.map(_ser).filter(function(it){return it})
				return r.join(" ")
			}
			else if(o.type=="ws"){return " "}
			else if(o.type=="expr"){
				if(o.op=="??") {
					r = ["("+_ser(o.c)+")", "?", _ser(o.l), ":", _ser(o.r)]
				}else if(o.op=="?:"||o.op=="|=") {
					r = ["("+_ser(o.l)+")", "?", "("+_ser(o.l)+")", ":", _ser(o.r)]
				} else if(o.op=="?.") {
					r = [_ser(o.l), "?", _ser(o.l)+"."+_ser(o.r), ":", "null"]
				} else if(o.op=="?:") {
					r = [_ser(o.l), "?", _ser(o.l), ":", _ser(o.r)]
				} else{

					if(o.l){r.push(_ser(o.l)) }
					if(o.op){r.push(o.op) }
					if(o.r){ r.push(_ser(o.r)) }
				}
				var ex= r.join(" ")
				if(r.length==3){ex="("+ex+")"}
				return ex
			}
			else{
				if(o.type=="id"){var nm=String(o.value);
					if(options.usePrefix && options.usePrefix !==nm){
						return options.usePrefix+"."+nm
					}
					return nm
				}
				else if(o.type=="bool"||o.type=="num"||o.type=="lit"){
					return String(o.value)
				} else if( o.type=="fn"){
					var aa= o.args.map(_ser).filter(function(it){return it.trim()}).join(", ")
					return  [o.value +"(", aa, ")"].join("")
				}
				else if(typeof(o.value)!="object"){
					return '"'+ o.value+"'"
				}
			}
		}
		return _ser( graph)
	}
	return function parseExpr(expr,optns,issub){
		var orig=expr,valueprovider=null,usePrefix=null
		if(typeof(expr)=="function"){return expr}
		if(typeof(expr)!="string"){return null}

		if(typeof(optns)=="function"){optns={valueprovider:optns}}
		if(!issub && cache[orig]&&(!optns||(optns&&!optns.context))){return cache[orig]};
		if(optns){
			usePrefix=optns.usePrefix
			valueprovider=optns.valueprovider||optns.provider||optns.resolver
			if(valueprovider&&!usePrefix){usePrefix="it"}
		}
		if(expr.indexOf("function")==0){
			return (1,eval)("("+expr+")")
		}
		if(expr.toLowerCase().indexOf("fn!")==0||expr.toLowerCase().indexOf("fn|")==0){
			var ex=expr.substr(3).replace(/^\(|\)$/g,"")
			if(ex.indexOf("function")==-1){ex="function(){"+ex+"}"}
			return (1,eval)("("+ex+")")
		}
		if(/^[\+\-\*\/]\s/.test(expr)){//if starts with arith operator this prepend var
			expr="a "+expr
		} else if(/\s[\+\-\*\/]$/.test(expr)){//if ends with arith operator this append var
			expr=expr+" a"
		}

		expr=expr.replace(/@[\.]?/g,"this.")//replace @ with this.
			.replace(/([\s\w])=([\s\w])/g,"$1==$2") //replace = with ==

		if(!/\W/.test(expr)) {
			if (expr == "log" || expr == "print" || expr == "dump") {
				return console.log.bind(console)
			} else if (optns && optns.context && typeof(optns.context[expr]) == "function") {
				return optns.context[expr].bind(optns.context)
			} else if (typeof(Math[expr]) == "function") {
				return Math[expr].bind(Math)
			} else {
				for (var l = [console, String, Number, window, Object, document], i = 0; i < l.length; i++) {
					var O = l[i]
					if (!O || !(expr in O)) {continue }
					if (typeof(O[expr]) == "function") {
						if (typeof(O) != "function") {
							return O[expr].bind(O)
						} else{return O[expr]}
					}
				}
			}

		}

		var data=$.tokenize(expr)||{}
		data.expr=expr; data.orig=orig

		if(data.invalid){
			$.handleEx({type:"syntaxError",message:data.invalid,details:data},true)
		}
		$.makeGraph(data,optns)
		if(optns && optns.argResolver){
			data.options.argResolver=optns.argResolver
		}
		data.options.valueprovider =valueprovider
		data.options.usePrefix=usePrefix;

		if(data.options.args&&Array.isArray(data.options.args)&&data.options.args.length){
			data.vars=data.options.args.slice()

		}
		/*if(valueprovider){
			data.valueObject=Object.create(null);
			data.valueObject.__fn=valueprovider;
			data.valueObject.__ctx=null;
			data.valueObject.__args=[];
			var props={}
			data.vars.forEach(function(k){
				props[k]={get:Function("return this.__fn.apply(this.__ctx,['"+k+"'].concat(this.__args))"),set:function(){}}
			});
			Object.defineProperties(data.valueObject,props)
		}*/
		if(data.vars && data.vars.every(function(a){return /^arg[\d]+$/.test(a)})){
			var max=Math.max.apply(Math,data.vars.map(function(a){return Number(a.replace(/\D/g,""))||0}) )
			var nuvars=[]
			for(var i=1;i<=max;i++){
				nuvars.push("arg"+i)
			}
			data.vars=nuvars;
		}
		data.serialize = function(){alert(5)}
		var fn
		var args=data.options.usePrefix?[data.options.usePrefix]:data.vars;
		if(!args.length){args.push("it")}
		if(expr.indexOf("this.")>=0){
			data.hasThis=true
		}
		if(!data.options.usePrefix) {

			try {
				fn = Function(args.join(","), "return " + expr);
			} catch (e) {
				fn = null
			}
		}
		if(!fn) {
			if(data.valueObject){
				fn = Function( data.options.usePrefix,"return " + serialize(data.graph,data.options));
			} else{
				fn = Function(args.join(","), "return " + serialize(data.graph,data.options));
			}

		}
		var _toret
		if(fn){
			_toret=(function (exprfn,dat){
				dat.argParser=_parseArgsGen(dat)
				var F=exprfn
 				var fntn=function(){
						var res,D=dat, THIS=D.options.context||((this!==self) ?this:(arguments[0] && typeof(arguments[0]) == "object" ? arguments[0]:null)),
							c=arguments.length?D.argParser( D,THIS,arguments):{a:[THIS]}
						try {
  							res = F.apply(THIS||c.ctx, c.a)
						} catch(e){
							console.log(e,F)
						}
						return res;
 				}
				fntn.config=dat;
				return fntn;
			})(fn,data);

			Object.defineProperties(_toret,["vars","qvars","containers","graph","fns"].map(function(k){
						var descript={}
						descript[k]=(function(nm){
							return {
								get:function(){return (this.config||{})[nm];},
								set:function(v){(this.config||{})[nm]=v;}
							}
						})(k)
						return descript;
					})
			);

			_toret.applyConfig=function(config){
				if(this.config && config){
					$.extend(this.config,config)
				}
				this.config.argParser=_parseArgsGen(this.config )
			}
			_toret.toSource=_toret.toString =function(){return fn.toString()}
			_toret.fn=_toret;
			_toret.toFn=function(){
				return _toret
			}
		}
		if( _toret.fn) {
			if(issub!==true&&(!optns||(optns&&!optns.context))){ cache[orig] = _toret}
		} else{
			if(_toret.options.force||_toret.options.quiet){_toret.fn=_toret.fn||function(){}}
			else{throw new SyntaxError("invalid expression "+orig)}
			//_toret.fn=function(){}
		}
		return _toret
	}
})();