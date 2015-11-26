var FILE=(function FILE(self){
    function _makePromise(callback){
        var pr
        // return typeof(Operation)!="undefined"?Operation.newInstance(ctx):
        if(typeof(Promise)!="undefined" ){
            if(Promise.deferred){pr= Promise.deferred()}
            else  if(Promise.defer){pr= Promise.defer();
                    pr.then=pr.promise.then.bind(pr.promise)

                 }
             }
        if(!pr) {
            pr=(function(){ var _c=[],_err=[],_s= 0,_r=null,
            d=function(){ if(!_s){return};
                var cc=(_s==1?_c:_err)||[];_c.length=0;_err.length=0;
                cc.forEach(function(f){typeof(f)=="function" && f(_r)})
            },
            close=function(st){ var nust=st;return function(r){ if(!_s){_s=nust;_r=r;d();}}}
            return {then:function(f,f1){_c.push(f);_err.push(f1);d()} ,resolve:close(1),reject:close(2), fulfill:close(1)}
        })()
        }
        if(typeof(callback)=="function"){ pr .then(callback)}
        return pr
         }
    function toDataURL(contentType, dataStr) {
        if(typeof(dataStr)!="string"){return}
            //var blob=makeBlob();
            //var b=window.URL.createObjectURL(blob);
            //return b
        //}
        if(dataStr.indexOf("data:")==0){return dataStr}
        return 'data:' + contentType + ';base64,' + self.btoa(dataStr);
    }
    // ar dataURL = canvas.toDataURL('image/jpeg', 0.5);
    // var blob = dataURItoBlob(dataURL);
    // var fd = new FormData(document.forms[0]);
    // fd.append("canvasImage", blob);
    function toObjectURL(contentType, dataStr) {

        var ui8a = new Uint8Array(dataStr.length);
        for (var i = 0; i < ui8a.length; ++i) {
            ui8a[i] = dataStr.charCodeAt(i);
        }
        var bb =new Blob([ui8a.buffer], { type: contentType});

        return self.URL.createObjectURL(bb );
    }

    function urltoBlob(url,callback){
        var xhr = _gettransport(),pr=_makePromise(callback);
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                var myBlob = this.response;
                pr.resolve(this.response)
            }
        };
        xhr.send();
        return pr
    }
    //canvas.toBlob()
    ;(function(e){"use strict";var t=e.Uint8Array,n=e.HTMLCanvasElement,r=/\s*;\s*base64\s*(?:;|$)/i,i,s=function(e){var n=e.length,r=new t(n/4*3|0),s=0,o=0,u=[0,0],a=0,f=0,l,c,h;while(n--){c=e.charCodeAt(s++);l=i[c-43];if(l!==255&&l!==h){u[1]=u[0];u[0]=c;f=f<<6|l;a++;if(a===4){r[o++]=f>>>16;if(u[1]!==61){r[o++]=f>>>8}if(u[0]!==61){r[o++]=f}a=0}}}return r};if(t){i=new t([62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,0,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51])}if(n&&!n.prototype.toBlob){n.prototype.toBlob=function(e,n){if(!n){n="image/png"}if(this.mozGetAsFile){e(this.mozGetAsFile("canvas",n));return}var i=Array.prototype.slice.call(arguments,1),o=this.toDataURL.apply(this,i),u=o.indexOf(","),a=o.substring(u+1),f=r.test(o.substring(0,u)),l;if(Blob.fake){l=new Blob;if(f){l.encoding="base64"}else{l.encoding="URI"}l.data=a;l.size=a.length}else if(t){if(f){l=new Blob([s(a)],{type:n})}else{l=new Blob([decodeURIComponent(a)],{type:n})}}e(l)}}})(self);
    function getBase64Image(img) {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");

        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
    function getBase64FromImageUrl(URL) {
        var img = new Image();
        img.src = URL;
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width =this.width;
            canvas.height =this.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            //dataURL
            //   dataURL.replace(/^data:image\/(png|jpg);base64,/, "") ;

        }
    }
    function dataURItoBlob(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: 'image/jpeg' });
    }

    function fromclipbloard(event,callback){if(!event){return}
        var pr=_makePromise(callback)
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        if (items) {
            var blob;
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") === 0) {
                    blob = items[i].getAsFile();
                }
            }
            // load image if there is a pasted image
            if (blob !== null) {
                var reader = new FileReader();
                reader.onload = function(event) {
                    //      document.getElementById("pastedImage").src = event.target.result;
                    pr.resolve(event.target.result)
                      // data url!
                };
                reader.readAsDataURL(blob);
            }

    }
        return pr

        }
    function arrayBufferToBlob(arrayBuffer  ,type) {
        var blob
        if(type){
            blob = new Blob([arrayBuffer],{type:type});
        } else{
        blob = new Blob([arrayBuffer]);
        }
        var cache = {
            input: {
                data:   data,
                chars:  uint16Array,
                buffer: arrayBuffer,
                blob:   blob
            }
        };

        return cache.input;
    };
    function string2blob(d ,type) {
        var  uint16Array, arrayBuffer, blob,data=d;
        if(typeof(data)!=="string"){return null}
        if(data.indexOf("data:")==0){
             data = atob(data.split(',')[1]);
         }
         arrayBuffer = new ArrayBuffer(data.length * 2);
        uint16Array = new Uint16Array(arrayBuffer);
        for (var i=0, dataLen=data.length; i<dataLen; i++) {
            uint16Array[i] = data.charCodeAt(i);
        }
        return arrayBufferToBlob(arrayBuffer,type)

    };
    function _gettransport(){ return new XMLHttpRequest()}
    function blob2string(cache,cb) {
        var blob, fileReader, uint16Array, arrayBuffer;
        blob = cache.input.blob;
        cache = cache.output = { blob: blob };
        fileReader = new FileReader();
        fileReader.onload = function(progressEvent) {
            cache.buffer = this.result;
            cache.chars  = new Uint16Array(cache.buffer);
            cache.data   = String.fromCharCode.apply(null, cache.chars);
            cb(cache.data,cache);
        };
        fileReader.readAsArrayBuffer(blob);

        return true;
    };
    function arrayToBinaryString(bytes) {
        if (typeof bytes != typeof []) {
            return null;
        }
        var i = bytes.length;
        var bstr = new Array(i);
        while (i--) {
            bstr[i] = String.fromCharCode(bytes[i]);
        }
        return bstr.join('');
    }
    function fileUpload( file,optns,callback) {
        var reader = new FileReader(),pr=_makePromise(callback);
        if(typeof(optns)=="function"){optns={update:optns}}
        optns=optns||{}

             var cnv=document.body.appendChild(document.createElement("canvas") )
            var ctx=cnv.getContext("2d")

        var xhr = _gettransport();
        if(typeof(optns.update)!="function"){optns.update=function(){}}
         this.xhr.upload.addEventListener("progress", function(e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                optns.update(percentage);
            }
        }, false);

        xhr.upload.addEventListener("load", function(e){
            optns.update(100);
            if(cnv&&cnv.parentNode){cnv.parentNode.removeChild(cnv);cnv=null}
            pr.resolve()
        }, false);
        xhr.open("POST", "http://demos.hacks.mozilla.org/paul/demos/resources/webservices/devnull.php");
        xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        reader.onload = function(evt) {
            xhr.sendAsBinary(evt.target.result);
        };
        reader.readAsBinaryString(file);
        return pr
    }
    function makeBlob(content,type){
    type=type||"text"
    if(type=="js"||type=="script"){type="javascript"}
    if(type.indexOf("/")==-1){type="text/"+type}
         if(!(typeof Blob==="function"||typeof Blob==="object")||typeof URL==="undefined"){
            if((typeof Blob==="function"||typeof Blob==="object")&&typeof webkitURL!=="undefined"){self.URL=webkitURL;}
            else{
                self.Blob=function(e){
                    "use strict";if(!e){return null};
                    var t=e.BlobBuilder||e.WebKitBlobBuilder||e.MozBlobBuilder||e.MSBlobBuilder;
                    if(!t){
                        t=function(e){var t=function(e){return Object.prototype.toString.call(e).match(/^\[object\s(.*)\]$/)[1]},n=function(){this.data=[]},r=function(t,n,r){this.data=t;this.size=t.length;this.type=n;this.encoding=r},i=n.prototype,s=r.prototype,o=e.FileReaderSync,u=function(e){this.code=this[this.name=e]},a=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "+"NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),f=a.length,l=e.URL||e.webkitURL||e,c=l.createObjectURL,h=l.revokeObjectURL,p=l,d=e.btoa,v=e.atob,m=e.ArrayBuffer,g=e.Uint8Array;r.fake=s.fake=true;while(f--){u.prototype[a[f]]=f+1}if(!l.createObjectURL){p=e.URL={}}p.createObjectURL=function(e){var t=e.type,n;if(t===null){t="application/octet-stream"}if(e instanceof r){n="data:"+t;if(e.encoding==="base64"){return n+";base64,"+e.data}else if(e.encoding==="URI"){return n+","+decodeURIComponent(e.data)}if(d){return n+";base64,"+d(e.data)}else{return n+","+encodeURIComponent(e.data)}}else if(c){return c.call(l,e)}};p.revokeObjectURL=function(e){if(e.substring(0,5)!=="data:"&&h){h.call(l,e)}};i.append=function(e){var n=this.data;if(g&&(e instanceof m||e instanceof g)){var i="",s=new g(e),a=0,f=s.length;for(;a<f;a++){i+=String.fromCharCode(s[a])}n.push(i)}else if(t(e)==="Blob"||t(e)==="File"){if(o){var l=new o;n.push(l.readAsBinaryString(e))}else{throw new u("NOT_READABLE_ERR")}}else if(e instanceof r){if(e.encoding==="base64"&&v){n.push(v(e.data))}else if(e.encoding==="URI"){n.push(decodeURIComponent(e.data))}else if(e.encoding==="raw"){n.push(e.data)}}else{if(typeof e!=="string"){e+=""}n.push(unescape(encodeURIComponent(e)))}};i.getBlob=function(e){if(!arguments.length){e=null}return new r(this.data.join(""),e,"raw")};i.toString=function(){return"[object BlobBuilder]"};s.slice=function(e,t,n){var i=arguments.length;if(i<3){n=null}return new r(this.data.slice(e,i>1?t:this.data.length),n,this.encoding)};s.toString=function(){return"[object Blob]"};
                            return n}(e);
                    }
                    return function(n,r){var i=r?r.type||"":"";var s=new t;if(n){for(var o=0,u=n.length;o<u;o++){s.append(n[o])}}return s.getBlob(i)}
                }
            }
        }
    var blob;
        if(!content){return null}
        if(content instanceof Blob){return content}

        if(content instanceof ArrayBuffer){blob=arrayBufferToBlob(content,type).blob}
        else if(typeof(content)=="string"){blob=string2blob(content,type).blob}
    else if(typeof(content.getAsFile)=="function"){blob=content.getAsFile()}
    else if(content instanceof File){blob=content}
    else if(content instanceof FileList){blob=content[0]}
        if(!blob&&typeof(content)=="object"){
            blob = new Blob(content.length&&content.length>0?(Array.isArray(content)?content:[].slice.call(content)):[content], type?{type: type}:undefined)
        }
        //var b=window.URL.createObjectURL(blob);
        return blob;
    }
    function arrayEqual(a, b) { return !(a<b || b<a); };
                  // NOte, e.target.result returns a  base64 string of the file contents.  hfile is the file object passed into
