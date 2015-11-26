
!function(ns,factory){  $.AUTH =factory()
 ZModule.getWrapper(ns).resolve($.AUTH)

}("$.AUTH",function(){
    var baseurl=window.location.href.split("/").slice(0,4).join("/")+"/"
    var content= function(){
        /*
         <div id="auth__link" style="cursor:pointer;display:none;position:fixed;left:50%;top:50px;font-size:.9em;color:#eee;text-align:center;margin-left:-40px;width:80px;">Login</div>
          <div id="acctsec_outer" class="init">
     <div id="popup_close">x</div>

         <div id="acctsec" class="popup popuphidden">

         <div id="auth" class="code-font">
         <form id="loginresp" method="post" action="../router">
         <div style="clear: both;position: relative;height: 3em;">
         <input type="hidden" name="authenticate" id="authenticate" value="1">
         <label style="text-align:left;width: 99%;float: left;"> <span class="field-label">  Access token</span>
            <input type="text" autofocus="true" placeholder="Enter Access token" autocomplete="off" autofocus="autofocus" name="auth_loginid" id="auth_loginid" class="text"  style=""/ >
         </label>
         <label style="text-align: right;width: 40%;float: right;padding-right:2%;display:none"><span class="field-label">Password</span>
         <input type="password" placeholder="Password" name="auth_pw" id="auth_pw" class="text" style="width: 98%;display:none;">
         </label>
         </div>
         <div style="text-align: right;clear:both">
         <div id="login-msg">&nbsp;</div>
         <div>
            <span id="newaccount" style="float:left;padding-top: 8px;">&lt;&nbsp;Create a new account&nbsp;&gt;</span>
         <button type="submit" class="btn1 btn1-positive login-btn1"  style="float:right;">Enter</button>
         </div>
         </div>
         <div class="vw-opt" style="display: none;">
             <label style="margin-top: 2px;display:inline-block;"><input name="targetvw" value="0" checked="" type="radio"><span>home</span></label>
             <label style="margin-top: 2px;display:inline-block;"><input name="targetvw" value="5" type="radio"><span>Map view</span></label>
         </div>
         </form>

         </div>
         </div>
         <div id="req_result" class="req_result popuphidden">
         <div class="responsecontent">
         <h2 class='resp_status'></h2>
         <h4 class='resp_message'></h4>
         <dl class='data'>
         <dt>First Name</dt>
         <dd class="resp_first_name"></dd>
         <dt>Last Name</dt>
         <dd class="resp_last_name"></dd>
         <dt>Email</dt>
         <dd class="resp_email"></dd>
         <dt>Loginid</dt>
         <dd class="resp_loginid"></dd>
         <div style="clear:both;color:white;">.</div>
         </dl>
         <div style="text-align:center">
         <button value="Close" id="closeconfirm" class='button btn1'>Close</button>
         <h5>Login to your new account</h5>
         </div>
         </div>
         </div>
         <form method="post" action="" id="acctform" class="popup popuphidden">
         <h2>New Account</h2>
         <label for="first_name">
         <label for="first_name">First Name</label>
         <input type="text" required name="first_name" id="first_name" placeholder="First Name"/>
         </label>
         <label for="last_name">
         <label for="last_name">Last Name</label>
         <input type="text" required id="last_name" name="last_name" placeholder="Last Name"/>
         </label>
         <label for="email">
         <label for="email">Email</label>
         <input type="email" required name="email" id="email" type="email" placeholder="Email"/>
         </label>
         <label for="pw">
         <label for="pw">Password</label>
         <input type="text" required id="pw" pattern="[\w]{4,10}" title="Enter a password between (4 -10) characters" name="pw"
         type="password" placeholder="Password"/>

         <div id='pwvmsg' class='tips'>Enter a password between (4 -10) characters</div>
         </label>
         <label for="pw2">
         <label for="pw2">Confirm Password</label>
         <input type="text" required name="pw2" id="pw2" type="password" placeholder="Confirm Password"/>
         <div id="pwmsg" class="tips"></div>
         </label>

         <div class='dupemail'></div>
         <div id="formbar">
         <button type="submit" id="send" class='button btn1 btn1-positive'>Submit</button>
         <button type="button" id="cancelsend" class='button btn1 btn1-negative'>Cancel</button>
         </div>
         </form>
         </div>
         */
    }.toString().replace(/\t/gm,"    ").replace(/[\n\r]+/gm,"\t").replace(/^(\s*[^<]*)|(\*\/\s*\})$/g,"").replace(/\t/g,"\n");
     function ID(s){
        return document.getElementById(s)
    }
    function q(selector,ctx){
        ctx=ctx||document
        return ctx.querySelector(selector)
    }
    function qq(selector,ctx){
        ctx=ctx||document
        return [].slice.call(ctx.querySelectorAll(selector))
    }
    function capi(str){
        str=String(str)
        return str.charAt(0).toUpperCase()+str.substr(1)
    }
    function on(el,ev,fn){
        el=typeof(el)=="string"?ID(el):el
        el.addEventListener(ev,fn)
        return el
    }
    function hide(el){
        if(Array.isArray(el)){
            [].concat(el).forEach(hide)  ;return
        }

        if(el=typeof(el)=="string"?ID(el):el ){
            //el.style.display="none"
            el.classList.add('popuphidden');
        }

    }
    var setup_handle=null
    function _setup(anchor,callback,vwopts){
        if(!ID("acctform") && content){
            var bdy=document.body,d=document.createElement("div");
            d.innerHTML=content.trim();
            while(d.firstChild){
                bdy.appendChild(d.removeChild(d.firstChild))
            }

            return   setTimeout(function(anchor,callback,vwopts){
                if(document.getElementById("auth__link")) {
                     if(setup_handle){
                        document.getElementById("auth__link").removeEventListener("click",setup_handle);
                    }
                    document.getElementById("auth__link").style.display = "block"
                    document.getElementById("auth__link").addEventListener("click",setup_handle=function(){
                        this.parentNode.removeChild(this)
                         _init(anchor,callback,vwopts)
                         setTimeout( openpopup ,10)
                    });
                }
                else{_init(anchor,callback,vwopts);setTimeout( openpopup ,10);}
            },50,anchor,callback,vwopts)

        }

    }
    function show(el){
        if(Array.isArray(el)){
            [].concat(el).forEach(show)  ;return
        }
        if(el=typeof(el)=="string"?ID(el):el ){ el.style.display="";
            el.classList.remove('popuphidden');
        }

    }
    function isLoginidavailable(val){
        var xhr = new XMLHttpRequest()
        xhr.open('GET',baseurl+ 'Rpc.groovy?method=lib.service.UserMgmt.isLoginIdAvailable&argList=[{"loginid":"'+val+'"}]', true);
        xhr.onload = function(e) {

        }
        xhr.send()

    }
    function removeWhiteSpaceNodes ( parent ) {
        var nodes = parent.childNodes;
        for( var i =0, l = nodes.length; i < l; i++ ){
            if( nodes[i] && nodes[i].nodeType == 3 && !/\S/.test( nodes[i].nodeValue ) ){
                parent.replaceChild( document.createTextNode(''), nodes[i]  );
            }else if( nodes[i] ){
                removeWhiteSpaceNodes( nodes[i] );
            }
        }
    }
    function closepopup(){ ID("acctsec").classList.add('popuphidden') ;ID("acctsec_outer").style.display="none" }
    var first=true,resizehandle=null
    function resize(){
        var outer = ID("acctsec_outer"),h = Math.max(90, outer.scrollHeight), w = Math.max(250, outer.scrollWidth)
        outer.style.top = "1px"
        outer.style.left =  "50%"
        outer.style.width = w + "px"
        outer.style.height =  Math.min(h, outer.scrollHeight) + "px"
        outer.style.marginLeft="-"+(w/2)+"px";
        outer.style.overflow="visible";
        return {t:1,l:window.innerWidth/2,h:h,w:w}
    }
    function openpopup(ev,cb){

        if(!ID("acctform")){
            _init(null,function(){openpopup(ev,cb)})
            return
        }
        var target, x,y
        if(ev && ev.x){x=ev.x;y=ev.y}
        if(ev && ev.target){target=ev.target}

             var outer = ID("acctsec_outer")
            ID("login-msg").innerHTML = "&nbsp;"

            var pos=resize()
            if (target) {
                var b = target.getBoundingClientRect(),
                t = Math.max((b.top - pos.h) - 10, 10),
                l = Math.max(10,((b.left + b.width / 2) - (pos.w / 2)));
                outer.style.left = (x || (pos.l + pos.w / 2)) + "px"
                outer.style.top = (y || (t + pos.h)) + "px"
                 l=l+"px"
            }
             outer.style.display = "block"
             //outer.style.marginLeft=(0-Math.floor(Math.max(350,Math.max(outer.offsetWidth,outer.scrollWidth))/2))+"px"
            setTimeout(resize, 10)
            if(!resizehandle){
                window.addEventListener("resize",resizehandle=resize)
            }


        var rect,dm=ID("acctsec"),loginform=ID("acctsec"),frm=ID("acctform"),loginfrm=ID("loginresp") ,
            nulnk=ID("newaccount")
        loginfrm.reset();
        frm.reset();
        frm.classList.add('popuphidden');
        show([dm,loginform,nulnk])
        ID('pwmsg').innerHTML=''
        ID("auth_loginid").setAttribute("autocomplete","off")
         try{ID("auth_loginid").focus()} catch(e){}
        var ifr=document.getElementById("_login_resp_ifr")
     /*    if(ifr=document.getElementById("_login_resp_ifr")){
             if(ifr.parentNode){ifr.parentNode.removeChild(ifr)}
         }
           ifr=document.createElement("iframe")
         ifr=document.body.appendChild(ifr)
         ifr.id="_loginresp_";ifr.src="loginresp.html"*/
        if(ifr){var onlogincb=cb
            ifr.__callback=function(data){
                if(data && data.id>0){
                    if(onlogincb){onlogincb(data)}
                    else if(typeof(app)!="undefined"&&app.setUser){app.setUser(data)}

                }
            }
            if(typeof(ev)=="function"){
                ifr.__callback=ev
            }

            ifr.onload=function(){var doc=this.contentDocument;
                if(!doc){return}
                var resp=doc.body.innerHTML.replace(/^<[^>]+>|<[^>]+>$/g,"");
                if(resp==null||resp=="null"){
                    var msg=(resp&&resp.error)?resp.error:"id or password is not valid"
                    ID("login-msg").innerHTML=msg
                } else{
                    var data=JSON.parse(resp)
                    if(this.__callback){this.__callback(data)}
                    closepopup()
                }
             }
        }
        // ID("loginresp").target=   "_loginresp_"

        // ID("acctform").style.display=""
        ID("req_result").classList.add("popuphidden")
        q(".dupemail" ).innerHTML=""
        if(typeof(cb)=="function"){
            //cb()
        }
        //closepopup()
    }

    function _init(anchor,callback,vwopts){  if(!first){return}

        ID("login-msg").innerHTML="&nbsp;"
        //     ID("loginresp").setAttribute("action", baseurl+ "router?do=loginresp")
        var lnk=anchor||ID("dologin"),loginform=ID("auth"),loginformform=ID("loginresp"),frm=ID("acctform"),sectn=ID("acctsec") ;
        first=false
        ID("auth_loginid").oninput=ID("auth_pw").oninput=function(){ID("login-msg").innerHTML="&nbsp;"}
        ID("acctsec_outer").classList.remove("init")
        try{ID("auth_loginid").focus()} catch(e){}
        var arr=location.href.split(/\#/).shift().split(/\//),i=arr.indexOf("router");
        if(i>0){
            loginformform.action=arr.slice(0,i+1).join("/")
        }
        loginformform.onsubmit=function(evt){

            /*setTimeout(function(){
                app.authenticate(ID("auth_loginid").value,ID("auth_pw").value,function(a){
                   if(a&&a.id>0){
                       closepopup()
                   } else{var msg=(a&&a.error)?a.error:"id or password you entered is not valid"
                        ID("login-msg").innerHTML=msg
                   }
                } );

           },1) */
            var id=String(ID("auth_loginid").value).trim(),pw=String(ID("auth_pw").value).trim()
            if(!(id)){
                ID("login-msg").innerHTML="Access token is required"
                try{ID("auth_loginid").focus()} catch(e){}
                evt.stopPropagation();
                evt.preventDefault();
                return false;
            }
            if(vwopts&&vwopts.useajax) {var onlogin=vwopts.onlogin
                $.xhr.jsonp(app.servicePath + "?auth_loginid="+id+"&auth_pw="+pw+"&authenticate=1", function (a) {
                    if(a && a.response){a= a.response}
                    if(!(a&& a.id>0)){
                        ID("login-msg").innerHTML="Invalid id or password"
                        return
                    }
                     onlogin&&onlogin(a)
                } )
                return false;
            }

        };
        if(lnk && sectn){
            var rect=lnk.getBoundingClientRect()
            sectn.style.top=Math.max(40,(((rect.bottom-rect.top)/2)/3))+"px";
            sectn.style.left=Math.max(40,((rect.right-rect.left)/2))+"px";
            removeWhiteSpaceNodes(sectn)
            //on(lnk,"click",openpopup);
        }
        on("closeconfirm","click",function(ev){
            hide(frm) ;                        ID("req_result").classList.add("popuphidden")
            show([loginform])   ;//ID("acctsec_outer").style.height="240px"
        });
        on("newaccount","click",function(ev){
            hide( [this,loginform ]) ;
            show(frm)
            frm.reset();   ID("acctsec_outer").style.height="510px"
            setTimeout(function(){
                ID("acctsec_outer").style.height="auto"
            })
        });
        on("cancelsend","click",function(ev){
            hide(frm) ;
            show([loginform,ID("newaccount")])   ;//ID("acctsec_outer").style.height="240px"
        });
        on("popup_close","click",closepopup)
        //on("pw","focus",function(){ID("pwvmsg").style.opacity=1;})
        //on("pw","blur",function(){ID("pwvmsg").style.opacity=0;})
        // on("pw","input",function(){ ID("pwvmsg").style.opacity=ID("pw").checkValidity()?0:1 })

        frm.onsubmit=function(ev)    {
            if(frm.checkValidity()){setTimeout(submit,0)}
            return false;
            ev.stopPropagation();ev.preventDefault
        }

        if(callback){callback()}
    }
    function submit(){
        var frm=ID("acctform") ;
        if(!frm.checkValidity()){  return}

        if(ID("pw").value!=ID("pw2").value){
            ID("pwmsg").innerHTML=("Please confirm the password");
            on("pw2","input",function pwcheck(){
                if(ID("pw").value==ID("pw2").value){
                    ID("pwmsg").innerHTML=""; ID("pw2").removeEventListener("input",pwcheck)
                }else {ID("pwmsg").innerHTML= "Please confirm the password";}
            })
        }  else {
            var vals=[].slice.call (frm.elements).reduce (function(m, it){
                if(it.name&&it.name != "pw2") {
                    m[it.name]=it.value
                }
                ;
                return m;
            }, {})
            if(typeof(app) == "undefined") {
                var url=baseurl + "router" + "?newaccount=" + JSON.stringify (vals)
                var xhr=new XMLHttpRequest ();
                xhr.onload=function(ev){

                }
                xhr.open ("GET", url)
                xhr.send ()

            }else {
                app.createUser (vals).then (function(res){
                    if(res.error||res.status == "error") {
                        q (".dupemail").innerHTML=res.result.message||res.result
                        on ("email", "input", function emailcheck (){
                            q (".dupemail").innerHTML=""
                            ID ("email").removeEventListener ("input", emailcheck)
                        })
                        return
                    }
                    res.status=res.error ? "Error" : "Success";

                    var dom=document.getElementById ("req_result")//.firstChild.cloneNode(true)
                    q (".resp_message", dom).innerHTML=res.result.message||res.result
                    q (".resp_status", dom).innerHTML=capi (res.status)
                    var d=res.result.data, datadom=q (".data", dom)
                    if(d) {
                        datadom.style.display="block"
                        Object.keys (d).forEach (function(it){
                            var dm=q (".resp_" + it, dom);
                            if(dm) {
                                dm.innerHTML=d[it]
                            }
                        })
                    }else {
                        if(datadom) {
                            datadom.style.display="none"
                        }
                    }
                    // ID("req_result").appendChild(dom)  ;
                    ID ("req_result").classList.remove ("popuphidden")
                    ID ("acctform").style.display="none"
                });
            }
        }
    }
    return {
        init:_init ,close:closepopup   ,show:function(cb,ev){

            setTimeout(function(){openpopup(ev,cb)},10)
        },
        setup:_setup
    }
}) ;

/*

 <form id="loginresp" method="post" action="../router">
 <div>
 <input type="hidden" name="authenticate" id="authenticate" value="1"/>
 <label style='text-align:left;'> <span class='field-label'>User Name/Email</span>
 <input type="text" autofocus="true" type="text" placeholder="Enter Username" name="auth_loginid" id="auth_loginid" class="text"/>
 </label>
 <label style='text-align:left;'><span class='field-label'>Password</span>
 <input type="password" placeholder="Password" name="auth_pw" id="auth_pw" class="text"/>
 </label>
 </div>
 <div>
 <div id='login-msg'>..</div>
 <button type="submit" class="btn1 btn1-positive login-btn1">login</button>
 </div>
 <div class='vw-opt'>
 <label style='margin-top: 2px;display:inline-block;'><input name='targetvw' value='0' checked type="radio" ><span>home</span></label>
 <label style='margin-top: 2px;display:inline-block;'><input name='targetvw' value='5' type="radio"><span>Map view</span></label>
 </div>
 </form>
 */