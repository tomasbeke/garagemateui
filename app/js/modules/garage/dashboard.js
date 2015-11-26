var app=$.require("app")
var stores=$.require("garage/garagestores")
var utils=$.require("garage/garageutils")
var GraphWidget=$.require("GraphWidget")
var DataGrid=$.require("DataGrid");
var SlotView= $.require("garage/SlotView")
var ReserveCardView=$.require("common/ReserveCardView")
var slotGroupStore,operatorStore,vehicleStore,_pending=0
var PopupView=$.require("PopupView")

function refreshSlotStore(override){
    var date=$.date().toNearestQuarterMinutes(true)
    var isvis=this.el.isVisible(true)
    /*if(isvis){
        app.remoteDirective("slotstatus",{facility_id: facility_id,date_from:+date,date_to:(+date)+(1000*60*60 ),onlyreserved:true},
            function(data){
             });
     }*/


    var store=this.slotView.slotstore||(this.slotView.slotstore=this._parent.getSlotStore());
    store.records.setKeyProvider(function(rec){return rec.get("slotid")})
    store.getOriginalList().setKeyProvider(function(rec){return rec.get("slotid")})
      this.slotView.loadData(date).then(
        function(store){
            if(this.el.isVisible(true) && this.slotView){
                var cntnr=this.el.q(".db-check-in .db-content");
                this.slotView.setup(store,cntnr)
                this.slotView.show();
                this.slotView.el && this.slotView.el.css("height",cntnr.height()-10);
            } else{
                _pending=1;
            }

            var total=store.records.length;
            var occ1=store.records.findAll(function(a){return a.slotstatus>0})

            var occ= occ1.length;
               app.updateFacilityStats({occupied:occ,available:total-occ})
        }.bind(this)
    )
}
function setupClockWeather(){
    var panel=this.panel= app.viewRoot.garagehome;

    panel.el.q(".db-wrap").fillContainer("min").css("h", function (el, rec) {
        return this.height()
    });

    function getInRange(min, max) {
        return Math.ceil(Math.random() * (max - min) + min);
    }

    var nuel

    function _go() {

        var dom = document.querySelector(".db-trend .db-content");
        var vals1 = [], vals2 = [], vals3 = [], vals4 = [], total = 50
        var i = 0;
        while (++i < total) {
            vals1.push(getInRange(50, 10));
        }
        i = 0;
        while (++i < total) {
            vals2.push(getInRange(50, 10));
        }
        i = 0;
        while (++i < total) {
            vals3.push(getInRange(50, 10));
        }
        i = 0;
        while (++i < total) {
            vals4.push(getInRange(50, 10));
        }
        if (!nuel) {
            nuel = GraphWidget.create()
            // nuel.addSeries("year",{smooth:true,data:vals1,attr: {fill: "rgba(0,0,255,.3)", stroke: "blue","data-key":"year"}})
            //nuel.addSeries("month",{smooth:true,data:vals2,attr: {fill: "rgba(0,255,0,.3)", stroke: "green","data-key":"month"}})
            //nuel.addSeries("week",{smooth:true,data:vals3,attr: {fill: "rgba(255,0,0,.3)", stroke: "red","data-key":"week"}})
            nuel.addSeries("today", {
                smooth: true,
                data: vals4,
                attr: {
                    fill: "rgba(215,255,0,.3)",
                    "stroke-width": ".4px",
                    stroke: "rgba(215,255,0)",
                    "data-key": "today"
                }
            })
            nuel.addLine("_", [0, 40], [240, 40], {stroke: "green", fill: "rgba(0,0,0)"})

            nuel.appendTo(dom)
            var vw = nuel.config.viewBox, bottom = vw[3], span = vw[2] / 4, cnt = 4, i = 0, labaltop = 35;
            nuel.addText({
                "9 am": {x: 0 - 10},
                "12 pm": {x: span * 1 - 10},
                "3 pm": {x: span * 2 - 10},
                "6 pm": {x: span * 3 - 10},
                "9 pm": {x: span * 4 - 10}
            }, {y: bottom - 20, stroke: "none", fill: "black"})

        } else {
            nuel.render(vals)
        }
        nuel.cleanUp()
         $d(dom).append("<div style='position:absolute;top:10px;left:10px'>Quick Overview</div>")
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _go()
    var count = Number(app.user.facility.spacestotal) || 20
    var slots = panel.el.q(".db-check-in .db-content").css({overflowY: "auto", padding: "3px"})

    function addFlags(cnt) {
        for (var i = 0; i < 5; i++) {
            var v = getRandomInt(1, cnt)
            var rl=slots.q("[data-index='"+v+"']")
            if(rl){rl.addClass("notav").attr("title","Not available")}
        }
        for (var i = 0; i < 15; i++) {
            var v = getRandomInt(1, cnt)
            var rl=slots.q("[data-index='"+v+"']")
            if(rl){rl.addClass("occupied").attr("title","Occupied")}
        }
        var v=Math.max(25,cnt/2)
        for (var i = 0; i < v; i++) {
            var v = getRandomInt(1, cnt)
            var rl=slots.q("[data-index='"+v+"']")
            if(rl){rl.addClass("reserved").attr("title","Reserved")}
        }
    }
}
function setupGrid(){
    var panel=this.panel= app.viewRoot.garagehome;
    var grid=panel.el.q(".db-space-mng .db-content")
    //this.slotView.appendTo(this.el.q(".db-check-in .db-content"))
    //    this.slotView.show();
     app.getEntity("appnotification_det").then(function(ent){
        var holder= {}
        holder.formPanel=new PopupView({height:460,width:500,footer:{height:30},modal:true})
        holder.store=ent.createStore( )
        ent.updateFields({
            facility_id: {hidden:true},
            reserve_id: {hidden:true},
            type_id: {hidden:true},
            response_msg: {hidden:true},
            assigned_on: {hidden:true},
            facility_staff_name: {label:"Assigned To"},
            assigned_by: {hidden:true},
            assigned_to: {hidden:true},
            assigned_to_name: {hidden:true},
            msg: {label:"Message"},
            reservetime: {hidden:true},
            facility_name: {hidden:true},
            user_name: {hidden:true},
            resstatus: {hidden:true},
            user_id: {hidden:true},duration_type: {hidden:true},duration: {hidden:true},vehicle_id: {hidden:true},
            forfacilitystaff: {hidden:true},
            type_key : {hidden:true},
            status_id: {cellRenderer:function(val){
                return "<div style='background-color:"+(val==2?"green":"red") +"'>&nbsp;</div>"
            },defaultValue:1}
        });
        /*ent.updateFields({
            date_from: {type: "date"},
            time_from: {type: "time",cellui:{style:{whiteSpace:"nowrap"}}}
        });
*/
        holder.store.defaultCriteria="forfacilitystaff = 1 and status_id < 2 and facility_id="+app.user.facility_id
        var opt={entityForm:{},sortable:true,scrollable:true,  title:"Notifications",
            editoptions:{del:false,add:false},zebraColumn:true  ,resizable:true,columns1:"member_id date_from  scheduled_duration slot vehicle_id photos notes".split(/\s+/)}
        holder.grid=new  DataGrid(holder.store,opt);
        holder.grid.build(grid )
        holder.grid.pager.sortcol="added_on"
        holder.grid.pager.sortdir="d"
        holder.grid.pager.pagesize=10
        holder.grid.pager.loadPage().then(
            function(p){
              }
        );
         var refresh= $.throttle(function(){
             holder.grid.pager.loadPage({includelookups:false}).then(
                 function(){
                     $d.html(".slots .notifications .quantity",String(holder.grid.pager.totalrows||"&nbsp;"))
                 }
             );
         },{tailEnd:true,delay:2000})
         app.observer.on("notificationupdate",refresh)
    });
}
var refreshSlotStoreThrottled
function showSlotSelector(dialogvw,slotvw,slotstore,record,slotmodel ){
    var cardView=this;
    var  reservenum = record.reserve_num,
        reserveid = record.reserve_id
    var slotView=SlotView.slotSelector(
        {   container:dialogvw.$content(),
            time_from:slotvw.reservedate,
            time_to:slotvw.reservedatetimeEnd,
            facility_id:slotvw.facility_id,
            slotstore:slotstore,
            current: record.slotid
        },
        function(slotmodel3){
            var record3=slotmodel3.get("record")||{}
            app.remoteDirective("assignslot", {
                slotid: record3.slotid,
                reserve_num: reservenum,
                reserve_id: reserveid
            },function(ev){
                dialogvw.hide()
                this.current= record3.slotid
                slotvw.refreshView();
                cardView.reserveSlot.slotid= record3.slotid
                if(slotmodel.record){
                    slotmodel.record.slotid=record3.slotid;

                }

                cardView.reserveSlot.slotname= record3.slotname
                cardView.hideOnBlur(true)
            })

        }
    );

    dialogvw.el.toFront(true)
    dialogvw.el.css("z-index",Number(cardView.getEl().css("z-index")||10)+1);
    return slotView
}
function controller(el) {
        var $this=this ,ismobile=$.browser.isTouchDevice
        if(!app.user.facility_id&&app.user.facility&&app.user.facility.id){
            app.user.facility_id=app.user.facility.id
        }
    if(!this.slotView){
        this.slotView=new SlotView();
        this.slotView.facility_id=app.user.facility.id
        this.slotView.reservedate= $.date().toNearestQuarterMinutes(true);
        this.slotView.reservedatetimeEnd=$.date().plus("h",1);
        var vw=this,dialogvw,slotstore;
        this.slotView.on("slotpointerselection",function(slotmodel){
            var record=slotmodel.get("record")||{}
            if(!record.reserve_num){
                return
            }
             var slotvw=this,reservenum = record.reserve_num,
                reserveid = record.reserve_id
            slotstore=slotstore||vw._parent.getSlotStore();
            app.remoteDirective("reserveinfo",{reserve_id:reserveid},function(record){
                 ReserveCardView.show(
                    {anchor:slotmodel.el,record:record,id:"capacityvw",
                        showBarCode:false,
                        actions:{
                        "Change Slot":function () {
                            var first,slotView=null;
                            if(!dialogvw){
                                dialogvw = new   PopupView({resizable:true,draggable:true,minHeight:400 })
                                dialogvw.on("aftershow resize",function(){
                                    slotView && slotView.el.css({height:this.el.innerHeight()-20})
                                });

                            }
                            if(this.containerVw){
                                this.containerVw.on("beforehide",function(){
                                    if(dialogvw && dialogvw.isVisible()){return false}
                                })
                            }
                            dialogvw.show()
                            this.hideOnBlur(false)
                            slotView=showSlotSelector.call(this,dialogvw,slotvw,slotstore,record,slotmodel )

                        }
                    }}
                )
            })

        })
        this.slotView.on("refresh",function() {
            this.loadData($.date().toNearestQuarterMinutes(true)).then(
                function(store){
                    this.renderSlots()
                }.bind(this)
            );
        });
        this.cloak=$d.util.cloak(null,{opacity:.4});
        this.cloak.setMessage("<div class='fxtx map-loading-wrap'><div class='map-loading'><div class='bubblingG'><span class='bubble-closest' id='bubblingG_1'></span><span class='bubble-cheapest' id='bubblingG_2'></span><span class='bubble-best' id='bubblingG_3'></span></div></div></div>")
        this.slotView.observer.once("slotsrendered",function(){
            this.cloak.hide()

        }.bind(this))
    }
    if(!refreshSlotStoreThrottled) {
        refreshSlotStoreThrottled = $.throttle(refreshSlotStore.bind(this), {topEnd: true, delay: 500})
    }
    if(!this.visibleFirst){

        refreshSlotStoreThrottled();

        return
    }


     setupClockWeather.call(this)
    setupGrid.call(this)
    app.on("reservestatusupdate" ,function(ev){
        refreshSlotStoreThrottled ( )
    })


    app.remoteDirective("dbmodified",{pars:{entity:"slot_group",criteriacol:"facility_id",criteriaval:app.user.facility.id}});
    app.onRemote("dbmodified.slot_group", $.throttle(function(){
        if(this.slotView && this.slotView.el && this.slotView.el.isVisible()) {
            this.slotView.refreshGroupList(true)
        }
    }.bind(this),{tailEnd:true}))
        app.getEntity("operator").then(function(ent){
            var st=ent.createStore();
            st.pager.pagesize=-1
            st.load().then(function(){
                operatorStore=st;
            })
        });
        app.getEntity("vehicle").then(function(ent){
            var st=ent.createStore(); st.pager.pagesize=-1
            st.load().then(function(){
                vehicleStore=st;
            })
        });

    refreshSlotStoreThrottled(true )



}

    var rootmodel= $.model.newInstance("garage");
    if(app.user && app.user.facility){
        rootmodel.addProperties(app.user.facility)
    }



app.updateFacilityStats=function(rec){
    rec.occupied=rec.occupied||0
    app.viewRoot.model.readDataRecord(rec);
 }
var garage_db=app.defineView({id:"garagehome",layout:"fill",template:"garagedashboard", title:"Home" ,model:rootmodel,controller:controller});

module.exports=garage_db