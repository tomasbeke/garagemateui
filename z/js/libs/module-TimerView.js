var SimpleView= $.require("SimpleView")
var TimerView = Klass(SimpleView,{
    startTime:null,
    endTime:null,
    running:null,
    formattedValue:null,
    intervaltimer:null,
    interval:null,
    inc:null,
     viewContent:null,
    incUnit:null,
    asStopWatch:null,
     asCountDown:null,
    format:null,
    init:function () {
        this.initView()
        if(!this.format){
            this.format="mmm dd, yyyy hh:mm tt"
        }
        this.viewContent=this.el;
        if(this.asStopWatch){
            if(typeof(this.asStopWatch)=="number"){
                this.startTime= $.date().trunc()
                this.endTime=$.date().trunc().plus("mi",this.asStopWatch)
                this.startTime= $.date().trunc()
             }
        } else if(this.asCountDown){
            if(typeof(this.asCountDown)=="number"){
                this.startTime= $.date().trunc().plus("mi",this.asCountDown)
                this.endTime= $.date().trunc();
                this.inc=0-Math.abs(this.inc);
             }
        }
        this.inc=this.inc||1
        this.incUnit=this.incUnit||"s"

         this.observer.on("hide",function(){
              this.pause()
         })
        this.observer.on("show",function(){this.start()})
        this.onpropertychange("formattedValue",function(rec){
            if(this.viewContent){this.viewContent.html(rec.value)}
        })

    },
    pause:function(resetTime){
        this.stop(false);
    },
    stop:function(resetTime){
        if(this.intervaltimer){
            clearInterval(this.intervaltimer)
            this.intervaltimer=0;
        }
        if(resetTime||resetTime==null){
            this.running=null;
        }
    },
    start:function(startTime){
        if(startTime){
            this.stop(true);
            this.startTime=startTime;
        }
        if(!this.intervaltimer){
            if(!this.running){
                if(!this.startTime){
                    this.startTime= new Date()
                }
                this.running=$.date.from(this.startTime,this.format)
            }
            if(this.intervaltimer){
                clearInterval(this.intervaltimer)
            }
            if(this.endTime){this.endTime= $.date.from(this.endTime)}
            if(!this.interval && this.inc && !isNaN(this.inc) && Math.abs(this.inc)>0){
                this.interval=Math.abs(this.inc)* $.date.unitToMS(this.incUnit||"s")
            }

            this.interval=this.interval||1000
            var ontick=function(){
                if(!this.running){return}

                if(this.inc=="now"){this.formattedValue=this.running.update("ms",Date.now()).format()}
                else if(!isNaN(this.inc)&&this.incUnit) {
                    this.formattedValue = this.running.plus(this.incUnit, this.inc).format()
                }
                if(this.endTime){
                    if(this.inc>0 && this.endTime.isBefore(this.running) ||(this.inc<0 && this.endTime.isAfter(this.running))){
                        this.stop(true)
                        this.observer.fire("timerend")
                    }

                }

            }.bind(this)
            this.intervaltimer=setInterval(ontick,this.interval)
            ontick()
         }
    },
     reset:function _reset(time){
         if(_reset._loop){return}
         try {
             var timer = this;
             _reset._loop=1
             var diff = (+time) - Date.now();
             if (Math.abs(diff) < $.date.unitToMS("h")) {
                 timer.show()
                 var tm = diff;
                 if (tm < 0) {
                     if (timer.endTime) {
                         timer.viewContent && timer.viewContent.html("Overdue")
                         timer.inc = 2;
                         timer.endTime = null;
                          timer.running = $.date(new Date(), "'overdue ' " + timer.format).trunc();
                         timer.running.setSeconds(Math.ceil(Math.abs(diff / 1000)))
                     }
                     //timer.stop(true)
                 } else {
                     if (!timer.endTime) {
                         timer.inc = -2;
                         timer.endTime = $.date(new Date()).trunc()
                         timer.running = null;
                     }
                     timer.viewContent && timer.viewContent.css({color: "black"})
                     var nu = new Date((+timer.endTime) + tm)
                     timer.start(nu)
                 }
                 if (timer.viewContent) {
                     timer.viewContent.css({color: timer.endTime ? "black" : "red"})
                 }
             } else {
                 if(diff<0){var diff1=Math.abs(diff),message="Overdue ";
                     if(diff1>$.date.unitToMS("d")){ message=message+" - More than "+ Math.floor(diff1/$.date.unitToMS("d"))+" day(s)" }
                     else if(diff1>$.date.unitToMS("h")){ message=message+" - More than "+ Math.floor(diff1/$.date.unitToMS("h"))+" hour(s)" }
                     timer.viewContent && timer.viewContent.html(message).css({color: "red"})
                     timer.stop();
                 } else{
                     timer.hide()
                 }


             }
         } finally{_reset._loop=null}
     },
    render:function(){
        if(this.label){
            this.el.html("<span class='view-content-label'>"+this.label+"</span><span class='view-content'></span>")
            this.viewContent=this.el.q(".view-content")
        } else{this.viewContent=this.el}
        this.start()
        this.rendered=true;

        return Promise.resolve(this.el)
    }

})
 TimerView.stopWatch=function(id,duration){
     if(typeof(id)=="number"){duration=id;id=null}
     return new TimerView({id:id,asStopWatch:duration})
 }
 TimerView.countDown=function(id,duration){
     if(typeof(id)=="number"){duration=id;id=null}
     return new TimerView({id:id,asCountDown:duration})
 }
module.exports=TimerView