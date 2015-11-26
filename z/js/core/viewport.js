
$.viewport = $.viewPort = (function() {
	var rect = null,
		onresize__precessed = null,
		getViewportDimensions,workerY,workerX;

	function getViewportDimensionsInit() {
		var scrollChecks, doc = document,  html = doc.documentElement;
		if(!workerY){
			workerY=document.body.appendChild(document.createElement("div"));
			workerY.style.cssText="position:fixed;top:0;height:100%;left:0;width:1px;overflow:hidden;";
		}
		if(!workerX){
			workerX=document.body.appendChild(document.createElement("div"));
			workerX.style.cssText="position:fixed;top:0;width:100%;left:0;height:1px;overflow:hidden;";
		}
		if (html && typeof doc.createElement != 'undefined') {
			// Test to resolve ambiguity between HTML and body
			scrollChecks = (function() {
				var oldBorder, body = doc.body,
					result = {
						compatMode: doc.compatMode
					};
				var clientHeight = html.clientHeight,
					bodyClientHeight = body.clientHeight;
				var elDiv = doc.createElement('div');
				elDiv.style.height = '100px';
				body.appendChild(elDiv);
				result.body = !clientHeight || clientHeight != html.clientHeight;
				result.html = bodyClientHeight != body.clientHeight;
				body.removeChild(elDiv);
				if (result.body || result.html && (result.body != result.html)) {
					// found single scroller--check if borders should be included
					// skipped if body is the real root (as opposed to just reporting the HTML element's client  )

					if (typeof body.clientTop == 'number' && body.clientTop && html.clientWidth) {
						oldBorder = body.style.borderWidth;
						body.style.borderWidth = '0px';
						result.includeBordersInBody = body.clientHeight != bodyClientHeight;
						body.style.borderWidth = oldBorder;
					}
					return result;
				}
			})();
		}

		var getRoot, getViewportDimensions;

		if (typeof doc.compatMode == 'string') {
			getRoot = function() {
				var doc = window.document,
					html = doc.documentElement,
					compatMode = doc.compatMode;

				return (html && compatMode.toLowerCase().indexOf('css') != -1) ? html : doc.body;
			};
		} else {
			getRoot = function() {
				var doc = window.document,
					html = doc.documentElement;

				return (!html || html.clientWidth === 0) ? doc.body : html;
			};
		}

		// If the document itself implements clientWidth/Height (e.g. Safari 2)
		// This one is a rarity.  Coincidentally KHTML-based browsers reported to implement these properties have trouble with clientHeight/Width as well as innerHeight/Width.

		doc = html = null;
		return function() {
			var win = window;
			var root=getRoot()
			var doc = win.document;
			var wd=Math.max(doc.clientWidth || 0,root.clientWidth || 0, 0), ht=Math.max(doc.clientHeight || 0,root.clientHeight || 0)
			if(win.innerHeight && win.innerHeight<ht){ht=win.innerHeight}
			if(win.innerWidth && win.innerWidth<wd){wd=win.innerWidth}
			if(workerY.offsetHeight<ht){ht=workerY.offsetHeight}
			if(workerX.offsetWidth<wd){wd=workerX.offsetWidth}
			return [wd,ht];
		};
	}


	var data = {_inner:{height:0,width:0,scrollTop:0,scrollLeft:0,scrollWidth:0,scrollHeight:0,orientation:""},
		toMap:function(){return Object.assign({},this._inner)},
		_dispatch:function(k,v,old){
			var rec={name:k,oldValue:old,newValue:v||this._inner[k],value:v||this._inner[k],object:this._inner}
			if(this.emitter){
				this.emitter.dispatch(k,rec)
				if(k=="height"||k=="width"){this.emitter.dispatch("dims",rec)}
				this.emitter.dispatch("change",rec)
			}
		}}, bod, callbacks = [];
	Object.defineProperties(data,{
		height:{get:function(){return this._inner.height},set:function(v){var k="height",old=this._inner[k];
			if(Math.abs(v-old)>1){this._dispatch(k,this._inner[k]=v,old)}
		},enumerable: true},
		width:{get:function(){return this._inner.width},set:function(v){var k="width",old=this._inner[k];
			if(Math.abs(v-old)>1){this._dispatch(k,this._inner[k]=v,old)}
		},enumerable: true},
		scrollTop:{get:function(){return this._inner.scrollTop},set:function(v){var k="scrollTop",old=this._inner[k];
			if(Math.abs(v-old)>1){this._dispatch(k,this._inner[k]=v,old)}
		},enumerable: true},
		scrollLeft:{get:function(){return this._inner.scrollLeft},set:function(v){var k="scrollLeft",old=this._inner[k];
			if(Math.abs(v-old)>1){this._dispatch(k,this._inner[k]=v,old)}
		},enumerable: true},
		scrollWidth:{get:function(){return this._inner.scrollWidth},set:function(v){var k="scrollWidth",old=this._inner[k];
			if(Math.abs(v-old)>1){this._dispatch(k,this._inner[k]=v,old)}
		},enumerable: true},
		scrollHeight:{get:function(){return this._inner.scrollHeight},set:function(v){var k="scrollHeight",old=this._inner[k];
			if(Math.abs(v-old)>1){this._dispatch(k,this._inner[k]=v,old)}
		},enumerable: true},
		orientation:{get:function(){return this._inner.orientation},set:function(v){var k="orientation",old=this._inner[k];
			if( v!=old){this._dispatch(k,this._inner[k]=v,old)}
		},enumerable: true
		}
	});
	var pending=null
	function _update(ev) {
		if (!ev || (ev && ev.type === "scroll")) {
			bod || (bod = document.body);
			data.scrollTop = document.body.scrollTop
			data.scrollLeft = document.body.scrollLeft
			if (ev) { return }
		}
		if (!ev || (ev && ev.type === "orientation")) {
			data.orientation = window.orientation||""
			if (ev) { return}
		}
		var wh = getViewportDimensions()
		data.height = wh[1]
		data.width = wh[0]
	}

	function _init() {
		if (!getViewportDimensions) {
			getViewportDimensions = getViewportDimensionsInit();
		}
		if (!data.height) {
			_update()
			var throttled=$.throttle(_update,{tailend:true,delay:400})
			window.addEventListener("resize", throttled)
			//window.addEventListener("scroll", _updatethrottled)
			window.addEventListener("orientationchange", throttled)

		}

		return data;
	}


	var ret = {
		get: function() {
			_init()
			return this
		},
		isInView: function(el, offset) {
			_init();
			if (!el) {
				return
			}
			if (typeof offset != "number") {
				offset = 0
			}
			var e = el.el || el
			if (!e.nodeType) {
				return
			}
			if (e.nodeType === 3) {
				e = e.parentNode
			}
			if (e && e.getBoundingClientRect) {
				var b = e.getBoundingClientRect();
				if (!b.height || !b.width || b.top > (data.height + offset) || b.left > (data.width + offset) || b.bottom < offset || b.right < offset) {
					return false
				}
				return true
			}
		},
		onScroll: function(fn) {
			this.on("scroll",fn)
		},
		on: function() {
			var data=_init()
			var fn, dim,remove=(arguments[arguments.length-1] === false)

			if (typeof(arguments[0]) == "function") {
				fn = arguments[0];
				dim = arguments[1]
			} else if (typeof(arguments[1]) == "function") {
				fn = arguments[1];
				dim = arguments[0]
			}
			var type = "change"

			if (dim && typeof(dim) == "string") {
				if (dim=="dims" || (data && dim in data)) {
					type = dim;
				}
			}
			if(!remove && dim=="scroll" && !this.__onscroll){
				window.addEventListener("scroll", this.__onscroll= $.throttle(function(ev){
					data.emitter && data.emitter.dispatch("scroll",ev);
				}.bind(this)))
			}
			if (typeof(fn) == "function") {
				if(remove){
					data.emitter && data.emitter.remove(type ,fn);
				} else{
					if(!data.emitter && $.emitter && $.emitter.simpleObserver){
						data.emitter=new $.emitter.simpleObserver($.viewport,{})
					}
					data.emitter && data.emitter.add(type ,fn);
				}

			}

			return this;
		}
	}
	Object.defineProperties && Object.defineProperties(ret, {
		height: {  get: function() {  return _init().height  }, set: function() {}  },
		width: {  get: function() { return _init().width },  set: function() {} }
	});
	return ret
})()