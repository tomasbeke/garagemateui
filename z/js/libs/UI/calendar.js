var PopupView= $.require("PopupView");
    self.UI||(self.UI={}),

 UI.Calendar=(function CAL( ) {
    function getDateData(dt, opts) {
        var monthdate = $.date(dt) || $.date()
         var st = monthdate.trunc().clone(), currmonth = monthdate.month
        st.date = 1
        st.date -= st.day
        opts = opts || {}
         var filter = opts.dateFilter || function () { }
        var list=$.A.fill([],function(){
            var d = st.clone(),m=st.month;
             d.daytype=[
                (d.day == 0 || d.day == 6) ? "cal-weekend" : (m === currmonth ? "cal-weekday" : ""),
                filter(d) === false ? "cal-cell-disabled" : "",
                 m === currmonth ? "cal-currmonth" : (m < currmonth ? "cal-priormonth" : "cal-nextmonth"),
                (+st == +monthdate)?"cal-current-date":"",
            ].join(" ").trim()
            st.date++
            return d;
        },42)

        return {
            list:list,
            start:monthdate,
            currentdate:monthdate
        }
    }

    function buildContent(list, template) {
         var fin = []
        list.groupBy(function(a,i){return Math.floor(i/7)+1}).each(
            function(days,wk){
                fin.push(
                    "<div class='cal-week-row' data-key='" + wk + "'>",
                        days.map(template).join(""),
                    "</div>"
                )
            }
        )
         return fin
     }

    return function (dt, opts) {
        var options = opts || {}
        var hdrtemplate = $.simpleTemplate("<span  class='cal-cell-hdr' data-key='$day'>$ddd</span>"),
            template = $.simpleTemplate("<span  class='cal-week-cell $daytype' data-key='$long'><span class='cal-week-cell-label'>$dd</span></span>")

        var data=getDateData(dt, options)
        var hdrs = [
            "<div class='cal-label-hdr'>" ,
                "<span class='nav-link nav-prevyear'>&lt;&lt;</span><span class='nav-link nav-prevmonth'>&lt;</span>",
                "<span class='cal-labels'><div class='cal-month'>November</div><div class='cal-year'>2020</div></span>" ,
                "<span class='nav-link nav-nextyear'>&gt;&gt;</span><span class='nav-link nav-nextmonth'>&gt;</span>" ,
            "</div>",
            "<div class='cal-wkhdr'>" ,
                data.list.slice(0,7).map(hdrtemplate).join("") ,
            "</div>"
        ].join("")

        var pop, container=$d(options.container)
        if(!container){
            var popvw = $.require("PopupView");
            pop = new popvw($.extend({draggable: true, minWidth: 250, minHeight: 240,  resizable: true,offset:20,   title: options.title||"Calendar",anchor:options.ip||options.anchor},options.viewoptions||{}))
            container=pop.$content()
            pop.show()
        }
        var activeData={}
        function render(dt,datedata){
            if(datedata && !datedata.list){datedata=null}
            if(!datedata){
                datedata = getDateData(dt, options)
            }
            activeData=datedata;
            var cntnt=buildContent(activeData.list, template).join("")
            container.q(".cal-body").html(cntnt);
            container.q(".cal-month").html(activeData.start.mmm);
            container.q(".cal-year").html(activeData.start.yyyy);
            pop && pop.layout();
        }
        container.html( hdrs + "<div class='cal-body'></div>")
        container.q(".cal-label-hdr").on("click", function (ev, el) {
            if (el) {
                var nudate,curr=activeData.start
                if(!curr){return}
                nudate=curr.clone()
                 if(el.is(".nav-nextyear")){
                     nudate.year++;
                 } else if(el.is(".nav-prevyear")){
                     nudate.year--;
                 } else if(el.is(".nav-prevmonth")){
                     nudate.month--;
                 } else if(el.is(".nav-nextmonth")){
                     nudate.month++;
                 }else{
                     return
                 }
                render(nudate)
             }
        }, ".nav-link")
        container.q(".cal-body").on("click", function (ev, el) {
             if(opts.onselect){
                opts.onselect($.date(+el.domdata("key")))
            }

        }, ".cal-week-cell:not(.cal-cell-disabled)")
        render(dt,data)
        return {
            view:pop,
            container:container,
            hide:function(){
                pop?pop.hide():container.hide()
            },
            show:function(){  pop?pop.show():container.show() },
            render:function(dt){
                this.show();  render(dt);
                return this
            }
        }
    }
})();

module.exports=UI.Calendar