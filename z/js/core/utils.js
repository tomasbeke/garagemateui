/**
 * Created by atul on 12/21/13.
 */

self.Util||(self.Util={});


Util.multiLine=function(f){
    if(typeof(f)=="function"){
        return f.toString().trim().replace(/^([^\{]+\{\s*\/\*\s*)|(\*\/\s*\})$/gm,"").trim()
    }
}
Util.showErrors=function(){
    fff=ttt
}
//check if there is connectivity
Util.hostReachable=function hostReachable() {
    // Handle IE and more capable browsers
    var xhr = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" );
    var status;
    // Open new request as a HEAD to the root hostname with a random param to bust the cache
    xhr.open( "HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false );
    // Issue request and handle response
    try {
        xhr.send();
        return ( xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304) );
    } catch (error) {
        return false;
    }

}
Util.exportToExcel=function( config){config=config||{}
     if(typeof(config)=="string"){config={filename:config}}
    function _getContent( config){
        var ret={rows:config.rows||[],columns:[]}
        if(config.rows && config.columns){
            return config
        }
        var cols = [],ele=$d(config.el)
        var coltmplt = $.simpleTemplate('<Column ss:Index="$idx" ss:StyleID="$stl"   ss:Width="$wd"/>')
        if(ele) {
            var firstrow = ele.down("tbody tr.currentrow") ||
                ele.qq("tbody tr").filter(function (it) {
                    return it.offsetHeight > 10
                })[0];
             if (firstrow) {
                firstrow.qq("td").each(function (it, i) {
                    cols.push({
                        idx: (i + 1),
                        wd: it.offsetWidth,
                        stl: (it.css("textAlign") == "right" ? "numstyle" : "genstyle")
                    })
                })
            }
            var rowidx = 0

            ret.rows = [].slice.call(ele.selfOrDown("table").qq('tr')).map(
                function (it, i) {
                    return [].slice.call(it.children).map(function (it) {
                        return String($d.val(it) || '').trim()
                    })
                }
            )
        } else if(config.cols){
            cols=config.cols||[]
        }
        if(cols && cols.length) {
            ret.columns = cols.map(function (it) {
                return coltmplt(it)
            })
        }
        ret.rows=ret.rows||[]
        return ret
     }
    //<ss:Font ss:Bold="1"/>
    function _gen(config){
        var data=_getContent(config)
        var defstyle,numstyle,genstyle,rowstyle
        if(!config.style){
            defstyle='<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/><Borders/><Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/><Interior/><NumberFormat/><Protection/></Style>'
            numstyle='<Style ss:ID="numstyle"><Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/><Font ss:FontName="Arial"/><NumberFormat/></Style>'
            genstyle='<Style ss:ID="genstyle"><Font ss:FontName="Arial"/></Style>'
            rowstyle='<Style ss:ID="rowstyle"><Font ss:FontName="Arial"/></Style>'
            config.style=[defstyle,numstyle,genstyle,rowstyle].join("")
        }

        var worksheet_template = '<?xml version="1.0"?>'+
            '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">'+
            '<ExcelWorkbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"></ExcelWorkbook>'+
            '<Styles>'+config.styles+'</Styles>'+
            '<Worksheet ss:Name="Sheet1">'+
            (config.table || '<Table>') +
            data.columns.join("\n") +
            '^ROWS^'+
            '</Table>'+
            '</Worksheet></Workbook>';
        var  celltemplate='<Cell><ss:Data ss:Type="String">$val</ss:Data></Cell>';
         if(!config.toprow && config.cols && config.cols.some(function(it){return it.label})){
            data.rows.unshift(config.cols.map(function(it){return it.label}))
            config.toprow=true
        }
        var rowidx= 1,rows =data.rows.map(
            function(row,i){
                return  row.map(function(it){
                    return celltemplate.replace(/\$val/,String( it ||'')).trim()
                }).join("")
            }
        ).map(function(itcells){
                rowidx++;
                return itcells?('<Row ss:Height="20" '+((rowidx==1 && config.toprow)?' ss:StyleID="toprow" ':'')+'>'+itcells +'</Row>'):""
            }).join("\n");


        var worksheet = worksheet_template.replace(/\^ROWS\^/, rows);
        return worksheet
    }
    var filename=config.filename||"excel_export.xls"
    var content=_gen(config);
    Util.download( content, filename,"data:application/vnd.ms-excel")

    //$con.log(worksheet)
    //var newWin= window.open('data:application/vnd.ms-excel,'+worksheet);
    //window.open('data:application/vnd.ms-excel,'+worksheet);
}
Util.download=(function( ){
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
        window.MozBlobBuilder || window.MSBlobBuilder;
    window.URL || (window.URL = window.webkitURL);
    window.saveAs || ( window.saveAs = (
            window.navigator.msSaveBlob ? function(b,n){ return window.navigator.msSaveBlob(b,n); } : false) ||
        window.webkitSaveAs || window.mozSaveAs || window.msSaveAs || (function(){
            // URL's

            if(!window.URL){ return false;  }
            return function(b,name,type){type=type||'text/text'
                var url;
                if(typeof(BlobBuilder)!="undefined"){
                    var bb = new BlobBuilder();
                    bb.append('body { color: red; }');
                    var blob = bb.getBlob(type);

                    url = URL.createObjectURL(blob); // Test for download link support
                }   else{
                    url='data:' + type + ';base64,' + self.btoa(b);
                }


                if( "download" in document.createElement('a') ){
                    var a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.setAttribute('download', name);
                    var clickEvent = document.createEvent ("MouseEvent");// Create Click event
                    clickEvent.initMouseEvent ("click", true, true, window, 0,
                        clickEvent.screenX, clickEvent.screenY, clickEvent.clientX, clickEvent.clientY,
                        clickEvent.ctrlKey, clickEvent.altKey, clickEvent.shiftKey, clickEvent.metaKey,
                        0, null);
                    a.dispatchEvent (clickEvent);// dispatch click event to simulate download
                }
                else{ window.open(url, '_blank', ''); // fallover, open resource in new tab.
                }
            };

        })() );
    return window.saveAs
})();

$.worker=(
    function _wrkr ( ){
        var cnt= 0
        var callbacks=[],baseWorker
        function _setup(callback,baseworker){

            if(typeof(workerBoilerplate)!="undefined"){
                if(!baseWorker){
                    baseWorker=workerBoilerplate.makeworker()
                }
                var nu
                if(baseworker===true){nu=baseWorker}
                else{
                    nu=workerBoilerplate.makeworker()
                }
                typeof(callback)=="function" && callback(nu)
                return nu;
            }
        }


        return {
            setup:_setup,
            baseWorker:baseWorker,
            build:function(nm,fn,onmsg){
                if(typeof(nm)=="function"){onmsg=fn;fn=nm;nm=fn.name||fn._name;}
                var nu=$.worker.setup(function(wrkr){
                    if(typeof(fn)=="function"){wrkr.define(nm,fn) ;}
                    if(typeof(onmsg)=="function"){wrkr.on(onmsg)}
                })

                return nu
            },
            fromModule:function(nm){
                //return an api
                $.worker.baseWorker.load(nm,function(res){
                    if(res.response){

                        var txt=res.response.trim()

                        var api=(1,eval)("(function(){ "+res.response+" })()")
                        if(api){

                        }
                    }

                })
                return $.worker.build(nm,fn,onmsg)
            },
            fromFn:function(nm,fn,onmsg){
                return $.worker.build(nm,fn,onmsg)
            },
            fromScript:function(scr,onmsg){
               return (function(url,callback){
                 var w=new Worker(ResURL.from(url).build());
                var pr=Promise.deferred()
                var counter= 0,callbacks={}
                if(!w) {return}
                     try {
                        w.postMessage(["PING"])
                    } catch (e) {
                    }

                 w.sendMessage=function(data,callback){
                     var tosend=data
                     if(typeof(callback)=="function"){
                         tosend._msgid= ++counter;
                         callbacks[tosend._msgid]=callback
                     }

                    if(this._structuredCloningSupport){this.postMessage(tosend)}
                    else{
                        this.postMessage(JSON.stringify(tosend))
                    }
                }
                w.__callback=function(){}
                if(typeof(callback)=="function"){
                    w.__callback= callback
                }
                w.onMessageReceived=function(ev){
                    var res, data = ev.data
                    if (data.structuredCloningSupport != null || (data.data && data.data.structuredCloningSupport != null)) {
                        this._structuredCloningSupport = !!(data.data?data.data.structuredCloningSupport:data.structuredCloningSupport)
                     }
                     if(!this._structuredCloningSupport && typeof (ev.data)=="string"){
                        data=JSON.parse(ev.data)
                    }
                    if(data && data._msgid && callbacks[data._msgid]){
                        var fn=callbacks[data._msgid];
                        delete callbacks[data._msgid];
                        fn.call(this,data);
                    }
                    w.__callback(data);
                }


                w.addEventListener("message",w.onMessageReceived)
                return w;

            })(scr,onmsg);
        }}
    }
)();





$.tracer=function(onend,maxdelay){
    var _log=[],done=0
    function flatten(args){var res=[]
        for(var i= 0,l=args,val;val=l[i],i<l.length;i++){
            if(val==null){ continue}
            var t=typeof(val)
            if(t=="object" && ({}).toString.call(val)=="[object Arguments]"){
                [].push.apply(res,flatten(val))
            } else {
                res.push(val)
            }
        }
        return res
    }
    var api={
        log:function(){if(done){return}
            var val= flatten(arguments);
            val.unshift(_log.length)
            _log.push(val.join(", "))
            return this
        },
        getTrace:function(){
            return _log
        },
        end:function(m){if(done){return}
            api.log(m);
            onend(api.getTrace())
            done=true
            return this
        }
    }
    if(maxdelay){
        setTimeout(function(){ api.end("Timed out")},maxdelay)
    }
    return api

}



$.webSocket=(function(){
    var io,channels={},_pending=null
    function ensureIO(){
        io||(io=$.websocketio);
        if(io &&io.isAvailable() && _pending){
            Object.keys(_pending).forEach(function(k){
                if(Array.isArray(_pending[k])){
                    while(_pending[k].length){io.on(k,_pending[k])}
                }
            });
            _pending=null;
        }
        return io
    }
    var api= {
        isState:function(state){
            return ensureIO()&&io.getState()===state
        },
        isAvailable:function(){
            return ensureIO()&&io.isAvailable()
        },
        isClosed:function(){ return this.isState(3) },
        isOpenOrBusy:function(){ return !this.isState(-1) },
        isOpen:function(){ return this.isState(1) },
        getState:function(){
             return ensureIO()&&io.getState()
        },
        send:function(data){
            ensureIO()&&io.dispatch.apply(io,arguments)
        },
        close:function(data){
            ensureIO()&&io.close()
        },
        channel:function(nm,fn){

            if(nm.indexOf("channel:")!=0){nm="channel:"+nm}
            if(!channels[nm]){
                channels[nm]=(function(str,s){
                    var name=(str.indexOf("channel:")!=0?"channel:":"")+str
                    return {defcallback:null,
                        send:function(data){s.send({type:name,message:data})},
                        off: function(){s.send({type:"unregisterchannel",channel:name})},
                        on: function(fn){
                            var c;
                            if(typeof(fn)!="function"){
                                c=this.defcallback
                            } else{
                                c=function(f,a){
                                    var dd=a.data||a,msg=dd.message||{};
                                    f(msg)
                                }.bind(this,fn)
                                if(!this.defcallback){this.defcallback=c}
                            }

                            if(c){s.on("channel:"+name,c)}
                        }
                    }
                })(nm,$.webSocket);
                if(!fn){fn={}}
                if( typeof(fn)=="object"){
                    $.webSocket.send("registerchannel",{name:nm,mode:fn.mode})
                    if(typeof(fn.callback)=="function"){
                        hannels[nm].on( fn.callback)
                    }
                } else if(typeof(fn)=="function"){
                    channels[nm].on(fn)
                }
            }
            if(typeof(fn)=="function"){
                channels[nm].on(fn)
            }
            return channels[nm]
        },
        onOpen:function(fn){  this.on("open",fn)  },
        onClose:function(fn){ this.on("close",fn)  },
        onError:function(fn){  this.on("error",fn)  },
        off:function(ev,fn){ensureIO()&&io.off(ev,fn) },
        on:function(ev,fn){
            if(ensureIO() ){io.on(ev,fn)}
            else{
                _pending||(_pending={});
                _pending[ev]||(_pending[ev]=[]);
                _pending[ev].push(fn)
            }
        }
    }
    api.dispatch=api.send
    return api
})();

Util.fireBug={
    activate: function () {
        this.__activated=true;
        if(typeof(firebug)!="undefined"&&firebug.win){firebug.win.show();return}
        var scr = document.createElement('script');
        scr.setAttribute('src', 'http://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js');
        document.body.appendChild(scr);
        (function () {
            if (window.firebug && window.firebug.version) {
                firebug.init();
            } else {
                setTimeout(arguments.callee);
            }
        })();
        void(scr);
    },
    deActivate:function(){if(typeof(firebug)!="undefined"&&firebug.win){firebug.win.hide();return}}
};
Util.screenShare=function(){
    Util.injectScript("//cdn.WebRTC-Experiment.com/getScreenId.js",function(){

    })


}
document.addEventListener("keyup",function(ev){
    if(ev.altKey&&ev.keyCode==71){
        if(!Util.fireBug.__activated) {
            Util.fireBug.activate()
        }
    }
})
/*options - maxIterations, start, end, useAnimFrame , noauto , maxduration cancelOn callback delay dur memo context args
 callback gets memo as single arg

 start
 defer
 until
 when
 every
 queue
 */
$.timer = function () {
    function makeCheck(cb) {
        var callback = cb;
        if (typeof cb == "function") {
            callback = function (e) {
                return !cb(e)
            }
        } else if (typeof cb == "string") {
            callback = function () {
                try {
                    return !(1, eval)(cb)
                } catch (e) {
                }
                return true
            }
        } else if (cb && typeof cb == "object") {
            var o = cb;
            if ($.isArray(cb)) {
                o.container = o[0];
                o.member = o[1]
            }
            if (o.container && typeof o.container == "object" && o.member && typeof o.member == "string") {
                callback = function () {
                    return !!(typeof o.container[o.member] == "undefined")
                }
            }
        }
        return callback
    }

    function resVal(e) {
        if (typeof e == "function") {
            return e()
        }
        return e
    }

    function num(e, t) {
        t == null && (t = -1);
        if (typeof e == "number" || typeof e == "string" && typeof +e == "number") {
            return +e
        }
        return t
    }

    function _parseArgs() {
        var e = $.makeArray(arguments), t = {};
        if (e[0] && typeof e[0] == "object") {
            t = e.shift();
            t.dur = num(resVal(t.dur || t.duration), 0);
            t.delay = num(resVal(t.delay), 0);
            t.auto = resVal(t.auto);
            t.noauto = t.auto === false;
            t.onend = t.end || t.onend;
            t.maxduration = Number(t.maxduration) || 0;
            if (t.maxduration <= 1) {
                t.maxduration = 0
            }
            if (typeof t.onend !== "function") {
                t.onend = null
            }
            t.cancelOn = t.cancelOn === undefined ? t.cancelon : t.cancelOn;
            t.useAnimFrame = t.useAnimFrame || t.useanimframe
        }
        if (e.length) {
            if (e[e.length - 1] && typeof e[e.length - 1] == "object") {
                t.memo = e.pop()
            }
            if (num(e[0]) >= 0) {
                t.dur = +e.shift()
            }
            if (num(e[0]) >= 0) {
                t.delay = +e.shift()
            }
            if (typeof e[0] == "function") {
                t.callback = e.shift()
            }
            if (typeof e[0] == "function") {
                t.onend = e.shift()
            }
            if (e.length && t.dur == null) {
                if (num(e[0]) >= 0) {
                    t.dur = e.shift()
                }
                if (t.delay == null && num(e[0]) >= 0) {
                    t.delay = e.shift()
                }
            }
            if (typeof e[0] == "boolean") {
                t.noauto = e.shift()
            }
            if (typeof t.cancelOn == "undefined") {
                t.cancelOn = e.pop()
            }
        }
        t.delay = Number(t.delay) || 0;
        t.dur = num(t.dur, 0);
        if (t.cancelOn === undefined) {
            t.cancelOn = false
        }
        t.memo || (t.memo = {});
        if (t.memo.maxIterations && !t.maxIterations) {
            t.maxIterations = t.memo.maxIterations
        }
        return t
    }

    var nw = Date.now, _timers = {}, _to = setTimeout, _holder = function (e) {
        var t = [[nw(), 0, 0, "Start"]], n = e;
        return {
            entries: t, record: function () {
                var n = nw();
                _timers[e] && t && t.push([n, n - t[0][0], n - t[t.length - 1][0]].concat($.makeArray(arguments)));
                return this
            }, end: function (n) {
                if (!_timers[e]) {
                    return t
                }
                var r = nw();
                t.push([r, r - t[0][0], r - t[t.length - 1][0], "End"]);
                var i = t.slice();
                delete _timers[e];
                if (typeof n == "function") {
                    n(i)
                }
                return this
            }, toString: function () {
                var e = t.length - 1, n = t.slice();
                return "Total time:" + n[e][1] + "(Milliseconds)\n	" + n.map(function (e, t) {
                        return t == 0 ? "Start:" + (new Date(e[0])).toString() : ["From Start:" + e[1], "From prior:" + e[2], e.slice(3).join(", ")].join("	")
                    }).concat([""]).join("\n	") + ("End:" + (new Date).toString())
            }
        }
    };
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (e) {
                window.setTimeout(e, 1e3 / 60)
            }
    }
    var api = {
        start: function (e) {
            if (_timers[e]) {
                return _timers[e]
            }
            return _timers[e] = _holder(e)
        }, defer: function (e, t) {
            t = Math.max(Number(t), 0);
            if (t < 10) {
                t = t * 1e3
            }
            return setTimeout(e, t)
        }, after: function () {
            var e = _parseArgs.apply(this, arguments);
            e.maxIterations = 1;
            if (e.dur && !e.delay) {
                e.delay = e.dur;
                e.dur = 0
            }
            return this.run(e)
        }, until: function () {
            var e = _parseArgs.apply(this, arguments);
            e.callback = makeCheck(e.callback);
            return this.run(e)
        }, when: function (e, t, n) {
            n = n || {};
            n.cancelOn = false;
            n.callback = function (t) {
                return !e(t)
            };
            n.onend = t;
            var r = _parseArgs.call(this, n);
            return this.run(r)
        }, fixed: function () {
            var e = _parseArgs.apply(this, arguments), t = e.dur, n = e.callback, r = e.memo;
            if (r && r.useAnimFrame) {
                n = function () {
                    window.requestAnimationFrame(callback)
                }
            } else {
                t = Math.max(100, t)
            }
            var i = {};
            i.cancel = function () {
                this.handle && clearInterval(this.handle)
            }.bind(i);
            i.handle = 0;
            if (e.delay) {
                setTimeout(function () {
                    i.handle = setInterval(n, t, r)
                }, e.delay)
            }
            return i
        }, run: function () {
            var e = _parseArgs.apply(this, arguments);
            e.context = e.context || self;
            e.args = e.args || [];
            return function (e) {
                var t = e, n = t.memo || {};
                var r = 0, i = 0, s = null, o = 0, u = "maxIterations";
                if (typeof t.callback != "function") {
                    return
                }
                var a = {}, f = typeof t.cancelOn === "function";
                a.cancel = function (e) {
                    var t = this.config;
                    r && clearTimeout(r);
                    r = 0;
                    if (typeof n.end === "function") {
                        t.onend = n.end
                    }
                    if (typeof t.onend == "function") {
                        t.onend(e || s, n)
                    }
                }.bind(a);
                r = 0;
                n = n || {};
                a.pause = function (e) {
                    i = 1;
                    r && clearTimeout(r);
                    r = 0;
                    if (e && typeof e.then == "function") {
                        e.then(function () {
                            this.resume()
                        }.bind(this))
                    } else if (typeof e == "number") {
                        _to(function () {
                            this.resume()
                        }.bind(this), e)
                    }
                    return this
                }.bind(a);
                a.resume = function (e) {
                    if (!i) {
                        return
                    }
                    i = 0;
                    var t = this.config.dur;
                    _to(function () {
                        r = _to(l, t)
                    }, Number(e) || 0)
                }.bind(a);
                var l, c = function () {
                    var e = this.config;
                    if (i) {
                        return
                    }
                    var a = [n].concat(t.args);
                    s = e.callback.apply(t.context, a);
                    o++;
                    if (e[u] >= 1 && e[u] <= o || n.cancel === true || f && e.cancelOn(s, n) === true || s === e.cancelOn || t.stopAt && t.stopAt < Date.now()) {
                        this.cancel(s)
                    } else {
                        r = _to(l, num(n.duration) >= 0 ? +n.duration : e.dur)
                    }
                    if (typeof n.callback === "function" && n.callback !== e.callback) {
                        e.callback = n.callback
                    }
                    if (n.pause === true) {
                        this.pause()
                    }
                };
                l = c.bind(a);
                if (t.useAnimFrame || n.useAnimFrame) {
                    l = function () {
                        window.requestAnimationFrame(c.bind(a))
                    }
                }
                $.defineValue(a, "config", {value: t, writable: false, configurable: false});
                a.pause();
                a.start = function (e) {
                    if (t.maxduration) {
                        t.stopAt = Date.now() + (t.maxduration <= 10 ? t.maxduration * 1e3 : t.maxduration) + 100
                    }
                    this.resume(t.dur)
                }.bind(a);
                if (!t.noauto) {
                    a.start()
                }
                return a
            }.call(this, e)
        }
    };
    api.queue = api.every = api.run;
    return api
}();

