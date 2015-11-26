/**
 * Created by Atul on 5/24/2015.
 */
var ReserveModel=$.require("models/ReserveModel")
var SimpleView=$.require("SimpleView")
var PopupView=$.require("PopupView")
var qrcodeDialog
function ensureBarCode(dom,model) {
    if(!(dom && dom.q(".user-bar-code"))){return}
   if(dom.q(".user-bar-code img")){return}
   if(model.userVehicle && model.userVehicle.id){
      model.userVehicle.drawBarCode && model.userVehicle.drawBarCode(dom.q(".user-bar-code"))
   }
}
var garageutils={
   RESSTATUS: {
      CHECKEDIN: 2,
      RESERVED: 1,
      lATE: 3,
      CANCELLED: 4,
      NEEDSFOLLOWUP: 5,
      PAYMENTPENDING: 6,
      PAYMENTPROCESSED: 7,
      CHECKEDOUT: 99,
      COMPLETED: 100
   },
   captureQRCode:function captureQRCode(callback) {
      window.addEventListener("message",function _onmessage(ev){
         if(typeof(ev.data)=="string" && ev.data.indexOf("!_")==0){return}
         var data=typeof(ev.data)=="string"?JSON.parse(ev.data):ev.data
         if(data && data.type=="qrcode"){
            window.removeEventListener("message",_onmessage)
            qrcodeDialog && qrcodeDialog.hide();
            callback && typeof(callback)=="function" && callback(data.result)
             qrcodeDialog=null;
         }

      })
      if(!qrcodeDialog){
         qrcodeDialog=new PopupView({height:400,width:350,
            hideonblur:false,
            resizable:true,showcancellink:true,
            title:"Capture QR Code"
         })
         qrcodeDialog.setContent({url:app.contextPath+"app/qrcodecapture/qr.html"})
         qrcodeDialog.observer.on("hide",function(){
            this.$content() && this.v.remove();
            qrcodeDialog=null;
         });
      }

      qrcodeDialog.show();
   },
   setupReservationSearch:function setupReservationSearch(reservestatus,ip,cntselector,resolveOverLaps,callback){
   var ths=this;
   var reservemodel = this.model,userrowTemplate,rowTemplate;
   function onselect(r,lkup) {
      var ths=this,resid = r.id
      if(_isUserSearch()){

         var activeel=$d.util.getActiveElement()
         // var anchor=$d.selfOrUp(activeel,".list-item")
         if(!$d.selfOrUp(activeel,".list-item")){return}
         if(r && r.id){
            ths.ip.val(r.fullname)
         }
         var anchor=lkup.config.options.anchor

         app.remoteDirective("userdetails",{targetid:resid}).then(
             function(u){
                var activeel=$d.util.getActiveElement()
                // var anchor=$d.selfOrUp(activeel,".list-item")
                //if(!anchor){return}
                if(u.vehicles && u.vehicles.length>=1){
                   var vehicleListView = new PopupView({
                      minWidth:350,animateShow:false,
                      maxHeight:function(bnds){
                         if(this.config && this.config.options&& this.config.options.anchor){
                            $.viewport.height - $d(this.config.options.anchor).bounds().top;
                            this.$content().css("overflowY","auto")
                            return $.viewport.height - ($d(this.config.options.anchor).bounds().bottom+40)
                         }
                         return 0
                      },
                      alignAnchor:"below",
                      anchor:anchor, title:'select a Vehicle' ,
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
                      resolveOverLaps(ths,user,vehicle,user.reservations )

                   },".list-row")
                   vehicleListView.show()
                } else {
                   app.splashError("A vehicle is required for check=in")
                }
             }
         )
         return false
      }
      var rec = r//(this._currentRecords||[]).find(function(r){return r.id==resid})

      callback ( rec)

   }
   function _isUserSearch() {
      return ths.el.q(".user-search")  && ths.el.q(".user-search").val()===true
   }
   function _searchCallback( ev) {

      var ths=this,reservemodel = this.model ,el=this.el,val=this.ip.val()
      if (!( val && (typeof(val)=="string"))) {
         return Promise.reject()
      }
      var pr=Promise.deferred(),usersrch=_isUserSearch()

      var barcodesrch,facility_id=app.user.facility_id
      if(usersrch){
         if(!userrowTemplate ){
            userrowTemplate=$d.template("<div class='lookup-record'><span  class='rec-id'>$id</span><span  class='rec-firstname'>$firstname</span> <span  class='rec-lastname'>$lastname</span>, <span  class='rec-lastname'>$email</span></div>")
         }

         app.remoteDirective("findusers",{srch:val}).then(
             function(a){
                a=a||[]

                var rows=[].concat(a).map(function(r){
                   return {id: r.id,label:userrowTemplate(r),datarecord:r}
                })

                pr.resolve(rows)
             },
             function() {pr.reject( msg)
                ths._searchPending = false;
             }
         );
         return pr
      }

      if(!rowTemplate){
         rowTemplate = $.template(garageutils.reserveRecordTemplate)
      }
      console.log("findreservations",val)
      app.remoteDirective("findreservations",{searchstr:val,facility_id:facility_id,resstatus:reservestatus}).then(
          function(data){
             if(data && data.list){console.log("findreservations")
                pr.resolve( data.list.map(function(r){
                   return {id: r.id,label: rowTemplate(r),datarecord:r}
                }) )
             }
          },
          function(msg) {
             pr.reject( msg)
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
            destroyonhide:false,anchor:vw.ip,
            callback:function(rec){
               onselect.call(vw,rec,this);
               this.hide()
            }
         }).show()
         list.observer.on("beforehide",function(el){
            if(ip.contains(el)){return false}
         })
         vw.data("_list",list);
      }
      var _last=vw.data("_last");
      if(_last && vw.data("_last")==val && list.isVisible(true)){
         return
      }
      vw.data("_last","");
      if(this._searchPending){
         return
      };
      (function(vw,val,list, last,currentrecords){
         function _seachResults(rows ){
            vw._searchPending=false;
            vw.data("_last",val)
            vw._currentRecords=rows
            if(cntselector && vw.el.q(cntselector)){
               vw.el.q(cntselector).html(rows.length+" found");
            }
            if(!(rows && rows.length)){
               vw.clearSearch(true)
               return;
            }
            list.reset(rows,{anchor:vw.ip })
         }

         if(last && val && val.indexOf(last)==0 && currentrecords && list.isVisible(true)){
            var  rows=vw.model.findReservationsByText(val,currentrecords,_isUserSearch()?"user":"")
            _seachResults(rows,val)
         }
         else{vw._currentRecords=null;
            vw.searchCallback( ev).then(_seachResults ,
                function(err){err=err||{}
                   list.reset([{id:0,label:typeof(err)=="string"?err:(err.error||"..error...")}],vw.ip)
                }
            )
         }
      })(vw,val,list,_last,vw._currentRecords);
   }

   this.searchCallback=_searchCallback.bind(this)
   var dosearch=$.throttle(triggerSearch.bind(this),{tailend:true,delay:1000})
   var ip = this.el.q(ip);
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
         var userlink=dom.q(".check-in-find-user-link");
         if(!userlink){return}
         if ($d.val(ev.target)) {
            vw.hassearchTrigger = true

            userlink.show().css({position:"absolute"}).on("click.searchtrigger",
                function(ev){
                   dosearch(ev);
                }
            )
            //ip.setTrigger(but)

         } else {
            //ip.setTrigger(null)
            vw.hassearchTrigger = null
            userlink.hide().off("click", "searchtrigger")
         }
         vw.clearSearch()
      }.bind(this)
   })

},
     reserveRecordTemplate:"<div class='lookup-record'>" +
        "<span  class='rec-reserve_num'>$reserve_num</span><span class='rec-time_from'>$reservetime</span>" +
        "<span class='rec-scheduled_duration'>$scheduled_duration</span><span class='rec-duration_type'>$duration_type</span><span  class='rec-slot'>$slotname</span>" +
        "<div  class='rec-name'>" +
        "<span  class='rec-firstname'>$firstname</span>" +
        "<span  class='rec-lastname'>$lastname</span>" +
        "<span  class='rec-vehicle_plate'>$vehicle_plate</span>" +
        "<span  style='color:$vehicle_color' class='rec-vehicle_make'>$vehicle_make</span>" +
        "</div>" +
        "</div>"
}
module.exports=garageutils