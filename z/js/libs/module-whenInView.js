//self.lazy=(function(){
    var SCANTIMEOUT=1000
    if(!window.requestAnimationFrame) {
        window.requestAnimationFrame=window.webkitRequestAnimationFrame||
        window.mozRequestAnimationFrame||
        window.oRequestAnimationFrame||
        window.msRequestAnimationFrame||
        function(callback){
            window.setTimeout (callback, 1000 / 60);
        };
    }
    var  checkSelectors= [],
        doc=document,
        docEle=document.documentElement,
        body=document.body,
        viewport={top:0,left:0,width:0,height:0,scrollHeight:0,scrollWidth:0},
        callbackconfig=[],
        elconfig={},
        selectorconfig={},
        typecallbacks={},
        trackingklass="tracking__inview",
        idCounter=0,
        areEventsSetup=false,
        timer=0,
        busy= 0,
        toIgnore=[];

    doc.getElementsByClassName||(doc.getElementsByClassName=function(klass){return document.querySelectorAll("."+klass)});



    var _matches=(function _matches(){
        var el=body,nm=null

        for (var i = 0, l=["matches","webkitMatchesSelector","mozMatchesSelector","msMatchesSelector","oMatchesSelector"],len = l.length; i < len; i++) {
            if (typeof(el[l[i]])==="function") {
                nm=l[i];
                break;
            }
        }

        if(nm){
            return el[nm]
        }
        var indexOf=Array.prototype.indexOf
        return function matches(selector) {
            return indexOf.call(this.parentNode.querySelectorAll(selector),this)>-1;
        }


    })();

    function _getId(el){
        if(el.__uniqId){
            if(el.id){
                var id=el.__uniqId;
                delete el.__uniqId
                var idx=_toIgnore.indexOf(id);
                if(idx>=0){
                    _toIgnore[idx]=el.id;
                }
                if(elconfig[id]){
                    elconfig[el.id]=elconfig[id]
                    delete elconfig[id]

                }
                return el.id;
            }
            return el.__uniqId
        }
        if(el.id){return el.id}
        return el.__uniqId=++idCounter;
    }
    function _removeClass(el,klass){
        el.classList?el.classList.remove(klass):(el.className=el.className.replace(new RegExp("(^|\\s+)"+klass+"(\\s+|$)","g"),"").trim())
    }
    function _addClass(el,klass){
        el.classList?el.classList.add(klass):(el.className+=(el.className.replace(new RegExp("(^|\\s+)"+klass+"(\\s+|$)","g"),"")+" "+klass));

    }

    function getScrollContext(){
        var last=viewport.top
        updateViewPort()
        return {
            viewport:viewport,
            direction:last==viewport.top?"":(last<viewport.top?"down":"up")
        }
    }
    function updateViewPort(){
        viewport.top=body.scrollTop
        viewport.left=body.scrollLeft
        viewport.width=docEle.clientWidth
        viewport.height=docEle.clientHeight
        viewport.scrollHeight=body.scrollHeight
        viewport.scrollWidth=body.scrollWidth
    }

    function _onanimframe(){
        if(busy){return}
        busy=1;
        requestAnimationFrame( _check )

    }
    function _check(){
        busy=0;
        var cx=getScrollContext();
        if(callbackconfig && callbackconfig.length){
            for( var i= 0,l=callbackconfig,ln=l.length,cb;cb=l[i],i<ln;i++){
                if(cb && cb.callback){
                    cb.callback(cx,config)
                }
            }
        }
        var selelen=checkSelectors.length,vh=cx.viewport.height;
        for( var i= 0,l=doc.getElementsByClassName(trackingklass),ln=l.length,el;el=l[i],i<ln;i++){
            if(!el || (el.style && el.style.visibility=="hidden")){continue}

            var bounds=el.getBoundingClientRect(),t=bounds.top,b=bounds.bottom,_partial=false,_full=false
            //if(t>=0 && b<=vh){_full=true}
            var id=_getId(el),config=elconfig[id]
            if(!config){
                var sel = -1;
                if(selelen>1){
                    while (checkSelectors[++sel] && !_matches.call(el,checkSelectors[sel])) ;
                } else{sel=0}

                if(sel>-1 && checkSelectors[sel]){
                    config=selectorconfig[checkSelectors[sel]]
                }
            }
            config=config||{}
            var pass,offset=config.offset||0
            if(typeof offset === "function" ){
                pass=  offset(el,bounds,viewport)
            } else {t = t - (isNaN(offset)?0:offset);
                if(config.full) {
                    pass = t >= 0 && b <= vh
                }else if(config.partialtop){
                    pass = t >0 && t < vh
                }else if(config.partialbottom){
                    b = b - (isNaN(offset)?0:offset);
                    pass = b > 0 && b < vh
                } else{
                    pass = t < vh && b > 0

                }
            }
            if(pass){
                if(config.callback){
                    config.callback(el,cx,config);
                }
                if(!config.nopurge) {
                    _removeClass(el, trackingklass)
                    toIgnore.push(id)
                    delete elconfig[id]
                }
             }
         }
    }
    function _scan(){
        if(timer){return}
        timer=0;
        if(!checkSelectors.length){
            return
        }

        for( var s= 0, lsn=checkSelectors.length,sel;sel=checkSelectors[s],s<lsn;s++){
            if(!sel){continue}
            for( var i= 0,l=doc.querySelectorAll(sel),ln=l.length,el;el=l[i],i<ln;i++){
                if(!el ||toIgnore.indexOf(_getId(el))>=0){continue;}
                _addClass(el,trackingklass)
            }
        }
        timer=setTimeout(_scan,SCANTIMEOUT)
    }

    function addCheck(selector,options){
        if(!selector){return}
        if(typeof(options)=="function"){
            options={callback:options}
        }
        options=options||{};

        if(typeof(selector)==="object" && selector.nodeType===1){
            var id=_getId(selector)

            elconfig[id]=options
            _addClass(selector,trackingklass)

        } else if(typeof(selector)==="string"  ){
            checkSelectors.indexOf(selector)==-1 && checkSelectors.push(selector)
            selectorconfig[selector]=options;
        } else if(typeof(selector)==="function"  ){
            options.callback=selector;
            callbackconfig.push(options);
        }
        if(!areEventsSetup){
            window.addEventListener("scroll",_onanimframe);
            window.addEventListener("resize",_onanimframe);
            areEventsSetup=true;
        }
        _scan();
        _check();

    }
module.exports=addCheck;
    //return addCheck;
//})();
