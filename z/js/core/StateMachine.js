/**
 * Created by Atul on 6/24/2015.
 */
$.state = (function () {
	/*

	 */
	var cap = function (s) {
		return String(s).toLowerCase().replace(/^\w/, function (s) {
			return s.toUpperCase()
		})
	}
	var flatten = function flatten() {
		var ret = []
		for (var i = 0, l = arguments , ln = l.length, a; a = l[i], i < ln; i++) {
			if (!a || typeof(a) != "object") {
				ret.push(a);
				continue
			}
			if ($.isArray(a) || (a.length && a.length >= 0) || (a.toString && ({}).toString.call(a).indexOf("Arguments") > 0)) {
				[].push.apply(ret, flatten.apply(null, $.makeArray(a)))
			} else {
				ret.push(a)
			}
		}
		return ret
	}
	function transitionklass() {
		return Klass.simple( {holder:null,worker:null,memo:null,withObserver:true,
			name: null,from:null,to:null,isCompleted:null,isActive:null,statePromise:null,
			init:function(holder,from,to,worker){
				this.holder=holder;
				this.from=from;
				this.to=to;
				this.worker=worker;
			},
			start:function(){
				this.memo=this.memo||{}
				this.isActive=true
				this.statePromise=Promise.deferred()
				if(this.worker){
					this.worker.call(this,this.end.bind(this))
				}
				return this.statePromise;
			},
			end:function(data){
				this.statePromise.resolve(data)

			},
			then:function(f1,f2){
				this.statePromise && this.statePromise.then(f1,f2)
			},
			cancel:function(){
				this.statePromise && this.statePromise.reject();

			}
		})

	}
	function holdertemplateklass() {
		return Klass.simple({
			STATIC: {all: [], __parent: null},
			name: null, value: null, state: null, defaultEv: "change", index: null, comparekey: null,memo:null,withObserver:true,
			init: function (name, par,memo) {

				this.__parent = par;this.memo=memo||{}
				this.cancelEventOnFalse = true
				this.name = this.value = String(name)//.replace(/\W/g,"").toUpperCase()
				this.comparekey = String(name).replace(/\W/g, "").toUpperCase()
				this.index = this.__parent._list.length
				if(!this.fire){
					$.emitter.augment(this)
					delete this.observer;
					this.observer=this.emitter;
				}
			},
			onpropertychange: function (nm0, fn, opts) {
				var nm = nm0
				if (typeof(nm0) == "function") {
					opts = fn;
					fn = nm0;
					nm = this.defaultproperty
				}
				this.observer.onpropertychange(nm, fn, opts);
				//return this.on("propertychange",function(rec){if(rec&&(rec.name==nm||nm=="*")){fn.call(this,rec)}})
			},
			addRule: function (rule, memo) {
				if (typeof(rule) == "function") {
					this.on("beforechange", function (nustate) {
						if (!rule.call(this, nustate, memo)) {
							return false
						}
					})
				}
			},
			toJson: function () {
				var r = {};
				r[this.value] = this.state;
				return r;
			},
			toString: function () {
				return this.value + "=" + this.state
			},
			equals: function (k) {
				return !!(this === k || this.comparekey === String(k).replace(/\W/g, "").toUpperCase());
			},
			valueOf: function () {
				return !!this.state
			},

			when: function (fn) {
				var nu = new Promise(function (res) {
					this.observer.on("change", function (fl) {
						res(fl)
					})
				}.bind(this));
				return nu
			},
			onactive: function (fn) {
				this.observer.on("active", fn);
				return this
			},
			oninactive: function (fn) {
				this.observer.on("inactive", fn);
				return this
			},
			deActivate: function () {
				return this.set(0)
			},
			activate: function () {
				return this.set(1)
			},
			isActive: function () {
				return !!this.state
			},
			get: function () {
				return this.state
			},
			set: function (activeflag) {
				if (activeflag == null) {
					activeflag = !this.state
				}
				if (activeflag && this.__parent) {
					this.__parent._list.forEach(function (it) {
						if (it !== this && it.state) {
							it.set(false)
						}
					}, this)
				}
				if(!this.fire){
					$.emitter.augment(this)
					delete this.observer;
					this.observer=this.emitter;
				}
				if (this.__parent.validateStateChange(this, activeflag) === false || this.fire("beforechange", !!activeflag) === false) {
					return
				}
				this.state = !!activeflag
				this.observer.fire("change", !!activeflag, this)
				this.observer.fire(activeflag ? "active" : "inactive", this)
				this.observer.fire("afterchange", !!activeflag, this);
				activeflag && this.__parent._updateState(this);
				return this

			}
		});
	}
	var txclass=null;
	var State = Klass.create({
		_list: null, _current: null, _rules: null,_transitions: null, _enforceSequence: null, _routes: null, _holderTemplate: null,_intransition:null,
		init: function () {
			this._transitions={};
			this._list = [];
			this._rules = {};
			this._routes = {}
			var a = arguments;
			this._holderTemplate = holdertemplateklass()
			if (a.length == 1 && typeof(a[0]) == "string") {
				a = String(a[0]).split(/\s+/)
			}
			var init = this.register("__INIT__")
			this.registerAll.apply(this, a)
			init.isinit = true
			this._current = init
		},
		getStateHolder: function (st) {
			return this._list.find(function (it) {
				return it.equals(st)
			})
		},
		addTransition: function (fromstate, tostate, fn,memo) {
			var st = this.getStateHolder(fromstate),end = this.getStateHolder(tostate)

			if (st && typeof(fn) == "function") {
				var _self = this;
				if(!txclass){txclass=transitionklass()}
				this._transitions[st.comparekey] || (this._transitions[st.comparekey] = []);

				this._transitions[st.comparekey].push(new txclass(this,st,end,fn));
			}
			return this
		},
		endTransition:function(memo){
			if(!this.isInTransition()){return false}
			this._intransition.resolve(memo);
			this._intransition=null; return this
		},
		startTransition:function(){
			if(this._intransition()){return this._intransition}
			return this._intransition=Promise.deferred()
		},
		isInTransition:function(){return !!this._intransition},
		addRule: function (forstate, rule, memo) {
			var st = this.getStateHolder(forstate)
			if (st && typeof(rule) == "function") {
				var fn = rule, _self = this;
				this._rules[st.comparekey] || (this._rules[st.comparekey] = []);
				this._rules[st.comparekey].push([fn, memo]);
			}
			return this
		},
		validateStateChange: function (st, nustate) {
			var ret = true, nextstate = this.getStateHolder(st), _curr = this.getState(),
				idx = this.getState() ? this.getState().index : -1;
			if (nextstate.equals(_curr) && nustate !== _curr.state) {
				return true;
			}
			if (nextstate && nextstate.isinit) {
				return false
			}
			if (this._enforceSequence && nustate && nextstate && nextstate.index != idx + 1) {
				ret = false
			}

			if (ret && nustate && this._rules[nextstate.comparekey] && this._rules[nextstate.comparekey].length) {
				var _self = this;
				if (this._rules[nextstate.comparekey].some(function (r) {
						return !r[0].call(_self, nextstate, _curr,r[1])
					})) {
					ret = false
				}
			}
			if (ret && nustate && _curr && this._routes[_curr.comparekey] && this._routes[_curr.comparekey] && this._routes[_curr.comparekey].indexOf(nextstate.comparekey) == -1) {
				ret = false

			}

			if (!ret) {
				throw "invalid state change from " + _curr.name + " to " + nextstate.name
			}

			return ret
		},
		isState: function (state) {
			return this._current && this._current.equals(state);
		},
		getState: function () {
			return this._current;
		},
		forward: function () {if(this.isInTransition()){return}
			if(!this._current){return this.reset()}
			return this.setState(this._list[this._current.index+1]);
		},
		finish: function () {
			return this.setState(this._list[this._list.length-1]);
		},
		reset: function () {
			return this.setState(this._list[0]);
		},
		to: function (state) {
			return this.setState(state);
		},
		onpropertychange: function (fn) {
			if(fn===null){return this.off("change");}
			this.on("change", fn);
		},
		_updateState: function (state) {
			var st = this.getStateHolder(state)
			if (st && st.isActive()) {
				this._current = st;
				this.fire("change", {name: st.name, value: st.state, newValue: st.state}, st)
			}
			return this
		},
		_setState: function (st) {
			if(!st){return}
			st.set()
			if (st.isActive()) {
				this._updateState(st)
			}
		},
		setState: function (state) {
			if(this.isInTransition()){return}
			var st = this.getStateHolder(state)
			if(!st){return}
			var pr,curr=this._current
			if (curr && curr.isActive()) {

				if(this._transitions && this._transitions[curr.comparekey] && this._transitions[curr.comparekey].length){
					pr=this._transitions[curr.comparekey].filter(function(it){return it && it.to && it.to.comparekey==st.comparekey}).map(function(it){return it.start()})
				}

			}
			if(pr && pr.length){
				Promise.all(pr).then(
					this._setState.bind(this,st)
				)
			} else{
				this._setState(st)
			}

			return this
		},
		hasState: function (k) {
			return !!this.getStateHolder(k)
		},
		registerAll: function () {
			var stateList = flatten.apply(null, arguments)
			if (stateList && stateList.length) {
				var l = stateList.slice()
				while (l.length)this.register(l.shift());
			}
			return this;
		},
		enforceSequence: function (flg) {
			this._enforceSequence = !(flg === false);
			return this;
		},
		register: function (state,memo) {
			var nu = this.getStateHolder(state), ctor = this._holderTemplate
			if (!nu) {
				nu = new ctor(state, this,memo)
				this.properties.set(nu.value, nu)
				if (nu.value != "__INIT__") {
					this["on" + cap(nu.value)] = function (state, fn) {
						state.onactive(fn);
						return this
					}.bind(this, nu)
				}
				this._list.push(nu)

			}
			return nu;
		}
	});
	return State;
})();