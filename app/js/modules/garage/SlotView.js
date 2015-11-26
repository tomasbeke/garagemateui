var SimpleView=$.require("SimpleView")
var SlotModel=$.require("garage/SlotModel")
var hdrtemplate = $.template("<span class='lbl'>Slots</span><span class='val'>$total</span><span class='lbl'>Occupied</span><span class='val'>$occupied</span><br/>" +
    "<span class='lbl'>Date:</span><span class='val'>$reservedate</span><span class='lbl'>from</span><span  class='val'>$time_from</span><span class='lbl'>to</span><span z-type='time' class='val'>$time_to</span>" +
    "")
 var template= "" +
     "<div class='parking-slot current-state-$slot_status group-color-$slotgroupid' data-index='$index' data-key='$slotid'>" +
         "<span class='slot-name' >$slotname</span>" +
         "<span class='slot-loc'>$slotgroupname</span>" +
         "<div class='status-flag'></div>" +
     "</div>",templatefn=null
var SlotView=Klass(SimpleView,{
        reservedate:{descriptor:true,type:"date"},
        reservedateEnd :{descriptor:true,type:"date"},
        last_refreshed:null,
        facility_id:null,
        slotstore:null,
        slotGroupStore:null,
        statusfilter:null,
        init:function() {
            this.properties.addProperties({
                "occupied":{descriptor:true,expr:function(rec){
                    if(rec.slotstore){
                        var cnt=rec.slotstore.size()
                        return rec.slotstore.records.findAll(function(a){return a && a.slot_status>0}).length
                    }
                }},
                "total":{descriptor:true,expr:function(rec){
                    if(rec.slotstore){
                        return rec.slotstore?rec.slotstore.size():0
                    }
                }}
            })
            this.initView()
            this.onpropertychange("last_refreshed",function(rec){
                this.updateTs()
            });
             this.onpropertychange("statusfilter",function(rec){

                 if(!this.el){return}

                if(rec.value!=null){

                    this.el.qq(".slot-stats-filter .status-item.selected").removeClass("selected");
                    this.el.qq(".slot-stats-filter .status-item[data-key='"+rec.value+"']").addClass("selected");
                }
                  if(!this.el.q(".slot-list")){return}

                 this.renderSlots()
            });

        },
        updateTs: function () {
            if(!this.el || !this.el.isVisible(true)){return}
            var dom=this.el.q(".refresh-list-message"),dt=$.date(this.last_refreshed);
            dom && dt && dom.html("last refreshed<br/>"+ dt.format("hh:nn tt"))
            setTimeout(this.updateTs.bind(this),6000)
        },
        setGroupList: function () {
                if (!this.slotGroupStore) {
                    return
                }
                var grpsel = this.el.q(".group-list-wrap .group-list")
                if (grpsel) {
                    var curr = this.properties.get("slotgroup")
                    var lst = this.slotGroupStore.collect(function (rec) {
                        return {id: rec.id, label: rec.name}
                    }).toArray()
                    lst.unshift({id: "0", label: "All"})
                    if (lst.length == grpsel.options.length) {
                        return
                    }

                    $d.addOptions(grpsel, lst, true)
                    if (curr) {
                        $d.val(grpsel, curr)
                    }
                    grpsel.el.onchange = function (ev) {
                        this.properties.set("slotgroup", ev.target.value)
                    }.bind(this)

                }
            if(this.last_refreshed){
                this.el.q(".refresh-list-message").html("last refreshed "+ $.date(this.last_refreshed).format("recency"))
            }

         },
        redrawHeader: function () {
            var store = this.slotstore, dom = this.el

            this.properties.recalcAll();
            var cnt = store.records.size(), occupied = store.records.findAll(function (a) {
                return a.slot_status>0
            }).length
            var data ={};
            data.total = store.size()
            data.occupied = occupied
            if (this.reservedate) {
                data.time_from = $.date.asTime(this.reservedate).format()
                data.reservedate = $.date(this.reservedate).format("mm/dd/yyyy")
            }
            if (!this.reservedateEnd) {
                this.reservedateEnd=$.date(this.reservedate).clone().plus("h",1)
            }
            data.time_to = $.date.asTime(this.reservedateEnd).format()

            dom.q(".slot-stats .slot-stats-hdr").html(hdrtemplate(data))
            this.setGroupList()

        },
        redraw: function (record) {
            var store = this.slotstore, dom = this.el
            var rl = dom.q("[data-key='" + record.id + "']"), v = record.slot_status||0
            if (rl) {
                var nu
                rl.removeClass(["current-state-","current-state-1", "current-state-0", "current-state-2"]).attr("title", "");
                nu = "current-state-" + v
                rl.addClass(nu).attr("title", v == 1 ? "Reserved" : (v == 2 ? "Verify and Assign" : "Not Available"))
            }

            this.redrawHeader()
        },
        getSlotRecord:function(slotid){
            if(!this.slotstore){return}
             return this.slotstore.records.find(function(r){return r.slotid == slotid});
         },
        renderSlots: function () {
            if(!this.reservedate || !this.slotstore){return}
            var store = this.slotstore, gp = Number(this.slotgroup) || 0, dom = this.el
             var colors = [],statusfilter=this.statusfilter;

             store.filter((gp || statusfilter)? function (a) {
                 if(!gp || a.slotgroupid == gp) {
                     if(statusfilter) {
                         if (!a.reserve_num && (statusfilter == "notav"||statusfilter == "recent")) {
                             return false
                         }
                         if (a.reserve_num && statusfilter == "av") {
                             return false
                         }
                     }
                     return true
                 }
                return false
            } : "_clear_")

            if (this.slotGroupStore) {
                this.slotGroupStore.records.each(
                    function (rec) {
                        var k = rec.color;
                        if (!k) {
                            return
                        }
                        var csscolor = (k.length == 6 && /^[0-9A-F]+$/i.test(k)) ? ("#" + k) : k
                        try{
                            $d.css.addRule(".group-color-" + rec.id, "background-color:" + csscolor + ";")
                        } catch(e){
                            console.log("arror while adding rule",".group-color-" + rec.id, "background-color:" + csscolor + ";")
                        }

                    }
                )
            }
            if (!dom.q(".slot-list")) {
                dom.append("<div class='slot-list'></div>")
            }
            //for simplicity resolve template simplified
            //var vars=template.match(/\$\w+/g).map(function(a){return a.substr(1)}),ln=vars.length
            //if(!templatefn){templatefn=$.template(template)}
            var listel=dom.el.querySelector(".slot-list");
            if(listel ){
                var chk=listel.offsetHeight,el=listel

                var cntnt=store.getList().map(function(rec,idx){
                    //rec.index=idx;
                    //return templatefn(rec)
                    return template.replace(/\$(\w+)/g,function(a,b){return (b=="index"?idx:rec.get(b))||""})
                }).join("")
                el.innerHTML=cntnt||"";


el.classList.add("_rendered")
            }


            if (!this.reservedate) {
                this.reservedate = $.date(new Date())
            }
            if (!this.reservedateEnd) {
                this.reservedateEnd = $.date(+this.reservedate).plus("h",1)
            }
            this.redrawHeader()
            var ths = this

            $d.on(listel,"click.slot", function (ev) {
                    var dl = $d.selfOrUp(ev.target, ".parking-slot")
                var store = ths.slotstore
                    if (dl) {
                        var id = dl.domdata("key");
                        var rec = store.records.find(function(r){return r.slotid == id});
                        if (rec) {
                            var model=new SlotModel({record:rec,el:dl})
                            ths.slotClicked(model)
                        }
                    }
                /*var dl = $d.selfOrUp(ev.target, ".parking-slot")
                if (dl) {
                    var id = dl.domdata("key");
                    var rec = store.records.findById(id)
                    if (rec) {
                        if (rec.resstatus == 1) {
                            rec.resstatus = 2
                        }
                        else {
                            rec.resstatus = 1;
                        }
                        ths.redraw(rec)
                        //$.webSocket.dispatch("assignslot" ,{slotid:id,currentstate:rec.currentstate})
                    }
                }*/
            });
            if(this.current){
                this.selectSlot(this.current)
            }
            this.updateTs()

            this.observer.fireAsync("slotsrendered")

        },
        refreshGroupList: function (andredraw) {
            if (this.slotGroupStore) {
                var pr = this.slotGroupStore.load()
                if (andredraw) {
                    pr.then(function () {
                        this.renderSlots();
                    }.bind(this))
                }
            }
        },

        slotClicked:function(slotrec){
            this.fire("slotpointerselection",slotrec)
        },
        loadData:function(date,dateto,callback) {
            if(typeof(date)=="function"){callback=date;date=null;dateto=null;}
            if(date){this.reservedate = $.date(date);
                this.reservedateEnd =null;
            }
            dateto && (this.reservedateEnd = $.date(dateto));
            if (this.reservedate  && !this.reservedateEnd) {
                this.reservedateEnd=$.date(+this.reservedate).plus("h",1)
            }
            var pr=Promise.deferred();
            if (typeof(callback) != "function") {
                pr.then(callback);
            }
            if (this.slotstore && this.reservedate && this.reservedateEnd && this.facility_id){
                var ths=this,d1=+this.reservedate, d2=+this.reservedateEnd;
                this.slotstore.loadData(this.facility_id, +this.reservedate, +this.reservedateEnd).then(
                    function (store) {
                        if(store.records.length){
                            pr.resolve(store)
                            ths.last_refreshed=+(new Date())
                        } else{
                            pr.reject( )
                        }

                    }
                );
            } else {pr.reject( )}
            return pr
        },
        refreshView:function(){
            this.fire("refresh")
        },
        selectSlot:function(slotid){
            var rec=this.getSlotRecord(slotid)
            //if(rec){this.redraw(rec)}
            if(!this.el.q(".parking-slot")){return}
            this.el.qq(".parking-slot.selected").removeClass("selected")
            var sel=this.el.q(".parking-slot[data-key='"+slotid+"']")
            if(sel){sel.addClass("selected");
                var st=sel.el.parentNode.scrollTop,diff=sel.el.offsetTop-st
                if(diff < 0){
                    sel.el.parentNode.scrollTop = st + diff
                } else if(diff>sel.el.parentNode.clientHeight){
                    sel.el.parentNode.scrollTop = st + (diff-sel.el.parentNode.clientHeight)
                }

            }

        },
        setup: function (store,container) {
            if(store){
                this.slotstore = store
            }
            if(container && $d(container)){
                if(!$d(container).contains(this.el)){
                    this._issetup=null
                }

            }
            if(this._issetup){
                this.renderSlots();
                return;
            }
            store=this.slotstore;
            store.dataRecordPrototype.updateState = function (nustate) {
                if (nustate !== this._state) {
                    this.resstatus = nustate
                }
            }
            store.dataRecordPrototype.render = function (tmplate) {
                tmplate = tmplate || this.template
                if (tmplate) {
                    return tmplate(this)
                }
                return ""
            }
            var ths = this, slots = this.el
            store.on("data", function (ev) {
                if (ev.action == "value" && ev.record && ev.datarecord) {
                    if (ev.datarecord.name == "slot_status" || ev.datarecord.name == "resstatus") {
                        ths.redraw(ev.record)
                    }

                }
            });

            //store.records = store.records.chainable()

            this.onpropertychange("slotGroupStore", function (rec) {
                this.renderSlots()
            });
            this.properties.set("slotgroup", 0);
            this.onpropertychange("slotgroup", function (rec) {
                if (rec.oldValue == null) {
                    return
                }
                this.renderSlots()
            });


             app.getEntity("slot_group").then(function (ent) {
                var store = ent.createStore();
                   store.defaultCriteria = "facility_id=" + app.user.facility.id
                store.load().then(
                    function () {
                        ths.slotGroupStore = store;
                        ths.setGroupList()
                    }
                );

            });
            this._issetup=true;
            this.el.html(
                "<div class='slot-stats'>" +
                    "<div class='slot-stats-hdr'></div>" +

                    "<div class='slot-stats-filter'>" +
                        "<div class='status-list-wrap'>" +
                            "<span  class='status-item selected' data-key=''>All</span>" +
                            "<span  class='status-item status-item-av'  data-key='av'>Available</span>" +
                            "<span   data-key='notav' class='status-item status-item-notav'>Occupied</span>" +
                            "<span  class='status-item status-item-recent' data-key='recent'>Recent</span>" +
                        "</div>" +
                        "<div class='group-list-wrap'>Zone:<select class='group-list'></select></div>" +
                    "</div>" +
                    "<div  class='refresh-list'><span  class='refresh-list-icon'></span><span  class='refresh-list-message'>last refreshed<br/>just now ..</span></div>" +

                "</div>" +
                "<div class='slot-list'></div>"
            )
            if(container){
               $d.addClass(container,"slot-view")
               this.appendTo(container);
                 var statuslist=this.el.q(".status-list-wrap")
                  if(statuslist){
                        statuslist.on("click.statuslist",function(ev,el) {
                                 ths.statusfilter = el.domdata("key")
                            }
                        ,{selector:".status-item"})

                        this.el.q(".refresh-list").on("click.statuslist",function(ev) {
                            ths.refreshView();
                        })
                      this.el.qq(".top-right-cancel").on("click.cancel",function(ev) {
                          ths.observer.fire("cancelled");
                      })
                  }


            }
        }

    }
)
var cachedMap={}
SlotView.slotSelector=function(optns,callback){
    //time_from,time_to,facility_id,slotstore,curr_sel
    if(typeof(optns.callback)=="function"){callback=optns.callback}
    var slotView,id=optns.id||"slotselector"
    if(cachedMap[id]){
        slotView=cachedMap[id];
    } else{
        slotView=new SlotView();
        cachedMap[id]=slotView;
    }

    slotView.reservedate=optns.time_from;
    slotView.reservedateEnd=optns.time_to;
    slotView.facility_id= optns.facility_id;
    slotView.slotstore=optns.slotstore

    var curr=optns.current,selcallback=callback
    slotView.current=curr
    if(optns.container){
        var cntnr=optns.container
        slotView._container=cntnr;
        slotView.loadData().then(
            function(store){
                var dorender;
                slotView.setup(store,cntnr)
                slotView.show();
                slotView.el.css("height",cntnr.height()-10);
                //slotView.statusfilter="av"
                if(curr){
                    slotView.on("slotsrendered",function(){
                        this.selectSlot(curr)
                    },{once:true});
                }
            },
            function(){
                //rejected
            }
        )
    } else{
        slotView.on("slotsrendered",function(){
            this.selectSlot(curr)
        },{once:true});

        slotView.show();
    }
     slotView.on("slotpointerselection",selcallback,{once:true});

    return slotView;
}


module.exports=SlotView