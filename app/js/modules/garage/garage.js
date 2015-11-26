/**
 * Created by Atul on 5/24/2015.
 */
var app=$.require("app")
var SimpleView=$.require("SimpleView")
var GraphWidget=$.require("GraphWidget")
var DataGrid=$.require("View.DataGrid")
var Form=$.require("UI.Form")
var GeoMap=$.require("common/GeoMap")
var Checkin=$.require("garage/checkin")
var Checkout=$.require("garage/checkout")
var Dashboard=$.require("garage/dashboard")
var Capacity=$.require("garage/capacity")
var Reports=$.require("garage/reports")
var Settings=$.require("garage/settings")
var Garagepricing=$.require("garage/garagepricing")
var ReserveTaskList= $.require("models/ReserveTaskList")
var Search= $.require("garage/garagesearch")
var qrtest= $.require("garage/qrtest")
var WeatherWidget= $.require("common/WeatherWidget")
var rootmodel=null,reservestore=null,
    vehicleStore=null,operatorStore=null
var AppnotificationsView = $.require("common/AppnotificationsView")
var PopupView=$.require("PopupView")
var ReserveCardView=$.require("common/ReserveCardView")
var GarageBrowser=$.require("garage/GarageBrowser")

var reserveStorePending=1,reserveStorePromise=null
function getReserveStore(callback){
    if(!reserveStorePromise){reserveStorePromise=Promise.deferred()}
    if(callback){reserveStorePromise.then(callback)}
    if(reserveStorePending>0&&reserveStorePending<4) {
        app.getEntity("facility_reserveusers").then(function (ent) {

            ent.updateFields({
                date_from: {type: "date", label: "Date"},
                time_from: {type: "time", label: "Time", cellui: {style: {whiteSpace: "nowrap"}}},
                reserve_num: {label: "Num"}
            });

            reservestore = ent.createStore()
            app.Xreservestore = reservestore;
            reservestore.pager.sortcol = "id"
            reservestore.pager.sortdir = "d"
            reservestore.provider.includelookups = false;
            reservestore.pager.pagesize = -1
            reservestore.defaultCriteria = "facility_id=" + app.user.facility.id + " and resstatus < 99"
            reservestore.load().then(function () {
                    reserveStorePending = 0
                    reserveStorePromise.resolve(reservestore)
                },
                function () {
                    reserveStorePending++
                    setTimeout(getReserveStore, 0)
                })
        });
    }
    return reserveStorePromise
}
function setLandingDims( ) {
     if(!app.viewRoot || !app.viewRoot.garagehome){return}
    var outer=app.viewRoot.$(".garage-content"),tp=0//outer.offsetTop
     var vwp = $.viewport.get(), garagedashboard = app.viewRoot.garagehome.el;
    var els = {}, lb = garagedashboard.bounds(), top, lbht, ht
    var top =  garagedashboard.el.getBoundingClientRect().top + document.body.scrollTop

    var dbweap, vpht = vwp.height , vpht2 = vwp.height - (top )

    /*if (app.rootView.theview) {
        app.rootView.theview.el.style.minHeight = (vwp.height - (app.rootView.theview.el.bounds().top)) + "px";
    }*/
    //app.rootView.el.css({minHeight:vpht+"px"})
    //$d.css(".tab-panels",{minHeight:vpht2})
    if (!lb.top) {
        //return
    }

    if (garagedashboard.isVisible(true)) {
        if (dbweap = garagedashboard.q(".db-wrap")) {

            if (dbweap.isVisible(true)) {
                dbweap.css({minHeight: vpht - top, height: vpht - top})

            }
        }
    } else { }



}
function Service(cmd,pars,cb) {if(pars.facility_id===null){pars.facility_id=app.user.facility_id}
    app.remoteDirective(cmd, {type: cmd, args: pars}, function (a) {
        if(a.data){a= a.data}
        cb(a);
    });
}


