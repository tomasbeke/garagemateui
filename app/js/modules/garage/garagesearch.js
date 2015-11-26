var ReserveModel=$.require("models/ReserveModel")
var DataGrid=$.require("DataGrid");

function controller(el){
	//el.fillContainer()
	var container=el.q(".grid-container")
	container.css({h:$.viewport.height - container.bounds().top});
	if(this.visibleFirst) {
		var holder = {}
		this._grid=holder
		app.getEntity("facility_reserveusers").then(function (ent) {

			holder.store = ent.createStore(true)
			var cfg = {
				scheduled_duration: {label: "duration"},
				member_id:{searchalias:"username"},
				duration_type: {
					list:[{id:"h",label:"Hourly"},{id:"m",label:"Monthly"},{id:"d",label:"Daily"}]
				},
				resstatus: {
					list:[{id:1,label:"Reserved"},{id:2,label:"Checked In"},{id:99,label:"Checked Out"},{id:500,label:"Cancelled"}],
					label:"Status",
					cellRenderer: function (val,k) {
						return "<div style='background-color:" + (val == 'Reserved' ? "yellow" : (val == 'Checked In' ? "green" : (val == 'Checked Out' ? "blue" : "red"))) + "'>"+k+"</div>"
					}, defaultValue: 1
				}
			};
			"reserve_extra_extras notifications checked_out member_id facility_id operator_id operator floor_manager_id reserve_id address name vehicle_type vehicle_id vehicle_description vehicle_model usertype slotlocation slotid firstname lastname middlename computed_start_long rate_model_id computed_end_long extra1 extra2 isprimary vehicle_color vehicle_year".split(/\s+/).forEach(function (a) {
				cfg[a] = {hidden: true}
			});
			ent.updateFields(cfg);
			var opt = {nowrap: true,  headerFilter: {filterColumns:"username date_from duration_type scheduled_duration vehicle_plate barcode reserve_num resstatus vehicle_model vehicle_make slot_name account_num email".split(/\s+/)},sortable:true}
	holder.store.defaultCriteria = "facility_id = " + app.user.facility_id
	holder.grid = new DataGrid(holder.store, opt);
	holder.grid.build(container)
			holder.grid.pager.sortcol = "id"
			holder.grid.pager.sortdir = "d"
			holder.grid.pager.pagesize = 40
			holder.grid.pager.loadPage()

		});
	}
}

var garage_search=app.defineView( {id:"garagesearch" , template:"garagesearch",model:new  ReserveModel(),title:"Search",controller:controller});

module.exports=garage_search