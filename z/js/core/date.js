$.date = (function () {
    var proxy,ctor=Date,augmentProps={},cleanctor2=null,cleanctor=null,_cache={},_worker=null,replaceDash=null,__mindate = +new Date(1900, 1, 1);
    var _months=["January","Feburary","March","April","May","June","July","August","September","October","November","December"],
        _days=["Sunday","Monday","Tuesday","Wednesday","Thrusday","Friday","Saturday"],
      i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
      },
    dateFormatmasks = {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        date:      "mm/dd/yyyy",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        time:      "hh:MM TT",
        mediumTime:     "hh:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };
    function pad(v,cnt){ cnt=cnt||2;
        if(v==null){return ""}
        var dif=cnt-String(v).length;
        if(dif<=0){return ""+v}
        if(dif==1){return "0"+v}
        while(diff--) v="0"+v
        return s
    }
    function getWeek() {var date
        if(this && this.getTime){date=this}
        else{date=arguments[0]}
        if(!(date && date.getTime)){return 0}
         var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());// Remove time components of date
         targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3); // Change date to Thursday same week
         var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);// Take January 4th as it is always in week 1 (see ISO 8601)
         firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);// Change date to Thursday same week
         var ds = targetThursday.getTimezoneOffset()/firstThursday.getTimezoneOffset()-1;// Check if daylight-saving-time-switch occured and correct for it
        targetThursday.setHours(targetThursday.getHours()+ds);
        var weekDiff = (targetThursday - firstThursday) / (86400000*7);// Number of weeks between target Thursday and first Thursday
        return Math.floor(1 + weekDiff);
    };
    function isDateStr(a) {
        var b = null;
        if ("string" != typeof a) return null;
        try {
            if (Date.parse)
                if ($.browser.safari) {
                    var c = a.split("T");
                    if (2 == c.length && (b = new Date(c[0]), b.setHours(0), b.setMinutes(0), b.setSeconds(0), b.setMilliseconds(0), !c[1].replace(/[0:+]/g, "").trim())) {
                        var d = c[1].split(":").map(Number);
                        d[0] && b.setHours(d[0]), d[1] && b.setMinutes(d[1]), d[2] && b.setSeconds(d[2])
                    }
                } else b = Date.parse(a), b = b && b > 0 ? new Date(b) : null
        } catch (e) {
            console("date", a, e), b = null
        }
        if ("Invalid Date" == b && (b = null), null == b && "string" == typeof a) {
            try {
                b = new Date(a)
            } catch (e) {
                b = null
            }
            if ("Invalid Date" == b && (b = null), null == b && /[\W\s]/.test(a) && (/GMT-/.test(a) || /\b(sun|mon|tue|wed|thr|fri|sat)\b/i.test(a) || /\d\dT\d\d/.test(a) || a.split(/[\\\/\-]/).filter(Number).length > 2)) try {
                if (Date.parse) try {
                    b = Date.parse(a), isNaN(b) || (b = new Date(b))
                } catch (e) {
                    b = null
                }
                "Invalid Date" == b && (b = null), b || (b = new Date(replaceDash ? a.replace("-", "/") : a), b + "" == "Invalid Date" && null === replaceDash && (b = new Date(a.replace("-", "/")), b && b + "" != "Invalid Date" && (replaceDash = !0)))
            } catch (e) {
                b = null
            }
        }
        return b && "Invalid Date" != b || (b = null), b
    }
    function getcleanCtor(){
        var nativeDate=self.Date
        if(!cleanctor) {
             if($.browser.ie1){
                cleanctor=nativeDate
            } else{
                 var Dproto=nativeDate.prototype,Cproto={}

                 cleanctor2=(function(){var nativedate=self.Date
                       return function Date(){
                           var innr,ln=arguments.length//a=[].slice.call(arguments)
                           if(!ln){innr=new nativedate()}
                           else if(ln===1){innr=new nativedate(arguments[0])}
                           else{
                               innr=new (Function.prototype.bind.apply(nativedate, [null].concat([].slice.call(arguments))))
                           }
                           Object.defineProperty( this,"__inner__",{value:innr,writable:false,enumerable:false,configurable:false})
                       }
                    })();
                 Object.getOwnPropertyNames(nativeDate).filter(function(a){return a!="prototype" && !(a in Function.prototype)}).forEach(
                     function(k){
                         if(!(k in cleanctor2)){
                             cleanctor2[k]=nativeDate[k];
                         }
                     }
                 );

                 for(var i= 0,l=Object.getOwnPropertyNames(Dproto),ln= l.length;i<ln;i++){
                     var nm=l[i];
                     if(typeof(Dproto[nm])!="function" || nm=="constructor" || nm.indexOf("_")==0 || nm=="prototype" || Object[nm]===Dproto[nm]|| Object.prototype[nm]===Dproto[nm]){
                         continue
                     }
                     Cproto[nm]=Function("var IN=this.__inner__; return IN && IN['"+nm+"'].apply(IN,arguments)")
                 }
                 Cproto.constructor=cleanctor2;
                 cleanctor2.prototype=Cproto
                 Cproto.valueOf=function(){return +this.__inner__}
                var iframe = document.createElement("iframe")

                document.body.appendChild(iframe)
                iframe.src = "javascript:"
                cleanctor = iframe.contentDocument.defaultView.Date
                if(!$.browser.IE) {
                    document.body.removeChild(iframe)
                } else{
                    //IE has a weird bug ... cannot execute script from a freed script ... WTF
                    iframe.style.display="none"
                }
            }

            //_getProxy();
            function noop(){};
            var proto={}
            proto.toNative=function toNative( ){ return this.__isNative__?this:new Date(+this) }
            proto.__pad=function pad(v,cnt){ cnt=cnt||2;
                 if(v==null){return ""}
                 var dif=cnt-String(v).length;
                 if(dif<=0){return ""+v}
                 if(dif==1){return "0"+v}
                  while(diff--) v="0"+v
                  return s
             }
            proto.num=function num(){ return +this }
            if(!cleanctor.prototype.toGMTString){
                proto.toGMTString=cleanctor.prototype.toLocaleString||function(){return [this.getMonth(),this.getDate(),this.getFullYear()].join("/")+ " "+[this.getHours(),this.getMinutes()].join(":")}
            }

            proto.asString=function asString(){
                if(this.__busy){
                    return this.__str_||""
                }
                this.__busy_=1
                try{
                    this.__str_=this.format()
                } finally{
                    delete this.__busy_
                }
                return this.__str_||""
            }

            $.extend(proto,exproto);
            $.extend(cleanctor.prototype,proto)
            $.extend(cleanctor2.prototype,proto)
            cleanctor2.prototype.toString=function(){
                return this.__inner__?this.__inner__.toString():""
            }
            var props={

                 "__isdate__":{value:true,configurable:true,writable:false,enumerable:true},
                long:{get:function(){return +this},set:noop,enumerable:true,configurable:true},
                 mmmm:{get:function(){return i18n.monthNames[this.getMonth()+12]},set:noop,enumerable:true,configurable:true},
                mmm: {get:function(){return String(i18n.monthNames[this.getMonth()]).substr(0,3)} ,set:noop,enumerable:true,configurable:true},
                ddd: {get:function(){return String(i18n.dayNames[this.day]).substr(0,3)},set:noop,enumerable:true,configurable:true},
                dddd: {get:function(){return i18n.dayNames[this.day+ 7]},set:noop,enumerable:true,configurable:true},
                t:   {get:function(){return this.getHours()>=12?"p":"a"},set:noop,enumerable:true,configurable:true},
                tt:   {get:function(){return this.t+"m"},set:noop,enumerable:true,configurable:true},
                T:   {get:function(){return String(this.t).toUpperCase()},set:noop,enumerable:true,configurable:true},
                TT:   {get:function(){return String(this.tt).toUpperCase()},set:noop,enumerable:true,configurable:true},
                h:   {get:function(){return ((((this.getHours()+12)%12)||12))},set:function(v){if(typeof(v)=="number"){this.setHours(v)}},enumerable:true,configurable:true},
                hh:  {get:function(){return this.__pad(this.h)},set:noop,enumerable:true,configurable:true},
                MM:  {get:function(){return this.__pad(this.M)},set:noop,enumerable:true,configurable:true},
                M:  {get:function(){return this.getMinutes()},set:noop,enumerable:true,configurable:true},
                W:  {get:function(){return this.getWeek()},set:noop,enumerable:true,configurable:true},
                L:  {get:function(){var L=this.getMilliseconds();return this.__pad(L > 99 ? Math.round(L / 10) : L)},
                    set:function(v){if(typeof(v)=="number"){this.setMilliseconds(v)}},enumerable:true,configurable:true},
                l:  {get:function(){return this.getMilliseconds()  },
                    set:function(v){if(typeof(v)=="number"){this.setMilliseconds(v)}},enumerable:true,configurable:true},
                S:  {get:function(){var d=this.getDate();
                    return   ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                },set:noop,enumerable:true,configurable:true},
            };
            ["day","date","month","year","seconds","milliseconds","minutes","hours","week","quarter"].forEach(
                function(k){
                    var nm=k;
                    if(k=="year"){nm="fullYear"}
                    var abbr=k.charAt(0),nm= nm.charAt(0).toUpperCase()+ nm.substr(1),
                        getter=Function("return this.get"+nm+"()"),
                        setter=(k=="week"||k=="day"||k=="quarter")?function(){}:Function("v","return this.set"+nm+"(v)")
                    props[k]={get:getter,set:setter,enumerable:true,configurable:true}
                    if(k!="day"){
                        if(k=="minutes"){abbr="n"}
                        if(k=="milliseconds"){abbr="ms"}
                        if(abbr=="h"){abbr="H"}
                        props[abbr]={get:getter,set:setter,enumerable:true,configurable:true}
                        if(abbr.length==1){
                            props[abbr+abbr]={get:Function("return this.__pad(this.get"+nm+"())"),set:setter,enumerable:true,configurable:true}
                        }

                    }
                }
            );
            ["n","m","d","s"].forEach(
                function(k){
                    props[k+k]={get:Function("return this.__pad(this."+k+")"),set:noop,enumerable:true,configurable:true}
                }
            );
            $.each({"pm":"tt","am":"tt",ap:"tt",AM:"TT",AP:"TT","mi":"nn",yyy:"yy",yyyy:"yy"},
                function(v,k){
                    props[k]={get:Function("return this."+v),set:noop,enumerable:true,configurable:true}
                }
            );
            augmentProps=props;

            $.defineProperties(cleanctor.prototype,props)
            $.defineProperties(cleanctor2.prototype,props)
            $.each(proto,function(v,k){
                augmentProps[k]={value:v}
            })
            //Object.assign(cleanctor.prototype,proto);
            //Object.assign(cleanctor2.prototype,proto);
            //$.defineProperties(cleanctor2.prototype,props)
        }
        return cleanctor2
    }

    function _augment(d,format){
        var nu=null;
        if(d && d.__isdate__){
            nu= d
        } else {
            var num = +d || (d.getTime?d.getTime():0);
            if (!num) {
                return null
            }
            var cctor = getcleanCtor()
            nu = new cctor(num);
            //nu.toString=function(){return this.asString()}
        }
        if(format){nu._defaultFormat=format}
        return nu
    }
    var fnstoIgnore=["augment","augmentProto","from","asTime","getProxy"]
    function _getProxy(dlg){
        if(!proxy && $.makeProxy2){
            proxy= $.makeProxy2(new Date(),true)

            $.each(api,
                function(v,k){
                    if(typeof v =="function" && fnstoIgnore.indexOf(k)==-1 &&!(k in augmentProps)){
                        augmentProps[k]={value:v,enumerable:true,writable:false,configurable:true}
                    }

                })
            proxy.__add(augmentProps,true);

        }
        var nu
        if(!proxy){return null}
        if(dlg){
            var date=_makeDate(dlg)
            if(date){
                nu= proxy.__clone(date)
            }
        } else{
            nu=proxy
        }
        if(nu && !nu.__isdatewrap){
            $.defineProperty(proxy,"__isdatewrap",{value:true,writable:false,enumerable:false,configurable:false})
        }
        return nu;
    }
    function _isDate(ths,v,astime){
        var d=null
        if(typeof(v)=="boolean"){astime=v;v=null}
        if(ths && (ths instanceof Date || (ths.constructor && ths.constructor.name=="Date") ||ths.__istime__  || ths.__isdate__)){
            d= ths
        }
        else{
            if(v){ths=null;}
            d= v;
        }

        if(d==null ) {
            if (ths) {
                d = ths
            }
            else {
                return null
            }
        }
        if(d != null) {
            var t = typeof(d);
            if (d != "" && t !="object" && !isNaN(d) && Number(d) >=  __mindate) {
                d = new Date(+d)
            } else if (t == "string") {
                var str=d;d=null
                if (str == "now") {
                    d = new Date()
                }
                else if (str == "today") {
                    d = $d.trunc(new Date())
                }
                else if (str == "tomorrow") {
                    d = new Date()
                    d.setDate(d.getDate() + 1)
                }
                else if (str == "yesterday") {
                    d = new Date()
                    d.setDate(d.getDate() - 1)
                }
                else if (astime && /^[\d:]+\s*[ap]m$/i.test(str)) {
                    var arr=str.split(":")
                    var min=0,hr=Number(arr.shift().replace(/\D/g,""))||0
                    if(arr.length){
                        min=Number(arr.shift().replace(/\D/g,""))
                    }

                    if(hr||min){
                        if(/pm$/i.test(str)){hr=hr+12}
                        d=$.date().trunc().set({h:hr,n:min})
                    }
                }
                else if (/\W/.test(str)) {
                    if (astime) {
                        if (/^\d+\s*:(\d+)?\s*/i.test(str.trim())) {
                            try {var curr=new Date()
                                d = new Date([curr.getMonth()+1,curr.getDate(),curr.getFullYear()].join("/")+" "+str)
                                if(d=="Invalid Date"){d=null}
                                else{d.setMilliseconds(0)}
                            } catch(e){
                                d=null
                            }
                            if(!d) {
                                var p = /(\d+)\s*:?(\d+)?\s*([ap]m)?$/ig.exec(str.trim())
                                if (p && p.length) {d = new Date( )
                                    var h = Number(p[1]) || 0, ap = String(p[3]).toLowerCase()
                                    if (h <= 11 && ap == "pm") {
                                        h = h + 12
                                    }
                                    d.setHours(h)
                                    d.setMinutes(Number(p[2]) || 0)
                                    d.setSeconds(0)
                                    d.setMilliseconds(0)
                                }
                            }
                        }
                    }

                    d = d ||  isDateStr(str)
                }
            }
        }
        if(d!=null){
            if(d.__istime__  || d.__isdate__ ){return d}
            if (typeof(d) == "object" && ((d.constructor && (d.constructor.name == "Date" || d.constructor === Date)) || d instanceof Date)) {
            } else {
                d=null
            }
        }
        if(d=="Invalid Date"){d=null}
        if (d && astime) {d.__istime__=true}
        return d

    }
    function _makeDate(ths,v){
        return _isDate(ths,v);
    }
    function _makeTime(ths,v){
        return _isDate(ths,v,true);
    }
    function _parsePart(part,dt){
        if(!part){return}

        if(!dt){dt=_worker||(_worker=_augment(new Date()));}
        if(part=="hr"){part="h"}
        if(!(part in dt) && part.length>1){
            if(part.indexOf("mi")==0){part="mi"}
            else{
                if(part.toLowerCase() in dt){part=part.toLowerCase()}
                else{
                    var p1=part.substr(0,2)
                    if(p1.toLowerCase() in dt){part=p1.toLowerCase()}
                    else if(p1 in dt){part=p1}
                    if(!(part in dt)){
                        p1 = part.substr(0, 1)
                        if (p1.toLowerCase() in dt) {
                            part = p1.toLowerCase()
                        }
                        else if (p1 in dt) {
                            part = p1
                        }
                    }
                }
            }

        }
        if(part=="h"){part="H"}
        if(part=="mi"){part="n"}
        if(part=="ap"){part="tt"}
        return part
    }
    var dateDuration=null
    function getDurationInstance(d1){
        if(!dateDuration) {//ctor, proto, superClass, staticObject
            dateDuration = $.createClass(
                function (dur) {
                    this.duration = +dur
                    var U = this.unitstoms || (this.unitstoms = $.date.__unitstoms);
                    if (dur > U.y) {
                        this.years = Math.floor(dur / U.y)
                        dur = dur - (this.years * U.y)
                    }
                    if (dur > U.m) {
                        this.months = Math.floor(dur / U.m)
                        dur = dur - (this.months * U.m)
                    }
                    if (dur > U.d) {
                        this.days = Math.floor(dur / U.d)
                        dur = dur - (this.days * U.d)
                    }
                    if (dur > U.h) {
                        this.hours = Math.floor(dur / U.h)
                        dur = dur - (this.hours * U.d)
                    }
                    if (dur > U.n) {
                        this.minutes = Math.floor(dur / U.n)
                        dur = dur - (this.minutes * U.n)
                    }
                    if (dur > U.s) {
                        this.seconds = Math.floor(dur / U.s)
                        dur = dur - (this.seconds * U.s)
                    }
                    this.milliseconds = dur


                }, {
                    asString: function () {
                        var r = []
                        for (var i = 0, l = "years months days hours minutes seconds milliseconds".split(/\s+/), ln = l.length; i < ln; i++) {
                            if (this[l[i]]) {
                                r.push(this[l[i]] + " " + l[i])
                            }
                        }
                        return r.join(", ")
                    }
                }
            );
            $.date.unitToMS("h")
            dateDuration.prototype.unitstoms = $.date.__unitstoms
        }
        return new dateDuration(d1 )
    }
    var dateRange=null
    function getDateRangeInstance(d1,d2){
        if(!dateRange){//ctor, proto, superClass, staticObject
            dateRange=$.createClass(
                function(st,end){
                    Object.defineProperties(
                        this,
                        {start:{get:function(){return this.get("start")},set:function(v){return this.setItem("start", $.date(v)) },enumerable:true},
                         end:{get:function(){return this.get("end")},set:function(v){return this.setItem("end", $.date(v)); },enumerable:true},
                         formattedDuration:{get:function(){return this.format()},set:function(v){},enumerable:true},
                            duration:{get:function(){return this.get("duration")},set:function(v){return this.setItem("duration", v)},enumerable:true},
                            durationType:{get:function(){return this.get("durationType")},set:function(v){return this.setItem("durationType", v)},enumerable:true}
                       }
                    )
                    this.set("start",$.date(st)||$.date())
                    this.set("end",$.date(end)||$.date())
                    this.set("datamodified",0)
                 },{
                    setItem: function (nm,val) {this.__modifiedlog||(this.__modifiedlog=0);
                        var curr=this.set(nm, val);this.set("datamodified",++this.__modifiedlog);
                        return curr
                    },
                contains: function (d) {
                    var dt = $.date(d);
                    return (dt && +dt >= +this.start && +dt <= +this.end)
                },
                setDuration: function (type, amount) {
                    if (type == "h" && amount < 1) {
                        type = "n"
                        amount = 60 * amount
                    }
                    this.duration = amount
                    this.durationType = type
                    this.end = $.date(+this.start).plus(type, amount)

                    return this
                },
                isInTimeRange: function (date) {
                    var d=new $.date(date)
                    if(!d){return}
                    var ofset=date.dayOffset();
                    return this.start.dayOffset()<=ofset && this.end.dayOffset()>=ofset
                },
                overlaps: function (rng) {
                    return (rng && +rng.start <= +this.end && +rng.end >= +this.start)
                },
                getDurationInHours: function () {
                    var h=Number((this.end-this.start)/$.date.unitToMS("h")).toFixed(1)
                     return h

                },
                format: function () {
                    var actualDuration = this.end - this.start, str = []
                    if (actualDuration < 0) {
                        return ""
                    }

                    var min = Math.ceil(actualDuration / $.date.unitToMS("n"))
                    var h = Math.floor(actualDuration / $.date.unitToMS("h"))//this.exit_time.getHours() - this.entry_time.getHours()
                    min = this.end.getMinutes() - this.start.getMinutes()
                    if (min < 0) {
                        min = 60 + min
                    }

                    if (Math.ceil(actualDuration / $.date.unitToMS("n")) <= 1) {
                        str.push("less than a minute ..")
                    } else {
                        if (h <= 0) {
                            str.push(min + " minutes")
                        } else {
                            h = Math.floor(actualDuration / $.date.unitToMS("h"))
                            min = Math.floor((actualDuration - (h * $.date.unitToMS("h"))) / $.date.unitToMS("n"))
                            if (h > 24) {
                                var days = Math.floor(actualDuration / $.date.unitToMS("d"))
                                var actualDuration2 = actualDuration - (days * $.date.unitToMS("d"))
                                h = Math.floor(actualDuration2 / $.date.unitToMS("h"))
                                min = Math.floor((actualDuration2 - (h * $.date.unitToMS("h"))) / $.date.unitToMS("n"))
                                if (days) {
                                    str.push(days + " days")
                                }
                                if (h) {
                                    str.push(h + " hours")
                                }
                                if (min) {
                                    str.push(min + " minutes")
                                }

                            } else {
                                if (h) {
                                    str.push(h + " hours")
                                }
                                if (min) {
                                    str.push(min + " minutes")
                                }
                            }

                        }
                    }
                    return str.join(", ").trim()
                }

            },$.observable)

        }
        return new dateRange(d1,d2)
    }

    var wraptemplates={};
    var MIN=1000*60,HR=MIN*60,DAY=HR*24;
    var exproto= {

        getFormatTemplate: function (f) {
            if (typeof(f) == "string" && wraptemplates[f]) {
                return wraptemplates[f];
            }

            var frmt = f, dt = this;
             if (!frmt && dt) {
                frmt = dt._defaultFormat
            }
            if (!frmt) {
                return
            }

            var handle = wraptemplates[frmt]
            if (!handle) {
                var keys = []
                var template = f.replace(/hh:mm/, "hh:nn").replace(/'([^']+)'/g, function (a, k) {
                    return "`" + strings.push(k) + "`"
                })
                    .replace(/\b([\w]+)\b/g, function (a, k) {
                        keys.push(k)
                        return "<span data-key='" + (k) + "' class='date-part date-part-val date-part-" + (k.toLowerCase()) + "'>$" + k + "</span>"
                    })
                    .replace(/`(\d+)`/g, function (a, k) {
                        return "<span class='date-part date-part-text'>" + strings[Number(k) - 1] + "</span>"
                    }).trim().replace(/(\<\/span\>)([\S]+)(\<span)/g, function (a, b, c, d) {
                        return b + "<span class='date-part date-part-sep'>" + c + "</span>" + d
                    })
                handle = wraptemplates[f] = {keys: keys, template: template, format: f}
                handle.getTemplateData = function (dt) {
                    if (!dt || !(dt.__isdate__ || dt.__istime__)) {
                        return {}
                    }
                    return dt.getTemplateValue(this.keys)
                }.bind(handle)
                handle.resolve = function (dt) {
                    var data = this.getTemplateData(dt)
                    return this.template.replace(/\$(\w+)/g, function (a, b) {
                        return data[b] || a;
                    });
                }.bind(handle)
            }
            return handle
        },
        format: function ( frmt, wraptag) {
             var dt = this, res = ""
            if (dt) {
                if (this.__busy1) {
                    return ""
                }
                this.__busy1 = 1
                if($.date.__tmzot&& Number($.date.__tmzot)>0){
                    try {
                        var nudt = $.date(+dt).minus("n", Number($.date.__tmzot))
                        if(nudt && nudt.getTime()>0){
                            dt=nudt
                        }
                    } catch(e){

                    }
                }
                try {
                    var f = frmt || this._defaultFormat;
                    if (typeof(f) != "string") {
                        f = null
                    }
                    if (dateFormatmasks[f]) {
                        f = dateFormatmasks[f];
                    }
                    if (wraptag !== true) {
                        wraptag = !!this._wraptag
                    }
                    if (!f) {
                        f = this.__istime__ ? "hh:nn tt" : 'mm/dd/yy hh:nn tt'
                    }
                    var strings = []

                    if (f.indexOf("recency") == 0) {
                        var today = new Date(), time = dt.getTime(), now = +today, diff = Math.abs(now - time);
                        if (today.getFullYear() == dt.getFullYear() && today.getMonth() == dt.getMonth()) {
                            var dte = dt.getDate(), thsdate = today.getDate()
                            if (thsdate == dte) {
                                if (f === "recency-date") {
                                    res = "Today"
                                } else {
                                    if (diff < MIN) {
                                        res = "just now .."
                                    }
                                    else if (diff < 5 * MIN) {
                                        res = "few minutes ago .."
                                    }
                                    else if (diff < HR) {
                                        res = "a little while ago .."
                                    }
                                    else if (diff < 5 * HR) {
                                        res = "few hours ago .."
                                    }
                                    else {
                                        res = "Today"
                                    }
                                }

                            }
                            else if (thsdate - dte == 1) {
                                res = "Yesterday"
                            } else if (thsdate - dte == -1) {
                                res = "Tommorrow"
                            } else {
                                f = "ddd dd mmm, yyyy"
                            }
                        } else {
                            f = "ddd dd mmm, yyyy"
                        }
                    }
                    if (!res) {
                        if (f == "time") {
                            f = "hh:nn tt"
                        }
                        else if (f == "date") {
                            f = "mm/dd/yy"
                        }
                        else if (f == "datetime" || f == "timestamp") {
                            f = "mm/dd/yy hh:nn tt"
                        }
                        f = f.replace(/MM/g, "nn").replace(/hh:mm/ig, "hh:nn");
                        if (wraptag || String(f).indexOf("<") == 0) {
                            var handle = dt.getFormatTemplate(f)
                            if (handle) {
                                return handle.resolve(dt)
                            }

                        } else {
                            res = f.replace(/'([^']+)'/g, function (a, k) {
                                return "`" + strings.push(k) + "`"
                            })
                                .replace(/\b([\w]+)\b/g, function (a, k) {
                                    var v = dt[k] || dt[k.toLowerCase()] || a;
                                    if (k == "m" || k == "mm" && !isNaN(v)) {
                                        v = Number(v) + 1;
                                        if (k == "mm") {
                                            v = dt.__pad(v)
                                        }
                                    }
                                    return v
                                })
                                .replace(/`(\d+)`/g, function (a, k) {
                                    return strings[Number(k) - 1]
                                }).trim()
                        }
                    } else if (wraptag) {
                        res = "<span class='date-part date-part-" + f + "'>" + res + "</span>"
                    }

                } finally {
                    this.__busy1 = 0
                }
            }
            return res
        },
        dayOffset: function () {
            return (this - this.clone().trunc())
         },
        trunc: function ( onlymins) {
            var dt = this
            if (dt) {
                if (!onlymins) {
                    dt.setHours(0)
                }
                dt.setMinutes(0)
                dt.setSeconds(0)
                dt.setMilliseconds(0)
            }
            return dt
        },
        getTemplateValue: function (key, def) {
            var res = {}, isarr = Array.isArray(key)
            var dt = this;
            if (!(dt.__isdate__ || dt.__istime__) || !key) {
                return res
            }
            for (var i = 0, l = isarr ? key : [key], ln = l.length, k; k = l[i], i < ln; i++) {
                var v = dt[k] || dt[k.toLowerCase()] || "";
                if (k == "m" || k == "mm" && !isNaN(v)) {
                    v = Number(v) + 1;
                    if (k == "mm") {
                        v = dt.__pad(v)
                    }
                }
                res[k] = v
            }
            return isarr ? res : res[key]
        },
        clone: function (cachedifavailable) {
            var nu = null,   dt = this
            if(cachedifavailable==true ){
                if(!$.date.__cache){
                    $.date.__cache={}
                }
                if($.date.__cache[+dt]){
                    return $.date.__cache[+dt]
                }
            }
             var nu = dt.constructor ? new dt.constructor(+dt) : $date.from(+dt)
            nu._defaultFormat = dt._defaultFormat;
            if (dt.__istime__) {
                nu.__istime__ = true
            }
            if(cachedifavailable==true ){
                $.date.__cache[+dt]=nu;
            }
             return nu
        },
        toNearestHalfHour: function ( ) {
            var dt = this
            if (dt.getMinutes() != 30) {
                if (dt.getMinutes() < 30) {
                    dt.setMinutes(30)
                } else {
                    dt.setMinutes(0)
                    dt.setHours(dt.getHours() + 1);
                }
                dt.setSeconds(0);
                dt.setMilliseconds(0);
            }
            return dt;
        },
        isWeekEnd: function ( ) {
            var dt = this
            return (dt.getDay() == 0 || dt.getDay() == 6);
        },
        isWeekDay: function ( ) {
            return !this.isWeekEnd( );
        },
        toNearestHour: function (v) {
            var dt = this
            if (dt.getMinutes() != 60) {
                dt.setMinutes(0);
                dt.setSeconds(0);
                dt.setMilliseconds(0);
                dt.setHours(dt.getHours() + 1);
            }

            return dt;
        },
        get: function ( nm, val) {
            var dt =  this

            var part = _parsePart(nm, dt)
            return part?this[part]:null
        },
        set: function ( nm, val) {
            return this.update( nm, val)
        },
        update: function ( nm, val) {
            var dt = this

            if (typeof(nm) == "string" && val != null) {
                var part = null
                if (nm == "ms") {
                    var diff = Number(val) - dt.getTime()
                    if (!isNaN(diff)) {
                        val = Math.max(0, dt.getSeconds() + Math.ceil(diff / 1000))
                        part = "s"
                    } else {
                        part = ""
                    }

                } else {
                    part = _parsePart(nm, dt)
                }
                if (part == "hh" || part == "mm" || part == "dd" || part == "nn" || part == "ss") {
                    val = Number(val)
                    part = part.charAt(0);
                }
                if (part && dt[part] != val) {

                    if (part == "tt" || part == "t") {
                        if (val) {
                            var lc = String(val).toLowerCase(), curr = String(dt[part]).toLowerCase()
                            if (!curr) {
                                curr = dt.H < 12 ? "am" : "pm"
                            }
                            if (curr != lc) {
                                if (lc == "pm") {
                                    dt.setHours(dt.getHours() + 12)
                                } else if (lc == "am") {
                                    dt.setHours(dt.getHours() - 12)
                                }
                            }
                        }

                    } else {
                        dt[part] = Number(val) || val
                    }

                }

            } else if ($.isPlain(nm)) {
                for (var i = 0, l = Object.keys(nm); i < l.length; i++) {
                    typeof(l[i]) == "string" && dt.update(l[i], nm[l[i]])
                }
            }
            return dt
        },
        minus: function ( part, val) {
            var dt = this

            if (!isNaN(val)) {
                return this.plus(part, 0 - val)
            }
            return this
        },
        plus: function ( part, val) {
            var dt = this
            if (!part) {
                if (dt.__istime__) {
                    part = "H";
                    val = 1
                }
                else if (dt.__isdate__) {
                    part = "D";
                    val = 1
                }
            }
            part = _parsePart(part, dt)
            if (!part) {
                return dt
            }
            if (part == "h" && val < 1 && val > 0) {
                part = "n";
                val = 60 * val;
            }
            if (part == "ms") {
                val = Math.ceil(val / 1000)
                part = "s"
            }
            if (part in dt && !isNaN(val)) {
                dt[part] = Number(dt[part]) + Number(val)
            }
            return dt
        },
        toNearestQuarterMinutes: function ( offset) {
            var dt = this
            offset=Number(offset)||0
            var min = dt.getMinutes()
            var diff = 15 - ((min + 15) % 15)
            if(diff<offset){ diff=diff+15}
            dt.setMinutes(min + diff);
            dt.setSeconds(0);
            dt.setMilliseconds(0);
            return dt;
        },
        getQuarter: function ( ) {
             return Math.ceil((this.getMonth() + 1) / 3);
        },
        getWeekOfYear: getWeek,
        getWeek: function ( ) {
            var dt =  this

            var date = dt.getDate(), fstday;
            dt.setDate(1);
            fstday = dt.getDay();
            dt.setDate(date);
            return Math.ceil((date + fstday) / 7)
        },
        isBefore: function (v ) {
            return !this.isAfter( v)
        },
        isAfter: function (v ) {
            var dt1 =  this , dt2 = _makeDate( v )
            if (dt1 && dt2) {
                return (+dt1) > (+dt2)
            }
        },
        asNumber:function( ){
            return +this
        },
        isSame:function(v ){
            return this.equals.apply(this,arguments)
        },
        compareTo:function(v ){
            var dt1= this ,dt2=_makeDate( v )
            if(dt1&&dt2){
                var diff=(+dt1)-(+dt2)
                return diff?(diff>0?1:-1):0
            }
            return dt1?1:-1
        },
        equals:function(v ){
            var dt1=this,dt2=_makeDate(v )
            if(dt1&&dt2){
                return (+dt1)===(+dt2)
            }
        },
        isAfterNoon:function( ){
            return this.getHours()>=12;
        },
        isSameWeek:function(v){
            var dt= this,t= $.date(v);
            if(!t){return}
            return t.getWeek()==this.getWeek();
        },
        toMap:function( ){
            var props={},dt= this
             "month,year,date,day,seconds,minutes,milliseconds".split(",").forEach(
                function(k){var k1=(k=="year")?"FullYear":(k.charAt(0).toUpperCase()+ k.substr(1));
                    props[k]= dt[k]||dt["get"+ k1]()
                }
            );
            props.week=dt.getWeek(dt)
            return props
        },
        hoursFrom: function(a) {
            var to =  this ,from = $.date(a);
             if(from && to){
                return Math.floor(((+to) - (+from))/ $.date.unitToMS("h"))
            }
            return 0
        },
        asDuration:function(end,prefix,pastdueprefix){
            if(!end){return ""}
            var endtime = +end,mins=1000*60,hrs=mins*60;
            var diff= endtime - (+this),txt="",past
            if(diff<=0) {
                past=true
                diff=0-diff
            }

            var h = Math.floor(diff / hrs)
            var m = Math.floor((diff - (hrs * h)) / mins)
            if(h>0){
                txt= h + " hour(s) and " + m +" minute(s)"
            } else if(m>0){
                txt=m +" minute(s)"
            } else{
                txt="Less than a minute"
            }

            if(past){txt=(pastdueprefix||"")+" "+txt}
            else{txt=(prefix||"")+" "+txt}
            return txt
        },
        daysInMonth:function( ){
             return this.clone().plus("m",1).set("d",1).plus("d",-1).date
        },
        range:function(interval,cnt,step){
            var from  = this

            if(typeof(interval)=="number"){
                step=cnt
                cnt=interval;
                interval="d"
            }
            step=Number(step)||1
            var part=_parsePart(String(interval))
            if(!part){return []}
            var unitToMS=$.date.unitToMS(part)||$.date.unitToMS("d"),st=+from
            if(unitToMS){
                if(cnt>0){
                    var cctor = getcleanCtor()
                    return List.create(cnt,function(i){return new cctor(st+(unitToMS*i*step))});
                }
            }
            return []
        }
    }
    var api={
        toDate:function(v){
            return _makeDate(this,v)
        },
        isValid:function(v){
            return _makeDate(this,v)!=null
        },
        augment:function(dt,format){
            return $.date.from(dt,format)
        },
        asDate:function(){
            var dt=this.from.apply(this,arguments)
            if(dt && !dt.__istime__ && !dt._defaultFormat){
                dt.trunc();
                dt._defaultFormat=dt._defaultFormat||"date"
            }
            return dt;
        },
        asTime:function(){
            var d,dt=arguments[0],format=arguments[1]
            if((!arguments.length && (this==self||this== $.date))||dt===null){d=new Date()}
            else {
                d = _makeTime(this, dt)
                if (!d) { return null }
            }
            if(typeof(format)!="string"){
                if(d===this && typeof(dt)=="string"){format=dt;}
                else{format=null}
            }
            return _augment(d,format||'time')

        },
        from:function(){
            var d,dt=arguments[0],format=arguments[1]
            if((!arguments.length && (this==self||this == $.date))||dt==null){d=new Date()}
            else if(dt && dt.__isdate__){return dt}
            else {
                d = _makeDate(dt)
                if (!d) { return null }
            }
            return _augment(d,format)

        },
        makeRange:function(dt1,dt2){
             return getDateRangeInstance(dt1,dt2)

        },
        extendNative:function(){

        },
        augmentProto:function(){
            if(Date.prototype.__isdate__){return}
            Date.prototype.__isdate__=true;
            Date.prototype.__isNative__=true;
            $.each(exproto,function(v,k){
                Date.prototype[k]=v;
            })
            $.defineProperties(Date.prototype,augmentProps)
        },
        getProxy:function(date){return
            date=_isDate(date)
            if(!date){return null}
            return _getProxy(date)

        },
        lookuplist:function(datepart,constrain,refdate){

            if(refdate==null && this instanceof Date){
                refdate=this
            } else if (constrain && constrain instanceof Date){
                refdate=constrain;
                constrain=null
            }
            refdate=refdate|| $.date()

            var part=_parsePart(datepart)||"";

            var padd=part.length>1? $.fn.rcurry(pad,2):function(a){return a}

            if(datepart=="mmm"){
                return List.create(i18n.monthNames.slice(12)).asKeyValueSet("id","label")
            } else if(part=="m"||part=="mm"){
                return List.create(i18n.monthNames.slice(0,12)).collect(function(it,i){return {id:i+1,label:it}})  ;
            } else if(part=="dd"||part=="d"){
                return List.create(refdate.daysInMonth(),function(i){return {id:i||String(i),label:padd(i)}}) ;
            } else if(datepart=="day"){
                return List.from(i18n.dayNames.slice(7)).asKeyValueSet("id","label")
            }else if(part=="y"||datepart=="yyyy"){constrain=constrain||{}
                var yr=refdate.year
                var start=Number(constrain.start)||yr,end=Number(constrain.end)||(yr+10)
                if(constrain.range && typeof (constrain.range)=="number"){
                    start=yr-constrain.range;
                    end=  yr+constrain.range
                } else if(constrain.offset){
                    if( typeof (constrain.offset)=="number") {
                        start = yr - constrain.offset
                    } else{
                        if( typeof (constrain.offset.start)=="number") {
                            start = yr - constrain.offset.start
                        }
                        if(typeof (constrain.offset.end)=="number"){
                            end=yr+constrain.offset.end
                        }
                    }
                }
                if(typeof (constrain.max)=="number"){
                    end=start+constrain.max
                }
                return List.create(end-start+1,function(idx){return idx +start}) ;

            } else if(datepart=="hh"||datepart=="h"){
                if(constrain && (constrain.as24||constrain=="24")){
                    return List.create(24,function(i){return {id:i+1,label:padd(i+1)}})
                }
                return List.create(12,function(i){return {id:i||String(i+1),label:padd(i+1)}})
            } else if(datepart=="nn"){
                var l=List.create(60,function(i){return {id:i||String(i),label:padd(i)}})
                var step=constrain && (constrain.step);
                if(!step){step=15}
                if(step){
                    return l.filter(function(a,i){return !(i% step)})
                }
                return l
            } else if(datepart=="ss"){
                var l=List.create(60,function(i){return {id:i||String(i),label:padd(i)}})
                if(constrain && (constrain.step)){
                    return l.filter(function(a,i){return !(i%constrain.step)})
                }
                return l
            } else if(datepart=="t"||datepart=="ap"||datepart=="tt"){
                return [{id:"am",label:"AM"},{id:"pm",label:"PM"}]
            }
        },
        unitToMS:function(unit){
            var ret=1,s=1000,part=_parsePart(unit)||"";
            if(!$.date.__unitstoms){
                $.date.__unitstoms={
                    "s":s,
                    "n":s*60,
                    "h":s*60*60,
                    "d":s*60*60*24,
                    "m":s*60*60*24*30,
                    "y":s*60*60*24*365
                }
            }

            return $.date.__unitstoms[String(part).toLowerCase()]
        }


    }
    $.each(exproto,function(fn,nm){
        api[nm]=(function(mthd){
            return function(dt){
                var nu= $.date(dt);if(!nu){return null}
                return mthd.apply(nu,[].slice.call(arguments,1))
            }
        })(fn)
    })
    var toret=function(){
        return api.from.apply(api,arguments.length?arguments:[new Date()])
    }
    toret.now=toret.today=function(){return $.date()}
    toret.yesterday=function(){return $.date().minus("d",1)}
    toret.tomorrow=function(){return $.date().plus("d",1)}
    Object.assign(toret,api)

    return toret
})();