// the img onload callback, look at the   for what it contains.
var Resource=function(content,resptype){
    var res,scripts=[],type=resptype;

    if(content && typeof(content)=="string"){
        if(/^lzw\|/.test(content)){

        }
        if(/^base64\|/.test(content)){

        }
        this.text=content=content.replace(/^\s*['"]([\[\{<])/,"$1").replace(/([\]\}>])['"]\s*$/,"$1").trim()
        if(/^[\{\[]/.test(content) && /[\}\]]$/.test(content)){
            res=JSON.parse(content)
            type="json";
            this.json=res
        } else if(/^</.test(content) && />$/.test(content)){
            var div=document.createElement("div");
            div.innerHTML=content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,function(a){return "<script id='__placeholderscript"+ (scripts.push(a)-1)+"' class='placeholderscript'></script>"
            }).trim();
            res=document.createDocumentFragment()
            while(div.firstChild){res.appendChild(div.removeChild(div.firstChild))}
            type="html" ;
            this.fragment=res
        }

    }else if((resptype=="document" || resptype=="html"|| resptype=="xml") && content && (content.firstChild||content.documentElement)){
        if(content.documentElement){content=content.documentElement}
        res=document.createDocumentFragment()
        if(content && content.firstChild){
            while(content.firstChild){res.appendChild(content.removeChild(content.firstChild ))}
        }
        this.fragment=res
    }
    this.type=type
    this.data=res
    this.scripts=scripts

};
 var Progress = function(ip,dom,promise){
    var curr={percent:0,message:""},_listeners=[],_end=[] ,res,noop=function(){}
    function _d(){
        _listeners.forEach(function(f){f.call(this,{percent:curr.percent,message:curr.message})},this);
        if(curr.percent>=100){var err=this.failure ;
            while(_end.length){var f=_end.shift();f[err?"error":"success"].call(this,this.result,this.info)};
        }
    }
    this.reader=null
    this.result=null;this.failed=null
    this.on=function(f){typeof(f)=="function"&&_listeners.push(f) };
    this.isDone=function(){return this.failed||curr.percent>=100};
    this.reset=function(){_end=[];_listeners=[];
            curr={};this.reader=this.result=null;this.failed=false;
    };
    this.error=function(evt){
        this.result=null;this.failed=true;
    }
    this.update=function(evt,msg){
        if(evt==null){return}
        var percentLoaded=-1;
        if(typeof(evt)=="number"){percentLoaded=evt}
        // evt is an ProgressEvent.
        else if (evt.lengthComputable) {
            percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        }
        if(percentLoaded<0||curr.percent==percentLoaded){return}
        curr.percent=percentLoaded;
        // Increase the progress bar length.
        setTimeout(_d.bind(this),10)
    }
    this.then=function(f,err){if(!(typeof(f)=="function")){return}
        if(this.isDone()){
            if(this.failed){if(typeof(err)=="function"){return err.call(this,this.result)}}
            else if(typeof(f)=="function"){return f.call(this,this.result);}

        } else{ if(!_end.some(function(it){return it.success==f})){
                _end.push({success:typeof(f)=="function"?f:noop,error:typeof(err)=="function"?err:noop});
            }
        }
        return this

    }
    this.onupdate=this.update.bind(this)
    this.onerror=this.error.bind(this)
     var ctx={ip:ip,progress:dom,promise:promise}
     if(ctx.ip || ctx.dom||ctx.promise){
         if(ctx.dom){
             ctx.dom.style.cssText= "font-size:.9em;white-space:nowrap;text-overflow:ellipses;overflow:hidden;"
             ctx.dom.style.height='40px';
             ctx.dom.style.padding='5px'
             this.on(function(a){if(ctx.dom){ctx.dom.innerHTML= a.percent}})
         }
         this.then(function(){
             if(ctx.dom && this.info){
                 ctx.dom.innerHTML=this.info.name+"<br/>"+String(this.info.sz).split("").reverse().map(function(n,i,a){var ii=i+1;return (ii>=a.length || ((i+1)%3)?"":",")+n;}).reverse().join("")+" bytes";
             }
             if(ctx.ip && ctx.ip.setAttribute){ip.setAttribute("value","");     ip.value=""; }
             if(ctx.promise){ctx.promise.resolve(this )}
         })
     }
};
 var Response=function(resp){
    var rec=this  ,status=resp.status||resp.getState()
    var trim=function(s){return String(s||"").trim()};
    var hdrs=resp.getAllResponseHeaders().split(/\n/).reduce(function(m,it){
        var a=trim(it).split(":").map(trim);
        return m[a.shift()] = a.pop(),m
    },{});
    rec.type=trim(hdrs["Content-type"]).split(/;/).shift().replace(/^(text|application)\-/i,"")
    rec.error=  !(status >= 200 && status < 300)
    if(!rec.error){
        rec.response=new Resource(resp.responseXML||resp.responseText||resp.response,rec.type,resp)
    } else{
        var err=new Resource(resp.responseText||resp.response)
        if(err.fragment){
            var div=document.createElement("div");
            div.appendChild(err.fragment)
            err.text=div.textContent
        }
    }
    rec.location=resp.Location||resp.server;
    rec.etag=hdrs.ETag;
    rec.status=resp.status||resp.getState()
    rec.statusText=resp.statusText||resp.getStatusText()




}
self.$File=(function(){


    function readImage(evt,list,data) {
        var files = evt.target.files,
            img = '<img class="thumb" src="{src}" title="{filename}"/>',
            fileserial = {},
            i = 0, file, reader, span;

        while (file = files[i++]) {
            if (file.type.match('image.*')) {
                reader = new FileReader();

                reader.onload = (function (hfile) {
                    return function (e) {
                        span = document.createElement('span');
                        fileserial['filename'] = hfile.name;
                        fileserial['datauri'] = e.target.result;

                        img = img.replace('{src}', e.target.result);
                        img = img.replace('{filename}', escape(hfile.name));

                        span.innerHTML = img;
                        if(list){list.insertBefore(span, null);}
                        if(data){ data.value = e.target.result;}
                    }
                })(file);
            }

            reader.readAsDataURL(file);
        }
    }
    function formatSize(oFile) {
        var nBytes =oFile.size;
        var sOutput = nBytes + " bytes"// optional code for multiples approximation
        for (var aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"],
                 nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
            sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
        }
        return  sOutput;
    }
    function _getInfo(file){   if(!file){return}
        var data={}
        data.name=file.name || file.fileName  ||"file"
        data.sz=file.size||file.fileSize    ||0
        data.lastmodified= +new Date(file.lastModifiedDate || file.lastModifiedDate )
        data.mimetype=file.type

        var mtype=String(data.mimetype).toLowerCase()
        if(mtype.indexOf("officedocument")>0){data.type="word"}
        else if(mtype.indexOf("excel")>0){data.type="excel"}
        else if(mtype.indexOf("powerpoint")>0){data.type="powerpoint"}
        else if(mtype.indexOf("pdf")>0){data.type="pdf"}
        else if(mtype.indexOf("image")>0){data.type="image"}
        //data.file=file
        return data
    }
    var mthdmap={dataurl:"readAsDataURL",text:"readAsText",binarystring:"readAsBinaryString",arraybuffer:"readAsArrayBuffer"}

    var api={
        info:function(file){return _getInfo()},
        prompt:function(config){       config=config||{}
            if(!config.pos && !config.pos){
                config.anchor=[].slice.call(document.querySelectorAll(":focus,:hover")).pop()
                if(config.anchor==document||config.anchor===document.body){config.anchor=null}
            }
            var pr=_makePromise(),w=300,h=80,pos=config.pos||(config.anchor?DomCore.el(config.anchor).getBoundingClientRect():null);
             if(pos && pos.top){
                 pos=["top:",pos.bottom||pos.top,"px;","left:",(pos.right||pos.left)-20,"px;"].join("")
             }
            [].forEach.call(document.querySelectorAll(".__iploader__"),function(it){it.parentNode.removeChild(it)});
            var div=document.body.appendChild(document.createElement("div"));   div.className="__iploader__"
            div.innerHTML="<input type='file' /><div class='prgss'></div><div style='padding:2px;position:absolute;right:1px;top:1px;height:12px;width:12px;cursor:pointer;' onclick='this.parentNode.parentNode.removeChild(this.parentNode)'>x</div>"
            div.style.cssText="overflow:hidden;opacity:.1;transition:all 1s;font: normal normal normal .9em/1.236 calibri,Arial, sans-serif,'Lucida Grande', 'Lucida Sans Unicode', Lucida, Helvetica; color:#111 ;" +
                "position:absolute;background-color:whiteSmoke;box-shadow:2px 2px 3px #ccc;border:1px solid #666;height:"+h+"px;width:"+w+"px;"+(pos||"left:50%;top:50%;margin:-40px 0 0 -150px;");
            var ip=div.querySelector("input"),p=div.querySelector(".prgss");
            p.style.cssText=ip.style.cssText="font-size:.9em;white-space:nowrap;text-overflow:ellipses;overflow:hidden;"
            p.style.height='40px';p.style.padding='5px'
            div.style.clip="rect("+[0,1,1,0].map(function(i){return i+"px"}).join(",")+")";

            div.style.zIndex=1000;
            setTimeout(function(d){
                div.style.opacity=1
                div.style.clip="rect("+[0,w+5,h+5,0].map(function(i){return i+"px"}).join(",")+")";
                if(config.now){ ip.click()}
            },10,div);
            config.ip=ip;
            //config.progress=function(a){if(p){p.innerHTML= a.percent}}
            config.progressDom=p;
            config.promise=pr
            api.setupIp(ip,config);

            return pr
        },
        setupIp:function(ip,config){
            ip.addEventListener('change', function(){
                 api.read(this,config)
            }, false);
            if(config.target&&String(config.target.nodeName).toLowerCase()=="img"){
                config.type="image"
            }
            var accepts=config.accept
            if(accepts && config.type){
                 if(config.type=="image"){accepts="image/*"}
            }
            if(accepts){ip.setAttribute("accept",accepts)}
            //accept='image/*|audio/*|video/*'
        },
        read:function(file,optns){   optns=optns||{}
            if(!file){return}
            if(optns.progress&&optns.progress.nodeType){optns.progressDom=optns.progress}
            var mthd,reader = new FileReader(),
                progress=new Progress(file,optns.progressDom,optns.promise),
                noop=function(){};
            if(file instanceof Node){file=file.files[0]}
            if(typeof(optns)=="string"){optns={reader:optns}}
            if(typeof(optns)=="function"){optns={complete:optns}}
            optns=optns||{};
            if(typeof(optns.reader)=="string"   ){
                mthd=mthdmap[optns.reader.toLowerCase()]

            }
            if(!(mthd && typeof(reader[mthd])=="function")){  mthd="readAsText"}
            progress.reset();

            if(optns.progress){progress.on(optns.progress)}
            if(optns.complete||optns.error){progress.then(optns.complete,optns.error)}
            progress.info=_getInfo(file)
            progress.reader=reader ;
            reader.onerror = progress.onerror||noop;
            reader.onprogress = progress.onupdate;
            reader.onabort = function(e) {
                alert('File read cancelled');
            };
            reader.onloadstart = function(e) {
                progress.update(1)
            };
            reader.onload = function(evt) {
                 progress.result=evt.target.result;
                progress.update(100) ;
            }
            reader.onloadend =function(evt) {progress.update(100)}
            //var blob = file.slice(0, file.size);
            // Read in the image file as a binary string.
            if(optns.target&&optns.type=="image"){
                var img=optns.target.el||optns.target
                progress.then(function(){
                    img.src=this.result
                })
            }
            if(!file){return}
            reader[mthd](file);
            return progress
        },
        upload:function(url,ip,config){
            var formdata = new FormData(),startts=Date.now(),file=ip.files[0],data=config.data||{},
                promise=  _makePromise();
            //ip=$E(ip)
            config.url=url
            if(!file){return}
            data=_getInfo(file)
            formdata.append("file", file);
            Object.keys( data).forEach(function(k){
                formdata.append(k, data[k])
            })
            if(typeof(config.progress)!="function"){delete config.progress}
            if(typeof(config.complete)=="function"){promise.then(config.complete)}
            var xhr = _gettransport();

            var ctrl=(function(confg,ip){
                var prdom=confg.progressdom||ip.up().down(".progress-wrap"),innr,rtio,msgdom,total=0
                if(prdom){
                    if(!prdom.down(".progress-inner")){prdom.html('<div class="progress-inner"></div><div class="msg"></div>')}
                    innr=prdom.down(".progress-inner")  ;msgdom=prdom.down(".msg")
                    rtio=prdom.offset("width")/100;
                    prdom.css({backgroundColor:"#fcfcfc"})
                }
                return {
                    update:function update(evt){
                        if(evt==null){return}
                        if(evt.total){total=evt.total}
                        if(typeof(evt=="number")){var n=evt;evt={lengthComputable:true,loaded:(n/100)*total,total:total}}
                        if (msgdom && evt.lengthComputable) {
                            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                            innr && innr.css({w:percentComplete *rtio })
                            msgdom && msgdom.html(percentComplete+"%")
                        }
                    }
                }
            })(config,ip);

            function onprogressHandler(evt) {
                ctrl.update(evt);
                config.progress && config.progress(evt)
            }
            xhr.open('POST', config.url, true);
            xhr.setRequestHeader("X-File-Name", file.name);
            //    xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.upload && xhr.upload.addEventListener('progress', onprogressHandler, false);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {                //  config.complete && config.complete()
                    ctrl.update(100);
                    var res=new Response()
                    promise.resolve(res); // handle response.
                }
            };
            xhr.send(formdata);
            promise.xhr=xhr;
            return promise
        },
        download:(function( ){
            var saveAs=null;
              return function(b, name){
                     if(!saveAs) {
                         saveAs=(
                             window.navigator.msSaveBlob ? function(b, n){
                                 return window.navigator.msSaveBlob (b, n);
                             } : false
                             )||window.webkitSaveAs||window.mozSaveAs||window.msSaveAs||(function(){
                // URL's
                window.URL || (window.URL = window.webkitURL);
                             if(!window.URL) {
                                 return false;
                             }
                return function(b,name){
                                 var blob=makeBlob (b)
                    var url = URL.createObjectURL(blob);
                    // Test for download link support
                    if( "download" in document.createElement('a') ){
                        var a = document.createElement('a');
                        a.setAttribute('href', url);
                                     a.setAttribute ('download', name); // Create Click event
                        var clickEvent = document.createEvent ("MouseEvent");
                                     clickEvent.initMouseEvent ("click", true, true, window, 0, clickEvent.screenX, clickEvent.screenY, clickEvent.clientX, clickEvent.clientY, clickEvent.ctrlKey, clickEvent.altKey, clickEvent.shiftKey, clickEvent.metaKey, 0, null);
                                      a.dispatchEvent (clickEvent);  // dispatch click event to simulate download
                                 }else {  // fallover, open resource in new tab.
                        window.open(url, '_blank', '');
                    }
                };

                         }) ()

                     }
                 return saveAs(b, name)
             }

        })(),
         makeBlob:makeBlob,
        toDataURL:toDataURL,
        toObjectURL:toObjectURL,
        urltoBlob:urltoBlob,
        dataURItoBlob:dataURItoBlob,
        getBase64FromImageUrl:getBase64FromImageUrl,
        getBase64Image:getBase64Image,
        arrayToBinaryString:arrayToBinaryString,
        blob2string:blob2string ,
        fromclipbloard:fromclipbloard
    }
        return api
} )();
    return $File
}   )(self);

module.exports=FILE


