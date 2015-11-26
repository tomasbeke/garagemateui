var app=$.require("app")
 var utils=$.require("garage/garageutils")
var  apputils=$.require("common/AppUtil")
var service=$.require("garage/garageservice")
var SlotView= $.require("garage/SlotView")
var VehicleWidget= $.require("common/VehicleWidget")
var ReserveModel=$.require("models/ReserveModel")
var ReserveCheckInCheckOut=$.require("common/ReserveCheckInCheckOut")
var SimpleView=$.require("SimpleView")
var PopupView=$.require("PopupView")
var resstore = null,userrowTemplate, rowTemplate = null
var DataGrid=$.require("DataGrid");

function dowalkinNonmember(ev){
    var plate=this.el.q(".non-member-checkin .plate_num").val(),state=this.el.q(".non-member-checkin .plate_num_state").val()
    if(!plate || /\s/.test(plate)) {
        app.splashError("Invalid Plate number<br/>Spaces and special characters are not allowed.<br/>Please enter a valild number")
        return
    }
     ReserveCheckInCheckOut.walkinNonmember(state+"-"+plate.toUpperCase(),app.user.facility_id,function(data){
           showInfo.call(this,data,true);
    }.bind(this))

}


function docheckin(ev) {
     if(ev && $d.selfOrUp(ev.target,".hasnocontent")){return}
    var v=this.vehicleWidget.getDataRecord();
     if(typeof(v.id)!="number"){v.id=0}
     if(!this.model.reservenum) {
        if(this.model.isNonMember){
            this.model.userVehicle.update(v)
            this.model.user.firstname = this.el.q(".user-firstname").val()||""
            this.model.user.lastname  = this.el.q(".user-lastname").val()||""
            this.model.user.email     = this.el.q(".user-email").val()||""
            this.model.user.phonenumber=this.el.q(".user-phonenumber").val()||""
        }
        //dowalkin.call(this);
     }

    var nudate=new Date()
    this.model.schedule.setEntryTime(nudate)
    this.model.pricing && this.model.pricing.recalcAll()
     var reserveCheckInCheckOut = new ReserveCheckInCheckOut(this.model,"checkin");
    if(this.model.isNonMember){
        reserveCheckInCheckOut.baseModel.isNonMember=true
        reserveCheckInCheckOut.baseModel.user.id=reserveCheckInCheckOut.baseModel.user.nonmember_id=this.model.user.id||this.model.user.nonmember_id
    }
     reserveCheckInCheckOut.checkin(
        function(res){
            resstore.clear();
            resstore.load()
            // app.showClaimCheck({reservenum:this.model.reservenum})
            $.require("common/ReserveCardView").show({template:"claimcheck",
                   showOptions:true,
                record:this.model
            });
           // utils.showclaimCheck(this.model)
            clear.call(this)

            //if(res===false){ pr.reject();return }
            //showInfo.call(ths,res===true?this.baseModel:res);
            //pr.resolve()
        }.bind(this),true);
    /*ReserveCheckInCheckOut.checkin(this.model ,
        function(){
            resstore.clear();
            resstore.load()
                showclaimCheck.call(this)
                clear.call(this)
         }.bind(this))*/


}
function clear(excludeip,excludemodel){
    this.el.addClass("hasnocontent")
    if(this.cloak){this.cloak.show()}
    this.el.qq(".check-in-info input,.check-in-info select").prop("disabled","disabled")
    if(excludemodel!==true){
        this.model.clearValues(["stateOptions"]);
        this.vehicleWidget.model.clearValues();
    }
    if(excludeip!==true){
        this.el.qq(".plate_num").val("")
    }
    this.el.q(".check-in-info").css("overflow","hidden").anim("height",1,"fast")
    this._cleared=true;
}
function forBarCode(code,pr){
    if(!code){return}
    onselectRecord.call(this,{barcode:code})

}
function showInfo(rec,excludeip){
   if(!this._cleared) {clear.call(this,excludeip)}
    this._cleared=false;
    if(!rec.facility_id){rec.facility_id=app.user.facility_id}
    this.data("_last","");
    this.model.readRecord(rec)

    var nudate=new Date()
    this.model.schedule.setEntryTime(nudate)

    if(rec.iswalkin){
         this.model.schedule.duration=2;
    }
     if(rec.user && rec.user.id){
        this.model.user.id=rec.user.id;
    }

    this.model.schedule.setupDates();
    this.model.schedule.reserveDateTime._wraptag=true

    if(!this.model.reservenum){
        this.model.reservenumlabel="Walk-in"

        if(!this.model.reserveSlot.id){
             app.remoteDirective("findslot",{facility_id:this.model.facility_id||this.model.facility.id,date_from:+this.model.schedule.reserveDateTime,date_to:+this.model.schedule.reserveDateTimeEnd},
                function(data){
                    data=data.data||data;
                     this.model.reserveSlot.readRecord(data)
                 }.bind(this))
        }

    }

    this.el.removeClass("hasnocontent")
    if(this.cloak){this.cloak.hide();}
    this.el.q(".check-in-info").anim("height",this.el.q(".check-in-info").scrollHeight,"fast")
    this.el.qq(".check-in-info input,.check-in-info select").prop("disabled",null)
   // this.el.q(".check-in-user-info").scrolltoView(true,true)
    //this.model.schedule.time_from=new Date()
   var dur=this.model.schedule.reserveDuration
    this.digest();
    var est=this.el.q(".est_duration")
    est && (est.value=dur);
    this.model.schedule.reserveDuration=dur
     this.vehicleWidget.model.readRecord(this.model.userVehicle.toMap())
    this.vehicleWidget.digest()

    //this.el.qq(".nonmember-info input").attr("readonly",this.model.isNonMember?null:"readonly");
 }
