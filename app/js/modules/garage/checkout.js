var app=$.require("app")
var stores=$.require("garage/garagestores")
var utils=$.require("garage/garageutils")
var userutils=$.require("common/AppUtil")
 var ReserveModel=$.require("models/ReserveModel")
var service=$.require("garage/garageservice")
var VehicleWidget=$.require("common/VehicleWidget")
var ReserveCheckInCheckOut=$.require("common/ReserveCheckInCheckOut"), rowTemplate = null;

 function processCheckout(model,override){
    if(override!==true && model.reserveTaskList && model.reserveTaskList.hasUnResolved()){
        app.splashError("There are unresolved tasks which must be completed or cancelled before checkout.")
        return
    }
    var exit_time=+(model.exit_time||new Date());
    app.remoteDirective("docheckout", {
            sel:  {
                reserve_num: model.reservenum,
                tip:model.pricing.calctip,
                amount:model.reservecost,
                exit_time:exit_time,
                staff_id:app.user.id
            }
        }
        ,function () {
            this.$(".garagecheckout").addClass("hasnoselection")

            $.require("common/ReserveCardView").show({template:"receipt",
                showOptions:true,
                showreceipt:true,title:"Receipt",
                record:this.model
            });
        }.bind(this))
}
function docheckout() {
    var reserve_id=this.model.reserve_id
    if(!reserve_id){
        app.splashError("Reserve id not found")
        return
    }
    this.model.schedule.setExitDate(new Date())
      var manualprice=this.model.manualprice
    $d.html(".scanned-code","")
    app.remoteDirective("reserveinfo",{reserve_id:reserve_id}).then(
        function(rec){
            var numodel=ReserveModel.from(rec);
            numodel.schedule.setExitDate(new Date())
             if(manualprice){
                numodel.manualprice=manualprice
            } else {
                numodel.recalcPrice()
            }

            if(!numodel.allresolved) {
                 numodel.onchange("allresolved", function () {
                    processCheckout.call(this,numodel)
                }.bind(this))
            } else {
                processCheckout.call(this, numodel)
            }
        }.bind(this)
    )



}
function showReserveCard(rec) {
    var reservecard = this.el.q(".reserve-card"), scopeid = "garagecheckout"
    this.data("_last","");
    //this.model.clearValues()
    var reservemodel = this.model;
    reservemodel.scopeid = scopeid
     if (reservecard) {
         reservemodel.bindRecalc(true)
         if(app.user.facility){
             rec.facility=app.user.facility
         }

        reservemodel.readRecord(rec).then(function(rec){
              reservemodel.schedule.setExitDate(new Date())
            reservemodel.recalcPrice(true)
               reservecard.show()
             this.el.q(".garagecheckout").removeClass("hasnoselection")
            reservemodel.digest(reservecard,"reserve-card");
              this.vehicleWidget.digest();
          }.bind(this));
     }
}

function forBarCode(code,pr){
    if(!code){return}
     app.remoteDirective("vehicledetails",{barcode:code,facility_id:this.model.facility.id}).then(
        function(data){
            if(data.error){return}
            var rec
            if(data && Array.isArray(data.reservations) && data.reservations.length){
                rec=data.reservations.find(function(r){return r.resstatus==2})
            }
            if(rec){
                showReserveCard.call(this,rec)
            } else{
                app.splashError("No Reservation found for this vehicle :" + code)
            }

        }.bind(this)
    )
    /* var ths=this,reserveCheckInCheckOut = new ReserveCheckInCheckOut({barcode:code,facility_id:app.user.facility_id},"checkin");
     reserveCheckInCheckOut.verifyCheckin(
     function(res){
     if(res===false){ pr && pr.reject();return }
     showInfo.call(ths,res===true?this.baseModel:res);
     pr && pr.resolve()
     },true )*/
}
function setupScan() {
    this.el.q(".check-out-scan").on("click",function(){
        $d.html(".scanned-code","")
        utils.captureQRCode(function(code){
            if( !code){app.splashError("Invalid code");return}
            code=code.trim()
            $d.html(".scanned-code",code)
            forBarCode.call(this,code,pr)

        }.bind(this))
    }.bind(this))
}
function setupTaskList(){
    this.model.reserveTaskList.showListWithStatus(this.el.q(".extra-service"))
    app.observer.on("notificationupdate",function(data){
        if(  data && data.record && data.record.reserve_id==this.model.reserve_id){
            if(this.model.reserveTaskList && this.model.reserveTaskList.tasks){
                var id=data.record.id
                var tasks=this.model.reserveTaskList.tasks,task=tasks.find(function(a){return a && a.id==id})
                data.record.status=data.record.status_id
                if(task){task.update(data.record)}
                this.model.reserveTaskList.tasks=tasks.slice();

            }
            data.record.id
        }
    }.bind(this))
}
function setupVehicleWidget(){
    this.vehicleWidget=new VehicleWidget({showsummary:true,model:this.model.userVehicle})
    this.vehicleWidget.appendTo(this.el.q(".vehicle-info"))

}
function controller() {
    this.el.q(".garagecheckout").addClass("hasnoselection")
    $d.html(".scanned-code","")
    this.model.bindRecalc(true);
    if (!this.visibleFirst) {
        return
    }
    this.model.getController().mixin({
        checkoutmember: docheckout.bind(this),
        checkoutmembercash:function(ev){alert("Cash")},
        checkoutmembercc:function(ev){alert("CC")},
        checkoutmembermonthly:function(ev){alert("monthly")}
    })
    setupVehicleWidget.call(this)
    utils.setupReservationSearch.call(this,userutils.RESSTATUS.CHECKEDIN,".check-out-find",".searchcnt",null,function(rec){
        if(rec && rec.id){
            app.remoteDirective("reserveinfo",{reserve_id:rec.id}).then(
                function(data){
                    showReserveCard.call(this,data)
                }.bind(this))
        }

    }.bind(this))

    setupScan.call(this)
    setupTaskList.call(this)
}
var model=new  ReserveModel()
model.addProperty("checkedincount",0)
var garage_checkout=app.defineView({id:"garagecheckout",layout:"fill", model:model,template:"garagecheckout",title:"Check-out",controller:controller});

module.exports=garage_checkout