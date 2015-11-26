var app=$.require("app")
var utils=$.require("garage/garageutils")
var userutils=$.require("common/AppUtil")
var service=$.require("garage/garageservice")
var SlotView= $.require("garage/SlotView")
var VehicleWidget= $.require("common/VehicleWidget")
var ReserveModel=$.require("models/ReserveModel")
var ReserveCheckInCheckOut=$.require("common/ReserveCheckInCheckOut")
var SimpleView=$.require("SimpleView")
var PopupView=$.require("PopupView")
var resstore = null,userrowTemplate, rowTemplate = null

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
    this.clearSearch();
    var v=this.vehicleWidget.getDataRecord();
    if(typeof(v.id)!="number"){v.id=0}
    if(!this.model.reservenum) {
        if(this.model.isNonMember){
            this.model.userVehicle.update(v)
            this.model.user.firstname = this.$(".user-firstname").val()||""
            this.model.user.lastname  = this.$(".user-lastname").val()||""
            this.model.user.email     = this.$(".user-email").val()||""
            this.model.user.phonenumber=this.$(".user-phonenumber").val()||""
        }
        //dowalkin.call(this);
    }

    var nudate=new Date()
    this.model.schedule.setEntryTime(nudate)
    var data={
        facility_id:this.model.facility.id,
        reservenum:this.model.reservenum
    }
    this.model.schedule.getDataRecord(data);
    var veh=this.model.userVehicle.toMap()
    veh.vehicle_id=veh.id
    delete veh.id
    $.extend(data,veh);
    data.member_id=this.model.user.id;
    app.remoteDirective("docheckin",{
        sel:data
    }).then(function(res){
        if(!(res && typeof(res )=="object")){return}
        //resstore.clear();
        if(res && res.confirmed){
            res=res.confirmed;
        } else{
            if(res && res.error){
                app.splashError(res.error)
                return;
            }
        }

        //resstore.load({includelookups:false})
        if(!this.model.reservenum && res.reserve_num){
            this.model.readRecord(res)
        }
        // app.showClaimCheck({reservenum:this.model.reservenum})
        $.require("common/ReserveCardView").show({template:"claimcheck",
            showOptions:true,title:"Claim check",
            record:this.model
        });
        // utils.showclaimCheck(this.model)
        clear.call(this)
    }.bind(this));
        return
    var reserveCheckInCheckOut = new ReserveCheckInCheckOut(this.model,"checkin");
    if(this.model.isNonMember){
        reserveCheckInCheckOut.baseModel.isNonMember=true
        reserveCheckInCheckOut.baseModel.user.id=reserveCheckInCheckOut.baseModel.user.nonmember_id=this.model.user.id||this.model.user.nonmember_id
    }
    reserveCheckInCheckOut.checkin(
        function(res){
            if(!(res && typeof(res )=="object")){return}
            //resstore.clear();
            if(res && res.confirmed){
                res=res.confirmed;
            } else{
                if(res && res.error){
                    app.splashError(res.error)
                    return;
                }
            }

            //resstore.load({includelookups:false})
            if(!this.model.reservenum && res.reserve_num){
                this.model.readRecord(res)
            }
            // app.showClaimCheck({reservenum:this.model.reservenum})
            $.require("common/ReserveCardView").show({template:"claimcheck",
                showOptions:true,title:"Claim check",
                record:this.model
            });
            // utils.showclaimCheck(this.model)
            clear.call(this)

            //if(res===false){ pr.reject();return }
            //showInfo.call(ths,res===true?this.baseModel:res);
            //pr.resolve()
        }.bind(this) );
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
    var view=this
    app.remoteDirective("vehicledetails",{barcode:code,facility_id:this.model.facility.id}).then(
        function(data){
            if(data.error){return}
            resolveOverLaps(view,data.user,data,data.reservations)
        }
    )
   /* var ths=this,reserveCheckInCheckOut = new ReserveCheckInCheckOut({barcode:code,facility_id:app.user.facility_id},"checkin");
    reserveCheckInCheckOut.verifyCheckin(
        function(res){
            if(res===false){ pr && pr.reject();return }
            showInfo.call(ths,res===true?this.baseModel:res);
            pr && pr.resolve()
        },true )*/
}
function showInfo(rec,excludeip){
    if(!this._cleared   ) {
        clear.call(this,excludeip,rec == this.model)}
    this._cleared=false;
    if(rec !== this.model) {
        this.model.bindRecalc(true);
        if (!rec.facility_id) {
            if (!rec.facility) {
                rec.facility = app.user.facility
            }
            rec.facility_id = app.user.facility_id

        }
        this.model.readRecord(rec)
        if(rec.user && rec.user.id){
            this.model.user.id=rec.user.id;
        }
    }
    this.data("_last", "");
    var nudate=new Date()
    this.model.schedule.setEntryTime(nudate)

    if(rec.iswalkin){
        this.model.schedule.duration=2;
    }

    this.model.schedule.setupDates();
//    this.model.schedule.reserveDateTime._wraptag=true
//this
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
    var section=this.el.q(".check-in-info")
    section.anim("height",section.scrollHeight,"fast").then(
        function(){
            section.css({height:null})
        }
    )
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
function buildContentForcheckin(model,overlaps ,activecheckin){
    var html=["<div class='checkin-verification'>"]
     if(overlaps.some(function(a){return a.isCheckedIn()})){
        html.push("<h3 class='checkin-error'>" + app.resolveMessage("PM-003") + "</h3>")
        activecheckin=true
    } else{
         var htmlcntnt=ReserveCheckInCheckOut.buildOverLapHTML(model,overlaps,false,activecheckin,true);
         [].push.apply(html,htmlcntnt);
      }
    html.push("</div>")
    return html;

}

function resolveOverLaps(view,user,vehicle,overlaps,dialog){
    var dialogvw=dialog
    var monthly,facility_id=app.user.facility_id,vid=vehicle.id,ths=view
    var reservations=(overlaps||[]).filter(function(a){return a.vehicle_id==vid})
    if(reservations.some(function(a){return a.resstatus>1 && a.resstatus<99})){
        app.splash("already checkedin")
       // return
    }

    ths.model.clearValues(["stateOptions","facility"]);
    ths.model.user.readRecord(user);
    ths.model.userVehicle.readRecord(vehicle);
    if(reservations && reservations.length){
        if(reservations.length==11){
            var rec= $.clone(reservations[0])
            rec.user=user
            rec.vehicle=vehicle
            showInfo.call(ths,rec);
        } else {
            if(!dialogvw) {
                var optns = {
                    animateHide: true, centered: true,  width: 350,  resizable: true,  draggable: true, destroyonhide: true,
                    title: "Reservations and Checkins"
                }
                dialogvw = new PopupView(optns);
                dialogvw.addButton({
                    label: "Close",
                    callback: function () {
                        this.hide()
                    }
                })
                dialogvw.UI.border = "1px solid #666"
                dialogvw.contentUI.padding = "3px"
                dialogvw.show()


            }
            var messageDom=dialogvw.$content(),overlaps=reservations.map(ReserveModel.from);
            overlaps.forEach(function(a){
                if(a.isCheckedIn()){
                    return
                }
                a.set("overlapmode","overlaps overlaps-active")
            })
            var html=buildContentForcheckin(ths.model,overlaps )
            messageDom.html( html.join(""))
            messageDom.on("click",function(ev ){
                var el=$d(ev.target)
                if(el.selfOrUp(".continue-reserve")){
                    dialogvw && dialogvw.hide();
                    showInfo.call(ths,ths.model);
                    return;
                }
                if(!el.up(".resstatus-item")){return}
                var id=el.up(".resstatus-item").domdata("key");
                if(el.selfOrUp(".select-reserve")){
                    dialogvw && dialogvw.hide();
                    var model= overlaps.find(function(a){return a.reserve_id==id})
                    if(!model){
                        return
                    }
                    dialogvw && dialogvw.hide();
                    showInfo.call(ths, model)
                    return;
                }
                if(id && el.selfOrUp(".cancel-reserve")){
                    app.remoteDirective("cancelreserve",{reserve_id: id},function(e){
                        app.splash(e.message||"Cancelled")
                        app.remoteDirective("vehicledetails",{vehicle_id:vehicle.id,facility_id:ths.model.facility.id}).then(function(veh){
                            resolveOverLaps(view,user,vehicle, veh.reservations,dialogvw )
                        })

                    });
                }
            })

        }
     } else {
        dialogvw && dialogvw.hide();
        showInfo.call(ths,ths.model);
    }


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
        app.remoteDirective("assignslot", {
            pars:{reserve_num:ths.model.reservenum,slotid:nuslotid}
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
                dialogvw = new PopupView({animateHide: true, resizable: true, draggable: true,showcancellink:true})
            }
            if (!slotstore) {
                slotstore = ths._parent.getSlotStore()
            }
            //if(model.reserveSlot.id){

            if(ip){ip.blur()}
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
            slotView.on("cancelled",function(){dialogvw.hide()});
        }
    })

}
function setupNonMember() {
    this.model.set("stateOptions",userutils.stateList.slice())
    this.model.set("platenumstate","NY");
    //this.el.q(".plate_num_state").addOptions(userutils.stateList.slice())
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
function controller() {
    if (!this.visibleFirst) {
        if(this.clearSearch){this.clearSearch()}
        return
    }
    this.model.bindRecalc(true);
    clear.call(this,false,true)
    this.model.syncFacility(app.user.facility_id);
    //update half hour
    try{   this.el.q(".val-duration").options[0].text="½"   } catch (e){}
    setupVehicleWidget.call(this)
    setupNonMember.call(this)
    utils.setupReservationSearch.call(this,userutils.RESSTATUS.RESERVED,".check-in-find",".searchcnt",resolveOverLaps.bind(this),showInfo.bind(this))
    setupSlotSelection.call(this)
    this.model.getController().mixin( {
            checkinscan:function(){
                forBarCode.call(this,"35929-8067-1657")
                //utils.captureQRCode(forBarCode.bind(this))
            }.bind(this),
            nonmembercheckin:dowalkinNonmember.bind(this),
            docheckin:docheckin.bind(this) ,
            doreset: clear.bind(this)
        }
    )

}

var garage_checkin=app.defineView( {id:"garagecheckin" ,  template:"garagecheckin2",model:new  ReserveModel(),title:"Check-in",controller:controller});

module.exports=garage_checkin