$.stack=(function(){
    var NILL={nill:true,valueOf:function(){return null}}
    Array.prototype.contains||(Array.prototype.contains=function(a){return this.indexOf(a)>=0});
    function asNum(a,df){
        return (typeof(a)=="number"||(typeof(a)=="string"&&!isNaN(a))) && (isFinite(a))?Number(a):(df||0);
    }
    function makeMatcher(s){
        if(!s){return function(a){return a==this[0]}.bind(null,[s])}
        if(typeof(s)=="function"){return s}

        switch(Object(s).constructor.name){
            case "RegExp":return RegExp.prototype.test.bind(s);break;
            case "Array":return Array.prototype.contains.bind(s);break;
            case "Date":return function(a){return !!(!a?false:+(typeof(a)=="string"?new Date(a):a) == this[0])}.bind(null,[+s]);break;
            case "Boolean":;case "Number":return function(a){return +a==this[0]}.bind(null,[+s]);break;
            default:return function(a){return a==this[0]||(a &&a.valueOf&&a.valueOf()==this[0].valueOf)||
                (typeof(this[0])=="object" && a in this[0])
            }.bind(null,[s])
        }
    }
    return function _stack(arr0){
        if(typeof(arr0)=="string"){arr0=arr0.split("")}

        if(!(arr0&&arr0.length&&arr0.length>0)){return NILL}
        var arr=arr0.slice()
        var tx=arr.slice(),_curr=-1,ln=arr.length
        function at(i){return tx[i]}
        function take(i,cnt){
            if(cnt>1){}
            return tx[i]
        }
        var _saved={},_data=tx.map(function(){return {}});
        return {
            toArray:function(fn){return typeof(fn)=="function"?tx.map(fn):tx},
            index:function(){ return _curr},
            back:function(){this.prior();return this},
            forward:function(){this.next();return this},
            next:function(){
                return this.value=this.hasNext()?at(++_curr):NILL
            },
            takeMany:function(n0){var accum=[],n=asNum(n0,1);if(n<=0){return []}
                if(n==1){return [this.next()]}
                var i=-1;while(i++<n-1){accum.push(this.next())}
                return accum
            },
            take:function(){
                return this.next()
            },
            hasNext:function(){
                return _curr<ln-1?this:null
            },
            until:function(test,memo){var accum=[],t=this;
                var fn=makeMatcher(test)
                if(fn){
                    while(t.hasNext()){
                        if(fn(t.peek(),memo)){break;}
                        accum.push(t.next())
                    }
                }
                return accum
            },
            beforeFirst:function(){_curr=-1;return this;},
            last:function(i){_curr=ln-1;return this;},
            first:function(i){_curr=0;return this;},
            absolute:function(i){_curr=asNum(i,_curr);return this;},
            data:function(){if(_curr==-1){return this}
                if(arguments.length==0){return _data[_curr]}else{_data[_curr]=arguments[0];return this;}
            },
            save:function(nm){nm||(nm||"_def");_saved[nm]=_curr;return this},
            restore:function(nm){nm||(nm||"_def")
                _saved[nm]&&_saved[nm]>=0&&(_curr=_saved[nm]);
                return this
            },
            wasNull:function(){return this.value==null||this.value.nill},
            skip:function(n){
                if(typeof(n)!="number"){
                    this.until(n)
                }  else{
                    var i=asNum(n,1);
                    while(--n)this.next();
                }
                return this;
            },
            prior:function(n){
                var i=_curr-asNum(n,1)
                return this.value=i>=0?at(_curr=i):NILL
            },
            peek:function(n){var i=_curr+asNum(n,1)
                return i>=0&&i<ln?at(i):NILL
            },
            transform:function(v,i0){var i=asNum(i0,_curr);
                if(!(i>=0&&i<ln)){return this}
                tx[i]=typeof(v)=="function"?v(at(i)):v;
                return this;
            },
            transformAll:function(a){ if(!(typeof(a)=="function")){return this}
                tx=tx.map(function(i){return a(at(i),i)})
                return this;
            },
            getTx:function(){return tx}
        }
    }
})() ;
/*
 $.parseExpr(expr,{context:object, reserved:[],ignore:[] })
 */

Util.injectScript=function(url,optns){
    var o={};
    if(typeof(optns)=="function"){o.callback=optns}
    else if(optns&&typeof(optns)=="object"){o=optns}
    var scr=document.createElement("script")
    scr.type=o.type||"text/javascript";
    if(o.async){scr.async=true}
    if(o.promise&&typeof(o.promise)!="object"){o.promise=Promise.deferred()}
    if(!o.callback&& o.promise){o.callback=function(){o.promise.resolve(this)}}
    if(!o.error&& o.promise){o.error=function(){o.promise.reject(this)}}
    if(o.callback){scr.onload= o.callback};
    if(o.error){scr.onerror= function(ev){ o.error(ev)}}
    scr=(document.head||document.querySelector("head")||document.body).appendChild(scr)
    scr.src=url;
    return o.promise||scr;

}

