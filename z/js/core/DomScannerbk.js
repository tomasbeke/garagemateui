/**
 * Created by Atul on 6/13/2015.
 */
$.scanDom  = (function () {
    var re = /\{\{/, rem = /\{\{([^}]+)\}\}/g,DOUBLECURLY_RE = /\{\{/, rem = /\{\{([^}]+)\}\}/g,
        ops=/^[>#?!\+]/,
        fn = null
    var SCOPECACHE={}
    var actionMap={
        cmd:{}
    }
    function exprInfo(expr,istemplate){
         if(/[^\w\.]/.test(expr)){
            var parsed,args=[],orig=expr
            try{
                if(expr.indexOf("(")>0 && expr.indexOf(")")==expr.length-1){
                    var arr=expr.split(/\(/)
                    expr=arr.shift()
                    args=arr[0].split(/\)/).shift().split(',').map(function(a){
                        if(isNaN(a) && !/['"].test(a)/){vars.push(a)}
                        return {value:a,type:$.typeInfo.get(a).type}
                    })

                }
                if(/[^\|]\|[^\|]/.test(expr)){
                    var ar=expr.split(/\|/)
                    expr=ar.shift();
                    args=ar.map(function(a){return {value:a,type:$.typeInfo.get(a).type}});
                }
                if(expr && args.length){
                    return {id:orig,vars:vars ,args:args,fname:expr}
                }
                parsed=istemplate?$.template(expr):$.parseExpr(expr)
            } catch(e){return {id:expr}}
             if(!parsed){parsed={}};
            var vars=(parsed.tokens?parsed.tokens.filter(function(a){return a.type=="id"}).map(function(a){return a.value}):parsed.vars)||[]
            if(parsed.graph && parsed.graph.type=="fn"){
                args=args.concat(parsed.graph.args||[]).map(function(a){return ($.typeInfo.fromType(a.type)).coerce(a.value)});
                return {id:expr,args:args,vars:(parsed.graph.args||[]).filter(function(a){return a && a.type=="id"}).map(function(a){return a.value}),fn:parsed.fn,fnname:parsed.graph.value}
            }
            return {id:expr,vars:vars ,fn:parsed.fn||parsed}
        }
        return {id: expr,vars:[expr]}
    }
    var cntr=Date.now()
    function _domchange_gen(targetid,trigger, callback){
        var isip= $d.isFormInput(targetid );
        if(callback&&trigger=="cmd"){
            $d.on(targetid, "click.binder",  callback)
        }

        if (isip ) {var elem=$d(targetid).el
            elem.addEventListener((elem.type=="number"?"input":"change")+".binder",callback)
            //$d.on(targetid, (isip?"change":"change") + ".binder", callback)
        } else {
            $d.off(targetid, "binder")
            $d.on(targetid, "click.binder", callback)
        }
    }
    function toBoolean(value){

    }
    function ElModel(el,bindings){
        if(el==null){return}
        this.init(el,bindings)
    }
    ElModel.prototype.$el=function el(){
        return $d(this.el)
    }
    ElModel.prototype.init=function init(el,bindings){
        this.el=el
        $d.addClass(el,"has-bindings");
        $d.data(el,"_bindings_",this);
        if(bindings) {

            if(bindings.attr){
                     $.each(bindings.attr,function(v,k){
                        this.attr(k,v)
                    });
                    delete bindings.attr;
             }
            if (Array.isArray(bindings)) {
                for (var i = 0, l = bindings, ln = l.length; i < ln; i++) {
                    this.addBinding(l[i]);
                }
            }
        }
    }
    ElModel.prototype.procAll=function proc(model){
        this.proc(model)
        this.$el().qq(".has-bindings").forEach(function(el){
            var bindingmodel=el.data("_bindings_")
            if(bindingmodel && bindingmodel.proc){
                bindingmodel.proc(model)
            }

        })
    }
    ElModel.prototype.proc=function proc(model){
        if(this.bindings){
            for(var i= 0,l=this.bindings,ln= l.length;i<ln;i++){
                var B=this.bindingsp[i];
                var val=B.calc(model)
                B.applyToDom(val)
            }
        }

    }
    ElModel.prototype.addBinding=function addBinding(binding){
        if(!(bindin&&binding.id)){return}

        if(this.bindings){
            if(this.bindings.indexOf(binding)>=0){return}
            for(var i= 0,l=this.bindings,ln= l.length;i<ln;i++){
                if(l[i].id==binding.id){return binding}
            }
        }
        this.bindings||(this.bindings=[]);
        this.bindings.push(binding);

    }
    ElModel.prototype.attr=function init(nm){
        if(arguments.length==2 && typeof(arguments[1])!="undefined"){
            this.attr||(this.attr={});
            this.attr[nm]=arguments[1];
        } else if(this.attr){
            return this.attr[nm]
        }

    }


    function BaseExprModel(){

    }
    //BaseExprModel.prototype.shared={vars:[],dependMap:{}};

    BaseExprModel.prototype.initExpr=function initExpr(expr,op,prop,shared){
        this.el=null
        this.origexpr=this.expr=String(expr).trim();
        this.op=op;
        this.prop=prop
        this.id= "id"+(++cntr)
        if(shared && typeof(shared)=="object" && shared.vars){
            this.shared= shared;
        }

     }
        BaseExprModel.prototype.onTrigger=function(ev){
            if(typeof(this._callback)=="function"){
                this._callback.call(this,ev)
            }
        }
        BaseExprModel.prototype.addTrigger=function( ){
            var el=$d(this.el)
            if(!el){return}
            this._boundtriggerfn||(this._boundtriggerfn=this.onTrigger.bind(this));
            var trigger=this.trigger
            if(trigger=="bind"){
                trigger=this.isIp?"change":"pointer"
            }

            if(trigger=="pointer" || !this.isIp){
                el.on( "click.binder",  this._boundtriggerfn)
            } else{
                if(this.isIp){
                    el.el.addEventListener("change",this._boundtriggerfn)
                }
            }


        }
        BaseExprModel.prototype.parseExpr=function parseExpr(exprto ){
            var prop=this.prop,expr=exprto||this.expr
            if(!expr){return}
            if(expr.indexOf("message.")==0){
                this.exprInfo={ismessage:true,messageid:expr.substr("message.".length)}
            } else{
                expr=expr.replace(/([^=<>!])=([^=])/,"$1==$2")
                if(this.istemplate!==false && expr.indexOf("${")>=0){this.istemplate=true}
                this.exprInfo=exprInfo(expr,this.istemplate)||{}
                var vars=this.exprInfo.vars||[this.exprInfo.id]
                this.addVars(vars);
            }

            return this.exprInfo
        }

    BaseExprModel.prototype.applyToDom=function(val){

    }
    BaseExprModel.prototype.inspect = function(a) {
        var format,attr=this.attribs||{}
        if (attr) {
            var type  = attr.format || attr.type;
            if (type) {
                var c = $.typeInfo.typeMap[type];
                if(c && c.coerce && $.typeInfo.defaultType != c && !c.nill && !c.string){this.info = c}
                if(this.info ){
                    if(this.info._defaultFormat){
                        format=this.info._defaultFormat;
                    }
                }
            }
            if(!format){
                format=type
            }
            attr.format=format;
        }
        if(!format) {

        }
        if (format) {
            this.attribs||(this.attribs={});
            this.attribs.format=format
        }
        return this.setupDomSelection()
    }
    BaseExprModel.prototype.setAttr=function(name,val){
        this.attribs||(this.attribs={})
        this.attribs[name]=val
    }
    BaseExprModel.prototype.calc=function(model){
        var  cxt=model,val  ;
        if(!this.exprInfo){return}
        if(this.exprInfo.ismessage){
            val=app.resolveMessage(this.exprInfo.messageid)
        } else{
            if(!this.exprInfo.fn){
                val=this.exprInfo.id?cxt[this.exprInfo.id]:null
            }
            else{
                val=this.exprInfo.fn(cxt)
            }
        }


        return val;
    }
    BaseExprModel.prototype.setEl=function( el){
        this.el=el;
        this.isIp=!!$d.isFormInput(el)
        if(this.isIp && (this.domprop=="text"||this.domprop=="expr"||this.domprop=="bind")){this.domprop="val"}
        if(this._callback && this.args && $d.domdata(this.el,"key") && !this.args.some(function(a){return a && a.val=="data-key"})) {
            this.elpropkey="data-key";
            //this.args.push({val:"data-key",isdomprop:true})
        }
        if(this.exprInfo && this.exprInfo.ismessage){
            this.applyToDom(this.calc())
        }
        this.el && this.onEl && this.onEl()
        this.el && this.setupDomSelection();

    }
    BaseExprModel.prototype.setupDomSelection=function( ){
        if(this.trigger){
            this.addTrigger();
        }
    }
    BaseExprModel.prototype.isDependantOn=function(nm){
         return this.vars && this.vars.indexOf(nm)>=0
    }
    BaseExprModel.prototype.addToShared=function(shared){
        var vars=this.vars||(this.vars=[]);
        if(!shared){shared={}}
        shared.vars||(shared.vars=[]);
        shared.dependmap||(shared.dependmap={});
        if(!vars.length){return shared}
        var sh=shared.vars,mp=shared.dependmap
        for(var i= 0,l= vars,ln= l.length;i<ln;i++){
             sh.indexOf(l[i])==-1 && sh.push(l[i]);
             mp[l[i]]||(mp[l[i]]=[]);
            mp[l[i]].indexOf(this.id)==-1 &&  mp[l[i]].push(this.id)
            if(l[i].indexOf(".")>0){
                var nm=l[i].split(".")[0]
                 mp[nm]||(mp[nm]=[]);
                mp[nm].indexOf(this.id)==-1 && mp[nm].push(this.id)
            }
        }
        return shared
    }
    BaseExprModel.prototype.addVars=function(vars){
        if( vars){
            if(vars.length==1 && vars[0]==this.origexpr){
                this.isId=true
            }
            var thisvars=this.vars||(this.vars=[]);
            for(var i= 0,l= vars,ln= l.length;i<ln;i++){
                thisvars.indexOf(l[i])==-1 && thisvars.push(l[i]);
                 if(l[i].indexOf(".")>0){
                    var nm=l[i].split(".")[0]
                    thisvars.indexOf(nm)==-1 && thisvars.push(nm);
                 }
            }

        }
        if(this.shared){
            this.addToShared(this.shared)
        }
    }
    BaseExprModel.prototype.getTarget=function(target){
        var elem,domprop=this.domprop
        if(target && target.nodeType){
            elem=target;
        } else {
            elem=this.el;
            if(typeof(elem)=="string"){
                elem=document.getElementById(elem)
            }
        }
        return elem||null

    }
    BaseExprModel.prototype.prepareVal=function(val,valueModel){
        if(val===NaN){val=0}
        if(val==null ){val=""}
        var attr=this.attribs,frmt=attr?attr.format:null
        if(val && frmt || typeof(val)=="object"){
            val = $.format(val,frmt)
        }
        if(!val  && attr && attr.defaultvalue!=null){
            if(attr.defaultvalue=="nbsp"){val="&nbsp;"}
            else {val=attr.defaultvalue;}
        }

        //if(this._last===val){return}
        //console.log(this.el,this.domprop,val)
        if(this.domprop=="text"||this.domprop=="val"||this.domprop=="expr"){
            if(val==null ){val=""}
            else if(typeof(val)=="object" && valueModel){{
                    val=valueModel.getItem(this.expr)
                    if(val==null ){val=""}
                }
            }
        }
        val=String(val).replace(/null|undefined|\[object Object\]/g,"").trim().replace(/,$/g,"")
        return val
    }
    BaseExprModel.prototype.parseArgs=function(str){
        var ar=[]
        if(typeof(str)=="string"){ar=str.split(/\s*,\s*/)}
        else if(Array.isArray(str)){ar=str};
        return ar.map(function(a){
            var v=a.trim(),ret={val:v};
            if(/^[a-z_][\w_\.\-]+$/.test(v)){
                if(v.indexOf("data-")==0 || v.indexOf("style.")==0){
                    v.isdomprop=true
                    ret.val=ret.val.replace(/^style\./,"")
                } else{v.isexpr=true}
            }
            return ret
        });
    }
    BaseExprModel.prototype.getContext=function( ){
        return this.shared
    }
    BaseExprModel.prototype.execScopedFn=function( fn,A,scope){
        if(!fn){
            return
        }
        A=A||[]
        if(!$.isArray(A)){A=[A]}
        var scopedmodel=scope
        if(scope && scope.model && typeof(scope.model)=="object"){
            scopedmodel=scope.model
        }
        if(typeof(fn)=="string"){
             if(scopedmodel.getController().hasMethod(fn)){
                scopedmodel.getController().invoke(fn,A)
            } else if(scopedmodel!==scope &&  scope.getController && S.getController().hasMethod(fn)){
                scope.getController().invoke(fn,A)
            }
        } else if(typeof(fn)=="function"){
            fn.apply(scope,A)
        }
    }
    BaseExprModel.prototype.execFn=function( fn,scopeid){
        var scope=((scopeid && typeof(scopeid)=="string")?SCOPECACHE[scopeid]:SCOPECACHE[this.scopeid])||SCOPECACHE[this.scopeid]
        if(!scope || scope!= this.shared.model){

        }
         var args=[],elpropval ,scopedmodel=scope

        if(scope && scope.model && typeof(scope.model)=="object"){
            scopedmodel=scope.model
        }

        for(var i= 0,l=this.args||[],ln= l.length;i<ln;i++){
            if(l[i] && typeof(l[i])=="object" && l[i].val && scopedmodel){
                if(l[i].isexpr){args.push($.resolveProperty(scopedmodel,l[i].val))}
                else if(l[i].isdomprop){args.push(el.prop(l[i].val))}
                else{args.push(l[i].val)}
            } else {
                args.push(l[i])
            }
         }

        if(this.elpropkey){
            elpropval=$d.prop(this.el,this.elpropkey)
        } else  {
            var el=$d(this.el)
            if(el&& el.el.type=="date" && el.el.valueAsDate){
                elpropval = +($.date(el.el.valueAsDate)||0)
            }
            else{
                elpropval=$d.val(this.el)
            }
        }
        if(!fn){
            if(scopedmodel && elpropval!=null){
                $.updateProperty(scopedmodel,this.expr,elpropval)
            }
        } else{
            if(this.elpropkey){args.push(elpropval)}
            this.execScopedFn(fn,args,scope)
        }

    }

    function ExprBlockModel(blockinfo){
        this.block=blockinfo||{} ;
    }
    ExprBlockModel.prototype=new BaseExprModel();
    ExprBlockModel.prototype.init=function init(expr,op,prop) {this.canhaveattr=true;
        this.initExpr(this.block.expr, op, "block");
        if(this.block.op==">"){
            this.loadPartial();
            this.applyToDom=function(){};
        } else if(this.block.op=="!"){//comments - nothing
            this.applyToDom=function(){};
        } else if(this.block.op=="#" || this.block.op=="^"){//truthy
            if(this.block.content && this.block.content.length){
                var txt=this.block.content.join("").replace(/\sid\s*\=\s*['"][\w\_\-]+['"]/g,"").trim()
                if(txt){
                    this._eltemplate=$d.template(txt);
                }

            }

           this.parseExpr()
        }
    }
    ExprBlockModel.prototype.loadPartial=function loadPartial( ) {
        app.getResource(this.expr,
            function(a){
                var contnr=$d(this.el),doreplace
                if(!contnr && this.block && this.block.start){
                    contnr=$d(this.block.start)
                    doreplace=true
                }
                if(!contnr || !contnr.el){
                    return
                }
                if(doreplace && contnr.el.parentNode && this.block.op==">"){
                    var div=document.createElement("div")
                    div.innerHTML=a;
                    if(div.childElementCount==1){
                        $d(contnr.el.parentNode.insertBefore(div.firstChild,contnr.el))
                    }
                    else{
                        while(div.firstChild){
                            contnr.el.parentNode.insertBefore(div.firstChild,contnr.el)
                        }
                    }
                    contnr.el.parentNode.removeChild(contnr.el)
                    contnr=null
                }
                else {
                    contnr.html(a);
                }
                if(contnr){
                    //$.partialView.processScopedStyles(contnr)
                    this._eltemplate=$d.template(contnr.html());
                }

            }.bind(this)
        )
    }
    ExprBlockModel.prototype.applyToDom=function applyToDom(value) {
        var val=!!value,show=this.block.op=="#"?val:!val
        //if(!this._eltemplate){return}
        var cntnr=$d(this.el)
        if(!cntnr){return}
        if(show){
            var bindings=value && typeof(value)=="object"?value:SCOPECACHE[this.scopeid]

            if(!this._eltemplate){
                var clone=cntnr.clone(true,true);
                [].forEach.call(clone.querySelectorAll("*"),function(a){
                        if(!a.innerHTML.trim() && a.getAttribute("z-expr")){
                            a.innerHTML=a.getAttribute("z-expr");
                        }
                    })
                this._eltemplate=$d.template( clone.innerHTML.replace(/\sid=['"][^'"]+?['"]/g," "))
                $d.remove(clone)
            }
            if(this._eltemplate && this._eltemplate.vars && this._eltemplate.vars.length) {
                if ($.isArrayLike(value) || value instanceof $.model.Collection) {
                    var worker = this._eltemplate
                    $d.clear(cntnr)
                    var html=[]
                    if(value instanceof $.model.Collection){
                        html=value.collect(function (v) {
                            return this._eltemplate(v)
                        }.bind(this))
                    }
                    else {
                        html = $.collect(value, function (v) {
                            return this._eltemplate(v)
                        }, this)
                    }

                    cntnr.html(html.join(""))
                } else {
                    $d.html(cntnr, this._eltemplate(bindings))
                }
            }
            $d.show(cntnr)
        } else {
            $d.hide(cntnr)
        }

    }

    function CmdModel(expr,op,prop){
        if(expr==null){return}
        this.init(expr,op,prop)

    }
    CmdModel.prototype=new BaseExprModel();
    CmdModel.prototype.init=function init(expr,op,prop) {
        this.invokable=true;
        this.initExpr(expr, op, prop);
        this.isCmd=true;
        this.args=[]
        var c = String(expr).trim(), a = [];
        var ar = c.replace(/\)$/, "").split(/\(/);
        this.method = ar.shift().trim();
        if (ar.length && ar[0]) {
            this.args = this.parseArgs(ar[0])
        }
        this.trigger="pointer"
        this._callback=function(){
            var  el=$d(this.el)
             if(!el || el.selfOrUp("[disabled]")){
                console.log("disabled")
                return
             }
            var sid,models=el.data("_modelbindings_")||{}
            if(models && models.length && models[0]){
                sid=models[0].scopeid
            }
             this.execFn(this.method ,sid)
         }
    }

    function ExprModel( expr,op,prop){
        if(expr==null){return}
        this.init(expr,op,prop)

    }
    ExprModel.prototype=new BaseExprModel();
    ExprModel.prototype.init=function init(expr,op,prop,shared){
        this.canhaveattr=true;
        this.initExpr(expr,op,prop,shared);
        this.parseExpr()
        this.domprop=(prop=="bind"||prop=="model"||prop=="expr")?"text":prop

        if(this.prop=="target"||this.prop=="bindTo"||this.prop=="bindto"||this.prop=="model"){
            this.trigger="bind"
            this.domprop=this.prop=="target"?"":"ipval"
        }

        if(this.method||(this.exprInfo?this.exprInfo.fnname:null)) {
            if (!this.trigger) {
                this.trigger = "pointer"
            }
        }
        if (this.trigger) {
            this.args=[]
            this._callback=function(){
                var  el=$d(this.el)
                if(!el || el.selfOrUp("[disabled]")){
                    console.log("disabled")
                    return
                }

                var sid,models=el.data("_modelbindings_")||{}
                if(models && models.length && models[0]){
                    sid=models[0].scopeid
                }
                this.execFn(this.method ,sid)
            }
        }
    }

    //what happens when vars change
    ExprModel.prototype.applyToDom=function(value,target){
        var elem=this.getTarget(target),domprop=this.domprop
        if(!elem){  return }
        if(typeof(value)=="function"){
            var model=SCOPECACHE[this.scopeid]
            value=value.call(model);
        }
        if(!this.isIp && domprop=="text"){
            this.isIp=!!$d.isFormInput(elem)
            if(this.isIp){this.domprop=domprop="ipval"}
        }
        if(domprop=="ipval"){
            domprop=this.isIp?"val":""
          }
        if(!domprop ){return
            /*if(this.trigger=="bind" && this.isIp){
                domprop="val"
            } else{
                return
            }*/
        }

        var val=this.prepareVal(value)
        if(this.domPropertyHandle){
            this.domPropertyHandle(val, domprop,elem)
        }
        else{
            if(  domprop=="val" ){
                var el=$d(elem.el||elem)
                if(el&& el.el&& el.el.type=="date" && "valueAsDate" in el.el){
                    if(val){
                        val= $.date(val)
                    }
                    if(val){
                        val=el.el.valueAsDate=new Date((+val) )
                        val=+val;
                    }
                    else{el.value=""}
                }
                else{
                    $d.val(elem, val==null?"":val)
                }
            }
            else{
                $d.prop(elem, domprop,val==null?"":val)
            }
        }
        this._last=val
    }
    function ExprMethodModel( expr,op,prop){
        if(expr==null){return}
        this.init(expr,op,prop )
    }
    ExprMethodModel.prototype=new ExprModel();
    ExprMethodModel.prototype.init=function init(expr,op,prop) {  this.invokable=true;
        this.initExpr(expr, op, prop);
        this.parseExpr()
    }
    ExprMethodModel.prototype.applyToDom=function(value,target){
        //
    }
    function ExprEventModel( expr,op,prop){
        this.invokable=true;
        if(expr==null){return}
        this.init(expr,op,prop )
    }
    ExprEventModel.prototype=new ExprModel();
    ExprEventModel.prototype.init=function init(expr,op,prop) {
        prop=String(prop).replace(/^on/,"").trim()
        this.initExpr(expr, op, prop);
        if(/^[\w+]$/.test(expr)){
            this.exprInfo={expr:expr,id:expr,fn:expr,vars:[]}
        }
        else{
            this.parseExpr()
        }
        this._callback=function(ev){
            if(!this.exprInfo){return}
            var S=SCOPECACHE[this.scopeid]
            if(!S || S!=this.shared.model){

            }
             var args=this.exprInfo.args,A=[ev] ,scopedmodel=S

            if(S && S.model && typeof(S.model)=="object"){
                scopedmodel=S.model
            }
            if(args && args.length){
                A= A.concat(args.map(function(a){ return (isNaN(a) && !/['"']/.test(a) && scopedmodel.contains(a))?scopedmodel.get(a):a} ))
            }
            this.execScopedFn(this.exprInfo.fnname||this.exprInfo.fn||this.exprInfo.id,A,S)
        }.bind(this)
     }
    ExprEventModel.prototype.onEl=function init(expr,op,prop) {
         $d.on(this.el,this.prop+".ExprEventModel",this._callback)
    }
    ExprEventModel.prototype.applyToDom=function(value,target){
    }
    function ExprOptionsModel( expr,op,prop){
        if(expr==null){return}
        this.init(expr,op,prop )
     }
    ExprOptionsModel.prototype=new ExprModel();
     ExprOptionsModel.prototype.applyToDom=function(value,target){
         var elem=this.getTarget(target),domprop=this.domprop
        if(!elem){  return }
        $d.addOptions(elem,value)
    }
    function ExprVisibilityModel( expr,op,prop){
        if(expr==null){return}
        this.init(expr,op,prop )
    }
    ExprVisibilityModel.prototype=new ExprModel();
    ExprVisibilityModel.prototype.init=function init(expr,op,prop) {
        this.initExpr(expr, op, prop);
        this.parseExpr()
        this.domprop=prop
    }
    var falsies=["0" ,"null" ,"undefined" ,"false" ,"hidden" ,"none","hide"]

    ExprVisibilityModel.prototype.applyToDom=function(value,target){
        var elem=this.getTarget(target),domprop=this.domprop
        if(!elem){  return }
        if(!value || (typeof(value)=="string" && falsies.indexOf(value)>=0)){
            if(domprop=="visibility"){$d.css(elem,"visibility","hidden")}
            else if(domprop=="disappear"){$d.disAppear(elem)}
            else {$d.hide(elem)}
        } else {
            if(domprop=="visibility"){$d.css(elem,"visibility","visible")}
            else if(domprop=="appear"){$d.appear(elem)}
            else {$d.show(elem)}
        }
    }
    function ExprClassModel( expr,op,prop){
        if(expr==null){return}
        this.init(expr,op,prop )
    }
    ExprClassModel.prototype=new ExprModel();
    ExprClassModel.prototype.init=function init(expr,op,prop) {
        if(DOUBLECURLY_RE.test(expr)){

        }

        this.initExpr(expr, op, prop);
        this.parseExpr()
        this.domprop=prop
    }
    ExprClassModel.prototype.applyToDom=function(value,target){
        var elem=this.getTarget(target),domprop=this.domprop
        if(!elem || !value){  return }
        if(!this.classExpr){
            this.classExpr=elem.className.replace(/\{\{(.*?)\}\}/, " -- ")
        }
        var val=String(value)
        var expr=this.classExpr
        if(this._last && this._last==val){return}
        if(this._last){expr=expr.replace(this._last+" -- ",+" -- ")}
        elem.className=expr.replace(" -- ",val+" -- ")
         this._last=val
     }
    function ExprStyleModel( expr,op,prop){
        if(expr==null){return}
        this.init(expr,op,prop )
    }
    ExprStyleModel.prototype=new ExprModel();
    ExprStyleModel.prototype.init=function init(expr,op,prop) {
        this.initExpr(expr, op, prop);
        this.stylelist = []
        for(var i= 0,l=expr.split(";"),ln= l.length;i<ln;i++) {
            if(DOUBLECURLY_RE.test(l[i])){
                var ar = l[i].split(":")
                var info=this.parseExpr(ar[1].replace(/\{\{(.*?)\}\}/, "$1").trim())
                this.stylelist.push([ar[0],{fn:info.fn,id:info.id}])
            }
        }
        this.domprop=prop
    }

    ExprStyleModel.prototype.applyToDom=function(value,target){
        var elem=this.getTarget(target),domprop=this.domprop,scope=SCOPECACHE[this.scopeid],scopedmodel=scope

        if(scope && scope.model && typeof(scope.model)=="object"){
            scopedmodel=scope.model
        }
        if(!elem || !scopedmodel){  return }

        if(this.stylelist){
            for(var i= 0,l=this.stylelist,ln= l.length;i<ln;i++) {
                var val,L=l[i]
                if(L[1].fn){
                    val=L[1].fn(scopedmodel)
                } else {
                    val= $.resolveProperty(scopedmodel,L[1].id)
                }
                if(val!=null){
                    if(val===NaN){val=0}
                    $d.css(elem,L[0],val)
                }
            }
        }

    }
    function removeprop(el,prop){
        if(!el || !el.parentNode){return}
        if(el.nodeType==3){
            el.parentNode.removeChild(el);
            return
        }
        el && el.removeAttribute && el.removeAttribute(prop);
    }
    function processTextNode(data  ){
        if(!(data.val && String(data.val).trim())){return}
        data.val= data.val.replace(/{{|}}/g, "").trim()
        data.isexpr=true
         //if block operation
        if(/^[\^#\>\/!]/.test(data.val)){
            data.isblock=true;
            data.val= data.val.trim().replace(/^[\^#\>\/!]/,function(a){data.op=a;

                return ""
            }).trim()
            if(data.op==">"){
                data.ispartial=true
            } else if(data.op=="/"){
                data.isblockend=true
            } else if(data.op=="#" || data.op=="^"){
                data.isblockstart=true
            }
        }
        data.name=data.name||"expr"
        return data
    }
    function isInScope(el,scopeid){
        if(el && el.getAttribute && el.getAttribute("z-scope") && el.getAttribute("z-scope") != scopeid){
            var scp=el.getAttribute("z-scope");

            return false
        }
        return true
    }
    function wrapTextNode(elem){
        var expr=elem.textContent
        var span=document.createElement("span")
        span.setAttribute("z-expr",expr)
        span=elem.parentNode.replaceChild(span,elem)
        return {name:"expr",val:expr,el:span,isproxyNode:true}

    }
    function addBinding(data,holder){
        if(!(data && data.el && data.el.nodeType)){
            return
        }
        if(!data.el.id){$d(data.el)}
        holder[data.el.id]||(holder[data.el.id]={bindings:[]})
        if(!data.isattr){
            holder[data.el.id].bindings.push(data);
        } else if(data.name){
            holder[data.el.id].attr||(holder[data.el.id].attr={})
            holder[data.el.id].attr[data.name]=data.val
        }
    }
    function processProp(data,holder){
        var prop=data.name,origprop=prop;

        if (prop && typeof(prop)=="string" && (prop=="expr" || prop.indexOf("data-") == 0 || prop.indexOf("z-") == 0 || prop.indexOf("z:") == 0 ||
                prop.indexOf("ng:") == 0|| prop.indexOf("ng-") == 0  )) {
            if(prop.indexOf("data-") == 0 ){
                prop=prop.substr("data-".length)
                if(prop=="cmd"||prop=="bind"||prop=="bindTo"||prop=="bindto"||prop=="binder"){
                    data.isexpr=true;
                    data.name=prop
                    addBinding(data,holder)
                }
                return true
             }
            prop=prop.replace(/^[\w]+[:\-]/,"");
            if((prop=="format"||prop=="args"||prop=="type"||prop.indexOf("attr-")==0||prop=="defval"||prop=="defaultvalue"||prop=="filter"||prop=="order")){
                if(prop=="defval"){prop="defaultvalue"}
                addBinding({name:prop.replace(/^attr\-/,""),val:data.val,isattr:true,el:data.el},holder)
                return true
                 //removeprop(elem,origprop)
            } else {
                data.isexpr=true;
                if(prop=="repeat"||prop=="block"){
                    data.isblock=true;
                }
            }
            if(prop.indexOf("on")==0 || prop=="click" || prop.indexOf("mouse")==0 || prop.indexOf("key")==0 || prop=="change"  || prop=="input" ){
                data.isevent=true
                prop=prop.replace(/^on/,"")
            }
            if(  !data.isblock && DOUBLECURLY_RE.test(data.val)){
                data.val=data.val.replace(/^.*\{\{(.*?)\}\}.*$/, "$1").replace(/"/g, '\\"').trim()
            }
            data.name = prop
            addBinding(data,holder)
             return true ;
        }
        if(data.val && typeof(data.val)=="string" && DOUBLECURLY_RE.test(data.val)){
            if(data.name=="text"){
                var exprs=data.val.match(/{{(.*?)}}/g)||[]
                 if(exprs.length==1){
                       processTextNode(data)
                     data.name="expr"
                 } else {
                    /* exprs.forEach(function(elem){
                         processProp(wrapTextNode(txt,elem),holder)
                     });*/
                     return
                 }
            } else{data.val=data.val.replace(/^.*\{\{(.*?)\}\}.*$/, "$1").replace(/"/g, '\\"').trim()
                processTextNode(data)
            }
            data.isexpr=true;
            addBinding(data,holder)
            return true
        }
    }
    function getBindableProps(el,type,memo){
        if (type == 1 && !isInScope(el, memo.scopeid)) {
            return true; //skip self and children
        }
        var holder=memo.holder
         if(!(el && el.nodeType==1)){return null}
        for (var i = 0, attr=el.attributes,ln = attr.length; i < ln; i++) {
            if(!(attr[i] && attr[i].name)){continue}
            var data={name:attr[i].name,val:attr[i].value,el:el}
            processProp(data,holder)
         };
        if (el.firstChild ) {
            var textnodes=[].slice.call(el.childNodes).filter(function(a){return a.nodeType==3 && DOUBLECURLY_RE.test(a.textContent)})
            if(textnodes.length){
                //has only text
                if(textnodes.length==1 && el.childNodes.length==1){
                       processProp({name:"text",val:textnodes[0].textContent,el:el},holder)
                } else {
                    textnodes.forEach(
                        function(elem){
                             data= wrapTextNode(elem)
                            data && processProp(data,holder)
                        }
                    )

                }

            }
        }
        return holder;
    }
    function inspectBinding(el,data,holder,memo){
        var prop=data.name,val=data.val;
        var expr=String(val||"").trim(),orig=expr,isexpr,origprop=prop;
        if(!prop || prop=="scope" || prop=="app"){
            return
        }
        if (prop == "block") {
           var  nu =  memo.ctor(expr,"", "block")
            holder.push(nu)
            return
        }

    }
    function parseText(el,prop,val,holder,memo){
        var elem=typeof(el)=="string"?null:el,nu,op
        var expr=String(val||"").trim(),orig=expr,isexpr,origprop=prop;
        if(!expr){return}
        prop=processProp(prop||"expr",expr)
        if(!prop || prop=="scope" || prop=="app"){
            return
        }
         if (prop != origprop) {
            isexpr=true;
        }
         if (prop == "block") {
            nu =  memo.ctor(expr,op, "block")
            holder.push(nu)
            return
        }
        if(isexpr && (prop=="format"||prop=="args"||prop=="type"||prop.indexOf("attr-")==0||prop=="defval"||prop=="defaultvalue")){
            if(prop=="defval"){prop="defaultvalue"}
            holder.attr||(holder.attr={});
            holder.attr[prop.replace(/^attr\-/,"")]=expr;
             //removeprop(elem,origprop)
            return
        }
        var istemplate

         if(expr && DOUBLECURLY_RE.test(expr) ){
            expr = expr.trim()
             var exprs=expr.match(/{{(.*?)}}/g)
             if (elem && elem.nodeType == 3 ){
                      //check if expression
                     expr = expr.replace(/\{\{/g, "${").replace(/\}\}/g, "}")
                     istemplate = true
                     var html = expr
                     var sp = document.createElement("span")
                     sp.className = "expr__ph__pending__" + memo.scopeid
                     sp.setAttribute("z-expr", expr.replace(/"/g, '\\"').trim())
                     memo && memo.scopeid && sp.setAttribute("z-scope", memo.scopeid)
                     sp = elem.parentNode.insertBefore(sp, elem);
                     elem.parentNode.removeChild(elem);
                     return
                 }
             /*if (elem && elem.nodeType == 3 && (expr.lastIndexOf("{{") > 0 || (elem.parentNode && elem.parentNode.childNodes.length > 1))) {
                isexpr=false;
                var html = expr.replace(/\{\{(.*?)\}\}/g, function (a, b) {
                    var sp = document.createElement("span")
                    sp.className = "expr__ph__pending__"+memo.scopeid
                    sp.setAttribute("z-expr",
                        b.replace(/"/g, '\\"').trim()
                    )
                    memo && memo.scopeid && sp.setAttribute("z-scope", memo.scopeid)
                    return $d.html(sp,true)
                });
                var dd = elem.parentNode.insertBefore(document.createElement("span"), elem);
                dd.insertAdjacentHTML('afterEnd', html);
                dd.parentNode.removeChild(dd);
                elem.parentNode.removeChild(elem);
            }*/ else {
                expr = expr.replace(/^.*\{\{(.*?)\}\}.*$/, "$1").replace(/"/g, '\\"').trim()
                isexpr = true;
                prop=prop||"expr"
            }
         }
        if(isexpr){
            //wrap in span if test node
            nu=   memo.ctor(prop=="style"?orig:expr,op,prop||"expr")
            nu.istemplate=istemplate;
         }
        if(nu){
            holder.push(nu)
        }


    }
    function handleNode(el,holder,memo){
        var attrList=getBindableProps(el)
         if(!attrList){
             return
         }
        attrList.forEach(
            function(att){
                parseText(el,att.name,att.value,holder,memo)
            }
        );

    }
    return function(elem,scopeid,scope) {
        var el = $d(elem),holder={};
        if (!el) {
            return
        }
        if(scopeid && scope){
            SCOPECACHE[scopeid]=scope
        }
        var DATA={scopeid:scopeid,scope:scope}
        if(DATA.scopeid){
            if(!el.is("[z-scope='"+DATA.scopeid+"']")){
                //el=el.q("[z-scope='"+scopeid+"']")||el
            }
        }
        var pendingblock={}, pendingblocks=[],blocks=[],_counter=+(new Date())

        var ctor=(function(scope_id){
            var shared={vars:[],dependmap:{}}
             var retctor= function(expr,op,prop){
                 var data={}
                 if(arguments.length==1 && expr && typeof(expr)=="object"){
                     data=expr
                     prop=expr.name
                     op=expr.op
                     expr=expr.val
                 }
                var nu
                 if(data.ispartial || prop=="partial" || prop=="template" ){
                     var res=app.getResource(this.expr)
                     if(res && typeof(res)=="string"){

                     }
                     //nu=new ExprBlockModel({op:">",expr:expr})
                 }
                else if(data.isblock || prop=="block"){
                    var b=blocks.find(function(a){return a.id==expr});
                    if(!b){console.log("block not found")}
                    nu=new ExprBlockModel(b)
                  } else if(data.isevent || prop.indexOf("on")==0 && prop.length>3){
                    nu=new ExprEventModel( )
                }
                else if(prop=="visibility"||prop=="hide"||prop=="show"||prop=="appear"||prop=="disappear") {
                    nu = new ExprVisibilityModel()
                } else if(prop=="options"){
                    nu = new ExprOptionsModel()
                } else if(prop=="style"){
                    nu=new ExprStyleModel()
                } else if(prop=="className"||prop=="class"){
                    nu=new ExprClassModel()
                } else if(prop=="cmd"){
                    nu=new CmdModel( )
                } else {
                    nu=new ExprModel( )
                }
                 nu.shared=shared;
                 nu.scopeid=scope_id
                 nu.init(expr,op,prop,shared)

                return nu
            }
            retctor.shared=shared
             return retctor
         })(scopeid);
        DATA.ctor=ctor
        var removeBlockNodes=[]

        function  replacePartials (el, type,memo) {
            type = type || el.nodeType
            if (type == 1 && !isInScope(el, memo.scopeid)) {
                return true; //skip self and children
            }
            if (type == 1 && el.classList.contains("z-block")) {
                return
            }
            if (type == 3) {
                var txt = String(el.textContent).trim()
                var partials=txt.match(/{{\s*\>\s*(.*?)}}/g)
                if (partials) {
                      (txt.match(/{{(.*?)}}/g) || []).forEach(function (a) {
                        var nm=a.replace(/{{|}}/g, "").trim()
                            if(/^\s*\>/.test(nm)) {
                                nm = nm.replace(/^\s*\>/, "").trim()
                                var str = app.getResource(nm)
                                if (str && str.length) {
                                    var tmp = el.parentNode.insertBefore(document.createElement("span"), el);
                                    tmp.insertAdjacentHTML('afterEnd', str);
                                    tmp.parentNode.removeChild(tmp);
                                    return
                                }
                            }
                          var tmp = el.parentNode.insertBefore(document.createElement("span"), el);
                          tmp.insertAdjacentHTML('afterEnd', a);
                          tmp.parentNode.removeChild(tmp);
                     });
                    el.parentNode.removeChild(el);
                    //el.parentNode.normalize();
                }
            }
        }
        function  inspectBlocks (el, type,memo) {

            var h=[], addtopending=1
            type=type||el.nodeType
            if(type==1 && !isInScope(el,memo.scopeid)){
                return true; //skip self and children
            }
            if(type==1 && el.classList.contains("z-block")){return}


            if (type == 3) {
                var txt=String(el.textContent).trim()
                var blockcnt=0
                if(txt.indexOf("{{")>=0 && txt.indexOf("}}")>=0){

                     var exprs=(txt.match(/{{(.*?)}}/g)||[]).map(function(a){return a.replace(/{{|}}/g,"")});
                    for(var i=0;i<exprs.length;i++){
                        var sp1=null, op,expr
                        expr=exprs[i].trim().replace(/^[\^#\>\/!]/,function(a){op=a;return ""}).trim()
                        if(op){addtopending=0}
                        if(!op ){
                            continue
                        }
                        blockcnt++
                        if(op=="/"){
                            var p=pendingblocks.find(function(a){ return a.expr==expr})
                            if(p){
                                 if(p.start){
                                    var st=p.start;
                                    var toadd=p.origstart,arr=[];
                                     if(el!=p.origstart){
                                         while((toadd=toadd.nextSibling) && toadd !== p.origstart){
                                             if(toadd==el){break}
                                             arr.push(toadd)
                                         }
                                     }

                                     if(!arr.length && p.origstart.nodeType==3){
                                         var txt=p.origstart.textContent.replace(new RegExp("\{\{\\s*"+ RegExp.escape(p.op+expr)+"\\s*\}\}"),"")
                                             .replace(new RegExp("\{\{\\s*"+ RegExp.escape("/"+expr)+"\\s*\}\}"),"")
                                         st.innerHTML=txt.trim();
                                     } else{
                                         while(arr.length){var a=arr.shift()
                                             if(!a.parentNode){continue}
                                             st.appendChild(a.parentNode.removeChild(a))
                                         }
                                     }

                                    if(p.origstart && p.origstart.parentNode ){
                                        p.origstart.parentNode.removeChild(p.origstart)

                                    }
                                     p.origstart=null;
                                    if(el && el.parentNode){el.parentNode.removeChild(el)}
                                }
                                blocks.push(Object.assign({},p))
                                pendingblocks.splice(pendingblocks.indexOf(p),1);
                            }
                            if(pendingblock && pendingblock.expr==expr){
                                blocks.push(Object.assign({},pendingblock))
                                removeBlockNodes.push(el)
                                pendingblocks.splice(pendingblock.i,1);
                                pendingblock=null
                                continue
                            } else {
                                console.log("[endingblock not found "+expr)
                            }
                        } else {

                            if(op==">" ){
                                var str=app.getResource(expr)
                                if(str && str.length){
                                    var tmp=el.parentNode.insertBefore(document.createElement("span"),el);
                                    tmp.insertAdjacentHTML('afterEnd', str);
                                    tmp.parentNode.removeChild(tmp);
                                    el.parentNode.removeChild(el);

                                } else{
                                    sp1 = document.createElement("span");
                                    var nublock={i:pendingblocks.length,id:++_counter,expr:expr,origstart:el,start:sp1,op:op,content:[]}
                                    blocks.push(nublock)
                                    el.parentNode.insertBefore(sp1,el);
                                    el.parentNode.removeChild(el);
                                }
                                el=null;

                            }
                            else{
                                sp1 = document.createElement("span");
                                var nublock={i:pendingblocks.length,id:++_counter,expr:expr,origstart:el,start:sp1,op:op,content:[]}
                                pendingblocks.push( nublock)
                                sp1.setAttribute("z-block",nublock.id)
                            }


                        }
                        if(sp1 && el  ){
                             el.parentNode.insertBefore(sp1,el);
                             //el=null
                            continue
                        }

                    }

                }
             }
            if(blockcnt && addtopending && el && pendingblock && pendingblock.start && (type==3||type==1)){
                if(pendingblock.start!=el && (pendingblock.start.parentNode==el.parentNode)){
                    pendingblock.content.push(type==1?$d.html(el,true):el.textContent)
                    //pendingblock.start.appendChild(el.cloneNode(true))
                    removeBlockNodes.push(el)
                }

             }
        }
        function  inspect  (el, type,memo) {
            var h=[],istxtNode,parent=el.parentNode
            type=type||el.nodeType
            if (type == 3) {
                 parseText(el ,"expr",el.textContent,h ,memo)
            } else if (type == 1) {
                if(!isInScope(el,memo.scopeid)){
                    return true; //skip self and children
                }

                handleNode(el,h,memo)
                if (el.childNodes.length === 1 && el.firstChild.nodeType != 1) {
                    istxtNode=1
                    if (el.firstChild.nodeType == 3) {
                        parseText(el   ,"expr",el.textContent,h,memo)
                    }
                }
            }
            if(h.length ){
                var id
                if(type==1){
                    id=el.id||$d(el).id
                } else if(parent){
                    id=parent.id||$d(parent).id
                }
                if(!id){return true;}
                holder[id]=h;
                if(h.attr){var target= h.filter(function(a){return a.canhaveattr})[0]||h[0]
                    $.each(h.attr,function(v,k){
                        target.setAttr(k,v)
                    });
                    delete h.attr;
                }
            }
            if(istxtNode){
                return true;
            }
        }
        var revHolder = {}, bindings = []
        function findBinding(holder,fn){
            Object.keys(memo.holder).forEach(
                function(elid){var res
                    if(memo.holder[elid] && memo.holder[elid].bindings && memo.holder[elid].bindings.length){
                        if(res=memo.holder[elid].bindings.find(fn,i)){
                            res.idx=i;
                            return res
                        }
                    }
                }
            )
        }
        function _proc(el,memo){
            el.el.normalize && el.el.normalize();
            var scopedel= $d.selfOrDown(el,"[z-scope='"+memo.scopeid+"']")||el
            memo.holder={}
            scopedel.traverse({enter:replacePartials,memo:memo});
            scopedel.traverse({enter:getBindableProps,memo:memo});
            Object.keys(memo.holder).forEach(
                function(elid){

                    var H=memo.holder[elid],ELExprs=[]
                    if(H && H.bindings && H.bindings.length){
                        var B = [].slice.call(H.bindings)
                        B.forEach(
                            function(a){
                                if(a.processed||a.name=="scope"||a.name=="app"){return}
                                if(a.isblockend){
                                    debugger;
                                }
                                if(a.isblockstart){
                                    a.processed=true;
                                    var name= a.name
                                    var end=findBinding(memo.holder,function(b){return b.isblockend && b.val==name});
                                    a.block=true
                                    if(end && end.el && a.el){
                                        end.processed=true;
                                        if(end.el == a.el){

                                        }
                                        else {
                                            if($d(end.el).parent()==$d(a.el).parent()){
                                                var endid=$d(end.el).id,tocopy=[];
                                                $d.nextAll(a.el).some(function(e){
                                                    if($d(e).id==endid){return false}
                                                    tocopy.push(e);
                                                })
                                                while(tocopy.length){
                                                    $d(a.el).append($d(tocopy.shift()))
                                                }
                                            } else {
                                                debugger;
                                            }
                                            if( end.isproxyNode){
                                                $d.remove(end.el)
                                            }
                                        }

                                    }else {
                                        debugger;
                                        return
                                    }

                                }
                                var ELExpr=memo.ctor(a)

                                ELExpr._processed = true;
                                ELExpr.scopeid=memo.scopeid
                                ELExpr.setEl(elid)
                                revHolder[ELExpr.id] = ELExpr;
                                ELExpr.inspect(memo.scope)
                                ELExprs.push(ELExpr)
                            }
                        );
                        if(H.attr){
                            var target= ELExprs.filter(function(a){return a.canhaveattr})[0]||ELExprs[0]
                            $.each(H.attr,function(v,k){
                                target.setAttr(k,v)
                            });
                            target.inspect(memo.scope)
                            delete H.attr;
                        }
                        $d.data(elid, "_modelbindings_", ELExprs);
                    }
                }
            )
            //scopedel.traverse({enter:replacePartials,memo:memo});

            //scopedel.traverse({enter:inspectBlocks,memo:memo});

            /*while(removeBlockNodes.length){
                var rem=removeBlockNodes.shift();
                if(rem && rem.parentNode){rem.parentNode.removeChild(rem)}
            }
            scopedel.traverse({enter:inspect,memo:memo});
            var klass="expr__ph__pending__"+memo.scopeid
            scopedel.qq("."+klass).forEach(function(el){
                 inspect(el,1,memo);
                el.removeClass(klass).addClass("expr__ph")
            });
            if(Object.keys(holder).length) {
                 for (var i = 0, ellist = Object.keys(holder), ln = ellist.length; i < ln; i++) {
                    var el=ellist[i],ELExprs = holder[el]

                    for (var i2 = 0, ln2 = ELExprs.length; i2 < ln2; i2++) {
                        var ELExpr=ELExprs[i2]
                        if (!ELExpr ||ELExpr._processed) {
                            continue
                        }
                        ELExpr._processed = true;
                         ELExpr.scopeid=memo.scopeid
                        ELExpr.setEl(el)
                        revHolder[ELExpr.id] = ELExpr;
                        ELExpr.inspect(scope)
                    }
                    $d.data(el, "_modelbindings_", ELExprs);
                }
            }*/
        }
        function addDataBindings(scope,valueModel) {
            if(!scope){return}
            var scopedModel=scope
            if(scope && scope.model && typeof(scope) == "object"){
                scopedModel=scope.model
            } else {
                scopedModel=scope
            }
            if (bindings.indexOf(scope) == -1) {
                var vars = ctor.shared.vars
                if (scopedModel && typeof(scopedModel) == "object") {

                    var cb = function (rec) {
                        var name = rec.qname || rec.name

                        if (name && vars.indexOf(name) >= 0) {
                            if (rec.object && rec.object == valueModel.attributes) {
                            }
                            valueModel.set(name, rec.value || rec.newValue);
                        }
                    };
                    for (var i = 0, l = vars, ln = l.length, k; k = l[i], i < ln; i++) {
                        if (k && typeof(k) == "string") {
                            if (scopedModel.onPathChange) {
                                scopedModel.onPathChange(k, cb)
                            } else if (scopedModel.properties && scopedModel.properties.onPathChange) {
                                scopedModel.properties.onPathChange(k, cb)
                            }
                        }
                    }
                     bindings.push(scope)
                }
            }
            valueModel.update(scopedModel)
            return valueModel;
        }
        function _procInitListeners(scope) {
            var shared=ctor.shared


            var valueModel = new $.simpleModel(el.id,  shared.vars);

            shared.valueModel = valueModel
            var mp =  shared.dependmap
            valueModel.on(
                function (rec) {
                    if (mp[rec.name]) {
                        for (var i = 0, l = mp[rec.name], ln = l.length; i < ln; i++) {
                            if (revHolder[l[i]]) {
                                var res, M = revHolder[l[i]]
                                if (M.isId) {
                                    res = this.get(M.expr)
                                }
                                else {
                                    res = M.calc(this)
                                }
                                M.applyToDom(res)
                            }
                        }
                    }
                }
            )

            valueModel.update = function (model, reset) {
                if (!(model && typeof(model) == "object")) {
                    return
                }
                 shared.model=model
                for (var i = 0, l = this.keys(), ln = l.length, k; k = l[i], i < ln; i++) {
                    var val = $.resolveProperty(model, k)
                    if (val != null || reset) {
                          this.set(k, val)
                     }
                }
            }


            addDataBindings(scope,valueModel)
            return valueModel
        }

        _proc(el,DATA )
        var _valueModel=_procInitListeners(scope);
        var ret={
            scopeid:scopeid,
            elem:elem,
            valueModel:_valueModel,
            exprModel:ctor,
            holder:holder,
            revHolder:revHolder,
            reset:function(model) {
                if(this.scopeid){
                    SCOPECACHE[this.scopeid]=model
                }
                _valueModel.update(model||scope,true)
                _valueModel.trigger();
            },
            scan:function(elem){
                _proc(elem)
            },
            digest:function(model) {
                if (model && model!=scope) {
                    addDataBindings(model,_valueModel)
                }
                this.reset(model)

            }
        };
        return ret
    }
})();