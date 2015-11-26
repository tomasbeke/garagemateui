/**
 * Created by Atul on 6/2/2015.
 */
;(function(){
$.form2field=$.model.make({
	ip: null,
	wrapel: null,
	labelel: null, meta: null,
	name: null, klass: null,
	wrapklass: null, wrapstyle: null,
	labeltop: null,
	ui: null,validation:null,
	renderer: null
},{
	getForm:function(){
		return this.form
	},
	getModel:function(){
		return (this.getForm()||{}).model
	},
	initField:function(config,meta){
		this.ui= $.domUI();
	},

	valHandle:function(v){
			if(typeof(v)!="undefined" ){
				this.setValue(v)
				return this.ip
			}
			return $d.prop(this.ip,"value")
	},
	setValue:function(val){
		var ip=this.ip.el
		if(val==null){val=""}
		else if(this.reader){
			val=this.reader(val)
		}
		if(ip && val && String(ip.type).toLowerCase().indexOf("date")>=0 && "valueAsDate" in ip){
			var dt= $.date(val)
			if(dt){
				ip.valueAsDate=dt.toNative()
				return
			}
		}
		$d.prop(ip,"value",this.applyFormat(val))
	},
	getValue:function(){
		return $d._val(this.ip)
	},
	checkValidity:function( ) {
		if(!this.ip){return true}
		var msg=null, valid=true,ipel=this.ip.el,validity=this.validity||{}
		try {
			ipel.setCustomValidity("")

			if (ipel.willValidate && !ipel.checkValidity()) {
				valid = false
			}
			var data=$.extend(this.getModel().toMap(), {value: this.getValue()});
			data[this.name]=data.value
			if (valid ) {
				if ( validity.fn) {
					valid =  validity.fn(data)
					if(!valid){
						msg=this.validationMessage||"Invalid value";
					}
				}
			}
			if(validity.message){
	            if(!valid){
					 msg=validity.message(data)
				}
			}
			if(!valid && msg){
				ipel.setCustomValidity(msg)
				//ipel.checkValidity()
			}

		} catch(e){

		}
		return valid;
	},
	applyFormat:function(a) {
			var val = a;
			if(this.__raw===a){return this.__val}
			this.__raw=a;
			var format=this.format||(this.meta||{}).format
			if(format && "function" == typeof(format.fn || format)){
				val=(format.fn || format)(val)
			}  else if(this.type=="date" && typeof(format)=="string"){
				val = $.date.format(val,format);
			}
			else if(this.hasLookup && this.meta && typeof(this.meta.getLookupValueMap)=="function"){
				this.meta.getLookupValueMap()
				if(this.meta._lookupmap && this.meta._lookupmap[String(val)]){
					val=this.meta._lookupmap[String(val)];
				}
			}
			this.__val=	val
			return val
		},
	render:function(){
		var fld=this;
		var dom=fld.form.formDom
		if(!(fld && fld.name)){return}
		var ip,nm=fld.name;

		if(!fld.ip){

			var type=fld.type||"text",iptype=fld.iptype||type
			if(fld.name=="id"||fld.hidden){type='hidden'}
			if(type=='hidden'){return}
			if(!fld.iptype && (type=="bool"||type=="boolean")){iptype="checkbox"}
			var lbltxt=fld.nolabel?"":(fld.label|| $.titleize(nm).replace(/_/g," ").replace(/(\S)name$/g,"$1 Name").replace(/_?id$/g,""));
			if(lbltxt=="-"||lbltxt=="_"){lbltxt=""}
			if(iptype=="datetime"){
				iptype="datetime-local"
			}
			var lbl= lbltxt?("<span class='ip-label'>"+(lbltxt)+"</span>"):"";
			fld.wrapel=$d("<label class='field-wrap'>"+lbl+"<span class='ip-wrap'></span></label>");
			var renderer=fld.renderer||fld.fieldrenderer

			if (!fld.hasLookup && (fld.list || fld.primaryEntity) || (fld.meta && fld.meta.hasLookup)) {
				fld.hasLookup = true
			}
			var placeholder=fld.placeholder||lbltxt,title=String(fld.title||fld.tips||"").replace(/(['"])/g,"\\$1");
			if (fld.hasLookup || type == "select") {
				ip = "<select class='form-ip' title='"+title+"' name='" + fld.name + "'><option>_</option></select>";
			} else if (type == "textarea") {
				ip = "<textarea placeholder='"+placeholder+"' title='"+title+"' class='form-ip' name='" + fld.name + "'> </textarea>";
			} else {
				ip = "<input placeholder='"+placeholder+"' title='"+title+"' class='form-ip' type='" + iptype + "' name='" + fld.name + "'/>";
			}

			fld.ip=fld.wrapel.q(".ip-wrap").append(ip);
 			var ipel=fld.ip.el
			if(ipel&& ipel.constructor && ipel.constructor.prototype  ){
				ipel.constructor.prototype.checkValidity || (fld.ip.el.constructor.prototype.checkValidity=function(){return true});
				ipel.constructor.prototype.setCustomValidity || (fld.ip.el.constructor.prototype.setCustomValidity=function(){return ""});
			}
			if(fld.klass){
				fld.wrapel.addClass(fld.klass)
			}
			fld.wrapel.appendTo(dom.down(".form-content"))
			fld.ip=fld.wrapel.q(".form-ip,input,select,textarea");
			fld.ip && fld.ip.addClass("form-ip");
			fld.labelel=fld.wrapel.q(".ip-label");
			if(typeof(renderer)=="string"){
				renderer=_formplugins[renderer]

			}
			if(!renderer){
				renderer=_formplugins[fld.type=='bool'?'boolean':fld.type]
			}
			if(renderer){
				if(typeof(renderer.render)=="function"){
					renderer.render(fld,fld.form)
				} else if(typeof(renderer)=="function") {
					renderer(fld,fld.form)
				} else if(typeof(renderer.init)=="function") {
					renderer.init(fld,fld.form)
				}
			}
			fld.ip=fld.wrapel.q(".form-ip,input,select,textarea");

		} else{
			$d.addClass(fld.ip,"form-ip");
		}

		if(fld.labelel){
			fld.labelstyle && 		fld.labelel.css(fld.labelstyle)
			fld.labelwidth && 	fld.labelel.css("width",fld.labelwidth)
		}

		fld.wrapklass && fld.wrapel.addClass(fld.wrapklass);
		fld.wrapstyle && fld.wrapel.css(fld.wrapstyle);
		fld.labeltop && fld.wrapel.addClass("label-top");
		fld.validity=fld.validity||{}
		if(fld.ip){
			fld.ip.__valHandle=fld.valHandle.bind(fld);

			["required","readonly","width","height","placeholder","novalidate","min","max","maxlength","minlength","step","pattern"].forEach(function(k){
				if(!(fld[k] == null || fld[k]==false || fld[k]=="false")){
					fld.ip.prop(k,fld[k])
				}
			});

			if(fld.validation){
				fld.validity.fn=$.fnize(fld.validation)
			}
			if(fld.validationMessage){
				if(typeof(fld.validationMessage)=="string" && !/\$\w+/.test(fld.validationMessage)){
					fld.ip.prop("validationMessage",fld.validationMessage)
				}
				else{
					fld.validity.message=$.fnize(fld.validationMessage)
				}
			}
			//validity - pattern nin max maxlength step
			//validationMessage setCustomValidity
			if(fld.ui){
				if(typeof(fld.ui.applyUI)=="function"){
					fld.ui.applyUI(fld.ip );
				}
				else{
					fld.ip.prop(fld.ui);
				}
			}
		}

		var meta=fld.meta||{}
		if(fld.hasLookup){
			var list=meta.lookuplist||fld.list;
			if(list){
				$d.addOptions(fld.ip,list.filter(function(a){return a=="undefined"?"":a}))
			} else {
				if(typeof(meta.getLookupList)=="function"){
					meta.getLookupList().then(
						function(list){
							$d.addOptions(this.ip,list )
						}.bind(fld)
					)
				}
			}
		}
		if(fld.onrender){
			fld.onrender.call(this )
		}
	}
});
	$.form2=self.Klass("$.form2", {
	_fields: {}, fieldKlass: null, formDom: null, dom: null, meta: null, layoutTemplate: null, dataHandle: null,
	bindings: null, dataRecord: null, layoutmode: {}, editmode: null,
	errordom: null, panel: null, model: null, ui: {},formFields:null,

	initialize: function () {//meta,columnConfig,layoutTemplate,dataRecord
		if(arguments.length&&!$.isPlain(arguments[0])){
			this.meta=arguments[0];
			this.columnConfig   = arguments[1];
			this.layoutTemplate = arguments[2];
			this.dataRecord     = arguments[3];
			if(arguments[4]&& $.isPlain(arguments[4])){
				this.updateProperties(arguments[4])
			}
		}
		//model
		if(!this.model){
			this.model= $.model.from({})
 		}
		var columnConfig=[]
		this.formFields=List.create()
		if(this.dom||this.el){
			this.formDom=this.el||this.dom
		}
		if(this.formDom){
			$d.qq(this.formDom,"input,textarea,select").forEach(
				function(ip){
					columnConfig.push({name:ip.name|| $.d.domdata(ip,"name")|| $.d.domdata(ip,"key")|| ip.id,ip:ip})
				}
			)
		} else {
			columnConfig=this.columnConfig||[]
		}
		if(!columnConfig.length){
			if(this.meta){
				this.meta.eachItem(function(fld){
					columnConfig.push(fld.name)
				},this)
			}
		}
		var ths=this;
		this.columnConfig=columnConfig.map(function(fld){
			if(typeof(fld)=="string"){
				fld={name:fld}
			}
			var meta
			if(ths.meta){
				meta=ths.meta.findField(fld.name)
				if(meta){
					fld=$.extend(meta.toMap(),fld)
				}
			}
			var nu=new $.form2field(fld)
			nu.meta=meta;
 			nu.form=ths;
			return nu
		})
		this.$=$d.util.createScopedDollar("formDom")

		this.$header=$d.util.createScopedDollar(".form-header","formDom")
		this.$footer=$d.util.createScopedDollar(".form-footer","formDom")
		this.$status=$d.util.createScopedDollar(".form-header .form-status","formDom")


	},
		checkValidity:function(){
			if(this.columnConfig.some(function(fld){
				return !fld.checkValidity()
			})){
				return false;
			}
			return true;
		},
	renderField:function(fld){
		fld.render();
		if(!this.model.contains(fld.name)){
			this.model.addProperty(fld.name )
		}
		if(fld.ip){

			fld.ip.on("change",function(model,ev){
				setTimeout(function(model){
					if(this.checkValidity()){
						model.setItem(this.name,this.getValue())
					}
				}.bind(this,model),1)
			}.bind(fld,this.model))
		}
		this.model.onchange(fld.name,function(rec){
			if(rec.value!=null){
				this.setValue(rec.value)
			}
		}.bind(fld));
 	},
	getFieldConfig:function(nm){
		return this.columnConfig.find(function(a){return a.name==nm})
	},
	attachRule:function(fieldnm,expr,domprop){
		var nm= fieldnm+"_"+$.UUID()
		this.model.addExpr(nm,expr)
		this.model.onchange(nm,function(field, prop,rec){
				var fld=this.getFieldConfig(field)
			if(fld && fld.ip){
				$d.prop(fld.ip,prop,rec.value);
			}
		}.bind(this,fieldnm,domprop))
	},
	render:function(domel){
		var dom,ths=this
		if($d(domel) && !this.formDom){
			this.formDom=$d(domel).down("form")
		}
		if(!this.formDom){
			if($d(domel)){
				this.formDom=$d(domel).append("<form> </form>")
			}
		}

		if(!this.formDom){
			this.formDom=$d("<form></form>")
		}
		if($d(domel)){
			if(!$d(domel).contains(this.formDom)){
				$d(domel).append(this.formDom)
			}
		}
 		if(this.formDom && !this.formDom.down(".form-content")){
			 this.formDom.append("div.form-content")
		}

		if(this.formDom) {
			if( !this.formDom.down(".form-footer")){
				this.formDom.append("div.form-footer")
			}
			if( !this.formDom.down(".form-header")){
				this.formDom.prepend("<div class='form-header'><div class='form-title'></div><div class='form-status'></div></div>")
			}
			this.formDom.addClass("ui-form")
			this.formDom.onsubmit=function(ev){ev.preventDefault();return false}
			if (this.title) {
				this.formDom.q(".form-title").html(this.title)
			}
			if(this.labeltop){
				this.formDom.addClass("label-top")
			}
			if(this.ui){
				this.formDom.prop(this.ui);
			}
		}
		if(this.buttonbar){
			this.$footer().append("<button>Save</button>").on("click",this.save.bind(this))
		}
		this.columnConfig.forEach(this.renderField.bind(this));
		this.afterRender()
		this.dataRecord && this.reset(this.dataRecord)
	},
		getProvider:function(){
			if(this.provider){
				return this.provider
			}
			if(this.dataRecord&&this.dataRecord.provider){
				return this.dataRecord.provider
			}
			if(this.meta){
				return this.meta.getProvider()
			}
		} ,
		save:function(){
			if(!this.checkValidity()){
				return Promise.reject();
			}
			var  pr=Promise.deferred()

			var provider=this.getProvider(), data=this.getMods(),rec=this.dataRecord||{};
			if(!(provider && data && Object.keys(data).length)){return}
            if(rec){
				if(rec.id){
					data.id=rec.id;
				}
 			}

			if(this.defaultCriteria){
				$.extend(data,this.defaultCriteria)
			} else if(rec.store && $.isPlain(rec.store.defaultCriteria)){
				$.extend(data,rec.store.defaultCriteria)
			}
			this.fire("beforesave",data);

			if(provider){
				var model=this.model
				if(data.id>0){
					pr=  provider.update(data)
					pr.then(function(data){
						model.update(data)
					},function(error){
					})
				} else{
					pr=  provider.insert(data)
						pr.then(function(data){
							model.update(data)
						},function(error){
						})
				}
			}
			return pr
		},
	afterRender:function(){

	},
	validate:function(){

	},
	reset:function(data){
		var undef
		this.columnConfig.forEach(function(a){a.__raw= a.__val=undef});
		if(data && typeof(data)=="object"){
			this.model.update(data)
		}
		this._orig= $.clone(this.model.toMap())

	},
	getMods:function(){
		var mod={},orig=this._orig||{}
		$.each(this.model.toMap(),function(v,k){
			if(orig[k]!==v){
				mod[k]=v
			}
		});
		return mod;
	}

})

	var _formplugins={
		datalist:{
			render:function(model,form,list){
				PopupView.lookupList()
				var PopupView=$.require("PopupView")
				var cb=function(l){
					if(model.ip && /SELECT/i.test(model.ip.tagName)){
						$d.addOptions(model.ip, l.list||l)
						$d.val(model.ip,form.model[model.name])
					}
					else{
						PopupView.lookupList(l,{callback:function(rec){
							form.model[model.name]=rec.id
						}})
					}

				}
				if($.isArray(list)){cb(list)}
				else if(!model.readonly&&model.hasLookup ){
					if(model.primaryEntity){
						app.getEntity(model.primaryEntity).then(
							function(ent){
								if(ent.findField(form.meta.name+"_id")){
									if(form.model["id"]){
										form.model.watch("id",function(r){
											if(r.value){
												model.getDynaLookupList(r.value  ,cb)
											}
										})}     else{
											model.getDynaLookupList( form.model["id"]   ,cb)
										}} else{
											model.getLookupList().then( cb);
										}

								},
								function(ent){
									model.getLookupList().then( cb);
								}
						)
					} else{
						model.getLookupList().then( cb);
					}
 				}
 				if(model.ip){
					if(model.ui.combo){model.ip.type="search";}
					else if(model.ip && !/SELECT/i.test(model.ip.tagName)){ model.ip.readOnly=true}
				}

			}
		},
		hidden:{
			name:"id",
			render:function(model,form){
				model.hidden=true;
				model.ip.type="hidden"
			}
		},
		color:{ "type":"color",
			render:function(model,form){
				if(!model.ip || model.ip.data("_colorpicker")){return}
				model.ip.prop("readonly",true)
				model.setValue=function(a){
					if(String(a).length==6 && /^[A-F0-9]+$/.test(a)){a="#"+a}
					model.ip.css("backgroundColor",a)
				}
				model.hasPopup=true


				$.require("ColorPicker",function(ColorPicker){
					function onselect(color,nohide) {
						var val = color.getColorName()
						if (!val){
							val = String(color.toHex()).replace(/^\#/, "")
						}
						form.model[model.name]=val
						if(!nohide){_picker.hide()  }
					}
					var _picker=new ColorPicker(onselect,onselect)
					model.ip && model.ip.on("mousedown",function(evt){
						_picker.activate(model.ip)

					})
					model.ip && model.ip.data("_colorpicker",_picker)
				})
			}
		} ,
		date:{"type":"date",
			render:function(model,form){
				if(model.asIP){

				}
				model.hasPopup=true
				var PopupView=$.require("PopupView")
				if(model.actualtype=="time" || model.type=="time"){
					var l=List.create().fill(0,0,24).collect(function(l,i){var v= i,s=i==0?"12":((v>12?(v-12):v)+""),ap=(v>=12?"pm":"am") ;return [s+":00"+ap,s+":15"+ap,s+":30"+ap,s+":45"+ap]}).flatten();
					model._lkuplist= PopupView.lookupList(l.toArray(), {
							anchor: model.ip, height: 200,
							callback: function (rec) {
								form.model[model.name] = $.typeInfo.TIME.coerce(rec.id)
								//this.fire("uivaluechange",{name:model.name,value:k,newValue:k,valueLabel:lbl})
							}.bind(model)
						}
					);
					model.ip &&  model.ip.on("mousedown",function(evt){
						model._lkuplist.show();
					});
					return
				};
				$.require("UI.Calendar",function(cal){
					var calmodel=null;
					model.ip &&  model.ip.on("mousedown",function(evt){
						var ip=evt.target;
						if(!calmodel){
							calmodel=cal(null,{ ip:ip,
								onselect:function(k,lbl){
									form.model[model.name]=k
									//model.fire("uivaluechange",{name:model.name,value:k,newValue:k,valueLabel:lbl})
									calmodel.view.hide()
								}
							});
							//    model.ui.calvw.el.css({border:"1px solid #666"})
							//   model.ui.calvw.setConfig("anchor",ip).layout().show();
						}
						calmodel.view&&calmodel.view.show();
						calmodel.render( model.val||new Date()   );
					});
					model.ip &&  model.ip.prop("readonly",true)
				});
			}
		},
		"radioset":{"type":"radioset",
			render:function(model,form){
				if(model.ip){model.ip.el.type="text"
 					var el=$d.template("label.toggle-switch>span.aa[-on:yes;-off=no]>div.bb{.}+strong").render().el
					el.setAttribute("for",model.ip.id)
					el.setAttribute("forLabel",model.ip.id)
					el.insertBefore(model.ip.el,el.firstChild)
					var wrap=model.wrapel?model.wrapel.q(".ip-wrap"):null
					if(!wrap && !$d.is(model.ip,"input")){wrap=model.ip}
					wrap&&wrap.append(el);
				}
			}
		},
		"boolean":{"type":"boolean",
			 render:function(model,form){
				if(model.ip){
					if(!$d.is(model.ip,"input")){
						return _form.models.datalist.render(model,form,[{label:"Yes",id:1},{label:"No",id:0}])
					}

					model.ip.el.type="checkbox"
					var el=$d.template("div.toggle-switch>span.aa[-on:yes;-off=no]>div.bb{.}+strong").render().el
					el.style.position="relative"
					$d(el).on("click",function(){
						if($d.is(model.ip,'input[type="checkbox"]')) {
							model.ip.checked = !model.ip.checked
							form.model[model.name] = model.ip.checked ? 1 : 0
						}  else  {
							form.model[model.name]= form.model[model.name]?0:1
						}
					});
 					el.insertBefore(model.ip.el,el.firstChild)
					var wrap=model.wrapel?model.wrapel.q(".ip-wrap"):null
					if($d.isFormInput(model.ip )){
						wrap.append(el);
					}

				}
			}
		},
		rte: {

			render:function(model,form){
 				$.require("rtf",function(wysihtml5){
					$d.onAttach(model.ip,function(){
						var editor=wysihtml5.setup(model.ip,form.model[model.name],false)
						editor.onchange(function(val){
							 form.model[model.name]=val
						})
					})

				})
			}
		} ,
		"img":{"type":"image", defaultValue:location.href.split("/").slice(0,4).join("/")+"/theme/img/noimg.png",
			init:function(model,form){
				if(!model.ip){   return}
				model.ip.type="image"
				model.ip.addEventListener("mousedown",function(ev){
					ev.preventDefault&&ev.preventDefault()
					//  return false;
					var bar,  updlbl=model.wrapel,
						uploadbutton=this ,img=this,wd ; model.hasPopup=true
					$.require(["$File"],function(){
						model._img=img;
						var ip=null,b=updlbl.el.getBoundingClientRect(),mousepos=$d.util.mousePos  ,
							d=document.createElement("div") ,iptemplate
						d.innerHTML="<input class='noform' type='image' style='width:5px;height:5px;background-color:transparent;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
							iptemplate= d.removeChild(d.firstChild) ;
						updlbl.on("mousemove",function(ev){
							if(!wd){wd=(uploadbutton.offsetWidth+5);updlbl.style.width=wd+"px";
								b=updlbl.el.getBoundingClientRect();
							}
							if(!ip || !updlbl.querySelector("input")){
								ip=updlbl.insertBefore(iptemplate.cloneNode(true),uploadbutton.el)
								$File.setupIp(ip,{type:'image',reader:"dataURL",
									complete:function(pr){
										form.model[model.name]= this.result
										//    model.fire("uivaluechange",{name:model.name,value:this.result,newValue:this.result})
										if(ip){updlbl.removeChild(ip);ip=null;}
									}})
							}
							if(b.top==0){b=updlbl.el.getBoundingClientRect(); }
							var pos=mousepos(ev )
							pos.x=(pos.x- (b.left+3));pos.y=(pos.y- (b.top+3));
							if(pos.y<=0 || pos.x<=0 || pos.y> b.height || pos.x>wd){return}
							ip.style.top=pos.y+"px";ip.style.left=pos.x+"px"
						})
					})
					return false;
				});
				/*function _setVal(a){if(a==null){return}
				 var v=typeof(a)=="string"?a:a.value
				 var val=String(v)
				 if(val.indexOf("data:")!=0&&val.indexOf("//")==-1){val="//"+val}
				 this.ip.setAttribute("src", val)
				 this.ip.setAttribute("value", val)
				 this.ip.value=val
				 this.ip.dataset.val=val
				 }*/


				//   model.on("value",_setVal)
				model.setValue=function(a){
					if(a){
						if(this.reader){
							a=this.reader(a)
						}
					}
					var val=String(a )
					if(val.indexOf("data:")!=0&&val.indexOf("//")==-1){val="//"+val}
					this.ip.setAttribute("src", val)
				}
			}

		},
		"attachment": (function(){
			var attachmentsStore
			function _setup(model, form,store){
				if(!app.attachmentsStore) {app.attachmentsStore=store;}
				//$d.hide(model.ip)

				var bar, updlbl=model.wrapel.q(".ip-wrap"),    wd;
				model.hasPopup=true
				var ip=null,iptemplate, b=updlbl.el.getBoundingClientRect (), mousepos=$d.util.mousePos  , $file, d=document.createElement ("div") , iptemplate
				d.innerHTML="<input class='noform ipfileworker' style='width:5px;height:5px;background-color:transparent;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
					iptemplate=d.removeChild (d.firstChild);
				$.require(["$File"], function(){
					$file=$File
				})
				function mv(ev){
					var  uploadbutton=model.ip ;
					if(!wd) {
						wd=(uploadbutton.offsetWidth + 5);
						if($d.css(updlbl,"display")!="block") {
							updlbl.style.width=wd + "px";
						}
						b=updlbl.el.getBoundingClientRect ();
					}
					if( !updlbl.querySelector (".ipfileworker")) {
						ip=updlbl.el.appendChild (iptemplate.cloneNode (true))
						$File.setupIp (ip, {type: 'doc', reader: "dataURL",//dataURL
							progress: function(n){
								if(n.percent<=1){model.ip.val("");}
								model.ip.placeholder="loading .."+ n.percent+"%"
							},
							complete: function(result){
								updlbl.off("mousemove", mv);
								model.ip.placeholder="uploading .."
								var info=this.info,type=info.type,mtype=info.type
								store.provider.insert({nm: info.name, isbase64:1,filename: info.name, sz: info.sz, mimetype: info.mimetype,
									lastts: +info.lastmodified,type: info.type, data: result
								}).then(
									function(d){
										form.model[model.name]=d.id
										updlbl.on("mousemove", mv);
									}
								)
								// model.fire("uivaluechange",{name:model.name,value:this.result,newValue:this.result})
								if(ip) {
									updlbl.removeChild (ip);
									ip=null;
								}
							}})

					}
					//if(b.top == 0) {
					b=updlbl.el.getBoundingClientRect ();
					//}
					var pos=mousepos (ev)
					pos.x=(pos.x - (b.left + 3));
					pos.y=(pos.y - (b.top + 3));
					if(pos.y<=0||pos.x<=0||pos.y>b.height||pos.x>wd) {
						return
					}
					ip.style.top=pos.y + "px";
					ip.style.left=pos.x + "px"
				}
				updlbl.on ("mousemove", mv);
				if( model.ip){
					if(!model.ip.placeholder){model.ip.placeholder="Click to select a file"}
					model.ip.type="text"
					$d.prop (model.ip, "readonly", true)
				}



			}
			return {"type": "attachment",
				init: function(model, form){
					if(!model.ip) {
						return
					}
					if(!attachmentsStore) {
						app.getEntity ("attachments").then (function(a){
							attachmentsStore=a.createStore ()
							_setup (model, form, attachmentsStore)
						})
					}else {
						_setup (model, form, attachmentsStore)
					}

				}

			}
		})()
		,
		"file":{"type":"file",
			init:function(model,form){
				if(!model.ip){   return}
				//$d.hide(model.ip)
				var bar,  updlbl=model.wrapel,
					uploadbutton=this ,img=this,wd ; model.hasPopup=true
				var ip=null,b=updlbl.el.getBoundingClientRect(),mousepos=$d.util.mousePos  ,
					$file,d=document.createElement("div") ,iptemplate
				d.innerHTML="<input class='noform ipfileworker' style='width:5px;height:5px;background-color:transparent;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
					iptemplate= d.removeChild(d.firstChild) ;
				$.require(["$File"],function(){
					$file=$File
				})
				updlbl.on("mousemove",function(ev){
					if(!wd){wd=(uploadbutton.offsetWidth+5);updlbl.style.width=wd+"px";
						b=updlbl.el.getBoundingClientRect();
					}
					if(!ip || !updlbl.querySelector("input")){
						ip=updlbl.insertBefore(iptemplate.cloneNode(true),uploadbutton.el)
						$File.setupIp(ip,{type:'doc',reader:"dataURL",
							complete:function(result){
								var info=this.info
								form.model[model.name]= JSON.stringify({name:info.name,sz:info.sz,type:info.type,data:result})
								//    model.fire("uivaluechange",{name:model.name,value:this.result,newValue:this.result})
								if(ip){updlbl.removeChild(ip);ip=null;}
							}})
					}
					if(b.top==0){b=updlbl.el.getBoundingClientRect(); }
					var pos=mousepos(ev )
					pos.x=(pos.x- (b.left+3));pos.y=(pos.y- (b.top+3));
					if(pos.y<=0 || pos.x<=0 || pos.y> b.height || pos.x>wd){return}
					ip.style.top=pos.y+"px";ip.style.left=pos.x+"px"
				})
				if(model.ip){
					model.ip.type="text"
					$d.prop(model.ip,"readonly",true)
					model.setValue=function(a){
						if(!a){return this.ip.prop("value", "")}

						var json=$.isJsonString(a)
						if(json){
							this.ip.prop("value", json.name||json.filename)
						}else{ this.ip.prop("value", String(a ))
						}
					}
				}

			}

		},
		pic:{"name":"pic","type":"string", defaultValue:location.href.split("/").slice(0,4).join("/")+"/theme/img/noimg.png",
			reader:{read:function(val0){var val=null;
				if(typeof(val0)=="string"){
					val=String(val0).replace(/^["\\]|["\\]$/g,"");
					if(val.indexOf("data")!=0){
						val=null
					}

				}
				return val
			}
			},
			render:function(mdl,form){
				var src="",wd=mdl.ui.width?Math.max(100,mdl.ui.width):200    ,DEFAULTIMG=app?(app.contextPath+"theme/img/pictures.png"):"",
					ht=mdl.ui.height?Math.max(100,mdl.ui.height):(wd*.75)
				mdl.hasPopup=true
				$d(mdl.ip).insert("" +
					"<span class=' ' style='position:relative;  display: inline-block;'>" +
					"<img data-key='snap' style='width:"+wd+"px;height:"+ht+"px;' src='"+src+"'/>" +
					"<div  class='pic-bar' style='text-align: center'>" +
					"   <button class='ui-button small smaller' style='margin:0' type='button' data-key='snap'>Snap</button>" +
					"   <span class='for-upload-file' style='position:relative;overflow:hidden;margin-left:-8px'>" +
					"    <button  class='ui-button small smaller'type='button' data-key='upload' style='z-index:1;border-top-left-radius:0;border-bottom-left-radius:0;'>upload</button>" +
					"   </span>" +
					"</div>" +
					"</span>"
					,"before") ;
				mdl.ip.type="hidden" ;
				if(!mdl.label&&mdl.labelel) {
					mdl.labelel.hide();
				} else{
					$.timer.when(function( ){ return mdl.wrapel.height() > 50  },
						function( ){
							var ht=mdl.wrapel.height();
							if(ht&&ht>100) {
								mdl.labelel&&mdl.labelel.css ({lineHeight: ht+"px"})
							}
						},
						{dur:200,maxduration:5})
				}
				//mdl.wrap.querySelector(".field-label").style.verticalAlign="top";

				var d=document.createElement("div") ,iptemplate
				d.innerHTML="<input style='width:5px;height:5px;background-color:transparent;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
					iptemplate= d.removeChild(d.firstChild);d=null;
				mdl.setValue=function(rec){
					if(!rec||rec=="null"){rec="";$d.addClass(mdl._img,"default-picture")}
					else{$d.removeClass(mdl._img,"default-picture")}
					mdl._img.el.src=rec ;
					mdl._img.dataset.key=''
				}
				mdl.onUpdate=function(dataurl){
					form.model[mdl.name]= dataurl
					//  this.fire("uivaluechange",{name:this.name,value:dataurl,newValue:dataurl})
				}

				/*mdl.on("value",function(rec){
				 this._img.el.src=rec.value;
				 this._img.dataset.key=''
				 });*/
				var bar=$d(mdl.wrapel).q(".pic-bar"),updlbl=bar.q(".for-upload-file"),
					uploadbutton=$d.q(updlbl,"button") ,img=$d.q(mdl.wrapel,"img"),wd ;
				mdl._img=img;


				var ip=null,b=updlbl.el.getBoundingClientRect(),mousepos=$d.util.mousePos

				updlbl.on("mousemove",function(ev){
					if(!ip){return}
					if(!wd){wd=(uploadbutton.offsetWidth+5);updlbl.style.width=wd+"px";
						b=updlbl.el.getBoundingClientRect();
					}

					if(b.top==0){b=updlbl.el.getBoundingClientRect(); }
					var pos=mousepos(ev )
					pos.x=(pos.x- (b.left+3));pos.y=(pos.y- (b.top+3));
					if(pos.y<=0 || pos.x<=0 || pos.y> b.height || pos.x>wd){return}

					ip.style.top=pos.y+"px";ip.style.left=pos.x+"px"
				});
				var snapshot
				function _snap(ev){
					if(!($d.is(ev.target,"button")||$d.is(ev.target,"img"))){return}
					var el=$d(ev.target)
					if(el.dataset.key=="snap"&&UI.snapshot){
						var img=$d.q(this.parentNode,"img"),b=img.getBoundingClientRect()

						snapshot=UI.snapshot(null,{width:Math.max(180, b.width),top: b.top  ,left: b.left-10 ,callback:function(resultimg,canvas,cntnr){
							if(resultimg){img.el.src=resultimg.src
								mdl.onUpdate( resultimg.src    )
							}
						}})
						if(snapshot&&snapshot.moveTo&&form&&form.panel){form.panel.on("afterlayout",  function(){
							if(mdl._img){
								setTimeout(function(){
									var b=$d.bounds(mdl._img);
									snapshot.moveTo(b.left, b.top)
								},100)
							}
						})}
					}
				}

				$.require(["UI.snapshot","$File"],function(snapshot,$File){
					var bar=$d(mdl.wrapel).q(".pic-bar")
					if(!ip || !updlbl.querySelector("input")){
						ip=updlbl.insertBefore(iptemplate.cloneNode(true),uploadbutton)
						$File.setupIp(ip,{type:'image',reader:"dataURL",
							complete:function(pr){
								mdl.onUpdate(this.result)
								if(ip){updlbl.removeChild(ip);ip=null;}
							}})
					}

					bar.on("click",_snap);
				});


			}
		}

	}
})();