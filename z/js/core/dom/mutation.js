/**
 * Created by Atul on 8/15/2015.
 */
$d.watchMutation=(function() {
	var support = {
		attrModified: null,
		input: null
	}
	var mutobserver = window.MutationObserver || (window.MutationObserver = window.WebKitMutationObserver),vphandle=null,_cache=[];
	var dataobserver = {
		__map: {}
	}


	function isDOMAttrModifiedSupported() {
		if (support.attrModified === null) {
			var p = document.body.appendChild(document.createElement('p'))
			support.attrModified = false
			p.addEventListener('DOMAttrModified', function() {
				support.attrModified = true
			}, false);
			p.setAttribute('id', 'target');
			setTimeout("document.body.removeChild(p)", 0)
		}
		return support.attrModified;
	}

	function isInputEventSupported() {
		if (support.input === null) {
			var ip = document.body.appendChild(document.createElement('input'))
			support.input = ("oninput" in ip) ? "input" : (("ontextinput" in ip || "ontextInput" in ip) ? "textInput" : false)
			document.body.removeChild(ip)
		}
		return support.input;
	}

	function attachMutationEvents(el ,ops,callback,asset){
		ops=ops||{}
		function domattrHandlefn(ev) {
			if (!(('attrChange' in ev) || ('attributeName' in ev) || ('propertyName' in ev) || ('timed' in ev))) {
				return
			}
			var rec={name:ev.attributeName || ev.attrName||ev.propertyName,oldValue :ev.oldValue || ev.prevValue,value : ev.value || ev.newValue,type:ev.type,target:ev.target}
			callback(rec);
		}

		function attachMutEvent(elem,optns,domattrHandle,attrModified,asbatch) {
			var observer
			if (mutobserver) {
				//childList,attributeFilter,characterData,characterDataOldValue
				var config={
					attributes: !(optns.attributes===false),
					attributeOldValue:!(optns.attributes===false),
					subtree: optns.bubbles||optns.subtree||optns.childList
				}
				config.childList=config.subtree
				observer = new mutobserver(function(mutations) {
					if(asbatch){attrModified(mutations)}
					else{mutations.forEach(attrModified);}
				});
				observer.observe(elem, config);
			} else {
				if (isDOMAttrModifiedSupported()) { //Opera Mutation Events but the performance is no good
					elem.addEventListener('DOMAttrModified', domattrHandle);
					observer = {
						disconnect: function() {
							this.el && this.el.removeEventListener('DOMAttrModified', domattrHandle);
						}.bind(el)
					}
				} else if ('onpropertychange' in document.body) { //works only in IE
					elem.attachEvent('onpropertychange', domattrHandle);
					observer = {
						disconnect: function() {
							this.el && this.el.detachEvent('onpropertychange', domattrHandle);
						}.bind(el)
					}
				} else {
					var memo = {},
						timer = $.timer.until(100, function chk(memo) {
							attrModified()
						}, function end(memo) {}, memo = {
							rec: record
						})
					memo.timer = timer
					observer = {
						timer: timer,
						disconnect: function() {
							this.timer.cancel()
						}.bind(memo)
					}
				}

			}
			return observer;
		}
		return attachMutEvent(el ,ops,domattrHandlefn,callback,asset);
	}
	var domModel=function(elem){
		this._data={};
		this._observer=null;
		this._descripts={};
		this._elem=$d(elem).id
		_cache.push(this)
	}
	domModel.prototype={
		addPropertyToMonitor:function(nuprops,options,callback0){
			if (typeof(nuprops) == "string") {
				nuprops = nuprops.trim().split(/\s+/)
			}
			var elem = this._elem ?this._elem.nodeType?this._elem:document.getElementById(this._elem):null
			if(!elem){return}
			nuprops = Array.isArray(nuprops) ? nuprops : [nuprops]
			if(nuprops[0]==="subtree" || nuprops[0]==="childList" ){
				options=options||{}
				options.childList=true;
				options.attributes=false
				if(!this._descripts.childList && this._observer){
					this._observer=null;
				}
				this.add("childList",{
					name: "childList",  value: {}, val: {value:function(){return null}}, callback: typeof(callback0) == "function" ? callback0 : null
				})

			} else {


				var resa = {}, el = $d(elem), stl = document.defaultView.getComputedStyle(elem);
				for (var i = 0, l = nuprops || [], ln = l.length, k; k = l[i], i < ln; i++) {
					if (!(k && typeof(k) == "string") || this._data[k]) {
						continue
					}
					var descript
					if (k == 'style') {
						for (var i1 = 0, v, l1 = Object.keys(stl) || [], ln1 = l1.length, k1; k1 = l1[i1], i1 < ln1; i1++) {
							k1 && k1 !== "cssText" && k1 !== "length" && isNaN(k1) && (v = stl[k1]) && (typeof(v) == "string" || typeof(v) == "number") &&
							this.add(k1, {
								name: k1,
								value: v,
								isstyle: true,
								val: $d.css.getRecord(null, k1),
								callback: typeof(callback0) == "function" ? callback0 : null
							})
						}
						;
					}
					else if (k != "content" && k != "value" && $d.css.isStyle(k)) {
						descript = {name: k, value: stl[k], isstyle: true, val: $d.css.getRecord(null, k)}
					} else {
						if (k === "content") {
							k = $d.isFormInput(elem) ? "value" : "textContent"
							descript = {
								name: k,
								value: el.prop(k),
								isprop: true,
								val: {
									getValue: function (el, nm) {
										return el[nm]
									}
								}
							}
						} else {
							descript = {
								name: k, value: el.prop(k), isprop: true, val: {
									getValue: function (el, nm) {
										if (el && nm in el) {
											return el[nm]
										}
										return el && el.getAttribute && el.getAttribute(nm)
									}
								}
							}
						}
					}
					if (descript && descript.val && descript.isstyle && typeof(descript.val.getValue) != "function") {
						descript.val = function (el, nm) {
							return $d.css(el, nm)
						}
					}
					if (descript) {
						if (typeof(callback0) == "function") {
							descript.callback = callback0
							this.add(k, descript);
						}
					}

				}
			}
			if(!this._observer){
				this._observer=attachMutationEvents(elem,options,function(mutations){

					var  mod = null,el =  $d(this._elem),torefresh=[];
					if (!el || el.__dragging) {
						return
					}

					if (!mutations) {
						this.refresh();
					} else {
						var childList
						mutations = Array.isArray(mutations) ? mutations : [mutations]
						for (var i = 0, ln = mutations.length; i < ln; i++) {


							var mutation = mutations[i] || {}
							if(mutation.type=="childList" && ((mutation.addedNodes && mutation.addedNodes.length) || (mutation.removedNodes && mutation.removedNodes.length))){
								childList||(childList={target:mutation.target,addedNodes:[],removedNodes:[]});
								for(var i2= 0,l2=mutation.addedNodes||[],ln2=l2.length;i2<ln2;i2++){
									childList.addedNodes.push(l2[i2])
								}
								for(var i2= 0,l2=mutation.removedNodes||[],ln2=l2.length;i2<ln2;i2++){
									childList.removedNodes.push(l2[i2])
								}

							} else{
								var name = mutation.attributeName || mutation.attrName||mutation.propertyName,
									value = mutation.value || mutation.newValue
								if (name !== null) {
									if (!(name == "style" || this._descripts[name])) {
										continue
									}
									if (name != "style" && value != null) {
										mod||(mod={});
										mod[name] = value;
									} else {
										torefresh.indexOf(name)==-1 && torefresh.push(name);
									}
								}
							}

							/*var rec={name:mutation.attributeName || ev.attrName||ev.propertyName,oldValue :mutation.oldValue || ev.prevValue,value : mutation.value || mutation.newValue,
							 type:mutation.type,target:mutation.target}*/

						}
						if(childList){
							this._data.childList=childList;
						}
						if(torefresh.length){
							this.refresh(torefresh);
						}
						if(mod){
							this.update(mod);
						}
					}

				}.bind(this),true )
			}
			if(!this._observing){
				this._observing=true
				Object.observe(this._data,function(recs){
					var el=$d(this._elem),D=this._descripts
					for(var i= 0,ln=recs.length|| 0,rec;rec=recs[i],i<ln;i++){
						if(rec && rec.name && D[rec.name] && D[rec.name].callback){
							var R={name:rec.name,type:rec.type,newValue:rec.newValue,object:rec.object,oldValue:rec.oldValue,el:el}
							if(!R.newValue && R.object){R.newValue=R.value=R.object[R.name]}
							D[rec.name].callback.call(el,R)
						}
					}
				}.bind(this), ["update"] )
			}
		},
		refresh:function(list){
			var DS=this._descripts,el=document.getElementById(this._elem),D=this._data;
			if(!list){
				list=Object.keys(DS)
			}
			for (var i = 0, ln = list.length|| 0,nm;nm=list[i], i < ln; i++) {
				if(nm == "style"){
					for(var k in DS){
						if(DS[k] && DS[k].isstyle){
							D[k]=DS[k].val.getValue(el,k)
						}
					}
					continue;
				} else if(nm == "dim"){
					if(this._hasdim) {
						for (var k in DS) {
							if (k == "height" || k == "width" || k == "top" || k == "left" || k == "offsetHeight" || k == "offsetWidth") {
								D[k] = DS[k].val.getValue(el, k)
							}
						}
					}
					continue;
				}
				nm && DS[nm] && (D[nm]=DS[nm].val.getValue(el,nm));
			}

		},
		add:function(name,descript){var k=name
			if(k=="height"||k=="width"||k=="top"||k=="left"||k=="offsetHeight"||k=="offsetWidth"){
				this._hasdim=true
				if(!vphandle){
					$.viewport.on(vphandle=function(rec){
						for(var i= 0,l=_cache,ln= l.length;i<ln;i++){
							if(l[i] && l[i]._hasdim){
								_cache[i].refresh([rec.name])
							}
						}
					})
				}
			}
			this._descripts[name]=descript
			this._data[name]=descript.value

		},
		update:function(data){
			var DS=this._descripts ,D=this._data;
			for (var i = 0, l=Object.keys(data),nm,ln = l.length||0; nm=l[i],i < ln; i++) {
				nm && DS[nm] && (D[nm]=data[nm]);
			}
		},
		remove:function(){

		}
	}
	function createModel(elem,options ){
		var model=$d.data(elem,"mutationmodel")
		if(!model){
			model=new domModel(elem);
			$d.data(elem,"mutationmodel",model)
		}
		return model;
	}
	return function(e, optns0, callback0) {
		if(optns0===false){
			var currmodel=$d.data(e ,"mutationmodel")
			if(!currmodel){return}
			var DS=currmodel._descripts ;
			var hasfn=typeof(callback0)==="function"
			for (var i = 0, l=Object.keys(DS),nm,ln = l.length||0; nm=l[i],i < ln; i++) {
				if(!(nm && DS[nm] )){continue}
				if(!hasfn || (hasfn && (callback0===DS[nm].callback))){
					delete DS[nm];
				}
			}
			if(!Object.keys(DS).length){
				currmodel._observer && currmodel._observer.disconnect && currmodel._observer.disconnect()
				$d.data(e ,"mutationmodel",null)

			}

			return;
		}
		var model=createModel(e, optns0)
		var props=[]
		if(optns0) {
			if (typeof(optns0) == "string" || Array.isArray(optns0)) {
				props = optns0;
				optns0 = {}
			}
			if (typeof(optns0) == "object") {
				if(optns0.props || optns0.properties){
					props = (optns0.props || optns0.properties);
				}

			}
		} else{optns0={}}
		model.addPropertyToMonitor(props,optns0, callback0)
		return model
	}

})() ;
