/**
 * Created by Atul on 8/5/2015.
 */
 var ServiceImpl=function(name,impl,methods) {
	var _impl = impl, _name = name, _api = {}
	function invoke(fn,arg){
		if( _impl &&  _impl[fn]){
			return  _impl[fn].apply( _impl,[].slice.call(arguments,1))
		}
	}
	if(!methods && impl){
		methods=Object.keys(impl).filter(function(a){return typeof(impl[a])=="function"})
	}
	if (methods && Array.isArray(methods)) {
		for (var i = 0, ln = methods.length; i < ln; i++) {
			_api[methods[i]] = invoke.bind(this, methods[i])
		}
	}
	this.setImpl=function(impl){
		if(impl){
			_impl=impl;
		}
	}
	this.getApi=function(){ return _api; }
	this.register=function(){
		var ths=this
		$.require("js/libs/Services.js",function(Services){Services.register(_name,ths)})
	}
}
ServiceImpl.asModule=function(moduleurl){
	var service,pr=Promise.deferred()
	$.xhr.get(ResURL.from(moduleurl),{
		callback:function(data){
			if(typeof(data)=="string") {
				try {var __={}
					eval("__.x=" + data);
					data = __.x
				} catch (e) {}
			}
			if (data && data.name && data.api) {
				service=new ServiceImpl(data.name,data.api[data.name]||data.api, Object.keys(data.api))
				service.register();
				pr.resolve(service)
			} else{
				pr.reject()
			}
		}
	});
	return pr
}
ServiceImpl.asWorker=function(moduleurl){
	var wrkr=$.worker.build()
	var service,pr=Promise.deferred()
	wrkr.define("module",ResURL.from(moduleurl).build(),function(a) {
		if (a.name && a.api) {
			wrkr.addToApi(a.name, a.api)
			service=new ServiceImpl(a.name, wrkr.api[a.name],a.api)
			service.register();
			pr.resolve(service)
		} else{
			pr.reject()
		}
	});
	return pr
}
module.exports=ServiceImpl


