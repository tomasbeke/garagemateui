var DATEFORMAT="ddd, mmm dd yyyy"
var crit=$.template("facility_id=$facid and computed_end_long>=$st and computed_start_long<=$end")
var ReserveModel=$.require("models/ReserveModel")
var ReserveCardView=$.require("common/ReserveCardView")
var storeSlotReserve=null,storeSlots=null,busy= 0,hrflds=[],ready= 0,pending=null,confirmVw=null;
var FILTERONDRAG=false
function loadStore(dt ,callback) {
    var d = $.date(dt).trunc();
    var end = d.clone().plus("d", 1)
    storeSlotReserve.clear();
    storeSlotReserve.load({criteria:crit(app.user.facility.id, +d, +end)}).then(function (a) {
         callback(d, storeSlotReserve)
    });
}
function syncStore(){
    var fldkeys=hrflds,fldkeysln=fldkeys.length;
    var gpd=storeSlotReserve.groupBy("slotid")


    storeSlots.each(
        function(slot){//slot._state="reset"
            for(var i= 0;i<fldkeysln;i++){
                slot.set(fldkeys[i],null,true);
            }
            var l=gpd.get(slot.id+"");
            if(l){
                l.forEach(function(rec){
                    if(!rec.slotkey ){return}
                    // var ky="h_"+rec.hrs+(rec.mins?("_"+rec.mins):"")//,dur=rec.get("actual_duration")||rec.get("scheduled_duration")||1
                    slot.set(rec.slotkey,rec)

                })
            } else{

            }

        }
    );
}
function refreshStore(dt ,callback){
     if(!storeSlotReserve ){return}
    loadStore(dt,function(d,store){
            syncStore()
            callback(d)
        })
}
var refreshStore_throttled=$.throttle(refreshStore)
function buildHeader(strtdate) {
    var weeks=[
        "<div class='header-wrap'>" ,
        // "<div class='scroller'>"+scrollerhtml+"<div class='scroller-date-selector'><div class='left'></div><div class='right'></div><div class='middle'></div></div></div>",
        "<div class='day-lbl'><span class='prev-date'>&lt;</span><span class='date-lbl'>"+$.date.format(strtdate,DATEFORMAT)+"</span><span class='next-date'>&gt;</span></div>",
         "<div class='day-slots-opts'><span class='refresh-link ui-button small'>Refresh</span><span class='slot-filter-label'>Show only</span><span class='slot-filter only-av'>Available</span><span class='slot-filter only-occupied'>Occupied</span><div class='slot-filter-message'></div></div>",
        "<span class='slot-name-ph slot-name'>Slot</span><span class='day-hdr-wrap'><span class='day-hdr day-gradient'>"

    ]
    var hours=List.create(23,function(a){var h=(a+1);
        return  "<span class='slot hr'    data-key='"+h+"'>"   +   h+"</span>" +
                "<span class='slot qtr'   data-key='"+(h+"_15")+"'>15</span>" +
                "<span class='slot  half' data-key='"+(h+"_30")+"'>30</span>" +
                "<span class='slot  qtr2' data-key='"+(h+"_45")+"'>45</span>"}).join("");
    weeks.push(hours,"",
        "</span>", "</span>",
        "<div class='header-spanner'><div class='header-spanner-stub'><div class='header-spanner-stub-left'></div><div class='header-spanner-stub-message'></div><div class='header-spanner-stub-right'></div></div></div>",
       "</div>"
    )
    return weeks.join("")
}

