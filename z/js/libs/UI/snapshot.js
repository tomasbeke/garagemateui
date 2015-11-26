 function snapshot( cntnr,optns){
    optns=typeof(optns)=="function"?{callback:optns}:typeof(optns)=="number"?{width:optns}:optns
    optns=optns||{}
    if(typeof(cntnr)=="function"){optns.callback=cntnr;cntnr=null}
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    var RATIO=1.33333,width=Number(optns.width)||420,height=Math.round(width/RATIO),msglabel,canvas=null, video=null,buttonbar,  fr=window.requestAnimationFrame.bind(window),
        addEv=function(ev,hndl,el){ el=el||document;el.addEventListener(ev,hndl)                },
        hide=function(el){ [].concat(el).forEach(function(it){it.style.display="none"})},
        show=function(el){ [].concat(el).forEach(function(it){it.style.display=""})},
        remEv=function(ev,hndl, el){ el=el||document;el.removeEventListener(ev,hndl)},
        stopEv=function(evt ){ evt.stopImmediatePropagation?evt.stopImmediatePropagation():evt.stopPropagation()},
        getCursorXY=function getCursorXY(e,p) {p=p||{}
            var d=document,de=d.documentElement ,dbd=d.body;
            p.x=(e.pageX!=null) ? e.pageX : e.clientX + (de.scrollLeft ? de.scrollLeft : dbd.scrollLeft)
            p.y= (e.pageY!=null) ? e.pageY : e.clientY + (de.scrollTop ? de.scrollTop : dbd.scrollTop)
            return p
        },
        videoObj = { "video": true },
        errBack = function(error) {
            console.log("Video capture error: ", error.code);
        },
        setZ=function setZ(){ var ele=this;
            var m=Math.max.apply(Math,[].map.call(document.getElementsByTagName("*"),function(it){return Number(it.style.zIndex)||0}))
            ele.style.zIndex=Math.max(2000,m) +10
        }
        resetDims=function(){
            var ele=this,canvas = this.querySelector(".canvas"),video = this.querySelector(".video")   ,content=this.querySelector(".content")
            var dims={height:content.clientHeight,width:content.clientWidth},h=dims.height,w=dims.width;
            video.style.height=canvas.style.height=h+"px"
            video.style.width=canvas.style.width=w+"px"
            canvas.height=h ; canvas.width=w ;
            video.videoWidth=video.width=w ;video.videoHeight=video.height=h ;
            resultimg.style.height=h+"px"; resultimg.style.width=w+"px";
            setTimeout(function(){
                canvas.width=video.videoWidth;
                canvas.height=video.videoHeight;
                setZ.call(ele)

            },100)
        } ,
        mediacss="position:absolute;top:0;left:0;height:480px;width:640px;"  ,
        barcss="" ,
        msg="Click on 'Allow' to enable Camera" ,
        HTML="<div style='position:absolute;top:100px;left:100px;height:auto;width:auto;background-color:#bbb;z-index:100;overflow:hidden;" +
            "box-shadow:3px 3px 5px #999'>" +
            "<div class='close-link'     style='position:absolute;top:1px;right:3px;  line-height: 1.2;;cursor:pointer;z-index:400'>X</div>"+
            "<div class='hdr'            style='position:relative;height:18px;line-height:18px;padding:0 5px;cursor:move;text-shadow:1px 1px #666;letter-spacing:.1em'>Snapshot</div>" +
            "<div class='content'        style='position:relative;overflow:hidden;width:"+width+"px;height:"+(height)+"px;margin:1px 5px;overflow:hidden;box-shadow:-2px -2px 3px #999'></div>" +
            "<div class='buttonbar small '      style='position:relative;height:24px;text-align:center;'></div>" +
            "<div class='dialog-resizer' style='position:absolute;bottom:0;right:0;height:16px;width:16px;cursor:nwse-resize'>///</div>" +
            "</div>"

    if(!cntnr){
        var wrkr=document.createElement("div");wrkr.innerHTML=HTML
        var ele=document.body.appendChild(wrkr.firstChild)   ,content=ele.querySelector(".content")
        if(optns.top){ele.style.top=optns.top+"px"; }
        if(optns.left){ele.style.left=optns.left+"px"}
        ele.style.zIndex=2100

        setTimeout(setZ.bind(ele),100)
        setTimeout(setZ.bind(ele),1000)
        return snapshot(ele,optns )

    }

    var localMediaStream=null, el=  cntnr.el||cntnr    ,    content=el.querySelector(".content")
    canvas = content.querySelector(".canvas")   ||content.appendChild(document.createElement("canvas"))
    buttonbar = el.querySelector(".buttonbar")  ||el.appendChild(document.createElement("div"));
    var resultimg = content.querySelector(".resultimg")  ||content.appendChild(document.createElement("img"))
    resultimg.classList.add("resultimg");
    msglabel = el.querySelector(".msg")     ||el.appendChild(document.createElement("div"))
    video = content.querySelector(".video")     ||content.appendChild(document.createElement("video"))
    resultimg.style.position="absolute";resultimg.style.top="0";resultimg.style.left="0"


    function _shutdown(){
        if(!el){return}
        el.style.height=el.offsetHeight+"px";el.style.width=el.offsetWidth+"px";el.style.overflow="hidden";
        setTimeout(function(){
            el.classList.add("fxtx_5");
            el.style.top=(el.offsetTop+ (el.offsetHeight/2))+"px";el.style.left=(el.offsetLeft+(el.offsetWidth/2))+"px";
            el.style.height="1px";el.style.width="1px";
            setTimeout(function(){this.parentNode.removeChild(this)}.bind(el.el||el),1000);el=null;
        } ,0);
    }
    function _snap(){
        var canvas=el.querySelector(".canvas");
        canvas.style.display=""
        canvas.style.opacity="1"
        resetDims.call(el)
        var context= canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.offsetHeight*RATIO, canvas.offsetHeight);
        canvas.style.marginLeft=((canvas.offsetWidth-(canvas.offsetHeight*RATIO))/2)+"px"
        resultimg.src=canvas.toDataURL('image/webp');
        hide([video,button])
        show([resultimg,buttonretry,buttonsave])
    }
    addEv("click",_shutdown,el.querySelector(".close-link")   )
    //resize
    addEv("mousedown",function(evt){
        document.body.classList.add("noselection")
        var par=this.parentNode,el=par.querySelector(".content"), stel= {height:el.offsetHeight,width:el.offsetWidth},  st= getCursorXY(evt),
            mv=function(evt){
                var p1=getCursorXY(evt);
                fr(function(){
                    el.style.height=(stel.height+(p1.y-st.y))+"px"
                    el.style.width=(stel.width+(p1.x-st.x))+"px"
                })
            },
            mup=function(evt){
                remEv("mousemove",mv); remEv("mouseup",mup) ;  remEv("touchmove",mv); remEv("touchend",mup) ;
                resetDims.call(par)
                show(video)
                _snap()
                document.body.classList.remove("noselection")
            }
        addEv("mouseup",mup) ;addEv("touchend",mup)
        addEv("mousemove",mv);addEv("touchmove",mup)
    },el.querySelector(".dialog-resizer"))
    //move
    addEv("mousedown",function(evt){
        var el=this.parentNode,  stel= {top:el.offsetTop,left:el.offsetLeft},  st= getCursorXY(evt),
            mv=function(evt){
                var p1=getCursorXY(evt);
                fr(function(){
                    el.style.top=(stel.top+(p1.y-st.y))+"px"
                    el.style.left=(stel.left+(p1.x-st.x))+"px"
                })
            },
            mup=function(evt){
                remEv("mousemove",mv); remEv("mouseup",mup);remEv("touchend",mup);remEv("touchmove",mv)
            }
        addEv("mouseup",mup);addEv("touchend",mup)
        addEv("mousemove",mv);addEv("touchmove",mv)
    },el.querySelector(".hdr"))
    video.setAttribute("autoplay","autoplay")
    buttonbar.innerHTML=["Snap","Retry","Save"].map(function(it){return "<button class='"+(it+"button")+"' value='"+it+"'>"+it+"</button>"}).join("")
    msglabel.classList.add("msg");msglabel.style.cssText="position:absolute;top:50%;left:50%;margin-left:-"+((width-20)/2)+"px;margin-top:-10px;width:"+(width-20)+"px;line-height:18px;text-align:center;z-index:3; padding:2px;font-size:.9em";
    msglabel.innerHTML=msg
    var context     = canvas.getContext("2d"),
        button      = buttonbar.querySelector(".Snapbutton"),
        buttonretry = buttonbar.querySelector(".Retrybutton"),
        buttonsave  = buttonbar.querySelector(".Savebutton")
    video.style.cssText=mediacss;canvas.style.cssText=mediacss
    button.classList.add("snapbutton");video.classList.add("video");canvas.classList.add("canvas")
    video.style.zIndex=2;canvas.style.zIndex=1
    buttonretry.style.display="none"
    buttonsave.style.display="none"

    button.addEventListener("click",function(evt){
        stopEv(evt)
        _snap()
    })
    buttonsave.addEventListener("click",function(evt){
        if(optns.callback){
            if(optns.callback(resultimg,canvas,cntnr)!==false){ _shutdown()
            }
        }
    })
     document.addEventListener("keyup",function(evt){
         if(evt.which == 27 || evt.keyCode == 27){
            _shutdown()
         }

     })
    // Put video listeners into place
    buttonretry.addEventListener("click",function(evt){
        el.querySelector(".canvas").style.opacity="0.01"
        stopEv(evt)
        show([video,button])
        hide([resultimg,buttonretry,buttonsave])
        resetDims.call(el)

    });
    resetDims.call(el)
    var onCameraFail = function (e) {
        console.log('Camera did not work.', e);
    };


    if(navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia(videoObj, function(stream){
            if(msglabel){msglabel.style.display="none"}
            video.src = window.webkitURL.createObjectURL(stream);      localMediaStream=stream;
            video.play();
        }, errBack);
    } else if(getUserMedia) { // Standard
        getUserMedia(videoObj, function(stream) {
            video.src = stream;         localMediaStream=stream;
            video.play();
        }, errBack);
    }
    return {
        dom:cntnr,
        moveTo:function(x,y){
            $d.css(cntnr,{top:y ,left:x})
            resetDims.call(cntnr)
        },
        snap:function(){
            resetDims.call(cntnr)
            show(video)
            _snap()
        }

    }

}
 if(typeof UI !="undefined"){
     UI.snapshot=snapshot
 }

 module.exports=snapshot


/**
 * Created by atul on 4/8/14.
 */
