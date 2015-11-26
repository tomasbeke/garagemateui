/**
 * Created by Atul on 5/24/2015.
 */
var app=$.require("app")
var stores=$.require("garage/garagestores")
var utils=$.require("garage/garageutils")
var DataGrid=$.require("DataGrid")
var capacityview=$.require("garage/capacityview")
var PopupView=$.require("PopupView")
function controller(el) {
    if(this.visibleFirst && !this.model){
        this.model=$.model.newInstance()
    }
      el.parent().fillContainer("min");
     el.fillContainer("min");
    var gr=el.q(".capacity-grid")
    //el.parent().fillContainer( );
    // el.fillContainer( );
    gr.fillContainer("min" );
    if(!this.visibleFirst){
        return;
    }
    capacityview.init(gr);
    capacityview.build($.date().trunc());
    function slotalloc(data){
        capacityview.updateSlot(data)
    }

    app.onRemote("slotalloc",slotalloc);
    app.onRemote("reserved",slotalloc);
    app.onRemote(function(){
        // gr.up(".garageschedule").fillContainer( )
        // gr.parent().fillContainer( );
        //  gr.fillContainer( );
        //   gr.q(".row-set-wrap").fillContainer( );
        //   gr.q(".row-set").fillContainer( );
        //    if(capacityview.config.scroll){
        //        capacityview.config.scroll.resetDims()
        //    }
    })
    return

    el.parent().fillContainer( "min");

    el.fillContainer("min" );
         gr.fillContainer("min" );
        var holder=this.data("_grid");
        if(!holder){
            holder= {}
            this.data("_grid",holder)
            app.getEntity("facility_reserveusers").then(function(ent){
                holder.formPanel=new PopupView({height:460,width:500,footer:{height:30},modal:true})
                holder.store=ent.createStore( true)

                ent.updateFields({
                    facility_id: {
                        hidden: true
                    },
                    date_from: {type: "date"},
                    time_from: {type: "time",cellui:{style:{whiteSpace:"nowrap"}}},
                    created_by:{hidden: true},
                    createdon: {hidden: true}
                });
                holder.store.defaultCriteria="facility_id="+app.user.facility.id
                holder.store.provider.includelookups=false;
                var opt={entityForm:{},sortable:true,scrollable:true,  resizable:true,columns:"reserve_num date_from time_from scheduled_duration actual_duration slot firstname lastname, vehicle_type vehicle_plate  vehicle_color".split(/\s+/)}
                holder.grid=new  DataGrid(holder.store,opt);

                holder.grid.build(gr )
                holder.grid.pager.loadPage()
            });
        } else if(holder.grid){
            holder.grid.resize();
        }
}

var garage_capacity=app.defineView({ id:"garageschedule", template:"garagespacemngmnt",title:"Capacity Management",controller:controller});

module.exports=garage_capacity