function onselectRecord(r) {
    //r.facility_id=app.user.facility_id
    var crit=["resstatus < 99"]
    $.each(r,function(v,k){crit.push(k+"= "+(k=="barcode"?("'"+v+"'"):v))});
    this._grid.grid.pager.filter= crit.join(" and "); ;
    this._grid.grid.pager.loadPage().then(
        function(a){
            console.log(a)
        }
    )
     /*app.remoteDirective("reservehistory", r ).then(
         function(d){
             console.log(d)
         }
     )*/
}
function onselect(r) {
    var ths=this,resid = r.id,        usersrch=ths.el.q(".user-search")  && ths.el.q(".user-search").val()===true
    if(usersrch){
        if(r && r.id){
            ths.ip.val(r.fuillname)
        }
        app.remoteDirective("userdetails",{targetid:resid}).then(
            function(u){
                var activeel=$d.util.getActiveElement()
                var anchor=$d.selfOrUp(activeel,".list-item")
                if(!anchor){return}
                if(u.vehicles && u.vehicles.length>=1){
                    var vehicleListView = new PopupView({
                        minWidth:350,
                        maxHeight:function(bnds){
                            if(this.config && this.config.options&& this.config.options.anchor){
                                $.viewport.height - $d(this.config.options.anchor).bounds().top;
                                this.$content().css("overflowY","auto")
                                return $.viewport.height - ($d(this.config.options.anchor).bounds().bottom+40)
                            }
                            return 0
                        },
                        alignAnchor:"below",
                        anchor:anchor.el, title:'select a Vehicle' ,
                        content:"<ul class='vehicle-sel-list'>"+
                        u.vehicles.map(function(a){
                            return "<li class='list-row' style='white-space:nowrap;' data-key='"+(a.barcode)+"'>"+a.vehicle_plate +" "+a.vehicle_make +" "+a.vehicle_model +" "+a.vehicle_year +"</li>"
                        }).join("")+"</ul>"
                    });

                    vehicleListView.el.css({background:"white"})
                    vehicleListView.el.on("click",function(ev,el){
                        var code=el.domdata("key")
                        var vehicle=u.vehicles.find(function(a){return a.barcode==code}),user=Object.assign({},u);
                        delete user.vehicles;
                        vehicleListView.hide()
                        var monthly,facility_id=app.user.facility_id,vid=vehicle.id
                        onselectRecord.call(ths,{barcode:vehicle.barcode})

                    },".list-row")
                    vehicleListView.show()
                    if(vehicleListView.el.height()+vehicleListView.el.offsetTop > $.viewport.height){

                    }

                } else {
                    app.splashError("A vehicle is required for checkin")
                }
            }
        )
        return false
    }
    var rec = resstore.findById(resid)
    if(rec){
        onselectRecord.call(ths,{reserve_id:rec.id})

    }


}
function _searchCallback( ev) {

    var ths=this,reservemodel = this.model ,el=this.el,val=this.ip.val()
        if (!(resstore && val && (typeof(val)=="string"))) {
            return Promise.reject()
        }
    var pr=Promise.deferred(),usersrch=ths.el.q(".user-search")  && ths.el.q(".user-search").val()===true

        var barcodesrch
        if((barcodesrch=ths.el.q(".barcode-search")) && barcodesrch.val()===true){
            if(!val){
                return Promise.reject()
            }
            var code=String(val).trim(),facility_id=app.user.facility_id
            if(code && ev && ev.type && (String(ev.type)== "paste" || (String(ev.type).indexOf("key")==0 && ev.keyCode== 13))){
                forBarCode.call(ths,code,pr)

                /*} else if(userid && vehicleid){
                 showInfo.call(ths,{user_id:userid,vehicle_id:vehicleid,facility_id:facility_id})

                 pr.resolve()
                 }*/
            }
            return pr
        }
        if(usersrch){
            if(!userrowTemplate ){
                userrowTemplate=$d.template("<div class='lookup-record'><span  class='rec-firstname'>$firstname</span> <span  class='rec-lastname'>$lastname</span>, <span  class='rec-lastname'>$email</span></div>")
            }
            app.remoteDirective("findusers",{srch:val}).then(
                function(a){
                     a=a||[]

                    var rows=[].concat(a).map(function(r){
                        return {id: r.id,label:userrowTemplate(r)}
                    })

                    pr.resolve(rows)
                },
                function() {
                    ths._searchPending = false;
                }
            );
            return pr
        }
         resstore.clear()
        resstore.load().then(
            function(){
                ths._searchPending=false;
                var val=ths.ip.val()
                if(!val){return pr.resolve([])}
                var recs=val=="*"?resstore.getList():reservemodel.findReservationsByText(val,resstore)
                     pr.resolve(recs.map(
                        function (r) {//r.duration_type=r.duration_type||"h"
                            r.duration_type = r.duration_type || "h"
                            var label = r.applyTemplate(rowTemplate)

                            return {
                                id: r.id, label: label
                            }
                        }
                    ))
            },
            function() {
                ths._searchPending = false;
            }

        )
        return pr;
    }
