
    var rootUrl=null,rootPath=null,REMRATIO=10;
    var vendors =["webkit","moz","ms","o"]
    var rootUri=null;
    var varMap={}
    var calcMap={}
    var webcolors=  {  pink : { hex: "ffc0cb" , rgb: [   255,192,203 ] },lightpink : { hex: "ffb6c1" , rgb: [   255,182,193 ] },hotpink : { hex: "ff69b4" , rgb: [   255,105,180 ] },deeppink : { hex: "ff1493" , rgb: [   255,20,147 ] },palevioletred : { hex: "db7093" , rgb: [   219,112,147 ] },mediumvioletred : { hex: "c71585" , rgb: [   199,21,133 ] },lightsalmon : { hex: "ffa07a" , rgb: [   255,160,122 ] },salmon : { hex: "fa8072" , rgb: [   250,128,114 ] },darksalmon : { hex: "e9967a" , rgb: [   233,150,122 ] },lightcoral : { hex: "f08080" , rgb: [   240,128,128 ] },indianred : { hex: "cd5c5c" , rgb: [   205,92,92 ] },crimson : { hex: "dc143c" , rgb: [   220,20,60 ] },firebrick : { hex: "b22222" , rgb: [   178,34,34 ] },darkred : { hex: "8b0000" , rgb: [   139,0,0 ] },red : { hex: "ff0000" , rgb: [   255,0,0 ] },orangered : { hex: "ff4500" , rgb: [   255,69,0 ] },tomato : { hex: "ff6347" , rgb: [   255,99,71 ] },coral : { hex: "ff7f50" , rgb: [   255,127,80 ] },darkorange : { hex: "ff8c00" , rgb: [   255,140,0 ] },orange : { hex: "ffa500" , rgb: [   255,165,0 ] },yellow : { hex: "ffff00" , rgb: [   255,255,0 ] },lightyellow : { hex: "ffffe0" , rgb: [   255,255,224 ] },lemonchiffon : { hex: "fffacd" , rgb: [   255,250,205 ] },lightgoldenrodyellow : { hex: "fafad2" , rgb: [   250,250,210 ] },papayawhip : { hex: "ffefd5" , rgb: [   255,239,213 ] },moccasin : { hex: "ffe4b5" , rgb: [   255,228,181 ] },peachpuff : { hex: "ffdab9" , rgb: [   255,218,185 ] },palegoldenrod : { hex: "eee8aa" , rgb: [   238,232,170 ] },khaki : { hex: "f0e68c" , rgb: [   240,230,140 ] },darkkhaki : { hex: "bdb76b" , rgb: [   189,183,107 ] },gold : { hex: "ffd700" , rgb: [   255,215,0 ] },cornsilk : { hex: "fff8dc" , rgb: [   255,248,220 ] },blanchedalmond : { hex: "ffebcd" , rgb: [   255,235,205 ] },bisque : { hex: "ffe4c4" , rgb: [   255,228,196 ] },navajowhite : { hex: "ffdead" , rgb: [   255,222,173 ] },wheat : { hex: "f5deb3" , rgb: [   245,222,179 ] },burlywood : { hex: "deb887" , rgb: [   222,184,135 ] },tan : { hex: "d2b48c" , rgb: [   210,180,140 ] },rosybrown : { hex: "bc8f8f" , rgb: [   188,143,143 ] },sandybrown : { hex: "f4a460" , rgb: [   244,164,96 ] },goldenrod : { hex: "daa520" , rgb: [   218,165,32 ] },darkgoldenrod : { hex: "b8860b" , rgb: [   184,134,11 ] },peru : { hex: "cd853f" , rgb: [   205,133,63 ] },chocolate : { hex: "d2691e" , rgb: [   210,105,30 ] },saddlebrown : { hex: "8b4513" , rgb: [   139,69,19 ] },sienna : { hex: "a0522d" , rgb: [   160,82,45 ] },brown : { hex: "a52a2a" , rgb: [   165,42,42 ] },maroon : { hex: "800000" , rgb: [   128,0,0 ] },darkolivegreen : { hex: "556b2f" , rgb: [   85,107,47 ] },olive : { hex: "808000" , rgb: [   128,128,0 ] },olivedrab : { hex: "6b8e23" , rgb: [   107,142,35 ] },yellowgreen : { hex: "9acd32" , rgb: [   154,205,50 ] },limegreen : { hex: "32cd32" , rgb: [   50,205,50 ] },lime : { hex: "00ff00" , rgb: [   0,255,0 ] },lawngreen : { hex: "7cfc00" , rgb: [   124,252,0 ] },chartreuse : { hex: "7fff00" , rgb: [   127,255,0 ] },greenyellow : { hex: "adff2f" , rgb: [   173,255,47 ] },springgreen : { hex: "00ff7f" , rgb: [   0,255,127 ] },mediumspringgreen : { hex: "00fa9a" , rgb: [   0,250,154 ] },lightgreen : { hex: "90ee90" , rgb: [   144,238,144 ] },palegreen : { hex: "98fb98" , rgb: [   152,251,152 ] },darkseagreen : { hex: "8fbc8f" , rgb: [   143,188,143 ] },mediumseagreen : { hex: "3cb371" , rgb: [   60,179,113 ] },seagreen : { hex: "2e8b57" , rgb: [   46,139,87 ] },forestgreen : { hex: "228b22" , rgb: [   34,139,34 ] },green : { hex: "008000" , rgb: [   0,128,0 ] },darkgreen : { hex: "006400" , rgb: [   0,100,0 ] },mediumaquamarine : { hex: "66cdaa" , rgb: [   102,205,170 ] },aqua : { hex: "00ffff" , rgb: [   0,255,255 ] },cyan : { hex: "00ffff" , rgb: [   0,255,255 ] },lightcyan : { hex: "e0ffff" , rgb: [   224,255,255 ] },paleturquoise : { hex: "afeeee" , rgb: [   175,238,238 ] },aquamarine : { hex: "7fffd4" , rgb: [   127,255,212 ] },turquoise : { hex: "40e0d0" , rgb: [   64,224,208 ] },mediumturquoise : { hex: "48d1cc" , rgb: [   72,209,204 ] },darkturquoise : { hex: "00ced1" , rgb: [   0,206,209 ] },lightseagreen : { hex: "20b2aa" , rgb: [   32,178,170 ] },cadetblue : { hex: "5f9ea0" , rgb: [   95,158,160 ] },darkcyan : { hex: "008b8b" , rgb: [   0,139,139 ] },teal : { hex: "008080" , rgb: [   0,128,128 ] },lightsteelblue : { hex: "b0c4de" , rgb: [   176,196,222 ] },powderblue : { hex: "b0e0e6" , rgb: [   176,224,230 ] },lightblue : { hex: "add8e6" , rgb: [   173,216,230 ] },skyblue : { hex: "87ceeb" , rgb: [   135,206,235 ] },lightskyblue : { hex: "87cefa" , rgb: [   135,206,250 ] },deepskyblue : { hex: "00bfff" , rgb: [   0,191,255 ] },dodgerblue : { hex: "1e90ff" , rgb: [   30,144,255 ] },cornflowerblue : { hex: "6495ed" , rgb: [   100,149,237 ] },steelblue : { hex: "4682b4" , rgb: [   70,130,180 ] },royalblue : { hex: "4169e1" , rgb: [   65,105,225 ] },blue : { hex: "0000ff" , rgb: [   0,0,255 ] },mediumblue : { hex: "0000cd" , rgb: [   0,0,205 ] },darkblue : { hex: "00008b" , rgb: [   0,0,139 ] },navy : { hex: "000080" , rgb: [   0,0,128 ] },midnightblue : { hex: "191970" , rgb: [   25,25,112 ] },lavender : { hex: "e6e6fa" , rgb: [   230,230,250 ] },thistle : { hex: "d8bfd8" , rgb: [   216,191,216 ] },plum : { hex: "dda0dd" , rgb: [   221,160,221 ] },violet : { hex: "ee82ee" , rgb: [   238,130,238 ] },orchid : { hex: "da70d6" , rgb: [   218,112,214 ] },fuchsia : { hex: "ff00ff" , rgb: [   255,0,255 ] },magenta : { hex: "ff00ff" , rgb: [   255,0,255 ] },mediumorchid : { hex: "ba55d3" , rgb: [   186,85,211 ] },mediumpurple : { hex: "9370db" , rgb: [   147,112,219 ] },blueviolet : { hex: "8a2be2" , rgb: [   138,43,226 ] },darkviolet : { hex: "9400d3" , rgb: [   148,0,211 ] },darkorchid : { hex: "9932cc" , rgb: [   153,50,204 ] },darkmagenta : { hex: "8b008b" , rgb: [   139,0,139 ] },purple : { hex: "800080" , rgb: [   128,0,128 ] },indigo : { hex: "4b0082" , rgb: [   75,0,130 ] },darkslateblue : { hex: "483d8b" , rgb: [   72,61,139 ] },slateblue : { hex: "6a5acd" , rgb: [   106,90,205 ] },mediumslateblue : { hex: "7b68ee" , rgb: [   123,104,238 ] },white : { hex: "ffffff" , rgb: [   255,255,255 ] },snow : { hex: "fffafa" , rgb: [   255,250,250 ] },honeydew : { hex: "f0fff0" , rgb: [   240,255,240 ] },mintcream : { hex: "f5fffa" , rgb: [   245,255,250 ] },azure : { hex: "f0ffff" , rgb: [   240,255,255 ] },aliceblue : { hex: "f0f8ff" , rgb: [   240,248,255 ] },ghostwhite : { hex: "f8f8ff" , rgb: [   248,248,255 ] },whitesmoke : { hex: "f5f5f5" , rgb: [   245,245,245 ] },seashell : { hex: "fff5ee" , rgb: [   255,245,238 ] },beige : { hex: "f5f5dc" , rgb: [   245,245,220 ] },oldlace : { hex: "fdf5e6" , rgb: [   253,245,230 ] },floralwhite : { hex: "fffaf0" , rgb: [   255,250,240 ] },ivory : { hex: "fffff0" , rgb: [   255,255,240 ] },antiquewhite : { hex: "faebd7" , rgb: [   250,235,215 ] },linen : { hex: "faf0e6" , rgb: [   250,240,230 ] },lavenderblush : { hex: "fff0f5" , rgb: [   255,240,245 ] },mistyrose : { hex: "ffe4e1" , rgb: [   255,228,225 ] },gainsboro : { hex: "dcdcdc" , rgb: [   220,220,220 ] },lightgrey : { hex: "d3d3d3" , rgb: [   211,211,211 ] },silver : { hex: "c0c0c0" , rgb: [   192,192,192 ] },darkgray : { hex: "a9a9a9" , rgb: [   169,169,169 ] },gray : { hex: "808080" , rgb: [   128,128,128 ] },dimgray : { hex: "696969" , rgb: [   105,105,105 ] },lightslategray : { hex: "778899" , rgb: [   119,136,153 ] },slategray : { hex: "708090" , rgb: [   112,128,144 ] },darkslategray : { hex: "2f4f4f" , rgb: [   47,79,79 ] }, black: { hex: "000000", rgb: [  0,0,0]}        }


    var needVendorPrefixNames="user-select text-shadow border-radius box-sizing box-shadow flex flex-direction flex-flow align-self flex-direction justify-content align-items align-content order  perspective transform transition filter background-clip animation animation-delay background-size font-smoothing backface-visibility",
        needVendorPrefixValues="pre-wrap flex"
    var re=null,revals=null;
    var regradient= /([\w\-]+)\s*:\s*([\w]+)\-gradient\s*\(([^,]+?),([^\)]+?)\)/mg
    var reurl= /url\s*\(\s*["']?([^\)'"]+?)['"]?\)/mg
    var recomments= /\/\*.*?\*\//mg
    var recomments2=  /([^:])\/\/([^\n\r]*)/g
    var re8629=new RegExp(String.fromCharCode(8629),"g")
    var gradientDir={"top":"bottom","right":"left","left":"right","bottom":"top"}
    var vendorph=["-webkit-","-moz-","-ms-","-o-",""],marker=".fixed__vendor__prefix{}"
    var fncache=[]
    function  converttorem(  str){
        var htmlblocks=[],cache={}
        var ret = str
            .replace(/(^|,)\s*@media\s*[^\)]+?\)/gm,function(a){
                return "__CACHED@__"+htmlblocks.push(a)+" "
            }).replace(/(^|,|\{)\s*html\s*[^}]+?\}/gm,function(a){
                return "__CACHED@__"+htmlblocks.push(a)+" "
            }).replace(/background\-position\s*:\s*[^;}]+?[;}]/gm,function(a,b){
                return "__CACHED@__"+htmlblocks.push(a)+" "
            })
            .replace(/([\d\.]+)px/g,function(a,b){
                if(cache[a]){return cache[a]}
                var n=Number(b);if(!n || n<=1){return a}
                return cache[a]=(n?((n/REMRATIO).toFixed(3)):0)+"rem"
            })
            .replace(/__CACHED@__(\d+)\s/g,function(a,b){
                return htmlblocks[Number(b)-1]
            });
        htmlblocks.length=0;htmlblocks=null;cache=null;
        return ret
    }
    function  fixCss(  tofix,   baseuri){
        if(!tofix){return tofix}

        var fixed=tofix.trim()
        if(!re){
            re = new RegExp("([;\\{])\\s*(".concat( needVendorPrefixNames.split(/\s+/).join("|")).concat(')\\s*:\\s*([^;\\}]+?)([;\\}])') ,"gm"   )
            revals=new RegExp("([;\\{])\\s*([\\w\\-_]+)\\s*:\\s*(" + needVendorPrefixValues. split(/\s+/). join("|") + ")\\s*([;\\}])" ,"gm");
        }

        //keys
        fixed= fixed.replace(re,  function(a,pre,name,style,post){
            var all
                if(name=="order"){var all="-webkit-box-ordinal-group -moz-box-ordinal-group -ms-flex-order -webkit-order order".split(/\s+/).map(function(k){return k+ name+":"+style}).join(";")}
                else {
                    all = vendorph.map(function (k) {
                        return k + name + ":" + style
                    }).join(";")
                    if(name=="flex"){all=all+" -moz-box-flex:"+style}
                }
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
        fixed= fixed.replace (/\s+\}/g,"}").replace(/\{\s+/g,"{")
        fixed= fixed.replace(/\s*;\s*/g,";")//+"\n"+marker

        fixed=fixed.replace(/__ph(\d+)__/g,function(a,b){//console.log(b,fncache[Number(b )-1])
            return fncache[Number(b )-1] }).replace (/;\s*;/mg,";")
        //if(fixed.indexOf("__ph")>=0){console.log("EE",fixed)}

        return fixed
    }


    function applyVars(  str) {
        var txt=str
        var data={}
        for(var k in varMap){
            data[k.replace(/[a-z]\-[a-z]/g,function(a){return a.replace(/\-/,"_")})]=varMap[k].val||""
        }
        if(str){
            txt=txt.replace(/\$([\w\-_]+)/g,function(a,b,c){
                var nm=String(b||"").replace(/_/g,"-").toLowerCase();
                var V=varMap[nm]||varMap[nm.toLowerCase()]
                if(!V || !V.val){return ""}
                return V.val;
            });
            txt=txt.replace(/\$\{([^\}]+)\}/g,function(a,b,c){
                var nm=String(b||"").replace(/_/g,"-").toLowerCase();
                var V=varMap[nm]||varMap[nm.toLowerCase()]
                if(!V){
                    nm=nm.replace(/[a-z]\-[a-z]/g,function(a){return a.replace(/\-/,"_")})
                    var res=""
                    try {
                        with (data) {
                            eval("res=("+nm+")")
                        }
                    } catch (e){
                        res=""
                    }
                    return res
                }
                if(!V || !V.val){return ""}
                return V.val;
            });
            txt=txt.replace(/@([\w\-_]+)/g,function(a,b,c){
                var nm=String(b||"").replace(/_/g,"-").toLowerCase();
                if(!nm||(nm.indexOf("font-")==0||nm.indexOf("import")==0||nm.indexOf("-")==0||nm.indexOf("keyframes")>=0||nm.indexOf("media")>=0||
                    nm.indexOf("page")>=0||nm.indexOf("charset")==0)){

                    return a;
                }
                var V=varMap[nm]||varMap[nm.toLowerCase()]
                if(!V || !V.val){return ""}
                return V.val;
            }).trim();
        }
        txt=txt.replace(/__ph(\d+)__/g,function(a,b){//console.log(b,fncache[Number(b )-1])
            return fncache[Number(b )-1]||"" })
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
        return tofix.replace( recomments,"").replace( recomments2,"").replace(/\r/g,"").replace(/[\n]+/g,"\n").trim()
    }
    function extractVars(  str){
        var txt=str
        if(str){ //console.log("<<<<<<<<",(str.match(/^\s*\$([\w\-_]+)\s*\=\s*([^\n\r]+)/gm)||[]) )
            //if(/^\s*[\$@]([\w\-_]+)\s*\=\s*(.*)/.test(str)){console.log(str)}
            txt=str.replace(/^\s*[\$@]([\w\-_]+)\s*[\=\:]\s*([^\n\r]+)/gm,function(a,b,c){//console.log(b,c)
                 var nm=String (b|| "").trim().replace(/_/g,"-").replace(/;$/g,"").trim().toLowerCase(), val=c.trim().replace(/;$/g,"").trim() ;
                if(!nm||!val){
                    return ""
                }
                val= val.replace(/[\t\n\r]+/g,"").replace(/\s+/g," ").trim()

                var typ="",unit,num
                var numordim=val.match(/^(\-?[\d\.]+)(\w+)?$/)
                if(numordim){
                    unit=numordim[2]
                    if(!unit){typ="number"}
                    else {typ="number"}
                    num=numordim[1]
                }
                else if(val.indexOf("#")==0 || val.toLowerCase().indexOf("rgb")==0 || webcolors[val.toLowerCase()]){typ="color"}

                else {typ="string"}
                 varMap[nm]={
                    type:typ,val:val,unit:unit,num:num
                };
                return "";
            })
            txt=txt.replace(/^\s*@(\w[\w\-_]+)\s*\{([^\}]+?)\}/mg,function(a,b,c){
                var nm=String (b|| "").trim().replace(/_/g,"-").replace(/;$/g,"").trim().toLowerCase(), val=c.trim();

                if(!nm||!val||(nm.indexOf("font-")==0||nm.indexOf("import")==0||nm.indexOf("-")==0||nm.indexOf("keyframes")>=0||nm.indexOf("media")>=0||nm.indexOf("page")>=0||nm.indexOf("charset")==0)){

                    return a
                }
                val= val.replace(/[\t\n\r]/g,"").replace(re8629,"").replace(/\s+/g," ").replace(/[\$@]([\w\-]+)/g,function(a,nm){return varMap[nm]?varMap[nm].val:a})

                varMap[nm]={val:val,type:"rule"};
                return val.indexOf(":")>0?("." +nm + "{"+val+"}") : ""
            }).trim();
        }

        return txt
    }

    function  refreshCalcs (files,onlyrem ){
        var cx= _config.rootUrl,csstarget=_config.themetarget||"theme"
        //var fs = require('fs');
        varMap={root:{ val:cx},base:{ val:cx},theme:{ val:cx+"theme"},app:{ val:cx+"app"},js:{ val:cx+"js"},lib:{ val:cx+"js/libs"},fw:{ val:cx+"js/fw1"}}
        rootUri=_config.rootUrl//ResourceURL.getRoot()
        var resourceWraps=	files.map(function(it){
            var path=""
             var r={}//rootUri.resolve(it)
                it=it.trim().replace(/^\/|\/$/g,"").trim()
                r.fullpath=_config.basePath+it
                var arr=it.split(/\//)
                r.file =arr.pop()
                r.path=arr.join("/")
                r.relativepathToroot="../"+r.path+"/"
                 r.resolve=function(path){
                     if(/^\w+:\/\//.test(path)){return path}

                    return this.relativepathToroot+path
                }
                //  console.log([ ">>>"+pth, it,r.file,r.path].join("\n"))
                var content = ""
                try{
                    content=fs.read(r.fullpath,{encoding:"utf8"});} catch(e){console.error(e)}
    //               content=fs.readFileSync(r.fullpath,{encoding:"utf8"});} catch(e){console.error(e)}
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
                    //extract calcz

                    content.replace(/^\s*([^{]+){.*?([\w\-]+)\s*:\s*calc\(([^\)]+)\)/mg,function(a,b,c,d){
                        var ar=calcMap[b.trim()]||(calcMap[b.trim()]=[]);
                        ar.push([c.trim(),d.trim()])
                    })

                    r.content=content
                    if(content!=null){r.resolvedContent=content;}
                }

            return r;
        });
        for(var k in varMap){
            if(varMap[k]&&typeof(varMap[k].val)=="string"&&/[@|$][\w]+/.test(varMap[k].val)){
                varMap[k].val= applyVars(varMap[k].val)
            }
        }
        for(var i=0,ln=resourceWraps.length,it;it=resourceWraps[i],i<ln;i++){
            it.resolvedContent=applyVars(it.resolvedContent||it.content||"")
            var path=_config.basePath+"wrk/"+it.file//rootUri.resolve("wrk/"+it.file).buildAbsPath(_config.basePath.replace(/code\//,""));
            //var content=it.resolvedContent
            var content=converttorem(it.resolvedContent).replace (/\{\s*;/g,"{").replace (/;\s*;/g,";").replace (/;\s*;/mg,";")
            fs.write(path, content, {encoding:"utf8"});
            //fs.writeFileSync(path, it.resolvedContent, {encoding:"utf8"},function (err) {
            //    console.log(err);
            //});
        }
        return resourceWraps
    }
    function getVarMap(){
        var nu=JSON.parse(JSON.stringify(varMap))
        for(var k in nu){
            if(nu.hasOwnProperty(k) && typeof(nu[k].val) =="string"){
                nu[k].val=nu[k].val.replace(/__ph(\d+)__/g,function(a,b){//console.log(b,fncache[Number(b )-1])
                    return fncache[Number(b )-1] })
            }
        }
        return nu
    }
    function  processCss (files,config ){
        var cx= config.rootUrl,csstarget=config.themetarget||"theme"
        //var fs = require('fs');
        varMap={root:{ val:cx},base:{ val:cx},theme:{ val:cx+"theme"},app:{ val:cx+"app"},js:{ val:cx+"js"},lib:{ val:cx+"js/libs"},fw:{ val:cx+"js/fw1"}}
        rootUri=_config.rootUrl//ResourceURL.getRoot()
        var resourceWraps=files.map(function(r){
            content=r.content
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
                //extract calcz

                content.replace(/^\s*([^{]+){.*?([\w\-]+)\s*:\s*calc\(([^\)]+)\)/mg,function(a,b,c,d){
                    var ar=calcMap[b.trim()]||(calcMap[b.trim()]=[]);
                    ar.push([c.trim(),d.trim()])
                })

                r.content=content
                if(content!=null){r.resolvedContent=content;}
            }

            return r;
        });
        for(var k in varMap){
            if(varMap[k]&&typeof(varMap[k].val)=="string"&&/[@|$][\w]+/.test(varMap[k].val)){
                varMap[k].val= applyVars(varMap[k].val)
            }
        }
        for(var i=0,ln=resourceWraps.length,it;it=resourceWraps[i],i<ln;i++){
            if(!it){continue}
            it.resolvedContent=applyVars(it.resolvedContent||it.content||"")

            //var content=it.resolvedContent
            it.resolvedContent=converttorem(it.resolvedContent).replace (/\{\s*;/g,"{").replace (/;\s*;/g,";").replace (/;\s*;/mg,";")

            //fs.writeFileSync(path, it.resolvedContent, {encoding:"utf8"},function (err) {
            //    console.log(err);
            //});
        }
        return resourceWraps
    }
    module.exports= {
        setup:function(config){
            _config=config||{}
            //ResourceURL.setRoot(_config.rootUrl,_config.contextPath)
        },
        getCalcMap:function(){
             return calcMap
        },
        getVarMap:getVarMap,
        processCss:processCss
    }