function buildView(strtdate  ) {

    var rows=[], ln=hrflds.length;
     storeSlots.each(
        function(a){var sid=a.id;

            var cells=["<div class='slot-row"+(a.currentstate==2?" notav":"") +"' data-slot='"+ sid +"'><span  class='slot-name'>"+ (a.name||("slot "+ sid)) +"</span>"]
            for(var i=0;i<ln;i++){
                var k=hrflds[i],v= a.get(k),kls="slot"+(k.length<=4?" hr":"")
                if(v && v.get){
                    var dur=v.get("actual_duration")||v.get("scheduled_duration")|| 1,status=v.get("resstatus")
                    if(typeof(dur)!="number" || !(dur>0) ){dur=1}
                    var span=dur*4
                         var wd=100*span,ml=dur*2;
                        kls=kls+(status==1?" isconfirmed":" isreserved")

                        cells.push("<span id='id_"+(sid+"_"+k)+"' class='isoccupied "+kls+"' data-key='"+k+"'><div class='slot-content' style='width:"+wd+"%;padding:0 "+dur+"px;'></div></span>")
                    if(span>1){
                        for(var ii=1;ii<span;ii++){
                            if(i+1>= ln-1){break;}
                            i++;
                            var k1=hrflds[i]
                            cells.push("<span id='id_"+(sid+"_"+k1)+"' class='slot isoccupied' data-key='"+k+"'><div class='slot-content'></div></span>")
                        }
                    }
                        continue;

                }
               cells.push("<span id='id_"+(sid+"_"+k)+"' class='"+kls+"' data-key='"+k+"'><div class='slot-content'></div></span>")



            }
            cells.push("</div>")

            rows.push(cells.join(""))
        }
    );

    return rows.join("")

}
function afterLoad(stdt){
    this.config.header.q(".date-lbl").html($.date(this.config.date).format(DATEFORMAT))

    var dayhdr=this.config.dom.q(".day-hdr"),rowset=this.config.rowset
    this.config.dom.removeClass("loading")
    rowset.css({width:(dayhdr.offsetWidth+dayhdr.parent().offsetLeft )})
    //rowset.parent().css({height:$.viewport.height - (rowset.bounds().top+10) })


    if(!this.config.scroll){
        app.setScroll(false);
         this.config.scroll=this.setupScroll();
         this.config.scroll.setup();
    }
 }
