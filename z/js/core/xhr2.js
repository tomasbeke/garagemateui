/**
 * Created by Atul on 8/25/2015.
 */
	;(function(){
var transport,xhrWorker,validResponsetypes = "document json blob arraybuffer text json".split(/\s+/),DOMIND ;
	function domInd(mode){
		if(!DOMIND && typeof(document)!="undefined" && document.body){
			DOMIND=document.createElement("div")
			DOMIND.style.cssText="z-index:1001;position:fixed;top:10px;background-color:yellow;left:0;height:8px;width:8px;border-radius:4px;overflow:hidden;";
			DOMIND.className="fxtx_25";
			DOMIND=document.body.appendChild(DOMIND)
		}
		DOMIND.style.backgroundColor=mode===2?"red":"yellow"
		DOMIND.style.opacity=1
		 setTimeout(function(){DOMIND.style.opacity=0},500)
	}
function parseHTML(txt, xhr) {
	var doc = null
	if (!xhr.responseXML && typeof(txt) == "string" && typeof(DOMParser) != "undefined") {
		var oParser = new DOMParser();
		var oDom = oParser.parseFromString(txt, "text/html");
		doc = oDom.documentElement
	} else if (xhr.responseXML && xhr.responseXML.documentElement && xhr.responseXML.documentElement.querySelector) {
		doc = xhr.responseXML.documentElement
	}
	var div = document.createElement("div")
	if (doc) {
		var h = doc.querySelector("head")
		if (h) {
			while (h.firstChild) {
				var c = h.removeChild(h.firstChild);
				if (c && (String(c.tagName) == "SCRIPT" || String(c.tagName) == "LINK")) {
					div.appendChild(c)
				} else {
					if (c && String(c.tagName) == "TITLE" && c.textContent) {
						var h1 = document.createElement("H1")
						h1.className = "doc-title"
						h1.textContent = c.textContent
						div.insertBefore(h1, div.firstChild)
					}
				}
			}
		}
		var b = doc.querySelector("body")
		if (b) {
			while (b.firstChild) {
				div.appendChild(b.removeChild(b.firstChild))
			}
		}
	} else {
		try {
			if (typeof(txt) == "string") {
				div.innerHTML = txt.replace("<!DOCTYPE html>", "").trim().replace(/<[\/]?html>/g, "").trim()

			}
		} catch (e) {
		}
	}
	if (div && div.firstChild) {
		var d = document.createDocumentFragment()
		while (div.firstChild) {
			d.appendChild(div.removeChild(div.firstChild))
		}
		return d;
	}
	div = null;
	return txt
}
function parseJSONFromString(str) {
	var res = str
	if (typeof(str) == "string" && str.indexOf("function") == -1 && (
		(str.indexOf("{") == 0 && str.lastIndexOf("}") == str.length - 1) ||
		(str.indexOf("[") == 0 && str.lastIndexOf("]") == str.length - 1)
		)) {
		try {
			res = JSON.parse(str)
		} catch (e) {
			var __;
			try {
				eval("__=" + str);
				res = __
			} catch (e) {
			}
		}
	}
	return res
}
function _transport() {
	if (!transport) {
		var lst = [
			function () {
				return typeof(XMLHttpRequest2) != "undefined" ? new XMLHttpRequest2() : null;
			},
			function () {
				return new XMLHttpRequest();
			},
			function () {
				return new ActiveXObject('Msxml2.XMLHTTP');
			},
			function () {
				return new ActiveXObject('Microsoft.XMLHTTP');
			}
		]
		for (var i = 0; i < 3; i++) {
			var it = lst[i]
			try {
				if (lst[i]()) {
					transport = lst[i];
					break;
				}
				;
			} catch (e) {
			}
		}
	}
	return transport();
}
	var proto={
		then:function(fn,err){
			return this._promise.then(fn,err)
		},
		prepareParms: function prepareParms() {//url,configmap,callback
			var config = {}, argarr = [].slice.call(arguments[0])
			var callbacks={}
			if (argarr && argarr.length) {

				if (typeof(argarr[argarr.length-1]) == "function") {
					callbacks["complete"] = argarr.pop();
				}
				if (typeof(argarr[argarr.length-1]) == "function") {
					if(callbacks["complete"]){
						callbacks["error"]=callbacks["complete"]
					}
					callbacks["complete"] = argarr.pop();
				}
				if (typeof(argarr[0]) == "string" || (argarr[0] && typeof(argarr[0]) == "object" && "protocol" in argarr[0])) {
					config.url = argarr.shift();
				}
				if (argarr[0] && typeof(argarr[0]) == "object") {
					var obj = argarr.shift()
					if(typeof(obj.callback)=="function"){
						callbacks["complete"] = obj.callback;
						delete obj.callback;
					}
					for (var k in obj) {
						config[k] = obj[k];
					}
				}
				var info = $.pluck(config, ["directive", "type", "cmd", "target", "token"])
				var xhrinfo = $.pluck(config, ["isresource","method", "Eval", "sync", "async", "responseType", "headers", "type"])

				xhrinfo.callbackname=config.callbackname||config.jsoncallbackname||config.jsoncallback
				if (xhrinfo.async === false) {
					xhrinfo.sync = true
				}
				$.each(config,function(v,k){
					if(typeof(v)=="function"){
						callbacks[k]=v
					}
				})
				xhrinfo.method = String(xhrinfo.method || "get").toLowerCase()
				var args = $.omit(config, ["directive", "url", "isresource","uri", "URI", "params", "args", "pars", "data", "type", "cmd", "target", "token", "method", "sync", "responseType", "headers"])
				args.data = config.data;
				delete config.data
				for (var i = 0, l = ["params", "args", "pars"]; i < 3; i++) {
					var p = config[l[i]]
					delete config[l[i]]
					if (p) {
						if (!$.isPlain(p)) {
							if (typeof p != "object" || Array.isArray(p)) {
								args[l[i]=="callback"?"complete":l[i]] = p
							}
						}
						else {
							$.extend(args, p)
						}
					}
				}

				$.each(args,function(v,k){
					if(typeof(v)=="function"){
						callbacks[String(k).replace(/^on/,"").toLowerCase()]=v;
						delete args[k];
					}
				})
				this.config = {url:config.url,args: args, info: info, xhrinfo: xhrinfo}
				if(Object.keys(callbacks).length){
					this.config.callbacks=callbacks;
				}
			}

		},


		parseResponse: function parseResponse(xhr, issocketorjsonp) {
			var xhrinfo = this.config.xhrinfo

			xhr = xhr || {}
			var txt = issocketorjsonp === true ? (xhr.response || xhr.data) : (xhr.response || xhr.responseText || xhr.result || xhr.results || xhr.data)
			var responseType = xhr.responseType || xhrinfo.responseType
			var r=txt, r0
			if (responseType == "blob") {
				r = new Blob([xhr.response], {type: xhrinfo.type});
			} else if (responseType == "document" || xhr.responseXML) {
				r = parseHTML(txt, xhr)
			} else {
				if (typeof(txt) == "string") {
					r = txt
					if (/^<!\w/.test(r)) {
						//html
					} else if (xhrinfo.Eval) {
						var r1
						try {
							r1 = (1, eval)(r);
							r = r1
						} catch (e) {
						}
					} else if (!responseType || responseType == "json") {
						r = parseJSONFromString(r)
					} else {

					}
				}
				var data = (r || {}).data
				if (data && typeof(data) == "string") {
					r.data == parseJSONFromString(r.data)
				}
			}
			this.response=r;
			return r
		},
		readResponse: function readResponse(req0, issocketorjsonp) {
			if(this._done){return this.response}
			this._done = true
			var result, ths = this, req = req0 || this.transport
			try {
				if ((typeof(Event) != "undefined" && req0 instanceof Event)) {
					req = req.target||req.srcElement|| this.transport
				}
			} catch(e){}
			if (!req) {
				this.fire("complete",{})
				return {}
			}
			ths.responseHeaders = req.headers || (req.getAllResponseHeaders ? req.getAllResponseHeaders().split(/[\n\r]/).reduce(function (m, k) {
					var ar = k.split(":");
					if (!ar[0].trim()) {
						return m
					}
					return m[ar.shift().trim()] = ar.join(":").trim(), m
				}, {}) : {}) || {};
			var success
			if (issocketorjsonp) {
				success = !req.error;
			}
			else {
				success = (!req.status && location.protocol == "file:") || (String(req.status).toUpperCase() == "OK") ||
					(req.status >= 200 && req.status < 300) || req.status == 304 || req.status == 1223 || ($.browser.safari && req.status === undefined);
			}
			if (success) {
				result = ths.parseResponse(req, issocketorjsonp)
				if (ths.config.xhrinfo.sync) {
					//ths.fire("load", result);
				}
				ths._promise.resolve(result)
			} else {
				result = {error: ""}
				var err = req.error
				if (!err && req.data) {
					err = req.data.error || req.data
				}
				if (err && typeof(err) == "object") {
					if (err instanceof Error) {
						result.error = req.error.message || req.error.toString()
					} else {
						result.error = err.message || JSON.stringify(err)
					}
				} else {
					result.error = err
				}
				ths._promise.reject(result.error)
			}

			this.fire("complete",result)
			return result
		},
		readFileSystem: function readFileSystem( ) {
			var url=this.getUrl()
			if (/file:/i.test(url)) {
				var   errorHandler = function (e) {
					this._promise && this._promise.reject(e)
				}.bind(this)
				var filebase;
				window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
				if (location.href.indexOf("index.html") > 0) {
					filebase = location.href.substr(0, location.href.indexOf("index.html"))
				}
				if (filebase && url.indexOf(filebase) >= 0) {
					//url = url.substr(window.filebase.length)

				}
				return
			}
		},
		sendSocket: function sendSocket( ) {
			var url=this.getUrl()
			var xhrinfo = this.config.xhrinfo, args = this.config.args, info = this.config.info
			var candoSocks = $.webSocket && $.webSocket.isAvailable() && !xhrinfo.sync
			if (candoSocks && (String(url).indexOf(String(app.servicePath)) != 0 || /\.(htm|html|js|json|css)$/i.test(this.URI.file))) {
				candoSocks = false
			}
			if (!candoSocks) {
				return
			}
			var type = info.type || info.cmd || "route"
			$.webSocket.dispatch(type, $.extend({}, info, (this.URI || {}).args), function (data, errmsg) {
				if (data === false) {
					if (!$.webSocket.isAvailable()) {
						this.send()
					}
					else {
						this._promise.reject(errmsg)
					}
				}
				else {
					this.readResponse(data)
				}
			}.bind(this));
			return this
		},
		sendWorker: function sendWorker( ) {
			if (this.config.xhrinfo.sync) {
				return
			}

			if (!xhrWorker && $.worker) {
				xhrWorker = $.worker.setup(null, true);
			}

			if (xhrWorker) {
				var url=this.getUrl()
				var ths = this
				xhrWorker.load(url).then(function (data) {
					ths.readResponse(data)
				}, function (data) {
					ths.readResponse(data)
				})
				return this
			}
		},
		getTransPort:function getTransPort() {
			if(!this.transport){
				this.transport = _transport()
				this.transport.onload = this.readResponse.bind(this)
				this.transport.onerror = function (e) {
					e=e||{}
					var target= e.target||{}
					var status=target.statusText||target.status|| e.message||"No response"
 					this._promise.reject({type: e.type, error:"Connectivity Error : "+(status||""),message: e.message, data: e.data})
				}.bind(this)
				this._attachCallbacks()
			}
			return this.transport;
		},
		sendGet: function sendGet() {

			var xhr, xhrinfo = this.config.xhrinfo, args = this.config.args, info = this.config.info
			var url=this.getUrl()
			xhr = this.getTransPort()

			xhr.open("GET", url, !xhrinfo.sync)
			if (xhrinfo.responseType && validResponsetypes.indexOf(xhrinfo.responseType) >= 0) {
				try {
					xhr.responseType = xhrinfo.responseType
				} catch (e) {
				}
			}
			if (!xhrinfo.headers) {
				xhrinfo.headers = {}
			}
			if ($.browser) {
				xhrinfo.headers["x-ua"] = $.browser.prefix + "/" + $.browser.version
			}
			xhrinfo.headers["x-requested-with"] = "xmlhttprequest"
			$.each(xhrinfo.headers,
				function (v, k) {
					xhr.setRequestHeader(k, v);
				}
			)
			//withCredentials



			xhr.send(null);
			if (xhrinfo.sync) {
				if (xhr.responseText) {
					this.readResponse()
				}
			}
			return this
		},
		sendCrossSite: function sendCrossSite() {
			var url=this.getUrl()
			if (this.URI && this.URI.isCrossSite && ResURL.getRoot() && ResURL.getRoot().host == this.URI.host) {
				this.URI.isCrossSite = false
			}
			if (this.URI.isCrossSite) {
				return $.xhr.jsonp(this)
			}
		},
		sendPost: function sendPost(URI) {
			this.URI||(this.URI=ResURL.make(this.config.url));
			var data, url = this.URI.build(), args = this.config.args
			if (args.data && Object.keys(args).length == 1) {
				data = args.data
			}
			else {
				data = args
			}

			if (data) {
				if (typeof(data) == "string") {
					data = decodeURIComponent(decodeURI(data))
				} else {
					data = JSON.stringify(data);
				}
			}
			var xhr = this.getTransPort()
 			xhr.open("POST", url)
			xhr.send(data || null);
			return this
		},
		getURI:function getURI() {
			if (!this.URI) {
				this.URI = this.URI || ResURL.make(this.config.url)
			}
			return this.URI
		},
		getUrl:function getUrl( nocache) {
			if(!this.url|| nocache){
				var url=this.getURI().updateArgs(this.config.args, true)
				url.updateArgs(this.config.info, true)
				this.url=url.fixUrl()
			}
			return this.url
		},
		send: function send(method) {
			domInd();
			this._attachCallbacks()
			if (typeof(method) == "string") {
				this.config.xhrinfo.method = method;
			}
			if (this.config.xhrinfo.method == "post") {
				return this.sendPost()
			}
			//pick the best available option
			var doget
			if(this.config.xhrinfo.isresource) {
				doget=true
			} else{
				var URI = this.getURI(),url=this.getUrl()
				//the serivce site should have cross site OK
				if(typeof(app)!="undefined" && url && ((app.resourcelib && url.indexOf(app.resourcelib)>=0) || (app.servicePath && url.indexOf(app.servicePath)>=0))){
					doget=true
 				} else if (URI && URI.file && /\.(js|css|html)$/.test(URI.file)) {
					doget=true

				}
			}
			//id resource file
			if(doget){
				this.sendGet();
			}
			else if (!this.sendSocket()) {
				if (!this.sendCrossSite()) {
					if (!this.sendWorker()) {
						this.sendGet()
					}
				}
			}

			return this
 			//get
		},
		_attachCallbacks:function(){
			if(this.config.callbacks){var callbacks=this.config.callbacks;
				$.each(callbacks,function(fn,ev){
					if(this.transport || ev=="complete"){
						this.on(ev,fn);
						delete this.config.callbacks[ev]
					}

				},this);
				if(!Object.keys(this.config.callbacks).length){
					this.config.callbacks=null;
				}

			}
		},
		fire:function(ev,data){
			this._emitter && this._emitter.dispatch(ev,data)
		},
		on:function(ev,fn,opts){
			this._evhandles||(this._evhandles={});
			this._emitter||(this._emitter=new $.emitter.simpleObserver(this));
			if(!this._evhandles[ev] && ev!="complete"){
				if(this.transport && this.transport.addEventListener){
					this.transport.addEventListener(ev,this._evhandles[ev]=this._emitter.dispatch.bind(this._emitter,ev) );
				}
			}
			this._emitter.add(ev,fn,opts)
		},
		abort: function abort() {
			if(this.transport){
				this.transport.abort()
			}
		}
	}
	proto.onload=function(fn,opts){this.on("load",fn,opts);return this}
	proto.onprogress=function(fn,opts){this.on("progress",fn,opts);return this}
	proto.onabort=function(fn,opts){this.on("abort",fn,opts);return this}
	proto.onerror=function(fn,opts){this.on("error",fn,opts);return this}

var xhr = $.createClass(
	function () {
		this._promise=Promise.deferred();
		this._promise.then(function(){},function(){domInd(2);})
		this.prepareParms(arguments)
	},
	proto
);

	$.xhr=xhr;
	$.xhr.get=function(url,config,optns){
 		return new $.xhr(url,config,optns).send("get")
	}
	$.xhr.post=function(url,config,optns){
		return new $.xhr(url,config,optns).send("post")
	}
	$.xhr.sync=function(url,config,optns){
		var nu=new $.xhr(url,config,optns)
		nu.config.xhrinfo.sync=true;
		return nu.send()
	}
	$.xhr.directive = function(cmd, pars,callback) {
		var url=app.servicePath
		var optns={cmd:cmd,pars:pars}
		return $.xhr.get(url,optns,callback)
	}
	$.xhr.jsonp=(function(){
		var __tempfns={},_counter=100,_head=(document.getElementsByTagName("head")||[])[0]||null,
			_body=(document.getElementsByTagName("body")||[])[0]||null ,_doc=document,__jsonp={}
		window.__jsonp=__jsonp;
		function jsonpcall(url,callbackname,callback){
			var fnnm="cb"+(++_counter)
			url=url+(url.indexOf("?")>0?"&":"?")+callbackname+"=__jsonp."+fnnm ;
			var cnt=0;
			//url=url.replace(/%[3D2B0]+/)
			while(/%\w\w/.test(url)&&++cnt<10){
				url=decodeURIComponent(url)
			}
			var scrpt=_doc.createElement("script")
			scrpt.onerror=function(e){
				console.log("Call to service failed",url)
				callback({"error":"Call to service failed"},true)
			}
			_head.appendChild(scrpt);
			__jsonp[fnnm]=(function(nm,scrpt,callback){
				return function(data){
					try{
						scrpt.parentNode&&scrpt.parentNode.removeChild(scrpt);
						delete __jsonp[nm]
					} catch(e){}
					if(data==null){
						callback({"error":"_"},true )
					}
					else{
						callback({response:data})
					}
					//callback(data==null?"error":"load",data)

				}
			})(fnnm,scrpt,callback);
			scrpt.setAttribute("src",url)
			scrpt.src=url
			if(scrpt.getAttribute("src")!=url){
				scrpt.setAttribute("src",url)
			}
		}
		var defCallbackname="callback"
		return function(url,config,optns){
			var nu,procargs= 0,callbackname,oncomplete=null
			if(typeof(optns)=='function'){oncomplete=optns;optns=null}
			callbackname=(config||url||{}).callbackname
			if(typeof(url)=="string" && /^(http|file)/i.test(url) && typeof(config)=="function"&& (!optns || typeof(optns)=="string"||optns===true)){
				if(optns===true) {
					var uid = "", cid = window.CLIENTID
					if (typeof(app) != "undefined" && app.user) {
						uid = app.user.id
					}
					if (uid || cid) {
						if (url.indexOf("&") > 0||url.indexOf("?") > 0) {
							url = url + "&_clientid=" + cid + "&_userid=" + uid
						}
						else {
							url = url + "?_clientid=" + cid + "&_userid=" + uid
						}
					}
				}
				return jsonpcall(url ,optns||defCallbackname, config)
			}
			else if(url && url instanceof  $.xhr){
				callbackname= url.config.xhrinfo.callbackname
				nu=url
				url=nu.getUrl();

			}
			else{
				if(optns===true){optns=null}
				var nu=new $.xhr(url,config,optns)
				callbackname= nu.config.xhrinfo.callbackname
				url=nu.getUrl()
				procargs=1
				//if(config){
				// if(typeof(config)=="object"){$.extend(nu.config,config)}
				// else if(typeof(config)=="function"){nu.onload(config)}
				//}
			}
			var g=self,nm
				if(_head===null){  _doc=document
				_head=_doc.getElementsByTagName("head")[0]||null
				_body=_doc.getElementsByTagName("body")[0]||null
			}
			if(oncomplete){
				nu._promise.then(oncomplete)
			}
			jsonpcall(url , callbackname||"jsonpcallback",
				function(data,iserr){
					if(iserr){nu._promise.reject(data)}
					else{nu.readResponse(data,true)}
				}
			)



			return  nu
		}   })()

})();