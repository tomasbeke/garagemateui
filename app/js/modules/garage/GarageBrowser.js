var ReserveModel=$.require("models/ReserveModel")
var DataGrid=$.require("DataGrid");
 var stores=$.require("garage/garagestores")
var utils=$.require("garage/garageutils")

function controller(el){
	//el.fillContainer()
	var container=el.q(".grid-container")
	container.css({h:$.viewport.height - container.bounds().top});
	if(this.visibleFirst) {
		var holder = {}
		this._grid=holder
		app.getEntity("facilitywithrates").then(function (ent) {

			holder.store = ent.createStore(true)
			var cfg = {  };
			"id operator_id gstatus_id ASSET_THUMBS refid is_open zip rate_model_id facility_ratesid floor_manager_id owner_id fund_id spec_rates hrs_id space_type_id effective_date".split(/\s+/).forEach(function (a) {
				cfg[a.toLowerCase()] = {hidden: true}
			});
			cfg.operator_id||(cfg.operator_id={});
			cfg.operator_id.searchalias="operator"
 			ent.updateFields(cfg);
			 var opt = {nowrap: true,  headerFilter: {filterColumns:"name operator_id address region_id spaces_total facility_format_id".split(/\s+/)},sortable:true}
			 holder.store.defaultCriteria = "location_id = 1"

			holder.grid = new DataGrid(holder.store, opt);
			holder.grid.build(container)
			holder.grid.pager.sortcol = "id"
			holder.grid.pager.sortdir = "d"
			holder.grid.pager.pagesize = 40
			holder.grid.pager.loadPage()
			holder.grid.domcomponents.toolbar.append("<button class='ui-button-sm'>Export</button>").on("click",function(){
				var store=ent.createStore(true)
				store.pager.cachekey=holder.grid.pager.cachekey
				store.defaultCriteria=holder.store.defaultCriteria
				store.pager.sortcol = holder.grid.pager.sortcol
				store.pager.sortdir = holder.grid.pager.sortdir
				store.pager.filter = holder.grid.pager.filter
 				store.pager.pagesize=-1

				var ele=holder.grid.domcomponents.tab,cols=[],i=0
				 ele.qq(".grid-col").each(function(a,i){
					 cols.push({name:a.domdata("name"),idx: i})});
 				ele.qq(".grid-header tr th" )
					.each(function (it,i) {
						cols[i]||(cols[i]={});
						cols[i].wd= it.offsetWidth
						cols[i].label= it.val();
						cols[i].stl= (it.css("textAlign") == "right" ? "numstyle" : "genstyle")
						i++
					})
 				store.pager.loadPage().then(
					function(data){
 						var rows=data.map(function(rec){
 							return  cols.map(function(it){return rec[it.name]})
						})
						Util.exportToExcel({rows:[].slice.call(rows),cols:cols,filename:"facilities.xls"})
					}
				)
				//Util.exportToExcel({el:holder.grid.domcomponents.tab,})

			})


			});
	}
}

var GarageBrowser=app.defineView( {id:"garagebrowser" ,model:new  ReserveModel(),title:"Search",controller:controller});

module.exports=GarageBrowser