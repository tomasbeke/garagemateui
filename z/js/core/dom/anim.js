 ;(function() {

	var fx = [],
		defrule, _hooks = {}

	function canAnim(k) {
		return ($d.css.isStyle(k) || k == "scroll" || getHook(k))
	}
	 function addHook(name, handle){
			 _hooks[name]= handle

	 }

	 function getHook(nm){if(!nm){return}
		 return _hooks[nm]||_hooks[String(nm).toLowerCase().replace(/_/g,"")]
	 }
	var speedmap = {
		slow: 600 ,
		fast: 200,
		medium: 400
	}

	var quproto = Object.create([])
	quproto.next = function() {
		var nu, _que = this
		if (this._active && !this._active.isDone()) {
			if (!this._active.isBusy()) {
				this._active.start()
			}
			return this
		}
		while (nu = _que.shift()) {
			if (nu.isDone && nu.isDone()) {
				nu = null
			} else if (nu) {
				break;
			}
		}
		this._active = null;
		if (nu) {
			this._active = nu;
			nu.start()
		}
		return this
	}
	quproto.hasPending = function() {
		return this.length > 0
	}
	quproto.add = function(a) {
		this.push(a);
		return this
	}
	quproto.remove = function(a) {
		if (a == this._active) {
			this._active = null
		}
		var i = this.indexOf(a);
		if (i >= 0) {
			this.splice(i, 1)
		}
		return this;
	}
	quproto.active = function() {
		return this._active
	}
	quproto.clear = function() {
		this._active = null;
		this.length = 0;
		return this
	}

	function _queue(el) {
		this.el = $d(el)
		this.el.data("animation_qu", this)
	}
	_queue.prototype = quproto;
	_queue.getOrMake = function(el) {
		if(!el){return}
		var qu = $d(el.el).data("animation_qu")
		if (!(qu && qu.push)) {
			qu = new _queue(el)
		}
		return qu;
	}
	var defaultConfig = JSON.stringify({
		delay: 0,
		duration: 1000,
		easing: null,
		rules: {},
		fxclass: "fxtx",
		callbacks: {
			end: []
		},
		state: {
			_prepped: 0,
			_busy: 0,
			_done: 0
		}
	});
	var _animCtor=null
	 function parseClipOptions( options) {
		 var optns = {}, el = this, args = [].slice.call(arguments, 1);
		 if (!el) {
			 return
		 }
		 if(options  && options.rules && options.rules.clip){
			 optns=options.rules.clip;
		 }
		 else {
			 if (typeof(options) == "string") {
				 optns.a = options
			 }
			 else if ($.isPlain(options)) {
				 optns = options
			 }
			 if (typeof(args[args.length - 1]) == "function") {
				 optns.end = optns.end || []
				 optns.end.push(args.pop())
			 }
			 if (typeof(args[args.length - 1]) == "boolean") {
				 optns.reverse = args.pop()
			 }
			 if (typeof(args[args.length - 1]) == "function") {
				 optns.end = optns.end || []
				 optns.end.push(args.pop())
			 }
		 }
		 if (!el.isVisible(true)) {
			 el.show();
		 }
		 var bnds = el.bounds()

		 var h = optns.height || bnds.height;
		 var w = optns.width || bnds.width || el.width()
		 var start = {
			 l: 0, t: 0, r: 0, b: 0
		 };
		 var inc = {
			 r: 0, b: 0, l: 0, t: 0
		 };
		 var end = {
			 l: 0, t: 0, r: w, b: h

		 };
		 if($.isPlain(optns.start) && $.isPlain(optns.end)){
			 start=optns.start;
			 end=optns.end
		 } else {
			 var anchor = String(optns.a || optns.anchor || "").replace(/left/i, "l").replace(/top/i, "t").replace(/right/i, "r").replace(/bottom/i, "b").replace(/center/i, "c");
			 if (!anchor) {
				 anchor = "t"
			 }
			 if (anchor.length > 1 && anchor[1] == "c") {
				 anchor = anchor.split("").reverse().join("")
			 }

		;

			 //starts with anchored pos
			 if (anchor == "c") {
				 start.r = start.l = w / 2
				 start.b = start.t = h / 2
			 }
			 else if (anchor == "l" || anchor == "r") {
				 start.b = h;
				 if (anchor == "r") {
					 start.l = start.r = w
				 }
			 }
			 else if (anchor == "t" || anchor == "b") {
				 start.r = w;
				 if (anchor == "b") {
					 start.t = start.b = h
				 }
			 }

			 //centerleft
			 else if (anchor == "cl" || anchor == "cr") {
				 start.t = start.b = h / 2
				 start.l = anchor == "cr" ? w : 0
			 }
			 else if (anchor == "ct" || anchor == "cb") {
				 start.l = start.r = w / 2
				 start.t = anchor == "cb" ? h : 0
			 }
			 else if (anchor == "tr") {
				 start.r = start.l = w
			 }
			 else if (anchor == "br") {
				 start.r = start.l = w
				 start.t = h
			 } else if (anchor == "bl") {
				 start.t = h
			 }
		 }
		 var duration = Number(optns.duration) || 1000
		 var incUnit = duration / 16;

		 inc.t = (end.t - start.t) / incUnit
		 inc.r = (end.r - start.r) / incUnit
		 inc.b = (end.b - start.b) / incUnit
		 inc.l = (end.l - start.l) / incUnit
		 var que = [], rnng = $.extend(start), arr = ["top", "right", "bottom", "left"], prior = ""
		 var counts = Math.ceil(Math.max.apply(Math, arr.map(function (K) {
			 var k = K.charAt(0)
			 return (inc[k] ? ((end[k] - start[k]) / inc[k]) : 0) || 0
		 })));
		 for (var i = 0; i < counts; i++) {
			 var val = []
			 for (var j = 0; j < 4; j++) {
				 var k = arr[j].charAt(0)
				 rnng[k] = rnng[k] + inc[k]
				 rnng[k] = inc[k] < 0 ? Math.max(end[k], rnng[k]) : Math.min(end[k], rnng[k])
				 if (rnng[k]) {
					 val.push(rnng[k].toFixed(2).replace(/\.00$/, "") + "px")
				 } else {
					 val.push("0")
				 }
			 }
			 var v = val.join(", ")
			 if (v === prior) {  continue  }
			 prior = v;
			 que.push(val.slice())
		 }
		 if(optns.reverse){
			  que.reverse();
		 }
		 return {duration:duration,easing:optns.easing,rule:{anchor:anchor,start:start,end:optns.end,inc:inc,que:que}}
	 }
	 function clipAnim(  config,rule ){
		 var animoptns=$.extend({},config,rule)
		 var promise=Promise.deferred(),el=this
		 //var animoptns=parseClipOptions.apply(this,arguments),currentvis
		 if(!animoptns){return}
		 var currentvis=el.css("visibility")
		 var pos = el.css("position"),target=el
		 if (!(pos == "absolute" || pos == "fixed")) {
			 target = $d.absolutize(el,{fixed:true,clone:true})
			 target.style.zIndex = 100;
			 target.addClass("is-clone")
			 el.css("visibility", "hidden")
		 }
		 ;
		 el.data("_animoptions",JSON.stringify(animoptns));
		 function onEnd( optns) {
			 if (this != el) {
				 if (!currentvis  ) {
					 el.el.style.removeProperty("visibility");
				 }
				 else {
					 el.el.style.visibility = currentvis;
				 }
				 $d(this).remove();
			 }
			 if(Array.isArray(optns.end)){
				 while(optns.end.length){
					 var f=optns.end.shift()
					 if (typeof(f) == "function") {
						 f.call(el)
					 }
				 }
			 }
			 else if (typeof(optns.end) == "function") {
				 optns.end.call(el)
			 }
			 promise.resolve(el)
		 };

		 (function (EL, animoptns,callback) {
			 var Q=animoptns.que, dur=animoptns.duration,easing=animoptns.easing

			 var elem = EL.el,  last = Q[Q.length - 1], DELIM = null,transitionprop=$d.__transitionprop||"transition";
			 easing=easing||"ease-out"
			 function onend() {
				 applyStyle(last, true)

				 if (typeof(callback) == "function") {
					 callback.call(EL,animoptns)
				 }
			 }

			 function applyStyle(v, fin) {
				 if (fin === true) {
					 elem.style.removeProperty("clip")
				 } else {
					 var val
					 if (!DELIM) {
						 var curr = String(EL.css("clip") || "")
						 if (curr.indexOf("rect") >= 0) {
							 DELIM = curr.indexOf(",") == -1 ? " " : ", "
						 }
					 }
					 if (!v) {
						 return
					 }
					 val = "rect(" + v.join(DELIM || ", ") + ")"
					 elem.style["clip"] = val
				 }
			 }
			 elem.style.removeProperty(transitionprop);
			 applyStyle(Q.shift());
			 //if supports transition
			 var supportstransition = true
			 if (supportstransition) {
				 setTimeout(function () {
					 EL.css(transitionprop, "clip " + ((dur / 1000).toFixed(2).replace(/\.00/, "")) + "s "+easing)
					 setTimeout(function () {
						 applyStyle(Q.pop());
						  setTimeout(onend, dur + 50)
					 }, 1)
				 }, 0)

			 } else {var fr = $d.util.animframe
				 function doframe() {
					 if (Q.length) {
						 applyStyle(Q.shift());
						 fr(doframe)
					 } else {
						 setTimeout(onend, 20);
					 }
				 }
				 fr(doframe)
			 }


		 })(target, animoptns, onEnd );
		 return promise
	 }
	var ctor = function(el, config) {
		if(!_animCtor){
			_animCtor=function(el){
				this.__el=el;
				this.config = this._config = JSON.parse(defaultConfig)
			}
			var proto={}
			proto.element = function() {
				return $d(this.__el);
			}
			proto._dispatch = function _dispatch(nm, data) {
				var l = this._config.callbacks[nm || "end"];
				if(typeof(this._config[nm])=="function"){
					if(!l){l=[ ]}
					 if(l.indexOf(this._config[nm])==-1){l.push(this._config[nm])}
				}
				if ($.isArray(l)) {
					while (l.length) {
						var fn = l.shift()
						typeof(fn) == "function" && fn.call(this , data);
					}
				}
			}
			proto.isCleared = function() {
				return this._config.cleared;
			}
			proto.clear = function() {
				this._config = JSON.parse(defaultConfig)
				this._config.cleared = true
				this.getQueue().clear();
				return this
			}
			proto.getQueue = function() {
				return _queue.getOrMake(this.element())
			}
			proto.hasQueue = function(v) {
				return this.getQueue().hasPending()
			}
			proto.isDone = function(v) {
				return this._config.state._done
			}
			proto.isBusy = function(v) {var C=this._config
				if (C.state._busy && ((Date.now() - C.state._busy) > C.duration * 1.5)) {
					C.state._busy = 0
				}
				return C.state._busy
			}
			proto.delay = function(v) {
				if (v == null) {
					return this._config.delay
				}
				this._config.delay = $.toNumber(v, 0);
				return this
			}
			proto.easing = function(v) {
				if (v == null) {
					return this._config.easing
				}
				this._config.easing = v;
				return this
			}
			proto.duration = function(v) {
				if (v == null) {
					return this._config.duration
				}
				if (typeof(v) == "string") {
					if (!isNaN(v)) {
						v = Number(v)
					} else if (speedmap[v]) {

						v = speedmap[v]

					}
				}
				this._config.duration = $.toNumber(v, 0) || 400 ;
				return this
			}

			proto.rule = function(p, v) {
				if (v === undefined) {
					return
				}
				if (canAnim(p)) {
					this._config.rules[p] = v
				} else {
					if (p == "delay") {
						this.delay(v)
					} else if (p == "duration") {
						this.duration(v)
					} else if (p == "easing") {
						this.easing(v)
					} else if (typeof(v) == "function") {
						var k = String(p).replace(/^on/i, "").toLowerCase();
						if (k == "after" || k == "complete") {
							k = "end"
						}
						if (k == "before" || k == "beforestart") {
							k = "start"
						}
						this._config.callbacks[k] || (this._config.callbacks[k] = [])
						this._config.callbacks[k].push(v)
					} else {
						this._config[p] = v
					}
				}
				return this
			}

			proto.rules = function(ro) {
				var r = ro
				$.each(ro, function(v, k) {
					this.rule(k, v)
				}, this);
				return this
			}
			proto.prep = function(reset,rules) {var el=this.element()
				rules=rules||this._config.rules;
				$.each(rules, function(v, k) {
					if (v == null) {
						v = {}
					}
					if (typeof(v) != "object") {
						v = {
							to: v
						}
					}
					if ($d.css.isStyle(k) && (!("from" in v) || reset === true)) {
						v.from = $d.css(el, k)
					}
					this._config.rules[k] = v;
				}, this);
				this._config.state._prepped = 1
				if (this._dispatch (  "start") === false) {}
			}
			proto.restore = function(pt) {
				pt = pt || "_def"
				if (this.getQueue().mark && this.getQueue().mark[pt]) {
					$.extend(this._config, this.getQueue().mark[pt])
				}
				return this
			}
			proto.mark = function(pt) {
				pt = pt || "_def"
				this.getQueue().mark || (this.getQueue().mark = {})
				this.getQueue().mark[pt] = $.clone(this._config)
				return this
			}
			proto.reverse = function() {
				var nurules = {}
				if (!this._config.state._prepped) {
					this.prep()
				}
				$.each(this._config.rules, function(v, k) {
					nurules[k] = {
						from: v.to,
						to: v.from
					}
				})
				this.then(nurules)
				return this;
			}
			proto.resume = function() {
				if (this._config.state.paused) {
					this._config.state._done = 0;
					this._config.state._busy = 0;
					this._config.state.paused = 0
					this.prep(true)

				}
				return this;
			}
			proto.pause = function() {
				this.stop()
				this._config.state.paused = true
			}
			proto.stop = function(complete) {
				return this.end(true,complete)
			}
			proto.end = function(nonext,complete) {
				if (this.isDone()) {
					return this
				}
				if(this._pendingPromise){
					this._pendingPromise.then(function(nonext,complete,a){
						this._pendingPromise=null;
						this.end(nonext,complete);
					}.bind(this,nonext,complete))
				}
				var el=this.element()
				this._config.state._done = 1;
				this._config.state._busy = 0;
				$d.__isanimating = false
				$d.removeClass(el, ["animating", this._config.fxclass]);
				$d.data(el, "_lastanim_", this)
				$d.data(el, "_anim_", null)
				this._dispatch (  "end")
				if(complete===true){
					$.each(this._config.rules, function(v, p) {
						if (p == "rotate") {
							$d.rotation(el, v.to)
						} else {
							$d.css(el, p, v.to);
						}
					});
				}
				if (nonext !== true) {
					this.getQueue().remove(this).next()
				}
				return this
			}
			proto.doAnim = function(rules) {
				var _config=this._config,
					el=this.element()
				rules=rules||_config.rules
				if (isNaN(_config.duration) || !(_config.duration > 10)) {
					_config.duration = speedmap.medium;
				}
				var onend = this.end.bind(this)
				if(!Object.keys(rules).length) {
					if(this._pendingPromise){
						this._pendingPromise.then(onend)
					}
					return;
				}

				$.each(rules, function (v, p) {
					if (p == "rotate") {
						$d.rotation(el, v.from)
					} else {
						$d.css(el, p, v.from);
					}
				});
					_config.fxclass = $d._util.addFxRule(_config.duration, _config.easing)
					$d.removeClass(el, ["animating", _config.fxclass]);


					setTimeout(function () {
							el.onTransiotionEnd(function () {
								setTimeout(onend, 1)
							}, true)
						}, 1
					);
					setTimeout(function () {
						$d.addClass(el, ["animating", _config.fxclass]);
						$.each( rules, function (v, p) {
							if (p == "rotate") {
								$d.rotation(el, v.to)
							} else {
								$d.css(el, p, v.to);
							}
						});
					}, 1);

			}
			proto._start = function() {var _config=this._config
				var  props = Object.keys(_config.rules),ruleslocal=$.clone(_config.rules)
				if (!props.length) {
					return this
				}
				this.getQueue()._active = this

				_config.duration = _config.duration || speedmap.medium
				for(var i=0;i<props.length;i++){
					var hook = getHook(props[i]),nm=props[i]
					if(!(hook && typeof(hook.prep)=="function")){continue}
					delete ruleslocal[nm]
					var nuconfig = hook.prep.call(this, _config),nm=props[i]

					if ($.isPlain(nuconfig)) {
						var clone= $.clone(nuconfig)
						if($.isPlain(clone.rule)){
							if(!clone.rule[nm]){
								_config.rules[nm]=clone.rule;
							}
							else{
								$.extend(_config.rules,clone.rule)
							}
							delete clone.rule;
						}
						$.extend(_config, clone)

					}
				}
				this.prep(false,ruleslocal)
				_config.state._prepped = 1
 				$d.__isanimating = true

				var onend = this.end.bind(this)

				var promises=[]
				ruleslocal=$.clone(_config.rules)
				for(var i=0;i<props.length;i++){
					var hook = getHook(props[i]),nm=props[i]
					if(!(hook && (typeof(hook.anim)=="function"||typeof(hook)=="function"))){continue}
					delete ruleslocal[nm]
					var res=(hook.anim||hook).call(this, _config, _config.rules[nm])
					if(res && res.isPromise){
						promises.push(res)
					}
				}
				 if(promises.length){
					 this._pendingPromise=Promise.all(promises)
				 }
				if(Object.keys(ruleslocal).length) {
					setTimeout(function () {
						$d.__isanimating = false
						if (!this.isDone()) {
							onend()
						}
					}.bind(this), _config.duration * 2)
 				}
				this.doAnim.call(this,ruleslocal)
				return this
			}
			proto.start = function() {var _config=this._config
				if (this.isBusy() || this.isDone() || this.element().isAnimating()) {
					return
				}
				var hook, props = Object.keys(_config.rules)
				if (!props.length) {
					return
				}
				_config.state._busy = Date.now();

				if (_config.delay >= 1) {
					var dl = _config.delay;
					_config._delay = _config.delay;
					delete _config.delay
					setTimeout(this._start.bind(this), dl)
					return this
				}
				return this._start(this)
			}
			proto.then = function() {var _config=this._config
				var a = [].slice.call(arguments);
				if (a[0] == "reverse") {
					a[0] = function() {
						this.reverse()
					}
				}
				if (typeof(a[0]) == "function") {
					_config.callbacks["end"].push(a[0]);
					if (_config.state._done) {
						this._dispatch( "end");
					}
					return this
				}

				a.unshift("chain");
				a.unshift(this);
				var nu = anim.apply(this, a)||this
				nu._config.duration = nu._config.duration || this._config.duration
				return nu
			}
			_animCtor.prototype = proto
		}

		return new _animCtor(el);
	}


	function anim(e) {
		var el = $d(e.el || e),
			auto = true,
			reverse = false,
			chain
		if(!el){
			if(this && typeof(this.element)=="function"){el=this.element()}
			else{
				return
			}
		}

		var a = [].slice.call(arguments, 1)

		var anm = $d.data(el, "_anim_"),
			last = $d.data(el, "_lastanim_")
		if(last && !last.element()){
			last=null;
			$d.data(el, "_lastanim_",null)
		}
		if (!a.length) {
			return anm || last
		}

		if (a.length == 1 && a[0] === false) {
			if (anm) {
				anm.stop();
				return anm;
			}
		}
		var c,clipoptions

			if (a.length == 1 && (a[0] === true || a[0] === "reverse")) {
				reverse = true;
				a.pop();
			}

		if (reverse) {
			c = last
		} else {
			c = ctor(el);
		}
		if (!c) {
			return this
		}
		if(clipoptions){
			$.extend(c.config, clipoptions);
			a=[];
		}
		if (a.length) {
			if (a[0] == "chain") {
				chain = true;
				a.shift()
			}
			if (typeof(a[a.length - 1]) == "boolean") {
				auto = a.pop()
			}
			if (typeof(a[0]) == "boolean") {
				reverse = a.shift()
			}

			if ($.isPlain(a[0])) {
				if (a[0].a || a[0].anchor|| a[0].iterations || a[0].duration) {
					$.extend(c.config, a.shift());
				}
			}
			if (a[0] && typeof(a[0]) == "object") {
				c.rules(a.shift())
			}
			while (a[0] && typeof(a[0]) == "string") {
				if (getHook(a[0])) {
					var nm=a.shift()
					c.rule(nm, "")
					if(getHook(nm).init){
						getHook(nm).init.apply(this,a);
					}
				} else if (a[0].indexOf("ease") == 0) {
					c.easing(a.shift())
				} else if (speedmap[a[0]]) {
					c.duration(a.shift())
				} else if (a[0] == "rules") {
					a.shift();
					c.rules(a.shift())
				} else {
					c.rule(a.shift(), a.shift())
				}
			}

			if($.isPlain(a[0])){
				$.extend(c.config, a.shift());
			}
			if(c.config.method ){
				var nm=c.config.method,hook=getHook(c.config.method)
				if(hook) {
					c.rule(nm, "")
					if (hook.init) {
						hook.init.apply(this, a);
					}
				}

			}
			if (typeof(a[0]) == "number" && c.duration() == null) {
				c.duration(a.shift())
			}
			if (typeof(a[0]) == "number") {
				c.delay(a.shift())
			}
			if (typeof(a[0]) == "function") {
				c.then(a.shift())
			}
			if (typeof(a[0]) == "function") {
				c.then(a.shift())
			}
		}
		if (!chain && $d.isAnimating(el) && anm) {
			return anm
		}
		if (c.config.auto == null) {
			c.config.auto = true
		}

		c.config.reverse = reverse
		if (c.config.auto) {
			c.getQueue().add(c).next()
		}
		$d.data(el, "_anim_", c)
		return c
	}
	anim.addHook = function(name, handle) {
		addHook(name, handle)
	}
	anim.hasHook = function(name) {
		return getHook(name)
	}
	function scrollTop(config,rule){
		var onend = this.end.bind(this),el=this.element(),af=$d.util.animframe
		var toscroll=Number(rule.to)||0,curr=el.scrollTop,step=Number(rule.step)||10,max=el.scrollHeight-el.offsetHeight
		if(curr>toscroll){
			step=0-step
			toscroll=Math.max(0,Number(toscroll))
		} else{
			toscroll=Math.min(toscroll,max)
		}
		function fn() {
			var nu=el.scrollTop+step,endit=0
			if((step<0 && nu >=toscroll) || (step>0 && nu <= toscroll)){
				el.scrollTop=nu
				if(el.__scrollTop!=null && el.__scrollTop==el.scrollTop) {
					endit=1
				}
				el.__scrollTop=el.scrollTop
			} else {endit=1}
			if(endit){
				delete el.__scrollTop
				onend();
				return
			}
			af(fn);
		}
		af(fn);
	}
	anim.addHook("scrollTop", {
		anim:scrollTop
	});
	anim.addHook("scroll", {
		anim:scrollTop
	});
	 anim.addHook("clip", {
		 prep:function(config){
 			 return parseClipOptions.call(this.element(),config)
		 },
		 anim: function(config,rule){
			 return clipAnim.call(this.element(), config,rule )

		 }
	 })
	anim.addHook("scrollLeft", {
		anim: function(config,rule){
			var onend = this.end.bind(this),el=this.element(),af=$d.util.animframe
			var toscroll=Number(rule.to)||0,curr=el.scrollLeft,step=rule.step||10,max=el.scrollWidth-el.offsetWidth
			if(curr>toscroll){
				step=0-step
				toscroll=Math.max(0,Number(toscroll))
			} else{
				toscroll=Math.min(toscroll,max)
			}
			function fn() {
				var nu=el.scrollLeft+step,endit=0
				if((step<0 && nu >=toscroll) || (step>0 && nu <= toscroll)){
					el.scrollLeft=nu
					if(el.__scrollLeft!=null && el.__scrollLeft==el.scrollLeft) {
						endit=1
					}
					el.__scrollLeft=el.scrollLeft
				} else {endit=1}
				if(endit){
					delete el.__scrollLeft
					onend();
					return
				}

				af(fn);
			}
			af(fn);

		}

	});
	anim.addHook("hide", {
		prep: function(config) {
			var r = config.rules || (config.rules = {});
			delete r.hide;
			r.opacity = {
				from: 1,
				to: .01,
				duration: 500
			}
			this.then(function() {
				this.element().hide()
			});
		}
	});
	anim.addHook("show", {
		prep: function(config) {
			var r = config.rules || (config.rules = {});
			delete r.hide;
			r.opacity = {
				from: .1,
				to: 1,
				duration: 500
			}
		}
	});
	anim.addHook("toggle", {
		prep: function(config) {
			var r = config.rules || (config.rules = {});
			delete r.hide;

			if (!this.isVisible() || this.opacity() < .2) {
				r.opacity = {
					from: .1,
					to: 1,
					duration:  speedmap.medium
				}
			} else {
				r.opacity = {
					from: 1,
					to: .1,
					duration: speedmap.medium
				}
			}
		}
	});
	anim.addHook("fill", {
		prep: function(config) {
			var r = config.rules || (config.rules = {});
			delete r.fill;
			this.element().absolutize();
			var parel=this.element().parent(),
				p = {height:parel.innerHeight(),width:parel.innerWidth()},
				curr = this.element().offset();
			r.top = {
				to: p.top,
				from: curr.top
			}
			r.left = {
				to: p.left,
				from: curr.left
			}
			r.height = {
				to: p.height,
				from: curr.height
			}
			r.width = {
				to: p.width,
				from: curr.width
			}
		}
	});
	function animScroll(dir,rule){
		var dim=dir.charAt(0).toUpperCase()+dir.substr(1)
		var scrollProp="scroll"+dim;
		var curr=this[scrollProp],max=this[scrollProp]-this["offset"+dim];
		if(Math.abs(max)<=1){return}
		if(isNaN(rule.from)){rule.from=curr}
		if(rule.from!=curr){this[scrollProp]=rule.from}
		if(isNaN(rule.to)){
			if(Math.abs(max-rule.from)<=2){
				rule.to=0
			} else {rule.to=max}
		}
		var blk=this.element().el,_to=Math.abs(rule.to),inc=Math.round(Math.max(Math.abs(_to-rule.from)/50,2));
		var steps=Math.ceil(Math.abs(_to-rule.from)/inc)+1
		if(_to<rule.from){inc=0-inc}
		var onend = this.end.bind(this)
		$d.util.animframe(function anim(){
			var curr=blk[scrollProp];
			if(steps>=0 && Math.abs(_to-curr)>inc) {
				blk[scrollProp] = curr+inc
				steps--;
				$d.util.animframe(anim)
			} else {
				blk[scrollProp] = _to;
				onend()
			}
		});

	}
	anim.addHook("scrollLeft2", {
		anim:function(config,rule){
			animScroll.call(this,"left",rule)
		}
	});
	anim.addHook("scrollTop2", {
		anim:function(config,rule){
			animScroll.call(this,"top",rule)
		}
	});
	$d.anim=anim
})();
