;(function(scope){
    var contextpath  =  location.href.substr(location.href.indexOf("//")+2).split("/").slice(0,2).join("/")
    var url="{{cxpath}}"||("ws://"+contextpath+"/WebSocket"),heartbeat_interval=Number("{{heartbeat}}")||5000;
    if(typeof(scope)=="undefined"){scope={}}
    var CURLYSTART="{".charCodeAt(0)
    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }
    function str2bArr(str) {
        var buf = new ArrayBuffer(str.length*2); // 2 bytes for each _chr
        var bufView = new Uint16Array(buf);
        for (var i=0, strLen=str.length; i<strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return bufView;
    }
    function str2ab(str) {
        var buf = new ArrayBuffer(str.length*2); // 2 bytes for each _chr
        var bufView = new Uint16Array(buf);
        for (var i=0, strLen=str.length; i<strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    var _clientid=null,user,cookies=null
    var _ws=null,STATE,
        ERROR	=-1,	//The connection is not yet open.
        CONNECTING	=0,	//The connection is not yet open.
        OPEN	=1,		//The connection is open and ready to communicate.
        CLOSING	=2,		//The connection is in the process of closing.
        CLOSED	=3,		//The connection is closed or couldn't be opened.
        _listeners=[],_statelisteners=[],_pending=[],_pendingmsgs=[],callbacks={},statelisteners={open:[],closed:[],error:[]}

    if(typeof(WebSocket)=="undefined"&&typeof(MozWebSocket)!="undefined"){WebSocket=MozWebSocket}
    var _available=typeof(WebSocket)!="undefined" ?1:0,eventsSetup=0
    function _open(){
        if(!cookies){
            cookies=String(document.cookie).split(/;/).map(function(it){return String(it).trim().split("=")}).reduce(function(m,it){m[it[0]]=it[1];return m},{})
            if(cookies["x-clientid"]&&cookies["user"]&&typeof(app)!="undefined"&&app.user&&String(app.user.id)!=String(cookies["user"])){delete cookies["x-clientid"] }
            if(!cookies["x-clientid"]){
                _clientid="clientid"+((+new Date())+Math.round(Math.random(100)*100*31))
                document.cookie="x-clientid=" + _clientid + ";expires=0;"
            }else{_clientid=cookies["x-clientid"]};
        }

        var STATE =CLOSED, cntr= 0
        try{
            _ws=new WebSocket(url)
            _ws.onerror = function onerror(m){ _statechange(ERROR,m) }
            _ws.onopen = function onopen(){  _statechange(OPEN,true)  }
            _ws.onclose = function onclose(){_statechange(CLOSED,true) };
            _ws.onmessage = _onmessage;
            _available=1
            if(heartbeat_interval>100){
                setInterval(function(){
                    _pendingmsgs.push('{"heartbeat":1}')
                },heartbeat_interval)
            }
        } catch(e){
            _available=0
            console.error(e)
        }
    }
    function _statechange(nu,data){
        var type=nu==ERROR?"error":(nu==OPEN?"open":(nu=="CLOSED"?"closed":null)),doflush=data===true
        if(data===true){data=null}
        if(nu!=STATE){
            STATE=nu
            if(type){
                _statelisteners.filter(function(it){return it.type==type||it.type=="*"}).forEach(function(it){it.handle.call(_ws,type,data)});
            }
        }
        if(doflush){_flush()}
    }
    function _onmessage(e){
        var data= e.data,message;
        _statechange(OPEN)
        if(data){
            if (data instanceof ArrayBuffer) {    var bytearray = new Uint8Array(e.data);
                data= ab2str(bytearray.buffer)
            }
            if(typeof(data)=="string") {
                var __={}
                try{data=eval('__={"ph":'+data+"}")} catch(e){__={}}
                data=__.ph
            }
            if(data&&data.data&&Object.keys(data).length==1){data=data.data}
        }
        if(data==null){return}
        var result=data.result||data.data||data,type=data.type
        if(result&&typeof(result)=="string"&&result.charCodeAt(0)==CURLYSTART) {
            result=JSON.parse( result )
        }
        var ev={}
        result=result||{}
        var status=data.status
        //if(!result.response){result={response:result}}
        if(!status && !result.error&& !data.error){ev.status="OK"};
        ["type","token","cmd","channel","source","ts","data"].forEach(
            function(k){ev[k]=data[k]}
        );

        if(result&&typeof(result)=="object"){
            if(result.data &&Object.keys(result).length==1){result=result.data}
        }
        ev.data=result;
        if( ev.token && callbacks[ev.token]){
            var lst=callbacks[ev.token]  ;
            while(lst.length){var it=lst.shift();
                if(typeof(it)=="function"){it(ev)}
            }
            delete callbacks[ev.token]
        }
        var lst=_listeners.filter(function(it){return it.type==type||it.type=="*"})  ;
        while(lst.length){var it=lst.shift();
            if(it&&typeof(it.handle)=="function"){it.handle(ev)}
        }
    }
    function _ensure(andflush){
        if(!_ws&&_available){
            _open()
        } else if( _ws&&_available&&andflush){
            _flush( )
        }
    }
    var _timer=0;
    function _flush(){
        if(_timer||!_available){return}
        if(_ws.readyState==OPEN){
            try{
                while(_pendingmsgs.length){
                    if(_send(_pendingmsgs[0])){
                        _pendingmsgs.shift()
                    } else{break;}
                }
            } catch(e){console.log(e.message)}
        } else {
            if((_ws.readyState == CONNECTING||_ws.readyState == CLOSING)) {
                _timer=setTimeout (function(){_timer=0;_flush()}, 100)
            }else{
                if(_ws.readyState == CLOSED){
                    _timer=setTimeout (function(){_timer=0;_open()}, 1500)
                } else {
                    try {
                        console.log ("pinging")
                        _ws.send ("ping")
                    } catch(e) {
                        _timer=setTimeout (function(){
                            _timer=0; _flush ()
                        }, 1500)
                    }
                }
            }
        }


    }
    function _send(data){
        if(_ws.readyState==OPEN){
            _ws.send(_serlz(data))
            return true;
        }

    }
    function _serlz(d){
        return typeof(d)=="string"?d:JSON.stringify(d)
    }
    var _counter= (+Date.now())
    function userInfo(){
        if(!user){
            if(self.app&&self.app.user){
                user={id:self.app.user.id,sessionid:self.app.user.sessionid}
            }
        }
        return user
    }
    var api= {
        isAvailable:function(){
            if(_available==1&&scope.browser){
                if(((scope.browser.safari&&scope.browser.version<6)||(scope.browser.ie&&scope.browser.version<10))){_available=0;}
                else{_available=2}
            }
            return _available
        },
        init:function(){
            _ensure( true)
        },
        dispatch:function(){//type,data,target,callback
            if(!_available){return}
            var type=null,msg=null,cb=null,target
            var args=[].slice.call(arguments),token;
            if(typeof(args[args.length-1])=="function"){cb=args.pop()}
            if(typeof(args[0])=="string"){type=args.shift()}
        if(args[0]&&type){msg=args.shift()}
        if(args[0]&&msg){target=args.shift()}
        if(!msg&&args.length){msg=args.pop()}


    //if(args.length==3&&typeof(args[args.length-1])=="object"&&args[args.length-1].id){target=args.pop()}
    //if(args[args.length-1]&&typeof(args[args.length-1])=="object"){msg=args.pop(); }
    //if(args[0]&&typeof(args[0])=="string"){type=args.shift();}
    if(!cb&msg&&msg.callback){cb=msg.callback}
    if(!target&&msg.target){target=msg.target;delete msg.target}
    if(!msg){alert("no msg");return}
    type=type||msg.type||msg.id||msg.appid;
    token=msg.token||("t"+(++_counter));
    if(type.indexOf("::")>0){
        msg.cmd=type.substr(type.indexOf("::")+2)
        type=type.substr(0,type.indexOf("::") )
    }
    if(typeof(cb)=="function"){
        callbacks[token]||(callbacks[token]=[]);
        callbacks[token].push(cb)
    }
    delete msg.callback
    if(type&&msg.type==type){delete msg.type}
    var data={type:type,token:token,target:target,user:userInfo(),data: msg }
    var str=_serlz(data)
    _pendingmsgs.push(str)
    this.init();
},
    onOpen:function(mthd){_statelisteners.push({type:"open",handle:mthd}) ;},
onClose:function(mthd){_statelisteners.push({type:"closed",handle:mthd}) ;},
onError:function(mthd,remove){
    if(remove===true){
        var torem=_statelisteners.filter(function(it){return it.handle==mthd}).map(function(it){return _statelisteners.indexOf(it)})
        torem.sort(function(a,b){return a-b})
        while(torem.length){_statelisteners.splice(torem.pop(),1)}
        return
    }
    else{_statelisteners.push({type:"error",handle:mthd}) ;}
},
off:function(type,mthd){
    var torem=[]
    _listeners.forEach(function(it,i){if(it && it.type==type && (!mthd||mthd==it.handle)){torem.push(i)}})
    while(torem.length)  _listeners.splice(torem.pop(),1)
},
on:function(type,mthd){
    if(type=="error"){return this.onError(mthd)}
    if(type=="open"){return this.onOpen(mthd)}
    if(type=="close"){return this.onClose(mthd)}
    if(type=="message"){ type="*"}
    if(typeof(type)=="function"){
        _listeners.push({type:"*", handle:(function(chk,fn){
            return function(rec){
                if(chk(rec)){fn(rec)}
            }
        })(type,mthd)}) ;
    } else{
        _listeners.push({type:type, handle:mthd}) ;
        if(type!="*"){
            _pendingmsgs.push(_serlz({type:"register",type:"register",data:{name:type},user:userInfo()}))
        }
    }
    this.init();
}
}
scope.websocketio=api
})(self.$||{})