function _makeViews(dom) {
    rootmodel= $.model.newInstance("garage");
    var date= $.date()
    rootmodel.set("currentdate", $.date())
    app.userDetails.set("appversion",app.user.appversion)
    rootmodel.set("user",app.userDetails)

     setInterval(function(){
        rootmodel.set("currentdate", $.date())
    },15000)
    ReserveTaskList.setupLookup()
    if(app.user && app.user.facility){
        rootmodel.addProperties(app.user.facility)
        //rootmodel.set("operator","")
    }

    rootmodel.addProperties({
        total:(app.user.facility?app.user.facility.spaces_total:0)||0,
        available:0,
        upcoming:0,
        notification:0,
        slotEntity:null
    })

    var root=new SimpleView({model:rootmodel,id:"garage",template:"garage",controller:function(el){
        el.parent().show().opacity(1)}
    })



            root.add(Dashboard())
           // root.add(Checkinout())
            root.add(Checkin())
            root.add(Checkout())
            root.add(Search())
            root.add(Capacity())
            root.add(Reports())
            root.add(Garagepricing())
            root.add(GarageBrowser())
            var c= rootmodel.getController(),mixin={}

            root.children.each(function(ch){

                    mixin["cmd_"+ch.id] = root.setView.bind(root,ch.id)
                }
            )
            mixin.useroptions=function(ev){
                var PopupView = $.require("PopupView")
                var useroptions = new PopupView.lookupList(['Settings',app.isLoggedIn()?'Logout':'Login','Change Garage'],{
                    anchor: ev.target,minWidth:150,
                    callback:function(rec){
                        if(rec.id=="Change Garage"){
                            app.viewRoot.model.getController().invoke("changegarage",[ev])
                        }
                        else if(rec.id=="Settings"){
                            app.viewRoot && app.viewRoot.setView("myaccount")
                        } else{
                            app.viewRoot.model.getController().invoke("loginAct",[])
                        }
                    }
                });
                useroptions.show()

            }
            mixin.changegarage=function(ev){
                $.xhr.get(app.servicePath,{entity:"facilitywithrates",columns:"id,name,operator"}).then(function(data){
                    var list=[]
                    if(data.mode=="list"){
                        data.data.forEach(function(a){
                            if(a[1] && a[0]>0){
                                list.push({id:a[0],label:(a[2]?(a[2]+":"):"")+a[1]})
                            }
                         })
                    } else{
                        list=data.data
                    }
                    var PopupView = $.require("PopupView")
                    var garagelist = PopupView.lookupList(list,{
                             ignoreanchorstyle:true,combo:true,combotitle:"Search",
                            destroyonhide:false,anchor:ev.target,maxHeight:200,minWidth:250 ,
                            callback:function(rec){

                                app.authenticate("facility__manager"+rec.id,"auto").then(function(){
                                     window.location.reload();
                                })

                                this.hide()
                            }
                        })
                     garagelist.show()
                 })


            }
            mixin.loginAct=function(act){
                if(act=="signup"){
                    app.promptNewAccount(function(data){
                        app.promptLogin(function(data){
                            app.setUpSession(data)
                        },true,data.loginid)
                    } );
                    return
                }
                if(!app.isLoggedIn()){
                    app.promptLogin(function(data){
                        app.setUpSession(data)
                    },true)
                } else {
                    app.signOut();
                }
            }
            c.mixin(mixin);


            root.on("viewchange",function(nu){
                var key="cmd_"+nu.id
                var link=root.el.q("[data-cmd='"+key+"']")
                if(link){link.parent().qq(".active").removeClass("active")
                    link.addClass("active")
                }

                app.router.pushState({path:nu.id,handle:this.setView.bind(this,nu.id)})
                var title=nu.title
                if(nu.title=="DashBoard"){title=""}

                var el=this.el.q(".garage-menu-"+nu.id)
                this.el.st(".garage-meu.selected").removeClass("selected")
                if(el){
                    el.addClass("selected");
                }
            });

            $.viewport.on(setLandingDims )

            $d.on(".user-signin","click.sigin",function(ev){
                if(!app.user.id){
                    app.promptLogin(function(data){
                        app.setUpSession(data)
                    },true)
                } else {
                    app.signOut("garage");
                }
            });

           // $.fn.delay(setLandingDims,2200)


    app.viewRoot=root;

    return root;
}
function updateUpcoming(){
    if(!app.viewRoot){return}
    var upcoming=app.viewRoot.el.q(".slots .upcoming");
    if(!app.user.facility_id){
        if(app.user.facility && app.user.facility.id){
            app.user.facility_id=    app.user.facility.id
        }
    }
    upcoming && app.remoteDirective("upcomingcount",{facility_id:app.user.facility_id}).then(
        function(data){
            data && upcoming.q(".quantity").html(String(data.count||0))
        })
}
var garageview = {
    $el:null,
    resetDims:function(){
        var ht=$.viewport.get().height;
        //$d.css(userview.$el,{maxWidth:$.viewport.get().width});//,overflowY:ht<640?"auto":"hidden"
        //$d.css(".search-map",{h:Math.max(200,ht-(220+150+($d.height(".top-header")||0)))})
    },
    activate: function () {

    },
    init: function () {
         var cntnr=$d(".content-outer .user-views")
        /*app.rootView.theview.on("afterlayout",function(){
            this.el.css({position: "relative",height: "auto"})
        });
        app.rootView.show();*/
        var root=_makeViews(cntnr)
        root.show()
        var ww=new WeatherWidget( ".weather" )
        ////var weatherph = $d(".weatherph")
       // ww.render()

        $d.addClass(root.el,"garage")
        root.on("attach",function(){
                var dummymodel=$.model.newInstance()
                dummymodel.addProperty("user")
                dummymodel.getController().mixin({signOut:function(){app.signOut()}})
                dummymodel.user=app.userDetails;
                dummymodel.digest($d(".top-header"))
                root.setView("garagehome");
                setTimeout(setLandingDims,100);
                $d(".app-splash") && $d(".app-splash").anim("hide")
                var upcoming=root.el.q(".slots .upcoming");
                if(app.user && !app.user.facility_id){
                    if(app.user.facility && app.user.facility.id){
                        app.user.facility_id=    app.user.facility.id
                    }
                }
                if(upcoming){
                    app.remoteDirective("upcoming",{facility_id:app.user.facility_id}).then(
                        function(data){
                            upcoming.q(".quantity").html(String(data.items.length))
                        })
                    var template=DataGrid.generateTemplate({cellklass:"upcoming-item",cols:[{label:"User",name:"username"},{label:"Start",name:"starttime"},{label:"Duration",name:"duration"},{label:"Slot",name:"slotname"}]})
                    //var template=$d.template("<tr class='upcoming-item-row grid-row'><td class='upcoming-item grid-cell'>$username</td><td class='upcoming-item  grid-cell'>$starttime</td><td class='upcoming-item  grid-cell'>$duration</td><td class='upcoming-item  grid-cell'>$slotname</td></tr>")
                    upcoming.on("click",function(){var anchor=this;
                        app.remoteDirective("upcoming",{facility_id:app.user.facility_id}).then(
                            function(data){if(!data){return}
                                upcoming.q(".quantity").html(String(data.items.length));

                                var content=template({row:data.items.map(function(a){
                                    return {username: a.username,slotname: a.slotname,id: a.id,
                                        starttime:$.date.format(a.computed_start_long,"mm/dd/yyyy hh:nn tt"),duration:a.scheduled_duration+" "+ a.duration_type}
                                })})
                                //list.push("</tbody></table>")
                                var dial=new PopupView({showarrow:true,anchor:anchor,height:300,width:500, title:"Upcoming",contentUI:{overflowY:"auto"},destroyonhide:true})
                                dial.show();
                                dial.setContent(content);
                                dial.$content().addClass("upcoming-items gridtable").css("overflowY","auto")
                                    .on("click",function(ev,el){
                                            if($d.domdata(el,"id")){
                                            app.remoteDirective("reserveinfo",{reserveid:$d.domdata(el,"id")},function(data){
                                                data && ReserveCardView.show({record:data,showtimer:true, anchor:el})
                                            })
                                        }
                                    },"tbody tr");
                            }
                        )

                    })

                }
                var notificationlink = $d(".slots .notifications")

                if (notificationlink) {
                    notificationlink.on("click", function () {
                        app.notificationsView.toggleView();
                    });

                }
            }

        );
        app.onRemote("reservestatus" ,function(ev){
            var msg=ev.data.message||ev.data.msg;
            if(msg){
                app.splashInfo("Updated<br/>"+(msg||""),1000)
            }

            if(ev.data.stats){
                app.updateFacilityStats(ev.data.stats)
            }
            updateUpcoming()
            app.fire("reservestatusupdate",ev.data)
        })
        var d=new Date(),d1=new Date(),flds= [
            {name:"facility_id",type:"number"},
            {name:"slotid",type:"number"},
           // {name:"}//slotcolor",type:"string"},
            {name:"slotgroupname",type:"string"},
            {name:"slotgroupid",type:"number"},
            {name:"end",type:"number"},
            {name:"st",type:"number"},
            {name:"resstatus",type:"number"},
            {name:"reserve_id",type:"number"},
            {name:"member_id",type:"number"},
            {name:"reserve_num",type:"string"},
            {name:"dur",type:"number"},
            {name:"act_dur",type:"number"},
            {name:"slot_status",type:"number"},
            {name:"slotname",type:"string"},
            {name:"location",type:"string"}
       ],onlyreservedflds= [
            {name:"facility_id",type:"number"},
            {name:"slotid",type:"number"},
            // {name:"}//slotcolor",type:"string"},
             {name:"end",type:"number"},
            {name:"st",type:"number"},
            {name:"resstatus",type:"number"},
            {name:"reserve_id",type:"number"},
            {name:"member_id",type:"number"},
            {name:"reserve_num",type:"string"},
            {name:"dur",type:"number"},
            {name:"act_dur",type:"number"},
            {name:"slot_status",type:"number"},
         ];;
        root.getSlots=function(){
            if(!this._slotListpromise){
                this._slotListpromise=Promise.deferred()
                app.remoteDirective("slots",{facility_id:app.user.facility.id}).then(function(a){
                    var data=a.items.map(function(r){return {slotid: r.id,slotname: r.name,slotgroupid: r.slot_group_id,slotgroupname: r.slot_group_name,}})

                    this._slotListpromise.resolve(JSON.stringify(data))
                }.bind(this))
            }
            return this._slotListpromise;
        }

        var ths=this
        root.model.slotEntity = Data.defineLocalEntity("allslots",flds)
        root.getSlotStore=function(){
             var store=this.model.slotEntity.createStore(),allcols=flds.map(function(a){return a.name})
            app.slotstore1=store;
            store.loadData=function(facility_id,date,dateto){

                var store=this,pr=Promise.deferred()
                app.remoteDirective("allslots", {type:"allslots" ,args:{facility_id: facility_id,date_from:+date,date_to:+dateto,onlyreserved:true}},function(a){

                      root.getSlots().then(function(data){
                         var slotmap={},slots=JSON.parse(data)
                         var cols=onlyreservedflds.map(function(a){return a.name}),data=[],
                             othercols=allcols.filter(function(k){return cols.indexOf(k)==-1})
                          if(!store.getOriginalList().length){
                              store.addAll(slots);
                          }
                          var recs=store.records
                         if(a && a.items){
                             data = a.items.split("```").map(function(it){return it.split(/\|/).reduce(function(m,v,i){
                                 m[cols[i]]=v;
                                 return m
                             },{})});

                         }
                         var slotln=slots.length,dalaln=data.length,ids=[],recln=recs.length
                          for(var i=0;i<dalaln;i++){
                              ids.push(+data[i].slotid)
                              data[i].slot_status||(data[i].slot_status="0");
                              delete data[i].slotid;
                          }
                          for(var i=0;i<recln;i++){
                              var rec=recs[i],id=+rec.slotid,idx=ids.indexOf(id)
                              if(idx>=0){
                                  rec.update(data[idx])
                              } else if((+rec.slot_status)!=0){
                                  rec.slot_status="0"
                              }

                          }
                          store.setOriginalList(recs.slice())

                          /*for(var i=0;i<dalaln;i++){
							  var id=+data[i].slotid
							  var rec=store.find(function(r){return r.slotid== id})
							  data[i].slot_status||(data[i].slot_status="0");
							  if(rec){ids.push(id)
								  rec.update(data[i])
							  }
							  //slotmap[slots[i].slotid]
							  //slotmap[data[i].slotid]=data[i];
						  }
                           store.getOriginalList().each(function(rec){
                              if(ids.indexOf(rec.slotid)==-1 && rec.slot_status!="0"){
                                  rec.slot_status="0"
                              }
                          })
                         for(var i=0;i<slotln;i++){
                             store.findById()
                             slotmap[slots[i].slotid] && Object.assign(slots[i],slotmap[slots[i].slotid]);
                             slots[i].slot_status||(slots[i].slot_status="0");
                         }
                          store.clear();
                          store.addAll(slots);*/

                         pr.resolve(store)


                     })

                 });
                return pr
            }
            return store;
        }
        if (!app.notificationsView) {
            app.notificationsView = new AppnotificationsView({triggerCount: ".slots .notifications .quantity"})
        }
        app.notificationsView.refreshView();


    }
}

module.exports=garageview
//app.addModule("garage",garageview)