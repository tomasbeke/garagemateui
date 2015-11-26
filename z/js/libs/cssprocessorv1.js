/**
 * Created by Atul on 12/18/2014.
 */

var CSSPreprocessor=(function(){
    var rootUrl=null,rootPath=null;
    var vendors =["webkit","moz","ms","o"]
    var rootUri=null;
    var varMap={}
    var needVendorPrefixNames="user-select text-shadow border-radius box-sizing box-shadow user-select perspective transform transition filter background-clip animation animation-delay background-size font-smoothing backface-visibility",
        needVendorPrefixValues="pre-wrap"
    var re=null,revals=null;
    var regradient= /([\w\-]+)\s*:\s*([\w]+)\-gradient\s*\(([^,]+?),([^\)]+?)\)/mg
    var reurl= /url\s*\(\s*["']?([^\)'"]+?)['"]?\)/mg
    var recomments= /\/\*.*?\*\//mg
    var recomments2=  /([^:])\/\/([^\n\r]*)/g
    var re8629=new RegExp(String.fromCharCode(8629),"g")
    var gradientDir={"top":"bottom","right":"left","left":"right","bottom":"top"}
    var vendorph=["-webkit-","-moz-","-ms-","-o-",""],marker=".fixed__vendor__prefix{}"
    var fncache=[]
    function  fixCss(  tofix,   baseuri){
        if(!tofix){return tofix}

        var fixed=tofix.trim()
        if(!re){
            re = new RegExp("([;\\{])\\s*(".concat( needVendorPrefixNames.split(/\s+/).join("|")).concat(')\\s*:\\s*([^;\\}]+?)([;\\}])') ,"gm"   )
            revals=new RegExp("([;\\{])\\s*([\\w\\-_]+)\\s*:\\s*(" + needVendorPrefixValues. split(/\s+/). join("|") + ")\\s*([;\\}])" ,"gm");
        }

        //keys
        fixed= fixed.replace(re,  function(a,pre,name,style,post){
                var all=vendorph.map(function(k){return k+ name+":"+style}).join(";")
                return pre + all  + post
            }
        ); //values   //filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#e5e5e5',GradientType=0 );

        //gradient
        fixed= fixed.replace(regradient,function(a, propname,gradienttype,dir,gradient ){
                var newdir = gradientDir[dir] || dir;
                var all=vendorph.map(function(k){return propname+":"+k+gradienttype+"-gradient( "+newdir+","+gradient+")"}).join(";")
                return all;

            }
        );

        //values
        fixed= fixed.replace (revals, function(a,pre,name,style,post){
            var all=vendorph.map(function(k){return name+":"+k+ style}).join(";")
            return pre + all  + post
        })
        //url .. prefix relative path of the base
        fixed= fixed.replace(reurl, function(a,b){
            if(b.indexOf("data:")==0){return a}
            return "url(\""+ baseuri.resolve(b) +"\")"
        })
        fixed= fixed.replace (/;;/g,";").replace (/\s+\}/g,"}").replace(/\{\s+/g,"{")
        fixed= fixed.replace(/\s*;\s*/g,";")+"\n"+marker

        fixed=fixed.replace(/__ph(\d+)__/g,function(a,b){//console.log(b,fncache[Number(b )-1])
            return fncache[Number(b )-1] })
        if(fixed.indexOf("__ph")>=0){console.log("EE",fixed)}
        return fixed
    }


    function applyVars(  str) {
        var txt=str
        if(str){
            txt=str.replace(/@(\w[\w\-_]+)/g,function(a,b,c){
                var nm=String(b||"").replace(/_/g,"-").toLowerCase();
                if(!nm||(nm.indexOf("font-")==0||nm.indexOf("import")==0||nm.indexOf("-")==0||nm.indexOf("keyframes")>=0||nm.indexOf("media")>=0||
                    nm.indexOf("page")>=0||nm.indexOf("charset")==0)){

                    return a;
                }
                return (nm in varMap)?varMap[nm]:a;
            }).trim();
        }
        txt=txt.replace(/__ph(\d+)__/g,function(a,b){//console.log(b,fncache[Number(b )-1])
            return fncache[Number(b )-1] })
        return txt
    }

    function removeComments(  tofix){
        var cnt= 0,i
        while((i=tofix.indexOf("/*"))>=0&&cnt<500){cnt++
            var i2=tofix.indexOf("*/",i)
            if(i2>i){var cmnt=tofix.substr( i,i2 )
                tofix=tofix.substr(0,i )+(/[\r\n]/.test(cmnt)?"\n":"")+tofix.substr(i2+2)
            }
        };
        return tofix.replace( recomments,"\2").replace( recomments2,"\1").replace(/\r/g,"").replace(/[\n]+/g,"\n").trim()
    }
    function extractVars(  str){
        var txt=str
        if(str){
            txt=str.replace(/^\s*@(\w[\w\-_]+)\s*\{([^\}]+?)\}/mg,function(a,b,c){
                var nm=String (b|| "").trim().replace(/_/g,"-").replace(/;$/g,"").trim().toLowerCase(), val=c.trim();

                if(!nm||!val||(nm.indexOf("font-")==0||nm.indexOf("import")==0||nm.indexOf("-")==0||nm.indexOf("keyframes")>=0||nm.indexOf("media")>=0||nm.indexOf("page")>=0||nm.indexOf("charset")==0)){

                    return a
                }
                val= val.replace(/(?:x)[\t\n\r]/g,"").replace(re8629,"").replace(/\s+/g," " )
                varMap[nm]=val;
                return val.indexOf(":")>0?("." +nm + "{"+varMap[nm]+"}") : ""
            }).trim();
        }

        return txt
    }

    function  refreshCalcs (files ){
        var cx= _config.rootUrl,csstarget=_config.themetarget||"theme"
        var fs = require('fs');
        varMap={root:cx,base:cx,theme:cx+"theme",app:cx+"app",js:cx+"js",lib:cx+"js/libs",fw:cx+"js/fw1"}
        rootUri=_config.rootUrl//ResourceURL.getRoot()
        //if(!rootUri){
        //    rootUri=ResourceURL.setRoot(_config.rootUrl,_config.contextPath)
        //}
        var resourceWraps=	files.map(function(it){
            var path=it.in
            var r={}//rootUri.resolve(it)


            if(r){

                //var pth=r.buildAbsPath(_config.basePath);
                //r.buildAbsPath(_config.basePath)
                it=it.trim().replace(/^\/|\/$/g,"").trim()
                r.fullpath=_config.basePath+it
                var arr=it.split(/\//)
                r.file =arr.pop()
                r.path=arr.join("/")
                r.relativepathToroot="../"+r.path+"/"
                console.log(r)
                r.resolve=function(path){ if(/^\w+:\/\//.test(path)){return path}
                    return this.relativepathToroot+path
                }
                //  console.log([ ">>>"+pth, it,r.file,r.path].join("\n"))
                var content = ""
                try{content=fs.readFileSync(r.fullpath,{encoding:"utf8"});} catch(e){console.error(e)}
                //console.log(content)
                if(content){
                    content=removeComments(  content)
                    content=content.replace(/rgba\s*\([^\)]+\)/g,function(a){var idx=fncache.indexOf(a)+1
                        if(!idx){idx=fncache.push(a)}
                        return "__ph"+idx+"__" })
                    content=content.replace(/(\:\s*)(url\s*\(\s*['"]?data:\s*[^\)]+\))/g,function(a,b,c){
                        //console.log("daraurl\n",c, c.indexOf("/"))
                        var idx=fncache.indexOf(c)+1
                        if(!idx){idx=fncache.push(c)}
                        return b+ "__ph"+idx+"__" })

                    content=extractVars(content)
                    content=fixCss(content,r)
                    r.content=content
                    if(content!=null){r.resolvedContent=content;}
                }
            }
            return r;
        });
        for(var k in varMap){
            if(varMap[k]&&typeof(varMap[k])=="string"&&/@[\w]+/.test(varMap[k])){
                varMap[k]= applyVars(varMap[k])
            }
        }
        for(var i=0,ln=resourceWraps.length,it;it=resourceWraps[i],i<ln;i++){
            it.resolvedContent=applyVars(it.resolvedContent||it.content||"")
            var path=_config.basePath+"wrk/"+it.file//rootUri.resolve("wrk/"+it.file).buildAbsPath(_config.basePath.replace(/code\//,""));
            //console.log(it.resolvedContent,it.content)


            fs.writeFileSync(path, it.resolvedContent, {encoding:"utf8"},function (err) {
                console.log(err);
            });
        }
        return resourceWraps
    }
    return {
        setup:function(config){
            _config=config||{}
            //ResourceURL.setRoot(_config.rootUrl,_config.contextPath)
        },
        getVarMap:function(){
            var nu={}
            for(var k in varMap){
                if(varMap.hasOwnProperty(k) && typeof(varMap[k]) =="string"){
                    nu[k]=varMap[k].replace(/__ph(\d+)__/g,function(a,b){//console.log(b,fncache[Number(b )-1])
                        return fncache[Number(b )-1] })
                }
            }
            return nu
        },
        processCss:refreshCalcs
    }

})();