



    function titleize(s){
        var ss=s.replace(/(color|justify|insert|script|list|rule|format)/gi," $1 ").trim().split(/\s+/).map(function(a){return a.charAt(0).toUpperCase()+ a.substr(1)}).join(" ").trim()
        return ss
    }
    function buildselect(k,list){
         return k
    }
    var debugMode=1,cssFile=""
    var baseUrl = window.document.location.protocol + "//" + document.domain + "/";
    var lang = "en" ,encoding = "UTF-8",isRichText = false;
    var defaultWidth = 500,defaultHeight = 200;
    var allRTEs = "",currentRTE = "";
    var selectionText = "",rng,lastCommand,maxLoops = 20;
    //browser vars
    var ua = navigator.userAgent.toLowerCase();
    var isIE = ((ua.indexOf("msie") != -1) && (ua.indexOf("opera") == -1) && (ua.indexOf("webtv") == -1));
    var ieVersion = parseFloat(ua.substring(ua.indexOf('msie ') + 5));
     var isGecko = (navigator.product == 'Gecko'), geckoRv = 1;
    var isSafari = (ua.indexOf("safari") != -1),isIphone = (ua.indexOf("iphone") != -1),isIpad = (ua.indexOf("ipad") != -1);
    //var safariVersion = parseFloat(ua.substring(ua.lastIndexOf("safari/") + 7));
    var webkitVersion = 22
     var isKonqueror = (ua.indexOf("konqueror") != -1), konquerorVersion = parseFloat(ua.substring(ua.indexOf('konqueror/') + 10));
    var isOpera = (ua.indexOf("opera") != -1), isNetscape = (ua.indexOf("netscape") != -1), netscapeVersion = parseFloat(ua.substring(ua.lastIndexOf('/') + 1));

    var loopCnt = 0;

    var mdl={InsertHorizontalRule:{},hilitecolor:"Background Color",
        forecolor:"Text Color",insertLink:{},
        insertTable:{},InsertSpecialChar:{}
    }
    var cmds="fontName,heading,bold,italic,underline,strikethrough,superscript,subscript,justifyleft,justifycenter,justifyright,justifyfull,inserthorizontalrule,insertorderedlist,insertunorderedlist,outdent,indent,forecolor,hilitecolor,insertlink,unlink,addimage,insertspecialchar,inserttable,cut,copy,paste,undo,redo,removeformat".split(",")
	var __initSetup=0
    function _setup(cntnrortextarea,content, readOnly){
	if(!__initSetup){
		initsetup()
	}
        var justifybutton=null,justify,oRTE,toolbar ,contentDoc,contentWin,onchange=[],toolitems={},  toolbarmsg=null,
            hidden="insertlink,unlink,addimage,insertspecialchar,inserttable,strikethrough,superscript,subscript,cut,copy,paste,forecolor,hilitecolor".split(",")

        function _setContent(v){
             v=String(v).replace(/\[TS\]/gi,"<").replace(/\[TE\]/gi,">").trim();
            if(v&&v.indexOf("<")!==0){
                //v="<pre>"+v+"</pre>"
            }
            if(v=="0"||v=="<pre>0</pre>"){v=""}
            contentDoc.body.innerHTML=v
            _cleanup()
            updatemsg()
        }
        function syncJustify(v){     if(!justifybutton){return}
            var nm=v.replace("justify","").replace(/^\w/,function(a){return a.toUpperCase()})
            var e=justify.querySelector("."+nm)
            justifybutton.className=  "rte-command rte-command-Justify "+ nm;
            justifybutton.dataset.key=  v;
            justifybutton.style.backgroundPosition=e.style.backgroundPosition
            justifybutton.title=  v;
        }
        function buildtoolbar(){
             var toolbarhtml=cmds.map(function(k,i1){
                var cntnt="",i=i1-2
                toolitems[k]={dom:null}
                if(hidden.indexOf(k)>=0){toolitems[k].hidden=true;return}

                toolitems[k].selected=false

                 if(k=="fontName"){
                    return ("<select class='rte-command rte-command-fontName' title='font name' data-key='fontName'>"+["Andale Mono","Arial","Arial Black","Comic Sans MS","Courier New","Georgia","Impact","Times New Roman","Trebuchet MS","Verdana","Webdings"].map(function(k){return "<option value='"+k+"' style='font-family:"+ k+";'>"+k+"</option>"}).join("")+"</select>")
                } else if(k=="heading"){
                    return ("<select class='rte-command rte-command-heading' title='Headings' data-key='heading'>"+["1",'2','3','4','5' ].map(function(k){return "<option value='H"+k+"'>Heading "+k+"</option>"}).join("")+"</select>")
                }
                if(k.indexOf("color")>=0){
                    cntnt="<input type='color'  title='"+titleize(k)+"' name='toolbar-color-"+k+"'  style='height:15px;width:20px;border:none;margin-top: 11px;background:transparent;  padding:0;'/>"
                }
                return "<label class='rte-command rte-command-"+titleize(k)+"' title='"+k+"' style='background-position:-"+(i*24)+"px "+(i?-2:0)+"px' tabIndex='1' data-key='"+k+"'>"+cntnt+"</label>"


            }).join("");
            toolbar.innerHTML="<label class='toolbar-msg' style='padding-right:5px;white-space:nowrap;font-size:.8em;'>..</label>"+  toolbarhtml;

            [].forEach.call(toolbar.querySelectorAll(".rte-command"),function(it){
                var k=it.dataset.key
                if(!toolitems[k]){return}
                toolitems[k].dom=it;
             });
            var  jusifypar=toolbar.parentNode ;
                justify=jusifypar.appendChild(document.createElement("div"));  justify.className="justifypop"
            justify.style.cssText="position:absolute;width:24px;height:auto;z-index:10;";
            function _h(evt){
                document.removeEventListener ("mousedown", _h)
                if(!evt||  !justify.contains (evt.target)) {
                     justify.style.display="none"
                } ;
                if(_h.popuptimer){clearTimeout(_h.popuptimer);_h.popuptimer=0}
            }
            var doc=document;
            contentDoc.addEventListener("mousedown",function(){
                [].forEach.call(doc.querySelectorAll(".justifypop"),function(it){
                      it.style.display="none"
                })
            })
            justify.addEventListener("mousedown",function(ev){
                if(ev.target.classList.contains("rte-command")){
                    syncJustify(ev.target.dataset.key)
                    rteCommand( ev.target.dataset.key);
                 }
                _h();
            });
            justify.style.display="none";


            [].forEach.call(toolbar.querySelectorAll(".rte-command-Justify"),function(it,i){
                var nu=justify.appendChild(it.cloneNode(true));nu.style.display="block"
                if(i>0){it.style.display="none"}else{
                    justifybutton=it;
                    it.addEventListener("mousedown",function(ev){
                      var b=it.getBoundingClientRect(),b2=jusifypar.getBoundingClientRect()
                        justify.style.top=(b.top-b2.top)+"px"
                        justify.style.left=(b.left-b2.left)+"px"
                        justify.style.width=b.width+"px"
                        justify.style.height=(b.height*4)+"px"
                        justify.style.display="block"
                        document.removeEventListener ("mousedown", _h)
                        setTimeout(function(){document.addEventListener("mousedown",_h)},100)
                        _h.popuptimer=setTimeout(_h,2500)

                     })
                }
                //it.oninput=it.onchange=function(){  rteCommand( this.parentNode.dataset.key,this.value)}
            });
            [].forEach.call(toolbar.querySelectorAll("input"),function(it){
                it.oninput=it.onchange=function(){  rteCommand( this.parentNode.dataset.key,this.value)}
            });
            [].forEach.call(toolbar.querySelectorAll("select"),function(it){
                it.oninput=it.onchange=function(){  rteCommand( this.dataset.key,this.value)}
            });
            toolbarmsg =toolbar.querySelector(".toolbar-msg")
            toolbarmsg && (toolbarmsg.style.display="none")
            toolbar.addEventListener("mousedown",function(ev){
                if(String(ev.target.tagName).toUpperCase()=="SELECT"){return}
                if(ev.target.classList.contains("rte-command-Justify")){return}
                if(ev.target.classList.contains("rte-command")){
                      rteCommand( ev.target.dataset.key)
                    syncToolbar()
                }
            })

        }
        var acts=["fontName","heading","bold","italic","underline","forecolor","hilitecolor","strikethrough","superscript","subscript","justifyleft","justifycenter","justifyright","justifyfull"];
         function syncToolbar( t) {
            acts.forEach(
                function(k){
                    if(toolitems[k]&&!toolitems[k].hidden&&toolitems[k].dom){
                        toolitems[k].dom.classList.remove("selected")
                    }
                }
            );
            if(!t){
                try{t=contentWin.getSelection().getRangeAt (0).commonAncestorContainer} catch(e){}
             }
            if( !(t&&t.nodeType)){  return  }
            var modes={},align
            var par=t.nodeType==3?t.parentNode:t,tag=String(par.nodeName).toLowerCase();
            while(par&& par.style){
                var tag=String(par.nodeName).toLowerCase();
                if(modes.bold==null&&(tag=="b"||par.style.fontWeight=="bold"||par.style.fontWeight=="bolder")){
                    modes.bold=1
                } else if(modes.italic==null&&(tag=="i"||par.style.fontStyle=="italic")){
                    modes.italic=1
                }  else if(modes.underline==null&&(tag=="u"||par.style.textDecoration=="underline")){
                    modes.underline=1
                } else if(modes.strikethrough==null&&(tag=="strike"||par.style.fontStyle=="line-through")){
                    modes.strikethrough=1
                } else if(modes.superscript==null&&(tag=="sup" )){
                    modes.superscript=1
                } else if(modes.subscript==null&&(tag=="sub" )){
                    modes.subscript=1
                }else if(modes.forecolor==null&&( (par.style.color&&par.style.color!="transparent"&&par.style.color!="inherit"))){
                    modes.forecolor=par.style.color
                } else if(modes.hilitecolor==null&&( (par.style.backgroundColor&&par.style.backgroundColor!="transparent"&&par.style.backgroundColor!="inherit"))){
                    modes.hilitecolor=par.style.backgroundColor
                } else if(tag=="font"&&!modes.fontName){
                    modes.fontName=par.getAttribute("face")
                } else if(!modes.heading&&tag.indexOf("h")==0){
                    modes.heading=tag
                }
                 else if( !modes.justify&&( (par.style.textAlign&&par.style.textAlign!="inherit"))){
                    align=par.style.textAlign
                    //modes["justify"+(align=="justify"?"full":align)]=1
                    modes["justify"]=(align=="justify"?"full":align)
                }
                par=par.parentNode
            };
             if(!modes.justify){modes.justify="left"}
             var justifydone=0
            acts.forEach(
                function(k){
                    if(k.indexOf("justify")==0){
                        if(!justifydone) {justifydone=1;
                            syncJustify ("justify" + modes.justify)
                        }
                    }
                    else if(toolitems[k]&&!toolitems[k].hidden&&toolitems[k].dom){
                        if(String(toolitems[k].dom.tagName).toLowerCase()=="select"){
                            toolitems[k].dom.value=modes[k]
                        } else {
                           if(modes[k]) {
                                toolitems[k].dom.classList.add ("selected")
                            }else {
                                toolitems[k].dom.classList.remove ("selected")
                            }
                        }
                    }
                }
            );
        }
        function enableDesignMode( html, readOnly) {
            try {
                if (cssFile.length > 0) {
                    var frameStyle = "<style type=\"text/css\">@import url(" + cssFile + ");</style>\n";
                } else {
                    var frameStyle = "<style type=\"text/css\">\n";
                    frameStyle += "body {\n";
                    frameStyle += "margin: 0;padding:2px;height: 100%;overflow:auto;background: #FFF;box-shadow: inset 1px 1px 3px #ccc;border-radius: 2px;\n";
                    frameStyle += "}\n";
                    frameStyle += "</style>\n";
                }

                var frameHtml = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n";
                frameHtml += "<html   xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" style=\"height: 100%;overflow: hidden;\">\n";
                frameHtml += "<head>\n";
                frameHtml += "<meta http-equiv=\"content-type\" content=\"text/html; charset=UTF-8\" />\n";
                frameHtml += "<base href=\"" + baseUrl + "\" />\n";
                //if (!isGecko) frameHtml += frameStyle;
                frameHtml += frameStyle;
                frameHtml += "</head>\n";
                frameHtml += "<body  tabIndex=\"1\">\n";
                 //frameHtml += html + "\n";
                //if (isGecko) frameHtml += frameStyle;
                frameHtml += "</body>\n";
                frameHtml += "</html>";
                contentWin=oRTE.contentWindow
                contentDoc=oRTE.contentDocument||contentWin.document
                if(!contentWin&&contentDoc){contentWin=contentDoc.defaultView}
                try {
                    if (!readOnly) {
                        contentDoc.designMode = "on";
                    }
                    if (isGecko) {
                        try {
                            contentDoc.open("text/html","replace");
                            contentDoc.write(frameHtml);
                            contentDoc.close();
                            if (!readOnly) contentDoc.addEventListener("keypress", keypress, true);
                        } catch (e) {
                            alert("Error preloading content."+e);
                        }
                        loopCnt = 0;
                    } else if (oRTE.contentWindow) {
                        //IE 5.5+
                        try {
                            contentDoc.open("text/html","replace");
                            contentDoc.write(frameHtml);
                            contentDoc.close();
                            if (!readOnly && isIE) contentDoc.attachEvent("onkeypress",  keypress);
                        } catch (e) {
                            alert("Error preloading content.");
                        }
                        loopCnt = 0;
                    } else {
                        //IE5 and Opera
                        contentDoc.open("text/html","replace");
                        contentDoc.write(frameHtml);
                        contentDoc.close();
                        if (!readOnly && isIE) contentDoc.attachEvent("onkeypress", keypress);

                        loopCnt = 0;
                    }
                    if (!readOnly) {
                        contentDoc.designMode = "on";

                        contentDoc.body.onselectstart=function(ev){
                            ev.target.parentNode.addEventListener("mouseup",function mup(evt){
                                    this.removeEventListener("mouseup",mup);
                                    syncToolbar(ev.target)

                             }
                        ) }
                        contentDoc.addEventListener("keyup", updatemsg);
                    }
                    if(html){
                        _setContent(html)
                    }
                    _cleanup()
                } catch (e) {
                    //some browsers may take some time to enable design mode. Keep looping until able to set. //
                    if (loopCnt < maxLoops) {
                        setTimeout(enableDesignMode, 100,html ,  readOnly );
                        loopCnt += 1;
                    } else {
                        alert("Error enabling designMode."+e);
                    }
                }
            } catch (e) {
                if (debugMode) alert(e);
            }
        }
        function _cleanup(){
            [].forEach.call(contentDoc.querySelectorAll("a"),function(it){it.setAttribute("target","_blank")});
            [].forEach.call(contentDoc.querySelectorAll("script"),function(it){it.parentNode&&it.parentNode.removeChild(it)});
            [].forEach.call(contentDoc.body.querySelectorAll("*"),function(it){
                if(it&&it.parentNode&&!String(it.textContent).trim()){
                    it.parentNode&&it.parentNode.removeChild(it)
                }
            });
         }
        function _getContent(noencode){
            _cleanup()
            var s=String(contentDoc.body.innerHTML);
            return noencode?s:s.replace(/\</g,"[TS]").replace(/\>/g,"[TE]")
        }
        var TIMER= 0,lastContent=null
        function _dispatchOnchange(evt) {
            if(TIMER){return}
            TIMER=setTimeout(function(){
                TIMER=0;
                var c=_getContent()
                if(c==lastContent){return}
                lastContent=c;
                if(onchange.length){
                    onchange.forEach(function(it){it.call(this,c)},this)
                }
            },100)
        }
            function setfocus(evt) {
            try {
                window.top.addEventListener('focus',
                    function _onfoc(ev){
                        window.top.removeEventListener('focus',_onfoc)
                        _dispatchOnchange(ev)
                    });

                if (contentWin) {
                    contentWin.focus();
                }
                //contentDoc.focus();

            } catch(e){}
        }
        function rteCommand(command, option) {
            //function to perform command
            setfocus()
            try {
                 contentDoc.execCommand(command, false, option);

                loopCnt = 0;
                return false;
            } catch (e) {
                if (debugMode) alert(e); //Keep looping until able to set.
                if (loopCnt < maxLoops) {
                    setTimeout( rteCommand, 100,  command ,option);
                    loopCnt += 1;
                } else {
                    alert("Error executing command.");
                }
            }
        }
        function updatemsg(){
            if(toolbarmsg&&contentDoc&&contentDoc.body){var c=(contentDoc.body.innerHTML+"").trim() ;toolbarmsg.innerHTML=c.length+" / "+(c.split(/\s+/).length)+ " words"}

        }

        function keypress(evt){

                if(isGecko){geckoKeyPress(evt)}
         }
        //********************
        //Gecko-Only Functions
        //********************
        function geckoKeyPress(evt) {
            //function to add bold, italic, and underline shortcut commands to gecko RTEs
            try {
                var rte = evt.target.id;

                if (evt.ctrlKey) {
                    var key = String.fromCharCode(evt.charCode).toLowerCase();
                    var cmd = '';
                    switch (key) {
                        case 'b': cmd = "bold"; break;
                        case 'i': cmd = "italic"; break;
                        case 'u': cmd = "underline"; break;
                    };

                    if (cmd) {
                        rteCommand(rte, cmd);

                        // stop the event bubble
                        evt.preventDefault();
                        evt.stopPropagation();
                    }
                }
            } catch (e) {
                if (debugMode) alert(e);
            }
        }
        if(typeof(cntnrortextarea)=="string") {
            cntnrortextarea=document.getElementById (cntnrortextarea)
        }
         if(cntnrortextarea){
             cntnrortextarea=cntnrortextarea.el||cntnrortextarea

            var tag=String(cntnrortextarea.nodeName||cntnrortextarea.tagName).toLowerCase()
                ,b=cntnrortextarea.getBoundingClientRect()
            oRTE=document.createElement("iframe")
             oRTE.tabIndex=100;
            if(tag=="textarea"||tag=="input") {
                 oRTE=cntnrortextarea.parentNode.insertBefore (oRTE, cntnrortextarea.el||cntnrortextarea)
                cntnrortextarea.style.display="none"
                //oRTE.style.width="100%";
                //oRTE.style.height="100%";
                content=cntnrortextarea.value
                oRTE.style.width=b.width + "px";
                oRTE.style.height=b.height + "px";
                cntnrortextarea.parentNode.classList.add("rte-container")

            }else{
                oRTE=cntnrortextarea.appendChild(oRTE)
                oRTE.style.width="100%";
                oRTE.style.height="100%";
                cntnrortextarea.classList.add("rte-container")
            }

            oRTE.style.minHeight="60px";
            toolbar=oRTE.parentNode.insertBefore (document.createElement("div"), oRTE)
             toolbar.className="fxtx_5 rte-toolbar";
            toolbar.style.cssText=  'height: 24px;padding:0;-webkit-touch-callout: none;user-select: none;background-color:#fcfcfc'
        }

        enableDesignMode( content, !!readOnly)
        setfocus()
        buildtoolbar()
        try {
            //contentDoc.addEventListener ("mouseover", setfocus)
            contentDoc.addEventListener ("mousedown", setfocus)
            contentDoc.addEventListener ("keydown", setfocus)
        } catch(e){}
        return {
            getContent:_getContent,
            setContent:_setContent,
            setReadonly:function(){},
            isReadonly:function(){},
            onchange:function(fn){
                typeof(fn)=="function"&&onchange.indexOf(fn) ==-1 &&onchange.push(fn)
            }

        }
    }