var capacityview={
    config:{},
    setupScroll:function(){
        var view=this;
        var hscroll,vscroll,slotwd=null,slotht=null,horscrollinner=null,vertscrollinner=null,horscroll=null,vertscroll=null,rowset,rowsetwrp,scrollwrapwd=0,
            dom,leftOffset=0,topOffset= 0,
            scrollQu={
            left:null,top:null,p:0,maxw:0
        }
        function resetDims(){
            var  ht=$.viewport.height-(topOffset );
            rowsetwrp.css("height",ht)
            horscroll.css({ width:($.viewport.width-( leftOffset))})
            horscrollinner.css({width:rowset.scrollWidth})
            vertscrollinner.el.style.height=rowset.scrollHeight+"px"
            vertscroll.css({ height:ht})
             scrollQu.maxw=rowset.scrollWidth-(rowsetwrp.offsetWidth -10)
         }
        function setup(){
            dom=view.config.dom
            rowset = dom.q(".row-set");
            var scrollwrap=dom.q(".slot-name-wrap")
                rowsetwrp = dom.q(".row-set-wrap");
            horscroll=rowset.after("<div class='hor-scroll'></div>")
            vertscroll=rowset.after("<div  class='ver-scroll'></div>")
            scrollwrapwd=scrollwrap.width()
            horscroll.css({position:"absolute",left:scrollwrapwd,width:dom.clientWidth-scrollwrapwd,bottom:0,height:18,bg:"#efefef",overflowX:"auto"})
            var ht=dom.clientHeight - rowsetwrp.offsetTop
            vertscroll.css({position:"absolute",right:0,width:18,top:0,height:ht-20,bg:"#efefef",overflowY:"auto"})
            rowsetwrp.css({height:ht  })
            horscrollinner=horscroll.insert("<div>").css("h",1)
            vertscrollinner=vertscroll.insert("<div>")

            vertscrollinner.addClass("ver-scroll-inner")
            var bounds=rowset.bounds()
            leftOffset=bounds.left+scrollwrapwd
            topOffset=bounds.top
            setTimeout(function(){
                resetDims();

            },100)
            resetDims();

            var dayhdr=dom.q(".day-hdr"),spanner=$d(".header-spanner")

            function _apply(){
                if(scrollQu.left!=null) {
                    var l=scrollQu.left;scrollQu.left=null
                    l=Math.max(0,Math.min(scrollQu.maxw||l,l))
                     //scrollwrap.css("left", l)
                    if (dayhdr) {
                        dayhdr.css("marginLeft", 0 - l)
                    }
                    rowset.css("marginLeft",0 - l)
                    if (spanner) {
                        var trgt = $d(spanner.data("_target"))
                        if (trgt) {
                            var l1 = trgt.bounds().left   - (spanner.parent().bounds().left+scrollwrap.offsetWidth)
                            spanner.css("left", l1)
                        }
                    }

                }
                if(scrollQu.top!=null) {
                    var l=scrollQu.top;scrollQu.top=null
                    rowset.css("marginTop",0 - l)
                    scrollwrap.scrollTop=l
                }
                scrollQu.p=0
            };
            hscroll=function hscroll(l){
                if(slotwd===null){
                    slotwd=rowset.q(".slot").width()
                    var x = scrollQu.maxw+slotwd
                    scrollQu.maxw=x-(x%slotwd)
                }
                var diff=Math.floor(l%slotwd);
                l=l-diff

                if(!scrollwrap){
                    scrollwrap=dom.q(".slot-name-wrap")
                    if(scrollwrap){
                        scrollwrap.css("h",rowset.scrollHeight)
                    }
                }

                scrollQu.left=l
                if(!scrollQu.p){
                    scrollQu.p=1
                    $d.util.animframe(_apply);
                }
            }


            vscroll=function vScroll(scrollTop){
                if(slotht===null){
                    slotht=rowset.q(".slot").height()
                }
                if(scrollTop<=slotht){
                    scrollQu.top=0
                }
                else {
                    var diff = Math.floor((scrollTop + slotht) % slotht);
                    scrollQu.top = Math.max(0, (scrollTop + slotht) - diff)
                }
                if(!scrollQu.p){
                    scrollQu.p=1
                    $d.util.animframe(_apply);
                }
            }
            vertscroll.on("scroll",function(){ vscroll(this.scrollTop) });
            horscroll.on("scroll",function(){ hscroll(this.scrollLeft)});

            rowsetwrp.on("wheel",function(event){
                var deltaY=event.wheelDeltaY||event.deltaY
                 if(deltaY){
                     if(slotht===null){
                         slotht=rowset.q(".slot").height()
                     }
                    vertscroll.scrollTop=vertscroll.scrollTop+(slotht*10*(deltaY>0?-1:1))
                 }
            });
             $.viewport.on(resetDims)
        }
        return {
            setup:setup ,
            reset:function(){

            },
            scrollToRow:function(rowid){
                if(rowid) {
                    var trgt = view.config.dom.q(".slot[data-slot='" + rowid + "']")
                }
            },
            scrollToSlot:function(slotkey){
                if(slotkey){
                    var trgt=view.config.dayhdr.q(".slot[data-key='"+slotkey+"']")
                    if(trgt){
                        var b=trgt.bounds()
                        var left=Math.max(leftOffset,trgt.bounds().right-leftOffset)
                        if(left>0){
                            hscroll(left)
                        }
                    }
                }
            },
            scrollTo:function(x,y){
                if(x>0 ){
                    if(x>horscroll.offsetWidth){horscroll.el.scrollLeft=x}
                    else{horscroll.el.scrollLeft=0}

                }
                if(y){
                    vscroll(y)
                }
            },

            resetDims:resetDims
        }
    },
    redraw:function(sync){
        if(sync===true){
            syncStore();
        }
        var start=$.date(this.config.date),stdt=Date.now(),b=this.config.dom.bounds(),spanner=$d(".header-spanner"),rowset=this.config.rowset

        $d.html(this.config.rowset, buildView(start));
         var hrdom=this.config.dayhdr.q(".hr"),hrwd=20,top=0
        if(hrdom.next(".hr")) {
            hrwd = hrdom.next(".hr").offsetLeft - hrdom.offsetLeft
        }
        top = (this.config.dayhdr.bounds().top - b.top) - 10
        spanner.css({"visibility":"visible","top":top,
            "height":this.config.dom.height()-top,"width":hrwd})
        var slotkey,slotkeyend,trgt =$d(spanner.data("_target"))
        if(!trgt){
            var now=new Date()
            var mins = now.getMinutes(), hr = now.getHours()
            if (mins % 15) {
                if (mins > 40) {       mins = 45  }
                else if (mins > 25) {    mins = 30       }
                else if (mins > 10) {     mins = 15      }
                else {            mins = 0   }
            }
            slotkey =  hr+(mins?("_"+mins):"")
            slotkeyend=(hr+1)+(mins?("_"+mins):"")
            trgt=this.config.dayhdr.q(".slot[data-key='"+slotkey+"']")
        } else{
            slotkey =  $d.domdata(trgt,"key")
            slotkeyend =  $d.data(spanner,"_slotend")
        }
         this.config.range={start:slotkey,end:slotkeyend}

        var ht=this.config.dayhdr.parent().offsetTop+this.config.dayhdr.parent().offsetHeight
        if(this.config.header){
            this.config.header.css("h",ht)
        }
        if(trgt){
            if(slotkeyend){
                var trgtEnd=this.config.dayhdr.q(".slot[data-key='"+slotkeyend+"']")
                if(trgtEnd){
                    spanner.css("width",trgtEnd.offsetLeft - trgt.offsetLeft)
                }
            }
             spanner.data("_target",trgt.id)
            spanner.data("_slotend",slotkeyend)
            var hdrwrap=spanner.parent();
            var l=trgt.bounds().left-hdrwrap.bounds().left
             spanner.css("left",l)
            var slotnameph=this.config.dom.q(".slot-name-ph")
             if(this.config.scroll){
                this.config.scroll.scrollTo(l-(slotnameph?slotnameph.offsetWidth:0) )
            }

        } else{

        }
        afterLoad.call(this,stdt)
        setTimeout(function(spanner){
            spanner.css({"height":this.config.dom.height()-(spanner.bounds().top - this.config.dom.bounds().top)})
            this.filterRange();
            var slotnameph=this.config.dom.q(".slot-name-ph")
            if(this.config.scroll){
                 this.config.scroll.scrollTo(spanner.offsetLeft-(slotnameph?slotnameph.offsetWidth:0) )
            }
        }.bind(this,spanner,b),1000)

    },
    getStore:function(){
      return storeSlotReserve
    },
    updateSlot:function(data){
        if(!(storeSlots && storeSlotReserve)){return}
        data=data.data||data
        var st,store=storeSlotReserve
        if(data.st||data.computed_start_long){
            st=String(data.st||data.computed_start_long).replace(/\d{3}$/, "000")
        }
 var slot,slotkey
        if(st && store){
            var rec=store.findById(data.id)
            if(!rec){
                rec=store.find(function(rec){return String(rec.computed_start_long)==st})
            }
            if(!rec) {
                rec = store.addRecord(data)
             }
            if(rec) {
                if($.isPlain(data)){
                    rec.update(data);
                }
                slot = rec.get("slotid"), slotkey = rec.get("slotkey") || rec.slotkey
                if (slot && slotkey) {
                    var slotrec = storeSlots.findById(slot)
                    if (slotrec) {
                        slotrec.set(slotkey, rec)
                    }
                }
            }

            if(!(rec && slot && slotkey && this.config.dom && $d.isVisible(this.config.dom))){return}

                        var id="id_"+slot+"_"+slotkey,el=document.getElementById(id),status=rec.get("resstatus");
                        var kls=(status==1?"isconfirmed":"isreserved")
                        if(el){
                            $d.removeClass(el,["isconfirmed","isreserved"]).addClass( [kls,"isoccupied"]);
                            var dur=rec.get("actual_duration")||rec.get("scheduled_duration")||1
                            if(typeof(dur)!="number" || !(dur>0) ){dur=1}
                            var span=dur*4

                            var rec=100*span,ml=dur*2;
                            $d.css(el.firstElementChild,{"width":(span*100)+"%",marginLeft:ml+"px"});
                            if(span>1){var nxtall=$d.nextAll(el,".slot")
                                for(var ii=1;ii<span;ii++){
                                    if(!nxtall.length){break;}
                                    var nxt=nxtall.shift();
                                    if(nxt.hasClass("isoccupied")){nxt.addClass("isconflict")}
                                    nxt.addClass("isoccupied").domdata("key",slotkey)

                                }
                            }
                        } else{  }

                    }



    },
    init:function(dom){
        ready=-1;
        this.config.dom=dom;
        var flds1={
            id:{type:"number"},
            slotname:{type:"string"},
            loc:{type:"string"},
            currentstate:{type:"number"}
            }
        List.create(23,function(a){var i=a +1;hrflds.push("h_"+i,"h_"+i+"_15","h_"+i+"_30","h_"+i+"_45")});
        hrflds.forEach(function(a){flds1[a]={type:"object"}})
        app.getEntity("facility_reserveusers").then(
            function(e){
                 storeSlotReserve=e.createStore(true);
                storeSlotReserve.StoreRecordProto.addExpr("reserveDate",function(rec){
                    return $.date.format(rec.get("date_from"),"mmm dd, yyyy")
                })
                storeSlotReserve.StoreRecordProto.addExpr("reserveTime",function(rec){
                    return $.date.format(rec.get("time_from"),"hh:nn tt")
                })

                storeSlotReserve.StoreRecordProto.addExpr("slotkey",function(rec){
                    if(!rec || !rec.__record__){return null}
                    rec.__temp||(rec.__temp={});
                    var dt,st,slotkey=rec.__temp.slotkey
                   // if(slotkey!=null){return slotkey}

                        dt= rec.get("computed_start_long")
                        if(!dt){return rec.__temp.slotkey }
                        st = new Date(+dt)
                        if (st) {
                            var mins = st.getMinutes(), hr = st.getHours()
                            if (mins % 15) {
                                if (mins > 40) {       mins = 45  }
                                else if (mins > 25) {    mins = 30       }
                                else if (mins > 10) {     mins = 15      }
                                else {            mins = 0   }
                            }
                            rec.__temp.mins = mins;
                            rec.__temp.hrs = hr;
                            slotkey = "h_"+hr+(mins?("_"+mins):"")
                        }

                     return rec.__temp.slotkey= slotkey
                })
                storeSlotReserve.pager.pagesize=-1
             }
        );
        var ent=Data.defineLocalEntity("allslotshrs",flds1)
          storeSlots=ent.createStore(true);

                this.refreshSlots().then(
                    function(){ ready=1;
                        if(pending && pending.length){
                            capacityview.build.apply(capacityview,pending.slice())

                        }
                        pending=null;
                    }
                )


    },
    refreshSlots:function(){
        var pr=Promise.deferred();
        app.remoteDirective("slots",{type: "slots", facility_id:app.user.facility.id }, function (a) {
            var data=a;
            if(data.data){data= data.data}
            if(data && data.items){storeSlots.clear();
                storeSlots.addAll(data.items.map(function(it){return {id:it.id,slotname:it.name,loc:it.location,currentstate:it.currentstate}}))
            }
            pr.resolve()

        });
        return pr
    },
    filterRange:function(){
        if(this.config.allvis==null){this.config.allvis=true;}
        var start,end,occupied=-1,slots
        if(this.config.range && this.config.range.start && this.config.range.end) {
            var date = $.date(this.config.date)
            var start = date.clone().trunc(), end = date.clone().trunc()
            var arr = String(this.config.range.start).split(/_/)
            if (arr[0]) {
                start.setHours(+arr.shift())
                if (arr[0]) {
                    start.setMinutes(+arr.shift())
                }
            }
            arr = String(this.config.range.end).split(/_/)
            if (arr[0]) {
                end.setHours(+arr.shift())
                if (arr[0]) {
                    end.setMinutes(+arr.shift())
                }
            }
            var startnum= (+start)
            var endnum= (+end)
            slots=storeSlotReserve.findAll(function(r){
                return  r.computed_end_long > startnum+1 && r.computed_start_long < endnum-1;
            }).collect("slotid").sortBy(Number);
            occupied=slots.length
        }
        if(slots && this.config.filter){


            var tohide=[], onlyav=this.config.filter=="av"
            var rowset = this.config.dom.q(".row-set")
            var all1 = this.config.dom.qq(".slot-name-wrap .slot-name")
              //computed_start_long,computed_end_long
            if(occupied>0) {
                 rowset.hide()
                var all = rowset.qq(".slot-row");
                rowset.removeClass("filtered-view")
                tohide = all.filter(function (a,i) {
                    var idx = slots.indexOf(Number(a.domdata("slot")));
                    a._index=i
                    if (onlyav) {
                        return idx >= 0
                    }
                    return idx < 0
                });
            }
            if(!this.config.allvis ){
                for(var i= 0,l=this.config.dom.qq(".filtered-row"),ln=l.length;i<ln;i++){
                    l[i].el.classList.remove("filtered-row")

                    //all[i].el.style.display=""
                }

                this.config.allvis=true
            }

            if(tohide.length){
                for(var i= 0,ln=tohide.length;i<ln;i++){
                    tohide[i].el.classList.add("filtered-row")
                    var wrap=all1[tohide[i]._index]
                     if(wrap){wrap.el.classList.add("filtered-row")}

                    //tohide[i].el.style.display="none"
                }
                this.config.allvis=false
            }
             rowset.addClass("filtered-view").show()


        } else if(!this.config.allvis){
            for(var i= 0,l=this.config.dom.qq(".filtered-row"),ln=l.length;i<ln;i++){
                l[i].el.classList.remove("filtered-row")
             }
             this.config.allvis=true
        }
        var stub=this.config.dom.q(".header-spanner-stub-message")
        var all=this.config.dom.qq(".row-set .slot-row").length
        if(stub){
            if(occupied<=0){stub.html("")}
            else{var rest=this.config.filter=="av"?(all-occupied):occupied
                stub.html(rest + " / "+ all)
            }
        }
        var msg=this.config.dom.q(".slot-filter-message")
        if(msg){var m=[]
            if(start){m.push($.date.format(start,"hh:nn tt"),"to",$.date.format(end,"hh:nn")+",")}
            if(occupied>=0){m.push("occupied",occupied," of ");}
            m.push(all);
            msg.html(m.join(" "))
        }
        if(this.config.scroll){
            this.config.scroll.resetDims()
        }

    },
    hoverSlot:function(slot,rem) {
        var rs=$d.up(slot,".row-set"),has=$d.hasClass(slot,"hover-slot")
        if(rs && rs.hasClass("dragging-slot") && rem!==false){return}
        if(!rs){return}
        var row=$d.parent(slot),id=$d(slot).id;
        if(rem===false){
            if(rs.data("_priorslot")!==$d.domdata(slot,"key")){
                rs.qq(".hover-slot").each(function(a){$d.removeClass(a,"hover-slot")})
            }

            rs.qq(".hover").each(function(a){$d.removeClass(a,"hover")})
        }
        if(!rem){
            if(!has){
                rs.qq(".slot:nth-child("+($d.at(slot)+1)+")").each(function(a){$d.addClass(a,"hover-slot")})
            }
            if(row) {
                if (!row.hasClass("hover")) {
                    row.addClass("hover")
                    $d.addClass(this.config.slotnamewrap.q(".slot-name[data-slot='" + row.domdata("slot") + "']"), "hover")
                 }

            }
        }

        if(rem ){
            if(has){
                rs.qq(".slot:nth-child("+($d.at(slot)+1)+")").each(function(a){$d.removeClass(a,"hover-slot")})
            }
            if(row){
                if(row.hasClass("hover")) {
                    row.removeClass("hover")
                    $d.removeClass(this.config.slotnamewrap.q(".slot-name[data-slot='" + row.domdata("slot") + "']"), "hover")
                }
            }
        }
        rs.data("_priorslot",$d.domdata(slot,"key"))
        rs.data("_prior",id)

    },
    build:function(start,norefresh) {
        if (ready !== 1) {
            pending = [start, norefresh]
            if (!ready) {
                this.init();
            }
            return;
        }
        var startdate = start?$.date(start).trunc():this.config.date
        var dom = this.config.dom, isnu;

        this.config.date = startdate;
        if (!this.config.rowset) {
            isnu = true
            dom.addClass("noselection")
            dom.html(buildHeader(startdate) + "<div class='row-set-wrap'><div class='row-set'></div><div class='slot-name-wrap'></div></div><div class='loading-msg'>Loading ..</div>")

            dom.q(".refresh-link").on("click",function(ev) {
                this.refreshSlots().then(this.build.bind(this))
            }.bind(this));
            dom.q(".only-occupied").on("click",function(ev) {var el=$d(ev.target)
                if(el.is(".selected")){el.removeClass("selected");this.config.filter="";}
                else {
                    el.parent().st(".selected").removeClass("selected")
                    el.addClass("selected")
                    this.config.filter = "occupied";
                }
                this.filterRange()
            }.bind(this))
            dom.q(".only-av").on("click",function(ev) {var el=$d(ev.target)
                if(el.is(".selected")){el.removeClass("selected");this.config.filter="";}
                else {
                    el.parent().st(".selected").removeClass("selected")
                    el.addClass("selected")
                    this.config.filter = "av";
                }
                this.filterRange()
            }.bind(this))
            this.config.rowset = dom.q(".row-set");
            this.config.header = dom.q(".header-wrap");
            var slotnamewraphtml= storeSlots.collect(function(a){return "<span  class='slot-name' data-slot='"+a.id+"'>"+ (a.name||("slot "+ a.id)) +"</span>"})
            this.config.slotnamewrap=dom.q(".slot-name-wrap");
            this.config.slotnamewrap.html(slotnamewraphtml.join(""))

            $d.hover(this.config.rowset,function(a,slot){
                this.hoverSlot(slot)
            }.bind(this),function(a,slot){
                this.hoverSlot(slot,true)
            }.bind(this),".slot")

         }
        if (this.config.rowset) {
            this.config.dom.addClass("loading")
            this.config.header.q(".date-lbl").html("loading ...")
            if(norefresh===true){
                this.redraw();
            }
            else {

                refreshStore(this.config.date, this.redraw.bind(this))

            }
            if (!isnu) {
                return;
            }
        }
        //$d.fillContainer(dom);
        var rowset = dom.q(".row-set");
        var dayhdr = dom.q(".day-hdr")
        this.config.dayhdr = dayhdr;
        this.config.header.q(".next-date").on("click", function () {
            this.build(this.config.date.clone().plus("d", 1))
        }.bind(this))
        this.config.header.q(".prev-date").on("click", function () {
            this.build(this.config.date.clone().plus("d", -1))
        }.bind(this))
        this.config.header.q(".date-lbl").on("click", function (ev) {
            var el = $d.selfOrUp(ev.target, ".date-lbl"), date = this.config.date, ths = this;
            $.require("UI.Calendar", function (cal) {
                    var model = cal(null, {
                        ip: el,
                        onselect: function (k, lbl) {
                            ths.build($.date(k))
                             model.view.hide()
                        }
                    } )
                    model.render(date)
                }
            )
        }.bind(this))
        function findSlot(dragel) {
            var b=dragel.bounds(),pt= {x:b.left+4,y: b.top+5};
            dragel.el.style.display = "none"

            var el = document.elementFromPoint(pt.x, pt.y)
            if (el && $d.selfOrUp(el, ".slot-row")) {
                el = $d.selfOrUp(el, ".slot")
            }
            dragel.el.style.display = ""

            return el;
        };
        function dragSlot(ev,trgt,resrec,slotrec,offset) {
            var target = trgt.clone(true).css({cursor: "move",borderLeft:"none",borderLeftStyle:"none",marginLeft:0}).addClass("slot-clone"), prev=null,ths=this;
            trgt.before(target)
              $d.absolutize(target)
            trgt.parent().append(target)
            target.toFront( );
             trgt.hide()
            var rowset=trgt.up(".row-set")
            var tr = $d.trackMouse(), stw = target.offsetLeft, sth = target.offsetTop,prev=null,initoffset=offset;
            $d.on(target,"mousedown",function(){
                $d.trackMouse(
                     {target:target,
                        start: function (memo) {
                            if(rowset){rowset.addClass("dragging-slot")}
                            target.css("outline","1px solid blue")
                        },
                        move: function (memo) {
                            var el = findSlot(target, ev.data.point) || prev
                            if(el){ths.hoverSlot(el,false)}

                        },
                    end: function (memo) {
                        $d.css(target,"outline",null)
                        var resrec=this.record,target=this.target,trgt=this.orig,wd = target.scrollWidth
                        var el = findSlot(target, memo.pos) || prev
                        target.remove();
                        trgt.show( )
                        prev = null;
                        if(rowset){rowset.removeClass("dragging-slot")}
                        if (!el) {
                            return
                        }
                        el.style.backgroundColor = "transparent"
                        if ((el && el != trgt)) {
                             trgt.removeClass(["isreserved", "isconfirmed"]).css("width", null)
                             if ($d.q(el, ".slot-content")) {
                                  var dt= $.date(resrec.get("computed_start_long"))
                                 dt.trunc();
                                 var orig=resrec.slotkey,hr=el.domdata("key").split(/_/).map(Number),nuslot=$d.up(el, ".slot-row").domdata("slot")
                                 hr.shift()
                                 dt.hours=hr.shift()||0
                                 dt.minutes=hr.shift()||0
                                  var upd={
                                     slotid:nuslot,
                                     computed_start_long:+dt,
                                     time_from:dt
                                 }
                                 var slotrec = storeSlots.findById(resrec.slotid)
                                 if(slotrec){slotrec.set(orig,null)}

                                 resrec.__temp=null;
                                 resrec.update(upd);
                                 slotrec = storeSlots.findById(nuslot)
                                 if(slotrec){slotrec.set(resrec.slotkey,resrec)}
                                   //syncStore()

                                 capacityview.build(null,true)
                                  return
                                $.webSocket.dispatch("slotalloc", {
                                    slotid: resrec.slotid,
                                    st: trgt.domdata("key"),
                                    reserve_id: resrec.id,
                                    remove: true
                                })
                                $.webSocket.dispatch("slotalloc", {
                                    slotid: $d.up(el, ".slot-row").domdata("slot"),
                                    st: $d.domdata(el, "key"),
                                    reserve_num: resrec.reserve_num,
                                    reserve_id: resrec.id
                                })
                            }
                        }
                        //
                    }.bind({record:resrec,target:target,orig:trgt}),
                    applyElPos:true,
                     }   

                )    
            })
            
               
          }
        function showCard(trgt,slotrec) {
            ReserveCardView.show(
                {anchor:trgt,record:slotrec,id:"capacityvw",actions:{
                  "Confirm Slot":function () {
                      this.resstatus = 1;
                       app.remoteDirective("assignslot", {
                          slotid: this.reserveSlot.id,
                          reserve_num: this.reservenum,
                          reserve_id: this.reserve_id
                      },function(ev){
                           capacityview.updateSlot(ev.data)
                       })

                      this.containerVw.hide()
                  }
                }}
            )

          }
        var ths=this
        dom.on("mousedown", function (ev) {
            var trgt
            if ($d.selfOrUp(ev.target, ".slot-row")) {
                var row = $d.selfOrUp(ev.target, ".slot-row");
                var slot = row.domdata("slot")
                if (trgt = $d.selfOrUp(ev.target, ".slot-content")) {
                    ev.stopPropagation();
                    var slotcell = trgt.parent()
                    if (slotcell.is(".isoccupied")) {
                        if (!slotcell.is(".isreserved,.isconfirmed")) {
                            slotcell = slotcell.prev(".isreserved,.isconfirmed")
                        }
                        if (slotcell) {
                            trgt = slotcell.down(".slot-content") || trgt
                        }
                        var ky = trgt.parent().domdata("key")
                        if (ky && slot) {
                            var resrec=storeSlotReserve.find(function(r){return r.slotkey==ky && r.slotid==slot})
                            if(!resrec){return}
                            var slotrec = storeSlots.findById(slot),pos=$d.mousePos(ev)
                             $d.holdMouse(500,
                                 function () {
                                     dragSlot.call(ths,ev,slotcell,resrec,slotrec,pos)
                                 },
                               function () {showCard(trgt,resrec,slotrec)  },
                               true
                            );
                                //var slotrec=storeSlotReserve.find(function(r){return r.slotkey==ky})

                        }
                    }
                 }
            }

        });

        dom.q(".header-spanner-stub").on("mousedown", function (ev) {
            var target = this.parent(),taegerdir
            if($d.is(ev.target,".header-spanner-stub-left")){taegerdir="left"}
            else if($d.is(ev.target,".header-spanner-stub-right")){taegerdir="right"}

            var    stw = target.offsetLeft,max=target.parent().width()-target.offsetWidth;
            if(taegerdir=="right"){stw= target.offsetWidth}
            if($d.is(ev.target,".header-spanner-stub-left")){taegerdir="left"}
            else if($d.is(ev.target,".header-spanner-stub-right")){taegerdir="right"}
            var spans=List.from(target.parent().st(".slot").collect(function(el){return [el.id,el.offsetLeft]})),
                offset=target.parent().q(".day-hdr-wrap").offsetLeft

            var cachedwd= target.offsetWidth
            var qu={el:null,pos:null,pending:null}
                function _filter(){
                    if(!target || !target.el){return}
                    var nu=target.el.offsetLeft - offset
                    var left=spans.min(function(e){return Math.abs(e[1]-nu)  })

                    nu=nu+target.width()
                    var right=spans.min(function(e){return Math.abs(e[1]-nu)  })


                    if(left && right){
                        ths.config.range={start:$d.domdata(left[0],"key"),end:$d.domdata(right[0],"key")}
                        target.data("_slotend",$d.domdata(right[0],"key"))
                    }
                    ths.filterRange();
                }
            $d.trackMouse(
                {target:target,
                    start: function (ev) {  target.css("outline","1px solid blue")},
                    move: function (ev) {
                        var nu=stw+ev.delta.x - offset;
                         if(nu<1){nu=0}
                        if(nu>max){nu=max}
                         var closest=spans.min(function(e){return Math.abs(e[1]-nu)  })
                        if(!closest || qu.el===closest[0]){return}
                        qu.el=closest[0];
                        qu.pos=closest[1]+offset
                        if(qu.pending){return}
                        qu.pending=1
                        $d.util.animframe(function(){
                            if(qu.pos==null){return}
                            if(taegerdir==="right"){

                                target.el.style.width=  (qu.pos)+"px"
                            } else{
                                if(taegerdir==="left"){
                                    var lft=target.el.offsetLeft,curr=lft+target.el.offsetWidth
                                    target.el.style.left = (qu.pos)+"px";
                                    var wd=curr-target.el.offsetLeft;
                                    if(wd>10){
                                        target.el.style.width = wd+"px";
                                    }

                                }
                                else{target.el.style.left=qu.pos+"px"}
                                target.data("_target",qu.el)


                            }

                            qu.pending=null;
                            FILTERONDRAG && _filter()
                        });
                    },
                    end: function (ev) {
                        target.css("outline",null)
                        _filter()
                        //
                    }
                }
            )
             
        });

    }
 }
module.exports=capacityview
