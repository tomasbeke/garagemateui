var app=$.require("app")
var stores=$.require("garage/garagestores")
var utils=$.require("garage/garageutils")
var PopupView=$.require("PopupView");

var DataGrid= $.require("DataGrid")
var formtemplate="Z!div.flr.profileheader>{{id}}+{{asset_thumbs}}+(div.flr.profilelabel>{{name}})+{{lat}}+{{lng}}+{{operator_id}}+{{phone}}+{{region_id}}+{{hrs_id}}+{{pmt_type_id}}+{{spaces_total}}+{{facilityformat_id}}\
 div.flr>{{address}}+{{space_type_id}}\
 div.flr>{{fund_id}}+{{owner_id}}+{{floor_manager_id}}"

function controller(el){
	if(this.visibleFirst && !this.model){this.model=$.model.newInstance()}
	var vw=this ,_formInst=this.data("form")   ;
	if(_formInst){return}
	if(this.visibleFirst){

		//vw.el.q(".garage-info").fillContainer("min");
		var  defaultCriteria={facility_id:app.user.facility.id}
		function prepGrid(store,dom,optns,noload){
			var holder= {dom:dom}
			holder.formPanel=new PopupView({height:380,width:500,footer:{height:30},modal:true})
			holder.store=store
			var opt= $.extend({entityForm:{defaultCriteria:{facility_id:app.user.facility.id}},sortable:true,   title:"Staff",
				editoptions:{},zebraColumn:true ,resizable:true},optns||{})
			holder.grid=new  DataGrid(holder.store,opt);
			holder.grid.build(holder.dom)
			holder.grid.pager.pagesize=-1
			if(!noload){
				holder.grid.pager.loadPage()
			}


			return holder
		}
		function prepStore(ent,nocache){
			var store = ent.createStore(nocache)
			store.defaultCriteria={facility_id:app.user.facility.id}
			store.meta.updateFields({
					facility_id: { hidden: true, defaultValue: app.user.facility.id }
				}
			);
			return store
		}

		app.getEntity("facility_rates_alt",true).then(function(ent){
			var store=prepStore(ent,true);
			ent.updateFields({
					effective_date: {hidden: true},
					isactive: {type: "bool"}
				}
			);
			var opts={meta:store.meta,ui:{labelwidth:100},defaultCriteria:{facility_id:app.user.facility.id} }
			store.load().then(
				function(rec){
					opts.dataRecord=store.records[0];
					$.require("UI.Form",function(form){
						var _formInst=form(opts);
						vw.data("form",_formInst)    ;
						_formInst.appendTo(vw.el.q(".garage-rates-alt .form-body"))
						vw.el.q(".garage-rates-alt .form-ftr button").on("click",function(a){
							_formInst.save().then(
								function(){

								}
							);

						})
					})
				}
			);
		})
		app.getEntity("facility_rates",true).then(function(ent){
			var store=prepStore(ent,true);
			ent.updateFields({
					effective_date: {hidden: true},
					isactive: {hidden: true}
				}
			);
			var opts={meta:store.meta,ui:{labelwidth:100},defaultCriteria:{facility_id:app.user.facility.id} }
			store.load().then(
				function(rec){  opts.dataRecord=store.records[0];
					$.require("UI.Form",function(form){
						var _formInst=form(opts);
						vw.data("form",_formInst)    ;
						_formInst.appendTo(vw.el.q(".garage-rates .form-body"))
						vw.el.q(".garage-rates .form-ftr button").on("click",function(a){
							_formInst.save();
						})
					})
				}
			);


		});
		function readExcel(XLS,data){
			var rows = []

				var workbook = XLS.read(data, {type: 'binary'});
				if (workbook && workbook.Sheets) {
					var first = Object.keys(workbook.Sheets)[0]
					if (first) {
						var sheet = workbook.Sheets[first],maxcol=0
						var st = 'A'.charCodeAt(0)
						if (sheet) {
							var rowidx = 1
							while (true) {
 								var col = 0, row = []
								while (true ) {
									var C = String.fromCharCode(st + col), cell = sheet[C + String(rowidx)];
									if (cell) {
										row.push({
											value: String(cell.v || "").trim(),
											w: String(cell.w || "").trim(),
											t: String(cell.t || "").trim(),
											row: rowidx,
											col: C
										})

										if(rowidx==1){
											maxcol=Math.max(maxcol,col)
										} else if((col+1)>= maxcol){
											break;
										}
										col++
									} else {
										if(rowidx<2 || (col+1)>= maxcol){
											break;
										}
										col++
									}
								}
								if(!row.length){
									break;
								}
								row.length  && rows.push(row);
								rowidx++;
							}
						}
					}
				}
			 return rows;
		}

		function setupUpload(){
			var label_map={},gridHolder,vw=this,colConfig=[],fields={},iploadip,rate_model_store=null;
			iploadip=this.$("garagespecratesimport_field")

			function _setup() {
				function _formatTime(val){
					val= (+val);
					var dt = val ? $.date.asTime((+($.date().trunc()))+val, "hh:nn tt") : "";
					return dt ? dt.format("hh:nn tt") : "";
				}
				fields = {
					"facility_id": {"label": "Facility id"},
					"name": {"label": "Rate Name"},
					"rate": {"label": "Amount"},
					"rate_type_hourly": {"label": "Rate Type", cellRenderer:function(val){return val==1?"Hourly":"Fixed"}},
					"startmin": {
						"label": "Minimum Arrival  Time", cellRenderer:_formatTime},
					"startmax": {
						"label": "Maximum Arrival Time", cellRenderer: _formatTime},
					"endmin": {
						"label": "Minimum Departure Time", cellRenderer:_formatTime},
					"endmax": {
						"label": "Maximum Departure Time", cellRenderer: _formatTime},
					"durationmin": {"label": "Minimum Hours"},
					"durationmax": {"label": "Maximum Hours"},
					"days": {"label": "Days of the week"},
					"active_from": {"label": "Effective Date"},
					"active_to": {"label": "Expiration Date"},
					"reservation_required": {"label": "Reservation Required"},
					"coupon_code": {"label": "Coupon Code"}
				};

				$.each(fields, function (v, k) {
					colConfig.push(k)
					label_map[v.label.toLowerCase().trim().replace(/\s+/g, "_")] = k
				})


				app.getEntity("rate_model", true).then(
					function (rate_model) {
						rate_model.updateFields(fields)
						rate_model_store = rate_model.createStore()
					});
				vw.el.qq(".garagespecratesimport_save").on("click",function(){
					var records=rate_model_store.records.findAll(function(it){return !it.id}).collect(function(it){return  it.toMap()});
					var link=this
					if(records.length){
						app.remoteDirective("addbulkrates",{data:{records:[].slice.call(records)}},function(a){
							a && a.records && a.records.length &&  app.splashInfo(a.records.length+ " records added")
							link.removeClass("activelink")
 						})
					}

				})
			}
			function makeRecords(rows,store){
				var names={}
				if(rows && rows.length){
					var top=rows.shift();
					top.forEach(function(a){
						var lbl= String(a.value||"").trim().replace(/\s+/g,"_").toLowerCase();
						if(!lbl){return}
						if(!fields[lbl]) {
							if(label_map[lbl]){
								lbl=label_map[lbl]
							} else {
								var field=store.meta.findField(lbl)
								if(field){
									lbl=field.name
								} else{lbl=null}
							}
						}
						if(lbl){
							names[a.col]=lbl
						}
					});
					var days=["sun","mon","tue","wed","thr","fri","sat"];
					if(Object.keys(names).length && rows.length){
						var today= +($.date().trunc())
						rows.forEach(function(r,rid){

							var cells = {added_by:app.user.id,comments:"bulk import on "+ $.date().format("mm/dd/yy")+" by "+app.user.fullname}
							r.forEach(function(cell){
								if(names[cell.col]){
									var name=names[cell.col]
									var val=cell.value;
									if(["startmin","startmax","endmin","endmax"].indexOf(name)>=0){
										if(Number(val) > 0 && Number(val) < 1000){
											if(cell.w){
												val=cell.w
											}
										}
										val= $.date.asTime(val);
										if(val){val= +val

										}
										else{val=0}
										if(val>today){val=val-today}
									} else if(name=="days"){
										if(val){val=val.toLowerCase().trim()
											if(val=="all"){val=""}
											else {
												val=val.split(/[,\s]+/).map(function(a){return a.length>=3? a.substr(0,3):""}).filter(function(a){return a && days.indexOf(a)>=0}).join(",")
											}
										}
									} else if(name=="rate_type_hourly"){
										if(String(val||"").trim().toLowerCase()=="hourly"){val=1}
										else{val=0}
									}
									cells[name]=val

								}
							})	;
							if(!(cells.facility_id>0 && cells.rate>0)){
								app.splashError("Invalid Entries - facilityId and Amount are required fields (Row:"+(rid+1)+ " )")

							} else {
								store.addRecord(cells)

							}
						})

					}
				}
			}
			function refreshGrid(store ){
				if(!gridHolder) {
					var container=vw.el.q(".garage-spec-rates-import")
					container.fillContainer();
					var opt=  { sortable:true,   title:"Bulk Import",zebraColumn:true ,resizable:true,columns:colConfig}
					gridHolder=new  DataGrid(store,opt);
					gridHolder.build(container)
				} else{
					gridHolder.render();
				}
				vw.el.qq(".garagespecratesimport_save").addClass("activelink")
			}


			$.require("$File",function(FILE){
				var el= iploadip.el;
				FILE.setupIp(el, {
					type: 'file', reader: "binarystring",
					complete: function (pr) {
						rate_model_store.clear();
						vw.el.qq(".garagespecratesimport_save").removeClass("activelink")
						if (el) {var res=this.result
							$.requireModule("XLSX", function (XLS) {
								var rows=readExcel(XLS,res);

								makeRecords(rows,rate_model_store)
								refreshGrid(rate_model_store)
							});
						}

					}
				})
			} );
			_setup();
		}
		function makeMultiSel(el,options){
			/*

			 */
			var targetip,wrap=el
			if(el && el.is("input") && !el.is("select")){
				el.wrapEl("div");
				targetip=el
				targetip.hide();
				wrap=el.up()
			}
			else if(el && el.is("select")){
				el.addClass("multi-sel-ip")
				el.wrapEl("div")
				wrap=el.up()
			}
			wrap.addClass("multi-sel-wrap");
			var sel=wrap.q("select")
			options=options||{}
			if(!sel){
				sel=wrap.append(document.createElement("select"))
				var list
				if(options) {
					if (typeof(options) == "string") {
						list = options.split(/\s+/)
						options = {}
					}
					else if (Array.isArray(options)) {
						list=options;
						options = {}
					}
					else if (options.list) {
						list = options.list
					}
				}
				if(list && Array.isArray(list)){
					sel.addOptions(list)
				}

			}
			if(sel.options && ![].slice.call(sel.options).some(function(a){return a.value=="_"|| a.value=="_"})){
				var option = document.createElement("option");
				option.value = "";
				option.text = options.placeholder||"[select an item]";
				sel.el.add(option,0)
			}
			var lookuplist=[];
				[].slice.call(sel.options).forEach(function(a,i){if(a.value && a.value!="_" && a.value!="all"){
					lookuplist.push(a.value)
				}
				})
			function sync(){
				if(!(wrap && wrap.isVisible(true))){return ""}
 				var vals=wrap.select(".item").map(function(a){return a.dataset.key})
				vals.sort(function(a,b){return lookuplist.indexOf(a)-lookuplist.indexOf(b)})
				targetip && targetip.val(vals.join(","));
				return vals.join(",")
			}
			function clearList(){
				if(!(wrap && wrap.isVisible(true))){return this}
				wrap.select("span").remove()
				sync()
				return this
			}
			function updateList(val,label){
				if(!(wrap && wrap.isVisible(true))){return this}
				var container=wrap
				if(Array.isArray(val)){
					val.forEach(updateList)
					return this
				}
				if(val=="_"||val=="-"||!val){return this}
				var nu,toclone=container.q(".item")
				if(toclone){
					nu=toclone.el.cloneNode(true)
				} else{
					nu=document.createElement("span")
					nu.classList.add("item")
					nu.innerHTML="<div  class='content'></div><div class='cancel-link'>&Cross;</div>"
				}
				nu.dataset.key=val
				if(!(label && typeof(label)=="string")){
					label=$.titleize(String(val))
				}
				nu.querySelector(".content").innerHTML=label

				container.q("select").before(nu);

				return this
			}
			wrap.addEventListener("click",function(ev){
				if(!ev.target.classList.contains("cancel-link")){return}
				var par=ev.target.parentNode
				par.parentNode.removeChild(par)
				sync()
			});
			sel.addClass("multi-sel-ip").removeClass("ui-ip").css("width","auto")
			sel.on("change",function(){
				var val=this.val(),label=(this.options[this.selectedIndex]||{}).text||val;
				if(val=="_"||val=="-"||!val){return}

				this.selectedIndex=0;
				if(this.parent().select(".item").some(function(a){return a.dataset.key==val})){
					return
				}
				this.val("_");
				var curr=sync().split(",")
				if(val=="all"){
					val=[].slice.call(this.options).map(function(a){return a.value}).filter(function(a){return a && a!="_" && a!="all" && curr.indexOf(a)==-1})
				}
				updateList(val,label )
				var vals=sync()
				clearList()
				updateList(vals.split(",") )

			});
			if(options && options.vals){
				updateList(options.vals,wrap)
			}
			return {
				update:function(vals){
					clearList();
					updateList(vals)
				},
				clear:clearList,
				sync:sync

			}
		}
		//special rates
		function _makeForm(ent,grid,dataRecord){
			var dt=$.date(),timelist=[""],timelistNextDay=[]
			var today = $.date().trunc(),daylong= (+today);
			var now=$.date(+today) ,date=now.date,count=(24*4)
			for(var i=0;i<count;i++){
				timelist.push({id:String((+now) - daylong) ,label:now.format("hh:nn tt")})
				now.plus("n",15)
			}
			var lastdayentry= $.date(+now).minus("n",1),offset=(+now) - daylong
			timelist.push({id:String((+lastdayentry) - daylong) ,label:lastdayentry.format("hh:nn tt")})
 			for(var i=1;i<count;i++){
				timelistNextDay.push({id:String(offset+((+now) - daylong)) ,label:"Next Day - "+now.format("hh:nn tt")})
				now.plus("n",15)
			}
			var labelwd=70
			var upd={
					active_from:{type:"date",ui:{inline:true},label:"From",format:"mm/dd/yyyy",labelwidth:labelwd,width:80},
					active_to:{type:"date" ,format:"mm/dd/yyyy",label:"To",ui:{inline:true},labelwidth:30,width:80},
					days:{label:"_", wrapstyle:{display:"block"} },
					"rate":{labelwidth:labelwd},
					"name":{labelwidth:labelwd},
					"coupon_code":{labelwidth:labelwd},
					reservation_required:{labelwidth:labelwd,label:"Res Reqd."}
				},
				formtemplate="Z!(div.flr>{{name}})(div.flr>{{rate}})";
				formtemplate += "(div.flr>{{coupon_code}})";
				formtemplate += "(div.flr>{{reservation_required}})";
				formtemplate += "(h4.labl>{Active})(div.flr>{{active_from}}+{{active_to}}+span.cancel[display:inline-block;]>{X})";
	            formtemplate += "(h4.labl>{Days of Week:})(div.flr>{{days}}";



			"startmin startmax endmin endmax durationmin durationmax".split(" ").forEach(function(k) {
				var range= k.substr(k.length-3),nm= k.substr(0,k.length-3),label=range
				upd[k] = { width: nm=="duration"?70:120,labelwidth:range == "max"?50:labelwd ,list:nm=="duration"?null:timelist}
				if(nm=="start") {
					if (range == "min") {
						label = "-"

					}
					else {
						label = "and"
					}
				} else if(nm=="end") {
					if (range == "min") {
						label = "-"
					}
					else {
						label = "and"
					}
				} else{
					upd[k].label=range == "min"?"-":"to"
					upd[k].iptype="number"
				}
				if (range == "max") {
					upd[k].labelstyle={textAlign:"center"}
				}
				if(nm!="duration" && !(nm=="start" && range=="min")){
					upd[k].list=upd[k].list.concat(timelistNextDay)
				}
				upd[k].label=label
			});
			formtemplate += ")(h4.labl>{Enter between})(div.flr>{{startmin}}+{{startmax}}+span.cancel[display:inline-block;]>{X})"
			formtemplate += "(h4.labl>{- Leave between})(div.flr>{{endmin}}+{{endmax}}+span.cancel[display:inline-block]>{X}) "
			formtemplate += "(h4.labl>{OR})"
			formtemplate += "(h4.labl>{- Duration within})(div.flr>{{durationmin}}+{{durationmax}}+span.cancel[display:inline-block]>{X})"


			ent.updateFields(upd );

			var opts={meta:ent,ui:{labelwidth:80},layoutTemplate:formtemplate,defaultCriteria:{facility_id:app.user.facility.id} }
			var form=$.require("UI.Form")
			var vw=new PopupView({animateShow:false,minWidth:400,title:"Special Rate",destroyonhide:true})
			vw.show();
			opts.dataRecord=dataRecord

			var _formInst=form(opts);
			vw.data("form",_formInst)    ;
			vw.observer.on("beforehide",function(el){
				if(el && $d.selfOrUp(el,".popup-view")){
					return false;
				}
			})
			_formInst.appendTo(vw.$content())
			_formInst.config.noadjustwidth=true;
			var fld=vw.$content().q("[data-key='days'] .ui-ip")
			var wrap=fld.up(".field-wrap2")
			if(wrap){wrap.css("display","block")}

			var multisel=makeMultiSel(fld,{
					list:[{key:"_",label:"[select a day]"},{key:"all",label:"[All]"}].concat(["sun","mon","tue","wed","thr","fri","sat"].map(function(a){return {key:a,label: $.titleize(a)}}))}
			);
			vw.addButton({label:"Save",callback:function(){
			    _formInst.model.set("days",multisel.sync());
				"startmin startmax endmin endmax durationmin durationmax".split(/\s+/).forEach(
					function(k){
						_formInst.model.ifnull(k,0)
					}
				)
				_formInst.save().then(function () {
					vw.hide()
					grid.pager.loadPage()
					grid.fire("save", dataRecord)
				})
			}});
			_formInst.formDom.qq("span.cancel").css({marginLeft:"10px",cursor:"pointer",color:"red"}).on("click",function(){
				this.up(".flr").qq(".ui-ip").val("")
			});
			_formInst._view=vw;
			_formInst.model.onchange("days",function(rec){
				if(rec.value){
					multisel.update(rec.value.split(","))
				}
			})
			return _formInst;
		}

		app.getEntity("rate_model",true).then(function(ent){
			var store=prepStore(ent,true);
			ent.updateFields({rate_list:{hidden:true},
				rate_msg:{cellRenderer:function(val){
					return val.replace(/;/g,"<li>&nbsp;&nbsp;")
				}},
				reservation_required:{cellRenderer:function(val){
					return val=="1"?"Yes":"No"
				}},
				rate:{cellRenderer:function(val){
					return val?$.numberFormat(val,"$##.00"):val
				}}
			} );
			prepGrid(store,vw.el.q(".garage-spec-rates"),{ columns:["name" ,"rate","rate_msg","comments"], title: "Special Rates",entityForm:{setUp:function(grid,record){
				return _makeForm(ent,grid,record)

			}}});

		});

		setupUpload.call(this)
	}

 }

var garagepricing=app.defineView( {id:"garagepricing" , template:"garagepricing"  ,model:null,title:"Pricing",controller:controller});

module.exports=garagepricing
