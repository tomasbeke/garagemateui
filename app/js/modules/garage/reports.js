var app=$.require("app")
var stores=$.require("garage/garagestores")
var utils=$.require("garage/garageutils")
var PopupView=$.require("PopupView")

var DataGrid= $.require("DataGrid")
var formtemplate="Z!div.flr.profileheader>{{id}}+{{asset_thumbs}}+(div.flr.profilelabel>{{name}})+{{lat}}+{{lng}}+{{operator_id}}+{{phone}}+{{region_id}}+{{hrs_id}}+{{pmt_type_id}}+{{spaces_total}}+{{facilityformat_id}}\
 div.flr>{{address}}+{{space_type_id}}\
 div.flr>{{fund_id}}+{{owner_id}}+{{floor_manager_id}}"

function controller(el){
	if(this.visibleFirst && !this.model){this.model=$.model.newInstance()}
	var vw=this ,_formInst=this.data("form")   ;
	if(_formInst){return}
	if(this.visibleFirst){

		this.data("form","pending")
		app.getEntity("facility").then(function(ent){
			var store=ent.createStore(true);
			store.meta.updateFields({
				asset_thumbs:{iptype:"img",type:"img",label:"_",width:100,height:100, wrapklass:"profileimage",reader:function(a){return "http://s3-w2.parkme.com/lot_img/"+a}},
				is_open:{hidden:true},
				lat:{"type":"decimal",width:90,labelwidth:90, label:"Lat Lng",wrapstyle:{marginLeft:0,textAlign:"right"}},
				lng:{ "type":"decimal",labelwidth:5,width:90,label:"/",wrapstyle:{marginLeft:0,textAlign:"left"}},
				name:{ "label":"_"}
			});
			store.defaultCriteria="id="+app.user.facility.id;
			store.load().then(
				function( ){
					$.require("UI.Form",function(form){
						var rec=store.getList().first();
						_formInst=form(store.meta,null, formtemplate,rec);
						_formInst.config.adjustwidths=false
						vw.data("form",_formInst)    ;
						_formInst.appendTo(vw.el.q(".contact-form"))
					});
				})
		})
		//vw.el.q(".garage-info").fillContainer("min");
		var  defaultCriteria={facility_id:app.user.facility.id}
		function prepGrid(store,dom,optns){
			var holder= {dom:dom}
			holder.formPanel=new PopupView({height:380,width:500,footer:{height:30},modal:true})
			holder.store=store
			var opt= $.extend({entityForm:{defaultCriteria:{facility_id:app.user.facility.id}},sortable:true,   title:"Staff",
				editoptions:{},zebraColumn:true ,resizable:true},optns||{})
			holder.grid=new  DataGrid(holder.store,opt);
			holder.grid.build(holder.dom)
			holder.grid.pager.pagesize=-1
			holder.grid.pager.loadPage()

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
		app.getEntity("garage_slots").then(function(ent) {
			prepGrid(prepStore(ent),vw.el.q(".garage-slots"),{  title: "Slots", editoptions: {del: false, add: false} })
		});
		app.getEntity("monthly_user").then(function(ent) {
			prepGrid(prepStore(ent),vw.el.q(".garage-monthly"),{  title: "Monthly Users", editoptions: {add: false},columns:["username","vehicle_id","amount"] })
		});

		app.getEntity("facility_staff",true).then(function(ent){
			prepGrid(prepStore(ent),vw.el.q(".garage-staff"),{  title: "Staff"  })
		})

		app.getEntity("slot_group",true).then(function(ent){
			var store=ent.createStore(true),Color=$.require("ColorPicker").Color;
			ent.updateFields({
					color: {
						cellRenderer:function(val){
							var c=Color.from(val),hx
							if(c){
								hx= c.name && isNaN(c.name)? c.name:c.toHex(true)
							}
							return hx?"<div class='color-value' style='background:"+hx+";'>.</div>":val
						}
					}
				}
			);
			prepGrid(prepStore(ent),vw.el.q(".slot-groups"),{  title: "Slot Groups"  })
		})
		app.getEntity("facility_extras",true).then(function(ent){
			ent.updateFields({ active: { type:"boolean" }}  );
			prepGrid(prepStore(ent),vw.el.q(".garage-extras"),{  title: "Extras"  })
		})
	}

 }

var garage_reports=app.defineView( {id:"garagereports" , template:"garagesettings"  ,model:null,title:"Settings",controller:controller});

module.exports=garage_reports