function initsetup(){
    var style = document.createElement("style");
    style.appendChild(document.createTextNode(""));// WebKit hack :(
    var sheet=document.head.appendChild(style).sheet;
    var index=sheet.cssRules.length-1
     var rules={
        ".rte-command,.toolbar-msg":"vertical-align: top;position:relative;text-align:center;height:22px;display:inline-block;overflow:hidden;",
         ".rte-command":"width:24px;background:#eee;border:1px solid #eee;border-top:1px solid #ddd;outline:none;background-image:url(data:image/png;base64,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)",
        ".rte-command:hover,.rte-command.selected":"border:outset 1px rgb(190, 180, 180); ",
        ".rte-command:focus":"border:inset 1px #eee;" ,
         ".rte-toolbar":"opacity:.1",
         ".justifypop":"opacity:.01",
         ".rte-container:hover .rte-toolbar,.rte-container:hover .justifypop":"opacity:1",
         ".rte-container":"position:relative;border:1px solid #aaa;",
         "select.rte-command":"background:white;width:auto; padding-top: 0;max-width:100px;padding-bottom: 0;margin:0 2px;",
         ".rte-container iframe":"border:none;"
     }
    Object.keys(rules).forEach(
        function(selector){
            if(sheet.insertRule) {
                sheet.insertRule(selector + "{" + rules[selector]+ "}",  ++index );
            }
            else {
                sheet.addRule(selector, rules[selector],  ++index);
            }
        }
    )
	}
    var rtf= {
        /**
         * arguments
         * cntnrortextarea target domelement
         * content iniyial rtf content,
         * readOnly boolean
         */
        setup:_setup
    }


 module.exports=rtf;
  