function triggerSearch(ev,clear){

    var ip=$d(this.ip);
    if(!ip){return}

    var list=this.data("_list"),val=ip.val()
    if(clear===true || !val){
        this.clearSearch()
        return
    }
    var vw=this;

    if(!list){
        list=$.require("PopupView").lookupList([{id:0,label:"searching .."}],{
            defaultText:"searching..",ignoreanchorstyle:true,
            destroyonhide:false,
            callback:function(rec){
                onselect.call(vw,rec);
                this.hide();
            }
        }).show()
        list.observer.on("beforehide",function(el){
            if(ip.contains(el)){return false}
        })
	    vw.data("_list",list);
    }
    if(vw.data("_last")==val){
        list.el.isVisible(true) || list.show()
        return
    }
	vw.data("_last","");
    if(this._searchPending){return}

    this.searchCallback( ev).then(
        function(rows){
	        vw._searchPending=false;
	        vw.data("_last",val)
            if(!(rows && rows.length)){
                vw.clearSearch(true)
                return;
             }
            list.config.options.anchor=vw.ip;
            list.reset(rows)
        },
        function(err){err=err||{}
            list.reset([{id:0,label:typeof(err)=="string"?err:(err.error||"..error...")}])
        }
    )

}

function setupCombo(){
    var ths=this;
    var reservemodel = this.model;
    this.searchCallback=_searchCallback.bind(this)
    var dosearch=$.throttle(triggerSearch.bind(this),{tailend:true})
    var ip = this.el.q(".check-in-find");
    var _clearSearch=  function(noreset){
        var ip=this.ip;
        if(!ip){return}
        this.data("_last","")
        var l=this.data("_list")
        if(noreset!==true){
            ip.val("");
        }
        this._searchPending=false;
        if(l){l.hide()}

    }.bind(this) ;
    this.clearSearch=_clearSearch;
	ip.on("input focus mousedown",function(ev){
		if(!this.hassearchTrigger){dosearch(ev)}
	}.bind(this));
	ip.on("seachcancel esc",_clearSearch);
    this.ip=ip;
    var dom = this.el,activeel=null,vw=this;
	this.model.getController().mixin({
		toggleusersearch:function(ev) {
			if ($d.val(ev.target)) {
				vw.hassearchTrigger = true
                dom.q(".check-in-find-user-link").show().on("click.searchtrigger", dosearch)
				//ip.setTrigger(but)

			} else {
				//ip.setTrigger(null)
				vw.hassearchTrigger = null
				dom.q(".check-in-find-user-link").hide().off("click", "searchtrigger")
			}
			vw.clearSearch()
		}.bind(this)
	})



    app.getEntity("facility_reserveusers").then(function (ent) {
        resstore= ent.createStore()
        resstore.pager.sortcol = "id"
        resstore.pager.sortdir = "d"
        resstore.provider.includelookups = false;
        resstore.pager.pagesize = -1
        resstore.dataRecordPrototype.addExpr("reservetime",function(a){return $.date.format(a.computed_start_long,"mm/dd/yy hh:nn tt")})
        var targetdate= $.date.minus("d",1)
        resstore.defaultCriteria = "facility_id=" + app.user.facility.id + " and resstatus < 99"// or   (resstatus >= 99 and  computed_start_long >  "+(+targetdate)+")"
        rowTemplate = resstore.dataRecordPrototype.prepTemplate(utils.reserveRecordTemplate, function (s, name, rec) {
            if (!s || !s.trim()) {//if(name=="vehicle_color"){alert(s)}
                return name == "vehicle_color" ? "auto" : "<span title='value for " + $.titleize(name) + " not available' class='no-content'>?</span>"
            }
            return s
        })
        resstore.on("dataloadcompleted", function() {
            //thsvw.model.checkedincount=resstore.size()
        })
        resstore.load()
    })
}
function setupSlotSelection() {
    var slotstore, dialogvw = null,ths=this,slotView
    function onslotsel(slotmodel ){
        var record=slotmodel.get("record")||{}
        //if(record.reserve_num){return}

        var nuslotid=record.slotid,vw=this;
        if(!ths.model.reservenum){
            ths.model.reserveSlot.id=nuslotid;
            ths.model.reserveSlot.slotname=record.slotname||record.name;
            dialogvw.hide();
            return
        }
        app.remoteDirective("assignslot",{
            reserve_num:ths.model.reservenum,slotid:nuslotid
        }).then(
            function(nu){
                var curr=ths.model.reserveSlot.id;
                var rec = slotstore.records.find(function(r){return r.slotid == curr});
                if(rec){
                    rec.slot_status=0;
                    vw.redraw(rec)
                }
                ths.model.reserveSlot.id=nuslotid;
                ths.model.reserveSlot.slotname=nu.slotname;
                record.read(nu);
                slotView.selectSlot(nuslotid)
                dialogvw.hide();
            }
        );
    }
	this.model.getController().mixin({
		checkinslot:function(ev) {
			var ip = $d(ev.target), model = ths.model;
			if (!dialogvw) {
				dialogvw = new PopupView({animateHide: true, resizable: true, draggable: true})
			}
			if (!slotstore) {
				slotstore = ths._parent.getSlotStore()
			}
			//if(model.reserveSlot.id){
			dialogvw.show()
			slotView = SlotView.slotSelector(
				{
					id: "checkinselector",
					container: dialogvw.$content(),
					time_from: model.schedule.reserveDateTime,
					time_to: model.schedule.reserveDateTimeEnd,
					facility_id: app.user.facility_id,
					slotstore: slotstore,
					current: model.reserveSlot.id
				}, onslotsel);
			//}

		}
    })

}
function setupNonMember() {
	this.model.set("stateOptions",apputils.stateList.slice())
	this.model.set("platenumstate","NY");
    //this.el.q(".plate_num_state").addOptions(apputils.stateList.slice())
    //this.el.q(".plate_num_state").val("NY")
	this.model.getController().mixin({
		platenumkey:function(ev) {
			var val = ($d.val(ev.target) || "").trim()
			if (val && /\s/.test(val)) {
				$d.val(ev.target,val.replace(/\s/g, ''));
				//app.splashError("Invalid Plate number<br/>Spaces and special characters are not allowed.<br/>Please enter a valild number")
				return
			}
			if (ev.keyCode == 13) {
				walkinNonmember()
				ev.stopImmediatePropagation()
			}
		}
    })
}
function setupVehicleWidget(){
    this.vehicleWidget=new VehicleWidget( {container:this.el.q(".check-in-info")})
    this.vehicleWidget.render()

}
function setupGrid(container){
    var holder = {}
    this._grid=holder
    app.getEntity("facility_reserveusers").then(function (ent) {
        holder.store = ent.createStore(true)
        holder.store.StoreRecordProto.addExpr("actions",function(a){
            var st=a.get("resstatus",true)
            return "<button type='button'>"+(st==1?"Checkin":(st==2?"Checkout":"NA"))+"</button>";
        })
        var cfg = {
             scheduled_duration: {label: "duration"},
            duration_type: {label: "durationType"},
            computed_start_long: {label: "From",type:"timestamp",format:"mm/dd/yy hh:nn tt",hidden: false},
            computed_end_long: {label: "To",type:"timestamp",format:"hh:nn tt",hidden: false},
            vehicle_make: {label: "Make" },
            username: {label: "Name" },
            vehicle_model: {label: "Model" },
            vehicle_plate: {label: "Plate" },
            slotname: {label: "slot" },
            //duration: {expr: "duration"},
            member_id:{searchalias:"username"},
            resstatus: {
                list:[{id:1,label:"Reserved"},{id:2,label:"Checked In"},{id:99,label:"Checked Out"},{id:500,label:"Cancelled"}],
                label:"Status",
                cellRenderer: function (val,k) {
                    return "<div style='background-color:" + (val == 'Reserved' ? "yellow" : (val == 'Checked In' ? "green" : (val == 'Checked Out' ? "blue" : "red"))) + "'>"+k+"</div>"
                }, defaultValue: 1
            },
        };
        //"date_from time_from reserve_extra_extras  actual_duration discount promotion entry_time exit_time payment_status needs_followup follow_up_message multientry account_num email phone_number barcode slot_status location_id notifications checked_out member_id facility_id operator_id operator floor_manager_id reserve_id address name vehicle_type vehicle_id vehicle_description vehicle_model usertype slotlocation slotid firstname lastname middlename rate_model_id extra1 extra2 isprimary vehicle_color vehicle_year".split(/\s+/).forEach(function (a) {
         //   cfg[a] = {hidden: true}
        //});

        ent.updateFields(cfg);
        var opt = {nowrap: true,
            //headerFilter: {filterColumns:"username date_from duration_type scheduled_duration vehicle_plate barcode reserve_num resstatus vehicle_model vehicle_make slot_name account_num email".split(/\s+/)},
            sortable:true,
            columns:["resstatus","computed_start_long","computed_end_long","slotname","username" ,"vehicle_make","vehicle_model","vehicle_plate","actions"]
        }
        holder.store.defaultCriteria = "facility_id = " + app.user.facility_id
        holder.grid = new DataGrid(holder.store, opt);
        holder.grid.build(container)
        holder.grid.pager.sortcol = "id"
        holder.grid.pager.sortdir = "d"
        holder.grid.pager.pagesize = 20


    });
}
function controller() {
    if (!this.visibleFirst) {
        if(this.clearSearch){this.clearSearch()}
        return
    }
    clear.call(this,false,true)
    //update half hour
    try{   this.el.q(".val-duration").options[0].text="½"   } catch (e){}
    setupVehicleWidget.call(this)
    setupNonMember.call(this)
    setupCombo.call(this)
    setupSlotSelection.call(this)
    setupGrid.call(this,this.el.q(".checkinout-grid"));
     this.model.getController().mixin( {
            checkinscan:function(){
                utils.captureQRCode(forBarCode.bind(this))
            }.bind(this),
            nonmembercheckin:dowalkinNonmember.bind(this),
            docheckin:docheckin.bind(this) ,
            doreset: clear.bind(this)
        }
    )

}

var garage_checkin=app.defineView( {id:"garagecheckinout" ,  template:"garagecheckinout",model:new  ReserveModel(),title:"Check-in",controller:controller});

module.exports=garage_checkin