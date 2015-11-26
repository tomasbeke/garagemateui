/**
 * Created by Atul on 6/1/2015.
 */
var SimpleView=$.require("SimpleView")
var ReserveCardView=$.require("ReserveCardView")
var ReserveModel=$.require("models/ReserveModel")
var PopupView =$.require("PopupView")

var STATUS={
 UNREAD:0,
 PENDING:1,
 ACCEPT:1,
 REJECT:3,
 //WITHDRAW:1,
 COMPLETE:2,
}
 var AppnotificationsView=Klass(SimpleView,{
  triggerCount:null,
  currentItems:null,
     notificationTypes:null,
     filter:null,
  triggerSelector:".app-notifications-link",
  init:function() {
    this.initView()
    this.el.addClass("fit-vp-content")
    this.el.addClass("app-notifications-view").css({zIndex:20})
    this.on("afterRender",function(){this.el.toFront(true)})
    this.onpropertychange("currentItems",function(){
       this.updateView();
    })
      app.observer.on("notificationupdate", function (data) {
          if (app.notificationsView && app.notificationsView.el.isVisible()) {
              app.notificationsView.refreshView()
          }
      });


  },
   applyFilter:function(filter){
       if(filter==this.filter){return}
       this.filter=filter;this.renderRows();
   },
  beforeRender:function(){
   this.el.html("<h2 class='blue_bar' style='text-align: left'>Notifications and Tasks<div class='notification-opts'>" +
       "<span class='filter'>Filter</span>" +
       "<span class='refresh'></span>" +
       "</div></h2>" +
       "<div class='fill-container notification-list'><ul class='notification-list-wrap'></ul></div>")
   this.$(".notification-opts .refresh").on("click",  this.refreshView.bind(this))
      this.$(".notification-opts .filter").on("click",  function(ev){
          var el=$d(ev.target),vw=this;
          if(!this._filterList) {
              this._filterList=PopupView.lookupList([{id: -2, label: "Assigned to me"}, {
                  id: 1,label: "Request for Premium Services" }, {id: 2, label: "Retrieve Car"}, {id: 3, label: "Park Car"}, {id: -1, label: "Other"}], {
                  minWidth: 200, destroyonhide:false,callback: function (a) {
                      el.html(a.label)
                      vw.applyFilter(a.id);
                  }
              })
          }
          this._filterList.show()
      }.bind(this))

  },
  updateTrigger:function(){
   if(this.currentItems && this.triggerCount){
    $d.html(this.triggerCount,this.currentItems.length||"")
       if(this.currentItems.length>9){$d.addClass(this.triggerCount,"shrink")}
       else {$d.removeClass(this.triggerCount,"shrink")}
       var d=$d(".garage-slot.notification .txt")
       if(d){d.html(String(this.currentItems.length))}
   }
  },
  updateView:function(){
   if(this.currentItems){
    this.updateTrigger()
       if(!this.notificationTypes) {
           if(!this._pending) {
               this._pending = true;
               var ths = this;
               app.getEntity("appnotificationtype").then(function (ent) {
                   var store = ent.createStore();
                   store.load().then(
                       function () {
                           ths.notificationTypes = store;
                           ths.renderRows()
                       }
                   )
               })
           }
            return;
       }
       this.renderRows()

   }
  },
  renderRows:function(){
   var items=this.currentItems,facid=app.user.facility?app.user.facility.id: 0,cnt=0
   if(items){
    var actions=[["<div class='notification-act' data-key='1'>Accept</div>","<div class='notification-act' data-key='3'>Reject</div>","<div class='notification-act' data-key='100'>Assign</div>","<div class='notification-act' data-key='2'>Done</div>"],["<div class='notification-act' data-key='0'>Withdraw</div>","<div class='notification-act' data-key='2'>Done</div>"]]
   var vw=this;
    if(!this.el.q(".notification-list")){
     return
    }
       var notiStore=this.notificationTypes,filter=this.filter,uid=app.user.id;
    this.el.q(".notification-list").html(
        "<ul class='notification-list-wrap'>"+

      items.map(function(it){var status_id=it.status_id||it.statusid|| 0,acts=actions[status_id]||[]
          if(filter) {
              if (filter > 0 && filter != it.type_id) {
                  return ""
              } else if(filter==-1 && (it.type_id==1 || it.type_id==2 || it.type_id==3)){return ""}
              else if(filter==-2 && (it.assigned_to!=uid)){return ""}
          }
          cnt++
        return ("<li data-typ='"+it.type_id+"' class='noti_item "+ ((notiStore.findById(it.type_id)||{}).istask?" ":"isnottask ")+
                (it.assigned_to?"assigned ":"") +"status-"+status_id+"' data-key='"+it.id+"' data-reserveid='"+it.reserve_id+"'>" +
                "<span class='noti-message'>"+it.msg+"</span>" +
                "<div class='notification-acts'>"+acts.join("")+"</div>" +
            "</li>");
      })
          .join("")
          .replace(/::([\w]+)\b/g,function(a,b){return "<span class='noti-reserve-link'>"+b+"</span>"})
          .replace(/date\(([\w\.]+)\)/,function(a,b){return $.date.format(Number(b.trim()),"mmm, dd yyyy hh:nn tt")}).trim()
          .replace(/,$/,"").trim()
        +"</ul>"
    );
       var ths=this;
       if(facid){
           app.getEntity("facility_staff").then(function (ent) {
               var store = ent.createStore();
               store.load( {criteria:"facility_id="+facid}).then(
                   function () {
                       ths.facilityStaffStore = store;
                   }
               )
           })
       }

    this.el.q(".notification-list-wrap").on("click",function(ev,el){
        var id=$d.up(el,"li").domdata("key"),reserveid=$d.up(el,"li").domdata("reserveid")
        if(!id||!reserveid){
            return
        }
        if(el.hasClass("noti-reserve-link")){
            var rec=app.remoteDirective("reserveinfo",{reserve_id:reserveid}).then(
                function(a){
                    var data= a.data||a;
                    data._isreserverecord=1
                    var model=new ReserveModel();
                    model.readRecord(data)
                    vw.cardView=ReserveCardView.show({
                        id: "notificationview",
                        showtimer: true,
                        showBarCode: false,
                        anchor: el,
                        record: model
                    });
                }
            )

            return
        }
     var nuid=$d.domdata(el,"key")
     if(nuid){

       var data={id:id,user_id:app.user.id}
         if(nuid=="100"){
             data.status_id=STATUS.ACCEPT
             if(!ths.facilityStaffStore){return}
             if(!ths.staffListView){
                 ths.staffListView=new PopupView({anchor:el,width:150,alignAnchor:"below",animateShow:"t",container:ths.el})
                 ths.staffListView.el.on("click.popup",function(ev,elli){
                     data.assigned_to=$d.domdata(elli,"key")
                      data.assigned_on= +(new Date())
                     app.remoteDirective("updatenotification",{ndata:data})
                 }.bind(this)   ,{selector:"li"})
             }
             ths.staffListView.config.options.anchor=el
             ths.staffListView.setContent(ths.facilityStaffStore.records.map(function(a){return "<li class='list-item' data-key='"+a.id +"'>"+a.firstname+" "+ (a.lastname||"")+"</li>"}).join(""))
             ths.staffListView.show()
             return;
         }

     data.status_id=nuid
       if(nuid=="1"){
         data.assigned_to=app.user.id
        data.assigned_on= +(new Date())
       }
         app.remoteDirective("updatenotification",{ndata:data})
      }

    },{selector:".notification-act,.noti-reserve-link"})
       this.$(".notification-opts .refresh").html( $.date().format("hh:nn tt")+"</br/>"+ cnt+" items")
   }
  },
  refreshView:function(){
    var userid=app.user.id,
        facility_id=app.user.facility?app.user.facility.id:0
       var vw=this;
       app.remoteDirective("getnotifications",{assigned_to:userid,facility_id:facility_id}).then(
           function(data){if(!(data )){return}
               var items=data.items||data
               if(!(items && items.length)){return}
            vw.currentItems=items
           }
       )
  },
  toggleView:function(){
   if(this.el.isVisible()){
     this.hide()
   } else{
     this.refreshView()
     this.show()

   }

  },
  hideImpl: function (anim,animconfig) {
      if(this.cardView && this.cardView.getEl && this.cardView.getEl() && this.cardView.getEl().isVisible(true)){
          this.cardView.hideView();
      }
      var actel=$d.util.getActiveElement();
      if(actel && (this.el.contains(actel) || $d.selfOrUp(actel,".filter-listbox"))){
           return;
      }
   if(this._dochandle){
     $d(document.body).off("mousedown", this._dochandle)
     this._dochandle=null
   }
   if(this.el.isVisible()){
    this.el.disAppear(
        function(){$d.hide(this.el)}
    )
   }

  },
  showImpl: function (anim,animconfig) {
   if(this._dochandle){
     $d(document.body).off("mousedown", this._dochandle)
     this._dochandle=null
   }
   $d.show(this.el )
   var vw=this
   this.el.appear({anchor:"r",easing:"ease-out"} ,"fast",function(){
     $d(document.body).on("mousedown", vw._dochandle=function hndl(ev){
         if(vw.cardView && vw.cardView.getEl && vw.cardView.getEl() && vw.cardView.getEl().contains(ev.target)){
             return
         }
      if(vw.el.contains(ev.target) || $d(ev.target).selfOrUp(vw.triggerSelector)){return}
      if(vw.el.isVisible()){
        vw.hide();
      }
    } );
     $d.fillContainer(vw.el.q(".notification-list"))
   })
  },



 });











module.exports=AppnotificationsView